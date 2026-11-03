"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GPApplicationWizard from "@/components/gp-portal/GPApplicationWizard";
import { useGPPortal } from "@/components/gp-portal/GPPortalContext";

export default function GPApplicationFormPage() {
  const { application, email, fullName, token } = useGPPortal();
  const router = useRouter();

  return (
    <GPApplicationWizard
      applicantName={fullName}
      company={application?.company}
      email={application?.email || email}
      onGoDashboard={() => router.push(`/gp-application/details/${token}`)}
    />
  );
}

