"use client";

import React, { createContext, useContext } from "react";
import type { GPApplication } from "./types";

export interface GPPortalContextType {
  token: string;
  email: string;
  application: GPApplication | null;
  setApplication: React.Dispatch<React.SetStateAction<GPApplication | null>>;
  signOut: () => void;
  fullName: string;
}

const GPPortalContext = createContext<GPPortalContextType | null>(null);

export function GPPortalProvider({
  value,
  children,
}: {
  value: GPPortalContextType;
  children: React.ReactNode;
}) {
  return (
    <GPPortalContext.Provider value={value}>
      {children}
    </GPPortalContext.Provider>
  );
}

export function useGPPortal() {
  const context = useContext(GPPortalContext);
  if (!context) {
    throw new Error("useGPPortal must be used within a GPPortalLayout");
  }
  return context;
}

