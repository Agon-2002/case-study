"use client";

import { useErrorListener } from "@liveblocks/react/suspense";
import { toast } from "sonner";
import { describeLiveblocksError } from "@/lib/liveblocks-errors";

/** Shows a toast when Liveblocks rejects a comment action. */
export function ErrorToasts() {
  useErrorListener((error) => {
    console.error("Liveblocks error", error.context, error);
    const message = describeLiveblocksError(error);
    if (message) {
      toast.error(message);
    }
  });

  return null;
}
