/**
 * Pan and zoom maths. Pure functions, no React or DOM.
 *
 * Coordinates:
 * - "screen" points are in CSS pixels relative to the canvas element's
 *   top-left corner.
 * - "image" points are normalised: (0, 0) is the image's top-left corner and
 *   (1, 1) its bottom-right, whatever the zoom or pan. Pins are stored this way.
 *
 * The image is drawn at its natural size and moved with
 * `translate(x, y) scale(scale)`, so a natural-size pixel (px, py) lands on
 * screen at (x + px * scale, y + py * scale).
 */

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Viewport = { x: number; y: number; scale: number };

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 8;
/** How much one press of a zoom button changes the scale */
export const ZOOM_STEP = 1.25;
/** Space left around the image when it is fitted to the screen, in px */
export const FIT_PADDING = 48;
/** Pointer movement in px below which a press still counts as a click */
export const DRAG_THRESHOLD = 4;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Zooms by `factor` while keeping the image point under `anchor` (a screen
 * point) in the same place on screen.
 */
export function zoomAt(
  viewport: Viewport,
  anchor: Point,
  factor: number
): Viewport {
  const scale = clampScale(viewport.scale * factor);
  const ratio = scale / viewport.scale;
  return {
    scale,
    x: anchor.x - (anchor.x - viewport.x) * ratio,
    y: anchor.y - (anchor.y - viewport.y) * ratio,
  };
}

export function panBy(viewport: Viewport, dx: number, dy: number): Viewport {
  return { ...viewport, x: viewport.x + dx, y: viewport.y + dy };
}

/** Scale and centre the image so all of it shows, at most at 100%. */
export function fitToContainer(image: Size, container: Size): Viewport {
  const availableWidth = Math.max(container.width - FIT_PADDING * 2, 1);
  const availableHeight = Math.max(container.height - FIT_PADDING * 2, 1);
  const scale = clampScale(
    Math.min(availableWidth / image.width, availableHeight / image.height, 1)
  );
  return {
    scale,
    x: (container.width - image.width * scale) / 2,
    y: (container.height - image.height * scale) / 2,
  };
}

export function imageToScreen(
  viewport: Viewport,
  image: Size,
  point: Point
): Point {
  return {
    x: viewport.x + point.x * image.width * viewport.scale,
    y: viewport.y + point.y * image.height * viewport.scale,
  };
}

export function screenToImage(
  viewport: Viewport,
  image: Size,
  point: Point
): Point {
  return {
    x: (point.x - viewport.x) / (image.width * viewport.scale),
    y: (point.y - viewport.y) / (image.height * viewport.scale),
  };
}

export function isInsideImage(point: Point): boolean {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** True for a stored pin position that can be drawn on the image. */
export function isValidImagePoint(point: Point): boolean {
  return (
    Number.isFinite(point.x) && Number.isFinite(point.y) && isInsideImage(point)
  );
}
