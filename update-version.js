// update-version.js
// Jalankan script ini sebelum commit untuk update versi
// Usage: node update-version.js

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, 'version.json');
const indexFile = path.join(__dirname, 'index.html');

// Generate version: YYYY.MM.DD.XXX
const now = new Date();
const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
const version = `${dateStr}.${timeStr}`;

// Update version.json
const versionData = {
  version: version,
  timestamp: now.getTime(),
  forceRefresh: true
};

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + '\n');
console.log(`✅ version.json updated to: ${version}`);

// Update APP_VERSION di index.html
let indexContent = fs.readFileSync(indexFile, 'utf8');
indexContent = indexContent.replace(
  /const APP_VERSION = '[^']+'/,
  `const APP_VERSION = '${version}'`
);
fs.writeFileSync(indexFile, indexContent);
console.log(`✅ index.html APP_VERSION updated to: ${version}`);

console.log('\n📦 Ready to commit and push!');
