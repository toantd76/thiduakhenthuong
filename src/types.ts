export type RoleType = 'personal' | 'department_head' | 'school_board' | 'admin';

export type AccountStatus = 'pending_verification' | 'activated' | 'locked';

export interface Personnel {
  id: string; // Internal unique ID (NV01, NV02, ...)
  stt: number;
  fullName: string;
  birthDate: string; // dd/mm/yyyy
  gender: 'Nam' | 'Nữ';
  specialty: string;
  currentPosition: string;
  department: string;
  cccd: string; // String to preserve leading 0
  roles: RoleType[];
  accountStatus: AccountStatus;
  needsPasswordChange: boolean;
  failedLoginAttempts: number;
  notes?: string;
}

export type RegistrationStatus =
  | 'not_registered'
  | 'draft'
  | 'submitted'
  | 'revision_requested'
  | 'approved'
  | 'locked';

export type TaskCategory = 'chung' | 'giao_vien' | 'can_bo_quan_ly' | 'nhan_vien';

export type TargetType = 'quantitative' | 'qualitative' | 'not_applicable';

export type TargetDirection = 'higher_better' | 'lower_better' | 'binary' | 'none';

export type CompletionLevel =
  | 'not_updated'
  | 'completed'
  | 'exceeded'
  | 'partially_completed'
  | 'not_completed'
  | 'not_applicable';

export interface DepartmentReview {
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  comment: string;
  suggestedStatus: 'agree' | 'request_revision' | 'reject';
}

export interface BoardEvaluation {
  evaluatorId: string;
  evaluatorName: string;
  evaluatedAt: string;
  status: 'verified' | 'rejected' | 'pending';
  comment: string;
}

export interface EmulationItem {
  id: string;
  criterionId: string;
  category: TaskCategory;
  title: string;
  targetDescription: string;
  unitAndMethod: string;
  targetType: TargetType;
  targetDirection: TargetDirection;
  targetValue: string;
  deadline: string;
  expectedProof: string;
  actualResult: string;
  actualValue: string;
  actualProofDescription: string;
  proofUrl: string;
  proofConfidential: boolean; // Minh chứng chứa dữ liệu học sinh hoặc thông tin cá nhân
  completionRate: number | null; // % tỷ lệ hoàn thành nếu định lượng
  completionLevel: CompletionLevel;
  selfAssessmentNote: string;
  departmentReview?: DepartmentReview;
  boardEvaluation?: BoardEvaluation;
}

export interface SelfEvaluation {
  selfProposedRating: string; // Hoàn thành xuất sắc / tốt / hoàn thành / không hoàn thành
  selfProposedTitle: string; // Lao động tiên tiến / Chiến sĩ thi đua cơ sở / ...
  selfProposedAward: string; // Giấy khen / Bằng khen / ...
  summarySelfReport: string;
  submittedAt: string;
}

export interface DepartmentRecommendation {
  reviewerId: string;
  reviewerName: string;
  recommendedRating: string;
  recommendedTitle: string;
  recommendedAward: string;
  comment: string;
  status: 'recommended' | 'revision_requested';
  updatedAt: string;
}

export interface OfficialRecognition {
  decisionNumber: string;
  decisionDate: string;
  issuingAuthority: string;
  recognizedDutyRating: string;
  recognizedTitle: string;
  recognizedAward: string;
  isPublished: boolean;
  attachmentName?: string;
  publishedAt?: string;
  notes?: string;
}

export interface ReopenHistory {
  reopenedAt: string;
  reopenedBy: string;
  reopenedByName: string;
  reason: string;
}

export interface EmulationRegistration {
  id: string; // e.g. REG_2026_NV01
  personnelId: string;
  academicYear: string;
  status: RegistrationStatus;
  registeredTitle: string;
  registeredAward: string;
  registeredDutyTarget: string;
  items: EmulationItem[];
  selfEvaluation?: SelfEvaluation;
  departmentRecommendation?: DepartmentRecommendation;
  officialRecognition?: OfficialRecognition;
  reopenHistory: ReopenHistory[];
  versionsCount: number;
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  updatedAt: string;
}

export interface CriterionTemplate {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  unitAndMethod: string;
  targetType: TargetType;
  targetDirection: TargetDirection;
  defaultTargetValue: string;
  expectedProofSuggestion: string;
  isMandatory: boolean;
  applicablePositions?: string[]; // Empty means all in category
}

export interface LegalCitation {
  id: string;
  title: string;
  docNumber: string;
  issueDate: string;
  effectiveDate: string;
  issuingAuthority: string;
  relevantArticles: string;
  sourceUrl: string;
  verificationStatus: 'verified' | 'pending_verification';
  notes: string;
}

export interface EmulationTitleConfig {
  id: string;
  name: string;
  type: 'emulation_title' | 'duty_rating' | 'award';
  legalCitationId: string;
  criteriaSummary: string;
  applicableScope: string;
  approvalAuthority: string;
  isActive: boolean;
  verificationStatus: 'verified' | 'pending_verification';
}

export interface SchoolYearConfig {
  year: string; // "2026-2027"
  registrationDeadline: string; // "2026-10-15"
  supplementDeadline: string; // "2026-10-31"
  evaluationDeadline: string; // "2027-05-25"
  status: 'active' | 'archived';
  allowRegistrationEdit: boolean;
  allowResultUpdate: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    fullName: string;
    department: string;
    currentPosition: string;
    specialty: string;
    roles: RoleType[];
    cccd: string; // masked in UI if needed
    needsPasswordChange: boolean;
    accountStatus: AccountStatus;
  };
}
