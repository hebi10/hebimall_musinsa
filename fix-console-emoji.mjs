import fs from 'fs';

// Emoji pattern including variation selectors
const emojiRegex = /[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|\u{FE0F}|[\u{FE0E}]/gu;

const files = [
  'src/context/productProvider.tsx',
  'src/context/reviewProvider.tsx',
  'src/shared/hooks/useImageCache.ts',
  'src/shared/hooks/usePoint.ts',
  'src/shared/libs/firebase/storage.ts',
  'src/shared/services/adminUserService.ts',
  'src/shared/services/categoryOrderService.ts',
  'src/shared/services/categoryService.ts',
  'src/shared/services/couponService.ts',
  'src/shared/services/featuredProductService.ts',
  'src/shared/services/orderService.ts',
  'src/shared/services/productService.ts',
  'src/shared/services/reviewService.ts',
  'src/shared/utils/syncProductReviews.ts',
];

// Arrow trend indicators - replace with text equivalents
const trendFiles = [
  'src/shared/hooks/useDashboard.ts',
  'src/shared/hooks/useDashboardQuery.ts',
];

let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  const newLines = lines.map(line => {
    // Only modify console.log/warn/error lines
    if (/console\.(log|warn|error)/.test(line)) {
      const cleaned = line.replace(emojiRegex, '').replace(/ {2,}/g, ' ');
      if (cleaned !== line) {
        changed = true;
        totalFixed++;
        return cleaned;
      }
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'), 'utf8');
    console.log(`Fixed: ${file}`);
  }
}

// Fix trend arrow emoji in dashboard hooks
for (const file of trendFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content
    .replace(/'\u{2197}\u{FE0F}'/u, "'▲'")
    .replace(/'\u{2198}\u{FE0F}'/u, "'▼'")
    .replace(/'\u{27A1}\u{FE0F}'/u, "'→'")
    .replace(/↗️/g, '▲')
    .replace(/↘️/g, '▼')
    .replace(/➡️/g, '→');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed trend arrows: ${file}`);
    totalFixed++;
  }
}

console.log(`\nDone. Total fixes applied: ${totalFixed}`);
