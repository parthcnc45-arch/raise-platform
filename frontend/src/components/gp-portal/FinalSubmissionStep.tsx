"use client";

import { useRef, type ChangeEvent } from "react";
import { FileImage, Globe2, ImagePlus, LockKeyhole, ShieldCheck, SlidersHorizontal, Upload, UserRound } from "lucide-react";
import type { FinalSubmissionData } from "./types";

type FinalSubmissionStepProps = {
  value: FinalSubmissionData;
  onChange: (next: FinalSubmissionData) => void;
};

export default function FinalSubmissionStep({ value, onChange }: FinalSubmissionStepProps) {
  const logoInput = useRef<HTMLInputElement>(null);
  const headshotInput = useRef<HTMLInputElement>(null);
  const updateFile = (event: ChangeEvent<HTMLInputElement>, field: "companyLogoName" | "headshotName") => {
    const file = event.target.files?.[0];
    if (file) onChange({ ...value, [field]: file.name });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-medium text-slate-500">RAISE Partner Workspace <span className="mx-1.5 text-slate-300">/</span> Final Step</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Step 5: Database Opt-In &amp; Submission</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">Finalize your application for the RAISE Global Summit and set up your public profile for LP visibility.</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">100% Complete</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-full rounded-full bg-blue-700" /></div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900"><Globe2 className="h-4 w-4 text-blue-600" /> RAISE Emerging Manager Database</h3></div>
        <div className="p-5 sm:p-6"><p className="mb-4 text-xs text-slate-500">Choose how your application data will be handled post-submit. Our database is accessed by qualified LPs globally.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onChange({ ...value, databaseListing: "public" })} aria-pressed={value.databaseListing === "public"} className={`rounded-xl border p-4 text-left transition ${value.databaseListing === "public" ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300"}`}>
              <span className="flex items-center justify-between"><span className={`h-4 w-4 rounded-full border-2 ${value.databaseListing === "public" ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} /><Globe2 className="h-4 w-4 text-blue-500" /></span><span className="mt-3 block text-xs font-bold text-slate-900">Yes - Public Listing</span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Publish this information in the RAISE Emerging Manager Database for LP discovery.</span>
            </button>
            <button type="button" onClick={() => onChange({ ...value, databaseListing: "private" })} aria-pressed={value.databaseListing === "private"} className={`rounded-xl border p-4 text-left transition ${value.databaseListing === "private" ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300"}`}>
              <span className="flex items-center justify-between"><span className={`h-4 w-4 rounded-full border-2 ${value.databaseListing === "private" ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} /><LockKeyhole className="h-4 w-4 text-slate-400" /></span><span className="mt-3 block text-xs font-bold text-slate-900">No - Private Selection</span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Only submit this application for the private Selection Committee review process.</span>
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900"><ImagePlus className="h-4 w-4 text-blue-600" /> Profile Visuals</h3></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <AssetUpload title="Company Logo" uploadLabel="Upload Brand Asset" hint="SVG, PNG, transparent" fileName={value.companyLogoName} inputRef={logoInput} onChange={(event) => updateFile(event, "companyLogoName")} icon={<FileImage className="h-5 w-5" />} />
          <AssetUpload title="Lead Partner Headshot" uploadLabel="Upload Portrait" hint="JPG, PNG, min 400×400px" fileName={value.headshotName} inputRef={headshotInput} onChange={(event) => updateFile(event, "headshotName")} icon={<UserRound className="h-5 w-5" />} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900"><SlidersHorizontal className="h-4 w-4 text-blue-600" /> Executive Summary</h3></div>
        <div className="space-y-4 p-5 sm:p-6">
          <div><label htmlFor="gp-headline" className="mb-2 block text-[10px] font-semibold text-slate-700">One-Line Pitch (Headline)</label><input id="gp-headline" maxLength={100} value={value.headline} onChange={(event) => onChange({ ...value, headline: event.target.value })} placeholder="e.g. Scaling the next generation of climate infrastructure in emerging markets." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="mt-1 text-right text-[9px] text-slate-400">{value.headline.length} / 100 characters</p></div>
          <div><label htmlFor="gp-executive-summary" className="mb-2 block text-[10px] font-semibold text-slate-700">Concise Executive Summary</label><textarea id="gp-executive-summary" maxLength={1000} rows={5} value={value.executiveSummary} onChange={(event) => onChange({ ...value, executiveSummary: event.target.value })} placeholder="Provide a high-level overview of your investment thesis, team background, and fund performance..." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="mt-1 text-right text-[9px] text-slate-400">{value.executiveSummary.length} / 1000 characters</p></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900"><ShieldCheck className="h-4 w-4 text-blue-600" /> Visibility Permissions</h3></div>
        <div className="divide-y divide-slate-100 p-4 sm:px-6">
          <VisibilityToggle title="Allow LPs to access fundraising deck" description="Only verified LPs will see the ‘Download Deck’ button on your profile." checked={value.allowDeckAccess} onChange={(checked) => onChange({ ...value, allowDeckAccess: checked })} />
          <VisibilityToggle title="Allow LPs to view track record data" description="Visibility of detailed fund and portfolio company metrics to verified LPs." checked={value.allowTrackRecordAccess} onChange={(checked) => onChange({ ...value, allowTrackRecordAccess: checked })} />
        </div>
      </section>
      <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Your information is secure and encrypted</p>
    </div>
  );
}

function AssetUpload({ title, uploadLabel, hint, fileName, inputRef, onChange, icon }: { title: string; uploadLabel: string; hint: string; fileName: string; inputRef: React.RefObject<HTMLInputElement | null>; onChange: (event: ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode }) {
  return <div><p className="mb-2 text-[10px] font-semibold text-slate-700">{title}</p><button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-4 py-4 text-center transition hover:border-blue-300 hover:bg-blue-50/40"><input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" /><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</span><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700"><Upload className="h-3 w-3" />{fileName || uploadLabel}</span><span className="mt-1 text-[8px] uppercase tracking-wide text-slate-400">{hint}</span></button></div>;
}

function VisibilityToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1"><div><p className="text-[10px] font-semibold text-slate-800">{title}</p><p className="mt-1 text-[9px] text-slate-500">{description}</p></div><button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)} className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} /></button></div>;
}
