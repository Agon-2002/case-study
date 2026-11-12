import { z } from "zod";

export const NAME_MAX_LENGTH = 30;

/**
 * A display name, trimmed and with inner whitespace collapsed. The cleaned
 * name is also the user's Liveblocks id.
 */
export const nameSchema = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(1, "Enter your name.")
      .max(NAME_MAX_LENGTH, `Use ${NAME_MAX_LENGTH} characters or fewer.`)
  );

export const identitySchema = z.object({
  name: nameSchema,
  browserId: z.uuid(),
});

export type Identity = z.infer<typeof identitySchema>;

/** Names are unique regardless of case, so "Joe" blocks "joe". */
export function isSameName(a: string, b: string): boolean {
  return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}

/** Error codes the auth route returns, shared with the client. */
export const AUTH_ERROR = {
  invalidRequest: "invalid_request",
  missingSecret: "missing_secret",
  nameInUse: "name_in_use",
  presenceCheckFailed: "presence_check_failed",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

export type AuthErrorBody = {
  error: AuthErrorCode;
  message: string;
};
