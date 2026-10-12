import fs from "fs";

const content = fs.readFileSync("C:/Users/Moham/OneDrive/Desktop/Pricing.html", "utf8");
const rowRegex = /<tr><td class="num">(\d+)<\/td><td>(.*?)<\/td><td class="price">(.*?)<\/td><\/tr>/g;
let match;
let count = 0;
const items = [];

while ((match = rowRegex.exec(content)) !== null) {
  count++;
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
  } else {
    // Check if there is an English suffix without dash
    // e.g. "تكاملات أنظمة ERP Integrations"
    // let's inspect items that don't have dash
  }

  const priceClean = rawPrice.replace(/[^0-9]/g, "");
  const priceNum = parseInt(priceClean);

  items.push({ num, nameAr, nameEn, priceNum, currency: "EGP", rawTitle });
}

console.log("Total items parsed:", count);
const noDash = items.filter(i => !i.rawTitle.includes(" - ") && !i.rawTitle.includes(" – "));
console.log("Items without dash:", noDash);
console.log("First 3 items:", items.slice(0, 3));
console.log("Last 3 items:", items.slice(-3));
