export type Role = "EMPLOYEE" | "APPROVER" | "ADMIN";

export type DeclarationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type ActivityType =
  | "INTERNAL"
  | "EXTERNAL_MEAL"
  | "GIFT"
  | "RECREATIONAL"
  | "SPONSORSHIP"
  | "FACILITATION"
  | "ENTERTAINMENT";

export interface Employee {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  entityId: string;
  entityName: string;
  positionId: string;
  positionName: string;
  sbuName: string;
  department: string;
  organizationId?: string;
  organizationName?: string;
  managerEmployeeId?: string;
  managerName?: string;
  isActive: boolean;
}

export interface OrganizationNode {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  children?: OrganizationNode[];
}

export interface User {
  id: string;
  username: string;
  employeeId: string;
  role: Role;
  employee: Employee;
}

export interface ExternalPartyInfo {
  companyName: string;
  relationship: string;
  projectCode: string;
  projectCodeId?: string;
  costControlEmployeeId?: string;
  costControlName?: string;
  costControlEmail?: string;
  activityCategory: string;
}

export interface ProjectCode {
  id: string;
  code: string;
  name?: string;
  department: string;
  sbu?: string;
}

export interface RadiantEmployeeParticipant {
  employeeId: string;
  fullName: string;
  positionName: string;
  entityName: string;
}

export interface InternalActivityDetail {
  date: string;
  description: string;
  mealType: string;
  totalAmount: number;
  participantCount?: number;
  radiantEmployees?: RadiantEmployeeParticipant[];
}

export interface ExternalMealDetail {
  date: string;
  location: string;
  purpose: string;
  summaryMeeting?: string;
  participantCount: number;
  radiantEmployees: RadiantEmployeeParticipant[];
  totalAmount: number;
}

export interface GiftDetail {
  date: string;
  description: string;
  giftReason: string;
  quantity: number;
  estimatedPrice: number;
}

export interface RecreationalDetail {
  date: string;
  location: string;
  purpose: string;
  participantCount: number;
  radiantEmployees: RadiantEmployeeParticipant[];
  totalAmount: number;
}

export interface SponsorshipDetail {
  date: string;
  sponsorshipReason: string;
  sponsorshipAmount: number;
}

export interface FacilitationDetail {
  date: string;
  facilitationReason: string;
  facilitationAmount: number;
}

export interface EntertainmentDetail {
  entertainmentType: string;
  date: string;
  entertainmentReason: string;
  entertainmentVenue: string;
}

export type ActivityDetailMap = {
  INTERNAL: InternalActivityDetail;
  EXTERNAL_MEAL: ExternalMealDetail;
  GIFT: GiftDetail;
  RECREATIONAL: RecreationalDetail;
  SPONSORSHIP: SponsorshipDetail;
  FACILITATION: FacilitationDetail;
  ENTERTAINMENT: EntertainmentDetail;
};

export interface DeclarationIdentity {
  employeeId: string;
  fullName: string;
  email: string;
  entity: string;
  position: string;
  sbu: string;
  department: string;
  organizationHierarchy?: string;
  managerName?: string;
  activityType: ActivityType;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
}

export interface Declaration {
  id: string;
  declarationNumber: string;
  expenseNumber?: string;
  status: DeclarationStatus;
  createdDate: string;
  submittedDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documentCode: string;
  identity: DeclarationIdentity;
  externalParty: ExternalPartyInfo;
  activityDetail: Partial<
    InternalActivityDetail &
      ExternalMealDetail &
      GiftDetail &
      RecreationalDetail &
      SponsorshipDetail &
      FacilitationDetail &
      EntertainmentDetail
  >;
  attachments?: Attachment[];
  declarationAccepted: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  employeeId: string;
  module: string;
  action: string;
  recordId: string;
  description: string;
}

export interface DeclarationFilter {
  status?: string;
  activityType?: string;
  dateFrom?: string;
  dateTo?: string;
  projectCode?: string;
  entity?: string;
  searchQuery?: string;
}

export interface ReportSummary {
  totalDeclaration: number;
  totalDraft: number;
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalAmount: number;
}
