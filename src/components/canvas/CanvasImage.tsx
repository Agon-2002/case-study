"use client";

import { ImageOffIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Size } from "@/lib/viewport";

export type ImageState =
  | { status: "loading" }
  | { status: "loaded"; size: Size }
  | { status: "error" };

type CanvasImageProps = {
  src: string;
  onLoad: (size: Size) => void;
  onError: () => void;
};

/** The image itself, drawn at its natural size inside the moving layer. */
export function CanvasImage({ src, onLoad, onError }: CanvasImageProps) {
  return (
    // A plain img: we need its natural size and its load and error events
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="The image being commented on"
      draggable={false}
      className="block max-w-none shadow-lg"
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalWidth > 0 && naturalHeight > 0) {
          onLoad({ width: naturalWidth, height: naturalHeight });
        } else {
          onError();
        }
      }}
      onError={onError}
    />
  );
}

/** Covers the canvas while the image loads or after it fails. */
export function ImageStatusOverlay({
  state,
  onRetry,
}: {
  state: ImageState;
  onRetry: () => void;
}) {
  if (state.status === "loaded") {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {state.status === "loading" ? (
        <div role="status" aria-label="Loading image">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          role="alert"
          className="flex max-w-xs flex-col items-center gap-3 rounded-xl bg-background p-6 text-center shadow-sm"
        >
          <ImageOffIcon className="size-8 text-muted-foreground" />
          <div className="grid gap-1">
            <p className="font-medium">The image couldn&apos;t load</p>
            <p className="text-sm text-muted-foreground">
              Check your connection and try again. Comments show once the image
              is back.
            </p>
          </div>
          <Button onClick={onRetry}>
            <RotateCwIcon />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
