"use client";

import { toList } from "./formUi";
import { richContentCls, sanitizeHtml } from "./RichTextEditor";
import type { FinalSubmissionData, TrackRecordData } from "./types";

type ProfilePreviewStepProps = {
  values: Record<string, string>;
  trackRecord: TrackRecordData;
  finalSubmission: FinalSubmissionData;
  companyName: string;
  contactName: string;
  onBack: () => void;
  onSubmit: () => void;
};

const FUND_TYPE_LABELS: Record<string, string> = {
  "Current BP": "Current firm blind pool",
  "Current SPV": "Current firm SPV",
  "Prior BP": "Prior firm blind pool",
  "Prior SPV": "Prior firm SPV",
  Angel: "Angel investment",
};

type Row = [label: string, value: string];

const formatCapital = (raw: string) => {
  const n = Number(raw);
  return raw && !Number.isNaN(n) ? `$${n.toFixed(1)}M USD` : "";
};

const formatMillions = (raw: string) => {
  const n = Number(raw);
  return raw && !Number.isNaN(n) ? `$${n}M USD` : "";
};

export default function ProfilePreviewStep({
  values,
  trackRecord,
  finalSubmission,
  companyName,
  contactName,
  onBack,
  onSubmit,
}: ProfilePreviewStepProps) {
  const isThematic = values.investmentThesis === "Investment Theme";
  const inMarket = values.fundraisingTiming === "In Market Now";

  const groups: Row[][] = [
    [
      ["Location", values.headquarters || ""],
      ["Investment Stage", toList(values.investmentStages).join(", ")],
      ["Investment Focus", values.investmentThesis || ""],
      ["Specializations", isThematic ? toList(values.thematicFocus).join(", ") : ""],
      ["Geographic Focus", values.hasGeoFocus === "Yes" ? values.geoFocus || "" : ""],
    ],
    [
      ["Committed Capital", formatCapital(values.totalCommittedCapital || "")],
      ["First Investment", values.firstInvestmentYear || ""],
      ["Closed Blind Pool Funds", values.blindPoolFunds || ""],
      ["Closed SPVs", values.spvs || ""],
    ],
    [
      ["Next Fundraising", values.fundraisingTiming || ""],
      ["Target Fund Size", inMarket ? formatMillions(values.targetFundSize || "") : ""],
      ["Minimum Check Size", inMarket ? values.minCheckSize || "" : ""],
      ["Expected Final Close", inMarket ? values.expectedFinalClose || "" : ""],
    ],
    [
      ["Partners (men)", values.partnerMen || ""],
      ["Partners (women)", values.partnerWomen || ""],
      ["Partners (other)", values.partnerOtherGender || ""],
      ["Partner Background", values.investorBackground || ""],
      ["Partner Racial/Ethnic", toList(values.partnerEthnicities).join(", ")],
      ["Partner Other", toList(values.teamAlsoIncludes).join(", ")],
    ],
  ];

  const fundCount = /^\d+$/.test(trackRecord.numberOfFunds) ? Number(trackRecord.numberOfFunds) : 0;
  const shownFunds = trackRecord.funds.slice(0, fundCount);

  return (
    // zoom keeps this page the same size as the application form (about 1024px wide)
    <div
      style={{ zoom: 1.2 }}
      className="mx-auto w-full max-w-[853px] px-4 py-6 sm:px-6 md:py-8 font-sans text-[#333333]"
    >
      <h1 className="text-[#1F5FBF] text-xl font-semibold tracking-wide uppercase">PROFILE REVIEW</h1>
      <p className="mt-2 text-xs leading-relaxed text-[#333333]">
        Review your profile below. To make changes hit the Back button.{" "}
        <strong>If you like it, hit Submit Profile.</strong> Remember you can return at any time and make further
        edits using the link emailed to you previously.
      </p>

      <div className="mt-6 flex items-center gap-4 border-t border-[#1F5FBF] pt-4">
        {finalSubmission.companyLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={finalSubmission.companyLogoUrl}
            alt={`${companyName} logo`}
            className="h-14 max-w-[160px] object-contain"
          />
        )}
        <div>
          <h2 className="text-2xl font-semibold uppercase text-[#333333]">{companyName}</h2>
          {finalSubmission.headline && (
            <p className="mt-1 text-sm text-[#333333]">{finalSubmission.headline}</p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-[#1F5FBF] pt-4 grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
        <div className="text-[11px] leading-snug">
          {finalSubmission.headshotUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={finalSubmission.headshotUrl}
              alt={`${contactName} headshot`}
              className="mb-2 h-24 w-24 rounded-md object-cover"
            />
          )}
          <p className="font-bold text-[#333333]">{contactName}</p>
          {values.title && <p className="text-[#333333]">{values.title}</p>}
          {values.contactEmail && (
            <a href={`mailto:${values.contactEmail}`} className="text-[#1F5FBF] hover:underline break-all">
              {values.contactEmail}
            </a>
          )}
        </div>

        <div className="space-y-4">
          {groups.map((rows, groupIndex) => (
            <dl key={groupIndex} className="space-y-0.5 text-[11px]">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[170px_1fr] gap-2">
                  <dt className="font-bold text-[#333333]">{label}</dt>
                  <dd className="text-[#333333]">{value}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </div>

      {finalSubmission.executiveSummary && (
        <div className="mt-6 border-t border-[#1F5FBF] pt-4">
          <div
            className={`text-[11px] leading-relaxed text-[#333333] ${richContentCls}`}
            // the editor output is sanitised first (scripts, event handlers and unsafe links removed)
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(finalSubmission.executiveSummary) }}
          />
        </div>
      )}

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase text-[#1F5FBF]">TRACK RECORD</h3>
        {fundCount === 0 ? (
          <p className="mt-1 text-[11px] text-[#333333]">
            This GP is not sharing performance data here. Contact them directly for more information.
          </p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-300 font-bold">
                  <th className="py-1 pr-2">Fund</th>
                  <th className="py-1 pr-2">Type</th>
                  <th className="py-1 pr-2">Vintage</th>
                  <th className="py-1 pr-2">As Of</th>
                  <th className="py-1 pr-2">Size (M)</th>
                  <th className="py-1 pr-2">Called (%)</th>
                  <th className="py-1 pr-2">DPI (%)</th>
                  <th className="py-1 pr-2">RVPI (%)</th>
                  <th className="py-1">Net IRR (%)</th>
                </tr>
              </thead>
              <tbody>
                {shownFunds.map((fund) => (
                  <tr key={fund.id} className="border-b border-gray-100">
                    <td className="py-1 pr-2">{fund.name}</td>
                    <td className="py-1 pr-2">{FUND_TYPE_LABELS[fund.type] || fund.type}</td>
                    <td className="py-1 pr-2">{fund.vintage}</td>
                    <td className="py-1 pr-2">{fund.asOf}</td>
                    <td className="py-1 pr-2">{fund.size}</td>
                    <td className="py-1 pr-2">{fund.called}</td>
                    <td className="py-1 pr-2">{fund.dpi}</td>
                    <td className="py-1 pr-2">{fund.rvpi}</td>
                    <td className="py-1">{fund.netIrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-10 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs uppercase text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-md bg-[#2d9ab7] px-6 py-1.5 text-xs font-semibold uppercase text-white hover:bg-[#258399] shadow-sm"
        >
          Submit Profile
        </button>
      </div>
    </div>
  );
}
