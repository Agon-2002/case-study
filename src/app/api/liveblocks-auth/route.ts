import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { ROOM_ID } from "@/lib/config";
import {
  AUTH_ERROR,
  identitySchema,
  isSameName,
  type AuthErrorBody,
  type AuthErrorCode,
} from "@/lib/identity";

/**
 * Signs a Liveblocks token for the name the user typed. This identifies
 * users, it does not authenticate them: there is no password.
 * https://liveblocks.io/docs/api-reference/authentication
 */
export async function POST(request: Request) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    console.error("LIVEBLOCKS_SECRET_KEY is not set");
    return errorResponse(
      AUTH_ERROR.missingSecret,
      "The server is missing LIVEBLOCKS_SECRET_KEY.",
      500
    );
  }

  const parsed = identitySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return errorResponse(
      AUTH_ERROR.invalidRequest,
      parsed.error.issues[0]?.message ?? "Invalid sign-in request.",
      400
    );
  }
  const { name, browserId } = parsed.data;

  // Created per request so the build does not need the secret key
  const liveblocks = new Liveblocks({ secret });

  let activeUsers;
  try {
    ({ data: activeUsers } = await liveblocks.getActiveUsers(ROOM_ID));
  } catch (error) {
    console.error("Could not check active users", error);
    return errorResponse(
      AUTH_ERROR.presenceCheckFailed,
      "Couldn't check who is online. Try again.",
      503
    );
  }

  // The same browser may reconnect (reload, second tab); another may not
  const nameTaken = activeUsers.some(
    (user) =>
      user.id !== null &&
      isSameName(user.id, name) &&
      user.info?.browserId !== browserId
  );
  if (nameTaken) {
    return errorResponse(
      AUTH_ERROR.nameInUse,
      "This name is in use right now. Pick another one.",
      409
    );
  }

  const session = liveblocks.prepareSession(name, {
    userInfo: { name, browserId },
  });
  session.allow(ROOM_ID, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}

function errorResponse(error: AuthErrorCode, message: string, status: number) {
  const body: AuthErrorBody = { error, message };
  return NextResponse.json(body, { status });
}
