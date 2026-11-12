"use client";

import { useCreateThread, useSelf } from "@liveblocks/react/suspense";
import { CommentPin, FloatingComposer } from "@liveblocks/react-ui";
import { cn } from "@/lib/utils";
import type { Point } from "@/lib/viewport";
import { useCanvas } from "./canvas/CanvasContext";
import { PinAnchor } from "./canvas/PinAnchor";

type DraftPinProps = {
  /** Where the new comment goes, as a normalised image point */
  point: Point;
  /** Called with the new thread's id once the comment is sent */
  onCreated: (threadId: string) => void;
  /** Called when the composer closes without sending */
  onCancel: () => void;
};

/** A pin with an open composer for a comment that doesn't exist yet. */
export function DraftPin({ point, onCreated, onCancel }: DraftPinProps) {
  const userId = useSelf((me) => me.id);
  const createThread = useCreateThread();
  const { sideFor, isOnScreen } = useCanvas();

  return (
    <PinAnchor point={point}>
      <FloatingComposer
        open
        onOpenChange={(open) => {
          if (!open) {
            onCancel();
          }
        }}
        onComposerSubmit={(comment, event) => {
          // Create the thread here instead of inside the composer, to get its
          // id right away and open it. Liveblocks adds it optimistically and
          // removes it again if the server rejects it.
          event.preventDefault();
          const thread = createThread({
            body: comment.body,
            attachments: comment.attachments,
            metadata: { x: point.x, y: point.y },
          });
          onCreated(thread.id);
        }}
        side={sideFor(point)}
        className={cn(!isOnScreen(point) && "invisible")}
      >
        <CommentPin userId={userId} corner="top-left" />
      </FloatingComposer>
    </PinAnchor>
  );
}
