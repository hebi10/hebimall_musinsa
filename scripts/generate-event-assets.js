const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const eventCatalog = require('../src/mocks/eventCatalog2026.json');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'events', '2026');
const FALLBACKS = [
  path.join(ROOT, 'public', 'main', 'hero_editorial_outer_fixed.webp'),
  path.join(ROOT, 'public', 'main', 'hero_editorial_sale_fixed.webp'),
  path.join(ROOT, 'public', 'main', 'hero_editorial_best_fixed.webp'),
];

const typeMeta = {
  sale: { eyebrow: 'SEASON SALE', bg: '#111111', fg: '#ffffff' },
  coupon: { eyebrow: 'COUPON DROP', bg: '#f8f6f1', fg: '#111111' },
  special: { eyebrow: 'SPECIAL EVENT', bg: '#efe8dc', fg: '#111111' },
  new: { eyebrow: 'NEW COLLECTION', bg: '#eef3ef', fg: '#111111' },
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getBenefit = (event) => {
  if (event.discountRate) return `최대 ${event.discountRate}%`;
  if (event.discountAmount) return `${event.discountAmount.toLocaleString('ko-KR')}원`;
  if (event.couponCode) return '쿠폰 혜택';
  return '기획 혜택';
};

const splitText = (value, maxLength) => {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 2);
};

const renderTextLines = ({ lines, x, y, lineHeight, fontSize, weight, fill }) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-family="Malgun Gothic, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`
    )
    .join('');

const getSourcePath = (event, index) => {
  const source = path.join(OUT_DIR, `${event.id}-source.png`);
  if (fs.existsSync(source)) return source;
  return FALLBACKS[index % FALLBACKS.length];
};

const bannerOverlay = (event) => {
  const meta = typeMeta[event.eventType] ?? typeMeta.special;
  const benefit = getBenefit(event);
  const titleLines = splitText(event.title, 8);
  const descriptionLines = splitText(event.description, 20);
  const titleBottom = 312 + (titleLines.length - 1) * 72;

  return Buffer.from(`
    <svg width="1600" height="820" viewBox="0 0 1600 820" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="820" fill="rgba(255,255,255,0)"/>
      <rect x="70" y="92" width="520" height="490" fill="rgba(255,255,255,0.92)" stroke="rgba(17,17,17,0.12)"/>
      <rect x="104" y="136" width="184" height="44" fill="${meta.bg}" stroke="rgba(17,17,17,0.18)"/>
      <text x="126" y="164" font-family="Malgun Gothic, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="${meta.fg}">
        ${escapeXml(meta.eyebrow)}
      </text>
      ${renderTextLines({
        lines: descriptionLines,
        x: 104,
        y: 230,
        lineHeight: 34,
        fontSize: 26,
        weight: 800,
        fill: '#111111',
      })}
      ${renderTextLines({
        lines: titleLines,
        x: 104,
        y: 320,
        lineHeight: 76,
        fontSize: titleLines.length > 1 ? 62 : 68,
        weight: 900,
        fill: '#111111',
      })}
      <text x="104" y="${titleBottom + 84}" font-family="Malgun Gothic, Arial, sans-serif" font-size="42" font-weight="900" fill="#111111">
        ${escapeXml(benefit)}
      </text>
      <text x="104" y="${titleBottom + 142}" font-family="Malgun Gothic, Arial, sans-serif" font-size="24" font-weight="700" fill="#667085">
        ${escapeXml(event.startDate.slice(5).replace('-', '.'))} - ${escapeXml(event.endDate.slice(5).replace('-', '.'))}
      </text>
      <rect x="104" y="${titleBottom + 184}" width="178" height="54" fill="#111111"/>
      <text x="136" y="${titleBottom + 219}" font-family="Malgun Gothic, Arial, sans-serif" font-size="20" font-weight="800" fill="#ffffff">
        혜택 보기
      </text>
    </svg>
  `);
};

async function generateAsset(event, index) {
  const sourcePath = getSourcePath(event, index);
  const bannerPath = path.join(OUT_DIR, `${event.id}-banner.webp`);
  const detailPath = path.join(OUT_DIR, `${event.id}-detail.webp`);
  const thumbPath = path.join(OUT_DIR, `${event.id}-thumb.webp`);

  await sharp(sourcePath)
    .resize(1600, 820, { fit: 'cover', position: 'right' })
    .composite([{ input: bannerOverlay(event), top: 0, left: 0 }])
    .webp({ quality: 86 })
    .toFile(bannerPath);

  await sharp(sourcePath)
    .resize(640, 420, { fit: 'cover', position: 'right' })
    .webp({ quality: 84 })
    .toFile(thumbPath);

  await sharp(sourcePath)
    .resize(1600, 820, { fit: 'cover', position: 'right' })
    .webp({ quality: 86 })
    .toFile(detailPath);

  return { bannerPath, detailPath, thumbPath, sourcePath };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const [index, event] of eventCatalog.entries()) {
    results.push(await generateAsset(event, index));
  }

  for (const result of results) {
    console.log(`Generated ${path.relative(ROOT, result.bannerPath)} from ${path.basename(result.sourcePath)}`);
    console.log(`Generated ${path.relative(ROOT, result.detailPath)} from ${path.basename(result.sourcePath)}`);
    console.log(`Generated ${path.relative(ROOT, result.thumbPath)} from ${path.basename(result.sourcePath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
