"use client";

import { useThreads } from "@liveblocks/react/suspense";
import { useState, type CSSProperties } from "react";
import { useViewport } from "@/hooks/useViewport";
import { DEFAULT_IMAGE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Size } from "@/lib/viewport";
import { UserBadge } from "./identity/UserBadge";
import { PlaceThreadButton } from "./PlaceThreadButton";
import { ThreadPin } from "./ThreadPin";
import { ZoomControls } from "./ZoomControls";

export function CommentsCanvas() {
  const { threads } = useThreads();
  const [imageSize, setImageSize] = useState<Size | null>(null);
  const {
    containerRef,
    viewport,
    isPanning,
    pointerHandlers,
    zoomIn,
    zoomOut,
    resetView,
  } = useViewport({ imageSize });

  // One transform moves the image and everything anchored to it. The scale
  // is also exposed as a CSS variable so pins can undo it and keep their size.
  const worldStyle: CSSProperties | undefined = viewport
    ? ({
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        "--viewport-scale": viewport.scale,
      } as CSSProperties)
    : { visibility: "hidden" };

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className={cn(
          "absolute inset-0 touch-none overflow-hidden select-none",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        {...pointerHandlers}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={worldStyle}
        >
          {/* A plain img: we need its natural size and load events */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEFAULT_IMAGE_URL}
            alt="The image being commented on"
            draggable={false}
            className="block max-w-none shadow-lg"
            onLoad={(event) =>
              setImageSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
          />
        </div>
      </div>

      <div className="isolate">
        {threads.map((thread) => (
          <ThreadPin key={thread.id} thread={thread} />
        ))}
      </div>

      <div className="absolute top-3 left-3">
        <UserBadge />
      </div>
      <div className="absolute right-3 bottom-3">
        <ZoomControls
          scale={viewport?.scale ?? null}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
        />
      </div>
      <PlaceThreadButton />
    </div>
  );
}
