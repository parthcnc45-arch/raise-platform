"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import GPPortalSidebar from "@/components/gp-portal/GPPortalSidebar";
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

    const savedEmail = localStorage.getItem(`magic_email_${token}`);
    if (!savedEmail) {
      router.replace(`/gp-application/view/${token}`);
      return;
    }

    const savedApp = localStorage.getItem(`magic_application_${token}`);
    let parsedApp: GPApplication | null = null;
    if (savedApp) {
      try {
        parsedApp = JSON.parse(savedApp);
      } catch {
        localStorage.removeItem(`magic_application_${token}`);
      }
    }

    setEmail(savedEmail);
    setApplication(parsedApp);
    setIsAuthorized(true);
  }, [token, router]);

  const signOut = () => {
    localStorage.removeItem(`magic_email_${token}`);
    localStorage.removeItem(`magic_application_${token}`);
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
      <div className="min-h-screen bg-[#f4f7fb] text-slate-900 lg:flex">
        <GPPortalSidebar
          fullName={fullName}
          company={application?.company}
          token={token}
          activePage={activePage}
          onSignOut={signOut}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          {children}
        </main>
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

