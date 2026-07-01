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
Python 文本文件读写通过内置 \`open()\` 函数完成，配合 \`with\` 语句自动管理资源，是日常 IO 处理的基础。Python 3 提供多种读取方式和编码控制，处理 UTF-8/GBK 等多语言文本时需特别注意 \`encoding\` 参数。

## 核心要点
- **with 上下文管理**: \`with open(path, "r", encoding="utf-8") as f:\` - 自动关闭文件，即使异常也能保证资源释放，避免忘记 \`close()\` 导致句柄泄漏
- **打开模式**: \`r\` 读(默认) / \`w\` 覆盖写 / \`a\` 追加 / \`x\` 新建独占(已存在则报错) / \`r+\` 读写 - 不同模式决定文件指针初始位置与行为
- **读取全部**: \`f.read()\` 返回整个文件字符串；可选参数 \`f.read(n)\` 读取 n 个字符(文本模式按字符数，二进制按字节数)
- **逐行读取**: \`f.readline()\` 读一行(含 \`\\n\`)；\`f.readlines()\` 返回所有行的列表，小文件可用
- **迭代文件对象**: \`for line in f:\` 逐行迭代，惰性读取省内存，处理大文件首选写法
- **写入方法**: \`f.write(s)\` 写字符串(返回写入字符数)；\`f.writelines(lines)\` 批量写(不会自动加换行)
- **encoding 参数**: 始终显式 \`encoding="utf-8"\`，避免 Windows 默认 GBK / Linux 默认 UTF-8 跨平台乱码
- **newline 控制**: 写文本时 \`newline=""\` 关闭通用换行转换，CSV 等场景必备；\`newline="\\n"\` 强制 Unix 换行
- **文件指针操作**: \`f.tell()\` 返回当前位置；\`f.seek(offset)\` 移动指针(文本模式受限)
- **flush 刷缓冲**: \`f.flush()\` 强制把缓冲区写入磁盘但未落盘，\`os.fsync(f.fileno())\` 才真正持久化

## 原理与机制
- **缓冲区机制**: 文本 IO 默认经过 \`BufferedIOBase\` 包装，写入先到内存缓冲区，\`close()\` 或 \`flush()\` 时落盘，提升性能
- **with 工作原理**: 调用对象的 \`__enter__\` 返回文件对象，退出时 \`__exit__(exc_type, exc_val, exc_tb)\` 调用 \`close()\`，异常路径也能正确释放
- **通用换行模式**: 默认 \`newline=None\` 会把 \`\\r\\n\` / \`\\r\` 都翻译为 \`\\n\`，写入时 \`\\n\` 翻译为 \`os.linesep\`，跨平台友好
- **文件指针**: 读写字符自动前移，\`seek()\` 可重新定位(文本模式仅支持 \`seek(0, 0)\` 等受限操作，二进制可任意跳转)
- **TextIOWrapper 层**: 文本模式在二进制 IO 之上叠加 \`TextIOWrapper\`，负责编解码和换行转换

## 易错点与陷阱
- **忘记 encoding**: 跨平台运行时默认编码不同，Windows 下读 UTF-8 文件易出现 \`UnicodeDecodeError\`，PEP 686 在 3.15 才默认 UTF-8
- **w 模式覆盖**: \`open(path, "w")\` 会立即清空文件，误用导致数据丢失，写之前先确认或用 \`x\` 模式
- **readlines 内存**: 大文件 \`readlines()\` 会一次性加载全部行，应改用 \`for line in f\` 迭代
- **writelines 无换行**: \`writelines(["a", "b"])\` 写出的是 \`ab\` 而非 \`a\\nb\\n\`，需手动加 \`\\n\`
- **未关闭句柄**: 不用 \`with\` 时忘记 \`close()\`，长时间运行进程会耗尽文件描述符

## 实战建议
- **优先 with + pathlib**: 现代 Python 推荐 \`Path.read_text(encoding="utf-8")\` 一行完成简单读写，简洁且自动关闭
- **大文件流式处理**: 用 \`for line in f\` 逐行处理 GB 级日志，避免 OOM，必要时配合 \`seek\` 分段
- **追加日志**: 日志写入用 \`mode="a"\` 追加，配合 \`with\` 保证文件句柄释放，多进程需加文件锁
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
二进制文件以 \`bytes\` 为单位读写，配合 \`seek/tell\` 控制文件指针，\`struct\` 模块用于打包/解包 C 风格二进制结构。常用于图片、音视频、网络协议、自定义二进制格式等场景。

## 核心要点
- **二进制模式**: \`open(path, "rb")\` / \`"wb"\` / \`"ab"\` / \`"rb+"\` - 读写 \`bytes\` 而非 \`str\`，不做编码转换
- **tell 查位置**: \`f.tell()\` 返回当前文件指针字节偏移量，单位是字节
- **seek 移指针**: \`f.seek(offset, whence)\` - whence=0 文件头(默认) / 1 当前 / 2 末尾，二进制模式三参数都支持
- **struct.pack**: \`struct.pack("<id?", v1, v2, v3)\` 按格式将 Python 值打包成 \`bytes\`，便于序列化定长记录
- **struct.unpack**: \`struct.unpack("<id?", data)\` 解包返回元组；可用 \`unpack_from(buf, offset)\` 从缓冲区指定位置解
- **calcsize**: \`struct.calcsize("<id?")\` 计算格式对应字节数，便于预读定长头
- **字节序**: \`<\` 小端 / \`>\` 大端 / \`!\` 网络序(等同 \`>\`) / \`=\` 本机默认 / \`@\` 本机对齐
- **常用格式符**: \`i\` int(4B) / \`f\` float(4B) / \`d\` double(8B) / \`?\` bool(1B) / \`s\` 字节串 / \`q\` long long(8B)
- **分块读写**: \`f.read(chunk_size)\` 按固定大小迭代，处理大文件省内存
- **字节与字符串转换**: \`b.decode("utf-8")\` 转 str；\`s.encode("utf-8")\` 转 bytes

## 原理与机制
- **二进制无编码层**: 与文本模式相比少了 \`TextIOWrapper\`，读写原始字节，效率更高
- **seek 限制差异**: 文本模式仅支持 \`seek(0, 0)\` 等绝对定位(因字符宽度不定)；二进制模式可任意 \`seek(offset, 1)\` 相对跳转
- **struct 对齐**: 默认格式无填充，含非原生字节序时不强制对齐；\`@\` 前缀才按本机 C 对齐规则
- **缓冲区与 flush**: 二进制写入先入缓冲区，\`flush()\` 刷出但未落盘，\`os.fsync(f.fileno())\` 才强制落盘
- **缓冲块大小**: \`BufferedReader\` 默认 8KB 缓冲，可 \`buffering=\` 参数调整

## 易错点与陷阱
- **模式混淆**: 文本模式读二进制文件会 \`UnicodeDecodeError\`；二进制模式读文本会得到 \`bytes\` 不能直接 \`print\` 中文
- **seek 越界**: \`seek\` 到文件末尾之后读返回空 \`b""\`，写入则生成稀疏文件(中间补 0)
- **格式与数据不匹配**: 用 \`i\` 解 8 字节 double 会错位，须严格匹配打包格式
- **字节序坑**: 跨平台读取不同字节序文件，忘记 \`<\` / \`>\` 会得到错误数值，网络数据务必用 \`!\`
- **pickle 替代陷阱**: pickle 序列化对象可执行任意代码，加载不可信 pickle 是严重安全风险

## 实战建议
- **协议解析**: 网络协议多用 \`<\` 小端 + 定长头 + 变长体的设计，先 \`calcsize\` 读头再读体
- **大文件块读写**: 用 \`f.read(chunk_size)\` 分块迭代处理，避免一次性加载
- **配合 pathlib**: \`Path.write_bytes(data)\` / \`read_bytes()\` 一行完成简单二进制 IO，无需手动 \`open\`
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
\`pathlib.Path\` 是 Python 3.4+ 引入的面向对象路径 API，替代 \`os.path\` 的字符串拼接，是现代推荐的路径操作方式。Python 3.6+ 进一步扩展了与 \`os\` 模块的互操作性，3.12+ 增强了 \`glob\` 与通配符支持。

## 核心要点
- **路径拼接**: \`Path("/tmp") / "sub" / "file.txt"\` - \`/\` 运算符直观安全，自动处理分隔符，告别 \`os.path.join\`
- **路径属性**: \`.name\` 文件名 / \`.stem\` 主名 / \`.suffix\` 扩展名 / \`.parent\` 父目录 / \`.parents\` 祖先链 / \`.parts\` 路径组件元组
- **存在与类型**: \`.exists()\` / \`.is_file()\` / \`.is_dir()\` / \`.is_symlink()\` 检查路径状态
- **目录创建**: \`.mkdir(exist_ok=True)\` 单层；\`.mkdir(parents=True, exist_ok=True)\` 递归创建
- **遍历目录**: \`.iterdir()\` 列出直接子项；\`.glob("*.py")\` 模式匹配；\`.rglob("*.py")\` 递归匹配
- **便捷读写**: \`.read_text(encoding="utf-8")\` / \`.write_text(s)\` / \`.read_bytes()\` / \`.write_bytes(b)\` 一行完成
- **路径变换**: \`.resolve()\` 绝对路径 / \`.relative_to(base)\` 相对路径 / \`.with_suffix(".txt")\` 改后缀 / \`.with_name("new")\` 改名
- **PurePath 分类**: \`PurePosixPath\` / \`PureWindowsPath\` 可在不跨平台情况下操作异类路径
- **文件元信息**: \`.stat().st_size\` 大小 / \`.stat().st_mtime\` 修改时间 / \`.owner()\` 所有者
- **删除操作**: \`.unlink()\` 删文件；\`.rmdir()\` 删空目录；删非空目录用 \`shutil.rmtree()\`

## 原理与机制
- **对象不可变**: \`Path\` 对象一旦创建不可修改，\`/\` 运算返回新对象，安全可哈希可作字典键
- **延迟求值**: \`.iterdir()\` / \`.glob()\` 返回生成器，按需遍历，省内存，可处理百万级文件
- **跨平台抽象**: 自动使用当前系统分隔符(\`/\` 或 \`\\\`)；\`PurePath\` 子类可在不同系统间模拟
- **与 os.path 互转**: \`str(p)\` 转 \`os.path\` 字符串；\`Path(s)\` 转回对象，二者互操作无障碍
- **glob 模式语法**: 支持 \`*\` 任意 / \`?\` 单字符 / \`[abc]\` 字符集 / \`**\` 递归(3.13+ 优化性能)

## 易错点与陷阱
- **未指定 encoding**: \`read_text()\` 默认用系统编码，跨平台读 UTF-8 应显式 \`encoding="utf-8"\`
- **glob 大小写**: Windows 文件系统不区分大小写，POSIX 区分，跨平台脚本需注意匹配模式
- **mkdir 已存在**: 默认 \`mkdir()\` 目录已存在会抛 \`FileExistsError\`，应加 \`exist_ok=True\`
- **rmdir 非空**: \`Path.rmdir()\` 仅删空目录，删非空目录要用 \`shutil.rmtree(p)\`
- **resolve 默认行为**: \`resolve()\` 默认不解析符号链接，需 \`strict=True\` 才会在路径不存在时报错

## 实战建议
- **统一用 pathlib**: 新代码优先 \`pathlib\`，告别 \`os.path.join\` 字符串拼接的混乱
- **rglob 批处理**: 递归处理项目文件用 \`Path(".").rglob("*.py")\`，简洁且高效
- **配合 with**: \`with path.open("r", encoding="utf-8") as f:\` 路径对象直接打开文件，统一风格
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
Python 标准库提供四种主流序列化方案：\`json\` 通配数据交换、\`csv\` 表格、\`tomllib\`(3.11+ 内置) 配置、\`configparser\` INI 配置。另需注意 \`pickle\` 虽为 Python 原生但存在严重安全风险。

## 核心要点
- **json.dump/load**: \`json.dump(obj, f)\` 写文件；\`json.load(f)\` 读文件，参数为已打开的文件对象
- **json.dumps/loads**: \`dumps(obj)\` 转 \`str\`；\`loads(s)\` 从 \`str\` 解析，常用于网络传输
- **json 美化**: \`json.dump(obj, f, indent=2, ensure_ascii=False)\` 缩进 + 中文不转义
- **csv.reader/writer**: 行列表读写；\`csv.DictReader/DictWriter\` 按字段名字典读写，可读性更强
- **csv 换行**: 写入必须 \`open(path, "w", newline="")\`，否则 Windows 会因 \`\\r\\n\` 多出空行
- **tomllib(3.11+)**: \`tomllib.load(f)\` 读二进制模式 \`rb\`；标准库只读，写需第三方 \`tomli-w\` 或 \`tomlkit\`
- **configparser**: 解析 INI 格式，\`config["section"]["key"]\` 访问；值统一为字符串
- **数据类型差异**: json 支持 list/dict/str/int/float/bool/None；toml 支持 datetime/array/table；ini 全是字符串
- **json 进阶**: \`default=obj.__dict__\` 序列化自定义对象；\`object_hook\` 反序列化时自定义构造
- **CSV 注入**: 含 \`=\` / \`+\` / \`-\` / \`@\` 的单元格被 Excel 当公式执行，写入需加前缀 \`'\` 转义

## 原理与机制
- **json 编码**: Python dict ↔ JSON object；写入时默认 \`ensure_ascii=True\` 把中文转 \`\\uXXXX\`，跨语言安全
- **csv 协议层**: \`csv\` 模块按 RFC 4180 处理引号 / 逗号 / 换行，自动加引号转义，\`quoting=csv.QUOTE_MINIMAL\` 默认
- **tomllib 二进制**: 严格规定以二进制模式 \`open("rb")\` 打开，避免编码层干扰解析
- **configparser 分区**: 用 \`[section]\` 分组，键值用 \`=\` 或 \`:\` 分隔，DEFAULT 段作为默认值继承给所有段
- **pickle 反序列化风险**: \`pickle.loads()\` 可执行任意代码，加载不可信数据等同 \`eval()\`，禁止反序列化外部数据

## 易错点与陷阱
- **json 重复键**: 标准 JSON 不允许重复键，遇到时后者覆盖前者；自定义需子类化 \`JSONDecoder\`
- **csv 编码**: 中文 CSV 用 Excel 打开乱码，可写 BOM 或改用 \`utf-8-sig\` 编码
- **tomllib 只读**: 标准库无 \`dump\`，写 TOML 必须装 \`tomli-w\` 或 \`tomlkit\` 第三方包
- **类型丢失**: configparser 读出的 port 是字符串 \`"3306"\`，需手动 \`int()\` 转换；json 的 \`true/false\` 转 Python \`True/False\`
- **json 不可序列化对象**: 自定义类、set、datetime 等无法直接序列化，需 \`default\` 回调或预处理

## 实战建议
- **配置优先 TOML**: 新项目用 \`pyproject.toml\` + \`tomllib\`，比 INI 类型丰富、比 JSON 注释友好
- **CSV 用 DictReader**: 表头清晰可读，避免按索引取列的脆弱代码；处理用户输入注意 CSV 注入
- **json 调试**: 临时输出用 \`json.dumps(obj, indent=2, ensure_ascii=False)\` 方便人眼查看，生产用 \`orjson\` 提速
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
