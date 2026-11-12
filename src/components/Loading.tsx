import { Loader2Icon } from "lucide-react";

export function Loading() {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
