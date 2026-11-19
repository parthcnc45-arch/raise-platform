"use client";

import GPOverviewContent from "@/components/gp-portal/GPOverviewContent";
import FirmUsersSection from "@/components/gp-portal/FirmUsersSection";
import { useGPPortal } from "@/components/gp-portal/GPPortalContext";

export default function MagicLinkDetailsPage() {
  const { application, email, signOut, fullName } = useGPPortal();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <GPOverviewContent
        application={application}
        email={email}
        onSignOut={signOut}
      />
      <FirmUsersSection
        ownerName={fullName}
        ownerEmail={application?.email || email}
      />
    </div>
  );
}

