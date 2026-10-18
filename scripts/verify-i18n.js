const fs = require('fs');
const path = require('path');

const arRaw = fs.readFileSync(path.join(__dirname, '../messages/ar.json'), 'utf8');
const enRaw = fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8');

const ar = JSON.parse(arRaw);
const en = JSON.parse(enRaw);

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const arKeys = new Set(getKeys(ar));
const enKeys = new Set(getKeys(en));

console.log(`Arabic total keys: ${arKeys.size}`);
console.log(`English total keys: ${enKeys.size}`);

const missingInEn = [...arKeys].filter(k => !enKeys.has(k));
const missingInAr = [...enKeys].filter(k => !arKeys.has(k));

if (missingInEn.length > 0) {
  console.error(`Keys missing in en.json (${missingInEn.length}):`, missingInEn.slice(0, 10));
}

if (missingInAr.length > 0) {
  console.error(`Keys missing in ar.json (${missingInAr.length}):`, missingInAr.slice(0, 10));
}

if (missingInEn.length === 0 && missingInAr.length === 0) {
  console.log('✅ 100% i18n synchronization! Both dictionaries match perfectly with zero missing keys.');
  process.exit(0);
} else {
  process.exit(1);
}
