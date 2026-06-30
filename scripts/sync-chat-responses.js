const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'src', 'shared', 'utils', 'chatResponses.ts');
const targetPath = path.join(rootDir, 'functions', 'src', 'chatResponses.ts');

const source = fs.readFileSync(sourcePath, 'utf8');
fs.writeFileSync(
  targetPath,
  `// Generated from src/shared/utils/chatResponses.ts. Run npm run sync:chat-responses after editing.\n${source}`,
);
