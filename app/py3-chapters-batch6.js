// =============================================================
// 第六批章节（数据与持久化，4 章）
// 21. regex             re 模块、元字符、分组、命名组
// 22. json-csv          json / csv / toml / yaml
// 23. pathlib           路径操作、glob、遍历、os 关系
// 24. serialization     pickle / dataclasses / attrs 思路、配置
// =============================================================

export const chapters = [
  {
    id: "py3-regex",
    group: "数据与持久化",
    icon: "🔍",
    title: "正则表达式：re 模块、命名组、re.compile",
    content: `
# 正则表达式（re）

- 元字符：\`. ^ $ * + ? {n,m} [] | () \`
- \`re.match\`：从开头匹配；\`re.search\`：找第一个；\`re.findall\`：找全部
- \`re.sub\`：替换；\`re.split\`：切分
- **命名组** \`(?P<name>...)\`：可读性高，\`group("name")\` 取
- **非贪婪**：\`.*?\`（问号让 * / + 懒惰）
- **re.compile**：预编译可复用、提升性能
- 原始字符串 \`r"\\d+"\` 避免转义噩梦
`,
    code: `import re

text = """
订单 #1001 金额 199.50 元 客户 alice@example.com
订单 #1002 金额 2580.00 元 客户 bob+test@x.io
订单 #1003 金额 0.99 元 客户 carol@126.com
"""

# 1) 简单匹配：找订单号
order_re = re.compile(r"#(?P<oid>\\d+)")
for m in order_re.finditer(text):
    print("订单:", m.group("oid"), "span:", m.span())

# 2) 邮箱
emails = re.findall(r"[\\w.+-]+@[\\w.-]+", text)
print("emails:", emails)

# 3) 金额 + 命名组
amount_re = re.compile(r"金额\\s+(?P<amount>\\d+(?:\\.\\d+)?)\\s+元")
for m in amount_re.finditer(text):
    print("amount:", m.group("amount"), "as float:", float(m.group("amount")))

# 4) 替换
masked = re.sub(r"[\\w.+-]+@[\\w.-]+", "***@***", text)
print("masked:", masked)

# 5) 切分 + 非贪婪
s = "<a>1</a><b>22</b><a>333</a>"
print("a 标签内容:", re.findall(r"<a>(.*?)</a>", s))   # 非贪婪
print("数字:", re.findall(r"\\d+", s))

# 6) 编译标志
print("case-insensitive:", re.findall(r"PYTHON", "I love python and PYTHON.", re.IGNORECASE))
print("multiline ^:", re.findall(r"^订单", text, re.MULTILINE))

# 7) 校验（手机号简化版）
def valid_phone(s):
    return bool(re.fullmatch(r"1[3-9]\\d{9}", s))

print(valid_phone("13800138000"), valid_phone("12345"))
`,
  },

  {
    id: "py3-json-csv",
    group: "数据与持久化",
    icon: "🧾",
    title: "JSON / CSV / TOML：序列化与配置文件",
    content: `
# JSON / CSV / TOML

- **json**：\`dumps/loads\` 字符串，\`dump/load\` 文件
- **csv**：\`reader / writer / DictReader / DictWriter\`
- **tomllib**（3.11+ 读）：\`tomllib.load(f)\` 读 TOML；3.13+ 有 \`tomllib\`
- **tomli/tomli_w**：3.11 之前用 \`tomli\` 读、\`tomli_w\` 写
- 配置文件选型：JSON 适合小数据，TOML 适合项目配置，YAML 适合复杂
`,
    code: `import json, csv, io, tempfile, os

# 1) json
data = {"name": "alice", "scores": [90, 85, 92], "active": True}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("json:", s)
print("parse back:", json.loads(s)["name"])

# json 直接处理 dataclass / datetime 需自定义 default
from dataclasses import dataclass, asdict
@dataclass
class User:
    name: str
    age: int

u = User("bob", 30)
print("user -> json:", json.dumps(asdict(u), ensure_ascii=False))

# 2) csv 写入 + 读回
rows = [
    {"name": "alice", "age": "30", "city": "Beijing"},
    {"name": "bob", "age": "25", "city": "Shanghai"},
]
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "people.csv")
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["name", "age", "city"])
        w.writeheader()
        w.writerows(rows)

    with open(p, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            print("csv row:", r)

# 3) csv 字符串操作
buf = io.StringIO()
w = csv.writer(buf)
w.writerow(["a", "b", "c"])
w.writerow([1, 2, 3])
print("csv in-memory:", buf.getvalue())

# 4) tomllib（3.11+）
toml_text = '''
[project]
name = "demo"
version = "0.1.0"
requires-python = ">=3.12"

[project.dependencies]
fastapi = ">=0.110"
'''
try:
    import tomllib
    print("tomllib parsed:", tomllib.loads(toml_text))
except ImportError:
    # 3.10 及以下用 tomli
    try:
        import tomli
        print("tomli parsed:", tomli.loads(toml_text))
    except ImportError:
        print("toml 解析器未安装（Python 3.11+ 内置 tomllib）")
`,
  },

  {
    id: "py3-pathlib",
    group: "数据与持久化",
    icon: "📂",
    title: "pathlib：路径操作的现代方式",
    content: `
# pathlib

- 面向对象：用 \`Path\` 对象代替字符串路径
- 构造：\`Path("a/b")\`、\`Path("/tmp") / "x.txt"\`、\`Path.home()\`
- 属性：\`.name / .stem / .suffix / .parent / .parents\`
- 操作：\`.exists() / .is_file() / .mkdir() / .read_text() / .write_text()\`
- 遍历：\`.iterdir() / .glob("*.py") / .rglob("**/*.py")\`（递归）
- 替换 os.path 的常见用法，可读性更好
`,
    code: `import os, tempfile, pathlib

# 1) 构造路径
p = pathlib.Path("a") / "b" / "c.txt"
print("p:", p, "name:", p.name, "suffix:", p.suffix, "stem:", p.stem)
print("parent:", p.parent, "parents:", [str(x) for x in p.parents])

# 2) 读 / 写
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    f = root / "hello.txt"
    f.write_text("你好，pathlib！", encoding="utf-8")
    print("read:", f.read_text(encoding="utf-8"))
    print("size:", f.stat().st_size, "bytes")

    # 创建子目录
    (root / "sub" / "deep").mkdir(parents=True, exist_ok=True)
    for child in root.iterdir():
        print("child:", child, "is_dir:", child.is_dir())

# 3) glob / rglob
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    for sub in ["a", "b", "c"]:
        (root / sub).mkdir()
        for i in range(3):
            (root / sub / f"file_{i}.py").write_text(f"# {sub}-{i}")
    print("*.py:", [str(x) for x in root.glob("*.py")])
    print("**/*.py:", [str(x) for x in root.rglob("*.py")])

# 4) Path vs os.path
print("cwd:", pathlib.Path.cwd())
print("home:", pathlib.Path.home())
print("join:", os.path.join("a", "b", "c"))
print("pathlib join:", pathlib.Path("a") / "b" / "c")

# 5) with_name / with_suffix
p = pathlib.Path("/tmp/x.txt")
print("with_suffix:", p.with_suffix(".md"))
print("with_name:", p.with_name("y.log"))

# 6) 实际场景：批量重命名
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    for i in range(3):
        (root / f"img_{i}.jpg").write_bytes(b"x")
    for f in root.glob("*.jpg"):
        f.rename(f.with_name(f"photo_{f.stem.split('_')[1]}.png"))
    print("renamed:", sorted(p.name for p in root.iterdir()))
`,
  },

  {
    id: "py3-serialization",
    group: "数据与持久化",
    icon: "💾",
    title: "序列化：pickle / dataclass / 配置管理",
    content: `
# 序列化与配置

- **pickle**：Python 专用，可序列化任意对象，**不可跨语言、不可信来源**
- **json**：跨语言，文本格式，适合配置和接口
- **dataclass**：纯数据容器，asdict() 配合 json.dumps
- **pydantic**（3rd）：带校验的 dataclass（FastAPI 用的就是它）
- **配置管理**：环境变量、.env 文件、argparse、pyproject.toml
- **logging**：标准库 logging 模块
`,
    code: `import pickle, json, logging, os, tempfile
from dataclasses import dataclass, asdict
from typing import Any

# 1) pickle：序列化任意 Python 对象
data = {"nums": [1, 2, 3], "user": ("alice", 30), "nested": {"k": "v"}}
blob = pickle.dumps(data)
restored = pickle.loads(blob)
print("pickle roundtrip ok:", restored == data, "type:", type(restored["user"]).__name__)

# 2) json + dataclass：更通用的序列化
@dataclass
class Config:
    name: str
    debug: bool = False
    hosts: list[str] = None  # 注意：None + asdict 会有 None

    def __post_init__(self):
        if self.hosts is None:
            self.hosts = ["localhost"]

cfg = Config("myapp", debug=True, hosts=["a.example.com", "b.example.com"])
j = json.dumps(asdict(cfg), ensure_ascii=False, indent=2)
print("config json:", j)

# 3) 环境变量 + dotenv 思路
os.environ.setdefault("APP_ENV", "dev")
print("APP_ENV:", os.getenv("APP_ENV", "production"))
print("APP_DEBUG:", os.getenv("APP_DEBUG", "false"))

try:
    from dotenv import load_dotenv
    print("python-dotenv 已装，可用 load_dotenv('.env')")
except ImportError:
    print("未装 python-dotenv；可用 pip install python-dotenv")

# 4) logging 配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("demo")

log.debug("debug message (默认不显示)")
log.info("应用启动")
log.warning("这是一个 warning")
log.error("出错了：%s", "demo error")

# 5) 简单的配置加载
def load_config(path):
    if path.endswith(".json"):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise ValueError("unsupported config format")
`,
  },
];
