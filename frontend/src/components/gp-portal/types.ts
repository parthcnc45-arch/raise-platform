export type GPApplication = {
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  event_id?: string;
  event_name?: string | null;
  eventName?: string;
  event?: string | { name?: string } | Array<{ name?: string }>;
  events?: { name?: string } | Array<{ name?: string }>;
  created_at?: string;
  createdAt?: string;
};

export type FirmUser = {
  name: string;
  email: string;
  role: string;
};

export type TrackRecordFund = {
  id: string;
  name: string;
  type: string;
  vintage: string;
  asOf: string;
  size: string;
  called: string;
  dpi: string;
  rvpi: string;
  netIrr: string;
};

export type TrackRecordData = {
  deckFileName: string;
  performanceOption: "" | "Operating Firm" | "First Time Fund";
  numberOfFunds: string;
  funds: TrackRecordFund[];
  supplementalInfo: string;
};

export type PortfolioCompany = {
  id: string;
  companyName: string;
  website: string;
  stage: string;
  status: string;
  firstInvestmentYear: string;
  firstInvestmentAmount: string;
  initialOwnership: string;
  totalInvested: string;
  currentOwnership: string;
  boardSeat: string;
  comment: string;
};

export type FinalSubmissionData = {
  publishOption: "" | "Yes" | "No";
  companyLogoName: string;
  // Local browser preview URLs (blob:), never persisted in the saved draft
  companyLogoUrl?: string;
  headshotName: string;
  headshotUrl?: string;
  headline: string;
  executiveSummary: string;
  shareDeck: "" | "Yes" | "No";
};
