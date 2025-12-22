
export type FieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'MCQ' | 'SHORT_TEXT' | 'LONG_TEXT' | 'ONE_LINE';

export interface Media {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

export interface MCQOption {
  id: string;
  label: string;
  points: number;
  isCorrect?: boolean;
  isOther?: boolean;
  media?: Media;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  subtitle?: string;
  required: boolean;
  points: number;
  options?: MCQOption[];
  aiPrompt?: string; // For LONG_TEXT evaluation
  media?: Media;
  negativeMarking?: boolean;
  negativeMarkingValue?: number;
  aiSettings?: {
    mode: 'NONE' | 'EVALUATE';
    prompt?: string;
  };
}

export interface Page {
  id: string;
  title: string;
  fields: Field[];
  navigationControl?: {
    allowRevisiting: boolean;
  };
  redirectionLogics?: any[];
}

export interface Form {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  bannerUrl?: string;
  pages: Page[];
  status: 'draft' | 'published';
  createdAt: number;
  updatedAt?: number;
  ownerId: string;
  responsesCount: number;
  settings?: {
    results: {
      showAfterSubmission: boolean;
    };
  };
}

export interface Answer {
  fieldId: string;
  value: any;
  pointsEarned: number;
  aiFeedback?: string;
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
  answers: Answer[];
  totalScore: number;
  submittedAt: number;
}
