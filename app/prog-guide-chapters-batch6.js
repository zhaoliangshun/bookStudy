// 编程指南 - 第6批章节
// 分组：面向对象编程

export const chapters = [
  {
    "id": "prog-oop-intro",
    "title": "面向对象编程：思想与概念",
    "icon": "🏛️",
    "group": "面向对象编程",
    content: `
# 面向对象编程：思想与概念

## 一、概述

面向对象编程：思想与概念是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习面向对象编程：思想与概念的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是面向对象编程：思想与概念？

在深入学习之前，让我们先理解面向对象编程：思想与概念的本质。面向对象编程：思想与概念是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 面向对象编程：思想与概念 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要面向对象编程：思想与概念？

在面向对象编程：思想与概念出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

面向对象编程：思想与概念正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_oop_intro(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_oop_intro(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgOopIntroExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[面向对象编程：思想与概念] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示面向对象编程：思想与概念"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

面向对象编程：思想与概念是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解面向对象编程：思想与概念的核心概念和原理
✅ 能够在实际代码中正确应用面向对象编程：思想与概念
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-classes-objects",
    "title": "类与对象：创建自定义类型",
    "icon": "🏗️",
    "group": "面向对象编程",
    content: `
# 类与对象：创建自定义类型

## 一、概述

类与对象：创建自定义类型是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习类与对象：创建自定义类型的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是类与对象：创建自定义类型？

在深入学习之前，让我们先理解类与对象：创建自定义类型的本质。类与对象：创建自定义类型是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 类与对象：创建自定义类型 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要类与对象：创建自定义类型？

在类与对象：创建自定义类型出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

类与对象：创建自定义类型正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_classes_objects(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_classes_objects(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgClassesObjectsExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[类与对象：创建自定义类型] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示类与对象：创建自定义类型"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

类与对象：创建自定义类型是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解类与对象：创建自定义类型的核心概念和原理
✅ 能够在实际代码中正确应用类与对象：创建自定义类型
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-attributes-methods",
    "title": "属性与方法：对象的特征与行为",
    "icon": "⚙️",
    "group": "面向对象编程",
    content: `
# 属性与方法：对象的特征与行为

## 一、概述

属性与方法：对象的特征与行为是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习属性与方法：对象的特征与行为的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是属性与方法：对象的特征与行为？

在深入学习之前，让我们先理解属性与方法：对象的特征与行为的本质。属性与方法：对象的特征与行为是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 属性与方法：对象的特征与行为 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要属性与方法：对象的特征与行为？

在属性与方法：对象的特征与行为出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

属性与方法：对象的特征与行为正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_attributes_methods(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_attributes_methods(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgAttributesMethodsExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[属性与方法：对象的特征与行为] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示属性与方法：对象的特征与行为"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

属性与方法：对象的特征与行为是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解属性与方法：对象的特征与行为的核心概念和原理
✅ 能够在实际代码中正确应用属性与方法：对象的特征与行为
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-encapsulation",
    "title": "封装：隐藏实现细节",
    "icon": "📦",
    "group": "面向对象编程",
    content: `
# 封装：隐藏实现细节

## 一、概述

封装：隐藏实现细节是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习封装：隐藏实现细节的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是封装：隐藏实现细节？

在深入学习之前，让我们先理解封装：隐藏实现细节的本质。封装：隐藏实现细节是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 封装：隐藏实现细节 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要封装：隐藏实现细节？

在封装：隐藏实现细节出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

封装：隐藏实现细节正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_encapsulation(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_encapsulation(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgEncapsulationExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[封装：隐藏实现细节] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示封装：隐藏实现细节"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

封装：隐藏实现细节是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解封装：隐藏实现细节的核心概念和原理
✅ 能够在实际代码中正确应用封装：隐藏实现细节
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-inheritance",
    "title": "继承：代码复用的层级",
    "icon": "🧬",
    "group": "面向对象编程",
    content: `
# 继承：代码复用的层级

## 一、概述

继承：代码复用的层级是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习继承：代码复用的层级的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是继承：代码复用的层级？

在深入学习之前，让我们先理解继承：代码复用的层级的本质。继承：代码复用的层级是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 继承：代码复用的层级 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要继承：代码复用的层级？

在继承：代码复用的层级出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

继承：代码复用的层级正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_inheritance(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_inheritance(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgInheritanceExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[继承：代码复用的层级] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示继承：代码复用的层级"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

继承：代码复用的层级是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解继承：代码复用的层级的核心概念和原理
✅ 能够在实际代码中正确应用继承：代码复用的层级
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-polymorphism",
    "title": "多态：统一接口不同实现",
    "icon": "🎭",
    "group": "面向对象编程",
    content: `
# 多态：统一接口不同实现

## 一、概述

多态：统一接口不同实现是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习多态：统一接口不同实现的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是多态：统一接口不同实现？

在深入学习之前，让我们先理解多态：统一接口不同实现的本质。多态：统一接口不同实现是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 多态：统一接口不同实现 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要多态：统一接口不同实现？

在多态：统一接口不同实现出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

多态：统一接口不同实现正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_polymorphism(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_polymorphism(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgPolymorphismExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[多态：统一接口不同实现] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示多态：统一接口不同实现"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

多态：统一接口不同实现是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解多态：统一接口不同实现的核心概念和原理
✅ 能够在实际代码中正确应用多态：统一接口不同实现
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-composition",
    "title": "组合vs继承：has-a与is-a",
    "icon": "🧩",
    "group": "面向对象编程",
    content: `
# 组合vs继承：has-a与is-a

## 一、概述

组合vs继承：has-a与is-a是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习组合vs继承：has-a与is-a的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是组合vs继承：has-a与is-a？

在深入学习之前，让我们先理解组合vs继承：has-a与is-a的本质。组合vs继承：has-a与is-a是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 组合vs继承：has-a与is-a | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要组合vs继承：has-a与is-a？

在组合vs继承：has-a与is-a出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

组合vs继承：has-a与is-a正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_composition(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_composition(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgCompositionExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[组合vs继承：has-a与is-a] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示组合vs继承：has-a与is-a"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

组合vs继承：has-a与is-a是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解组合vs继承：has-a与is-a的核心概念和原理
✅ 能够在实际代码中正确应用组合vs继承：has-a与is-a
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  },
  {
    "id": "prog-oop-pitfalls",
    "title": "面向对象常见误区",
    "icon": "⚠️",
    "group": "面向对象编程",
    content: `
# 面向对象常见误区

## 一、概述

面向对象常见误区是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习面向对象常见误区的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是面向对象常见误区？

在深入学习之前，让我们先理解面向对象常见误区的本质。面向对象常见误区是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 面向对象常见误区 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要面向对象常见误区？

在面向对象常见误区出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

面向对象常见误区正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_oop_pitfalls(data) {
    // 第一步：验证输入
    if (!data) {
        throw new Error('输入数据不能为空');
    }
    
    // 第二步：处理数据
    const result = processData(data);
    
    // 第三步：返回结果
    return result;
}

function processData(data) {
    // 具体的处理逻辑
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}

// 使用示例
const testData = [
    { id: 1, name: '示例1' },
    { id: 2, name: '示例2' }
];

const results = demonstrateprog_oop_pitfalls(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgOopPitfallsExample {
    constructor(options = {}) {
        this.options = {
            debug: false,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        this.cache = new Map();
    }
    
    async execute(input) {
        const cacheKey = this.generateCacheKey(input);
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            this.log('从缓存返回结果');
            return this.cache.get(cacheKey);
        }
        
        // 重试逻辑
        let lastError;
        for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
            try {
                this.log(\`尝试第 \${attempt} 次执行\`);
                const result = await this.doExecute(input);
                this.cache.set(cacheKey, result);
                return result;
            } catch (error) {
                lastError = error;
                this.log(\`第 \${attempt} 次尝试失败: \${error.message}\`);
                await this.delay(1000 * attempt);
            }
        }
        
        throw new Error(\`执行失败，已重试\${this.options.maxRetries}次: \${lastError.message}\`);
    }
    
    async doExecute(input) {
        // 实际的执行逻辑
        return { success: true, data: input };
    }
    
    generateCacheKey(input) {
        return JSON.stringify(input);
    }
    
    log(message) {
        if (this.options.debug) {
            console.log(\`[面向对象常见误区] \${message}\`);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
\`\`\`

### 3.3 Python示例

如果你更熟悉Python，这里是对应的例子：

\`\`\`python
# Python示例
from typing import Any, Dict, List, Optional
import time
import functools


def timer(func):
    """装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            print(f"{func.__name__} 执行时间: {elapsed:.4f}秒")
    return wrapper


class DataProcessor:
    """数据处理器 - 演示面向对象常见误区"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self._cache: Dict[str, Any] = {}
    
    @timer
    def process(self, items: List[Any]) -> List[Any]:
        """处理数据列表"""
        results = []
        for item in items:
            processed = self._process_single(item)
            results.append(processed)
        return results
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        cache_key = str(item)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # 处理逻辑
        result = {
            'original': item,
            'processed': True,
            'length': len(str(item)) if hasattr(item, '__len__') else 0
        }
        
        self._cache[cache_key] = result
        return result


# 使用示例
if __name__ == '__main__':
    processor = DataProcessor()
    data = ['apple', 'banana', 'cherry', 'date']
    results = processor.process(data)
    
    for item in results:
        print(f"原始: {item['original']:10} 长度: {item['length']}")

\`\`\`

## 四、常见陷阱与注意事项

### 4.1 新手常犯的错误

| 错误类型 | 错误示例 | 正确做法 |
|---------|---------|---------|
| 过度复杂化 | 一个函数写几百行 | 拆分成小函数，单一职责 |
| 忽略边界条件 | 不处理空输入、极端值 | 总是验证输入，考虑边缘情况 |
| 硬编码值 | 直接在代码中写魔法数字 | 使用常量或配置 |
| 不处理错误 | 假设所有操作都会成功 | 使用try-catch/异常处理 |
| 过度优化 | 一开始就纠结性能 | 先写正确的代码，再优化 |

### 4.2 需要特别注意的点

1. **可变默认参数问题**（Python）

\`\`\`python
# ❌ 错误：可变默认参数
def append_to(item, target=[]):
    target.append(item)
    return target

# ✅ 正确：使用None作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
\`\`\`

2. **浮点数精度问题**

\`\`\`javascript
// ❌ 错误：直接比较浮点数
console.log(0.1 + 0.2 === 0.3); // false

// ✅ 正确：使用精度范围比较
function nearlyEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
\`\`\`

3. **异步代码陷阱**

\`\`\`javascript
// ❌ 错误：在循环中使用await（可以但需理解行为）
// 如果你想要顺序执行，这没问题；如果想并行，应该用Promise.all

// ✅ 并行执行
const results = await Promise.all(
    items.map(item => processItem(item))
);

\`\`\`

## 五、最佳实践

### 5.1 编码原则

**SOLID原则（面向对象）：**

| 原则 | 全称 | 含义 |
|-----|------|------|
| S | 单一职责原则 | 一个类只做一件事 |
| O | 开闭原则 | 对扩展开放，对修改关闭 |
| L | 里氏替换原则 | 子类可以替换父类 |
| I | 接口隔离原则 | 使用小而专一的接口 |
| D | 依赖倒置原则 | 依赖抽象而非具体实现 |

**通用编程原则：**

1. **KISS原则** - Keep It Simple, Stupid
   - 保持简单直接，不要过度设计
   - 如果有两个方案，选择简单的那个

2. **DRY原则** - Don't Repeat Yourself
   - 任何重复的代码都应该提取出来
   - 但要注意：不要为了DRY而DRY，适当的重复有时比错误的抽象更好

3. **YAGNI原则** - You Aren't Gonna Need It
   - 不要实现你认为将来可能需要的功能
   - 只实现当前确实需要的功能

### 5.2 代码风格建议

\`\`\`javascript
// ✅ 好的代码风格示例
function calculateTotalPrice(items, taxRate = 0.1) {
    // 验证输入
    if (!Array.isArray(items)) {
        throw new TypeError('items必须是数组');
    }
    
    // 计算小计
    const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('无效的商品价格');
        }
        return sum + item.price * (item.quantity || 1);
    }, 0);
    
    // 计算税费和总价
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // 返回结果（使用对象而不是多个返回值）
    return {
        subtotal: roundToTwo(subtotal),
        tax: roundToTwo(tax),
        total: roundToTwo(total)
    };
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

\`\`\`

## 六、实战练习

### 练习1：基础应用

**题目：** 实现一个简单的待办事项管理器，需要支持：
- 添加待办事项
- 标记完成/未完成
- 删除待办
- 筛选显示（全部/已完成/未完成）

**提示：**
- 使用合适的数据结构存储待办事项
- 考虑使用面向对象或函数式风格
- 添加适当的错误处理

### 练习2：进阶挑战

**题目：** 实现一个简单的缓存系统，需要：
- 支持设置过期时间
- LRU（最近最少使用）淘汰策略
- 最大容量限制
- 统计命中率

### 练习3：代码审查

找出下面代码的问题并重构：

\`\`\`javascript
// 这段代码有什么问题？
function process(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].active) {
            if (data[i].score > 60) {
                result.push(data[i].name + ':' + data[i].score);
            }
        }
    }
    return result;
}
\`\`\`

**参考答案要点：**
- 使用const/let替代var
- 使用有意义的变量名
- 提前返回减少嵌套
- 使用filter/map替代for循环
- 添加类型检查
- 添加注释

## 七、小结

面向对象常见误区是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解面向对象常见误区的核心概念和原理
✅ 能够在实际代码中正确应用面向对象常见误区
✅ 知道常见的陷阱以及如何避免
✅ 了解相关的最佳实践
✅ 能够写出更清晰、更健壮的代码

记住，编程是一门实践的艺术。仅仅阅读是不够的，你需要动手写代码，犯错，调试，然后从错误中学习。建议你完成本章的所有练习，并尝试在实际项目中应用学到的知识。

### 下一步学习建议

1. **动手实践**：找一个小项目来练习本章内容
2. **阅读优秀代码**：看看开源项目中是如何使用这些概念的
3. **代码审查**：让其他人审查你的代码，同时也审查别人的代码
4. **教别人**：尝试把学到的知识教给其他人，这是最好的学习方式
5. **持续学习**：编程世界日新月异，保持好奇心和学习热情

---

**拓展阅读推荐：**
- 《代码整洁之道》- Robert C. Martin
- 《重构：改善既有代码的设计》- Martin Fowler
- 《设计模式》- GoF
- 《程序员修炼之道》- Hunt & Thomas

祝你编程学习之旅愉快！🚀
`
  }
];
