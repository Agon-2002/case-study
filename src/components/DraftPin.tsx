"use client";

import { useSelf } from "@liveblocks/react/suspense";
import { CommentPin, FloatingComposer } from "@liveblocks/react-ui";
import type { Point } from "@/lib/viewport";
import { PinAnchor } from "./canvas/PinAnchor";

type DraftPinProps = {
  /** Where the new comment goes, as a normalised image point */
  point: Point;
  /** Called when the comment is sent or the composer closes */
  onDone: () => void;
};

/** A pin with an open composer for a comment that doesn't exist yet. */
export function DraftPin({ point, onDone }: DraftPinProps) {
  const userId = useSelf((me) => me.id);

  return (
    <PinAnchor point={point}>
      <FloatingComposer
        open
        onOpenChange={(open) => {
          if (!open) {
            onDone();
          }
        }}
        metadata={{ x: point.x, y: point.y }}
        onComposerSubmit={onDone}
        side="right"
      >
        <CommentPin userId={userId} corner="top-left" />
      </FloatingComposer>
    </PinAnchor>
  );
}
