import { NextRequest } from 'next/server';
import { createNoStoreOptionsResponse, proxyFirebaseFunction } from '../../_lib/functionProxy';

export function OPTIONS() {
  return createNoStoreOptionsResponse();
}

export async function POST(request: NextRequest) {
  return proxyFirebaseFunction(request, {
    functionName: 'adminUsers',
    envPrefix: 'ADMIN_USERS',
    emptyBodyError: 'Admin users API upstream returned a non-JSON response.',
  });
}
