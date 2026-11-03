"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { PortfolioCompany } from "./types";

type PortfolioHighlightsStepProps = {
  companies: PortfolioCompany[];
  onChange: (companies: PortfolioCompany[]) => void;
};

const years = Array.from({ length: 31 }, (_, index) => String(new Date().getFullYear() - index));
const stages = ["Accelerator", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Other"];

export default function PortfolioHighlightsStep({ companies, onChange }: PortfolioHighlightsStepProps) {
  const updateCompany = (id: string, field: keyof PortfolioCompany, value: string | boolean) => onChange(companies.map((company) => company.id === id ? { ...company, [field]: value } : company));
  const addCompany = () => onChange([...companies, { id: crypto.randomUUID(), companyName: "", website: "", investmentYear: "", entryStage: "", totalInvested: "", ownership: "", commentary: "", expanded: true }]);

  return (
    <div className="space-y-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-medium text-slate-500">RAISE Partner Workspace <span className="mx-1.5 text-slate-300">/</span> Portfolio Highlights</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Portfolio Highlights</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">Showcase up to three standout portfolio companies to highlight your investment strategy, performance, and the unique value proposition of your fund.</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">80% Complete</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-blue-700" /></div>

      {companies.map((company, index) => (
        <section key={company.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <button type="button" onClick={() => updateCompany(company.id, "expanded", !company.expanded)} className="flex min-w-0 items-center gap-2.5 text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">{String(index + 1).padStart(2, "0")}</span><span className="truncate text-xs font-bold text-slate-900">Standout Investment {index + 1}</span>{company.expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {companies.length > 1 && <button type="button" onClick={() => onChange(companies.filter((item) => item.id !== company.id))} aria-label={`Remove standout investment ${index + 1}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}
          </div>
          <div className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2 sm:px-6 sm:py-5">
            <Field label="Company name" value={company.companyName} placeholder="e.g. Acme Corp" onChange={(value) => updateCompany(company.id, "companyName", value)} />
            <Field label="Website URL" value={company.website} placeholder="https://acme.com" onChange={(value) => updateCompany(company.id, "website", value)} />
            {company.expanded ? <>
              <SelectField label="Investment year" value={company.investmentYear} placeholder="Select year" options={years} onChange={(value) => updateCompany(company.id, "investmentYear", value)} />
              <SelectField label="Entry stage" value={company.entryStage} placeholder="Select stage" options={stages} onChange={(value) => updateCompany(company.id, "entryStage", value)} />
              <Field label="Total invested ($M)" value={company.totalInvested} placeholder="0.00" type="number" onChange={(value) => updateCompany(company.id, "totalInvested", value)} />
              <Field label="Current ownership (%)" value={company.ownership} placeholder="0.0" type="number" suffix="%" onChange={(value) => updateCompany(company.id, "ownership", value)} />
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[10px] font-semibold text-slate-700">Commentary &amp; Highlights</label>
                <textarea rows={4} value={company.commentary} onChange={(event) => updateCompany(company.id, "commentary", event.target.value)} placeholder="Describe the ‘why’ behind the investment, key milestones achieved, and current performance indicators..." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <p className="mt-1 text-[9px] text-slate-400">Recommended length: 150–250 words</p>
              </div>
            </> : <p className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 sm:col-span-2">Fill in the company details to expand the remaining metrics.</p>}
          </div>
        </section>
      ))}

      {companies.length < 3 && <button type="button" onClick={addCompany} className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-5 text-blue-700 transition hover:bg-blue-50/60"><Plus className="h-5 w-5" /><span className="text-[10px] font-bold uppercase tracking-wide">Add another company</span><span className="text-[9px] text-slate-400">(up to 3 total)</span></button>}
    </div>
  );
}

function Field({ label, value, placeholder, type = "text", suffix, onChange }: { label: string; value: string; placeholder: string; type?: string; suffix?: string; onChange: (value: string) => void }) {
  return <div><label className="mb-2 block text-[10px] font-semibold text-slate-700">{label}</label><div className="relative"><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{suffix}</span>}</div></div>;
}

function SelectField({ label, value, placeholder, options, onChange }: { label: string; value: string; placeholder: string; options: string[]; onChange: (value: string) => void }) {
  return <div><label className="mb-2 block text-[10px] font-semibold text-slate-700">{label}</label><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></div></div>;
}
