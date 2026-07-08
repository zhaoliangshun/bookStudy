const fs = require('fs');
const path = require('path');

const appDir = '/Users/zhaoliangshun/nextStudy/my-app/app';

function generateChapter(id, group, icon, title, sections) {
  const content = sections.map(s => s.content).join('\n\n');
  return {
    id,
    group,
    icon,
    title,
    content: `# ${title}\n\n${content}`
  };
}

function lorem(title, level = 2) {
  const prefix = '#'.repeat(level) + ' ';
  const paragraphs = [
    `## ${title}`,
    '',
    `### 核心概念`,
    '',
    `${title}是编程中非常重要的知识点。理解并掌握它对于成为一名优秀的程序员至关重要。在本章中，我们将深入探讨${title}的各个方面，包括其基本原理、使用方法、常见陷阱以及最佳实践。`,
    '',
    `### 为什么学习${title}`,
    '',
    `- **基础重要性**：${title}是编程基础的基石，几乎所有程序都会用到`,
    `- **提升效率**：掌握${title}可以让你写出更简洁、更高效的代码`,
    `- **减少bug**：理解${title}的工作原理可以避免很多常见错误`,
    `- **职业发展**：面试和工作中经常会遇到${title}相关的问题`,
    '',
    `### 基础语法与用法`,
    '',
    '```python',
    `# ${title} 基础示例`,
    `print("学习${title}")`,
    '',
    `# 示例1：基本用法`,
    `data = [1, 2, 3, 4, 5]`,
    `print(f"数据: {data}")`,
    '```',
    '',
    `### 详细说明`,
    '',
    `${title}涉及多个方面的知识点：`,
    '',
    `| 概念 | 说明 | 示例 |`,
    `|------|------|------|`,
    `| 基本操作 | 最基础的使用方式 | 直接使用 |`,
    `| 高级技巧 | 更强大的用法 | 组合使用 |`,
    `| 常见错误 | 容易踩的坑 | 注意避免 |`,
    `| 最佳实践 | 推荐的写法 | 参考示例 |`,
    '',
    `### 代码示例`,
    '',
    '```python',
    `# 示例：${title}的实际应用`,
    '',
    `def example_function():`,
    `    """演示${title}的函数""""""`,
    `    result = []`,
    `    for i in range(10):`,
    `        result.append(i * 2)`,
    `    return result`,
    '',
    `print(example_function())`,
    '```',
    '',
    `### 常见陷阱与注意事项`,
    '',
    `1. **陷阱一**：不理解${title}的基本原理就直接使用`,
    `   - 解决方案：先理解概念，再动手写代码`,
    '',
    `2. **陷阱二**：忽略边界情况`,
    `   - 解决方案：考虑空输入、极端值、异常情况`,
    '',
    `3. **陷阱三**：过度使用或误用`,
    `   - 解决方案：理解什么时候该用，什么时候不该用`,
    '',
    `### 最佳实践`,
    '',
    `- **保持简单**：不要过度设计，简单清晰的代码最好`,
    `- **命名清晰**：变量名、函数名要能表达含义`,
    `- **添加注释**：复杂逻辑要说明为什么这么做`,
    `- **编写测试**：确保代码在各种情况下都能正确运行`,
    `- **代码审查**：让同事帮你review代码，发现问题`,
    '',
    `### 进阶话题`,
    '',
    `当你掌握了${title}的基础之后，可以进一步学习：`,
    '',
    `- 性能优化：如何让${title}相关的代码运行更快`,
    `- 设计模式：如何在更大的项目中应用${title}`,
    `- 源码分析：研究标准库或框架中${title}的实现`,
    '',
    `### 实战练习`,
    '',
    '```python',
    `# 练习1：基础练习`,
    `# 写一个使用${title}的小程序`,
    '',
    `# 练习2：进阶练习`,
    `# 将${title}应用到实际问题中`,
    '',
    `# 练习3：重构练习`,
    `# 优化一段使用${title}的代码，使其更优雅`,
    '```',
    '',
    `### 总结`,
    '',
    `${title}是编程学习路上的重要里程碑。通过本章的学习，你应该对${title}有了全面深入的理解。记住，编程是一门实践的艺术，光看不练是不够的。多写代码、多调试、多思考，你才能真正掌握${title}。`,
    '',
    `**核心要点回顾**：`,
    `1. 理解${title}的基本概念和工作原理`,
    `2. 掌握${title}的语法和常用方法`,
    `3. 了解常见陷阱并知道如何避免`,
    `4. 遵循最佳实践写出高质量代码`,
    `5. 通过实际项目和练习巩固所学知识`
  ].join('\n');
  return paragraphs;
}

const progGuideGroups = [
  { name: "计算机与编程入门", icon: "💻", chapters: [
    { id: "prog-computer-basics", title: "计算机基础：从硬件到软件" },
    { id: "prog-what-is-programming", title: "什么是编程：与计算机对话的艺术" },
    { id: "prog-first-program", title: "你的第一个程序：Hello World 深度解析" },
    { id: "prog-choose-language", title: "编程语言全景：如何选择适合你的语言" },
    { id: "prog-dev-environment", title: "搭建开发环境：编辑器、终端与工具链" },
    { id: "prog-how-computer-runs-code", title: "代码如何运行：从源代码到程序执行" },
    { id: "prog-binary-and-data", title: "二进制世界：计算机如何表示数据" },
    { id: "prog-learning-method", title: "编程学习方法论：如何高效学习编程" }
  ]},
  { name: "编程思维与基础概念", icon: "🧠", chapters: [
    { id: "prog-computational-thinking", title: "计算思维：分解、模式识别、抽象与算法" },
    { id: "prog-algorithm-intro", title: "算法入门：什么是算法以及如何设计算法" },
    { id: "prog-flowchart-pseudocode", title: "流程图与伪代码：在写代码前理清思路" },
    { id: "prog-variables-concept", title: "变量的本质：内存中的盒子与标签" },
    { id: "prog-statements-expressions", title: "语句与表达式：程序的基本构建块" },
    { id: "prog-operators", title: "运算符：算术、比较、逻辑与位运算" },
    { id: "prog-input-output", title: "输入与输出：程序与用户的交互" },
    { id: "prog-first-project", title: "第一个项目：简易计算器" }
  ]},
  { name: "变量与数据类型", icon: "📦", chapters: [
    { id: "prog-data-types-overview", title: "数据类型概览：为什么需要类型" },
    { id: "prog-numbers", title: "数字类型：整数、浮点数与数值计算" },
    { id: "prog-strings", title: "字符串：文本处理的艺术" },
    { id: "prog-boolean", title: "布尔类型与逻辑：真与假的世界" },
    { id: "prog-type-conversion", title: "类型转换：隐式转换与显式转换" },
    { id: "prog-null-undefined", title: "空值与未定义：Nothing的多种表示" },
    { id: "prog-constants", title: "常量与不可变性：为什么需要const" },
    { id: "prog-variable-scope", title: "变量作用域：在哪里可以访问你的变量" }
  ]},
  { name: "控制流与逻辑", icon: "🔀", chapters: [
    { id: "prog-conditionals", title: "条件语句：if/else与决策" },
    { id: "prog-switch-match", title: "多分支选择：switch与模式匹配" },
    { id: "prog-for-loops", title: "for循环：重复执行的艺术" },
    { id: "prog-while-loops", title: "while循环：满足条件就继续" },
    { id: "prog-loop-control", title: "循环控制：break、continue与else" },
    { id: "prog-nested-loops", title: "嵌套循环与多重循环" },
    { id: "prog-iteration-patterns", title: "迭代模式：常见的循环用法" },
    { id: "prog-decision-table", title: "决策表与复杂逻辑简化" }
  ]},
  { name: "函数与模块化", icon: "🔧", chapters: [
    { id: "prog-functions-intro", title: "函数入门：为什么需要函数" },
    { id: "prog-function-parameters", title: "函数参数：位置参数、关键字参数与默认值" },
    { id: "prog-return-values", title: "返回值：函数如何输出结果" },
    { id: "prog-function-scope", title: "函数作用域与闭包入门" },
    { id: "prog-recursion", title: "递归：函数调用自身的艺术" },
    { id: "prog-lambda-anonymous", title: "匿名函数与Lambda表达式" },
    { id: "prog-higher-order-functions", title: "高阶函数：函数作为参数和返回值" },
    { id: "prog-modularization", title: "模块化：将代码组织成文件和模块" }
  ]},
  { name: "面向对象编程", icon: "🏛️", chapters: [
    { id: "prog-oop-intro", title: "面向对象编程思想：类与对象" },
    { id: "prog-classes-objects", title: "定义类与创建对象" },
    { id: "prog-attributes-methods", title: "属性与方法：对象的状态和行为" },
    { id: "prog-encapsulation", title: "封装：隐藏实现细节" },
    { id: "prog-inheritance", title: "继承：代码复用的机制" },
    { id: "prog-polymorphism", title: "多态：同一接口的不同实现" },
    { id: "prog-composition-over-inheritance", title: "组合优于继承" },
    { id: "prog-oop-pitfalls", title: "面向对象常见误区与反模式" }
  ]},
  { name: "函数式编程与高级概念", icon: "λ", chapters: [
    { id: "prog-fp-intro", title: "函数式编程入门：纯函数与不可变性" },
    { id: "prog-pure-functions", title: "纯函数：相同输入永远得到相同输出" },
    { id: "prog-immutability", title: "不可变数据：为什么不要修改数据" },
    { id: "prog-map-filter-reduce", title: "Map/Filter/Reduce：函数式三剑客" },
    { id: "prog-decorators", title: "装饰器模式：增强函数功能" },
    { id: "prog-iterators-generators", title: "迭代器与生成器：惰性求值" },
    { id: "prog-error-handling", title: "错误处理：异常、返回值与Result模式" },
    { id: "prog-currying-partial", title: "柯里化与偏函数应用" }
  ]},
  { name: "调试、测试与代码质量", icon: "🐛", chapters: [
    { id: "prog-debugging-skills", title: "调试技巧：定位和修复bug的系统方法" },
    { id: "prog-debugger-tools", title: "使用调试器：断点、单步与变量观察" },
    { id: "prog-print-debugging", title: "打印调试与日志记录" },
    { id: "prog-unit-testing", title: "单元测试：确保代码正确工作" },
    { id: "prog-test-driven", title: "测试驱动开发（TDD）" },
    { id: "prog-code-review", title: "代码审查：如何给别人review代码" },
    { id: "prog-refactoring", title: "重构：改善代码设计而不改变行为" },
    { id: "prog-code-smells", title: "代码坏味道：识别需要重构的信号" }
  ]},
  { name: "工程实践与工具", icon: "🛠️", chapters: [
    { id: "prog-git-version-control", title: "Git版本控制：代码的时间机器" },
    { id: "prog-git-advanced", title: "Git进阶：分支、合并与冲突解决" },
    { id: "prog-command-line", title: "命令行基础：程序员的必备技能" },
    { id: "prog-regex", title: "正则表达式：文本处理的瑞士军刀" },
    { id: "prog-network-basics", title: "网络编程基础：HTTP、TCP/IP与API" },
    { id: "prog-database-intro", title: "数据库入门：SQL与数据持久化" },
    { id: "prog-design-patterns", title: "设计模式入门：常见问题的经典解法" },
    { id: "proj-documentation", title: "文档编写：代码是写给人看的" }
  ]},
  { name: "程序员成长与职业发展", icon: "🚀", chapters: [
    { id: "prog-write-good-code", title: "如何写好代码：整洁代码之道" },
    { id: "prog-naming", title: "命名的艺术：变量、函数与类的命名" },
    { id: "prog-self-cultivation", title: "程序员的自我修养" },
    { id: "prog-problem-solving", title: "问题解决能力：程序员的核心竞争力" },
    { id: "prog-learning-resources", title: "学习资源推荐：书籍、网站与社区" },
    { id: "prog-open-source", title: "参与开源：提升编程能力的捷径" },
    { id: "prog-career-development", title: "职业发展：初级到高级工程师的成长路径" },
    { id: "prog-future-of-programming", title: "编程的未来：AI时代程序员如何自处" }
  ]}
];

const pyDefGroups = [
  { name: "Python入门与环境", icon: "🐍", chapters: [
    { id: "py-what-is-python", title: "Python是什么：历史、特点与生态" },
    { id: "py-install-python", title: "安装Python：Windows/macOS/Linux环境配置" },
    { id: "py-first-program", title: "第一个Python程序：Hello World" },
    { id: "py-interactive-mode", title: "Python交互模式（REPL）使用指南" },
    { id: "py-virtual-env", title: "虚拟环境：隔离项目依赖" },
    { id: "py-pip-packages", title: "pip与包管理：安装第三方库" },
    { id: "py-ide-setup", title: "IDE配置：VS Code与PyCharm" },
    { id: "py-zen", title: "Python之禅：import this的智慧" }
  ]},
  { name: "数据类型基础", icon: "📊", chapters: [
    { id: "py-dynamic-typing", title: "动态类型与类型系统" },
    { id: "py-variables", title: "变量与赋值" },
    { id: "py-numbers", title: "数字类型：int、float、complex" },
    { id: "py-numeric-operations", title: "数值运算与math模块" },
    { id: "py-strings-intro", title: "字符串入门" },
    { id: "py-string-methods", title: "字符串方法大全" },
    { id: "py-string-formatting", title: "字符串格式化：f-string、format与%", batch: true },
    { id: "py-bytes", title: "bytes与bytearray：二进制数据" }
  ]},
  { name: "数字与字符串", icon: "🔢", chapters: [
    { id: "py-string-slicing", title: "字符串切片与索引" },
    { id: "py-string-encoding", title: "字符编码：Unicode与UTF-8" },
    { id: "py-regex-python", title: "正则表达式在Python中的应用（re模块）" },
    { id: "py-boolean", title: "布尔类型与真值测试" },
    { id: "py-comparisons", title: "比较运算符与链式比较" },
    { id: "py-bitwise", title: "位运算：按位与或非异或" },
    { id: "py-numeric-conversion", title: "数值转换与进制处理" },
    { id: "py-precision", title: "浮点数精度问题与Decimal" }
  ]},
  { name: "列表与元组", icon: "📋", chapters: [
    { id: "py-lists-intro", title: "列表（list）入门" },
    { id: "py-list-operations", title: "列表常用操作与方法" },
    { id: "py-list-slicing", title: "列表切片与索引" },
    { id: "py-list-comprehension", title: "列表推导式" },
    { id: "py-tuples", title: "元组（tuple）：不可变序列" },
    { id: "py-sequence-protocol", title: "序列协议：通用序列操作" },
    { id: "py-nested-sequences", title: "嵌套列表与多维数据" },
    { id: "py-sorting", title: "排序：sorted()与sort()方法" }
  ]},
  { name: "字典与集合", icon: "📖", chapters: [
    { id: "py-dicts-intro", title: "字典（dict）入门：键值对存储" },
    { id: "py-dict-operations", title: "字典操作与常用方法" },
    { id: "py-dict-comprehension", title: "字典推导式" },
    { id: "py-defaultdict-ordered", title: "collections：defaultdict、OrderedDict等" },
    { id: "py-sets", title: "集合（set）：不重复元素的无序集合" },
    { id: "py-set-operations", title: "集合运算：交集、并集、差集" },
    { id: "py-hashable", title: "可哈希性：什么能做字典的键" },
    { id: "py-mapping-patterns", title: "字典与集合的常用模式" }
  ]},
  { name: "控制流", icon: "🔀", chapters: [
    { id: "py-if-else", title: "if/elif/else条件语句" },
    { id: "py-match-case", title: "match-case模式匹配（Python 3.10+）" },
    { id: "py-for-loop", title: "for循环与range()" },
    { id: "py-while-loop", title: "while循环" },
    { id: "py-break-continue", title: "break、continue与循环的else子句" },
    { id: "py-enumerate-zip", title: "enumerate、zip与迭代技巧" },
    { id: "py-itertools", title: "itertools模块：高效迭代工具" },
    { id: "py-truthy-falsy", title: "真值与假值：Python的布尔上下文" }
  ]},
  { name: "函数基础", icon: "🔧", chapters: [
    { id: "py-defining-functions", title: "定义函数：def语句" },
    { id: "py-parameters", title: "函数参数：位置、关键字、默认值" },
    { id: "py-args-kwargs", title: "*args与**kwargs：可变参数" },
    { id: "py-return", title: "返回值与return语句" },
    { id: "py-lambda", title: "lambda匿名函数" },
    { id: "py-docstrings", title: "文档字符串：给函数写文档" },
    { id: "py-namespaces", title: "命名空间与作用域规则（LEGB）" },
    { id: "py-first-class-functions", title: "一等函数：函数是对象" }
  ]},
  { name: "函数进阶", icon: "⚡", chapters: [
    { id: "py-closures", title: "闭包：函数捕获外部变量" },
    { id: "py-decorators", title: "装饰器：@语法糖详解" },
    { id: "py-decorator-factories", title: "带参数的装饰器与装饰器工厂" },
    { id: "py-generators", title: "生成器：yield与惰性求值" },
    { id: "py-coroutines-basic", title: "协程基础：yield from" },
    { id: "py-higher-order", title: "高阶函数：map、filter、reduce" },
    { id: "py-partial-functions", title: "functools：partial、lru_cache等" },
    { id: "py-function-best-practices", title: "函数设计最佳实践" }
  ]},
  { name: "面向对象基础", icon: "🏛️", chapters: [
    { id: "py-classes-intro", title: "类与对象：面向对象入门" },
    { id: "py-init-method", title: "__init__构造方法与self" },
    { id: "py-instance-methods", title: "实例方法、类方法与静态方法" },
    { id: "py-attributes", title: "实例属性与类属性" },
    { id: "py-encapsulation", title: "封装与属性访问控制" },
    { id: "py-properties", title: "property装饰器：受控属性" },
    { id: "py-inheritance-basic", title: "继承：单继承基础" },
    { id: "py-super", title: "super()函数与方法重写" }
  ]},
  { name: "面向对象进阶", icon: "🏗️", chapters: [
    { id: "py-multiple-inheritance", title: "多继承与MRO（方法解析顺序）" },
    { id: "py-polymorphism", title: "多态与鸭子类型" },
    { id: "py-dunder-methods", title: "特殊方法（魔术方法）详解" },
    { id: "py-operator-overloading", title: "运算符重载" },
    { id: "py-descriptors", title: "描述符协议：属性访问的底层机制" },
    { id: "py-metaclasses", title: "元类：类的类" },
    { id: "py-abstract-classes", title: "抽象基类（ABC）与接口" },
    { id: "py-dataclasses", title: "dataclasses：数据类（Python 3.7+）" }
  ]},
  { name: "模块、包与异常", icon: "📦", chapters: [
    { id: "py-modules", title: "模块：import机制详解" },
    { id: "py-packages", title: "包：组织模块的目录结构" },
    { id: "py-import-system", title: "Python导入系统深度解析" },
    { id: "py-standard-library", title: "标准库概览：电池已包含" },
    { id: "py-exceptions-intro", title: "异常处理：try/except/finally" },
    { id: "py-exception-hierarchy", title: "异常类层次结构与自定义异常" },
    { id: "py-raising-exceptions", title: "抛出异常：raise语句" },
    { id: "py-context-managers", title: "上下文管理器：with语句与__enter__/__exit__" }
  ]},
  { name: "文件IO与标准库", icon: "📁", chapters: [
    { id: "py-file-io", title: "文件读写：open()函数与文件对象" },
    { id: "py-file-modes", title: "文件模式：文本模式与二进制模式" },
    { id: "py-paths-os-pathlib", title: "路径处理：os.path与pathlib" },
    { id: "py-csv-json", title: "CSV与JSON处理" },
    { id: "py-collections-module", title: "collections模块深入" },
    { id: "py-datetime", title: "日期与时间处理：datetime模块" },
    { id: "py-logging", title: "日志记录：logging模块" },
    { id: "py-argparse-cli", title: "命令行参数解析：argparse" }
  ]},
  { name: "并发编程", icon: "🔄", chapters: [
    { id: "py-threading", title: "多线程：threading模块" },
    { id: "py-gil", title: "GIL全局解释器锁深度解析" },
    { id: "py-multiprocessing", title: "多进程：multiprocessing模块" },
    { id: "py-asyncio-intro", title: "asyncio入门：异步编程范式" },
    { id: "py-async-await", title: "async/await语法详解" },
    { id: "py-futures", title: "concurrent.futures：线程池与进程池" },
    { id: "py-synchronization", title: "同步原语：锁、信号量、条件变量" },
    { id: "py-concurrency-patterns", title: "并发编程模式与最佳实践" }
  ]},
  { name: "高级特性与元编程", icon: "✨", chapters: [
    { id: "py-type-hints", title: "类型提示（Type Hints）详解" },
    { id: "py-typing-module", title: "typing模块：类型注解进阶" },
    { id: "py-memory-management", title: "内存管理：引用计数与垃圾回收" },
    { id: "py-slots", title: "__slots__：内存优化" },
    { id: "py-metaprogramming", title: "元编程：动态创建类与代码生成" },
    { id: "py-decorators-advanced", title: "装饰器高级模式" },
    { id: "py-c-extensions", title: "C扩展：ctypes、cffi与Cython" },
    { id: "py-performance-profiling", title: "性能分析与优化：cProfile与timeit" }
  ]},
  { name: "最佳实践与新特性", icon: "🚀", chapters: [
    { id: "py-pep8", title: "PEP 8代码风格指南" },
    { id: "py-pythonic", title: "Pythonic：地道的Python写法" },
    { id: "py-testing", title: "测试：unittest与pytest" },
    { id: "py-py310-features", title: "Python 3.10新特性：match-case、Union Type等" },
    { id: "py-py311-features", title: "Python 3.11新特性：速度提升、tomllib、ExceptionGroups" },
    { id: "py-py312-features", title: "Python 3.12新特性：类型语法改进、性能优化" },
    { id: "py-project-structure", title: "Python项目结构与打包" },
    { id: "py-common-pitfalls", title: "Python常见陷阱与避坑指南" }
  ]}
];

function generateFullChapter(chapterInfo, groupName, icon) {
  const { id, title } = chapterInfo;
  return {
    id,
    group: groupName,
    icon: icon,
    title: title,
    content: generateChapterContent(title)
  };
}

function generateChapterContent(title) {
  return `# ${title}

## 一、概述

${title}是Python编程中极其重要的知识点。本章将系统性地讲解${title}的各个方面，从基础概念到高级用法，从常见陷阱到最佳实践，帮助你全面掌握这一核心主题。

## 二、核心概念

### 2.1 什么是${title}

在深入学习之前，我们首先需要理解${title}的本质。${title}不仅仅是一个语法特性或API，它背后体现的是Python的设计哲学和编程范式。理解"为什么"比记住"怎么做"更重要。

**关键要点**：
- ${title}是Python语言的核心组成部分
- 它体现了Python"简洁明确"的设计理念
- 掌握${title}能让你写出更优雅、更高效的代码
- 在实际项目中，${title}有着广泛的应用场景

### 2.2 为什么要学习${title}

| 原因 | 说明 |
|------|------|
| 实用性强 | 几乎所有Python项目都会用到${title} |
| 提升效率 | 熟练运用${title}可以大幅减少代码量 |
| 代码质量 | 正确使用${title}能让代码更易读、更易维护 |
| 面试高频 | ${title}是技术面试中的常见考点 |
| 进阶必经 | 不掌握${title}无法写出Pythonic的代码 |

## 三、基础用法

### 3.1 最简单的例子

让我们从最基础的例子开始：

\`\`\`python
# ${title} 基础示例
print(f"学习${title}")

# 示例1：基本使用
def basic_example():
    """演示${title}的基本用法"""
    data = [1, 2, 3, 4, 5]
    result = []
    for item in data:
        result.append(item * 2)
    return result

print(basic_example())
\`\`\`

### 3.2 语法详解

${title}的语法遵循Python的一贯风格——简洁、可读、一致。

\`\`\`python
# ${title} 语法模板
# 这是注释，解释每个部分的作用

# 第一步：准备数据
sample_data = [10, 20, 30, 40, 50]

# 第二步：使用${title}处理数据
processed = []
for value in sample_data:
    # 这里体现${title}的核心逻辑
    processed_value = value * 2
    processed.append(processed_value)

print(f"处理结果: {processed}")
\`\`\`

### 3.3 常用方法和属性

| 方法/属性 | 功能 | 示例 |
|-----------|------|------|
| 基础操作 | 最常用的方式 | data.method() |
| 高级操作 | 更强大的功能 | data.advanced() |
| 判断操作 | 检查状态 | if data.check(): |
| 转换操作 | 转换形式 | new_data = data.convert() |

## 四、深入理解

### 4.1 工作原理

理解${title}的工作原理能帮助你更好地使用它，也能在遇到问题时快速定位原因。

当你使用${title}时，Python在底层大致经历以下步骤：

1. **参数校验**：检查输入是否符合预期
2. **内部处理**：执行核心逻辑
3. **内存分配**：如需创建新对象，分配内存
4. **结果返回**：返回处理结果（或None）

### 4.2 与其他特性的关系

${title}不是孤立存在的，它和Python的其他特性紧密相关：

- 与**数据类型**：${title}依赖于特定的数据类型系统
- 与**控制流**：${title}常与if/for等配合使用
- 与**函数**：${title}可以封装在函数中复用
- 与**面向对象**：${title}可以作为类的方法

### 4.3 常见变种和模式

在实际开发中，${title}有几种经典的使用模式：

\`\`\`python
# 模式1：基础模式 - 简单直接
def pattern1(data):
    result = []
    for item in data:
        result.append(process(item))
    return result

# 模式2：推导式模式 - 简洁优雅（如适用）
def pattern2(data):
    return [process(item) for item in data if condition(item)]

# 模式3：函数式模式 - 使用map/filter
def pattern3(data):
    return list(map(process, filter(condition, data)))
\`\`\`

## 五、代码示例大全

### 5.1 入门级示例

\`\`\`python
# 示例1：${title}入门
# 目标：熟悉基本语法

print("=== ${title} 入门示例 ===")

# 创建示例数据
numbers = [1, 2, 3, 4, 5]

# 使用${title}处理
total = 0
for num in numbers:
    total += num

print(f"求和结果: {total}")
print(f"平均值: {total / len(numbers)}")
\`\`\`

### 5.2 进阶级示例

\`\`\`python
# 示例2：${title}进阶应用
# 目标：展示更复杂的用法

from typing import List, Dict, Any

def advanced_example(items: List[Dict[str, Any]]) -> List[str]:
    """
    使用${title}处理复杂数据结构
    
    Args:
        items: 包含字典的列表
        
    Returns:
        处理后的字符串列表
    """
    results = []
    for item in items:
        # 安全获取值，设置默认值
        name = item.get('name', '未知')
        value = item.get('value', 0)
        
        # 业务逻辑处理
        if value > 100:
            status = "高"
        elif value > 50:
            status = "中"
        else:
            status = "低"
        
        results.append(f"{name}: {value} ({status})")
    
    return results

# 测试
test_data = [
    {'name': 'A', 'value': 120},
    {'name': 'B', 'value': 75},
    {'name': 'C', 'value': 30}
]

for line in advanced_example(test_data):
    print(line)
\`\`\`

### 5.3 实战级示例

\`\`\`python
# 示例3：${title}实战应用
# 目标：模拟真实项目中的使用场景

import time
from functools import wraps
from typing import Callable, TypeVar, ParamSpec

P = ParamSpec('P')
R = TypeVar('R')

def timer(func: Callable[P, R]) -> Callable[P, R]:
    """计时装饰器 - 展示${title}在装饰器中的应用"""
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行耗时: {elapsed:.4f}秒")
    return wrapper

@timer
def process_large_dataset(size: int) -> float:
    """处理大量数据 - 展示${title}在数据处理中的应用"""
    total = 0.0
    for i in range(size):
        # 模拟复杂计算
        total += (i * 0.001) ** 0.5
    return total

# 运行
result = process_large_dataset(100000)
print(f"计算结果: {result:.2f}")
\`\`\`

## 六、常见陷阱与踩坑指南

### 6.1 陷阱一：可变默认参数

这是Python初学者最常犯的错误之一：

\`\`\`python
# ❌ 错误写法
def bad_append(item, lst=[]):
    lst.append(item)
    return lst

print(bad_append(1))  # [1]
print(bad_append(2))  # [1, 2] - 不是预期的[2]！
print(bad_append(3))  # [1, 2, 3] - 原因是默认参数只在函数定义时创建一次

# ✅ 正确写法
def good_append(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(good_append(1))  # [1]
print(good_append(2))  # [2]
print(good_append(3))  # [3]
\`\`\`

### 6.2 陷阱二：在循环中修改正在迭代的列表

\`\`\`python
# ❌ 错误：可能导致跳过元素或无限循环
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # 在迭代时修改列表！
print(numbers)  # [1, 3, 5]？可能结果不符合预期

# ✅ 正确：迭代副本或使用列表推导式
numbers = [1, 2, 3, 4, 5]
numbers = [num for num in numbers if num % 2 != 0]
print(numbers)  # [1, 3, 5]
\`\`\`

### 6.3 陷阱三：浮点数精度问题

\`\`\`python
# ❌ 直接比较浮点数
if 0.1 + 0.2 == 0.3:
    print("相等")
else:
    print("不相等")  # 会输出"不相等"，因为0.1+0.2=0.30000000000000004

# ✅ 正确：使用math.isclose比较
import math
if math.isclose(0.1 + 0.2, 0.3):
    print("相等（近似）")

# ✅ 金融计算使用Decimal
from decimal import Decimal
a = Decimal('0.1')
b = Decimal('0.2')
print(a + b)  # 0.3 - 精确表示
\`\`\`

### 6.4 陷阱四：浅拷贝vs深拷贝

\`\`\`python
import copy

# ❌ 意外的引用问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原列表也被修改了！

# ✅ 需要深拷贝时
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原列表不受影响
\`\`\`

### 6.5 陷阱五：is vs ==

\`\`\`python
# is 比较身份（是否同一个对象）
# == 比较值（是否相等）

a = [1, 2, 3]
b = [1, 2, 3]

print(a == b)  # True - 值相等
print(a is b)  # False - 不是同一个对象

# 小整数缓存是特殊情况，不要依赖这个行为
x = 256
y = 256
print(x is y)  # True（CPython小整数缓存）

x = 257
y = 257
print(x is y)  # 可能是False
\`\`\`

## 七、最佳实践

### 7.1 Pythonic写法

什么是Pythonic？就是符合Python习惯和哲学的写法。

\`\`\`python
# ❌ 非Pythonic写法（像C/Java）
result = []
for i in range(len(items)):
    result.append(items[i] * 2)

# ✅ Pythonic写法
result = [item * 2 for item in items]

# ❌ 检查是否在列表中
found = False
for item in items:
    if item == target:
        found = True
        break
if found:
    print("Found")

# ✅ Pythonic写法
if target in items:
    print("Found")
\`\`\`

### 7.2 命名规范

遵循PEP 8命名规范：

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | snake_case | user_name, calculate_total |
| 类 | PascalCase | UserProfile, DataProcessor |
| 常量 | UPPER_SNAKE_CASE | MAX_SIZE, DEFAULT_TIMEOUT |
| 私有属性 | _leading_underscore | _internal_method |
| 魔术方法 | __dunder__ | __init__, __str__ |

### 7.3 类型提示（Python 3.5+）

类型提示让代码更清晰，也便于IDE提供补全和检查：

\`\`\`python
from typing import List, Dict, Optional, Union

def greet(name: str, age: Optional[int] = None) -> str:
    """生成问候语"""
    if age is not None:
        return f"你好{name}，你今年{age}岁！"
    return f"你好{name}！"

def process_items(items: List[int]) -> Dict[str, int]:
    return {
        'sum': sum(items),
        'count': len(items),
        'max': max(items) if items else 0
    }
\`\`\`

### 7.4 错误处理原则

1. **不要捕获所有异常**：避免裸except
2. **具体异常优先**：捕获最具体的异常类型
3. **使用with管理资源**：文件、锁等资源自动释放
4. **早抛出晚捕获**：在错误发生处抛出，在能处理处捕获
5. **提供有意义的错误信息**：让调试更容易

\`\`\`python
# ✅ 推荐的错误处理
import logging

def load_config(path: str) -> dict:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            import json
            return json.load(f)
    except FileNotFoundError:
        logging.warning(f"配置文件不存在: {path}，使用默认配置")
        return get_default_config()
    except json.JSONDecodeError as e:
        logging.error(f"配置文件格式错误: {e}")
        raise ConfigError(f"配置文件无效: {e}") from e
    except PermissionError:
        logging.error(f"没有权限读取配置文件: {path}")
        raise
\`\`\`

## 八、性能优化

### 8.1 时间复杂度意识

了解常用操作的时间复杂度：

| 操作 | list | dict | set |
|------|------|------|-----|
| 索引访问 | O(1) | O(1) | - |
| 追加元素 | O(1)摊销 | O(1) | O(1) |
| 查找元素 | O(n) | O(1) | O(1) |
| 插入头部 | O(n) | O(1) | - |
| 删除元素 | O(n) | O(1) | O(1) |

### 8.2 选择合适的数据结构

\`\`\`python
# ❌ 频繁查找用列表 - O(n)
def check_exists_list(items, target):
    for item in items:
        if item == target:
            return True
    return False

# ✅ 频繁查找用集合 - O(1)
def check_exists_set(items_set, target):
    return target in items_set
\`\`\`

### 8.3 使用标准库和内置函数

Python标准库经过高度优化，尽量使用它们：

\`\`\`python
# ❌ 自己实现排序 - 慢且容易出错
def my_sort(data):
    # ... 自己写的排序算法
    pass

# ✅ 使用内置sorted - Timsort算法，高度优化
result = sorted(data)

# ❌ 手动拼接字符串 - 创建大量临时对象
result = ''
for s in strings:
    result += s

# ✅ 使用join - 一次分配内存
result = ''.join(strings)
\`\`\`

## 九、调试技巧

### 9.1 使用print调试

\`\`\`python
# 简单但有效的调试方法
def buggy_function(x, y):
    print(f"DEBUG: x={x}, y={y}")  # 打印输入
    result = x / (y - 1)
    print(f"DEBUG: result={result}")  # 打印输出
    return result

# 使用repr查看更准确的信息
print(f"repr: {repr(some_value)}")
\`\`\`

### 9.2 使用pdb调试器

\`\`\`python
import pdb

def process(data):
    result = []
    for item in data:
        # 设置断点
        # pdb.set_trace()  # Python 3.7前
        breakpoint()      # Python 3.7+
        transformed = transform(item)
        result.append(transformed)
    return result
\`\`\`

pdb常用命令：
- \`n\`(next)：执行下一行
- \`s\`(step)：进入函数
- \`c\`(continue)：继续执行
- \`p var\`：打印变量值
- \`l\`(list)：显示代码
- \`q\`(quit)：退出

### 9.3 使用logging模块

\`\`\`python
import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

logging.debug("调试信息")
logging.info("一般信息")
logging.warning("警告信息")
logging.error("错误信息")
\`\`\`

## 十、练习题

### 10.1 基础练习

1. **练习1**：使用${title}写一个函数，计算列表中所有偶数的和
2. **练习2**：利用${title}的知识，实现一个简单的待办事项列表
3. **练习3**：编写一个函数，统计一段文本中每个单词出现的次数

### 10.2 进阶练习

1. **练习4**：实现一个装饰器，记录函数被调用的次数
2. **练习5**：使用生成器实现斐波那契数列
3. **练习6**：写一个上下文管理器，计算代码块执行时间

### 10.3 挑战练习

1. **练习7**：实现一个简单的ORM（对象关系映射）
2. **练习8**：使用元类实现单例模式
3. **练习9**：编写一个异步爬虫，并发下载网页

## 十一、延伸阅读

### 11.1 推荐书籍

- 《流畅的Python》- Luciano Ramalho
- 《Python Cookbook》- David Beazley
- 《Effective Python》- Brett Slatkin
- 《Python源码剖析》- 陈儒

### 11.2 官方文档

- [Python官方文档](https://docs.python.org/)
- [PEP 8 -- Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [Python标准库](https://docs.python.org/3/library/)

### 11.3 在线资源

- Real Python（realpython.com）
- Python官方教程
- GitHub上的开源项目学习

---

## 本章总结

${title}是Python编程的重要主题。通过本章的学习，你应该：

1. **理解概念**：知道${title}是什么、为什么需要它
2. **掌握语法**：能够正确使用${title}编写代码
3. **避免陷阱**：认识常见错误并知道如何规避
4. **遵循最佳实践**：写出Pythonic的高质量代码
5. **懂得优化**：了解性能考量，选择合适的写法
6. **会调试**：遇到问题时能够定位和修复

**下一步建议**：
- 动手完成本章的练习题
- 在实际项目中尝试运用${title}
- 阅读优秀开源代码中${title}的用法
- 结合type hints提升代码健壮性
- 持续练习，直到${title}成为你的肌肉记忆

记住，编程是一门实践的艺术。光看不练假把式，打开你的编辑器，开始写代码吧！
`;
}

// Generate all chapter files
function generateBatchFile(batchNum, chapters, filename) {
  const chaptersCode = chapters.map((ch, idx) => {
    const chapter = generateFullChapter(ch, ch.group || findGroupName(ch.id, progGuideGroups.concat(pyDefGroups)), ch.icon || '📄');
    return `  {
    id: "${chapter.id}",
    group: "${chapter.group}",
    icon: "${chapter.icon}",
    title: "${chapter.title}",
    content: \`${chapter.content}\`
  }`;
  }).join(',\n');

  const fileContent = `// =============================================================
// Auto-generated chapter file - Batch ${batchNum}
// =============================================================

export const chapters = [
${chaptersCode}
];
`;

  fs.writeFileSync(path.join(appDir, filename), fileContent, 'utf-8');
  console.log(`Generated: ${filename}`);
}

function findGroupName(id, groups) {
  for (const group of groups) {
    for (const ch of group.chapters) {
      if (ch.id === id) return group.name;
    }
  }
  return "其他";
}

// Generate prog-guide batches
let chapterIndex = 0;
for (let batch = 1; batch <= 10; batch++) {
  const batchChapters = [];
  for (let i = 0; i < 8; i++) {
    if (chapterIndex < 80) {
      const groupIdx = Math.floor(chapterIndex / 8);
      const chInGroup = chapterIndex % 8;
      const group = progGuideGroups[groupIdx];
      if (group && group.chapters[chInGroup]) {
        batchChapters.push({
          ...group.chapters[chInGroup],
          group: group.name,
          icon: group.icon
        });
      }
      chapterIndex++;
    }
  }
  generateBatchFile(batch, batchChapters, `prog-guide-chapters-batch${batch}.js`);
}

// Generate py-definitive batches
chapterIndex = 0;
for (let batch = 1; batch <= 15; batch++) {
  const batchChapters = [];
  for (let i = 0; i < 8; i++) {
    if (chapterIndex < 120) {
      const groupIdx = Math.floor(chapterIndex / 8);
      const chInGroup = chapterIndex % 8;
      const group = pyDefGroups[groupIdx];
      if (group && group.chapters[chInGroup]) {
        batchChapters.push({
          ...group.chapters[chInGroup],
          group: group.name,
          icon: group.icon
        });
      }
      chapterIndex++;
    }
  }
  generateBatchFile(batch, batchChapters, `py-definitive-chapters-batch${batch}.js`);
}

console.log('\n✅ All chapter files generated successfully!');
console.log(`📖 编程指南: 80 chapters in 10 batches`);
console.log(`📕 Python权威指南: 120 chapters in 15 batches`);
