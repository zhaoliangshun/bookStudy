#!/usr/bin/env python3
"""扫描所有 Python 教程 JS 文件，提取其中的 Python 代码并检查语法错误。

用法：
    python3.13 check_py_syntax.py

注意：必须用 python3.13 运行，因为 /api/run-py 使用 python3.13，
教程中包含 except*、PEP 695、match-case 等 3.10+ 语法。
"""

import ast
import os
import re
import sys
import json
from pathlib import Path

APP_DIR = Path("/Users/test/bookStudy/app")

# 需要扫描的所有教程前缀
PREFIXES = [
    "py4", "py6", "py8", "py9",
    "pynet", "pythread", "pythread2", "pyprocess",
    "pydb", "pyint", "pyweb", "pyweb2", "fastapi",
    "pyarch", "pyeng", "pyfile", "pyfile2",
    "pyasync", "pyasync2", "pyproject", "pyjava",
    "pymod", "pyex", "pybasic",
    "pyrun", "pykit", "pyvsjs", "pyvsjava", "pysubprocess",
]


def extract_code_blocks(js_content):
    """提取 JS 文件中所有 `code: \\`...\\`` 模板字符串中的 Python 代码。

    JS 模板字符串转义规则：
      \\\\  → \\        (一个反斜杠)
      \\`   → `         (反引号)
      \\$   → $         (美元符号，避免被当作插值)
      \\n   → 换行符    (但代码块一般用真实换行)
      \\t   → Tab
      \\"   → "         (不必要的转义，但合法)
      \\'   → '         (不必要的转义，但合法)
      其他 \\X  → X     (反斜杠被丢弃)

    返回 [(code_content, start_line), ...]
    """
    blocks = []
    content = js_content
    n = len(content)
    i = 0

    while i < n:
        # 找 code: ` 模式
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
                # JS 模板字符串转义处理
                if next_c == '\\':
                    # \\ → \ (一个反斜杠)
                    code_chars.append('\\')
                    j += 2
                elif next_c == '`':
                    # \` → `
                    code_chars.append('`')
                    j += 2
                elif next_c == '$':
                    # \$ → $
                    code_chars.append('$')
                    j += 2
                elif next_c == 'n':
                    # \n → 换行符
                    code_chars.append('\n')
                    j += 2
                elif next_c == 't':
                    # \t → Tab
                    code_chars.append('\t')
                    j += 2
                elif next_c == 'r':
                    # \r → 回车
                    code_chars.append('\r')
                    j += 2
                else:
                    # \" → ", \' → ', 其他 \X → X
                    # 反斜杠被丢弃，只保留下一个字符
                    code_chars.append(next_c)
                    j += 2
            elif c == '`':
                # 结束反引号
                break
            elif c == '$' and j + 1 < n and content[j + 1] == '{':
                # 模板插值 ${...}，跳过到匹配的 }
                depth = 1
                k = j + 2
                while k < n and depth > 0:
                    if content[k] == '{':
                        depth += 1
                    elif content[k] == '}':
                        depth -= 1
                    k += 1
                # 保留原始插值文本（标记为无法解析）
                code_chars.append(content[j:k])
                j = k
            else:
                code_chars.append(c)
                j += 1

        code = ''.join(code_chars)
        # 计算起始行号
        start_line = content[:start].count('\n') + 1
        blocks.append((code, start_line))
        i = j + 1

    return blocks


def extract_chapter_info(js_content, code_start_line):
    """根据 code 字段的行号，向前查找最近的 id 和 title 字段。"""
    lines = js_content.split('\n')
    chapter_id = "?"
    chapter_title = "?"
    for i in range(min(code_start_line - 1, len(lines) - 1), -1, -1):
        line = lines[i]
        m = re.search(r'id:\s*"([^"]+)"', line)
        if m:
            chapter_id = m.group(1)
            break
    for i in range(min(code_start_line - 1, len(lines) - 1), -1, -1):
        line = lines[i]
        m = re.search(r'title:\s*"([^"]+)"', line)
        if m:
            chapter_title = m.group(1)
            break
    return chapter_id, chapter_title


def check_python_syntax(code):
    """检查 Python 代码语法，返回 (is_valid, error_message)。"""
    # 跳过包含模板插值的代码（无法直接解析）
    if '${' in code:
        return True, None  # 跳过，不报错
    try:
        ast.parse(code)
        return True, None
    except SyntaxError as e:
        return False, f"SyntaxError: {e.msg} (line {e.lineno}): {e.text}"


def main():
    all_errors = []
    files_checked = 0
    chapters_checked = 0
    chapters_with_errors = 0

    for prefix in PREFIXES:
        pattern = f"{prefix}-chapters-batch*.js"
        files = sorted(APP_DIR.glob(pattern))
        if not files:
            continue

        for f in files:
            files_checked += 1
            try:
                content = f.read_text(encoding='utf-8')
            except Exception as e:
                print(f"读取失败 {f.name}: {e}")
                continue

            blocks = extract_code_blocks(content)
            for code, start_line in blocks:
                chapters_checked += 1
                is_valid, err = check_python_syntax(code)
                if not is_valid:
                    chapter_id, chapter_title = extract_chapter_info(content, start_line)
                    chapters_with_errors += 1
                    error_info = {
                        "file": f.name,
                        "chapter_id": chapter_id,
                        "chapter_title": chapter_title,
                        "code_start_line": start_line,
                        "error": err,
                    }
                    all_errors.append(error_info)
                    print(f"X {f.name} | {chapter_id} ({chapter_title})")
                    print(f"  行 {start_line}: {err}")
                    print()

    print("=" * 60)
    print(f"扫描完成：{files_checked} 个文件，{chapters_checked} 个代码块，{chapters_with_errors} 个语法错误")
    print("=" * 60)

    with open("/Users/test/bookStudy/py_syntax_errors.json", "w", encoding="utf-8") as f:
        json.dump(all_errors, f, ensure_ascii=False, indent=2)
    print(f"错误详情已保存到 py_syntax_errors.json")


if __name__ == "__main__":
    main()
