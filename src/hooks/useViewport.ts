"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  DRAG_THRESHOLD,
  ZOOM_STEP,
  distance,
  fitToContainer,
  midpoint,
  panBy,
  zoomAt,
  type Point,
  type Size,
  type Viewport,
} from "@/lib/viewport";

/** Wheel zoom speed: how much one pixel of wheel movement zooms */
const WHEEL_ZOOM_SPEED = 0.01;
/** Caps one wheel event's zoom, so a mouse notch zooms about 35% */
const MAX_WHEEL_ZOOM_DELTA = 30;
const LINE_HEIGHT_PX = 16;

type UseViewportOptions = {
  /** The image's natural size, or null while it loads */
  imageSize: Size | null;
  /** Called when a press ends without dragging, with the screen point */
  onTap?: (point: Point) => void;
};

type Gesture = { start: Point; moved: boolean };
type Pinch = { distance: number; center: Point };

/**
 * Pan and zoom state for the canvas. Until the user pans or zooms, the view
 * stays fitted to the container, including after a resize.
 */
export function useViewport({ imageSize, onTap }: UseViewportOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  // null means "fitted": the user has not moved the view yet
  const [userViewport, setUserViewport] = useState<Viewport | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const pinch = useRef<Pinch | null>(null);

  const fitted =
    imageSize && containerSize
      ? fitToContainer(imageSize, containerSize)
      : null;
  const viewport = userViewport ?? fitted;

  const update = useCallback(
    (change: (current: Viewport) => Viewport) => {
      setUserViewport((current) => {
        const base = current ?? fitted;
        return base ? change(base) : current;
      });
    },
    [fitted]
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Trackpad pinch and Ctrl/Cmd + wheel zoom at the cursor. A plain wheel or
  // two-finger scroll pans. Needs a non-passive listener to stop the page
  // from zooming, so it is attached by hand.
  const onWheel = useEffectEvent((event: WheelEvent) => {
    event.preventDefault();
    const scale =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE_HEIGHT_PX : 1;
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    if (event.ctrlKey || event.metaKey) {
      const capped = Math.max(
        -MAX_WHEEL_ZOOM_DELTA,
        Math.min(MAX_WHEEL_ZOOM_DELTA, dy)
      );
      const factor = Math.exp(-capped * WHEEL_ZOOM_SPEED);
      update((current) => zoomAt(current, toLocal(event), factor));
    } else {
      update((current) => panBy(current, -dx, -dy));
    }
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const listener = (event: WheelEvent) => onWheel(event);
    element.addEventListener("wheel", listener, { passive: false });
    return () => element.removeEventListener("wheel", listener);
  }, []);

  function toLocal(event: { clientX: number; clientY: number }): Point {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  }

  function currentPinch(): Pinch | null {
    const [a, b] = [...pointers.current.values()];
    return a && b ? { distance: distance(a, b), center: midpoint(a, b) } : null;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    // Ignore presses on pins, and on threads and composers: those render in
    // portals outside the canvas, but React still bubbles their events here
    const target = event.target as Element;
    if (
      !event.currentTarget.contains(target) ||
      target.closest("[data-canvas-pin]")
    ) {
      return;
    }
    const point = toLocal(event);
    pointers.current.set(event.pointerId, point);
    try {
      // Keep receiving moves when the pointer leaves the canvas
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone; the gesture still works without capture
    }

    if (pointers.current.size === 1) {
      gesture.current = { start: point, moved: false };
    } else {
      // A second finger starts a pinch, which is never a tap
      pinch.current = currentPinch();
      if (gesture.current) {
        gesture.current = { ...gesture.current, moved: true };
      }
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) {
      return;
    }
    const point = toLocal(event);
    pointers.current.set(event.pointerId, point);

    if (pointers.current.size >= 2 && pinch.current) {
      const next = currentPinch();
      if (!next) {
        return;
      }
      const start = pinch.current;
      update((current) =>
        panBy(
          zoomAt(current, next.center, next.distance / start.distance),
          next.center.x - start.center.x,
          next.center.y - start.center.y
        )
      );
      pinch.current = next;
      return;
    }

    const current = gesture.current;
    if (!current) {
      return;
    }
    if (!current.moved) {
      if (distance(point, current.start) <= DRAG_THRESHOLD) {
        return;
      }
      gesture.current = { ...current, moved: true };
      setIsPanning(true);
      update((viewport) =>
        panBy(viewport, point.x - current.start.x, point.y - current.start.y)
      );
      return;
    }
    update((viewport) =>
      panBy(viewport, point.x - previous.x, point.y - previous.y)
    );
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.delete(event.pointerId)) {
      return;
    }
    if (pointers.current.size >= 2) {
      pinch.current = currentPinch();
      return;
    }
    pinch.current = null;

    if (pointers.current.size === 1) {
      // One finger left after a pinch: keep panning with it, never a tap
      const [remaining] = [...pointers.current.values()];
      gesture.current = { start: remaining, moved: true };
      return;
    }

    const ended = gesture.current;
    gesture.current = null;
    setIsPanning(false);
    if (ended && !ended.moved && event.type === "pointerup") {
      onTap?.(toLocal(event));
    }
  }

  const zoomBy = useCallback(
    (factor: number) => {
      if (!containerSize) {
        return;
      }
      const center = {
        x: containerSize.width / 2,
        y: containerSize.height / 2,
      };
      update((current) => zoomAt(current, center, factor));
    },
    [containerSize, update]
  );

  return {
    containerRef,
    viewport,
    isPanning,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
    zoomIn: () => zoomBy(ZOOM_STEP),
    zoomOut: () => zoomBy(1 / ZOOM_STEP),
    resetView: () => setUserViewport(null),
  };
}
