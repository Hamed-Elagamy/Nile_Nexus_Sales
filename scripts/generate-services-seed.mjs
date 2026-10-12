import fs from "fs";

const content = fs.readFileSync("C:/Users/Moham/OneDrive/Desktop/Pricing.html", "utf8");
const rowRegex = /<tr><td class="num">(\d+)<\/td><td>(.*?)<\/td><td class="price">(.*?)<\/td><\/tr>/g;

let match;
const services = [];

while ((match = rowRegex.exec(content)) !== null) {
  const num = parseInt(match[1]);
  const rawTitle = match[2].trim();
  const rawPrice = match[3].trim();

  let nameAr = rawTitle;
  let nameEn = rawTitle;

  if (rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    nameAr = parts[0].trim();
    nameEn = parts.slice(1).join(" - ").trim();
  } else if (rawTitle.includes(" – ")) {
    const parts = rawTitle.split(" – ");
    nameAr = parts[0].trim();
    nameEn = parts.slice(1).join(" – ").trim();
  } else if (num === 108) {
    nameAr = "تكاملات أنظمة ERP";
    nameEn = "ERP Integrations";
  } else if (num === 109) {
    nameAr = "تكاملات أنظمة CRM";
    nameEn = "CRM Integrations";
  }

  const priceClean = rawPrice.replace(/[^0-9]/g, "");
  const priceNum = parseFloat(priceClean);

  services.push({
    num,
    nameAr,
    nameEn,
    price: priceNum,
    currency: "EGP",
  });
}

console.log("Parsed count:", services.length);

// Generate SQL migration
let sql = `-- ============================================================================
-- Nile Nexus Sales — Migration 009: Clean Legacy Services & Seed Exact 173 Official Services
-- Description:
--   1. Safely disconnect any old foreign key references from deal_services,
--      proposal_items, and commission_rules.
--   2. Permanently DELETE all legacy demo services and duplicates from the services table.
--   3. Apply unique constraints on sort_order and (name_ar, name_en) to prevent duplicates.
--   4. Seed EXACTLY the 173 software project services from the Nile Nexus Pricing Document.
--
-- Execution:
--   Copy and paste this script into the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

BEGIN;

-- 1. Unlink any potential references from old test records
DELETE FROM deal_services;
UPDATE proposal_items SET service_id = NULL;
UPDATE commission_rules SET service_id = NULL;

-- 2. Wipe the services table completely so ONLY the 173 official services exist
TRUNCATE TABLE services CASCADE;

-- 3. Add UNIQUE constraints to prevent duplicate entries in the future
ALTER TABLE services DROP CONSTRAINT IF EXISTS uq_services_sort_order;
ALTER TABLE services ADD CONSTRAINT uq_services_sort_order UNIQUE (sort_order);

ALTER TABLE services DROP CONSTRAINT IF EXISTS uq_services_names;
ALTER TABLE services ADD CONSTRAINT uq_services_names UNIQUE (name_ar, name_en);

-- 4. Insert the exact 173 Nile Nexus Software Project Services
INSERT INTO services (name_ar, name_en, internal_reference_price, currency, is_active, sort_order) VALUES
`;

const values = services.map((s) => {
  const escAr = s.nameAr.replace(/'/g, "''");
  const escEn = s.nameEn.replace(/'/g, "''");
  return `  ('${escAr}', '${escEn}', ${s.price.toFixed(2)}, 'EGP', true, ${s.num})`;
});

sql += values.join(",\n") + ";\n\nCOMMIT;\n";

fs.writeFileSync("supabase/migrations/009_seed_173_services_catalog.sql", sql, "utf8");
console.log("Successfully generated supabase/migrations/009_seed_173_services_catalog.sql");
