// =============================================================
// Python 从入门到精通大全（终极版）—— 第16批章节
// 第十六部分 标准库与综合实战 + 结尾（共 7 章）
// =============================================================

const chapters = [
  {
    id: "py10-ch76",
    group: "第十六部分 标准库与综合实战",
    icon: "💻",
    title: "第七十六章 os 与 sys 模块",
    content: `

# 第七十六章 os 与 sys 模块

## 一、os 模块概述

\`os\` 模块提供与操作系统交互的接口，包括文件系统、进程、环境变量等。它是跨平台系统编程的基础。

\`\`\`python
import os


# 当前工作目录
print(f"当前目录: {os.getcwd()}")

# 切换目录
# WHY: 处理相对路径前先 chdir 到目标目录，避免路径混乱
original = os.getcwd()
os.chdir("/tmp")
print(f"切换后: {os.getcwd()}")
os.chdir(original)

# 列出目录内容
print("\\n/tmp 部分内容:")
for name in sorted(os.listdir("/tmp"))[:5]:
    print(f"  {name}")

# 环境变量
print(f"\\nPATH 前 50 字符: {os.environ.get('PATH', '')[:50]}")
print(f"HOME: {os.environ.get('HOME')}")

\`\`\`

## 二、文件与目录操作

\`\`\`python
import os
import tempfile


# 创建临时工作目录演示
with tempfile.TemporaryDirectory() as workdir:
    print(f"工作目录: {workdir}")

    # 创建目录
    os.mkdir(os.path.join(workdir, "subdir"))
    # 递归创建
    os.makedirs(os.path.join(workdir, "a", "b", "c"))
    # WHY: makedirs 像 mkdir -p，自动创建中间目录

    # 列出所有内容（递归）
    for root, dirs, files in os.walk(workdir):
        rel = os.path.relpath(root, workdir)
        print(f"  目录: {rel}")
        for d in dirs:
            print(f"    子目录: {d}")

    # 创建文件
    file_path = os.path.join(workdir, "test.txt")
    with open(file_path, "w") as f:
        f.write("hello")

    # 重命名
    new_path = os.path.join(workdir, "renamed.txt")
    os.rename(file_path, new_path)
    print(f"\\n重命名后存在: {os.path.exists(new_path)}")

    # 删除文件
    os.remove(new_path)
    print(f"删除后存在: {os.path.exists(new_path)}")

    # 删除目录
    os.rmdir(os.path.join(workdir, "subdir"))
    # 递归删除空目录树
    os.removedirs(os.path.join(workdir, "a", "b", "c"))

\`\`\`

## 三、os.path 路径处理

\`\`\`python
import os.path


# 路径拼接（跨平台）
# WHY: 不要用字符串 + 拼，Windows 用 \\，Unix 用 /，os.path.join 自动处理
p = os.path.join("usr", "local", "bin", "python")
print(f"拼接: {p}")

# 路径分解
print(f"目录: {os.path.dirname(p)}")
print(f"文件名: {os.path.basename(p)}")
print(f"分割: {os.path.split(p)}")
print(f"扩展名: {os.path.splitext('/a/b/c.txt')}")

# 绝对路径与规范化
print(f"绝对路径: {os.path.abspath('./test.txt')}")
print(f"规范化: {os.path.normpath('/a/b/../c/./d')}")  # /a/c/d

# 路径检查
print(f"\\n存在性检查:")
print(f"  /tmp 存在: {os.path.exists('/tmp')}")
print(f"  /tmp 是目录: {os.path.isdir('/tmp')}")
print(f"  /tmp 是文件: {os.path.isfile('/tmp')}")

# 获取文件信息
import os
stat = os.stat("/tmp")
print(f"\\n/tmp 状态:")
print(f"  大小: {stat.st_size}")
print(f"  模式: {oct(stat.st_mode)}")
print(f"  修改时间: {stat.st_mtime}")

\`\`\`

## 四、os.environ 环境变量

\`\`\`python
import os


# 读取环境变量
# WHY: 配置通过环境变量传递，比硬编码更灵活安全
db_url = os.environ.get("DATABASE_URL", "sqlite:///default.db")
print(f"数据库: {db_url}")

# 设置环境变量（仅当前进程及其子进程可见）
os.environ["MY_VAR"] = "hello"
print(f"MY_VAR: {os.environ['MY_VAR']}")

# 删除
del os.environ["MY_VAR"]
print(f"MY_VAR 存在: {'MY_VAR' in os.environ}")

# environ 是类似字典的对象
for key in ["PATH", "HOME", "USER"]:
    if key in os.environ:
        print(f"  {key} = {os.environ[key][:50]}")

# 推荐用 os.environ.copy() 获取副本传给子进程
env_copy = os.environ.copy()
env_copy["EXTRA"] = "for_child"
print(f"\\n副本中 EXTRA: {'EXTRA' in env_copy}")

\`\`\`

## 五、system 与 popen 执行命令

\`\`\`python
import os


# os.system 直接执行命令，返回退出码
# WHY: system 简单但拿不到输出，仅适合无需结果的场景
exit_code = os.system("echo 'hello from system'")
print(f"退出码: {exit_code}")

# os.popen 执行命令并获取输出（已不推荐）
with os.popen("echo 'hello from popen'") as f:
    output = f.read()
    print(f"输出: {output.strip()}")

# 现代推荐：subprocess 模块
import subprocess


# WHY: subprocess 比 system/popen 更安全灵活，是新代码首选
result = subprocess.run(
    ["echo", "hello from subprocess"],
    capture_output=True,
    text=True,
)
print(f"subprocess 输出: {result.stdout.strip()}")
print(f"返回码: {result.returncode}")

\`\`\`

## 六、sys 模块

\`sys\` 模块提供 Python 解释器相关的功能。

\`\`\`python
import sys


# Python 版本信息
print(f"版本: {sys.version}")
print(f"版本信息: {sys.version_info}")
print(f"平台: {sys.platform}")
print(f"可执行文件: {sys.executable}")

# sys.argv 命令行参数
# WHY: argv[0] 是脚本名，argv[1:] 是真正的参数
print(f"\\nargv: {sys.argv}")

# sys.path 模块搜索路径
print(f"\\npath 前 3 项:")
for p in sys.path[:3]:
    print(f"  {p}")

# 动态添加搜索路径
sys.path.insert(0, "/tmp/mylibs")
print(f"\\n添加后 path[0]: {sys.path[0]}")
sys.path.pop(0)

\`\`\`

## 七、标准流

\`\`\`python
import sys


# 标准输入/输出/错误
print(f"stdin: {sys.stdin}")
print(f"stdout: {sys.stdout}")
print(f"stderr: {sys.stderr}")

# 重定向演示
from io import StringIO


old_stdout = sys.stdout
sys.stdout = StringIO()
print("这行被重定向到内存")
captured = sys.stdout.getvalue()
sys.stdout = old_stdout
print(f"捕获: {captured.strip()}")

# WHY: 重定向 stdout 常用于测试 print 输出，或捕获库的日志

# 标准错误输出（不会被重定向）
sys.stderr.write("这是错误输出\\n")

\`\`\`

## 八、sys.exit 退出程序

\`\`\`python
import sys


def main():
    """模拟命令行程序"""
    if len(sys.argv) < 2:
        # 0 表示成功，非 0 表示错误
        # WHY: 退出码让 shell 脚本能判断程序是否成功
        print("用法: program <argument>", file=sys.stderr)
        sys.exit(1)
    print(f"参数: {sys.argv[1]}")
    # sys.exit(0) 或不调用表示成功


# sys.exit 会抛出 SystemExit 异常，可以被捕获
try:
    sys.exit(2)
except SystemExit as e:
    print(f"捕获退出，码: {e.code}")

# exit(code) 也可以用 exit() / quit()（交互式 shell 友好）

\`\`\`

## 九、平台信息

\`\`\`python
import sys
import platform


print("=== sys 平台信息 ===")
print(f"sys.platform: {sys.platform}")  # darwin/linux/win32
print(f"sys.byteorder: {sys.byteorder}")  # little/big
print(f"最大整数: {sys.maxsize}")

print("\\n=== platform 模块 ===")
print(f"platform: {platform.platform()}")
print(f"系统: {platform.system()}")
print(f"版本: {platform.version()}")
print(f"机器: {platform.machine()}")
print(f"处理器: {platform.processor()}")
print(f"Python 实现: {platform.python_implementation()}")
print(f"Python 版本: {platform.python_version()}")

# 跨平台代码示例
# WHY: 不同平台路径分隔符、换行符不同，用 sys.platform 判断
def get_config_dir() -> str:
    if sys.platform == "win32":
        return os.path.join(os.environ["APPDATA"], "myapp")
    elif sys.platform == "darwin":
        return os.path.expanduser("~/Library/Application Support/myapp")
    else:
        return os.path.expanduser("~/.config/myapp")


import os
print(f"\\n配置目录: {get_config_dir()}")

\`\`\`

## 十、命令行参数解析

\`\`\`python
import sys


# 手动解析命令行参数（简单场景）
def parse_args(argv: list[str]) -> dict:
    """简易参数解析器"""
    args = {"positional": [], "options": {}}
    i = 1  # 跳过 argv[0]
    while i < len(argv):
        arg = argv[i]
        if arg.startswith("--"):
            # --key=value 或 --key value
            if "=" in arg:
                key, value = arg[2:].split("=", 1)
                args["options"][key] = value
            else:
                key = arg[2:]
                if i + 1 < len(argv) and not argv[i + 1].startswith("--"):
                    args["options"][key] = argv[i + 1]
                    i += 1
                else:
                    args["options"][key] = True
        elif arg.startswith("-"):
            # -k 短选项
            args["options"][arg[1:]] = True
        else:
            args["positional"].append(arg)
        i += 1
    return args


# 测试
test_argv = ["prog.py", "input.txt", "--output=result.txt", "--verbose", "-f"]
result = parse_args(test_argv)
print(f"位置参数: {result['positional']}")
print(f"选项: {result['options']}")

# WHY: 简单工具可以手写，复杂场景用 argparse

\`\`\`

## 十一、os 高级功能

\`\`\`python
import os
import stat


# 文件权限
with open("/tmp/perm_test.txt", "w") as f:
    f.write("test")

# 修改权限
# WHY: 服务器脚本常需设置文件权限，如密钥文件设为 600
os.chmod("/tmp/perm_test.txt", 0o644)
mode = os.stat("/tmp/perm_test.txt").st_mode
print(f"权限: {oct(stat.S_IMODE(mode))}")

# 文件属主（需 root 权限）
# os.chown(path, uid, gid)

# 符号链接
link_path = "/tmp/perm_link"
if os.path.exists(link_path):
    os.remove(link_path)
os.symlink("/tmp/perm_test.txt", link_path)
print(f"是符号链接: {os.path.islink(link_path)}")
print(f"链接目标: {os.readlink(link_path)}")

# 路径展开（user 主目录）
print(f"\\n~ 展开: {os.path.expanduser('~')}")
print(f"环境变量展开: {os.path.expandvars('$HOME/tmp')}")

# 进程信息
print(f"\\n当前 PID: {os.getpid()}")
print(f"父 PID: {os.getppid()}")

# 清理
os.remove(link_path)
os.remove("/tmp/perm_test.txt")

\`\`\`

## 小结

本章介绍了 os 与 sys 模块：

- **os 文件操作**：listdir、mkdir、remove、rename
- **os.path**：join、split、exists、abspath
- **os.environ**：环境变量
- **system/popen**：执行命令（推荐 subprocess）
- **sys.argv**：命令行参数
- **sys.path**：模块搜索路径
- **sys.stdin/stdout/stderr**：标准流
- **sys.exit**：退出程序
- **platform**：跨平台信息

os 和 sys 是 Python 系统编程的基石，几乎所有实用脚本都会用到。下一章学习正则表达式。
`
  },
  {
    id: "py10-ch77",
    group: "第十六部分 标准库与综合实战",
    icon: "🔍",
    title: "第七十七章 re 正则表达式",
    content: `

# 第七十七章 re 正则表达式

## 一、正则表达式基础

正则表达式（regex）是描述字符串模式的微型语言，用于搜索、匹配、替换文本。Python 的 \`re\` 模块提供完整支持。

\`\`\`python
import re


# 基础匹配
# re.match 从字符串开头匹配
# WHY: match 锚定开头，search 找任意位置，要根据需求选择
m = re.match(r"hello", "hello world")
print(m)  # <Match object>
print(m.group())  # hello
print(m.span())   # (0, 5)

# re.search 在任意位置搜索
s = re.search(r"world", "hello world")
print(s.group())  # world

# 没匹配返回 None
print(re.match(r"xyz", "hello"))  # None

\`\`\`

## 二、元字符与字符类

\`\`\`python
import re


# . 任意字符（除换行）
print(re.search(r"a.c", "abc").group())  # abc

# 字符类 [abc]
print(re.search(r"[aeiou]", "hello").group())  # e
# 范围 [a-z]
print(re.findall(r"[A-Z][a-z]+", "Hello World Foo"))  # ['Hello', 'World', 'Foo']
# 否定 [^abc]
print(re.findall(r"[^0-9]", "a1b2c3"))  # ['a', 'b', 'c']

# 预定义字符类
# \\d 数字  \\D 非数字
# \\w 单词字符（字母数字下划线）  \\W 非单词字符
# \\s 空白  \\S 非空白
# WHY: 预定义类比手写 [0-9] 等更简洁，且跨语言通用
print(re.findall(r"\\d+", "电话: 13800138000, 邮编: 100000"))
print(re.findall(r"\\w+", "hello, world! foo_bar"))
print(re.split(r"\\s+", "a  b   c    d"))

# 锚点
# ^ 开头  $ 结尾  \\b 单词边界
print(re.findall(r"^\\w+", "first line\\nsecond line", re.MULTILINE))
print(re.findall(r"\\bword\\b", "a word in words"))  # ['word']

\`\`\`

## 三、量词

\`\`\`python
import re


# * 0 次或多次
# + 1 次或多次
# ? 0 次或 1 次
# {m} 恰好 m 次
# {m,n} m 到 n 次
# {m,} 至少 m 次

print(re.findall(r"ab*c", "ac abc abbc"))  # ['ac', 'abc', 'abbc']
print(re.findall(r"ab+c", "ac abc abbc"))  # ['abc', 'abbc']
print(re.findall(r"ab?c", "ac abc abbc"))  # ['ac', 'abc']
print(re.findall(r"ab{2}c", "abc abbc abbbc"))  # ['abbc']
print(re.findall(r"ab{2,3}c", "abc abbc abbbc abbbbc"))  # ['abbc', 'abbbc']

# 贪婪 vs 非贪婪
# 默认贪婪：尽可能多匹配
# WHY: HTML 解析常踩坑，<.*> 会贪婪匹配到最后一个 >
print(re.findall(r"<.*>", "<a><b><c>"))  # ['<a><b><c>'] 贪婪
print(re.findall(r"<.*?>", "<a><b><c>"))  # ['<a>', '<b>', '<c>'] 非贪婪

\`\`\`

## 四、分组与捕获

\`\`\`python
import re


# (pattern) 捕获分组
m = re.match(r"(\\d+)-(\\d+)", "2024-01")
print(m.group(0))  # 2024-01 整个匹配
print(m.group(1))  # 2024 第 1 组
print(m.group(2))  # 01 第 2 组
print(m.groups())  # ('2024', '01')

# 命名分组 (?P<name>pattern)
# WHY: 命名分组比数字索引可读性强，复杂正则必备
m = re.match(r"(?P<year>\\d+)-(?P<month>\\d+)", "2024-01")
print(m.group("year"))   # 2024
print(m.group("month"))  # 01
print(m.groupdict())     # {'year': '2024', 'month': '01'}

# 非捕获分组 (?:pattern)
# WHY: 不需要捕获的分组用 (?:)，避免占用 group 编号
m = re.match(r"(?:https?|ftp)://(\\S+)", "https://example.com")
print(m.group(1))  # example.com

# 后向引用 \\1 引用第 1 个分组
print(re.search(r"(\\w+) \\1", "hello hello").group())  # hello hello

\`\`\`

## 五、re.findall 与 re.finditer

\`\`\`python
import re


# findall 返回所有匹配（字符串或元组）
text = "张三 25 岁，李四 30 岁，王五 28 岁"

# 无分组：返回匹配字符串
print(re.findall(r"\\d+ 岁", text))

# 1 个分组：返回分组内容
print(re.findall(r"(\\d+) 岁", text))  # ['25', '30', '28']

# 多个分组：返回元组
print(re.findall(r"(\\w+) (\\d+) 岁", text))

# finditer 返回 Match 对象迭代器，更省内存
# WHY: 大文本用 finditer 避免一次性收集所有结果
for m in re.finditer(r"(\\w+) (\\d+) 岁", text):
    print(f"  {m.group(1)}: {m.group(2)}")

\`\`\`

## 六、re.sub 替换

\`\`\`python
import re


# 基础替换
text = "今天是 2024-01-15"
new = re.sub(r"\\d+", "X", text)
print(new)  # 今天是 X-X-X

# 替换次数限制
print(re.sub(r"\\d", "X", "a1b2c3d4", count=2))  # aXbXc3d4

# 用函数替换
# WHY: 函数替换能根据匹配内容动态决定替换值，非常强大
def mask_email(match):
    email = match.group()
    name, domain = email.split("@")
    return f"{name[0]}***@{domain}"


text = "联系我：alice@example.com 或 bob@company.org"
print(re.sub(r"\\S+@\\S+", mask_email, text))

# 命名分组引用
template = "姓名: \\g<name>, 年龄: \\g<age>"
print(re.sub(r"(?P<name>\\w+).*?(?P<age>\\d+)", template, "张三今年25"))

\`\`\`

## 七、re.split 分割

\`\`\`python
import re


# 按模式分割
text = "a, b; c, d; e"
print(re.split(r"[,;]\\s*", text))  # ['a', 'b', 'c', 'd', 'e']

# 保留分隔符（用捕获组）
# WHY: 解析日志时保留分隔符便于还原原始结构
print(re.split(r"([,;])\\s*", text))

# 限制分割次数
print(re.split(r"\\s+", "a b c d e", maxsplit=2))  # ['a', 'b', 'c d e']

# 实战：解析 CSV 行（简化版）
csv_line = "张三,25,北京,\"Hello, World\",男"
# 用更复杂的正则处理引号
parts = re.split(r',(?=(?:[^"]*"[^"]*")*[^"]*$)', csv_line)
print(parts)

\`\`\`

## 八、re.compile 预编译

\`\`\`python
import re
import time


# 预编译正则，多次使用时效率更高
# WHY: 编译正则有开销，循环里反复用同一模式必须预编译
pattern = re.compile(r"\\d+")

text = "abc 123 def 456"
print(pattern.findall(text))  # 像普通函数一样用

# 性能对比
data = "a1b2c3d4e5" * 1000

# 不预编译
start = time.perf_counter()
for _ in range(1000):
    re.findall(r"\\d+", data)
no_compile = time.perf_counter() - start

# 预编译
start = time.perf_counter()
p = re.compile(r"\\d+")
for _ in range(1000):
    p.findall(data)
compiled = time.perf_counter() - start

print(f"不预编译: {no_compile:.3f}s")
print(f"预编译: {compiled:.3f}s")
print(f"加速: {no_compile / compiled:.1f}x")

\`\`\`

## 九、标志位

\`\`\`python
import re


# 常用标志
# re.IGNORECASE (re.I): 忽略大小写
print(re.findall(r"python", "Python PYTHON python", re.I))

# re.MULTILINE (re.M): 多行模式，^ $ 匹配每行
text = "line1\\nline2\\nline3"
print(re.findall(r"^line\\w", text, re.M))  # ['line1', 'line2', 'line3']

# re.DOTALL (re.S): . 匹配换行符
html = "<div>hello\\nworld</div>"
print(re.search(r"<div>(.*?)</div>", html, re.S).group(1))

# re.VERBOSE (re.X): 详细模式，可加注释
# WHY: 复杂正则用 VERBOSE 加注释，可读性大幅提升
pattern = re.compile(r"""
    \\b              # 单词边界
    (\\w+)           # 捕获单词
    \\s+             # 空白
    (\\d+)           # 捕获数字
""", re.VERBOSE)

print(pattern.findall("hello 42 world 99"))

\`\`\`

## 十、零宽断言

\`\`\`python
import re


# 前瞻 lookahead（不消耗字符）
# (?=...) 正向前瞻
# (?!...) 负向前瞻
text = "price: 100, 200, 300 dollars"

# 匹配数字后面跟着 dollars 的
# WHY: 前瞻不消费 dollars，可以继续匹配
print(re.findall(r"\\d+(?= dollars)", text))  # ['300']

# 匹配数字后面不是 dollars 的
print(re.findall(r"\\d+(?! dollars)", text))  # ['100', '200']

# 后顾 lookbehind（Python 3.7+ 支持变长）
# (?<=...) 正向后顾
# (?<!...) 负向后顾
# 匹配 $ 后面的数字
print(re.findall(r"(?<=\\$)\\d+", "price $100 or 200"))  # ['100']
# 匹配不在 $ 后的数字
print(re.findall(r"(?<!\\$)\\b\\d+\\b", "$100 200 300"))  # ['200', '300']

\`\`\`

## 十一、常见实用模式

\`\`\`python
import re


# 邮箱（简化版）
email_re = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+")
text = "联系 alice@example.com 或 bob.smith@company.co.uk"
print("邮箱:", email_re.findall(text))

# 手机号（中国大陆）
phone_re = re.compile(r"1[3-9]\\d{9}")
print("手机号:", phone_re.findall("电话 13812345678 和 15987654321"))

# URL
url_re = re.compile(r"https?://[\\w.-]+(?:/\\S*)?")
print("URL:", url_re.findall("访问 https://example.com/a/b 或 http://x.io"))

# IP 地址
ip_re = re.compile(r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b")
print("IP:", ip_re.findall("服务器 192.168.1.1 和 10.0.0.1"))

# 日期 YYYY-MM-DD
date_re = re.compile(r"\\d{4}-\\d{2}-\\d{2}")
print("日期:", date_re.findall("2024-01-15 和 2024-02-28"))

# 中文字符
cn_re = re.compile(r"[\\u4e00-\\u9fa5]+")
print("中文:", cn_re.findall("hello 世界 python 编程"))

# 身份证号（简化版）
id_re = re.compile(r"\\d{17}[\\dXx]")
print("身份证:", id_re.findall("身份证 110101199001011234"))

\`\`\`

## 十二、实战：日志解析器

\`\`\`python
import re
from typing import NamedTuple


class LogEntry(NamedTuple):
    timestamp: str
    level: str
    message: str


# Apache/Nginx 风格日志
log_pattern = re.compile(
    r"(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})"
    r"\\s+"
    r"(?P<level>INFO|WARNING|ERROR|DEBUG)"
    r"\\s+"
    r"(?P<message>.*)"
)

sample_logs = """
2024-01-15 10:30:00 INFO 服务器启动
2024-01-15 10:31:23 WARNING 内存使用率 80%
2024-01-15 10:32:45 ERROR 数据库连接失败
2024-01-15 10:33:00 INFO 重试成功
"""

entries = []
for line in sample_logs.strip().splitlines():
    m = log_pattern.search(line)
    if m:
        entries.append(LogEntry(
            timestamp=m.group("timestamp"),
            level=m.group("level"),
            message=m.group("message"),
        ))

# 统计各级别数量
from collections import Counter
counter = Counter(e.level for e in entries)
print("日志级别统计:")
for level, count in counter.items():
    print(f"  {level}: {count}")

# 只看 ERROR
print("\\n错误日志:")
for e in entries:
    if e.level == "ERROR":
        print(f"  [{e.timestamp}] {e.message}")

\`\`\`

## 十三、正则陷阱

\`\`\`python
import re


# 陷阱1：贪婪匹配导致错误
html = "<b>bold</b> <i>italic</i>"
# 错误：贪婪
wrong = re.findall(r"<(\\w+)>(.*)</\\1>", html)
print(f"贪婪: {wrong}")  # 匹配过头
# 正确：非贪婪
right = re.findall(r"<(\\w+)>(.*?)</\\1>", html)
print(f"非贪婪: {right}")

# 陷阱2：特殊字符未转义
# . * + ? ^ $ { } [ ] \\ | ( ) 需转义
print(re.findall(r"\\$\\d+", "价格 $100 和 $200"))  # ['\\$100', '\\$200']

# 陷阱3：用正则解析 HTML/XML
# WHY: 嵌套结构用正则不可靠，应专用解析器
# HTML 用 html.parser，XML 用 xml.etree.ElementTree

# 陷阱4：回溯爆炸（ReDoS）
# 慎用嵌套量词如 (a+)+，恶意输入会卡死
# Python 默认有回溯限制
print(re.compile(r"(a+)+$").search("a" * 30 + "b") is None)

# 陷阱5：原始字符串
# 错：re.search("\\\\d", "abc") 字符串里 \\\\ 变成 \\
# 对：re.search(r"\\d", "abc") 原始字符串保留反斜杠
# WHY: 正则中反斜杠多，用 r"" 避免双重转义

\`\`\`

## 小结

本章介绍了 re 正则表达式：

- **基础匹配**：match、search
- **元字符**：.、[]、\\d、\\w、\\s
- **量词**：*、+、?、{m,n}
- **分组**：捕获、命名、非捕获
- **查找**：findall、finditer
- **替换**：sub（含函数替换）
- **分割**：split
- **预编译**：re.compile 提升性能
- **标志**：I、M、S、X
- **断言**：前瞻/后顾
- **实用模式**：邮箱、手机号、URL、IP

正则是强大但易错的工具，能用字符串方法解决就别用正则。下一章学习日期时间处理。
`
  },
  {
    id: "py10-ch78",
    group: "第十六部分 标准库与综合实战",
    icon: "📅",
    title: "第七十八章 datetime 与时间处理",
    content: `

# 第七十八章 datetime 与时间处理

## 一、datetime 模块概览

\`datetime\` 模块提供日期时间处理类：\`date\`、\`time\`、\`datetime\`、\`timedelta\`、\`tzinfo\`。

\`\`\`python
from datetime import date, time, datetime, timedelta


# date：仅日期
d = date(2024, 1, 15)
print(f"date: {d}")
print(f"年: {d.year}, 月: {d.month}, 日: {d.day}")
print(f"星期: {d.weekday()}")  # 0=周一
print(f"今天: {date.today()}")

# time：仅时间
t = time(14, 30, 45)
print(f"\\ntime: {t}")
print(f"时: {t.hour}, 分: {t.minute}, �: {t.second}")

# datetime：日期 + 时间
dt = datetime(2024, 1, 15, 14, 30, 45)
print(f"\\ndatetime: {dt}")
print(f"现在: {datetime.now()}")
# WHY: now() 返回本地时间，utcnow() 返回 UTC 时间

\`\`\`

## 二、timedelta 时间差

\`\`\`python
from datetime import datetime, timedelta


# timedelta 表示时间间隔
delta = timedelta(days=7, hours=3, minutes=30)
print(f"timedelta: {delta}")
print(f"总秒数: {delta.total_seconds()}")

# 日期加减
now = datetime.now()
print(f"\\n现在: {now}")
print(f"7 天后: {now + timedelta(days=7)}")
print(f"3 天前: {now - timedelta(days=3)}")
print(f"2 小时后: {now + timedelta(hours=2)}")

# 两个日期相减得到 timedelta
d1 = datetime(2024, 1, 15)
d2 = datetime(2024, 2, 28)
diff = d2 - d1
print(f"\\n{d1.date()} 到 {d2.date()} 相差 {diff.days} 天")

# WHY: timedelta 让日期运算直观，避免手动算月份天数

\`\`\`

## 三、strftime 格式化输出

\`\`\`python
from datetime import datetime


dt = datetime(2024, 1, 15, 14, 30, 45)

# 常用格式化代码
# %Y 4 位年   %y 2 位年
# %m 月       %d 日
# %H 24 时    %I 12 时   %M 分   %S 秒
# %A 星期名   %a 简写    %B 月名 %b 简写
# %p AM/PM
# WHY: strftime 把日期转成各种字符串格式，按业务需求选择

print(dt.strftime("%Y-%m-%d"))           # 2024-01-15
print(dt.strftime("%Y/%m/%d %H:%M:%S"))  # 2024/01/15 14:30:45
print(dt.strftime("%B %d, %Y"))          # January 15, 2024
print(dt.strftime("%Y年%m月%d日"))        # 2024年01月15日
print(dt.strftime("%A, %b %d"))          # Monday, Jan 15
print(dt.strftime("%Y%m%dT%H%M%S"))      # 20240115T143045（ISO 风格）

# ISO 格式（推荐用于数据交换）
print(dt.isoformat())  # 2024-01-15T14:30:45

\`\`\`

## 四、strparse 字符串解析

\`\`\`python
from datetime import datetime


# strptime 按格式解析字符串
# WHY: 必须指定精确格式，否则解析失败
s1 = "2024-01-15"
dt1 = datetime.strptime(s1, "%Y-%m-%d")
print(dt1)

s2 = "2024/01/15 14:30:45"
dt2 = datetime.strptime(s2, "%Y/%m/%d %H:%M:%S")
print(dt2)

s3 = "January 15, 2024"
dt3 = datetime.strptime(s3, "%B %d, %Y")
print(dt3)

# 实战：解析多种格式
def parse_date_flexible(s: str) -> datetime:
    formats = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d.%m.%Y",
        "%Y年%m月%d日",
        "%B %d, %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    raise ValueError(f"无法解析: {s}")


for s in ["2024-01-15", "2024/01/15", "15.01.2024", "2024年01月15日"]:
    print(f"{s} -> {parse_date_flexible(s)}")

# fromisoformat 解析 ISO 格式（3.7+）
print(datetime.fromisoformat("2024-01-15T14:30:45"))

\`\`\`

## 五、时区处理

\`\`\`python
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo  # Python 3.9+


# UTC 时区
utc_now = datetime.now(timezone.utc)
print(f"UTC: {utc_now}")

# timezone.utc 是固定 UTC 时区
# WHY: 内部存储用 UTC，显示时转本地时区，避免时区混乱

# 东八区（北京时间）
beijing_tz = timezone(timedelta(hours=8))
beijing_now = datetime.now(beijing_tz)
print(f"北京: {beijing_now}")

# 时区转换
utc_dt = datetime(2024, 1, 15, 6, 0, tzinfo=timezone.utc)
beijing_dt = utc_dt.astimezone(beijing_tz)
print(f"\\nUTC {utc_dt} -> 北京 {beijing_dt}")

# zoneinfo（3.9+）支持 IANA 时区名
# WHY: zoneinfo 用系统时区数据库，自动处理夏令时
try:
    tokyo_tz = ZoneInfo("Asia/Tokyo")
    ny_tz = ZoneInfo("America/New_York")
    print(f"东京: {datetime.now(tokyo_tz)}")
    print(f"纽约: {datetime.now(ny_tz)}")
except Exception as e:
    print(f"zoneinfo 不可用: {e}")

# 时间戳
ts = datetime.now().timestamp()
print(f"\\n时间戳: {ts}")
dt_from_ts = datetime.fromtimestamp(ts)
print(f"从时间戳: {dt_from_ts}")

\`\`\`

## 六、time 模块

\`\`\`python
import time


# 当前时间戳
print(f"时间戳: {time.time()}")

# struct_time 结构
local = time.localtime()
print(f"\\n本地时间: {local}")
print(f"年: {local.tm_year}")
print(f"一年第几天: {local.tm_yday}")

# 格式化
print(time.strftime("%Y-%m-%d %H:%M:%S", local))

# sleep 暂停
# WHY: sleep 用于限流、重试间隔、模拟等待
start = time.time()
time.sleep(0.1)
print(f"sleep 耗时: {time.time() - start:.2f}s")

# perf_counter 高精度计时器
# WHY: perf_counter 是性能测量首选，time() 精度不够且可能回退
start = time.perf_counter()
sum(range(100000))
elapsed = time.perf_counter() - start
print(f"perf_counter: {elapsed:.6f}s")

# monotonic 单调时钟（不会回退）
print(f"\\nmonotonic: {time.monotonic()}")

\`\`\`

## 七、calendar 模块

\`\`\`python
import calendar


# 打印月历
print(calendar.month(2024, 1))

# 判断闰年
print(f"\\n2024 闰年: {calendar.isleap(2024)}")
print(f"2023 闰年: {calendar.isleap(2023)}")

# 某月天数
print(f"2024 年 2 月天数: {calendar.monthrange(2024, 2)[1]}")  # 29（闰年）
print(f"2023 年 2 月天数: {calendar.monthrange(2023, 2)[1]}")  # 28

# 某月第一天星期几
# monthrange 返回 (首日星期, 天数)
first_weekday, days = calendar.monthrange(2024, 1)
print(f"\\n2024-01 首日星期: {first_weekday}（0=周一）")

# 一年总天数
print(f"\\n2024 年总天数: {sum(calendar.monthrange(2024, m)[1] for m in range(1, 13))}")

\`\`\`

## 八、日期运算实战

\`\`\`python
from datetime import datetime, date, timedelta
import calendar


# 获取本月第一天和最后一天
def month_range(d: date) -> tuple[date, date]:
    first = d.replace(day=1)
    _, days = calendar.monthrange(d.year, d.month)
    last = d.replace(day=days)
    return first, last


today = date.today()
first, last = month_range(today)
print(f"本月: {first} 到 {last}")

# 获取本周一到周日
def week_range(d: date) -> tuple[date, date]:
    monday = d - timedelta(days=d.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


mon, sun = week_range(today)
print(f"本周: {mon} 到 {sun}")

# 计算两个日期之间的所有日期
def date_range(start: date, end: date) -> list[date]:
    # WHY: 生成连续日期序列常用于报表、打卡等场景
    result = []
    cur = start
    while cur <= end:
        result.append(cur)
        cur += timedelta(days=1)
    return result


days = date_range(date(2024, 1, 10), date(2024, 1, 15))
print(f"日期范围: {days}")

# 工作日计算
def workdays_between(start: date, end: date) -> int:
    count = 0
    cur = start
    while cur <= end:
        if cur.weekday() < 5:  # 0-4 是周一到周五
            count += 1
        cur += timedelta(days=1)
    return count


print(f"工作日数: {workdays_between(date(2024, 1, 1), date(2024, 1, 31))}")

# 相对时间描述
def humanize_duration(delta: timedelta) -> str:
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return f"{seconds} 秒前"
    elif seconds < 3600:
        return f"{seconds // 60} 分钟前"
    elif seconds < 86400:
        return f"{seconds // 3600} 小时前"
    else:
        return f"{delta.days} 天前"


print(humanize_duration(timedelta(seconds=30)))
print(humanize_duration(timedelta(minutes=5)))
print(humanize_duration(timedelta(hours=2)))
print(humanize_duration(timedelta(days=3)))

\`\`\`

## 九、时区转换实战

\`\`\`python
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo


def convert_time(dt: datetime, target_tz: str) -> datetime:
    """把时间转换到指定时区"""
    try:
        tz = ZoneInfo(target_tz)
    except Exception:
        # 退回到固定偏移
        tz = timezone.utc
    if dt.tzinfo is None:
        # naive 时间视为 UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(tz)


# 会议时间转换
meeting_utc = datetime(2024, 1, 15, 14, 0, tzinfo=timezone.utc)
print("会议时间（各时区）:")
for tz_name in ["Asia/Shanghai", "Asia/Tokyo", "America/New_York", "Europe/London"]:
    local = convert_time(meeting_utc, tz_name)
    print(f"  {tz_name}: {local.strftime('%Y-%m-%d %H:%M')}")

\`\`\`

## 十、实战：日期工具类

\`\`\`python
from datetime import datetime, date, timedelta
from dataclasses import dataclass
from typing import Optional


@dataclass
class DateRange:
    start: date
    end: date

    def __post_init__(self):
        if self.start > self.end:
            raise ValueError("开始日期不能晚于结束日期")

    def days(self) -> int:
        return (self.end - self.start).days + 1

    def contains(self, d: date) -> bool:
        return self.start <= d <= self.end

    def overlap(self, other: "DateRange") -> bool:
        return not (self.end < other.start or self.start > other.end)

    def intersect(self, other: "DateRange") -> Optional["DateRange"]:
        if not self.overlap(other):
            return None
        return DateRange(
            max(self.start, other.start),
            min(self.end, other.end),
        )


# 测试
r1 = DateRange(date(2024, 1, 10), date(2024, 1, 20))
r2 = DateRange(date(2024, 1, 15), date(2024, 1, 25))

print(f"r1 天数: {r1.days()}")
print(f"r1 包含 2024-01-15: {r1.contains(date(2024, 1, 15))}")
print(f"r1 r2 重叠: {r1.overlap(r2)}")
intersect = r1.intersect(r2)
if intersect:
    print(f"交集: {intersect.start} 到 {intersect.end}")

# 计时器
class Timer:
    """简易计时器"""

    def __init__(self):
        self._start: Optional[float] = None

    def start(self):
        import time
        self._start = time.perf_counter()

    def elapsed(self) -> float:
        import time
        if self._start is None:
            return 0
        return time.perf_counter() - self._start


timer = Timer()
timer.start()
sum(range(1000000))
print(f"\\n耗时: {timer.elapsed():.4f}s")

\`\`\`

## 小结

本章介绍了 datetime 与时间处理：

- **date/time/datetime**：日期时间类
- **timedelta**：时间差运算
- **strftime**：格式化输出
- **strptime**：字符串解析
- **时区**：timezone、zoneinfo
- **time 模块**：时间戳、sleep、perf_counter
- **calendar**：月历、闰年
- **日期运算**：月范围、工作日计算
- **时区转换**：跨时区会议
- **工具类**：DateRange、Timer

日期处理是后端常见需求，掌握 datetime 能解决 90% 场景。下一章学习命令行工具开发。
`
  },
  {
    id: "py10-ch79",
    group: "第十六部分 标准库与综合实战",
    icon: "🛠️",
    title: "第七十九章 命令行工具开发",
    content: `

# 第七十九章 命令行工具开发

## 一、argparse 简介

\`argparse\` 是 Python 标准库的命令行解析器，功能强大、自动生成帮助文档。

\`\`\`python
import argparse


# 最简单的例子
def main():
    parser = argparse.ArgumentParser(
        prog="mytool",
        description="一个示例命令行工具",
    )
    # 添加位置参数（必填）
    parser.add_argument("name", help="用户名")
    # 添加可选参数
    parser.add_argument("-g", "--greet", default="Hello", help="问候语")
    # 添加标志（布尔）
    parser.add_argument("-v", "--verbose", action="store_true", help="详细输出")

    # 模拟命令行参数
    args = parser.parse_args(["张三", "-g", "Hi", "-v"])
    greeting = f"{args.greet}, {args.name}!"
    if args.verbose:
        print(f"[verbose] 准备问候: {args.name}")
    print(greeting)


main()

\`\`\`

## 二、位置参数与可选参数

\`\`\`python
import argparse


def build_parser():
    parser = argparse.ArgumentParser(description="参数演示")

    # 位置参数：按顺序，必填
    parser.add_argument("input", help="输入文件")
    parser.add_argument("output", help="输出文件")

    # 可选参数：-short --long
    # WHY: 同时提供短长两种形式，方便交互式和脚本使用
    parser.add_argument("-c", "--count", type=int, default=1, help="重复次数")
    parser.add_argument("-o", "--output-format", choices=["json", "csv", "yaml"],
                        default="json", help="输出格式")

    # 标志参数
    parser.add_argument("--verbose", action="store_true", help="详细输出")
    parser.add_argument("--quiet", action="store_false", dest="verbose",
                        help="安静模式")

    # 计数参数
    parser.add_argument("-d", "--debug", action="count", default=0,
                        help="调试级别（-d -dd -ddd）")

    # 多值参数
    parser.add_argument("--include", nargs="+", help="包含的文件")
    parser.add_argument("--optional", nargs="*", help="零或多个值")
    parser.add_argument("--exactly", nargs=2, help="恰好 2 个值")

    return parser


args = build_parser().parse_args([
    "input.txt", "output.txt",
    "-c", "3",
    "--output-format", "csv",
    "-dd",
    "--include", "a.txt", "b.txt", "c.txt",
])
print(f"input: {args.input}")
print(f"output: {args.output}")
print(f"count: {args.count}")
print(f"format: {args.output_format}")
print(f"verbose: {args.verbose}")
print(f"debug: {args.debug}")
print(f"include: {args.include}")

\`\`\`

## 三、参数类型转换

\`\`\`python
import argparse
import os


# type 参数指定转换函数
def build_parser():
    parser = argparse.ArgumentParser()

    # 内置类型
    parser.add_argument("--count", type=int)
    parser.add_argument("--rate", type=float)
    parser.add_argument("--enabled", type=bool)  # 注意：bool 转换有坑

    # 自定义类型：验证文件存在
    def existing_file(path):
        if not os.path.exists(path):
            raise argparse.ArgumentTypeError(f"文件不存在: {path}")
        return path

    parser.add_argument("--config", type=existing_file, help="配置文件路径")

    # 自定义类型：范围验证
    def port_number(value):
        n = int(value)
        if not (1 <= n <= 65535):
            raise argparse.ArgumentTypeError(f"端口范围 1-65535: {n}")
        # WHY: 自定义类型让参数验证集中在解析阶段，业务代码更干净
        return n

    parser.add_argument("--port", type=port_number, default=8080)

    return parser


args = build_parser().parse_args(["--port", "9000", "--count", "5", "--rate", "0.5"])
print(args)

\`\`\`

## 四、子命令 subparsers

复杂工具如 git、docker 用子命令组织功能。

\`\`\`python
import argparse


def cmd_add(args):
    print(f"添加: {args.name}")


def cmd_remove(args):
    print(f"删除: {args.name}")


def cmd_list(args):
    print("列表: ...")


def build_parser():
    parser = argparse.ArgumentParser(prog="myapp")
    # WHY: subparsers 让每个命令有独立的参数和帮助，类似 git add/commit/push
    sub = parser.add_subparsers(dest="command", required=True)

    # add 子命令
    p_add = sub.add_parser("add", help="添加项目")
    p_add.add_argument("name", help="项目名")
    p_add.add_argument("--force", action="store_true")
    p_add.set_defaults(func=cmd_add)  # 绑定处理函数

    # remove 子命令
    p_rm = sub.add_parser("remove", help="删除项目")
    p_rm.add_argument("name")
    p_rm.set_defaults(func=cmd_remove)

    # list 子命令
    p_list = sub.add_parser("list", help="列出项目")
    p_list.add_argument("-a", "--all", action="store_true")
    p_list.set_defaults(func=cmd_list)

    return parser


parser = build_parser()
args = parser.parse_args(["add", "test-item", "--force"])
# set_defaults(func=...) 让 dispatch 极简
args.func(args)

print()
args = parser.parse_args(["list", "-a"])
args.func(args)

\`\`\`

## 五、互斥参数

\`\`\`python
import argparse


def build_parser():
    parser = argparse.ArgumentParser()
    # 互斥组：只能选一个
    # WHY: --verbose 和 --quiet 不应同时出现，互斥组强制约束
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--verbose", action="store_true", help="详细")
    group.add_argument("--quiet", action="store_true", help="安静")

    # 互斥必选
    group2 = parser.add_mutually_exclusive_group(required=True)
    group2.add_argument("--json", action="store_true", help="JSON 输出")
    group2.add_argument("--yaml", action="store_true", help="YAML 输出")
    group2.add_argument("--csv", action="store_true", help="CSV 输出")

    return parser


args = build_parser().parse_args(["--verbose", "--json"])
print(args)

# 互斥会自动报错
try:
    build_parser().parse_args(["--verbose", "--quiet", "--json"])
except SystemExit:
    print("互斥参数报错（预期）")

\`\`\`

## 六、getopt 简单解析

\`getopt\` 是更老的参数解析器，类似 C 的 getopt，简单但功能有限。

\`\`\`python
import getopt
import sys


def parse_with_getopt(argv):
    """getopt 风格解析"""
    # 短选项：a:b 表示 -a 需要参数，c 表示 -c 不需要参数
    # 长选项：['help', 'output=', 'verbose']
    try:
        opts, args = getopt.getopt(argv[1:], "ho:v", ["help", "output=", "verbose"])
    except getopt.GetoptError as e:
        print(f"参数错误: {e}")
        sys.exit(2)

    config = {"output": None, "verbose": False}
    for opt, value in opts:
        if opt in ("-h", "--help"):
            print("帮助信息")
            sys.exit(0)
        elif opt in ("-o", "--output"):
            config["output"] = value
        elif opt in ("-v", "--verbose"):
            config["verbose"] = True

    return config, args


# 测试
config, positional = parse_with_getopt(["prog", "-o", "result.txt", "-v", "input.data"])
print(f"配置: {config}")
print(f"位置参数: {positional}")

# WHY: getopt 适合简单脚本，复杂场景用 argparse

\`\`\`

## 七、sys.argv 手动解析

\`\`\`python
import sys


def manual_parse(argv):
    """手动解析（最简单，无依赖）"""
    args = {"positional": [], "flags": set(), "options": {}}
    i = 1
    while i < len(argv):
        arg = argv[i]
        if arg.startswith("--"):
            key = arg[2:]
            if "=" in key:
                k, v = key.split("=", 1)
                args["options"][k] = v
            elif i + 1 < len(argv) and not argv[i + 1].startswith("-"):
                args["options"][key] = argv[i + 1]
                i += 1
            else:
                args["flags"].add(key)
        elif arg.startswith("-"):
            for k in arg[1:]:
                args["flags"].add(k)
        else:
            args["positional"].append(arg)
        i += 1
    return args


# 测试
test = ["prog", "file.txt", "--output=out.json", "--verbose", "-d"]
result = manual_parse(test)
print(f"位置参数: {result['positional']}")
print(f"选项: {result['options']}")
print(f"标志: {result['flags']}")

# WHY: 极简脚本可以手写，避免 argparse 开销

\`\`\`

## 八、click / rich 概念

\`click\` 和 \`rich\` 是流行的第三方 CLI 库，比 argparse 更优雅。

\`\`\`python
# click 示例（需 pip install click）
# 以下代码仅供参考，沙箱无法运行

click_example = '''
import click

@click.command()
@click.argument("name")
@click.option("--count", default=1, help="重复次数")
@click.option("--greet", "-g", default="Hello")
@click.version_option(version="1.0.0")
def cli(name, count, greet):
    """打招呼工具"""
    for _ in range(count):
        click.echo(f"{greet}, {name}!")

if __name__ == "__main__":
    cli()
'''
print("click 示例:")
print(click_example)

# rich 示例（需 pip install rich）
rich_example = '''
from rich.console import Console
from rich.table import Table
from rich.progress import track

console = Console()

# 彩色输出
console.print("[bold red]错误[/bold red]")
console.print("[green]成功[/green]")

# 表格
table = Table(title="用户列表")
table.add_column("ID", style="cyan")
table.add_column("姓名", style="magenta")
table.add_column("年龄", justify="right")
table.add_row("1", "张三", "25")
table.add_row("2", "李四", "30")
console.print(table)

# 进度条
for i in track(range(100), description="处理中..."):
    pass
'''
print("\\nrich 示例:")
print(rich_example)

# WHY: click 让 CLI 定义声明化，rich 让输出更美观

\`\`\`

## 九、实战：文件整理工具

\`\`\`python
import argparse
import os
import shutil
from pathlib import Path
from collections import defaultdict
import json


def organize_files(directory: str, dry_run: bool = False) -> dict:
    """按扩展名整理文件到子目录"""
    # 扩展名到目录的映射
    # WHY: 按类型归类让目录更整洁，常见下载文件夹整理需求
    category_map = {
        ".jpg": "图片", ".jpeg": "图片", ".png": "图片", ".gif": "图片",
        ".mp4": "视频", ".avi": "视频", ".mov": "视频",
        ".mp3": "音乐", ".wav": "音乐", ".flac": "音乐",
        ".pdf": "文档", ".doc": "文档", ".docx": "文档", ".txt": "文档",
        ".py": "代码", ".js": "代码", ".html": "代码", ".css": "代码",
        ".zip": "压缩包", ".tar": "压缩包", ".gz": "压缩包",
    }

    src = Path(directory)
    if not src.is_dir():
        raise ValueError(f"不是目录: {directory}")

    moved = defaultdict(list)
    for file_path in src.iterdir():
        if not file_path.is_file():
            continue
        ext = file_path.suffix.lower()
        category = category_map.get(ext, "其他")
        dest_dir = src / category
        if dry_run:
            moved[category].append(file_path.name)
        else:
            dest_dir.mkdir(exist_ok=True)
            dest = dest_dir / file_path.name
            shutil.move(str(file_path), str(dest))
            moved[category].append(file_path.name)

    return dict(moved)


def build_cli():
    parser = argparse.ArgumentParser(
        prog="fileorg",
        description="按类型整理目录下的文件",
    )
    parser.add_argument("directory", help="要整理的目录")
    parser.add_argument("--dry-run", action="store_true", help="只显示不实际移动")
    parser.add_argument("--report", help="输出报告到 JSON 文件")
    parser.add_argument("-v", "--verbose", action="store_true", help="详细输出")
    return parser


def main():
    import tempfile
    import os

    # 创建测试目录演示
    with tempfile.TemporaryDirectory() as tmp:
        # 创建测试文件
        for name in ["a.jpg", "b.png", "c.mp4", "d.pdf", "e.py", "f.zip", "g.unknown"]:
            Path(tmp, name).touch()

        # 模拟命令行
        args = build_cli().parse_args([tmp, "--dry-run", "-v"])
        print(f"目录: {args.directory}")
        print(f"dry-run: {args.dry_run}")

        result = organize_files(args.directory, dry_run=args.dry_run)
        if args.verbose:
            for category, files in result.items():
                print(f"  {category}: {files}")

        if args.report:
            with open(args.report, "w") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

        # 实际整理
        result = organize_files(args.directory, dry_run=False)
        print("\\n实际整理后:")
        for category, files in result.items():
            print(f"  {category}/: {files}")


main()

\`\`\`

## 十、实战：批量重命名工具

\`\`\`python
import argparse
import os
import re
from pathlib import Path


def batch_rename(directory: str, pattern: str, replacement: str,
                 prefix: str = "", suffix: str = "", dry_run: bool = False) -> list[tuple[str, str]]:
    """批量重命名文件"""
    src = Path(directory)
    renames = []
    for file_path in sorted(src.iterdir()):
        if not file_path.is_file():
            continue
        old_name = file_path.name
        # 用正则替换
        new_name = re.sub(pattern, replacement, old_name)
        # 加前后缀
        stem = Path(new_name).stem
        ext = Path(new_name).suffix
        new_name = f"{prefix}{stem}{suffix}{ext}"

        if new_name != old_name:
            renames.append((old_name, new_name))
            if not dry_run:
                file_path.rename(file_path.parent / new_name)

    return renames


# 演示
import tempfile

with tempfile.TemporaryDirectory() as tmp:
    # 创建 IMG_001.jpg 风格的文件
    for i in range(1, 6):
        Path(tmp, f"IMG_{i:03d}.jpg").touch()

    print("原始文件:")
    for f in sorted(os.listdir(tmp)):
        print(f"  {f}")

    # 重命名：IMG_xxx -> photo_xxx
    renames = batch_rename(tmp, r"IMG_(\\d+)", r"photo_\\1", dry_run=False)
    print("\\n重命名:")
    for old, new in renames:
        print(f"  {old} -> {new}")

\`\`\`

## 十一、实战：多命令行工具集

\`\`\`python
import argparse
import json
import os
from pathlib import Path


class TodoCLI:
    """待办事项 CLI"""

    def __init__(self):
        self.parser = self._build_parser()

    def _build_parser(self):
        parser = argparse.ArgumentParser(prog="todo", description="待办事项管理")
        sub = parser.add_subparsers(dest="command", required=True)

        p_add = sub.add_parser("add", help="添加任务")
        p_add.add_argument("title", help="任务标题")
        p_add.add_argument("-p", "--priority", type=int, default=1, choices=[1, 2, 3])

        p_list = sub.add_parser("list", help="列出任务")
        p_list.add_argument("--all", action="store_true", help="包括已完成")
        p_list.add_argument("--sort", choices=["priority", "created"], default="created")

        p_done = sub.add_parser("done", help="标记完成")
        p_done.add_argument("id", type=int)

        p_del = sub.add_parser("delete", help="删除任务")
        p_del.add_argument("id", type=int)

        return parser

    def run(self, argv=None):
        args = self.parser.parse_args(argv)
        # 调用对应方法
        # WHY: 用 getattr 动态分发，避免长 if-elif 链
        method = getattr(self, f"cmd_{args.command}", None)
        if method:
            method(args)


# 演示
cli = TodoCLI()
cli.run(["add", "学 Python", "-p", "3"])
cli.run(["add", "买牛奶", "-p", "1"])
cli.run(["list", "--sort", "priority"])

\`\`\`

## 小结

本章介绍了命令行工具开发：

- **argparse**：标准库命令行解析器
- **位置/可选参数**：argument、option
- **类型转换**：type 参数
- **subparsers**：子命令组织
- **互斥参数**：mutually_exclusive_group
- **getopt**：简单解析（不推荐）
- **sys.argv**：手动解析
- **click/rich**：第三方 CLI 库
- **实战**：文件整理、批量重命名、Todo CLI

argparse 是 Python CLI 开发的基础，掌握后能快速构建任何工具。下一章我们做一个完整的待办事项综合项目。
`
  },
  {
    id: "py10-ch80",
    group: "第十六部分 标准库与综合实战",
    icon: "✅",
    title: "第八十章 综合项目：待办事项管理器",
    content: `

# 第八十章 综合项目：待办事项管理器

## 一、项目设计

本章综合运用前面学到的知识，构建一个完整的待办事项管理器：

- **数据模型**：用 dataclass 定义 Task
- **存储**：JSON 文件持久化
- **CRUD**：增删改查
- **CLI**：用 argparse 提供命令行
- **搜索过滤**：按关键字、状态、优先级
- **到期日**：支持 due_date 和提醒

\`\`\`python
from dataclasses import dataclass, asdict, field
from typing import Optional
from datetime import datetime, date
import json
import os


@dataclass
class Task:
    """任务数据模型"""
    id: int
    title: str
    description: str = ""
    priority: int = 1  # 1=低 2=中 3=高
    completed: bool = False
    created_at: str = ""
    completed_at: str = ""
    due_date: str = ""  # YYYY-MM-DD
    tags: list[str] = field(default_factory=list)

    def __post_init__(self):
        if not self.created_at:
            # WHY: 自动记录创建时间，便于排序和审计
            self.created_at = datetime.now().isoformat()

    @property
    def is_overdue(self) -> bool:
        if not self.due_date or self.completed:
            return False
        try:
            due = date.fromisoformat(self.due_date)
            return date.today() > due
        except ValueError:
            return False

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        # 兼容旧版本数据
        # WHY: 数据格式演进时，from_dict 做向后兼容
        valid_fields = {f.name for f in cls.__dataclass_fields__.values()}
        filtered = {k: v for k, v in data.items() if k in valid_fields}
        return cls(**filtered)


# 测试 Task
t = Task(id=1, title="学 Python", priority=3, due_date="2024-12-31")
print(f"任务: {t.title}")
print(f"过期: {t.is_overdue}")
print(f"字典: {t.to_dict()}")

\`\`\`

## 二、存储层

\`\`\`python
import json
import os
from typing import Optional


class TaskStorage:
    """JSON 文件存储"""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self._ensure_file()

    def _ensure_file(self):
        # 文件不存在时创建空结构
        # WHY: 首次运行自动初始化，避免 FileNotFoundError
        if not os.path.exists(self.file_path):
            self._write({"tasks": [], "next_id": 1})

    def _read(self) -> dict:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            # 文件损坏时重置
            # WHY: 数据完整性比避免数据丢失更重要
            return {"tasks": [], "next_id": 1}

    def _write(self, data: dict):
        # 原子写入：先写临时文件再重命名
        # WHY: 写一半崩溃会损坏数据，原子写避免这个问题
        tmp = self.file_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.file_path)

    def load_all(self) -> list[dict]:
        return self._read()["tasks"]

    def save_all(self, tasks: list[dict], next_id: int):
        self._write({"tasks": tasks, "next_id": next_id})

    def get_next_id(self) -> int:
        return self._read()["next_id"]


# 演示
storage = TaskStorage("/tmp/todo_demo.json")
print(f"初始任务数: {len(storage.load_all())}")
print(f"下一个 ID: {storage.get_next_id()}")

\`\`\`

## 三、业务逻辑层

\`\`\`python
from typing import Optional
from datetime import date


class TodoService:
    """待办事项业务逻辑"""

    def __init__(self, storage: TaskStorage):
        self.storage = storage

    def add(self, title: str, description: str = "",
            priority: int = 1, due_date: str = "", tags: list[str] | None = None) -> Task:
        """添加任务"""
        next_id = self.storage.get_next_id()
        task = Task(
            id=next_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            tags=tags or [],
        )
        tasks = self.storage.load_all()
        tasks.append(task.to_dict())
        # WHY: 自增 ID 用专门字段，避免并发问题
        self.storage.save_all(tasks, next_id + 1)
        return task

    def list(self, show_all: bool = False, sort_by: str = "created") -> list[Task]:
        """列出任务"""
        tasks = [Task.from_dict(t) for t in self.storage.load_all()]
        if not show_all:
            tasks = [t for t in tasks if not t.completed]

        # 排序
        if sort_by == "priority":
            # WHY: 高优先级排前面，让重要任务更显眼
            tasks.sort(key=lambda t: (-t.priority, t.created_at))
        elif sort_by == "due":
            tasks.sort(key=lambda t: (t.due_date or "9999-12-31"))
        else:
            tasks.sort(key=lambda t: t.created_at)
        return tasks

    def complete(self, task_id: int) -> Optional[Task]:
        """标记完成"""
        tasks = self.storage.load_all()
        for t in tasks:
            if t["id"] == task_id:
                t["completed"] = True
                t["completed_at"] = date.today().isoformat()
                self.storage.save_all(tasks, self.storage.get_next_id())
                return Task.from_dict(t)
        return None

    def update(self, task_id: int, **kwargs) -> Optional[Task]:
        """更新任务"""
        tasks = self.storage.load_all()
        for t in tasks:
            if t["id"] == task_id:
                # 只更新有效字段
                for k, v in kwargs.items():
                    if v is not None and k in t:
                        t[k] = v
                self.storage.save_all(tasks, self.storage.get_next_id())
                return Task.from_dict(t)
        return None

    def delete(self, task_id: int) -> bool:
        """删除任务"""
        tasks = self.storage.load_all()
        original_len = len(tasks)
        tasks = [t for t in tasks if t["id"] != task_id]
        if len(tasks) < original_len:
            self.storage.save_all(tasks, self.storage.get_next_id())
            return True
        return False

    def search(self, keyword: str) -> list[Task]:
        """按关键字搜索"""
        tasks = self.storage.load_all()
        # WHY: 在标题和描述中搜索，让用户快速定位
        kw = keyword.lower()
        return [
            Task.from_dict(t) for t in tasks
            if kw in t["title"].lower() or kw in t.get("description", "").lower()
        ]

    def filter_by_tag(self, tag: str) -> list[Task]:
        """按标签过滤"""
        tasks = self.storage.load_all()
        return [Task.from_dict(t) for t in tasks if tag in t.get("tags", [])]

    def summary(self) -> dict:
        """统计摘要"""
        tasks = self.storage.load_all()
        total = len(tasks)
        done = sum(1 for t in tasks if t["completed"])
        overdue = sum(
            1 for t in tasks
            if not t["completed"]
            and t.get("due_date")
            and date.fromisoformat(t["due_date"]) < date.today()
        )
        return {
            "total": total,
            "completed": done,
            "pending": total - done,
            "overdue": overdue,
            "completion_rate": (done / total * 100) if total else 0,
        }


# 测试
storage = TaskStorage("/tmp/todo_demo.json")
service = TodoService(storage)

# 添加任务
service.add("学 Python 基础", priority=3, due_date="2024-12-31", tags=["学习"])
service.add("买牛奶", priority=1, tags=["生活"])
service.add("写报告", priority=2, due_date="2024-01-01", tags=["工作"])

print("\\n所有任务:")
for t in service.list(sort_by="priority"):
    status = "✓" if t.completed else "○"
    print(f"  [{t.id}] {status} {t.title} (优先级 {t.priority})")

\`\`\`

## 四、CLI 接口

\`\`\`python
import argparse
import sys


class TodoCLI:
    """待办事项命令行界面"""

    def __init__(self, storage_path: str = "~/.todo.json"):
        self.storage = TaskStorage(os.path.expanduser(storage_path))
        self.service = TodoService(self.storage)
        self.parser = self._build_parser()

    def _build_parser(self):
        parser = argparse.ArgumentParser(
            prog="todo",
            description="待办事项管理器",
        )
        sub = parser.add_subparsers(dest="command", required=True)

        # add
        p_add = sub.add_parser("add", help="添加任务")
        p_add.add_argument("title", help="任务标题")
        p_add.add_argument("-d", "--description", default="", help="详细描述")
        p_add.add_argument("-p", "--priority", type=int, default=1,
                           choices=[1, 2, 3], help="优先级 1=低 2=中 3=高")
        p_add.add_argument("--due", help="到期日 YYYY-MM-DD")
        p_add.add_argument("-t", "--tags", nargs="*", default=[], help="标签")

        # list
        p_list = sub.add_parser("list", help="列出任务")
        p_list.add_argument("--all", action="store_true", help="包括已完成")
        p_list.add_argument("--sort", choices=["created", "priority", "due"],
                            default="created")

        # done
        p_done = sub.add_parser("done", help="标记完成")
        p_done.add_argument("id", type=int)

        # update
        p_upd = sub.add_parser("update", help="更新任务")
        p_upd.add_argument("id", type=int)
        p_upd.add_argument("--title")
        p_upd.add_argument("--priority", type=int, choices=[1, 2, 3])
        p_upd.add_argument("--due")

        # delete
        p_del = sub.add_parser("delete", help="删除任务")
        p_del.add_argument("id", type=int)

        # search
        p_search = sub.add_parser("search", help="搜索任务")
        p_search.add_argument("keyword")

        # summary
        sub.add_parser("summary", help="统计摘要")

        return parser

    def run(self, argv=None):
        args = self.parser.parse_args(argv)
        method = getattr(self, f"cmd_{args.command}", None)
        if method:
            method(args)

    def cmd_add(self, args):
        task = self.service.add(
            title=args.title,
            description=args.description,
            priority=args.priority,
            due_date=args.due or "",
            tags=args.tags,
        )
        print(f"已添加任务 [{task.id}] {task.title}")

    def cmd_list(self, args):
        tasks = self.service.list(show_all=args.all, sort_by=args.sort)
        if not tasks:
            print("（暂无任务）")
            return
        # WHY: 列表用对齐格式，让信息一目了然
        print(f"{'ID':>4}  {'状态':2}  {'优先级':4}  {'到期':12}  {'标题'}")
        print("-" * 60)
        for t in tasks:
            status = "✓" if t.completed else "○"
            overdue = "!" if t.is_overdue else " "
            print(f"{t.id:>4}  {status}{overdue}  P{t.priority:<3}  {t.due_date or '':12}  {t.title}")

    def cmd_done(self, args):
        task = self.service.complete(args.id)
        if task:
            print(f"已完成: {task.title}")
        else:
            print(f"未找到 ID {args.id}")

    def cmd_update(self, args):
        kwargs = {
            "title": args.title,
            "priority": args.priority,
            "due_date": args.due,
        }
        task = self.service.update(args.id, **{k: v for k, v in kwargs.items() if v is not None})
        if task:
            print(f"已更新: {task.title}")
        else:
            print(f"未找到 ID {args.id}")

    def cmd_delete(self, args):
        if self.service.delete(args.id):
            print(f"已删除 ID {args.id}")
        else:
            print(f"未找到 ID {args.id}")

    def cmd_search(self, args):
        tasks = self.service.search(args.keyword)
        if not tasks:
            print(f"未找到匹配 '{args.keyword}' 的任务")
            return
        for t in tasks:
            print(f"  [{t.id}] {t.title}")

    def cmd_summary(self, args):
        s = self.service.summary()
        print(f"任务总数: {s['total']}")
        print(f"已完成: {s['completed']}")
        print(f"待办: {s['pending']}")
        print(f"已过期: {s['overdue']}")
        print(f"完成率: {s['completion_rate']:.1f}%")


# 测试
cli = TodoCLI("/tmp/todo_demo.json")
cli.run(["add", "学 FastAPI", "-p", "2", "--due", "2024-12-31", "-t", "学习", "web"])
print()
cli.run(["list", "--sort", "priority"])
print()
cli.run(["summary"])
print()
cli.run(["search", "学"])

\`\`\`

## 五、单元测试

\`\`\`python
import unittest
import tempfile
import os


class TestTodoService(unittest.TestCase):
    def setUp(self):
        # 每个测试用临时文件
        # WHY: 测试间隔离，避免互相影响
        fd, self.path = tempfile.mkstemp(suffix=".json")
        os.close(fd)
        self.storage = TaskStorage(self.path)
        self.service = TodoService(self.storage)

    def tearDown(self):
        if os.path.exists(self.path):
            os.remove(self.path)

    def test_add_task(self):
        task = self.service.add("测试任务", priority=2)
        self.assertEqual(task.title, "测试任务")
        self.assertEqual(task.priority, 2)
        self.assertFalse(task.completed)
        self.assertEqual(task.id, 1)

    def test_complete_task(self):
        self.service.add("任务1")
        task = self.service.complete(1)
        self.assertIsNotNone(task)
        self.assertTrue(task.completed)
        self.assertTrue(task.completed_at)

    def test_delete_task(self):
        self.service.add("任务1")
        self.assertTrue(self.service.delete(1))
        self.assertEqual(len(self.service.list()), 0)

    def test_search(self):
        self.service.add("学 Python")
        self.service.add("买牛奶")
        results = self.service.search("学")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "学 Python")

    def test_summary(self):
        self.service.add("任务1")
        self.service.add("任务2")
        self.service.complete(1)
        s = self.service.summary()
        self.assertEqual(s["total"], 2)
        self.assertEqual(s["completed"], 1)
        self.assertEqual(s["pending"], 1)

    def test_id_auto_increment(self):
        t1 = self.service.add("任务1")
        t2 = self.service.add("任务2")
        self.assertEqual(t2.id, t1.id + 1)

    def test_delete_then_add_reuses_no_id(self):
        t1 = self.service.add("任务1")
        self.service.delete(t1.id)
        t2 = self.service.add("任务2")
        # next_id 不回退，避免 ID 重用
        # WHY: ID 重用会导致引用旧 ID 的地方出错
        self.assertEqual(t2.id, t1.id + 1)


# 运行测试
unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 六、完整可运行版本

\`\`\`python
# 完整的待办事项管理器（可直接保存为 todo.py 运行）
# 用法：
#   python todo.py add "学 Python" -p 3 --due 2024-12-31 -t 学习
#   python todo.py list --sort priority
#   python todo.py done 1
#   python todo.py search Python
#   python todo.py summary

import argparse
import json
import os
import sys
from dataclasses import dataclass, asdict, field
from datetime import datetime, date
from typing import Optional


@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    priority: int = 1
    completed: bool = False
    created_at: str = ""
    completed_at: str = ""
    due_date: str = ""
    tags: list = field(default_factory=list)

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

    @property
    def is_overdue(self) -> bool:
        if not self.due_date or self.completed:
            return False
        try:
            return date.today() > date.fromisoformat(self.due_date)
        except ValueError:
            return False


class TaskStorage:
    def __init__(self, path: str):
        self.path = path
        if not os.path.exists(path):
            self._write({"tasks": [], "next_id": 1})

    def _read(self):
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {"tasks": [], "next_id": 1}

    def _write(self, data):
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.path)


class TodoService:
    def __init__(self, storage: TaskStorage):
        self.storage = storage

    def add(self, title, **kwargs):
        data = self.storage._read()
        task = Task(id=data["next_id"], title=title, **kwargs)
        data["tasks"].append(asdict(task))
        data["next_id"] += 1
        self.storage._write(data)
        return task

    def list(self, show_all=False, sort_by="created"):
        data = self.storage._read()
        tasks = [Task(**t) for t in data["tasks"]]
        if not show_all:
            tasks = [t for t in tasks if not t.completed]
        if sort_by == "priority":
            tasks.sort(key=lambda t: (-t.priority, t.created_at))
        return tasks

    def complete(self, task_id):
        data = self.storage._read()
        for t in data["tasks"]:
            if t["id"] == task_id:
                t["completed"] = True
                t["completed_at"] = date.today().isoformat()
                self.storage._write(data)
                return Task(**t)
        return None

    def delete(self, task_id):
        data = self.storage._read()
        before = len(data["tasks"])
        data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
        if len(data["tasks"]) < before:
            self.storage._write(data)
            return True
        return False


def main():
    parser = argparse.ArgumentParser(prog="todo", description="待办事项管理")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_add = sub.add_parser("add", help="添加任务")
    p_add.add_argument("title")
    p_add.add_argument("-p", "--priority", type=int, default=1, choices=[1, 2, 3])

    p_list = sub.add_parser("list", help="列出任务")
    p_list.add_argument("--all", action="store_true")

    p_done = sub.add_parser("done", help="标记完成")
    p_done.add_argument("id", type=int)

    p_del = sub.add_parser("delete", help="删除任务")
    p_del.add_argument("id", type=int)

    args = parser.parse_args()
    storage = TaskStorage(os.path.expanduser("~/.todo.json"))
    service = TodoService(storage)

    if args.cmd == "add":
        t = service.add(args.title, priority=args.priority)
        print(f"[{t.id}] 已添加: {t.title}")
    elif args.cmd == "list":
        for t in service.list(show_all=args.all):
            mark = "✓" if t.completed else "○"
            print(f"  [{t.id}] {mark} {t.title} (P{t.priority})")
    elif args.cmd == "done":
        t = service.complete(args.id)
        print(f"完成: {t.title}" if t else "未找到")
    elif args.cmd == "delete":
        print("已删除" if service.delete(args.id) else "未找到")


# 模拟运行
sys.argv = ["todo", "add", "示例任务", "-p", "2"]
main()
sys.argv = ["todo", "list", "--all"]
main()

\`\`\`

## 小结

本章综合实战构建了待办事项管理器：

- **数据模型**：dataclass + 类型注解
- **存储层**：JSON 文件 + 原子写入
- **业务逻辑**：CRUD + 搜索 + 统计
- **CLI 接口**：argparse 子命令
- **单元测试**：unittest + 临时文件
- **完整版本**：可直接运行的脚本

这个项目覆盖了 Python 应用开发的核心模式：分层架构、数据持久化、命令行交互、测试驱动。下一章我们做一个 Web 爬虫综合项目。
`
  },
  {
    id: "py10-ch81",
    group: "第十六部分 标准库与综合实战",
    icon: "🕷️",
    title: "第八十一章 综合项目：简易 Web 爬虫",
    content: `

# 第八十一章 综合项目：简易 Web 爬虫

## 一、项目设计

本章构建一个只用标准库的简易 Web 爬虫，包括：

- **HTTP 客户端**：urllib 请求
- **HTML 解析**：html.parser
- **URL 管理**：已访问集合、队列
- **robots.txt**：遵守爬虫协议
- **限速**：礼貌爬取，避免压垮服务器
- **数据提取**：标题、链接、文本
- **JSON 导出**：结果持久化

\`\`\`python
from urllib.parse import urlparse, urljoin
from html.parser import HTMLParser
from typing import Optional
import urllib.request
import urllib.error
import urllib.robotparser
import time
import json
import re


class URLFrontier:
    """URL 管理器：待访问队列 + 已访问集合"""

    def __init__(self):
        self._queue: list[str] = []
        self._seen: set[str] = set()
        # WHY: 用集合判重 O(1)，避免重复爬取同一 URL

    def add(self, url: str) -> bool:
        """添加 URL，返回是否新增"""
        # 规范化：去掉 fragment
        # WHY: #section 不影响内容，应视为同一页面
        normalized = self._normalize(url)
        if normalized in self._seen:
            return False
        self._seen.add(normalized)
        self._queue.append(normalized)
        return True

    def _normalize(self, url: str) -> str:
        parts = urlparse(url)
        # 去掉 fragment，统一 scheme/host 大小写
        return parts._replace(fragment="").geturl()

    def next(self) -> Optional[str]:
        """取出下一个 URL"""
        if not self._queue:
            return None
        return self._queue.pop(0)

    def __len__(self):
        return len(self._queue)


# 测试
frontier = URLFrontier()
frontier.add("https://example.com/a#x")
frontier.add("https://example.com/a")  # 重复
frontier.add("https://example.com/b")
print(f"队列长度: {len(frontier)}")  # 1（a 已 seen 但还在 queue 中, b 入队）
print(f"下一个: {frontier.next()}")
print(f"下一个: {frontier.next()}")
print(f"下一个: {frontier.next()}")  # None

\`\`\`

## 二、HTML 解析器

\`\`\`python
from html.parser import HTMLParser
from typing import Optional


class LinkExtractor(HTMLParser):
    """提取页面中的所有链接和标题"""

    def __init__(self):
        super().__init__()
        self.links: list[str] = []
        self.title: str = ""
        self._in_title = False
        self._current_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag == "a":
            # 提取 href
            # WHY: attrs 是 (name, value) 列表，遍历找 href
            for name, value in attrs:
                if name == "href" and value:
                    self.links.append(value)
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str):
        if tag == "title":
            self._in_title = False
            self.title = "".join(self._current_text).strip()
            self._current_text = []

    def handle_data(self, data: str):
        if self._in_title:
            self._current_text.append(data)


# 测试
html = """
<html>
<head><title>测试页面</title></head>
<body>
    <a href="/page1">页面1</a>
    <a href="https://other.com/page2">页面2</a>
    <a href="#section">锚点</a>
    <a>无 href</a>
</body>
</html>
"""

parser = LinkExtractor()
parser.feed(html)
print(f"标题: {parser.title}")
print(f"链接: {parser.links}")

\`\`\`

## 三、内容提取器

\`\`\`python
from html.parser import HTMLParser
import re


class ContentExtractor(HTMLParser):
    """提取页面文本内容和元数据"""

    def __init__(self):
        super().__init__()
        self.title = ""
        self.text_parts: list[str] = []
        self.links: list[dict] = []
        self.images: list[str] = []
        self.meta: dict[str, str] = {}
        self._in_title = False
        self._in_script = False
        self._in_style = False
        self._current_link_text = ""
        self._in_a = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "script":
            # WHY: script/style 内容不是可见文本，应忽略
            self._in_script = True
        elif tag == "style":
            self._in_style = True
        elif tag == "a":
            self._in_a = True
            self._current_link_text = ""
            href = attrs_dict.get("href", "")
            if href:
                self.links.append({"href": href, "text": ""})
        elif tag == "img":
            src = attrs_dict.get("src", "")
            if src:
                self.images.append(src)
        elif tag == "meta":
            name = attrs_dict.get("name") or attrs_dict.get("property")
            content = attrs_dict.get("content", "")
            if name and content:
                self.meta[name] = content

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            self._in_script = False
        elif tag == "style":
            self._in_style = False
        elif tag == "a" and self._in_a:
            self._in_a = False
            if self.links:
                self.links[-1]["text"] = self._current_link_text.strip()

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        elif not self._in_script and not self._in_style:
            self.text_parts.append(data)
            if self._in_a:
                self._current_link_text += data

    @property
    def text(self) -> str:
        # 清理多余空白
        # WHY: HTML 中换行和缩进会产生大量空白，需规范化
        raw = " ".join(self.text_parts)
        return re.sub(r"\\s+", " ", raw).strip()


# 测试
html = """
<html>
<head>
<title>示例 - Python 教程</title>
<meta name="description" content="学习 Python 的好地方">
</head>
<body>
<script>var x = 1;</script>
<style>body { color: red; }</style>
<h1>欢迎</h1>
<p>这是 <a href="/tutorial">教程</a> 链接。</p>
<img src="logo.png" alt="logo">
</body>
</html>
"""

ext = ContentExtractor()
ext.feed(html)
print(f"标题: {ext.title}")
print(f"描述: {ext.meta.get('description')}")
print(f"文本: {ext.text}")
print(f"链接: {ext.links}")
print(f"图片: {ext.images}")

\`\`\`

## 四、HTTP 客户端封装

\`\`\`python
import urllib.request
import urllib.error
from typing import Optional


class HttpClient:
    """带超时和 User-Agent 的 HTTP 客户端"""

    def __init__(self, timeout: float = 10, user_agent: str = "PyCrawler/1.0"):
        self.timeout = timeout
        self.user_agent = user_agent

    def fetch(self, url: str) -> tuple[Optional[str], Optional[str], int]:
        """返回 (html, error, status_code)"""
        # WHY: 三元组让调用方能区分"成功但 404"和"网络错误"
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": self.user_agent},
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                # 处理编码
                content_type = resp.headers.get("Content-Type", "")
                charset = "utf-8"
                if "charset=" in content_type:
                    charset = content_type.split("charset=")[-1].split(";")[0]
                html = resp.read().decode(charset, errors="replace")
                return html, None, resp.status
        except urllib.error.HTTPError as e:
            return None, f"HTTP {e.code}", e.code
        except urllib.error.URLError as e:
            return None, f"URL 错误: {e.reason}", 0
        except Exception as e:
            return None, f"异常: {e}", 0


# 测试
client = HttpClient(timeout=5)
html, err, status = client.fetch("http://example.com")
if html:
    print(f"成功，状态 {status}，长度 {len(html)}")
else:
    print(f"失败（沙箱可能无网络）: {err}")

\`\`\`

## 五、robots.txt 检查

\`\`\`python
import urllib.robotparser
from urllib.parse import urlparse


class RobotsChecker:
    """检查 robots.txt 是否允许爬取"""

    def __init__(self, user_agent: str = "*"):
        self.user_agent = user_agent
        self._cache: dict[str, urllib.robotparser.RobotFileParser] = {}

    def can_fetch(self, url: str) -> bool:
        """检查 URL 是否可以爬取"""
        parts = urlparse(url)
        base = f"{parts.scheme}://{parts.netloc}"

        if base not in self._cache:
            # WHY: 缓存 robots.txt 避免每次请求都重新下载
            parser = urllib.robotparser.RobotFileParser()
            parser.set_url(f"{base}/robots.txt")
            try:
                parser.read()
            except Exception:
                # 读不到 robots.txt 默认允许
                parser = None
            self._cache[base] = parser

        rp = self._cache[base]
        if rp is None:
            return True
        return rp.can_fetch(self.user_agent, url)


# 测试
checker = RobotsChecker()
# 检查 example.com 是否允许爬取
print(f"允许 /: {checker.can_fetch('http://example.com/')}")
print(f"允许 /private: {checker.can_fetch('http://example.com/private')}")

\`\`\`

## 六、限速器

\`\`\`python
import time


class RateLimiter:
    """简单限速器：每秒最多 N 个请求"""

    def __init__(self, requests_per_second: float = 1.0):
        self.min_interval = 1.0 / requests_per_second
        self._last_request = 0.0

    def wait(self):
        """等待以满足限速"""
        now = time.monotonic()
        elapsed = now - self._last_request
        if elapsed < self.min_interval:
            # WHY: 礼貌爬取，避免压垮目标服务器，也避免被封 IP
            time.sleep(self.min_interval - elapsed)
        self._last_request = time.monotonic()


# 测试
limiter = RateLimiter(requests_per_second=5)  # 每秒 5 个
start = time.perf_counter()
for _ in range(3):
    limiter.wait()
print(f"3 个请求耗时: {time.perf_counter() - start:.2f}s（应约 0.4s）")

\`\`\`

## 七、爬虫主类

\`\`\`python
import time
import json
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class CrawlResult:
    url: str
    title: str = ""
    text: str = ""
    links: list = field(default_factory=list)
    images: list = field(default_factory=list)
    status: int = 0
    error: str = ""
    crawled_at: str = ""

    def __post_init__(self):
        if not self.crawled_at:
            self.crawled_at = time.strftime("%Y-%m-%dT%H:%M:%S")


class WebCrawler:
    """完整的 Web 爬虫"""

    def __init__(
        self,
        max_pages: int = 10,
        max_depth: int = 2,
        delay: float = 1.0,
        same_domain_only: bool = True,
    ):
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.rate_limiter = RateLimiter(1.0 / delay)
        self.http = HttpClient()
        self.robots = RobotsChecker()
        self.same_domain_only = same_domain_only
        self.frontier = URLFrontier()
        self.results: list[CrawlResult] = []
        # 记录 URL 深度
        self._depths: dict[str, int] = {}

    def crawl(self, start_url: str) -> list[CrawlResult]:
        """从 start_url 开始爬取"""
        self.frontier.add(start_url)
        self._depths[self.frontier._normalize(start_url)] = 0

        count = 0
        while count < self.max_pages:
            url = self.frontier.next()
            if url is None:
                break

            current_depth = self._depths.get(url, 0)

            # 检查 robots.txt
            if not self.robots.can_fetch(url):
                print(f"[跳过] robots.txt 禁止: {url}")
                continue

            # 限速
            self.rate_limiter.wait()

            # 抓取
            print(f"[{count+1}/{self.max_pages}] 抓取: {url}")
            html, err, status = self.http.fetch(url)
            if err:
                print(f"  失败: {err}")
                self.results.append(CrawlResult(url=url, error=err, status=status))
                continue

            # 解析
            extractor = ContentExtractor()
            try:
                extractor.feed(html)
            except Exception as e:
                print(f"  解析失败: {e}")
                continue

            result = CrawlResult(
                url=url,
                title=extractor.title,
                text=extractor.text[:500],  # 截断避免过长
                links=[l["href"] for l in extractor.links],
                images=extractor.images,
                status=status,
            )
            self.results.append(result)
            count += 1

            # 如果还有深度，把链接加入队列
            if current_depth < self.max_depth:
                for link in extractor.links:
                    full_url = urljoin(url, link["href"])
                    # 过滤非 HTTP
                    if not full_url.startswith(("http://", "https://")):
                        continue
                    # 同域过滤
                    if self.same_domain_only:
                        if urlparse(full_url).netloc != urlparse(url).netloc:
                            continue
                    if self.frontier.add(full_url):
                        self._depths[full_url] = current_depth + 1

        return self.results

    def save_json(self, path: str):
        """结果保存为 JSON"""
        with open(path, "w", encoding="utf-8") as f:
            # WHY: JSON 是最通用的数据交换格式，便于后续处理
            json.dump(
                [asdict(r) for r in self.results],
                f,
                ensure_ascii=False,
                indent=2,
            )
        print(f"已保存 {len(self.results)} 条结果到 {path}")


# 用本地服务器测试
import http.server
import socketserver
import threading


class TestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # 简单的测试页面
        # WHY: 用本地服务器测试避免依赖外网
        if self.path == "/":
            html = """<html><head><title>首页</title></head>
            <body>
                <h1>测试首页</h1>
                <a href="/page1">页面1</a>
                <a href="/page2">页面2</a>
                <a href="https://other.com/x">外部链接</a>
            </body></html>"""
        elif self.path == "/page1":
            html = """<html><head><title>页面1</title></head>
            <body><p>这是页面1</p><a href="/">回首页</a></body></html>"""
        elif self.path == "/page2":
            html = """<html><head><title>页面2</title></head>
            <body><p>这是页面2</p></body></html>"""
        else:
            self.send_error(404)
            return
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


# 启动测试服务器
with socketserver.TCPServer(("127.0.0.1", 0), TestHandler) as httpd:
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    # 运行爬虫
    crawler = WebCrawler(max_pages=5, max_depth=2, delay=0.1)
    results = crawler.crawl(f"http://127.0.0.1:{port}/")

    print(f"\\n抓取了 {len(results)} 个页面")
    for r in results:
        print(f"  [{r.status}] {r.title}: {r.url}")
        print(f"     链接数: {len(r.links)}")

    crawler.save_json("/tmp/crawl_results.json")
    httpd.shutdown()

\`\`\`

## 八、数据导出与分析

\`\`\`python
import json
from collections import Counter


def analyze_results(path: str) -> dict:
    """分析爬取结果"""
    with open(path, "r", encoding="utf-8") as f:
        results = json.load(f)

    total = len(results)
    success = sum(1 for r in results if r["status"] == 200)
    # WHY: 统计成功率帮助评估爬虫健壮性
    all_links = []
    for r in results:
        all_links.extend(r["links"])

    # 域名分布
    from urllib.parse import urlparse
    domains = Counter(urlparse(l).netloc for l in all_links if l)

    # 标题列表
    titles = [r["title"] for r in results if r["title"]]

    return {
        "total_pages": total,
        "success": success,
        "total_links": len(all_links),
        "unique_links": len(set(all_links)),
        "top_domains": domains.most_common(5),
        "titles": titles,
    }


# 分析刚才的结果
analysis = analyze_results("/tmp/crawl_results.json")
print("=== 爬虫分析 ===")
for k, v in analysis.items():
    print(f"  {k}: {v}")

\`\`\`

## 九、爬虫伦理与最佳实践

\`\`\`python
print("""
=== Web 爬虫伦理 ===

1. 遵守 robots.txt
   - 检查 /robots.txt 了解允许爬取的范围
   - 即使允许也要控制频率

2. 控制请求频率
   - 至少 1 秒间隔（推荐 2-3 秒）
   - 高峰期降低频率
   - WHY: 过快请求会拖垮目标服务器，等同 DDoS

3. 标识 User-Agent
   - 提供联系方式
   - 让管理员能联系你

4. 只抓需要的数据
   - 不要全站镜像
   - 用 HEAD 请求检查是否需要下载

5. 缓存结果
   - 避免重复抓取
   - 用 ETag/Last-Modified 条件请求

6. 错误处理
   - 5xx 错误增加间隔
   - 4xx 错误记录但继续
   - 网络错误重试 3 次

7. 法律风险
   - 公开数据可爬
   - 需登录数据谨慎
   - 个人信息受 GDPR 等保护
""")

\`\`\`

## 十、扩展方向

\`\`\`python
print("""
=== 爬虫扩展方向 ===

1. 异步爬取
   - 用 asyncio + aiohttp 提升并发
   - 速度可提升 10-100 倍

2. 持久化队列
   - SQLite 存储待爬 URL
   - 断点续爬

3. 分布式爬取
   - Redis 共享队列
   - 多机协作

4. JavaScript 渲染
   - 用 selenium 或 playwright
   - 处理 SPA 页面

5. 反爬虫对抗
   - 代理 IP 池
   - 验证码识别
   - 浏览器指纹模拟

6. 数据清洗
   - 用 BeautifulSoup/lxml 解析
   - 正则提取结构化数据

7. 监控告警
   - 抓取成功率监控
   - 异常 URL 告警

第三方库推荐：
- requests: 更友好的 HTTP 客户端
- BeautifulSoup: HTML 解析神器
- scrapy: 工业级爬虫框架
- selenium: 浏览器自动化
""")

\`\`\`

## 小结

本章综合实战构建了简易 Web 爬虫：

- **URLFrontier**：URL 队列管理
- **HTMLParser**：链接和内容提取
- **HttpClient**：HTTP 请求封装
- **RobotsChecker**：遵守 robots.txt
- **RateLimiter**：礼貌限速
- **WebCrawler**：爬虫主类
- **数据导出**：JSON 持久化
- **数据分析**：统计与报告
- **爬虫伦理**：负责任地爬取

这个项目覆盖了网络编程、HTML 解析、数据存储、限流等核心技能。生产环境推荐用 scrapy 框架，但理解原理很重要。下一章是本书的最后一章，总结与进阶方向。
`
  },
  {
    id: "py10-ch82",
    group: "结尾",
    icon: "🏁",
    title: "第八十二章 结语与进阶方向",
    content: `

# 第八十二章 结语与进阶方向

## 一、你已掌握的知识

恭喜！如果你跟随着这本书一路学来，你已经掌握了 Python 编程的核心知识体系。让我们回顾这段旅程：

\`\`\`python
print("""
=== Python 从入门到精通 · 学习路径回顾 ===

第一部分 入门基础（ch01-ch05）
  ✓ Python 安装与运行
  ✓ 变量与基本数据类型
  ✓ 字符串基础操作
  ✓ 数值运算与运算符
  ✓ 输入输出与格式化

第二部分 数据类型与字符串（ch06-ch10）
  ✓ 列表 list 详解
  ✓ 元组 tuple 与不可变序列
  ✓ 字典 dict 高级用法
  ✓ 集合 set 与运算
  ✓ 字符串与正则进阶

第三部分 流程控制（ch11-ch15）
  ✓ if/elif/else 条件分支
  ✓ for/while 循环
  ✓ break/continue/else
  ✓ match-case 模式匹配（3.10+）
  ✓ 推导式与生成器表达式

第四部分 数据结构（ch16-ch20）
  ✓ 栈与队列
  ✓ 链表
  ✓ 树与二叉树
  ✓ 堆 heapq
  ✓ collections 高级容器

第五部分 函数基础（ch21-ch25）
  ✓ 函数定义与参数
  ✓ 默认参数、关键字参数、*args/**kwargs
  ✓ 作用域 LEGB
  ✓ 递归
  ✓ lambda 与高阶函数

第六部分 函数进阶（ch26-ch30）
  ✓ 闭包
  ✓ 装饰器
  ✓ 生成器 yield
  ✓ 迭代器协议
  ✓ 函数式编程工具

第七部分 面向对象基础（ch31-ch35）
  ✓ 类与对象
  ✓ 属性与方法
  ✓ 继承
  ✓ 多态
  ✓ 封装与访问控制

第八部分 面向对象进阶（ch36-ch40）
  ✓ 魔术方法
  ✓ 类方法与静态方法
  ✓ property 描述符
  ✓ 抽象基类 ABC
  ✓ 元类入门

第九部分 异常处理（ch41-ch45）
  ✓ try/except/finally
  ✓ 自定义异常
  ✓ 异常链
  ✓ 上下文管理器
  ✓ 异常最佳实践

第十部分 文件 IO 与模块（ch46-ch50）
  ✓ 文件读写
  ✓ 路径处理 pathlib
  ✓ 模块与包
  ✓ 标准库概览
  ✓ 第三方库管理

第十一部分 装饰器与迭代器（ch51-ch55）
  ✓ 装饰器进阶
  ✓ 上下文装饰器
  ✓ 迭代器模式
  ✓ 生成器进阶
  ✓ 协程基础

第十二部分 并发编程（ch56-ch60）
  ✓ 多线程 threading
  ✓ 多进程 multiprocessing
  ✓ 同步原语
  ✓ 线程池进程池
  ✓ 并发对比与选型

第十三部分 异步编程 asyncio（ch61-ch65）
  ✓ asyncio 入门
  ✓ Task 与并发
  ✓ 异步 IO 与网络
  ✓ 异步同步原语
  ✓ asyncio 进阶实战

第十四部分 网络与数据库（ch66-ch70）
  ✓ socket 编程
  ✓ HTTP 与 urllib
  ✓ 邮件与 MIME
  ✓ sqlite3 数据库
  ✓ SQL 实战与模式设计

第十五部分 测试与工程化（ch71-ch75）
  ✓ unittest 单元测试
  ✓ pytest 风格测试
  ✓ mock 与测试技巧
  ✓ 项目结构与打包
  ✓ 代码质量工具

第十六部分 标准库与综合实战（ch76-ch81）
  ✓ os 与 sys 模块
  ✓ re 正则表达式
  ✓ datetime 时间处理
  ✓ 命令行工具开发
  ✓ 综合项目：待办事项管理器
  ✓ 综合项目：Web 爬虫
""")

\`\`\`

## 二、Python 生态全景

学完基础后，Python 的广阔生态正等你探索。下面按领域介绍主要方向。

\`\`\`python
print("""
=== Python 生态全景 ===

🌐 Web 开发
  ├─ Django      全功能框架，"包含电池"
  ├─ Flask       轻量灵活，微框架
  ├─ FastAPI     现代 ASGI 框架，自动 OpenAPI
  ├─ Starlette   ASGI 基础框架
  ├─ Tornado     异步老牌框架
  └─ Pyramid     灵活可扩展

📊 数据科学
  ├─ NumPy       数值计算基石
  ├─ Pandas      表格数据处理
  ├─ Matplotlib  绘图
  ├─ Seaborn     统计可视化
  ├─ Plotly      交互式图表
  └─ Jupyter     交互式笔记本

🤖 机器学习 / AI
  ├─ scikit-learn 传统机器学习
  ├─ PyTorch     动态图深度学习（Meta）
  ├─ TensorFlow  静态图深度学习（Google）
  ├─ Keras       高级神经网络 API
  ├─ Transformers HuggingFace NLP 模型库
  ├─ LangChain   LLM 应用开发
  └─ OpenAI SDK  GPT API 客户端

🕷️ 爬虫与自动化
  ├─ Scrapy      工业级爬虫框架
  ├─ BeautifulSoup HTML 解析
  ├─ Selenium    浏览器自动化
  ├─ Playwright  现代浏览器自动化
  ├─ Requests    HTTP 客户端
  └─ httpx       异步 HTTP 客户端

🖥️ GUI 桌面
  ├─ Tkinter     标准库 GUI
  ├─ PyQt/PySide Qt 绑定
  ├─ wxPython    跨平台 GUI
  └─ Kivy        移动应用

🔧 DevOps 与运维
  ├─ Ansible     配置管理
  ├─ Fabric      部署自动化
  ├─ Docker SDK  容器管理
  ├─ boto3       AWS SDK
  └─ SaltStack   基础设施自动化

🔬 科学计算
  ├─ SciPy       科学计算
  ├─ SymPy       符号计算
  ├─ Astropy     天文学
  └─ Biopython   生物信息

🎮 游戏开发
  ├─ Pygame      2D 游戏
  ├─ Panda3D     3D 引擎
  └─ Arcade      现代游戏框架

💼 办公自动化
  ├─ openpyxl    Excel
  ├─ python-docx Word
  ├─ python-pptx PowerPoint
  └─ reportlab   PDF 生成

🔐 安全
  ├─ cryptography 加密库
  ├─ paramiko    SSH
  └─ scapy       网络包操作
""")

\`\`\`

## 三、Web 框架对比

\`\`\`python
print("""
=== Web 框架对比 ===

| 框架 | 类型 | 异步 | 学习曲线 | 适合场景 |
|------|------|------|---------|---------|
| Django | 全栈 | 部分(3.1+) | 中 | CMS、电商、内容站 |
| Flask | 微 | 否 | 低 | 小工具、API |
| FastAPI | 现代 | 是 | 低 | RESTful API、微服务 |
| Starlette | 基础 | 是 | 中 | 自定义框架 |
| Tornado | 老牌 | 是 | 中 | 长连接、推送 |
| aiohttp | 异步 | 是 | 中 | 异步服务 + 客户端 |

# Django 适合"我想要一个完整网站"
# Flask 适合"我想要简单的 API"
# FastAPI 适合"我要现代异步 API + 自动文档"
""")

# FastAPI 代码示例（概念）
fastapi_example = '''
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello"}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id, "name": f"用户{user_id}"}

# 运行: uvicorn main:app --reload
# 自动文档: http://localhost:8000/docs
'''
print("FastAPI 示例:")
print(fastapi_example)

# WHY: FastAPI 自动根据类型注解生成 OpenAPI 文档，开发体验极佳

\`\`\`

## 四、数据科学方向

\`\`\`python
# Pandas 示例（概念）
pandas_example = '''
import pandas as pd

# 创建 DataFrame
df = pd.DataFrame({
    "name": ["张三", "李四", "王五"],
    "age": [25, 30, 35],
    "salary": [10000, 15000, 20000],
})

# 筛选
high_paid = df[df["salary"] > 12000]

# 分组聚合
avg_by_age = df.groupby("age")["salary"].mean()

# 读写文件
df.to_csv("output.csv", index=False)
df = pd.read_csv("input.csv")
'''
print("Pandas 示例:")
print(pandas_example)

# NumPy 示例
numpy_example = '''
import numpy as np

# 创建数组
arr = np.array([1, 2, 3, 4, 5])
matrix = np.array([[1, 2], [3, 4]])

# 向量化运算（比循环快 100 倍）
squared = arr ** 2
# WHY: NumPy 用 C 实现，向量化操作远快于 Python 循环

# 统计
print(arr.mean(), arr.std(), arr.max())
'''
print("\\nNumPy 示例:")
print(numpy_example)

\`\`\`

## 五、机器学习方向

\`\`\`python
# scikit-learn 示例
sklearn_example = '''
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_boston

# 加载数据
X, y = load_boston(return_X_y=True)

# 划分训练/测试集
X_train, X_test, y_train, y_test = train_test_split(X, y)

# 训练模型
model = LinearRegression()
model.fit(X_train, y_train)

# 评估
score = model.score(X_test, y_test)
print(f"R²: {score:.3f}")
'''
print("scikit-learn 示例:")
print(sklearn_example)

# PyTorch 示例
pytorch_example = '''
import torch
import torch.nn as nn

# 定义神经网络
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(784, 10)

    def forward(self, x):
        return self.fc(x)

model = Net()
optimizer = torch.optim.Adam(model.parameters())
criterion = nn.CrossEntropyLoss()

# 训练循环
for epoch in range(10):
    for X, y in dataloader:
        optimizer.zero_grad()
        output = model(X)
        loss = criterion(output, y)
        loss.backward()
        optimizer.step()
'''
print("\\nPyTorch 示例:")
print(pytorch_example)

\`\`\`

## 六、爬虫进阶

\`\`\`python
# Scrapy 示例
scrapy_example = '''
import scrapy

class QuoteSpider(scrapy.Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
            }
        # 自动翻页
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)

# 运行: scrapy crawl quotes
'''
print("Scrapy 示例:")
print(scrapy_example)

# WHY: Scrapy 提供完整爬虫工程化能力：调度、管道、中间件、并发

\`\`\`

## 七、GUI 桌面开发

\`\`\`python
# Tkinter 示例（标准库）
tkinter_example = '''
import tkinter as tk
from tkinter import messagebox

def on_click():
    messagebox.showinfo("提示", f"你好, {entry.get()}")

root = tk.Tk()
root.title("我的程序")
root.geometry("300x200")

tk.Label(root, text="姓名:").pack(pady=5)
entry = tk.Entry(root)
entry.pack(pady=5)

tk.Button(root, text="打招呼", command=on_click).pack(pady=20)

root.mainloop()
'''
print("Tkinter 示例:")
print(tkinter_example)

# PyQt 示例（概念）
pyqt_example = '''
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QWidget

app = QApplication([])
window = QMainWindow()
window.setWindowTitle("PyQt 应用")

central = QWidget()
layout = QVBoxLayout()
layout.addWidget(QLabel("Hello PyQt"))
central.setLayout(layout)
window.setCentralWidget(central)

window.show()
app.exec()
'''
print("\\nPyQt 示例:")
print(pyqt_example)

\`\`\`

## 八、DevOps 与自动化

\`\`\`python
# Ansible 概念
print("""
=== Ansible 示例 ===
# playbook.yml
- hosts: webservers
  tasks:
    - name: 安装 nginx
      apt: name=nginx state=present
    - name: 启动 nginx
      service: name=nginx state=started enabled=yes
    - name: 部署配置
      copy: src=nginx.conf dest=/etc/nginx/nginx.conf
      notify: restart nginx
  handlers:
    - name: restart nginx
      service: name=nginx state=restarted
""")

# Docker SDK 示例
docker_example = '''
import docker

client = docker.from_env()
# 运行容器
container = client.containers.run("nginx", ports={"80/tcp": 8080}, detach=True)
# 列出容器
for c in client.containers.list():
    print(c.name, c.status)
'''
print("Docker SDK 示例:")
print(docker_example)

\`\`\`

## 九、学习资源

\`\`\`python
print("""
=== 推荐学习资源 ===

📚 经典书籍
  - 《流畅的 Python》Fluent Python - Luciano Ramalho
    Python 进阶必读，深入语言特性
  - 《Effective Python》- Brett Slatkin
    90+ 条最佳实践
  - 《Python Cookbook》- David Beazley
    实战技巧合集
  - 《高性能 Python》- Micha Gorelick
    性能优化指南
  - 《Python 设计模式》- Wessel Badenhorst
    设计模式 Python 实现

🌐 在线资源
  - 官方文档: https://docs.python.org/
  - Real Python: https://realpython.com/
  - PyPI: https://pypi.org/
  - Python Weekly: 周报订阅
  - Talk Python To Me: 播客

🎬 视频课程
  - YouTube: Corey Schafer, Sentdex
  - Coursera: Python for Everybody
  - B 站: 各类 Python 教程

💼 实战平台
  - LeetCode: 算法练习
  - HackerRank: 编程挑战
  - Kaggle: 数据科学竞赛
  - GitHub: 开源项目贡献

👥 社区
  - Python 官方论坛: discuss.python.org
  - Reddit: r/Python
  - Stack Overflow: 问答
  - PyCon: 年度大会
  - 本地 Python 用户组
""")

\`\`\`

## 十、持续学习的建议

\`\`\`python
print("""
=== 持续学习的建议 ===

1. 📖 读优秀的源码
   - 标准库源码是最佳教材
   - 读 requests、flask 等知名项目
   - 学习他人的设计思路

2. 🛠️ 做真实项目
   - 解决自己的问题
   - 参与开源项目
   - 在工作中应用新知识

3. 📝 写博客/笔记
   - 教是最好的学
   - 总结加深理解
   - 建立个人品牌

4. 🤝 加入社区
   - 提问也回答
   - 参加线下活动
   - 关注核心开发者

5. 🔄 跟踪演进
   - 阅读 PEP 提案
   - 关注 What's New in Python
   - 尝试新版本特性

6. 🎯 专注方向
   - 选一个领域深入
   - Web / 数据 / AI / 运维
   - 避免浅尝辄止

7. ⚖️ 平衡深度与广度
   - T 字型人才
   - 一门精通 + 多门了解
   - 跨界融合创新

8. 🧪 保持好奇
   - 多问为什么
   - 动手实验
   - 不畏惧底层
""")

\`\`\`

## 十一、Python 之禅

\`\`\`python
# PEP 20: The Zen of Python
import this

print("\\n=== Python 之禅（核心要点）===")
print("""
优美胜于丑陋（Beautiful is better than ugly）
明确胜于隐晦（Explicit is better than implicit）
简单胜于复杂（Simple is better than complex）
复杂胜于繁乱（Complex is better than complicated）
扁平胜于嵌套（Flat is better than nested）
稀疏胜于密集（Sparse is better than dense）
可读性很重要（Readability counts）

实用胜于纯粹（Practicality beats purity）
错误不应被静默忽略（Errors should never pass silently）
除非明确静默（Unless explicitly silenced）
现在好过从不（Now is better than never）
虽然从不常比"现在"更好（Although never is often better than *right* now）

如果实现难于解释，那它是个坏想法
如果实现易于解释，那它可能是好想法
命名空间是个绝妙的主张，我们应多加利用
""")

\`\`\`

## 十二、最后的代码

\`\`\`python
import sys
from datetime import datetime


def farewell():
    """临别赠言"""
    print("=" * 50)
    print("🐍 Python 从入门到精通大全 · 终 🐍")
    print("=" * 50)
    print()
    print(f"完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Python 版本: {sys.version.split()[0]}")
    print()
    print("📖 你已经完成了 82 章的学习")
    print("🌟 但这只是 Python 旅程的开始")
    print()
    print("💡 记住：")
    print("   - 代码是写给人读的，顺便让机器执行")
    print("   - 简单优于复杂，明确优于隐晦")
    print("   - 实践出真知，动手才能掌握")
    print("   - 持续学习，永不停步")
    print()
    print("🚀 接下来：")
    print("   1. 选一个方向深入")
    print("   2. 做一个完整项目")
    print("   3. 参与开源社区")
    print("   4. 分享你的知识")
    print()
    print("📨 与作者联系：")
    print("   - 遇到问题：Stack Overflow")
    print("   - 交流学习：Reddit r/Python")
    print("   - 跟进动态：Python 官方博客")
    print()
    print("=" * 50)
    print("感谢你陪伴这本书到最后一页")
    print("愿 Python 陪你写出优雅的代码")
    print("愿编程带给你创造的快乐")
    print()
    print("Happy Coding! 🎉")
    print("=" * 50)


farewell()

\`\`\`

## 小结

本章是全书的总结：

- **学习回顾**：82 章覆盖 Python 全栈知识
- **生态全景**：Web、数据科学、AI、爬虫、GUI、DevOps
- **框架对比**：Django/Flask/FastAPI 等选型
- **进阶方向**：每个领域都有广阔空间
- **学习资源**：书籍、在线、视频、社区
- **持续学习**：读源码、做项目、写博客、入社区
- **Python 之禅**：优雅、明确、简单

学习编程是一场马拉松，不是短跑。这本书只是一个起点，真正的成长来自于持续的实践和探索。

愿你写出优雅的代码，享受编程的乐趣。Python 的世界很大，欢迎深入探索！

**感谢你阅读本书。再见！** 🐍✨
`
  }
];

export { chapters };
