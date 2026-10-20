/**
 * Coffex Project - Onsite Field Sales Domain Types
 * Nile Nexus Sales - Specialized Lead Management for Specialty Coffee, Cafes & Roasteries
 */

export type CoffexActivityType =
  | "SPECIALTY_CAFE"
  | "COMMERCIAL_CAFE"
  | "ROASTERY"
  | "COFFEE_KIOSK"
  | "BAKERY_CAFE"
  | "SUPPLIER"
  | "RESTAURANT_CAFE"
  | "OTHER";

export type CoffexCurrentSystem =
  | "NONE"
  | "FOODICS"
  | "QUICK_POS"
  | "PRODELAND"
  | "LEGACY_POS"
  | "CUSTOM"
  | "OTHER";

export type CoffexBranchesCount = "1" | "2-3" | "4-6" | "7-10" | "10+";

export type CoffexDailyVolume = "UNDER_100" | "100_300" | "300_600" | "OVER_600";

export type CoffexInterestLevel = "HOT" | "WARM" | "COLD";

export type CoffexDecisionMakerRole =
  | "OWNER"
  | "GM"
  | "BRANCH_MANAGER"
  | "HEAD_BARISTA"
  | "PURCHASING"
  | "OTHER";

export type CoffexLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface CoffexLead {
  id: string;
  business_id: string; // e.g. CFX-00001
  brand_name: string; // اسم الكافيه / البراند
  contact_name: string; // اسم الشخص المقابل
  contact_role: CoffexDecisionMakerRole;
  phone: string; // رقم الهاتف / واتساب
  phone_normalized: string;
  alternative_phone?: string | null;
  email?: string | null;
  city: string; // المدينة
  area: string; // المنطقة / الحي
  address?: string | null;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
  gps_maps_url?: string | null;
  activity_type: CoffexActivityType;
  branches_count: CoffexBranchesCount;
  current_system: CoffexCurrentSystem;
  daily_orders_volume?: CoffexDailyVolume | null;
  interested_modules: string[];
  interest_level: CoffexInterestLevel;
  estimated_budget?: number | null;
  next_action?: string | null;
  next_action_date?: string | null;
  notes?: string | null;
  sales_rep_id?: string | null;
  sales_rep_name?: string | null;
  status: CoffexLeadStatus;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoffexFilterParams {
  query?: string;
  interest_level?: CoffexInterestLevel | "ALL";
  activity_type?: CoffexActivityType | "ALL";
  status?: CoffexLeadStatus | "ALL";
  sales_rep_id?: string;
  city?: string;
}

export interface CoffexMetrics {
  totalLeads: number;
  hotLeadsCount: number;
  totalBranchesCount: number;
  estimatedPipelineValue: number;
  demosScheduledCount: number;
}
