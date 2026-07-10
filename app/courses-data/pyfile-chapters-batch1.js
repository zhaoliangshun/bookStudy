// =============================================================
// Python 文件操作教程 - 第 1 批章节(基础读写)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyfile-open-intro",
    icon: "📂",
    title: "文件操作全景图:open 函数与文件对象",
    group: "基础读写",
    content: `# 文件操作全景图:open 函数与文件对象

## 一、引言:为什么程序需要操作文件

你写过的所有 Python 程序,只要一退出,变量、列表、字典里的数据就**全部消失**了。这是因为内存(RAM)是**易失性存储**——断电即清空。而文件存在于硬盘上,是**持久化存储**,关机重启后依然存在。

程序需要操作文件,主要有以下四大场景:

| 场景 | 例子 | 为什么必须用文件 |
|------|------|------------------|
| 数据持久化 | 用户注册信息、游戏存档 | 内存断电即失,文件可永久保存 |
| 配置管理 | \`.env\`、\`config.ini\`、\`settings.json\` | 让非程序员也能修改程序行为 |
| 日志记录 | \`app.log\`、\`error.log\` | 排查线上问题、审计追踪 |
| 数据交换 | CSV 报表、JSON API 响应、Excel 导出 | 不同系统之间传递数据 |

可以说,**不会操作文件,就写不出真正有用的程序**。Web 后端读模板、机器学习读数据集、爬虫保存结果、运维脚本读配置——每一行有用的代码背后,几乎都有文件操作。

## 二、Python 文件操作的核心:内置 open() 函数

Python 设计哲学是「内置电池」(Batteries Included),文件操作不需要任何 import,直接用内置的 \`open()\` 函数即可。这是 Python 相比 C/Java 的一个巨大优势——**简单到令人发指**。

对比一下三种语言读文件的代码量:

\`\`\`c
// C 语言:需要 FILE 指针、fopen、fgets、fclose,还要关心缓冲区大小
#include <stdio.h>
int main() {
    FILE *f = fopen("a.txt", "r");
    char buf[256];
    while (fgets(buf, sizeof(buf), f)) printf("%s", buf);
    fclose(f);
    return 0;
}
\`\`\`

\`\`\`java
// Java:需要 IOException 处理、Scanner 包装、try-with-resources
import java.io.*;
import java.util.Scanner;
public class Main {
    public static void main(String[] args) throws IOException {
        try (Scanner sc = new Scanner(new File("a.txt"))) {
            while (sc.hasNextLine()) System.out.println(sc.nextLine());
        }
    }
}
\`\`\`

\`\`\`python
# Python:三行搞定,清晰直观
with open("a.txt", encoding="utf-8") as f:
    for line in f:
        print(line, end="")
\`\`\`

## 三、open() 的完整签名

\`open()\` 函数的完整签名如下(初学者只需关注前四个参数):

\`\`\`python
open(
    file,               # 必填:文件路径(字符串)或文件描述符(整数)
    mode='r',           # 模式:读/写/追加/创建 + 文本/二进制
    buffering=-1,       # 缓冲策略:-1 表示默认,0 表示无缓冲(仅二进制),1 表示行缓冲,>1 表示缓冲区大小
    encoding=None,      # 文本模式下的编码,默认 None(用平台默认,建议显式指定 utf-8)
    errors=None,        # 编码错误处理策略:strict/ignore/replace/...
    newline=None,       # 换行符处理模式(通用换行模式)
    closefd=True,       # 是否在关闭文件时关闭底层文件描述符
    opener=None         # 自定义打开函数(高级用法,一般不用)
)
\`\`\`

参数逐个解释:

- **file**:最常见的用法是传字符串路径,如 \`"data.txt"\`、\`"/var/log/app.log"\`。也可以传整数文件描述符(由 \`os.open()\` 返回)。
- **mode**:决定「读还是写」「文本还是二进制」「追加还是覆盖」「文件不存在时怎么办」。这是最容易出错也最重要的参数。
- **buffering**:控制写入是否立即落盘。默认 \`-1\` 一般够用;写日志时如果想立即看到内容,可用 \`buffering=1\`(行缓冲)。
- **encoding**:**强烈建议永远显式写 \`encoding="utf-8"\`**。不写会用系统默认(Windows 上是 GBK,Linux 上是 UTF-8),导致同一份代码在不同机器上跑出不同结果——这是无数中文乱码 bug 的根源。
- **errors**:遇到无法解码的字节时怎么办。\`strict\`(默认)直接报错,\`ignore\` 跳过,\`replace\` 用 \`?\` 替代。
- **newline**:控制换行符的读写转换,默认 \`None\` 启用「通用换行模式」(读取时各种换行符都识别为 \`\\n\`)。
- **closefd / opener**:99% 的场景用不到,知道有这俩参数即可。

## 四、文件模式大全表

文件模式由「主模式」+「辅助字符」组合而成。下面这张表必须背熟:

| 模式 | 名称 | 文件存在时 | 文件不存在时 | 可读 | 可写 | 指针位置 |
|------|------|-----------|-------------|------|------|---------|
| \`r\`  | 只读(默认) | 打开 | **报错** | ✓ | ✗ | 开头 |
| \`r+\` | 读写 | 打开 | **报错** | ✓ | ✓ | 开头 |
| \`w\`  | 只写 | **清空** | 创建 | ✗ | ✓ | 开头 |
| \`w+\` | 写读 | **清空** | 创建 | ✓ | ✓ | 开头 |
| \`a\`  | 追加 | 打开 | 创建 | ✗ | ✓ | **末尾** |
| \`a+\` | 追加读写 | 打开 | 创建 | ✓ | ✓ | **末尾** |
| \`x\`  | 排他创建 | **报错** | 创建 | ✗ | ✓ | 开头 |
| \`x+\` | 排他创建读写 | **报错** | 创建 | ✓ | ✓ | 开头 |

辅助字符:

- \`b\`:二进制模式(如 \`rb\`、\`wb\`、\`ab\`),返回 \`bytes\` 而非 \`str\`,不做编码转换。
- \`t\`:文本模式(默认,可不写),返回 \`str\`,会做编码转换和换行符转换。
- \`+\`:同时支持读写(很少单独用,通常配合 r/w/a)。

**最容易踩的坑**:

1. \`w\` 模式会**立刻清空文件**——你以为是「打开文件准备写」,结果文件内容瞬间没了。生产环境慎用。
2. \`r\` 模式文件不存在会**直接 FileNotFoundError**——永远先 \`os.path.exists()\` 或用 \`try/except\`。
3. \`a\` 模式指针在末尾,**就算你 seek(0) 也写不到开头**——某些系统上 \`a\` 模式的所有写入都强制到末尾。

## 五、文件对象的概念

\`open()\` 返回的对象叫**文件对象**(file object),它是一个**有状态的资源**:

- 它**持有操作系统文件描述符**(一个有限的系统资源,每个进程能打开的文件数有上限,默认 1024)。
- 它**记录了当前读写位置**(文件指针,可通过 \`tell()\` 查看、\`seek()\` 移动)。
- 它**是可迭代的**(可以 \`for line in f\`),这是 Python 最优雅的设计之一。
- 它**必须被关闭**(否则会泄漏文件描述符,最终导致无法打开新文件)。

文件对象在 Python 3 中是 \`io.TextIOWrapper\`(文本模式)或 \`io.BufferedReader\`/\`io.BufferedWriter\`(二进制模式)的实例,但你不必关心具体类名,把它当作「能读能写能关的对象」即可。

## 六、文件对象的核心方法表

| 方法 | 作用 | 返回 | 备注 |
|------|------|------|------|
| \`f.read(size=-1)\` | 读取指定 size 字符/字节,不传或 -1 读全部 | str / bytes | 大文件慎用,会一次性读入内存 |
| \`f.readline()\` | 读取一行(包含末尾 \\n) | str / bytes | 读到 EOF 返回空字符串 \`""\` |
| \`f.readlines()\` | 读取所有行,返回列表 | list[str] | 大文件慎用,内存爆炸 |
| \`f.write(s)\` | 写入字符串/字节 | int(写入的字符数) | 不会自动加换行 |
| \`f.writelines(seq)\` | 批量写入序列 | None | **注意:不会自动加换行** |
| \`f.seek(offset, whence=0)\` | 移动文件指针 | int(新位置) | whence:0 开头 / 1 当前 / 2 末尾 |
| \`f.tell()\` | 返回当前指针位置 | int | 文本模式下位置是「字符数」非「字节数」 |
| \`f.close()\` | 关闭文件,释放资源 | None | 关闭后再操作会 ValueError |
| \`f.flush()\` | 把内部缓冲区刷到磁盘 | None | 不关闭文件也能让数据落盘 |
| \`f.readable()\` | 是否可读 | bool | 取决于打开模式 |
| \`f.writable()\` | 是否可写 | bool | 取决于打开模式 |
| \`f.closed\` | 是否已关闭 | bool | 属性,不是方法 |
| \`for line in f\` | 逐行迭代 | str | **最 Pythonic 的读取方式** |

## 七、文件对象的生命周期

文件对象的完整生命周期是三步:**打开 → 操作 → 关闭**。

\`\`\`text
[程序调用 open()] 
       ↓
[操作系统分配文件描述符]
       ↓
[Python 创建文件对象,持有 fd]
       ↓
[程序调用 read / write / seek 等]
       ↓
[程序调用 close()]
       ↓
[操作系统释放 fd,刷新缓冲区到磁盘]
       ↓
[文件对象不可再用]
\`\`\`

这三步必须严格按顺序,且**最后一步关闭绝对不能省**。下一章我们会用 \`with\` 语句来保证这一点,本章先用最原始的方式让你感受文件操作的全貌。

## 八、Demo 1:用 open 创建并写入第一个文件

\`\`\`python
# 用 w 模式打开文件(文件不存在会自动创建,存在会被清空!)
# 注意:encoding 必须显式指定,否则在 Windows 上会用 GBK,导致跨平台乱码
f = open("hello.txt", mode="w", encoding="utf-8")

# 调用 write 写入字符串,返回值是写入的字符数
n1 = f.write("你好,世界!\\n")   # 返回 7(6 个中文字符 + 1 个换行符)
print(f"写入了 {n1} 个字符")    # 输出:写入了 7 个字符

# 可以多次调用 write,内容会按调用顺序拼接
f.write("这是第二行\\n")
f.write("这是第三行\\n")

# 关闭文件——这一步至关重要!
# 不关闭的话,数据可能还在内存缓冲区里,没真正写到磁盘上
f.close()

# 验证文件已写入:用 r 模式重新打开读取
with open("hello.txt", encoding="utf-8") as f2:
    print(f2.read())
# 输出:
# 你好,世界!
# 这是第二行
# 这是第三行
\`\`\`

**详解**:这段代码演示了文件操作最经典的流程。

- \`mode="w"\` 表示「写模式」。如果文件已存在,**内容会被立刻清空**——所以执行前请确认你不想要旧数据了。
- \`write()\` 返回写入的字符数(注意是字符数,不是字节数;中文字符在 UTF-8 下占 3 字节,但仍算 1 个字符)。
- \`close()\` 触发两件事:把缓冲区的数据刷到磁盘,然后释放文件描述符。**忘记 close 是新手最常见的 bug**。
- 最后用 \`with\` 语句(下一章详解)读取验证,确保数据真的写进去了。

## 九、Demo 2:读取文件内容

\`\`\`python
# r 模式是默认模式,可以不写,但建议显式写出来提高可读性
# 文件不存在会抛 FileNotFoundError
try:
    f = open("hello.txt", mode="r", encoding="utf-8")
    # read() 不传参数,一次性读取整个文件内容
    content = f.read()
    print(f"文件内容长度:{len(content)} 个字符")
    print("--- 内容开始 ---")
    print(content)
    print("--- 内容结束 ---")
    f.close()
except FileNotFoundError:
    print("文件不存在!请先运行 Demo 1 创建文件")
\`\`\`

**详解**:

- \`read()\` 不传参时返回整个文件内容,**大文件慎用**——读一个 10GB 日志会让内存爆掉。
- \`encoding="utf-8"\` 必须和写入时一致,否则会乱码或报 \`UnicodeDecodeError\`。
- 用 \`try/except FileNotFoundError\` 是处理「文件可能不存在」的标准姿势。比 \`if os.path.exists()\` 更 Pythonic,因为「先检查再打开」存在 TOCTOU 竞态——检查完到打开之间文件可能被删。

## 十、Demo 3:不关闭文件的危害演示

\`\`\`python
import sys

# 故意不关闭文件,看看会发生什么
def leak_files():
    for i in range(10000):
        # 每次都打开文件但不 close
        # 这会泄漏 10000 个文件描述符
        f = open("hello.txt", encoding="utf-8")
        # 忘记写 f.close()

# 看看当前进程的文件描述符限制
import resource
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
print(f"系统允许打开的最大文件数:软限制 {soft},硬限制 {hard}")

# 如果你真的运行 leak_files(),很快就会报错:
# OSError: [Errno 24] Too many open files
# 这就是「文件描述符泄漏」——程序运行一段时间后就无法打开新文件了

# 正确做法:用 with 语句(下一章详解)
def safe_open():
    with open("hello.txt", encoding="utf-8") as f:
        return f.read()
# with 块结束时自动 close,即使中间抛异常也会 close
\`\`\`

**详解**:这段代码演示了为什么「忘记 close」是严重 bug。

- 操作系统对每个进程能打开的文件数有上限(默认 1024,可通过 \`ulimit -n\` 查看)。
- 每次调用 \`open()\` 都会占用一个描述符,**只有 close 才会释放**。
- Python 的垃圾回收器**最终**会关闭文件,但时机不确定——可能在数秒甚至数分钟后。
- 在高并发场景下,这种延迟会让程序瞬间打满文件描述符,所有 \`open()\` 都报 \`OSError: Too many open files\`。
- **结论**:永远用 \`with\` 语句,把 \`close\` 交给 Python 自动管理。

## 十一、Demo 4:seek 与 tell 操作文件指针

\`\`\`python
# 演示文件指针的概念
# 准备一个测试文件
with open("pos.txt", "w", encoding="utf-8") as f:
    f.write("ABCDEFGHIJ")   # 写入 10 个字符

# 用 r+ 模式打开(可读可写,文件必须存在)
f = open("pos.txt", "r+", encoding="utf-8")

# tell() 返回当前指针位置(初始为 0,即文件开头)
print(f"打开后位置:{f.tell()}")   # 输出:打开后位置:0

# 读取 3 个字符,指针自动前移
print(f.read(3))                  # 输出:ABC
print(f"读 3 个字符后位置:{f.tell()}")  # 输出:读 3 个字符后位置:3

# seek() 把指针移回开头
f.seek(0)
print(f"seek(0) 后位置:{f.tell()}")   # 输出:seek(0) 后位置:0

# seek 到中间某个位置再读
f.seek(5)
print(f.read())                   # 输出:FGHIJ(从第 5 个字符读到末尾)

# r+ 模式下可以写,但写会覆盖原有内容(不是插入!)
f.seek(0)
f.write("***")                    # 把开头 3 个字符替换为 ***
f.seek(0)
print(f.read())                   # 输出:***DEFGHIJ

f.close()
\`\`\`

**详解**:

- 文件对象内部维护一个**指针**(cursor),记录「下次读/写从哪里开始」。
- \`read(n)\` 会让指针前移 n 个字符,下一次 \`read\` 接着上次的位置读。
- \`tell()\` 查询当前位置,\`seek(pos)\` 跳到指定位置——这是实现「断点续读」「修改文件中间内容」的关键。
- **重要坑**:\`r+\` 模式下 \`write\` 是**覆盖**不是**插入**!写入会把原有字节冲掉,而不是把后面的内容往后挤。如果想插入,得自己读出来拼接再写回。
- 文本模式下 \`seek\` 只能跳到字符边界(UTF-8 多字节字符的中间字节是非法的),二进制模式没这个限制。

## 十二、Demo 5:文件对象的可迭代性

\`\`\`python
# 准备一个多行文件
lines = ["第一行", "第二行", "第三行", "第四行", "第五行"]
with open("iter.txt", "w", encoding="utf-8") as f:
    # writelines 不会自动加换行!必须手动加
    f.writelines(line + "\\n" for line in lines)

# 文件对象本身是可迭代的,每次迭代产出一行
print("方式 1:直接迭代文件对象")
with open("iter.txt", encoding="utf-8") as f:
    for line in f:
        # 注意:line 末尾自带 \\n,用 rstrip 去掉
        print(f"读到: {line.rstrip()}")

# 配合 enumerate 获取行号
print("\\n方式 2:配合 enumerate")
with open("iter.txt", encoding="utf-8") as f:
    for idx, line in enumerate(f, start=1):
        print(f"第 {idx} 行: {line.rstrip()}")

# 转成列表也能用,但会一次性读入内存
print("\\n方式 3:用 list() 一次性收集")
with open("iter.txt", encoding="utf-8") as f:
    all_lines = list(f)
    print(f"共 {len(all_lines)} 行")
\`\`\`

**详解**:

- 文件对象实现了 \`__iter__\` 和 \`__next__\`,可以直接 \`for line in f\`——这是 Python 文件操作**最优雅**的设计。
- 每次迭代产出一行,**包含末尾的 \\n**(最后一行可能没有)。用 \`line.rstrip("\\n")\` 或 \`line.rstrip()\` 去掉。
- **内存优势**:迭代是惰性的,读一行处理一行,**内存占用恒定**。读 10GB 文件也只占几 KB 内存。
- 对比 \`readlines()\`:它会一次性把所有行读进内存返回列表,大文件直接 OOM。
- \`list(f)\` 等价于 \`f.readlines()\`,都会一次性读入内存。

## 十三、Demo 6:判断文件对象状态

\`\`\`python
f = open("hello.txt", encoding="utf-8")

# 检查文件对象的属性
print(f"是否已关闭: {f.closed}")        # False
print(f"是否可读: {f.readable()}")      # True
print(f"是否可写: {f.writable()}")      # False(r 模式只读)
print(f"文件名: {f.name}")              # hello.txt
print(f"编码: {f.encoding}")           # utf-8
print(f"模式: {f.mode}")                # r

# 用 w 模式打开的文件属性不同
f2 = open("wtest.txt", "w", encoding="utf-8")
print(f"\\n写模式文件:")
print(f"  readable: {f2.readable()}")   # False
print(f"  writable: {f2.writable()}")   # True
f2.close()

# 关闭后再访问属性
f.close()
print(f"\\n关闭后 closed 属性: {f.closed}")   # True
# 关闭后调用 read 会报错:
# f.read()  # ValueError: I/O operation on closed file

# 但 closed 属性和 name 属性仍然可访问(其他方法就不行了)
print(f"关闭后 name 仍可访问: {f.name}")     # hello.txt
\`\`\`

**详解**:这段代码展示了文件对象的常用属性。

- \`f.closed\` 是**属性**不是方法(没有括号),用来判断文件是否已关闭——在调试「文件到底关没关」时很有用。
- \`readable()\` / \`writable()\` 返回当前模式是否允许读/写,可以避免「在 r 模式下调用 write」这种低级错误。
- \`f.name\` 是文件路径,\`f.mode\` 是打开模式字符串,\`f.encoding\` 是编码名——这些属性在调试时很有用。
- **关闭后**只有少数属性(如 \`closed\`、\`name\`、\`mode\`)还能访问,其他方法调用会抛 \`ValueError: I/O operation on closed file\`。

## 十四、Demo 7:文件操作三步走模板

\`\`\`python
# 这是一个「文件操作三步走」的标准模板
# 在没有 with 语句的远古时代,大家都这么写

def classic_file_write(path, content):
    """经典的 open - write - close 三步走"""
    f = None  # 先初始化为 None,方便 finally 中判断
    try:
        # 第一步:打开
        f = open(path, "w", encoding="utf-8")
        # 第二步:操作
        f.write(content)
        # 第三步:关闭 —— 放到 finally 里确保异常时也能执行
    finally:
        if f:
            f.close()

# 测试
classic_file_write("classic.txt", "三步走写入\\n")

# 读取验证
with open("classic.txt", encoding="utf-8") as f:
    print(f.read())   # 输出:三步走写入

# 这个模板太啰嗦了,下一章我们会用 with 语句简化成两行:
# with open(path, "w", encoding="utf-8") as f:
#     f.write(content)
\`\`\`

**详解**:

- 这是「没有 with 语句」时的标准写法,用 \`try/finally\` 保证即使 \`write\` 抛异常,\`close\` 也会执行。
- \`f = None\` 初始化是关键——如果 \`open\` 本身抛异常,\`f\` 不会被赋值,\`finally\` 里 \`f.close()\` 会再抛 \`UnboundLocalError\`。
- 这种写法太啰嗦——每个文件操作都要写 5-7 行模板代码。所以 Python 2.5 引入了 \`with\` 语句,把这套样板代码自动化了。
- **下一章会专门讲 with 语句**,你将看到同样的逻辑如何用两行代码优雅实现。

## 十五、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| open 函数签名 | file, mode, encoding 三大参数必须掌握 |
| 文件模式 | r 读 / w 写(清空) / a 追加 / x 排他创建,b 二进制,+ 读写 |
| 文件对象 | 持有 fd、有指针、可迭代、必须关闭 |
| 核心方法 | read/readline/readlines/write/writelines/seek/tell/close/flush |
| 三步走 | open → read/write → close |
| 编码习惯 | **永远显式写 encoding="utf-8"** |

下一章我们会深入文本文件的读写细节——编码、换行、错误处理,这些是中文环境下最容易踩坑的地方。
`,
  },
  {
    id: "pyfile-text-readwrite",
    icon: "📄",
    title: "文本文件读写:编码、模式、换行处理",
    group: "基础读写",
    content: `# 文本文件读写:编码、模式、换行处理

## 一、文本文件的本质:字节流 + 字符编码

打开任何一个 \`.txt\` 文件用十六进制查看器看,你会发现它就是一串**数字**(0-255 的字节)。所谓「文本文件」,**本质就是一串字节 + 一套编码规则**。

\`\`\`text
文件内容: 你好
       ↓
UTF-8 编码(每个中文 3 字节)
       ↓
磁盘上的字节: E4 BD A0 E5 A5 BD (6 个字节)
       ↓
       ↓ 读取时
       ↓
UTF-8 解码
       ↓
内存中的字符串: "你好"(2 个字符)
\`\`\`

**关键认知**:硬盘上**没有「文本」**,只有「字节」。所谓「文本文件」是字节按某种编码**解码**后的产物。同一份字节流,用不同编码解码,会得到完全不同的字符——这就是乱码的根源。

## 二、字符编码基础

计算机只认数字,字符必须用数字表示。这套「字符 → 数字 → 字节」的映射规则就是**编码**。

### ASCII:最早最简单的编码

- 1963 年美国标准,只包含 128 个字符(0-127)
- 一个字节只用 7 位(最高位固定为 0)
- 覆盖英文字母、数字、标点、控制符
- **致命缺陷**:不支持任何非英语字符

### GBK:中文 Windows 的默认编码

- 中国国家标准,基于 GB2312 扩展
- 中文 2 字节,英文 1 字节
- Windows 中文版的系统默认编码就是 GBK
- **坑**:Mac/Linux 默认 UTF-8,导致同份代码跨平台乱码

### UTF-8:互联网的事实标准

- Unicode 的变长编码实现
- 英文 1 字节(兼容 ASCII),中文 3 字节,emoji 4 字节
- **全宇宙通用**:支持所有语言、所有 emoji
- Web、Linux、Mac、现代数据库的默认编码

### 三种编码对比表

| 编码 | 英文 | 中文 | 占用空间 | 兼容性 | 适用场景 |
|------|------|------|---------|--------|---------|
| ASCII | 1 字节 | **不支持** | 最小 | 仅英语 | 上古时代的协议 |
| GBK | 1 字节 | 2 字节 | 中等 | 仅中文环境 | 老旧 Windows 系统 |
| UTF-8 | 1 字节 | 3 字节 | 较大 | **全宇宙** | 一切现代场景 |

## 三、为什么永远要指定 encoding='utf-8'

\`\`\`python
# 危险写法:不指定 encoding,使用系统默认
# Windows 上是 GBK,Linux/Mac 上是 UTF-8
with open("data.txt", "w") as f:    # 在 Windows 上会用 GBK 写
    f.write("你好")

# 同样的代码在 Linux 上跑会用 UTF-8 写
# 结果:文件内容字节不同,跨平台读取时乱码

# 正确写法:永远显式指定
with open("data.txt", "w", encoding="utf-8") as f:
    f.write("你好")
# 这样无论在哪个系统跑,写入的字节都一样
\`\`\`

**血泪经验**:**永远、永远、永远显式写 encoding="utf-8"**。

- 不写 encoding 时,Python 用 \`locale.getpreferredencoding()\` 获取系统默认。
- 这个默认值在 Windows 上是 \`cp936\`(GBK),在 Linux/Mac 上是 \`utf-8\`。
- 同一份代码在不同系统上跑,文件字节完全不同——这就是无数「我这儿好好的,到你那儿就乱码」的根源。
- **唯一例外**:二进制模式 \`rb\`/\`wb\` 不需要 encoding(因为根本不做编码转换)。

## 四、读取文本文件

\`\`\`python
# read():一次性读取整个文件
with open("data.txt", encoding="utf-8") as f:
    content = f.read()
# content 是一个字符串,包含整个文件内容
# 优点:简单直观;缺点:大文件会爆内存

# readline():每次读一行,读到末尾返回空字符串 ""
with open("data.txt", encoding="utf-8") as f:
    while True:
        line = f.readline()
        if not line:    # 空字符串表示 EOF
            break
        print(line.rstrip())

# readlines():一次性读取所有行,返回列表
with open("data.txt", encoding="utf-8") as f:
    lines = f.readlines()
# lines = ["第一行\\n", "第二行\\n", ...]
# 优点:可以随机访问任意行;缺点:大文件爆内存

# for line in f:逐行迭代(最 Pythonic 的方式)
with open("data.txt", encoding="utf-8") as f:
    for line in f:
        process(line)
# 内存占用恒定,推荐用于大文件
\`\`\`

四种读取方式对比:

| 方式 | 返回 | 内存占用 | 适用场景 |
|------|------|---------|---------|
| \`f.read()\` | str(全部) | 文件大小 | 小文件,需要整体处理 |
| \`f.readline()\` | str(一行) | 一行 | 需要精细控制读取节奏 |
| \`f.readlines()\` | list[str] | 文件大小 | 需要随机访问行 |
| \`for line in f\` | 迭代 | 一行 | **大文件,逐行处理** |

## 五、写入文本文件

\`\`\`python
# write():写入字符串,返回写入的字符数
with open("out.txt", "w", encoding="utf-8") as f:
    n = f.write("hello\\n")     # 返回 6
    print(f"写入了 {n} 个字符")

# writelines():批量写入一个可迭代对象
# 注意:不会自动加换行!必须自己加
lines = ["第一行\\n", "第二行\\n", "第三行\\n"]
with open("out.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)

# 如果忘了加 \\n,所有内容会连成一行:
bad_lines = ["第一行", "第二行", "第三行"]
with open("bad.txt", "w", encoding="utf-8") as f:
    f.writelines(bad_lines)
# 文件内容变成:第一行第二行第三行(挤在一起了)

# 推荐写法:用生成器表达式自动加换行
words = ["apple", "banana", "cherry"]
with open("words.txt", "w", encoding="utf-8") as f:
    f.writelines(word + "\\n" for word in words)
\`\`\`

**关键坑**:\`writelines\` 这个名字**极具误导性**——它**不会**自动加换行!正确理解是「批量 write」,等同于循环调用 \`write\`。如果你想要每行一个元素,必须自己在每个元素末尾加 \`\\n\`。

## 六、换行符问题:跨平台的诅咒

不同操作系统的换行符不一样,这是历史遗留问题:

| 系统 | 换行符 | ASCII | 起源 |
|------|--------|-------|------|
| Linux / macOS(现代) | \`\\n\` | 10 (LF) | Unix 传统 |
| Windows | \`\\r\\n\` | 13 10 (CRLF) | DOS 传统 |
| 老 Mac OS(<10) | \`\\r\` | 13 (CR) | 已淘汰 |

历史小故事:打字机时代,\`\\r\`(回车)是把打印头移回行首,\`\\n\`(换行)是把纸往上卷一行。两个动作都要做才能换到下一行开头。Unix 觉得「一个字符搞定」就够了,只保留 \`\\n\`;Windows 沿用 DOS 传统保留了两个;老 Mac 只用 \`\\r\`(后被 OS X 改成 \`\\n\`)。

### Python 的通用换行模式

Python 默认开启「通用换行模式」(universal newlines):

- **读取时**:\`\\n\`、\`\\r\\n\`、\`\\r\` 三种换行符**统一识别为 \`\\n\`**。你读到字符串里看到的永远是 \`\\n\`。
- **写入时**:统一用 \`\\n\`,但 Python 会按系统默认转换(\`os.linesep\`)。

\`\`\`python
# 演示通用换行模式的读取行为
# 假设文件用 Windows 的 \\r\\n 换行
import os
with open("crlf.txt", "wb") as f:
    f.write(b"line1\\r\\nline2\\r\\nline3\\r\\n")

# 用默认模式读取,所有 \\r\\n 都被转成 \\n
with open("crlf.txt", encoding="utf-8") as f:
    content = f.read()
print(repr(content))   # 'line1\\nline2\\nline3\\n'
# 注意:看到的是 \\n,不是 \\r\\n

# 用 newline="" 关闭转换,保留原始换行符
with open("crlf.txt", encoding="utf-8", newline="") as f:
    content = f.read()
print(repr(content))   # 'line1\\r\\nline2\\r\\nline3\\r\\n'
# 现在看到的是原始的 \\r\\n
\`\`\`

### newline 参数详解

\`newline\` 参数控制换行符的转换行为:

| newline 值 | 读取时 | 写入时 |
|-----------|--------|--------|
| \`None\`(默认) | 所有换行符转 \`\\n\` | \`\\n\` 转为 \`os.linesep\` |
| \`""\` | 不转换,保留原样 | \`\\n\` 不转换,直接写 \`\\n\` |
| \`"\\n"\` | 只识别 \`\\n\` 为换行 | \`\\n\` 不转换 |
| \`"\\r\\n"\` | 只识别 \`\\r\\n\` 为换行 | \`\\n\` 转为 \`\\r\\n\` |

实际场景:

- 处理 Windows 上的 CSV 文件,不想让 Python 自动转换 → \`newline=""\`
- 写跨平台文本,统一用 \`\\n\` → \`newline="\\n"\` 或 \`newline=""\`
- 处理网络协议数据,必须用 \`\\r\\n\` → \`newline="\\r\\n"\`

## 七、errors 参数处理编码错误

当文件字节无法用指定编码解码时,\`errors\` 参数决定怎么办:

\`\`\`python
# 制造一个有坏字节的文件
# 写入 "你好" 然后在中间插入一个非法字节
with open("bad.txt", "wb") as f:
    f.write("你好".encode("utf-8")[:2] + b"\\xff" + "你好".encode("utf-8")[2:])
\`\`\`

errors 参数可选值:

| 值 | 行为 | 示例(遇到坏字节) |
|----|------|-------------------|
| \`strict\`(默认) | 抛 \`UnicodeDecodeError\` | 程序崩溃 |
| \`ignore\` | 跳过坏字节 | "你好" 变 "你好"(中间丢字符) |
| \`replace\` | 用 \`�\`(U+FFFD)替代 | "你好" 变 "?好" |
| \`backslashreplace\` | 用 \`\\xNN\` 转义 | 显示 \`\\\\xff\` |
| \`surrogateescape\` | 用特殊代理区编码 | 适合往返保留 |
| \`xmlcharrefreplace\` | 用 XML 实体替代 | 仅写入时,如 \`&#255;\` |

## 八、Demo 1:读写中文文件

\`\`\`python
# 完整演示中文文件的读写流程

# 1. 写入中文文件
content = """《静夜思》
床前明月光,疑是地上霜。
举头望明月,低头思故乡。
—— 李白
"""
with open("poem.txt", "w", encoding="utf-8") as f:
    f.write(content)
print("写入完成")

# 2. 读取并显示
with open("poem.txt", encoding="utf-8") as f:
    text = f.read()
print("--- 文件内容 ---")
print(text)

# 3. 验证编码:用二进制模式看实际字节
with open("poem.txt", "rb") as f:
    raw_bytes = f.read()
print(f"文件大小: {len(raw_bytes)} 字节")
print(f"前 20 字节十六进制: {raw_bytes[:20].hex(' ')}")
# 中文字符在 UTF-8 下每个占 3 字节

# 4. 故意用错误编码读取,看乱码
try:
    with open("poem.txt", encoding="gbk") as f:
        print("GBK 读取结果:")
        print(f.read())
except UnicodeDecodeError as e:
    print(f"GBK 解码失败: {e}")
\`\`\`

**详解**:

- 第 1 步用 \`encoding="utf-8"\` 写入,中文每个字符占 3 字节。
- 第 3 步用 \`rb\` 模式读取原始字节,可以看到 UTF-8 编码的实际形态。
- 第 4 步故意用 GBK 读取 UTF-8 文件,要么乱码要么报 \`UnicodeDecodeError\`——**编码不匹配是中文环境最常见的 bug**。
- **核心原则**:写入用什么编码,读取就必须用什么编码。养成「永远 utf-8」的习惯,99% 的乱码问题都会消失。

## 九、Demo 2:处理混合编码

\`\`\`python
# 实际场景:处理来源不明的老文件,可能有坏字节
# 用 errors 参数避免程序崩溃

# 创建一个故意有坏字节的文件
with open("mixed.txt", "wb") as f:
    # 前半部分是合法 UTF-8 中文
    f.write("你好".encode("utf-8"))
    # 中间插入一个非法字节
    f.write(b"\\xff\\xfe")
    # 后半部分继续是合法 UTF-8
    f.write("世界".encode("utf-8"))

# 1. 默认 strict 模式:遇到坏字节直接崩溃
try:
    with open("mixed.txt", encoding="utf-8") as f:
        print(f.read())
except UnicodeDecodeError as e:
    print(f"strict 模式失败: {e}")

# 2. ignore 模式:跳过坏字节
with open("mixed.txt", encoding="utf-8", errors="ignore") as f:
    print(f"ignore 模式: {f.read()!r}")
# 输出可能:'你好世界'(坏字节被丢弃)

# 3. replace 模式:用 ? 替代坏字节
with open("mixed.txt", encoding="utf-8", errors="replace") as f:
    print(f"replace 模式: {f.read()!r}")
# 输出可能:'你好??世界'(坏字节变成 ?)

# 4. backslashreplace 模式:用 \\xNN 显示
with open("mixed.txt", encoding="utf-8", errors="backslashreplace") as f:
    print(f"backslashreplace 模式: {f.read()!r}")
# 输出可能:'你好\\\\xff\\\\xfe世界'(坏字节变成转义形式)

# 5. surrogateescape 模式:适合「读出来再原样写回去」
with open("mixed.txt", encoding="utf-8", errors="surrogateescape") as f:
    text = f.read()
# 这种模式把坏字节编码到 Unicode 代理区,可以无损还原
with open("mixed_copy.txt", "wb") as f:
    f.write(text.encode("utf-8", errors="surrogateescape"))
# mixed_copy.txt 与 mixed.txt 字节完全相同
\`\`\`

**详解**:

- \`strict\`(默认)最严格,遇到坏字节直接报错——**生产环境推荐这个**,因为坏字节往往意味着数据真的有问题,你不应该静默跳过。
- \`ignore\` 直接丢弃坏字节,**会丢失数据**,只在「我只要尽量多的内容,丢一点无所谓」时用(比如日志分析)。
- \`replace\` 用 \`�\`(U+FFFD)替代,坏字节位置一目了然,适合给用户展示。
- \`backslashreplace\` 把坏字节转义成 \`\\xff\` 形式,适合调试。
- \`surrogateescape\` 是**黑科技**——把坏字节编码到 Unicode 代理区(\`U+DC80\` 到 \`U+DCFF\`),读取再写回时能无损还原。适合「我读出来可能要做点字符串处理然后写回原文件,中间不能丢字节」的场景。

## 十、Demo 3:换行符转换

\`\`\`python
# 演示不同换行符的处理

# 创建一个 Windows 风格的文件(\\r\\n 换行)
with open("win.txt", "wb") as f:
    f.write(b"line1\\r\\nline2\\r\\nline3\\r\\n")

# 1. 默认模式:读取时 \\r\\n 自动转成 \\n
with open("win.txt", encoding="utf-8") as f:
    content = f.read()
print(f"默认读取: {content!r}")
# 输出:'line1\\nline2\\nline3\\n'

# 2. newline="":不转换,保留原始 \\r\\n
with open("win.txt", encoding="utf-8", newline="") as f:
    content = f.read()
print(f"newline='' 读取: {content!r}")
# 输出:'line1\\r\\nline2\\r\\nline3\\r\\n'

# 3. 把 Windows 换行转成 Unix 换行并另存
with open("win.txt", encoding="utf-8") as fin, \\
     open("unix.txt", "w", encoding="utf-8", newline="") as fout:
    for line in fin:
        # 此时 line 已经是 \\n 结尾(默认转换过)
        fout.write(line)
# unix.txt 里的换行都是 \\n,即使代码在 Windows 上跑

# 4. 把 Unix 换行转成 Windows 换行
with open("unix.txt", encoding="utf-8") as fin, \\
     open("win2.txt", "w", encoding="utf-8", newline="\\r\\n") as fout:
    for line in fin:
        fout.write(line)
# win2.txt 里的换行都是 \\r\\n

# 验证转换结果
import os
for name in ["win.txt", "unix.txt", "win2.txt"]:
    with open(name, "rb") as f:
        data = f.read()
    has_crlf = b"\\r\\n" in data
    has_lf = b"\\n" in data and b"\\r\\n" not in data
    print(f"{name}: CRLF={has_crlf}, LF only={has_lf}")
\`\`\`

**详解**:

- Windows 文本文件用 \`\\r\\n\` 换行,Linux 用 \`\\n\`。跨平台传输文件时经常需要转换。
- 默认模式读取时,Python 把所有换行符统一成 \`\\n\`,简化后续处理。
- 写入时,如果想**强制用某种换行符**,用 \`newline\` 参数:
  - \`newline=""\` → 写入 \`\\n\`(不做转换)
  - \`newline="\\r\\n"\` → \`\\n\` 自动转 \`\\r\\n\`
  - \`newline="\\n"\` → 强制只识别 \`\\n\`
- **CSV 文件特别坑**:用 \`csv\` 模块写文件时,必须用 \`newline=""\` 打开,否则会多出空行(因为 csv 自己写 \`\\r\\n\`,Python 又转一次)。

## 十一、Demo 4:批量读取大文本

\`\`\`python
# 演示高效处理大文本文件

# 1. 先生成一个大文件(10 万行,约几 MB)
import random
with open("big.txt", "w", encoding="utf-8") as f:
    for i in range(100000):
        # 每行写一个随机数和序号
        f.write(f"行 {i}: {random.randint(1, 1000)}\\n")

# 2. 错误方式:用 read() 一次性读入内存
# 文件小还行,文件大就 OOM
import os
file_size = os.path.getsize("big.txt")
print(f"文件大小: {file_size / 1024 / 1024:.2f} MB")

# 3. 正确方式 1:用 for 迭代,内存占用恒定
total = 0
line_count = 0
with open("big.txt", encoding="utf-8") as f:
    for line in f:
        # 每次只读一行进内存
        line_count += 1
        # 假设我们要计算所有随机数的和
        # 行格式: "行 123: 456\\n"
        num = int(line.split(":")[1].strip())
        total += num

print(f"总行数: {line_count}")
print(f"所有随机数之和: {total}")
print(f"平均: {total / line_count:.2f}")

# 4. 正确方式 2:用 read(size) 分块读取
# 适合「不按行,按字节处理」的场景
chunk_size = 4096   # 4KB 一块
total_bytes = 0
with open("big.txt", encoding="utf-8") as f:
    while True:
        chunk = f.read(chunk_size)
        if not chunk:
            break
        total_bytes += len(chunk)
print(f"分块读取总字节数: {total_bytes}")
\`\`\`

**详解**:

- **大文件处理的核心原则**:不要一次性读入内存,要么逐行,要么分块。
- \`for line in f\` 是**最 Pythonic 的大文件处理方式**——内存占用恒定(只占一行),代码简洁。
- \`read(size)\` 适合「按字节处理」的场景,比如统计字符出现次数、查找特定模式。
- 第 2 步 \`read()\` 全量读取只在文件小时可用。生产代码里看到 \`f.read()\` 就要警惕——文件可能很大。
- 第 3 步演示了一个常见任务:**统计大文件中所有数字的和**。用迭代处理,即使文件有 10 亿行,内存也只占几 KB。

## 十二、Demo 5:errors 各种模式对比

\`\`\`python
# 系统对比 errors 参数的所有模式

# 创建一个故意损坏的文件
# UTF-8 编码的 "abc" 后面跟一个非法字节 0xff
test_bytes = b"abc\\xff\\xffdef"
with open("test.txt", "wb") as f:
    f.write(test_bytes)

# 列出所有 errors 模式
modes = ["strict", "ignore", "replace", "backslashreplace", 
         "surrogateescape", "xmlcharrefreplace"]

print("原始字节:", test_bytes)
print()

for mode in modes:
    try:
        if mode == "xmlcharrefreplace":
            # xmlcharrefreplace 主要用于写入
            with open("test.txt", encoding="utf-8", errors="replace") as f:
                text = f.read()
            # 演示写入时的 xmlcharrefreplace
            with open("out.txt", "w", encoding="utf-8", 
                      errors=mode) as f:
                f.write("café\\xff")  # 演示用
            print(f"{mode:25s}: (写入模式,见 out.txt)")
        else:
            with open("test.txt", encoding="utf-8", errors=mode) as f:
                result = f.read()
            print(f"{mode:25s}: {result!r}")
    except UnicodeDecodeError as e:
        print(f"{mode:25s}: [错误] {e}")

# 输出示例:
# 原始字节: b'abc\\xff\\xffdef'
# strict                  : [错误] 'utf-8' codec can't decode...
# ignore                  : 'abcdef'
# replace                 : 'abc??def'
# backslashreplace        : 'abc\\\\xff\\\\xffdef'
# surrogateescape         : 'abc\\udcff\\udcffdef'
# xmlcharrefreplace       : (写入模式,见 out.txt)
\`\`\`

**详解**:

- 这个 demo 系统对比了所有 \`errors\` 模式的行为差异。
- \`strict\` 是默认值,**生产环境推荐**——坏字节往往是数据损坏的信号,不应该静默处理。
- \`ignore\` 适合**日志分析**——你只想找关键字,丢几个字节无所谓。
- \`replace\` 适合**给用户展示**——坏字节位置一目了然(\`?\` 替代)。
- \`backslashreplace\` 适合**调试**——能看到坏字节的具体值。
- \`surrogateescape\` 是黑科技,**适合「读出来再写回」**——能无损保留坏字节,适合处理来源不明的文件。
- \`xmlcharrefreplace\` 主要用于**写入**——把无法编码的字符转成 XML 实体(如 \`&#255;\`),适合生成 XML/HTML 文件。

## 十三、Demo 6:逐行读取的内存优势

\`\`\`python
# 用内存监控演示「逐行 vs 全量」的差别
import sys
import os

# 生成一个 100MB 的大文件
def gen_large_file(path, target_size_mb=100):
    line = "这是一行测试数据,用来测试大文件读取的内存占用。" * 5 + "\\n"
    line_size = len(line.encode("utf-8"))
    target_size = target_size_mb * 1024 * 1024
    line_count = target_size // line_size + 1
    with open(path, "w", encoding="utf-8") as f:
        for _ in range(line_count):
            f.write(line)

gen_large_file("huge.txt", 50)  # 生成 50MB 文件
print(f"文件大小: {os.path.getsize('huge.txt') / 1024 / 1024:.1f} MB")

# 方式 1:用 readlines() 全量读取(吃内存!)
def read_all_lines():
    with open("huge.txt", encoding="utf-8") as f:
        lines = f.readlines()
    print(f"  readlines 读取了 {len(lines)} 行")
    print(f"  列表对象大小: {sys.getsizeof(lines) / 1024 / 1024:.1f} MB")
    print(f"  第一行长度: {len(lines[0])}")

# 方式 2:用 for 迭代(内存恒定!)
def read_iter():
    line_count = 0
    max_line_size = 0
    with open("huge.txt", encoding="utf-8") as f:
        for line in f:
            line_count += 1
            max_line_size = max(max_line_size, len(line))
    print(f"  迭代读取了 {line_count} 行")
    print(f"  最长一行: {max_line_size} 字符")

print("\\n方式 1: readlines() —— 内存爆炸")
# read_all_lines()  # 取消注释运行,但小心内存!
# 实际效果:50MB 文件,readlines 占用约 100MB+ 内存(字符串 + 列表开销)

print("\\n方式 2: for line in f —— 内存恒定")
read_iter()
# 实际效果:50MB 文件,迭代只占几 KB 内存(一行)

# 清理
os.remove("huge.txt")
\`\`\`

**详解**:

- 这个 demo 用 \`sys.getsizeof()\` 实际测量两种方式的内存占用差异。
- \`readlines()\` 把所有行读入一个列表,**内存占用 ≈ 文件大小 × 2**(字符串本身 + 列表指针)。50MB 文件会占 100MB+ 内存。
- \`for line in f\` 是**惰性迭代**——每次只在内存里保留一行,处理完就丢。**内存占用恒定**,与文件大小无关。
- 经验法则:**文件超过 1MB 就别用 \`readlines()\`,改用迭代**。
- 注意:demo 里把 \`read_all_lines()\` 注释掉了,因为真跑会让 Python 进程内存暴涨。你可以取消注释验证,但小心机器卡顿。

## 十四、Demo 7:综合实战 - 日志分析器

\`\`\`python
# 综合实战:分析一个 nginx 访问日志
# 日志格式(简化版):IP 方法 路径 状态码 字节数

# 1. 生成模拟日志
import random
from datetime import datetime, timedelta

def gen_log(path, n=10000):
    ips = ["192.168.1.1", "10.0.0.5", "172.16.0.3", "8.8.8.8"]
    methods = ["GET", "POST", "PUT", "DELETE"]
    paths = ["/", "/api/users", "/api/login", "/static/css/main.css", "/404"]
    status = [200, 200, 200, 200, 301, 404, 500]
    
    with open(path, "w", encoding="utf-8") as f:
        base_time = datetime(2024, 1, 1)
        for i in range(n):
            t = base_time + timedelta(seconds=i * 60)
            line = (
                f"{random.choice(ips)} "
                f"[{t.strftime('%Y-%m-%d %H:%M:%S')}] "
                f"{random.choice(methods)} "
                f"{random.choice(paths)} "
                f"{random.choice(status)} "
                f"{random.randint(100, 10000)}\\n"
            )
            f.write(line)

gen_log("access.log", 10000)

# 2. 用迭代方式分析日志(内存友好)
def analyze_log(path):
    """分析日志:统计状态码分布、IP 访问次数、总流量"""
    status_count = {}    # 状态码 -> 出现次数
    ip_count = {}        # IP -> 访问次数
    total_bytes = 0      # 总字节数
    total_lines = 0
    
    with open(path, encoding="utf-8") as f:
        for line in f:
            total_lines += 1
            parts = line.split()
            # 格式:IP [时间] 方法 路径 状态 字节数
            ip = parts[0]
            status = parts[-2]
            bytes_sent = int(parts[-1])
            
            status_count[status] = status_count.get(status, 0) + 1
            ip_count[ip] = ip_count.get(ip, 0) + 1
            total_bytes += bytes_sent
    
    return {
        "total_lines": total_lines,
        "status_count": status_count,
        "top_ips": sorted(ip_count.items(), key=lambda x: -x[1])[:3],
        "total_bytes": total_bytes,
    }

result = analyze_log("access.log")
print(f"总请求数: {result['total_lines']}")
print(f"状态码分布: {result['status_count']}")
print(f"Top 3 IP: {result['top_ips']}")
print(f"总流量: {result['total_bytes'] / 1024 / 1024:.2f} MB")

# 3. 即使日志有 1 亿行,这个程序内存占用也只有几 KB
# 因为它逐行处理,处理完就丢
\`\`\`

**详解**:这个 demo 展示了文本文件读写在实际工作中的应用。

- 这是一个简化版的 nginx 日志分析器,演示了「逐行处理大文件」的典型模式。
- **核心技巧**:用 \`for line in f\` 逐行迭代,配合字典累加统计——内存占用与文件大小无关。
- 即使日志有 1 亿行(几 GB),这个程序也能稳定运行,内存只占几 KB。
- 如果用 \`readlines()\` 把所有行读进来,1 亿行可能要 10GB+ 内存,直接 OOM。
- **生产建议**:任何「处理日志/CSV/大文本」的代码,默认就用迭代模式。

## 十五、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| 文本文件本质 | 字节流 + 字符编码,硬盘上没有「文本」只有「字节」 |
| 编码选择 | **永远显式指定 encoding="utf-8"** |
| 读取方式 | read / readline / readlines / for 迭代 |
| writelines 坑 | **不会自动加换行**,要自己加 |
| 换行符 | Linux 用 \\n,Windows 用 \\r\\n,Python 默认统一为 \\n |
| newline 参数 | 控制换行转换,CSV 写入用 \`newline=""\` |
| errors 参数 | strict(默认)/ignore/replace/surrogateescape |
| 大文件处理 | 永远用迭代,不要 readlines 全量读入 |

下一章我们进入二进制世界——图片、视频、压缩包,这些不能用文本模式处理的文件。
`,
  },
  {
    id: "pyfile-binary-readwrite",
    icon: "🔢",
    title: "二进制文件读写:字节流处理",
    group: "基础读写",
    content: `# 二进制文件读写:字节流处理

## 一、什么是二进制文件

上一章我们讨论的文本文件,本质上也是「字节流 + 编码规则」。而**二进制文件**则是不做编码解释、直接操作字节的文件类型。

常见的二进制文件:

| 类型 | 例子 | 特征 |
|------|------|------|
| 图片 | \`.jpg\`、\`.png\`、\`.gif\` | 有固定的「文件头」(magic number)标识格式 |
| 视频 | \`.mp4\`、\`.avi\`、\`.mkv\` | 字节流中混合压缩数据 + 元信息 |
| 音频 | \`.mp3\`、\`.wav\`、\`.flac\` | 头部 + 音频采样数据 |
| 压缩包 | \`.zip\`、\`.tar.gz\`、\`.7z\` | 头部 + 压缩后的二进制流 |
| 可执行文件 | \`.exe\`、\`.dll\`、\`.so\`、\`.elf\` | 平台特定格式 |
| 数据库 | \`.db\`、\`.sqlite\`、\`.mdb\` | 私有二进制格式 |
| 文档 | \`.pdf\`、\`.docx\`、\`.xlsx\` | 实际上是 zip 压缩的 XML |

**核心区别**:文本文件用编码规则把字节解释成字符;二进制文件按「字节布局」(binary layout)解释字节——比如「前 4 字节是宽度、后 4 字节是高度」。

## 二、文本模式 vs 二进制模式

| 对比项 | 文本模式(\`t\`) | 二进制模式(\`b\`) |
|--------|---------------|----------------|
| 数据类型 | \`str\`(字符串) | \`bytes\`(字节) |
| 换行转换 | \`\\r\\n\` → \`\\n\`,写入时反向 | **不做任何转换** |
| 编码处理 | 按 encoding 解码/编码 | **不涉及编码** |
| 参数 | 必须指定 encoding | **不需要 encoding** |
| 适用文件 | .txt、.csv、.json、.py | 图片、视频、压缩包、可执行文件 |
| seek 限制 | 只能跳字符边界 | 任意字节位置 |

## 三、'rb' / 'wb' / 'ab' 等模式详解

二进制模式与文本模式共享同样的「主模式」:

| 模式 | 名称 | 行为 |
|------|------|------|
| \`rb\` | 二进制只读 | 文件不存在报错,返回 bytes |
| \`wb\` | 二进制只写 | 文件存在清空,不存在创建,接受 bytes |
| \`ab\` | 二进制追加 | 文件不存在创建,指针在末尾,接受 bytes |
| \`r+b\` | 二进制读写 | 文件不存在报错,可读可写 |
| \`w+b\` | 二进制写读 | 文件存在清空,可读可写 |
| \`a+b\` | 二进制追加读写 | 文件不存在创建,指针在末尾,可读可写 |

**关键点**:二进制模式**不涉及编码**,你读什么字节就是什么字节,你写什么字节就存什么字节。

## 四、读写 bytes 数据

\`\`\`python
# 二进制模式读写的关键区别:数据类型是 bytes 不是 str

# 1. 写入 bytes
with open("data.bin", "wb") as f:
    # write 接受 bytes,不接受 str
    f.write(b"hello")           # 直接写 bytes 字面量
    f.write(b"\\x00\\x01\\x02")    # 写入原始字节 0x00 0x01 0x02
    # 也可以写 str 编码后的 bytes
    f.write("你好".encode("utf-8"))

# 2. 读取 bytes
with open("data.bin", "rb") as f:
    data = f.read()
print(type(data))   # <class 'bytes'>
print(data)         # b'hello\\x00\\x01\\x02\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'

# 3. 如果想看十六进制
print(data.hex())   # 68656c6c6f00010200e4bda0e5a5bd(连续的十六进制)

# 4. 把 bytes 解码成 str(自己控制)
# 前面 5 字节是 ASCII,中间 3 字节是二进制,后面 6 字节是 UTF-8 中文
text_part = data[:5].decode("ascii")           # 'hello'
binary_part = data[5:8]                         # b'\\x00\\x01\\x02'
chinese_part = data[8:].decode("utf-8")         # '你好'
print(f"文本: {text_part}, 二进制: {binary_part!r}, 中文: {chinese_part}")
\`\`\`

**详解**:

- 二进制模式下 \`read()\` 返回 \`bytes\` 而非 \`str\`,这是与文本模式最大的区别。
- \`write()\` 接受 \`bytes\`,如果传 \`str\` 会报 \`TypeError\`。
- \`bytes\` 字面量用 \`b"..."\` 表示,如 \`b"hello"\`、\`b"\\x00\\x01"\`。
- \`bytes.hex()\` 把字节转成十六进制字符串,方便查看。
- 如果文件里既有文本又有二进制(比如图片的 EXIF 信息),需要自己**手动切片 + 解码**——这正是二进制处理的精髓。

## 五、struct 模块:打包解包二进制数据

很多二进制文件有固定格式,比如「前 2 字节是版本号(整数)、后 4 字节是时间戳(整数)、再后面是数据」。Python 的 \`struct\` 模块专门处理这种「按格式打包/解包字节」的需求。

\`\`\`python
import struct

# struct.pack(format, v1, v2, ...) 把 Python 值打包成 bytes
# struct.unpack(format, buffer) 把 bytes 解包成 Python 值

# 常用格式字符:
# < 小端序(低字节在前,Intel CPU 标准)
# > 大端序(高字节在前,网络字节序)
# B 1 字节无符号整数  b 1 字节有符号整数
# H 2 字节无符号      h 2 字节有符号
# I 4 字节无符号      i 4 字节有符号
# f 4 字节浮点        d 8 字节双精度浮点
# s 字符串(前面加长度,如 10s 表示 10 字节字符串)

# 1. 打包:版本号 + 时间戳 + 用户 ID
version = 1
timestamp = 1700000000
user_id = 42
packed = struct.pack("<HII", version, timestamp, user_id)
print(f"打包后: {packed!r}")    # 10 字节
print(f"字节长度: {len(packed)}")  # 2 + 4 + 4 = 10

# 2. 解包
unpacked = struct.unpack("<HII", packed)
print(f"解包后: {unpacked}")    # (1, 1700000000, 42)

# 3. 写入二进制文件
with open("record.bin", "wb") as f:
    f.write(packed)

# 4. 读取并解包
with open("record.bin", "rb") as f:
    data = f.read()
version, timestamp, user_id = struct.unpack("<HII", data)
print(f"从文件读取: 版本={version}, 时间戳={timestamp}, 用户ID={user_id}")

# 5. 处理多条记录(固定长度记录)
records = [(1, 1000, 100), (2, 2000, 200), (3, 3000, 300)]
with open("records.bin", "wb") as f:
    for v, t, u in records:
        f.write(struct.pack("<HII", v, t, u))

# 读取时按 10 字节一条解析
with open("records.bin", "rb") as f:
    while True:
        chunk = f.read(10)  # 每条记录 10 字节
        if len(chunk) < 10:
            break
        v, t, u = struct.unpack("<HII", chunk)
        print(f"记录: 版本={v}, 时间={t}, 用户={u}")
\`\`\`

**详解**:

- \`struct\` 是 Python 处理「二进制结构化数据」的标准工具,常用于解析二进制协议、文件格式、网络数据包。
- 格式字符串 \`"<HII"\` 解释:\`<\` 是小端序(低位字节在前,Intel x86 默认),\`H\` 是 2 字节无符号整数,\`I\` 是 4 字节无符号整数。
- **大小端**:多字节数据在内存中的存储顺序。小端序(\`<\`)低字节在前,大端序(\`>\`)高字节在前。网络协议通常用大端序,Intel CPU 用小端序。
- \`pack\` 把 Python 值变成 bytes,\`unpack\` 把 bytes 变回 Python 值——两者格式字符串必须一致。
- 处理「多条固定长度记录」时,可以 \`read(record_size)\` 分块读取,每块解包成一条记录——这是处理二进制日志、数据库文件的常见模式。

## 六、Demo 1:复制图片文件

\`\`\`python
# 经典的二进制文件操作:复制图片

def copy_file(src, dst, chunk_size=64 * 1024):
    """用分块读写复制文件,避免一次性读入大文件
    
    Args:
        src: 源文件路径
        dst: 目标文件路径
        chunk_size: 每次读写的块大小(默认 64KB)
    """
    # 用二进制模式打开,避免任何编码转换
    with open(src, "rb") as fin, open(dst, "wb") as fout:
        while True:
            # 每次读一块(64KB)
            chunk = fin.read(chunk_size)
            if not chunk:
                break   # 读到 EOF,退出
            fout.write(chunk)
    print(f"已复制: {src} -> {dst}")

# 测试:复制一张图片(需要先有源文件)
# 这里我们伪造一个"图片"文件用于演示
with open("fake_image.png", "wb") as f:
    # PNG 文件头(8 字节固定魔数)
    f.write(b"\\x89PNG\\r\\n\\x1a\\n")
    # 后面随便填充一些数据模拟图片内容
    f.write(b"\\x00" * 1000 + b"FAKE_PNG_DATA" + b"\\x00" * 500)

import os
src_size = os.path.getsize("fake_image.png")
print(f"源文件大小: {src_size} 字节")

# 执行复制
copy_file("fake_image.png", "copy.png")

# 验证复制是否一致
with open("fake_image.png", "rb") as f1, open("copy.png", "rb") as f2:
    if f1.read() == f2.read():
        print("✓ 复制成功,内容完全一致")
    else:
        print("✗ 复制失败,内容不一致")

# 清理
os.remove("fake_image.png")
os.remove("copy.png")
\`\`\`

**详解**:

- 这是二进制文件操作最经典的场景——**复制文件**。
- **关键**:用 \`rb\` 读、\`wb\` 写,避免任何编码转换。如果用文本模式,二进制数据中的字节可能恰好是非法 UTF-8 序列,会直接报 \`UnicodeDecodeError\`。
- **分块读写**:不一次性 \`read()\` 整个文件,而是循环 \`read(chunk_size)\`。这样处理 1GB 文件时内存只占 64KB。
- \`chunk_size = 64 * 1024\`(64KB)是个不错的默认值——太小会有太多 IO 调用,太大占用内存多。
- 文件结束的标志:\`read()\` 返回空 bytes \`b""\`(不是 \`None\`)。

## 七、Demo 2:读取文件头部魔数判断文件类型

\`\`\`python
# 通过文件头部的「魔数」(magic number)识别文件类型
# 这是不依赖扩展名判断文件真实类型的方法

# 常见文件类型的魔数(文件开头的固定字节)
MAGIC_NUMBERS = {
    "PNG": b"\\x89PNG\\r\\n\\x1a\\n",          # 8 字节
    "JPEG": b"\\xff\\xd8\\xff",                  # 3 字节
    "GIF": b"GIF87a",                     # 6 字节(或 GIF89a)
    "GIF89a": b"GIF89a",
    "PDF": b"%PDF-",                       # 5 字节
    "ZIP": b"PK\\x03\\x04",                    # 4 字节(zip/docx/xlsx 都是)
    "GZIP": b"\\x1f\\x8b",                      # 2 字节(gzip/tar.gz)
    "BMP": b"BM",                          # 2 字节
    "ELF": b"\\x7fELF",                       # 4 字节(Linux 可执行文件)
    "WAV": b"RIFF",                        # 4 字节(后面跟 "WAVE")
}

def detect_file_type(path):
    """通过魔数识别文件真实类型"""
    with open(path, "rb") as f:
        # 只读前 8 字节就够了(最长的魔数也才 8 字节)
        header = f.read(8)
    
    for file_type, magic in MAGIC_NUMBERS.items():
        if header.startswith(magic):
            return file_type
    return "Unknown"

# 测试:创建几种文件类型
# 1. 伪造 PNG
with open("test.png", "wb") as f:
    f.write(b"\\x89PNG\\r\\n\\x1a\\n" + b"\\x00" * 100)
print(f"test.png 真实类型: {detect_file_type('test.png')}")   # PNG

# 2. 伪造 JPEG(扩展名乱写)
with open("fake.txt", "wb") as f:
    f.write(b"\\xff\\xd8\\xff\\xe0" + b"\\x00" * 100)
print(f"fake.txt 真实类型: {detect_file_type('fake.txt')}")   # JPEG
# 即使扩展名是 .txt,文件本身是 JPEG

# 3. 伪造 ZIP
with open("document.docx", "wb") as f:
    f.write(b"PK\\x03\\x04" + b"\\x00" * 100)
print(f"document.docx 真实类型: {detect_file_type('document.docx')}")  # ZIP
# docx 本质就是 zip 压缩包

# 4. 伪造 PDF
with open("report.pdf", "wb") as f:
    f.write(b"%PDF-1.4\\n" + b"\\x00" * 100)
print(f"report.pdf 真实类型: {detect_file_type('report.pdf')}")  # PDF

# 5. 真实的文本文件
with open("plain.txt", "w", encoding="utf-8") as f:
    f.write("Hello World")
print(f"plain.txt 真实类型: {detect_file_type('plain.txt')}")  # Unknown

# 清理
import os
for name in ["test.png", "fake.txt", "document.docx", "report.pdf", "plain.txt"]:
    os.remove(name)
\`\`\`

**详解**:

- **魔数**(magic number)是二进制文件开头的固定字节序列,用于标识文件格式。这是「不依赖扩展名」判断文件类型的可靠方法。
- 比如所有 PNG 文件开头都是 \`\\x89PNG\\r\\n\\x1a\\n\` 这 8 个字节,无论扩展名是什么。
- 这个 demo 演示了一个简化的 \`file\` 命令——Linux 的 \`file\` 工具就是基于魔数数据库识别文件类型的。
- **实际应用**:
  - 上传文件时校验真实类型,防止用户把 .exe 改名 .png 上传
  - 数据恢复时识别损坏文件的真实格式
  - 爬虫下载文件后判断是什么类型
- 注意:有些文件类型用扩展名后的字节判断(如 WAV 的 "RIFF....WAVE"),这个 demo 简化了只看头部。

## 八、Demo 3:写入二进制数据

\`\`\`python
# 演示向二进制文件写入不同类型的数据

# 1. 写入纯字节字面量
with open("bytes1.bin", "wb") as f:
    f.write(b"\\x00\\x01\\x02\\x03\\xff\\xfe")
    # 6 个字节:00 01 02 03 ff fe

# 2. 写入字符串编码后的字节
with open("bytes2.bin", "wb") as f:
    # 用指定编码把字符串转成字节
    f.write("hello".encode("ascii"))          # 5 字节
    f.write("你好".encode("utf-8"))             # 6 字节(每中文 3 字节)
    f.write("你好".encode("gbk"))               # 4 字节(每中文 2 字节)
    # 文件总大小:5 + 6 + 4 = 15 字节

# 3. 写入整数列表(用 bytes 构造)
with open("bytes3.bin", "wb") as f:
    # bytes() 可以从 0-255 的整数列表构造
    data = bytes([0, 1, 2, 3, 255, 254, 253])
    f.write(data)

# 4. 写入 bytearray(可变的 bytes)
with open("bytes4.bin", "wb") as f:
    ba = bytearray(b"hello")
    ba.append(0x21)   # 加一个 '!' 字符(0x21)
    ba.extend(b" world")
    f.write(ba)
    # 写入:b'hello! world'

# 5. 验证写入结果
import os
for name in ["bytes1.bin", "bytes2.bin", "bytes3.bin", "bytes4.bin"]:
    size = os.path.getsize(name)
    with open(name, "rb") as f:
        content = f.read()
    print(f"{name} ({size} 字节): {content.hex(' ')}")

# 清理
for name in ["bytes1.bin", "bytes2.bin", "bytes3.bin", "bytes4.bin"]:
    os.remove(name)
\`\`\`

**详解**:

- 二进制模式下 \`write()\` 只接受 \`bytes\` 或 \`bytearray\`,不接受 \`str\`。要写字符串必须先 \`encode()\`。
- 构造 bytes 的几种方式:
  - 字面量:\`b"hello"\`、\`b"\\x00\\x01"\`(只能用 ASCII 字符或转义)
  - 编码:\`"你好".encode("utf-8")\`
  - 列表:\`bytes([0, 1, 2, 255])\`(每个元素 0-255)
  - 乘法:\`b"\\x00" * 100\`(生成 100 个零字节)
- \`bytearray\` 是 \`bytes\` 的可变版本,可以用 \`append\`/\`extend\` 修改,适合需要动态构建字节的场景。
- 第 4 个 demo 用 \`append(0x21)\` 加了一个字节——注意是**字节值**不是字符,0x21 就是 \`!\` 的 ASCII 码。

## 九、Demo 4:追加二进制数据

\`\`\`python
# 演示 ab 模式追加二进制数据

# 1. 先创建一个初始文件
with open("log.bin", "wb") as f:
    f.write(b"HEADER\\n")

# 2. 用 ab 模式追加数据(不会清空原内容)
with open("log.bin", "ab") as f:
    f.write(b"record1\\n")
    f.write(b"record2\\n")

# 3. 继续追加
with open("log.bin", "ab") as f:
    f.write(b"record3\\n")

# 4. 读取验证
with open("log.bin", "rb") as f:
    print(f.read())
# 输出:b'HEADER\\nrecord1\\nrecord2\\nrecord3\\n'

# 5. ab 模式的指针行为
with open("log.bin", "ab") as f:
    # 即使 seek 到开头,写入也强制到末尾!
    f.seek(0)
    print(f"当前指针位置: {f.tell()}")   # 0
    f.write(b"NEW DATA\\n")
    print(f"写入后指针位置: {f.tell()}")  # 末尾
    # 但写入的数据在文件末尾,不在开头

# 6. 验证
with open("log.bin", "rb") as f:
    print(f.read())
# 输出:b'HEADER\\nrecord1\\nrecord2\\nrecord3\\nNEW DATA\\n'
# "NEW DATA" 在最后,不在开头

# 清理
import os
os.remove("log.bin")
\`\`\`

**详解**:

- \`ab\` 模式(append binary)用于**追加数据**:打开时不清空文件,写入时自动到末尾。
- **重要坑**:\`a\`/\`ab\` 模式下,**所有写入都强制到文件末尾**,即使你 \`seek(0)\` 也没用!这是操作系统级别的保证,Python 也无法绕过。
- 这一点和 \`r+b\`(读写模式)不同——\`r+b\` 模式下 \`seek\` 后 \`write\` 会覆盖对应位置的字节。
- 适用场景:
  - 日志文件:每次运行程序追加一条记录
  - 数据采集:持续追加传感器数据
  - 下载断点续传:从上次的位置继续追加

## 十、Demo 5:二进制文件的分块读写

\`\`\`python
# 演示二进制文件的分块读写,这是处理大文件的标准模式

# 1. 生成一个大二进制文件(10MB)
import os
def gen_big_binary(path, size_mb=10):
    """生成指定大小的二进制文件"""
    chunk = os.urandom(64 * 1024)  # 64KB 随机数据
    chunks_needed = size_mb * 1024 * 1024 // len(chunk)
    with open(path, "wb") as f:
        for _ in range(chunks_needed):
            f.write(chunk)
    # 写入剩余部分凑够大小
    remaining = size_mb * 1024 * 1024 - chunks_needed * len(chunk)
    if remaining:
        f.write(os.urandom(remaining))

gen_big_binary("big.bin", 10)
print(f"文件大小: {os.path.getsize('big.bin') / 1024 / 1024} MB")

# 2. 分块读取 + 处理(计算 CRC32 校验和)
import zlib
def compute_crc32(path, chunk_size=64 * 1024):
    """分块计算文件的 CRC32"""
    crc = 0
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            crc = zlib.crc32(chunk, crc)
    return crc & 0xffffffff   # 转成无符号

crc = compute_crc32("big.bin")
print(f"CRC32: {crc:08x}")

# 3. 分块写入:模拟流式下载
def stream_write(src, dst, chunk_size=64 * 1024, simulate_slow=False):
    """分块从 src 读,分块写到 dst,模拟流式处理"""
    import time
    total = 0
    with open(src, "rb") as fin, open(dst, "wb") as fout:
        while True:
            chunk = fin.read(chunk_size)
            if not chunk:
                break
            fout.write(chunk)
            total += len(chunk)
            if simulate_slow:
                time.sleep(0.01)   # 模拟慢速 IO
    return total

written = stream_write("big.bin", "big_copy.bin")
print(f"已写入: {written / 1024 / 1024:.2f} MB")

# 4. 验证两文件一致
crc_copy = compute_crc32("big_copy.bin")
print(f"源 CRC32: {crc:08x}")
print(f"副本 CRC32: {crc_copy:08x}")
print(f"校验: {'✓ 通过' if crc == crc_copy else '✗ 失败'}")

# 清理
os.remove("big.bin")
os.remove("big_copy.bin")
\`\`\`

**详解**:

- **分块读写**是处理大二进制文件的黄金法则:每次读写固定大小的块(通常 4KB-1MB),内存占用恒定。
- \`chunk_size\` 的选择:太小(如 1 字节)会有大量 IO 调用,性能差;太大(如 100MB)占内存多。**64KB 是一个不错的折中**。
- 第 2 步用 \`zlib.crc32\` 计算校验和——这是验证文件完整性的常用方法。\`crc32\` 支持「增量计算」,可以分块传入,非常适合大文件。
- 第 3 步 \`stream_write\` 模拟了流式处理——一边读一边写,不需要中间缓冲区。这是**网络下载、文件复制、数据备份**的标准模式。
- **生产应用**:云存储 SDK 上传大文件时,底层就是分块读 + 分块上传;视频播放器缓冲也是分块读 + 边解码边播放。

## 十一、Demo 6:二进制 seek 与 tell 高级用法

\`\`\`python
# 演示二进制模式下的 seek/tell,可以精确到任意字节

# 准备一个 100 字节的测试文件
with open("seek.bin", "wb") as f:
    f.write(bytes(range(100)))  # 0x00 到 0x63 共 100 字节

# 1. 基本读取
with open("seek.bin", "rb") as f:
    print(f"初始位置: {f.tell()}")           # 0
    data = f.read(5)
    print(f"读 5 字节: {data.hex(' ')}")     # 00 01 02 03 04
    print(f"当前位置: {f.tell()}")           # 5

# 2. seek 到开头
with open("seek.bin", "rb") as f:
    f.read(50)
    f.seek(0)
    print(f"seek(0) 后位置: {f.tell()}")    # 0
    print(f"重新读: {f.read(3).hex(' ')}")  # 00 01 02

# 3. seek whence=1:相对当前位置移动
with open("seek.bin", "rb") as f:
    f.read(10)                            # 位置 10
    f.seek(5, 1)                          # 相对当前位置前移 5 字节
    print(f"相对 seek 后位置: {f.tell()}")  # 15
    print(f"读到的字节: {f.read(3).hex(' ')}")  # 0f 10 11

# 4. seek whence=2:相对末尾移动(常用于获取文件大小)
with open("seek.bin", "rb") as f:
    f.seek(0, 2)                          # 移到末尾
    file_size = f.tell()
    print(f"文件大小: {file_size} 字节")   # 100
    
    f.seek(-10, 2)                        # 从末尾往前 10 字节
    print(f"末尾 10 字节: {f.read().hex(' ')}")  # 5a 5b 5c 5d 5e 5f 60 61 62 63

# 5. 在文件中间修改内容(r+b 模式)
# 注意:r+b 不会清空文件,可以原地修改
with open("seek.bin", "r+b") as f:
    f.seek(50)
    f.write(b"***")   # 把位置 50-52 的字节改成 2a 2a 2a
    # 其他字节不变

# 6. 验证修改结果
with open("seek.bin", "rb") as f:
    f.seek(48)
    print(f"修改后: {f.read(6).hex(' ')}")
    # 30 31 2a 2a 2a 35 (位置 50-52 的 32 33 34 改成了 2a 2a 2a)
    # 哦不对,位置 50-52 应该是 32 33 34,改成 2a 2a 2a
    # 所以输出:30 31 2a 2a 2a 35

import os
os.remove("seek.bin")
\`\`\`

**详解**:

- 二进制模式下 \`seek\` 可以精确到**任意字节位置**,这是与文本模式最大的区别(文本模式只能跳字符边界)。
- \`seek(offset, whence)\` 的 \`whence\` 参数:
  - \`0\`(默认):从文件开头计算 \`offset\`(\`offset\` 必须 >= 0)
  - \`1\`:从当前位置计算 \`offset\`(\`offset\` 可正可负)
  - \`2\`:从文件末尾计算 \`offset\`(\`offset\` 通常为负)
- **获取文件大小的标准技巧**:\`f.seek(0, 2); f.tell()\`——比 \`os.path.getsize()\` 更底层,适合流式数据(如管道)。
- \`r+b\` 模式是**原地修改**的利器:不清空文件,\`seek\` 到位置后 \`write\` 会覆盖对应字节。常用于修改文件头部、修改固定长度记录。
- **重要区别**:文本模式下 \`seek\` 到非字符边界会报错(\`UnicodeDecodeError\`),二进制模式没这个限制。

## 十二、Demo 7:struct 实战 - 读写 BMP 文件头

\`\`\`python
# 实战:解析 BMP 文件头部,演示 struct 模块的实际应用

import struct

# BMP 文件头格式(简化版)
# 偏移  大小  字段名
# 0     2     文件类型("BM")
# 2     4     文件大小
# 6     2     保留字段 1
# 8     2     保留字段 2
# 10    4     数据偏移(像素数据起始位置)
# 14    4     DIB 头大小
# 18    4     图像宽度
# 22    4     图像高度
# 26    2     颜色平面数
# 28    2     每像素位数

def create_fake_bmp(path, width, height):
    """创建一个最小化的 BMP 文件用于演示"""
    with open(path, "wb") as f:
        # BMP 文件头(14 字节)
        # 格式: <2sIHHI (2字节字符串 + 4字节整数 + ...)
        file_header = struct.pack(
            "<2sIHHI",
            b"BM",          # 文件类型
            14 + 40,        # 文件大小(头 + 像素数据,这里假装 0 像素)
            0,              # 保留字段
            0,              # 保留字段
            14 + 40         # 像素数据偏移
        )
        f.write(file_header)
        
        # DIB 头(40 字节)
        dib_header = struct.pack(
            "<IiiHHIIiiII",
            40,             # DIB 头大小
            width,          # 宽度
            height,         # 高度
            1,              # 颜色平面数
            24,             # 每像素位数
            0,              # 压缩方式(0 = 不压缩)
            0,              # 像素数据大小
            2835,           # 水平分辨率
            2835,           # 垂直分辨率
            0,              # 调色板颜色数
            0               # 重要颜色数
        )
        f.write(dib_header)

def parse_bmp_header(path):
    """解析 BMP 文件头,返回关键信息"""
    with open(path, "rb") as f:
        # 读文件头(14 字节)
        file_header = f.read(14)
        # 解包:文件类型、文件大小、保留字段、保留字段、数据偏移
        magic, file_size, _, _, data_offset = struct.unpack("<2sIHHI", file_header)
        
        # 读 DIB 头(40 字节)
        dib_header = f.read(40)
        # 解包关键信息
        (dib_size, width, height, planes, bpp, 
         compression, image_size, _, _, _, _) = struct.unpack("<IiiHHIIiiII", dib_header)
    
    return {
        "magic": magic.decode("ascii"),
        "file_size": file_size,
        "data_offset": data_offset,
        "width": width,
        "height": height,
        "planes": planes,
        "bits_per_pixel": bpp,
        "compression": compression,
    }

# 测试:创建并解析 BMP 文件
create_fake_bmp("test.bmp", width=1920, height=1080)
info = parse_bmp_header("test.bmp")

print("=== BMP 文件信息 ===")
for key, value in info.items():
    print(f"{key:20s}: {value}")

import os
os.remove("test.bmp")
\`\`\`

**详解**:

- 这个 demo 展示了 \`struct\` 模块的**真实应用场景**——解析二进制文件格式。
- BMP 是最简单的图片格式之一,文件头是固定的 14 + 40 = 54 字节,非常适合练手。
- \`struct.pack("<2sIHHI", ...)\` 解释:
  - \`2s\`:2 字节字符串(用于 "BM" 这两个字符)
  - \`I\`:4 字节无符号整数(文件大小、数据偏移)
  - \`H\`:2 字节无符号整数(保留字段)
- 注意格式字符串里的 \`<\`——BMP 是小端序(Windows 起源,Intel CPU 标准)。
- 实际开发中,你会用类似的代码解析 PNG、JPEG、MP4 等格式——只是格式更复杂,但原理一样。
- **进阶**:Python 的 \`Pillow\` 库就是这么解析图片的,只是它支持几百种格式。

## 十三、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| 二进制模式 | \`rb\`/\`wb\`/\`ab\`,读写 bytes 不做编码转换 |
| bytes 类型 | 不可变字节序列,\`b"..."\` 字面量 |
| bytearray | 可变字节序列,适合动态构建 |
| 分块读写 | 大文件用 \`read(chunk_size)\` 分块,内存恒定 |
| seek/tell | 二进制模式可精确到任意字节,支持 whence=0/1/2 |
| struct 模块 | 打包/解包二进制数据,处理固定格式文件 |
| 魔数 | 文件开头的固定字节,用于识别文件真实类型 |
| 追加模式 | \`ab\` 强制写到末尾,seek 也不行 |

下一章我们解决一个关键问题:如何保证文件操作不泄漏资源?答案就是 Python 的 \`with\` 语句。
`,
  },
  {
    id: "pyfile-with-statement",
    icon: "🔒",
    title: "with 语句与上下文管理器:资源安全释放",
    group: "基础读写",
    content: `# with 语句与上下文管理器:资源安全释放

## 一、资源泄漏问题

前面几章我们一直强调「文件必须关闭」,但实际编码中「忘记关闭」或「关闭失败」的情况非常普遍。来看几种典型场景:

### 场景 1:忘记写 close

\`\`\`python
# 新手最常犯的错:打开文件后忘记 close
def bad_function():
    f = open("data.txt", encoding="utf-8")
    content = f.read()
    # 忘了 f.close()!
    return content
\`\`\`

文件描述符会泄漏。短时间内你可能感觉不到问题,但循环调用 1 万次,程序就崩了:\`OSError: Too many open files\`。

### 场景 2:异常导致 close 未执行

\`\`\`python
# 即使记得写 close,也可能因为异常而跳过
def risky_function():
    f = open("data.txt", encoding="utf-8")
    content = f.read()
    # 假设这里抛异常(比如文件内容格式不对)
    number = int(content)   # ValueError!
    # 下面这行 close 永远不会执行
    f.close()
    return number
\`\`\`

异常发生时,程序直接跳到调用方的 except 块,**\`f.close()\` 被跳过**,文件依然泄漏。这是更隐蔽的 bug——平时没事,出异常时才暴露。

### 场景 3:用 try/finally 的啰嗦写法

\`\`\`python
# 正确但啰嗦的写法:try/finally 保证 close
def verbose_function():
    f = None
    try:
        f = open("data.txt", encoding="utf-8")
        content = f.read()
        return int(content)
    finally:
        # 无论是否异常,都会执行
        if f:
            f.close()
\`\`\`

这是 \`with\` 语句出现之前的标准写法,**正确但啰嗦**——每个文件操作都要写 5-7 行模板代码。Python 2.5 引入 \`with\` 语句,把这套样板代码自动化了。

## 二、with 语句:自动确保资源释放

\`with\` 语句的核心作用:**无论是否发生异常,都能保证资源被释放**。

### 基本语法

\`\`\`python
with open("data.txt", encoding="utf-8") as f:
    content = f.read()
    # 在这个块里使用 f
    # 块结束时(无论正常还是异常)自动 close

# 离开 with 块后,f 已经自动关闭
# 不需要手动 f.close()
print(content)
\`\`\`

对比 try/finally,代码量从 5-7 行缩减到 2 行,而且更安全、更易读。

### with 的工作流程

\`\`\`text
[with open(...) as f: ]
       ↓
[调用文件对象的 __enter__(),返回文件对象本身赋给 f]
       ↓
[执行 with 块内的代码]
       ↓
   ┌─────── 块内是否抛异常 ───────┐
   ↓                              ↓
[正常退出]                  [抛出异常]
   ↓                              ↓
[调用 __exit__(None, None, None)]   [调用 __exit__(exc_type, exc_val, exc_tb)]
   ↓                              ↓
[自动 close,继续执行后续代码]   [自动 close,异常继续向上传播]
\`\`\`

关键点:

1. \`__enter__\` 在进入 with 块时调用,返回值赋给 \`as\` 后面的变量。
2. \`__exit__\` 在退出 with 块时调用,**无论是否异常**。
3. 如果块内抛异常,异常信息会传给 \`__exit__\` 的三个参数(\`exc_type\`、\`exc_val\`、\`exc_tb\`)。
4. \`__exit__\` 返回 \`True\` 会**吞掉异常**(不向上传播),返回 \`False\` 或 \`None\` 会继续传播——这个特性常被用来「优雅降级」。

## 三、with 语句的工作原理:__enter__ / __exit__ 协议

任何实现了 \`__enter__\` 和 \`__exit__\` 两个方法的对象,都能用 \`with\` 语句——这种对象叫**上下文管理器**(context manager)。

\`\`\`python
class MyContext:
    """演示上下文管理器协议"""
    
    def __init__(self, name):
        self.name = name
    
    def __enter__(self):
        # 进入 with 块时调用
        # 通常返回资源对象(可以是 self,也可以是别的)
        print(f"[{self.name}] __enter__ 被调用")
        return self    # 这个返回值会赋给 as 后面的变量
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # 退出 with 块时调用(无论是否异常)
        # exc_type: 异常类型(无异常时为 None)
        # exc_val: 异常实例(无异常时为 None)
        # exc_tb: traceback 对象(无异常时为 None)
        print(f"[{self.name}] __exit__ 被调用, exc_type={exc_type}")
        # 返回 False 或 None:异常继续传播
        # 返回 True:吞掉异常,不传播
        return False

# 使用
with MyContext("A") as ctx:
    print("  在 with 块内")
    # 不会抛异常
print("with 块已结束\\n")

# 演示异常情况
try:
    with MyContext("B") as ctx:
        print("  在 with 块内,准备抛异常")
        raise ValueError("故意抛个异常")
        # 下面这行不会执行
        print("  这行不会打印")
except ValueError as e:
    print(f"捕获到异常: {e}")
print("with 块已结束(异常被外层捕获)\\n")
\`\`\`

输出:

\`\`\`
[A] __enter__ 被调用
  在 with 块内
[A] __exit__ 被调用, exc_type=None
with 块已结束

[B] __enter__ 被调用
  在 with 块内,准备抛异常
[B] __exit__ 被调用, exc_type=<class 'ValueError'>
捕获到异常: 故意抛个异常
with 块已结束(异常被外层捕获)
\`\`\`

**详解**:

- \`__enter__\` 在进入 with 块时调用一次,返回值赋给 \`as\` 后的变量。对文件对象来说,返回的是文件对象本身。
- \`__exit__\` 在退出 with 块时调用一次,**无论是否异常**:
  - 正常退出时,\`exc_type\`/\`exc_val\`/\`exc_tb\` 都是 \`None\`
  - 异常退出时,三个参数分别携带异常信息
- \`__exit__\` 的返回值控制异常是否传播:
  - 返回 \`False\` 或 \`None\`:异常继续向上传播(最常见)
  - 返回 \`True\`:**吞掉异常**,程序继续执行 with 块后的代码(谨慎使用,容易掩盖 bug)
- 文件对象的 \`__exit__\` 实现就是调用 \`self.close()\`,所以 \`with open()\` 能自动关闭文件。

## 四、同时打开多个文件

\`\`\`python
# Python 3.1+ 支持在一个 with 里打开多个文件
# 写法 1:逗号分隔(推荐)
with open("input.txt", encoding="utf-8") as fin, \\
     open("output.txt", "w", encoding="utf-8") as fout:
    for line in fin:
        fout.write(line.upper())

# 写法 2:嵌套 with(老式写法,可读性差)
with open("input.txt", encoding="utf-8") as fin:
    with open("output.txt", "w", encoding="utf-8") as fout:
        for line in fin:
            fout.write(line.upper())

# 写法 3:Python 3.10+ 支持括号语法,可以换行
with (
    open("input.txt", encoding="utf-8") as fin,
    open("output.txt", "w", encoding="utf-8") as fout,
):
    for line in fin:
        fout.write(line.upper())
\`\`\`

**详解**:

- 多个 \`with\` 用逗号连接可以同时管理多个资源,代码更紧凑。
- 退出 with 块时,所有资源**按相反顺序**关闭(后打开的先关闭)——这保证了依赖关系正确。
- Python 3.10+ 的括号语法让多行 with 更优雅,推荐使用。
- **典型应用**:文件复制、文件转换(读一个写一个)、合并文件。

## 五、自定义上下文管理器

### 方式 1:实现 __enter__/__exit__

\`\`\`python
class Timer:
    """计时器上下文管理器:测量 with 块内代码的执行时间"""
    
    import time  # 类级别导入
    
    def __init__(self, name="代码块"):
        self.name = name
        self.start_time = None
        self.elapsed = None
    
    def __enter__(self):
        # 进入时记录开始时间
        import time
        self.start_time = time.time()
        return self    # 返回 self 方便后续访问 elapsed
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # 退出时计算耗时
        import time
        self.elapsed = time.time() - self.start_time
        # 注意:不返回 True,让异常正常传播
        if exc_type is None:
            print(f"[{self.name}] 执行完成,耗时 {self.elapsed:.3f}s")
        else:
            print(f"[{self.name}] 执行异常,耗时 {self.elapsed:.3f}s")
        return False

# 使用
with Timer("数据处理"):
    # 模拟耗时操作
    import time
    time.sleep(0.5)
    total = sum(i * i for i in range(1000000))
print(f"结果: {total}")

# 输出:
# [数据处理] 执行完成,耗时 0.502s
# 结果: 333332833333500000
\`\`\`

### 方式 2:用 contextlib.contextmanager 装饰器

\`\`\`python
from contextlib import contextmanager
import time

@contextmanager
def timer(name="代码块"):
    """用生成器实现的上下文管理器,代码更简洁"""
    start = time.time()
    try:
        # yield 之前的代码相当于 __enter__
        # yield 的值会赋给 as 后的变量(这里 yield None)
        yield
        # yield 之后的代码相当于 __exit__(无异常分支)
        elapsed = time.time() - start
        print(f"[{name}] 执行完成,耗时 {elapsed:.3f}s")
    except Exception:
        # 异常分支
        elapsed = time.time() - start
        print(f"[{name}] 执行异常,耗时 {elapsed:.3f}s")
        # 不在这里 swallow,让异常传播
        raise

# 使用方式与类实现的完全一样
with timer("计算"):
    total = sum(i * i for i in range(1000000))
\`\`\`

**详解**:

- 实现上下文管理器有两种方式:
  1. **类方式**:实现 \`__enter__\` 和 \`__exit__\`。优点:状态管理清晰,适合复杂场景。
  2. **装饰器方式**:用 \`@contextmanager\` 装饰一个生成器函数。优点:代码简洁,适合简单场景。
- 装饰器方式的执行流程:
  - \`yield\` 之前的代码 = \`__enter__\`
  - \`yield\` 的值 = \`__enter__\` 的返回值
  - \`with\` 块内的代码在 \`yield\` 处执行
  - \`yield\` 之后的代码 = \`__exit__\`(无异常时)
  - \`except\` 块内的代码 = \`__exit__\`(有异常时)
- **必须用 try/finally 或 try/except 包住 yield**,否则异常会让 \`yield\` 之后的代码不执行,资源泄漏。

## 六、contextlib.closing:为只有 close 方法的对象包装

\`\`\`python
from contextlib import closing
import urllib.request

# 有些对象(如 urllib 的响应)只有 close 方法,没实现 __enter__/__exit__
# 用 contextlib.closing 包装,就能用 with 语句

# urlopen 返回的对象有 close() 但没实现 __exit__
with closing(urllib.request.urlopen("http://httpbin.org/get")) as response:
    # 在这里使用 response
    html = response.read()
    print(f"获取到 {len(html)} 字节")
# 退出 with 块时,自动调用 response.close()

# 不用 closing 的话,需要手动 try/finally:
# response = urllib.request.urlopen(...)
# try:
#     html = response.read()
# finally:
#     response.close()
\`\`\`

**详解**:

- \`contextlib.closing(obj)\` 把一个只有 \`close()\` 方法的对象包装成上下文管理器。
- 包装后的对象在 \`__exit__\` 时调用 \`obj.close()\`。
- 适合老代码或第三方库对象,它们没实现 \`__enter__/__exit__\` 但有 \`close\` 方法。
- **现代代码优先用 \`contextlib.contextmanager\`**,只有遇到「现成的对象只有 close」时才用 \`closing\`。

## 七、Demo 1:with 基本用法

\`\`\`python
# 演示 with 语句的基本用法

# 1. 写入文件
with open("hello.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\\n")
    f.write("这是第二行\\n")
    # 退出 with 块时自动 close,不需要手动调用

# 2. 读取文件
with open("hello.txt", encoding="utf-8") as f:
    content = f.read()
print(f"读取内容: {content!r}")

# 3. 验证文件已关闭
with open("hello.txt", encoding="utf-8") as f:
    print(f"块内 closed: {f.closed}")   # False
print(f"块外 closed: {f.closed}")       # True
# 注意:f 变量在 with 块外仍然可以访问,只是文件已关闭

# 4. with 块外访问文件会报错
try:
    with open("hello.txt", encoding="utf-8") as f:
        pass
    # 这里 f 已关闭
    f.read()   # ValueError!
except ValueError as e:
    print(f"错误: {e}")
# 输出:错误: I/O operation on closed file.

# 5. 多次进入 with 块
with open("hello.txt", encoding="utf-8") as f:
    print(f"第一次读: {f.readline().strip()}")
# 每次都需要重新打开,因为上次关闭了

import os
os.remove("hello.txt")
\`\`\`

**详解**:

- \`with open(...) as f:\` 是文件操作的**标准姿势**,几乎所有生产代码都应该这么写。
- \`as f\` 把 \`__enter__()\` 的返回值赋给 \`f\`,这个 \`f\` 就是文件对象本身。
- **关键**:with 块结束后,\`f\` 变量**仍然存在**(不会像某些语言那样作用域结束就销毁),但文件**已经关闭**,再调用 \`f.read()\` 会报 \`ValueError: I/O operation on closed file\`。
- 可以验证:\`f.closed\` 属性在块内是 \`False\`,块外是 \`True\`。

## 八、Demo 2:异常时仍自动关闭

\`\`\`python
# 演示 with 语句在异常情况下仍能关闭文件

# 准备一个测试文件
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("123abc")

# 1. 传统方式:异常会让 close 被跳过
def read_without_with():
    f = open("test.txt", encoding="utf-8")
    content = f.read()
    number = int(content)   # ValueError! "123abc" 不能转 int
    f.close()                # 这行不会执行
    return number

try:
    read_without_with()
except ValueError:
    pass

# 此时文件描述符已泄漏(在 CPython 中 GC 最终会关,但不可靠)
# 在 PyPy 或循环调用场景下会出问题

# 2. with 方式:异常时仍会自动关闭
def read_with_with():
    with open("test.txt", encoding="utf-8") as f:
        content = f.read()
        number = int(content)   # ValueError!
        # with 块退出前会调用 __exit__,自动 close
    return number

try:
    read_with_with()
except ValueError as e:
    print(f"捕获异常: {e}")
# 文件已被正确关闭

# 3. 演示 __exit__ 的异常信息参数
class SafeFile:
    def __init__(self, path):
        self.path = path
        self.f = None
    
    def __enter__(self):
        self.f = open(self.path, encoding="utf-8")
        return self.f
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"  __exit__ 被调用")
        print(f"  exc_type: {exc_type}")
        print(f"  exc_val:  {exc_val}")
        if self.f:
            self.f.close()
            print(f"  文件已关闭")
        return False    # 不吞异常

try:
    with SafeFile("test.txt") as f:
        content = f.read()
        # 故意抛异常
        raise RuntimeError("故意制造错误")
except RuntimeError as e:
    print(f"外层捕获: {e}")

import os
os.remove("test.txt")
\`\`\`

**详解**:

- 这个 demo 对比了「传统方式」和「with 方式」在异常情况下的行为差异。
- **传统方式**:\`int(content)\` 抛异常后,\`f.close()\` 这一行**永远不会执行**,文件描述符泄漏。
- **with 方式**:无论是否异常,退出 with 块时都会调用 \`__exit__\`,从而调用 \`f.close()\`。
- \`SafeFile\` 类展示了 \`__exit__\` 的完整签名,你可以看到异常发生时三个参数都携带了异常信息。
- **生产建议**:**永远用 with,不要用裸的 open/close**。这是 Python 文件操作的第一铁律。

## 九、Demo 3:多文件 with

\`\`\`python
# 演示同时管理多个文件的 with 语句

# 1. 同时打开两个文件:一个读一个写
# 经典场景:文件内容转换
with open("input.txt", "w", encoding="utf-8") as f:
    f.write("hello world\\nfoo bar baz\\n")

# 写法 1:逗号分隔(Python 3.1+)
with open("input.txt", encoding="utf-8") as fin, \\
     open("output.txt", "w", encoding="utf-8") as fout:
    for line in fin:
        # 把每行转大写后写入
        fout.write(line.upper())

# 验证
with open("output.txt", encoding="utf-8") as f:
    print(f"转换结果: {f.read()!r}")

# 2. Python 3.10+ 的括号语法
with (
    open("input.txt", encoding="utf-8") as fin,
    open("upper.txt", "w", encoding="utf-8") as fout1,
    open("lower.txt", "w", encoding="utf-8") as fout2,
):
    for line in fin:
        fout1.write(line.upper())
        fout2.write(line.lower())

# 3. 嵌套 with(老式写法)
with open("input.txt", encoding="utf-8") as fin:
    with open("copy.txt", "w", encoding="utf-8") as fout:
        fout.write(fin.read())

# 4. 多文件异常处理
try:
    with open("input.txt", encoding="utf-8") as fin, \\
         open("nonexistent_dir/output.txt", "w") as fout:
        # 第二个 open 会失败(IOError: No such file or directory)
        # 但第一个 fin 会被正确关闭(with 保证)
        fout.write(fin.read())
except OSError as e:
    print(f"错误(预期): {e}")

# 验证 input.txt 在异常情况下仍能正常打开
with open("input.txt", encoding="utf-8") as f:
    print(f"input.txt 仍可读: {f.read()!r}")

import os
for name in ["input.txt", "output.txt", "upper.txt", "lower.txt", "copy.txt"]:
    if os.path.exists(name):
        os.remove(name)
\`\`\`

**详解**:

- 多文件 with 让代码更紧凑,同时管理多个资源。
- **关键问题**:如果其中一个 \`open\` 失败,前面已打开的文件会怎样?答案:**with 保证已打开的文件被正确关闭**——这是 with 语句的一大优势。
- 在第 4 步的 demo 中,\`open("nonexistent_dir/output.txt", "w")\` 失败抛 \`OSError\`,但 \`fin\`(已经打开)会被 \`__exit__\` 关闭。如果不用 with,这种「部分成功」的场景很容易泄漏。
- 退出 with 块时,资源按**相反顺序**关闭(后打开的先关闭)——这模拟了「先打开后关闭」的栈式管理。

## 十、Demo 4:自定义上下文管理器

\`\`\`python
# 演示自定义上下文管理器的几种实现方式

# === 方式 1:类实现 __enter__/__exit__ ===
class DatabaseConnection:
    """模拟数据库连接的上下文管理器"""
    
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None
    
    def __enter__(self):
        print(f"  [DB] 连接到数据库 {self.db_name}")
        # 模拟建立连接
        self.connection = {"db": self.db_name, "connected": True}
        return self.connection    # 返回连接对象
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"  [DB] 异常退出,执行回滚: {exc_val}")
        else:
            print(f"  [DB] 正常退出,执行提交")
        # 模拟关闭连接
        if self.connection:
            self.connection["connected"] = False
            print(f"  [DB] 连接已关闭")
        return False    # 不吞异常

# 使用
print("=== 方式 1: 类实现 ===")
with DatabaseConnection("mydb") as conn:
    print(f"  使用连接: {conn}")
    # 模拟查询
    print(f"  执行查询...")

# 异常情况
print("\\n--- 异常情况 ---")
try:
    with DatabaseConnection("mydb") as conn:
        raise RuntimeError("查询失败")
except RuntimeError as e:
    print(f"外层捕获: {e}")

# === 方式 2:用 @contextmanager 装饰器 ===
from contextlib import contextmanager

@contextmanager
def db_connection(db_name):
    """用生成器实现的数据库连接上下文管理器"""
    print(f"  [DB2] 连接到数据库 {db_name}")
    connection = {"db": db_name, "connected": True}
    try:
        yield connection    # 把 connection 赋给 as 后的变量
        # 下面是正常退出(__exit__ 无异常分支)
        print(f"  [DB2] 正常退出,执行提交")
    except Exception as e:
        # 异常分支
        print(f"  [DB2] 异常退出,执行回滚: {e}")
        raise    # 重新抛出,让外层捕获
    finally:
        # 无论是否异常,都关闭连接
        connection["connected"] = False
        print(f"  [DB2] 连接已关闭")

print("\\n=== 方式 2: 装饰器实现 ===")
with db_connection("mydb2") as conn:
    print(f"  使用连接: {conn}")
\`\`\`

**详解**:

- 这个 demo 展示了两种实现上下文管理器的方式,模拟了**数据库事务管理**的真实场景。
- **类方式**适合复杂逻辑,状态管理清晰,适合多次复用、配置复杂的场景。
- **装饰器方式**代码更简洁,适合简单的一次性场景。**注意必须用 try/finally 或 try/except 包住 yield**,否则异常会让清理代码不执行。
- 数据库事务的典型模式:
  - \`__enter__\`:开始事务
  - 正常退出:提交(commit)
  - 异常退出:回滚(rollback)
  - 无论是否异常:关闭连接
- 这个模式在 SQLAlchemy、Django ORM 里都能看到。

## 十一、Demo 5:contextmanager 装饰器示例

\`\`\`python
# 演示 @contextmanager 装饰器的几种实用场景

from contextlib import contextmanager
import time
import os

# === 场景 1:临时切换工作目录 ===
@contextmanager
def cd(path):
    """临时切换到指定目录,退出后恢复"""
    old_dir = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_dir)

# 使用
print("=== 场景 1: 临时切换目录 ===")
print(f"当前目录: {os.getcwd()}")

# 在子目录中执行代码
import tempfile
with tempfile.TemporaryDirectory() as tmpdir:
    with cd(tmpdir):
        print(f"  切换后: {os.getcwd()}")
        # 在这里创建文件会在 tmpdir 中
        with open("test.txt", "w") as f:
            f.write("hello")
        print(f"  tmpdir 下的文件: {os.listdir('.')}")
    # 退出后自动回到原目录
    print(f"  退出后: {os.getcwd()}")

# === 场景 2:临时修改全局配置 ===
@contextmanager
def temporary_setting(obj, attr, value):
    """临时修改对象属性,退出后恢复"""
    old_value = getattr(obj, attr)
    setattr(obj, attr, value)
    try:
        yield
    finally:
        setattr(obj, attr, old_value)

# 使用
import json
class Config:
    debug = False
    log_level = "INFO"

config = Config()
print("\\n=== 场景 2: 临时修改配置 ===")
print(f"原始: debug={config.debug}, log_level={config.log_level}")

with temporary_setting(config, "debug", True), \\
     temporary_setting(config, "log_level", "DEBUG"):
    print(f"  临时: debug={config.debug}, log_level={config.log_level}")
    # 在这里执行需要 debug 模式的代码

print(f"恢复: debug={config.debug}, log_level={config.log_level}")

# === 场景 3:计时器(返回耗时) ===
@contextmanager
def timed(name="block"):
    """计时并返回耗时(通过属性访问)"""
    class Result:
        elapsed = 0
    result = Result()
    start = time.time()
    try:
        yield result
    finally:
        result.elapsed = time.time() - start
        print(f"[{name}] 耗时 {result.elapsed:.4f}s")

print("\\n=== 场景 3: 计时器 ===")
with timed("求和") as t:
    total = sum(range(1000000))
    print(f"  求和完成: {total}")
print(f"  外部访问耗时: {t.elapsed:.4f}s")
\`\`\`

**详解**:

- \`@contextmanager\` 装饰器让上下文管理器的编写非常简洁——**任何需要「进入-操作-退出」模式的代码**都适合用它。
- 场景 1(临时切换目录)是 Linux 运维脚本的常见需求:进入某目录执行操作,然后回到原目录。
- 场景 2(临时修改配置)适合测试场景:临时改变全局配置,测试完恢复。比手动 \`save/set/restore\` 简洁得多。
- 场景 3(计时器)展示了如何通过 \`yield\` 的返回值传递信息——with 块内的代码可以通过 \`as\` 后的变量访问 \`result\`,在 with 块外也能读取 \`elapsed\`。

## 十二、Demo 6:contextlib 其他工具

\`\`\`python
# 演示 contextlib 模块的其他实用工具

import os
from contextlib import suppress, redirect_stdout, ExitStack
import io

# === 1. suppress: 忽略指定异常 ===
# 等价于 try/except/pass,但代码更简洁
print("=== suppress: 忽略异常 ===")

# 老写法
try:
    int("not a number")
except ValueError:
    pass    # 忽略

# 用 suppress 更优雅
with suppress(ValueError):
    int("not a number")
    # 如果抛 ValueError 会被吞掉
print("  ValueError 被忽略了")

# 可以同时忽略多种异常
with suppress(FileNotFoundError, PermissionError):
    os.remove("nonexistent_file.txt")
    # 文件不存在或没权限都不会报错
print("  文件删除异常被忽略了")

# === 2. redirect_stdout: 重定向标准输出 ===
print("\\n=== redirect_stdout: 重定向 stdout ===")

# 把 print 的输出捕获到字符串
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行不会显示在屏幕上")
    print("这行也不会")
    print("它们都被重定向到 buffer")

captured = buffer.getvalue()
print(f"捕获到的内容: {captured!r}")

# === 3. ExitStack: 动态管理多个上下文 ===
print("\\n=== ExitStack: 动态管理 ===")

# 当资源数量在运行时才知道时,用 ExitStack
files_to_open = ["a.txt", "b.txt", "c.txt"]

# 先创建测试文件
for name in files_to_open:
    with open(name, "w") as f:
        f.write(f"content of {name}")

# 用 ExitStack 动态打开多个文件
with ExitStack() as stack:
    files = [stack.enter_context(open(name)) for name in files_to_open]
    # 所有文件都会在退出时自动关闭
    for f, name in zip(files, files_to_open):
        print(f"  {name}: {f.read()!r}")

# 清理
import os
for name in files_to_open:
    os.remove(name)
\`\`\`

**详解**:

- \`contextlib.suppress(*exceptions)\`:**优雅地忽略指定异常**,替代 \`try/except/pass\` 三行写法。
- \`contextlib.redirect_stdout(target)\`:**重定向 \`print\` 输出**,常用于测试时捕获输出、把日志重定向到文件。
- \`contextlib.ExitStack\`:**动态管理多个上下文**——当资源数量在运行时才知道(比如用户传了一个文件列表),无法用静态的多 with 写法,这时用 ExitStack。
- 这些工具都建立在 \`__enter__/__exit__\` 协议之上,体现了「组合优于继承」的设计哲学。

## 十三、为什么生产代码必须用 with

总结 with 语句在生产代码中的不可替代性:

| 维度 | 裸 open/close | try/finally | with 语句 |
|------|--------------|------------|---------|
| 代码简洁度 | 简洁但危险 | 啰嗦(5-7 行) | 极简(2 行) |
| 异常安全 | ✗ 危险 | ✓ 安全 | ✓ 安全 |
| 可读性 | 一般 | 一般 | **优秀** |
| 忘记关的风险 | 高 | 低 | **零** |
| 多资源管理 | 难 | 啰嗦 | 优雅 |
| 标准库支持 | - | - | **全面** |

**生产铁律**:

1. **所有文件操作必须用 with**——这是 Python 社区的共识。
2. **所有数据库连接、网络连接、锁的获取**也应该用 with——任何需要「获取-释放」的资源都适合。
3. **第三方库对象**:如果有 \`__enter__/__exit__\` 就用 with;如果只有 \`close\`,用 \`contextlib.closing\`。
4. **代码审查**时看到裸的 \`open()\` 没 with,直接打回——这是代码规范的第一条。

## 十四、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| with 作用 | 无论是否异常,都自动释放资源 |
| 协议 | \`__enter__\` 进入 + \`__exit__\` 退出 |
| 多文件 with | \`with open(a) as fa, open(b) as fb:\` |
| 自定义 CM | 类实现 / \`@contextmanager\` 装饰器 |
| contextlib.closing | 为只有 close 的对象包装 |
| contextlib.suppress | 优雅忽略指定异常 |
| contextlib.ExitStack | 动态管理多个上下文 |
| 生产铁律 | **所有文件操作必须用 with** |

下一章我们深入对比文件读取的多种方式——read、readline、readlines、迭代,帮你选出最适合场景的方法。
`,
  },
  {
    id: "pyfile-read-methods",
    icon: "📖",
    title: "文件读取的多种方式:read/readline/readlines/迭代",
    group: "基础读写",
    content: `# 文件读取的多种方式:read/readline/readlines/迭代

## 一、四种读取方式总览

Python 提供了四种读取文件内容的方式,每种都有不同的适用场景。理解它们的差异,是写出高效、健壮代码的关键。

\`\`\`python
# 假设文件 demo.txt 内容:
# 第一行
# 第二行
# 第三行
# 第四行

# 方式 1:read() —— 一次性读取全部
with open("demo.txt", encoding="utf-8") as f:
    content = f.read()
# content = "第一行\\n第二行\\n第三行\\n第四行\\n"

# 方式 2:readline() —— 每次读一行
with open("demo.txt", encoding="utf-8") as f:
    line1 = f.readline()   # "第一行\\n"
    line2 = f.readline()   # "第二行\\n"
    # 继续读会得到 "第三行\\n", "第四行\\n"
    # 读到末尾返回 ""

# 方式 3:readlines() —— 读取所有行返回列表
with open("demo.txt", encoding="utf-8") as f:
    lines = f.readlines()
# lines = ["第一行\\n", "第二行\\n", "第三行\\n", "第四行\\n"]

# 方式 4:for line in f —— 直接迭代文件对象
with open("demo.txt", encoding="utf-8") as f:
    for line in f:
        # 第一次循环 line = "第一行\\n"
        # 第二次循环 line = "第二行\\n"
        # ...
        pass
\`\`\`

### 四种方式对比表

| 方式 | 返回类型 | 内存占用 | 何时返回 | 适用场景 |
|------|---------|---------|---------|---------|
| \`f.read()\` | str | 文件大小 | 立即 | 小文件,需整体处理 |
| \`f.read(size)\` | str | size 大小 | 立即 | 分块处理大文件 |
| \`f.readline()\` | str | 一行 | 立即 | 精细控制读取节奏 |
| \`f.readlines()\` | list[str] | 文件大小 | 立即 | 需随机访问行 |
| \`for line in f\` | str(迭代) | 一行 | 惰性 | **大文件,逐行处理** |

## 二、read():读取全部 / 读取指定字节数

\`\`\`python
# read() 不传参数:读取整个文件
with open("demo.txt", encoding="utf-8") as f:
    content = f.read()
print(content)
# 输出整个文件内容(一个字符串)

# read(size):读取指定字符数(文本模式)或字节数(二进制模式)
with open("demo.txt", encoding="utf-8") as f:
    # 文本模式下,size 是字符数(不是字节数!)
    first_5 = f.read(5)        # 读前 5 个字符
    next_5 = f.read(5)        # 接着读 5 个字符
print(f"前 5 字符: {first_5!r}")
print(f"接 5 字符: {next_5!r}")

# 读到 EOF 后再读,返回空字符串 ""
with open("demo.txt", encoding="utf-8") as f:
    f.read()                  # 读完全部
    rest = f.read()           # 再读,返回 ""
print(f"EOF 后读取: {rest!r}")  # ''
\`\`\`

**详解**:

- \`read()\` 不传参时**一次性读取整个文件**——简单直接,但**大文件慎用**!10GB 文件会让你的 Python 进程占用 10GB+ 内存。
- \`read(size)\` 读取指定数量,**注意文本模式下 size 是字符数不是字节数**。中文字符在 UTF-8 下占 3 字节,但 \`read(1)\` 仍然返回一个完整字符。
- \`read()\` 维护文件指针,多次调用会**接着上次的位置读**——这是实现「分块读取大文件」的关键。
- 读到文件末尾再读会返回 \`""\`(空字符串),这是判断 EOF 的标志(不是 \`None\` 也不是抛异常)。

## 三、readline():读取一行

\`\`\`python
# readline() 每次读取一行(包含末尾的 \\n)
with open("demo.txt", encoding="utf-8") as f:
    line1 = f.readline()
    line2 = f.readline()
    line3 = f.readline()
print(f"第 1 行: {line1!r}")   # '第一行\\n'
print(f"第 2 行: {line2!r}")   # '第二行\\n'
print(f"第 3 行: {line3!r}")   # '第三行\\n'

# 文件最后一行可能没有 \\n
# 此时 readline 返回的字符串末尾没有 \\n

# 读到 EOF 返回空字符串 ""
with open("demo.txt", encoding="utf-8") as f:
    while True:
        line = f.readline()
        if not line:    # 空字符串表示 EOF
            break
        print(f"读到: {line.rstrip()}")

# readline(size):最多读 size 个字符,但遇到换行就停
with open("demo.txt", encoding="utf-8") as f:
    # 即使指定 size,也会在 \\n 处停下
    line = f.readline(100)   # 最多读 100 字符,但实际只读到第一行末尾
    print(f"读到的行: {line!r}")
\`\`\`

**详解**:

- \`readline()\` 每次读取一行,**包含末尾的换行符 \`\\n\`**——只有最后一行可能没有 \`\\n\`(如果文件不以换行结尾)。
- 读到文件末尾返回 \`""\`(空字符串),这是判断 EOF 的方式。
- \`readline(size)\` 限制最多读多少字符,但**遇到换行符会立即停下**——不会跨行读。这适合读取「单行长度可控」的文件。
- \`readline()\` 适合**需要精细控制读取节奏**的场景:比如「读前 10 行检查文件头」「只读第一行判断文件类型」。

## 四、readlines():读取所有行返回列表

\`\`\`python
# readlines() 一次性读取所有行,返回列表
with open("demo.txt", encoding="utf-8") as f:
    lines = f.readlines()
print(type(lines))           # <class 'list'>
print(lines)                  # ['第一行\\n', '第二行\\n', '第三行\\n', '第四行\\n']

# 每个元素包含末尾的 \\n,需要自己处理
clean_lines = [line.rstrip("\\n") for line in lines]
print(clean_lines)            # ['第一行', '第二行', '第三行', '第四行']

# readlines(hint):限制读取的总字符数(粗略)
# 不是严格的字节数,而是「读到这个量级就停」
with open("demo.txt", encoding="utf-8") as f:
    lines = f.readlines(10)   # 读取约 10 字符就停
print(f"读到 {len(lines)} 行")

# 优势:可以随机访问任意行
with open("demo.txt", encoding="utf-8") as f:
    lines = f.readlines()
print(f"第 2 行: {lines[1].rstrip()}")   # 第二行
print(f"最后 1 行: {lines[-1].rstrip()}")
\`\`\`

**详解**:

- \`readlines()\` 把所有行读入一个 \`list\`,每个元素是一行(包含 \`\\n\`)。
- **优势**:返回列表后可以**随机访问任意行**(通过下标),适合需要多次访问不同行的场景。
- **劣势**:**大文件慎用**——所有行都读入内存,10GB 文件会让内存爆掉。
- \`readlines(hint)\` 的 \`hint\` 参数是「近似限制」——读到这个量级就停,但保证读到完整行。适合「我只要前几行,但不知道具体多少」。
- **常见坑**:很多人以为 \`readlines\` 会自动去掉 \`\\n\`,实际上**不会**!需要自己用 \`rstrip()\` 处理。

## 五、直接迭代文件对象:for line in f

\`\`\`python
# 直接 for 迭代文件对象,每次产出一行
# 这是 Python 最 Pythonic 的文件读取方式
with open("demo.txt", encoding="utf-8") as f:
    for line in f:
        # line 包含末尾的 \\n
        # 最后一次迭代可能没有 \\n
        process_line = line.rstrip()
        print(f"处理: {process_line}")

# 内存占用恒定:每次只在内存里保留一行
# 处理完就丢,适合大文件

# 配合 enumerate 获取行号
with open("demo.txt", encoding="utf-8") as f:
    for line_no, line in enumerate(f, start=1):
        print(f"行 {line_no}: {line.rstrip()}")

# 配合 zip 同时迭代多个文件
# (注意:zip 会以最短的为准)
with open("a.txt", encoding="utf-8") as fa, \\
     open("b.txt", encoding="utf-8") as fb:
    for line_a, line_b in zip(fa, fb):
        print(f"A: {line_a.rstrip()} | B: {line_b.rstrip()}")

# 也可以用 next() 手动获取下一行
with open("demo.txt", encoding="utf-8") as f:
    first = next(f)      # 获取第一行
    second = next(f)     # 获取第二行
    print(f"第一行: {first.rstrip()}")
    print(f"第二行: {second.rstrip()}")
\`\`\`

**详解**:

- \`for line in f\` 是**最 Pythonic 的读取方式**——代码简洁、内存高效、性能优秀。
- 文件对象实现了 \`__iter__\` 和 \`__next__\`,所以能直接 \`for\` 迭代,也能用 \`next()\` 手动取下一行。
- **内存优势**:惰性迭代,每次只在内存里保留一行,处理完就丢。**这是大文件处理的黄金法则**。
- 配合 \`enumerate(f)\` 获取行号,配合 \`zip(fa, fb)\` 并行迭代多个文件——优雅且高效。
- \`next(f)\` 在 EOF 时会抛 \`StopIteration\`,但 \`for\` 循环会自动处理这个异常,所以正常迭代不用关心。

## 六、各种方式的适用场景

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 读 1MB 以下小文件 | \`f.read()\` | 简单直接,性能最优 |
| 读取配置文件(行数少) | \`f.readlines()\` | 可以随机访问行 |
| 处理 10GB 日志文件 | \`for line in f\` | 内存恒定 |
| 只读文件第一行 | \`f.readline()\` | 不读全部,效率高 |
| 按字节分块处理 | \`f.read(chunk_size)\` | 灵活控制块大小 |
| 需要行号 | \`enumerate(f)\` | 内置,无额外开销 |
| 并行处理多个文件 | \`zip(fa, fb)\` | 简洁优雅 |

**经验法则**:

1. **默认用 \`for line in f\`**——这是最安全、最通用的方式,小文件大文件都能用。
2. 只有「文件确实很小且需要整体处理」时才用 \`read()\`。
3. 只有「需要随机访问行」时才用 \`readlines()\`。
4. 只有「需要精细控制读取节奏」时才用 \`readline()\`。

## 七、Demo 1:四种方式读取同一文件对比

\`\`\`python
# 准备测试文件
content = """第一行
第二行
第三行
第四行
第五行
"""
with open("compare.txt", "w", encoding="utf-8") as f:
    f.write(content)

# === 方式 1: read() ===
print("=== 方式 1: read() ===")
with open("compare.txt", encoding="utf-8") as f:
    text = f.read()
print(f"类型: {type(text).__name__}")   # str
print(f"内容: {text!r}")
print(f"长度: {len(text)} 字符")
# 整个文件是一个字符串,包含 \\n

# === 方式 2: readline() ===
print("\\n=== 方式 2: readline() ===")
with open("compare.txt", encoding="utf-8") as f:
    line1 = f.readline()
    line2 = f.readline()
    line3 = f.readline()
print(f"类型: {type(line1).__name__}")   # str
print(f"第 1 行: {line1!r}")
print(f"第 2 行: {line2!r}")
print(f"第 3 行: {line3!r}")
# 每次读一行,需要多次调用

# === 方式 3: readlines() ===
print("\\n=== 方式 3: readlines() ===")
with open("compare.txt", encoding="utf-8") as f:
    lines = f.readlines()
print(f"类型: {type(lines).__name__}")   # list
print(f"长度: {len(lines)} 行")
print(f"第 1 行: {lines[0]!r}")
# 返回列表,可随机访问

# === 方式 4: for line in f ===
print("\\n=== 方式 4: for line in f ===")
with open("compare.txt", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        print(f"  第 {i} 次迭代: {line!r}")
# 每次迭代产出一行,内存只占一行

import os
os.remove("compare.txt")
\`\`\`

**详解**:

- 这个 demo 用四种方式读取同一个文件,直观对比它们的差异。
- **\`read()\`**:返回**一个字符串**,内容是整个文件。
- **\`readline()\`**:返回**一个字符串**,内容是一行。需要多次调用才读完。
- **\`readlines()\`**:返回**一个列表**,每个元素是一行。
- **\`for line in f\`**:**惰性迭代**,每次产出一行,没有返回值。
- 选择哪种取决于你的需求:**整体处理用 read,逐行处理用迭代,需要随机访问用 readlines**。

## 八、Demo 2:read(size) 分块读取大文件

\`\`\`python
# 演示用 read(size) 分块处理大文件
# 适合「需要按字节处理」的场景,比如统计字符、查找模式

# 1. 生成一个大文件
import os
import random
with open("large.txt", "w", encoding="utf-8") as f:
    for _ in range(100000):
        # 每行写一段随机字符
        f.write("".join(random.choice("ABCDEFG") for _ in range(50)) + "\\n")

file_size = os.path.getsize("large.txt")
print(f"文件大小: {file_size / 1024:.1f} KB")

# 2. 错误方式:read() 一次性读入内存(大文件会爆)
# with open("large.txt", encoding="utf-8") as f:
#     content = f.read()   # 几 MB 还行,几 GB 就 OOM

# 3. 正确方式:read(chunk_size) 分块读取
def count_char_chunks(path, target_char):
    """分块统计某字符在文件中出现的次数"""
    count = 0
    chunk_size = 4096   # 4KB 一块
    with open(path, encoding="utf-8") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:    # 读到 EOF
                break
            count += chunk.count(target_char)
    return count

total_a = count_char_chunks("large.txt", "A")
print(f"字符 A 出现次数: {total_a}")

# 4. 分块查找子串(跨块查找更复杂,这里简化为块内查找)
def find_in_chunks(path, target):
    """分块查找子串,返回首次出现的字节位置"""
    chunk_size = 1024
    offset = 0
    with open(path, encoding="utf-8") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            pos = chunk.find(target)
            if pos != -1:
                return offset + pos
            offset += len(chunk)
    return -1

pos = find_in_chunks("large.txt", "ABC")
print(f"'ABC' 首次出现位置: {pos}")

os.remove("large.txt")
\`\`\`

**详解**:

- \`read(size)\` 是处理大文件的利器——**每次只读指定大小,内存占用恒定**。
- \`chunk_size\` 选择:4KB-64KB 是合理范围。太小 IO 调用多,太大占内存。
- Demo 演示了两个典型场景:**字符统计**和**子串查找**。
- **注意坑**:如果查找的子串跨越两个块的边界,简单的 \`chunk.find()\` 会漏掉。生产代码需要「保留上一块末尾几个字符,拼到下一块开头」——这是搜索引擎分词的常见技巧。

## 九、Demo 3:readline 逐行处理

\`\`\`python
# 演示 readline 的精细控制
# 适合「需要根据行内容决定下一步动作」的场景

# 准备一个模拟的配置文件
config_content = """# 应用配置文件
# 注释行以 # 开头

[database]
host = localhost
port = 5432
name = myapp

[cache]
enabled = true
ttl = 3600
"""
with open("config.ini", "w", encoding="utf-8") as f:
    f.write(config_content)

# 用 readline 实现简单的 ini 解析器
def parse_ini(path):
    """逐行解析简单的 ini 配置文件"""
    result = {}
    current_section = None
    
    with open(path, encoding="utf-8") as f:
        while True:
            line = f.readline()
            if not line:    # EOF
                break
            
            line = line.strip()
            # 跳过空行和注释
            if not line or line.startswith("#"):
                continue
            
            # 检测 section
            if line.startswith("[") and line.endswith("]"):
                current_section = line[1:-1]
                result[current_section] = {}
                continue
            
            # 解析 key = value
            if "=" in line and current_section:
                key, value = line.split("=", 1)
                result[current_section][key.strip()] = value.strip()
    
    return result

config = parse_ini("config.ini")
print("解析结果:")
import json
print(json.dumps(config, indent=2, ensure_ascii=False))

# 输出:
# {
#   "database": {"host": "localhost", "port": "5432", "name": "myapp"},
#   "cache": {"enabled": "true", "ttl": "3600"}
# }

import os
os.remove("config.ini")
\`\`\`

**详解**:

- \`readline()\` 适合**状态机式处理**——每读一行根据内容决定下一步动作。
- 这个 demo 实现了简化的 INI 解析器:
  - 遇到 \`[section]\` 进入新节
  - 遇到 \`key = value\` 加入当前节
  - 遇到 \`#\` 或空行跳过
- 用 \`readline\` 比 \`for line in f\` 更显式地控制流程——当你需要「读取一行后可能不读下一行」时,\`readline\` 更合适。
- 实际生产中,Python 自带 \`configparser\` 模块,功能更完善。但理解底层原理很重要。

## 十、Demo 4:文件迭代配合 enumerate

\`\`\`python
# 演示 for line in f 配合 enumerate 的实用场景

# 1. 准备日志文件
log_lines = [
    "2024-01-01 10:00:00 INFO  服务启动",
    "2024-01-01 10:00:01 INFO  数据库连接成功",
    "2024-01-01 10:00:05 ERROR 数据库查询失败",
    "2024-01-01 10:00:06 WARN  重试中...",
    "2024-01-01 10:00:10 ERROR 重试失败,服务退出",
]
with open("app.log", "w", encoding="utf-8") as f:
    f.writelines(line + "\\n" for line in log_lines)

# 2. 查找所有 ERROR 行及其行号
print("=== 查找所有 ERROR 行 ===")
with open("app.log", encoding="utf-8") as f:
    for line_no, line in enumerate(f, start=1):
        if "ERROR" in line:
            print(f"  行 {line_no}: {line.rstrip()}")

# 3. 查找 ERROR 前后各 1 行(上下文)
print("\\n=== ERROR 上下文 ===")
# 先把所有行读入列表(适合文件不大的情况)
with open("app.log", encoding="utf-8") as f:
    all_lines = f.readlines()

for i, line in enumerate(all_lines):
    if "ERROR" in line:
        print(f"--- 在第 {i+1} 行发现 ERROR ---")
        if i > 0:
            print(f"  上一行: {all_lines[i-1].rstrip()}")
        print(f"  当前行: {line.rstrip()}")
        if i + 1 < len(all_lines):
            print(f"  下一行: {all_lines[i+1].rstrip()}")

# 4. 提取前 N 行(类似 head 命令)
print("\\n=== 前 3 行 ===")
with open("app.log", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i >= 3:
            break
        print(f"  {line.rstrip()}")

# 5. 跳过前 N 行,处理剩余(类似 tail -n +N)
print("\\n=== 跳过前 2 行 ===")
with open("app.log", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i < 2:
            continue
        print(f"  {line.rstrip()}")

import os
os.remove("app.log")
\`\`\`

**详解**:

- \`enumerate(f, start=1)\` 是处理带行号场景的标准姿势——比手动维护计数器优雅得多。
- Demo 2 演示了「ERROR 上下文查看」,这是日志分析的常见需求。把所有行读入列表后,可以用下标访问前后行。
- Demo 4 模拟了 Linux 的 \`head -n 3\` 命令——用 \`enumerate\` + \`break\` 提前退出迭代。
- Demo 5 模拟了 \`tail -n +3\` 命令——跳过前 N 行,处理剩余。
- **性能提示**:第 3 步用 \`readlines\` 全量读入,只适合小文件。大文件需要更复杂的窗口算法。

## 十一、Demo 5:读取特定行

\`\`\`python
# 演示如何读取文件的特定行

# 准备测试文件
with open("lines.txt", "w", encoding="utf-8") as f:
    for i in range(1, 11):
        f.write(f"这是第 {i} 行\\n")

# === 方法 1: readlines + 下标(适合小文件) ===
with open("lines.txt", encoding="utf-8") as f:
    lines = f.readlines()
print(f"第 5 行: {lines[4].rstrip()}")    # 这是第 5 行
print(f"最后 1 行: {lines[-1].rstrip()}") # 这是第 10 行

# === 方法 2: 迭代到指定行(适合大文件,只读一次) ===
def get_line(path, target_line_no):
    """读取指定行号的行(从 1 开始)"""
    with open(path, encoding="utf-8") as f:
        for current_no, line in enumerate(f, start=1):
            if current_no == target_line_no:
                return line.rstrip()
            elif current_no > target_line_no:
                break
    return None   # 行号超出范围

print(f"\\n第 7 行: {get_line('lines.txt', 7)}")

# === 方法 3: 读取最后 N 行(类似 tail 命令) ===
from collections import deque
def tail(path, n=10):
    """读取文件最后 n 行,内存友好"""
    with open(path, encoding="utf-8") as f:
        # deque(maxlen=n) 只保留最后 n 个元素
        return list(deque(f, maxlen=n))

print("\\n最后 3 行:")
for line in tail("lines.txt", 3):
    print(f"  {line.rstrip()}")

# === 方法 4: 跳到文件末尾读取(二进制模式,适合超大文件) ===
import os
def tail_binary(path, n=10, chunk_size=4096):
    """二进制方式从末尾读取最后 n 行,适合超大文件"""
    with open(path, "rb") as f:
        f.seek(0, 2)   # 跳到末尾
        file_size = f.tell()
        
        lines = []
        position = file_size
        while position > 0 and len(lines) <= n:
            # 每次往前读一块
            read_size = min(chunk_size, position)
            position -= read_size
            f.seek(position)
            chunk = f.read(read_size).decode("utf-8", errors="ignore")
            lines = chunk.split("\\n") + lines[:-1] if lines else chunk.split("\\n")
        
        # 返回最后 n 行
        return lines[-n:] if len(lines) >= n else lines

print("\\n二进制 tail 最后 2 行:")
for line in tail_binary("lines.txt", 2):
    print(f"  {line.rstrip()}")

import os
os.remove("lines.txt")
\`\`\`

**详解**:

- 这个 demo 展示了 4 种读取特定行的方法,各有适用场景。
- **方法 1(\`readlines\`)**:简单粗暴,适合小文件。缺点是大文件会爆内存。
- **方法 2(迭代到指定行)**:只读必要的部分,适合大文件读单行。缺点是要读 N 次才能读第 N 行。
- **方法 3(\`deque\`)**:利用 \`collections.deque(maxlen=n)\` 的特性,**只保留最后 n 行**——这是 Python 实现 \`tail\` 命令最优雅的方式。
- **方法 4(二进制 seek)**:从文件末尾往前读,适合**超大文件**(\`tail\` 命令就是这么实现的)。逻辑复杂但内存高效。
- **生产建议**:小文件用方法 1/3,大文件用方法 4。

## 十二、Demo 6:内存占用对比说明

\`\`\`python
# 用 tracemalloc 实际测量不同读取方式的内存占用
import tracemalloc
import os

# 生成一个 5MB 的测试文件
def gen_test_file(path, size_mb=5):
    with open(path, "w", encoding="utf-8") as f:
        line = "x" * 100 + "\\n"   # 每行 101 字节
        lines_per_mb = 1024 * 1024 // 101
        for _ in range(lines_per_mb * size_mb):
            f.write(line)

gen_test_file("mem_test.txt", 5)
print(f"文件大小: {os.path.getsize('mem_test.txt') / 1024 / 1024:.1f} MB")

# 测量函数:返回峰值内存占用(KB)
def measure_memory(func, *args):
    tracemalloc.start()
    func(*args)
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return peak / 1024   # 转 KB

# 方式 1: read() 一次性读取
def read_all():
    with open("mem_test.txt", encoding="utf-8") as f:
        content = f.read()
        # 确保数据被使用
        _ = len(content)

# 方式 2: readlines() 一次性读取所有行
def read_all_lines():
    with open("mem_test.txt", encoding="utf-8") as f:
        lines = f.readlines()
        _ = len(lines)

# 方式 3: for 迭代(逐行处理)
def iterate():
    count = 0
    with open("mem_test.txt", encoding="utf-8") as f:
        for line in f:
            count += 1
    return count

# 方式 4: read(chunk) 分块
def read_chunks():
    total = 0
    with open("mem_test.txt", encoding="utf-8") as f:
        while True:
            chunk = f.read(4096)
            if not chunk:
                break
            total += len(chunk)
    return total

print("\\n=== 内存占用对比 ===")
print(f"read():        {measure_memory(read_all):>8.1f} KB")
print(f"readlines():   {measure_memory(read_all_lines):>8.1f} KB")
print(f"for 迭代:      {measure_memory(iterate):>8.1f} KB")
print(f"read(4096):    {measure_memory(read_chunks):>8.1f} KB")

os.remove("mem_test.txt")
\`\`\`

**详解**:

- 这个 demo 用 \`tracemalloc\` 实际测量不同读取方式的内存占用,数据胜过雄辩。
- 预期结果:
  - \`read()\` 和 \`readlines()\`:内存占用 ≈ 文件大小 × 2(字符串 + 列表开销)
  - \`for\` 迭代和 \`read(chunk)\`:内存占用恒定(几 KB,与文件大小无关)
- 5MB 文件的差异可能不明显,把文件调到 500MB 再试,差异会非常夸张。
- **生产经验**:处理用户上传的文件、处理日志、分析大数据,**永远默认用迭代或分块**——不要 \`read()\` 也不要 \`readlines()\`。
- 例外:配置文件、模板文件等明确知道很小的场景,用 \`read()\` 更简单。

## 十三、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| read() | 一次性读全部,**大文件慎用** |
| read(size) | 分块读取,内存恒定 |
| readline() | 每次读一行,适合精细控制 |
| readlines() | 返回列表,可随机访问行 |
| for line in f | **最 Pythonic,内存恒定** |
| enumerate(f) | 获取行号 |
| deque(f, maxlen=n) | 优雅实现 tail 命令 |
| 选择原则 | 默认迭代,小文件 read,需随机访问 readlines |

下一章我们讨论文件写入的最佳实践——如何安全、高效地写文件。
`,
  },
  {
    id: "pyfile-write-best-practice",
    icon: "✍️",
    title: "文件写入的最佳实践",
    group: "基础读写",
    content: `# 文件写入的最佳实践

## 一、write() vs writelines():容易踩的坑

Python 文件写入有两个核心方法,但它们的行为容易让人误解:

\`\`\`python
# write():写入一个字符串,返回写入的字符数
with open("demo.txt", "w", encoding="utf-8") as f:
    n = f.write("hello\\n")
    print(f"写入了 {n} 个字符")   # 6

# writelines():批量写入一个可迭代对象
# 注意:不会自动加换行!这是最容易踩的坑
words = ["apple", "banana", "cherry"]
with open("demo.txt", "w", encoding="utf-8") as f:
    f.writelines(words)
# 文件内容:applebananacherry(三行挤成一行!)

# 正确用法:自己加换行符
with open("demo.txt", "w", encoding="utf-8") as f:
    f.writelines(word + "\\n" for word in words)
# 文件内容:
# apple
# banana
# cherry
\`\`\`

### write() vs writelines() 对比

| 特性 | write() | writelines() |
|------|---------|-------------|
| 接受参数 | str / bytes | 可迭代对象(每个元素是 str/bytes) |
| 返回值 | 写入的字符数 | None |
| 自动换行 | 否 | **否** |
| 适用场景 | 写单段内容 | 批量写入多行 |
| 性能 | 单次调用 | 批量调用,性能更好 |

**核心认知**:\`writelines\` 这个名字极具误导性——它**不会**自动加换行!正确理解是「批量 write」,等同于循环调用 \`write\`。如果你想要每行一个元素,必须自己在每个元素末尾加 \`\\n\`。

## 二、文本写入的缓冲机制:flush() 的作用

Python 的文件写入**不是立即落盘**的——为了性能,数据会先进入**内存缓冲区**,等缓冲区满了或文件关闭时才真正写入磁盘。

\`\`\`text
[程序调用 f.write("hello")]
       ↓
[数据进入内存缓冲区]   ← 这里还没到磁盘!
       ↓
[缓冲区满 OR 调用 flush OR 调用 close]
       ↓
[数据真正写入磁盘]
\`\`\`

这个机制带来一个**严重问题**:如果程序在 \`write\` 后、\`close\` 前崩溃,缓冲区里的数据**会丢失**!

\`\`\`python
# 演示缓冲机制
f = open("buffer.txt", "w", encoding="utf-8")
f.write("第一行数据")
# 此时数据可能还在缓冲区,没真正写到磁盘
# 如果程序在这里崩溃,数据可能丢失!

# 解决方案 1:调用 flush 强制写入
f.flush()
# 现在数据确定已经在磁盘上了

f.write("第二行数据")
f.close()    # close 内部也会调用 flush

# 解决方案 2:用 with 语句(推荐)
with open("buffer.txt", "w", encoding="utf-8") as f:
    f.write("第一行数据")
    f.write("第二行数据")
    # 退出 with 块时自动 close,自动 flush
\`\`\`

### 何时需要手动 flush

| 场景 | 是否需要 flush |
|------|---------------|
| 普通文件写入 | 否,with 会处理 |
| 实时日志(程序崩溃也要看到日志) | **是**,每次写完 flush |
| 长时间运行的程序定期保存 | **是** |
| 多进程共享文件 | **是** |
| 普通配置文件写入 | 否 |

## 三、'w' 覆盖 vs 'a' 追加 vs 'x' 排他创建

三种写入模式行为对比:

\`\`\`python
# === w 模式:覆盖写入(危险!) ===
# 文件存在 → 清空后写入
# 文件不存在 → 创建新文件
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("新内容")
# 如果 test.txt 原本有 1GB 数据,现在只剩"新内容"三个字!

# === a 模式:追加写入(安全) ===
# 文件存在 → 在末尾追加
# 文件不存在 → 创建新文件
with open("test.txt", "a", encoding="utf-8") as f:
    f.write("追加的内容")
# 原有内容保留,新内容加在末尾

# === x 模式:排他创建(最安全) ===
# 文件存在 → 抛 FileExistsError
# 文件不存在 → 创建新文件
try:
    with open("test.txt", "x", encoding="utf-8") as f:
        f.write("新文件内容")
except FileExistsError:
    print("文件已存在!拒绝覆盖")
# 适合「绝对不能覆盖已有文件」的场景
\`\`\`

### 三种模式对比表

| 模式 | 文件存在 | 文件不存在 | 指针位置 | 适用场景 |
|------|---------|----------|---------|---------|
| \`w\` | **清空后写** | 创建 | 开头 | 重新生成文件 |
| \`a\` | 末尾追加 | 创建 | **末尾** | 日志、追加数据 |
| \`x\` | **报错** | 创建 | 开头 | 防止误覆盖 |

**生产建议**:

1. **日志文件用 \`a\`**——追加模式,不会丢失历史日志。
2. **生成报表用 \`w\`**——每次重新生成,旧数据无所谓。
3. **重要数据用 \`x\`**——绝对不能覆盖,出错立即报警。
4. **慎用 \`w\`**!它会在打开瞬间清空文件,即使你后来不写任何内容,文件也空了。

## 四、写入性能:批量写入优于单行写入

每次调用 \`write()\` 都有 IO 开销,**批量写入性能远优于循环单行写入**:

\`\`\`python
import time

# 准备 10 万行数据
data = [f"行 {i}: 这是一些测试数据\\n" for i in range(100000)]

# === 方式 1:循环单行写入(慢) ===
start = time.time()
with open("slow.txt", "w", encoding="utf-8") as f:
    for line in data:
        f.write(line)    # 每行一次 IO 调用
slow_time = time.time() - start
print(f"循环写入: {slow_time:.3f}s")

# === 方式 2:writelines 批量写入(快) ===
start = time.time()
with open("fast.txt", "w", encoding="utf-8") as f:
    f.writelines(data)   # 一次性写入所有行
fast_time = time.time() - start
print(f"批量写入: {fast_time:.3f}s")

# === 方式 3:拼成大字符串后一次写入(最快) ===
start = time.time()
with open("fastest.txt", "w", encoding="utf-8") as f:
    f.write("".join(data))   # 拼接后一次写入
fastest_time = time.time() - start
print(f"拼接写入: {fastest_time:.3f}s")

print(f"\\n批量比循环快 {slow_time / fast_time:.1f} 倍")

import os
for name in ["slow.txt", "fast.txt", "fastest.txt"]:
    os.remove(name)
\`\`\`

**详解**:

- **批量写入比循环写入快 5-10 倍**——IO 调用次数是性能瓶颈。
- \`writelines(data)\` 等同于 \`for line in data: f.write(line)\`,但内部优化了 IO 调用。
- \`write("".join(data))\` 是最快的——只调用一次 \`write\`,一次 IO。
- **生产建议**:有大量数据要写时,**先收集到列表,最后一次性 writelines 或 join + write**。
- 注意:数据量太大时(几百 MB),\`"".join(data)\` 会占用大量内存——这时还是用 \`writelines\` 更稳妥。

## 五、安全写入模式:先写临时文件再 rename

直接用 \`w\` 模式写文件有一个**致命问题**:如果写到一半程序崩溃,原文件已经被清空,新数据只写了一半——**原文件和目标文件都坏了**!

\`\`\`text
[原文件: 1GB 重要数据]
       ↓
[用 w 模式打开 → 文件瞬间清空!]
       ↓
[开始写入新数据...]
       ↓
[写到一半,程序崩溃/断电]
       ↓
[文件状态:旧数据全没了,新数据只有一半 → 数据全毁!]
\`\`\`

### 安全写入模式:原子替换

\`\`\`python
# 安全写入模式:先写临时文件,写完后原子替换
import os

def safe_write(path, content):
    """安全写入文件,保证不会因为崩溃导致数据损坏
    
    策略:先写到临时文件,写完后用 rename 原子替换原文件
    """
    # 1. 先写到同目录下的临时文件
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(content)
        # 确保 flush 到磁盘
        f.flush()
        os.fsync(f.fileno())   # 强制刷到物理磁盘
    
    # 2. 用 rename 原子替换原文件
    # rename 在同一文件系统下是原子操作——要么成功要么失败,不会出现"一半旧一半新"
    os.rename(tmp_path, path)
    # 此时要么原文件完整,要么新文件完整,绝不会损坏

# 测试
safe_write("important.txt", "这是重要数据")
print("写入完成")

# 验证
with open("important.txt", encoding="utf-8") as f:
    print(f"内容: {f.read()}")

import os
os.remove("important.txt")
\`\`\`

**详解**:

- **问题场景**:你要更新一个 1GB 的数据库文件,用 \`w\` 模式打开瞬间文件清空,写了一半程序崩了——**原文件和新文件都损坏**,数据丢失。
- **安全模式**:先写到临时文件(\`*.tmp\`),写完后用 \`os.rename\` **原子替换**原文件。
- \`os.rename\` 在同一文件系统下是**原子操作**——要么成功(原文件变成新文件),要么失败(原文件不变),**不会出现「一半旧一半新」的损坏状态**。
- \`os.fsync(fd)\` 强制把缓冲区数据刷到**物理磁盘**(不只是 OS 缓存),防止断电丢数据。
- **生产应用**:数据库的 WAL、配置文件更新、日志轮转——都用这种「临时文件 + rename」模式。
- Linux 的 \`mv\` 命令、Git 的对象存储底层也是这个原理。

## 六、使用 print 函数写入文件:file 参数

\`print()\` 函数有一个 \`file\` 参数,可以直接把输出重定向到文件:

\`\`\`python
# print 默认输出到 stdout(屏幕)
print("hello")   # 屏幕上显示 hello

# 用 file 参数重定向到文件
with open("print.txt", "w", encoding="utf-8") as f:
    print("第一行", file=f)    # 写入文件,自动加换行
    print("第二行", file=f)
    print("第三行", file=f)
# 不需要手动加 \\n,print 自动加!

# 验证
with open("print.txt", encoding="utf-8") as f:
    print(f.read())
# 输出:
# 第一行
# 第二行
# 第三行

# print 的其他参数也都有用
with open("log.txt", "w", encoding="utf-8") as f:
    # sep:多个参数之间的分隔符(默认空格)
    print("2024-01-01", "INFO", "服务启动", sep=" | ", file=f)
    # end:行尾结束符(默认 \\n)
    print("处理中...", end="\\r", file=f)
    # flush:是否立即刷新(默认 False)
    print("关键日志", file=f, flush=True)   # 立即落盘

import os
os.remove("print.txt")
os.remove("log.txt")
\`\`\`

**详解**:

- \`print(..., file=f)\` 是 Python 写文件的**便捷方式**——自动加换行、自动处理多参数。
- \`sep\` 参数控制多个参数之间的分隔符(默认空格),适合生成 CSV、日志格式化。
- \`end\` 参数控制行尾符(默认 \`\\n\`),可以用来覆盖同一行(\`end="\\r"\`)。
- \`flush=True\` 立即把数据刷到磁盘,适合「关键日志必须立即落盘」的场景。
- **vs write() 的区别**:
  - \`print\` 自动加换行,\`write\` 不加
  - \`print\` 接受多个参数,\`write\` 只接受一个字符串
  - \`print\` 自动调用 \`str()\` 转换,\`write\` 需要手动 \`str()\`
  - \`print\` 性能略差(有额外格式化开销),大量写入用 \`write\` 更好

## 七、Demo 1:writelines 加换行的正确姿势

\`\`\`python
# 演示 writelines 的正确用法

# === 错误用法:不加换行 ===
words = ["apple", "banana", "cherry", "date"]
with open("wrong.txt", "w", encoding="utf-8") as f:
    f.writelines(words)
# 文件内容:applebananacherrydate(挤在一起!)

with open("wrong.txt", encoding="utf-8") as f:
    print(f"错误写法结果: {f.read()!r}")

# === 正确用法 1:用列表推导加换行 ===
with open("right1.txt", "w", encoding="utf-8") as f:
    f.writelines([word + "\\n" for word in words])
# 文件内容:apple\\nbanana\\ncherry\\ndate\\n

with open("right1.txt", encoding="utf-8") as f:
    print(f"正确写法 1: {f.read()!r}")

# === 正确用法 2:用生成器表达式(更省内存) ===
with open("right2.txt", "w", encoding="utf-8") as f:
    f.writelines(word + "\\n" for word in words)
# 效果与上面相同,但不会创建中间列表

# === 正确用法 3:用 map 函数 ===
with open("right3.txt", "w", encoding="utf-8") as f:
    f.writelines(map(lambda w: w + "\\n", words))

# === 正确用法 4:用 print 函数(最直观) ===
with open("right4.txt", "w", encoding="utf-8") as f:
    for word in words:
        print(word, file=f)   # 自动加换行

# 验证所有正确写法结果一致
import filecmp
for name in ["right1.txt", "right2.txt", "right3.txt", "right4.txt"]:
    if filecmp.cmp("right1.txt", name):
        print(f"{name}: 内容一致 ✓")
    else:
        print(f"{name}: 内容不一致 ✗")

# 清理
import os
for name in ["wrong.txt", "right1.txt", "right2.txt", "right3.txt", "right4.txt"]:
    os.remove(name)
\`\`\`

**详解**:

- 这个 demo 展示了 4 种「正确加换行」的方式,结果都一样。
- **列表推导** \`[word + "\\n" for word in words]\`:创建新列表,内存占用 = 列表大小。
- **生成器表达式** \`(word + "\\n" for word in words)\`:惰性求值,不创建中间列表,内存更省。
- **map 函数**:函数式风格,效果同列表推导。
- **print 函数**:最直观,但性能稍差(每次调用都有额外开销)。
- **生产建议**:小数据用任意方式,大数据用生成器表达式(\`writelines(gen)\`)。

## 八、Demo 2:flush 立即生效演示

\`\`\`python
# 演示 flush 让数据立即落盘
import os
import time

# === 场景 1:不 flush,数据在缓冲区 ===
f = open("no_flush.txt", "w", encoding="utf-8")
f.write("第一行")
# 此时去检查文件,可能还看不到内容!
# (因为数据还在内存缓冲区,没写到磁盘)

# 模拟另一个进程读这个文件
# 实际上,如果立即读,可能读到空内容
time.sleep(0.1)
with open("no_flush.txt", encoding="utf-8") as reader:
    content = reader.read()
print(f"未 flush 时读到: {content!r}")   # 可能是 '' 或 '第一行'
# 取决于 OS 和 Python 缓冲策略

f.write("第二行")
f.close()    # close 时才 flush
# 现在 close 了,数据确定在磁盘上

with open("no_flush.txt", encoding="utf-8") as reader:
    print(f"close 后读到: {reader.read()!r}")

# === 场景 2:用 flush 强制立即写入 ===
f = open("with_flush.txt", "w", encoding="utf-8")
f.write("第一行")
f.flush()    # 强制刷到磁盘
# 此时数据确定已经在磁盘上了

with open("with_flush.txt", encoding="utf-8") as reader:
    print(f"flush 后读到: {reader.read()!r}")   # '第一行'

f.write("第二行")
f.flush()
with open("with_flush.txt", encoding="utf-8") as reader:
    print(f"再次 flush 后: {reader.read()!r}")   # '第一行第二行'

f.close()

# === 场景 3:实时日志的典型用法 ===
log_file = open("app.log", "a", encoding="utf-8")
def log(msg):
    """实时日志:每条都 flush,确保崩溃时也能看到"""
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_file.write(f"[{timestamp}] {msg}\\n")
    log_file.flush()    # 关键!立即落盘

log("服务启动")
log("处理请求 1")
log("处理请求 2")
# 即使程序在这里崩溃,日志已经写入了

log_file.close()

# 查看日志
with open("app.log", encoding="utf-8") as f:
    print(f"日志内容:\\n{f.read()}")

import os
for name in ["no_flush.txt", "with_flush.txt", "app.log"]:
    os.remove(name)
\`\`\`

**详解**:

- 这个 demo 演示了 \`flush()\` 的核心价值——**让数据立即落盘**,而不是等到缓冲区满或 close。
- **场景 1**:不 flush 时,数据在内存缓冲区,其他进程读文件可能读不到。
- **场景 2**:flush 后,数据确定写到磁盘,其他进程立即可见。
- **场景 3**:实时日志的典型用法——每条日志都 flush,即使程序崩溃,日志也已落盘。
- **代价**:每次 flush 都有 IO 开销,频繁 flush 会影响性能。生产日志通常用「批量 flush」(攒一批再 flush)或「定时 flush」(每隔几秒 flush 一次)。

## 九、Demo 3:w/a/x 模式对比

\`\`\`python
# 系统对比 w/a/x 三种写入模式的行为
import os

# 准备一个有内容的文件
with open("mode_test.txt", "w", encoding="utf-8") as f:
    f.write("原始内容\\n")
print("初始文件内容:原始内容")

# === 1. w 模式:覆盖写入 ===
print("\\n=== w 模式 ===")
with open("mode_test.txt", "w", encoding="utf-8") as f:
    f.write("w 模式写入\\n")
# 文件被清空后写入新内容
with open("mode_test.txt", encoding="utf-8") as f:
    print(f"结果: {f.read()!r}")   # 'w 模式写入\\n'
# 原始内容没了!

# === 2. a 模式:追加写入 ===
print("\\n=== a 模式 ===")
with open("mode_test.txt", "a", encoding="utf-8") as f:
    f.write("a 模式追加\\n")
# 原有内容保留,新内容加在末尾
with open("mode_test.txt", encoding="utf-8") as f:
    print(f"结果: {f.read()!r}")
# 'w 模式写入\\na 模式追加\\n'

# === 3. x 模式:排他创建 ===
print("\\n=== x 模式(文件已存在) ===")
try:
    with open("mode_test.txt", "x", encoding="utf-8") as f:
        f.write("这行不会写入")
except FileExistsError:
    print("✓ 文件已存在,x 模式拒绝覆盖")

# x 模式用于创建新文件
print("\\n=== x 模式(文件不存在) ===")
new_file = "new_file.txt"
if os.path.exists(new_file):
    os.remove(new_file)
try:
    with open(new_file, "x", encoding="utf-8") as f:
        f.write("新创建的文件\\n")
    print("✓ 新文件创建成功")
except FileExistsError:
    print("文件已存在")

# 再次尝试 x 模式创建同一文件
print("\\n=== 再次尝试 x 创建同一文件 ===")
try:
    with open(new_file, "x", encoding="utf-8") as f:
        f.write("不会被写入")
except FileExistsError:
    print("✓ 第二次创建失败(预期行为)")

# === 4. a 模式的指针行为 ===
print("\\n=== a 模式指针在末尾 ===")
with open("mode_test.txt", "a", encoding="utf-8") as f:
    print(f"打开后指针位置: {f.tell()}")   # 文件末尾
    f.seek(0)    # 试图移到开头
    print(f"seek(0) 后位置: {f.tell()}")   # 0
    f.write("a 模式即使 seek 也在末尾写")
    # 但写入仍然在末尾!
with open("mode_test.txt", encoding="utf-8") as f:
    print(f"结果: {f.read()!r}")

# 清理
os.remove("mode_test.txt")
os.remove(new_file)
\`\`\`

**详解**:

- 这个 demo 系统对比了 \`w\`/\`a\`/\`x\` 三种模式的行为差异。
- **\`w\` 模式**:打开瞬间清空文件,从开头写。适合「重新生成」。
- **\`a\` 模式**:不清空,在末尾追加。适合「日志、追加数据」。
- **\`x\` 模式**:文件存在就报错,不存在才创建。适合「绝对不能覆盖」。
- **\`a\` 模式的坑**:即使 \`seek(0)\` 移到开头,写入也强制在末尾——这是 OS 级别的保证,Python 无法绕过。
- **生产建议**:
  - 日志文件用 \`a\`
  - 生成报表用 \`w\`
  - 重要数据用 \`x\`(配合 try/except 处理已存在情况)
  - **永远慎用 \`w\`**——它会瞬间清空文件,即使你后来不写任何内容!

## 十、Demo 4:批量写入性能对比

\`\`\`python
# 系统对比不同写入方式的性能差异
import time
import os

# 准备测试数据:10 万行
N = 100000
data = [f"行 {i}: 这是第 {i} 条测试数据,用于性能对比。\\n" for i in range(N)]

def benchmark(name, func):
    """执行基准测试并报告耗时"""
    start = time.time()
    func()
    elapsed = time.time() - start
    print(f"{name:30s}: {elapsed:.3f}s")
    return elapsed

# === 方式 1:循环 write(最慢) ===
def write_loop():
    with open("t1.txt", "w", encoding="utf-8") as f:
        for line in data:
            f.write(line)

# === 方式 2:writelines(快) ===
def write_writelines():
    with open("t2.txt", "w", encoding="utf-8") as f:
        f.writelines(data)

# === 方式 3:join + write(最快) ===
def write_join():
    with open("t3.txt", "w", encoding="utf-8") as f:
        f.write("".join(data))

# === 方式 4:print 循环(最慢,有额外开销) ===
def write_print():
    with open("t4.txt", "w", encoding="utf-8") as f:
        for line in data:
            print(line, end="", file=f)

# === 方式 5:writelines + 生成器(省内存) ===
def write_generator():
    with open("t5.txt", "w", encoding="utf-8") as f:
        f.writelines(line for line in data)

print(f"数据量: {N} 行,约 {len(''.join(data)) / 1024:.0f} KB\\n")
t1 = benchmark("循环 write", write_loop)
t2 = benchmark("writelines", write_writelines)
t3 = benchmark("join + write", write_join)
t4 = benchmark("print 循环", write_print)
t5 = benchmark("writelines + 生成器", write_generator)

print(f"\\n最快 vs 最慢: {t4 / t3:.1f} 倍差距")

# 验证所有文件内容一致
import filecmp
all_same = all(filecmp.cmp("t1.txt", f"t{i}.txt") for i in range(2, 6))
print(f"所有文件内容一致: {all_same}")

# 清理
for i in range(1, 6):
    os.remove(f"t{i}.txt")
\`\`\`

**详解**:

- 这个 demo 用 \`time.time()\` 实测 5 种写入方式的性能。
- **预期结果**:
  - \`join + write\` 最快(一次 IO 调用)
  - \`writelines\` 第二快(批量调用,内部优化)
  - \`writelines + 生成器\` 略慢于直接 writelines(生成器有额外开销)
  - 循环 \`write\` 较慢(多次 IO 调用)
  - \`print\` 循环最慢(每次 print 有格式化开销)
- **性能差距**:最快和最慢通常差 3-10 倍,数据量越大越明显。
- **生产建议**:
  - 小数据(几 KB)随意,可读性优先
  - 大数据(几 MB 以上)用 \`writelines\` 或 \`join + write\`
  - 内存敏感场景(数据来自生成器)用 \`writelines(gen)\`

## 十一、Demo 5:安全写入(临时文件+rename)

\`\`\`python
# 完整的安全写入实现 + 崩溃测试
import os
import tempfile

def atomic_write(path, content, encoding="utf-8"):
    """原子写入文件:先写临时文件,再 rename 替换
    
    保证:要么文件完整更新,要么完全不变,绝不会损坏
    """
    # 关键:临时文件必须与目标文件在同一文件系统(同目录)
    # 否则 rename 会变成 "复制+删除",失去原子性
    dir_name = os.path.dirname(path) or "."
    
    # 用 tempfile 在同目录创建临时文件
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix=".tmp_")
    try:
        with os.fdopen(fd, "w", encoding=encoding) as f:
            f.write(content)
            f.flush()              # 刷到 OS 缓冲区
            os.fsync(f.fileno())   # 强制刷到物理磁盘
        
        # 原子替换:rename 在同文件系统下是原子的
        os.replace(tmp_path, path)   # replace 跨平台兼容性更好
        print(f"  ✓ 原子写入完成: {path}")
    except Exception:
        # 出错时清理临时文件
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise

# === 测试 1:正常写入 ===
print("=== 测试 1:正常写入 ===")
atomic_write("safe.txt", "这是安全写入的内容\\n")
with open("safe.txt", encoding="utf-8") as f:
    print(f"读取: {f.read()!r}")

# === 测试 2:模拟写入中途崩溃 ===
print("\\n=== 测试 2:模拟崩溃 ===")
# 先写入初始内容
atomic_write("crash.txt", "原始内容\\n")

# 模拟更新时崩溃(用 w 模式会损坏文件)
# 用安全写入则不会损坏
try:
    # 这里故意抛异常,模拟崩溃
    raise RuntimeError("模拟崩溃!")
    atomic_write("crash.txt", "新内容")   # 不会执行
except RuntimeError as e:
    print(f"  捕获异常: {e}")

# 检查文件是否完好
with open("crash.txt", encoding="utf-8") as f:
    content = f.read()
print(f"  崩溃后文件内容: {content!r}")
# 用安全写入,文件仍然是 "原始内容\\n",没被损坏!

# === 测试 3:对比 w 模式的危险 ===
print("\\n=== 测试 3:对比 w 模式的危险 ===")
# 用 w 模式「更新」文件,中途崩溃
with open("danger.txt", "w", encoding="utf-8") as f:
    f.write("原始内容\\n")

# 模拟 w 模式写入崩溃
f = open("danger.txt", "w", encoding="utf-8")
# 注意:w 模式打开瞬间文件已被清空!
f.write("新内容")   # 只写了一部分
# 模拟崩溃:不 close,直接「挂掉」
# 实际中可能是异常、断电、kill -9
del f   # 模拟崩溃,不 close

with open("danger.txt", encoding="utf-8") as f:
    print(f"  w 模式崩溃后: {f.read()!r}")
# 文件可能只有 "新内容"(没换行),原始内容没了
# 如果写得更少,可能完全是空的!

# 清理
os.remove("safe.txt")
os.remove("crash.txt")
os.remove("danger.txt")
\`\`\`

**详解**:

- 这个 demo 完整演示了「原子写入」模式,并对比了 \`w\` 模式的危险。
- **\`atomic_write\` 函数的核心步骤**:
  1. 用 \`tempfile.mkstemp\` 在**同目录**创建临时文件(保证同文件系统)
  2. 写入数据后 \`flush\` + \`os.fsync\` 强制落盘
  3. 用 \`os.replace\` 原子替换原文件(\`replace\` 比 \`rename\` 跨平台更好)
  4. 异常时清理临时文件
- **测试 2**:即使更新时崩溃,原文件保持不变——这是「原子性」的核心价值。
- **测试 3**:用 \`w\` 模式更新文件,中途崩溃——原文件清空了,新数据只有一半,**数据损坏**。
- **生产应用**:
  - 数据库的 WAL(write-ahead log)
  - 配置文件更新(避免更新失败导致配置损坏)
  - 日志轮转(避免轮转时丢日志)
  - 任何「绝对不能损坏」的文件更新

## 十二、Demo 6:print 写入文件

\`\`\`python
# 演示 print 函数写入文件的各种用法

# === 1. 基本用法:print + file 参数 ===
print("=== 1. 基本 print 写入 ===")
with open("basic.txt", "w", encoding="utf-8") as f:
    print("第一行", file=f)
    print("第二行", file=f)
    print("第三行", file=f)
# print 自动加换行,不需要手动 \\n

with open("basic.txt", encoding="utf-8") as f:
    print(f.read())

# === 2. sep 参数:生成 CSV ===
print("=== 2. 用 print 生成 CSV ===")
users = [
    ("张三", 25, "北京"),
    ("李四", 30, "上海"),
    ("王五", 28, "广州"),
]
with open("users.csv", "w", encoding="utf-8") as f:
    # 用 sep="," 生成 CSV
    print("name,age,city", file=f)   # 表头
    for name, age, city in users:
        print(name, age, city, sep=",", file=f)

with open("users.csv", encoding="utf-8") as f:
    print(f.read())

# === 3. end 参数:控制行尾 ===
print("=== 3. 用 end 控制行尾 ===")
with open("custom_end.txt", "w", encoding="utf-8") as f:
    # 默认 end="\\n",可以改成别的
    print("第一部分", end=" | ", file=f)
    print("第二部分", end=" | ", file=f)
    print("第三部分", end="\\n", file=f)
    # 文件内容:第一部分 | 第二部分 | 第三部分

# Windows 风格换行
with open("crlf.txt", "w", encoding="utf-8", newline="") as f:
    print("第一行", end="\\r\\n", file=f)
    print("第二行", end="\\r\\n", file=f)

with open("crlf.txt", "rb") as f:
    print(f"CRLF 文件字节: {f.read()!r}")

# === 4. flush 参数:实时日志 ===
print("=== 4. 实时日志 with flush ===")
import datetime
with open("realtime.log", "a", encoding="utf-8") as log_f:
    for i in range(3):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        # flush=True 让每条日志立即落盘
        print(f"[{timestamp}] 处理任务 {i}", file=log_f, flush=True)
        # 即使程序在这里崩溃,日志也已写入

with open("realtime.log", encoding="utf-8") as f:
    print(f.read())

# === 5. print 写入多个字段(自动 str 转换) ===
print("=== 5. print 自动转换类型 ===")
with open("mixed.txt", "w", encoding="utf-8") as f:
    # print 自动调用 str() 转换,write 需要手动
    print("字符串", 42, 3.14, True, [1, 2, 3], file=f)
    # 不需要 str(42) 这种手动转换

with open("mixed.txt", encoding="utf-8") as f:
    print(f"内容: {f.read()!r}")

# === 6. 重定向 stdout 到文件(整个程序输出) ===
print("=== 6. 重定向整个 stdout ===")
from contextlib import redirect_stdout
import io

buffer = io.StringIO()
with redirect_stdout(buffer):
    # 这块代码的所有 print 都不会显示,而是写入 buffer
    print("这行不显示在屏幕")
    print("这行也不显示")
    print("它们都被捕获了")

captured = buffer.getvalue()
print(f"捕获到的内容: {captured!r}")

# 清理
import os
for name in ["basic.txt", "users.csv", "custom_end.txt", 
             "crlf.txt", "realtime.log", "mixed.txt"]:
    if os.path.exists(name):
        os.remove(name)
\`\`\`

**详解**:

- 这个 demo 展示了 \`print\` 函数写入文件的各种高级用法。
- **基本用法**:\`print(..., file=f)\` 直接写入文件,自动加换行。
- **生成 CSV**:用 \`sep=","\` 自动加分隔符,比手动拼接字符串更优雅。
- **控制行尾**:\`end\` 参数可以自定义行尾符,支持生成 CRLF 文件、不分行的连续输出。
- **实时日志**:\`flush=True\` 让每条日志立即落盘,适合「崩溃也要看到日志」的场景。
- **自动类型转换**:\`print\` 会自动调用 \`str()\`,可以直接传整数、浮点、列表等,\`write\` 则需要手动转换。
- **stdout 重定向**:用 \`contextlib.redirect_stdout\` 可以捕获整个代码块的输出,常用于测试。

## 十三、本章小结

| 知识点 | 关键内容 |
|--------|---------|
| write() vs writelines() | writelines **不自动加换行**,需自己加 |
| 缓冲机制 | 数据先入内存缓冲区,flush/close 才落盘 |
| flush() | 强制立即落盘,适合实时日志 |
| w/a/x 模式 | w 清空、a 追加、x 排他创建 |
| 批量写入 | writelines/join 比 for write 快 5-10 倍 |
| 安全写入 | 临时文件 + rename,保证原子性 |
| print(file=f) | 自动加换行、自动 str 转换、支持 sep/end |
| os.fsync | 强制刷到物理磁盘,防断电丢数据 |

## 十四、文件写入生产建议清单

1. **永远用 with 语句**——保证文件关闭,避免资源泄漏。
2. **永远显式 encoding="utf-8"**——避免跨平台乱码。
3. **大量数据用 writelines**——比循环 write 快数倍。
4. **关键数据用安全写入**——临时文件 + rename,防止崩溃损坏。
5. **实时日志要 flush**——每条日志立即落盘,崩溃也能查。
6. **日志文件用 a 模式**——追加模式,不丢历史。
7. **重要文件用 x 模式**——排他创建,防止误覆盖。
8. **慎用 w 模式**——它会瞬间清空文件,即使你不写任何内容。

掌握这些最佳实践,你就能写出**安全、高效、健壮**的文件写入代码。第一批「基础读写」章节到此结束,后续批次将深入「高级技巧」「目录操作」「异常处理」等主题。
`,
  },
];
