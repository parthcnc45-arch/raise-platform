"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { X, HelpCircle, LogOut, LayoutDashboard, FileText } from "lucide-react";

type GPPortalHeaderProps = {
  fullName: string;
  company?: string;
  token: string;
  activePage: "application" | "overview";
  onSignOut: () => void;
};

export default function GPPortalHeader({
  fullName,
  company,
  token,
  activePage,
  onSignOut,
}: GPPortalHeaderProps) {
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white shadow-sm">
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:h-20 sm:px-8">
          {/* Left: Quick Navigation / Brand Indicator */}
          <div className="flex items-center justify-start gap-2 text-base font-medium text-slate-600 sm:gap-5">
            <Link
              href={`/gp-application/details/${token}`}
              className={`flex items-center gap-1.5 transition hover:text-[#1B365D] ${
                activePage === "overview"
                  ? "font-semibold text-[#1B365D]"
                  : "text-slate-500"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" aria-label="Dashboard" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <Link
              href={`/gp-application/form/${token}`}
              className={`flex items-center gap-1.5 transition hover:text-[#1B365D] ${
                activePage === "application"
                  ? "font-semibold text-[#1B365D]"
                  : "text-slate-500"
              }`}
            >
              <FileText className="h-5 w-5" aria-label="Application" />
              <span className="hidden md:inline">Application</span>
            </Link>
          </div>

          {/* Center: RAISE Wordmark */}
          <div className="text-center">
            <Link
              href={`/gp-application/form/${token}`}
              aria-label="RAISE home"
              className="inline-flex items-center"
            >
              <Logo variant="light" className="h-7 w-auto sm:h-11" />
            </Link>
          </div>

          {/* Right: FAQ & User Actions */}
          <div className="flex items-center justify-end gap-2 text-base text-slate-600 sm:gap-5">
            <button
              type="button"
              onClick={() => setIsFaqOpen(true)}
              className="text-base font-normal text-slate-700 transition hover:text-[#1B365D] hover:underline"
            >
              FAQ
            </button>
            <span className="hidden text-slate-300 sm:inline">|</span>
            {company && (
              <span className="hidden font-semibold text-slate-700 md:inline">
                {company}
              </span>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1 text-slate-500 transition hover:text-red-600"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Soft Blue Bottom Accent Bar */}
        <div className="h-[3px] w-full bg-[#78bce6]" />
      </header>

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B365D]">
                Frequently Asked Questions (FAQ)
              </h2>
              <button
                type="button"
                onClick={() => setIsFaqOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900">
                  1. What is the 2026 RAISE Global Summit?
                </h3>
                <p className="mt-1">
                  The RAISE Global Summit is an exclusive gathering connecting emerging
                  fund managers with institutional Limited Partners (LPs), family offices,
                  and investment professionals.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  2. Can multiple partners from our firm attend?
                </h3>
                <p className="mt-1">
                  Owing to strict venue and space constraints, only one partner from each
                  fund can attend in person. This partner will be designated as the primary
                  attendee and presenter (if selected).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  3. How does the presenter selection work?
                </h3>
                <p className="mt-1">
                  The Limited Partner Selection Committee reviews all applications and
                  selects a limited group of GPs to present on the main stage. Opting in
                  for the presenter option indicates your interest if selected.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  4. Can I save my application and return later?
                </h3>
                <p className="mt-1">
                  Yes! Click the &quot;Save for Later&quot; button at the bottom of any page.
                  You can resume your progress at any time using your personal magic link.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  5. Need additional assistance?
                </h3>
                <p className="mt-1">
                  If you encounter any problems or have specific inquiries, please contact
                  the RAISE team at{" "}
                  <a
                    href="mailto:community@raiseglobal.co"
                    className="font-medium text-[#1f5fbf] hover:underline"
                  >
                    community@raiseglobal.co
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-3">
              <button
                type="button"
                onClick={() => setIsFaqOpen(false)}
                className="rounded-[2px] bg-[#2d9ab7] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#258399]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

