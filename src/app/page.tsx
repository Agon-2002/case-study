"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { CommentsCanvas } from "@/components/CommentsCanvas";
import { CanvasCrashScreen } from "@/components/feedback/CanvasCrashScreen";
import { ConnectionBanner } from "@/components/feedback/ConnectionBanner";
import { ErrorToasts } from "@/components/feedback/ErrorToasts";
import { DuplicateNameGuard } from "@/components/identity/DuplicateNameGuard";
import { Loading } from "@/components/Loading";
import { ROOM_ID } from "@/lib/config";

export default function Page() {
  return (
    <RoomProvider id={ROOM_ID}>
      <ErrorBoundary
        FallbackComponent={CanvasCrashScreen}
        onError={(error, info) =>
          console.error("The canvas crashed", error, info.componentStack)
        }
      >
        <ClientSideSuspense fallback={<Loading />}>
          <div className="relative h-full">
            <DuplicateNameGuard />
            <ErrorToasts />
            <CommentsCanvas />
            <ConnectionBanner />
          </div>
        </ClientSideSuspense>
      </ErrorBoundary>
    </RoomProvider>
  );
}
