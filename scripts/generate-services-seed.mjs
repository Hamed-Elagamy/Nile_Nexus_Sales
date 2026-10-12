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
services.forEach((s) => {
  if (!s.nameAr || !s.nameEn || isNaN(s.price)) {
    console.error("Invalid service:", s);
  }
});

// Generate SQL migration
let sql = `-- Migration: 009_seed_173_services_catalog.sql
-- Description: Replace legacy demo services with the official 173 Nile Nexus Software Project Types and Starter Rates

-- 1. Safely deactivate legacy generic services if any exists
UPDATE services SET is_active = false WHERE sort_order <= 11 AND created_at < now() - interval '1 day';

-- 2. Insert or update the 173 official Nile Nexus services
`;

sql += `INSERT INTO services (name_ar, name_en, internal_reference_price, currency, is_active, sort_order) VALUES\n`;

const values = services.map((s, idx) => {
  const escAr = s.nameAr.replace(/'/g, "''");
  const escEn = s.nameEn.replace(/'/g, "''");
  return `  ('${escAr}', '${escEn}', ${s.price.toFixed(2)}, 'EGP', true, ${s.num})`;
});

sql += values.join(",\n") + ";\n";

fs.writeFileSync("supabase/migrations/009_seed_173_services_catalog.sql", sql, "utf8");
console.log("Successfully generated supabase/migrations/009_seed_173_services_catalog.sql");
