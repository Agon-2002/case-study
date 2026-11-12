"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import type { AuthErrorBody, Identity } from "@/lib/identity";
import {
  clearName,
  readIdentity,
  saveName,
  subscribeToIdentity,
} from "@/lib/identity-storage";

type IdentityContextValue = {
  /** undefined while the saved identity has not been read yet (server render) */
  identity: Identity | null | undefined;
  /** Set when the server refused to sign in the current name */
  authError: AuthErrorBody | null;
  signIn: (name: string) => void;
  signOut: () => void;
  reportAuthError: (error: AuthErrorBody) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: PropsWithChildren) {
  const identity = useSyncExternalStore(
    subscribeToIdentity,
    readIdentity,
    () => undefined
  );
  const [authError, setAuthError] = useState<AuthErrorBody | null>(null);

  const signIn = useCallback((name: string) => {
    setAuthError(null);
    saveName(name);
  }, []);

  const signOut = useCallback(() => {
    setAuthError(null);
    clearName();
  }, []);

  const value = useMemo(
    () => ({
      identity,
      authError,
      signIn,
      signOut,
      reportAuthError: setAuthError,
    }),
    [identity, authError, signIn, signOut]
  );

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity must be used inside IdentityProvider");
  }
  return context;
}
