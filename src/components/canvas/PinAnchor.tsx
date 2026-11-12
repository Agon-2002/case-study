import type { PropsWithChildren } from "react";
import type { Point } from "@/lib/viewport";

/**
 * Places its children at a normalised image point inside the moving layer.
 *
 * Percentages of the image's size put the anchor on the exact image pixel at
 * any zoom, because the browser applies the same transform to the image and
 * the pin. The reverse scale keeps the pin the same size on screen. Its
 * top-left corner is the anchor, so it scales around that corner.
 */
export function PinAnchor({
  point,
  children,
}: PropsWithChildren<{ point: Point }>) {
  return (
    <div
      // Pins handle their own pointer events, so the canvas must not pan
      data-canvas-pin
      className="absolute origin-top-left"
      style={{
        left: `${point.x * 100}%`,
        top: `${point.y * 100}%`,
        transform: "scale(calc(1 / var(--viewport-scale, 1)))",
      }}
    >
      {children}
    </div>
  );
}
