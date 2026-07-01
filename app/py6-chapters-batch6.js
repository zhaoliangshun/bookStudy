export const chapters = [
  {
    id: "py6-class-basic", group: "面向对象", icon: "🏛️", title: "类与对象基础",
    content: `## 🏛️ 类与对象基础

### 什么是面向对象编程？

面向对象编程（Object-Oriented Programming，OOP）是一种编程思想，它把数据和操作数据的方法**打包在一起**，形成"对象"。

用现实世界做比喻：
- **类（Class）** = 设计图纸/模具（比如"狗"的设计图）
- **对象（Object/Instance）**= 根据图纸造出来的具体事物（比如你家的那只柴犬"旺财"）

### 定义类

用 \`class\` 关键字定义类，类名通常用**大驼峰命名法**（每个单词首字母大写）：

\`\`\`python
class Dog:
    # 类的内容
    pass
\`\`\`

### 创建实例（对象）

类名加括号就像函数调用一样，创建一个实例：

\`\`\`python
dog1 = Dog()  # 创建了一只狗
dog2 = Dog()  # 创建了另一只狗
\`\`\`

### 属性和方法

- **属性（Attribute）**：对象的特征/数据（如狗的名字、年龄、颜色）
- **方法（Method）**：对象能做的事情/行为（如狗会叫、会跑、会吃）

### 给对象添加属性

\`\`\`python
dog1.name = "旺财"
dog1.age = 3
dog1.breed = "柴犬"
\`\`\`

### 类和对象的关系

- 一个类可以创建**无数个对象**
- 每个对象有自己**独立的属性值**
- 对象共享类中定义的**方法**

### 为什么用面向对象？

| 优点 | 说明 |
|------|------|
| 封装 | 把数据和操作绑在一起，更安全 |
| 复用 | 通过继承减少重复代码 |
| 直观 | 和现实世界对应，更容易理解 |
| 可扩展 | 添加新功能方便，不影响已有代码 |
`,
    code: `# ========== 类与对象基础 ==========

# 1. 定义一个最简单的类
class Dog:
    pass  # pass表示"什么也不做"，空占位符

# 2. 创建对象（实例化）
print("=== 创建对象 ===")
dog1 = Dog()
dog2 = Dog()
print(f"dog1 = {dog1}")
print(f"dog2 = {dog2}")
print(f"dog1 和 dog2 是同一个对象吗？{dog1 is dog2}")  # False，两个不同的对象

# 3. 给对象添加属性（特征）
print("\\n=== 给对象添加属性 ===")
dog1.name = "旺财"
dog1.age = 3
dog1.breed = "柴犬"
dog1.color = "黄色"

dog2.name = "小白"
dog2.age = 2
dog2.breed = "比熊"
dog2.color = "白色"

print(f"dog1: 名字={dog1.name}, 年龄={dog1.age}岁, 品种={dog1.breed}, 毛色={dog1.color}")
print(f"dog2: 名字={dog2.name}, 年龄={dog2.age}岁, 品种={dog2.breed}, 毛色={dog2.color}")

# 每个对象的属性是独立的
dog1.age = 4
print(f"\\ndog1的年龄改成4岁后:")
print(f"  dog1.age = {dog1.age}")
print(f"  dog2.age = {dog2.age}（不受影响！）")

# 4. 定义带方法的类
print("\\n=== 类的方法（行为）===")
class Cat:
    # 方法的第一个参数必须是 self（代表对象自己）
    def meow(self):
        print(f"  喵~ 我是{self.name}")

    def introduce(self):
        print(f"  我是{self.name}，今年{self.age}岁，是一只{self.color}的{self.breed}")

    def birthday(self):
        self.age += 1
        print(f"  🎂 {self.name}过生日了！现在{self.age}岁啦")

# 创建猫对象
cat1 = Cat()
cat1.name = "咪咪"
cat1.age = 2
cat1.breed = "英短"
cat1.color = "灰色"

cat1.meow()
cat1.introduce()
cat1.birthday()
cat1.introduce()

# 5. 再看一个例子：学生类
print("\\n=== 学生类示例 ===")
class Student:
    def study(self, subject):
        print(f"  {self.name} 正在学习 {subject}")

    def sleep(self):
        print(f"  {self.name} 睡觉了 zzz")

s1 = Student()
s1.name = "小明"
s1.age = 18
s1.grade = "高三"
s1.study("数学")
s1.study("Python")
s1.sleep()

s2 = Student()
s2.name = "小红"
s2.age = 17
s2.grade = "高二"
s2.study("英语")

# 6. 查看对象的属性
print("\\n=== 对象的属性字典 __dict__ ===")
print(f"dog1 的属性: {dog1.__dict__}")
print(f"cat1 的属性: {cat1.__dict__}")

# 7. 判断对象类型
print("\\n=== 类型检查 ===")
print(f"dog1 是 Dog 类型吗？{type(dog1).__name__ == 'Dog'}")
print(f"isinstance(dog1, Dog) = {isinstance(dog1, Dog)}")
print(f"isinstance(cat1, Cat) = {isinstance(cat1, Cat)}")
print(f"isinstance(dog1, Cat) = {isinstance(dog1, Cat)}")
`,
  },
  {
    id: "py6-init", group: "面向对象", icon: "🏗️", title: "__init__ 构造方法",
    content: `## 🏗️ __init__ 构造方法

上一节我们先创建空对象，再一个个添加属性，这样很麻烦。\`__init__\` 方法（构造方法）让我们在创建对象时就**自动初始化**属性！

### 什么是 __init__？

\`__init__\` 是一个特殊方法（前后双下划线叫"魔术方法"），它在创建对象时**自动调用**，用来初始化对象的属性。

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name   # 创建name属性，赋值为传入的name参数
        self.age = age     # 创建age属性
\`\`\`

创建对象时传入参数：
\`\`\`python
dog = Dog("旺财", 3)  # 自动调用 __init__(self, "旺财", 3)
print(dog.name)  # "旺财"
\`\`\`

### self 是什么？

- \`self\` 代表**当前正在创建的对象本身**
- 调用方法时，Python 自动把对象传给 self，你不用手动传
- \`self.name = name\` 的意思：给这个对象绑定一个 name 属性，值是参数 name
- self 不是关键字，但**约定俗成**叫 self（必须作为第一个参数）

### __init__ 可以做什么？

- 设置属性初始值
- 做一些初始化工作（打开文件、连接数据库等）
- 参数校验（确保传入的数据合法）

### 注意事项

1. \`__init__\` 不能有 \`return\` 返回值（除了 None）
2. 第一个参数必须是 self
3. 不是必须写 __init__，如果不需要初始化属性可以不写
4. 如果写了带参数的 __init__，创建对象时必须传入对应参数

### 默认参数值

和普通函数一样，__init__ 也可以有默认值：

\`\`\`python
def __init__(self, name, age=1, breed="土狗"):
    self.name = name
    self.age = age
    self.breed = breed
\`\`\`
`,
    code: `# ========== __init__ 构造方法 ==========

print("=" * 60)
print("🏗️ __init__ 构造方法")
print("=" * 60)

# 1. 基本 __init__ 用法
print("\\n=== 基本用法：创建对象时初始化属性 ===")

class Dog:
    def __init__(self, name, age, breed):
        # self 代表当前对象，给对象绑定属性
        self.name = name
        self.age = age
        self.breed = breed
        print(f"  __init__ 被调用了，创建了一只叫{name}的{breed}")

    def bark(self):
        print(f"  {self.name}: 汪汪！")

    def info(self):
        print(f"  名字:{self.name}, 年龄:{self.age}岁, 品种:{self.breed}")

# 创建对象时，参数自动传给 __init__
dog1 = Dog("旺财", 3, "柴犬")
dog2 = Dog("小黑", 2, "拉布拉多")

dog1.info()
dog2.info()
dog1.bark()
dog2.bark()

# 2. __init__ 带默认参数
print("\\n=== __init__ 带默认参数 ===")

class Cat:
    def __init__(self, name, age=1, color="白色"):
        self.name = name
        self.age = age
        self.color = color

    def meow(self):
        print(f"  {self.name}: 喵~ (我是{self.color}的猫)")

# 不同方式创建
c1 = Cat("咪咪")                    # age和color用默认值
c2 = Cat("橘子", 3)                # color用默认值
c3 = Cat(" Coal", 5, "黑色")       # 全部指定

c1.meow()
print(f"  {c1.name}: {c1.age}岁, {c1.color}")
print(f"  {c2.name}: {c2.age}岁, {c2.color}")
print(f"  {c3.name}: {c3.age}岁, {c3.color}")

# 3. __init__ 中做参数校验
print("\\n=== __init__ 中做参数校验 ===")

class Student:
    def __init__(self, name, age, score):
        # 校验参数合法性
        if not isinstance(name, str) or len(name.strip()) == 0:
            raise ValueError("名字必须是非空字符串")
        if not (0 <= age <= 150):
            raise ValueError(f"年龄不合法: {age}")
        if not (0 <= score <= 100):
            raise ValueError(f"分数必须在0-100之间: {score}")
        self.name = name
        self.age = age
        self.score = score

    def grade(self):
        if self.score >= 90: return "优秀"
        elif self.score >= 80: return "良好"
        elif self.score >= 60: return "及格"
        else: return "不及格"

s1 = Student("小明", 18, 92)
print(f"  {s1.name} 成绩等级: {s1.grade()}")
s2 = Student("小红", 17, 55)
print(f"  {s2.name} 成绩等级: {s2.grade()}")

# 4. 更生动的例子：银行账户
print("\\n=== 实例：银行账户类 ===")

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        print(f"  👋 {owner}开户成功！初始余额: {balance}元")

    def deposit(self, amount):
        if amount <= 0:
            print("  ❌ 存款金额必须大于0")
            return
        self.balance += amount
        print(f"  💰 存入{amount}元，余额: {self.balance}元")

    def withdraw(self, amount):
        if amount <= 0:
            print("  ❌ 取款金额必须大于0")
            return
        if amount > self.balance:
            print(f"  ❌ 余额不足！当前余额: {self.balance}元")
            return
        self.balance -= amount
        print(f"  💸 取出{amount}元，余额: {self.balance}元")

    def show(self):
        print(f"  👤 {self.owner} 的账户余额: {self.balance}元")

acc = BankAccount("张三", 1000)
acc.deposit(500)
acc.withdraw(200)
acc.withdraw(2000)
acc.show()

acc2 = BankAccount("李四")
acc2.show()

# 5. __init__ 执行过程图解
print("\\n=== __init__ 执行流程 ===")
print("  当执行 dog = Dog('旺财', 3, '柴犬') 时：")
print("  1. Python 在内存中创建一个空的 Dog 对象")
print("  2. 自动调用 __init__ 方法，把空对象传给 self")
print("  3. __init__ 给 self 添加 name/age/breed 属性")
print("  4. 返回填充好属性的对象，赋值给 dog 变量")
`,
  },
  {
    id: "py6-instance-class-attr", group: "面向对象", icon: "📌", title: "实例属性与类属性",
    content: `## 📌 实例属性 vs 类属性

Python 类中有两种属性：
- **实例属性**：属于每个对象自己，互不影响
- **类属性**：属于整个类，所有对象共享同一份

### 类属性

类属性直接定义在类里面（方法外面），所有实例共享：

\`\`\`python
class Dog:
    species = "犬科动物"   # 类属性：所有狗都是犬科

    def __init__(self, name):
        self.name = name  # 实例属性：每只狗名字不同
\`\`\`

### 访问方式

- 类属性：\`类名.属性名\` 或 \`对象.属性名\`
- 实例属性：\`对象.属性名\`

### 关键区别

| | 实例属性 | 类属性 |
|---|---------|--------|
| 定义位置 | \`__init__\` 里 self.xxx | 类里方法外直接写 |
| 归属 | 每个对象各一份 | 全类共享一份 |
| 修改 | 对象.属性 = xxx | 类名.属性 = xxx |
| 用途 | 对象特有的数据 | 所有对象共有的数据 |

### 注意！通过对象修改类属性的陷阱

\`\`\`python
dog1 = Dog("旺财")
dog1.species = "猫科"  # ❌ 这不会修改类属性！
# 而是给 dog1 新增了一个同名实例属性，遮住了类属性
\`\`\`

要修改类属性，必须通过类名：\`Dog.species = "xxx"\`

### 适用场景

- **类属性**：常量、计数器、所有对象共享的配置
- **实例属性**：对象的名字、年龄、状态等个体特征
`,
    code: `# ========== 实例属性与类属性 ==========

print("=" * 60)
print("📌 实例属性 vs 类属性")
print("=" * 60)

# 1. 基本概念
print("\\n=== 类属性：所有对象共享 ===")

class Dog:
    species = "犬科动物"      # 类属性
    legs = 4                 # 类属性：狗都有4条腿
    count = 0                # 类属性：用来计数创建了多少只狗

    def __init__(self, name, age):
        self.name = name      # 实例属性
        self.age = age        # 实例属性
        Dog.count += 1        # 通过类名修改类属性，计数器+1

    def info(self):
        print(f"  {self.name}: {self.age}岁, {self.species}, {self.legs}条腿")

# 访问类属性
print(f"  Dog.species = {Dog.species}")
print(f"  Dog.legs = {Dog.legs}")
print(f"  初始狗的数量: {Dog.count}")

# 创建对象
d1 = Dog("旺财", 3)
d2 = Dog("小黑", 2)
d3 = Dog("小白", 1)

print(f"  创建了3只狗后，Dog.count = {Dog.count}")

# 通过对象也能访问类属性
print(f"\\n  通过对象访问类属性:")
print(f"  d1.species = {d1.species}")
print(f"  d2.species = {d2.species}")
print(f"  d3.species = {d3.species}")

d1.info()
d2.info()
d3.info()

# 2. 陷阱：通过对象赋值类属性不会修改类属性
print("\\n=== ⚠️ 陷阱：对象.类属性 = xxx 会创建实例属性 ===")

d1.species = "猫科动物（假装）"   # 这给 d1 新增了实例属性！
print(f"  执行 d1.species = '猫科动物（假装）' 后:")
print(f"  d1.species = {d1.species}     (实例属性，遮住了类属性)")
print(f"  d2.species = {d2.species}     (还是类属性，没被影响)")
print(f"  Dog.species = {Dog.species}   (类属性也没被修改)")

# 真正修改类属性要用类名
Dog.species = "犬科-狼种"
print(f"\\n  执行 Dog.species = '犬科-狼种' 后:")
print(f"  d2.species = {d2.species}")
print(f"  d3.species = {d3.species}")
print(f"  d1.species = {d1.species} (d1有自己的同名实例属性，还是旧值)")

# 删除实例属性后又能看到类属性
del d1.species
print(f"\\n  删除 d1 的 species 实例属性后:")
print(f"  d1.species = {d1.species} (现在访问的是类属性)")

# 3. 实例：用类属性做计数器
print("\\n=== 应用：类属性作为计数器 ===")

class Student:
    total = 0      # 学生总数
    school = "Python大学"  # 学校名称（所有学生共享）

    def __init__(self, name, major):
        self.name = name
        self.major = major
        self.id = Student.total + 1001  # 自动生成学号
        Student.total += 1

    def info(self):
        print(f"  学号:{self.id} 姓名:{self.name} 专业:{self.major} 学校:{self.school}")

s1 = Student("小明", "计算机")
s2 = Student("小红", "数学")
s3 = Student("小刚", "物理")

print(f"  学生总数: {Student.total}")
s1.info()
s2.info()
s3.info()

# 修改学校名称（类属性）影响所有学生
Student.school = "AI大学"
print(f"\\n  学校改名后:")
s1.info()
s2.info()

# 4. __dict__ 看属性归属
print("\\n=== 用 __dict__ 查看属性归属 ===")
print(f"  Dog 类的属性(部分): { {k:v for k,v in Dog.__dict__.items() if not k.startswith('_')} }")
print(f"  d1 对象的属性: {d1.__dict__}")
print(f"  d2 对象的属性: {d2.__dict__}")

# 5. 总结对比
print("\\n=== 总结对比 ===")
print("  类属性:")
print("    ✅ 定义在类内部、方法外部")
print("    ✅ 所有实例共享一份")
print("    ✅ 通过 类名.属性 修改")
print("    ✅ 适合：常量、计数器、共享配置")
print()
print("  实例属性:")
print("    ✅ 定义在 __init__ 中 self.属性 = xxx")
print("    ✅ 每个实例独立一份")
print("    ✅ 通过 对象.属性 修改")
print("    ✅ 适合：对象独有的特征数据")
`,
  },
  {
    id: "py6-methods", group: "面向对象", icon: "🔧", title: "实例方法/类方法/静态方法",
    content: `## 🔧 三种方法类型

Python 类中有三种方法：实例方法、类方法、静态方法。

### 1. 实例方法（最常用）

- 第一个参数是 \`self\`，代表实例对象
- 可以访问/修改实例属性和类属性
- 通过**对象**调用
- 定义时不加装饰器

\`\`\`python
class MyClass:
    def instance_method(self, x):
        print(self, x)
\`\`\`

### 2. 类方法（@classmethod）

- 用 \`@classmethod\` 装饰
- 第一个参数是 \`cls\`（代表类本身，不是self）
- 只能访问类属性，不能访问实例属性
- 可以通过**类名**或**对象**调用
- 常用于：工厂方法、修改类属性

\`\`\`python
class MyClass:
    count = 0
    @classmethod
    def class_method(cls, x):
        print(cls, x)
        cls.count += 1
\`\`\`

### 3. 静态方法（@staticmethod）

- 用 \`@staticmethod\` 装饰
- **不需要** self 或 cls 参数，就像普通函数
- 不能访问类属性也不能访问实例属性
- 可以通过类名或对象调用
- 适合：和类相关但不需要访问类/实例数据的工具函数

\`\`\`python
class MyClass:
    @staticmethod
    def static_method(x, y):
        print(x + y)
\`\`\`

### 三种方法对比

| | 实例方法 | 类方法 | 静态方法 |
|---|---------|--------|---------|
| 装饰器 | 无 | @classmethod | @staticmethod |
| 第一个参数 | self | cls | 无 |
| 访问实例属性 | ✅ | ❌ | ❌ |
| 访问类属性 | ✅ | ✅ | ❌ |
| 调用方式 | 对象.方法() | 类.方法()/对象.方法() | 类.方法()/对象.方法() |
| 典型用途 | 对象的行为 | 工厂方法、类级操作 | 工具函数 |

### 什么是工厂方法？

类方法常用于提供**多种创建对象的方式**：

\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):  # 从字符串创建
        y, m, d = map(int, s.split('-'))
        return cls(y, m, d)
\`\`\`
`,
    code: `# ========== 实例方法/类方法/静态方法 ==========

print("=" * 60)
print("🔧 三种方法类型对比")
print("=" * 60)

# 1. 完整示例：三种方法
print("\\n=== 三种方法演示 ===")

class Calculator:
    # 类属性
    category = "数学工具"
    count = 0

    def __init__(self, name):
        self.name = name           # 实例属性
        Calculator.count += 1

    # ---- 实例方法 ----
    def add(self, a, b):
        """实例方法：第一个参数self，可以访问实例和类属性"""
        print(f"  [{self.name}] 实例方法 add({a}, {b}) = {a + b}")
        return a + b

    def introduce(self):
        print(f"  我是 {self.name}，属于 {self.category}")

    # ---- 类方法 ----
    @classmethod
    def get_count(cls):
        """类方法：第一个参数cls（类本身），只能访问类属性"""
        print(f"  类方法：当前共有 {cls.count} 个计算器")
        return cls.count

    @classmethod
    def create_default(cls):
        """类方法作为工厂方法：创建默认计算器"""
        print(f"  类方法：使用工厂方法创建默认计算器")
        return cls("默认计算器")

    # ---- 静态方法 ----
    @staticmethod
    def is_positive(n):
        """静态方法：不需要self/cls，和普通函数一样"""
        return n > 0

    @staticmethod
    def info():
        """静态方法：工具性质，不需要访问任何类或实例数据"""
        print("  这是一个计算器类，支持加减乘除")

# 使用
calc1 = Calculator("科学计算器")
calc1.introduce()
calc1.add(3, 5)

calc2 = Calculator("普通计算器")
calc2.introduce()
calc2.add(10, 20)

# 类方法：通过类名调用
Calculator.get_count()
# 类方法也可以通过对象调用
calc1.get_count()

# 工厂方法创建对象
calc3 = Calculator.create_default()
calc3.introduce()
calc3.add(100, 200)

# 静态方法
print(f"\\n  静态方法 is_positive(5) = {Calculator.is_positive(5)}")
print(f"  静态方法 is_positive(-3) = {Calculator.is_positive(-3)}")
Calculator.info()
# 静态方法也可以通过对象调用
calc1.is_positive(10)

# 2. 类方法工厂方法实例：日期类
print("\\n=== 工厂方法实例：多种方式创建日期 ===")

class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    def __str__(self):
        return f"{self.year}年{self.month}月{self.day}日"

    @classmethod
    def from_string(cls, date_str):
        """从 '2024-06-15' 格式字符串创建"""
        parts = date_str.split('-')
        return cls(int(parts[0]), int(parts[1]), int(parts[2]))

    @classmethod
    def today(cls):
        """创建今天的日期"""
        import datetime
        t = datetime.date.today()
        return cls(t.year, t.month, t.day)

    @staticmethod
    def is_leap_year(year):
        """判断是否是闰年（静态方法，不需要实例/类数据）"""
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

# 不同方式创建Date对象
d1 = Date(2024, 6, 15)                # 普通创建
d2 = Date.from_string("2025-01-01")    # 用类方法从字符串创建
d3 = Date.today()                       # 用类方法创建今天

print(f"  d1 = {d1}")
print(f"  d2 = {d2}")
print(f"  d3(今天) = {d3}")

# 静态方法判断闰年
print(f"\\n  2024是闰年吗？{Date.is_leap_year(2024)}")
print(f"  2023是闰年吗？{Date.is_leap_year(2023)}")
print(f"  2000是闰年吗？{Date.is_leap_year(2000)}")
print(f"  1900是闰年吗？{Date.is_leap_year(1900)}")

# 3. 再看一个生动例子：学生类
print("\\n=== 学生类：三种方法综合 ===")

class Student:
    school = "Python学堂"
    total_students = 0

    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self.score = score
        Student.total_students += 1

    # 实例方法：对象的行为
    def study(self, hours):
        print(f"  {self.name} 学习了 {hours} 小时")
        self.score += hours // 2  # 学习越久分数越高
        if self.score > 100: self.score = 100

    def show(self):
        grade = "优秀" if self.score >= 90 else "良好" if self.score >= 70 else "及格" if self.score >= 60 else "不及格"
        print(f"  {self.name}: {self.age}岁, {self.score}分({grade}), 学校:{self.school}")

    # 类方法：类级别操作
    @classmethod
    def change_school(cls, new_name):
        print(f"  学校改名: {cls.school} → {new_name}")
        cls.school = new_name

    @classmethod
    def total(cls):
        print(f"  当前共有 {cls.total_students} 名学生")

    # 静态方法：工具函数
    @staticmethod
    def score_to_level(score):
        if score >= 90: return "A"
        elif score >= 80: return "B"
        elif score >= 70: return "C"
        elif score >= 60: return "D"
        else: return "F"

s1 = Student("小明", 18, 85)
s2 = Student("小红", 17, 92)
s3 = Student("小刚", 19, 55)

s1.show()
s2.show()
s3.show()

s1.study(10)
s1.show()

Student.total()
Student.change_school("AI学院")
s1.show()

print(f"\\n  分数等级（静态方法）:")
print(f"    85分 → {Student.score_to_level(85)}")
print(f"    95分 → {Student.score_to_level(95)}")
print(f"    55分 → {Student.score_to_level(55)}")
`,
  },
  {
    id: "py6-self", group: "面向对象", icon: "🤔", title: "self 的含义与原理",
    content: `## 🤔 self 的含义与原理

很多初学者都会困惑：self 到底是什么？为什么每个方法第一个参数都是它？

### self 的本质

\`self\` 就是**调用方法的那个对象本身**，没有任何神秘之处！

当你调用 \`dog.bark()\` 时，Python 自动做了一件事：
\`\`\`python
# 你写的
dog.bark()
# Python 实际执行的是
Dog.bark(dog)  # 自动把 dog 作为第一个参数传入！
\`\`\`

### 为什么叫 self？

self 不是 Python 关键字，只是一个**约定俗成的名字**。你可以叫 this、obj、me，都能运行，但强烈建议用 self！

### 类比理解

想象 self 是"我"：
- 当你说"我叫旺财"，"我"就是 self
- 每只狗说"我的名字"，"我"指的都是自己
- dog1 说 self，指的是 dog1；dog2 说 self，指的是 dog2

### self 做了什么？

1. **区分是谁在调用方法**：self 让方法知道是哪个对象在调用
2. **访问自己的属性**：\`self.name\` 访问的是当前对象的 name
3. **调用自己的其他方法**：\`self.method()\`

### 常见疑问

**Q：为什么创建对象时不用传 self？**
A：Python 自动帮你传了，你写 \`Dog("旺财")\`，Python 自动创建空对象并传给 self。

**Q：为什么方法定义要写 self，但调用时不用传？**
A：因为 Python 自动传了，这就是"绑定方法"的机制。

**Q：self 必须叫 self 吗？**
A：技术上不必，但所有 Python 程序员都用 self，不用会被认为代码不规范。

**Q：可以用 self 修改对象吗？**
A：当然！\`self.name = "xxx"\` 就是给当前对象添加/修改属性。

### self 的本质：绑定方法

当你通过对象访问方法时，你得到的不是原始函数，而是"绑定方法对象"——它已经把对象绑定到第一个参数了。
`,
    code: `# ========== self 的含义与原理 ==========

print("=" * 60)
print("🤔 self 的含义与原理")
print("=" * 60)

# 1. self 就是对象自己
print("\\n=== self 就是调用方法的对象本身 ===")

class Person:
    def __init__(self, name):
        self.name = name
        print(f"  __init__ 中的 self 是: {self}")
        print(f"  self.name = {self.name}")

    def say_hello(self):
        print(f"  你好，我是 {self.name}")
        print(f"  say_hello 中的 self 是: {self}")
        print(f"  self 的名字是: {self.name}")

p1 = Person("小明")
print(f"  p1 对象是: {p1}")
print(f"  p1.name = {p1.name}")
print()

p1.say_hello()
print()
print("  观察：__init__和say_hello中的self 和 p1 是同一个对象！")
print(f"  self is p1? ", end="")
# 在方法内部验证self就是p1
class Check:
    def check_self(self, other):
        return self is other
c = Check()
print(c.check_self(c))  # True

p2 = Person("小红")
print(f"\\n  p2 对象是: {p2}")
p2.say_hello()

# 2. 证明：对象.方法() 等价于 类.方法(对象)
print("\\n=== 原理：对象.方法() 实际是 类.方法(对象) ===")

class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(f"  {self.name}: 汪汪！")

dog = Dog("旺财")

print("  方式1（常规）: dog.bark()")
dog.bark()

print("  方式2（本质）: Dog.bark(dog)")
Dog.bark(dog)  # 手动把 dog 作为 self 传入，效果完全一样！

print("\\n  这两种写法完全等价！self 就是这么传进来的。")

# 3. self 让每个对象有自己的状态
print("\\n=== self 让每个对象独立拥有自己的数据 ===")

class Counter:
    def __init__(self, start=0):
        self.count = start  # self.count 是每个对象自己的

    def increment(self):
        self.count += 1
        print(f"  计数: {self.count}")

c1 = Counter(0)
c2 = Counter(100)

print("  c1 从0开始，c2 从100开始：")
c1.increment()
c1.increment()
c2.increment()
c1.increment()
c2.increment()
print(f"  c1.count = {c1.count}（自己的count）")
print(f"  c2.count = {c2.count}（自己的count）")
print("  两个计数器互不干扰，因为self.count指的是各自的属性！")

# 4. self 调用其他方法
print("\\n=== self 调用自己的其他方法 ===")

class Robot:
    def __init__(self, name):
        self.name = name
        self.battery = 100

    def _check_battery(self):
        """私有方法：检查电量"""
        return self.battery > 0

    def move(self):
        if self._check_battery():  # 用self调用自己的其他方法
            self.battery -= 10
            print(f"  {self.name} 向前移动，剩余电量: {self.battery}%")
        else:
            print(f"  {self.name} 电量不足，无法移动")

    def charge(self):
        self.battery = 100
        print(f"  {self.name} 充电完成，电量: {self.battery}%")

robot = Robot("R2D2")
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()
robot.move()  # 第11次，电量应该不够了
robot.charge()
robot.move()

# 5. 不使用self的后果
print("\\n=== 如果不写self会怎样？===")
print("""
class BadExample:
    def __init__(name):  # ❌ 第一个参数不是self！
        self.name = name  # ❌ self未定义，报错！

    def hello():  # ❌ 没有self参数
        print("hello")

b = BadExample("test")  # 会报错：__init__() takes 1 positional argument but 2 were given
# 因为Python自动把对象传入，而方法只接受1个参数
""")

print("  错误信息通常是:")
print("  TypeError: method() takes 0 positional arguments but 1 was given")
print("  这说明你忘了写 self 参数！")

# 6. self 命名不是必须的（但强烈建议用self）
print("\\n=== self 只是约定，不是关键字（不建议改名字）===")
class Weird:
    def __init__(this, name):  # 用this也可以，但不规范
        this.name = name
    def say(me):               # 用me也可以，但不规范
        print(f"  我叫 {me.name}")

w = Weird("奇怪的命名")
w.say()
print("  ⚠️ 虽然可以用其他名字，但请始终使用 self！这是Python的统一规范。")
`,
  },
  {
    id: "py6-inheritance", group: "面向对象", icon: "🧬", title: "继承",
    content: `## 🧬 继承（Inheritance）

继承是面向对象的重要特性：子类可以**复用**父类的属性和方法，还可以**扩展**自己的功能。

### 为什么需要继承？

想象我们要定义 Dog、Cat、Bird 类，它们都有 name、age 属性，都有 eat()、sleep() 方法。如果每个类都写一遍，代码就重复了。

继承解决这个问题：
1. 先定义一个通用的 \`Animal\` 父类（基类）
2. Dog、Cat 作为子类（派生类）继承 Animal
3. 子类自动拥有父类的所有属性和方法
4. 子类可以添加自己特有的方法，或重写父类方法

### 基本语法

\`\`\`python
class Animal:          # 父类
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f"{self.name}发出声音")

class Dog(Animal):     # 子类继承Animal
    def speak(self):   # 重写父类方法
        print(f"{self.name}: 汪汪！")
\`\`\`

### super() 调用父类方法

在子类中用 \`super()\` 调用父类的方法，特别是 \`__init__\`：

\`\`\`python
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类的__init__
        self.breed = breed       # 子类自己的属性
\`\`\`

### 方法重写（Override）

子类定义和父类**同名方法**，调用时会用子类的版本，这就是方法重写。

### isinstance 和 issubclass

- \`isinstance(obj, Class)\`：对象是否是某类（或其子类）的实例
- \`issubclass(Child, Parent)\`：类是否是另一个类的子类

### 继承的好处

- **代码复用**：公共代码写在父类，不用重复写
- **层次清晰**：分类关系明确
- **易于扩展**：添加新类型只需继承并添加/重写方法
`,
    code: `# ========== 继承 ==========

print("=" * 60)
print("🧬 继承")
print("=" * 60)

# 1. 基础继承
print("\\n=== 基础继承：Animal -> Dog/Cat ===")

class Animal:
    """父类：动物"""
    def __init__(self, name, age):
        self.name = name
        self.age = age
        print(f"  Animal.__init__: 创建了 {name}")

    def speak(self):
        print(f"  {self.name} 发出了声音")

    def eat(self, food):
        print(f"  {self.name} 正在吃 {food}")

    def sleep(self):
        print(f"  {self.name} 睡觉了 zzz")

    def info(self):
        print(f"  我是{self.name}，今年{self.age}岁")


class Dog(Animal):
    """子类：狗，继承Animal"""
    def __init__(self, name, age, breed):
        # 调用父类的__init__，初始化继承来的属性
        super().__init__(name, age)
        self.breed = breed  # 狗自己的属性：品种
        print(f"  Dog.__init__: 这是一只{breed}")

    # 方法重写：狗叫的方式不同
    def speak(self):
        print(f"  {self.name}: 汪汪汪！我是{self.breed}！")

    # 狗自己的方法
    def fetch(self):
        print(f"  {self.name} 去捡球了！🎾")


class Cat(Animal):
    """子类：猫，继承Animal"""
    def __init__(self, name, age, color):
        super().__init__(name, age)
        self.color = color

    def speak(self):
        print(f"  {self.name}: 喵~ （我是{self.color}的猫，别理我）")

    def climb(self):
        print(f"  {self.name} 爬上了树！🌳")


# 创建对象
dog = Dog("旺财", 3, "柴犬")
cat = Cat("咪咪", 2, "橘色")

print("\\n--- Dog对象使用继承来的方法 ---")
dog.info()       # 继承自Animal的方法
dog.eat("骨头")  # 继承自Animal
dog.sleep()      # 继承自Animal
dog.speak()      # 重写过的方法
dog.fetch()      # Dog自己的方法

print("\\n--- Cat对象 ---")
cat.info()
cat.eat("鱼")
cat.sleep()
cat.speak()      # 重写过的方法
cat.climb()      # Cat自己的方法

# 2. 多层次继承
print("\\n=== 多层次继承 ===")

class Shape:
    """形状基类"""
    def __init__(self, name):
        self.name = name
    def area(self):
        pass
    def describe(self):
        print(f"  这是一个{self.name}，面积是 {self.area():.2f}")

class Rectangle(Shape):
    """矩形"""
    def __init__(self, width, height):
        super().__init__("矩形")
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

class Square(Rectangle):
    """正方形（特殊的矩形）"""
    def __init__(self, side):
        super().__init__(side, side)
        self.name = "正方形"

class Circle(Shape):
    """圆形"""
    def __init__(self, radius):
        super().__init__("圆形")
        self.radius = radius
    def area(self):
        import math
        return math.pi * self.radius ** 2

shapes = [
    Rectangle(5, 3),
    Square(4),
    Circle(3),
]
for s in shapes:
    s.describe()

# 3. super() 的用法
print("\\n=== super() 调用父类方法 ===")

class Vehicle:
    def __init__(self, brand, speed):
        self.brand = brand
        self.speed = speed
        print(f"  Vehicle初始化: {brand}")

    def start(self):
        print(f"  {self.brand} 启动了，速度: {self.speed}km/h")

    def stop(self):
        print(f"  {self.brand} 停车了")

class Car(Vehicle):
    def __init__(self, brand, speed, doors):
        super().__init__(brand, speed)  # 必须先调用父类初始化
        self.doors = doors
        print(f"  Car初始化: {doors}个车门")

    def start(self):
        super().start()  # 先调用父类的start
        print(f"  系好安全带！车门锁好！({self.doors}个门)")

    def honk(self):
        print(f"  {self.brand} 按喇叭：嘀嘀！")

car = Car("比亚迪", 120, 4)
car.start()
car.honk()
car.stop()

# 4. isinstance 和 issubclass
print("\\n=== 类型检查 ===")
print(f"  isinstance(dog, Dog) = {isinstance(dog, Dog)}")
print(f"  isinstance(dog, Animal) = {isinstance(dog, Animal)}")  # 狗也是动物！
print(f"  isinstance(dog, Cat) = {isinstance(dog, Cat)}")
print(f"  isinstance(cat, Animal) = {isinstance(cat, Animal)}")
print(f"  issubclass(Dog, Animal) = {issubclass(Dog, Animal)}")
print(f"  issubclass(Cat, Animal) = {issubclass(Cat, Animal)}")
print(f"  issubclass(Square, Rectangle) = {issubclass(Square, Rectangle)}")
print(f"  issubclass(Square, Shape) = {issubclass(Square, Shape)}")
print(f"  issubclass(Dog, Cat) = {issubclass(Dog, Cat)}")

# 5. 方法重写的好处
print("\\n=== 方法重写：同一方法，不同行为 ===")
animals = [
    Dog("大黄", 4, "金毛"),
    Cat("花花", 1, "三花"),
    Dog("小黑", 2, "拉布拉多"),
]
print("  让所有动物说话：")
for a in animals:
    a.speak()  # 同样的speak()调用，不同子类有不同表现！

print("\\n  💡 这就是'多态'的基础——同样的接口，不同的实现")
`,
  },
  {
    id: "py6-multiple-inheritance", group: "面向对象", icon: "🔀", title: "多继承与MRO",
    content: `## 🔀 多继承与 MRO

Python 支持**多继承**——一个类可以同时继承多个父类。这很强大，但也容易引发问题。

### 多继承语法

\`\`\`python
class A:
    def method_a(self): print("A")

class B:
    def method_b(self): print("B")

class C(A, B):  # 同时继承A和B
    pass
\`\`\`

C 同时拥有 A 和 B 的方法。

### 钻石继承问题（Diamond Problem）

当继承关系形成菱形时，方法调用会有歧义：

\`\`\`
    A
   / \\
  B   C
   \\ /
    D
\`\`\`

D 同时继承 B 和 C，B 和 C 都继承 A。如果 A 有个方法，B 和 C 都重写了，D 该用哪个？

### MRO（方法解析顺序）

Python 通过 **MRO（Method Resolution Order）** 解决这个问题，使用 **C3线性化算法**。

可以用 \`类名.__mro__\` 或 \`类名.mro()\` 查看顺序：

\`\`\`python
print(D.__mro__)
# 顺序决定了当调用方法时，Python按什么顺序查找
\`\`\`

### super() 在多继承中的作用

在多继承中，\`super()\` 不是简单调用父类，而是按照 **MRO 顺序**调用下一个类。

### 多继承使用建议

- 优先使用**单继承**，多继承只在确有必要时使用
- 如果要用多继承，考虑用 **MixIn**（混入类）模式
- MixIn 类通常很小，只提供特定功能，不独立使用
- 避免复杂的菱形继承结构
- 很多设计模式（组合）可以替代多继承
`,
    code: `# ========== 多继承与 MRO ==========

print("=" * 60)
print("🔀 多继承与 MRO")
print("=" * 60)

# 1. 简单多继承
print("\\n=== 简单多继承：一个类继承多个父类 ===")

class Flyable:
    """会飞的"""
    def fly(self):
        print(f"  {self.name} 正在天空飞翔！🕊️")

    def land(self):
        print(f"  {self.name} 降落了")

class Swimmable:
    """会游泳的"""
    def swim(self):
        print(f"  {self.name} 在水中游泳！🏊")

    def dive(self):
        print(f"  {self.name} 潜入水中")

class Animal:
    def __init__(self, name):
        self.name = name
    def eat(self):
        print(f"  {self.name} 在吃东西")

# 鸭子：既是动物，又会飞又会游泳
class Duck(Animal, Flyable, Swimmable):
    def quack(self):
        print(f"  {self.name}: 嘎嘎嘎！")

duck = Duck("唐老鸭")
duck.eat()
duck.fly()
duck.swim()
duck.quack()
duck.land()
duck.dive()

# 2. MRO 查看方法解析顺序
print("\\n=== MRO（方法解析顺序）===")
print("  Duck 的 MRO 顺序:")
for i, cls in enumerate(Duck.__mro__):
    print(f"    {i}. {cls.__name__}")
print()
print("  Python 按照这个顺序查找方法/属性")
print("  比如调用 duck.fly()，按顺序查找谁有fly方法")

# 3. 钻石继承问题演示
print("\\n=== 钻石继承问题 ===")

class A:
    def greet(self):
        print("  A.greet()")

class B(A):
    def greet(self):
        print("  B.greet() -> ", end="")
        super().greet()

class C(A):
    def greet(self):
        print("  C.greet() -> ", end="")
        super().greet()

class D(B, C):
    def greet(self):
        print("  D.greet() -> ", end="")
        super().greet()

print("  继承关系: D(B,C) -> B(A), C(A)")
print(f"  D 的 MRO: {[c.__name__ for c in D.__mro__]}")
print()
d = D()
print("  调用 d.greet():")
d.greet()
print()
print("  注意：B.greet()里的super()调用的不是A，而是C！")
print("  因为super()是按MRO顺序找下一个类，不是直接找父类")

# 4. MixIn 模式（推荐的多继承用法）
print("\\n=== MixIn 模式（混入类）===")

class SerializableMixIn:
    """混入类：提供序列化功能"""
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

    def to_string(self):
        items = [f"{k}={v}" for k, v in self.to_dict().items()]
        return f"{self.__class__.__name__}({', '.join(items)})"

class LoggableMixIn:
    """混入类：提供日志功能"""
    def log(self, message):
        print(f"  [LOG][{self.__class__.__name__}] {message}")

class User(SerializableMixIn, LoggableMixIn):
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.log(f"创建用户: {name}")

    def change_email(self, new_email):
        old = self.email
        self.email = new_email
        self.log(f"邮箱变更: {old} -> {new_email}")

class Product(SerializableMixIn, LoggableMixIn):
    def __init__(self, name, price):
        self.name = name
        self.price = price
        self.log(f"添加商品: {name} ¥{price}")

user = User("小明", "xiaoming@example.com")
user.change_email("ming@example.com")
print(f"  用户序列化: {user.to_string()}")
print(f"  用户字典: {user.to_dict()}")

product = Product("Python教程", 99)
print(f"  商品序列化: {product.to_string()}")

# 5. 多继承的潜在问题
print("\\n=== 多继承注意事项 ===")
print("  ✅ 推荐用法：")
print("    - MixIn 模式（功能混入）")
print("    - 混入类短小、单一职责")
print("    - 混入类不独立实例化")
print()
print("  ❌ 避免：")
print("    - 复杂的菱形继承")
print("    - 多个父类有同名方法（易混淆）")
print("    - 过度使用多继承（考虑组合替代）")

# 6. 查看MRO
print("\\n=== MRO 查看方法 ===")
print("  类名.__mro__  → 返回元组")
print("  类名.mro()    → 返回列表")
print(f"  User MRO: {[c.__name__ for c in User.mro()]}")
`,
  },
  {
    id: "py6-polymorphism", group: "面向对象", icon: "🎭", title: "多态",
    content: `## 🎭 多态（Polymorphism）

多态的意思是"多种形态"——**同一个接口，不同的实现**。

### 什么是多态？

在面向对象中，多态指的是：不同类的对象可以响应**同一个方法调用**，但表现出**不同的行为**。

举个例子：
- 你对动物说"叫一声"
- 狗：汪汪！
- 猫：喵~
- 鸟：叽叽喳喳！
- 同样的"叫"指令，不同动物有不同反应——这就是多态

### Python 的多态：鸭子类型

Python 是动态类型语言，它的多态和 Java/C++ 不同：
- **不需要继承**同一个父类
- **不需要接口**声明
- 只要对象**有这个方法**，就能调用

这就是"鸭子类型"（Duck Typing）：
> "如果一只鸟走起来像鸭子、游泳像鸭子、叫起来像鸭子，那它就是鸭子。"

### 多态的好处

1. **代码更灵活**：不关心对象是什么类型，只关心它有没有这个方法
2. **可扩展性强**：加新类不影响已有代码
3. **统一接口**：用相同方式调用不同对象的方法

### 运算符多态

Python 的运算符本身就是多态的：
- \`+\`：数字相加、字符串拼接、列表合并
- \`*\`：数字相乘、字符串重复、列表重复
- \`len()\`：字符串、列表、元组、字典都能用

### 多态 vs 方法重写

- 方法重写是多态的一种实现方式（继承体系中）
- Python 的鸭子类型是更宽松的多态（不需要继承）
`,
    code: `# ========== 多态 ==========

print("=" * 60)
print("🎭 多态")
print("=" * 60)

# 1. 经典多态：继承体系中
print("\\n=== 经典多态：同一方法，不同实现 ===")

class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        pass  # 基类不实现，子类各自实现

class Dog(Animal):
    def speak(self):
        return f"{self.name}: 汪汪汪！"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: 喵~"

class Cow(Animal):
    def speak(self):
        return f"{self.name}: 哞~~~"

class Duck(Animal):
    def speak(self):
        return f"{self.name}: 嘎嘎嘎！"

# 多态：统一接口 speak()
def make_speak(animal):
    """让动物说话——不管是什么动物，只要有speak方法就行"""
    print(f"  {animal.speak()}")

animals = [
    Dog("旺财"),
    Cat("咪咪"),
    Cow("哞哞"),
    Duck("唐老鸭"),
]

print("  让所有动物说话：")
for a in animals:
    make_speak(a)

# 2. 鸭子类型：不需要继承
print("\\n=== 鸭子类型：不需要继承同一个父类 ===")

class Car:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name}: 嘀嘀！"

class Phone:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name}: 叮铃铃~"

# Car和Phone都不是Animal，但它们有speak方法，多态照样工作！
things = [
    Dog("小黑"),
    Car("比亚迪"),
    Cat("花花"),
    Phone("iPhone"),
    Duck("唐纳德"),
]
print("  只要有speak()方法就能调用（鸭子类型）:")
for t in things:
    print(f"  {t.speak()} (类型: {type(t).__name__})")

# 3. 运算符多态
print("\\n=== 运算符多态：同一个+运算符，不同行为 ===")

# + 对于数字是加法
print(f"  数字: 3 + 5 = {3 + 5}")
# + 对于字符串是拼接
print(f"  字符串: 'Hello' + ' World' = {'Hello' + ' World'}")
# + 对于列表是合并
print(f"  列表: [1,2] + [3,4] = {[1,2] + [3,4]}")

# * 运算符
print(f"  数字乘法: 3 * 5 = {3 * 5}")
print(f"  字符串重复: 'Ha' * 3 = {'Ha' * 3}")
print(f"  列表重复: [0] * 5 = {[0] * 5}")

# 4. len() 多态
print("\\n=== len() 函数多态 ===")
print(f"  len('hello') = {len('hello')}")
print(f"  len([1,2,3,4]) = {len([1,2,3,4])}")
print(f"  len((1,2,3)) = {len((1,2,3))}")
print(f"  len({{'a':1,'b':2}}) = {len({'a':1,'b':2})}")
print(f"  len({{1,2,3,4,5}}) = {len({1,2,3,4,5})}")

# 5. 实际应用：支付系统
print("\\n=== 应用实例：多态支付系统 ===")

class WeChatPay:
    def pay(self, amount):
        return f"使用微信支付 {amount} 元"

class AliPay:
    def pay(self, amount):
        return f"使用支付宝支付 {amount} 元"

class BankCardPay:
    def pay(self, amount):
        return f"使用银行卡支付 {amount} 元"

class ApplePay:
    def pay(self, amount):
        return f"使用Apple Pay支付 {amount} 元"

def checkout(payment_method, amount):
    """结账函数：不关心具体支付方式，只要有pay方法"""
    result = payment_method.pay(amount)
    print(f"  ✅ {result}")

# 可以任意替换支付方式
payments = [WeChatPay(), AliPay(), BankCardPay(), ApplePay()]
for method in payments:
    checkout(method, 99.9)

# 新增支付方式很容易，不需要修改checkout函数
class BitcoinPay:
    def pay(self, amount):
        return f"使用比特币支付 {amount} 元（波动较大）"

checkout(BitcoinPay(), 999)

# 6. print() 背后的多态：__str__
print("\\n=== 多态原理：__str__ 方法 ===")
print("  print(obj) 实际调用 str(obj)，str(obj) 调用 obj.__str__()")
print("  任何对象只要实现了 __str__，print 就能正确显示！")

print("\\n=== 总结 ===")
print("  多态的核心：不关心对象是什么类型，只关心它能做什么")
print("  Python通过鸭子类型实现最灵活的多态")
print("  好处：代码灵活、可扩展、松耦合")
`,
  },
  {
    id: "py6-encapsulation", group: "面向对象", icon: "🔒", title: "封装",
    content: `## 🔒 封装

封装是面向对象三大特性之一：把数据（属性）和操作数据的方法**捆绑在一起**，并对外部隐藏内部实现细节。

### 为什么需要封装？

1. **数据安全**：防止外部直接修改内部数据
2. **接口统一**：只暴露必要的方法，内部实现可以随便改
3. **降低复杂度**：使用者不需要知道内部细节

### Python 的访问控制

Python 没有真正的私有属性，通过**命名约定**实现：

| 命名 | 含义 | 访问级别 |
|------|------|---------|
| \`name\` | 普通属性 | 公有（public），外部可随意访问 |
| \`_name\` | 单下划线开头 | 保护（protected），约定外部不要直接访问 |
| \`__name\` | 双下划线开头 | 私有（private），名称改写，外部无法直接访问 |

### 公有属性（无下划线）

\`\`\`python
class Dog:
    def __init__(self, name):
        self.name = name  # 公有，外部可以直接读/写
\`\`\`

### 保护属性（单下划线 _）

- 只是**约定**：这是内部属性，外部不要直接访问
- 技术上还是能访问，只是告诉你"请不要碰"
- 常用于模块级函数（from module import * 不会导入_开头的）

### 私有属性（双下划线 __）

- Python 会**名称改写**（name mangling）：\`__name\` → \`_类名__name\`
- 外部直接访问 \`obj.__name\` 会报错
- 但其实还是能通过 \`obj._类名__name\` 访问，所以不是真正安全
- 主要用来**防止子类意外覆盖**父类的属性

### 推荐做法

Python 哲学：**"我们都是成年人"**
- 使用单下划线 \`_xxx\` 表示内部属性，提醒外部不要直接访问
- 通过 getter/setter 方法控制访问（见下一节 property）
- 真正需要防误操作时用双下划线 \`__xxx\`
`,
    code: `# ========== 封装 ==========

print("=" * 60)
print("🔒 封装")
print("=" * 60)

# 1. 公有属性（无下划线）
print("\\n=== 公有属性：外部可直接访问和修改 ===")

class Person:
    def __init__(self, name, age):
        self.name = name   # 公有
        self.age = age     # 公有

p = Person("小明", 18)
print(f"  直接读取: p.name = {p.name}, p.age = {p.age}")
p.age = 999  # 可以随意修改，甚至是不合理的值！
print(f"  随意修改后: p.age = {p.age}（可能导致数据不合理）")

# 2. 私有属性（双下划线 __）
print("\\n=== 私有属性（__开头）：名称改写 ===")

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance  # 私有属性
        self.__password = "123456"  # 密码也要私有

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            self.__log(f"存入{amount}")
        else:
            print("  存款金额必须大于0")

    def withdraw(self, amount, password):
        if password != self.__password:
            print("  ❌ 密码错误！")
            return
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            self.__log(f"取出{amount}")
        else:
            print("  ❌ 余额不足或金额非法")

    def get_balance(self, password):
        """需要密码才能查余额"""
        if password == self.__password:
            return self.__balance
        else:
            print("  ❌ 密码错误！")
            return None

    def __log(self, message):
        """私有方法：内部记录日志"""
        print(f"  [LOG] {self.owner}: {message}，余额{self.__balance}")

acc = BankAccount("张三", 1000)
# print(acc.__balance)  # ❌ 报错！AttributeError
acc.deposit(500)
acc.withdraw(200, "123456")
acc.withdraw(200, "wrong")
print(f"  余额(正确密码): {acc.get_balance('123456')}")
acc.get_balance("wrong")

# 双下划线的真相：名称改写
print("\\n  --- 私有属性的真相 ---")
print(f"  实际上，__balance 被改名为: _BankAccount__balance")
print(f"  强行访问: acc._BankAccount__balance = {acc._BankAccount__balance}")
print("  ⚠️ 这是Python的名称改写，不是真正的安全保护！")
print("  但至少防止了意外访问和子类覆盖")

# 3. 保护属性（单下划线 _）
print("\\n=== 保护属性（_开头）：约定，不强制 ===")

class Student:
    def __init__(self, name):
        self.name = name
        self._score = 0  # 保护属性：约定外部不要直接操作

    def set_score(self, score):
        """通过方法设置分数，可以做校验"""
        if 0 <= score <= 100:
            self._score = score
        else:
            print(f"  ❌ 分数{score}不合法，必须在0-100之间")

    def get_score(self):
        return self._score

s = Student("小明")
print(f"  初始分数: {s.get_score()}")
s.set_score(95)
print(f"  设置后: {s.get_score()}")
s.set_score(150)  # 不合法的分数被拦截了
print(f"  非法设置后: {s.get_score()}")

# 技术上还是能访问，但约定不要这么做
print(f"  技术上 s._score = {s._score}（能访问，但不推荐）")

# 4. 封装的好处
print("\\n=== 封装的好处 ===")

class Circle:
    def __init__(self, radius):
        self.__radius = radius

    def get_radius(self):
        return self.__radius

    def set_radius(self, r):
        if r > 0:
            self.__radius = r
        else:
            raise ValueError("半径必须大于0")

    def area(self):
        import math
        return math.pi * self.__radius ** 2

    def circumference(self):
        import math
        return 2 * math.pi * self.__radius

c = Circle(5)
print(f"  半径5的圆:")
print(f"    面积 = {c.area():.2f}")
print(f"    周长 = {c.circumference():.2f}")
c.set_radius(10)
print(f"  半径改为10后:")
print(f"    面积 = {c.area():.2f}")
print(f"    周长 = {c.circumference():.2f}")

# 5. 总结
print("\\n=== Python 封装总结 ===")
print("  xxx     公有属性：谁都能访问")
print("  _xxx    保护属性：约定外部不要访问（成年人约定）")
print("  __xxx   私有属性：名称改写，外部无法直接访问")
print()
print("  Python哲学：'我们都是成年人'")
print("  - 单下划线是提醒：'这是内部实现，请用公开接口'")
print("  - 双下划线主要防误操作和子类覆盖，不是安全机制")
print("  - 配合 property（下一节）实现优雅的属性访问控制")
`,
  },
  {
    id: "py6-property", group: "面向对象", icon: "🏠", title: "property 装饰器",
    content: `## 🏠 property 装饰器

前面我们学封装时写 getter/setter 方法，但调用 \`obj.get_score()\` 不如 \`obj.score\` 直观。\`@property\` 让你可以像访问属性一样调用方法！

### 为什么用 property？

- **对外像属性**：\`obj.score\` 比 \`obj.get_score()\` 更简洁
- **对内是方法**：可以做校验、计算、缓存等逻辑
- **向后兼容**：一开始直接用属性访问，后来需要加逻辑时不用改调用代码

### 三种装饰器

\`\`\`python
class Student:
    def __init__(self):
        self._score = 0

    @property                    # getter：读属性
    def score(self):
        return self._score

    @score.setter               # setter：写属性
    def score(self, value):
        if 0 <= value <= 100:
            self._score = value
        else:
            raise ValueError("分数必须0-100")

    @score.deleter              # deleter：删除属性
    def score(self):
        del self._score
\`\`\`

### 使用方式

\`\`\`python
s = Student()
s.score = 95       # 自动调用setter
print(s.score)     # 自动调用getter
del s.score        # 自动调用deleter
\`\`\`

### 只读属性

只写 @property 不写 @xxx.setter，这个属性就只能读不能改：

\`\`\`python
@property
def area(self):
    return math.pi * self.radius ** 2
\`\`\`

### 计算属性

属性值不是存储的，而是实时计算出来的：

\`\`\`python
@property
def full_name(self):
    return f"{self.first_name} {self.last_name}"
\`\`\`
`,
    code: `# ========== property 装饰器 ==========

print("=" * 60)
print("🏠 property 装饰器")
print("=" * 60)

# 1. 基本用法：getter
print("\\n=== @property 基本用法 ===")

class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """getter：读取半径"""
        return self._radius

    @property
    def area(self):
        """计算属性：面积是算出来的，不是存的"""
        import math
        return math.pi * self._radius ** 2

    @property
    def circumference(self):
        """计算属性：周长"""
        import math
        return 2 * math.pi * self._radius

c = Circle(5)
# 像访问属性一样调用方法！
print(f"  半径: {c.radius}")
print(f"  面积: {c.area:.2f}")
print(f"  周长: {c.circumference:.2f}")
# c.radius = 10  # ❌ 没有setter，不能修改！这是只读属性

# 2. getter + setter：可读可写
print("\\n=== getter + setter ===")

class Student:
    def __init__(self, name):
        self.name = name
        self._score = 0

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        """setter里可以做校验"""
        if not isinstance(value, (int, float)):
            raise TypeError("分数必须是数字")
        if not (0 <= value <= 100):
            raise ValueError(f"分数必须在0-100之间，你给的是{value}")
        self._score = value

    @property
    def level(self):
        """只读：根据分数计算等级"""
        if self._score >= 90: return "优秀A"
        elif self._score >= 80: return "良好B"
        elif self._score >= 70: return "中等C"
        elif self._score >= 60: return "及格D"
        else: return "不及格F"

s = Student("小明")
print(f"  初始分数: {s.score}, 等级: {s.level}")
s.score = 95  # 调用setter
print(f"  设置95分: {s.score}, 等级: {s.level}")
s.score = 55
print(f"  设置55分: {s.score}, 等级: {s.level}")

try:
    s.score = 150  # 不合法的值，setter会拒绝
except ValueError as e:
    print(f"  错误拦截: {e}")

# 3. deleter
print("\\n=== deleter 删除属性 ===")

class TempFile:
    def __init__(self, name):
        self.name = name
        self._content = ""
        print(f"  创建文件: {name}")

    @property
    def content(self):
        return self._content

    @content.setter
    def content(self, text):
        self._content = text
        print(f"  写入内容: {text[:30]}...")

    @content.deleter
    def content(self):
        print(f"  清空 {self.name} 的内容")
        self._content = ""

f = TempFile("test.txt")
f.content = "Hello World! This is property demo."
print(f"  当前内容: {f.content}")
del f.content
print(f"  删除后内容: '{f.content}'")

# 4. 实例：温度转换（property经典例子）
print("\\n=== 经典例子：摄氏温度和华氏温度 ===")

class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        self._celsius = value

    @property
    def fahrenheit(self):
        """华氏温度 = 摄氏 * 9/5 + 32"""
        return self._celsius * 9/5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        """设置华氏温度，自动转换为摄氏存储"""
        self._celsius = (value - 32) * 5/9

    def __str__(self):
        return f"{self.celsius:.1f}°C / {self.fahrenheit:.1f}°F"

t = Temperature()
print(f"  0°C: {t}")
t.celsius = 25
print(f"  25°C: {t}")
t.fahrenheit = 72
print(f"  72°F: {t}")
t.celsius = 100
print(f"  100°C(沸点): {t}")
t.celsius = -40
print(f"  -40°C: {t} (华氏也是-40，两个刻度交叉点！)")

# 5. 只读属性场景
print("\\n=== 只读属性：只暴露getter ===")

class Rectangle:
    def __init__(self, width, height):
        self._w = width
        self._h = height

    @property
    def width(self):
        return self._w

    @property
    def height(self):
        return self._h

    @property
    def area(self):
        return self._w * self._h

    @property
    def perimeter(self):
        return 2 * (self._w + self._h)

r = Rectangle(4, 5)
print(f"  矩形: {r.width}×{r.height}")
print(f"  面积: {r.area}")
print(f"  周长: {r.perimeter}")
# r.width = 10  # ❌ 不能改，因为没有setter
print("  width/height/area/perimeter 都是只读的")

# 6. property 与直接属性对比
print("\\n=== property 的优势 ===")
print("  1. 一开始可以直接用 self.name = name（简单）")
print("  2. 后来需要校验时，改成 property 不影响外部调用代码")
print("  3. 外部调用 obj.score 永远简洁，不需要改 get_score/set_score")
print("  4. 可以创建计算属性（area不是存的，是算的）")
print("  5. 可以创建只读属性")
`,
  },
  {
    id: "py6-str-repr", group: "面向对象", icon: "📝", title: "__str__ 与 __repr__",
    content: `## 📝 __str__ 与 __repr__

你有没有发现，打印自己创建的对象时，显示的是 \`<__main__.Dog object at 0x10a3...>\` 这种看不懂的东西？\`__str__\` 和 \`__repr__\` 就是用来让对象打印出友好信息的！

### __str__：给用户看的字符串

- 用 \`print(obj)\` 或 \`str(obj)\` 时调用
- 目标是**可读性好**，面向最终用户
- 简洁、友好的描述

### __repr__：给开发者看的字符串

- 用 \`repr(obj)\`、在交互式环境直接输入对象名时调用
- 目标是**无歧义**，最好能根据这个字符串重新创建对象
- 面向开发者，用于调试

### 区别对比

| | __str__ | __repr__ |
|---|---------|---------|
| 调用方 | print(), str() | repr(), 交互式环境 |
| 受众 | 最终用户 | 开发者 |
| 目标 | 好看、易读 | 精确、无歧义 |
| 理想情况 | 简洁描述 | 可以eval重建对象 |

### 最佳实践

- **至少写一个 __repr__**：如果不写 __str__，print 会用 __repr__
- **__repr__ 格式建议**：\`ClassName(params)\`，如 \`Dog("旺财", 3)\`
- **__str__ 格式建议**：更友好的描述，如 \`Dog(name=旺财, age=3)\`

### 如果只写一个？

只写 \`__repr__\`，因为 __str__ 默认会 fallback 到 __repr__。但写两个更好。

### 容器打印的是 __repr__

注意：\`print([dog1, dog2])\` 打印列表时，列表里的对象用的是 \`__repr__\`，不是 __str__！
`,
    code: `# ========== __str__ 与 __repr__ ==========

print("=" * 60)
print("📝 __str__ 与 __repr__")
print("=" * 60)

# 1. 不写 __str__/__repr__ 的默认输出
print("\\n=== 默认输出（不友好）===")

class BadDog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

bad_dog = BadDog("旺财", 3)
print(f"  print(bad_dog) → {bad_dog}")
print(f"  str(bad_dog)   → {str(bad_dog)}")
print(f"  repr(bad_dog)  → {repr(bad_dog)}")
print("  (默认显示: 类名 + object at + 内存地址，对用户不友好)")

# 2. 写 __str__ 和 __repr__
print("\\n=== 自定义 __str__ 和 __repr__ ===")

class Dog:
    def __init__(self, name, age, breed):
        self.name = name
        self.age = age
        self.breed = breed

    def __str__(self):
        """给用户看的：友好、简洁"""
        return f"🐕 {self.name}（{self.age}岁，{self.breed}）"

    def __repr__(self):
        """给开发者看的：精确、可eval"""
        return f"Dog(name={self.name!r}, age={self.age!r}, breed={self.breed!r})"

dog = Dog("旺财", 3, "柴犬")
print(f"  print(dog)  → {dog}")          # 调用 __str__
print(f"  str(dog)    → {str(dog)}")      # 调用 __str__
print(f"  repr(dog)   → {repr(dog)}")     # 调用 __repr__

# 3. __repr__ 可以用来重建对象
print("\\n=== __repr__ 最好能重建对象 ===")
dog_repr = repr(dog)
print(f"  repr结果: {dog_repr}")
print(f"  理论上可以 eval(repr(dog)) 重新创建对象（但这里为了安全不执行eval）")

# 4. 容器里的对象用 __repr__
print("\\n=== 注意：列表/字典中的对象用 __repr__ ===")
dogs = [
    Dog("旺财", 3, "柴犬"),
    Dog("小黑", 2, "拉布拉多"),
    Dog("咪咪", 1, "比熊"),
]
print("  print(列表) 显示的是 __repr__:")
print(f"  {dogs}")
print()
print("  遍历打印才用 __str__:")
for d in dogs:
    print(f"    {d}")

# 5. 各种类的 __str__/__repr__
print("\\n=== 更多例子 ===")

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __str__(self):
        return f"({self.x}, {self.y})"
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day
    def __str__(self):
        return f"{self.year}年{self.month}月{self.day}日"
    def __repr__(self):
        return f"Date({self.year}, {self.month}, {self.day})"

class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def __repr__(self):
        return f"Student('{self.name}', {self.score})"
    def __str__(self):
        grade = "优秀" if self.score >= 90 else "及格" if self.score >= 60 else "不及格"
        return f"学生{self.name}：{self.score}分（{grade}）"

p = Point(3, 4)
d = Date(2024, 6, 15)
s = Student("小明", 95)

for obj in [p, d, s]:
    print(f"  str:  {obj}")
    print(f"  repr: {repr(obj)}")
    print()

# 6. f-string 和 str/repr
print("=== f-string 中的用法 ===")
d2 = Dog("小白", 2, "萨摩耶")
print(f"  {{dog}}   → {d2}")          # 调用 __str__
print(f"  {{dog!s}} → {d2!s}")        # 强制 __str__
print(f"  {{dog!r}} → {d2!r}")        # 强制 __repr__

# 7. 只写 __repr__ 的情况
print("\\n=== 如果只写 __repr__？ ===")

class Cat:
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"Cat('{self.name}')"

cat = Cat("咪咪")
print(f"  只写了__repr__:")
print(f"  print(cat) → {cat}")  # __str__没有，自动用__repr__
print("  结论：至少写一个__repr__，__str__可以省")

# 8. 总结
print("\\n=== 总结 ===")
print("  __str__ → 给用户看的，友好易读（print/str调用）")
print("  __repr__ → 给开发者看的，精确无歧义（repr/容器调用）")
print("  格式建议:")
print("    __repr__: ClassName(param1=value1, param2=value2)")
print("    __str__:  自然语言描述")
print("  最佳实践：两个都写，至少写__repr__")
`,
  },
  {
    id: "py6-dunder-collection", group: "面向对象", icon: "📚", title: "常用容器魔术方法",
    content: `## 📚 常用容器魔术方法

想让自己写的类像列表、字典一样用 \`len()\`、\`obj[key]\`、\`for x in obj\` ？实现这些魔术方法就行！

### 容器相关魔术方法

| 方法 | 作用 | 触发方式 |
|------|------|---------|
| \`__len__(self)\` | 返回长度 | \`len(obj)\` |
| \`__getitem__(self, key)\` | 获取元素 | \`obj[key]\` |
| \`__setitem__(self, key, value)\` | 设置元素 | \`obj[key] = value\` |
| \`__delitem__(self, key)\` | 删除元素 | \`del obj[key]\` |
| \`__contains__(self, item)\` | 包含判断 | \`item in obj\` |
| \`__iter__(self)\` | 迭代器 | \`for x in obj\` |

### 示例：自定义列表类

\`\`\`python
class MyList:
    def __init__(self, data):
        self._data = list(data)

    def __len__(self):
        return len(self._data)

    def __getitem__(self, index):
        return self._data[index]

    def __setitem__(self, index, value):
        self._data[index] = value
\`\`\`

实现了这些方法后：
- 可以 \`len(obj)\`
- 可以 \`obj[0]\`、\`obj[1:3]\`（切片也支持！）
- 可以 \`obj[0] = x\`
- 可以 \`for x in obj\` 遍历（如果实现了__getitem__，Python可以自动迭代）
- 可以 \`x in obj\`（如果没实现__contains__，会用__iter__或__getitem__逐个找）

### 为什么要用这些魔术方法？

- 让自定义类的行为和 Python 内置类型一致
- 可以使用熟悉的语法（[]、len、in、for）
- 代码更 Pythonic（更符合Python风格）
`,
    code: `# ========== 容器魔术方法 ==========

print("=" * 60)
print("📚 容器魔术方法")
print("=" * 60)

# 1. 自定义一个"购物车"类
print("\\n=== 实例：购物车类（支持容器操作）===")

class ShoppingCart:
    def __init__(self):
        self._items = []  # 内部用列表存储

    def add(self, name, price, quantity=1):
        """添加商品"""
        for item in self._items:
            if item['name'] == name:
                item['quantity'] += quantity
                return
        self._items.append({'name': name, 'price': price, 'quantity': quantity})

    def __len__(self):
        """len(cart) → 商品种类数"""
        return len(self._items)

    def __getitem__(self, index):
        """cart[0], cart['苹果'], cart[1:3] 都支持"""
        if isinstance(index, str):
            # 用商品名查找
            for item in self._items:
                if item['name'] == index:
                    return item
            raise KeyError(f"购物车中没有 {index}")
        return self._items[index]  # 支持数字索引和切片

    def __setitem__(self, index, value):
        """cart[index] = value"""
        self._items[index] = value

    def __delitem__(self, index):
        """del cart[index]"""
        if isinstance(index, str):
            for i, item in enumerate(self._items):
                if item['name'] == index:
                    del self._items[i]
                    return
            raise KeyError(f"购物车中没有 {index}")
        del self._items[index]

    def __contains__(self, name):
        """'苹果' in cart"""
        for item in self._items:
            if item['name'] == name:
                return True
        return False

    def __iter__(self):
        """for item in cart 迭代"""
        return iter(self._items)

    def total(self):
        """计算总价"""
        return sum(item['price'] * item['quantity'] for item in self._items)

    def __str__(self):
        lines = ["🛒 购物车:"]
        for item in self._items:
            subtotal = item['price'] * item['quantity']
            lines.append(f"  {item['name']:8s} ×{item['quantity']:2d}  ¥{subtotal:.2f}")
        lines.append(f"  合计: ¥{self.total():.2f}")
        return "\\n".join(lines)


# 使用购物车
cart = ShoppingCart()
cart.add("苹果", 5.0, 3)
cart.add("香蕉", 3.0, 5)
cart.add("牛奶", 12.0, 2)
cart.add("苹果", 5.0, 2)  # 苹果变成5个

print(cart)
print(f"\\n  商品种类数: len(cart) = {len(cart)}")
print(f"  cart[0] = {cart[0]}")
print(f"  cart['苹果'] = {cart['苹果']}")
print(f"  '香蕉' in cart? {'香蕉' in cart}")
print(f"  '西瓜' in cart? {'西瓜' in cart}")

# 删除商品
del cart['香蕉']
print(f"\\n  删除香蕉后，商品种类: {len(cart)}")
print(f"  '香蕉' in cart? {'香蕉' in cart}")

# 遍历
print("\\n  遍历购物车商品:")
for item in cart:
    print(f"    {item['name']}: ¥{item['price']} × {item['quantity']}")

# 2. 自定义一个"有范围的列表"
print("\\n=== 实例：安全列表（边界检查）===")

class SafeList:
    def __init__(self, data=None):
        self._data = list(data) if data else []

    def __len__(self):
        return len(self._data)

    def __getitem__(self, index):
        if isinstance(index, slice):
            return SafeList(self._data[index])  # 切片返回新的SafeList
        if -len(self._data) <= index < len(self._data):
            return self._data[index]
        raise IndexError(f"索引{index}越界！范围[{-len(self._data)}, {len(self._data)-1}]")

    def __setitem__(self, index, value):
        if -len(self._data) <= index < len(self._data):
            self._data[index] = value
        else:
            raise IndexError(f"索引{index}越界！")

    def append(self, value):
        self._data.append(value)

    def __str__(self):
        return f"SafeList({self._data})"

    def __repr__(self):
        return f"SafeList({self._data!r})"

sl = SafeList([10, 20, 30, 40, 50])
print(f"  {sl}")
print(f"  len(sl) = {len(sl)}")
print(f"  sl[0] = {sl[0]}")
print(f"  sl[-1] = {sl[-1]}")
print(f"  sl[1:3] = {sl[1:3]}")

try:
    print(sl[100])  # 越界访问，有友好提示
except IndexError as e:
    print(f"  越界访问: {e}")

# 3. 自定义字典式访问
print("\\n=== 实例：属性式访问的配置类 ===")

class Config:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, f"_{k}", v)

    def __getitem__(self, key):
        return getattr(self, f"_{key}")

    def __setitem__(self, key, value):
        setattr(self, f"_{key}", value)

    def __contains__(self, key):
        return hasattr(self, f"_{key}")

    def __len__(self):
        return len([k for k in self.__dict__ if k.startswith('_')])

cfg = Config(host="localhost", port=3306, debug=True)
print(f"  cfg['host'] = {cfg['host']}")
print(f"  cfg['port'] = {cfg['port']}")
print(f"  'debug' in cfg? {'debug' in cfg}")
print(f"  len(cfg) = {len(cfg)}")
cfg['port'] = 5432
print(f"  修改后 cfg['port'] = {cfg['port']}")

# 4. 实现迭代
print("\\n=== __iter__ 支持for循环 ===")

class Fibonacci:
    """斐波那契数列（生成前n项）"""
    def __init__(self, n):
        self.n = n

    def __iter__(self):
        a, b = 0, 1
        count = 0
        while count < self.n:
            yield a
            a, b = b, a + b
            count += 1

    def __len__(self):
        return self.n

fib = Fibonacci(10)
print(f"  前{len(fib)}个斐波那契数: {list(fib)}")

# 5. 魔术方法列表速查
print("\\n=== 容器魔术方法速查 ===")
methods_table = [
    ("__len__", "len(obj)", "返回长度"),
    ("__getitem__", "obj[key]", "获取元素"),
    ("__setitem__", "obj[key]=val", "设置元素"),
    ("__delitem__", "del obj[key]", "删除元素"),
    ("__contains__", "x in obj", "包含判断"),
    ("__iter__", "for x in obj", "迭代"),
    ("__reversed__", "reversed(obj)", "反向迭代"),
]
print(f"  {'方法':>16s}  {'触发方式':<20s}  说明")
print(f"  {'─'*16}  {'─'*20}  {'─'*20}")
for m, t, d in methods_table:
    print(f"  {m:>16s}  {t:<20s}  {d}")
`,
  },
  {
    id: "py6-dunder-operator", group: "面向对象", icon: "➕", title: "运算符重载",
    content: `## ➕ 运算符重载

Python 的运算符（+、-、==、< 等）本质上是通过魔术方法实现的。你可以在自己的类中定义这些方法，让对象支持运算符操作！

### 算术运算符

| 运算符 | 魔术方法 | 触发方式 |
|--------|---------|---------|
| + | \`__add__(self, other)\` | \`obj + other\` |
| - | \`__sub__(self, other)\` | \`obj - other\` |
| * | \`__mul__(self, other)\` | \`obj * other\` |
| / | \`__truediv__(self, other)\` | \`obj / other\` |
| // | \`__floordiv__(self, other)\` | \`obj // other\` |
| % | \`__mod__(self, other)\` | \`obj % other\` |
| ** | \`__pow__(self, other)\` | \`obj ** other\` |
| 负号 | \`__neg__(self)\` | \`-obj\` |

### 比较运算符

| 运算符 | 魔术方法 | 触发方式 |
|--------|---------|---------|
| == | \`__eq__(self, other)\` | \`obj == other\` |
| != | \`__ne__(self, other)\` | \`obj != other\` |
| < | \`__lt__(self, other)\` | \`obj < other\` |
| <= | \`__le__(self, other)\` | \`obj <= other\` |
| > | \`__gt__(self, other)\` | \`obj > other\` |
| >= | \`__ge__(self, other)\` | \`obj >= other\` |

### 反向运算符（r开头）

当 \`other + obj\` 且 other 不支持时，调用 \`__radd__\`：
- \`__radd__\`、\`__rsub__\`、\`__rmul__\` 等

### 就地运算符（i开头）

\`obj += other\` 调用 \`__iadd__\`，如果没定义则用 \`__add__\` 赋值。

### functools.total_ordering

只要实现 \`__eq__\` 和 \`__lt__\`（或__le__、__gt__、__ge__中任一个），加上 \`@total_ordering\` 装饰器就能自动补全所有比较方法！
`,
    code: `# ========== 运算符重载 ==========

print("=" * 60)
print("➕ 运算符重载")
print("=" * 60)

# 1. 向量类（算术运算符）
print("\\n=== 实例：二维向量 Vector ===")

class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        """向量加法: v1 + v2"""
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        if isinstance(other, (int, float)):
            return Vector(self.x + other, self.y + other)
        return NotImplemented

    def __sub__(self, other):
        """向量减法: v1 - v2"""
        if isinstance(other, Vector):
            return Vector(self.x - other.x, self.y - other.y)
        return NotImplemented

    def __mul__(self, scalar):
        """向量数乘: v * 3"""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        if isinstance(other, Vector):
            # 点积
            return self.x * other.x + self.y * other.y
        return NotImplemented

    def __rmul__(self, scalar):
        """支持 3 * v （反向乘法）"""
        return self.__mul__(scalar)

    def __neg__(self):
        """负号: -v"""
        return Vector(-self.x, -self.y)

    def __abs__(self):
        """绝对值/长度: abs(v)"""
        import math
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def __eq__(self, other):
        """相等: v1 == v2"""
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"


v1 = Vector(1, 2)
v2 = Vector(3, 4)

print(f"  v1 = {v1}")
print(f"  v2 = {v2}")
print(f"  v1 + v2 = {v1 + v2}")
print(f"  v2 - v1 = {v2 - v1}")
print(f"  v1 * 3 = {v1 * 3}")
print(f"  3 * v1 = {3 * v1}")
print(f"  -v1 = {-v1}")
print(f"  abs(v2) = {abs(v2):.2f} (向量长度)")
print(f"  v1 == Vector(1,2)? {v1 == Vector(1, 2)}")
print(f"  v1 == v2? {v1 == v2}")

# 2. 分数类（完整算术+比较）
print("\\n=== 实例：分数类 Fraction（简化版）===")

from math import gcd

class Fraction:
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ZeroDivisionError("分母不能为0")
        # 约分
        common = gcd(abs(numerator), abs(denominator))
        self.num = numerator // common
        self.den = denominator // common
        # 负号放分子
        if self.den < 0:
            self.num = -self.num
            self.den = -self.den

    def __add__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            new_num = self.num * other.den + other.num * self.den
            new_den = self.den * other.den
            return Fraction(new_num, new_den)
        return NotImplemented

    def __sub__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            new_num = self.num * other.den - other.num * self.den
            new_den = self.den * other.den
            return Fraction(new_num, new_den)
        return NotImplemented

    def __mul__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self.num * other.num, self.den * other.den)
        return NotImplemented

    def __truediv__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self.num * other.den, self.den * other.num)
        return NotImplemented

    def __eq__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return self.num == other.num and self.den == other.den
        return NotImplemented

    def __lt__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return self.num * other.den < other.num * self.den
        return NotImplemented

    def __float__(self):
        return self.num / self.den

    def __str__(self):
        if self.den == 1:
            return str(self.num)
        return f"{self.num}/{self.den}"

    def __repr__(self):
        return f"Fraction({self.num}, {self.den})"

f1 = Fraction(1, 2)
f2 = Fraction(1, 3)
f3 = Fraction(4, 6)  # 会约分成2/3

print(f"  1/2 = {f1}")
print(f"  1/3 = {f2}")
print(f"  4/6 约分后 = {f3}")
print(f"  1/2 + 1/3 = {f1 + f2}")
print(f"  1/2 - 1/3 = {f1 - f2}")
print(f"  1/2 * 1/3 = {f1 * f2}")
print(f"  1/2 / 1/3 = {f1 / f2}")
print(f"  1/2 + 1 = {f1 + 1}")
print(f"  float(1/2) = {float(f1)}")
print(f"  1/2 == 2/4? {f1 == Fraction(2, 4)}")
print(f"  1/2 < 2/3? {f1 < f3}")
print(f"  1/2, 1/3, 2/3 排序: {sorted([f1, f2, f3])}")

# 3. @total_ordering 自动补全比较
print("\\n=== functools.total_ordering 装饰器 ===")

from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __eq__(self, other):
        return self.score == other.score

    def __lt__(self, other):
        return self.score < other.score

    def __str__(self):
        return f"{self.name}({self.score}分)"

students = [
    Student("小明", 85),
    Student("小红", 92),
    Student("小刚", 78),
]
print("  按分数排序（只实现了__eq__和__lt__，自动支持所有比较）:")
for s in sorted(students):
    print(f"    {s}")

s1 = Student("A", 90)
s2 = Student("B", 90)
s3 = Student("C", 80)
print(f"  90分 == 90分? {s1 == s2}")
print(f"  90分 > 80分? {s1 > s3}")
print(f"  80分 >= 80分? {s3 >= s3}")

# 4. 其他常用运算符
print("\\n=== 其他运算符重载 ===")

class MyList:
    def __init__(self, data):
        self.data = list(data)
    def __getitem__(self, i):
        return self.data[i]
    def __len__(self):
        return len(self.data)
    def __contains__(self, x):
        return x in self.data
    def __str__(self):
        return str(self.data)

ml = MyList([1, 2, 3])
print(f"  自定义列表: {ml}")
print(f"  len: {len(ml)}, ml[0]: {ml[0]}, 2 in ml: {2 in ml}")

# 5. 运算符重载总结
print("\\n=== 运算符重载注意事项 ===")
print("  1. 不要过度使用：让代码符合直觉才重载")
print("  2. 返回新对象：+ - * 应返回新对象，不修改self")
print("  3. 类型检查：isinstance检查other类型，不支持返回NotImplemented")
print("  4. 用total_ordering简化比较运算")
print("  5. __iadd__等实现就地操作（+=），返回self")
`,
  },
  {
    id: "py6-dunder-call", group: "面向对象", icon: "📞", title: "__call__/__enter__/__exit__",
    content: `## 📞 __call__、__enter__、__exit__

### __call__：让对象可以像函数一样被调用

如果类实现了 \`__call__\` 方法，那么实例可以像函数一样被调用：

\`\`\`python
class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return self.n + x

add5 = Adder(5)
print(add5(3))  # 8，对象像函数一样调用！
\`\`\`

#### __call__ 的用途

- 函数对象（带状态的函数）
- 装饰器类
- 工厂模式
- 需要记住状态的回调函数

### 上下文管理器：__enter__ 和 __exit__

上下文管理器让你可以用 \`with\` 语句自动管理资源（如文件、锁、连接）：

\`\`\`python
with open('file.txt') as f:
    data = f.read()
# 离开with块后文件自动关闭
\`\`\`

#### with 语句的原理

\`\`\`python
with MyContext() as obj:  # ① 调用 __enter__，返回值给obj
    ...                  # ② 执行with块里的代码
                         # ③ 无论是否异常，都调用 __exit__
\`\`\`

- \`__enter__(self)\`：进入with时调用，返回值赋给as后的变量
- \`__exit__(self, exc_type, exc_val, exc_tb)\`：离开时调用，做清理工作
  - 如果返回 True，异常被吞掉
  - 如果返回 False/None，异常继续传播

#### contextlib 简化

用 \`contextlib.contextmanager\` 装饰器可以用生成器函数更简单地创建上下文管理器，不需要写类。
`,
    code: `# ========== __call__ / __enter__ / __exit__ ==========

print("=" * 60)
print("📞 __call__ / __enter__ / __exit__")
print("=" * 60)

# 1. __call__ 基础
print("\\n=== __call__：对象像函数一样调用 ===")

class Multiplier:
    def __init__(self, factor):
        self.factor = factor
        self.count = 0  # 记录调用次数

    def __call__(self, x):
        self.count += 1
        return x * self.factor

double = Multiplier(2)
triple = Multiplier(3)

print(f"  double(5) = {double(5)}")
print(f"  double(10) = {double(10)}")
print(f"  triple(5) = {triple(5)}")
print(f"  double被调用了{double.count}次")
print(f"  triple被调用了{triple.count}次")

# 2. __call__ 实现带记忆的函数
print("\\n=== 应用：带缓存的斐波那契 ===")

class Fibonacci:
    def __init__(self):
        self.cache = {0: 0, 1: 1}
        self.calls = 0

    def __call__(self, n):
        self.calls += 1
        if n in self.cache:
            return self.cache[n]
        self.cache[n] = self(n-1) + self(n-2)
        return self.cache[n]

fib = Fibonacci()
print(f"  fib(10) = {fib(10)}")
print(f"  fib(20) = {fib(20)}")
print(f"  fib(100) = {fib(100)}")
print(f"  缓存了{len(fib.cache)}个值，共调用{fib.calls}次")

# 3. __call__ 实现简单的装饰器模式
print("\\n=== 应用：调用计数器装饰器 ===")

class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"  [第{self.count}次调用 {self.func.__name__}]")
        return self.func(*args, **kwargs)

@CountCalls  # 等价于 greet = CountCalls(greet)
def greet(name):
    return f"你好, {name}!"

print(f"  {greet('小明')}")
print(f"  {greet('小红')}")
print(f"  {greet('小刚')}")
print(f"  greet函数共被调用{greet.count}次")

# 4. 上下文管理器基础：手动计时
print("\\n=== 上下文管理器 __enter__/__exit__ ===")

import time

class Timer:
    """计时上下文管理器"""
    def __init__(self, name="计时器"):
        self.name = name

    def __enter__(self):
        self.start = time.time()
        print(f"  ⏱️  [{self.name}] 开始计时...")
        return self  # 返回值给 as 变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.elapsed = self.end - self.start
        print(f"  ⏱️  [{self.name}] 耗时: {self.elapsed:.6f}秒")
        # 返回False表示不吞异常
        return False

with Timer("累加计算") as t:
    total = sum(range(1000000))
print(f"  计算结果: {total}")

# 5. 上下文管理器处理异常
print("\\n=== __exit__ 处理异常 ===")

class SafeOp:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"  [{self.name}] 进入安全操作")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"  [{self.name}] 捕获异常: {exc_type.__name__}: {exc_val}")
            return True  # 返回True，吞掉异常，程序继续
        print(f"  [{self.name}] 操作成功完成")
        return False

with SafeOp("正常操作"):
    print(f"  执行中...")
    result = 1 + 1
    print(f"  结果: {result}")

print()

with SafeOp("可能出错的操作"):
    print(f"  执行中...")
    x = 1 / 0  # 会触发异常
    print("  这行不会执行")
print("  异常被捕获，程序继续运行！")

# 6. 实用例子：临时改变工作目录
print("\\n=== 实例：临时目录切换 ===")

import os
import tempfile

class TempDir:
    def __init__(self):
        self.temp_path = None
        self.original = None

    def __enter__(self):
        self.original = os.getcwd()
        self.temp_path = tempfile.mkdtemp()
        os.chdir(self.temp_path)
        print(f"  📁 切换到临时目录: {self.temp_path}")
        return self.temp_path

    def __exit__(self, exc_type, exc_val, exc_tb):
        os.chdir(self.original)
        import shutil
        shutil.rmtree(self.temp_path)
        print(f"  📁 返回原目录: {self.original}")
        print(f"  📁 临时目录已清理")
        return False

with TempDir() as tmp:
    print(f"  当前目录: {os.getcwd()}")
    # 在临时目录中创建文件
    with open('test.txt', 'w') as f:
        f.write("Hello!")
    print(f"  临时目录内容: {os.listdir('.')}")
print(f"  with结束后当前目录: {os.getcwd()}")

# 7. contextlib 方式（更简洁）
print("\\n=== 用 contextlib 简化上下文管理器 ===")

from contextlib import contextmanager

@contextmanager
def simple_timer(name="操作"):
    start = time.time()
    print(f"  [{name}] 开始")
    yield  # yield之前是__enter__，yield之后是__exit__，yield的值是as变量
    elapsed = time.time() - start
    print(f"  [{name}] 结束，耗时{elapsed:.6f}秒")

with simple_timer("测试"):
    _ = [i**2 for i in range(100000)]

# 8. 总结
print("\\n=== 总结 ===")
print("  __call__: 让对象可调用，像函数一样 obj()")
print("    → 适合：带状态的函数、装饰器、工厂")
print()
print("  __enter__/__exit__: 上下文管理器，配合with语句")
print("    → __enter__: 进入with时调用，返回值给as")
print("    → __exit__: 离开with时调用，做清理，可处理异常")
print("    → 适合：文件、锁、连接、计时、临时状态切换")
print()
print("  contextmanager装饰器: 用生成器函数简化上下文管理器")
`,
  },
  {
    id: "py6-dataclass", group: "面向对象", icon: "💼", title: "dataclass 数据类",
    content: `## 💼 dataclass 数据类

写类时，经常有很多"样板代码"：__init__、__repr__、__eq__... \`@dataclass\` 装饰器帮你自动生成这些！

### 为什么需要 dataclass？

以前定义一个数据类要写很多重复代码：

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"
    def __eq__(self, other):
        ...
\`\`\`

用 dataclass 后，只需要声明字段类型，其他自动生成！

### 基本用法

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    name: str = "原点"
\`\`\`

自动生成：
- \`__init__(self, x, y, name="原点")\`
- \`__repr__\`
- \`__eq__\`
- \`__hash__\`（需要设置frozen=True）

### field 高级配置

\`\`\`python
from dataclasses import field

@dataclass
class Student:
    name: str
    scores: list = field(default_factory=list)  # 可变默认值用default_factory
    age: int = 0
\`\`\`

- \`default\`：默认值
- \`default_factory\`：默认值工厂函数（列表/字典等可变类型必须用这个）
- \`repr\`：是否在repr中显示（默认True）
- \`compare\`：是否参与比较（默认True）
- \`init\`：是否在__init__中（默认True）

### frozen=True 不可变

\`@dataclass(frozen=True)\` 让实例不可变（像元组），创建后不能修改属性。
`,
    code: `# ========== dataclass 数据类 ==========

from dataclasses import dataclass, field
from typing import List

print("=" * 60)
print("💼 dataclass 数据类")
print("=" * 60)

# 1. 基本用法
print("\\n=== 基本用法：自动生成__init__/__repr__/__eq__ ===")

@dataclass
class Point:
    x: float
    y: float
    label: str = "点"

p1 = Point(3, 4)
p2 = Point(3, 4)
p3 = Point(1, 2, "A点")

print(f"  p1 = {p1}")                    # 自动有好看的__repr__
print(f"  p3 = {p3}")
print(f"  p1 == p2? {p1 == p2}")          # 自动有__eq__，按字段比较
print(f"  p1 == p3? {p1 == p3}")
print(f"  p1.x = {p1.x}, p1.y = {p1.y}") # 属性正常访问

# 2. field 配置
print("\\n=== field() 配置默认值 ===")

@dataclass
class Student:
    name: str
    age: int = 18
    scores: List[int] = field(default_factory=list)  # 可变类型必须用default_factory
    _secret: str = field(default="", repr=False)     # 不在repr中显示

    def average(self):
        return sum(self.scores) / len(self.scores) if self.scores else 0

s1 = Student("小明")
s1.scores.append(85)
s1.scores.append(92)
s2 = Student("小红", 17)
s2.scores.append(78)
s2.scores.append(95)
s2.scores.append(88)

print(f"  s1 = {s1}")
print(f"  s2 = {s2}")
print(f"  小明平均分: {s1.average():.1f}")
print(f"  小红平均分: {s2.average():.1f}")
print(f"  两个学生共用同一个列表？{s1.scores is s2.scores}")  # False，各有各的列表！

# 3. frozen=True 不可变
print("\\n=== frozen=True 不可变数据类 ===")

@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int
    name: str = "未命名"

red = Color(255, 0, 0, "红色")
blue = Color(0, 0, 255, "蓝色")
print(f"  red = {red}")
print(f"  blue = {blue}")
print(f"  red == Color(255,0,0,'红色')? {red == Color(255, 0, 0, '红色')}")
# red.r = 128  # ❌ FrozenInstanceError，不能修改！

# 4. order=True 自动支持排序
print("\\n=== order=True 自动支持比较排序 ===")

@dataclass(order=True)
class Employee:
    salary: int
    name: str
    department: str = "未知"

staff = [
    Employee(8000, "小红", "市场部"),
    Employee(15000, "小明", "技术部"),
    Employee(10000, "小刚", "销售部"),
    Employee(12000, "小丽", "技术部"),
]

print("  员工列表（按薪资排序）:")
for emp in sorted(staff):
    print(f"    {emp.name} - {emp.department} - ¥{emp.salary}")

# 5. 实际应用场景
print("\\n=== 应用：配置类 ===")

@dataclass
class DatabaseConfig:
    host: str = "localhost"
    port: int = 3306
    username: str = "root"
    password: str = ""
    database: str = "test"
    timeout: int = 30
    debug: bool = False

    def connection_string(self):
        return f"mysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"

default_config = DatabaseConfig()
prod_config = DatabaseConfig(
    host="192.168.1.100",
    username="admin",
    password="secret",
    database="production",
    timeout=60
)

print(f"  默认配置: {default_config}")
print(f"  生产连接串: {prod_config.connection_string()}")

# 6. 实例：游戏角色
print("\\n=== 应用：游戏角色 ===")

@dataclass
class Character:
    name: str
    hp: int = 100
    attack: int = 10
    defense: int = 5
    level: int = 1
    exp: int = 0
    items: List[str] = field(default_factory=list)

    def take_damage(self, dmg):
        actual = max(1, dmg - self.defense)
        self.hp = max(0, self.hp - actual)
        return actual

    def attack_enemy(self, enemy):
        dmg = self.take_damage(self.attack)
        print(f"  {self.name} 攻击 {enemy.name}，造成 {dmg} 点伤害！")
        print(f"  {enemy.name} 剩余HP: {enemy.hp}")

hero = Character("勇者", hp=150, attack=25, defense=10)
slime = Character("史莱姆", hp=50, attack=8, defense=2)

print(f"  初始状态:")
print(f"    {hero}")
print(f"    {slime}")
print()
hero.attack_enemy(slime)
hero.attack_enemy(slime)
slime.attack_enemy(hero)

# 7. dataclasses 模块常用函数
print("\\n=== dataclasses 工具函数 ===")
from dataclasses import asdict, astuple, fields

print(f"  asdict(p1) = {asdict(p1)}")
print(f"  astuple(p1) = {astuple(p1)}")
print(f"  Point的字段: {[f.name for f in fields(Point)]}")

# 8. 总结
print("\\n=== dataclass 总结 ===")
print("  ✅ 自动生成 __init__, __repr__, __eq__")
print("  ✅ frozen=True 生成不可变类")
print("  ✅ order=True 自动支持排序比较")
print("  ✅ field() 精细控制字段行为")
print("  ✅ default_factory 解决可变默认值问题")
print("  ✅ asdict/astuple/fields 等实用工具函数")
print()
print("  ⚠️  注意：可变默认参数(list/dict)必须用 default_factory")
`,
  },
  {
    id: "py6-composition-vs-inheritance", group: "面向对象", icon: "🧩", title: "组合与继承",
    content: `## 🧩 组合与继承

面向对象代码复用有两种主要方式：**继承**（is-a）和**组合**（has-a）。

### 继承（Inheritance）：is-a 关系

"是一个"的关系用继承：
- Dog **是** Animal（狗是一种动物）
- Car **是** Vehicle（汽车是一种交通工具）

\`\`\`python
class Animal: ...
class Dog(Animal): ...  # Dog is a Animal
\`\`\`

### 组合（Composition）：has-a 关系

"有一个"的关系用组合：
- Car **有一个** Engine（汽车有一个引擎）
- House **有** Room（房子有房间）
- Person **有一个** Address（人有地址）

\`\`\`python
class Engine:
    def start(self): print("引擎启动")

class Car:
    def __init__(self):
        self.engine = Engine()  # 组合：Car has an Engine
    def start(self):
        self.engine.start()    # 委托给engine
\`\`\`

### 为什么"组合优于继承"？

GoF（《设计模式》四人帮）名言：**"优先使用组合而非继承"**

| | 继承 | 组合 |
|---|------|------|
| 关系 | is-a（是一个） | has-a（有一个） |
| 耦合度 | 高（父类改了子类受影响） | 低（通过接口交互）|
| 灵活性 | 编译时确定 | 运行时可替换 |
| 层次 | 容易过深继承 | 灵活组合 |
| 封装 | 子类知道父类细节 | 只看接口 |

### 什么时候用继承？

- 确实是"是一个"的关系（Dog is an Animal）
- 需要多态
- 父类提供了很多子类共用的代码
- 层次关系稳定

### 什么时候用组合？

- "有一个"的关系
- 需要灵活组合功能
- 想避免继承的高耦合
- 需要运行时改变行为

### 例子对比

**用继承**（不灵活）：
\`\`\`python
class Duck(Animal, Flyable, Swimmable): ...  # 如果有的鸭子不会飞？
\`\`\`

**用组合**（灵活）：
\`\`\`python
class Duck:
    def __init__(self, fly_behavior, swim_behavior):
        self.fly = fly_behavior    # 注入飞行行为
        self.swim = swim_behavior  # 注入游泳行为
\`\`\`
`,
    code: `# ========== 组合与继承 ==========

print("=" * 60)
print("🧩 组合优于继承")
print("=" * 60)

# 1. 继承的问题：类爆炸
print("\\n=== 继承容易导致类爆炸 ===")
print("  需求：有各种鸭子（野鸭、玩具鸭、橡皮鸭、电子鸭）")
print("  不是所有鸭子都会飞/呱呱叫")
print()
print("  继承方式：")
print("    Duck (基类)")
print("    ├── RealDuck (会飞，会呱呱叫)")
print("    ├── ToyDuck (不会飞，会吱吱叫)")
print("    ├── RubberDuck (不会飞，会吱吱叫)")
print("    ├── ElectronicDuck (会飞(遥控)，会电子叫)")
print("    └── WoodenDuck (不会飞，不会叫)")
print("  如果再加'会游泳的鸭子''会潜水的鸭子'... 类会爆炸！")

# 2. 组合方式：策略模式
print("\\n=== 组合方式：把行为分离出来 ===")

# 飞行行为族
class FlyWithWings:
    def fly(self): return "🦅 展翅高飞！"
class FlyNoWay:
    def fly(self): return "❌ 不会飞"
class FlyRocketPowered:
    def fly(self): return "🚀 用火箭飞行！"

# 叫声行为族
class QuackLoud:
    def quack(self): return "🔊 嘎嘎嘎！"
class QuackSqueak:
    def quack(self): return "🔈 吱吱吱~"
class MuteQuack:
    def quack(self): return "🔇 (沉默)"

# 鸭子类使用组合
class Duck:
    def __init__(self, name, fly_behavior, quack_behavior):
        self.name = name
        self.fly_behavior = fly_behavior
        self.quack_behavior = quack_behavior

    def perform_fly(self):
        print(f"  {self.name}: {self.fly_behavior.fly()}")

    def perform_quack(self):
        print(f"  {self.name}: {self.quack_behavior.quack()}")

    def swim(self):
        print(f"  {self.name}: 🏊 在水中游泳")

    def set_fly(self, fb):
        self.fly_behavior = fb

    def set_quack(self, qb):
        self.quack_behavior = qb

print("\\n--- 创建不同鸭子 ---")
mallard = Duck("绿头鸭", FlyWithWings(), QuackLoud())
rubber = Duck("橡皮鸭", FlyNoWay(), QuackSqueak())
decoy = Duck("诱饵鸭", FlyNoWay(), MuteQuack())
rocket = Duck("火箭鸭", FlyRocketPowered(), QuackLoud())

for duck in [mallard, rubber, decoy, rocket]:
    duck.perform_fly()
    duck.perform_quack()
    duck.swim()
    print()

print("  --- 给橡皮鸭装个火箭引擎 ---")
rubber.set_fly(FlyRocketPowered())
rubber.perform_fly()

# 3. 组合实例：电脑由零件组成
print("\\n=== 实例：电脑组装（组合）===")

class CPU:
    def __init__(self, brand, cores, speed):
        self.brand = brand
        self.cores = cores
        self.speed = speed
    def info(self): return f"{self.brand} CPU({self.cores}核, {self.speed}GHz)"
    def start(self): return "CPU启动"

class Memory:
    def __init__(self, size):
        self.size = size
    def info(self): return f"{self.size}GB 内存"
    def start(self): return "内存自检通过"

class Storage:
    def __init__(self, type_, size):
        self.type = type_
        self.size = size
    def info(self): return f"{self.size}GB {self.type}"
    def start(self): return f"{self.type}硬盘就绪"

class Computer:
    def __init__(self, brand, cpu, memory, storage):
        self.brand = brand
        self.cpu = cpu
        self.memory = memory
        self.storage = storage

    def boot(self):
        print(f"  {self.brand}电脑启动中...")
        print(f"    {self.cpu.start()}")
        print(f"    {self.memory.start()}")
        print(f"    {self.storage.start()}")
        print(f"  ✅ 启动成功！")

    def config_info(self):
        print(f"  {self.brand} 配置:")
        print(f"    {self.cpu.info()}")
        print(f"    {self.memory.info()}")
        print(f"    {self.storage.info()}")

gaming_pc = Computer("游戏本",
    CPU("Intel i9", 16, 5.2),
    Memory(32),
    Storage("SSD", 2000))

office_pc = Computer("办公本",
    CPU("Intel i5", 8, 3.5),
    Memory(16),
    Storage("SSD", 512))

gaming_pc.config_info()
gaming_pc.boot()
print()
office_pc.config_info()

# 4. 继承vs组合对比总结
print("\\n=== 对比总结 ===")
print("  继承 (is-a):")
print("    ✅ 简单直观，符合直觉")
print("    ✅ 多态天然支持")
print("    ❌ 高耦合，父类改变影响子类")
print("    ❌ 不能在运行时改变行为")
print("    ❌ 容易导致类爆炸")
print()
print("  组合 (has-a):")
print("    ✅ 低耦合，组件独立变化")
print("    ✅ 运行时可替换")
print("    ✅ 灵活组合，避免类爆炸")
print("    ✅ 每个类职责单一")
print()
print("  💡 经验法则：is-a用继承，has-a用组合，优先组合")
`,
  },
  {
    id: "py6-duck-typing", group: "面向对象", icon: "🦆", title: "鸭子类型",
    content: `## 🦆 鸭子类型（Duck Typing）

> "当一只鸟走起来像鸭子、游泳像鸭子、叫起来像鸭子，那它就是鸭子。"

### 什么是鸭子类型？

鸭子类型是Python的类型哲学：**不关心对象是什么类型，只关心对象有什么方法/行为**。

- Java/C++：必须实现接口才能调用方法（编译时检查）
- Python：只要有这个方法就能调用（运行时检查）

### EAFP vs LBYL

**LBYL (Look Before You Leap) —— 先看再跳**
\`\`\`python
if hasattr(obj, 'fly'):
    obj.fly()
\`\`\`

**EAFP (Easier to Ask for Forgiveness than Permission) —— 请求原谅比许可容易**
\`\`\`python
try:
    obj.fly()
except AttributeError:
    pass
\`\`\`

Python 推荐 EAFP 风格！

### 常见协议

- **可迭代**：实现 \`__iter__\` → for循环
- **上下文管理器**：\`__enter__\`/\`__exit__\` → with语句
- **可调用**：\`__call__\` → obj()
- **序列**：\`__len__\`/\`__getitem__\` → 像列表
- **数值**：\`__add__\` 等 → 运算符
`,
    code: `# ========== 鸭子类型 ==========

print("=" * 60)
print("🦆 鸭子类型")
print("=" * 60)

# 1. 基础：只要有quack()就能叫
print("\\n=== 基础：只要有quack方法就能叫 ===")

class Duck:
    def quack(self): return "嘎嘎嘎！"
class Person:
    def quack(self): return "（人学鸭叫）嘎嘎嘎！"
class Robot:
    def quack(self): return "BEEP BOOP 嘎嘎！"

def make_quack(thing):
    print(f"  {type(thing).__name__}: {thing.quack()}")

for obj in [Duck(), Person(), Robot()]:
    make_quack(obj)

# 2. EAFP风格
print("\\n=== EAFP: 先尝试，失败再处理 ===")

class Dog:
    def bark(self): return "汪汪！"
class Cat:
    def meow(self): return "喵~"

def make_sound(animal):
    try:
        animal.bark()
        print("  汪汪叫！")
    except AttributeError:
        try:
            animal.meow()
            print("  喵喵叫！")
        except AttributeError:
            print("  未知动物...")

make_sound(Dog())
make_sound(Cat())

# 3. 文件-like对象
print("\\n=== 文件-like对象：有write()就能当文件 ===")

class FakeFile:
    def __init__(self):
        self.content = []
    def write(self, text):
        self.content.append(text)
        return len(text)
    def __str__(self):
        return "".join(self.content)

def write_hello(f):
    f.write("Hello, Duck Typing!")

from io import StringIO
sf = StringIO()
ff = FakeFile()
write_hello(sf)
write_hello(ff)
print(f"  StringIO: {sf.getvalue()}")
print(f"  FakeFile: {ff}")

# 4. 可迭代协议
print("\\n=== 可迭代：有__iter__就能for循环 ===")

class CountDown:
    def __init__(self, start):
        self.start = start
    def __iter__(self):
        n = self.start
        while n > 0:
            yield n
            n -= 1

print("  倒数5个数:")
for num in CountDown(5):
    print(f"    {num}")

# 5. 序列协议
print("\\n=== 序列：有__len__/__getitem__ ===")

class MyRange:
    def __init__(self, end):
        self.end = end
    def __len__(self):
        return self.end
    def __getitem__(self, i):
        if 0 <= i < self.end:
            return i
        raise IndexError

r = MyRange(5)
print(f"  len={len(r)}, 元素={[r[i] for i in range(len(r))]}")

# 6. 可调用
print("\\n=== 可调用：有__call__就能obj() ===")

class Multiplier:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return x * self.n

double = Multiplier(2)
print(f"  double(5) = {double(5)}")
print(f"  callable(double)? {callable(double)}")

# 7. 不要做类型检查
print("\\n=== 不要isinstance检查类型 ===")

def good_len(obj):
    try:
        return len(obj)
    except TypeError:
        return -1

print(f"  good_len([1,2,3]) = {good_len([1,2,3])}")
print(f"  good_len({{1,2,3}}) = {good_len({1,2,3})}")
print(f"  good_len(CountDown(5)) = {good_len(CountDown(5))}")

print("\\n=== 总结 ===")
print("  核心：不关心是什么，只关心能做什么")
print("  EAFP > LBYL")
print("  实现协议方法就具有相应能力")
`,
  },
  {
    id: "py6-class-advanced", group: "面向对象", icon: "🚀", title: "类的高级话题",
    content: `## 🚀 类的高级话题

### __slots__：节省内存

默认对象用 \`__dict__\` 存属性，字典占内存。创建**大量**对象时，用 \`__slots__\` 声明固定属性可节省内存。

\`\`\`python
class Point:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y
\`\`\`

效果：
- 内存减少（通常30%+）
- 不能动态添加新属性
- 没有 \`__dict__\`

⚠️ 普通项目不需要，海量实例时才用。

### 类装饰器

和函数装饰器类似，接收类返回修改后的类：

\`\`\`python
def add_repr(cls):
    def __repr__(self):
        return f"{cls.__name__}(...)"
    cls.__repr__ = __repr__
    return cls
\`\`\`

### 单例模式

一个类只能创建一个实例。

### 抽象基类 ABC

用 \`abc.ABC\` 和 \`@abstractmethod\` 定义接口，子类必须实现抽象方法。
`,
    code: `# ========== 类的高级话题 ==========

import sys
print("=" * 60)
print("🚀 类的高级话题")
print("=" * 60)

# 1. __slots__节省内存
print("\\n=== __slots__ ===")

class NormalPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class SlotPoint:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y

np = NormalPoint(1, 2)
sp = SlotPoint(1, 2)
print(f"  普通类大小: {sys.getsizeof(np)} 字节(含__dict__)")
print(f"  slots类大小: {sys.getsizeof(sp)} 字节(无__dict__)")

# slots不能加新属性
try:
    sp.z = 3
except AttributeError as e:
    print(f"  slots不能加新属性: {e}")

np.z = 3
print(f"  普通类可以加np.z={np.z}")

# 2. 类装饰器
print("\\n=== 类装饰器 ===")

def add_greet(cls):
    def greet(self):
        return f"你好，我是{self.name}"
    cls.greet = greet
    return cls

@add_greet
class Person:
    def __init__(self, name):
        self.name = name

p = Person("小明")
print(f"  装饰器添加greet(): {p.greet()}")

# 3. 单例模式
print("\\n=== 单例模式 ===")

def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Config:
    def __init__(self):
        self.debug = False

c1 = Config()
c2 = Config()
print(f"  c1 is c2? {c1 is c2}")
c1.debug = True
print(f"  c2.debug = {c2.debug}")

# 4. 抽象基类ABC
print("\\n=== 抽象基类 ABC ===")

from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
    def describe(self):
        return f"面积: {self.area():.2f}"

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        import math
        return math.pi * self.r ** 2

class Rect(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h
    def area(self):
        return self.w * self.h

c = Circle(3)
r = Rect(4, 5)
print(f"  圆: {c.describe()}")
print(f"  矩形: {r.describe()}")
# s = Shape()  # 报错，不能实例化抽象类

# 5. OOP总结
print("\\n" + "=" * 60)
print("📚 Python OOP 总结")
print("=" * 60)
print("""
  基础: class, __init__, self, 属性, 方法
  三大特性: 封装(_/__/property), 继承(super/MRO), 多态(鸭子类型)
  魔术方法: __str__/__repr__, __len__/__getitem__, __add__, __call__, __enter__/__exit__
  进阶: @classmethod/@staticmethod, @dataclass, 组合>继承, 鸭子类型
  高级: __slots__, 类装饰器, 单例, ABC
""")
`,
  },
];