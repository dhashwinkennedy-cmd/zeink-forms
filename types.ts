
export enum BlockType {
  TEXT_MEDIA = 'TEXT_MEDIA',
  VERIFICATION = 'VERIFICATION',
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MCQ = 'MCQ',
  INFO = 'INFO'
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED'
}

export interface MCQOption {
  id: string;
  text: string;
  points: number;
  isCorrect: boolean;
  mediaUrl?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  required: boolean;
  // Verification specific
  verifyOTP?: boolean;
  charLimit?: number;
  // AI Grading
  aiEnabled: boolean;
  correctAnswer?: string;
  gradingPrompt?: string;
  gradingMode?: 'context' | 'prompt' | 'tagging';
  // MCQ specific
  options?: MCQOption[];
  negativeMarking?: boolean;
  allowOther?: boolean;
  validationLocked?: boolean;
  totalPoints?: number;
}

export interface Form {
  id: string;
  title: string;
  subtitle: string;
  bannerUrl?: string;
  status: FormStatus;
  responseCount: number;
  expiryDate?: string;
  blocks: Block[];
  settings: {
    allowRevisit: boolean;
    redirectionRules: { condition: string; targetPage: number }[];
  };
  createdAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  formName: string;
  score: number;
  totalPossible: number;
  submittedAt: string;
  status: 'graded' | 'pending';
}
