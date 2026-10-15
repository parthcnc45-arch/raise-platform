"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";

function MagicLinkVerifyContent() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token is missing.");
      return;
    }

    const savedEmail = localStorage.getItem(`magic_email_${token}`);
    if (savedEmail) {
      router.push(`/gp-application/details/${token}`);
    }
  }, [token, router]);

  const validate = () => {
    if (!email.trim()) {
      setFormError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setFormError("Email address is invalid");
      return false;
    }
    return true;
  };

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient(`/gp-applications/view/${token}`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data?.success) {
        localStorage.setItem(`magic_email_${token}`, email.trim());
        router.push(`/gp-application/details/${token}`);
      } else {
        setError(data?.message || "Invalid magic link or email address.");
      }
    } catch (err: any) {
      setError("Email is not valid for this link or server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* Left Brand Panel */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#183656] p-12 xl:p-20 text-white select-none">
        {/* Subtle Geometric Polygonal Facet Overlay */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,1000 1000,1000 1000,560 0,780" fill="#132c48" opacity="0.75" />
          <polygon points="0,1000 420,1000 1000,680 1000,1000" fill="#0e2239" opacity="0.6" />
          <polygon points="120,1000 680,1000 1000,800 0,910" fill="#0a1a2e" opacity="0.75" />
          <polygon points="0,1000 280,1000 1000,420 1000,580" fill="#1b395d" opacity="0.4" />
        </svg>

        {/* Top: RAISE Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo/logo-dark.png"
              alt="RAISE"
              width={160}
              height={38}
              priority
              className="h-9 w-auto"
            />
          </Link>
        </div>

        {/* Center: Hero Heading */}
        <div className="relative z-10 my-auto py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-5">
            Emerging<br />
            Manager<br />
            Database
          </h1>
          <p className="text-lg lg:text-xl text-slate-200/90 font-normal">
            Your gateway to emerging venture.
          </p>
        </div>

        {/* Bottom: External Link */}
        <div className="relative z-10">
          <a
            href="https://www.raiseglobal.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-slate-300 underline underline-offset-4 hover:text-white transition-colors"
          >
            Go to RAISE Website
          </a>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex w-full lg:w-1/2 min-h-screen flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/images/logo/logo.png"
              alt="RAISE"
              width={150}
              height={36}
              priority
              className="h-8 w-auto mx-auto"
            />
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Verify Identity
            </h1>
            <p className="text-sm text-slate-500">
              Enter the email address registered with this application to proceed.
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form noValidate onSubmit={verifyEmail} className="space-y-5">
            <div>
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError("");
                }}
                error={formError}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2 shadow-md shadow-blue-600/20"
                isLoading={loading}
              >
                <span>Access Application</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
