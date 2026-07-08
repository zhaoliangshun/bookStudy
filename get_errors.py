#!/usr/bin/env python3
"""获取失败章节的完整错误信息。"""
import json
import re
import urllib.request
from pathlib import Path

APP_DIR = Path("/Users/test/bookStudy/app")

# 需要获取完整错误的章节
TARGETS = [
    ("pyrun-chapters-batch2.js", "pyrun-07"),
    ("pyfile2-chapters-batch2.js", "pf-08"),
    ("pyasync-chapters-batch1.js", "pa-02"),
    ("pyasync-chapters-batch2.js", "pa-08"),
    ("pyasync-chapters-batch3.js", "pa-10"),
    ("pyasync2-chapters-batch1.js", "pa2-03"),
    ("pyasync2-chapters-batch3.js", "pa2-11"),
    ("pyprocess-chapters-batch1.js", "mp-04"),
    ("pyprocess-chapters-batch2.js", "mp-05"),
    ("pyprocess-chapters-batch3.js", "mp-09"),
]

def extract_code_blocks(js_content):
    blocks = []
    content = js_content
    n = len(content)
    i = 0
    while i < n:
        m = re.search(r'code:\s*`', content[i:])
        if not m:
            break
        start = i + m.end()
        j = start
        code_chars = []
        while j < n:
            c = content[j]
            if c == '\\' and j + 1 < n:
                next_c = content[j + 1]
                if next_c == '\\': code_chars.append('\\'); j += 2
                elif next_c == '`': code_chars.append('`'); j += 2
                elif next_c == '$': code_chars.append('$'); j += 2
                elif next_c == 'n': code_chars.append('\n'); j += 2
                elif next_c == 't': code_chars.append('\t'); j += 2
                elif next_c == 'r': code_chars.append('\r'); j += 2
                else: code_chars.append(next_c); j += 2
            elif c == '`':
                break
            elif c == '$' and j + 1 < n and content[j + 1] == '{':
                depth = 1
                k = j + 2
                while k < n and depth > 0:
                    if content[k] == '{': depth += 1
                    elif content[k] == '}': depth -= 1
                    k += 1
                code_chars.append(content[j:k])
                j = k
            else:
                code_chars.append(c)
                j += 1
        code = ''.join(code_chars)
        start_line = content[:start].count('\n') + 1
        blocks.append((code, start_line))
        i = j + 1
    return blocks

def extract_chapter_info(js_content, code_start_line):
    lines = js_content.split('\n')
    chapter_id = "?"
    for i in range(min(code_start_line - 1, len(lines) - 1), -1, -1):
        m = re.search(r'id:\s*"([^"]+)"', lines[i])
        if m:
            chapter_id = m.group(1)
            break
    return chapter_id

def run_via_api(code):
    try:
        data = json.dumps({"code": code}).encode('utf-8')
        req = urllib.request.Request(
            "http://localhost:3000/api/run-py",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result
    except Exception as e:
        return {"output": "", "error": str(e), "exitCode": -1}

for filename, target_id in TARGETS:
    filepath = APP_DIR / filename
    if not filepath.exists():
        print(f"文件不存在: {filename}")
        continue
    content = filepath.read_text(encoding='utf-8')
    blocks = extract_code_blocks(content)
    for code, start_line in blocks:
        chapter_id = extract_chapter_info(content, start_line)
        if chapter_id == target_id:
            print(f"{'='*60}")
            print(f"文件: {filename} | 章节: {chapter_id}")
            print(f"代码起始行: {start_line}")
            print(f"{'='*60}")
            result = run_via_api(code)
            print(f"exitCode: {result.get('exitCode')}")
            if result.get('output'):
                print(f"OUTPUT (前 300 字符):")
                print(result['output'][:300])
            if result.get('error'):
                print(f"ERROR (前 500 字符):")
                print(result['error'][:500])
            print()
            break
