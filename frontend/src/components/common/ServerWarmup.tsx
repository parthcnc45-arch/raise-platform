"use client";

import { useEffect } from "react";

export default function ServerWarmup() {
  useEffect(() => {
    let apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    apiBase = apiBase.replace(/\/+$/, "");
    if (!apiBase.endsWith("/api/v1")) {
      apiBase = `${apiBase}/api/v1`;
    }

    const pingServer = () => {
      fetch(`${apiBase}/ping`, {
        method: "GET",
        cache: "no-store",
      }).catch(() => {
        // Silently ignore warmup ping errors
      });
    };

    // 1. Immediate non-blocking ping as soon as any page loads on the frontend
    pingServer();

    // 2. Keep pinging every 4 minutes while browser tab is active
    const interval = setInterval(pingServer, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

