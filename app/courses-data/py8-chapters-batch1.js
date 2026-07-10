// =============================================================
// py8-chapters-batch1.js
// 模块：环境与入门（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-intro",
    group: "环境与入门",
    icon: "🐍",
    title: "Python 简介与发展历史",
    content: `## Python 是什么

Python 是一门**高级、解释型、跨平台**的编程语言，由荷兰人 Guido van Rossum（吉多·范罗苏姆）于 1989 年圣诞节假期开始设计，1991 年正式对外发布。Python 的名字来源于他喜欢的英国喜剧《Monty Python's Flying Circus》，**与"蟒蛇"无关**。

### Python 的核心设计哲学

- **简单**：语法接近自然语言，读起来像英文
- **明确**：用缩进表示代码块，强制写出整洁代码
- **优雅**：提供"Pythonic"风格，用最简洁的方式表达想法
- **可读性优先**：代码被读的次数远多于被写的次数

### Python 的主要特点

| 特点 | 说明 |
|------|------|
| 解释型 | 无需编译，写完即运行，开发效率高 |
| 动态类型 | 变量无需声明类型，赋值即定义 |
| 强类型 | 不会隐式转换不兼容类型（如 \`"3" + 5\` 报错） |
| 跨平台 | Windows / macOS / Linux 通用 |
| 多范式 | 面向对象、函数式、过程式都支持 |
| 生态丰富 | 标准库庞大 + 海量第三方库 |

### Python 的发展历程

- **1991**：Python 0.9.0 发布
- **2000**：Python 2.0 引入垃圾回收和 Unicode
- **2008**：Python 3.0 不兼容升级，全面转向 Unicode
- **2020**：Python 2 官方停止维护
- **2024+**：Python 3.13 / 3.14 持续演进，自由线程逐步稳定，JIT 编译器优化

### Python 能做什么

| 领域 | 代表库 |
|------|--------|
| Web 后端 | Django, Flask, FastAPI |
| 数据分析 | Pandas, NumPy |
| 人工智能 | PyTorch, TensorFlow |
| 爬虫 | Scrapy, BeautifulSoup |
| 自动化运维 | Ansible, Fabric |
| 桌面 GUI | Tkinter, PyQt |
| 科学计算 | SciPy, Matplotlib |

### 一个直观对比

下面用 Python 和 Java 都打印一句话，感受 Python 的简洁：

\`\`\`python
# Python - 一行
print("你好，Python！")  # print() 内置函数，把字符串输出到屏幕
\`\`\`

\`\`\`java
// Java - 需要 class 和 main 方法
public class Main {
    public static void main(String[] args) {
        System.out.println("你好，Java！");
    }
}
\`\`\`

> 💡 本教程全程通过 \`python3\` 子进程执行真实代码，你可以自由修改后运行，观察结果。

下面的 demo 演示 Python 的基本输出与计算能力，让你对 Python 有个直观印象。`,
    code: `# ==========================================
# 第一个 Python 程序：认识 Python 的能力
# ==========================================

# print() 是内置函数，把内容输出到屏幕
# 括号里用引号包裹的是"字符串"（文本）
print("你好，Python！这是我的第一行代码")

# 一行可以打印多个值，默认用空格分隔
print("我", "正在", "学习", "Python")

# Python 的数学计算非常直观
print()
print("--- 数学计算 ---")
print("加法 100 + 200 =", 100 + 200)   # + 加
print("减法 500 - 150 =", 500 - 150)   # - 减
print("乘法 12 * 13  =", 12 * 13)      # * 乘
print("除法 100 / 3   =", 100 / 3)     # / 除（结果是小数）
print("整除 100 // 3  =", 100 // 3)    # // 整除（只取整数部分）
print("取余 100 % 3   =", 100 % 3)     # % 取余数
print("乘方 2 ** 10   =", 2 ** 10)     # ** 幂运算（2的10次方）

# 字符串可以用 + 拼接，用 * 重复
print()
print("--- 文本处理 ---")
greeting = "你好"          # 把"你好"放进变量 greeting
name = "小明"              # 把"小明"放进变量 name
print(greeting + "，" + name + "！")   # + 把字符串拼起来

# 字符串乘法：重复若干次
print("重要的事情说三遍：")
print("我爱Python  " * 3)             # 字符串 * 数字 = 重复

# sep 参数：自定义分隔符
print()
print("--- sep 与 end 参数 ---")
print("苹果", "香蕉", "橙子", sep=" | ")   # sep 指定分隔符
print("第一句", end=" → ")                  # end 指定结尾，默认是换行
print("第二句接在同一行")                    # 因为上一行没换行

# 打印一个漂亮的分隔线
print()
print("=" * 40)
print("  恭喜！你已经写下了第一段 Python 代码")
print("=" * 40)`
  },
  {
    id: "py8-install",
    group: "环境与入门",
    icon: "💻",
    title: "安装 Python 与验证环境",
    content: `## 安装 Python

### 第一步：检查是否已安装

打开终端（Windows 用 PowerShell / CMD，macOS 用 Terminal），输入：

\`\`\`bash
python3 --version   # 调用 python3 解释器，--version 输出版本号
\`\`\`

若输出类似 \`Python 3.14.0 或 Python 3.13.0\`，说明已安装。若提示"找不到命令"，需安装。

### 第二步：下载安装

- **官网**：https://www.python.org/downloads/
- 下载 3.12 及以上版本（推荐 3.13 或 3.14）
- **Windows 安装时务必勾选 "Add Python to PATH"**（否则命令行找不到 python）
- macOS 推荐用 Homebrew：\`brew install python\`
- Linux（Ubuntu）：\`sudo apt install python3 python3-pip\`

### 第三步：验证安装

\`\`\`bash
python3 --version   # 查看 Python 版本
pip3 --version      # 查看包管理器 pip 版本
\`\`\`

### Python 程序的两种运行方式

1. **交互模式**：终端输入 \`python3\` 进入 REPL，逐行执行
2. **脚本模式**：把代码写入 \`xxx.py\` 文件，\`python3 xxx.py\` 运行（推荐）

### 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| python 不是内部命令 | Windows 未加 PATH | 重装并勾选 Add to PATH |
| python 指向 Python 2 | 系统默认 | 改用 \`python3\` |
| 中文乱码 | 文件编码非 UTF-8 | 保存为 UTF-8 |
| pip 权限错误 | 系统目录只读 | 加 \`--user\` 或用虚拟环境 |

下面的 demo 用 Python 自带的 \`sys\`、\`platform\` 模块查看当前运行环境信息，帮你验证 Python 是否正常工作。`,
    code: `# 查看当前 Python 运行环境信息
import sys      # sys 模块提供解释器相关的变量和函数
import platform  # platform 模块提供操作系统平台信息

print("=" * 45)
print("        Python 环境信息一览")
print("=" * 45)

# sys.version：完整的 Python 版本字符串
print()
print("Python 版本字符串：", sys.version)

# sys.version_info：结构化版本信息（主版本.次版本.修订）
v = sys.version_info
print(f"结构化版本：{v.major}.{v.minor}.{v.micro}")  # f-string 格式化输出

# platform 模块获取操作系统
print()
print("操作系统：", platform.system())     # 如 Windows / Darwin(macOS) / Linux
print("系统版本：", platform.version())
print("处理器架构：", platform.machine())

# sys.executable：当前 Python 解释器的可执行文件路径
# 非常有用：判断代码在哪个 Python 里运行
print()
print("解释器路径：", sys.executable)

# sys.platform：简化的平台标识
print("平台标识：", sys.platform)

# 演示：判断当前系统
print()
print("--- 跨平台判断示例 ---")
if sys.platform == "win32":
    print("你在 Windows 上运行")
elif sys.platform == "darwin":
    print("你在 macOS 上运行")
else:
    print("你在 Linux/Unix 上运行")

print()
print("✅ 如果你能看到这些输出，说明 Python 环境工作正常！")`
  },
  {
    id: "py8-ide",
    group: "环境与入门",
    icon: "🛠️",
    title: "开发工具与 IDE 选择",
    content: `## 常用开发工具对比

| 工具 | 特点 | 适合人群 |
|------|------|----------|
| **VS Code** | 免费、轻量、插件丰富 | 大多数开发者（推荐） |
| **PyCharm** | 专业、智能、调试强大 | 专业 Python 工程师 |
| **Jupyter Notebook** | 逐单元格运行、可视化 | 数据分析、科研 |
| **Trae IDE** | AI 辅助编程 | 想提高效率的开发者 |
| **Sublime Text** | 极速、轻量 | 写小脚本 |

### VS Code 推荐插件

- **Python**（微软官方）：语法高亮、智能提示
- **Pylance**：类型检查、自动补全
- **Black Formatter**：代码自动格式化
- **indent-rainbow**：缩进彩虹，看层级更清楚

### PyCharm 的优势

- 开箱即用，无需配置插件
- 强大的调试器（断点、变量监视）
- 内置虚拟环境管理
- 重构功能完善

### Jupyter Notebook 的特色

- 把代码、文字、图表放在一个文档里
- 适合数据探索、教学、报告
- 扩展名 \`.ipynb\`，逐个单元格运行

### 项目结构示例

一个规范的 Python 项目目录：

\`\`\`
my_project/
├── my_package/        # 源码包
│   ├── __init__.py
│   └── main.py
├── tests/             # 测试
│   └── test_main.py
├── requirements.txt   # 依赖列表
├── README.md          # 项目说明
└── main.py            # 入口脚本
\`\`\`

下面的 demo 演示如何用 Python 写一个简单但规范的命令行工具，体验"代码 + 注释 + 函数"的组织方式。`,
    code: `# 一个规范的 Python 小工具示例
# 功能：根据用户输入的信息，生成自我介绍卡片

def make_card(name, age, skill):
    """生成自我介绍卡片字符串

    参数：
        name: 姓名
        age: 年龄
        skill: 技能
    返回：
        拼好的卡片文本
    """
    # 用列表收集每一行，最后用 join 拼接，比 + 更高效
    lines = []
    lines.append("+" + "-" * 30 + "+")
    lines.append("|" + "  自我介绍".center(28) + "|")
    lines.append("+" + "-" * 30 + "+")
    # f-string：在字符串里直接嵌入变量 {name}
    lines.append("|  姓名：" + name.ljust(22) + "|")
    lines.append("|  年龄：" + str(age).ljust(22) + "|")
    lines.append("|  技能：" + skill.ljust(22) + "|")
    lines.append("+" + "-" * 30 + "+")
    return "\\n".join(lines)   # 用换行符把各行连起来


# 主程序入口
if __name__ == "__main__":
    # 准备数据
    info = {
        "name": "小明",
        "age": 18,
        "skill": "Python"
    }

    # 调用函数生成卡片
    card = make_card(info["name"], info["age"], info["skill"])

    # 输出结果
    print(card)
    print()
    print("提示：这就是一个最简单的命令行工具结构")
    print("def 定义函数，if __name__ == '__main__' 作为入口")`
  },
  {
    id: "py8-runmain",
    group: "环境与入门",
    icon: "▶️",
    title: "运行方式与 __main__ 入口",
    content: `## 脚本是怎么运行的

Python 是**解释型语言**：解释器逐行读取源码、转换成字节码、执行。所以你修改完代码立刻能运行，无需编译。

### __name__ 与 __main__ 的含义

每个 Python 文件（模块）都有一个内置变量 \`__name__\`：

- 当文件被**直接运行**时：\`__name__\` 的值是 \`"__main__"\`
- 当文件被**导入**时：\`__name__\` 的值是**模块名**（文件名去掉 .py）

这个机制让我们可以区分"自己运行"和"被别人导入"两种情况：

\`\`\`python
def main():                       # 定义主函数 main，作为程序入口
    print("程序开始")              # 在控制台打印一行文字

# 只有直接运行本文件时才执行 main()
# 被导入时不执行，避免副作用
if __name__ == "__main__":        # 判断当前模块是否被直接运行
    main()                        # 调用主函数启动程序
\`\`\`

### 为什么需要这个判断

想象你写了一个工具模块 \`utils.py\`，里面有函数和测试代码：

- **直接运行** \`python3 utils.py\`：希望执行测试
- **被导入** \`import utils\`：希望只拿到函数，**不要**执行测试

\`if __name__ == "__main__"\` 就是这个开关，是 Python 项目的**标准入口写法**。

### 三种执行方式对比

\`\`\`bash
python3 script.py          # 运行脚本文件
python3 -c "print('hi')"   # 直接执行一行代码
python3 -m module_name     # 把模块当脚本运行
\`\`\`

下面的 demo 用一个文件同时演示"被导入"和"直接运行"两种 \`__name__\` 取值，注意观察输出差异。`,
    code: `# 演示 __name__ 的取值规律
# 这个文件无论是被导入还是直接运行，都能演示概念

print("=== 演示 __name__ 机制 ===")
print()

# 每个模块都有 __name__ 变量
# 直接运行本文件时，它的值是 "__main__"
# 被别人 import 时，它的值是模块名（这里是 py8_runmain 之类）
print("当前模块的 __name__ =", __name__)
print()

# 定义一个函数
def greet(name):
    """打招呼函数"""
    return f"你好，{name}！很高兴认识你。"

# 定义主函数：程序入口逻辑
def main():
    print(">>> 进入 main() 函数，说明本文件被直接运行")
    print(greet("世界"))
    print(greet("Python 学习者"))

# 关键：__name__ 判断
if __name__ == "__main__":
    # 只有直接运行才会执行
    main()
else:
    # 被导入时执行这里
    print(">>> 本模块被导入了，不执行 main()，但 greet 函数可用")

print()
print("无论哪种情况，greet 函数都已定义好，随时可调用")
print("调用 greet('测试')：", greet("测试"))`
  },
  {
    id: "py8-comments",
    group: "环境与入门",
    icon: "💬",
    title: "注释与代码规范 PEP 8",
    content: `## 注释的三种形式

### 1. 单行注释：\`#\`

\`\`\`python
# 这是注释，解释器会忽略
x = 10  # 行尾也可以写注释
\`\`\`

### 2. 多行注释：连续的 \`#\`

\`\`\`python
# 第一行注释
# 第二行注释
# 第三行注释
\`\`\`

### 3. 文档字符串（docstring）：三引号

\`\`\`python
def add(a, b):                  # 定义函数 add，接收两个参数 a 和 b
    """两数相加

    参数：
        a: 第一个数
        b: 第二个数
    返回：
        两数之和
    """
    return a + b                # 返回 a 加 b 的结果
\`\`\`

文档字符串可以**多行**，可用 \`help()\` 查看，是 Python 的官方注释方式。

## PEP 8 代码规范

PEP 8 是 Python 官方编码风格指南，遵循它能让代码更易读：

| 规范 | 推荐 | 不推荐 |
|------|------|--------|
| 缩进 | 4 个空格 | Tab |
| 行宽 | 不超过 79 字符 | 一行写很长 |
| 命名 | \`user_name\` 蛇形 | \`userName\` 驼峰 |
| 类名 | \`MyClass\` 驼峰 | \`my_class\` |
| 常量 | \`MAX_SIZE\` 全大写 | \`maxSize\` |
| 空行 | 函数间空 2 行，方法间空 1 行 | 全挤一起 |
| 空格 | \`x = a + b\` 运算符两侧 | \`x=a+b\` |
| 导入 | 分行导入 | \`import os, sys\` |

### 导入顺序

\`\`\`python
# 1. 标准库
import os          # 导入操作系统接口模块
import sys         # 导入系统相关变量和函数

# 2. 第三方库
import requests    # 导入 HTTP 请求库（需 pip install）
import numpy       # 导入数值计算库（需 pip install）

# 3. 本地模块
import my_utils    # 导入自己写的本地模块
\`\`\`

### 好注释 vs 坏注释

- ✅ 解释**为什么**这么写（业务原因）
- ✅ 标注复杂算法的思路
- ❌ 复述代码本身（\`x = x + 1  # x 加 1\` 是废话）

下面的 demo 综合演示注释用法和 PEP 8 规范的函数写法。`,
    code: `# PEP 8 规范示例文件
# 作者：py8 教程
# 说明：演示注释、docstring 和代码风格

import math


def calculate_bmi(weight, height):
    """计算身体质量指数 BMI

    BMI = 体重(kg) / 身高(m)^2
    用于粗略判断体重是否标准。

    参数：
        weight: 体重，单位千克
        height: 身高，单位米

    返回：
        bmi 值（浮点数，保留一位小数）
    """
    # 体重除以身高的平方
    bmi = weight / (height ** 2)
    # round 四舍五入到 1 位小数
    return round(bmi, 1)


def bmi_category(bmi):
    """根据 BMI 值返回健康分类

    参数：
        bmi: BMI 数值

    返回：
        分类描述字符串
    """
    if bmi < 18.5:
        return "偏瘦"
    elif bmi < 24:
        return "正常"
    elif bmi < 28:
        return "偏胖"
    else:
        return "肥胖"


def main():
    """主函数：演示完整流程"""
    # 测试数据
    people = [
        ("小明", 60, 1.75),
        ("小红", 90, 1.60),
        ("小刚", 45, 1.70),
    ]

    print("姓名    BMI    分类")
    print("-" * 25)
    for name, weight, height in people:
        bmi = calculate_bmi(weight, height)
        category = bmi_category(bmi)
        # ljust/rjust 控制对齐宽度
        print(name.ljust(6), str(bmi).ljust(6), category)


# 标准入口
if __name__ == "__main__":
    main()

# 还可以用 help() 查看 docstring（演示用）
print()
print("--- 查看 calculate_bmi 的文档 ---")
help(calculate_bmi)`
  },
  {
    id: "py8-io",
    group: "环境与入门",
    icon: "📥",
    title: "输入输出 input 与 print",
    content: `## print() 输出详解

\`print()\` 是最常用的输出函数，完整语法：

\`\`\`python
print(*objects, sep=' ', end='\\n', file=sys.stdout, flush=False)  # 完整签名：*objects 要打印的内容；sep 分隔符；end 结尾符；file 输出目标；flush 是否立即刷新
\`\`\`

| 参数 | 作用 | 默认值 |
|------|------|--------|
| \`*objects\` | 要打印的内容，可多个 | - |
| \`sep\` | 多个值之间的分隔符 | 空格 \`' '\` |
| \`end\` | 结尾字符 | 换行 \`'\\n'\` |
| \`file\` | 输出到哪里（文件/控制台） | \`sys.stdout\` |
| \`flush\` | 是否立即刷新 | \`False\` |

### 常用输出技巧

\`\`\`python
print("a", "b", "c")               # a b c
print("a", "b", "c", sep="-")      # a-b-c
print("不换行", end="")             # 后面继续接
print("拼在一起")  # 打印输出到屏幕
print("\\n")                        # 输出空行
print(f"{3.14159:.2f}")            # 3.14 保留两位小数
\`\`\`

## input() 输入

\`input()\` 从键盘读取一行，**返回值永远是字符串**：

\`\`\`python
name = input("请输入姓名：")       # input() 从键盘读取一行，返回字符串
age = input("请输入年龄：")        # 此时 age 是字符串 "18"，不是数字
# 注意：age 是字符串，要参与计算必须转换
age = int(age)  # 转成整数         # int() 把字符串转成整型，才能做数学运算
\`\`\`

### 输入数字的常见模式

\`\`\`python
# 安全转换：用户输入非数字时不崩溃
try:                                              # try 包裹可能出错的代码
    n = int(input("输入一个数："))                 # 把输入转成整数，可能抛 ValueError
except ValueError:                                 # 捕获转换失败的异常
    print("不是有效数字")                          # 给出友好的错误提示
\`\`\`

### 格式化输出三种方式

\`\`\`python
name, age = "小明", 18                              # 多重赋值，同时定义两个变量

# 方式1：% 占位符（老式）
print("我叫%s，今年%d岁" % (name, age))              # %s 字符串占位，%d 整数占位，% 后传入元组

# 方式2：str.format()
print("我叫{}，今年{}岁".format(name, age))           # {} 是占位符，按顺序填入 format 的参数

# 方式3：f-string（推荐，Python 3.6+）
print(f"我叫{name}，今年{age}岁")                    # f 前缀，{} 里直接写变量名或表达式
\`\`\`

> ⚠️ 本教程代码在沙箱中执行，\`input()\` 无法接收键盘输入（会立即返回空）。下面的 demo 用预设变量模拟输入，重点演示格式化输出技巧。`,
    code: `# print 与格式化输出完整演示

# 1. 基本输出
print("=== 1. 基本输出 ===")
print("Hello", "World")              # 默认空格分隔
print("Hello", "World", sep="")      # 无分隔
print("2024", "06", "30", sep="-")   # 用 - 连接日期
print("a", "b", "c", sep=" | ")      # 用竖线分隔

# 2. end 参数控制结尾
print()
print("=== 2. end 参数 ===")
print("加载中", end="")              # 不换行
for ch in "...":
    print(ch, end="")                # 接着打印，形成"加载中..."
print()                              # 最后补一个换行

# 3. 格式化数字
print()
print("=== 3. 数字格式化 ===")
pi = 3.14159265358979
print(f"圆周率 = {pi}")              # 默认精度
print(f"保留2位 = {pi:.2f}")          # .2f 两位小数
print(f"保留4位 = {pi:.4f}")          # .4f 四位小数
print(f"科学计数 = {pi:e}")           # e 科学计数法
print(f"百分比 = {0.856:.1%}")        # .1% 百分比一位小数
print(f"补零 = {42:05d}")             # 05d 总宽5不足补零 -> 00042
print(f"右对齐 = {42:>5}")            # >5 右对齐宽5
print(f"左对齐 = {42:<5}|")           # <5 左对齐宽5
print(f"居中 = {42:^5}|")             # ^5 居中宽5

# 4. 三种格式化方式对比
print()
print("=== 4. 三种格式化 ===")
name = "小明"
age = 18
score = 95.5

# 方式1：% 占位符
print("%%方式：%s 今年 %d 岁，成绩 %.1f" % (name, age, score))
# 方式2：format()
print("format方式：{} 今年 {} 岁，成绩 {:.1f}".format(name, age, score))
# 方式3：f-string
print(f"f-string：{name} 今年 {age} 岁，成绩 {score:.1f}")

# 5. f-string 进阶：表达式和调试
print()
print("=== 5. f-string 进阶 ===")
x = 10
y = 20
# 直接在 {} 里写表达式
print(f"{x} + {y} = {x + y}")
# Python 3.8+：{x=} 自动显示变量名和值
print(f"调试输出：{x=} {y=}")
# 列表直接展开
nums = [1, 2, 3]
print(f"列表 = {nums}, 长度 = {len(nums)}")

# 6. 模拟 input 流程（沙箱无法真输入，用变量代替）
print()
print("=== 6. 模拟输入处理 ===")
user_input = "  25  "          # 模拟用户输入（带空格）
cleaned = user_input.strip()    # strip 去掉首尾空格
age_num = int(cleaned)          # 转成整数
print(f"清理后：'{cleaned}'，转数字：{age_num}")
print(f"明年你 {age_num + 1} 岁")`
  },
  {
    id: "py8-argparse",
    group: "环境与入门",
    icon: "🎚️",
    title: "命令行参数 argparse",
    content: `## 为什么需要命令行参数

写好的脚本 \`.py\` 文件，希望像 \`ls -l\`、\`git commit -m\` 那样接受参数。Python 标准库 \`argparse\` 就是为此而生。

### 最简示例

\`\`\`python
import argparse                                       # 导入命令行参数解析模块

parser = argparse.ArgumentParser(description="计算器")  # 创建解析器，description 是帮助说明
parser.add_argument("x", type=int, help="第一个数")    # 添加位置参数 x，类型为整数
parser.add_argument("y", type=int, help="第二个数")    # 添加位置参数 y，类型为整数
args = parser.parse_args()                             # 解析命令行参数，返回命名空间对象
print(args.x + args.y)                                # 访问 args.x 和 args.y 并求和
\`\`\`

运行：\`python3 calc.py 3 5\` 输出 \`8\`。

### 常用参数类型

| 类型 | 写法 | 说明 |
|------|------|------|
| 位置参数 | \`add_argument("x")\` | 必填，按顺序 |
| 可选参数 | \`add_argument("-n", "--name")\` | 用 - 或 -- |
| 默认值 | \`default=10\` | 不传时使用 |
| 类型转换 | \`type=int\` | 自动转换 |
| 选项 | \`choices=["a","b"]\` | 只能选这些 |
| 布尔开关 | \`action="store_true"\` | 出现就是 True |
| 是否必填 | \`required=True\` | 必须提供 |

### 完整示例

\`\`\`python
parser.add_argument("-n", "--name", default="世界", help="名字")        # 可选参数 -n/--name，不传时默认"世界"
parser.add_argument("-v", "--verbose", action="store_true", help="详细模式")  # 布尔开关 -v，出现即为 True
\`\`\`

> ⚠️ 沙箱里 \`argparse\` 默认从命令行读参数会失败。下面的 demo 用 \`parse_args\` 传一个**模拟参数列表**，让你看到 argparse 的解析效果，无需命令行。

下面的 demo 展示 argparse 解析模拟参数的过程。`,
    code: `import argparse

# ============ 1. 基础用法 ============
def demo_basic():
    """最简单的 argparse：位置参数"""
    parser = argparse.ArgumentParser(description="加法计算器")
    parser.add_argument("x", type=int, help="第一个数")
    parser.add_argument("y", type=int, help="第二个数")
    # 关键：用 parse_args 传入模拟的参数列表（沙箱无法读命令行）
    args = parser.parse_args(["3", "5"])
    print(f"基础：{args.x} + {args.y} = {args.x + args.y}")


# ============ 2. 可选参数与默认值 ============
def demo_optional():
    parser = argparse.ArgumentParser(description="问候程序")
    # -n 短选项，--name 长选项，default 默认值
    parser.add_argument("-n", "--name", default="世界", help="要问候的名字")
    parser.add_argument("--count", type=int, default=1, help="重复次数")
    args = parser.parse_args(["-n", "小明", "--count", "3"])
    for _ in range(args.count):
        print(f"你好，{args.name}！")


# ============ 3. 布尔开关 action ============
def demo_flag():
    parser = argparse.ArgumentParser(description="详细模式开关")
    # action="store_true"：出现该参数就是 True，不出现是 False
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="开启详细输出")
    args = parser.parse_args(["-v"])
    if args.verbose:
        print("[详细] 详细模式已开启")
    else:
        print("普通模式")
    print("完成")


# ============ 4. choices 限制取值 ============
def demo_choices():
    parser = argparse.ArgumentParser(description="选择日志级别")
    parser.add_argument("--level", choices=["debug", "info", "warn", "error"],
                        default="info", help="日志级别")
    args = parser.parse_args(["--level", "warn"])
    print(f"当前日志级别：{args.level}")


# ============ 5. nargs 多个值 ============
def demo_nargs():
    parser = argparse.ArgumentParser(description="处理多个文件")
    # nargs="+"：至少一个，收集成列表
    parser.add_argument("files", nargs="+", help="要处理的文件")
    # nargs="?"：可选一个
    parser.add_argument("--output", nargs="?", const="out.txt",
                        help="输出文件")
    args = parser.parse_args(["a.txt", "b.txt", "c.txt", "--output"])
    print(f"要处理的文件：{args.files}")
    print(f"输出到：{args.output}")


# 主程序
print("=" * 40)
demo_basic()
print("-" * 40)
demo_optional()
print("-" * 40)
demo_flag()
print("-" * 40)
demo_choices()
print("-" * 40)
demo_nargs()
print("=" * 40)
print("提示：真实使用时去掉 parse_args 里的列表参数即可读命令行")`
  },
  {
    id: "py8-venv",
    group: "环境与入门",
    icon: "📦",
    title: "虚拟环境 venv 与 pip",
    content: `## 为什么要虚拟环境

不同项目可能需要**不同版本的库**：
- 项目 A 需要 \`requests 2.20\`
- 项目 B 需要 \`requests 2.31\`

如果都装在全局，会冲突。**虚拟环境**让每个项目有独立的依赖目录，互不干扰。

### 创建虚拟环境

\`\`\`bash
# 创建虚拟环境（在项目目录下）
python3 -m venv venv       # 用 venv 模块创建名为 venv 的虚拟环境目录

# 激活虚拟环境
# macOS / Linux:
source venv/bin/activate   # 执行激活脚本，修改 PATH 指向虚拟环境
# Windows:
venv\\Scripts\\activate      # Windows 下对应的激活脚本

# 激活后命令行前面会出现 (venv) 标志
# 此时 pip 安装的库只在这个环境里

# 退出虚拟环境
deactivate                 # 取消虚拟环境，回到全局 Python
\`\`\`

### pip 包管理器

\`\`\`bash
pip install requests           # 安装包
pip install requests==2.31.0   # 指定版本
pip install "requests>=2.30"   # 最低版本
pip uninstall requests         # 卸载
pip list                       # 列出已装包
pip freeze > requirements.txt  # 导出依赖
pip install -r requirements.txt # 批量安装
pip show requests              # 查看包详情
pip install --upgrade requests # 升级
\`\`\`

### requirements.txt 示例

\`\`\`
requests==2.31.0
flask>=2.3.0
numpy~=1.24.0   # 兼容版本
\`\`\`

### 国内加速源

\`\`\`bash
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

下面的 demo 用 Python 代码查看 \`sys.path\`（模块搜索路径），理解虚拟环境的本质——它就是改了搜索路径。`,
    code: `# 理解虚拟环境的本质：sys.path
import sys
import site

print("=" * 45)
print("    虚拟环境与模块搜索路径揭秘")
print("=" * 45)

# 1. sys.path：Python 查找模块的路径列表
# 虚拟环境激活后，列表前面会多出 venv 的目录
print()
print("=== sys.path 模块搜索路径 ===")
for i, p in enumerate(sys.path):
    if p:    # 跳过空字符串（当前目录）
        print(f"  [{i}] {p}")

# 2. sys.prefix：当前 Python 解释器的根目录
# 虚拟环境激活时，它指向 venv 目录
print()
print("=== 解释器根目录 ===")
print("sys.prefix =", sys.prefix)
print("sys.base_prefix =", sys.base_prefix)  # 基础 Python 根目录

# 判断是否在虚拟环境中
# 虚拟环境激活时 prefix != base_prefix
print()
if sys.prefix != sys.base_prefix:
    print("✅ 当前在虚拟环境中")
else:
    print("ℹ️  当前使用全局 Python（未激活虚拟环境）")

# 3. 模拟 pip 操作（演示用，不真装包）
print()
print("=== pip 常用命令演示（仅打印，不执行）===")
commands = [
    "pip install requests",                # 安装
    "pip install requests==2.31.0",        # 指定版本
    "pip install -r requirements.txt",     # 批量安装
    "pip list",                            # 列出已装
    "pip freeze > requirements.txt",      # 导出依赖
    "pip uninstall requests",              # 卸载
]
for cmd in commands:
    print(f"  $ {cmd}")

# 4. 模拟 requirements.txt 内容
print()
print("=== requirements.txt 示例内容 ===")
requirements = [
    "requests==2.31.0",
    "flask>=2.3.0",
    "numpy~=1.24.0",
    "pandas>=2.0",
]
for req in requirements:
    print(f"  {req}")

# 5. 用 pip 模块查看已安装的包（只读操作）
print()
print("=== 当前环境已安装的部分包 ===")
# 用 importlib 检查某些常用包是否已装
import importlib
packages = ["sys", "os", "json", "re", "datetime", "collections"]
for pkg in packages:
    try:
        mod = importlib.import_module(pkg)
        version = getattr(mod, "__version__", "内置（无版本号）")
        filepath = getattr(mod, "__file__", "内置模块（无文件路径）")
        print(f"  {pkg:12} -> {version}  [路径: {filepath}]")
    except ImportError:
        print(f"  {pkg:12} -> 未安装")`
  },
  {
    id: "py8-poetry",
    group: "环境与入门",
    icon: "📜",
    title: "poetry 与现代项目管理",
    content: `## poetry 是什么

\`poetry\` 是现代化的 Python 项目管理工具，集成了：

- **依赖管理**：自动管理虚拟环境和依赖
- **打包发布**：一键打包并发布到 PyPI
- **锁定文件**：\`poetry.lock\` 保证团队环境一致
- **项目元数据**：\`pyproject.toml\` 统一配置

### poetry vs pip + venv

| 对比项 | pip + venv | poetry |
|--------|-----------|--------|
| 虚拟环境 | 手动创建激活 | 自动管理 |
| 依赖文件 | requirements.txt | pyproject.toml |
| 锁定版本 | pip freeze | poetry.lock（更精确） |
| 项目结构 | 自由 | 标准化 |
| 发布打包 | setup.py | 内置命令 |

### 常用命令

\`\`\`bash
# 安装 poetry
curl -sSL https://install.python-poetry.org | python3 -  # 下载安装脚本并用 python3 执行

# 新建项目
poetry new my_project                          # 创建标准目录结构的新项目

# 在已有项目初始化
cd my_project
poetry init                                     # 交互式生成 pyproject.toml 配置文件

# 添加依赖
poetry add requests          # 添加生产依赖
poetry add pytest --group dev  # 添加开发依赖

# 安装项目依赖
poetry install                                 # 根据 pyproject.toml 安装所有依赖

# 在虚拟环境中运行命令
poetry run python main.py                       # 在 poetry 管理的虚拟环境里执行命令

# 进入虚拟环境 shell
poetry shell                                    # 激活虚拟环境的交互式 shell

# 打包发布
poetry build                                    # 打包成 wheel 和 sdist
poetry publish                                  # 发布到 PyPI（需账号）
\`\`\`

### pyproject.toml 示例

\`\`\`toml
[tool.poetry]
name = "my_project"
version = "0.1.0"
description = "我的项目"
authors = ["作者 <a@b.com>"]       # 作者列表，含邮箱

[tool.poetry.dependencies]
python = "^3.10"
requests = "^2.31.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
\`\`\`

下面的 demo 用 Python 读取并解析 \`pyproject.toml\` 配置文件，理解它的结构。`,
    code: `# 用 Python 解析 pyproject.toml 理解 poetry 项目结构
# Python 3.11+ 内置 tomllib，低版本可用 tomli

try:
    import tomllib          # Python 3.11+ 内置
except ModuleNotFoundError:
    # 低版本回退：自己简单解析（演示用）
    tomllib = None

# 模拟一个 pyproject.toml 文件内容
sample_toml = """
[tool.poetry]
name = "my_project"
version = "0.1.0"
description = "一个示例项目"
authors = ["小明 <xiaoming@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.10"
requests = "^2.31.0"
flask = "^3.0.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
black = "^24.0.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""

print("=" * 45)
print("   poetry 项目配置 pyproject.toml 解析")
print("=" * 45)

if tomllib:
    # 真正用 tomllib 解析
    config = tomllib.loads(sample_toml)
    print()
    print("✅ 使用内置 tomllib 解析成功")
else:
    # 低版本手动模拟解析结果（仅演示）
    print()
    print("ℹ️  当前 Python 版本较低，用模拟数据演示")
    config = {
        "tool": {
            "poetry": {
                "name": "my_project",
                "version": "0.1.0",
                "description": "一个示例项目",
                "dependencies": {"python": "^3.10", "requests": "^2.31.0"},
                "group": {"dev": {"dependencies": {"pytest": "^7.4.0"}}}
            }
        },
        "build-system": {"requires": ["poetry-core"]}
    }

# 打印解析结果
print()
print("=== 项目基本信息 ===")
poetry = config.get("tool", {}).get("poetry", {})
print(f"项目名：{poetry.get('name')}")
print(f"版本号：{poetry.get('version')}")
print(f"描述：{poetry.get('description')}")
print(f"作者：{poetry.get('authors')}")

print()
print("=== 生产依赖（运行时需要）===")
deps = poetry.get("dependencies", {})
for name, ver in deps.items():
    print(f"  {name:12} {ver}")

print()
print("=== 开发依赖（开发时才需要）===")
group = poetry.get("group", {})
dev_deps = group.get("dev", {}).get("dependencies", {})
for name, ver in dev_deps.items():
    print(f"  {name:12} {ver}")

print()
print("=== 构建系统 ===")
build = config.get("build-system", {})
print(f"  requires: {build.get('requires')}")

print()
print("💡 依赖版本符号含义：")
print("   ^3.10  -> 兼容版本 >=3.10, <4.0")
print("   ~2.31  -> 补丁版本 >=2.31, <3.0")
print("   ==2.31 -> 精确版本 2.31")
print("   >=2.30 -> 最低版本 2.30")`
  },
  {
    id: "py8-vars",
    group: "环境与入门",
    icon: "📦",
    title: "变量与赋值的本质",
    content: `## 变量是什么

变量是**贴在对象上的标签**。Python 的变量不"装"值，而是**指向**内存中的对象。

\`\`\`python
x = 10   # 在内存创建整数对象 10，把名字 x 贴到它上面
\`\`\`

这行做了两件事：
1. 在内存里创建一个整数对象 \`10\`
2. 把名字 \`x\` 贴到这个对象上

### 赋值运算符 \`=\`

注意 \`=\` 是**赋值**，不是数学的"等于"。判断相等用 \`==\`。

### Python 是动态类型

变量无需声明类型，还能随时改变类型：

\`\`\`python
a = 10        # 现在 a 是整数
a = "hello"   # a 变成字符串了，完全合法
\`\`\`

### 多重赋值

\`\`\`python
# 同时给多个变量赋值
x, y, z = 10, 20, 30    # 元组解包：右侧三个值依次赋给左侧三个变量

# 多个变量赋同一个值
a = b = c = 0           # 链式赋值：0 同时赋给 a、b、c

# 交换两个变量（Python 特色，不需要临时变量）
a, b = b, a             # 交换：右侧先组成元组再解包给左侧
\`\`\`

### 变量命名规则

- 只能含**字母、数字、下划线**
- **不能数字开头**（\`1name\` 错）
- 区分大小写（\`age\` ≠ \`Age\`）
- 不能用**关键字**（\`if\`、\`for\`、\`class\`）
- 推荐**蛇形命名** \`user_name\`（PEP 8 规范）

### 引用的本质：可变与不可变

\`\`\`python
a = [1, 2, 3]  # 创建列表对象
b = a          # b 和 a 指向同一个列表对象
b.append(4)    # 通过 b 往列表末尾添加元素 4
print(a)       # [1, 2, 3, 4]  a 也变了！
\`\`\`

这是初学者最常踩的坑：**可变对象**（列表、字典、集合）的赋值是共享引用，改一个会影响另一个。

### 用 id() 看对象身份

\`id()\` 返回对象在内存中的唯一标识（地址）：

\`\`\`python
a = 10                       # 创建整数对象 10，a 指向它
b = a                        # b 也指向同一个对象
print(id(a) == id(b))   # id() 返回内存地址，相等说明是同一个对象，结果为 True
\`\`\`

下面的 demo 用 \`id()\` 直观展示变量与对象的关系，把"引用"这个抽象概念可视化。`,
    code: `# 变量与赋值本质演示
print("=" * 45)
print("       变量与赋值的本质")
print("=" * 45)

# 1. 基本赋值
print()
print("=== 1. 基本赋值 ===")
name = "小明"
age = 18
height = 1.75
is_student = True
print(f"姓名 {name}，年龄 {age}，身高 {height}，学生？{is_student}")

# 2. 动态类型：变量可以改变类型
print()
print("=== 2. 动态类型 ===")
x = 100
print(f"x = {x}，类型 = {type(x).__name__}")
x = "现在是字符串"
print(f"x = {x}，类型 = {type(x).__name__}")
x = [1, 2, 3]
print(f"x = {x}，类型 = {type(x).__name__}")

# 3. 多重赋值
print()
print("=== 3. 多重赋值 ===")
a, b, c = 10, 20, 30
print(f"a={a} b={b} c={c}")
p = q = r = 0
print(f"p={p} q={q} r={r}")

# 4. 变量交换（Python 特色）
print()
print("=== 4. 变量交换 ===")
a, b = 1, 2
print(f"交换前：a={a} b={b}")
a, b = b, a          # 一行交换，无需临时变量
print(f"交换后：a={a} b={b}")

# 5. 引用本质：id() 查看对象身份
print()
print("=== 5. id() 查看对象身份 ===")
a = 100
b = a                # b 指向 a 的对象
c = 100              # c 是另一个相同值的对象（小整数缓存，可能同址）
print(f"a 的 id = {id(a)}")
print(f"b 的 id = {id(b)}")
print(f"c 的 id = {id(c)}")
print(f"a 和 b 是同一个对象吗？{id(a) == id(b)}")

# 6. 可变对象的共享引用陷阱
print()
print("=== 6. 可变对象共享引用（重要！）===")
list_a = [1, 2, 3]
list_b = list_a       # 赋值是共享引用
list_b.append(4)      # 通过 b 修改
print(f"list_a = {list_a}")    # a 也变了！
print(f"list_b = {list_b}")
print(f"两个列表是同一个对象吗？{id(list_a) == id(list_b)}")

# 7. 避免共享：拷贝
print()
print("=== 7. 用 copy 避免共享 ===")
import copy
list_x = [1, 2, 3]
list_y = list_x.copy()   # 浅拷贝，独立的新列表
list_y.append(99)
print(f"list_x = {list_x}")   # 不受影响
print(f"list_y = {list_y}")
print(f"是同一个对象吗？{id(list_x) == id(list_y)}")

# 8. 链式比较
print()
print("=== 8. 链式比较 ===")
n = 5
print(f"{n} 是否在 1~10 之间：{1 < n < 10}")   # Python 支持链式比较

# 9. 海象运算符 := （Python 3.8+）
print()
print("=== 9. 海象运算符 := ===")
# 在表达式里赋值，避免重复计算
data = [1, 2, 3, 4, 5]
if (n := len(data)) > 3:
    print(f"列表长度 {n}，超过3个元素")
# 等价于先 n = len(data) 再判断，但海象运算符更简洁`
  }
];
