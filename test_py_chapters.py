#!/usr/bin/env python3
"""通过 /api/run-py 测试所有 Python 教程章节的运行时正确性。

策略：
1. 提取每个章节的 Python 代码
2. 跳过导入第三方库的章节（fastapi, requests, numpy 等）
3. 跳过包含 input() 的章节（会阻塞）
4. 跳过包含模板插值 ${} 的章节（无法解析）
5. 通过 API 运行剩余章节，记录失败结果

用法：
    python3.13 test_py_chapters.py
"""

import ast
import json
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

APP_DIR = Path("/Users/test/bookStudy/app")
API_URL = "http://localhost:3000/api/run-py"

# 已知的第三方库名称（这些库不在标准库中，无法在沙箱运行）
THIRD_PARTY_LIBS = {
    "requests", "numpy", "pandas", "matplotlib", "flask", "django",
    "scrapy", "bs4", "beautifulsoup4", "selenium", "playwright",
    "aiohttp", "httpx", "uvicorn", "sqlalchemy", "tortoise",
    "pydantic", "fastapi", "starlette", "redis", "pymongo",
    "psycopg2", "mysql", "jinja2", "pyyaml", "yaml", "toml",
    "crypto", "cryptography", "pillow", "cv2", "tensorflow",
    "torch", "sklearn", "scikit", "lxml", "openpyxl", "xlrd",
    "xlwt", "docx", "pptx", "phonenumbers", "qrcode", "PIL",
    "PyQt5", "PySide2", "tkinter", "kivy", "pyqt", "pyside",
    "redis", "pika", "kombu", "celery", " APScheduler",
    "pytest", "unittest", "mock", "freezegun", "hypothesis",
    "black", "flake8", "pylint", "isort", "ruff", "mypy",
    "click", "typer", "rich", "tqdm", "loguru", "structlog",
    "django", "jinja2", "werkzeug", "gunicorn", "gevent",
    "eventlet", "twisted", "tornado", "sanic", "quart",
    "databases", "tortoise", "orm", "peewee", "pony",
    "alembic", "migrate", "faker", "factory",
    "apscheduler", "schedule", "crontab",
    "wagtail", "mezzanine", "django-cms",
    "rest_framework", "graphene", "strawberry",
    "channels", "websockets", "socketio",
    "boto3", "botocore", "azure", "google.cloud",
    "docker", "kubernetes", "ansible",
    "psutil", "sh", "plumbum", "invoke", "fabric",
}

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
    """提取 JS 文件中所有 code: `...` 模板字符串中的 Python 代码。"""
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
                if next_c == '\\':
                    code_chars.append('\\')
                    j += 2
                elif next_c == '`':
                    code_chars.append('`')
                    j += 2
                elif next_c == '$':
                    code_chars.append('$')
                    j += 2
                elif next_c == 'n':
                    code_chars.append('\n')
                    j += 2
                elif next_c == 't':
                    code_chars.append('\t')
                    j += 2
                elif next_c == 'r':
                    code_chars.append('\r')
                    j += 2
                else:
                    code_chars.append(next_c)
                    j += 2
            elif c == '`':
                break
            elif c == '$' and j + 1 < n and content[j + 1] == '{':
                depth = 1
                k = j + 2
                while k < n and depth > 0:
                    if content[k] == '{':
                        depth += 1
                    elif content[k] == '}':
                        depth -= 1
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


def uses_third_party(code):
    """检查代码是否导入了第三方库。"""
    # 找所有 import 语句
    import_patterns = [
        r'^\s*import\s+(\w+)',
        r'^\s*from\s+(\w+)',
    ]
    for pattern in import_patterns:
        for m in re.finditer(pattern, code, re.MULTILINE):
            lib = m.group(1)
            if lib in THIRD_PARTY_LIBS:
                return True, lib
    return False, None


def has_input_call(code):
    """检查代码是否包含 input() 调用（会阻塞）。"""
    # 排除注释中的 input()
    for line in code.split('\n'):
        stripped = line.strip()
        if stripped.startswith('#'):
            continue
        if re.search(r'\binput\s*\(', stripped):
            return True
    return False


def has_template_interpolation(code):
    """检查代码是否包含 JS 模板插值 ${}。"""
    return '${' in code


def run_via_api(code):
    """通过 /api/run-py 运行 Python 代码，返回 (success, output, error)。"""
    try:
        data = json.dumps({"code": code}).encode('utf-8')
        req = urllib.request.Request(
            API_URL,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result.get("exitCode", -1) == 0, result.get("output", ""), result.get("error", "")
    except Exception as e:
        return False, "", str(e)


def main():
    results = {
        "tested": 0,
        "passed": 0,
        "failed": 0,
        "skipped_third_party": 0,
        "skipped_input": 0,
        "skipped_interpolation": 0,
        "failures": [],
    }

    for prefix in PREFIXES:
        pattern = f"{prefix}-chapters-batch*.js"
        files = sorted(APP_DIR.glob(pattern))
        if not files:
            continue

        for f in files:
            try:
                content = f.read_text(encoding='utf-8')
            except Exception:
                continue

            blocks = extract_code_blocks(content)
            for code, start_line in blocks:
                chapter_id, chapter_title = extract_chapter_info(content, start_line)

                # 跳过条件
                if has_template_interpolation(code):
                    results["skipped_interpolation"] += 1
                    continue

                uses_3p, lib_name = uses_third_party(code)
                if uses_3p:
                    results["skipped_third_party"] += 1
                    continue

                if has_input_call(code):
                    results["skipped_input"] += 1
                    continue

                # 运行测试
                results["tested"] += 1
                success, output, error = run_via_api(code)

                if success:
                    results["passed"] += 1
                    print(f"  PASS  {f.name} | {chapter_id}")
                else:
                    results["failed"] += 1
                    # 截取错误的前 200 字符
                    err_short = error[:200] if error else "(no error output)"
                    failure = {
                        "file": f.name,
                        "chapter_id": chapter_id,
                        "chapter_title": chapter_title,
                        "error": err_short,
                    }
                    results["failures"].append(failure)
                    print(f"  FAIL  {f.name} | {chapter_id} ({chapter_title})")
                    print(f"        {err_short}")

    print()
    print("=" * 60)
    print(f"测试完成：")
    print(f"  测试: {results['tested']}, 通过: {results['passed']}, 失败: {results['failed']}")
    print(f"  跳过: 第三方库={results['skipped_third_party']}, input()={results['skipped_input']}, 插值={results['skipped_interpolation']}")
    print("=" * 60)

    with open("/Users/test/bookStudy/py_runtime_errors.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"详情已保存到 py_runtime_errors.json")


if __name__ == "__main__":
    main()
