"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type PerformanceMetricsModalProps = {
  open: boolean;
  onClose: () => void;
};

const DEFINITIONS: Array<{ term: string; text: string }> = [
  {
    term: "Total Size:",
    text: "The total amount (in millions of USD) of committed capital for the fund or investment.",
  },
  {
    term: "Called (%):",
    text: "Amount of capital contributed to date as a percentage of total LP commitment. This amount should include management fees and exclude any recallable distributions.",
  },
  {
    term: "DPI (%):",
    text: "Distribution to Paid-in: Net Amount distributed to the LPs as a percentage of capital called.",
  },
  {
    term: "RVPI (%):",
    text: "Remaining Value to Paid-in: Portfolio residual value as a percentage of capital called. Fund value should be calculated in accordance with IFRS; GAAP; ASC 820 (also known as FAS 157) and/or International Private Equity and Venture Capital (IPEVC) guidelines. This amount should exclude any carry/performance fees earned by the GP.",
  },
  {
    term: "Net IRR (%):",
    text: "IRR net to LPs (less fees and carry, etc.). Please only provide actual net IRRs since inception (no target IRRs and no gross IRRs).",
  },
  {
    term: "As Of Date:",
    text: "Date at which the portfolio valuation and metrics are calculated.",
  },
];

export default function PerformanceMetricsModal({ open, onClose }: PerformanceMetricsModalProps) {
  // Close on Escape and lock page scrolling while the dialog is open
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Rendered in a portal so the page zoom does not affect the overlay position
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-metrics-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-3 text-base font-semibold text-[#1F5FBF] hover:text-[#1B365D]"
        >
          X
        </button>

        <h2 id="performance-metrics-title" className="mb-4 text-xl font-medium uppercase text-[#1F5FBF]">
          PERFORMANCE METRICS
        </h2>

        <dl className="space-y-3 text-[13px] leading-snug text-slate-800">
          {DEFINITIONS.map((item) => (
            <div key={item.term} className="grid grid-cols-[88px_1fr] gap-3">
              <dt className="text-right font-bold">{item.term}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>,
    document.body
  );
}
