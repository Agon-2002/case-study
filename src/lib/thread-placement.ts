/**
 * Which side of its pin a thread or composer opens on.
 *
 * The brief: threads open to the right, and flip to open inwards when the
 * pin is too close to the image's right edge. "Too close" is measured on
 * screen, so it depends on the zoom: zooming in gives a pin near the edge
 * room again. Panning never changes it, because the distance from a pin to
 * the image's edge only grows or shrinks with the zoom.
 *
 * On screens too narrow for a thread beside a pin on either side (phones),
 * the thread opens below the pin instead, where the popover can slide it
 * sideways to stay fully on screen.
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
/** Margin kept between a thread and the screen edge on phones, in px */
export const SCREEN_MARGIN = 16;
/** Below this canvas width a thread can't sit beside its pin, in px */
export const NARROW_SCREEN_WIDTH =
  PIN_SIZE + THREAD_GAP + THREAD_WIDTH + SCREEN_MARGIN * 2;

export type ThreadSide = "left" | "right" | "bottom";

type ThreadSideInput = {
  /** The pin's normalised x position on the image, from 0 to 1 */
  anchorX: number;
  /** The image's width at 100% zoom, in px */
  imageWidth: number;
  scale: number;
  /** The canvas width on screen, in px */
  screenWidth: number;
};

export function getThreadSide({
  anchorX,
  imageWidth,
  scale,
  screenWidth,
}: ThreadSideInput): ThreadSide {
  if (screenWidth < NARROW_SCREEN_WIDTH) {
    return "bottom";
  }
  const spaceToRightEdge = (1 - anchorX) * imageWidth * scale;
  const needed = PIN_SIZE + THREAD_GAP + THREAD_WIDTH;
  if (spaceToRightEdge >= needed) {
    return "right";
  }
  // Not enough room before the right edge: open towards the image's centre.
  // A pin on the left half of a small image is already facing inwards.
  return anchorX > 0.5 ? "left" : "right";
}
