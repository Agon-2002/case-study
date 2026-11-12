import type { LiveblocksError } from "@liveblocks/client";

/**
 * A message for the user when a comment action fails on the server. By the
 * time this runs, Liveblocks has already undone the optimistic change, so the
 * message must explain why the comment disappeared or reverted.
 *
 * Returns null for errors shown elsewhere: connection problems have the
 * banner, and sign-in problems the name screen.
 */
export function describeLiveblocksError(error: LiveblocksError): string | null {
  switch (error.context.type) {
    case "CREATE_THREAD_ERROR":
      return "Your comment couldn't be saved. Try again.";
    case "CREATE_COMMENT_ERROR":
      return "Your reply couldn't be saved. Try again.";
    case "EDIT_COMMENT_ERROR":
      return "Your edit couldn't be saved. Try again.";
    case "DELETE_COMMENT_ERROR":
    case "DELETE_THREAD_ERROR":
      return "That comment couldn't be deleted. Try again.";
    case "EDIT_THREAD_METADATA_ERROR":
      return "The pin couldn't be moved. Try again.";
    case "ADD_REACTION_ERROR":
    case "REMOVE_REACTION_ERROR":
      return "Your reaction couldn't be saved.";
    case "MARK_THREAD_AS_RESOLVED_ERROR":
    case "MARK_THREAD_AS_UNRESOLVED_ERROR":
      return "The thread status couldn't be changed.";
    case "ROOM_CONNECTION_ERROR":
      return null;
    default:
      return "Something went wrong. Try again.";
  }
}
