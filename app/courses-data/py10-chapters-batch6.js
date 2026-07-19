// =============================================================
// Python 从入门到精通大全（终极版）—— 第6批章节
// 第六部分 函数进阶（共 5 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第二十六章：递归与算法
  // =========================================================
  {
    id: "py10-ch26",
    group: "第六部分 函数进阶",
    icon: "🌀",
    title: "第二十六章 递归与算法",
    content: `## 递归：函数自己调用自己

**递归**是一种编程技巧：函数在内部调用自己。它能把复杂问题拆解成相同结构的子问题，让代码更简洁。但递归也有代价：性能、栈溢出、调试难度。理解递归的关键是**找到基线条件**和**递归条件**。

### 递归的两个要素

\`\`\`python
# 每个递归函数都必须有两个要素：
# 1. 基线条件（base case）：递归终止的条件，不再调用自己
# 2. 递归条件（recursive case）：把问题拆小，调用自己

# 经典例子：倒数
def countdown(n):
    """从 n 倒数到 1"""
    # 基线条件：n <= 0 时停止
    if n <= 0:
        print("发射！")
        return  # 不再调用自己，递归结束
    # 递归条件：打印当前数，然后处理更小的问题
    print(n)
    countdown(n - 1)  # 调用自己，参数更小

countdown(5)
# 输出：
# 5
# 4
# 3
# 2
# 1
# 发射！

# ⚠️ 没有基线条件的递归 = 无限递归 = 栈溢出
# def bad_recursion(n):
#     return bad_recursion(n - 1)  # 永远不停，最终 RecursionError
\`\`\`

## 一、阶乘：最经典的递归

\`\`\`python
# 数学定义：
# n! = n * (n-1) * (n-2) * ... * 1
# 0! = 1（定义）
# 用递归表达：
# n! = n * (n-1)!  当 n > 0
# 0! = 1           当 n == 0

def factorial(n):
    """计算 n 的阶乘"""
    # 基线条件：0! = 1
    if n == 0:
        return 1
    # 递归条件：n! = n * (n-1)!
    return n * factorial(n - 1)

print(factorial(0))  # 1
print(factorial(5))  # 120
print(factorial(10))  # 3628800

# 递归过程展开（以 factorial(5) 为例）：
# factorial(5)
# = 5 * factorial(4)
# = 5 * (4 * factorial(3))
# = 5 * (4 * (3 * factorial(2)))
# = 5 * (4 * (3 * (2 * factorial(1))))
# = 5 * (4 * (3 * (2 * (1 * factorial(0)))))
# = 5 * (4 * (3 * (2 * (1 * 1))))  ← factorial(0) 返回 1，开始"归"
# = 5 * (4 * (3 * (2 * 1)))
# = 5 * (4 * (3 * 2))
# = 5 * (4 * 6)
# = 5 * 24
# = 120

# 迭代版本对比：用循环
def factorial_iter(n):
    """迭代版本：用循环计算阶乘"""
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(factorial_iter(5))  # 120（结果一样）
\`\`\`

## 二、斐波那契数列

\`\`\`python
# 斐波那契数列：1, 1, 2, 3, 5, 8, 13, 21, ...
# 规则：fib(n) = fib(n-1) + fib(n-2)
# 基线：fib(1) = fib(2) = 1

def fib(n):
    """计算第 n 个斐波那契数"""
    # 基线条件
    if n <= 2:
        return 1
    # 递归条件
    return fib(n - 1) + fib(n - 2)

# 测试
for i in range(1, 11):
    print(f"fib({i}) = {fib(i)}")
# fib(1) = 1
# fib(2) = 1
# fib(3) = 2
# fib(4) = 3
# fib(5) = 5
# ...
# fib(10) = 55

# ⚠️ 这个实现有严重性能问题：重复计算
# fib(5) = fib(4) + fib(3)
#        = (fib(3) + fib(2)) + (fib(2) + fib(1))
#        = ((fib(2) + fib(1)) + fib(2)) + (fib(2) + fib(1))
# 注意 fib(2) 和 fib(1) 被多次计算！
# 复杂度是 O(2^n)，fib(40) 就要算很久

# 性能测试
import time
start = time.time()
print(fib(35))  # 9227465
print(f"耗时: {time.time() - start:.2f}s")  # 可能要几秒
\`\`\`

## 三、用缓存优化递归（记忆化）

\`\`\`python
# 方法一：手动实现缓存
def fib_memo(n, memo=None):
    """带记忆化的斐波那契"""
    if memo is None:
        memo = {}  # 缓存字典
    
    # 先查缓存
    if n in memo:
        return memo[n]
    
    # 基线条件
    if n <= 2:
        return 1
    
    # 递归计算并缓存
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

import time
start = time.time()
print(fib_memo(100))  # 瞬间算出
print(f"耗时: {time.time() - start:.4f}s")

# 方法二：用 functools.lru_cache（更优雅）
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    """用 lru_cache 自动缓存"""
    if n <= 2:
        return 1
    return fib_cached(n - 1) + fib_cached(n - 2)

start = time.time()
print(fib_cached(100))  # 瞬间算出
print(f"耗时: {time.time() - start:.4f}s")

# 方法三：迭代版本（最优）
def fib_iter(n):
    """迭代版本：O(n) 时间，O(1) 空间"""
    if n <= 2:
        return 1
    a, b = 1, 1
    for _ in range(3, n + 1):
        a, b = b, a + b  # 同时更新两个变量
    return b

print(fib_iter(100))  # 354224848179261915075

# 三种方法对比：
# | 方法        | 时间复杂度 | 空间复杂度 | 备注              |
# |------------|----------|----------|-------------------|
# | 朴素递归     | O(2^n)  | O(n)    | 慢得无法接受        |
# | 记忆化递归   | O(n)    | O(n)    | 快，但栈深度限制    |
# | 迭代         | O(n)    | O(1)    | 最优，推荐          |
\`\`\`

## 四、二分查找：递归经典算法

\`\`\`python
# 二分查找：在有序列表中找目标值
# 每次把搜索范围折半，效率 O(log n)

def binary_search_recursive(arr, target, low, high):
    """递归版二分查找"""
    # 基线条件：找不到
    if low > high:
        return -1
    
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid  # 找到了
    elif arr[mid] > target:
        # 目标在左半边
        return binary_search_recursive(arr, target, low, mid - 1)
    else:
        # 目标在右半边
        return binary_search_recursive(arr, target, mid + 1, high)

# 包装函数，简化调用
def binary_search(arr, target):
    return binary_search_recursive(arr, target, 0, len(arr) - 1)

# 测试
sorted_list = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(binary_search(sorted_list, 7))   # 3（索引）
print(binary_search(sorted_list, 19))  # 9
print(binary_search(sorted_list, 6))   # -1（不存在）

# 迭代版本
def binary_search_iter(arr, target):
    """迭代版二分查找"""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] > target:
            high = mid - 1
        else:
            low = mid + 1
    return -1

print(binary_search_iter(sorted_list, 11))  # 5

# 递归过程展开（在 [1,3,5,7,9] 中找 7）：
# binary_search([1,3,5,7,9], 7, 0, 4)
#   mid=2, arr[2]=5 < 7，搜索右半
# binary_search([1,3,5,7,9], 7, 3, 4)
#   mid=3, arr[3]=7 == 7，返回 3 ✅
\`\`\`

## 五、递归深度限制

\`\`\`python
import sys

# Python 默认递归深度限制是 1000
print(sys.getrecursionlimit())  # 1000

# 尝试深度递归
def deep_recursion(n):
    if n == 0:
        return "done"
    return deep_recursion(n - 1)

# 在 1000 以内是安全的
print(deep_recursion(500))  # done

# 超过限制会报错
# print(deep_recursion(2000))  # ❌ RecursionError: maximum recursion depth exceeded

# 可以修改限制（但小心栈溢出！）
sys.setrecursionlimit(5000)
print(deep_recursion(2000))  # done
# 但不要无限提高，可能导致 Python 崩溃（C 栈溢出）

# 为什么有这个限制？
# 每次递归调用都会在内存中创建一个新的栈帧
# 栈帧保存：局部变量、返回地址、参数等
# 无限递归会耗尽栈内存，导致程序崩溃
\`\`\`

## 六、Python 不优化尾递归

\`\`\`python
# 尾递归：递归调用是函数的最后一步
# 一些语言（如 Scheme）会优化尾递归，复用栈帧
# 但 Python 不会优化尾递归！

# 普通递归（不是尾递归）：递归调用后还要乘 n
def factorial_normal(n):
    if n == 0:
        return 1
    return n * factorial_normal(n - 1)  # 递归调用后还有操作

# 尾递归版本：用累加器参数
def factorial_tail(n, acc=1):
    """尾递归：递归调用是最后一步"""
    if n == 0:
        return acc
    # 递归调用就是最后一步，没有后续操作
    return factorial_tail(n - 1, n * acc)

print(factorial_normal(5))  # 120
print(factorial_tail(5))    # 120

# 虽然 factorial_tail 是尾递归，但 Python 不优化
# 依然会创建新的栈帧，依然有深度限制
# print(factorial_tail(2000))  # 依然会 RecursionError

# 所以在 Python 中，能用迭代就用迭代
def factorial_best(n):
    """推荐：迭代版本"""
    acc = 1
    for i in range(1, n + 1):
        acc *= i
    return acc
\`\`\`

## 七、递归转迭代：通用方法

\`\`\`python
# 任何递归都可以转成迭代（用栈模拟）
# 原理：递归本质是系统帮你管理栈，迭代是你自己管理栈

# 递归版：树遍历
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def traverse_recursive(node):
    """递归版前序遍历"""
    if node is None:
        return
    print(node.value, end=" ")
    traverse_recursive(node.left)
    traverse_recursive(node.right)

# 迭代版：用栈模拟
def traverse_iterative(root):
    """迭代版前序遍历"""
    if root is None:
        return
    stack = [root]
    while stack:
        node = stack.pop()
        print(node.value, end=" ")
        # 先压右后压左，这样左先出栈
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)

# 构建测试树
#       1
#      / \\
#     2   3
#    / \\
#   4   5
tree = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3)
)

traverse_recursive(tree)   # 1 2 4 5 3
print()
traverse_iterative(tree)   # 1 2 4 5 3
\`\`\`

## 八、经典递归问题

### 汉诺塔

\`\`\`python
def hanoi(n, source, target, auxiliary):
    """把 n 个盘子从 source 移到 target，借助 auxiliary"""
    if n == 1:
        # 基线条件：只有一个盘子，直接移
        print(f"把盘子 1 从 {source} 移到 {target}")
        return
    # 递归条件：分三步
    # 1. 把上面 n-1 个盘子从 source 移到 auxiliary
    hanoi(n - 1, source, auxiliary, target)
    # 2. 把最底下的大盘子从 source 移到 target
    print(f"把盘子 {n} 从 {source} 移到 {target}")
    # 3. 把那 n-1 个盘子从 auxiliary 移到 target
    hanoi(n - 1, auxiliary, target, source)

# 测试：3 个盘子从 A 移到 C
hanoi(3, "A", "C", "B")
# 输出：
# 把盘子 1 从 A 移到 C
# 把盘子 2 从 A 移到 B
# 把盘子 1 从 C 移到 B
# 把盘子 3 从 A 移到 C
# 把盘子 1 从 B 移到 A
# 把盘子 2 从 B 移到 C
# 把盘子 1 从 A 移到 C

# 移动次数：2^n - 1
# 3 个盘子 = 7 步
# 64 个盘子 = 2^64 - 1 ≈ 1.8 * 10^19 步（"世界末日"传说）
\`\`\`

### 全排列

\`\`\`python
def permutations(arr):
    """生成全排列"""
    # 基线条件：只有一个元素
    if len(arr) <= 1:
        return [arr]
    
    result = []
    for i, elem in enumerate(arr):
        # 取出一个元素，对剩余元素递归
        rest = arr[:i] + arr[i+1:]
        for p in permutations(rest):
            result.append([elem] + p)
    return result

print(permutations([1, 2, 3]))
# [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]

# 用 itertools 更高效
import itertools
print(list(itertools.permutations([1, 2, 3])))
\`\`\`

### 子集生成

\`\`\`python
def subsets(arr):
    """生成所有子集"""
    if not arr:
        return [[]]  # 空集的子集只有空集
    
    # 取第一个元素
    first = arr[0]
    rest_subsets = subsets(arr[1:])
    
    # 不包含 first 的子集 + 包含 first 的子集
    return rest_subsets + [[first] + s for s in rest_subsets]

print(subsets([1, 2, 3]))
# [[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]
\`\`\`

### 快速排序（递归）

\`\`\`python
def quick_sort(arr):
    """快速排序：分治法"""
    # 基线条件：长度 <= 1 的列表已排序
    if len(arr) <= 1:
        return arr
    
    # 选基准（这里选第一个元素）
    pivot = arr[0]
    # 分成两部分：比 pivot 小的 和 比 pivot 大的
    less = [x for x in arr[1:] if x <= pivot]
    greater = [x for x in arr[1:] if x > pivot]
    
    # 递归排序两部分，然后拼接
    return quick_sort(less) + [pivot] + quick_sort(greater)

print(quick_sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]))
# [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]

# 归并排序（也是递归）
def merge_sort(arr):
    """归并排序"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # 合并两个有序列表
    return merge(left, right)

def merge(left, right):
    """合并两个有序列表"""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([3, 1, 4, 1, 5, 9, 2, 6]))
\`\`\`

## 九、递归的优缺点

| 优点 | 缺点 |
| --- | --- |
| 代码简洁，符合数学直觉 | 性能较差（函数调用开销） |
| 适合分治、树形问题 | 有栈深度限制（默认 1000） |
| 容易理解复杂问题 | 重复计算（需记忆化优化） |
| 自然表达"自相似"结构 | 调试困难（栈帧多） |

\`\`\`python
# 何时用递归：
# 1. 问题天然是递归的（树、图遍历、分治算法）
# 2. 数据规模小，不会栈溢出
# 3. 代码简洁性远胜迭代

# 何时用迭代：
# 1. 性能关键路径
# 2. 递归深度可能超过 1000
# 3. 简单的循环问题（阶乘、斐波那契）

# 实际示例：文件系统遍历（天然递归）
import os

def list_files(path, indent=0):
    """递归列出目录下所有文件"""
    prefix = "  " * indent
    name = os.path.basename(path)
    print(f"{prefix}{name}")
    if os.path.isdir(path):
        for item in sorted(os.listdir(path)):
            list_files(os.path.join(path, item), indent + 1)

# list_files("/some/directory")  # 实际使用时取消注释
\`\`\`

## 十、综合示例：表达式求值

\`\`\`python
# 用递归解析并计算算术表达式（仅支持 + - * / 和括号）
# 这是一个简化版，演示递归的威力

def evaluate(expr):
    """计算表达式"""
    # 去空格
    expr = expr.replace(" ", "")
    return _eval_add_sub(expr)

def _eval_add_sub(expr):
    """处理加法和减法（最低优先级）"""
    # 从右往左找最后一个 + 或 -
    # 这样左结合的性能更好
    for i in range(len(expr) - 1, -1, -1):
        if expr[i] == '+':
            return _eval_add_sub(expr[:i]) + _eval_mul_div(expr[i+1:])
        if expr[i] == '-' and i > 0:
            return _eval_add_sub(expr[:i]) - _eval_mul_div(expr[i+1:])
    return _eval_mul_div(expr)

def _eval_mul_div(expr):
    """处理乘法和除法"""
    for i in range(len(expr) - 1, -1, -1):
        if expr[i] == '*':
            return _eval_mul_div(expr[:i]) * _eval_atom(expr[i+1:])
        if expr[i] == '/' and i > 0:
            return _eval_mul_div(expr[:i]) / _eval_atom(expr[i+1:])
    return _eval_atom(expr)

def _eval_atom(expr):
    """处理数字和括号"""
    expr = expr.strip()
    if expr.startswith('(') and expr.endswith(')'):
        # 括号表达式：递归处理内部
        return _eval_add_sub(expr[1:-1])
    return int(expr)  # 简化：只支持整数

# 测试
print(evaluate("1 + 2"))  # 3
print(evaluate("2 * 3 + 4"))  # 10
print(evaluate("2 + 3 * 4"))  # 14
print(evaluate("(2 + 3) * 4"))  # 20
print(evaluate("10 - 2 - 3"))  # 5
\`\`\`

## 小结

本章深入讲解了递归与算法：

1. **递归两要素**：基线条件（终止）+ 递归条件（拆解问题）
2. **经典例子**：阶乘、斐波那契、二分查找、汉诺塔、全排列、子集
3. **性能优化**：用 \`lru_cache\` 或手动记忆化避免重复计算，复杂度从 O(2^n) 降到 O(n)
4. **递归深度限制**：Python 默认 1000，可用 \`sys.setrecursionlimit\` 修改但要小心
5. **尾递归不优化**：Python 不像 Scheme 那样优化尾递归，深度问题依然存在
6. **递归转迭代**：用栈模拟，是性能敏感场景的通用解法
7. **何时用递归**：树形问题、分治算法、问题天然递归、数据量小

递归是计算机科学的核心思想之一，掌握它你才能理解树的遍历、图的搜索、分治算法、动态规划等高级主题。下一章我们学习**生成器函数 yield**——Python 独特的"暂停"函数机制。`
  },

  // =========================================================
  // 第二十七章：生成器函数 yield
  // =========================================================
  {
    id: "py10-ch27",
    group: "第六部分 函数进阶",
    icon: "⚡",
    title: "第二十七章 生成器函数 yield",
    content: `## 生成器：能"暂停"的函数

普通函数一旦调用，会一路执行到 \`return\` 或结束，中间无法暂停。**生成器函数**用 \`yield\` 关键字让函数能"暂停"——执行到 \`yield\` 时返回一个值，但函数状态被保留，下次调用时从上次暂停的地方继续。

这种特性让生成器非常适合处理**流式数据、无限序列、大数据集**——按需生成，不占内存。

## 一、yield 基础

\`\`\`python
# 普通函数：一次性返回所有结果
def get_squares_list(n):
    """返回 0 到 n-1 的平方列表"""
    result = []
    for i in range(n):
        result.append(i * i)
    return result  # 一次性返回

# 生成器函数：每次只产出一个值
def get_squares_gen(n):
    """生成 0 到 n-1 的平方"""
    for i in range(n):
        yield i * i  # 暂停并返回值

# 普通函数调用：立即拿到全部结果
squares = get_squares_list(5)
print(squares)  # [0, 1, 4, 9, 16]
print(type(squares))  # <class 'list'>

# 生成器函数调用：返回一个生成器对象，不立即执行
gen = get_squares_gen(5)
print(gen)  # <generator object get_squares_gen at 0x...>
print(type(gen))  # <class 'generator'>

# 用 next() 取下一个值
print(next(gen))  # 0（第一次执行到 yield 0）
print(next(gen))  # 1（从上次暂停处继续，执行到 yield 1）
print(next(gen))  # 4
print(next(gen))  # 9
print(next(gen))  # 16
# print(next(gen))  # ❌ StopIteration（生成器耗尽）
\`\`\`

## 二、生成器函数 vs 普通函数

\`\`\`python
# 关键区别：
# 1. 普通函数遇到 return 返回结果，函数结束
# 2. 生成器函数遇到 yield "产出"值，函数暂停（不结束）
# 3. 下次 next() 时，从上次 yield 的下一行继续执行

def simple_gen():
    """演示 yield 的暂停特性"""
    print("步骤 1：开始")
    yield "A"
    print("步骤 2：继续")
    yield "B"
    print("步骤 3：再继续")
    yield "C"
    print("步骤 4：结束")

gen = simple_gen()
# 注意：调用 simple_gen() 不会执行任何 print！

# 第一次 next()：执行到第一个 yield
print("--- 第一次 next ---")
value = next(gen)
print(f"得到: {value}")
# 输出：
# --- 第一次 next ---
# 步骤 1：开始
# 得到: A

# 第二次 next()：从 yield "A" 后继续
print("--- 第二次 next ---")
value = next(gen)
print(f"得到: {value}")
# 输出：
# --- 第二次 next ---
# 步骤 2：继续
# 得到: B

# 第三次 next()
print("--- 第三次 next ---")
value = next(gen)
print(f"得到: {value}")
# 步骤 3：再继续
# 得到: C

# 第四次 next()：函数执行完毕
print("--- 第四次 next ---")
# value = next(gen)  # ❌ StopIteration
# 输出：步骤 4：结束，然后抛出 StopIteration
\`\`\`

## 三、用 for 循环遍历生成器

\`\`\`python
# 生成器是迭代器，可以用 for 循环遍历
def count_up_to(n):
    """生成 1 到 n"""
    i = 1
    while i <= n:
        yield i
        i += 1

# for 循环会自动处理 StopIteration
for num in count_up_to(5):
    print(num, end=" ")  # 1 2 3 4 5
print()

# 转成列表
print(list(count_up_to(5)))  # [1, 2, 3, 4, 5]

# 转成元组
print(tuple(count_up_to(3)))  # (1, 2, 3)

# 求和
print(sum(count_up_to(100)))  # 5050

# 任何接受可迭代对象的地方都能用生成器
print(max(count_up_to(10)))  # 10
print(min(count_up_to(10)))  # 1
print(sorted(count_up_to(5), reverse=True))  # [5, 4, 3, 2, 1]
\`\`\`

## 四、生成器表达式 vs 生成器函数

\`\`\`python
# 生成器表达式：类似列表推导，但用 () 而非 []
squares_list = [i * i for i in range(10)]  # 列表：立即创建
squares_gen = (i * i for i in range(10))   # 生成器：惰性创建

print(type(squares_list))  # <class 'list'>
print(type(squares_gen))   # <class 'generator'>

# 列表立即占用内存
import sys
print(sys.getsizeof(squares_list))  # 几百字节
print(sys.getsizeof(squares_gen))   # 几十字节（无论生成多少元素都一样大）

# 生成器表达式等价于这个生成器函数：
def squares_gen_func(n):
    for i in range(n):
        yield i * i

# 何时用生成器表达式：简短的、一次性的转换
result = sum(x * x for x in range(100))  # 不创建中间列表
print(result)  # 328350

# 何时用生成器函数：复杂逻辑、需要参数、需要复用
def fibonacci():
    """无限斐波那契序列"""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# 取前 10 个
fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")  # 0 1 1 2 3 5 8 13 21 34
print()
\`\`\`

## 五、无限生成器

\`\`\`python
# 生成器可以无限产出，因为它是惰性的
def natural_numbers():
    """自然数序列：1, 2, 3, ..."""
    n = 1
    while True:
        yield n
        n += 1

# 不能 list(natural_numbers())，会无限循环
# 但可以取前 N 个
nums = natural_numbers()
first_10 = [next(nums) for _ in range(10)]
print(first_10)  # [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 用 itertools.islice 取前 N 个
from itertools import islice
print(list(islice(natural_numbers(), 5)))  # [1, 2, 3, 4, 5]

# 实际应用：日志文件无限读取
def follow_file(file):
    """模拟 tail -f：持续读取新增内容"""
    file.seek(0, 2)  # 跳到文件末尾
    while True:
        line = file.readline()
        if not line:
            continue  # 没有新内容，继续等
        yield line

# 模拟使用（实际中文件会有新内容写入）
# with open("app.log") as f:
#     for line in follow_file(f):
#         print(line, end="")

# 循环序列
def cycle(items):
    """无限循环列表"""
    while True:
        for item in items:
            yield item

# 取前 7 个
c = cycle(["红", "绿", "黄"])
print(list(islice(c, 7)))  # ['红', '绿', '黄', '红', '绿', '黄', '红']
\`\`\`

## 六、\`send()\`：向生成器发送数据

\`\`\`python
# yield 不只是返回值，还能接收外部传入的值
# 用 gen.send(value) 发送数据

def echo():
    """回声生成器：接收什么就返回什么"""
    while True:
        received = yield  # 暂停，接收 send 的值
        print(f"收到: {received}")
        yield received  # 再暂停，返回收到的值

gen = echo()
# 启动生成器（必须先 next 或 send(None)）
next(gen)  # 走到第一个 yield，暂停

# 发送数据
print(gen.send("你好"))  # 输出：收到: 你好，然后返回 "你好"
next(gen)  # 走到下一个 yield，暂停

print(gen.send("世界"))  # 输出：收到: 世界，然后返回 "世界"

# 实际应用：累加器
def accumulator():
    total = 0
    while True:
        value = yield total  # 返回当前 total，接收新值
        total += value

acc = accumulator()
next(acc)  # 启动，返回 0
print(acc.send(10))  # 10（total = 10）
print(acc.send(20))  # 30（total = 30）
print(acc.send(5))   # 35（total = 35）
\`\`\`

## 七、\`throw()\`：向生成器抛异常

\`\`\`python
def safe_generator():
    """带异常处理的生成器"""
    try:
        while True:
            try:
                value = yield
                print(f"处理: {value}")
            except ValueError as e:
                print(f"忽略 ValueError: {e}")
    except GeneratorExit:
        print("生成器被关闭")

gen = safe_generator()
next(gen)  # 启动
gen.send("A")  # 处理: A
gen.send("B")  # 处理: B

# 抛异常给生成器
gen.throw(ValueError, "无效输入")  # 忽略 ValueError: 无效输入
gen.send("C")  # 处理: C（继续工作）
\`\`\`

## 八、\`close()\`：关闭生成器

\`\`\`python
def resource_generator():
    """模拟需要清理资源的生成器"""
    print("打开资源")
    try:
        while True:
            value = yield
            print(f"使用资源处理: {value}")
    finally:
        print("清理资源（关闭文件、释放锁等）")

gen = resource_generator()
next(gen)  # 打开资源
gen.send("数据1")  # 使用资源处理: 数据1
gen.send("数据2")  # 使用资源处理: 数据2

# 主动关闭
gen.close()  # 清理资源（关闭文件、释放锁等）
# close() 会在生成器内部抛出 GeneratorExit
# finally 块会执行，确保资源释放

# 关闭后不能再 next
# next(gen)  # ❌ StopIteration
\`\`\`

## 九、生成器管道（Pipeline）

\`\`\`python
# 生成器可以串联，像 Unix 管道一样
# 每个生成器处理一步，数据流过整个管道

# 数据源：生成数字
def numbers():
    n = 0
    while True:
        yield n
        n += 1

# 过滤器：只保留偶数
def evens(source):
    for n in source:
        if n % 2 == 0:
            yield n

# 转换器：每个乘以 10
def multiply_by_10(source):
    for n in source:
        yield n * 10

# 限制器：只取前 N 个
def take(source, n):
    for i, item in enumerate(source):
        if i >= n:
            return
        yield item

# 串联管道
pipeline = take(multiply_by_10(evens(numbers())), 5)
print(list(pipeline))  # [0, 20, 40, 60, 80]

# 更实际的例子：日志处理管道
log_lines = [
    "2024-01-01 INFO 用户登录 user=alice",
    "2024-01-01 ERROR 数据库连接失败",
    "2024-01-01 INFO 用户登录 user=bob",
    "2024-01-01 WARN 内存使用率 80%",
    "2024-01-01 ERROR 文件未找到",
]

# 步骤 1：读取行
def read_lines(lines):
    for line in lines:
        yield line

# 步骤 2：只保留 ERROR
def filter_errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

# 步骤 3：提取错误信息
def extract_messages(lines):
    for line in lines:
        # 简化：取 ERROR 后面的部分
        idx = line.find("ERROR")
        yield line[idx + 6:].strip()

# 管道处理
pipeline = extract_messages(filter_errors(read_lines(log_lines)))
for msg in pipeline:
    print(msg)
# 输出：
# 数据库连接失败
# 文件未找到
\`\`\`

## 十、\`yield from\`：委托生成器

\`\`\`python
# yield from 把一个可迭代对象的元素逐个 yield 出来
# 等价于 for item in iterable: yield item

def gen1():
    yield 1
    yield 2
    yield 3

def gen2():
    yield "a"
    yield "b"

# 不用 yield from：要手动 for
def combined_old():
    for x in gen1():
        yield x
    for x in gen2():
        yield x

# 用 yield from：更简洁
def combined_new():
    yield from gen1()
    yield from gen2()
    yield from [10, 20, 30]  # 也能用 yield from 处理列表

print(list(combined_old()))  # [1, 2, 3, 'a', 'b']
print(list(combined_new()))  # [1, 2, 3, 'a', 'b', 10, 20, 30]

# 实际应用：递归生成器
def flatten(nested):
    """把任意深度的嵌套列表扁平化"""
    for item in nested:
        if isinstance(item, (list, tuple)):
            # 子列表，递归扁平化
            yield from flatten(item)
        else:
            yield item

nested = [1, [2, 3, [4, 5]], 6, [7, [8, [9, 10]]]]
print(list(flatten(nested)))  # [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# yield from 还能传递 send 和 throw
# 这让它适合做协程委托（高级用法）
\`\`\`

## 十一、生成器的内存优势

\`\`\`python
# 处理大文件：用生成器逐行读取，不一次性加载

def read_large_file(path):
    """逐行读取大文件"""
    with open(path, "r") as f:
        for line in f:
            yield line.strip()

# 即使文件 10GB，内存占用也很小
# 因为每次只在内存里保留一行
# for line in read_large_file("huge.log"):
#     process(line)

# 对比：readlines() 会把整个文件加载到内存
# with open("huge.log") as f:
#     lines = f.readlines()  # 10GB 文件会撑爆内存

# 统计大文件的行数（内存友好）
def count_lines(path):
    count = 0
    for _ in read_large_file(path):
        count += 1
    return count

# 处理大数据集
def process_data_stream(data_source):
    """流式处理数据"""
    for record in data_source:
        # 每次只处理一条记录
        processed = transform(record)
        if validate(processed):
            yield processed

def transform(record):
    return record.upper()

def validate(record):
    return len(record) > 0

# 内存占用恒定，无论数据多大
\`\`\`

## 十二、生成器 vs 迭代器

\`\`\`python
# 生成器是一种迭代器，但迭代器不一定是生成器

# 手动实现迭代器（更繁琐）
class CountUpTo:
    """手动实现的迭代器"""
    def __init__(self, n):
        self.n = n
        self.current = 0
    
    def __iter__(self):
        return self  # 迭代器对象本身就是迭代器
    
    def __next__(self):
        if self.current >= self.n:
            raise StopIteration
        self.current += 1
        return self.current

# 用生成器实现同样的功能（更简洁）
def count_up_to_gen(n):
    current = 0
    while current < n:
        current += 1
        yield current

# 两者用法一样
for x in CountUpTo(5):
    print(x, end=" ")  # 1 2 3 4 5
print()

for x in count_up_to_gen(5):
    print(x, end=" ")  # 1 2 3 4 5
print()

# 99% 的情况用生成器更简单
# 只在需要复杂状态管理时才用类实现的迭代器
\`\`\`

## 十三、生成器的实际应用

### 应用一：分页数据加载

\`\`\`python
def paginated_data(total, page_size):
    """模拟分页加载数据"""
    for start in range(0, total, page_size):
        end = min(start + page_size, total)
        # 模拟从数据库读取一页数据
        page = list(range(start, end))
        yield page

# 每次只加载一页，不一次性加载所有数据
for page in paginated_data(100, 10):
    print(f"加载了一页: {page}")
    # 实际场景：处理完一页再加载下一页
# 加载了一页: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# 加载了一页: [10, 11, ..., 19]
# ...
\`\`\`

### 应用二：惰性求值的无限序列

\`\`\`python
# 素数生成器：无限产出素数
def primes():
    """无限素数序列"""
    primes_list = []
    n = 2
    while True:
        # 检查 n 是否能被已知素数整除
        is_prime = True
        for p in primes_list:
            if p * p > n:  # 优化：只需检查到 sqrt(n)
                break
            if n % p == 0:
                is_prime = False
                break
        if is_prime:
            primes_list.append(n)
            yield n
        n += 1

# 取前 20 个素数
from itertools import islice
print(list(islice(primes(), 20)))
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
\`\`\`

### 应用三：协程基础

\`\`\`python
# 生成器是 Python 协程的基础（async/await 之前）
def simple_coroutine():
    """简易协程"""
    print("协程启动")
    while True:
        value = yield
        print(f"协程收到: {value}")

# 启动协程
co = simple_coroutine()
next(co)  # 启动，输出"协程启动"

# 发送数据
co.send("hello")  # 协程收到: hello
co.send("world")  # 协程收到: world

# 现代 Python 用 async/await，但底层原理类似
\`\`\`

## 十四、生成器性能对比

\`\`\`python
import sys
import time

# 1. 内存对比
big_list = [i * i for i in range(1000000)]
big_gen = (i * i for i in range(1000000))

print(f"列表占用: {sys.getsizeof(big_list)} 字节")  # ~8MB
print(f"生成器占用: {sys.getsizeof(big_gen)} 字节")   # ~200 字节

# 2. 速度对比：列表更快（一次性算完）
start = time.time()
total = sum([i * i for i in range(1000000)])
print(f"列表求和: {time.time() - start:.4f}s")

start = time.time()
total = sum(i * i for i in range(1000000))
print(f"生成器求和: {time.time() - start:.4f}s")
# 生成器略慢，但内存占用极小

# 3. 提前终止：生成器优势
# 找第一个大于 1000 的平方数
def find_first_gt(threshold):
    """用生成器找第一个大于阈值的平方数"""
    for i in range(1000000):
        sq = i * i
        if sq > threshold:
            return sq
    return None

# 列表版本会先创建 100 万个元素，再找
# 生成器版本只算到第一个符合条件的就停
\`\`\`

## 十五、生成器常见陷阱

\`\`\`python
# 陷阱一：生成器只能遍历一次
gen = (x * x for x in range(5))
print(list(gen))  # [0, 1, 4, 9, 16]
print(list(gen))  # [] ← 已经耗尽！

# 解决：每次重新创建，或转成列表
numbers = list(range(5))
gen_factory = lambda: (x * x for x in numbers)
print(list(gen_factory()))  # [0, 1, 4, 9, 16]
print(list(gen_factory()))  # [0, 1, 4, 9, 16]

# 陷阱二：生成器中修改外部变量要小心
counter = 0
def increment_counter():
    global counter
    while True:
        counter += 1
        yield counter

gen = increment_counter()
print(next(gen))  # 1
print(next(gen))  # 2
print(counter)    # 2（被修改了！）

# 陷阱三：生成器嵌套时的资源释放
def process_files(filenames):
    for filename in filenames:
        f = open(filename)
        try:
            for line in f:
                yield line
        finally:
            f.close()  # 确保文件关闭

# 如果不遍历完生成器，finally 可能不执行
# 用 contextlib.closing 或 with 语句更安全
\`\`\`

## 小结

本章深入讲解了 Python 的生成器函数：

1. **\`yield\`** 让函数能"暂停"，下次从暂停处继续
2. **生成器 vs 列表**：生成器惰性求值，省内存；列表立即求值，速度快
3. **\`next()\`** 取下一个值，\`StopIteration\` 表示耗尽
4. **\`send()\`** 向生成器发送数据，\`throw()\` 抛异常，\`close()\` 关闭
5. **\`yield from\`** 委托另一个生成器，简化嵌套
6. **生成器管道**：串联多个生成器，像 Unix 管道一样处理数据流
7. **无限生成器**：天然适合表示无限序列（素数、自然数）
8. **实际应用**：大文件处理、分页加载、协程基础

生成器是 Python 最优雅的特性之一，掌握它你就能写出既省内存又高效的代码。下一章我们学习**装饰器**——Python 最强大的函数增强机制。`
  },

  // =========================================================
  // 第二十八章：装饰器入门
  // =========================================================
  {
    id: "py10-ch28",
    group: "第六部分 函数进阶",
    icon: "🎁",
    title: "第二十八章 装饰器入门",
    content: `## 装饰器：在不修改函数的前提下增强它

**装饰器**是 Python 最优雅的特性之一：在不改变原函数代码的前提下，给函数增加新功能。它是 AOP（面向切面编程）的体现，常用于日志、计时、缓存、权限校验等"横切关注点"。

### 装饰器的本质

\`\`\`python
# 装饰器本质是一个函数，接收一个函数，返回一个新函数
# 简单说：装饰器 = 函数变换器

# 不用装饰器：手动包装
def say_hello():
    return "Hello!"

# 我们想给 say_hello 加上日志，但不能改原函数
def log_decorator(func):
    """装饰器：在调用前后打印日志"""
    def wrapper():
        print(f"[LOG] 调用 {func.__name__}")
        result = func()
        print(f"[LOG] {func.__name__} 返回 {result}")
        return result
    return wrapper  # 返回新函数

# 手动应用装饰器
say_hello = log_decorator(say_hello)
print(say_hello())
# 输出：
# [LOG] 调用 say_hello
# [LOG] say_hello 返回 Hello!
# Hello!

# 用 @ 语法糖：等价于上面的手动包装
@log_decorator
def say_hi():
    return "Hi!"

print(say_hi())
# [LOG] 调用 say_hi
# [LOG] say_hi 返回 Hi!
# Hi!
\`\`\`

## 一、装饰器的基本语法

\`\`\`python
# @decorator 写在函数定义上方
# 等价于 func = decorator(func)

def my_decorator(func):
    def wrapper():
        print("装饰器：函数执行前")
        result = func()
        print("装饰器：函数执行后")
        return result
    return wrapper

@my_decorator
def greet():
    print("Hello!")

greet()
# 装饰器：函数执行前
# Hello!
# 装饰器：函数执行后

# 等价于：
# def greet():
#     print("Hello!")
# greet = my_decorator(greet)
\`\`\`

## 二、处理参数和返回值

\`\`\`python
# 装饰器要能处理任意参数，用 *args, **kwargs
def log_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}, args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回 {result}")
        return result
    return wrapper

@log_decorator
def add(a, b):
    return a + b

@log_decorator
def greet(name, greeting="你好"):
    return f"{greeting}, {name}!"

print(add(2, 3))
# 调用 add, args=(2, 3), kwargs={}
# add 返回 5
# 5

print(greet("张三"))
# 调用 greet, args=('张三',), kwargs={}
# greet 返回 你好, 张三!
# 你好, 张三!

print(greet("李四", greeting="嗨"))
# 调用 greet, args=('李四',), kwargs={'greeting': '嗨'}
# greet 返回 嗨, 李四!
# 嗨, 李四!
\`\`\`

## 三、用 \`functools.wraps\` 保留元信息

\`\`\`python
# 不用 wraps：被装饰函数的元信息丢失
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def greet(name):
    """问候函数"""
    return f"Hello, {name}"

print(greet.__name__)  # wrapper ← 不是 greet！
print(greet.__doc__)   # None ← 文档丢了！

# 用 functools.wraps：保留原函数的元信息
from functools import wraps

def good_decorator(func):
    @wraps(func)  # 这个装饰器会把 func 的元信息复制到 wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def greet(name):
    """问候函数"""
    return f"Hello, {name}"

print(greet.__name__)  # greet ← 正确
print(greet.__doc__)   # 问候函数 ← 正确
print(greet.__wrapped__)  # 还能访问原函数

# 规则：写装饰器一定加 @wraps！
\`\`\`

## 四、常见装饰器：计时器

\`\`\`python
import time
from functools import wraps

def timer(func):
    """测量函数执行时间"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} 执行耗时: {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    """模拟耗时操作"""
    time.sleep(1)
    return "done"

print(slow_function())
# slow_function 执行耗时: 1.0012s
# done

@timer
def compute_sum(n):
    return sum(range(n))

print(compute_sum(1000000))
# compute_sum 执行耗时: 0.0523s
# 499999500000
\`\`\`

## 五、常见装饰器：日志器

\`\`\`python
from functools import wraps

def logger(func):
    """记录函数调用日志"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 准备参数字符串
        args_str = ", ".join(
            [repr(a) for a in args] +
            [f"{k}={v!r}" for k, v in kwargs.items()]
        )
        print(f"[LOG] 调用 {func.__name__}({args_str})")
        try:
            result = func(*args, **kwargs)
            print(f"[LOG] {func.__name__} 返回 {result!r}")
            return result
        except Exception as e:
            print(f"[LOG] {func.__name__} 抛出 {type(e).__name__}: {e}")
            raise  # 重新抛出
    return wrapper

@logger
def divide(a, b):
    return a / b

print(divide(10, 2))
# [LOG] 调用 divide(10, 2)
# [LOG] divide 返回 5.0
# 5.0

try:
    divide(10, 0)
except ZeroDivisionError:
    pass
# [LOG] 调用 divide(10, 0)
# [LOG] divide 抛出 ZeroDivisionError: division by zero
\`\`\`

## 六、带参数的装饰器

\`\`\`python
# 普通装饰器：@decorator
# 带参数的装饰器：@decorator(arg)
# 实际是三层嵌套：decorator(arg) 返回真正的装饰器

def repeat(times):
    """让函数重复执行 times 次"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result  # 返回最后一次的结果
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("张三")
# Hello, 张三!
# Hello, 张三!
# Hello, 张三!

# 等价于：
# greet = repeat(3)(greet)

# 带参数的日志装饰器
def log(level="INFO"):
    """可配置日志级别"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{level}] 调用 {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@log(level="DEBUG")
def debug_func():
    print("调试中")

@log(level="ERROR")
def error_func():
    print("出错了")

debug_func()  # [DEBUG] 调用 debug_func
error_func()  # [ERROR] 调用 error_func
\`\`\`

## 七、装饰器堆叠

\`\`\`python
# 多个装饰器可以堆叠，从下往上应用，从上往下执行
@decorator_a
@decorator_b
@decorator_c
def func():
    pass

# 等价于：func = decorator_a(decorator_b(decorator_c(func)))
# 应用顺序：c → b → a（从下往上）
# 执行顺序：a → b → c → 函数 → c → b → a（洋葱模型）

# 实际例子
def decorator_a(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("A 前")
        result = func(*args, **kwargs)
        print("A 后")
        return result
    return wrapper

def decorator_b(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("B 前")
        result = func(*args, **kwargs)
        print("B 后")
        return result
    return wrapper

@decorator_a
@decorator_b
def hello():
    print("Hello!")

hello()
# A 前
# B 前
# Hello!
# B 后
# A 后
\`\`\`

## 八、缓存装饰器

\`\`\`python
from functools import wraps

def memoize(func):
    """手动实现缓存装饰器"""
    cache = {}
    
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    
    # 暴露缓存以便查看
    wrapper.cache = cache
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # 瞬间算出
print(fibonacci.cache)  # 查看缓存

# 实际开发：直接用 functools.lru_cache
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci_official(n):
    if n < 2:
        return n
    return fibonacci_official(n - 1) + fibonacci_official(n - 2)

print(fibonacci_official(100))
print(fibonacci_official.cache_info())  # 查看缓存命中情况
\`\`\`

## 九、权限校验装饰器

\`\`\`python
from functools import wraps

# 模拟当前用户
current_user = {"name": "alice", "role": "admin"}

def require_role(role):
    """要求用户具有特定角色"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if current_user.get("role") != role:
                raise PermissionError(
                    f"需要 {role} 权限，当前用户是 {current_user.get('role')}"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_role("admin")
def delete_user(user_id):
    print(f"删除用户 {user_id}")

@require_role("admin")
def reset_system():
    print("重置系统")

# 当前用户是 admin，可以执行
delete_user(123)  # 删除用户 123

# 切换为普通用户
current_user["role"] = "user"
try:
    delete_user(456)
except PermissionError as e:
    print(f"权限不足: {e}")
# 权限不足: 需要 admin 权限，当前用户是 user
\`\`\`

## 十、类装饰器

\`\`\`python
# 装饰器可以是类，用 __call__ 方法实现
class CountCalls:
    """统计函数被调用次数"""
    def __init__(self, func):
        self.func = func
        self.count = 0
        wraps(func)(self)  # 保留元信息
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} 已被调用 {self.count} 次")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")

say_hello()  # 已被调用 1 次 / Hello!
say_hello()  # 已被调用 2 次 / Hello!
say_hello()  # 已被调用 3 次 / Hello!
print(say_hello.count)  # 3

# 类装饰器适合需要维护状态的场景
class Retry:
    """失败时自动重试"""
    def __init__(self, max_retries=3):
        self.max_retries = max_retries
    
    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(self.max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"第 {attempt + 1} 次失败: {e}")
            raise last_exception
        return wrapper

@Retry(max_retries=3)
def unreliable_function():
    import random
    if random.random() < 0.7:
        raise ValueError("随机失败")
    return "成功"

try:
    print(unreliable_function())
except ValueError:
    print("多次重试后仍然失败")
\`\`\`

## 十一、装饰器实战：API 路由

\`\`\`python
# 模拟 Flask 风格的路由装饰器
class Flask:
    def __init__(self):
        self.routes = {}
    
    def route(self, path):
        """路由装饰器"""
        def decorator(func):
            self.routes[path] = func
            return func
        return decorator
    
    def run(self, path):
        """模拟请求"""
        if path in self.routes:
            return self.routes[path]()
        return "404 Not Found"

app = Flask()

@app.route("/")
def home():
    return "首页"

@app.route("/about")
def about():
    return "关于我们"

@app.route("/contact")
def contact():
    return "联系我们"

print(app.run("/"))        # 首页
print(app.run("/about"))   # 关于我们
print(app.run("/unknown")) # 404 Not Found
\`\`\`

## 十二、装饰器的常见用途

| 用途 | 装饰器 | 说明 |
| --- | --- | --- |
| 计时 | \`@timer\` | 测量函数执行时间 |
| 日志 | \`@logger\` | 记录函数调用 |
| 缓存 | \`@lru_cache\` | 自动缓存结果 |
| 权限 | \`@require_role\` | 校验用户权限 |
| 重试 | \`@retry\` | 失败自动重试 |
| 限流 | \`@rate_limit\` | 限制调用频率 |
| 重试 | \`@Retry\` | 类装饰器版本 |
| 路由 | \`@app.route\` | Web 框架路由 |
| 静态方法 | \`@staticmethod\` | 类的静态方法 |
| 类方法 | \`@classmethod\` | 类的类方法 |
| 属性 | \`@property\` | 把方法变属性 |
| 异步 | \`@asyncio.coroutine\` | 协程装饰器（旧版） |

\`\`\`python
# 限流装饰器示例
import time
from functools import wraps

def rate_limit(calls_per_second):
    """限制每秒调用次数"""
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]  # 用列表包装，让闭包能修改
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            elapsed = now - last_called[0]
            if elapsed < min_interval:
                sleep_time = min_interval - elapsed
                time.sleep(sleep_time)
            last_called[0] = time.time()
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(2)  # 每秒最多 2 次
def api_call():
    print(f"API 调用 at {time.time():.2f}")

# 快速调用 5 次，会被限流
for _ in range(5):
    api_call()
\`\`\`

## 十三、装饰器的注意事项

\`\`\`python
# 1. 装饰器会改变函数的"身份"
@timer
def my_func():
    pass

print(type(my_func))  # <class 'function'>，但其实是 wrapper
print(my_func.__name__)  # my_func（因为用了 @wraps）

# 2. 调试困难：堆栈里看到的是 wrapper
# 解决：用 @wraps，或用 functools.update_wrapper

# 3. 装饰器有顺序：从下往上应用
@decorator_a
@decorator_b
def func():
    pass
# 等价于 func = decorator_a(decorator_b(func))

# 4. 类的方法也能装饰
class MyClass:
    @timer
    def slow_method(self):
        time.sleep(0.5)

obj = MyClass()
obj.slow_method()  # slow_method 执行耗时: 0.5xxx s

# 5. 装饰器可以装饰类本身
def singleton(cls):
    """单例装饰器"""
    instances = {}
    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self):
        print("初始化数据库连接")
        self.connected = True

db1 = Database()  # 初始化数据库连接
db2 = Database()  # 不打印（已存在实例）
print(db1 is db2)  # True（同一个实例）
\`\`\`

## 十四、综合示例：性能监控装饰器

\`\`\`python
import time
from functools import wraps

# 全局性能数据
performance_data = {}

def monitor(func):
    """监控函数调用次数和总耗时"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            if func.__name__ not in performance_data:
                performance_data[func.__name__] = {
                    "calls": 0,
                    "total_time": 0.0,
                    "avg_time": 0.0,
                }
            stats = performance_data[func.__name__]
            stats["calls"] += 1
            stats["total_time"] += elapsed
            stats["avg_time"] = stats["total_time"] / stats["calls"]
    return wrapper

@monitor
def quick_func():
    return sum(range(1000))

@monitor
def slow_func():
    time.sleep(0.1)
    return "slow"

# 调用多次
for _ in range(10):
    quick_func()
for _ in range(3):
    slow_func()

# 查看性能数据
print("性能报告:")
for name, stats in performance_data.items():
    print(f"  {name}: 调用 {stats['calls']} 次, "
          f"总耗时 {stats['total_time']:.4f}s, "
          f"平均 {stats['avg_time']:.4f}s")
\`\`\`

## 小结

本章介绍了 Python 装饰器的核心知识：

1. **装饰器本质**：接收函数、返回函数的函数，用 \`@\` 语法糖应用
2. **\`*args, **kwargs\`** 让装饰器能处理任意参数
3. **\`@wraps\`** 保留被装饰函数的元信息（必加！）
4. **常见装饰器**：计时、日志、缓存、权限、重试、限流、路由
5. **带参数的装饰器**：三层嵌套 \`def decorator(arg): def real_decorator(func): ...\`
6. **装饰器堆叠**：从下往上应用，从上往下执行（洋葱模型）
7. **类装饰器**：用 \`__call__\` 实现，适合维护状态
8. **类也能被装饰**：实现单例、注册等模式

装饰器是 Python 高级编程的标志性特性，几乎所有 Web 框架（Flask、Django、FastAPI）都大量使用。掌握它，你就能写出优雅、可复用、可维护的代码。下一章我们学习**类型注解与 typing**——让 Python 也有类型安全。`
  },

  // =========================================================
  // 第二十九章：类型注解与 typing
  // =========================================================
  {
    id: "py10-ch29",
    group: "第六部分 函数进阶",
    icon: "🏷️",
    title: "第二十九章 类型注解与 typing",
    content: `## 类型注解：让 Python 也有"类型安全"

Python 是动态类型语言，变量类型在运行时确定。这灵活但容易出 bug：拼错变量名、传错参数类型，都要运行时才发现。**类型注解**（Type Hints）让你能给变量、参数、返回值标注类型，配合静态检查工具（mypy、pyright），能在不运行代码的情况下发现类型错误。

### 类型注解不影响运行

\`\`\`python
# 类型注解只是"提示"，运行时 Python 不强制检查
def add(a: int, b: int) -> int:
    """a 和 b 标注为 int，返回值标注为 int"""
    return a + b

print(add(2, 3))  # 5

# 即使传错类型，运行时也不会报错（注解只是提示）
print(add("hello", " world"))  # "hello world"
# 但 mypy 等工具会警告：传了 str 而不是 int

# 注解存储在 __annotations__ 里
print(add.__annotations__)  # {'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}
\`\`\`

## 一、基本类型注解

\`\`\`python
# 变量注解
name: str = "张三"
age: int = 25
height: float = 1.75
is_student: bool = True

# 函数参数和返回值注解
def greet(name: str, times: int = 1) -> str:
    """返回问候字符串"""
    return f"Hello, {name}! " * times

print(greet("张三", 2))  # Hello, 张三! Hello, 张三!

# 没有返回值的函数标注 None
def print_greeting(name: str) -> None:
    print(f"Hello, {name}!")

# 多种返回类型用 Union
from typing import Union

def parse_int(s: str) -> Union[int, None]:
    """解析字符串为 int，失败返回 None"""
    try:
        return int(s)
    except ValueError:
        return None

print(parse_int("123"))  # 123
print(parse_int("abc"))  # None
\`\`\`

## 二、容器类型注解

\`\`\`python
# Python 3.9+ 可以直接用内置类型
# 列表
numbers: list[int] = [1, 2, 3]
names: list[str] = ["张三", "李四"]

# 字典
user: dict[str, int] = {"张三": 25, "李四": 30}
config: dict[str, str] = {"host": "localhost", "port": "8080"}

# 元组（固定长度和类型）
point: tuple[int, int] = (3, 4)
# 变长元组（同类型）
points: tuple[int, ...] = (1, 2, 3, 4, 5)

# 集合
unique_nums: set[int] = {1, 2, 3}

# Python 3.8 及更早：用 typing 模块
from typing import List, Dict, Tuple, Set
numbers: List[int] = [1, 2, 3]  # 旧写法
user: Dict[str, int] = {"张三": 25}  # 旧写法

# 嵌套类型
matrix: list[list[int]] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

users: list[dict[str, str]] = [
    {"name": "张三", "email": "zs@example.com"},
    {"name": "李四", "email": "ls@example.com"},
]
\`\`\`

## 三、\`typing\` 模块常用类型

\`\`\`python
from typing import (
    Union, Optional, Any, Callable, 
    Iterable, Iterator, Sequence,
    List, Dict, Tuple, Set,
    TypeVar, Generic, Protocol,
)

# 1. Union：联合类型（多个类型之一）
def square_root(x: Union[int, float]) -> float:
    return x ** 0.5

# Python 3.10+ 可以用 | 简写
def square_root_new(x: int | float) -> float:
    return x ** 0.5

# 2. Optional：可选类型（等价于 Union[T, None]）
def find_user(user_id: int) -> Optional[dict]:
    """可能返回 dict，也可能返回 None"""
    if user_id == 1:
        return {"name": "张三"}
    return None

# 等价于
def find_user_v2(user_id: int) -> dict | None:
    pass

# 3. Any：任意类型（尽量少用，等于没注解）
def process(data: Any) -> Any:
    return data

# 4. Callable：可调用对象（函数、方法等）
def apply_func(func: Callable[[int, int], int], a: int, b: int) -> int:
    """func 接收两个 int，返回 int"""
    return func(a, b)

print(apply_func(lambda x, y: x + y, 3, 4))  # 7
print(apply_func(max, 3, 4))  # 4

# 不带参数的 Callable
def run_callback(callback: Callable[[], None]) -> None:
    callback()

# 5. Iterable / Iterator
def sum_all(nums: Iterable[int]) -> int:
    """接受任何可迭代的 int"""
    return sum(nums)

print(sum_all([1, 2, 3]))  # 6
print(sum_all((1, 2, 3)))  # 6
print(sum_all(range(10)))  # 45
print(sum_all(x * 2 for x in range(5)))  # 20

# 6. Sequence：序列（list, tuple, str 等）
def first_element(seq: Sequence) -> Any:
    """取序列的第一个元素"""
    return seq[0]

print(first_element([1, 2, 3]))  # 1
print(first_element("hello"))     # h
\`\`\`

## 四、函数注解详解

\`\`\`python
# 完整的函数注解
def create_user(
    name: str,
    age: int,
    email: str,
    roles: list[str] = None,
    active: bool = True,
) -> dict[str, object]:
    """创建用户"""
    if roles is None:
        roles = ["user"]
    return {
        "name": name,
        "age": age,
        "email": email,
        "roles": roles,
        "active": active,
    }

# *args 和 **kwargs 的注解
def log_call(*args: int, **kwargs: str) -> None:
    """args 都是 int，kwargs 的值都是 str"""
    print(f"args: {args}")
    print(f"kwargs: {kwargs}")

log_call(1, 2, 3, name="张三", city="北京")
# args: (1, 2, 3)
# kwargs: {'name': '张三', 'city': '北京'}

# 回调函数类型
from typing import Callable

def process_data(
    data: list[int],
    transform: Callable[[int], int],
    filter_func: Callable[[int], bool] = None,
) -> list[int]:
    """处理数据"""
    result = []
    for item in data:
        if filter_func is None or filter_func(item):
            result.append(transform(item))
    return result

print(process_data([1, 2, 3, 4, 5], lambda x: x * 2, lambda x: x > 2))
# [6, 8, 10]
\`\`\`

## 五、变量注解

\`\`\`python
# 简单变量注解
count: int = 0
name: str = "张三"
pi: float = 3.14159

# 不赋值，只注解（在类或模块顶部常用）
x: int  # 只是声明，没赋值
# print(x)  # ❌ NameError（运行时还没赋值）

# 容器变量注解
users: list[dict[str, int]] = []
config: dict[str, str | int] = {}

# 全局变量注解（模块级）
DEBUG: bool = True
MAX_RETRIES: int = 3
DEFAULT_TIMEOUT: float = 30.0

# 类变量和实例变量
class User:
    # 类变量注解
    total_count: int = 0
    
    def __init__(self, name: str, age: int):
        # 实例变量注解（在 __init__ 里）
        self.name: str = name
        self.age: int = age
        User.total_count += 1

user = User("张三", 25)
print(User.__annotations__)  # {'total_count': <class 'int'>}
\`\`\`

## 六、\`TypeVar\`：泛型类型变量

\`\`\`python
from typing import TypeVar, List

# TypeVar 表示"某种类型"，但保持类型一致性
T = TypeVar('T')

def first(items: List[T]) -> T:
    """取列表第一个元素，类型保持一致"""
    return items[0]

# 调用时 T 会被推断
print(first([1, 2, 3]))  # T = int，返回 int
print(first(["a", "b"]))  # T = str，返回 str
print(first([1.0, 2.0]))  # T = float，返回 float

# 限制 TypeVar 的范围
from typing import TypeVar

# T 必须是 int 或 str
NumberOrString = TypeVar('NumberOrString', int, str)

def add(a: NumberOrString, b: NumberOrString) -> NumberOrString:
    return a + b

print(add(1, 2))  # 3
print(add("a", "b"))  # ab
# print(add(1, "a"))  # mypy 会警告：类型不一致

# bound：T 必须是某个类的子类
class Animal:
    def speak(self) -> str:
        return "..."

class Dog(Animal):
    def speak(self) -> str:
        return "汪汪"

class Cat(Animal):
    def speak(self) -> str:
        return "喵喵"

TAnimal = TypeVar('TAnimal', bound=Animal)

def make_speak(animal: TAnimal) -> TAnimal:
    print(animal.speak())
    return animal

make_speak(Dog())  # 汪汪
make_speak(Cat())  # 喵喵
\`\`\`

## 七、\`Generic\`：泛型类

\`\`\`python
from typing import TypeVar, Generic, List

T = TypeVar('T')

class Stack(Generic[T]):
    """泛型栈：可以存任意类型"""
    def __init__(self):
        self.items: List[T] = []
    
    def push(self, item: T) -> None:
        self.items.append(item)
    
    def pop(self) -> T:
        if not self.items:
            raise IndexError("栈为空")
        return self.items.pop()
    
    def peek(self) -> T:
        return self.items[-1]
    
    def is_empty(self) -> bool:
        return len(self.items) == 0

# 使用：指定具体类型
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
int_stack.push(3)
print(int_stack.pop())  # 3

str_stack: Stack[str] = Stack()
str_stack.push("hello")
str_stack.push("world")
print(str_stack.pop())  # world

# 多类型参数
K = TypeVar('K')
V = TypeVar('V')

class Pair(Generic[K, V]):
    """键值对"""
    def __init__(self, key: K, value: V):
        self.key = key
        self.value = value
    
    def __repr__(self) -> str:
        return f"Pair({self.key!r}, {self.value!r})"

p1: Pair[str, int] = Pair("age", 25)
p2: Pair[int, str] = Pair(1, "first")
print(p1)  # Pair('age', 25)
print(p2)  # Pair(1, 'first')
\`\`\`

## 八、\`Protocol\`：结构化类型

\`\`\`python
from typing import Protocol, runtime_checkable

# Protocol 定义"接口"：有这些方法就算实现了
@runtime_checkable  # 让 isinstance 能检查
class Drawable(Protocol):
    def draw(self) -> None:
        ...

class Circle:
    def draw(self) -> None:
        print("画圆")

class Square:
    def draw(self) -> None:
        print("画方")

class Text:
    def render(self) -> None:
        print("渲染文本")  # 注意：没有 draw 方法

# Circle 和 Square 隐式实现了 Drawable（有 draw 方法）
def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())  # 画圆
render(Square())  # 画方
# render(Text())  # mypy 会警告：Text 没有实现 Drawable

# runtime_checkable 让 isinstance 能用
print(isinstance(Circle(), Drawable))  # True
print(isinstance(Text(), Drawable))    # False

# 这叫"鸭子类型"的形式化：不关心继承关系，只关心有没有方法
\`\`\`

## 九、\`Literal\`：字面量类型

\`\`\`python
from typing import Literal, overload

# Literal 限制为特定值
def set_mode(mode: Literal["read", "write", "append"]) -> None:
    print(f"模式: {mode}")

set_mode("read")   # ✅
set_mode("write")  # ✅
# set_mode("delete")  # ❌ mypy 警告：不在 Literal 范围内

# 实际应用：配置参数
def create_connection(
    protocol: Literal["http", "https", "ftp"],
    port: Literal[80, 443, 21, 22],
) -> str:
    return f"{protocol}://example.com:{port}"

print(create_connection("https", 443))  # https://example.com:443

# 状态机
def process_state(state: Literal["idle", "running", "stopped"]):
    if state == "idle":
        print("空闲")
    elif state == "running":
        print("运行中")
    elif state == "stopped":
        print("已停止")

process_state("running")
\`\`\`

## 十、\`overload\`：函数重载

\`\`\`python
from typing import overload

# Python 不支持真正的函数重载
# 但用 @overload 可以给静态检查器提供精确的类型信息

@overload
def parse(value: int) -> int: ...
@overload
def parse(value: str) -> str: ...
@overload
def parse(value: list) -> list: ...

def parse(value):
    """实际实现"""
    return value

# 静态检查器会根据参数类型推断返回类型
result1: int = parse(42)      # 推断为 int
result2: str = parse("hello") # 推断为 str
result3: list = parse([1, 2]) # 推断为 list

# 更实际的例子
@overload
def get_user(user_id: int) -> dict: ...
@overload
def get_user(name: str) -> list[dict]: ...

def get_user(identifier):
    """根据 ID 返回单个用户，根据姓名返回用户列表"""
    if isinstance(identifier, int):
        return {"id": identifier, "name": "张三"}
    else:
        return [{"id": 1, "name": identifier}]
\`\`\`

## 十一、运行时类型检查

\`\`\`python
# 类型注解默认不在运行时检查
# 但可以用 typing.get_type_hints 和 isinstance 配合

from typing import get_type_hints

def validate_types(func):
    """装饰器：运行时检查参数类型"""
    import functools
    hints = get_type_hints(func)
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # 检查位置参数
        params = list(hints.keys())
        for i, arg in enumerate(args):
            if i < len(params) - 1:  # 跳过 return
                param_name = params[i]
                expected = hints[param_name]
                if not isinstance(arg, expected):
                    raise TypeError(
                        f"参数 {param_name} 期望 {expected}, 实际 {type(arg)}"
                    )
        return func(*args, **kwargs)
    return wrapper

@validate_types
def add(a: int, b: int) -> int:
    return a + b

print(add(2, 3))  # 5
# add("2", 3)  # ❌ TypeError: 参数 a 期望 <class 'int'>, 实际 <class 'str'>

# 用 pydantic 库做更强大的运行时校验（第三方）
# from pydantic import BaseModel
# class User(BaseModel):
#     name: str
#     age: int
# user = User(name="张三", age=25)
\`\`\`

## 十二、综合示例：类型安全的用户管理

\`\`\`python
from typing import Optional, List, Dict, Protocol
from dataclasses import dataclass

# 用 Protocol 定义接口
class UserRepository(Protocol):
    def find_by_id(self, user_id: int) -> Optional['User']:
        ...
    def save(self, user: 'User') -> None:
        ...

# 用户数据类
@dataclass
class User:
    id: int
    name: str
    email: str
    age: int

# 内存实现
class InMemoryUserRepository:
    def __init__(self):
        self.users: Dict[int, User] = {}
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        return self.users.get(user_id)
    
    def save(self, user: User) -> None:
        self.users[user.id] = user

# 业务逻辑层
class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    def get_user(self, user_id: int) -> User:
        user = self.repo.find_by_id(user_id)
        if user is None:
            raise ValueError(f"用户 {user_id} 不存在")
        return user
    
    def create_user(self, name: str, email: str, age: int) -> User:
        user_id = len(self.repo.users) + 1
        user = User(id=user_id, name=name, email=email, age=age)
        self.repo.save(user)
        return user

# 使用
repo = InMemoryUserRepository()
service = UserService(repo)

user1 = service.create_user("张三", "zs@example.com", 25)
user2 = service.create_user("李四", "ls@example.com", 30)

print(service.get_user(1))  # User(id=1, name='张三', ...)
print(service.get_user(2))  # User(id=2, name='李四', ...)

# 类型注解让 IDE 能自动补全
# service.get_user(1).name  ← IDE 知道是 str
# service.get_user(1).age   ← IDE 知道是 int
\`\`\`

## 十三、类型注解的工具链

\`\`\`python
# 1. mypy：最流行的静态类型检查器
# 安装：pip install mypy
# 使用：mypy your_script.py

# 2. pyright：微软出品，更快更严格
# VS Code 的 Pylance 扩展基于 pyright

# 3. pydantic：运行时数据校验
# from pydantic import BaseModel
# class User(BaseModel):
#     name: str
#     age: int
# user = User(name="张三", age=25)  # 自动校验

# 类型注解的好处：
# 1. IDE 自动补全、跳转、重构更准确
# 2. 静态检查发现潜在 bug
# 3. 文档化代码意图
# 4. 团队协作更顺畅

# 类型注解的代价：
# 1. 代码更长
# 2. 写注解本身需要时间
# 3. 复杂类型可能难以表达

# 推荐：项目越大、团队越大，越应该用类型注解
# 小脚本、原型可以省略

# 渐进式类型：可以选择性注解
def partially_typed(data, count: int = 10):
    # data 没注解，count 有注解
    return data[:count]
\`\`\`

## 十四、类型注解对比表

| 注解 | 含义 | 示例 |
| --- | --- | --- |
| \`int\` | 整数 | \`x: int = 1\` |
| \`str\` | 字符串 | \`s: str = "hi"\` |
| \`list[int]\` | 整数列表 | \`nums: list[int] = [1, 2]\` |
| \`dict[str, int]\` | 字典 | \`d: dict[str, int] = {"a": 1}\` |
| \`tuple[int, str]\` | 固定元组 | \`t: tuple[int, str] = (1, "a")\` |
| \`Optional[int]\` | 可空 | \`x: Optional[int] = None\` |
| \`Union[int, str]\` | 联合类型 | \`x: Union[int, str] = 1\` |
| \`Any\` | 任意类型 | \`x: Any = ...\` |
| \`Callable[[int], str]\` | 函数类型 | \`f: Callable[[int], str]\` |
| \`List[T]\` | 泛型列表 | \`nums: List[T] = []\` |

## 小结

本章介绍了 Python 类型注解与 typing 模块：

1. **类型注解**是"提示"，不影响运行，但 IDE 和静态检查工具能用
2. **基本类型**：\`int\`、\`str\`、\`float\`、\`bool\`，直接用类对象
3. **容器类型**：\`list[int]\`、\`dict[str, int]\`、\`tuple[int, ...]\`
4. **\`typing\` 模块**：\`Union\`、\`Optional\`、\`Any\`、\`Callable\`、\`Iterable\`
5. **\`TypeVar\` 和 \`Generic\`**：实现泛型，让代码既灵活又类型安全
6. **\`Protocol\`**：结构化类型，形式化"鸭子类型"
7. **\`Literal\` 和 \`overload\`**：精确表达字面值和函数重载
8. **工具链**：mypy、pyright、pydantic

类型注解是大型 Python 项目的标配。掌握它，你的代码会更健壮、更易维护、IDE 体验也会大幅提升。下一章我们学习**函数工具与实用技巧**，把前面学的所有函数知识整合应用。`
  },

  // =========================================================
  // 第三十章：函数工具与实用技巧
  // =========================================================
  {
    id: "py10-ch30",
    group: "第六部分 函数进阶",
    icon: "🛠️",
    title: "第三十章 函数工具与实用技巧",
    content: `## functools 与 inspect：函数工具箱

Python 标准库提供了大量函数工具：\`functools\` 装饰器与高阶函数、\`itertools\` 迭代器工具、\`inspect\` 反射内省。这些工具能让你写出更简洁、更高效、更"Pythonic"的代码。

## 一、\`functools\` 模块全解析

\`\`\`python
from functools import (
    lru_cache, cache, partial, reduce,
    wraps, singledispatch, total_ordering,
)

# 1. lru_cache：LRU 缓存
@lru_cache(maxsize=128)
def fibonacci(n):
    """缓存最近 128 次调用的结果"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # 瞬间算出
print(fibonacci.cache_info())  # 查看缓存命中
# CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)

# 清空缓存
fibonacci.cache_clear()

# 2. cache：无限缓存（Python 3.9+）
@cache
def square(n):
    return n * n

print(square(5))  # 25
print(square(5))  # 命中缓存

# 3. partial：部分应用
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)
print(square(5))  # 25
print(cube(2))  # 8

# 4. reduce：归约
nums = [1, 2, 3, 4, 5]
print(reduce(lambda a, b: a + b, nums, 0))  # 15
print(reduce(lambda a, b: a * b, nums, 1))  # 120

# 5. wraps：装饰器必备
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# 6. singledispatch：按类型分派
@singledispatch
def process(data):
    return f"未知类型: {type(data)}"

@process.register(int)
def _(data):
    return f"整数: {data}"

@process.register(str)
def _(data):
    return f"字符串: {data!r}"

@process.register(list)
def _(data):
    return f"列表，长度 {len(data)}"

print(process(42))  # 整数: 42
print(process("hi"))  # 字符串: 'hi'
print(process([1, 2, 3]))  # 列表，长度 3
print(process(3.14))  # 未知类型: <class 'float'>
\`\`\`

## 二、\`total_ordering\`：自动补全比较运算

\`\`\`python
from functools import total_ordering

# 定义类时，只要实现 __eq__ 和一个比较方法（如 __lt__）
# total_ordering 会自动补全其他比较方法
@total_ordering
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    
    def __eq__(self, other):
        return self.score == other.score
    
    def __lt__(self, other):
        return self.score < other.score
    
    def __repr__(self):
        return f"Student({self.name}, {self.score})"

# 现在所有比较运算都能用
s1 = Student("张三", 85)
s2 = Student("李四", 90)
s3 = Student("王五", 85)

print(s1 < s2)   # True
print(s1 <= s3)  # True（自动生成）
print(s1 > s2)   # False（自动生成）
print(s1 >= s3)  # True（自动生成）
print(s1 == s3)  # True

# 排序也自动可用
students = [s1, s2, s3, Student("赵六", 70)]
print(sorted(students))
# [Student(赵六, 70), Student(张三, 85), Student(王五, 85), Student(李四, 90)]
\`\`\`

## 三、\`itertools\` 模块全解析

\`\`\`python
import itertools

# 1. chain：串联迭代器
print(list(itertools.chain([1, 2], [3, 4], [5, 6])))
# [1, 2, 3, 4, 5, 6]

# chain.from_iterable：从可迭代的可迭代对象串联
lists = [[1, 2], [3, 4], [5, 6]]
print(list(itertools.chain.from_iterable(lists)))
# [1, 2, 3, 4, 5, 6]

# 2. count：无限计数
for i, n in enumerate(itertools.count(10, 2)):
    if i >= 5:
        break
    print(n, end=" ")  # 10 12 14 16 18
print()

# 3. cycle：无限循环
result = []
for item in itertools.cycle(["A", "B", "C"]):
    result.append(item)
    if len(result) >= 7:
        break
print(result)  # ['A', 'B', 'C', 'A', 'B', 'C', 'A']

# 4. repeat：重复
print(list(itertools.repeat("X", 5)))  # ['X', 'X', 'X', 'X', 'X']

# 5. islice：切片（支持迭代器）
print(list(itertools.islice(range(100), 5, 10)))
# [5, 6, 7, 8, 9]

# 6. takewhile / dropwhile
nums = [1, 2, 3, 4, 5, 1, 2]
print(list(itertools.takewhile(lambda x: x < 4, nums)))  # [1, 2, 3]
print(list(itertools.dropwhile(lambda x: x < 4, nums)))  # [4, 5, 1, 2]

# 7. filterfalse：filter 的反义
print(list(itertools.filterfalse(lambda x: x % 2 == 0, range(10))))
# [1, 3, 5, 7, 9]

# 8. groupby：分组（需要先排序）
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4), ("A", 5)]
sorted_data = sorted(data, key=lambda x: x[0])
for key, group in itertools.groupby(sorted_data, key=lambda x: x[0]):
    print(f"{key}: {list(group)}")
# A: [('A', 1), ('A', 2), ('A', 5)]
# B: [('B', 3), ('B', 4)]

# 9. combinations / permutations
print(list(itertools.combinations([1, 2, 3, 4], 2)))
# [(1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 4)]

print(list(itertools.permutations([1, 2, 3], 2)))
# [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]

# 10. product：笛卡尔积
print(list(itertools.product([1, 2], ["a", "b"])))
# [(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]

# 11. accumulate：累积
print(list(itertools.accumulate([1, 2, 3, 4, 5])))
# [1, 3, 6, 10, 15]（前缀和）

print(list(itertools.accumulate([1, 2, 3, 4], lambda a, b: a * b)))
# [1, 2, 6, 24]（前缀积）

# 12. starmap：解包后调用
pairs = [(2, 3), (4, 5), (6, 7)]
print(list(itertools.starmap(lambda x, y: x + y, pairs)))
# [5, 9, 13]

# 13. zip_longest：不等长 zip
print(list(itertools.zip_longest([1, 2, 3], ['a', 'b'], fillvalue='?')))
# [(1, 'a'), (2, 'b'), (3, '?')]
\`\`\`

## 四、\`inspect\` 模块：函数内省

\`\`\`python
import inspect

def example_func(a, b=10, *args, c, d=20, **kwargs):
    """示例函数。
    
    Args:
        a: 必需参数
        b: 默认参数
        *args: 可变位置参数
        c: 仅关键字参数
        d: 带默认的仅关键字参数
        **kwargs: 可变关键字参数
    """
    return a + b + c + d

# 1. 获取函数签名
sig = inspect.signature(example_func)
print(sig)  # (a, b=10, *args, c, d=20, **kwargs)

# 2. 遍历参数
for name, param in sig.parameters.items():
    print(f"{name}: kind={param.kind.name}, default={param.default}")
# a: kind=POSITIONAL_OR_KEYWORD, default=<class 'inspect._empty'>
# b: kind=POSITIONAL_OR_KEYWORD, default=10
# args: kind=VAR_POSITIONAL, default=<class 'inspect._empty'>
# c: kind=KEYWORD_ONLY, default=<class 'inspect._empty'>
# d: kind=KEYWORD_ONLY, default=20
# kwargs: kind=VAR_KEYWORD, default=<class 'inspect._empty'>

# 3. 获取源代码
print(inspect.getsource(example_func))

# 4. 获取函数所在文件
print(inspect.getfile(example_func))

# 5. 获取调用栈
def caller_info():
    frame = inspect.currentframe()
    caller = frame.f_back  # 调用者的栈帧
    print(f"调用者函数: {caller.f_code.co_name}")
    print(f"调用者行号: {caller.f_lineno}")
    print(f"调用者文件: {caller.f_code.co_filename}")

def test_caller():
    caller_info()

test_caller()
\`\`\`

## 五、实用技巧：根据签名动态调用

\`\`\`python
import inspect

def call_safely(func, **kwargs):
    """只传递函数实际接受的参数，忽略多余的"""
    sig = inspect.signature(func)
    valid_params = set(sig.parameters.keys())
    filtered = {k: v for k, v in kwargs.items() if k in valid_params}
    
    # 检查必需参数
    bound = sig.bind(**filtered)
    bound.apply_defaults()
    
    return func(*bound.args, **bound.kwargs)

def create_user(name, age, email="default@example.com"):
    return f"创建用户 {name}, {age} 岁, 邮箱 {email}"

# 多传参数也不报错
print(call_safely(create_user, name="张三", age=25, extra="ignored"))
# 创建用户 张三, 25 岁, 邮箱 default@example.com

# 缺少必需参数会报错
try:
    call_safely(create_user, age=25)
except TypeError as e:
    print(f"参数错误: {e}")
\`\`\`

## 六、函数的属性与元信息

\`\`\`python
def my_function(a, b):
    """我的函数"""
    return a + b

# 函数对象有很多属性
print(my_function.__name__)  # 函数名：my_function
print(my_function.__doc__)   # 文档字符串
print(my_function.__module__)  # 所在模块：__main__
print(my_function.__defaults__)  # 默认参数值：None（没有默认值）
print(my_function.__code__)  # 字节码对象
print(my_function.__dict__)  # 函数自定义属性：{}

# 函数可以附加自定义属性
def configure(func):
    func.is_configured = True
    func.version = "1.0"
    return func

@configure
def my_func():
    pass

print(my_func.is_configured)  # True
print(my_func.version)  # 1.0

# 实际应用：用函数属性做缓存标记
def expensive_op(n):
    if not hasattr(expensive_op, 'cache'):
        expensive_op.cache = {}
    if n not in expensive_op.cache:
        print(f"计算 {n}...")
        expensive_op.cache[n] = n * n
    return expensive_op.cache[n]

print(expensive_op(5))  # 计算 5... → 25
print(expensive_op(5))  # 25（用缓存）
print(expensive_op.cache)  # {5: 25}
\`\`\`

## 七、\`eval\` 和 \`exec\`：动态执行代码

\`\`\`python
# eval：执行表达式，返回结果
x = 10
result = eval("x * 2 + 5")
print(result)  # 25

# 计算字符串表达式
expr = "3 ** 2 + 4 ** 2"
print(eval(expr))  # 25

# exec：执行语句（没有返回值）
exec("y = 100")
print(y)  # 100（y 被创建在当前作用域）

# 执行多行代码
code = """
def dynamic_func(n):
    return n * 2

result = dynamic_func(10)
"""
exec(code)
print(result)  # 20
print(dynamic_func(5))  # 10

# ⚠️ 安全警告：永远不要 eval/exec 不可信的输入！
# user_input = input("输入表达式: ")
# eval(user_input)  # ❌ 危险！用户可以输入 __import__('os').system('rm -rf /')

# 安全的做法：限制 globals 和 locals
eval("1 + 2", {"__builtins__": {}}, {})  # 限制内置函数
# eval("__import__('os')", {"__builtins__": {}})  # ❌ 会失败，因为禁用了 __import__
\`\`\`

## 八、\`exec\` 与 globals/locals

\`\`\`python
# exec 在指定命名空间执行
namespace = {}
exec("x = 42", namespace)
print(namespace['x'])  # 42

# 在自定义命名空间执行
class DynamicModule:
    pass

module = DynamicModule()
exec("""
def greet(name):
    return f'Hello, {name}!'

PI = 3.14159
""", module.__dict__)

print(module.greet("张三"))  # Hello, 张三!
print(module.PI)  # 3.14159

# 实际应用：动态生成配置
config_str = """
HOST = 'localhost'
PORT = 8080
DEBUG = True
"""

config = {}
exec(config_str, config)
print(config['HOST'])  # localhost
print(config['PORT'])  # 8080
\`\`\`

## 九、\`compile\`：预编译代码

\`\`\`python
# compile 把源代码编译成代码对象，可以重复执行
source = "x * 2 + 1"
code_obj = compile(source, "<string>", "eval")

# 多次执行，不需要重新解析
x = 10
print(eval(code_obj))  # 21
x = 20
print(eval(code_obj))  # 41
x = 30
print(eval(code_obj))  # 61

# 编译模式：
# 'exec'：多行语句
# 'eval'：单个表达式
# 'single'：单行语句（交互式）

# 预编译的好处：执行更快（解析只做一次）
import time

# 不预编译
start = time.time()
for _ in range(100000):
    eval("1 + 2 * 3")
print(f"不预编译: {time.time() - start:.4f}s")

# 预编译
code = compile("1 + 2 * 3", "<string>", "eval")
start = time.time()
for _ in range(100000):
    eval(code)
print(f"预编译: {time.time() - start:.4f}s")
# 预编译通常快 2-3 倍
\`\`\`

## 十、\`operator\` 模块：运算符函数化

\`\`\`python
import operator

# operator 把运算符变成函数
print(operator.add(3, 4))    # 7  (3 + 4)
print(operator.sub(10, 3))   # 7  (10 - 3)
print(operator.mul(3, 4))    # 12 (3 * 4)
print(operator.truediv(10, 4))  # 2.5
print(operator.floordiv(10, 3))  # 3
print(operator.mod(10, 3))   # 1
print(operator.pow(2, 10))   # 1024
print(operator.neg(5))       # -5
print(operator.pos(-5))      # -5
print(operator.abs(-5))      # 5

# 比较运算符
print(operator.eq(3, 3))     # True
print(operator.ne(3, 4))     # True
print(operator.lt(3, 4))     # True
print(operator.le(3, 3))     # True
print(operator.gt(4, 3))     # True
print(operator.ge(4, 4))     # True

# 逻辑运算符
print(operator.not_(True))   # False
print(operator.truth([]))    # False
print(operator.is_(None, None))  # True
print(operator.is_not(1, 2))  # True

# 实用：itemgetter / attrgetter / methodcaller
from operator import itemgetter, attrgetter, methodcaller

# itemgetter：取序列/字典的元素
data = [{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]
get_name = itemgetter("name")
print(get_name(data[0]))  # 张三

# 排序
sorted_data = sorted(data, key=itemgetter("age"))
print(sorted_data)

# 取多个字段
get_info = itemgetter("name", "age")
print(get_info(data[0]))  # ('张三', 25)

# attrgetter：取对象属性
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

people = [Person("张三", 25), Person("李四", 30)]
oldest = max(people, key=attrgetter("age"))
print(oldest.name)  # 李四

# methodcaller：调用方法
words = ["Hello", "World", "Python"]
upper_words = list(map(methodcaller("upper"), words))
print(upper_words)  # ['HELLO', 'WORLD', 'PYTHON']

# 带参数的方法调用
"hello world".replace(" ", "_")  # 等价于
methodcaller("replace", " ", "_")("hello world")
\`\`\`

## 十一、综合示例：构建函数式数据处理管道

\`\`\`python
from functools import reduce, partial
from itertools import chain, groupby
from operator import itemgetter

# 数据
employees = [
    {"name": "Alice", "dept": "Engineering", "salary": 90000},
    {"name": "Bob", "dept": "Sales", "salary": 60000},
    {"name": "Charlie", "dept": "Engineering", "salary": 95000},
    {"name": "Diana", "dept": "Sales", "salary": 70000},
    {"name": "Eve", "dept": "Engineering", "salary": 88000},
    {"name": "Frank", "dept": "Marketing", "salary": 65000},
]

# 1. 按 dept 分组并计算平均工资
def average_salary_by_dept(employees):
    # 按 dept 排序（groupby 要求）
    sorted_emps = sorted(employees, key=itemgetter("dept"))
    
    # 分组
    grouped = groupby(sorted_emps, key=itemgetter("dept"))
    
    # 每组计算平均工资
    result = {}
    for dept, group in grouped:
        salaries = list(map(itemgetter("salary"), group))
        result[dept] = sum(salaries) / len(salaries)
    
    return result

print("各部门平均工资:")
for dept, avg in average_salary_by_dept(employees).items():
    print(f"  {dept}: \${avg:.2f}")

# 2. 找工资最高的员工
def highest_paid(employees):
    return reduce(
        lambda a, b: a if a["salary"] > b["salary"] else b,
        employees
    )

top = highest_paid(employees)
print(f"\\n工资最高: {top['name']} (${top['salary']})")

# 3. 工资排名前 N
def top_n_earners(employees, n=3):
    return sorted(employees, key=itemgetter("salary"), reverse=True)[:n]

print(f"\\n工资前 3:")
for emp in top_n_earners(employees, 3):
    print(f"  {emp['name']}: ${emp['salary']}")

# 4. 部门工资总和
def total_salary_by_dept(employees):
    sorted_emps = sorted(employees, key=itemgetter("dept"))
    grouped = groupby(sorted_emps, key=itemgetter("dept"))
    return {
        dept: sum(map(itemgetter("salary"), group))
        for dept, group in grouped
    }

print(f"\\n各部门工资总和:")
for dept, total in total_salary_by_dept(employees).items():
    print(f"  {dept}: ${total}")

# 5. 用 partial 创建专用函数
top_5 = partial(top_n_earners, n=5)
print(f"\\n工资前 5:")
for emp in top_5(employees):
    print(f"  {emp['name']}: ${emp['salary']}")
\`\`\`

## 十二、实用装饰器集合

\`\`\`python
import time
from functools import wraps, lru_cache

# 1. 重试装饰器
def retry(max_attempts=3, delay=0.1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"第 {attempt + 1} 次失败: {e}")
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

# 2. 超时装饰器（简化版）
import signal

def timeout(seconds):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            def handler(signum, frame):
                raise TimeoutError(f"函数 {func.__name__} 超时")
            
            old_handler = signal.signal(signal.SIGALRM, handler)
            signal.alarm(seconds)
            try:
                return func(*args, **kwargs)
            finally:
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        return wrapper
    return decorator

# 3. 节流装饰器
def throttle(calls_per_second):
    min_interval = 1.0 / calls_per_second
    last_called = [0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            elapsed = now - last_called[0]
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
            last_called[0] = time.time()
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 4. 调试装饰器
def debug(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)
        print(f"调用 {func.__name__}({signature})")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回 {result!r}")
        return result
    return wrapper

# 测试
@debug
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(5))
\`\`\`

## 十三、函数式工具一览表

| 工具 | 模块 | 作用 |
| --- | --- | --- |
| \`lru_cache\` | functools | LRU 缓存 |
| \`cache\` | functools | 无限缓存 |
| \`partial\` | functools | 部分应用 |
| \`reduce\` | functools | 归约 |
| \`wraps\` | functools | 装饰器辅助 |
| \`singledispatch\` | functools | 按类型分派 |
| \`total_ordering\` | functools | 补全比较运算 |
| \`chain\` | itertools | 串联迭代器 |
| \`count\` | itertools | 无限计数 |
| \`cycle\` | itertools | 无限循环 |
| \`groupby\` | itertools | 分组 |
| \`combinations\` | itertools | 组合 |
| \`permutations\` | itertools | 排列 |
| \`product\` | itertools | 笛卡尔积 |
| \`itemgetter\` | operator | 取序列元素 |
| \`attrgetter\` | operator | 取对象属性 |
| \`methodcaller\` | operator | 调用方法 |

## 小结

本章整合了 Python 函数工具与实用技巧：

1. **\`functools\`**：\`lru_cache\`、\`partial\`、\`reduce\`、\`wraps\`、\`singledispatch\`、\`total_ordering\`
2. **\`itertools\`**：\`chain\`、\`count\`、\`cycle\`、\`groupby\`、\`combinations\`、\`permutations\`、\`product\`
3. **\`inspect\`**：函数签名、源代码、调用栈的内省
4. **\`operator\`**：把运算符变成函数，\`itemgetter\`、\`attrgetter\`、\`methodcaller\`
5. **\`eval\`/\`exec\`/\`compile\`**：动态执行代码（注意安全！）
6. **函数属性**：\`__name__\`、\`__doc__\`、\`__dict__\`，可以附加自定义属性
7. **实用装饰器**：重试、超时、节流、调试

掌握这些工具，你就能用更少的代码做更多的事。下一部分我们将进入**面向对象编程**——Python 另一个核心范式。`
  }
];

export { chapters };
