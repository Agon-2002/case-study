"use client";

import { useThreads } from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useViewport } from "@/hooks/useViewport";
import { resolveImageUrl, withRetryParam } from "@/lib/image-source";
import { cn } from "@/lib/utils";
import {
  isInsideImage,
  isValidImagePoint,
  screenToImage,
  type Point,
} from "@/lib/viewport";
import {
  CanvasImage,
  ImageStatusOverlay,
  type ImageState,
} from "./canvas/CanvasImage";
import { CanvasProvider, createCanvasHelpers } from "./canvas/CanvasContext";
import { CanvasToolbar } from "./CanvasToolbar";
import { DraftPin } from "./DraftPin";
import { UserBadge } from "./identity/UserBadge";
import { PlacementOverlay } from "./PlacementOverlay";
import { ThreadPin } from "./ThreadPin";

export function CommentsCanvas() {
  const { threads } = useThreads();
  const imageUrl = resolveImageUrl(useSearchParams().get("image"));
  const [image, setImage] = useState<ImageState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [draft, setDraft] = useState<Point | null>(null);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  // Whether a thread or composer was open when the current press started.
  // That press only closes it, it does not start a new comment.
  const pressClosesPopup = useRef(false);

  const imageSize = image.status === "loaded" ? image.size : null;
  const {
    containerRef,
    containerSize,
    clientToLocal,
    viewport,
    isPanning,
    pointerHandlers,
    zoomIn,
    zoomOut,
    resetView,
  } = useViewport({ imageSize, onTap: (point) => onTap(point) });

  const canvas =
    viewport && imageSize && containerSize
      ? createCanvasHelpers({
          viewport,
          imageSize,
          containerSize,
          clientToLocal,
        })
      : null;

  // A click on the image (not a drag) starts a comment there, unless the
  // press was spent closing an open thread or composer
  function onTap(screenPoint: Point) {
    if (!pressClosesPopup.current) {
      placeDraft(screenPoint);
    }
  }

  function placeDraft(screenPoint: Point) {
    if (!viewport || !imageSize) {
      return;
    }
    const point = screenToImage(viewport, imageSize, screenPoint);
    // Comments belong to the image, so clicks beside it do nothing
    if (!isInsideImage(point)) {
      return;
    }
    setIsPlacing(false);
    setOpenThreadId(null);
    setDraft(point);
  }

  useEffect(() => {
    if (!isPlacing) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPlacing(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlacing]);

  function retryImage() {
    setImage({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  // One transform moves the image and everything anchored to it. The scale
  // is also exposed as a CSS variable so pins can undo it and keep their size.
  const worldStyle: CSSProperties =
    viewport && imageSize
      ? ({
          width: imageSize.width,
          height: imageSize.height,
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
          isPanning ? "cursor-grabbing" : "cursor-default"
        )}
        onPointerDownCapture={() => {
          pressClosesPopup.current = openThreadId !== null || draft !== null;
        }}
        {...pointerHandlers}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={worldStyle}
        >
          <CanvasImage
            key={attempt}
            src={withRetryParam(imageUrl, attempt)}
            onLoad={(size) => setImage({ status: "loaded", size })}
            onError={() => setImage({ status: "error" })}
          />
          {canvas ? (
            <CanvasProvider value={canvas}>
              <div className="absolute inset-0">
                {threads
                  .filter((thread) => isValidImagePoint(thread.metadata))
                  .map((thread) => (
                    <ThreadPin
                      key={thread.id}
                      thread={thread}
                      isOpen={openThreadId === thread.id}
                      onOpenChange={(open) =>
                        setOpenThreadId(open ? thread.id : null)
                      }
                    />
                  ))}
                {draft ? (
                  <DraftPin
                    point={draft}
                    onCreated={(threadId) => {
                      setDraft(null);
                      setOpenThreadId(threadId);
                    }}
                    onCancel={() => setDraft(null)}
                  />
                ) : null}
              </div>
            </CanvasProvider>
          ) : null}
        </div>
      </div>

      <ImageStatusOverlay state={image} onRetry={retryImage} />

      {isPlacing && canvas ? (
        <PlacementOverlay
          onPlace={(client) => placeDraft(clientToLocal(client))}
          onCancel={() => setIsPlacing(false)}
        />
      ) : null}

      <div className="absolute top-3 left-3">
        <UserBadge />
      </div>
      <div className="absolute right-3 bottom-3">
        <CanvasToolbar
          scale={viewport?.scale ?? null}
          isPlacing={isPlacing}
          canComment={canvas !== null}
          onTogglePlacing={() => setIsPlacing((placing) => !placing)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
        />
      </div>
    </div>
  );
}
