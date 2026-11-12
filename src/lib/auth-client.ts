import { AUTH_ERROR, type AuthErrorBody, type Identity } from "./identity";

export type LiveblocksAuthResult =
  | { token: string }
  | { error: "forbidden"; reason: string };

/**
 * Asks our auth route for a Liveblocks token.
 *
 * - Success returns the token.
 * - Errors the user must act on (name in use, missing key, bad input) are
 *   reported and returned as "forbidden", so Liveblocks stops retrying.
 * - Temporary failures (network, presence check) throw, so Liveblocks
 *   retries with backoff.
 */
export async function requestLiveblocksToken(
  identity: Identity,
  onAuthError: (error: AuthErrorBody) => void
): Promise<LiveblocksAuthResult> {
  const response = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(identity),
  });

  if (response.ok) {
    return (await response.json()) as { token: string };
  }

  const error = await readAuthError(response);
  if (error.error === AUTH_ERROR.presenceCheckFailed) {
    throw new Error(error.message);
  }

  onAuthError(error);
  return { error: "forbidden", reason: error.message };
}

async function readAuthError(response: Response): Promise<AuthErrorBody> {
  try {
    const body = (await response.json()) as Partial<AuthErrorBody>;
    if (body.error && body.message) {
      return { error: body.error, message: body.message };
    }
  } catch {
    // Not JSON, fall through to a generic message
  }
  return {
    error: AUTH_ERROR.invalidRequest,
    message: `Sign-in failed (HTTP ${response.status}). Try again.`,
  };
}
