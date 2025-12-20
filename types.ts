
export type FieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'MCQ' | 'ONE_LINE' | 'LONG_TEXT' | 'SECTION_BREAK';

export interface Media {
  type: 'image' | 'video';
  url: string;
  title?: string;
  width?: number;
  size?: number;
}

export interface MCQOption {
  id: string;
  label: string;
  isCorrect: boolean;
  points: number;
  media?: Media;
  isOther?: boolean;
}

export type AIMode = 'NONE' | 'AUTO_EVAL' | 'PROMPT_BASED';

export interface AISettings {
  mode: AIMode;
  prompt?: string;
  semanticEval?: boolean;
  taggingEnabled?: boolean;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  subtitle?: string;
  required: boolean;
  points: number;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  charLimit?: number;
  minCharLimit?: number;
  maxCharLimit?: number;
  verifyWithOTP?: boolean;
  options?: MCQOption[];
  correctAnswers?: string[];
  aiSettings?: AISettings;
  media?: Media;
  hasOtherOption?: boolean;
}

export interface RedirectionLogic {
  condition: 'SCORE_GREATER' | 'SCORE_LESS' | 'ALWAYS';
  value: number;
  action: 'GO_TO_PAGE' | 'GO_TO_LINK' | 'SUBMIT';
  target: string;
}

export interface Page {
  id: string;
  title: string;
  fields: Field[];
  navigationControl: {
    allowRevisiting: boolean;
  };
  redirectionLogics: RedirectionLogic[];
}

export interface FormSettings {
  access: 'PUBLIC' | 'PRIVATE';
  whitelist: string[];
  blocklist: string[];
  expiryEnabled: boolean;
  expiryAt?: number;
  results: {
    showAfterSubmission: boolean;
    scheduled: boolean;
    showAfterApproval: boolean;
  };
}

export interface Form {
  id: string;
  title: string;
  subtitle: string;
  bannerUrl: string;
  pages: Page[];
  settings: FormSettings;
  createdAt: number;
  responsesCount: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: number;
  updatedAt?: number;
}

export interface Answer {
  fieldId: string;
  value: any;
  pointsEarned: number;
  aiEvaluation?: {
    marks: number;
    reason: string;
    tag: string;
  };
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentUid: string;
  submittedAt: number;
  answers: Answer[];
  totalScore: number;
  respondentEmail?: string;
}
