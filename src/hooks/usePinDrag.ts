"use client";

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useCanvas } from "@/components/canvas/CanvasContext";
import { DRAG_THRESHOLD, distance, type Point } from "@/lib/viewport";

type Drag = {
  pointerId: number;
  startClient: Point;
  /** Where on the pin it was grabbed, so the pin doesn't jump to the cursor */
  grabOffset: Point;
  moved: boolean;
};

function clampToImage(point: Point): Point {
  return {
    x: Math.min(1, Math.max(0, point.x)),
    y: Math.min(1, Math.max(0, point.y)),
  };
}

/**
 * Lets a pin be dragged to a new spot on the image. A press that moves no
 * more than the drag threshold stays a click, so the pin still opens its
 * thread. While dragging, the pin shows at the new spot; on release,
 * `onMove` saves it.
 */
export function usePinDrag(point: Point, onMove: (point: Point) => void) {
  const { clientToImage } = useCanvas();
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  function pointFor(event: ReactPointerEvent, current: Drag): Point {
    const grabbed = clientToImage({ x: event.clientX, y: event.clientY });
    return clampToImage({
      x: grabbed.x - current.grabOffset.x,
      y: grabbed.y - current.grabOffset.y,
    });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    const grabbed = clientToImage({ x: event.clientX, y: event.clientY });
    drag.current = {
      pointerId: event.pointerId,
      startClient: { x: event.clientX, y: event.clientY },
      grabOffset: { x: grabbed.x - point.x, y: grabbed.y - point.y },
      moved: false,
    };
    // Capture on the pressed element (the pin button), not the wrapper: fast
    // moves that leave the pin still arrive here, and a plain click still
    // lands on the button and opens the thread
    try {
      (event.target as Element).setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) {
      return;
    }
    if (!current.moved) {
      const client = { x: event.clientX, y: event.clientY };
      if (distance(client, current.startClient) <= DRAG_THRESHOLD) {
        return;
      }
      drag.current = { ...current, moved: true };
    }
    setDragPoint(pointFor(event, current));
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) {
      return;
    }
    drag.current = null;
    setDragPoint(null);
    if (current.moved) {
      suppressClick.current = true;
      if (event.type === "pointerup") {
        onMove(pointFor(event, current));
      }
    }
  }

  // A drag must not also toggle the thread open or closed
  function onClickCapture(event: ReactMouseEvent<HTMLElement>) {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return {
    point: dragPoint ?? point,
    isDragging: dragPoint !== null,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  };
}
