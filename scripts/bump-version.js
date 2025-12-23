import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../package.json');
const lockPath = path.resolve(__dirname, '../package-lock.json');

function bumpVersion(obj) {
  if (!obj.version) return false;
  const parts = obj.version.split('.').map(Number);
  if (parts.length !== 3) return false;
  parts[2] += 1;
  obj.version = parts.join('.');
  return obj.version;
}

// Update package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVersion = bumpVersion(pkg);
if (!newVersion) {
  console.error('Invalid or missing version in package.json');
  process.exit(1);
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json version bumped to ${newVersion}`);

// Update package-lock.json if it exists
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = newVersion;
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  console.log(`package-lock.json version bumped to ${newVersion}`);
}
