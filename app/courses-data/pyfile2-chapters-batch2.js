// =============================================================
// Python 文件管理教程（pyfile2）—— 第二批章节
// -------------------------------------------------------------
// 文件读写详解（5-9章）
//   第 5 章：open() 函数详解（最常用函数）
//   第 6 章：文本模式 vs 二进制模式
//   第 7 章：with 语句：自动关闭文件
//   第 8 章：编码问题：UTF-8、GBK 怎么选
//   第 9 章：大文件读取：分块读、按行读
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：open() 函数详解
  // =========================================================
  {
    id: "pf-05",
    group: "文件读写详解",
    icon: "🔓",
    title: "open() 函数详解",
    content: `## 一、open() 是文件操作的"大门"

所有文件读写都从 \`open()\` 开始。理解它的参数，就理解了 80% 的文件操作。

\`\`\`python
open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None)
\`\`\`

## 二、9 种模式

| 模式 | 含义 | 文件不存在 | 写入位置 | 是否清空 |
|------|------|------------|----------|----------|
| \`'r'\` | 读（默认） | 报错 | - | - |
| \`'w'\` | 写 | 创建 | 覆盖原内容 | ✅ |
| \`'a'\` | 追加 | 创建 | 文件末尾 | ❌ |
| \`'x'\` | 排他创建 | 报错 | - | - |
| \`'r+'\` | 读写 | 报错 | 覆盖 | ✅ |
| \`'w+'\` | 读写 | 创建 | 覆盖 | ✅ |
| \`'a+'\` | 读写追加 | 创建 | 末尾 | ❌ |
| \`'rb'\` | 二进制读 | 报错 | - | - |
| \`'wb'\` | 二进制写 | 创建 | 覆盖 | ✅ |

**记住 3 个就够用 80% 场景**：
- \`'r'\`：读
- \`'w'\`：写（覆盖）
- \`'a'\`：追加

## 三、encoding 参数：必须显式指定

\`\`\`python
# ❌ 不指定 encoding：依赖操作系统默认
open("a.txt")  # Windows 中文系统默认 GBK，Mac/Linux 默认 UTF-8

# ✅ 永远显式指定
open("a.txt", encoding="utf-8")
\`\`\`

**为什么？** 同一个文件，在中文 Windows 上能读，在 Linux 上可能乱码。

## 四、buffering：缓冲区大小

- \`-1\`（默认）：系统决定
- \`0\`：无缓冲（仅二进制模式）
- \`1\`：行缓冲（仅文本模式）
- \`>1\`：指定字节数

日常开发不用改，用默认就行。

## 五、errors：出错怎么办

| 值 | 行为 |
|----|------|
| \`'strict'\`（默认） | 报错 \`UnicodeDecodeError\` |
| \`'ignore'\` | 跳过错误字符 |
| \`'replace'\` | 用 \`?\` 替换 |
| \`'backslashreplace'\` | 用 \\\\xNN 显示 |

\`\`\`python
# 遇到非法字符不崩
open("a.txt", encoding="utf-8", errors="replace")
\`\`\`

## 六、newline：换行符处理

跨平台文件最容易踩的坑之一：

| 平台 | 文件里的换行符 |
|------|----------------|
| Windows | \`\\r\\n\` |
| Unix/macOS | \`\\n\` |

- \`newline=None\`（默认）：自动转换（读时 \`\\r\\n\`→\`\\n\`，写时反向）
- \`newline=''\`：不转换，原样
- \`newline='\\n'\`：只认 \`\\n\`

**建议**：默认就好，但二进制模式必须用 \`newline=''\`

## 七、open() 返回的是 file 对象

\`\`\`python
f = open("a.txt", "r", encoding="utf-8")
print(type(f))  # <class '_io.TextIOWrapper'>

# 文本模式下常用方法
f.read()       # 读全部
f.readline()   # 读一行
f.readlines()  # 读所有行到列表
f.write("hi")  # 写
f.close()      # 关闭

# 必须 close() 释放资源！
\`\`\`

## 八、本章 demo
下面 demo 把所有模式都跑一遍。
`,
    code: `"""
第五章 demo：open() 函数的 9 种模式
演示：
  1. r / w / a 三种基本模式
  2. r+ / w+ / a+ 读写模式
  3. x 排他创建
  4. encoding 的重要性
  5. errors 处理坏字符
  6. file 对象的方法
"""

import os
import tempfile
from pathlib import Path


def demo_basic_modes():
    print("=== 基础模式：r / w / a ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_"))

    # 'w'：写（覆盖）
    p1 = tmp / "demo_w.txt"
    p1.write_text("第一行\\n", encoding="utf-8")
    with p1.open("w", encoding="utf-8") as f:  # 再次 'w' 写入
        f.write("新内容\\n")
    print(f"  'w' 写入后: {p1.read_text(encoding='utf-8').strip()!r}")

    # 'a'：追加
    p2 = tmp / "demo_a.txt"
    p2.write_text("第一行\\n", encoding="utf-8")
    with p2.open("a", encoding="utf-8") as f:
        f.write("第二行\\n")
    print(f"  'a' 追加后: {p2.read_text(encoding='utf-8').strip()!r}")

    # 'r'：读
    p3 = tmp / "demo_r.txt"
    p3.write_text("hello\\nworld\\n", encoding="utf-8")
    with p3.open("r", encoding="utf-8") as f:
        content = f.read()
    print(f"  'r' 读取: {content.strip()!r}\\n")


def demo_readwrite_modes():
    print("=== 读写模式：r+ / w+ / a+ ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_rw_"))
    p = tmp / "rw.txt"
    p.write_text("原始内容\\n", encoding="utf-8")

    # r+：可读可写，但写会覆盖
    with p.open("r+", encoding="utf-8") as f:
        f.write("覆盖")  # 写入指针从 0 开始
    print(f"  r+ 后: {p.read_text(encoding='utf-8').strip()!r}")

    # w+：清空再写
    with p.open("w+", encoding="utf-8") as f:
        f.write("全新\\n")
        f.seek(0)  # 指针回到开头才能读
        print(f"  w+ 写后读: {f.read().strip()!r}")

    # a+：追加写 + 读
    with p.open("a+", encoding="utf-8") as f:
        f.write("追加\\n")
        f.seek(0)
        print(f"  a+ 写后读: {f.read().strip()!r}")
    print()


def demo_x_mode():
    print("=== 'x' 排他创建 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_x_"))
    p = tmp / "new.txt"

    # 文件不存在 → 创建成功
    with p.open("x", encoding="utf-8") as f:
        f.write("首次\\n")
    print(f"  'x' 首次创建: {p.read_text(encoding='utf-8').strip()!r}")

    # 文件已存在 → 报错
    try:
        with p.open("x", encoding="utf-8") as f:
            f.write("二次\\n")
    except FileExistsError as e:
        print(f"  'x' 二次创建报错: {e}\\n")


def demo_encoding_matters():
    print("=== encoding 的重要性 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_enc_"))
    p = tmp / "chinese.txt"

    # 用 UTF-8 写中文
    with p.open("w", encoding="utf-8") as f:
        f.write("你好，世界\\n")

    # 用 UTF-8 读 → OK
    with p.open("r", encoding="utf-8") as f:
        print(f"  UTF-8 读: {f.read().strip()!r}")

    # 用 GBK 读 → 乱码或报错
    try:
        with p.open("r", encoding="gbk") as f:
            print(f"  GBK 读: {f.read().strip()!r}")
    except UnicodeDecodeError as e:
        print(f"  GBK 读 UTF-8 文件: 报错 {e!r}\\n")


def demo_errors_param():
    print("=== errors 参数 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_err_"))
    p = tmp / "bad.txt"
    # 写一个含非法 UTF-8 字符的文件
    p.write_bytes(b"valid \\xff\\xfe invalid utf-8")

    # 默认 strict：报错
    try:
        with p.open("r", encoding="utf-8") as f:
            f.read()
    except UnicodeDecodeError as e:
        print(f"  strict: 报错 {type(e).__name__}")

    # ignore：跳过
    with p.open("r", encoding="utf-8", errors="ignore") as f:
        print(f"  ignore: {f.read()!r}")

    # replace：用 ? 替换
    with p.open("r", encoding="utf-8", errors="replace") as f:
        print(f"  replace: {f.read()!r}\\n")


def demo_file_object_methods():
    print("=== file 对象的方法 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf05_meth_"))
    p = tmp / "methods.txt"
    p.write_text("Line 1\\nLine 2\\nLine 3\\n", encoding="utf-8")

    with p.open("r", encoding="utf-8") as f:
        print(f"  read(): {f.read()!r}")
        f.seek(0)
        print(f"  readline(): {f.readline()!r}")
        f.seek(0)
        print(f"  readlines(): {f.readlines()!r}")

    with p.open("r", encoding="utf-8") as f:
        # 迭代文件对象（最节省内存）
        print(f"  for line in f:")
        for i, line in enumerate(f, 1):
            print(f"    {i}: {line.strip()!r}")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第五章 demo")
    print("=" * 50 + "\\n")

    demo_basic_modes()
    demo_readwrite_modes()
    demo_x_mode()
    demo_encoding_matters()
    demo_errors_param()
    demo_file_object_methods()

    print("=" * 50)
    print("总结：")
    print("• 3 个最常用模式: 'r' 读 / 'w' 写 / 'a' 追加")
    print("• 永远显式指定 encoding='utf-8'")
    print("• 'x' 排他创建，文件存在就报错（防止覆盖）")
    print("• errors='replace' 防止乱码崩溃")
    print("• 用 for line in f 迭代文件最省内存")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第六章：文本模式 vs 二进制模式
  // =========================================================
  {
    id: "pf-06",
    group: "文件读写详解",
    icon: "📝",
    title: "文本模式 vs 二进制模式",
    content: `## 一、两种模式的区别

| 维度 | 文本模式（\`'t'\`） | 二进制模式（\`'b'\`） |
|------|-------------------|---------------------|
| 读出来是 | \`str\` | \`bytes\` |
| 写进去是 | \`str\` | \`bytes\` |
| 编码转换 | 自动（按 encoding） | 不做 |
| 换行符转换 | 自动（按 newline） | 不做 |
| 必须指定 encoding | 推荐 | 不行 |
| 适用 | 文本文件（.txt、.py、.json、.csv） | 图片、音频、视频、PDF |

**默认就是文本模式**——\`open("a.txt", "r")\` 等价于 \`open("a.txt", "rt")\`。

## 二、什么时候用二进制模式？

1. **非文本文件**（图片、音频、视频、PDF）
2. **网络传输**（socket 收发的都是 bytes）
3. **加密、压缩**（\`.gz\`、\`.zip\`、\`.png\`）
4. **跨平台一致性**（不想要自动换行转换）

\`\`\`python
# 读图片（二进制）
with open("photo.jpg", "rb") as f:
    data = f.read()  # bytes 类型

# 写图片（二进制）
with open("copy.jpg", "wb") as f:
    f.write(data)

# 网络数据
sock.send(b"hello")
\`\`\`

## 三、二进制模式不能指定 encoding

\`\`\`python
# ❌ 报错
open("a.jpg", "rb", encoding="utf-8")  # ValueError

# ✅ 二进制模式不写 encoding
open("a.jpg", "rb")
\`\`\`

## 四、文本模式自动换行转换

读文件时：
- 文件里 \`\\r\\n\` → Python 看到 \`\\n\`

写文件时：
- Python 写 \`\\n\` → 文件里实际是 \`os.linesep\`（Windows 是 \`\\r\\n\`）

如果想"所见即所得"，用二进制模式：

\`\`\`python
# 看文件真实换行符
with open("a.txt", "rb") as f:
    raw = f.read()
print(repr(raw))  # b'line1\\r\\nline2\\r\\n'
\`\`\`

## 五、str ↔ bytes 互转

\`\`\`python
# str → bytes（编码）
s = "你好"
b = s.encode("utf-8")  # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'

# bytes → str（解码）
s2 = b.decode("utf-8")  # '你好'
\`\`\`

## 六、判断文件是文本还是二进制

经验法则：
- 文件名后缀是 \`.txt .py .json .csv .md .html .xml .yaml\` → 文本
- 文件名后缀是 \`.jpg .png .gif .mp3 .mp4 .zip .pdf\` → 二进制
- 不知道？\`head\` 命令看：可读就是文本，否则二进制

## 七、本章 demo
下面 demo 对比文本和二进制模式。
`,
    code: `"""
第六章 demo：文本模式 vs 二进制模式
演示：
  1. 文本模式读写
  2. 二进制模式读写
  3. 换行符的自动转换
  4. 复制图片（用二进制）
  5. str ↔ bytes 转换
"""

import os
import tempfile
from pathlib import Path


def demo_text_mode():
    print("=== 文本模式 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf06_t_"))
    p = tmp / "text.txt"

    # 写
    with p.open("w", encoding="utf-8") as f:
        f.write("Hello\\n世界\\n")

    # 读出来是 str
    with p.open("r", encoding="utf-8") as f:
        content = f.read()
    print(f"  类型: {type(content).__name__}")
    print(f"  内容: {content!r}\\n")


def demo_binary_mode():
    print("=== 二进制模式 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf06_b_"))
    p = tmp / "data.bin"

    # 写（注意是 bytes）
    with p.open("wb") as f:
        f.write(b"Hello\\n\\xe4\\xb8\\x96\\xe7\\x95\\x8c\\n")

    # 读出来是 bytes
    with p.open("rb") as f:
        content = f.read()
    print(f"  类型: {type(content).__name__}")
    print(f"  内容: {content!r}\\n")


def demo_newline_conversion():
    print("=== 换行符的自动转换 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf06_nl_"))
    p = tmp / "nl.txt"

    # 用二进制写 \\r\\n
    with p.open("wb") as f:
        f.write(b"line1\\r\\nline2\\r\\n")

    # 文本模式读：自动转 \\n
    with p.open("r", encoding="utf-8") as f:
        text_content = f.read()
    print(f"  文本模式读: {text_content!r}（\\\\r\\\\n → \\\\n）")

    # 二进制模式读：原样
    with p.open("rb") as f:
        bin_content = f.read()
    print(f"  二进制模式读: {bin_content!r}（原样）\\n")


def demo_copy_image():
    print('=== 复制"伪图片"（用二进制） ===\\n')
    tmp = Path(tempfile.mkdtemp(prefix="pf06_img_"))
    src = tmp / "src.png"
    dst = tmp / "dst.png"

    # 写一些伪 PNG 头
    src.write_bytes(b"\\x89PNG\\r\\n\\x1a\\n" + b"\\x00" * 100)

    # 用二进制读 + 写
    with src.open("rb") as f_in:
        data = f_in.read()
    with dst.open("wb") as f_out:
        f_out.write(data)

    print(f"  源文件大小: {src.stat().st_size}")
    print(f"  目标文件大小: {dst.stat().st_size}")
    print(f"  内容一致: {src.read_bytes() == dst.read_bytes()}\\n")


def demo_str_bytes_convert():
    print("=== str ↔ bytes 转换 ===\\n")
    s = "你好，Python"
    print(f"  原文: {s!r}（{type(s).__name__}）")

    # 编码
    b_utf8 = s.encode("utf-8")
    print(f"  UTF-8 编码: {b_utf8!r}")
    print(f"    字节数: {len(b_utf8)}")

    b_gbk = s.encode("gbk")
    print(f"  GBK 编码: {b_gbk!r}")
    print(f"    字节数: {len(b_gbk)}")

    # 解码
    print(f"  UTF-8 解码: {b_utf8.decode('utf-8')!r}")
    print(f"  GBK 解码: {b_gbk.decode('gbk')!r}\\n")


def demo_size_difference():
    print("=== 文本/二进制大小对比 ===\\n")
    s = "你好世界"
    print(f"  str 长度: {len(s)} 字符")
    print(f"  UTF-8 bytes 长度: {len(s.encode('utf-8'))} 字节")
    print(f"  GBK bytes 长度: {len(s.encode('gbk'))} 字节")
    print(f"  GB2312 bytes 长度: {len(s.encode('gb2312'))} 字节")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第六章 demo")
    print("=" * 50 + "\\n")

    demo_text_mode()
    demo_binary_mode()
    demo_newline_conversion()
    demo_copy_image()
    demo_str_bytes_convert()
    demo_size_difference()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 文本模式: 读 str，写 str，自动处理编码和换行")
    print("• 二进制模式: 读 bytes，写 bytes，'所见即所得'")
    print("• 图片/音频/PDF/zip → 用二进制模式")
    print("• 文本/二进制不能混用 encoding 参数")
    print("• 跨平台保持原样用二进制模式")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第七章：with 语句：自动关闭文件
  // =========================================================
  {
    id: "pf-07",
    group: "文件读写详解",
    icon: "🤝",
    title: "with 语句：自动关闭文件",
    content: `## 一、为什么需要 with？

文件操作后必须 \`close()\`，否则：
- 文件句柄泄漏（开太多文件会耗尽）
- 缓冲区的数据可能没写盘

\`\`\`python
# ❌ 不用 with
f = open("a.txt", "w")
f.write("hi")
# 如果中间报错，close() 不会执行
f.close()
\`\`\`

## 二、with 的魔法

\`\`\`python
# ✅ 用 with
with open("a.txt", "w", encoding="utf-8") as f:
    f.write("hi")
# 离开 with 块自动 f.close()
\`\`\`

**原理**：with 用了"上下文管理器协议"（\`__enter__\` / \`__exit__\`）。文件对象本身实现了这个协议。

## 三、with 的好处

1. **自动关闭**：即使中间报错也保证关闭
2. **代码更短**：不用写 \`f.close()\`
3. **更安全**：避免资源泄漏

## 四、try-finally 也能实现

\`\`\`python
# 等价写法
f = open("a.txt", "w", encoding="utf-8")
try:
    f.write("hi")
finally:
    f.close()
\`\`\`

但 \`with\` 更简洁，所以**永远用 with**。

## 五、多个文件同时打开

\`\`\`python
# 一次打开多个
with open("in.txt") as f_in, open("out.txt", "w") as f_out:
    f_out.write(f_in.read())
\`\`\`

Python 3.10+ 还可以用括号：

\`\`\`python
with (
    open("in.txt") as f_in,
    open("out.txt", "w") as f_out,
):
    f_out.write(f_in.read())
\`\`\`

## 六、自己写支持 with 的对象

\`\`\`python
class MyFile:
    def __enter__(self):
        print("进入 with")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出 with")
        return False  # 不吞异常

with MyFile() as f:
    print("使用中")
\`\`\`

输出：
\`\`\`
进入 with
使用中
退出 with
\`\`\`

## 七、contextlib 简化自定义

\`\`\`python
from contextlib import contextmanager

@contextmanager
def my_open(path, mode):
    f = open(path, mode)
    try:
        yield f
    finally:
        f.close()

with my_open("a.txt", "w") as f:
    f.write("hi")
\`\`\`

## 八、本章 demo
下面 demo 用 with 做实际的文件复制，并展示错误处理。
`,
    code: `"""
第七章 demo：with 语句的威力
演示：
  1. 不带 with 的风险
  2. with 自动关闭
  3. with 中出错也安全
  4. 一次打开多个文件
  5. 写自己的 with 兼容对象
"""

import os
import tempfile
from pathlib import Path
from contextlib import contextmanager


def demo_without_with_is_dangerous():
    print("=== 不带 with 的风险 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf07_"))

    p = tmp / "danger.txt"
    try:
        f = open(p, "w", encoding="utf-8")
        # 模拟中间报错
        raise RuntimeError("模拟出错")
        f.write("永远到不了")  # noqa
    except RuntimeError as e:
        print(f"  捕获: {e}")
    # 关键：f 没关闭！文件句柄泄漏
    print(f"  文件实际写入: {p.read_text(encoding='utf-8') if p.exists() else '未创建'!r}")
    print(f"  ⚠️  句柄泄漏风险\\n")


def demo_with_auto_close():
    print("=== with 自动关闭 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf07_with_"))
    p = tmp / "safe.txt"

    try:
        with p.open("w", encoding="utf-8") as f:
            f.write("写入成功\\n")
            # 模拟中间出错
            raise RuntimeError("报错")
    except RuntimeError as e:
        print(f"  捕获: {e}")
    # 文件已安全关闭
    print(f"  文件内容: {p.read_text(encoding='utf-8').strip()!r}")
    print(f"  ✅ 数据已写入并自动 close()\\n")


def demo_with_multiple_files():
    print("=== 一次打开多个文件 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf07_multi_"))
    src = tmp / "source.txt"
    dst = tmp / "dest.txt"
    src.write_text("line1\\nline2\\nline3\\n", encoding="utf-8")

    # 同时打开两个
    with src.open("r", encoding="utf-8") as fin, \\
         dst.open("w", encoding="utf-8") as fout:
        for line in fin:
            fout.write(f"[copy] {line}")

    print(f"  目标文件内容:")
    print(f"  {dst.read_text(encoding='utf-8')}")


def demo_with_in_function():
    print("=== 函数中用 with ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf07_func_"))
    p = tmp / "func.txt"

    def write_lines(path, lines):
        # 函数退出时 with 块结束 → 文件关闭
        with path.open("w", encoding="utf-8") as f:
            for line in lines:
                f.write(line + "\\n")

    write_lines(p, ["第一行", "第二行", "第三行"])
    print(f"  函数写入结果: {p.read_text(encoding='utf-8').strip()!r}\\n")


def demo_custom_context_manager():
    print("=== 自定义 with 兼容对象 ===\\n")

    class Timer:
        def __enter__(self):
            import time
            self.start = time.time()
            print("  [Timer] 开始计时")
            return self
        def __exit__(self, exc_type, exc_val, exc_tb):
            import time
            self.elapsed = time.time() - self.start
            print(f"  [Timer] 结束: 耗时 {self.elapsed*1000:.2f} ms")
            return False

    with Timer() as t:
        # 模拟一些操作
        sum(range(100000))
    print()


def demo_contextlib_decorator():
    print("=== contextlib 简化版 ===\\n")

    @contextmanager
    def tag(name):
        print(f"  [{name}] 进入")
        yield
        print(f"  [{name}] 离开")

    with tag("A"):
        print("  业务逻辑 1")
    with tag("B"):
        print("  业务逻辑 2")
    print()


def demo_practical_copy():
    print("=== 实战：文件复制 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf07_copy_"))
    src = tmp / "original.txt"
    dst = tmp / "backup.txt"
    src.write_text("重要数据\\n不要丢失\\n", encoding="utf-8")

    # with 块保证安全复制
    with src.open("rb") as fin, dst.open("wb") as fout:
        chunk_size = 8192
        while True:
            chunk = fin.read(chunk_size)
            if not chunk:
                break
            fout.write(chunk)

    print(f"  源: {src.name} ({src.stat().st_size} bytes)")
    print(f"  备: {dst.name} ({dst.stat().st_size} bytes)")
    print(f"  一致: {src.read_bytes() == dst.read_bytes()}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第七章 demo")
    print("=" * 50 + "\\n")

    demo_without_with_is_dangerous()
    demo_with_auto_close()
    demo_with_multiple_files()
    demo_with_in_function()
    demo_custom_context_manager()
    demo_contextlib_decorator()
    demo_practical_copy()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 永远用 with open() as f")
    print("• with 保证文件一定被关闭")
    print("• 可以同时打开多个文件（逗号分隔）")
    print("• 自己写对象实现 __enter__/__exit__ 也支持 with")
    print("• @contextmanager 装饰器写起来更简单")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第八章：编码问题：UTF-8、GBK 怎么选
  // =========================================================
  {
    id: "pf-08",
    group: "文件读写详解",
    icon: "🔤",
    title: "编码问题：UTF-8、GBK 怎么选",
    content: `## 一、什么是编码？

字符（"你"）和字节（\`\\xe4\\xbd\\xa0\`）之间的映射规则就是"编码"。

| 编码 | 特点 | 适用 |
|------|------|------|
| **UTF-8** | 变长 1-4 字节，兼容 ASCII | **国际通用，推荐** |
| **GBK** | 中文 2 字节 | 中国大陆老系统 |
| **GB2312** | 中文 2 字节，字符集小 | 极老系统 |
| **UTF-16** | 2 或 4 字节 | Windows 内部、Java 内部 |
| **ASCII** | 1 字节，只有英文 | 英文文档 |
| **Latin-1** | 1 字节，西欧语言 | 西欧 |

**结论**：**新项目一律用 UTF-8**。

## 二、Python 3 字符串默认是 UTF-8

Python 3 源文件默认 UTF-8，字符串内部是 Unicode。所以：

\`\`\`python
s = "你好"
print(len(s))  # 2（字符数）
print(len(s.encode("utf-8")))  # 6（字节数）
print(len(s.encode("gbk")))  # 4
\`\`\`

## 三、常见编码错误

### 1. UnicodeDecodeError：解码失败

\`\`\`
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb9 in position 0: invalid start byte
\`\`\`

原因：用 UTF-8 解码 GBK 字节。

### 2. UnicodeEncodeError：编码失败

\`\`\`
UnicodeEncodeError: 'ascii' codec can't encode character '\\u4e2d' in position 0: ordinal not in range(128)
\`\`\`

原因：用 ASCII 编码中文。

## 四、读取不知道编码的文件

\`\`\`python
# 1. 试错法
for enc in ["utf-8", "gbk", "gb2312", "utf-16"]:
    try:
        with open("a.txt", encoding=enc) as f:
            content = f.read()
        print(f"用 {enc} 读取成功")
        break
    except UnicodeDecodeError:
        continue

# 2. 用 chardet 自动检测（需 pip install chardet）
import chardet
raw = open("a.txt", "rb").read()
detected = chardet.detect(raw)
print(detected)  # {'encoding': 'GB2312', 'confidence': 0.99, ...}
\`\`\`

## 五、写出文件指定编码

\`\`\`python
# 默认 UTF-8
with open("a.txt", "w", encoding="utf-8") as f:
    f.write("你好")

# 兼容老系统：GBK
with open("a.txt", "w", encoding="gbk") as f:
    f.write("你好")
\`\`\`

## 六、Windows 上的坑

Windows 中文版默认编码是 GBK（不是 UTF-8），所以：

\`\`\`python
# 在 Windows 上跑：
with open("a.txt") as f:  # 实际用 GBK 解码
    f.read()
\`\`\`

如果文件是 UTF-8 写的，会乱码。**永远显式指定 encoding**。

## 七、BOM 头

UTF-8 文件有时会有 BOM（\`\\xef\\xbb\\xbf\`），Windows 记事本保存 UTF-8 时会加。

\`\`\`python
# 读取带 BOM 的文件
with open("a.txt", encoding="utf-8-sig") as f:  # 自动去 BOM
    content = f.read()
\`\`\`

\`utf-8-sig\` = UTF-8 with signature，自动处理 BOM。

## 八、本章 demo
下面 demo 演示编码错误的处理。
`,
    code: `"""
第八章 demo：编码问题
演示：
  1. 不同编码的字节数
  2. UnicodeDecodeError 触发与处理
  3. 自动检测编码
  4. utf-8-sig 处理 BOM
  5. 试错法读未知编码
"""

import os
import tempfile
from pathlib import Path


def demo_encoding_sizes():
    print("=== 不同编码的字节数 ===\\n")
    s = "你好，Python 文件管理"
    print(f"  字符串: {s!r}（{len(s)} 字符）")
    for enc in ["utf-8", "gbk", "gb2312", "utf-16", "ascii"]:
        try:
            b = s.encode(enc)
            print(f"  {enc:10s} → {len(b):3d} bytes")
        except UnicodeEncodeError as e:
            print(f"  {enc:10s} → 报错: {e!r}")
    print()


def demo_decode_error():
    print("=== UnicodeDecodeError 触发 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf08_dec_"))
    p = tmp / "gbk.txt"
    # 用 GBK 写
    p.write_bytes("你好，世界".encode("gbk"))

    # 用 UTF-8 读 → 报错
    try:
        with p.open("r", encoding="utf-8") as f:
            f.read()
    except UnicodeDecodeError as e:
        print(f"  UTF-8 读 GBK 文件: {e!r}")

    # 用 GBK 读 → OK
    with p.open("r", encoding="gbk") as f:
        print(f"  GBK 读 GBK 文件: {f.read()!r}")
    print()


def demo_errors_handling():
    print("=== errors 参数处理 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf08_err_"))
    p = tmp / "mixed.txt"
    # 写一个含非法 UTF-8 字节的文件
    p.write_bytes(b"valid text \\xc4\\xe3" + " 乱码部分".encode("gbk"))

    for err in ["strict", "ignore", "replace"]:
        try:
            with p.open("r", encoding="utf-8", errors=err) as f:
                content = f.read()
            print(f"  errors={err:8s} → {content!r}")
        except UnicodeDecodeError as e:
            print(f"  errors={err:8s} → 报错: {e}")
    print()


def demo_utf8_sig():
    print("=== BOM 头处理（utf-8-sig） ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf08_bom_"))
    p = tmp / "bom.txt"
    # 写一个带 BOM 的 UTF-8 文件
    p.write_bytes(b"\\xef\\xbb\\xbf" + "你好".encode("utf-8"))

    # 用 utf-8 读：开头有 BOM 字符
    with p.open("r", encoding="utf-8") as f:
        c1 = f.read()
    print(f"  encoding='utf-8'    → {c1!r}")

    # 用 utf-8-sig 读：自动去 BOM
    with p.open("r", encoding="utf-8-sig") as f:
        c2 = f.read()
    print(f"  encoding='utf-8-sig'→ {c2!r}")
    print()


def demo_detect_encoding():
    print("=== 试错法检测编码 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf08_det_"))
    p = tmp / "unknown.txt"
    p.write_bytes("中国 China".encode("gbk"))

    encodings = ["utf-8", "gbk", "gb2312", "utf-16", "big5"]
    for enc in encodings:
        try:
            with p.open("r", encoding=enc) as f:
                content = f.read()
            print(f"  ✅ 用 {enc:8s} 读成功: {content!r}")
            break
        except (UnicodeDecodeError, UnicodeError):
            print(f"  ❌ {enc:8s} 失败")
    print()


def demo_safe_read():
    print("=== 安全的读法（防御式） ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf08_safe_"))
    p = tmp / "config.txt"
    p.write_text("name=张三\\nage=30\\n", encoding="utf-8")

    def safe_read(path):
        """读文件，尝试常见编码"""
        for enc in ["utf-8", "gbk", "gb2312", "latin-1"]:
            try:
                with open(path, encoding=enc) as f:
                    return f.read(), enc
            except (UnicodeDecodeError, UnicodeError):
                continue
        return None, None

    content, used_enc = safe_read(p)
    print(f"  使用编码: {used_enc}")
    print(f"  内容: {content!r}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第八章 demo")
    print("=" * 50 + "\\n")

    demo_encoding_sizes()
    demo_decode_error()
    demo_errors_handling()
    demo_utf8_sig()
    demo_detect_encoding()
    demo_safe_read()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 新项目一律用 UTF-8")
    print("• open() 永远显式指定 encoding")
    print("• 读老文件用 try/except 试错")
    print("• 写带 BOM 的文件用 encoding='utf-8-sig'")
    print("• 防御式：errors='replace' 不让坏字符崩程序")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第九章：大文件读取：分块读、按行读
  // =========================================================
  {
    id: "pf-09",
    group: "文件读写详解",
    icon: "📊",
    title: "大文件读取：分块读、按行读",
    content: `## 一、为什么不能一次 read()？

\`\`\`python
# ❌ 1GB 文件
with open("big.log", "r") as f:
    data = f.read()  # 内存爆掉！1GB 全加载到内存
\`\`\`

如果文件有几 GB，\`read()\` 会让程序崩溃或卡死。

## 二、3 种流式读取方式

### 1. 迭代文件对象（推荐）

\`\`\`python
# ✅ 一次只读一行到内存
with open("big.log") as f:
    for line in f:  # 内部用 buffer
        process(line)
\`\`\`

### 2. 按块读

\`\`\`python
# ✅ 一次读 8KB
with open("big.log", "rb") as f:
    while True:
        chunk = f.read(8192)  # 8KB
        if not chunk:
            break
        process(chunk)
\`\`\`

### 3. 按行读（readlines 太占内存）

\`\`\`python
# ⚠️  readlines 一次性加载所有行
with open("big.log") as f:
    lines = f.readlines()  # 大文件别用

# ✅  readline 一次读一行
with open("big.log") as f:
    while True:
        line = f.readline()
        if not line:
            break
        process(line)
\`\`\`

## 三、二进制 vs 文本模式的流式读

| 模式 | 边界 | 说明 |
|------|------|------|
| 文本模式 | \`for line in f\` | 按 \`\\n\` 切分，自动 universal newlines |
| 二进制模式 | \`f.read(8192)\` | 严格按字节数切分 |

## 四、处理 CSV/日志大文件

\`\`\`python
# 处理大日志：找错误行
with open("app.log", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if "ERROR" in line:
            print(f"第 {i} 行: {line.rstrip()}")
\`\`\`

## 五、读取进度

大文件读取时给个进度条：

\`\`\`python
import os

file_size = os.path.getsize("big.log")
read_size = 0
with open("big.log", "rb") as f:
    while True:
        chunk = f.read(8192)
        if not chunk:
            break
        read_size += len(chunk)
        pct = read_size / file_size * 100
        print(f"\\r进度: {pct:.1f}%", end="")
    print()
\`\`\`

## 六、常见场景的代码模板

### 统计行数
\`\`\`python
count = 0
with open("big.log") as f:
    for _ in f:
        count += 1
print(f"共 {count} 行")
\`\`\`

### 找最大行
\`\`\`python
max_len = 0
max_line = ""
with open("a.txt") as f:
    for line in f:
        if len(line) > max_len:
            max_len = len(line)
            max_line = line
\`\`\`

### 写大文件
\`\`\`python
with open("out.txt", "w") as f:
    for i in range(1_000_000):
        f.write(f"line {i}\\n")  # 写比 readlines 好
\`\`\`

## 七、本章 demo
下面 demo 演示各种大文件读取策略。
`,
    code: `"""
第九章 demo：大文件读取策略
演示：
  1. 一次性 read 的风险（模拟）
  2. 迭代文件对象（按行）
  3. 按块读取
  4. 进度条
  5. 性能对比
"""

import os
import time
import tempfile
from pathlib import Path


def create_big_file(path, num_lines=100_000):
    """创建一个大文件用于测试"""
    with path.open("w", encoding="utf-8") as f:
        for i in range(num_lines):
            f.write(f"Line {i:08d} - 这是测试数据\\n")
    return path.stat().st_size


def demo_iterate_file():
    print("=== 1. 迭代文件对象（最推荐） ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf09_"))
    p = tmp / "big.txt"
    size = create_big_file(p, 50_000)
    print(f"  文件大小: {size/1024:.1f} KB")

    line_count = 0
    char_count = 0
    start = time.time()
    with p.open("r", encoding="utf-8") as f:
        for line in f:  # 一次只读一行到内存
            line_count += 1
            char_count += len(line)
    elapsed = time.time() - start
    print(f"  读取 {line_count} 行, {char_count} 字符")
    print(f"  耗时: {elapsed*1000:.1f} ms")
    print(f"  ✅ 内存占用: 几乎为 0（只保留当前行）\\n")


def demo_read_chunks():
    print("=== 2. 按块读取（二进制） ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf09_c_"))
    p = tmp / "big.bin"
    # 写 1MB 伪数据
    p.write_bytes(b"x" * 1024 * 1024)
    print(f"  文件大小: {p.stat().st_size / 1024:.0f} KB")

    total = 0
    chunks = 0
    with p.open("rb") as f:
        while True:
            chunk = f.read(8192)  # 8KB 每块
            if not chunk:
                break
            total += len(chunk)
            chunks += 1
    print(f"  共读 {chunks} 块, {total} bytes")
    print(f"  ✅ 内存峰值: 8KB（不论文件多大）\\n")


def demo_progress_bar():
    print("=== 3. 进度条演示 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf09_p_"))
    p = tmp / "progress.bin"
    p.write_bytes(b"y" * 100_000)  # 100KB

    file_size = p.stat().st_size
    read_size = 0
    with p.open("rb") as f:
        while True:
            chunk = f.read(10_000)
            if not chunk:
                break
            read_size += len(chunk)
            pct = read_size / file_size * 100
            # 简单的文本进度条
            bar = "█" * int(pct // 5) + "░" * (20 - int(pct // 5))
            print(f"\\r  [{bar}] {pct:5.1f}%", end="", flush=True)
        print("\\n")


def demo_count_lines():
    print("=== 4. 性能对比：read() vs 流式 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf09_perf_"))
    p = tmp / "perf.txt"
    create_big_file(p, 100_000)
    size = p.stat().st_size
    print(f"  文件: {size/1024:.0f} KB, 100,000 行\\n")

    # 方式 1：read() 一次性
    start = time.time()
    with p.open("r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    t1 = time.time() - start
    print(f"  read().splitlines():  {t1*1000:6.1f} ms, 内存峰值: ~{size/1024:.0f} KB")

    # 方式 2：readlines()
    start = time.time()
    with p.open("r", encoding="utf-8") as f:
        lines = f.readlines()
    t2 = time.time() - start
    print(f"  readlines():         {t2*1000:6.1f} ms, 内存峰值: ~{size/1024:.0f} KB")

    # 方式 3：for line in f
    start = time.time()
    count = 0
    with p.open("r", encoding="utf-8") as f:
        for line in f:
            count += 1
    t3 = time.time() - start
    print(f"  for line in f:       {t3*1000:6.1f} ms, 内存峰值: ~1 KB")
    print(f"  ✅ 流式读取快 {t1/t3:.1f} 倍，内存占用 1/{size//1024}\\n")


def demo_find_pattern():
    print("=== 5. 实战：在日志中找错 ===\\n")
    tmp = Path(tempfile.mkdtemp(prefix="pf09_log_"))
    p = tmp / "app.log"

    # 造一个混合日志
    with p.open("w", encoding="utf-8") as f:
        f.write("[INFO] 启动\\n")
        f.write("[INFO] 用户登录: alice\\n")
        f.write("[ERROR] 数据库连接失败\\n")
        f.write("[INFO] 用户登录: bob\\n")
        f.write("[WARN] 内存使用 80%\\n")
        f.write("[ERROR] 权限不足\\n")
        f.write("[INFO] 用户登录: charlie\\n")
        f.write("[ERROR] 写入失败\\n")

    # 用流式读取找错误
    errors = []
    with p.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if "[ERROR]" in line:
                errors.append((i, line.strip()))

    print(f"  找到 {len(errors)} 个错误:")
    for lineno, line in errors:
        print(f"    第 {lineno} 行: {line}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第九章 demo")
    print("=" * 50 + "\\n")

    demo_iterate_file()
    demo_read_chunks()
    demo_progress_bar()
    demo_count_lines()
    demo_find_pattern()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 大文件绝对不要 read()")
    print("• 文本文件: for line in f（按行，内存友好）")
    print("• 二进制文件: while chunk := f.read(8192)（按块）")
    print("• 流式读取比 read() 快几倍到几十倍")
    print("• 处理大文件用 readline / 迭代 / 分块，永远不用 readlines")
    print("=" * 50)
`,
  },
];
