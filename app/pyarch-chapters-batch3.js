// =============================================================
// Python 设计思想与架构教程 - 第 3 批章节(设计模式 · 创建型)
// =============================================================
// 本文件包含以下章节:
//   1. pyarch-dp-creational-intro    — 设计模式入门与创建型总览
//   2. pyarch-dp-singleton           — 单例模式(Singleton)
//   3. pyarch-dp-factory-method      — 工厂方法模式(Factory Method)
//   4. pyarch-dp-abstract-factory    — 抽象工厂模式(Abstract Factory)
//   5. pyarch-dp-builder             — 建造者模式(Builder)
//
// 写作约定:
//   - content 为模板字符串,内部反引号全部转义为 \`
//   - content 内部 ${} 全部转义为 \${}
//   - 每章末尾附「易错点小结」表格
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:设计模式入门与创建型总览
  // =========================================================
  {
    id: "pyarch-dp-creational-intro",
    icon: "🏗️",
    title: "设计模式入门与创建型总览",
    group: "设计模式 · 创建型",
    content: `# 设计模式入门与创建型总览

## 一、设计模式的起源

### 1.1 建筑学的启发

"设计模式"这个概念最早并非来自软件工程,而是来自建筑学。1977 年,美国建筑师克里斯托弗·亚历山大(Christopher Alexander)与同事合著了《A Pattern Language: Towns, Buildings, Construction》(一种模式语言:城镇、建筑、建造)一书。在这本书中,亚历山大提出了一种描述建筑设计经验的方法:把那些在特定场景下反复出现、被证明有效的建筑布置方案,抽象成一条条"模式"。

亚历山大在书中写下了被软件工程界反复引用的一段话:

> Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice.
>
> 每一个模式描述了一个在我们周围反复出现的问题,然后描述了该问题解决方案的核心,使你可以百万次地复用这个方案,而不必每次都用同样的方式。

这段话奠定了"模式"的基本内涵:**它是对重复经验的命名化、结构化总结,是可复用的解决方案骨架,而不是死板的教条**。

### 1.2 GoF 与《设计模式》一书

1994 年,四位资深软件工程师——Erich Gamma、Richard Helm、Ralph Johnson、John Vlissides——合著了《Design Patterns: Elements of Reusable Object-Oriented Software》(设计模式:可复用面向对象软件的基础)一书。这本书把亚历山大的"模式"思想引入了面向对象编程领域,系统总结并命名了 **23 种**经典设计模式。

因为这四位作者被合称为 **"Gang of Four"**(四人帮,简称 **GoF**),这本书也被俗称为"GoF 设计模式"或"四人帮书"。它是面向对象设计领域的里程碑著作,影响深远:

- 它给开发者提供了一套**共同的词汇**。说"用工厂方法"比说"定义一个创建对象的接口让子类决定实例化哪个类"要简洁得多。
- 它把**前人踩过的坑、积累的经验**显式记录下来,让后来者不必从零摸索。
- 它让面向对象设计的讨论有了**可对齐的参照系**。

从此,"设计模式"成为软件工程教育和面试的高频主题。

### 1.3 模式不是发明,而是发现

一个关键认知是:**GoF 并没有"发明"这些模式,他们是"发现"并"归纳"了它们**。这些模式早已散布在大量成熟系统的代码里,只是没人给它们起统一的名字、没人把它们的结构提炼出来。模式的存在先于模式的命名。

这也意味着:模式是**经验性的**,它来源于实践,而不是从理论推导出来的公理。所以模式会随着语言、范式、生态的演进而过时或变形——这一点我们在后面"设计模式的争议"一节会详细讨论。

## 二、模式的四大要素

GoF 在书中明确指出,一个设计模式应当包含四个基本要素。理解这四个要素,有助于你看懂任何一本讲模式的书,也有助于你判断"自己总结的某个套路算不算一个模式"。

### 2.1 模式名(Pattern Name)

模式名是一个一两个词的短语,用来概括该模式的问题、解决方案和效果。一个好名字胜过千言万语:

- \`Singleton\`(单例)一听到就知道是"只有一个实例"。
- \`Adapter\`(适配器)一听到就联想到电源适配器、转接头。
- \`Observer\`(观察者)一听到就知道有"被观察的对象 + 一群观察者"。

模式名的价值在于**沟通效率**。当团队成员都说同一套术语时,"这里用策略模式重构一下"这样一句话就能传达大量信息,而不必长篇大论描述结构。

### 2.2 问题(Problem)

问题描述了**何时使用这个模式**。它包含:

- 触发该模式的具体设计困境(例如"需要保证一个类只有一个实例")。
- 模式适用的**前置条件**(例如"对象创建逻辑稳定,不会频繁变化")。
- 模式试图解决的**痛点**(例如"全局变量被随意修改导致状态混乱")。

注意:问题不是"这个模式能做什么",而是"什么场景下你会需要这个模式"。**先有问题,再有模式**,顺序不能颠倒。

### 2.3 解决方案(Solution)

解决方案描述了**模式的结构**:涉及哪些参与者、它们之间的关系、各自的职责。重要的是:

- 解决方案给出的是**骨架**,不是完整实现。
- 它通常用类图、时序图、协作关系来表达。
- 具体实现细节因语言而异,模式本身是语言无关的。

例如,工厂方法的"解决方案骨架"是:**Creator 定义工厂方法接口,ConcreteCreator 实现它返回具体 Product**。至于用抽象类还是接口、用 Java 还是 Python,那是实现层面的事。

### 2.4 效果(Consequences)

效果描述了**应用该模式后的得失**。任何模式都有代价:

- 单例模式保证唯一实例,但引入全局状态、增加测试难度。
- 观察者模式实现松耦合的事件通知,但可能导致级联更新、调试困难。
- 装饰器模式灵活组合行为,但会产生大量小类、调用栈变深。

**不懂效果,就不算真懂模式**。一个成熟工程师选择模式时,考虑的不仅是"它能解决什么问题",更要考虑"它会带来什么新问题"。盲目套用模式,常常比不用模式更糟。

## 三、23 种经典模式分类

GoF 把 23 种模式按**目的**(模式是干什么的)分成三大类,又按**范围**(模式作用于类还是对象)做进一步区分。

### 3.1 按目的分类

| 类别 | 数量 | 关注点 | 包含的模式 |
| --- | --- | --- | --- |
| **创建型(Creational)** | 5 | 对象的**创建过程** | 单例、工厂方法、抽象工厂、建造者、原型 |
| **结构型(Structural)** | 7 | 类与对象的**组合结构** | 适配器、桥接、组合、装饰器、外观、享元、代理 |
| **行为型(Behavioral)** | 11 | 对象间的**职责分配与交互** | 责任链、命令、解释器、迭代器、中介者、备忘录、观察者、状态、策略、模板方法、访问者 |

### 3.2 三大类别的核心区别

- **创建型**关心"对象从哪里来、怎么造"。它把对象的创建逻辑封装起来,让客户端不必关心 \`new\` 出来的具体是哪个类。
- **结构型**关心"类和对象怎么组合成更大的结构"。它处理的是已有组件如何搭在一起,形成更有用的整体。
- **行为型**关心"对象之间怎么协作、职责怎么分配"。它关注的是运行时的交互与算法。

### 3.3 按范围分类(类模式 vs 对象模式)

| 范围 | 含义 | 特点 |
| --- | --- | --- |
| **类模式** | 处理**类与子类**的关系,通过继承建立,在编译时确定 | 静态、靠继承;GoF 中只有工厂方法、适配器(类版本)、解释器是纯类模式 |
| **对象模式** | 处理**对象之间**的关系,通过组合建立,在运行时可变 | 动态、靠组合;绝大多数模式都是对象模式 |

GoF 在书里反复强调一条面向对象设计原则:**优先使用对象组合,而不是类继承**("Favor object composition over class inheritance")。所以你会看到,大多数模式的核心机制是组合而非继承——这条原则我们在 SOLID 章节里也讲过(合成复用原则)。

### 3.4 23 种模式速查表

| # | 模式 | 类别 | 一句话概括 |
| --- | --- | --- | --- |
| 1 | Singleton 单例 | 创建型 | 保证一个类只有一个实例 |
| 2 | Factory Method 工厂方法 | 创建型 | 子类决定实例化哪个类 |
| 3 | Abstract Factory 抽象工厂 | 创建型 | 创建一族相关对象 |
| 4 | Builder 建造者 | 创建型 | 分步构造复杂对象 |
| 5 | Prototype 原型 | 创建型 | 通过克隆已有对象创建新对象 |
| 6 | Adapter 适配器 | 结构型 | 转换接口,让不兼容的类协作 |
| 7 | Bridge 桥接 | 结构型 | 分离抽象与实现,使它们独立变化 |
| 8 | Composite 组合 | 结构型 | 树形结构统一处理叶子和容器 |
| 9 | Decorator 装饰器 | 结构型 | 动态给对象添加职责 |
| 10 | Facade 外观 | 结构型 | 为子系统提供统一入口 |
| 11 | Flyweight 享元 | 结构型 | 共享细粒度对象以节省内存 |
| 12 | Proxy 代理 | 结构型 | 用代理对象控制对原对象的访问 |
| 13 | Chain of Responsibility 责任链 | 行为型 | 请求沿链传递,直到被处理 |
| 14 | Command 命令 | 行为型 | 把请求封装成对象 |
| 15 | Interpreter 解释器 | 行为型 | 定义一种语言并解释其句子 |
| 16 | Iterator 迭代器 | 行为型 | 顺序访问聚合中的元素 |
| 17 | Mediator 中介者 | 行为型 | 用中介对象封装一组对象的交互 |
| 18 | Memento 备忘录 | 行为型 | 保存并恢复对象状态 |
| 19 | Observer 观察者 | 行为型 | 一对多的依赖通知 |
| 20 | State 状态 | 行为型 | 状态变化时改变行为 |
| 21 | Strategy 策略 | 行为型 | 封装可互换的算法族 |
| 22 | Template Method 模板方法 | 行为型 | 定义算法骨架,子类重写步骤 |
| 23 | Visitor 访问者 | 行为型 | 在不改变类的前提下添加操作 |

本批章节聚焦**创建型 5 个模式**,结构型和行为型将在后续批次讲解。

## 四、创建型模式概览

创建型模式的共同主题是:**把对象的创建和使用分离**。在没有创建型模式时,客户端代码里到处都是 \`new XxxClass(...)\`,这会带来几个问题:

1. **耦合**:客户端硬编码了具体类,更换实现必须改客户端代码,违反开闭原则。
2. **重复**:相同的构造逻辑散落各处,难以维护。
3. **复杂度暴露**:复杂对象的构造步骤(比如一个有 10 个可选参数的配置对象)直接暴露给调用方,调用方很容易用错。

创建型模式用不同的方式封装"创建"这件事。下表是 5 种创建型模式的速览对比:

### 4.1 五种创建型模式对比表

| 模式 | 核心意图 | 关键参与者 | 典型场景 |
| --- | --- | --- | --- |
| **Singleton 单例** | 保证全局唯一实例 | Singleton 类本身 | 配置、日志、连接池 |
| **Factory Method 工厂方法** | 子类决定创建哪种产品 | Creator + Product | 日志器选择、文档导出 |
| **Abstract Factory 抽象工厂** | 创建一族相关产品 | AbstractFactory + 多个 Product | 跨平台 UI、多数据库适配 |
| **Builder 建造者** | 分步构造复杂对象 | Director + Builder | SQL 构造器、配置对象、HTML 生成 |
| **Prototype 原型** | 克隆已有对象 | Prototype(实现 clone) | 缓存复制、避免重复初始化 |

### 4.2 用一张图理解五种创建型模式的差异

\`\`\`text
                     客户端需要对象
                            │
            ┌───────────────┼───────────────┐
            │               │               │
        只需一个         需要某种         需要复杂对象
        全局实例         类型的实例       (多个步骤组装)
            │               │               │
            ▼               ▼               ▼
        Singleton      ┌───┴───┐         Builder
                       │       │
                  要一族相关  要单个产品
                  产品       │
                     │       ▼
                Abstract   Factory
                 Factory    Method
\`\`\`

### 4.3 创建型模式要回答的核心问题

每个创建型模式其实在回答一个不同的"创建问题":

- **Singleton**:对象只要一个,怎么保证?
- **Factory Method**:创建哪种产品由子类决定,怎么设计?
- **Abstract Factory**:要造一整套配套产品,怎么保证它们兼容?
- **Builder**:对象构造步骤多且可选,怎么让调用方不被参数淹没?
- **Prototype**:已有对象,怎么快速复制一个一模一样的?

记住这些问题,你就记住了每个模式存在的理由——这比死记结构图有效得多。

## 五、设计模式与 Python

### 5.1 GoF 模式基于 C++/Smalltalk,不是 Python

GoF 的书是 1994 年写的,书里的示例用 C++ 和 Smalltalk。这两种语言都是**静态类型、强面向对象**的语言。Python 则是**动态类型、多范式**的语言,二者差异很大:

| 维度 | GoF 时代的 C++/Smalltalk | Python |
| --- | --- | --- |
| 类型系统 | 静态类型,变量须声明类型 | 动态类型,变量无需声明类型 |
| 接口 | 用抽象类 / 纯虚函数 | 用 \`abc.ABC\` 或鸭子类型,甚至不用 |
| 函数地位 | 函数不是一等公民,一切靠类 | 函数是一等公民,可当参数传递 |
| 元编程 | 几乎没有 | 装饰器、元类、描述符、\`__init_subclass__\` 等 |
| 模块系统 | 较弱 | 模块本身是一等对象,天然单例 |

这意味着:**照搬 GoF 的 Java/C++ 实现到 Python,经常是过度设计**。很多模式在 Python 里有更简洁、更地道的写法。

### 5.2 Python 让很多模式"消失"或"简化"

#### 5.2.1 工厂:不必用类,用函数即可

在 Java 里,工厂通常是一个类(因为函数不能独立存在)。在 Python 里,工厂可以是一个普通函数:

\`\`\`python
# Java 式工厂:必须定义一个 Factory 类
class LoggerFactory:
    @staticmethod
    def create(kind: str):
        if kind == "file":
            return FileLogger()
        elif kind == "console":
            return ConsoleLogger()

# Pythonic 工厂:一个函数就够了
def create_logger(kind: str):
    if kind == "file":
        return FileLogger()
    elif kind == "console":
        return ConsoleLogger()
\`\`\`

函数即是工厂,何必再包一层类?

#### 5.2.2 策略:函数即策略

GoF 的策略模式要把每个算法封装成一个类。Python 里函数就是一等公民,直接传函数:

\`\`\`python
from abc import abstractmethod
from abc import ABC
# Java 式策略:每个策略一个类
class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data): ...

class QuickSort(SortStrategy):
    def sort(self, data): ...

# Pythonic 策略:直接传函数
def process(data, sort_fn):  # sort_fn 是普通函数
    return sort_fn(data)

process([3, 1, 2], sorted)
\`\`\`

#### 5.2.3 单例:模块天然就是单例

Python 模块在第一次 import 时执行,之后被缓存。**一个模块在整个进程里只有一个实例**,这本身就是单例。所以最 Pythonic 的单例就是:把状态放模块级变量里。

\`\`\`python
# config.py
class _Config:
    def __init__(self):
        self.debug = False
        self.timeout = 30

config = _Config()  # 模块级变量,全局唯一

# 其他文件
from config import config
config.debug = True
\`\`\`

#### 5.2.4 迭代器:语言原生支持

Python 的 \`for x in obj\` 协议(\`__iter__\` / \`__next__\`)让迭代器模式成为语言内建能力,你只需要实现协议,不需要"设计一个迭代器模式"。

### 5.3 但有些模式在 Python 里依然有价值

不是所有模式都被 Python 简化掉了。下面这些模式在 Python 中依然有清晰的用武之地:

- **装饰器模式**:Python 虽然有 \`@decorator\` 语法,但那是**函数装饰器**,和 GoF 的**对象装饰器**(动态给对象加职责)不是一回事。当你需要给对象**运行时叠加行为**且不想用继承时,对象装饰器依然有用。
- **适配器模式**:当你接入第三方库,接口不匹配时,适配器依然是最干净的方案。
- **观察者模式**:虽然 Python 没有内建的事件机制,但用 \`list\` + 回调实现观察者依然很常见。
- **建造者模式**:构造复杂对象(如 SQL、配置)时,链式建造者非常实用。

所以,**学习模式不是要照搬,而是要理解每个模式解决的问题,然后判断在 Python 里用什么手段解决最合适**。

## 六、设计模式的争议

设计模式并非没有批评声。一个成熟的工程师应当了解这些争议,而不是把模式当宗教。

### 6.1 "模式是语言缺陷的标志"

函数式编程社区有一句名言(常被归功于 Peter Norvig):**"Design patterns are bug reports for your programming language."**(设计模式是编程语言的 bug 报告)。

意思是:如果一个模式在某种语言里频繁出现,往往说明这种语言缺少某种原生能力,需要程序员手动用模式去补。例如:

- C++ 没有垃圾回收 → 需要 \`smart pointer\` 模式。
- Java 没有一等公民的函数 → 策略模式必须用类。
- GoF 时代的 C++ 没有内建迭代器 → 需要迭代器模式。

在更高级的语言里,这些模式往往会被语言特性"吃掉"。Norvig 本人在《Design Patterns in Dynamic Languages》演讲中指出:**GoF 的 23 个模式里,有 16 个在 Lisp 中要么消失要么大幅简化**。

### 6.2 过度使用与教条主义

设计模式最大的危害是**被滥用**。一些开发者学了模式后,看什么都像模式,到处套用:

- 简单的 if-else 能解决的事,非要上策略模式。
- 一个产品也要建工厂方法。
- 三行代码的逻辑,包装成五层抽象。

这种"模式病"会让代码**更难读、更难维护**。Brian Kernighan 的名言"调试代码比写代码难一倍,所以如果你写得太聪明,就调试不了"同样适用于过度设计。

判断是否该用模式的简单标准:**先用最直接的方式写出来,等真的感受到痛点(重复、耦合、扩展困难)时,再重构引入模式**。这就是"重构到模式"(Refactoring to Patterns)的思路。

### 6.3 Pythonic vs Java 式

Python 社区有一种共识:**不要把 Java 的写法硬搬到 Python**。这被称为 "Javatic Python" 或 "Python 写得像 Java"。典型症状:

- 给每个类都写一堆 getter/setter(Python 用属性 \`@property\` 即可,甚至直接公开属性)。
- 到处用 \`AbstractXxx\` 接口 + \`XxxImpl\` 实现(Python 鸭子类型,经常不需要接口)。
- 工厂、建造者、单例全用类堆出来,而忽略了函数和模块的简洁方案。

Python 之禅说"There should be one-- and preferably only one --obvious way to do it"(应该有一种——最好只有一种——明显的方式来做这件事)。Java 式写法往往违反这条,因为它把多种等价写法都搬过来了。

但这不意味着 Python 完全不该用模式。**正确的态度是:理解模式的意图,用 Python 最地道的方式去实现那个意图**。

## 七、Python 之禅与设计模式

Python 之禅(The Zen of Python,PEP 20)是 Tim Peters 写的 19 条格言,输入 \`import this\` 即可看到。它和设计模式有深刻的呼应关系。

### 7.1 Python 之禅全文

\`\`\`text
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
优美胜于丑陋。
Explicit is better than implicit.
显式胜于隐式。
Simple is better than complex.
简单胜于复杂。
Complex is better than complicated.
复杂胜于纷繁。
Flat is better than nested.
扁平胜于嵌套。
Sparse is better than dense.
稀疏胜于密集。
Readability counts.
可读性很重要。
Special cases aren't special enough to break the rules.
特殊情况不足以打破规则。
Although practicality beats purity.
尽管实用性胜过纯粹。
Errors should never pass silently.
错误不应被静默忽略。
Unless explicitly silenced.
除非被显式静默。
In the face of ambiguity, refuse the temptation to guess.
面对歧义,拒绝猜测的诱惑。
There should be one-- and preferably only one --obvious way to do it.
应该有一种——最好只有一种——明显的方式来做这件事。
Although that way may not be obvious at first unless you're Dutch.
尽管这种方式一开始可能不明显,除非你是荷兰人。
Now is better than never.
现在做胜过永远不做。
Although never is often better than *right* now.
尽管永远不做常常胜过"马上"做。
If the implementation is hard to explain, it's a bad idea.
如果实现很难解释,它就是个坏主意。
If the implementation is easy to explain, it may be a good idea.
如果实现很容易解释,它可能是个好主意。
Namespaces are one honking great idea -- let's do more of those!
命名空间是个绝妙的想法——让我们多做一些!
\`\`\`

### 7.2 Python 之禅与模式选择的对应

| Python 之禅条款 | 对设计模式的启示 |
| --- | --- |
| Simple is better than complex | 能用函数解决就别上类工厂;能直接 new 就别建抽象工厂 |
| Flat is better than nested | 避免过深的继承链;策略模式用函数比用类层级更扁平 |
| Explicit is better than implicit | 单例要让人一眼看出是单例,别藏得太深;依赖注入比全局变量更显式 |
| Readability counts | 模式是为了让人读懂,不是为了炫技 |
| There should be one obvious way | 同一个意图选最直接的一种实现,不要堆多种等价写法 |
| If the implementation is hard to explain, it's a bad idea | 一个模式如果讲不清楚为什么用,就别用 |
| Namespaces are great | 模块本身就是命名空间,也是天然单例,善用模块 |

### 7.3 一个反例:过度设计的"Pythonic 反模式"

下面是一段典型过度设计的代码,违反了 Python 之禅的"Simple is better than complex":

\`\`\`python
from abc import abstractmethod
from abc import ABC
# ❌ 过度设计:为一个简单的日志功能建了 4 层抽象
class ILogger(ABC):
    @abstractmethod
    def log(self, msg: str): ...

class AbstractLoggerBase(ILogger):
    def __init__(self):
        self._formatter = None
    def set_formatter(self, f):
        self._formatter = f

class ConcreteConsoleLogger(AbstractLoggerBase):
    def log(self, msg: str):
        print(self._formatter(msg) if self._formatter else msg)

class LoggerFactory(ABC):
    @abstractmethod
    def create(self) -> ILogger: ...

class ConsoleLoggerFactory(LoggerFactory):
    def create(self) -> ILogger:
        return ConcreteConsoleLogger()

# 调用
factory = ConsoleLoggerFactory()
logger = factory.create()
logger.log("hello")
\`\`\`

同样的功能,Pythonic 写法只要几行:

\`\`\`python
# ✅ Pythonic:简单直接
def log(msg: str):
    print(msg)

log("hello")
\`\`\`

当真的需要支持多种日志器时,再引入工厂方法不迟。**先简单,后演化**。

## 八、如何学习本批章节

### 8.1 学习路径建议

\`\`\`text
[1] 先读本章,建立对"模式"和"创建型"的整体认知
        │
        ▼
[2] 单例模式:最简单,理解"唯一实例"的多种实现与陷阱
        │
        ▼
[3] 工厂方法:理解"把 new 推迟到子类"的核心思想
        │
        ▼
[4] 抽象工厂:理解"一族产品"的概念,对比工厂方法
        │
        ▼
[5] 建造者:理解"分步构造"与"链式调用"的优雅
        │
        ▼
[6] 回顾对比表,形成创建型模式的整体地图
\`\`\`

### 8.2 学习每个模式的四步法

1. **记住问题**:这个模式解决什么场景下的什么痛点?
2. **理解结构**:有哪些参与者,它们怎么协作?(画类图)
3. **动手实现**:在 Python 里至少写一版实现,并思考"Pythonic 写法是什么"。
4. **反思代价**:这个模式带来什么新问题?什么时候不该用?

### 8.3 本批章节的代码约定

- 所有示例仅用 Python 标准库,可直接复制运行。
- Python 版本假设 3.8+。
- 每个模式给出**经典 OOP 实现**和**Pythonic 实现**两种,对比理解。
- 类图用 ASCII 文本绘制,方便在终端阅读。

## 九、创建型模式学习的常见误区

| 误区 | 真相 |
| --- | --- |
| "创建型模式就是讲怎么 new 对象" | 它讲的是**如何把创建逻辑封装和抽象**,而不是 new 本身 |
| "学了工厂就一定要用工厂" | 工厂的价值在"创建逻辑会变化"时才体现,稳定场景直接 new 即可 |
| "单例是全局变量的优雅版本" | 单例本质上就是带保护的全局状态,该警惕的全局状态问题它都有 |
| "建造者就是给构造函数加个包装" | 建造者的核心是**分步 + 不可变最终对象**,不只是包装 |
| "抽象工厂就是工厂方法的工厂" | 二者解决的问题不同:抽象工厂造一族,工厂方法造单个 |

## 十、本章小结

本章作为创建型模式的导论,做了四件事:

1. **回顾了模式的起源**:从建筑学亚历山大到软件工程 GoF,理解模式是"经验命名化",不是教条。
2. **明确了模式的四要素**:模式名、问题、解决方案、效果——尤其强调"效果"是判断该不该用模式的关键。
3. **梳理了 23 种模式的全景**:创建型 5、结构型 7、行为型 11,本批聚焦创建型。
4. **讨论了模式与 Python 的关系**:Python 的动态特性让很多模式简化甚至消失,学习时应理解意图而非照搬结构。

接下来的 4 章将逐一深入单例、工厂方法、抽象工厂、建造者。每个模式都会给出多种 Python 实现并对比优劣,帮你建立"在 Python 里如何恰当地用模式"的判断力。

## 十一、易错点小结

| 易错点 | 错误表现 | 正确做法 |
| --- | --- | --- |
| 把模式当教条照搬 | 在 Python 里照抄 Java 的 5 层抽象工厂 | 先理解意图,再用 Pythonic 手段实现 |
| 只记结构不记问题 | 能背类图,却说不清何时用 | 先问"解决什么痛点",再记结构 |
| 忽略模式的代价 | 滥用单例导致全局状态泛滥 | 每个模式都要看"效果"一栏的代价 |
| 把创建型等同于 new | 以为创建型就是讲怎么造对象 | 它讲的是封装和抽象创建逻辑,隔离客户端与具体类 |
| 混淆类模式与对象模式 | 用继承硬套对象模式 | 优先组合,只有少数模式靠继承 |
| 认为模式越多越好 | 一个简单功能堆 5 个模式 | 简单优先,痛点了再"重构到模式" |
| 忽视语言差异 | 用 Java 思维写 Python | Python 函数、模块、鸭子类型能简化大量模式 |
| 把"Pythonic"当成不用模式 | 以为 Python 不需要任何模式 | Python 简化了模式,但适配器、建造者、观察者等依然有用 |
| 死记 23 个名字 | 背诵模式名却不会用 | 至少能手写每个创建型模式的两版实现 |
| 忽略模式的演化 | 拿 1994 年的 C++ 思维套现代 Python | 关注语言特性如何"吃掉"模式(如迭代器、模块单例) |
`,
  },

  // =========================================================
  // 第二章:单例模式(Singleton)
  // =========================================================
  {
    id: "pyarch-dp-singleton",
    icon: "1️⃣",
    title: "单例模式(Singleton)",
    group: "设计模式 · 创建型",
    content: `# 单例模式(Singleton)

## 一、模式定义

> **单例模式**:保证一个类只有一个实例,并提供一个全局访问点。
>
> Ensure a class has only one instance and provide a global point of access to it.

这是 GoF 23 个模式中最简单的一个,也是最常被滥用、争议最多的一个。它的意图可以用一句话概括:**全局只有一个,且谁都能拿到**。

"只有一个"是约束,"全局访问点"是便利。两者合起来,就是大家熟悉的"全局唯一对象"。

## 二、为什么需要单例

### 2.1 真实场景的痛点

考虑一个配置管理器。一个程序运行期间,配置应该只有一份:从配置文件读一次,之后所有模块共享同一份配置。如果每个模块各自 \`new Config()\`,会出现:

- **资源浪费**:同一份配置文件被反复读取。
- **状态不一致**:模块 A 改了自己的配置副本,模块 B 看不到。
- **难以管理**:想刷新配置,不知道去哪里统一刷新。

\`\`\`python
# ❌ 每个模块各自 new,状态分裂
class Config:
    def __init__(self):
        self.settings = load_from_file()  # 每次都读文件

# 模块 A
cfg_a = Config()
cfg_a.settings["debug"] = True

# 模块 B
cfg_b = Config()
print(cfg_b.settings["debug"])  # False,A 的修改看不到
\`\`\`

单例模式解决的就是这个问题:**让 Config 全局只有一份,改一处全局可见**。

### 2.2 单例要满足的两个性质

1. **唯一性**:类在整个生命周期内最多有一个实例。
2. **可访问性**:提供全局统一的获取方式(通常是 \`get_instance()\` 或模块级变量)。

注意"唯一性"在不同层面的含义:

| 层面 | 含义 |
| --- | --- |
| 进程级 | 整个 Python 进程内唯一(最常见) |
| 线程级 | 每个线程一个实例(线程局部单例,\`threading.local\`) |
| 请求级 | 每个 Web 请求一个实例(通常用请求上下文而非单例) |

本章讨论的是**进程级单例**,这是最常见的理解。

## 三、典型应用场景

| 场景 | 为什么用单例 |
| --- | --- |
| 配置管理(Config) | 配置全局唯一,避免重复读取、保证一致性 |
| 日志器(Logger) | 日志输出到一个文件/流,统一格式和级别 |
| 数据库连接池 | 连接池是昂贵资源,全局共享,避免反复建连 |
| 缓存(Cache) | 全局共享缓存,所有模块看到同一份 |
| 硬件访问(打印机、串口) | 物理设备唯一,不能被多个实例同时占用 |
| 线程池/进程池 | 池是全局资源,统一调度 |
| 主题/皮肤管理器 | UI 主题全局统一 |

注意:这些场景**适合**单例,不代表必须用单例模式(类级单例)。后面会讲,很多时候用**模块级变量**或**依赖注入**更干净。

## 四、Python 实现:五种方式逐一剖析

Python 实现单例有多种方式,各有优劣。下面逐一讲解。

### 4.1 方式一:模块级单例(最 Pythonic)

Python 的模块系统有一个特性:**一个模块在第一次 import 时执行,之后被缓存在 \`sys.modules\` 中**。再次 import 直接返回缓存对象,不会重新执行。所以**模块本身天然就是单例**。

\`\`\`python
# config.py —— 模块即单例
class _Config:
    def __init__(self):
        self.debug = False
        self.timeout = 30
        self.db_url = "sqlite:///app.db"

    def reload(self):
        # 重新加载配置
        self.debug = False

# 模块级变量,全局唯一
config = _Config()

# 其他模块
# from config import config
# config.debug = True  # 改的是同一个实例
\`\`\`

#### 优点

- **最简单**:不需要任何特殊语法,符合 Python 之禅的"Simple is better than complex"。
- **天然线程安全**:模块加载由 import 机制保证,CPython 的 import 有锁保护。
- **显式**:import 语句本身就说明了依赖。
- **没有隐藏的魔法**:谁都能看懂 \`config\` 是个模块级变量。

#### 缺点

- **无法延迟初始化**:模块 import 时就创建实例,即使你暂时不用。
- **测试时替换稍麻烦**:虽然可以 \`mock.patch\` 模块属性,但不如依赖注入直观。
- **不能控制"何时销毁重建"**:模块对象生命周期等于进程生命周期。

#### 适用场景

绝大多数"全局配置""全局日志器"场景。**这是 Python 单例的首选方式**。

### 4.2 方式二:重写 __new__ 方法

\`__new__\` 是 Python 创建对象的钩子方法,先于 \`__init__\` 执行。重写它可以把"是否新建"的逻辑放进去:

\`\`\`python
class Singleton:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, value=None):
        # ⚠️ 注意:每次调用 Singleton() 都会再次执行 __init__
        if not hasattr(self, "_initialized"):
            self.value = value
            self._initialized = True

s1 = Singleton("a")
s2 = Singleton("b")
print(s1 is s2)       # True —— 同一个实例
print(s1.value)       # "a" —— 因为 _initialized 已置位,__init__ 不再覆盖
\`\`\`

#### 关键陷阱:__init__ 会被重复调用

\`__new__\` 返回已存在实例后,Python **仍然会调用 \`__init__\`**。这意味着每次 \`Singleton(...)\` 都会重新初始化,这通常不是你想要的。解决方法是用一个标志位(如上面 \`_initialized\`)防止重复初始化。

#### 优点

- 把单例逻辑封装在类内部,使用方 \`Singleton()\` 看起来和普通类无异。
- 可以延迟初始化(第一次调用 \`Singleton()\` 时才创建)。

#### 缺点

- **\`__init__\` 重复调用**是经典坑,容易导致状态被意外重置。
- **线程不安全**:多线程同时第一次调用,可能创建多个实例(后面会讲加锁版本)。
- **子类化困难**:子类继承单例父类时,实例共享逻辑会出问题。

#### 适用场景

需要把单例逻辑封装在类内部、且需要延迟初始化时。但通常方式一或方式三更优。

### 4.3 方式三:装饰器实现

用一个装饰器把任意类变成单例:

\`\`\`python
def singleton(cls):
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class Database:
    def __init__(self, url):
        self.url = url
        print(f"连接数据库: {url}")

db1 = Database("mysql://localhost")
# 输出: 连接数据库: mysql://localhost
db2 = Database("postgres://localhost")
# 无输出 —— 直接返回已有实例
print(db1 is db2)  # True
print(db2.url)     # mysql://localhost —— 注意:第二次的参数被忽略
\`\`\`

#### 关键陷阱:第二次调用的参数被忽略

装饰器版本里,只有第一次创建时用参数,后续调用无论传什么都返回已有实例。这可能让使用者困惑:\`Database("postgres")\` 看起来像新建,实际却返回了旧的。

#### 优点

- **复用性强**:任意类加 \`@singleton\` 即变单例,不侵入类内部。
- 可以延迟初始化。
- 实现清晰,容易理解。

#### 缺点

- **装饰后变成函数**:\`Database\` 装饰后实际是 \`get_instance\` 函数,不再是类。这会导致:
  - \`isinstance(db1, Database)\` 报错(\`Database\` 已不是类)。
  - 无法再继承 \`Database\`。
  - 类方法、静态方法调用方式变化。
- **参数被忽略**的陷阱如上。
- **线程不安全**(同方式二)。

#### 适用场景

需要把多个类快速变单例、且不关心 isinstance/继承的场景。生产代码中不如方式一和方式五常用。

### 4.4 方式四:元类实现

元类是"类的类",可以拦截类的创建过程。用元类实现单例,能让类**本身**保持是类(可 isinstance、可继承),同时保证实例唯一:

\`\`\`python
class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Logger(metaclass=SingletonMeta):
    def __init__(self, level="INFO"):
        self.level = level
        print(f"初始化 Logger, level={level}")

log1 = Logger("DEBUG")
# 输出: 初始化 Logger, level=DEBUG
log2 = Logger("ERROR")
# 无输出 —— 返回已有实例
print(log1 is log2)   # True
print(log1.level)     # DEBUG
print(isinstance(log1, Logger))  # True —— 类还是类
\`\`\`

#### 关键点:__call__ 而不是 __new__

元类里重写 \`__call__\` 而不是 \`__new__\`,因为 \`__call__\` 拦截的是"调用类创建实例"这一动作(\`Logger(...)\`),它能同时控制 \`__new__\` 和 \`__init__\` 的触发。这避免了方式二中 \`__init__\` 重复执行的坑——**只有真正创建时才会触发 \`__init__\`**。

#### 优点

- 类仍然是类,\`isinstance\` 和继承都正常。
- \`__init__\` 只在第一次创建时执行,没有重复初始化问题。
- 单例逻辑封装在元类,业务类保持干净。

#### 缺点

- **元类是高级特性**,理解门槛高,新人看不懂。
- **线程不安全**(本例),需要加锁(见方式五)。
- 多个类用同一元类时,\`_instances\` 字典是共享的(本例用 \`cls\` 作 key 区分,可以接受)。
- 子类化时,子类和父类是否共享实例取决于实现细节,容易踩坑。

#### 适用场景

需要"类仍是类 + 单例 + 干净的业务类"三者兼得时。是 OOP 风格单例的最佳实现之一。

### 4.5 方式五:线程安全的双重检查锁

多线程环境下,方式二、三、四都有竞态条件:两个线程同时第一次调用,都判断"还没实例",于是各建一个。解决方法是加锁。

最严谨的写法是**双重检查锁定(Double-Checked Locking)**:

\`\`\`python
import threading

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:               # 第一次检查(无锁,快路径)
            with cls._lock:                     # 加锁
                if cls._instance is None:       # 第二次检查(持锁)
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, value=None):
        if not hasattr(self, "_initialized"):
            self.value = value
            self._initialized = True

# 测试线程安全
def worker():
    s = Singleton("x")
    print(id(s))

threads = [threading.Thread(target=worker) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
# 所有线程打印的 id 相同
\`\`\`

#### 为什么需要两次检查

- **第一次检查(无锁)**:绝大多数调用时实例已存在,直接返回,避免每次都加锁的开销。
- **第二次检查(持锁)**:防止多个线程通过了第一次检查、排队拿到锁后重复创建。

#### 更简洁的版本:基于元类 + 锁

\`\`\`python
import threading

class SingletonMeta(type):
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class DbPool(metaclass=SingletonMeta):
    def __init__(self, size=10):
        self.size = size
\`\`\`

#### 优点

- **线程安全**,适合多线程环境。
- 保留了对应方式(元类/__new__)的其他优点。

#### 缺点

- 代码更复杂,有锁就有性能开销和死锁风险。
- **CPython 的 GIL 让很多场景"看起来"线程安全**,但 GIL 不保证业务逻辑的原子性,该加锁还得加锁。
- 双重检查在 C++/Java 里还有内存可见性问题(需 \`volatile\`),Python 里因 GIL 不存在此问题,但概念上要清楚。

#### 适用场景

多线程程序中确实需要延迟初始化的单例(如连接池)。**但请先考虑:能不能用模块级单例?模块加载本身是线程安全的,通常不需要这层复杂度**。

### 4.6 五种方式对比总表

| 方式 | 线程安全 | 延迟初始化 | 类仍是类 | 代码复杂度 | 推荐度 |
| --- | --- | --- | --- | --- | --- |
| 模块级单例 | ✅(import 锁) | ❌ | ❌(是模块变量) | 极低 | ⭐⭐⭐⭐⭐ |
| __new__ 重写 | ❌ | ✅ | ✅ | 中 | ⭐⭐⭐ |
| 装饰器 | ❌ | ✅ | ❌(变函数) | 低 | ⭐⭐⭐ |
| 元类 | ❌(需加锁) | ✅ | ✅ | 高 | ⭐⭐⭐⭐ |
| 元类+锁 | ✅ | ✅ | ✅ | 高 | ⭐⭐⭐⭐(多线程时) |

## 五、单例的争议与问题

单例是争议最大的模式之一。许多资深工程师认为**单例是"反模式"**,应当尽量避免。

### 5.1 单例的本质问题:全局状态

单例 = 带保护的**全局变量**。全局变量的所有问题,单例都有:

- **隐藏依赖**:一个函数内部 \`Logger.get_instance()\` 用了单例,从函数签名完全看不出来。调用者不知道这个函数依赖了 Logger,也不知道 Logger 的状态。
- **状态被任意修改**:任何模块都能改单例的状态,出了 bug 难以追踪是谁改的。
- **难以并行测试**:单例状态在测试间共享,测试用例之间互相影响。

\`\`\`python
# ❌ 隐藏依赖
def process_order(order):
    logger = Logger.get_instance()   # 隐藏依赖
    db = Database.get_instance()     # 隐藏依赖
    logger.log(f"处理订单 {order.id}")
    db.save(order)

# 调用者看不出 process_order 依赖 Logger 和 Database
process_order(order)
\`\`\`

### 5.2 测试困难

单例让单元测试变得棘手。测试之间会相互污染:

\`\`\`python
class TestOrder:
    def test_a(self):
        Config.get_instance().debug = True
        # 测试逻辑...

    def test_b(self):
        # ❌ Config 还是上一个测试设的 debug=True
        # 测试结果依赖执行顺序,这是测试的灾难
\`\`\`

解决方法通常是给单例加 \`reset()\` 方法,或在测试 setup/teardown 里手动重置,但这都是补救措施,不是根治。

### 5.3 违反单一职责原则

单例类既负责"业务逻辑",又负责"保证唯一实例",两职责耦合在一起。GoF 自己也承认这一点。

### 5.4 阻碍扩展

单例的"全局唯一"是硬约束。某天你需要"两个实例"(比如同时连两个数据库),整个架构都要改。而如果一开始用依赖注入,改起来只是换个参数。

## 六、替代方案:依赖注入

依赖注入(Dependency Injection, DI)是单例的现代替代品。核心思想:**不在函数内部去取全局对象,而是把依赖作为参数传进来**。

\`\`\`python
from logging import Logger
# ✅ 依赖注入:依赖显式可见
def process_order(order, logger: Logger, db: Database):
    logger.log(f"处理订单 {order.id}")
    db.save(order)

# 调用者清楚知道需要什么依赖
process_order(order, my_logger, my_db)
\`\`\`

#### 依赖注入的好处

| 好处 | 说明 |
| --- | --- |
| 依赖显式 | 函数签名即文档,看一眼就知道依赖什么 |
| 易于测试 | 测试时传入 mock 对象,不碰真实单例 |
| 易于扩展 | 想换实现?换参数即可,无需改函数内部 |
| 无全局状态 | 没有"谁改了单例"的追踪难题 |

#### 在 Python 里如何做依赖注入

Python 不需要重型 DI 框架(如 Java 的 Spring),简单的做法:

\`\`\`python
from logging import Logger
# 应用启动时组装依赖
class App:
    def __init__(self):
        self.logger = Logger()
        self.db = Database(self.logger)
        self.order_service = OrderService(self.db, self.logger)

app = App()
app.order_service.process(order)
\`\`\`

如果需要"全局只有一个实例",**在应用入口创建一次,然后传给所有需要它的地方**——这就是单例的正确姿势:唯一性由"只创建一次"保证,而不是由"类强制保证"。

### 6.1 模块级变量 + 显式传递的折中

实际项目中常见的折中:模块级变量提供"全局访问",关键函数仍接受参数便于测试:

\`\`\`python
# logger.py
class Logger: ...

logger = Logger()  # 模块级单例

# service.py
from logger import logger

class OrderService:
    def __init__(self, db, logger=None):
        self.db = db
        self.logger = logger or _default_logger  # 可注入,也有默认值
\`\`\`

这样既有默认值的便利,又有可注入的灵活性。

## 七、何时该用单例,何时不该用

### 7.1 适合用单例的场景

- **配置只读**:全局只读配置,用模块级变量最自然。
- **日志器**:整个应用共享一个日志器,且你不打算测试时替换它。
- **资源池**:连接池、线程池,全局共享。
- **无状态工具对象**:对象本身无状态,只是个工具(如某些工厂)。

### 7.2 不该用单例的场景

- **有状态且会被修改的对象**:全局可变状态是 bug 温床。
- **需要多实例的场景**:哪怕现在只要一个,未来可能要多个,就别用单例锁死。
- **需要测试的依赖**:任何想在测试里 mock 的东西,都不该是单例。
- **业务核心对象**:订单服务、用户服务等,应该用 DI 显式管理。

### 7.3 决策流程图

\`\`\`text
            需要全局共享某对象?
                   │
        ┌──────────┴──────────┐
        否                    是
        │                     │
    用普通类            对象有可变状态?
                       │
                ┌──────┴──────┐
                是             否
                │              │
            考虑 DI        用模块级变量
          (显式注入)        (最 Pythonic)
\`\`\`

## 八、完整实战:带过期机制的缓存单例

下面用一个完整例子综合演示"模块级单例 + 线程安全 + 优雅 API":

\`\`\`python
# cache.py
import threading
import time

class _Cache:
    def __init__(self, ttl=60):
        self._store = {}
        self._ttl = ttl
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None
            value, expire_at = item
            if time.time() > expire_at:
                del self._store[key]
                return None
            return value

    def set(self, key, value):
        with self._lock:
            self._store[key] = (value, time.time() + self._ttl)

    def clear(self):
        with self._lock:
            self._store.clear()

# 模块级单例
cache = _Cache(ttl=60)

# 使用
# from cache import cache
# cache.set("user:1", {"name": "Alice"})
# cache.get("user:1")
\`\`\`

注意这里的设计要点:

1. **类名用下划线 \`_Cache\`**:暗示"内部实现,别直接用",对外暴露的是小写 \`cache\` 实例。
2. **TTL 过期机制**:\`get\` 时惰性清理过期项,避免后台线程。
3. **锁保护写操作**:\`get\` 和 \`set\` 都加锁,保证线程安全。
4. **模块级实例**:最 Pythonic 的单例,无任何魔法。

这就是生产代码里推荐的单例写法——简单、安全、可读。

## 九、单例与其他创建型模式的关系

| 模式 | 与单例的关系 |
| --- | --- |
| 工厂方法 | 工厂方法本身可以是单例(一个工厂实例创建产品) |
| 抽象工厂 | 抽象工厂常被设计成单例,避免重复创建工厂 |
| 建造者 | 建造者通常是临时对象,每次构造创建新建造者,不用单例 |
| 原型 | 原型与单例正交,但原型管理器(原型注册表)可以是单例 |

## 十、本章小结

单例是最简单也最受争议的模式。本章要点:

1. **定义**:保证一个类只有一个实例,提供全局访问点。
2. **场景**:配置、日志、连接池、缓存等全局唯一资源。
3. **五种实现**:模块级(首选)、\`__new__\`、装饰器、元类、元类+锁。
4. **本质问题**:单例就是带保护的全局变量,有隐藏依赖、测试困难、阻碍扩展等通病。
5. **现代替代**:依赖注入——显式传递依赖,唯一性靠"只创建一次"保证,而非类强制。
6. **决策原则**:只读/无状态对象可用模块级单例;有状态可变对象优先 DI。

记住一句话:**如果你在纠结要不要用单例,大概率不该用**。

## 十一、易错点小结

| 易错点 | 错误表现 | 正确做法 |
| --- | --- | --- |
| __init__ 重复执行 | \`__new__\` 单例里每次 \`Singleton()\` 都重置属性 | 用 \`_initialized\` 标志位,或改用元类 \`__call__\` |
| 装饰器版变函数 | \`@singleton\` 后 \`isinstance(x, Foo)\` 报错 | 改用元类实现,类仍是类 |
| 忽略线程安全 | 多线程首次调用创建多实例 | 加锁,或直接用模块级单例(import 自带锁) |
| 双重检查少一次 | 只检查一次就加锁创建,仍有竞态 | 必须双重检查:无锁快路径 + 持锁复核 |
| 模块级单例被"重新赋值" | \`import config; config = new\` 改了本地引用 | 用 \`from config import config\` 或直接 \`config.X = ...\` |
| 单例持有可变状态 | 全局可变状态被各处修改,bug 难追 | 可变状态用 DI,只读配置才用单例 |
| 测试不重置单例 | 测试用例间状态污染 | 给单例加 \`reset()\`,或改用 DI 便于 mock |
| 把单例当传参替代 | 为了省事到处用单例,隐藏依赖 | 关键依赖显式传参,单例只用于真正的全局只读对象 |
| 子类化单例出 bug | 父子类实例共享/不共享行为不符预期 | 单例类尽量不要被继承;需要多形态改用工厂 |
| 用单例替代全局配置框架 | 单例越堆越多,变成"全局变量大集合" | 引入配置管理 + DI 容器,而非遍地单例 |
`,
  },

  // =========================================================
  // 第三章:工厂方法模式(Factory Method)
  // =========================================================
  {
    id: "pyarch-dp-factory-method",
    icon: "🏭",
    title: "工厂方法模式(Factory Method)",
    group: "设计模式 · 创建型",
    content: `# 工厂方法模式(Factory Method)

## 一、模式定义

> **工厂方法模式**:定义一个用于创建对象的接口,但让子类决定实例化哪个类。工厂方法使一个类的实例化延迟到其子类。
>
> Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.

核心思想一句话:**把 \`new\` 这个动作,从客户端推迟到子类**。

为什么要推迟?因为客户端**不该关心**具体用哪个类,它只要拿到一个"能用"的对象。具体用哪个,由子类根据情况决定。这样,新增一种产品时,只需新增一个子类,不必改客户端代码——这就是开闭原则的体现。

## 二、直觉理解:为什么不能直接 new

### 2.1 一个反例:客户端 if-elif new

假设你做一个日志系统,支持文件日志、控制台日志、网络日志。最直白的写法:

\`\`\`python
# ❌ 客户端硬编码具体类,且分支散落各处
def do_something():
    kind = "file"
    if kind == "file":
        logger = FileLogger()
    elif kind == "console":
        logger = ConsoleLogger()
    elif kind == "network":
        logger = NetworkLogger()
    logger.log("doing something")

def do_another():
    kind = "file"
    if kind == "file":           # 同样的 if-elif 又来一遍
        logger = FileLogger()
    elif kind == "console":
        logger = ConsoleLogger()
    logger.log("doing another")
\`\`\`

问题很明显:

1. **if-elif 重复**:每个需要日志的地方都要写一遍分支。
2. **客户端耦合具体类**:\`FileLogger\`、\`ConsoleLogger\` 散落在业务代码里。
3. **扩展困难**:新增一种 \`DbLogger\`,得找出所有写 if-elif 的地方逐一修改,违反开闭原则。
4. **修改易错**:漏改一处就出 bug。

### 2.2 工厂方法的思路:把"选择"封装起来

工厂方法的解决思路:**把"选哪个具体类"的逻辑,从客户端挪到一个专门的"工厂"里**。客户端只跟工厂打交道,不碰具体类。

\`\`\`text
改造前:
    客户端 ──if-elif──> new FileLogger / ConsoleLogger / ...

改造后:
    客户端 ──> 工厂.create() ──> 返回某个具体 Logger
                  (工厂内部决定具体是哪个)
\`\`\`

更进一步,GoF 的工厂方法把"工厂本身"也抽象成接口,由**子类**决定返回哪个产品。这样每加一种产品,就加一个工厂子类,符合开闭原则。

## 三、模式结构

### 3.1 类图

\`\`\`text
        ┌───────────────┐                ┌───────────────┐
        │   Product     │  <<abstract>>  │   Creator     │  <<abstract>>
        │  (产品接口)   │                │  (创建者接口) │
        ├───────────────┤                ├───────────────┤
        │ + operation() │                │ + factory_    │
        │               │                │     method()  │
        └───────┬───────┘                │ + some_op()   │
                │                        └───────┬───────┘
                │ 继承                            │ 继承
        ┌───────┴───────┐                ┌───────┴───────┐
        │ConcreteProduct│                │ConcreteCreator│
        ├───────────────┤                ├───────────────┤
        │ + operation() │                │ + factory_    │
        │               │                │     method()  │
        └───────────────┘                └───────────────┘
                                              │
                                              │ 返回
                                              ▼
                                    ┌───────────────────┐
                                    │ ConcreteProduct   │
                                    └───────────────────┘
\`\`\`

### 3.2 四个核心角色

| 角色 | 职责 | 示例 |
| --- | --- | --- |
| **Product(产品)** | 定义产品的统一接口 | \`Logger\` 接口,有 \`log()\` 方法 |
| **ConcreteProduct(具体产品)** | 实现 Product 接口的具体类 | \`FileLogger\`、\`ConsoleLogger\` |
| **Creator(创建者)** | 声明工厂方法,返回 Product | \`LogFactory\` 抽象类 |
| **ConcreteCreator(具体创建者)** | 实现工厂方法,返回具体产品 | \`FileLogFactory\`、\`ConsoleLogFactory\` |

### 3.3 关键:Creator 不只是工厂

一个常见误解是"Creator 就是个工厂,只负责造对象"。其实 GoF 的 Creator 通常**还包含业务逻辑**:

\`\`\`python
from abc import abstractmethod
from abc import ABC
class Creator(ABC):
    @abstractmethod
    def factory_method(self) -> Product:
        ...

    def some_operation(self):
        # 业务逻辑:用 factory_method 拿到产品,再做事
        product = self.factory_method()
        product.operation()
\`\`\`

\`some_operation\` 是 Creator 的业务方法,它依赖 \`factory_method\` 提供的产品,但**不知道也不关心**具体是哪个产品。这就是"用子类决定实例化谁"的精髓——业务逻辑写在父类,实例化延迟到子类。

## 四、经典 OOP 实现(abc.ABC)

下面用 Python 的 \`abc.ABC\` 实现一版经典的工厂方法:日志系统。

\`\`\`python
from abc import ABC, abstractmethod

# ---- 产品接口 ----
class Logger(ABC):
    @abstractmethod
    def log(self, msg: str):
        ...

# ---- 具体产品 ----
class FileLogger(Logger):
    def log(self, msg: str):
        print(f"[File] {msg}")

class ConsoleLogger(Logger):
    def log(self, msg: str):
        print(f"[Console] {msg}")

class NetworkLogger(Logger):
    def log(self, msg: str):
        print(f"[Network] {msg}")

# ---- 创建者抽象 ----
class LogFactory(ABC):
    @abstractmethod
    def create_logger(self) -> Logger:
        ...

    # 业务逻辑:不关心具体是哪种 Logger
    def log_message(self, msg: str):
        logger = self.create_logger()
        logger.log(msg)

# ---- 具体创建者 ----
class FileLogFactory(LogFactory):
    def create_logger(self) -> Logger:
        return FileLogger()

class ConsoleLogFactory(LogFactory):
    def create_logger(self) -> Logger:
        return ConsoleLogger()

class NetworkLogFactory(LogFactory):
    def create_logger(self) -> Logger:
        return NetworkLogger()

# ---- 客户端 ----
def app(factory: LogFactory):
    factory.log_message("应用启动")
    factory.log_message("处理请求")

# 用控制台工厂
app(ConsoleLogFactory())
# 输出:
# [Console] 应用启动
# [Console] 处理请求

# 切换到文件工厂,客户端代码 app 不变
app(FileLogFactory())
# 输出:
# [File] 应用启动
# [File] 处理请求
\`\`\`

#### 这个实现的亮点

1. **客户端 \`app\` 只依赖 \`LogFactory\` 抽象**,不碰任何具体类。换日志器只需换传入的工厂。
2. **新增日志器只需加两个类**(具体产品 + 具体工厂),不改任何现有代码——开闭原则。
3. **业务逻辑 \`log_message\` 在父类**,子类只实现"造哪个",职责分离干净。

#### 这个实现的问题

1. **类爆炸**:每加一种产品,要加两个类(产品 + 工厂)。5 种日志器就是 10 个类。
2. **过度抽象**:如果业务逻辑很简单(只是调 \`log()\`),父类的 \`log_message\` 显得多余。
3. **Python 风格不足**:这种纯 OOP 写法在 Java 里很自然,在 Python 里略显啰嗦。

## 五、Pythonic 实现:用函数 + 注册表

Python 函数是一等公民,工厂不必是类。更地道的写法是**注册表 + 函数工厂**:

\`\`\`python
# ---- 产品 ----
class FileLogger:
    def log(self, msg): print(f"[File] {msg}")

class ConsoleLogger:
    def log(self, msg): print(f"[Console] {msg}")

class NetworkLogger:
    def log(self, msg): print(f"[Network] {msg}")

# ---- 注册表:用 dict 代替类层级 ----
_loggers = {
    "file": FileLogger,
    "console": ConsoleLogger,
    "network": NetworkLogger,
}

def register_logger(name: str, cls):
    """运行时动态注册新日志器"""
    _loggers[name] = cls

def create_logger(kind: str) -> "Logger":
    if kind not in _loggers:
        raise ValueError(f"未知日志器类型: {kind}")
    return _loggers[kind]()

# ---- 客户端 ----
logger = create_logger("console")
logger.log("hello")

# 运行时注册新日志器,无需改任何现有代码
class DbLogger:
    def log(self, msg): print(f"[Db] {msg}")

register_logger("db", DbLogger)
create_logger("db").log("from db")
\`\`\`

#### Pythonic 版本的优势

1. **代码量减半**:不需要为每种产品建工厂类。
2. **运行时可扩展**:\`register_logger\` 允许插件式注册,符合开闭原则且更灵活。
3. **符合 Python 之禅**:"Simple is better than complex","Flat is better than nested"。
4. **鸭子类型**:产品不需要继承统一基类,只要有 \`log\` 方法即可。

#### 何时该用注册表版,何时该用经典版

| 情况 | 推荐 |
| --- | --- |
| 产品简单,只是"选哪个" | 注册表版 |
| 创建逻辑复杂(需要读取配置、初始化资源) | 经典版(工厂类封装创建逻辑) |
| 业务逻辑需要在父类复用 | 经典版 |
| 需要插件式动态扩展 | 注册表版 |
| 团队熟悉 OOP 风格,代码一致性要求高 | 经典版 |

## 六、用 __init_subclass__ 自动注册

Python 3.6+ 的 \`__init_subclass__\` 钩子可以让子类定义时**自动注册到注册表**,无需手动调用 \`register\`:

\`\`\`python
class Logger:
    registry = {}

    def __init_subclass__(cls, kind: str = None, **kwargs):
        super().__init_subclass__(**kwargs)
        if kind:  # 子类用 kind= 声明自己的类型
            Logger.registry[kind] = cls

    def log(self, msg: str):
        raise NotImplementedError

    @classmethod
    def create(cls, kind: str) -> "Logger":
        if kind not in cls.registry:
            raise ValueError(f"未知类型: {kind}")
        return cls.registry[kind]()

# 定义具体类时用 kind= 自动注册
class FileLogger(Logger, kind="file"):
    def log(self, msg): print(f"[File] {msg}")

class ConsoleLogger(Logger, kind="console"):
    def log(self, msg): print(f"[Console] {msg}")

# 不需要手动 register,定义完即可用
Logger.create("file").log("auto-registered!")
Logger.create("console").log("works")
\`\`\`

#### 这种写法的精妙之处

1. **零样板注册**:定义类时 \`kind="file"\` 一行搞定,不会忘记注册。
2. **集中管理**:\`Logger.registry\` 自动维护,新增子类即自动入表。
3. **符合开闭原则**:加新日志器只需定义新子类,不碰任何现有代码。
4. **类型安全**:\`create\` 返回 \`Logger\`,IDE 能提示 \`log\` 方法。

#### 注意事项

- \`__init_subclass__\` 在**类定义时**执行(模块加载时),不是运行时。所以子类必须在 \`create\` 调用前被 import。
- 如果用插件系统(运行时动态加载),仍需配合手动注册。

## 七、实战:可配置的日志系统

把上面的技巧组合起来,做一个接近生产可用的日志工厂:

\`\`\`python
from abc import ABC, abstractmethod
import os

class Logger(ABC):
    @abstractmethod
    def log(self, msg: str, level: str = "INFO"): ...

class FileLogger(Logger):
    def __init__(self, path="app.log"):
        self.path = path
    def log(self, msg, level="INFO"):
        with open(self.path, "a") as f:
            f.write(f"[{level}] {msg}\\n")

class ConsoleLogger(Logger):
    def log(self, msg, level="INFO"):
        print(f"[{level}] {msg}")

class NetworkLogger(Logger):
    def __init__(self, host="localhost", port=514):
        self.addr = (host, port)
    def log(self, msg, level="INFO"):
        # 省略实际网络发送
        print(f"-> {self.addr} [{level}] {msg}")

# 工厂:根据配置创建
class LogFactory:
    _builders = {
        "file": lambda cfg: FileLogger(cfg.get("path", "app.log")),
        "console": lambda cfg: ConsoleLogger(),
        "network": lambda cfg: NetworkLogger(cfg.get("host"), cfg.get("port", 514)),
    }

    @classmethod
    def create(cls, config: dict) -> Logger:
        kind = config["kind"]
        builder = cls._builders.get(kind)
        if not builder:
            raise ValueError(f"未知日志器: {kind}")
        return builder(config)

# 从环境配置创建
config = {"kind": os.getenv("LOG_KIND", "console")}
logger = LogFactory.create(config)
logger.log("应用启动")
\`\`\`

这个版本融合了多种思路:

- **抽象基类**:\`Logger\` 定义接口,保证所有日志器都有 \`log\`。
- **lambda 建造器**:每种产品的创建逻辑用 lambda 封装,避免类爆炸。
- **配置驱动**:从环境变量读配置,运行时决定用哪种日志器。
- **统一入口**:\`LogFactory.create(config)\` 是唯一创建入口。

## 八、工厂方法 vs 简单工厂 vs 抽象工厂

这三个名字相近,容易混淆。务必分清:

### 8.1 简单工厂(Simple Factory)

严格说**简单工厂不是 GoF 模式**,它只是个常用技巧:一个工厂类(或函数)根据参数返回不同产品。

\`\`\`python
from logging import Logger
class SimpleLogFactory:
    @staticmethod
    def create(kind: str) -> Logger:
        if kind == "file":
            return FileLogger()
        elif kind == "console":
            return ConsoleLogger()
        else:
            raise ValueError(kind)

logger = SimpleLogFactory.create("console")
\`\`\`

特点:

- **一个工厂,内部 if-elif**。
- **新增产品要改工厂代码**(改 if-elif),违反开闭原则。
- 简单直接,产品少时很好用。

### 8.2 工厂方法(Factory Method)

把"选哪个"延迟到**子类**。每加一种产品,加一个工厂子类,不改现有代码。

\`\`\`python
from abc import abstractmethod
from abc import ABC
class LogFactory(ABC):
    @abstractmethod
    def create(self) -> Logger: ...

class FileLogFactory(LogFactory):
    def create(self): return FileLogger()

class ConsoleLogFactory(LogFactory):
    def create(self): return ConsoleLogger()
\`\`\`

特点:

- **多个工厂子类,每个造一种产品**。
- **新增产品 = 新增工厂子类**,符合开闭原则。
- 适合产品种类稳定但创建逻辑复杂的场景。

### 8.3 抽象工厂(Abstract Factory)

一个工厂创建**一族相关产品**(下一章详讲)。

\`\`\`python
from abc import abstractmethod
from abc import ABC
class UIFactory(ABC):
    @abstractmethod
    def create_button(self): ...
    @abstractmethod
    def create_textbox(self): ...

class WinFactory(UIFactory):
    def create_button(self): return WinButton()
    def create_textbox(self): return WinTextbox()
\`\`\`

特点:

- **一个工厂造多个相关产品**。
- 强调"产品族"概念。
- 详见下一章。

### 8.4 三者对比表

| 维度 | 简单工厂 | 工厂方法 | 抽象工厂 |
| --- | --- | --- | --- |
| 工厂数量 | 1 个 | 多个(每产品一个) | 多个(每族一个) |
| 产品数量 | 多个 | 每工厂一个 | 每工厂多个(一族) |
| 新增产品 | 改工厂代码(违反 OCP) | 加工厂子类(符合 OCP) | 加工厂子类 + 产品族 |
| 关注点 | 选哪个 | 谁来造 | 造一整套配套的 |
| 复杂度 | 低 | 中 | 高 |

### 8.5 选择建议

\`\`\`text
                  需要创建对象
                       │
            产品种类少且稳定?
               │           │
              是           否
               │           │
          简单工厂      需要造一整套配套产品?
                            │
                    ┌───────┴───────┐
                    是              否
                    │               │
                抽象工厂        工厂方法
\`\`\`

## 九、工厂方法的常见变体

### 9.1 参数化工厂方法

一个工厂类 + 参数,根据参数返回不同产品。这其实是简单工厂和工厂方法的折中:

\`\`\`python
from logging import Logger
class LogFactory:
    @staticmethod
    def create(kind: str) -> Logger:
        builders = {
            "file": FileLogger,
            "console": ConsoleLogger,
        }
        return builders[kind]()
\`\`\`

这是 Python 里**最常用**的形式——简单、够用、可扩展(改字典即可)。GoF 原教旨主义者会说它"违反开闭原则"(要改字典),但实际工程中这点改动完全可接受。

### 9.2 工厂方法返回单例

工厂方法返回的对象可以是单例(配合上一章):

\`\`\`python
from logging import Logger
class LoggerFactory:
    _instances = {}

    @classmethod
    def create(cls, kind: str) -> Logger:
        if kind not in cls._instances:
            cls._instances[kind] = _build(kind)
        return cls._instances[kind]
\`\`\`

这样每种日志器全局只有一个实例,既享工厂的灵活性,又享单例的资源节约。

## 十、工厂方法的代价

### 10.1 类数量增加

经典工厂方法会让类的数量翻倍(每产品一个工厂类)。在产品种类多时,这是显著的负担。

### 10.2 增加间接层

客户端不直接 \`new\`,而是通过工厂。多了一层间接,理解代码时要"跳一层"。对于简单场景,这层间接纯属增加认知负担。

### 10.3 过度设计的风险

如果一个系统只有一两种产品,且不会扩展,用工厂方法就是过度设计。GoF 自己也说:"不要为了用模式而用模式"。

## 十一、本章小结

工厂方法的核心是**把对象的创建延迟到子类**,让客户端与具体类解耦。本章要点:

1. **定义**:定义创建接口,子类决定实例化谁。
2. **解决**:客户端不该 \`new\` 具体类,扩展时不必改客户端。
3. **结构**:Product + ConcreteProduct + Creator + ConcreteCreator。
4. **Pythonic 实现**:注册表 + 函数工厂,或 \`__init_subclass__\` 自动注册,大幅减少样板代码。
5. **与简单工厂、抽象工厂的区别**:简单工厂是"一个工厂 if-elif";工厂方法是"多个工厂子类";抽象工厂是"一个工厂造一族"。
6. **代价**:类数量增加、多一层间接,简单场景慎用。

记住判断标准:**当"创建哪种对象"会变化,且你不想让客户端跟着改"时,才用工厂方法**。

## 十二、易错点小结

| 易错点 | 错误表现 | 正确做法 |
| --- | --- | --- |
| 混淆简单工厂与工厂方法 | 把 if-elif 工厂叫"工厂方法" | 工厂方法强调"子类决定",简单工厂是"参数决定" |
| 工厂类不包含业务逻辑 | 工厂只造对象,业务全在客户端 | GoF 的 Creator 常含业务方法,业务依赖抽象产品 |
| 产品没统一接口 | 各产品方法名不一,客户端要分支处理 | 定义 Product 抽象基类,所有产品实现同一接口 |
| 注册表版忘记错误处理 | 传未知类型直接 KeyError | 显式检查并抛出有意义的 ValueError |
| __init_subclass__ 误用 | 以为运行时注册,实际是类定义时 | 类定义时执行,模块没 import 就不会注册 |
| 过度设计 | 一两种产品也上抽象 Creator 体系 | 产品少且稳定用简单工厂或直接 new |
| Pythonic 版丢掉类型约束 | 用 dict 但无类型提示 | 用类型注解 + Protocol,保留 IDE 提示 |
| 工厂返回单例却每次新建 | 工厂方法每次返回新实例,违背单例意图 | 工厂内部缓存实例,或显式说明"每次新实例" |
| 忽略创建失败处理 | 工厂方法抛异常未捕获 | 工厂方法应明确可能失败,客户端 try/except |
| 把工厂方法当万能解 | 到处套工厂,简单 new 也包装 | 直接 new 优先,痛点出现再重构到工厂 |
`,
  },

  // =========================================================
  // 第四章:抽象工厂模式(Abstract Factory)
  // =========================================================
  {
    id: "pyarch-dp-abstract-factory",
    icon: "🏚️",
    title: "抽象工厂模式(Abstract Factory)",
    group: "设计模式 · 创建型",
    content: `# 抽象工厂模式(Abstract Factory)

## 一、模式定义

> **抽象工厂模式**:提供一个创建一系列相关或相互依赖对象的接口,而无需指定它们具体的类。
>
> Provide an interface for creating families of related or dependent objects without specifying their concrete classes.

核心关键词是**"一族(family)"**。抽象工厂和工厂方法的根本区别就在这里:

- **工厂方法**:造**一个**产品,由子类决定造哪种。
- **抽象工厂**:造**一族**配套产品,保证它们相互兼容。

当你需要创建的不是单个对象,而是"一整套必须配套使用的对象"时,抽象工厂登场。

## 二、直觉理解:为什么需要"一族"

### 2.1 跨平台 UI 的痛点

想象你在做一个跨平台 UI 库,要支持 Windows、macOS、Linux 三套风格。每套风格都有一组配套组件:按钮、文本框、滚动条。它们的样式必须**风格统一**:

- Windows 风格:WinButton + WinTextbox + WinScrollbar
- macOS 风格:MacButton + MacTextbox + MacScrollbar
- Linux 风格:LinuxButton + LinuxTextbox + LinuxScrollbar

如果让客户端自己挑组件,很容易出错——比如选了 WinButton 却配了 MacTextbox,界面就成了"缝合怪":

\`\`\`python
# ❌ 客户端自由组合,可能造出不配套的 UI
button = WinButton()
textbox = MacTextbox()    # 风格不一致!用户看到 Win 按钮配 Mac 文本框
\`\`\`

抽象工厂解决这个问题:**一个工厂造一整套,客户端选了工厂,就等于选了整套风格,绝不会错配**。

\`\`\`text
        客户端选工厂
             │
   ┌─────────┼─────────┐
   ▼         ▼         ▼
 WinFactory MacFactory LinuxFactory
   │         │         │
   ├─Button  ├─Button  ├─Button     ← 各自造配套的一组
   ├─Textbox ├─Textbox ├─Textbox
   └─Scroll  └─Scroll  └─Scroll
\`\`\`

### 2.2 多数据库适配的痛点

类似地,一个 ORM 要支持 MySQL、PostgreSQL、SQLite。每种数据库都有一套配套组件:连接器(Connection)、查询构造器(QueryBuilder)、迁移工具(Migration)。这些组件必须配套——MySQL 的 Connection 配 MySQL 的 QueryBuilder,不能混用。

抽象工厂让"选了 MySQL 工厂,就拿到一整套 MySQL 组件",保证兼容性。

## 三、模式结构

### 3.1 类图

\`\`\`text
   ┌─────────────────────┐
   │  AbstractFactory    │  <<interface>>
   │  (抽象工厂)        │
   ├─────────────────────┤
   │ + create_A() → A    │
   │ + create_B() → B    │
   │ + create_C() → C    │
   └──────────┬──────────┘
              │ 实现
   ┌──────────┴──────────┐
   ▼                     ▼
┌────────────┐    ┌────────────┐
│FactoryX    │    │FactoryY    │
├────────────┤    ├────────────┤
│+create_A() │    │+create_A() │  → 返回 XA / YA
│+create_B() │    │+create_B() │  → 返回 XB / YB
│+create_C() │    │+create_C() │  → 返回 XC / YC
└────────────┘    └────────────┘

  产品族 X:XA, XB, XC        产品族 Y:YA, YB, YC
  (互配套,风格统一)        (互配套,风格统一)
\`\`\`

### 3.2 核心角色

| 角色 | 职责 |
| --- | --- |
| **AbstractFactory(抽象工厂)** | 声明创建一族产品的方法 |
| **ConcreteFactory(具体工厂)** | 实现方法,返回本族的具体产品 |
| **AbstractProduct(抽象产品)** | 每种产品的统一接口(如 Button、Textbox) |
| **ConcreteProduct(具体产品)** | 具体工厂创建的具体对象(如 WinButton) |
| **Client(客户端)** | 只依赖抽象工厂和抽象产品,不碰具体类 |

### 3.3 关键约束:一族内的产品必须配套

抽象工厂的隐含契约是:**同一个工厂返回的产品,是设计成配套使用的**。客户端不应该把 WinFactory 的 Button 和 MacFactory 的 Textbox 混用——虽然语法上可能允许,但语义上违反了模式意图。

## 四、经典 OOP 实现:跨数据库工厂

下面实现一个跨数据库的抽象工厂:每种数据库工厂创建配套的 Connection、QueryBuilder、Migration。

### 4.1 抽象产品

\`\`\`python
from abc import ABC, abstractmethod

# ---- 抽象产品 A: Connection ----
class Connection(ABC):
    @abstractmethod
    def connect(self, url: str): ...

    @abstractmethod
    def execute(self, sql: str): ...

# ---- 抽象产品 B: QueryBuilder ----
class QueryBuilder(ABC):
    @abstractmethod
    def select(self, table: str, columns: list) -> str: ...

    @abstractmethod
    def insert(self, table: str, data: dict) -> str: ...

# ---- 抽象产品 C: Migration ----
class Migration(ABC):
    @abstractmethod
    def create_table(self, name: str, columns: dict) -> str: ...
\`\`\`

### 4.2 MySQL 产品族

\`\`\`python
# ---- MySQL 具体产品 ----
class MySQLConnection(Connection):
    def connect(self, url: str):
        print(f"MySQL 连接: {url}")
    def execute(self, sql: str):
        print(f"MySQL 执行: {sql}")

class MySQLQueryBuilder(QueryBuilder):
    def select(self, table, columns):
        cols = ", ".join(columns)
        return f"SELECT {cols} FROM {table} LIMIT 100"
    def insert(self, table, data):
        cols = ", ".join(data.keys())
        vals = ", ".join(f"'{v}'" for v in data.values())
        return f"INSERT INTO {table} ({cols}) VALUES ({vals})"

class MySQLMigration(Migration):
    def create_table(self, name, columns):
        cols = ", ".join(f"{k} {v}" for k, v in columns.items())
        return f"CREATE TABLE {name} ({cols}) ENGINE=InnoDB"
\`\`\`

### 4.3 PostgreSQL 产品族

\`\`\`python
class PostgresConnection(Connection):
    def connect(self, url: str):
        print(f"PostgreSQL 连接: {url}")
    def execute(self, sql: str):
        print(f"PostgreSQL 执行: {sql}")

class PostgresQueryBuilder(QueryBuilder):
    def select(self, table, columns):
        cols = ", ".join(columns)
        return f'SELECT {cols} FROM "{table}" LIMIT 100'
    def insert(self, table, data):
        cols = ", ".join(data.keys())
        placeholders = ", ".join(f"%({k})s" for k in data)
        return f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"

class PostgresMigration(Migration):
    def create_table(self, name, columns):
        cols = ", ".join(f"{k} {v}" for k, v in columns.items())
        return f'CREATE TABLE "{name}" ({cols})'
\`\`\`

### 4.4 抽象工厂与具体工厂

\`\`\`python
from abc import abstractmethod
from abc import ABC
# ---- 抽象工厂 ----
class DatabaseFactory(ABC):
    @abstractmethod
    def create_connection(self) -> Connection: ...

    @abstractmethod
    def create_query_builder(self) -> QueryBuilder: ...

    @abstractmethod
    def create_migration(self) -> Migration: ...

# ---- MySQL 工厂 ----
class MySQLFactory(DatabaseFactory):
    def create_connection(self): return MySQLConnection()
    def create_query_builder(self): return MySQLQueryBuilder()
    def create_migration(self): return MySQLMigration()

# ---- PostgreSQL 工厂 ----
class PostgresFactory(DatabaseFactory):
    def create_connection(self): return PostgresConnection()
    def create_query_builder(self): return PostgresQueryBuilder()
    def create_migration(self): return PostgresMigration()
\`\`\`

### 4.5 客户端:只依赖抽象

\`\`\`python
class Application:
    def __init__(self, factory: DatabaseFactory):
        self.conn = factory.create_connection()
        self.qb = factory.create_query_builder()
        self.mig = factory.create_migration()

    def run(self, db_url: str):
        self.conn.connect(db_url)
        # 用配套的 QueryBuilder 生成 SQL,再用配套的 Connection 执行
        sql = self.qb.select("users", ["id", "name"])
        self.conn.execute(sql)
        # 用配套的 Migration 建表
        ddl = self.mig.create_table("orders", {"id": "SERIAL", "amount": "DECIMAL"})
        self.conn.execute(ddl)

# 用 MySQL 一整套
app = Application(MySQLFactory())
app.run("mysql://localhost/mydb")
# 输出:
# MySQL 连接: mysql://localhost/mydb
# MySQL 执行: SELECT id, name FROM users LIMIT 100
# MySQL 执行: CREATE TABLE orders (id SERIAL, amount DECIMAL) ENGINE=InnoDB

# 切换到 PostgreSQL,客户端 Application 代码不变
app = Application(PostgresFactory())
app.run("postgres://localhost/mydb")
# 输出:
# PostgreSQL 连接: postgres://localhost/mydb
# PostgreSQL 执行: SELECT id, name FROM "users" LIMIT 100
# PostgreSQL 执行: CREATE TABLE "orders" (id SERIAL, amount DECIMAL)
\`\`\`

#### 设计亮点

1. **客户端 \`Application\` 完全不知道具体是 MySQL 还是 PostgreSQL**——它只跟抽象工厂和抽象产品打交道。
2. **一族产品保证配套**:\`MySQLFactory\` 返回的 Connection、QueryBuilder、Migration 都是 MySQL 风格,SQL 语法一致,不会错配。
3. **扩展新数据库**只需加一组产品类 + 一个工厂类,不改任何现有代码。

## 五、用 Protocol 实现更轻量的版本

Python 3.8+ 的 \`typing.Protocol\` 提供**结构化类型**(鸭子类型的静态检查版)。用 Protocol 可以省去抽象基类,让代码更轻:

\`\`\`python
from typing import Protocol

# 用 Protocol 定义接口,不需要继承
class Connection(Protocol):
    def connect(self, url: str) -> None: ...
    def execute(self, sql: str) -> None: ...

class QueryBuilder(Protocol):
    def select(self, table: str, columns: list) -> str: ...

class DatabaseFactory(Protocol):
    def create_connection(self) -> Connection: ...
    def create_query_builder(self) -> QueryBuilder: ...

# 具体类不需要显式继承 Protocol
class SQLiteConnection:   # 不写 (Connection),只要有方法就符合
    def connect(self, url): print(f"SQLite 连接: {url}")
    def execute(self, sql): print(f"SQLite 执行: {sql}")

class SQLiteQueryBuilder:
    def select(self, table, columns):
        cols = ", ".join(columns)
        return f"SELECT {cols} FROM {table} LIMIT 100"

class SQLiteFactory:
    def create_connection(self): return SQLiteConnection()
    def create_query_builder(self): return SQLiteQueryBuilder()

# 静态类型检查器会确认 SQLiteFactory 符合 DatabaseFactory 协议
def app(factory: DatabaseFactory):
    conn = factory.create_connection()
    conn.connect("sqlite:///app.db")

app(SQLiteFactory())  # 类型安全 + 无继承样板
\`\`\`

### 5.1 Protocol vs ABC 的取舍

| 维度 | ABC(抽象基类) | Protocol |
| --- | --- | --- |
| 类型关系 | 显式继承(\`class X(Base)\`) | 结构化(有方法即符合) |
| 运行时检查 | \`isinstance\` 可用 | 默认不可(可用 \`@runtime_checkable\`) |
| 样板代码 | 多(要继承) | 少(不用继承) |
| 适合场景 | 强约束、需要 \`isinstance\` | 鸭子类型 + 静态检查 |
| Python 风格 | 偏 Java | 更 Pythonic |

实际项目中,如果只是定义接口供类型检查,**Protocol 更轻**;如果需要运行时强制约束(\`isinstance\`、禁止实例化抽象类),用 **ABC**。

## 六、抽象工厂 vs 工厂方法:核心区别

这两个模式最容易混淆。务必记住**一个 vs 一族**的区别。

### 6.1 对比表

| 维度 | 工厂方法 | 抽象工厂 |
| --- | --- | --- |
| 创建的产品数 | **一个** | **一族**(多个配套) |
| 工厂方法数 | 一个 | 多个(每种产品一个) |
| 关键概念 | 子类决定实例化谁 | 一族配套产品 |
| 扩展产品种类 | 加工厂子类 | **改抽象工厂接口**(违反 OCP) |
| 扩展产品族 | 不涉及 | 加工厂子类(符合 OCP) |
| 典型场景 | 单一产品选择 | 跨平台/多数据库/多主题 |

### 6.2 一个关键的不对称性:开闭原则的方向

抽象工厂有一个**著名的开闭原则"不对称"**:

- **新增产品族**(如新增 OracleFactory):符合开闭原则,加一个工厂类即可。
- **新增产品种类**(如在 Connection/QueryBuilder/Migration 之外加 SchemaManager):**违反开闭原则**,因为要修改抽象工厂接口,所有具体工厂都要改。

\`\`\`text
                    开闭原则对抽象工厂的方向

  新增产品族(纵向):✅ 符合 OCP
  ┌────────────────────────────────────┐
  │  Connection  QueryBuilder  Migration│
  ├────────────────────────────────────┤
  │  MySQL        MySQLQB       MySQLMig│ ← 新加一行 = 加一个工厂
  │  Postgres     ...           ...     │
  │  Oracle       ...           ...     │ ← 新增族,符合 OCP
  └────────────────────────────────────┘

  新增产品种类(横向):❌ 违反 OCP
  ┌─────────────────────────────────────────────┐
  │  Connection  QueryBuilder  Migration  Schema │ ← 加一列 = 改接口
  ├─────────────────────────────────────────────┤
  │  MySQL        MySQLQB       MySQLMig  ???    │ ← 所有工厂都要改
  └─────────────────────────────────────────────┘
\`\`\`

所以选择抽象工厂前要判断:**未来更可能加"产品族"还是"产品种类"?** 如果是前者,抽象工厂合适;如果是后者,抽象工厂会成为负担。

## 七、实战:跨平台 UI 工厂

再用一个 UI 主题的例子巩固理解:

\`\`\`python
from abc import ABC, abstractmethod

# 抽象产品
class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...

class Textbox(ABC):
    @abstractmethod
    def render(self) -> str: ...

class Scrollbar(ABC):
    @abstractmethod
    def render(self) -> str: ...

# Windows 产品族
class WinButton(Button):
    def render(self): return "[Win 按钮]"

class WinTextbox(Textbox):
    def render(self): return "[Win 文本框]"

class WinScrollbar(Scrollbar):
    def render(self): return "[Win 滚动条]"

# Mac 产品族
class MacButton(Button):
    def render(self): return "[Mac 按钮]"

class MacTextbox(Textbox):
    def render(self): return "[Mac 文本框]"

class MacScrollbar(Scrollbar):
    def render(self): return "[Mac 滚动条]"

# 抽象工厂
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...
    @abstractmethod
    def create_textbox(self) -> Textbox: ...
    @abstractmethod
    def create_scrollbar(self) -> Scrollbar: ...

class WinUIFactory(UIFactory):
    def create_button(self): return WinButton()
    def create_textbox(self): return WinTextbox()
    def create_scrollbar(self): return WinScrollbar()

class MacUIFactory(UIFactory):
    def create_button(self): return MacButton()
    def create_textbox(self): return MacTextbox()
    def create_scrollbar(self): return MacScrollbar()

# 客户端:渲染整个窗口,组件保证风格统一
def render_window(factory: UIFactory):
    button = factory.create_button()
    textbox = factory.create_textbox()
    scrollbar = factory.create_scrollbar()
    print("窗口渲染:")
    print(" ", button.render(), textbox.render(), scrollbar.render())

# 切换主题只需换工厂
render_window(WinUIFactory())
# 窗口渲染:
#  [Win 按钮] [Win 文本框] [Win 滚动条]

render_window(MacUIFactory())
# 窗口渲染:
#  [Mac 按钮] [Mac 文本框] [Mac 滚动条]
\`\`\`

注意:无论怎么切换工厂,渲染出来的组件**风格必然统一**,不可能出现 Win 按钮配 Mac 文本框——这就是抽象工厂的价值。

## 八、抽象工厂的 Pythonic 简化

经典抽象工厂类很多,Python 里可以用**字典 + 闭包**大幅简化:

\`\`\`python
# 用字典组织产品族,工厂用函数返回整族
UI_FAMILIES = {
    "windows": {
        "button": WinButton,
        "textbox": WinTextbox,
        "scrollbar": WinScrollbar,
    },
    "mac": {
        "button": MacButton,
        "textbox": MacTextbox,
        "scrollbar": MacScrollbar,
    },
}

def create_ui_factory(theme: str):
    family = UI_FAMILIES[theme]
    class _Factory:
        def create_button(self): return family["button"]()
        def create_textbox(self): return family["textbox"]()
        def create_scrollbar(self): return family["scrollbar"]()
    return _Factory()

factory = create_ui_factory("mac")
print(factory.create_button().render())  # [Mac 按钮]
\`\`\`

这种写法把"产品族"显式地用字典表达,新增主题只需加一个字典条目,比堆十几个类清晰得多。

## 九、抽象工厂的代价

### 9.1 类爆炸

抽象工厂是所有创建型模式里**类最多的**。N 个产品种类 × M 个产品族 = N×M 个具体产品类,再加 M 个工厂类。在产品种类和族都多时,类数量迅速膨胀。

### 9.2 扩展产品种类困难

如前所述,新增一种产品(如加 SchemaManager)要修改抽象工厂接口和所有具体工厂,违反开闭原则。这是抽象工厂**最被诟病**的地方。

### 9.3 过度设计的高发区

抽象工厂是"重型武器",很多本可以用简单工厂或工厂方法解决的场景,被硬套成抽象工厂,导致代码复杂度激增。判断标准:**你真的需要"一整套配套"吗?还是其实只是要"多个独立产品"?** 如果产品之间没有"必须配套"的约束,用抽象工厂就是过度设计。

## 十、何时该用抽象工厂

| 适合 | 不适合 |
| --- | --- |
| 产品必须配套使用(如 UI 组件风格) | 产品相互独立,可自由组合 |
| 系统需要独立于产品的创建方式 | 产品种类很少且稳定 |
| 需要在运行时切换整族产品 | 只需创建单个产品(用工厂方法) |
| 未来扩展主要是新增产品族 | 未来扩展主要是新增产品种类 |

## 十一、本章小结

抽象工厂的核心是**创建一族配套产品**。本章要点:

1. **定义**:提供创建一族相关对象的接口,无需指定具体类。
2. **解决**:产品必须配套,不能错配;客户端要独立于产品创建。
3. **结构**:AbstractFactory + ConcreteFactory + 多个 AbstractProduct + 多个 ConcreteProduct。
4. **核心区别**:工厂方法造**一个**,抽象工厂造**一族**。
5. **开闭原则的不对称**:新增族符合 OCP,新增种类违反 OCP——选型时要预判扩展方向。
6. **Pythonic 简化**:用 Protocol 或字典 + 闭包大幅减少样板。
7. **代价**:类爆炸、扩展种类难、过度设计高发——非"必须配套"场景慎用。

## 十二、易错点小结

| 易错点 | 错误表现 | 正确做法 |
| --- | --- | --- |
| 混淆工厂方法与抽象工厂 | 把造一个产品的叫抽象工厂 | 抽象工厂造一族配套,工厂方法造单个 |
| 跨族混用产品 | WinFactory 的产品配 MacFactory 的 | 一个工厂的产物配套用,不跨工厂混用 |
| 新增产品种类时只改一个工厂 | 加 SchemaManager 只改 MySQLFactory | 必须改抽象接口 + 所有具体工厂 |
| 误以为符合所有方向的 OCP | 以为加种类也符合开闭原则 | 只对"加族"符合,加种类违反 |
| 过度设计 | 产品独立可组合也套抽象工厂 | 无配套约束用工厂方法或简单工厂 |
| 类爆炸不控制 | 几十种产品 × 多族堆几百个类 | 用字典/Protocol 简化,或重新评估必要性 |
| Protocol 当 ABC 用 | 以为 Protocol 能强制运行时约束 | Protocol 默认仅静态检查,需运行时用 ABC |
| 客户端依赖具体工厂 | \`app = Application(MySQLFactory())\` 写死 | 通过配置注入工厂,客户端只依赖抽象 |
| 抽象工厂返回单例未考虑 | 每次创建返回新连接对象 | 连接等昂贵资源可在工厂内缓存 |
| 忽略产品族的一致性 | 同族产品语义不一致(如 MySQLQB 生成 PG 语法) | 同族产品必须配套设计,统一测试 |
`,
  },

  // =========================================================
  // 第五章:建造者模式(Builder)
  // =========================================================
  {
    id: "pyarch-dp-builder",
    icon: "🧱",
    title: "建造者模式(Builder)",
    group: "设计模式 · 创建型",
    content: `# 建造者模式(Builder)

## 一、模式定义

> **建造者模式**:将一个复杂对象的构建与它的表示分离,使得同样的构建过程可以创建不同的表示。
>
> Separate the construction of a complex object from its representation so that the same construction process can create different representations.

核心思想:**把"复杂对象的构造过程"独立出来,一步步组装**。

适用场景是:一个对象有很多可选参数、构造步骤复杂,直接用构造函数会写出"参数地狱"。建造者把这些步骤拆开,让你**像搭积木一样**一步步拼出对象。

## 二、直觉理解:为什么需要建造者

### 2.1 参数地狱

考虑一个 SQL 查询对象,它有 select 的列、from 的表、where 条件、group by、order by、limit……如果全塞进构造函数:

\`\`\`python
# ❌ 参数地狱:8 个参数,大部分还是可选的
query = Query(
    columns=["id", "name"],
    table="users",
    where="age > 18",
    group_by=None,
    having=None,
    order_by="name",
    limit=100,
    offset=0,
)
\`\`\`

问题:

1. **参数太多,容易写错位置**:第 5 个参数是 having 还是 group_by?不查文档记不住。
2. **大量 None**:大多数查询只用其中几项,其余全填 None,噪音很大。
3. **可读性差**:光看构造调用,很难一眼看出这个查询到底干了什么。
4. **难以扩展**:再加一个参数(如 distinct),所有调用点都要考虑。

### 2.2 建造者的思路:分步 + 链式

建造者把构造拆成一组语义明确的方法,每个方法负责一部分,且**返回自身以支持链式调用**:

\`\`\`python
# ✅ 建造者:语义清晰,只写需要的部分
query = (QueryBuilder()
    .select("id", "name")
    .from_table("users")
    .where("age > 18")
    .order_by("name")
    .limit(100)
    .build())

print(query)
# SELECT id, name FROM users WHERE age > 18 ORDER BY name LIMIT 100
\`\`\`

对比一下,建造者版本:

- **每个方法名就是 SQL 关键字**,读代码像读 SQL。
- **只写需要的步骤**,不需要的 where/order_by 直接不调用。
- **参数顺序自由**,先 where 后 order_by 还是反过来都行(只要 SQL 语义允许)。
- **链式调用**,一气呵成。

这就是建造者的魅力。

## 三、模式结构

### 3.1 GoF 经典结构:Director + Builder

GoF 原版的建造者有两个核心角色:

\`\`\`text
   ┌──────────────┐         ┌──────────────────┐
   │   Director   │ ──────> │   Builder        │ <<abstract>>
   │   (指挥者)  │  build  │   (建造者接口)  │
   ├──────────────┤         ├──────────────────┤
   │ + construct()│         │ + build_part_a() │
   │              │         │ + build_part_b() │
   │              │         │ + get_result()   │
   └──────────────┘         └────────┬─────────┘
                                     │ 实现
                            ┌────────┴─────────┐
                            ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐
                    │ConcreteBuilder│  │ConcreteBuilder│
                    │      A        │   │      B        │
                    └──────────────┘   └──────────────┘
\`\`\`

- **Director(指挥者)**:封装"构造步骤的顺序",调用 Builder 的各个 build 方法。
- **Builder(建造者接口)**:声明各部件的构造方法。
- **ConcreteBuilder(具体建造者)**:实现各部件构造,最终产出产品。

Director 的价值是**复用构造流程**:同样的流程,换不同 Builder,产出不同表示。

### 3.2 Pythonic 结构:链式 Builder(无 Director)

在实际 Python 项目里,**Director 经常被省略**。客户端直接调 Builder 的链式方法,自己掌控步骤。这更灵活,也更 Pythonic:

\`\`\`text
   客户端 ──链式调用──> Builder ──build()──> Product
           (select/where/...)
\`\`\`

下面两种结构都会讲。

## 四、经典 Director + Builder 实现

先用 GoF 经典结构实现一个"HTML 文档生成器":Director 控制生成流程,Builder 负责具体拼接。

\`\`\`python
from abc import ABC, abstractmethod

# ---- 产品 ----
class HTMLDocument:
    def __init__(self):
        self.parts = []
    def add(self, part: str):
        self.parts.append(part)
    def __str__(self):
        return "\\n".join(self.parts)

# ---- 抽象建造者 ----
class HTMLBuilder(ABC):
    def __init__(self):
        self.doc = HTMLDocument()

    @abstractmethod
    def build_title(self, title: str): ...

    @abstractmethod
    def build_heading(self, text: str): ...

    @abstractmethod
    def build_paragraph(self, text: str): ...

    def get_result(self) -> HTMLDocument:
        return self.doc

# ---- 具体建造者:HTML5 风格 ----
class HTML5Builder(HTMLBuilder):
    def build_title(self, title):
        self.doc.add(f"<title>{title}</title>")
    def build_heading(self, text):
        self.doc.add(f"<h1>{text}</h1>")
    def build_paragraph(self, text):
        self.doc.add(f"<p>{text}</p>")

# ---- 具体建造者:Markdown 风格 ----
class MarkdownBuilder(HTMLBuilder):
    def build_title(self, title):
        self.doc.add(f"# {title}")
    def build_heading(self, text):
        self.doc.add(f"## {text}")
    def build_paragraph(self, text):
        self.doc.add(text)

# ---- 指挥者:封装构造流程 ----
class Director:
    def __init__(self, builder: HTMLBuilder):
        self.builder = builder

    def construct_article(self, title: str, heading: str, body: str):
        # 同样的流程,换不同 Builder 产出不同格式
        self.builder.build_title(title)
        self.builder.build_heading(heading)
        self.builder.build_paragraph(body)

# ---- 客户端 ----
# 用 HTML5 Builder
html_builder = HTML5Builder()
Director(html_builder).construct_article("My Page", "Welcome", "Hello world")
print(html_builder.get_result())
# <title>My Page</title>
# <h1>Welcome</h1>
# <p>Hello world</p>

# 用 Markdown Builder,同样的流程,不同输出
md_builder = MarkdownBuilder()
Director(md_builder).construct_article("My Page", "Welcome", "Hello world")
print(md_builder.get_result())
# # My Page
# ## Welcome
# Hello world
\`\`\`

#### Director 的价值体现

注意 \`Director.construct_article\` 这段流程(title → heading → paragraph)是**复用**的。换不同 Builder,流程不变,输出格式变。这就是 GoF 说的"同样的构建过程创建不同的表示"。

#### 何时需要 Director

- 构造步骤有**固定顺序**或**复杂流程**,需要复用。
- 同一套流程要支持**多种输出格式**。
- 想把"构造算法"与"具体构造实现"解耦。

如果构造流程简单、每次都不同,Director 就是多余的,直接用链式 Builder 更好(见下一节)。

## 五、Pythonic 实现:链式调用 + dataclass

链式调用(fluent interface)是 Python 里建造者最常见的形式。每个方法返回 \`self\`,最后 \`build()\` 返回不可变的最终对象。

### 5.1 链式 Builder 基本结构

\`\`\`python
from dataclasses import dataclass, field
from typing import Optional

# ---- 不可变的产品对象 ----
@dataclass(frozen=True)
class Query:
    columns: tuple = ()
    table: str = ""
    where_clause: Optional[str] = None
    order_clause: Optional[str] = None
    limit_value: Optional[int] = None

# ---- 链式建造者 ----
class QueryBuilder:
    def __init__(self):
        self._columns = []
        self._table = ""
        self._where = None
        self._order = None
        self._limit = None

    def select(self, *columns):
        self._columns.extend(columns)
        return self           # 返回 self 支持链式

    def from_table(self, table):
        self._table = table
        return self

    def where(self, condition):
        self._where = condition
        return self

    def order_by(self, column):
        self._order = column
        return self

    def limit(self, n):
        self._limit = n
        return self

    def build(self) -> Query:
        return Query(
            columns=tuple(self._columns),
            table=self._table,
            where_clause=self._where,
            order_clause=self._order,
            limit_value=self._limit,
        )

    def to_sql(self) -> str:
        sql = f"SELECT {', '.join(self._columns) or '*'} FROM {self._table}"
        if self._where:
            sql += f" WHERE {self._where}"
        if self._order:
            sql += f" ORDER BY {self._order}"
        if self._limit is not None:
            sql += f" LIMIT {self._limit}"
        return sql

# ---- 使用 ----
q = (QueryBuilder()
    .select("id", "name", "email")
    .from_table("users")
    .where("age > 18 AND status = 'active'")
    .order_by("name")
    .limit(50)
    .build())

print(q)              # Query(columns=('id','name','email'), ...)
print(q.table)        # users
print(q.where_clause) # age > 18 AND status = 'active'
\`\`\`

### 5.2 设计要点

#### 要点 1:Builder 可变,Product 不可变

- **Builder** 是可变的,积累状态。\`frozen=False\`(默认)。
- **Product(Query)** 是不可变的(\`frozen=True\`),构造完就不该改。

这样保证:构造过程中 Builder 状态可变,但 \`build()\` 出来的对象是安全的、可共享的、线程友好的。

#### 要点 2:每个方法返回 self

\`return self\` 是链式调用的关键。它让你能把多个调用串起来:

\`\`\`python
(QueryBuilder()
    .select(...)
    .from_table(...)
    .where(...)
    .build())   # 一条链
\`\`\`

#### 要点 3:build() 做校验

\`build()\` 是构造的最后一关,应当做**完整性校验**:

\`\`\`python
def build(self) -> Query:
    if not self._table:
        raise ValueError("缺少 FROM 表名")
    if not self._columns:
        # 可以默认 SELECT *,也可以报错
        pass
    return Query(...)
\`\`\`

把校验集中在 \`build()\`,而不是每个 setter 里,这样部分构造时不会过早报错。

#### 要点 4:支持默认值与可选步骤

where、order_by、limit 都是可选的,不调用就用默认值(None)。这正是建造者相对构造函数的优势——**可选步骤直接不调用,而不是塞一堆 None**。

## 六、实战:完整的 SQL 查询构造器

下面实现一个更完整的 SQL 构造器,支持 JOIN、GROUP BY、HAVING、子查询等:

\`\`\`python
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

@dataclass(frozen=True)
class SQLQuery:
    distinct: bool = False
    columns: Tuple[str, ...] = ()
    table: str = ""
    joins: Tuple[str, ...] = ()
    where: Optional[str] = None
    group_by: Tuple[str, ...] = ()
    having: Optional[str] = None
    order_by: Tuple[str, ...] = ()
    limit: Optional[int] = None
    offset: Optional[int] = None

    def to_sql(self) -> str:
        parts = []
        cols = ", ".join(self.columns) if self.columns else "*"
        parts.append(f"SELECT {'DISTINCT ' if self.distinct else ''}{cols}")
        parts.append(f"FROM {self.table}")
        for j in self.joins:
            parts.append(j)
        if self.where:
            parts.append(f"WHERE {self.where}")
        if self.group_by:
            parts.append(f"GROUP BY {', '.join(self.group_by)}")
        if self.having:
            parts.append(f"HAVING {self.having}")
        if self.order_by:
            parts.append(f"ORDER BY {', '.join(self.order_by)}")
        if self.limit is not None:
            parts.append(f"LIMIT {self.limit}")
        if self.offset is not None:
            parts.append(f"OFFSET {self.offset}")
        return " ".join(parts)


class SelectBuilder:
    def __init__(self):
        self._distinct = False
        self._columns: List[str] = []
        self._table = ""
        self._joins: List[str] = []
        self._where: Optional[str] = None
        self._group_by: List[str] = []
        self._having: Optional[str] = None
        self._order_by: List[str] = []
        self._limit: Optional[int] = None
        self._offset: Optional[int] = None

    def select(self, *columns: str) -> "SelectBuilder":
        self._columns.extend(columns)
        return self

    def distinct(self) -> "SelectBuilder":
        self._distinct = True
        return self

    def from_table(self, table: str) -> "SelectBuilder":
        self._table = table
        return self

    def join(self, table: str, on: str, kind: str = "INNER") -> "SelectBuilder":
        self._joins.append(f"{kind} JOIN {table} ON {on}")
        return self

    def where(self, condition: str) -> "SelectBuilder":
        # 多次调用用 AND 连接
        if self._where:
            self._where = f"({self._where}) AND ({condition})"
        else:
            self._where = condition
        return self

    def group_by(self, *columns: str) -> "SelectBuilder":
        self._group_by.extend(columns)
        return self

    def having(self, condition: str) -> "SelectBuilder":
        self._having = condition
        return self

    def order_by(self, *columns: str) -> "SelectBuilder":
        self._order_by.extend(columns)
        return self

    def limit(self, n: int) -> "SelectBuilder":
        self._limit = n
        return self

    def offset(self, n: int) -> "SelectBuilder":
        self._offset = n
        return self

    def build(self) -> SQLQuery:
        if not self._table:
            raise ValueError("缺少 FROM 表名")
        return SQLQuery(
            distinct=self._distinct,
            columns=tuple(self._columns),
            table=self._table,
            joins=tuple(self._joins),
            where=self._where,
            group_by=tuple(self._group_by),
            having=self._having,
            order_by=tuple(self._order_by),
            limit=self._limit,
            offset=self._offset,
        )

    def to_sql(self) -> str:
        return self.build().to_sql()


# ---- 使用示例 ----
sql = (SelectBuilder()
    .select("u.id", "u.name", "COUNT(o.id) AS order_count")
    .from_table("users u")
    .join("orders o", "o.user_id = u.id", "LEFT")
    .where("u.age > 18")
    .where("u.status = 'active'")
    .group_by("u.id", "u.name")
    .having("COUNT(o.id) > 5")
    .order_by("order_count DESC")
    .limit(20)
    .to_sql())

print(sql)
# SELECT u.id, u.name, COUNT(o.id) AS order_count FROM users u
# LEFT JOIN orders o ON o.user_id = u.id
# WHERE (u.age > 18) AND (u.status = 'active')
# GROUP BY u.id, u.name HAVING COUNT(o.id) > 5
# ORDER BY order_count DESC LIMIT 20
\`\`\`

这个构造器的亮点:

1. **多次 where 自动用 AND 连接**,语义自然。
2. **支持 JOIN、GROUP BY、HAVING、OFFSET** 等完整 SQL 语义。
3. **Product(SQLQuery) 不可变**,可安全传递和缓存。
4. **to_sql() 在 Product 上**,Builder 只是构造工具,SQL 生成是 Product 的职责。
5. **build() 校验必需字段**(表名),防呆。

## 七、简化版:用 __init__ 默认参数

有时候对象没那么复杂,用 \`dataclass\` 的默认参数就够了,不必上完整 Builder:

\`\`\`python
from dataclasses import dataclass
from typing import Optional

@dataclass
class SimpleQuery:
    columns: tuple = ("*",)
    table: str = ""
    where: Optional[str] = None
    order_by: Optional[str] = None
    limit: Optional[int] = None

    def to_sql(self) -> str:
        sql = f"SELECT {', '.join(self.columns)} FROM {self.table}"
        if self.where:
            sql += f" WHERE {self.where}"
        if self.order_by:
            sql += f" ORDER BY {self.order_by}"
        if self.limit is not None:
            sql += f" LIMIT {self.limit}"
        return sql

# 用关键字参数,可读性也不错
q = SimpleQuery(
    columns=("id", "name"),
    table="users",
    where="age > 18",
    order_by="name",
    limit=100,
)
print(q.to_sql())
\`\`\`

### 7.1 何时用简化版,何时用 Builder

| 情况 | 推荐 |
| --- | --- |
| 参数少于 5 个,多数有合理默认值 | 简化版(dataclass + 默认参数) |
| 参数多且有复杂的构造逻辑(如多次 where 累加) | Builder |
| 需要分步构造、链式调用 | Builder |
| 需要构造过程和表示分离(多种输出格式) | 经典 Director + Builder |
| 对象基本不可变,构造一次定型 | Builder(产出 frozen dataclass) |

**原则:先用最简单的(dataclass 默认参数),复杂度上来了再升级到 Builder**。不要一上来就堆 Builder。

## 八、建造者 vs 工厂:核心区别

建造者和工厂都创建对象,但关注点截然不同:

### 8.1 对比表

| 维度 | 工厂(方法/抽象) | 建造者 |
| --- | --- | --- |
| 关注点 | **创建哪种**对象 | **如何构造**对象 |
| 一步 vs 多步 | 一步创建(调一次工厂方法) | 多步构造(调多个 build 方法) |
| 产品复杂度 | 简单产品 | 复杂产品(多部件、多可选参数) |
| 返回时机 | 调用即返回完整产品 | 最后 \`build()\` 才返回 |
| 典型场景 | 选择具体类 | 组装复杂配置/查询/文档 |

### 8.2 一句话区分

- **工厂**:**一步**造出对象,重点是"造哪种"。
- **建造者**:**多步**组装对象,重点是"怎么组装"。

### 8.3 举例对比

\`\`\`python
# 工厂:一步到位,选哪种日志器
logger = LogFactory.create("file")  # 一次调用,返回完整对象

# 建造者:多步组装,关注构造过程
query = (QueryBuilder()        # 开始
    .select("id")              # 第 1 步
    .from_table("users")       # 第 2 步
    .where("age > 18")         # 第 3 步
    .build())                  # 最后产出
\`\`\`

工厂是"给我一个文件日志器",建造者是"我要选 id 列、从 users 表、条件 age>18、最后组装成查询"。前者关心"哪种",后者关心"怎么拼"。

## 九、链式 Builder 的常见陷阱

### 9.1 build() 后继续修改 Builder

\`\`\`python
# ❌ build() 后又改 Builder,但已 build 的对象不变
b = QueryBuilder().select("id").from_table("users")
q1 = b.build()
b.where("age > 18")
q2 = b.build()
# q1 和 q2 是不同对象,但容易混淆:以为 q1 也变了
\`\`\`

解决:要么约定 Builder 一次性使用,要么 \`build()\` 后清除状态。更彻底的做法是让 Builder 的每次 build 都基于当前状态生成新对象,Builder 本身可继续用,但要清楚每次 build 是快照。

### 9.2 链式调用忘 return self

\`\`\`python
# ❌ 忘了 return self,链断了
def select(self, *cols):
    self._columns.extend(cols)
    # 缺 return self
\`\`\`

链式 Builder 的每个方法**必须** return self,否则 \`QueryBuilder().select(...).from_table(...)\` 会在 select 后返回 None,报 \`AttributeError\`。

### 9.3 build() 不做校验

\`\`\`python
# ❌ build 不校验,产出残缺对象
def build(self):
    return Query(self._columns, self._table)  # table 可能是空字符串
\`\`\`

\`build()\` 应该校验必需字段,早暴露错误比晚暴露好。

### 9.4 Builder 状态可变导致复用问题

\`\`\`python
# ❌ 复用同一个 Builder 构造多个对象,状态污染
b = QueryBuilder().from_table("users")
q1 = b.select("id").build()
q2 = b.select("name").build()
# q2 的 columns 是 ['id', 'name']!因为 select 是 extend 不是赋值
\`\`\`

解决:要么每次构造新建 Builder,要么在 build() 里重置状态,要么明确语义("select 是追加"还是"覆盖")。

## 十、建造者与其他模式组合

### 10.1 建造者 + 不可变对象(frozen dataclass)

这是最推荐的组合:Builder 可变积累,Product 不可变。如前文 SQLQuery 示例。

### 10.2 建造者 + 工厂

工厂决定"造哪种 Builder",Builder 负责"怎么造":

\`\`\`python
def get_builder(dialect: str) -> SelectBuilder:
    if dialect == "mysql":
        return MySQLSelectBuilder()
    elif dialect == "postgres":
        return PostgresSelectBuilder()
\`\`\`

### 10.3 建造者 + 原型

Builder 的初始状态可以从一个原型克隆而来,在此基础上修改。这种组合在配置对象中常见。

## 十一、Pythonic 建造者的小技巧

### 11.1 用 dataclass 的 field 简化默认值

\`\`\`python
from typing import Optional
from dataclasses import dataclass, field

@dataclass
class BuilderState:
    columns: list = field(default_factory=list)
    table: str = ""
    where: Optional[str] = None
\`\`\`

\`field(default_factory=list)\` 避免 mutable 默认值的经典坑。

### 11.2 用 classmethod 替代构造函数 + Builder

\`\`\`python
class Query:
    @classmethod
    def builder(cls):
        return QueryBuilder()

# 使用
q = Query.builder().select("id").from_table("users").build()
\`\`\`

这种写法把 Builder 和 Product 关联起来,API 更内聚。

### 11.3 支持上下文管理器(可选)

\`\`\`python
class QueryBuilder:
    def __enter__(self):
        return self
    def __exit__(self, *exc):
        # 可以在这里自动 build,或做清理
        pass

with QueryBuilder() as b:
    b.select("id").from_table("users")
    q = b.build()
\`\`\`

通常没必要,但在需要资源清理时有用。

## 十二、本章小结

建造者模式的核心是**分步构造复杂对象,把构造过程与表示分离**。本章要点:

1. **定义**:将复杂对象的构造与表示分离,同样的构造过程可产出不同表示。
2. **解决**:参数地狱、构造步骤复杂、构造过程需复用。
3. **两种结构**:经典 Director + Builder(构造流程复用)、Pythonic 链式 Builder(灵活分步)。
4. **设计要点**:Builder 可变积累,Product 不可变;每个方法 return self;build() 做校验。
5. **vs 工厂**:工厂关注"造哪种"(一步),建造者关注"怎么造"(多步)。
6. **简化版**:参数少时用 dataclass 默认参数即可,别过度设计。
7. **陷阱**:忘 return self、build 不校验、Builder 复用状态污染。

## 十三、易错点小结

| 易错点 | 错误表现 | 正确做法 |
| --- | --- | --- |
| 链式方法忘 return self | 链式调用中途报 AttributeError | 每个修改方法都 return self |
| build() 不校验 | 产出残缺对象(如表名为空) | build() 校验必需字段,早报错 |
| Builder 复用状态污染 | 同一 Builder 构造多个对象,字段被追加 | 每次 build 新建 Builder,或明确"追加 vs 覆盖"语义 |
| Product 设成可变 | build 后对象被改,不可靠 | Product 用 frozen dataclass,构造完不可变 |
| 过度设计 | 简单对象也堆 Builder | 参数少用 dataclass 默认参数,复杂了再升级 |
| 混淆 Builder 与工厂 | 以为 Builder 是"选哪种" | Builder 是"怎么造",工厂是"造哪种" |
| Director 滥用 | 简单构造也套 Director | 流程复用/多输出格式才用 Director,否则客户端直接链式 |
| 多次 where 直接覆盖 | 第二次 where 覆盖第一次 | 多次调用用 AND/OR 累加,语义更自然 |
| build() 后改 Builder 误以为影响已 build 对象 | 以为 q1 会随 Builder 变化 | build() 产出的是快照,Builder 改动不影响已 build 对象 |
| mutable 默认值陷阱 | \`columns: list = []\` 共享 | 用 \`field(default_factory=list)\` 或 \`__init__\` 里初始化 |
| 链式调用顺序假设错误 | 以为 where 必须在 order_by 前 | 链式 Builder 方法顺序由语义决定,不强制代码顺序(除非有依赖) |
| 把校验分散在 setter | 每个 setter 都校验,部分构造时报错 | 校验集中在 build(),允许中间状态不完整 |
`,
  },
];
