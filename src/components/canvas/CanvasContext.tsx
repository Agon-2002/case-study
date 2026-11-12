"use client";

import { createContext, useContext } from "react";
import {
  imageToScreen,
  screenToImage,
  type Point,
  type Size,
  type Viewport,
} from "@/lib/viewport";
import { getThreadSide } from "@/lib/thread-placement";

export type CanvasGeometry = {
  viewport: Viewport;
  imageSize: Size;
  containerSize: Size;
  /** Converts a page (client) point to a point relative to the canvas */
  clientToLocal: (client: Point) => Point;
};

/** What pins need to know about the canvas: positions, sides, visibility. */
export function createCanvasHelpers(geometry: CanvasGeometry) {
  const { viewport, imageSize, containerSize, clientToLocal } = geometry;
  return {
    /** A page (client) point as a normalised image point */
    clientToImage(client: Point): Point {
      return screenToImage(viewport, imageSize, clientToLocal(client));
    },
    sideFor(point: Point) {
      return getThreadSide({
        anchorX: point.x,
        imageWidth: imageSize.width,
        scale: viewport.scale,
        screenWidth: containerSize.width,
      });
    },
    /** False while the pin is panned out of the canvas */
    isOnScreen(point: Point): boolean {
      const screen = imageToScreen(viewport, imageSize, point);
      return (
        screen.x >= 0 &&
        screen.y >= 0 &&
        screen.x <= containerSize.width &&
        screen.y <= containerSize.height
      );
    },
  };
}

export type CanvasHelpers = ReturnType<typeof createCanvasHelpers>;

const CanvasContext = createContext<CanvasHelpers | null>(null);

export const CanvasProvider = CanvasContext.Provider;

export function useCanvas(): CanvasHelpers {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used inside CanvasProvider");
  }
  return context;
}
