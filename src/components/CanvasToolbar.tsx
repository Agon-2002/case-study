"use client";

import { MessageCirclePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ZoomControls } from "./ZoomControls";

type CanvasToolbarProps = {
  scale: number | null;
  isPlacing: boolean;
  canComment: boolean;
  onTogglePlacing: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function CanvasToolbar({
  scale,
  isPlacing,
  canComment,
  onTogglePlacing,
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <ZoomControls
        scale={scale}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-lg"
            variant={isPlacing ? "default" : "outline"}
            className="shadow-sm"
            onClick={onTogglePlacing}
            disabled={!canComment}
            aria-pressed={isPlacing}
            aria-label="Add a comment"
          >
            <MessageCirclePlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPlacing
            ? "Click the image to place it (Esc cancels)"
            : "Add a comment"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
