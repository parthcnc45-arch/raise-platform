"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, CheckCircle2 } from "lucide-react";

function MagicLinkDetailsContent() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    const savedEmail = localStorage.getItem(`magic_email_${token}`);
    if (!savedEmail) {
      router.push(`/gp-application/view/${token}`);
      return;
    }

    setEmail(savedEmail);
    setIsAuthorized(true);
  }, [token, router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/20 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles className="h-8 w-8" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
          Amazing things are coming soon!
        </h2>

        <p className="text-base text-slate-600 leading-relaxed mb-6">
          We are currently reviewing your GP application for{" "}
          <span className="font-semibold text-slate-900">{email}</span>.
          Please keep an eye on your inbox for further updates and onboarding instructions.
        </p>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>Application Under Evaluation</span>
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <MagicLinkDetailsContent />
    </Suspense>
  );
}
