import { readdirSync, statSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const collectJavaScriptFiles = (dir) => {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...collectJavaScriptFiles(entryPath));
    } else if (entry.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
};

const files = collectJavaScriptFiles(srcDir);
let hasError = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: rootDir,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    hasError = true;
    process.stderr.write(result.stderr || result.stdout);
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`Checked ${files.length} server files.`);
