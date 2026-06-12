import { NextRequest } from 'next/server';
import { createNoStoreOptionsResponse, proxyFirebaseFunction } from '../_lib/functionProxy';

export function OPTIONS() {
  return createNoStoreOptionsResponse();
}

export async function POST(request: NextRequest) {
  return proxyFirebaseFunction(request, {
    functionName: 'points',
    envPrefix: 'POINTS',
    emptyBodyError: 'Points API upstream returned a non-JSON response.',
  });
}
