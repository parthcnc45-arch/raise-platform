"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/utils/apiClient";
import GPPortalHeader from "@/components/gp-portal/GPPortalHeader";
import GPPortalFooter from "@/components/gp-portal/GPPortalFooter";
import type { GPApplication } from "@/components/gp-portal/types";
import { GPPortalProvider } from "@/components/gp-portal/GPPortalContext";

function LoadingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
    </div>
  );
}

function GPPortalLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const pathname = usePathname();

  const [application, setApplication] = useState<GPApplication | null>(null);
  const [email, setEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    // The session lives in an httpOnly cookie, so it is validated by the server.
    let cancelled = false;
    (async () => {
      try {
        // Validates the cookie session AND that the token in the URL belongs to the same application.
        const res = await apiClient("/gp-applications/session/check", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && data?.success && data.data) {
          setEmail(data.data.email || "");
          setApplication(data.data);
          setIsAuthorized(true);
        } else {
          router.replace(`/gp-application/view/${token}`);
        }
      } catch {
        if (!cancelled) router.replace(`/gp-application/view/${token}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  const signOut = async () => {
    try {
      await apiClient("/gp-applications/session/logout", { method: "POST" });
    } catch {
      // Ignore network errors; the redirect below still returns the user to the verification page.
    }
    router.replace(`/gp-application/view/${token}`);
  };

  if (!isAuthorized) {
    return <LoadingView />;
  }

  const firstName = application?.firstName || application?.first_name || "GP Partner";
  const fullName = [firstName, application?.lastName || application?.last_name || ""].filter(Boolean).join(" ");
  const activePage = pathname.includes("/form") ? "application" : "overview";

  return (
    <GPPortalProvider
      value={{
        token,
        email,
        application,
        setApplication,
        signOut,
        fullName,
      }}
    >
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <GPPortalHeader
          fullName={fullName}
          company={application?.company}
          token={token}
          activePage={activePage}
          onSignOut={signOut}
        />
        <main className="w-full flex-1">
          {children}
        </main>
        <GPPortalFooter />
      </div>
    </GPPortalProvider>
  );
}

export default function GPPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingView />}>
      <GPPortalLayoutContent>{children}</GPPortalLayoutContent>
    </Suspense>
  );
}

