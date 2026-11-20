"use client";

import {
  BodyText,
  CheckboxList,
  FieldError,
  HelpLink,
  Hint,
  LabelRow,
  PageTitle,
  QuestionRow,
  SectionHeading,
  SelectInput,
  inputCls,
  toList,
} from "./formUi";

type CompanyFocusStepProps = {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

const STAGES = ["Accelerator", "Pre-seed", "Seed", "Series A", "Growth Stage", "Pre-IPO Stage", "Stage Agnostic"];

const THEMES = [
  "AdTech", "FoodTech",
  "AI", "ESports / Games",
  "AgTech", "GovTech",
  "Biotech", "Health and Wellness",
  "Digital Assets / Web3", "HealthTech",
  "Enterprise / SaaS", "Impact Investing",
  "Cannabis", "InsurTech",
  "CleanTech", "Marketplaces",
  "Cloud Infrastructure", "Media",
  "Consumer", "Minority Founders",
  "DeepTech", "PropTech",
  "EdTech", "Cybersecurity",
  "FamilyTech", "Space",
  "Female Founders", "Travel",
  "FinTech", "Vertical Software",
];

const AI_YEARS = [
  "2010 or Earlier", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018",
  "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "Not Yet",
];

const AI_PERCENTAGES = ["Less than 25%", "25 - 50%", "50 - 75%", "More than 75%", "Not Yet"];

const FIRST_INVESTMENT_YEARS = [
  "2012 or Earlier", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020",
  "2021", "2022", "2023", "2024", "2025", "2026", "Not Yet",
];

const BLIND_POOL_OPTIONS = [
  { label: "We have not yet closed our first fund.", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4+", value: "4+" },
];

const SPV_OPTIONS = [
  { label: "We have not raised a separate SPV", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5-9", value: "4-9" },
  { label: "10+", value: "10+" },
];

const FUNDRAISING_OPTIONS = [
  { label: "In Market Now or later this year", value: "In Market Now" },
  { label: "2027", value: "2027" },
  { label: "2028 or later", value: "2028 or later" },
];

const MIN_CHECK_OPTIONS = [
  "< $50,000",
  "$50,000 - $250,000",
  "$250,000 - $500,000",
  "$500,000 - $1,000,000",
  "$1,000,000+",
];

const FINAL_CLOSE_OPTIONS = ["Q3 2026", "Q4 2026", "Q1 2027", "Q2 2027 or later", "Unknown"];

const SERVICE_PROVIDERS = [
  { key: "serviceLegal", label: "Legal:" },
  { key: "serviceFundAdmin", label: "Fund Administration:" },
  { key: "serviceTax", label: "Tax:" },
  { key: "serviceAudit", label: "Audit:" },
  { key: "serviceCompliance", label: "Compliance:" },
  { key: "serviceInsurance", label: "Insurance:" },
];

const YES_NO = ["Yes", "No"];

export default function CompanyFocusStep({ values, errors, onChange }: CompanyFocusStepProps) {
  const stages = toList(values.investmentStages);
  const themes = toList(values.thematicFocus);
  const isThematic = values.investmentThesis === "Investment Theme";
  const usesAI = isThematic && themes.includes("AI");
  const inMarket = values.fundraisingTiming === "In Market Now";

  const toggleStage = (stage: string) => {
    if (stages.includes(stage)) {
      onChange("investmentStages", stages.filter((s) => s !== stage).join(","));
    } else if (stages.length < 2) {
      onChange("investmentStages", [...stages, stage].join(","));
    }
  };

  const toggleTheme = (theme: string) => {
    if (themes.includes(theme)) {
      onChange("thematicFocus", themes.filter((t) => t !== theme).join(","));
    } else if (themes.length < 4) {
      onChange("thematicFocus", [...themes, theme].join(","));
    }
  };

  return (
    <div className="space-y-8">
      {/* COMPANY FOCUS */}
      <section className="space-y-4">
        <PageTitle>COMPANY FOCUS</PageTitle>

        <div>
          <p className="text-xs text-gray-800 mb-2">
            At what stage do you usually invest? <Hint>(check one or two)</Hint>
          </p>
          <CheckboxList options={STAGES} selected={stages} onToggle={toggleStage} />
          <FieldError message={errors.investmentStages} />
        </div>

        <QuestionRow question="How would you define your investment thesis?" error={errors.investmentThesis}>
          <SelectInput
            value={values.investmentThesis || ""}
            onChange={(v) => onChange("investmentThesis", v)}
            options={[
              { label: "Generalist", value: "Generalist" },
              { label: "Specialist/Thematic (i.e. Female Founders, AI, etc)", value: "Investment Theme" },
            ]}
          />
        </QuestionRow>

        {isThematic && (
          <div>
            <p className="text-xs text-gray-800 mb-2">Pick up to four thematic categories:</p>
            <CheckboxList options={THEMES} selected={themes} onToggle={toggleTheme} columns={2} />
            <FieldError message={errors.thematicFocus} />
          </div>
        )}

        {usesAI && (
          <div className="space-y-3">
            <QuestionRow question="What year did your firm begin investing in AI?" error={errors.aiYear}>
              <SelectInput value={values.aiYear || ""} onChange={(v) => onChange("aiYear", v)} options={AI_YEARS} />
            </QuestionRow>
            <QuestionRow
              question="What percentage of your portfolio is actively using AI as a core part of their product or service?"
              error={errors.aiPercent}
            >
              <SelectInput
                value={values.aiPercent || ""}
                onChange={(v) => onChange("aiPercent", v)}
                options={AI_PERCENTAGES}
              />
            </QuestionRow>
          </div>
        )}

        <QuestionRow question="Do you have a geographic focus?" error={errors.hasGeoFocus}>
          <SelectInput
            value={values.hasGeoFocus || ""}
            onChange={(v) => onChange("hasGeoFocus", v)}
            options={YES_NO}
          />
        </QuestionRow>

        {values.hasGeoFocus === "Yes" && (
          <LabelRow label="What are your geographic areas of focus?" error={errors.geoFocus}>
            <input
              type="text"
              value={values.geoFocus || ""}
              onChange={(e) => onChange("geoFocus", e.target.value)}
              className={`${inputCls} w-full sm:w-72`}
            />
          </LabelRow>
        )}
      </section>

      {/* HISTORY */}
      <section className="space-y-4">
        <SectionHeading>HISTORY</SectionHeading>

        <QuestionRow
          question={
            <>
              What is your current total firm-wide committed capital across all funds?{" "}
              <HelpLink>what is included?</HelpLink> <Hint>(in Millions USD)</Hint>
            </>
          }
          error={errors.totalCommittedCapital}
        >
          <input
            type="number"
            min="0"
            value={values.totalCommittedCapital || ""}
            onChange={(e) => onChange("totalCommittedCapital", e.target.value)}
            className={`${inputCls} w-full sm:w-72`}
          />
        </QuestionRow>

        <QuestionRow question="During what year did your current firm make its first investment?">
          <SelectInput
            value={values.firstInvestmentYear || ""}
            onChange={(v) => onChange("firstInvestmentYear", v)}
            options={FIRST_INVESTMENT_YEARS}
          />
        </QuestionRow>

        <QuestionRow
          question={
            <>
              Number of blind pool funds <HelpLink>what&apos;s that?</HelpLink> your existing firm has previously
              closed.
            </>
          }
        >
          <SelectInput
            value={values.blindPoolFunds || ""}
            onChange={(v) => onChange("blindPoolFunds", v)}
            options={BLIND_POOL_OPTIONS}
          />
        </QuestionRow>

        <QuestionRow
          question={
            <>
              Number of SPVs <HelpLink>what&apos;s that?</HelpLink> your existing firm has previously raised and
              invested?
            </>
          }
        >
          <SelectInput value={values.spvs || ""} onChange={(v) => onChange("spvs", v)} options={SPV_OPTIONS} />
        </QuestionRow>
      </section>

      {/* FUNDRAISING */}
      <section className="space-y-4">
        <SectionHeading>FUNDRAISING</SectionHeading>

        <QuestionRow question="When do you expect to be fundraising?">
          <SelectInput
            value={values.fundraisingTiming || ""}
            onChange={(v) => onChange("fundraisingTiming", v)}
            options={FUNDRAISING_OPTIONS}
          />
        </QuestionRow>

        {inMarket && (
          <div className="space-y-4">
            <QuestionRow
              question={
                <>
                  What is the target fund size for this fundraising? <Hint>(in Millions USD)</Hint>
                </>
              }
              error={errors.targetFundSize}
            >
              <input
                type="number"
                min="0"
                value={values.targetFundSize || ""}
                onChange={(e) => onChange("targetFundSize", e.target.value)}
                className={`${inputCls} w-full sm:w-72`}
              />
            </QuestionRow>

            <QuestionRow question="What is the minimum check size for this fundraising?" error={errors.minCheckSize}>
              <SelectInput
                value={values.minCheckSize || ""}
                onChange={(v) => onChange("minCheckSize", v)}
                options={MIN_CHECK_OPTIONS}
              />
            </QuestionRow>

            <QuestionRow question="When do you expect to have your final close?" error={errors.expectedFinalClose}>
              <SelectInput
                value={values.expectedFinalClose || ""}
                onChange={(v) => onChange("expectedFinalClose", v)}
                options={FINAL_CLOSE_OPTIONS}
              />
            </QuestionRow>
          </div>
        )}
      </section>

      {/* SERVICE PROVIDERS */}
      <section className="space-y-3">
        <SectionHeading>SERVICE PROVIDERS</SectionHeading>
        <BodyText>
          What firm or firms do you use for each of the following services? If you perform the function in house,
          simply write &quot;internal&quot;. If you have not yet selected a provider, write &quot;TBD&quot;.
        </BodyText>

        <div className="space-y-2">
          {SERVICE_PROVIDERS.map((row) => (
            <LabelRow key={row.key} label={row.label}>
              <input
                type="text"
                value={values[row.key] || ""}
                onChange={(e) => onChange(row.key, e.target.value)}
                className={`${inputCls} w-full sm:w-72`}
              />
            </LabelRow>
          ))}
        </div>

        <QuestionRow question="Do you employ a full time or part time CFO/Controller?">
          <SelectInput value={values.hasCfo || ""} onChange={(v) => onChange("hasCfo", v)} options={YES_NO} />
        </QuestionRow>
      </section>
    </div>
  );
}
