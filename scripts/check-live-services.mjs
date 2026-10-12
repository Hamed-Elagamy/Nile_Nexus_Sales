import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const url = "https://zbbivheqcutwflewmtnb.supabase.co";
const key = "sb_publishable_TNQ-4zRaDmUyvDwuIxdnXA_mAG5SejC";
const supabase = createClient(url, key);

// Read 173 services from Pricing.html or parse-pricing.mjs
const pricingContent = fs.readFileSync("C:/Users/Moham/OneDrive/Desktop/Pricing.html", "utf8");
const rowRegex = /<tr><td class="num">(\d+)<\/td><td>(.*?)<\/td><td class="price">(.*?)<\/td><\/tr>/g;
let match;
const pdfServices = [];
while ((match = rowRegex.exec(pricingContent)) !== null) {
  const num = parseInt(match[1]);
  const rawTitle = match[2].trim();
  let nameAr = rawTitle;
  if (rawTitle.includes(" - ")) {
    nameAr = rawTitle.split(" - ")[0].trim();
  } else if (rawTitle.includes(" – ")) {
    nameAr = rawTitle.split(" – ")[0].trim();
  } else if (num === 108) {
    nameAr = "تكاملات أنظمة ERP";
  } else if (num === 109) {
    nameAr = "تكاملات أنظمة CRM";
  }
  pdfServices.push({ num, nameAr });
}

console.log("PDF count:", pdfServices.length);
const pdfNamesAr = new Set(pdfServices.map(s => s.nameAr));

async function main() {
  const { data, error } = await supabase.from("services").select("*");
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  console.log("Total services in Supabase:", data.length);
  const notInPdf = data.filter(s => !pdfNamesAr.has(s.name_ar));
  console.log("Not in PDF count:", notInPdf.length);
  console.log("Sample not in PDF:", notInPdf.slice(0, 20).map(s => ({
    id: s.id,
    name_ar: s.name_ar,
    name_en: s.name_en,
    sort_order: s.sort_order,
    is_active: s.is_active,
    price: s.internal_reference_price
  })));

  // Also check if any in PDF have duplicates in database!
  const countByName = {};
  data.forEach(s => {
    countByName[s.name_ar] = (countByName[s.name_ar] || 0) + 1;
  });
  const duplicates = Object.entries(countByName).filter(([_, count]) => count > 1);
  console.log("Duplicates in Supabase count:", duplicates.length);
  if (duplicates.length > 0) {
    console.log("Sample duplicates:", duplicates.slice(0, 10));
  }
}

main();
