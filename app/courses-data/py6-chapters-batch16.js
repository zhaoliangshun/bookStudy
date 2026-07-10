export const chapters = [
  {
    id: "py6-numpy-basic",
    group: "数据科学与自动化",
    icon: "🔢",
    title: "NumPy 数组计算基础",
    content: `## NumPy 数组计算基础

### 一、为什么需要 NumPy

Python 原生 \`list\` 设计灵活，可以装任意类型对象，但这种灵活性在科学计算场景下成了"原罪"：

- 每个 \`int\` 对象都是完整的 PyObject，包含引用计数、类型指针、实际值，内存开销大
- \`list\` 元素在内存中分散存储（存的是指针），CPU 缓存命中率低
- 逐元素运算依赖 Python 解释器循环，速度比 C 慢 1-2 个数量级

NumPy（Numerical Python）的核心数据结构 \`ndarray\` 解决了这些问题：

- **同质存储**：所有元素类型相同（如 float64），紧凑排列在连续内存
- **向量化运算**：底层用 C 实现，单条语句处理整个数组
- **广播机制**：自动对齐不同形状的数组运算

NumPy 是整个 Python 数据科学栈的基石，Pandas、scikit-learn、PyTorch、TensorFlow 都建立在它的数组协议之上。

### 二、ndarray 多维数组

\`\`\`python
import numpy as np

a = np.array([1, 2, 3, 4])           # 1 维数组
b = np.array([[1, 2, 3], [4, 5, 6]]) # 2 维数组
c = np.zeros((3, 4))                  # 全 0 矩阵
d = np.arange(0, 10, 2)              # [0 2 4 6 8]
e = np.linspace(0, 1, 5)             # [0.   0.25 0.5  0.75 1.  ]

print(a.shape, b.shape)   # (4,) (2, 3)
print(a.dtype, b.dtype)   # int64 int64
print(b.ndim, b.size)     # 2 6
\`\`\`

\`ndarray\` 五大核心属性：

| 属性 | 含义 | 示例 |
|-----|------|------|
| shape | 各维度大小 | (2, 3) |
| dtype | 元素类型 | float64 |
| ndim | 维度数 | 2 |
| size | 元素总数 | 6 |
| itemsize | 单元素字节数 | 8 |

### 三、向量化运算 vs 显式循环

向量化是 NumPy 性能的核心。对比两种写法：

\`\`\`python
import numpy as np
import time

x = np.arange(1_000_000)

# 写法 1: Python 循环
start = time.time()
result1 = [v * 2 + 1 for v in x]
print(f"list 循环: {time.time() - start:.3f}s")

# 写法 2: 向量化
start = time.time()
result2 = x * 2 + 1
print(f"numpy 向量化: {time.time() - start:.3f}s")
\`\`\`

向量化通常快 50-100 倍。原因是：

- 循环体在 C 层执行，无需 Python 解释器开销
- 利用 SIMD（单指令多数据）CPU 指令并行
- 连续内存访问，CPU 缓存友好

> 💡 **避坑提示**：永远不要用 \`for\` 循环遍历大数组做逐元素运算。如果必须循环，先考虑能否用 \`np.where\`、\`np.select\` 或 \`np.einsum\` 重写。

### 四、切片与索引

NumPy 的索引比 Python list 强大得多：

\`\`\`python
a = np.arange(12).reshape(3, 4)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

a[0]          # 第一行 [0 1 2 3]
a[:, 1]       # 第二列 [1 5 9]
a[1:3, 0:2]   # 子块 [[4 5] [8 9]]
a[a > 5]      # 布尔索引 [6 7 8 9 10 11]
a[[0, 2]]     # 花式索引，取第 0、2 行
\`\`\`

关键区别：NumPy 切片返回**视图**（view）而非副本，修改视图会影响原数组。需要副本时用 \`.copy()\`。

> ⚠️ **避坑提示**：\`a = a[A > 5]\` 是副本（布尔索引返回新数组），但 \`a[:] = a[A > 5]\` 是原地修改。混用易出 bug。

### 五、广播 Broadcasting

广播让不同形状的数组可以一起运算，无需手动复制数据：

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])  # shape (2, 3)
b = np.array([10, 20, 30])             # shape (3,)

a + b   # b 广播成 (2, 3)，逐元素相加
# [[11 22 33]
#  [14 25 36]]
\`\`\`

广播规则：从末尾开始比较维度，每个维度必须**相等**或**其中一方为 1**。

| 形状 A | 形状 B | 结果 | 说明 |
|--------|--------|------|------|
| (3, 4) | (3, 4) | (3, 4) | 完全相同 |
| (3, 4) | (4,) | (3, 4) | 末维匹配 |
| (3, 4) | (1,) | (3, 4) | 标量广播 |
| (3, 4) | (3,) | 报错 | 末维 4≠3 |

### 六、数学与统计函数

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])

a.sum()         # 21 全部求和
a.sum(axis=0)   # [5 7 9] 按列
a.sum(axis=1)   # [6 15] 按行
a.mean()        # 3.5
a.std()         # 1.7078 标准差
a.max(axis=1)   # [3 6]
np.exp(a)       # e^x
np.sqrt(a)      # 平方根
\`\`\`

\`axis\` 参数是初学者最大的困惑点：\`axis=0\` 沿行的方向（即对每列操作），\`axis=1\` 沿列的方向（对每行操作）。

### 七、array.array 同质数组

Python 标准库的 \`array\` 模块提供了简化版的同质数组，适合不需要 NumPy 的小场景：

\`\`\`python
import array
ints = array.array('i', [1, 2, 3, 4])   # 有符号整数
floats = array.array('d', [1.1, 2.2])   # 双精度浮点
\`\`\`

\`array\` 比 \`list\` 省内存，但缺少向量化运算，功能远不如 NumPy。

### 八、业务场景

- **科学计算**：矩阵运算、线性代数、傅里叶变换
- **ML 数据预处理**：特征归一化、缺失值填充、批量变换
- **图像处理**：图像本质是 (H, W, 3) 的 ndarray
- **金融量化**：时间序列、回测引擎
- **嵌入式**：用 \`array\` 替代 list 节省内存

### 九、原理深入

NumPy 之所以快，核心在于**内存布局**：

- \`ndarray\` 在堆上分配一整块连续内存，按 C 顺序（行优先）或 F 顺序（列优先）排列
- \`strides\` 属性记录每个维度前进一个元素需要跳过的字节数，索引计算只需乘加
- 视图（view）通过共享 data 指针 + 不同 strides 实现，零拷贝
- ufunc（universal function）对每个元素调用 C 函数，支持类型提升

### 十、最佳实践总结

- 优先向量化，避免 Python 循环
- 大数组用 \`float32\` 而非 \`float64\`，省一半内存
- 切片是视图，需要副本显式 \`.copy()\`
- 用 \`np.random.default_rng()\` 替代旧的 \`np.random.seed\`
- 链式操作注意中间数组内存，用 \`out=\` 参数原地写回
- 多维数据持久化用 \`.npy\` / \`.npz\`，比文本快`,
    code: `# NumPy 核心概念演示：用纯 Python 标准库模拟 ndarray
# 不依赖 numpy，仅演示多维数组、向量化、广播等概念
import array
import math
import time

print("=== NumPy 数组计算基础概念演示 ===\\n")

print("--- 1. 用嵌套 list 模拟 ndarray ---")

class SimpleArray:
    """用嵌套 list 模拟 numpy ndarray 的核心行为"""
    def __init__(self, data):
        self.data = data
        self.shape = self._compute_shape(data)

    def _compute_shape(self, data):
        if not isinstance(data, list):
            return ()
        if not data:
            return (0,)
        if isinstance(data[0], list):
            return (len(data),) + self._compute_shape(data[0])
        return (len(data),)

    def __repr__(self):
        return f"SimpleArray(shape={self.shape}, data={self.data})"

    def __add__(self, other):
        if isinstance(other, SimpleArray):
            return SimpleArray(self._add(self.data, other.data))
        return SimpleArray(self._add_scalar(self.data, other))

    def _add(self, a, b):
        if isinstance(a, list) and isinstance(b, list):
            return [self._add(x, y) for x, y in zip(a, b)]
        return a + b

    def _add_scalar(self, a, s):
        if isinstance(a, list):
            return [self._add_scalar(x, s) for x in a]
        return a + s

a = SimpleArray([[1, 2, 3], [4, 5, 6]])
b = SimpleArray([[10, 20, 30], [40, 50, 60]])
print(f"  a = {a}")
print(f"  b = {b}")
print(f"  a + b = {a + b}")        # 逐元素相加
print(f"  a + 100 = {a + 100}")    # 广播：标量加到每个元素

print("\\n--- 2. 向量化运算 vs 显式循环 ---")
size = 100000
lst1 = list(range(size))
lst2 = list(range(size))
start = time.perf_counter()
result_loop = [x + y for x, y in zip(lst1, lst2)]
t_loop = time.perf_counter() - start
start = time.perf_counter()
result_vec = list(map(lambda x, y: x + y, lst1, lst2))
t_vec = time.perf_counter() - start
print(f"  列表大小: {size}")
print(f"  显式循环耗时: {t_loop*1000:.2f} ms")
print(f"  map 向量化耗时: {t_vec*1000:.2f} ms")
print(f"  结果一致: {result_loop == result_vec}")
print("  注: 真正 numpy 向量化底层用 C 实现，比 list 快 10-100 倍")

print("\\n--- 3. 切片与索引 ---")
arr = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
print(f"  原数组: {arr}")
print(f"  第一行: {arr[0]}")
print(f"  第一列: {[row[0] for row in arr]}")
print(f"  子块 [1:3, 0:2]: {[row[0:2] for row in arr[1:3]]}")
print(f"  倒序行: {arr[::-1]}")
print(f"  布尔索引 (>5): {[v for row in arr for v in row if v > 5]}")

print("\\n--- 4. 广播 Broadcasting 演示 ---")
def broadcast_shapes(shape1, shape2):
    rev1, rev2 = list(reversed(shape1)), list(reversed(shape2))
    max_len = max(len(rev1), len(rev2))
    rev1 += [1] * (max_len - len(rev1))
    rev2 += [1] * (max_len - len(rev2))
    result = []
    for d1, d2 in zip(rev1, rev2):
        if d1 == d2 or d1 == 1 or d2 == 1:
            result.append(max(d1, d2))
        else:
            return None
    return tuple(reversed(result))

cases = [((3, 4), (3, 4)), ((3, 4), (4,)), ((3, 4), (1,)), ((3, 4), (2,))]
for s1, s2 in cases:
    res = broadcast_shapes(s1, s2)
    status = f"-> {res}" if res else "-> 不能广播"
    print(f"  {s1} + {s2} {status}")

print("\\n--- 5. 数学函数: sum / mean / std ---")
data = [1.0, 2.0, 3.0, 4.0, 5.0]
n = len(data)
total = sum(data)
mean = total / n
variance = sum((x - mean) ** 2 for x in data) / n
std = math.sqrt(variance)
print(f"  数据: {data}")
print(f"  sum = {total}, mean = {mean}, std = {std:.4f}")
print(f"  min = {min(data)}, max = {max(data)}")

print("\\n--- 6. array.array 同质数组 ---")
ints = array.array('i', [1, 2, 3, 4, 5])
floats = array.array('d', [1.1, 2.2, 3.3])
print(f"  int array: {ints.tolist()}, typecode={ints.typecode}")
print(f"  float array: {floats.tolist()}, typecode={floats.typecode}")
import sys
list_mem = sys.getsizeof([1, 2, 3, 4, 5])
arr_mem = len(ints) * ints.itemsize
print(f"  list [1..5] 内存: {list_mem} 字节")
print(f"  array('i') 内存: {arr_mem} 字节 (更紧凑)")

print("\\n--- 7. 业务场景模拟: ML 数据标准化 ---")
def standardize(dataset):
    cols = len(dataset[0])
    means = [sum(row[c] for row in dataset) / len(dataset) for c in range(cols)]
    stds = [math.sqrt(sum((row[c] - means[c]) ** 2 for row in dataset) / len(dataset)) for c in range(cols)]
    return [[(row[c] - means[c]) / stds[c] for c in range(cols)] for row in dataset]

samples = [[1.0, 200.0], [2.0, 250.0], [3.0, 300.0], [4.0, 350.0]]
print(f"  原始数据: {samples}")
normalized = standardize(samples)
print(f"  标准化后: {[[round(v, 3) for v in row] for row in normalized]}")
print("  每列均值变 0，标准差变 1，消除量纲差异")

print("\\n=== NumPy 概念演示结束 ===")`
  },
  {
    id: "py6-matplotlib",
    group: "数据科学与自动化",
    icon: "📊",
    title: "Matplotlib 数据可视化",
    content: `## Matplotlib 数据可视化

### 一、Matplotlib 是什么

Matplotlib 是 Python 最古老、最基础的绘图库，由 John Hunter 于 2003 年创建。它的设计灵感来自 MATLAB，几乎所有 Python 数据可视化工具（Seaborn、Pandas plot、scikit-learn 可视化）都构建在它之上。

核心特点：

- **底层控制力强**：可以精确调整每个像素
- **跨平台**：支持 Windows/macOS/Linux
- **多种后端**：交互窗口（Tk/Qt）、内联（Jupyter）、图片文件
- **导出格式丰富**：PNG/PDF/SVG/矢量图

### 二、pyplot 接口

\`\`\`python
import matplotlib.pyplot as plt

plt.figure(figsize=(8, 5))
plt.plot([1, 2, 3, 4], [1, 4, 9, 16], 'ro-', label='平方')
plt.title('简单折线图')
plt.xlabel('X 轴')
plt.ylabel('Y 轴')
plt.legend()
plt.grid(True)
plt.savefig('line.png', dpi=150)
plt.show()
\`\`\`

\`plt\` 是状态机接口，简单但隐式。复杂场景推荐**面向对象接口**：

\`\`\`python
fig, ax = plt.subplots()
ax.plot(x, y)
ax.set_title('标题')
\`\`\`

### 三、四大基础图表

**1. 折线图**：展示趋势

\`\`\`python
plt.plot(months, sales, marker='o', linestyle='-', color='steelblue')
\`\`\`

**2. 柱状图**：对比分类

\`\`\`python
plt.bar(['Q1','Q2','Q3','Q4'], [120, 180, 150, 220], color='coral')
\`\`\`

**3. 散点图**：观察关系

\`\`\`python
plt.scatter(heights, weights, alpha=0.5, c=ages, cmap='viridis')
plt.colorbar(label='年龄')
\`\`\`

**4. 直方图**：观察分布

\`\`\`python
plt.hist(data, bins=30, density=True, alpha=0.7)
\`\`\`

### 四、子图 subplot

\`\`\`python
fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes[0, 0].plot(x, y1)   # 左上
axes[0, 1].bar(x, y2)    # 右上
axes[1, 0].scatter(x, y3) # 左下
axes[1, 1].hist(y4)      # 右下
plt.tight_layout()       # 自动调整间距
\`\`\`

\`subplots\` 一次性创建画布和坐标轴数组，比 \`subplot\` 更现代。

### 五、标题、标签、图例

\`\`\`python
ax.set_title('2024 年销售趋势', fontsize=14)
ax.set_xlabel('月份', fontsize=12)
ax.set_ylabel('销售额（万元）', fontsize=12)
ax.legend(['实际', '预测'], loc='upper left')
ax.annotate('峰值', xy=(6, 220), xytext=(7, 250),
            arrowprops=dict(arrowstyle='->'))
\`\`\`

### 六、保存图片

\`\`\`python
plt.savefig('report.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()  # 释放内存
\`\`\`

\`bbox_inches='tight'\` 裁掉多余白边，\`dpi=300\` 适合印刷质量。

### 七、中文显示问题

> ⚠️ **避坑提示**：默认字体不支持中文，会显示方框。解决方法：

\`\`\`python
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False  # 负号显示
\`\`\`

macOS 用 \`Arial Unicode MS\`，Windows 用 \`SimHei\`，Linux 用 \`WenQuanYi Micro Hei\`。

### 八、可视化库对比

| 库 | 定位 | 优势 | 适用场景 |
|----|------|------|---------|
| Matplotlib | 基础库 | 灵活、论文级 | 科学论文、精细控制 |
| Seaborn | 基于 Matplotlib | 统计图美观、API 简洁 | 数据分析、统计可视化 |
| Plotly | 交互式 | hover/缩放/导出 HTML | 仪表盘、报表 |
| Pyecharts | Echarts 封装 | 中文友好、商业图表 | 国内商业报表 |
| Bokeh | 交互式 Web | 流式大数据 | 金融实时图 |

### 九、业务场景

- **数据报告**：Markdown + 图表，周报/月报
- **数据分析**：探索性分析（EDA），快速看分布
- **监控仪表盘**：实时刷新的折线图
- **学术发表**：PDF 矢量图，DPI 300+
- **教学演示**：Jupyter 内联显示

### 十、原理深入

Matplotlib 采用**分层架构**：

- **Backend 层**：渲染引擎（Agg/Cairo/HTML），与具体输出格式打交道
- **Artist 层**：所有可见元素都是 Artist 对象（Figure/Axes/Line2D/Text）
- **pyplot 层**：状态机封装，简化常用操作

绘制流程：创建 Figure → 添加 Axes → 在 Axes 上画 Artist → 渲染 Backend 输出。理解这一点，才能调试复杂布局问题。

### 十一、最佳实践总结

- 复杂图用面向对象接口（\`fig, ax = plt.subplots()\`）
- 中文提前配置 \`rcParams\`，避免反复设置
- 保存用 \`bbox_inches='tight'\`，发布用矢量图（PDF/SVG）
- 大数据散点图设 \`alpha\` 透明度避免重叠
- 用完 \`plt.close()\` 释放画布，循环绘图时尤其重要
- 配色用 ColorBrewer / viridis，避免红绿对色盲不友好
- Jupyter 中 \`%matplotlib inline\` 静态，\`%matplotlib widget\` 交互`,
    code: `# Matplotlib 数据可视化概念演示：用 print 字符画模拟图表
# 不依赖 matplotlib，仅演示图表绘制原理

print("=== Matplotlib 数据可视化概念演示 ===\\n")

print("--- 1. 折线图（字符画模拟） ---")
months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
temps = [3, 5, 10, 16, 21, 26, 29, 28, 23, 17, 10, 5]

def plot_line(values, width=36, height=8):
    vmin, vmax = min(values), max(values)
    step_x = width / (len(values) - 1)
    grid = [[' '] * width for _ in range(height)]
    for i, v in enumerate(values):
        x = min(int(i * step_x), width - 1)  # 防止末点 x 等于 width 越界
        y = int((vmax - v) / (vmax - vmin) * (height - 1)) if vmax > vmin else 0
        grid[y][x] = '*'
    print(f"  温度范围: {vmin}°C ~ {vmax}°C")
    for i in range(height):
        val = vmax - (vmax - vmin) * i / (height - 1)
        print(f"  {val:4.1f} |{''.join(grid[i])}")
    print("       +" + "-" * width)
    print("        " + "  ".join(months[::2]))

plot_line(temps)

print("\\n--- 2. 柱状图 ---")
sales = {"Q1": 120, "Q2": 180, "Q3": 150, "Q4": 220}
max_val = max(sales.values())
print("  季度销售额（万元）:")
for q, v in sales.items():
    bar_len = int(v / max_val * 30)
    print(f"  {q}: {'#' * bar_len} {v}")

print("\\n--- 3. 散点图（字符画） ---")
points = [(160, 55), (170, 65), (175, 70), (180, 78), (165, 58), (172, 68), (185, 85), (158, 48)]
h_min, h_max = 150, 190
w_min, w_max = 40, 90
canvas = [['.'] * 30 for _ in range(8)]
for h, w in points:
    cx = int((h - h_min) / (h_max - h_min) * 29)
    cy = int((w_max - w) / (w_max - w_min) * 7)
    canvas[cy][cx] = 'o'
print("  身高(cm) -> 体重(kg) 散点图:")
for i, row in enumerate(canvas):
    w_label = w_max - (w_max - w_min) * i / 7
    print(f"  {w_label:4.0f} |{''.join(row)}")
print(f"       +{'':<{30}}")
print(f"        {h_min}{'':>15}{(h_min+h_max)//2}{'':>15}{h_max}")

print("\\n--- 4. 直方图（分布） ---")
import random
random.seed(42)
data = [random.gauss(170, 7) for _ in range(200)]
bins = [150, 155, 160, 165, 170, 175, 180, 185, 190]
counts = [0] * (len(bins) - 1)
for v in data:
    for i in range(len(bins) - 1):
        if bins[i] <= v < bins[i + 1]:
            counts[i] += 1
            break
max_c = max(counts)
print("  身高分布直方图:")
for i, c in enumerate(counts):
    bar = '=' * int(c / max_c * 30)
    print(f"  {bins[i]}-{bins[i+1]}: {bar:30s} ({c})")

print("\\n--- 5. 子图概念（subplot） ---")
print("  matplotlib 中 subplot(nrows, ncols, index) 划分画布:")
print("  ┌──────────┬──────────┐")
print("  │   ax1    │   ax2    │")
print("  │ 折线图   │ 柱状图   │")
print("  ├──────────┼──────────┤")
print("  │   ax3    │   ax4    │")
print("  │ 散点图   │ 直方图   │")
print("  └──────────┴──────────┘")
print("  fig, axes = plt.subplots(2, 2, figsize=(10,8))")

print("\\n--- 6. 标题、标签、图例（伪代码） ---")
pseudo = """import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(months, temps, marker='o', label='月均温')
ax.set_title('2024 年月度气温变化')
ax.set_xlabel('月份'); ax.set_ylabel('温度 (°C)')
ax.legend(loc='best'); ax.grid(True, alpha=0.3)
plt.savefig('temp.png', dpi=150, bbox_inches='tight')"""
print(pseudo)

print("\\n--- 7. 可视化库对比 ---")
compare = [
    ["Matplotlib", "基础绑定", "灵活但繁琐", "科学论文"],
    ["Seaborn", "基于 Matplotlib", "统计图美观", "数据分析"],
    ["Plotly", "交互式", "支持 hover/缩放", "报表/仪表盘"],
    ["Pyecharts", "Echarts 封装", "中文友好", "国内商业报表"],
]
print(f"  {'库':<12}{'定位':<16}{'特点':<16}{'场景'}")
for row in compare:
    print(f"  {row[0]:<12}{row[1]:<16}{row[2]:<16}{row[3]}")

print("\\n--- 8. 业务场景与避坑 ---")
tips = [
    "中文乱码: plt.rcParams['font.sans-serif'] = ['SimHei']",
    "保存图片用 savefig，dpi=150 保证清晰度",
    "Jupyter 中 %matplotlib inline 静态，%matplotlib widget 交互",
    "大数据散点图用 alpha=0.3 透明度避免重叠",
    "plt.close() 释放内存，避免画布堆积",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== Matplotlib 概念演示结束 ===")`
  },
  {
    id: "py6-ml-sklearn",
    group: "数据科学与自动化",
    icon: "🤖",
    title: "Scikit-learn 机器学习入门",
    content: `## Scikit-learn 机器学习入门

### 一、机器学习三大家族

机器学习按学习方式分为三类：

| 类型 | 数据 | 目标 | 典型算法 |
|------|------|------|---------|
| 监督学习 | 有标签 (X, y) | 学习 X→y 映射 | 线性回归、SVM、随机森林 |
| 无监督学习 | 无标签 (X) | 发现结构/分组 | KMeans、PCA、DBSCAN |
| 强化学习 | 环境反馈 | 最大化累计奖励 | Q-Learning、PPO |

scikit-learn 主要覆盖前两类，强化学习用 Stable-Baselines3 或 RLlib。

### 二、ML 标准流程

一套完整的机器学习流水线：

1. **数据收集**：CSV/数据库/API
2. **数据清洗**：缺失值、异常值、去重
3. **特征工程**：编码、归一化、衍生特征
4. **数据划分**：\`train_test_split\` 训练集/测试集
5. **模型训练**：\`model.fit(X_train, y_train)\`
6. **模型评估**：\`model.predict(X_test)\` vs 真值
7. **调参优化**：\`GridSearchCV\` 网格搜索 + 交叉验证
8. **上线部署**：\`joblib.dump\` 持久化模型

\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)
model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print('R²:', r2_score(y_test, y_pred))
\`\`\`

### 三、分类 vs 回归 vs 聚类

- **分类**：输出离散标签（垃圾邮件/正常邮件）
  - 评估：准确率、精确率、召回率、F1、AUC
  - 算法：逻辑回归、SVM、随机森林、XGBoost
- **回归**：输出连续数值（房价预测）
  - 评估：MSE、RMSE、MAE、R²
  - 算法：线性回归、岭回归、决策树回归
- **聚类**：无标签分组（用户分群）
  - 评估：轮廓系数、肘部法则
  - 算法：KMeans、DBSCAN、层次聚类

### 四、训练/测试集划分

为什么要划分？模型在训练集上学习，必须在**未见过的数据**上评估，才能反映泛化能力。

\`\`\`python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
\`\`\`

- \`test_size\`：测试集比例（0.2-0.3 常用）
- \`random_state\`：固定随机种子，保证可复现
- \`stratify=y\`：分层采样，保持类别比例（分类任务必加）

### 五、简单线性回归原理

最小二乘法找一条直线 \`y = wx + b\`，使所有点到直线的**垂直距离平方和**最小：

\`\`\`python
w = Σ(x-x̄)(y-ȳ) / Σ(x-x̄)²
b = ȳ - w·x̄
\`\`\`

闭式解，无需迭代。多元线性回归用矩阵形式：\`W = (XᵀX)⁻¹Xᵀy\`。

### 六、KNN 算法原理

K-Nearest Neighbors 是最直观的分类算法：

1. 计算待分类点与所有训练点的距离（欧氏/曼哈顿）
2. 取距离最近的 K 个邻居
3. 投票决定类别（多数表决）

特点：

- **惰性学习**：训练阶段只是存数据，预测时才计算
- **无需训练**：但预测慢，需存全部数据
- **K 选择**：K 太小过拟合，K 太大欠拟合，常用奇数 3/5/7
- **特征归一化**：必须归一化，否则大量纲特征主导距离

### 七、模型评估指标

**分类指标**：

| 指标 | 公式 | 含义 |
|------|------|------|
| 准确率 | (TP+TN)/总 | 整体对的比例 |
| 精确率 | TP/(TP+FP) | 预测为正中真为正 |
| 召回率 | TP/(TP+FN) | 真为正中被找出 |
| F1 | 2·P·R/(P+R) | 精确率召回率调和 |

**回归指标**：

- MSE：均方误差，对异常值敏感
- RMSE：MSE 开根号，量纲与原数据一致
- R²：决定系数，越接近 1 越好

### 八、过拟合与正则化

**过拟合**：模型在训练集表现极好（R²=0.99），测试集很差（R²=0.5）。模型"记住"了噪声而非规律。

**正则化**在损失函数中加惩罚项，限制模型复杂度：

- **L1（Lasso）**：\`λΣ|w|\`，产生稀疏解，部分权重变 0，自带特征选择
- **L2（Ridge）**：\`λΣw²\`，缩小权重，防止过大
- **ElasticNet**：L1 + L2 组合

\`\`\`python
from sklearn.linear_model import Ridge, Lasso
ridge = Ridge(alpha=1.0)   # alpha 即 λ，越大正则越强
lasso = Lasso(alpha=0.1)
\`\`\`

其他抗过拟合手段：增加数据量、Dropout、早停、交叉验证选复杂度。

### 九、Pipeline 防止数据泄漏

\`\`\`python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LinearRegression())
])
pipe.fit(X_train, y_train)
\`\`\`

> ⚠️ **避坑提示**：如果在划分前就 \`fit_transform\` 全部数据，测试集信息会泄漏到标准化参数中，导致评估偏高。Pipeline 把预处理绑定在训练流程内，自动只在训练集 fit。

### 十、业务场景

- **预测**：销量预测、房价估值、能耗预测
- **分类**：垃圾邮件识别、欺诈检测、疾病诊断
- **推荐**：协同过滤、内容推荐
- **分群**：用户画像、异常检测

### 十一、原理深入

scikit-learn 的设计哲学：

- **统一 API**：所有模型都有 \`fit\`/\`predict\`/\`transform\` 方法
- **估算器（Estimator）**：\`fit\` 学习参数
- **预测器（Predictor）**：\`predict\` 输出预测
- **转换器（Transformer）**：\`fit_transform\` 数据变换

底层算法多用 Cython 优化，部分调用 NumPy/SciPy。集成方法（随机森林/GBDT）基于决策树。

### 十二、最佳实践总结

- 数据划分前先 shuffle，避免时序偏差
- 用 Pipeline 绑定预处理与模型，防止泄漏
- 分类不平衡用 \`stratify=y\`，必要时过采样/欠采样
- 交叉验证 \`cv=5\` 比单次划分更稳健
- 上线前 \`joblib.dump(model, 'model.pkl')\` 持久化
- 监控生产环境特征分布漂移（data drift）
- 特征工程比调参更重要，"垃圾进垃圾出"`,
    code: `# Scikit-learn 机器学习概念演示：用纯 Python 实现简单算法
# 不依赖 sklearn，演示 ML 流程与核心算法原理

import math
import random

print("=== Scikit-learn 机器学习概念演示 ===\\n")

print("--- 1. ML 标准流程 ---")
steps = [
    "1. 数据收集: 原始样本（CSV/DB/API）",
    "2. 数据清洗: 缺失值、异常值、去重",
    "3. 特征工程: 编码、归一化、衍生特征",
    "4. 数据划分: train_test_split 训练集/测试集",
    "5. 模型训练: fit(X_train, y_train)",
    "6. 模型评估: predict(X_test) vs y_test",
    "7. 调参优化: GridSearchCV / 交叉验证",
    "8. 上线部署: joblib.dump 保存模型",
]
for s in steps:
    print(f"  {s}")

print("\\n--- 2. 训练/测试集划分（模拟 train_test_split） ---")
def train_test_split(X, y, test_size=0.3, random_seed=42):
    random.seed(random_seed)
    indices = list(range(len(X)))
    random.shuffle(indices)
    split = int(len(X) * (1 - test_size))
    tr, te = indices[:split], indices[split:]
    return [X[i] for i in tr], [X[i] for i in te], [y[i] for i in tr], [y[i] for i in te]

X = [[i] for i in range(1, 21)]
y = [2 * i + 1 for i in range(1, 21)]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3)
print(f"  总样本: {len(X)}, 训练集: {len(X_tr)}, 测试集: {len(X_te)}")

print("\\n--- 3. 简单线性回归（最小二乘法） ---")
def linear_regression_fit(X, y):
    n = len(X)
    xs = [row[0] for row in X]
    x_mean = sum(xs) / n
    y_mean = sum(y) / n
    num = sum((xs[i] - x_mean) * (y[i] - y_mean) for i in range(n))
    den = sum((x - x_mean) ** 2 for x in xs)
    w = num / den if den else 0
    b = y_mean - w * x_mean
    return w, b

w, b = linear_regression_fit(X_tr, y_tr)
print(f"  拟合结果: y = {w:.3f} * x + {b:.3f}  (真值 w=2, b=1)")

def predict(X, w, b):
    return [w * row[0] + b for row in X]

y_pred = predict(X_te, w, b)

print("\\n--- 4. 模型评估指标 ---")
def mse(y_true, y_pred):
    n = len(y_true)
    return sum((y_true[i] - y_pred[i]) ** 2 for i in range(n)) / n

def r2(y_true, y_pred):
    y_mean = sum(y_true) / len(y_true)
    ss_res = sum((y_true[i] - y_pred[i]) ** 2 for i in range(len(y_true)))
    ss_tot = sum((yt - y_mean) ** 2 for yt in y_true)
    return 1 - ss_res / ss_tot if ss_tot else 0

err = mse(y_te, y_pred)
print(f"  MSE = {err:.4f}")
print(f"  RMSE = {math.sqrt(err):.4f}")
print(f"  R² = {r2(y_te, y_pred):.4f}  (越接近 1 越好)")

print("\\n--- 5. KNN 分类原理（K-Nearest Neighbors） ---")
train_points = [
    ([1.0, 1.1], 'A'), ([1.0, 1.0], 'A'), ([0.9, 1.2], 'A'),
    ([4.0, 4.1], 'B'), ([4.1, 4.0], 'B'), ([4.2, 4.2], 'B'),
]

def knn_classify(point, train, k=3):
    dists = [(math.dist(point, p[0]), p[1]) for p in train]
    dists.sort(key=lambda x: x[0])
    votes = {}
    for _, label in dists[:k]:
        votes[label] = votes.get(label, 0) + 1
    return max(votes, key=votes.get)

test_points = [[1.2, 1.0], [4.0, 4.3], [2.5, 2.5]]
for tp in test_points:
    label = knn_classify(tp, train_points, k=3)
    print(f"  点 {tp} -> 分类: {label}")

print("\\n--- 6. 三类任务对比 ---")
tasks = [
    ["分类", "离散标签", "逻辑回归/SVM/随机森林", "垃圾邮件识别"],
    ["回归", "连续数值", "线性回归/决策树", "房价预测"],
    ["聚类", "无标签", "KMeans/DBSCAN", "用户分群"],
]
print(f"  {'任务':<8}{'输出':<14}{'算法':<26}{'场景'}")
for row in tasks:
    print(f"  {row[0]:<8}{row[1]:<14}{row[2]:<26}{row[3]}")

print("\\n--- 7. 过拟合与正则化 ---")
print("  过拟合表现: 训练集 R²=0.99, 测试集 R²=0.5")
print("  解决方案:")
solutions = [
    "L1 正则化 (Lasso): 稀疏化特征，部分系数变 0",
    "L2 正则化 (Ridge): 缩小系数，防止过大",
    "增加数据量 / 数据增强",
    "Dropout / 早停 (Early Stopping)",
    "交叉验证选择最优复杂度",
]
for s in solutions:
    print(f"    - {s}")
print("  L2 正则化目标: min (损失 + lambda * Σw²)")

print("\\n--- 8. sklearn 典型用法（伪代码） ---")
pseudo = """from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([('scaler', StandardScaler()), ('lr', LinearRegression())])
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print('R2:', r2_score(y_test, y_pred))

param_grid = {'lr__fit_intercept': [True, False]}
gs = GridSearchCV(pipe, param_grid, cv=5)
gs.fit(X_train, y_train)
print('best:', gs.best_params_)"""
print(pseudo)

print("\\n--- 9. 业务场景与最佳实践 ---")
best = [
    "数据划分前先 shuffle，避免按时间排序的偏差",
    "用 Pipeline 把预处理与模型绑定，防止数据泄漏",
    "分类不平衡时用 stratify=y 保持比例",
    "交叉验证 cv=5 比单次划分更稳健",
    "上线前用 joblib.dump(model, 'model.pkl') 持久化",
    "监控生产环境特征分布漂移 (data drift)",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== Scikit-learn 概念演示结束 ===")`
  },
  {
    id: "py6-pytorch-basic",
    group: "数据科学与自动化",
    icon: "🔥",
    title: "PyTorch 深度学习入门",
    content: `## PyTorch 深度学习入门

### 一、深度学习与 PyTorch

深度学习是机器学习的一个分支，用多层神经网络自动学习特征表示。PyTorch 是 Meta（Facebook）AI 研究院开发的深度学习框架，2016 年开源，凭借**动态计算图**和**Pythonic API**迅速成为学术界主流。

核心组件：

- **torch.Tensor**：多维数组，类似 NumPy 但支持 GPU 与自动求导
- **torch.autograd**：自动微分引擎，自动计算梯度
- **torch.nn**：神经网络模块库，层/损失/优化器
- **torch.optim**：优化算法（SGD/Adam/AdamW）
- **torch.utils.data**：数据加载（Dataset/DataLoader）

### 二、Tensor 概念

Tensor 是 PyTorch 的基础数据结构，本质是带梯度追踪的多维数组：

\`\`\`python
import torch

x = torch.tensor([1.0, 2.0, 3.0])
y = torch.randn(3, 4)              # 标准正态分布
z = torch.zeros(2, 3, dtype=torch.float32)

print(x.shape, x.dtype, x.device)  # torch.Size([3]) torch.float32 cpu
\`\`\`

Tensor 与 NumPy 互通：\`x.numpy()\` / \`torch.from_numpy(arr)\`，共享内存零拷贝。

### 三、自动求导原理

\`autograd\` 是 PyTorch 的灵魂。它通过**计算图**记录每次运算，反向传播时自动用链式法则求导：

\`\`\`python
x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)
z = x * y + x     # z = xy + x
z.backward()      # 反向传播
print(x.grad)     # dz/dx = y + 1 = 4.0
print(y.grad)     # dz/dy = x = 2.0
\`\`\`

原理：

1. 前向传播时，每个 Tensor 记录产生它的运算（\`grad_fn\`）和父节点
2. 调用 \`.backward()\` 时，从输出反向遍历计算图
3. 每个运算节点根据局部雅可比矩阵累积梯度
4. 累积到叶子节点（\`requires_grad=True\` 的输入）的 \`.grad\`

> 💡 **避坑提示**：梯度默认**累加**，每次反向传播前必须 \`optimizer.zero_grad()\`，否则梯度会叠加。

### 四、神经网络模块 nn.Module

\`\`\`python
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.fc2(x)

model = MLP()
print(model)  # 打印网络结构
\`\`\`

\`nn.Module\` 设计要点：

- \`__init__\` 中定义层，\`forward\` 中定义前向计算
- 自动注册参数（\`parameters()\`），优化器自动收集
- 嵌套组合：一个 Module 可包含子 Module
- \`.to('cuda')\` 一键搬到 GPU

### 五、训练循环：前向→损失→反向→更新

深度学习训练四步曲：

\`\`\`python
for epoch in range(10):
    for X, y in train_loader:
        X, y = X.to('cuda'), y.to('cuda')
        pred = model(X)              # 1. 前向
        loss = criterion(pred, y)    # 2. 计算损失
        optimizer.zero_grad()        # 3. 清梯度
        loss.backward()              # 4. 反向传播
        optimizer.step()             # 5. 更新参数
\`\`\`

**前向传播**：数据流经网络，产生预测
**损失函数**：衡量预测与真值差距（MSE/CrossEntropy）
**反向传播**：损失对参数求偏导
**参数更新**：优化器按梯度下降调整参数

### 六、简单感知机演示

感知机是最简单的神经网络：单层、二分类、阶跃激活。训练逻辑：

\`\`\`python
z = w·x + b
y_pred = sigmoid(z)
loss = -[y·log(y_pred) + (1-y)·log(1-y_pred)]  # 二元交叉熵
# 梯度
dz = y_pred - y
dw = dz · x
db = dz
# 更新
w -= lr · dw
b -= lr · db
\`\`\`

### 七、GPU 与 CUDA

PyTorch 通过 CUDA 调用 NVIDIA GPU：

\`\`\`python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
tensor = tensor.to(device)
\`\`\`

GPU 优势：矩阵运算高度并行，比 CPU 快 10-100 倍。注意数据与模型必须在**同一设备**，否则报错。

多 GPU 训练：

- \`nn.DataParallel\`：简单数据并行（即将弃用）
- \`nn.parallel.DistributedDataParallel\`：官方推荐，支持多机

### 八、常用损失函数与优化器

| 损失函数 | 适用场景 | 公式 |
|---------|---------|------|
| MSELoss | 回归 | (y-ŷ)² |
| CrossEntropyLoss | 多分类 | -Σy·log(ŷ) |
| BCELoss | 二分类 | -[y·log(ŷ)+(1-y)·log(1-ŷ)] |
| NLLLoss | 配合 LogSoftmax | -Σy·log_softmax |

| 优化器 | 特点 | 适用 |
|--------|------|------|
| SGD | 基础，需调学习率 | 早期/研究 |
| SGD+Momentum | 加动量加速 | CV 任务 |
| Adam | 自适应学习率 | 通用首选 |
| AdamW | Adam + 权重衰减 | Transformer |

### 九、PyTorch vs TensorFlow 对比

| 框架 | 计算图 | 调试 | 背景 | 定位 |
|------|--------|------|------|------|
| PyTorch | 动态（Eager） | Pythonic，可断点 | Meta | 研究主流 |
| TensorFlow 2.x | 动态+静态 | @tf.function 较繁琐 | Google | 生产+研究 |
| JAX | 函数式+autograd | XLA 编译 | Google | 科研前沿 |
| PaddlePaddle | 动态图 | 中文生态 | 百度 | 国内工业 |

### 十、业务场景

- **计算机视觉**：图像分类、目标检测、分割（ResNet/YOLO）
- **NLP**：文本分类、机器翻译、问答（BERT/GPT）
- **语音**：语音识别、合成
- **推荐系统**：深度协同过滤
- **科学计算**：物理仿真、分子建模

### 十一、原理深入

PyTorch 的动态图意味着计算图在每次前向时**即时构建**，反向后立即销毁。这让控制流（if/for）可以自然地写在 forward 中，调试时可以随时 print 中间结果。

底层 Tensor 在 CPU 上调用 ATen（C++ 库），在 GPU 上调用 CUDA/cuDNN。autograd 通过 tape 模式记录运算，反向时按拓扑序调用每个运算的 \`backward\` 实现。

### 十二、最佳实践总结

- 训练前 \`model.train()\`，评估时 \`model.eval()\` + \`torch.no_grad()\`
- 保存模型用 \`state_dict()\` 而非整个 model
- 学习率过大 loss 会 NaN，过小收敛慢，用 ReduceLROnPlateau
- BatchNorm 对 batch size 敏感，太小会失效
- GPU 显存不足：减小 batch / 梯度累积 / 混合精度（amp）
- 用 TensorBoard / Weights&Biases 记录训练曲线
- 数据加载用 DataLoader 多 worker，避免 IO 阻塞`,
    code: `# PyTorch 深度学习概念演示：用纯 Python 实现简单神经网络
# 不依赖 torch，演示 Tensor、自动求导、训练循环

import math
import random

print("=== PyTorch 深度学习概念演示 ===\\n")

print("--- 1. Tensor 概念（用 list 模拟） + 自动求导 ---")

class SimpleTensor:
    """模拟 torch.Tensor + autograd 的核心行为"""
    def __init__(self, data, requires_grad=False):
        self.data = data
        self.requires_grad = requires_grad
        self.grad = None
        self._backward = lambda: None
        self._prev = set()

    def __repr__(self):
        return f"Tensor(data={self.data}, requires_grad={self.requires_grad})"

    def __add__(self, other):
        other = other if isinstance(other, SimpleTensor) else SimpleTensor(other)
        out = SimpleTensor(self.data + other.data, requires_grad=self.requires_grad or other.requires_grad)
        def _backward():
            if self.requires_grad:
                self.grad = 1 * out.grad
            if other.requires_grad:
                other.grad = 1 * out.grad
        out._backward = _backward
        out._prev = {self, other}
        return out

    def __mul__(self, other):
        other = other if isinstance(other, SimpleTensor) else SimpleTensor(other)
        out = SimpleTensor(self.data * other.data, requires_grad=self.requires_grad or other.requires_grad)
        def _backward():
            if self.requires_grad:
                self.grad = other.data * out.grad
            if other.requires_grad:
                other.grad = self.data * out.grad
        out._backward = _backward
        out._prev = {self, other}
        return out

    def backward(self):
        topo = []
        visited = set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)
        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

x = SimpleTensor(2.0, requires_grad=True)
y = SimpleTensor(3.0, requires_grad=True)
z = x * y + x
z.backward()
print(f"  z = x*y + x = {z.data}")
print(f"  dz/dx = {x.grad}  (应为 y+1 = {3.0+1})")
print(f"  dz/dy = {y.grad}  (应为 x = {2.0})")

print("\\n--- 2. 神经网络模块（模拟 nn.Linear） ---")
class Linear:
    def __init__(self, in_features, out_features):
        self.W = [[random.gauss(0, 0.1) for _ in range(in_features)] for _ in range(out_features)]
        self.b = [0.0] * out_features

    def forward(self, x):
        out = []
        for i in range(len(self.W)):
            s = sum(self.W[i][j] * x[j] for j in range(len(x))) + self.b[i]
            out.append(s)
        return out

    def __call__(self, x):
        return self.forward(x)

def relu(x):
    return [max(0, v) for v in x]

def sigmoid(x):
    return [1 / (1 + math.exp(-v)) if v > -30 else 0.0 for v in x]

print("  nn.Linear(in, out) 权重 shape: [out, in]")
layer = Linear(3, 2)
sample = [1.0, 2.0, 3.0]
out = layer(sample)
print(f"  输入: {sample}")
print(f"  Linear 输出: {[round(v, 4) for v in out]}")
print(f"  ReLU 后: {relu(out)}")
print(f"  Sigmoid 后: {[round(v, 4) for v in sigmoid(out)]}")

print("\\n--- 3. 训练循环：前向 -> 损失 -> 反向 -> 更新 ---")
print("  训练目标: AND 逻辑 (二元分类)")
random.seed(42)
W = [random.gauss(0, 0.1), random.gauss(0, 0.1)]
b = 0.0
lr = 0.5
data = [([0, 0], 0), ([0, 1], 0), ([1, 0], 0), ([1, 1], 1)]

for epoch in range(200):
    total_loss = 0
    for x, y_true in data:
        z = W[0] * x[0] + W[1] * x[1] + b
        y_pred = 1 / (1 + math.exp(-z)) if z > -30 else 0.0
        loss = -(y_true * math.log(y_pred + 1e-9) + (1 - y_true) * math.log(1 - y_pred + 1e-9))
        total_loss += loss
        dz = y_pred - y_true
        W[0] -= lr * dz * x[0]
        W[1] -= lr * dz * x[1]
        b -= lr * dz
    if (epoch + 1) % 50 == 0:
        print(f"  epoch {epoch+1:3d}, loss = {total_loss:.4f}")

print(f"\\n  训练后权重: W={[round(w, 3) for w in W]}, b={round(b, 3)}")
for x, y_true in data:
    z = W[0] * x[0] + W[1] * x[1] + b
    y_pred = 1 / (1 + math.exp(-z))
    print(f"  输入 {x}, 真值 {y_true}, 预测 {y_pred:.3f} -> {'1' if y_pred > 0.5 else '0'}")

print("\\n--- 4. GPU 与 CUDA 概念 ---")
print("  PyTorch 中 .to('cuda') 把 Tensor 移到 GPU")
print("  GPU 并行计算优势: 矩阵乘法 10-100x 加速")
print("  注意: 数据与模型必须在同一设备")

print("\\n--- 5. PyTorch vs TensorFlow 对比 ---")
compare = [
    ["PyTorch", "动态图 (Eager)", "Pythonic 调试", "Meta", "研究主流"],
    ["TensorFlow 2.x", "动态+静态", "工业部署成熟", "Google", "生产+研究"],
    ["JAX", "函数式+autograd", "XLA 编译", "Google", "科研前沿"],
    ["PaddlePaddle", "动态图", "中文生态", "百度", "国内工业"],
]
print(f"  {'框架':<14}{'计算图':<18}{'特点':<16}{'背景':<10}{'定位'}")
for row in compare:
    print(f"  {row[0]:<14}{row[1]:<18}{row[2]:<16}{row[3]:<10}{row[4]}")

print("\\n--- 6. nn.Module 典型用法（伪代码） ---")
pseudo = """import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()
    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.fc2(x)

model = MLP().to('cuda')
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()
for epoch in range(10):
    for X, y in train_loader:
        X, y = X.to('cuda'), y.to('cuda')
        pred = model(X)
        loss = criterion(pred, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()"""
print(pseudo)

print("\\n--- 7. 业务场景与避坑 ---")
tips = [
    "训练前 model.train()，评估时 model.eval() 切换",
    "eval() 必须配合 with torch.no_grad() 关闭梯度",
    "保存模型用 state_dict() 而非整个 model",
    "学习率过大 loss 会 NaN，过小收敛慢",
    "BatchNorm 对 batch size 敏感，太小会失效",
    "GPU 显存不足: 减小 batch / 梯度累积 / 混合精度",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== PyTorch 概念演示结束 ===")`
  },
  {
    id: "py6-jupyter",
    group: "数据科学与自动化",
    icon: "📓",
    title: "Jupyter Notebook 与 IPython",
    content: `## Jupyter Notebook 与 IPython

### 一、Jupyter 是什么

Jupyter Notebook 是基于网页的交互式计算环境，名字来源于三大核心语言：**Ju**lia、**Pyt**hon、**R**。它的本质是一个 JSON 文件（\`.ipynb\`），由一个个"单元格"（cell）组成：

- **Code Cell**：可执行代码块，带输出
- **Markdown Cell**：富文本说明，支持公式、图表
- **Raw Cell**：原始内容，不渲染

核心价值：**代码、说明、输出、可视化**一体化，适合数据分析、教学、原型验证。

### 二、IPython 增强特性

Jupyter 的内核是 IPython，它为 Python 交互式解释器增加了大量功能：

\`\`\`python
len?            # 查看对象文档
len??           # 查看源码
!ls -la         # 执行 shell 命令
files = !ls     # shell 结果赋值给变量
%timeit sum(range(100))   # 计时
%pwd            # 当前目录
%who            # 列出变量
\`\`\`

- \`?\` 查看文档，\`??\` 查看源码
- \`!\` 执行 shell 命令
- \`%\` 行魔术命令（line magic）
- \`%%\` 单元格魔术命令（cell magic）
- Tab 自动补全
- \`_\` 上一个输出，\`__\` 倒数第二个

### 三、魔术命令

| 命令 | 类型 | 作用 |
|------|------|------|
| %timeit | line | 测量单行执行时间 |
| %%timeit | cell | 测量整个 cell 时间 |
| %matplotlib inline | line | Jupyter 内联显示图表 |
| %pwd | line | 显示工作目录 |
| %ls | line | 列目录 |
| %who | line | 列出变量 |
| %%writefile | cell | 写入文件 |
| %load_ext | line | 加载扩展 |
| %history | line | 查看历史 |
| %%time | cell | 计时（单次） |

\`\`\`python
%timeit sum(range(1000))
# 10.5 µs ± 200 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)
\`\`\`

### 四、交互式开发流程

Jupyter 的典型数据分析流程：

1. 导入库，加载数据
2. 探索：\`df.head()\`、\`df.describe()\`、\`df.info()\`
3. 清洗：处理缺失值、异常值
4. 可视化：\`df.plot()\` 看分布
5. 建模：训练模型，评估
6. 总结：Markdown 写结论

每个单元格独立执行，变量在内核中持久。但**执行顺序**很重要——如果跳跃执行，状态可能不一致。

### 五、Notebook vs 脚本对比

| 维度 | Notebook | 脚本 .py |
|------|---------|---------|
| 模式 | 交互式 | 批处理 |
| 场景 | 探索/教学/原型 | 生产/部署/CI |
| 状态 | 单元格顺序执行易乱 | 顺序明确 |
| 版本控制 | JSON 输出难 diff | 干净 |
| 调试 | 单元格逐步 | 断点调试 |
| 复用 | 难模块化 | 可 import |

> ⚠️ **避坑提示**：Notebook 单元格执行顺序混乱是头号陷阱。\`Kernel → Restart & Run All\` 可以重置状态、按顺序重跑，交付前务必做一次。

### 六、业务场景

- **数据分析报告**：Markdown + 代码 + 图表，一体化交付给非技术人员
- **教学演示**：逐 cell 运行，配合可视化讲解算法
- **原型验证**：快速试错，验证想法后再转脚本
- **机器学习实验**：记录超参/指标/图表，可复现
- **数据科学作品集**：nbviewer 在线展示

### 七、vs Colab / Kaggle

| 平台 | 部署 | 优势 | 限制 |
|------|------|------|------|
| Jupyter 本地 | 本机 | 自由装库 | 受限于本机性能 |
| Google Colab | 云端 | 免费 GPU (T4) | 会话断连、资源限制 |
| Kaggle Notebook | 云端 | 内置数据集/比赛 | 每周 30h GPU |
| JupyterHub | 自部署 | 团队共享 | 需运维 |
| Deepnote | 云端 | 协作友好 | 免费版有限 |

### 八、原理深入

Jupyter 架构是**前后端分离**：

- **前端**：浏览器中的 Notebook 界面（基于 React）
- **服务端**：Jupyter Server，管理文件、内核、会话
- **内核**：IPython（或其他语言内核），执行代码、返回输出
- **协议**：ZeroMQ + WebSocket 通信

每个 Notebook 对应一个内核进程，状态保存在内存中。关闭浏览器不杀内核，重新打开可恢复。但内核崩溃或重启，内存状态丢失。

\`.ipynb\` 文件是 JSON，结构为 \`{cells: [...], metadata: {...}, nbformat: 4}\`。每个 cell 有 \`cell_type\`、\`source\`、\`outputs\`、\`execution_count\`。

### 九、最佳实践总结

- 交付前 \`Kernel → Restart & Run All\` 重置状态
- 提交版本控制前用 \`nbstripout\` 清除输出，减少 diff 噪声
- 生产代码不要用 Notebook，转 \`.py\` 脚本（用 \`jupyter nbconvert --to script\`）
- 用 \`papermill\` 参数化批量执行 Notebook
- 项目结构：\`notebooks/\` \`src/\` \`data/\` \`models/\`
- 调试用 \`%debug\` 进入交互式 pdb
- 大数组用 \`%memit\` 监控内存
- 用 \`%%time\` 标记耗时单元格，定位性能瓶颈
- 重要实验记录超参和随机种子，保证可复现`,
    code: `# Jupyter Notebook 与 IPython 概念演示
# 模拟魔术命令、单元格交互式开发流程

import time
import math

print("=== Jupyter Notebook 与 IPython 概念演示 ===\\n")

print("--- 1. Jupyter Notebook 结构 ---")
print("  Notebook (.ipynb) 本质是 JSON 文件，包含:")
print("    - code cells: 可执行代码块")
print("    - markdown cells: 富文本说明")
print("    - output: 执行结果（文本/图片/HTML）")
print()
print("  ┌─────────────────────────────┐")
print("  │ [Markdown] # 数据分析报告   │")
print("  │ [Code]     import pandas    │")
print("  │ [Output]   (无)             │")
print("  │ [Code]     df.head()        │")
print("  │ [Output]   表格显示         │")
print("  │ [Markdown] ## 结论          │")
print("  └─────────────────────────────┘")

print("\\n--- 2. 魔术命令模拟（%timeit） ---")
def timeit_demo(func, number=10000):
    start = time.perf_counter()
    for _ in range(number):
        func()
    elapsed = time.perf_counter() - start
    return elapsed / number * 1e6

r1 = timeit_demo(lambda: sum(range(100)))
r2 = timeit_demo(lambda: list(range(100)))
print(f"  %timeit sum(range(100))  -> {r1:.2f} us per loop")
print(f"  %timeit list(range(100)) -> {r2:.2f} us per loop")

print("\\n  常用魔术命令:")
magics = [
    ["%timeit", "测量单行执行时间"],
    ["%%timeit", "测量整个 cell 执行时间"],
    ["%matplotlib inline", "Jupyter 内联显示图表"],
    ["%pwd", "显示当前工作目录"],
    ["%ls", "列目录"],
    ["%who", "列出当前变量"],
    ["%%writefile", "把 cell 内容写入文件"],
    ["%load_ext", "加载扩展"],
]
print(f"  {'命令':<22}{'作用'}")
for row in magics:
    print(f"  {row[0]:<22}{row[1]}")

print("\\n--- 3. 交互式开发流程模拟 ---")
history = []
def run_cell(code):
    namespace = {}
    try:
        exec(code, namespace)
        last_var = None
        for name in namespace:
            if not name.startswith('_'):
                last_var = namespace[name]
        idx = len(history) + 1
        history.append((f"In [{idx}]", code))
        return last_var
    except Exception as e:
        return f"Error: {e}"

print("  模拟数据分析 Notebook 流程:")
cells = [
    "import math",
    "data = [1, 2, 3, 4, 5]",
    "mean = sum(data) / len(data)",
    "variance = sum((x - mean) ** 2 for x in data) / len(data)",
    "std = math.sqrt(variance)",
]
for code in cells:
    result = run_cell(code)
    print(f"  In [{len(history)}]: {code}")
    if result is not None and not callable(result):
        print(f"  Out[{len(history)}]: {result}")

print("\\n--- 4. Notebook vs 脚本对比 ---")
compare = [
    ["Notebook", "交互式", "数据分析/探索/教学", "单元格顺序执行易乱"],
    ["脚本 .py", "批处理", "生产/部署/CI", "顺序明确"],
    ["IDE (PyCharm)", "GUI 调试", "大型项目开发", "断点调试强"],
]
print(f"  {'形式':<14}{'模式':<12}{'场景':<22}{'特点'}")
for row in compare:
    print(f"  {row[0]:<14}{row[1]:<12}{row[2]:<22}{row[3]}")

print("\\n--- 5. IPython 增强特性 ---")
features = [
    "?  查看对象文档:  len?  -> 显示 help(len)",
    "?? 查看源码:     len?? -> 显示源代码",
    "!  执行 shell:   !ls -la",
    "%  魔术命令:      %timeit sum(range(100))",
    "Tab 自动补全:    import o<Tab> -> os/operator",
    "Shell 赋值:      files = !ls",
    "历史访问:        _ / __ / _i / %history",
]
for f in features:
    print(f"  {f}")

print("\\n--- 6. 业务场景 ---")
scenes = [
    "数据分析报告: Markdown + 代码 + 图表一体化交付",
    "教学演示: 逐 cell 运行，配合可视化讲解算法",
    "原型验证: 快速试错，验证想法后再转脚本",
    "机器学习实验: 记录超参/指标/图表，可复现",
    "数据科学作品集: nbviewer 在线展示",
]
for i, s in enumerate(scenes, 1):
    print(f"  {i}. {s}")

print("\\n--- 7. vs Colab / Kaggle ---")
cloud = [
    ["Jupyter 本地", "本机", "自由装库", "受限于本机性能"],
    ["Google Colab", "云端", "免费 GPU (T4)", "会话断连/资源限制"],
    ["Kaggle Notebook", "云端", "内置数据集/比赛", "每周 30h GPU"],
    ["JupyterHub", "自部署", "团队共享", "需运维"],
]
print(f"  {'平台':<16}{'部署':<10}{'优势':<20}{'限制'}")
for row in cloud:
    print(f"  {row[0]:<16}{row[1]:<10}{row[2]:<20}{row[3]}")

print("\\n--- 8. 避坑提示与最佳实践 ---")
tips = [
    "单元格执行顺序混乱: 用 Kernel -> Restart & Run All 重置",
    "提交版本控制前用 nbstripout 清除输出",
    "生产代码不要用 Notebook，转 .py 脚本",
    "用 papermill 参数化批量执行 Notebook",
    "数据科学项目结构: notebooks/ src/ data/ models/",
    "调试用 %debug 进入交互式 pdb",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== Jupyter 概念演示结束 ===")`
  },
  {
    id: "py6-automation-script",
    group: "数据科学与自动化",
    icon: "🤖",
    title: "自动化运维脚本",
    content: `## 自动化运维脚本

### 一、为什么需要自动化脚本

重复性工作是工程师的敌人。手动执行 100 次备份、100 次部署，难免出错。自动化脚本的价值：

- **减少重复劳动**：脚本写一次，运行无数次
- **避免人为错误**：机器不会"今天状态不好"
- **可审计可复现**：脚本即文档，结果可追溯
- **解放大脑**：让工程师专注创造性工作

Python 在运维领域广受欢迎，因为标准库覆盖了文件、进程、网络、系统调用，跨平台且易读。

### 二、文件批量处理（os/glob/shutil）

\`\`\`python
import os
import glob
import shutil

# glob 模式匹配
log_files = glob.glob('/var/log/app_*.log')
for f in log_files:
    mtime = os.path.getmtime(f)
    size = os.path.getsize(f)
    print(f"{f}: {size}B, modified {mtime}")

# 批量归档
archive = '/backup/logs'
os.makedirs(archive, exist_ok=True)
for f in log_files:
    shutil.move(f, os.path.join(archive, os.path.basename(f)))
\`\`\`

三个模块分工：

- **os**：路径操作、权限、环境变量
- **glob**：Unix shell 风格的文件匹配
- **shutil**：高级文件操作（复制/移动/删除目录/压缩）

### 三、subprocess 调用系统命令

\`\`\`python
import subprocess

result = subprocess.run(
    ['git', 'status', '--porcelain'],
    capture_output=True, text=True, timeout=10, check=True
)
print(result.stdout)
\`\`\`

关键参数：

- \`capture_output=True\`：捕获 stdout/stderr
- \`text=True\`：输出为字符串（默认 bytes）
- \`timeout=30\`：超时抛 \`TimeoutExpired\`
- \`check=True\`：返回码非 0 抛 \`CalledProcessError\`

> ⚠️ **避坑提示**：永远不要用 \`shell=True\` 拼接用户输入，会有命令注入风险。用列表传参：\`subprocess.run(['ls', user_input])\` 而非 \`subprocess.run(f'ls {user_input}', shell=True)\`。

### 四、日志记录

\`\`\`python
import logging

logger = logging.getLogger('auto_script')
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter(
    '%(asctime)s [%(levelname)s] %(message)s'
))
logger.addHandler(handler)

logger.info('脚本启动')
logger.warning('磁盘空间不足')
\`\`\`

日志级别：DEBUG < INFO < WARNING < ERROR < CRITICAL。生产环境一般设 INFO，调试时设 DEBUG。

### 五、配置文件读取

\`\`\`python
import json

# JSON 配置
with open('config.json') as f:
    config = json.load(f)

# ini 配置
import configparser
cfg = configparser.ConfigParser()
cfg.read('config.ini')
host = cfg['database']['host']
\`\`\`

推荐用 YAML 或 TOML，比 JSON 更适合人类编写，支持注释。\`pyproject.toml\` 已成为 Python 项目配置标准。

### 六、定时任务

生产环境定时任务方案：

| 方案 | 平台 | 特点 |
|------|------|------|
| cron | Linux | 系统级，最稳定 |
| Windows 任务计划 | Windows | 图形化 |
| schedule 库 | Python | 简单，常驻进程 |
| APScheduler | Python | 支持 cron+持久化+分布式 |
| Celery beat | 分布式 | 配合消息队列 |

\`\`\`bash
# crontab -e
0 2 * * * /usr/bin/python3 /opt/scripts/backup.py
\`\`\`

### 七、幂等性与错误处理

**幂等性**：同一操作执行一次和多次效果相同。运维脚本必须幂等，因为定时任务可能重复触发、网络可能重试。

\`\`\`python
def idempotent_backup(src, state_file='state.json'):
    done = set()
    if os.path.exists(state_file):
        with open(state_file) as f:
            done = set(json.load(f))
    if src in done:
        return  # 已处理，跳过
    shutil.copy(src, '/backup/')
    done.add(src)
    with open(state_file, 'w') as f:
        json.dump(list(done), f)
\`\`\`

**错误处理**：网络请求必加 timeout 和重试：

\`\`\`python
def retry(func, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
\`\`\`

### 八、业务场景

- **每日定时备份**：tar 打包 → 上传 OSS → 清理旧备份
- **数据同步**：拉取 API → 清洗 → 写入数据库
- **报表生成**：查询 SQL → 渲染模板 → 邮件发送
- **日志清理**：找出 7 天前日志 → 压缩 → 归档
- **部署脚本**：拉代码 → 装依赖 → 跑测试 → 重启服务

### 九、原理深入

Python 自动化脚本的强大源于标准库的系统调用封装：

- \`os\` 模块本质是对 POSIX/C 标准库的薄封装（\`os.open\` → \`open(2)\`）
- \`subprocess\` 用 fork+exec（Unix）或 CreateProcess（Windows）启动子进程
- \`shutil\` 在 \`os\` 之上提供高层文件操作，处理跨平台差异

理解这一点，遇到奇怪行为就能定位到系统层面。

### 十、最佳实践总结

- 脚本开头加 \`set -e\`（shell）或检查返回码（Python），失败立即退出
- 日志结构化（JSON），便于 ELK 采集
- 关键操作幂等设计，支持安全重试
- 网络请求必加 timeout 和重试
- 密钥用环境变量 / vault，不硬编码
- 脚本加 \`--dry-run\` 选项，先预览再执行
- 用 argparse 暴露参数，避免改代码调参
- 复杂流程考虑用 Ansible 替代手写脚本`,
    code: `# 自动化运维脚本演示：纯标准库实现文件批处理、定时任务、日志

import os
import glob
import shutil
import subprocess
import json
import time
import logging
import tempfile

print("=== 自动化运维脚本演示 ===\\n")

print("--- 1. 文件批量处理（os/glob/shutil） ---")
work_dir = tempfile.mkdtemp(prefix="auto_demo_")
print(f"  工作目录: {work_dir}")
log_files = ["app_20240101.log", "app_20240102.log", "error_20240101.log", "readme.txt"]
for fname in log_files:
    with open(os.path.join(work_dir, fname), 'w') as f:
        f.write(f"content of {fname}\\n")

print("\\n  glob 匹配 *.log:")
for f in glob.glob(os.path.join(work_dir, "*.log")):
    print(f"    {os.path.basename(f)}")

archive_dir = os.path.join(work_dir, "archive")
os.makedirs(archive_dir, exist_ok=True)
for f in glob.glob(os.path.join(work_dir, "*.log")):
    shutil.move(f, os.path.join(archive_dir, os.path.basename(f)))
print(f"\\n  归档后 archive/ 内容:")
for f in os.listdir(archive_dir):
    print(f"    {f}")
shutil.rmtree(work_dir)

print("\\n--- 2. subprocess 调用系统命令 ---")
result = subprocess.run(["python3", "--version"], capture_output=True, text=True)
print(f"  命令: python3 --version")
print(f"  returncode: {result.returncode}")
print(f"  stdout: {result.stdout.strip()}")
print("\\n  避坑: 永远不要用 shell=True 拼接用户输入!")
print("    危险: subprocess.run(f'ls {user_input}', shell=True)")
print("    安全: subprocess.run(['ls', user_input])")

print("\\n--- 3. 日志记录 ---")
logger = logging.getLogger("auto_script")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S'))
logger.handlers = [handler]
logger.propagate = False
logger.info("脚本启动")
logger.warning("这是一个警告")
logger.debug("调试信息（DEBUG 级别）")

print("\\n--- 4. 配置文件读取（JSON） ---")
config = {"backup_dir": "/tmp/backups", "max_files": 100, "schedule": "0 2 * * *"}
config_path = "/tmp/auto_config.json"
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
with open(config_path) as f:
    loaded = json.load(f)
print(f"  配置: {loaded}")
os.remove(config_path)

print("\\n--- 5. 定时任务概念（schedule 模拟） ---")
print("  生产环境定时任务方案:")
options = [
    "cron (Linux): crontab -e 添加 0 2 * * * /path/script.py",
    "Windows 任务计划程序: 图形化配置",
    "schedule 库: Python 内常驻进程",
    "APScheduler: 支持 cron + 持久化 + 分布式",
    "Celery beat: 分布式任务队列定时器",
]
for o in options:
    print(f"    - {o}")

print("\\n--- 6. 幂等性与错误处理 ---")
def idempotent_copy(src, dst, state_file="/tmp/copy_state.json"):
    done = set()
    if os.path.exists(state_file):
        with open(state_file) as f:
            done = set(json.load(f))
    if src in done:
        print(f"  跳过（已处理）: {src}")
        return False
    print(f"  处理中: {src} -> {dst}")
    done.add(src)
    with open(state_file, 'w') as f:
        json.dump(list(done), f)
    return True

state = "/tmp/copy_state.json"
if os.path.exists(state):
    os.remove(state)
idempotent_copy("file1.txt", "backup/file1.txt", state)
idempotent_copy("file1.txt", "backup/file1.txt", state)
os.remove(state)

print("\\n  错误处理最佳实践:")
best = [
    "网络请求必加 timeout 和重试",
    "文件操作检查权限，捕获 PermissionError",
    "用幂等设计避免重复执行副作用",
    "失败时记录上下文，便于排查",
    "关键操作加分布式锁防止并发重复",
]
for b in best:
    print(f"    - {b}")

print("\\n--- 7. 业务场景与最佳实践总结 ---")
scenes = [
    "每日定时备份: tar 打包 -> 上传 OSS -> 清理旧备份",
    "数据同步: 拉取 API -> 清洗 -> 写入数据库",
    "报表生成: 查询 SQL -> 渲染模板 -> 邮件发送",
    "日志清理: 找出 7 天前日志 -> 压缩 -> 归档",
    "部署脚本: 拉代码 -> 装依赖 -> 跑测试 -> 重启服务",
]
for i, s in enumerate(scenes, 1):
    print(f"  {i}. {s}")

print("\\n=== 自动化脚本演示结束 ===")`
  },
  {
    id: "py6-tkinter",
    group: "数据科学与自动化",
    icon: "🖥️",
    title: "Tkinter 桌面 GUI 开发",
    content: `## Tkinter 桌面 GUI 开发

### 一、Tkinter 是什么

Tkinter 是 Python 标准库唯一的 GUI 工具包，基于 Tcl/Tk 脚本语言。优势是**无需安装**，\`import tkinter\` 即可用，跨平台（Windows/macOS/Linux）。

\`\`\`python
import tkinter as tk

root = tk.Tk()
root.title("我的第一个窗口")
root.geometry("400x300")
label = tk.Label(root, text="Hello, Tkinter!")
label.pack(padx=20, pady=20)
root.mainloop()
\`\`\`

\`mainloop()\` 启动事件循环，阻塞主线程直到窗口关闭。

### 二、常用组件

| 组件 | 作用 | 关键属性 |
|------|------|---------|
| Label | 显示文本/图片 | text, font, fg, bg |
| Button | 可点击按钮 | text, command, state |
| Entry | 单行输入 | textvariable, show, width |
| Text | 多行文本 | width, height |
| Checkbutton | 复选框 | variable (IntVar) |
| Radiobutton | 单选框 | variable, value |
| Listbox | 列表选择 | height, selectmode |
| Combobox | 下拉框（ttk） | values |
| Scale | 滑块 | from_, to, orient |
| Canvas | 画布绘图 | width, height |
| Menu | 菜单 | tearoff |

\`\`\`python
# 密码输入框
pwd = tk.Entry(root, show="*", width=20)
# 禁用按钮
btn = tk.Button(root, text="提交", state=tk.DISABLED)
\`\`\`

### 三、布局管理器 pack/grid/place

Tkinter 三种布局方式，**同一父容器只能用一种**：

**1. pack**：顺序堆叠，简单

\`\`\`python
tk.Label(root, text="A").pack(side="top")
tk.Label(root, text="B").pack(side="bottom")
tk.Label(root, text="C").pack(side="left", fill="x", expand=True)
\`\`\`

**2. grid**：网格布局，最常用

\`\`\`python
tk.Label(root, text="用户名").grid(row=0, column=0, sticky="e")
tk.Entry(root).grid(row=0, column=1)
tk.Label(root, text="密码").grid(row=1, column=0)
tk.Entry(root, show="*").grid(row=1, column=1)
tk.Button(root, text="登录").grid(row=2, column=1, sticky="w")
\`\`\`

**3. place**：绝对坐标，少用

\`\`\`python
tk.Label(root, text="X").place(x=100, y=50, anchor="center")
\`\`\`

| 管理器 | 原理 | 适用 | 缺点 |
|--------|------|------|------|
| pack | 顺序堆叠 | 简单工具栏 | 无法精确控制 |
| grid | 网格 | 表单/对话框 | 跨行跨列需配置 |
| place | 绝对坐标 | 自定义叠加 | 窗口缩放易乱 |

> 💡 **避坑提示**：推荐优先用 grid，它最灵活。表单类界面用 grid 配合 \`sticky\` 对齐，效果接近 CSS Grid。

### 四、事件绑定

**方式 1：command 属性**（按钮专用）

\`\`\`python
def on_click():
    print("被点击")
btn = tk.Button(root, text="点击", command=on_click)
\`\`\`

**方式 2：bind 绑定任意事件**

\`\`\`python
def on_key(event):
    print(f"按下: {event.char}, 键码: {event.keycode}")

root.bind("<Key>", on_key)
root.bind("<Return>", lambda e: print("回车"))
canvas.bind("<Button-1>", on_click)   # 鼠标左键
\`\`\`

常用事件：

| 事件序列 | 说明 |
|---------|------|
| \<Button-1\> | 鼠标左键点击 |
| \<Double-Button-1\> | 左键双击 |
| \<Return\> | 回车键 |
| \<Key\> | 任意按键 |
| \<Motion\> | 鼠标移动 |
| \<Configure\> | 窗口大小改变 |

### 五、变量绑定（textvariable）

Tkinter 用特殊变量类实现双向绑定：

\`\`\`python
name_var = tk.StringVar(value="初始值")
entry = tk.Entry(root, textvariable=name_var)
# 取值
print(name_var.get())
# 设值
name_var.set("新值")
# 监听变化
name_var.trace_add("write", callback)
\`\`\`

变量类型：\`StringVar\`、\`IntVar\`、\`DoubleVar\`、\`BooleanVar\`。

### 六、ttk 主题组件

\`tkinter.ttk\` 提供更现代的主题组件，跨平台外观统一：

\`\`\`python
from tkinter import ttk

btn = ttk.Button(root, text="现代按钮")
combo = ttk.Combobox(root, values=["A", "B", "C"])
tree = ttk.Treeview(root, columns=("name", "age"))
\`\`\`

ttk 组件外观跟随系统主题，比原生 Tkinter 美观。

### 七、业务场景

- **内部工具**：数据库管理、配置生成器
- **简单 GUI**：文件批量重命名、格式转换
- **教学演示**：算法可视化、数学绘图
- **小型应用**：记事本、计算器、待办

### 八、GUI 库对比

| 库 | 基础 | 优势 | 劣势 | 场景 |
|----|------|------|------|------|
| Tkinter | 标准库 | 无需安装 | 外观老旧 | 简单工具/教学 |
| PyQt/PySide | Qt | 功能强大 | 体积大/许可复杂 | 专业桌面应用 |
| wxPython | wxWidgets | 原生外观 | 文档少 | 跨平台桌面 |
| Kivy | 自绘 | 支持触屏/移动 | 学习曲线陡 | 多点触控 |
| DearPyGui | GPU 渲染 | 高性能 | 生态小 | 实时数据可视化 |

### 九、原理深入

Tkinter 是 Tcl/Tk 的 Python 绑定。当你调用 \`tk.Label()\`，实际通过 Tcl 解释器执行 Tk 命令。这种桥接带来性能开销，但保证了跨平台一致性。

事件循环 \`mainloop()\` 是一个无限循环：

1. 从系统消息队列取事件（鼠标/键盘/定时器）
2. 分发到对应组件的回调
3. 重绘受影响区域
4. 重复

所以 GUI 主线程不能执行耗时操作，否则界面卡死。耗时任务必须放子线程，但**子线程不能直接操作 UI**，需要用 \`widget.after()\` 或队列通信。

### 十、最佳实践总结

- 优先用 grid 布局，配合 sticky 对齐
- 耗时任务用 threading 或 subprocess，避免阻塞 UI
- 跨线程更新 UI 用 \`widget.after()\` 或 queue 通信
- 用 \`.pyw\` 扩展名（Windows）双击不弹控制台
- 用 pyinstaller / py2app 打包成可执行文件分发
- 窗口关闭事件用 \`protocol('WM_DELETE_WINDOW', handler)\` 拦截
- 用 ttk 替代原生组件，外观更现代
- 复杂界面拆分 Frame，模块化管理`,
    code: `# Tkinter 桌面 GUI 开发概念演示
# 注意：不调用 mainloop()，仅演示组件创建逻辑

print("=== Tkinter 桌面 GUI 开发概念演示 ===\\n")

print("--- 1. Tkinter 标准库基础 ---")
print("  Tkinter 是 Python 标准库，无需 pip install")
print("  导入: import tkinter as tk (Python 3)")
print()

# 模拟 Tkinter API（实际环境若未安装 _tkinter，用 mock 演示概念）
class _MockWidget:
    """模拟 tk.Label / Entry / Button 的 cget 接口"""
    def __init__(self, master=None, **opts):
        self._opts = opts
    def cget(self, key):
        return self._opts.get(key, "")

class _MockTk:
    """模拟 tk.Tk() 主窗口"""
    def __init__(self):
        self._title = ""
        self._geometry = ""
    def title(self, text=None):
        if text is None:
            return self._title
        self._title = text
    def geometry(self, g):
        self._geometry = g
    def destroy(self):
        pass

# 尝试真实 tkinter，失败则用 mock
try:
    import tkinter as tk
    _use_real = True
except (ImportError, ModuleNotFoundError):
    tk = type("tk", (), {"Tk": _MockTk, "Label": _MockWidget,
                         "Entry": _MockWidget, "Button": _MockWidget,
                         "NORMAL": "normal"})()
    _use_real = False
    print("  [注] 当前环境未安装 _tkinter，使用 mock 模拟 API 演示概念")
    print()

root = tk.Tk()
root.title("演示窗口")
root.geometry("400x300")
print(f"  窗口标题: {root.title()}")
print(f"  窗口大小: 400x300")

print("\\n--- 2. 常用组件 ---")
label = tk.Label(root, text="用户名:", font=("Arial", 12))
entry = tk.Entry(root, width=20, show="*")
btn = tk.Button(root, text="登录", state=tk.NORMAL)
print(f"  Label: {label.cget('text')}")
print(f"  Entry 宽度: {entry.cget('width')}, show='{entry.cget('show')}'")
print(f"  Button: {btn.cget('text')}, state={btn.cget('state')}")

components = [
    ["Label", "显示文本/图片", "tk.Label(root, text='Hello')"],
    ["Button", "可点击按钮", "tk.Button(root, text='OK', command=func)"],
    ["Entry", "单行输入", "tk.Entry(root, show='*')"],
    ["Text", "多行文本", "tk.Text(root, width=40, height=10)"],
    ["Checkbutton", "复选框", "tk.Checkbutton(root, text='同意')"],
    ["Combobox", "下拉框 (ttk)", "ttk.Combobox(root, values=['A','B'])"],
    ["Scale", "滑块", "tk.Scale(root, from_=0, to=100)"],
    ["Canvas", "画布绘图", "tk.Canvas(root, width=200, height=200)"],
]
print(f"\\n  {'组件':<14}{'作用':<16}{'示例'}")
for row in components:
    print(f"  {row[0]:<14}{row[1]:<16}{row[2]}")

print("\\n--- 3. 布局管理器 pack/grid/place ---")
print("  pack 布局（顺序堆叠）: side 选项 top/bottom/left/right")
print("  grid 布局（网格，推荐）: row=0, column=0, sticky='e'")
print("  place 布局（绝对坐标）: x=100, y=50")
print()
print("  网格布局可视化:")
grid_layout = [["用户:", "[___________]"], ["密码:", "[***********]"], ["", "[  登录  ] [取消]"]]
for row in grid_layout:
    print(f"    {'  '.join(row)}")

print("\\n  三种布局对比:")
layouts = [
    ["pack", "顺序堆叠", "简单工具栏", "无法精确控制"],
    ["grid", "网格", "表单/对话框", "组件跨行跨列需配置"],
    ["place", "绝对坐标", "自定义叠加", "窗口缩放易乱"],
]
print(f"  {'管理器':<10}{'原理':<12}{'适用':<16}{'缺点'}")
for row in layouts:
    print(f"  {row[0]:<10}{row[1]:<12}{row[2]:<16}{row[3]}")

print("\\n--- 4. 事件绑定 ---")
print("  方式 1: command 属性（按钮专用）")
print("    Button(root, text='登录', command=on_login)")
print("\\n  方式 2: bind 绑定任意事件")
events = [["<Button-1>", "鼠标左键点击"], ["<Double-Button-1>", "鼠标左键双击"],
          ["<Return>", "回车键"], ["<Key>", "任意按键"], ["<Configure>", "窗口大小改变"]]
print(f"  {'事件':<24}{'说明'}")
for e, d in events:
    print(f"  {e:<24}{d}")

print("\\n--- 5. 模拟登录表单完整逻辑 ---")
class LoginForm:
    def __init__(self):
        self.attempts = 0
        print("    创建: Label('用户名') + Entry")
        print("    创建: Label('密码') + Entry(show='*')")
        print("    创建: Button('登录', command=self.check)")

    def check(self):
        self.attempts += 1
        user, pwd = "admin", "123456"
        if user == "admin" and pwd == "123456":
            print(f"    -> 登录成功!")
            return True
        print(f"    -> 登录失败，第 {self.attempts} 次尝试")
        return False

print("  模拟登录表单创建:")
form = LoginForm()
print("  模拟点击登录:")
form.check()

print("\\n--- 6. ttk 主题组件 ---")
print("  tkinter.ttk 提供更现代的主题组件")
print("  from tkinter import ttk")
print("  ttk.Button / ttk.Entry / ttk.Combobox / ttk.Treeview")
print("  优势: 跨平台外观统一，支持主题切换")

print("\\n--- 7. GUI 库对比 ---")
compare = [
    ["Tkinter", "标准库", "无需安装", "外观老旧", "简单工具/教学"],
    ["PyQt/PySide", "Qt 封装", "功能强大", "体积大/许可复杂", "专业桌面应用"],
    ["wxPython", "wxWidgets", "原生外观", "文档少", "跨平台桌面"],
    ["Kivy", "自绘", "支持触屏/移动", "学习曲线陡", "多点触控应用"],
]
print(f"  {'库':<14}{'基础':<12}{'优势':<16}{'劣势':<16}{'场景'}")
for row in compare:
    print(f"  {row[0]:<14}{row[1]:<12}{row[2]:<16}{row[3]:<16}{row[4]}")

print("\\n--- 8. 业务场景与避坑 ---")
tips = [
    "GUI 主线程不能阻塞，耗时任务用 threading 或 subprocess",
    "跨线程更新 UI 必须用 widget.after() 或 queue 通信",
    "用 .pyw 扩展名双击运行不弹控制台（Windows）",
    "用 pyinstaller / py2app 打包成可执行文件",
    "窗口关闭事件用 protocol('WM_DELETE_WINDOW', handler) 拦截",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

root.destroy()
print("\\n=== Tkinter 概念演示结束 ===")`
  },
  {
    id: "py6-pyqt",
    group: "数据科学与自动化",
    icon: "🎨",
    title: "PyQt/PySide 高级 GUI",
    content: `## PyQt/PySide 高级 GUI

### 一、Qt 框架概览

Qt 是跨平台 C++ GUI 框架，1991 年由挪威 Trolltech 公司创建，现为 Qt Company 维护。它是工业级桌面应用开发的事实标准，覆盖 Windows/macOS/Linux/移动端/嵌入式。

Python 绑定主要有两套：

| 绑定 | 维护方 | 许可 | 状态 |
|------|--------|------|------|
| PyQt5/PyQt6 | Riverbank | GPL/商业双许可 | 最广泛使用 |
| PySide6 (Qt6) | Qt 官方 | LGPL | 官方推荐 |
| PyQt4 | Riverbank | GPL/商业 | 已淘汰 |

> 💡 **选型建议**：商业闭源项目选 PySide6（LGPL 友好）或购买 PyQt 商业授权；开源项目两者均可，API 几乎一致。

### 二、信号与槽机制

信号与槽（Signal & Slot）是 Qt 的核心创新，用于对象间通信：

- **信号（Signal）**：事件发生时发射，如按钮点击 \`clicked\`
- **槽（Slot）**：响应信号的函数
- **连接**：\`signal.connect(slot)\` 把信号连到槽
- **多对多**：一个信号可连多个槽，一个槽可接多个信号

\`\`\`python
from PyQt6.QtWidgets import QPushButton

btn = QPushButton("提交")
btn.clicked.connect(on_submit)   # 连接信号到槽
btn.clicked.connect(on_log)      # 一个信号连多个槽
btn.clicked.emit()               # 手动发射信号
\`\`\`

与回调函数对比：

| 机制 | 关系 | 优势 | 备注 |
|------|------|------|------|
| 信号槽 | 多对多 | 松耦合，可动态连接/断开 | Qt 独有 |
| 回调函数 | 一对一 | 简单直接 | 耦合较紧 |
| 事件监听 | 一对多 | Web/Java 风格 | 需注册/注销管理 |

### 三、自定义信号

\`\`\`python
from PyQt6.QtCore import pyqtSignal, QObject

class LoginWidget(QObject):
    login_success = pyqtSignal()        # 无参信号
    login_failed = pyqtSignal(str)      # 带 str 参数

    def do_login(self, user, pwd):
        if self.verify(user, pwd):
            self.login_success.emit()
        else:
            self.login_failed.emit("密码错误")

widget = LoginWidget()
widget.login_success.connect(show_main)
widget.login_failed.connect(show_error)
\`\`\`

自定义信号让组件解耦：组件只发射信号，不关心谁处理。

### 四、常用组件

| 组件 | 说明 |
|------|------|
| QMainWindow | 主窗口（含菜单栏/工具栏/状态栏） |
| QWidget | 所有 UI 组件基类 |
| QLabel | 文本/图片标签 |
| QPushButton | 按钮 |
| QLineEdit | 单行输入 |
| QTextEdit | 多行富文本 |
| QComboBox | 下拉选择 |
| QTableWidget | 表格 |
| QTreeWidget | 树形列表 |
| QMenuBar/QToolBar | 菜单栏/工具栏 |
| QDialog | 对话框（模态/非模态） |
| QFileDialog | 文件选择 |
| QMessageBox | 消息提示 |

### 五、布局管理器

\`\`\`python
from PyQt6.QtWidgets import QHBoxLayout, QVBoxLayout, QGridLayout, QFormLayout

hbox = QHBoxLayout()       # 水平堆叠 [A][B][C]
vbox = QVBoxLayout()       # 垂直堆叠
grid = QGridLayout()       # 网格
form = QFormLayout()       # 表单：标签: 输入框
\`\`\`

| 布局 | 原理 | 示意 |
|------|------|------|
| QHBoxLayout | 水平堆叠 | [A][B][C] |
| QVBoxLayout | 垂直堆叠 | [A]/[B]/[C] |
| QGridLayout | 网格 | 行列定位 |
| QFormLayout | 表单 | 标签: 输入框 |
| QStackedLayout | 堆叠切换 | 同位置切换页面 |

### 六、Designer 可视化设计

Qt Designer 可拖拽设计 UI，生成 \`.ui\` 文件（XML 格式）：

\`\`\`bash
# 转换为 Python 代码
pyuic5 -o ui_main.py main.ui       # PyQt5
pyside6-uic -o ui_main.py main.ui  # PySide6

# 或运行时动态加载
from PyQt6 import uic
Form, Class = uic.loadUiType('main.ui')
\`\`\`

Designer 适合复杂界面，避免手写大量布局代码。

### 七、Model/View 架构

Qt 对表格/树/列表采用 Model/View 分离：

- **Model**：数据抽象（\`QAbstractTableModel\` 等）
- **View**：显示（\`QTableView\`/\`QTreeView\`/\`QListView\`）
- **Delegate**：编辑（\`QStyledItemDelegate\`）

优势：数据与显示分离，支持百万级数据（Model 按需加载，View 虚拟滚动）。

### 八、典型应用骨架

\`\`\`python
import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow,
    QPushButton, QVBoxLayout, QWidget, QLabel)
from PyQt6.QtCore import Qt

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("我的应用")
        self.resize(600, 400)
        central = QWidget()
        layout = QVBoxLayout()
        self.label = QLabel("点击按钮", alignment=Qt.AlignCenter)
        btn = QPushButton("点击我")
        btn.clicked.connect(self.on_click)
        layout.addWidget(self.label)
        layout.addWidget(btn)
        central.setLayout(layout)
        self.setCentralWidget(central)

    def on_click(self):
        self.label.setText("已点击！")

app = QApplication(sys.argv)
window = MainWindow()
window.show()
sys.exit(app.exec())
\`\`\`

### 九、业务场景

- **专业桌面应用**：CAD、IDE、设计软件（Maya/3ds Max 用 Qt）
- **工业控制**：SCADA 系统、设备监控
- **数据可视化工具**：科研/工程软件
- **多媒体应用**：播放器、编辑器

### 十、vs Tkinter / wxPython

| 库 | 优势 | 劣势 | 场景 |
|----|------|------|------|
| PyQt/PySide | 功能强大 | 体积大/许可复杂 | 专业桌面应用 |
| Tkinter | 标准库零依赖 | 外观老旧/组件少 | 简单工具/教学 |
| wxPython | 原生外观 | 文档少/跨平台差异 | 跨平台桌面 |

### 十一、原理深入

Qt 的信号槽通过 **moc（Meta-Object Compiler）** 实现：编译时生成元对象代码，记录信号/槽信息。运行时发射信号，Qt 查找连接的槽并调用。

PyQt/PySide 通过 SIP/Shiboken 把 C++ Qt 绑定到 Python。每个 QWidget 对应一个 Python 对象，但实际渲染在 C++ 层，所以性能接近原生。

事件循环 \`app.exec()\` 与 Tkinter 的 \`mainloop()\` 类似，都是处理系统消息队列。

### 十二、最佳实践总结

- 耗时任务用 QThread 子类化，避免主线程卡顿
- 跨线程通信用 signal/slot，**不要直接操作 UI**
- 布局用 stretch 控制伸缩比例，窗口缩放自适应
- qss（Qt Style Sheet）类似 CSS，统一定制外观
- 国际化用 \`tr()\` + Qt Linguist 工具链
- 发布用 pyinstaller \`--hidden-import PyQt6\`
- PyQt6 vs PySide6 API 95% 兼容，迁移成本低
- 复杂界面用 Designer 设计，生成 .ui 再加载`,
    code: `# PyQt/PySide 高级 GUI 概念演示：用 print 模拟信号槽机制
# 不依赖 PyQt5/PySide6，仅演示概念

print("=== PyQt/PySide 高级 GUI 概念演示 ===\\n")

print("--- 1. Qt 框架概览 ---")
print("  Qt 是跨平台 C++ GUI 框架，Python 绑定:")
bindings = [
    ["PyQt5/PyQt6", "Riverbank", "GPL/商业双许可", "最广泛使用"],
    ["PySide6 (Qt6)", "Qt 官方", "LGPL", "官方推荐"],
    ["PyQt4 (旧)", "Riverbank", "GPL/商业", "已淘汰"],
]
print(f"  {'绑定':<16}{'维护方':<12}{'许可':<16}{'状态'}")
for row in bindings:
    print(f"  {row[0]:<16}{row[1]:<12}{row[2]:<16}{row[3]}")
print("\\n  商业闭源: PySide6 (LGPL) 或购买 PyQt 商业授权")
print("  开源项目: 两者均可，API 几乎一致")

print("\\n--- 2. 信号与槽机制（核心） ---")
class Signal:
    """模拟 QtCore.Signal / pyqtSignal"""
    def __init__(self, *arg_types):
        # 真实 Signal(str) 中的 str 是声明发射参数类型，这里仅记录不用
        self._arg_types = arg_types
        self._slots = []

    def connect(self, slot):
        self._slots.append(slot)
        print(f"    信号已连接到槽: {slot.__name__}")

    def emit(self, *args):
        print(f"    信号发射，参数: {args}")
        for slot in self._slots:
            slot(*args)

class Button:
    def __init__(self, text):
        self.text = text
        self.clicked = Signal()

    def click(self):
        print(f"  用户点击按钮: [{self.text}]")
        self.clicked.emit()

def on_submit():
    print("    -> 槽函数 on_submit() 执行: 提交表单")

def on_log():
    print("    -> 槽函数 on_log() 执行: 记录日志")

btn = Button("提交")
btn.clicked.connect(on_submit)
btn.clicked.connect(on_log)
btn.click()

print("\\n  信号槽 vs 回调函数对比:")
compare = [
    ["信号槽", "多对多", "松耦合，可动态连接/断开", "Qt 独有概念"],
    ["回调函数", "一对一", "简单直接", "耦合较紧"],
    ["事件监听", "一对多", "Web/Java 风格", "需注册/注销管理"],
]
print(f"  {'机制':<12}{'关系':<10}{'优势':<24}{'备注'}")
for row in compare:
    print(f"  {row[0]:<12}{row[1]:<10}{row[2]:<24}{row[3]}")

print("\\n--- 3. 自定义信号 ---")
class LoginWidget:
    def __init__(self):
        self.login_success = Signal()
        self.login_failed = Signal(str)

    def do_login(self, user, pwd):
        if user == "admin" and pwd == "123456":
            self.login_success.emit()
        else:
            self.login_failed.emit("用户名或密码错误")

def show_main_window():
    print("    -> 显示主窗口")

def show_error(msg):
    print(f"    -> 弹出错误提示: {msg}")

widget = LoginWidget()
widget.login_success.connect(show_main_window)
widget.login_failed.connect(show_error)
print("  模拟正确登录:")
widget.do_login("admin", "123456")
print("  模拟错误登录:")
widget.do_login("admin", "wrong")

print("\\n--- 4. 常用组件 ---")
widgets = [
    ["QMainWindow", "主窗口（含菜单栏/工具栏/状态栏）"],
    ["QWidget", "所有 UI 组件基类"],
    ["QLabel", "文本/图片标签"],
    ["QPushButton", "按钮"],
    ["QLineEdit", "单行输入"],
    ["QComboBox", "下拉选择"],
    ["QTableWidget", "表格"],
    ["QTreeWidget", "树形列表"],
    ["QDialog", "对话框（模态/非模态）"],
    ["QFileDialog", "文件选择对话框"],
    ["QMessageBox", "消息提示框"],
]
print(f"  {'组件':<18}{'说明'}")
for w, d in widgets:
    print(f"  {w:<18}{d}")

print("\\n--- 5. 布局管理器 ---")
layouts = [
    ["QHBoxLayout", "水平堆叠", "[A][B][C]"],
    ["QVBoxLayout", "垂直堆叠", "[A]/[B]/[C]"],
    ["QGridLayout", "网格", "行列定位"],
    ["QFormLayout", "表单", "标签: 输入框"],
    ["QStackedLayout", "堆叠（切换）", "同位置切换页面"],
]
print(f"  {'布局':<18}{'原理':<14}{'示意'}")
for row in layouts:
    print(f"  {row[0]:<18}{row[1]:<14}{row[2]}")

print("\\n--- 6. Designer 可视化设计 ---")
print("  Qt Designer 拖拽设计 UI，生成 .ui 文件（XML）")
print("  pyuic5 -o ui_main.py main.ui      # PyQt5")
print("  pyside6-uic -o ui_main.py main.ui # PySide6")

print("\\n--- 7. 典型应用骨架（伪代码） ---")
pseudo = """import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow,
    QPushButton, QVBoxLayout, QWidget, QLabel)
from PyQt6.QtCore import Qt

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("我的应用")
        self.resize(600, 400)
        central = QWidget()
        layout = QVBoxLayout()
        self.label = QLabel("点击按钮", alignment=Qt.AlignCenter)
        btn = QPushButton("点击我")
        btn.clicked.connect(self.on_click)
        layout.addWidget(self.label)
        layout.addWidget(btn)
        central.setLayout(layout)
        self.setCentralWidget(central)
    def on_click(self):
        self.label.setText("已点击！")

app = QApplication(sys.argv)
window = MainWindow()
window.show()
sys.exit(app.exec())"""
print(pseudo)

print("\\n--- 8. vs Tkinter / wxPython 对比 ---")
compare = [
    ["PyQt/PySide", "功能强大", "体积大/许可复杂", "专业桌面应用"],
    ["Tkinter", "标准库零依赖", "外观老旧/组件少", "简单工具/教学"],
    ["wxPython", "原生外观", "文档少/跨平台差异", "跨平台桌面"],
]
print(f"  {'库':<14}{'优势':<18}{'劣势':<18}{'场景'}")
for row in compare:
    print(f"  {row[0]:<14}{row[1]:<18}{row[2]:<18}{row[3]}")

print("\\n--- 9. 业务场景与避坑 ---")
tips = [
    "耗时任务用 QThread 子类化，避免主线程卡顿",
    "跨线程通信用 signal/slot，不要直接操作 UI",
    "布局用 stretch 控制伸缩比例，窗口缩放自适应",
    "qss (Qt Style Sheet) 类似 CSS，统一定制外观",
    "国际用 tr() + Qt Linguist 工具链",
    "发布用 pyinstaller --hidden-import PyQt6",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== PyQt/PySide 概念演示结束 ===")`
  },
  {
    id: "py6-pygame",
    group: "数据科学与自动化",
    icon: "🎮",
    title: "Pygame 游戏开发入门",
    content: `## Pygame 游戏开发入门

### 一、Pygame 是什么

Pygame 是 Python 的 2D 游戏开发库，基于 SDL（Simple DirectMedia Layer），2000 年由 Pete Shinners 创建。它封装了图形、音频、输入、事件等底层操作，让 Python 也能做游戏。

适合：2D 休闲游戏、教学演示、原型验证、Game Jam 极限开发。
不适合：3D 游戏（用 Godot/Unity）、大型商业游戏、移动端。

### 二、游戏循环概念

游戏的本质是**固定帧率的循环**：

\`\`\`
while running:
    1. 处理事件（输入/窗口关闭）
    2. 更新状态（位置/碰撞/得分）
    3. 渲染画面（绘制到屏幕）
    4. 控制帧率（clock.tick(60)）
\`\`\`

\`\`\`python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    # update
    # draw
    pygame.display.flip()
    clock.tick(60)   # 限制 60 FPS

pygame.quit()
\`\`\`

\`clock.tick(60)\` 限制最高 60 帧/秒，多余的睡眠等待。游戏逻辑应基于 \`dt\`（帧间隔）而非帧数，保证不同设备速度一致。

### 三、事件处理

Pygame 是事件驱动的，所有输入都通过事件队列传递：

\`\`\`python
for event in pygame.event.get():
    if event.type == pygame.QUIT:
        running = False
    elif event.type == pygame.KEYDOWN:
        if event.key == pygame.K_ESCAPE:
            running = False
        elif event.key == pygame.K_SPACE:
            player.jump()
\`\`\`

| 事件 | 说明 |
|------|------|
| QUIT | 窗口关闭按钮 |
| KEYDOWN | 按键按下（event.key, event.unicode） |
| KEYUP | 按键抬起 |
| MOUSEMOTION | 鼠标移动（event.pos） |
| MOUSEBUTTONDOWN | 鼠标按下（event.button） |
| USEREVENT | 自定义事件 |

持续按键检测用 \`pygame.key.get_pressed()\` 而非事件，适合移动控制。

### 四、精灵 Sprite

\`pygame.sprite.Sprite\` 是游戏对象的基类，封装了图像与位置：

\`\`\`python
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((32, 32))
        self.image.fill((255, 0, 0))
        self.rect = self.image.get_rect(center=(400, 300))
        self.speed = 5

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:  self.rect.x -= self.speed
        if keys[pygame.K_RIGHT]: self.rect.x += self.speed
\`\`\`

- \`image\`：Surface 对象，精灵的图像
- \`rect\`：Rect 对象，精灵的位置与大小
- \`update()\`：每帧调用，更新逻辑
- \`Group\`：批量管理精灵，\`group.update()\` / \`group.draw(screen)\`

### 五、碰撞检测

Pygame 提供多种碰撞检测：

\`\`\`python
# 精灵与组碰撞
hits = pygame.sprite.spritecollide(player, enemies, True)  # True 表示碰撞后删除敌人

# 组与组碰撞
pygame.sprite.groupcollide(bullets, enemies, True, True)

# 矩形碰撞
if player.rect.colliderect(coin.rect):
    score += 10

# 像素级碰撞（精确但慢）
if pygame.sprite.collide_mask(player, enemy):
    pass
\`\`\`

| 方法 | 用途 | 说明 |
|------|------|------|
| spritecollide | 精灵与组 | 返回碰撞列表 |
| groupcollide | 组与组 | 返回字典 |
| collide_rect | 矩形碰撞 | 返回 bool |
| collide_circle | 圆形碰撞 | 更自然 |
| collide_mask | 像素级 | 精确但慢 |

### 六、帧率与游戏物理

\`\`\`python
clock = pygame.time.Clock()
while running:
    dt = clock.tick(60) / 1000.0   # 上一帧耗时（秒）
    player.x += player.vx * dt     # 基于时间的移动
\`\`\`

- **固定步长**：物理稳定，但渲染可能不平滑
- **可变步长**：渲染流畅，但需用 \`dt\` 缩放移动

> 💡 **避坑提示**：永远用 \`dt\` 缩放移动速度，否则 144Hz 显示器上角色会跑得比 60Hz 快一倍。

### 七、Surface 与绘图

\`\`\`python
# 创建 Surface
surface = pygame.Surface((width, height), pygame.SRCALPHA)  # 支持透明

# 基本绘图
pygame.draw.rect(screen, (255, 0, 0), (x, y, w, h))
pygame.draw.circle(screen, (0, 255, 0), (cx, cy), radius)
pygame.draw.line(screen, (0, 0, 255), (x1, y1), (x2, y2))

# 加载图片
img = pygame.image.load('player.png').convert_alpha()
screen.blit(img, (x, y))

# 文字
font = pygame.font.Font(None, 36)
text = font.render("Score: 100", True, (255, 255, 255))
screen.blit(text, (10, 10))
\`\`\`

\`convert()\` / \`convert_alpha()\` 把图片转为屏幕像素格式，大幅加速 blit。

### 八、音频

\`\`\`python
pygame.mixer.init()
sound = pygame.mixer.Sound('jump.wav')
sound.play()
pygame.mixer.music.load('bgm.mp3')
pygame.mixer.music.play(-1)   # -1 循环
\`\`\`

### 九、业务场景

- **教育游戏**：教编程/算法/物理概念
- **原型验证**：快速验证游戏玩法
- **小游戏**：2D 休闲/像素风
- **Game Jam**：48 小时极限开发

### 十、性能限制与替代方案

Pygame 纯 Python 渲染慢，大量精灵时帧率下降。替代方案：

| 方案 | 特点 | 备注 |
|------|------|------|
| pygame-ce | 社区版，性能优化 | pygame 升级版 |
| arcade | 现代 API | 教学友好 |
| pyglet | OpenGL | 高性能 2D/3D |
| Godot + GDScript | 专业引擎 | 跨平台发布 |

### 十一、原理深入

Pygame 基于 SDL2，所有绘图调用最终转为 SDL 函数。SDL 直接调用 OpenGL/Metal/DirectX，性能接近 C。

游戏循环的 \`display.flip()\` 做双缓冲：先画到后台缓冲，再交换到前台，避免画面撕裂。\`clock.tick()\` 用 \`SDL_Delay\` 睡眠，让出 CPU。

### 十二、最佳实践总结

- 移动用 \`dt\` 缩放，保证跨设备速度一致
- 图片加载后 \`convert_alpha()\`，加速 blit
- 精灵用 Group 批量管理，避免手动循环
- 碰撞检测先用矩形粗筛，再像素级精判
- 资源（图片/音频）预加载，避免运行时 IO
- 游戏状态用状态机管理（菜单/游戏中/暂停/结束）
- 复杂场景考虑用 pygame-ce 或 arcade 替代
- 发布用 pyinstaller 打包，附带资源文件`,
    code: `# Pygame 游戏开发概念演示：用纯 Python 模拟游戏循环
# 不依赖 pygame，演示游戏循环、事件、精灵、碰撞

import time
import random

print("=== Pygame 游戏开发概念演示 ===\\n")

print("--- 1. 游戏循环概念 ---")
print("  游戏的本质是固定帧率的循环:")
print("    while running:")
print("        1. 处理事件 (输入/窗口关闭)")
print("        2. 更新状态 (位置/碰撞/得分)")
print("        3. 渲染画面 (绘制到屏幕)")
print("        4. 控制帧率 (clock.tick(60))")

print("\\n--- 2. 模拟游戏循环（终端版） ---")
class Game:
    """用纯 Python 模拟游戏循环，print 显示状态"""
    def __init__(self, width=20, height=6):
        self.width = width
        self.height = height
        self.player_x, self.player_y = 2, 3
        self.coin_x, self.coin_y = 15, 3
        self.score = 0
        self.frame = 0

    def handle_input(self, key):
        if key == 'left':  self.player_x = max(0, self.player_x - 1)
        elif key == 'right': self.player_x = min(self.width - 1, self.player_x + 1)

    def update(self):
        self.frame += 1
        if self.player_x == self.coin_x and self.player_y == self.coin_y:
            self.score += 10
            self.coin_x = random.randint(0, self.width - 1)

    def render(self):
        grid = [['.' for _ in range(self.width)] for _ in range(self.height)]
        grid[self.coin_y][self.coin_x] = '*'
        grid[self.player_y][self.player_x] = '@'
        print(f"  帧 {self.frame} | 得分 {self.score}")
        print("  +" + "-" * self.width + "+")
        for row in grid:
            print("  |" + "".join(row) + "|")
        print("  +" + "-" * self.width + "+")

game = Game()
for key in ['right'] * 5:
    game.handle_input(key)
    game.update()
    game.render()
    time.sleep(0.02)
print(f"\\n  最终得分: {game.score}")

print("\\n--- 3. 事件处理 ---")
events = [
    ["QUIT", "窗口关闭按钮"],
    ["KEYDOWN", "按键按下 (event.key)"],
    ["KEYUP", "按键抬起"],
    ["MOUSEMOTION", "鼠标移动 (event.pos)"],
    ["MOUSEBUTTONDOWN", "鼠标按下 (event.button)"],
    ["USEREVENT", "自定义事件 (定时器等)"],
]
print(f"  {'事件':<22}{'说明'}")
for e, d in events:
    print(f"  {e:<22}{d}")

print("\\n--- 4. 精灵 Sprite ---")
class Sprite:
    def __init__(self, x, y, w, h, image='X'):
        self.rect = {'x': x, 'y': y, 'w': w, 'h': h}
        self.image = image
    def update(self, dx=0, dy=0):
        self.rect['x'] += dx
        self.rect['y'] += dy

class SpriteGroup:
    def __init__(self):
        self.sprites = []
    def add(self, sprite):
        self.sprites.append(sprite)
    def update(self, *args):
        for s in self.sprites:
            s.update(*args)
    def __iter__(self):
        return iter(self.sprites)

player = Sprite(5, 5, 1, 1, '@')
enemy1 = Sprite(10, 3, 1, 1, 'E')
group = SpriteGroup()
group.add(player)
group.add(enemy1)
print("  精灵组初始状态:")
for s in group:
    print(f"    {s.image} 位置 ({s.rect['x']}, {s.rect['y']})")
group.update(1, 0)
print("  group.update(1, 0) 后:")
for s in group:
    print(f"    {s.image} 位置 ({s.rect['x']}, {s.rect['y']})")

print("\\n--- 5. 碰撞检测 ---")
methods = [
    ["spritecollide", "精灵与组碰撞", "返回碰撞列表"],
    ["groupcollide", "组与组碰撞", "返回字典"],
    ["collide_rect", "矩形碰撞", "返回 bool"],
    ["collide_circle", "圆形碰撞", "更自然"],
    ["collide_mask", "像素级碰撞", "精确但慢"],
]
print(f"  {'方法':<18}{'用途':<18}{'说明'}")
for row in methods:
    print(f"  {row[0]:<18}{row[1]:<18}{row[2]}")

def rect_collide(r1, r2):
    return not (r1['x'] + r1['w'] <= r2['x'] or r2['x'] + r2['w'] <= r1['x']
                or r1['y'] + r1['h'] <= r2['y'] or r2['y'] + r2['h'] <= r1['y'])
print(f"\\n  player rect: {player.rect}")
print(f"  enemy1 rect: {enemy1.rect}")
print(f"  矩形碰撞: {rect_collide(player.rect, enemy1.rect)}")

print("\\n--- 6. 帧率与游戏物理 ---")
print("  clock.tick(60): 限制 60 FPS")
print("  dt = clock.get_time() / 1000: 获取上一帧耗时（秒）")
print("  基于时间的移动: x += speed * dt  (帧率无关)")

print("\\n--- 7. pygame 典型骨架（伪代码） ---")
pseudo = """import pygame
pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((32, 32))
        self.image.fill((255, 0, 0))
        self.rect = self.image.get_rect(center=(400, 300))
        self.speed = 5
    def update(self):
        keys = pygame.key.get_pressed()
        if keys[K_LEFT]:  self.rect.x -= self.speed
        if keys[K_RIGHT]: self.rect.x += self.speed

player = Player()
all_sprites = pygame.sprite.Group(player)
running = True
while running:
    for event in pygame.event.get():
        if event.type == QUIT: running = False
    all_sprites.update()
    screen.fill((0, 0, 0))
    all_sprites.draw(screen)
    pygame.display.flip()
    clock.tick(60)
pygame.quit()"""
print(pseudo)

print("\\n--- 8. 业务场景与性能限制 ---")
scenes = [
    "教育游戏: 教编程/算法/物理概念",
    "原型验证: 快速验证游戏玩法",
    "小游戏: 2D 休闲/像素风",
    "Game Jam: 48 小时极限开发",
]
for s in scenes:
    print(f"    - {s}")
print("\\n  替代方案:")
alts = [
    ["pygame-ce", "社区版，性能优化", "pygame 升级版"],
    ["arcade", "现代 API", "教学友好"],
    ["pyglet", "OpenGL", "高性能 2D/3D"],
    ["Godot + GDScript", "专业引擎", "跨平台发布"],
]
print(f"  {'方案':<14}{'特点':<16}{'备注'}")
for row in alts:
    print(f"  {row[0]:<14}{row[1]:<16}{row[2]}")

print("\\n=== Pygame 概念演示结束 ===")`
  },
  {
    id: "py6-system-admin",
    group: "数据科学与自动化",
    icon: "⚙️",
    title: "系统管理与 DevOps",
    content: `## 系统管理与 DevOps

### 一、DevOps 理念

DevOps = Development + Operations，强调开发与运维协作，通过自动化实现**持续交付**。核心实践：

- **基础设施即代码**（IaC）：用代码定义服务器配置
- **CI/CD**：持续集成 / 持续部署
- **监控告警**：实时观测系统状态
- **自动化一切**：减少手动操作

Python 在 DevOps 领域是"胶水语言"，标准库覆盖了系统管理大部分需求。

### 二、subprocess 调用系统命令

\`\`\`python
import subprocess

# run: 推荐方式（Python 3.5+）
result = subprocess.run(
    ['df', '-h'],
    capture_output=True, text=True, timeout=10, check=True
)
print(result.stdout)

# Popen: 流式处理长输出
proc = subprocess.Popen(['tail', '-f', 'app.log'],
    stdout=subprocess.PIPE, text=True)
for line in proc.stdout:
    print(line.strip())
\`\`\`

| 参数 | 作用 |
|------|------|
| capture_output=True | 捕获 stdout/stderr |
| text=True | 输出字符串（默认 bytes） |
| timeout=30 | 超时抛 TimeoutExpired |
| check=True | 返回码非 0 抛异常 |
| cwd='/path' | 指定工作目录 |
| env={...} | 自定义环境变量 |

### 三、进程与系统信息

\`\`\`python
import os, platform, shutil

print(platform.system(), platform.release())   # Darwin 23.0
print(os.cpu_count())                          # CPU 核心数
print(os.getpid())                             # 当前 PID
total, used, free = shutil.disk_usage('/')     # 磁盘使用
\`\`\`

标准库信息有限，\`psutil\` 第三方库提供更丰富监控：

\`\`\`python
import psutil
psutil.cpu_percent()           # CPU 使用率
psutil.virtual_memory()        # 内存使用
psutil.net_io_counters()       # 网络流量
psutil.process_iter()          # 进程列表
\`\`\`

### 四、文件监控

**轮询方式**（简单但延迟高）：

\`\`\`python
import os
snapshot = {f: os.path.getmtime(f) for f in os.listdir('.')}

def check_changes(directory, snapshot):
    current = {f: os.path.getmtime(os.path.join(directory, f))
               for f in os.listdir(directory)}
    added = set(current) - set(snapshot)
    removed = set(snapshot) - set(current)
    modified = {f for f in set(snapshot) & set(current) if snapshot[f] != current[f]}
    return added, removed, modified
\`\`\`

**事件方式**（实时，用 watchdog 库）：

\`\`\`python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class Handler(FileSystemEventHandler):
    def on_modified(self, event):
        print(f'修改: {event.src_path}')

observer = Observer()
observer.schedule(Handler(), '/path', recursive=True)
observer.start()
\`\`\`

### 五、进程管理

\`\`\`python
import subprocess, os, signal

proc = subprocess.Popen(['python', 'long_task.py'])
print(proc.pid)          # 进程 PID
print(proc.poll())       # None 表示仍在运行
proc.terminate()         # SIGTERM 优雅终止
proc.kill()              # SIGKILL 强制终止
proc.wait(timeout=10)    # 等待结束
\`\`\`

要点：

- 超时控制：\`proc.wait(timeout=10)\` 或 \`subprocess.run(timeout=)\`
- 优雅退出：先 \`terminate()\` 等几秒再 \`kill()\`
- 僵尸进程：父进程必须 \`wait()\` 回收，否则占用 PID
- 进程组：\`os.setsid()\` 创建新会话，便于批量管理

### 六、SSH 自动化

远程执行命令方案：

| 工具 | 定位 | 特点 |
|------|------|------|
| paramiko | 纯 Python SSH2 | 灵活但需手写 |
| fabric | 基于 paramiko | 高层 API，运维友好 |
| subprocess + ssh | 调用系统 ssh | 简单但难管理密钥 |
| Ansible | YAML 声明式 | 无 agent，幂等 |

\`\`\`python
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('server', username='ops', key_filename='~/.ssh/id_rsa')
stdin, stdout, stderr = client.exec_command('df -h')
for line in stdout:
    print(line.strip())

sftp = client.open_sftp()
sftp.put('local.log', '/var/log/remote.log')
client.close()
\`\`\`

### 七、配置管理

| 工具 | 语法 | 架构 | 模式 | 规模 |
|------|------|------|------|------|
| Ansible | YAML + SSH | 无 agent | 推模式 | 中小规模 |
| SaltStack | YAML + ZeroMQ | agent (minion) | 推/拉 | 大规模 |
| Puppet | DSL | agent | 拉模式 | 传统企业 |
| Chef | Ruby DSL | agent | 拉模式 | Ruby 生态 |

Ansible playbook 示例：

\`\`\`yaml
- name: 部署 Web 应用
  hosts: webservers
  become: yes
  tasks:
    - name: 安装 nginx
      apt: name=nginx state=present
    - name: 启动 nginx
      service: name=nginx state=started enabled=yes
    - name: 同步配置
      copy: src=nginx.conf dest=/etc/nginx/nginx.conf
      notify: restart nginx
  handlers:
    - name: restart nginx
      service: name=nginx state=restarted
\`\`\`

Ansible 的核心优势是**幂等**：同一 playbook 执行多次结果一致，自动判断是否需要变更。

### 八、CI/CD 流水线

典型流程：

1. 代码提交（git push）
2. 触发 CI（GitHub Actions / Jenkins / GitLab CI）
3. Lint + 单元测试
4. 构建 Docker 镜像
5. 推送镜像仓库
6. 部署测试环境
7. 集成测试 / E2E
8. 人工审批
9. 部署生产（蓝绿/金丝雀）
10. 监控告警

**部署策略**：

| 策略 | 原理 | 特点 |
|------|------|------|
| 蓝绿 | 两套环境切换 | 回滚快，资源 2x |
| 金丝雀 | 小流量先验证 | 渐进发布，风险低 |
| 滚动 | 逐批替换 | 资源省，需向后兼容 |

### 九、监控与日志

| 类型 | 指标 | 工具 |
|------|------|------|
| 系统 | CPU/内存/磁盘/网络 | node_exporter / psutil |
| 应用 | QPS/延迟/错误率 | Prometheus + Grafana |
| 业务 | 订单量/注册数 | 自定义埋点 |
| 日志 | ERROR/WARN | ELK / Loki |

### 十、业务场景

- **服务器运维**：批量部署、配置管理、日志收集
- **CI/CD**：自动化构建、测试、发布
- **监控告警**：系统健康检查、故障自愈
- **安全审计**：权限检查、漏洞扫描

### 十一、原理深入

Python 系统管理的强大源于对 POSIX 标准的封装：

- \`os.fork()\` / \`os.exec()\` 对应 Unix 进程创建原语
- \`subprocess\` 封装了 fork+exec（Unix）或 CreateProcess（Windows）
- \`signal\` 模块直接映射 Unix 信号机制（SIGTERM/SIGKILL）
- \`socket\` 模块是 BSD socket API 的薄封装

理解这一点，遇到跨平台行为差异就能定位到操作系统层面。例如 \`os.fork()\` 在 Windows 上不可用，需要用 \`multiprocessing\` 替代。

### 十二、最佳实践总结

- 脚本加 \`set -e\`（shell）或检查返回码（Python），失败立即退出
- 日志结构化（JSON），便于 ELK 采集
- 关键操作幂等设计，支持安全重试
- 用配置管理（Ansible）替代手写脚本，可审计
- 密钥用 vault / 环境变量，不硬编码
- CI 流水线集成 lint/test/security scan
- 生产变更走 PR + Code Review + 审批
- 监控告警分级，避免告警风暴`,
    code: `# 系统管理与 DevOps 概念演示：纯标准库实现运维常用操作

import os
import sys
import subprocess
import platform
import shutil
import json
import tempfile

print("=== 系统管理与 DevOps 概念演示 ===\\n")

print("--- 1. subprocess 调用系统命令 ---")
result = subprocess.run(["python3", "--version"], capture_output=True, text=True)
print(f"  命令: python3 --version")
print(f"  返回码: {result.returncode}")
print(f"  输出: {result.stdout.strip()}")

print("\\n  subprocess 关键参数:")
params = [
    ["capture_output=True", "捕获 stdout/stderr"],
    ["text=True", "输出为字符串（默认 bytes）"],
    ["timeout=30", "超时抛 TimeoutExpired"],
    ["check=True", "返回码非 0 抛 CalledProcessError"],
    ["cwd='/path'", "指定工作目录"],
    ["env={...}", "自定义环境变量"],
]
print(f"  {'参数':<24}{'说明'}")
for p, d in params:
    print(f"  {p:<24}{d}")

print("\\n--- 2. 进程与系统信息（os/platform） ---")
print(f"  操作系统: {platform.system()} {platform.release()}")
print(f"  Python 版本: {platform.python_version()}")
print(f"  主机名: {platform.node()}")
print(f"  CPU 核心: {os.cpu_count()}")
print(f"  当前 PID: {os.getpid()}")

print("\\n  psutil 库提供更丰富的系统监控（第三方）:")
psutil_features = [
    "psutil.cpu_percent()    CPU 使用率",
    "psutil.virtual_memory() 内存使用",
    "psutil.disk_usage('/')  磁盘使用",
    "psutil.net_io_counters() 网络流量",
    "psutil.process_iter()   进程列表",
]
for f in psutil_features:
    print(f"    {f}")

total, used, free = shutil.disk_usage('/')
print(f"\\n  磁盘使用 (/):")
print(f"    总量: {total // (1024**3)} GB")
print(f"    已用: {used // (1024**3)} GB")
print(f"    可用: {free // (1024**3)} GB")

print("\\n--- 3. 文件监控（轮询方式） ---")
watch_dir = tempfile.mkdtemp()
with open(os.path.join(watch_dir, "a.txt"), 'w') as f:
    f.write("hello")

def snapshot(directory):
    snap = {}
    for fname in os.listdir(directory):
        path = os.path.join(directory, fname)
        if os.path.isfile(path):
            snap[fname] = os.path.getmtime(path)
    return snap

snap1 = snapshot(watch_dir)
print(f"  初始快照: {snap1}")

with open(os.path.join(watch_dir, "b.txt"), 'w') as f:
    f.write("new file")
import time
time.sleep(0.1)
with open(os.path.join(watch_dir, "a.txt"), 'w') as f:
    f.write("modified")

snap2 = snapshot(watch_dir)
print(f"  变化后快照: {snap2}")
added = set(snap2) - set(snap1)
removed = set(snap1) - set(snap2)
modified = {f for f in set(snap1) & set(snap2) if snap1[f] != snap2[f]}
print(f"  新增: {added}")
print(f"  删除: {removed}")
print(f"  修改: {modified}")
print("  生产级: watchdog 库基于系统事件（inotify/FSEvents），实时")
shutil.rmtree(watch_dir)

print("\\n--- 4. 进程管理 ---")
proc = subprocess.Popen(["python3", "-c", "import time; time.sleep(1); print('done')"])
print(f"  启动子进程 PID: {proc.pid}")
print(f"  是否运行: {proc.poll() is None}")
proc.wait(timeout=5)
print(f"  等待后返回码: {proc.returncode}")

print("\\n  进程管理要点:")
points = [
    "超时控制: proc.wait(timeout=10) 或 subprocess.run(timeout=)",
    "强制终止: proc.terminate() (SIGTERM) / proc.kill() (SIGKILL)",
    "优雅退出: 先 terminate 等几秒再 kill",
    "僵尸进程: 父进程必须 wait() 回收，否则占用 PID",
]
for p in points:
    print(f"    - {p}")

print("\\n--- 5. SSH 自动化与配置管理 ---")
print("  远程执行命令方案:")
ssh_tools = [
    ["paramiko", "纯 Python SSH2", "灵活但需手写"],
    ["fabric", "基于 paramiko", "高层 API，运维友好"],
    ["subprocess + ssh", "调用系统 ssh", "简单但难管理密钥"],
    ["Ansible", "YAML 声明式", "无 agent，幂等"],
]
print(f"  {'工具':<16}{'定位':<18}{'特点'}")
for row in ssh_tools:
    print(f"  {row[0]:<16}{row[1]:<18}{row[2]}")

print("\\n  配置管理工具对比:")
config_tools = [
    ["Ansible", "YAML + SSH", "无 agent", "推模式", "中小规模"],
    ["SaltStack", "YAML + ZeroMQ", "agent (minion)", "推/拉", "大规模"],
    ["Puppet", "DSL (Puppet)", "agent", "拉模式", "传统企业"],
    ["Chef", "Ruby DSL", "agent", "拉模式", "Ruby 生态"],
]
print(f"  {'工具':<12}{'语法':<16}{'架构':<16}{'模式':<10}{'规模'}")
for row in config_tools:
    print(f"  {row[0]:<12}{row[1]:<16}{row[2]:<16}{row[3]:<10}{row[4]}")

print("\\n--- 6. CI/CD 流程概念 ---")
print("  典型 CI/CD 流水线:")
pipeline = [
    "1. 代码提交 (git push)",
    "2. 触发 CI (GitHub Actions / Jenkins)",
    "3. Lint + 单元测试",
    "4. 构建 Docker 镜像",
    "5. 推送镜像仓库",
    "6. 部署测试环境",
    "7. 集成测试 / E2E",
    "8. 人工审批",
    "9. 部署生产 (蓝绿/金丝雀)",
    "10. 监控告警",
]
for step in pipeline:
    print(f"    {step}")

print("\\n  部署策略:")
strategies = [
    ["蓝绿", "两套环境切换", "回滚快，资源占用 2x"],
    ["金丝雀", "小流量先验证", "渐进发布，风险低"],
    ["滚动", "逐批替换", "资源省，但需向后兼容"],
]
print(f"  {'策略':<10}{'原理':<20}{'特点'}")
for row in strategies:
    print(f"  {row[0]:<10}{row[1]:<20}{row[2]}")

print("\\n--- 7. 监控与日志 ---")
metrics = [
    ["系统", "CPU/内存/磁盘/网络", "node_exporter / psutil"],
    ["应用", "QPS/延迟/错误率", "Prometheus + Grafana"],
    ["业务", "订单量/注册数", "自定义埋点"],
    ["日志", "ERROR/WARN", "ELK / Loki"],
]
print(f"  {'类型':<8}{'指标':<24}{'工具'}")
for row in metrics:
    print(f"  {row[0]:<8}{row[1]:<24}{row[2]}")

print("\\n--- 8. 业务场景与最佳实践 ---")
best = [
    "脚本加 set -e / 检查返回码，失败立即退出",
    "日志结构化 (JSON)，便于 ELK 采集",
    "关键操作幂等设计，支持安全重试",
    "用配置管理 (Ansible) 替代手写脚本，可审计",
    "密钥用 vault / 环境变量，不硬编码",
    "CI 流水线集成 lint/test/security scan",
    "生产变更走 PR + Code Review + 审批",
    "监控告警分级，避免告警风暴",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== 系统管理与 DevOps 演示结束 ===")`
  }
];