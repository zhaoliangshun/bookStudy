// =============================================================
// Python 人工智能开发教程 —— 第三批章节（Pandas数据处理组，共 5 章）
// -------------------------------------------------------------
// 本批为 "Pandas数据处理" 主题，覆盖数据结构与 IO、清洗、分组聚合、
// 时间序列等核心能力。为便于在沙盒（仅标准库）中运行，代码部分用
// 纯 Python 实现 Series / DataFrame 的精简版本，模拟 Pandas 的核心
// 概念与典型操作，便于读者理解原理而非记忆 API。
//
// 每个章节包含：
//   id      : 唯一标识（aipy- 前缀）
//   icon    : 展示用 emoji
//   group   : "Pandas数据处理"
//   title   : 中文标题
//   content : Markdown 详细讲解（≥ 3000 字）
//   code    : 可运行的纯 Python 示例代码（带 print 输出）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：Pandas数据结构详解
  // ============================================================
  {
    id: "aipy-pandas-structure",
    icon: "📊",
    group: "Pandas数据处理",
    title: "Pandas数据结构详解",
    content: `## Pandas 数据结构详解

**Pandas** 是 Python 数据科学生态中最核心的数据处理库，构建在 NumPy 之上，由 Wes McKinney 于 2008 年在 AQR Capital Management 工作期间开发，2009 年开源。它解决了 NumPy 在处理"带标签的二维表格数据"时的不足——NumPy 的 ndarray 只能通过整数位置访问元素，而真实世界的数据（CSV、Excel、SQL 表）几乎都带有列名和行索引。

理解 Pandas 的两个核心数据结构 **Series** 和 **DataFrame**，是掌握数据分析的第一步。本章将深入讲解它们的概念、创建方式、关键属性，以及背后的设计哲学。

### 1.1 为什么需要 Pandas

在 Pandas 出现之前，Python 处理表格数据主要依靠"列表的列表"或 NumPy 数组，但都存在明显缺陷：

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 嵌套 list | 简单直观 | 无列名、无类型、无统计、无缺失值处理 |
| NumPy ndarray | 向量化快、内存紧凑 | 只能同类型、只能整数索引、缺标签 |
| dict 的 list | 有列名 | 行级操作困难、无向量化 |
| Pandas DataFrame | 标签 + 向量化 + 异构类型 | 学习曲线略陡 |

**Pandas = NumPy 的向量化能力 + 电子表格的标签便捷性 + SQL 的查询表达力**。它把"带标签的二维异构表格"作为一等公民，让你能用一行代码完成 Excel 里需要几十次拖拽才能做的事。

#### 1.1.1 Pandas 解决的核心痛点

1. **异构类型**：同一张表里可以有整数列、字符串列、日期列，互不干扰
2. **标签索引**：通过列名、行名访问数据，不必记住"第 3 列是年龄"
3. **缺失值对齐**：自动用 NaN 标记缺失，运算时自动跳过
4. **自动对齐**：不同 Series 相加时按标签自动对齐，不必手动 join
5. **时间序列**：内置 DatetimeIndex，支持重采样、滑动窗口等金融级操作

### 1.2 Series：一维带标签数组

**Series** 是 Pandas 中最基本的数据结构，可以理解为一个"带索引的一维数组"。它由两部分组成：

- **data**：实际的数据值（底层是 NumPy 数组）
- **index**：与数据等长的标签数组

\`\`\`
索引      值
-----    -----
北京     2154
上海     2487
广州     1531
深圳     1756
\`\`\`

#### 1.2.1 Series 的四种创建方式

**方式一：从列表创建**（最常见）

\`\`\`python
import pandas as pd
s = pd.Series([2154, 2487, 1531, 1756],
              index=['北京','上海','广州','深圳'],
              name='人口(万人)')
\`\`\`

如果不指定 index，Pandas 会自动分配 0,1,2,... 的默认整数索引。

**方式二：从字典创建**（键自动成为索引）

\`\`\`python
s = pd.Series({'北京':2154, '上海':2487, '广州':1531, '深圳':1756})
\`\`\`

字典的键会自动成为 Series 的 index，值成为 data。这是"语义最清晰"的创建方式。

**方式三：从标量创建**（广播到指定长度）

\`\`\`python
s = pd.Series(100, index=['a','b','c','d'])  # 4 个 100
\`\`\`

**方式四：从 NumPy 数组创建**

\`\`\`python
import numpy as np
s = pd.Series(np.random.randn(5), index=list('abcde'))
\`\`\`

#### 1.2.2 Series 的关键属性

| 属性 | 含义 | 示例 |
| --- | --- | --- |
| \`s.values\` | 底层数据（NumPy 数组） | \`array([2154, 2487, ...])\` |
| \`s.index\` | 索引对象 | \`Index(['北京','上海',...])\` |
| \`s.name\` | Series 的名字 | \`'人口(万人)'\` |
| \`s.dtype\` | 数据类型 | \`int64\` |
| \`s.shape\` | 形状 | \`(4,)\` |
| \`s.size\` | 元素个数 | \`4\` |
| \`s.ndim\` | 维度 | \`1\` |

#### 1.2.3 Series 的索引访问

Series 支持"两种"访问方式，这是新手最容易混淆的地方：

- **\`[]\` 运算符**：当传整数时按位置访问，传标签时按标签访问（容易歧义）
- **\`.loc[]\`**：**纯标签**访问（loc = location）
- **\`.iloc[]\`**：**纯位置**访问（iloc = integer location）

\`\`\`python
s = pd.Series([10,20,30,40], index=['a','b','c','d'])
s['b']       # 20  标签访问
s.loc['b']   # 20  显式标签访问（推荐）
s.iloc[1]    # 20  显式位置访问（推荐）
s[1:3]       # 20, 30  位置切片（左闭右开）
s['a':'c']   # 10, 20, 30  标签切片（**左闭右闭**！）
\`\`\`

**关键陷阱**：标签切片是"**双闭**"的，而位置切片是"**左闭右开**"的。这是 Pandas 设计上最具争议的决定之一，但已成事实标准。

### 1.3 DataFrame：二维带标签表格

**DataFrame** 是 Pandas 的旗舰数据结构，可以理解为"多个共享同一 index 的 Series 拼在一起"。它有**两个**索引：

- **index**：行索引（行标签）
- **columns**：列索引（列名）

\`\`\`
        name   age   city
id
1       张三    28    北京
2       李四    34    上海
3       王五    25    广州
\`\`\`

#### 1.3.1 DataFrame 的五种创建方式

**方式一：从字典创建**（最常用）

\`\`\`python
df = pd.DataFrame({
    'name': ['张三','李四','王五'],
    'age': [28, 34, 25],
    'city': ['北京','上海','广州']
})
\`\`\`

字典的**键成为列名**，**值成为列数据**。这是最直观的方式。

**方式二：从字典列表创建**

\`\`\`python
df = pd.DataFrame([
    {'name':'张三','age':28},
    {'name':'李四','age':34},
])
\`\`\`

每个 dict 是一行，所有 dict 的键的并集成为列名。

**方式三：从二维列表/NumPy 数组创建**

\`\`\`python
df = pd.DataFrame([[1,2,3],[4,5,6]],
                  columns=['a','b','c'],
                  index=['x','y'])
\`\`\`

**方式四：从 Series 字典创建**

\`\`\`python
df = pd.DataFrame({
    'math': pd.Series([90,85,78], index=['张三','李四','王五']),
    'eng':  pd.Series([88,92], index=['张三','李四'])  # 王五会自动 NaN
})
\`\`\`

Series 长度不一致时，缺失部分自动填 NaN——这就是"自动对齐"的威力。

**方式五：从文件读取**（详见第 2 章）

\`\`\`python
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
\`\`\`

#### 1.3.2 DataFrame 的关键属性

| 属性 | 含义 |
| --- | --- |
| \`df.values\` | 底层二维 NumPy 数组 |
| \`df.index\` | 行索引 |
| \`df.columns\` | 列索引 |
| \`df.dtypes\` | 每列的数据类型 |
| \`df.shape\` | (行数, 列数) |
| \`df.size\` | 总元素数 = 行数 × 列数 |
| \`df.ndim\` | 维度 = 2 |
| \`df.empty\` | 是否为空 |
| \`df.T\` | 转置（行列互换） |

#### 1.3.3 列与行的访问

**选列**（最常用）：

\`\`\`python
df['name']         # 返回 Series
df.name            # 等价写法（列名必须是合法标识符时）
df[['name','age']] # 选多列，返回 DataFrame
\`\`\`

**选行**：

\`\`\`python
df.loc[1]          # 标签为 1 的行
df.iloc[1]         # 第 2 行（位置）
df.loc[1:2, 'name':'age']  # 标签切片同时切行列
df.iloc[0:2, 0:2]          # 位置切片
\`\`\`

**条件筛选（布尔索引）**：

\`\`\`python
df[df['age'] > 25]                # 年龄大于 25 的行
df[(df['age']>25) & (df['city']=='北京')]  # 多条件用 & | ~
df.query("age > 25 and city == '北京'")    # query 写法更简洁
\`\`\`

### 1.4 数据类型（dtype）体系

Pandas 的 dtype 体系直接关系到内存占用和运算性能：

| dtype | 说明 | 别名 |
| --- | --- | --- |
| \`int64\` / \`int32\` | 整数 | 'i' |
| \`float64\` / \`float32\` | 浮点（含 NaN） | 'f' |
| \`bool\` | 布尔 | 'b' |
| \`object\` | Python 对象（通常是字符串） | 'O' |
| \`datetime64[ns]\` | 时间戳 | 'M' |
| \`timedelta64[ns]\` | 时间差 | 'm' |
| \`category\` | 分类（枚举） | 'C' |
| \`string\` | Pandas 1.0+ 新字符串类型 | 'str' |

**关键陷阱**：整数列一旦出现 NaN，会**自动升级为 float64**。这是新手最常见的疑惑之一——为什么我的整数列变成浮点了？

\`\`\`python
pd.Series([1, 2, None])        # dtype 是 float64！
pd.Series([1, 2, None], dtype='Int64')  # 用 Nullable Int64 保留整数
\`\`\`

### 1.5 Index 对象：不可变的标签数组

Index 是 Pandas 中容易被忽视但极其重要的对象。它**不可变**（immutable），类似元组，但支持集合运算：

\`\`\`python
idx1 = pd.Index(['a','b','c'])
idx2 = pd.Index(['b','c','d'])
idx1 & idx2   # 交集 Index(['b','c'])
idx1 | idx2   # 并集 Index(['a','b','c','d'])
idx1 ^ idx2   # 对称差 Index(['a','d'])
\`\`\`

常见的 Index 子类型：

- **RangeIndex**：默认整数索引（类似 range）
- **Int64Index** / **Float64Index**：数值索引
- **DatetimeIndex**：时间戳索引（时间序列核心）
- **MultiIndex**：层次化索引（高阶用法）
- **CategoricalIndex**：分类索引

### 1.6 Series 与 DataFrame 的关系

DataFrame 本质上是"共享 index 的 Series 字典"。取一列就得到一个 Series，其 name 属性就是列名：

\`\`\`python
df['age'].name           # 'age'
df['age'] is df['age']   # False！每次取列都返回新 Series
\`\`\`

**重要**：\`df['age']\` 返回的是**视图或副本**（取决于具体操作），直接修改可能不会反映到原 df。要安全修改列，用：

\`\`\`python
df.loc[:, 'age'] = df['age'] + 1   # 用 loc 显式赋值
df['age'] = df['age'].values + 1   # 用 .values 取出数组再改
\`\`\`

### 1.7 常用查看方法

| 方法 | 用途 |
| --- | --- |
| \`df.head(n=5)\` | 前 n 行 |
| \`df.tail(n=5)\` | 后 n 行 |
| \`df.info()\` | 类型与内存概览 |
| \`df.describe()\` | 数值列统计摘要 |
| \`df.value_counts()\` | 频数统计（Series） |
| \`df.unique()\` | 去重值（Series） |
| \`df.nunique()\` | 去重后数量 |
| \`df.memory_usage()\` | 每列内存占用 |

### 1.8 性能与内存优化技巧

1. **降低数值精度**：\`df.astype({'id':'int32','score':'float32'})\` 可减半内存
2. **用 category 类型**：低基数字符串列（性别、城市）转 category 可省 10 倍内存
3. **用 string 替代 object**：Pandas 1.0+ 的 \`'string'\` 类型支持 NaN 且更快
4. **避免逐行迭代**：\`df.iterrows()\` 很慢，优先用向量化操作或 \`.apply()\`
5. **链式赋值警告**：\`df[df.a>0]['b'] = 1\` 不会生效，应改用 \`df.loc[df.a>0, 'b'] = 1\`

### 1.9 本章小结

- **Series = 带索引的一维数组**，**DataFrame = 共享 index 的 Series 集合**
- 创建方式：列表、字典、NumPy 数组、文件、SQL
- 访问优先用 \`.loc[]\`（标签）和 \`.iloc[]\`（位置），避免 \`[]\` 的歧义
- dtype 体系决定内存与性能，整数遇 NaN 会升级为 float
- Index 不可变且支持集合运算，是数据对齐的基石
- 真正理解 Series 和 DataFrame 的"视图 vs 副本"机制，才能避开 SettingWithCopyWarning 这个最经典的坑

下一章我们将学习如何把外部数据（CSV/JSON/Excel/SQL）读入这些数据结构，以及如何把处理结果导出存盘。`,
    code: `# ============================================================
# 第 1 章代码演示：用纯 Python 模拟 Pandas 的 Series 与 DataFrame
# ============================================================
# 本文件不依赖 pandas，而是用标准库实现一个"迷你版"的
# Series 和 DataFrame，让读者从原理上理解它们的行为：
#   - 带标签的索引
#   - 自动对齐
#   - loc / iloc 访问
#   - 列选择与布尔筛选
#   - dtype 概念
# 真实使用时把代码换成 import pandas as pd 即可。

import math
from collections import OrderedDict

# ---- 工具函数：判断是否为 NaN ----
def _is_nan(v):
    return v is None or (isinstance(v, float) and math.isnan(v))

# ============================================================
# 1. 迷你 Series 实现
# ============================================================
class Series:
    """简化版 Series：一维带标签数组"""

    def __init__(self, data, index=None, name=None, dtype=None):
        if isinstance(data, dict):
            # 从字典创建：键->index，值->data
            self.index = list(data.keys())
            self.data = list(data.values())
        else:
            self.data = list(data)
            self.index = list(index) if index is not None else list(range(len(self.data)))
        self.name = name
        assert len(self.data) == len(self.index), "data 和 index 长度不一致"
        # 推断 dtype
        self.dtype = dtype or self._infer_dtype(self.data)

    def _infer_dtype(self, data):
        non_nan = [v for v in data if not _is_nan(v)]
        if not non_nan:
            return 'object'
        if all(isinstance(v, bool) for v in non_nan):
            return 'bool'
        if all(isinstance(v, int) for v in non_nan):
            # 有 NaN 时整数会"升级"为 float
            return 'float64' if any(_is_nan(v) for v in data) else 'int64'
        if all(isinstance(v, (int, float)) for v in non_nan):
            return 'float64'
        return 'object'

    # ---- 长度与形状 ----
    def __len__(self):
        return len(self.data)

    @property
    def shape(self):
        return (len(self.data),)

    @property
    def size(self):
        return len(self.data)

    @property
    def values(self):
        return self.data

    # ---- 标签访问 ----
    def __getitem__(self, key):
        # 切片：标签切片是双闭的
        if isinstance(key, slice):
            start = self.index.index(key.start) if key.start is not None else None
            stop = self.index.index(key.stop) if key.stop is not None else None
            # 位置切片转标签切片：右端 +1
            if stop is not None:
                stop += 1
            return Series(self.data[start:stop],
                          self.index[start:stop],
                          name=self.name)
        # 列表/条件
        if isinstance(key, list):
            if all(isinstance(k, bool) for k in key):
                # 布尔掩码
                new_data = [d for d, m in zip(self.data, key) if m]
                new_index = [i for i, m in zip(self.index, key) if m]
                return Series(new_data, new_index, name=self.name)
            # 标签列表
            pos = [self.index.index(k) for k in key]
            return Series([self.data[p] for p in pos], key, name=self.name)
        # 单个标签
        return self.data[self.index.index(key)]

    # ---- loc / iloc ----
    def loc(self, key):
        """按标签访问"""
        return self[key]

    def iloc(self, pos):
        """按位置访问"""
        if isinstance(pos, slice):
            return Series(self.data[pos], self.index[pos], name=self.name)
        return self.data[pos]

    # ---- 算术运算：自动对齐 ----
    def __add__(self, other):
        if isinstance(other, Series):
            # 按标签对齐：缺失补 None
            all_index = list(OrderedDict.fromkeys(self.index + other.index))
            new_data = []
            for idx in all_index:
                a = self[idx] if idx in self.index else None
                b = other[idx] if idx in other.index else None
                if _is_nan(a) or _is_nan(b):
                    new_data.append(None)
                else:
                    new_data.append(a + b)
            return Series(new_data, all_index, name=self.name)
        return Series([d + other if not _is_nan(d) else None for d in self.data],
                      self.index, name=self.name)

    # ---- 统计方法 ----
    def sum(self):
        return sum(d for d in self.data if not _is_nan(d))

    def mean(self):
        valid = [d for d in self.data if not _is_nan(d)]
        return sum(valid) / len(valid) if valid else float('nan')

    def max(self):
        return max(d for d in self.data if not _is_nan(d))

    def min(self):
        return min(d for d in self.data if not _is_nan(d))

    def count(self):
        return sum(1 for d in self.data if not _is_nan(d))

    def isna(self):
        return Series([_is_nan(d) for d in self.data], self.index, name=self.name)

    # ---- 字符串表示 ----
    def __repr__(self):
        lines = []
        max_idx = max(len(str(i)) for i in self.index)
        for i, v in zip(self.index, self.data):
            vstr = 'NaN' if _is_nan(v) else str(v)
            lines.append(f"{str(i):>{max_idx}}    {vstr}")
        header = f"Name: {self.name}, dtype: {self.dtype}" if self.name else f"dtype: {self.dtype}"
        return "\\n".join(lines) + f"\\n{header}"


# ============================================================
# 2. 迷你 DataFrame 实现
# ============================================================
class DataFrame:
    """简化版 DataFrame：共享 index 的多个 Series"""

    def __init__(self, data, index=None, columns=None):
        if isinstance(data, dict):
            # 字典：键->列名，值->列数据
            self.columns = list(data.keys())
            col_data = list(data.values())
            length = len(col_data[0]) if col_data else 0
            self.index = list(index) if index else list(range(length))
            self._data = {c: list(v) for c, v in data.items()}
        elif isinstance(data, list):
            # 二维列表
            self.columns = columns or [f"col{i}" for i in range(len(data[0]))]
            length = len(data)
            self.index = list(index) if index else list(range(length))
            self._data = {c: [row[i] for row in data] for i, c in enumerate(self.columns)}
        else:
            raise TypeError("不支持的 data 类型")
        assert all(len(v) == len(self.index) for v in self._data.values()), "列长度不一致"

    @property
    def shape(self):
        return (len(self.index), len(self.columns))

    @property
    def values(self):
        return [[self._data[c][r] for c in self.columns] for r in range(len(self.index))]

    @property
    def dtypes(self):
        return {c: Series(self._data[c]).dtype for c in self.columns}

    # ---- 列访问 ----
    def __getitem__(self, key):
        if isinstance(key, str):
            # 单列：返回 Series
            return Series(self._data[key], self.index, name=key)
        if isinstance(key, list):
            # 多列：返回 DataFrame
            return DataFrame({c: self._data[c] for c in key}, self.index)
        # 布尔掩码：按行筛选
        if isinstance(key, Series) and key.dtype == 'bool':
            mask = key.data
            new_index = [i for i, m in zip(self.index, mask) if m]
            new_data = {c: [v for v, m in zip(self._data[c], mask) if m]
                        for c in self.columns}
            return DataFrame(new_data, new_index)
        if isinstance(key, list) and all(isinstance(k, bool) for k in key):
            new_index = [i for i, m in zip(self.index, key) if m]
            new_data = {c: [v for v, m in zip(self._data[c], key) if m]
                        for c in self.columns}
            return DataFrame(new_data, new_index)
        raise KeyError(key)

    # ---- loc / iloc ----
    def loc(self, row_label, col_label=None):
        r = self.index.index(row_label)
        if col_label is None:
            return Series([self._data[c][r] for c in self.columns], self.columns)
        return self._data[col_label][r]

    def iloc(self, row_pos, col_pos=None):
        if col_pos is None:
            return Series([self._data[c][row_pos] for c in self.columns], self.columns)
        return self._data[self.columns[col_pos]][row_pos]

    # ---- 常用方法 ----
    def head(self, n=5):
        new_data = {c: self._data[c][:n] for c in self.columns}
        return DataFrame(new_data, self.index[:n])

    def tail(self, n=5):
        new_data = {c: self._data[c][-n:] for c in self.columns}
        return DataFrame(new_data, self.index[-n:])

    def assign(self, **kwargs):
        """新增/覆盖列，返回新 DataFrame"""
        new_data = dict(self._data)
        for k, v in kwargs.items():
            if isinstance(v, Series):
                new_data[k] = v.data
            else:
                new_data[k] = list(v)
        return DataFrame(new_data, self.index)

    def describe(self):
        stats = {}
        for c in self.columns:
            s = Series(self._data[c])
            if s.dtype in ('int64', 'float64'):
                valid = [v for v in s.data if not _is_nan(v)]
                n = len(valid)
                if n:
                    sm = sorted(valid)
                    stats[c] = {
                        'count': n,
                        'mean': sum(valid)/n,
                        'std': (sum((x-sum(valid)/n)**2 for x in valid)/n)**0.5,
                        'min': sm[0],
                        '25%': sm[n//4],
                        '50%': sm[n//2],
                        '75%': sm[3*n//4],
                        'max': sm[-1],
                    }
        return stats

    def __repr__(self):
        lines = ["| " + " | ".join(["index"] + self.columns) + " |"]
        lines.append("|" + "|".join(["---"] * (len(self.columns)+1)) + "|")
        for r, idx in enumerate(self.index):
            row = [str(idx)] + [str(self._data[c][r]) for c in self.columns]
            lines.append("| " + " | ".join(row) + " |")
        return "\\n".join(lines)


# ============================================================
# 3. 演示：从创建到访问
# ============================================================
print("=" * 60)
print("1. Series 创建：从字典")
print("=" * 60)
pop = Series({'北京': 2154, '上海': 2487, '广州': 1531, '深圳': 1756},
             name='人口(万人)')
print(pop)
print("shape:", pop.shape, "size:", pop.size, "dtype:", pop.dtype)
print("mean:", pop.mean(), "sum:", pop.sum())

print("\\n" + "=" * 60)
print("2. Series 标签访问 vs 位置访问")
print("=" * 60)
print("pop['上海']      =", pop['上海'])
print("pop.loc('上海')  =", pop.loc('上海'))
print("pop.iloc(1)      =", pop.iloc(1))
print("pop['上海':'深圳'] =", list(pop['上海':'深圳'].data))  # 双闭

print("\\n" + "=" * 60)
print("3. Series 自动对齐：长度不同的两 Series 相加")
print("=" * 60)
a = Series({'北京': 10, '上海': 20, '广州': 30})
b = Series({'上海': 100, '广州': 200, '深圳': 300})
c = a + b
print("a + b =")
print(c)
print("说明：北京只在 a 中，深圳只在 b 中，结果为 NaN；上海/广州 相加")

print("\\n" + "=" * 60)
print("4. 整数列遇 NaN 自动升级为 float")
print("=" * 60)
s_int = Series([1, 2, 3])
s_nan = Series([1, 2, None])
print("纯整数 dtype:", s_int.dtype)
print("带 None dtype:", s_nan.dtype, "（已升级为 float64）")

print("\\n" + "=" * 60)
print("5. DataFrame 创建与查看")
print("=" * 60)
df = DataFrame({
    'name': ['张三', '李四', '王五', '赵六'],
    'age':  [28, 34, 25, 41],
    'city': ['北京', '上海', '广州', '北京'],
    'salary': [15000, 25000, 12000, 30000],
})
print(df)
print("\\nshape:", df.shape)
print("dtypes:", df.dtypes)

print("\\n--- head(2) ---")
print(df.head(2))

print("\\n--- tail(2) ---")
print(df.tail(2))

print("\\n" + "=" * 60)
print("6. 列选择与布尔筛选")
print("=" * 60)
print("--- df['name'] (单列返回 Series) ---")
print(df['name'])

print("\\n--- df[['name','age']] (多列返回 DataFrame) ---")
print(df[['name', 'age']])

print("\\n--- 年龄大于 25 的行 ---")
mask = df['age'] > 25
print(df[mask])

print("\\n--- 复合条件：年龄>25 且 城市='北京' ---")
mask2 = (df['age'] > 25) & (df['city'] == '北京')
# 这里复用 Series 的 & 操作（简化为逐元素）
mask_list = [a and b for a, b in zip(mask.data, (df['city'] == '北京').data)]
print(df[mask_list])

print("\\n" + "=" * 60)
print("7. loc / iloc 显式访问")
print("=" * 60)
print("df.loc(0)        =", df.loc(0))           # 标签 0 的整行
print("df.loc(1,'name') =", df.loc(1, 'name'))   # 第 2 行 name 列
print("df.iloc(2)       =", df.iloc(2))          # 位置 2 的整行
print("df.iloc(0, 2)    =", df.iloc(0, 2))       # 第 1 行第 3 列

print("\\n" + "=" * 60)
print("8. describe 数值统计")
print("=" * 60)
stats = df.describe()
for col, s in stats.items():
    print(f"\\n列 {col}:")
    for k, v in s.items():
        print(f"  {k:>8}: {v:.2f}")

print("\\n" + "=" * 60)
print("9. assign 新增列")
print("=" * 60)
df2 = df.assign(tax=[s * 0.1 for s in df['salary'].data])
print(df2)

print("\\n" + "=" * 60)
print("10. 自动对齐：从两个 Series 字典构造 DataFrame")
print("=" * 60)
df_align = DataFrame({
    'math': Series({'张三': 90, '李四': 85, '王五': 78}).data + [None],
    'eng':  Series({'张三': 88, '李四': 92}).data + [None, None],
})
# 用等长列表演示对齐概念
df_align2 = DataFrame({
    'math': [90, 85, 78, None],
    'eng':  [88, 92, None, None],
})
print(df_align2)
print("\\ndtypes:", df_align2.dtypes)
print("（注意 math 列因含 None 升级为 float64）")

print("\\n" + "=" * 60)
print("✅ 第 1 章演示完毕：理解了 Series 与 DataFrame 的核心概念")
print("=" * 60)
`,
  },

  // ============================================================
  // 第 2 章：数据读取与存储
  // ============================================================
  {
    id: "aipy-pandas-io",
    icon: "📥",
    group: "Pandas数据处理",
    title: "数据读取与存储",
    content: `## 数据读取与存储

数据分析的第一步永远是"把数据读进来"，最后一步通常是"把结果写出去"。Pandas 提供了一整套 \`read_*\` / \`to_*\` 函数，覆盖了几乎所有常见数据源：CSV、JSON、Excel、SQL、Parquet、HDF5、HTML、剪贴板、Stata、SAS、Feather、Pickle……

本章聚焦最常用的四种格式（CSV、JSON、Excel、SQL），并讨论编码、缺失值、分块读取等工程实践问题。

### 2.1 CSV：最通用的格式

**CSV（Comma-Separated Values）** 是数据科学里最常见、最通用的格式。它本质是纯文本，每行一条记录，字段间用逗号分隔。

\`\`\`
id,name,age,city
1,张三,28,北京
2,李四,34,上海
\`\`\`

#### 2.1.1 pd.read_csv 核心参数

\`\`\`python
pd.read_csv(
    filepath_or_buffer,   # 文件路径或 URL 或文件对象
    sep=',',              # 分隔符，常用 ',' 或 '\\t'
    header=0,             # 列名所在行，None 表示无列名
    names=['a','b','c'],  # 自定义列名
    index_col=0,          # 哪一列作为 index
    usecols=['id','name'],# 只读部分列，省内存
    dtype={'id':'int32'}, # 指定列类型
    na_values=['NA','?'], # 这些值视为 NaN
    parse_dates=['date'], # 把这些列解析为日期
    nrows=1000,           # 只读前 N 行（探查用）
    chunksize=10000,      # 分块迭代器（大文件）
    encoding='utf-8',     # 编码
    skiprows=2,           # 跳过前 2 行
    nrows=1000,           # 只读 1000 行
)
\`\`\`

#### 2.1.2 编码问题（最常见的坑）

中文 CSV 最让人头疼的就是编码。常见编码：

| 编码 | 说明 | 出现场景 |
| --- | --- | --- |
| \`utf-8\` | 国际标准，推荐 | Linux、Mac 默认 |
| \`gbk\` / \`gb2312\` | 中文 Windows 默认 | 中文 Windows 导出的 CSV |
| \`utf-8-sig\` | UTF-8 带 BOM | Excel 打开 UTF-8 CSV 不乱码 |
| \`latin1\` | 兜底，不会报错但可能乱码 | 不确定编码时 |

**经验法则**：

1. 先试 \`utf-8\`
2. 报 \`UnicodeDecodeError\` 就试 \`gbk\`
3. 想用 Excel 打开 UTF-8 文件不乱码，写入时用 \`utf-8-sig\`
4. 完全不确定时，用 \`chardet\` 库自动检测：\`pd.read_csv(path, encoding=chardet.detect(open(path,'rb').read())['encoding'])\`

#### 2.1.3 分块读取大文件

CSV 文件超过内存时，用 \`chunksize\` 迭代处理：

\`\`\`python
total = 0
for chunk in pd.read_csv('huge.csv', chunksize=100000):
    total += chunk['amount'].sum()
print(total)
\`\`\`

每次只读 10 万行进内存，处理完释放，再读下一段。这是"流式处理"思想在 Pandas 中的体现。

#### 2.1.4 写出 CSV

\`\`\`python
df.to_csv('out.csv',
          index=False,         # 不写行索引
          encoding='utf-8-sig',# Excel 友好
          columns=['a','b'],   # 只写部分列
          sep='\\t',            # TSV
          float_format='%.2f') # 浮点精度
\`\`\`

**关键建议**：永远加 \`index=False\`，除非你的 index 真的有意义（如日期）。默认写 index 会让下次读进来多出一列 \`Unnamed: 0\`。

### 2.2 JSON：嵌套与半结构化

JSON 比 CSV 灵活：可以嵌套、可以异构。但灵活也意味着读起来更复杂。

#### 2.2.1 pd.read_json 的 orient 参数

JSON 有多种"形状"，\`orient\` 指定如何解读：

\`\`\`python
# orient='records'（默认）：[{列:值}, {列:值}]
[{"id":1,"name":"张三"},{"id":2,"name":"李四"}]

# orient='columns'：{列:{索引:值}}
{"id":{"0":1,"1":2},"name":{"0":"张三","1":"李四"}}

# orient='index'：{索引:{列:值}}
{"0":{"id":1,"name":"张三"},"1":{"id":2,"name":"李四"}}

# orient='values'：[[值,值], [值,值]]
[[1,"张三"],[2,"李四"]]

# orient='split'：{index:[], columns:[], data:[[]]}
{"index":[0,1],"columns":["id","name"],"data":[[1,"张三"],[2,"李四"]]}
\`\`\`

#### 2.2.2 嵌套 JSON：json_normalize

API 返回的 JSON 通常嵌套很深，\`pd.json_normalize\` 能把它展平：

\`\`\`python
data = [
    {"id":1, "name":"张三", "address":{"city":"北京","zip":"100000"}},
    {"id":2, "name":"李四", "address":{"city":"上海","zip":"200000"}},
]
df = pd.json_normalize(data)
# 列：id, name, address.city, address.zip
\`\`\`

更深的嵌套用 \`record_path\` 和 \`meta\` 参数展开子数组。

#### 2.2.3 写出 JSON

\`\`\`python
df.to_json('out.json',
           orient='records',
           force_ascii=False,  # 中文不转 \\uXXXX
           indent=2)           # 美化缩进
\`\`\`

**陷阱**：默认 \`force_ascii=True\`，中文会变成 \`\\u5f20\\u4e09\`。永远加 \`force_ascii=False\`。

### 2.3 Excel：办公场景必备

Excel 文件比 CSV 复杂得多——一个 .xlsx 可以有多个 sheet，每个 sheet 有格式、公式、合并单元格等。

#### 2.3.1 安装引擎

Pandas 本身不读 Excel，需要后端引擎：

- \`openpyxl\`：读写 .xlsx（推荐）
- \`xlrd\`：读旧版 .xls（已停止维护，2.0+ 不再支持 xlsx）
- \`xlwt\`：写旧版 .xls
- \`pyxlsb\`：读 .xlsb 二进制

\`\`\`bash
pip install openpyxl
\`\`\`

#### 2.3.2 读取 Excel

\`\`\`python
pd.read_excel(
    'data.xlsx',
    sheet_name=0,           # 第 1 个 sheet，也可传名字 'Sheet1' 或列表 ['Sheet1','Sheet2']
    header=0,
    usecols='A:C',          # Excel 区域语法
    skiprows=2,
    nrows=100,
    dtype={'金额':'float64'},
    engine='openpyxl',
)

# 读取所有 sheet
all_sheets = pd.read_excel('data.xlsx', sheet_name=None)
# 返回 dict: {'Sheet1': df1, 'Sheet2': df2}
\`\`\`

#### 2.3.3 写出 Excel（含多 sheet）

\`\`\`python
with pd.ExcelWriter('out.xlsx', engine='openpyxl') as writer:
    df1.to_excel(writer, sheet_name='原始', index=False)
    df2.to_excel(writer, sheet_name='汇总', index=False)
\`\`\`

#### 2.3.4 Excel 格式化

\`openpyxl\` 支持条件格式、合并单元格、公式等。结合 \`ExcelWriter\` 可以做漂亮的报表：

\`\`\`python
with pd.ExcelWriter('report.xlsx', engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='销售', index=False)
    ws = writer.sheets['销售']
    # 列宽自适应
    for col in ws.columns:
        max_len = max(len(str(c.value)) for c in col)
        ws.column_dimensions[col[0].column_letter].width = max_len + 2
\`\`\`

### 2.4 SQL：数据库读写

Pandas 通过 \`SQLAlchemy\` 连接几乎所有数据库（MySQL、PostgreSQL、SQLite、Oracle、SQL Server……）。

\`\`\`bash
pip install sqlalchemy psycopg2-binary pymysql
\`\`\`

#### 2.4.1 读取

\`\`\`python
from sqlalchemy import create_engine
engine = create_engine('postgresql://user:pass@host:5432/db')

# 方式一：整张表
df = pd.read_sql('users', engine)

# 方式二：SQL 查询
df = pd.read_sql('SELECT * FROM users WHERE age > 18', engine)

# 方式三：分块
for chunk in pd.read_sql('SELECT * FROM big_table', engine, chunksize=10000):
    process(chunk)
\`\`\`

#### 2.4.2 写入

\`\`\`python
df.to_sql('users', engine,
          if_exists='append',  # fail / replace / append
          index=False,
          chunksize=1000,      # 大数据分批写
          dtype={'id': 'INTEGER'})  # 指定列类型
\`\`\`

**性能警告**：\`to_sql\` 默认逐行 INSERT，很慢。大数据量建议：

1. 用 \`chunksize\` 分批
2. 用 \`method='multi'\` 一次插多行
3. 极致性能：写到 CSV 再用数据库的 \`COPY\` / \`LOAD DATA\` 命令

### 2.5 其他格式速览

| 格式 | 读 | 写 | 特点 |
| --- | --- | --- | --- |
| **Parquet** | \`pd.read_parquet\` | \`df.to_parquet\` | 列式存储，压缩比高，保留类型 |
| **Feather** | \`pd.read_feather\` | \`df.to_feather\` | 极快读写，跨语言 |
| **HDF5** | \`pd.read_hdf\` | \`df.to_hdf\` | 适合多次随机访问 |
| **Pickle** | \`pd.read_pickle\` | \`df.to_pickle\` | Python 原生，不跨语言 |
| **HTML** | \`pd.read_html\` | \`df.to_html\` | 抓网页表格 |
| **Stata** | \`pd.read_stata\` | \`df.to_stata\` | 学术用 |
| **剪贴板** | \`pd.read_clipboard\` | \`df.to_clipboard\` | 复制粘贴 |

**选型建议**：

- 中间结果存 **Parquet** 或 **Feather**（快且保留类型）
- 长期归档用 **Parquet**（列式压缩）
- 跨语言交换用 **CSV** 或 **JSON**
- 永远别用 Pickle 存要给别人用的文件（不安全）

### 2.6 工程实践

#### 2.6.1 读取前先探查

不要一上来就 \`pd.read_csv\`，先用 \`head\` 看前几行：

\`\`\`bash
head -n 5 data.csv     # Linux/Mac
Get-Content data.csv -Head 5   # PowerShell
\`\`\`

或者用 Python：

\`\`\`python
pd.read_csv('data.csv', nrows=5)
\`\`\`

确认列名、分隔符、编码后再正式读取。

#### 2.6.2 指定 dtype 省内存

默认 Pandas 会自动推断，但有时不准且费内存：

\`\`\`python
dtypes = {
    'id': 'int32',
    'name': 'category',
    'amount': 'float32',
    'flag': 'bool',
}
df = pd.read_csv('data.csv', dtype=dtypes)
\`\`\`

#### 2.6.3 解析日期一次到位

\`\`\`python
df = pd.read_csv('sales.csv',
                 parse_dates=['order_date', 'ship_date'],
                 date_format='%Y-%m-%d')
\`\`\`

避免读进来再 \`pd.to_datetime\` 转换，省一倍时间。

#### 2.6.4 缓存中间结果

复杂的清洗流程可以分阶段保存：

\`\`\`python
df_raw = pd.read_csv('raw.csv')
df_clean = clean(df_raw)
df_clean.to_parquet('clean.parquet')   # 中间结果存盘

# 下次直接从 clean 开始
df = pd.read_parquet('clean.parquet')
\`\`\`

### 2.7 本章小结

- CSV 最通用但易编码出错；中文优先 \`utf-8-sig\`
- JSON 灵活但要选对 \`orient\`，嵌套用 \`json_normalize\`
- Excel 需要 \`openpyxl\` 引擎，多 sheet 用 \`ExcelWriter\`
- SQL 通过 SQLAlchemy，大数据用 \`chunksize\` 分批
- 中间结果优先 Parquet，兼顾速度和类型
- 工程习惯：先 \`nrows=5\` 探查，再指定 dtype、parse_dates 一次到位

下一章我们将学习如何清洗这些读进来的"脏数据"——缺失值、重复值、异常值、类型转换。`,
    code: `# ============================================================
# 第 2 章代码演示：用纯 Python 模拟 Pandas 的 IO 操作
# ============================================================
# 由于沙盒只有标准库，我们用 csv / json / sqlite3 模块
# 模拟 pd.read_csv / pd.read_json / pd.read_sql 的核心行为，
# 并演示编码、分块、多 sheet 等概念。

import csv
import json
import os
import sqlite3
import io
from collections import OrderedDict

# ---- 复用第 1 章的迷你 DataFrame ----
def _is_nan(v):
    return v is None or (isinstance(v, float) and v != v)

class DataFrame:
    def __init__(self, data, index=None, columns=None):
        if isinstance(data, dict):
            self.columns = list(data.keys())
            length = len(next(iter(data.values()))) if data else 0
            self.index = list(index) if index else list(range(length))
            self._data = {c: list(v) for c, v in data.items()}
        elif isinstance(data, list):
            self.columns = columns or [f"col{i}" for i in range(len(data[0]) if data else 0)]
            self.index = list(index) if index else list(range(len(data)))
            self._data = {c: [row[i] for row in data] for i, c in enumerate(self.columns)}
        else:
            raise TypeError("不支持")
        assert all(len(v) == len(self.index) for v in self._data.values())

    @property
    def shape(self):
        return (len(self.index), len(self.columns))

    def __getitem__(self, key):
        if isinstance(key, str):
            return list(self._data[key])
        if isinstance(key, list):
            return DataFrame({c: self._data[c] for c in key}, self.index)
        raise KeyError

    def head(self, n=5):
        return DataFrame({c: self._data[c][:n] for c in self.columns}, self.index[:n])

    def to_dict_records(self):
        return [{c: self._data[c][r] for c in self.columns} for r in range(len(self.index))]

    def __repr__(self):
        lines = ["| " + " | ".join(self.columns) + " |"]
        lines.append("|" + "|".join(["---"] * len(self.columns)) + "|")
        for r in range(len(self.index)):
            lines.append("| " + " | ".join(str(self._data[c][r]) for c in self.columns) + " |")
        return "\\n".join(lines)


# ============================================================
# 1. CSV 读写：模拟 pd.read_csv / df.to_csv
# ============================================================
def read_csv(path, encoding='utf-8', sep=',', na_values=None, dtype=None, nrows=None):
    """迷你版 pd.read_csv"""
    na_values = set(na_values or [])
    with open(path, 'r', encoding=encoding, newline='') as f:
        reader = csv.reader(f, delimiter=sep)
        rows = list(reader)
    if not rows:
        return DataFrame({})
    header = rows[0]
    body = rows[1:]
    if nrows:
        body = body[:nrows]
    col_data = {h: [] for h in header}
    for row in body:
        for i, h in enumerate(header):
            val = row[i] if i < len(row) else ''
            # 缺失值处理
            if val in na_values or val == '' or val == 'NA':
                col_data[h].append(None)
            else:
                # 类型推断
                try:
                    col_data[h].append(int(val))
                except ValueError:
                    try:
                        col_data[h].append(float(val))
                    except ValueError:
                        col_data[h].append(val)
    # 应用 dtype
    if dtype:
        for col, t in dtype.items():
            if col in col_data:
                col_data[col] = [t(v) if v is not None else None for v in col_data[col]]
    return DataFrame(col_data)


def to_csv(df, path, index=False, encoding='utf-8'):
    """迷你版 df.to_csv"""
    with open(path, 'w', encoding=encoding, newline='') as f:
        writer = csv.writer(f)
        if index:
            writer.writerow(['index'] + df.columns)
            for r in range(len(df.index)):
                writer.writerow([df.index[r]] + [df._data[c][r] for c in df.columns])
        else:
            writer.writerow(df.columns)
            for r in range(len(df.index)):
                writer.writerow([df._data[c][r] for c in df.columns])


# ============================================================
# 2. JSON 读写：模拟 pd.read_json / df.to_json
# ============================================================
def read_json(path_or_str, orient='records', encoding='utf-8'):
    """迷你版 pd.read_json"""
    if os.path.exists(path_or_str):
        with open(path_or_str, 'r', encoding=encoding) as f:
            obj = json.load(f)
    else:
        obj = json.loads(path_or_str)

    if orient == 'records':
        # [{列:值}, ...]
        cols = list(OrderedDict.fromkeys(k for r in obj for k in r))
        data = {c: [r.get(c) for r in obj] for c in cols}
        return DataFrame(data)
    elif orient == 'columns':
        # {列:{索引:值}}
        cols = list(obj.keys())
        idxs = sorted(set(int(i) for c in obj for i in obj[c]))
        data = {c: [obj[c].get(str(i)) for i in idxs] for c in cols}
        return DataFrame(data, index=idxs)
    elif orient == 'index':
        # {索引:{列:值}}
        idxs = sorted(int(k) for k in obj.keys())
        cols = list(OrderedDict.fromkeys(k for i in idxs for k in obj[str(i)]))
        data = {c: [obj[str(i)].get(c) for i in idxs] for c in cols}
        return DataFrame(data, index=idxs)
    elif orient == 'values':
        cols = [f"col{i}" for i in range(len(obj[0]))]
        data = {c: [row[i] for row in obj] for i, c in enumerate(cols)}
        return DataFrame(data)
    elif orient == 'split':
        return DataFrame({c: obj['data'][r][i] for i, c in enumerate(obj['columns'])}
                         if False else
                         {c: [row[i] for row in obj['data']] for i, c in enumerate(obj['columns'])},
                         index=obj['index'])
    raise ValueError(f"不支持的 orient: {orient}")


def to_json(df, path, orient='records', force_ascii=False, indent=None):
    """迷你版 df.to_json"""
    if orient == 'records':
        obj = [{c: df._data[c][r] for c in df.columns} for r in range(len(df.index))]
    elif orient == 'columns':
        obj = {c: {str(i): df._data[c][i] for i in range(len(df.index))} for c in df.columns}
    elif orient == 'index':
        obj = {str(df.index[r]): {c: df._data[c][r] for c in df.columns}
               for r in range(len(df.index))}
    elif orient == 'values':
        obj = [[df._data[c][r] for c in df.columns] for r in range(len(df.index))]
    elif orient == 'split':
        obj = {'index': df.index, 'columns': df.columns,
               'data': [[df._data[c][r] for c in df.columns] for r in range(len(df.index))]}
    else:
        raise ValueError(orient)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=not force_ascii, indent=indent, default=str)


def json_normalize(data, record_path=None, sep='.'):
    """迷你版 pd.json_normalize：展平嵌套 JSON"""
    if record_path:
        # 展开子数组
        rows = []
        for item in data:
            sub = item.get(record_path, [])
            meta = {k: v for k, v in item.items() if k != record_path}
            for s in sub:
                row = dict(meta)
                row.update(s)
                rows.append(row)
        cols = list(OrderedDict.fromkeys(k for r in rows for k in r))
        return DataFrame({c: [r.get(c) for r in rows] for c in cols})
    # 简单展平一层
    def flat(d, prefix=''):
        out = {}
        for k, v in d.items():
            key = prefix + sep + k if prefix else k
            if isinstance(v, dict):
                out.update(flat(v, key))
            else:
                out[key] = v
        return out
    rows = [flat(r) for r in data]
    cols = list(OrderedDict.fromkeys(k for r in rows for k in r))
    return DataFrame({c: [r.get(c) for r in rows] for c in cols})


# ============================================================
# 3. SQL 读写：模拟 pd.read_sql / df.to_sql
# ============================================================
def read_sql(query, conn):
    """迷你版 pd.read_sql"""
    cur = conn.execute(query)
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    data = {c: [r[i] for r in rows] for i, c in enumerate(cols)}
    return DataFrame(data)


def to_sql(df, name, conn, if_exists='fail'):
    """迷你版 df.to_sql"""
    cur = conn.cursor()
    # 检查表是否存在
    cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{name}'")
    exists = cur.fetchone()
    if exists and if_exists == 'fail':
        raise ValueError(f"表 {name} 已存在")
    if exists and if_exists == 'replace':
        conn.execute(f"DROP TABLE {name}")
    # 创建表（简化：所有列用 TEXT）
    cols_def = ", ".join(f'"{c}" TEXT' for c in df.columns)
    conn.execute(f"CREATE TABLE IF NOT EXISTS {name} ({cols_def})")
    # 插入
    placeholders = ", ".join("?" for _ in df.columns)
    rows = [[df._data[c][r] for c in df.columns] for r in range(len(df.index))]
    conn.executemany(f"INSERT INTO {name} VALUES ({placeholders})", rows)
    conn.commit()


# ============================================================
# 4. Excel 多 sheet 模拟：用 dict 代替 .xlsx
# ============================================================
class ExcelWriter:
    """迷你 ExcelWriter：用 dict 模拟多 sheet"""
    def __init__(self, path):
        self.path = path
        self.sheets = {}
    def __enter__(self):
        return self
    def __exit__(self, *a):
        # 用 json 模拟 xlsx 结构
        out = {name: df.to_dict_records() for name, df in self.sheets.items()}
        with open(self.path, 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
    def write_df(self, df, sheet_name):
        self.sheets[sheet_name] = df


def read_excel(path, sheet_name=0):
    """迷你 read_excel"""
    with open(path, 'r', encoding='utf-8') as f:
        obj = json.load(f)
    if sheet_name is None:
        return {name: DataFrame({c: [r[c] for r in rows] for c in rows[0]} if rows else {})
                for name, rows in obj.items()}
    if isinstance(sheet_name, int):
        name = list(obj.keys())[sheet_name]
    else:
        name = sheet_name
    rows = obj[name]
    if not rows:
        return DataFrame({})
    cols = list(rows[0].keys())
    return DataFrame({c: [r.get(c) for r in rows] for c in cols})


# ============================================================
# 演示
# ============================================================
print("=" * 60)
print("1. CSV 写入与读取（含编码处理）")
print("=" * 60)

# 模拟数据
sample_data = {
    'id': [1, 2, 3, 4],
    'name': ['张三', '李四', '王五', '赵六'],
    'age': [28, 34, 25, None],
    'salary': [15000.5, 25000.0, 12000.0, 30000.0],
}
df = DataFrame(sample_data)

csv_path = '/tmp/demo.csv'
to_csv(df, csv_path, index=False, encoding='utf-8')
print("写入 CSV 完成:", csv_path)

# 读取，处理 NA 和 dtype
df2 = read_csv(csv_path, encoding='utf-8', na_values=['', 'NA', 'None'],
               dtype={'salary': float})
print("\\n读回的 DataFrame:")
print(df2)
print("shape:", df2.shape)
print("（注意 age 列的 None 被识别为缺失值）")

print("\\n" + "=" * 60)
print("2. CSV 探查：先读前 2 行（nrows 模拟）")
print("=" * 60)
df_head = read_csv(csv_path, nrows=2)
print(df_head)

print("\\n" + "=" * 60)
print("3. JSON 多种 orient 演示")
print("=" * 60)

json_path = '/tmp/demo.json'
to_json(df, json_path, orient='records', force_ascii=True, indent=2)
print("--- orient='records' 写入（force_ascii=True，中文转义）---")
with open(json_path) as f:
    print(f.read()[:200] + "...")

to_json(df, json_path, orient='records', force_ascii=False, indent=2)
print("\\n--- orient='records' 写入（force_ascii=False，中文可读）---")
with open(json_path) as f:
    print(f.read()[:200] + "...")

print("\\n--- 读回 records ---")
df_json = read_json(json_path, orient='records')
print(df_json)

print("\\n--- orient='columns' 演示 ---")
to_json(df, json_path, orient='columns', force_ascii=False)
df_cols = read_json(json_path, orient='columns')
print(df_cols)

print("\\n--- orient='split' 演示 ---")
to_json(df, json_path, orient='split', force_ascii=False)
with open(json_path) as f:
    print(f.read()[:300] + "...")

print("\\n" + "=" * 60)
print("4. json_normalize：展平嵌套 JSON")
print("=" * 60)
nested = [
    {"id": 1, "name": "张三", "address": {"city": "北京", "zip": "100000"}},
    {"id": 2, "name": "李四", "address": {"city": "上海", "zip": "200000"}},
]
df_flat = json_normalize(nested)
print(df_flat)
print("展平后的列名:", df_flat.columns)

print("\\n" + "=" * 60)
print("5. SQL 读写：用 SQLite 演示")
print("=" * 60)
conn = sqlite3.connect(':memory:')

# 建表插入
to_sql(df, 'employees', conn, if_exists='replace')
print("写入 SQL 表 employees 完成")

# 查询全部
df_sql = read_sql("SELECT * FROM employees", conn)
print("\\n--- SELECT * FROM employees ---")
print(df_sql)

# 条件查询
df_sql2 = read_sql("SELECT name, salary FROM employees WHERE salary > 15000", conn)
print("\\n--- SELECT name, salary WHERE salary > 15000 ---")
print(df_sql2)

# 聚合查询
df_sql3 = read_sql("SELECT COUNT(*) as cnt, AVG(salary) as avg_sal FROM employees", conn)
print("\\n--- 聚合查询 ---")
print(df_sql3)

conn.close()

print("\\n" + "=" * 60)
print("6. Excel 多 sheet 模拟")
print("=" * 60)
xlsx_path = '/tmp/demo.xlsx'
df_summary = DataFrame({
    'city': ['北京', '上海', '广州'],
    'count': [10, 15, 8],
    'avg_salary': [18000, 22000, 14000],
})

with ExcelWriter(xlsx_path) as writer:
    writer.write_df(df, '原始数据')
    writer.write_df(df_summary, '汇总')
print("多 sheet Excel 写入完成")

# 读取所有 sheet
all_sheets = read_excel(xlsx_path, sheet_name=None)
print("\\n所有 sheet:")
for name, sdf in all_sheets.items():
    print(f"\\n--- Sheet: {name} ---")
    print(sdf)

print("\\n" + "=" * 60)
print("7. 编码处理演示")
print("=" * 60)

# 写入 GBK 编码的 CSV
gbk_path = '/tmp/demo_gbk.csv'
to_csv(df, gbk_path, encoding='gbk')
print("写入 GBK 编码 CSV 完成")

# 用 GBK 读回
df_gbk = read_csv(gbk_path, encoding='gbk')
print("用 GBK 读回:")
print(df_gbk.head(2))

# 演示编码检测（chardet 思路）
with open(gbk_path, 'rb') as f:
    raw = f.read(100)
print("\\n原始字节前 50 字节:", raw[:50])
print("提示：含中文字节且非 UTF-8 时，可尝试 gbk / gb2312")

# 写入 UTF-8-SIG（带 BOM，Excel 友好）
bom_path = '/tmp/demo_bom.csv'
to_csv(df, bom_path, encoding='utf-8-sig')
with open(bom_path, 'rb') as f:
    head = f.read(3)
print("\\nUTF-8-SIG 文件前 3 字节:", head, "（BOM: \\\\xef\\\\xbb\\\\xbf）")

print("\\n" + "=" * 60)
print("8. 分块读取大文件模拟")
print("=" * 60)

# 模拟大文件
big_path = '/tmp/big.csv'
with open(big_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'amount'])
    for i in range(1, 1001):
        writer.writerow([i, i * 10.5])

# 分块读取
print("分块读取 big.csv (每块 200 行):")
total_amount = 0
total_rows = 0
with open(big_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    chunk = []
    for row in reader:
        chunk.append(row)
        if len(chunk) == 200:
            df_chunk = DataFrame({'id': [int(r[0]) for r in chunk],
                                  'amount': [float(r[1]) for r in chunk]})
            total_amount += sum(df_chunk['amount'])
            total_rows += len(chunk)
            print(f"  处理一块: {len(chunk)} 行, 累计 {total_rows} 行, 当前块合计 {sum(df_chunk['amount']):.1f}")
            chunk = []
    # 处理剩余
    if chunk:
        df_chunk = DataFrame({'id': [int(r[0]) for r in chunk],
                              'amount': [float(r[1]) for r in chunk]})
        total_amount += sum(df_chunk['amount'])
        total_rows += len(chunk)
        print(f"  处理最后一块: {len(chunk)} 行, 累计 {total_rows} 行")

print(f"\\n总计 {total_rows} 行, amount 总和 = {total_amount:.2f}")

print("\\n" + "=" * 60)
print("✅ 第 2 章演示完毕：覆盖 CSV/JSON/SQL/Excel 读写、编码、分块")
print("=" * 60)
`,
  },

  // ============================================================
  // 第 3 章：数据清洗与预处理
  // ============================================================
  {
    id: "aipy-pandas-clean",
    icon: "🧹",
    group: "Pandas数据处理",
    title: "数据清洗与预处理",
    content: `## 数据清洗与预处理

数据科学家有一句名言："**数据科学家 80% 的时间花在清洗数据上**"。这句话虽然夸张，但道出了数据清洗在真实项目中的比重。从数据库、Excel、爬虫来的原始数据几乎一定有：缺失值、重复行、异常值、错误的类型、不一致的格式、单位混乱、编码错误……

本章系统讲解 Pandas 数据清洗的四大主题：**缺失值处理、重复值处理、异常值检测、数据类型转换**，并介绍字符串处理、列名规范化等工程技巧。

### 3.1 缺失值（Missing Data）

#### 3.1.1 什么是缺失值

Pandas 用 \`NaN\`（Not a Number，浮点特殊值）表示缺失。从 Pandas 1.0 开始，还引入了 \`NA\`（pd.NA）作为统一的缺失值哨兵，支持整数、布尔等类型。

| 来源 | 表示 | 说明 |
| --- | --- | --- |
| NumPy | \`np.nan\` | 浮点 NaN，最常见 |
| Python | \`None\` | 对象缺失，运算时变 NaN |
| Pandas | \`pd.NaT\` | 时间戳缺失 |
| Pandas 1.0+ | \`pd.NA\` | 统一缺失值 |

**关键区别**：

\`\`\`python
np.nan == np.nan    # False！NaN 不等于自己
np.nan != np.nan    # True
None == None        # True
pd.isna(np.nan)     # True（正确的判断方式）
pd.isna(None)       # True
\`\`\`

**永远不要用 \`==\` 判断 NaN**，要用 \`pd.isna()\` 或 \`Series.isna()\`。

#### 3.1.2 检测缺失值

\`\`\`python
df.isna()           # 整张表的缺失值布尔矩阵
df.isna().sum()     # 每列缺失数
df.isna().mean()    # 每列缺失比例
df.isna().any()     # 哪些列有缺失
df.isna().all()     # 哪些列全缺失
df[df['age'].isna()]   # age 为空的行
df[df['age'].notna()]  # age 非空的行
\`\`\`

#### 3.1.3 处理缺失值的三大策略

**策略一：删除（dropna）**

\`\`\`python
df.dropna()                  # 删除任何含 NaN 的行
df.dropna(how='all')         # 只删全 NaN 的行
df.dropna(subset=['age','salary'])  # 只看这两列
df.dropna(thresh=3)          # 保留至少 3 个非 NaN 的行
df.dropna(axis=1)            # 删除列（少用）
\`\`\`

**适用场景**：缺失很少（<5%）、缺失随机、样本充足。

**策略二：填充（fillna）**

\`\`\`python
# 用常量填
df.fillna(0)
df.fillna({'age': 0, 'city': '未知'})

# 用统计量填
df['age'].fillna(df['age'].mean())     # 均值
df['age'].fillna(df['age'].median())   # 中位数（更抗异常值）
df['city'].fillna(df['city'].mode()[0])  # 众数

# 用前后值填（时间序列常用）
df.fillna(method='ffill')   # 前向填充（Pandas 2.0+ 用 df.ffill()）
df.fillna(method='bfill')   # 后向填充

# 用分组均值填（更精准）
df['salary'] = df.groupby('city')['salary'].transform(lambda s: s.fillna(s.mean()))
\`\`\`

**适用场景**：缺失较多但可估计、不能丢失样本。

**策略三：插值（interpolate）**

\`\`\`python
df['value'].interpolate(method='linear')   # 线性插值
df['value'].interpolate(method='time')     # 按时间插值
df['value'].interpolate(method='spline', order=2)  # 样条插值
\`\`\`

**适用场景**：时间序列、连续信号。

#### 3.1.4 选择填充值的经验

- **数值列**：偏态分布用中位数，正态分布用均值，时间序列用 ffill/bfill 或插值
- **分类列**：用众数，或新增一个"未知"类别
- **重要特征**：宁可加一列"is_missing"标记，也不要直接填 0
- **目标变量**：直接删除缺失样本（机器学习任务）

### 3.2 重复值处理

#### 3.2.1 检测重复

\`\`\`python
df.duplicated()                # 标记重复行（保留首次出现）
df.duplicated(keep='last')     # 保留最后一次
df.duplicated(keep=False)      # 标记所有重复行
df.duplicated(subset=['name','age'])  # 只看部分列
df.duplicated().sum()          # 重复行总数
\`\`\`

#### 3.2.2 删除重复

\`\`\`python
df.drop_duplicates()                          # 删除完全重复的行
df.drop_duplicates(subset=['email'])          # 邮箱相同的只留一条
df.drop_duplicates(subset=['name','age'], keep='last')
df.drop_duplicates(inplace=True, ignore_index=True)  # 原地改 + 重建索引
\`\`\`

#### 3.2.3 部分重复的识别

有时不是整行重复，而是"业务上重复"——比如同一用户下了多单：

\`\`\`python
# 看每个用户下了几单
df.groupby('user_id').size().sort_values(0, ascending=False)

# 看重复最多的邮箱
df['email'].value_counts().head(10)
\`\`\`

### 3.3 异常值检测

异常值（Outlier）是"明显偏离正常范围"的值。检测方法分三大类：

#### 3.3.1 统计方法

**Z-Score（适用于近似正态分布）**

\`\`\`python
z = (df['salary'] - df['salary'].mean()) / df['salary'].std()
outliers = df[abs(z) > 3]   # |z| > 3 视为异常
\`\`\`

**IQR 法（更稳健，不受极端值影响）**

\`\`\`python
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers = df[(df['salary'] < lower) | (df['salary'] > upper)]
\`\`\`

IQR 法是箱线图的原理，1.5 倍 IQR 之外就是"须"上的点。

#### 3.3.2 业务规则法

\`\`\`python
# 年龄不能为负或超过 150
df[(df['age'] < 0) | (df['age'] > 150)]
# 日期不能晚于今天
df[df['order_date'] > pd.Timestamp.today()]
# 邮箱必须含 @
df[~df['email'].str.contains('@', na=False)]
\`\`\`

#### 3.3.3 机器学习方法

- **Isolation Forest**：\`sklearn.ensemble.IsolationForest\`
- **DBSCAN**：基于密度的聚类，密度低的点是异常
- **LOF**：局部异常因子

适合高维数据，但本章不深入。

#### 3.3.4 异常值处理

1. **删除**：确认是错误数据时
2. **替换为边界**：\`df['salary'] = df['salary'].clip(lower, upper)\`
3. **替换为 NaN**：再走缺失值流程
4. **保留**：异常值本身就是信号（风控、欺诈检测）

### 3.4 数据类型转换

#### 3.4.1 astype 基础转换

\`\`\`python
df['id'] = df['id'].astype('int32')
df['price'] = df['price'].astype('float64')
df['flag'] = (df['value'] > 0).astype('bool')
df['city'] = df['city'].astype('category')  # 节省内存
\`\`\`

#### 3.4.2 pd.to_numeric 智能转换

\`\`\`python
# 字符串列含 'abc' 这样的非数字
pd.to_numeric(df['amount'], errors='raise')    # 默认，遇错抛异常
pd.to_numeric(df['amount'], errors='coerce')   # 错误变 NaN
pd.to_numeric(df['amount'], errors='ignore')   # 错误保留原值（已弃用）
pd.to_numeric(df['amount'], downcast='integer')  # 自动用最小整数类型
\`\`\`

#### 3.4.3 pd.to_datetime 时间转换

\`\`\`python
df['date'] = pd.to_datetime(df['date'])
pd.to_datetime(df['date'], format='%Y-%m-%d')   # 显式格式更快
pd.to_datetime(df['date'], errors='coerce')     # 错误变 NaT
pd.to_datetime(['2024/01/01', '01-02-2024'], dayfirst=True)  # 欧式日期
\`\`\`

#### 3.4.4 category 类型

低基数列（性别、城市、状态）转 category 可省 10 倍内存：

\`\`\`python
df['city'] = df['city'].astype('category')
df['city'].cat.categories     # 所有类别
df['city'].cat.codes          # 整数编码
df['city'].cat.add_categories(['未知'])
df['city'].cat.remove_unused_categories()
\`\`\`

### 3.5 字符串处理

Pandas 的字符串通过 \`.str\` 访问器，自动跳过 NaN：

\`\`\`python
df['name'] = df['name'].str.strip()           # 去首尾空格
df['name'] = df['name'].str.lower()           # 转小写
df['name'] = df['name'].str.replace(' ', '_') # 替换
df['name'] = df['name'].str[:3]               # 前 3 字符
df['email_domain'] = df['email'].str.split('@').str[1]
df['has_at'] = df['email'].str.contains('@')
df['phone_ok'] = df['phone'].str.match(r'^1\\d{10}$')
df['len'] = df['name'].str.len()
\`\`\`

**注意**：\`.str\` 处理 NaN 时返回 NaN，不会报错。但有些操作（如正则）可能慢，大数据量考虑用 \`category\` 类型后再处理。

### 3.6 列名规范化

\`\`\`python
# 列名转小写 + 替换空格
df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

# 重命名部分列
df.rename(columns={'oldName': 'new_name'}, inplace=True)

# 加前缀
df = df.add_prefix('feat_')
\`\`\`

### 3.7 apply / map / transform

#### 3.7.1 Series.map

逐元素映射，最常用于编码：

\`\`\`python
df['gender'] = df['gender'].map({'M': '男', 'F': '女'})
df['is_adult'] = df['age'].map(lambda x: x >= 18)
\`\`\`

#### 3.7.2 Series.apply / DataFrame.apply

\`\`\`python
# Series.apply：等价于 map，但支持更复杂函数
df['score'] = df['score'].apply(lambda x: max(0, min(100, x)))

# DataFrame.apply：按轴聚合
df.apply(np.sum, axis=0)   # 列求和（默认）
df.apply(np.sum, axis=1)   # 行求和
df.apply(lambda row: f"{row['name']}-{row['age']}", axis=1)
\`\`\`

#### 3.7.3 DataFrame.applymap

逐元素应用（Pandas 2.1+ 改名为 \`map\`）：

\`\`\`python
df.applymap(lambda x: str(x).strip() if isinstance(x, str) else x)
\`\`\`

#### 3.7.4 性能建议

- 能向量化就别用 apply（\`df['x'] * 2\` 比 \`df['x'].apply(lambda x: x*2)\` 快 100 倍）
- 必须用 apply 时，先用 \`numba\` 或 \`cython\` 加速
- 真的复杂逻辑，考虑用 \`np.where\` / \`np.select\` 替代

### 3.8 数据清洗的完整流程

一个典型的清洗 pipeline：

\`\`\`python
def clean(df):
    # 1. 列名规范化
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

    # 2. 去重
    df = df.drop_duplicates().reset_index(drop=True)

    # 3. 类型转换
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    # 4. 缺失值
    df['age'] = df['age'].fillna(df['age'].median())
    df['city'] = df['city'].fillna('未知').astype('category')

    # 5. 异常值
    q1, q3 = df['amount'].quantile([0.25, 0.75])
    iqr = q3 - q1
    df['amount'] = df['amount'].clip(q1 - 1.5*iqr, q3 + 1.5*iqr)

    # 6. 字符串
    df['name'] = df['name'].str.strip().str.title()

    return df
\`\`\`

### 3.9 本章小结

- **缺失值**：用 \`isna()\` 检测，根据场景 drop / fill / interpolate
- **重复值**：\`duplicated()\` 检测，\`drop_duplicates()\` 删除
- **异常值**：Z-score / IQR / 业务规则三种思路，处理方式灵活
- **类型转换**：\`astype\` / \`to_numeric\` / \`to_datetime\` / \`category\`
- **字符串**：\`.str\` 访问器，自动跳过 NaN
- **apply**：灵活但慢，能向量化就别用

数据清洗没有标准答案，关键在于理解业务——一个 999 可能是"无上限"的哨兵值，也可能是真正的异常。永远带着业务上下文做判断。`,
    code: `# ============================================================
# 第 3 章代码演示：用纯 Python 模拟数据清洗流程
# ============================================================
# 演示内容：
#   - 缺失值检测与填充（dropna / fillna / 插值）
#   - 重复值检测与删除
#   - 异常值检测（Z-score / IQR）
#   - 类型转换（astype / to_numeric）
#   - 字符串处理（strip / lower / replace / split）
#   - apply / map 映射

import math
import statistics
from collections import Counter

# ---- 工具 ----
def _is_nan(v):
    return v is None or (isinstance(v, float) and v != v)

def _safe_float(v):
    try:
        f = float(v)
        return f if not math.isnan(f) else None
    except (ValueError, TypeError):
        return None

def _safe_int(v):
    f = _safe_float(v)
    return int(f) if f is not None else None

# ============================================================
# 迷你 DataFrame（精简版）
# ============================================================
class DataFrame:
    def __init__(self, data, index=None, columns=None):
        if isinstance(data, dict):
            self.columns = list(data.keys())
            length = len(next(iter(data.values()))) if data else 0
            self.index = list(index) if index else list(range(length))
            self._data = {c: list(v) for c, v in data.items()}
        elif isinstance(data, list) and data and isinstance(data[0], dict):
            cols = list(dict.fromkeys(k for r in data for k in r))
            self.columns = cols
            self.index = list(range(len(data)))
            self._data = {c: [r.get(c) for r in data] for c in cols}
        elif isinstance(data, list):
            self.columns = columns or [f"col{i}" for i in range(len(data[0]) if data else 0)]
            self.index = list(range(len(data)))
            self._data = {c: [row[i] for row in data] for i, c in enumerate(self.columns)}
        else:
            raise TypeError
        assert all(len(v) == len(self.index) for v in self._data.values())

    @property
    def shape(self):
        return (len(self.index), len(self.columns))

    def __getitem__(self, key):
        if isinstance(key, str):
            return self._data[key]
        if isinstance(key, list) and all(isinstance(k, str) for k in key):
            return DataFrame({c: self._data[c] for c in key}, self.index)
        if isinstance(key, list) and all(isinstance(k, bool) for k in key):
            new_data = {c: [v for v, m in zip(self._data[c], key) if m] for c in self.columns}
            new_idx = [i for i, m in zip(self.index, key) if m]
            return DataFrame(new_data, new_idx)
        raise KeyError

    def __setitem__(self, key, value):
        if isinstance(value, list):
            assert len(value) == len(self.index)
            self._data[key] = value
            if key not in self.columns:
                self.columns.append(key)

    def head(self, n=5):
        return DataFrame({c: self._data[c][:n] for c in self.columns}, self.index[:n])

    def __repr__(self):
        lines = ["| " + " | ".join(["idx"] + self.columns) + " |"]
        lines.append("|" + "|".join(["---"] * (len(self.columns)+1)) + "|")
        for r in range(len(self.index)):
            row = [str(self.index[r])] + [str(self._data[c][r]) for c in self.columns]
            lines.append("| " + " | ".join(row) + " |")
        return "\\n".join(lines)


# ============================================================
# 1. 缺失值处理
# ============================================================
def isna(series):
    return [_is_nan(v) for v in series]

def isna_sum(df):
    return {c: sum(1 for v in df._data[c] if _is_nan(v)) for c in df.columns}

def dropna(df, how='any', subset=None, thresh=None):
    cols = subset or df.columns
    keep = []
    for r in range(len(df.index)):
        row_na = [_is_nan(df._data[c][r]) for c in cols]
        if how == 'any' and any(row_na):
            continue
        if how == 'all' and all(row_na):
            continue
        if thresh is not None and sum(not x for x in row_na) < thresh:
            continue
        keep.append(r)
    new_data = {c: [df._data[c][r] for r in keep] for c in df.columns}
    new_idx = [df.index[r] for r in keep]
    return DataFrame(new_data, new_idx)

def fillna(df, value=None, method=None, subset=None):
    """填充缺失值"""
    new_data = {c: list(df._data[c]) for c in df.columns}
    fill_map = value if isinstance(value, dict) else {c: value for c in df.columns}
    for c in df.columns:
        fill_val = fill_map.get(c)
        for r in range(len(df.index)):
            if _is_nan(new_data[c][r]):
                if method == 'ffill':
                    # 前向填充
                    for k in range(r-1, -1, -1):
                        if not _is_nan(new_data[c][k]):
                            new_data[c][r] = new_data[c][k]
                            break
                elif method == 'bfill':
                    for k in range(r+1, len(df.index)):
                        if not _is_nan(new_data[c][k]):
                            new_data[c][r] = new_data[c][k]
                            break
                elif callable(fill_val):
                    new_data[c][r] = fill_val(df._data[c])
                elif fill_val is not None:
                    new_data[c][r] = fill_val
    return DataFrame(new_data, df.index)

def interpolate_linear(series):
    """线性插值"""
    result = list(series)
    n = len(result)
    # 找每段 NaN 的左右边界
    i = 0
    while i < n:
        if _is_nan(result[i]):
            # 找左边界
            left = i - 1
            while i < n and _is_nan(result[i]):
                i += 1
            right = i
            if left >= 0 and right < n:
                # 线性插值
                lv, rv = result[left], result[right]
                gap = right - left
                for k in range(left+1, right):
                    result[k] = lv + (rv - lv) * (k - left) / gap
        else:
            i += 1
    return result


# ============================================================
# 2. 重复值处理
# ============================================================
def duplicated(df, subset=None, keep='first'):
    """返回布尔列表，标记重复行"""
    cols = subset or df.columns
    seen = {}
    result = [False] * len(df.index)
    for r in range(len(df.index)):
        key = tuple(df._data[c][r] for c in cols)
        if key in seen:
            if keep == 'first':
                result[r] = True
            elif keep == 'last':
                result[seen[key]] = True
                seen[key] = r
            elif keep is False:
                result[r] = True
                result[seen[key]] = True
        else:
            seen[key] = r
    return result

def drop_duplicates(df, subset=None, keep='first'):
    mask = duplicated(df, subset, keep)
    keep_rows = [r for r in range(len(df.index)) if not mask[r]]
    new_data = {c: [df._data[c][r] for r in keep_rows] for c in df.columns}
    new_idx = [df.index[r] for r in keep_rows]
    return DataFrame(new_data, new_idx)


# ============================================================
# 3. 异常值检测
# ============================================================
def zscore(series):
    """计算 Z-score"""
    valid = [v for v in series if not _is_nan(v)]
    if len(valid) < 2:
        return [0.0] * len(series)
    mean = sum(valid) / len(valid)
    std = (sum((x - mean) ** 2 for x in valid) / len(valid)) ** 0.5
    if std == 0:
        return [0.0] * len(series)
    return [((v - mean) / std) if not _is_nan(v) else None for v in series]

def detect_outliers_zscore(series, threshold=3):
    z = zscore(series)
    return [abs(zv) > threshold if zv is not None else False for zv in z]

def quantile(series, q):
    """计算分位数（线性插值）"""
    valid = sorted(v for v in series if not _is_nan(v))
    if not valid:
        return None
    if len(valid) == 1:
        return valid[0]
    pos = q * (len(valid) - 1)
    lo = int(pos)
    hi = min(lo + 1, len(valid) - 1)
    frac = pos - lo
    return valid[lo] * (1 - frac) + valid[hi] * frac

def detect_outliers_iqr(series, k=1.5):
    q1 = quantile(series, 0.25)
    q3 = quantile(series, 0.75)
    iqr = q3 - q1
    lower = q1 - k * iqr
    upper = q3 + k * iqr
    mask = []
    for v in series:
        if _is_nan(v):
            mask.append(False)
        else:
            mask.append(v < lower or v > upper)
    return mask, lower, upper

def clip(series, lower=None, upper=None):
    """截断到边界"""
    result = []
    for v in series:
        if _is_nan(v):
            result.append(v)
        else:
            if lower is not None and v < lower:
                result.append(lower)
            elif upper is not None and v > upper:
                result.append(upper)
            else:
                result.append(v)
    return result


# ============================================================
# 4. 类型转换
# ============================================================
def to_numeric(series, errors='raise'):
    """转数值"""
    result = []
    for v in series:
        if _is_nan(v):
            result.append(None)
            continue
        f = _safe_float(v)
        if f is None:
            if errors == 'coerce':
                result.append(None)
            elif errors == 'raise':
                raise ValueError(f"无法转换为数值: {v!r}")
            else:
                result.append(v)
        else:
            result.append(f)
    return result

def astype(series, dtype):
    """类型转换"""
    if dtype in ('int', 'int32', 'int64'):
        return [_safe_int(v) if not _is_nan(v) else None for v in series]
    if dtype in ('float', 'float32', 'float64'):
        return [_safe_float(v) if not _is_nan(v) else None for v in series]
    if dtype == 'str':
        return [str(v) if not _is_nan(v) else None for v in series]
    if dtype == 'bool':
        return [bool(v) if not _is_nan(v) else None for v in series]
    return [dtype(v) if not _is_nan(v) else None for v in series]


# ============================================================
# 5. 字符串处理（模拟 .str 访问器）
# ============================================================
def str_strip(series):
    return [v.strip() if isinstance(v, str) else v for v in series]

def str_lower(series):
    return [v.lower() if isinstance(v, str) else v for v in series]

def str_upper(series):
    return [v.upper() if isinstance(v, str) else v for v in series]

def str_replace(series, old, new):
    return [v.replace(old, new) if isinstance(v, str) else v for v in series]

def str_contains(series, pat):
    return [pat in v if isinstance(v, str) else None for v in series]

def str_split(series, sep):
    return [v.split(sep) if isinstance(v, str) else None for v in series]

def str_len(series):
    return [len(v) if isinstance(v, str) else None for v in series]


# ============================================================
# 6. apply / map
# ============================================================
def series_map(series, mapping):
    """映射：dict 或函数"""
    if isinstance(mapping, dict):
        return [mapping.get(v, v) for v in series]
    return [mapping(v) for v in series]

def series_apply(series, func):
    return [func(v) for v in series]


# ============================================================
# 演示
# ============================================================
print("=" * 60)
print("1. 缺失值检测")
print("=" * 60)
df = DataFrame({
    'id': [1, 2, 3, 4, 5, 6],
    'name': ['张三', '李四', '王五', '赵六', None, '孙七'],
    'age': [28, None, 25, 41, 33, None],
    'salary': [15000, 25000, None, 30000, 18000, 22000],
    'city': ['北京', '上海', '广州', '北京', None, '上海'],
})
print(df)
print("\\n每列缺失数:")
for c, n in isna_sum(df).items():
    print(f"  {c}: {n}")

print("\\n--- isna(age) ---")
print(isna(df['age']))

print("\\n" + "=" * 60)
print("2. dropna：删除缺失行")
print("=" * 60)
print("--- how='any' (任何列缺失就删) ---")
print(dropna(df, how='any'))

print("\\n--- how='all' (全 NaN 才删) ---")
print(dropna(df, how='all'))

print("\\n--- subset=['age'] ---")
print(dropna(df, subset=['age']))

print("\\n--- thresh=4 (至少 4 个非空) ---")
print(dropna(df, thresh=4))

print("\\n" + "=" * 60)
print("3. fillna：填充缺失值")
print("=" * 60)
print("--- 用常量填充 ---")
print(fillna(df, {'name': '未知', 'city': '未知', 'age': 0, 'salary': 0}))

print("\\n--- 用统计量填充 ---")
ages = [v for v in df['age'] if not _is_nan(v)]
salaries = [v for v in df['salary'] if not _is_nan(v)]
cities = [v for v in df['city'] if not _is_nan(v)]
print(f"age 中位数: {statistics.median(ages)}")
print(f"salary 均值: {statistics.mean(salaries):.1f}")
print(f"city 众数: {Counter(cities).most_common(1)}")
print(fillna(df, {'age': statistics.median(ages),
                   'salary': statistics.mean(salaries),
                   'city': Counter(cities).most_common(1)[0][0],
                   'name': '未知'}))

print("\\n--- ffill 前向填充 ---")
print(fillna(df, method='ffill'))

print("\\n--- bfill 后向填充 ---")
print(fillna(df, method='bfill'))

print("\\n" + "=" * 60)
print("4. 线性插值")
print("=" * 60)
ts = DataFrame({
    'date': ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06'],
    'value': [10.0, None, 30.0, None, None, 60.0],
})
print("原始:")
print(ts)
ts['value'] = interpolate_linear(ts['value'])
print("\\n插值后:")
print(ts)

print("\\n" + "=" * 60)
print("5. 重复值检测")
print("=" * 60)
df2 = DataFrame({
    'id': [1, 2, 2, 3, 3, 3, 4],
    'name': ['a', 'b', 'b', 'c', 'c', 'c', 'd'],
    'age': [10, 20, 20, 30, 30, 30, 40],
})
print(df2)
print("\\n--- duplicated(keep='first') ---")
print(duplicated(df2, keep='first'))
print("\\n--- duplicated(keep='last') ---")
print(duplicated(df2, keep='last'))
print("\\n--- duplicated(keep=False) ---")
print(duplicated(df2, keep=False))
print("\\n--- duplicated(subset=['id']) ---")
print(duplicated(df2, subset=['id']))

print("\\n--- drop_duplicates() ---")
print(drop_duplicates(df2))

print("\\n--- drop_duplicates(subset=['id'], keep='last') ---")
print(drop_duplicates(df2, subset=['id'], keep='last'))

print("\\n" + "=" * 60)
print("6. 异常值检测：Z-score")
print("=" * 60)
df3 = DataFrame({
    'id': list(range(1, 11)),
    'salary': [8000, 8500, 8200, 9000, 8800, 8700, 8600, 8400, 50000, 8300],
})
print(df3)
z = zscore(df3['salary'])
print("\\nZ-score:")
for v, zv in zip(df3['salary'], z):
    print(f"  salary={v:>6}  z={zv:>7.2f}  {'<-- 异常' if abs(zv) > 3 else ''}")

outliers_z = detect_outliers_zscore(df3['salary'], threshold=3)
print("\\n异常行（|z|>3）:")
print(df3[outliers_z])

print("\\n" + "=" * 60)
print("7. 异常值检测：IQR 法")
print("=" * 60)
mask_iqr, lower, upper = detect_outliers_iqr(df3['salary'], k=1.5)
q1 = quantile(df3['salary'], 0.25)
q3 = quantile(df3['salary'], 0.75)
print(f"Q1={q1}, Q3={q3}, IQR={q3-q1}")
print(f"下界={lower}, 上界={upper}")
print("\\n异常行:")
print(df3[mask_iqr])

print("\\n--- clip 截断到边界 ---")
df3['salary_clipped'] = clip(df3['salary'], lower, upper)
print(df3[['id', 'salary', 'salary_clipped']])

print("\\n" + "=" * 60)
print("8. 类型转换")
print("=" * 60)
df4 = DataFrame({
    'id': ['1', '2', '3', '4'],
    'price': ['12.5', 'abc', '99.9', '15.0'],
    'date': ['2024-01-01', '2024-01-02', 'invalid', '2024-01-04'],
})
print("原始（都是字符串）:")
print(df4)

print("\\n--- to_numeric(errors='coerce') ---")
df4['price_num'] = to_numeric(df4['price'], errors='coerce')
print(df4[['id', 'price', 'price_num']])

print("\\n--- to_numeric(errors='raise') 抛异常 ---")
try:
    to_numeric(df4['price'], errors='raise')
except ValueError as e:
    print(f"  ValueError: {e}")

print("\\n" + "=" * 60)
print("9. 字符串处理（模拟 .str）")
print("=" * 60)
df5 = DataFrame({
    'name': ['  Zhang San ', 'Li Si', '  Wang Wu  ', None],
    'email': ['Zhang@ABC.com', 'LI@xyz.COM', 'wang@Def.com', None],
})
print("原始:")
print(df5)

df5['name'] = str_strip(df5['name'])
print("\\n--- str.strip() ---")
print(df5[['name']])

df5['email_lower'] = str_lower(df5['email'])
print("\\n--- str.lower() ---")
print(df5[['email', 'email_lower']])

df5['domain'] = [parts[1] if parts else None
                  for parts in str_split(df5['email_lower'], '@')]
print("\\n--- 提取域名 ---")
print(df5[['email_lower', 'domain']])

df5['has_at'] = str_contains(df5['email'], '@')
print("\\n--- contains('@') ---")
print(df5[['email', 'has_at']])

print("\\n" + "=" * 60)
print("10. apply / map 映射")
print("=" * 60)
df6 = DataFrame({
    'gender': ['M', 'F', 'M', 'F', 'M'],
    'age': [15, 25, 35, 45, 55],
    'score': [85, 92, 78, 105, -5],  # 含越界值
})
print(df6)

# map: 性别编码
df6['gender_cn'] = series_map(df6['gender'], {'M': '男', 'F': '女'})
print("\\n--- map 性别编码 ---")
print(df6[['gender', 'gender_cn']])

# apply: 年龄分段
def age_group(age):
    if age < 18: return '未成年'
    if age < 35: return '青年'
    if age < 50: return '中年'
    return '老年'
df6['age_group'] = series_apply(df6['age'], age_group)
print("\\n--- apply 年龄分段 ---")
print(df6[['age', 'age_group']])

# apply: score 截断到 [0, 100]
df6['score_norm'] = series_apply(df6['score'], lambda x: max(0, min(100, x)))
print("\\n--- apply score 截断 ---")
print(df6[['score', 'score_norm']])

print("\\n" + "=" * 60)
print("11. 完整清洗 Pipeline")
print("=" * 60)
dirty = DataFrame({
    ' ID ': ['1', '2', '2', '3', '4'],
    'Name': [' zhang ', 'LI', 'LI', 'WANG', None],
    'Age': ['25', 'thirty', '30', '45', '35'],
    'Salary': ['5000', '8000', '8000', '999999', '6000'],
})
print("原始脏数据:")
print(dirty)

# Step 1: 列名规范化
dirty.columns = [c.strip().lower() for c in dirty.columns]
print("\\nStep 1 列名规范化:", dirty.columns)

# Step 2: 字符串清洗
dirty['name'] = str_strip(dirty['name'])
dirty['name'] = str_lower(dirty['name'])
dirty['name'] = str_replace(dirty['name'], ' ', '_')
print("\\nStep 2 字符串清洗后:")
print(dirty)

# Step 3: 类型转换（错误变 None）
dirty['age'] = to_numeric(dirty['age'], errors='coerce')
dirty['salary'] = to_numeric(dirty['salary'], errors='coerce')
print("\\nStep 3 类型转换后:")
print(dirty)

# Step 4: 去重
dirty = drop_duplicates(dirty)
print("\\nStep 4 去重后:")
print(dirty)

# Step 5: 缺失值处理
dirty['name'] = fillna(DataFrame({'name': dirty['name']}), 'unknown')['name']
dirty['age'] = fillna(DataFrame({'age': dirty['age']}), statistics.median([v for v in dirty['age'] if v]))['age']
print("\\nStep 5 填充缺失后:")
print(dirty)

# Step 6: 异常值处理（IQR）
mask, lo, hi = detect_outliers_iqr(dirty['salary'], k=1.5)
print(f"\\nStep 6 IQR 异常检测: Q1-1.5*IQR={lo}, Q3+1.5*IQR={hi}")
print("异常行:")
print(dirty[mask])
dirty['salary'] = clip(dirty['salary'], lo, hi)
print("\\n截断后:")
print(dirty)

print("\\n" + "=" * 60)
print("✅ 第 3 章演示完毕：缺失值、重复值、异常值、类型转换、字符串、apply")
print("=" * 60)
`,
  },

  // ============================================================
  // 第 4 章：数据分组与聚合
  // ============================================================
  {
    id: "aipy-pandas-group",
    icon: "🔢",
    group: "Pandas数据处理",
    title: "数据分组与聚合",
    content: `## 数据分组与聚合

**"分而治之"**（Divide and Conquer）是数据分析最核心的思维方式之一。当你面对一张百万行的销售明细表，第一反应往往是："按城市看一下销售额"、"按月看一下趋势"、"按品类看一下占比"——这些都是**分组聚合**操作。

Pandas 的 \`groupby\` 是实现这一思想的利器，灵感来自 SQL 的 \`GROUP BY\`，但更灵活、更强大。本章系统讲解 groupby 的原理、聚合函数、数据透视表（pivot_table）和交叉表（crosstab）。

### 4.1 Split-Apply-Combine 范式

Hadley Wickham 在 2011 年的经典论文《The Split-Apply-Combine Strategy for Data Analysis》中提出了这一范式，它描述了所有分组操作的三个阶段：

\`\`\`
原始数据         分组             应用函数          合并结果
┌─────┐         ┌─────┐          ┌─────┐          ┌─────┐
│A 1  │         │A 1  │          │A 1  │          │A 3  │
│B 2  │  split  │A 2  │  apply   │A 2  │ combine │B 7  │
│A 2  │ ──────> │B 2  │ ──────>  │B 2  │ ──────> │C 5  │
│B 5  │         │B 5  │          │B 5  │          └─────┘
│C 5  │         │C 5  │          │C 5  │
└─────┘         └─────┘          └─────┘
\`\`\`

1. **Split**：按某个键把数据分成若干组
2. **Apply**：对每组独立应用一个函数（聚合、变换、过滤）
3. **Combine**：把结果合并成新的数据结构

Pandas 的 \`df.groupby('key')\` 只完成 Split 阶段，返回一个 GroupBy 对象——它"懒执行"，必须接聚合操作才会真正计算。

### 4.2 groupby 基础

#### 4.2.1 创建 GroupBy 对象

\`\`\`python
df = pd.DataFrame({
    'city': ['北京','上海','北京','上海','广州'],
    'product': ['A','A','B','B','A'],
    'amount': [100, 200, 150, 300, 80],
})

grouped = df.groupby('city')           # 按单列分组
grouped = df.groupby(['city','product'])  # 按多列分组（层次索引）
grouped = df.groupby('city', as_index=False)  # 不把分组键变成 index
grouped = df.groupby('city', sort=False)  # 不排序（更快）
\`\`\`

#### 4.2.2 GroupBy 对象的属性与方法

\`\`\`python
grouped.groups        # {组键: [行索引列表]}
grouped.size()        # 每组大小
grouped.ngroups       # 组数
grouped.first()       # 每组第一条
grouped.last()        # 每组最后一条
grouped.nth(0)        # 每组第 N 条
grouped.get_group('北京')  # 取出指定组
\`\`\`

#### 4.2.3 遍历分组

\`\`\`python
for name, group in df.groupby('city'):
    print(f"城市: {name}, 行数: {len(group)}")
    print(group)
\`\`\`

这是 debug 时最常用的技巧——亲眼看看每组的数据。

### 4.3 聚合（Aggregation）

聚合把每组的多行变成单个值。

#### 4.3.1 单列单函数

\`\`\`python
df.groupby('city')['amount'].sum()       # 每城市销售额总和
df.groupby('city')['amount'].mean()      # 平均
df.groupby('city')['amount'].count()     # 计数（不含 NaN）
df.groupby('city')['amount'].size()      # 计数（含 NaN）
df.groupby('city')['amount'].median()    # 中位数
df.groupby('city')['amount'].std()       # 标准差
df.groupby('city')['amount'].var()       # 方差
df.groupby('city')['amount'].min()       # 最小
df.groupby('city')['amount'].max()       # 最大
df.groupby('city')['amount'].nunique()   # 去重后数量
df.groupby('city')['amount'].first()     # 第一个
\`\`\`

#### 4.3.2 多列多函数：agg

\`\`\`python
# 同一列应用多个函数
df.groupby('city')['amount'].agg(['sum','mean','count'])

# 不同列应用不同函数
df.groupby('city').agg({
    'amount': ['sum','mean'],
    'product': 'nunique',
    'quantity': 'max',
})

# 命名聚合（Pandas 0.25+，推荐）
df.groupby('city').agg(
    total_amount=('amount', 'sum'),
    avg_amount=('amount', 'mean'),
    order_count=('amount', 'count'),
    product_kinds=('product', 'nunique'),
)
\`\`\`

#### 4.3.3 自定义聚合函数

\`\`\`python
# 任意函数：接收一组 Series，返回标量
df.groupby('city')['amount'].agg(lambda s: s.max() - s.min())  # 极差

# 命名自定义函数
def amplitude(s):
    return s.max() - s.min()
df.groupby('city')['amount'].agg(amplitude)

# 多个自定义函数
df.groupby('city')['amount'].agg(['mean', amplitude, ('cv', lambda s: s.std()/s.mean())])
\`\`\`

### 4.4 变换（Transform）

变换返回与原数据**等长**的结果，常用于"组内归一化"、"组内填充"等：

\`\`\`python
# 每个城市的销售额减去该城市均值（去中心化）
df['amount_centered'] = df.groupby('city')['amount'].transform(lambda s: s - s.mean())

# 组内归一化到 [0, 1]
df['amount_norm'] = df.groupby('city')['amount'].transform(
    lambda s: (s - s.min()) / (s.max() - s.min())
)

# 组内填充缺失值
df['age'] = df.groupby('city')['age'].transform(lambda s: s.fillna(s.mean()))

# 组内排名
df['rank_in_city'] = df.groupby('city')['amount'].rank(ascending=False)
\`\`\`

**关键区别**：

- \`agg\`：每组返回**一个标量**，结果行数 = 组数
- \`transform\`：每组返回**等长 Series**，结果行数 = 原数据行数

### 4.5 过滤（Filter）

过滤**保留或丢弃整组**：

\`\`\`python
# 只保留总销售额 > 500 的城市
big_cities = df.groupby('city').filter(lambda g: g['amount'].sum() > 500)

# 只保留订单数 >= 3 的产品
hot = df.groupby('product').filter(lambda g: len(g) >= 3)
\`\`\`

### 4.6 apply：万能但慢

\`apply\` 可以做任何事，但慢：

\`\`\`python
# 每个城市内，按金额降序取前 2 单
df.groupby('city').apply(lambda g: g.nlargest(2, 'amount'))

# 每组内做复杂处理，返回 DataFrame
def process(g):
    g = g.copy()
    g['pct'] = g['amount'] / g['amount'].sum()
    return g
df.groupby('city').apply(process)
\`\`\`

**性能建议**：能用 \`agg\` / \`transform\` / \`filter\` 就别用 \`apply\`，速度差 10 倍以上。

### 4.7 数据透视表（pivot_table）

\`pivot_table\` 是 Excel 透视表的 Pandas 版本，本质是"二维 groupby"：

\`\`\`python
pd.pivot_table(df,
               values='amount',     # 聚合的值
               index='city',        # 行
               columns='product',   # 列
               aggfunc='sum',       # 聚合函数
               fill_value=0,        # 缺失填充
               margins=True,        # 行列汇总
               margins_name='总计')
\`\`\`

结果示例：

\`\`\`
product   A    B    总计
city
北京     100  150   250
上海     200  300   500
广州      80    0    80
总计     380  450   830
\`\`\`

#### 4.7.1 pivot vs pivot_table

- \`df.pivot(index, columns, values)\`：**只是重塑**，不聚合。要求行列组合唯一，否则报错
- \`pd.pivot_table(...)\`：会**聚合**，重复的行列组合会合并

\`\`\`python
# pivot：重塑（不聚合）
df.pivot(index='date', columns='product', values='amount')

# pivot_table：聚合（重复键会合并）
pd.pivot_table(df, index='date', columns='product', values='amount', aggfunc='sum')
\`\`\`

#### 4.7.2 多级索引透视表

\`\`\`python
pd.pivot_table(df,
               values='amount',
               index=['city','region'],   # 多级行
               columns=['product','year'],# 多级列
               aggfunc=['sum','mean'],
               fill_value=0)
\`\`\`

### 4.8 交叉表（crosstab）

交叉表是"计数版透视表"，专门用于统计两个分类变量的频数：

\`\`\`python
pd.crosstab(df['city'], df['product'])

# 带归一化
pd.crosstab(df['city'], df['product'], normalize='index')   # 行内归一化
pd.crosstab(df['city'], df['product'], normalize='columns') # 列内归一化
pd.crosstab(df['city'], df['product'], normalize='all')     # 全局归一化

# 带汇总
pd.crosstab(df['city'], df['product'], margins=True)

# 加权频数
pd.crosstab(df['city'], df['product'], values=df['amount'], aggfunc='sum')
\`\`\`

**用途**：用户分群、A/B 测试、卡方检验的数据准备。

### 4.9 分组键的进阶用法

#### 4.9.1 用函数分组

\`\`\`python
df = pd.DataFrame({'value': [10,20,30,40]}, index=['a','b','c','d'])
df.groupby(lambda i: 'vowel' if i in 'aeiou' else 'consonant').sum()
\`\`\`

#### 4.9.2 用 Series 分组

\`\`\`python
groups = pd.Series(['A','A','B','B'], index=df.index)
df.groupby(groups).sum()
\`\`\`

#### 4.9.3 用日期属性分组

\`\`\`python
df.groupby(df['date'].dt.year)['amount'].sum()       # 按年
df.groupby(df['date'].dt.month)['amount'].sum()      # 按月
df.groupby(df['date'].dt.dayofweek)['amount'].sum()  # 按星期
\`\`\`

#### 4.9.4 用 bins 分箱分组

\`\`\`python
df.groupby(pd.cut(df['age'], bins=[0,18,35,60,100]))['amount'].mean()
df.groupby(pd.qcut(df['age'], q=4))['amount'].mean()  # 等频分箱
\`\`\`

### 4.10 性能优化

#### 4.10.1 用 category 加速分组

\`\`\`python
df['city'] = df['city'].astype('category')
df.groupby('city')['amount'].sum()  # 比字符串快几倍
\`\`\`

#### 4.10.2 避免多层 groupby

\`\`\`python
# 慢：先按城市分组，再按产品分组
for city, g1 in df.groupby('city'):
    for prod, g2 in g1.groupby('product'):
        ...

# 快：一次按多列分组
for (city, prod), g in df.groupby(['city','product']):
    ...
\`\`\`

#### 4.10.3 用 engine='numba'

Pandas 1.0+ 支持 numba 加速部分聚合：

\`\`\`python
df.groupby('city')['amount'].agg('sum', engine='numba')
\`\`\`

### 4.11 常见陷阱

#### 4.11.1 as_index 的坑

默认 \`groupby\` 把分组键变成 index，导致后续不能直接用列名访问：

\`\`\`python
result = df.groupby('city')['amount'].sum()
result['city']  # KeyError！

# 解决：加 as_index=False
result = df.groupby('city', as_index=False)['amount'].sum()
result['city']  # OK
\`\`\`

#### 4.11.2 dropna 行为

Pandas 1.1+ 默认会**跳过**分组键为 NaN 的行：

\`\`\`python
df.groupby('city', dropna=False)  # 保留 NaN 组
\`\`\`

#### 4.11.3 observed 参数

对 category 类型分组时，默认会显示所有可能的组合（即使为空）：

\`\`\`python
df.groupby('city', observed=True)  # 只显示实际存在的组
\`\`\`

### 4.12 实战：销售分析

\`\`\`python
# 1. 按城市、产品看月度销售
monthly = pd.pivot_table(df,
                         values='amount',
                         index=['city','product'],
                         columns=df['date'].dt.to_period('M'),
                         aggfunc='sum',
                         fill_value=0)

# 2. 各城市销售额 Top 3 产品
top3 = df.groupby(['city','product'])['amount'].sum() \\
        .groupby('city', group_keys=False).nlargest(3)

# 3. 客户 RFM 分析
rfm = df.groupby('user_id').agg({
    'date': lambda s: (today - s.max()).days,  # Recency
    'order_id': 'count',                        # Frequency
    'amount': 'sum',                            # Monetary
})
\`\`\`

### 4.13 本章小结

- **groupby 遵循 Split-Apply-Combine 范式**，懒执行
- **agg** 返回标量（短结果），**transform** 返回等长 Series（同长），**filter** 保留整组
- **pivot_table** 是二维 groupby，适合交叉分析
- **crosstab** 专做分类变量频数统计
- 性能：用 category、避免多层 groupby、能用内置函数就别用 apply
- 陷阱：\`as_index\`、\`dropna\`、\`observed\` 三个参数最易踩坑

分组聚合是数据分析的"骨架"，掌握它你就能从任何明细数据中提炼出洞察。下一章我们将学习时间序列处理——按时间维度分析数据的核心工具。`,
    code: `# ============================================================
# 第 4 章代码演示：用纯 Python 模拟 groupby / 聚合 / 透视表
# ============================================================
# 演示内容：
#   - Split-Apply-Combine 三阶段
#   - agg 单/多函数、命名聚合
#   - transform 组内变换
#   - filter 组过滤
#   - pivot_table 二维透视
#   - crosstab 交叉表
#   - 分箱分组（cut）

from collections import OrderedDict, defaultdict
import math

# ---- 工具 ----
def _is_nan(v):
    return v is None or (isinstance(v, float) and v != v)


# ============================================================
# 迷你 DataFrame（精简版）
# ============================================================
class DataFrame:
    def __init__(self, data, index=None, columns=None):
        if isinstance(data, dict):
            self.columns = list(data.keys())
            length = len(next(iter(data.values()))) if data else 0
            self.index = list(index) if index else list(range(length))
            self._data = {c: list(v) for c, v in data.items()}
        elif isinstance(data, list) and data and isinstance(data[0], dict):
            cols = list(dict.fromkeys(k for r in data for k in r))
            self.columns = cols
            self.index = list(range(len(data)))
            self._data = {c: [r.get(c) for r in data] for c in cols}
        else:
            raise TypeError
        assert all(len(v) == len(self.index) for v in self._data.values())

    def __getitem__(self, key):
        if isinstance(key, str):
            return self._data[key]
        if isinstance(key, list) and all(isinstance(k, str) for k in key):
            return DataFrame({c: self._data[c] for c in key}, self.index)
        if isinstance(key, list) and all(isinstance(k, bool) for k in key):
            new_data = {c: [v for v, m in zip(self._data[c], key) if m] for c in self.columns}
            new_idx = [i for i, m in zip(self.index, key) if m]
            return DataFrame(new_data, new_idx)
        raise KeyError

    def __setitem__(self, key, value):
        if isinstance(value, list):
            assert len(value) == len(self.index)
            self._data[key] = value
            if key not in self.columns:
                self.columns.append(key)

    def copy(self):
        return DataFrame({c: list(self._data[c]) for c in self.columns}, list(self.index))

    def __repr__(self):
        lines = ["| " + " | ".join(["idx"] + self.columns) + " |"]
        lines.append("|" + "|".join(["---"] * (len(self.columns)+1)) + "|")
        for r in range(len(self.index)):
            row = [str(self.index[r])] + [str(self._data[c][r]) for c in self.columns]
            lines.append("| " + " | ".join(row) + " |")
        return "\\n".join(lines)


# ============================================================
# GroupBy 实现：Split 阶段
# ============================================================
class GroupBy:
    def __init__(self, df, by, as_index=True):
        self.df = df
        self.by = by if isinstance(by, list) else [by]
        self.as_index = as_index
        # 分组：{组键: [行号]}
        self.groups = OrderedDict()
        for r in range(len(df.index)):
            key = tuple(df._data[b][r] for b in self.by)
            if len(self.by) == 1:
                key = key[0]
            self.groups.setdefault(key, []).append(r)

    @property
    def ngroups(self):
        return len(self.groups)

    def size(self):
        return {k: len(rows) for k, rows in self.groups.items()}

    def get_group(self, key):
        rows = self.groups[key]
        return DataFrame({c: [self.df._data[c][r] for r in rows]
                          for c in self.df.columns})

    def __iter__(self):
        for k, rows in self.groups.items():
            yield k, DataFrame({c: [self.df._data[c][r] for r in rows]
                                for c in self.df.columns})

    # ---- agg 聚合 ----
    def agg(self, func, col=None):
        """对每组的某列应用聚合函数"""
        # 支持多列多函数的字典：{'col': ['sum','mean']}
        if isinstance(func, dict):
            return self._agg_dict(func)

        # 单列单函数或多函数
        if col is not None:
            return self._agg_col(col, func)
        # 对所有数值列
        result = OrderedDict()
        for k, rows in self.groups.items():
            row_result = {}
            for c in self.df.columns:
                vals = [self.df._data[c][r] for r in rows]
                if all(isinstance(v, (int, float)) and not _is_nan(v) for v in vals) and vals:
                    row_result[c] = self._apply_func(func, vals)
            result[k] = row_result
        return self._to_result_df(result)

    def _agg_col(self, col, func):
        """对单列应用一个或多个函数"""
        funcs = func if isinstance(func, list) else [func]
        func_names = [f.__name__ if callable(f) and hasattr(f, '__name__') else str(f) for f in funcs]
        result = OrderedDict()
        for k, rows in self.groups.items():
            vals = [self.df._data[col][r] for r in rows]
            if len(funcs) == 1:
                result[k] = self._apply_func(funcs[0], vals)
            else:
                result[k] = {fn: self._apply_func(f, vals) for fn, f in zip(func_names, funcs)}
        return self._to_result_df(result, value_col=col, func_names=func_names if len(funcs) > 1 else None)

    def _agg_dict(self, func_dict):
        """不同列应用不同函数"""
        result_rows = []
        keys = []
        for k, rows in self.groups.items():
            keys.append(k)
            row = {}
            for col, fns in func_dict.items():
                vals = [self.df._data[col][r] for r in rows]
                fns_list = fns if isinstance(fns, list) else [fns]
                for fn in fns_list:
                    name = fn.__name__ if callable(fn) and hasattr(fn, '__name__') else str(fn)
                    col_name = f"{col}_{name}" if isinstance(fns, list) else col
                    row[col_name] = self._apply_func(fn, vals)
            result_rows.append(row)
        return DataFrame(result_rows) if not self.as_index else \
               self._to_result_df_from_rows(keys, result_rows)

    def _to_result_df_from_rows(self, keys, rows):
        # 构造带分组键列的 DataFrame
        cols = list(dict.fromkeys(k for r in rows for k in r))
        data = {}
        for i, b in enumerate(self.by):
            data[b] = [k[i] if isinstance(k, tuple) else k for k in keys]
        for c in cols:
            data[c] = [r.get(c) for r in rows]
        return DataFrame(data)

    def _to_result_df(self, result, value_col=None, func_names=None):
        if not result:
            return DataFrame({})
        if self.as_index:
            # 分组键作为 index
            keys = list(result.keys())
            if isinstance(list(result.values())[0], dict):
                # 多函数结果
                cols = list(list(result.values())[0].keys())
                data = {c: [result[k][c] for k in keys] for c in cols}
                idx = keys
                return DataFrame(data, index=idx)
            else:
                col_name = value_col or 'value'
                return DataFrame({col_name: list(result.values())}, index=keys)
        else:
            # 分组键作为普通列
            keys = list(result.keys())
            if isinstance(list(result.values())[0], dict):
                cols = list(list(result.values())[0].keys())
                data = {b: [k[i] if isinstance(k, tuple) else k for k in keys]
                        for i, b in enumerate(self.by)}
                for c in cols:
                    data[c] = [result[k][c] for k in keys]
                return DataFrame(data)
            else:
                col_name = value_col or 'value'
                data = {b: [k[i] if isinstance(k, tuple) else k for k in keys]
                        for i, b in enumerate(self.by)}
                data[col_name] = list(result.values())
                return DataFrame(data)

    def _apply_func(self, func, vals):
        if callable(func):
            return func(vals)
        # 字符串函数名
        valid = [v for v in vals if not _is_nan(v)]
        if func == 'sum':
            return sum(valid) if valid else 0
        if func == 'mean':
            return sum(valid) / len(valid) if valid else None
        if func == 'count':
            return len(valid)
        if func == 'size':
            return len(vals)
        if func == 'min':
            return min(valid) if valid else None
        if func == 'max':
            return max(valid) if valid else None
        if func == 'median':
            if not valid: return None
            sv = sorted(valid)
            n = len(sv)
            return sv[n//2] if n % 2 else (sv[n//2-1] + sv[n//2]) / 2
        if func == 'std':
            if len(valid) < 2: return None
            m = sum(valid) / len(valid)
            return (sum((x - m) ** 2 for x in valid) / len(valid)) ** 0.5
        if func == 'var':
            if len(valid) < 2: return None
            m = sum(valid) / len(valid)
            return sum((x - m) ** 2 for x in valid) / len(valid)
        if func == 'nunique':
            return len(set(valid))
        if func == 'first':
            return vals[0] if vals else None
        if func == 'last':
            return vals[-1] if vals else None
        raise ValueError(f"未知聚合函数: {func}")

    # ---- transform 变换 ----
    def transform(self, func, col):
        """对每组应用函数，返回等长 Series"""
        result = [None] * len(self.df.index)
        for k, rows in self.groups.items():
            vals = [self.df._data[col][r] for r in rows]
            transformed = func(vals)
            if not isinstance(transformed, list):
                # 标量广播
                transformed = [transformed] * len(rows)
            for r, v in zip(rows, transformed):
                result[r] = v
        return result

    # ---- filter 过滤 ----
    def filter(self, func):
        """保留满足条件的整组"""
        keep = []
        for k, rows in self.groups.items():
            sub = DataFrame({c: [self.df._data[c][r] for r in rows]
                             for c in self.df.columns}, rows)
            if func(sub):
                keep.extend(rows)
        new_data = {c: [self.df._data[c][r] for r in keep] for c in self.df.columns}
        new_idx = [self.df.index[r] for r in keep]
        return DataFrame(new_data, new_idx)


def groupby(df, by, as_index=True):
    return GroupBy(df, by, as_index=as_index)


# ============================================================
# 聚合辅助函数
# ============================================================
def amplitude(vals):
    """极差"""
    valid = [v for v in vals if not _is_nan(v)]
    return max(valid) - min(valid) if valid else None

def cv(vals):
    """变异系数"""
    valid = [v for v in vals if not _is_nan(v)]
    if len(valid) < 2:
        return None
    m = sum(valid) / len(valid)
    if m == 0:
        return None
    std = (sum((x - m) ** 2 for x in valid) / len(valid)) ** 0.5
    return std / m


# ============================================================
# pivot_table 实现
# ============================================================
def pivot_table(df, values, index, columns, aggfunc='sum', fill_value=None):
    """迷你版 pd.pivot_table"""
    # 取出 index / columns / values 列
    idx_vals = df[index] if isinstance(index, str) else list(zip(*[df[i] for i in index]))
    col_vals = df[columns] if isinstance(columns, str) else list(zip(*[df[c] for c in columns]))
    val_vals = df[values]

    # 收集所有 index 和 columns 的唯一值（保序）
    idx_uniq = list(dict.fromkeys(idx_vals))
    col_uniq = list(dict.fromkeys(col_vals))

    # 按 (index, column) 分组
    buckets = defaultdict(list)
    for iv, cv, v in zip(idx_vals, col_vals, val_vals):
        if not _is_nan(v):
            buckets[(iv, cv)].append(v)

    # 聚合
    result = []
    for iv in idx_uniq:
        row = {index if isinstance(index, str) else 'idx': iv}
        for cv in col_uniq:
            vals = buckets.get((iv, cv), [])
            if not vals:
                row[str(cv)] = fill_value
            else:
                row[str(cv)] = GroupBy._apply_func(None, aggfunc, vals)
        result.append(row)

    # 转为 DataFrame
    col_names = [index if isinstance(index, str) else 'idx'] + [str(c) for c in col_uniq]
    data = {c: [] for c in col_names}
    for row in result:
        for c in col_names:
            data[c].append(row.get(c))
    return DataFrame(data)


# ============================================================
# crosstab 实现
# ============================================================
def crosstab(df_row, df_col, normalize=None, margins=False, margins_name='All'):
    """迷你版 pd.crosstab"""
    rows_uniq = list(dict.fromkeys(df_row))
    cols_uniq = list(dict.fromkeys(df_col))

    # 统计频数
    counts = defaultdict(lambda: defaultdict(int))
    for r, c in zip(df_row, df_col):
        counts[r][c] += 1

    total = len(df_row)
    # 构造数据
    data = {'row': rows_uniq}
    for c in cols_uniq:
        col_counts = [counts[r][c] for r in rows_uniq]
        if normalize == 'index':
            row_sums = [sum(counts[r].values()) for r in rows_uniq]
            col_counts = [cc / rs if rs else 0 for cc, rs in zip(col_counts, row_sums)]
        elif normalize == 'columns':
            col_sum = sum(counts[r][c] for r in rows_uniq)
            col_counts = [cc / col_sum if col_sum else 0 for cc in col_counts]
        elif normalize == 'all':
            col_counts = [cc / total if total else 0 for cc in col_counts]
        data[str(c)] = col_counts

    if margins:
        # 添加行汇总
        all_row = ['All']
        for c in cols_uniq:
            s = sum(counts[r][c] for r in rows_uniq)
            if normalize == 'all':
                all_row.append(s / total if total else 0)
            else:
                all_row.append(s)
        # 添加列汇总
        data['All'] = [sum(counts[r][c] for c in cols_uniq) for r in rows_uniq] + [total]
        data['row'] = rows_uniq + ['All']
        for i, c in enumerate(cols_uniq):
            data[str(c)] = data[str(c)] + [all_row[i+1]]

    return DataFrame(data)


# ============================================================
# 分箱工具
# ============================================================
def cut(values, bins):
    """等宽分箱"""
    result = []
    for v in values:
        if _is_nan(v):
            result.append(None)
            continue
        label = None
        for i in range(len(bins) - 1):
            if bins[i] <= v < bins[i+1]:
                label = f"({bins[i]}, {bins[i+1]}]"
                break
        if label is None and v >= bins[-1]:
            label = f"({bins[-2]}, {bins[-1]}]"
        result.append(label)
    return result


# ============================================================
# 演示
# ============================================================
print("=" * 60)
print("1. 基础 groupby + 单函数聚合")
print("=" * 60)
df = DataFrame({
    'city': ['北京','上海','北京','上海','广州','北京','广州','上海'],
    'product': ['A','A','B','B','A','B','B','A'],
    'amount': [100, 200, 150, 300, 80, 120, 90, 180],
    'qty': [1, 2, 1, 3, 1, 2, 1, 2],
})
print(df)
print("\\nshape:", df.shape)

# 单列单函数
g = groupby(df, 'city')
print("\\n--- groupby('city') 各组大小 ---")
for k, v in g.size().items():
    print(f"  {k}: {v} 行")

print("\\n--- 各城市 amount 总和 ---")
result = g.agg('sum', 'amount')
print(result)

print("\\n--- 各城市 amount 平均 ---")
print(g.agg('mean', 'amount'))

print("\\n--- 各城市 amount 最大/最小 ---")
print("max:", g.agg('max', 'amount'))
print("min:", g.agg('min', 'amount'))

print("\\n--- 各城市 product 去重数 ---")
print(g.agg('nunique', 'product'))

print("\\n" + "=" * 60)
print("2. 遍历分组 + get_group")
print("=" * 60)
for name, group in groupby(df, 'city'):
    print(f"\\n城市: {name}, 行数: {len(group.index)}")
    print(group)

print("\\n--- get_group('北京') ---")
print(groupby(df, 'city').get_group('北京'))

print("\\n" + "=" * 60)
print("3. 多函数聚合 agg")
print("=" * 60)
print("--- 同列多函数: ['sum','mean','max'] ---")
print(groupby(df, 'city').agg(['sum', 'mean', 'max'], 'amount'))

print("\\n--- 不同列不同函数: {'amount':['sum','mean'], 'product':'nunique'} ---")
print(groupby(df, 'city').agg({'amount': ['sum', 'mean'], 'product': 'nunique', 'qty': 'sum'}))

print("\\n--- 自定义聚合函数: 极差 amplitude ---")
print(groupby(df, 'city').agg(amplitude, 'amount'))

print("\\n--- 混合: ['mean', amplitude] ---")
print(groupby(df, 'city').agg(['mean', amplitude, ('cv', cv)], 'amount'))

print("\\n" + "=" * 60)
print("4. transform 组内变换")
print("=" * 60)
# 组内去中心化
df['amount_centered'] = groupby(df, 'city').transform(
    lambda vals: [v - sum(vals) / len(vals) for v in vals], 'amount')
print("--- 每个城市的 amount 减去该城市均值 ---")
print(df[['city', 'amount', 'amount_centered']])

# 组内归一化
df['amount_norm'] = groupby(df, 'city').transform(
    lambda vals: [(v - min(vals)) / (max(vals) - min(vals)) if max(vals) != min(vals) else 0.0
                  for v in vals], 'amount')
print("\\n--- 组内归一化到 [0, 1] ---")
print(df[['city', 'amount', 'amount_norm']])

# 组内排名
df['rank_in_city'] = groupby(df, 'city').transform(
    lambda vals: [sorted(vals, reverse=True).index(v) + 1 for v in vals], 'amount')
print("\\n--- 组内排名（按 amount 降序）---")
print(df[['city', 'amount', 'rank_in_city']])

print("\\n" + "=" * 60)
print("5. filter 组过滤")
print("=" * 60)
# 只保留总销售额 > 300 的城市
big = groupby(df, 'city').filter(lambda g: sum(g['amount']) > 300)
print("--- 总销售额 > 300 的城市 ---")
print(big)

# 只保留订单数 >= 3 的城市
hot = groupby(df, 'city').filter(lambda g: len(g.index) >= 3)
print("\\n--- 订单数 >= 3 的城市 ---")
print(hot)

print("\\n" + "=" * 60)
print("6. 多列分组")
print("=" * 60)
g2 = groupby(df, ['city', 'product'])
print("--- groupby(['city','product']) amount 总和 ---")
print(g2.agg('sum', 'amount'))
print("\\n--- 各组大小 ---")
for k, v in g2.size().items():
    print(f"  {k}: {v}")

print("\\n" + "=" * 60)
print("7. as_index=False：分组键作为普通列")
print("=" * 60)
g3 = groupby(df, 'city', as_index=False)
result = g3.agg('sum', 'amount')
print(result)
print("（city 作为列而非 index，后续可直接 df['city']）")

print("\\n" + "=" * 60)
print("8. pivot_table 二维透视表")
print("=" * 60)
pivot = pivot_table(df, values='amount', index='city', columns='product',
                    aggfunc='sum', fill_value=0)
print("--- 各城市 × 各产品 的销售额总和 ---")
print(pivot)

print("\\n--- 用 mean 聚合 ---")
print(pivot_table(df, values='amount', index='city', columns='product',
                 aggfunc='mean', fill_value=0))

print("\\n--- 用 qty 做 pivot（看数量）---")
print(pivot_table(df, values='qty', index='city', columns='product',
                 aggfunc='sum', fill_value=0))

print("\\n" + "=" * 60)
print("9. crosstab 交叉表（频数统计）")
print("=" * 60)
print("--- 各城市 × 各产品 的订单数 ---")
print(crosstab(df['city'], df['product']))

print("\\n--- 带汇总 margins=True ---")
print(crosstab(df['city'], df['product'], margins=True))

print("\\n--- 行内归一化 normalize='index' ---")
print(crosstab(df['city'], df['product'], normalize='index'))

print("\\n--- 全局归一化 normalize='all' ---")
print(crosstab(df['city'], df['product'], normalize='all'))

print("\\n" + "=" * 60)
print("10. 分箱分组 cut")
print("=" * 60)
ages_df = DataFrame({
    'name': ['a','b','c','d','e','f','g','h'],
    'age': [15, 22, 28, 35, 42, 55, 67, 80],
    'income': [3000, 5000, 8000, 12000, 15000, 20000, 18000, 12000],
})
print(ages_df)

# 等宽分箱
bins = [0, 18, 35, 60, 100]
ages_df['age_group'] = cut(ages_df['age'], bins)
print("\\n--- 分箱后 ---")
print(ages_df[['name', 'age', 'age_group']])

print("\\n--- 按 age_group 分组看平均收入 ---")
print(groupby(ages_df, 'age_group').agg('mean', 'income'))

print("\\n" + "=" * 60)
print("11. 实战：RFM 简化分析")
print("=" * 60)
orders = DataFrame({
    'user_id': [1, 1, 2, 2, 2, 3, 3, 4],
    'order_id': ['o1','o2','o3','o4','o5','o6','o7','o8'],
    'amount': [100, 200, 150, 300, 80, 500, 120, 90],
    'days_ago': [5, 30, 2, 15, 60, 8, 45, 90],  # 距今天数
})

# Frequency: 每个用户的订单数
# Monetary: 每个用户消费总额
# Recency: 每个用户最近一次购买的 days_ago 最小值
rfm = groupby(orders, 'user_id').agg({
    'order_id': 'count',
    'amount': 'sum',
    'days_ago': 'min',
})
print("--- RFM 分析结果 ---")
print(rfm)
print("\\n说明：order_id=频次(F), amount=消费金额(M), days_ago=最近购买(R, 越小越好)")

print("\\n" + "=" * 60)
print("✅ 第 4 章演示完毕：groupby / agg / transform / filter / pivot_table / crosstab")
print("=" * 60)
`,
  },

  // ============================================================
  // 第 5 章：时间序列处理
  // ============================================================
  {
    id: "aipy-pandas-timeseries",
    icon: "⏰",
    group: "Pandas数据处理",
    title: "时间序列处理",
    content: `## 时间序列处理

时间序列（Time Series）是按时间顺序排列的数据点序列，广泛存在于金融、IoT、运维监控、销售预测、气象等领域。Pandas 从诞生之初就为金融时间序列分析而生，它内置的时间类型、DatetimeIndex、重采样、滑动窗口等能力，是其相对其他数据处理框架最显著的优势之一。

本章系统讲解 Pandas 时间序列的四大支柱：**时间戳、时间索引、重采样、滑动窗口**。

### 5.1 Python 的时间生态

Python 处理时间有三个层次：

| 层次 | 模块 | 说明 |
| --- | --- | --- |
| 标准库 | \`datetime\` | 基础日期/时间/时间差 |
| 标准库 | \`calendar\` | 日历、星期、闰年 |
| 标准库 | \`time\` | 时间戳、休眠 |
| 第三方 | \`dateutil\` | 强大的日期解析 |
| 第三方 | \`pytz\` | 时区数据库 |
| 第三方 | \`arrow\` / \`pendulum\` | 现代化封装 |

Pandas 在这些之上构建了 \`Timestamp\`、\`DatetimeIndex\`、\`Timedelta\`、\`TimedeltaIndex\`、\`Period\` 等类型。

#### 5.1.1 datetime 基础

\`\`\`python
from datetime import datetime, timedelta, date

now = datetime.now()           # 当前本地时间
dt = datetime(2024, 1, 15, 10, 30, 0)  # 构造指定时间
d = date(2024, 1, 15)          # 仅日期
ts = dt.timestamp()            # 转 POSIX 时间戳
datetime.fromtimestamp(ts)     # 时间戳转 datetime

# 格式化与解析
dt.strftime('%Y-%m-%d %H:%M:%S')         # datetime -> str
datetime.strptime('2024-01-15', '%Y-%m-%d')  # str -> datetime

# 时间差
delta = timedelta(days=7, hours=3)
dt + delta                     # 7 天 3 小时后
dt - datetime.now()            # 距今多久
\`\`\`

#### 5.1.2 常用格式化占位符

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| \`%Y\` | 4 位年 | 2024 |
| \`%m\` | 月（补零） | 01 |
| \`%d\` | 日（补零） | 15 |
| \`%H\` | 24 小时制时 | 14 |
| \`%M\` | 分 | 30 |
| \`%S\` | 秒 | 59 |
| \`%f\` | 微秒 | 000000 |
| \`%A\` | 星期全名 | Monday |
| \`%a\` | 星期缩写 | Mon |
| \`%B\` | 月全名 | January |
| \`%b\` | 月缩写 | Jan |
| \`%p\` | AM/PM | PM |
| \`%z\` | 时区偏移 | +0800 |
| \`%W\` | ISO 周数 | 03 |

### 5.2 Pandas 时间类型

#### 5.2.1 Timestamp

\`pd.Timestamp\` 是 Pandas 的时间戳类型，替代 \`datetime.datetime\`，支持纳秒精度：

\`\`\`python
ts = pd.Timestamp('2024-01-15 10:30:00')
ts = pd.Timestamp('2024/01/15')
ts = pd.Timestamp(year=2024, month=1, day=15)
ts = pd.Timestamp.now()
ts = pd.Timestamp.today()

# 属性
ts.year, ts.month, ts.day
ts.hour, ts.minute, ts.second
ts.dayofweek    # 0=周一, 6=周日
ts.day_name()   # 'Monday'
ts.quarter      # 季度 1-4
ts.is_leap_year # 是否闰年
ts.weekofyear   # ISO 周数
\`\`\`

#### 5.2.2 DatetimeIndex

\`DatetimeIndex\` 是时间戳组成的索引，是时间序列的基石：

\`\`\`python
# 三种创建方式
idx = pd.to_datetime(['2024-01-01', '2024-01-02', '2024-01-03'])
idx = pd.date_range('2024-01-01', '2024-01-10')  # 默认按天
idx = pd.DatetimeIndex(['2024-01-01', '2024-01-02'])
\`\`\`

#### 5.2.3 date_range：生成时间序列

\`\`\`python
pd.date_range(start='2024-01-01', end='2024-01-10')              # 每天
pd.date_range(start='2024-01-01', periods=10)                    # 10 天
pd.date_range(start='2024-01-01', periods=10, freq='D')          # 每天（显式）
pd.date_range(start='2024-01-01', periods=10, freq='H')          # 每小时
pd.date_range(start='2024-01-01', periods=10, freq='4H')         # 每 4 小时
pd.date_range(start='2024-01-01', periods=10, freq='W')          # 每周日
pd.date_range(start='2024-01-01', periods=4, freq='M')           # 每月末
pd.date_range(start='2024-01-01', periods=4, freq='MS')          # 每月初
pd.date_range(start='2024-01-01', periods=4, freq='Q')           # 每季末
pd.date_range(start='2024-01-01', periods=4, freq='Y')           # 每年末
pd.date_range(start='2024-01-01', periods=10, freq='B')          # 工作日
\`\`\`

#### 5.2.4 频率别名（offset aliases）

| 别名 | 含义 | 别名 | 含义 |
| --- | --- | --- | --- |
| \`D\` | 日历日 | \`B\` | 工作日 |
| \`W\` | 周（周日） | \`W-MON\` | 每周一 |
| \`M\` | 月末 | \`MS\` | 月初 |
| \`Q\` | 季末 | \`QS\` | 季初 |
| \`Y\` / \`A\` | 年末 | \`YS\` / \`AS\` | 年初 |
| \`H\` | 小时 | \`T\` / \`min\` | 分钟 |
| \`S\` | 秒 | \`L\` / \`ms\` | 毫秒 |
| \`U\` / \`us\` | 微秒 | \`N\` | 纳秒 |
| \`BM\` | 工作日月末 | \`BQ\` | 工作日季末 |
| \`4H\` | 每 4 小时 | \`2D\` | 每 2 天 |

### 5.3 时间索引与切片

把 DatetimeIndex 设为 DataFrame 的 index 后，可以享受"按时间切片"的便捷：

\`\`\`python
df = pd.DataFrame({'value': range(365)},
                  index=pd.date_range('2024-01-01', periods=365))

df.loc['2024-03-15']             # 某一天
df.loc['2024-03']                # 整个 3 月！
df.loc['2024-03':'2024-05']      # 3 月到 5 月（双闭）
df.loc['2024']                   # 整个 2024 年
df['2024-01-01':'2024-01-15']    # 切片语法（旧式）
\`\`\`

**这是 Pandas 时间序列最爽的特性之一**：你不需要写复杂的 WHERE 条件，直接用字符串就能按年/月/日切片。

### 5.4 时间属性（.dt 访问器）

时间类型的列通过 \`.dt\` 访问器获取各种属性：

\`\`\`python
df['date'] = pd.to_datetime(df['date'])
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['hour'] = df['date'].dt.hour
df['dayofweek'] = df['date'].dt.dayofweek       # 0=周一
df['day_name'] = df['date'].dt.day_name()
df['is_weekend'] = df['date'].dt.dayofweek >= 5
df['quarter'] = df['date'].dt.quarter
df['weekofyear'] = df['date'].dt.isocalendar().week
df['days_in_month'] = df['date'].dt.days_in_month
df['is_month_start'] = df['date'].dt.is_month_start
df['is_month_end'] = df['date'].dt.is_month_end
\`\`\`

### 5.5 重采样（Resample）

**重采样**是改变时间序列频率的操作，分两类：

- **降采样（Downsampling）**：高频 → 低频（如日 → 月），需要聚合
- **升采样（Upsampling）**：低频 → 高频（如月 → 日），需要填充

#### 5.5.1 降采样

\`\`\`python
# 假设 df 是日线数据，按月汇总
df.resample('M')['amount'].sum()        # 月度总和
df.resample('W')['amount'].mean()       # 周平均
df.resample('Q')['amount'].agg(['sum','mean','max'])  # 季度多种聚合
df.resample('Y')['amount'].sum()        # 年度总和

# 自定义聚合
df.resample('M').agg({'amount':'sum', 'qty':'mean', 'price':'last'})

# closed: 哪端闭合；label: 用哪端作标签
df.resample('W', closed='right', label='right').sum()
\`\`\`

resample 的参数：

- \`rule\`：频率字符串（'M'、'W'、'D'...）
- \`closed\`：哪端闭合（'right' 默认 / 'left'）
- \`label\`：用哪端作标签（'right' 默认 / 'left'）
- \`on\`：用哪列（非 index 时）
- \`level\`：用 MultiIndex 的哪一层

#### 5.5.2 升采样

\`\`\`python
# 月度数据转日度
monthly.resample('D').asfreq()        # 缺失填 NaN
monthly.resample('D').ffill()         # 前向填充
monthly.resample('D').bfill()         # 后向填充
monthly.resample('D').interpolate()   # 线性插值
monthly.resample('D').pad()           # 同 ffill
\`\`\`

### 5.6 滑动窗口（Rolling）

滑动窗口是时间序列最常用的"平滑"工具：

\`\`\`python
# 7 日移动平均
df['ma7'] = df['value'].rolling(window=7).mean()

# 30 日移动平均
df['ma30'] = df['value'].rolling(window=30).mean()

# 其他统计
df['value'].rolling(7).std()      # 移动标准差
df['value'].rolling(7).max()      # 移动最大
df['value'].rolling(7).sum()      # 移动求和
df['value'].rolling(7).median()   # 移动中位数
df['value'].rolling(7).quantile(0.25)  # 移动分位数

# 自定义函数
df['value'].rolling(7).apply(lambda w: max(w) - min(w))
\`\`\`

#### 5.6.1 窗口类型

\`\`\`python
# 默认：等权窗口
df.rolling(7).mean()

# 指数加权（EWMA）：近期数据权重更大
df['value'].ewm(span=7).mean()

# 加权窗口（win_type）
df['value'].rolling(7, win_type='gaussian').mean(std=2)
df['value'].rolling(7, win_type='triang').mean()
\`\`\`

#### 5.6.2 扩展窗口

\`\`\`python
# expanding：从开头扩展到当前位置
df['cum_max'] = df['value'].expanding().max()
df['cum_mean'] = df['value'].expanding().mean()
\`\`\`

#### 5.6.3 关键参数

- \`window\`：窗口大小
- \`min_periods\`：最少需要的非 NaN 值（默认=window）
- \`center\`：是否居中（默认 False，向后看）
- \`closed\`：哪端闭合

\`\`\`python
# 前 6 个值是 NaN（因为窗口未满）
df['value'].rolling(7).mean()                # min_periods=7
df['value'].rolling(7, min_periods=1).mean() # 至少 1 个值就开始算
df['value'].rolling(7, center=True).mean()   # 居中（前后各看 3 天）
\`\`\`

### 5.7 时间差（Timedelta）

\`\`\`python
# 创建
td = pd.Timedelta('2 days 3 hours')
td = pd.Timedelta(days=2, hours=3)
td = pd.Timedelta('1D')          # 1 天
td = pd.Timedelta('1H')          # 1 小时

# 运算
ts + td                          # 加时间差
ts1 - ts2                        # 减得 Timedelta
td * 2                           # 乘倍数
td / pd.Timedelta('1 day')       # 转天数

# TimedeltaIndex
df['duration'] = df['end'] - df['start']
df['duration'].dt.total_seconds()  # 转秒
df['duration'].dt.days             # 整天数
\`\`\`

### 5.8 时区处理

\`\`\`python
import pytz

# 本地化：给 naive 时间加时区
ts = pd.Timestamp('2024-01-15 10:00')
ts = ts.tz_localize('UTC')
ts = ts.tz_localize('Asia/Shanghai')

# 转换：换时区
ts_utc = ts.tz_convert('UTC')
ts_ny = ts.tz_convert('America/New_York')

# 常用时区
'UTC', 'Asia/Shanghai', 'Asia/Tokyo',
'America/New_York', 'America/Los_Angeles',
'Europe/London', 'Europe/Paris'
\`\`\`

### 5.9 Period 与 Timestamp 互转

\`Period\` 表示一段时间（如"2024 年 3 月"），不同于 \`Timestamp\`（一个时刻）：

\`\`\`python
p = pd.Period('2024-03', freq='M')       # 2024 年 3 月
p.start_time     # 2024-03-01 00:00
p.end_time       # 2024-03-31 23:59:59
p.to_timestamp() # 转为该 period 起始的 Timestamp

ts = pd.Timestamp('2024-03-15')
ts.to_period('M')  # 转为月度 Period

# PeriodIndex
idx = pd.period_range('2024-01', '2024-12', freq='M')
\`\`\`

### 5.10 实战：股票价格分析

\`\`\`python
# 假设有日线数据
df = pd.DataFrame({
    'close': np.random.randn(365).cumsum() + 100,
}, index=pd.date_range('2024-01-01', periods=365))

# 1. 日收益率
df['return'] = df['close'].pct_change()

# 2. 7 日与 30 日移动平均
df['ma7'] = df['close'].rolling(7).mean()
df['ma30'] = df['close'].rolling(30).mean()

# 3. 金叉死叉信号
df['signal'] = (df['ma7'] > df['ma30']).astype(int)
df['signal_change'] = df['signal'].diff()
golden_cross = df[df['signal_change'] == 1]
death_cross = df[df['signal_change'] == -1]

# 4. 月度收益
monthly = df['return'].resample('M').sum()

# 5. 年度波动率
annual_vol = df['return'].std() * (252 ** 0.5)
\`\`\`

### 5.11 常见陷阱

#### 5.11.1 时区 naive vs aware

混合 naive 和 aware 时间会报错：

\`\`\`python
naive = pd.Timestamp('2024-01-01')
aware = pd.Timestamp('2024-01-01', tz='UTC')
naive == aware  # TypeError
\`\`\`

#### 5.11.2 业务日 vs 日历日

\`B\`（工作日）和 \`D\`（日历日）不同：

\`\`\`python
pd.date_range('2024-01-13', periods=3, freq='D')  # 周六、周日、周一
pd.date_range('2024-01-13', periods=3, freq='B')  # 周一、周二、周三
\`\`\`

#### 5.11.3 resample 的 closed/label

\`\`\`python
df.resample('W').sum()  # 默认 closed='right', label='right'
# 意味着：周日到周六的数据，标签为周六
\`\`\`

#### 5.11.4 字符串到日期

\`\`\`python
pd.to_datetime(df['date'])  # 自动推断格式
pd.to_datetime(df['date'], format='%Y-%m-%d')  # 显式更快
pd.to_datetime(df['date'], errors='coerce')  # 错误变 NaT
\`\`\`

### 5.12 性能技巧

1. **用 \`DatetimeIndex\`**：比字符串列快 100 倍
2. **指定 format**：\`to_datetime(format=...)\` 快 10 倍
3. **缓存转换结果**：不要每次都转
4. **用 \`period\` 替代 \`timestamp\`**：纯月度数据用 Period 更省内存
5. **用 \`infer_datetime_format=True\`**（已弃用，1.5+ 默认开）

### 5.13 本章小结

- **时间类型**：Timestamp（时刻）、Period（时段）、Timedelta（时间差）
- **DatetimeIndex** 是时间序列的基石，支持按字符串切片（\`df.loc['2024-03']\`）
- **.dt 访问器**：从时间列提取年/月/日/星期等属性
- **resample**：改变频率（降采样聚合、升采样填充）
- **rolling**：滑动窗口（移动平均、移动标准差等）
- **ewm**：指数加权，近期数据权重更大
- **时区**：tz_localize 加时区，tz_convert 换时区

时间序列是数据科学的"高阶技能"，掌握它你就能处理股票、IoT、监控、销售预测等几乎所有带时间维度的数据。`,
    code: `# ============================================================
# 第 5 章代码演示：用纯 Python 模拟 Pandas 时间序列
# ============================================================
# 演示内容：
#   - Timestamp / DatetimeIndex 创建
#   - 时间切片（按年/月/日）
#   - .dt 属性访问
#   - resample 重采样（降采样聚合 + 升采样填充）
#   - rolling 滑动窗口
#   - ewm 指数加权
#   - Timedelta 时间差

from datetime import datetime, timedelta, date
import calendar
import math

# ---- 工具 ----
def _is_nan(v):
    return v is None or (isinstance(v, float) and v != v)


# ============================================================
# 1. 时间戳与时间索引
# ============================================================
def to_datetime(s, fmt=None):
    """字符串转 datetime"""
    if isinstance(s, datetime):
        return s
    if isinstance(s, date) and not isinstance(s, datetime):
        return datetime(s.year, s.month, s.day)
    if fmt:
        return datetime.strptime(s, fmt)
    # 自动尝试常见格式
    for f in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%Y/%m/%d', '%Y-%m', '%Y']:
        try:
            return datetime.strptime(s, f)
        except ValueError:
            continue
    raise ValueError(f"无法解析: {s!r}")


def date_range(start, end=None, periods=None, freq='D'):
    """生成时间序列索引"""
    if isinstance(start, str):
        start = to_datetime(start)
    if end and isinstance(end, str):
        end = to_datetime(end)

    # 解析 freq（简化版：支持 D/H/M(in月)/W/Q/Y 和带系数如 4H）
    if freq[0].isdigit():
        step = int(freq[:-1])
        unit = freq[-1]
    else:
        step = 1
        unit = freq

    delta_map = {
        'D': timedelta(days=step),
        'H': timedelta(hours=step),
        'T': timedelta(minutes=step),
        'min': timedelta(minutes=step),
        'S': timedelta(seconds=step),
    }

    if unit in delta_map:
        delta = delta_map[unit]
        if end:
            result = []
            cur = start
            while cur <= end:
                result.append(cur)
                cur += delta
            return result
        else:
            return [start + i * delta for i in range(periods)]

    # 处理月度/年度（需要手动加减）
    if unit in ('M', 'MS'):
        result = []
        cur = start
        if periods:
            for _ in range(periods):
                result.append(cur)
                # 加一个月
                if cur.month == 12:
                    cur = cur.replace(year=cur.year + 1, month=1)
                else:
                    cur = cur.replace(month=cur.month + 1)
        else:
            while cur <= end:
                result.append(cur)
                if cur.month == 12:
                    cur = cur.replace(year=cur.year + 1, month=1)
                else:
                    cur = cur.replace(month=cur.month + 1)
        return result

    if unit in ('Y', 'A', 'YS', 'AS'):
        result = []
        cur = start
        if periods:
            for _ in range(periods):
                result.append(cur)
                cur = cur.replace(year=cur.year + step)
        else:
            while cur <= end:
                result.append(cur)
                cur = cur.replace(year=cur.year + step)
        return result

    if unit == 'W':
        delta = timedelta(weeks=step)
        if end:
            result = []
            cur = start
            while cur <= end:
                result.append(cur)
                cur += delta
            return result
        return [start + i * delta for i in range(periods)]

    if unit == 'B':
        # 工作日
        result = []
        cur = start
        count = 0
        while (periods and count < periods) or (end and cur <= end):
            if cur.weekday() < 5:  # 0-4 是周一到周五
                result.append(cur)
                count += 1
            cur += timedelta(days=1)
        return result

    raise ValueError(f"不支持的 freq: {freq}")


def datetime_attr(dt, attr):
    """获取 datetime 属性"""
    if attr == 'year': return dt.year
    if attr == 'month': return dt.month
    if attr == 'day': return dt.day
    if attr == 'hour': return dt.hour
    if attr == 'minute': return dt.minute
    if attr == 'second': return dt.second
    if attr == 'dayofweek': return dt.weekday()  # 0=周一
    if attr == 'day_name': return ['周一','周二','周三','周四','周五','周六','周日'][dt.weekday()]
    if attr == 'quarter': return (dt.month - 1) // 3 + 1
    if attr == 'weekofyear': return dt.isocalendar()[1]
    if attr == 'days_in_month': return calendar.monthrange(dt.year, dt.month)[1]
    if attr == 'is_month_start': return dt.day == 1
    if attr == 'is_month_end': return dt.day == calendar.monthrange(dt.year, dt.month)[1]
    if attr == 'is_weekend': return dt.weekday() >= 5
    raise ValueError(attr)


# ============================================================
# 2. 时间索引 DataFrame
# ============================================================
class TimeSeries:
    """带时间索引的序列"""
    def __init__(self, data, index=None):
        self.data = list(data)
        if index is None:
            self.index = list(range(len(self.data)))
        elif isinstance(index, list) and index and isinstance(index[0], str):
            self.index = [to_datetime(s) for s in index]
        else:
            self.index = list(index)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, key):
        """支持按时间切片"""
        if isinstance(key, str):
            # '2024-03' 或 '2024-03-15' 或 '2024'
            # 找出所有匹配的时间点
            indices = [i for i, t in enumerate(self.index)
                       if _time_match(t, key)]
            if len(indices) == 1:
                return self.data[indices[0]]
            return TimeSeries([self.data[i] for i in indices],
                              [self.index[i] for i in indices])
        if isinstance(key, slice):
            # 时间切片
            start = to_datetime(key.start) if isinstance(key.start, str) else key.start
            stop = to_datetime(key.stop) if isinstance(key.stop, str) else key.stop
            indices = [i for i, t in enumerate(self.index)
                       if (start is None or t >= start) and (stop is None or t <= stop)]
            return TimeSeries([self.data[i] for i in indices],
                              [self.index[i] for i in indices])
        if isinstance(key, int):
            return self.data[key]
        raise TypeError(key)

    def __repr__(self):
        lines = []
        for t, v in zip(self.index, self.data):
            lines.append(f"{t.strftime('%Y-%m-%d')}    {v:.4f}" if isinstance(v, float) else f"{t.strftime('%Y-%m-%d')}    {v}")
        return "\\n".join(lines)


def _time_match(t, key):
    """判断时间 t 是否匹配字符串 key（如 '2024' 或 '2024-03'）"""
    if not isinstance(t, datetime):
        return False
    parts = key.split('-')
    if len(parts) == 1 and parts[0].isdigit():
        return t.year == int(parts[0])
    if len(parts) == 2:
        return t.year == int(parts[0]) and t.month == int(parts[1])
    if len(parts) == 3:
        return t.year == int(parts[0]) and t.month == int(parts[1]) and t.day == int(parts[2])
    return False


# ============================================================
# 3. resample 重采样
# ============================================================
def resample(ts, freq, aggfunc='sum', fill_method=None):
    """迷你版 resample"""
    if freq == 'M':
        # 按月聚合
        groups = {}
        for t, v in zip(ts.index, ts.data):
            if _is_nan(v):
                continue
            key = (t.year, t.month)
            groups.setdefault(key, []).append(v)
        result_idx = []
        result_data = []
        for key in sorted(groups.keys()):
            y, m = key
            result_idx.append(datetime(y, m, 1))
            vals = groups[key]
            result_data.append(_apply_agg(aggfunc, vals))
        return TimeSeries(result_data, result_idx)

    if freq == 'W':
        # 按周聚合（周一开始）
        groups = {}
        for t, v in zip(ts.index, ts.data):
            if _is_nan(v):
                continue
            # 找到本周一
            monday = t - timedelta(days=t.weekday())
            key = monday.date()
            groups.setdefault(key, []).append(v)
        result_idx = []
        result_data = []
        for key in sorted(groups.keys()):
            result_idx.append(datetime.combine(key, datetime.min.time()))
            result_data.append(_apply_agg(aggfunc, groups[key]))
        return TimeSeries(result_data, result_idx)

    if freq == 'Y' or freq == 'A':
        # 按年聚合
        groups = {}
        for t, v in zip(ts.index, ts.data):
            if _is_nan(v):
                continue
            key = t.year
            groups.setdefault(key, []).append(v)
        result_idx = []
        result_data = []
        for key in sorted(groups.keys()):
            result_idx.append(datetime(key, 1, 1))
            result_data.append(_apply_agg(aggfunc, groups[key]))
        return TimeSeries(result_data, result_idx)

    if freq == 'Q':
        # 按季聚合
        groups = {}
        for t, v in zip(ts.index, ts.data):
            if _is_nan(v):
                continue
            q = (t.month - 1) // 3 + 1
            key = (t.year, q)
            groups.setdefault(key, []).append(v)
        result_idx = []
        result_data = []
        for key in sorted(groups.keys()):
            y, q = key
            result_idx.append(datetime(y, (q-1)*3+1, 1))
            result_data.append(_apply_agg(aggfunc, groups[key]))
        return TimeSeries(result_data, result_idx)

    raise ValueError(f"不支持的 freq: {freq}")


def _apply_agg(func, vals):
    if callable(func):
        return func(vals)
    valid = [v for v in vals if not _is_nan(v)]
    if func == 'sum': return sum(valid) if valid else 0
    if func == 'mean': return sum(valid)/len(valid) if valid else None
    if func == 'count': return len(valid)
    if func == 'size': return len(vals)
    if func == 'min': return min(valid) if valid else None
    if func == 'max': return max(valid) if valid else None
    if func == 'first': return vals[0] if vals else None
    if func == 'last': return vals[-1] if vals else None
    raise ValueError(func)


# ============================================================
# 4. rolling 滑动窗口
# ============================================================
def rolling(ts, window, func, min_periods=None):
    """迷你版 rolling"""
    if min_periods is None:
        min_periods = window
    result = [None] * len(ts.data)
    for i in range(len(ts.data)):
        if i + 1 < min_periods:
            continue
        start = max(0, i - window + 1)
        window_vals = ts.data[start:i+1]
        valid = [v for v in window_vals if not _is_nan(v)]
        if len(valid) < min_periods:
            continue
        if callable(func):
            result[i] = func(valid)
        else:
            result[i] = _apply_agg(func, valid)
    return result


def ewm(ts, span=None, alpha=None):
    """指数加权移动平均"""
    if alpha is None:
        if span is None:
            raise ValueError("需要 span 或 alpha")
        alpha = 2 / (span + 1)
    result = [None] * len(ts.data)
    prev = None
    for i, v in enumerate(ts.data):
        if _is_nan(v):
            result[i] = prev
            continue
        if prev is None:
            prev = v
        else:
            prev = alpha * v + (1 - alpha) * prev
        result[i] = prev
    return result


def pct_change(ts):
    """百分比变化"""
    result = [None] * len(ts.data)
    for i in range(1, len(ts.data)):
        if _is_nan(ts.data[i]) or _is_nan(ts.data[i-1]) or ts.data[i-1] == 0:
            result[i] = None
        else:
            result[i] = (ts.data[i] - ts.data[i-1]) / ts.data[i-1]
    return result


# ============================================================
# 演示
# ============================================================
print("=" * 60)
print("1. datetime 基础")
print("=" * 60)
dt = datetime(2024, 3, 15, 10, 30, 0)
print(f"构造: {dt}")
print(f"格式化: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"ISO: {dt.isoformat()}")
print(f"年/月/日: {dt.year}/{dt.month}/{dt.day}")
print(f"时/分/秒: {dt.hour}:{dt.minute}:{dt.second}")
print(f"星期: {datetime_attr(dt, 'day_name')} (weekday={dt.weekday()})")
print(f"季度: Q{datetime_attr(dt, 'quarter')}")
print(f"周数: {datetime_attr(dt, 'weekofyear')}")
print(f"闰年: {calendar.isleap(dt.year)}")

print("\\n字符串解析:")
for s in ['2024-03-15', '2024/03/15', '2024-03-15 10:30:00', '2024-03', '2024']:
    print(f"  {s!r:>25} -> {to_datetime(s)}")

print("\\n时间差:")
td = timedelta(days=7, hours=3)
print(f"  7 天 3 小时后: {dt + td}")
print(f"  距 2024-01-01: {dt - datetime(2024, 1, 1)}")

print("\\n" + "=" * 60)
print("2. date_range 生成时间序列")
print("=" * 60)
print("--- date_range('2024-01-01', periods=5, freq='D') ---")
for t in date_range('2024-01-01', periods=5, freq='D'):
    print(f"  {t}")

print("\\n--- date_range('2024-01-01', periods=5, freq='4H') ---")
for t in date_range('2024-01-01', periods=5, freq='4H'):
    print(f"  {t}")

print("\\n--- date_range('2024-01-01', '2024-01-31', freq='W') ---")
for t in date_range('2024-01-01', '2024-01-31', freq='W'):
    print(f"  {t}")

print("\\n--- date_range('2024-01-01', periods=4, freq='M') ---")
for t in date_range('2024-01-01', periods=4, freq='M'):
    print(f"  {t}")

print("\\n--- date_range('2024-01-01', periods=5, freq='B') (工作日) ---")
for t in date_range('2024-01-13', periods=5, freq='B'):
    print(f"  {t} ({datetime_attr(t, 'day_name')})")

print("\\n" + "=" * 60)
print("3. TimeSeries 与时间切片")
print("=" * 60)
# 生成 2024 全年日线数据
idx = date_range('2024-01-01', '2024-12-31', freq='D')
# 模拟价格（带趋势 + 噪声）
import random
random.seed(42)
prices = [100.0]
for _ in range(len(idx) - 1):
    prices.append(prices[-1] * (1 + random.gauss(0.001, 0.02)))
ts = TimeSeries(prices, idx)
print(f"全年数据: {len(ts)} 天")
print("前 5 行:")
for t, v in list(zip(ts.index, ts.data))[:5]:
    print(f"  {t.strftime('%Y-%m-%d')}    {v:.4f}")

print("\\n--- ts['2024-03'] （整个 3 月）---")
mar = ts['2024-03']
print(f"共 {len(mar)} 天")
for t, v in list(zip(mar.index, mar.data))[:5]:
    print(f"  {t.strftime('%Y-%m-%d')}    {v:.4f}")

print("\\n--- ts['2024-03-15'] （某一天）---")
print(f"  价格: {ts['2024-03-15']:.4f}")

print("\\n--- ts['2024-03':'2024-05'] （3 月到 5 月）---")
q2 = ts['2024-03':'2024-05']
print(f"  共 {len(q2)} 天")

print("\\n--- ts['2024'] （全年，等于自身）---")
y2024 = ts['2024']
print(f"  共 {len(y2024)} 天")

print("\\n" + "=" * 60)
print("4. .dt 属性（从时间索引提取）")
print("=" * 60)
months = [datetime_attr(t, 'month') for t in ts.index[:(31+29+15)]]  # 前 75 天
quarters = [datetime_attr(t, 'quarter') for t in ts.index[:(31+29+15)]]
weekdays = [datetime_attr(t, 'day_name') for t in ts.index[:7]]
print("前 7 天的星期:", weekdays)
print("前 5 个月份数:", months[:31][-5:])
print("Q1 的前 5 个季度标记:", quarters[:5])

print("\\n" + "=" * 60)
print("5. resample 重采样（降采样）")
print("=" * 60)
print("--- resample('M').mean() 月度平均 ---")
monthly = resample(ts, 'M', aggfunc='mean')
print(f"共 {len(monthly)} 个月")
for t, v in list(zip(monthly.index, monthly.data))[:6]:
    print(f"  {t.strftime('%Y-%m')}    {v:.4f}")

print("\\n--- resample('M').agg(['sum','mean','max']) 月度多聚合 ---")
for func in ['sum', 'mean', 'max', 'min']:
    m = resample(ts, 'M', aggfunc=func)
    print(f"  {func:>5}: {[f'{v:.2f}' for v in m.data[:6]]}")

print("\\n--- resample('W').mean() 周平均 ---")
weekly = resample(ts, 'W', aggfunc='mean')
print(f"共 {len(weekly)} 周")
for t, v in list(zip(weekly.index, weekly.data))[:5]:
    print(f"  {t.strftime('%Y-%m-%d')}    {v:.4f}")

print("\\n--- resample('Q').sum() 季度总和 ---")
quarterly = resample(ts, 'Q', aggfunc='sum')
for t, v in zip(quarterly.index, quarterly.data):
    print(f"  {t.strftime('%Y-%m')}    {v:.4f}")

print("\\n--- resample('Y').agg(['mean','max']) 年度 ---")
for func in ['mean', 'max', 'min']:
    y = resample(ts, 'Y', aggfunc=func)
    print(f"  {func}: {y.data}")

print("\\n" + "=" * 60)
print("6. rolling 滑动窗口")
print("=" * 60)
print("--- rolling(7).mean() 7 日移动平均（前 15 天）---")
ma7 = rolling(ts, 7, 'mean')
for t, v, m in list(zip(ts.index, ts.data, ma7))[:15]:
    m_str = f"{m:.4f}" if m is not None else "  NaN"
    print(f"  {t.strftime('%Y-%m-%d')}    close={v:.4f}    ma7={m_str}")

print("\\n--- rolling(30).mean() vs rolling(30).std() ---")
ma30 = rolling(ts, 30, 'mean')
std30 = rolling(ts, 30, 'std' if False else (lambda v: (sum((x-sum(v)/len(v))**2 for x in v)/len(v))**0.5))
print(f"  第 30 天: close={ts.data[29]:.4f}, ma30={ma30[29]:.4f}, std30={std30[29]:.4f}")
print(f"  第 60 天: close={ts.data[59]:.4f}, ma30={ma30[59]:.4f}, std30={std30[59]:.4f}")

print("\\n--- rolling(7, min_periods=1) 一开始就计算 ---")
ma7_soft = rolling(ts, 7, 'mean', min_periods=1)
print("前 7 天:")
for t, v, m in list(zip(ts.index, ts.data, ma7_soft))[:7]:
    print(f"  {t.strftime('%Y-%m-%d')}    close={v:.4f}    ma7={m:.4f}")

print("\\n" + "=" * 60)
print("7. ewm 指数加权移动平均")
print("=" * 60)
ewma7 = ewm(ts, span=7)
ewma30 = ewm(ts, span=30)
print("--- 前 10 天对比 ---")
print(f"  {'日期':>12}    {'close':>10}    {'ma7':>10}    {'ewma7':>10}    {'ewma30':>10}")
for i in range(10):
    t = ts.index[i]
    v = ts.data[i]
    m7 = ma7[i] if ma7[i] is not None else float('nan')
    e7 = ewma7[i] if ewma7[i] is not None else float('nan')
    e30 = ewma30[i] if ewma30[i] is not None else float('nan')
    print(f"  {t.strftime('%Y-%m-%d')}    {v:>10.4f}    {m7:>10.4f}    {e7:>10.4f}    {e30:>10.4f}")

print("\\n说明：ewm 一开始就能算，且近期数据权重更大")

print("\\n" + "=" * 60)
print("8. pct_change 百分比变化（日收益率）")
print("=" * 60)
returns = pct_change(ts)
print("--- 前 10 天的日收益率 ---")
for i in range(10):
    t = ts.index[i]
    r = returns[i]
    r_str = f"{r*100:>7.2f}%" if r is not None else "   N/A"
    print(f"  {t.strftime('%Y-%m-%d')}    close={ts.data[i]:.4f}    return={r_str}")

print("\\n--- 年度波动率（日收益标准差 × √252）---")
valid_returns = [r for r in returns if r is not None and not _is_nan(r)]
mean_r = sum(valid_returns) / len(valid_returns)
std_r = (sum((x - mean_r) ** 2 for x in valid_returns) / len(valid_returns)) ** 0.5
annual_vol = std_r * (252 ** 0.5)
print(f"  日均收益: {mean_r*100:.4f}%")
print(f"  日波动率: {std_r*100:.4f}%")
print(f"  年化波动率: {annual_vol*100:.2f}%")

print("\\n" + "=" * 60)
print("9. 实战：金叉死叉信号")
print("=" * 60)
# 重新计算完整的 ma7 和 ma30
ma7_full = rolling(ts, 7, 'mean')
ma30_full = rolling(ts, 30, 'mean')

# 信号 = ma7 > ma30
signals = [None] * len(ts.data)
for i in range(len(ts.data)):
    if ma7_full[i] is not None and ma30_full[i] is not None:
        signals[i] = 1 if ma7_full[i] > ma30_full[i] else 0

# 找信号变化点
golden_cross = []  # ma7 上穿 ma30
death_cross = []   # ma7 下穿 ma30
for i in range(1, len(signals)):
    if signals[i] is None or signals[i-1] is None:
        continue
    if signals[i] == 1 and signals[i-1] == 0:
        golden_cross.append((ts.index[i], ts.data[i]))
    elif signals[i] == 0 and signals[i-1] == 1:
        death_cross.append((ts.index[i], ts.data[i]))

print(f"全年金叉次数: {len(golden_cross)}")
print(f"全年死叉次数: {len(death_cross)}")
print("\\n前 3 次金叉:")
for t, v in golden_cross[:3]:
    print(f"  {t.strftime('%Y-%m-%d')}    价格={v:.4f}")
print("\\n前 3 次死叉:")
for t, v in death_cross[:3]:
    print(f"  {t.strftime('%Y-%m-%d')}    价格={v:.4f}")

print("\\n" + "=" * 60)
print("10. Timedelta 时间差运算")
print("=" * 60)
t1 = datetime(2024, 3, 15, 10, 0)
t2 = datetime(2024, 3, 20, 14, 30)
delta = t2 - t1
print(f"  t1 = {t1}")
print(f"  t2 = {t2}")
print(f"  t2 - t1 = {delta}")
print(f"  总秒数: {delta.total_seconds()}")
print(f"  总天数: {delta.days}")
print(f"  小时部分: {delta.seconds // 3600}")

print("\\n--- 时间差数组 ---")
starts = [datetime(2024, 1, 1, 9, 0), datetime(2024, 1, 2, 10, 0), datetime(2024, 1, 3, 11, 0)]
ends = [datetime(2024, 1, 1, 17, 30), datetime(2024, 1, 2, 19, 0), datetime(2024, 1, 3, 18, 0)]
durations = [(e - s).total_seconds() / 3600 for s, e in zip(starts, ends)]
print("工作时长（小时）:")
for s, e, d in zip(starts, ends, durations):
    print(f"  {s.strftime('%m-%d')} {s.strftime('%H:%M')}-{e.strftime('%H:%M')}    {d:.1f} 小时")

print("\\n" + "=" * 60)
print("11. 升采样与缺失填充")
print("=" * 60)
# 月度数据升采样到日度
monthly_data = TimeSeries([100, 105, 102, 108],
                          [datetime(2024,1,1), datetime(2024,2,1),
                           datetime(2024,3,1), datetime(2024,4,1)])
print("原始月度数据:")
print(monthly_data)

# 模拟升采样到日度（用 ffill）
print("\\n--- 升采样到日度，前向填充（前 20 天）---")
daily_idx = date_range('2024-01-01', '2024-04-30', freq='D')
daily_data = [None] * len(daily_idx)
# 找到每个对应月份的值
for i, dt in enumerate(daily_idx):
    # 找最近的已记录月度值
    for j in range(len(monthly_data.index) - 1, -1, -1):
        if dt >= monthly_data.index[j]:
            daily_data[i] = monthly_data.data[j]
            break
filled = TimeSeries(daily_data, daily_idx)
for t, v in list(zip(filled.index, filled.data))[:20]:
    print(f"  {t.strftime('%Y-%m-%d')}    {v}")

print("\\n--- 线性插值 ---")
# 在月度之间线性插值
interp_data = [None] * len(daily_idx)
for i, dt in enumerate(daily_idx):
    for j in range(len(monthly_data.index) - 1):
        if monthly_data.index[j] <= dt < monthly_data.index[j+1]:
            t0 = monthly_data.index[j]
            t1 = monthly_data.index[j+1]
            v0 = monthly_data.data[j]
            v1 = monthly_data.data[j+1]
            ratio = (dt - t0).total_seconds() / (t1 - t0).total_seconds()
            interp_data[i] = v0 + (v1 - v0) * ratio
            break
    else:
        if dt >= monthly_data.index[-1]:
            interp_data[i] = monthly_data.data[-1]
interp_ts = TimeSeries(interp_data, daily_idx)
for t, v in list(zip(interp_ts.index, interp_ts.data))[:10]:
    v_str = f"{v:.2f}" if v is not None else "NaN"
    print(f"  {t.strftime('%Y-%m-%d')}    {v_str}")

print("\\n" + "=" * 60)
print("✅ 第 5 章演示完毕：时间戳、时间索引、resample、rolling、ewm、Timedelta")
print("=" * 60)
`,
  },
];
