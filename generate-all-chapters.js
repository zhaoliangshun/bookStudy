const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

const progGuideBatches = [
  {
    group: "计算机与编程入门",
    chapters: [
      { id: "prog-computer-basics", title: "计算机基础：从硬件到软件", icon: "💻" },
      { id: "prog-os-intro", title: "操作系统入门：Windows/macOS/Linux", icon: "🖥️" },
      { id: "prog-what-is-programming", title: "什么是编程：与计算机对话的艺术", icon: "💬" },
      { id: "prog-first-program", title: "编写你的第一个程序：Hello World", icon: "👋" },
      { id: "prog-lang-types", title: "编程语言分类：编译型vs解释型", icon: "📝" },
      { id: "prog-dev-env", title: "搭建开发环境：编辑器、IDE与命令行", icon: "🛠️" },
      { id: "prog-how-code-runs", title: "代码是如何运行的：从源码到执行", icon: "⚙️" },
      { id: "prog-number-systems", title: "数制与编码：二进制、十六进制与ASCII", icon: "🔢" },
    ]
  },
  {
    group: "编程思维与基础概念",
    chapters: [
      { id: "prog-computational-thinking", title: "计算思维：分解、模式识别、抽象、算法", icon: "🧩" },
      { id: "prog-algorithm-intro", title: "算法入门：什么是算法及如何描述", icon: "📋" },
      { id: "prog-flowchart", title: "流程图与伪代码：规划你的程序", icon: "📊" },
      { id: "prog-variables-memory", title: "变量与内存：数据存储的秘密", icon: "📦" },
      { id: "prog-data-types-intro", title: "数据类型概述：数字、文本、布尔值", icon: "🏷️" },
      { id: "prog-operators", title: "运算符：算术、比较、逻辑运算", icon: "➕" },
      { id: "prog-expressions", title: "表达式与语句：构建程序的积木", icon: "🧱" },
      { id: "prog-input-output", title: "输入与输出：程序与用户的交互", icon: "🔄" },
    ]
  },
  {
    group: "控制流与逻辑",
    chapters: [
      { id: "prog-conditional", title: "条件语句：if/else/switch做出决策", icon: "🔀" },
      { id: "prog-boolean-logic", title: "布尔逻辑：与、或、非及真值表", icon: "✅" },
      { id: "prog-loops-intro", title: "循环入门：重复执行的力量", icon: "🔁" },
      { id: "prog-for-loop", title: "for循环：确定次数的重复", icon: "➰" },
      { id: "prog-while-loop", title: "while循环：条件驱动的重复", icon: "🔂" },
      { id: "prog-loop-control", title: "循环控制：break、continue与嵌套", icon: "⏭️" },
      { id: "prog-nested-logic", title: "嵌套逻辑：复杂条件的组织", icon: "🪆" },
      { id: "prog-debugging-logic", title: "逻辑调试：发现并修复逻辑错误", icon: "🐛" },
    ]
  },
  {
    group: "函数与模块化",
    chapters: [
      { id: "prog-functions-intro", title: "函数入门：封装可重用的代码", icon: "📦" },
      { id: "prog-params-return", title: "参数与返回值：函数的输入输出", icon: "📥" },
      { id: "prog-scope", title: "作用域：变量的可见性与生命周期", icon: "🔍" },
      { id: "prog-recursion", title: "递归入门：函数调用自身", icon: "🔄" },
      { id: "prog-modules", title: "模块化编程：组织大型代码库", icon: "📚" },
      { id: "prog-builtin-functions", title: "内置函数与标准库：不要重复造轮子", icon: "🏭" },
      { id: "prog-error-handling", title: "错误处理基础：预防和处理异常", icon: "⚠️" },
      { id: "prog-code-organization", title: "代码组织原则：高内聚低耦合", icon: "🗂️" },
    ]
  },
  {
    group: "数据结构基础",
    chapters: [
      { id: "prog-arrays-lists", title: "数组与列表：有序数据的集合", icon: "📋" },
      { id: "prog-strings-deep", title: "字符串深入：文本处理技术", icon: "📝" },
      { id: "prog-dictionaries", title: "字典/映射：键值对存储", icon: "📖" },
      { id: "prog-sets", title: "集合：唯一元素的无序集", icon: "🎯" },
      { id: "prog-tuples", title: "元组与不可变数据", icon: "🔒" },
      { id: "prog-data-structure-choice", title: "如何选择合适的数据结构", icon: "❓" },
      { id: "prog-stack-queue", title: "栈与队列：后进先出与先进先出", icon: "📚" },
      { id: "prog-big-o-intro", title: "时间复杂度入门：Big O表示法", icon: "⏱️" },
    ]
  },
  {
    group: "面向对象编程",
    chapters: [
      { id: "prog-oop-intro", title: "面向对象编程：思想与概念", icon: "🏛️" },
      { id: "prog-classes-objects", title: "类与对象：创建自定义类型", icon: "🏗️" },
      { id: "prog-attributes-methods", title: "属性与方法：对象的特征与行为", icon: "⚙️" },
      { id: "prog-encapsulation", title: "封装：隐藏实现细节", icon: "📦" },
      { id: "prog-inheritance", title: "继承：代码复用的层级", icon: "🧬" },
      { id: "prog-polymorphism", title: "多态：统一接口不同实现", icon: "🎭" },
      { id: "prog-composition", title: "组合vs继承：has-a与is-a", icon: "🧩" },
      { id: "prog-oop-pitfalls", title: "面向对象常见误区", icon: "⚠️" },
    ]
  },
  {
    group: "函数式编程与高级概念",
    chapters: [
      { id: "prog-fp-intro", title: "函数式编程入门：纯函数与不可变性", icon: "λ" },
      { id: "prog-higher-order", title: "高阶函数：函数作为参数和返回值", icon: "🎢" },
      { id: "prog-lambda", title: "匿名函数与Lambda表达式", icon: "⚡" },
      { id: "prog-map-filter-reduce", title: "map/filter/reduce：数据转换三件套", icon: "🔄" },
      { id: "prog-closures", title: "闭包：函数与环境的绑定", icon: "🔐" },
      { id: "prog-decorators", title: "装饰器模式：增强函数功能", icon: "🎁" },
      { id: "prog-iterators-generators", title: "迭代器与生成器：惰性序列", icon: "🌊" },
      { id: "prog-paradigm-compare", title: "编程范式对比：命令式vs声明式", icon: "⚖️" },
    ]
  },
  {
    group: "调试、测试与代码质量",
    chapters: [
      { id: "prog-debugging-skills", title: "调试技巧：系统化排查问题", icon: "🔍" },
      { id: "prog-debugger-tools", title: "调试器使用：断点、监视与调用栈", icon: "🛠️" },
      { id: "prog-unit-testing", title: "单元测试：验证代码正确性", icon: "🧪" },
      { id: "prog-test-driven", title: "测试驱动开发TDD入门", icon: "🔴" },
      { id: "prog-code-review", title: "代码审查：提升代码质量的最佳实践", icon: "👀" },
      { id: "prog-refactoring", title: "重构：改善既有代码的设计", icon: "♻️" },
      { id: "prog-code-smells", title: "代码坏味道：识别需要改进的代码", icon: "👃" },
      { id: "prog-documentation", title: "代码文档：为什么写以及如何写", icon: "📄" },
    ]
  },
  {
    group: "工程实践与工具",
    chapters: [
      { id: "prog-git-intro", title: "Git入门：版本控制基础", icon: "📚" },
      { id: "prog-git-advanced", title: "Git进阶：分支、合并与冲突解决", icon: "🌿" },
      { id: "prog-command-line", title: "命令行基础：高效使用终端", icon: "⌨️" },
      { id: "prog-regex-intro", title: "正则表达式入门：文本模式匹配", icon: "🔍" },
      { id: "prog-network-basics", title: "网络基础：HTTP、TCP/IP与Web", icon: "🌐" },
      { id: "prog-database-intro", title: "数据库基础：SQL与数据持久化", icon: "🗄️" },
      { id: "prog-api-intro", title: "API入门：REST与接口设计", icon: "🔌" },
      { id: "prog-package-managers", title: "包管理器：依赖管理艺术", icon: "📦" },
    ]
  },
  {
    group: "程序员成长与职业发展",
    chapters: [
      { id: "prog-learning-method", title: "高效学习编程的方法与路径", icon: "📚" },
      { id: "prog-write-good-code", title: "如何写出好代码：整洁代码原则", icon: "✨" },
      { id: "prog-naming", title: "命名的艺术：变量、函数与类", icon: "🏷️" },
      { id: "prog-problem-solving", title: "编程问题解决方法论", icon: "🧩" },
      { id: "prog-self-cultivation", title: "程序员的自我修养：持续学习", icon: "🌱" },
      { id: "prog-collaboration", title: "团队协作：沟通与协作技巧", icon: "🤝" },
      { id: "prog-career-path", title: "程序员职业发展路径规划", icon: "🗺️" },
      { id: "prog-avoid-burnout", title: "避免倦怠：保持编程热情", icon: "🔥" },
    ]
  }
];

const pyDefinitiveBatches = [
  {
    group: "Python入门与环境",
    chapters: [
      { id: "py-what-is-python", title: "Python是什么：历史、特点与定位", icon: "🐍" },
      { id: "py-install-setup", title: "Python安装与环境配置：Windows/macOS/Linux", icon: "⚙️" },
      { id: "py-interpreter", title: "Python解释器详解：CPython、IPython、PyPy", icon: "🖥️" },
      { id: "py-first-script", title: "编写第一个Python脚本：从Hello World开始", icon: "👋" },
      { id: "py-virtualenv", title: "虚拟环境：venv、virtualenv、conda对比", icon: "📦" },
      { id: "py-pip", title: "pip包管理：安装、卸载、依赖管理", icon: "📥" },
      { id: "py-ide-setup", title: "IDE与编辑器：VS Code、PyCharm配置指南", icon: "🛠️" },
      { id: "py-interactive-mode", title: "交互式模式与REPL：快速实验Python代码", icon: "💻" },
    ]
  },
  {
    group: "数据类型基础",
    chapters: [
      { id: "py-dynamic-typing", title: "动态类型系统：类型是什么以及如何工作", icon: "🏷️" },
      { id: "py-variables", title: "变量与引用：Python变量的本质", icon: "📦" },
      { id: "py-numbers", title: "数字类型：int、float、complex详解", icon: "🔢" },
      { id: "py-numeric-ops", title: "数值运算与数学函数：math模块实战", icon: "➕" },
      { id: "py-bool", title: "布尔类型与真值测试：什么是真什么是假", icon: "✅" },
      { id: "py-none", title: "None类型：空值的正确使用", icon: "∅" },
      { id: "py-type-conversion", title: "类型转换：隐式转换与显式转换", icon: "🔄" },
      { id: "py-immutability", title: "可变性vs不可变性：理解Python对象模型", icon: "🔒" },
    ]
  },
  {
    group: "字符串与文本处理",
    chapters: [
      { id: "py-strings-basics", title: "字符串基础：创建、访问与切片", icon: "📝" },
      { id: "py-string-methods", title: "字符串方法大全：常用方法分类详解", icon: "📚" },
      { id: "py-string-formatting", title: "字符串格式化：%、format、f-string对比", icon: "🎨" },
      { id: "py-f-strings", title: "f-string详解：Python 3.6+推荐写法", icon: "✨" },
      { id: "py-unicode", title: "Unicode与编码：彻底解决乱码问题", icon: "🌐" },
      { id: "py-regex", title: "正则表达式：re模块完整指南", icon: "🔍" },
      { id: "py-string-practice", title: "文本处理实战：常见任务与技巧", icon: "💪" },
      { id: "py-bytes", title: "bytes与bytearray：二进制数据处理", icon: "🔢" },
    ]
  },
  {
    group: "列表与元组",
    chapters: [
      { id: "py-lists-basics", title: "列表基础：创建、访问、修改", icon: "📋" },
      { id: "py-list-methods", title: "列表方法详解：append、extend、insert等", icon: "⚙️" },
      { id: "py-list-slicing", title: "列表切片：高级用法与技巧", icon: "✂️" },
      { id: "py-list-comprehensions", title: "列表推导式：优雅的数据转换", icon: "🎯" },
      { id: "py-list-sorting", title: "排序：sort、sorted与自定义排序", icon: "📊" },
      { id: "py-tuples", title: "元组：不可变序列的使用场景", icon: "🔒" },
      { id: "py-namedtuple", title: "namedtuple：轻量级数据对象", icon: "🏷️" },
      { id: "py-sequence-protocol", title: "序列协议：实现自定义序列类型", icon: "📜" },
    ]
  },
  {
    group: "字典与集合",
    chapters: [
      { id: "py-dicts-basics", title: "字典基础：键值对存储与访问", icon: "📖" },
      { id: "py-dict-methods", title: "字典方法：get、items、keys、values", icon: "🔑" },
      { id: "py-dict-comprehensions", title: "字典推导式：快速构建字典", icon: "🎨" },
      { id: "py-defaultdict", title: "defaultdict与Counter：collections模块精选", icon: "📊" },
      { id: "py-ordereddict", title: "有序字典与字典视图：Python 3.7+特性", icon: "📋" },
      { id: "py-sets", title: "集合：set与frozenset使用指南", icon: "🎯" },
      { id: "py-set-operations", title: "集合运算：交集、并集、差集、对称差", icon: "⚡" },
      { id: "py-hashable", title: "可哈希对象：什么可以作为字典键", icon: "🔐" },
    ]
  },
  {
    group: "控制流",
    chapters: [
      { id: "py-if-else", title: "条件语句：if、elif、else详解", icon: "🔀" },
      { id: "py-match-case", title: "match-case模式匹配：Python 3.10+新特性", icon: "🎯" },
      { id: "py-for-loops", title: "for循环与迭代：遍历一切可迭代对象", icon: "🔁" },
      { id: "py-while-loops", title: "while循环：条件循环与无限循环", icon: "🔂" },
      { id: "py-loop-control", title: "循环控制：break、continue、else子句", icon: "⏭️" },
      { id: "py-itertools", title: "itertools模块：高效迭代器工具", icon: "🔧" },
      { id: "py-enumerate-zip", title: "enumerate、zip、range：常用内置函数", icon: "📦" },
      { id: "py-unpacking", title: "解包操作：*和**的高级用法", icon: "📤" },
    ]
  },
  {
    group: "函数基础",
    chapters: [
      { id: "py-functions-def", title: "函数定义与调用：def语句详解", icon: "📦" },
      { id: "py-parameters", title: "函数参数：位置参数、关键字参数、默认值", icon: "📥" },
      { id: "py-args-kwargs", title: "*args与**kwargs：可变参数详解", icon: "🎒" },
      { id: "py-return-values", title: "返回值：return、多返回值与None", icon: "📤" },
      { id: "py-lambda", title: "lambda表达式：匿名函数的正确使用", icon: "⚡" },
      { id: "py-scope-rules", title: "作用域规则：LEGB规则详解", icon: "🔍" },
      { id: "py-docstrings", title: "文档字符串：编写规范的函数文档", icon: "📄" },
      { id: "py-type-hints-basics", title: "类型提示入门：typing模块基础", icon: "🏷️" },
    ]
  },
  {
    group: "函数进阶",
    chapters: [
      { id: "py-first-class", title: "一等函数：函数作为参数和返回值", icon: "🎢" },
      { id: "py-closures", title: "闭包：函数与数据的绑定", icon: "🔐" },
      { id: "py-decorators-basics", title: "装饰器基础：增强函数功能", icon: "🎁" },
      { id: "py-decorators-advanced", title: "装饰器进阶：带参数装饰器、类装饰器", icon: "✨" },
      { id: "py-functools", title: "functools模块：wraps、lru_cache等", icon: "🔧" },
      { id: "py-generators", title: "生成器：yield关键字与惰性求值", icon: "🌊" },
      { id: "py-generator-expressions", title: "生成器表达式：节省内存的迭代", icon: "💾" },
      { id: "py-coroutines-basics", title: "协程基础：yield from与send", icon: "🔄" },
    ]
  },
  {
    group: "面向对象基础",
    chapters: [
      { id: "py-classes-basics", title: "类与对象：class语句详解", icon: "🏗️" },
      { id: "py-init-self", title: "__init__方法与self：对象初始化", icon: "🌱" },
      { id: "py-instance-class-methods", title: "实例方法、类方法、静态方法", icon: "⚙️" },
      { id: "py-attributes", title: "属性访问：实例属性与类属性", icon: "📋" },
      { id: "py-properties", title: "property：属性装饰器实现", icon: "🏷️" },
      { id: "py-encapsulation", title: "封装：单下划线、双下划线与访问控制", icon: "📦" },
      { id: "py-inheritance-basics", title: "继承基础：代码复用机制", icon: "🧬" },
      { id: "py-super", title: "super()函数：调用父类方法", icon: "⬆️" },
    ]
  },
  {
    group: "面向对象进阶",
    chapters: [
      { id: "py-multiple-inheritance", title: "多继承与MRO：方法解析顺序", icon: "🔀" },
      { id: "py-polymorphism", title: "多态与鸭子类型：Python的灵活性", icon: "🦆" },
      { id: "py-magic-methods", title: "魔术方法：__str__、__repr__、__len__等", icon: "✨" },
      { id: "py-operator-overloading", title: "运算符重载：__add__、__eq__等", icon: "➕" },
      { id: "py-descriptors", title: "描述符：property、classmethod背后的机制", icon: "🔬" },
      { id: "py-metaclasses", title: "元类：类的类与自定义类创建", icon: "🎭" },
      { id: "py-data-classes", title: "dataclass：Python 3.7+数据类", icon: "📊" },
      { id: "py-abc", title: "抽象基类：ABC与接口设计", icon: "📜" },
    ]
  },
  {
    group: "模块、包与异常",
    chapters: [
      { id: "py-modules", title: "模块系统：import语句详解", icon: "📚" },
      { id: "py-packages", title: "包与__init__.py：组织大型项目", icon: "📦" },
      { id: "py-relative-imports", title: "相对导入与绝对导入：正确选择", icon: "🔗" },
      { id: "py-standard-library", title: "标准库概览：常用模块速查", icon: "📖" },
      { id: "py-exceptions-basics", title: "异常处理基础：try/except/finally", icon: "⚠️" },
      { id: "py-exceptions-advanced", title: "异常进阶：自定义异常、异常链", icon: "🔥" },
      { id: "py-exception-groups", title: "ExceptionGroup：Python 3.11+异常组", icon: "📚" },
      { id: "py-context-managers", title: "上下文管理器：with语句与__enter__/__exit__", icon: "🔐" },
    ]
  },
  {
    group: "文件IO与标准库",
    chapters: [
      { id: "py-file-io", title: "文件读写：open函数与文件对象", icon: "📄" },
      { id: "py-file-modes", title: "文件模式：文本模式vs二进制模式", icon: "🔢" },
      { id: "py-pathlib", title: "pathlib：面向对象的路径操作", icon: "🛤️" },
      { id: "py-os-sys", title: "os与sys模块：系统交互", icon: "🖥️" },
      { id: "py-json-csv", title: "JSON与CSV处理：json、csv模块", icon: "📊" },
      { id: "py-datetime", title: "日期与时间：datetime模块详解", icon: "📅" },
      { id: "py-collections", title: "collections模块：deque、ChainMap等", icon: "📚" },
      { id: "py-logging", title: "日志记录：logging模块最佳实践", icon: "📝" },
    ]
  },
  {
    group: "并发编程",
    chapters: [
      { id: "py-concurrency-intro", title: "并发vs并行：概念与区别", icon: "🔀" },
      { id: "py-threading", title: "多线程：threading模块", icon: "🧵" },
      { id: "py-thread-sync", title: "线程同步：Lock、RLock、Condition", icon: "🔒" },
      { id: "py-multiprocessing", title: "多进程：multiprocessing模块", icon: "⚙️" },
      { id: "py-process-pool", title: "进程池与线程池：concurrent.futures", icon: "🏊" },
      { id: "py-asyncio-basics", title: "asyncio基础：async/await入门", icon: "⚡" },
      { id: "py-asyncio-advanced", title: "asyncio进阶：Task、Future、事件循环", icon: "🔄" },
      { id: "py-gil", title: "GIL全局解释器锁：影响与应对", icon: "🔐" },
    ]
  },
  {
    group: "高级特性与元编程",
    chapters: [
      { id: "py-decorator-patterns", title: "装饰器设计模式：实际应用场景", icon: "🎁" },
      { id: "py-metaprogramming", title: "元编程：动态创建代码", icon: "🔮" },
      { id: "py-class-decorators", title: "类装饰器与装饰器类", icon: "🏛️" },
      { id: "py-slots", title: "__slots__：内存优化与属性限制", icon: "💾" },
      { id: "py-weakref", title: "弱引用：weakref模块与循环引用", icon: "🔗" },
      { id: "py-copy", title: "拷贝：浅拷贝vs深拷贝", icon: "📋" },
      { id: "py-memory-management", title: "内存管理：引用计数与垃圾回收", icon: "🗑️" },
      { id: "py-c-extensions", title: "C扩展入门：ctypes、cffi、Cython", icon: "🔧" },
    ]
  },
  {
    group: "最佳实践与新特性",
    chapters: [
      { id: "py-pep8", title: "PEP 8代码风格：Python风格指南", icon: "📏" },
      { id: "py-pythonic", title: "Pythonic代码：地道的Python写法", icon: "✨" },
      { id: "py-type-hints-advanced", title: "类型提示进阶：泛型、Protocol、TypeVar", icon: "🏷️" },
      { id: "py-mypy", title: "mypy静态类型检查：类型安全", icon: "🔍" },
      { id: "py-testing", title: "单元测试：pytest框架实战", icon: "🧪" },
      { id: "py-debugging", title: "调试技巧：pdb、日志与IDE调试", icon: "🐛" },
      { id: "py-performance", title: "性能优化：profile、cProfile与优化技巧", icon: "⚡" },
      { id: "py-new-features", title: "Python新特性：3.10-3.12版本特性总结", icon: "🚀" },
    ]
  }
];

function generateProgContent(chapter) {
  return `# ${chapter.title}\n\n## 一、概述\n\n${chapter.title}是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习${chapter.title}的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。\n\n学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。\n\n## 二、核心概念详解\n\n### 2.1 什么是${chapter.title}？\n\n在深入学习之前，让我们先理解${chapter.title}的本质。${chapter.title}是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。\n\n想象一下，如果你要盖一栋房子：\n\n| 编程概念 | 建筑类比 | 作用 |\n|---------|---------|------|\n| 变量 | 建筑材料 | 存储数据 |\n| 函数 | 预制构件 | 封装功能 |\n| 控制流 | 施工图纸 | 决定执行顺序 |\n| 数据结构 | 房间布局 | 组织数据 |\n| ${chapter.title} | 核心建筑工艺 | 特定问题解决方案 |\n\n### 2.2 为什么需要${chapter.title}？\n\n在${chapter.title}出现之前，程序员面临着很多问题：\n\n1. **代码重复**：相同的逻辑需要在多处重复编写\n2. **难以维护**：代码结构混乱，修改一处可能影响多处\n3. **容易出错**：缺乏系统化的方法，bug频发\n4. **协作困难**：没有统一的范式，团队成员代码风格各异\n\n${chapter.title}正是为了解决这些问题而产生的。\n\n## 三、实战代码示例\n\n### 3.1 基础示例\n\n让我们从最简单的例子开始：\n\n\`\`\`javascript\n// 示例1：基础用法\nfunction demonstrate${chapter.id.replace(/-/g, '_')}(data) {\n    // 第一步：验证输入\n    if (!data) {\n        throw new Error('输入数据不能为空');\n    }\n    \n    // 第二步：处理数据\n    const result = processData(data);\n    \n    // 第三步：返回结果\n    return result;\n}\n\nfunction processData(data) {\n    // 具体的处理逻辑\n    return data.map(item => ({\n        ...item,\n        processed: true,\n        timestamp: Date.now()\n    }));\n}\n\n// 使用示例\nconst testData = [\n    { id: 1, name: '示例1' },\n    { id: 2, name: '示例2' }\n];\n\nconst results = demonstrate${chapter.id.replace(/-/g, '_')}(testData);\nconsole.log('处理结果:', results);\n\`\`\`\n\n### 3.2 进阶示例\n\n下面是一个更贴近实际开发的例子：\n\n\`\`\`javascript\n// 示例2：实际应用场景\nclass ${chapter.id.replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase())}Example {\n    constructor(options = {}) {\n        this.options = {\n            debug: false,\n            maxRetries: 3,\n            timeout: 5000,\n            ...options\n        };\n        this.cache = new Map();\n    }\n    \n    async execute(input) {\n        const cacheKey = this.generateCacheKey(input);\n        \n        // 检查缓存\n        if (this.cache.has(cacheKey)) {\n            this.log('从缓存返回结果');\n            return this.cache.get(cacheKey);\n        }\n        \n        // 重试逻辑\n        let lastError;\n        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {\n            try {\n                this.log(\`尝试第 \${attempt} 次执行\`);\n                const result = await this.doExecute(input);\n                this.cache.set(cacheKey, result);\n                return result;\n            } catch (error) {\n                lastError = error;\n                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);\n                await this.delay(1000 * attempt);\n            }\n        }\n        \n        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);\n    }\n    \n    async doExecute(input) {\n        // 实际的执行逻辑\n        return { success: true, data: input };\n    }\n    \n    generateCacheKey(input) {\n        return JSON.stringify(input);\n    }\n    \n    log(message) {\n        if (this.options.debug) {\n            console.log(\`[${chapter.title}] \${message}\`);\n        }\n    }\n    \n    delay(ms) {\n        return new Promise(resolve => setTimeout(resolve, ms));\n    }\n}\n\`\`\`\n\n### 3.3 Python示例\n\n如果你更熟悉Python，这里是对应的例子：\n\n\`\`\`python\n# Python示例\nfrom typing import Any, Dict, List, Optional\nimport time\nimport functools\n\n\ndef timer(func):\n    \"\"\"装饰器：测量函数执行时间\"\"\"\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        try:\n            result = func(*args, **kwargs)\n            return result\n        finally:\n            elapsed = time.time() - start\n            print(f\"{func.__name__} 执行时间: {elapsed:.4f}秒\")\n    return wrapper\n\n\nclass DataProcessor:\n    \"\"\"数据处理器 - 演示${chapter.title}\"\"\"\n    \n    def __init__(self, config: Optional[Dict[str, Any]] = None):\n        self.config = config or {}\n        self._cache: Dict[str, Any] = {}\n    \n    @timer\n    def process(self, items: List[Any]) -> List[Any]:\n        \"\"\"处理数据列表\"\"\"\n        results = []\n        for item in items:\n            processed = self._process_single(item)\n            results.append(processed)\n        return results\n    \n    def _process_single(self, item: Any) -> Any:\n        \"\"\"处理单个数据项\"\"\"\n        cache_key = str(item)\n        if cache_key in self._cache:\n            return self._cache[cache_key]\n        \n        # 处理逻辑\n        result = {\n            'original': item,\n            'processed': True,\n            'length': len(str(item)) if hasattr(item, '__len__') else 0\n        }\n        \n        self._cache[cache_key] = result\n        return result\n\n\n# 使用示例\nif __name__ == '__main__':\n    processor = DataProcessor()\n    data = ['apple', 'banana', 'cherry', 'date']\n    results = processor.process(data)\n    \n    for item in results:\n        print(f\"原始: {item['original']:10} 长度: {item['length']}\")\n\n\`\`\`\n\n## 四、常见陷阱与注意事项\n\n### 4.1 新手常犯的错误\n\n| 错误类型 | 错误示例 | 正确做法 |\n|---------|---------|---------|\n| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |\n| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |\n| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |\n| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |\n| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |\n\n### 4.2 需要特别注意的点\n\n1. **可变默认参数问题**（Python）\n\n\`\`\`python\n# ❌ 错误：可变默认参数\ndef append_to(item, target=[]):\n    target.append(item)\n    return target\n\n# ✅ 正确：使用None作为默认值\ndef append_to(item, target=None):\n    if target is None:\n        target = []\n    target.append(item)\n    return target\n\`\`\`\n\n2. **浮点数精度问题**\n\n\`\`\`javascript\n// ❌ 错误：直接比较浮点数\nconsole.log(0.1 + 0.2 === 0.3); // false\n\n// ✅ 正确：使用精度范围比较\nfunction nearlyEqual(a, b, epsilon = 1e-10) {\n    return Math.abs(a - b) < epsilon;\n}\n\`\`\`\n\n3. **异步代码陷阱**\n\n\`\`\`javascript\n// ❌ 错误：在循环中使用await（可以但需理解行为）\n// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all\n\n// ✅ 并行执行\nconst results = await Promise.all(\n    items.map(item => processItem(item))\n);\n\n\`\`\`\n\n## 五、最佳实践\n\n### 5.1 编码原则\n\n**SOLID原则（面向对象）：**\n\n| 原则 | 全称 | 含义 |\n|-----|------|------|\n| S | 单一职责原则 | 一个类只做一件事 |\n| O | 开闭原则 | 对扩展开放，对修改关闭 |\n| L | 里氏替换原则 | 子类可以替换父类 |\n| I | 接口隔离原则 | 使用小而专一的接口 |\n| D | 依赖倒置原则 | 依赖抽象而非具体实现 |\n\n**通用编程原则：**\n\n1. **KISS原则** - Keep It Simple, Stupid\n   - 保持简单直接，不要过度设计\n   - 如果有两个方案，选择简单的那个\n\n2. **DRY原则** - Don't Repeat Yourself\n   - 任何重复的代码都应该提取出来\n   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好\n\n3. **YAGNI原则** - You Aren't Gonna Need It\n   - 不要实现你认为将来可能需要的功能\n   - 只实现当前确实需要的功能\n\n### 5.2 代码风格建议\n\n\`\`\`javascript\n// ✅ 好的代码风格示例\nfunction calculateTotalPrice(items, taxRate = 0.1) {\n    // 验证输入\n    if (!Array.isArray(items)) {\n        throw new TypeError('items必须是数组');\n    }\n    \n    // 计算小计\n    const subtotal = items.reduce((sum, item) => {\n        if (typeof item.price !== 'number' || item.price < 0) {\n            throw new Error('无效的商品价格');\n        }\n        return sum + item.price * (item.quantity || 1);\n    }, 0);\n    \n    // 计算税费和总价\n    const tax = subtotal * taxRate;\n    const total = subtotal + tax;\n    \n    // 返回结果（使用对象而不是多个返回值）\n    return {\n        subtotal: roundToTwo(subtotal),\n        tax: roundToTwo(tax),\n        total: roundToTwo(total)\n    };\n}\n\nfunction roundToTwo(value) {\n    return Math.round(value * 100) / 100;\n}\n\n\`\`\`\n\n## 六、实战练习\n\n### 练习1：基础应用\n\n**题目：** 实现一个简单的待办事项管理器，需要支持：\n- 添加待办事项\n- 标记完成/未完成\n- 删除待办\n- 筛选显示（全部/已完成/未完成）\n\n**提示：**\n- 使用合适的数据结构存储待办事项\n- 考虑使用面向对象或函数式风格\n- 添加适当的错误处理\n\n### 练习2：进阶挑战\n\n**题目：** 实现一个简单的缓存系统，需要：\n- 支持设置过期时间\n- LRU（最近最少使用）淘汰策略\n- 最大容量限制\n- 统计命中率\n\n### 练习3：代码审查\n\n找出下面代码的问题并重构：\n\n\`\`\`javascript\n// 这段代码有什么问题？\nfunction process(data) {\n    var result = [];\n    for (var i = 0; i < data.length; i++) {\n        if (data[i].active) {\n            if (data[i].score > 60) {\n                result.push(data[i].name + ':' + data[i].score);\n            }\n        }\n    }\n    return result;\n}\n\`\`\`\n\n**参考答案要点：**\n- 使用const/let替代var\n- 使用有意义的变量名\n- 提前返回减少嵌套\n- 使用filter/map替代for循环\n- 添加类型检查\n- 添加注释\n\n## 七、小结\n\n${chapter.title}是编程学习道路上的重要里程碑。掌握本章内容后，你应该：\n\n✅ 理解${chapter.title}的核心概念和原理\n✅ 能够在实际代码中正确应用${chapter.title}\n✅ 知道常见的陷阱以及如何避免\n✅ 了解相关的最佳实践\n✅ 能够写出更清晰、更健壮的代码\n\n记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。\n\n### 下一步学习建议\n\n1. **动手实践**：找一个小项目来练习本章内容\n2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的\n3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码\n4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式\n5. **持续学习**：编程世界日新月异，保持好奇心和学习热情\n\n---\n\n**拓展阅读推荐：**\n- 《代码整洁之道》- Robert C. Martin\n- 《重构：改善既有代码的设计》- Martin Fowler\n- 《设计模式》- GoF\n- 《程序员修炼之道》- Hunt & Thomas\n\n祝你编程学习之旅愉快！🚀\n`;
}

function generatePyContent(chapter) {
  return `# ${chapter.title}\n\n## 一、概述\n\n${chapter.title}是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨${chapter.title}的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。\n\nPython的设计哲学是「优雅」「明确」「简单」。在学习${chapter.title}的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。\n\n## 二、核心概念与底层原理\n\n### 2.1 Python数据模型\n\n在深入${chapter.title}之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。\n\n\`\`\`python\n# 验证：一切皆对象\nprint(type(42))           # <class 'int'>\nprint(type("hello"))      # <class 'str'>\nprint(type([1, 2, 3]))   # <class 'list'>\nprint(type(print))        # <class 'builtin_function_or_method'>\nprint(type(type))         # <class 'type'>\n\n# 甚至类也是type的实例\nclass MyClass:\n    pass\n\nprint(type(MyClass))      # <class 'type'>\n\n\`\`\`\n\n### 2.2 ${chapter.title}的本质\n\n${chapter.title}在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：\n\n\`\`\`python\n# 探索对象的属性和方法\nclass Example:\n    \"\"\"示例类，用于演示${chapter.title}\"\"\"\n    \n    def __init__(self, value):\n        self.value = value\n    \n    def __repr__(self):\n        return f\"Example({self.value!r})\"\n\n\nex = Example(42)\n\n# 查看所有特殊方法和属性\nprint("特殊方法列表:")\nfor attr in dir(ex):\n    if attr.startswith('__') and attr.endswith('__'):\n        print(f\"  {attr}\")\n\n\`\`\`\n\n### 2.3 内存模型与引用\n\n理解Python的内存管理对于掌握${chapter.title}至关重要：\n\n\`\`\`python\nimport sys\n\n# 查看对象的内存占用\nvalues = [\n    None,\n    True,\n    False,\n    42,\n    3.14,\n    "hello",\n    [],\n    {},\n]\n\nprint("各对象内存占用（字节）:")\nfor v in values:\n    print(f\"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes\")\n\n# 引用计数演示\nimport ctypes\n\ndef ref_count(obj):\n    return ctypes.c_long.from_address(id(obj)).value\n\na = [1, 2, 3]\nprint(f\"\\n初始引用计数: {ref_count(a)}\")\nb = a\nprint(f\"赋值后引用计数: {ref_count(a)}\")\ndel b\nprint(f\"del后引用计数: {ref_count(a)}\")\n\n\`\`\`\n\n## 三、详尽代码示例\n\n### 3.1 基础用法详解\n\n\`\`\`python\n\"\"\"\n${chapter.title} - 基础用法演示\n\"\"\"\nfrom typing import Any, Callable, Dict, List, Optional, Tuple, Union\nfrom dataclasses import dataclass, field\nfrom abc import ABC, abstractmethod\nimport time\nimport functools\nimport logging\n\n# 配置日志\nlogging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')\nlogger = logging.getLogger(__name__)\n\n\nclass BaseProcessor(ABC):\n    \"\"\"处理器抽象基类\"\"\"\n    \n    @abstractmethod\n    def process(self, data: Any) -> Any:\n        \"\"\"处理数据\"\"\"\n        pass\n    \n    def validate(self, data: Any) -> bool:\n        \"\"\"验证数据\"\"\"\n        return data is not None\n\n\n@dataclass\nclass ProcessingResult:\n    \"\"\"处理结果数据类\"\"\"\n    success: bool\n    data: Any = None\n    error: Optional[str] = None\n    execution_time: float = 0.0\n    metadata: Dict[str, Any] = field(default_factory=dict)\n\n\nclass ${chapter.id.replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase())}Processor(BaseProcessor):\n    \"\"\"${chapter.title}处理器 - 完整实现示例\"\"\"\n    \n    def __init__(\n        self,\n        config: Optional[Dict[str, Any]] = None,\n        on_complete: Optional[Callable[[ProcessingResult], None]] = None\n    ):\n        self.config = {\n            'max_retries': 3,\n            'timeout': 30,\n            'cache_enabled': True,\n            'debug': False,\n            **(config or {})\n        }\n        self._cache: Dict[str, Any] = {}\n        self._on_complete = on_complete\n        self._call_count = 0\n    \n    def process(self, data: Any) -> ProcessingResult:\n        \"\"\"\n        处理数据的主方法\n        \n        Args:\n            data: 输入数据\n            \n        Returns:\n            ProcessingResult: 处理结果\n        \"\"\"\n        start_time = time.time()\n        self._call_count += 1\n        \n        try:\n            # 1. 验证输入\n            if not self.validate(data):\n                raise ValueError(\"输入数据验证失败\")\n            \n            # 2. 检查缓存\n            cache_key = self._make_cache_key(data)\n            if self.config['cache_enabled'] and cache_key in self._cache:\n                logger.debug(f\"缓存命中: {cache_key}\")\n                cached = self._cache[cache_key]\n                return ProcessingResult(\n                    success=True,\n                    data=cached,\n                    execution_time=time.time() - start_time,\n                    metadata={'cached': True, 'call_number': self._call_count}\n                )\n            \n            # 3. 重试逻辑\n            result_data = None\n            last_error = None\n            \n            for attempt in range(1, self.config['max_retries'] + 1):\n                try:\n                    logger.debug(f\"尝试第 {attempt} 次处理\")\n                    result_data = self._do_process(data)\n                    break\n                except Exception as e:\n                    last_error = e\n                    logger.warning(f\"第 {attempt} 次尝试失败: {e}\")\n                    if attempt < self.config['max_retries']:\n                        time.sleep(0.1 * attempt)\n            \n            if last_error and result_data is None:\n                raise last_error\n            \n            # 4. 缓存结果\n            if self.config['cache_enabled']:\n                self._cache[cache_key] = result_data\n            \n            result = ProcessingResult(\n                success=True,\n                data=result_data,\n                execution_time=time.time() - start_time,\n                metadata={\n                    'cached': False,\n                    'call_number': self._call_count,\n                    'cache_size': len(self._cache)\n                }\n            )\n            \n        except Exception as e:\n            logger.error(f\"处理失败: {e}\", exc_info=self.config['debug'])\n            result = ProcessingResult(\n                success=False,\n                error=str(e),\n                execution_time=time.time() - start_time,\n                metadata={'call_number': self._call_count}\n            )\n        \n        # 回调通知\n        if self._on_complete:\n            try:\n                self._on_complete(result)\n            except Exception as e:\n                logger.warning(f\"回调执行失败: {e}\")\n        \n        return result\n    \n    def _do_process(self, data: Any) -> Any:\n        \"\"\"\n        实际处理逻辑（子类可重写）\n        \n        这里演示${chapter.title}的核心处理逻辑\n        \"\"\"\n        if isinstance(data, list):\n            return self._process_list(data)\n        elif isinstance(data, dict):\n            return self._process_dict(data)\n        elif isinstance(data, str):\n            return self._process_string(data)\n        else:\n            return data\n    \n    def _process_list(self, items: List[Any]) -> List[Any]:\n        \"\"\"处理列表数据\"\"\"\n        return [self._process_single(item) for item in items if item is not None]\n    \n    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"处理字典数据\"\"\"\n        return {\n            key: self._process_single(value)\n            for key, value in data.items()\n            if not key.startswith('_')\n        }\n    \n    def _process_string(self, text: str) -> str:\n        \"\"\"处理字符串数据\"\"\"\n        return text.strip().title()\n    \n    def _process_single(self, item: Any) -> Any:\n        \"\"\"处理单个数据项\"\"\"\n        if isinstance(item, (int, float)):\n            return item * 2\n        return item\n    \n    def _make_cache_key(self, data: Any) -> str:\n        \"\"\"生成缓存键\"\"\"\n        try:\n            return str(hash(str(data)))\n        except Exception:\n            return str(id(data))\n    \n    def clear_cache(self) -> None:\n        \"\"\"清空缓存\"\"\"\n        self._cache.clear()\n        logger.info(\"缓存已清空\")\n    \n    @property\n    def stats(self) -> Dict[str, Any]:\n        \"\"\"获取统计信息\"\"\"\n        return {\n            'total_calls': self._call_count,\n            'cache_size': len(self._cache),\n            'config': self.config.copy()\n        }\n\n\ndef timing_decorator(func: Callable) -> Callable:\n    \"\"\"计时装饰器\"\"\"\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        try:\n            result = func(*args, **kwargs)\n            return result\n        finally:\n            elapsed = time.perf_counter() - start\n            logger.info(f\"{func.__name__} 执行时间: {elapsed:.6f}秒\")\n    return wrapper\n\n\n# 使用示例\nif __name__ == '__main__':\n    # 创建处理器\n    processor = ${chapter.id.replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase())}Processor(\n        config={'debug': True, 'max_retries': 2}\n    )\n    \n    # 测试数据\n    test_cases = [\n        \"hello world\",\n        [1, 2, 3, None, 5],\n        {\"name\": \"alice\", \"age\": 25, \"_private\": \"hidden\"},\n        42,\n        None,  # 会触发验证失败\n    ]\n    \n    for i, test_data in enumerate(test_cases, 1):\n        print(f\"\\n{'='*60}\")\n        print(f\"测试用例 {i}: {test_data!r}\")\n        print('='*60)\n        \n        result = processor.process(test_data)\n        \n        print(f\"成功: {result.success}\")\n        print(f\"执行时间: {result.execution_time:.6f}秒\")\n        if result.success:\n            print(f\"结果: {result.data!r}\")\n        else:\n            print(f\"错误: {result.error}\")\n        print(f\"元数据: {result.metadata}\")\n    \n    print(f\"\\n统计信息: {processor.stats}\")\n\n\`\`\`\n\n### 3.2 高级特性演示\n\n\`\`\`python\n\"\"\"\n${chapter.title} - 高级特性\n演示描述符、上下文管理器、元类等高级Python特性\n\"\"\"\nfrom typing import Any\n\n\nclass ValidatedAttribute:\n    \"\"\"描述符：实现属性验证\"\"\"\n    \n    def __init__(self, name: str, validator=None):\n        self.name = name\n        self.validator = validator or (lambda x: True)\n        self.private_name = f'_{name}'\n    \n    def __get__(self, obj: Any, objtype=None):\n        if obj is None:\n            return self\n        return getattr(obj, self.private_name, None)\n    \n    def __set__(self, obj: Any, value: Any):\n        if not self.validator(value):\n            raise ValueError(f'{self.name} 验证失败: {value!r}')\n        setattr(obj, self.private_name, value)\n\n\nclass ${chapter.id.replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase())}ContextManager:\n    \"\"\"上下文管理器示例\"\"\"\n    \n    def __init__(self, name: str):\n        self.name = name\n    \n    def __enter__(self):\n        print(f'进入上下文: {self.name}')\n        self.start_time = time.time()\n        return self\n    \n    def __exit__(self, exc_type, exc_val, exc_tb):\n        elapsed = time.time() - self.start_time\n        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')\n        if exc_type:\n            print(f'发生异常: {exc_type.__name__}: {exc_val}')\n            return False  # 不抑制异常\n        return True\n\n\n# 生成器示例\ndef fibonacci_generator(count: int):\n    \"\"\"斐波那契数列生成器 - 演示惰性求值\"\"\"\n    a, b = 0, 1\n    for _ in range(count):\n        yield a\n        a, b = b, a + b\n\n\n# 使用示例\nif __name__ == '__main__':\n    import time\n    \n    # 生成器使用\n    print(\"斐波那契数列前20项:\")\n    for i, num in enumerate(fibonacci_generator(20)):\n        print(f\"F({i:2d}) = {num:5d}\")\n    \n    # 上下文管理器使用\n    print()\n    with ${chapter.id.replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase())}ContextManager(\"测试\") as ctx:\n        print(\"在上下文中执行操作...\")\n        time.sleep(0.1)\n\n\`\`\`\n\n### 3.3 性能对比与优化\n\n\`\`\`python\n\"\"\"\n${chapter.title} - 性能对比\n展示不同实现方式的性能差异\n\"\"\"\nimport timeit\nimport sys\n\n\ndef benchmark(name, func, number=10000):\n    \"\"\"性能测试工具函数\"\"\"\n    elapsed = timeit.timeit(func, number=number)\n    per_op = elapsed / number * 1_000_000\n    print(f\"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)\")\n\n\n# 演示不同方法的性能差异\nTEST_DATA = list(range(1000))\n\n# 方法1: for循环append\ndef method1_for_loop():\n    result = []\n    for x in TEST_DATA:\n        if x % 2 == 0:\n            result.append(x ** 2)\n    return result\n\n# 方法2: 列表推导式\ndef method2_list_comprehension():\n    return [x ** 2 for x in TEST_DATA if x % 2 == 0]\n\n# 方法3: filter + map\ndef method3_filter_map():\n    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))\n\n# 方法4: 生成器表达式\ndef method4_generator():\n    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)\n\n\nif __name__ == '__main__':\n    print(f\"Python版本: {sys.version}\")\n    print(f\"测试数据量: {len(TEST_DATA)}\\n\")\n    \n    benchmark(\"for循环 + append\", method1_for_loop)\n    benchmark(\"列表推导式\", method2_list_comprehension)\n    benchmark(\"filter + map\", method3_filter_map)\n    benchmark(\"生成器表达式\", method4_generator)\n\n\`\`\`\n\n## 四、常见陷阱与Pythonic坑\n\n### 4.1 经典Python陷阱\n\n| 陷阱 | 危险代码 | 正确写法 | 说明 |\n|-----|---------|---------|------|\n| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |\n| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |\n| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |\n| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |\n| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |\n\n### 4.2 陷阱详解与修复\n\n**陷阱1：可变默认参数**\n\n\`\`\`python\n# ❌ 危险！\ndef append_to(item, target=[]):\n    target.append(item)\n    return target\n\n# 第一次调用\nprint(append_to(1))  # [1]\n# 第二次调用 - 同一个列表！\nprint(append_to(2))  # [1, 2] !!!\n# 第三次调用\nprint(append_to(3))  # [1, 2, 3] !!!\n\n# ✅ 正确写法\ndef append_to(item, target=None):\n    if target is None:\n        target = []\n    target.append(item)\n    return target\n\n\`\`\`\n\n**陷阱2：闭包延迟绑定**\n\n\`\`\`python\n# ❌ 危险！所有lambda都引用同一个i\nfunctions = []\nfor i in range(5):\n    functions.append(lambda: i)\n\nprint([f() for f in functions])  # [4, 4, 4, 4, 4] !!!\n\n# ✅ 正确写法1：使用默认参数\nfunctions = []\nfor i in range(5):\n    functions.append(lambda i=i: i)\n\nprint([f() for f in functions])  # [0, 1, 2, 3, 4]\n\n# ✅ 正确写法2：使用functools.partial\nfrom functools import partial\nfunctions = []\nfor i in range(5):\n    functions.append(partial(lambda x: x, i))\n\n\`\`\`\n\n**陷阱3：深浅拷贝**\n\n\`\`\`python\nimport copy\n\n# ❌ 浅拷贝的问题\noriginal = [[1, 2], [3, 4]]\nshallow = original.copy()\nshallow[0][0] = 99\nprint(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！\n\n# ✅ 深拷贝\noriginal = [[1, 2], [3, 4]]\ndeep = copy.deepcopy(original)\ndeep[0][0] = 99\nprint(original)  # [[1, 2], [3, 4]] - 原对象不受影响\n\n\`\`\`\n\n## 五、Python最佳实践\n\n### 5.1 Pythonic代码风格\n\n\`\`\`python\n\"\"\"\nPythonic写法 vs 非Pythonic写法对比\n\"\"\"\nfrom typing import List\n\n# ---------- 遍历 ----------\nitems = ['a', 'b', 'c']\n\n# ❌ 非Pythonic：用索引遍历\nfor i in range(len(items)):\n    print(i, items[i])\n\n# ✅ Pythonic：直接遍历\nfor item in items:\n    print(item)\n\n# ✅ 需要索引时用enumerate\nfor idx, item in enumerate(items):\n    print(idx, item)\n\n# ---------- 字典遍历 ----------\nd = {'a': 1, 'b': 2, 'c': 3}\n\n# ❌ 非Pythonic\nfor key in d.keys():\n    print(key, d[key])\n\n# ✅ Pythonic\nfor key, value in d.items():\n    print(key, value)\n\n# ---------- 条件判断 ----------\n\n# ❌ 非Pythonic\nif x == True:\n    pass\nif len(items) == 0:\n    pass\nif items != None:\n    pass\n\n# ✅ Pythonic\nif x is True:  # 或直接 if x:\n    pass\nif not items:  # 空列表/字典/字符串/None都是False\n    pass\nif items is not None:\n    pass\n\n# ---------- 列表操作 ----------\n\n# ❌ 非Pythonic：需要索引交换\ntemp = a\na = b\nb = temp\n\n# ✅ Pythonic：元组解包\na, b = b, a\n\n# ---------- 文件操作 ----------\n\n# ❌ 非Pythonic：手动关闭\nf = open('file.txt', 'r')\ntry:\n    content = f.read()\nfinally:\n    f.close()\n\n# ✅ Pythonic：上下文管理器\nwith open('file.txt', 'r') as f:\n    content = f.read()\n\n\`\`\`\n\n### 5.2 类型提示最佳实践\n\n\`\`\`python\n\"\"\"\n类型提示（Type Hints）最佳实践 - Python 3.9+\n\"\"\"\nfrom typing import (\n    TypeVar, Generic, Optional, Union, Literal,\n    overload, TypedDict, Protocol\n)\nfrom collections.abc import Callable, Iterable, Mapping, Sequence\nfrom dataclasses import dataclass\nfrom enum import Enum\n\n\n# 枚举代替字符串常量\nclass Status(Enum):\n    PENDING = 'pending'\n    ACTIVE = 'active'\n    CLOSED = 'closed'\n\n\n# TypedDict定义结构化字典类型\nclass User(TypedDict):\n    id: int\n    name: str\n    email: str\n    status: Status\n\n\n# 泛型示例\nT = TypeVar('T')\n\nclass Stack(Generic[T]):\n    def __init__(self) -> None:\n        self._items: list[T] = []\n    \n    def push(self, item: T) -> None:\n        self._items.append(item)\n    \n    def pop(self) -> T:\n        return self._items.pop()\n    \n    def peek(self) -> Optional[T]:\n        return self._items[-1] if self._items else None\n\n\n# 函数重载\n@overload\ndef process(data: str) -> list[str]: ...\n\n@overload\ndef process(data: int) -> list[int]: ...\n\ndef process(data: Union[str, int]) -> list:\n    \"\"\"根据输入类型返回不同结果\"\"\"\n    if isinstance(data, str):\n        return data.split()\n    else:\n        return [data, data * 2, data * 3]\n\n\n# Protocol定义结构化类型（鸭子类型）\nclass Serializable(Protocol):\n    def to_dict(self) -> dict: ...\n\ndef serialize(obj: Serializable) -> str:\n    import json\n    return json.dumps(obj.to_dict())\n\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n    label: str = \"origin\"\n    \n    def to_dict(self) -> dict:\n        return {'x': self.x, 'y': self.y, 'label': self.label}\n\n\n# 使用示例\nif __name__ == '__main__':\n    # Stack示例\n    stack: Stack[int] = Stack()\n    stack.push(1)\n    stack.push(2)\n    print(stack.pop())  # 2\n    \n    # 类型安全的序列化\n    p = Point(3.0, 4.0, \"目标点\")\n    print(serialize(p))\n\n\`\`\`\n\n## 六、Python 3.10+ 新特性\n\n### 6.1 Match-Case 语句\n\n\`\`\`python\n\"\"\"\nPython 3.10+ 新增的 match-case 模式匹配\n比if-elif-else更强大、更清晰\n\"\"\"\nfrom typing import Union\nfrom dataclasses import dataclass\nfrom enum import Enum, auto\n\n\nclass ShapeType(Enum):\n    CIRCLE = auto()\n    RECTANGLE = auto()\n    TRIANGLE = auto()\n\n\n@dataclass\nclass Shape:\n    kind: ShapeType\n    x: float\n    y: float\n    width: float = 0\n    height: float = 0\n    radius: float = 0\n\n\ndef calculate_area(shape: Shape) -> float:\n    import math\n    \n    match shape:\n        case Shape(kind=ShapeType.CIRCLE, radius=r):\n            return math.pi * r ** 2\n        \n        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):\n            return w * h\n        \n        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):\n            return 0.5 * base * h\n        \n        case _:\n            raise ValueError(f\"未知形状: {shape.kind}\")\n\n\n# 列表/元组模式匹配\ndef http_status(status_code: int) -> str:\n    match status_code:\n        case 200:\n            return \"OK\"\n        case 201:\n            return \"Created\"\n        case 400:\n            return \"Bad Request\"\n        case 404:\n            return \"Not Found\"\n        case 500:\n            return \"Server Error\"\n        case code if code >= 200 and code < 300:\n            return f\"Success ({code})\"\n        case code if code >= 400 and code < 500:\n            return f\"Client Error ({code})\"\n        case code if code >= 500:\n            return f\"Server Error ({code})\"\n        case _:\n            return f\"Unknown ({status_code})\"\n\n\n# 字典模式匹配\ndef handle_event(event: dict) -> str:\n    match event:\n        case {\"type\": \"click\", \"x\": x, \"y\": y}:\n            return f\"点击位置: ({x}, {y})\"\n        case {\"type\": \"keypress\", \"key\": \"Enter\"}:\n            return \"按下回车键\"\n        case {\"type\": \"keypress\", \"key\": key}:\n            return f\"按下键: {key}\"\n        case {\"type\": event_type}:\n            return f\"未处理的事件类型: {event_type}\"\n        case {}:\n            return \"无效事件\"\n\n\`\`\`\n\n### 6.2 Union类型运算符\n\n\`\`\`python\n\"\"\"\nPython 3.10+ 支持使用 | 表示Union类型\nPython 3.9+ 也可以通过from __future__启用\n\"\"\"\n# from __future__ import annotations  # Python 3.9需要\n\n# 旧写法\nfrom typing import Union, Optional\ndef old_style(x: Union[int, str]) -> Optional[str]:\n    pass\n\n# 新写法 - 更简洁\ndef new_style(x: int | str) -> str | None:\n    return str(x)\n\n# isinstance也支持\ndef process_value(value: int | str | list) -> str:\n    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))\n        return str(value)\n    elif isinstance(value, list):\n        return \", \".join(str(v) for v in value)\n    else:\n        raise TypeError(f\"不支持的类型: {type(value)}\")\n\n\n# TypeGuard 类型守卫 (Python 3.10+)\nfrom typing import TypeGuard\n\ndef is_string_list(val: list[object]) -> TypeGuard[list[str]]:\n    return all(isinstance(x, str) for x in val)\n\ndef process_list(items: list[object]) -> None:\n    if is_string_list(items):\n        # 这里items被推断为list[str]\n        for s in items:\n            print(s.upper())  # 类型安全！\n\n\`\`\`\n\n### 6.3 Python 3.11/3.12新特性\n\n\`\`\`python\n\"\"\"\nPython 3.11/3.12 新特性演示\n- 更快的执行速度（平均25%提速）\n- tomllib内置TOML解析\n- Exception Groups异常组\n- TaskGroup异步任务组\n- 更精确的错误提示\n\"\"\"\nimport sys\nprint(f\"当前Python版本: {sys.version}\")\n\n\n# 1. tomllib - 内置TOML解析 (Python 3.11+)\ndef demo_toml():\n    try:\n        import tomllib\n    except ImportError:\n        print(\"tomllib需要Python 3.11+\")\n        return\n    \n    toml_content = \"\"\"\n[database]\nhost = "localhost"\nport = 5432\nname = "mydb"\n\n[server]\nport = 8080\ndebug = true\n\"\"\"\n    \n    config = tomllib.loads(toml_content)\n    print(f\"数据库配置: {config['database']}\")\n    return config\n\n\n# 2. Exception Groups - 异常组 (Python 3.11+)\ndef demo_exception_groups():\n    if sys.version_info < (3, 11):\n        print(\"Exception Groups需要Python 3.11+\")\n        return\n    \n    errors: list[Exception] = []\n    \n    for i, value in enumerate([\"a\", 0, \"b\", 2]):\n        try:\n            result = 10 / value\n        except Exception as e:\n            errors.append(e)\n    \n    if errors:\n        try:\n            raise ExceptionGroup(\"发生多个错误\", errors)\n        except ExceptionGroup as eg:\n            print(f\"捕获到 {len(eg.exceptions)} 个异常:\")\n            for e in eg.exceptions:\n                print(f\"  - {type(e).__name__}: {e}\")\n\n\n# 3. TaskGroup - 结构化并发 (Python 3.11+)\nimport asyncio\n\nasync def demo_task_group():\n    if sys.version_info < (3, 11):\n        print(\"TaskGroup需要Python 3.11+\")\n        return\n    \n    async def fetch_data(name: str, delay: float) -> str:\n        await asyncio.sleep(delay)\n        return f\"{name}: 数据获取完成\"\n    \n    # 旧方式: 手动创建gather\n    # results = await asyncio.gather(\n    #     fetch_data(\"API1\", 1),\n    #     fetch_data(\"API2\", 0.5),\n    # )\n    \n    # 新方式: TaskGroup结构化并发\n    async with asyncio.TaskGroup() as tg:\n        task1 = tg.create_task(fetch_data(\"API1\", 1))\n        task2 = tg.create_task(fetch_data(\"API2\", 0.5))\n    \n    print(f\"结果: {task1.result()}, {task2.result()}\")\n\n\nif __name__ == '__main__':\n    print(\"\\n=== TOML 演示 ===\")\n    demo_toml()\n    \n    print(\"\\n=== Exception Groups 演示 ===\")\n    demo_exception_groups()\n    \n    print(\"\\n=== TaskGroup 演示 ===\")\n    asyncio.run(demo_task_group())\n\n\`\`\`\n\n## 七、实战练习\n\n### 练习1：数据类与验证\n\n实现一个配置管理系统，要求：\n- 使用dataclass定义配置结构\n- 添加字段验证逻辑\n- 支持从字典加载配置\n- 支持序列化回字典\n- 类型提示完整\n\n### 练习2：装饰器高级应用\n\n实现一个通用的缓存装饰器，支持：\n- 可配置的过期时间\n- 自定义缓存键生成函数\n- 缓存命中率统计\n- 可选择是否缓存None结果\n\n### 练习3：异步并发\n\n实现一个异步网页抓取器，要求：\n- 使用aiohttp进行HTTP请求\n- 限制并发数（使用信号量）\n- 支持重试机制\n- 进度显示\n- 错误处理和统计\n\n## 八、小结\n\n通过本章${chapter.title}的学习，你应该已经掌握：\n\n✅ Python中${chapter.title}的底层原理和工作机制\n✅ 相关的高级特性和Pythonic写法\n✅ 常见的陷阱以及如何避免\n✅ 性能优化技巧和最佳实践\n✅ Python 3.10+的新特性在该场景下的应用\n✅ 编写类型安全、可维护的Python代码\n\nPython是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。\n\n### 推荐进阶阅读\n\n- 《Fluent Python》（流畅的Python）- Luciano Ramalho\n- 《Effective Python》- Brett Slatkin\n- 《Python Cookbook》- David Beazley\n- 《High Performance Python》- Micha Gorelick\n- Python官方文档：https://docs.python.org/\n\n记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀\n`;
}

function writeBatchFile(batchIndex, group, chapters, isPython = false) {
  const prefix = isPython ? 'py-definitive' : 'prog-guide';
  const content = chapters.map(ch => ({
    ...ch,
    group: group,
    content: isPython ? generatePyContent(ch) : generateProgContent(ch)
  }));
  
  const fileContent = `// ${isPython ? 'Python权威指南' : '编程指南'} - 第${batchIndex}批章节\n// 分组：${group}\n\nexport const chapters = ${JSON.stringify(content, null, 2)};\n`;
  
  const filePath = path.join(appDir, `${prefix}-chapters-batch${batchIndex}.js`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`已生成: ${filePath} (${chapters.length}章)`);
}

console.log('='.repeat(60));
console.log('开始生成编程指南章节...');
console.log('='.repeat(60) + '\n');

progGuideBatches.forEach((batch, index) => {
  writeBatchFile(index + 1, batch.group, batch.chapters, false);
});

const progTotal = progGuideBatches.reduce((sum, b) => sum + b.chapters.length, 0);
console.log(`\n✅ 编程指南章节生成完成！总计 ${progTotal} 章\n`);

console.log('='.repeat(60));
console.log('