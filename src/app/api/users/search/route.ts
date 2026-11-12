import { Liveblocks } from "@liveblocks/node";
import { NextResponse, type NextRequest } from "next/server";
import { ROOM_ID } from "@/lib/config";

/**
 * Mention suggestions: the names of users connected to the room right now
 * that match the typed text.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    return NextResponse.json([]);
  }

  const text = (request.nextUrl.searchParams.get("text") ?? "").toLowerCase();

  try {
    const { data } = await new Liveblocks({ secret }).getActiveUsers(ROOM_ID);
    const names = new Set(
      data
        .map((user) => user.id)
        .filter((id): id is string => id !== null)
        .filter((id) => id.toLowerCase().includes(text))
    );
    return NextResponse.json([...names]);
  } catch (error) {
    console.error("Could not load mention suggestions", error);
    return NextResponse.json([], { status: 503 });
  }
}
