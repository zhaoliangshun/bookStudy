// Python权威指南 - 第9批章节
// 分组：面向对象基础

export const chapters = [
  {
    id: "py-classes-basics",
    title: "类与对象：class语句详解",
    icon: "🏗️",
    group: "面向对象基础",
    content: `

# 类与对象：class语句详解

## 一、概述

类与对象：class语句详解是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨类与对象：class语句详解的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习类与对象：class语句详解的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入类与对象：class语句详解之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 类与对象：class语句详解的本质

类与对象：class语句详解在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示类与对象：class语句详解"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握类与对象：class语句详解至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
类与对象：class语句详解 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyClassesBasicsProcessor(BaseProcessor):
    """类与对象：class语句详解处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示类与对象：class语句详解的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyClassesBasicsProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
类与对象：class语句详解 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyClassesBasicsContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyClassesBasicsContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
类与对象：class语句详解 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章类与对象：class语句详解的学习，你应该已经掌握：

✅ Python中类与对象：class语句详解的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-init-self",
    title: "__init__方法与self：对象初始化",
    icon: "🌱",
    group: "面向对象基础",
    content: `

# __init__方法与self：对象初始化

## 一、概述

__init__方法与self：对象初始化是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨__init__方法与self：对象初始化的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习__init__方法与self：对象初始化的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入__init__方法与self：对象初始化之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 __init__方法与self：对象初始化的本质

__init__方法与self：对象初始化在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示__init__方法与self：对象初始化"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握__init__方法与self：对象初始化至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
__init__方法与self：对象初始化 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyInitSelfProcessor(BaseProcessor):
    """__init__方法与self：对象初始化处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示__init__方法与self：对象初始化的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyInitSelfProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
__init__方法与self：对象初始化 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyInitSelfContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyInitSelfContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
__init__方法与self：对象初始化 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章__init__方法与self：对象初始化的学习，你应该已经掌握：

✅ Python中__init__方法与self：对象初始化的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-instance-class-methods",
    title: "实例方法、类方法、静态方法",
    icon: "⚙️",
    group: "面向对象基础",
    content: `

# 实例方法、类方法、静态方法

## 一、概述

实例方法、类方法、静态方法是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨实例方法、类方法、静态方法的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习实例方法、类方法、静态方法的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入实例方法、类方法、静态方法之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 实例方法、类方法、静态方法的本质

实例方法、类方法、静态方法在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示实例方法、类方法、静态方法"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握实例方法、类方法、静态方法至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
实例方法、类方法、静态方法 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyInstanceClassMethodsProcessor(BaseProcessor):
    """实例方法、类方法、静态方法处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示实例方法、类方法、静态方法的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyInstanceClassMethodsProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
实例方法、类方法、静态方法 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyInstanceClassMethodsContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyInstanceClassMethodsContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
实例方法、类方法、静态方法 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章实例方法、类方法、静态方法的学习，你应该已经掌握：

✅ Python中实例方法、类方法、静态方法的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-attributes",
    title: "属性访问：实例属性与类属性",
    icon: "📋",
    group: "面向对象基础",
    content: `

# 属性访问：实例属性与类属性

## 一、概述

属性访问：实例属性与类属性是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨属性访问：实例属性与类属性的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习属性访问：实例属性与类属性的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入属性访问：实例属性与类属性之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 属性访问：实例属性与类属性的本质

属性访问：实例属性与类属性在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示属性访问：实例属性与类属性"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握属性访问：实例属性与类属性至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
属性访问：实例属性与类属性 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyAttributesProcessor(BaseProcessor):
    """属性访问：实例属性与类属性处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示属性访问：实例属性与类属性的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyAttributesProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
属性访问：实例属性与类属性 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyAttributesContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyAttributesContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
属性访问：实例属性与类属性 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章属性访问：实例属性与类属性的学习，你应该已经掌握：

✅ Python中属性访问：实例属性与类属性的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-properties",
    title: "property：属性装饰器实现",
    icon: "🏷️",
    group: "面向对象基础",
    content: `

# property：属性装饰器实现

## 一、概述

property：属性装饰器实现是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨property：属性装饰器实现的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习property：属性装饰器实现的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入property：属性装饰器实现之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 property：属性装饰器实现的本质

property：属性装饰器实现在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示property：属性装饰器实现"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握property：属性装饰器实现至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
property：属性装饰器实现 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyPropertiesProcessor(BaseProcessor):
    """property：属性装饰器实现处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示property：属性装饰器实现的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyPropertiesProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
property：属性装饰器实现 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyPropertiesContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyPropertiesContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
property：属性装饰器实现 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章property：属性装饰器实现的学习，你应该已经掌握：

✅ Python中property：属性装饰器实现的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-encapsulation",
    title: "封装：单下划线、双下划线与访问控制",
    icon: "📦",
    group: "面向对象基础",
    content: `

# 封装：单下划线、双下划线与访问控制

## 一、概述

封装：单下划线、双下划线与访问控制是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨封装：单下划线、双下划线与访问控制的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习封装：单下划线、双下划线与访问控制的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入封装：单下划线、双下划线与访问控制之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 封装：单下划线、双下划线与访问控制的本质

封装：单下划线、双下划线与访问控制在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示封装：单下划线、双下划线与访问控制"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握封装：单下划线、双下划线与访问控制至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
封装：单下划线、双下划线与访问控制 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyEncapsulationProcessor(BaseProcessor):
    """封装：单下划线、双下划线与访问控制处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示封装：单下划线、双下划线与访问控制的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyEncapsulationProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
封装：单下划线、双下划线与访问控制 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyEncapsulationContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyEncapsulationContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
封装：单下划线、双下划线与访问控制 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章封装：单下划线、双下划线与访问控制的学习，你应该已经掌握：

✅ Python中封装：单下划线、双下划线与访问控制的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-inheritance-basics",
    title: "继承基础：代码复用机制",
    icon: "🧬",
    group: "面向对象基础",
    content: `

# 继承基础：代码复用机制

## 一、概述

继承基础：代码复用机制是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨继承基础：代码复用机制的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习继承基础：代码复用机制的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入继承基础：代码复用机制之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 继承基础：代码复用机制的本质

继承基础：代码复用机制在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示继承基础：代码复用机制"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握继承基础：代码复用机制至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
继承基础：代码复用机制 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PyInheritanceBasicsProcessor(BaseProcessor):
    """继承基础：代码复用机制处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示继承基础：代码复用机制的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PyInheritanceBasicsProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
继承基础：代码复用机制 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PyInheritanceBasicsContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PyInheritanceBasicsContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
继承基础：代码复用机制 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章继承基础：代码复用机制的学习，你应该已经掌握：

✅ Python中继承基础：代码复用机制的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  },
  {
    id: "py-super",
    title: "super()函数：调用父类方法",
    icon: "⬆️",
    group: "面向对象基础",
    content: `

# super()函数：调用父类方法

## 一、概述

super()函数：调用父类方法是Python编程中极其重要的知识点。Python以其简洁优雅的语法和强大的功能而闻名，但要真正掌握Python，仅仅了解表面语法是远远不够的。本章将深入探讨super()函数：调用父类方法的方方面面，从底层原理到高级用法，从常见陷阱到性能优化，帮助你成为Python高手。

Python的设计哲学是「优雅」「明确」「简单」。在学习super()函数：调用父类方法的过程中，你会深刻体会到这一点。我们将通过大量的代码示例、性能对比、最佳实践建议，让你不仅「会用」，更能「用好」Python。

## 二、核心概念与底层原理

### 2.1 Python数据模型

在深入super()函数：调用父类方法之前，我们需要理解Python的核心数据模型。Python中的一切都是对象，这不是一句口号，而是事实。

\`\`\`python
# 验证：一切皆对象
print(type(42))           # <class 'int'>
print(type("hello"))      # <class 'str'>
print(type([1, 2, 3]))   # <class 'list'>
print(type(print))        # <class 'builtin_function_or_method'>
print(type(type))         # <class 'type'>

# 甚至类也是type的实例
class MyClass:
    pass

print(type(MyClass))      # <class 'type'>

\`\`\`

### 2.2 super()函数：调用父类方法的本质

super()函数：调用父类方法在Python中有着特殊的地位。让我们通过dir()函数和help()函数来探索：

\`\`\`python
# 探索对象的属性和方法
class Example:
    """示例类，用于演示super()函数：调用父类方法"""
    
    def __init__(self, value):
        self.value = value
    
    def __repr__(self):
        return f"Example({self.value!r})"


ex = Example(42)

# 查看所有特殊方法和属性
print("特殊方法列表:")
for attr in dir(ex):
    if attr.startswith('__') and attr.endswith('__'):
        print(f"  {attr}")

\`\`\`

### 2.3 内存模型与引用

理解Python的内存管理对于掌握super()函数：调用父类方法至关重要：

\`\`\`python
import sys

# 查看对象的内存占用
values = [
    None,
    True,
    False,
    42,
    3.14,
    "hello",
    [],
    {},
]

print("各对象内存占用（字节）:")
for v in values:
    print(f"  {type(v).__name__:10} : {sys.getsizeof(v):4} bytes")

# 引用计数演示
import ctypes

def ref_count(obj):
    return ctypes.c_long.from_address(id(obj)).value

a = [1, 2, 3]
print(f"\\n初始引用计数: {ref_count(a)}")
b = a
print(f"赋值后引用计数: {ref_count(a)}")
del b
print(f"del后引用计数: {ref_count(a)}")

\`\`\`

## 三、详尽代码示例

### 3.1 基础用法详解

\`\`\`python
"""
super()函数：调用父类方法 - 基础用法演示
"""
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import time
import functools
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """处理器抽象基类"""
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """处理数据"""
        pass
    
    def validate(self, data: Any) -> bool:
        """验证数据"""
        return data is not None


@dataclass
class ProcessingResult:
    """处理结果数据类"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PySuperProcessor(BaseProcessor):
    """super()函数：调用父类方法处理器 - 完整实现示例"""
    
    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        on_complete: Optional[Callable[[ProcessingResult], None]] = None
    ):
        self.config = {
            'max_retries': 3,
            'timeout': 30,
            'cache_enabled': True,
            'debug': False,
            **(config or {})
        }
        self._cache: Dict[str, Any] = {}
        self._on_complete = on_complete
        self._call_count = 0
    
    def process(self, data: Any) -> ProcessingResult:
        """
        处理数据的主方法
        
        Args:
            data: 输入数据
            
        Returns:
            ProcessingResult: 处理结果
        """
        start_time = time.time()
        self._call_count += 1
        
        try:
            # 1. 验证输入
            if not self.validate(data):
                raise ValueError("输入数据验证失败")
            
            # 2. 检查缓存
            cache_key = self._make_cache_key(data)
            if self.config['cache_enabled'] and cache_key in self._cache:
                logger.debug(f"缓存命中: {cache_key}")
                cached = self._cache[cache_key]
                return ProcessingResult(
                    success=True,
                    data=cached,
                    execution_time=time.time() - start_time,
                    metadata={'cached': True, 'call_number': self._call_count}
                )
            
            # 3. 重试逻辑
            result_data = None
            last_error = None
            
            for attempt in range(1, self.config['max_retries'] + 1):
                try:
                    logger.debug(f"尝试第 {attempt} 次处理")
                    result_data = self._do_process(data)
                    break
                except Exception as e:
                    last_error = e
                    logger.warning(f"第 {attempt} 次尝试失败: {e}")
                    if attempt < self.config['max_retries']:
                        time.sleep(0.1 * attempt)
            
            if last_error and result_data is None:
                raise last_error
            
            # 4. 缓存结果
            if self.config['cache_enabled']:
                self._cache[cache_key] = result_data
            
            result = ProcessingResult(
                success=True,
                data=result_data,
                execution_time=time.time() - start_time,
                metadata={
                    'cached': False,
                    'call_number': self._call_count,
                    'cache_size': len(self._cache)
                }
            )
            
        except Exception as e:
            logger.error(f"处理失败: {e}", exc_info=self.config['debug'])
            result = ProcessingResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time,
                metadata={'call_number': self._call_count}
            )
        
        # 回调通知
        if self._on_complete:
            try:
                self._on_complete(result)
            except Exception as e:
                logger.warning(f"回调执行失败: {e}")
        
        return result
    
    def _do_process(self, data: Any) -> Any:
        """
        实际处理逻辑（子类可重写）
        
        这里演示super()函数：调用父类方法的核心处理逻辑
        """
        if isinstance(data, list):
            return self._process_list(data)
        elif isinstance(data, dict):
            return self._process_dict(data)
        elif isinstance(data, str):
            return self._process_string(data)
        else:
            return data
    
    def _process_list(self, items: List[Any]) -> List[Any]:
        """处理列表数据"""
        return [self._process_single(item) for item in items if item is not None]
    
    def _process_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理字典数据"""
        return {
            key: self._process_single(value)
            for key, value in data.items()
            if not key.startswith('_')
        }
    
    def _process_string(self, text: str) -> str:
        """处理字符串数据"""
        return text.strip().title()
    
    def _process_single(self, item: Any) -> Any:
        """处理单个数据项"""
        if isinstance(item, (int, float)):
            return item * 2
        return item
    
    def _make_cache_key(self, data: Any) -> str:
        """生成缓存键"""
        try:
            return str(hash(str(data)))
        except Exception:
            return str(id(data))
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("缓存已清空")
    
    @property
    def stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'total_calls': self._call_count,
            'cache_size': len(self._cache),
            'config': self.config.copy()
        }


def timing_decorator(func: Callable) -> Callable:
    """计时装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} 执行时间: {elapsed:.6f}秒")
    return wrapper


# 使用示例
if __name__ == '__main__':
    # 创建处理器
    processor = PySuperProcessor(
        config={'debug': True, 'max_retries': 2}
    )
    
    # 测试数据
    test_cases = [
        "hello world",
        [1, 2, 3, None, 5],
        {"name": "alice", "age": 25, "_private": "hidden"},
        42,
        None,  # 会触发验证失败
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\\n{'='*60}")
        print(f"测试用例 {i}: {test_data!r}")
        print('='*60)
        
        result = processor.process(test_data)
        
        print(f"成功: {result.success}")
        print(f"执行时间: {result.execution_time:.6f}秒")
        if result.success:
            print(f"结果: {result.data!r}")
        else:
            print(f"错误: {result.error}")
        print(f"元数据: {result.metadata}")
    
    print(f"\\n统计信息: {processor.stats}")

\`\`\`

### 3.2 高级特性演示

\`\`\`python
"""
super()函数：调用父类方法 - 高级特性
演示描述符、上下文管理器、元类等高级Python特性
"""
from typing import Any


class ValidatedAttribute:
    """描述符：实现属性验证"""
    
    def __init__(self, name: str, validator=None):
        self.name = name
        self.validator = validator or (lambda x: True)
        self.private_name = f'_{name}'
    
    def __get__(self, obj: Any, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj: Any, value: Any):
        if not self.validator(value):
            raise ValueError(f'{self.name} 验证失败: {value!r}')
        setattr(obj, self.private_name, value)


class PySuperContextManager:
    """上下文管理器示例"""
    
    def __init__(self, name: str):
        self.name = name
    
    def __enter__(self):
        print(f'进入上下文: {self.name}')
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        print(f'退出上下文: {self.name} (耗时: {elapsed:.4f}秒)')
        if exc_type:
            print(f'发生异常: {exc_type.__name__}: {exc_val}')
            return False  # 不抑制异常
        return True


# 生成器示例
def fibonacci_generator(count: int):
    """斐波那契数列生成器 - 演示惰性求值"""
    a, b = 0, 1
    for _ in range(count):
        yield a
        a, b = b, a + b


# 使用示例
if __name__ == '__main__':
    import time
    
    # 生成器使用
    print("斐波那契数列前20项:")
    for i, num in enumerate(fibonacci_generator(20)):
        print(f"F({i:2d}) = {num:5d}")
    
    # 上下文管理器使用
    print()
    with PySuperContextManager("测试") as ctx:
        print("在上下文中执行操作...")
        time.sleep(0.1)

\`\`\`

### 3.3 性能对比与优化

\`\`\`python
"""
super()函数：调用父类方法 - 性能对比
展示不同实现方式的性能差异
"""
import timeit
import sys


def benchmark(name, func, number=10000):
    """性能测试工具函数"""
    elapsed = timeit.timeit(func, number=number)
    per_op = elapsed / number * 1_000_000
    print(f"{name:30s}: {elapsed:.4f}s total, {per_op:.2f}μs per op ({number}次)")


# 演示不同方法的性能差异
TEST_DATA = list(range(1000))

# 方法1: for循环append
def method1_for_loop():
    result = []
    for x in TEST_DATA:
        if x % 2 == 0:
            result.append(x ** 2)
    return result

# 方法2: 列表推导式
def method2_list_comprehension():
    return [x ** 2 for x in TEST_DATA if x % 2 == 0]

# 方法3: filter + map
def method3_filter_map():
    return list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, TEST_DATA)))

# 方法4: 生成器表达式
def method4_generator():
    return list(x ** 2 for x in TEST_DATA if x % 2 == 0)


if __name__ == '__main__':
    print(f"Python版本: {sys.version}")
    print(f"测试数据量: {len(TEST_DATA)}\\n")
    
    benchmark("for循环 + append", method1_for_loop)
    benchmark("列表推导式", method2_list_comprehension)
    benchmark("filter + map", method3_filter_map)
    benchmark("生成器表达式", method4_generator)

\`\`\`

## 四、常见陷阱与Pythonic坑

### 4.1 经典Python陷阱

| 陷阱 | 危险代码 | 正确写法 | 说明 |
|-----|---------|---------|------|
| 可变默认参数 | \`def f(a=[]):\` | \`def f(a=None):\` | 默认参数在函数定义时求值一次 |
| 整数缓存 | \`a=256;b=256;a is b\`为True | 总是用==比较相等 | 小整数被缓存，is比较不可靠 |
| 浮点数精度 | \`0.1+0.2!=0.3\` | 使用decimal或math.isclose | 二进制浮点数精度限制 |
| 循环变量泄漏 | 列表推导式变量在外部可见？ | Python3已修复，但要注意 | Python2中列表推导会泄漏变量 |
| 延迟绑定闭包 | lambda中使用循环变量 | 使用默认参数捕获当前值 | 闭包绑定的是变量不是值 |

### 4.2 陷阱详解与修复

**陷阱1：可变默认参数**

\`\`\`python
# ❌ 危险！
def append_to(item, target=[]):
    target.append(item)
    return target

# 第一次调用
print(append_to(1))  # [1]
# 第二次调用 - 同一个列表！
print(append_to(2))  # [1, 2] !!!
# 第三次调用
print(append_to(3))  # [1, 2, 3] !!!

# ✅ 正确写法
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

\`\`\`

**陷阱2：闭包延迟绑定**

\`\`\`python
# ❌ 危险！所有lambda都引用同一个i
functions = []
for i in range(5):
    functions.append(lambda: i)

print([f() for f in functions])  # [4, 4, 4, 4, 4] !!!

# ✅ 正确写法1：使用默认参数
functions = []
for i in range(5):
    functions.append(lambda i=i: i)

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ✅ 正确写法2：使用functools.partial
from functools import partial
functions = []
for i in range(5):
    functions.append(partial(lambda x: x, i))

\`\`\`

**陷阱3：深浅拷贝**

\`\`\`python
import copy

# ❌ 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]] - 原对象也被修改了！

# ✅ 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]] - 原对象不受影响

\`\`\`

## 五、Python最佳实践

### 5.1 Pythonic代码风格

\`\`\`python
"""
Pythonic写法 vs 非Pythonic写法对比
"""
from typing import List

# ---------- 遍历 ----------
items = ['a', 'b', 'c']

# ❌ 非Pythonic：用索引遍历
for i in range(len(items)):
    print(i, items[i])

# ✅ Pythonic：直接遍历
for item in items:
    print(item)

# ✅ 需要索引时用enumerate
for idx, item in enumerate(items):
    print(idx, item)

# ---------- 字典遍历 ----------
d = {'a': 1, 'b': 2, 'c': 3}

# ❌ 非Pythonic
for key in d.keys():
    print(key, d[key])

# ✅ Pythonic
for key, value in d.items():
    print(key, value)

# ---------- 条件判断 ----------

# ❌ 非Pythonic
if x == True:
    pass
if len(items) == 0:
    pass
if items != None:
    pass

# ✅ Pythonic
if x is True:  # 或直接 if x:
    pass
if not items:  # 空列表/字典/字符串/None都是False
    pass
if items is not None:
    pass

# ---------- 列表操作 ----------

# ❌ 非Pythonic：需要索引交换
temp = a
a = b
b = temp

# ✅ Pythonic：元组解包
a, b = b, a

# ---------- 文件操作 ----------

# ❌ 非Pythonic：手动关闭
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()

# ✅ Pythonic：上下文管理器
with open('file.txt', 'r') as f:
    content = f.read()

\`\`\`

### 5.2 类型提示最佳实践

\`\`\`python
"""
类型提示（Type Hints）最佳实践 - Python 3.9+
"""
from typing import (
    TypeVar, Generic, Optional, Union, Literal,
    overload, TypedDict, Protocol
)
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from enum import Enum


# 枚举代替字符串常量
class Status(Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    CLOSED = 'closed'


# TypedDict定义结构化字典类型
class User(TypedDict):
    id: int
    name: str
    email: str
    status: Status


# 泛型示例
T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()
    
    def peek(self) -> Optional[T]:
        return self._items[-1] if self._items else None


# 函数重载
@overload
def process(data: str) -> list[str]: ...

@overload
def process(data: int) -> list[int]: ...

def process(data: Union[str, int]) -> list:
    """根据输入类型返回不同结果"""
    if isinstance(data, str):
        return data.split()
    else:
        return [data, data * 2, data * 3]


# Protocol定义结构化类型（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

def serialize(obj: Serializable) -> str:
    import json
    return json.dumps(obj.to_dict())


@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
    
    def to_dict(self) -> dict:
        return {'x': self.x, 'y': self.y, 'label': self.label}


# 使用示例
if __name__ == '__main__':
    # Stack示例
    stack: Stack[int] = Stack()
    stack.push(1)
    stack.push(2)
    print(stack.pop())  # 2
    
    # 类型安全的序列化
    p = Point(3.0, 4.0, "目标点")
    print(serialize(p))

\`\`\`

## 六、Python 3.10+ 新特性

### 6.1 Match-Case 语句

\`\`\`python
"""
Python 3.10+ 新增的 match-case 模式匹配
比if-elif-else更强大、更清晰
"""
from typing import Union
from dataclasses import dataclass
from enum import Enum, auto


class ShapeType(Enum):
    CIRCLE = auto()
    RECTANGLE = auto()
    TRIANGLE = auto()


@dataclass
class Shape:
    kind: ShapeType
    x: float
    y: float
    width: float = 0
    height: float = 0
    radius: float = 0


def calculate_area(shape: Shape) -> float:
    import math
    
    match shape:
        case Shape(kind=ShapeType.CIRCLE, radius=r):
            return math.pi * r ** 2
        
        case Shape(kind=ShapeType.RECTANGLE, width=w, height=h):
            return w * h
        
        case Shape(kind=ShapeType.TRIANGLE, width=base, height=h):
            return 0.5 * base * h
        
        case _:
            raise ValueError(f"未知形状: {shape.kind}")


# 列表/元组模式匹配
def http_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "OK"
        case 201:
            return "Created"
        case 400:
            return "Bad Request"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case code if code >= 200 and code < 300:
            return f"Success ({code})"
        case code if code >= 400 and code < 500:
            return f"Client Error ({code})"
        case code if code >= 500:
            return f"Server Error ({code})"
        case _:
            return f"Unknown ({status_code})"


# 字典模式匹配
def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"点击位置: ({x}, {y})"
        case {"type": "keypress", "key": "Enter"}:
            return "按下回车键"
        case {"type": "keypress", "key": key}:
            return f"按下键: {key}"
        case {"type": event_type}:
            return f"未处理的事件类型: {event_type}"
        case {}:
            return "无效事件"

\`\`\`

### 6.2 Union类型运算符

\`\`\`python
"""
Python 3.10+ 支持使用 | 表示Union类型
Python 3.9+ 也可以通过from __future__启用
"""
# from __future__ import annotations  # Python 3.9需要

# 旧写法
from typing import Union, Optional
def old_style(x: Union[int, str]) -> Optional[str]:
    pass

# 新写法 - 更简洁
def new_style(x: int | str) -> str | None:
    return str(x)

# isinstance也支持
def process_value(value: int | str | list) -> str:
    if isinstance(value, int | str):  # 等同于 isinstance(value, (int, str))
        return str(value)
    elif isinstance(value, list):
        return ", ".join(str(v) for v in value)
    else:
        raise TypeError(f"不支持的类型: {type(value)}")


# TypeGuard 类型守卫 (Python 3.10+)
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process_list(items: list[object]) -> None:
    if is_string_list(items):
        # 这里items被推断为list[str]
        for s in items:
            print(s.upper())  # 类型安全！

\`\`\`

### 6.3 Python 3.11/3.12新特性

\`\`\`python
"""
Python 3.11/3.12 新特性演示
- 更快的执行速度（平均25%提速）
- tomllib内置TOML解析
- Exception Groups异常组
- TaskGroup异步任务组
- 更精确的错误提示
"""
import sys
print(f"当前Python版本: {sys.version}")


# 1. tomllib - 内置TOML解析 (Python 3.11+)
def demo_toml():
    try:
        import tomllib
    except ImportError:
        print("tomllib需要Python 3.11+")
        return
    
    toml_content = """
[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
port = 8080
debug = true
"""
    
    config = tomllib.loads(toml_content)
    print(f"数据库配置: {config['database']}")
    return config


# 2. Exception Groups - 异常组 (Python 3.11+)
def demo_exception_groups():
    if sys.version_info < (3, 11):
        print("Exception Groups需要Python 3.11+")
        return
    
    errors: list[Exception] = []
    
    for i, value in enumerate(["a", 0, "b", 2]):
        try:
            result = 10 / value
        except Exception as e:
            errors.append(e)
    
    if errors:
        try:
            raise ExceptionGroup("发生多个错误", errors)
        except ExceptionGroup as eg:
            print(f"捕获到 {len(eg.exceptions)} 个异常:")
            for e in eg.exceptions:
                print(f"  - {type(e).__name__}: {e}")


# 3. TaskGroup - 结构化并发 (Python 3.11+)
import asyncio

async def demo_task_group():
    if sys.version_info < (3, 11):
        print("TaskGroup需要Python 3.11+")
        return
    
    async def fetch_data(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"{name}: 数据获取完成"
    
    # 旧方式: 手动创建gather
    # results = await asyncio.gather(
    #     fetch_data("API1", 1),
    #     fetch_data("API2", 0.5),
    # )
    
    # 新方式: TaskGroup结构化并发
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("API1", 1))
        task2 = tg.create_task(fetch_data("API2", 0.5))
    
    print(f"结果: {task1.result()}, {task2.result()}")


if __name__ == '__main__':
    print("\\n=== TOML 演示 ===")
    demo_toml()
    
    print("\\n=== Exception Groups 演示 ===")
    demo_exception_groups()
    
    print("\\n=== TaskGroup 演示 ===")
    asyncio.run(demo_task_group())

\`\`\`

## 七、实战练习

### 练习1：数据类与验证

实现一个配置管理系统，要求：
- 使用dataclass定义配置结构
- 添加字段验证逻辑
- 支持从字典加载配置
- 支持序列化回字典
- 类型提示完整

### 练习2：装饰器高级应用

实现一个通用的缓存装饰器，支持：
- 可配置的过期时间
- 自定义缓存键生成函数
- 缓存命中率统计
- 可选择是否缓存None结果

### 练习3：异步并发

实现一个异步网页抓取器，要求：
- 使用aiohttp进行HTTP请求
- 限制并发数（使用信号量）
- 支持重试机制
- 进度显示
- 错误处理和统计

## 八、小结

通过本章super()函数：调用父类方法的学习，你应该已经掌握：

✅ Python中super()函数：调用父类方法的底层原理和工作机制
✅ 相关的高级特性和Pythonic写法
✅ 常见的陷阱以及如何避免
✅ 性能优化技巧和最佳实践
✅ Python 3.10+的新特性在该场景下的应用
✅ 编写类型安全、可维护的Python代码

Python是一门「越学越深」的语言。看似简单的语法背后蕴含着精妙的设计哲学。持续学习、持续实践、持续重构，你会写出越来越优雅的Python代码。

### 推荐进阶阅读

- 《Fluent Python》（流畅的Python）- Luciano Ramalho
- 《Effective Python》- Brett Slatkin
- 《Python Cookbook》- David Beazley
- 《High Performance Python》- Micha Gorelick
- Python官方文档：https://docs.python.org/

记住：优秀的Python程序员不是知道所有语法的人，而是知道在合适的场景使用合适特性的人。继续加油！🐍🚀
`
  }
];
