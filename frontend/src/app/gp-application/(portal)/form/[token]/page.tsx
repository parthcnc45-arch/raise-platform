"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GPApplicationWizard from "@/components/gp-portal/GPApplicationWizard";
import { useGPPortal } from "@/components/gp-portal/GPPortalContext";
import { getEventName } from "@/components/gp-portal/types";

export default function GPApplicationFormPage() {
  const { application, email, fullName, token } = useGPPortal();
  const router = useRouter();

  return (
    <GPApplicationWizard
      applicantName={fullName}
      company={application?.company}
      eventName={getEventName(application)}
      email={application?.email || email}
      onGoDashboard={() => router.push(`/gp-application/details/${token}`)}
    />
  );
}

