// =============================================================
// Python vs Java 深度对比 —— 第 1 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-intro",
    icon: "🧭",
    title: "设计哲学：两种世界观",
    group: "概览与历史",
    content: `# 设计哲学：两种世界观

## 一、两门语言，两个世界

Python 和 Java，一个是脚本世界的"瑞士军刀"，一个是企业级开发的"重型装甲"。它们诞生于同一个年代（90 年代初），却走上了截然不同的道路。

Python 诞生于 1989 年的圣诞节假期，Guido van Rossum 在阿姆斯特丹的办公室里为了打发假期无聊，开始写一个"ABC 语言的继任者"。他的目标很明确：**一门让人用起来舒服、读起来像英语、适合教学和快速开发的语言**。

Java 诞生于 1991 年（当时叫 Oak），Sun 公司的 James Gosling 带领团队想为家用电器（机顶盒、电视）写一种"跨平台"的嵌入式语言。1995 年改名 Java， slogan 是 **"Write Once, Run Anywhere"（一次编写，到处运行）**。它的使命是：用虚拟机解决跨平台问题，用严格的面向对象和静态类型保证大型团队协作的代码质量。

这两门语言的出生背景，几乎决定了它们今天的一切。

| 维度 | Python | Java |
|------|--------|------|
| 诞生年份 | 1989（1991 正式发布） | 1991（1995 正式发布） |
| 创始人 | Guido van Rossum | James Gosling |
| 初始目标 | 系统脚本/教学/通用 | 家电嵌入式 → 企业级 |
| 设计优先级 | 可读性 > 一切 | 严谨/安全/跨平台 > 一切 |
| 类型系统 | 动态类型 | 静态类型 + 强类型 |
| 运行方式 | 解释执行（字节码） | 编译为字节码 + JVM 执行 |
| 命名来源 | Monty Python 喜剧团 | 咖啡（爪哇岛） |

## 二、Python 的核心设计哲学

Python 的设计哲学被浓缩在 **The Zen of Python**（PEP 20）里，输入 \`import this\` 就能看到。核心几条：

### 1. 可读性是第一公民

\`\`\`python
# Python：用缩进表示代码块，没有花括号
if score > 90:
    grade = "A"
    print("优秀")
else:
    grade = "B"
    print("良好")
\`\`\`

Guido 的信念是：**代码被阅读的次数远多于被编写的次数**。所以 Python 强制缩进，消除"代码风格之争"——你不必争论花括号放哪一行，因为根本没有花括号。

### 2. "应该有一种——最好只有一种——明显的方式来做这件事"

\`\`\`python
# Python：循环只有一种写法
for item in items:
    process(item)
\`\`\`

这种"统一"降低了团队协作的认知负担——所有人写的 Python 代码看起来都差不多。

### 3. 电池全含（Batteries Included）

Python 标准库极其丰富：\`os\`、\`sys\`、\`json\`、\`csv\`、\`sqlite3\`、\`urllib\`、\`asyncio\`、\`re\`、\`logging\`、\`unittest\`、\`pathlib\`……开箱即用，不装任何第三方包就能干很多事。

\`\`\`python
# 不装任何包，标准库就能发 HTTP 请求
import urllib.request
resp = urllib.request.urlopen("https://api.example.com/data")
print(resp.read().decode())
\`\`\`

Java 的标准库也很丰富，但更偏向"工程化"——\`java.util\`、\`java.io\`、\`java.net\`、\`java.concurrent\`，命名严谨但啰嗦。

### 4. 显式优于隐式

\`\`\`python
# Python：self 必须显式写出
class Dog:
    def bark(self):
        print(f"{self.name}: Woof!")
\`\`\`

Python 的 \`self\` 虽然啰嗦，但你永远知道"这个方法属于谁"。Java 则用隐式的 \`this\`（可省略），更简洁但有时让人困惑。

### 5. 务实主义：动态类型 + 鸭子类型

\`\`\`python
# Python 不关心你是什么类型，只关心你"能不能做这件事"
def make_sound(animal):
    animal.speak()  # 只要 animal 有 speak() 方法就行

class Dog:
    def speak(self): print("Woof")
class Cat:
    def speak(self): print("Meow")

make_sound(Dog())  # Woof
make_sound(Cat())  # Meow
\`\`\`

这种"鸭子类型"让 Python 极其灵活，但代价是：类型错误要到运行时才暴露。

## 三、Java 的核心设计哲学

Java 的哲学是被"企业级开发"的需求塑造的——大型团队、长期维护、跨平台部署。

### 1. 严谨至上：静态类型 + 编译期检查

\`\`\`java
// Java：类型在编译期就确定了
public class Dog {
    private String name;
    public Dog(String name) { this.name = name; }
    public void bark() { System.out.println(name + ": Woof!"); }
}

Dog d = new Dog("Rex");
d.bark();  // 编译期就知道 d 是 Dog 类型
\`\`\`

Java 的信念是：**能在编译期发现的错误，绝不留到运行时**。这让重构更安全、IDE 智能提示更强大，但代价是代码更啰嗦。

### 2. 万物皆对象（几乎）

Java 强制面向对象——所有代码必须在类里，所有方法必须在类里，连 \`main\` 都是类的静态方法。

\`\`\`java
// Java：最简单的程序也要写一个类
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

对比 Python：

\`\`\`python
# Python：一行就行
print("Hello, World!")
\`\`\`

这种"强制 OOP"在小型脚本里显得啰嗦，但在大型项目里强制了结构化思维。

### 3. 跨平台：Write Once, Run Anywhere

Java 的核心创新是 **JVM（Java Virtual Machine）**——源代码编译成字节码（.class），字节码在任何装了 JVM 的机器上都能跑。

\`\`\`
源码 .java → javac 编译 → 字节码 .class → JVM 执行
                                        ↑
                              Windows/Linux/macOS 都有 JVM
\`\`\`

Python 也有类似机制（.pyc 字节码 + CPython 虚拟机），但 Python 的"跨平台"更依赖源码层面——只要不同平台都装了 Python 解释器，.py 文件就能跑。

### 4. 显式错误处理：受检异常

Java 独创了**受检异常（Checked Exception）**——编译器强制你处理可能抛出的异常：

\`\`\`java
// Java：必须 try-catch 或 throws 声明
public void readFile(String path) throws IOException {
    BufferedReader reader = new BufferedReader(new FileReader(path));
    String line = reader.readLine();
    reader.close();
}
\`\`\`

Python 则用"鸭子式"异常处理——异常都是非受检的，你想处理就 try-except，不处理就让它冒泡：

\`\`\`python
# Python：异常处理是可选的
def read_file(path):
    with open(path) as f:
        return f.read()
# 你可以不 try-except，让异常自然传播
\`\`\`

受检异常是 Java 最具争议的设计—— supporters 认为它强制了健壮性，detractors 认为它是"噪音制造机"。

### 5. 垃圾回收：全自动，但不可控

Java 从第一天就内置了垃圾回收（GC），程序员不需要手动 \`free\` 内存。这让 Java 比 C/C++ 安全得多，但代价是 GC 暂停（Stop-The-World）可能影响延迟敏感的应用。

\`\`\`java
// Java：创建对象，不需要释放
List<String> list = new ArrayList<>();
list.add("a");
list.add("b");
// list 不用时，GC 会自动回收
\`\`\`

Python 也用 GC（引用计数为主 + 分代回收为辅），但机制完全不同——后面章节会详细对比。

## 四、哲学对比总结

| 哲学维度 | Python | Java |
|---------|--------|------|
| 核心信念 | 简洁、可读、灵活 | 严谨、安全、可维护 |
| 类型策略 | 动态类型，运行时检查 | 静态类型，编译期检查 |
| 代码组织 | 自由，脚本/函数/类混用 | 强制面向对象 |
| 错误处理 | 非受检异常，按需处理 | 受检异常，强制处理 |
| 跨平台 | 源码跨平台（依赖解释器） | 字节码跨平台（依赖 JVM） |
| 内存管理 | 引用计数 + GC | 纯 GC |
| 标准库 | 电池全含，开箱即用 | 工程化，命名严谨但啰嗦 |
| 学习曲线 | 平缓，几小时上手 | 陡峭，需要理解 OOP/类路径/JVM |

## 五、一句话概括

- **Python** 是一把瑞士军刀——轻便、灵活、什么都能干，适合快速解决问题。
- **Java** 是一套重型装甲——笨重、啰嗦，但穿上它你在战场上更安全。

两者没有绝对优劣，只有"场景适配"。后续章节会从语法、运行时、并发、生态各个维度，逐层拆解这两门语言的差异。

---

> **下一章**：我们将追溯 Python 和 Java 的演进史，看看它们如何从 90 年代的"新语言"变成今天的"巨头"。`,
  },
  {
    id: "pyvsjava-history",
    icon: "📜",
    title: "演进史：从 1991 到现在",
    group: "概览与历史",
    content: `# 演进史：从 1991 到现在

## 一、史前时代：两门语言的诞生

### Python：假期项目的意外之王

1989 年圣诞节，Guido van Rossum 在荷兰 CWI 研究所，假期无聊，想搞个"ABC 语言的继任者"。ABC 是 80 年代的教学语言，语法清晰但失败了——Guido 想保留 ABC 的可读性，同时加上 Unix 脚本能力、异常处理、模块系统。

1991 年 2 月，Python 0.9.0 发布——第一个公开版本。当时没人想到这个"假期项目"会改变世界。

\`\`\`
Python 版本时间线（简化）：
1991  Python 0.9.0   首次发布
1994  Python 1.0      函数式特性（lambda/map/filter）
2000  Python 2.0      列表推导式、垃圾回收、Unicode
2008  Python 3.0      不向后兼容的大重构（最大转折点）
2010  Python 2.7      2.x 系列最后一版（维护到 2020）
2018  Python 3.7      dataclass、async/await 稳定
2020  Python 3.9      字典合并运算符、类型提示泛型
2024  Python 3.13     GIL 可禁用（实验性）、JIT 编译器
\`\`\`

### Java：从家电到企业霸主

1991 年，Sun 公司的 James Gosling 团队启动"Green Project"，想为家电（机顶盒、PDA、电视）做一种跨平台语言，叫 **Oak**（橡树，因为 Gosling 办公室外有棵橡树）。

1994 年，互联网爆发，团队意识到 Oak 适合浏览器插件（Applet）。1995 年改名 **Java**（爪哇咖啡），slogan "Write Once, Run Anywhere" 横空出世。

\`\`\`
Java 版本时间线（简化）：
1996  Java 1.0       Applet 时代
2004  Java 5          泛型、注解、枚举（语法大升级）
2014  Java 8          Lambda、Stream、Optional（现代化转折点）
2017  Java 9          模块系统（Project Jigsaw）
2018  Java 11         LTS 版本，HTTP Client
2021  Java 17         LTS，密封类、记录类
2023  Java 21         LTS，虚拟线程（Project Loom）
2025  Java 25         LTS，模式匹配稳定
\`\`\`

## 二、关键转折点对比

### Python 3.0：壮士断腕（2008）

Python 2.x 有很多历史包袱：\`print\` 是语句不是函数、字符串默认 ASCII 不是 Unicode、整数除法返回整数（\`3/2 == 1\`）。Guido 决定在 Python 3.0 做不向后兼容的大重构。

这是一个极其痛苦的决定——Python 2 到 3 的迁移花了 **12 年**（2008-2020），大量项目卡在 2.7。但今天回头看，这是 Python 能活下去的关键——如果没有 3.0，Python 会被历史包袱拖死。

\`\`\`python
# Python 2
print "Hello"        # 语句
print 3 / 2          # 1（整数除法）

# Python 3
print("Hello")       # 函数
print(3 / 2)         # 1.5（真除法）
print(3 // 2)        # 1（地板除，显式）
\`\`\`

### Java 8：现代化的转折（2014）

Java 5（2004）引入泛型后，Java 沉寂了近 10 年——语法老旧，被 Scala、Groovy 嘲笑。Java 8 是救赎：Lambda 表达式、Stream API、Optional、新的日期时间 API。

\`\`\`java
// Java 7：匿名内部类，啰嗦
Collections.sort(list, new Comparator<String>() {
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Java 8：Lambda，简洁
list.sort((a, b) -> a.compareTo(b));

// Java 8：Stream API
list.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .forEach(System.out::println);
\`\`\`

Java 8 让 Java 重新"现代化"，挽救了大量要投奔 Scala/Kotlin 的开发者。

## 三、版本发布策略的转变

### Python：从"慢工出细活"到"年年发版"

Python 2 时代，版本间隔 8-9 年（1.0→2.0 用了 6 年，2.0→3.0 用了 8 年）。Python 3 之后改为 **每年一个版本**（3.7、3.8、3.9...），但每个版本只维护 5 年。

\`\`\`
Python 当前支持策略（PEP 602）：
- 每年 10 月发布新版本
- 每个版本维护 ~5 年（2 年 bugfix + 3 年安全修复）
- 3.13 是最新稳定版（2024.10）
\`\`\`

### Java：从"数年一版"到"半年一版"

Java 9 之后改为 **半年发一版**（3 月和 9 月），但只有 **LTS 版本**（Long Term Support）会被长期支持——Java 8、11、17、21、25 是 LTS。

\`\`\`
Java 当前发布策略（JEP 3）：
- 每年 3 月、9 月各发一版
- LTS 版本每 2 年一个（11、17、21、25）
- 非 LTS 版本只维护 6 个月
- 企业基本只用 LTS 版本
\`\`\`

## 四、治理模式对比

### Python：BDFL → 指导委员会

Python 长期是 **BDFL（终身仁慈独裁者）** 治理——Guido 一个人拍板所有 PEP（Python Enhancement Proposal）。2018 年 Guido 卸任，转为 **5 人指导委员会**（Steering Council），民主决策。

\`\`\`
Python 治理结构：
PEP（提案）→ 社区讨论 → 指导委员会表决 → 合并入主干
关键 PEP 例子：
- PEP 8     代码风格规范
- PEP 20    The Zen of Python
- PEP 484   类型提示
- PEP 572   海象运算符 :=（争议极大，Guido 用 BDFL 权力强制通过）
\`\`\`

### Java：JCP + JSR

Java 由 **JCP（Java Community Process）** 治理——任何人可以提交 JSR（Java Specification Request），通过 JCP 投票成为标准。Oracle 拥有 Java 商标和参考实现，但标准是开放的。

\`\`\`
Java 治理结构：
JSR（规范请求）→ JCP 专家组审议 → 公开投票 → 成为 JEP/JDK 一部分
关键 JSR 例子：
- JSR 335   Lambda 表达式（Java 8）
- JSR 376   模块系统（Java 9）
- JSR 441   模式匹配（Java 21）
\`\`\`

2017 年后，Oracle 把 JDK 开源（OpenJDK），但 Oracle JDK 商业版要收费——这导致 AWS Corretto、Eclipse Temurin、Azul Zulu 等替代 JDK 兴起。

## 五、生态演变：谁在用它们？

### Python 的爆发：数据科学 + AI

Python 在 2010 年代爆发，靠的不是语言本身，而是生态：

\`\`\`
2010s Python 爆发三浪：
1. NumPy/SciPy/Pandas → 数据科学霸主
2. TensorFlow/PyTorch → 深度学习霸主
3. ChatGPT/LLM → AI 时代默认语言
\`\`\`

今天 Python 是 **AI/数据科学领域的事实标准**——Google、Meta、OpenAI 的模型都是 Python 训练的。

### Java 的稳固：企业级霸主

Java 在 2000-2010 年代统治了企业后端——银行、电商、电信系统的核心几乎都是 Java。

\`\`\`
Java 企业级生态：
- Spring Framework → IoC/AOP 事实标准
- Spring Boot → 微服务神器
- Hadoop/Spark → 大数据（虽然 Spark 也支持 Scala/Python）
- Kafka → 消息队列（JVM 生态）
- Elasticsearch → 搜索引擎（JVM 生态）
\`\`\`

虽然 Python 在 AI 领域称王，但 Java 仍然是 **企业级后端的霸主**——尤其是在金融、电商领域。

## 六、今日地位：TIOBE 与 Stack Overflow

\`\`\`
2024-2025 编程语言排名（TIOBE/Stack Overflow 调研）：
- Python     #1（AI 加持，持续上升）
- Java       #3-4（被 C++ 超过，但企业基本盘稳）
- JavaScript #2-3（前端垄断）
- C/C++      #2-3（系统级）
\`\`\`

Python 的增长主要来自 AI/数据科学新人，Java 的稳定主要来自企业存量代码。两者都在"前线"，但服务的人群不同。

## 七、未来趋势

### Python 的挑战

- **性能**：CPython 慢，3.13 引入实验性 JIT 和"可禁用 GIL"，但仍不够
- **类型系统**：类型提示是"可选的"，导致大型项目类型不一致
- **部署**：依赖管理（pip/conda/poetry/uv）混乱，比 Java 的 Maven/Gradle 复杂

### Java 的挑战

- **冗长**：即使 Java 8 后改进，仍然比 Python/Kotlin 啰嗦
- **启动慢**：JVM 启动时间影响 Serverless 场景（GraalVM Native Image 在解决）
- **AI 边缘化**：AI 生态几乎被 Python 垄断，Java 在 AI 领域几乎没有存在感
- **Kotlin 冲击**：Android 开发官方推荐 Kotlin，Java 在移动端份额下降

## 八、一句话总结历史

- **Python**：从"假期项目"到"AI 时代默认语言"，靠的是生态和易用性，不是语言本身。
- **Java**：从"家电语言"到"企业霸主"，靠的是跨平台和严谨工程化，但被 AI 时代绕过。

两门语言都在"中年"，都面临挑战，但短期内都不会死——因为它们各自的护城河太深了。

---

> **下一章**：我们将看看 Python 和 Java 在哪些领域称王，哪些领域是它们的盲区。`,
  },
  {
    id: "pyvsjava-landscape",
    icon: "🗺️",
    title: "应用版图：谁在哪里称王",
    group: "概览与历史",
    content: `# 应用版图：谁在哪里称王

## 一、应用领域全景图

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    应用领域全景                          │
├──────────────┬──────────────────┬───────────────────────┤
│    领域      │     Python       │       Java            │
├──────────────┼──────────────────┼───────────────────────┤
│ AI/机器学习  │  🏆 绝对霸主     │  ❌ 几乎无存在感      │
│ 数据科学     │  🏆 绝对霸主     │  ⚠️ 仅大数据处理     │
│ Web 后端     │  ⚠️ 中小型项目   │  🏆 企业级霸主        │
│ 企业级系统   │  ⚠️ 较少         │  🏆 绝对霸主          │
│ 自动化脚本   │  🏆 绝对霸主     │  ❌ 不适合             │
│ 移动开发     │  ❌ 几乎没有     │  ⚠️ Android(被Kotlin) │
│ 游戏开发     │  ❌ 不适合       │  ❌ 不适合(C++为主)   │
│ 系统编程     │  ❌ 不适合       │  ⚠️ 部分场景          │
│ 大数据       │  ⚠️ Spark Py     │  🏆 Hadoop/Spark原生  │
│ 桌面应用     │  ⚠️ PyQt/Tkinter │  ⚠️ JavaFX(衰退)      │
│ 嵌入式/IoT   │  ⚠️ MicroPython  │  ⚠️ 较少              │
└──────────────┴──────────────────┴───────────────────────┘
\`\`\`

## 二、Python 称王的领域

### 1. AI / 机器学习 / 深度学习 🏆

这是 Python 最稳固的护城河。所有主流深度学习框架都以 Python 为主接口：

\`\`\`python
# PyTorch 训练一个模型（Python 是第一公民）
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10)
)
optimizer = torch.optim.Adam(model.parameters())
loss_fn = nn.CrossEntropyLoss()

for epoch in range(10):
    for x, y in dataloader:
        pred = model(x)
        loss = loss_fn(pred, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
\`\`\`

**为什么 Python 赢了？**
- **C/Fortran 后端 + Python 前端**：NumPy/TensorFlow 的底层是 C++/CUDA，Python 只是"胶水"
- **研究者友好**：研究员不想学 Java 的类路径/Maven，Python 几行就能跑实验
- **生态飞轮**：模型用 Python 写 → 论文用 Python 复现 → 新人学 Python → 框架优先支持 Python

**Java 在 AI 领域的尴尬**：
- Deeplearning4j 存在但用户极少
- Google 的 TensorFlow Java API 是"二等公民"
- 研究员根本不用 Java

### 2. 数据科学 / 数据分析 🏆

\`\`\`python
# Pandas 数据分析（Python 标配）
import pandas as pd

df = pd.read_csv("sales.csv")
result = (df[df["year"] == 2024]
          .groupby("region")
          .agg({"revenue": "sum", "orders": "count"})
          .sort_values("revenue", ascending=False))
print(result)
\`\`\`

Pandas、NumPy、Matplotlib、Jupyter Notebook 构成了数据科学的"标准工作流"。Java 在这个领域几乎没有对标产品——虽然 Apache Spark 有 Java API，但没人用 Java 写 Spark 任务，大家都用 PySpark 或 Scala。

### 3. 自动化脚本 / 运维 / 爬虫 🏆

\`\`\`python
# 10 行写个爬虫
import requests
from bs4 import BeautifulSoup

resp = requests.get("https://news.ycombinator.com")
soup = BeautifulSoup(resp.text, "html.parser")
for item in soup.select(".titleline > a"):
    print(item.text, item["href"])
\`\`\`

Python 是系统管理员的"瑞士军刀"——运维脚本、定时任务、ETL 管道、爬虫，Python 几乎是默认选择。Java 在这个领域完全不合适——写个脚本还要建项目、配 Maven、定义类，太重了。

### 4. 中小型 Web 后端

\`\`\`python
# FastAPI 写个 API（极简）
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "Alice"}
\`\`\`

Django（重型框架）、Flask（微型框架）、FastAPI（现代异步）让 Python 在中小型 Web 后端有一席之地。但在**大型企业级 Web 后端**，Java 是霸主。

## 三、Java 称王的领域

### 1. 企业级后端系统 🏆

银行、电商、电信、保险——这些行业的核心系统几乎都是 Java。

\`\`\`java
// Spring Boot 写个 REST API（Java 标配）
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return user != null ? ResponseEntity.ok(user)
                            : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid UserDTO dto) {
        User created = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
\`\`\`

**为什么 Java 在企业级赢？**
- **静态类型**：编译期捕获错误，重构安全
- **Spring 生态**：IoC/AOP/事务/安全/ORM 一站式解决方案
- **JVM 性能**：JIT 优化后接近 C++，长期运行的服务端应用受益
- **工具链**：Maven/Gradle + IntelliJ + Jenkins，企业级 DevOps 成熟
- **人才市场**：Java 程序员多，好招人，好替换

### 2. 大数据生态 🏆

Hadoop、Spark、Kafka、Flink、Elasticsearch——这些大数据组件**本身都是 JVM 语言写的**（Java 或 Scala）。

\`\`\`java
// Flink 流处理（Java/Scala 是第一公民）
DataStream<Event> events = env
    .addSource(new FlinkKafkaConsumer<>("events", new EventSchema(), props))
    .keyBy(Event::getKey)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new CountAggregator());
\`\`\`

虽然 Spark 支持 PySpark，但底层是 JVM，PySpark 只是"远程调用"。在**性能敏感的大数据场景**，Java/Scala 是首选。

### 3. Android 移动开发 ⚠️（被 Kotlin 蚕食）

Android 曾经是 Java 的领地，但 2017 年 Google 官方推荐 Kotlin。今天新项目大多用 Kotlin，但 Java 仍然是 Android 的"母语"（Kotlin 也跑在 JVM 上）。

### 4. 分布式系统 / 微服务 🏆

\`\`\`java
// Spring Cloud 微服务（Java 标配）
@SpringBootApplication
@EnableDiscoveryClient
@EnableCircuitBreaker
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

@FeignClient(name = "inventory-service")
public interface InventoryClient {
    @PostMapping("/deduct")
    InventoryResponse deduct(@RequestBody DeductRequest req);
}
\`\`\`

Spring Cloud、Dubbo、gRPC-Java 构成了 Java 微服务的"全家桶"。Python 也有微服务框架（Nameko、FastAPI），但生态远不如 Java 成熟。

## 四、Python 的盲区

### 1. 大型团队协作

Python 的动态类型在大型项目里是负担——重构时 IDE 无法精确追踪类型，类型错误要到运行时才暴露。虽然有 \`mypy\` 类型检查，但它是"可选的"，强制不了全团队。

\`\`\`python
# Python：这个函数返回什么？不运行不知道
def process(data):
    result = []
    for item in data:
        if item.is_valid():
            result.append(transform(item))
    return result  # 返回 list? 还是别的?
\`\`\`

### 2. 高性能计算

CPython 解释执行，比 Java 慢 10-100 倍。虽然 NumPy 的底层是 C，但"纯 Python 代码"很慢。

### 3. 移动端

Python 在移动端几乎没有存在感——Kivy、BeeWare 等框架存在但用户极少。

## 五、Java 的盲区

### 1. AI / 数据科学

Java 在 AI 领域几乎没有生态。即使想用 Java 调用 TensorFlow，API 也是"二等公民"，文档少、更新慢。

### 2. 快速原型 / 脚本

Java 写个"读 CSV 算总和"的脚本，要建项目、配 Maven、定义类、写 main 方法，太重了：

\`\`\`java
// Java：读 CSV 算总和（啰嗦）
public class CsvSum {
    public static void main(String[] args) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader("data.csv"))) {
            String line;
            double sum = 0;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                sum += Double.parseDouble(parts[1]);
            }
            System.out.println("Sum: " + sum);
        }
    }
}
\`\`\`

\`\`\`python
# Python：同样的事，3 行
import csv
with open("data.csv") as f:
    total = sum(float(row[1]) for row in csv.reader(f))
print(f"Sum: {total}")
\`\`\`

### 3. 前端

Java Applet 已死，JavaFX 桌面端衰退，前端是 JavaScript/TypeScript 的天下。

## 六、薪资与就业市场

\`\`\`
2024-2025 全球开发者薪资（Levels.fyi / 拉勾 数据）：
- Python（AI/数据方向）：$120K-$200K（美国）/ 30K-60K（中国月薪）
- Python（Web 方向）：  $80K-$140K（美国）/ 20K-40K（中国月薪）
- Java（企业后端）：    $100K-$160K（美国）/ 20K-50K（中国月薪）
- Java（大数据方向）：  $120K-$180K（美国）/ 30K-55K（中国月薪）

观察：
- Python 薪资分化大——AI 方向 > Web 方向
- Java 薪资稳定，企业级需求持续
- 两者在大厂薪资接近，差异在"方向"
\`\`\`

## 七、选型决策：场景 → 语言

| 场景 | 推荐 | 原因 |
|------|------|------|
| 训练 AI 模型 | Python | PyTorch/TensorFlow 生态 |
| 数据分析/可视化 | Python | Pandas/Matplotlib 生态 |
| 写自动化脚本 | Python | 简洁，标准库强 |
| 银行/金融核心系统 | Java | 严谨、性能、生态 |
| 大型电商后端 | Java | Spring 生态、性能 |
| 实时流处理 | Java/Scala | Flink/Spark 原生 |
| 微服务架构 | Java | Spring Cloud 全家桶 |
| 创业公司 MVP | Python | 开发快 |
| 数据工程 ETL | Python(小) / Java(大) | 看数据规模 |
| 运维/DevOps 脚本 | Python | Bash 之外首选 |

## 八、一句话总结

- **Python 是"探索者的语言"**——适合快速验证想法、做实验、处理数据。
- **Java 是"工程师的语言"**——适合构建大型、长期、团队协作的系统。

它们不是竞争关系，而是**互补关系**——很多公司用 Java 写后端，用 Python 做 AI/数据分析，两者共存。

---

> **下一章**：开始进入语法层面，先看最直观的差异——代码组织方式（缩进 vs 花括号）。`,
  },
  {
    id: "pyvsjava-code-style",
    icon: "📐",
    title: "代码组织：缩进 vs 花括号",
    group: "语法与类型",
    content: `# 代码组织：缩进 vs 花括号

## 一、最直观的差异：代码块怎么表示

这是 Python 和 Java 最显眼的语法差异——**Python 用缩进，Java 用花括号**。

\`\`\`python
# Python：缩进表示代码块
if score > 90:
    grade = "A"
    print("优秀")
    send_email(parent)
\`\`\`

\`\`\`java
// Java：花括号表示代码块
if (score > 90) {
    grade = "A";
    System.out.println("优秀");
    sendEmail(parent);
}
\`\`\`

这个差异看似只是"语法糖"，但它深刻影响了两门语言的**编码体验**和**代码风格**。

## 二、Python 的缩进哲学

### 1. 强制缩进 = 强制可读性

Python 用缩进（4 个空格，PEP 8 规定）表示代码块的层级。**缩进错了，程序就跑不了**：

\`\`\`python
# 错误：缩进不一致
def foo():
    x = 1
      y = 2  # IndentationError: unexpected indent
\`\`\`

这种"强制"的好处是：**所有 Python 代码看起来都差不多**——你不会看到有人把花括号放新行，有人放同行。

### 2. 没有花括号，但有冒号

Python 的代码块以冒号 \`:\` 开始，缩进结束即代码块结束：

\`\`\`python
if x > 0:           # 冒号开始
    do_a()          # 4 空格缩进 = 在 if 内
    do_b()
print("done")       # 0 缩进 = 在 if 外
\`\`\`

### 3. 缩进的陷阱

\`\`\`python
# 陷阱1：Tab 和空格混用（Python 3 报错）
def foo():
\tx = 1              # Tab
    y = 2            # 4 空格 → TabError

# 陷阱2：复制粘贴导致缩进错乱
def bar():
    if True:
        a = 1
        b = 2
    # 复制粘贴时容易把缩进弄错
\`\`\`

**最佳实践**：编辑器设置为"Tab 自动转 4 空格"，永远不要用真实 Tab。

## 三、Java 的花括号哲学

### 1. 花括号 = 显式边界

Java 用 \`{\` 和 \`}\` 明确代码块边界，缩进只是"视觉美化"，不影响逻辑：

\`\`\`java
// 这样写能跑，但会被同事打
if (score > 90) { grade = "A"; System.out.println("优秀"); sendEmail(parent); }
\`\`\`

### 2. 花括号位置之争

Java 有两大流派：

\`\`\`java
// 流派1：K&R 风格（花括号跟在同行）—— Java 官方惯例
if (score > 90) {
    grade = "A";
}

// 流派2：Allman 风格（花括号独占一行）—— C/C++ 惯例
if (score > 90)
{
    grade = "A";
}
\`\`\`

Python 没有这个争论——因为没有花括号。

### 3. 花括号可省略（但不推荐）

单行语句可以省略花括号：

\`\`\`java
// 能省略，但容易出 bug
if (score > 90)
    grade = "A";
    sendEmail(parent);  // 这行不在 if 内！缩进骗了你

// 推荐写法：永远加花括号
if (score > 90) {
    grade = "A";
    sendEmail(parent);
}
\`\`\`

著名的 **Apple goto fail bug**（2014 年 SSL 漏洞）就是省略花括号导致的：

\`\`\`c
// Apple 的 bug（C 语言，但道理一样）
if (err = SSLHashSHA1.update(&hashCtx, &signedParams))
    goto fail;
    goto fail;  // 这行无条件执行！缩进骗了所有人
\`\`\`

## 四、语句终止：换行 vs 分号

### Python：换行即语句结束

\`\`\`python
# Python：换行结束语句
x = 1
y = 2
print(x + y)
\`\`\`

分号可选（但 PEP 8 不推荐）：

\`\`\`python
# 能这么写，但别这么写
x = 1; y = 2; print(x + y)
\`\`\`

一行太长怎么办？用反斜杠或括号续行：

\`\`\`python
# 方式1：反斜杠续行
total = a + b + \\
        c + d

# 方式2：括号续行（推荐）
total = (a + b +
         c + d)
\`\`\`

### Java：分号结束语句

\`\`\`java
// Java：分号结束语句
int x = 1;
int y = 2;
System.out.println(x + y);
\`\`\`

一行可写多条语句（但不推荐）：

\`\`\`java
int x = 1; int y = 2; System.out.println(x + y);
\`\`\`

一行太长？随便换行，分号才决定结束：

\`\`\`java
// Java 续行自由
int total = a + b +
            c + d;
String query = "SELECT * FROM users " +
               "WHERE age > 18 " +
               "ORDER BY name";
\`\`\`

## 五、空语句 / pass 块

### Python：\`pass\` 表示"什么都不做"

\`\`\`python
# Python：空代码块必须写 pass，否则语法错误
class EmptyClass:
    pass

def not_implemented():
    pass

if x > 0:
    pass  # TODO: 后面实现
\`\`\`

\`pass\` 是"占位符"，因为 Python 靠缩进判断代码块，空块会报错。

### Java：\`{\` \`}\` 即空块

\`\`\`java
// Java：空花括号就是空块
public class EmptyClass {}

public void notImplemented() {}

if (x > 0) {
    // TODO: 后面实现
}
\`\`\`

或者直接分号：

\`\`\`java
if (x > 0);  // 空语句，但这是 bug 温床
\`\`\`

## 六、注释对比

### Python 注释

\`\`\`python
# 单行注释（井号）

"""
多行注释（其实是字符串字面量，
被当作 docstring）
"""

def foo():
    """这是函数的 docstring"""
    pass
\`\`\`

### Java 注释

\`\`\`java
// 单行注释

/* 多行注释（C 风格） */

/**
 * Javadoc 注释（用于生成 API 文档）
 * @param name 名字
 * @return 问候语
 */
public String greet(String name) {
    return "Hello, " + name;
}
\`\`\`

Java 的 Javadoc 是"强规范"——IDE 会提示你写 \`@param\` \`@return\`，并能生成 HTML 文档。Python 的 docstring 更自由（PEP 257 规定但不强制）。

## 七、代码风格规范

### Python：PEP 8

\`\`\`
PEP 8 核心规则：
- 缩进：4 空格
- 行长：79 字符（注释 72）
- 命名：snake_case（函数/变量）、PascalCase（类）、UPPER_CASE（常量）
- 导入：每行一个 import
- 空行：函数间 2 行，方法间 1 行
\`\`\`

工具：\`black\`（格式化）、\`flake8\`（检查）、\`isort\`（import 排序）

### Java：Google Java Style / Oracle

\`\`\`
Java 风格核心规则：
- 缩进：2 或 4 空格（Google 用 2，Oracle 用 4）
- 行长：100 或 120 字符
- 命名：camelCase（方法/变量）、PascalCase（类）、UPPER_CASE（常量）
- 花括号：K&R 风格（同行）
- 空行：方法间 1 行
\`\`\`

工具：\`google-java-format\`、\`checkstyle\`、SpotBugs

## 八、命名约定对比

| 元素 | Python | Java |
|------|--------|------|
| 变量/函数 | \`snake_case\` | \`camelCase\` |
| 类 | \`PascalCase\` | \`PascalCase\` |
| 常量 | \`UPPER_CASE\` | \`UPPER_CASE\` |
| 私有成员 | \`_name\`（约定） | \`name\`（private 关键字） |
| 特殊方法 | \`__init__\`、\`__str__\` | 无对应概念 |
| 包/模块 | \`lowercase\` | \`lowercase\` |

\`\`\`python
# Python 命名
class UserProfile:           # PascalCase
    def get_full_name(self): # snake_case
        return self._name    # _前缀表示"私有"（约定）

MAX_RETRIES = 3              # UPPER_CASE
\`\`\`

\`\`\`java
// Java 命名
public class UserProfile {           // PascalCase
    public String getFullName() {    // camelCase
        return this.name;            // private 字段
    }
    private static final int MAX_RETRIES = 3;  // UPPER_CASE
}
\`\`\`

## 九、代码密度对比

同样的逻辑，Python 比 Java 简洁 2-5 倍：

\`\`\`python
# Python：读取 JSON 文件并打印
import json
with open("data.json") as f:
    data = json.load(f)
print(data["name"])
\`\`\`

\`\`\`java
// Java：同样的事
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(new File("data.json"), Map.class);
        System.out.println(data.get("name"));
    }
}
\`\`\`

Java 的"啰嗦"来自：
1. **必须定义类**（Python 可以直接写函数）
2. **必须声明类型**（\`Map<String, Object>\`）
3. **必须处理异常**（\`throws Exception\`）
4. **导入更冗长**（\`com.fasterxml...\`）

## 十、一句话总结

- **Python**：强制缩进 + 简洁语法，让代码"自带可读性"，代价是复制粘贴易错、Tab/空格混用坑。
- **Java**：花括号 + 分号，语法冗长但显式，代码边界清晰，适合大型团队协作。

---

> **下一章**：继续语法层面，看变量声明与作用域——Python 的"动态绑定" vs Java 的"声明即类型"。`,
  },
  {
    id: "pyvsjava-variables",
    icon: "📦",
    title: "变量声明与作用域",
    group: "语法与类型",
    content: `# 变量声明与作用域

## 一、变量声明：绑定 vs 声明

这是 Python 和 Java 在"变量"概念上的根本分歧。

### Python：变量是"标签"

Python 没有"声明变量"这回事——**变量是给对象贴的标签**。赋值就是"把标签贴到对象上"：

\`\`\`python
# Python：x 是标签，[1,2,3] 是对象
x = [1, 2, 3]     # 把标签 x 贴到列表对象
y = x             # 把标签 y 也贴到同一个列表
y.append(4)       # 修改列表对象
print(x)          # [1, 2, 3, 4] —— x 也变了！因为是同一个对象
\`\`\`

变量没有类型，**对象才有类型**：

\`\`\`python
x = 1             # x 贴到 int 对象
x = "hello"       # x 重新贴到 str 对象（完全合法）
x = [1, 2]        # x 又贴到 list 对象
\`\`\`

### Java：变量是"容器"

Java 的变量是"有类型的容器"——声明时必须指定类型，只能装对应类型的数据：

\`\`\`java
// Java：变量是容器，有固定类型
int x = 1;           // x 是 int 容器，装 1
String s = "hello";  // s 是 String 容器，装 "hello"
x = "hello";         // 编译错误！int 容器不能装 String

// 引用类型：变量存的是"引用"
int[] arr1 = {1, 2, 3};   // arr1 存指向数组的引用
int[] arr2 = arr1;         // arr2 复制引用，指向同一数组
arr2[0] = 99;
System.out.println(arr1[0]); // 99 —— 同一对象
\`\`\`

## 二、声明语法对比

### Python：直接赋值

\`\`\`python
# Python：直接赋值即声明
name = "Alice"
age = 30
scores = [90, 85, 88]
\`\`\`

无需类型声明，无需关键字。

### Java：类型 + 变量名

\`\`\`java
// Java：必须声明类型
String name = "Alice";
int age = 30;
int[] scores = {90, 85, 88};

// 也可先声明后赋值
int age;
age = 30;
\`\`\`

Java 10 引入 \`var\`（局部变量类型推断），让 Java 有了"类似 Python"的简洁：

\`\`\`java
// Java 10+：var 推断类型（仍然是静态类型！）
var name = "Alice";    // 编译器推断为 String
var age = 30;          // 编译器推断为 int
var scores = new int[]{90, 85, 88};  // 推断为 int[]

name = 123;  // 编译错误！name 是 String，不能装 int
\`\`\`

**关键区别**：Java 的 \`var\` 是**编译期推断**，类型一旦确定就变了；Python 是**运行时动态**，可以随便换类型。

## 三、多重赋值

### Python：原生支持

\`\`\`python
# Python：多重赋值（元组解包）
a, b, c = 1, 2, 3

# 交换变量（无需临时变量）
a, b = b, a

# 解包列表/元组
x, y, z = [10, 20, 30]

# 星号收集
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2,3,4]
\`\`\`

### Java：没有原生多重赋值

\`\`\`java
// Java：只能逐个赋值
int a = 1, b = 2, c = 3;

// 交换需要临时变量
int temp = a;
a = b;
b = temp;

// Java 没有解包语法，只能手动
int[] arr = {10, 20, 30};
int x = arr[0], y = arr[1], z = arr[2];
\`\`\`

## 四、常量

### Python：没有真正的常量

\`\`\`python
# Python：全靠约定，UPPER_CASE 表示常量
MAX_RETRIES = 3
MAX_RETRIES = 5  # 能改！Python 不会阻止你

# 要真正"不可变"，用类属性 + property，或者用 dataclass(frozen=True)
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    max_retries: int = 3
\`\`\`

### Java：\`final\` 关键字

\`\`\`java
// Java：final 表示不可变
public static final int MAX_RETRIES = 3;
MAX_RETRIES = 5;  // 编译错误！

// final 修饰引用类型：引用不可变，但对象内容可变
final List<String> list = new ArrayList<>();
list.add("a");      // 能改内容
list = new ArrayList<>();  // 编译错误！引用不可变
\`\`\`

## 五、作用域对比

### Python：函数作用域 + LEGB 规则

Python 的作用域遵循 **LEGB 规则**：

\`\`\`
L - Local       局部（函数内）
E - Enclosing   嵌套函数的外层
G - Global      模块全局
B - Built-in    内置（print/len/range...）
\`\`\`

\`\`\`python
# Python LEGB 示例
x = "global"  # G

def outer():
    x = "enclosing"  # E

    def inner():
        x = "local"  # L
        print(x)     # local

    inner()
    print(x)         # enclosing

outer()
print(x)             # global

# 查找顺序：L → E → G → B
print(len)  # B（内置函数 len）
\`\`\`

**Python 没有块级作用域**——\`if\`、\`for\`、\`while\` 块内的变量在外面也能访问：

\`\`\`python
# Python：for 循环变量"泄漏"到外层
for i in range(3):
    pass
print(i)  # 2 —— i 在循环外仍可访问！

# if 块内的变量也"泄漏"
if True:
    leaked = "我泄漏了"
print(leaked)  # 我泄漏了
\`\`\`

### Java：块级作用域

Java 有严格的**块级作用域**——\`{\` \`}\` 内的变量外面访问不到：

\`\`\`java
// Java：块级作用域
public void foo() {
    if (true) {
        int x = 10;
    }
    // System.out.println(x);  // 编译错误！x 不存在
}
\`\`\`

Java 的作用域层级：

\`\`\`
- 类作用域      （成员变量）
  - 方法作用域   （局部变量）
    - 块作用域   （if/for/while 内）
      - 块作用域 （嵌套块）
\`\`\`

\`\`\`java
public class Scope {
    static int global = 10;  // 类作用域（类似 Python 的模块全局）

    public void method() {
        int local = 20;  // 方法作用域

        if (true) {
            int blockVar = 30;  // 块作用域
            System.out.println(global);  // 10
            System.out.println(local);   // 20
        }
        // System.out.println(blockVar);  // 编译错误！
    }
}
\`\`\`

## 六、global 和 nonlocal vs 类成员

### Python：global / nonlocal 显式声明

\`\`\`python
# Python：在函数内修改全局变量
counter = 0

def increment():
    global counter  # 声明我要用全局的 counter
    counter += 1

increment()
print(counter)  # 1

# nonlocal：修改嵌套函数的外层变量
def make_counter():
    count = 0
    def inner():
        nonlocal count  # 修改外层的 count
        count += 1
        return count
    return inner

c = make_counter()
print(c(), c(), c())  # 1 2 3
\`\`\`

### Java：类成员直接访问

\`\`\`java
// Java：类成员用 this/类名 访问
public class Counter {
    private static int globalCounter = 0;  // 静态成员
    private int instanceCounter = 0;       // 实例成员

    public void increment() {
        globalCounter++;      // 直接访问静态成员
        this.instanceCounter++;  // this 可省略
    }
}
\`\`\`

Java 没有 \`global\` 关键字——"全局"就是类的 \`static\` 成员。

## 七、变量提升（Hoisting）

### Python：无提升

\`\`\`python
# Python：变量在赋值前不可用
def foo():
    print(x)  # UnboundLocalError! x 还没赋值
    x = 10
foo()
\`\`\`

### Java：有提升（但赋值不提升）

\`\`\`java
// Java：声明会提升，赋值不提升
public void foo() {
    // System.out.println(x);  // 编译错误！x 未初始化
    int x = 10;
    System.out.println(x);
}

// 成员变量有默认值（提升 + 默认初始化）
public class Foo {
    private int x;  // 默认 0
    public void bar() {
        System.out.println(x);  // 0 —— 成员变量有默认值
    }
}
\`\`\`

## 八、类型推断的演进

### Python：类型提示（可选，运行时不检查）

\`\`\`python
# Python 3.6+：类型提示（可选，mypy 才检查）
name: str = "Alice"
age: int = 30
scores: list[int] = [90, 85, 88]

def greet(name: str) -> str:
    return f"Hello, {name}"

# 但运行时不检查！
name = 123  # 不报错（除非用 mypy 检查）
\`\`\`

### Java：var 局部推断 + 泛型钻石

\`\`\`java
// Java 7：钻石操作符（泛型类型推断）
List<String> list = new ArrayList<>();  // 右边不用写 <String>

// Java 10：var 局部变量推断
var name = "Alice";      // String
var age = 30;            // int
var scores = List.of(90, 85, 88);  // List<Integer>

// var 只能用于局部变量，不能用于成员/参数/返回值
// private var x = 1;  // 编译错误
\`\`\`

## 九、可变 vs 不可变

### Python：\`不可变类型\` vs \`可变类型\`

\`\`\`python
# 不可变：int, float, str, tuple, frozenset
x = 1
y = x
y += 1
print(x, y)  # 1 2 —— int 不可变，y 是新对象

# 可变：list, dict, set
a = [1, 2]
b = a
b.append(3)
print(a, b)  # [1, 2, 3] [1, 2, 3] —— 同一对象
\`\`\`

### Java：基本类型 vs 引用类型

\`\`\`java
// 基本类型：值传递（不可变）
int x = 1;
int y = x;
y += 1;
System.out.println(x + " " + y);  // 1 2

// 引用类型：引用传递（可变）
int[] a = {1, 2};
int[] b = a;
b[0] = 99;
System.out.println(a[0]);  // 99 —— 同一对象

// String 不可变（特殊）
String s = "hello";
String t = s;
t = t.toUpperCase();
System.out.println(s);  // hello —— String 不可变
\`\`\`

## 十、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 变量本质 | 标签（绑定到对象） | 容器（有固定类型） |
| 声明方式 | 直接赋值 | 类型 + 变量名（或 var） |
| 类型 | 动态（运行时） | 静态（编译期） |
| 多重赋值 | 原生支持 \`a,b=1,2\` | 不支持 |
| 作用域 | 函数级（LEGB） | 块级 |
| 常量 | 无（约定 UPPER_CASE） | final 关键字 |
| 块内变量泄漏 | 会泄漏 | 不会（块作用域） |
| 类型推断 | 类型提示（可选） | var（编译期） |

---

> **下一章**：进入类型系统总览——Python 的动态类型 vs Java 的静态类型，这是两门语言最根本的差异之一。`,
  },
];
