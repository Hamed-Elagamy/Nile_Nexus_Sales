import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * CRC32 table & calculator for standard PNG chunk checksums
 */
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

/**
 * Generate a PNG buffer of given width and height from RGBA pixel data
 */
function rgbaToPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Deflate compression
  ihdrData.writeUInt8(0, 11); // Filter 0
  ihdrData.writeUInt8(0, 12); // No interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0 (None)
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: 0
    const pixelOffset = y * width * 4;
    rgbaBuffer.copy(rawData, rowOffset + 1, pixelOffset, pixelOffset + width * 4);
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Draw Nile Nexus branded icon into RGBA buffer
 */
function renderNileNexusIcon(size, isMaskable = false) {
  const rgba = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = isMaskable ? size * 0.45 : size * 0.46;
  const cornerRadius = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Background rounded squircle / rounded rect
      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      const maxDist = size * 0.47;

      let isInside = false;
      if (isMaskable) {
        // Maskable icons fill entire square with safe margins
        isInside = true;
      } else {
        // Rounded app squircle
        const rx = dx - (maxDist - cornerRadius);
        const ry = dy - (maxDist - cornerRadius);
        if (rx <= 0 || ry <= 0) {
          isInside = dx <= maxDist && dy <= maxDist;
        } else {
          isInside = rx * rx + ry * ry <= cornerRadius * cornerRadius;
        }
      }

      if (!isInside) {
        // Transparent outside squircle
        rgba[idx] = 0;
        rgba[idx + 1] = 0;
        rgba[idx + 2] = 0;
        rgba[idx + 3] = 0;
        continue;
      }

      // Base background: Deep Royal Navy #0B132B -> #1C2541
      const gradT = (y + x) / (size * 2);
      let r = Math.round(11 + gradT * 17);
      let g = Math.round(19 + gradT * 18);
      let b = Math.round(43 + gradT * 22);

      // Inner Diamond / Hexagonal Nexus Emblem
      const nx = (x - center) / (size * 0.32);
      const ny = (y - center) / (size * 0.32);

      // Stylized "N" Letter with dynamic strokes
      // Normalized coordinates -1 to 1 around center
      const u = (x - center) / (size * 0.28);
      const v = (y - center) / (size * 0.34);

      const inLeftStem = u >= -0.75 && u <= -0.35 && v >= -0.8 && v <= 0.8;
      const inRightStem = u >= 0.35 && u <= 0.75 && v >= -0.8 && v <= 0.8;
      // Diagonal: connecting from (-0.55, -0.8) to (0.55, 0.8)
      // Line equation: v approx 1.45 * u
      const diagDist = Math.abs(v - (1.45 * u));
      const inDiagonal = diagDist <= 0.35 && u >= -0.65 && u <= 0.65 && v >= -0.85 && v <= 0.85;

      // Outer glowing ring / diamond
      const diamondDist = Math.abs(nx) + Math.abs(ny);
      const inDiamondRing = diamondDist >= 0.95 && diamondDist <= 1.15;

      if (inLeftStem || inRightStem || inDiagonal) {
        // Bright Nile Cyan / Electric Blue: #00D2FF -> #3A7BD5 -> #2563EB
        const strokeT = (u + 0.75) / 1.5;
        r = Math.round(0 + strokeT * 37);
        g = Math.round(210 - strokeT * 90);
        b = Math.round(255 - strokeT * 20);
      } else if (inDiamondRing) {
        // Accent Nexus Ring Cyan glow
        r = 37;
        g = 99;
        b = 235;
      }

      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = 255;
    }
  }

  return rgbaToPng(size, size, rgba);
}

function generateSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B" />
      <stop offset="100%" stop-color="#1C2541" />
    </linearGradient>
    <linearGradient id="nexusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE" />
      <stop offset="50%" stop-color="#4FACFE" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <path d="M 256 60 L 452 256 L 256 452 L 60 256 Z" fill="none" stroke="#2563EB" stroke-width="12" opacity="0.35" />
  <g filter="url(#glow)">
    <path d="M 140 120 L 200 120 L 200 392 L 140 392 Z" fill="url(#nexusGrad)" rx="8" />
    <path d="M 312 120 L 372 120 L 372 392 L 312 392 Z" fill="url(#nexusGrad)" rx="8" />
    <polygon points="170,120 220,120 342,392 292,392" fill="url(#nexusGrad)" />
  </g>
  <circle cx="256" cy="256" r="14" fill="#00F2FE" />
</svg>`;
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 1. 192x192 standard icon
const icon192 = renderNileNexusIcon(192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);

// 2. 512x512 standard icon
const icon512 = renderNileNexusIcon(512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);

// 3. 192x192 maskable icon
const maskable192 = renderNileNexusIcon(192, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.png'), maskable192);

// 4. 512x512 maskable icon
const maskable512 = renderNileNexusIcon(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), maskable512);

// 5. Apple Touch Icon (180x180)
const appleTouch = renderNileNexusIcon(180, false);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleTouch);
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), appleTouch);

// 6. SVG icon
const svgContent = generateSvg();
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.resolve('public/favicon.svg'), svgContent, 'utf-8');

console.log('✅ Successfully generated all PWA icons in public/icons/ and public/');
