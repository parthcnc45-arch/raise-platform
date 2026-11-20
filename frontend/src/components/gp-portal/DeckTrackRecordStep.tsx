"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import PerformanceMetricsModal from "./PerformanceMetricsModal";
import {
  BodyText,
  FieldError,
  HelpLink,
  PageTitle,
  SectionHeading,
  SelectInput,
  inputCls,
} from "./formUi";
import RichTextEditor from "./RichTextEditor";
import type { TrackRecordData, TrackRecordFund } from "./types";

type DeckTrackRecordStepProps = {
  value: TrackRecordData;
  onChange: (next: TrackRecordData) => void;
  deckError?: string;
  countError?: string;
};

const FUND_TYPES = [
  { label: "Current firm blind pool", value: "Current BP" },
  { label: "Current firm SPV", value: "Current SPV" },
  { label: "Prior firm blind pool", value: "Prior BP" },
  { label: "Prior firm SPV", value: "Prior SPV" },
  { label: "Angel investment", value: "Angel" },
];

const AS_OF_DATES = ["Q2 2026", "Q1 2026", "Q4 2025", "pre Q4 2025"];

const TRACK_RECORD_COUNTS = [
  { label: "I have no track record", value: "na" },
  { label: "I prefer not to share my track record", value: "undisclosed" },
  ...Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })),
];

export const emptyFund = (id: string): TrackRecordFund => ({
  id,
  name: "",
  type: "",
  vintage: "",
  asOf: "",
  size: "",
  called: "",
  dpi: "",
  rvpi: "",
  netIrr: "",
});

// Right-hand column of each fund row (the left column holds name, type, vintage and as-of)
const fundFields: Array<{ key: keyof TrackRecordFund; label: string }> = [
  { key: "size", label: "Total Size (M):" },
  { key: "called", label: "Called (%):" },
  { key: "dpi", label: "DPI (%):" },
  { key: "rvpi", label: "RVPI (%):" },
  { key: "netIrr", label: "Net IRR (%):" },
];

// Local-only upload simulation: the file is not sent anywhere yet, but the progress UI matches the live portal.
type UploadState = { fileName: string; total: number; loaded: number; speed: number };

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export default function DeckTrackRecordStep({ value, onChange, deckError, countError }: DeckTrackRecordStepProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Always points at the latest props so the timer callback never uses stale data
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });

  const stopTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopTimer, []);

  const startUpload = (file: File) => {
    stopTimer();
    // Simulated transfer takes between 2 and 8 seconds depending on the file size
    const seconds = Math.min(8, Math.max(2, file.size / (1024 * 1024)));
    const speed = file.size / seconds;
    const startedAt = Date.now();
    setUpload({ fileName: file.name, total: file.size, loaded: 0, speed });

    timer.current = setInterval(() => {
      const loaded = Math.min(file.size, ((Date.now() - startedAt) / 1000) * speed);
      if (loaded >= file.size) {
        stopTimer();
        setUpload(null);
        latest.current.onChange({ ...latest.current.value, deckFileName: file.name });
      } else {
        setUpload({ fileName: file.name, total: file.size, loaded, speed });
      }
    }, 100);
  };

  const cancelUpload = () => {
    stopTimer();
    setUpload(null);
  };

  const rowCount = /^\d+$/.test(value.numberOfFunds) ? Number(value.numberOfFunds) : 0;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) startUpload(file);
    event.target.value = "";
  };

  const updateFund = (index: number, field: keyof TrackRecordFund, fieldValue: string) =>
    onChange({
      ...value,
      funds: value.funds.map((fund, i) => (i === index ? { ...fund, [field]: fieldValue } : fund)),
    });

  return (
    <div className="space-y-8">
      {/* FUNDRAISING DECK */}
      <section className="space-y-2">
        <PageTitle>FUNDRAISING DECK</PageTitle>
        <BodyText>
          Providing a copy of your most recent fundraising deck is one of the best ways to share information about
          your fund with the Selection Committee.
        </BodyText>
        <BodyText>
          Click Upload Deck to upload your fundraising deck in PDF format <HelpLink>who can see this?</HelpLink>. If
          you are not actively fundraising, upload your most recent marketing deck or your most recent investor
          update.
        </BodyText>

        <FieldError message={deckError} />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-xs text-gray-800">Deck Filename:</span>
          {value.deckFileName ? (
            <span className="text-xs text-gray-800">
              {value.deckFileName}{" "}
              <button
                type="button"
                onClick={() => onChange({ ...value, deckFileName: "" })}
                className="text-[#1F5FBF] hover:underline"
              >
                (delete)
              </button>
            </span>
          ) : (
            <span className="text-xs text-gray-600">Deck Not Yet Uploaded</span>
          )}
        </div>

        <div>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={!!upload}
            className="rounded-md bg-[#2d9ab7] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#258399] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Upload Deck
          </button>
        </div>

        {upload && (
          <div className="space-y-1.5 pt-1" role="status" aria-live="polite">
            <div className="relative h-4 w-full max-w-md overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
              <div
                className="h-full bg-[#2a5d93] transition-[width] duration-100"
                style={{ width: `${Math.round((upload.loaded / upload.total) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
                {Math.round((upload.loaded / upload.total) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-700">
              Uploading {upload.fileName}. {formatBytes(upload.loaded)} of {formatBytes(upload.total)} at{" "}
              {Math.round(upload.speed / 1024)}KB/s;{" "}
              {Math.max(1, Math.ceil((upload.total - upload.loaded) / upload.speed))} seconds remaining
            </p>
            <button
              type="button"
              onClick={cancelUpload}
              className="rounded-md bg-[#2a5d93] px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1B365D]"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* TRACK RECORD */}
      <section className="space-y-3">
        <SectionHeading>TRACK RECORD</SectionHeading>
        <BodyText>
          Track Record is one factor used by the Selection Committee to determine who gets invited to, and who
          presents at RAISE. If you have a track record, supplying it to the committee will greatly increase your
          chances <HelpLink>who can see this?</HelpLink>.
        </BodyText>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-800">Select the best option for you:</p>
          <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="performanceOption"
              checked={value.performanceOption === "Operating Firm"}
              onChange={() => onChange({ ...value, performanceOption: "Operating Firm" })}
              className="h-3.5 w-3.5 accent-[#1B365D]"
            />
            <span>We are an existing firm with at least one closed fund.</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="performanceOption"
              checked={value.performanceOption === "First Time Fund"}
              onChange={() => onChange({ ...value, performanceOption: "First Time Fund" })}
              className="h-3.5 w-3.5 accent-[#1B365D]"
            />
            <span>We are a new firm and we have not completed the final close of our first fund.</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs text-gray-800 sm:max-w-xl">
            I am supplying a track record including a total of this many blind pools, angel investments, and SPVs:
          </label>
          <SelectInput
            value={value.numberOfFunds}
            onChange={(next) => onChange({ ...value, numberOfFunds: next })}
            options={TRACK_RECORD_COUNTS}
          />
        </div>
        {countError && <div className="text-right"><FieldError message={countError} /></div>}

        {rowCount > 0 && (
          <div className="space-y-4 pt-2">
            <BodyText>
              Please include all of your current firm&apos;s blind pool funds first, followed by your current
              firm&apos;s SPVs, then optionally include prior investments.
            </BodyText>
            <BodyText>
              Please only provide net performance data{" "}
              <HelpLink onClick={() => setMetricsOpen(true)}>click for performance metrics definitions?</HelpLink>
            </BodyText>

            {Array.from({ length: rowCount }, (_, index) => {
              const fund = value.funds[index] ?? emptyFund(`fund-${index}`);
              return (
                <div
                  key={fund.id}
                  className="flex flex-col gap-3 rounded-lg border border-[#c9d9ee] bg-[#e8f0fb] p-4 sm:flex-row sm:gap-5"
                >
                  <span className="w-8 shrink-0 text-3xl font-light leading-none text-[#1B365D]">{index + 1}</span>

                  <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-xs font-medium text-slate-800">Fund Name:</label>
                        <input
                          type="text"
                          value={fund.name}
                          onChange={(e) => updateFund(index, "name", e.target.value)}
                          className={`${inputCls} w-full min-w-0`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-xs font-medium text-slate-800">Fund Type:</label>
                        <SelectInput
                          value={fund.type}
                          onChange={(next) => updateFund(index, "type", next)}
                          options={FUND_TYPES}
                          className="w-full min-w-0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-xs font-medium text-slate-800">Vintage:</label>
                        <input
                          type="text"
                          value={fund.vintage}
                          onChange={(e) => updateFund(index, "vintage", e.target.value)}
                          className={`${inputCls} w-full min-w-0`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-xs font-medium text-slate-800">As Of:</label>
                        <SelectInput
                          value={fund.asOf}
                          onChange={(next) => updateFund(index, "asOf", next)}
                          options={AS_OF_DATES}
                          className="w-full min-w-0"
                        />
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-2">
                      {fundFields.map((field) => (
                        <div key={field.key} className="flex items-center gap-2">
                          <label className="w-28 shrink-0 text-xs font-medium text-slate-800 md:text-right">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={fund[field.key]}
                            onChange={(e) => updateFund(index, field.key, e.target.value)}
                            className={`${inputCls} w-full min-w-0 md:w-32`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SUPPLEMENTAL INFORMATION */}
      <section className="space-y-2">
        <SectionHeading>SUPPLEMENTAL INFORMATION TO THE SELECTION COMMITTEE</SectionHeading>
        <BodyText>
          Use the text area below to provide optional supplemental information, or links to external resources for
          the Selection Committee to consider.
        </BodyText>
        <RichTextEditor
          ariaLabel="Supplemental information"
          value={value.supplementalInfo}
          onChange={(html) => onChange({ ...value, supplementalInfo: html })}
          minHeight={200}
        />
      </section>

      <PerformanceMetricsModal open={metricsOpen} onClose={() => setMetricsOpen(false)} />
    </div>
  );
}
