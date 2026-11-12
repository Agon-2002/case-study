"use client";

import { CommentPin } from "@liveblocks/react-ui";
import { useState, type MouseEvent } from "react";
import type { Point } from "@/lib/viewport";

type PlacementOverlayProps = {
  /** Called with the click's position in viewport (client) coordinates */
  onPlace: (clientPoint: Point) => void;
  onCancel: () => void;
};

/**
 * Covers the canvas while the user picks a spot for a new comment. A pin
 * follows the cursor; right-click cancels.
 */
export function PlacementOverlay({ onPlace, onCancel }: PlacementOverlayProps) {
  const [cursor, setCursor] = useState<Point | null>(null);

  function track(event: MouseEvent) {
    setCursor({ x: event.clientX, y: event.clientY });
  }

  return (
    <div
      className="absolute inset-0 cursor-none bg-black/10"
      onMouseMove={track}
      onMouseEnter={track}
      onMouseLeave={() => setCursor(null)}
      onClick={(event) => onPlace({ x: event.clientX, y: event.clientY })}
      onContextMenu={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {cursor ? (
        <CommentPin
          corner="top-left"
          className="pointer-events-none fixed top-0 left-0"
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        />
      ) : null}
    </div>
  );
}
