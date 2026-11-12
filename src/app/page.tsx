"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { CommentsCanvas } from "@/components/CommentsCanvas";
import { DuplicateNameGuard } from "@/components/identity/DuplicateNameGuard";
import { Loading } from "@/components/Loading";
import { ROOM_ID } from "@/lib/config";

export default function Page() {
  return (
    <RoomProvider id={ROOM_ID}>
      <ErrorBoundary
        fallback={
          <div className="flex h-screen w-screen items-center justify-center text-sm">
            There was an error while getting threads.
          </div>
        }
      >
        <ClientSideSuspense fallback={<Loading />}>
          <DuplicateNameGuard />
          <CommentsCanvas />
        </ClientSideSuspense>
      </ErrorBoundary>
    </RoomProvider>
  );
}
