// Ultra-reliable fix script for template literal escaping in content fields
// Key insight from analyzing working files:
// - content: `...` where content is a template literal
// - The CLOSING backtick of content is ALWAYS on the same line as a comma (`,`)
//   that separates it from the next object property or ends the property list.
// - Backticks inside code blocks like {`text-${x}`} are followed by `}` not `,`
//   so they are NOT mistaken for closing backticks.
const fs = require('fs');
const path = require('path');

function escapeContent(content) {
  // Given raw content text (between opening and closing backticks),
  // properly escape backticks and ${} that appear in template text
  // while preserving JS code inside ${...} expressions.
  let out = '';
  let depth = 0; // 0=template text, >0=inside ${...}
  let str = null; // 's1'|'s2'|'bt'|'lc'|'bc'|null
  let braceDepth = 0;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];
    const nxt = content[i + 1];

    if (depth === 0) {
      // In template text - escape ` and ${
      if (ch === '\\' && (nxt === '`' || (nxt === '$' && content[i+2] === '{') || nxt === '\\' || nxt === '$')) {
        // Already escaped, preserve as-is
        out += ch + nxt;
        i += 2;
        continue;
      }
      if (ch === '`') {
        out += '\\`';
        i++;
        continue;
      }
      if (ch === '$' && nxt === '{') {
        out += '\\${';
        i += 2;
        depth = 1;
        braceDepth = 1;
        str = null;
        continue;
      }
      out += ch;
      i++;
    } else {
      // Inside ${...} - preserve code, but escape nested template literals
      if (str === 's1') {
        if (ch === '\\') { out += ch + nxt; i += 2; continue; }
        if (ch === "'") { str = null; }
        out += ch;
        i++;
        continue;
      }
      if (str === 's2') {
        if (ch === '\\') { out += ch + nxt; i += 2; continue; }
        if (ch === '"') { str = null; }
        out += ch;
        i++;
        continue;
      }
      if (str === 'bt') {
        // Nested template literal - also escape backticks and ${ here
        if (ch === '\\' && (nxt === '`' || (nxt === '$' && content[i+2] === '{') || nxt === '\\')) {
          out += ch + nxt;
          i += 2;
          continue;
        }
        if (ch === '`') {
          out += '\\`';
          str = null;
          braceDepth--;
          i++;
          continue;
        }
        if (ch === '$' && nxt === '{') {
          out += '\\${';
          braceDepth++;
          i += 2;
          continue;
        }
        // Track braces inside nested template (for closing ${...} that opened it)
        if (ch === '{') braceDepth++;
        if (ch === '}') {
          braceDepth--;
          if (braceDepth < depth) {
            // Edge case: closes outer expression
            depth = 0;
          }
        }
        out += ch;
        i++;
        continue;
      }
      if (str === 'lc') {
        if (ch === '\n') str = null;
        out += ch;
        i++;
        continue;
      }
      if (str === 'bc') {
        if (ch === '*' && nxt === '/') { str = null; out += ch + nxt; i += 2; continue; }
        out += ch;
        i++;
        continue;
      }
      // Not in string/comment - track code
      if (ch === "'") { str = 's1'; out += ch; i++; continue; }
      if (ch === '"') { str = 's2'; out += ch; i++; continue; }
      if (ch === '`') {
        str = 'bt';
        braceDepth++;
        out += '\\`';
        i++;
        continue;
      }
      if (ch === '/' && nxt === '/') { str = 'lc'; out += ch + nxt; i += 2; continue; }
      if (ch === '/' && nxt === '*') { str = 'bc'; out += ch + nxt; i += 2; continue; }
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          depth = 0;
        }
      }
      out += ch;
      i++;
    }
  }
  return out;
}

function fixFile(filepath) {
  let src = fs.readFileSync(filepath, 'utf8');
  let out = '';
  let i = 0;

  while (i < src.length) {
    const contentIdx = src.indexOf('content:', i);
    if (contentIdx === -1) {
      out += src.substring(i);
      break;
    }

    out += src.substring(i, contentIdx);
    out += 'content:';

    // Skip whitespace after content:
    let p = contentIdx + 8;
    while (p < src.length && (src[p] === ' ' || src[p] === '\t')) {
      out += src[p];
      p++;
    }

    if (src[p] !== '`') {
      i = p;
      continue;
    }

    out += '`';
    p++;

    // Find the closing backtick: a backtick at depth=0 that is followed
    // (on the same line, after optional spaces/tabs) by a comma.
    // This is the key insight: in the file structure, content value's closing
    // backtick is always backtick-comma (`,) with no newline between them.
    let depth = 0;
    let str = null;
    let braceDepth = 0;
    let end = -1;
    let contentStart = p;

    for (let k = p; k < src.length; k++) {
      const ch = src[k];
      const nxt = src[k + 1];

      if (depth === 0) {
        if (ch === '\\') { k++; continue; }
        if (ch === '`') {
          // After a backtick at depth 0, check if this closes a content block.
          // Pattern: backtick, optional spaces/tabs, comma, then on next line "  },"
          // (or "  }" at end of file followed by ];)
          let r = k + 1;
          while (r < src.length && (src[r] === ' ' || src[r] === '\t')) r++;
          if (src[r] === ',') {
            const after = src.substring(r + 1);
            // Accept: optional \r, \n, "  },", or \r, \n, "  }", \n, whitespace, "];"
            const ok = /^\r?\n  \},/.test(after) || /^\r?\n  \}\r?\n\s*\];/.test(after);
            if (ok) {
              end = k;
              break;
            }
          }
          continue;
        }
        if (ch === '$' && nxt === '{') {
          depth = 1;
          braceDepth = 1;
          str = null;
          k++;
          continue;
        }
      } else {
        if (str === 's1') {
          if (ch === '\\') { k++; continue; }
          if (ch === "'") str = null;
          continue;
        }
        if (str === 's2') {
          if (ch === '\\') { k++; continue; }
          if (ch === '"') str = null;
          continue;
        }
        if (str === 'bt') {
          if (ch === '\\') { k++; continue; }
          if (ch === '`') { str = null; braceDepth--; continue; }
          if (ch === '$' && nxt === '{') { braceDepth++; k++; continue; }
          if (ch === '}') {
            braceDepth--;
            if (braceDepth < depth) { depth = 0; }
          }
          continue;
        }
        if (str === 'lc') { if (ch === '\n') str = null; continue; }
        if (str === 'bc') { if (ch === '*' && nxt === '/') { str = null; k++; } continue; }
        if (ch === "'") { str = 's1'; continue; }
        if (ch === '"') { str = 's2'; continue; }
        if (ch === '`') { str = 'bt'; braceDepth++; continue; }
        if (ch === '/' && nxt === '/') { str = 'lc'; k++; continue; }
        if (ch === '/' && nxt === '*') { str = 'bc'; k++; continue; }
        if (ch === '{') braceDepth++;
        if (ch === '}') {
          braceDepth--;
          if (braceDepth === 0) depth = 0;
        }
      }
    }

    if (end === -1) {
      // Can't find closing backtick - output rest and warn
      console.error('WARNING: Could not find closing backtick for content at', contentIdx);
      out += src.substring(p);
      break;
    }

    const rawContent = src.substring(contentStart, end);
    const escaped = escapeContent(rawContent);
    out += escaped;
    out += '`';
    i = end + 1;
  }

  fs.writeFileSync(filepath, out, 'utf8');
  console.log('Fixed:', path.basename(filepath), 'size:', (out.length/1024).toFixed(1) + 'KB');
}

const dataDir = path.join(__dirname, 'app/courses-data');
for (let i = 1; i <= 6; i++) {
  const f = path.join(dataDir, `tsrx-chapters-batch${i}.js`);
  if (fs.existsSync(f)) {
    fixFile(f);
  } else {
    console.log('Skip (not found):', path.basename(f));
  }
}
console.log('Done!');
