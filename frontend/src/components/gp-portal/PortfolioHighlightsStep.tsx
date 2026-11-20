"use client";

import type { ReactNode } from "react";
import { BodyText, PageTitle, SelectInput, inputCls, textareaCls } from "./formUi";
import type { PortfolioCompany } from "./types";

type PortfolioHighlightsStepProps = {
  companies: PortfolioCompany[];
  onChange: (next: PortfolioCompany[]) => void;
};

const STAGES = ["Pre-Seed/Angel", "Seed", "Series A", "Series B", "Series C+", "Other/Decline to Disclose"];
const STATUSES = ["Active", "Exited", "Shutdown"];

export const emptyPortfolioCompany = (id: string): PortfolioCompany => ({
  id,
  companyName: "",
  website: "",
  stage: "",
  status: "",
  firstInvestmentYear: "",
  firstInvestmentAmount: "",
  initialOwnership: "",
  totalInvested: "",
  currentOwnership: "",
  boardSeat: "",
  comment: "",
});

type TextKey =
  | "companyName"
  | "website"
  | "firstInvestmentYear"
  | "firstInvestmentAmount"
  | "initialOwnership"
  | "totalInvested"
  | "currentOwnership";

// Label sits above its control, as on the official portal.
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-800">{label}</label>
      {children}
    </div>
  );
}

export default function PortfolioHighlightsStep({ companies, onChange }: PortfolioHighlightsStepProps) {
  const update = (index: number, field: keyof PortfolioCompany, fieldValue: string) =>
    onChange(companies.map((company, i) => (i === index ? { ...company, [field]: fieldValue } : company)));

  const text = (company: PortfolioCompany, index: number, key: TextKey, label: string) => (
    <Field label={label}>
      <input
        type="text"
        value={company[key]}
        onChange={(e) => update(index, key, e.target.value)}
        className={`${inputCls} w-full`}
      />
    </Field>
  );

  return (
    <div className="space-y-6">
      <div>
        <PageTitle>PORTFOLIO HIGHLIGHTS</PageTitle>
        <BodyText>
          Highlight up to three of your most compelling portfolio companies. Keep your comment on each short to
          encourage reading.
        </BodyText>
      </div>

      {companies.map((company, index) => (
        <div
          key={company.id}
          className="space-y-4 rounded-lg border border-[#c9d9ee] bg-[#e8f0fb] p-4"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-3">
            {/* Column 1 */}
            <div className="space-y-3">
              {text(company, index, "companyName", "Company Name:")}
              {text(company, index, "website", "Website:")}
              <Field label="Entry Investment Stage:">
                <SelectInput
                  value={company.stage}
                  onChange={(next) => update(index, "stage", next)}
                  options={STAGES}
                  className="w-full"
                />
              </Field>
              <Field label="Company Status:">
                <SelectInput
                  value={company.status}
                  onChange={(next) => update(index, "status", next)}
                  options={STATUSES}
                  className="w-full"
                />
              </Field>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              {text(company, index, "firstInvestmentYear", "Year of First Invetment:")}
              {text(company, index, "firstInvestmentAmount", "First Investment (USD):")}
              {text(company, index, "initialOwnership", "Initial Ownership (%):")}
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              {text(company, index, "totalInvested", "Total Invested (USD):")}
              {text(company, index, "currentOwnership", "Current Ownership (%):")}
              <Field label="Currently a Board Member">
                <SelectInput
                  value={company.boardSeat}
                  onChange={(next) => update(index, "boardSeat", next)}
                  options={["Yes", "No"]}
                  className="w-full"
                />
              </Field>
            </div>
          </div>

          <Field label="Comment:">
            <textarea
              rows={4}
              value={company.comment}
              onChange={(e) => update(index, "comment", e.target.value)}
              className={textareaCls}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}
