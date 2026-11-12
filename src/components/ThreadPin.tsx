"use client";

import type { ThreadData } from "@liveblocks/client";
import { CommentPin, FloatingThread } from "@liveblocks/react-ui";
import { useState } from "react";
import { PinAnchor } from "./canvas/PinAnchor";

/** How recently a thread must have been created to open on its own */
const JUST_CREATED_MS = 1000;

export function ThreadPin({ thread }: { thread: ThreadData }) {
  // Open a thread the current user has just created
  const [isOpen, setIsOpen] = useState(
    () => Date.now() - new Date(thread.createdAt).getTime() <= JUST_CREATED_MS
  );

  return (
    <PinAnchor point={thread.metadata}>
      <FloatingThread
        thread={thread}
        open={isOpen}
        onOpenChange={setIsOpen}
        side="right"
      >
        <CommentPin userId={thread.comments[0]?.userId} corner="top-left" />
      </FloatingThread>
    </PinAnchor>
  );
}
