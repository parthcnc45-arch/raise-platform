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

export type FundPerformance = {
  id: string;
  name: string;
  type: string;
  vintage: string;
  size: string;
  called: string;
  dpi: string;
  rvpi: string;
  netIrr: string;
};

export type TrackRecordData = {
  deckFileName: string;
  firmType: "existing" | "new";
  funds: FundPerformance[];
  supplementalInfo: string;
};

export type PortfolioCompany = {
  id: string;
  companyName: string;
  website: string;
  investmentYear: string;
  entryStage: string;
  totalInvested: string;
  ownership: string;
  commentary: string;
  expanded: boolean;
};

export type FinalSubmissionData = {
  databaseListing: "public" | "private";
  companyLogoName: string;
  headshotName: string;
  headline: string;
  executiveSummary: string;
  allowDeckAccess: boolean;
  allowTrackRecordAccess: boolean;
};
