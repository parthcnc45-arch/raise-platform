"use client";

import { ArrowRight, Building2, CalendarDays, CheckCircle2, Clock3, FileCheck2, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import type { GPApplication } from "./types";
import ApplicationProgressCard from "./ApplicationProgressCard";

type GPOverviewContentProps = {
  application: GPApplication | null;
  email: string;
  onSignOut: () => void;
};

export default function GPOverviewContent({ application, email, onSignOut }: GPOverviewContentProps) {
  const firstName = application?.firstName || application?.first_name || "GP Partner";
  const lastName = application?.lastName || application?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const eventRelation = Array.isArray(application?.events) ? application.events[0] : application?.events;
  const eventValue = application?.event;
  const event = application?.event_name || application?.eventName || eventRelation?.name || (Array.isArray(eventValue) ? eventValue[0]?.name : typeof eventValue === "object" ? eventValue?.name : eventValue && !/^[0-9a-f-]{32,}$/i.test(eventValue) ? eventValue : null);
  const submittedAt = application?.created_at || application?.createdAt;
  const submittedDate = submittedAt ? new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">RAISE Partner Workspace <span className="mx-1.5 text-slate-300">/</span> Overview</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Here’s a summary of your GP application.</p>
        </div>
        <button onClick={onSignOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 lg:hidden"><LogOut className="h-4 w-4" /> Sign out</button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 shadow-sm sm:inline-flex"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure session</div>
      </header>

      <ApplicationProgressCard />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">Application status</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Clock3 className="h-5 w-5" /></span></div><p className="mt-4 text-lg font-bold text-slate-900">Under Evaluation</p><p className="mt-1 text-xs text-slate-500">We’ll email you when there’s an update.</p></div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">Event</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays className="h-5 w-5" /></span></div><p className="mt-4 truncate text-lg font-bold text-slate-900">{event || "Event name unavailable"}</p><p className="mt-1 text-xs text-slate-500">Your GP application event</p></div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">Submitted</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><FileCheck2 className="h-5 w-5" /></span></div><p className="mt-4 text-lg font-bold text-slate-900">{submittedDate || "Application received"}</p><p className="mt-1 text-xs text-slate-500">Your application is in our system.</p></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="text-sm font-bold text-slate-900">Application overview</h3><p className="mt-1 text-xs text-slate-500">The details submitted with your GP application</p></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-500"><UserRound className="h-4 w-4 text-blue-600" /> Applicant</div><p className="mt-2 text-sm font-semibold text-slate-900">{fullName}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Building2 className="h-4 w-4 text-blue-600" /> Company / Firm</div><p className="mt-2 text-sm font-semibold text-slate-900">{application?.company || "—"}</p></div>
            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2"><div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Mail className="h-4 w-4 text-blue-600" /> Registered email</div><p className="mt-2 break-all text-sm font-semibold text-slate-900">{application?.email || email}</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-bold text-slate-900">What happens next?</h3><p className="mt-1 text-xs text-slate-500">We’ll keep you informed at every step.</p>
          <div className="mt-6 space-y-5">
            <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-800">Application received</p><p className="mt-1 text-xs text-slate-500">Your details have been submitted.</p></div></div>
            <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Clock3 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-800">Under evaluation</p><p className="mt-1 text-xs text-slate-500">The RAISE team is reviewing your application.</p></div></div>
            <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ArrowRight className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-500">Next steps</p><p className="mt-1 text-xs text-slate-500">We’ll contact you by email with an update.</p></div></div>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>RAISE GP Partner Portal</span><span>Need help? Check your registered email for updates.</span></footer>
    </>
  );
}
