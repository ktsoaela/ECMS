export interface CampaignSummary {
  id: number;
  name: string;
  subject: string;
  recipient_count: number;
  status: string;
  created_at: string;
}

export interface CampaignRecipient {
  recipient_email: string;
  status: string;
}

export interface CampaignDetail extends CampaignSummary {
  body: string;
  recipients: CampaignRecipient[];
}

export interface CampaignCreatePayload {
  name: string;
  subject: string;
  body: string;
  recipient_emails: string[];
}

export interface CampaignCreateResponse {
  campaign_id: number;
  recipient_count: number;
  status: string;
}

export interface ApiValidationError {
  error: string;
  details: Record<string, string>;
}
