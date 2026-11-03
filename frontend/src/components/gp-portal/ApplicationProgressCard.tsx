"use client";

import { CheckSquare } from "lucide-react";

export default function ApplicationProgressCard() {
  const completedSteps = 3;
  const totalSteps = 5;
  const completion = Math.round((completedSteps / totalSteps) * 100);

  return (
    <section aria-label="Application progress" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
          <CheckSquare className="h-4 w-4 text-blue-600" />
          <span>Step {completedSteps} of {totalSteps} finished</span>
        </div>
        <span className="text-sm font-bold text-blue-700">{completion}% Complete</span>
      </div>
      <div
        role="progressbar"
        aria-label="Application completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion}
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div className="h-full rounded-full bg-blue-700 transition-[width]" style={{ width: `${completion}%` }} />
      </div>
      <p className="mt-3 text-xs italic text-slate-500">Application received and under review.</p>
    </section>
  );
}
