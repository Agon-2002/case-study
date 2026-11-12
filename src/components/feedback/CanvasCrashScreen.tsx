"use client";

import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";

/** Replaces the canvas when it throws, instead of a blank page. */
export function CanvasCrashScreen({ resetErrorBoundary }: FallbackProps) {
  return (
    <main className="flex h-full items-center justify-center p-4">
      <div
        role="alert"
        className="flex max-w-xs flex-col items-center gap-3 rounded-xl bg-background p-6 text-center shadow-sm"
      >
        <TriangleAlertIcon className="size-8 text-destructive" />
        <div className="grid gap-1">
          <p className="font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            The comments couldn&apos;t load. Your saved comments are safe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RotateCwIcon />
            Reload
          </Button>
        </div>
      </div>
    </main>
  );
}
