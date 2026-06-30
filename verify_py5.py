#!/usr/bin/env python3.13
"""通过 Node 提取 code 字段，再用 python3.13 逐章实际运行。"""
import json, subprocess, sys, pathlib, os, time

ROOT = pathlib.Path("/Users/test/bookStudy")
TIMEOUT = 8

def main():
    # 1. 调用 Node 提取
    r = subprocess.run(["node", str(ROOT / "extract_py5.mjs")], capture_output=True, text=True)
    if r.returncode != 0:
        print("Node extract failed:", r.stderr)
        sys.exit(1)
    chapters = json.load(open("/tmp/py5_codes.json"))
    print(f"Extracted {len(chapters)} chapters")

    # 2. 逐章运行
    ok = 0
    fails = []
    for ch in chapters:
        code = ch["code"]
        # 先 compile 语法检查
        try:
            compile(code, f"<{ch['id']}>", "exec")
        except SyntaxError as e:
            fails.append((ch, f"SYNTAX line {e.lineno}: {e.msg}"))
            continue
        try:
            r = subprocess.run(
                ["/opt/homebrew/bin/python3.13", "-c", code],
                capture_output=True, text=True, timeout=TIMEOUT,
                env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
            )
            if r.returncode == 0:
                ok += 1
            else:
                err_line = (r.stderr.strip().splitlines() or ["?"])[-1]
                fails.append((ch, f"RUNTIME: {err_line[:200]}"))
        except subprocess.TimeoutExpired:
            fails.append((ch, f"TIMEOUT >{TIMEOUT}s"))

    for ch, why in fails:
        print(f"  ✗ [{ch['id']}] {ch['title']}")
        print(f"      {why}")
    print(f"\n=== {ok}/{len(chapters)} passed ===")
    sys.exit(0 if not fails else 1)

if __name__ == "__main__":
    main()
