// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 3 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-errors",
    icon: "⚠️",
    title: "错误处理机制",
    group: "语法与类型",
    content: `# 错误处理机制

## 一、错误处理：两种哲学的分野

错误处理是衡量一门语言工程化能力的关键指标。Python 和 JavaScript 在这里走出了两条截然不同的路：**Python 把异常当作一等公民**，异常体系森严、层次分明；**JavaScript 的异常则更轻量、更动态**，但也更"松散"。

两者最大的语法差异在 \`else\` 子句——Python 的 \`try\` 语句有四个分支，JS 只有三个。

## 二、基本语法对比

### Python 的 try/except/else/finally

\`\`\`python
# Python：四段式结构
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError as e:
        print(f"捕获到除零错误: {e}")
        return None
    except TypeError as e:
        print(f"类型错误: {e}")
        return None
    else:
        # 只有 try 块没有抛出异常时才执行
        # 关键：这里的代码不会被上面的 except 捕获
        print(f"计算成功: {result}")
        return result
    finally:
        # 无论是否异常，都会执行（即使 return 了）
        print("清理工作完成")

divide(10, 2)   # 会执行 else 和 finally
divide(10, 0)   # 会执行 except 和 finally
\`\`\`

### JavaScript 的 try/catch/finally

\`\`\`javascript
// JavaScript：三段式结构，没有 else
function divide(a, b) {
    try {
        const result = a / b;
        // JS 里 0 不会抛错，结果是 Infinity
        if (!isFinite(result)) {
            throw new Error("除零或非有限值");
        }
        console.log(\`计算成功: \${result}\`);
        return result;
    } catch (e) {
        // catch 会捕获 try 块里所有抛出的异常
        // 注意：上面的 console.log 也在 try 里，如果它抛错也会被捕获
        console.log(\`捕获到错误: \${e.message}\`);
        return null;
    } finally {
        console.log("清理工作完成");
    }
}

divide(10, 2);   // 会执行 finally
divide(10, 0);   // 会执行 catch 和 finally
\`\`\`

### 关键差异：else 子句为什么重要

Python 的 \`else\` 看起来"多余"，但它解决了一个真实痛点：**错误捕获范围过大的问题**。

\`\`\`python
# Python：else 让"成功路径"的代码不被意外捕获
try:
    data = load_config()
except FileNotFoundError:
    data = default_config()
else:
    # 如果 process() 抛出 ValueError，不会被上面的 except 捕获
    # 它会正常向上传播
    process(data)
\`\`\`

\`\`\`javascript
// JavaScript：没有 else，process 的错误可能被意外捕获
try {
    const data = loadConfig();
    // 如果 process() 抛出 Error，会被下面的 catch 捕获
    // 这通常不是我们想要的
    process(data);
} catch (e) {
    // 这里会捕获到 loadConfig 和 process 的所有错误
    const data = defaultConfig();
}
\`\`\`

JS 的应对方式是把 \`try\` 块写小，或者用条件判断区分错误类型：

\`\`\`javascript
// JS：把 try 范围缩小
let data;
try {
    data = loadConfig();
} catch (e) {
    data = defaultConfig();
}
process(data);  // 错误正常传播
\`\`\`

## 三、异常类型体系

### Python：严格的异常层次结构

Python 的异常是一棵树，根是 \`BaseException\`，所有内置异常都从它派生。**实际编码应该只捕获 \`Exception\` 的子类**——\`SystemExit\`、\`KeyboardInterrupt\` 这类"系统级"异常不归你管。

\`\`\`python
# Python 异常层次（部分）
# BaseException
#  ├── SystemExit              # sys.exit() 触发
#  ├── KeyboardInterrupt       # Ctrl+C
#  ├── GeneratorExit           # 生成器关闭
#  └── Exception               # 所有"普通"异常的根
#       ├── StopIteration
#       ├── ArithmeticError
#       │    ├── ZeroDivisionError
#       │    └── OverflowError
#       ├── LookupError
#       │    ├── IndexError
#       │    └── KeyError
#       ├── OSError
#       │    ├── FileNotFoundError
#       │    └── PermissionError
#       ├── ValueError
#       │    └── UnicodeDecodeError
#       ├── TypeError
#       └── AttributeError

try:
    value = int("abc")
except ValueError as e:
    # 捕获特定类型，错误信息明确
    print(f"值错误: {e}")
except Exception as e:
    # 兜底，但不该捕获 SystemExit/KeyboardInterrupt
    print(f"其他异常: {e}")
\`\`\`

### JavaScript：扁平的 Error 家族

JS 的异常体系要扁平得多，根是 \`Error\`，内置子类屈指可数：

\`\`\`javascript
// JavaScript 内置 Error 类型
// Error                     // 基类
//  ├── TypeError            // 类型错误
//  ├── RangeError           // 值超出范围
//  ├── SyntaxError          // 语法错误（通常在解析阶段）
//  ├── ReferenceError       // 引用未定义变量
//  ├── URIError             // URI 编解码错误
//  ├── EvalError            // eval 相关（已基本废弃）
//  └── AggregateError       // 多个错误聚合（ES2021）

try {
    const obj = null;
    obj.foo();  // TypeError: Cannot read properties of null
} catch (e) {
    if (e instanceof TypeError) {
        console.log("类型错误:", e.message);
    } else if (e instanceof RangeError) {
        console.log("范围错误:", e.message);
    } else {
        console.log("其他错误:", e.message);
    }
}
\`\`\`

### 对比表

| 维度 | Python | JavaScript |
|------|--------|------------|
| 异常根类 | BaseException | Error |
| 层次深度 | 深（4-5 层） | 浅（1-2 层） |
| 内置异常数量 | 60+ | 7 个 |
| 系统级异常分离 | ✅（BaseException 直接子类） | ❌（全归 Error） |
| 捕获语法 | except Type as e | catch (e) + instanceof |
| 多类型捕获 | except (A, B) | 需 if 判断 |

Python 的设计更"工程化"——异常类型丰富意味着你可以精确捕获，而不用担心"误伤"。JS 的扁平结构简单，但实践中常需要靠 \`e.message\` 或 \`e.code\` 来区分错误。

## 四、自定义异常

### Python：继承 Exception

\`\`\`python
# Python：自定义异常继承 Exception（或更具体的子类）
class InvalidUserError(Exception):
    """用户数据无效"""
    def __init__(self, username, reason):
        self.username = username
        self.reason = reason
        super().__init__(f"用户 '{username}' 无效: {reason}")

class AuthenticationError(Exception):
    pass

class PermissionDeniedError(AuthenticationError):
    pass

# 使用：可以按层次捕获
try:
    raise PermissionDeniedError("admin", "需要 2FA")
except PermissionDeniedError:
    print("权限不足")  # 精确捕获
except AuthenticationError:
    print("认证失败")  # 父类兜底（上面已捕获就不会到这里）
except InvalidUserError:
    print("用户无效")
\`\`\`

### JavaScript：继承 Error

\`\`\`javascript
// JavaScript：自定义错误继承 Error
class InvalidUserError extends Error {
    constructor(username, reason) {
        super(\`用户 '\${username}' 无效: \${reason}\`);
        this.name = "InvalidUserError";  // 必须手动设置 name
        this.username = username;
        this.reason = reason;
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthenticationError";
    }
}

class PermissionDeniedError extends AuthenticationError {
    constructor(username, reason) {
        super(\`权限不足: \${reason}\`);
        this.name = "PermissionDeniedError";
        this.username = username;
    }
}

// 使用：用 instanceof 判断
try {
    throw new PermissionDeniedError("admin", "需要 2FA");
} catch (e) {
    if (e instanceof PermissionDeniedError) {
        console.log("权限不足");
    } else if (e instanceof AuthenticationError) {
        console.log("认证失败");
    } else if (e instanceof InvalidUserError) {
        console.log("用户无效");
    }
}
\`\`\`

注意一个坑：**JS 的 instanceof 在跨 realm（如 iframe、vm 模块）时会失效**，因为不同 realm 有不同的 Error 构造函数。Python 没这个问题——异常类是全局唯一的。

## 五、异常传播与重新抛出

两门语言都支持"捕获后重新抛出"，但语义略有不同：

\`\`\`python
# Python：raise 不带参数，重新抛出当前异常（保留原始 traceback）
def process_data():
    try:
        data = fetch()
    except ConnectionError:
        log.error("连接失败，准备重试")
        raise  # 重新抛出，保留原始调用栈
\`\`\`

\`\`\`javascript
// JavaScript：throw 不带参数会语法错误，必须 throw e
function processData() {
    try {
        const data = fetch();
    } catch (e) {
        console.error("连接失败，准备重试");
        throw e;  // 重新抛出
    }
}
\`\`\`

Python 3 的 \`raise ... from ...\` 可以**显式链接异常**，表达"这个异常是由那个异常引起的"：

\`\`\`python
# Python 3：异常链
def load_user(id):
    try:
        row = db.query(id)
    except DatabaseError as e:
        # 用 from 显式说明因果关系
        raise UserNotFoundError(f"用户 {id} 不存在") from e

# 输出会显示：
# UserNotFoundError: 用户 123 不存在
# The above exception was the direct cause of the following exception:
# DatabaseError: connection refused
\`\`\`

## 六、上下文管理器 vs JS 的缺失

### Python 的 with 语句

Python 的 \`with\` 是处理资源清理的优雅方案，基于"上下文管理器"协议（\`__enter__\` / \`__exit__\`）：

\`\`\`python
# Python：with 语句保证资源释放，即使异常也会调用 __exit__
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect_to_db()
        return self.conn   # 作为 as 后面的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        # 返回 True 表示"吞掉"异常，返回 False/None 表示继续传播
        return False

# 使用：即使中间抛异常，连接也会关闭
with DatabaseConnection() as conn:
    conn.execute("INSERT ...")
    conn.execute("UPDATE ...")   # 如果这里抛异常
    conn.execute("COMMIT")        # 这行不执行
# __exit__ 仍被调用，连接关闭

# 上下文管理器也可用于事务、锁、计时等
import threading
lock = threading.Lock()
with lock:
    # 临界区，锁会在退出时自动释放
    do_work()
\`\`\`

### JavaScript：没有 with（有个被废弃的同名关键字）

JS **没有等价的 \`with\` 语句**。资源清理依赖 \`try/finally\`，或者用回调/抽象：

\`\`\`javascript
// JavaScript：只能用 try/finally 模拟
class DatabaseConnection {
    static async withConnection(callback) {
        const conn = await connectToDb();
        try {
            return await callback(conn);
        } finally {
            await conn.close();  // 无论是否异常都关闭
        }
    }
}

// 使用：回调风格
await DatabaseConnection.withConnection(async (conn) => {
    await conn.execute("INSERT ...");
    await conn.execute("UPDATE ...");
});

// 或者手动 try/finally
const conn = await connectToDb();
try {
    await conn.execute("INSERT ...");
} finally {
    await conn.close();
}
\`\`\`

Python 的 \`with\` 把"获取-使用-释放"模式标准化了，而 JS 需要为每种资源自己设计 API。**TC39 有过 \`using\` 提案**（Explicit Resource Management），类似 Python 的 \`with\`，但目前尚未广泛落地。

## 七、Python 3.11 异常组 vs JS Error.cause

### Python 3.11：except* 与异常组

3.11 引入了 \`ExceptionGroup\` 和 \`except*\` 语法，专门处理"并发任务中多个异常同时抛出"的场景：

\`\`\`python
# Python 3.11+：异常组
def parallel_tasks():
    raise ExceptionGroup("多个任务失败", [
        ValueError("任务1的值错误"),
        TypeError("任务2的类型错误"),
        ValueError("任务3的值错误"),
    ])

try:
    parallel_tasks()
except* ValueError as eg:
    # except* 会捕获组里所有 ValueError
    print(f"捕获到 {len(eg.exceptions)} 个 ValueError")
except* TypeError as eg:
    print(f"捕获到 {len(eg.exceptions)} 个 TypeError")
# 一个 try 可以被多个 except* 匹配，互不影响
\`\`\`

这在 \`asyncio.TaskGroup\`（3.11+）里特别有用——并发跑多个任务，每个任务可能独立失败，异常组能一次性收集所有失败原因。

### JavaScript：Error.cause（ES2022）

JS 没有异常组，但 ES2022 加了 \`Error.cause\`，用于在包装异常时保留原始错误：

\`\`\`javascript
// JavaScript：Error.cause 链接原始错误
function loadUser(id) {
    try {
        const row = db.query(id);
    } catch (e) {
        // 用 cause 保留原始错误，避免丢失调用栈
        throw new UserNotFoundError(\`用户 \${id} 不存在\`, { cause: e });
    }
}

class UserNotFoundError extends Error {
    constructor(message, options) {
        super(message, options);  // options.cause 会被自动处理
        this.name = "UserNotFoundError";
    }
}

// 捕获后可以遍历 cause 链
try {
    loadUser(123);
} catch (e) {
    let current = e;
    while (current) {
        console.log(current.message);
        current = current.cause;
    }
}
\`\`\`

对比：**Python 的异常组是"宽度"上的扩展**（一次抛多个），**JS 的 cause 是"深度"上的扩展**（链式追溯根因）。两者解决的是不同问题——Python 处理并发失败，JS 处理错误包装时的信息丢失。

## 八、总结对比表

| 维度 | Python | JavaScript |
|------|--------|------------|
| 语句结构 | try/except/else/finally | try/catch/finally |
| 异常根类 | BaseException | Error |
| 异常层次 | 深（60+ 内置类型） | 浅（7 个内置类型） |
| 自定义异常 | 继承 Exception | 继承 Error |
| 重新抛出 | raise（裸） | throw e |
| 异常链 | raise ... from ... | new Error(msg, { cause }) |
| 资源管理 | with 语句（__enter__/__exit__） | try/finally（无标准协议） |
| 多异常聚合 | ExceptionGroup + except*（3.11） | AggregateError（无语法支持） |
| 捕获多类型 | except (A, B) | if + instanceof |
| 跨 realm | 无此问题 | instanceof 失效 |

## 九、设计哲学小结

Python 的异常设计是"**重型工程化**"的——异常类型丰富、层次分明、有专门的资源管理协议，适合构建大型系统。代价是学习曲线陡峭，新手容易被一堆异常类劝退。

JavaScript 的异常设计是"**轻量实用**"的——类型少、语法简单、动态性强，适合快速迭代。代价是大型项目里错误处理容易"打补丁式"堆砌，需要团队自律。

下一章我们会看两门语言的**模块系统**——这同样是工程化的核心战场。`,
  },
  {
    id: "pyvsjs-modules",
    icon: "📦",
    title: "模块系统",
    group: "语法与类型",
    content: `# 模块系统

## 一、模块：代码组织的第一性原理

当代码量超过几百行，"如何拆分、如何复用、如何避免命名冲突"就成了核心问题。模块系统就是语言层面对这个问题的回答。Python 和 JavaScript 在这里走出了**截然不同的两条路**——Python 从一开始就有统一的 import 系统，JS 则经历了从"无模块"到 CommonJS 再到 ESM 的漫长演进。

理解模块系统的差异，是理解两门语言工程化能力的钥匙。

## 二、Python 的 import 系统

### 基本用法

\`\`\`python
# Python：import 语句有多种形式
import os                    # 导入整个模块
import os.path               # 导入子模块
from os import path          # 只导入 path
from os.path import join     # 导入特定函数
from collections import defaultdict, Counter  # 导入多个名字
import numpy as np           # 起别名
from utils.helpers import deep_get as dg      # 别名 + from import
\`\`\`

### sys.path：模块搜索路径

Python 找模块靠 \`sys.path\`，它是一个列表，按顺序查找：

\`\`\`python
import sys
print(sys.path)
# 输出大致是：
# ['/Users/me/project',           # 当前脚本所在目录（最优先）
#  '/usr/lib/python311.zip',      # 标准库 zip
#  '/usr/lib/python3.11',         # 标准库目录
#  '/usr/lib/python3.11/lib-dynload',
#  '/home/me/.venv/lib/python3.11/site-packages']  # 第三方包

# 可以运行时修改（但不推荐）
sys.path.insert(0, '/custom/path')
\`\`\`

关键点：**Python 的模块查找是"运行时"的**，\`import\` 是一个真正的可执行语句，可以在函数里、循环里、条件里调用。

### __init__.py 与包

Python 用目录 + \`__init__.py\` 表示"包"（package）：

\`\`\`
myproject/
├── utils/
│   ├── __init__.py        # 让 utils 成为包
│   ├── string_utils.py
│   ├── math_utils.py
│   └── io/
│       ├── __init__.py
│       └── csv_reader.py
└── main.py
\`\`\`

\`\`\`python
# 在 main.py 中
from utils.string_utils import capitalize
from utils.io.csv_reader import read_csv

# __init__.py 里可以控制"导入包时暴露什么"
# utils/__init__.py 内容：
# from .string_utils import capitalize
# from .math_utils import average
# __all__ = ['capitalize', 'average']   # 控制 from utils import * 的范围
\`\`\`

3.3+ 支持"命名空间包"（namespace package），可以不要 \`__init__.py\`，多个目录合并成一个包。但传统包（带 \`__init__.py\`）仍是主流。

### 相对导入 vs 绝对导入

\`\`\`python
# utils/io/csv_reader.py 里：
# 绝对导入：从项目根开始，清晰但啰嗦
from utils.string_utils import capitalize

# 相对导入：用 . 表示当前包，.. 表示父包
from ..string_utils import capitalize   # .. 回到 utils/
from . import helpers                    # . 表示当前包 utils/io/
from .. import math_utils               # .. 表示父包 utils/
\`\`\`

相对导入只能在包内部用，**顶层脚本（__main__）不能用相对导入**——这是无数新手的坑。

### __all__：控制导出

\`\`\`python
# utils/string_utils.py
__all__ = ['capitalize', 'snake_to_camel']   # 只导出这两个

def capitalize(s): ...
def snake_to_camel(s): ...
def _internal_helper(): ...   # 下划线开头，约定为私有

# 使用方
from utils.string_utils import *    # 只会导入 __all__ 里的
# capitalize, snake_to_camel 可用，_internal_helper 不可用
\`\`\`

## 三、JavaScript 模块演进史

### 史前时代：IIFE 和全局变量

\`\`\`javascript
// ES5 之前，JS 没有模块系统，靠 IIFE 模拟
var MyModule = (function() {
    var privateVar = 'secret';

    function publicFunc() {
        console.log(privateVar);
    }

    return { publicFunc: publicFunc };
})();

MyModule.publicFunc();   // 通过全局变量访问
\`\`\`

这种方式的问题：全局污染、依赖管理混乱、加载顺序靠人工维护。

### CommonJS：Node.js 的选择

\`\`\`javascript
// math_utils.js（CommonJS）
function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }

module.exports = { add, multiply };
// 或
exports.add = add;
exports.multiply = multiply;

// main.js
const { add, multiply } = require('./math_utils');
const math = require('./math_utils');   // 整体导入

console.log(add(1, 2));   // 3
\`\`\`

CommonJS 的特点：
- **同步加载**：\`require\` 会阻塞，立即返回模块对象
- **动态**：\`require\` 的参数可以是变量、表达式
- **值拷贝**：导出的是值的拷贝（基本类型）或引用（对象）
- **运行时求值**：模块代码在第一次 require 时执行并缓存

\`\`\`javascript
// CommonJS 的动态特性
const moduleName = process.env.DEBUG ? './debug-module' : './prod-module';
const mod = require(moduleName);   // 运行时决定加载哪个

// 条件导出
if (condition) {
    module.exports.featureA = featureA;
}
\`\`\`

### ESM：ECMAScript Modules（ES6+）

\`\`\`javascript
// math_utils.mjs（ESM）
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export default function square(x) { return x * x; }   // 默认导出

// 也可以整体导出
export { add, multiply };

// main.mjs
import square, { add, multiply } from './math_utils.mjs';
import * as math from './math_utils.mjs';   // 命名空间导入

console.log(add(1, 2));   // 3
console.log(square(4));   // 16（默认导出）
\`\`\`

ESM 的特点：
- **静态结构**：\`import\` 必须在顶层，路径必须是字符串字面量
- **异步加载**：模块在解析阶段确定依赖图，执行阶段求值
- **值绑定**：导出的是"活的绑定"，模块内部值变化会反映到导入方
- **支持 tree-shaking**：静态分析可删除未使用的导出

\`\`\`javascript
// ESM 的"活绑定"特性
// counter.mjs
export let count = 0;
export function increment() { count++; }

// main.mjs
import { count, increment } from './counter.mjs';
console.log(count);   // 0
increment();
console.log(count);   // 1（注意：count 是模块内的实时值，不是拷贝）
\`\`\`

对比 CommonJS：

\`\`\`javascript
// counter.js（CommonJS）
let count = 0;
function increment() { count++; }
module.exports = { count, increment };   // 这里 count 是 0 的拷贝

// main.js
const { count, increment } = require('./counter.js');
console.log(count);   // 0
increment();
console.log(count);   // 仍然是 0！CommonJS 导出的是值的快照
\`\`\`

### 动态 import()

ESM 提供了 \`import()\` 函数实现动态加载：

\`\`\`javascript
// 动态 import() 返回 Promise
async function loadModule(name) {
    const mod = await import(\`./modules/\${name}.mjs\`);
    return mod.default;
}

// 按需加载，常用于路由懒加载
button.addEventListener('click', async () => {
    const { heavyFeature } = await import('./heavy-feature.mjs');
    heavyFeature();
});
\`\`\`

这对应 Python 的 \`importlib.import_module\`：

\`\`\`python
# Python 动态导入
import importlib

def load_module(name):
    return importlib.import_module(f'modules.{name}')

mod = load_module('heavy_feature')
mod.heavy_feature()
\`\`\`

## 四、核心差异对比

### 1. 静态分析 vs 动态加载

| 维度 | Python import | CommonJS | ESM |
|------|---------------|----------|-----|
| 导入语句位置 | 任意位置 | 任意位置 | 必须顶层 |
| 路径是否可变量 | ✅ 可 | ✅ 可 | ❌ 字面量 |
| 加载时机 | 运行时（首次 import） | 运行时（首次 require） | 解析时确定依赖 |
| 支持静态分析 | 部分 | ❌ 难 | ✅ 强 |

ESM 的静态性是 \`tree-shaking\` 的基础——打包工具能在编译期确定哪些导出没被使用，直接删除：

\`\`\`javascript
// utils.mjs
export function used() { console.log('used'); }
export function unused() { console.log('unused'); }   // 会被 tree-shake 掉

// main.mjs
import { used } from './utils.mjs';
used();
\`\`\`

Python 和 CommonJS 做不到真正的 tree-shaking——因为 \`import\`/\`require\` 可能有副作用（模块顶层代码执行），静态分析无法安全删除。

### 2. 循环依赖处理

循环依赖是模块系统的经典难题。两门语言都能"处理"循环依赖，但行为不同：

\`\`\`python
# Python：循环依赖会得到"部分初始化"的模块
# a.py
print("a 开始加载")
from b import b_func   # 此时 b 还没加载完，触发 b 的加载
print("a 加载完成")
def a_func(): return "a"

# b.py
print("b 开始加载")
from a import a_func   # a 正在加载中，a_func 还没定义！
print("b 加载完成")
def b_func(): return "b"

# 执行 import a：
# a 开始加载
# b 开始加载
# ImportError: cannot import name 'a_func' from partially initialized module 'a'
\`\`\`

Python 的解法是把 import 延后到函数内部：

\`\`\`python
# a.py
def a_func(): return "a"
def call_b():
    from b import b_func   # 延迟导入，避免循环
    return b_func()
\`\`\`

\`\`\`javascript
// CommonJS：循环依赖返回"部分导出对象"
// a.js
console.log("a 开始");
const b = require('./b');   // b 开始加载，此时 module.exports 是 {}
console.log("b 的导出:", b);   // {}（部分）
module.exports = { aFunc: () => 'a' };

// b.js
console.log("b 开始");
const a = require('./a');   // a 正在加载，返回部分对象 {}
console.log("a 的导出:", a);   // {}（aFunc 还没挂上）
module.exports = { bFunc: () => 'b' };

// CommonJS 不会报错，但你可能拿到空对象
\`\`\`

\`\`\`javascript
// ESM：循环依赖通过"活绑定"解决
// a.mjs
import { bFunc } from './b.mjs';   // 静态分析阶段已知依赖
export function aFunc() {
    return 'a' + bFunc();   // 运行时调用，此时 bFunc 已绑定
}

// b.mjs
import { aFunc } from './a.mjs';
export function bFunc() { return 'b'; }

// ESM 能正确处理循环依赖，因为绑定是"活的"，调用时才取值
\`\`\`

| 循环依赖 | Python | CommonJS | ESM |
|----------|--------|----------|-----|
| 是否报错 | 可能报 ImportError | 不报错，可能拿到空对象 | 不报错，活绑定 |
| 推荐做法 | 延迟导入、重构 | 避免循环 | 可接受但仍不推荐 |

### 3. 包管理：pip vs npm

\`\`\`bash
# Python：pip install
pip install requests              # 装到全局/当前 venv
python -m venv .venv              # 创建虚拟环境
source .venv/bin/activate         # 激活
pip install -r requirements.txt   # 批量安装

# 模块解析：pip 装到 site-packages，import 时从 sys.path 找
\`\`\`

\`\`\`bash
# JavaScript：npm install
npm install axios                 # 装到当前项目的 node_modules
npm install --save-dev jest       # 开发依赖

# 模块解析：node 的"向上查找"机制
# 在 /a/b/c/ 下 require('foo')，会依次找：
# /a/b/c/node_modules/foo
# /a/b/node_modules/foo
# /a/node_modules/foo
# /node_modules/foo
\`\`\`

关键差异：

| 维度 | Python (pip) | JavaScript (npm) |
|------|--------------|------------------|
| 安装位置 | 全局/venv 的 site-packages | 项目本地 node_modules |
| 依赖隔离 | venv（手动创建） | 默认项目级隔离 |
| 依赖嵌套 | 扁平（可能冲突） | 嵌套（node_modules 树） |
| 版本锁定 | requirements.txt / pipfile | package-lock.json |
| 多版本共存 | ❌ 同一包只能一个版本 | ✅ 不同子依赖可装不同版本 |

npm 的 \`node_modules\` 嵌套结构允许"同一个包的不同版本共存"——A 依赖 lodash@4，B 依赖 lodash@3，两者都能装。Python 的 \`site-packages\` 是扁平的，**同一个包只能装一个版本**，这是 Python 依赖管理的根本痛点（也是 poetry/uv 等工具的发力点）。

### 4. 导入路径解析

\`\`\`python
# Python：import 路径是"包路径"，不是文件路径
from myproject.utils.string_utils import capitalize
# 对应 myproject/utils/string_utils.py

# 裸名 import 走 sys.path，可能撞名
import utils   # 是项目的 utils 还是第三方的 utils？
# PEP 420 后推荐用绝对导入避免歧义
\`\`\`

\`\`\`javascript
// JavaScript：import 路径分三类
import { foo } from './utils.js';        // 相对路径（带 ./）
import { bar } from '/abs/path.js';      // 绝对路径
import { baz } from 'react';             // 裸模块名（走 node_modules）
import { qux } from '@scope/pkg';        // 带 scope 的包名

// ESM 强制写扩展名（.js/.mjs），CommonJS 可以省略
\`\`\`

JS 的"裸模块名"严格走 \`node_modules\` 查找，不会和相对路径混淆；Python 的裸 \`import utils\` 会在 \`sys.path\` 里找，容易和标准库/第三方包撞名，所以现代 Python 推荐用包路径（\`from myproject.utils import ...\`）。

## 五、高级特性对比

### 1. 条件导出与子路径导出

Node.js 的 \`package.json\` \`exports\` 字段：

\`\`\`json
{
  "name": "my-lib",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./legacy": {
      "require": "./dist/legacy.cjs",     // CommonJS 入口
      "import": "./dist/legacy.mjs"       // ESM 入口
    }
  }
}
\`\`\`

\`\`\`javascript
import main from 'my-lib';           // 走 "."
import utils from 'my-lib/utils';    // 走 "./utils"
import legacy from 'my-lib/legacy';  // 根据 require/import 走不同文件
\`\`\`

Python 用 \`__init__.py\` 控制子模块暴露，或者用 \`pyproject.toml\` 配置：

\`\`\`toml
# pyproject.toml
[tool.setuptools.packages.find]
where = ["src"]
\`\`\`

### 2. importlib vs import()

Python 的 \`importlib\` 提供了更底层的导入控制：

\`\`\`python
import importlib
import importlib.util

# 动态导入
mod = importlib.import_module('numpy.linalg')

# 从文件路径加载
spec = importlib.util.spec_from_file_location("my_mod", "/path/to/mod.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

# 重载模块（开发时热更新）
importlib.reload(mod)
\`\`\`

JS 的 \`import()\` 更简洁，但功能单一——只能动态加载，不能从任意路径加载、不能 reload。

### 3. 模块顶层代码的副作用

\`\`\`python
# Python：模块顶层代码在首次 import 时执行一次
# config.py
print("加载 config")   # 这行会执行
DB_URL = "localhost"
\`\`\`

\`\`\`javascript
// JavaScript：同样，模块顶层代码首次 import 时执行
// config.mjs
console.log("加载 config");   // 执行一次
export const DB_URL = "localhost";
\`\`\`

两者都缓存已加载模块，重复 import 不会重复执行。但 ESM 是异步执行的（微任务），CommonJS 和 Python 是同步的——这意味着 ESM 顶层如果有耗时操作，行为会更复杂。

## 六、总结对比表

| 维度 | Python import | CommonJS | ESM |
|------|---------------|----------|-----|
| 导入语法 | import / from...import | require() | import / export |
| 导出语法 | __all__ / 模块顶层名字 | module.exports | export / export default |
| 加载方式 | 同步、运行时 | 同步、运行时 | 异步、解析时 |
| 静态分析 | 部分 | ❌ | ✅ |
| Tree-shaking | ❌ | ❌ | ✅ |
| 循环依赖 | 报错或部分初始化 | 部分对象 | 活绑定 |
| 值语义 | 引用 | 拷贝（基本类型） | 活绑定 |
| 动态加载 | importlib | require(变量) | import() |
| 包管理 | pip + site-packages | npm + node_modules | 同 npm |
| 多版本共存 | ❌ | ✅ | ✅ |

## 七、为什么 Python 没有"前端 ESM 那样的革命"

Python 的 import 系统虽老但统一，没有 CommonJS vs ESM 的分裂之痛。JS 的演进是"历史包袱驱动"的——浏览器、Node、打包工具三方博弈，最终 ESM 成为标准，但 CommonJS 在 Node 生态里仍广泛存在，两者互操作（\`.cjs\`/\`.mjs\`/\`.js\` 的判断规则）至今仍是混乱之源。

Python 的痛点不在模块语法，而在**依赖管理**——pip、pipenv、poetry、conda、uv 等工具层出不穷，反映了"扁平 site-packages 导致版本冲突"这个根本问题。模块系统本身，Python 反而更"干净"。

下一章我们看**字符串与编码**——这是 Python 和 JS 在 Unicode 时代分道扬镳的领域。`,
  },
  {
    id: "pyvsjs-strings",
    icon: "🔤",
    title: "字符串与编码",
    group: "语法与类型",
    content: `# 字符串与编码

## 一、字符串：表面相似，内核迥异

Python 和 JavaScript 的字符串都用引号表示，看起来差不多，但**底层表示完全不同**。这个差异在处理 emoji、罕见字符、文本切分时会爆发——是无数"为什么我的代码在 Python 里能跑，在 JS 里就出 bug"的根源。

核心分歧只有一句话：**Python 的 str 是 Unicode 码点序列，JS 的 string 是 UTF-16 编码单元序列**。

## 二、底层表示：码点 vs UTF-16

### Python：str 是码点序列

Python 3 的 \`str\` 是一个"码点（code point）数组"，每个元素是一个 0 到 0x10FFFF 的整数，对应 Unicode 字符。

\`\`\`python
# Python：字符串长度 = 码点个数
s = "hello"
print(len(s))   # 5

# emoji 是单个码点
emoji = "😀"
print(len(emoji))   # 1（一个码点 U+1F600）

# 遍历：直接遍历就是码点
for ch in "abc😀":
    print(ch, hex(ord(ch)))
# a 0x61
# b 0x62
# c 0x63
# 😀 0x1f600
\`\`\`

### JavaScript：string 是 UTF-16 编码单元序列

JS 的字符串底层是 \`UTF-16\` 编码——每个字符占 16 位（2 字节）。**BMP（基本多文种平面）之外的字符**（码点 > 0xFFFF，包括大部分 emoji）需要两个 16 位单元表示，称为"代理对"（surrogate pair）。

\`\`\`javascript
// JavaScript：字符串长度 = UTF-16 编码单元个数
const s = "hello";
console.log(s.length);   // 5

// emoji 是两个编码单元（代理对）
const emoji = "😀";
console.log(emoji.length);   // 2！不是 1

// 遍历：for...of 会正确处理代理对
for (const ch of "abc😀") {
    console.log(ch, ch.codePointAt(0).toString(16));
}
// a 61
// b 62
// c 63
// 😀 1f600

// 但 for...i 循环会"切坏"代理对
for (let i = 0; i < emoji.length; i++) {
    console.log(emoji[i]);   // 输出两个乱码字符
}
\`\`\`

这是 JS 字符串最大的坑：**\`str.length\` 不是"字符个数"，而是"UTF-16 单元个数"**。处理 emoji、某些罕见汉字、音乐符号时，长度、索引、切片全部会出错。

\`\`\`javascript
// 经典 bug：字符串长度不符合直觉
const family = "👨‍👩‍👧‍👦";   // 家庭 emoji（由多个 emoji 用 ZWJ 组合）
console.log(family.length);   // 11（不是 1，也不是 4）

// Python 同样的字符串
family_py = "👨‍👩‍👧‍👦"
print(len(family_py))   # 7（码点数，但仍不是 1——ZWJ 组合是另一个层面的问题）
\`\`\`

注意：即使 Python 的 \`len\` 也未必等于"用户感知的字符数"——ZWJ（零宽连接符）组合的 emoji、某些带变音符号的字母，需要用 \`grapheme\` 库才能正确计数。但 Python 处理单 emoji 已经比 JS 准确。

## 三、字符串方法对比

### 长度与索引

\`\`\`python
# Python
s = "hello"
len(s)        # 5
s[0]          # 'h'（支持负索引）
s[-1]         # 'o'
s[1:3]        # 'el'（切片）
\`\`\`

\`\`\`javascript
// JavaScript
const s = "hello";
s.length;        // 5
s[0];            // 'h'（不支持负索引）
s[s.length - 1]; // 'o'（要手动算）
s.slice(1, 3);   // 'el'（slice 支持 -1：s.slice(-1) === 'o'）
\`\`\`

### 大小写与查找

| 操作 | Python | JavaScript |
|------|--------|------------|
| 转大写 | \`s.upper()\` | \`s.toUpperCase()\` |
| 转小写 | \`s.lower()\` | \`s.toLowerCase()\` |
| 首字母大写 | \`s.capitalize()\` / \`s.title()\` | 无内置（需手动） |
| 查找子串 | \`s.find('x')\`（找不到返回 -1） | \`s.indexOf('x')\` |
| 是否包含 | \`'x' in s\` | \`s.includes('x')\` |
| 是否以...开头 | \`s.startswith('x')\` | \`s.startsWith('x')\` |
| 替换 | \`s.replace('a', 'b')\`（默认替换所有） | \`s.replace('a', 'b')\`（只替换第一个） |
| 全部替换 | \`s.replace('a', 'b')\` | \`s.replaceAll('a', 'b')\`（ES2021） |

注意 \`replace\` 的差异：**Python 默认替换所有匹配项，JS 默认只替换第一个**——这是跨语言迁移时最容易踩的坑之一。

\`\`\`python
# Python：replace 默认全替换
"aaa".replace("a", "b")   # "bbb"
"aaa".replace("a", "b", 1)   # "baa"（限制次数）
\`\`\`

\`\`\`javascript
// JavaScript：replace 默认只替换第一个
"aaa".replace("a", "b");   // "baa"
"aaa".replace(/a/g, "b");  // "bbb"（用正则全局替换）
"aaa".replaceAll("a", "b"); // "bbb"（ES2021+）
\`\`\`

### 分割与拼接

\`\`\`python
# Python
"a,b,c".split(",")           # ['a', 'b', 'c']
"a,b,,c".split(",")          # ['a', 'b', '', 'c']（保留空串）
",".join(["a", "b", "c"])    # "a,b,c"
"  hello  ".strip()          # "hello"（strip 同时去两端）
\`\`\`

\`\`\`javascript
// JavaScript
"a,b,c".split(",");              // ['a', 'b', 'c']
"a,b,,c".split(",");             // ['a', 'b', '', 'c']
["a", "b", "c"].join(",");       // "a,b,c"
"  hello  ".trim();              // "hello"
"  hello  ".trimStart();         // "hello  "（ES2019）
"  hello  ".trimEnd();           // "  hello"
\`\`\`

JS 的 \`split\` 更强大——可以接受正则和限制参数：

\`\`\`javascript
"a1b2c3".split(/\\d/);          // ['a', 'b', 'c']
"a,b,c".split(",", 2);         // ['a', 'b']（限制返回数量）
\`\`\`

Python 的 \`split\` 不支持正则，要用 \`re.split\`：

\`\`\`python
import re
re.split(r'\\d', "a1b2c3")   # ['a', 'b', 'c']
"a,b,c".split(",", 2)        # ['a', 'b', 'c']（注意：这是 maxsplit，含义不同！）
\`\`\`

## 四、f-string vs 模板字符串

### Python f-string（3.6+）

\`\`\`python
name = "Alice"
age = 30
# f-string：表达式直接嵌入
msg = f"Hello, {name}. You are {age} years old."

# 支持表达式和格式化
import math
pi_str = f"Pi is {math.pi:.2f}"   # "Pi is 3.14"
width_str = f"{42:>10}"            # 右对齐宽度10
binary_str = f"{255:b}"            # "11111111"
date_str = f"{2024:04d}-{1:02d}-{15:02d}"   # "2024-01-15"

# 3.8+ 支持 = 调试语法
x = 42
print(f"{x=}")   # x=42
\`\`\`

### JavaScript 模板字符串

\`\`\`javascript
const name = "Alice";
const age = 30;
// 模板字符串：用反引号包裹
const msg = \`Hello, \${name}. You are \${age} years old.\`;

// 支持表达式
const pi = Math.PI;
const piStr = \`Pi is \${pi.toFixed(2)}\`;   // "Pi is 3.14"

// 支持多行
const multi = \`
line 1
line 2
\`;

// 标签模板：自定义插值行为
function tag(strings, ...values) {
    return strings.reduce((acc, s, i) => acc + s + (values[i] || ''), '');
}
const tagged = tag\`Hello \${name}, age \${age}\`;   // "Hello Alice, age 30"
\`\`\`

### 对比

| 维度 | Python f-string | JS 模板字符串 |
|------|-----------------|---------------|
| 语法 | \`f"...{expr}..."\` | \`...\${expr}...\`（反引号包裹） |
| 格式化说明符 | ✅ 强大（\`:.2f\`, \`:>10\`） | ❌ 需手动调用方法 |
| 多行 | 需三引号 \`"""\`\` | ✅ 原生支持 |
| 标签函数 | ❌ | ✅ 标签模板 |
| 嵌套 | ✅ \`f"{f'{x}'}"\` | ✅ 嵌套模板字符串 |

Python 的 f-string 在**数值格式化**上完胜——\`{value:.2f}\`、\`{value:,}\`（千分位）、\`{value:%}\`（百分比）开箱即用。JS 必须调用 \`toFixed\`、\`toLocaleString\` 等方法，且 \`toLocaleString\` 行为依赖环境。

JS 的**标签模板**是独特优势——可以自定义插值逻辑，常用于国际化（i18n）、防 SQL 注入、HTML 转义等：

\`\`\`javascript
// 标签模板：自动转义 HTML
function html(strings, ...values) {
    return strings.reduce((acc, s, i) => {
        const v = values[i] || '';
        return acc + s + String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }, '');
}
const userInput = '<script>alert(1)</script>';
const safe = html\`<div>\${userInput}</div>\`;   // 自动转义
\`\`\`

## 五、编码问题：bytes vs str

### Python：明确区分 str 和 bytes

Python 3 的一个重大改进是把 \`str\`（文本）和 \`bytes\`（字节序列）彻底分开，**两者不能直接拼接**：

\`\`\`python
# Python：str 和 bytes 是不同类型
text = "hello"             # str
data = b"hello"            # bytes
# text + data              # TypeError: 不能直接拼接

# 编码：str -> bytes
encoded = "你好".encode('utf-8')   # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
# 解码：bytes -> str
decoded = encoded.decode('utf-8')   # "你好"

# 读写文件要指定编码
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()   # str
with open('file.bin', 'rb') as f:
    raw = f.read()       # bytes
\`\`\`

这种"显式编码"的设计避免了无数乱码问题——你永远知道手里的是文本还是字节。

### JavaScript：string 和 Buffer

JS 没有内置的 bytes 类型，用 \`Buffer\`（Node.js）或 \`Uint8Array\`（Web）表示字节：

\`\`\`javascript
// JavaScript：string 是 UTF-16，Buffer 是字节序列
const text = "hello";
const buf = Buffer.from(text, 'utf-8');   // <Buffer 68 65 6c 6c 6f>
const decoded = buf.toString('utf-8');     // "hello"

// 处理中文
const cn = "你好";
const cnBuf = Buffer.from(cn, 'utf-8');   // 6 字节
console.log(cnBuf.length);   // 6
cnBuf.toString('utf-8');     // "你好"

// 浏览器端用 TextEncoder/TextDecoder
const encoder = new TextEncoder();
const uint8 = encoder.encode("你好");   // Uint8Array(6)
const decoder = new TextDecoder('utf-8');
decoder.decode(uint8);                  // "你好"
\`\`\`

JS 的 \`TextEncoder\` 只支持 UTF-8（其他编码要靠第三方库如 \`iconv-lite\`），而 Python 的 \`encode\` 支持 GBK、Shift-JIS 等几乎所有编码——这是 Python 在国际化场景的优势。

### 处理编码错误的策略

\`\`\`python
# Python：明确的错误处理策略
b'\\xff\\xfe'.decode('utf-8')   # UnicodeDecodeError
b'\\xff\\xfe'.decode('utf-8', errors='ignore')   # ''（忽略）
b'\\xff\\xfe'.decode('utf-8', errors='replace')  # '��'（替换）
b'\\xff\\xfe'.decode('utf-8', errors='strict')   # 抛错（默认）
\`\`\`

\`\`\`javascript
// JavaScript：TextDecoder 也有 fatal 选项
const decoder = new TextDecoder('utf-8', { fatal: true });
decoder.decode(new Uint8Array([0xff, 0xfe]));   // 抛 TypeError
const lenient = new TextDecoder('utf-8', { fatal: false });
lenient.decode(new Uint8Array([0xff, 0xfe]));   // 替换字符
\`\`\`

## 六、正则表达式

### Python re 模块

\`\`\`python
import re

# 编译正则
pattern = re.compile(r'\\d{4}-\\d{2}-\\d{2}')

# 匹配
m = re.match(r'(\\w+)@(\\w+)', "user@example.com")
if m:
    print(m.group(0))   # "user@example"
    print(m.group(1))   # "user"
    print(m.group(2))   # "example"

# 查找所有
re.findall(r'\\d+', "a1b22c333")   # ['1', '22', '333']

# 替换
re.sub(r'\\d+', '#', "a1b22c333")   # "a#b#c#"

# 命名分组
m = re.match(r'(?P<year>\\d{4})-(?P<month>\\d{2})', "2024-01")
m.group('year')    # "2024"
m.group('month')   # "01"
\`\`\`

### JavaScript RegExp

\`\`\`javascript
// JavaScript：RegExp 对象 + 字符串方法
const pattern = /\\d{4}-\\d{2}-\\d{2}/;

// match（注意：ES2020 前后的行为不同）
const m = "(\\w+)@(\\w+)".match; // 字面量示例
const result = "user@example.com".match(/(\\w+)@(\\w+)/);
if (result) {
    console.log(result[0]);   // "user@example"
    console.log(result[1]);   // "user"
    console.log(result[2]);   // "example"
}

// 查找所有（用 /g 标志）
"a1b22c333".match(/\\d+/g);   // ['1', '22', '333']

// 替换
"a1b22c333".replace(/\\d+/g, '#');   // "a#b#c#"

// 命名分组（ES2018+）
const m2 = "2024-01".match(/(?<year>\\d{4})-(?<month>\\d{2})/);
m2.groups.year;    // "2024"
m2.groups.month;   // "01"
\`\`\`

### 关键差异

| 维度 | Python re | JavaScript RegExp |
|------|-----------|-------------------|
| 字面量语法 | 无（用字符串） | \`/pattern/flags\` |
| 全局匹配 | \`re.findall\` / \`re.finditer\` | \`/g\` 标志 |
| 命名分组 | \`(?P<name>...)\` | \`(?<name>...)\`（ES2018） |
| 后向引用 | \`\\1\` | \`\\1\` |
| 前瞻 | \`(?=...)\` / \`(?!...)\` | \`(?=...)\` / \`(?!...)\` |
| 后顾 | \`(?<=...)\` / \`(?<!...)\` | \`(?<=...)\` / \`(?<!...)\`（ES2018） |
| Unicode 模式 | 默认 Unicode | 需 \`/u\` 标志 |
| 多行模式 | \`re.MULTILINE\` | \`/m\` 标志 |
| 点匹配换行 | \`re.DOTALL\` | \`/s\` 标志（ES2018） |

Python 的正则更"一致"——所有标志通过参数传递，行为可预测。JS 的标志是字符（\`/gim\`），简洁但容易写错，且 \`/g\` 标志有"有状态"的坑：

\`\`\`javascript
// JS 的 /g 标志陷阱：RegExp 对象有 lastIndex 状态
const re = /\\d/g;
re.test("1a2");   // true, lastIndex=1
re.test("1a2");   // true, lastIndex=3
re.test("1a2");   // false, lastIndex=0（回绕）
\`\`\`

Python 没有这个问题，\`re.match\` 每次都是无状态的。

## 七、emoji 处理实战

\`\`\`python
# Python：emoji 处理相对直观
family = "👨‍👩‍👧‍👦"   # 家庭 emoji（ZWJ 组合）
print(len(family))   # 7（码点数：4个人 + 3个 ZWJ）

# 反转字符串：emoji 不会被切坏
s = "hello😀world"
print(s[::-1])   # "dlrow😀olleh"（正确）

# 统计字符数（按码点）
print(len("abc"))   # 3
\`\`\`

\`\`\`javascript
// JavaScript：emoji 是雷区
const family = "👨‍👩‍👧‍👦";
console.log(family.length);   // 11（UTF-16 单元数）

// 反转字符串：emoji 会被切坏！
const s = "hello😀world";
const wrong = s.split('').reverse().join('');   // "dlrow��olleh"（emoji 被切成两半）
// 正确做法：用 Array.from 或 spread
const right = [...s].reverse().join('');   // "dlrow😀olleh"

// 统计字符数（按码点，不是 UTF-16 单元）
console.log([...family].length);   // 7
\`\`\`

要真正按"用户感知字符"（grapheme cluster）计数，两边都需要第三方库：Python 用 \`grapheme\`，JS 用 \`graphemer\` 或 Intl.Segmenter：

\`\`\`javascript
// JS 用 Intl.Segmenter（ES2022）按 grapheme 计数
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const count = [...segmenter.segment("👨‍👩‍👧‍👦")].length;   // 1
\`\`\`

## 八、总结对比表

| 维度 | Python str | JavaScript string |
|------|-----------|-------------------|
| 底层表示 | Unicode 码点序列 | UTF-16 编码单元序列 |
| len/length | 码点个数 | UTF-16 单元个数 |
| emoji 长度 | 1（单码点） | 2（代理对） |
| 字节类型 | bytes（独立类型） | Buffer/Uint8Array |
| 编码 API | encode/decode（多编码） | TextEncoder（仅 UTF-8） |
| 字符串模板 | f-string | 模板字符串 |
| 格式化说明符 | ✅ 强大 | ❌ 需手动 |
| 标签模板 | ❌ | ✅ |
| 正则字面量 | ❌（用字符串） | ✅ \`/pattern/\` |
| 正则命名分组 | \`(?P<name>)\` | \`(?<name>)\` |

## 九、为什么 Python 选择了码点，JS 选择了 UTF-16

历史原因：**JavaScript 诞生时 Unicode 还在 BMP 阶段**，UTF-16 当时是定长 16 位，足够表示所有字符。后来 Unicode 扩展到 21 位，UTF-16 变成变长，但 JS 已经"固化"在 16 位单元上，无法回头。

**Python 3 是 2008 年重做的**，那时 Unicode 已经扩展，Python 顺势把 str 改成码点序列，彻底抛弃了 Python 2 的"字节字符串"。这是一次痛苦的迁移（Python 2 到 3 用了十几年），但换来的是字符串语义的干净。

所以下次你看到 JS 的 \`"😀".length === 2\`，别惊讶——这是 1995 年那个 10 天决策的回响。`,
  },
  {
    id: "pyvsjs-typescript",
    icon: "🔷",
    title: "TypeScript：给 JS 装上类型",
    group: "语法与类型",
    content: `# TypeScript：给 JS 装上类型

## 一、两条类型化路径

动态类型的痛点催生了两种"加类型"的方案：**TypeScript 给 JS 加了一套编译时类型系统**，类型擦除后变成纯 JS；**Python 选择在运行时保留类型提示（type hints）**，但解释器本身不检查，靠 mypy/pyright 等外部工具检查。

这两条路表面相似（都是"渐进类型化"），但哲学完全不同。理解它们的差异，能帮你避免把一套思维硬套到另一套上。

## 二、运行时行为：擦除 vs 保留

### TypeScript：编译时检查，运行时消失

\`\`\`typescript
// TypeScript：类型只在编译时存在
function add(a: number, b: number): number {
    return a + b;
}

// 编译后的 JS（类型被完全擦除）：
// function add(a, b) {
//     return a + b;
// }

// 运行时完全不检查类型
add(1, 2);        // 3
add("1", "2");    // "12"（运行时不报错，但编译会报错）
\`\`\`

TS 的类型是"编译时幻觉"——\`tsc\` 编译完，所有类型信息消失，运行时是纯 JS。这意味着：

- **类型错误不影响运行**（除非开启了类型断言等运行时检查）
- **不能用 \`instanceof\` 检查 TS 类型**（\`interface\` 编译后不存在）
- **反射、序列化要靠运行时方案**（如 \`class-transformer\`、zod）

### Python：类型提示保留在运行时，但不强制

\`\`\`python
# Python：类型提示是"注解"，运行时保留但不检查
def add(a: int, b: int) -> int:
    return a + b

# 运行时不检查类型
add(1, 2)        # 3
add("1", "2")    # "12"（运行时不报错！）

# 但类型信息可以通过 __annotations__ 访问
print(add.__annotations__)
# {'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}

# mypy/pyright 会在"编译期"（实际是单独的检查步骤）报错：
# error: Argument 1 to "add" has incompatible type "str"; expected "int"
\`\`\`

Python 的类型提示是"**运行时存在但被忽略**"——解释器把它存在 \`__annotations__\` 里，但执行时不做任何检查。你需要单独跑 mypy/pyright 来检查类型。

### 核心差异

| 维度 | TypeScript | Python 类型提示 |
|------|-----------|----------------|
| 检查时机 | 编译时（tsc） | 独立工具（mypy/pyright） |
| 运行时是否存在 | ❌ 完全擦除 | ✅ 保留在 __annotations__ |
| 运行时是否检查 | ❌ | ❌（除非用 runtime_checkable + isinstance） |
| 类型错误是否阻断运行 | ❌（除非 ts-node 严格模式） | ❌ |
| 能否运行时反射 | ❌ | ✅（typing 模块可读） |

这个差异决定了**很多设计选择**：TS 的类型必须"可擦除"（不能有运行时副作用），Python 的类型可以更"重"（因为反正会保留）。

## 三、类型定义：interface/type/enum vs typing

### TypeScript 的类型定义工具

\`\`\`typescript
// interface：声明对象形状
interface User {
    id: number;
    name: string;
    email?: string;          // 可选属性
    readonly createdAt: Date;  // 只读
}

// type：类型别名，更灵活
type ID = number | string;
type Callback<T> = (err: Error | null, data: T) => void;
type UserMap = Record<string, User>;

// enum：枚举（TS 特有，编译成对象）
enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Pending = "PENDING",
}
const s: Status = Status.Active;

// interface 可以合并声明（declaration merging）
interface Window { myProp: string; }   // 扩展全局 Window
\`\`\`

### Python 的 typing 模块

\`\`\`python
from typing import Optional, Union, List, Dict, Tuple, Literal, TypedDict, Protocol
from dataclasses import dataclass
from enum import Enum

# 简单类型注解
def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}" * times

# 复合类型
numbers: List[int] = [1, 2, 3]
user_map: Dict[str, User] = {}
pair: Tuple[int, str] = (1, "a")

# Optional 和 Union
def find(id: int) -> Optional[User]:   # 等价于 Union[User, None]
    ...

# 3.10+ 可以用 | 语法
def find2(id: int) -> User | None:
    ...

# TypedDict：类似 TS 的 interface（描述字典形状）
class UserDict(TypedDict):
    id: int
    name: str
    email: str  # 可选要用 total=False 或 NotRequired

# Protocol：结构化类型（鸭子类型的形式化）
class Drawable(Protocol):
    def draw(self) -> None: ...

def render(obj: Drawable) -> None:
    obj.draw()   # 任何有 draw 方法的对象都行

# Enum：运行时存在的枚举
class Status(Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    PENDING = "PENDING"

# Literal：字面量类型
def set_mode(mode: Literal["read", "write", "append"]) -> None: ...
\`\`\`

### 对比

| 概念 | TypeScript | Python |
|------|-----------|--------|
| 对象形状 | interface / type | TypedDict / dataclass |
| 联合类型 | \`A \\| B\` | \`Union[A, B]\` / \`A \\| B\`（3.10+） |
| 可选属性 | \`prop?: T\` | \`Optional[T]\` / \`T \\| None\` |
| 字面量类型 | \`"read" \\| "write"\` | \`Literal["read", "write"]\` |
| 枚举 | enum（编译成对象） | Enum（运行时类） |
| 鸭子类型 | interface（结构匹配） | Protocol |
| 只读 | \`readonly\` | \`Final\`（变量）/ dataclass \`frozen=True\` |

注意 Python 的 \`Enum\` 是**运行时真实存在的类**——\`Status.ACTIVE\` 是一个对象，有 \`__members__\`、可以做 \`isinstance\` 检查。TS 的 \`enum\` 编译后变成普通对象，运行时和普通常量无本质区别。

## 四、结构类型 vs 名义类型

这是两套类型系统**最根本的哲学差异**。

### TypeScript：结构类型（Structural Typing）

TS 判断类型兼容性看"形状"——只要字段对得上就算兼容，不管叫什么名字：

\`\`\`typescript
// TypeScript：结构类型
interface User { id: number; name: string; }
interface Product { id: number; name: string; }

const u: User = { id: 1, name: "Alice" };
const p: Product = u;   // ✅ 合法！因为形状相同

// 函数参数也看结构
function logName(item: { name: string }) {
    console.log(item.name);
}
logName(u);   // ✅ User 有 name 字段
logName({ name: "Bob" });   // ✅ 字面量也行
\`\`\`

这叫"鸭子类型的形式化"——如果它走起来像鸭子、叫起来像鸭子，那它就是鸭子。

### Python：名义类型（Nominal Typing）

Python 的类型系统是名义的——类型兼容看"继承关系"和"显式声明"，不看形状：

\`\`\`python
# Python：名义类型
class User:
    id: int
    name: str

class Product:
    id: int
    name: str

u: User = User()
p: Product = u   # ❌ mypy 报错：User 和 Product 没有继承关系

# 即使形状相同，也不能互相赋值
def log_name(item: User) -> None:
    print(item.name)

log_name(Product())   # ❌ 类型不匹配
\`\`\`

### 例外：Python 的 Protocol 是结构类型

Python 3.8+ 的 \`Protocol\` 引入了结构类型，作为名义类型的补充：

\`\`\`python
from typing import Protocol

class HasName(Protocol):
    name: str

class User:
    name: str

class Product:
    name: str

def log_name(item: HasName) -> None:
    print(item.name)

log_name(User())     # ✅ 满足 Protocol
log_name(Product())  # ✅ 也满足，因为都有 name 属性

# 但普通类仍然是名义的
u: User = User()
p: Product = u   # ❌ 仍然报错
\`\`\`

### 设计权衡

| 维度 | 结构类型（TS） | 名义类型（Python 默认） |
|------|---------------|------------------------|
| 兼容性判断 | 看形状 | 看继承/声明 |
| 灵活性 | 高（易复用） | 低（需显式关系） |
| 安全性 | 可能"误匹配" | 严格 |
| 重构 | 改字段可能影响多处 | 改字段只影响子类 |
| 适合场景 | 数据流转、JSON | 领域模型、OOP |

TS 选择结构类型是因为它脱胎于 JS——JS 本身就是鸭子类型的，TS 要"贴近 JS 的实际行为"。Python 选择名义类型是因为它有完整的 OOP 体系，类型关系应该"显式且可追溯"。

## 五、泛型对比

### TypeScript 泛型

\`\`\`typescript
// TS 泛型：函数、接口、类、类型别名都支持
function identity<T>(x: T): T {
    return x;
}

// 泛型约束
interface Lengthwise { length: number; }
function logLength<T extends Lengthwise>(x: T): void {
    console.log(x.length);
}

// 默认类型
function create<T = string>(): T[] { return []; }

// 泛型在类型别名
type Box<T> = { value: T };
type Pair<A, B> = { first: A; second: B };

// 泛型类
class Stack<T> {
    private items: T[] = [];
    push(x: T) { this.items.push(x); }
    pop(): T | undefined { return this.items.pop(); }
}

const numStack = new Stack<number>();
numStack.push(1);
\`\`\`

### Python 泛型

\`\`\`python
from typing import TypeVar, Generic, List, Optional

# TypeVar：声明类型变量
T = TypeVar('T')

def identity(x: T) -> T:
    return x

# 泛型约束
TComparable = TypeVar('TComparable', bound='Comparable')   # bound 上界
TNumber = TypeVar('TNumber', int, float)   # 限定具体类型

def log_length(x: List[T]) -> None:   # 简单示例
    print(len(x))

# 泛型类：继承 Generic
class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: List[T] = []
    def push(self, x: T) -> None:
        self.items.append(x)
    def pop(self) -> Optional[T]:
        return self.items.pop() if self.items else None

num_stack: Stack[int] = Stack()
num_stack.push(1)

# 3.12+ 支持 PEP 695 泛型语法（更简洁）
def identity_new[T](x: T) -> T:
    return x

class Stack_new[T]:
    def __init__(self) -> None:
        self.items: list[T] = []
\`\`\`

### 差异

| 维度 | TypeScript | Python |
|------|-----------|--------|
| 声明语法 | \`<T>\` 直接写在签名 | \`TypeVar\` 预声明（3.12+ 改进） |
| 约束 | \`T extends X\` | \`TypeVar(bound=X)\` 或 \`TypeVar('T', int, float)\` |
| 默认参数 | \`<T = string>\` | ❌ 不支持（3.13 才支持） |
| 协变/逆变 | 自动推断 | 需显式声明（\`Covariant\`/\`Contravariant\`） |
| 运行时存在 | ❌ 擦除 | ✅ 保留（Generic[T] 是真实类） |

Python 的 \`TypeVar\` 显式声明"协变/逆变"是 TS 没有的特性——这反映了 Python 类型系统更"理论化"的一面（受学术类型论影响更深）。TS 则更"实用主义"，协变/逆变交给编译器推断。

## 六、类型推断

### TypeScript 的推断（强大）

\`\`\`typescript
// TS 能推断很多东西
const x = 42;            // 推断为 number（不是 42 字面量）
const s = "hello";       // string
const arr = [1, 2, 3];   // number[]

// 字面量类型推断
const literal = "hello";   // 类型是 "hello"（字面量），不是 string
let mutable = "hello";     // 类型是 string（let 拓宽了）

// 函数返回值推断
function getUser() {
    return { id: 1, name: "Alice" };   // 推断为 { id: number; name: string }
}

// 解构推断
const { id } = getUser();   // id: number

// 条件类型推断
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type R = Unwrap<Promise<string>>;   // string
\`\`\`

### Python 的推断（保守）

\`\`\`python
# Python 类型推断较保守
x = 42           # 推断为 int
s = "hello"      # str
arr = [1, 2, 3]  # list[int]（3.9+ mypy 能推断）

# 函数返回值：必须显式标注，否则推断为 Any
def get_user():
    return {"id": 1, "name": "Alice"}   # mypy 不推断，需手动标注

# 需要写：
def get_user() -> dict[str, int | str]:
    return {"id": 1, "name": "Alice"}

# 变量重新赋值：类型固定
x = 42
x = "hello"   # mypy 报错：Incompatible types in assignment
\`\`\`

### 关键差异

TS 的推断"激进"——能推就推，开发者少写类型注解。Python 的推断"保守"——函数签名必须显式，否则视为 \`Any\`（放弃检查）。

原因：**TS 有完整的编译器，能做控制流分析**；Python 的 mypy 是"静态扫描器"，能力受限，且 Python 的动态特性（如 \`setattr\`、\`__getattr__\`）让推断更难。

## 七、TS 独有：联合、交叉、条件类型

### 联合类型（Union）

两门语言都有，但 TS 的更"活"：

\`\`\`typescript
// TS 联合类型 + 类型收窄
type Result = { ok: true; data: string } | { ok: false; error: string };

function handle(r: Result) {
    if (r.ok) {
        console.log(r.data);   // TS 知道这里 r.data 存在
    } else {
        console.log(r.error);  // TS 知道这里 r.error 存在
    }
}

// 可辨识联合（discriminated union）
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "square"; size: number };

function area(s: Shape): number {
    switch (s.kind) {
        case "circle": return Math.PI * s.radius ** 2;
        case "square": return s.size ** 2;
    }
}
\`\`\`

\`\`\`python
# Python 联合类型 + isinstance 收窄
from typing import Union, Literal

Result = Union[tuple[Literal[True], str], tuple[Literal[False], str]]

def handle(r: Result) -> None:
    if r[0]:           # ok 是 True
        print(r[1])    # data
    else:
        print(r[1])    # error

# 可辨识联合：Python 通常用 dataclass + Literal
from dataclasses import dataclass

@dataclass
class Circle:
    kind: Literal["circle"]
    radius: float

@dataclass
class Square:
    kind: Literal["square"]
    size: float

Shape = Union[Circle, Square]

def area(s: Shape) -> float:
    if s.kind == "circle":   # mypy 能收窄
        return 3.14 * s.radius ** 2
    else:
        return s.size ** 2
\`\`\`

### 交叉类型（Intersection）

TS 独有，Python 需用 \`Protocol\` 多继承模拟：

\`\`\`typescript
// TS 交叉类型
type A = { name: string };
type B = { age: number };
type C = A & B;   // { name: string; age: number }

// 常用于 mixin 和组合
type Loggable = { log: (msg: string) => void };
type Serializable = { serialize: () => string };
type Service = Loggable & Serializable;
\`\`\`

\`\`\`python
from typing import Protocol
# Python：用 Protocol 多继承
class Loggable(Protocol):
    def log(self, msg: str) -> None: ...

class Serializable(Protocol):
    def serialize(self) -> str: ...

class Service(Loggable, Serializable):
    ...   # 需要同时实现两个方法
\`\`\`

### 条件类型（Conditional Types）

TS 独有，Python 没有等价物：

\`\`\`typescript
// TS 条件类型：类型层面的 if-else
type IsString<T> = T extends string ? true : false;
type A = IsString<string>;   // true
type B = IsString<number>;   // false

// infer：从泛型里提取类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type R1 = ReturnType<() => string>;   // string
type R2 = PromiseValue<Promise<number>>;   // number

// 映射类型
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
\`\`\`

Python 的类型系统是"值层面"的——它不能像 TS 那样在"类型层面"做计算。这是 TS 最强大的特性，也是最被诟病的（类型体操难读）。Python 的 \`typing\` 模块提供 \`TypeGuard\`、\`@overload\` 等机制，但远不及 TS 的"类型编程"能力。

\`\`\`python
# Python 的 @overload：类似函数重载
from typing import overload

@overload
def parse(x: int) -> int: ...
@overload
def parse(x: str) -> str: ...
def parse(x):
    if isinstance(x, int):
        return x * 2
    return x.upper()

# TypeGuard：用户自定义类型收窄
from typing import TypeGuard

def is_str_list(x: list) -> TypeGuard[list[str]]:
    return all(isinstance(i, str) for i in x)

def process(x: list) -> None:
    if is_str_list(x):
        for s in x:   # mypy 知道这里 x 是 list[str]
            print(s.upper())
\`\`\`

## 八、实际工程对比

### 类型声明文件

\`\`\`typescript
// TS：.d.ts 声明文件描述 JS 库的类型
// types/express/index.d.ts
declare namespace Express {
    interface Request { user?: User; }
    interface Response { json(data: any): void; }
}

// 全局声明
declare const VERSION: string;
declare module "legacy-lib" {
    export function oldFunc(x: number): string;
}
\`\`\`

\`\`\`python
# Python：stub 文件（.pyi）描述类型
# typing/requests.pyi
def get(url: str, **kwargs) -> Response: ...

class Response:
    status_code: int
    text: str
    def json(self) -> Any: ...
\`\`\`

两者思路一致——为"无类型的库"补充类型信息。但 TS 的 \`d.ts\` 生态更成熟（DefinitelyTyped），Python 的 \`py.typed\` marker + stub 机制相对碎片化。

### 类型检查工具链

| 工具 | TypeScript | Python |
|------|-----------|--------|
| 编译器/检查器 | tsc | mypy / pyright |
| IDE 集成 | VS Code 内置 | Pylance（pyright）|
| 严格模式 | strict: true | mypy --strict |
| 渐进式采用 | allowJs + checkJs | mypy 逐文件 |

## 九、总结对比表

| 维度 | TypeScript | Python 类型提示 |
|------|-----------|----------------|
| 检查时机 | 编译时 | 独立工具 |
| 运行时 | 完全擦除 | 保留在 __annotations__ |
| 类型系统 | 结构类型 | 名义类型（+ Protocol 结构） |
| 泛型语法 | \`<T>\` 内联 | TypeVar（3.12+ 改进） |
| 类型推断 | 激进、控制流分析 | 保守、需显式标注 |
| 联合类型 | \`A \\| B\` + 收窄 | \`Union[A, B]\` + isinstance |
| 交叉类型 | \`A & B\` | Protocol 多继承 |
| 条件类型 | ✅ 强大 | ❌ |
| 类型编程 | 类型体操 | 有限 |
| 枚举 | 编译时对象 | 运行时类 |
| 鸭子类型 | interface | Protocol |

## 十、哲学小结

**TypeScript 是"类型驱动的开发"**——类型先于实现，类型系统是设计工具，条件类型/映射类型让你在"类型层面"编程。代价是学习曲线陡峭，类型体操可读性差。

**Python 类型提示是"文档驱动的开发"**——类型是给人和工具看的文档，运行时不参与，渐进式采用友好。代价是类型系统"弱"，复杂的类型操作做不到，但代码更接近"带注解的 Python"而不是"另一门语言"。

两者的共同启示：**类型不是目的，可维护性才是**。TS 的类型体操和 Python 的过度注解都会伤害可读性——好的类型系统应该"在需要的地方严格，在不需要的地方隐形"。`,
  },
];
