/**
 * Nexa Project - Onsite Field Sales Domain Types
 * Tammlo Sales - Specialized Lead Management for Nexa E-Commerce & Omnichannel Retail Platform
 */

export type NexaVerticalType =
  | "FASHION_APPAREL"
  | "RESTAURANTS_CAFES"
  | "SUPERMARKET_GROCERY"
  | "ELECTRONICS_APPLIANCES"
  | "BEAUTY_COSMETICS"
  | "HOME_FURNITURE"
  | "PHARMACY_HEALTH"
  | "GENERAL_RETAIL"
  | "OTHER";

export type NexaCommerceModel =
  | "ONLINE_ONLY"
  | "RETAIL_STORES_ONLY"
  | "OMNICHANNEL"
  | "SOCIAL_COMMERCE"
  | "OTHER";

export type NexaCurrentSystem =
  | "NONE_EXCEL"
  | "SHOPIFY"
  | "WOOCOMMERCE"
  | "SALLA_ZID"
  | "LOCAL_POS"
  | "CUSTOM"
  | "OTHER";

export type NexaBranchesCount = "1" | "2-3" | "4-6" | "7-10" | "10+";

export type NexaOrderVolume =
  | "UNDER_100"
  | "100_500"
  | "500_2000"
  | "OVER_2000";

export type NexaPlanInterest =
  | "STARTER"
  | "GROWTH"
  | "ENTERPRISE"
  | "OMNICHANNEL_POS"
  | "AGENCY_MANAGED";

export type NexaInterestLevel = "HOT" | "WARM" | "COLD";

export type NexaDecisionMakerRole =
  | "OWNER"
  | "GM"
  | "STORE_MANAGER"
  | "ECOMMERCE_HEAD"
  | "MARKETING_HEAD"
  | "OPERATIONS"
  | "OTHER";

export type NexaLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface NexaLead {
  id: string;
  business_id: string; // e.g. NXA-00001
  brand_name: string; // اسم المتجر / البراند
  contact_name: string; // اسم التاجر / الشخص المسؤول
  contact_role: NexaDecisionMakerRole;
  phone: string; // رقم الهاتف / واتساب
  phone_normalized: string;
  alternative_phone?: string | null;
  email?: string | null;
  store_url?: string | null; // رابط المتجر الإلكتروني أو صفحة السوشيال الحالية
  city: string; // المدينة / المحافظة
  area: string; // المنطقة / الحي
  address?: string | null;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
  gps_maps_url?: string | null;
  vertical_type: NexaVerticalType;
  commerce_model: NexaCommerceModel;
  current_system: NexaCurrentSystem;
  monthly_order_volume?: NexaOrderVolume | null;
  branches_count: NexaBranchesCount;
  plan_interest: NexaPlanInterest;
  interest_level: NexaInterestLevel;
  estimated_budget?: number | null;
  next_action?: string | null;
  next_action_date?: string | null;
  notes?: string | null;
  sales_rep_id?: string | null;
  sales_rep_name?: string | null;
  status: NexaLeadStatus;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NexaFilterParams {
  query?: string;
  interest_level?: NexaInterestLevel | "ALL";
  vertical_type?: NexaVerticalType | "ALL";
  status?: NexaLeadStatus | "ALL";
  sales_rep_id?: string;
  city?: string;
}

export interface NexaMetrics {
  totalLeads: number;
  hotLeadsCount: number;
  totalBranchesCount: number;
  estimatedPipelineValue: number;
  demosScheduledCount: number;
}
