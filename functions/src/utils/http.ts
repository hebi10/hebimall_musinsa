import type { Response } from "express";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export function applyNoStoreHeaders(response: Response): void {
  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    response.set(key, value);
  });
}
