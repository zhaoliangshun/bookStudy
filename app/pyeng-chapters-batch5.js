// =============================================================
// Python 工程化实战教程 - 第 5 批章节(格式化与工程化)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章:代码格式化与为什么重要
  // ============================================================
  {
    id: "pyeng-format-intro",
    icon: "🎨",
    title: "代码格式化与为什么重要",
    group: "格式化与工程化",
    content: `# 代码格式化与为什么重要

## 一、格式之争:无意义的战斗

每个写过 Python 的团队,几乎都经历过这样的场景:在 code review 时,有人留下一句"这里等号两边应该加空格",另一个人回"我习惯不加",然后两个人开始翻 PEP 8,引经据典,最后争论了两个小时——而代码本身的逻辑一行都没改。

来看一段再普通不过的代码:

\`\`\`python
# 写法 A:紧凑派
def calc(x,y):
    return x*2+y*3

# 写法 B:宽松派
def calc(x, y):
    return x * 2 + y * 3

# 写法 C:极度宽松派
def calc( x , y ) :
    return x * 2 + y * 3
\`\`\`

这三种写法在 Python 解释器眼里完全等价,运行结果一模一样。但在人眼里,它们却是"哪种更好"这种宗教战争的导火索。常见的争论点有:

- **缩进**:2 空格还是 4 空格?(Python 强制 4 空格,这条没得吵)
- **等号两边**:加空格还是不加?\`x=1\` 还是 \`x = 1\`?
- **运算符两边**:\`x*2\` 还是 \`x * 2\`?
- **引号**:单引号还是双引号?\`'hello'\` 还是 \`"hello"\`?
- **行长度**:80 还是 100 还是 120?
- **尾随逗号**:\`[1, 2, 3,]\` 还是 \`[1, 2, 3]\`?
- **空行**:函数之间 1 个还是 2 个空行?
- **import 顺序**:标准库在前,还是按字母排序?

这些争论单独看都很琐碎,但加起来极其消耗精力。更重要的是:它们**和代码的正确性、性能、可维护性毫无关系**。

> 一句话:格式之争是工程团队最大的隐形时间黑洞之一。

## 二、PEP 8 简介:Python 的风格指南

PEP 8 是 Python 官方的代码风格指南(Guido van Rossum 等 2001 年发布),它给出了一系列建议,但很多地方**留有选择余地**。

### PEP 8 的核心建议

| 项目 | PEP 8 建议 | 是否强制 |
|---|---|---|
| 缩进 | 4 个空格,不用 Tab | 强制(解释器层面) |
| 行长度 | 79 字符(代码)/ 72(注释) | 建议 |
| 空行 | 顶层函数/类之间 2 行,方法之间 1 行 | 建议 |
| 引号 | 不指定单双 | 留给团队 |
| 等号两边 | 加空格 | 建议 |
| 运算符两边 | 加空格 | 建议 |
| 逗号后 | 加空格 | 建议 |
| import | 每行一个,标准库在前 | 建议 |
| 命名 | 函数小写下划线,类驼峰 | 建议 |

注意表格里的"建议"——这意味着 PEP 8 **并不强制**。比如行长度,PEP 8 说 79,但很多项目用 100 甚至 120;引号更是完全交给团队。

### PEP 8 的问题

PEP 8 解决了一部分问题,但留下了一个更大的问题:**当 PEP 8 给出多个选项时,团队还是要自己拍板,然后还是要争吵**。比如:

- PEP 8 没说用单引号还是双引号 → 团队还是要吵
- PEP 8 说行长 79,但很多现代项目觉得太短 → 团队还是要吵
- PEP 8 没规定尾随逗号 → 团队还是要吵

于是出现了"PEP 8 增强版"——各种 linter(flake8、pylint)和 formatter(autopep8、yapf、black)各自给出了更具体的规则。但只要规则可配置,争论就不会消失。

## 三、格式化的价值:把人从机械劳动中解放

格式化工具(formatter)的核心价值,不是"让代码更漂亮",而是**消除无谓的争论,把人的精力释放给真正重要的事情**。

### 价值 1:消除风格争论

一旦引入 black 这样的"不妥协"格式化器,风格问题就**不再是问题**——因为工具说了算,你没得选。

\`\`\`python
# 你写成这样
x=1+2

# black 一跑,变成这样
x = 1 + 2

# 你没得改,也没必要改
\`\`\`

code review 时再也不会出现"等号两边加空格"这种评论了,因为代码进仓库前就已经是统一格式。

### 价值 2:代码一致性

整个项目、整个团队、甚至整个公司的代码库,看起来像是**同一个人写的**。新员工入职第一天就能无障碍阅读任何文件,因为格式是统一的。

| 维度 | 无格式化 | 有格式化 |
|---|---|---|
| 跨文件风格 | 各文件不同 | 完全一致 |
| 跨开发者风格 | 每人一个风格 | 完全一致 |
| 新人上手 | 要先适应风格 | 直接看逻辑 |
| git blame | 混入大量格式修改 | 只剩逻辑修改 |

### 价值 3:可读性

虽然格式化不改变逻辑,但统一的格式确实**降低视觉负担**。眼睛不需要在不同风格之间切换,大脑可以把全部注意力放在逻辑上。

### 价值 4:减少代码审查中的格式噪音

没有格式化工具时,code review 的评论里常常夹杂大量格式问题:

\`\`\`bash
# 典型的"格式噪音"评论
- 这里多了一个空格
- 这个 import 应该放上面
- 这个函数太长了,换行方式不对
- 引号统一一下
\`\`\`

这些评论**挤占了真正有价值的审查内容**(逻辑错误、边界条件、安全隐患)的时间。引入格式化后,这些噪音全部消失,reviewer 可以专注逻辑。

### 价值 5:自动化(把人从机械劳动中解放)

格式化是一件**机械、重复、无需创造力**的事情。让人去做这件事,是对人力的浪费。工具一秒钟就能做完,而且永远不会累、不会漏、不会有情绪。

> 工程化的核心理念之一:**把人从机械劳动中解放,让工具去做工具该做的事**。

## 四、Linter vs Formatter:两种工具的本质区别

很多初学者会把 linter 和 formatter 混为一谈,但它们是两种**本质不同**的工具。

### Formatter(格式化器)

Formatter 会**直接修改你的代码**,把格式改成它认为"标准"的样子。你跑一次,文件就变了。

\`\`\`bash
# black 直接修改文件
black my_code.py
# 文件已经被改写,git diff 能看到变化
\`\`\`

Formatter 关注的是**外观**:缩进、空格、引号、换行。它不关心你的逻辑对不对,只关心代码"长得好不好看"。

### Linter(检查器)

Linter 会**检查代码,报告问题**,但不直接修改(除非你用 --fix)。它关心的是**潜在的 bug、坏味道、不规范**。

\`\`\`bash
# ruff 检查,只报告不修改
ruff check my_code.py
# 输出:
# my_code.py:10:1 F401 'os' imported but unused
# my_code.py:15:5 E711 Comparison to None should be 'if cond is None:'
\`\`\`

Linter 关注的是**质量**:未使用的变量、可能的 bug、可简化的写法、不符合规范的命名。

### 两者的对比

| 维度 | Formatter | Linter |
|---|---|---|
| 是否修改代码 | 直接修改 | 只报告(部分可 --fix) |
| 关注点 | 外观(格式) | 质量(逻辑/规范) |
| 例子 | black、isort、autopep8 | ruff、flake8、pylint |
| 能发现 bug | 不能 | 能(部分) |
| 典型问题 | 引号、空格、换行 | 未用变量、比较 None 用 == |
| 运行时机 | 保存时 / commit 时 | 保存时 / commit 时 / CI |
| 是否可配置 | 极少(black 几乎不可配) | 多(规则可选可关) |

### 一个关键认知

**Formatter 解决不了逻辑问题,Linter 解决不了格式问题**——它们是互补的,不是替代关系。一个健康的工程化项目,两者都要有:

\`\`\`bash
# 黑色:格式化(管外观)
black .
# 红色:检查(管质量)
ruff check .
\`\`\`

## 五、Python 工具生态演进:从老时代到新时代

Python 的格式化/检查工具生态,经历过一次明显的代际更替。

### 老时代(2010-2020):工具林立

老时代的典型组合是"pep8 + flake8 + pylint + autopep8 + isort",五个工具各管一摊:

| 工具 | 职责 | 问题 |
|---|---|---|
| pep8 | 检查 PEP 8 风格 | 后来改名 pycodestyle |
| flake8 | pep8 + pyflakes 的封装 | 配置繁琐,速度慢 |
| pylint | 深度静态检查 | 误报多,速度极慢 |
| autopep8 | 按 PEP 8 格式化 | 规则不彻底,配置多 |
| isort | 排序 import | 与 black 有冲突 |
| yapf | Google 出的格式化器 | 可配置太多,反而不统一 |

老时代的痛点:

1. **工具太多**:一个项目要装五六个工具,依赖管理麻烦。
2. **配置冲突**:isort 和 black 默认格式不一致,要手动调。
3. **速度慢**:flake8 + pylint 跑一个大项目要十几秒甚至更久。
4. **配置复杂**:每个工具都有自己的配置文件,选项多达几十个。

### 新时代(2020 至今):black + ruff 一统天下

新时代的标志是两个工具的崛起:

1. **black**(2018):不妥协的格式化器,几乎所有选项都不可配置,"没得选所以没争论"。
2. **ruff**(2022):用 Rust 写的极速 linter,一个工具取代 flake8 + isort + pyupgrade + pep8-naming 等十几个工具,速度快 10-100 倍。

新时代的组合简化为:

\`\`\`bash
# 黑色:格式化(black,管外观)
# 红色:检查(ruff,管质量 + import 排序)
\`\`\`

| 对比项 | 老时代 | 新时代 |
|---|---|---|
| 格式化 | autopep8 / yapf(可配) | black / ruff format(不可配) |
| 检查 | flake8 + pylint | ruff |
| import 排序 | isort | ruff(规则 I) |
| 工具数量 | 5-6 个 | 1-2 个 |
| 速度 | 慢(flake8 10s+) | 极快(ruff 0.1s) |
| 配置 | 繁琐 | 极简 |
| 心智负担 | 高 | 低 |

> 趋势:**工具在收敛,配置在减少,速度在变快**。如果你今天还在用 flake8 + autopep8 + isort 的组合,强烈建议迁移到 black + ruff(或直接用 ruff 全家桶)。

## 六、一个真实案例:团队因格式争论 2 小时

某创业团队 5 个人的 code review,PR 内容是一个用户注册接口。reviewer A 留了 8 条评论,其中 5 条是格式:

\`\`\`bash
# reviewer A 的评论
1. 第 12 行:import 应该按字母排序
2. 第 18 行:等号两边没加空格
3. 第 25 行:这个列表的尾随逗号漏了
4. 第 33 行:引号混用,有的单有的双
5. 第 40 行:函数之间应该空两行
6. 第 45 行:这里逻辑可能有问题(唯一的逻辑评论)
7. 第 50 行:变量名 user_info 应该用 user
8. 第 55 行:行太长了
\`\`\`

作者改了 7 条(逻辑那条没改,因为觉得没问题),提交。reviewer A 又来一轮,说第 3 条的尾随逗号位置不对……两个人来回 3 轮,花了 2 小时,**逻辑问题那条从头到尾都没认真讨论**。

后来团队引入 black + ruff + pre-commit,所有格式问题在 commit 前自动修复。再开会复盘时,大家发现:**90% 的 review 评论消失了,剩下的全是逻辑讨论,review 效率提升了 3 倍**。

## 七、本系列的学习路径

本批共 6 章,按"为什么 → 怎么用 → 怎么集成 → 综合实战"的顺序展开:

| 章 | 主题 | 重点 |
|---|---|---|
| 1 | 格式化与为什么重要 | 理念(本章) |
| 2 | Black | 不妥协的格式化器 |
| 3 | Ruff | 超快 linter + formatter |
| 4 | isort | import 排序(可与 ruff 替代) |
| 5 | 工具链集成 | pre-commit + pyproject + CI |
| 6 | 综合实战 + 全书总结 | 串起全部知识 |

## 八、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 混淆 linter 和 formatter | 以为 ruff 能格式化代码(早期 ruff 只有 check) | 区分清楚:ruff check 是 linter,ruff format 是 formatter |
| 以为 PEP 8 是强制的 | PEP 8 很多建议非强制,留有选择 | 团队需要更具体的规则(用工具落实) |
| 同时用多个 formatter | black + autopep8 互相打架 | 一个项目只用一个 formatter |
| 不配置就上线 | 用默认配置,团队各自调 | 配置写进 pyproject.toml,版本控制 |
| 只用 linter 不用 formatter | linter 只报告,代码还是乱的 | formatter + linter 都要 |
| 格式化后不跑测试 | 担心格式化改坏代码 | 格式化只动格式,但保险起见跑测试 |
| 在 CI 里才跑格式化 | 提交时格式已经乱了,CI 卡一堆 | 本地 pre-commit + 编辑器保存时格式化 |
| 争论可配置项 | 花 1 小时讨论 line-length 88 还是 100 | 用默认值,把时间留给逻辑 |
`,
  },

  // ============================================================
  // 第 2 章:Black:不妥协的格式化
  // ============================================================
  {
    id: "pyeng-format-black",
    icon: "🖤",
    title: "Black:不妥协的格式化",
    group: "格式化与工程化",
    content: `# Black:不妥协的格式化

## 一、Black 简介:没得选,所以没争论

Black 是一个 Python 代码格式化器,口号是 **"The Uncompromising Code Formatter"(不妥协的代码格式化器)**。它的核心设计哲学只有一句话:

> **没得选,所以没争论。**

传统的格式化器(如 autopep8、yapf)给了开发者大量配置选项——行长、引号、空格风格……结果团队为了这些选项争论不休。Black 反其道而行之:**几乎所有选项都不可配置**,你只能接受它的格式。这样一来,风格问题就彻底消失了——因为根本没有可争论的余地。

### Black 的来历

- **作者**:Łukasz Langa,CPython 核心开发者、Python 软件基金会 fellow。
- **诞生**:2018 年,最初在 Instagram 内部使用。
- **灵感**:Go 语言的 gofmt——Go 社区没有格式争论,因为 gofmt 是强制的、不可配置的。Black 把这个理念带到了 Python。
- **地位**:今天几乎所有主流 Python 项目(Django、Flask、FastAPI、Pydantic、pytest……)都在用 Black。

### 为什么"不妥协"是优点

乍一看"不可配置"像是缺点,但它恰恰是 Black 最大的优点:

| 传统 formatter | Black |
|---|---|
| 给你 20 个选项 | 给你 2 个选项 |
| 团队为选项开会 | 没会可开 |
| 每个项目配置不同 | 全世界格式统一 |
| 新人要学配置 | 新人什么都不用学 |

> 心智负担的降低,比"灵活性"重要得多。

## 二、安装

Black 是一个纯 Python 包,用 pip 安装即可:

\`\`\`bash
# 基础安装
pip install black

# 推荐安装带速度优化的版本(用 mypyc 编译,快 2-4 倍)
pip install "black[jupyter]"  # 顺便支持 jupyter notebook
\`\`\`

验证安装:

\`\`\`bash
black --version
# 输出示例:
# black, 24.3.0 (compiled: yes)
\`\`\`

注意输出里的 \`compiled: yes\`——表示装的是编译版,速度更快。如果你看到 \`compiled: no\`,建议升级到带编译的版本。

## 三、基本用法

### 格式化单个文件

\`\`\`bash
black my_code.py
# 输出:
# reformatted my_code.py
\`\`\`

文件被**直接修改**(原地格式化)。如果你想看改了什么,先 \`git add\` 再跑 black,然后 \`git diff\` 查看。

### 格式化整个目录

\`\`\`bash
black .
# 输出:
# reformatted src/a.py
# reformatted src/b.py
# All done! ✨ 🍰 ✨
# 12 files left unchanged.
\`\`\`

Black 会递归扫描当前目录下所有 \`.py\` 文件(默认也会处理 \`.pyi\` 类型存根文件)。

### 只检查不修改(--check)

在 CI 里,我们只想知道"代码是否符合规范",不想真的修改。用 \`--check\`:

\`\`\`bash
black --check .
# 输出:
# would reformat src/a.py
# would reformat src/b.py
# Oh no! 💥 💔 💥
# 2 files would be reformatted.
\`\`\`

如果所有文件都合规,退出码是 0;有文件需要格式化,退出码是 1。CI 据此判断是否拦截。

### 显示会怎么改(--diff)

\`\`\`bash
black --diff my_code.py
# 输出(类似 git diff):
# --- my_code.py    2024-01-01 10:00:00.000000 +0000
# +++ my_code.py    2024-01-01 10:00:00.000000 +0000
# @@ -1,3 +1,3 @@
# -x=1+2
# +x = 1 + 2
\`\`\`

\`--diff\` 只显示差异,**不修改文件**,适合本地预览。

### 常用参数一览

| 参数 | 作用 | 示例 |
|---|---|---|
| (无) | 格式化文件 | \`black a.py\` |
| \`.\` | 格式化当前目录 | \`black .\` |
| \`--check\` | 只检查不修改 | \`black --check .\` |
| \`--diff\` | 显示差异不修改 | \`black --diff .\` |
| \`--line-length\` | 设置行长度 | \`black --line-length 100 .\` |
| \`--target-version\` | 目标 Python 版本 | \`black --target-version py311 .\` |
| \`--exclude\` | 排除文件 | \`black --exclude migrations .\` |
| \`--skip-string-normalization\` | 保留引号原样 | \`black -S .\` |
| \`--preview\` | 启用实验性功能 | \`black --preview .\` |
| \`--verbose\` | 详细输出 | \`black -v .\` |

## 四、Black 的格式规则(不可配置的部分)

Black 的大部分规则是**写死的**,你只能接受。下面逐条看。

### 规则 1:行长度默认 88

Black 默认每行不超过 88 字符。为什么是 88?作者的解释是:88 比 PEP 8 的 79 更宽松(现代屏幕够宽),又比 100/120 更紧凑(并列对比代码时友好)。

\`\`\`python
# 你写的(一行 95 字符)
result = some_function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)

# black 格式化后(超 88 就换行)
result = some_function(
    arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10
)
\`\`\`

行长度**是少数可配置项之一**(\`--line-length\`),但官方强烈建议用默认值。

### 规则 2:统一双引号

Black 会把所有字符串引号统一成**双引号**(除非你用了 \`-S\` 选项)。

\`\`\`python
# 你写的(单引号)
name = '张三'
greeting = "hello, " + 'world'

# black 格式化后(全双引号)
name = "张三"
greeting = "hello, " + "world"
\`\`\`

为什么选双引号?一个现实理由:在字符串里出现单引号(撇号)的概率高于双引号(英语里 it's, don't 等很常见),用双引号能少转义:

\`\`\`python
# 双引号:不用转义
message = "it's a good day"
# 单引号:要转义
message = 'it\\'s a good day'
\`\`\`

### 规则 3:尾随逗号(trailing comma)

当集合/参数换行时,Black 会在最后一个元素后**加逗号**。

\`\`\`python
# 你写的(没尾随逗号)
fruits = [
    "apple",
    "banana",
    "cherry"
]

# black 格式化后(有尾随逗号)
fruits = [
    "apple",
    "banana",
    "cherry",
]
\`\`\`

尾随逗号的好处:**未来加元素时,git diff 只有一行变化**(否则加新元素要给前一行补逗号,diff 变两行)。

\`\`\`python
# 有尾随逗号:加新元素,diff 干净
+    "date",
\`\`\`

### 规则 4:续行用 1 空格缩进 + 圆括号

Black 不用反斜杠续行,而是用圆括号;续行部分缩进 1 个空格(对齐到括号后)。

\`\`\`python
# 你写的(反斜杠续行)
result = some_function(arg1, arg2, \\
                       arg3, arg4)

# black 格式化后(圆括号 + 1 空格缩进)
result = some_function(
    arg1, arg2, arg3, arg4
)
\`\`\`

当函数调用太长必须换多行时,Black 会把参数对齐到括号后 1 空格的位置:

\`\`\`python
# 当一行放不下时
result = some_function(
    arg1=very_long_value_1,
    arg2=very_long_value_2,
    arg3=very_long_value_3,
)

# 或者魔法悬挂(magic trailing comma)触发的展开
result = some_function(
    arg1,
    arg2,
    arg3,
)
\`\`\`

### 规则 5:等号两边空格(赋值)

\`\`\`python
# 你写的
x=1
y =2
z=  3

# black 格式化后
x = 1
y = 2
z = 3
\`\`\`

注意:关键字参数的等号**不加空格**。

\`\`\`python
# 函数调用里的 = 不加空格
func(name="张三", age=18)

# 赋值的 = 加空格
name = "张三"
age = 18
\`\`\`

### 规则 6:运算符两边空格

\`\`\`python
# 你写的
x=1+2*3
y = a*b-c

# black 格式化后
x = 1 + 2 * 3
y = a * b - c
\`\`\`

### 规则 7:数字字面量下划线分隔

(实验性功能,需 \`--preview\`)Black 会给大数字加下划线分隔,提高可读性:

\`\`\`python
# 你写的
big = 1000000000
pi = 3.14159265358979

# black --preview 格式化后
big = 1_000_000_000
pi = 3.141_592_653_589_79
\`\`\`

### 规则 8:空行控制

- 模块顶层函数/类之间:**2 个空行**
- 类内方法之间:**1 个空行**
- 多余的空行会被删除

\`\`\`python
# 你写的(空行混乱)
def func_a():
    pass




def func_b():
    pass

class MyClass:

    def method_a(self):
        pass


    def method_b(self):
        pass

# black 格式化后
def func_a():
    pass


def func_b():
    pass


class MyClass:
    def method_a(self):
        pass

    def method_b(self):
        pass
\`\`\`

## 五、Black 的可配置项(很少)

Black 的可配置项极少,这是它"不妥协"的体现。下面是全部常用配置项。

### 1. line-length

\`\`\`bash
black --line-length 100 .
\`\`\`

或在 pyproject.toml:

\`\`\`toml
[tool.black]
# 行长度:Black 默认 88,这里改成 100(常见折中值)
# 88 来源:比 PEP 8 的 79 宽松,又比 100/120 紧凑,适合并列对比代码
line-length = 100
\`\`\`

官方建议用默认 88,但 100 也是常见选择。

### 2. target-version

指定目标 Python 版本,Black 会据此调整格式(比如 py310+ 才支持的语法)。

\`\`\`bash
black --target-version py311 .
\`\`\`

\`\`\`toml
[tool.black]
# 目标 Python 版本:影响格式化决策(如 match-case 只在 py310+ 才保留)
# 多版本可写 ["py310", "py311", "py312"]
target-version = ["py311"]
\`\`\`

### 3. skip-string-normalization(-S)

保留字符串引号原样,不强制双引号。**这是少数允许"妥协"的地方**,但官方不推荐。

\`\`\`bash
black -S .
\`\`\`

\`\`\`toml
[tool.black]
# 跳过引号规范化:保留单/双引号原样(不推荐,会让引号争论复活)
skip-string-normalization = true
\`\`\`

> 一般建议:不要开这个选项,接受双引号,彻底消除引号争论。

### 4. extend-exclude / force-exclude

排除特定文件不格式化(比如自动生成的 migrations)。

\`\`\`toml
[tool.black]
# 额外排除的文件(在默认排除基础上追加)
# 用正则字符串字面量(regex triple-quoted string)
extend-exclude = '''
/(
  | migrations   # Django 迁移文件,自动生成,不要格式化
  | build        # 构建产物
  | dist         # 打包产物
)/
'''
\`\`\`

### 5. preview

启用实验性功能(如数字下划线、字符串拼接优化等)。

\`\`\`toml
[tool.black]
# 启用预览特性(实验性,未来版本可能变更,生产项目慎用)
preview = true
\`\`\`

## 六、Black 与字符串引号:深入

引号处理是 Black 最受争议的特性,值得单独说清。

### 默认行为:统一双引号

\`\`\`python
# 输入
a = 'hello'
b = "world"
c = 'it\\'s me'

# black 输出
a = "hello"
b = "world"
c = "it's me"  # 单引号在双引号里不用转义
\`\`\`

### 例外:字符串内已有双引号

如果字符串里已经有双引号,Black 不会强制转义,而是保留单引号:

\`\`\`python
# 输入
msg = 'he said "hi"'

# black 输出(保留单引号,避免转义)
msg = 'he said "hi"'
# 而不是
# msg = "he said \\"hi\\""  # 这种难看的转义 black 不会做
\`\`\`

### 三引号字符串

三引号字符串(docstring 等)也会被统一成双引号:

\`\`\`python
# 输入
def func():
    '''这是文档字符串'''
    pass

# black 输出
def func():
    """这是文档字符串"""
    pass
\`\`\`

## 七、Black 的"魔法":如何处理长行

Black 处理长行的策略,是它最"聪明"的地方。规则大致是:

1. 先尝试把能合并的合并(去掉不必要的换行)
2. 如果合并后还是超长,再按"最小填满"原则换行
3. 如果有"魔法尾随逗号"(magic trailing comma),强制展开

### 魔法尾随逗号(magic trailing comma)

如果你在最后一个元素后**手动加了逗号**,Black 会认为你"想展开",即使一行能放下也展开:

\`\`\`python
# 你写的(有尾随逗号)
fruits = ["apple", "banana", "cherry",]

# black 输出(尊重你的逗号,展开)
fruits = [
    "apple",
    "banana",
    "cherry",
]

# 如果没尾随逗号
fruits = ["apple", "banana", "cherry"]
# black 输出(一行能放下就一行)
fruits = ["apple", "banana", "cherry"]
\`\`\`

这是一个**显式控制换行**的机制:你想让某段代码强制展开成多行,加个尾随逗号即可。

### 换行策略示例

\`\`\`python
# 1. 一行能放下,不换行
result = func(a, b, c)

# 2. 一行放不下,展开成多行(参数对齐到括号后)
result = some_function_with_long_name(
    argument_one, argument_two, argument_three
)

# 3. 参数也长,每个参数单独一行
result = some_function_with_long_name(
    argument_one=very_long_value,
    argument_two=another_long_value,
    argument_three=yet_another_long_value,
)
\`\`\`

## 八、代码 demo:格式化前 vs 格式化后

### 示例 1:基础格式化

格式化前:

\`\`\`python
import os,sys
def calc( x,y ):
    return x*2+y*3
def greet(name='world'):
    return f'Hello,{name}!'
class MyClass:
    def __init__(self,value):
        self.value=value
    def get_value(self):
        return self.value
\`\`\`

格式化后(\`black demo.py\`):

\`\`\`python
import os
import sys


def calc(x, y):
    return x * 2 + y * 3


def greet(name="world"):
    return f"Hello, {name}!"


class MyClass:
    def __init__(self, value):
        self.value = value

    def get_value(self):
        return self.value
\`\`\`

变化点:import 拆开、函数间空两行、参数空格、运算符空格、引号双引号、f-string 内空格。

### 示例 2:长行处理

格式化前:

\`\`\`python
def create_user(name,age,email,phone,address,city,country,zip_code):
    return User(name=name,age=age,email=email,phone=phone,address=address,city=city,country=country,zip_code=zip_code)
\`\`\`

格式化后:

\`\`\`python
def create_user(
    name, age, email, phone, address, city, country, zip_code
):
    return User(
        name=name,
        age=age,
        email=email,
        phone=phone,
        address=address,
        city=city,
        country=country,
        zip_code=zip_code,
    )
\`\`\`

### 示例 3:尾随逗号

格式化前:

\`\`\`python
config = {
    "host":"localhost",
    "port":5432,
    "user":"admin"
}
\`\`\`

格式化后:

\`\`\`python
config = {
    "host": "localhost",
    "port": 5432,
    "user": "admin",
}
\`\`\`

## 九、Black 的规则一览表

| 规则 | 内容 | 可配置 |
|---|---|---|
| 行长度 | 默认 88 | 是(--line-length) |
| 引号 | 统一双引号 | 是(-S 保留原样) |
| 尾随逗号 | 换行时加 | 否 |
| 续行缩进 | 圆括号 + 1 空格 | 否 |
| 等号空格 | 赋值加,kwargs 不加 | 否 |
| 运算符空格 | 两边加 | 否 |
| 空行 | 顶层 2 行,方法 1 行 | 否 |
| 数字下划线 | (preview) 大数字加 _ | 否 |
| 引号内引号 | 内含双引号则保留单引号 | 否 |
| 魔法尾随逗号 | 尾随逗号触发展开 | 否 |
| import 拆分 | 不拆(留给 isort/ruff) | 否 |

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 以为 black 能排 import | black 不动 import 顺序 | 用 ruff(isort)排 import |
| 同时用 black 和 autopep8 | 两者规则冲突,互相打架 | 只用 black |
| 忘了 --check 在 CI 用 | CI 里直接 black . 会修改文件,没意义 | CI 用 black --check . |
| 修改 black 默认配置 | 改 line-length 又改引号,失去不妥协优势 | 尽量用默认,只在必要时改 line-length |
| 不跑 black 就提交 | 仓库里格式混乱 | 配 pre-commit,提交前自动跑 |
| black 改了 f-string | 以为 black 改了逻辑 | black 只加空格,不改逻辑 |
| 和 isort 冲突 | isort 默认格式和 black 不一致 | isort 用 profile="black" |
| 装了非编译版很慢 | pip install black 装的是纯 Python 版 | 装 black[jupyter] 或用 ruff format |
| 以为 black 能发现 bug | black 是 formatter 不是 linter | 配 ruff check 发现 bug |
| 在 docstring 里被改 | black 会把三单引号改成三双引号 | 接受,或用 -S(不推荐) |
`,
  },

  // ============================================================
  // 第 3 章:Ruff:超快 Linter
  // ============================================================
  {
    id: "pyeng-format-ruff",
    icon: "🦀",
    title: "Ruff:超快 Linter",
    group: "格式化与工程化",
    content: `# Ruff:超快 Linter

## 一、Ruff 简介:用 Rust 写的 Python 工具

Ruff 是一个用 Rust 编写的 Python 代码检查器(linter)和格式化器(formatter),由 **Astral** 公司开发(创始人 Charlie Marsh)。它于 2022 年发布,迅速成为 Python 工具生态的一颗超新星。

### Ruff 的核心卖点:极快

Ruff 比传统的 flake8 快 **10-100 倍**。在一个大型项目(几万行代码)上:

\`\`\`bash
# flake8 跑一次
flake8 .
# 真实耗时:12.4 秒

# ruff 跑一次
ruff check .
# 真实耗时:0.08 秒
\`\`\`

快 150 倍。这意味着:

- 本地保存时实时检查,毫无卡顿
- CI 里检查几乎不耗时
- 大型 monorepo 也能秒级完成

为什么这么快?因为它是 Rust 写的,而且做了大量并行化、增量检查、规则合并优化。传统 flake8 是纯 Python,每条规则要单独解析一遍 AST;Ruff 一次解析,所有规则共用。

### 一个工具取代一堆工具

Ruff 不只是替代 flake8,它一个工具集成了十几个传统工具的功能:

| 被取代的工具 | Ruff 里的规则集 | 作用 |
|---|---|---|
| flake8 | E/W/F | 基础检查 |
| isort | I | import 排序 |
| pyupgrade | UP | 现代化语法 |
| pep8-naming | N | 命名规范 |
| flake8-bugbear | B | 常见 bug |
| flake8-simplify | SIM | 简化写法 |
| flake8-comprehensions | C4 | 列表推导优化 |
| pydocstyle | D | 文档字符串 |
| bandit | S | 安全检查 |
| ...还有几十个 | ... | ... |

这意味着:装一个 ruff,就能干掉 5-10 个传统依赖,依赖树大幅瘦身。

## 二、安装

\`\`\`bash
# 用 pip 安装
pip install ruff

# 用 pipx 安装(推荐,隔离环境)
pipx install ruff

# 用 uv 安装(极快,Astral 自家的包管理器)
uv tool install ruff
\`\`\`

验证:

\`\`\`bash
ruff --version
# 输出:
# ruff 0.6.9
\`\`\`

## 三、Ruff 的两大功能:Linter + Formatter

Ruff 有两个子命令,对应两种功能:

\`\`\`bash
# 1. Linter:检查代码,报告/修复问题
ruff check .

# 2. Formatter:格式化代码(对标 black)
ruff format .
\`\`\`

注意区分:

| 子命令 | 功能 | 对标 |
|---|---|---|
| \`ruff check\` | 检查(lint) | flake8 + isort + pyupgrade... |
| \`ruff format\` | 格式化 | black |

很多人只知道 \`ruff check\`,不知道还有 \`ruff format\`。后者是 2024 年才稳定的功能,可以直接替代 black。

## 四、Linter 用法(ruff check)

### 基本检查

\`\`\`bash
ruff check .
# 输出示例:
# src/a.py:10:1 F401 [*] 'os' imported but unused
# src/b.py:15:5 E711 [*] Comparison to 'None' detected
# src/c.py:20:1 I001 [*] Import block is un-sorted or un-formatted
# Found 3 errors.
# [*] 3 fixable with 'ruff check --fix'.
\`\`\`

输出格式:\`文件:行:列 规则码 [可修复] 描述\`。\`[*]\` 标记表示这条问题可以用 \`--fix\` 自动修复。

### 自动修复(--fix)

\`\`\`bash
ruff check --fix .
# 输出:
# Found 3 errors.
# [*] 3 fixable with 'ruff check --fix'.
# Fixed 3 errors.
\`\`\`

\`--fix\` 会**直接修改文件**,把能修的问题都修了(未用 import 删掉、None 比较改成 is、import 排序等)。

### 安全修复 vs 不安全修复(--fix vs --unsafe-fixes)

Ruff 把修复分为两类:

- **安全修复(safe fix)**:不会改变代码语义的修复,例如删未用 import、把 \`== None\` 改成 \`is None\`。这些修复 \`--fix\` 会直接做。
- **不安全修复(unsafe fix)**:可能改变代码行为的修复,例如把 \`open()\` 改成 \`Path.open()\`(可能影响异常类型)。默认 \`--fix\` **不会**做这些,需要显式 \`--unsafe-fixes\` 才会做。

\`\`\`bash
# 只做安全修复(默认,推荐)
ruff check --fix .

# 安全 + 不安全修复(慎用,可能改变行为)
ruff check --fix --unsafe-fixes .
\`\`\`

输出里,不安全修复会用 \`[*] unsafe\` 标记,提醒你"这条修复有风险"。在 CI 里**绝对不要**用 \`--unsafe-fixes\`,只在本地手动审查时用。

| 修复类型 | 标记 | 命令 | 风险 |
|---|---|---|---|
| 安全修复 | \`[*]\` | \`--fix\` | 无(不改语义) |
| 不安全修复 | \`[*] unsafe\` | \`--fix --unsafe-fixes\` | 有(可能改行为) |

### 选择规则(--select)

默认 ruff 只启用 F(E/F)规则。你可以用 \`--select\` 启用更多:

\`\`\`bash
# 只检查 E 和 F
ruff check --select E,F .

# 启用所有规则(慎用,会报很多)
ruff check --select ALL .

# 启用 isort (I)
ruff check --select I .
\`\`\`

### 忽略规则(--ignore)

\`\`\`bash
# 忽略行长度规则 E501
ruff check --ignore E501 .

# 忽略多个
ruff check --ignore E501,E701 .
\`\`\`

### 只检查不修复(默认行为)

注意:ruff \`check\` 子命令**默认就只检查、不修复**(必须加 \`--fix\` 才会改文件)。所以 CI 里直接用:

\`\`\`bash
# 默认行为:只报告问题,不修改任何文件
ruff check .
\`\`\`

CI 里不要加 \`--fix\`,避免 CI 修改代码。

### 查看某条规则的说明(--explain)

\`\`\`bash
ruff rule E501
# 输出 E501 的详细说明、为什么、怎么修
\`\`\`

### 常用参数

| 参数 | 作用 |
|---|---|
| \`ruff check .\` | 检查当前目录 |
| \`--fix\` | 自动修复 |
| \`--select E,F\` | 选择规则 |
| \`--ignore E501\` | 忽略规则 |
| \`--extend-select I\` | 在默认基础上增加规则 |
| \`--statistics\` | 统计各类问题数量 |
| \`--watch\` | 监听文件变化实时检查 |
| \`--exit-non-zero-on-fix\` | 即使修复了也返回非零(用于 CI) |
| \`--diff\` | 显示修复差异不修改 |

## 五、Ruff 的规则集(非常多)

Ruff 的规则集用**字母前缀**分类,每类对应一个传统工具。下面是常用的几类。

### E / W:pycodestyle(PEP 8)

- **E**:Error,PEP 8 错误(空格、空行、行长等)
- **W**:Warning,PEP 8 警告

常见规则:

| 规则 | 含义 |
|---|---|
| E501 | 行太长 |
| E711 | 比较用 == 而不是 is(对 None) |
| E712 | 比较用 == True 而不是真值 |
| E722 | 裸 except |
| E731 | 用 lambda 赋值 |
| W291 | 行尾空格 |

### F:pyflakes(逻辑错误)

- **F**:Pyflakes,发现逻辑问题(未用变量、未用 import、重复定义等)

| 规则 | 含义 |
|---|---|
| F401 | import 了但没用 |
| F811 | 重复定义 |
| F821 | 未定义名字 |
| F841 | 局部变量赋值了但没用 |
| F901 | raise 了非异常 |

### I:isort(import 排序)

- **I**:import 排序,完全替代 isort 工具。

\`\`\`bash
ruff check --select I --fix .
# 等同于 isort .
\`\`\`

### N:pep8-naming(命名规范)

- **N**:命名规范检查

| 规则 | 含义 |
|---|---|
| N801 | 类名应该用驼峰 |
| N802 | 函数名应该小写 |
| N803 | 参数名应该小写 |
| N806 | 变量名应该小写 |

### UP:pyupgrade(现代化语法)

- **UP**:把老语法升级成新语法

\`\`\`python
# UP: 老写法 → 新写法
# UP006
from typing import Dict    → dict
# UP007
Union[int, str]            → int | str
# UP035
from typing import List    → list
\`\`\`

### B:bugbear(常见 bug)

- **B**:flake8-bugbear,发现常见 bug 模式

| 规则 | 含义 |
|---|---|
| B001 | bare except |
| B006 | 可变默认参数 |
| B008 | 函数调用作默认参数 |
| B017 | assert False 在测试里 |

### SIM:simplify(简化)

- **SIM**:flake8-simplify,提示可简化的写法

\`\`\`python
# SIM: 复杂写法 → 简化写法
# SIM102
if a:           → if a and b:
    if b:           ...
        ...
# SIM210
True if x else False  → bool(x)
\`\`\`

### S:bandit(安全)

- **S**:bandit,安全检查

| 规则 | 含义 |
|---|---|
| S101 | 用了 assert(生产环境可能被 -O 删掉) |
| S102 | 用了 exec |
| S106 | 密码硬编码 |
| S301 | 用了 pickle(反序列化危险) |

### C4:comprehensions(推导式优化)

- **C4**:flake8-comprehensions

\`\`\`python
# C4: 低效写法 → 推导式
# C400:list(generator) → 列表推导式
list(x for x in items)    → [x for x in items]
# C401:set(generator) → 集合推导式
set(x for x in items)     → {x for x in items}
# C402:dict(generator) → 字典推导式
dict(k(v) for v in items) → {k(v): v for v in items}
\`\`\`

### 其他常用规则集

| 前缀 | 名称 | 作用 |
|---|---|---|
| ANN | flake8-annotations | 类型注解检查 |
| ARG | flake8-unused-arguments | 未用参数 |
| A | flake8-builtins | 变量名遮蔽内置 |
| BLE | flake8-blind-except | 裸 except |
| C90 | mccabe | 圈复杂度 |
| DJ | flake8-django | Django 专项 |
| PT | flake8-pytest-style | pytest 风格 |
| Q | flake8-quotes | 引号规范 |
| RET | flake8-return | return 风格 |
| RUF | ruff 专属规则 | ruff 自定义的规则 |
| T20 | flake8-print | 检查 print 语句 |
| TRY | tryceratops | 异常处理 |

## 六、规则选择:select / ignore / per-file-ignores

### select / ignore 的优先级

\`--ignore\` 的优先级高于 \`--select\`。如果你同时选了又忽略了同一个规则,忽略生效。

\`\`\`bash
# 启用所有 E/F,但忽略 E501
ruff check --select E,F --ignore E501 .
\`\`\`

### extend-select / extend-ignore

不想覆盖默认,只想**追加**规则,用 extend 系列:

\`\`\`bash
# 在默认基础上追加 I 和 B
ruff check --extend-select I,B .
\`\`\`

### per-file-ignores(单文件忽略)

某些文件需要豁免某些规则(比如 tests 目录允许 assert):

\`\`\`toml
[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]  # 测试里允许 assert
"migrations/**" = ["E501"]  # 迁移文件允许长行
\`\`\`

### ALL 的陷阱

\`\`\`bash
ruff check --select ALL .
\`\`\`

\`ALL\` 启用所有规则,听起来很爽,但实际上会报海量问题(很多规则互相冲突或过于严格)。**不推荐**直接用 ALL,建议从一个合理的子集开始:

\`\`\`toml
[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
\`\`\`

## 七、Ruff 配置(在 pyproject.toml)

Ruff 的配置写在 \`pyproject.toml\` 里,主要分两块:\`[tool.ruff]\`(全局)和 \`[tool.ruff.lint]\`(linter 专属)。

### 完整配置示例

\`\`\`toml
# pyproject.toml
[tool.ruff]
# 目标 Python 版本(影响规则,如 UP 会按版本决定能否升级语法)
target-version = "py311"
# 行长度(与 black 保持一致,formatter 也会按这个换行)
line-length = 88
# 包含的文件(默认是 .py 和 .pyi,这里追加 notebook)
include = ["*.py", "*.pyi", "*.ipynb"]
# 排除的文件(默认排除 .git/.venv 等,这里追加业务目录)
exclude = [
    ".git",        # 版本控制元数据
    ".venv",       # 虚拟环境
    "build",       # 构建产物
    "dist",        # 打包产物
    "migrations",  # Django 迁移文件,自动生成
]

[tool.ruff.lint]
# 启用的规则集(每个字母对应一类规则)
# E  = pycodestyle Error(PEP 8 错误:空格、空行)
# F  = Pyflakes(逻辑错误:未用变量、未用 import)
# I  = isort(import 排序,替代 isort 工具)
# N  = pep8-naming(命名规范:类驼峰、函数小写)
# UP = pyupgrade(老语法升级成新语法,如 Dict→dict)
# B  = bugbear(常见 bug 模式,如可变默认参数)
# SIM = simplify(可简化的写法,如嵌套 if 合并)
# RUF = ruff 专属规则(ruff 自定义的检查)
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
# 忽略的规则(--ignore 优先级高于 --select)
ignore = [
    "E501",  # 行长度(交给 formatter 管,formatter 会自动换行)
    "B008",  # 函数调用作默认参数(FastAPI 的 Depends() 需要这种写法)
]
# 是否允许自动修复:ALL 表示所有可修复规则都允许 --fix
fixable = ["ALL"]
unfixable = []  # 不禁止任何规则被修复

[tool.ruff.lint.per-file-ignores]
# 测试目录豁免:S101(assert)、S106(密码字面量)在测试里是正常写法
"tests/**" = ["S101", "S106"]
# __init__.py 豁免 F401:导出 API 时 import 了但不直接用
"__init__.py" = ["F401"]

[tool.ruff.lint.isort]
# 告诉 ruff 的 isort:myproject 是项目内包,排在 third-party 之后
known-first-party = ["myproject"]

[tool.ruff.format]
# 格式化配置(对标 black,默认就 black 兼容)
quote-style = "double"  # 引号统一双引号(和 black 一致)
indent-style = "space"  # 用空格缩进(不用 tab)
line-ending = "auto"    # 自动适应操作系统换行符
\`\`\`

### 配置项说明

| 配置 | 位置 | 作用 |
|---|---|---|
| target-version | [tool.ruff] | 目标 Python 版本 |
| line-length | [tool.ruff] | 行长度 |
| exclude | [tool.ruff] | 排除文件 |
| select | [tool.ruff.lint] | 启用规则 |
| ignore | [tool.ruff.lint] | 忽略规则 |
| fixable | [tool.ruff.lint] | 可修复规则 |
| per-file-ignores | [tool.ruff.lint] | 单文件忽略 |
| quote-style | [tool.ruff.format] | 引号风格 |

## 八、Ruff 与 Black 的关系

很多人会问:既然 Ruff 这么强,还要不要 black?答案是:**可以只用 ruff,也可以 black + ruff check 共存**。

### 选项 A:ruff format 替代 black

\`ruff format\` 的格式化结果与 black **默认兼容**(一样的设计哲学)。你可以直接用 ruff format 替代 black:

\`\`\`bash
# 原本
black .

# 改成
ruff format .
\`\`\`

好处:少装一个依赖(black),工具链更精简。

### 选项 B:black + ruff check 共存

很多老项目已经在用 black,不必急着换。可以保留 black 做 formatter,用 ruff check 做 linter(替代 flake8 + isort):

\`\`\`bash
# formatter 用 black
black .
# linter 用 ruff(替代 flake8 + isort + pyupgrade)
ruff check --fix .
\`\`\`

注意:如果用 black,记得在 ruff 配置里声明"format 兼容 black",避免规则冲突:

\`\`\`toml
[tool.ruff]
# 告诉 ruff:formatter 用的是 black,lint 别报 black 会处理的格式问题
\`\`\`

实际上 ruff 默认就考虑了 black 兼容,基本不用额外配。

### 选项对比

| 方案 | 工具 | 优点 | 缺点 |
|---|---|---|---|
| 只用 ruff | ruff(check + format) | 最精简,一个工具 | format 较新,生态还在适应 |
| black + ruff check | black + ruff | black 最成熟 | 两个工具 |
| 老:flake8 + black + isort | 三个 | 传统 | 慢、配置多 |

> 新项目推荐:只用 ruff。老项目:保持 black + ruff check,稳定后再考虑迁到 ruff format。

## 九、代码 demo:一个项目的 ruff 配置 + 检查示例

### 项目结构

\`\`\`bash
myproject/
├── pyproject.toml
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── main.py
│       └── utils.py
└── tests/
    └── test_main.py
\`\`\`

### pyproject.toml

\`\`\`toml
[tool.ruff]
target-version = "py311"
line-length = 88
exclude = [".git", ".venv", "build", "dist"]

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
ignore = ["E501"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]

[tool.ruff.lint.isort]
known-first-party = ["myproject"]
\`\`\`

### 待检查的代码

\`\`\`python
# src/myproject/main.py
import os
import sys
from myproject.utils import helper
from typing import Dict, List

def Main( x,y ):
    if x == None:
        return None
    result = []
    for i in range(y):
        result.append( x+i )
    return result

def unused_function():
    pass

def get_config() -> Dict[str, List[int]]:
    return {"data": [1, 2, 3]}
\`\`\`

### 检查结果

\`\`\`bash
ruff check src/myproject/main.py
\`\`\`

输出:

\`\`\`bash
src/myproject/main.py:1:1 F401 [*] 'os' imported but unused
src/myproject/main.py:2:1 F401 [*] 'sys' imported but unused
src/myproject/main.py:6:1 N802 Function name 'Main' should be lowercase
src/myproject/main.py:6:10 E203 Whitespace before ':'
src/myproject/main.py:7:8 E711 Comparison to 'None' should be 'if x is None:'
src/myproject/main.py:11:19 E203 Whitespace before ':'
src/myproject/main.py:5:1 UP006 [*] Use 'dict' instead of 'Dict'
src/myproject/main.py:5:1 UP006 [*] Use 'list' instead of 'List'
Found 8 errors.
[*] 4 fixable with 'ruff check --fix'.
\`\`\`

### 自动修复后

\`\`\`bash
ruff check --fix src/myproject/main.py
\`\`\`

修复后:

\`\`\`python
# 修复后(F401 删了未用的 import,UP006 把 Dict/List 改成 dict/list)
# 剩下 N802 和 E711 这种需要人工判断的,ruff 不会自动改
from myproject.utils import helper

def Main(x, y):
    if x == None:
        return None
    result = []
    for i in range(y):
        result.append(x + i)
    return result

def unused_function():
    pass

def get_config() -> dict[str, list[int]]:
    return {"data": [1, 2, 3]}
\`\`\`

剩余的 N802(函数名应小写)、E711(None 比较)需要人工改名/改逻辑,ruff 不会自动改。

## 十、Ruff 常用规则集速查表

| 前缀 | 名称 | 作用 | 是否默认 |
|---|---|---|---|
| E | pycodestyle Error | PEP 8 错误 | 是 |
| W | pycodestyle Warning | PEP 8 警告 | 是 |
| F | Pyflakes | 逻辑错误 | 是(默认启用) |
| I | isort | import 排序 | 否(需 select) |
| N | pep8-naming | 命名规范 | 否 |
| UP | pyupgrade | 现代化语法 | 否 |
| B | bugbear | 常见 bug | 否 |
| SIM | simplify | 简化写法 | 否 |
| C4 | comprehensions | 推导式优化 | 否 |
| S | bandit | 安全检查 | 否 |
| D | pydocstyle | 文档字符串 | 否 |
| ANN | annotations | 类型注解 | 否 |
| PT | pytest-style | pytest 风格 | 否 |
| RUF | ruff 专属 | ruff 自定义 | 否 |
| ALL | 全部 | 所有规则 | 不推荐 |

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 不知道 ruff format | 以为 ruff 只能 check | ruff format 可替代 black |
| 默认规则太少 | 默认只 E/F,以为 ruff 没用 | select 加上 I/N/UP/B/SIM |
| 用 --select ALL | 报海量问题,劝退 | 从合理子集开始 |
| CI 里用 --fix | CI 修改了代码 | CI 用 ruff check(无 --fix) |
| 没配 per-file-ignores | tests 里的 assert 被报 | tests 目录豁免 S101 |
| isort 和 ruff I 同时用 | 两个工具都排 import,打架 | 二选一,推荐用 ruff I |
| target-version 没设 | UP 规则不知道该升到哪 | 明确设 target-version |
| 以为 ruff 能跑测试 | ruff 是静态检查 | 测试用 pytest |
| 规则码记不住 | 不知道哪条是哪条 | 用 ruff rule <code> 查说明 |
| black 和 ruff format 同时用 | 两个 formatter 冲突 | 只用一个 |
`,
  },

  // ============================================================
  // 第 4 章:isort:import 排序
  // ============================================================
  {
    id: "pyeng-format-isort",
    icon: "🔤",
    title: "isort:import 排序",
    group: "格式化与工程化",
    content: `# isort:import 排序

## 一、isort 简介:自动排序 import

isort(Isort = "import sort")是一个专门用来**自动排序 import 语句**的工具。它解决一个看似微小但很烦人的问题:import 顺序乱七八糟。

### 为什么 import 顺序重要

来看一个真实项目的 import 块:

\`\`\`python
# 没排序的 import
import sys
import os
from myproject.utils import helper
import requests
from typing import List
import json
from myproject.models import User
import pandas as pd
\`\`\`

问题:标准库、第三方库、项目内模块混在一起,读代码时要先在脑子里分类。isort 一跑:

\`\`\`python
# isort 排序后
import json
import os
import sys
from typing import List

import pandas as pd
import requests

from myproject.models import User
from myproject.utils import helper
\`\`\`

瞬间清晰:**标准库 / 第三方 / 项目内**三组分开,每组内字母排序。读代码时一眼就知道这个模块依赖了什么。

### isort 的设计哲学

isort 不像 black 那么"不妥协"——它有大量配置选项,甚至有预设的 \`profile\`(black/pytest/django/google)。这既是优点(灵活),也是缺点(配置不对就和 black 打架)。

> 趋势:isort 正在被 ruff 内置的 I 规则集取代。但 isort 仍然广泛使用,值得学。

## 二、安装

\`\`\`bash
pip install isort
\`\`\`

验证:

\`\`\`bash
isort --version
# 输出:
# isort 5.13.2
\`\`\`

## 三、基本用法

### 排序单个文件

\`\`\`bash
isort my_code.py
# 输出:
# Fixing my_code.py
\`\`\`

文件被**直接修改**(原地排序)。

### 排序整个目录

\`\`\`bash
isort .
# 输出:
# Fixing src/a.py
# Fixing src/b.py
\`\`\`

### 只检查不修改(--check-only)

\`\`\`bash
isort --check-only .
# 输出(如果有问题):
# ERROR: src/a.py Imports are incorrectly sorted and/or formatted.
\`\`\`

CI 里用 \`--check-only\`,只检查不修改。

### 显示差异(--diff)

\`\`\`bash
isort --diff my_code.py
# 输出 import 块的差异
\`\`\`

### 常用参数

| 参数 | 作用 |
|---|---|
| \`isort file.py\` | 排序文件 |
| \`isort .\` | 排序当前目录 |
| \`--check-only\` | 只检查不修改 |
| \`--diff\` | 显示差异不修改 |
| \`--profile black\` | 用 black 预设 |
| \`--line-length 88\` | 行长度 |
| \`--known-first-party\` | 项目内包名 |
| \`--known-third-party\` | 第三方包名 |
| \`--force-sort-within-sections\` | 段内强制排序 |
| \`--case-sensitive\` | 大小写敏感 |

## 四、isort 的排序规则

### 三组分隔

isort 把 import 分成三大组,组与组之间**空一行**:

1. **标准库**(stdlib):os, sys, json, typing...
2. **第三方库**(third party):requests, pandas, fastapi...
3. **项目内**(first party):myproject.xxx

\`\`\`python
# 第一组:标准库
import json
import os
import sys
from typing import List

# 第二组:第三方
import pandas as pd
import requests
from fastapi import FastAPI

# 第三组:项目内
from myproject.models import User
from myproject.utils import helper
\`\`\`

### 每组内字母排序

每组内,按**模块名字母顺序**排:

\`\`\`python
# 标准库组内,字母序
import json    # j
import os      # o
import sys     # s
\`\`\`

### import vs from 的顺序

isort 默认把 \`import x\` 放在 \`from x import y\` **前面**(同组内):

\`\`\`python
# 正确顺序
import os
import sys
from typing import List
\`\`\`

### 大小写规则

默认情况下,isort 排序**大小写不敏感**(大写和小写混在一起排)。如果想让大写在前,用 \`--case-sensitive\`:

\`\`\`python
# 默认(大小写不敏感)
import os
import Pandas
import requests

# --case-sensitive(大写在前)
import Pandas
import os
import requests
\`\`\`

### 长行处理

当一行 import 太长,isort 会自动换行:

\`\`\`python
# 一行太长
from some.very.long.package.name import function_one, function_two, function_three

# isort 换行(默认用括号)
from some.very.long.package.name import (
    function_one,
    function_two,
    function_three,
)
\`\`\`

## 五、isort 配置

isort 的配置可以写在多个地方:pyproject.toml、setup.cfg、.isort.cfg、tox.ini。**推荐用 pyproject.toml**:

\`\`\`toml
[tool.isort]
# profile 是预设风格:用 black 项目必须设这个,否则 isort 和 black 在 import 换行上打架
profile = "black"
# 行长度:与 black 保持一致(isort 会按这个决定何时换行)
line_length = 88
# 项目内包名:isort 据此把它们单独成组,排第三方之后
known_first_party = ["myproject"]
# 强制声明为第三方(可选,isort 通常能自动识别,但识别不准时手动声明)
known_third_party = ["requests", "pandas"]
\`\`\`

### profile:预设

isort 提供几个预设 profile,直接套用一套规则:

| profile | 风格 | 适用 |
|---|---|---|
| black | 与 black 兼容 | 用 black 的项目(推荐) |
| pep8 | 严格 PEP 8 | 传统项目 |
| google | Google 风格 | Google 风格项目 |
| pytest | pytest 风格 | pytest 插件项目 |
| django | Django 风格 | Django 项目 |
| pycharm | PyCharm 默认 | 用 PyCharm 的项目 |

**用 black 的项目,必须设 \`profile = "black"\`**,否则 isort 和 black 会在 import 换行格式上打架。

### known_first_party / known_third_party

isort 自动判断一个包是标准库还是第三方,但对"项目内"的判断需要你告诉它:

\`\`\`toml
[tool.isort]
known_first_party = ["myproject"]  # 这些是项目内包
known_third_party = ["requests"]   # 强制声明为第三方
\`\`\`

如果不配 \`known_first_party\`,isort 可能把项目内包误判为第三方包,排序就乱了。

### force_sort_within_sections

默认 \`import x\` 和 \`from x import y\` 是分开的(import 在前)。开这个选项后,两者混在一起按模块名排序:

\`\`\`python
# 默认
import os
import sys
from typing import List

# force_sort_within_sections = true
import os
import sys
from collections import OrderedDict
from typing import List
\`\`\`

### case_sensitive

大小写敏感排序(大写在前):

\`\`\`toml
[tool.isort]
case_sensitive = true
\`\`\`

### force_single_line

强制每个 import 一行:

\`\`\`python
# 默认
from typing import Dict, List, Optional

# force_single_line = true
from typing import Dict
from typing import List
from typing import Optional
\`\`\`

## 六、isort 配置选项速查表

| 选项 | 作用 | 默认 |
|---|---|---|
| profile | 预设风格 | 无 |
| line_length | 行长度 | 79 |
| known_first_party | 项目内包 | [] |
| known_third_party | 第三方包 | [] |
| force_sort_within_sections | 段内混合排序 | false |
| case_sensitive | 大小写敏感 | false |
| force_single_line | 强制单行 | false |
| use_parentheses | 用括号续行 | true |
| multi_line_output | 多行输出风格 | 0 |
| include_trailing_comma | 尾随逗号 | false |
| skip | 跳过文件 | [] |
| skip_glob | 跳过 glob | [] |
| src_paths | 源码路径 | [] |

### multi_line_output 详解

\`multi_line_output\` 控制 import 换行的样式,有 0-12 共 13 种模式。最常用的是:

- **0**:Vertical(垂直,每个 import 元素单独一行)
- **3**:Vertical Hanging Indent(垂直悬挂缩进,带尾随逗号,常用)
- **5**:Vertical Grid Grouped(垂直网格分组,尽量一行放多个)
- **9**:Vertical Grid Grouped Hanging Indent(黑兼容,black profile 自动用这个)

> 实际项目中**不要手动设 multi_line_output**,直接用 \`profile = "black"\` 让 isort 自动选。手动设容易和 black 冲突。

## 七、isort 与 Black 的冲突:用 profile 解决

如果不配 profile,isort 默认的换行格式和 black **不一致**,两者会打架:

### 冲突示例

\`\`\`python
# 原始
from some.module import func1, func2, func3, func4, func5, func6

# isort 默认(无 profile)
from some.module import func1, func2, func3, func4, func5, func6

# black 跑后(改成)
from some.module import (
    func1,
    func2,
    func3,
    func4,
    func5,
    func6,
)

# isort 再跑(又改回去)
from some.module import func1, func2, func3, func4, func5, func6

# 死循环
\`\`\`

### 解决:profile = "black"

\`\`\`toml
[tool.isort]
profile = "black"
\`\`\`

设了 black profile 后,isort 的换行格式与 black 完全一致,两者不再冲突:

\`\`\`python
# isort --profile black 跑后
from some.module import (
    func1,
    func2,
    func3,
    func4,
    func5,
    func6,
)

# black 跑后(不变)
# 完美兼容
\`\`\`

> 铁律:**用 black 的项目,isort 必须设 profile = "black"**。

## 八、isort 与 Ruff:Ruff 内置 isort

Ruff 内置了 isort 的功能(规则 I),可以直接替代 isort:

\`\`\`bash
# 用 isort
isort .

# 用 ruff(等价)
ruff check --select I --fix .
\`\`\`

### ruff 的 isort 配置

在 pyproject.toml:

\`\`\`toml
[tool.ruff.lint]
select = ["I"]  # 启用 isort 规则

[tool.ruff.lint.isort]
known-first-party = ["myproject"]
combine-as-imports = true
\`\`\`

### isort vs ruff I 对比

| 维度 | isort | ruff I |
|---|---|---|
| 速度 | 慢(纯 Python) | 极快(Rust) |
| 配置 | 独立 [tool.isort] | 内置 [tool.ruff.lint.isort] |
| 依赖 | 单独装 | ruff 自带 |
| 兼容 black | profile="black" | 默认兼容 |
| 功能完整度 | 完整 | 95%(个别边角选项没有) |
| 推荐度 | 老项目可保留 | 新项目推荐 |

> 新项目:用 ruff I 替代 isort,少一个依赖。老项目:isort 继续用,配 profile="black"。

## 九、代码 demo:isort 前 vs isort 后

### 示例 1:基础排序

isort 前:

\`\`\`python
import sys
import os
from myproject.utils import helper
import requests
from typing import List, Dict
import json
from myproject.models import User
import pandas as pd
from collections import OrderedDict
\`\`\`

isort 后(\`isort --profile black demo.py\`):

\`\`\`python
import json
import os
import sys
from collections import OrderedDict
from typing import Dict, List

import pandas as pd
import requests

from myproject.models import User
from myproject.utils import helper
\`\`\`

变化:

1. 三组分开(标准库 / 第三方 / 项目内),组间空行
2. 每组内字母序
3. \`import\` 在 \`from\` 前(同组内)
4. \`from typing import List, Dict\` 改成 \`Dict, List\`(字母序)

### 示例 2:长行换行

isort 前:

\`\`\`python
from some.very.long.package.name import function_one, function_two, function_three, function_four
\`\`\`

isort 后:

\`\`\`python
from some.very.long.package.name import (
    function_four,
    function_one,
    function_three,
    function_two,
)
\`\`\`

### 示例 3:错误用法导致的问题

如果不设 \`known_first_party\`,isort 可能误判:

\`\`\`python
# 假设 myproject 是项目内包,但没告诉 isort
# isort 可能把 myproject 当第三方,排错组

# 配置前(错误)
import os
import requests  # 第三方
from myproject.models import User  # 被当成第三方,和 requests 一组

# 配置 known_first_party = ["myproject"] 后(正确)
import os

import requests

from myproject.models import User  # 单独成组
\`\`\`

## 十、isort 配置选项完整表

| 配置 | 类型 | 作用 | 推荐值 |
|---|---|---|---|
| profile | str | 预设风格 | "black" |
| line_length | int | 行长度 | 88 |
| known_first_party | list | 项目内包 | ["myproject"] |
| known_third_party | list | 第三方包 | (按需) |
| force_sort_within_sections | bool | 段内混合排序 | false |
| case_sensitive | bool | 大小写敏感 | false |
| force_single_line | bool | 单行 import | false |
| use_parentheses | bool | 括号续行 | true |
| multi_line_output | int | 多行样式 | 3(配 black) |
| include_trailing_comma | bool | 尾随逗号 | true(配 black) |
| skip | list | 跳过文件 | ["migrations"] |
| src_paths | list | 源码路径 | ["src"] |

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 不设 profile 与 black 冲突 | isort 默认格式和 black 不一致 | 设 profile = "black" |
| 不设 known_first_party | 项目内包被误判为第三方 | 配 known_first_party |
| isort 和 ruff I 同时用 | 两个工具都排 import,打架 | 二选一 |
| CI 里用 isort(无 --check) | CI 修改了代码 | CI 用 isort --check-only |
| 误以为 isort 排所有 import | isort 只排顶层 import | 函数内 import 不动 |
| multi_line_output 设错 | 换行样式和 black 不一致 | 用 black profile,别手动设 |
| 大小写敏感设错 | 排序结果不符合预期 | 默认 false,需要再开 |
| 跑 isort 后不跑 black | 两者顺序导致格式微调 | 先 isort 再 black,或只用 ruff |
| 忘了排除 migrations | 自动生成的 migrations 被改 | skip = ["migrations"] |
| 以为 isort 能检查逻辑 | isort 只排 import | 逻辑检查用 ruff |
`,
  },

  // ============================================================
  // 第 5 章:工具链集成(pre-commit/pyproject)
  // ============================================================
  {
    id: "pyeng-format-integration",
    icon: "🔗",
    title: "工具链集成(pre-commit/pyproject)",
    group: "格式化与工程化",
    content: `# 工具链集成(pre-commit/pyproject)

## 一、为什么需要"集成"

前面几章我们学了 black、ruff、isort 三个工具。但如果你每次提交代码都要手动跑一遍这三个工具,会有三个问题:

1. **容易忘**:忙起来忘了跑,脏代码就进了仓库
2. **不一致**:不同开发者跑的命令、版本不同
3. **没强制力**:即使有规范,也没人强制执行

工程化的核心理念是**自动化**——把工具链接成一条流水线,让"格式化 + 检查"在合适的时机**自动**执行,无需人手动干预。这一章讲怎么集成,主要涉及三个层面:

- **本地**:pre-commit(Git hook,提交时自动跑)
- **配置**:pyproject.toml(统一配置入口)
- **CI**:GitHub Actions(推送时再跑一遍,兜底)

## 二、pre-commit:Git hook 自动化

### 什么是 Git hook

Git 提供了 hook 机制——在某些 Git 操作前后,自动执行脚本。最常用的是 \`pre-commit\` hook:在 \`git commit\` 之前自动执行,如果脚本失败,提交就被阻止。

\`\`\`bash
# Git hook 默认位置
.git/hooks/pre-commit
\`\`\`

但手写 Git hook 有几个问题:

- 每个人要手动装(共享麻烦)
- 脚本要自己写(重复造轮子)
- 不同环境(Python/Node/Go)的工具混在一起,管理混乱

### pre-commit 工具

\`pre-commit\` 是一个**管理 Git hook 的工具**(注意它本身叫 pre-commit,和 Git 的 pre-commit hook 同名)。它解决:

- 配置文件 \`.pre-commit-config.yaml\` 声明要跑哪些工具
- 一条命令 \`pre-commit install\` 装好 hook
- 团队共享配置,所有人 hook 一致
- 支持多语言工具(Python/Node/Go/Rust...)

### 安装

\`\`\`bash
pip install pre-commit
# 或
pipx install pre-commit
\`\`\`

验证:

\`\`\`bash
pre-commit --version
# pre-commit 3.7.1
\`\`\`

### 配置文件:.pre-commit-config.yaml

在项目根目录创建 \`.pre-commit-config.yaml\`,声明要跑的工具:

\`\`\`yaml
# .pre-commit-config.yaml
# 声明在 git commit 之前要跑哪些工具
repos:
  # Black:格式化(管外观)
  - repo: https://github.com/psf/black
    rev: 24.3.0  # rev 钉死版本!避免不同开发者跑出不同格式
    hooks:
      - id: black
        language_version: python3.11  # 指定 Python 版本,避免用错环境

  # Ruff:lint + format(管质量 + 外观)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9  # 钉死 ruff 版本(规则集会随版本变化,必须锁)
    hooks:
      - id: ruff
        args: [--fix]  # 检查并自动修复(可修复的规则)
      - id: ruff-format  # 格式化(对标 black)

  # isort:import 排序
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2  # 钉死 isort 版本
    hooks:
      - id: isort
        args: [--profile=black]  # 用 black 预设,避免与 black 打架

  # 基础检查:大文件、冲突标记、YAML 语法等
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0  # 钉死 pre-commit-hooks 版本
    hooks:
      - id: trailing-whitespace   # 删除行尾空格
      - id: end-of-file-fixer     # 确保文件末尾有换行
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
\`\`\`

### 安装 hook

\`\`\`bash
pre-commit install
# 输出:
# pre-commit installed at .git/hooks/pre-commit
\`\`\`

这一步**每个开发者只需要执行一次**(克隆项目后)。之后每次 \`git commit\` 都会自动跑 hook。

### 手动跑一次

\`\`\`bash
# 跑所有文件(不只暂存的)
pre-commit run --all-files
\`\`\`

### 跳过 hook(慎用)

\`\`\`bash
git commit --no-verify -m "紧急修复"
\`\`\`

\`--no-verify\` 会跳过 hook。**只在紧急情况下用**,而且要在团队里说明原因。

### 更新 hook 版本(autoupdate)

\`.pre-commit-config.yaml\` 里每个 repo 的 \`rev\` 都是钉死的版本。时间久了,工具会出新版本(black 24.3 → 24.9、ruff 0.6 → 0.7...),手动改 rev 很繁琐。用 \`autoupdate\` 一键升级:

\`\`\`bash
# 自动把所有 repo 的 rev 更新到最新发布版本
pre-commit autoupdate
# 输出:
# [https://github.com/psf/black] updating 24.3.0 -> 24.10.0
# [https://github.com/astral-sh/ruff-pre-commit] updating v0.6.9 -> v0.7.0
\`\`\`

注意:autoupdate 后,**所有开发者要重新 \`pre-commit install\`**(或 pre-commit 会自动拉取新版本)。建议每月跑一次 autoupdate,作为版本升级节奏。

### 自动修复(autofix)

很多 hook(black、ruff --fix、isort)会**自动修改文件**。pre-commit 默认行为:

- 如果 hook 修改了文件 → hook **失败**(退出码非 0)→ 提交被阻止
- 你需要 \`git add\` 修复后的文件,再 \`git commit\`

这是 pre-commit 的"autofix"机制:工具自动改文件,但你必须**手动确认**(重新 add)才会进提交。这样防止"工具改坏了但你没看就提交"。

\`\`\`bash
# 1. 工具改了文件,提交被阻止
git commit -m "feat: xxx"
# > black................................................Failed
# > - hook id: black
# > - files were modified by this hook

# 2. 重新 add 工具改后的文件
git add .

# 3. 再提交(这次会过)
git commit -m "feat: xxx"
\`\`\`

### pre-commit 的工作流程

\`\`\`bash
# 1. 你 git add
git add .

# 2. 你 git commit
git commit -m "feat: add user API"

# 3. pre-commit hook 自动触发
# - 跑 black(格式化)
# - 跑 ruff check --fix(检查+修复)
# - 跑 ruff format(格式化)
# - 跑 isort(import 排序)
# - 跑基础检查

# 4a. 全部通过 → 提交成功
# 4b. 有失败 → 提交被阻止,你需要 git add 修复后的文件再提交
\`\`\`

### 一个重要陷阱:工具修改了文件,但要重新 add

当 black/ruff 修改了文件,这些修改**不会自动加到本次提交**。你需要:

\`\`\`bash
# hook 跑完,工具改了文件,但提交被阻止
git add .  # 重新加修改
git commit -m "feat: add user API"  # 再提交
\`\`\`

pre-commit 会在第一次失败后提示你重新 add。

## 三、pyproject.toml:现代 Python 项目的统一配置

### 为什么要用 pyproject.toml

老时代的 Python 项目,配置分散在十几个文件:

\`\`\`bash
setup.py         # 包元数据
requirements.txt # 依赖
.flake8          # flake8 配置
.isort.cfg       # isort 配置
pytest.ini       # pytest 配置
mypy.ini         # mypy 配置
.coveragerc      # coverage 配置
...
\`\`\`

新时代用 **pyproject.toml** 一个文件统管所有配置(PEP 518/PEP 621):

\`\`\`bash
pyproject.toml   # 元数据 + 依赖 + 所有工具配置
\`\`\`

### 从 setup.py / setup.cfg 迁移到 pyproject.toml

老项目通常用 \`setup.py\` + \`setup.cfg\` 管理元数据和配置。迁移到 \`pyproject.toml\` 的对应关系:

| 老配置 | 新配置(pyproject.toml) | 说明 |
|---|---|---|
| setup.py 里的 \`setup(name=..., version=...)\` | \`[project]\` 段 | 元数据从函数参数变 TOML 字段 |
| setup.py 里的 \`install_requires=[...]\` | \`[project] dependencies\` | 运行时依赖 |
| setup.py 里的 \`extras_require={'dev': [...]\` | \`[project.optional-dependencies] dev\` | 可选依赖 |
| setup.py 里的 \`entry_points={'console_scripts': ...}\` | \`[project.scripts]\` | 命令行入口 |
| setup.cfg 里的 \`[tool:pytest]\` | \`[tool.pytest.ini_options]\` | pytest 配置 |
| setup.cfg 里的 \`[flake8]\` | (迁移到 ruff) \`[tool.ruff]\` | flake8 → ruff |
| setup.cfg 里的 \`[mypy]\` | \`[tool.mypy]\` | mypy 配置 |
| mypy.ini | \`[tool.mypy]\` | mypy 配置(单文件 → 合并) |
| .isort.cfg | \`[tool.isort]\` | isort 配置 |
| pytest.ini | \`[tool.pytest.ini_options]\` | pytest 配置 |

迁移示例:

\`\`\`python
# 老时代:setup.py
from setuptools import setup, find_packages

setup(
    name="myproject",
    version="1.0.0",
    packages=find_packages(),
    install_requires=["fastapi>=0.110", "pydantic>=2.0"],
    extras_require={"dev": ["pytest>=8.0", "black>=24.0"]},
    entry_points={"console_scripts": ["myproject=myproject.main:app"]},
)
\`\`\`

迁移后:

\`\`\`toml
# 新时代:pyproject.toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myproject"
version = "1.0.0"
dependencies = ["fastapi>=0.110", "pydantic>=2.0"]

[project.optional-dependencies]
dev = ["pytest>=8.0", "black>=24.0"]

[project.scripts]
myproject = "myproject.main:app"
\`\`\`

> 迁移后可以删掉 \`setup.py\`、\`setup.cfg\`(只要 pyproject.toml 配置完整)。现代构建后端(hatchling、setuptools 61+、poetry、pdm)都支持读 pyproject.toml。

### pyproject.toml 的结构

\`\`\`toml
# pyproject.toml

# 1. 构建系统(必填,告诉 pip 怎么打包成 wheel/sdist)
# PEP 518 规定:requires 是构建所需的依赖,build-backend 是构建后端
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

# 2. 项目元数据(PEP 621 标准)
[project]
name = "myproject"          # 包名(PyPI 上的名字,只能小写+连字符)
version = "1.0.0"           # 语义化版本号
description = "示例项目"     # 一句话简介(PyPI 列表显示)
readme = "README.md"        # 长描述从哪个文件读
requires-python = ">=3.11"  # 支持的 Python 最低版本
authors = [{ name = "Your Name", email = "you@example.com" }]
# 运行时依赖(pip install myproject 会装的)
dependencies = [
    "fastapi>=0.110",
    "pydantic>=2.0",
    "typer>=0.12",
]

# 可选依赖(pip install myproject[dev] 会额外装的)
[project.optional-dependencies]
dev = [
    "pytest>=8.0",        # 测试框架
    "pytest-cov>=5.0",    # 覆盖率插件
    "black>=24.0",        # 格式化器
    "ruff>=0.6",          # linter + formatter
    "isort>=5.13",        # import 排序
    "mypy>=1.10",         # 类型检查
    "pre-commit>=3.7",    # git hook 管理
]

# 3. 命令行入口(pip install 后会生成可执行命令)
[project.scripts]
myproject = "myproject.main:app"  # 命令名 = "模块:对象"

# 4. 工具配置(每个工具一段 [tool.xxx])
[tool.black]
line-length = 88                # 行长度:用默认 88
target-version = ["py311"]      # 目标 Python 版本

[tool.ruff]
target-version = "py311"
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
ignore = ["E501"]               # 行长度交给 formatter

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]           # 测试允许 assert

[tool.isort]
profile = "black"               # 必须!与 black 兼容
known_first_party = ["myproject"]

[tool.pytest.ini_options]
testpaths = ["tests"]           # 测试目录
addopts = "-v --cov=myproject --cov-report=term-missing"

[tool.mypy]
python_version = "3.11"
strict = true                   # 严格模式(所有函数都要注解)
ignore_missing_imports = true   # 第三方库没类型存根时不报错

[tool.coverage.run]
source = ["myproject"]          # 统计覆盖率的包
omit = ["tests/*"]              # 不统计测试文件
\`\`\`

### 工具配置速查

| 工具 | 配置段 | 主要项 |
|---|---|---|
| black | [tool.black] | line-length, target-version |
| ruff | [tool.ruff] / [tool.ruff.lint] | target-version, select, ignore |
| isort | [tool.isort] | profile, known_first_party |
| pytest | [tool.pytest.ini_options] | testpaths, addopts |
| mypy | [tool.mypy] | python_version, strict |
| coverage | [tool.coverage.run] | source, omit |

## 四、编辑器集成

工具链集成不只是命令行,还要**编辑器**配合——保存时自动格式化,这是最舒服的开发体验。

### VS Code

安装 Python 扩展后,在 \`settings.json\` 配置:

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true
  },
  "python.formatting.provider": "none",
  "ruff.format": true,
  "ruff.lint": {
    "enable": true,
    "run": "onSave"
  }
}
\`\`\`

效果:保存文件时,ruff 自动格式化 + 修复问题。

### PyCharm

PyCharm 配置相对繁琐:

1. **Settings → Tools → Black**:配置 black 路径,勾选"On save"
2. **Settings → Tools → Ruff**:安装 Ruff 插件,配置路径
3. **Settings → Editor → Code Style**:可设为 4 空格、88 行长等

### 编辑器集成的价值

| 维度 | 无编辑器集成 | 有编辑器集成 |
|---|---|---|
| 格式化 | 手动跑命令 | 保存即格式化 |
| 反馈速度 | 提交时才发现 | 写代码时实时 |
| 开发体验 | 卡顿 | 流畅 |
| 心智负担 | 要记得跑 | 全自动 |

## 五、CI 集成:GitHub Actions

本地 pre-commit 是第一道防线,但**有人可能 --no-verify 跳过**。CI 是第二道防线——推送代码时再跑一遍,不合规就拒绝合并。

### GitHub Actions 示例

\`\`\`yaml
# .github/workflows/lint.yml
name: Lint

# 触发条件:推送到 main 或对 main 提 PR 时跑
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest  # 跑在 Ubuntu 最新版上
    steps:
      # 1. 拉代码
      - uses: actions/checkout@v4

      # 2. 装 Python(setup-python 会自动缓存 pip 依赖,加速 CI)
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"  # 启用 pip 缓存,二次 CI 提速明显

      # 3. 装工具(版本可写进 requirements-dev.txt,这里简化)
      - name: Install tools
        run: pip install black ruff isort

      # 4. 以下全部用 --check:CI 只检查不修改,要"通过/不通过"信号
      - name: Black check
        run: black --check .

      - name: Ruff check
        run: ruff check .

      - name: Ruff format check
        run: ruff format --check .

      - name: isort check
        run: isort --check-only --profile=black .
\`\`\`

注意 CI 里**全部用 --check**(只检查不修改),因为 CI 修改代码没意义,要的是"通过/不通过"的信号。

### CI 中的常用 --check 命令

| 工具 | CI 命令 |
|---|---|
| black | \`black --check .\` |
| ruff check | \`ruff check .\` |
| ruff format | \`ruff format --check .\` |
| isort | \`isort --check-only .\` |
| mypy | \`mypy .\` |
| pytest | \`pytest\` |

### pre-commit 在 CI 里跑

也可以在 CI 里直接跑 pre-commit(复用本地配置):

\`\`\`yaml
- name: Run pre-commit
  uses: pre-commit/action@v3.0.1
\`\`\`

这样本地和 CI 用同一份配置,不会出现"本地过 CI 不过"的尴尬。

## 六、Makefile / 任务脚本:统一命令入口

工具一多,命令就多(\`black .\`、\`ruff check .\`、\`pytest\`、\`mypy .\`...)。用 Makefile 统一入口,团队成员只要记住 \`make xxx\`:

\`\`\`makefile
# Makefile
# 注意:Makefile 的命令行必须用 Tab 缩进,不能用空格!
# 下面示例在文档里显示为 4 个空格,实际写的时候请替换成 1 个 Tab。
.PHONY: lint format test check install-hooks

# 检查(只读,不修改)— CI 也跑这套
lint:
	black --check .
	ruff check .
	isort --check-only --profile=black .
	mypy .

# 格式化(会修改文件)— 本地开发跑这套
format:
	black .
	ruff check --fix .
	ruff format .
	isort --profile=black .

# 跑测试
test:
	pytest

# 一键检查(format + lint + test)— 提交前跑一次
check: format lint test

# 安装 pre-commit hook
install-hooks:
	pre-commit install
\`\`\`

用法:

\`\`\`bash
make format    # 格式化
make lint      # 检查
make test      # 测试
make check     # 一键全跑
make install-hooks  # 装本地 hook
\`\`\`

> Makefile 的好处:统一团队命令,新人不用记十几个工具的参数。

## 七、代码 demo:完整项目的 pyproject.toml + .pre-commit-config.yaml

### 项目结构

\`\`\`bash
myproject/
├── .github/
│   └── workflows/
│       └── lint.yml
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── main.py
│       └── utils.py
├── tests/
│   └── test_main.py
├── .pre-commit-config.yaml
├── pyproject.toml
└── Makefile
\`\`\`

### pyproject.toml

\`\`\`toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myproject"
version = "1.0.0"
description = "工程化示例项目"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110",
    "pydantic>=2.0",
    "typer>=0.12",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=5.0",
    "black>=24.0",
    "ruff>=0.6",
    "isort>=5.13",
    "mypy>=1.10",
    "pre-commit>=3.7",
]

[project.scripts]
myproject = "myproject.main:app"

[tool.black]
line-length = 88
target-version = ["py311"]

[tool.ruff]
target-version = "py311"
line-length = 88
exclude = [".git", ".venv", "build", "dist", "migrations"]

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
ignore = ["E501", "B008"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]

[tool.ruff.lint.isort]
known-first-party = ["myproject"]

[tool.isort]
profile = "black"
known_first_party = ["myproject"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=myproject --cov-report=term-missing"

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true

[tool.coverage.run]
source = ["myproject"]
omit = ["tests/*"]
\`\`\`

### .pre-commit-config.yaml

\`\`\`yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 24.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: [--profile=black]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic>=2.0]
\`\`\`

### .github/workflows/lint.yml

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install black ruff isort mypy
      - run: black --check .
      - run: ruff check .
      - run: ruff format --check .
      - run: isort --check-only --profile=black .
      - run: mypy .

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -e ".[dev]"
      - run: pytest
\`\`\`

### Makefile

\`\`\`makefile
# 注意:命令行必须用 Tab 缩进(此处已用 Tab)
.PHONY: lint format test check install-hooks clean

# 只读检查,CI 复用
lint:
	black --check .
	ruff check .
	ruff format --check .
	isort --check-only --profile=black .
	mypy .

# 修改文件的格式化
format:
	black .
	ruff check --fix .
	ruff format .
	isort --profile=black .

# 跑测试
test:
	pytest

# 一键检查(不格式化,只 lint + test)
check: lint test

# 安装 git hook
install-hooks:
	pre-commit install
	pre-commit install --hook-type pre-push

# 清理缓存
clean:
	rm -rf build dist *.egg-info .pytest_cache .mypy_cache .ruff_cache
\`\`\`

## 八、工具链各工具的职责

| 工具 | 职责 | 何时运行 | 配置位置 |
|---|---|---|---|
| black | 格式化(外观) | 保存/提交/CI | [tool.black] |
| ruff check | 检查(质量) | 保存/提交/CI | [tool.ruff.lint] |
| ruff format | 格式化(外观) | 保存/提交/CI | [tool.ruff.format] |
| isort | import 排序 | 保存/提交/CI | [tool.isort] |
| mypy | 类型检查 | 提交/CI | [tool.mypy] |
| pytest | 测试 | 提交/CI | [tool.pytest] |
| pre-commit | 编排以上工具 | git commit 时 | .pre-commit-config.yaml |
| GitHub Actions | CI 兜底 | push/PR 时 | .github/workflows/ |

## 九、工具链的工作流程图

\`\`\`bash
# 完整的开发-提交-合并流程

# 1. 本地开发
# (编辑器保存时,ruff/black 自动格式化)

# 2. git add + git commit
# → pre-commit hook 触发
#    → black 格式化
#    → ruff check --fix
#    → ruff format
#    → isort
#    → mypy
# → 全部通过才允许提交

# 3. git push
# → GitHub Actions 触发
#    → black --check
#    → ruff check
#    → isort --check
#    → mypy
#    → pytest
# → 全部通过才能合并 PR
\`\`\`

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| pre-commit 没装 hook | 配了 yaml 但没 install | 克隆项目后跑 pre-commit install |
| pyproject.toml 缺 build-system | pip install -e . 失败 | 加 [build-system] 段 |
| CI 用 --fix 修改代码 | CI 修改了代码无意义 | CI 全部用 --check |
| 编辑器没配 format on save | 手动跑命令,体验差 | 配 formatOnSave: true |
| 本地和 CI 配置不一致 | 本地过 CI 不过 | CI 跑 pre-commit,复用配置 |
| 工具版本不锁 | black 24 和 25 格式不同 | pre-commit 配 rev 锁版本 |
| isort 和 ruff I 都启用 | 两个工具排 import 打架 | 二选一 |
| Makefile 缩进用空格 | make 报错 | Makefile 必须用 Tab |
| pre-commit 改了文件没 add | 提交被阻止,改的没进去 | hook 失败后 git add 再提交 |
| --no-verify 滥用 | 脏代码进仓库 | 紧急情况才用,事后补救 |
`,
  },

  // ============================================================
  // 第 6 章:工程化综合实战与全书总结
  // ============================================================
  {
    id: "pyeng-eng-summary",
    icon: "🎓",
    title: "工程化综合实战与全书总结",
    group: "格式化与工程化",
    content: `# 工程化综合实战与全书总结

## 一、综合实战:从零搭建工程化骨架

这一章把前面所有章节的知识串起来,从零搭建一个**完整的 Python 项目工程化骨架**。这个骨架包含:

- 项目结构(src layout)
- pyproject.toml(元数据 + 依赖 + 工具配置)
- 日志配置(logging)
- 配置加载(pydantic-settings + YAML)
- 命令行入口(typer)
- 测试套件(pytest + fixture + coverage)
- 格式化(black + ruff + isort)
- pre-commit hook
- CI(GitHub Actions)

最终目录结构:

\`\`\`bash
myproject/
├── .github/workflows/ci.yml
├── .pre-commit-config.yaml
├── Makefile
├── pyproject.toml
├── README.md
├── config/
│   └── config.yaml
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── __main__.py
│       ├── main.py
│       ├── config.py
│       ├── logger.py
│       └── core/
│           ├── __init__.py
│           └── user_service.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    └── test_user_service.py
\`\`\`

## 二、项目结构:src layout

现代 Python 项目推荐 **src layout**——把源码放在 \`src/\` 目录下:

\`\`\`bash
myproject/
├── src/
│   └── myproject/  # 包在这里
│       └── __init__.py
└── tests/
\`\`\`

对比传统的 flat layout:

| 维度 | src layout | flat layout |
|---|---|---|
| 结构 | src/myproject/ | myproject/ |
| 测试隔离 | 强(必须装包才能测) | 式(直接 import 当前目录) |
| 误 import | 不会 | 会(import 到本地源码而非装包) |
| 推荐度 | 新项目推荐 | 老项目/脚本可用 |

src layout 的好处:测试时**必须先 pip install -e .**,这能发现"打包遗漏"的问题(flat layout 不会,因为直接 import 当前目录)。

## 三、pyproject.toml:统一配置

\`\`\`toml
# pyproject.toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myproject"
version = "1.0.0"
description = "工程化示例项目"
readme = "README.md"
requires-python = ">=3.11"
authors = [{ name = "Your Name", email = "you@example.com" }]
dependencies = [
    "fastapi>=0.110",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "typer>=0.12",
    "pyyaml>=6.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=5.0",
    "black>=24.0",
    "ruff>=0.6",
    "isort>=5.13",
    "mypy>=1.10",
    "pre-commit>=3.7",
    "types-pyyaml>=6.0",  # mypy 检查 pyyaml 需要的类型存根
]

[project.scripts]
myproject = "myproject.main:app"

# 告诉 hatchling:源码在 src/myproject,打包时包含这个目录
[tool.hatch.build.targets.wheel]
packages = ["src/myproject"]

# ===== 工具配置 =====

[tool.black]
line-length = 88
target-version = ["py311"]

[tool.ruff]
target-version = "py311"
line-length = 88
src = ["src"]  # 告诉 ruff 哪些是项目源码(用于 first-party 判断)
exclude = [".git", ".venv", "build", "dist"]

[tool.ruff.lint]
# 注意:这里 select 包含 "I"(ruff 内置 isort)
# 如果同时用 isort 工具,会和 ruff I 打架 → 实际项目二选一
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]
ignore = ["E501", "B008"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]

[tool.ruff.lint.isort]
known-first-party = ["myproject"]

[tool.isort]
# 注意:如果上面 ruff select 里有 "I",这里 [tool.isort] 应删掉(二选一)
# 此处保留是为演示 isort 的配置写法,实际项目请按需二选一
profile = "black"
known_first_party = ["myproject"]
src_paths = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=myproject --cov-report=term-missing"
pythonpath = ["src"]  # 让 pytest 能直接 import src 下的包

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
plugins = ["pydantic.mypy"]  # pydantic 的 mypy 插件(增强类型推断)

[tool.coverage.run]
source = ["myproject"]
omit = ["tests/*"]
\`\`\`

## 四、日志配置(logger.py)

\`\`\`python
# src/myproject/logger.py
"""统一日志配置。"""
import logging
import sys
from pathlib import Path


def setup_logger(
    name: str = "myproject",
    level: int = logging.INFO,
    log_file: Path | None = None,
) -> logging.Logger:
    """配置并返回一个 logger。

    Args:
        name: logger 名字
        level: 日志级别
        log_file: 日志文件路径(可选)

    Returns:
        配置好的 Logger 对象
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # 避免重复添加 handler(多次调用时)
    if logger.handlers:
        return logger

    # 控制台 handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_format = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # 文件 handler(可选)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(level)
        file_format = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

    logger.propagate = False
    return logger
\`\`\`

## 五、配置加载(config.py)

\`\`\`python
# src/myproject/config.py
"""配置加载:pydantic-settings + YAML。"""
from pathlib import Path

import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseConfig(BaseModel):
    """数据库配置。"""
    host: str = "localhost"
    port: int = 5432
    user: str = "admin"
    password: str = ""
    name: str = "myproject"


class AppConfig(BaseModel):
    """应用配置。"""
    debug: bool = False
    database: DatabaseConfig = DatabaseConfig()


class Settings(BaseSettings):
    """全局配置,环境变量优先级高于 YAML。"""
    model_config = SettingsConfigDict(env_prefix="MYPROJECT_", env_nested_delimiter="__")

    app: AppConfig = AppConfig()

    @classmethod
    def from_yaml(cls, path: Path) -> "Settings":
        """从 YAML 文件加载配置。"""
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return cls(app=AppConfig(**data))
\`\`\`

配置文件示例:

\`\`\`yaml
# config/config.yaml
debug: true
database:
  host: localhost
  port: 5432
  user: admin
  password: secret
  name: myproject
\`\`\`

## 六、命令行入口(main.py)

\`\`\`python
# src/myproject/main.py
"""命令行入口:用 typer 暴露命令。"""
from pathlib import Path

import typer

from myproject.config import Settings
from myproject.core.user_service import UserService
from myproject.logger import setup_logger

app = typer.Typer(help="MyProject 命令行工具")


@app.command()
def greet(name: str = typer.Option("world", "--name", "-n", help="问候对象")):
    """问候命令。"""
    typer.echo(f"Hello, {name}!")


@app.command()
def create_user(
    name: str = typer.Option(..., "--name", "-n", help="用户名"),
    email: str = typer.Option(..., "--email", "-e", help="邮箱"),
    config: Path = typer.Option(Path("config/config.yaml"), "--config", "-c", help="配置文件"),
):
    """创建用户。"""
    settings = Settings.from_yaml(config)
    logger = setup_logger(log_file=Path("logs/app.log"))
    service = UserService(settings=settings, logger=logger)
    user = service.create(name=name, email=email)
    typer.echo(f"创建用户成功: {user}")


if __name__ == "__main__":
    app()
\`\`\`

## 七、业务逻辑(user_service.py)

\`\`\`python
# src/myproject/core/user_service.py
"""用户服务:业务逻辑示例。"""
from dataclasses import dataclass
from logging import Logger

from myproject.config import Settings


@dataclass
class User:
    """用户模型。"""
    id: int
    name: str
    email: str


class UserService:
    """用户服务。"""

    def __init__(self, settings: Settings, logger: Logger) -> None:
        self.settings = settings
        self.logger = logger
        self._next_id = 1

    def create(self, name: str, email: str) -> User:
        """创建用户。"""
        if not name:
            raise ValueError("name 不能为空")
        if "@" not in email:
            raise ValueError("email 格式不正确")

        user = User(id=self._next_id, name=name, email=email)
        self._next_id += 1
        self.logger.info("创建用户: %s", user)
        return user

    def get(self, user_id: int) -> User | None:
        """查询用户(示例:总是返回 None)。"""
        self.logger.debug("查询用户 id=%s", user_id)
        return None
\`\`\`

## 八、测试套件(tests/)

\`\`\`python
# tests/conftest.py
"""pytest fixture。"""
from pathlib import Path

import pytest

from myproject.config import Settings
from myproject.logger import setup_logger
from myproject.core.user_service import UserService


@pytest.fixture
def settings() -> Settings:
    return Settings.from_yaml(Path("config/config.yaml"))


@pytest.fixture
def logger() -> object:
    return setup_logger(level=10)  # DEBUG


@pytest.fixture
def user_service(settings, logger) -> UserService:
    return UserService(settings=settings, logger=logger)
\`\`\`

\`\`\`python
# tests/test_user_service.py
"""UserService 测试。"""
import pytest

from myproject.core.user_service import User, UserService


def test_create_user_success(user_service: UserService):
    user = user_service.create(name="张三", email="zs@example.com")
    assert isinstance(user, User)
    assert user.id == 1
    assert user.name == "张三"


def test_create_user_empty_name(user_service: UserService):
    with pytest.raises(ValueError, match="name"):
        user_service.create(name="", email="zs@example.com")


def test_create_user_invalid_email(user_service: UserService):
    with pytest.raises(ValueError, match="email"):
        user_service.create(name="张三", email="invalid")


def test_get_user_not_found(user_service: UserService):
    result = user_service.get(user_id=999)
    assert result is None
\`\`\`

## 九、格式化与 pre-commit

### .pre-commit-config.yaml

\`\`\`yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  - repo: https://github.com/psf/black
    rev: 24.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: [--profile=black]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic>=2.0, types-pyyaml>=6.0]
\`\`\`

## 十、CI(GitHub Actions)

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

# 触发:推 main 或对 main 提 PR
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 1. lint job:只跑静态检查(快,先跑)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"  # 缓存 pip,加速二次 CI
      - run: pip install black ruff isort mypy
      - run: black --check .             # 格式检查(不改文件)
      - run: ruff check .                # lint 检查(不改文件)
      - run: ruff format --check .       # format 检查(不改文件)
      - run: isort --check-only --profile=black .
      - run: mypy src                    # 类型检查

  # 2. test job:跑测试,用 matrix 在多版本 Python 上并行跑
  test:
    runs-on: ubuntu-latest
    strategy:
      # matrix 矩阵:每个 python-version 会起一个并行 job
      # 这样能验证代码在 3.11 和 3.12 上都能跑
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          # 注意:\${{ }} 是 GitHub Actions 表达式语法
          # 这里从 matrix 取当前 job 对应的 Python 版本
          python-version: \${{ matrix.python-version }}
          cache: "pip"
      - run: pip install -e ".[dev]"  # 安装项目 + dev 依赖(可选依赖)
      - run: pytest
\`\`\`

## 十一、本书五大主题回顾

本书从日志开始,经过配置、命令行、测试,最后到格式化,完整覆盖了 Python 工程化的五大主题。回顾一下每一篇的核心理念:

### 1. 日志:程序的"黑匣子"

| 主题 | 核心理念 |
|---|---|
| logging 模块 | 结构化记录,级别分明 |
| 关键点 | 用 logger 不要用 print;级别用对;结构化字段;轮转 + 文件 |

日志是排查问题的唯一线索。生产环境出 bug 时,日志就是"黑匣子"——没有日志,你只能盲猜。

### 2. 配置:把变的与不变分离

| 主题 | 核心理念 |
|---|---|
| yaml/toml/ini | 配置文件分离"变"与"不变" |
| pydantic-settings | 类型安全 + 环境变量 |
| 关键点 | 代码归代码,配置归配置;环境变量管部署差异 |

配置和代码分离,是工程化的基础纪律。改配置不应该改代码,改代码不应该影响配置。

### 3. 命令行:与用户交互的入口

| 主题 | 核心理念 |
|---|---|
| argparse/click/typer | 给程序一个友好的 CLI 入口 |
| 关键点 | 用类型注解(typer);子命令;--help 自动生成;退出码 |

命令行是程序和用户(包括运维)交互的入口。一个糟糕的 CLI 会让程序难以使用;一个优秀的 CLI 让程序像原生工具一样顺手。

### 4. 测试:重构的勇气来源

| 主题 | 核心理念 |
|---|---|
| unittest/pytest | 测试是"重构的勇气" |
| 关键点 | fixture 隔离;覆盖率不是目的;先写测试再重构 |

没有测试的代码是"遗产代码"——你不敢动它。有了测试,你才敢重构、敢升级、敢优化。测试是工程化的"安全网"。

### 5. 格式化:消除无谓争论

| 主题 | 核心理念 |
|---|---|
| black/ruff/isort | 工具说了算,人不用吵 |
| 关键点 | formatter + linter 都要;自动化(pre-commit + CI);配置进 pyproject.toml |

格式化是工程化的"礼仪"——它不改变逻辑,但让团队协作更顺畅。把争论交给工具,把精力留给逻辑。

## 十二、工程化的核心理念

贯穿本书的核心理念有三条:

### 1. 自动化 > 手动

凡是能自动的,绝不手动。格式化、检查、测试、发布——都让工具来做。手动不仅慢,还容易出错。

\`\`\`bash
# 反例:手动跑
black . && ruff check . && pytest && git add . && git commit

# 正例:pre-commit + CI 自动跑
git commit -m "feat: xxx"  # 其余全自动
\`\`\`

### 2. 约定 > 配置

能用约定解决的,不要堆配置。Black 的"不妥协"哲学就是极致的"约定"——默认值就是最佳实践,不要调。

\`\`\`toml
# 反例:什么都要配(老时代)
[tool.flake8]
max-line-length = 100
... (50 行配置)

# 正例:用默认(新时代)
[tool.black]
# 就这一段,啥都不配,用默认
\`\`\`

### 3. 简单 > 复杂

工具越少越好,配置越少越好。能用一个 ruff 解决的,不要用 flake8 + isort + pyupgrade 三个。

\`\`\`bash
# 反例:5 个工具
flake8 + pylint + autopep8 + isort + pyupgrade

# 正例:1 个工具
ruff (check + format)
\`\`\`

## 十三、进阶方向

本书覆盖的是 Python 工程化的"基础五件套"。再往下走,还有这些方向:

| 方向 | 工具 | 解决什么 |
|---|---|---|
| 类型检查 | mypy / pyright | 静态类型,提前发现 bug |
| 文档 | Sphinx / MkDocs | 自动生成项目文档 |
| 打包 | poetry / hatch / uv | 依赖管理 + 打包发布 |
| CI/CD | GitHub Actions / GitLab CI | 自动化构建/测试/发布 |
| 监控 | Sentry / Prometheus | 线上错误追踪 + 性能监控 |
| 容器化 | Docker / Podman | 环境一致性 |
| 代码质量 | SonarQube / CodeClimate | 复杂度/重复/漏洞分析 |

## 十四、本书工具速查表

| 主题 | 工具 | 一句话 |
|---|---|---|
| 日志 | logging | 标准库日志,结构化记录 |
| 日志增强 | structlog / loguru | 第三方日志库 |
| 配置 | pyyaml / tomli | 读 YAML/TOML |
| 配置 | pydantic-settings | 类型安全配置 |
| 命令行 | typer | 类型注解驱动 CLI |
| 命令行 | click | typer 的底层 |
| 测试 | pytest | 现代测试框架 |
| 测试 | pytest-cov | 覆盖率 |
| 格式化 | black | 不妥协 formatter |
| 格式化 | ruff | 极速 linter + formatter |
| 格式化 | isort | import 排序 |
| 类型 | mypy | 静态类型检查 |
| 类型 | pyright | 微软的类型检查器 |
| 集成 | pre-commit | Git hook 管理 |
| 集成 | pyproject.toml | 统一配置 |
| CI | GitHub Actions | 自动化流水线 |
| 打包 | hatch / poetry | 打包发布 |

## 十五、全书常见陷阱速查

| 陷阱 | 章节 | 后果 | 解决 |
|---|---|---|---|
| 用 print 不用 logger | 日志 | 生产无法排查 | 用 logging |
| 日志级别乱用 | 日志 | 日志噪音大 | INFO 正常,WARNING 异常,ERROR 错误 |
| 配置硬编码 | 配置 | 改配置要改代码 | 配置文件 + 环境变量 |
| 不分离环境配置 | 配置 | 测试连了生产库 | 环境变量管差异 |
| CLI 不带 --help | 命令行 | 用户不知道怎么用 | 用 typer,自动生成 |
| 不写测试 | 测试 | 不敢重构 | 至少写关键路径测试 |
| 测试依赖外部 | 测试 | 测试不稳定 | 用 fixture + mock |
| 只用 linter 不用 formatter | 格式化 | 代码还是乱的 | 两者都要 |
| 同时用多个 formatter | 格式化 | 互相打架 | 只用一个 |
| 不配 pre-commit | 集成 | 脏代码进仓库 | pre-commit install |
| CI 不跑检查 | 集成 | 兜底失效 | CI 跑 --check |
| 工具版本不锁 | 集成 | 升级后格式变 | 锁版本(pre-commit rev) |
| 不用 src layout | 结构 | 测试误 import | 用 src layout |
| 配置散落多文件 | 集成 | 难维护 | 统一 pyproject.toml |

## 十六、写在最后

工程化不是"用了一堆工具",而是**一套让团队高效协作的纪律**。工具会变(black 可能被 ruff 取代,poetry 可能被 uv 取代),但理念长存:

- **自动化**:让工具做工具该做的事
- **约定**:用默认值,减少无谓选择
- **简单**:少即是多
- **可维护**:写给人看,顺便给机器执行

希望这本书不只是教会你几个工具的用法,而是帮你建立**工程化思维**——这种思维在任何语言、任何项目里都受用。

> 工具会过时,工程化思维长存。祝你写出更可靠的 Python 代码。🎓
`,
  },
];
