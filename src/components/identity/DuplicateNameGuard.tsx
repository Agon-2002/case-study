"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { useEffect } from "react";
import { AUTH_ERROR, isSameName } from "@/lib/identity";
import { useIdentity } from "./IdentityProvider";

/**
 * Second half of the name-in-use check. The auth route refuses a name that
 * another browser has connected, but two sign-ins at the same moment can both
 * pass it. Connection ids grow with each new connection, so when two browsers
 * share a name, the one with the higher id joined later and leaves.
 */
export function DuplicateNameGuard() {
  const { reportAuthError } = useIdentity();
  const self = useSelf((me) => ({
    name: me.id,
    browserId: me.info.browserId,
    connectionId: me.connectionId,
  }));

  const joinedLater = useOthers((others) =>
    others.some(
      (other) =>
        other.id !== undefined &&
        isSameName(other.id, self.name) &&
        other.info.browserId !== self.browserId &&
        other.connectionId < self.connectionId
    )
  );

  useEffect(() => {
    if (joinedLater) {
      reportAuthError({
        error: AUTH_ERROR.nameInUse,
        message: "This name is in use right now. Pick another one.",
      });
    }
  }, [joinedLater, reportAuthError]);

  return null;
}
