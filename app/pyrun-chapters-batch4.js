// =============================================================
// Python 执行代码原理（pyrun）—— 第四批章节
// 主题：面向对象原理（共 5 章：第16章 ~ 第20章）
// =============================================================

export const chapters = [
  {
    id: "pyrun-16",
    group: "面向对象原理",
    icon: "🏗️",
    title: "类的本质：就是一个代码对象",
    content: `
# 🏗️ 类的本质：就是一个代码对象

## 写在前面：你以为你懂类，其实还差一步

很多人学 Python 面向对象，会写 \`class Dog: pass\` 就觉得自己懂了。但只要再追问一句——"**class 这个关键字，到底在内存里干了啥？**"——大部分人就卡壳了。

这一章我们就把这个最底层、也最容易被忽略的问题讲透。读完之后，你会明白：**类本身也是一种"东西"（对象）**，它在 Python 里的地位，和一个普通的整数、字符串没什么本质区别，都是"对象"。

打个比方：你可以把 **类** 想象成一张"**产品图纸**"，把 **实例** 想象成按图纸"**造出来的产品**"。一张图纸能造出成千上万个产品，图纸本身也是一张纸（也是种"东西"）。Python 里的世界就是这么直白。

## 一、class 关键字到底做了什么

先看最朴素的一段代码：

\`\`\`python
class Dog:
    species = "犬科动物"   # 类属性
    def speak(self):       # 方法
        return "汪汪"
\`\`\`

当你执行到 \`class Dog:\` 这一行时，Python 解释器并不是"注册一个名字"那么简单，它实际上做了下面几件事：

1. **收集类体里的所有名字**：Python 会先把 \`class Dog:\` 下面的代码当成一个普通的代码块执行一遍。执行过程中，所有通过赋值产生的名字（\`species\`、\`speak\`）都会被收集进一个**临时命名空间字典**里。
2. **确定父类**：从 \`class Dog(Animal):\` 的小括号里拿到父类元组；没写父类就默认继承 \`object\`。
3. **确定元类**：默认用 \`type\` 作为"造类的工厂"（元类的概念第 20 章细讲）。
4. **调用元类创建类对象**：相当于执行 \`type("Dog", (object,), 命名空间字典)\`，元类返回一个**全新的类对象**。
5. **把类对象绑定到名字 Dog**：之后 \`Dog\` 这个名字就指向那个类对象。

所以一句话总结：**class 关键字 = 收集名字 + 调用 type 造一个类对象 + 绑定名字**。class 不是什么神秘的语法糖之外的东西，它的本质就是一次"函数调用"，调用的就是 \`type\`。

### 类体的执行时机

有一个细节很多人没注意：**类体是在定义时就被执行的**，而不是在创建实例时。

\`\`\`python
class Foo:
    print("我在定义类的时候就被执行了！")   # 这行在 class 执行时就打印
\`\`\`

你只要 \`import\` 到这个模块，上面那行 \`print\` 就会执行一次。类体里顶层的所有语句（包括 \`print\`、函数定义、变量赋值）都是"定义时"执行的。这也是为什么类属性和方法在类定义完成后就立即可用的原因。

## 二、类对象 vs 实例对象：两个完全不同的东西

很多人把"类"和"实例"混为一谈，其实它们是两个独立的对象，住在内存的不同位置。

### 类对象（Class Object）

当你写完 \`class Dog: ...\`，Python 就在内存里造出了一个**类对象**。这个对象：

- 有自己的 \`id()\`、\`type()\`、\`__dict__\`
- 装着所有类属性和方法的定义
- 可以被当作"模板"反复用来 \`Dog()\` 造实例
- 可以被传递：放进列表、当参数、当返回值

### 实例对象（Instance Object）

当你写 \`my_dog = Dog("旺财")\`，Python 又造出一个**实例对象**。这个对象：

- 也有自己的 \`id()\`、\`type()\`、\`__dict__\`
- 它的 \`type()\` 是它所属的类 \`Dog\`
- 它的 \`__dict__\` 只装它自己的实例属性（比如 \`name\`）

下面这张表把两者对照得很清楚：

| 对比维度 | 类对象 Dog | 实例对象 my_dog |
|---------|-----------|----------------|
| 怎么来的 | class 关键字 / type() 调用 | 调用类对象 Dog() |
| type() 返回 | type（元类） | Dog（它所属的类） |
| __dict__ 装啥 | 类属性、方法 | 实例属性（self.xxx） |
| 共享范围 | 所有实例共享同一份 | 每个实例独享一份 |
| 能不能再生 | 能反复 Dog() 造实例 | 一般不再"生"东西 |

### 一个关键认知：实例属性各管各的，类属性是共享的

\`\`\`python
class Dog:
    species = "犬科动物"   # 类属性，只有一份
    def __init__(self, name):
        self.name = name    # 实例属性，每个实例一份

a = Dog("旺财")
b = Dog("富贵")
a.name   # "旺财"   —— a 自己的
b.name   # "富贵"   —— b 自己的
a.species  # "犬科动物" —— 大家共享的同一份
\`\`\`

修改 \`a.species\` 会发生什么？这里有个经典坑：如果你写 \`a.species = "猫科"\`，**并没有改类属性**，而是给 \`a\` 这个实例**新建**了一个同名实例属性 \`species\`，遮蔽了类属性。类属性 \`Dog.species\` 还是"犬科动物"，只是 \`a\` 再也"看不到"它了（因为查找时实例属性优先）。这个查找规则下一章会详细讲。

## 三、type() 的双重含义：查看类型 / 创建类

\`type\` 是 Python 里最"分裂"的一个东西——它既是**内置函数**，又是**所有类的类**（元类）。理解它的双重身份，是理解 Python 对象模型的关键。

### 含义一：用一个参数——查看类型

\`\`\`python
type(123)        # <class 'int'>
type("hello")    # <class 'str'>
type(Dog)        # <class 'type'>  —— 类的类型是 type
type(my_dog)     # <class 'Dog'>   —— 实例的类型是它的类
\`\`\`

这就是大家最熟悉的"查类型"用法。\`type(x)\` 返回 \`x\` 的"出生证明"——它是哪个类造出来的。

### 含义二：用三个参数——动态创建类

\`\`\`python
# type(类名, 父类元组, 属性字典)
Cat = type("Cat", (object,), {"species": "猫科", "speak": lambda self: "喵"})
\`\`\`

这一行和下面这段 \`class\` 写法**完全等价**：

\`\`\`python
class Cat(object):
    species = "猫科"
    def speak(self):
        return "喵"
\`\`\`

没错——**class 关键字的底层就是 \`type(...)\` 的三参数调用**。理解了这一点，你就揭开了 class 的神秘面纱：class 只是一个语法糖，最终都要走 \`type\` 这个"工厂"来造类。

### 两种含义如何区分

Python 区分这两种含义，靠的就是**参数个数**：

| 调用形式 | 参数个数 | 含义 |
|---------|---------|------|
| type(obj) | 1 个 | 查看类型，返回 obj 的类 |
| type(name, bases, dict) | 3 个 | 创建新类，返回新类对象 |

这其实是 C 层面 \`type.__call__\` 根据参数数量做的分发。所以 \`type\` 既是个"查询器"，又是个"造类工厂"，靠参数个数切换角色。

## 四、类也是对象：类的类是 type（元类初探）

这是本章最"烧脑"但也最关键的一句话：**类本身也是对象**，而**造出类这个对象的类，叫 \`type\`**，也就是所谓的"**元类**"（metaclass）。

我们一层层往上捋：

\`\`\`
my_dog (实例)
  └── 它的类是 Dog          type(my_dog) == Dog
Dog (类)
  └── 它的类是 type          type(Dog) == type
type (元类)
  └── 它的类还是 type        type(type) == type
\`\`\`

也就是说：

- 实例 \`my_dog\` 是 \`Dog\` 的实例
- 类 \`Dog\` 是 \`type\` 的实例
- \`type\` 是它自己的实例（"自举"，宇宙的奇点）

这就解释了为什么 \`type(Dog)\` 返回 \`<class 'type'>\`——因为 \`Dog\` 这个类，是 \`type\` 造出来的。 \`type\` 是"**创建类的类**"，所以叫**元类**（meta-class，"类之上的类"）。

### 大白话比喻

- **产品** = 实例对象（旺财）
- **图纸** = 类对象（Dog）
- **画图纸的机器** = 元类（type）

普通工厂用图纸造产品；元类用"图纸的图纸"造图纸。 \`type\` 就是那台画图纸的机器，它画的图纸就是各种 \`class\`。

### 验证一下

\`\`\`python
class Dog: pass
my_dog = Dog()

type(my_dog)      # <class 'Dog'>     —— 实例的类型是类
type(Dog)         # <class 'type'>    —— 类的类型是 type
type(type)        # <class 'type'>    —— type 自己的类型还是 type
isinstance(Dog, type)   # True  —— Dog 是 type 的实例
isinstance(my_dog, Dog) # True  —— my_dog 是 Dog 的实例
\`\`\`

## 五、用 type() 动态创建类：什么时候用

既然 \`type(name, bases, dict)\` 能造类，那什么时候我们会"不写 class，直接用 type 造类"呢？常见场景：

1. **运行时才知道类长什么样**：比如根据配置文件、数据库表结构动态生成 ORM 模型类。表名、字段名都是运行时才确定的，写不了 class。
2. **批量生成一堆相似的类**：比如根据一组数据自动生成 N 个表单类。
3. **元类内部实现**：自定义元类时，最终都要调 \`type.__new__\` 来真正造出类。
4. **装饰器返回新类**：类装饰器想返回一个"改过"的新类时，可以用 type 重建。

### 一个直观例子：根据字符串造类

\`\`\`python
def make_class(kind):
    if kind == "cat":
        return type("Cat", (object,), {"sound": "喵"})
    elif kind == "dog":
        return type("Dog", (object,), {"sound": "汪"})

Klass = make_class("cat")
obj = Klass()
print(obj.sound)   # 喵
\`\`\`

类名 \`Cat\`、属性 \`sound\` 都是运行时拼出来的，写死 class 根本做不到。这就是动态创建类的威力。

## 六、为什么理解这些很重要

你可能会问：日常写代码又用不上这些，学它干嘛？原因有三：

1. **看懂框架源码**：Django ORM、SQLAlchemy、dataclasses、Pydantic，全都在用 \`type\` 动态造类、用元类改类。不懂这些，框架源码就是天书。
2. **理解"一切皆对象"**：Python 的对象模型是统一的——函数是对象、类是对象、模块是对象。理解类的类是 type，你才算真正入门了 Python 的对象哲学。
3. **写出更灵活的代码**：当你需要"根据运行时信息生成类"时，你才知道有 \`type\` 这个工具可用，而不是用一堆 if-else 硬撑。

## 七、本章要点小结

- **class 关键字**：收集类体名字 → 调用 \`type\` 造类对象 → 绑定名字。
- **类对象 vs 实例对象**：两个独立对象，类对象是模板，实例对象是产品。
- **类属性共享，实例属性独享**：实例属性遮蔽同名类属性时，不会改类属性。
- **type 的双重身份**：一参数查类型，三参数造类。
- **类也是对象**：类的类是 \`type\`，\`type\` 是所有类的元类，\`type\` 自举。
- **动态造类**：\`type(name, bases, dict)\` 等价于 class 定义，用于运行时生成类。

下一章我们会深入**属性查找机制**——当你写 \`obj.x\` 时，Python 到底按什么顺序去找 \`x\`？这背后就是著名的 **MRO**（方法解析顺序）。翻页继续 👉
`,
    code: `
# =============================================================
# 第16章演示：类的本质 —— type() 的双重身份
# 本代码仅用标准库，演示：
# 1. class 关键字到底做了什么
# 2. 类对象 vs 实例对象
# 3. type() 一参数查类型 / 三参数造类
# 4. 类也是对象，类的类是 type
# =============================================================

# 打印大标题分隔线
print("=" * 60)
print("  第16章：类的本质 —— type() 的双重身份")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：class 关键字做了什么
# -------------------------------------------------------------
print("\\n【第一部分】class 关键字做了什么\\n")

# 用 class 关键字定义一个普通类
class Dog:
    # 类属性，写在类体里、方法外，所有实例共享
    species = "犬科动物"

    # 初始化方法，创建实例时由 Python 自动调用
    def __init__(self, name):
        # 把 name 存到实例自己的属性表里
        self.name = name

    # 普通方法，第一个参数永远是实例本身 self
    def speak(self):
        # 返回一段叫声
        return f"{self.name}：汪汪！"

# Dog 本身就是一个对象（类对象），可以查看它的类型
print(f"type(Dog) => {type(Dog)}")
# 输出 <class 'type'>，说明 Dog 这个类是 type 造出来的

# 用 Dog 这个类对象造一个实例
my_dog = Dog("旺财")
# 查看实例的类型，应该是它所属的类
print(f"type(my_dog) => {type(my_dog)}")
# 输出 <class 'Dog'>，说明 my_dog 是 Dog 的实例

# -------------------------------------------------------------
# 第二部分：类属性共享，实例属性独享
# -------------------------------------------------------------
print("\\n【第二部分】类属性共享，实例属性独享\\n")

# 再造一个实例，方便对比
other_dog = Dog("富贵")
# 两个实例各自的 name 不同
print(f"my_dog.name = {my_dog.name}")
print(f"other_dog.name = {other_dog.name}")
# 但 species 是共享的同一份
print(f"my_dog.species = {my_dog.species}")
print(f"other_dog.species = {other_dog.species}")

# 给 my_dog 单独赋 species，并不会改类属性，只是遮蔽
my_dog.species = "变异犬科"
print(f"改后 my_dog.species = {my_dog.species}")
print(f"类属性 Dog.species = {Dog.species}（没被改动）")

# -------------------------------------------------------------
# 第三部分：用 type() 三参数动态创建类
# -------------------------------------------------------------
print("\\n【第三部分】用 type() 动态创建类\\n")

# 先定义一个普通函数，将来作为类的方法
def cat_speak(self):
    # 返回猫的叫声
    return f"{self.name}：喵喵！"

# 用 type 三参数形式造一个 Cat 类，等价于 class Cat(object): ...
Cat = type(
    "Cat",                       # 类的名字，字符串
    (object,),                   # 父类元组，至少包含 object
    {                            # 属性/方法字典
        "species": "猫科动物",   # 类属性
        "__init__": lambda self, name: setattr(self, "name", name),  # 初始化方法
        "speak": cat_speak,      # 实例方法
    },
)

# Cat 现在是一个货真价实的类对象
print(f"type(Cat) => {type(Cat)}")
# 用 Cat 造一个实例
my_cat = Cat("咪咪")
# 调用方法，验证它真的能用
print(f"my_cat.speak() => {my_cat.speak()}")
# 查看实例属性
print(f"my_cat.name => {my_cat.name}")

# -------------------------------------------------------------
# 第四部分：类也是对象，类的类是 type
# -------------------------------------------------------------
print("\\n【第四部分】类也是对象，类的类是 type\\n")

# 逐层往上查看类型，体现"实例→类→元类"链条
print(f"type(my_dog)  => {type(my_dog)}")    # Dog
print(f"type(Dog)     => {type(Dog)}")       # type
print(f"type(type)    => {type(type)}")      # type 自举

# 用 isinstance 验证"谁是谁的实例"
print(f"isinstance(my_dog, Dog) => {isinstance(my_dog, Dog)}")   # True
print(f"isinstance(Dog, type)   => {isinstance(Dog, type)}")     # True

# -------------------------------------------------------------
# 第五部分：把类当对象传递
# -------------------------------------------------------------
print("\\n【第五部分】把类当对象传来传去\\n")

# 类对象可以放进列表、当参数、当返回值
classes = [Dog, Cat]
# 遍历每个类，创建实例并调用方法
for cls in classes:
    # 用 cls() 造实例，体现"类是工厂"
    pet = cls("小可爱")
    # 打印类名和它的叫声
    print(f"{cls.__name__} 的实例说：{pet.speak()}")

# 最后小结
print("\\n" + "=" * 60)
print("  小结：class 的本质就是一次 type() 调用，类本身也是对象")
print("=" * 60)
`,
  },
  {
    id: "pyrun-17",
    group: "面向对象原理",
    icon: "🔗",
    title: "属性查找：MRO 机制",
    content: `
# 🔗 属性查找：MRO 机制

## 从一个最朴素的问题开始

当你写下 \`obj.x\` 这五个字符时，Python 要回答一个问题：**\`x\` 到底在哪里？** 这个看似简单的动作，背后藏着一套精密的查找规则。这一套规则，就是 Python 面向对象的"血脉"——**属性查找机制**和 **MRO**（Method Resolution Order，方法解析顺序）。

打个比方：找属性就像**翻抽屉找东西**。

- 第一个抽屉是你的口袋（**实例自己**的 \`__dict__\`）
- 第二个抽屉是你爸爸的工具箱（**类**的 \`__dict__\`）
- 第三个抽屉是你爷爷的工具箱（**父类**的 \`__dict__\`）
- 一直往上翻，直到翻到 \`object\` 那个"老祖宗"的抽屉

**MRO** 就是规定"按什么顺序翻这些抽屉"的一张清单。简单继承时这份清单一目了然，多继承时就会变得微妙——这正是 Python 用 **C3 线性化**算法来解决的事。

## 一、实例属性 vs 类属性

先把最基础的概念钉死。

### 实例属性

写在 \`self.xxx = ...\` 里的属性，叫**实例属性**。每个实例都有一份自己独享的副本。

\`\`\`python
class Dog:
    def __init__(self, name):
        self.name = name     # 实例属性

a = Dog("旺财")
b = Dog("富贵")
a.name   # "旺财"   —— a 自己的
b.name   # "富贵"   —— b 自己的
\`\`\`

### 类属性

写在类体里、方法外的属性，叫**类属性**。整个类只有一份，所有实例**共享**。

\`\`\`python
class Dog:
    species = "犬科动物"   # 类属性
    def __init__(self, name):
        self.name = name

a = Dog("旺财")
a.species   # "犬科动物" —— 共享的
Dog.species # "犬科动物" —— 也能直接用类名访问
\`\`\`

### 经典坑：通过实例赋值会"遮蔽"而不是"修改"

\`\`\`python
a = Dog("旺财")
a.species = "变异犬"   # 看似在改 species
a.species        # "变异犬"    —— a 看到的是新的
Dog.species      # "犬科动物"   —— 类属性根本没动
b = Dog("富贵")
b.species        # "犬科动物"   —— 别的实例也不受影响
\`\`\`

发生了什么？\`a.species = "变异犬"\` 并没有改类属性，而是给 \`a\` 这个实例**新建**了一个同名实例属性，把类属性"挡住"了。**赋值永远在实例自己的 \`__dict__\` 上创建**，而**读取才会沿着查找链往上找**。这是初学者最常踩的坑。

## 二、\`__dict__\` 属性字典：每个对象都有自己的抽屉

Python 里几乎每个对象都有一个 \`__dict__\` 属性，它就是一个普通的 \`dict\`，装着这个对象自己的所有属性。

### 实例的 \`__dict__\`

\`\`\`python
class Dog:
    species = "犬科动物"
    def __init__(self, name):
        self.name = name
        self.age = 3

a = Dog("旺财")
a.__dict__   # {'name': '旺财', 'age': 3}
\`\`\`

注意：\`species\` 不在 \`a.__dict__\` 里！因为它属于**类**，不属于实例。实例的 \`__dict__\` 只装实例自己的属性。

### 类的 \`__dict__\`

\`\`\`python
Dog.__dict__
# mappingproxy({...}) 里面包含 species、__init__、__dict__、__weakref__ ...
\`\`\`

类的 \`__dict__\` 是一个 \`mappingproxy\`（只读视图），装着所有类属性和方法。注意它是只读的——你不能直接 \`Dog.__dict__['x'] = 1\`，但可以用 \`setattr(Dog, 'x', 1)\`。

### 查找的本质：依次翻 \`__dict__\`

当你写 \`a.name\`，Python 实际做的事近似于：

1. 先在 \`a.__dict__\` 里找 \`name\` → 找到就返回
2. 再在 \`type(a).__dict__\`（也就是 \`Dog.__dict__\`）里找
3. 再沿着 \`Dog.__mro__\` 往上翻每个父类的 \`__dict__\`
4. 都找不到 → 抛 \`AttributeError\`

（实际还有描述符、\`__getattr__\` 等高级机制，下一章和第 19 章会讲。这里先抓住主线。）

## 三、属性查找顺序：实例 → 类 → 父类（MRO）

把前面的"翻抽屉"比喻落实成规则，就是这套查找顺序：

\`\`\`
obj.x 的查找过程：
  1. 在 obj.__dict__ 里找         （实例抽屉）
  2. 在 type(obj).__dict__ 里找    （类抽屉）
  3. 沿 type(obj).__mro__ 往上    （父类抽屉们）
  4. 找不到 → 调用 __getattr__（如果定义了）
  5. 还找不到 → AttributeError
\`\`\`

### 一个验证例子

\`\`\`python
class A:
    where = "在 A 里"

class B(A):
    where = "在 B 里"

b = B()
b.where        # "在 B 里"   —— 类属性优先于父类
B.where        # "在 B 里"
b.__dict__     # {}  —— 实例里没有 where
\`\`\`

这里 \`b.__dict__\` 是空的，所以查找跳到 \`B.__dict__\`，找到 \`where = "在 B 里"\` 就返回了，根本不会再去 \`A\`。

### 方法也是属性

Python 里**方法本质上也是类属性**，只是个普通函数。它"特殊"的地方在于：通过实例访问时，Python 会自动把实例绑成第一个参数 \`self\`（这叫"绑定方法"）。

\`\`\`python
class Dog:
    def speak(self):
        return "汪"

d = Dog()
Dog.speak      # <function Dog.speak>   —— 类访问，是普通函数
d.speak        # <bound method Dog.speak of <Dog object>>  —— 实例访问，是绑定方法
Dog.speak(d)   # "汪"  —— 手动传 self，等价于 d.speak()
\`\`\`

## 四、MRO：方法解析顺序

单继承时查找顺序很无聊：实例 → 自己的类 → 父类 → 爷爷类 → ... → \`object\`。但**多继承**时，问题就来了：如果两个父类都定义了同名方法，到底听谁的？

这就是 **MRO** 要回答的问题。MRO 就是把"实例 → 类 → 一堆父类"排成**一个线性的顺序表**，查找时严格按这个表从前往后找。

### 查看 MRO

每个类都有一个 \`__mro__\` 属性，是一个元组，按查找顺序排列：

\`\`\`python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

D.__mro__
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
\`\`\`

也可以用 \`D.mro()\` 方法（返回 list）。查找 \`D().x\` 时就按这个顺序翻 \`__dict__\`。

## 五、C3 线性化：MRO 是怎么算出来的

Python 3 的 MRO 用的是 **C3 线性化**算法。它保证三条性质：

1. **子类在父类前面**：D 一定排在 B、C 前面。
2. **父类顺序保留**：如果 D 写成 \`class D(B, C)\`，那 B 一定排在 C 前面。
3. **不重复**：每个类在 MRO 里只出现一次。

C3 算法的核心思想是"**合并有序列表，每次取头部且没人反对**"。具体过程：把"自己的父类列表"和"每个父类的 MRO"放在一起，反复取"所有列表都同意的头"加入结果。

### 菱形继承：C3 的经典场景

\`\`\`
        A
       / \\
      B   C
       \\ /
        D
\`\`\`

\`\`\`python
class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B"
class C(A):
    def who(self): return "C"
class D(B, C):
    pass

D.__mro__
# (D, B, C, A, object)
D().who()   # "B"   —— B 在 C 前面，先找到 B
\`\`\`

为什么是 \`D → B → C → A\` 而不是 \`D → B → A → C\`？因为 C3 会在取出 B 之后，看到 A 还被 C"惦记"着（C 的 MRO 是 \`C, A, object\`，A 排在 C 后面），所以 A 不能插队到 C 前面。这就是 C3 比"深度优先"聪明的地方——它避免了 A 被访问两次，也避免了子类 C 的方法被父类 A 遮蔽。

### 如果 C3 算不出：TypeError

某些"奇葩"继承关系会让 C3 无法满足三条性质，这时 Python 直接拒绝创建类：

\`\`\`python
class X(A, B): pass
class Y(B, A): pass
class Z(X, Y): pass   # TypeError: 不能创建一致的 MRO
\`\`\`

X 要求 A 在 B 前，Y 要求 B 在 A 前，Z 同时继承 X、Y就矛盾了。Python 宁可报错也不"瞎排"。

## 六、super() 的真相：不是"调用父类"，而是"调用 MRO 的下一个"

这是 Python OOP 里**最大的误解**之一。很多人以为 \`super().__init__()\` 是"调用父类的 \`__init__\`"，这只在单继承下碰巧成立。多继承时，\`super()\` 的真实含义是：**在当前类的 MRO 里，找到"下一个"类，调用它的对应方法**。

\`\`\`python
class A:
    def __init__(self):
        print("A.__init__")
        super().__init__()   # 注意 A 也调了 super

class B(A):
    def __init__(self):
        print("B.__init__")
        super().__init__()

class C(A):
    def __init__(self):
        print("C.__init__")
        super().__init__()

class D(B, C):
    def __init__(self):
        print("D.__init__")
        super().__init__()

D()
# 输出顺序：D → B → C → A  —— 正好是 D 的 MRO！
\`\`\`

关键点：\`super()\` 不是"找父类"，而是"找 MRO 里排在 \`self\` 真实类之后、当前类之后的那个类"。所以 \`A.__init__\` 里的 \`super().__init__()\` 调的不是 \`object\`，而是 MRO 里 A 后面的 \`C\`（在 D 的 MRO 上下文里）。这就是"协同多继承"能工作的秘密。

### super() 的两参数形式

\`super(CurrentClass, self)\` 显式指定"从哪个类开始往后找"。Python 3 里 \`super()\` 不带参数也能工作，是因为编译器自动帮我们填了 \`__class__\` 和第一个参数。理解两参数形式，能帮你彻底弄懂 super 的本质。

## 七、本章要点小结

- **实例属性 vs 类属性**：实例属性各管各的，类属性共享；通过实例赋值是"遮蔽"不是"修改"。
- **\`__dict__\`**：每个对象自己的属性抽屉；实例的 \`__dict__\` 只装实例属性。
- **查找顺序**：实例 \`__dict__\` → 类 \`__dict__\` → 沿 \`__mro__\` 翻父类 \`__dict__\`。
- **MRO**：方法解析顺序，把多继承排成线性表，\`__mro__\` 可查看。
- **C3 线性化**：保证子类在前、父类顺序保留、不重复；算不出就报 TypeError。
- **super()**：调的是 MRO 里"下一个"类，不是字面意义的"父类"。

下一章我们讲 Python 里最"魔法"的一群方法——**魔术方法**（\`__init__\`、\`__str__\`、\`__len__\`、\`__getitem__\`……），它们是 Python 实现"协议"和"语法糖"的关键 👉
`,
    code: `
# =============================================================
# 第17章演示：属性查找与 MRO 机制
# 本代码仅用标准库，演示：
# 1. 实例属性 vs 类属性 + 遮蔽现象
# 2. __dict__ 属性字典
# 3. 菱形继承的 MRO 顺序
# 4. super() 的真实行为
# =============================================================

# 打印大标题
print("=" * 60)
print("  第17章：属性查找 MRO 机制")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：实例属性 vs 类属性
# -------------------------------------------------------------
print("\\n【第一部分】实例属性 vs 类属性\\n")

# 定义一个带类属性和实例属性的类
class Animal:
    # 类属性，所有实例共享这一份
    kingdom = "动物界"

    def __init__(self, name):
        # 实例属性，每个实例独享一份
        self.name = name

# 造两个实例做对比
a1 = Animal("小猫")
a2 = Animal("小狗")
# 实例属性各管各的
print(f"a1.name = {a1.name}")
print(f"a2.name = {a2.name}")
# 类属性是共享的同一份
print(f"a1.kingdom = {a1.kingdom}")
print(f"a2.kingdom = {a2.kingdom}")

# 通过实例赋值，会"遮蔽"类属性而不是修改它
a1.kingdom = "异界"
print(f"改后 a1.kingdom = {a1.kingdom}（a1 自己的新属性）")
print(f"a2.kingdom = {a2.kingdom}（不受影响）")
print(f"类属性 Animal.kingdom = {Animal.kingdom}（根本没动）")

# -------------------------------------------------------------
# 第二部分：__dict__ 属性字典
# -------------------------------------------------------------
print("\\n【第二部分】__dict__ 属性字典\\n")

# 实例的 __dict__ 只装实例自己的属性
print(f"a1.__dict__ => {a1.__dict__}")
# 现在多了 kingdom，因为刚才遮蔽时给它新建了实例属性

# 类的 __dict__ 装类属性和方法（mappingproxy 只读视图）
class_keys = list(Animal.__dict__.keys())
print(f"Animal.__dict__ 的键 => {class_keys}")

# -------------------------------------------------------------
# 第三部分：菱形继承的 MRO 顺序
# -------------------------------------------------------------
print("\\n【第三部分】菱形继承与 MRO\\n")

# 定义菱形继承的四个类
class A:
    def who(self):
        # 返回自己的类名
        return "A"

class B(A):
    def who(self):
        # B 覆盖了 A 的方法
        return "B"

class C(A):
    def who(self):
        # C 也覆盖了 A 的方法
        return "C"

class D(B, C):
    # D 多继承 B 和 C，自身不定义 who
    pass

# 查看 D 的 MRO 顺序
mro_names = [cls.__name__ for cls in D.__mro__]
print(f"D.__mro__ => {mro_names}")
# 预期：D -> B -> C -> A -> object

# 创建 D 的实例并调用 who，验证查找结果
d = D()
print(f"d.who() => {d.who()}")
# B 在 C 前面，所以先找到 B 的 who

# -------------------------------------------------------------
# 第四部分：C3 算不出时报 TypeError
# -------------------------------------------------------------
print("\\n【第四部分】MRO 矛盾时直接报错\\n")

# 尝试构造一个矛盾的继承关系
try:
    # X 要求 A 在 B 前
    class X(A, B):
        pass
    # 上面这行会失败，因为 A 是 B 的父类，顺序冲突
except TypeError as e:
    # 捕获并打印错误信息
    print(f"TypeError: {e}")

# -------------------------------------------------------------
# 第五部分：super() 调的是 MRO 的"下一个"
# -------------------------------------------------------------
print("\\n【第五部分】super() 的真实行为\\n")

# 重新定义菱形继承，每个 __init__ 都调 super 并打印
class BaseA:
    def __init__(self):
        # 打印自己被调用了
        print("  -> BaseA.__init__ 被调用")
        # 调用 MRO 里的下一个
        super().__init__()

class BaseB(BaseA):
    def __init__(self):
        # 打印自己被调用了
        print("  -> BaseB.__init__ 被调用")
        # 调用 MRO 里的下一个
        super().__init__()

class BaseC(BaseA):
    def __init__(self):
        # 打印自己被调用了
        print("  -> BaseC.__init__ 被调用")
        # 调用 MRO 里的下一个
        super().__init__()

class BaseD(BaseB, BaseC):
    def __init__(self):
        # 打印自己被调用了
        print("  -> BaseD.__init__ 被调用")
        # 调用 MRO 里的下一个
        super().__init__()

# 查看 BaseD 的 MRO
mro_d = [cls.__name__ for cls in BaseD.__mro__]
print(f"BaseD.__mro__ => {mro_d}")
# 实例化，观察 super 调用顺序恰好就是 MRO 顺序
print("实例化 BaseD()，观察 super 调用链：")
BaseD()

# 小结
print("\\n" + "=" * 60)
print("  小结：查找走 实例→类→MRO，super 走 MRO 的下一个")
print("=" * 60)
`,
  },
  {
    id: "pyrun-18",
    group: "面向对象原理",
    icon: "✨",
    title: "魔术方法：Python 的暗号",
    content: `
# ✨ 魔术方法：Python 的暗号

## 什么是魔术方法

Python 里有一大堆以**双下划线开头和结尾**的方法，比如 \`__init__\`、\`__str__\`、\`__len__\`、\`__getitem__\`……大家习惯叫它们"**魔术方法**"（magic methods）或"**dunder 方法**"（double underscore）。

它们最大的特点是：**你一般不主动调用它们，而是 Python 在特定场景下自动调用**。比如你写 \`len(obj)\`，Python 背后调的是 \`obj.__len__()\`；你写 \`obj[0]\`，Python 调的是 \`obj.__getitem__(0)\`。

### 大白话比喻：对讲机的暗号

魔术方法就像**对讲机的暗号**——你说一句"收到"，对方就明白要做什么，不用你手把手教。

- 你说 \`len(obj)\`（暗号）→ Python 翻译成 \`obj.__len__()\`（行动）
- 你说 \`obj[0]\`（暗号）→ Python 翻译成 \`obj.__getitem__(0)\`（行动）
- 你说 \`for x in obj\`（暗号）→ Python 翻译成 \`obj.__iter__()\` + \`__next__()\`（行动）

只要你给类定义了正确的魔术方法，你的对象就能"伪装"成列表、字典、数字……融入 Python 的语法里。这套机制叫**协议**（protocol）——Python 不关心你是什么类，只关心你会不会响应这些暗号。

## 一、\`__new__\` vs \`__init__\`：造对象 vs 装修对象

很多人以为 \`__init__\` 是"构造方法"，其实严格来说，**真正造对象的是 \`__new__\`**，\`__init__\` 只是"装修"。

### \`__new__\`：负责**创建并返回**实例

\`__new__\` 是个**类方法**（即使你不加装饰器），它的职责是**真正分配内存、造出一个空实例**，并返回这个实例。如果 \`__new__\` 没返回 \`cls\` 的实例，\`__init__\` 根本不会被调用。

\`\`\`python
class Foo:
    def __new__(cls, *args, **kwargs):
        print("1. __new__ 被调用，开始造对象")
        instance = super().__new__(cls)   # 调 object.__new__ 真正分配内存
        return instance   # 必须返回实例，否则 __init__ 不执行

    def __init__(self):
        print("2. __init__ 被调用，开始装修对象")

Foo()
# 1. __new__ 被调用，开始造对象
# 2. __init__ 被调用，开始装修对象
\`\`\`

### \`__init__\`：负责**初始化**实例

\`__init__\` 拿到 \`__new__\` 返回的实例后，给它填充属性。它**不能有返回值**（只能是 \`None\`）。

### 什么时候要自己写 \`__new__\`

99% 的类只需要 \`__init__\`，\`__new__\` 用默认的就行。需要重写 \`__new__\` 的场景：

- **单例模式**：控制只造一个实例
- **不可变类型**：\`int\`、\`str\`、\`tuple\` 的子类化（它们在 \`__init__\` 时已经定型了，没法改）
- **缓存/复用对象**：某些情况下返回已存在的实例而不是新建

### 单例模式示例

\`\`\`python
class Singleton:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

a = Singleton()
b = Singleton()
a is b   # True —— 永远是同一个实例
\`\`\`

## 二、\`__str__\` vs \`__repr__\`：给人看 vs 给开发者看

这两个都返回对象的字符串表示，但用途不同。

| 方法 | 调用场景 | 目标 | 要求 |
|------|---------|------|------|
| \`__str__\` | \`print(obj)\`、\`str(obj)\` | 给**普通用户**看 | 可读性好，简洁 |
| \`__repr__\` | 直接在交互式环境敲 \`obj\`、\`repr(obj)\`、容器里的元素 | 给**开发者**看 | 尽量能还原对象 |

### 黄金规则

- 如果只定义一个，定义 \`__repr__\`。因为 \`__str__\` 没定义时，Python 会 fallback 到 \`__repr__\`。
- \`__repr__\` 的理想状态：\`eval(repr(obj)) == obj\`，也就是看一眼就能复制粘贴重新造出这个对象。

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"   # 开发者看，能还原
    def __str__(self):
        return f"({self.x}, {self.y})"             # 普通人看，简洁

p = Point(1, 2)
print(p)      # (1, 2)         —— 用 __str__
p             # Point(1, 2)    —— 交互式环境用 __repr__
[Point(1,2), Point(3,4)]   # [Point(1, 2), Point(3, 4)]  —— 容器里用 __repr__
\`\`\`

注意 \`{self.x!r}\` 里的 \`!r\`，它表示"用 \`repr()\` 格式化这个值"，保证字符串带引号、能被 \`eval\` 还原。

## 三、容器类协议：让你的对象像列表/字典

这一组魔术方法让你的对象支持 \`len()\`、\`[]\`、\`in\`、\`for\` 等操作。

| 魔术方法 | 触发的语法 | 用途 |
|---------|-----------|------|
| \`__len__\` | \`len(obj)\` | 返回长度 |
| \`__getitem__(key)\` | \`obj[key]\`、切片 | 按键取值 |
| \`__setitem__(key, val)\` | \`obj[key] = val\` | 按键赋值 |
| \`__delitem__(key)\` | \`del obj[key]\` | 按键删除 |
| \`__contains__(item)\` | \`x in obj\` | 成员判断 |
| \`__iter__\` | \`for x in obj\` | 返回迭代器 |
| \`__next__\` | 迭代器取下一个 | 配合 \`__iter__\` |

### 一个自定义列表的例子

\`\`\`python
class MyList:
    def __init__(self, items=None):
        self._data = list(items) if items else []
    def __len__(self):
        return len(self._data)
    def __getitem__(self, i):
        return self._data[i]   # 自动支持切片
    def __setitem__(self, i, v):
        self._data[i] = v
    def __contains__(self, x):
        return x in self._data
    def __iter__(self):
        return iter(self._data)

ml = MyList([1, 2, 3])
len(ml)      # 3
ml[1]        # 2
ml[1] = 20
3 in ml      # True
for x in ml: print(x)
\`\`\`

只要实现了 \`__len__\` 和 \`__getitem__\`，即使没写 \`__iter__\` 和 \`__contains__\`，Python 也能"曲线救国"——\`for\` 会用 \`__getitem__\` 从 0 开始迭代，\`in\` 会用 \`__getitem__\` 逐个比较。这就是"协议"的灵活性：你实现一部分，Python 补全另一部分。

## 四、比较协议：让对象能用 ==、<、> 排序

| 魔术方法 | 语法 | 用途 |
|---------|------|------|
| \`__eq__\` | \`a == b\` | 相等 |
| \`__ne__\` | \`a != b\` | 不等（默认调 \`__eq__\` 取反） |
| \`__lt__\` | \`a < b\` | 小于 |
| \`__le__\` | \`a <= b\` | 小于等于 |
| \`__gt__\` | \`a > b\` | 大于 |
| \`__ge__\` | \`a >= b\` | 大于等于 |
| \`__hash__\` | \`hash(a)\`、当 dict/set 的键 | 哈希 |

### 一个关键规则：\`__eq__\` 和 \`__hash__\` 必须配套

如果你重写了 \`__eq__\`，Python 会**自动把 \`__hash__\` 设为 \`None\`**，意味着这个对象**不能当字典键 / 放进 set**。因为"可比较相等"的对象必须有确定的哈希值（相等的对象哈希必须相同），Python 怕你写错，干脆禁止。

\`\`\`python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))   # 配套定义，才能当 dict 键

p1, p2 = Point(1, 2), Point(1, 2)
p1 == p2        # True
{p1, p2}        # 只有一个元素，因为相等 + 哈希相同
\`\`\`

### 用 \`functools.total_ordering\` 省事

实现全部 6 个比较方法很烦。 \`@total_ordering\` 装饰器让你只写 \`__eq__\` 和 \`__lt__\`，它自动补全其他的。

\`\`\`python
from functools import total_ordering

@total_ordering
class Score:
    def __init__(self, v): self.v = v
    def __eq__(self, o): return self.v == o.v
    def __lt__(self, o): return self.v < o.v
# 现在自动有了 __le__、__gt__、__ge__
\`\`\`

## 五、上下文管理器协议：\`__enter__\` / \`__exit__\`

\`with\` 语句背后的两个魔术方法。

| 方法 | 作用 |
|------|------|
| \`__enter__\` | 进入 \`with\` 块时调用，返回值赋给 \`as\` 后的变量 |
| \`__exit__(exc_type, exc_val, exc_tb)\` | 离开 \`with\` 块时调用（无论是否异常）；返回 True 则吞掉异常 |

\`\`\`python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self   # 作为 as 后面的变量
    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        print(f"耗时 {time.time() - self.start:.3f}s")
        return False   # 不吞异常，正常向上抛

with Timer() as t:
    sum(range(1000000))
\`\`\`

\`__exit__\` 的三个参数是异常信息，没异常时全是 \`None\`。返回 \`True\` 表示"这个异常我处理了，别往外抛"，常用于资源清理时静默处理特定异常。

## 六、为什么叫"暗号"：协议而非继承

Python 的魔术方法体现的是**鸭子类型**和**协议**思想：Python 不检查你继承没继承某个基类，只检查你会不会响应某个暗号（有没有定义对应魔术方法）。

- 想当"序列"？定义 \`__getitem__\` + \`__len__\` 就行，不用继承 \`Sequence\`。
- 想当"可迭代"？定义 \`__iter__\` 或 \`__getitem__\` 就行。
- 想当"上下文管理器"？定义 \`__enter__\` + \`__exit__\` 就行。

这比 Java 那种"必须 implements 接口"灵活得多——**能力是"装"上去的，不是"声明"出来的**。这就是 Python 的"协议编程"哲学。

## 七、本章要点小结

- **\`__new__\` 造对象，\`__init__\` 装修对象**：单例、不可变类型才需要重写 \`__new__\`。
- **\`__str__\` 给人看，\`__repr__\` 给开发者看**：只写一个就写 \`__repr__\`。
- **容器协议**：\`__len__\`、\`__getitem__\`、\`__setitem__\`、\`__contains__\`、\`__iter__\` 让对象像列表。
- **比较协议**：\`__eq__\` 要和 \`__hash__\` 配套，否则对象不能哈希。
- **上下文管理**：\`__enter__\` + \`__exit__\` 支持 \`with\` 语句，\`__exit__\` 返回 True 吞异常。
- **协议思想**：能力靠定义魔术方法"装"上去，不用继承声明。

下一章我们钻得更深，讲属性访问最幕后的一层——**描述符**。 \`property\`、\`classmethod\`、\`staticmethod\` 的本质都是描述符 👉
`,
    code: `
# =============================================================
# 第18章演示：魔术方法 —— 自定义一个"像列表"的类
# 本代码仅用标准库，演示：
# 1. __new__ vs __init__
# 2. __str__ vs __repr__
# 3. 容器协议 __len__/__getitem__/__setitem__/__contains__/__iter__
# 4. 比较协议 __eq__/__lt__ + __hash__
# 5. 上下文管理器 __enter__/__exit__
# =============================================================

import time   # 后面计时要用，提前导入标准库

# 打印大标题
print("=" * 60)
print("  第18章：魔术方法 —— Python 的暗号")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：__new__ vs __init__
# -------------------------------------------------------------
print("\\n【第一部分】__new__ 造对象，__init__ 装修对象\\n")

class Singleton:
    # 类属性，用来存唯一实例
    _instance = None

    def __new__(cls, *args, **kwargs):
        # 如果还没有实例，就造一个
        if cls._instance is None:
            # 调 object.__new__ 真正分配内存
            cls._instance = super().__new__(cls)
        # 返回已有的那个实例
        return cls._instance

    def __init__(self, value):
        # 注意：单例下 __init__ 每次都会被调用
        self.value = value

# 造两个实例，验证它们是同一个对象
s1 = Singleton("甲")
s2 = Singleton("乙")
print(f"s1.value = {s1.value}")
print(f"s2.value = {s2.value}")
print(f"s1 is s2 => {s1 is s2}  （单例：永远是同一个对象）")

# -------------------------------------------------------------
# 第二部分：自定义列表类，演示容器协议 + 比较协议
# -------------------------------------------------------------
print("\\n【第二部分】自定义列表类 MyList\\n")

class MyList:
    """一个模仿内置 list 的自定义类，演示多种魔术方法"""

    def __init__(self, items=None):
        # 内部用真正的 list 存数据
        self._data = list(items) if items else []

    def __len__(self):
        # 支持 len(obj)
        return len(self._data)

    def __getitem__(self, index):
        # 支持 obj[index] 和切片
        return self._data[index]

    def __setitem__(self, index, value):
        # 支持 obj[index] = value
        self._data[index] = value

    def __contains__(self, item):
        # 支持 item in obj
        return item in self._data

    def __iter__(self):
        # 支持 for 循环，把迭代交给内部 list
        return iter(self._data)

    def __eq__(self, other):
        # 支持 ==，按内容比较
        if isinstance(other, MyList):
            return self._data == other._data
        # 返回 NotImplemented 让 Python 尝试对方的 __eq__
        return NotImplemented

    def __lt__(self, other):
        # 支持 <，按内容逐元素比较
        if isinstance(other, MyList):
            return self._data < other._data
        return NotImplemented

    def __hash__(self):
        # MyList 可变，不可哈希，明确禁止当 dict 键
        raise TypeError("MyList 不可哈希")

    def __str__(self):
        # 给普通用户看
        return f"MyList({self._data})"

    def __repr__(self):
        # 给开发者看，尽量能还原
        return f"MyList({self._data!r})"

# 创建实例
ml = MyList([1, 2, 3])
# 演示容器协议
print(f"len(ml) => {len(ml)}")
print(f"ml[1] => {ml[1]}")
# 修改某个元素
ml[1] = 20
print(f"修改后 ml => {ml}")
# 切片也能用，因为 __getitem__ 直接转给了 list
print(f"ml[0:2] => {ml[0:2]}")
# 成员判断
print(f"3 in ml => {3 in ml}")
print(f"99 in ml => {99 in ml}")
# 迭代
print("遍历 ml：")
for x in ml:
    print(f"  元素：{x}")

# 演示比较协议
ml2 = MyList([1, 20, 3])
ml3 = MyList([1, 99, 3])
print(f"ml == ml2 => {ml == ml2}  （内容相同）")
print(f"ml < ml3 => {ml < ml3}    （逐元素比较 20 < 99）")

# 演示 __str__ 和 __repr__ 的区别
print(f"print(ml) => {ml}")
print(f"repr(ml) => {repr(ml)}")
# 容器里的元素会用 __repr__
print(f"放在列表里 [ml, ml2] => {[ml, ml2]}")

# -------------------------------------------------------------
# 第三部分：上下文管理器 __enter__/__exit__
# -------------------------------------------------------------
print("\\n【第三部分】上下文管理器：计时器\\n")

class Timer:
    """用 with 语句自动计时的上下文管理器"""

    def __enter__(self):
        # 进入 with 块时记录开始时间
        self.start = time.time()
        # 返回 self，作为 as 后面的变量
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # 离开 with 块时计算并打印耗时
        self.elapsed = time.time() - self.start
        print(f"  本次 with 块耗时 {self.elapsed:.6f} 秒")
        # 三个异常参数打印一下，没异常时是 None
        if exc_type is not None:
            # 有异常时打印异常类型
            print(f"  with 块里发生了异常：{exc_type.__name__}")
        # 返回 False 表示不吞异常，正常向上抛
        return False

# 正常用法：无异常
print("▶ 正常计时：")
with Timer() as t:
    # 做点耗时的运算
    total = sum(range(500000))
print(f"  求和结果 = {total}")

# 异常用法：with 块里抛异常
print("\\n▶ with 块里有异常：")
try:
    with Timer():
        # 故意制造一个除零异常
        _ = 1 / 0
except ZeroDivisionError as e:
    # 捕获异常，证明 __exit__ 返回 False 没吞异常
    print(f"  外部捕获到异常：{e}")

# 小结
print("\\n" + "=" * 60)
print("  小结：魔术方法 = Python 自动调用的暗号 = 协议")
print("=" * 60)
`,
  },
  {
    id: "pyrun-19",
    group: "面向对象原理",
    icon: "🔀",
    title: "描述符：属性访问的幕后",
    content: `
# 🔀 描述符：属性访问的幕后

## 一个被忽略的真相：\`property\` 到底是什么

你可能写过很多次 \`@property\`，但有没有想过：**为什么加个装饰器，\`obj.x\` 就能自动触发 getter、校验逻辑？** 答案就是这一章的主角——**描述符**（descriptor）。

描述符是 Python 属性访问最底层、最幕后的机制。 \`property\`、\`classmethod\`、\`staticmethod\`、ORM 里的字段、\`functools.cached_property\`，本质全都是描述符。理解了描述符，你就理解了 Python 面向对象的"最后一层窗户纸"。

### 大白话比喻：物业管家

描述符就像**物业管家**。每次你要用某个"房间"（属性），管家都会帮你**登记、检查、代取钥匙**，而不是让你直接闯进房间。

- 你说 \`obj.x = 5\`（想进房间）→ 管家 \`__set__\` 拦住你，先校验类型、记录日志，再帮你放进去
- 你说 \`obj.x\`（想出房间）→ 管家 \`__get__\` 帮你从仓库里取出来，顺手做点加工

而这个"管家"本身也是一个对象，作为**类属性**放在类里。Python 在查找属性时，发现这个类属性是个描述符，就会"绕道"调它的 \`__get__\` / \`__set__\`，而不是直接返回它本身。

## 一、描述符协议：三个方法

描述符协议由三个方法组成：

| 方法 | 签名 | 触发场景 |
|------|------|---------|
| \`__get__\` | \`__get__(self, instance, owner)\` | 读：\`obj.x\` 或 \`Cls.x\` |
| \`__set__\` | \`__set__(self, instance, value)\` | 写：\`obj.x = v\` |
| \`__delete__\` | \`__delete__(self, instance)\` | 删：\`del obj.x\` |

只要一个对象实现了 \`__get__\`，它就是个描述符。三个方法都实现的，叫"全能管家"。

### 参数含义

\`__get__(self, instance, owner)\`：

- \`self\`：描述符自己（那个类属性对象）
- \`instance\`：访问它的实例（\`obj.x\` 时是 \`obj\`；\`Cls.x\` 时是 \`None\`）
- \`owner\`：描述符所在的类（\`Cls\`）

\`__set__(self, instance, value)\`：

- \`instance\`：被赋值的实例
- \`value\`：要赋的值

### 一个最小描述符

\`\`\`python
class Logged:
    def __get__(self, instance, owner):
        print(f"读取 {instance!r} 的属性")
        return instance._value
    def __set__(self, instance, value):
        print(f"设置 {instance!r} 的属性为 {value!r}")
        instance._value = value

class Foo:
    x = Logged()

f = Foo()
f.x = 10      # 打印 "设置 ... 的属性为 10"
print(f.x)    # 打印 "读取 ... 的属性" 然后返回 10
\`\`\`

注意 \`Logged()\` 是作为**类属性** \`x\` 放在 \`Foo\` 里的，但实际值存在**实例**的 \`_value\` 上。这是描述符的常见模式：**描述符本身不存数据，数据存在实例上**，描述符只负责"拦截访问 + 做点额外的事"。

## 二、数据描述符 vs 非数据描述符

这是描述符最重要的分类，决定了它和实例属性的"优先级博弈"。

| 类型 | 实现的方法 | 优先级 |
|------|-----------|--------|
| **数据描述符** | \`__get__\` + \`__set__\`（或 \`__delete__\`） | 高于实例属性 |
| **非数据描述符** | 只有 \`__get__\` | 低于实例属性 |

### 优先级规则（重要）

Python 属性查找的完整优先级（在第 17 章基础上细化）：

\`\`\`
obj.x 的查找（obj 是实例，type(obj) 是类）：
  1. type(obj) 的 __mro__ 里的【数据描述符】的 __get__
  2. obj.__dict__（实例属性）
  3. type(obj) 的 __mro__ 里的【非数据描述符】的 __get__ / 普通类属性
  4. __getattr__（如果定义了）
  5. AttributeError
\`\`\`

关键差异：

- **数据描述符优先级 > 实例属性**：就算实例 \`__dict__\` 里有同名属性，也会被数据描述符"截胡"。
- **实例属性 > 非数据描述符**：实例 \`__dict__\` 里有同名属性时，非数据描述符就让位。

### 为什么这么设计

- **数据描述符**（如 \`property\`、ORM 字段）通常代表"需要校验/计算"的属性，必须优先，否则用户能在实例 \`__dict__\` 里塞个值绕过校验。
- **非数据描述符**（如普通方法、\`classmethod\`）通常是"可被覆盖"的，允许实例用自己的值覆盖。

### 验证优先级

\`\`\`python
class DataDesc:
    def __get__(self, ins, owner): return "数据描述符"
    def __set__(self, ins, v): pass

class NonDataDesc:
    def __get__(self, ins, owner): return "非数据描述符"

class Foo:
    d = DataDesc()
    n = NonDataDesc()

f = Foo()
f.__dict__['d'] = "实例里的 d"
f.__dict__['n'] = "实例里的 n"
print(f.d)   # "数据描述符"  —— 数据描述符赢
print(f.n)   # "实例里的 n"  —— 实例属性赢
\`\`\`

## 三、property 的本质就是一个描述符

\`property\` 不是魔法，它就是一个用 C 实现的**数据描述符**。等价的 Python 实现大致是：

\`\`\`python
class MyProperty:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
    def __get__(self, instance, owner):
        if instance is None:
            return self
        if self.fget is None:
            raise AttributeError("不可读")
        return self.fget(instance)
    def __set__(self, instance, value):
        if self.fset is None:
            raise AttributeError("不可写")
        self.fset(instance, value)
    def setter(self, fn):
        # 装饰器方法，返回一个带 setter 的新 property
        return MyProperty(self.fget, fn, self.fdel)
    def deleter(self, fn):
        return MyProperty(self.fget, self.fset, fn)
\`\`\`

用法和内置 \`property\` 一模一样：

\`\`\`python
class Temperature:
    def __init__(self):
        self._c = 0
    @MyProperty
    def c(self):
        return self._c
    @c.setter
    def c(self, v):
        if v < -273.15:
            raise ValueError("低于绝对零度")
        self._c = v
\`\`\`

理解了这一点，\`@property\` 就再也不是"魔法"，而是"一个数据描述符 + 装饰器语法糖"。

## 四、classmethod / staticmethod 的实现

这两个装饰器的本质也都是**非数据描述符**。

### classmethod

\`classmethod\` 把函数包装成一个描述符，\`__get__\` 时返回一个"绑定了类"的绑定方法（第一个参数自动是类，而不是实例）。

\`\`\`python
class MyClassMethod:
    def __init__(self, fn):
        self.fn = fn
    def __get__(self, instance, owner):
        # owner 是类，返回绑定了 owner 的方法
        def wrapper(*args, **kwargs):
            return self.fn(owner, *args, **kwargs)
        return wrapper

class Foo:
    @MyClassMethod
    def cls_method(cls):
        return f"我是 {cls.__name__}"
\`\`\`

### staticmethod

\`staticmethod\` 更简单：\`__get__\` 直接返回原函数，不做任何绑定。

\`\`\`python
class MyStaticMethod:
    def __init__(self, fn):
        self.fn = fn
    def __get__(self, instance, owner):
        # 直接返回原函数，不绑定 self 也不绑定 cls
        return self.fn
\`\`\`

所以 \`classmethod\` 和 \`staticmethod\` 的区别，本质就是它们的描述符 \`__get__\` 返回的东西不同：前者返回"绑了类的函数"，后者返回"原函数"。

## 五、描述符为什么要把数据存在实例上

这是个初学者很容易写错的地方。看一个**错误示范**：

\`\`\`python
class BadField:
    def __init__(self):
        self.value = None     # 错！这是存在描述符自己身上的
    def __get__(self, ins, owner):
        return self.value
    def __set__(self, ins, v):
        self.value = v

class User:
    name = BadField()

u1 = User(); u1.name = "甲"
u2 = User(); u2.name = "乙"
print(u1.name)   # "乙"  —— 串了！所有实例共享了同一个 value
\`\`\`

问题在于：\`BadField()\` 只有一个实例（作为类属性 \`User.name\`），它的 \`self.value\` 当然也只有一份，所有实例共享，于是串了。

**正确做法**：把数据存在**实例**的 \`__dict__\` 里，用某种"键"区分不同实例。

\`\`\`python
class GoodField:
    def __init__(self):
        self.key = "_good_value"
    def __get__(self, ins, owner):
        return ins.__dict__.get(self.key)
    def __set__(self, ins, v):
        ins.__dict__[self.key] = v
\`\`\`

更健壮的做法是用描述符实例自己的 \`id\` 或名字拼 key，避免冲突（下面的 demo 会展示）。

## 六、描述符的实际用途

### 1. 类型校验

最经典的用途：定义带类型/范围校验的字段。

\`\`\`python
class Typed:
    def __init__(self, type_): self.type_ = type_
    def __get__(self, ins, owner):
        return ins.__dict__.get(self.name)
    def __set__(self, ins, v):
        if not isinstance(v, self.type_):
            raise TypeError(f"必须是 {self.type_.__name__}")
        ins.__dict__[self.name] = v
\`\`\`

### 2. ORM 字段

Django/SQLAlchemy 的字段都是描述符，访问 \`user.name\` 时从数据库行里取值，赋值时标记 dirty 等待 flush。

### 3. 延迟加载

\`functools.cached_property\` 就是个非数据描述符，第一次访问时计算并写入实例 \`__dict__\`，后续访问因为实例属性优先而直接命中缓存。

### 4. 访问日志/权限控制

任何"想在属性读写时插一脚"的需求，描述符都是最优雅的方案。

## 七、本章要点小结

- **描述符协议**：\`__get__\`、\`__set__\`、\`__delete__\`，描述符作为类属性存在。
- **数据描述符**（有 \`__set__\`）优先级 > 实例属性 > **非数据描述符**（只有 \`__get__\`）。
- **\`property\` 就是数据描述符**，\`classmethod\`/\`staticmethod\` 是非数据描述符。
- **数据存在实例上**：描述符自己不存数据，存 \`instance.__dict__\`，否则实例间会串值。
- **实际用途**：类型校验、ORM 字段、延迟加载、日志/权限控制。

下一章是 OOP 系列的终章——**元类**。如果说描述符管"属性怎么访问"，那元类管"类怎么被造出来"。翻页继续 👉
`,
    code: `
# =============================================================
# 第19章演示：用描述符实现属性类型校验
# 本代码仅用标准库，演示：
# 1. 数据描述符：__get__ / __set__
# 2. 数据描述符 vs 非数据描述符 的优先级
# 3. 用描述符实现类型校验字段
# 4. 自己实现一个简易 property
# =============================================================

# 打印大标题
print("=" * 60)
print("  第19章：描述符 —— 属性访问的幕后")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：数据描述符 vs 非数据描述符 的优先级
# -------------------------------------------------------------
print("\\n【第一部分】数据描述符 vs 非数据描述符 优先级\\n")

# 定义一个数据描述符（有 __get__ 和 __set__）
class DataDesc:
    # __get__ 在读取时被调用
    def __get__(self, instance, owner):
        # 返回固定字符串，证明它"赢了"
        return "数据描述符的值"
    # __set__ 在赋值时被调用
    def __set__(self, instance, value):
        # 这里啥也不做，只为成为数据描述符
        pass

# 定义一个非数据描述符（只有 __get__）
class NonDataDesc:
    # __get__ 在读取时被调用
    def __get__(self, instance, owner):
        # 返回固定字符串
        return "非数据描述符的值"

# 定义测试类，把两个描述符作为类属性
class Demo:
    # d 是数据描述符
    d = DataDesc()
    # n 是非数据描述符
    n = NonDataDesc()

# 创建实例
demo = Demo()
# 在实例 __dict__ 里塞同名属性，模拟"实例属性"
demo.__dict__['d'] = "实例里的 d"
demo.__dict__['n'] = "实例里的 n"
# 数据描述符优先级高于实例属性
print(f"demo.d => {demo.d}  （数据描述符赢）")
# 实例属性优先级高于非数据描述符
print(f"demo.n => {demo.n}  （实例属性赢）")

# -------------------------------------------------------------
# 第二部分：用描述符实现类型校验字段
# -------------------------------------------------------------
print("\\n【第二部分】用描述符实现类型校验\\n")

class TypedField:
    """数据描述符：对属性做类型校验"""

    def __init__(self, expected_type, name):
        # 记录期望的类型
        self.expected_type = expected_type
        # 记录属性名，用作实例字典里的 key
        self.name = name

    def __get__(self, instance, owner):
        # 类访问时返回描述符自己
        if instance is None:
            return self
        # 从实例字典里取值，没有就返回 None
        return instance.__dict__.get(self.name, None)

    def __set__(self, instance, value):
        # 赋值前做类型校验
        if not isinstance(value, self.expected_type):
            # 类型不对就抛异常
            raise TypeError(
                f"{self.name} 必须是 {self.expected_type.__name__} 类型，"
                f"但收到 {type(value).__name__}"
            )
        # 校验通过，存到实例字典
        instance.__dict__[self.name] = value

    def __delete__(self, instance):
        # 支持 del 删除
        if self.name in instance.__dict__:
            del instance.__dict__[self.name]

class User:
    # 用描述符声明两个有类型限制的字段
    name = TypedField(str, "name")
    age = TypedField(int, "age")

# 正常赋值
u = User()
u.name = "小明"
u.age = 18
print(f"姓名：{u.name}，年龄：{u.age}")

# 类型校验失败：age 必须是 int
try:
    # 故意赋一个字符串
    u.age = "十八"
except TypeError as e:
    # 捕获并打印错误
    print(f"校验失败：{e}")

# 类型校验失败：name 必须是 str
try:
    # 故意赋一个数字
    u.name = 12345
except TypeError as e:
    # 捕获并打印错误
    print(f"校验失败：{e}")

# 通过类访问描述符本身
print(f"User.name 是 => {User.name}")

# -------------------------------------------------------------
# 第三部分：自己实现一个简易 property
# -------------------------------------------------------------
print("\\n【第三部分】自己实现一个简易 property\\n")

class MyProperty:
    """简易 property：等价于内置 property 的核心逻辑"""

    def __init__(self, fget=None, fset=None, fdel=None):
        # 保存 getter/setter/deleter 函数
        self.fget = fget
        self.fset = fset
        self.fdel = fdel

    def __get__(self, instance, owner):
        # 类访问时返回自己
        if instance is None:
            return self
        # 没有 getter 就报错
        if self.fget is None:
            raise AttributeError("该属性不可读")
        # 调用 getter，把实例传进去
        return self.fget(instance)

    def __set__(self, instance, value):
        # 没有 setter 就报错
        if self.fset is None:
            raise AttributeError("该属性不可写")
        # 调用 setter
        self.fset(instance, value)

    def setter(self, fn):
        # 装饰器方法：返回一个带 setter 的新 MyProperty
        return MyProperty(self.fget, fn, self.fdel)

class Temperature:
    """摄氏度温度类，c 是只读 property，k 是可读写带校验"""

    def __init__(self, celsius):
        # 内部用 _celsius 存储
        self._celsius = celsius

    @MyProperty
    def c(self):
        # getter：返回摄氏度
        return self._celsius

    @MyProperty
    def k(self):
        # getter：返回开尔文温度
        return self._celsius + 273.15

    @k.setter
    def k(self, value):
        # setter：开尔文不能低于 0
        if value < 0:
            raise ValueError("开尔文温度不能低于 0")
        # 反算摄氏度并存储
        self._celsius = value - 273.15

# 创建实例
t = Temperature(25)
# 读取只读 property
print(f"t.c => {t.c} ℃")
# 读取带校验的 property
print(f"t.k => {t.k} K")
# 通过 setter 修改
t.k = 300
print(f"改后 t.c => {t.c:.2f} ℃")
# setter 校验失败
try:
    # 故意赋负值
    t.k = -10
except ValueError as e:
    print(f"校验失败：{e}")

# 不可写 property 校验
try:
    # c 没有 setter，应该报错
    t.c = 100
except AttributeError as e:
    print(f"写入失败：{e}")

# 小结
print("\\n" + "=" * 60)
print("  小结：描述符 = 属性访问的管家，property 就是数据描述符")
print("=" * 60)
`,
  },
  {
    id: "pyrun-20",
    group: "面向对象原理",
    icon: "🧬",
    title: "元类：创建类的类",
    content: `
# 🧬 元类：创建类的类

## 终于走到了 OOP 的"顶层"

这是面向对象原理系列的最后一章，也是站在 Python 对象模型"最高层"俯瞰全局的一章。前面我们学了：

- 第 16 章：类是 \`type\` 造出来的对象
- 第 17 章：属性怎么查找（MRO）
- 第 18 章：魔术方法怎么响应语法暗号
- 第 19 章：描述符怎么拦截属性访问

这一章我们回答最后一个问题：**类本身，是怎么被"造"出来的？谁在造它？能不能定制这个过程？** 答案就是——**元类**（metaclass）。

### 大白话比喻：图纸的图纸

接着第 16 章的比喻：

- **产品** = 实例对象
- **图纸** = 类对象
- **画图纸的机器** = 元类

普通工厂用图纸造产品；元类是"**画图纸的机器**"，它决定了**图纸怎么被画出来**。你可以改造这台机器（自定义元类），让它在画每张图纸时自动做一些事——比如自动注册插件、自动加字段、自动校验类定义。

## 一、type 是所有类的元类

第 16 章已经说过，\`type\` 是 Python 里所有类的"造物主"：

\`\`\`python
class Dog: pass
type(Dog)        # <class 'type'>   —— Dog 是 type 造的
type(int)        # <class 'type'>   —— 连内置类型 int 都是 type 造的
type(type)       # <class 'type'>   —— type 自己也是 type 造的（自举）
\`\`\`

所以 **\`type\` 就是默认的元类**。当你写 \`class Dog:\`，Python 实际上是在调 \`type("Dog", bases, namespace)\` 来造类。整个过程可以理解为：

\`\`\`
class Dog(Base):           # 你写的
    species = "犬科"

  ↓ 等价于

Dog = type("Dog", (Base,), {"species": "犬科"})
\`\`\`

### 元类做了什么

元类造一个类，大致经历这几步（这就是 \`type.__call__\` 的流程）：

1. \`__prepare__\`：返回一个命名空间字典（默认是普通 \`dict\`，可定制成 \`OrderedDict\` 等）
2. 执行类体，把名字填进这个命名空间
3. \`__new__\`：真正创建类对象
4. \`__init__\`：初始化类对象
5. 返回类对象，绑定到类名

自定义元类就是重写其中某几步，在"类被创建"的瞬间插一脚。

## 二、自定义元类：怎么改造"画图纸的机器"

### 方法一：用 \`metaclass\` 关键字参数

\`\`\`python
class MyMeta(type):
    def __new__(mcs, name, bases, namespace):
        print(f"正在创建类 {name}")
        cls = super().__new__(mcs, name, bases, namespace)
        return cls

class Foo(metaclass=MyMeta):
    pass
# 打印 "正在创建类 Foo"
\`\`\`

注意几个细节：

- 元类必须继承 \`type\`（因为你要"改造"造类机器，得先有一台原版机器）
- \`__new__\` 的第一个参数习惯叫 \`mcs\`（而不是 \`cls\`），表示"这是个元类"
- 一定要调 \`super().__new__(mcs, name, bases, namespace)\` 真正造出类，否则类没被创建

### \`__new__\` vs \`__init__\` vs \`__prepare__\`

元类可以重写这三个方法，分工不同：

| 方法 | 作用 | 常见用途 |
|------|------|---------|
| \`__prepare__\` | 返回命名空间字典（在类体执行前） | 用 OrderedDict 记录字段定义顺序（ORM） |
| \`__new__\` | 创建并返回类对象 | 改/查 namespace，决定要不要创建 |
| \`__init__\` | 初始化已创建的类 | 给类加额外属性 |

\`__prepare__\` 是个类方法，返回的字典会被用来"接住"类体里的所有名字。这在 ORM 里很有用——可以记录字段定义的先后顺序（普通 dict 在 Python 3.7+ 也保序，但 \`__prepare__\` 让你能用更花哨的字典，比如带钩子的）。

## 三、\`__init_subclass__\`：轻量级的"元类替代品"

很多人一听到"自动改类"就上元类，其实 Python 3.6+ 提供了一个**更轻量**的钩子：\`__init_subclass__\`。它能在父类被继承时自动触发，不用写元类。

\`\`\`python
class Plugin:
    registry = []
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry.append(cls)

class LogPlugin(Plugin): pass
class CachePlugin(Plugin): pass
# Plugin.registry 现在是 [LogPlugin, CachePlugin]
\`\`\`

每当有类继承 \`Plugin\`，\`Plugin.__init_subclass__\` 就会被调用，参数 \`cls\` 是那个**新创建的子类**。这就实现了"自动注册子类"，**而且不用写元类**。

### \`__init_subclass__\` vs 元类

| 对比维度 | \`__init_subclass__\` | 自定义元类 |
|---------|---------------------|-----------|
| 复杂度 | 低，一个方法搞定 | 高，要写一个 type 子类 |
| 能力 | 只能在子类创建后做点事 | 能在类创建的每一步插手（\`__prepare__\`、\`__new__\`） |
| 适用场景 | 注册、加属性、校验 | 改命名空间、记录顺序、拦截创建 |
| 多继承冲突 | 少 | 多个元类混用容易冲突 |

**经验法则**：能用 \`__init_subclass__\` 解决的，就别上元类。元类是"重型武器"，留给真正需要改"造类过程"的场景。

## 四、元类的实际用途

### 1. 插件自动注册

这是元类最经典的用途。定义一个 \`Plugin\` 基类，所有子类只要一被定义，就自动注册到全局表里，不用手动调注册函数。

\`\`\`python
REGISTRY = {}

class PluginMeta(type):
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:   # 跳过基类本身
            REGISTRY[name] = cls
        return cls

class Plugin(metaclass=PluginMeta): pass
class LogPlugin(Plugin): pass
class CachePlugin(Plugin): pass
# REGISTRY == {"LogPlugin": LogPlugin, "CachePlugin": CachePlugin}
\`\`\`

好处：插件作者只需"继承 Plugin"，不用记得调 \`register()\`，少一个出错点。这就是 Django、Flask 插件机制的核心思路。

### 2. ORM 字段收集

Django ORM 的 \`class Model(metaclass=ModelMeta)\` 会在类创建时扫描 namespace，把所有 \`Field\` 实例收集到 \`_meta.fields\`，并自动加主键、关联反向关系。没有元类，这种"声明式字段"的 API 根本写不出来。

\`\`\`python
class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        fields = {}
        for key, val in list(namespace.items()):
            if isinstance(val, Field):
                fields[key] = val
        namespace['_fields'] = fields
        return super().__new__(mcs, name, bases, namespace)

class Model(metaclass=ModelMeta): pass

class User(Model):
    name = CharField()
    age = IntField()
# User._fields == {"name": CharField(), "age": IntField()}
\`\`\`

### 3. 接口/抽象类校验

\`abc.ABCMeta\` 就是个元类，它会在类创建时检查"抽象方法是否都被实现了"，没实现完就不允许实例化。

### 4. dataclass 的"近亲"

\`@dataclass\` 装饰器虽然不直接用元类，但思路类似——在类创建后扫描字段、自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`。

## 五、元类的"坑"与注意事项

### 1. 元类冲突

\`\`\`python
class MetaA(type): pass
class MetaB(type): pass
class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass
class C(A, B): pass   # TypeError: metaclass conflict
\`\`\`

\`C\` 同时继承两个用了不同元类的类，Python 不知道该用哪个元类造 \`C\`，直接报错。解决办法：让两个元类有继承关系，或者显式指定 \`class C(A, B, metaclass=...)\`。

### 2. 元类是"传染"的

一旦你用了元类，所有子类都会"继承"这个元类。这意味着子类的创建也会被你的元类拦截。这通常是好事（插件注册依赖这个），但也可能带来意外的性能开销或行为。

### 3. 优先考虑 \`__init_subclass__\` 和装饰器

90% 的"我想自动改类"需求，用 \`__init_subclass__\` 或类装饰器就能解决，而且更简单、更不易冲突。元类是最后的手段。

> "元类的魔力 99% 都能用更简单的方式实现，剩下 1% 才真的需要元类。" —— Tim Peters（Python 之禅作者）

## 六、本章要点小结

- **\`type\` 是默认元类**：所有类都是 \`type\` 造的，\`type\` 自举。
- **自定义元类**：继承 \`type\`，重写 \`__prepare__\` / \`__new__\` / \`__init__\`，用 \`metaclass=...\` 指定。
- **\`__init_subclass__\`**：轻量级钩子，子类创建时自动触发，多数场景能替代元类。
- **实际用途**：插件注册、ORM 字段收集、抽象类校验、声明式 API。
- **注意事项**：元类冲突、传染性，优先用 \`__init_subclass__\` / 装饰器。

## 写在系列最后

到这里，"Python 执行代码原理"面向对象原理的 5 章就讲完了。回顾一下这条认知主线：

1. **类的本质**（第 16 章）：class = type() 调用，类也是对象
2. **属性查找**（第 17 章）：实例 → 类 → MRO 父类
3. **魔术方法**（第 18 章）：协议暗号，让对象融入语法
4. **描述符**（第 19 章）：属性访问的幕后管家
5. **元类**（第 20 章）：造类的机器，定制类的创建过程

这五层加起来，就是 Python 面向对象的"完整解剖图"。日常写业务代码你可能用不上元类，但当你读框架源码、设计基础库、或者排查一个"诡异"的属性行为时，这些底层知识就是你的"透视眼"。

掌握了原理，Python 就不再是"黑箱"，而是一台你可以拆开看、改着玩的机器。祝你玩得开心 🎉
`,
    code: `
# =============================================================
# 第20章演示：用元类实现自动注册插件
# 本代码仅用标准库，演示：
# 1. type 是所有类的元类
# 2. 自定义元类 __new__ 拦截类创建
# 3. __init_subclass__ 轻量级钩子
# 4. 用元类实现插件自动注册
# 5. 用 __init_subclass__ 实现同样的注册
# =============================================================

# 打印大标题
print("=" * 60)
print("  第20章：元类 —— 创建类的类")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：type 是所有类的元类
# -------------------------------------------------------------
print("\\n【第一部分】type 是所有类的元类\\n")

# 定义一个普通类
class Dog:
    # 简单叫一声
    def speak(self):
        return "汪"

# 查看各类的"造物主"
print(f"type(Dog)  => {type(Dog)}")
print(f"type(int)  => {type(int)}")
print(f"type(type) => {type(type)}  （type 自举）")

# -------------------------------------------------------------
# 第二部分：自定义元类，拦截类创建
# -------------------------------------------------------------
print("\\n【第二部分】自定义元类拦截类创建\\n")

# 全局插件注册表
REGISTRY = {}

# 自定义元类，继承 type
class PluginMeta(type):
    """插件元类：子类一被定义就自动注册"""

    # __new__ 在类对象被创建时调用
    def __new__(mcs, name, bases, namespace):
        # 先调用 type.__new__ 真正造出类
        cls = super().__new__(mcs, name, bases, namespace)
        # bases 为空说明是基类本身，跳过注册
        if bases:
            # 把新类登记到全局注册表
            REGISTRY[name] = cls
            print(f"  [PluginMeta] 自动注册了插件：{name}")
        # 返回造好的类
        return cls

# 定义插件基类，指定元类
class Plugin(metaclass=PluginMeta):
    """所有插件的基类"""
    # 子类必须实现 run
    def run(self):
        raise NotImplementedError

# 定义几个具体插件，会被元类自动注册
class LogPlugin(Plugin):
    # 日志插件
    def run(self):
        return "日志插件：记录运行日志"

class CachePlugin(Plugin):
    # 缓存插件
    def run(self):
        return "缓存插件：加速数据读取"

class AuthPlugin(Plugin):
    # 鉴权插件
    def run(self):
        return "鉴权插件：校验用户身份"

# 查看注册表内容
print(f"\\n  已注册插件 => {list(REGISTRY.keys())}")

# 遍历注册表，实例化并运行每个插件
print("  逐个运行插件：")
for name, cls in REGISTRY.items():
    # 实例化插件
    plugin = cls()
    # 调用 run 方法
    result = plugin.run()
    print(f"    {name}: {result}")

# -------------------------------------------------------------
# 第三部分：__init_subclass__ 轻量级钩子
# -------------------------------------------------------------
print("\\n【第三部分】__init_subclass__ 轻量级钩子\\n")

# 另一个注册表，演示不用元类也能注册
REGISTRY2 = {}

# 定义带钩子的基类，不用元类
class PluginBase:
    """用 __init_subclass__ 实现自动注册的基类"""

    # 每当有子类被创建，这个方法自动触发
    def __init_subclass__(cls, **kwargs):
        # 必须调 super，保证继承链上其他钩子也被调用
        super().__init_subclass__(**kwargs)
        # 把子类登记到注册表
        REGISTRY2[cls.__name__] = cls
        print(f"  [__init_subclass__] 自动注册了：{cls.__name__}")

# 定义几个子类，会触发钩子
class HelloPlugin(PluginBase):
    # 问候插件
    def run(self):
        return "Hello!"

class ByePlugin(PluginBase):
    # 告别插件
    def run(self):
        return "Bye!"

# 查看第二个注册表
print(f"\\n  REGISTRY2 => {list(REGISTRY2.keys())}")

# -------------------------------------------------------------
# 第四部分：对比两种方式的输出
# -------------------------------------------------------------
print("\\n【第四部分】对比元类 vs __init_subclass__\\n")

print(f"  元类方式注册数：{len(REGISTRY)}")
print(f"  钩子方式注册数：{len(REGISTRY2)}")
print("  两者都能实现自动注册，钩子方式更轻量、更不易冲突")

# -------------------------------------------------------------
# 第五部分：用 __init_subclass__ 接收自定义参数
# -------------------------------------------------------------
print("\\n【第五部分】__init_subclass__ 接收自定义参数\\n")

# 定义带顺序参数的基类
class Task:
    """任务基类，子类可声明优先级"""

    def __init_subclass__(cls, priority=0, **kwargs):
        # 调用父类钩子
        super().__init_subclass__(**kwargs)
        # 把优先级存到类上
        cls.priority = priority
        print(f"  任务 {cls.__name__} 注册，优先级 = {priority}")

# 定义高优先级任务
class UrgentTask(Task, priority=10):
    # 急件
    pass

# 定义普通任务
class NormalTask(Task, priority=5):
    # 普通件
    pass

# 验证优先级被正确设置
print(f"  UrgentTask.priority = {UrgentTask.priority}")
print(f"  NormalTask.priority = {NormalTask.priority}")

# 小结
print("\\n" + "=" * 60)
print("  小结：元类 = 造类的机器；多数场景用 __init_subclass__ 就够了")
print("=" * 60)
`,
  },
];
