// =============================================================
// Python 人工智能开发教程 —— 第四批章节（数据可视化组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "aipy-mpl-basics",
    icon: "📈",
    group: "数据可视化",
    title: "Matplotlib基础绘图",
    content: `# Matplotlib基础绘图

## 引言：为什么数据可视化是AI开发者的必备技能

在人工智能开发流程中，数据可视化扮演着不可替代的角色。从数据探索、特征工程到模型评估、结果展示，每一个环节都需要借助可视化手段来理解数据、发现规律、传递信息。Matplotlib 作为 Python 生态中最基础也最强大的绘图库，是每一位 AI 开发者必须掌握的工具。

想象一个场景：你拿到一份包含十万条记录的用户行为数据，如果只用 Pandas 的 \\\`describe()\\\` 方法，你只能看到均值、方差、分位数这些冰冷的数字。但如果你画一个直方图，数据分布的形态、是否存在双峰、有没有异常值，都会一目了然。这就是可视化的力量——把抽象的数字转化为直观的视觉信号，让人类大脑能高效处理的信息形式。

Matplotlib 由 John D. Hunter 于 2003 年创建，最初是为了模仿 MATLAB 的绘图功能。经过二十多年的发展，它已经成为 Python 科学计算栈的核心组件，被广泛用于学术研究、工业应用、数据新闻等各个领域。虽然后来出现了 Seaborn、Plotly、Bokeh 等更高级的绘图库，但它们大多建立在 Matplotlib 之上，或者与 Matplotlib 紧密集成。因此，掌握 Matplotlib 是学习其他可视化库的基础。

## 第一节：Matplotlib的架构与核心概念

### 1.1 三层架构

Matplotlib 采用三层架构设计，从底到顶分别是：

**1. 后端层（Backend Layer）**
最底层，负责与设备无关的渲染工作。后端可以是文件型（如 PNG、PDF、SVG），也可以是交互式界面型（如 TkAgg、Qt5Agg、MacOSX）。这层包含三个核心类：FigureCanvas（画布）、Renderer（渲染器）、Event（事件）。

**2. 艺术家层（Artist Layer）**
中间层，所有的可视化元素都是 Artist 对象。Artist 分为两类：
- Primitive Artist：基本图元，如 Line2D、Rectangle、Text、Image
- Composite Artist：复合图元，如 Axis、Tick、Figure、Axes

**3. 脚本层（Scripting Layer）**
最上层，也就是 pyplot 模块，提供类似 MATLAB 的简化 API。日常使用最多的就是这一层，比如 plt.plot()、plt.show()。

### 1.2 Figure 与 Axes 的关系

理解 Figure 和 Axes 的关系是掌握 Matplotlib 的关键：

- **Figure**：顶层容器，代表整个图形窗口。一个 Figure 可以包含多个 Axes。
- **Axes**：实际的绘图区域，注意不是"轴"的复数（那是 Axis）。一个 Axes 包含两条或三条 Axis（坐标轴）、标题、图例等元素。

打个比方：Figure 是画框，Axes 是画布上的一幅画。一个画框里可以放一幅大画，也可以放多幅小画。

### 1.3 两种绘图风格

Matplotlib 支持两种绘图风格：

**MATLAB 风格（ pyplot 接口）**
\\\`\\\`\\\`python
import matplotlib.pyplot as plt
plt.figure()
plt.plot([1, 2, 3], [4, 5, 6])
plt.title("My Plot")
plt.show()
\\\`\\\`\\\`

**面向对象风格**
\\\`\\\`\\\`python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([1, 2, 3], [4, 5, 6])
ax.set_title("My Plot")
plt.show()
\\\`\\\`\\\`

对于简单图表，pyplot 接口更方便；对于复杂图表（多个子图、双 Y 轴等），面向对象风格更清晰、更可控。官方推荐在生产代码中使用面向对象风格。

## 第二节：折线图（Line Plot）

### 2.1 基本折线图

折线图用于展示数据随某个变量（通常是时间）的变化趋势，是最常用的图表类型之一。

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

# 生成数据：2024年某城市每月平均气温
months = np.arange(1, 13)
temps = [3, 5, 11, 17, 22, 27, 30, 29, 24, 18, 11, 5]

plt.figure(figsize=(10, 5))
plt.plot(months, temps, color='red', marker='o', linestyle='-', linewidth=2, markersize=8)
plt.title('2024年某城市月平均气温', fontsize=14)
plt.xlabel('月份', fontsize=12)
plt.ylabel('气温 (°C)', fontsize=12)
plt.xticks(months)
plt.grid(True, alpha=0.3)
plt.show()
\\\`\\\`\\\`

### 2.2 关键参数详解

\\\`\\\`\\\`python
plt.plot(x, y, color, marker, linestyle, linewidth, markersize, label, alpha)
\\\`\\\`\\\`

- **color**：颜色，可以是名称（'red'）、缩写（'r'）、十六进制（'#FF5733'）、RGB 元组
- **marker**：数据点标记，'o' 圆形、's' 方形、'^' 三角、'*' 星形、'D' 菱形
- **linestyle**：线型，'-' 实线、'--' 虚线、'-.' 点划线、':' 点线
- **linewidth**（lw）：线宽
- **markersize**（ms）：标记大小
- **label**：图例标签
- **alpha**：透明度，0~1

### 2.3 多条折线对比

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

months = np.arange(1, 13)
beijing = [3, 5, 11, 17, 22, 27, 30, 29, 24, 18, 11, 5]
shanghai = [7, 8, 12, 17, 22, 26, 30, 30, 26, 21, 15, 9]
guangzhou = [14, 15, 18, 22, 26, 28, 30, 30, 29, 26, 21, 16]

plt.figure(figsize=(12, 6))
plt.plot(months, beijing, 'r-o', label='北京', linewidth=2)
plt.plot(months, shanghai, 'b--s', label='上海', linewidth=2)
plt.plot(months, guangzhou, 'g:^', label='广州', linewidth=2)

plt.title('三城市2024年月平均气温对比', fontsize=16)
plt.xlabel('月份', fontsize=12)
plt.ylabel('气温 (°C)', fontsize=12)
plt.xticks(months)
plt.legend(loc='upper right', fontsize=11)
plt.grid(True, alpha=0.3)
plt.show()
\\\`\\\`\\\`

### 2.4 填充区域

\\\`\\\`\\\`python
plt.plot(months, temps, 'r-o')
plt.fill_between(months, temps, alpha=0.2, color='red')  # 在折线下方填充半透明区域
\\\`\\\`\\\`

fill_between 还支持条件填充，常用于表示置信区间或误差范围。

## 第三节：散点图（Scatter Plot）

### 3.1 基本散点图

散点图用于展示两个变量之间的关系，特别适合发现相关性、聚类、异常值。

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
# 模拟学生学习时长与考试成绩的关系
study_hours = np.random.uniform(1, 10, 100)
scores = study_hours * 8 + np.random.normal(0, 5, 100) + 40

plt.figure(figsize=(10, 6))
plt.scatter(study_hours, scores, c='blue', alpha=0.6, edgecolors='black', s=60)
plt.title('学习时长与考试成绩关系', fontsize=14)
plt.xlabel('学习时长（小时/周）', fontsize=12)
plt.ylabel('考试成绩', fontsize=12)
plt.grid(True, alpha=0.3)
plt.show()
\\\`\\\`\\\`

### 3.2 气泡图：用第三维编码信息

散点图可以通过点的大小、颜色编码更多维度：

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
n = 50
x = np.random.rand(n) * 100
y = np.random.rand(n) * 100
sizes = np.random.rand(n) * 500 + 20  # 点的大小，表示第三维
colors = np.random.rand(n) * 100       # 点的颜色，表示第四维

plt.figure(figsize=(10, 8))
plt.scatter(x, y, s=sizes, c=colors, cmap='viridis', alpha=0.6, edgecolors='black')
plt.colorbar(label='第四维度数值')
plt.title('气泡图：四维数据展示', fontsize=14)
plt.xlabel('X 轴', fontsize=12)
plt.ylabel('Y 轴', fontsize=12)
plt.show()
\\\`\\\`\\\`

这里 cmap 参数指定 colormap，常用选项有 'viridis'、'plasma'、'coolwarm'、'RdYlBu' 等。colorbar() 函数添加颜色条说明。

### 3.3 散点图的应用场景

- **相关性分析**：观察两变量是正相关、负相关还是无相关
- **聚类可视化**：不同聚类用不同颜色显示
- **异常检测**：偏离主体分布的点很可能是异常值
- **分类边界展示**：在分类问题中展示不同类别的分布

## 第四节：柱状图（Bar Chart）

### 4.1 垂直柱状图

柱状图用于比较不同类别的数值大小。

\\\`\\\`\\\`python
import matplotlib.pyplot as plt

products = ['产品A', '产品B', '产品C', '产品D', '产品E']
sales = [320, 480, 290, 550, 410]
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

plt.figure(figsize=(10, 6))
bars = plt.bar(products, sales, color=colors, edgecolor='black', linewidth=1.2)

# 在柱顶显示数值
for bar, sale in zip(bars, sales):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
             f'{sale}', ha='center', va='bottom', fontsize=11, fontweight='bold')

plt.title('各产品季度销售额对比', fontsize=14)
plt.xlabel('产品', fontsize=12)
plt.ylabel('销售额（万元）', fontsize=12)
plt.ylim(0, 650)
plt.grid(True, axis='y', alpha=0.3)
plt.show()
\\\`\\\`\\\`

### 4.2 水平柱状图

当类别名称较长时，水平柱状图更合适：

\\\`\\\`\\\`python
plt.barh(products, sales, color=colors)
plt.xlabel('销售额（万元）')
plt.ylabel('产品')
\\\`\\\`\\\`

### 4.3 分组柱状图

用于对比多个系列：

\\\`\\\`\\\`python
import numpy as np
import matplotlib.pyplot as plt

products = ['产品A', '产品B', '产品C', '产品D']
q1 = [80, 95, 75, 110]
q2 = [90, 85, 95, 120]
q3 = [100, 105, 85, 130]

x = np.arange(len(products))
width = 0.25

plt.figure(figsize=(12, 6))
plt.bar(x - width, q1, width, label='Q1', color='#FF6B6B')
plt.bar(x, q2, width, label='Q2', color='#4ECDC4')
plt.bar(x + width, q3, width, label='Q3', color='#45B7D1')

plt.xlabel('产品', fontsize=12)
plt.ylabel('销售额（万元）', fontsize=12)
plt.title('各产品三季度销售对比', fontsize=14)
plt.xticks(x, products)
plt.legend()
plt.grid(True, axis='y', alpha=0.3)
plt.show()
\\\`\\\`\\\`

### 4.4 堆叠柱状图

\\\`\\\`\\\`python
plt.bar(x, q1, label='Q1', color='#FF6B6B')
plt.bar(x, q2, bottom=q1, label='Q2', color='#4ECDC4')
plt.bar(x, q3, bottom=np.array(q1)+np.array(q2), label='Q3', color='#45B7D1')
plt.legend()
\\\`\\\`\\\`

堆叠柱状图的关键是 bottom 参数，指定每个柱子的起始高度。

## 第五节：直方图（Histogram）

### 5.1 基本直方图

直方图用于展示连续数据的分布情况。注意：直方图与柱状图的本质区别——柱状图用于类别数据，直方图用于连续数据。

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
# 模拟1000名学生的考试成绩，服从正态分布
scores = np.random.normal(75, 12, 1000)

plt.figure(figsize=(10, 6))
plt.hist(scores, bins=30, color='skyblue', edgecolor='black', alpha=0.7)
plt.title('学生考试成绩分布', fontsize=14)
plt.xlabel('成绩', fontsize=12)
plt.ylabel('人数', fontsize=12)
plt.grid(True, axis='y', alpha=0.3)

# 添加均值线
mean_score = np.mean(scores)
plt.axvline(mean_score, color='red', linestyle='--', linewidth=2, label=f'均值: {mean_score:.1f}')
plt.legend()
plt.show()
\\\`\\\`\\\`

### 5.2 bins 参数的重要性

bins 决定分箱数量，直接影响图表形态：
- bins 过少：分布过于粗糙，丢失细节
- bins 过多：噪声过多，难以看出整体趋势
- 经验法则：Sturges 公式 bins = log2(n) + 1，或 Freedman-Diaconis 公式

### 5.3 多分布对比

\\\`\\\`\\\`python
class_a = np.random.normal(75, 10, 500)
class_b = np.random.normal(80, 12, 500)

plt.hist(class_a, bins=30, alpha=0.5, label='A班', color='blue')
plt.hist(class_b, bins=30, alpha=0.5, label='B班', color='red')
plt.legend()
\\\`\\\`\\\`

## 第六节：图表元素美化

### 6.1 完整元素配置

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title('标题', fontsize=16, fontweight='bold', pad=20)  # pad 控制标题与图距离
plt.xlabel('X轴标签', fontsize=12, labelpad=10)
plt.ylabel('Y轴标签', fontsize=12, labelpad=10)
plt.xticks(fontsize=10, rotation=45)  # 旋转刻度标签
plt.yticks(fontsize=10)
plt.xlim(0, 100)  # 设置 X 轴范围
plt.ylim(0, 100)
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='best', frameon=True, shadow=True, fontsize=11)
plt.tight_layout()  # 自动调整子图间距
plt.savefig('output.png', dpi=300, bbox_inches='tight')  # 保存高清图
plt.show()
\\\`\\\`\\\`

### 6.2 中文显示问题

Matplotlib 默认不支持中文，需要配置字体：

\\\`\\\`\\\`python
plt.rcParams['font.sans-serif'] = ['SimHei']      # Windows 黑体
# plt.rcParams['font.sans-serif'] = ['Arial Unicode MS']  # macOS
plt.rcParams['axes.unicode_minus'] = False        # 解决负号显示问题
\\\`\\\`\\\`

## 第七节：实际应用案例

### 7.1 AI 模型训练过程可视化

在深度学习训练中，绘制 loss 曲线是必备操作：

\\\`\\\`\\\`python
import matplotlib.pyplot as plt

epochs = list(range(1, 51))
train_loss = [2.5 * np.exp(-0.08*e) + 0.1 for e in epochs]
val_loss = [2.5 * np.exp(-0.07*e) + 0.15 + 0.02*np.sin(e) for e in epochs]

plt.figure(figsize=(10, 6))
plt.plot(epochs, train_loss, 'b-', label='训练损失', linewidth=2)
plt.plot(epochs, val_loss, 'r-', label='验证损失', linewidth=2)
plt.axvline(x=30, color='gray', linestyle='--', alpha=0.5)
plt.text(31, 1.0, '可能开始过拟合', fontsize=11, color='gray')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('模型训练损失曲线', fontsize=14)
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
\\\`\\\`\\\`

## 总结

本章介绍了 Matplotlib 的核心概念和四种基础图表类型。要点回顾：

1. **理解架构**：Figure 是画框，Axes 是画布，掌握面向对象风格更利于复杂图表
2. **折线图**：展示趋势变化，适合时间序列数据
3. **散点图**：展示关系分布，可编码多维度信息
4. **柱状图**：比较类别大小，分组与堆叠各有用途
5. **直方图**：展示分布形态，bins 选择至关重要
6. **元素美化**：标题、标签、图例、网格共同构成专业图表

下一章我们将进入 Matplotlib 的高级主题，包括子图布局、双 Y 轴、注释标注等，让你的可视化能力更上一层楼。`,
    code: `# ============================================================
# Matplotlib 基础绘图演示
# 用纯 Python + ASCII 字符模拟可视化概念
# 真实项目中请使用 import matplotlib.pyplot as plt 进行实际绘图
# ============================================================

import math
import random

# ------------------------------------------------------------
# 工具函数：把数值映射到 ASCII 字符宽度
# ------------------------------------------------------------
def make_bar(value, max_value, width=40, fill_char='█', empty_char='░'):
    """根据数值生成 ASCII 柱状条"""
    if max_value <= 0:
        return empty_char * width
    filled = int(width * value / max_value)
    return fill_char * filled + empty_char * (width - filled)


def ascii_line_chart(data, title="折线图", height=15, width=60):
    """用 ASCII 字符绘制简易折线图"""
    print("\\n" + "=" * (width + 4))
    print(f"  {title}")
    print("=" * (width + 4))

    if not data:
        print("（无数据）")
        return

    values = [v for _, v in data]
    labels = [l for l, _ in data]
    vmin, vmax = min(values), max(values)
    vrange = vmax - vmin if vmax != vmin else 1

    # 把每个数据点映射到 height 个等级
    for row in range(height, 0, -1):
        threshold = vmin + vrange * (row - 1) / (height - 1)
        line = ""
        for v in values:
            if abs(v - threshold) < vrange / (height * 2):
                line += "●"   # 数据点
            elif v >= threshold:
                line += "│"   # 柱体
            else:
                line += " "
            line += " "
        # Y 轴刻度
        y_label = f"{threshold:6.2f} |"
        print(y_label + line)

    # X 轴
    print("       " + "-" * (len(values) * 2))
    print("       " + " ".join(f"{l:>2}" for l in labels))


# ============================================================
# 一、折线图演示：城市月平均气温变化
# ============================================================
print("\\n" + "▓" * 60)
print("▓  1. 折线图 Line Plot —— 城市月平均气温")
print("▓" * 60)

months = list(range(1, 13))
beijing_temps = [3, 5, 11, 17, 22, 27, 30, 29, 24, 18, 11, 5]
shanghai_temps = [7, 8, 12, 17, 22, 26, 30, 30, 26, 21, 15, 9]

month_data = [(f"{m}月", t) for m, t in zip(months, beijing_temps)]
ascii_line_chart(month_data, title="北京 2024 年月平均气温（°C）", height=12)

# 数值摘要
print("\\n数值摘要：")
print(f"  北京   最低 {min(beijing_temps):>2}°C  最高 {max(beijing_temps):>2}°C  年均 {sum(beijing_temps)/12:.1f}°C")
print(f"  上海   最低 {min(shanghai_temps):>2}°C  最高 {max(shanghai_temps):>2}°C  年均 {sum(shanghai_temps)/12:.1f}°C")
print("  对应 Matplotlib 调用：plt.plot(months, temps, 'r-o', label='北京')")


# ============================================================
# 二、散点图演示：学习时长 vs 考试成绩
# ============================================================
print("\\n" + "▓" * 60)
print("▓  2. 散点图 Scatter Plot —— 学习时长与考试成绩")
print("▓" * 60)

random.seed(42)
study_hours = [round(random.uniform(1, 10), 1) for _ in range(30)]
scores = [int(h * 8 + random.gauss(0, 5) + 40) for h in study_hours]

print("\\n  Y: 成绩")
print("  ↑")
# 把 50-120 分成 15 行
score_min, score_max = 40, 120
rows = 15
for r in range(rows, 0, -1):
    threshold = score_min + (score_max - score_min) * (r - 1) / (rows - 1)
    line_chars = []
    # X 轴：0-10 小时，分成 30 列
    for col in range(30):
        h_cell = 1 + col * 9 / 30
        # 找到该格子附近的点
        hit = False
        for h, s in zip(study_hours, scores):
            if abs(h - h_cell) < 0.5 and abs(s - threshold) < (score_max - score_min) / (rows * 2):
                hit = True
                break
        line_chars.append("●" if hit else " ")
    print(f"  {threshold:5.1f} |" + "".join(c + " " for c in line_chars))

print("        " + "-" * 60)
print("         " + "".join(f"{i:>3}" for i in range(1, 11)) + "  小时/周 →")

# 计算相关系数
n = len(study_hours)
mean_h = sum(study_hours) / n
mean_s = sum(scores) / n
cov = sum((h - mean_h) * (s - mean_s) for h, s in zip(study_hours, scores)) / n
std_h = math.sqrt(sum((h - mean_h) ** 2 for h in study_hours) / n)
std_s = math.sqrt(sum((s - mean_s) ** 2 for s in scores) / n)
corr = cov / (std_h * std_s) if std_h * std_s > 0 else 0
print(f"\\n  皮尔逊相关系数: r = {corr:.3f}（强正相关）")
print("  对应 Matplotlib 调用：plt.scatter(study_hours, scores, alpha=0.6)")


# ============================================================
# 三、柱状图演示：产品销售额对比
# ============================================================
print("\\n" + "▓" * 60)
print("▓  3. 柱状图 Bar Chart —— 各产品季度销售额")
print("▓" * 60)

products = ['产品A', '产品B', '产品C', '产品D', '产品E']
sales = [320, 480, 290, 550, 410]
max_sale = max(sales)

print()
for p, s in zip(products, sales):
    bar = make_bar(s, max_sale, width=35)
    pct = s / sum(sales) * 100
    print(f"  {p}  {bar} {s:>4}万 ({pct:4.1f}%)")

print()
print(f"  总销售额: {sum(sales)} 万元")
print(f"  最高: 产品D ({max(sales)}万)  最低: 产品C ({min(sales)}万)")
print("  对应 Matplotlib 调用：plt.bar(products, sales, color=colors)")

# 分组柱状图
print("\\n  --- 分组柱状图：三季度对比 ---")
print(f"  {'产品':<6}{'Q1':>8}{'Q2':>8}{'Q3':>8}")
q1 = [80, 95, 75, 110]
q2 = [90, 85, 95, 120]
q3 = [100, 105, 85, 130]
prod4 = products[:4]
max_q = max(q1 + q2 + q3)
for i, p in enumerate(prod4):
    print(f"  {p:<6}{make_bar(q1[i], max_q, 15)} {q1[i]:>3}  {make_bar(q2[i], max_q, 15)} {q2[i]:>3}  {make_bar(q3[i], max_q, 15)} {q3[i]:>3}")


# ============================================================
# 四、直方图演示：考试成绩分布
# ============================================================
print("\\n" + "▓" * 60)
print("▓  4. 直方图 Histogram —— 学生成绩分布")
print("▓" * 60)

random.seed(7)
# 生成 500 个正态分布成绩
all_scores = [max(0, min(100, int(random.gauss(75, 12)))) for _ in range(500)]

# 分箱：0-100 分成 10 个箱子
bins = list(range(0, 101, 10))
counts = [0] * (len(bins) - 1)
for s in all_scores:
    idx = min(s // 10, 9)
    counts[idx] += 1

max_count = max(counts)
print(f"\\n  样本数: {len(all_scores)}  均值: {sum(all_scores)/len(all_scores):.1f}  标准差: {math.sqrt(sum((x-75)**2 for x in all_scores)/len(all_scores)):.1f}")
print()
for i, c in enumerate(counts):
    bar = make_bar(c, max_count, width=40)
    print(f"  {bins[i]:>3}-{bins[i+1]:<3} |{bar}| {c:>4} 人 ({c/len(all_scores)*100:4.1f}%)")

# 画一个简化的钟形曲线示意
print("\\n  理论正态分布曲线示意：")
bell_height = 10
for row in range(bell_height, 0, -1):
    threshold = max_count * row / bell_height
    line = ""
    for c in counts:
        if c >= threshold:
            line += "▓▓"
        elif c >= threshold - max_count / bell_height / 2:
            line += "▒▒"
        else:
            line += "  "
    print("         " + line)

mean_v = sum(all_scores) / len(all_scores)
print(f"\\n  均值线: {mean_v:.1f} 分")
print("  对应 Matplotlib 调用：plt.hist(scores, bins=30, edgecolor='black')")
print("                     plt.axvline(mean, color='red', linestyle='--')")


# ============================================================
# 五、综合：训练损失曲线（AI 实战场景）
# ============================================================
print("\\n" + "▓" * 60)
print("▓  5. 综合应用 —— 深度学习训练 Loss 曲线")
print("▓" * 60)

epochs = list(range(1, 51))
train_loss = [2.5 * math.exp(-0.08 * e) + 0.1 + 0.01 * math.sin(e) for e in epochs]
val_loss = [2.5 * math.exp(-0.07 * e) + 0.15 + 0.03 * math.sin(e * 1.2) for e in epochs]

train_data = [(f"{e}", train_loss[e-1]) for e in epochs[::5]]
ascii_line_chart(train_data, title="训练损失 Loss（每 5 轮采样）", height=10, width=50)

print("\\n  关键节点：")
print(f"  Epoch  1: train={train_loss[0]:.3f}  val={val_loss[0]:.3f}")
print(f"  Epoch 10: train={train_loss[9]:.3f}  val={val_loss[9]:.3f}")
print(f"  Epoch 30: train={train_loss[29]:.3f}  val={val_loss[29]:.3f}  ← 可能开始过拟合")
print(f"  Epoch 50: train={train_loss[49]:.3f}  val={val_loss[49]:.3f}")

# 找到 val_loss 最低点
best_epoch = val_loss.index(min(val_loss)) + 1
print(f"\\n  验证集最低点: Epoch {best_epoch}, val_loss={min(val_loss):.3f}")
print("  建议：使用 early stopping 在该点停止训练")

print("\\n" + "=" * 60)
print("  本章演示完毕。真实开发中请使用 matplotlib 绘制高质量图表：")
print("    import matplotlib.pyplot as plt")
print("    fig, ax = plt.subplots(figsize=(10, 6))")
print("    ax.plot(epochs, train_loss, label='train')")
print("    ax.plot(epochs, val_loss, label='val')")
print("    ax.set_xlabel('Epoch'); ax.set_ylabel('Loss')")
print("    ax.legend(); ax.grid(True); plt.show()")
print("=" * 60)
`,
  },
  {
    id: "aipy-mpl-advanced",
    icon: "🎨",
    group: "数据可视化",
    title: "Matplotlib高级图表",
    content: `# Matplotlib高级图表

## 引言：从基础到高级的跨越

掌握了折线图、散点图、柱状图、直方图这四种基础图表后，你已经能够应对大部分日常可视化需求。但当面对复杂的数据分析任务时，单一图表往往力不从心。例如：

- 想在一张图里同时展示销售额和利润率（量纲不同），怎么办？
- 想对比四个不同模型的训练曲线，怎么布局最清晰？
- 想在图表上标注出关键事件发生的位置，怎么实现？
- 想让图表符合公司品牌视觉规范，怎么定制？

这些需求催生了 Matplotlib 的高级功能。本章将带你深入子图布局、双 Y 轴、注释标注、样式美化等高级主题，让你的可视化作品从"能用"升级到"专业"。

需要特别强调的是：高级不等于复杂。真正优秀的可视化是用最简洁的形式传达最丰富的信息。高级技巧是手段，清晰传达信息才是目的。我们要学会在"信息密度"和"视觉清晰"之间找到平衡点。

## 第一节：子图布局（Subplot Layout）

### 1.1 plt.subplot：最基础的子图

\\\`\\\`\\\`python
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 8))

# 2行2列的第1个子图
plt.subplot(2, 2, 1)
plt.plot([1, 2, 3], [1, 4, 9])
plt.title('子图1')

# 2行2列的第2个子图
plt.subplot(2, 2, 2)
plt.plot([1, 2, 3], [1, 2, 3])
plt.title('子图2')

plt.subplot(2, 2, 3)
plt.bar(['A', 'B', 'C'], [3, 5, 2])
plt.title('子图3')

plt.subplot(2, 2, 4)
plt.hist([1, 2, 2, 3, 3, 3, 4, 4, 5])
plt.title('子图4')

plt.tight_layout()
plt.show()
\\\`\\\`\\\`

subplot 的三个参数 (nrows, ncols, index) 表示：在 nrows × ncols 的网格中，激活第 index 个子图（从 1 开始计数）。

### 1.2 plt.subplots：面向对象的推荐方式

\\\`\\\`\\\`python
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
# axes 是 2x3 的 numpy 数组

for i in range(2):
    for j in range(3):
        axes[i, j].plot([1, 2, 3], [i+j, (i+j)*2, (i+j)*3])
        axes[i, j].set_title(f'Subplot [{i},{j}]')

plt.tight_layout()
plt.show()
\\\`\\\`\\\`

subplots 一次性创建 Figure 和所有 Axes，更简洁。注意 axes 的形状：1D 时（nrows=1 或 ncols=1）需要用 axes[0], axes[1]...；2D 时用 axes[i, j]。

### 1.3 GridSpec：灵活的非均匀布局

当子图大小不一致时，GridSpec 是最佳选择：

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec

fig = plt.figure(figsize=(12, 8))
gs = GridSpec(3, 3, figure=fig, hspace=0.4, wspace=0.3)

ax1 = fig.add_subplot(gs[0, :])       # 第一行，占满所有列
ax2 = fig.add_subplot(gs[1, :2])      # 第二行，前两列
ax3 = fig.add_subplot(gs[1:, 2])      # 第二三行，第三列
ax4 = fig.add_subplot(gs[2, 0])       # 第三行，第一列
ax5 = fig.add_subplot(gs[2, 1])       # 第三行，第二列

ax1.set_title('占满顶部的图')
ax2.set_title('左侧中等大小')
ax3.set_title('右侧高瘦')
ax4.set_title('左下小图')
ax5.set_title('中下小图')

plt.show()
\\\`\\\`\\\`

GridSpec 的切片语法与 numpy 数组一致，可以灵活组合出各种复杂布局。

### 1.4 子图共享坐标轴

\\\`\\\`\\\`python
fig, axes = plt.subplots(2, 2, figsize=(10, 8), sharex=True, sharey=True)
# sharex/sharey=True 让所有子图共享 X/Y 轴范围
# 避免重复刻度，节省空间
\\\`\\\`\\\`

## 第二节：双 Y 轴（Twin Axes）

### 2.1 为什么需要双 Y 轴

当两个数据序列量纲不同但需要对比趋势时，双 Y 轴是解决方案。例如：销售额（万元）和利润率（%）的趋势对比，温度（°C）和湿度（%）的关系。

### 2.2 twinx 实现双 Y 轴

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

months = np.arange(1, 13)
sales = [320, 350, 410, 480, 520, 580, 620, 600, 540, 470, 390, 450]
profit_rate = [12, 13, 14, 15, 16, 18, 19, 17, 15, 14, 12, 13]

fig, ax1 = plt.subplots(figsize=(12, 6))

color1 = 'tab:blue'
ax1.set_xlabel('月份')
ax1.set_ylabel('销售额（万元）', color=color1)
ax1.bar(months, sales, color=color1, alpha=0.6, label='销售额')
ax1.tick_params(axis='y', labelcolor=color1)

# 创建共享 X 轴的第二个 Axes
ax2 = ax1.twinx()
color2 = 'tab:red'
ax2.set_ylabel('利润率（%）', color=color2)
ax2.plot(months, profit_rate, color=color2, marker='o', linewidth=2, label='利润率')
ax2.tick_params(axis='y', labelcolor=color2)

# 合并图例
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')

plt.title('销售额与利润率月度趋势', fontsize=14)
plt.tight_layout()
plt.show()
\\\`\\\`\\\`

### 2.3 双 Y 轴的注意事项

- **慎用**：双 Y 轴容易误导读者，让人以为两个序列有因果关系
- **轴颜色区分**：左右轴用不同颜色，明确对应关系
- **不要超过两个**：三 Y 轴会让图表混乱不堪
- **考虑替代方案**：分面图（Facet）或两个独立子图往往更清晰

## 第三节：注释与标注（Annotation）

### 3.1 文本注释

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x) * np.exp(-x/5)

fig, ax = plt.subplots(figsize=(12, 6))
ax.plot(x, y, 'b-', linewidth=2)

# 找到最大值点
max_idx = np.argmax(y)
ax.plot(x[max_idx], y[max_idx], 'ro', markersize=12)

# annotate 添加注释
ax.annotate(f'最大值\\n({x[max_idx]:.2f}, {y[max_idx]:.2f})',
            xy=(x[max_idx], y[max_idx]),          # 箭头指向的点
            xytext=(x[max_idx]+1, y[max_idx]-0.1), # 文本位置
            fontsize=12,
            arrowprops=dict(arrowstyle='->', color='red', lw=2),
            bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.5))

ax.set_title('带注释的函数曲线', fontsize=14)
plt.show()
\\\`\\\`\\\`

### 3.2 annotate 关键参数

\\\`\\\`\\\`python
ax.annotate(text,            # 注释文本
            xy,              # 被注释的点坐标
            xytext,          # 文本位置
            arrowprops,      # 箭头样式字典
            bbox,            # 文本框样式
            fontsize,        # 字号
            color,           # 文字颜色
            ha, va)          # 水平/垂直对齐
\\\`\\\`\\\`

arrowprops 常用样式：
- arrowstyle：'->', '<-', '<->', 'fancy', 'simple', 'wedge'
- color：箭头颜色
- lw：线宽
- connectionstyle：'arc3,rad=0.3' 弧形箭头

### 3.3 标注关键事件

在时间序列图中标注重要事件是常见需求：

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np
import datetime

dates = [datetime.datetime(2024, 1, 1) + datetime.timedelta(days=i) for i in range(365)]
values = np.cumsum(np.random.randn(365)) + 100

fig, ax = plt.subplots(figsize=(14, 6))
ax.plot(dates, values, 'b-', linewidth=1.5)

# 标注关键事件
events = [
    (datetime.datetime(2024, 3, 15), '产品发布'),
    (datetime.datetime(2024, 7, 1), '夏季促销'),
    (datetime.datetime(2024, 11, 11), '双11大促'),
]

for date, label in events:
    idx = (date - dates[0]).days
    ax.axvline(x=date, color='red', linestyle='--', alpha=0.5)
    ax.annotate(label, xy=(date, values[idx]),
                xytext=(date, values[idx]+10),
                fontsize=10, ha='center',
                arrowprops=dict(arrowstyle='->', color='gray'))

ax.set_title('2024年产品销量与关键事件', fontsize=14)
plt.show()
\\\`\\\`\\\`

### 3.4 添加文本和水印

\\\`\\\`\\\`python
# 图内任意位置添加文本
ax.text(0.5, 0.95, '内部数据，请勿外传',
        transform=ax.transAxes, fontsize=14, color='red',
        ha='center', va='top', alpha=0.5)

# 添加水印
fig.text(0.5, 0.5, 'CONFIDENTIAL', fontsize=60, color='gray',
         ha='center', va='center', alpha=0.2, rotation=45,
         transform=fig.transFigure)
\\\`\\\`\\\`

注意 transform 参数：ax.transAxes 用 0~1 的相对坐标，ax.transData 用数据坐标，fig.transFigure 用 Figure 相对坐标。

## 第四节：样式美化

### 4.1 预设样式表

Matplotlib 内置了大量样式表，一键切换风格：

\\\`\\\`\\\`python
import matplotlib.pyplot as plt

# 查看所有可用样式
print(plt.style.available)
# ['seaborn-v0_8', 'ggplot', 'fivethirtyeight', 'dark_background',
#  'bmh', 'Solarize_Light2', 'classic', ...]

# 使用样式
plt.style.use('ggplot')
plt.plot([1, 2, 3], [4, 5, 6])
plt.show()

# 临时使用样式（不影响全局）
with plt.style.context('dark_background'):
    plt.plot([1, 2, 3], [4, 5, 6])
    plt.show()
\\\`\\\`\\\`

常用样式特点：
- **ggplot**：模仿 R 的 ggplot2，灰色背景，简约专业
- **seaborn-v0_8**：柔和配色，适合统计图
- **fivethirtyeight**：模仿 FiveThirtyEight 网站，明亮活泼
- **dark_background**：黑色背景，适合演示
- **bmh**：模仿 Bayesian Methods for Hackers 书籍风格

### 4.2 rcParams 全局配置

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import matplotlib as mpl

# 字体配置
mpl.rcParams['font.sans-serif'] = ['SimHei']
mpl.rcParams['axes.unicode_minus'] = False

# 图像配置
mpl.rcParams['figure.figsize'] = (10, 6)
mpl.rcParams['figure.dpi'] = 100
mpl.rcParams['savefig.dpi'] = 300

# 坐标轴配置
mpl.rcParams['axes.grid'] = True
mpl.rcParams['axes.axisbelow'] = True
mpl.rcParams['axes.labelsize'] = 12
mpl.rcParams['axes.titlesize'] = 14

# 线条配置
mpl.rcParams['lines.linewidth'] = 2
mpl.rcParams['lines.markersize'] = 6

# 网格配置
mpl.rcParams['grid.alpha'] = 0.3
mpl.rcParams['grid.linestyle'] = '--'
\\\`\\\`\\\`

### 4.3 自定义颜色循环

\\\`\\\`\\\`python
# 自定义多条线的颜色循环
custom_colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
mpl.rcParams['axes.prop_cycle'] = mpl.cycler(color=custom_colors)
\\\`\\\`\\\`

### 4.4 颜色映射（Colormap）

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np

# 内置 colormap
cmaps = ['viridis', 'plasma', 'inferno', 'magma', 'cividis',  # 顺序型
         'coolwarm', 'RdBu', 'seismic',                         # 发散型
         'Set1', 'Set2', 'Set3', 'tab10']                       # 分类型

# 在散点图中使用
x = np.random.rand(100)
y = np.random.rand(100)
colors = np.random.rand(100)

plt.scatter(x, y, c=colors, cmap='viridis')
plt.colorbar(label='数值')
plt.show()

# 创建自定义 colormap
from matplotlib.colors import LinearSegmentedColormap
colors_list = ['#FF6B6B', '#FFE66D', '#4ECDC4']
custom_cmap = LinearSegmentedColormap.from_list('custom', colors_list)
\\\`\\\`\\\`

选择 colormap 的原则：
- **顺序型**（viridis）：表达有序数据，如温度、海拔
- **发散型**（coolwarm）：表达有正负的数据，如相关系数、变化量
- **分类型**（Set1）：表达无序类别
- **感知均匀**（viridis 系列）：避免误导，色盲友好

## 第五节：高级技巧汇总

### 5.1 双对数坐标

\\\`\\\`\\\`python
import numpy as np
x = np.logspace(0, 5, 100)
y = x ** 2

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

ax1.plot(x, y)
ax1.set_title('线性坐标')

ax2.plot(x, y)
ax2.set_xscale('log')
ax2.set_yscale('log')
ax2.set_title('双对数坐标')

plt.show()
\\\`\\\`\\\`

对数坐标适合展示跨多个数量级的数据，例如机器学习中的学习率搜索、人口增长等。

### 5.2 极坐标图

\\\`\\\`\\\`python
import numpy as np
theta = np.linspace(0, 2*np.pi, 100)
r = np.sin(2*theta)

fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.plot(theta, r)
plt.show()
\\\`\\\`\\\`

极坐标适合展示方向性数据，如风向玫瑰图、雷达图。

### 5.3 颜色填充与等高线

\\\`\\\`\\\`python
import numpy as np

x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(X) * np.cos(Y)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 等高线图
cs = axes[0].contour(X, Y, Z, 20, cmap='RdYlBu')
axes[0].clabel(cs, inline=True, fontsize=8)
axes[0].set_title('等高线图')

# 填充等高线
cs = axes[1].contourf(X, Y, Z, 20, cmap='RdYlBu')
plt.colorbar(cs, ax=axes[1])
axes[1].set_title('填充等高线')

plt.show()
\\\`\\\`\\\`

### 5.4 3D 绘图

\\\`\\\`\\\`python
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

ax.scatter(X, Y, Z, c=Z, cmap='viridis')
ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z')
plt.show()
\\\`\\\`\\\`

## 第六节：综合案例——多维度分析报告

\\\`\\\`\\\`python
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec

plt.style.use('seaborn-v0_8')
fig = plt.figure(figsize=(16, 10))
gs = GridSpec(3, 3, figure=fig, hspace=0.4, wspace=0.3)

# 1. 顶部：销售额趋势（双 Y 轴）
ax1 = fig.add_subplot(gs[0, :])
months = range(1, 13)
sales = np.cumsum(np.random.randn(12)*30 + 50) + 500
profit = sales * 0.15 + np.random.randn(12)*5
ax1.bar(months, sales, alpha=0.5, label='销售额')
ax1b = ax1.twinx()
ax1b.plot(months, profit, 'r-o', label='利润')
ax1.set_title('销售与利润月度趋势', fontsize=12)

# 2. 左中：产品分布饼图
ax2 = fig.add_subplot(gs[1, 0])
ax2.pie([30, 25, 20, 15, 10], labels=list('ABCDE'), autopct='%1.1f%%')
ax2.set_title('产品销售占比')

# 3. 中中：用户年龄分布
ax3 = fig.add_subplot(gs[1, 1])
ages = np.random.normal(35, 10, 1000)
ax3.hist(ages, bins=30, color='skyblue', edgecolor='black')
ax3.set_title('用户年龄分布')

# 4. 右中：地区对比
ax4 = fig.add_subplot(gs[1, 2])
regions = ['华北', '华东', '华南', '西部', '东北']
values = [320, 480, 410, 250, 180]
ax4.barh(regions, values, color='#4ECDC4')
ax4.set_title('地区销售对比')

# 5. 底部：相关性散点图
ax5 = fig.add_subplot(gs[2, :])
x = np.random.rand(100) * 100
y = x * 0.6 + np.random.randn(100) * 10 + 20
ax5.scatter(x, y, alpha=0.6, c=x, cmap='viridis')
ax5.set_title('客单价与购买频次关系')

plt.suptitle('2024 Q3 销售数据分析报告', fontsize=16, fontweight='bold', y=1.01)
plt.show()
\\\`\\\`\\\`

## 总结

本章深入探讨了 Matplotlib 的高级功能：

1. **子图布局**：subplot 适合简单场景，subplots 推荐用于规范布局，GridSpec 用于复杂非均匀布局
2. **双 Y 轴**：twinx 实现量纲不同的双序列对比，但需谨慎使用避免误导
3. **注释标注**：annotate + axvline 是标注关键事件的利器，transform 参数控制坐标系
4. **样式美化**：style.use 一键切换风格，rcParams 全局定制，colormap 选择要匹配数据类型
5. **高级技巧**：对数坐标、极坐标、3D 绘图、等高线图扩展了表达维度
6. **综合应用**：多维度分析报告是高级技巧的集大成，体现专业可视化能力

掌握这些高级技巧后，你已经能够制作出媲美专业报告的可视化作品。下一章我们将学习 Seaborn，它在统计可视化方面比 Matplotlib 更高效、更美观。`,
    code: `# ============================================================
# Matplotlib 高级图表概念演示
# 用纯 Python + ASCII 模拟子图布局、双Y轴、注释、样式等概念
# ============================================================

import math

# ------------------------------------------------------------
# 工具函数
# ------------------------------------------------------------
def ascii_bar(value, max_value, width=30, fill='█', empty='░'):
    if max_value <= 0:
        return empty * width
    filled = int(width * value / max_value)
    return fill * filled + empty * (width - filled)


def divider(title, width=70):
    print("\\n" + "═" * width)
    print(f"  {title}")
    print("═" * width)


# ============================================================
# 一、子图布局演示（2x2 网格）
# ============================================================
divider("1. 子图布局 Subplot Layout —— 2×2 网格模拟")

print("""
┌──────────────────────────┬──────────────────────────┐
│  Subplot (2,2,1)         │  Subplot (2,2,2)         │
│  折线图：销售趋势         │  柱状图：产品对比         │
│                          │                          │
│     ●──●                 │   ▓                      │
│    ╱     ╲●              │   ▓  ▓                   │
│   ╱        ╲             │   ▓  ▓  ▓                │
│  ●           ●           │   ▓  ▓  ▓  ▓             │
│                          │                          │
├──────────────────────────┼──────────────────────────┤
│  Subplot (2,2,3)         │  Subplot (2,2,4)         │
│  直方图：年龄分布         │  散点图：相关性           │
│                          │                          │
│       ▓▓                 │                  ●       │
│     ▓▓▓▓                 │            ●  ●          │
│   ▓▓▓▓▓▓                 │        ●  ●              │
│ ▓▓▓▓▓▓▓▓▓▓               │    ●                     │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
""")

print("对应 Matplotlib 调用：")
print("  fig, axes = plt.subplots(2, 2, figsize=(12, 8))")
print("  axes[0,0].plot(months, sales)    # 左上")
print("  axes[0,1].bar(products, values)  # 右上")
print("  axes[1,0].hist(ages, bins=20)    # 左下")
print("  axes[1,1].scatter(x, y)          # 右下")
print("  plt.tight_layout()               # 自动调整间距")


# ============================================================
# 二、GridSpec 不规则布局演示
# ============================================================
divider("2. GridSpec 不规则布局演示")

print("""
┌──────────────────────────────────────────┐
│  ax1: gs[0, :]  占满顶部（销售趋势大图）  │
│                                          │
├─────────────────────────┬────────────────┤
│  ax2: gs[1, :2]         │  ax3: gs[1:, 2]│
│  左侧中等（柱状图）       │  右侧高瘦       │
│                         │  （折线图）     │
├───────────┬─────────────┤                │
│ ax4:      │ ax5:        │                │
│ gs[2,0]   │ gs[2,1]     │                │
│ 小饼图     │ 小直方图     │                │
└───────────┴─────────────┴────────────────┘
""")

print("对应代码：")
print("  from matplotlib.gridspec import GridSpec")
print("  gs = GridSpec(3, 3, figure=fig)")
print("  ax1 = fig.add_subplot(gs[0, :])    # 第一行整行")
print("  ax2 = fig.add_subplot(gs[1, :2])   # 第二行前两列")
print("  ax3 = fig.add_subplot(gs[1:, 2])   # 右侧两行")
print("  ax4 = fig.add_subplot(gs[2, 0])    # 左下小图")
print("  ax5 = fig.add_subplot(gs[2, 1])    # 中下小图")


# ============================================================
# 三、双 Y 轴演示
# ============================================================
divider("3. 双 Y 轴 Twin Axes —— 销售额与利润率")

months = list(range(1, 13))
sales = [320, 350, 410, 480, 520, 580, 620, 600, 540, 470, 390, 450]
profit_rate = [12, 13, 14, 15, 16, 18, 19, 17, 15, 14, 12, 13]

max_sales = max(sales)
max_rate = max(profit_rate)

print(f"""
  销售额(万元) ←│←───────────→ 利润率(%)
                │
    650 ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ 20""")
for i in range(11, -1, -1):
    m = i + 1
    s = sales[i]
    r = profit_rate[i]
    # 销售额柱状
    s_bar = ascii_bar(s, max_sales, width=25, fill='▓', empty=' ')
    # 利润率标记位置
    r_pos = int(35 * r / max_rate)
    line = " " * (25 + 6 + r_pos) + "●"
    print(f"    {s:>3} │{s_bar}│{line}  {r}%")
print("""    0   └─────────────────────────┘
         1  2  3  4  5  6  7  8  9  10 11 12  月份
         ▓ 柱状：销售额     ● 折线：利润率""")

print("\\n对应代码：")
print("  fig, ax1 = plt.subplots()")
print("  ax1.bar(months, sales, color='blue', alpha=0.6)")
print("  ax2 = ax1.twinx()  # 关键：创建共享 X 轴的第二个 Axes")
print("  ax2.plot(months, profit_rate, 'r-o')")
print("  # 合并图例：")
print("  lines1, labels1 = ax1.get_legend_handles_labels()")
print("  lines2, labels2 = ax2.get_legend_handles_labels()")
print("  ax1.legend(lines1+lines2, labels1+labels2)")


# ============================================================
# 四、注释与标注演示
# ============================================================
divider("4. 注释与标注 Annotation")

# 模拟一个带峰值标注的曲线
print("""
  Loss 曲线带关键点标注：

  2.5 │●                                   ★ 最大下降点
      │ ╲                                 ╱│
  2.0 │  ╲                              ╱  │
      │   ╲                           ╱    │
  1.5 │    ╲                        ╱      │
      │     ╲                   ╱●         │ ← Early Stop
  1.0 │      ╲                ╱            │   候选点
      │       ╲            ╱               │
  0.5 │        ╲─────────╱                 │
      │                                     │
  0.0 └─────────────────────────────────────┘
       0    10    20    30    40    50    Epoch""")

print("\\n对应代码：")
print("  ax.annotate('最大下降点',")
print("      xy=(15, 1.8),              # 箭头指向的点")
print("      xytext=(20, 2.2),          # 文本位置")
print("      arrowprops=dict(arrowstyle='->', color='red'),")
print("      bbox=dict(boxstyle='round', fc='yellow', alpha=0.5))")
print("  ax.axvline(x=30, color='gray', linestyle='--')  # 垂直线标注事件")


# ============================================================
# 五、样式表对比演示
# ============================================================
divider("5. 样式表 Stylesheet 对比")

styles = {
    'default':       {'bg': '白', 'grid': '无', 'color': '蓝', 'desc': '默认朴素'},
    'ggplot':        {'bg': '灰', 'grid': '白', 'color': '红', 'desc': '类R风格'},
    'seaborn':       {'bg': '浅灰', 'grid': '白', 'color': '蓝', 'desc': '柔和统计风'},
    'fivethirtyeight': {'bg': '白', 'grid': '灰', 'color': '蓝', 'desc': '新闻网站风'},
    'dark_background': {'bg': '黑', 'grid': '灰', 'color': '青', 'desc': '暗色演示风'},
}

print(f"\\n  {'样式名':<20} {'背景':<8} {'网格':<6} {'主色':<6} {'特点':<15}")
print("  " + "-" * 60)
for name, info in styles.items():
    print(f"  {name:<20} {info['bg']:<8} {info['grid']:<6} {info['color']:<6} {info['desc']:<15}")

print("\\n对应代码：")
print("  plt.style.use('ggplot')              # 全局切换")
print("  with plt.style.context('dark_background'):")
print("      plt.plot(...)                    # 临时切换")


# ============================================================
# 六、Colormap 类别演示
# ============================================================
divider("6. Colormap 颜色映射类别")

print("""
  ┌─────────────────────────────────────────────────────────┐
  │ 顺序型 Sequential（适合有序数据：温度、海拔）              │
  │  viridis:  ████░░░░▓▓▓▓████  暗紫→黄绿                  │
  │  plasma:   ████░░▒▒▓▓████████  暗紫→黄                   │
  │  cool:     ░░░░▒▒▓▓████        青→蓝                    │
  ├─────────────────────────────────────────────────────────┤
  │ 发散型 Diverging（适合有正负：相关系数、变化量）           │
  │  coolwarm: ▓▓▓▒▒░░▒▒▓▓▓       蓝→白→红                 │
  │  RdBu:     ▓▓▓▒▒░░▒▒▓▓▓       红→白→蓝                 │
  │  seismic:  ███▒▒░░▒▒███       深红→白→深蓝              │
  ├─────────────────────────────────────────────────────────┤
  │ 分类型 Categorical（适合无序类别）                        │
  │  Set1:     ●  ●  ●  ●  ●  ●  红蓝绿橙紫黄                │
  │  tab10:    ●  ●  ●  ●  ●  ●  十种鲜明对比色              │
  └─────────────────────────────────────────────────────────┘
""")
print("  选择原则：感知均匀 > 彩虹色，色盲友好 > 个人喜好")


# ============================================================
# 七、3D 与极坐标演示
# ============================================================
divider("7. 高级坐标系：3D 与极坐标")

print("""
  3D 散点图：                       极坐标图：
       Z                             90°
        ╲                            ╱  ╲
         ●●●                      ╱      ╲
       ●●●●●                  180°──●──0°
      ●●●●●●●                    ╲  ╱
     ╱       ╲                     ╲╱
   X ───────── Y                  270°

  对应代码：
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(X, Y, Z, c=Z, cmap='viridis')

    fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
    ax.plot(theta, r)""")


# ============================================================
# 八、综合分析报告布局
# ============================================================
divider("8. 综合分析报告布局示例")

print("""
╔══════════════════════════════════════════════════════════╗
║        2024 Q3 销售数据分析报告（综合布局）                ║
╠══════════════════════════════════════════════════════════╣
║  [1] 顶部全宽：销售&利润双Y轴趋势图                       ║
║  ┌──────────────────────────────────────────────────┐    ║
║  │ ▓▓ ▓▓▓ ▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓▓                │    ║
║  │     ╲╲╲   ╲╲    ╲╲     ╲╲╲     ╲╲╲╲  ●─●─●─●     │    ║
║  └──────────────────────────────────────────────────┘    ║
╟──────────────┬──────────────┬───────────────────────────╢
║ [2] 饼图     │ [3] 直方图    │ [4] 横向柱状图            ║
║  产品占比    │  用户年龄     │  地区销售对比              ║
║   ┌──┐       │               │                           ║
║   │A │       │     ▓▓        │ 华东 ▓▓▓▓▓▓▓▓▓▓ 480     ║
║   │B │       │   ▓▓▓▓▓       │ 华南 ▓▓▓▓▓▓▓▓ 410       ║
║   │C │       │ ▓▓▓▓▓▓▓▓▓     │ 华北 ▓▓▓▓▓▓ 320         ║
║   └──┘       │               │ 西部 ▓▓▓▓ 250            ║
╟──────────────┴──────────────┴───────────────────────────╢
║  [5] 底部全宽：散点图（带颜色映射）                       ║
║  ┌──────────────────────────────────────────────────┐    ║
║  │              ●  ●                               │    ║
║  │         ●  ●       ●                           │    ║
║  │    ●                ●  ●                       │    ║
║  │ ●                                                 │    ║
║  └──────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════╝
""")

print("关键技巧：")
print("  1. GridSpec(3, 3) 创建非均匀网格")
print("  2. 顶部和底部子图跨多列：gs[0, :] 和 gs[2, :]")
print("  3. 双 Y 轴：ax.twinx()")
print("  4. 颜色映射：scatter(c=values, cmap='viridis')")
print("  5. suptitle() 添加总标题")
print("  6. tight_layout() 防止重叠")

print("\\n" + "=" * 70)
print("  本章演示完毕。所有 ASCII 图表在真实环境中均可用 Matplotlib 实现。")
print("  关键 import：")
print("    import matplotlib.pyplot as plt")
print("    from matplotlib.gridspec import GridSpec")
print("    from mpl_toolkits.mplot3d import Axes3D")
print("=" * 70)
`,
  },
  {
    id: "aipy-seaborn",
    icon: "🌊",
    group: "数据可视化",
    title: "Seaborn统计可视化",
    content: `# Seaborn统计可视化

## 引言：为什么需要 Seaborn

在数据科学和机器学习工作流中，统计可视化是数据探索阶段的核心任务。Matplotlib 虽然强大，但在统计图表方面存在几个痛点：

1. **代码冗长**：画一个带回归线的散点图，Matplotlib 需要先画散点，再算回归，再画线，几十行代码
2. **默认样式朴素**：需要大量手动调整才能达到专业水准
3. **与 Pandas 集成弱**：每次都要从 DataFrame 提取 Series，繁琐
4. **统计计算缺失**：没有内置的密度估计、置信区间、统计检验可视化

Seaborn 正是为解决这些问题而生。它由 Michael Waskom 创建，名字来自 Samuel L. Jackson 在《Star Wars》中饰演的角色...其实不是，是来自一个名为 "Sam Seaborn" 的电视剧角色。Seaborn 建立在 Matplotlib 之上，提供：

- **统计图表专用 API**：一行代码完成复杂统计可视化
- **美观默认样式**：开箱即用的专业配色和布局
- **Pandas 深度集成**：直接使用列名作为绘图参数
- **统计计算内置**：自动计算密度、回归、置信区间

在 AI 开发中，Seaborn 是数据探索的瑞士军刀。当你拿到一份新数据，第一步往往就是用 Seaborn 画几个分布图、相关性热力图，快速理解数据特征。

## 第一节：Seaborn基础

### 1.1 安装与导入

\\\`\\\`\\\`python
pip install seaborn

import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# 设置主题（一次设置，全局生效）
sns.set_theme(style='whitegrid', palette='Set2', font='SimHei')
\\\`\\\`\\\`

### 1.2 内置数据集

Seaborn 内置了多个经典数据集，方便学习和演示：

\\\`\\\`\\\`python
# 查看可用数据集
print(sns.get_dataset_names())
# ['tips', 'iris', 'titanic', 'flights', 'penguins', 'diamonds', ...]

# 加载数据集
tips = sns.load_dataset('tips')
iris = sns.load_dataset('iris')
penguins = sns.load_dataset('penguins')

print(tips.head())
#    total_bill   tip     sex smoker  day    time  size
# 0       16.99  1.01  Female     No  Sun  Dinner     2
# 1       10.34  1.66    Male     No  Sun  Dinner     3
# ...
\\\`\\\`\\\`

### 1.3 Seaborn 的 API 分类

Seaborn 的 API 分为三个层次：

**Figure-level 接口**（推荐）：
- relplot()：关系图（折线、散点）
- displot()：分布图（直方图、KDE、ECDF）
- catplot()：分类图（箱线图、小提琴图、条形图）
- lmplot()：回归图
- jointplot()：联合图
- pairplot()：成对图

**Axes-level 接口**：
- scatterplot, lineplot
- histplot, kdeplot, ecdfplot, rugplot
- boxplot, violinplot, barplot, pointplot, stripplot, swarmplot
- regplot, residplot
- heatmap

**Figure-level vs Axes-level**：
- Figure-level 返回 FacetGrid 对象，支持子图分面
- Axes-level 返回 Axes 对象，更易嵌入 Matplotlib 子图
- 推荐使用 Figure-level，更现代、更灵活

## 第二节：分布图（Distribution Plot）

### 2.1 直方图 histplot

\\\`\\\`\\\`python
tips = sns.load_dataset('tips')

plt.figure(figsize=(10, 6))
sns.histplot(data=tips, x='total_bill', bins=30, kde=True, color='skyblue')
plt.title('账单金额分布', fontsize=14)
plt.show()
\\\`\\\`\\\`

kde=True 自动叠加核密度估计曲线，是 Seaborn 相对 Matplotlib 的明显优势。

### 2.2 KDE 核密度估计图

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
sns.kdeplot(data=tips, x='total_bill', hue='time', fill=True, alpha=0.5)
plt.title('不同时段账单金额密度分布')
plt.show()
\\\`\\\`\\\`

hue 参数按类别着色，是 Seaborn 最常用的参数之一。

### 2.3 分组分布对比

\\\`\\\`\\\`python
# 用 displot 创建分面图
sns.displot(data=tips, x='total_bill', col='time', hue='smoker',
            kind='kde', fill=True, height=5, aspect=1.2)
plt.show()
\\\`\\\`\\\`

col 参数按列分面，row 按行分面，可以快速探索多维度数据。

### 2.4 ECDF 经验累积分布

\\\`\\\`\\\`python
sns.ecdfplot(data=tips, x='total_bill', hue='time')
# 累积分布更适合比较中位数和分位数
\\\`\\\`\\\`

ECDF 不像直方图那样依赖 bins 选择，更客观地展示分布。

### 2.5 rugplot 地毯图

\\\`\\\`\\\`python
sns.kdeplot(data=tips, x='total_bill')
sns.rugplot(data=tips, x='total_bill', color='red', height=0.05)
# 在 X 轴上画细线标记每个数据点位置
\\\`\\\`\\\`

rugplot 显示原始数据点，与 KDE 配合能完整展示分布信息。

## 第三节：关系图（Relational Plot）

### 3.1 散点图 scatterplot

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
sns.scatterplot(data=tips, x='total_bill', y='tip',
                hue='time',          # 颜色编码
                style='smoker',      # 标记形状编码
                size='size',         # 点大小编码
                sizes=(20, 200),     # 大小范围
                alpha=0.7)
plt.title('账单金额与小费关系')
plt.show()
\\\`\\\`\\\`

一行代码完成四维数据展示，这是 Matplotlib 需要几十行才能实现的效果。

### 3.2 relplot 分面散点图

\\\`\\\`\\\`python
sns.relplot(data=tips, x='total_bill', y='tip',
            hue='smoker', col='time', row='sex',
            kind='scatter', height=4, aspect=1.2)
plt.show()
\\\`\\\`\\\`

col 和 row 组合可以创建 2D 分面网格，最多能展示 5-6 维数据。

### 3.3 折线图 lineplot

\\\`\\\`\\\`python
flights = sns.load_dataset('flights')

plt.figure(figsize=(12, 6))
sns.lineplot(data=flights, x='year', y='passengers',
             hue='month', style='month', markers=True)
plt.title('各月份航空乘客数年度趋势')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.show()
\\\`\\\`\\\`

lineplot 会自动计算重复 x 值的均值和置信区间，非常适合分组时序数据。

### 3.4 鸢尾花数据集分析

\\\`\\\`\\\`python
iris = sns.load_dataset('iris')

# 4 维散点图
plt.figure(figsize=(10, 8))
sns.scatterplot(data=iris, x='sepal_length', y='sepal_width',
                hue='species', style='species', s=80)
plt.title('鸢尾花萼片长宽关系')
plt.show()
\\\`\\\`\\\`

## 第四节：热力图（Heatmap）

### 4.1 相关性热力图

热力图是数据科学中最常用的图表之一，特别适合展示相关性矩阵：

\\\`\\\`\\\`python
import seaborn as sns
import matplotlib.pyplot as plt

# 加载房价数据
tips = sns.load_dataset('tips')
# 只选数值列
numeric_tips = tips.select_dtypes(include=['float64', 'int64'])
corr = numeric_tips.corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr, annot=True, cmap='coolwarm', center=0,
            square=True, linewidths=0.5, fmt='.2f',
            cbar_kws={'shrink': 0.8})
plt.title('特征相关性矩阵')
plt.show()
\\\`\\\`\\\`

参数详解：
- annot=True：在格子里显示数值
- cmap='coolwarm'：发散型 colormap，红正蓝负
- center=0：以 0 为中心，正负色彩对比
- square=True：单元格正方形
- linewidths：格子间距
- fmt：数值格式

### 4.2 透视表热力图

\\\`\\\`\\\`python
flights = sns.load_dataset('flights')
flights_pivot = flights.pivot(index='month', columns='year', values='passengers')

plt.figure(figsize=(12, 8))
sns.heatmap(flights_pivot, annot=True, fmt='d',
            cmap='YlOrRd', cbar_kws={'label': '乘客数'})
plt.title('1949-1960年各月份航空乘客数')
plt.show()
\\\`\\\`\\\`

### 4.3 聚类热力图 clustermap

\\\`\\\`\\\`python
# 自动对行列聚类，重新排序
sns.clustermap(flights_pivot, cmap='YlOrRd', standard_scale=1,
               figsize=(12, 10))
plt.show()
\\\`\\\`\\\`

clustermap 自动对行列进行层次聚类，能发现数据中的潜在分组模式。

### 4.4 相关性分析实战

\\\`\\\`\\\`python
import pandas as pd
import numpy as np

# 模拟多特征数据
np.random.seed(42)
data = pd.DataFrame({
    'feature_1': np.random.randn(100),
    'feature_2': np.random.randn(100),
    'feature_3': np.random.randn(100),
    'target': np.random.randn(100),
})
data['feature_2'] = data['feature_1'] * 0.8 + np.random.randn(100) * 0.3
data['target'] = data['feature_1'] * 0.5 + data['feature_3'] * 0.3 + np.random.randn(100) * 0.2

corr = data.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))  # 上三角掩码

plt.figure(figsize=(8, 6))
sns.heatmap(corr, mask=mask, annot=True, cmap='coolwarm',
            center=0, square=True, linewidths=0.5)
plt.title('特征相关性（下三角）')
plt.show()
\\\`\\\`\\\`

mask 参数可以隐藏部分格子，常用于只显示相关性矩阵的下三角。

## 第五节：成对图 pairplot

### 5.1 基本 pairplot

pairplot 是探索多变量数据的神器，自动绘制所有数值列两两之间的关系：

\\\`\\\`\\\`python
iris = sns.load_dataset('iris')

sns.pairplot(iris, hue='species', diag_kind='kde', height=2.5)
plt.show()
\\\`\\\`\\\`

参数说明：
- hue：按类别着色
- diag_kind='kde'：对角线用 KDE 而非直方图
- kind='scatter'/'kde'/'hist'/'reg'：非对角线图类型
- height：每个子图的大小
- palette：颜色方案

### 5.2 带回归线的 pairplot

\\\`\\\`\\\`python
sns.pairplot(iris, hue='species', kind='reg', diag_kind='kde',
             plot_kws={'scatter_kws': {'alpha': 0.5}})
plt.show()
\\\`\\\`\\\`

### 5.3 选择性绘制

\\\`\\\`\\\`python
# 只绘制指定列
sns.pairplot(iris, vars=['sepal_length', 'sepal_width'],
             hue='species', height=4)

# 用 x_vars 和 y_vars 绘制非对称网格
sns.pairplot(iris, x_vars=['sepal_length', 'sepal_width'],
             y_vars=['petal_length', 'petal_width'],
             hue='species', height=4)
\\\`\\\`\\\`

### 5.4 PairGrid 自定义

\\\`\\\`\\\`python
g = sns.PairGrid(iris, hue='species')
g.map_upper(sns.scatterplot)        # 上三角：散点图
g.map_lower(sns.kdeplot, fill=True) # 下三角：KDE
g.map_diag(sns.histplot, kde=True)  # 对角线：直方图
g.add_legend()
plt.show()
\\\`\\\`\\\`

PairGrid 比 pairplot 更灵活，可以为不同位置指定不同类型的图。

## 第六节：统计回归图

### 6.1 regplot 回归图

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
sns.regplot(data=tips, x='total_bill', y='tip',
            scatter_kws={'alpha': 0.5, 'color': 'blue'},
            line_kws={'color': 'red'})
plt.title('账单金额与小费的回归关系')
plt.show()
\\\`\\\`\\\`

regplot 自动拟合线性回归并绘制回归线和 95% 置信区间。

### 6.2 lmplot 分面回归

\\\`\\\`\\\`python
sns.lmplot(data=tips, x='total_bill', y='tip',
           hue='smoker', col='time', row='sex',
           height=4, aspect=1.2)
plt.show()
\\\`\\\`\\\`

lmplot 是 Figure-level 版本的 regplot，支持分面。

### 6.3 residplot 残差图

\\\`\\\`\\\`python
sns.residplot(data=tips, x='total_bill', y='tip',
              scatter_kws={'alpha': 0.5})
# 残差图用于检查回归假设是否满足
# 如果残差随机分布在 0 附近，说明线性模型合适
\\\`\\\`\\\`

### 6.4 多项式回归

\\\`\\\`\\\`python
sns.regplot(data=tips, x='total_bill', y='tip',
            order=2,  # 二次多项式
            scatter_kws={'alpha': 0.5})
\\\`\\\`\\\`

order 参数指定多项式阶数，order=1 是线性回归。

### 6.5 logistic 回归

\\\`\\\`\\\`python
# 当 y 是二元变量时
tips['big_tip'] = (tips['tip'] / tips['total_bill']) > 0.15
sns.lmplot(data=tips, x='total_bill', y='big_tip',
           logistic=True, y_jitter=0.03)
\\\`\\\`\\\`

logistic=True 自动拟合逻辑回归，适合二元分类问题。

## 第七节：分类图 Categorical Plot

### 7.1 箱线图 boxplot

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
sns.boxplot(data=tips, x='day', y='total_bill', hue='time',
            palette='Set2')
plt.title('各天账单金额分布')
plt.show()
\\\`\\\`\\\`

### 7.2 小提琴图 violinplot

\\\`\\\`\\\`python
plt.figure(figsize=(10, 6))
sns.violinplot(data=tips, x='day', y='total_bill',
               hue='time', split=True, inner='quartile')
plt.title('各天账单金额分布（小提琴图）')
plt.show()
\\\`\\\`\\\`

小提琴图结合了箱线图和 KDE，能展示分布的完整形态。

### 7.3 条形图 barplot

\\\`\\\`\\\`python
sns.barplot(data=tips, x='day', y='total_bill',
            hue='time', errorbar='ci', palette='muted')
# 自动计算均值和 95% 置信区间
\\\`\\\`\\\`

### 7.4 pointplot

\\\`\\\`\\\`python
sns.pointplot(data=tips, x='day', y='total_bill', hue='time',
              markers=['o', 's'], linestyles=['-', '--'])
# 适合展示交互效应
\\\`\\\`\\\`

### 7.5 swarmplot 蜂群图

\\\`\\\`\\\`python
sns.swarmplot(data=tips, x='day', y='total_bill',
              hue='time', dodge=True, size=4)
# 不重叠的散点图，展示每个数据点
\\\`\\\`\\\`

### 7.6 catplot 统一接口

\\\`\\\`\\\`python
# kind 参数切换不同类型
sns.catplot(data=tips, x='day', y='total_bill', hue='time',
            kind='box', col='sex', height=4)
# kind 可选: strip, swarm, box, violin, boxen, point, bar, count
\\\`\\\`\\\`

## 第八节：联合分布图 jointplot

\\\`\\\`\\\`python
# 基本 jointplot
sns.jointplot(data=tips, x='total_bill', y='tip', kind='scatter')
plt.show()

# 带 KDE 的 jointplot
sns.jointplot(data=tips, x='total_bill', y='tip', kind='kde', fill=True)
plt.show()

# 带 regression 的 jointplot
sns.jointplot(data=tips, x='total_bill', y='tip', kind='reg')
plt.show()

# hexbin 图
sns.jointplot(data=tips, x='total_bill', y='tip', kind='hex', color='purple')
\\\`\\\`\\\`

jointplot 同时展示两变量的联合分布和边缘分布，是探索性数据分析的利器。

## 第九节：实战案例——AI数据探索

### 9.1 特征工程前的可视化

\\\`\\\`\\\`python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# 模拟机器学习数据集
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'age': np.random.normal(35, 10, n).clip(18, 70),
    'income': np.random.lognormal(10.5, 0.5, n),
    'score': np.random.normal(600, 100, n).clip(300, 850),
    'usage': np.random.exponential(20, n),
    'churn': np.random.choice([0, 1], n, p=[0.7, 0.3])
})

# 1. 查看整体分布
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
sns.histplot(df['age'], kde=True, ax=axes[0,0])
sns.histplot(df['income'], kde=True, ax=axes[0,1])
sns.histplot(df['score'], kde=True, ax=axes[1,0])
sns.histplot(df['usage'], kde=True, ax=axes[1,1])
plt.tight_layout()
plt.show()

# 2. 相关性分析
plt.figure(figsize=(8, 6))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm', center=0)
plt.show()

# 3. 按目标变量分组
sns.pairplot(df, hue='churn', vars=['age', 'income', 'score', 'usage'])
plt.show()
\\\`\\\`\\\`

## 总结

本章系统介绍了 Seaborn 的核心功能：

1. **API 分层**：Figure-level 接口（relplot/displot/catplot）更现代、更灵活
2. **分布图**：histplot + kdeplot 完整展示分布形态，rugplot 显示原始数据
3. **关系图**：scatterplot 一行实现四维可视化，lineplot 自动计算置信区间
4. **热力图**：相关性矩阵标配，clustermap 自动聚类发现模式
5. **pairplot**：多变量探索神器，PairGrid 提供完全自定义能力
6. **回归图**：regplot/lmplot 自动拟合回归线和置信区间
7. **分类图**：boxplot/violinplot/swarmplot 各有侧重，catplot 统一接口
8. **jointplot**：联合分布与边缘分布一体化展示

Seaborn 的核心价值在于"用最少的代码画出最专业的统计图"。在 AI 项目的数据探索阶段，它能让你的分析效率提升数倍。下一章我们将学习 Plotly，掌握交互式可视化的能力。`,
    code: `# ============================================================
# Seaborn 统计可视化概念演示
# 用纯 Python 模拟分布图、热力图、pairplot、回归图等概念
# 真实开发中：import seaborn as sns
# ============================================================

import math
import random
from collections import Counter

random.seed(42)


def divider(title, width=72):
    print("\\n" + "═" * width)
    print(f"  {title}")
    print("═" * width)


def ascii_hist(values, bins=20, width=50, fill='▓', empty='░'):
    """绘制 ASCII 直方图"""
    vmin, vmax = min(values), max(values)
    if vmin == vmax:
        vmax = vmin + 1
    bin_size = (vmax - vmin) / bins
    counts = [0] * bins
    for v in values:
        idx = min(int((v - vmin) / bin_size), bins - 1)
        counts[idx] += 1
    max_count = max(counts) if counts else 1
    print(f"  范围: [{vmin:.2f}, {vmax:.2f}]  样本数: {len(values)}")
    print(f"  均值: {sum(values)/len(values):.2f}  标准差: {math.sqrt(sum((x-sum(values)/len(values))**2 for x in values)/len(values)):.2f}")
    print()
    for i, c in enumerate(counts):
        lo = vmin + i * bin_size
        hi = lo + bin_size
        bar_len = int(width * c / max_count)
        bar = fill * bar_len + empty * (width - bar_len)
        print(f"  {lo:6.2f}-{hi:6.2f} |{bar}| {c}")
    return counts


# ============================================================
# 一、分布图 Distribution Plot
# ============================================================
divider("1. 分布图 —— 账单金额直方图 + KDE 概念")

# 模拟 tips 数据
total_bills = [round(random.gauss(20, 8), 2) for _ in range(200)]
total_bills = [max(3, min(50, x)) for x in total_bills]

print("\\n  ▓ = 直方图柱子    ◆ = KDE 核密度估计曲线（概念示意）")
counts = ascii_hist(total_bills, bins=15, width=40)

# 简化的 KDE 曲线示意
print("\\n  KDE 曲线（核密度估计）叠加示意：")
max_c = max(counts)
for row in range(12, 0, -1):
    threshold = max_c * row / 12
    line = ""
    for c in counts:
        # 模拟平滑的密度曲线
        if c >= threshold:
            line += "▓▓"
        elif c >= threshold - max_c * 0.15:
            line += "◆◆"
        else:
            line += "  "
    print("         " + line)
print("         " + "─" * 30)

print("\\n  对应 Seaborn 代码：")
print("    sns.histplot(data=tips, x='total_bill', bins=30, kde=True)")
print("    sns.kdeplot(data=tips, x='total_bill', hue='time', fill=True)")


# ============================================================
# 二、分组分布对比
# ============================================================
divider("2. 分组分布对比 —— 按时段(Lunch/Dinner)分")

lunch = [round(random.gauss(17, 5), 2) for _ in range(80)]
dinner = [round(random.gauss(22, 8), 2) for _ in range(120)]

print(f"\\n  午餐时段: 样本={len(lunch)}  均值={sum(lunch)/len(lunch):.2f}  标准差={math.sqrt(sum((x-sum(lunch)/len(lunch))**2 for x in lunch)/len(lunch)):.2f}")
print(f"  晚餐时段: 样本={len(dinner)}  均值={sum(dinner)/len(dinner):.2f}  标准差={math.sqrt(sum((x-sum(dinner)/len(dinner))**2 for x in dinner)/len(dinner)):.2f}")

# 把两组合并到统一 bins
all_vals = lunch + dinner
vmin, vmax = min(all_vals), max(all_vals)
bins = 12
bin_size = (vmax - vmin) / bins
l_counts = [0] * bins
d_counts = [0] * bins
for v in lunch:
    idx = min(int((v - vmin) / bin_size), bins - 1)
    l_counts[idx] += 1
for v in dinner:
    idx = min(int((v - vmin) / bin_size), bins - 1)
    d_counts[idx] += 1
max_c = max(max(l_counts), max(d_counts))

print(f"\\n  {'区间':<14} {'午餐':<8} {'晚餐':<8}  分布对比")
print("  " + "-" * 60)
for i in range(bins):
    lo = vmin + i * bin_size
    hi = lo + bin_size
    l_bar = '▓' * int(20 * l_counts[i] / max_c)
    d_bar = '░' * int(20 * d_counts[i] / max_c)
    print(f"  {lo:5.1f}-{hi:5.1f}  {l_counts[i]:<8} {d_counts[i]:<8}  {l_bar}│{d_bar}")

print("\\n  对应代码：")
print("    sns.histplot(data=tips, x='total_bill', hue='time',")
print("                 stat='density', common_norm=False, alpha=0.5)")


# ============================================================
# 三、相关性热力图
# ============================================================
divider("3. 相关性热力图 Heatmap")

# 模拟特征数据
n = 200
f1 = [random.gauss(0, 1) for _ in range(n)]
f2 = [f1[i] * 0.8 + random.gauss(0, 0.3) for i in range(n)]  # 与 f1 强相关
f3 = [random.gauss(0, 1) for _ in range(n)]                   # 独立
f4 = [f1[i] * 0.5 + f3[i] * 0.3 + random.gauss(0, 0.2) for i in range(n)]

features = {'F1': f1, 'F2': f2, 'F3': f3, 'F4': f4}
feat_names = list(features.keys())

# 计算相关系数矩阵
def pearson(x, y):
    n = len(x)
    mx, my = sum(x)/n, sum(y)/n
    cov = sum((x[i]-mx)*(y[i]-my) for i in range(n)) / n
    sx = math.sqrt(sum((xi-mx)**2 for xi in x) / n)
    sy = math.sqrt(sum((yi-my)**2 for yi in y) / n)
    return cov / (sx * sy) if sx * sy > 0 else 0

print("\\n  相关性矩阵：")
print("  " + "       " + "  ".join(f"{n:>5}" for n in feat_names))
corr_matrix = []
for i, n1 in enumerate(feat_names):
    row = []
    for j, n2 in enumerate(feat_names):
        r = pearson(features[n1], features[n2])
        row.append(r)
    corr_matrix.append(row)
    # 根据相关系数选择颜色字符
    cells = []
    for j, r in enumerate(row):
        if r > 0.7: cells.append("  ▓▓▓")    # 强正
        elif r > 0.3: cells.append("  ▒▒▒")
        elif r > -0.3: cells.append("  ░░░")  # 弱
        elif r > -0.7: cells.append("  ▒▒▒")
        else: cells.append("  ▓▓▓")          # 强负
    print(f"  {n1:>5} |" + "│".join(f"{r:>5.2f}" for r in row) + " |")

print("""
  颜色图例：
    ▓▓▓  强相关 (|r| > 0.7)     红/深蓝
    ▒▒▒  中等相关 (0.3 < |r| < 0.7)  浅红/浅蓝
    ░░░  弱相关 (|r| < 0.3)     白色""")

print("\\n  对应代码：")
print("    corr = df.corr()")
print("    sns.heatmap(corr, annot=True, cmap='coolwarm', center=0,")
print("                square=True, linewidths=0.5, fmt='.2f')")


# ============================================================
# 四、pairplot 成对图概念
# ============================================================
divider("4. pairplot 成对图 —— 多变量两两关系")

print("""
  pairplot 自动绘制 N×N 网格，展示所有数值列两两关系：

         F1          F2          F3          F4
     ┌──────────┬──────────┬──────────┬──────────┐
  F1 │ ▓▓▓ hist │ ● scatter│ ● scatter│ ● scatter│
     │          │     ●    │    ●     │  ●       │
     ├──────────┼──────────┼──────────┼──────────┤
  F2 │ ● scatter│ ▓▓▓ hist │ ● scatter│ ● scatter│
     │     ●    │          │   ●      │    ●     │
     ├──────────┼──────────┼──────────┼──────────┤
  F3 │ ● scatter│ ● scatter│ ▓▓▓ hist │ ● scatter│
     │    ●     │   ●      │          │ ●        │
     ├──────────┼──────────┼──────────┼──────────┤
  F4 │ ● scatter│ ● scatter│ ● scatter│ ▓▓▓ hist │
     │  ●       │    ●     │ ●        │          │
     └──────────┴──────────┴──────────┴──────────┘

  - 对角线：单变量分布（直方图或 KDE）
  - 非对角线：两变量散点图（或 KDE、回归线）
  - hue 参数：按类别着色，自动分组""")

# 显示实际相关性
print("\\n  实际计算的相关系数：")
for i, n1 in enumerate(feat_names):
    for j, n2 in enumerate(feat_names):
        if i < j:
            r = corr_matrix[i][j]
            strength = "强" if abs(r) > 0.7 else ("中等" if abs(r) > 0.3 else "弱")
            print(f"    {n1} ↔ {n2}: r = {r:+.3f}  ({strength}相关)")

print("\\n  对应代码：")
print("    sns.pairplot(df, hue='target', diag_kind='kde')")
print("    # 或更灵活的 PairGrid：")
print("    g = sns.PairGrid(df, hue='target')")
print("    g.map_upper(sns.scatterplot)")
print("    g.map_lower(sns.kdeplot, fill=True)")
print("    g.map_diag(sns.histplot, kde=True)")


# ============================================================
# 五、回归图
# ============================================================
divider("5. 统计回归图 regplot / lmplot")

# 生成带噪声的线性关系
x_vals = [random.uniform(5, 50) for _ in range(100)]
y_vals = [0.1 * x + random.gauss(0, 0.8) + 2 for x in x_vals]

# 简单线性回归
n = len(x_vals)
mx, my = sum(x_vals)/n, sum(y_vals)/n
slope = sum((x_vals[i]-mx)*(y_vals[i]-my) for i in range(n)) / sum((x-mx)**2 for x in x_vals)
intercept = my - slope * mx
print(f"\\n  线性回归: y = {slope:.3f}x + {intercept:.3f}")

# 计算 R²
y_pred = [slope*x + intercept for x in x_vals]
ss_res = sum((y_vals[i] - y_pred[i])**2 for i in range(n))
ss_tot = sum((y - my)**2 for y in y_vals)
r_squared = 1 - ss_res / ss_tot
print(f"  R² = {r_squared:.3f}")

# ASCII 散点 + 回归线
print("\\n  散点图 + 回归线（● = 数据点，━━ = 回归线，┄┄ = 置信区间）：")
y_min, y_max = min(y_vals), max(y_vals)
rows = 15
for row in range(rows, 0, -1):
    threshold = y_min + (y_max - y_min) * (row - 1) / (rows - 1)
    line_chars = []
    for col in range(40):
        x_cell = 5 + col * 45 / 40
        # 找点
        hit = False
        for x, y in zip(x_vals, y_vals):
            if abs(x - x_cell) < 1.0 and abs(y - threshold) < (y_max - y_min) / (rows * 2):
                hit = True
                break
        # 回归线
        y_reg = slope * x_cell + intercept
        if abs(y_reg - threshold) < (y_max - y_min) / (rows * 2):
            line_chars.append("━")
        elif hit:
            line_chars.append("●")
        else:
            line_chars.append(" ")
    print(f"  {threshold:5.2f} |" + "".join(line_chars))

print("        └" + "─" * 40)
print("         " + "5" + " " * 18 + "25" + " " * 18 + "50  total_bill")

print("\\n  对应代码：")
print("    sns.regplot(data=tips, x='total_bill', y='tip',")
print("                scatter_kws={'alpha': 0.5},")
print("                line_kws={'color': 'red'})")
print("    # 分面回归：")
print("    sns.lmplot(data=tips, x='total_bill', y='tip',")
print("               hue='smoker', col='time')")


# ============================================================
# 六、分类图：箱线图 vs 小提琴图
# ============================================================
divider("6. 分类图 —— 箱线图 vs 小提琴图概念")

days = ['Thur', 'Fri', 'Sat', 'Sun']
day_data = {d: [random.gauss(20 + i*2, 5 + i*0.5) for _ in range(40)] for i, d in enumerate(days)}

print("\\n  各天账单金额分布对比：")
print(f"  {'日期':<6} {'样本':<6} {'均值':<8} {'中位数':<8} {'Q1':<8} {'Q3':<8} {'最小':<8} {'最大':<8}")
print("  " + "-" * 64)
for d in days:
    vals = sorted(day_data[d])
    n_d = len(vals)
    mean_v = sum(vals)/n_d
    median = vals[n_d//2]
    q1 = vals[n_d//4]
    q3 = vals[3*n_d//4]
    print(f"  {d:<6} {n_d:<6} {mean_v:<8.2f} {median:<8.2f} {q1:<8.2f} {q3:<8.2f} {min(vals):<8.2f} {max(vals):<8.2f}")

print("""
  箱线图示意：
                   ┌─────────┐
            ───────┤         ├───────
                   └────┬────┘
                        │
              最小      Q1   中位   Q3      最大
              └── 箱体表示中间50%数据 ──┘

  小提琴图示意（结合箱线图+KDE）：
              ╲    ╱
               ╲  ╱
              ╱││╲        ← 宽度表示该位置数据密度
             ╱ ││ ╲
            ╱  ││  ╲       比箱线图更完整地展示分布形态
             ╲ ││ ╱
              ╲││╱
               ╱╲""")

print("  对应代码：")
print("    sns.boxplot(data=tips, x='day', y='total_bill', hue='time')")
print("    sns.violinplot(data=tips, x='day', y='total_bill', split=True)")
print("    sns.swarmplot(data=tips, x='day', y='total_bill', dodge=True)")


# ============================================================
# 七、联合分布图 jointplot
# ============================================================
divider("7. 联合分布图 jointplot")

print("""
  jointplot 同时展示两变量的联合分布与边缘分布：

       ┌──────────────────────────────┐
       │                              │
   Y   │         ●  ●                │  ← 右侧：
   分  │      ●     ●     ●          │     Y 的边缘分布
   布  │   ●              ●          │     （KDE 或直方图）
       │ ●                         ●│
       │                              │
       ├──────────────────────────────┤
       │                              │
       │     底部：X 的边缘分布         │
       │     ▓▓▓▓▒▒▒░░░               │
       └──────────────────────────────┘
                   X

  kind 参数：
    'scatter'  散点（默认）
    'kde'      二维 KDE
    'reg'      带 regression
    'hex'      六边形分箱""")

print("\\n  对应代码：")
print("    sns.jointplot(data=tips, x='total_bill', y='tip', kind='reg')")
print("    sns.jointplot(data=tips, x='total_bill', y='tip', kind='kde', fill=True)")


# ============================================================
# 八、AI 数据探索实战流程
# ============================================================
divider("8. AI 数据探索实战流程示例")

print("""
  典型机器学习数据探索流程：

  Step 1: 整体分布检查
    ┌────────────────────────────────┐
    │ sns.histplot / kdeplot          │
    │ 检查：偏态、双峰、异常值         │
    └───────────────┬────────────────┘
                    ↓
  Step 2: 相关性分析
    ┌────────────────────────────────┐
    │ sns.heatmap(df.corr())          │
    │ 发现：哪些特征与目标强相关       │
    │      哪些特征之间存在共线性      │
    └───────────────┬────────────────┘
                    ↓
  Step 3: 多变量关系
    ┌────────────────────────────────┐
    │ sns.pairplot(df, hue='target')  │
    │ 观察：特征组合的分类能力         │
    │      是否存在非线性关系          │
    └───────────────┬────────────────┘
                    ↓
  Step 4: 分组对比
    ┌────────────────────────────────┐
    │ sns.boxplot / violinplot        │
    │ 比较：不同类别下的特征分布差异   │
    └───────────────┬────────────────┘
                    ↓
  Step 5: 回归关系
    ┌────────────────────────────────┐
    │ sns.lmplot / regplot            │
    │ 验证：线性假设是否合理           │
    │      是否需要多项式或变换        │
    └────────────────────────────────┘""")

print("\\n" + "=" * 72)
print("  本章演示完毕。Seaborn 的核心价值：")
print("    '用最少的代码画出最专业的统计图'")
print("  真实开发中：")
print("    import seaborn as sns")
print("    sns.set_theme(style='whitegrid')")
print("    sns.histplot(data=df, x='col', kde=True, hue='category')")
print("=" * 72)
`,
  },
  {
    id: "aipy-plotly",
    icon: "🌐",
    group: "数据可视化",
    title: "Plotly交互式图表",
    content: `# Plotly交互式图表

## 引言：静态图表的局限与交互式的崛起

在前两章中，我们学习了 Matplotlib 和 Seaborn，它们能产出高质量的静态图表。但在数据探索和成果展示中，静态图表存在明显局限：

- **无法缩放**：当数据点密集时，看不清细节
- **无法悬停**：想知道某个点的精确数值，只能靠估测
- **无法筛选**：想临时隐藏某条曲线，只能重新画图
- **无法旋转**：3D 数据只能看一个固定视角
- **无法分享**：图表是图片，交互信息丢失

Plotly 的出现彻底改变了这一局面。它是一个基于 JavaScript 的交互式可视化库，但提供了完整的 Python 接口。用 Plotly 生成的图表：

- **可缩放**：鼠标滚轮放大缩小
- **可悬停**：鼠标移到数据点上显示详细数值
- **可筛选**：点击图例隐藏/显示数据系列
- **可旋转**：3D 图可以任意角度旋转
- **可分享**：导出为 HTML，保留完整交互性

在 AI 开发中，Plotly 的应用场景包括：模型训练过程的实时监控 Dashboard、特征重要性交互式分析、3D 嵌入可视化（如 t-SNE、UMAP 结果展示）、预测结果交互式探索等。

Plotly 生态系统包含几个关键组件：
- **plotly.py**：Python 接口
- **plotly.js**：底层 JavaScript 引擎
- **Dash**：基于 Plotly 的 Web 应用框架
- **Chart Studio**：在线图表编辑平台

## 第一节：Plotly基础

### 1.1 安装与导入

\\\`\\\`\\\`python
pip install plotly dash

import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.io as pio
\\\`\\\`\\\`

Plotly 提供两种 API 风格：

**plotly.express（高级 API，推荐入门）**：
- 简洁、易用，一行代码出图
- 与 Pandas 深度集成
- 适合快速探索

**plotly.graph_objects（低级 API）**：
- 完全控制每个细节
- 适合复杂定制
- 简称 go

### 1.2 第一个 Plotly 图表

\\\`\\\`\\\`python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'month': ['1月', '2月', '3月', '4月', '5月', '6月'],
    'sales': [320, 350, 410, 480, 520, 580]
})

fig = px.line(df, x='month', y='sales', title='月度销售趋势',
              template='plotly_white', markers=True)
fig.show()
\\\`\\\`\\\`

fig.show() 会在浏览器中打开交互式图表。在 Jupyter Notebook 中直接内嵌显示。

### 1.3 主题模板

\\\`\\\`\\\`python
# 内置模板
templates = ['plotly', 'plotly_white', 'plotly_dark',
             'ggplot2', 'seaborn', 'simple_white', 'presentation']

# 设置默认模板
pio.templates.default = 'plotly_white'
\\\`\\\`\\\`

### 1.4 输出与保存

\\\`\\\`\\\`python
# 显示
fig.show()

# 保存为 HTML（保留交互性）
fig.write_html('chart.html')

# 保存为静态图片（需要 kaleido 包）
fig.write_image('chart.png', width=1200, height=600, scale=2)
fig.write_image('chart.pdf')

# 保存为 JSON
fig.write_json('chart.json')
\\\`\\\`\\\`

## 第二节：交互式折线图

### 2.1 多曲线折线图

\\\`\\\`\\\`python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'month': list(range(1, 13)) * 3,
    'temp': [3, 5, 11, 17, 22, 27, 30, 29, 24, 18, 11, 5,
             7, 8, 12, 17, 22, 26, 30, 30, 26, 21, 15, 9,
             14, 15, 18, 22, 26, 28, 30, 30, 29, 26, 21, 16],
    'city': ['北京']*12 + ['上海']*12 + ['广州']*12
})

fig = px.line(df, x='month', y='temp', color='city',
              title='三城市气温对比',
              labels={'temp': '气温 (°C)', 'month': '月份'},
              markers=True,
              template='plotly_white')

# 自定义悬停
fig.update_traces(hovertemplate='城市: %{customdata[0]}<br>月份: %{x}<br>气温: %{y}°C')
fig.update_layout(hovermode='x unified')  # 鼠标悬停时显示所有曲线的值
fig.show()
\\\`\\\`\\\`

### 2.2 范围选择器与按钮

\\\`\\\`\\\`python
import plotly.graph_objects as go
import pandas as pd
import numpy as np

# 生成时序数据
dates = pd.date_range('2024-01-01', '2024-12-31', freq='D')
values = np.cumsum(np.random.randn(len(dates))) + 100

fig = go.Figure()
fig.add_trace(go.Scatter(x=dates, y=values, mode='lines', name='value'))

# 添加范围选择器
fig.update_xaxes(
    rangeslider_visible=True,
    rangeselector=dict(
        buttons=list([
            dict(count=7, label='1周', step='day', stepmode='backward'),
            dict(count=1, label='1月', step='month', stepmode='backward'),
            dict(count=3, label='3月', step='month', stepmode='backward'),
            dict(count=6, label='6月', step='month', stepmode='backward'),
            dict(label='全部', step='all')
        ])
    )
)
fig.show()
\\\`\\\`\\\`

这是 Plotly 的杀手级功能，特别适合金融数据、传感器数据等长时序数据的探索。

### 2.3 自定义悬停信息

\\\`\\\`\\\`python
import plotly.express as px

df = px.data.gapminder().query("country=='China'")

fig = px.line(df, x='year', y='gdpPercap', title='中国人均GDP')

# 自定义悬停模板
fig.update_traces(
    hovertemplate='<b>%{x}年</b><br>'
                  '人均GDP: $%{y:,.2f}<br>'
                  '<extra></extra>'  # 隐藏默认的 trace 名
)

# 添加注释
fig.add_annotation(
    x=2000, y=df[df.year==2000]['gdpPercap'].values[0],
    text='加入WTO',
    showarrow=True, arrowhead=1,
    font=dict(size=12)
)
fig.show()
\\\`\\\`\\\`

## 第三节：3D 可视化

### 3.1 3D 散点图

\\\`\\\`\\\`python
import plotly.express as px

df = px.data.iris()

fig = px.scatter_3d(df, x='sepal_length', y='sepal_width', z='petal_length',
                    color='species', size='petal_width',
                    title='鸢尾花三维可视化',
                    opacity=0.7)
fig.update_layout(scene=dict(
    xaxis_title='萼片长度',
    yaxis_title='萼片宽度',
    zaxis_title='花瓣长度'
))
fig.show()
\\\`\\\`\\\`

3D 散点图可以旋转、缩放，是探索高维数据的利器。在 AI 中常用于展示 t-SNE、UMAP、PCA 降维后的结果。

### 3.2 3D 曲面图

\\\`\\\`\\\`python
import plotly.graph_objects as go
import numpy as np

# 生成数据
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig = go.Figure(data=[go.Surface(z=Z, x=X, y=Y, colorscale='Viridis')])
fig.update_layout(title='3D 曲面图', autosize=False,
                  width=800, height=600,
                  scene=dict(zaxis_title='Z'))
fig.show()
\\\`\\\`\\\`

3D 曲面图常用于展示损失函数的landscape、模型预测的概率面等。

### 3.3 3D 线图

\\\`\\\`\\\`python
import plotly.graph_objects as go
import numpy as np

# 螺旋线
t = np.linspace(0, 20, 200)
x, y, z = np.cos(t), np.sin(t), t

fig = go.Figure(data=go.Scatter3d(
    x=x, y=y, z=z,
    mode='lines',
    line=dict(color=z, colorscale='Viridis', width=8),
    marker=dict(size=2)
))
fig.show()
\\\`\\\`\\\`

### 3.4 3D Mesh 与等值面

\\\`\\\`\\\`python
# 用于展示 3D 物体或体数据
fig = go.Figure(data=go.Mesh3d(
    x=[0, 1, 2, 0], y=[0, 0, 1, 2], z=[0, 1, 0, 1],
    color='lightpink', opacity=0.5
))
fig.show()
\\\`\\\`\\\`

## 第四节：动画图（Animation）

### 4.1 基础动画图

\\\`\\\`\\\`python
import plotly.express as px

df = px.data.gapminder()
# 包含年份、国家、GDP、寿命、人口等

fig = px.scatter(df, x='gdpPercap', y='lifeExp',
                 animation_frame='year',    # 时间轴
                 animation_group='country', # 实体标识
                 size='pop', color='continent',
                 hover_name='country',
                 log_x=True, size_max=55,
                 range_x=[100, 100000], range_y=[25, 90],
                 title='世界各国GDP与寿命演变')
fig.show()
\\\`\\\`\\\`

这是经典的 Gapminder 动画图，Hans Rosling 用它震撼了世界。animation_frame 指定时间维度，Plotly 会自动生成播放控件。

### 4.2 自定义动画

\\\`\\\`\\\`python
import plotly.graph_objects as go
import numpy as np

# 多帧数据
frames = []
for t in np.linspace(0, 2*np.pi, 30):
    x = np.linspace(0, 10, 100)
    y = np.sin(x + t)
    frames.append(go.Frame(data=[go.Scatter(x=x, y=y, mode='lines')]))

fig = go.Figure(
    data=[go.Scatter(x=np.linspace(0, 10, 100), y=np.sin(np.linspace(0, 10, 100)), mode='lines')],
    frames=frames
)

# 添加播放按钮
fig.update_layout(
    updatemenus=[dict(type='buttons',
                      buttons=[dict(label='播放', method='animate',
                                    args=[None, dict(frame=dict(duration=100), fromcurrent=True)])])]
)
fig.show()
\\\`\\\`\\\`

### 4.3 训练过程动画

在深度学习中，可以用动画展示模型训练过程：

\\\`\\\`\\\`python
import plotly.graph_objects as go
import numpy as np
from plotly.subplots import make_subplots

# 模拟训练过程
epochs = list(range(1, 51))
losses = [2.5 * np.exp(-0.08*e) + 0.1 + np.random.randn()*0.05 for e in epochs]

frames = []
for i in range(1, len(epochs)+1):
    frames.append(go.Frame(
        data=[go.Scatter(x=epochs[:i], y=losses[:i], mode='lines+markers')],
        layout=go.Layout(title_text=f'Epoch {i}/{len(epochs)}')
    ))

fig = go.Figure(
    data=[go.Scatter(x=[], y=[], mode='lines+markers')],
    layout=go.Layout(title='模型训练过程', xaxis=dict(range=[0, 51]), yaxis=dict(range=[0, 3])),
    frames=frames
)
fig.show()
\\\`\\\`\\\`

## 第五节：子图布局

### 5.1 make_subplots

\\\`\\\`\\\`python
from plotly.subplots import make_subplots
import plotly.graph_objects as go

fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=('折线图', '柱状图', '散点图', '饼图'),
    specs=[[{'type': 'xy'}, {'type': 'xy'}],
           [{'type': 'xy'}, {'type': 'domain'}]],  # 饼图用 domain
    vertical_spacing=0.15, horizontal_spacing=0.1
)

fig.add_trace(go.Scatter(y=[1, 3, 2, 4], mode='lines'), row=1, col=1)
fig.add_trace(go.Bar(x=['A', 'B', 'C'], y=[3, 5, 2]), row=1, col=2)
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[4, 3, 5], mode='markers'), row=2, col=1)
fig.add_trace(go.Pie(labels=['A', 'B', 'C'], values=[30, 40, 30]), row=2, col=2)

fig.update_layout(height=600, width=800, title_text='多类型子图')
fig.show()
\\\`\\\`\\\`

### 5.2 共享 X 轴的子图

\\\`\\\`\\\`python
fig = make_subplots(rows=3, cols=1, shared_xaxes=True,
                    vertical_spacing=0.05,
                    subplot_titles=('价格', '成交量', 'RSI'))

fig.add_trace(go.Scatter(x=dates, y=prices), row=1, col=1)
fig.add_trace(go.Bar(x=dates, y=volumes), row=2, col=1)
fig.add_trace(go.Scatter(x=dates, y=rsi), row=3, col=1)

fig.update_layout(height=800, title='股票多维数据')
fig.show()
\\\`\\\`\\\`

### 5.3 双 Y 轴

\\\`\\\`\\\`python
from plotly.subplots import make_subplots

fig = make_subplots(specs=[[{'secondary_y': True}]])
fig.add_trace(go.Bar(x=months, y=sales, name='销售额'), secondary_y=False)
fig.add_trace(go.Scatter(x=months, y=profit_rate, name='利润率'), secondary_y=True)

fig.update_yaxes(title_text='销售额（万元）', secondary_y=False)
fig.update_yaxes(title_text='利润率（%）', secondary_y=True)
fig.show()
\\\`\\\`\\\`

## 第六节：高级图表类型

### 6.1 饼图与环形图

\\\`\\\`\\\`python
import plotly.express as px

df = px.data.tips()
fig = px.pie(df, values='total_bill', names='day',
             title='各天销售额占比',
             hole=0.4)  # hole>0 时变成环形图
fig.update_traces(textinfo='label+percent+value', textposition='outside')
fig.show()
\\\`\\\`\\\`

### 6.2 树状图 Treemap

\\\`\\\`\\\`python
df = px.data.tips()
fig = px.treemap(df, path=['day', 'time', 'sex'], values='total_bill',
                 color='total_bill', color_continuous_scale='RdYlGn')
fig.show()
\\\`\\\`\\\`

### 6.3 桑基图 Sankey

\\\`\\\`\\\`python
import plotly.graph_objects as go

fig = go.Figure(data=[go.Sankey(
    node=dict(label=['用户访问', '首页', '商品页', '购物车', '支付', '离开'],
              color=['blue', 'green', 'green', 'orange', 'red', 'gray']),
    link=dict(
        source=[0, 0, 1, 1, 2, 2, 3],
        target=[1, 5, 2, 5, 3, 5, 4],
        value=[100, 20, 60, 20, 40, 20, 30]
    )
)])
fig.show()
\\\`\\\`\\\`

桑基图适合展示流量转化、能源流动等数据。

### 6.4 地理可视化

\\\`\\\`\\\`python
import plotly.express as px

df = px.data.gapminder().query('year == 2007')

fig = px.scatter_geo(df, locations='iso_alpha', color='continent',
                     size='pop', hover_name='country',
                     projection='natural earth',
                     title='2007年世界人口分布')
fig.show()

# 地图 choropleth
fig = px.choropleth(df, locations='iso_alpha', color='gdpPercap',
                    color_continuous_scale='Viridis',
                    title='2007年各国人均GDP')
fig.show()
\\\`\\\`\\\`

### 6.5 雷达图

\\\`\\\`\\\`python
import plotly.graph_objects as go

categories = ['速度', '力量', '技巧', '智力', '防御', '敏捷']
fig = go.Figure()
fig.add_trace(go.Scatterpolar(r=[90, 80, 70, 60, 85, 75], theta=categories,
                              fill='toself', name='角色A'))
fig.add_trace(go.Scatterpolar(r=[60, 95, 80, 70, 70, 90], theta=categories,
                              fill='toself', name='角色B'))
fig.show()
\\\`\\\`\\\`

### 6.6 小提琴图与箱线图组合

\\\`\\\`\\\`python
import plotly.express as px
df = px.data.tips()
fig = px.violin(df, y='total_bill', x='day', color='sex',
                box=True, points='all', hover_data=df.columns)
fig.show()
\\\`\\\`\\\`

## 第七节：Dash 构建 Dashboard

### 7.1 Dash 应用结构

\\\`\\\`\\\`python
import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd

app = dash.Dash(__name__)

# 加载数据
df = px.data.gapminder()

# 布局
app.layout = html.Div([
    html.H1('国家发展数据探索', style={'textAlign': 'center'}),

    dcc.Dropdown(
        id='continent-dropdown',
        options=[{'label': c, 'value': c} for c in df['continent'].unique()],
        value='Asia',
        style={'width': '50%'}
    ),

    dcc.Graph(id='life-gdp-graph'),

    dcc.Slider(
        id='year-slider',
        min=df['year'].min(), max=df['year'].max(),
        value=2007, marks={str(y): str(y) for y in range(1952, 2008, 5)}
    )
])

# 回调
@app.callback(
    Output('life-gdp-graph', 'figure'),
    [Input('continent-dropdown', 'value'),
     Input('year-slider', 'value')]
)
def update_graph(continent, year):
    filtered = df[(df['continent'] == continent) & (df['year'] == year)]
    fig = px.scatter(filtered, x='gdpPercap', y='lifeExp',
                     size='pop', hover_name='country', log_x=True)
    return fig

if __name__ == '__main__':
    app.run_server(debug=True, port=8050)
\\\`\\\`\\\`

### 7.2 Dash 核心组件

- **dcc.Graph**：嵌入 Plotly 图表
- **dcc.Dropdown**：下拉选择
- **dcc.Slider**：滑块
- **dcc.RangeSlider**：范围滑块
- **dcc.Checklist**：多选框
- **dcc.RadioItems**：单选按钮
- **dcc.Tabs**：标签页
- **html.Div / H1 / P**：HTML 元素

### 7.3 回调机制

Dash 的核心是回调机制：当输入组件的值变化时，自动触发函数更新输出组件。

\\\`\\\`\\\`python
@app.callback(
    Output('output-id', 'children'),
    [Input('input-id-1', 'value'),
     Input('input-id-2', 'value')]
)
def update_function(input1, input2):
    # 业务逻辑
    return f'结果: {input1} + {input2}'
\\\`\\\`\\\`

### 7.4 实战：AI模型监控面板

\\\`\\\`\\\`python
import dash
from dash import dcc, html, Input, Output
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1('AI 模型训练监控'),

    html.Div([
        dcc.Graph(id='loss-graph'),
        dcc.Graph(id='metrics-graph'),
    ], style={'display': 'flex', 'flexDirection': 'row'}),

    dcc.Interval(id='interval', interval=2000),  # 每 2 秒更新
    html.Div(id='status')
])

@app.callback(
    [Output('loss-graph', 'figure'),
     Output('metrics-graph', 'figure')],
    Input('interval', 'n_intervals')
)
def update_metrics(n):
    # 模拟实时数据
    epochs = list(range(1, n+1))
    train_loss = [2.5 * np.exp(-0.08*e) + 0.1 for e in epochs]
    val_loss = [2.5 * np.exp(-0.07*e) + 0.15 for e in epochs]

    loss_fig = go.Figure()
    loss_fig.add_trace(go.Scatter(x=epochs, y=train_loss, name='Train'))
    loss_fig.add_trace(go.Scatter(x=epochs, y=val_loss, name='Val'))
    loss_fig.update_layout(title='Loss Curve')

    acc_fig = go.Figure()
    acc_fig.add_trace(go.Scatter(x=epochs, y=[min(0.99, 1-l+np.random.randn()*0.01) for l in train_loss], name='Train Acc'))
    acc_fig.update_layout(title='Accuracy')

    return loss_fig, acc_fig

if __name__ == '__main__':
    app.run_server(debug=True)
\\\`\\\`\\\`

## 第八节：Plotly vs Matplotlib 选择指南

| 维度 | Matplotlib | Plotly |
|------|-----------|--------|
| 交互性 | 静态 | 强交互 |
| 学习曲线 | 陡峭但成熟 | 平缓 |
| 性能 | 大数据量好 | 大数据量慢 |
| 输出格式 | PNG/PDF/SVG | HTML/静态图 |
| 3D 支持 | 一般 | 优秀 |
| 动画 | 复杂 | 简单 |
| Web 集成 | 弱 | 原生支持 |
| 离线使用 | 完全离线 | 部分需要 JS |
| 学术论文 | 标准选择 | 较少使用 |
| 数据探索 | 中等 | 优秀 |
| 报告 Dashboard | 弱 | Dash 优秀 |

**选择建议**：
- 学术论文、印刷品 → Matplotlib
- 数据探索、交互分析 → Plotly
- Web 应用、Dashboard → Dash
- 大数据量（>10万点） → Matplotlib 或 Datashader

## 总结

本章介绍了 Plotly 的核心能力：

1. **双 API**：express 简洁、graph_objects 灵活，按需选择
2. **交互式折线**：缩放、悬停、范围选择器是杀手级特性
3. **3D 可视化**：散点、曲面、线图全方位展示高维数据
4. **动画图**：animation_frame 自动生成时间轴，适合演化展示
5. **子图布局**：make_subplots 支持复杂布局与共享轴
6. **高级图表**：桑基、树状、雷达、地理图丰富表达力
7. **Dash Dashboard**：构建交互式 Web 应用，回调机制是核心
8. **场景选择**：交互用 Plotly，静态用 Matplotlib，Web 用 Dash

掌握 Plotly 后，你的可视化作品将不再只是"图"，而是可以探索、交互、分享的"应用"。下一章我们将学习数据可视化的最佳实践，让你的图表在专业度和美观度上更上一层楼。`,
    code: `# ============================================================
# Plotly 交互式图表概念演示
# 用纯 Python 模拟交互特性、3D、动画、Dashboard 等概念
# 真实开发中：import plotly.express as px
# ============================================================

import math
import random
import time

random.seed(42)


def divider(title, width=72):
    print("\\n" + "═" * width)
    print(f"  {title}")
    print("═" * width)


# ============================================================
# 一、交互式特性概念演示
# ============================================================
divider("1. 交互式特性 —— Plotly 相比静态图表的优势")

print("""
  ┌──────────────────────────────────────────────────────────┐
  │  交互式折线图（概念示意）                                  │
  │                                                          │
  │  90 ┤                                  ●─●               │
  │     │                            ●─●─╱     ╲             │
  │  60 ┤                       ●─●─╱            ●           │
  │     │                 ●─●─╱                              │
  │  30 ┤           ●─●─╱                                    │
  │     │     ●─●─╱                                          │
  │   0 └─────●───────────────────────────────────────────→  │
  │     1月  2月  3月  4月  5月  6月  7月  8月  9月 10月 11月 12月
  │      ↑                                                  │
  │      └─ 鼠标悬停此处显示：                               │
  │           月份: 1月                                     │
  │           销售额: 320 万元                              │
  │           同比: +15%                                    │
  ├──────────────────────────────────────────────────────────┤
  │  工具栏（右上角）：                                      │
  │    🔍 缩放  □ 框选  ✋ 平移  ↻ 重置  📷 截图  ⚙ 设置    │
  ├──────────────────────────────────────────────────────────┤
  │  图例（点击切换显示）：                                  │
  │    ● 北京（点击隐藏/显示）                              │
  │    ● 上海（点击隐藏/显示）                              │
  │    ● 广州（点击隐藏/显示）                              │
  └──────────────────────────────────────────────────────────┘
""")

print("  对应 Plotly 代码：")
print("    import plotly.express as px")
print("    fig = px.line(df, x='month', y='sales', color='city', markers=True)")
print("    fig.update_layout(hovermode='x unified')  # 统一显示悬停")
print("    fig.show()  # 在浏览器中打开交互式图表")


# ============================================================
# 二、范围选择器与时间序列
# ============================================================
divider("2. 范围选择器 Range Selector —— 时序数据探索")

print("""
  ┌────────────────────────────────────────────────────────┐
  │  [1周] [1月] [3月] [6月] [全部]   ← 范围选择按钮        │
  ├────────────────────────────────────────────────────────┤
  │  120 ┤        ╱╲                                       │
  │      │       ╱  ╲    ╱╲                                │
  │  100 ┤  ╱╲  ╱    ╲  ╱  ╲                               │
  │      │ ╱  ╲╱      ╲╱    ╲___                           │
  │   80 ┤╱                          ╲                     │
  │      │                            ╲___                  │
  │   60 ┤                                ╲╱╲               │
  ├──────┴─────────────────────────────────────────────────┤
  │  ◄───────── 范围滑块 ──────────────────────►            │
  │  拖动滑块调整可见范围                                  │
  └────────────────────────────────────────────────────────┘
""")

print("  对应代码：")
print("    fig.update_xaxes(")
print("        rangeslider_visible=True,")
print("        rangeselector=dict(buttons=[")
print("            dict(count=7, label='1周', step='day', stepmode='backward'),")
print("            dict(count=1, label='1月', step='month', stepmode='backward'),")
print("            dict(label='全部', step='all')])")
print("    )")


# ============================================================
# 三、3D 可视化概念演示
# ============================================================
divider("3. 3D 可视化 —— 高维数据探索")

# 生成 3D 数据点
n_points = 30
x_3d = [random.gauss(0, 1) for _ in range(n_points)]
y_3d = [random.gauss(0, 1) for _ in range(n_points)]
z_3d = [x_3d[i]*0.5 + y_3d[i]*0.3 + random.gauss(0, 0.3) for i in range(n_points)]

print("""
  3D 散点图（可旋转、缩放、悬停查看坐标）：

         Z轴
         │        ●●
         │      ●●●●
         │    ●●●●●●         ← 鼠标拖拽旋转视角
         │  ●●●●●●●●
         │●●●●●●●●●●●
         │
         └─────────────────── X轴
        ╱
      ╱
    Y轴

  应用场景：
    - t-SNE / UMAP 降维结果展示
    - 损失函数 landscape 可视化
    - 3D 聚类结果""")

print("\\n  对应代码：")
print("    import plotly.express as px")
print("    fig = px.scatter_3d(df, x='x', y='y', z='z',")
print("                       color='category', size='value', opacity=0.7)")
print("    fig.show()")


# ============================================================
# 四、动画图概念演示
# ============================================================
divider("4. 动画图 Animation —— 时间维度展示")

print("""
  Gapminder 风格动画散点图：

  Y: 寿命
  90 ┤                                    ●●
     │                              ●●●●●
  70 ┤                        ●●●●
     │              ●●●●●●●●●
  50 ┤        ●●●●
     │  ●●●●
  30 ┤●
     └────────────────────────────────────── X: GDP(对数)
      100          1k           10k         100k

  ◄ │ ▶ │  播放控件   [1952] ────●────── [2007]
                               当前年份

  ◀ ─── 动画进度条 ─── ▶
  点击播放，自动遍历各年份""")

# 模拟动画帧数据
print("\\n  模拟动画帧数据（每帧代表一年）：")
years = list(range(1952, 2008, 5))
for y in years[:5]:
    avg_gdp = 1000 * (1 + (y - 1952) * 0.05)
    avg_life = 50 + (y - 1952) * 0.4
    print(f"    Year {y}: 平均GDP=\${avg_gdp:.0f}  平均寿命={avg_life:.1f}岁")
print("    ...")

print("\\n  对应代码：")
print("    fig = px.scatter(df, x='gdpPercap', y='lifeExp',")
print("                     animation_frame='year',    # 时间轴")
print("                     animation_group='country', # 实体追踪")
print("                     size='pop', color='continent')")
print("    fig.show()")


# ============================================================
# 五、高级图表类型演示
# ============================================================
divider("5. 高级图表类型 —— 桑基图、树状图、雷达图")

print("""
  ┌─ 桑基图 Sankey ─────────────────────────────────────┐
  │                                                     │
  │   用户访问 ─┬─→ 首页 ─┬─→ 商品页 ─┬─→ 购物车 ─→ 支付│
  │            │          │          │                  │
  │            └─→ 离开   └─→ 离开   └─→ 离开           │
  │   流量宽度表示转化数量                              │
  └─────────────────────────────────────────────────────┘

  ┌─ 树状图 Treemap ────────────────────────────────────┐
  │  ┌─────────────┬───────────┬──────────┬───────────┐│
  │  │   亚洲       │  欧洲     │  非洲    │  美洲      ││
  │  ├──────┬──────┼─────┬─────┼──────────┼─────┬─────┤│
  │  │ 中国  │ 印度 │ 英  │ 法  │          │ 美  │ 巴  ││
  │  │      │      │     │     │          │     │     ││
  │  └──────┴──────┴─────┴─────┴──────────┴─────┴─────┘│
  │  面积大小表示数值大小                                │
  └─────────────────────────────────────────────────────┘

  ┌─ 雷达图 Radar ──────────────────────────────────────┐
  │                    速度                              │
  │                   ╱  ╲                               │
  │              90 ╱    ╲ 80                            │
  │               ╱  A   ╲                               │
  │     敏捷 ───●────────●─── 力量                       │
  │           75│   B    │95                             │
  │             │        │                               │
  │          60 ●        ● 80                            │
  │            ╲  ╱                                      │
  │            智力                                       │
  └─────────────────────────────────────────────────────┘""")

print("\\n  对应代码：")
print("    # 桑基图")
print("    go.Sankey(node=dict(label=[...]), link=dict(source=[...], target=[...], value=[...]))")
print("    # 树状图")
print("    px.treemap(df, path=['continent', 'country'], values='pop')")
print("    # 雷达图")
print("    go.Scatterpolar(r=[90,80,70,60,85,75], theta=categories, fill='toself')")


# ============================================================
# 六、Dash Dashboard 概念演示
# ============================================================
divider("6. Dash Dashboard —— 交互式 Web 应用")

print("""
  ┌──────────────────────────────────────────────────────────┐
  │  🤖 AI 模型训练监控面板                            [刷新] │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │  大洲: [亚洲    ▼]   年份: [─────●─────] 2007           │
  │                                                          │
  ├────────────────────────┬─────────────────────────────────┤
  │  Loss 曲线             │  Accuracy 曲线                  │
  │  2.5 ┤●                │  0.5 ┤      ●●●●●●              │
  │      │ ╲               │      │   ●●╱                    │
  │  1.5 ┤  ╲              │  0.7 ┤  ╱                       │
  │      │   ╲    ●        │      │╱                         │
  │  0.5 ┤    ╲──╱         │  0.9 ┤●                         │
  │      └─────────        │      └─────────                 │
  │       Epoch            │       Epoch                     │
  ├────────────────────────┴─────────────────────────────────┤
  │  状态: 训练中...  Epoch 30/50  剩余 ~2 分钟              │
  └──────────────────────────────────────────────────────────┘

  Dash 应用三要素：
    1. layout  —— 定义页面结构（HTML + dcc 组件）
    2. callback —— 定义交互逻辑（输入→输出）
    3. run_server —— 启动 Web 服务""")

print("\\n  对应代码：")
print("    import dash")
print("    from dash import dcc, html, Input, Output")
print("    app = dash.Dash(__name__)")
print("    app.layout = html.Div([")
print("        dcc.Dropdown(id='dropdown', options=[...]),")
print("        dcc.Graph(id='graph'),")
print("        dcc.Slider(id='slider', min=0, max=100)")
print("    ])")
print("    @app.callback(Output('graph','figure'), Input('dropdown','value'))")
print("    def update(value): return make_figure(value)")
print("    app.run_server(debug=True, port=8050)")


# ============================================================
# 七、Plotly vs Matplotlib 对比
# ============================================================
divider("7. Plotly vs Matplotlib 选择指南")

print("""
  ┌──────────────┬─────────────────┬─────────────────┐
  │    维度      │   Matplotlib    │     Plotly      │
  ├──────────────┼─────────────────┼─────────────────┤
  │  交互性      │  静态           │  强交互         │
  │  学习曲线    │  陡峭但成熟     │  平缓           │
  │  大数据性能  │  好             │  较慢           │
  │  输出格式    │  PNG/PDF/SVG    │  HTML/静态图    │
  │  3D 支持     │  一般           │  优秀           │
  │  动画        │  复杂           │  简单           │
  │  Web 集成    │  弱             │  原生支持       │
  │  学术论文    │  标准选择       │  较少使用       │
  │  数据探索    │  中等           │  优秀           │
  │  Dashboard   │  弱             │  Dash 优秀      │
  └──────────────┴─────────────────┴─────────────────┘

  选择建议：
    • 学术论文、印刷品        → Matplotlib
    • 数据探索、交互分析      → Plotly
    • Web 应用、Dashboard     → Dash
    • 大数据量（>10万点）     → Matplotlib 或 Datashader""")

print("\\n" + "=" * 72)
print("  本章演示完毕。Plotly 的核心价值：")
print("    '让数据可视化从静态图片升级为交互式应用'")
print("  真实开发中：")
print("    import plotly.express as px")
print("    import dash")
print("    fig = px.line(df, x='date', y='value')")
print("    fig.show()                    # 交互式图表")
print("    fig.write_html('out.html')    # 保存为可分享的 HTML")
print("=" * 72)
`,
  },
  {
    id: "aipy-viz-best",
    icon: "💎",
    group: "数据可视化",
    title: "数据可视化最佳实践",
    content: `# 数据可视化最佳实践

## 引言：技术之上是设计

前面四章我们学习了 Matplotlib、Seaborn、Plotly 的各种技术。但拥有了工具不等于拥有了能力。同样一份数据，有人画出的图表让人一眼看懂核心结论，有人画出的图表却让人看了半天不知所云。差别不在技术，而在设计思维。

数据可视化的本质是**用视觉语言传达数据故事**。它不是简单的"把数据画出来"，而是要回答：你想让观众看到什么？观众能从图中获得什么？图表是否真实反映了数据？是否会产生误解？

本章将系统讨论数据可视化的最佳实践，涵盖图表选择原则、配色方案、可读性优化、常见错误四大主题。这些原则不仅适用于 Python 生态，也适用于 Excel、Tableau、Power BI 等任何可视化工具。

记住一句话：**好的图表让数据说话，差的图表让数据沉默。** 技术只是手段，传达信息才是目的。如果你画的图表需要长篇解释才能看懂，那不是图表的问题，是设计的问题。

## 第一节：图表选择原则

### 1.1 按数据关系选择图表

选择图表的第一步是明确你想展示的数据关系：

**1. 比较（Comparison）**
- 想比较不同类别的数值大小 → **柱状图**
- 想比较随时间的变化 → **折线图**
- 想比较多类别多系列 → **分组柱状图**

**2. 分布（Distribution）**
- 想看连续变量的分布形态 → **直方图** 或 **KDE**
- 想看分布的统计摘要 → **箱线图** 或 **小提琴图**
- 想看累积分布 → **ECDF**

**3. 关系（Relationship）**
- 想看两个变量的相关性 → **散点图**
- 想看两个变量的联合分布 → **二维 KDE** 或 **hexbin**
- 想看多变量两两关系 → **pairplot**

**4. 构成（Composition）**
- 想看部分占整体比例 → **饼图**（少类别）或 **堆叠柱状图**（多类别）
- 想看层次结构 → **树状图**
- 想看流量转化 → **桑基图**

**5. 趋势（Trend）**
- 想看时间序列趋势 → **折线图**
- 想看季节性 → **季节图** 或 **热力图**
- 想看长期趋势+季节波动 → **分解图**

### 1.2 图表选择决策树

\\\`\\\`\\\`
你想要展示什么？
├── 比较
│   ├── 类别少 (<5) → 柱状图
│   ├── 类别多 (>5) → 横向柱状图
│   └── 随时间 → 折线图
├── 分布
│   ├── 单变量 → 直方图 + KDE
│   ├── 多变量对比 → 箱线图
│   └── 累积 → ECDF
├── 关系
│   ├── 两变量 → 散点图
│   ├── 多变量 → pairplot
│   └── 相关性矩阵 → 热力图
├── 构成
│   ├── 两层 <5 类 → 饼图
│   ├── 多层 → 堆叠柱状图
│   └── 层次 → 树状图
└── 趋势
    ├── 短期 → 折线图
    └── 长期+季节 → 热力图
\\\`\\\`\\\`

### 1.3 避免"炫技陷阱"

初学者常犯的错误是：用越复杂、越炫酷的图表越好。3D 饼图、动态雷达图、彩色桑基图...这些图表虽然看起来"高级"，但往往传达效率低下。

**核心原则：用最简单的图表传达最清晰的信息。**

- 柱状图能搞定的，不要用雷达图
- 折线图能搞定的，不要用桑基图
- 静态图能搞定的，不要用动画图
- 二维能搞定的，不要用 3D

### 1.4 数据量与图表类型

| 数据量 | 推荐图表 | 不推荐 |
|--------|----------|--------|
| <10 点 | 柱状图、表格 | 直方图 |
| 10-100 点 | 散点图、折线图 | 饼图（>5类） |
| 100-1000 点 | 散点图+透明度、KDE | 普通散点图 |
| 1000-10000 点 | 二维 KDE、hexbin | 散点图（过密） |
| >10000 点 | Datashader、采样 | 普通散点图 |

## 第二节：配色方案

### 2.1 配色的三大原则

**1. 目的性**
颜色不是装饰，是编码信息的手段。每次用色都要问：这个颜色传达了什么？

- 区分类别 → 用分类型色板（Set1、tab10）
- 表达顺序 → 用顺序型色板（viridis、Blues）
- 表达正负 → 用发散型色板（coolwarm、RdBu）

**2. 可读性**
颜色要保证在不同介质（屏幕、打印、投影）上都清晰可读。避免：
- 浅色背景上的浅色文字
- 高饱和度的强对比（容易视觉疲劳）
- 红绿同时使用（约 8% 男性色盲）

**3. 一致性**
同一报告中，相同含义的数据用相同颜色。例如：负面用红、正面用绿，整个报告都要遵守这个约定。

### 2.2 色盲友好配色

约 8% 的男性和 0.5% 的女性有某种形式的色盲，最常见的是红绿色盲。设计图表时要考虑这些用户。

**推荐的色盲友好色板**：
- viridis 系列（默认）：暗紫→绿→黄
- cividis：色盲优化的 viridis
- ColorBrewer 的 Set2、Paired

**避免的配色**：
- 红绿对比：用红蓝或橙蓝代替
- 彩虹色板（jet）：感知不均匀，色盲不友好

### 2.3 颜色情感与品牌色

颜色有情感含义，选择时要考虑：

- **红色**：警告、危险、负面（下降、亏损）
- **绿色**：积极、安全、正面（增长、盈利）
- **蓝色**：专业、信任、技术
- **橙色**：活力、提醒
- **紫色**：创意、神秘
- **灰色**：中性、背景

品牌色应用：在公司报告中使用品牌主色，能增强专业感和一致性。例如：阿里的橙、腾讯的蓝、可口可乐的红。

### 2.4 配色工具与资源

- **ColorBrewer**：https://colorbrewer2.org/ ，地图配色经典
- **Coolors**：https://coolors.co/ ，生成配色方案
- **Adobe Color**：https://color.adobe.com/ ，专业配色工具
- **Material Design Color**：Google 设计系统的色板

### 2.5 自定义色板示例

\\\`\\\`\\\`python
# 专业的自定义色板（参考 Tableau 10）
tableau_colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2',
                  '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7',
                  '#9C755F', '#BAB0AC']

# 商务报告配色
business_colors = {
    'primary': '#2E86AB',    # 主色：深蓝
    'secondary': '#A23B72',  # 副色：紫红
    'success': '#06A77D',    # 成功：绿
    'warning': '#F18F01',    # 警告：橙
    'danger': '#C73E1D',     # 危险：红
    'neutral': '#6C757D',    # 中性：灰
}

# 灰阶配色（适合打印）
gray_palette = ['#000000', '#404040', '#808080', '#B0B0B0', '#E0E0E0']
\\\`\\\`\\\`

## 第三节：可读性优化

### 3.1 字体设计

**字体大小层级**：
- 标题：16-20pt
- 副标题：14-16pt
- 轴标签：12-14pt
- 刻度标签：10-12pt
- 注释：10-11pt
- 图例：10-11pt

**字体选择**：
- 屏幕显示：无衬线字体（如 Arial、Helvetica、微软雅黑）
- 学术论文：衬线字体（如 Times New Roman、宋体）
- 数据数字：等宽字体（如 Consolas、Menlo）

\\\`\\\`\\\`python
plt.rcParams['font.size'] = 12
plt.rcParams['axes.titlesize'] = 16
plt.rcParams['axes.labelsize'] = 13
plt.rcParams['xtick.labelsize'] = 11
plt.rcParams['ytick.labelsize'] = 11
plt.rcParams['legend.fontsize'] = 11
\\\`\\\`\\\`

### 3.2 留白与布局

留白不是浪费空间，是引导视线的工具。重要元素周围要有更多留白，让观众的目光自然聚焦。

\\\`\\\`\\\`python
# 合理的图表尺寸
plt.figure(figsize=(10, 6))  # 宽高比 5:3 是黄金比例附近

# 子图间距
plt.tight_layout(pad=2.0)  # 增加子图周围留白
# 或
plt.subplots_adjust(left=0.1, right=0.95, top=0.9, bottom=0.15)
\\\`\\\`\\\`

### 3.3 坐标轴优化

**坐标轴范围**：
- 不要盲目从 0 开始（折线图可以裁剪以突出变化）
- 柱状图 Y 轴必须从 0 开始（否则误导）
- 留 5-10% 的边距，避免数据贴边

\\\`\\\`\\\`python
# 设置合理的范围
y_min, y_max = min(data), max(data)
margin = (y_max - y_min) * 0.1
plt.ylim(y_min - margin, y_max + margin)
\\\`\\\`\\\`

**刻度密度**：
- X 轴刻度 5-10 个为宜
- Y 轴刻度 4-8 个为宜
- 太多会显得拥挤，太少不够精确

**刻度格式**：
- 大数字用千分位或单位转换（10000 → 1万 或 10k）
- 百分比加 % 号
- 货币加 ¥ 或 $ 符号

\\\`\\\`\\\`python
from matplotlib.ticker import FuncFormatter

def million_formatter(x, pos):
    return f'{x/10000:.1f}万'

plt.gca().yaxis.set_major_formatter(FuncFormatter(million_formatter))
\\\`\\\`\\\`

### 3.4 网格线使用

- 主网格：浅色虚线，alpha=0.3
- 次网格：更浅，alpha=0.15
- 柱状图只加 Y 轴网格
- 散点图 X/Y 网格都加
- 折线图视情况，简洁优先可不加

\\\`\\\`\\\`python
plt.grid(True, axis='y', linestyle='--', alpha=0.3, zorder=0)
# zorder=0 让网格在数据下方
\\\`\\\`\\\`

### 3.5 标注关键信息

不要让观众自己找重点，主动标注你想强调的信息：

\\\`\\\`\\\`python
# 标注最大值
max_idx = values.index(max(values))
plt.annotate(f'最高: {max(values)}',
             xy=(max_idx, max(values)),
             xytext=(max_idx+1, max(values)*0.95),
             arrowprops=dict(arrowstyle='->', color='red'),
             fontsize=11, color='red')

# 标注关键事件
plt.axvline(x=event_date, color='red', linestyle='--', alpha=0.5)
plt.text(event_date, plt.ylim()[1]*0.9, '事件', color='red')

# 柱状图顶部显示数值
for bar, value in zip(bars, values):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
             f'{value}', ha='center', va='bottom')
\\\`\\\`\\\`

### 3.6 图例设计

- 位置：优先放图外右侧或上方
- 不遮挡数据
- 类别少时可直接标注在数据上，省去图例
- 排序：按数值大小或逻辑顺序

\\\`\\\`\\\`python
# 图例放图外
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

# 直接标注（无图例）
for x, y, label in zip(x_data, y_data, labels):
    plt.text(x, y, label, fontsize=10)
\\\`\\\`\\\`

## 第四节：常见错误与陷阱

### 4.1 误导性图表

**1. Y 轴不从 0 开始**
最经典的误导手法。例如展示利润增长，把 Y 轴从 95 开始，5% 的增长看起来像翻倍。

**修正**：柱状图 Y 轴必须从 0 开始；折线图可酌情裁剪但要标注。

**2. 3D 饼图**
3D 透视会让前面的扇区看起来更大，后面的更小，严重扭曲比例。

**修正**：永远用 2D 饼图，或用柱状图代替。

**3. 双 Y 轴误导**
两个序列用双 Y 轴，调整范围可以让任何两条曲线看起来相关。

**修正**：慎用双 Y 轴，必须用时用不同颜色明确区分，并在标题中说明。

**4. 截断数据**
只展示有利时间段的数据，隐藏不利部分。

**修正**：完整展示数据，或明确标注时间范围。

### 4.2 过度装饰

**避免**：
- 渐变填充
- 阴影效果
- 3D 效果
- 装饰性背景图案
- 过多颜色

**原则**：数据墨水比（Data-Ink Ratio）最大化——每一滴"墨水"都要为传达信息服务。这是 Edward Tufte 提出的经典原则。

### 4.3 信息过载

**症状**：
- 一张图里塞了 20 条折线
- 散点图有 10 万个点全画上去
- 子图密密麻麻像网格

**修正**：
- 多条折线 → 分面图（Facet）
- 大量散点 → 采样、聚合、hexbin
- 多子图 → 拆分多张图

### 4.4 忽略数据类型

**错误示例**：
- 用折线图连接类别数据（无序类别之间不应该有连线）
- 用饼图展示 15 个类别（看不清）
- 用散点图展示时间序列（应该用折线图）

**原则**：图表类型要匹配数据类型。
- 类别数据 → 柱状图
- 时序数据 → 折线图
- 连续数据 → 散点图或直方图

### 4.5 颜色误用

**错误**：
- 用彩虹色板表达有序数据（感知不均匀）
- 用红绿区分类别（色盲不友好）
- 同一报告中同类数据用不同颜色
- 用 10 种颜色区分类别，无法分辨

**修正**：
- 顺序数据用 viridis 等顺序色板
- 类别数据用 Set1 等分类色板
- 类别超过 7 个时考虑分组或用其他图表
- 全局统一颜色含义

### 4.6 标签缺失或不清晰

**错误**：
- 没有标题
- 没有轴标签
- 没有单位
- 图例标签是英文字母代号

**修正**：
- 每张图必须有：标题、X 轴标签、Y 轴标签、单位
- 图例用清晰的中文描述
- 必要时添加数据来源说明

## 第五节：专业报告的设计流程

### 5.1 设计流程

**1. 明确目标**
- 谁是读者？管理层、技术团队、客户？
- 想传达什么结论？
- 读者需要做什么决策？

**2. 选择图表**
- 根据数据关系选择类型
- 根据读者专业程度调整复杂度
- 一张图只讲一个故事

**3. 设计草图**
- 先在纸上画草图
- 确定布局、配色、重点
- 不急于写代码

**4. 实现并迭代**
- 用 Python 实现
- 检查数据准确性
- 优化可读性
- 请同事 review

**5.5 添加叙事**
- 标题点明结论，而非描述内容
  - 差：'2024 年销售数据'
  - 好：'2024 年 Q3 销售额同比增长 35%'
- 添加关键注释
- 必要时配合文字说明

### 5.2 标题的写法

标题是图表最重要的部分，它直接告诉读者图表的核心信息。

**描述性标题**（中规中矩）：
- "2024 年月度销售趋势"
- "各产品类别销售额对比"

**结论性标题**（推荐）：
- "Q3 销售额创历史新高，同比增长 35%"
- "产品 D 销售额领先，占总营收 28%"

**问题性标题**（引发思考）：
- "为何 7 月销量骤降 20%？"
- "高端产品为何增长乏力？"

### 5.3 报告整体设计

**结构**：
1. 摘要页：核心结论
2. 趋势页：宏观概览
3. 细节页：分维度深入
4. 异常页：特殊情况说明
5. 行动页：建议与下一步

**视觉一致性**：
- 统一配色方案
- 统一字体字号
- 统一图表风格
- 统一术语命名

## 第六节：可视化伦理

### 6.1 真实呈现数据

- 不刻意裁剪数据范围误导
- 不用 3D 效果扭曲比例
- 不用双 Y 轴制造虚假相关
- 误差范围要诚实展示

### 6.2 标注不确定性

- 预测值要标注置信区间
- 采样数据要说明样本量
- 缺失数据要明确标识
- 假设条件要清楚说明

### 6.3 数据来源

每张图表都应该注明：
- 数据来源（机构、数据库）
- 数据时间范围
- 数据采集方法
- 已知的局限性

\\\`\\\`\\\`python
# 在图表底部添加数据来源
plt.figtext(0.1, 0.01, '数据来源：国家统计局 2024 年统计年鉴',
            fontsize=9, color='gray', ha='left')
\\\`\\\`\\\`

## 总结

本章系统讨论了数据可视化的设计原则：

1. **图表选择**：根据数据关系（比较、分布、关系、构成、趋势）选择图表，避免炫技
2. **配色方案**：目的性、可读性、一致性三原则，色盲友好优先
3. **可读性优化**：字体层级、合理留白、刻度优化、关键信息标注
4. **避免陷阱**：Y 轴陷阱、3D 误导、双 Y 轴误用、信息过载
5. **设计流程**：明确目标→选择图表→草图设计→实现迭代→添加叙事
6. **可视化伦理**：真实呈现、标注不确定性、注明数据来源

数据可视化的最高境界不是技术炫酷，而是**让数据自己说话**。当你画出的图表让读者一眼就能看出结论、做出决策时，你就真正掌握了数据可视化的精髓。技术只是手段，传达信息才是目的。永远记住：**好的图表让数据说话，差的图表让数据沉默。**`,
    code: `# ============================================================
# 数据可视化最佳实践演示
# 用纯 Python 演示图表选择、配色、可读性、常见错误等概念
# ============================================================

import math
import random

random.seed(42)


def divider(title, width=72):
    print("\\n" + "═" * width)
    print(f"  {title}")
    print("═" * width)


def ascii_bar(value, max_value, width=30, fill='█', empty='░'):
    if max_value <= 0:
        return empty * width
    filled = int(width * value / max_value)
    return fill * filled + empty * (width - filled)


# ============================================================
# 一、图表选择决策树
# ============================================================
divider("1. 图表选择决策树 —— 根据数据关系选图")

print("""
  你想要展示什么？
  │
  ├── 比较（Comparison）
  │   ├── 类别少 (<5) ──→ 柱状图 Bar
  │   ├── 类别多 (>5) ──→ 横向柱状图 Horizontal Bar
  │   └── 随时间变化 ──→ 折线图 Line
  │
  ├── 分布（Distribution）
  │   ├── 单变量分布 ──→ 直方图 Histogram + KDE
  │   ├── 多变量对比 ──→ 箱线图 Box / 小提琴图 Violin
  │   └── 累积分布   ──→ ECDF
  │
  ├── 关系（Relationship）
  │   ├── 两变量相关 ──→ 散点图 Scatter
  │   ├── 多变量关系 ──→ pairplot
  │   └── 相关性矩阵 ──→ 热力图 Heatmap
  │
  ├── 构成（Composition）
  │   ├── 简单比例 (<5类) ──→ 饼图 Pie
  │   ├── 多层堆叠         ──→ 堆叠柱状图 Stacked Bar
  │   └── 层次结构         ──→ 树状图 Treemap
  │
  └── 趋势（Trend）
      ├── 短期趋势 ──→ 折线图 Line
      ├── 长期季节 ──→ 热力图 Heatmap
      └── 多维趋势 ──→ 分面折线图 Facet Line""")

print("\\n  核心原则：用最简单的图表传达最清晰的信息")
print("  避免'炫技陷阱'：3D饼图、动态雷达图、彩色桑基图...")


# ============================================================
# 二、配色方案对比演示
# ============================================================
divider("2. 配色方案 —— 三大原则与色盲友好")

print("""
  ┌─────────────────────────────────────────────────────────┐
  │ 三大原则：目的性、可读性、一致性                          │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │ 1. 分类型色板（无序类别）                                 │
  │   Set1:    ███  ███  ███  ███  ███  ███                │
  │   tab10:   ███  ███  ███  ███  ███  ███                │
  │   适用：不同产品、不同地区、不同类别                     │
  │                                                         │
  │ 2. 顺序型色板（有序数据）                                 │
  │   viridis: ████→██→██→██→██→██→██  暗→亮               │
  │   Blues:   ░░░→▒▒▒→▓▓▓→███  浅→深                      │
  │   适用：温度、海拔、销售额高低                           │
  │                                                         │
  │ 3. 发散型色板（有正负）                                   │
  │   coolwarm: ███→▒▒→░░→▒▒→███  负→零→正                 │
  │   RdBu:     ███→▒▒→░░→▒▒→███  红→白→蓝                 │
  │   适用：相关系数、增长率、变化量                         │
  └─────────────────────────────────────────────────────────┘""")

print("""
  色盲友好测试：
    ✗ 红绿对比（约8%男性色盲无法分辨）
    ✓ 红蓝对比（色盲友好）
    ✓ 橙蓝对比（色盲友好）
    ✓ viridis 系列（默认感知均匀，色盲友好）

  颜色情感含义：
    红色 → 警告、危险、负面（亏损、下降）
    绿色 → 积极、安全、正面（盈利、增长）
    蓝色 → 专业、信任、技术
    橙色 → 活力、提醒
    灰色 → 中性、背景""")


# ============================================================
# 三、可读性优化对比
# ============================================================
divider("3. 可读性优化 —— 好图 vs 差图对比")

# 模拟数据
products = ['产品A', '产品B', '产品C', '产品D', '产品E']
sales = [320, 480, 290, 550, 410]
max_sale = max(sales)

print("\\n  ❌ 差图示例（信息缺失）：")
print("  ┌────────────────────────────────────────────┐")
print("  │                                            │")
for p, s in zip(products, sales):
    bar = '█' * int(20 * s / max_sale)
    print(f"  │  {p}  {bar}")
print("  │                                            │")
print("  └────────────────────────────────────────────┘")
print("  问题：无标题、无单位、无数值、无排序、网格过重")

print("\\n  ✓ 好图示例（信息完整）：")
print("  ┌────────────────────────────────────────────┐")
print("  │  2024 Q3 各产品销售额对比（单位：万元）       │")
print("  │  ─────────────────────────────────────────  │")
# 按销售额降序排序
sorted_data = sorted(zip(products, sales), key=lambda x: -x[1])
for p, s in sorted_data:
    bar = ascii_bar(s, max_sale, width=25, fill='█', empty='░')
    pct = s / sum(sales) * 100
    print(f"  │  {p}  {bar} {s:>4} ({pct:4.1f}%)")
print("  │  ─────────────────────────────────────────  │")
print(f"  │  总计: {sum(sales)} 万元  最高: {sorted_data[0][0]} ({sorted_data[0][1]}万)")
print("  │  数据来源: 销售系统 2024-10-01 导出            │")
print("  └────────────────────────────────────────────┘")
print("  优点：有标题、有单位、有数值、有排序、有摘要、有来源")


# ============================================================
# 四、常见错误演示
# ============================================================
divider("4. 常见错误演示 —— 误导性图表")

print("""
  ┌─ 错误1：Y 轴不从 0 开始（柱状图）─────────────────────┐
  │                                                       │
  │  误导版本（Y轴从95开始）：                              │
  │  100 ┤  ██                                            │
  │   98 ┤  ██  ██                                        │
  │   96 ┤  ██  ██  ██                                    │
  │   95 ┤  ██  ██  ██  ██                                │
  │      └────────────                                    │
  │  → 看起来差异巨大，实际只差几个百分点                  │
  │                                                       │
  │  正确版本（Y轴从0开始）：                              │
  │  100 ┤      ██                                        │
  │   75 ┤  ██  ██  ██                                    │
  │   50 ┤  ██  ██  ██  ██                                │
  │    0 └────────────                                    │
  │  → 真实展现差异比例                                    │
  └───────────────────────────────────────────────────────┘""")

print("""
  ┌─ 错误2：3D 饼图扭曲比例 ──────────────────────────────┐
  │                                                       │
  │   3D 饼图：                                           │
  │        ╱─────╲                                        │
  │       │  A  B │   ← 前面的扇区看起来更大               │
  │       │  C  D │      后面的看起来更小                  │
  │        ╲─────╱                                       │
  │                                                       │
  │   2D 饼图（推荐）：                                    │
  │         ___                                           │
  │       /  A  \\                                         │
  │      | B | C |   ← 比例真实                            │
  │       \\  D  /                                         │
  │         ¯¯¯                                           │
  └───────────────────────────────────────────────────────┘""")

print("""
  ┌─ 错误3：双 Y 轴制造虚假相关 ──────────────────────────┐
  │                                                       │
  │  调整 Y 轴范围可以让任何两条曲线看起来相关：            │
  │                                                       │
  │  ▲ 销售额    ▲ 销售额                                 │
  │  ┤    ╱╲    ┤      ╱╲                                 │
  │  ┤   ╱  ╲   ┤     ╱  ╲                                │
  │  ┤  ╱    ╲  ┤    ╱    ╲                               │
  │  ┤ ╱      ╲ ┤   ╱      ╲                              │
  │  └────────  └──────────                               │
  │  ▲ 利润率   ▲ 利润率（缩放后）                         │
  │  ┤─ ─ ─ ─   ┤ ╲    ╱╲    ╱                            │
  │  ┤       ╲   ┤  ╲  ╱  ╲  ╱   ← 看起来强相关           │
  │  └────────  └──────────                               │
  │                                                       │
  │  修正：慎用双 Y 轴，必须用时颜色区分 + 标题说明         │
  └───────────────────────────────────────────────────────┘""")


# ============================================================
# 五、数据量与图表选择
# ============================================================
divider("5. 数据量与图表类型匹配")

print("""
  ┌──────────────┬───────────────────────┬────────────────┐
  │   数据量     │    推荐图表           │   不推荐        │
  ├──────────────┼───────────────────────┼────────────────┤
  │  < 10 点     │  柱状图、表格          │  直方图        │
  │  10-100 点   │  散点图、折线图        │  饼图(>5类)    │
  │  100-1k 点   │  散点图+透明度、KDE    │  普通散点图    │
  │  1k-10k 点   │  2D KDE、hexbin       │  散点图(过密)  │
  │  > 10k 点    │  Datashader、采样      │  普通散点图    │
  └──────────────┴───────────────────────┴────────────────┘""")

# 演示大数据量的问题
print("\\n  大数据量散点图过密问题演示：")
n_points = 500
x_big = [random.gauss(0, 1) for _ in range(n_points)]
y_big = [x_big[i] * 0.7 + random.gauss(0, 0.5) for i in range(n_points)]

# 模拟过密的散点图
print("  普通散点图（点过密，看不出密度差异）：")
print("  Y")
print("  ↑  ●●●●●●●●●●●●●●●●●●●●●●●●●")
print("  │ ●●●●●●●●●●●●●●●●●●●●●●●●●●")
print("  │ ●●●●●●●●●●●●●●●●●●●●●●●●●●")
print("  │  ●●●●●●●●●●●●●●●●●●●●●●●●●")
print("  │   ●●●●●●●●●●●●●●●●●●●●●●●●")
print("  └──────────────────────────────→ X")

print("\\n  hexbin 图（用颜色深度表示密度，清晰可见）：")
print("  Y")
print("  ↑    ░░▒▒▓▓██▓▓▒▒░░")
print("  │   ░░▒▒▓▓████▓▓▒▒░░")
print("  │  ░░▒▒▓▓██████▓▓▒▒░░")
print("  │   ░░▒▒▓▓████▓▓▒▒░░")
print("  │    ░░▒▒▓▓██▓▓▒▒░░")
print("  └────────────────────→ X")
print("  颜色越深 = 数据点越密集")


# ============================================================
# 六、标题写法对比
# ============================================================
divider("6. 标题写法 —— 让结论一目了然")

print("""
  ┌─ 描述性标题（中规中矩）──────────────────────────────┐
  │  '2024 年销售数据'                                  │
  │  '各产品销售额对比'                                 │
  │  → 读者需要自己看图找结论                            │
  ├─────────────────────────────────────────────────────┤
  │  ✓ 结论性标题（推荐）                                │
  │  'Q3 销售额创历史新高，同比增长 35%'                 │
  │  '产品 D 销售额领先，占总营收 28%'                   │
  │  → 直接告诉读者核心结论                              │
  ├─────────────────────────────────────────────────────┤
  │  💡 问题性标题（引发思考）                            │
  │  '为何 7 月销量骤降 20%？'                          │
  │  '高端产品为何增长乏力？'                            │
  │  → 引导读者关注异常或机会点                          │
  └─────────────────────────────────────────────────────┘""")


# ============================================================
# 七、可视化伦理检查清单
# ============================================================
divider("7. 可视化伦理检查清单")

checklist = [
    ("Y 轴是否从 0 开始（柱状图）", "是"),
    ("是否避免了 3D 效果", "是"),
    ("是否色盲友好", "是"),
    ("是否有数据来源说明", "是"),
    ("是否标注了不确定性（如适用）", "是"),
    ("是否避免了双 Y 轴误导", "是"),
    ("颜色含义是否一致", "是"),
    ("是否完整展示数据（未裁剪）", "是"),
]

print()
for item, status in checklist:
    mark = "✓" if status == "是" else "✗"
    print(f"  {mark} {item}")

print("""
  伦理原则：
    1. 真实呈现数据 —— 不刻意误导
    2. 标注不确定性 —— 诚实展示误差
    3. 注明数据来源 —— 可追溯验证
    4. 完整展示数据 —— 不选择性裁剪""")


# ============================================================
# 八、专业报告设计流程
# ============================================================
divider("8. 专业报告设计流程")

print("""
  ┌────────────────────────────────────────────────────┐
  │ Step 1: 明确目标                                   │
  │   • 读者是谁？管理层 / 技术团队 / 客户？            │
  │   • 想传达什么结论？                               │
  │   • 读者需要做什么决策？                           │
  ├────────────────────────────────────────────────────┤
  │ Step 2: 选择图表                                   │
  │   • 根据数据关系选类型                             │
  │   • 根据读者专业度调整复杂度                       │
  │   • 一张图只讲一个故事                             │
  ├────────────────────────────────────────────────────┤
  │ Step 3: 设计草图                                   │
  │   • 先在纸上画草图                                 │
  │   • 确定布局、配色、重点                           │
  │   • 不急于写代码                                   │
  ├────────────────────────────────────────────────────┤
  │ Step 4: 实现并迭代                                 │
  │   • 用 Python 实现                                 │
  │   • 检查数据准确性                                 │
  │   • 优化可读性                                     │
  │   • 请同事 review                                  │
  ├────────────────────────────────────────────────────┤
  │ Step 5: 添加叙事                                   │
  │   • 标题点明结论                                   │
  │   • 添加关键注释                                   │
  │   • 配合文字说明                                   │
  └────────────────────────────────────────────────────┘""")


# ============================================================
# 九、总结：好的图表 vs 差的图表
# ============================================================
divider("9. 总结 —— 好图 vs 差图特征对比")

print("""
  ┌──────────────────┬──────────────────────────────────┐
  │   差的图表        │   好的图表                        │
  ├──────────────────┼──────────────────────────────────┤
  │  无标题           │  结论性标题点明核心                │
  │  无单位           │  明确单位与数据来源                │
  │  Y轴不从0开始     │  Y轴合理（柱状图从0）              │
  │  3D效果           │  2D简洁清晰                       │
  │  红绿配色         │  色盲友好配色                      │
  │  过多颜色         │  颜色有目的性编码                  │
  │  信息过载         │  一图一故事                       │
  │  无重点标注       │  主动标注关键信息                  │
  │  网格过重         │  浅色网格辅助阅读                  │
  │  字号过小         │  字体层级清晰可读                  │
  │  图例遮挡数据     │  图例位置合理                     │
  └──────────────────┴──────────────────────────────────┘""")

print("\\n  数据可视化的最高境界：")
print("    '让数据自己说话'")
print("  当读者一眼就能看出结论、做出决策时，")
print("  你就真正掌握了数据可视化的精髓。")
print("  技术只是手段，传达信息才是目的。")

print("\\n" + "=" * 72)
print("  本章演示完毕。数据可视化最佳实践核心要点：")
print("    1. 图表选择：根据数据关系选图，避免炫技")
print("    2. 配色方案：目的性、可读性、一致性，色盲友好优先")
print("    3. 可读性：字体层级、留白、刻度、标注关键信息")
print("    4. 避免陷阱：Y轴、3D、双Y轴、信息过载")
print("    5. 设计流程：明确目标→选图→草图→实现→叙事")
print("    6. 可视化伦理：真实、不确定、来源、完整")
print("=" * 72)
`,
  }
];
