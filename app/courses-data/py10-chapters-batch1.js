// =============================================================
// Python 从入门到精通大全（终极版）—— 第1批章节
// 开篇 + 第一部分 Python 入门基础（共 6 章）
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 前言：学习路线
  // -----------------------------------------------------------
  {
    id: "py10-preface",
    group: "开篇",
    icon: "📖",
    title: "前言与学习路线",
    content: `## 这是一本什么样的书

《Python 从入门到精通大全（终极版）》是一本**大而全**的 Python 参考书。它的目标只有一个：**覆盖日常开发 100% 的高频知识点**，让你从"完全没写过 Python"到"能独立用 Python 解决实际问题"。

市面上 Python 教程很多，但多数有两个问题：一是**太浅**，讲完 print 和 if 就结束了，真到写项目时发现啥也不会；二是**太散**，知识零散分布在不同文章里，缺乏体系。本书试图解决这两个痛点——**既深入又成体系**，每一章都讲透一个主题，章节之间循序渐进。

### 本书定位

- **不是**：给你一本"语法手册"让你死记硬背
- **是**：一本"边读边跑代码"的实战教程，每个知识点都配可运行 demo
- **目标**：读完能独立写脚本、做数据分析、搭 Web 后端、玩自动化

### 适用版本

本书基于 **Python 3.12+**（推荐 3.13 或 3.14）。Python 2 已于 2020 年停止维护，本教程**完全不涉及 Python 2**。部分章节会用到 3.10+ 的新特性（如 match-case、结构化模式匹配），3.12+ 的新特性（如更强大的 f-string、类型参数语法），都会明确标注版本要求。

## 这本书写给谁

| 读者类型 | 是否适合 | 建议 |
|----------|----------|------|
| 完全零基础新手 | ✅ 适合 | 从第一部分开始，每章 demo 都跑一遍 |
| 学过其他语言想转 Python | ✅ 适合 | 跳过基础语法，重点看 Python 特色（推导式、装饰器、asyncio） |
| 有 Python 基础想进阶 | ✅ 适合 | 直接看第七部分之后的面向对象、并发、异步 |
| 资深工程师当参考手册 | ✅ 适合 | 用目录当索引，按需查阅 |

## 学习路线建议

### 路线一：新手稳扎稳打（推荐）

按章节顺序从第一部分读到第十六部分。每章学完做小练习，每部分学完做综合实战。预计耗时 **3-6 个月**（每天 1 小时）。

### 路线二：快速入门（有编程基础）

跳过第一、二部分（基础语法），从第三部分流程控制开始。重点学：
- 第六部分：函数进阶（闭包、装饰器）
- 第七、八部分：面向对象
- 第十二、十三部分：并发与异步

预计耗时 **1-2 个月**。

### 路线三：按需查阅

直接用目录当索引，需要什么学什么。适合工作后当工具书。

## 全书目录结构

本书共 **16 个部分，80+ 章**，按以下结构组织：

| 部分 | 主题 | 章节范围 | 重点 |
|------|------|----------|------|
| 开篇 | 前言与学习路线 | 前言 | 整体认知 |
| 第一部分 | Python 入门基础 | ch01-ch05 | 环境、变量、运算符、字符串、IO |
| 第二部分 | 数据类型与字符串 | ch06-ch10 | 字符串方法、列表、元组、字典、集合 |
| 第三部分 | 流程控制 | ch11-ch15 | if、while、for、推导式、match-case |
| 第四部分 | 数据结构 | ch16-ch20 | 列表/字典/集合高级、collections |
| 第五部分 | 函数基础 | ch21-ch25 | 函数定义、参数、返回值、作用域 |
| 第六部分 | 函数进阶 | ch26-ch30 | 闭包、装饰器、匿名函数、递归 |
| 第七部分 | 面向对象基础 | ch31-ch35 | 类、对象、继承、多态 |
| 第八部分 | 面向对象进阶 | ch36-ch40 | 魔术方法、属性、元类、描述符 |
| 第九部分 | 异常处理 | ch41-ch45 | try/except、自定义异常、上下文管理 |
| 第十部分 | 文件 IO 与模块 | ch46-ch50 | 文件读写、pathlib、模块、包 |
| 第十一部分 | 装饰器与迭代器 | ch51-ch55 | 装饰器进阶、生成器、迭代器协议 |
| 第十二部分 | 并发编程 | ch56-ch60 | 多线程、多进程、GIL、线程同步 |
| 第十三部分 | 异步编程 asyncio | ch61-ch65 | async/await、事件循环、asyncio 实战 |
| 第十四部分 | 网络与数据库 | ch66-ch70 | socket、HTTP、SQLite、ORM |
| 第十五部分 | 测试与工程化 | ch71-ch75 | unittest、pytest、日志、打包 |
| 第十六部分 | 标准库与综合实战 | ch76-ch82 | 标准库精选、综合项目、面试题 |

## 如何使用本书

### 1. 边读边跑代码

每章都有大量 \`python\` 代码块，**点"运行"按钮**就能看到输出。不要光看不动手——读懂代码和"自己写出来"差着十万八千里。

### 2. 改一改再看

每段 demo 跑完后，**改几个数字、换几个变量名**，观察输出变化。这种"瞎折腾"恰恰是最好的学习方式。改错了不会坏电脑，放心玩。

### 3. 写注释

读到一段代码，试着**用自己的话写注释**——"这行在干嘛"。如果你写不出来，说明没真懂，回头再看。

### 4. 做练习

每章结尾的"小结"和"常见疑问"是复习材料。学完一部分后，尝试**不看教程**自己写一遍 demo 的功能。

## 三个学习心态

**心态一：错就是常态。** 资深程序员每天也在 Google、在试错。报错不是"你笨"，是解释器在帮你定位问题。学会看报错信息是编程的基本功。

**心态二：不必一次记住所有细节。** 编程知识密度大，第一遍读记住"有这个东西"就行，用到时回来查。本书的设计就是**可反复查阅**的。

**心态三：动手比看十遍有用。** 看十遍 \`print\` 的解释，不如自己敲一遍 \`print("hello")\` 看输出。**所有教程都无法替代你自己写代码的肌肉记忆**。

## 一段"快速体验"代码

在正式进入第一章之前，先用一段代码让你感受 Python 的简洁和强大。这段代码用了标准库 \`datetime\` 和 \`calendar\`，演示 Python "开箱即用"的特性——很多别的语言要装库才能做的事，Python 标准库就自带了。

\`\`\`python
# 演示：用 Python 标准库做一些日常小任务
# 不需要安装任何第三方库，开箱即用

import datetime          # 标准库：日期时间处理
import calendar          # 标准库：日历相关

# 1. 获取当前时间
now = datetime.datetime.now()    # now() 返回当前的日期时间对象
print("现在是：", now)             # 直接打印，格式清晰

# 2. 格式化日期
# strftime 用占位符把日期格式化成字符串
# %Y=年 %m=月 %d=日 %H=时 %M=分 %S=秒
formatted = now.strftime("%Y年%m月%d日 %H时%M分%S秒")
print("格式化后：", formatted)

# 3. 计算多少天后是星期几
# timedelta 表示时间差，days=100 表示 100 天
future = now + datetime.timedelta(days=100)
# weekday() 返回 0-6，0 是周一
weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
print("100 天后是：", future.strftime("%Y-%m-%d"), weekdays[future.weekday()])

# 4. 打印某年某月的日历
print()
print("2026 年 6 月的日历：")
print(calendar.month(2026, 6))    # 直接打印整月日历
\`\`\`

看到了吗？**没有一行配置、没有安装任何库**，直接就能处理日期、算星期、画日历。这就是 Python "标准库强大" 的体现——你日常 80% 的需求，标准库都覆盖了。

## 关于代码运行环境

本书所有代码都通过 \`python3\` 子进程执行，约束如下：

- **Python 版本**：3.12 及以上
- **超时时间**：10 秒（避免死循环卡死）
- **输出限制**：1MB（避免大量输出刷屏）
- **可用范围**：仅 Python 标准库，**不能安装第三方包**

这意味着你不能在 demo 里用 \`import numpy\` \`import requests\` 这类第三方库。但好消息是：**Python 标准库已经覆盖了绝大多数日常需求**——文件操作、网络请求（urllib）、JSON、正则、日期时间、多线程、数据库（sqlite3）……应有尽有。本书所有 demo 都只用标准库，让你学到的是"纯 Python 能力"，不依赖任何外部包。

## 写在最后

学编程是一场马拉松，不是短跑。**每天进步一点点，坚持半年，你会惊讶于自己的变化**。

准备好了吗？让我们从第一章开始——安装 Python，写下你的第一行代码。

\`\`\`python
# 这是你即将写下的第一行代码
print("你好，Python！我来了。")
\`\`\`

## 小结

- 本书定位为"大而全"的 Python 实战教程，基于 Python 3.12+
- 全书 16 个部分 80+ 章，从入门到综合实战全覆盖
- 学习方式：边读边跑代码，多改多试，动手比看十遍有用
- 三个心态：错是常态、不必一次记住、动手优先
- 代码运行环境：python3 子进程，仅标准库，10 秒超时，1MB 输出

## 常见疑问 Q&A

**Q：我完全没编程基础，能学会吗？**
A：能。Python 是公认最适合新手的语言，本书从"怎么安装"开始讲，不假设你有任何编程背景。坚持是关键。

**Q：学完这本书能找到工作吗？**
A：本书是"工具能力"的建立。找工作还需要项目经验、算法基础、面试准备。本书是必要条件，不是充分条件。

**Q：需要先学算法或数据结构吗？**
A：不需要。本书第四部分会讲数据结构基础，算法可以学完本书后再深入。先会用，再学原理。

**Q：Python 3.12 和 3.13 差别大吗？**
A：对你学习影响很小。本书标注了新特性版本要求，按推荐版本（3.13 或 3.14）安装即可。`
  },

  // -----------------------------------------------------------
  // 第一章：Python 环境与第一个程序
  // -----------------------------------------------------------
  {
    id: "py10-ch01",
    group: "第一部分 Python 入门基础",
    icon: "🚀",
    title: "第一章 Python 环境与第一个程序",
    content: `## 安装 Python

### 检查是否已安装

打开终端（Windows 用 PowerShell，macOS 用 Terminal），输入：

\`\`\`bash
python3 --version    # 查看 Python 版本
\`\`\`

如果输出类似 \`Python 3.13.0\`，说明已安装。如果提示"找不到命令"，需要按下面步骤安装。

### 各平台安装方法

| 平台 | 推荐方式 | 命令 |
|------|----------|------|
| **Windows** | 官网下载安装包 | python.org/downloads |
| **macOS** | Homebrew | \`brew install python\` |
| **Ubuntu/Debian** | apt 包管理器 | \`sudo apt install python3 python3-pip\` |
| **CentOS/RHEL** | yum/dnf | \`sudo dnf install python3\` |

### Windows 安装的关键一步

Windows 安装时**务必勾选 "Add Python to PATH"**。如果不勾选，命令行找不到 \`python3\` 命令，会报"不是内部或外部命令"。这是 Windows 新手最常见的坑。

### 验证安装

\`\`\`bash
python3 --version     # Python 版本
python3 -c "print('hello')"    # 直接执行一段代码
\`\`\`

## Python 程序的两种运行方式

### 方式一：交互式 REPL

终端输入 \`python3\` 进入 \`>>>\` 提示符环境，**输一行执行一行**，立刻看到结果：

\`\`\`
>>> 1 + 1
2
>>> print("hi")
hi
>>> exit()       # 退出
\`\`\`

**适合**：临时试一行代码、查函数用法。**不适合**：写完整程序（关掉窗口代码就没了）。

### 方式二：脚本文件

把代码写进 \`hello.py\` 文件，用 \`python3 hello.py\` 运行：

\`\`\`bash
python3 hello.py
\`\`\`

**适合**：正式开发、写完整程序、复用代码。工作中 99% 的代码都写在文件里。

### 方式三：IDE / 在线运行（你现在用的）

像本教程页面、VS Code、PyCharm、Jupyter 都属于这类。背后也是调用 \`python3\`，只是包装了界面，**最方便学习**。

## 第一个程序：hello world

几乎所有编程语言的第一课都是"输出 hello world"，Python 也不例外。

\`\`\`python
# 这是 Python 的第一行代码
# print() 是一个内置函数，把内容显示到屏幕上
# 引号里的内容叫"字符串"（一串文字）
print("hello world")     # 输出：hello world
\`\`\`

就这一行。对比一下 Java 的同等程序：

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
\`\`\`

Java 要写 5 行才能干同样的事。Python 的"简洁"由此可见一斑——**没有 class、没有 main 方法、没有分号**，直接写要做什么。

## 注释：给人看的说明

注释是**解释代码在干嘛**的文字，Python 解释器会忽略它们。注释有两种：

### 单行注释：用 \`#\` 号

\`\`\`python
# 这是单行注释，整行都被忽略
print("hello")    # 这也是注释，从 # 开始到行尾都被忽略
# print("这行不会执行，因为被注释掉了")
\`\`\`

**为什么需要注释？** 代码是写给"未来的自己"和"同事"看的。三个月后你回来看代码，没注释可能自己都看不懂。好的注释解释"为什么这么写"，而不是"这行在干嘛"（代码本身已经说明了在干嘛）。

### 文档字符串：用三引号

\`\`\`python
"""
这是文档字符串（docstring）
可以写多行
通常用于函数、类、模块的开头，说明它的用途
"""
print("hello")
\`\`\`

文档字符串和 \`#\` 注释的区别：文档字符串是"程序可访问"的，可以用 \`help()\` 函数查看。后面讲函数时会细讲。

## 缩进：Python 的灵魂

Python 和大多数语言最大的不同：**用缩进表示代码块**，而不是花括号 \`{}\`。

### 错误示例：缩进不一致

\`\`\`python
print("第一行")
  print("第二行")    # 这行开头多了空格，会报 IndentationError
\`\`\`

运行会报错：\`IndentationError: unexpected indent\`，意思是"不该有的缩进"。

### 正确示例

\`\`\`python
# 顶层代码顶格写
print("第一行")
print("第二行")

# 后面讲 if/for/def 时，里面的代码要缩进
# 现在只要记住：行首不要随便加空格
\`\`\`

### 缩进规则

| 情况 | 缩进 | 示例 |
|------|------|------|
| 顶层代码 | 顶格（0 空格） | \`print("a")\` |
| 代码块内 | 4 个空格（推荐） | \`    print("b")\` |
| 嵌套块 | 每层 +4 空格 | \`        print("c")\` |

⚠️ **不要混用 Tab 和空格**。Python 3 严格区分，混用会报 \`TabError\`。建议在编辑器里把 Tab 设置为"4 个空格"。

## 基本语法规则

### 规则一：一行一条语句

\`\`\`python
print("第一句")
print("第二句")
\`\`\`

也可以用分号 \`;\` 在一行写多条，但**不推荐**（可读性差）：

\`\`\`python
print("第一句"); print("第二句")    # 不推荐
\`\`\`

### 规则二：行尾不需要分号

和 C/Java 不同，Python 行尾**不加分号**。加了不会报错，但完全多余：

\`\`\`python
print("hello");    # 多余的分号，不报错但不推荐
\`\`\`

### 规则三：长行可用反斜杠换行

\`\`\`python
# 一行太长可以用 \\ 续行
total = 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + \\
        11 + 12 + 13 + 14 + 15
print(total)
\`\`\`

或者用括号自动续行（推荐）：

\`\`\`python
# 括号内的内容可以自动换行，更优雅
total = (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 +
         11 + 12 + 13 + 14 + 15)
print(total)
\`\`\`

## print() 函数详解

\`print()\` 是你最常用的函数，先彻底搞懂它。

### 基本用法

\`\`\`python
# 打印字符串
print("hello")

# 打印数字（不用引号）
print(42)
print(3.14)

# 打印多个值，用逗号分隔，默认用空格隔开
print("姓名:", "张三", "年龄:", 25)
\`\`\`

### sep 参数：自定义分隔符

\`\`\`python
# sep 控制多个值之间用什么分隔，默认是空格
print("2026", "07", "19", sep="-")     # 输出：2026-07-19
print("apple", "banana", "cherry", sep=" | ")   # 输出：apple | banana | cherry
print("hello", "world", sep="")        # 输出：helloworld（无分隔）
\`\`\`

### end 参数：自定义结尾

\`\`\`python
# end 控制打印完用什么结尾，默认是换行 \\n
print("第一行", end="")     # 不换行
print("接在后面")            # 会接在 "第一行" 后面

print()    # 只打印一个换行，相当于空一行

print("A", end="-")
print("B", end="-")
print("C")               # 输出：A-B-C
\`\`\`

### file 参数：输出到文件

\`\`\`python
# file 参数把内容输出到文件而不是屏幕
# 这里演示概念，文件操作后面会细讲
import sys
print("这条会显示在屏幕", file=sys.stdout)     # 标准输出
print("这条会输出到错误流", file=sys.stderr)    # 标准错误
\`\`\`

### flush 参数：立即刷新缓冲区

\`\`\`python
# flush=True 立即输出，不等缓冲区满
# 在写进度条、长时间任务时有用
import time
for i in range(3):
    print(f"\\r进度: {i+1}/3", end="", flush=True)    # \\r 回到行首
    time.sleep(0.5)
print(" 完成！")
\`\`\`

## IDLE：Python 自带的简易 IDE

Python 安装时会自带一个叫 **IDLE** 的简易开发环境，适合新手练手。

### IDLE 的特点

- 启动快，开箱即用
- 有语法高亮（关键字变色）
- 支持交互式（>>> 提示符）和文件编辑两种模式
- 调试功能简单（适合新手，不够专业）

### 何时该换更专业的工具

当你开始写"多文件项目"时，IDLE 就不够用了。这时换：
- **VS Code**（免费、轻量、插件多，推荐）
- **PyCharm**（专业、强大、收费版功能全）
- **Trae IDE**（AI 辅助，提效神器）

## 一个稍微完整的 demo

下面这段代码综合演示本章知识点：print、注释、sep/end 参数、字符串运算。

\`\`\`python
# ============================================
# 第一章综合 demo：个人信息卡片打印
# 演示：print、注释、sep/end、字符串运算
# ============================================

# 用变量保存信息（变量下一章细讲，现在先理解成"标签"）
name = "张三"
age = 25
city = "北京"
job = "程序员"

# 打印分隔线（字符串 * 数字 = 重复）
print("=" * 40)

# sep 自定义分隔符，让输出像表格
print("姓名:", name, sep=" ")
print("年龄:", age, sep=" ")
print("城市:", city, sep=" ")
print("职业:", job, sep=" ")

# 再来一条分隔线
print("=" * 40)

# 用 end 让多行 print 接在同一行
print("技能列表:", end=" ")
print("Python", "JavaScript", "SQL", sep=" / ")

# 空一行
print()

# 用 f-string（第四章细讲）格式化输出
print(f"{name} 今年 {age} 岁，住在 {city}，是一名 {job}。")

# 简单的数学计算
print()
print("--- 收入计算 ---")
hourly_rate = 200        # 时薪
hours_per_day = 8        # 每天工作小时
days_per_month = 22      # 每月工作天数

# 月薪 = 时薪 × 每天小时 × 每月天数
monthly = hourly_rate * hours_per_day * days_per_month
print(f"时薪: {hourly_rate} 元/小时")
print(f"月薪: {monthly} 元")

# 年薪 = 月薪 × 12 + 年终奖（假设 2 个月）
annual = monthly * 12 + monthly * 2
print(f"年薪（含 2 月年终）: {annual} 元")

# 结束分隔线
print("=" * 40)
print("信息打印完毕")
\`\`\`

这段 demo 用到的知识：变量赋值、字符串重复（\`"=" * 40\`）、sep/end 参数、f-string 格式化、四则运算。**先不用全懂**，后面章节会逐个细讲。现在感受一下"完整的小程序长什么样"。

## ⚠️ 初学者常见坑

### 坑一：中文标点

\`\`\`python
# 错误：用了中文逗号，会报 SyntaxError
print("hello"，"world")    # ← 这个逗号是中文的

# 正确：用英文逗号
print("hello", "world")
\`\`\`

写代码时**切到英文输入法**，中文标点 Python 一律不认识。

### 坑二：引号不成对

\`\`\`python
# 错误：少了右引号
print("hello)    # SyntaxError

# 正确
print("hello")
\`\`\`

### 坑三：行首随便加空格

\`\`\`python
# 错误：行首多了空格
print("第一行")
  print("第二行")    # IndentationError

# 正确：顶格写
print("第一行")
print("第二行")
\`\`\`

### 坑四：Python 2 vs Python 3

有些老系统 \`python\` 命令指向 Python 2（已淘汰）。**统一用 \`python3\`** 明确指定版本。

## 小结

- 安装 Python 后用 \`python3 --version\` 验证；Windows 务必勾选 "Add to PATH"
- Python 有三种运行方式：REPL（试代码）、脚本文件（正式开发）、IDE（学习开发两用）
- \`print()\` 是第一个函数，支持 sep、end、file、flush 四个参数
- 注释用 \`#\`（单行）或三引号（多行文档字符串）
- Python 用缩进表示代码块，**4 个空格**为标准，不要混用 Tab 和空格
- 行尾不加分号；长行用 \`\\\` 或括号续行
- IDLE 适合新手练手，写项目时换 VS Code / PyCharm / Trae

## 常见疑问 Q&A

**Q：python 和 python3 有什么区别？**
A：有些系统 \`python\` 指向 Python 2（已淘汰），\`python3\` 明确指 Python 3。建议统一用 \`python3\`。

**Q：注释写中文会出错吗？**
A：不会。Python 3 默认 UTF-8 编码，中文注释、中文字符串都没问题。本教程注释全是中文。

**Q：为什么 Python 用缩进而不是花括号？**
A：设计哲学——"明确优于隐式"。强制缩进让代码天然整齐，可读性高。缺点是缩进错了就报错，必须严格。

**Q：必须用 4 个空格缩进吗？**
A：Python 没强制必须 4 个，但 PEP 8（官方风格指南）推荐 4 个，社区默认标准。混用 Tab 和空格会报 \`TabError\`。

**Q：IDLE 和 VS Code 我该用哪个？**
A：新手刚开始用 IDLE 没问题，写过几次代码后建议直接换 VS Code，配置不复杂，功能强大多了。`
  },

  // -----------------------------------------------------------
  // 第二章：变量与基础数据类型
  // -----------------------------------------------------------
  {
    id: "py10-ch02",
    group: "第一部分 Python 入门基础",
    icon: "📦",
    title: "第二章 变量与基础数据类型",
    content: `## 变量是什么

**变量**是"贴在值上的标签"。你写 \`name = "张三"\`，就是把 \`name\` 这个标签贴到 \`"张三"\` 这个字符串上。之后用 \`name\` 就等于用 \`"张三"\`。

打个比方：变量像"盒子"，里面装值；但更准确的说法是"标签"——Python 的变量不直接装值，而是"指向"值。

\`\`\`python
# 变量赋值：把 name 标签贴到 "张三" 上
name = "张三"
print(name)    # 输出：张三

# 变量可以重新赋值（撕下标签贴到别处）
name = "李四"
print(name)    # 输出：李四
\`\`\`

## 变量赋值

### 基本赋值

\`\`\`python
# 用 = 把右边的值赋给左边的变量
age = 25                # 整数
height = 1.75           # 浮点数
name = "张三"           # 字符串
is_student = True       # 布尔值（注意首字母大写：True / False）
\`\`\`

### 多重赋值

\`\`\`python
# 同时给多个变量赋相同的值
a = b = c = 0
print(a, b, c)    # 输出：0 0 0

# 同时给多个变量赋不同的值（元组解包）
x, y, z = 1, 2, 3
print(x, y, z)    # 输出：1 2 3

# 交换两个变量的值（Python 特色，不用临时变量）
a, b = 1, 2
a, b = b, a
print(a, b)       # 输出：2 1
\`\`\`

**为什么能这样写？** Python 的赋值是"先算右边，再赋给左边"。右边 \`1, 2, 3\` 实际是一个元组，左边 \`x, y, z\` 是"解包"——把元组里的值依次取出来赋给三个变量。

### 链式比较赋值（注意区分）

\`\`\`python
# 这不是赋值，是比较！
# 判断 5 是否在 1 到 10 之间
result = 1 < 5 < 10
print(result)    # True
\`\`\`

## 动态类型

Python 是**动态类型**语言：变量不需要先声明类型，赋什么值就是什么类型；同一个变量可以反复改变类型。

\`\`\`python
x = 42           # x 现在是 int（整数）
print(type(x))   # <class 'int'>

x = "hello"      # x 现在是 str（字符串）
print(type(x))   # <class 'str'>

x = 3.14         # x 现在是 float（浮点数）
print(type(x))   # <class 'float'>
\`\`\`

**和静态类型的区别**：Java / C++ 要先写 \`int x = 42;\`，声明 \`x\` 是 int 类型，之后不能改成字符串。Python 不需要声明，更灵活，但也意味着你要自己注意类型——别把字符串当数字用。

## type() 函数：查看类型

\`type()\` 返回一个对象的类型，是调试和理解代码的利器。

\`\`\`python
print(type(42))          # <class 'int'>
print(type(3.14))        # <class 'float'>
print(type("hello"))     # <class 'str'>
print(type(True))        # <class 'bool'>
print(type(None))        # <class 'NoneType'>
print(type([1, 2, 3]))   # <class 'list'>
\`\`\`

### isinstance()：判断类型

\`\`\`python
# isinstance(对象, 类型) 返回 True / False
x = 42
print(isinstance(x, int))      # True
print(isinstance(x, str))      # False
print(isinstance(x, (int, float)))   # True，可以传元组判断多种类型
\`\`\`

## id() 函数：查看内存地址

\`id()\` 返回对象的"身份"（内存地址的抽象）。用于判断两个变量是否指向**同一个对象**。

\`\`\`python
a = 1000
b = 1000
print(id(a))         # 比如输出 4301234560
print(id(b))         # 比如输出 4301234592（不同对象）
print(a is b)        # False，不是同一个对象

# 但小整数有"缓存"机制（-5 到 256）
c = 100
d = 100
print(c is d)        # True，Python 缓存了小整数
\`\`\`

**为什么有小整数缓存？** Python 启动时预创建了 -5 到 256 的整数对象，所有用到这些值的变量都指向同一个对象，节省内存。这是 CPython 的实现细节，写代码时**不要依赖它**——比较值用 \`==\`，比较身份才用 \`is\`。

## Python 的基础数据类型

### 1. int（整数）

\`\`\`python
# 整数，没有大小限制（Python 3 的 int 自动扩展）
a = 42
b = -10
c = 0

# 大整数也能精确表示
big = 10 ** 100     # 10 的 100 次方
print(big)          # 不会溢出！
\`\`\`

**Python 3 的整数不会溢出**。和 C/Java 的 int 受 32/64 位限制不同，Python 的 int 可以任意大（受内存限制）。

#### 整数的不同进制

\`\`\`python
# 十进制（默认）
decimal = 42

# 二进制：0b 开头
binary = 0b101010       # 42 的二进制

# 八进制：0o 开头
octal = 0o52            # 42 的八进制

# 十六进制：0x 开头
hexadecimal = 0x2a      # 42 的十六进制

print(decimal, binary, octal, hexadecimal)    # 都是 42

# 把整数转成不同进制的字符串
print(bin(42))     # '0b101010'
print(oct(42))     # '0o52'
print(hex(42))     # '0x2a'
\`\`\`

#### 下划线分隔大数字

\`\`\`python
# Python 3.6+ 支持用 _ 分隔大数字，便于阅读
population = 1_400_000_000      # 14 亿，等同于 1400000000
salary = 1_000_000              # 100 万
print(population, salary)
\`\`\`

**为什么有这个特性？** \`1400000000\` 数零数不清，\`1_400_000_000\` 一眼看出是 14 亿。下划线纯粹是给人看的，Python 解释器会忽略。

### 2. float（浮点数）

\`\`\`python
# 浮点数：带小数点的数
a = 3.14
b = -0.5
c = 1.0          # 即使是 1.0 也是 float
d = 2e3          # 科学计数法，2 × 10³ = 2000.0
e = 1.5e-3       # 1.5 × 10⁻³ = 0.0015

print(a, b, c, d, e)
\`\`\`

#### 浮点数精度问题（重要！）

\`\`\`python
# 浮点数有精度问题，这不是 Python 的 bug，是 IEEE 754 标准的限制
print(0.1 + 0.2)           # 0.30000000000000004（不是 0.3！）
print(0.1 + 0.2 == 0.3)    # False！

# 解决方案：用 round() 四舍五入
print(round(0.1 + 0.2, 2))   # 0.3
\`\`\`

**为什么会这样？** 计算机用二进制表示小数，0.1 在二进制下是无限循环小数，存进 64 位浮点数时被截断，产生微小误差。所有编程语言都有这个问题（JavaScript 也是）。**永远不要用 == 比较浮点数**，用 \`abs(a - b) < 1e-9\` 判断"足够接近"。

#### 用 decimal 模块做精确小数

\`\`\`python
# 财务计算必须精确，用 decimal 模块
from decimal import Decimal, getcontext

# 用字符串创建 Decimal，避免 float 的精度问题
a = Decimal("0.1")
b = Decimal("0.2")
print(a + b)                # 0.3（精确！）
print(a + b == Decimal("0.3"))    # True

# 可以设置精度
getcontext().prec = 6      # 6 位有效数字
print(Decimal(1) / Decimal(7))    # 0.142857
\`\`\`

### 3. bool（布尔值）

\`\`\`python
# 布尔值只有两个：True 和 False（注意首字母大写）
is_true = True
is_false = False

# 布尔值其实是 int 的子类！
print(True + True)      # 2（True 当作 1）
print(False + 5)        # 5（False 当作 0）
print(isinstance(True, int))    # True
\`\`\`

**True 就是 1，False 就是 0**。这个特性偶尔有用，但不要滥用——代码可读性比小聪明重要。

### 4. complex（复数）

\`\`\`python
# 复数：实部 + 虚部，虚部用 j 表示
z = 3 + 4j
print(z)                # (3+4j)
print(z.real)           # 3.0（实部）
print(z.imag)           # 4.0（虚部）
print(abs(z))           # 5.0（模：√(3² + 4²) = 5）
\`\`\`

复数在科学计算、信号处理里有用，日常开发基本用不到。知道有这么个东西就行。

### 5. NoneType（None）

\`\`\`python
# None 表示"没有值"或"空"
result = None
print(result)               # None
print(type(result))         # <class 'NoneType'>

# 判断是否是 None，必须用 is，不要用 ==
if result is None:
    print("result 没有值")

# 函数没有 return 时默认返回 None
def do_nothing():
    pass

print(do_nothing())         # None
\`\`\`

**None 的用途**：
- 函数没有返回值时默认返回 None
- 表示"没有值"或"未设置"
- 作为函数参数的默认值（后面讲函数时会详谈）

**为什么用 \`is None\` 不用 \`== None\`？** \`is\` 比较身份（是不是同一个对象），\`==\` 比较值。None 是单例（全局只有一个 None），用 \`is\` 更准确，且更快。这是 PEP 8 推荐的写法。

## 类型转换

Python 提供了一组内置函数做类型转换：

| 函数 | 转成什么 | 示例 |
|------|----------|------|
| \`int()\` | 整数 | \`int("42")\` → 42 |
| \`float()\` | 浮点数 | \`float("3.14")\` → 3.14 |
| \`str()\` | 字符串 | \`str(42)\` → "42" |
| \`bool()\` | 布尔值 | \`bool(0)\` → False |
| \`list()\` | 列表 | \`list("abc")\` → ['a','b','c'] |

### int() 转换

\`\`\`python
# 字符串转整数（字符串必须是合法整数）
print(int("42"))          # 42
print(int("-10"))         # -10
print(int("  100  "))     # 100（自动去空格）

# 浮点数转整数（直接截断小数部分，不是四舍五入！）
print(int(3.9))           # 3（不是 4！）
print(int(-3.9))          # -3

# 布尔值转整数
print(int(True))          # 1
print(int(False))         # 0

# 指定进制转换
print(int("1010", 2))     # 把 "1010" 当二进制，转成 10
print(int("ff", 16))      # 把 "ff" 当十六进制，转成 255

# 错误示例：非数字字符串会报错
# int("hello")    # ValueError
# int("3.14")     # ValueError（要先转 float 再转 int）
\`\`\`

### float() 转换

\`\`\`python
# 字符串转浮点数
print(float("3.14"))      # 3.14
print(float("100"))       # 100.0
print(float("1e3"))       # 1000.0（科学计数法）

# 整数转浮点数
print(float(42))          # 42.0

# 布尔值转浮点数
print(float(True))        # 1.0
\`\`\`

### str() 转换

\`\`\`python
# 任何类型都能转成字符串
print(str(42))            # "42"
print(str(3.14))          # "3.14"
print(str(True))          # "True"
print(str([1, 2, 3]))     # "[1, 2, 3]"
print(str(None))          # "None"
\`\`\`

### bool() 转换与 truthy/falsy 规则

\`bool()\` 把任意值转成 True 或 False，规则很重要——后面 if 判断会大量用到。

\`\`\`python
# 数字：0 是 False，非 0 是 True
print(bool(0))            # False
print(bool(0.0))          # False
print(bool(42))           # True
print(bool(-1))           # True（负数也是 True）

# 字符串：空字符串是 False，非空是 True
print(bool(""))           # False
print(bool("hello"))      # True
print(bool(" "))          # True（空格也是字符，不是空字符串！）

# 容器：空的容器是 False，非空是 True
print(bool([]))           # False（空列表）
print(bool([0]))          # True（列表里有元素，哪怕元素是 0）
print(bool({}))           # False（空字典）
print(bool(None))         # False
\`\`\`

#### 完整的 falsy 值清单

下面这些值在 \`bool()\` 转换时都是 \`False\`，其他全是 \`True\`：

| 类型 | falsy 值 |
|------|----------|
| int | \`0\` |
| float | \`0.0\` |
| complex | \`0j\` |
| bool | \`False\` |
| str | \`""\`（空字符串） |
| list | \`[]\`（空列表） |
| tuple | \`()\`（空元组） |
| dict | \`{}\`（空字典） |
| set | \`set()\`（空集合） |
| NoneType | \`None\` |

**记忆口诀**：**"零、空、None 是假，其他都真"**。

### 实战：用户输入转数字

\`\`\`python
# input() 返回字符串，要做数学计算必须先转换
user_input = "25"      # 模拟用户输入
age = int(user_input) + 1
print(f"明年你 {age} 岁")

# 安全转换：try/except 处理非法输入
def safe_int(s):
    """把字符串安全转成 int，失败返回 None"""
    try:
        return int(s)
    except ValueError:
        return None

print(safe_int("42"))      # 42
print(safe_int("hello"))   # None（不报错）
\`\`\`

## sys.int_max：Python 3 整数无上限

\`\`\`python
import sys

# Python 3 的 int 没有上限！这是和 C/Java 的重大区别
# sys.maxsize 是"系统指针能表示的最大值"，不是 int 上限
print(sys.maxsize)             # 比如 9223372036854775807（64 位系统）

# 但 int 可以远超这个值
huge = 10 ** 1000              # 10 的 1000 次方
print(len(str(huge)))          # 1001（这是个 1001 位的数）
print(huge)                    # 完整打印出来

# 对比：C 语言的 long long 最多约 9.2 × 10¹⁸，远小于这个
\`\`\`

**为什么 Python 的 int 没上限？** Python 3 的 int 内部用一个"可变长度的数组"存储数字位，需要多大就分配多大，只受内存限制。代价是运算比 C 的 int 慢，但对绝大多数应用来说这点性能损耗可以忽略。

## 综合实战 demo

\`\`\`python
# ============================================
# 第二章综合 demo：变量与类型的完整演示
# ============================================

# 1. 多重赋值
name, age, height = "张三", 25, 1.75
print(f"姓名: {name}, 年龄: {age}, 身高: {height}")

# 2. 动态类型演示
x = 42
print(f"x = {x}, 类型: {type(x).__name__}")
x = "现在是字符串"
print(f"x = {x}, 类型: {type(x).__name__}")
x = [1, 2, 3]
print(f"x = {x}, 类型: {type(x).__name__}")

# 3. 类型转换
print()
print("--- 类型转换 ---")
num_str = "123"
num = int(num_str)
print(f"字符串 '{num_str}' -> 整数 {num}, 可以做运算: {num} * 2 = {num * 2}")

# 4. truthy/falsy 实战
print()
print("--- truthy/falsy 判断 ---")
test_values = [0, 1, "", "hello", [], [0], None, 3.14]
for v in test_values:
    # 直接用 if v 判断，等价于 if bool(v)
    if v:
        print(f"{v!r:10} -> True")
    else:
        print(f"{v!r:10} -> False")
\`\`\`

**这段 demo 的关键点**：
1. \`type(x).__name__\` 取类型名（'int'、'str'），比 \`type(x)\` 输出更干净
2. \`f"{v!r:10}"\` 用 \`!r\` 显示 repr 形式（带引号），\`:10\` 左对齐 10 字符宽
3. \`if v:\` 直接判断真假，不需要写 \`if bool(v) == True\`

## ⚠️ 初学者常见坑

### 坑一：变量名非法

\`\`\`python
# 错误：变量名不能以数字开头
1st_name = "张三"     # SyntaxError

# 错误：变量名不能有特殊符号（除了 _ ）
my-name = "张三"      # SyntaxError（- 是减号）

# 正确
first_name = "张三"
my_name = "张三"
\`\`\`

变量名规则：**字母、数字、下划线，不能以数字开头**。不能用关键字（\`if\`、\`for\`、\`class\` 等）。

### 坑二：用 == 比较 None

\`\`\`python
# 不推荐
if x == None:    # 能跑但不规范

    pass

# 推荐
if x is None:    # PEP 8 推荐
    pass
\`\`\`

### 坑三：浮点数相等比较

\`\`\`python
# 错误：直接用 == 比较浮点数
print(0.1 + 0.2 == 0.3)    # False（精度问题）

# 正确：用容差判断
def almost_equal(a, b, tolerance=1e-9):
    return abs(a - b) < tolerance

print(almost_equal(0.1 + 0.2, 0.3))    # True
\`\`\`

### 坑四：把字符串当数字用

\`\`\`python
# 错误
age = input("年龄: ")    # input 返回字符串
# print(age + 1)         # TypeError: 字符串不能加整数

# 正确
age = int(input("年龄: "))
print(age + 1)
\`\`\`

## 小结

- 变量是"贴在值上的标签"，动态类型，无需声明
- \`type()\` 查类型，\`id()\` 查身份，\`isinstance()\` 判断类型
- 基础类型：int（无上限）、float（有精度问题）、bool（True/False）、complex、None
- 整数支持二进制 \`0b\`、八进制 \`0o\`、十六进制 \`0x\`，可用 \`_\` 分隔大数字
- 浮点数有精度问题，财务计算用 \`decimal\` 模块
- 类型转换：\`int()\`、\`float()\`、\`str()\`、\`bool()\`
- truthy/falsy 规则："零、空、None 是假，其他都真"
- Python 3 的 int 无上限，受内存限制
- 比较 None 用 \`is None\`，比较浮点数用容差

## 常见疑问 Q&A

**Q：为什么 \`True + True == 2\`？**
A：bool 是 int 的子类，True 等于 1，False 等于 0。但不要在业务代码里这样用，可读性差。

**Q：\`is\` 和 \`==\` 有什么区别？**
A：\`is\` 比较身份（是不是同一个对象），\`==\` 比较值（内容是否相等）。比较 None 用 \`is\`，比较值用 \`==\`。

**Q：为什么 \`0.1 + 0.2 != 0.3\`？**
A：IEEE 754 浮点数标准的限制，所有语言都有这个问题。用 \`round()\` 或 \`decimal\` 模块解决。

**Q：变量名用驼峰还是下划线？**
A：Python 官方风格（PEP 8）推荐**下划线**：\`my_name\` 而非 \`myName\`。函数名、变量名都用下划线；类名用驼峰：\`MyClass\`。`
  },

  // -----------------------------------------------------------
  // 第三章：运算符完全指南
  // -----------------------------------------------------------
  {
    id: "py10-ch03",
    group: "第一部分 Python 入门基础",
    icon: "➕",
    title: "第三章 运算符完全指南",
    content: `## 运算符概览

Python 运算符分六大类，本章逐一讲透：

| 类别 | 运算符 | 用途 |
|------|--------|------|
| 算术 | \`+ - * / // % **\` | 数学计算 |
| 比较 | \`== != > < >= <= is is not\` | 比较大小/身份 |
| 逻辑 | \`and or not\` | 布尔逻辑 |
| 位 | \`& | ^ ~ << >>\` | 二进制位操作 |
| 赋值 | \`= += -= *= ...\` | 赋值 |
| 海象 | \`:=\` | 赋值并返回 |

## 算术运算符

\`\`\`python
# 基础算术
print(10 + 3)      # 13   加法
print(10 - 3)      # 7    减法
print(10 * 3)      # 30   乘法
print(10 / 3)      # 3.3333...  除法（总是返回 float）
print(10 // 3)     # 3    整除（向下取整）
print(10 % 3)      # 1    取余
print(2 ** 10)     # 1024 幂运算
\`\`\`

### / 和 // 的区别（重要）

\`\`\`python
# / 永远返回 float（即使能整除）
print(10 / 2)      # 5.0（不是 5）
print(10 / 3)      # 3.3333...

# // 返回整数（向下取整，不是截断！）
print(10 // 3)     # 3
print(-10 // 3)    # -4（向下取整到 -4，不是 -3）
print(10 // -3)    # -4（同上）

# % 的符号和除数一致
print(-10 % 3)     # 2（不是 -1）
print(10 % -3)     # -2
\`\`\`

**为什么 \`-10 // 3 == -4\`？** \`//\` 是"向下取整"，不是"截断小数"。-10/3 = -3.33，向下取整（往更小的方向）是 -4。这和 C/Java 的 \`/\` 行为不同，C 是直接截断（向 0 取整）得到 -3。Python 的设计更数学严谨，但容易让人混淆。

### % 的实际用途

\`\`\`python
# 1. 判断奇偶
n = 17
if n % 2 == 0:
    print("偶数")
else:
    print("奇数")     # 输出：奇数

# 2. 取个位数
print(12345 % 10)    # 5

# 3. 周期性循环（取模运算）
# 比如时钟：14 点等价于下午 2 点
hour = 14
print(hour % 12)     # 2

# 4. 格式化时间
total_seconds = 3661
minutes = total_seconds // 60
seconds = total_seconds % 60
print(f"{minutes}分{seconds}秒")    # 61分1秒
\`\`\`

### ** 幂运算

\`\`\`python
# 幂运算：2 的 10 次方
print(2 ** 10)      # 1024

# 负数次方 = 倒数
print(2 ** -1)      # 0.5（1/2）
print(4 ** -0.5)    # 0.5（1/√4）

# 开方
print(9 ** 0.5)     # 3.0（平方根）
print(8 ** (1/3))   # 2.0（立方根）

# 大数幂（Python 3 int 无上限）
print(2 ** 1000)    # 一个 302 位数，不会溢出
\`\`\`

**优先级**：\`**\` 比 \`*\` \`/\` 高，比一元 \`-\` 高。所以 \`-2 ** 2 == -4\`（不是 4），因为先算 \`2 ** 2 = 4\` 再取负。如果想要 \`(-2) ** 2 = 4\`，要加括号。

### 字符串的 + 和 *

\`\`\`python
# 字符串 + 字符串 = 拼接
print("hello" + " " + "world")     # hello world

# 字符串 * 数字 = 重复
print("-" * 30)                    # ------------------------------
print("abc" * 3)                   # abcabcabc

# 列表也支持 + 和 *
print([1, 2] + [3, 4])             # [1, 2, 3, 4]
print([0] * 5)                     # [0, 0, 0, 0, 0]
\`\`\`

### divmod() 一次拿商和余数

\`\`\`python
# divmod 返回 (商, 余数) 的元组
q, r = divmod(17, 5)
print(f"17 ÷ 5 = {q} 余 {r}")    # 17 ÷ 5 = 3 余 2

# 实战：把秒数转成"时分秒"
total = 3661
hours, remainder = divmod(total, 3600)
minutes, seconds = divmod(remainder, 60)
print(f"{hours}时{minutes}分{seconds}秒")    # 1时1分1秒
\`\`\`

## 比较运算符

\`\`\`python
# 数值比较
print(3 == 3)      # True   等于
print(3 != 4)      # True   不等于
print(3 > 2)       # True   大于
print(3 < 2)       # False  小于
print(3 >= 3)      # True   大于等于
print(3 <= 2)      # False  小于等于

# 字符串比较（按字典序）
print("apple" < "banana")    # True（'a' < 'b'）
print("apple" < "apricot")   # True（'p' < 'r'）
print("ABC" < "abc")         # True（大写字母比小写小）

# 链式比较（Python 特色）
x = 5
print(1 < x < 10)            # True，等价于 1 < x and x < 10
print(1 < x < 3)             # False
\`\`\`

**链式比较是 Python 的特色**。别的语言要写 \`1 < x and x < 10\`，Python 可以直接写 \`1 < x < 10\`，更接近数学表达。而且 \`x\` 只计算一次，效率更高。

### is 和 is not：身份比较

\`\`\`python
# is 比较身份（是不是同一个对象）
# == 比较值（内容是否相等）

a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)      # True（值相等）
print(a is b)      # False（不是同一个对象，内存地址不同）

c = a              # c 和 a 指向同一个列表
print(a is c)      # True
\`\`\`

**什么时候用 \`is\`？**
- 判断 None：\`if x is None\`
- 判断 True / False：\`if x is True\`（虽然不常用）
- 判断两个变量是否指向同一个对象

**什么时候用 \`==\`？**
- 比较值是否相等（绝大多数情况）

### 小整数缓存

\`\`\`python
# Python 缓存了 -5 到 256 的小整数
a = 100
b = 100
print(a is b)      # True（指向同一个缓存对象）

# 大整数不缓存
c = 1000
d = 1000
print(c is d)      # False（不同对象）

# 字符串也有类似缓存（短字符串）
s1 = "hello"
s2 = "hello"
print(s1 is s2)    # True
\`\`\`

**这是 CPython 的优化**，不要在代码里依赖它。比较值永远用 \`==\`，比较身份才用 \`is\`。

## 逻辑运算符

\`\`\`python
# and：两边都 True 才 True
print(True and False)     # False
print(True and True)      # True

# or：任一为 True 就 True
print(True or False)      # True
print(False or False)     # False

# not：取反
print(not True)           # False
print(not False)          # True
print(not 0)              # True（0 是 falsy）
print(not "hello")        # False（非空字符串是 truthy）
\`\`\`

### 短路求值（重要）

\`\`\`python
# and：如果左边是 False，右边不计算
x = 0
# 下面这行不会报错，因为 x=0 是 falsy，右边被短路不执行
print(x and 10 / x)       # 0（不计算 10/x）

# or：如果左边是 True，右边不计算
default = "默认值"
user_input = ""           # 假装用户没输入
result = user_input or default
print(result)             # 默认值（空字符串是 falsy，取 default）
\`\`\`

**短路求值有什么用？**
1. **避免错误**：\`if x != 0 and 10/x > 1\`（先判断 x 不为 0，避免除零）
2. **设置默认值**：\`value = user_input or "default"\`
3. **性能优化**：把容易判断的条件放左边，复杂的放右边

### and / or 返回的不一定是 bool

\`\`\`python
# Python 的 and/or 返回的是"决定结果的那一侧的值"
# 不是 True/False！

# and：左边 falsy 就返回左边，否则返回右边
print(0 and "hello")       # 0（左边 falsy，返回左边）
print(3 and "hello")       # "hello"（左边 truthy，返回右边）

# or：左边 truthy 就返回左边，否则返回右边
print(3 or "hello")        # 3
print(0 or "hello")        # "hello"
print(None or 0 or "" or "default")    # "default"（一路找 truthy）
\`\`\`

**这个特性很有用**，常用来设置默认值：

\`\`\`python
# 设置默认值
name = input("姓名: ") or "匿名"     # 用户不输入就用"匿名"

# 类似 JS 的 name = input || "匿名"
\`\`\`

## 位运算符

位运算直接操作二进制位，日常用得少，但在底层编程、加密、性能优化时有用。

\`\`\`python
# 先理解：5 和 3 的二进制
# 5 = 0b101
# 3 = 0b011

# & 按位与：都是 1 才 1
print(5 & 3)        # 1   (0b101 & 0b011 = 0b001)

# | 按位或：任一为 1 就 1
print(5 | 3)        # 7   (0b101 | 0b011 = 0b111)

# ^ 按位异或：不同为 1，相同为 0
print(5 ^ 3)        # 6   (0b101 ^ 0b011 = 0b110)

# ~ 按位取反：0 变 1，1 变 0
print(~5)           # -6  (取反后是 -6，涉及补码)

# << 左移：相当于乘 2 的 n 次方
print(5 << 1)       # 10  (5 × 2 = 10)
print(5 << 2)       # 20  (5 × 4 = 20)

# >> 右移：相当于除 2 的 n 次方（向下取整）
print(20 >> 1)      # 10  (20 / 2 = 10)
print(20 >> 2)      # 5   (20 / 4 = 5)
\`\`\`

### 位运算的实战用途

\`\`\`python
# 1. 判断奇偶（比 n % 2 更快）
n = 17
if n & 1:
    print("奇数")     # 17 的最低位是 1
else:
    print("偶数")

# 2. 不用临时变量交换两个数
a, b = 5, 3
a = a ^ b
b = a ^ b
a = a ^ b
print(a, b)          # 3 5（交换成功）

# 3. 用位运算做权限标志
# 假设权限：读=1, 写=2, 执行=4
READ = 1
WRITE = 2
EXECUTE = 4

# 给用户读 + 执行权限
user_perm = READ | EXECUTE
print(user_perm)     # 5

# 检查是否有写权限
if user_perm & WRITE:
    print("有写权限")
else:
    print("无写权限")  # 输出这个

# 添加写权限
user_perm |= WRITE
print(user_perm)     # 7（读+写+执行）
\`\`\`

## 赋值运算符

\`\`\`python
# 基本赋值
x = 10

# 复合赋值：运算 + 赋值
x += 5      # 等同于 x = x + 5
print(x)    # 15

x -= 3      # x = x - 3
print(x)    # 12

x *= 2      # x = x * 2
print(x)    # 24

x /= 4      # x = x / 4（注意：变成 float）
print(x)    # 6.0

x //= 2     # x = x // 2
print(x)    # 3.0

x **= 2     # x = x ** 2
print(x)    # 9.0

# 位运算复合赋值
x = 5
x &= 3      # x = x & 3
print(x)    # 1

x |= 4      # x = x | 4
print(x)    # 5
\`\`\`

### 注意：不可变类型的"复合赋值"是新建对象

\`\`\`python
# 整数是不可变类型，x += 1 实际上是创建新对象
x = 100
print(id(x))     # 比如 4312345678
x += 1
print(id(x))     # 比如 4312345700（id 变了！新对象）

# 列表是可变类型，x += [...] 是原地修改
lst = [1, 2]
print(id(lst))   # 比如 4312345678
lst += [3, 4]
print(id(lst))   # 还是 4312345678（id 不变，原地改）
\`\`\`

这个细节在讲可变/不可变类型时会再讲，现在先记住：\`+=\` 对列表是原地修改，对整数是新建对象。

## 海象运算符 :=

Python 3.8 引入的"赋值表达式"，**把赋值和取值合二为一**。

### 没有 := 的痛点

\`\`\`python
# 读取输入，要写两行
text = input("请输入: ")
if len(text) > 5:
    print(f"输入了 {len(text)} 个字符")
# len(text) 计算了两次

# 用 := 简化
if (n := len(input("请输入: "))) > 5:
    print(f"输入了 {n} 个字符")
\`\`\`

### while 循环里的常见用法

\`\`\`python
# 传统写法：读输入要写两行
line = input("> ")
while line != "quit":
    print(f"你说: {line}")
    line = input("> ")

# 用 := 简化
while (line := input("> ")) != "quit":
    print(f"你说: {line}")
\`\`\`

### 列表推导式里的用法

\`\`\`python
# 计算每个数平方，过滤掉大于 100 的
# 不用 := 要算两次平方
numbers = [3, 5, 8, 10, 13]
result = [n**2 for n in numbers if n**2 < 100]
print(result)    # [9, 25, 64]

# 用 := 算一次
result = [sq for n in numbers if (sq := n**2) < 100]
print(result)    # [9, 25, 64]
\`\`\`

### 何时用 :=

- **while 读输入**：\`while (line := input()) != "quit":\`
- **条件里复用计算结果**：\`if (n := len(x)) > 10: print(n)\`
- **列表推导式避免重复计算**

**不要滥用**：如果代码变得更难读，就别用 \`:=\`，老老实实写两行更清楚。

## 运算符优先级

从高到低（部分常用）：

| 优先级 | 运算符 | 说明 |
|--------|--------|------|
| 1（最高） | \`**\` | 幂运算 |
| 2 | \`~ + -\` | 按位取反、正负号（一元） |
| 3 | \`* / // %\` | 乘除 |
| 4 | \`+ -\` | 加减 |
| 5 | \`<< >>\` | 位移 |
| 6 | \`&\` | 按位与 |
| 7 | \`^\` | 按位异或 |
| 8 | \`|\` | 按位或 |
| 9 | \`== != > < >= <=\` \`is\` \`in\` | 比较 |
| 10 | \`not\` | 逻辑非 |
| 11 | \`and\` | 逻辑与 |
| 12 | \`or\` | 逻辑或 |
| 13 | \`:=\` | 海象运算符（最低） |

### 不确定优先级就加括号

\`\`\`python
# 优先级容易记错，加括号最稳妥
result = (2 + 3) * 4      # 20
result = 2 + 3 * 4        # 14（先算 3*4）

# 复杂表达式一定要加括号
score = 85
if (score >= 80 and score < 90) or score == 100:
    print("优秀")
\`\`\`

**实战建议**：不要去死记优先级表。**写代码时不确定就加括号**，可读性比"显得聪明"重要。

## 综合实战 demo

\`\`\`python
# ============================================
# 第三章综合 demo：运算符综合运用
# 模拟一个简单的成绩分析系统
# ============================================

# 模拟学生成绩
scores = [78, 92, 65, 88, 95, 72, 83]

# 1. 基础统计
total = sum(scores)             # 内置 sum 求和
count = len(scores)             # 内置 len 求个数
average = total / count         # 平均分

print(f"总分: {total}, 平均分: {average:.2f}")

# 2. 用比较和逻辑运算符分类
print()
print("--- 成绩分类 ---")
for score in scores:
    # 链式比较：90 <= score <= 100
    if 90 <= score <= 100:
        grade = "优秀"
    elif 80 <= score < 90:
        grade = "良好"
    elif 60 <= score < 80:
        grade = "及格"
    else:
        grade = "不及格"
    print(f"  {score} 分 -> {grade}")

# 3. 用位运算做权限检查
print()
print("--- 权限检查 ---")
# 权限标志位
CAN_READ = 1        # 0b001
CAN_WRITE = 2       # 0b010
CAN_DELETE = 4      # 0b100

# 给不同用户不同权限
users = {
    "访客": CAN_READ,
    "编辑": CAN_READ | CAN_WRITE,
    "管理员": CAN_READ | CAN_WRITE | CAN_DELETE
}

for name, perm in users.items():
    print(f"{name} (权限码 {perm}):")
    print(f"  读: {'✓' if perm & CAN_READ else '✗'}")
    print(f"  写: {'✓' if perm & CAN_WRITE else '✗'}")
    print(f"  删: {'✓' if perm & CAN_DELETE else '✗'}")

# 4. 海象运算符实战
print()
print("--- 海象运算符 ---")
# 假装这是用户输入列表
inputs = ["hello", "world", "", "python", "", "quit"]

# 找出第一个非空且长度 >= 5 的输入
for text in inputs:
    if (length := len(text)) >= 5:
        print(f"找到: '{text}' (长度 {length})")
        break
\`\`\`

这段 demo 综合用了：算术、比较、逻辑、位运算、海象运算符、链式比较。**仔细看每行代码，理解每种运算符用在什么场景**。

## ⚠️ 初学者常见坑

### 坑一：= 和 == 混淆

\`\`\`python
# 错误：if 里写成了 =
if x = 5:    # SyntaxError
    pass

# 正确
if x == 5:    # 比较
    pass
\`\`\`

### 坑二：浮点数比较

\`\`\`python
# 错误
if 0.1 + 0.2 == 0.3:    # False（精度问题）
    pass

# 正确
if abs(0.1 + 0.2 - 0.3) < 1e-9:
    pass
\`\`\`

### 坑三：is 和 == 混淆

\`\`\`python
a = [1, 2]
b = [1, 2]
print(a is b)    # False（不同对象）
print(a == b)    # True（值相等）
\`\`\`

### 坑四：and/or 返回值不是 bool

\`\`\`python
# 这个表达式返回的是 0 不是 False
print(0 and 5)        # 0
# 这个返回 "default" 不是 True
print("" or "default")   # "default"

# 如果需要严格的 True/False，用 bool()
print(bool(0 and 5))           # False
print(bool("" or "default"))   # True
\`\`\`

## 小结

- 算术：\`/\` 永远返回 float，\`//\` 是向下取整（不是截断），\`%\` 取余
- 比较：\`==\` 比较值，\`is\` 比较身份；链式比较 \`1 < x < 10\` 是 Python 特色
- 逻辑：\`and\` \`or\` \`not\` 有短路求值，返回值不一定是 bool
- 位运算：\`& | ^ ~ << >>\`，常用于权限标志、性能优化
- 赋值：\`+= -= *= /= //= **=\` 等复合赋值
- 海象运算符 \`:=\`：Python 3.8+，赋值并返回，简化代码
- 优先级：不确定就加括号，可读性优先

## 常见疑问 Q&A

**Q：\`-10 // 3\` 为什么是 -4 不是 -3？**
A：\`//\` 是"向下取整"，-10/3 = -3.33，向下取整（往更小的方向）是 -4。Python 的设计比 C 的"截断"更数学严谨。

**Q：什么时候用 \`is\` 什么时候用 \`==\`？**
A：判断 None 用 \`is None\`，判断 True/False 用 \`is\`，其他情况都用 \`==\` 比较值。

**Q：海象运算符什么时候用？**
A：当"赋值"和"判断"在同一步时用，比如 \`while (line := input()) != "quit"\`。让代码更简洁就用，让代码更难读就别用。

**Q：位运算什么时候用得到？**
A：日常 80% 用不到。但写底层代码、加密、权限系统、性能优化时会用到。学的时候理解原理，用的时候能想起来就行。`
  },

  // -----------------------------------------------------------
  // 第四章：字符串基础
  // -----------------------------------------------------------
  {
    id: "py10-ch04",
    group: "第一部分 Python 入门基础",
    icon: "📝",
    title: "第四章 字符串基础",
    content: `## 字符串是什么

**字符串**就是"一串文字"，用引号包起来表示。Python 里单引号、双引号、三引号都能用，效果一样。

\`\`\`python
# 三种引号都能创建字符串
s1 = 'hello'         # 单引号
s2 = "hello"         # 双引号
s3 = """hello"""     # 三引号
print(s1 == s2 == s3)    # True，内容完全一样
\`\`\`

**为什么有三种？** 主要为了灵活处理"引号嵌套"——字符串里本身包含引号时，可以用另一种引号包：

\`\`\`python
# 字符串里有单引号，用双引号包
print("It's a book")      # It's a book

# 字符串里有双引号，用单引号包
print('He said "hi"')     # He said "hi"

# 或者用反斜杠转义
print('It\\'s a book')     # It's a book
\`\`\`

## 字符串的创建方式

### 1. 单引号 / 双引号

\`\`\`python
s1 = 'hello'
s2 = "world"

# 单双引号必须成对，不能跨行
# s3 = "hello
# world"    # SyntaxError：单双引号不能直接换行
\`\`\`

### 2. 三引号：多行字符串

\`\`\`python
# 三引号可以跨多行，里面的换行会保留
poem = """
静夜思
床前明月光
疑是地上霜
"""
print(poem)
# 输出：
# 
# 静夜思
# 床前明月光
# 疑是地上霜
# 
\`\`\`

**注意**：三引号字符串开头和结尾的换行也会保留。如果想去掉开头的空行，用反斜杠：

\`\`\`python
poem = """\\
静夜思
床前明月光"""
print(poem)
# 静夜思
# 床前明月光
\`\`\`

### 3. 字符串字面量拼接

\`\`\`python
# 相邻的字符串字面量会自动拼接
s = "hello" "world"
print(s)    # helloworld

# 可以跨行（用于长字符串换行）
s = ("这是一段"
     "很长的文字"
     "分布在多行")
print(s)    # 这是一段很长的文字分布在多行
\`\`\`

**这种写法比 + 拼接更高效**，因为 Python 在编译时就拼接好了，运行时没有开销。

## 转义字符

反斜杠 \`\\\` 开头的字符是"转义字符"，表示特殊含义：

| 转义 | 含义 | 示例 |
|------|------|------|
| \`\\n\` | 换行 | \`"a\\nb"\` → a 换行 b |
| \`\\t\` | 制表符 | \`"a\\tb"\` → a    b |
| \`\\\\\` | 反斜杠本身 | \`"C:\\\\Users"\` → C:\\Users |
| \\\\' | 单引号 | \\\'It\\\\'s\\\' |
| \\\\" | 双引号 | \\\'He said \\\\"hi\\\\"\\"\\\' |
| \`\\r\` | 回车 | 进度条常用 |
| \`\\0\` | 空字符 | 字符串结束符 |

\`\`\`python
# 换行
print("第一行\\n第二行")
# 第一行
# 第二行

# 制表符（对齐）
print("姓名\\t年龄\\t城市")
print("张三\\t25\\t北京")

# 反斜杠（路径）
print("C:\\\\Users\\\\Admin\\\\Documents")    # C:\\Users\\Admin\\Documents

# 引号
print("He said \\"hello\\"")    # He said "hello"
\`\`\`

## 原始字符串 r''

普通字符串里反斜杠是转义符，但写正则、文件路径时反斜杠很多，每个都写 \`\\\\\` 太麻烦。**原始字符串**（raw string）用 \`r\` 前缀，让反斜杠"原样输出"。

\`\`\`python
# 普通字符串：\\ 是转义
path = "C:\\\\Users\\\\Admin"
print(path)              # C:\\Users\\Admin

# 原始字符串：反斜杠原样
path = r"C:\\Users\\Admin"
print(path)              # C:\\Users\\Admin

# 正则表达式几乎必须用原始字符串
import re
# 不用 r：要写四个反斜杠表示一个 \\
# 用 r：写两个反斜杠表示一个 \\
pattern = r"\\d+"        # 匹配数字
print(re.findall(pattern, "abc123def456"))    # ['123', '456']
\`\`\`

**原始字符串的陷阱**：**不能以奇数个反斜杠结尾**。

\`\`\`python
# 错误：以单个反斜杠结尾
# path = r"C:\\Users\\"    # SyntaxError

# 解决方案
path = r"C:\\Users" + "\\\\"    # 拼接一个反斜号
\`\`\`

## f-string：现代字符串格式化

Python 3.6+ 引入，**最推荐的格式化方式**。在字符串前加 \`f\`，用 \`{}\` 嵌入变量或表达式。

### 基本用法

\`\`\`python
name = "张三"
age = 25

# f-string：直接在 {} 里写变量名或表达式
print(f"我叫{name}，今年{age}岁")    # 我叫张三，今年25岁

# {} 里可以放表达式
print(f"明年我{age + 1}岁")           # 明年我26岁
print(f"2 的 10 次方是 {2 ** 10}")    # 2 的 10 次方是 1024

# {} 里可以调用函数
print(f"姓名长度: {len(name)}")       # 姓名长度: 2
print(f"大写: {name.upper()}")        # 这里 upper 没用因为是中文
\`\`\`

### 格式化数字

\`\`\`python
price = 19.99
count = 100
pi = 3.14159265358979

# :.2f 保留 2 位小数
print(f"价格: {price:.2f}")           # 价格: 19.99

# :.4f 保留 4 位小数
print(f"π ≈ {pi:.4f}")                # π ≈ 3.1416

# :, 千位分隔符
print(f"总数: {count:,}")             # 总数: 100（这里数字小看不出效果）
print(f"总数: {1234567:,}")           # 总数: 1,234,567

# :.2% 百分比
ratio = 0.85
print(f"完成率: {ratio:.2%}")         # 完成率: 85.00%

# :.2e 科学计数法
big = 123456789
print(f"大数: {big:.2e}")             # 大数: 1.23e+08
\`\`\`

### 对齐和填充

\`\`\`python
text = "hello"

# :>10 右对齐，总宽 10
print(f"{text:>10}")      #      hello（前面补空格）

# :<10 左对齐
print(f"{text:<10}|")     # hello     |

# :^10 居中
print(f"{text:^10}")      #   hello   

# :>10 用指定字符填充（在 > 前面写填充字符）
print(f"{text:->10}")     # -----hello（用 - 填充）
print(f"{text:*^10}")     # **hello***（用 * 居中填充）

# 数字也能对齐
n = 42
print(f"{n:08}")          # 00000042（前面补 0，总宽 8）
\`\`\`

### Python 3.12+ 新特性：嵌套 f-string

\`\`\`python
# Python 3.12 之前：嵌套 f-string 要用不同引号
names = ["Alice", "Bob"]
# print(f"{f'{name}!' for name in names}")    # 3.12 之前不行

# Python 3.12+：允许嵌套使用相同引号
result = f"用户: {f'{name}' for name in names}"
print(list(result))    # 字符化查看
\`\`\`

**f-string 是 Python 3.6+ 最推荐的格式化方式**，可读性最好，性能也最好。

## .format() 方法

f-string 之前的主流方式，现在也常用。用 \`{}\` 占位，\`.format()\` 传值。

\`\`\`python
# 位置参数
print("我叫{}，今年{}岁".format("张三", 25))    # 我叫张三，今年25岁

# 数字索引（可重复使用）
print("{0}说{1}，{0}笑了".format("张三", "hello"))
# 张三说hello，张三笑了

# 关键字参数
print("我叫{name}，今年{age}岁".format(name="张三", age=25))

# 混用
print("{name}的分数是{score}".format(name="李四", score=95))

# 格式化（和 f-string 一样的语法）
print("价格: {:.2f}".format(19.99))           # 价格: 19.99
print("{:>10}".format("hello"))               #      hello
\`\`\`

**何时用 .format()？** 当模板字符串是"动态"的（来自配置文件、用户输入）时，f-string 不行，必须用 .format()。

## % 格式化（老式，了解即可）

C 语言风格的格式化，**不推荐**，但老代码里会看到。

\`\`\`python
# %s 字符串，%d 整数，%f 浮点数
print("我叫%s，今年%d岁" % ("张三", 25))      # 我叫张三，今年25岁
print("价格: %.2f" % 19.99)                  # 价格: 19.99
print("%-10s|" % "hello")                    # hello     |（左对齐）
\`\`\`

**为什么不推荐？** 可读性差，类型必须严格匹配（\`%d\` 不能传字符串），多个参数要打包成元组容易出错。新代码用 f-string。

## 字符串拼接

### + 拼接

\`\`\`python
# + 拼接
s = "hello" + " " + "world"
print(s)    # hello world

# + 拼接很多次时性能差（每次都创建新字符串）
parts = ["a", "b", "c", "d"]
result = ""
for p in parts:
    result += p            # 每次 += 都创建新对象
print(result)              # abcd
\`\`\`

### join() 高效拼接（推荐）

\`\`\`python
# join 是拼接大量字符串的最佳方式
parts = ["a", "b", "c", "d"]

# "分隔符".join(列表)
result = "".join(parts)        # 无分隔
print(result)                  # abcd

result = "-".join(parts)       # 用 - 分隔
print(result)                  # a-b-c-d

result = ", ".join(parts)
print(result)                  # a, b, c, d
\`\`\`

**为什么 join 比 + 快？** \`+\` 拼接 N 个字符串要创建 N-1 个中间对象；\`join\` 一次性算出总长度，分配一次内存，性能高得多。**拼接大量字符串永远用 join**。

### 字面量拼接

\`\`\`python
# 相邻字符串字面量自动拼接
s = "hello" "world"        # 等同于 "helloworld"
\`\`\`

## 字符串重复

\`\`\`python
# 字符串 * 数字 = 重复
print("-" * 30)                # ------------------------------
print("abc" * 3)               # abcabcabc
print("=" * 5 + "标题" + "=" * 5)    # =====标题=====
\`\`\`

## 索引：访问单个字符

字符串的每个字符都有索引，**从 0 开始**，支持负数（从末尾数）。

\`\`\`python
s = "hello"

# 正向索引：0, 1, 2, 3, 4
print(s[0])    # h
print(s[1])    # e
print(s[4])    # o

# 负向索引：-1 是最后一个，-2 是倒数第二个
print(s[-1])   # o
print(s[-2])   # l
print(s[-5])   # h

# 越界会报错
# print(s[10])    # IndexError: string index out of range
\`\`\`

**为什么从 0 开始？** 索引本质是"偏移量"——第一个元素相对于开头的偏移是 0。这个设计在 C 语言里就确立了，Python 沿用。

## 切片：截取子串

切片是 Python 处理序列的利器，语法 \`s[start:stop:step]\`。

\`\`\`python
s = "hello world"

# s[start:stop]：从 start 到 stop-1
print(s[0:5])      # hello（0 到 4）
print(s[6:11])     # world（6 到 10）

# 省略 start：从开头
print(s[:5])       # hello

# 省略 stop：到结尾
print(s[6:])       # world

# 全省略：复制整个字符串
print(s[:])        # hello world

# 负数索引
print(s[-5:])      # world（最后 5 个字符）
print(s[:-6])      # hello（去掉最后 6 个字符）

# step：步长
print(s[::2])      # hlowrd（每隔 1 个取 1 个）
print(s[1::2])     # el ol（从 1 开始，每隔 1 个取）

# 负步长：反向
print(s[::-1])     # dlrow olleh（反转字符串！）
print(s[5::-1])    #  olleh（前 6 个字符反转）
\`\`\`

**切片的妙用**：

\`\`\`python
# 1. 反转字符串
text = "Python"
print(text[::-1])    # nohtyP

# 2. 取偶数位字符
s = "abcdefg"
print(s[::2])        # aceg

# 3. 删除首尾字符
s = "  hello  "
print(s[1:-1])       #  hello （去掉首尾各一个字符）

# 4. 取最后 N 个字符
filename = "report.pdf"
print(filename[-3:]) # pdf（取文件扩展名）
\`\`\`

**切片不会越界报错**：

\`\`\`python
s = "hello"
print(s[0:100])    # hello（不会报错，截到末尾为止）
print(s[10:20])    # ""（空字符串，越界部分没有内容）
\`\`\`

## 字符串长度：len()

\`\`\`python
s = "hello world"
print(len(s))         # 11

# 中文长度
s = "你好世界"
print(len(s))         # 4（Python 3 的字符串是 Unicode，一个中文字算 1 个字符）

# 字节数（编码后）
print(len(s.encode('utf-8')))    # 12（中文 UTF-8 占 3 字节）
\`\`\`

**Python 3 的字符串都是 Unicode**，\`len()\` 返回的是"字符数"，不是"字节数"。处理中文时不会有歧义。

## 常用字符串方法

### 大小写转换

\`\`\`python
s = "Hello World"

# 全大写
print(s.upper())          # HELLO WORLD

# 全小写
print(s.lower())          # hello world

# 首字母大写
print(s.capitalize())     # Hello world

# 每个单词首字母大写
print(s.title())          # Hello World

# 大小写互换
print(s.swapcase())       # hELLO wORLD
\`\`\`

### strip()：去首尾空白

\`\`\`python
s = "   hello world   "

# strip() 去掉首尾空白（空格、制表符、换行）
print(s.strip())          # "hello world"

# lstrip() 只去开头
print(s.lstrip())         # "hello world   "

# rstrip() 只去结尾
print(s.rstrip())         # "   hello world"

# 可以指定要去掉的字符
s = "###hello###"
print(s.strip("#"))       # hello

s = "abcHELLOabc"
print(s.strip("abc"))     # HELLO（去掉首尾的 a/b/c 字符）
\`\`\`

**strip 的实际用途**：处理用户输入时去空白。

\`\`\`python
# 用户输入可能前后有空格
user_input = "  张三  "
name = user_input.strip()
print(f"你好，{name}")    # 你好，张三
\`\`\`

### split()：分割字符串

\`\`\`python
# 默认按空白分割（任意多个空格、制表符、换行都算一个分隔符）
s = "hello   world\\tpython"
parts = s.split()
print(parts)              # ['hello', 'world', 'python']

# 按指定字符分割
s = "apple,banana,cherry"
parts = s.split(",")
print(parts)              # ['apple', 'banana', 'cherry']

# 限制分割次数
s = "a-b-c-d-e"
print(s.split("-", 2))    # ['a', 'b', 'c-d-e']（只分割 2 次）

# rsplit 从右边开始分割
print(s.rsplit("-", 2))   # ['a-b-c', 'd', 'e']
\`\`\`

### join()：拼接字符串（前面讲过）

\`\`\`python
# 把列表拼成字符串
parts = ["2026", "07", "19"]
date = "-".join(parts)
print(date)               # 2026-07-19

# 注意：join 的元素必须都是字符串
# numbers = [1, 2, 3]
# "-".join(numbers)       # TypeError
numbers = [1, 2, 3]
print("-".join(str(n) for n in numbers))    # 1-2-3
\`\`\`

### replace()：替换

\`\`\`python
s = "hello world"

# 替换所有匹配
print(s.replace("o", "0"))     # hell0 w0rld

# 限制替换次数
print(s.replace("l", "L", 1))  # heLlo world（只替换第一个）

# 替换子串
text = "我喜欢 Java，Java 很好用"
print(text.replace("Java", "Python"))    # 我喜欢 Python，Python 很好用
\`\`\`

### find() / index()：查找子串

\`\`\`python
s = "hello world"

# find 返回第一次出现的索引，找不到返回 -1
print(s.find("world"))     # 6
print(s.find("python"))    # -1

# 从指定位置开始找
print(s.find("o", 5))      # 7（从索引 5 开始找 o）

# rfind 从右边找
print(s.rfind("o"))        # 7

# index 和 find 一样，但找不到会报错
print(s.index("world"))    # 6
# print(s.index("python"))  # ValueError!
\`\`\`

**find vs index**：找不到时 find 返回 -1，index 抛 ValueError。如果不确定子串是否存在，用 find 更安全；如果确定存在，用 index。

### count()：计数

\`\`\`python
s = "hello world"
print(s.count("l"))        # 3（l 出现 3 次）
print(s.count("o"))        # 2
print(s.count("xyz"))      # 0
\`\`\`

### startswith() / endswith()：前后缀判断

\`\`\`python
filename = "report.pdf"

# 判断后缀（很常用）
print(filename.endswith(".pdf"))      # True
print(filename.endswith(".docx"))     # False

# 判断前缀
print(filename.startswith("report"))  # True

# 可以传元组判断多个
print(filename.endswith((".pdf", ".docx", ".txt")))    # True
\`\`\`

**判断文件类型**是 endswith 最常见的用途。

### 判断字符类型

\`\`\`python
# 判断字符串是否全是某种字符
print("12345".isdigit())     # True（全是数字）
print("hello".isalpha())     # True（全是字母）
print("hello123".isalnum())  # True（字母或数字）
print("   ".isspace())       # True（全是空白）
print("HELLO".isupper())     # True（全大写）
print("hello".islower())     # True（全小写）

# 实战：判断用户输入是否是纯数字
user_input = "12345"
if user_input.isdigit():
    num = int(user_input)
    print(f"输入的数字是 {num}")
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第四章综合 demo：字符串处理综合实战
# 模拟：解析 CSV 格式的学生成绩
# ============================================

# 假装这是从文件读到的 CSV 数据
csv_data = """
姓名,语文,数学,英语
张三,85,92,78
李四,76,88,95
王五,90,85,82
"""

# 1. 按行分割
lines = csv_data.strip().split("\\n")
print(f"读到 {len(lines)} 行数据")

# 2. 第一行是表头
header = lines[0].split(",")
print(f"表头: {header}")

# 3. 解析每一行
students = []
for line in lines[1:]:
    parts = line.split(",")
    name = parts[0]
    # 把成绩从字符串转成整数
    scores = [int(x) for x in parts[1:]]
    students.append((name, scores))

# 4. 计算每个学生的总分和平均分
print()
print("--- 成绩单 ---")
print(f"{'姓名':<6}{'语文':<6}{'数学':<6}{'英语':<6}{'总分':<6}{'平均':<6}")
for name, scores in students:
    total = sum(scores)
    avg = total / len(scores)
    # 用 f-string 格式化对齐
    print(f"{name:<6}", end="")
    for s in scores:
        print(f"{s:<6}", end="")
    print(f"{total:<6}{avg:<6.1f}")

# 5. 找出每科最高分的学生
print()
print("--- 单科状元 ---")
subjects = ["语文", "数学", "英语"]
for i, subject in enumerate(subjects):
    # 用 max 配合 key 函数找最高分
    best = max(students, key=lambda x: x[1][i])
    print(f"{subject}: {best[0]} ({best[1][i]} 分)")

# 6. 字符串处理：把成绩单格式化成 markdown 表格
print()
print("--- Markdown 表格 ---")
md = "| 姓名 |" + "|".join(subjects) + "| 总分 |\\n"
md += "|" + "---|" * (len(subjects) + 2) + "\\n"
for name, scores in students:
    total = sum(scores)
    md += f"| {name} |" + "|".join(str(s) for s in scores) + f"| {total} |\\n"
print(md)
\`\`\`

这段 demo 综合用了：strip、split、len、join、f-string 对齐、enumerate、max 配合 key。**仔细看每行，理解每个字符串方法的用途**。

## ⚠️ 初学者常见坑

### 坑一：字符串是不可变的

\`\`\`python
s = "hello"
# s[0] = "H"    # TypeError: 'str' object does not support item assignment

# 正确：创建新字符串
s = "H" + s[1:]
print(s)    # Hello
\`\`\`

**字符串不可变**——所有"修改"字符串的方法都是返回新字符串，原字符串不变。

### 坑二：中文标点

\`\`\`python
# 错误：引号是中文的
# s = "hello"    # 这个引号是中文的，会报错

# 正确：用英文引号
s = "hello"
\`\`\`

### 坑三：+ 拼接非字符串

\`\`\`python
# 错误
# print("年龄: " + 25)    # TypeError

# 正确：转成字符串
print("年龄: " + str(25))

# 或者用 f-string
age = 25
print(f"年龄: {age}")
\`\`\`

### 坑四：% 格式化忘记传元组

\`\`\`python
# 错误：多个参数没打包成元组
# print("%s %d" % "hello", 25)    # TypeError

# 正确
print("%s %d" % ("hello", 25))
\`\`\`

## 小结

- 字符串用单引号、双引号、三引号都能创建，三引号支持多行
- 转义字符 \`\\n\` \`\\t\` \`\\\\\` 处理特殊字符
- 原始字符串 \`r''\` 让反斜杠原样输出，写正则和路径时必备
- f-string（Python 3.6+）是最推荐的格式化方式：\`f"{var:.2f}"\`
- 格式化语法：\`:.2f\` 保留小数、\`:, \` 千分位、\`:>10\` 右对齐、\`:^10\` 居中
- 拼接大量字符串用 \`join()\`，比 \`+\` 高效得多
- 索引 \`s[0]\` \`s[-1]\`，切片 \`s[1:5]\` \`s[::-1]\`（反转）
- 常用方法：\`upper/lower/strip/split/join/replace/find/count/startswith/endswith\`
- 字符串是不可变的，所有"修改"操作都返回新字符串

## 常见疑问 Q&A

**Q：单引号和双引号该用哪个？**
A：看你字符串里包含什么。含单引号用双引号包，含双引号用单引号包。团队规范统一即可，PEP 8 没强制。

**Q：f-string 和 .format() 哪个好？**
A：f-string 更简洁可读，性能也更好。但模板字符串是"动态"的（来自配置）时必须用 .format()。

**Q：\`len("你好")\` 为什么是 2 不是 6？**
A：Python 3 的字符串是 Unicode，\`len\` 返回字符数。要看字节数用 \`len(s.encode('utf-8'))\`。

**Q：字符串能用 \`+\` 拼接列表吗？**
A：不能。\`+\` 只能拼接字符串和字符串。要把列表拼成字符串用 \`"".join(list)\`。`
  },

  // -----------------------------------------------------------
  // 第五章：输入输出与格式化
  // -----------------------------------------------------------
  {
    id: "py10-ch05",
    group: "第一部分 Python 入门基础",
    icon: "🖥️",
    title: "第五章 输入输出与格式化",
    content: `## print() 完全指南

\`print()\` 是你最常用的函数，第一章已经介绍过基础，本章深入讲透它的所有参数。

### print() 的完整签名

\`\`\`python
# print 的完整签名
# print(*objects, sep=' ', end='\\n', file=sys.stdout, flush=False)

# - *objects：要打印的内容，可以多个
# - sep：多个内容之间的分隔符，默认空格
# - end：打印完的结尾字符，默认换行 \\n
# - file：输出到哪，默认 sys.stdout（屏幕）
# - flush：是否立即刷新缓冲区，默认 False
\`\`\`

### sep：分隔符

\`\`\`python
# 默认用空格分隔
print("2026", "07", "19")          # 2026 07 19

# 自定义分隔符
print("2026", "07", "19", sep="-") # 2026-07-19
print("apple", "banana", "cherry", sep=" | ")    # apple | banana | cherry
print("hello", "world", sep="")    # helloworld（无分隔）

# 实战：打印 CSV 行
print("张三", 85, 92, 78, sep=",")    # 张三,85,92,78
\`\`\`

### end：结尾字符

\`\`\`python
# 默认 end="\\n" 换行
print("第一行")
print("第二行")
# 第一行
# 第二行

# 改 end 让多行 print 接在同一行
print("加载中", end="")
print("...", end="")
print("完成")
# 加载中...完成

# 用 \\r 回到行首，做进度条效果
import time
for i in range(5):
    print(f"\\r进度: {'#' * (i+1)}{'.' * (4-i)} {i+1}/5", end="")
    time.sleep(0.3)
print(" ✓")
\`\`\`

### file：输出到文件

\`\`\`python
import sys

# 默认输出到标准输出（屏幕）
print("这条显示在屏幕")

# 输出到标准错误流（红色显示，不干扰正常输出）
print("这条是错误信息", file=sys.stderr)

# 输出到文件
with open("log.txt", "w", encoding="utf-8") as f:
    print("写入文件的内容", file=f)
    print("第二行", file=f)
# 文件 log.txt 里会有两行内容
\`\`\`

### flush：立即刷新

\`\`\`python
import time

# 不 flush：可能延迟输出（缓冲区没满）
# flush=True：立即输出
print("开始", flush=True)
time.sleep(1)
print("结束", flush=True)

# 进度条场景必须 flush，否则卡住不显示
for i in range(1, 11):
    print(f"\\r{i*10}%", end="", flush=True)
    time.sleep(0.1)
print(" 完成")
\`\`\`

**为什么有缓冲区？** 频繁写屏幕/文件很慢，Python 攒一批一起写。但进度条、实时日志需要"立刻显示"，这时用 \`flush=True\`。

## input()：读取用户输入

\`input()\` 从键盘读取一行输入，**返回字符串**。

\`\`\`python
# 基本用法
name = input("请输入姓名: ")
print(f"你好，{name}")

# 注意：input 返回的永远是字符串！
age_str = input("请输入年龄: ")
# age_str 是字符串，不能直接做数学运算
# print(age_str + 1)    # TypeError

# 要做数学运算，必须先转换
age = int(age_str)
print(f"明年你 {age + 1} 岁")
\`\`\`

### 安全的输入处理

\`\`\`python
# 用户可能输入乱七八糟的东西，必须做错误处理
def safe_int_input(prompt, default=0):
    """安全读取整数输入，失败返回默认值"""
    try:
        return int(input(prompt))
    except ValueError:
        print("输入无效，使用默认值")
        return default

age = safe_int_input("请输入年龄: ", default=18)
print(f"你的年龄是 {age}")
\`\`\`

### 读取多个值

\`\`\`python
# 方法一：多次 input
name = input("姓名: ")
age = input("年龄: ")

# 方法二：一次读多个，用 split 分割
line = input("输入姓名和年龄（用空格分隔）: ")
parts = line.split()
if len(parts) >= 2:
    name = parts[0]
    age = int(parts[1])
    print(f"{name}, {age} 岁")
\`\`\`

### input() 的限制

\`\`\`python
# input() 只能读一行，遇到回车就结束
# 不能读特殊键（方向键、功能键）
# 不能隐藏输入（密码场景）

# 密码输入：用 getpass 模块
import getpass
# password = getpass.getpass("密码: ")    # 输入时不显示
# print(f"你输入了 {len(password)} 位密码")
\`\`\`

## f-string 格式化完全指南

f-string 是 Python 3.6+ 最推荐的格式化方式，第二章介绍过基础，这里讲透所有用法。

### 基础语法

\`\`\`python
name = "张三"
age = 25
height = 1.75

# 变量替换
print(f"我叫 {name}，今年 {age} 岁")    # 我叫 张三，今年 25 岁

# 表达式
print(f"明年 {age + 1} 岁")             # 明年 26 岁
print(f"2 的 10 次方 = {2 ** 10}")      # 2 的 10 次方 = 1024

# 调用函数
print(f"姓名长度: {len(name)}")         # 姓名长度: 2
print(f"大写: {name.upper()}")          # 大写: 张三（中文无效果）

# 访问字典
user = {"name": "李四", "age": 30}
print(f"用户: {user['name']}")          # 用户: 李四

# 访问对象属性
import datetime
now = datetime.datetime.now()
print(f"现在是 {now.year} 年")          # 现在是 2026 年
\`\`\`

### 数字格式化

\`\`\`python
pi = 3.14159265358979
price = 19.99
big_num = 1234567
ratio = 0.85

# 浮点数精度
print(f"{pi:.2f}")         # 3.14（保留 2 位小数）
print(f"{pi:.4f}")         # 3.1416（4 位）
print(f"{pi:.10f}")        # 3.1415926536（10 位）

# 整数
print(f"{42:5d}")          #    42（总宽 5，右对齐）
print(f"{42:05d}")         # 00042（用 0 填充）

# 千分位
print(f"{big_num:,}")      # 1,234,567
print(f"{big_num:,.2f}")   # 1,234,567.00（千分位 + 2 位小数）

# 百分比
print(f"{ratio:.2%}")      # 85.00%
print(f"{ratio:.0%}")      # 85%

# 科学计数法
print(f"{big_num:.2e}")    # 1.23e+06
print(f"{big_num:.4e}")    # 1.2346e+06

# 不同进制
n = 255
print(f"十进制: {n}")       # 255
print(f"二进制: {n:b}")     # 11111111
print(f"八进制: {n:o}")     # 377
print(f"十六进制: {n:x}")   # ff
print(f"十六进制大写: {n:X}")   # FF
print(f"带前缀: {n:#x}")    # 0xff
\`\`\`

### 对齐与填充

\`\`\`python
text = "hello"

# 默认左对齐（字符串）
print(f"{text:10}|")        # hello     |

# > 右对齐
print(f"{text:>10}|")       #      hello|

# < 左对齐（明确写出来）
print(f"{text:<10}|")       # hello     |

# ^ 居中
print(f"{text:^10}|")       #   hello   |

# 自定义填充字符（写在 < > ^ 前面）
print(f"{text:->10}|")      # -----hello|
print(f"{text:*<10}|")      # hello*****|
print(f"{text:.^10}|")      # ..hello...|

# 数字默认右对齐
print(f"{42:10}")           #         42
print(f"{42:<10}")          # 42
\`\`\`

### 表格对齐实战

\`\`\`python
# 用 f-string 对齐做表格输出
students = [
    ("张三", 85, 92, 78),
    ("李四四", 76, 88, 95),
    ("王五", 90, 85, 82),
]

# 表头
print(f"{'姓名':<6}{'语文':>6}{'数学':>6}{'英语':>6}{'总分':>6}")
print("-" * 30)

# 数据行
for name, chinese, math, english in students:
    total = chinese + math + english
    print(f"{name:<6}{chinese:>6}{math:>6}{english:>6}{total:>6}")
\`\`\`

### 日期格式化

\`\`\`python
import datetime
now = datetime.datetime.now()

# 直接用 strftime 风格的格式
# 注意：f-string 里 : 后面是格式说明符
print(f"{now:%Y-%m-%d %H:%M:%S}")     # 2026-07-19 14:30:25
print(f"{now:%Y年%m月%d日}")            # 2026年07月19日
print(f"{now:%H时%M分%S秒}")            # 14时30分25秒
print(f"{now:%A}")                     # Sunday（星期几）
print(f"{now:%B}")                     # July（月份）
\`\`\`

### Python 3.8+ 新特性：= 调试

\`\`\`python
# Python 3.8+：在 f-string 里用 = 自动显示变量名和值
x = 42
y = "hello"
print(f"{x = }")           # x = 42
print(f"{y = }")           # y = 'hello'
print(f"{x + 1 = }")       # x + 1 = 43

# 排查 bug 时超有用
def calc(a, b):
    result = a * b + 1
    print(f"{a = }, {b = }, {result = }")    # 一行打印所有变量
    return result

calc(3, 4)
# a = 3, b = 4, result = 13
\`\`\`

### Python 3.12+ 新特性：复用格式说明符

\`\`\`python
# Python 3.12 之前：每个变量都要写格式说明
# print(f"{a:.2f} {b:.2f} {c:.2f}")

# Python 3.12+：可以用变量复用格式说明
precision = ".2f"
a, b, c = 3.14159, 2.71828, 1.41421
print(f"{a:{precision}} {b:{precision}} {c:{precision}}")
# 3.14 2.72 1.41
\`\`\`

## Format Specification Mini-Language

f-string 和 .format() 共用一套"格式说明符"语法，叫 **format spec mini-language**。完整语法：

\`\`\`
[[fill]align][sign][#][0][width][grouping_option][.precision][type]
\`\`\`

| 字段 | 含义 | 示例 |
|------|------|------|
| fill | 填充字符 | \`*\` \`-\` \`.\` |
| align | 对齐方式 | \`<\` 左 \`>\` 右 \`^\` 居中 \`=\` 数字专用 |
| sign | 符号显示 | \`+\` 显示正负 \`-\` 只显示负 \` \` 正号显示空格 |
| # | 显示进制前缀 | \`#x\` \`#o\` \`#b\` |
| 0 | 用 0 填充 | \`08d\` |
| width | 总宽度 | \`10\` |
| , | 千分位 | \`,\` 或 \`_\` |
| .precision | 小数位数 | \`.2f\` |
| type | 类型 | \`d\` \`f\` \`e\` \`% \` \`x\` \`b\` \`s\` |

### 完整示例

\`\`\`python
n = 42
# [[fill]align][sign][#][0][width][,][.precision][type]

# 填充 *，右对齐，宽度 10
print(f"{n:*>10}")        # ********42

# 显示正负号
print(f"{42:+}")          # +42
print(f"{-42:+}")         # -42
print(f"{42:-}")          # 42（默认行为）
print(f"{42: }")          #  42（正号显示空格）

# 0 填充
print(f"{42:08}")         # 00000042
print(f"{42:+08}")        # +0000042

# 千分位 + 小数
print(f"{1234567.891:,.2f}")    # 1,234,567.89

# 用 _ 做千分位（适合二进制）
print(f"{0b11111111:_b}")       # 1111_1111
\`\`\`

## sys.stdin / sys.stdout：标准输入输出

\`input()\` 和 \`print()\` 是"高级"封装，背后用的是 \`sys.stdin\` 和 \`sys.stdout\`。

\`\`\`python
import sys

# print() 等价于
sys.stdout.write("hello\\n")
sys.stdout.flush()

# input() 等价于
# sys.stdout.write("提示: ")
# sys.stdout.flush()
# line = sys.stdin.readline().rstrip("\\n")
\`\`\`

### 直接用 sys.stdin 读多行

\`\`\`python
import sys

# 读所有行（按 Ctrl+D 结束）
# lines = sys.stdin.readlines()

# 逐行读
# for line in sys.stdin:
#     print(f"读到: {line.rstrip()}")

# 读单行
# line = sys.stdin.readline()
\`\`\`

**何时直接用 sys.stdin？** 处理大量输入（如算法题）、管道输入（\`cat file | python script.py\`）时，比 input() 更高效。

## pprint：美观打印

\`pprint\`（pretty printer）模块用于打印复杂的数据结构，让它"好看"。

\`\`\`python
from pprint import pprint

# 普通打印：挤成一行
data = {
    "users": [
        {"name": "张三", "age": 25, "hobbies": ["读书", "运动", "编程"]},
        {"name": "李四", "age": 30, "hobbies": ["音乐", "旅行"]},
    ],
    "settings": {"theme": "dark", "language": "zh-CN"}
}

print("普通 print:")
print(data)

print()
print("pprint 美观打印:")
pprint(data, width=40, sort_dicts=False)
\`\`\`

### pprint 的常用参数

\`\`\`python
import pprint

# indent：缩进
# width：每行最大宽度
# depth：最大嵌套深度
# sort_dicts：是否对字典键排序

pprint.pprint(data, indent=2, width=50, sort_dicts=True)

# pprint.pformat 返回字符串而不是打印
formatted = pprint.pformat(data, indent=2)
print(f"格式化后的长度: {len(formatted)}")
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第五章综合 demo：格式化与输入输出综合
# 模拟：成绩录入与统计报表
# ============================================

# 假装用户已经输入了数据（实际场景用 input）
raw_input = """
张三,85,92,78
李四,76,88,95
王五,90,85,82
赵六,88,76,91
""".strip()

# 1. 解析数据
students = []
for line in raw_input.split("\\n"):
    parts = line.split(",")
    name = parts[0]
    scores = [int(x) for x in parts[1:]]
    students.append({"name": name, "scores": scores})

# 2. 计算统计
for s in students:
    s["total"] = sum(s["scores"])
    s["average"] = s["total"] / len(s["scores"])

# 3. 打印美观的报表
print()
print("=" * 50)
print("            学生成绩统计报表")
print("=" * 50)
print()

# 表头（用 f-string 对齐）
subjects = ["语文", "数学", "英语"]
header = f"{'姓名':<6}"
for sub in subjects:
    header += f"{sub:>6}"
header += f"{'总分':>6}{'平均':>8}"
print(header)
print("-" * 50)

# 数据行
for s in students:
    line = f"{s['name']:<6}"
    for score in s["scores"]:
        line += f"{score:>6}"
    line += f"{s['total']:>6}{s['average']:>8.2f}"
    print(line)

print("-" * 50)

# 4. 计算班级统计
all_totals = [s["total"] for s in students]
class_avg = sum(all_totals) / len(all_totals)
class_max = max(all_totals)
class_min = min(all_totals)

print(f"班级总分平均: {class_avg:.2f}")
print(f"班级最高总分: {class_max}")
print(f"班级最低总分: {class_min}")

# 5. 排名（按总分降序）
print()
print("--- 总分排名 ---")
ranked = sorted(students, key=lambda x: x["total"], reverse=True)
for i, s in enumerate(ranked, 1):
    # 用 = 调试语法显示排名
    print(f"第 {i} 名: {s['name']} ({s['total']} 分)")

# 6. 用 pprint 显示原始数据结构
print()
print("--- 原始数据结构 ---")
import pprint
pprint.pprint(students, indent=2, sort_dicts=False, width=60)
\`\`\`

这段 demo 综合用了：f-string 对齐（\`:<6\` \`:>6\`）、浮点数格式化（\`:.2f\`）、pprint、enumerate、sorted 配合 key。**是格式化输出的典型实战**。

## ⚠️ 初学者常见坑

### 坑一：input 返回字符串

\`\`\`python
# 错误
age = input("年龄: ")
# print(age + 1)    # TypeError

# 正确
age = int(input("年龄: "))
print(age + 1)
\`\`\`

### 坑二：f-string 里引号冲突

\`\`\`python
# 错误：f-string 用双引号，里面也用双引号
# print(f"用户: {"张三"}")    # SyntaxError（3.12 之前）

# 正确：用不同引号
print(f"用户: {'张三'}")       # 用户: 张三

# Python 3.12+ 可以用相同引号
# print(f"用户: {"张三"}")    # 3.12+ OK
\`\`\`

### 坑三：浮点数格式化精度

\`\`\`python
# 注意四舍五入的细节
print(f"{2.675:.2f}")    # 2.67（不是 2.68！）

# 原因：2.675 在浮点数里实际是 2.67499999...
# 解决方案：用 decimal
from decimal import Decimal
print(f"{Decimal('2.675'):.2f}")    # 2.68
\`\`\`

### 坑四：忘记 flush

\`\`\`python
import time
# 进度条不刷新
for i in range(5):
    print(f"\\r{i+1}/5", end="")    # 没 flush，可能整个循环结束才显示
    time.sleep(0.5)

# 正确：加 flush=True
for i in range(5):
    print(f"\\r{i+1}/5", end="", flush=True)
    time.sleep(0.5)
\`\`\`

## 小结

- \`print()\` 完整签名：\`print(*objects, sep=' ', end='\\n', file=sys.stdout, flush=False)\`
- \`input()\` 返回字符串，做数学运算前必须转换类型
- f-string 是最推荐的格式化方式，语法 \`f"{var:format}"\`
- 数字格式化：\`:.2f\` 小数、\`:, \` 千分位、\`:.2%\` 百分比、\`:.2e\` 科学计数法
- 对齐：\`:>10\` 右对齐、\`:<10\` 左对齐、\`:^10\` 居中、填充字符写在符号前
- 进制：\`:b\` 二进制、\`:o\` 八进制、\`:x\` 十六进制、\`:#x\` 带前缀
- 日期：\`{now:%Y-%m-%d %H:%M:%S}\` 直接用 strftime 格式
- Python 3.8+ \`=\` 调试语法：\`f"{x = }"\` 自动显示变量名
- \`pprint\` 模块打印复杂数据结构更美观
- 进度条、实时输出场景记得 \`flush=True\`

## 常见疑问 Q&A

**Q：f-string 和 .format() 哪个好？**
A：f-string 更简洁可读，性能更好，新代码首选。但模板字符串是动态的（来自配置文件）时必须用 .format()。

**Q：\`print(f"{x:.2f}")\` 里的 \`.2f\` 怎么记？**
A：\`.\` 是小数点，\`2\` 是位数，\`f\` 是 float。组合起来就是"浮点数保留 2 位小数"。

**Q：为什么 \`2.675:.2f\` 不是 2.68？**
A：浮点数精度问题，2.675 实际存的是 2.674999...，格式化时被截成 2.67。要精确用 \`decimal\` 模块。

**Q：怎么打印进度条？**
A：用 \`\\r\` 回到行首 + \`end=""\` + \`flush=True\`，每帧覆盖上一行。后面章节会讲 \`tqdm\` 库做更漂亮的进度条（但那是第三方库）。

**Q：input() 能读密码吗？**
A：不能，输入会显示。用 \`getpass.getpass()\` 替代，输入时不显示。`
  }
];
