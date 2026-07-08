// 编程指南 - 第2批章节
// 分组：编程思维与基础概念

export const chapters = [
  {
    "id": "prog-computational-thinking",
    "title": "计算思维：分解、模式识别、抽象、算法",
    "icon": "🧩",
    "group": "编程思维与基础概念",
    content: `
# 计算思维：分解、模式识别、抽象、算法

## 一、概述

计算思维：分解、模式识别、抽象、算法是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习计算思维：分解、模式识别、抽象、算法的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是计算思维：分解、模式识别、抽象、算法？

在深入学习之前，让我们先理解计算思维：分解、模式识别、抽象、算法的本质。计算思维：分解、模式识别、抽象、算法是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 计算思维：分解、模式识别、抽象、算法 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要计算思维：分解、模式识别、抽象、算法？

在计算思维：分解、模式识别、抽象、算法出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

计算思维：分解、模式识别、抽象、算法正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_computational_thinking(data) {
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

const results = demonstrateprog_computational_thinking(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgComputationalThinkingExample {
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
            console.log(\`[计算思维：分解、模式识别、抽象、算法] \${message}\`);
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
    """数据处理器 - 演示计算思维：分解、模式识别、抽象、算法"""
    
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

计算思维：分解、模式识别、抽象、算法是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解计算思维：分解、模式识别、抽象、算法的核心概念和原理
✅ 能够在实际代码中正确应用计算思维：分解、模式识别、抽象、算法
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
    "id": "prog-algorithm-intro",
    "title": "算法入门：什么是算法及如何描述",
    "icon": "📋",
    "group": "编程思维与基础概念",
    content: `
# 算法入门：什么是算法及如何描述

## 一、概述

算法入门：什么是算法及如何描述是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习算法入门：什么是算法及如何描述的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是算法入门：什么是算法及如何描述？

在深入学习之前，让我们先理解算法入门：什么是算法及如何描述的本质。算法入门：什么是算法及如何描述是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 算法入门：什么是算法及如何描述 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要算法入门：什么是算法及如何描述？

在算法入门：什么是算法及如何描述出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

算法入门：什么是算法及如何描述正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_algorithm_intro(data) {
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

const results = demonstrateprog_algorithm_intro(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgAlgorithmIntroExample {
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
            console.log(\`[算法入门：什么是算法及如何描述] \${message}\`);
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
    """数据处理器 - 演示算法入门：什么是算法及如何描述"""
    
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

算法入门：什么是算法及如何描述是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解算法入门：什么是算法及如何描述的核心概念和原理
✅ 能够在实际代码中正确应用算法入门：什么是算法及如何描述
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
    "id": "prog-flowchart",
    "title": "流程图与伪代码：规划你的程序",
    "icon": "📊",
    "group": "编程思维与基础概念",
    content: `
# 流程图与伪代码：规划你的程序

## 一、概述

流程图与伪代码：规划你的程序是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习流程图与伪代码：规划你的程序的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是流程图与伪代码：规划你的程序？

在深入学习之前，让我们先理解流程图与伪代码：规划你的程序的本质。流程图与伪代码：规划你的程序是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 流程图与伪代码：规划你的程序 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要流程图与伪代码：规划你的程序？

在流程图与伪代码：规划你的程序出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

流程图与伪代码：规划你的程序正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_flowchart(data) {
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

const results = demonstrateprog_flowchart(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgFlowchartExample {
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
            console.log(\`[流程图与伪代码：规划你的程序] \${message}\`);
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
    """数据处理器 - 演示流程图与伪代码：规划你的程序"""
    
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

流程图与伪代码：规划你的程序是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解流程图与伪代码：规划你的程序的核心概念和原理
✅ 能够在实际代码中正确应用流程图与伪代码：规划你的程序
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
    "id": "prog-variables-memory",
    "title": "变量与内存：数据存储的秘密",
    "icon": "📦",
    "group": "编程思维与基础概念",
    content: `
# 变量与内存：数据存储的秘密

## 一、概述

变量与内存：数据存储的秘密是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习变量与内存：数据存储的秘密的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是变量与内存：数据存储的秘密？

在深入学习之前，让我们先理解变量与内存：数据存储的秘密的本质。变量与内存：数据存储的秘密是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 变量与内存：数据存储的秘密 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要变量与内存：数据存储的秘密？

在变量与内存：数据存储的秘密出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

变量与内存：数据存储的秘密正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_variables_memory(data) {
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

const results = demonstrateprog_variables_memory(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgVariablesMemoryExample {
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
            console.log(\`[变量与内存：数据存储的秘密] \${message}\`);
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
    """数据处理器 - 演示变量与内存：数据存储的秘密"""
    
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

变量与内存：数据存储的秘密是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解变量与内存：数据存储的秘密的核心概念和原理
✅ 能够在实际代码中正确应用变量与内存：数据存储的秘密
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
    "id": "prog-data-types-intro",
    "title": "数据类型概述：数字、文本、布尔值",
    "icon": "🏷️",
    "group": "编程思维与基础概念",
    content: `
# 数据类型概述：数字、文本、布尔值

## 一、概述

数据类型概述：数字、文本、布尔值是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习数据类型概述：数字、文本、布尔值的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是数据类型概述：数字、文本、布尔值？

在深入学习之前，让我们先理解数据类型概述：数字、文本、布尔值的本质。数据类型概述：数字、文本、布尔值是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 数据类型概述：数字、文本、布尔值 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要数据类型概述：数字、文本、布尔值？

在数据类型概述：数字、文本、布尔值出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

数据类型概述：数字、文本、布尔值正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_data_types_intro(data) {
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

const results = demonstrateprog_data_types_intro(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgDataTypesIntroExample {
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
            console.log(\`[数据类型概述：数字、文本、布尔值] \${message}\`);
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
    """数据处理器 - 演示数据类型概述：数字、文本、布尔值"""
    
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

数据类型概述：数字、文本、布尔值是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解数据类型概述：数字、文本、布尔值的核心概念和原理
✅ 能够在实际代码中正确应用数据类型概述：数字、文本、布尔值
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
    "id": "prog-operators",
    "title": "运算符：算术、比较、逻辑运算",
    "icon": "➕",
    "group": "编程思维与基础概念",
    content: `
# 运算符：算术、比较、逻辑运算

## 一、概述

运算符：算术、比较、逻辑运算是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习运算符：算术、比较、逻辑运算的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是运算符：算术、比较、逻辑运算？

在深入学习之前，让我们先理解运算符：算术、比较、逻辑运算的本质。运算符：算术、比较、逻辑运算是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 运算符：算术、比较、逻辑运算 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要运算符：算术、比较、逻辑运算？

在运算符：算术、比较、逻辑运算出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

运算符：算术、比较、逻辑运算正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_operators(data) {
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

const results = demonstrateprog_operators(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgOperatorsExample {
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
            console.log(\`[运算符：算术、比较、逻辑运算] \${message}\`);
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
    """数据处理器 - 演示运算符：算术、比较、逻辑运算"""
    
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

运算符：算术、比较、逻辑运算是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解运算符：算术、比较、逻辑运算的核心概念和原理
✅ 能够在实际代码中正确应用运算符：算术、比较、逻辑运算
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
    "id": "prog-expressions",
    "title": "表达式与语句：构建程序的积木",
    "icon": "🧱",
    "group": "编程思维与基础概念",
    content: `
# 表达式与语句：构建程序的积木

## 一、概述

表达式与语句：构建程序的积木是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习表达式与语句：构建程序的积木的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是表达式与语句：构建程序的积木？

在深入学习之前，让我们先理解表达式与语句：构建程序的积木的本质。表达式与语句：构建程序的积木是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 表达式与语句：构建程序的积木 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要表达式与语句：构建程序的积木？

在表达式与语句：构建程序的积木出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

表达式与语句：构建程序的积木正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_expressions(data) {
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

const results = demonstrateprog_expressions(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgExpressionsExample {
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
            console.log(\`[表达式与语句：构建程序的积木] \${message}\`);
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
    """数据处理器 - 演示表达式与语句：构建程序的积木"""
    
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

表达式与语句：构建程序的积木是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解表达式与语句：构建程序的积木的核心概念和原理
✅ 能够在实际代码中正确应用表达式与语句：构建程序的积木
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
    "id": "prog-input-output",
    "title": "输入与输出：程序与用户的交互",
    "icon": "🔄",
    "group": "编程思维与基础概念",
    content: `
# 输入与输出：程序与用户的交互

## 一、概述

输入与输出：程序与用户的交互是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习输入与输出：程序与用户的交互的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是输入与输出：程序与用户的交互？

在深入学习之前，让我们先理解输入与输出：程序与用户的交互的本质。输入与输出：程序与用户的交互是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 输入与输出：程序与用户的交互 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要输入与输出：程序与用户的交互？

在输入与输出：程序与用户的交互出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

输入与输出：程序与用户的交互正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_input_output(data) {
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

const results = demonstrateprog_input_output(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgInputOutputExample {
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
            console.log(\`[输入与输出：程序与用户的交互] \${message}\`);
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
    """数据处理器 - 演示输入与输出：程序与用户的交互"""
    
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

输入与输出：程序与用户的交互是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解输入与输出：程序与用户的交互的核心概念和原理
✅ 能够在实际代码中正确应用输入与输出：程序与用户的交互
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
