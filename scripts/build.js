// AETHER-9 Standalone Build & Distribution Script
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const srcV3 = path.join(ROOT, 'dist/v3/index.html');
const targetIndex = path.join(ROOT, 'index.html');
const targetDistName = path.join(ROOT, 'dist/aether-9-v3.0.html');

console.log('Building AETHER-9 flagship release (v3.0.0)...');

if (!fs.existsSync(srcV3)) {
  throw new Error('Fatal: v3 source artifact missing at: ' + srcV3);
}

const v3Html = fs.readFileSync(srcV3, 'utf8');

// 1. Verify JavaScript syntax in <script>
const scriptMatch = v3Html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  throw new Error('Fatal: No <script> block found in v3 source!');
}

try {
  execSync('node --check', { input: scriptMatch[1], stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('✓ JavaScript syntax verification passed (0 syntax errors)');
} catch (err) {
  throw new Error('JavaScript syntax validation failed: ' + err.message);
}

// 2. Synchronize to root index.html and dist/aether-9-v3.0.html
fs.writeFileSync(targetIndex, v3Html, 'utf8');
fs.writeFileSync(targetDistName, v3Html, 'utf8');

const sha = crypto.createHash('sha256').update(v3Html).digest('hex');
console.log('✓ AETHER-9 v3 build synchronized successfully:');
console.log('  -> ' + targetIndex + ' (' + fs.statSync(targetIndex).size + ' bytes)');
console.log('  -> ' + targetDistName + ' (' + fs.statSync(targetDistName).size + ' bytes)');
console.log('✓ SHA-256 Verified: ' + sha);
