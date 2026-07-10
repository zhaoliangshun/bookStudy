// 编程指南 - 第4批章节
// 分组：函数与模块化

export const chapters = [
  {
    "id": "prog-functions-intro",
    "title": "函数入门：封装可重用的代码",
    "icon": "📦",
    "group": "函数与模块化",
    content: `
# 函数入门：封装可重用的代码

## 一、概述

函数入门：封装可重用的代码是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习函数入门：封装可重用的代码的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是函数入门：封装可重用的代码？

在深入学习之前，让我们先理解函数入门：封装可重用的代码的本质。函数入门：封装可重用的代码是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 函数入门：封装可重用的代码 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要函数入门：封装可重用的代码？

在函数入门：封装可重用的代码出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

函数入门：封装可重用的代码正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_functions_intro(data) {
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

const results = demonstrateprog_functions_intro(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgFunctionsIntroExample {
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
            console.log(\`[函数入门：封装可重用的代码] \${message}\`);
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
    """数据处理器 - 演示函数入门：封装可重用的代码"""
    
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

函数入门：封装可重用的代码是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解函数入门：封装可重用的代码的核心概念和原理
✅ 能够在实际代码中正确应用函数入门：封装可重用的代码
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
    "id": "prog-params-return",
    "title": "参数与返回值：函数的输入输出",
    "icon": "📥",
    "group": "函数与模块化",
    content: `
# 参数与返回值：函数的输入输出

## 一、概述

参数与返回值：函数的输入输出是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习参数与返回值：函数的输入输出的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是参数与返回值：函数的输入输出？

在深入学习之前，让我们先理解参数与返回值：函数的输入输出的本质。参数与返回值：函数的输入输出是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 参数与返回值：函数的输入输出 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要参数与返回值：函数的输入输出？

在参数与返回值：函数的输入输出出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

参数与返回值：函数的输入输出正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_params_return(data) {
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

const results = demonstrateprog_params_return(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgParamsReturnExample {
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
            console.log(\`[参数与返回值：函数的输入输出] \${message}\`);
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
    """数据处理器 - 演示参数与返回值：函数的输入输出"""
    
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

参数与返回值：函数的输入输出是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解参数与返回值：函数的输入输出的核心概念和原理
✅ 能够在实际代码中正确应用参数与返回值：函数的输入输出
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
    "id": "prog-scope",
    "title": "作用域：变量的可见性与生命周期",
    "icon": "🔍",
    "group": "函数与模块化",
    content: `
# 作用域：变量的可见性与生命周期

## 一、概述

作用域：变量的可见性与生命周期是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习作用域：变量的可见性与生命周期的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是作用域：变量的可见性与生命周期？

在深入学习之前，让我们先理解作用域：变量的可见性与生命周期的本质。作用域：变量的可见性与生命周期是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 作用域：变量的可见性与生命周期 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要作用域：变量的可见性与生命周期？

在作用域：变量的可见性与生命周期出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

作用域：变量的可见性与生命周期正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_scope(data) {
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

const results = demonstrateprog_scope(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgScopeExample {
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
            console.log(\`[作用域：变量的可见性与生命周期] \${message}\`);
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
    """数据处理器 - 演示作用域：变量的可见性与生命周期"""
    
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

作用域：变量的可见性与生命周期是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解作用域：变量的可见性与生命周期的核心概念和原理
✅ 能够在实际代码中正确应用作用域：变量的可见性与生命周期
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
    "id": "prog-recursion",
    "title": "递归入门：函数调用自身",
    "icon": "🔄",
    "group": "函数与模块化",
    content: `
# 递归入门：函数调用自身

## 一、概述

递归入门：函数调用自身是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习递归入门：函数调用自身的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是递归入门：函数调用自身？

在深入学习之前，让我们先理解递归入门：函数调用自身的本质。递归入门：函数调用自身是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 递归入门：函数调用自身 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要递归入门：函数调用自身？

在递归入门：函数调用自身出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

递归入门：函数调用自身正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_recursion(data) {
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

const results = demonstrateprog_recursion(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgRecursionExample {
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
            console.log(\`[递归入门：函数调用自身] \${message}\`);
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
    """数据处理器 - 演示递归入门：函数调用自身"""
    
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

递归入门：函数调用自身是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解递归入门：函数调用自身的核心概念和原理
✅ 能够在实际代码中正确应用递归入门：函数调用自身
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
    "id": "prog-modules",
    "title": "模块化编程：组织大型代码库",
    "icon": "📚",
    "group": "函数与模块化",
    content: `
# 模块化编程：组织大型代码库

## 一、概述

模块化编程：组织大型代码库是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习模块化编程：组织大型代码库的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是模块化编程：组织大型代码库？

在深入学习之前，让我们先理解模块化编程：组织大型代码库的本质。模块化编程：组织大型代码库是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 模块化编程：组织大型代码库 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要模块化编程：组织大型代码库？

在模块化编程：组织大型代码库出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

模块化编程：组织大型代码库正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_modules(data) {
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

const results = demonstrateprog_modules(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgModulesExample {
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
            console.log(\`[模块化编程：组织大型代码库] \${message}\`);
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
    """数据处理器 - 演示模块化编程：组织大型代码库"""
    
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

模块化编程：组织大型代码库是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解模块化编程：组织大型代码库的核心概念和原理
✅ 能够在实际代码中正确应用模块化编程：组织大型代码库
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
    "id": "prog-builtin-functions",
    "title": "内置函数与标准库：不要重复造轮子",
    "icon": "🏭",
    "group": "函数与模块化",
    content: `
# 内置函数与标准库：不要重复造轮子

## 一、概述

内置函数与标准库：不要重复造轮子是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习内置函数与标准库：不要重复造轮子的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是内置函数与标准库：不要重复造轮子？

在深入学习之前，让我们先理解内置函数与标准库：不要重复造轮子的本质。内置函数与标准库：不要重复造轮子是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 内置函数与标准库：不要重复造轮子 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要内置函数与标准库：不要重复造轮子？

在内置函数与标准库：不要重复造轮子出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

内置函数与标准库：不要重复造轮子正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_builtin_functions(data) {
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

const results = demonstrateprog_builtin_functions(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgBuiltinFunctionsExample {
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
            console.log(\`[内置函数与标准库：不要重复造轮子] \${message}\`);
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
    """数据处理器 - 演示内置函数与标准库：不要重复造轮子"""
    
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

内置函数与标准库：不要重复造轮子是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解内置函数与标准库：不要重复造轮子的核心概念和原理
✅ 能够在实际代码中正确应用内置函数与标准库：不要重复造轮子
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
    "id": "prog-error-handling",
    "title": "错误处理基础：预防和处理异常",
    "icon": "⚠️",
    "group": "函数与模块化",
    content: `
# 错误处理基础：预防和处理异常

## 一、概述

错误处理基础：预防和处理异常是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习错误处理基础：预防和处理异常的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是错误处理基础：预防和处理异常？

在深入学习之前，让我们先理解错误处理基础：预防和处理异常的本质。错误处理基础：预防和处理异常是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 错误处理基础：预防和处理异常 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要错误处理基础：预防和处理异常？

在错误处理基础：预防和处理异常出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

错误处理基础：预防和处理异常正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_error_handling(data) {
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

const results = demonstrateprog_error_handling(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgErrorHandlingExample {
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
            console.log(\`[错误处理基础：预防和处理异常] \${message}\`);
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
    """数据处理器 - 演示错误处理基础：预防和处理异常"""
    
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

错误处理基础：预防和处理异常是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解错误处理基础：预防和处理异常的核心概念和原理
✅ 能够在实际代码中正确应用错误处理基础：预防和处理异常
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
    "id": "prog-code-organization",
    "title": "代码组织原则：高内聚低耦合",
    "icon": "🗂️",
    "group": "函数与模块化",
    content: `
# 代码组织原则：高内聚低耦合

## 一、概述

代码组织原则：高内聚低耦合是每一位程序员必须掌握的核心知识。无论你使用什么编程语言，这些基础概念都是相通的。本章将带你系统地学习代码组织原则：高内聚低耦合的方方面面，从基本概念到实际应用，从常见陷阱到最佳实践，帮助你建立扎实的编程基础。

学习编程不仅仅是学习语法，更重要的是理解背后的思想和原理。我们将通过大量的代码示例、类比说明和实战练习，让你真正理解而非死记硬背。

## 二、核心概念详解

### 2.1 什么是代码组织原则：高内聚低耦合？

在深入学习之前，让我们先理解代码组织原则：高内聚低耦合的本质。代码组织原则：高内聚低耦合是编程中用于解决特定问题的一组思想和技术的总称。它不是某一种语言特有的功能，而是所有现代编程语言都支持的通用概念。

想象一下，如果你要盖一栋房子：

| 编程概念 | 建筑类比 | 作用 |
|---------|---------|------|
| 变量 | 建筑材料 | 存储数据 |
| 函数 | 预制构件 | 封装功能 |
| 控制流 | 施工图纸 | 决定执行顺序 |
| 数据结构 | 房间布局 | 组织数据 |
| 代码组织原则：高内聚低耦合 | 核心建筑工艺 | 特定问题解决方案 |

### 2.2 为什么需要代码组织原则：高内聚低耦合？

在代码组织原则：高内聚低耦合出现之前，程序员面临着很多问题：

1. **代码重复**：相同的逻辑需要在多处重复编写
2. **难以维护**：代码结构混乱，修改一处可能影响多处
3. **容易出错**：缺乏系统化的方法，bug频发
4. **协作困难**：没有统一的范式，团队成员代码风格各异

代码组织原则：高内聚低耦合正是为了解决这些问题而产生的。

## 三、实战代码示例

### 3.1 基础示例

让我们从最简单的例子开始：

\`\`\`javascript
// 示例1：基础用法
function demonstrateprog_code_organization(data) {
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

const results = demonstrateprog_code_organization(testData);
console.log('处理结果:', results);
\`\`\`

### 3.2 进阶示例

下面是一个更贴近实际开发的例子：

\`\`\`javascript
// 示例2：实际应用场景
class ProgCodeOrganizationExample {
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
            console.log(\`[代码组织原则：高内聚低耦合] \${message}\`);
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
    """数据处理器 - 演示代码组织原则：高内聚低耦合"""
    
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

代码组织原则：高内聚低耦合是编程学习道路上的重要里程碑。掌握本章内容后，你应该：

✅ 理解代码组织原则：高内聚低耦合的核心概念和原理
✅ 能够在实际代码中正确应用代码组织原则：高内聚低耦合
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
