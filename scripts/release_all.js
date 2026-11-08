// AETHER-9 Release Packaging & Multi-Version Verification Suite
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   AETHER-9 Release Packaging & Verification Suite  ');
console.log('====================================================\n');

// 1. Build latest v3
console.log('[1/3] Building latest v3 release...');
require('./build.js');
console.log('');

// 2. Target versions to verify
const versions = [
  { ver: 'v1.0.0', path: path.join(ROOT, 'dist/v1/index.html'), desc: 'Initial Interactive Prototype' },
  { ver: 'v2.0.0', path: path.join(ROOT, 'dist/v2/index.html'), desc: 'Dual-Mode Compact Console' },
  { ver: 'v3.0.0', path: path.join(ROOT, 'dist/v3/index.html'), desc: 'Full Multi-View Mission Control System' },
  { ver: 'v3.0.0 (Root)', path: path.join(ROOT, 'index.html'), desc: 'Root Deployable Entrypoint' }
];

// Helper to compute sha256
function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// 3. Verify files and check JavaScript syntax
console.log('[2/3] Verifying files and checking syntax...');
let allValid = true;

versions.forEach(v => {
  if (!fs.existsSync(v.path)) {
    console.error(`  ✖ Missing file: ${v.path}`);
    allValid = false;
    return;
  }

  const html = fs.readFileSync(v.path, 'utf8');
  const size = fs.statSync(v.path).size;
  const hash = sha256(v.path);

  // Extract <script> content and run node --check
  const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) {
    console.error(`  ✖ No <script> found in: ${v.ver}`);
    allValid = false;
    return;
  }

  try {
    execSync('node --check', { input: scriptMatch[1], stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`  ✓ [${v.ver}] Syntax OK | Size: ${(size / 1024).toFixed(1)} KB | SHA-256: ${hash.slice(0, 16)}...`);
  } catch (err) {
    console.error(`  ✖ [${v.ver}] Syntax ERROR in JavaScript block:`, err.message);
    allValid = false;
  }
});

console.log('\n[3/3] Release Summary:');
console.table(versions.map(v => ({
  Version: v.ver,
  Description: v.desc,
  Size: fs.existsSync(v.path) ? `${(fs.statSync(v.path).size / 1024).toFixed(1)} KB` : 'N/A',
  SHA256: fs.existsSync(v.path) ? sha256(v.path).slice(0, 12) + '...' : 'N/A'
})));

if (!allValid) {
  console.error('\n✖ One or more release checks failed!');
  process.exit(1);
}

console.log('\n✓ All release packages verified successfully and ready for GitHub distribution!\n');
