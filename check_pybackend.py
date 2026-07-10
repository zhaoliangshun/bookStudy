#!/usr/bin/env python3
"""Find content end and fence issues in pyb-5-5 chapter."""
import re

BT = chr(96)
ESC_BT = chr(92) + BT
TRIPLE_FENCE = ESC_BT * 3

filepath = '/Users/test/bookStudy/app/courses-data/py-backend-chapters-batch5.js'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_chapter = None
in_content = False
in_code_block = False
content_start = None
content_end = None

for i, line in enumerate(lines, 1):
    raw = line.rstrip('\n')
    stripped = raw.strip()

    m = re.match(r'\s*id:\s*"([^"]+)"', raw)
    if m:
        if current_chapter == 'pyb-5-5':
            content_end = i - 1
        current_chapter = m.group(1)
        in_content = False
        in_code_block = False
        if current_chapter == 'pyb-5-5':
            content_start = i
        continue

    content_marker = 'content: ' + BT
    if content_marker in raw:
        in_content = True
        in_code_block = False
        continue

    if in_content and stripped == BT:
        in_content = False
        in_code_block = False
        if current_chapter == 'pyb-5-5':
            content_end = i
        continue

    if not in_content:
        continue

    if current_chapter != 'pyb-5-5':
        continue

    if stripped.startswith(TRIPLE_FENCE):
        after_fence = stripped[len(TRIPLE_FENCE):].strip()
        if not in_code_block:
            in_code_block = True
        else:
            if after_fence == '':
                in_code_block = False
            else:
                print(f"  Line {i}: CATEGORY B: {stripped}")

# Check if we ended still in a code block
if in_code_block:
    print(f"  WARNING: pyb-5-5 content ends while still in code block!")

print(f"\n  pyb-5-5 content: lines {content_start} to {content_end}")
print(f"  in_code_block at end: {in_code_block}")

# Show last 20 lines of content
if content_end:
    print(f"\n  Last 20 lines of pyb-5-5 content:")
    for i in range(max(content_start, content_end - 20), content_end + 1):
        print(f"  {i}: {repr(lines[i-1].rstrip())}")
