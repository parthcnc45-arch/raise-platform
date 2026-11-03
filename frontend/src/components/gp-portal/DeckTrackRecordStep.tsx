"use client";

import { useRef, type ChangeEvent } from "react";
import { Building2, ChartNoAxesCombined, FileText, Info, List, Plus, Trash2, Upload } from "lucide-react";
import type { TrackRecordData } from "./types";

type DeckTrackRecordStepProps = {
  value: TrackRecordData;
  onChange: (next: TrackRecordData) => void;
};

const fundTypes = ["Venture Capital", "Private Equity", "Growth Equity", "Other"];

export default function DeckTrackRecordStep({ value, onChange }: DeckTrackRecordStepProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const updateFund = (id: string, field: string, fieldValue: string) => onChange({
    ...value,
    funds: value.funds.map((fund) => fund.id === id ? { ...fund, [field]: fieldValue } : fund),
  });

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange({ ...value, deckFileName: file.name });
  };

  const addFund = () => onChange({
    ...value,
    funds: [...value.funds, { id: crypto.randomUUID(), name: "", type: "", vintage: "", size: "", called: "", dpi: "", rvpi: "", netIrr: "" }],
  });

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText className="h-4 w-4 text-blue-600" /> 1. Pitch Deck</h3></div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><FileText className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{value.deckFileName || "No pitch deck selected"}</p><p className="mt-1 text-[10px] text-slate-500">{value.deckFileName ? "Sample deck · preview only" : "PDF format recommended"}</p></div></div>
            <div className="flex shrink-0 items-center gap-2">
              <input ref={fileInput} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
              <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[11px] font-semibold text-white hover:bg-blue-800"><Upload className="h-3.5 w-3.5" /> Upload new deck</button>
              {value.deckFileName && <button type="button" onClick={() => onChange({ ...value, deckFileName: "" })} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500"><Info className="h-3 w-3 text-blue-600" /> Your deck will be shared securely with the Selection Committee. Privacy is our priority.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Building2 className="h-4 w-4 text-blue-600" /> 2. Track Record Selection</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3.5 ${value.firmType === "existing" ? "border-blue-500 bg-blue-50/60" : "border-slate-200"}`}><input type="radio" name="track-record-type" checked={value.firmType === "existing"} onChange={() => onChange({ ...value, firmType: "existing" })} className="mt-0.5 accent-blue-700" /><span><span className="block text-xs font-bold uppercase text-slate-800">Existing firm</span><span className="mt-1 block text-[10px] text-slate-500">We have at least one closed fund with historical data.</span></span></label>
          <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3.5 ${value.firmType === "new" ? "border-blue-500 bg-blue-50/60" : "border-slate-200"}`}><input type="radio" name="track-record-type" checked={value.firmType === "new"} onChange={() => onChange({ ...value, firmType: "new" })} className="mt-0.5 accent-blue-700" /><span><span className="block text-xs font-bold uppercase text-slate-800">New / First-Time Firm</span><span className="mt-1 block text-[10px] text-slate-500">This is our first fund or we are an emerging manager.</span></span></label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ChartNoAxesCombined className="h-4 w-4 text-blue-600" /> 3. Fund Performance</h3><span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Values in USD ($M)</span></div>
        {value.firmType === "existing" ? <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wide text-slate-500"><tr>{["Fund name", "Type", "Vintage", "Size ($M)", "Called %", "DPI", "RVPI", "Net IRR", ""].map((heading, index) => <th key={`${heading}-${index}`} className="px-3 py-3">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{value.funds.map((fund) => <tr key={fund.id}>
                <td className="px-2 py-2"><input aria-label="Fund name" value={fund.name} onChange={(event) => updateFund(fund.id, "name", event.target.value)} placeholder="Fund name..." className="w-28 rounded-md border border-transparent px-2 py-1.5 text-[10px] text-slate-800 outline-none focus:border-blue-300" /></td>
                <td className="px-2 py-2"><select aria-label="Fund type" value={fund.type} onChange={(event) => updateFund(fund.id, "type", event.target.value)} className="w-32 rounded-md border border-transparent bg-white px-2 py-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-300"><option value="">Select...</option>{fundTypes.map((type) => <option key={type}>{type}</option>)}</select></td>
                {([["vintage", "Year"], ["size", "0.0"], ["called", "0"], ["dpi", "0.00x"], ["rvpi", "0.00x"], ["netIrr", "0.0%"]] as const).map(([key, placeholder]) => <td key={key} className="px-2 py-2"><input aria-label={key} value={fund[key]} onChange={(event) => updateFund(fund.id, key, event.target.value)} placeholder={placeholder} className={`w-16 rounded-md border border-transparent px-2 py-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-300 ${key === "netIrr" ? "text-blue-700" : ""}`} /></td>)}
                <td className="px-2 py-2"><button type="button" aria-label="Remove fund" onClick={() => onChange({ ...value, funds: value.funds.filter((row) => row.id !== fund.id) })} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4"><button type="button" onClick={addFund} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 hover:bg-blue-50"><Plus className="h-3.5 w-3.5" /> Add another fund</button></div>
        </> : <div className="p-5 text-xs leading-relaxed text-slate-500">As a new / first-time firm, you can continue without historical closed-fund performance. Add any relevant partner track record in Supplemental Info below.</div>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><List className="h-4 w-4 text-blue-600" /> 4. Supplemental Info</h3><span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Optional</span></div>
        <label htmlFor="supplemental-info" className="mt-4 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Additional performance notes or context</label>
        <textarea id="supplemental-info" maxLength={1000} rows={4} value={value.supplementalInfo} onChange={(event) => onChange({ ...value, supplementalInfo: event.target.value })} placeholder="e.g. Detailed explanation of write-offs, recent portfolio exits, or benchmarking methodology..." className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <p className="mt-1 text-right text-[9px] text-slate-400">{value.supplementalInfo.length} / 1000 characters</p>
      </section>
    </div>
  );
}
