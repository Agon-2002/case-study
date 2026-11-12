import { useMemo, useState } from "react";
import { FloatingThread, CommentPin } from "@liveblocks/react-ui";
import { ThreadData } from "@liveblocks/client";

export function ThreadPin({ thread }: { thread: ThreadData }) {
  // Open threads that have just been created
  const defaultOpen = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) <= 100;
  }, [thread]);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <FloatingThread
      thread={thread}
      open={isOpen}
      onOpenChange={setIsOpen}
      side="right"
    >
      <CommentPin
        userId={thread.comments[0]?.userId}
        corner="top-left"
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
        }}
      />
    </FloatingThread>
  );
}
