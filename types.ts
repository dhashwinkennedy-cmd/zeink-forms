
export enum FieldType {
  HEADING = 'heading',
  NORMAL_TEXT = 'normal_text',
  MEDIA = 'media',
  EMAIL = 'email',
  PHONE = 'phone',
  MCQ = 'mcq',
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  DATE = 'date'
}

export enum FormStatus {
  DRAFT = 'Draft',
  LIVE = 'Live',
  EXPIRED = 'Expired',
  PAUSED = 'Paused'
}

export enum AIApproveMode {
  NONE = 'none',
  AUTO = 'auto',
  PROMPT = 'prompt'
}

export enum UserTier {
  FREE = 'free',
  PRO = 'pro'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  credits_monthly: number;
  credits_bonus: number;
  tier: UserTier;
  reset_date: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  points: number;
  mediaUrl?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  title: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  options?: Option[];
  allowOther?: boolean;
  otherAnswers?: string[];
  autoAIEval?: boolean;
  maxChars?: number;
  minChars?: number;
  aiEvalMode?: AIApproveMode;
  aiPrompt?: string;
  aiTagging?: boolean;
  negativeMarking?: boolean;
  correctAnswers?: string[];
  otpVerification?: boolean;
  points?: number;
}

export interface FormPage {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSettings {
  allowCopyPaste: boolean;
  isPublicSurvey: boolean;
  whitelist: string[];
  blacklist: string[];
  accessMode: 'whitelist' | 'blacklist' | 'none';
  resultReveal: 'instant' | 'scheduled' | 'approval';
  revealDate?: string;
  allowRevisit: boolean;
  admins: { email: string; canEdit: boolean }[];
}

export interface FormSchema {
  id: string;
  creatorId: string;
  title: string;
  subtitle: string;
  bannerUrl?: string;
  status: FormStatus;
  pages: FormPage[];
  settings: FormSettings;
  createdAt: number;
  responseCount: number;
  expiryDate?: string;
  cost_per_response: number;
  resultsReleased?: boolean;
}
