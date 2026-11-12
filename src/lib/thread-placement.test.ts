import { describe, expect, it } from "vitest";
import { getThreadSide } from "./thread-placement";

const imageWidth = 1080;
const screenWidth = 1280;

describe("getThreadSide", () => {
  it("opens right when there is room before the image's right edge", () => {
    expect(
      getThreadSide({ anchorX: 0.3, imageWidth, screenWidth, scale: 1 })
    ).toBe("right");
  });

  it("flips inwards near the image's right edge", () => {
    expect(
      getThreadSide({ anchorX: 0.9, imageWidth, screenWidth, scale: 0.72 })
    ).toBe("left");
  });

  it("opens right again for the same pin once zoomed in", () => {
    // 10% of 1080px at 400% is 432px, enough for a 350px thread
    expect(
      getThreadSide({ anchorX: 0.9, imageWidth, screenWidth, scale: 4 })
    ).toBe("right");
  });

  it("flips exactly when the space runs out", () => {
    // 388px are needed: 32px pin + 6px gap + 350px thread
    const atLimit = 1 - 388 / imageWidth;
    expect(
      getThreadSide({ anchorX: atLimit, imageWidth, screenWidth, scale: 1 })
    ).toBe("right");
    expect(
      getThreadSide({
        anchorX: atLimit + 0.01,
        imageWidth,
        screenWidth,
        scale: 1,
      })
    ).toBe("left");
  });

  it("opens towards the centre when the image is too small for either side", () => {
    const small = { imageWidth, screenWidth, scale: 0.2 };
    expect(getThreadSide({ anchorX: 0.3, ...small })).toBe("right");
    expect(getThreadSide({ anchorX: 0.7, ...small })).toBe("left");
  });

  it("opens below the pin on screens too narrow for either side", () => {
    // A 375px phone has no room for a 350px thread beside any pin
    for (const anchorX of [0.1, 0.5, 0.9]) {
      expect(
        getThreadSide({ anchorX, imageWidth, scale: 1, screenWidth: 375 })
      ).toBe("bottom");
    }
  });
});
