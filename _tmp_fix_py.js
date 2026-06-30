const fs = require('fs');
const file = '/Users/zhaoliangshun/nextStudy/my-app/app/py-chapters-batch4.js';
let content = fs.readFileSync(file, 'utf8');

// ============================================================
// Fix 1: py-decorators - rename decorator `repeat` to `repeat_decorator`
// to avoid shadowing itertools.repeat
// ============================================================
// The decorator definition and usage are in the CODE field (not content).
// Line 768: def repeat(times): -> def repeat_decorator(times):
// Line 780: @repeat(3) -> @repeat_decorator(3)
// These are unique in the code field context.

// Find the code field for py-decorators and do targeted replacement.
// The decorator def line:
content = content.replace(
  'def repeat(times):\n    def decorator(func):',
  'def repeat_decorator(times):\n    def decorator(func):'
);
// The decorator usage:
content = content.replace(
  '@repeat(3)\ndef say(name):',
  '@repeat_decorator(3)\ndef say(name):'
);

// ============================================================
// Fix 2: py-stdlib - double backslashes in regex patterns
// The JS template literal strips single backslashes (\d -> d, \w -> w).
// Need \\d, \\w, \\s, \\. in source so Python gets \d, \w, \s, \.
// ============================================================

// These are in the CODE field (after line ~2378), identified by unique context.
// Line 2556+2557 (code field): unique due to print("  电话:" ...)
content = content.replace(
  'm = re.search(r"\\d{3}-\\d{4}-\\d{4}", text)\nprint("  电话:", m.group() if m else "无")',
  'm = re.search(r"\\\\d{3}-\\\\d{4}-\\\\d{4}", text)\nprint("  电话:", m.group() if m else "无")'
);

// Line 2558: unique due to print("  所有数字:"
content = content.replace(
  'print("  所有数字:", re.findall(r"\\d+", "a1 b22 c333"))',
  'print("  所有数字:", re.findall(r"\\\\d+", "a1 b22 c333"))'
);

// Line 2559: unique due to print("  替换:"
content = content.replace(
  'print("  替换:", re.sub(r"\\d", "*", "a1b2c3"))',
  'print("  替换:", re.sub(r"\\\\d", "*", "a1b2c3"))'
);

// Line 2560: unique due to print("  分割:"
content = content.replace(
  'print("  分割:", re.split(r"[\\s,]+", "a, b , c  d"))',
  'print("  分割:", re.split(r"[\\\\s,]+", "a, b , c  d"))'
);

// Line 2562: unique due to ", text)" at end (content has "tom@example.com")
content = content.replace(
  'm = re.search(r"(?P<user>\\w+)@(?P<domain>\\w+\\.\\w+)", text)',
  'm = re.search(r"(?P<user>\\\\w+)@(?P<domain>\\\\w+\\\\.\\\\w+)", text)'
);

fs.writeFileSync(file, content, 'utf8');
console.log('py-chapters-batch4.js updated');

// Verify
const { chapters } = require(file);
const stdlib = chapters.find(c => c.id === 'py-stdlib');
const lines = stdlib.code.split('\n');
lines.forEach((l, i) => {
  if (l.includes('re.search') || l.includes('re.findall') || l.includes('re.sub') || l.includes('re.split') || l.includes('.group(')) {
    console.log(i + 1, JSON.stringify(l));
  }
});
const decorators = chapters.find(c => c.id === 'py-decorators');
const dlines = decorators.code.split('\n');
dlines.forEach((l, i) => {
  if (l.includes('repeat_decorator') || (l.includes('repeat') && !l.includes('itertools') && !l.includes('#'))) {
    console.log('DEC', i + 1, JSON.stringify(l));
  }
});
