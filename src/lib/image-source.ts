import { DEFAULT_IMAGE_URL } from "./config";

/**
 * The image to show. A `?image=` query parameter can replace the default,
 * which helps test the error screen with a broken URL. Only http(s) URLs and
 * paths on this site are accepted.
 */
export function resolveImageUrl(param: string | null): string {
  if (!param) {
    return DEFAULT_IMAGE_URL;
  }
  if (param.startsWith("/") && !param.startsWith("//")) {
    return param;
  }
  try {
    const url = new URL(param);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : DEFAULT_IMAGE_URL;
  } catch {
    return DEFAULT_IMAGE_URL;
  }
}

/** Adds a query parameter so a retry fetches the image again. */
export function withRetryParam(url: string, attempt: number): string {
  if (attempt === 0) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}retry=${attempt}`;
}
