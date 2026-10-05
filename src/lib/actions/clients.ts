"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createClientSchema,
  updateClientSchema,
  contactSchema,
  filterClientsSchema,
  type CreateClientInput,
  type UpdateClientInput,
  type ContactInput,
  type FilterClientsInput,
} from "@/lib/schemas/client";
import { normalizePhoneNumber } from "@/lib/schemas/potential-client";
import type { Client, Contact, Deal } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface ClientWithRelations extends Omit<Client, "source"> {
  account_owner?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  contacts?: Contact[];
  deals?: Deal[];
  source?: {
    id: string;
    name_ar: string;
    name_en: string;
  } | null;
}

export interface PaginatedClientsResult {
  items: ClientWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * Fetch paginated clients with search, type filter, and relations
 */
export async function getClients(
  filters: Partial<FilterClientsInput> = {}
): Promise<ActionResult<PaginatedClientsResult>> {
  try {
    const parsed = filterClientsSchema.parse(filters);
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("clients")
      .select(
        `
        *,
        account_owner:profiles!account_owner_id(id, full_name, email),
        source:lead_sources(id, name_ar, name_en),
        contacts(id, name, job_title, phone, whatsapp, email, is_primary)
      `,
        { count: "exact" }
      )
      .is("archived_at", null);

    if (parsed.type) {
      query = query.eq("type", parsed.type);
    }

    if (parsed.account_owner_id) {
      query = query.eq("account_owner_id", parsed.account_owner_id);
    }

    if (parsed.query && parsed.query.trim()) {
      const q = parsed.query.trim();
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,business_id.ilike.%${q}%`
      );
    }

    const from = (parsed.page - 1) * parsed.pageSize;
    const to = from + parsed.pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const items = (data || []) as unknown as ClientWithRelations[];
    const total = count || 0;
    const totalPages = Math.ceil(total / parsed.pageSize) || 1;

    return {
      success: true,
      data: {
        items,
        total,
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load clients") };
  }
}

/**
 * Get client profile by ID with all contacts, deals, and owner
 */
export async function getClientById(
  id: string
): Promise<ActionResult<ClientWithRelations>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        *,
        account_owner:profiles!account_owner_id(id, full_name, email),
        source:lead_sources(id, name_ar, name_en),
        contacts(*),
        deals(*)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Client not found" };
    }

    return { success: true, data: data as unknown as ClientWithRelations };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to fetch client details") };
  }
}

/**
 * Create a new Client record with concurrency-safe business ID and optional primary contact
 */
export async function createClient(
  input: CreateClientInput
): Promise<ActionResult<ClientWithRelations>> {
  try {
    const validated = createClientSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    let businessId = `CLIENT-${Date.now().toString().slice(-5)}`;
    try {
      const { data: rpcId } = await supabase.rpc("generate_business_id", {
        p_entity_type: "client",
      });
      if (rpcId) businessId = rpcId;
    } catch {
      // fallback
    }

    const phoneNormalized = normalizePhoneNumber(validated.phone);
    const emailNormalized = validated.email ? validated.email.toLowerCase().trim() : null;
    const accountOwnerId = validated.account_owner_id || user.id;

    const { data: inserted, error: insertError } = await supabase
      .from("clients")
      .insert({
        business_id: businessId,
        name: validated.name,
        type: validated.type,
        area: validated.area || null,
        industry: validated.industry || null,
        website: validated.website || null,
        phone: validated.phone || null,
        phone_normalized: phoneNormalized,
        email: validated.email || null,
        email_normalized: emailNormalized,
        address: validated.address || null,
        source_id: validated.source_id || null,
        account_owner_id: accountOwnerId,
        notes: validated.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || "Failed to create client" };
    }

    // Insert primary contact if provided
    if (validated.primary_contact) {
      const pc = validated.primary_contact;
      await supabase.from("contacts").insert({
        client_id: inserted.id,
        name: pc.name,
        job_title: pc.job_title || null,
        phone: pc.phone || null,
        phone_normalized: normalizePhoneNumber(pc.phone),
        whatsapp: pc.whatsapp || null,
        email: pc.email || null,
        is_primary: true,
      });
    }

    // Log Activity
    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      client_id: inserted.id,
      summary: `تسجيل عميل جديد: ${inserted.name} (${inserted.business_id})`,
      metadata: { client_id: inserted.id },
    });

    revalidatePath("/clients");

    return {
      success: true,
      data: inserted as unknown as ClientWithRelations,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create client") };
  }
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  input: UpdateClientInput
): Promise<ActionResult<Client>> {
  try {
    const validated = updateClientSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: user.id,
    };

    if (validated.name !== undefined) updatePayload.name = validated.name;
    if (validated.type !== undefined) updatePayload.type = validated.type;
    if (validated.area !== undefined) updatePayload.area = validated.area;
    if (validated.industry !== undefined) updatePayload.industry = validated.industry;
    if (validated.website !== undefined) updatePayload.website = validated.website;
    if (validated.phone !== undefined) {
      updatePayload.phone = validated.phone;
      updatePayload.phone_normalized = normalizePhoneNumber(validated.phone);
    }
    if (validated.email !== undefined) {
      updatePayload.email = validated.email;
      updatePayload.email_normalized = validated.email
        ? validated.email.toLowerCase().trim()
        : null;
    }
    if (validated.address !== undefined) updatePayload.address = validated.address;
    if (validated.source_id !== undefined) updatePayload.source_id = validated.source_id;
    if (validated.account_owner_id !== undefined)
      updatePayload.account_owner_id = validated.account_owner_id;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;

    const { data: updated, error } = await supabase
      .from("clients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return { success: false, error: error?.message || "Failed to update client" };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);

    return { success: true, data: updated as unknown as Client };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update client") };
  }
}

/**
 * Add a contact to a client
 */
export async function addContact(input: ContactInput): Promise<ActionResult<Contact>> {
  try {
    const validated = contactSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    if (validated.is_primary) {
      // Unset previous primary contact
      await supabase
        .from("contacts")
        .update({ is_primary: false })
        .eq("client_id", validated.client_id);
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        client_id: validated.client_id,
        name: validated.name,
        job_title: validated.job_title || null,
        phone: validated.phone || null,
        phone_normalized: normalizePhoneNumber(validated.phone),
        whatsapp: validated.whatsapp || null,
        email: validated.email || null,
        is_primary: validated.is_primary,
        notes: validated.notes || null,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to add contact" };
    }

    revalidatePath(`/clients/${validated.client_id}`);

    return { success: true, data: data as unknown as Contact };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to add contact") };
  }
}

/**
 * Convert a Potential Client into an official Client record
 */
export async function convertPotentialClientToClient(
  potentialClientId: string,
  options: {
    clientType?: "COMPANY" | "INDIVIDUAL";
    createDeal?: boolean;
    dealTitle?: string;
    dealEstimatedValue?: number;
    dealCurrency?: string;
  } = {}
): Promise<ActionResult<{ client: Client; deal?: Deal }>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // 1. Fetch potential client
    const { data: pc, error: pcErr } = await supabase
      .from("potential_clients")
      .select("*")
      .eq("id", potentialClientId)
      .single();

    if (pcErr || !pc) {
      return { success: false, error: "Potential client not found" };
    }

    // 2. Generate client business ID
    let clientBusinessId = `CLIENT-${Date.now().toString().slice(-5)}`;
    try {
      const { data: rpcId } = await supabase.rpc("generate_business_id", {
        p_entity_type: "client",
      });
      if (rpcId) clientBusinessId = rpcId;
    } catch {
      // fallback
    }

    // 3. Create client record
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .insert({
        business_id: clientBusinessId,
        name: pc.name,
        type: options.clientType || "COMPANY",
        area: pc.area || null,
        phone: pc.phone || null,
        phone_normalized: pc.phone_normalized || null,
        website: pc.website || null,
        source_id: pc.source_id || null,
        account_owner_id: pc.research_owner_id || user.id,
        notes: pc.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (clientErr || !client) {
      return { success: false, error: clientErr?.message || "Failed to create client" };
    }

    // 4. Update potential client to CONVERTED
    await supabase
      .from("potential_clients")
      .update({
        status: "CONVERTED",
        converted_client_id: client.id,
      })
      .eq("id", potentialClientId);

    // 5. Create primary contact if phone was present
    if (pc.phone) {
      await supabase.from("contacts").insert({
        client_id: client.id,
        name: pc.name,
        phone: pc.phone,
        phone_normalized: pc.phone_normalized,
        is_primary: true,
      });
    }

    // 6. Optional: Create initial Deal
    let createdDeal: Deal | undefined;
    if (options.createDeal) {
      let dealBusinessId = `DEAL-${Date.now().toString().slice(-5)}`;
      try {
        const { data: rpcDealId } = await supabase.rpc("generate_business_id", {
          p_entity_type: "deal",
        });
        if (rpcDealId) dealBusinessId = rpcDealId;
      } catch {
        // fallback
      }

      const { data: deal } = await supabase
        .from("deals")
        .insert({
          business_id: dealBusinessId,
          title: options.dealTitle || `صفقة - ${client.name}`,
          client_id: client.id,
          sales_owner_id: user.id,
          stage: "NEW",
          estimated_value: options.dealEstimatedValue || null,
          currency: options.dealCurrency || "EGP",
          created_by: user.id,
        })
        .select()
        .single();

      if (deal) createdDeal = deal as unknown as Deal;
    }

    // 7. Log activities
    await supabase.from("activities").insert([
      {
        type: "SYSTEM",
        actor_id: user.id,
        summary: `تحويل العميل المحتمل ${pc.name} إلى عميل رسمي (${client.business_id}) 🚀`,
        metadata: { potential_client_id: potentialClientId, client_id: client.id },
      },
      {
        type: "SYSTEM",
        actor_id: user.id,
        client_id: client.id,
        summary: `تم إنشاء العميل بالتحويل من حوض البحث 🚀`,
      },
    ]);

    revalidatePath("/potential-clients");
    revalidatePath(`/potential-clients/${potentialClientId}`);
    revalidatePath("/clients");
    if (options.createDeal) revalidatePath("/deals");

    return {
      success: true,
      data: { client: client as unknown as Client, deal: createdDeal },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Conversion failed") };
  }
}
