"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createProposalSchema,
  createProposalVersionSchema,
  updateProposalVersionStatusSchema,
  filterProposalsSchema,
  type CreateProposalInput,
  type CreateProposalVersionInput,
  type UpdateProposalVersionStatusInput,
  type FilterProposalsInput,
  type ProposalStatus,
} from "@/lib/schemas/proposal";
import type { Proposal, ProposalVersion, ProposalItem, Client, Deal } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface ProposalVersionWithItems extends ProposalVersion {
  items: ProposalItem[];
  prepared_by_user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface ProposalWithRelations extends Proposal {
  client?: Pick<Client, "id" | "name" | "business_id" | "phone" | "email"> | null;
  deal?: Pick<Deal, "id" | "title" | "business_id" | "stage" | "estimated_value"> | null;
  current_version?: ProposalVersionWithItems | null;
  versions?: ProposalVersionWithItems[];
}

export interface PaginatedProposalsResult {
  items: ProposalWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Calculates financials for a proposal version
 */
function calculateFinancials(
  items: Array<{ quantity: number; unit_price: number }>,
  discountPercentage?: number | null,
  discountAmountInput?: number | null,
  taxPercentage: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  let discountAmount = 0;
  if (discountPercentage && discountPercentage > 0) {
    discountAmount = (subtotal * discountPercentage) / 100;
  } else if (discountAmountInput && discountAmountInput > 0) {
    discountAmount = discountAmountInput;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (taxPercentage || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal: subtotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    discountPercentage: discountPercentage ? discountPercentage.toString() : null,
    taxAmount: taxAmount.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
  };
}

/**
 * Fetch proposals with filters and pagination
 */
export async function getProposals(
  filters: FilterProposalsInput = {}
): Promise<ActionResult<PaginatedProposalsResult>> {
  try {
    const parsed = filterProposalsSchema.parse(filters);
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, email),
        deal:deals!deal_id(id, title, business_id, stage, estimated_value),
        versions:proposal_versions(
          id, version_number, status, subtotal, discount_amount, tax_amount, grand_total, currency, created_at
        )
      `,
        { count: "exact" }
      );

    if (parsed.client_id) {
      query = query.eq("client_id", parsed.client_id);
    }
    if (parsed.deal_id) {
      query = query.eq("deal_id", parsed.deal_id);
    }
    if (parsed.query && parsed.query.trim()) {
      query = query.ilike("business_id", `%${parsed.query.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });

    const from = (parsed.page - 1) * parsed.pageSize;
    const to = from + parsed.pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) {
      return { success: false, error: error.message };
    }

    const items = ((data || []) as unknown as ProposalWithRelations[]).map((p) => {
      // Find latest version
      const sortedVersions = (p.versions || []).sort(
        (a, b) => b.version_number - a.version_number
      );
      return {
        ...p,
        current_version: sortedVersions[0] || null,
        versions: sortedVersions,
      };
    });

    // If filtered by status, filter in memory or join
    const filteredItems = parsed.status
      ? items.filter((p) => p.current_version?.status === parsed.status)
      : items;

    const total = count || 0;
    const totalPages = Math.ceil(total / parsed.pageSize) || 1;

    return {
      success: true,
      data: {
        items: filteredItems,
        total,
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load proposals") };
  }
}

/**
 * Fetch a single proposal by ID with all versions and items
 */
export async function getProposalById(
  id: string
): Promise<ActionResult<ProposalWithRelations>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, email),
        deal:deals!deal_id(id, title, business_id, stage, estimated_value),
        versions:proposal_versions(
          *,
          prepared_by_user:profiles!prepared_by(id, full_name, email),
          items:proposal_items(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Proposal not found" };
    }

    const proposal = data as unknown as ProposalWithRelations;
    const sortedVersions = (proposal.versions || []).sort(
      (a, b) => b.version_number - a.version_number
    );

    return {
      success: true,
      data: {
        ...proposal,
        current_version: sortedVersions[0] || null,
        versions: sortedVersions,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load proposal details") };
  }
}

/**
 * Create a new proposal with initial Version 1 and items
 */
export async function createProposal(
  input: CreateProposalInput
): Promise<ActionResult<ProposalWithRelations>> {
  try {
    const validated = createProposalSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Generate Business ID
    let businessId = `PROP-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      const { data: generatedId, error: genErr } = await supabase.rpc(
        "generate_business_id",
        { p_prefix: "PROP", p_table: "proposals" }
      );
      if (!genErr && generatedId) {
        businessId = generatedId;
      }
    } catch {
      // fallback
    }

    // 1. Insert proposal record
    const { data: proposal, error: propErr } = await supabase
      .from("proposals")
      .insert({
        business_id: businessId,
        client_id: validated.client_id,
        deal_id: validated.deal_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (propErr || !proposal) {
      return { success: false, error: propErr?.message || "Failed to create proposal" };
    }

    // 2. Financial calculation
    const calc = calculateFinancials(
      validated.items,
      validated.discount_percentage,
      validated.discount_amount,
      validated.tax_percentage
    );

    // 3. Insert Version 1
    const { data: version, error: verErr } = await supabase
      .from("proposal_versions")
      .insert({
        proposal_id: proposal.id,
        version_number: 1,
        status: "DRAFT" as ProposalStatus,
        subtotal: calc.subtotal,
        discount_amount: calc.discountAmount,
        discount_percentage: calc.discountPercentage,
        tax_amount: calc.taxAmount,
        grand_total: calc.grandTotal,
        currency: validated.currency || "EGP",
        valid_until: validated.valid_until || null,
        delivery_duration: validated.delivery_duration || null,
        payment_terms: validated.payment_terms || null,
        terms_and_conditions: validated.terms_and_conditions || null,
        notes: validated.notes || null,
        prepared_by: user.id,
      })
      .select()
      .single();

    if (verErr || !version) {
      return { success: false, error: verErr?.message || "Failed to create proposal version" };
    }

    // 4. Insert Items
    const itemsRows = validated.items.map((item, index) => ({
      proposal_version_id: version.id,
      service_id: item.service_id || null,
      description_ar: item.description_ar,
      description_en: item.description_en || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: (item.quantity * item.unit_price).toFixed(2),
      sort_order: item.sort_order ?? index,
    }));

    await supabase.from("proposal_items").insert(itemsRows);

    // 5. Activity Log
    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      client_id: validated.client_id,
      deal_id: validated.deal_id,
      summary: `إنشاء عرض سعر جديد (${businessId} - الإصدار 1) بقيمة ${calc.grandTotal} ${validated.currency}`,
      metadata: { proposal_id: proposal.id, version_id: version.id },
    });

    revalidatePath("/proposals");
    revalidatePath(`/clients/${validated.client_id}`);
    revalidatePath(`/deals/${validated.deal_id}`);

    return {
      success: true,
      data: proposal as unknown as ProposalWithRelations,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create proposal") };
  }
}

/**
 * Create a new version of an existing proposal (v2, v3, etc.)
 */
export async function createProposalVersion(
  input: CreateProposalVersionInput
): Promise<ActionResult<ProposalVersionWithItems>> {
  try {
    const validated = createProposalVersionSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get current max version number
    const { data: versions, error: fetchErr } = await supabase
      .from("proposal_versions")
      .select("version_number")
      .eq("proposal_id", validated.proposal_id)
      .order("version_number", { ascending: false })
      .limit(1);

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    const nextVersionNumber = (versions?.[0]?.version_number || 1) + 1;

    const calc = calculateFinancials(
      validated.items,
      validated.discount_percentage,
      validated.discount_amount,
      validated.tax_percentage
    );

    const { data: newVersion, error: verErr } = await supabase
      .from("proposal_versions")
      .insert({
        proposal_id: validated.proposal_id,
        version_number: nextVersionNumber,
        status: "DRAFT" as ProposalStatus,
        subtotal: calc.subtotal,
        discount_amount: calc.discountAmount,
        discount_percentage: calc.discountPercentage,
        tax_amount: calc.taxAmount,
        grand_total: calc.grandTotal,
        currency: validated.currency || "EGP",
        valid_until: validated.valid_until || null,
        delivery_duration: validated.delivery_duration || null,
        payment_terms: validated.payment_terms || null,
        terms_and_conditions: validated.terms_and_conditions || null,
        notes: validated.notes || null,
        prepared_by: user.id,
      })
      .select()
      .single();

    if (verErr || !newVersion) {
      return { success: false, error: verErr?.message || "Failed to create new version" };
    }

    const itemsRows = validated.items.map((item, index) => ({
      proposal_version_id: newVersion.id,
      service_id: item.service_id || null,
      description_ar: item.description_ar,
      description_en: item.description_en || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: (item.quantity * item.unit_price).toFixed(2),
      sort_order: item.sort_order ?? index,
    }));

    await supabase.from("proposal_items").insert(itemsRows);

    revalidatePath(`/proposals/${validated.proposal_id}`);

    return {
      success: true,
      data: newVersion as unknown as ProposalVersionWithItems,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create proposal version") };
  }
}

/**
 * Update Proposal Version status (SENT, ACCEPTED, REJECTED, etc.)
 * Strictly enforces business rule: once SENT or ACCEPTED, version cannot be changed back to DRAFT!
 */
export async function updateProposalVersionStatus(
  input: UpdateProposalVersionStatusInput
): Promise<ActionResult> {
  try {
    const validated = updateProposalVersionStatusSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: currentVersion, error: currentErr } = await supabase
      .from("proposal_versions")
      .select("id, proposal_id, version_number, status, grand_total, currency")
      .eq("id", validated.version_id)
      .single();

    if (currentErr || !currentVersion) {
      return { success: false, error: "Proposal version not found" };
    }

    // Business rule: Once accepted, it cannot be downgraded
    if (currentVersion.status === "ACCEPTED" && validated.status !== "ACCEPTED") {
      return {
        success: false,
        error: "عرض السعر المعتمد والمقبول غير قابل للتعديل طبقاً للائحة المالية",
      };
    }

    const updatePayload: Record<string, unknown> = {
      status: validated.status,
    };

    if (validated.status === "SENT") {
      updatePayload.sent_at = new Date().toISOString();
    }

    const { error: updateErr } = await supabase
      .from("proposal_versions")
      .update(updatePayload)
      .eq("id", validated.version_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Activity log
    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      summary: `تحديث حالة عرض السعر إلى (${validated.status}) للإصدار ${currentVersion.version_number}`,
      notes: validated.notes || null,
      metadata: {
        proposal_id: currentVersion.proposal_id,
        version_id: currentVersion.id,
        status: validated.status,
      },
    });

    revalidatePath("/proposals");
    revalidatePath(`/proposals/${currentVersion.proposal_id}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update proposal status") };
  }
}
