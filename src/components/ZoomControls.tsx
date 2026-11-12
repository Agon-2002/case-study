"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAX_SCALE, MIN_SCALE } from "@/lib/viewport";

type ZoomControlsProps = {
  scale: number | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  const disabled = scale === null;

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-background p-1 shadow-sm">
      <WithTooltip label="Zoom out">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onZoomOut}
          disabled={disabled || scale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          <MinusIcon />
        </Button>
      </WithTooltip>
      <WithTooltip label="Fit to screen">
        <Button
          variant="ghost"
          size="sm"
          className="w-14 tabular-nums"
          onClick={onReset}
          disabled={disabled}
          aria-label="Fit image to screen"
        >
          {scale === null ? "–" : `${Math.round(scale * 100)}%`}
        </Button>
      </WithTooltip>
      <WithTooltip label="Zoom in">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onZoomIn}
          disabled={disabled || scale >= MAX_SCALE}
          aria-label="Zoom in"
        >
          <PlusIcon />
        </Button>
      </WithTooltip>
    </div>
  );
}

function WithTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
