"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { Suspense, useCallback, type PropsWithChildren } from "react";
import {
  IdentityProvider,
  useIdentity,
} from "@/components/identity/IdentityProvider";
import { NameScreen } from "@/components/identity/NameScreen";
import { SetupScreen } from "@/components/identity/SetupScreen";
import { Loading } from "@/components/Loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requestLiveblocksToken } from "@/lib/auth-client";
import { AUTH_ERROR } from "@/lib/identity";

/** Every app-wide provider, so the layout has one place to wrap. */
export function Providers({ children }: PropsWithChildren) {
  return (
    <TooltipProvider>
      <IdentityProvider>
        <SignedIn>{children}</SignedIn>
      </IdentityProvider>
    </TooltipProvider>
  );
}

/** Renders children only once the user has a name the server accepted. */
function SignedIn({ children }: PropsWithChildren) {
  const { identity, authError, signIn, reportAuthError } = useIdentity();

  const authEndpoint = useCallback(async () => {
    if (!identity) {
      return { error: "forbidden" as const, reason: "No name set" };
    }
    return requestLiveblocksToken(identity, reportAuthError);
  }, [identity, reportAuthError]);

  if (identity === undefined) {
    return <Loading />;
  }

  if (authError?.error === AUTH_ERROR.missingSecret) {
    return <SetupScreen />;
  }

  if (!identity || authError) {
    return (
      <NameScreen
        defaultName={identity?.name}
        serverError={authError?.message}
        onSubmit={signIn}
      />
    );
  }

  return (
    <LiveblocksProvider
      // A new name means a new Liveblocks client and connection
      key={`${identity.browserId}:${identity.name}`}
      authEndpoint={authEndpoint}
      // Bottom-right holds the zoom and comment controls
      badgeLocation="bottom-left"
      // The user id is the name, so no lookup is needed
      resolveUsers={({ userIds }) => userIds.map((name) => ({ name }))}
      resolveMentionSuggestions={async ({ text }) => {
        const response = await fetch(
          `/api/users/search?text=${encodeURIComponent(text)}`
        );
        if (!response.ok) {
          throw new Error("Problem resolving mention suggestions");
        }
        return (await response.json()) as string[];
      }}
    >
      <Suspense>{children}</Suspense>
    </LiveblocksProvider>
  );
}
