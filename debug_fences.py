#!/usr/bin/env python3
"""Debug fence tracking for a specific chapter."""
import re

BT = chr(96)
ESC_BT = chr(92) + BT
TRIPLE_FENCE = ESC_BT * 3

filepath = '/Users/test/bookStudy/app/courses-data/pyarch-chapters-batch8.js'
target_chapter = 'pyarch-mq-intro'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_chapter = None
in_content = False
in_code_block = False

for i, line in enumerate(lines, 1):
    raw = line.rstrip('\n')
    stripped = raw.strip()

    m = re.match(r'\s*id:\s*"([^"]+)"', raw)
    if m:
        current_chapter = m.group(1)
        in_content = False
        in_code_block = False
        if current_chapter == target_chapter:
            print(f"=== ENTERING CHAPTER: {current_chapter} at line {i} ===")
        continue

    content_marker = 'content: ' + BT
    if content_marker in raw:
        in_content = True
        in_code_block = False
        if current_chapter == target_chapter:
            print(f"  Line {i}: CONTENT START")
        continue

    if in_content and stripped == BT:
        in_content = False
        in_code_block = False
        if current_chapter == target_chapter:
            print(f"  Line {i}: CONTENT END (in_code_block was {in_code_block})")
        continue

    if not in_content:
        continue

    if current_chapter != target_chapter:
        continue

    # Print all fence lines
    if stripped.startswith(TRIPLE_FENCE):
        after_fence = stripped[len(TRIPLE_FENCE):].strip()
        if not in_code_block:
            state = "OPEN"
            in_code_block = True
        else:
            if after_fence == '':
                state = "CLOSE"
                in_code_block = False
            else:
                state = "PROBLEM"
                # stay in block
        print(f"  Line {i}: [{state}] after='{after_fence}' | {stripped[:60]}")
