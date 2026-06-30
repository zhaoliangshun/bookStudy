// =============================================================
// Batch 8：文件与 IO（4 章）
// 29. py4-file-read    文本读写、with、encoding
// 30. py4-file-binary   二进制读写、seek/tell
// 31. py4-pathlib       pathlib：面向对象路径操作
// 32. py4-serial        json/csv/toml 序列化
// =============================================================

export const chapters = [
  {
    id: "py4-file-read",
    group: "文件与 IO",
    icon: "📄",
    title: "文本文件读写：with、encoding",
    content: `
- 模式：\`r\` 读、\`w\` 写覆盖、\`a\` 追加、\`x\` 创建、\`r+\` 读写
- **with open() as f**：自动关闭，强烈推荐
- **encoding**：生产环境务必显式指定 \`encoding="utf-8"\`
- 读：\`read()\` / \`readline()\` / \`readlines()\`
- 写：\`write()\` / \`writelines()\`
- 逐行迭代：\`for line in f:\`（内存友好）
`,
    code: `import os, tempfile

with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "demo.txt")
    
    # 写文本
    with open(p, "w", encoding="utf-8") as f:
        f.write("第一行\\n")
        f.writelines(["第二行\\n", "第三行\\n"])
    
    # 读全部
    with open(p, "r", encoding="utf-8") as f:
        print("read():", repr(f.read()))
    
    # 按行读
    with open(p, "r", encoding="utf-8") as f:
        print("readlines():", f.readlines())
    
    # 逐行迭代（推荐，内存友好）
    with open(p, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            print(f"line {i}: {line.strip()}")
    
    # 追加
    with open(p, "a", encoding="utf-8") as f:
        f.write("第四行\\n")
    
    with open(p, "r", encoding="utf-8") as f:
        print("after append:", f.read().strip().split("\\n"))

print("done")
`,
  },
  {
    id: "py4-file-binary",
    group: "文件与 IO",
    icon: "💾",
    title: "二进制读写、seek/tell",
    content: `
- 二进制模式：加 \`b\`，如 \`rb\` / \`wb\`
- 二进制读写返回 \`bytes\` 类型
- \`seek(offset, whence)\`：移动文件指针
- \`tell()\`：获取当前指针位置
- 适合：图片、音频、序列化数据
`,
    code: `import os, tempfile

with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "data.bin")
    
    # 写二进制
    with open(p, "wb") as f:
        f.write(b"hello world")
        f.write(bytes([0, 1, 2, 255]))
    
    # 读二进制
    with open(p, "rb") as f:
        data = f.read()
        print("all bytes:", data)
        print("hex:", data.hex())
    
    # seek/tell
    with open(p, "rb") as f:
        print("pos start:", f.tell())
        f.seek(5)
        print("after seek(5):", f.read(3))
        f.seek(0, 2)           # 移到末尾
        print("size:", f.tell())
        f.seek(0)              # 回到开头
        print("after seek(0):", f.read(5))

# 实战：批量写入 + 读取
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "nums.txt")
    with open(p, "w") as f:
        for i in range(100):
            f.write(f"{i}\\n")
    with open(p, "r") as f:
        lines = f.readlines()
        print("wrote 100 lines, first 5:", [l.strip() for l in lines[:5]])

print("done")
`,
  },
  {
    id: "py4-pathlib",
    group: "文件与 IO",
    icon: "📂",
    title: "pathlib：面向对象路径操作",
    content: `
- 用 \`Path\` 对象代替字符串路径
- 构造：\`Path("a/b")\` / \`Path("/tmp") / "x.txt"\` / \`Path.home()\`
- 属性：\`.name / .stem / .suffix / .parent / .parents\`
- 操作：\`.exists() / .is_file() / .mkdir() / .read_text() / .write_text()\`
- 遍历：\`.iterdir() / .glob("*.py") / .rglob("**/*.py")\`
- 推荐替代 \`os.path\` 的常见用法
`,
    code: `import pathlib, tempfile, os

# 构造路径
p = pathlib.Path("a") / "b" / "c.txt"
print("p:", p)
print("name:", p.name, "stem:", p.stem, "suffix:", p.suffix)
print("parent:", p.parent)
print("parents:", [str(x) for x in p.parents])

# 读写
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    f = root / "hello.txt"
    f.write_text("你好，pathlib！", encoding="utf-8")
    print("read:", f.read_text(encoding="utf-8"))
    print("size:", f.stat().st_size, "bytes")
    
    # 创建子目录
    (root / "sub" / "deep").mkdir(parents=True, exist_ok=True)
    for child in root.iterdir():
        print("child:", child.name, "is_dir:", child.is_dir())

# glob / rglob
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    for sub in ["a", "b", "c"]:
        (root / sub).mkdir()
        for i in range(3):
            (root / sub / f"file_{i}.py").write_text(f"# {sub}-{i}")
    print("*.py:", sorted(p.name for p in root.glob("*.py")))
    print("**/*.py:", sorted(str(p.relative_to(root)) for p in root.rglob("*.py")))

# Path vs os.path
print("cwd:", pathlib.Path.cwd())
print("home:", pathlib.Path.home())
print("os.path join:", os.path.join("a", "b", "c"))
print("pathlib join:", pathlib.Path("a") / "b" / "c")
`,
  },
  {
    id: "py4-serial",
    group: "文件与 IO",
    icon: "🧾",
    title: "JSON / CSV / TOML 序列化",
    content: `
- **json**：\`dumps/loads\`（字符串）、\`dump/load\`（文件）
- **csv**：\`reader/writer/DictReader/DictWriter\`
- **tomllib**（3.11+）：\`tomllib.load(f)\` 读 TOML 配置
- JSON 适合接口，CSV 适合表格，TOML 适合项目配置
`,
    code: `import json, csv, io, tempfile, os

# 1) json
data = {"name": "alice", "scores": [90, 85, 92], "active": True}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("json:", s)
print("parse:", json.loads(s)["name"])

# 2) json 文件读写
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "data.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(p, "r", encoding="utf-8") as f:
        print("loaded:", json.load(f))

# 3) csv 读写
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "people.csv")
    rows = [
        {"name": "alice", "age": "30", "city": "Beijing"},
        {"name": "bob", "age": "25", "city": "Shanghai"},
    ]
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["name", "age", "city"])
        w.writeheader()
        w.writerows(rows)
    with open(p, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            print("csv row:", r)

# 4) tomllib（3.11+）
toml_text = '''
[project]
name = "demo"
version = "0.1.0"
[project.dependencies]
fastapi = ">=0.110"
'''
try:
    import tomllib
    print("toml:", tomllib.loads(toml_text)["project"])
except ImportError:
    print("Python < 3.11，没有内置 tomllib")
`,
  },
];