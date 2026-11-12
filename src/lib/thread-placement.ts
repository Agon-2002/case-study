/**
 * Which side of its pin a thread or composer opens on.
 *
 * The brief: threads open to the right, and flip to open inwards when the
 * pin is too close to the image's right edge. "Too close" is measured on
 * screen, so it depends on the zoom: zooming in gives a pin near the edge
 * room again. Panning never changes it, because the distance from a pin to
 * the image's edge only grows or shrinks with the zoom.
 *
 * Up and down are not decided here. The popover shifts itself vertically to
 * stay on screen, and long threads scroll inside a capped height.
 */

/** Liveblocks' floating thread and composer width, in px */
export const THREAD_WIDTH = 350;
/** Liveblocks' gap between the pin and the thread, in px */
export const THREAD_GAP = 6;
/** Liveblocks' comment pin size, in px */
export const PIN_SIZE = 32;

export type ThreadSide = "left" | "right";

type ThreadSideInput = {
  /** The pin's normalised x position on the image, from 0 to 1 */
  anchorX: number;
  /** The image's width at 100% zoom, in px */
  imageWidth: number;
  scale: number;
  /** The thread's width on screen, which can be smaller on phones */
  threadWidth?: number;
};

export function getThreadSide({
  anchorX,
  imageWidth,
  scale,
  threadWidth = THREAD_WIDTH,
}: ThreadSideInput): ThreadSide {
  const spaceToRightEdge = (1 - anchorX) * imageWidth * scale;
  const needed = PIN_SIZE + THREAD_GAP + threadWidth;
  if (spaceToRightEdge >= needed) {
    return "right";
  }
  // Not enough room before the right edge: open towards the image's centre.
  // A pin on the left half of a small image is already facing inwards.
  return anchorX > 0.5 ? "left" : "right";
}
