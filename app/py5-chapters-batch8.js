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
## 概述
Python 文本文件读写通过内置 \`open()\` 函数完成，配合 \`with\` 语句自动管理资源，是日常 IO 处理的基础。

## 核心要点
- **with 上下文管理**: \`with open(path, "r", encoding="utf-8") as f:\` - 自动关闭文件，即使异常也能保证资源释放
- **打开模式**: \`r\` 读(默认) / \`w\` 覆盖写 / \`a\` 追加 / \`x\` 新建独占 / \`r+\` 读写 - 不同模式决定文件指针初始位置与行为
- **读取全部**: \`f.read()\` 返回整个文件字符串；可选参数 \`f.read(n)\` 读取 n 个字符
- **逐行读取**: \`f.readline()\` 读一行（含 \`\\n\`）；\`f.readlines()\` 返回所有行的列表
- **迭代文件对象**: \`for line in f:\` 逐行迭代，惰性读取省内存，处理大文件首选
- **写入方法**: \`f.write(s)\` 写字符串；\`f.writelines(lines)\` 批量写（不会自动加换行）
- **encoding 参数**: 始终显式 \`encoding="utf-8"\`，避免 Windows 默认 GBK / Linux 默认 UTF-8 跨平台乱码
- **newline 控制**: 写文本时 \`newline=""\` 关闭通用换行转换，CSV 等场景必备

## 原理与机制
- **缓冲区机制**: 文本 IO 默认经过 \`BufferedIOBase\` 包装，写入先到内存缓冲区，\`close()\` 或 \`flush()\` 时落盘
- **with 工作原理**: 调用对象的 \`__enter__\` 返回文件对象，退出时 \`__exit__\` 调用 \`close()\`，异常路径也能正确释放
- **通用换行模式**: 默认 \`newline=None\` 会把 \`\\r\\n\` / \`\\r\` 都翻译为 \`\\n\`，写入时 \`\\n\` 翻译为 \`os.linesep\`
- **文件指针**: 读写字符自动前移，\`seek()\` 可重新定位（文本模式仅支持 \`seek(0, 0)\` 等受限操作）

## 易错点与陷阱
- **忘记 encoding**: 跨平台运行时默认编码不同，Windows 下读 UTF-8 文件易出现 \`UnicodeDecodeError\`
- **w 模式覆盖**: \`open(path, "w")\` 会立即清空文件，误用导致数据丢失，写之前先确认
- **readlines 内存**: 大文件 \`readlines()\` 会一次性加载全部行，应改用 \`for line in f\` 迭代
- **writelines 无换行**: \`writelines(["a", "b"])\` 写出的是 \`ab\` 而非 \`a\\nb\\n\`，需手动加 \`\\n\`

## 实战建议
- **优先 with + pathlib**: 现代 Python 推荐 \`Path.read_text(encoding="utf-8")\` 一行完成简单读写
- **大文件流式处理**: 用 \`for line in f\` 逐行处理 GB 级日志，避免 OOM
- **追加日志**: 日志写入用 \`mode="a"\` 追加，配合 \`with\` 保证文件句柄释放
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
## 概述
二进制文件以 \`bytes\` 为单位读写，配合 \`seek/tell\` 控制文件指针，\`struct\` 模块用于打包/解包 C 风格二进制结构。

## 核心要点
- **二进制模式**: \`open(path, "rb")\` / \`"wb"\` / \`"ab"\` - 读写 \`bytes\` 而非 \`str\`，不做编码转换
- **tell 查位置**: \`f.tell()\` 返回当前文件指针字节偏移量
- **seek 移指针**: \`f.seek(offset, whence)\` - whence=0 文件头 / 1 当前 / 2 末尾，二进制模式三参数都支持
- **struct.pack**: \`struct.pack("<id?", v1, v2, v3)\` 按格式将 Python 值打包成 \`bytes\`
- **struct.unpack**: \`struct.unpack("<id?", data)\` 解包，返回元组
- **calcsize**: \`struct.calcsize("<id?")\` 计算格式对应字节数，便于预读定长头
- **字节序**: \`<\` 小端 / \`>\` 大端 / \`!\` 网络序 / \`=\` 本机默认 / 不写则本机
- **常用格式符**: \`i\` int(4B) / \`f\` float(4B) / \`d\` double(8B) / \`?\` bool(1B) / \`s\` 字节串

## 原理与机制
- **二进制无编码层**: 与文本模式相比少了 \`TextIOWrapper\`，读写原始字节，效率更高
- **seek 限制差异**: 文本模式仅支持 \`seek(0, 0)\` 等绝对定位；二进制模式可任意 \`seek(offset, 1)\` 相对跳转
- **struct 对齐**: 默认格式无填充，含非原生字节序时不强制对齐；\`@\` 前缀才按本机对齐
- **缓冲区与 flush**: 二进制写入先入缓冲区，\`flush()\` 刷出但未落盘，\`os.fsync(f.fileno())\` 才强制落盘

## 易错点与陷阱
- **模式混淆**: 文本模式读二进制文件会 \`UnicodeDecodeError\`；二进制模式读文本会得到 \`bytes\`
- **seek 越界**: \`seek\` 到文件末尾之后读返回空 \`b""\`，写入则生成稀疏文件
- **格式与数据不匹配**: 用 \`i\` 解 8 字节 double 会错位，须严格匹配打包格式
- **字节序坑**: 跨平台读取不同字节序文件，忘记 \`<\` / \`>\` 会得到错误数值

## 实战建议
- **协议解析**: 网络协议多用 \`<\` 小端 + 定长头 + 变长体的设计，先 \`calcsize\` 读头再读体
- **大文件块读写**: 用 \`f.read(chunk_size)\` 分块迭代处理，避免一次性加载
- **配合 pathlib**: \`Path.write_bytes(data)\` / \`read_bytes()\` 一行完成简单二进制 IO
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
## 概述
\`pathlib.Path\` 是 Python 3.4+ 引入的面向对象路径 API，替代 \`os.path\` 的字符串拼接，是现代推荐的路径操作方式。

## 核心要点
- **路径拼接**: \`Path("/tmp") / "sub" / "file.txt"\` - \`/\` 运算符直观安全，自动处理分隔符
- **路径属性**: \`.name\` 文件名 / \`.stem\` 主名 / \`.suffix\` 扩展名 / \`.parent\` 父目录 / \`.parents\` 祖先链
- **存在与类型**: \`.exists()\` / \`.is_file()\` / \`.is_dir()\` / \`.is_symlink()\` 检查路径状态
- **目录创建**: \`.mkdir(exist_ok=True)\` 单层；\`.mkdir(parents=True, exist_ok=True)\` 递归创建
- **遍历目录**: \`.iterdir()\` 列出直接子项；\`.glob("*.py")\` 模式匹配；\`.rglob("*.py")\` 递归匹配
- **便捷读写**: \`.read_text(encoding="utf-8")\` / \`.write_text(s)\` / \`.read_bytes()\` / \`.write_bytes(b)\` 一行完成
- **路径变换**: \`.resolve()\` 绝对路径 / \`.relative_to(base)\` 相对路径 / \`.with_suffix(".txt")\` 改后缀
- **PurePath 分类**: \`PurePosixPath\` / \`PureWindowsPath\` 可在不跨平台情况下操作异类路径

## 原理与机制
- **对象不可变**: \`Path\` 对象一旦创建不可修改，\`/\` 运算返回新对象，安全可哈希
- **延迟求值**: \`.iterdir()\` / \`.glob()\` 返回生成器，按需遍历，省内存
- **跨平台抽象**: 自动使用当前系统分隔符；\`PurePath\` 子类可在不同系统间模拟
- **与 os.path 互转**: \`str(p)\` 转 \`os.path\` 字符串；\`Path(s)\` 转回对象，二者互操作无障碍

## 易错点与陷阱
- **未指定 encoding**: \`read_text()\` 默认用系统编码，跨平台读 UTF-8 应显式 \`encoding="utf-8"\`
- **glob 大小写**: Windows 文件系统不区分大小写，POSIX 区分，跨平台脚本需注意匹配模式
- **mkdir 已存在**: 默认 \`mkdir()\` 目录已存在会抛 \`FileExistsError\`，应加 \`exist_ok=True\`
- **rmdir 非空**: \`Path.rmdir()\` 仅删空目录，删非空目录要用 \`shutil.rmtree(p)\`

## 实战建议
- **统一用 pathlib**: 新代码优先 \`pathlib\`，告别 \`os.path.join\` 字符串拼接的混乱
- **rglob 批处理**: 递归处理项目文件用 \`Path(".").rglob("*.py")\`，简洁且高效
- **配合 with**: \`with path.open("r", encoding="utf-8") as f:\` 路径对象直接打开文件
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
## 概述
Python 标准库提供四种主流序列化方案：\`json\` 通配数据交换、\`csv\` 表格、\`tomllib\` 配置、\`configparser\` INI 配置。

## 核心要点
- **json.dump/load**: \`json.dump(obj, f)\` 写文件；\`json.load(f)\` 读文件
- **json.dumps/loads**: \`dumps(obj)\` 转 \`str\`；\`loads(s)\` 从 \`str\` 解析
- **json 美化**: \`json.dump(obj, f, indent=2, ensure_ascii=False)\` 缩进 + 中文不转义
- **csv.reader/writer**: 行列表读写；\`csv.DictReader/DictWriter\` 按字段名字典读写
- **csv 换行**: 写入必须 \`open(path, "w", newline="")\`，否则 Windows 会多出空行
- **tomllib（3.11+）**: \`tomllib.load(f)\` 读二进制模式；标准库只读，写需第三方 \`tomli-w\`
- **configparser**: 解析 INI 格式，\`config["section"]["key"]\` 访问；值统一为字符串
- **数据类型差异**: json 支持 list/dict/str/int/float/bool/None；toml 支持 datetime；ini 全是字符串

## 原理与机制
- **json 编码**: Python dict ↔ JSON object；写入时默认 \`ensure_ascii=True\` 把中文转 \`\\uXXXX\`
- **csv 协议层**: \`csv\` 模块按 RFC 4180 处理引号 / 逗号 / 换行，自动加引号转义
- **tomllib 二进制**: 严格规定以二进制模式 \`open("rb")\` 打开，避免编码层干扰
- **configparser 分区**: 用 \`[section]\` 分组，键值用 \`=\` 或 \`:\` 分隔，DEFAULT 段作为默认值继承

## 易错点与陷阱
- **json 重复键**: 标准 JSON 不允许重复键，遇到时后者覆盖前者；自定义需子类化 \`JSONDecoder\`
- **csv 编码**: 中文 CSV 用 Excel 打开乱码，可写 BOM 或改用 \`utf-8-sig\` 编码
- **tomllib 只读**: 标准库无 \`dump\`，写 TOML 必须装 \`tomli-w\` 或 \`tomlkit\` 第三方包
- **类型丢失**: configparser 读出的 port 是字符串 \`"3306"\`，需手动 \`int()\` 转换

## 实战建议
- **配置优先 TOML**: 新项目用 \`pyproject.toml\` + \`tomllib\`，比 INI 类型丰富、比 JSON 注释友好
- **CSV 用 DictReader**: 表头清晰可读，避免按索引取列的脆弱代码
- **json 调试**: 临时输出用 \`json.dumps(obj, indent=2, ensure_ascii=False)\` 方便人眼查看
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
