import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

// Orange rounded-square background + white beer mug SVG illustration
function makeSvg(size) {
  const r = size * 0.22; // corner radius
  const s = size;

  // Beer mug proportions (all relative to size)
  const mugLeft   = s * 0.20;
  const mugTop    = s * 0.22;
  const mugW      = s * 0.46;
  const mugH      = s * 0.52;
  const mugBot    = mugTop + mugH;
  const mugRight  = mugLeft + mugW;

  // Handle
  const hLeft  = mugRight;
  const hRight = mugRight + s * 0.15;
  const hTop   = mugTop + mugH * 0.18;
  const hBot   = mugTop + mugH * 0.62;
  const hThick = s * 0.06;

  // Foam dome (ellipse sitting on top of mug)
  const foamCX = mugLeft + mugW / 2;
  const foamCY = mugTop + s * 0.02;
  const foamRX = mugW / 2 + s * 0.03;
  const foamRY = s * 0.10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="#c2410c"/>

  <!-- Mug body -->
  <rect x="${mugLeft}" y="${mugTop}" width="${mugW}" height="${mugH}"
        rx="${s * 0.04}" ry="${s * 0.04}" fill="white" opacity="0.95"/>

  <!-- Handle (outer path, then cut inner) -->
  <path d="
    M ${hLeft} ${hTop}
    Q ${hRight + s * 0.04} ${hTop}
      ${hRight + s * 0.04} ${(hTop + hBot) / 2}
    Q ${hRight + s * 0.04} ${hBot}
      ${hLeft} ${hBot}
    L ${hLeft} ${hBot - hThick}
    Q ${hRight - s * 0.01} ${hBot - hThick}
      ${hRight - s * 0.01} ${(hTop + hBot) / 2}
    Q ${hRight - s * 0.01} ${hTop + hThick}
      ${hLeft} ${hTop + hThick}
    Z
  " fill="white" opacity="0.95"/>

  <!-- Foam ellipse -->
  <ellipse cx="${foamCX}" cy="${foamCY}" rx="${foamRX}" ry="${foamRY}"
           fill="white"/>

  <!-- Foam bubbles -->
  <circle cx="${foamCX - foamRX * 0.3}" cy="${foamCY - foamRY * 0.5}" r="${s * 0.055}" fill="white"/>
  <circle cx="${foamCX + foamRX * 0.28}" cy="${foamCY - foamRY * 0.55}" r="${s * 0.045}" fill="white"/>
  <circle cx="${foamCX + foamRX * 0.0}" cy="${foamCY - foamRY * 0.7}" r="${s * 0.04}" fill="white"/>

  <!-- Beer fill (amber tint inside mug) -->
  <rect x="${mugLeft + s * 0.025}" y="${mugTop + mugH * 0.28}"
        width="${mugW - s * 0.05}" height="${mugH * 0.68}"
        rx="${s * 0.025}" fill="#e07b39" opacity="0.35"/>
</svg>`;
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size)))
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`✓ icon-${size}x${size}.png`);
}
console.log("Done!");
