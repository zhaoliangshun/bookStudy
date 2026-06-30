import re, json, sys

APP = "/Users/zhaoliangshun/nextStudy/my-app/app"

def extract_code(filepath, chap_id):
    with open(filepath, "r", encoding="utf-8") as f:
        s = f.read()
    # 找章节（id 可能用单引号或双引号）
    m = re.search(r'id:\s*["\']' + re.escape(chap_id) + r'["\']', s)
    if not m:
        return None, f"未找到章节 {chap_id}"
    start = m.start()
    code_m = re.search(r'code:\s*`', s[start:])
    if not code_m:
        return None, "未找到 code 字段"
    code_start = start + code_m.end()
    i = code_start
    while i < len(s):
        if s[i] == "\\":
            i += 2
            continue
        if s[i] == "`":
            return s[code_start:i], None
        i += 1
    return None, "code 字段未闭合"

def show_lines(code, around, label):
    lines = code.split("\n")
    print(f"\n##### {label} (code 共 {len(lines)} 行) #####")
    # 找包含关键特征的行
    for i, line in enumerate(lines):
        for key in around:
            if key in line:
                lo = max(0, i-2)
                hi = min(len(lines), i+3)
                print(f"--- 含 '{key}' (L{i+1}) ---")
                for j in range(lo, hi):
                    print(f"{j+1:4}: {lines[j]}")
                break

# AI 失败章节
ai_files = [f"{APP}/ai-chapters-batch{i}.js" for i in range(1,9)]
ai_checks = [
    ("ai-era", ["SELECT * FROM", "buildWhereClause"]),
    ("mindset-shift", ["不支持的聚合方法", "throw new Error"]),
    ("ai-code-gen", ["validateEmail", "const spec2"]),
    ("ai-code-completion", ["HTTP ${response.status}", "throw new Error"]),
    ("ai-refactoring", ["╚═══", "console.log('╚"]),
]
for cid, keys in ai_checks:
    for f in ai_files:
        code, err = extract_code(f, cid)
        if code:
            show_lines(code, keys, f"AI {cid} in {f.split('/')[-1]}")
            break
    else:
        print(f"\n[AI {cid}] 未找到: {err}")

# TypeScript #51
ts_files = [f"{APP}/ts-chapters-batch{i}.js" for i in range(1,13)]
for f in ts_files:
    code, err = extract_code(f, "ts-assert-functions")
    if code:
        show_lines(code, ["const assert = require", "require(\"assert\")"], f"TS ts-assert-functions in {f.split('/')[-1]}")
        break

# Python #12 #14
py_files = [f"{APP}/py-chapters-batch{i}.js" for i in range(1,9)]
for cid, keys in [("py-decorators", ["repeat(", ".repeat("]), ("py-stdlib", [".group(", "re.match", "re.search"])]:
    for f in py_files:
        code, err = extract_code(f, cid)
        if code:
            show_lines(code, keys, f"PY {cid} in {f.split('/')[-1]}")
            break

# GraphQL #8 #9 #10 (Syntax Error: Unexpected "/")
gql_files = [f"{APP}/gql-chapters-batch{i}.js" for i in range(1,5)]
for cid in ["gql-relations", "gql-subscription", "gql-pagination"]:
    for f in gql_files:
        code, err = extract_code(f, cid)
        if code:
            print(f"\n##### GQL {cid} in {f.split('/')[-1]} (code 共 {len(code.split(chr(10)))} 行) #####")
            print(code[:800])
            print("... (前800字符)")
            break
