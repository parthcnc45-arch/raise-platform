"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Check } from "lucide-react";
import CompanyFocusStep from "./CompanyFocusStep";
import DeckTrackRecordStep, { emptyFund } from "./DeckTrackRecordStep";
import PortfolioHighlightsStep, { emptyPortfolioCompany } from "./PortfolioHighlightsStep";
import FinalSubmissionStep from "./FinalSubmissionStep";
import ProfilePreviewStep from "./ProfilePreviewStep";
import WizardStepper from "./WizardStepper";
import { toList } from "./formUi";
import type { FinalSubmissionData, PortfolioCompany, TrackRecordData } from "./types";

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
    ownershipWhite: "",
    ownershipBipoc: "",
    ownershipOtherRace: "",
    teamAlsoIncludes: "",
    investmentStages: "",
    investmentThesis: "",
    thematicFocus: "",
    aiYear: "",
    aiPercent: "",
    hasGeoFocus: "",
    geoFocus: "",
    totalCommittedCapital: "",
    firstInvestmentYear: "",
    blindPoolFunds: "",
    spvs: "",
    fundraisingTiming: "",
    targetFundSize: "",
    minCheckSize: "",
    expectedFinalClose: "",
    serviceLegal: "",
    serviceFundAdmin: "",
    serviceTax: "",
    serviceAudit: "",
    serviceCompliance: "",
    serviceInsurance: "",
    hasCfo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [trackRecord, setTrackRecord] = useState<TrackRecordData>(() => ({
    deckFileName: "",
    performanceOption: "",
    numberOfFunds: "",
    funds: Array.from({ length: 10 }, (_, i) => emptyFund(`fund-${i}`)),
    supplementalInfo: "",
  }));

  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>(() =>
    Array.from({ length: 3 }, (_, i) => emptyPortfolioCompany(`portfolio-${i}`))
  );

  const [finalSubmission, setFinalSubmission] = useState<FinalSubmissionData>({
    publishOption: "",
    companyLogoName: "",
    headshotName: "",
    headline: "",
    executiveSummary: "",
    shareDeck: "",
  });

  useEffect(() => {
    // Attempt to load saved draft from localStorage
    const saved = localStorage.getItem("gp_app_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Older drafts only stored the flat page 1-2 values
        const draft = parsed.values ? parsed : { values: parsed };
        if (draft.values) setValues((prev) => ({ ...prev, ...draft.values }));
        if (draft.trackRecord) setTrackRecord((prev) => ({ ...prev, ...draft.trackRecord }));
        if (Array.isArray(draft.portfolioCompanies) && draft.portfolioCompanies.length === 3) {
          setPortfolioCompanies(draft.portfolioCompanies);
        }
        if (draft.finalSubmission) setFinalSubmission((prev) => ({ ...prev, ...draft.finalSubmission }));
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
      localStorage.setItem(
        "gp_app_draft",
        JSON.stringify({
          values,
          trackRecord,
          portfolioCompanies,
          // blob: preview URLs only live for this page load, so they are not saved
          finalSubmission: { ...finalSubmission, companyLogoUrl: undefined, headshotUrl: undefined },
        })
      );
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
      if (!values.presenterOption) nextErrors.presenterOption = "Presenter option choice is required.";
      if (!values.title?.trim()) nextErrors.title = "Title is required.";
      if (!values.headquarters?.trim()) nextErrors.headquarters = "Headquarters location is required.";
      if (!values.investorBackground) nextErrors.investorBackground = "Investment team background is required.";
      if (!values.partnerMen) nextErrors.partnerMen = "Team gender composition is required.";
      if (!values.partnerWomen) nextErrors.partnerWomen = "Team gender composition is required.";
      if (!values.partnerOtherGender) nextErrors.partnerOtherGender = "Team gender composition is required.";

      // Ownership groups must add up to 100% when any value is entered (matches the official form)
      const sumGroup = (keys: string[]) => {
        const raw = keys.map((k) => (values[k] || "").trim().replace("%", ""));
        if (raw.every((v) => v === "")) return 100;
        return raw.reduce((total, v) => total + (Number(v) || 0), 0);
      };
      if (sumGroup(["ownershipMen", "ownershipWomen", "ownershipOtherGender"]) !== 100) {
        nextErrors.ownershipMen = "Gender ownership must add up to 100%";
      }
      if (sumGroup(["ownershipWhite", "ownershipBipoc", "ownershipOtherRace"]) !== 100) {
        nextErrors.ownershipWhite = "Race and ethnicity ownership must add up to 100%";
      }
    }

    if (currentStep === 1) {
      const isThematic = values.investmentThesis === "Investment Theme";
      const themes = toList(values.thematicFocus);
      if (isThematic && (themes.length < 1 || themes.length > 4)) {
        nextErrors.thematicFocus = "Funds with an Investment Theme must select from 1-4 focus areas.";
      }
      if (isThematic && themes.includes("AI")) {
        if (!values.aiYear) nextErrors.aiYear = "When you started investing in AI is required.";
        if (!values.aiPercent) nextErrors.aiPercent = "Percentage of AI in your portfolio is required.";
      }
      if (values.fundraisingTiming === "In Market Now") {
        if (!values.minCheckSize) nextErrors.minCheckSize = "Min check size is required.";
        if (!values.expectedFinalClose) nextErrors.expectedFinalClose = "Estimated final close date required.";
      }
    }

    if (currentStep === 2 && !trackRecord.deckFileName) {
      nextErrors.deck = "All applications must contain a fundraising or marketing deck.";
    }

    if (currentStep === 4) {
      if (!finalSubmission.publishOption) {
        nextErrors.publishOption = "Emerging Manager Database choice is required.";
      }
      if (finalSubmission.publishOption === "Yes" && !finalSubmission.shareDeck) {
        nextErrors.shareDeck = "Deck share settings required.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (currentStep === 4) {
      if (finalSubmission.publishOption === "Yes") {
        // Publishing to the Emerging Manager Database goes through the Profile Review page first
        setPreviewing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitted(true);
      }
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

  if (previewing && !submitted) {
    return (
      <ProfilePreviewStep
        values={values}
        trackRecord={trackRecord}
        finalSubmission={finalSubmission}
        companyName={values.firmName || company || ""}
        contactName={`${values.firstName || ""} ${values.lastName || ""}`.trim()}
        onBack={() => {
          setPreviewing(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSubmit={() => setSubmitted(true)}
      />
    );
  }

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
            className="rounded-md bg-[#2d9ab7] px-5 py-2 text-xs font-semibold text-white hover:bg-[#258399]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    // zoom scales the whole form so it matches the dashboard container (max-w-5xl = 1024px): 853px x 1.2 = ~1024px
    <div
      style={{ zoom: 1.2 }}
      className="mx-auto w-full max-w-[853px] px-4 py-6 sm:px-6 md:py-8 font-sans text-[#333333]"
    >
      {/* Progress */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <WizardStepper currentStep={currentStep} />
      </div>

      {/* Top Page Indicator */}
      <div className="flex items-center justify-between mb-3 min-h-[24px]">
        {saveMessage ? (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            {saveMessage}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[#1F5FBF] text-[11px] font-bold tracking-wider uppercase">
          PAGE {currentStep + 1} OF 5
        </span>
      </div>

      <form
        noValidate
        onSubmit={handleNext}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        {/* ==================== PAGE 1 OF 5 ==================== */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {/* WELCOME SECTION */}
            <div>
              <h1 className="text-[#1B365D] font-bold text-[15px] tracking-wide uppercase mb-2 pb-1.5 border-b-2 border-[#2d9ab7]/40">
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
              <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">
                PRESENTER OPTION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-8 text-[#333333] text-xs leading-relaxed">
                  If you are invited to attend RAISE, do you want to present your fund to the attending LPs on the
                  main stage at the event? Please note, space is limited and not everyone who applies can present.
                  The Limited Partner Selection Committee selects the presenters.
                </div>
                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <select
                    value={values.presenterOption || ""}
                    onChange={(e) => updateValue("presenterOption", e.target.value)}
                    className="w-full md:w-52 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  >
                    <option value="">Please select...</option>
                    <option value="Yes">Yes - I want to present if selected</option>
                    <option value="No">No - Not this year</option>
                  </select>
                  {errors.presenterOption && (
                    <span className="text-[11px] text-rose-600 ml-2">{errors.presenterOption}</span>
                  )}
                </div>
              </div>
            </div>

            {/* REFERRED BY */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">
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
                className="w-full h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
              />
            </div>

            {/* PRIMARY CONTACT */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">
                PRIMARY CONTACT
              </h2>
              <p className="text-[#333333] text-xs leading-relaxed mb-3">
                Owing to space constraints, only one partner from each fund can attend the RAISE event. This partner
                will be listed as the attendee, included in the Emerging Manager Database (if you opt-in), and designated
                as the Presenter (if selected). Please provide the following details for the partner from your firm to be listed.
              </p>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">First Name:</label>
                  <input
                    type="text"
                    value={values.firstName || ""}
                    onChange={(e) => updateValue("firstName", e.target.value)}
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  />
                  {errors.title && <span className="text-[11px] text-rose-600 sm:ml-2">{errors.title}</span>}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Email Address:</label>
                  <input
                    type="email"
                    value={values.contactEmail || ""}
                    onChange={(e) => updateValue("contactEmail", e.target.value)}
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  />
                </div>
              </div>
            </div>

            {/* COMPANY INFO */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">
                COMPANY INFO
              </h2>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-40 text-xs text-gray-800 shrink-0">Company Name:</label>
                  <input
                    type="text"
                    value={values.firmName || ""}
                    onChange={(e) => updateValue("firmName", e.target.value)}
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div className="w-40 shrink-0">
                    <label className="text-xs text-gray-800 block">Headquarters Location:</label>
                    <span className="text-[10px] text-gray-500 block leading-tight">(type then select from list)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter a location..."
                    value={values.headquarters || ""}
                    onChange={(e) => updateValue("headquarters", e.target.value)}
                    className="w-full sm:w-72 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  />
                  {errors.headquarters && <span className="text-[11px] text-rose-600 sm:ml-2">{errors.headquarters}</span>}
                </div>
              </div>
            </div>

            {/* INVESTING PARTNERS */}
            <div>
              <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">
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
                    className="w-full sm:w-64 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  >
                    <option value="">Please select...</option>
                    <option value="Experienced venture capitalists">Experienced venture capitalists</option>
                    <option value="Experienced operators or entrepreneurs">Experienced operators or entrepreneurs</option>
                    <option value="A combination of operators and venture capitalists">A combination of operators and venture capitalists</option>
                    <option value="Prior Angel investors">Angel investors raising a blind pool</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.investorBackground && (
                    <span className="text-[11px] text-rose-600 sm:ml-2">{errors.investorBackground}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-gray-800">
                    How many investing partners are men?
                  </label>
                  <select
                    value={values.partnerMen || ""}
                    onChange={(e) => updateValue("partnerMen", e.target.value)}
                    className="w-full sm:w-64 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5", "6+"].map((n) => (
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
                    className="w-full sm:w-64 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5", "6+"].map((n) => (
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
                    className="w-full sm:w-64 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                  >
                    <option value="">Please select...</option>
                    {["0", "1", "2", "3", "4", "5", "6+"].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(errors.partnerMen || errors.partnerWomen || errors.partnerOtherGender) && (
                <p className="text-[11px] text-rose-600 -mt-3 mb-4">Team gender composition is required.</p>
              )}

              {/* Racial and ethnic identities checkboxes */}
              <div className="mb-5">
                <p className="text-xs text-gray-800 mb-2">
                  Please share the racial and ethnic identities of your investing partners.{" "}
                  <span className="text-[10px] text-gray-500">(check all that apply)</span>
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
                        "Hispanic, Latinx, or Spanish Origin",
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
                        className="w-16 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                        className="w-16 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
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
                        className="w-16 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                      />
                      <span className="text-xs text-gray-700">%</span>
                    </div>
                    <label className="text-xs text-gray-800">Other gender identity</label>
                  </div>
                </div>
              </div>

              {errors.ownershipMen && (
                <p className="text-[11px] text-rose-600 -mt-4 mb-4">{errors.ownershipMen}</p>
              )}

              {/* Ownership percentage by race / ethnicity */}
              <div className="mb-6">
                <p className="text-xs text-gray-800 mb-2">
                  What percentage of your firm (based on total AUM) is owned by:{" "}
                  <span className="text-[#1F5FBF] cursor-pointer hover:underline">[who can see this?]</span>
                </p>
                <div className="space-y-2 pl-1">
                  {[
                    { key: "ownershipWhite", label: "White" },
                    { key: "ownershipBipoc", label: "BIPOC (based on categories above)" },
                    { key: "ownershipOtherRace", label: "Other racial or ethnic group" },
                  ].map((row) => (
                    <div key={row.key} className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={values[row.key] || ""}
                          onChange={(e) => updateValue(row.key, e.target.value)}
                          className="w-16 h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20"
                        />
                        <span className="text-xs text-gray-700">%</span>
                      </div>
                      <label className="text-xs text-gray-800">{row.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {errors.ownershipWhite && (
                <p className="text-[11px] text-rose-600 -mt-4 mb-4">{errors.ownershipWhite}</p>
              )}

              {/* Team also includes */}
              <div className="mb-6">
                <p className="text-xs text-gray-800 mb-2">
                  My team also includes:{" "}
                  <span className="text-[10px] text-gray-500">(check all that apply)</span>
                </p>
                <div className="space-y-1.5 pl-1 text-xs text-gray-800">
                  {["Military Veterans", "LGBTQ+"].map((item) => {
                    const selected = (values.teamAlsoIncludes || "").split(",").filter(Boolean);
                    return (
                      <label key={item} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.includes(item)}
                          onChange={(e) =>
                            updateValue(
                              "teamAlsoIncludes",
                              (e.target.checked ? [...selected, item] : selected.filter((x) => x !== item)).join(",")
                            )
                          }
                          className="h-3.5 w-3.5 accent-[#1B365D]"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE 2 OF 5 ==================== */}
        {currentStep === 1 && (
          <CompanyFocusStep values={values} errors={errors} onChange={updateValue} />
        )}

        {/* ==================== PAGE 3 OF 5 ==================== */}
        {currentStep === 2 && (
          <DeckTrackRecordStep value={trackRecord} onChange={setTrackRecord} deckError={errors.deck} />
        )}

        {/* ==================== PAGE 4 OF 5 ==================== */}
        {currentStep === 3 && (
          <PortfolioHighlightsStep companies={portfolioCompanies} onChange={setPortfolioCompanies} />
        )}

        {/* ==================== PAGE 5 OF 5 ==================== */}
        {currentStep === 4 && (
          <FinalSubmissionStep
            value={finalSubmission}
            onChange={setFinalSubmission}
            companyName={values.firmName || company || ""}
            contactName={`${values.firstName || ""} ${values.lastName || ""}`.trim()}
            errors={errors}
          />
        )}

        {/* ==================== BOTTOM ACTION BUTTONS ==================== */}
        <div className="mt-10 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-md border border-slate-300 bg-white px-5 py-2 text-xs font-semibold uppercase text-slate-700 shadow-sm transition hover:bg-slate-50 mr-2"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveForLater}
              className="rounded-md border border-slate-300 bg-slate-100 px-5 py-2 text-xs font-semibold uppercase text-slate-700 shadow-sm transition hover:bg-slate-200"
            >
              Save for Later
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="rounded-md bg-[#2d9ab7] px-7 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#258399] focus:outline-none focus:ring-2 focus:ring-[#2d9ab7]/40"
            >
              {currentStep < 4
                ? "Save & Continue"
                : finalSubmission.publishOption === "Yes"
                  ? "Preview Profile"
                  : "Submit Application"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
