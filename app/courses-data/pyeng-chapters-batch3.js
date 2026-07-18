// =============================================================
// Python 工程化教程 - 第 3 批章节(命令行工具)
// =============================================================
// 本文件包含以下章节(group 均为 "命令行工具"):
//   1. pyeng-cli-intro             — 命令行工具与 sys.argv
//   2. pyeng-cli-argparse-basics   — argparse 基础
//   3. pyeng-cli-argparse-advanced — argparse 进阶
//   4. pyeng-cli-click             — Click 框架
//   5. pyeng-cli-typer             — Typer 框架
//   6. pyeng-cli-compare           — 三大 CLI 框架对比与选型
//
// 写作约定:
//   - content 为模板字符串,内部反引号全部转义为 \`
//   - content 内部 ${} 全部转义为 \${}
//   - 每章末尾附「易错点小结」表格
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:命令行工具与 sys.argv
  // =========================================================
  {
    id: "pyeng-cli-intro",
    icon: "💻",
    title: "命令行工具与 sys.argv",
    group: "命令行工具",
    content: `# 命令行工具与 sys.argv

## 一、为什么写命令行工具

在图形界面(GUI)满天飞的今天,命令行工具(CLI,Command-Line Interface)看起来"原始"、"简陋",但它依然是工程师最趁手的瑞士军刀。从 \`git\`、\`docker\`、\`kubectl\` 到 \`pip\`、\`npm\`、\`cargo\`,几乎所有影响深远的开发者工具都以 CLI 形态存在。

为什么?因为 CLI 有几个 GUI 难以替代的优势:

| 优势 | 说明 | 例子 |
|------|------|------|
| **自动化** | 可以被脚本调用,串进流水线 | \`./deploy.sh && ./smoke-test.py\` |
| **可组合** \| 通过管道、重定向组合多个工具 \| \`cat log.txt \| grep ERROR \| wc -l\` |
| **可远程** | SSH 进服务器就能用,无需图形环境 | 在跳板机上跑 \`pg_dump\` |
| **可重现** | 一条命令记录了完整操作,可复现、可文档化 | README 写"运行 \`python train.py --epochs 50\`" |
| **资源省** | 启动快、占用低,适合批量任务 | 一次跑 1000 个文件的批处理 |
| **易测试** | 输入输出都是文本,容易写自动化测试 | \`assert "error" in run_cli("--bad-flag")\` |

一句话:**CLI 是给"程序"和"工程师"用的,GUI 是给"人"用的**。当任务需要重复执行、批量执行、组合执行时,CLI 是唯一选择。

### 1.1 一个真实场景

假设你写了一个数据清洗脚本 \`clean.py\`,处理一个 CSV:

\`\`\`python
# clean.py - 第一版:硬编码路径
import pandas as pd

df = pd.read_csv("/data/raw.csv")  # 路径写死,换文件就得改代码
df = df.dropna()
df.to_csv("/data/clean.csv", index=False)
print("done")
\`\`\`

这能跑,但问题一大堆:

- 换输入文件?改源码。
- 想输出到别处?改源码。
- 想保留缺失值?改源码。
- 同事要用?告诉他"打开 clean.py 把第 4 行路径改了"。

这就是没有 CLI 的痛苦。一个带 CLI 的版本应该是这样:

\`\`\`bash
python clean.py --input /data/raw.csv --output /data/clean.csv --keep-na
\`\`\`

同一个脚本,处理任何文件、任何输出路径、保留或丢弃缺失值,全靠参数决定。这才是"工具",之前那个只能叫"一次性脚本"。

## 二、CLI vs GUI:不只是界面差异

CLI 和 GUI 的差别,远不止"一个打字一个点鼠标"。它们代表了两种不同的设计哲学。

\`\`\`text
GUI 哲学                           CLI 哲学
─────────────────────────────────────────────────────────────
"看一眼就知道怎么用"               "读文档才知道怎么用,但用起来快"
引导式:按钮、菜单、向导            命令式:一行命令完成
可视化反馈:进度条、动画            文本反馈:状态码、日志
难自动化:得用 RPA 模拟点击         天然可自动化:就是字符串
难组合:窗口之间无法串接            天然可组合:管道 |
适合偶尔使用的普通用户              适合频繁使用的工程师
"做这件事,点这里"                 "做这件事,执行这条命令"
\`\`\`

一个有趣的对照:**VS Code 是 GUI,但它的核心功能都能通过命令面板(Ctrl+Shift+P)和 \`code\` 命令行调用**。现代 IDE 之所以高效,正是因为它在 GUI 里"嵌"了一个 CLI 层。

### 2.1 什么时候该写 CLI

| 场景 | 该不该写 CLI | 原因 |
|------|--------------|------|
| 内部运维脚本(部署、备份) | ✅ 该写 | 要 cron 调度、要 SSH 远程跑 |
| 数据处理 pipeline | ✅ 该写 | 多个步骤要串联,参数要可调 |
| 给开发者的工具(lint、format) | ✅ 该写 | 要集成进编辑器、CI |
| 给非技术用户的数据录入 | ❌ 别写 | 他们不会用终端 |
| 一次性探索性分析(jupyter) | ❌ 别写 | 交互式探索比 CLI 顺手 |
| 需要可视化拖拽的流程编排 | ❌ 别写 | GUI 表达力更强 |

## 三、Unix 哲学:一个工具做好一件事

聊 CLI 就绕不开 Unix 哲学。Doug McIlroy(管道发明者)总结的 Unix 原则,几十年来仍是 CLI 设计的黄金准则:

1. **每个程序做好一件事** —— 别把 cat 写成 cat+grep+sort
2. **程序的输出可以是另一个程序的输入** —— 用管道 \`|\` 串起来
3. **写文本流,别写二进制** —— 文本是通用接口
4. **优先用小工具组合,而非大而全的怪物** —— \`grep | sort | uniq -c | sort -rn\`
5. **沉默是金** —— 成功就别废话,失败才报错
6. **返回有意义的退出码** —— 0 表示成功,非 0 表示失败

看一个经典例子,统计日志里出现最多的 10 个 IP:

\`\`\`bash
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
\`\`\`

六个小工具,一条管道,搞定。没有一行 Python,没有一个 if。这就是 Unix 哲学的力量:**组合优于集成**。

### 3.1 Python 写 CLI 也要遵循 Unix 哲学

很多人用 Python 写 CLI 时容易犯一个错:把所有功能塞进一个"上帝命令"。比如:

\`\`\`bash
# 反面教材:一个命令干所有事,参数 30 个
python mytool.py --action=clean --input=a.csv --output=b.csv --keep-na --log=debug --color=auto --format=csv --encoding=utf-8 --yes --no-confirm ...
\`\`\`

正确的做法是拆成子命令,每个子命令职责单一:

\`\`\`bash
# 正面教材:子命令各司其职
python mytool.py clean --input a.csv --output b.csv --keep-na
python mytool.py validate a.csv
python mytool.py convert --from csv --to parquet a.csv b.parquet
\`\`\`

这就是 \`git\` 的设计:\`git add\`、\`git commit\`、\`git push\` 各管一摊,而不是 \`git --action=add --action=commit --action=push\`。后面讲 argparse/click/typer 都会涉及子命令。

## 四、sys.argv:最原始的命令行参数

Python 解释器启动时,会把命令行参数塞进 \`sys.argv\` 这个列表。这是最底层、最原始的接口。

\`\`\`python
# demo_argv.py
import sys

print(f"参数总数: {len(sys.argv)}")
for i, arg in enumerate(sys.argv):
    print(f"  sys.argv[{i}] = {arg!r}")
\`\`\`

运行:

\`\`\`bash
$ python demo_argv.py --name Alice --age 30 extra
参数总数: 5
  sys.argv[0] = 'demo_argv.py'
  sys.argv[1] = '--name'
  sys.argv[2] = 'Alice'
  sys.argv[3] = '--age'
  sys.argv[4] = '30'
  # 注意:'extra' 也是参数,但上面命令里没传,这里假设传了
\`\`\`

### 4.1 sys.argv 的两条铁律

1. **\`sys.argv[0]\` 永远是程序名**(脚本文件名,或 \`-c\` 后的字符串)
2. **\`sys.argv[1:]\` 才是真正的参数**

\`\`\`python
import sys

# 错误:把 argv[0] 当参数用
# if sys.argv[1] == "--help":  # 如果用户没传参数,这里 IndexError

# 正确:先取 argv[1:],再判断
args = sys.argv[1:]
if not args:
    print("用法: python demo.py --name <名字>")
    sys.exit(1)
\`\`\`

### 4.2 一个完整的 sys.argv demo

下面用纯 \`sys.argv\` 手写一个"问候"CLI,支持 \`--name\`、\`--count\`、\`--help\`:

\`\`\`python
# greet_raw.py - 纯 sys.argv 手写 CLI
import sys

def main():
    args = sys.argv[1:]

    # 1. 处理 --help / -h
    if "-h" in args or "--help" in args:
        print("用法: python greet_raw.py [--name NAME] [--count N]")
        print("  --name NAME   被问候的名字(默认 World)")
        print("  --count N     重复次数(默认 1)")
        return 0

    # 2. 解析 --name 和 --count
    name = "World"
    count = 1
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--name":
            if i + 1 >= len(args):
                print("错误: --name 需要一个值", file=sys.stderr)
                return 2
            name = args[i + 1]
            i += 2
        elif arg == "--count":
            if i + 1 >= len(args):
                print("错误: --count 需要一个值", file=sys.stderr)
                return 2
            try:
                count = int(args[i + 1])
            except ValueError:
                print(f"错误: --count 需要整数,得到 {args[i + 1]!r}", file=sys.stderr)
                return 2
            i += 2
        else:
            print(f"错误: 未知参数 {arg!r}", file=sys.stderr)
            return 2

    # 3. 执行业务
    for _ in range(count):
        print(f"Hello, {name}!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
\`\`\`

运行效果:

\`\`\`bash
$ python greet_raw.py
Hello, World!

$ python greet_raw.py --name Alice --count 3
Hello, Alice!
Hello, Alice!
Hello, Alice!

$ python greet_raw.py --count two
错误: --count 需要整数,得到 'two'

$ python greet_raw.py --help
用法: python greet_raw.py [--name NAME] [--count N]
  --name NAME   被问候的名字(默认 World)
  --count N     重复次数(默认 1)
\`\`\`

### 4.3 手写解析的痛苦

上面 30 多行代码,只实现了两个参数。想象一下如果参数变成 10 个、20 个,还要支持:

- 可选参数和位置参数混用
- 参数简写(\`-n\` 等价 \`--name\`)
- 参数值类型校验(int/float/path/文件存在性)
- \`--name=Alice\` 等号写法
- 互斥参数(\`--verbose\` 和 \`--quiet\` 不能同时给)
- 子命令
- 自动生成帮助、版本信息

每一条都得手写。下面是手写解析的几个典型痛点:

| 痛点 | 例子 | 后果 |
|------|------|------|
| IndexError | 用户没传值,你直接 \`args[i+1]\` | 程序崩溃 |
| 类型转换 | \`int("two")\` 抛 ValueError | 要手动 try/except |
| 帮助文本 | 30 行 print 语句 | 改个参数忘了改帮助 |
| 简写冲突 | \`-n\` 是 \`--name\` 还是 \`--no\`? | 歧义 |
| 等号写法 | \`--name=Alice\` 不被识别 | 用户骂娘 |
| 退出码混乱 | 错误时该返回 1 还是 2? | 脚本没法判断 |
| 重复参数 | \`--file a.txt --file b.txt\` | 要自己 append |

这就是为什么 Python 标准库提供了 \`argparse\`,社区有了 \`Click\`、\`Typer\` —— 它们把这些样板全包了。

## 五、getopt 模块:老旧方案,简略带过

在 \`argparse\` 出现之前,Python 有个 \`getopt\` 模块,模仿 C 语言的 \`getopt\` 函数。它的 API 长这样:

\`\`\`python
# greet_getopt.py - 不推荐,仅作了解
import sys
import getopt

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hn:c:", ["help", "name=", "count="])
    except getopt.GetoptError as e:
        print(e, file=sys.stderr)
        sys.exit(2)

    name = "World"
    count = 1
    for opt, val in opts:
        if opt in ("-h", "--help"):
            print("用法: ...")
            sys.exit(0)
        elif opt in ("--name", "-n"):
            name = val
        elif opt in ("--count", "-c"):
            count = int(val)

    for _ in range(count):
        print(f"Hello, {name}!")

if __name__ == "__main__":
    main()
\`\`\`

\`getopt\` 的缺陷:

- 用字符串 \`"hn:c:"\` 声明选项,冒号表示带参数,可读性极差
- 不自动生成帮助
- 不做类型转换
- 不支持子命令
- 官方文档自己都说:"新版代码应该优先使用 argparse"

**结论:别用 getopt。** 知道它存在,是为了看懂老代码。

## 六、现代选择:argparse / click / typer

Python 现代 CLI 开发,基本在这三个框架里选:

| 框架 | 来源 | 风格 | 是否需安装 | 适合场景 |
|------|------|------|-----------|----------|
| **argparse** | 标准库 | 命令式(\`add_argument\`) | 否,内置 | 不想引第三方依赖的脚本 |
| **Click** | 第三方 | 装饰器(\`@click.command\`) | 是,\`pip install click\` | 复杂多子命令工具 |
| **Typer** | 第三方 | 类型注解(\`def f(x: int)\`) | 是,\`pip install typer\` | 现代项目,想用类型注解 |

### 6.1 三大框架一览

\`\`\`text
┌────────────┬──────────────────┬──────────────────┬──────────────────┐
│            │     argparse     │      Click       │      Typer       │
├────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 来源       │ 标准库           │ 第三方           │ 第三方           │
│ 安装       │ 无需             │ pip install click│ pip install typer│
│ 风格       │ 命令式           │ 装饰器           │ 类型注解         │
│ 代码量     │ 中等             │ 较少             │ 最少             │
│ 类型注解   │ 不支持           │ 不支持           │ 原生支持         │
│ 子命令     │ add_subparsers   │ @click.group     │ @app.command     │
│ 嵌套子命令 │ 麻烦             │ 方便             │ 方便             │
│ 帮助美观   │ 朴素             │ 朴素             │ 漂亮(配合 Rich) │
│ shell 补全 │ 需手动           │ 需手动           │ 内置生成         │
│ 学习曲线   │ 平缓             │ 平缓             │ 极平缓           │
│ 生态       │ 标准库           │ Flask 同源       │ FastAPI 同源     │
└────────────┴──────────────────┴──────────────────┴──────────────────┘
\`\`\`

### 6.2 三段历史

- **2009 年**:Python 2.7 把 \`argparse\` 纳入标准库(此前是第三方)。从此"开箱即用的 CLI 解析"成为 Python 基本功。argparse 设计上参考了 optparse,但更强大,逐步取代了 optparse。
- **2014 年**:Armin Ronacher(Flask 作者)发布 Click。他受够了 argparse 的繁琐,想用装饰器写出"像写函数一样写 CLI"的代码。Click 迅速被 Flask、Black 等知名项目采用。
- **2019 年**:Sebastián Ramírez(FastAPI 作者)发布 Typer。他意识到:既然 Python 有了类型注解,为什么还要手写 \`type=int\`?Typer 把类型注解直接变成 CLI 参数类型,代码量再砍一半。Typer 底层其实是 Click,所以兼容 Click 的所有能力。

理解这段历史很重要:**argparse 是基石,Click 是改良,Typer 是进化**。学的时候建议按这个顺序,先懂 argparse 的概念,再用 Click 提效,最后用 Typer 简化。

## 七、退出码:CLI 的"返回值"

CLI 巔回退码(exit code)是给"调用方"看的,而不是给人看的。这是新手最容易忽视的点。

\`\`\`python
import sys

# 错误:成功失败都返回 0(或不调 sys.exit)
def bad_main():
    if not do_work():
        print("失败了")  # 调用方根本不知道失败了
        # 没有 sys.exit(1),退出码还是 0

# 正确:用退出码传达结果
def good_main():
    if not do_work():
        print("失败了", file=sys.stderr)
        sys.exit(1)  # 非零表示失败
    sys.exit(0)      # 0 表示成功
\`\`\`

### 7.1 常见退出码约定

| 退出码 | 含义 | 例子 |
|--------|------|------|
| 0 | 成功 | \`grep\` 找到匹配 |
| 1 | 一般失败 | \`grep\` 没找到匹配 |
| 2 | 用法错误(参数错) | \`python script.py --bad-flag\` |
| 126 | 命令不可执行 | 文件无执行权限 |
| 127 | 命令未找到 | 拼错命令名 |
| 128 + N | 被信号 N 杀死 | \`kill -9\` → 137 |

调用方这样判断:

\`\`\`bash
if python deploy.py; then
    echo "部署成功,继续下一步"
else
    echo "部署失败,退出码 $?,中止"
    exit 1
fi
\`\`\`

\`argparse\` 在参数错误时自动返回 2,在 \`--help\` 时返回 0,这是它帮你处理好的细节。手写 \`sys.argv\` 时这些都得自己来。

## 八、标准输入输出:CLI 的"数据通道"

一个"Unix 友好"的 CLI 应该:

- 读数据:优先从 stdin(可被管道喂入),或从文件参数
- 写数据:优先到 stdout(可被管道接走),错误到 stderr
- 别把日志打到 stdout(那会污染数据流)

\`\`\`python
import sys

# 好的设计:支持 stdin 和文件参数
def read_input(filepath=None):
    if filepath is None or filepath == "-":
        return sys.stdin.read()  # - 表示从 stdin 读
    with open(filepath, encoding="utf-8") as f:
        return f.read()

# 错误信息走 stderr,不污染 stdout
print("警告: 文件为空", file=sys.stderr)
\`\`\`

这样就能这样用:

\`\`\`bash
# 从文件读
python mytool.py input.txt > result.txt

# 从管道读
cat input.txt | python mytool.py - > result.txt

# 串联多个工具
python gen.py | python filter.py | python sort.py > final.txt
\`\`\`

## 九、本章代码 demo:用 sys.argv 手写一个文件行数统计

把前面学的综合起来,写一个"统计文件行数"的小工具,支持:

- 位置参数:文件路径
- 可选参数:\`-v\` 详细模式
- \`--help\` 自动帮助(简陋版)
- 正确的退出码

\`\`\`python
# wc_lines.py - 纯 sys.argv 实现,仅作教学
import sys

def main():
    args = sys.argv[1:]

    # 解析参数
    verbose = False
    filepath = None
    for arg in args:
        if arg in ("-h", "--help"):
            print("用法: python wc_lines.py [-v] FILE")
            print("  -v    详细模式,显示文件名")
            print("  FILE  要统计的文件路径")
            return 0
        elif arg == "-v":
            verbose = True
        elif arg.startswith("-"):
            print(f"错误: 未知选项 {arg}", file=sys.stderr)
            return 2
        else:
            filepath = arg

    if filepath is None:
        print("错误: 缺少文件参数", file=sys.stderr)
        return 2

    # 业务逻辑
    try:
        with open(filepath, encoding="utf-8") as f:
            count = sum(1 for _ in f)
    except FileNotFoundError:
        print(f"错误: 文件不存在: {filepath}", file=sys.stderr)
        return 1

    if verbose:
        print(f"{count} {filepath}")
    else:
        print(count)
    return 0

if __name__ == "__main__":
    sys.exit(main())
\`\`\`

运行:

\`\`\`bash
$ python wc_lines.py wc_lines.py
41

$ python wc_lines.py -v wc_lines.py
41 wc_lines.py

$ python wc_lines.py notexist.txt
错误: 文件不存在: notexist.txt
$ echo $?
1

$ python wc_lines.py
错误: 缺少文件参数
$ echo $?
2
\`\`\`

41 行代码,实现的功能只是 \`wc -l\` 的一小部分。这就是手写 \`sys.argv\` 的代价。下一章用 \`argparse\` 重写,代码量减半,功能更强。

## 十、易错点小结

| 易错点 | 错误写法 | 正确写法 | 后果 |
|--------|----------|----------|------|
| 忘记取 argv[1:] | \`args = sys.argv\` | \`args = sys.argv[1:]\` | 把脚本名当参数解析 |
| 没处理参数缺失 | \`val = args[1]\` | 先判断 \`len(args)\` | IndexError 崩溃 |
| 类型转换不保护 | \`count = int(args[i+1])\` | \`try: int(...) except ValueError\` | 用户传非数字就崩 |
| 退出码全 0 | 失败也不 \`sys.exit(1)\` | 失败 \`sys.exit(1)\` | 调用方误以为成功 |
| 错误打到 stdout | \`print("error")\` | \`print("error", file=sys.stderr)\` | 污染数据流 |
| 不支持 \`-\` 表示 stdin | 只认文件路径 | \`path == "-" → sys.stdin\` | 不能用管道 |
| 把脚本名当业务参数 | \`name = sys.argv[0]\` | \`name = sys.argv[1]\` | 拿到 \`script.py\` |
| help 文本与代码不同步 | 改参数忘改 print | 用 argparse 自动生成 | 用户照着 help 用就报错 |
| 用 getopt | \`getopt.getopt(...)\` | 改用 argparse | 维护痛苦 |
| 参数顺序硬绑定 | \`name, age = args[0], args[1]\` | 用 \`--name\`/\`--age\` 任意顺序 | 用户必须按死顺序传 |

## 十一、本章小结

这一章我们建立了对 CLI 的整体认识:

1. **CLI 的价值**:自动化、可组合、可远程、可重现,是工程师的核心工具形态。
2. **Unix 哲学**:一个工具做好一件事,通过管道组合,文本流是通用接口。
3. **sys.argv**:最底层的参数接口,\`argv[0]\` 是程序名,\`argv[1:]\` 是参数。
4. **手写解析的痛苦**:类型转换、帮助文本、退出码、等号写法……全是样板。
5. **三大框架**:argparse(标准库)、Click(装饰器)、Typer(类型注解),后续章节逐一深入。

下一章我们正式进入 argparse,看它如何用一个 \`ArgumentParser\` 解决上面所有的痛点。
`,
  },

  // =========================================================
  // 第二章:argparse 基础
  // =========================================================
  {
    id: "pyeng-cli-argparse-basics",
    icon: "📐",
    title: "argparse 基础",
    group: "命令行工具",
    content: `# argparse 基础

## 一、argparse 是什么

\`argparse\` 是 Python 标准库的一部分,无需安装,直接 \`import argparse\` 就能用。它解决上一章提到的所有"手写解析痛点":

- 自动生成 \`-h/--help\` 帮助
- 自动做类型转换(\`type=int\`)
- 自动处理 \`--name=Alice\` 和 \`--name Alice\` 两种写法
- 自动处理参数简写(\`-n\` → \`--name\`)
- 自动设置退出码(参数错返回 2)
- 支持子命令、互斥参数、参数组

\`\`\`text
argparse 的定位:
  - 标准库:Python 2.7+ 内置,无需 pip install
  - 命令式 API:显式调用 add_argument 添加参数
  - 功能完备:从简单脚本到 git 风格多子命令都能搞定
  - 帮助朴素:不彩色、不花哨,但信息全
\`\`\`

### 1.1 argparse vs optparse vs getopt

Python 历史上出现过三个 CLI 解析模块,理解它们的更替能帮你理解 argparse 的设计:

| 模块 | 出现时间 | 状态 | 特点 |
|------|----------|------|------|
| \`getopt\` | Python 1.x | 不推荐 | 模仿 C 的 getopt,功能弱 |
| \`optparse\` | Python 2.3 | 已弃用 | 比 getopt 强,但不支持子命令 |
| \`argparse\` | Python 2.7(标准库) | 推荐 | 功能完备,支持子命令、互斥、参数组 |

官方文档明确说:"The argparse module is the recommended command-line parsing module"。本章和下一章专注 argparse。

## 二、三步走:创建 → 添加 → 解析

argparse 的核心用法就三步,几乎每个 argparse 程序都长这样:

\`\`\`python
import argparse

# 第 1 步:创建解析器(description 会显示在 --help 顶部)
parser = argparse.ArgumentParser(description="一个示例 CLI")

# 第 2 步:添加参数
# "name" 不以 - 开头 → 位置参数(必填,按顺序绑定)
parser.add_argument("name", help="你的名字")
# "--age" 以 -- 开头 → 可选参数;type=int 自动把字符串转成整数
parser.add_argument("--age", type=int, default=18, help="你的年龄")

# 第 3 步:解析参数(返回 Namespace 对象,用 args.属性名 访问)
args = parser.parse_args()

print(f"你好, {args.name}, {args.age} 岁")
\`\`\`

运行:

\`\`\`bash
$ python demo.py Alice --age 30
你好, Alice, 30 岁

$ python demo.py --help
usage: demo.py [-h] [--age AGE] name

一个示例 CLI

positional arguments:
  name        你的名字

options:
  -h, --help  show this help message and exit
  --age AGE   你的年龄
\`\`\`

注意几个细节:

1. \`description\` 出现在 usage 下方,描述这个工具干啥的
2. \`-h/--help\` 是**自动**加的,不用你写
3. 帮助文本里 \`name\` 是位置参数(没有 \`--\`),\`--age AGE\` 是可选参数(\`AGE\` 是值占位符)
4. 解析结果 \`args\` 是一个 \`Namespace\` 对象,用 \`args.名字\` 访问

### 2.1 Namespace 对象

\`parse_args()\` 返回 \`argparse.Namespace\`,本质是个简单的属性容器:

\`\`\`python
args = parser.parse_args()
print(type(args))  # <class 'argparse.Namespace'>
print(args.name)   # Alice
print(args.age)    # 30

# 可以转成字典
d = vars(args)
print(d)  # {'name': 'Alice', 'age': 30}
\`\`\`

## 三、参数种类:位置参数 vs 可选参数

argparse 的参数分两大类,理解它们的区别是掌握 argparse 的关键。

### 3.1 位置参数(positional)

特征:不以 \`-\` 开头,**必填**,按出现顺序绑定。

\`\`\`python
parser.add_argument("src")     # 第 1 个位置参数
parser.add_argument("dst")     # 第 2 个位置参数
\`\`\`

调用时:

\`\`\`bash
$ python cp.py a.txt b.txt   # src=a.txt, dst=b.txt
$ python cp.py a.txt          # 错:缺 dst
$ python cp.py a.txt b.txt c.txt  # 错:多余参数
\`\`\`

### 3.2 可选参数(optional)

特征:以 \`-\` 或 \`--\` 开头,**默认选填**,按名绑定(不依赖顺序)。

\`\`\`python
parser.add_argument("-v", "--verbose")  # 同时支持 -v 和 --verbose
parser.add_argument("--count", type=int)
\`\`\`

调用时:

\`\`\`bash
$ python demo.py --count 3          # count=3
$ python demo.py --count=3          # 等价写法
$ python demo.py                    # count=None(没默认值)
$ python demo.py -v                 # verbose='True'(store_true 时)
\`\`\`

### 3.3 两种参数的对比

| 维度 | 位置参数 | 可选参数 |
|------|----------|----------|
| 标识 | 不以 \`-\` 开头 | 以 \`-\` 或 \`--\` 开头 |
| 必填 | 默认必填 | 默认选填 |
| 顺序 | 按声明顺序绑定 | 按名绑定,顺序任意 |
| 简写 | 无 | 可有(\`-v\` 对应 \`--verbose\`) |
| 典型用途 | 必传的核心数据(文件路径、名字) | 配置项(开关、数量、模式) |
| 帮助显示 | 在 "positional arguments" 下 | 在 "options" 下 |

\`\`\`text
经验法则:
  - 必须给的、不带也会让人困惑的 → 位置参数
    例:cp 的源文件和目标文件
  - 可给可不给、有默认值的 → 可选参数
    例:--verbose / --count / --output
\`\`\`

## 四、基本参数示例

### 4.1 简单位置参数

\`\`\`python
parser.add_argument("name", help="你的名字")
parser.add_argument("scores", nargs="+", type=int, help="分数列表")
\`\`\`

\`\`\`bash
$ python demo.py Alice 90 85 92
# args.name = 'Alice'
# args.scores = [90, 85, 92]
\`\`\`

### 4.2 简单可选参数

\`\`\`python
parser.add_argument("-v", "--verbose", action="store_true", help="详细输出")
parser.add_argument("--output", "-o", default="out.txt", help="输出文件")
\`\`\`

\`\`\`bash
$ python demo.py -v -o result.txt
# args.verbose = True
# args.output = 'result.txt'

$ python demo.py --output=result.txt
# 等价写法
\`\`\`

注意:\`-o\` 和 \`--output\` 的顺序无所谓,argparse 都认。属性名取**长选项去掉 \`--\`**,即 \`args.output\`。

## 五、参数属性详解

\`add_argument\` 的参数很多,这是 argparse 的核心知识点。逐个讲。

### 5.1 help:帮助文本

最基础也最重要。给每个参数写清楚的 help,用户 \`--help\` 时能看到。

\`\`\`python
parser.add_argument("--port", type=int, default=8000,
                    help="服务监听端口(默认 8000)")
\`\`\`

小技巧:help 里可以用 \`%(default)s\`、\`%(type)s\` 等占位符,自动填入:

\`\`\`python
parser.add_argument("--port", type=int, default=8000,
                    help="监听端口(默认 %(default)s)")
# 帮助显示:--port PORT  监听端口(默认 8000)
\`\`\`

### 5.2 type:类型转换

默认所有参数都是字符串。用 \`type\` 指定转换函数:

\`\`\`python
parser.add_argument("--age", type=int)        # int("30") → 30
parser.add_argument("--rate", type=float)     # float("0.5") → 0.5
parser.add_argument("--file", type=open)      # 直接打开文件
\`\`\`

\`\`\`bash
$ python demo.py --age 30
# args.age = 30 (int, 不是 '30')

$ python demo.py --age thirty
# usage: demo.py [-h] [--age AGE]
# demo.py: error: argument --age: invalid int value: 'thirty'
# 退出码 2
\`\`\`

type 可以是**任何接收字符串返回值的函数**,详见下一章"自定义类型"。

### 5.3 default:默认值

\`\`\`python
parser.add_argument("--host", default="localhost")
parser.add_argument("--port", type=int, default=8000)
\`\`\`

\`\`\`bash
$ python demo.py
# args.host = 'localhost', args.port = 8000

$ python demo.py --host 0.0.0.0
# args.host = '0.0.0.0', args.port = 8000 (用默认)
\`\`\`

### 5.4 required:是否必填(仅可选参数)

位置参数天然必填,无需 \`required\`。可选参数默认选填,可设 \`required=True\` 强制必填:

\`\`\`python
parser.add_argument("--config", required=True, help="配置文件路径(必填)")
\`\`\`

\`\`\`bash
$ python demo.py
# error: the following arguments are required: --config

$ python demo.py --config prod.yaml
# 正常
\`\`\`

### 5.5 choices:限定取值

\`\`\`python
parser.add_argument("--mode", choices=["dev", "test", "prod"], default="dev")
\`\`\`

\`\`\`bash
$ python demo.py --mode staging
# error: argument --mode: invalid choice: 'staging' (choose from 'dev', 'test', 'prod')

$ python demo.py --mode prod
# 正常
\`\`\`

适合用于"枚举型"参数,避免用户传错值。

### 5.6 action:动作类型

\`action\` 决定"参数出现时做什么",这是 argparse 最灵活的属性。常用值:

| action | 含义 | 结果 | 用法 |
|--------|------|------|------|
| \`store\`(默认) | 存储参数值 | \`args.x = value\` | \`--name Alice\` |
| \`store_true\` | 出现即为 True,不带值 | \`args.v = True\` | \`-v\` |
| \`store_false\` | 出现即为 False,不带值 | \`args.no_cache = False\` | \`--no-cache\` |
| \`store_const\` | 存储常量(需配 const) | \`args.x = const\` | \`--big\`(const=1024) |
| \`count\` | 累计出现次数 | \`args.v = 2\` | \`-vv\` |
| \`append\` | 多次出现则追加到列表 | \`args.f = ['a','b']\` | \`-f a -f b\` |
| \`append_const\` | 追加常量到列表 | \`args.x = [1, 2]\` | 配合 const |
| \`version\` | 打印版本后退出 | (退出) | \`--version\` |
| \`help\` | 打印帮助后退出 | (退出) | \`-h/--help\`(自动) |

#### store_true / store_false:开关参数

最常见的 action,用于"开关型"参数:

\`\`\`python
# store_true:出现 -v 时 args.verbose=True,不出现时默认 False(无需写 default)
parser.add_argument("-v", "--verbose", action="store_true",
                    help="详细输出")
# store_false:出现 --no-cache 时 args.cache=False;dest="cache" 把属性名从 no_cache 改成 cache
parser.add_argument("--no-cache", action="store_false",
                    dest="cache", help="禁用缓存")
\`\`\`

\`\`\`bash
$ python demo.py
# args.verbose = False (没传就是 False)
# args.cache = True

$ python demo.py -v --no-cache
# args.verbose = True
# args.cache = False
\`\`\`

注意 \`store_false\` 要配 \`dest\`,因为属性名默认取选项名(\`no_cache\`),但你想存的其实是 \`cache\` 的反值。

#### count:累计出现次数

\`\`\`python
# count:每出现一次 -v,值 +1;default=0 保证不传时是 0 而非 None
parser.add_argument("-v", "--verbose", action="count", default=0,
                    help="详细级别(-v, -vv, -vvv)")
\`\`\`

\`\`\`bash
$ python demo.py            # verbose = 0
$ python demo.py -v         # verbose = 1
$ python demo.py -vv        # verbose = 2
$ python demo.py -vvv       # verbose = 3
\`\`\`

适合"日志级别"这种可叠加的开关。

#### append:多次出现收集成列表

\`\`\`python
# append:每次 -f VALUE 都把 VALUE 追加到列表;default=[] 保证不传时是空列表而非 None
parser.add_argument("--file", "-f", action="append", default=[],
                    help="待处理文件(可多次指定)")
\`\`\`

\`\`\`bash
$ python demo.py -f a.txt -f b.txt -f c.txt
# args.file = ['a.txt', 'b.txt', 'c.txt']

$ python demo.py
# args.file = [] (用了 default=[])
\`\`\`

注意:用 \`append\` 时强烈建议配 \`default=[]\`,否则没传时是 \`None\`,迭代会报错。

#### version:打印版本

\`\`\`python
parser.add_argument("--version", action="version",
                    version="%(prog)s 1.2.3")
\`\`\`

\`\`\`bash
$ python demo.py --version
demo.py 1.2.3
$ echo $?
0
\`\`\`

\`%(prog)s\` 是程序名占位符,自动填入。

### 5.7 nargs:参数个数

\`nargs\` 控制"一个参数吃几个值"。这是 argparse 比较 tricky 的地方。

| nargs | 含义 | 例子 | 结果类型 |
|-------|------|------|----------|
| 不指定 | 吃 1 个值 | \`--port 8000\` | 单值 |
| \`?\` | 0 或 1 个值 | \`--flag\` 或 \`--flag X\` | 单值或 const |
| \`*\` | 0 或多个值 | \`--files a b c\` | 列表 |
| \`+\` | 1 或多个值 | \`--files a b c\` | 列表 |
| 数字(如 \`3\`) | 恰好 N 个 | \`--rect 10 20 30\` | 列表 |
| \`argparse.REMAINDER\` | 剩余所有 | \`-- x y z\` | 列表 |

\`\`\`python
# nargs=3:必须吃恰好 3 个值;metavar 元组让帮助里显示 --rect X Y W 而非 --rect X X X
parser.add_argument("--rect", nargs=3, type=int, metavar=("X", "Y", "W"))

# nargs="*":0 或多个值,收集成列表(可不传,得到 [])
parser.add_argument("files", nargs="*", help="待处理文件")

# nargs="+":1 或多个值,至少要传一个,否则报错
parser.add_argument("files", nargs="+", help="待处理文件(至少一个)")

# nargs="?":0 或 1 个值;const 是"选项出现但没给值"时的默认,default 是"选项没出现"时的默认
parser.add_argument("--flag", nargs="?", const="DEFAULT", default="NONE")
# --flag          → 'DEFAULT'  (出现,无值,用 const)
# --flag X        → 'X'        (出现,有值,用值)
# (不传)         → 'NONE'     (没出现,用 default)
\`\`\`

\`nargs='?'\` 配合 \`const\` 是个常见模式:出现选项但没给值,用 const;出现选项且给了值,用值;不出现,用 default。

\`\`\`bash
$ python demo.py --flag
# args.flag = 'DEFAULT'

$ python demo.py --flag CUSTOM
# args.flag = 'CUSTOM'

$ python demo.py
# args.flag = 'NONE'
\`\`\`

### 5.8 dest:属性名

默认属性名 = 长选项去掉 \`--\`,横线转下划线:

\`\`\`python
parser.add_argument("--output-file")  # → args.output_file
parser.add_argument("-v", "--verbose")  # → args.verbose (取长选项)
\`\`\`

用 \`dest\` 自定义:

\`\`\`python
parser.add_argument("--output-file", dest="outfile")
# → args.outfile
\`\`\`

### 5.9 metavar:帮助中的占位符名

默认占位符 = 参数名大写(\`--port\` → \`PORT\`)。用 \`metavar\` 改:

\`\`\`python
parser.add_argument("--port", type=int, metavar="PORT")
# 帮助: --port PORT

parser.add_argument("--config", metavar="FILE")
# 帮助: --config FILE
\`\`\`

注意:\`metavar\` 只影响**显示**,不影响 \`args.属性名\`(那是 \`dest\` 控制的)。

## 六、自动生成 -h/--help

argparse 最省心的功能之一。一旦你给参数加了 \`help\`,它会自动生成格式工整的帮助:

\`\`\`python
import argparse
parser = argparse.ArgumentParser(
    prog="mytool",
    description="一个文件处理工具",
    epilog="示例: mytool --input a.txt --output b.txt",
)
parser.add_argument("input", help="输入文件")
parser.add_argument("-o", "--output", help="输出文件")
parser.add_argument("-v", "--verbose", action="store_true", help="详细输出")
\`\`\`

\`\`\`bash
$ python mytool.py --help
usage: mytool [-h] [-o OUTPUT] [-v] input

一个文件处理工具

positional arguments:
  input                 输入文件

options:
  -h, --help            show this help message and exit
  -o OUTPUT, --output OUTPUT
                        输出文件
  -v, --verbose         详细输出

示例: mytool --input a.txt --output b.txt
\`\`\`

注意 \`prog\`、\`description\`、\`epilog\` 三个字段:

- \`prog\`:程序名,显示在 usage 开头(默认取 \`sys.argv[0]\`)
- \`description\`:工具描述,显示在 usage 下方
- \`epilog\`:尾部文字,显示在 options 下方(适合放示例)

### 6.1 formatter_class:控制帮助格式

默认情况下,argparse 会把帮助文本里的换行折叠成一行,长描述挤在一起。用 \`formatter_class\` 可以保留原始格式:

\`\`\`python
import argparse
parser = argparse.ArgumentParser(
    prog="mytool",
    description="第一行描述\\n第二行描述\\n第三行描述",
    formatter_class=argparse.RawTextHelpFormatter,
)
# RawTextHelpFormatter:保留 help 文本中的换行,不折叠
\`\`\`

常用 formatter_class 取值:

| formatter_class | 作用 |
|-----------------|------|
| \`argparse.RawTextHelpFormatter\` | 保留所有 help/description 中的换行和空白 |
| \`argparse.RawDescriptionHelpFormatter\` | 只保留 description 和 epilog 的原始格式(help 仍折叠) |
| \`argparse.ArgumentDefaultsHelpFormatter\` | 自动在每个参数 help 后追加 "(default: ...)" |
| \`argparse.MetavarTypeHelpFormatter\` | 用 type 名作为 metavar(如 \`--port int\` 而非 \`--port PORT\`) |

\`\`\`python
import argparse
# 组合使用:既保留换行,又自动显示默认值
parser = argparse.ArgumentParser(
    formatter_class=argparse.RawTextHelpFormatter,
)
# ArgumentDefaultsHelpFormatter 会自动追加默认值,无需手写 %(default)s
\`\`\`

\`RawTextHelpFormatter\` 在 help 里写多行说明时特别有用,比如参数有"长格式说明 + 示例"时:

\`\`\`python
parser.add_argument("--mode", choices=["dev","prod"],
    help="运行模式\\n  dev:  开发环境,输出详细日志\\n  prod: 生产环境,只输出结果")
\`\`\`

## 七、本章代码 demo:文件处理 CLI

把前面学的综合起来,写一个真实的"文件处理"CLI,需求:

- 位置参数:输入文件
- 可选参数:\`-o/--output\` 输出文件(默认 \`<input>.out\`)
- 可选参数:\`-v/--verbose\` 详细模式
- 可选参数:\`-f/--force\` 强制覆盖
- 可选参数:\`--encoding\` 文件编码(默认 utf-8)
- 互斥:\`--upper\` / \`--lower\` 不能同时给(下一章讲,这里先简化)
- 自动 \`--help\`

\`\`\`python
# fileproc.py - argparse 基础 demo
import argparse
import sys
from pathlib import Path

def build_parser():
    parser = argparse.ArgumentParser(
        prog="fileproc",
        description="文件处理工具:读取输入文件,转换后写入输出文件",
        epilog="示例: fileproc input.txt -o out.txt --upper -v",
    )
    parser.add_argument("input", help="输入文件路径")
    parser.add_argument("-o", "--output", help="输出文件路径(默认 <input>.out)")
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="详细输出处理过程")
    parser.add_argument("-f", "--force", action="store_true",
                        help="强制覆盖已存在的输出文件")
    parser.add_argument("--encoding", default="utf-8",
                        help="文件编码(默认 utf-8)")
    parser.add_argument("--upper", action="store_true", help="转大写")
    parser.add_argument("--lower", action="store_true", help="转小写")
    parser.add_argument("--max-size", type=int, default=0,
                        help="最大处理字节数(0 表示不限制)")
    return parser

def main():
    parser = build_parser()
    args = parser.parse_args()

    # 业务逻辑
    in_path = Path(args.input)
    if not in_path.exists():
        print(f"错误: 输入文件不存在: {in_path}", file=sys.stderr)
        return 1

    out_path = Path(args.output) if args.output else in_path.with_suffix(".out")
    if out_path.exists() and not args.force:
        print(f"错误: 输出文件已存在: {out_path}(用 --force 覆盖)", file=sys.stderr)
        return 1

    if args.upper and args.lower:
        print("错误: --upper 和 --lower 不能同时使用", file=sys.stderr)
        return 2

    # 读
    if args.verbose:
        print(f"[INFO] 读取 {in_path} (encoding={args.encoding})", file=sys.stderr)
    text = in_path.read_text(encoding=args.encoding)

    if args.max_size > 0 and len(text.encode(args.encoding)) > args.max_size:
        print(f"错误: 文件超过 {args.max_size} 字节", file=sys.stderr)
        return 1

    # 转换
    if args.upper:
        text = text.upper()
    elif args.lower:
        text = text.lower()

    # 写
    if args.verbose:
        print(f"[INFO] 写入 {out_path}", file=sys.stderr)
    out_path.write_text(text, encoding=args.encoding)

    if args.verbose:
        print(f"[INFO] 完成,共 {len(text)} 字符", file=sys.stderr)
    return 0

if __name__ == "__main__":
    sys.exit(main())
\`\`\`

运行示例:

\`\`\`bash
$ python fileproc.py --help
usage: fileproc [-h] [-o OUTPUT] [-v] [-f] [--encoding ENCODING] [--upper] [--lower] [--max-size MAX_SIZE] input

文件处理工具:读取输入文件,转换后写入输出文件

positional arguments:
  input                 输入文件路径

options:
  -h, --help            show this help message and exit
  -o OUTPUT, --output OUTPUT
                        输出文件路径(默认 <input>.out)
  -v, --verbose         详细输出处理过程
  -f, --force           强制覆盖已存在的输出文件
  --encoding ENCODING   文件编码(默认 utf-8)
  --upper               转大写
  --lower               转小写
  --max-size MAX_SIZE   最大处理字节数(0 表示不限制)

示例: fileproc input.txt -o out.txt --upper -v

$ python fileproc.py hello.txt --upper -v
[INFO] 读取 hello.txt (encoding=utf-8)
[INFO] 写入 hello.out
[INFO] 完成,共 11 字符

$ python fileproc.py notexist.txt
错误: 输入文件不存在: notexist.txt

$ python fileproc.py hello.txt --upper --lower
错误: --upper 和 --lower 不能同时使用
\`\`\`

注意我们手写了 \`--upper\` 和 \`--lower\` 的互斥判断。下一章会讲 argparse 内置的 \`add_mutually_exclusive_group\`,让这件事自动完成。

## 八、常用 action 详解表

| action | 触发条件 | 结果 | 典型用法 | 是否需要值 |
|--------|----------|------|----------|-----------|
| \`store\` | 选项出现 | 存储值 | \`--name Alice\` | 是 |
| \`store_true\` | 选项出现 | \`True\` | \`-v\` | 否 |
| \`store_false\` | 选项出现 | \`False\` | \`--no-cache\` | 否 |
| \`store_const\` | 选项出现 | \`const\` 值 | \`--big\`(const=1024) | 否 |
| \`count\` | 选项出现 | 累计次数 | \`-vvv\` → 3 | 否 |
| \`append\` | 选项出现 | 追加到列表 | \`-f a -f b\` → ['a','b'] | 是 |
| \`append_const\` | 选项出现 | 追加 const | 配合 const 用 | 否 |
| \`version\` | 选项出现 | 打印版本并退出 | \`--version\` | 否 |
| \`help\` | 选项出现 | 打印帮助并退出 | \`-h/--help\`(自动) | 否 |

### 8.1 action 选择速查

\`\`\`text
是否需要带值?
├─ 是 → 是否允许多次?
│      ├─ 是,收集成列表 → append
│      └─ 否,只存最后一个 → store(默认)
└─ 否 → 是开关?
         ├─ True → store_true
         ├─ False → store_false
         ├─ 累加 → count
         └─ 常量 → store_const
特殊:打印版本/帮助 → version / help
\`\`\`

## 九、易错点小结

| 易错点 | 错误写法 | 正确写法 | 后果 |
|--------|----------|----------|------|
| store_true 配 default | \`action="store_true", default=False\` | 不写 default(自动 False) | 多余但无害 |
| store_true 配 type | \`action="store_true", type=int\` | 不要 type | 报错 |
| append 不配 default | \`action="append"\` | \`action="append", default=[]\` | 没传时是 None |
| choices 配 type 顺序错 | \`choices=[1,2], type=int\` | 先 type 后 choices 比较 | 校验失败 |
| 位置参数加 required | \`add_argument("x", required=True)\` | 位置参数天然必填 | 报错 |
| 位置参数加 \`--\` | \`add_argument("--x")\` 当位置参数 | 要么去掉 \`--\`,要么加 \`-\` | 概念混乱 |
| 忘记 parse_args | \`parser.add_argument(...)\` 后没解析 | 调 \`parse_args()\` | args 没值 |
| dest 与属性名混淆 | \`add_argument("--output-file")\` → \`args.output-file\` | \`args.output_file\` | 属性错误 |
| metavar 当 dest 用 | \`metavar="OUT"\` 然后访问 \`args.OUT\` | metavar 只影响显示 | AttributeError |
| nargs='?' 不配 const | \`nargs="?"\` 没设 const | 配 const 定义"无值时默认" | 行为不符合预期 |
| 帮助里忘写 help | \`add_argument("--port")\` | 加 \`help="..."\` | --help 信息不全 |
| prog 不设导致帮助难看 | 默认 \`sys.argv[0]\`(含路径) | 设 \`prog="mytool"\` | usage 里是脚本全路径 |

## 十、本章小结

1. **三步走**:\`ArgumentParser()\` → \`add_argument()\` → \`parse_args()\`。
2. **两类参数**:位置参数(必填、按序)和可选参数(\`-\`/\`--\` 开头、按名)。
3. **核心属性**:\`help\`、\`type\`、\`default\`、\`required\`、\`choices\`、\`action\`、\`nargs\`、\`dest\`、\`metavar\`。
4. **action 是灵魂**:\`store_true\`/\`count\`/\`append\`/\`version\` 各有妙用。
5. **自动帮助**:\`-h/--help\` 不用你写,只要每个参数加 \`help\`。

下一章进入 argparse 进阶:子命令、互斥参数、自定义类型、自定义 action,把 argparse 的能力榨干。
`,
  },

  // =========================================================
  // 第三章:argparse 进阶
  // =========================================================
  {
    id: "pyeng-cli-argparse-advanced",
    icon: "🔧",
    title: "argparse 进阶",
    group: "命令行工具",
    content: `# argparse 进阶

## 一、子命令(subparsers):git 风格的 CLI

上一章的 argparse 都是"单命令"模式:\`mytool --foo bar\`。但现实里很多工具是"子命令"模式:\`git add\`、\`git commit\`、\`docker run\`、\`pip install\`。argparse 用 \`add_subparsers\` 实现这个。

### 1.1 最简子命令

\`\`\`python
import argparse

parser = argparse.ArgumentParser(prog="mytool")
# add_subparsers 创建一个"子命令分发器";dest="command" 表示子命令名存到 args.command
subparsers = parser.add_subparsers(dest="command", help="子命令")

# 子命令 add:每个 add_parser 返回一个独立的 ArgumentParser,有自己的参数
parser_add = subparsers.add_parser("add", help="添加文件")
parser_add.add_argument("files", nargs="+", help="待添加的文件")

# 子命令 delete:和 add 完全独立,可有不同的参数
parser_del = subparsers.add_parser("delete", help="删除文件")
parser_del.add_argument("files", nargs="+", help="待删除的文件")

args = parser.parse_args()
print(args)  # 用 args.command 判断用户选了哪个子命令
\`\`\`

运行:

\`\`\`bash
$ python mytool.py add a.txt b.txt
Namespace(command='add', files=['a.txt', 'b.txt'])

$ python mytool.py delete c.txt
Namespace(command='delete', files=['c.txt'])

$ python mytool.py --help
usage: mytool [-h] {add,delete} ...

positional arguments:
  {add,delete}
    add         添加文件
    delete      删除文件

$ python mytool.py add --help
usage: mytool add [-h] files [files ...]

positional arguments:
  files         待添加的文件
\`\`\`

### 1.2 dest 和 command 的关系

\`add_subparsers(dest="command")\` 中的 \`dest\` 决定了"用户用了哪个子命令"存在哪个属性上:

\`\`\`python
args = parser.parse_args()
if args.command == "add":
    do_add(args.files)
elif args.command == "delete":
    do_delete(args.files)
else:
    parser.print_help()
\`\`\`

如果不设 \`dest\`,argparse 不会存子命令名,你就不知道用户选了哪个(老版本 Python 行为)。

### 1.3 每个子命令独立参数

子命令最大的价值是:每个子命令有自己的参数集。\`git add\` 有 \`--all\`,\`git commit\` 有 \`-m\`,\`git push\` 有 \`--force\`。

\`\`\`python
import argparse
parser = argparse.ArgumentParser(prog="mygit")
sub = parser.add_subparsers(dest="cmd", required=True)

# add 子命令
p_add = sub.add_parser("add", help="暂存文件")
p_add.add_argument("paths", nargs="+", help="文件路径")
p_add.add_argument("-A", "--all", action="store_true", help="暂存全部")

# commit 子命令
p_commit = sub.add_parser("commit", help="提交")
p_commit.add_argument("-m", "--message", required=True, help="提交信息")
p_commit.add_argument("--amend", action="store_true", help="修改上次提交")

# push 子命令
p_push = sub.add_parser("push", help="推送")
p_push.add_argument("remote", nargs="?", default="origin", help="远程名")
p_push.add_argument("--force", action="store_true", help="强制推送")
\`\`\`

\`\`\`bash
$ python mygit.py add a.txt b.txt
$ python mygit.py commit -m "fix bug"
$ python mygit.py push origin --force

$ python mygit.py commit        # 错:缺 -m
# error: the following arguments are required: -m/--message

$ python mygit.py add --force   # 错:add 没有 --force
# error: unrecognized arguments: --force
\`\`\`

### 1.4 给子命令绑定处理函数

用 \`set_defaults(func=...)\` 给每个子命令绑定一个处理函数,\`parse_args\` 后直接调用:

\`\`\`python
import argparse
def do_add(args):
    print(f"添加: {args.paths}")

def do_commit(args):
    print(f"提交: {args.message}")

parser = argparse.ArgumentParser()
sub = parser.add_subparsers(dest="cmd", required=True)

p_add = sub.add_parser("add")
p_add.add_argument("paths", nargs="+")
# set_defaults(func=...) 给子命令绑定处理函数,parse_args 后 args.func 就是这个函数
p_add.set_defaults(func=do_add)

p_commit = sub.add_parser("commit")
p_commit.add_argument("-m", "--message", required=True)
p_commit.set_defaults(func=do_commit)

args = parser.parse_args()
args.func(args)  # 直接调用对应函数,无需 if/elif 判断 args.cmd
\`\`\`

这是 argparse 官方推荐的"子命令分发"模式,比 \`if/elif\` 链更优雅。

### 1.5 子命令嵌套(略麻烦)

argparse 支持子命令嵌套(子命令的子命令),但写起来比较啰嗦:

\`\`\`python
import argparse
parser = argparse.ArgumentParser(prog="myapp")
sub1 = parser.add_subparsers(dest="cmd")

# myapp db ...
p_db = sub1.add_parser("db")
sub2 = p_db.add_subparsers(dest="subcmd")

# myapp db migrate
p_migrate = sub2.add_parser("migrate")
p_migrate.add_argument("--revision", default="head")

# myapp db rollback
p_rollback = sub2.add_parser("rollback")
p_rollback.add_argument("--steps", type=int, default=1)
\`\`\`

\`\`\`bash
$ python myapp.py db migrate --revision abc123
$ python myapp.py db rollback --steps 3
\`\`\`

嵌套超过两层后,代码会变得很难维护。这正是 Click/Typer 的优势所在(它们的 group 可以无限嵌套,语法自然)。

## 二、参数互斥:add_mutually_exclusive_group

上一章 \`fileproc.py\` 里我们手写了 \`--upper\` 和 \`--lower\` 的互斥判断。argparse 其实内置了这个功能:

\`\`\`python
import argparse
parser = argparse.ArgumentParser()
group = parser.add_mutually_exclusive_group()
group.add_argument("--upper", action="store_true", help="转大写")
group.add_argument("--lower", action="store_true", help="转小写")
group.add_argument("--title", action="store_true", help="标题大小写")
\`\`\`

\`\`\`bash
$ python demo.py --upper
# ok

$ python demo.py --upper --lower
# usage: demo.py [-h] [--upper] [--lower] [--title]
# demo.py: error: argument --lower: not allowed with argument --upper
\`\`\`

### 2.1 required 互斥组

互斥组默认是"可选的"(可以都不选)。如果想"必须选一个",设 \`required=True\`:

\`\`\`python
group = parser.add_mutually_exclusive_group(required=True)
group.add_argument("--json", action="store_true", help="JSON 格式输出")
group.add_argument("--yaml", action="store_true", help="YAML 格式输出")
group.add_argument("--xml", action="store_true", help="XML 格式输出")
\`\`\`

\`\`\`bash
$ python demo.py
# error: one of the arguments --json --yaml --xml is required

$ python demo.py --json
# ok
\`\`\`

### 2.2 经典用法:verbose vs quiet

\`\`\`python
group = parser.add_mutually_exclusive_group()
group.add_argument("-v", "--verbose", action="store_true", help="详细输出")
group.add_argument("-q", "--quiet", action="store_true", help="安静模式")
\`\`\`

## 三、参数组:add_argument_group

当参数很多时,帮助会变成一长串。用 \`add_argument_group\` 把相关参数分组,帮助里会分块显示:

\`\`\`python
import argparse
parser = argparse.ArgumentParser(prog="server")

# 输入输出组
io_group = parser.add_argument_group("输入输出")
io_group.add_argument("--input", help="输入文件")
io_group.add_argument("--output", help="输出文件")

# 网络组
net_group = parser.add_argument_group("网络")
net_group.add_argument("--host", default="0.0.0.0", help="监听地址")
net_group.add_argument("--port", type=int, default=8000, help="监听端口")

# 日志组
log_group = parser.add_argument_group("日志")
log_group.add_argument("--log-level", default="INFO",
                       choices=["DEBUG", "INFO", "WARNING", "ERROR"])
log_group.add_argument("--log-file", help="日志文件")
\`\`\`

\`\`\`bash
$ python server.py --help
usage: server [-h] [--input INPUT] [--output OUTPUT] [--host HOST]
              [--port PORT] [--log-level {DEBUG,INFO,WARNING,ERROR}]
              [--log-file LOG_FILE]

options:
  -h, --help            show this help message and exit

输入输出:
  --input INPUT         输入文件
  --output OUTPUT       输出文件

网络:
  --host HOST           监听地址
  --port PORT           监听端口

日志:
  --log-level {DEBUG,INFO,WARNING,ERROR}
  --log-file LOG_FILE   日志文件
\`\`\`

参数组**只是显示分组**,不影响解析行为。

## 四、自定义类型:type 可以是任意函数

\`type\` 不限于 \`int\`/\`float\`/\`str\`,它可以是**任何接收字符串、返回值的函数**。这给了 argparse 极大的灵活性。

### 4.1 文件类型:argparse.FileType

\`argparse.FileType('r')\` 会自动打开文件,文件不存在时报错:

\`\`\`python
parser.add_argument("--input", type=argparse.FileType("r"))
parser.add_argument("--output", type=argparse.FileType("w"))

args = parser.parse_args()
data = args.input.read()       # 直接读
args.output.write(data)        # 直接写
\`\`\`

\`\`\`bash
$ python demo.py --input notexist.txt
# error: argument --input: can't open 'notexist.txt': [Errno 2] No such file or directory: 'notexist.txt'

$ python demo.py --input a.txt --output b.txt
# 自动打开 a.txt 读, b.txt 写
\`\`\`

还支持 \`-\` 表示 stdin/stdout:

\`\`\`bash
$ cat data.txt | python demo.py --input - --output -
\`\`\`

### 4.2 自定义:解析日期

\`\`\`python
from datetime import datetime

def parse_date(s):
    return datetime.strptime(s, "%Y-%m-%d")

parser.add_argument("--date", type=parse_date, help="日期(YYYY-MM-DD)")
\`\`\`

\`\`\`bash
$ python demo.py --date 2024-12-25
# args.date = datetime(2024, 12, 25)

$ python demo.py --date 2024/12/25
# error: argument --date: invalid parse_date value: '2024/12/25'
\`\`\`

### 4.3 自定义:限定范围的整数

\`\`\`python
def port_number(s):
    n = int(s)
    if not (1 <= n <= 65535):
        raise argparse.ArgumentTypeError(f"端口必须在 1-65535,得到 {n}")
    return n

parser.add_argument("--port", type=port_number, default=8000)
\`\`\`

\`\`\`bash
$ python demo.py --port 99999
# error: argument --port: 端口必须在 1-65535,得到 99999
\`\`\`

注意:自定义 type 函数报错时,要抛 \`argparse.ArgumentTypeError\`,argparse 会自动格式化错误信息。抛 \`ValueError\` 也行,但错误信息没那么好看。

### 4.4 自定义:Path 校验

\`\`\`python
from pathlib import Path

def existing_file(s):
    p = Path(s)
    if not p.exists():
        raise argparse.ArgumentTypeError(f"文件不存在: {s}")
    if not p.is_file():
        raise argparse.ArgumentTypeError(f"不是文件: {s}")
    return p

parser.add_argument("input", type=existing_file)
\`\`\`

## 五、自定义 action:继承 Action 类

当内置 action 不够用时,可以继承 \`argparse.Action\` 写自定义 action。典型场景:统计某个参数被指定了多少次、把多个相关参数打包等。

\`\`\`python
import argparse

class RangeAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        # values 是用户传入的值
        if not (1 <= values <= 100):
            raise argparse.ArgumentError(self, f"必须在 1-100 之间,得到 {values}")
        setattr(namespace, self.dest, values)

parser.add_argument("--level", type=int, action=RangeAction, default=50)
\`\`\`

\`\`\`bash
$ python demo.py --level 200
# error: argument --level: 必须在 1-100 之间,得到 200
\`\`\`

自定义 action 的 \`__call__\` 接收:

- \`parser\`:解析器实例
- \`namespace\`:当前 namespace,用 \`setattr\` 写入
- \`values\`:用户传入的值(store 通常是单值,append 是列表)
- \`option_string\`:触发该 action 的选项名(如 \`--level\`)

## 六、版本信息:action="version"

\`\`\`python
parser.add_argument("-V", "--version", action="version",
                    version="%(prog)s 1.2.3")
\`\`\`

更工程化的做法是从 \`__version__\` 读取:

\`\`\`python
from mypackage import __version__

parser.add_argument("--version", action="version",
                    version=f"%(prog)s {__version__}")
\`\`\`

\`\`\`bash
$ python demo.py --version
demo.py 1.2.3
\`\`\`

## 七、从文件读参数:fromfile_prefix_chars

当参数特别多(比如一堆 \`--include\`),全部写在命令行很丑。argparse 支持从文件读参数:

\`\`\`python
import argparse
parser = argparse.ArgumentParser(fromfile_prefix_chars="@")
parser.add_argument("--include", action="append", default=[])
parser.add_argument("--exclude", action="append", default=[])

args = parser.parse_args()
\`\`\`

然后写一个参数文件 \`args.txt\`:

\`\`\`text
--include
src
--include
tests
--exclude
vendor
\`\`\`

调用时用 \`@\` 引用:

\`\`\`bash
$ python demo.py @args.txt
# 等价于 python demo.py --include src --include tests --exclude vendor
\`\`\`

每行一个 token,argparse 自动展开。适合 CI/CD 里复用一组固定参数。

### 7.1 手动报错:error() 方法与退出码

argparse 解析失败时会自动调用 \`parser.error(msg)\` 打印错误并以退出码 2 退出。你在业务逻辑里也可以手动调用它,让错误信息格式统一:

\`\`\`python
args = parser.parse_args()

# 业务层校验:argparse 自身无法表达的约束
if args.start > args.end:
    # error() 会自动加 "usage:" 前缀,打印 msg,然后 sys.exit(2)
    parser.error("--start 不能大于 --end")

# 正常逻辑
do_work(args)
\`\`\`

\`parser.error()\` 和 \`sys.exit(2)\` 的区别:

| 方式 | 行为 | 适合场景 |
|------|------|----------|
| \`parser.error(msg)\` | 打印 usage + msg 到 stderr,退出码 2 | 参数相关错误(语法/约束) |
| \`sys.exit(1)\` | 直接退出,不打印 usage | 业务错误(文件不存在、网络失败) |
| \`raise SystemExit(n)\` | 等价 sys.exit(n),但可被捕获 | 需要测试时拦截退出 |

约定:**参数错误用 \`parser.error()\`(退出码 2),业务错误用 \`sys.exit(1)\`**。这样调用方能区分"用户用错了"和"任务执行失败"。

## 八、argparse 的局限

argparse 虽然强大,但也有明显的短板:

| 局限 | 表现 | 替代方案 |
|------|------|----------|
| 代码啰嗦 | 每个参数都要 \`add_argument\` 一行甚至多行 | Click/Typer 用装饰器/注解更紧凑 |
| 无类型注解 | \`type=int\` 是字符串,IDE 看不出 | Typer 直接用 \`x: int\` |
| 子命令嵌套麻烦 | 嵌套两层以上代码爆炸 | Click 的 group 天然支持嵌套 |
| 帮助不美观 | 纯文本,无颜色 | Typer + Rich 彩色输出 |
| 无 shell 补全自动生成 | 要自己写补全脚本 | Typer 一键生成 |
| 错误信息英文 | "invalid int value" 不好本地化 | 接受现实 |
| 参数验证分散 | 校验逻辑散落在 type/action 里 | Click 的 callback 集中 |

理解这些局限,你才会明白为什么 Click 和 Typer 能火起来。

## 九、本章代码 demo:git 风格多子命令 CLI

综合子命令、互斥、参数组、自定义类型,写一个"迷你 git"CLI,包含 \`add\`/\`commit\`/\`push\`/\`log\` 四个子命令。

\`\`\`python
# mini_git.py - argparse 进阶 demo
import argparse
import sys
from pathlib import Path

# 自定义类型
def existing_path(s):
    p = Path(s)
    if not p.exists():
        raise argparse.ArgumentTypeError(f"路径不存在: {s}")
    return p

def build_parser():
    parser = argparse.ArgumentParser(
        prog="minigit",
        description="迷你 git:演示 argparse 子命令",
    )
    parser.add_argument("-C", "--repo", type=existing_path, default=Path.cwd(),
                        help="仓库路径(默认当前目录)")
    parser.add_argument("-V", "--version", action="version",
                        version="%(prog)s 0.1.0")

    sub = parser.add_subparsers(dest="cmd", required=True, metavar="<command>",
                                title="commands")

    # add:暂存文件
    p_add = sub.add_parser("add", help="暂存文件到索引")
    p_add.add_argument("paths", nargs="+", type=existing_path, help="文件路径")
    p_add.add_argument("-A", "--all", action="store_true", help="暂存全部变更")
    p_add.set_defaults(func=cmd_add)

    # commit:提交
    p_commit = sub.add_parser("commit", help="提交暂存区到本地")
    p_commit.add_argument("-m", "--message", required=True, help="提交信息")
    p_commit.add_argument("--amend", action="store_true", help="修改上次提交")
    p_commit.add_argument("--allow-empty", action="store_true", help="允许空提交")
    p_commit.set_defaults(func=cmd_commit)

    # push:推送
    p_push = sub.add_parser("push", help="推送到远程")
    p_push.add_argument("remote", nargs="?", default="origin", help="远程名")
    p_push.add_argument("refspec", nargs="?", default="main", help="分支")
    # 互斥组:--force 与 --force-with-lease 不能同时使用
    mx = p_push.add_mutually_exclusive_group()
    mx.add_argument("-f", "--force", action="store_true", help="强制推送(危险)")
    mx.add_argument("--force-with-lease", action="store_true",
                    help="带租约的强制推送(更安全)")
    p_push.set_defaults(func=cmd_push)

    # log:查看历史
    p_log = sub.add_parser("log", help="查看提交历史")
    p_log.add_argument("-n", "--max-count", type=int, default=10, help="显示条数")
    p_log.add_argument("--oneline", action="store_true", help="一行一条")
    fmt_group = p_log.add_mutually_exclusive_group()
    fmt_group.add_argument("--json", action="store_true", help="JSON 格式")
    fmt_group.add_argument("--pretty", action="store_true", help="美化格式")
    p_log.set_defaults(func=cmd_log)

    return parser

def cmd_add(args):
    print(f"[add] 仓库={args.repo}")
    if args.all:
        print("  暂存全部变更")
    for p in args.paths:
        print(f"  + {p}")

def cmd_commit(args):
    print(f"[commit] 仓库={args.repo}")
    print(f"  message: {args.message}")
    if args.amend:
        print("  (修改上次提交)")
    if args.allow_empty:
        print("  (允许空提交)")

def cmd_push(args):
    print(f"[push] 仓库={args.repo}")
    print(f"  remote={args.remote} refspec={args.refspec}")
    if args.force:
        print("  ⚠ 强制推送")
    elif args.force_with_lease:
        print("  带租约的强制推送")

def cmd_log(args):
    print(f"[log] 仓库={args.repo}")
    print(f"  显示 {args.max_count} 条")
    if args.oneline:
        print("  abc1234 commit 1")
        print("  def5678 commit 2")
    elif args.json:
        print('  [{"hash": "abc1234", "msg": "commit 1"}]')
    else:
        print("  commit abc1234\\n  Author: ...\\n  commit 1")

def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)
    return 0

if __name__ == "__main__":
    sys.exit(main())
\`\`\`

运行示例:

\`\`\`bash
$ python mini_git.py --help
usage: minigit [-h] [-C REPO] [-V] <command> ...

迷你 git:演示 argparse 子命令

options:
  -h, --help            show this help message and exit
  -C REPO, --repo REPO  仓库路径(默认当前目录)
  -V, --version         show program's version number and exit

commands:
  <command>
    add                 暂存文件到索引
    commit              提交暂存区到本地
    push                推送到远程
    log                 查看提交历史

$ python mini_git.py add a.txt b.txt
[add] 仓库=/Users/me
  + a.txt
  + b.txt

$ python mini_git.py commit -m "init"
[commit] 仓库=/Users/me
  message: init

$ python mini_git.py push origin main --force
[push] 仓库=/Users/me
  remote=origin refspec=main
  ⚠ 强制推送

$ python mini_git.py push --force --force-with-lease
# error: argument --force-with-lease: not allowed with argument --force

$ python mini_git.py log -n 5 --oneline
[log] 仓库=/Users/me
  显示 5 条
  abc1234 commit 1
  def5678 commit 2

$ python mini_git.py -C /notexist add a.txt
# error: argument -C/--repo: 路径不存在: /notexist
\`\`\`

这个例子覆盖了:子命令、\`set_defaults(func=)\` 分发、互斥组、参数组、自定义类型、版本信息。基本是 argparse 的"全技能展示"。

## 十、argparse 常用参数属性速查表

| 属性 | 作用 | 适用 | 示例 |
|------|------|------|------|
| \`help\` | 帮助文本 | 全部 | \`help="端口"\` |
| \`type\` | 类型转换函数 | 全部 | \`type=int\` |
| \`default\` | 默认值 | 全部 | \`default=8000\` |
| \`required\` | 是否必填 | 可选参数 | \`required=True\` |
| \`choices\` | 限定取值 | 全部 | \`choices=["a","b"]\` |
| \`action\` | 动作类型 | 全部 | \`action="store_true"\` |
| \`nargs\` | 参数个数 | 全部 | \`nargs="+"\` |
| \`dest\` | 属性名 | 全部 | \`dest="outfile"\` |
| \`metavar\` | 帮助占位符 | 全部 | \`metavar="FILE"\` |
| \`const\` | store_const 的常量 | 配合 action | \`const=1024\` |
| \`version\` | 版本字符串 | \`action="version"\` | \`version="1.0"\` |

## 十一、易错点小结

| 易错点 | 错误写法 | 正确写法 | 后果 |
|--------|----------|----------|------|
| 子命令忘记 \`dest\` | \`add_subparsers()\` | \`add_subparsers(dest="cmd")\` | 不知道用户选了哪个 |
| 子命令忘记 \`required\` | \`add_subparsers(dest="cmd")\` | \`add_subparsers(dest="cmd", required=True)\` | 不传子命令不报错 |
| 互斥组里放位置参数 | \`group.add_argument("x")\` | 互斥组只能放可选参数 | 报错 |
| 互斥组里参数有 default | \`add_mutually_exclusive_group()\` 里参数配 default | 互斥参数一般不配 default | 行为诡异 |
| 自定义 type 抛 ValueError | \`raise ValueError(...)\` | \`raise argparse.ArgumentTypeError(...)\` | 错误信息不友好 |
| FileType 用完不关 | \`args.input.read()\` 后忘 close | 用 with 或显式 close | 文件句柄泄漏 |
| 嵌套子命令 dest 重名 | 两层都 \`dest="cmd"\` | 用不同 dest(\`cmd\`/\`subcmd\`) | 内层覆盖外层 |
| set_defaults 漏写 | 子命令没 \`set_defaults(func=)\` | 每个子命令都设 | \`args.func\` AttributeError |
| fromfile_prefix_chars 用错 | 文件里参数不分行 | 一行一个 token | 解析错乱 |
| 参数组当互斥组用 | \`add_argument_group\` 期望互斥 | 互斥用 \`add_mutually_exclusive_group\` | 参数组只是显示分组 |

## 十二、本章小结

1. **子命令**:\`add_subparsers(dest=, required=)\` + 每个 subparser \`set_defaults(func=)\` 分发。
2. **互斥**:\`add_mutually_exclusive_group(required=)\` 自动检查冲突。
3. **参数组**:\`add_argument_group("组名")\` 仅用于帮助分组显示。
4. **自定义类型**:\`type=func\`,func 接收字符串返回值,出错抛 \`ArgumentTypeError\`。
5. **自定义 action**:继承 \`argparse.Action\`,实现 \`__call__\`。
6. **文件读参数**:\`fromfile_prefix_chars="@"\` + \`@args.txt\`。
7. **局限**:啰嗦、无类型注解、嵌套子命令麻烦 —— 这是 Click/Typer 的机会。

下一章进入 Click,看装饰器风格如何把上面这些代码量砍掉一半。
`,
  },

  // =========================================================
  // 第四章:Click 框架
  // =========================================================
  {
    id: "pyeng-cli-click",
    icon: "🖱️",
    title: "Click 框架",
    group: "命令行工具",
    content: `# Click 框架

## 一、Click 简介

\`Click\`(全称 "Command Line Interface Creation Kit")是 Python 最流行的第三方 CLI 框架,由 **Armin Ronacher** 开发。你也许没听过他的名字,但一定用过他写的 **Flask**。Click 的设计哲学和 Flask 一脉相承:简洁、装饰器风格、约定优于配置。

\`\`\`text
Click 的核心思想:
  - 用装饰器把"普通函数"变成"CLI 命令"
  - 用类型注解般的装饰器参数声明 CLI 参数
  - 自动生成帮助、处理类型转换、错误处理
  - 把样板代码降到最低
\`\`\`

### 1.1 安装

\`\`\`bash
pip install click
# 当前稳定版 8.x,支持 Python 3.7+
\`\`\`

如果你想用 Click 的彩色输出和进度条,可以装 "extras":

\`\`\`bash
pip install "click[colors]"
\`\`\`

### 1.2 Click vs argparse:第一印象

实现"问候"CLI,对比一下:

**argparse 版**:

\`\`\`python
import argparse

parser = argparse.ArgumentParser(description="问候工具")
parser.add_argument("--name", default="World", help="名字")
parser.add_argument("--count", type=int, default=1, help="次数")
args = parser.parse_args()

for _ in range(args.count):
    print(f"Hello, {args.name}!")
\`\`\`

**Click 版**:

\`\`\`python
import click

@click.command()
@click.option("--name", default="World", help="名字")
@click.option("--count", type=int, default=1, help="次数")
def greet(name, count):
    """问候工具"""
    for _ in range(count):
        click.echo(f"Hello, {name}!")

if __name__ == "__main__":
    greet()
\`\`\`

对比:

- argparse 需要先建 parser、加参数、parse_args,再从 namespace 取值
- Click 把参数直接变成函数参数,函数体就是业务逻辑
- Click 的帮助文本来自函数 docstring(\`"""问候工具"""\`)
- Click 用 \`click.echo\` 而非 \`print\`(后面解释为什么)

代码量差不多,但 Click 的"函数即命令"更直观。当参数变多、有子命令时,差距会迅速放大。

## 二、核心概念:command + option + argument

Click 的三个核心原语:

| 概念 | 装饰器 | 对应 argparse | 说明 |
|------|--------|--------------|------|
| 命令 | \`@click.command()\` | ArgumentParser | 把函数变成 CLI 命令 |
| 选项 | \`@click.option()\` | \`add_argument("--x")\` | 可选参数(\`--\` 开头) |
| 参数 | \`@click.argument()\` | \`add_argument("x")\` | 位置参数(不带 \`--\`) |

\`\`\`python
@click.command()
@click.option("--verbose", is_flag=True, help="详细模式")
@click.argument("filename")
def cli(verbose, filename):
    """处理文件"""
    if verbose:
        click.echo(f"处理 {filename}")
    click.echo("done")
\`\`\`

\`\`\`bash
$ python cli.py --verbose a.txt
处理 a.txt
done
\`\`\`

## 三、基本用法

### 3.1 @click.command():声明命令

\`\`\`python
@click.command()
def mytool():
    """这是一个工具"""
    click.echo("running")
\`\`\`

- 函数名 \`mytool\` 就是命令名(也可用 \`name=\` 改)
- docstring 自动变成 description
- 调用时直接 \`mytool()\`(会自动解析 argv)

### 3.2 @click.option():添加选项

\`\`\`python
@click.option("--name", prompt="你的名字", help="名字")
@click.option("--count", type=int, default=1, help="次数")
@click.option("-v", "--verbose", is_flag=True, help="详细")
\`\`\`

常用参数:

| 参数 | 作用 | 例子 |
|------|------|------|
| \`default\` | 默认值 | \`default=1\` |
| \`type\` | 类型 | \`type=int\` |
| \`help\` | 帮助文本 | \`help="次数"\` |
| \`prompt\` | 缺失时交互式询问 | \`prompt="名字"\` |
| \`is_flag\` | 是否开关 | \`is_flag=True\` |
| \`required\` | 是否必填 | \`required=True\` |
| \`multiple\` | 多次出现收集 | \`multiple=True\` |
| \`count\` | 累计次数 | \`count=True\` |
| \`choices\` | 限定取值 | \`type=click.Choice(["a","b"])\` |
| \`callback\` | 校验回调 | \`callback=validate\` |
| \`envvar\` | 环境变量来源 | \`envvar="MY_NAME"\` |

### 3.3 @click.argument():添加位置参数

\`\`\`python
@click.argument("filename")
@click.argument("urls", nargs=-1)  # 接收 0 个或多个
\`\`\`

argument 比 option 简单,常用属性只有 \`nargs\`、\`type\`、\`required\`、\`default\`、\`envvar\`。

## 四、Click 的优势

### 4.1 装饰器风格,代码简洁

argparse 是"声明式配置 + 命令式取值",Click 是"装饰器即声明 + 函数参数即取值"。后者更紧凑。

\`\`\`python
# argparse: 配置和取值分离
parser.add_argument("--name", default="World")
args = parser.parse_args()
print(args.name)

# Click: 装饰器直接注入
@click.option("--name", default="World")
def cmd(name):
    click.echo(name)
\`\`\`

### 4.2 自动生成帮助

Click 自动从 docstring 和 \`help=\` 生成格式工整的帮助,还自动处理 \`-h/--help\`:

\`\`\`python
@click.command()
@click.option("--name", default="World", help="被问候的名字")
@click.option("--count", type=int, default=1, help="重复次数")
def greet(name, count):
    """问候工具 - 向指定的人打招呼

    这个工具可以用于演示、测试、教学等场景。
    """
    for _ in range(count):
        click.echo(f"Hello, {name}!")
\`\`\`

\`\`\`bash
$ python greet.py --help
Usage: greet.py [OPTIONS]

  问候工具 - 向指定的人打招呼

  这个工具可以用于演示、测试、教学等场景。

Options:
  --name TEXT       被问候的名字
  --count INTEGER   重复次数
  --help            Show this message and exit.
\`\`\`

### 4.3 类型转换

Click 内置 \`click.INT\`、\`click.FLOAT\`、\`click.STRING\`、\`click.BOOL\`、\`click.Path\`、\`click.File\`、\`click.Choice\` 等类型:

\`\`\`python
@click.option("--port", type=int, default=8000)
@click.option("--config", type=click.Path(exists=True))  # 必须存在
@click.option("--input", type=click.File("r"))           # 直接打开
@click.option("--mode", type=click.Choice(["dev","prod"]))
\`\`\`

\`click.Path(exists=True)\` 自动校验路径存在,比 argparse 自定义 type 简洁。

### 4.4 默认值、必填、choices

\`\`\`python
@click.option("--host", default="localhost")              # 默认值
@click.option("--token", required=True)                   # 必填
@click.option("--env", type=click.Choice(["dev","prod"])) # 限定
\`\`\`

### 4.5 选项的多种形式

#### flag(开关)

\`\`\`python
@click.option("-v", "--verbose", is_flag=True, help="详细输出")
@click.option("--no-cache/--cache", default=True, help="是否启用缓存")
\`\`\`

\`\`\`bash
$ python demo.py -v          # verbose=True
$ python demo.py --no-cache  # cache=False
$ python demo.py --cache     # cache=True
\`\`\`

#### count(累计)

\`\`\`python
@click.option("-v", "--verbose", count=True, help="详细级别(-v, -vv)")
\`\`\`

\`\`\`bash
$ python demo.py -vvv  # verbose=3
\`\`\`

#### multiple(收集列表)

\`\`\`python
@click.option("--file", "-f", multiple=True, help="文件(可多次指定)")
\`\`\`

\`\`\`bash
$ python demo.py -f a.txt -f b.txt
# file = ('a.txt', 'b.txt')  # 注意是 tuple,不是 list
\`\`\`

### 4.6 上下文对象 context(ctx.obj)传递数据

当命令复杂、有子命令时,顶层命令算出的数据要传给子命令。Click 用 \`ctx.obj\` 实现:

\`\`\`python
@click.group()
@click.option("--debug", is_flag=True)
@click.pass_context  # @click.pass_context 把 Context 对象 ctx 作为首参注入
def cli(ctx, debug):
    # ctx.ensure_object(dict):如果 ctx.obj 是 None 就初始化为 {},避免 NoneType 报错
    ctx.ensure_object(dict)
    # 把顶层算出的数据存到 ctx.obj,子命令可通过自己的 ctx.obj 读到(父 context 向下传递)
    ctx.obj["debug"] = debug
    ctx.obj["client"] = create_client(debug=debug)

@cli.command()
@click.pass_context  # 子命令也用 @click.pass_context 拿到继承自父级的 ctx.obj
def list(ctx):
    if ctx.obj["debug"]:
        click.echo("调试模式")
    items = ctx.obj["client"].list()  # 复用父级创建的 client
    for it in items:
        click.echo(it)
\`\`\`

\`@click.pass_context\` 把 \`ctx\` 注入函数,通过 \`ctx.obj\` 在命令间共享状态。

## 五、子命令:@click.group() + 子 command

Click 的子命令用 \`@click.group()\` 实现,可以无限嵌套:

\`\`\`python
@click.group()
def cli():
    """迷你 git"""
    pass

@cli.command()
@click.argument("paths", nargs=-1)
@click.option("-A","--all", is_flag=True)
def add(paths, all):
    """暂存文件"""
    click.echo(f"add: {paths}, all={all}")

@cli.command()
@click.option("-m","--message", required=True)
def commit(message):
    """提交"""
    click.echo(f"commit: {message}")

@cli.command()
@click.argument("remote", default="origin")
def push(remote):
    """推送"""
    click.echo(f"push to {remote}")

if __name__ == "__main__":
    cli()
\`\`\`

\`\`\`bash
$ python mini_git.py --help
Usage: mini_git.py [OPTIONS] COMMAND [ARGS]...

  迷你 git

Options:
  --help  Show this message and exit.

Commands:
  add     暂存文件
  commit  提交
  push    推送

$ python mini_git.py add a.txt b.txt
add: ('a.txt', 'b.txt'), all=False

$ python mini_git.py commit -m "init"
commit: init
\`\`\`

### 5.1 嵌套子命令

\`\`\`python
@click.group()
def db():
    """数据库操作"""
    pass

@db.group()
def migrate():
    """迁移"""
    pass

@migrate.command()
def up():
    click.echo("migrate up")

@migrate.command()
def down():
    click.echo("migrate down")

# 用法:myapp db migrate up
\`\`\`

嵌套子命令在 Click 里非常自然,这是它比 argparse 显著的优势。

### 5.2 invoked_subcommand:在 group 中知道用户选了哪个子命令

有时 group 函数需要根据"用户接下来要跑哪个子命令"做不同准备。用 \`ctx.invoked_subcommand\` 可以拿到:

\`\`\`python
@click.group()
@click.pass_context
def cli(ctx):
    """迷你 git"""
    # ctx.invoked_subcommand 在 group 函数体执行时已可读
    # 值是子命令名字符串(如 "commit"),没传子命令时为 None
    if ctx.invoked_subcommand is None:
        click.echo("提示: 用 --help 查看子命令")
    elif ctx.invoked_subcommand == "commit":
        click.echo("准备提交,检查暂存区...", err=True)

@cli.command()
def add():
    click.echo("add")

@cli.command()
def commit():
    click.echo("commit")
\`\`\`

\`\`\`bash
$ python mygit.py
提示: 用 --help 查看子命令

$ python mygit.py commit
准备提交,检查暂存区...
commit
\`\`\`

注意:\`ctx.invoked_subcommand\` 在 group 回调执行时就已经被 Click 解析好了,可以用来做"按子命令预处理"(如 commit 前自动检查暂存区、push 前自动 fetch)。

### 5.3 context settings:自定义上下文行为

\`@click.group()\` / \`@click.command()\` 接受 \`context_settings=\` 参数,可以调整默认行为:

\`\`\`python
@click.group(context_settings=dict(
    help_option_names=["-h", "--help"],  # 把 -h 也作为帮助开关(默认只有 --help)
    max_content_width=120,               # 帮助文本最大宽度
    auto_envvar_prefix="MYTOOL",         # 自动从 MYTOOL_XXX 环境变量读参数
))
def cli():
    pass
\`\`\`

\`auto_envvar_prefix="MYTOOL"\` 后,选项 \`--port\` 会自动从环境变量 \`MYTOOL_PORT\` 读取,无需显式声明 \`envvar=\`。

## 六、高级特性

### 6.1 click.echo:跨平台输出

为什么不用 \`print\`?因为 \`click.echo\` 处理了:

- Windows 控制台编码问题
- 输出重定向时的字节/文本模式
- 颜色输出的自动降级(管道里不输出 ANSI 颜色)

\`\`\`python
click.echo("hello")                    # 普通输出
click.echo("error", err=True)          # 输出到 stderr
click.echo(b"binary data")             # 输出字节
\`\`\`

### 6.2 click.prompt:交互式输入

\`\`\`python
name = click.prompt("你的名字", default="Alice")
password = click.prompt("密码", hide_input=True, confirmation_prompt=True)
age = click.prompt("年龄", type=int)
\`\`\`

\`\`\`bash
$ python demo.py
你的名字 [Alice]:
密码:
密码 (再次输入):
年龄: thirty
Error: thirty is not a valid integer
年龄: 30
\`\`\`

### 6.3 click.confirm:确认

\`\`\`python
if click.confirm("确定删除?", default=False):
    do_delete()
\`\`\`

\`\`\`bash
$ python demo.py
确定删除? [y/N]: y
\`\`\`

### 6.4 click.progressbar:进度条

\`\`\`python
import time

with click.progressbar(range(100)) as bar:
    for i in bar:
        time.sleep(0.02)
\`\`\`

\`\`\`text
  [####################################]  100%
\`\`\`

可以自定义 label、长度、显示格式。

### 6.5 click.style:彩色输出

\`\`\`python
click.echo(click.style("成功", fg="green", bold=True))
click.echo(click.style("警告", fg="yellow"))
click.echo(click.style("错误", fg="red", reverse=True))
\`\`\`

\`\`\`bash
$ python demo.py
(绿色的"成功")
(黄色的"警告")
(红色反白的"错误")
\`\`\`

更方便的:\`click.secho\`:

\`\`\`python
click.secho("成功", fg="green")
click.secho("失败", fg="red", err=True)
\`\`\`

注意:当输出被重定向到文件/管道时,Click 自动去掉颜色码,不会污染数据。

### 6.6 自定义类型:ParamType

当内置类型不够时,继承 \`click.ParamType\`:

\`\`\`python
import click
from datetime import datetime

class DateTimeType(click.ParamType):
    name = "datetime"

    def convert(self, value, param, ctx):
        if isinstance(value, datetime):
            return value
        try:
            return datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            self.fail(f"{value!r} 不是有效的日期(YYYY-MM-DD)", param, ctx)

@click.command()
@click.option("--date", type=DateTimeType())
def cmd(date):
    click.echo(date)
\`\`\`

\`self.fail\` 会自动抛出 Click 风格的错误,带参数名和上下文。

## 七、本章代码 demo

### 7.1 用 Click 重写第 2 章的 fileproc.py

\`\`\`python
# fileproc_click.py
import click
from pathlib import Path

@click.command()
@click.argument("input", type=click.Path(exists=True, path_type=Path))
@click.option("-o", "--output", type=click.Path(path_type=Path),
              help="输出文件(默认 <input>.out)")
@click.option("-v", "--verbose", is_flag=True, help="详细输出")
@click.option("-f", "--force", is_flag=True, help="强制覆盖")
@click.option("--encoding", default="utf-8", help="文件编码")
@click.option("--upper", "mode", flag_value="upper", help="转大写")
@click.option("--lower", "mode", flag_value="lower", help="转小写")
@click.option("--max-size", type=int, default=0, help="最大字节数(0=不限)")
def fileproc(input, output, verbose, force, encoding, mode, max_size):
    """文件处理工具:读取输入,转换后写入输出"""
    out_path = output if output else input.with_suffix(".out")
    if out_path.exists() and not force:
        raise click.ClickException(f"输出文件已存在: {out_path}(用 --force)")

    if verbose:
        click.echo(f"[INFO] 读取 {input}", err=True)
    text = input.read_text(encoding=encoding)

    if max_size > 0 and len(text.encode(encoding)) > max_size:
        raise click.ClickException(f"文件超过 {max_size} 字节")

    if mode == "upper":
        text = text.upper()
    elif mode == "lower":
        text = text.lower()

    if verbose:
        click.echo(f"[INFO] 写入 {out_path}", err=True)
    out_path.write_text(text, encoding=encoding)
    click.echo(f"完成,共 {len(text)} 字符", err=True)

if __name__ == "__main__":
    fileproc()
\`\`\`

注意几个 Click 特色:

- \`type=click.Path(exists=True, path_type=Path)\`:自动校验存在 + 返回 Path 对象
- \`flag_value\`:把多个 flag 绑到同一个属性(\`mode\`),自动互斥(等价 argparse 互斥组)
- \`raise click.ClickException\`:Click 风格的错误,自动格式化 + 退出码 1
- \`click.echo(..., err=True)\`:日志走 stderr,不污染 stdout

### 7.2 多子命令 CLI

\`\`\`python
# tasks_click.py - 任务管理 CLI
import click
import json
from pathlib import Path

TODO_FILE = Path.home() / ".tasks.json"

def load_tasks():
    if TODO_FILE.exists():
        return json.loads(TODO_FILE.read_text())
    return []

def save_tasks(tasks):
    TODO_FILE.write_text(json.dumps(tasks, ensure_ascii=False, indent=2))

@click.group()
@click.option("--debug", is_flag=True, help="调试模式")
@click.pass_context
def cli(ctx, debug):
    """任务管理工具"""
    ctx.ensure_object(dict)
    ctx.obj["debug"] = debug
    ctx.obj["tasks"] = load_tasks()

@cli.command()
@click.argument("title")
@click.option("--priority", type=click.Choice(["low","mid","high"]),
              default="mid", help="优先级")
@click.pass_context
def add(ctx, title, priority):
    """添加任务"""
    task = {"title": title, "priority": priority, "done": False}
    ctx.obj["tasks"].append(task)
    save_tasks(ctx.obj["tasks"])
    click.secho(f"已添加: [{priority}] {title}", fg="green")

@cli.command()
@click.option("--all", is_flag=True, help="显示已完成")
@click.pass_context
def list(ctx, all):
    """列出任务"""
    tasks = ctx.obj["tasks"]
    if not all:
        tasks = [t for t in tasks if not t["done"]]
    if not tasks:
        click.echo("(空)")
        return
    for i, t in enumerate(tasks, 1):
        mark = "✓" if t["done"] else " "
        color = {"high":"red","mid":"yellow","low":"green"}[t["priority"]]
        click.echo(f"{i}. [{mark}] ", nl=False)
        click.secho(f"[{t['priority']}] ", fg=color, nl=False)
        click.echo(t["title"])

@cli.command()
@click.argument("task_id", type=int)
@click.pass_context
def done(ctx, task_id):
    """标记任务完成"""
    tasks = ctx.obj["tasks"]
    if task_id < 1 or task_id > len(tasks):
        raise click.ClickException(f"无效的任务 ID: {task_id}")
    tasks[task_id - 1]["done"] = True
    save_tasks(tasks)
    click.secho(f"已完成: {tasks[task_id-1]['title']}", fg="green")

@cli.command()
@click.argument("task_id", type=int)
@click.confirmation_option(prompt="确定删除?")
@click.pass_context
def delete(ctx, task_id):
    """删除任务"""
    tasks = ctx.obj["tasks"]
    if task_id < 1 or task_id > len(tasks):
        raise click.ClickException(f"无效的任务 ID: {task_id}")
    removed = tasks.pop(task_id - 1)
    save_tasks(tasks)
    click.secho(f"已删除: {removed['title']}", fg="yellow")

@cli.command()
def stats():
    """统计"""
    tasks = load_tasks()
    total = len(tasks)
    done = sum(1 for t in tasks if t["done"])
    click.echo(f"总计: {total},完成: {done},待办: {total - done}")
    if total:
        click.echo(f"完成率: {done/total:.1%}")

if __name__ == "__main__":
    cli()
\`\`\`

运行:

\`\`\`bash
$ python tasks_click.py add "学 Click" --priority high
已添加: [high] 学 Click

$ python tasks_click.py add "写 demo" --priority mid
已添加: [mid] 写 demo

$ python tasks_click.py list
1. [ ] [high] 学 Click
2. [ ] [mid] 写 demo

$ python tasks_click.py done 1
已完成: 学 Click

$ python tasks_click.py list
1. [ ] [mid] 写 demo

$ python tasks_click.py list --all
1. [✓] [high] 学 Click
2. [ ] [mid] 写 demo

$ python tasks_click.py stats
总计: 2,完成: 1,待办: 1
完成率: 50.0%

$ python tasks_click.py delete 1
确定删除? [y/N]: y
已删除: 学 Click
\`\`\`

注意:

- \`@click.confirmation_option(prompt=)\` 自动加确认
- \`click.secho\` 彩色输出
- \`raise click.ClickException\` 统一错误处理
- \`@click.pass_context\` 在子命令间共享 \`tasks\` 列表

## 八、Click vs argparse API 对比表

| 功能 | argparse | Click |
|------|----------|-------|
| 创建命令 | \`ArgumentParser()\` | \`@click.command()\` |
| 添加选项 | \`add_argument("--x")\` | \`@click.option("--x")\` |
| 添加位置参数 | \`add_argument("x")\` | \`@click.argument("x")\` |
| 类型转换 | \`type=int\` | \`type=int\` 或 \`type=click.INT\` |
| 默认值 | \`default=1\` | \`default=1\` |
| 必填 | \`required=True\` | \`required=True\` |
| 限定取值 | \`choices=["a","b"]\` | \`type=click.Choice(["a","b"])\` |
| 开关 | \`action="store_true"\` | \`is_flag=True\` |
| 累计 | \`action="count"\` | \`count=True\` |
| 收集列表 | \`action="append"\` | \`multiple=True\` |
| 子命令 | \`add_subparsers()\` | \`@click.group()\` |
| 互斥 | \`add_mutually_exclusive_group()\` | \`flag_value\` 或手动校验 |
| 文件类型 | \`argparse.FileType("r")\` | \`type=click.File("r")\` |
| 路径校验 | 自定义 type | \`type=click.Path(exists=True)\` |
| 错误处理 | 自己 try/except + sys.exit | \`raise click.ClickException\` |
| 输出 | \`print\` | \`click.echo\` |
| 彩色输出 | 无 | \`click.secho\` / \`click.style\` |
| 进度条 | 无 | \`click.progressbar\` |
| 确认 | 自己写 input | \`click.confirm\` |
| 交互输入 | 自己写 input | \`click.prompt\` |
| 帮助 | 自动(朴素) | 自动(朴素) |
| 上下文传递 | 自己想办法 | \`ctx.obj\` |

## 九、易错点小结

| 易错点 | 错误写法 | 正确写法 | 后果 |
|--------|----------|----------|------|
| 忘记调用主函数 | 装饰器后没 \`if __name__ == "__main__"\` | 加上 \`cli()\` | 命令不执行 |
| option 顺序错 | \`@click.option\` 在 \`@click.command\` 之上 | command 在最外层 | 装饰器失效 |
| 函数参数名不匹配 | \`@click.option("--foo-bar")\` 函数用 \`foobar\` | 函数用 \`foo_bar\` | TypeError |
| argument 当 option | \`@click.argument("--x")\` | argument 不带 \`--\` | 报错 |
| multiple 当 list 用 | \`for f in files\` 期望 list | 是 tuple | 用起来一样,但不可变 |
| flag 配 type | \`is_flag=True, type=int\` | flag 不要 type | 报错 |
| Pass_context 漏装饰 | 函数参数有 ctx 但没 \`@click.pass_context\` | 加装饰器 | TypeError |
| ClickException 不抛 | \`print(err); sys.exit(1)\` | \`raise click.ClickException\` | 错误格式不统一 |
| 重定向时颜色乱码 | 直接 print ANSI 码 | 用 \`click.secho\` | 文件里有乱码 |
| 子命令忘记 group | 子命令用 \`@click.command\` | 用 \`@cli.command\` | 子命令不注册 |
| echo 输出到 stdout 当日志 | \`click.echo("[INFO] ...")\` | \`click.echo(..., err=True)\` | 污染数据流 |
| ctx.obj 不 ensure | 直接 \`ctx.obj["x"]\` | \`ctx.ensure_object(dict)\` | NoneType 报错 |

## 十、本章小结

1. **三原语**:\`@click.command\` + \`@click.option\` + \`@click.argument\`。
2. **装饰器风格**:配置和函数体一体,代码紧凑。
3. **子命令**:\`@click.group()\` 可无限嵌套,比 argparse 优雅。
4. **辅助函数**:\`echo\`/\`prompt\`/\`confirm\`/\`progressbar\`/\`style\` 让 CLI 体验丰富。
5. **上下文**:\`ctx.obj\` 在命令间共享状态。
6. **错误处理**:\`raise click.ClickException\` 统一格式。

下一章看 Typer 如何用类型注解把 Click 的代码量再砍一半。
`,
  },

  // =========================================================
  // 第五章:Typer 框架
  // =========================================================
  {
    id: "pyeng-cli-typer",
    icon: "⚡",
    title: "Typer 框架",
    group: "命令行工具",
    content: `# Typer 框架

## 一、Typer 简介

\`Typer\` 是 Python 最年轻的 CLI 框架,由 **Sebastián Ramírez** 开发。你也许没听过他的名字,但一定用过他写的 **FastAPI**。Typer 的设计哲学和 FastAPI 一脉相承:**用 Python 类型注解定义接口,框架自动推导出 CLI**。

\`\`\`text
Typer 的核心思想:
  - 函数参数的类型注解 → CLI 参数类型
  - 函数参数的默认值 → 是否必填、默认值
  - 函数 docstring → 帮助文本
  - 几乎零样板,代码即文档
  - 底层用 Click,兼容 Click 的所有能力
\`\`\`

### 1.1 安装

\`\`\`bash
pip install "typer[all]"
# extras 包括 Rich(美化输出)和 shellingham(shell 补全)
# 或最小安装:
pip install typer
\`\`\`

### 1.2 Typer vs Click:第一印象

实现"问候"CLI:

**Click 版**:

\`\`\`python
import click

@click.command()
@click.option("--name", default="World", help="名字")
@click.option("--count", type=int, default=1, help="次数")
def greet(name, count):
    """问候工具"""
    for _ in range(count):
        click.echo(f"Hello, {name}!")

if __name__ == "__main__":
    greet()
\`\`\`

**Typer 版**:

\`\`\`python
import typer

def greet(name: str = "World", count: int = 1):
    """问候工具"""
    for _ in range(count):
        typer.echo(f"Hello, {name}!")

if __name__ == "__main__":
    typer.run(greet)
\`\`\`

对比:

- Typer 完全省掉了装饰器,参数类型直接来自注解
- \`name: str = "World"\` 同时表达了:类型 str、默认值 World、可选(因为有默认值)
- docstring 自动变帮助

当参数变多、有子命令时,Typer 的简洁优势会更明显。

## 二、核心思想:类型注解即 CLI

Typer 的精髓在于:**它读取函数签名,自动生成 CLI 参数**。规则是:

| 函数参数形态 | 对应 CLI | 说明 |
|--------------|----------|------|
| \`x: str\`(无默认) | 必填位置参数 | 必填 |
| \`x: str = "abc"\` | 可选选项 \`--x\` | 有默认值,可选 |
| \`x: int = 0\` | 选项 \`--x\`,类型 int | 类型自动转 |
| \`x: bool = False\` | 开关 \`--x/--no-x\` | bool 自动变 flag |
| \`x: Optional[str] = None\` | 选项 \`--x\`,默认 None | 可选 |
| \`x: List[str] = []\` | 选项 \`--x\`,可多次 | 收集列表 |
| \`x: Enum\` | 选项,限定取值 | 自动从 Enum 取 choices |

\`\`\`python
from typing import Optional
def process(
    name: str,                        # 无默认值 → 必填位置参数(Argument)
    count: int = 1,                   # int 注解 → --count INTEGER,有默认值 → 可选
    verbose: bool = False,            # bool 注解 → 自动变成 --verbose/--no-verbose 开关
    output: Optional[Path] = None,    # Optional → 可选,默认 None;Path → 路径类型
    tags: List[str] = [],             # List → 可多次指定 --tags a --tags b,收集成列表
):
    """处理数据"""  # docstring 自动变成 --help 的描述
    ...
\`\`\`

\`\`\`bash
$ python demo.py --help
Usage: demo.py [OPTIONS] NAME

  处理数据

Arguments:
  NAME  [required]

Options:
  --count INTEGER           [default: 1]
  --verbose / --no-verbose  [default: no-verbose]
  --output PATH
  --tags TEXT
  --help                    Show this message and exit.
\`\`\`

一行函数签名,生成完整的帮助和校验。这就是 Typer 的魅力。

## 三、基本用法

### 3.1 typer.run():一行启动

最简模式,适合"单命令"工具:

\`\`\`python
import typer

def main(name: str = "World"):
    typer.echo(f"Hello, {name}")

if __name__ == "__main__":
    typer.run(main)
\`\`\`

\`typer.run\` 内部会创建 app、注册命令、运行。

### 3.2 类型注解决定参数类型

\`\`\`python
def main(
    count: int = 1,           # --count INTEGER
    rate: float = 0.5,        # --rate FLOAT
    name: str = "World",      # --name TEXT
    debug: bool = False,      # --debug / --no-debug
):
    ...
\`\`\`

### 3.3 默认值决定是否必填

- **有默认值** → 可选
- **无默认值** → 必填(且变成位置参数)

\`\`\`python
def main(name: str):          # 必填,位置参数
def main(name: str = "x"):    # 可选,选项 --name
\`\`\`

### 3.4 文档字符串自动变帮助

\`\`\`python
def main(name: str = "World"):
    """问候工具

    向指定的人打招呼,可以指定次数。
    适合演示和教学使用。
    """
    typer.echo(f"Hello, {name}")
\`\`\`

第一行是简短描述,后续是详细说明,都会出现在 \`--help\` 里。

## 四、Typer 的优势

### 4.1 极简,类型注解即文档

对比同样的功能:

\`\`\`text
argparse: 5 行(add_argument × N + parse_args)
Click:    3 行(@click.command + @click.option × N)
Typer:    1 行(函数签名)
\`\`\`

代码量减少最显著的场景:参数多、类型简单的 CRUD 工具。

### 4.2 与 FastAPI 同源,体验一致

如果你写过 FastAPI,会发现 Typer 的 API 几乎一模一样:

\`\`\`python
# FastAPI
@app.get("/items/{id}")
def get_item(id: int, q: Optional[str] = None):
    return {"id": id, "q": q}

# Typer
@app.command()
def get_item(id: int, q: Optional[str] = None):
    typer.echo({"id": id, "q": q})
\`\`\`

学一个,会两个。这是 Typer 的"网络效应"。

### 4.3 自动生成 help、shell completion

\`\`\`bash
# 安装 typer 后,可以这样生成补全脚本
eval "$(_MYTOOL_COMPLETE=bash_source mytool)"

# 也可以用 typer 命令
typer mytool.py utils completion --shell bash
\`\`\`

支持 bash/zsh/fish/powershell。

### 4.4 支持 Optional / List / Enum / Path / Annotated

\`\`\`python
from enum import Enum
from pathlib import Path
from typing import Optional, List
# Python 3.9+ 可以用 list[str] 代替 List[str]

class Mode(str, Enum):
    dev = "dev"
    prod = "prod"

def main(
    name: Optional[str] = None,
    files: List[Path] = [],
    mode: Mode = Mode.dev,
):
    ...
\`\`\`

Enum 自动变成 \`--mode\` + 限定取值,\`List[Path]\` 自动变成可多次的 \`--files\`。

## 五、子命令:typer.Typer() + @app.command()

\`\`\`python
import typer

app = typer.Typer(help="任务管理工具")

@app.command()
def add(title: str, priority: str = "mid"):
    """添加任务"""
    typer.echo(f"添加: [{priority}] {title}")

@app.command()
def list(done: bool = False):
    """列出任务"""
    typer.echo(f"列出(done={done})")

@app.command()
def stats():
    """统计"""
    typer.echo("统计")

if __name__ == "__main__":
    app()
\`\`\`

\`\`\`bash
$ python tasks.py --help

 Usage: tasks.py [OPTIONS] COMMAND [ARGS]...

 任务管理工具

╭─ Commands ─────────────────────────────╮
│ add     添加任务                        │
│ list    列出任务                        │
│ stats   统计                            │
╰────────────────────────────────────────╯

$ python tasks.py add "学 Typer" --priority high
添加: [high] 学 Typer
\`\`\`

注意帮助是用 Rich 渲染的,有边框、有颜色,比 Click/argparse 漂亮得多。

### 5.1 嵌套子命令

\`\`\`python
app = typer.Typer()
db_app = typer.Typer()
app.add_typer(db_app, name="db")

@db_app.command()
def migrate(revision: str = "head"):
    typer.echo(f"migrate to {revision}")

@db_app.command()
def rollback(steps: int = 1):
    typer.echo(f"rollback {steps}")

# 用法:mytool db migrate / mytool db rollback
\`\`\`

\`app.add_typer(db_app, name="db")\` 把子 app 挂到主 app 上。

## 六、高级特性

### 6.1 typer.Option 与 typer.Argument:精细控制

光靠类型注解不够时,用 \`typer.Option\` 和 \`typer.Argument\` 精细控制:

\`\`\`python
import typer

def main(
    name: str = typer.Option(..., "--name", "-n", help="你的名字"),
    age: int = typer.Option(18, min=0, max=150, help="年龄"),
    config: typer.FileText = typer.Option(None, "--config", help="配置文件"),
    verbose: bool = typer.Option(False, "--verbose/--quiet", "-v/-q"),
    output: str = typer.Argument(None, envvar="OUTPUT"),
):
    """精细控制示例"""
    typer.echo(f"name={name}, age={age}")
\`\`\`

- \`...\`(Ellipsis)表示必填
- \`min=\`/\`max=\` 自动数值校验
- \`envvar=\` 从环境变量读
- \`--verbose/--quiet\` 一行定义两个互斥 flag

### 6.2 Annotated 类型注解(Python 3.9+)

Python 3.9 引入 \`typing.Annotated\`,可以把"元数据"挂在类型上。Typer 利用这个,让代码更清晰:

\`\`\`python
from typing import Annotated
import typer

def main(
    # Annotated[类型, 元数据]:类型还是 str,元数据 typer.Option(...) 告诉 Typer 这是 CLI 选项
    name: Annotated[str, typer.Option(help="你的名字")] = "World",
    # min/max 自动做数值校验,超出范围 Typer 直接报错
    age: Annotated[int, typer.Option(min=0, max=150, help="年龄")] = 18,
    # bool + "--verbose/--quiet" 一行定义正反两个开关
    verbose: Annotated[bool, typer.Option("--verbose/--quiet")] = False,
):
    typer.echo(f"{name}, {age}, verbose={verbose}")
\`\`\`

\`Annotated[类型, 元数据]\` 把"类型"和"CLI 元数据"绑在一起,既保留类型语义,又能配置 CLI 行为。这是 Typer 官方推荐的现代写法。

对比三种写法:

\`\`\`python
# 写法 1:纯类型注解(简洁,但无法精细控制)
def main(name: str = "World"): ...

# 写法 2:typer.Option 作为默认值(老写法,会"污染"默认值位置)
def main(name: str = typer.Option("World", "--name", help="名字")): ...

# 写法 3:Annotated(推荐,类型和元数据分离)
def main(name: Annotated[str, typer.Option("--name", help="名字")] = "World"): ...
\`\`\`

### 6.3 回调与上下文

\`\`\`python
@app.callback()
def main_callback(
    debug: bool = typer.Option(False, "--debug", help="调试模式"),
    config: Path = typer.Option(None, "--config", help="配置文件"),
):
    """全局选项"""
    # 这个函数会在每个子命令前执行
    if debug:
        typer.echo("调试模式已开启", err=True)
\`\`\`

回调函数适合处理"全局选项"(对所有子命令生效的选项)。

### 6.4 Rich 输出

Typer 默认用 Rich 渲染帮助、错误信息。还可以手动用 Rich 打印漂亮的输出:

\`\`\`python
import typer
from rich.table import Table
from rich.console import Console

console = Console()

@app.command()
def list():
    """以表格形式列出任务"""
    table = Table(title="任务列表")
    table.add_column("ID", style="cyan")
    table.add_column("标题", style="white")
    table.add_column("优先级", style="red")
    table.add_row("1", "学 Typer", "high")
    table.add_row("2", "写 demo", "mid")
    console.print(table)
\`\`\`

\`\`\`text
                  任务列表
┌────┬──────────┬────────┐
│ ID │ 标题     │ 优先级 │
├────┼──────────┼────────┤
│ 1  │ 学 Typer │  high  │
│ 2  │ 写 demo  │  mid   │
└────┴──────────┴────────┘
\`\`\`

## 七、本章代码 demo

### 7.1 用 Typer 重写 fileproc.py

\`\`\`python
# fileproc_typer.py
from pathlib import Path
from typing import Annotated, Optional
import typer

def fileproc(
    input: Annotated[Path, typer.Argument(
        exists=True, dir_okay=False, help="输入文件"
    )],
    output: Annotated[Optional[Path], typer.Option(
        "--output", "-o", help="输出文件(默认 <input>.out)"
    )] = None,
    verbose: Annotated[bool, typer.Option("--verbose/--quiet", "-v/-q",
        help="详细输出")] = False,
    force: Annotated[bool, typer.Option("--force", "-f",
        help="强制覆盖")] = False,
    encoding: Annotated[str, typer.Option(help="文件编码")] = "utf-8",
    mode: Annotated[Optional[str], typer.Option(
        "--mode", help="转换模式")] = None,
    max_size: Annotated[int, typer.Option("--max-size", min=0,
        help="最大字节数(0=不限)")] = 0,
):
    """文件处理工具:读取输入,转换后写入输出"""
    out_path = output if output else input.with_suffix(".out")
    if out_path.exists() and not force:
        typer.echo(f"错误: 输出文件已存在: {out_path}(用 --force)", err=True)
        raise typer.Exit(1)

    if mode and mode not in ("upper", "lower"):
        typer.echo("错误: mode 必须是 upper 或 lower", err=True)
        raise typer.Exit(2)

    if verbose:
        typer.echo(f"[INFO] 读取 {input}", err=True)
    text = input.read_text(encoding=encoding)

    if max_size > 0 and len(text.encode(encoding)) > max_size:
        typer.echo(f"错误: 文件超过 {max_size} 字节", err=True)
        raise typer.Exit(1)

    if mode == "upper":
        text = text.upper()
    elif mode == "lower":
        text = text.lower()

    if verbose:
        typer.echo(f"[INFO] 写入 {out_path}", err=True)
    out_path.write_text(text, encoding=encoding)
    typer.echo(f"完成,共 {len(text)} 字符", err=True)

if __name__ == "__main__":
    typer.run(fileproc)
\`\`\`

注意:

- \`exists=True, dir_okay=False\`:自动校验路径存在且是文件
- \`--verbose/--quiet\`:一行定义互斥开关
- \`min=0\`:数值校验
- \`raise typer.Exit(1)\`:Typer 风格的退出

### 7.2 多子命令 CLI(任务管理)

\`\`\`python
# tasks_typer.py
import typer
from typing import Annotated, Optional
from enum import Enum
from pathlib import Path
import json
from rich.table import Table
from rich.console import Console

app = typer.Typer(help="任务管理工具")
console = Console()

TODO_FILE = Path.home() / ".tasks.json"

class Priority(str, Enum):
    low = "low"
    mid = "mid"
    high = "high"

def load_tasks():
    if TODO_FILE.exists():
        return json.loads(TODO_FILE.read_text())
    return []

def save_tasks(tasks):
    TODO_FILE.write_text(json.dumps(tasks, ensure_ascii=False, indent=2))

@app.command()
def add(
    title: Annotated[str, typer.Argument(help="任务标题")],
    priority: Annotated[Priority, typer.Option(help="优先级")] = Priority.mid,
):
    """添加任务"""
    task = {"title": title, "priority": priority.value, "done": False}
    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    typer.secho(f"已添加: [{priority.value}] {title}", fg=typer.colors.GREEN)

@app.command(name="list")
def list_tasks(
    all: Annotated[bool, typer.Option("--all", help="显示已完成")] = False,
):
    """列出任务"""
    tasks = load_tasks()
    if not all:
        tasks = [t for t in tasks if not t["done"]]
    if not tasks:
        typer.echo("(空)")
        return

    table = Table(title="任务列表")
    table.add_column("ID", style="cyan")
    table.add_column("状态")
    table.add_column("优先级")
    table.add_column("标题", style="white")
    for i, t in enumerate(tasks, 1):
        mark = "✓" if t["done"] else " "
        color = {"high":"red","mid":"yellow","low":"green"}[t["priority"]]
        table.add_row(str(i), mark, f"[{color}]{t['priority']}[/{color}]", t["title"])
    console.print(table)

@app.command()
def done(
    task_id: Annotated[int, typer.Argument(help="任务 ID")],
):
    """标记任务完成"""
    tasks = load_tasks()
    if task_id < 1 or task_id > len(tasks):
        typer.echo(f"错误: 无效的任务 ID: {task_id}", err=True)
        raise typer.Exit(1)
    tasks[task_id - 1]["done"] = True
    save_tasks(tasks)
    typer.secho(f"已完成: {tasks[task_id-1]['title']}", fg=typer.colors.GREEN)

@app.command()
def delete(
    task_id: Annotated[int, typer.Argument(help="任务 ID")],
    yes: Annotated[bool, typer.Option("--yes", "-y", help="跳过确认")] = False,
):
    """删除任务"""
    tasks = load_tasks()
    if task_id < 1 or task_id > len(tasks):
        typer.echo(f"错误: 无效的任务 ID: {task_id}", err=True)
        raise typer.Exit(1)
    if not yes:
        ok = typer.confirm(f"确定删除 '{tasks[task_id-1]['title']}'?")
        if not ok:
            typer.echo("已取消")
            raise typer.Exit()
    removed = tasks.pop(task_id - 1)
    save_tasks(tasks)
    typer.secho(f"已删除: {removed['title']}", fg=typer.colors.YELLOW)

@app.command()
def stats():
    """统计"""
    tasks = load_tasks()
    total = len(tasks)
    done = sum(1 for t in tasks if t["done"])
    typer.echo(f"总计: {total},完成: {done},待办: {total - done}")
    if total:
        typer.echo(f"完成率: {done/total:.1%}")

if __name__ == "__main__":
    app()
\`\`\`

运行:

\`\`\`bash
$ python tasks_typer.py add "学 Typer" --priority high
已添加: [high] 学 Typer

$ python tasks_typer.py add "写 demo"
已添加: [mid] 写 demo

$ python tasks_typer.py list
                  任务列表
┌────┬──────┬────────┬──────────┐
│ ID │ 状态 │ 优先级 │   标题   │
├────┼──────┼────────┼──────────┤
│ 1  │  [ ] │  high  │ 学 Typer │
│ 2  │  [ ] │  mid   │ 写 demo  │
└────┴──────┴────────┴──────────┘

$ python tasks_typer.py done 1
已完成: 学 Typer

$ python tasks_typer.py stats
总计: 2,完成: 1,待办: 1
完成率: 50.0%

$ python tasks_typer.py delete 2
确定删除 '写 demo'? [y/N]: y
已删除: 写 demo
\`\`\`

注意 Rich 表格让输出"赏心悦目",这是 Typer 相对 Click/argparse 的显著体验提升。

## 八、Typer 与 Click 的关系

很多人误以为 Typer 是 Click 的"替代品",其实 **Typer 底层就是 Click**。

\`\`\`text
┌──────────────────────────────────────────┐
│              你的 Typer 代码              │
├──────────────────────────────────────────┤
│                Typer 层                   │
│   (把类型注解翻译成 Click 的 option)     │
├──────────────────────────────────────────┤
│                Click 层                   │
│   (实际解析参数、生成帮助)               │
├──────────────────────────────────────────┤
│             Python 解释器                 │
└──────────────────────────────────────────┘
\`\`\`

### 8.1 关系对比表

| 维度 | Click | Typer |
|------|-------|-------|
| 关系 | 基础 | 上层封装 |
| 依赖 | 独立 | 依赖 Click |
| 代码风格 | 装饰器 | 类型注解 |
| 类型注解 | 不支持 | 原生 |
| 子命令 | \`@click.group\` | \`@app.command\` |
| 嵌套 | group 嵌套 | \`add_typer\` |
| 输出 | 朴素 | Rich 美化 |
| 补全 | 手动 | 内置生成 |
| 帮助 | 朴素 | Rich 美化 |
| 性能 | 略快 | 略慢(多一层) |
| 学习曲线 | 平缓 | 极平缓 |
| 生态 | 成熟 | 成长中 |
| 兼容 | - | 可调用 Click 类型 |

### 8.2 何时用 Click,何时用 Typer

| 场景 | 推荐 | 原因 |
|------|------|------|
| 简单脚本,几个参数 | Typer | 类型注解最简洁 |
| 复杂多子命令 | 都行 | Typer 略简洁,Click 更显式 |
| 老项目已用 Click | 继续 Click | 没必要重写 |
| 想用类型注解 | Typer | Click 不支持 |
| 需要极致控制 | Click | Typer 的封装偶尔限制你 |
| FastAPI 团队 | Typer | 体验一致 |
| 需要美化输出 | Typer + Rich | Click 要自己集成 |

### 8.3 混用:Typer 里调用 Click 类型

因为 Typer 底层是 Click,你可以直接用 Click 的类型:

\`\`\`python
import typer
import click

def main(
    config: click.File = typer.Option(None, help="配置文件"),
):
    if config:
        typer.echo(config.read())
\`\`\`

这种混用一般不推荐(可读性差),但说明 Typer 和 Click 兼容性极好。

## 九、易错点小结

| 易错点 | 错误写法 | 正确写法 | 后果 |
|--------|----------|----------|------|
| 忘记 \`app()\` 启动 | 装饰器后没 \`app()\` | 加 \`if __name__ == "__main__": app()\` | 命令不执行 |
| Optional 写错 | \`name: str = None\` | \`name: Optional[str] = None\` | 类型检查器警告 |
| bool 不当 flag | \`verbose: bool = False\` 期望有默认值的选项 | bool 自动是 \`--verbose/--no-verbose\` | 行为符合预期,但要理解 |
| List 写错 | \`files: list = []\` | \`files: List[str] = []\` | 内层类型丢失 |
| Enum 不继承 str | \`class M(Enum): ...\` | \`class M(str, Enum): ...\` | 显示原始值而非字符串 |
| Annotated 默认值漏写 | \`x: Annotated[int, typer.Option()]\` | 加 \`= 默认值\` | 必填参数 |
| typer.Argument 当 Option | 位置参数用 typer.Option | 位置参数用 typer.Argument | 位置错乱 |
| Exit 不抛 | \`sys.exit(1)\` | \`raise typer.Exit(1)\` | 错过清理 |
| typer.run 用于多命令 | \`typer.run(main)\` 多个 | 用 \`app = typer.Typer()\` | 只会跑第一个 |
| 子命令函数名冲突 | 两个函数都叫 \`list\` | 用 \`@app.command(name="list")\` | 后者覆盖 |
| rich 未装用 rich 功能 | \`from rich.table import Table\` | \`pip install "typer[all]"\` | ImportError |

## 十、本章小结

1. **类型注解即 CLI**:\`name: str = "World"\` 一行定义参数类型、默认值、是否必填。
2. **typer.run**:单命令最简模式,一行启动。
3. **app + @app.command**:多子命令,\`add_typer\` 实现嵌套。
4. **Annotated**:Python 3.9+ 推荐写法,类型和元数据分离。
5. **Rich 美化**:帮助、表格、彩色输出开箱即用。
6. **底层 Click**:兼容 Click 生态,可混用。

下一章对比三大框架,给出选型建议。
`,
  },

  // =========================================================
  // 第六章:三大 CLI 框架对比与选型
  // =========================================================
  {
    id: "pyeng-cli-compare",
    icon: "⚖️",
    title: "三大 CLI 框架对比与选型",
    group: "命令行工具",
    content: `# 三大 CLI 框架对比与选型

## 一、横向对比:argparse / Click / Typer

前面五章分别讲了 sys.argv、argparse、Click、Typer。这一章把它们放在一起,从 10 个维度横向对比,帮你建立"选型直觉"。

### 1.1 全维度对比表

| 维度 | argparse | Click | Typer |
|------|----------|-------|-------|
| **来源** | 标准库 | 第三方 | 第三方 |
| **安装** | 无需 | \`pip install click\` | \`pip install typer\` |
| **依赖** | 0 | 1 个 | Click + Rich |
| **代码量** | 中(每参数 1-2 行) | 少(装饰器) | 最少(类型注解) |
| **类型注解** | 不支持 | 不支持 | 原生支持 |
| **子命令** | \`add_subparsers\` | \`@click.group\` | \`@app.command\` |
| **嵌套子命令** | 麻烦(2层以上崩) | 方便(group 嵌套) | 方便(\`add_typer\`) |
| **互斥参数** | 内置 | 手动或 flag_value | 手动或 flag |
| **参数组** | 内置 | 手动 | 手动 |
| **自定义类型** | type=函数 | ParamType 子类 | type=函数 |
| **文件类型** | FileType | click.File | typer.FileText |
| **路径校验** | 自定义 type | click.Path(exists=True) | typer.Option(exists=True) |
| **错误处理** | sys.exit + try | ClickException | typer.Exit |
| **帮助生成** | 自动(朴素) | 自动(朴素) | 自动(Rich 美化) |
| **帮助美观** | ★★ | ★★★ | ★★★★★ |
| **shell 补全** | 需手动 | 需手动 | 内置生成 |
| **彩色输出** | 无 | click.style/secho | typer.secho + Rich |
| **进度条** | 无 | click.progressbar | 用 Rich |
| **交互输入** | 自己 input | click.prompt/confirm | typer.prompt/confirm |
| **环境变量** | 自己读 os.environ | envvar= | envvar= |
| **上下文传递** | 自己想办法 | ctx.obj | ctx.obj(同 Click) |
| **从文件读参** | fromfile_prefix_chars | 自己写 | 自己写 |
| **学习曲线** | 平缓 | 平缓 | 极平缓 |
| **生态** | 标准库 | 成熟(Black/Flask 用) | 成长中(FastAPI 系) |
| **性能** | 快 | 略慢 | 略慢(多一层) |
| **Python 版本** | 2.7+/3.x | 3.7+ | 3.7+ |

### 1.2 一图看清

\`\`\`text
                    ┌─────────────────────────────────────┐
                    │       你的需求是什么?                │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        不想引依赖            简单脚本/中等工具       现代项目/类型注解
              │                    │                    │
              ▼                    ▼                    ▼
          argparse              Click / Typer          Typer
                                  │
                          ┌───────┴───────┐
                          ▼               ▼
                      老项目/习惯      新项目/FastAPI
                      Click            Typer
\`\`\`

## 二、选型决策:5 种典型场景

### 2.1 场景 1:标准库依赖 → argparse

如果你的代码要分发给"环境受限"的用户(比如内网、运维不允许装包),\`argparse\` 是唯一选择。它是标准库,任何 Python 环境都有。

典型例子:

- 运维脚本(只允许用标准库)
- 教学示例(不想让学生先装一堆包)
- 给客户的"绿色版"工具(零依赖)

\`\`\`python
# 这种场景,即使代码啰嗦也认了
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--config", required=True)
parser.add_argument("--dry-run", action="store_true")
args = parser.parse_args()
\`\`\`

### 2.2 场景 2:简单脚本 → argparse 或 typer.run

"简单脚本"指参数少于 5 个、无子命令、一次性使用。

- 如果不能装包 → argparse
- 如果可以装包 → typer.run(一行启动,最简)

\`\`\`python
# typer.run 简单到几乎"无样板"
import typer

def main(input: str, output: str = "out.txt", verbose: bool = False):
    """处理文件"""
    typer.echo(f"{input} → {output} (verbose={verbose})")

if __name__ == "__main__":
    typer.run(main)
\`\`\`

### 2.3 场景 3:复杂多子命令 → Click 或 Typer

"复杂"指有 3 个以上子命令、嵌套子命令、需要上下文传递。

- 老项目、团队习惯装饰器 → Click
- 新项目、想用类型注解 → Typer

\`\`\`python
# Typer 实现嵌套子命令非常自然
import typer

app = typer.Typer()
db_app = typer.Typer()
app.add_typer(db_app, name="db", help="数据库操作")

migrate_app = typer.Typer()
db_app.add_typer(migrate_app, name="migrate", help="迁移")

@migrate_app.command()
def up():
    "迁移到最新版本"
    typer.echo("migrate up")

@migrate_app.command()
def down():
    "回滚一个版本"
    typer.echo("migrate down")

# 用法:myapp db migrate up
\`\`\`

### 2.4 场景 4:现代项目 + 类型注解 → Typer

如果你的项目已经在用类型注解(PEP 484)、mypy/pyright 做静态检查,那 Typer 是天然契合的:

- 函数签名就是 CLI 定义,IDE 能跳转、能补全
- 类型检查器能提前发现参数误用
- 与 FastAPI/Pydantic 同源,体验一致

\`\`\`python
# 现代 Typer 写法:Annotated + 类型注解
from typing import Annotated
import typer

def main(
    name: Annotated[str, typer.Option(help="名字")] = "World",
    count: Annotated[int, typer.Option(min=1, max=100, help="次数")] = 1,
):
    """问候"""
    for _ in range(count):
        typer.echo(f"Hello, {name}")
\`\`\`

### 2.5 场景 5:需要美观输出 → Typer + Rich

如果你的 CLI 是面向"人"的(用户会盯着终端看输出),那 Typer + Rich 的组合能极大提升体验:

- 帮助文档彩色 + 边框
- 表格、进度条、状态图标
- 错误信息高亮

\`\`\`python
from rich.table import Table
from rich.console import Console
import typer

console = Console()

@app.command()
def list():
    """列出任务(彩色表格)"""
    table = Table(title="任务")
    table.add_column("ID", style="cyan")
    table.add_column("标题", style="white")
    table.add_row("1", "学 Typer")
    console.print(table)
\`\`\`

## 三、共同的 CLI 设计原则

无论用哪个框架,好的 CLI 都遵循一些通用原则。这些原则比框架选择更重要。

### 3.1 一致的命名

\`\`\`text
✅ 推荐(统一长选项风格)
  --verbose / --quiet
  --output / --input
  --dry-run / --no-cache

❌ 避免(混用风格)
  --verbose / -q (一个长一个短,不一致)
  --out / --input (一个缩写一个全称)
  --dryRun / --no-cache (一个驼峰一个连字符)
\`\`\`

### 3.2 合理的默认值

默认值要"安全 + 符合直觉":

- 危险操作默认关闭(\`--force\` 默认 False)
- 输出默认 stdout(可被管道接走)
- 编码默认 utf-8(而不是依赖系统 locale)
- 端口默认 8000(开发常用),不是 80(需要 root)

### 3.3 清晰的 help

每个参数都要写 help,描述"做什么"而不是"是什么":

\`\`\`text
✅ 推荐
  --port  服务监听端口(默认 8000,生产建议 80)

❌ 避免
  --port  端口号 (废话,看名字就知道了)
\`\`\`

### 3.4 退出码

| 退出码 | 含义 |
|--------|------|
| 0 | 成功 |
| 1 | 一般失败(业务错误) |
| 2 | 用法错误(参数错) |

\`\`\`python
# Typer
raise typer.Exit(0)   # 成功
raise typer.Exit(1)   # 业务失败
raise typer.Exit(2)   # 参数错误

# Click
raise click.ClickException("业务失败")  # 自动退出码 1
sys.exit(2)  # 参数错误

# argparse
# 参数错误自动返回 2,业务失败自己 sys.exit(1)
\`\`\`

### 3.5 标准输入输出

- 数据 → stdout
- 日志/错误 → stderr
- 支持 \`-\` 表示 stdin/stdout

\`\`\`python
# 通用模式
content = sys.stdin.read() if path == "-" else Path(path).read_text()
\`\`\`

### 3.6 版本与帮助

任何 CLI 都应该支持 \`--version\` 和 \`--help\`:

\`\`\`bash
$ mytool --version
mytool 1.2.3

$ mytool --help
Usage: mytool ...
\`\`\`

三个框架都自动处理 \`--help\`,\`--version\` 需要手动加(但都很简单)。

## 四、综合实战:同一个 CLI 用三种框架实现

需求:一个"任务管理"CLI,子命令 \`add\`/\`list\`/\`done\`,数据存 JSON。

### 4.1 argparse 版

\`\`\`python
# tasks_argparse.py
import argparse
import json
import sys
from pathlib import Path

TODO = Path.home() / ".tasks.json"

def load():
    return json.loads(TODO.read_text()) if TODO.exists() else []

def save(tasks):
    TODO.write_text(json.dumps(tasks, ensure_ascii=False, indent=2))

def cmd_add(args):
    tasks = load()
    tasks.append({"title": args.title, "priority": args.priority, "done": False})
    save(tasks)
    print(f"已添加: [{args.priority}] {args.title}")

def cmd_list(args):
    tasks = load()
    if not args.all:
        tasks = [t for t in tasks if not t["done"]]
    for i, t in enumerate(tasks, 1):
        mark = "✓" if t["done"] else " "
        print(f"{i}. [{mark}] [{t['priority']}] {t['title']}")

def cmd_done(args):
    tasks = load()
    if args.id < 1 or args.id > len(tasks):
        print("错误: 无效 ID", file=sys.stderr); sys.exit(1)
    tasks[args.id - 1]["done"] = True
    save(tasks)
    print(f"已完成: {tasks[args.id-1]['title']}")

parser = argparse.ArgumentParser(prog="tasks")
sub = parser.add_subparsers(dest="cmd", required=True)

p_add = sub.add_parser("add")
p_add.add_argument("title")
p_add.add_argument("--priority", choices=["low","mid","high"], default="mid")
p_add.set_defaults(func=cmd_add)

p_list = sub.add_parser("list")
p_list.add_argument("--all", action="store_true")
p_list.set_defaults(func=cmd_list)

p_done = sub.add_parser("done")
p_done.add_argument("id", type=int)
p_done.set_defaults(func=cmd_done)

args = parser.parse_args()
args.func(args)
\`\`\`

### 4.2 Click 版

\`\`\`python
# tasks_click.py
import click, json
from pathlib import Path

TODO = Path.home() / ".tasks.json"
def load(): return json.loads(TODO.read_text()) if TODO.exists() else []
def save(t): TODO.write_text(json.dumps(t, ensure_ascii=False, indent=2))

@click.group()
def cli(): pass

@cli.command()
@click.argument("title")
@click.option("--priority", type=click.Choice(["low","mid","high"]), default="mid")
def add(title, priority):
    tasks = load()
    tasks.append({"title": title, "priority": priority, "done": False})
    save(tasks)
    click.echo(f"已添加: [{priority}] {title}")

@cli.command()
@click.option("--all", is_flag=True)
def list(all):
    tasks = load()
    if not all: tasks = [t for t in tasks if not t["done"]]
    for i, t in enumerate(tasks, 1):
        mark = "✓" if t["done"] else " "
        click.echo(f"{i}. [{mark}] [{t['priority']}] {t['title']}")

@cli.command()
@click.argument("id", type=int)
def done(id):
    tasks = load()
    if id < 1 or id > len(tasks):
        raise click.ClickException("无效 ID")
    tasks[id - 1]["done"] = True
    save(tasks)
    click.echo(f"已完成: {tasks[id-1]['title']}")

if __name__ == "__main__":
    cli()
\`\`\`

### 4.3 Typer 版

\`\`\`python
# tasks_typer.py
import typer, json
from typing import Annotated
from enum import Enum
from pathlib import Path

app = typer.Typer()
TODO = Path.home() / ".tasks.json"
def load(): return json.loads(TODO.read_text()) if TODO.exists() else []
def save(t): TODO.write_text(json.dumps(t, ensure_ascii=False, indent=2))

class Priority(str, Enum):
    low = "low"; mid = "mid"; high = "high"

@app.command()
def add(
    title: Annotated[str, typer.Argument()],
    priority: Annotated[Priority, typer.Option()] = Priority.mid,
):
    tasks = load()
    tasks.append({"title": title, "priority": priority.value, "done": False})
    save(tasks)
    typer.echo(f"已添加: [{priority.value}] {title}")

@app.command(name="list")
def list_tasks(
    all: Annotated[bool, typer.Option("--all")] = False,
):
    tasks = load()
    if not all: tasks = [t for t in tasks if not t["done"]]
    for i, t in enumerate(tasks, 1):
        mark = "✓" if t["done"] else " "
        typer.echo(f"{i}. [{mark}] [{t['priority']}] {t['title']}")

@app.command()
def done(
    id: Annotated[int, typer.Argument()],
):
    tasks = load()
    if id < 1 or id > len(tasks):
        typer.echo("错误: 无效 ID", err=True); raise typer.Exit(1)
    tasks[id - 1]["done"] = True
    save(tasks)
    typer.echo(f"已完成: {tasks[id-1]['title']}")

if __name__ == "__main__":
    app()
\`\`\`

### 4.4 代码量与可读性对比

\`\`\`text
框架        代码行数    可读性评分    类型安全
argparse    ~50 行      ★★★          无
Click       ~40 行      ★★★★         无
Typer       ~35 行      ★★★★★        有
\`\`\`

| 框架 | 代码行 | 优势 | 劣势 |
|------|--------|------|------|
| argparse | 50 | 标准库、无依赖 | 啰嗦、配置与逻辑分离 |
| Click | 40 | 装饰器紧凑、生态成熟 | 无类型注解、帮助朴素 |
| Typer | 35 | 类型注解、最简洁、Rich 美化 | 多一层依赖、性能略低 |

三个版本功能完全一样,但 Typer 版的"信号噪声比"最高——几乎每行都是业务逻辑,样板最少。

## 五、CLI 设计反模式 vs 正确做法

| 反模式 | 后果 | 正确做法 |
|--------|------|----------|
| 一个命令 30 个参数 | 用户记不住、help 一屏放不下 | 拆成子命令,每个职责单一 |
| 危险操作无确认 | 误操作删库 | 加 \`--force\` 或 \`typer.confirm\` |
| 错误打到 stdout | 污染管道数据流 | 错误走 stderr |
| 退出码全 0 | 调用方无法判断成败 | 失败返回非 0 |
| 无 \`--help\` | 用户不知道怎么用 | 任何框架都自动生成,别手写 |
| 无 \`--version\` | 用户不知道用的什么版本 | 加 \`action="version"\` 或 \`@option\` |
| 默认值不安全 | 比如 \`--force\` 默认 True | 危险操作默认 False |
| 不支持 \`-\` 表示 stdin | 不能用管道 | 检查 \`path == "-" → sys.stdin\` |
| 参数顺序硬绑定 | 用户必须按死顺序传 | 用 \`--name\` 任意顺序 |
| 帮助只写参数名 | \`--port  端口号\`(废话) | 写"做什么":\`监听端口\` |
| 长选项简写混用 | \`--out\` 和 \`--input\` 混 | 统一全称或统一缩写 |
| 子命令无 docstring | \`mytool add\` 不知道干啥 | 每个子命令写帮助 |
| 日志用 print | 无法关、无法分级 | 用 logging,或框架的 echo |

## 六、性能小对比

虽然 CLI 工具的启动速度通常不是瓶颈,但了解差异有助于选型:

\`\`\`text
框架        启动时间(空命令 --help)
argparse    ~30ms (纯标准库,无 import 开销)
Click       ~50ms (import click)
Typer       ~120ms (import typer + click + rich)
\`\`\`

对于"频繁调用的小工具"(比如 git hook、CI 步骤),Typer 的启动开销可能感知到。但对于"一次跑几秒"的工具,这点开销可以忽略。

如果你的 CLI 对启动时间极度敏感(比如 shell 补全脚本里调用的),考虑:

1. 用 argparse(最快)
2. 用 Click(中等)
3. 避免在模块顶层 import 重依赖(如 pandas、torch)

## 七、迁移指南:从 argparse 到 Click/Typer

如果你有个老项目用 argparse,想迁到 Click/Typer,建议:

### 7.1 渐进迁移,不要一次重写

\`\`\`text
1. 先用 Click/Typer 包一层"入口",内部调用老函数
2. 逐步把子命令从 argparse 迁到新框架
3. 最后移除老的 argparse 代码
\`\`\`

### 7.2 argparse → Click 映射

\`\`\`text
ArgumentParser()                  → @click.command() / @click.group()
add_argument("--x")               → @click.option("--x")
add_argument("x")                 → @click.argument("x")
action="store_true"               → is_flag=True
action="count"                    → count=True
action="append"                   → multiple=True
type=int                          → type=int
choices=["a","b"]                 → type=click.Choice(["a","b"])
add_mutually_exclusive_group()    → flag_value 或手动校验
add_subparsers()                  → @click.group() + @cli.command()
set_defaults(func=)               → 直接定义函数(不需要)
\`\`\`

### 7.3 argparse → Typer 映射

\`\`\`text
ArgumentParser()                  → app = typer.Typer()
add_argument("--x", type=int)     → x: int = typer.Option(default)
add_argument("x")                 → x: str = typer.Argument()
action="store_true"               → x: bool = False (自动 flag)
choices=["a","b"]                 → class M(str, Enum): a="a"; b="b"
add_subparsers()                  → @app.command()
\`\`\`

## 八、易错点小结

| 易错点 | 错误做法 | 正确做法 | 后果 |
|--------|----------|----------|------|
| 选型跟风 | 别人用啥我用啥 | 按场景选(见第二节) | 不合适的工具增加负担 |
| 过度工程 | 简单脚本也上 Typer+Rich | 简单脚本用 argparse | 引入不必要依赖 |
| 死守 argparse | 复杂 CLI 也硬写 argparse | 复杂 CLI 用 Click/Typer | 代码啰嗦难维护 |
| 忽视退出码 | 失败不抛 Exit | 用框架的退出机制 | 调用方无法判断 |
| 忘记 stderr | 日志打到 stdout | 日志走 stderr | 污染管道 |
| 无版本信息 | 没加 --version | 加 action="version" | 用户不知版本 |
| 参数过多 | 单命令 20+ 参数 | 拆子命令 | 难用难记 |
| 默认值危险 | --force 默认 True | 危险操作默认 False | 误操作 |
| 不写 help | 参数无 help | 每个参数写 help | --help 没用 |
| 不支持管道 | 只认文件路径 | 支持 \`-\` 表示 stdin | 不能串联 |
| 启动慢 | 顶层 import 重依赖 | 延迟 import | CLI 卡顿 |
| 命名不一致 | --out 和 --input 混 | 统一风格 | 用户困惑 |

## 九、本章小结

1. **三大框架各有定位**:argparse(标准库基石)、Click(装饰器改良)、Typer(类型注解进化)。
2. **选型看场景**:标准库依赖→argparse;简单脚本→argparse/typer.run;复杂子命令→Click/Typer;现代类型注解→Typer;美观输出→Typer+Rich。
3. **通用原则更重要**:命名一致、默认安全、退出码正确、stderr 分流、支持管道。这些比框架选择更影响 CLI 质量。
4. **同一个 CLI 三种实现**:argparse 50 行、Click 40 行、Typer 35 行,代码量递减,可读性递增。
5. **反模式要避免**:参数过多、无确认、无帮助、错误打 stdout、退出码全 0……这些都是 CLI 设计的"坏味道"。

## 十、整体总结:六章串起来

回顾整个"命令行工具"系列:

| 章 | 主题 | 核心收获 |
|----|------|----------|
| 1 | sys.argv | 手写解析的痛苦,理解为什么需要框架 |
| 2 | argparse 基础 | 三步走、参数属性、action 详解 |
| 3 | argparse 进阶 | 子命令、互斥、自定义类型/action |
| 4 | Click | 装饰器风格、子命令、辅助函数 |
| 5 | Typer | 类型注解即 CLI、Annotated、Rich |
| 6 | 对比与选型 | 选型决策、设计原则、反模式 |

学完这六章,你应该能:

- 给任何一个 Python 脚本加上专业的 CLI
- 根据场景选择合适的框架(argparse/Click/Typer)
- 写出符合 Unix 哲学、可组合、可自动化的 CLI 工具
- 避开常见的 CLI 设计反模式

记住:**工具会变,工程化思维长存**。今天流行 Typer,明天可能出更新的框架,但"一个工具做好一件事、通过管道组合、清晰的帮助、正确的退出码"这些原则,几十年都不会变。
`,
  },
];
