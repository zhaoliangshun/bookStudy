// =============================================================
// Batch 8：文件与IO（4 章）
// 13. py5-file-text    文本文件读写：with open、encoding、read/readline/readlines
// 14. py5-file-binary  二进制文件、rb/wb、seek/tell、struct
// 15. py5-pathlib      pathlib.Path 现代化路径操作
// 16. py5-serial       序列化：json、csv、tomllib、configparser
// =============================================================

export const chapters = [
  {
    id: "py5-file-text",
    group: "文件与IO",
    icon: "📄",
    title: "文本文件读写",
    content: `
- \`with open(path, mode, encoding="utf-8") as f:\` 上下文管理器自动关闭
- 模式：\`r\`读(默认) / \`w\`写(覆盖) / \`a\`追加 / \`r+\`读写 / \`x\`新建
- \`f.read()\` 全部；\`f.readline()\` 一行；\`f.readlines()\` 所有行列表
- \`f.write(s)\` / \`f.writelines(lines)\` 写入
- 直接迭代文件对象可逐行读取（省内存）
- 始终指定 \`encoding="utf-8"\` 避免平台依赖问题
`,
    code: `import tempfile
import os

with tempfile.TemporaryDirectory() as tmpdir:
    path = os.path.join(tmpdir, "demo.txt")

    # 写文件
    with open(path, "w", encoding="utf-8") as f:
        f.write("第一行：你好，Python！\\n")
        f.write("第二行：文件IO基础\\n")
        f.writelines(["第三行\\n", "第四行\\n"])
    print("写入完成")

    # 一次性读取全部
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    print("--- read() 全部内容 ---")
    print(content, end="")

    # 逐行迭代（大文件推荐）
    print("--- 逐行迭代 ---")
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            print(f"  行{i}: {line.rstrip()}")

    # readlines 列表
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print("readlines 共", len(lines), "行")

    # 追加模式
    with open(path, "a", encoding="utf-8") as f:
        f.write("第五行：追加的内容\\n")
    with open(path, "r", encoding="utf-8") as f:
        print("追加后共", len(f.readlines()), "行")
print("临时目录已自动删除")
`,
  },
  {
    id: "py5-file-binary",
    group: "文件与IO",
    icon: "💾",
    title: "二进制文件与 struct",
    content: `
- 模式加 \`b\`：\`rb\` / \`wb\` / \`ab\`，读写 \`bytes\` 类型
- \`f.tell()\` 返回当前文件指针位置（字节偏移）
- \`f.seek(offset, whence)\` 移动指针：whence=0开头/1当前/2末尾
- \`struct\` 模块：Python 值 ↔ C 结构体（二进制字节串）
- \`struct.pack("格式", v1, v2)\` 打包；\`struct.unpack("格式", data)\` 解包
- 常用格式：\`i\`int(4B) / \`f\`float(4B) / \`d\`double(8B) / \`?\`bool
`,
    code: `import tempfile
import os
import struct

with tempfile.TemporaryDirectory() as tmpdir:
    path = os.path.join(tmpdir, "data.bin")

    # 写入二进制：打包一个 int + double + bool
    header_format = "<id?"  # little-endian: int, double, bool
    magic = 0x504B0304
    pi = 3.141592653589793
    is_valid = True

    with open(path, "wb") as f:
        data = struct.pack(header_format, magic, pi, is_valid)
        print("打包字节数:", len(data), "字节")
        f.write(data)
        # 再写一些原始字节
        f.write(bytes([0x48, 0x65, 0x6C, 0x6C, 0x6F]))  # "Hello"

    # 读取二进制
    with open(path, "rb") as f:
        print("初始位置:", f.tell())
        header_size = struct.calcsize(header_format)
        header_data = f.read(header_size)
        m, p, v = struct.unpack(header_format, header_data)
        print(f"magic=0x{m:08X}, pi={p:.6f}, valid={v}")
        print("当前位置:", f.tell())
        rest = f.read()
        print("剩余字节:", rest, "->", rest.decode("ascii"))

        # seek 演示：回到文件开头
        f.seek(0)
        first4 = f.read(4)
        print("seek(0)后读4字节:", first4.hex())
        # 从当前位置向前跳2字节
        f.seek(2, 1)
        print("seek(2,1)后位置:", f.tell())

    print("文件大小:", os.path.getsize(path), "字节")
print("临时文件已清理")
`,
  },
  {
    id: "py5-pathlib",
    group: "文件与IO",
    icon: "🛤️",
    title: "pathlib 现代化路径",
    content: `
- \`pathlib.Path\` 是 Python 3.4+ 的面向对象路径 API
- \`/\` 运算符拼接路径：\`Path("/tmp") / "sub" / "file.txt"\`
- 属性：\`.name\` / \`.stem\` / \`.suffix\` / \`.parent\` / \`.parents\`
- 方法：\`.exists()\` / \`.is_file()\` / \`.is_dir()\` / \`.mkdir()\`
- 遍历：\`.iterdir()\` / \`.glob("*.py")\` / \`.rglob("*.py")\` 递归
- 读写：\`.read_text()\` / \`.write_text()\` / \`.read_bytes()\` / \`.write_bytes()\`
`,
    code: `from pathlib import Path
import tempfile
import os

with tempfile.TemporaryDirectory() as tmpdir:
    base = Path(tmpdir)
    print("base:", base)

    # / 运算符拼接路径
    subdir = base / "subdir"
    subdir.mkdir(exist_ok=True)
    f1 = subdir / "hello.txt"
    f2 = subdir / "data.json"
    nested = subdir / "deep" / "nested"
    nested.mkdir(parents=True, exist_ok=True)

    # 写文件
    f1.write_text("Hello, pathlib!", encoding="utf-8")
    f2.write_text('{"key": "value"}', encoding="utf-8")
    (nested / "log.txt").write_text("deep log", encoding="utf-8")

    # 路径属性
    print("f1.name:", f1.name)
    print("f1.stem:", f1.stem)
    print("f1.suffix:", f1.suffix)
    print("f1.parent:", f1.parent)
    print("f1.parent.parent:", f1.parent.parent)

    # 检查
    print("f1.exists():", f1.exists())
    print("f1.is_file():", f1.is_file())
    print("subdir.is_dir():", subdir.is_dir())

    # iterdir 遍历子目录
    print("--- iterdir subdir/ ---")
    for p in sorted(subdir.iterdir()):
        print(" ", p.name, "(dir)" if p.is_dir() else "(file)")

    # glob 匹配
    print("--- glob *.txt ---")
    for p in sorted(subdir.glob("*.txt")):
        print(" ", p.name)

    # rglob 递归
    print("--- rglob *.txt (递归) ---")
    for p in sorted(subdir.rglob("*.txt")):
        print(" ", p.relative_to(base))

    # read_text
    print("f1 content:", f1.read_text(encoding="utf-8"))
print("临时目录已清理")
`,
  },
  {
    id: "py5-serial",
    group: "文件与IO",
    icon: "🔄",
    title: "序列化：json/csv/toml/configparser",
    content: `
- \`json\`：\`dump/load\` 文件；\`dumps/loads\` 字符串；\`indent\` 美化
- \`csv\`：\`reader/writer\` 行列；\`DictReader/DictWriter\` 按字典读写
- \`tomllib\`（3.11+ 内置）：读 TOML 配置（写入需第三方包 tomli-w）
- \`configparser\`：读写 INI 格式配置文件
- 这些都只使用标准库，无需安装第三方包
- 所有文件操作在 \`TemporaryDirectory\` 中完成，自动清理
`,
    code: `import tempfile
import os
import json
import csv
import tomllib
import configparser
from pathlib import Path

with tempfile.TemporaryDirectory() as tmpdir:
    base = Path(tmpdir)

    # === JSON ===
    data = {"name": "小明", "age": 20, "scores": [90, 85, 92], "active": True}
    json_path = base / "data.json"
    json.dump(data, open(json_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    loaded = json.load(open(json_path, "r", encoding="utf-8"))
    print("json load name:", loaded["name"])
    print("json dumps:", json.dumps([1, 2, 3]))

    # === CSV ===
    csv_path = base / "users.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "age", "city"])
        writer.writeheader()
        writer.writerow({"name": "小明", "age": "20", "city": "北京"})
        writer.writerow({"name": "小红", "age": "22", "city": "上海"})
        writer.writerows([
            {"name": "小刚", "age": "21", "city": "广州"},
        ])
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            print("csv row:", row["name"], row["age"], row["city"])

    # === TOML (Python 3.11+ 内置 tomllib) ===
    toml_path = base / "config.toml"
    toml_path.write_text('''[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
debug = true
port = 8080
''', encoding="utf-8")
    with open(toml_path, "rb") as f:
        toml_data = tomllib.load(f)
    print("toml db host:", toml_data["database"]["host"])
    print("toml server port:", toml_data["server"]["port"])

    # === configparser (INI) ===
    ini_path = base / "app.ini"
    config = configparser.ConfigParser()
    config["general"] = {"app_name": "MyApp", "version": "1.0"}
    config["database"] = {"host": "localhost", "port": "3306"}
    with open(ini_path, "w", encoding="utf-8") as f:
        config.write(f)
    config2 = configparser.ConfigParser()
    config2.read(ini_path, encoding="utf-8")
    print("ini app_name:", config2["general"]["app_name"])
    print("ini db port:", config2["database"]["port"])
print("所有序列化演示完成，临时文件已清理")
`,
  },
];
