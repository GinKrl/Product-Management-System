import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/* ================================================================
   No Hard Delete Audit
   Grep codebase for '.delete(' or 'delete(' Supabase calls
   targeting 'product' or 'user' tables.
   Expected: zero matches.
   ================================================================ */

describe('No Hard Delete Audit', () => {
  const serviceDir = path.resolve(process.cwd(), 'src/services');
  const contextDir = path.resolve(process.cwd(), 'src/contexts');

  const readAllJsFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let contents = '';
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.js')) {
        contents += fs.readFileSync(path.join(dir, file.name), 'utf-8') + '\n';
      }
    }
    return contents;
  };

  it('has zero .delete( calls on product or user tables in services', () => {
    const src = readAllJsFiles(serviceDir);
    const dangerous = [];
    // look for patterns like: .delete(  ... )  near 'product' or 'user'
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (/\.delete\s*\(/.test(line)) {
        dangerous.push({ line: i + 1, text: line.trim() });
      }
    });
    expect(dangerous).toEqual([]);
  });

  it('has zero .delete( calls on product or user tables in contexts', () => {
    const src = readAllJsFiles(contextDir);
    const dangerous = [];
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (/\.delete\s*\(/.test(line)) {
        dangerous.push({ line: i + 1, text: line.trim() });
      }
    });
    expect(dangerous).toEqual([]);
  });
});

