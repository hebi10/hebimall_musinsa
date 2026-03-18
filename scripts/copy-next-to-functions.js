const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(process.cwd(), '.next');
const destinationDir = path.resolve(process.cwd(), 'functions', '.next');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source build directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.rmSync(destinationDir, { recursive: true, force: true });
fs.cpSync(sourceDir, destinationDir, { recursive: true });

console.log(`Copied ${sourceDir} -> ${destinationDir}`);
