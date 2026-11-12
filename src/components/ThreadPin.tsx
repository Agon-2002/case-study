"use client";

import type { ThreadData } from "@liveblocks/client";
import { useEditThreadMetadata, useSelf } from "@liveblocks/react/suspense";
import { CommentPin, FloatingThread } from "@liveblocks/react-ui";
import { usePinDrag } from "@/hooks/usePinDrag";
import { cn } from "@/lib/utils";
import type { Point } from "@/lib/viewport";
import { useCanvas } from "./canvas/CanvasContext";
import { PinAnchor } from "./canvas/PinAnchor";

type ThreadPinProps = {
  thread: ThreadData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ThreadPin({ thread, isOpen, onOpenChange }: ThreadPinProps) {
  const authorId = thread.comments[0]?.userId;
  const isAuthor = useSelf((me) => me.id === authorId);

  return isAuthor ? (
    <MovablePin thread={thread} isOpen={isOpen} onOpenChange={onOpenChange} />
  ) : (
    <PinWithThread
      thread={thread}
      point={thread.metadata}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
}

/** The author's pin, which can be dragged to a new spot. */
function MovablePin({ thread, isOpen, onOpenChange }: ThreadPinProps) {
  const editThreadMetadata = useEditThreadMetadata();
  const { point, isDragging, dragHandlers } = usePinDrag(
    thread.metadata,
    (next) => editThreadMetadata({ threadId: thread.id, metadata: next })
  );

  return (
    <PinWithThread
      thread={thread}
      point={point}
      isOpen={isOpen && !isDragging}
      onOpenChange={onOpenChange}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      {...dragHandlers}
    />
  );
}

type PinWithThreadProps = Omit<ThreadPinProps, "isOpen"> &
  React.HTMLAttributes<HTMLDivElement> & {
    point: Point;
    isOpen: boolean;
  };

function PinWithThread({
  thread,
  point,
  isOpen,
  onOpenChange,
  ...anchorProps
}: PinWithThreadProps) {
  const { sideFor, isOnScreen } = useCanvas();

  return (
    <PinAnchor point={point} {...anchorProps}>
      <FloatingThread
        thread={thread}
        open={isOpen}
        onOpenChange={onOpenChange}
        side={sideFor(point)}
        // Keep the thread mounted but hidden while its pin is off screen
        className={cn(!isOnScreen(point) && "invisible")}
        // Attachments aren't part of the brief or the design reference
        showAttachments={false}
      >
        <CommentPin
          userId={thread.comments[0]?.userId}
          corner="top-left"
          // The user id is the author's name
          aria-label={`Comment by ${thread.comments[0]?.userId ?? "unknown"}`}
        />
      </FloatingThread>
    </PinAnchor>
  );
}
