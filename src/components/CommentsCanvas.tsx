"use client";

import { useThreads } from "@liveblocks/react/suspense";
import { MessageCirclePlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { DraftPin } from "./DraftPin";
import { UserBadge } from "./identity/UserBadge";
import { PlacementOverlay } from "./PlacementOverlay";
import { ThreadPin } from "./ThreadPin";
import { ZoomControls } from "./ZoomControls";

export function CommentsCanvas() {
  const { threads } = useThreads();
  const imageUrl = resolveImageUrl(useSearchParams().get("image"));
  const [image, setImage] = useState<ImageState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [draft, setDraft] = useState<Point | null>(null);

  const imageSize = image.status === "loaded" ? image.size : null;
  const {
    containerRef,
    viewport,
    isPanning,
    pointerHandlers,
    zoomIn,
    zoomOut,
    resetView,
  } = useViewport({ imageSize });

  function retryImage() {
    setImage({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  function placeComment(clientPoint: Point) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !viewport || !imageSize) {
      return;
    }
    const point = screenToImage(viewport, imageSize, {
      x: clientPoint.x - rect.left,
      y: clientPoint.y - rect.top,
    });
    // Comments belong to the image, so clicks beside it do nothing
    if (!isInsideImage(point)) {
      return;
    }
    setIsPlacing(false);
    setDraft(point);
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
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
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
          {imageSize ? (
            <div className="absolute inset-0">
              {threads
                .filter((thread) => isValidImagePoint(thread.metadata))
                .map((thread) => (
                  <ThreadPin key={thread.id} thread={thread} />
                ))}
              {draft ? (
                <DraftPin point={draft} onDone={() => setDraft(null)} />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <ImageStatusOverlay state={image} onRetry={retryImage} />

      {isPlacing ? (
        <PlacementOverlay
          onPlace={placeComment}
          onCancel={() => setIsPlacing(false)}
        />
      ) : null}

      <div className="absolute top-3 left-3">
        <UserBadge />
      </div>
      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        <ZoomControls
          scale={viewport?.scale ?? null}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant={isPlacing ? "default" : "outline"}
              className="shadow-sm"
              onClick={() => setIsPlacing((placing) => !placing)}
              disabled={!imageSize}
              aria-pressed={isPlacing}
              aria-label="Add a comment"
            >
              <MessageCirclePlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a comment</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
