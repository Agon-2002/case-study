"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIdentity } from "./IdentityProvider";

/** Shows who you are commenting as, with a way to switch names. */
export function UserBadge() {
  const { identity, signOut } = useIdentity();
  if (!identity) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-background py-1 pr-1 pl-3 text-sm shadow-sm">
      <span className="max-w-40 truncate">{identity.name}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            aria-label="Switch name"
          >
            <LogOutIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Switch name</TooltipContent>
      </Tooltip>
    </div>
  );
}
