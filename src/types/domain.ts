/**
 * Core domain types for Nile Nexus Sales.
 * These types define the business domain model used throughout the application.
 * Database types (generated from Supabase) may differ slightly — these are the
 * application-layer types.
 */

// ─── User Roles ────────────────────────────────────────────────
export type UserRole = "GM" | "ADMIN" | "SALES";

export interface Profile {
  id: string; // UUID — matches auth.users.id
  email: string;
  full_name: string;
  employee_id: string | null; // Business identifier (e.g., "EMP-001")
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  preferred_locale: "ar" | "en";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Client Types ──────────────────────────────────────────────
export type ClientType = "COMPANY" | "INDIVIDUAL";

export interface Client {
  id: string;
  business_id: string; // e.g., "CLIENT-00001"
  name: string;
  type: ClientType;
  area: string | null;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  source: string | null;
  account_owner_id: string | null;
  notes: string | null;
  archived_at: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  job_title: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Potential Client ──────────────────────────────────────────
export type PotentialClientStatus =
  | "NEW"
  | "RESEARCHING"
  | "RESEARCHED"
  | "CONVERTED"
  | "ARCHIVED";

export interface PotentialClient {
  id: string;
  business_id: string; // e.g., "PC-00001"
  name: string;
  area: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  source: string | null;
  research_owner_id: string;
  status: PotentialClientStatus;
  notes: string | null;
  converted_client_id: string | null;
  archived_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type OpportunityIndicator =
  | "WEBSITE"
  | "ECOMMERCE"
  | "SOCIAL_MEDIA"
  | "BRANDING"
  | "ERP_SYSTEM"
  | "MARKETING"
  | "MOBILE_APP"
  | "OTHER";

// ─── Deal / Pipeline ───────────────────────────────────────────
export type DealStage =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "LATER";

export interface Deal {
  id: string;
  business_id: string; // e.g., "DEAL-00001"
  title: string;
  client_id: string;
  sales_owner_id: string;
  stage: DealStage;
  estimated_value: string | null; // Stored as decimal string for precision
  currency: string;
  final_value: string | null;
  lost_reason: string | null;
  lost_notes: string | null;
  resurface_date: string | null;
  won_date: string | null;
  notes: string | null;
  archived_at: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Activity ──────────────────────────────────────────────────
export type ActivityType =
  | "CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "MEETING"
  | "VISIT"
  | "NOTE"
  | "PROPOSAL"
  | "STAGE_CHANGE"
  | "FOLLOW_UP"
  | "SYSTEM";

export interface Activity {
  id: string;
  type: ActivityType;
  actor_id: string;
  client_id: string | null;
  deal_id: string | null;
  summary: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Follow-up ─────────────────────────────────────────────────
export type FollowUpStatus = "PENDING" | "COMPLETED" | "POSTPONED" | "CANCELLED";

export interface FollowUp {
  id: string;
  client_id: string;
  deal_id: string | null;
  responsible_id: string;
  due_at: string;
  action: string;
  notes: string | null;
  status: FollowUpStatus;
  completion_result: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Task ──────────────────────────────────────────────────────
export type TaskPriority = "NORMAL" | "IMPORTANT" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface Task {
  id: string;
  title: string;
  client_id: string | null;
  deal_id: string | null;
  assignee_id: string;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Service ───────────────────────────────────────────────────
export interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  internal_reference_price: string | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Proposal ──────────────────────────────────────────────────
export type ProposalStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "READY"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "SUPERSEDED";

export interface Proposal {
  id: string;
  business_id: string; // e.g., "NN-Q-00001"
  client_id: string;
  deal_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  status: ProposalStatus;
  subtotal: string;
  discount_amount: string;
  discount_percentage: string | null;
  tax_amount: string;
  grand_total: string;
  currency: string;
  valid_until: string | null;
  delivery_duration: string | null;
  payment_terms: string | null;
  terms_and_conditions: string | null;
  notes: string | null;
  prepared_by: string;
  approved_by: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface ProposalItem {
  id: string;
  proposal_version_id: string;
  service_id: string | null;
  description_ar: string;
  description_en: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
  sort_order: number;
}

// ─── Approval ──────────────────────────────────────────────────
export type ApprovalType = "DISCOUNT" | "PROPOSAL" | "OTHER";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export interface Approval {
  id: string;
  type: ApprovalType;
  entity_type: string;
  entity_id: string;
  requester_id: string;
  approver_id: string | null;
  status: ApprovalStatus;
  reason: string | null;
  decision_notes: string | null;
  metadata: Record<string, unknown> | null;
  decided_at: string | null;
  created_at: string;
}

// ─── Notification ──────────────────────────────────────────────
export type NotificationCategory = "ACTION_REQUIRED" | "UPDATE";

export interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── Finance Handoff ───────────────────────────────────────────
export type HandoffStatus = "PENDING" | "READY" | "SENT" | "ACKNOWLEDGED";

export interface FinanceHandoff {
  id: string;
  client_id: string;
  deal_id: string;
  final_value: string;
  currency: string;
  accepted_proposal_id: string | null;
  accepted_version_id: string | null;
  agreement_date: string;
  salesperson_id: string;
  notes: string | null;
  status: HandoffStatus;
  created_at: string;
  updated_at: string;
}

// ─── Audit Log ─────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
