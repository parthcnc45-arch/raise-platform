"use client";

import { Fragment, useState, type FormEvent, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Download, LayoutDashboard, LogIn, Mail, SearchCheck } from "lucide-react";
import DeckTrackRecordStep from "./DeckTrackRecordStep";
import PortfolioHighlightsStep from "./PortfolioHighlightsStep";
import FinalSubmissionStep from "./FinalSubmissionStep";
import type { FinalSubmissionData, PortfolioCompany, TrackRecordData } from "./types";

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "url" | "textarea" | "select" | "checks";
  required?: boolean;
  options?: string[];
  wide?: boolean;
  section?: string;
  sectionDescription?: string;
  helpText?: string;
};

const step2Fields: Field[] = [
  { name: "investmentStages", label: "Investment stages", type: "checks" as const, section: "Section 1: Investment Strategy", options: ["Accelerator", "Pre-Seed", "Seed", "Series A", "Series B", "Stage Agnostic"] },
  { name: "investmentThesis", label: "Investment thesis", type: "select" as const, options: ["Enterprise software", "Consumer", "Fintech", "Healthcare", "Climate and sustainability", "Deep technology", "Other"] },
  { name: "globalFocus", label: "Global focus?", type: "select" as const, options: ["Yes, Globally Agnostic", "No, focused on specific markets", "Primarily regional"] },
  { name: "geographicFocus", label: "Geographic focus details", placeholder: "Specify key markets (e.g., North America, SE Asia, Western Europe)...", type: "textarea" as const, wide: true },
  { name: "totalCommittedCapital", label: "Total committed capital ($M)", placeholder: "0.00", type: "number" as const, section: "Section 2: Firm History", helpText: "Total capital committed to the firm's investment funds, in millions of US dollars." },
  { name: "firstInvestmentYear", label: "First investment year", placeholder: "YYYY", type: "number" as const, helpText: "The year your firm made its first investment." },
  { name: "blindPoolFunds", label: "Number of blind pool funds", placeholder: "0", type: "number" as const, helpText: "Number of funds raised without a pre-identified list of investments." },
  { name: "spvs", label: "Number of SPVs", placeholder: "0", type: "number" as const, helpText: "Number of special purpose vehicles managed by your firm." },
  { name: "fundraisingStatus", label: "Fundraising status", type: "select" as const, section: "Section 3: Fundraising", options: ["In Market (Open)", "Launching Soon", "First Close Completed", "Final Close Completed", "Not Currently Fundraising"] },
  { name: "targetFundSize", label: "Target fund size ($M)", placeholder: "50.00", type: "number" as const },
  { name: "minimumCheckSize", label: "Min check size", type: "select" as const, options: ["$50k - $250k", "$250k - $500k", "$500k - $1M", "$1M - $5M", "$5M+"] },
  { name: "expectedFinalClose", label: "Expected final close", type: "select" as const, options: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Not applicable"] },
  { name: "legalCounsel", label: "Legal counsel", placeholder: "e.g. Wilson Sonsini", section: "Section 4: Service Providers" },
  { name: "fundAdmin", label: "Fund admin", placeholder: "e.g. Carta, Passthrough" },
  { name: "taxPartner", label: "Tax partner", placeholder: "e.g. PwC, Deloitte" },
  { name: "auditPartner", label: "Audit partner", placeholder: "e.g. KPMG" },
  { name: "complianceProvider", label: "Compliance / Other", placeholder: "e.g. ACA Group", wide: true },
];

type GPApplicationWizardProps = {
  applicantName: string;
  company?: string;
  email: string;
  onGoDashboard: () => void;
};

export default function GPApplicationWizard({
  applicantName,
  company,
  email,
  onGoDashboard,
}: GPApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [values, setValues] = useState<Record<string, string>>({
    firmName: company || "",
    firstName: applicantName.split(" ")[0] || "",
    lastName: applicantName.split(" ").slice(1).join(" "),
    contactEmail: email,
    presenterOption: "",
    referredBy: "",
    title: "",
    linkedinUrl: "",
    website: "",
    headquarters: "",
    investorBackground: "",
    partnerMen: "",
    partnerWomen: "",
    partnerOtherGender: "",
    partnerEthnicities: "",
    ownershipMen: "",
    ownershipWomen: "",
    ownershipOtherGender: "",
    investmentStages: "Pre-Seed,Seed",
    globalFocus: "Yes, Globally Agnostic",
    fundraisingStatus: "In Market (Open)",
    targetFundSize: "50.00",
    minimumCheckSize: "$250k - $500k",
    expectedFinalClose: "Q1 2025",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [trackRecord, setTrackRecord] = useState<TrackRecordData>(() => ({
    deckFileName: "Fund_Pitch_Deck.pdf",
    firmType: "existing",
    funds: [
      { id: "sample-fund", name: "Fund I", type: "Venture Capital", vintage: "2021", size: "35.0", called: "85", dpi: "0.60x", rvpi: "1.90x", netIrr: "24.5%" },
      { id: "new-fund-row", name: "", type: "", vintage: "", size: "", called: "", dpi: "", rvpi: "", netIrr: "" },
    ],
    supplementalInfo: "",
  }));

  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([
    { id: "portfolio-1", companyName: "", website: "", investmentYear: "", entryStage: "", totalInvested: "", ownership: "", commentary: "", expanded: true },
    { id: "portfolio-2", companyName: "", website: "", investmentYear: "", entryStage: "", totalInvested: "", ownership: "", commentary: "", expanded: false },
  ]);

  const [finalSubmission, setFinalSubmission] = useState<FinalSubmissionData>({
    databaseListing: "public",
    companyLogoName: "",
    headshotName: "",
    headline: "",
    executiveSummary: "",
    allowDeckAccess: true,
    allowTrackRecordAccess: false,
  });

  useEffect(() => {
    // Attempt to load saved draft from localStorage
    const saved = localStorage.getItem("gp_app_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setValues((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSaveForLater = () => {
    try {
      localStorage.setItem("gp_app_draft", JSON.stringify(values));
      setSaveMessage("Your progress has been saved. You can return anytime.");
      setTimeout(() => setSaveMessage(""), 4000);
    } catch {
      setSaveMessage("Draft saved locally.");
      setTimeout(() => setSaveMessage(""), 4000);
    }
  };

  const selectedEthnicities = (values.partnerEthnicities || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleEthnicity = (eth: string) => {
    let next: string[];
    if (selectedEthnicities.includes(eth)) {
      next = selectedEthnicities.filter((item) => item !== eth);
    } else {
      next = [...selectedEthnicities, eth];
    }
    updateValue("partnerEthnicities", next.join(","));
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!values.firstName?.trim()) nextErrors.firstName = "First name is required";
      if (!values.lastName?.trim()) nextErrors.lastName = "Last name is required";
      if (!values.contactEmail?.trim()) nextErrors.contactEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
        nextErrors.contactEmail = "Enter a valid email address";
      }
      if (!values.firmName?.trim()) nextErrors.firmName = "Company name is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (currentStep === 4) {
      setSubmitted(true);
    } else {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayCompany = (values.firmName || company || "CODEANDCORE").toUpperCase().replace(/\s+/g, "");

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>
        <h2 className="mt-4 text-xl font-bold text-[#1B365D] sm:text-2xl">
          Application Submitted Successfully
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-600">
          Thank you for your submission, <strong className="text-[#1B365D]">{values.firmName || company}</strong>.
          The Selection Committee will review your profile for the 2026 RAISE Global Summit.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={onGoDashboard}
            className="rounded-[2px] bg-[#2d9ab7] px-5 py-2 text-xs font-semibold text-white hover:bg-[#258399]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-8 font-sans text-[#333333]">
      {/* Top Page Indicator */}
      <div className="flex items-center justify-between mb-4">
        {saveMessage ? (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {saveMessage}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[#1F5FBF] text-[11px] font-bold tracking-wider uppercase">
          PAGE {currentStep + 1} OF 5
        </span>
      </div>

      <form noValidate onSubmit={handleNext}>
        {/* ==================== PAGE 1 OF 5 ==================== */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {/* WELCOME SECTION */}
            <div>
              <h1 className="text-[#1B365D] font-bold text-sm tracking-wide uppercase mb-1">
                WELCOME {displayCompany}
              </h1>
              <p className="text-[#333333] text-xs leading-relaxed">
                Welcome! Complete this form to create and edit your 2026 RAISE Global Summit profile.
                You may choose to complete portions now and return later to finish by clicking the
                &apos;Save for Later&apos; button below.
              </p>
            </div>

            {/* PRESENTER OPTION */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-xs tracking-wider uppercase mb-1">
                PRESENTER OPTION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-8 text-[#333333] text-xs leading-relaxed">
                  If you are invited to attend RAISE, do you want to present your fund to the attendees on the
                  main stage at the event? Please note, space is limited and not everyone who applies can present.
                  The Limited Partner Selection Committee selects the presenters.
                </div>
                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <select
                    value={values.presenterOption || ""}
                    onChange={(e) => updateValue("presenterOption", e.target.value)}
                    className="w-full md:w-52 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">Please select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* REFERRED BY */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-xs tracking-wider uppercase mb-1">
                REFERRED BY
              </h2>
              <p className="text-[#333333] text-xs leading-relaxed mb-2">
                If you were referred to RAISE by another member of the RAISE community, please let the Selection
                Committee know who referred you by listing their name and email below.
              </p>
              <input
                type="text"
                value={values.referredBy || ""}
                onChange={(e) => updateValue("referredBy", e.target.value)}
                className="w-full h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
              />
            </div>

            {/* PRIMARY CONTACT */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-xs tracking-wider uppercase mb-1">
                PRIMARY CONTACT
              </h2>
              <p className="text-[#333333] text-xs leading-relaxed mb-3">
                Owing to space constraints, only one partner from each fund can attend the RAISE event. This partner
                will be listed as the attendee, included in the Emerging Manager Database (if you opt-in), and designated
                as the Presenter (if selected). Please provide the following details for the partner from your firm who will attend.
              </p>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">First Name:</label>
                  <input
                    type="text"
                    value={values.firstName || ""}
                    onChange={(e) => updateValue("firstName", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                  {errors.firstName && (
                    <span className="text-[11px] text-rose-600 sm:ml-2">{errors.firstName}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Last Name:</label>
                  <input
                    type="text"
                    value={values.lastName || ""}
                    onChange={(e) => updateValue("lastName", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                  {errors.lastName && (
                    <span className="text-[11px] text-rose-600 sm:ml-2">{errors.lastName}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Title:</label>
                  <input
                    type="text"
                    value={values.title || ""}
                    onChange={(e) => updateValue("title", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Email Address:</label>
                  <input
                    type="email"
                    value={values.contactEmail || ""}
                    onChange={(e) => updateValue("contactEmail", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                  {errors.contactEmail && (
                    <span className="text-[11px] text-rose-600 sm:ml-2">{errors.contactEmail}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">LinkedIn Page URL:</label>
                  <input
                    type="url"
                    value={values.linkedinUrl || ""}
                    onChange={(e) => updateValue("linkedinUrl", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
              </div>
            </div>

            {/* COMPANY INFO */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-xs tracking-wider uppercase mb-2">
                COMPANY INFO
              </h2>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Company Name:</label>
                  <input
                    type="text"
                    value={values.firmName || ""}
                    onChange={(e) => updateValue("firmName", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                  {errors.firmName && (
                    <span className="text-[11px] text-rose-600 sm:ml-2">{errors.firmName}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Company Website:</label>
                  <input
                    type="url"
                    value={values.website || ""}
                    onChange={(e) => updateValue("website", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div className="w-40 shrink-0">
                    <label className="text-xs text-gray-800 block">Headquarters Location:</label>
                    <span className="text-[10px] text-gray-500 block leading-tight">(type town below to find)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter a location..."
                    value={values.headquarters || ""}
                    onChange={(e) => updateValue("headquarters", e.target.value)}
                    className="w-full sm:w-72 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
              </div>
            </div>

            {/* INVESTING PARTNERS */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-xs tracking-wider uppercase mb-3">
                INVESTING PARTNERS
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-gray-800 sm:max-w-md">
                    How would you characterize the background of your investing partners?
                  </label>
                  <select
                    value={values.investorBackground || ""}
                    onChange={(e) => updateValue("investorBackground", e.target.value)}
                    className="w-full sm:w-64 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">Please select...</option>
                    <option value="Angel investors raising a blind pool">Angel investors raising a blind pool</option>
                    <option value="Experienced fund managers">Experienced fund managers</option>
                    <option value="Corporate investment professionals">Corporate investment professionals</option>
                    <option value="Family office investors">Family office investors</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-gray-800">
                    How many investing partners are men?
                  </label>
                  <select
                    value={values.partnerMen || ""}
                    onChange={(e) => updateValue("partnerMen", e.target.value)}
                    className="w-full sm:w-64 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-gray-800">
                    How many investing partners are women?
                  </label>
                  <select
                    value={values.partnerWomen || ""}
                    onChange={(e) => updateValue("partnerWomen", e.target.value)}
                    className="w-full sm:w-64 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-gray-800">
                    How many investing partners are another gender identity?
                  </label>
                  <select
                    value={values.partnerOtherGender || ""}
                    onChange={(e) => updateValue("partnerOtherGender", e.target.value)}
                    className="w-full sm:w-64 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Racial and ethnic identities checkboxes */}
              <div className="mb-5">
                <p className="text-xs text-gray-800 mb-2">
                  Please share the racial and ethnic identities of your investing partners. (check all that apply)
                </p>
                <div className="space-y-1.5 pl-1 text-xs text-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEthnicities.includes("White")}
                      onChange={() => toggleEthnicity("White")}
                      className="h-3.5 w-3.5 accent-[#1B365D]"
                    />
                    <span>White</span>
                  </label>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={selectedEthnicities.includes("BIPOC")}
                        onChange={() => toggleEthnicity("BIPOC")}
                        className="h-3.5 w-3.5 accent-[#1B365D]"
                      />
                      <span>BIPOC</span>
                    </label>
                    <div className="pl-6 pt-1 space-y-1">
                      {[
                        "Black or African American",
                        "American Indian or Native Alaskan",
                        "Middle Eastern or North African",
                        "Asian or Asian American",
                        "Hispanic, Latino, or Spanish Origin",
                        "Native Hawaiian or Pacific Islander",
                      ].map((eth) => (
                        <label key={eth} className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <input
                            type="checkbox"
                            checked={selectedEthnicities.includes(eth)}
                            onChange={() => toggleEthnicity(eth)}
                            className="h-3.5 w-3.5 accent-[#1B365D]"
                          />
                          <span>{eth}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEthnicities.includes("Another race or ethnicity not listed above")}
                      onChange={() => toggleEthnicity("Another race or ethnicity not listed above")}
                      className="h-3.5 w-3.5 accent-[#1B365D]"
                    />
                    <span>Another race or ethnicity not listed above</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEthnicities.includes("I prefer not to answer this question")}
                      onChange={() => toggleEthnicity("I prefer not to answer this question")}
                      className="h-3.5 w-3.5 accent-[#1B365D]"
                    />
                    <span>I prefer not to answer this question</span>
                  </label>
                </div>
              </div>

              {/* Ownership percentage */}
              <div className="mb-6">
                <p className="text-xs text-gray-800 mb-2">
                  What percentage of your firm (based on total AUM) is owned by:{" "}
                  <span className="text-[#1F5FBF] cursor-pointer hover:underline">[who can see this?]</span>
                </p>
                <div className="space-y-2 pl-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.ownershipMen || ""}
                        onChange={(e) => updateValue("ownershipMen", e.target.value)}
                        className="w-16 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                      />
                      <span className="text-xs text-gray-700">%</span>
                    </div>
                    <label className="text-xs text-gray-800">Men</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.ownershipWomen || ""}
                        onChange={(e) => updateValue("ownershipWomen", e.target.value)}
                        className="w-16 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                      />
                      <span className="text-xs text-gray-700">%</span>
                    </div>
                    <label className="text-xs text-gray-800">Women</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={values.ownershipOtherGender || ""}
                        onChange={(e) => updateValue("ownershipOtherGender", e.target.value)}
                        className="w-16 h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                      />
                      <span className="text-xs text-gray-700">%</span>
                    </div>
                    <label className="text-xs text-gray-800">Another gender identity</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE 2 OF 5 ==================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[#1B365D] font-bold text-sm tracking-wide uppercase mb-1">
                COMPANY FOCUS & HISTORY
              </h1>
              <p className="text-[#333333] text-xs leading-relaxed">
                Provide detailed information about your firm&apos;s strategy and track record.
              </p>
            </div>

            <div className="space-y-4">
              {step2Fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  {field.section && (
                    <div className="pt-3 pb-1 border-b border-gray-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                        {field.section}
                      </h3>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="sm:max-w-md">
                      <label className="text-xs font-medium text-gray-800 block">
                        {field.label}
                      </label>
                      {field.helpText && (
                        <span className="text-[10px] text-gray-500 block">{field.helpText}</span>
                      )}
                    </div>

                    <div className="w-full sm:w-72">
                      {field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={values[field.name] || ""}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full text-xs border border-gray-400 rounded-[2px] p-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={values[field.name] || ""}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                          className="w-full h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                        >
                          <option value="">Please select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === "checks" ? (
                        <div className="space-y-1 text-xs">
                          {field.options?.map((opt) => {
                            const arr = (values[field.name] || "").split(",").filter(Boolean);
                            return (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={arr.includes(opt)}
                                  onChange={(e) =>
                                    updateValue(
                                      field.name,
                                      e.target.checked
                                        ? [...arr, opt].join(",")
                                        : arr.filter((x) => x !== opt).join(",")
                                    )
                                  }
                                  className="h-3.5 w-3.5 accent-[#1B365D]"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={values[field.name] || ""}
                          onChange={(e) => updateValue(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full h-[26px] text-xs border border-gray-400 rounded-[2px] px-2 bg-white text-gray-800 focus:outline-none focus:border-[#1B365D]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAGE 3 OF 5 ==================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[#1B365D] font-bold text-sm tracking-wide uppercase mb-1">
                DECK & TRACK RECORD
              </h1>
              <p className="text-[#333333] text-xs leading-relaxed">
                Provide your pitch deck and historical performance data for the Selection Committee.
              </p>
            </div>
            <DeckTrackRecordStep value={trackRecord} onChange={setTrackRecord} />
          </div>
        )}

        {/* ==================== PAGE 4 OF 5 ==================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[#1B365D] font-bold text-sm tracking-wide uppercase mb-1">
                PORTFOLIO HIGHLIGHTS
              </h1>
              <p className="text-[#333333] text-xs leading-relaxed">
                Showcase up to three standout portfolio companies to highlight your investment strategy and performance.
              </p>
            </div>
            <PortfolioHighlightsStep
              companies={portfolioCompanies}
              onChange={setPortfolioCompanies}
            />
          </div>
        )}

        {/* ==================== PAGE 5 OF 5 ==================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-[#1B365D] font-bold text-sm tracking-wide uppercase mb-1">
                REVIEW & SUBMISSION
              </h1>
              <p className="text-[#333333] text-xs leading-relaxed">
                Review your profile information and confirm it is ready to submit to the Selection Committee.
              </p>
            </div>
            <FinalSubmissionStep value={finalSubmission} onChange={setFinalSubmission} />
          </div>
        )}

        {/* ==================== BOTTOM ACTION BUTTONS ==================== */}
        <div className="mt-10 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-[2px] border border-gray-400 bg-white px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 mr-2"
              >
                &lt; Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveForLater}
              className="rounded-[2px] border border-gray-400 bg-gray-100 px-4 py-1.5 text-xs font-normal text-gray-800 hover:bg-gray-200"
            >
              Save for Later
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="rounded-[2px] bg-[#2d9ab7] px-6 py-1.5 text-xs font-semibold text-white hover:bg-[#258399] shadow-sm"
            >
              {currentStep === 4 ? "Submit Application" : "Next >"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
