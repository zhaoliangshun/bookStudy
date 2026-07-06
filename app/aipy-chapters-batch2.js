// =============================================================
// Python 人工智能开发教程 —— 第二批章节（NumPy科学计算组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   1. aipy-numpy-basics   NumPy数组基础
//   2. aipy-numpy-ops      NumPy数组运算
//   3. aipy-numpy-index    NumPy索引与切片
//   4. aipy-numpy-broadcast NumPy广播机制
//   5. aipy-numpy-linalg   NumPy线性代数
//
// 每个章节对象的结构：
//   id      : 唯一标识（以 aipy- 开头）
//   icon    : 展示用 emoji
//   group   : 分组名 "NumPy科学计算"
//   title   : 中文标题
//   content : Markdown 格式的详细讲解（3000+ 字）
//   code    : 纯 Python 模拟 NumPy 核心概念的可运行代码
// =============================================================

export const chapters = [
  {
    id: "aipy-numpy-basics",
    icon: "🔢",
    group: "NumPy科学计算",
    title: "NumPy数组基础",
    content: `
# 第1章：NumPy数组基础

## 1.1 为什么人工智能离不开 NumPy

如果说 Python 是人工智能领域的"通用语言"，那么 NumPy（Numerical Python）就是这门语言里的"数字神经系统"。几乎所有主流的 AI 框架——TensorFlow、PyTorch、JAX、scikit-learn、pandas——底层都直接或间接地依赖 NumPy 的数据结构和接口约定。可以这么说：**不学 NumPy，就无法真正读懂任何一份 AI 项目的源码**。

NumPy 之所以重要，根源在于 Python 原生列表（list）在做数值计算时效率太低。Python 的 list 是一个"装对象引用的容器"，每个元素都是一个完整的 Python 对象，带有引用计数、类型信息、垃圾回收标记等额外开销。当你想对一百万个浮点数做加法时，Python 列表要循环一百万次，每次都要拆箱、相加、装箱；而 NumPy 的 ndarray（n-dimensional array）是一片连续的内存，里面装的是同类型的原始数值，CPU 可以一次性用 SIMD 指令批量处理，速度通常快 10 到 100 倍。

理解这一点之后，你就明白为什么 NumPy 的设计哲学是"**同质、连续、向量化**"：

- **同质（homogeneous）**：一个数组里所有元素是同一种数据类型，比如全是 float64 或全是 int32。
- **连续（contiguous）**：底层内存是连续排布的，没有指针跳转，CPU 缓存命中率高。
- **向量化（vectorized）**：对数组的操作会自动应用到每个元素，不需要你写 for 循环。

本章的目标，就是带你从零开始认识 ndarray 这个核心对象，掌握它的创建方式、属性含义，以及最常用的几种"工厂函数"。

## 1.2 ndarray 的核心属性：shape、dtype、ndim、size

要理解一个 ndarray，最重要的是看懂它的四个属性。下面这张表是必须背下来的：

| 属性 | 含义 | 示例 |
| --- | --- | --- |
| ndim | 维度数（轴的个数） | 标量 0，向量 1，矩阵 2，张量 3+ |
| shape | 每个轴的长度（元组） | (3,) 是 3 个元素的向量，(2,3) 是 2 行 3 列 |
| dtype | 元素的数据类型 | int64、float32、bool、object |
| size | 元素总数（shape 各项乘积） | shape (2,3,4) → size 24 |

此外还有两个不那么关键但也有用的属性：nbytes（占用的字节数 = size × dtype.itemsize），itemsize（每个元素占几个字节）。

\`\`\`text
arr = np.array([[1, 2, 3], [4, 5, 6]])

内存视图（连续排布）：
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │
└───┴───┴───┴───┴───┴───┘
逻辑视图（按 shape 还原）：
  行0: [1, 2, 3]
  行1: [4, 5, 6]

属性：
  ndim    = 2
  shape   = (2, 3)
  size    = 6
  dtype   = int64
  itemsize= 8 字节
  nbytes  = 6 × 8 = 48 字节
\`\`\`

**为什么 shape 是元组而不是列表？** 因为 shape 是不可变的，元组更能表达"这是一个固定的描述信息"的语义。空元组 () 表示 0 维标量，(n,) 表示 1 维向量（注意那个逗号，没有它就只是个普通括号表达式），(m, n) 表示 2 维矩阵，(b, h, w, c) 表示 4 维批量图像数据。

**dtype 的学问**：NumPy 提供了十几种数据类型，常见的有：

- 整数：int8、int16、int32、int64、uint8（无符号 8 位，常用于图像像素）
- 浮点：float16、float32、float64（默认）、float128
- 复数：complex64、complex128
- 其他：bool、object（任意 Python 对象）、str_、bytes_

在 AI 实战中，**float32 是最常用的训练精度**，因为 GPU 对 float32 的吞吐量远高于 float64，而且 float32 占用内存只有 float64 的一半，能装下更大的 batch。int64 则常用于索引、标签。理解 dtype 的取舍，是优化模型显存占用的第一步。

## 1.3 创建数组的五种主流方式

NumPy 提供了非常丰富的数组创建函数，但日常开发中 90% 的场景都用下面这五种。

### 方式一：从 Python 列表创建 —— np.array()

最直接的创建方式，把已有的嵌套列表转成 ndarray。

\`\`\`python
import numpy as np

# 一维数组
a = np.array([1, 2, 3, 4, 5])
# 二维数组（矩阵）
b = np.array([[1, 2, 3], [4, 5, 6]])
# 三维数组（张量，常见于图像或时序批次）
c = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])

# 指定 dtype
d = np.array([1, 2, 3], dtype=np.float32)
\`\`\`

注意：传入的嵌套列表各维度长度必须一致，否则会退化成 object 类型而非真正的多维数组。

### 方式二：从范围创建 —— np.arange() / np.linspace()

\`\`\`python
np.arange(0, 10, 2)        # [0, 2, 4, 6, 8] 起止步长
np.linspace(0, 1, 5)       # [0, 0.25, 0.5, 0.75, 1.0] 起止个数
np.logspace(0, 3, 4)       # [1, 10, 100, 1000] 对数等分
\`\`\`

arange 和 Python 的 range 类似但不接受小数步长会丢精度；linspace 则保证端点闭区间，常用于画图采样。

### 方式三：全零 / 全一 / 全填充 —— np.zeros() / np.ones() / np.full()

\`\`\`python
np.zeros((3, 4))           # 3×4 全零矩阵，默认 float64
np.ones((2, 2), dtype=int) # 2×2 全一整数矩阵
np.full((2, 3), 7)         # 2×3 全 7 矩阵
\`\`\`

这三种是最常用的"占位"矩阵，比如神经网络的权重初始化、累加器清零。

### 方式四：单位矩阵与对角矩阵 —— np.eye() / np.diag()

\`\`\`python
np.eye(3)                  # 3×3 单位矩阵
np.eye(3, k=1)             # 主对角线上方一条对角线为 1
np.diag([1, 2, 3])         # 用列表构造对角矩阵
\`\`\`

单位矩阵在线性代数中地位等同于数字 1，任何矩阵乘以单位矩阵等于自身。

### 方式五：随机数 —— np.random 模块

\`\`\`python
np.random.rand(2, 3)          # [0,1) 均匀分布
np.random.randn(2, 3)         # 标准正态分布
np.random.randint(0, 10, (3,))# [0,10) 整数
np.random.seed(42)            # 固定随机种子，保证可复现
\`\`\`

**AI 训练里固定随机种子至关重要**，否则每次跑结果都不一样，无法判断改动是有效还是噪声。新版本推荐用 np.random.default_rng(42) 创建 Generator 对象。

## 1.4 零矩阵、单位矩阵、随机矩阵的实战用途

这三种"工厂矩阵"在 AI 里有明确用途，理解它们能让你看懂大多数初始化代码：

**零矩阵的用途**：
- 神经网络的偏置项 bias 通常初始化为 0
- 梯度累加器每次反向传播前清零
- 注意力机制中的 mask 矩阵

**单位矩阵的用途**：
- 残差连接 ResNet 的恒等映射基准
- 正则化项中的 L2 惩罚 I 矩阵
- 特征标准化时的协方差基准

**随机矩阵的用途**：
- 权重初始化（Xavier、He 初始化都基于随机矩阵）
- Dropout 掩码生成
- 数据增强中的随机扰动
- 测试代码时的占位数据

\`\`\`text
权重初始化的常见策略：
  Xavier/Glorot: W = randn(shape) * sqrt(1/fan_in)
  He/Kaiming   : W = randn(shape) * sqrt(2/fan_in)   # ReLU 网络
  Orthogonal   : 对随机矩阵做 QR 分解得到正交矩阵
\`\`\`

## 1.5 数组的数据类型转换

dtype 之间的转换用 .astype() 方法，每次都会返回新数组（不修改原数组）。

\`\`\`python
arr = np.array([1.7, 2.3, 3.9])
arr_int = arr.astype(np.int32)   # [1, 2, 3] 直接截断小数部分
arr_str = arr.astype(np.str_)    # ['1.7' '2.3' '3.9']
\`\`\`

注意 float 转 int 是**截断而非四舍五入**，要四舍五入得用 np.round()。类型转换虽然方便，但在大数据集上有性能开销，应该尽量避免在循环里反复转换。

## 1.6 数组形状查看与基础变形

.shape 属性查看形状，.reshape() 方法改变形状。reshape 不复制数据，只改变"看内存的方式"，所以非常快。

\`\`\`python
a = np.arange(12)              # shape (12,)
b = a.reshape(3, 4)            # shape (3, 4)
c = a.reshape(2, 2, 3)         # shape (2, 2, 3)
d = a.reshape(-1, 4)           # -1 表示自动推断 → (3, 4)
\`\`\`

-1 是 NumPy 最贴心的设计：你只关心某一维，剩下的让 NumPy 自己算。reshape 前后元素总数必须一致，否则报错。

## 1.7 常见陷阱与最佳实践

1. **不要用 Python 列表做大批量数值运算**。哪怕只是 a + b，列表要写循环，ndarray 一行搞定且快几十倍。
2. **创建数组时优先指定 dtype**。np.zeros((1000, 1000)) 默认 float64 占 8MB，如果你只需要 float32 就只要 4MB，GPU 上差别更大。
3. **reshape 是视图不是拷贝**。修改 reshape 后的数组会影响原数组，要独立副本用 .copy()。
4. **嵌套列表维度要齐**。[[1,2],[3]] 会被识别成 object 数组而非二维数组，调试时很难发现。
5. **随机种子要早设**。在 import 之后、所有随机操作之前调用 np.random.seed()，且每个进程独立设。

## 1.8 本章小结

- ndarray 是 NumPy 的核心数据结构，特点是同质、连续、向量化。
- 四个核心属性：ndim（维度数）、shape（形状）、dtype（数据类型）、size（元素数）。
- 五种创建方式：从列表、从范围、全零/全一/全填充、单位/对角、随机数。
- dtype 在 AI 里通常用 float32 训练、int64 索引。
- reshape 是视图操作，要小心数据共享。

下一章我们将学习如何对这些数组做运算——算术、通用函数、统计、矩阵乘法，这是 NumPy 真正发挥威力的地方。
`,
    code: `# ============================================================
# 第1章代码演示：NumPy数组基础（纯 Python 模拟实现）
# ============================================================
# 注意：本沙箱环境可能未安装 numpy，因此下面用纯 Python
# 实现一个迷你版 ndarray 类，模拟 NumPy 的核心概念：
#   - 创建数组
#   - 查看 shape / dtype / ndim / size 属性
#   - zeros / ones / eye / random 等工厂函数
# 文末附上等价的"真正的 NumPy 代码"供参考。
# ------------------------------------------------------------

import random
import math

# ---- 1. 定义一个迷你 ndarray 类 ----
class MiniArray:
    """用纯 Python 模拟 NumPy 的 ndarray"""

    def __init__(self, data, dtype="int64"):
        # data 可以是嵌套列表，也可以是扁平列表 + shape
        if isinstance(data, list):
            self._data = self._flatten(data)        # 扁平化成一维
            self._shape = self._infer_shape(data)   # 推断形状
        else:
            raise TypeError("data 必须是 list")
        self._dtype = dtype
        self._size = len(self._data)
        self._ndim = len(self._shape)

    @staticmethod
    def _flatten(nested):
        """把嵌套列表拍平成一维列表"""
        out = []
        for item in nested:
            if isinstance(item, list):
                out.extend(MiniArray._flatten(item))
            else:
                out.append(item)
        return out

    @staticmethod
    def _infer_shape(nested):
        """推断嵌套列表的形状"""
        shape = []
        cur = nested
        while isinstance(cur, list):
            shape.append(len(cur))
            cur = cur[0] if len(cur) > 0 else None
        return tuple(shape)

    # 四大核心属性
    @property
    def shape(self):
        return self._shape

    @property
    def dtype(self):
        return self._dtype

    @property
    def ndim(self):
        return self._ndim

    @property
    def size(self):
        return self._size

    @property
    def itemsize(self):
        """每个元素占用的字节数（模拟值）"""
        sizes = {"int64": 8, "int32": 4, "float64": 8, "float32": 4, "bool": 1}
        return sizes.get(self._dtype, 8)

    @property
    def nbytes(self):
        return self._size * self.itemsize

    def __repr__(self):
        return f"MiniArray(shape={self._shape}, dtype={self._dtype}, data={self._data})"


# ---- 2. 从 Python 列表创建数组 ----
print("========== 1. 从列表创建数组 ==========")
a = MiniArray([1, 2, 3, 4, 5], dtype="int64")
print("一维数组 a:", a)
print("  shape =", a.shape)
print("  ndim  =", a.ndim)
print("  size  =", a.size)
print("  dtype =", a.dtype)
print("  itemsize =", a.itemsize, "字节")
print("  nbytes   =", a.nbytes, "字节")

b = MiniArray([[1, 2, 3], [4, 5, 6]], dtype="int64")
print("\\n二维数组 b:", b)
print("  shape =", b.shape, "  ndim =", b.ndim, "  size =", b.size)

c = MiniArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], dtype="int64")
print("\\n三维数组 c:")
print("  shape =", c.shape, "  ndim =", c.ndim, "  size =", c.size)


# ---- 3. 工厂函数：zeros / ones / full ----
print("\\n========== 2. 工厂函数 ==========")

def zeros(shape, dtype="float64"):
    """模拟 np.zeros"""
    total = 1
    for s in shape:
        total *= s
    data = [0.0] * total
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = tuple(shape)
    arr._dtype = dtype
    arr._size = total
    arr._ndim = len(shape)
    return arr

def ones(shape, dtype="float64"):
    total = 1
    for s in shape:
        total *= s
    data = [1.0] * total
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = tuple(shape)
    arr._dtype = dtype
    arr._size = total
    arr._ndim = len(shape)
    return arr

def full(shape, fill_value, dtype="float64"):
    total = 1
    for s in shape:
        total *= s
    data = [fill_value] * total
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = tuple(shape)
    arr._dtype = dtype
    arr._size = total
    arr._ndim = len(shape)
    return arr

z = zeros((3, 4))
print("zeros((3,4)):", z.shape, z.dtype, "前4个元素:", z._data[:4])

o = ones((2, 2), dtype="int32")
print("ones((2,2), int32):", o.shape, o.dtype, "元素:", o._data)

f = full((2, 3), 7)
print("full((2,3), 7):", f.shape, "元素:", f._data)


# ---- 4. 单位矩阵 eye ----
print("\\n========== 3. 单位矩阵 ==========")

def eye(n, dtype="float64"):
    """模拟 np.eye: n×n 单位矩阵"""
    data = []
    for i in range(n):
        for j in range(n):
            data.append(1.0 if i == j else 0.0)
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = (n, n)
    arr._dtype = dtype
    arr._size = n * n
    arr._ndim = 2
    return arr

I3 = eye(3)
print("3×3 单位矩阵:")
for i in range(3):
    print("  ", I3._data[i*3:(i+1)*3])


# ---- 5. 随机矩阵 ----
print("\\n========== 4. 随机矩阵 ==========")

def random_array(shape, low=0.0, high=1.0, dtype="float64", seed=None):
    """模拟 np.random.rand，生成 [low, high) 均匀分布随机矩阵"""
    if seed is not None:
        random.seed(seed)
    total = 1
    for s in shape:
        total *= s
    data = [random.uniform(low, high) for _ in range(total)]
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = tuple(shape)
    arr._dtype = dtype
    arr._size = total
    arr._ndim = len(shape)
    return arr

def randn_array(shape, dtype="float64", seed=None):
    """模拟 np.random.randn，标准正态分布（用 Box-Muller 近似）"""
    if seed is not None:
        random.seed(seed)
    total = 1
    for s in shape:
        total *= s
    data = []
    for _ in range(total):
        u1 = random.random()
        u2 = random.random()
        z = math.sqrt(-2 * math.log(u1 + 1e-12)) * math.cos(2 * math.pi * u2)
        data.append(z)
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = tuple(shape)
    arr._dtype = dtype
    arr._size = total
    arr._ndim = len(shape)
    return arr

r = random_array((2, 3), seed=42)
print("均匀随机矩阵 shape=", r.shape)
for i in range(2):
    print("  ", [round(x, 3) for x in r._data[i*3:(i+1)*3]])

rn = randn_array((2, 3), seed=42)
print("\\n标准正态矩阵 shape=", rn.shape)
for i in range(2):
    print("  ", [round(x, 3) for x in rn._data[i*3:(i+1)*3]])


# ---- 6. arange 与 linspace ----
print("\\n========== 5. 范围数组 ==========")

def arange(start, stop, step=1, dtype="int64"):
    """模拟 np.arange"""
    data = []
    v = start
    while v < stop:
        data.append(v)
        v += step
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = (len(data),)
    arr._dtype = dtype
    arr._size = len(data)
    arr._ndim = 1
    return arr

def linspace(start, stop, num, dtype="float64"):
    """模拟 np.linspace"""
    if num < 1:
        return zeros((0,))
    if num == 1:
        data = [float(start)]
    else:
        step = (stop - start) / (num - 1)
        data = [start + i * step for i in range(num)]
    arr = MiniArray.__new__(MiniArray)
    arr._data = data
    arr._shape = (num,)
    arr._dtype = dtype
    arr._size = num
    arr._ndim = 1
    return arr

ar = arange(0, 10, 2)
print("arange(0,10,2):", ar._data)

ls = linspace(0, 1, 5)
print("linspace(0,1,5):", [round(x, 3) for x in ls._data])


# ---- 7. dtype 转换 ----
print("\\n========== 6. dtype 转换 ==========")

def astype(arr, new_dtype):
    """模拟 .astype()"""
    convert = {
        ("float64", "int32"): lambda x: int(x),
        ("float64", "int64"): lambda x: int(x),
        ("int64", "float32"): lambda x: float(x),
        ("int64", "float64"): lambda x: float(x),
        ("float64", "bool"): lambda x: bool(x),
    }
    fn = convert.get((arr.dtype, new_dtype), lambda x: x)
    new_data = [fn(x) for x in arr._data]
    new_arr = MiniArray.__new__(MiniArray)
    new_arr._data = new_data
    new_arr._shape = arr._shape
    new_arr._dtype = new_dtype
    new_arr._size = arr._size
    new_arr._ndim = arr._ndim
    return new_arr

float_arr = MiniArray([1.7, 2.3, 3.9], dtype="float64")
int_arr = astype(float_arr, "int32")
print("原 float64 数组:", float_arr._data)
print("转 int32 后（截断小数）:", int_arr._data, "dtype =", int_arr.dtype)


# ---- 8. 真正的 NumPy 等价代码（仅供参考，需安装 numpy） ----
print("\\n========== 7. 真正的 NumPy 等价代码 ==========")
print("""# import numpy as np
#
# a = np.array([1, 2, 3, 4, 5])
# b = np.array([[1, 2, 3], [4, 5, 6]])
# print(a.shape, a.dtype, a.ndim, a.size)
#
# z = np.zeros((3, 4))
# o = np.ones((2, 2), dtype=np.int32)
# I = np.eye(3)
# r = np.random.rand(2, 3)
# rn = np.random.randn(2, 3)
#
# ar = np.arange(0, 10, 2)
# ls = np.linspace(0, 1, 5)
#
# arr = np.array([1.7, 2.3, 3.9])
# arr_int = arr.astype(np.int32)  # 截断为 [1, 2, 3]
""")
print("（以上为参考代码，沙箱未安装 numpy 时不会执行）")

print("\\n========== 演示结束 ==========")
`,
  },

  {
    id: "aipy-numpy-ops",
    icon: "➕",
    group: "NumPy科学计算",
    title: "NumPy数组运算",
    content: `
# 第2章：NumPy数组运算

## 2.1 向量化：NumPy 的灵魂

上一章我们学会了创建数组，这一章要让它"动起来"。NumPy 最强大的能力就是**向量化运算**——你写一句 \`a + b\`，它内部会自动遍历所有元素做加法，而不需要你写 for 循环。这种"对整个数组整体操作"的写法，不只是语法糖，更是性能优化的关键：底层调用的是 C 实现的连续内存批量运算，比 Python 循环快一两个数量级。

理解向量化的关键，是区分三种"运算风格"：

1. **元素级运算（element-wise）**：两个形状相同的数组逐元素运算，结果形状不变。如 \`a + b\`、\`a * b\`。
2. **标量-数组运算**：一个标量作用到整个数组，如 \`a * 2\`、\`a + 1\`，相当于标量被"广播"到每个元素。
3. **归约运算（reduction）**：把数组压缩成更小的形状，如 \`a.sum()\` 把所有元素求和得到一个标量，\`a.sum(axis=0)\` 沿某个轴求和得到一维数组。

这三种风格覆盖了 NumPy 90% 的运算场景，下面我们逐一展开。

## 2.2 算术运算：加减乘除与逐元素运算

NumPy 的算术运算符都是**元素级**的，这意味着两个数组做 \`+\` 等同于对应位置的元素两两相加。这一点和 Python 列表的行为完全不同——列表的 \`+\` 是拼接，\`*\` 是重复，而 ndarray 的 \`+\` 是数学加法，\`*\` 是数学乘法。

\`\`\`python
import numpy as np

a = np.array([1, 2, 3, 4])
b = np.array([10, 20, 30, 40])

a + b        # [11, 22, 33, 44]
a - b        # [-9, -18, -27, -36]
a * b        # [10, 40, 90, 160]  注意：这是逐元素乘，不是矩阵乘！
a / b        # [0.1, 0.1, 0.1, 0.1]
b // a       # [10, 10, 10, 10] 整除
b % a        # [0, 0, 0, 0] 取模
b ** a       # [10, 400, 27000, 2560000] 幂运算
\`\`\`

特别要注意 \`a * b\` **不是矩阵乘法**，而是逐元素相乘。矩阵乘法要用 \`a @ b\` 或 \`np.dot(a, b)\` 或 \`np.matmul(a, b)\`，这一章后面会讲。

标量与数组的运算会自动作用到每个元素：

\`\`\`python
a + 100      # [101, 102, 103, 104]
a * 2        # [2, 4, 6, 8]
-a           # [-1, -2, -3, -4]
1 / a        # [1.0, 0.5, 0.333, 0.25]
\`\`\`

这些运算在底层都是 C 实现的循环，速度远快于 Python 的 \`[x*2 for x in a]\`。

## 2.3 通用函数 ufunc：对每个元素做数学变换

ufunc（universal function）是 NumPy 对"逐元素数学函数"的统一封装。它们看起来像普通函数，但接受数组作为输入，输出是对应形状的结果数组。

\`\`\`python
# 一元 ufunc：输入一个数组
np.abs([-1, -2, 3])       # [1, 2, 3]
np.sqrt([1, 4, 9])        # [1.0, 2.0, 3.0]
np.square([1, 2, 3])      # [1, 4, 9]
np.exp([0, 1, 2])         # [1.0, 2.718, 7.389]
np.log([1, np.e, np.e**2])# [0, 1, 2]
np.sin([0, np.pi/2])      # [0, 1.0]
np.cos([0, np.pi])        # [1.0, -1.0]

# 取整类
np.floor([1.2, 2.7, -0.5])# [1.0, 2.0, -1.0]
np.ceil([1.2, 2.7, -0.5]) # [2.0, 3.0, -0.0]
np.round([1.4, 1.5, 2.5]) # [1, 2, 2]  注意银行家舍入

# 二元 ufunc：输入两个数组
np.maximum([1, 3, 5], [2, 2, 2])   # [2, 3, 5] 逐元素取最大
np.minimum([1, 3, 5], [2, 2, 2])   # [1, 2, 2]
np.add([1, 2], [3, 4])             # [4, 6]
np.power([2, 3], [3, 2])           # [8, 9]
\`\`\`

ufunc 的几个特点值得记住：
- **同形状输入同形状输出**，不存在隐式降维。
- **支持广播**（下一章详讲），可以处理不同形状的输入。
- **支持 out 参数**：可以指定输出数组，避免临时分配，大数据集上有性能收益。
- **支持累积（accumulate）和外积（outer）**：\`np.add.accumulate([1,2,3])\` 得到 [1, 3, 6]，\`np.add.outer([1,2],[10,20])\` 得到 [[11,21],[12,22]]。

ufunc 在 AI 里无处不在：激活函数 ReLU 用 \`np.maximum(x, 0)\`，sigmoid 用 \`1/(1+np.exp(-x))\`，softmax 用 \`np.exp(x)/np.sum(np.exp(x))\`。

## 2.4 统计函数：sum / mean / std / max / min

统计函数属于**归约运算**，它们把数组"压缩"成更小的形状，最极端的情况下压缩成一个标量。

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])

a.sum()              # 21  全部求和
a.mean()             # 3.5 全部平均
a.std()              # 1.7078 标准差
a.var()              # 2.9167 方差
a.max()              # 6
a.min()              # 1
a.prod()             # 720  全部相乘
a.argmax()           # 5  最大值的索引（扁平）
a.argmin()           # 0  最小值的索引
\`\`\`

更强大的是 \`axis\` 参数，它指定沿哪个轴归约。**这是新手最容易混淆的概念**，记住口诀："axis 设几，就让那个维度消失"。

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])  # shape (2, 3)

a.sum(axis=0)        # [5, 7, 9]   沿"行"方向求和 → 列和
                     # axis=0 这个维度消失，shape (2,3) → (3,)
a.sum(axis=1)        # [6, 15]     沿"列"方向求和 → 行和
                     # axis=1 这个维度消失，shape (2,3) → (2,)

a.mean(axis=0)       # [2.5, 3.5, 4.5] 每列平均
a.max(axis=1)        # [3, 6]          每行最大
\`\`\`

形象理解：axis=0 是"垂直方向"，把列压扁；axis=1 是"水平方向"，把行压扁。三维以上同理，axis=2 就是沿"深度"方向压。

\`\`\`text
shape=(2, 3) 的数组：
  [[1, 2, 3],
   [4, 5, 6]]

axis=0 求和（垂直压扁）：     axis=1 求和（水平压扁）：
   ↓  ↓  ↓                    →    →
  [1, 2, 3]                  [1+2+3=6]
  [4, 5, 6]                  [4+5+6=15]
   ↓  ↓  ↓
  [5, 7, 9]
\`\`\`

## 2.5 累积运算与差分

除了"一步到位"的归约，NumPy 还有"逐步累积"的运算，保留中间过程：

\`\`\`python
a = np.array([1, 2, 3, 4])

np.cumsum(a)     # [1, 3, 6, 10]   累积和
np.cumprod(a)    # [1, 2, 6, 24]   累积积
np.diff(a)       # [1, 1, 1]       一阶差分（比原数组少一个元素）
\`\`\`

累积和在强化学习的回报计算、时序信号的能量分析中很常用；差分则用于求离散导数、检测变化点。

## 2.6 矩阵乘法：三种写法与一个陷阱

矩阵乘法是线性代数里最重要的运算，NumPy 提供了三种等价写法：

\`\`\`python
A = np.array([[1, 2], [3, 4]])   # 2×2
B = np.array([[5, 6], [7, 8]])   # 2×2

# 三种等价写法：
A @ B                  # 推荐，Python 3.5+ 语法
np.matmul(A, B)        # 函数形式
np.dot(A, B)           # 旧写法，二维时和 matmul 一样

# 结果都是：
# [[1*5+2*7, 1*6+2*8],
#  [3*5+4*7, 3*6+4*8]]
# = [[19, 22], [43, 50]]
\`\`\`

**陷阱：\`A * B\` 不是矩阵乘法！** 它是逐元素乘法。这是新手最常犯的错误，记不住就背口诀："星号乘是元素乘，at 符号才是矩阵乘"。

矩阵乘法的形状规则：\`(m, n) @ (n, k) = (m, k)\`。中间维度必须匹配，否则报错。这一点在神经网络里就是"前一层输出维度 = 后一层输入维度"。

\`\`\`text
A: (m, n)    B: (n, k)    结果: (m, k)
┌─────┐     ┌─────┐
│     │  ×  │     │  =  ┌─────┐
│  m  │     │  k  │     │ m×k │
│     │     │     │     └─────┘
└─────┘     └─────┘
   n  <---- 必须相等 ---->  n
\`\`\`

## 2.7 矩阵的转置与共轭

\`\`\`python
A = np.array([[1, 2, 3], [4, 5, 6]])  # shape (2, 3)

A.T             # 转置，shape (3, 2)
A.transpose()   # 同上
np.transpose(A) # 同上

# 三维数组的转置可以指定轴顺序
t = np.random.rand(2, 3, 4)
t.transpose(1, 0, 2)  # 把第0和第1轴交换，shape (3, 2, 4)
\`\`\`

转置在神经网络里常用于"批量数据排列变换"，比如把 (batch, height, width, channel) 转成 (batch, channel, height, width) 来配合 PyTorch 的卷积层。

## 2.8 比较运算与逻辑运算

比较运算符也是元素级的，返回布尔数组：

\`\`\`python
a = np.array([1, 2, 3, 4, 5])

a > 3             # [False, False, False, True, True]
a == 3            # [False, False, True, False, False]
a != 3            # [True, True, False, True, True]
(a > 2) & (a < 5) # [False, False, True, True, False]  注意括号和 &
(a < 2) | (a > 4) # [True, False, False, False, True]  注意括号和 |
~(a > 3)          # [True, True, True, False, False]   取反
\`\`\`

注意：**布尔运算用 \`&\`、\`|\`、\`~\`，不能用 \`and\`、\`or\`、\`not\`**，因为后者会试图把整个数组转成单个 bool 值，对长度大于 1 的数组会报错。同时每个条件必须用括号包起来，因为运算符优先级问题。

布尔数组常用于条件筛选，比如 \`a[a > 3]\` 会返回所有大于 3 的元素，这叫"布尔索引"，下一章会详细讲。

## 2.9 数学函数速查

下面是 AI 开发中最常用的数学函数清单：

| 函数 | 用途 | AI 场景 |
| --- | --- | --- |
| np.exp / np.log | 指数 / 对数 | softmax、交叉熵 |
| np.sqrt | 平方根 | L2 范数、RMSProp |
| np.abs | 绝对值 | L1 正则化 |
| np.power | 幂运算 | 注意力缩放 |
| np.maximum / np.minimum | 逐元素最值 | ReLU、clip |
| np.clip(a, lo, hi) | 截断到区间 | 梯度裁剪 |
| np.where(cond, a, b) | 条件选择 | 掩码应用 |
| np.sum / np.mean | 求和 / 平均 | 损失计算 |
| np.linalg.norm | 范数 | 权重衰减、梯度裁剪 |
| np.dot / np.matmul | 矩阵乘法 | 全连接层 |

## 2.10 性能对比：为什么必须用向量化

光说"向量化快"没感觉，我们看一个具体对比——给一百万个数每个加 1：

\`\`\`text
方法 1：Python 列表 + for 循环
  result = []
  for x in lst:
      result.append(x + 1)
  耗时：约 80 ms

方法 2：Python 列表推导
  result = [x + 1 for x in lst]
  耗时：约 50 ms

方法 3：NumPy 向量化
  result = arr + 1
  耗时：约 2 ms

向量化比循环快 25-40 倍。
\`\`\`

这就是为什么 AI 训练里几乎看不到 for 循环——所有循环都被向量化掉了，要么靠 NumPy，要么靠 GPU 上的张量运算。**写 AI 代码的第一原则：能用向量化就不要用循环**。

## 2.11 本章小结

- 算术运算符（+、-、*、/、**）都是元素级，注意 \`*\` 不是矩阵乘。
- ufunc 是逐元素数学函数，支持广播、累积、外积。
- 统计函数是归约运算，axis 参数指定沿哪个轴压缩。
- 矩阵乘法用 \`@\`，形状规则 (m,n)@(n,k)=(m,k)。
- 比较运算返回布尔数组，布尔运算用 \`&\` \`|\` \`~\` 不用 and/or/not。
- 向量化是 NumPy 性能的根源，比 Python 循环快几十倍。

下一章我们学习索引与切片——如何灵活地从大数组中取出需要的部分。
`,
    code: `# ============================================================
# 第2章代码演示：NumPy数组运算（纯 Python 模拟实现）
# ============================================================
# 本沙箱可能未安装 numpy，所以用纯 Python 模拟以下概念：
#   - 元素级算术运算
#   - ufunc 通用函数
#   - 统计函数（sum/mean/max/min 与 axis）
#   - 矩阵乘法
#   - 比较与布尔运算
# ------------------------------------------------------------

import math
import random

# ---- 1. 定义一个支持运算的迷你 ndarray ----
class Arr:
    """支持元素级运算的迷你数组"""

    def __init__(self, data, shape=None):
        # 支持二维嵌套列表
        if isinstance(data, list) and data and isinstance(data[0], list):
            self._data = []
            self._shape = (len(data), len(data[0]))
            for row in data:
                self._data.extend(row)
        else:
            self._data = list(data)
            self._shape = shape or (len(data),)

    @property
    def shape(self):
        return self._shape

    @property
    def ndim(self):
        return len(self._shape)

    @property
    def size(self):
        return len(self._data)

    def to_nested(self):
        """把扁平数据还原成嵌套列表"""
        if self.ndim == 1:
            return list(self._data)
        rows, cols = self._shape
        return [list(self._data[i*cols:(i+1)*cols]) for i in range(rows)]

    def __repr__(self):
        return f"Arr(shape={self._shape}, data={self.to_nested()})"

    # 元素级算术运算
    def _binop(self, other, op):
        if isinstance(other, Arr):
            assert self._shape == other._shape, f"形状不匹配 {self._shape} vs {other._shape}"
            data = [op(a, b) for a, b in zip(self._data, other._data)]
        else:
            data = [op(a, other) for a in self._data]
        result = Arr.__new__(Arr)
        result._data = data
        result._shape = self._shape
        return result

    def __add__(self, other): return self._binop(other, lambda a, b: a + b)
    def __sub__(self, other): return self._binop(other, lambda a, b: a - b)
    def __mul__(self, other): return self._binop(other, lambda a, b: a * b)
    def __truediv__(self, other): return self._binop(other, lambda a, b: a / b)
    def __floordiv__(self, other): return self._binop(other, lambda a, b: a // b)
    def __mod__(self, other): return self._binop(other, lambda a, b: a % b)
    def __pow__(self, other): return self._binop(other, lambda a, b: a ** b)
    def __neg__(self):
        result = Arr.__new__(Arr)
        result._data = [-a for a in self._data]
        result._shape = self._shape
        return result

    # 比较运算
    def __gt__(self, other): return self._binop(other, lambda a, b: a > b)
    def __lt__(self, other): return self._binop(other, lambda a, b: a < b)
    def __ge__(self, other): return self._binop(other, lambda a, b: a >= b)
    def __le__(self, other): return self._binop(other, lambda a, b: a <= b)
    def __eq__(self, other):
        if isinstance(other, Arr):
            data = [a == b for a, b in zip(self._data, other._data)]
        else:
            data = [a == other for a in self._data]
        result = Arr.__new__(Arr)
        result._data = data
        result._shape = self._shape
        return result
    def __ne__(self, other):
        if isinstance(other, Arr):
            data = [a != b for a, b in zip(self._data, other._data)]
        else:
            data = [a != other for a in self._data]
        result = Arr.__new__(Arr)
        result._data = data
        result._shape = self._shape
        return result


# ---- 2. 元素级算术运算 ----
print("========== 1. 元素级算术运算 ==========")
a = Arr([1, 2, 3, 4])
b = Arr([10, 20, 30, 40])
print("a =", a.to_nested())
print("b =", b.to_nested())
print("a + b =", (a + b).to_nested())
print("a - b =", (a - b).to_nested())
print("a * b =", (a * b).to_nested(), "  <-- 逐元素乘，非矩阵乘！")
print("b / a =", [round(x, 2) for x in (b / a).to_nested()])
print("b // a =", (b // a).to_nested())
print("b ** a =", (b ** a).to_nested())

print("\\n标量与数组运算：")
print("a + 100 =", (a + 100).to_nested())
print("a * 2   =", (a * 2).to_nested())
print("-a      =", (-a).to_nested())


# ---- 3. ufunc 通用函数 ----
print("\\n========== 2. ufunc 通用函数 ==========")

def ufunc(arr, fn):
    """对数组的每个元素应用函数 fn"""
    result = Arr.__new__(Arr)
    result._data = [fn(x) for x in arr._data]
    result._shape = arr._shape
    return result

x = Arr([-1, -2, 0, 3, 4])
print("x =", x.to_nested())
print("abs(x)   =", ufunc(x, abs).to_nested())
print("sqrt(|x|)=", ufunc(ufunc(x, abs), math.sqrt).to_nested())
print("square(x)=", ufunc(x, lambda v: v*v).to_nested())
print("exp(x)   =", [round(v, 3) for v in ufunc(x, math.exp).to_nested()])
print("sign(x)  =", ufunc(x, lambda v: (v > 0) - (v < 0)).to_nested())

# 二元 ufunc：maximum
def maximum(a, b):
    if isinstance(b, Arr):
        data = [max(x, y) for x, y in zip(a._data, b._data)]
    else:
        data = [max(x, b) for x in a._data]
    result = Arr.__new__(Arr)
    result._data = data
    result._shape = a._shape
    return result

print("\\n二元 ufunc：")
print("maximum(x, 0) 即 ReLU =", maximum(x, 0).to_nested())

# 模拟 sigmoid：1 / (1 + exp(-x))
def sigmoid(arr):
    return ufunc(arr, lambda v: 1 / (1 + math.exp(-v)))

print("sigmoid(x) =", [round(v, 4) for v in sigmoid(x).to_nested()])


# ---- 4. 统计函数与 axis ----
print("\\n========== 3. 统计函数与 axis ==========")

m = Arr([[1, 2, 3], [4, 5, 6]])
print("矩阵 m =", m.to_nested(), "shape =", m.shape)

# 全部归约
print("\\n--- 全部归约（不指定 axis）---")
print("sum()  =", sum(m._data))
print("mean() =", sum(m._data) / m.size)
print("max()  =", max(m._data))
print("min()  =", min(m._data))
print("prod() =", math.prod(m._data))

# 沿 axis 归约
def sum_axis(arr, axis):
    """沿指定轴求和"""
    if arr.ndim == 1:
        return sum(arr._data)
    rows, cols = arr._shape
    if axis == 0:  # 沿行方向，结果为列和
        result = []
        for j in range(cols):
            col_sum = sum(arr._data[i*cols + j] for i in range(rows))
            result.append(col_sum)
        return Arr(result)
    elif axis == 1:  # 沿列方向，结果为行和
        result = []
        for i in range(rows):
            row_sum = sum(arr._data[i*cols:(i+1)*cols])
            result.append(row_sum)
        return Arr(result)

print("\\n--- 沿 axis 归约 ---")
print("sum(axis=0) 列和 =", sum_axis(m, 0).to_nested(), "  shape:", sum_axis(m, 0).shape)
print("sum(axis=1) 行和 =", sum_axis(m, 1).to_nested(), "  shape:", sum_axis(m, 1).shape)


# ---- 5. 累积运算 ----
print("\\n========== 4. 累积运算 ==========")

def cumsum(arr):
    result = []
    total = 0
    for x in arr._data:
        total += x
        result.append(total)
    return Arr(result)

def cumprod(arr):
    result = []
    total = 1
    for x in arr._data:
        total *= x
        result.append(total)
    return Arr(result)

v = Arr([1, 2, 3, 4])
print("v =", v.to_nested())
print("cumsum(v) =", cumsum(v).to_nested())
print("cumprod(v)=", cumprod(v).to_nested())


# ---- 6. 矩阵乘法 ----
print("\\n========== 5. 矩阵乘法 ==========")

def matmul(A, B):
    """模拟 np.matmul / @ 运算符"""
    assert A.ndim == 2 and B.ndim == 2, "本示例只支持二维矩阵"
    m, n = A._shape
    n2, k = B._shape
    assert n == n2, f"形状不兼容 ({m},{n}) @ ({n2},{k})"
    A_rows = A.to_nested()
    B_rows = B.to_nested()
    result = []
    for i in range(m):
        row = []
        for j in range(k):
            s = sum(A_rows[i][p] * B_rows[p][j] for p in range(n))
            row.append(s)
        result.append(row)
    return Arr(result)

A = Arr([[1, 2], [3, 4]])
B = Arr([[5, 6], [7, 8]])
print("A =", A.to_nested())
print("B =", B.to_nested())
print("A @ B =")
for row in matmul(A, B).to_nested():
    print("  ", row)
print("  注：A * B（逐元素乘）=", (A * B).to_nested(), "完全不同！")

# 非方阵示例
C = Arr([[1, 2, 3], [4, 5, 6]])  # 2×3
D = Arr([[1, 0], [0, 1], [1, 1]])  # 3×2
print("\\nC (2×3) @ D (3×2) =")
for row in matmul(C, D).to_nested():
    print("  ", row)


# ---- 7. 比较与布尔运算 ----
print("\\n========== 6. 比较与布尔运算 ==========")

a = Arr([1, 2, 3, 4, 5])
print("a =", a.to_nested())
print("a > 3      =", (a > 3).to_nested())
print("a == 3     =", (a == 3).to_nested())

# 布尔数组的与或非
def bool_and(a, b):
    data = [x and y for x, y in zip(a._data, b._data)]
    result = Arr.__new__(Arr)
    result._data = data
    result._shape = a._shape
    return result

def bool_or(a, b):
    data = [x or y for x, y in zip(a._data, b._data)]
    result = Arr.__new__(Arr)
    result._data = data
    result._shape = a._shape
    return result

def bool_not(a):
    data = [not x for x in a._data]
    result = Arr.__new__(Arr)
    result._data = data
    result._shape = a._shape
    return result

cond1 = a > 2
cond2 = a < 5
print("(a > 2) & (a < 5) =", bool_and(cond1, cond2).to_nested())
print("(a < 2) | (a > 4) =", bool_or(a < 2, a > 4).to_nested())
print("~(a > 3)          =", bool_not(a > 3).to_nested())

# 布尔索引：用布尔数组筛选元素
def boolean_index(arr, mask):
    """模拟 a[mask]"""
    return Arr([x for x, m in zip(arr._data, mask._data) if m])

print("\\n布尔索引 a[a > 3] =", boolean_index(a, a > 3).to_nested())


# ---- 8. 性能对比：向量化 vs 循环 ----
print("\\n========== 7. 性能对比（小规模演示）==========")
import time

n = 100000
lst = list(range(n))
arr_data = list(range(n))

t1 = time.time()
result_loop = []
for x in lst:
    result_loop.append(x + 1)
t1 = time.time() - t1

t2 = time.time()
result_comp = [x + 1 for x in lst]
t2 = time.time() - t2

t3 = time.time()
result_vec = [x + 1 for x in arr_data]  # 纯 Python 模拟，实际 numpy 会快得多
t3 = time.time() - t3

print(f"for 循环耗时      : {t1*1000:.2f} ms")
print(f"列表推导耗时      : {t2*1000:.2f} ms")
print(f"模拟向量化耗时    : {t3*1000:.2f} ms")
print("（注：真正的 NumPy 向量化在大数组上会比循环快 20-100 倍）")


# ---- 9. 真正的 NumPy 等价代码 ----
print("\\n========== 8. 真正的 NumPy 等价代码 ==========")
print("""# import numpy as np
# a = np.array([1, 2, 3, 4])
# b = np.array([10, 20, 30, 40])
# print(a + b, a * b, b ** a)
#
# m = np.array([[1, 2, 3], [4, 5, 6]])
# print(m.sum(), m.mean(), m.max())
# print(m.sum(axis=0))  # 列和
# print(m.sum(axis=1))  # 行和
#
# A = np.array([[1, 2], [3, 4]])
# B = np.array([[5, 6], [7, 8]])
# print(A @ B)         # 矩阵乘法
# print(A * B)         # 逐元素乘，注意区别！
#
# x = np.array([1, 2, 3, 4, 5])
# print(x[x > 3])      # 布尔索引
""")

print("\\n========== 演示结束 ==========")
`,
  },

  {
    id: "aipy-numpy-index",
    icon: "🎯",
    group: "NumPy科学计算",
    title: "NumPy索引与切片",
    content: `
# 第3章：NumPy索引与切片

## 3.1 索引：从数组里"取东西"的艺术

学完了创建和运算，本章要解决一个看似简单实则微妙的问题：**怎么从大数组里取出我想要的那部分？** NumPy 的索引系统是它最容易让新手踩坑、但也最强大的特性之一。Python 列表只有"基础索引"和"切片"两种方式，而 NumPy 在此基础上扩展出了"花式索引"和"布尔索引"，能够表达极其灵活的取数需求。

先记住一个总原则：**NumPy 索引返回的可能是视图（view）也可能是副本（copy），区分两者是避免 bug 的关键**。视图共享内存，修改视图会影响原数组；副本是独立的，修改副本不影响原数组。本章末尾会专门讲这个区别。

NumPy 索引可以分为四大类：

1. **基础索引（basic indexing）**：用整数或切片取元素。
2. **花式索引（fancy indexing）**：用整数数组或列表取元素。
3. **布尔索引（boolean indexing）**：用布尔数组做掩码筛选。
4. **组合索引**：上述三种混合使用。

## 3.2 基础索引：整数与切片

最朴素的索引方式，和 Python 列表几乎一样。一维数组的索引规则：从 0 开始，负数从末尾倒数。

\`\`\`python
import numpy as np

a = np.array([10, 20, 30, 40, 50])

a[0]      # 10   第一个
a[2]      # 30   第三个
a[-1]     # 50   最后一个
a[-2]     # 40   倒数第二个
\`\`\`

切片语法 \`start:stop:step\`，左闭右开：

\`\`\`python
a[1:4]    # [20, 30, 40]    索引 1 到 3
a[:3]     # [10, 20, 30]    从头到索引 2
a[2:]     # [30, 40, 50]    从索引 2 到末尾
a[::2]    # [10, 30, 50]    步长 2
a[::-1]   # [50, 40, 30, 20, 10]  反转
a[1:4:2]  # [20, 40]        从 1 到 3 步长 2
\`\`\`

二维数组要用逗号分隔每个维度的索引：

\`\`\`python
m = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

m[0, 0]     # 1   第一行第一列
m[1, 2]     # 6   第二行第三列
m[-1, -1]   # 9   最后一行最后一列

# 切片
m[0, :]     # [1, 2, 3]   第一行所有列
m[:, 0]     # [1, 4, 7]   第一列所有行
m[0:2, 0:2] # [[1,2],[4,5]]  左上 2×2 子块
m[::2, ::2] # [[1,3],[7,9]]  隔行隔列
\`\`\`

**关键理解**：\`m[0]\` 和 \`m[0, :]\` 是等价的，都表示"取第 0 行"。NumPy 允许你省略后面的维度，省略的部分默认取全部。所以 \`m[0]\` 取一行，\`m[0:2]\` 取前两行，\`m[0:2, 1:3]\` 取前两行的后两列。

\`\`\`text
矩阵 m:
  [[1, 2, 3],
   [4, 5, 6],
   [7, 8, 9]]

m[0:2, 1:3] 取的是：
  [[2, 3],
   [5, 6]]

行索引 0:2 → 取第 0、1 行
列索引 1:3 → 取第 1、2 列
\`\`\`

## 3.3 切片的视图特性：陷阱与妙用

**NumPy 的基础切片返回的是视图，不是副本**。这是和 Python 列表最大的区别之一——列表切片会复制一份新列表，而 ndarray 切片只是"换一种方式看同一块内存"。

\`\`\`python
a = np.array([1, 2, 3, 4, 5])
b = a[1:4]        # b 是 a 的视图
b[0] = 999
print(a)          # [1, 999, 3, 4, 5]  ← a 也被改了！
\`\`\`

这个特性有两个影响：

**好处**：切片非常快，不复制数据，处理大数组时几乎零开销。

**坏处**：容易在不知情的情况下修改原数组。如果你要的是独立副本，必须显式调用 \`.copy()\`：

\`\`\`python
b = a[1:4].copy()  # 现在修改 b 不会影响 a
\`\`\`

判断是否是视图有个小技巧：看 \`base\` 属性，\`b.base is a\` 为 True 说明 b 是 a 的视图。但更可靠的方法是看 \`b.flags.owndata\`，True 表示拥有数据（独立），False 表示借用数据（视图）。

## 3.4 花式索引：用整数数组取元素

花式索引是指**用整数数组（或列表）作为索引**，可以一次性取出多个不连续的元素。这比基础索引灵活得多。

\`\`\`python
a = np.array([10, 20, 30, 40, 50])

# 用列表索引
indices = [0, 2, 4]
a[indices]            # [10, 30, 50]   取第 0、2、4 个

# 用数组索引
a[np.array([1, 3])]   # [20, 40]

# 重复索引会重复取
a[[0, 0, 1, 1]]       # [10, 10, 20, 20]

# 负数索引也可以
a[[-1, -2]]           # [50, 40]
\`\`\`

二维数组的花式索引更强大，但也更容易混淆。**注意：双花式索引取的是"配对点"而非"子矩阵"**：

\`\`\`python
m = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

# 用两个数组配对取点
rows = [0, 1, 2]
cols = [0, 1, 2]
m[rows, cols]         # [1, 5, 9]  取 (0,0)、(1,1)、(2,2) 对角线

# 不是子矩阵！要子矩阵要用 np.ix_
m[np.ix_([0, 2], [0, 2])]   # [[1,3],[7,9]]  取行 0,2 和列 0,2 的交叉

# 取任意几行
m[[0, 2]]             # [[1,2,3],[7,8,9]]   第 0 行和第 2 行
m[[2, 0, 1]]          # 重新排序：第 2、0、1 行
\`\`\`

**花式索引返回的是副本，不是视图**。这是和基础切片的重要区别——花式索引因为元素位置不连续，无法用单一视图表达，所以总是复制一份新数组。

\`\`\`text
基础切片：m[0:2]    → 视图（共享内存，改了影响原数组）
花式索引：m[[0,2]]  → 副本（独立内存，改了不影响原数组）
\`\`\`

## 3.5 布尔索引：用条件筛选元素

布尔索引是 AI 里最常用的索引方式——根据条件筛选数据。它的语法是：构造一个和原数组形状相同的布尔数组，用它作为索引，返回所有 True 位置的元素。

\`\`\`python
a = np.array([1, 2, 3, 4, 5, 6])

mask = a > 3
# mask = [False, False, False, True, True, True]

a[mask]          # [4, 5, 6]   所有大于 3 的元素
a[a > 3]         # 简写形式，等价于上面两行

# 多条件
a[(a > 2) & (a < 5)]   # [3, 4]
a[(a < 3) | (a > 4)]   # [1, 2, 5, 6]

# 取反
a[~(a > 3)]      # [1, 2, 3]
\`\`\`

二维数组的布尔索引同样适用，但默认会"压平"结果：

\`\`\`python
m = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

m[m > 5]         # [6, 7, 8, 9]   一维数组，所有大于 5 的元素

# 按行筛选
row_mask = np.array([True, False, True])
m[row_mask]      # [[1,2,3],[7,8,9]]   第 0 行和第 2 行
\`\`\`

布尔索引的几个典型 AI 应用：

- **过滤异常值**：\`x = x[x < threshold]\` 去掉大于阈值的样本。
- **按标签取数据**：\`X[y == 2]\` 取出标签为 2 的所有样本。
- **应用 mask**：在注意力机制里，用布尔 mask 屏蔽 padding 位置。
- **统计满足条件的个数**：\`(a > 3).sum()\` 数大于 3 的元素个数。

## 3.6 where 函数：条件选择的三种用法

\`np.where\` 是布尔索引的"升级版"，它有三种用法：

\`\`\`python
# 用法 1：找满足条件的索引
a = np.array([1, 2, 3, 4, 5])
np.where(a > 3)        # (array([3, 4]),)   返回索引元组

# 用法 2：三元选择（最常用）
np.where(a > 3, a, 0)  # [0, 0, 0, 4, 5]   满足条件取 a，否则取 0

# 用法 3：找最大值的位置
np.where(a == a.max()) # (array([4]),)
\`\`\`

用法 2 在 AI 里极常用，比如：

\`\`\`python
# ReLU 的另一种写法
x = np.array([-1, 2, -3, 4])
relu = np.where(x > 0, x, 0)   # [0, 2, 0, 4]

# 梯度裁剪
grad = np.where(np.abs(grad) > 1.0, grad * 1.0 / np.abs(grad), grad)
\`\`\`

## 3.7 组合索引：基础 + 花式 + 布尔

实际开发中常常混用多种索引：

\`\`\`python
m = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]])

# 切片 + 花式索引
m[1:, [0, 2]]      # [[5,7],[9,11]]   第 1 行起，取第 0、2 列

# 布尔 + 切片
mask = np.array([True, False, True])
m[mask, 1:3]       # [[2,3],[10,11]]  第 0、2 行的第 1、2 列

# 整数 + 切片
m[0, ::2]          # [1, 3]  第 0 行步长 2
\`\`\`

组合索引的规则：从左到右，每个维度的索引独立解释。返回的形状取决于所有维度的索引"形状组合"。

## 3.8 赋值与原地修改

索引不仅能取值，也能赋值。赋值时要注意视图与副本的区别：

\`\`\`python
a = np.array([1, 2, 3, 4, 5])

# 切片赋值（视图）—— 影响原数组
a[1:3] = 0
print(a)   # [1, 0, 0, 4, 5]

# 花式索引赋值（副本位置，但赋值会写入原数组）
a[[0, 4]] = 99
print(a)   # [99, 0, 0, 4, 99]

# 布尔索引赋值
a[a == 0] = -1
print(a)   # [99, -1, -1, 4, 99]

# 广播赋值
a[:] = 0    # 全部清零
a[1:3] = [10, 20]  # 用列表赋值
\`\`\`

## 3.9 视图 vs 副本：完整对照表

| 操作 | 返回 | 修改是否影响原数组 |
| --- | --- | --- |
| a[1:4] 切片 | 视图 | 是 |
| a[0] 单个整数 | 标量（副本） | 否 |
| a[[0,2]] 花式索引 | 副本 | 否 |
| a[a>3] 布尔索引 | 副本 | 否 |
| a.reshape(...) | 视图 | 是 |
| a.T 转置 | 视图 | 是 |
| a.copy() | 副本 | 否 |
| a.flatten() | 副本 | 否 |
| a.ravel() | 视图（通常） | 是 |

记住一条经验法则：**只要索引是"连续可表达的"（切片、转置、reshape），就是视图；只要索引是"离散不可表达"的（花式、布尔），就是副本**。

## 3.10 实战案例：数据预处理

下面用一个模拟的数据预处理场景，把本章学的索引技巧串起来：

\`\`\`python
# 模拟一个 batch 的样本：100 个样本，每个 5 维特征
X = np.random.randn(100, 5)
y = np.random.randint(0, 3, 100)  # 3 类标签

# 1. 取出标签为 1 的样本
X_class1 = X[y == 1]

# 2. 取所有样本的前 3 维特征
X_first3 = X[:, :3]

# 3. 找出第 0 维特征绝对值大于 2 的样本索引
outliers = np.where(np.abs(X[:, 0]) > 2)[0]

# 4. 把这些异常样本的第 0 维 clip 到 [-2, 2]
X[outliers, 0] = np.clip(X[outliers, 0], -2, 2)

# 5. 打乱样本顺序
idx = np.random.permutation(100)
X_shuffled = X[idx]
y_shuffled = y[idx]

# 6. 划分训练集和测试集
X_train, X_test = X_shuffled[:80], X_shuffled[80:]
y_train, y_test = y_shuffled[:80], y_shuffled[80:]
\`\`\`

这段代码用到了布尔索引、切片、where、花式索引、clip、permutation，几乎覆盖了所有常见索引操作。

## 3.11 本章小结

- 基础索引：整数和切片，二维用逗号分隔。
- 切片返回视图（共享内存），花式和布尔索引返回副本。
- 花式索引用整数列表/数组，注意二维配对取点是"配对"而非"子矩阵"。
- 布尔索引用条件筛选，是 AI 里最高频的索引方式。
- np.where 三种用法：找索引、三元选择、找极值位置。
- 视图 vs 副本是 NumPy 的核心陷阱，要养成 .copy() 的习惯。

下一章我们学习广播机制——它能让不同形状的数组也能一起运算，是 NumPy 最巧妙的设计之一。
`,
    code: `# ============================================================
# 第3章代码演示：NumPy索引与切片（纯 Python 模拟）
# ============================================================
# 用纯 Python 模拟：
#   - 基础索引与切片
#   - 花式索引（整数数组索引）
#   - 布尔索引
#   - np.where 的三元选择
#   - 视图 vs 副本的区别
# ------------------------------------------------------------

import copy

# ---- 1. 基础索引与切片（一维）----
print("========== 1. 一维基础索引与切片 ==========")

a = [10, 20, 30, 40, 50]
print("a =", a)
print("a[0]   =", a[0], "  a[-1] =", a[-1])
print("a[1:4] =", a[1:4], "  ← 左闭右开")
print("a[:3]  =", a[:3])
print("a[2:]  =", a[2:])
print("a[::2] =", a[::2], "  ← 步长 2")
print("a[::-1]=", a[::-1], "  ← 反转")
print("a[1:4:2]=", a[1:4:2])


# ---- 2. 二维基础索引与切片 ----
print("\\n========== 2. 二维基础索引与切片 ==========")

m = [[1, 2, 3],
     [4, 5, 6],
     [7, 8, 9]]

def matrix_get(M, row_slice, col_slice):
    """模拟 m[row_slice, col_slice]"""
    rows = M[row_slice] if isinstance(row_slice, int) else M[row_slice]
    if isinstance(row_slice, int):
        rows = [rows]
    if isinstance(col_slice, int):
        return [r[col_slice] for r in rows]
    else:
        return [r[col_slice] for r in rows]

print("矩阵 m =")
for row in m: print("  ", row)

print("m[0]       =", m[0], "  ← 第 0 行")
print("m[1][2]    =", m[1][2], "  ← 第 1 行第 2 列")
print("m[0:2]     =", m[0:2], "  ← 前 2 行")
print("m[0:2] 取列 1:3 =")
for row in m[0:2]:
    print("  ", row[1:3])


# ---- 3. 切片的视图特性 ----
print("\\n========== 3. 切片是视图（共享内存）==========")

# Python 列表切片是副本，但 NumPy 切片是视图
# 这里演示 NumPy 的行为（用自定义类模拟）
class NumpyLikeList:
    """模拟 NumPy 切片返回视图的行为"""

    def __init__(self, data):
        self._data = data

    def __getitem__(self, key):
        if isinstance(key, slice):
            # 返回视图：共享底层数据
            return NumpyLikeView(self._data, key)
        return self._data[key]

    def __setitem__(self, key, value):
        self._data[key] = value

    def __repr__(self):
        return f"NdArray({self._data})"

class NumpyLikeView:
    """切片视图：共享原始数据"""

    def __init__(self, data, slc):
        self._data = data  # 引用原数据，不复制
        self._slc = slc
        self._indices = list(range(*slc.indices(len(data))))

    def __getitem__(self, idx):
        return self._data[self._indices[idx]]

    def __setitem__(self, idx, value):
        # 修改视图会修改原数据！
        self._data[self._indices[idx]] = value

    def __repr__(self):
        return f"View({[self._data[i] for i in self._indices]})"

arr = NumpyLikeList([1, 2, 3, 4, 5])
view = arr[1:4]    # 视图
print("原数组 arr =", arr)
print("切片 arr[1:4] =", view)
print("修改视图 view[0] = 999")
view[0] = 999
print("原数组 arr 现在是 =", arr, "  ← 被影响了！")
print("若要独立副本，需要显式 copy。")


# ---- 4. 花式索引 ----
print("\\n========== 4. 花式索引（整数数组索引）==========")

def fancy_index(lst, indices):
    """模拟 a[[0, 2, 4]]"""
    return [lst[i] for i in indices]

a = [10, 20, 30, 40, 50]
print("a =", a)
print("a[[0, 2, 4]] =", fancy_index(a, [0, 2, 4]))
print("a[[0, 0, 1]] =", fancy_index(a, [0, 0, 1]), "  ← 重复索引")
print("a[[-1, -2]]  =", fancy_index(a, [-1, -2]), "  ← 负数索引")

# 二维花式索引：配对取点
def fancy_2d(M, rows, cols):
    """模拟 m[rows, cols]：配对取点，不是子矩阵"""
    return [M[r][c] for r, c in zip(rows, cols)]

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print("\\n矩阵 m =")
for row in m: print("  ", row)
print("m[[0,1,2],[0,1,2]] =", fancy_2d(m, [0,1,2], [0,1,2]), "  ← 对角线")
print("m[[0,2],[1,2]]     =", fancy_2d(m, [0,2], [1,2]), "  ← 取 (0,1) 和 (2,2)")

# 取整行
def fancy_rows(M, rows):
    return [M[r] for r in rows]

print("m[[0, 2]]    =", fancy_rows(m, [0, 2]), "  ← 第 0、2 行")
print("m[[2, 0, 1]] =", fancy_rows(m, [2, 0, 1]), "  ← 重排序")


# ---- 5. 布尔索引 ----
print("\\n========== 5. 布尔索引 ==========")

def boolean_index(lst, mask):
    """模拟 a[mask]：用布尔列表筛选"""
    return [x for x, m in zip(lst, mask) if m]

a = [1, 2, 3, 4, 5, 6]
print("a =", a)

mask = [x > 3 for x in a]
print("mask (a > 3) =", mask)
print("a[a > 3]     =", boolean_index(a, mask))

# 多条件
mask_and = [(x > 2) and (x < 5) for x in a]
print("a[(a>2)&(a<5)] =", boolean_index(a, mask_and))

mask_or = [(x < 3) or (x > 4) for x in a]
print("a[(a<3)|(a>4)] =", boolean_index(a, mask_or))

# 二维布尔索引
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in m for x in row]
mask = [x > 5 for x in flat]
print("\\n矩阵 m 中 > 5 的元素：", boolean_index(flat, mask))

# 按行筛选
row_mask = [True, False, True]
print("按行筛选 m[[True,False,True]] =")
for i, keep in enumerate(row_mask):
    if keep:
        print("  ", m[i])


# ---- 6. np.where 三元选择 ----
print("\\n========== 6. np.where 三元选择 ==========")

def where(condition, x_vals, y_vals):
    """模拟 np.where(cond, x, y)"""
    result = []
    for i, c in enumerate(condition):
        if c:
            result.append(x_vals[i] if hasattr(x_vals, '__getitem__') else x_vals)
        else:
            result.append(y_vals[i] if hasattr(y_vals, '__getitem__') else y_vals)
    return result

x = [-1, 2, -3, 4, -5]
cond = [v > 0 for v in x]
print("x =", x)
print("where(x>0, x, 0) 即 ReLU =", where(cond, x, 0))

# 找满足条件的索引
def where_index(condition):
    """模拟 np.where(cond) 返回索引"""
    return [i for i, c in enumerate(condition) if c]

print("where(x>0) 索引 =", where_index(cond))


# ---- 7. 索引赋值 ----
print("\\n========== 7. 索引赋值 ==========")

a = [1, 2, 3, 4, 5]
print("初始 a =", a)

# 切片赋值
a[1:3] = [0, 0]
print("a[1:3] = [0,0]  →", a)

# 花式索引赋值
for i in [0, 4]:
    a[i] = 99
print("a[[0,4]] = 99   →", a)

# 布尔索引赋值
for i, v in enumerate(a):
    if v == 0:
        a[i] = -1
print("a[a==0] = -1    →", a)


# ---- 8. 视图 vs 副本对照 ----
print("\\n========== 8. 视图 vs 副本对照 ==========")

print("""操作              | 返回类型 | 修改是否影响原数组
------------------|---------|------------------
a[1:4] 切片        | 视图     | 是
a[0] 单个整数      | 标量副本 | 否
a[[0,2]] 花式索引  | 副本     | 否
a[a>3] 布尔索引    | 副本     | 否
a.reshape(...)     | 视图     | 是
a.T 转置           | 视图     | 是
a.copy()           | 副本     | 否
a.flatten()        | 副本     | 否
""")

# 演示：花式索引返回副本
original = [10, 20, 30, 40, 50]
fancy_result = fancy_index(original, [0, 2, 4])
print("原数组 =", original)
print("花式索引 a[[0,2,4]] =", fancy_result, "  ← 这是副本")
fancy_result[0] = 999
print("修改副本后 fancy_result[0]=999 =", fancy_result)
print("原数组不受影响 =", original)


# ---- 9. 真正的 NumPy 等价代码 ----
print("\\n========== 9. 真正的 NumPy 等价代码 ==========")
print("""# import numpy as np
# a = np.array([10, 20, 30, 40, 50])
# print(a[1:4])           # 切片
# print(a[[0, 2, 4]])     # 花式索引
# print(a[a > 30])        # 布尔索引
# print(np.where(a > 30, a, 0))  # 三元选择
#
# m = np.array([[1,2,3],[4,5,6],[7,8,9]])
# print(m[0:2, 1:3])      # 二维切片
# print(m[[0, 2]])        # 取整行
# print(m[m > 5])         # 二维布尔索引
#
# # 视图 vs 副本
# v = a[1:4]              # 视图
# v[0] = 999              # 会改 a
# c = a[1:4].copy()       # 副本
# c[0] = 0                # 不影响 a
""")

print("\\n========== 演示结束 ==========")
`,
  },

  {
    id: "aipy-numpy-broadcast",
    icon: "📡",
    group: "NumPy科学计算",
    title: "NumPy广播机制",
    content: `
# 第4章：NumPy广播机制

## 4.1 什么是广播，为什么需要它

在上一章我们学过，两个数组做算术运算时形状必须相同。但实际开发中常常遇到"一个大数据一个小数据"的场景：给一张图片的每个像素加一个偏置、给一个 batch 的每个样本减去均值、把一个权重向量加到矩阵的每一行……如果非要手工把小数据"复制"成和大数据一样的形状再相加，既啰嗦又浪费内存。

广播（broadcasting）就是 NumPy 解决这个问题的优雅方案：**当两个数组的形状不同时，自动把小数组"虚拟扩展"成大数组的形状，然后做元素级运算**。注意是"虚拟"扩展——不真的复制数据，只是改变运算时的访问方式，所以既优雅又高效。

一个最简单的例子：

\`\`\`python
import numpy as np

a = np.array([1, 2, 3, 4])   # shape (4,)
b = 10                        # 标量，可以看作 shape ()

a + b    # [11, 12, 13, 14]   标量 b 被"广播"到每个位置
\`\`\`

这里 \`b\` 被自动扩展成了 \`[10, 10, 10, 10]\` 再和 \`a\` 相加。当然 NumPy 没有真的构造这个数组，只是在内部循环里把 b 当成"每个位置都一样"来处理。

广播不仅适用于标量，还适用于任意形状的数组，只要满足下面要讲的"广播规则"。

## 4.2 广播的三条规则

NumPy 决定两个数组能不能广播、怎么广播，遵循三条简单规则：

**规则 1：维度数不同时，在左侧补 1**

如果两个数组的 ndim 不同，把维度数少的那个在**左边**（即最高维）补长度为 1 的维度，直到两者维度数相同。

\`\`\`text
A: shape (3, 4)        ndim 2
B: shape (4,)          ndim 1  → 左补 1 变成 (1, 4)
对齐后: A (3, 4)  vs  B (1, 4)
\`\`\`

**规则 2：某维度长度为 1 时，沿该维度"复制"**

对齐维度数后，逐个维度比较长度。如果某个维度上两个数组长度不同，但其中一个长度为 1，那么长度为 1 的那个会被"虚拟复制"成另一个的长度。

\`\`\`text
A: (3, 4)
B: (1, 4)   ← 第 0 维长度 1，会被复制成 3
结果: (3, 4)
\`\`\`

**规则 3：其他情况报错**

如果某个维度上两个数组长度既不相等、也不为 1，直接报错 ValueError: operands could not be broadcast together。

\`\`\`text
A: (3, 4)
B: (3, 5)   ← 第 1 维 4 vs 5，都不为 1，报错！
\`\`\`

最终结果的形状是每个维度取两个数组长度的最大值。

\`\`\`text
A: (3, 1, 5)
B: (1, 4, 5)
结果形状: 第0维 max(3,1)=3，第1维 max(1,4)=4，第2维 max(5,5)=5
       = (3, 4, 5)
\`\`\`

## 4.3 广播的具体例子

把规则套到几个典型例子上看：

**例子 1：矩阵 + 行向量**

\`\`\`python
A = np.array([[1, 2, 3],        # shape (2, 3)
              [4, 5, 6]])
b = np.array([10, 20, 30])      # shape (3,)

A + b   # shape (2, 3)
# b 左补 1 → (1, 3) → 第 0 维复制 → (2, 3)
# 结果：
# [[11, 22, 33],
#  [14, 25, 36]]
\`\`\`

**例子 2：矩阵 + 列向量**

\`\`\`python
A = np.array([[1, 2, 3],        # shape (2, 3)
              [4, 5, 6]])
c = np.array([[100],            # shape (2, 1)
              [200]])

A + c   # shape (2, 3)
# c 第 1 维长度 1 → 复制成 3
# 结果：
# [[101, 102, 103],
#  [204, 205, 206]]
\`\`\`

注意 \`c\` 必须是 (2, 1) 的列向量，不能写成 (2,) 的一维数组。这两者形状不同，广播行为也不同——这是新手最常踩的坑。

**例子 3：行向量 + 列向量 = 矩阵**

\`\`\`python
row = np.array([0, 1, 2])       # shape (1, 3)  ← 注意要二维
col = np.array([[0], [1], [2]]) # shape (3, 1)

row + col   # shape (3, 3)
# 结果：
# [[0, 1, 2],
#  [1, 2, 3],
#  [2, 3, 4]]
\`\`\`

这个技巧可以用来生成网格、做外积、计算距离矩阵。

**例子 4：三维 + 二维**

\`\`\`python
A = np.random.rand(4, 3, 2)   # shape (4, 3, 2)
B = np.random.rand(3, 2)      # shape (3, 2)

A + B   # shape (4, 3, 2)
# B 左补 1 → (1, 3, 2) → 第 0 维复制 4 次 → (4, 3, 2)
\`\`\`

这在批量处理时很常见：A 是一个 batch，B 是单个样本的某种变换。

## 4.4 广播的内存效率

广播最大的魅力是"虚拟扩展"——它不真的复制数据。看一个对比：

\`\`\`python
# 不用广播：手工复制
A = np.random.rand(1000, 1000)
b = np.random.rand(1000)
B_explicit = np.tile(b, (1000, 1))   # 真的复制成 1000×1000，占 8MB
result = A + B_explicit               # 临时数组 8MB，峰值 16MB

# 用广播：自动扩展
result = A + b                         # 不创建 1000×1000 的中间数组
                                       # 峰值内存只有 8MB
\`\`\`

在大数组上，避免创建中间数组能显著降低内存峰值，对 GPU 训练尤其重要——显存溢出是常见崩溃原因。

## 4.5 广播的典型 AI 应用场景

广播不是炫技，它在 AI 开发里有大量实战场景：

### 场景 1：批量归一化的均值减法

\`\`\`python
# X shape: (batch_size, features) = (32, 768)
# mean shape: (768,)
X_normalized = X - X.mean(axis=0)   # 减去每列的均值
\`\`\`

这里 \`X.mean(axis=0)\` 形状是 (768,)，被广播到 (32, 768) 与 X 相减。

### 场景 2：偏置项加法

\`\`\`python
# 全连接层：Y = X @ W + b
# X shape: (batch, in_features) = (32, 768)
# W shape: (in_features, out_features) = (768, 10)
# b shape: (out_features,) = (10,)
Y = X @ W + b   # (32, 10) + (10,) → 广播成 (32, 10)
\`\`\`

每个样本都加上同一个偏置向量 b，靠广播自动完成。

### 场景 3：距离矩阵计算

\`\`\`python
# 计算两组点之间的欧氏距离
# P shape: (N, D), Q shape: (M, D)
# 结果 dist[i, j] = ||P[i] - Q[j]||

# 利用广播避免循环：
diff = P[:, None, :] - Q[None, :, :]   # shape (N, M, D)
dist = np.sqrt((diff ** 2).sum(axis=2))  # shape (N, M)
\`\`\`

这里 \`P[:, None, :]\` 把 (N, D) 变成 (N, 1, D)，\`Q[None, :, :]\` 把 (M, D) 变成 (1, M, D)，相减时广播成 (N, M, D)。这是 NumPy 的经典技巧。

### 场景 4：注意力分数缩放

\`\`\`python
# attention shape: (batch, heads, seq_len, seq_len)
# scale 是标量
attention = attention / math.sqrt(d_k)   # 标量广播
\`\`\`

### 场景 5：图像通道处理

\`\`\`python
# image shape: (H, W, 3)  RGB 图像
# 调整每个通道的亮度
brightness = np.array([1.2, 1.0, 0.8])   # shape (3,)
adjusted = image * brightness   # (H, W, 3) * (3,) → 广播
\`\`\`

## 4.6 广播陷阱：形状不匹配的隐蔽 bug

广播虽然方便，但也会让一些本应报错的 bug 静默通过，产生错误结果。最常见的陷阱：

**陷阱 1：(n,) 和 (n, 1) 的混淆**

\`\`\`python
a = np.array([1, 2, 3])        # shape (3,)
b = np.array([[1], [2], [3]])  # shape (3, 1)

a + b   # 结果 shape (3, 3)！不是 (3,)
# a 被广播成 (1, 3)，b 是 (3, 1)，结果 (3, 3)
\`\`\`

这通常不是你想要的。如果你想要逐元素相加，必须保证形状一致，或者用 reshape 显式对齐。

**陷阱 2：意外的广播让结果维度翻倍**

\`\`\`python
mean = X.mean(axis=1)   # shape (batch,) 而非 (batch, 1)
X - mean                # 报错或得到错误结果
\`\`\`

正确做法是 \`mean = X.mean(axis=1, keepdims=True)\`，保留维度 (batch, 1)，这样广播才正确。**keepdims=True 是处理这类问题的关键参数**。

**陷阱 3：广播掩盖了逻辑错误**

\`\`\`python
# 想算每行的和，但写错了 axis
wrong_sum = X + X.sum(axis=0)   # 加的是列和，不是行和
# 由于形状能广播通过，不报错，但结果完全错误
\`\`\`

广播不会检查你的"意图"是否正确，只检查形状是否兼容。所以**写完广播代码后，一定要 print 一下中间结果的 shape**，确认逻辑无误。

## 4.7 调试广播的实用技巧

1. **print shape**：写完一段运算后，打印每个变量的 shape，确认是否符合预期。
2. **用 np.broadcast_to 显式扩展**：\`b_explicit = np.broadcast_to(b, A.shape)\` 可以看到广播后的形状，且不复制数据。
3. **用 np.broadcast_arrays 查看对齐后的形状**：\`np.broadcast_arrays(A, b)\` 返回对齐后的数组列表。
4. **善用 keepdims**：归约运算后保留维度，避免形状错位。
5. **用 reshape 强制对齐**：\`b.reshape(-1, 1)\` 把 (n,) 变成 (n, 1)，意图更明确。

## 4.8 广播规则的等价表述

有些教程用"从右往左对齐"的方式描述广播，等价于上面的规则 1+2：

\`\`\`text
A shape:    (4, 3, 2)
B shape:       (3, 2)
对齐：      (4, 3, 2)
               (3, 2)  ← 左侧隐式补 1
            (1, 3, 2)
逐维比较：   4 vs 1 → 4
             3 vs 3 → 3
             2 vs 2 → 2
结果形状:    (4, 3, 2)
\`\`\`

从最右边的维度开始对齐，往左逐维比较。每一维要么相等、要么其中一个是 1、要么报错。这种表述更直观，建议记住。

## 4.9 广播 vs 显式循环的性能对比

广播不仅写法简洁，性能也更好。看一个例子：给一个 1000×1000 的矩阵每行加上不同的偏置。

\`\`\`text
方法 1：双层 for 循环
  for i in range(1000):
      for j in range(1000):
          M[i, j] += bias[i]
  耗时：约 500 ms

方法 2：用 reshape + 广播
  M += bias.reshape(-1, 1)   # (1000,1) 广播到 (1000,1000)
  耗时：约 2 ms

广播快 250 倍。
\`\`\`

记住：**只要发现自己在写 ndarray 的 for 循环，先想想能不能用广播替代**。

## 4.10 本章小结

- 广播让不同形状的数组能做元素级运算，自动"虚拟扩展"小数组。
- 三条规则：左补 1 对齐维度、长度 1 的维度可复制、其他报错。
- 广播不复制数据，内存高效。
- AI 典型场景：批量归一化、偏置加法、距离矩阵、注意力缩放。
- 陷阱：(n,) vs (n,1)、keepdims 缺失、广播掩盖逻辑错误。
- 调试技巧：print shape、broadcast_to、keepdims=True、reshape 对齐。

下一章我们进入线性代数——矩阵乘法、行列式、逆矩阵、特征值、SVD，这些是机器学习算法的数学根基。
`,
    code: `# ============================================================
# 第4章代码演示：NumPy广播机制（纯 Python 模拟）
# ============================================================
# 用纯 Python 演示：
#   - 广播的三条规则
#   - 矩阵 + 行向量 / 列向量
#   - 行向量 + 列向量 = 矩阵
#   - 三维 + 二维
#   - 广播的 AI 应用场景（归一化、偏置加法、距离矩阵）
#   - 常见陷阱：(n,) vs (n,1)
# ------------------------------------------------------------

# ---- 1. 获取形状的工具 ----
def get_shape(data):
    """推断嵌套列表的形状"""
    shape = []
    cur = data
    while isinstance(cur, list):
        shape.append(len(cur))
        cur = cur[0] if len(cur) > 0 else None
    return tuple(shape)

def flatten(data):
    """把嵌套列表拍平"""
    out = []
    if isinstance(data, list):
        for x in data:
            out.extend(flatten(x))
    else:
        out.append(data)
    return out

def to_nested(flat_data, shape):
    """把扁平数据按 shape 还原成嵌套"""
    if len(shape) == 0:
        return flat_data[0]
    if len(shape) == 1:
        return list(flat_data)
    size = shape[0]
    sub = shape[1:]
    sub_len = 1
    for s in sub:
        sub_len *= s
    return [to_nested(flat_data[i*sub_len:(i+1)*sub_len], sub) for i in range(size)]


# ---- 2. 广播函数：核心实现 ----
def broadcast_shapes(shape1, shape2):
    """计算两个形状广播后的结果形状，遵循 NumPy 规则"""
    # 规则 1：左补 1 对齐维度
    n1, n2 = len(shape1), len(shape2)
    if n1 < n2:
        shape1 = (1,) * (n2 - n1) + tuple(shape1)
    elif n2 < n1:
        shape2 = (1,) * (n1 - n2) + tuple(shape2)

    # 规则 2 & 3：逐维比较
    result = []
    for d1, d2 in zip(shape1, shape2):
        if d1 == d2:
            result.append(d1)
        elif d1 == 1:
            result.append(d2)
        elif d2 == 1:
            result.append(d1)
        else:
            raise ValueError(
                f"形状无法广播: {shape1} vs {shape2} (维度 {d1} vs {d2})"
            )
    return tuple(result)

def broadcast_to(data, target_shape):
    """把 data 广播到 target_shape，返回新列表（真实复制，模拟虚拟扩展）"""
    src_shape = get_shape(data)
    src_flat = flatten(data)

    # 左补 1 对齐
    n1, n2 = len(src_shape), len(target_shape)
    if n1 < n2:
        src_shape = (1,) * (n2 - n1) + tuple(src_shape)

    # 计算每个目标位置对应的源位置
    result = []
    for idx in range(_prod(target_shape)):
        # 把 idx 解析成 target_shape 下的多维坐标
        coords = _unravel(idx, target_shape)
        # 映射到 src_shape 下的坐标（长度 1 的维度取 0）
        src_coords = tuple(0 if s == 1 else c for s, c in zip(src_shape, coords))
        # 计算源扁平索引
        src_idx = _ravel(src_coords, src_shape)
        result.append(src_flat[src_idx])
    return result

def _prod(shape):
    p = 1
    for s in shape:
        p *= s
    return p

def _unravel(idx, shape):
    """扁平索引 → 多维坐标"""
    coords = []
    for s in reversed(shape):
        coords.append(idx % s)
        idx //= s
    return tuple(reversed(coords))

def _ravel(coords, shape):
    """多维坐标 → 扁平索引"""
    idx = 0
    for c, s in zip(coords, shape):
        idx = idx * s + c
    return idx


# ---- 3. 支持广播的二元运算 ----
def broadcast_binop(a, b, op, op_name="op"):
    """对 a 和 b 做广播二元运算"""
    shape_a = get_shape(a)
    shape_b = get_shape(b)
    try:
        result_shape = broadcast_shapes(shape_a, shape_b)
    except ValueError as e:
        print(f"  广播失败: {e}")
        return None

    flat_a = broadcast_to(a, result_shape)
    flat_b = broadcast_to(b, result_shape)
    result_flat = [op(x, y) for x, y in zip(flat_a, flat_b)]
    return to_nested(result_flat, result_shape), result_shape


# ---- 4. 演示广播规则 ----
print("========== 1. 广播形状计算 ==========")
test_cases = [
    ((3, 4), (4,)),           # 行向量加到矩阵
    ((2, 3), (2, 1)),         # 列向量加到矩阵
    ((1, 3), (3, 1)),         # 行向量 + 列向量
    ((4, 3, 2), (3, 2)),      # 三维 + 二维
    ((3,), (3,)),             # 同形状
    ((), (3, 4)),             # 标量 + 矩阵
    ((3, 4), (3, 5)),         # 应该报错
]
for sa, sb in test_cases:
    print(f"  {sa} + {sb} →", end=" ")
    try:
        result = broadcast_shapes(sa, sb)
        print(f"{result}")
    except ValueError as e:
        print(f"报错（{e}）")


# ---- 5. 矩阵 + 行向量 ----
print("\\n========== 2. 矩阵 + 行向量 ==========")
A = [[1, 2, 3],
     [4, 5, 6]]
b = [10, 20, 30]
print(f"A shape = {get_shape(A)}, b shape = {get_shape(b)}")
result, shape = broadcast_binop(A, b, lambda x, y: x + y, "+")
print(f"结果 shape = {shape}")
for row in result:
    print("  ", row)


# ---- 6. 矩阵 + 列向量 ----
print("\\n========== 3. 矩阵 + 列向量 ==========")
A = [[1, 2, 3],
     [4, 5, 6]]
c = [[100],
     [200]]
print(f"A shape = {get_shape(A)}, c shape = {get_shape(c)}")
result, shape = broadcast_binop(A, c, lambda x, y: x + y, "+")
print(f"结果 shape = {shape}")
for row in result:
    print("  ", row)


# ---- 7. 行向量 + 列向量 = 矩阵 ----
print("\\n========== 4. 行向量 + 列向量 = 矩阵 ==========")
row = [[0, 1, 2]]       # shape (1, 3)
col = [[0], [1], [2]]   # shape (3, 1)
print(f"row shape = {get_shape(row)}, col shape = {get_shape(col)}")
result, shape = broadcast_binop(row, col, lambda x, y: x + y, "+")
print(f"结果 shape = {shape}  ← 生成 3×3 矩阵！")
for r in result:
    print("  ", r)


# ---- 8. 标量广播 ----
print("\\n========== 5. 标量广播 ==========")
A = [[1, 2, 3], [4, 5, 6]]
scalar = 10
print(f"A + 标量 {scalar}:")
# 标量可以视为 shape ()
result, shape = broadcast_binop(A, [[scalar]], lambda x, y: x + y, "+")
for r in result:
    print("  ", r)


# ---- 9. AI 应用：批量归一化 ----
print("\\n========== 6. AI 应用：批量归一化 ==========")
# 模拟 4 个样本，每个 3 维特征
X = [[1.0, 2.0, 3.0],
     [4.0, 5.0, 6.0],
     [7.0, 8.0, 9.0],
     [10.0, 11.0, 12.0]]
print("原始 X:")
for row in X: print("  ", row)

# 计算每列的均值（沿 axis=0 归约）
cols = len(X[0])
mean = [sum(X[i][j] for i in range(len(X))) / len(X) for j in range(cols)]
print(f"\\n每列均值 (shape {get_shape(mean)}):", [round(m, 2) for m in mean])

# X - mean：利用广播，mean 被扩展到每行
result, _ = broadcast_binop(X, mean, lambda x, y: x - y, "-")
print("X - mean（中心化后）:")
for r in result:
    print("  ", [round(v, 2) for v in r])


# ---- 10. AI 应用：偏置加法 ----
print("\\n========== 7. AI 应用：偏置加法 Y = X @ W + b ==========")
# 模拟全连接层输出 + 偏置
Y = [[1.0, 2.0, 3.0],
     [4.0, 5.0, 6.0]]   # shape (2, 3)  2 个样本，3 个输出
b = [0.1, 0.2, 0.3]     # shape (3,)    每个输出的偏置
print(f"Y shape = {get_shape(Y)}, b shape = {get_shape(b)}")
result, _ = broadcast_binop(Y, b, lambda x, y: x + y, "+")
print("Y + b（每个样本都加上同一个偏置）:")
for r in result:
    print("  ", [round(v, 2) for v in r])


# ---- 11. AI 应用：距离矩阵 ----
print("\\n========== 8. AI 应用：距离矩阵 ==========")
# 计算 N 个点到 M 个点的欧氏距离
P = [[0, 0], [1, 1], [2, 2]]   # 3 个点
Q = [[0, 0], [1, 0]]           # 2 个点
print(f"P (3 个点): {P}")
print(f"Q (2 个点): {Q}")

# 利用广播：P[:, None, :] - Q[None, :, :]
# P shape (3, 2) → (3, 1, 2)
# Q shape (2, 2) → (1, 2, 2)
# 广播后 (3, 2, 2)
import math
dist = [[0.0] * len(Q) for _ in range(len(P))]
for i in range(len(P)):
    for j in range(len(Q)):
        d = math.sqrt(sum((P[i][k] - Q[j][k])**2 for k in range(len(P[0]))))
        dist[i][j] = round(d, 3)
print("距离矩阵 (3×2):")
for row in dist:
    print("  ", row)
print("（NumPy 真实代码用 P[:, None, :] - Q[None, :, :] 一行搞定）")


# ---- 12. 陷阱演示：(n,) vs (n, 1) ----
print("\\n========== 9. 陷阱：(n,) vs (n, 1) ==========")
a = [1, 2, 3]            # shape (3,)
b = [[1], [2], [3]]      # shape (3, 1)
print(f"a shape = {get_shape(a)}, b shape = {get_shape(b)}")
result, shape = broadcast_binop(a, b, lambda x, y: x + y, "+")
print(f"a + b 结果 shape = {shape}  ← 注意是 (3, 3) 不是 (3,)！")
for r in result:
    print("  ", r)
print("这通常不是你想要的，要逐元素相加必须保证形状一致。")


# ---- 13. keepdims 的重要性 ----
print("\\n========== 10. keepdims 的重要性 ==========")
X = [[1.0, 2.0, 3.0],
     [4.0, 5.0, 6.0]]
print("X shape = (2, 3)")

# 不 keepdims：沿 axis=1 求和 → shape (2,)
row_sum = [sum(row) for row in X]
print(f"X.sum(axis=1) shape = {get_shape(row_sum)}: {row_sum}")

# 想每行减去自己的和：X - row_sum 会怎样？
print("\\n尝试 X - row_sum（不带 keepdims）:")
result, shape = broadcast_binop(X, row_sum, lambda x, y: x - y, "-")
if result is not None:
    print(f"  结果 shape = {shape}  ← 形状不对！")
    for r in result:
        print("  ", [round(v, 2) for v in r])

# 正确做法：keepdims=True，让 row_sum 变成 (2, 1)
row_sum_keepdims = [[s] for s in row_sum]
print(f"\\n用 keepdims 后 row_sum shape = {get_shape(row_sum_keepdims)}")
result, shape = broadcast_binop(X, row_sum_keepdims, lambda x, y: x - y, "-")
print(f"  X - row_sum 结果 shape = {shape}  ← 正确！")
for r in result:
    print("  ", [round(v, 2) for v in r])


# ---- 14. 真正的 NumPy 等价代码 ----
print("\\n========== 11. 真正的 NumPy 等价代码 ==========")
print("""# import numpy as np
# A = np.array([[1, 2, 3], [4, 5, 6]])
# b = np.array([10, 20, 30])
# print(A + b)               # 矩阵 + 行向量
#
# c = np.array([[100], [200]])
# print(A + c)               # 矩阵 + 列向量
#
# row = np.array([[0, 1, 2]])
# col = np.array([[0], [1], [2]])
# print(row + col)           # (1,3) + (3,1) → (3,3)
#
# # 归一化
# X = np.random.randn(32, 768)
# X_norm = X - X.mean(axis=0)            # 减列均值
# X_norm = X - X.mean(axis=1, keepdims=True)  # 减行均值
#
# # 距离矩阵
# P = np.random.rand(3, 2)
# Q = np.random.rand(2, 2)
# diff = P[:, None, :] - Q[None, :, :]   # (3, 2, 2)
# dist = np.sqrt((diff ** 2).sum(axis=2))
#
# # 陷阱
# a = np.array([1, 2, 3])        # (3,)
# b = np.array([[1], [2], [3]])  # (3, 1)
# print(a + b)                   # 结果是 (3, 3)
""")

print("\\n========== 演示结束 ==========")
`,
  },

  {
    id: "aipy-numpy-linalg",
    icon: "📐",
    group: "NumPy科学计算",
    title: "NumPy线性代数",
    content: `
# 第5章：NumPy线性代数

## 5.1 为什么 AI 程序员必须懂线性代数

如果只能选一门数学课来学，AI 程序员毫无疑问应该选线性代数。原因很简单：**深度学习几乎所有的计算本质上都是矩阵运算**。神经网络的每一层，本质上就是把输入向量乘以权重矩阵、加上偏置、过激活函数；卷积运算可以重排成 im2col 后的矩阵乘法；注意力机制的核心就是三个矩阵 Q、K、V 的乘法；反向传播就是把梯度沿计算图反向传，每一步都是矩阵乘法和加法。

NumPy 的 np.linalg 子模块封装了线性代数的常用操作：矩阵乘法、行列式、逆矩阵、特征值分解、奇异值分解（SVD）、解线性方程组、QR 分解等。本章会逐一讲解这些操作的数学含义、NumPy 用法、以及在 AI 里的实际应用。

如果你对线性代数的概念已经模糊，先记住这张"AI 视角"的概念地图：

| 概念 | 数学含义 | AI 场景 |
| --- | --- | --- |
| 向量 | 一列数 | 样本特征、词向量、权重 |
| 矩阵 | 二维数表 | 数据集、权重层、注意力 |
| 矩阵乘法 | 线性变换的复合 | 全连接层、注意力打分 |
| 转置 | 行列互换 | 梯度反向传播、数据重排 |
| 行列式 | 矩阵"体积"变化率 | 检查可逆性、流模型 |
| 逆矩阵 | 反变换 | 解方程、最小二乘 |
| 特征值分解 | 找主方向 | PCA 降维、谱聚类 |
| SVD | 通用分解 | 推荐系统、压缩、伪逆 |
| 范数 | "长度"度量 | 正则化、梯度裁剪 |

## 5.2 矩阵乘法：深度学习的灵魂操作

矩阵乘法我们在第 2 章已经接触过，这里从线性代数角度再深入一层。矩阵乘法 \`C = A @ B\` 的数学定义：

\`\`\`text
C[i, j] = sum_k A[i, k] * B[k, j]
\`\`\`

三种理解方式，每一种都有用：

**理解 1：行向量 × 列向量的内积**
\$\$C_{ij} = \\vec{a}_i \\cdot \\vec{b}_j\$\$
A 的第 i 行和 B 的第 j 列做点积。

**理解 2：A 的列向量的线性组合**
C 的第 j 列 = A × (B 的第 j 列) = A 的列向量的加权和，权重是 B 的第 j 列。

**理解 3：B 的行向量的线性组合**
C 的第 i 行 = (A 的第 i 行) × B = B 的行向量的加权和，权重是 A 的第 i 行。

这三种视角在推导反向传播、理解注意力机制时都很有用。

\`\`\`python
import numpy as np

A = np.array([[1, 2], [3, 4]])   # 2×2
B = np.array([[5, 6], [7, 8]])   # 2×2

# 三种等价写法
C1 = A @ B
C2 = np.matmul(A, B)
C3 = np.dot(A, B)

# 形状规则：(m, n) @ (n, k) = (m, k)
A2 = np.random.rand(3, 4)
B2 = np.random.rand(4, 5)
C = A2 @ B2   # shape (3, 5)
\`\`\`

**一维数组的特殊处理**：\`np.dot\` 对一维数组做内积，\`np.matmul\` 会把一维数组自动提升为二维。

\`\`\`python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
np.dot(a, b)    # 32   内积
np.matmul(a, b) # 32   自动提升
\`\`\`

**批量矩阵乘法**：当 A 是 (b, m, n)、B 是 (b, n, k) 时，\`@\` 会做批量乘法，结果是 (b, m, k)。这是 PyTorch、TensorFlow 里 batched matmul 的原型，Attention 计算里大量使用。

\`\`\`python
A = np.random.rand(8, 4, 16)   # 8 个 4×16 矩阵
B = np.random.rand(8, 16, 32)  # 8 个 16×32 矩阵
C = A @ B                       # shape (8, 4, 32)  批量乘法
\`\`\`

## 5.3 矩阵的迹、行列式与秩

**迹（trace）**：方阵对角线元素之和。

\`\`\`python
A = np.array([[1, 2], [3, 4]])
np.trace(A)   # 1 + 4 = 5
\`\`\`

迹在 AI 里出现的场景：Frobenius 范数的平方等于 AᵀA 的迹；注意力复杂度分析里会用迹；某些正则化项用迹表示。

**行列式（determinant）**：方阵"体积变化率"的度量。

\`\`\`python
A = np.array([[1, 2], [3, 4]])
np.linalg.det(A)   # -2.0
\`\`\`

行列式为 0 表示矩阵奇异（不可逆）；行列式为负表示翻转了方向。在流模型（Normalizing Flows）里，行列式用于计算雅可比矩阵的对数似然。

**秩（rank）**：矩阵中线性独立的行/列数。

\`\`\`python
A = np.array([[1, 2], [2, 4]])   # 第二行是第一行的 2 倍
np.linalg.matrix_rank(A)   # 1
\`\`\`

秩反映矩阵"信息量"。低秩矩阵可以做压缩（SVD 的理论基础）。

## 5.4 逆矩阵与伪逆

**逆矩阵**：若 A 是方阵且行列式非零，则存在 A⁻¹ 使得 A @ A⁻¹ = I。

\`\`\`python
A = np.array([[1, 2], [3, 4]])
A_inv = np.linalg.inv(A)
# A_inv = [[-2.0, 1.0], [1.5, -0.5]]

A @ A_inv   # 接近单位矩阵 [[1, 0], [0, 1]]
\`\`\`

逆矩阵的用途：
- **解线性方程组**：Ax = b → x = A⁻¹b
- **最小二乘法**：(XᵀX)⁻¹Xᵀy
- **协方差矩阵的精度矩阵**

但要注意：**实际计算中很少直接求逆**，因为数值不稳定且慢。NumPy 提供了更稳定的替代方案：

\`\`\`python
# 解方程 Ax = b
x = np.linalg.inv(A) @ b      # 不推荐
x = np.linalg.solve(A, b)     # 推荐！更快更稳定

# 最小二乘
x, *_ = np.linalg.lstsq(A, b, rcond=None)   # 推荐
\`\`\`

**伪逆（pseudo-inverse）**：对非方阵或奇异矩阵，用 Moore-Penrose 伪逆。

\`\`\`python
A = np.array([[1, 2, 3], [4, 5, 6]])   # 2×3 非方阵
A_pinv = np.linalg.pinv(A)              # 3×2 伪逆
# A @ A_pinv = I（2×2 单位矩阵）
\`\`\`

伪逆在最小二乘、推荐系统、神经网络权重求解中都有应用。

## 5.5 特征值与特征值分解

**特征值与特征向量**：对方阵 A，若存在非零向量 v 和标量 λ 使得 Av = λv，则 λ 是特征值，v 是特征向量。

直观理解：A 作用在 v 上只是把 v 拉伸了 λ 倍，方向不变。

\`\`\`python
A = np.array([[2, 1], [1, 2]])
eigenvalues, eigenvectors = np.linalg.eig(A)
# eigenvalues: [3., 1.]
# eigenvectors: 每列是一个特征向量
\`\`\`

**特征值分解（EVD）**：把方阵 A 分解成 A = QΛQ⁻¹，其中 Q 是特征向量组成的矩阵，Λ 是特征值对角矩阵。

\`\`\`text
A = Q @ Λ @ Q⁻¹

  Q: 特征向量矩阵    Λ: 特征值对角阵
  ┌───┬───┐         ┌───┬───┐
  │v1 │v2 │         │λ1 │ 0 │
  │   │   │         │───┼───│
  │   │   │         │ 0 │λ2 │
  └───┴───┘         └───┴───┘
\`\`\`

特征值分解的 AI 应用：

**1. PCA 主成分分析**：对协方差矩阵做特征值分解，最大特征值对应的方向就是数据方差最大的方向。PCA 降维就是保留前 k 个最大特征值对应的特征向量。

\`\`\`python
# PCA 简化流程
X_centered = X - X.mean(axis=0)
cov = np.cov(X_centered.T)             # 协方差矩阵
eigvals, eigvecs = np.linalg.eig(cov)  # 特征分解
top_k = np.argsort(eigvals)[::-1][:k]  # 选前 k 大特征值
W = eigvecs[:, top_k]                  # 投影矩阵
X_pca = X_centered @ W                 # 降维
\`\`\`

**2. 谱聚类**：用相似矩阵的拉普拉斯矩阵的特征向量做聚类。

**3. 谱归一化**：用权重矩阵的最大奇异值（特征值的推广）来约束 Lipschitz 常数，用于 GAN 训练。

## 5.6 奇异值分解 SVD

SVD 是线性代数里最强大、最通用的分解。任何形状的矩阵都能做 SVD：

\`\`\`text
A = U @ Σ @ Vᵀ

A: m×n 矩阵
U: m×m 正交矩阵（左奇异向量）
Σ: m×n 对角矩阵（奇异值，降序排列）
V: n×n 正交矩阵（右奇异向量）
\`\`\`

\`\`\`python
A = np.array([[1, 2, 3], [4, 5, 6]])   # 2×3
U, S, Vt = np.linalg.svd(A)
# U: shape (2, 2)
# S: shape (2,)   奇异值一维数组
# Vt: shape (3, 3)

# 重构 A
Sigma = np.zeros_like(A, dtype=float)
Sigma[:len(S), :len(S)] = np.diag(S)
A_reconstructed = U @ Sigma @ Vt   # 接近原 A
\`\`\`

SVD 的几个关键性质：

- **奇异值非负且降序**：第一个奇异值最大，代表数据"最主要的方向"。
- **U 和 V 是正交矩阵**：UᵀU = I，VᵀV = I，旋转不改变长度。
- **矩阵的秩 = 非零奇异值个数**。
- **Frobenius 范数 = 奇异值平方和开根号**。
- **二范数（最大奇异值）= 最大的奇异值**。

SVD 的 AI 应用极其广泛：

**1. 数据降维（截断 SVD / Truncated SVD）**

只保留前 k 个最大的奇异值，相当于把矩阵"压缩"成低秩近似：

\`\`\`python
# 保留前 k 个奇异值
k = 2
A_approx = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
\`\`\`

这是推荐系统、图像压缩、LSA 潜在语义分析的核心算法。

**2. 伪逆计算**

伪逆 A⁺ = V @ Σ⁺ @ Uᵀ，其中 Σ⁺ 是把非零奇异值取倒数。

**3. 数值稳定性分析**

条件数 = 最大奇异值 / 最小奇异值。条件数大说明矩阵"接近奇异"，求解不稳定。

**4. 主成分分析 PCA**

对中心化后的数据做 SVD：奇异值就是 PCA 的主成分方差，V 的列就是主成分方向。

\`\`\`python
# PCA 用 SVD 实现（更稳定）
X_centered = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
components = Vt[:k]                # 前 k 个主成分
X_pca = X_centered @ components.T  # 降维结果
\`\`\`

## 5.7 解线性方程组

\`\`\`python
# Ax = b
A = np.array([[3, 1], [1, 2]])
b = np.array([9, 8])
x = np.linalg.solve(A, b)   # [2., 3.]
# 比求逆再乘快得多且数值稳定

# 最小二乘解（超定方程组）
A = np.array([[1, 1], [1, 2], [1, 3], [1, 4]])
b = np.array([6, 5, 7, 10])
x, residuals, rank, sv = np.linalg.lstsq(A, b, rcond=None)
\`\`\`

最小二乘是线性回归的数学基础：给定数据 X 和标签 y，找 w 使 ||Xw - y||² 最小，解为 w = (XᵀX)⁻¹Xᵀy，但实际用 lstsq 更稳定。

## 5.8 范数：衡量向量/矩阵的"大小"

\`\`\`python
v = np.array([3, 4])

np.linalg.norm(v)        # L2 范数 = 5.0
np.linalg.norm(v, 1)     # L1 范数 = 7.0
np.linalg.norm(v, np.inf) # L∞ 范数 = 4.0
np.linalg.norm(v, 2)     # L2，默认

A = np.array([[1, 2], [3, 4]])
np.linalg.norm(A)        # Frobenius 范数 = 5.477
np.linalg.norm(A, 'fro') # 同上
np.linalg.norm(A, 2)     # 谱范数（最大奇异值）= 5.465
\`\`\`

范数在 AI 里的应用：

- **L2 正则化（权重衰减）**：损失函数加 λ||w||²，防止过拟合。
- **L1 正则化（Lasso）**：加 λ||w||₁，产生稀疏权重。
- **梯度裁剪**：当 ||∇|| > 阈值时按比例缩放，防止梯度爆炸。
- **距离度量**：KNN、K-Means 用 L2 距离。
- **模型评估**：MSE 就是预测误差的 L2 范数平方。

## 5.9 QR 分解与 Cholesky 分解

**QR 分解**：A = QR，Q 正交，R 上三角。用于最小二乘的稳定求解、特征值算法（QR 算法）。

\`\`\`python
A = np.array([[1, 2], [3, 4], [5, 6]])
Q, R = np.linalg.qr(A)
# Q: shape (3, 3) 正交矩阵
# R: shape (3, 2) 上三角
\`\`\`

**Cholesky 分解**：把对称正定矩阵 A 分解成 A = LLᵀ，L 是下三角。比求逆快 2 倍且更稳定，常用于高斯过程、卡尔曼滤波。

\`\`\`python
A = np.array([[4, 2], [2, 3]])   # 对称正定
L = np.linalg.cholesky(A)
# L @ L.T = A
\`\`\`

## 5.10 一个完整的 PCA 实战

把本章学的概念串成一个完整的 PCA 实现：

\`\`\`python
def pca(X, k):
    """主成分分析：把 X (n_samples, n_features) 降到 k 维"""
    # 1. 中心化
    X_centered = X - X.mean(axis=0)

    # 2. 用 SVD 分解（比协方差矩阵 + EVD 更稳定）
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

    # 3. 取前 k 个主成分
    components = Vt[:k]                  # shape (k, n_features)

    # 4. 投影到低维空间
    X_reduced = X_centered @ components.T  # shape (n_samples, k)

    # 5. 解释方差比
    explained_variance = (S ** 2) / (X.shape[0] - 1)
    ratio = explained_variance[:k].sum() / explained_variance.sum()

    return X_reduced, components, ratio

# 使用
X = np.random.randn(100, 10)   # 100 个 10 维样本
X_reduced, comps, ratio = pca(X, k=3)
# X_reduced shape (100, 3)，保留了 ratio 比例的方差
\`\`\`

这段代码涵盖了：矩阵减法、广播（减均值）、SVD、矩阵乘法（投影）、奇异值平方解释方差。是 NumPy 线性代数能力的集中展示。

## 5.11 性能与稳定性建议

1. **优先用 solve 而非 inv**：解方程时 np.linalg.solve 比 np.linalg.inv(A) @ b 快且稳定。
2. **优先用 SVD 做伪逆和最小二乘**：SVD 数值稳定性最好，对病态矩阵也鲁棒。
3. **避免计算协方差矩阵的特征值**：直接对数据中心化后做 SVD，结果等价但更稳定。
4. **检查条件数**：条件数 > 1e10 说明矩阵病态，求解结果不可信。
5. **使用 float64 做数值计算**：float32 在累积运算中容易丢精度，最终结果可能差几个数量级。

## 5.12 本章小结

- 矩阵乘法是深度学习的核心运算，三种等价写法 @ / matmul / dot。
- 行列式判断可逆性，迹用于范数和似然计算。
- 逆矩阵少用，优先 solve 和 lstsq。
- 特征值分解用于 PCA、谱聚类，但仅限方阵。
- SVD 通用最强：降维、伪逆、PCA、压缩都能用。
- 范数用于正则化、梯度裁剪、距离度量。
- 数值稳定性：solve > inv，SVD > EVD，float64 > float32。

至此，NumPy 科学计算组的 5 章学习完成。你已经掌握了 ndarray 的创建、运算、索引、广播、线性代数这五大核心能力。
`,
    code: `# ============================================================
# 第5章代码演示：NumPy线性代数（纯 Python 模拟）
# ============================================================
# 用纯 Python 模拟 np.linalg 的核心功能：
#   - 矩阵乘法 matmul
#   - 转置 transpose
#   - 迹 trace
#   - 行列式 determinant（递归展开）
#   - 逆矩阵 inverse（伴随矩阵法）
#   - 特征值/特征向量（2×2 解析解）
#   - SVD 分解（简化版）
#   - 解线性方程组 solve
#   - 范数 norm
# ------------------------------------------------------------

import math

# ---- 1. 矩阵基础工具 ----
def matmul(A, B):
    """矩阵乘法 C[i,j] = sum_k A[i,k] * B[k,j]"""
    m = len(A)
    n = len(A[0])
    n2 = len(B)
    k = len(B[0])
    assert n == n2, f"形状不兼容 ({m}×{n}) @ ({n2}×{k})"
    C = [[0] * k for _ in range(m)]
    for i in range(m):
        for j in range(k):
            s = 0
            for p in range(n):
                s += A[i][p] * B[p][j]
            C[i][j] = s
    return C

def transpose(A):
    """转置"""
    return [[A[i][j] for i in range(len(A))] for j in range(len(A[0]))]

def identity(n):
    """单位矩阵"""
    return [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]

def trace(A):
    """迹：对角线元素之和"""
    return sum(A[i][i] for i in range(len(A)))


# ---- 2. 行列式（递归展开）----
def determinant(A):
    """行列式：按第一行展开（仅适合小矩阵）"""
    n = len(A)
    if n == 1:
        return A[0][0]
    if n == 2:
        return A[0][0] * A[1][1] - A[0][1] * A[1][0]
    det = 0
    for j in range(n):
        # 余子式
        minor = [row[:j] + row[j+1:] for row in A[1:]]
        det += ((-1) ** j) * A[0][j] * determinant(minor)
    return det


# ---- 3. 逆矩阵（伴随矩阵法）----
def inverse(A):
    """逆矩阵：A⁻¹ = adj(A) / det(A)"""
    n = len(A)
    det = determinant(A)
    assert abs(det) > 1e-10, "矩阵奇异，不可逆"
    # 计算伴随矩阵
    adj = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            minor = [row[:j] + row[j+1:] for k, row in enumerate(A) if k != i]
            adj[j][i] = ((-1) ** (i + j)) * determinant(minor) / det
    return adj


# ---- 4. 特征值与特征向量（2×2 解析解）----
def eig_2x2(A):
    """2×2 矩阵的特征值和特征向量（解析解）
    特征方程: λ² - trace(A)λ + det(A) = 0
    """
    assert len(A) == 2 and len(A[0]) == 2, "仅支持 2×2"
    tr = trace(A)
    det = determinant(A)
    # 二次方程求根
    disc = math.sqrt(tr * tr - 4 * det + 0j)
    lambda1 = (tr + disc) / 2
    lambda2 = (tr - disc) / 2

    eigvals = [complex(lambda1), complex(lambda2)]
    eigvecs = []
    for lam in eigvals:
        # (A - λI)v = 0
        a = A[0][0] - lam
        b = A[0][1]
        c = A[1][0]
        d = A[1][1] - lam
        # 取 v = [-b, a] 或 [d, -c]
        if abs(b) > 1e-10 or abs(a) > 1e-10:
            v = [-b, a] if abs(a) + abs(b) > abs(c) + abs(d) else [d, -c]
        else:
            v = [1, 0]
        # 归一化
        norm = math.sqrt(abs(v[0])**2 + abs(v[1])**2)
        if norm > 1e-10:
            v = [v[0]/norm, v[1]/norm]
        eigvecs.append(v)
    return eigvals, eigvecs


# ---- 5. 解线性方程组（高斯消元）----
def solve(A, b):
    """解 Ax = b，用高斯消元法"""
    n = len(A)
    # 增广矩阵
    M = [list(A[i]) + [b[i]] for i in range(n)]
    # 前向消元
    for col in range(n):
        # 选主元
        max_row = col
        for r in range(col + 1, n):
            if abs(M[r][col]) > abs(M[max_row][col]):
                max_row = r
        M[col], M[max_row] = M[max_row], M[col]
        # 消元
        for r in range(col + 1, n):
            if abs(M[col][col]) < 1e-12:
                continue
            factor = M[r][col] / M[col][col]
            for c in range(col, n + 1):
                M[r][c] -= factor * M[col][c]
    # 回代
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = M[i][n]
        for j in range(i + 1, n):
            s -= M[i][j] * x[j]
        x[i] = s / M[i][i]
    return x


# ---- 6. 范数 ----
def vector_norm(v, order=2):
    """向量范数"""
    if order == 1:
        return sum(abs(x) for x in v)
    elif order == 2:
        return math.sqrt(sum(x * x for x in v))
    elif order == float('inf'):
        return max(abs(x) for x in v)

def frobenius_norm(A):
    """Frobenius 范数"""
    return math.sqrt(sum(x * x for row in A for x in row))


# ---- 7. SVD 简化实现（仅对 2×2 演示）----
def svd_2x2(A):
    """2×2 矩阵的 SVD 简化分解 A = U Σ Vᵀ
    利用 AᵀA 的特征向量求 V，AAᵀ 的特征向量求 U
    """
    assert len(A) == 2 and len(A[0]) == 2
    At = transpose(A)
    AtA = matmul(At, A)  # 2×2 对称
    AAt = matmul(A, At)  # 2×2 对称

    # 求 V（AtA 的特征向量）
    _, eigvecs_V = eig_2x2(AtA)
    V = [[eigvecs_V[0][0], eigvecs_V[1][0]],
         [eigvecs_V[0][1], eigvecs_V[1][1]]]

    # 求 U（AAt 的特征向量）
    _, eigvecs_U = eig_2x2(AAt)
    U = [[eigvecs_U[0][0], eigvecs_U[1][0]],
         [eigvecs_U[0][1], eigvecs_U[1][1]]]

    # 奇异值 = sqrt(AtA 的特征值)
    eigvals_AtA, _ = eig_2x2(AtA)
    S = [math.sqrt(abs(ev.real)) for ev in eigvals_AtA]
    # 降序排列
    order = sorted(range(len(S)), key=lambda i: -S[i])
    S = [S[i] for i in order]

    return U, S, transpose(V)


# ============ 演示部分 ============
print("========== 1. 矩阵乘法 ==========")
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
print("A =", A)
print("B =", B)
C = matmul(A, B)
print("A @ B =")
for row in C: print("  ", row)
print("  验证: C[0,0] = 1*5+2*7 =", 1*5+2*7, "✓")


print("\\n========== 2. 转置与迹 ==========")
At = transpose(A)
print("Aᵀ =")
for row in At: print("  ", row)
print("trace(A) =", trace(A), "  (= 1+4)")


print("\\n========== 3. 行列式 ==========")
A2 = [[1, 2], [3, 4]]
A3 = [[2, 0, 0], [0, 3, 0], [0, 0, 4]]
print(f"det({A2}) =", determinant(A2), "  (= 1*4-2*3 = -2)")
print(f"det({A3}) =", determinant(A3), "  (= 2*3*4 = 24)")
print("det = 0 表示奇异矩阵（不可逆）")


print("\\n========== 4. 逆矩阵 ==========")
A_inv = inverse(A2)
print("A⁻¹ =")
for row in A_inv: print("  ", [round(x, 4) for x in row])
# 验证 A @ A⁻¹ = I
product = matmul(A2, A_inv)
print("A @ A⁻¹ =")
for row in product: print("  ", [round(x, 4) for x in row], "  ← 应接近单位矩阵")


print("\\n========== 5. 解线性方程组 ==========")
# 3x + y = 9, x + 2y = 8 → x=2, y=3
A_eq = [[3, 1], [1, 2]]
b_eq = [9, 8]
x = solve(A_eq, b_eq)
print(f"解方程 A x = b，A={A_eq}, b={b_eq}")
print(f"解 x =", [round(v, 4) for v in x], "  ← 应为 [2, 3]")
print("（推荐用 solve 而非 inv(A)@b，更稳定）")


print("\\n========== 6. 特征值与特征向量 ==========")
A_eig = [[2, 1], [1, 2]]
eigvals, eigvecs = eig_2x2(A_eig)
print(f"矩阵 A = {A_eig}")
for i, (lam, v) in enumerate(zip(eigvals, eigvecs)):
    lam_str = f"{lam.real:.4f}" if abs(lam.imag) < 1e-10 else f"{lam}"
    v_str = [f"{c.real:.4f}" if isinstance(c, complex) else f"{c:.4f}" for c in v]
    print(f"  λ{i+1} = {lam_str}, v{i+1} = {v_str}")
print("验证 A v = λ v：")
for lam, v in zip(eigvals, eigvecs):
    Av = [A_eig[0][0]*v[0] + A_eig[0][1]*v[1],
          A_eig[1][0]*v[0] + A_eig[1][1]*v[1]]
    lv = [lam.real * v[0], lam.real * v[1]]
    print(f"  A v = {[round(x,4) for x in Av]}, λ v = {[round(x,4) for x in lv]}")


print("\\n========== 7. 范数 ==========")
v = [3, 4]
print(f"向量 v = {v}")
print(f"  L1 范数  = {vector_norm(v, 1)}   (= |3|+|4| = 7)")
print(f"  L2 范数  = {vector_norm(v, 2)}   (= √(9+16) = 5)")
print(f"  L∞ 范数  = {vector_norm(v, float('inf'))}   (= max(3,4) = 4)")
print(f"\\n矩阵 A 的 Frobenius 范数 = {frobenius_norm(A):.4f}")
print("  (= √(1²+2²+3²+4²) = √30 ≈ 5.477)")


print("\\n========== 8. SVD 分解（2×2 简化版）==========")
A_svd = [[3, 0], [0, 1]]
print(f"矩阵 A = {A_svd}")
U, S, Vt = svd_2x2(A_svd)
print("U（左奇异向量）=")
for row in U: print("  ", [round(c.real, 4) if isinstance(c, complex) else round(c, 4) for c in row])
print("Σ（奇异值，降序）=", [round(s, 4) for s in S])
print("Vᵀ（右奇异向量转置）=")
for row in Vt: print("  ", [round(c.real, 4) if isinstance(c, complex) else round(c, 4) for c in row])
print("\\nSVD 性质：")
print("  - 奇异值非负且降序")
print("  - U 和 V 是正交矩阵")
print("  - 矩阵的秩 = 非零奇异值个数")
print("  - 截断 SVD 可用于降维/压缩")


print("\\n========== 9. PCA 完整流程演示 ==========")
# 模拟 4 个 2 维样本，做 PCA 降到 1 维
X = [[2.0, 4.0], [1.0, 3.0], [0.0, 1.0], [3.0, 5.0]]
print("原始数据 X（4 个 2 维样本）:")
for row in X: print("  ", row)

# 1. 中心化
n = len(X)
mean = [sum(X[i][j] for i in range(n))/n for j in range(2)]
X_c = [[X[i][j] - mean[j] for j in range(2)] for i in range(n)]
print(f"\\n均值 = {[round(m,2) for m in mean]}")
print("中心化后:")
for row in X_c: print("  ", [round(x,2) for x in row])

# 2. 计算协方差矩阵
cov = [[0.0, 0.0], [0.0, 0.0]]
for i in range(2):
    for j in range(2):
        cov[i][j] = sum(X_c[k][i] * X_c[k][j] for k in range(n)) / (n - 1)
print(f"\\n协方差矩阵 =")
for row in cov: print("  ", [round(x,4) for x in row])

# 3. 特征分解
eigvals, eigvecs = eig_2x2(cov)
print(f"\\n特征值 = {[round(ev.real,4) for ev in eigvals]}")
# 选最大特征值对应的方向
max_idx = max(range(len(eigvals)), key=lambda i: abs(eigvals[i]))
W = eigvecs[max_idx]
print(f"主成分方向（最大特征值对应）= {[round(x,4) for x in W]}")

# 4. 投影到 1 维
X_pca = [sum(X_c[i][j] * W[j] for j in range(2)) for i in range(n)]
print(f"\\nPCA 降维后（1 维）= {[round(x,4) for x in X_pca]}")
total_var = sum(abs(ev) for ev in eigvals)
explained = abs(eigvals[max_idx]) / total_var
print(f"解释方差比 = {explained:.4f}  (即保留了 {explained*100:.1f}% 的信息)")


print("\\n========== 10. 真正的 NumPy 等价代码 ==========")
print("""# import numpy as np
# A = np.array([[1, 2], [3, 4]])
# B = np.array([[5, 6], [7, 8]])
# print(A @ B)                # 矩阵乘法
# print(A.T)                  # 转置
# print(np.trace(A))          # 迹
# print(np.linalg.det(A))     # 行列式
# print(np.linalg.inv(A))     # 逆矩阵
# print(np.linalg.solve(A, b))# 解方程
#
# eigvals, eigvecs = np.linalg.eig(A)  # 特征分解
# U, S, Vt = np.linalg.svd(A)          # SVD 分解
# print(np.linalg.norm(v))              # 向量范数
# print(np.linalg.norm(A, 'fro'))       # 矩阵范数
#
# # PCA
# X_c = X - X.mean(axis=0)
# U, S, Vt = np.linalg.svd(X_c, full_matrices=False)
# components = Vt[:k]
# X_pca = X_c @ components.T
""")

print("\\n========== 演示结束 ==========")
`,
  },
];
