import { describe, expect, it } from "vitest";
import {
  MAX_SCALE,
  MIN_SCALE,
  fitToContainer,
  imageToScreen,
  screenToImage,
  zoomAt,
  type Viewport,
} from "./viewport";

const image = { width: 1080, height: 1350 };

describe("pins stay anchored", () => {
  // A pin at 30% across and 70% down the image
  const pin = { x: 0.3, y: 0.7 };

  it("converts image points to screen points and back at any zoom", () => {
    for (const scale of [MIN_SCALE, 0.37, 1, 2.5, MAX_SCALE]) {
      const viewport: Viewport = { x: -120, y: 45, scale };
      const screen = imageToScreen(viewport, image, pin);
      const back = screenToImage(viewport, image, screen);
      expect(back.x).toBeCloseTo(pin.x);
      expect(back.y).toBeCloseTo(pin.y);
    }
  });
});

describe("zoomAt", () => {
  it("keeps the point under the cursor in place", () => {
    const viewport: Viewport = { x: 100, y: 50, scale: 1 };
    const cursor = { x: 420, y: 310 };
    const before = screenToImage(viewport, image, cursor);

    const zoomed = zoomAt(viewport, cursor, 2);
    const after = screenToImage(zoomed, image, cursor);

    expect(zoomed.scale).toBe(2);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("stops at the minimum and maximum zoom", () => {
    const viewport: Viewport = { x: 0, y: 0, scale: 1 };
    expect(zoomAt(viewport, { x: 0, y: 0 }, 1000).scale).toBe(MAX_SCALE);
    expect(zoomAt(viewport, { x: 0, y: 0 }, 0.0001).scale).toBe(MIN_SCALE);
  });

  it("does not move the image when the zoom is already at its limit", () => {
    const viewport: Viewport = { x: 10, y: 20, scale: MAX_SCALE };
    expect(zoomAt(viewport, { x: 300, y: 300 }, 2)).toEqual(viewport);
  });
});

describe("fitToContainer", () => {
  it("centres the whole image in the container", () => {
    const container = { width: 1200, height: 800 };
    const fitted = fitToContainer(image, container);
    const topLeft = imageToScreen(fitted, image, { x: 0, y: 0 });
    const bottomRight = imageToScreen(fitted, image, { x: 1, y: 1 });

    expect(topLeft.y).toBeGreaterThanOrEqual(0);
    expect(bottomRight.y).toBeLessThanOrEqual(container.height);
    expect(topLeft.x + bottomRight.x).toBeCloseTo(container.width);
    expect(topLeft.y + bottomRight.y).toBeCloseTo(container.height);
  });

  it("does not enlarge a small image past 100%", () => {
    const fitted = fitToContainer(
      { width: 200, height: 100 },
      { width: 1200, height: 800 }
    );
    expect(fitted.scale).toBe(1);
  });
});
