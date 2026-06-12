import { NextRequest, NextResponse } from 'next/server';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

type FunctionProxyOptions = {
  functionName: string;
  envPrefix: string;
  emptyBodyError: string;
};

export function createNoStoreOptionsResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
}

export async function proxyFirebaseFunction(
  request: NextRequest,
  options: FunctionProxyOptions,
): Promise<NextResponse> {
  const upstreamUrl = getFirebaseFunctionUrl(request, options);
  if (!upstreamUrl) {
    return NextResponse.json(
      { success: false, error: `${options.functionName} API upstream URL is not configured.` },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }

  const body = await request.text();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      ...(contentType ? { 'Content-Type': contentType } : {}),
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body,
    cache: 'no-store',
  });

  const upstreamBody = await upstreamResponse.json().catch(() => null);
  if (!upstreamBody) {
    return NextResponse.json(
      { success: false, error: options.emptyBodyError },
      { status: upstreamResponse.status || 502, headers: NO_STORE_HEADERS },
    );
  }

  return NextResponse.json(upstreamBody, {
    status: upstreamResponse.status,
    headers: NO_STORE_HEADERS,
  });
}

function getFirebaseFunctionUrl(
  request: NextRequest,
  options: FunctionProxyOptions,
): string | null {
  const configuredUrl = (
    process.env[`${options.envPrefix}_FUNCTION_URL`] ||
    process.env[`NEXT_PUBLIC_${options.envPrefix}_FUNCTION_URL`] ||
    ''
  ).trim();

  if (configuredUrl) {
    try {
      const upstreamUrl = new URL(configuredUrl);
      const requestUrl = new URL(request.url);

      if (upstreamUrl.origin === requestUrl.origin && upstreamUrl.pathname === requestUrl.pathname) {
        return null;
      }

      return upstreamUrl.toString();
    } catch {
      return null;
    }
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return null;
  }

  return `https://us-central1-${projectId}.cloudfunctions.net/${options.functionName}`;
}
