"use client";

import { Fragment, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Download, LayoutDashboard, LogIn, Mail, SearchCheck, Save } from "lucide-react";
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

const steps: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Welcome Act One Ventures",
    description: "Your profile for the 2025 RAISE Global Summit has been submitted. Use this form to edit and update your profile.",
    fields: [
      { name: "referredBy", label: "Referred by", placeholder: "Enter name and email address", section: "Referred By", sectionDescription: "If you were referred to RAISE by another member of the community, please let the Selection Committee know who referred you by listing their name and email below.", wide: true },
      { name: "firstName", label: "First name", placeholder: "First name", section: "Primary Contact", sectionDescription: "Owing to space constraints, only one partner from each fund can attend the RAISE event. This partner will be listed as the attendee, included in the Emerging Manager Database (if you opt in), and designated as the presenter (if selected). Please provide the following details for the partner from your firm to be listed.", required: true },
      { name: "lastName", label: "Last name", placeholder: "Last name", required: true },
      { name: "title", label: "Title", placeholder: "e.g. General Partner", required: true },
      { name: "contactEmail", label: "Email address", placeholder: "name@yourfirm.com", type: "email" as const, required: true },
      { name: "linkedinUrl", label: "LinkedIn page URL", placeholder: "https://linkedin.com/in/your-profile", type: "url" as const, wide: true },
      { name: "firmName", label: "Company name", placeholder: "Your firm name", section: "Company Info", required: true, wide: true },
      { name: "website", label: "Company website", placeholder: "www.yourfirm.com", type: "url" as const, wide: true },
      { name: "headquarters", label: "Headquarters location", placeholder: "City, State, Country", required: true, wide: true },
      { name: "investorBackground", label: "How would you characterize the background of your investing partners?", type: "select" as const, section: "Investing Partners", required: true, wide: true, options: ["Angel investors raising a blind pool", "Experienced fund managers", "Corporate investment professionals", "Family office investors", "Other"] },
      { name: "partnerMen", label: "Number of partners who are men", placeholder: "0", type: "number" as const },
      { name: "partnerWomen", label: "Number of partners who are women", placeholder: "0", type: "number" as const },
      { name: "partnerOtherGender", label: "Number of partners who are another gender", placeholder: "0", type: "number" as const },
      { name: "partnerEthnicities", label: "Racial and ethnic identities represented among investing partners", type: "checks" as const, wide: true, options: ["White", "Black or African American", "American Indian or Native Alaskan", "Middle Eastern or North African", "Asian or Asian American", "Hispanic, Latino, or Spanish origin", "Other", "Prefer not to say"] },
      { name: "ownershipMen", label: "Firm ownership by men (%)", placeholder: "0", type: "number" as const },
      { name: "ownershipWomen", label: "Firm ownership by women (%)", placeholder: "0", type: "number" as const },
      { name: "ownershipOtherGender", label: "Firm ownership by another gender (%)", placeholder: "0", type: "number" as const },
      { name: "ownershipWhite", label: "Firm ownership by White partners (%)", placeholder: "0", type: "number" as const },
      { name: "ownershipBipoc", label: "Firm ownership by BIPOC partners (%)", placeholder: "0", type: "number" as const },
      { name: "teamIdentity", label: "My team also includes", type: "checks" as const, wide: true, options: ["Military veterans", "LGBTQ+"] },
    ],
  },
  {
    title: "Company Focus & History",
    description: "Provide detailed information about your firm’s strategy and track record.",
    fields: [
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
    ],
  },
  {
    title: "Deck & Track Record",
    description: "Provide your pitch deck and historical performance data for the Selection Committee. Professional and accurate data ensures a faster review process.",
    fields: [],
  },
  {
    title: "Portfolio Highlights",
    description: "Showcase up to three standout portfolio companies to highlight your investment strategy, performance, and the unique value proposition of your fund.",
    fields: [],
  },
  {
    title: "Review & Submission",
    description: "Review the information and confirm it is ready to share.",
    fields: [
      { name: "additionalNotes", label: "Additional notes", placeholder: "Anything else you would like the RAISE team to know", type: "textarea" as const, wide: true },
    ],
  },
];

type GPApplicationWizardProps = {
  applicantName: string;
  company?: string;
  email: string;
  onGoDashboard: () => void;
};

export default function GPApplicationWizard({ applicantName, company, email, onGoDashboard }: GPApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({
    firmName: company || "",
    firstName: applicantName.split(" ")[0] || "",
    lastName: applicantName.split(" ").slice(1).join(" "),
    contactEmail: email,
    investmentStages: "Pre-Seed,Seed",
    globalFocus: "Yes, Globally Agnostic",
    fundraisingStatus: "In Market (Open)",
    targetFundSize: "50.00",
    minimumCheckSize: "$250k - $500k",
    expectedFinalClose: "Q1 2025",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [trackRecord, setTrackRecord] = useState<TrackRecordData>(() => ({
    deckFileName: "Act_One_Fund_II_Deck.pdf",
    firmType: "existing",
    funds: [
      { id: "sample-fund", name: "Act One Fund I", type: "Venture Capital", vintage: "2019", size: "50.0", called: "95", dpi: "0.85x", rvpi: "2.10x", netIrr: "32.5%" },
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
  const [draftSaved, setDraftSaved] = useState(false);

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    for (const field of steps[currentStep].fields) {
      if (field.required && !values[field.name]?.trim()) nextErrors[field.name] = `${field.label} is required`;
      if (field.type === "email" && values[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.name])) nextErrors[field.name] = "Enter a valid email address";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;
    if (currentStep === steps.length - 1) setSubmitted(true);
    else setCurrentStep((step) => step + 1);
  };

  const current = steps[currentStep];
  const completion = Math.round(((currentStep + 1) / steps.length) * 100);

  if (submitted) {
    return (
      <div className="w-full space-y-6 text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">RAISE Partner Workspace <span className="mx-1.5 text-slate-300">/</span> My Application</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Application Submitted</h1></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Complete</span></div>
        <section className="rounded-2xl border border-slate-200/90 bg-white px-5 py-8 text-center shadow-sm sm:px-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"><Check className="h-7 w-7" strokeWidth={3} /></span>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Application Submitted Successfully</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Thank you for your submission, <span className="font-semibold text-blue-600">{values.firmName || company || "your firm"}</span>. Our Selection Committee will review your application for the 2025 RAISE Global Summit.</p>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ClipboardCheck className="h-4 w-4 text-blue-600" /> What happens next?</h2></div>
          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><SearchCheck className="h-4 w-4" /></span><div><h3 className="text-xs font-bold text-slate-900">Review Period</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">The committee will vet all applications over the next 4 weeks.</p></div></div>
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Mail className="h-4 w-4" /></span><div><h3 className="text-xs font-bold text-slate-900">Email Notification</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">You will receive a decision via email by November 15th.</p></div></div>
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><LogIn className="h-4 w-4" /></span><div><h3 className="text-xs font-bold text-slate-900">Portal Access</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">You can log back in at any time to update your public database profile.</p></div></div>
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={onGoDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"><LayoutDashboard className="h-4 w-4" /> Go to Dashboard</button><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Download className="h-4 w-4" /> Download Submission PDF</button></div>
        <p className="text-center text-xs text-slate-500">Questions? Visit our <a href="mailto:support@raiseglobal.com?subject=RAISE%20Help%20Center" className="text-blue-600 hover:underline">Help Center</a> or contact support at <a href="mailto:support@raiseglobal.com" className="text-blue-600 hover:underline">support@raiseglobal.com</a></p>
        <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">© 2025 RAISE Global Summit. All rights reserved.</footer>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-medium text-slate-500">RAISE Partner Workspace <span className="mx-1.5 text-slate-300">/</span> My Application</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Application</h1><p className="mt-1 text-sm text-slate-500">Complete your firm profile and application details.</p></div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"><Save className="h-4 w-4 text-blue-600" /> Draft preview</span>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-800">Step {currentStep + 1} of {steps.length}: {current.title}</span><span className="font-bold text-blue-700">{completion}%</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${completion}%` }} /></div>
        <div className="mt-4 hidden grid-cols-5 gap-2 sm:grid">
          {steps.map((step, index) => <div key={step.title} className={`truncate text-[10px] font-medium ${index <= currentStep ? "text-blue-700" : "text-slate-400"}`}>{index + 1}. {step.title}</div>)}
        </div>
      </div>

      <form noValidate onSubmit={handleNext} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {currentStep !== 3 && currentStep !== 4 && <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ClipboardCheck className="h-5 w-5" /></span><div><h2 className="text-base font-bold text-slate-900">{current.title}</h2><p className="mt-1 text-xs text-slate-500">{current.description}</p></div></div></div>}
        {currentStep === 2 ? (
          <div className="p-5 sm:p-7"><DeckTrackRecordStep value={trackRecord} onChange={setTrackRecord} /></div>
        ) : currentStep === 3 ? (
          <div className="p-5 sm:p-7"><PortfolioHighlightsStep companies={portfolioCompanies} onChange={(companies) => { setPortfolioCompanies(companies); setDraftSaved(false); }} /></div>
        ) : currentStep === 4 ? (
          <div className="p-5 sm:p-7"><FinalSubmissionStep value={finalSubmission} onChange={setFinalSubmission} /></div>
        ) : <div className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-7">
          {current.fields.map((field) => (
            <Fragment key={field.name}>
              {field.section && <div className="border-b border-slate-100 pb-2 sm:col-span-2"><h3 className="text-xs font-bold uppercase tracking-wide text-blue-800">{field.section}</h3>{field.sectionDescription && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{field.sectionDescription}</p>}</div>}
              <div className={field.wide || field.type === "checks" ? "sm:col-span-2" : ""}>
              <label className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-700">{field.label}{field.required && <span className="ml-1 text-rose-500">*</span>}{field.helpText && <button type="button" title={field.helpText} className="text-[10px] font-medium text-blue-600 hover:text-blue-800">ⓘ What is this?</button>}</label>
              {field.type === "textarea" ? (
                <textarea rows={4} value={values[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} placeholder={field.placeholder} className={`w-full resize-y rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors[field.name] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"}`} />
              ) : field.type === "select" ? (
                <select value={values[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none focus:ring-2 ${errors[field.name] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"}`}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>
              ) : field.type === "checks" ? (
                <div className="grid gap-2 sm:grid-cols-3">{field.options?.map((option) => { const selected = (values[field.name] || "").split(",").filter(Boolean); return <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs ${selected.includes(option) ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600"}`}><input type="checkbox" checked={selected.includes(option)} onChange={(event) => updateValue(field.name, event.target.checked ? [...selected, option].join(",") : selected.filter((item) => item !== option).join(","))} className="h-4 w-4 accent-blue-700" />{option}</label>; })}</div>
              ) : (
                <input type={field.type || "text"} value={values[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} placeholder={field.placeholder} className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors[field.name] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"}`} />
              )}
              {errors[field.name] && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors[field.name]}</p>}
              </div>
            </Fragment>
          ))}
          {currentStep === steps.length - 1 && <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-slate-700 sm:col-span-2">Please confirm that the information provided in this application is accurate and may be reviewed by the RAISE team.</div>}
        </div>}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-7 ${currentStep === 4 ? "border-blue-600 bg-blue-700" : "border-slate-100 bg-slate-50/70"}`}>
          <button type="button" disabled={currentStep === 0} onClick={() => { setCurrentStep((step) => Math.max(0, step - 1)); setErrors({}); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${currentStep === 4 ? "border border-white/30 bg-white/10 text-white hover:bg-white/20" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}><ArrowLeft className="h-4 w-4" /> Back</button>
          {currentStep === 3 ? <button type="button" onClick={() => setDraftSaved(true)} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">{draftSaved ? "Draft saved locally" : "Save Draft"}</button> : currentStep !== 4 ? <span className="text-[11px] text-slate-400">Your progress is kept in this page preview.</span> : null}
          <button type="submit" className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition ${currentStep === 4 ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-700 text-white hover:bg-blue-800"}`}>{currentStep === steps.length - 1 ? "Submit Final Application" : `Save & Continue to Page ${currentStep + 2}`}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  );
}
