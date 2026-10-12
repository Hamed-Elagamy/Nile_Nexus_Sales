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

// Generate demoServices TS array
let tsArray = `export const demoServices: Service[] = [\n`;
services.forEach((s) => {
  const padNum = String(s.num).padStart(3, "0");
  tsArray += `  {\n`;
  tsArray += `    id: "srv-${padNum}",\n`;
  tsArray += `    name_ar: ${JSON.stringify(s.nameAr)},\n`;
  tsArray += `    name_en: ${JSON.stringify(s.nameEn)},\n`;
  tsArray += `    description_ar: null,\n`;
  tsArray += `    description_en: null,\n`;
  tsArray += `    internal_reference_price: "${s.price.toFixed(2)}",\n`;
  tsArray += `    currency: "EGP",\n`;
  tsArray += `    is_active: true,\n`;
  tsArray += `    sort_order: ${s.num},\n`;
  tsArray += `    created_at: "2026-01-01T08:00:00Z",\n`;
  tsArray += `    updated_at: "2026-01-01T08:00:00Z",\n`;
  tsArray += `  },\n`;
});
tsArray += `];`;

// Read demo-data.ts and replace demoServices block
const demoDataPath = "src/lib/demo-data.ts";
const demoDataContent = fs.readFileSync(demoDataPath, "utf8");

const startMarker = "// ─── Demo Services Catalog ────────────────────────────────────\nexport const demoServices: Service[] = [";
const endMarker = "// ─── Demo Lead Sources ────────────────────────────────────────";

const startIndex = demoDataContent.indexOf(startMarker);
const endIndex = demoDataContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find demoServices markers in demo-data.ts");
  process.exit(1);
}

const newDemoDataContent =
  demoDataContent.substring(0, startIndex) +
  "// ─── Demo Services Catalog (Official 173 Nile Nexus Rates) ─────\n" +
  tsArray +
  "\n\n" +
  demoDataContent.substring(endIndex);

fs.writeFileSync(demoDataPath, newDemoDataContent, "utf8");
console.log("Successfully updated src/lib/demo-data.ts with all 173 services!");
