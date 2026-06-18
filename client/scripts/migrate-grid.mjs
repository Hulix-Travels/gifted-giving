import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

function migrateGridProps(attrs) {
  const sizeProps = {};
  const otherProps = [];

  const propRegex = /(\w+)=("([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
  let match;
  while ((match = propRegex.exec(attrs)) !== null) {
    const key = match[1];
    const value = match[3] ?? match[4] ?? match[5];
    if (key === 'item') continue;
    if (['xs', 'sm', 'md', 'lg', 'xl'].includes(key)) {
      sizeProps[key] = value;
    } else {
      otherProps.push(`${key}=${match[2]}`);
    }
  }

  const sizeKeys = Object.keys(sizeProps);
  let sizeAttr = '';
  if (sizeKeys.length === 1 && sizeKeys[0] === 'xs') {
    sizeAttr = `size={${sizeProps.xs}}`;
  } else if (sizeKeys.length > 0) {
    const entries = sizeKeys.map((k) => `${k}: ${sizeProps[k]}`).join(', ');
    sizeAttr = `size={{ ${entries} }}`;
  }

  const rest = otherProps.join(' ');
  return [sizeAttr, rest].filter(Boolean).join(' ');
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/<Grid\s+item\s+([^>/]*)\/?>/g, (_, attrs) => {
    const migrated = migrateGridProps(attrs.trim());
    return migrated ? `<Grid ${migrated}>` : '<Grid>';
  });

  content = content.replace(/<Grid\s+((?:xs|sm|md|lg|xl)=\{[^}]+\}\s*)+([^>/]*)\/?>/g, (full, _sizes, rest) => {
    if (full.includes('container') || full.includes('size=')) return full;
    const attrs = full.slice(5, -1);
    const migrated = migrateGridProps(attrs);
    return migrated ? `<Grid ${migrated}>` : '<Grid>';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walk(dir) {
  let changed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) changed += walk(full);
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx')) {
      if (migrateFile(full)) {
        console.log('Migrated:', full);
        changed += 1;
      }
    }
  }
  return changed;
}

console.log(`Updated ${walk(srcDir)} files`);
