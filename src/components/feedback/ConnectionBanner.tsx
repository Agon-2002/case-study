"use client";

import { useLostConnectionListener, useRoom } from "@liveblocks/react/suspense";
import { Loader2Icon, RotateCwIcon, WifiOffIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ConnectionProblem = "none" | "reconnecting" | "failed";

/**
 * Tells the user when the live connection drops, so they know other people's
 * comments have stopped arriving. Liveblocks only reports a lost connection
 * after a few seconds without one, so short blips show nothing. Saving a
 * comment goes over HTTP, not this connection; if a save fails, ErrorToasts
 * says so.
 */
export function ConnectionBanner() {
  const room = useRoom();
  const [problem, setProblem] = useState<ConnectionProblem>("none");

  useLostConnectionListener((event) => {
    if (event === "lost") {
      setProblem("reconnecting");
    } else if (event === "restored") {
      setProblem("none");
      toast.success("Back online");
    } else {
      setProblem("failed");
    }
  });

  if (problem === "none") {
    return null;
  }

  return (
    <div
      role="status"
      className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-background py-2 pr-2 pl-3 text-sm shadow-md"
    >
      {problem === "reconnecting" ? (
        <>
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          <span>Reconnecting… Live updates are paused.</span>
        </>
      ) : (
        <>
          <WifiOffIcon className="size-4 text-destructive" />
          <span>Connection lost. Live updates are off.</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setProblem("reconnecting");
              room.reconnect();
            }}
          >
            <RotateCwIcon />
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
