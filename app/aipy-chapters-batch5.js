// =============================================================
// Python 人工智能开发教程 —— 第五批章节（机器学习基础组，共 5 章）
// =============================================================

export const chapters = [
  // =============================================================
  // 第1章：机器学习概论与分类
  // =============================================================
  {
    id: "aipy-ml-intro",
    icon: "🎯",
    group: "机器学习基础",
    title: "机器学习概论与分类",
    content: `
# 机器学习概论与分类

## 引言：从规则到数据驱动

在传统的编程范式中，程序员需要为每一个业务场景编写明确的规则：\`if-else\`、\`switch\`、循环与函数层层嵌套。这种基于规则的编程方式在问题边界清晰、规则稳定的场景中表现良好，比如计算工资、校验表单、调度任务。然而，当面对"识别一张图片里是不是猫"、"判断一封邮件是否是垃圾邮件"、"预测明天的股票涨跌"这类问题时，基于规则的编程就显得力不从心——因为这些问题背后的规律过于复杂，难以用有限条 if-else 描述清楚。

机器学习（Machine Learning，ML）正是为解决这类问题而生的一种范式。它的核心思想是：**让计算机从数据中自动学习规律，而不是由人类显式地编写规则**。我们给机器大量带标签的样本（例如"这是猫的图片"、"这是垃圾邮件"），机器通过算法归纳出从输入到输出的映射关系，从而具备对未知数据进行预测的能力。

本章作为整个"机器学习基础"组的第一章，将系统性地介绍机器学习的基本概念、分类体系、关键术语以及常见的工作流程。理解这些概念是后续学习具体算法（如 KNN、决策树、线性回归）的前提，也是正确使用 Scikit-learn 等框架的基础。

## 一、什么是机器学习

### 1.1 经典定义

机器学习的经典定义由 Tom Mitchell 在 1997 年提出：

> "A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E."

也就是说，如果一个程序在任务 T 上的表现（用 P 度量）会随着经验 E 的积累而提升，那么我们就说这个程序在"学习"。

以训练一个垃圾邮件分类器为例：
- **任务 T**：判断一封邮件是否是垃圾邮件
- **经验 E**：已有的数万封已标注邮件
- **度量 P**：分类的准确率、召回率

随着标注邮件数量 E 的增加，分类准确率 P 通常会逐渐提升，这个程序就是在"学习"。

### 1.2 与传统编程的对比

传统编程的范式是：**输入数据 + 规则 → 输出结果**。程序员通过编码规则来处理数据。

机器学习的范式是：**输入数据 + 输出结果 → 规则**。算法通过分析数据与结果的关系，自动总结出规则。

这种范式转换意味着：在机器学习项目中，数据的质量往往比算法本身更重要。再先进的算法，如果输入的是噪声多、标注错误的数据，也难以学到可靠的规律。这也衍生出机器学习领域一句经典的话：**Garbage In, Garbage Out（垃圾进，垃圾出）**。

### 1.3 机器学习能解决什么问题

机器学习擅长解决以下几类问题：
- **模式识别**：图像识别、语音识别、文字识别
- **预测分析**：销量预测、用户流失预测、信用评分
- **推荐系统**：商品推荐、内容推荐、好友推荐
- **异常检测**：欺诈检测、故障检测、入侵检测
- **自动化决策**：自动驾驶、智能投顾、游戏 AI

## 二、机器学习的三大分类

根据学习过程中是否有标签（监督信号）以及学习的目标，机器学习通常被划分为三大类：监督学习、无监督学习、强化学习。

### 2.1 监督学习（Supervised Learning）

监督学习的特点是：训练数据带有明确的"标签"（label）。算法的任务是学习从输入特征 X 到输出标签 Y 之间的映射函数 \`f: X → Y\`。

监督学习又分为两个子类：

**回归（Regression）**：标签是连续的数值。例如根据房屋面积、楼层、地段预测房价；根据历史销量预测下个月销量；根据学习时长预测考试分数。

**分类（Classification）**：标签是离散的类别。例如判断邮件是否为垃圾邮件（二分类）；识别图片中的动物是猫、狗还是鸟（多分类）；判断病人是否患病（二分类）。

监督学习的典型算法包括：线性回归、逻辑回归、KNN、决策树、随机森林、支持向量机（SVM）、朴素贝叶斯、神经网络等。

监督学习的核心假设是：训练数据的分布与未来测试数据的分布一致（独立同分布假设）。如果训练时用猫狗图片，部署时却要求识别车辆，模型自然无法工作。

### 2.2 无监督学习（Unsupervised Learning）

无监督学习的特点是：训练数据没有标签。算法的任务是从无标签数据中发现隐藏的结构或模式。

无监督学习常见的任务包括：

**聚类（Clustering）**：将相似的样本归为同一组。例如对用户进行分群，发现不同的用户群体；对新闻进行分组，自动发现话题；对基因表达数据进行分组，发现功能相似的基因。典型算法：K-Means、层次聚类、DBSCAN。

**降维（Dimensionality Reduction）**：将高维数据映射到低维空间，同时尽可能保留信息。例如把 1000 维的词向量降到 2 维以便可视化；把高维特征压缩到 50 维以加速后续训练。典型算法：PCA、t-SNE、UMAP。

**关联规则（Association Rules）**：发现数据中频繁共现的项目。例如"购买啤酒的人也倾向于购买尿布"这种经典的购物篮分析。典型算法：Apriori、FP-Growth。

**异常检测**：在无标签数据中识别偏离正常模式的样本。例如信用卡欺诈检测、设备故障预警。

### 2.3 强化学习（Reinforcement Learning）

强化学习的特点是：没有标签数据，但有一个"环境"和"奖励信号"。算法通过与环境交互、试错来学习最优策略。

在强化学习中，智能体（Agent）观察环境的状态（State），采取动作（Action），环境返回新的状态和奖励（Reward）。智能体的目标是学习一个策略（Policy），使得长期累积奖励最大化。

强化学习的典型应用：AlphaGo 下围棋、机器人控制、自动驾驶决策、推荐系统中的序列决策、游戏 AI（如 Dota 2、星际争霸）。

强化学习的核心挑战在于**探索-利用权衡（Exploration-Exploitation Trade-off）**：智能体既要尝试新的动作以发现更好的策略（探索），又要利用已知的最佳动作来获取奖励（利用）。

### 2.4 三者对比

| 维度 | 监督学习 | 无监督学习 | 强化学习 |
| --- | --- | --- | --- |
| 数据 | 有标签 | 无标签 | 通过交互产生 |
| 目标 | 学习 X→Y 映射 | 发现数据结构 | 最大化累积奖励 |
| 反馈 | 直接（标签） | 无反馈 | 延迟（奖励信号） |
| 评估 | 准确率、MSE 等 | 轮廓系数等 | 累积奖励 |
| 典型应用 | 分类、回归 | 聚类、降维 | 游戏、控制 |

此外，还有**半监督学习**（少量带标签 + 大量无标签数据）、**自监督学习**（从数据自身构造标签，如 BERT 的掩码语言模型）、**迁移学习**（把已学知识迁移到新任务）等介于三者之间的范式。

## 三、关键术语与概念

理解机器学习，必须先掌握一批核心术语。这些术语在后续章节中会反复出现。

### 3.1 数据相关术语

- **样本（Sample / Instance）**：一条具体的观测记录。例如一个用户、一张图片、一封邮件。
- **特征（Feature / Attribute）**：描述样本的属性。例如用户的年龄、收入、性别；图片的像素值。通常用向量 \`x\` 表示。
- **标签（Label / Target）**：监督学习中样本的输出值。例如"是否流失"、"房价"。通常用 \`y\` 表示。
- **特征空间（Feature Space）**：所有特征构成的向量空间。一个 d 维特征对应一个 d 维空间。
- **数据集（Dataset）**：样本的集合。通常分为训练集、验证集、测试集。

### 3.2 模型相关术语

- **模型（Model）**：从特征到标签的映射函数，是机器学习算法学习到的产物。
- **参数（Parameter）**：模型内部由训练数据学习得到的变量。例如线性回归 \`y = wx + b\` 中的 \`w\` 和 \`b\`。
- **超参数（Hyperparameter）**：在训练前手动设置的、不由数据学习的配置。例如 KNN 中的 \`k\`、决策树的最大深度、学习率。
- **假设空间（Hypothesis Space）**：模型所能表示的所有函数的集合。线性模型的假设空间是所有线性函数。

### 3.3 训练与评估术语

- **训练集（Training Set）**：用于训练模型的数据。
- **验证集（Validation Set）**：用于调整超参数、选择模型的数据。
- **测试集（Test Set）**：用于最终评估模型性能的数据，训练过程中不可见。
- **损失函数（Loss Function）**：衡量模型预测值与真实值之间差异的函数。例如 MSE、交叉熵。
- **经验风险（Empirical Risk）**：模型在训练集上的平均损失。
- **泛化能力（Generalization）**：模型对未见过的数据的预测能力，是机器学习的核心目标。

## 四、训练集与测试集

### 4.1 为什么要划分数据集

机器学习的最终目标不是"记住训练数据"，而是"预测新数据"。如果一个模型在训练集上准确率高达 99%，但在新数据上只有 60%，那它就是一个失败模型——这种模型只是"背下了"训练数据，并没有真正学到规律。

因此，我们必须用一部分**没参与训练**的数据来评估模型的真实能力，这部分数据就是测试集。

### 4.2 常见划分比例

- **训练 : 测试 = 7 : 3**：数据量较小时常用
- **训练 : 测试 = 8 : 2**：数据量较大时常用
- **训练 : 验证 : 测试 = 6 : 2 : 2**：需要调超参数时使用

在 Python 中，可以用简单的随机抽样实现数据划分：
\`\`\`python
import random
indices = list(range(n))
random.shuffle(indices)
split = int(n * 0.7)
train_idx, test_idx = indices[:split], indices[split:]
\`\`\`

### 4.3 交叉验证（Cross-Validation）

当数据量有限时，单次划分可能因为随机性导致评估不准。K 折交叉验证（K-Fold CV）的做法是：把数据均分成 K 份，每次用 K-1 份训练、剩下 1 份测试，重复 K 次，取平均性能作为最终评估。

K=10 是常用的选择。交叉验证的好处是充分利用每一条数据，评估更稳定；代价是计算开销变成 K 倍。

### 4.4 分层抽样（Stratified Sampling）

在分类任务中，如果直接随机划分，可能导致某个类别在训练集或测试集中比例失衡。例如 1000 个样本里只有 50 个正样本，随机划分后训练集可能完全没有正样本。

分层抽样保证每个类别在训练集和测试集中的比例与原数据一致。Scikit-learn 的 \`train_test_split\` 通过 \`stratify\` 参数支持。

## 五、过拟合与欠拟合

过拟合和欠拟合是机器学习中最关键的两个概念之一，几乎所有模型调优的最终目的都是在这两者之间寻找平衡。

### 5.1 欠拟合（Underfitting）

欠拟合是指模型过于简单，连训练数据中的基本规律都没有学到。

表现：
- 训练集误差高
- 测试集误差也高
- 模型在训练集上表现就不好

原因：
- 模型太简单（例如用线性模型拟合非线性数据）
- 特征太少或特征表达能力不足
- 训练时间不足（神经网络未收敛）

解决方法：
- 增加模型复杂度（如使用更深的决策树、加入多项式特征）
- 增加更多有效特征
- 减少正则化强度
- 训练更长时间

### 5.2 过拟合（Overfitting）

过拟合是指模型过于复杂，把训练数据中的噪声和偶然规律也"记住"了，导致在新数据上表现差。

表现：
- 训练集误差极低（甚至为 0）
- 测试集误差远高于训练集
- 模型在训练集上"表现太好"，反而不正常

原因：
- 模型太复杂（例如决策树过深）
- 训练数据太少
- 训练数据噪声过多
- 特征过多（维度灾难）

解决方法：
- 增加训练数据
- 降低模型复杂度（剪枝、限制深度）
- 正则化（L1、L2）
- 特征选择 / 降维
- 早停（Early Stopping）
- 集成学习（Bagging、随机森林）

### 5.3 偏差-方差权衡（Bias-Variance Tradeoff）

偏差和方差从另一个角度解释了过拟合与欠拟合：

- **偏差（Bias）**：模型预测值的平均值与真实值之间的差距。偏差高 → 欠拟合。
- **方差（Variance）**：模型在不同训练集上预测结果的波动程度。方差高 → 过拟合。

总误差 = 偏差² + 方差 + 不可约误差

理想模型是偏差和方差都低。但通常降低偏差会提高方差，反之亦然。这就是"权衡"。

### 5.4 学习曲线的诊断

通过观察学习曲线可以判断模型处于什么状态：
- 训练误差和验证误差都很高 → 欠拟合
- 训练误差很低，验证误差很高 → 过拟合
- 两者都低且接近 → 理想状态
- 随着训练数据增加，验证误差持续下降但仍高于训练误差 → 增加数据有帮助

## 六、机器学习项目的工作流程

一个完整的机器学习项目通常包含以下步骤：

1. **问题定义**：明确业务目标，将业务问题转化为机器学习问题（是分类还是回归？标签怎么定义？）
2. **数据收集**：从数据库、日志、API、爬虫等渠道获取数据
3. **数据探索**：统计描述、可视化、发现数据分布和异常
4. **数据清洗**：处理缺失值、异常值、重复值、数据类型转换
5. **特征工程**：特征提取、特征转换、特征选择、特征缩放
6. **数据划分**：拆分训练集、验证集、测试集
7. **模型选择**：根据问题类型选择候选算法
8. **模型训练**：用训练集拟合模型
9. **模型评估**：用验证集评估，调整超参数
10. **模型测试**：用测试集给出最终性能
11. **模型部署**：将模型集成到产品中
12. **监控迭代**：持续监控线上表现，定期重新训练

其中，特征工程往往占据 60% 以上的时间，是决定项目成败的关键。

## 七、评估指标速览

不同类型的任务需要不同的评估指标：

**回归指标**：
- MAE（平均绝对误差）
- MSE（均方误差）
- RMSE（均方根误差）
- R²（决定系数）

**分类指标**：
- Accuracy（准确率）
- Precision（精确率）
- Recall（召回率）
- F1-Score（精确率与召回率的调和平均）
- ROC-AUC（衡量二分类器整体性能）

具体指标的含义和计算将在后续算法实战章节中详细介绍。

## 本章小结

本章我们从宏观层面建立了对机器学习的整体认知：
- 机器学习是"从数据中学习规律"的范式，与传统编程形成互补
- 三大分类——监督、无监督、强化——分别对应有标签学习、无标签结构发现、交互式决策
- 训练集与测试集的划分是为了评估泛化能力，交叉验证能更稳健地评估
- 过拟合与欠拟合是模型调优的核心矛盾，偏差-方差权衡提供理论视角
- 一个完整的机器学习项目涉及从问题定义到部署监控的完整流程

理解这些概念后，我们就可以进入下一章，学习如何用 Scikit-learn 这一业界标准工具来实现这些流程。
`,
    code: `
# =============================================================
# 第1章代码：机器学习概念演示（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 numpy/sklearn）演示：
# 1. 数据集划分（训练集 / 测试集）
# 2. 简单的 KNN 分类器
# 3. 过拟合与欠拟合的对比演示
# 4. 交叉验证的简单实现
# 5. 偏差-方差概念的直观展示

import random
import math
from collections import Counter


# -------------------------------------------------------------
# 工具函数：计算欧氏距离
# -------------------------------------------------------------
def euclidean_distance(a, b):
    """计算两个等长向量之间的欧氏距离"""
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


# -------------------------------------------------------------
# 数据集划分：随机打乱后按比例切分
# -------------------------------------------------------------
def train_test_split(X, y, test_size=0.3, random_seed=42):
    """
    将数据集划分为训练集和测试集
    :param X: 特征列表
    :param y: 标签列表
    :param test_size: 测试集比例
    :param random_seed: 随机种子，保证结果可复现
    """
    random.seed(random_seed)
    indices = list(range(len(X)))
    random.shuffle(indices)
    split = int(len(X) * (1 - test_size))
    train_idx, test_idx = indices[:split], indices[split:]
    X_train = [X[i] for i in train_idx]
    y_train = [y[i] for i in train_idx]
    X_test = [X[i] for i in test_idx]
    y_test = [y[i] for i in test_idx]
    return X_train, X_test, y_train, y_test


# -------------------------------------------------------------
# 手写 KNN 分类器
# -------------------------------------------------------------
class KNNClassifier:
    """K 近邻分类器（纯 Python 实现）"""

    def __init__(self, k=3):
        self.k = k
        self.X_train = None
        self.y_train = None

    def fit(self, X, y):
        """'训练'阶段：KNN 是惰性学习，只需记住训练数据"""
        self.X_train = X
        self.y_train = y
        return self

    def predict_one(self, x):
        """对单个样本预测"""
        # 计算该样本到所有训练样本的距离
        distances = [euclidean_distance(x, xt) for xt in self.X_train]
        # 取距离最近的 k 个样本的索引
        k_idx = sorted(range(len(distances)), key=lambda i: distances[i])[: self.k]
        # 投票：统计 k 个邻居的标签
        k_labels = [self.y_train[i] for i in k_idx]
        # 返回出现次数最多的标签
        return Counter(k_labels).most_common(1)[0][0]

    def predict(self, X):
        return [self.predict_one(x) for x in X]


# -------------------------------------------------------------
# 评估函数：计算准确率
# -------------------------------------------------------------
def accuracy(y_true, y_pred):
    """准确率 = 预测正确数 / 总数"""
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)


# -------------------------------------------------------------
# 生成示例数据：两类二维点
# -------------------------------------------------------------
def generate_dataset(n_per_class=50, random_seed=42):
    """
    生成两类二维点：
    - 类别 0：均值 (2, 2) 附近的高斯分布
    - 类别 1：均值 (6, 6) 附近的高斯分布
    """
    random.seed(random_seed)
    X, y = [], []
    for _ in range(n_per_class):
        # 类别 0
        X.append([random.gauss(2, 0.8), random.gauss(2, 0.8)])
        y.append(0)
        # 类别 1
        X.append([random.gauss(6, 0.8), random.gauss(6, 0.8)])
        y.append(1)
    return X, y


# -------------------------------------------------------------
# 演示 1：基本流程
# -------------------------------------------------------------
def demo_basic_pipeline():
    print("=" * 60)
    print("演示 1：机器学习基本流程")
    print("=" * 60)

    # 1. 生成数据
    X, y = generate_dataset(n_per_class=50)
    print(f"数据集大小: {len(X)} 个样本, 特征维度: {len(X[0])}")

    # 2. 划分训练 / 测试集
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
    print(f"训练集: {len(X_train)} 样本, 测试集: {len(X_test)} 样本")

    # 3. 训练 KNN（k=3）
    knn = KNNClassifier(k=3).fit(X_train, y_train)

    # 4. 在训练集和测试集上分别评估
    train_acc = accuracy(y_train, knn.predict(X_train))
    test_acc = accuracy(y_test, knn.predict(X_test))
    print(f"k=3 时 训练集准确率: {train_acc:.4f}")
    print(f"k=3 时 测试集准确率: {test_acc:.4f}")


# -------------------------------------------------------------
# 演示 2：k 值对过拟合 / 欠拟合的影响
# -------------------------------------------------------------
def demo_overfitting_underfitting():
    print("\\n" + "=" * 60)
    print("演示 2：k 值与过拟合 / 欠拟合")
    print("=" * 60)
    print("观察：k=1 时训练集准确率=100%（过拟合风险）；k 越大越平滑。")

    X, y = generate_dataset(n_per_class=50)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

    print(f"{'k':>4} | {'训练集准确率':>14} | {'测试集准确率':>14} | 诊断")
    print("-" * 60)
    for k in [1, 3, 5, 11, 21, 41, 71]:
        knn = KNNClassifier(k=k).fit(X_train, y_train)
        tr = accuracy(y_train, knn.predict(X_train))
        te = accuracy(y_test, knn.predict(X_test))
        # 简单诊断
        if k == 1:
            diag = "过拟合（k=1）"
        elif abs(tr - te) < 0.05:
            diag = "理想"
        elif tr - te > 0.15:
            diag = "可能过拟合"
        else:
            diag = "正常"
        print(f"{k:>4} | {tr:>14.4f} | {te:>14.4f} | {diag}")


# -------------------------------------------------------------
# 演示 3：K 折交叉验证
# -------------------------------------------------------------
def k_fold_cv(X, y, k=5, model_k=3):
    """
    简单的 K 折交叉验证实现
    """
    n = len(X)
    fold_size = n // k
    indices = list(range(n))
    random.shuffle(indices)
    accuracies = []
    for fold in range(k):
        start = fold * fold_size
        end = start + fold_size if fold < k - 1 else n
        val_idx = indices[start:end]
        train_idx = indices[:start] + indices[end:]
        X_tr = [X[i] for i in train_idx]
        y_tr = [y[i] for i in train_idx]
        X_val = [X[i] for i in val_idx]
        y_val = [y[i] for i in val_idx]
        model = KNNClassifier(k=model_k).fit(X_tr, y_tr)
        acc = accuracy(y_val, model.predict(X_val))
        accuracies.append(acc)
    return accuracies


def demo_cross_validation():
    print("\\n" + "=" * 60)
    print("演示 3：5 折交叉验证")
    print("=" * 60)
    X, y = generate_dataset(n_per_class=50)
    accs = k_fold_cv(X, y, k=5, model_k=3)
    for i, a in enumerate(accs, 1):
        print(f"  Fold {i} 准确率: {a:.4f}")
    print(f"  平均准确率: {sum(accs) / len(accs):.4f}")
    print(f"  标准差: {math.sqrt(sum((a - sum(accs)/len(accs))**2 for a in accs) / len(accs)):.4f}")


# -------------------------------------------------------------
# 演示 4：偏差-方差直观展示
# -------------------------------------------------------------
def demo_bias_variance():
    print("\\n" + "=" * 60)
    print("演示 4：偏差-方差概念展示")
    print("=" * 60)
    print("用同一数据生成过程，重复采样多份训练集，")
    print("观察'简单模型'与'复杂模型'在不同训练集上的预测波动。\\n")

    def true_func(x):
        return math.sin(x)

    def gen_samples(n=20, seed=0):
        random.seed(seed)
        xs = [random.uniform(0, 6) for _ in range(n)]
        ys = [true_func(x) + random.gauss(0, 0.2) for x in xs]
        return xs, ys

    # 简单模型：常数预测（高偏差，低方差）
    # 复杂模型：1-NN（低偏差，高方差）
    test_point = 3.0
    simple_preds, complex_preds = [], []
    for seed in range(20):
        xs, ys = gen_samples(n=20, seed=seed)
        # 简单模型：用训练集均值作为预测
        simple_pred = sum(ys) / len(ys)
        # 复杂模型：找最接近 test_point 的样本
        nn_idx = min(range(len(xs)), key=lambda i: abs(xs[i] - test_point))
        complex_pred = ys[nn_idx]
        simple_preds.append(simple_pred)
        complex_preds.append(complex_pred)

    true_val = true_func(test_point)
    simple_mean = sum(simple_preds) / len(simple_preds)
    complex_mean = sum(complex_preds) / len(complex_preds)
    simple_var = sum((p - simple_mean) ** 2 for p in simple_preds) / len(simple_preds)
    complex_var = sum((p - complex_mean) ** 2 for p in complex_preds) / len(complex_preds)

    print(f"真实值（sin(3.0)）: {true_val:.4f}")
    print(f"简单模型: 均值预测 = {simple_mean:.4f}, 偏差² = {(simple_mean-true_val)**2:.4f}, 方差 = {simple_var:.4f}")
    print(f"复杂模型: 1-NN     = {complex_mean:.4f}, 偏差² = {(complex_mean-true_val)**2:.4f}, 方差 = {complex_var:.4f}")
    print("\\n结论：简单模型偏差大方差小，复杂模型偏差小方差大。")


# -------------------------------------------------------------
# 主程序入口
# -------------------------------------------------------------
if __name__ == "__main__":
    demo_basic_pipeline()
    demo_overfitting_underfitting()
    demo_cross_validation()
    demo_bias_variance()
    print("\\n" + "=" * 60)
    print("✅ 所有演示完成！")
    print("=" * 60)
`,
  },

  // =============================================================
  // 第2章：Scikit-learn入门
  // =============================================================
  {
    id: "aipy-sklearn",
    icon: "🛠️",
    group: "机器学习基础",
    title: "Scikit-learn入门",
    content: `
# Scikit-learn入门

## 引言：业界标准的机器学习框架

在 Python 生态中，如果让你列举一个最经典、最广泛使用的机器学习库，那一定非 **Scikit-learn** 莫属。它建立在 NumPy、SciPy、matplotlib 之上，提供了从数据预处理、特征工程、模型训练到模型评估的一整套统一 API。无论你是初学者还是资深工程师，几乎都会在日常机器学习工作中接触到它。

Scikit-learn 由 David Cournapeau 在 2007 年作为 Google Summer of Code 项目启动，后经 INRIA（法国国家信息与自动化研究所）持续维护，逐渐成为开源机器学习领域的标杆。它的设计哲学深深影响了后续众多机器学习框架，包括 Spark MLlib、H2O.ai 等。

本章不会教你安装 \`pip install scikit-learn\`（这部分留给你查阅官方文档），而是聚焦于它的 **API 设计理念**、**核心对象（Estimator / Transformer / Pipeline）** 以及 **模型选择（model_selection）模块的用法**。理解这些之后，你阅读官方文档、使用任何新算法都会变得得心应手——因为它们都遵循同一套约定。

由于本教程的代码运行环境是纯 Python 标准库，我们会在概念讲解之后，用纯 Python 模拟出 Scikit-learn 的核心 API 风格，让你在不安装任何依赖的情况下也能"体会"这套 API 的精妙之处。

## 一、Scikit-learn 的设计哲学

Scikit-learn 之所以能成为业界标准，关键在于它的一套统一设计哲学，可概括为三点：

### 1.1 一致的接口

无论是 KNN、SVM、随机森林还是神经网络，所有监督学习算法都遵循同样的接口：
- \`fit(X, y)\`：训练模型
- \`predict(X)\`：预测
- \`score(X, y)\`：评估

这意味着你只要学会一个算法的用法，就能几乎无成本地切换到另一个算法——只需要更换类名，其余代码完全不变。

### 1.2 不可变对象

Scikit-learn 的对象在 fit 之后会"学习"出参数，但这些参数被存为对象的属性（如 \`model.coef_\`、\`model.intercept_\`）。你不会修改这些属性，只会读取它们。这种"训练产出只读"的设计让代码更可预测。

### 1.3 显式优于隐式

Scikit-learn 不会偷偷做你没要求的事情。例如：
- \`fit\` 不会自动归一化你的数据，需要你显式调用 \`StandardScaler\`
- \`predict\` 不会自动 inverse 变换，需要你显式调用 \`inverse_transform\`
- 默认超参数是合理的，但不会"自动调优"

这种设计降低了"惊喜"（surprise），让代码可调试、可解释。

## 二、三大核心对象

Scikit-learn 的所有类几乎都可以归为以下四类之一：**Estimator**、**Transformer**、**Predictor**、**Meta-Estimator**。

### 2.1 Estimator（估计器）：所有对象的基类

Estimator 是最基础的概念，任何能从数据中"学习"出参数的对象都是 Estimator。它必须实现 \`fit\` 方法：

\`\`\`python
class Estimator:
    def fit(self, X, y=None):
        # 学习参数，存为以 _ 结尾的属性
        self.param_ = ...
        return self  # 返回 self 以支持链式调用
\`\`\`

注意：学习到的参数约定以 \`_\` 结尾（如 \`coef_\`、\`classes_\`、\`cluster_centers_\`），这是一个跨整个库的命名约定，方便用户区分"超参数"和"学习参数"。

### 2.2 Transformer（转换器）：数据变换的对象

Transformer 继承自 Estimator，额外实现 \`transform\` 和 \`fit_transform\`：

\`\`\`python
class Transformer(Estimator):
    def fit(self, X, y=None):
        # 学习变换所需的参数（如均值、方差、词表）
        return self

    def transform(self, X):
        # 用学到的参数变换数据
        return X_transformed

    def fit_transform(self, X, y=None):
        # 等价于 fit 后 transform，但通常有更高效的实现
        return self.fit(X, y).transform(X)
\`\`\`

典型的 Transformer：
- \`StandardScaler\`：标准化（z = (x - μ) / σ）
- \`MinMaxScaler\`：归一化到 [0, 1]
- \`PCA\`：主成分分析降维
- \`OneHotEncoder\`：独热编码
- \`PolynomialFeatures\`：生成多项式特征

Transformer 的关键设计是：\`fit\` 只用训练数据学参数，\`transform\` 应用到训练集和测试集。这避免了"数据泄漏"——绝不能用测试集的统计量去变换训练集。

### 2.3 Predictor（预测器）：能预测的对象

Predictor 继承自 Estimator，额外实现 \`predict\` 和 \`score\`：

\`\`\`python
class Predictor(Estimator):
    def predict(self, X):
        return y_pred

    def score(self, X, y):
        # 分类器默认返回 accuracy，回归器默认返回 R²
        ...
\`\`\`

分类器通常还实现 \`predict_proba\` 返回概率，\`decision_function\` 返回决策值。

### 2.4 Meta-Estimator（元估计器）：组合其他估计器

Meta-Estimator 把其他 Estimator 作为参数，组合出更强大的模型：
- \`Pipeline\`：把多个 Transformer 和一个 Predictor 串起来
- \`GridSearchCV\`：网格搜索 + 交叉验证
- \`BaggingClassifier\`、\`RandomForestClassifier\`：集成学习
- \`OneVsRestClassifier\`：多分类策略

Meta-Estimator 的接口会"代理"到底层的 Estimator，例如 \`Pipeline.predict\` 会调用最后一个 Predictor 的 \`predict\`。

## 三、Pipeline：组合的艺术

### 3.1 为什么需要 Pipeline

考虑一个典型的机器学习流程：
1. 缺失值填充
2. 标准化
3. 多项式特征
4. 模型训练

如果没有 Pipeline，代码会是这样：

\`\`\`python
imputer.fit(X_train)
X_train = imputer.transform(X_train)
X_test = imputer.transform(X_test)

scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)

poly.fit(X_train)
X_train = poly.transform(X_train)
X_test = poly.transform(X_test)

model.fit(X_train, y_train)
model.predict(X_test)
\`\`\`

代码冗长，且容易出错（例如忘了对测试集做相同的变换，或者顺序错了）。

### 3.2 Pipeline 的写法

\`\`\`python
from sklearn.pipeline import Pipeline
pipe = Pipeline([
    ('imputer', SimpleImputer()),
    ('scaler', StandardScaler()),
    ('poly', PolynomialFeatures(degree=2)),
    ('model', LinearRegression())
])
pipe.fit(X_train, y_train)
pipe.predict(X_test)
\`\`\`

Pipeline 的优势：
- **简洁**：把所有步骤封装为一个对象
- **防泄漏**：交叉验证时，每折都重新 fit，避免数据泄漏
- **可序列化**：直接保存整个 Pipeline，部署时一次加载
- **超参数搜索**：可以用 \`pipe__poly__degree\` 这种语法同时搜索多步骤的超参数

### 3.3 ColumnTransformer：处理异构列

实际数据中往往既有数值列又有类别列，需要分别处理。ColumnTransformer 允许对不同的列应用不同的 Transformer：

\`\`\`python
from sklearn.compose import ColumnTransformer
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), ['age', 'income']),
    ('cat', OneHotEncoder(), ['gender', 'city'])
])
\`\`\`

再把它放进 Pipeline 即可。

## 四、模型选择（model_selection）

\`sklearn.model_selection\` 是 Scikit-learn 中最重要的模块之一，提供数据划分和模型评估的工具。

### 4.1 train_test_split

最基础的工具，把数据划分为训练集和测试集：

\`\`\`python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
\`\`\`

参数说明：
- \`test_size\`：测试集比例（0~1）或绝对数量
- \`random_state\`：随机种子，保证可复现
- \`stratify\`：按指定变量分层抽样，分类任务中传入 \`y\` 保证类别比例

### 4.2 K 折交叉验证

\`\`\`python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(scores.mean(), scores.std())
\`\`\`

更灵活的拆分器：
- \`KFold\`：标准 K 折
- \`StratifiedKFold\`：分层 K 折（保持类别比例）
- \`GroupKFold\`：按组分（避免同组数据同时出现在训练和测试集）
- \`TimeSeriesSplit\`：时间序列交叉验证（不能随机打乱）

### 4.3 超参数搜索

\`GridSearchCV\` 网格搜索所有超参数组合：

\`\`\`python
from sklearn.model_selection import GridSearchCV
param_grid = {'n_neighbors': [3, 5, 7, 9], 'weights': ['uniform', 'distance']}
grid = GridSearchCV(KNeighborsClassifier(), param_grid, cv=5, scoring='accuracy')
grid.fit(X_train, y_train)
print(grid.best_params_, grid.best_score_)
best_model = grid.best_estimator_
\`\`\`

\`RandomizedSearchCV\` 随机采样超参数组合，适合搜索空间大时使用。

更高级的还有 \`HalvingGridSearchCV\`（连续减半）和第三方库 Optuna。

### 4.4 评估指标

\`sklearn.metrics\` 提供大量评估函数：
- 分类：\`accuracy_score\`、\`precision_score\`、\`recall_score\`、\`f1_score\`、\`roc_auc_score\`、\`confusion_matrix\`、\`classification_report\`
- 回归：\`mean_squared_error\`、\`mean_absolute_error\`、\`r2_score\`

\`scoring\` 参数既可以是字符串（如 \`'accuracy'\`），也可以是函数对象。

## 五、Scikit-learn 的算法地图

按学习类型分类：

**分类（Classification）**：
- \`KNeighborsClassifier\`：K 近邻
- \`LogisticRegression\`：逻辑回归
- \`DecisionTreeClassifier\`：决策树
- \`RandomForestClassifier\`：随机森林
- \`GradientBoostingClassifier\`：梯度提升
- \`SVC\`：支持向量机
- \`GaussianNB\`：朴素贝叶斯
- \`MLPClassifier\`：多层感知机

**回归（Regression）**：
- \`LinearRegression\`：线性回归
- \`Ridge\`：岭回归（L2）
- \`Lasso\`：Lasso 回归（L1）
- \`DecisionTreeRegressor\`：决策树回归
- \`RandomForestRegressor\`：随机森林回归
- \`SVR\`：支持向量回归

**聚类（Clustering）**：
- \`KMeans\`：K 均值
- \`DBSCAN\`：基于密度的聚类
- \`AgglomerativeClustering\`：层次聚类

**降维（Dimensionality Reduction）**：
- \`PCA\`：主成分分析
- \`TruncatedSVD\`：截断奇异值分解
- \`TSNE\`：t-SNE 可视化

## 六、Scikit-learn 实战模式

### 6.1 分类任务标准模板

\`\`\`python
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([('scaler', StandardScaler()), ('clf', KNeighborsClassifier())])
param_grid = {'clf__n_neighbors': [3, 5, 7]}
grid = GridSearchCV(pipe, param_grid, cv=5, scoring='f1')
grid.fit(X_train, y_train)
print(grid.best_params_)
y_pred = grid.predict(X_test)
print(classification_report(y_test, y_pred))
\`\`\`

### 6.2 持久化

训练好的模型可以序列化到磁盘：

\`\`\`python
import joblib
joblib.dump(grid.best_estimator_, 'model.pkl')
model = joblib.load('model.pkl')
\`\`\`

注意：加载模型的 Python 和 sklearn 版本应当与保存时一致，否则可能不兼容。

## 七、纯 Python 模拟 Scikit-learn API

为了让你直观感受 Scikit-learn 的 API 设计，下面的代码用纯 Python（无第三方库）模拟出 \`Estimator / Transformer / Pipeline\` 的核心 API。虽然功能简化，但接口风格与真实 Scikit-learn 几乎一致。

通过这段代码你将看到：
- \`fit\` / \`transform\` / \`predict\` 的统一约定
- 参数以 \`_\` 结尾的命名规范
- Pipeline 如何链式组合多个步骤
- \`train_test_split\` 与交叉验证的纯 Python 实现

## 本章小结

- Scikit-learn 通过统一的 \`fit/predict/transform\` 接口，让算法切换几乎零成本
- Estimator / Transformer / Predictor / Meta-Estimator 是四大核心对象
- Pipeline 把数据预处理与模型训练封装为整体，避免数据泄漏
- model_selection 模块提供数据划分、交叉验证、超参数搜索
- 评估指标按任务类型选择，分类用 accuracy/F1，回归用 MSE/R²

下一章我们将深入特征工程，学习如何把"原始数据"变为"模型能理解的优质输入"。
`,
    code: `
# =============================================================
# 第2章代码：用纯 Python 模拟 Scikit-learn 的核心 API
# =============================================================
# 目标：在不安装 sklearn 的前提下，让你直观感受
#       Estimator / Transformer / Pipeline 的设计模式
# 实现：
#   - BaseEstimator 基类
#   - StandardScaler（标准化 Transformer）
#   - MinMaxScaler（归一化 Transformer）
#   - KNNClassifier（Predictor）
#   - Pipeline（Meta-Estimator）
#   - train_test_split / cross_val_score / GridSearchCV 简化版

import math
import random
from collections import Counter


# -------------------------------------------------------------
# 基类：BaseEstimator
# -------------------------------------------------------------
class BaseEstimator:
    """所有估计器的基类（模拟 sklearn.base.BaseEstimator）"""

    def get_params(self, deep=True):
        return {k: getattr(self, k) for k in self._param_names()}

    def set_params(self, **params):
        for k, v in params.items():
            setattr(self, k, v)
        return self

    def _param_names(self):
        return []


# -------------------------------------------------------------
# Transformer 基类
# -------------------------------------------------------------
class TransformerMixin:
    def fit_transform(self, X, y=None):
        return self.fit(X, y).transform(X)


# -------------------------------------------------------------
# StandardScaler：标准化 (x - mean) / std
# -------------------------------------------------------------
class StandardScaler(BaseEstimator, TransformerMixin):
    """模拟 sklearn.preprocessing.StandardScaler"""

    def __init__(self):
        self.mean_ = None
        self.scale_ = None

    def fit(self, X, y=None):
        n = len(X)
        d = len(X[0])
        self.mean_ = [sum(X[i][j] for i in range(n)) / n for j in range(d)]
        self.scale_ = []
        for j in range(d):
            var = sum((X[i][j] - self.mean_[j]) ** 2 for i in range(n)) / n
            self.scale_.append(math.sqrt(var) if var > 0 else 1.0)
        return self

    def transform(self, X):
        return [[(x[j] - self.mean_[j]) / self.scale_[j] for j in range(len(x))] for x in X]


# -------------------------------------------------------------
# MinMaxScaler：归一化到 [0, 1]
# -------------------------------------------------------------
class MinMaxScaler(BaseEstimator, TransformerMixin):
    """模拟 sklearn.preprocessing.MinMaxScaler"""

    def __init__(self):
        self.min_ = None
        self.scale_ = None

    def fit(self, X, y=None):
        d = len(X[0])
        self.min_ = [min(X[i][j] for i in range(len(X))) for j in range(d)]
        maxs = [max(X[i][j] for i in range(len(X))) for j in range(d)]
        self.scale_ = [(maxs[j] - self.min_[j]) or 1.0 for j in range(d)]
        return self

    def transform(self, X):
        return [[(x[j] - self.min_[j]) / self.scale_[j] for j in range(len(x))] for x in X]


# -------------------------------------------------------------
# KNNClassifier：K 近邻分类器
# -------------------------------------------------------------
class KNNClassifier(BaseEstimator):
    """模拟 sklearn.neighbors.KNeighborsClassifier"""

    def __init__(self, n_neighbors=3):
        self.n_neighbors = n_neighbors
        self.X_ = None
        self.y_ = None
        self.classes_ = None

    def _param_names(self):
        return ['n_neighbors']

    def fit(self, X, y):
        self.X_ = X
        self.y_ = y
        self.classes_ = sorted(set(y))
        return self

    def _predict_one(self, x):
        dists = [math.sqrt(sum((a - b) ** 2 for a, b in zip(x, xt))) for xt in self.X_]
        k = min(self.n_neighbors, len(dists))
        idx = sorted(range(len(dists)), key=lambda i: dists[i])[:k]
        labels = [self.y_[i] for i in idx]
        return Counter(labels).most_common(1)[0][0]

    def predict(self, X):
        return [self._predict_one(x) for x in X]

    def score(self, X, y):
        y_pred = self.predict(X)
        correct = sum(1 for t, p in zip(y, y_pred) if t == p)
        return correct / len(y)


# -------------------------------------------------------------
# train_test_split
# -------------------------------------------------------------
def train_test_split(X, y, test_size=0.25, random_state=None, stratify=None):
    """模拟 sklearn.model_selection.train_test_split"""
    rng = random.Random(random_state)
    n = len(X)
    if stratify is not None:
        # 简化分层抽样：按 stratify 类别分组后，每类按比例划分
        by_class = {}
        for i, c in enumerate(stratify):
            by_class.setdefault(c, []).append(i)
        train_idx, test_idx = [], []
        for c, idxs in by_class.items():
            rng.shuffle(idxs)
            sp = int(len(idxs) * (1 - test_size))
            train_idx.extend(idxs[:sp])
            test_idx.extend(idxs[sp:])
        rng.shuffle(train_idx)
        rng.shuffle(test_idx)
    else:
        idx = list(range(n))
        rng.shuffle(idx)
        sp = int(n * (1 - test_size))
        train_idx, test_idx = idx[:sp], idx[sp:]
    return ([X[i] for i in train_idx], [X[i] for i in test_idx],
            [y[i] for i in train_idx], [y[i] for i in test_idx])


# -------------------------------------------------------------
# Pipeline
# -------------------------------------------------------------
class Pipeline(BaseEstimator):
    """模拟 sklearn.pipeline.Pipeline"""

    def __init__(self, steps):
        self.steps = steps  # [(name, estimator), ...]

    @property
    def named_steps(self):
        return dict(self.steps)

    def fit(self, X, y=None):
        Xt = X
        for name, step in self.steps[:-1]:
            step.fit(Xt, y)
            Xt = step.transform(Xt)
        self.steps[-1][1].fit(Xt, y)
        return self

    def predict(self, X):
        Xt = X
        for name, step in self.steps[:-1]:
            Xt = step.transform(Xt)
        return self.steps[-1][1].predict(Xt)

    def score(self, X, y):
        Xt = X
        for name, step in self.steps[:-1]:
            Xt = step.transform(Xt)
        return self.steps[-1][1].score(Xt, y)


# -------------------------------------------------------------
# cross_val_score
# -------------------------------------------------------------
def cross_val_score(estimator, X, y, cv=5):
    """简化版 K 折交叉验证"""
    n = len(X)
    fold = n // cv
    idx = list(range(n))
    random.Random(42).shuffle(idx)
    scores = []
    for k in range(cv):
        start, end = k * fold, (k + 1) * fold if k < cv - 1 else n
        val_idx = idx[start:end]
        tr_idx = idx[:start] + idx[end:]
        X_tr = [X[i] for i in tr_idx]
        y_tr = [y[i] for i in tr_idx]
        X_val = [X[i] for i in val_idx]
        y_val = [y[i] for i in val_idx]
        # 注意：每次都要新建 estimator，避免参数污染
        est = _clone(estimator)
        est.fit(X_tr, y_tr)
        scores.append(est.score(X_val, y_val))
    return scores


def _clone(estimator):
    """简化版克隆：用相同参数新建一个对象"""
    if isinstance(estimator, Pipeline):
        return Pipeline([(n, _clone(s)) for n, s in estimator.steps])
    params = estimator.get_params()
    return type(estimator)(**params)


# -------------------------------------------------------------
# GridSearchCV（极简版）
# -------------------------------------------------------------
class GridSearchCV:
    """模拟 sklearn.model_selection.GridSearchCV（仅支持单步估计器）"""

    def __init__(self, estimator, param_grid, cv=5):
        self.estimator = estimator
        self.param_grid = param_grid
        self.cv = cv
        self.best_params_ = None
        self.best_score_ = -1
        self.best_estimator_ = None

    def fit(self, X, y):
        # 枚举所有超参数组合
        import itertools
        keys = list(self.param_grid.keys())
        for values in itertools.product(*[self.param_grid[k] for k in keys]):
            params = dict(zip(keys, values))
            est = _clone(self.estimator).set_params(**params)
            scores = cross_val_score(est, X, y, cv=self.cv)
            mean = sum(scores) / len(scores)
            if mean > self.best_score_:
                self.best_score_ = mean
                self.best_params_ = params
                self.best_estimator_ = _clone(self.estimator).set_params(**params)
        self.best_estimator_.fit(X, y)
        return self

    def predict(self, X):
        return self.best_estimator_.predict(X)


# -------------------------------------------------------------
# 生成测试数据
# -------------------------------------------------------------
def make_classification(n_per_class=40, seed=42):
    rng = random.Random(seed)
    X, y = [], []
    for _ in range(n_per_class):
        X.append([rng.gauss(2, 1), rng.gauss(2, 1)])
        y.append(0)
        X.append([rng.gauss(6, 1), rng.gauss(6, 1)])
        y.append(1)
    return X, y


# -------------------------------------------------------------
# 主程序：完整演示 Scikit-learn 风格工作流
# -------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("Scikit-learn API 风格演示（纯 Python 实现）")
    print("=" * 60)

    X, y = make_classification(n_per_class=40)
    print(f"数据集: {len(X)} 样本, 特征维度: {len(X[0])}")

    # 1. 划分数据集（分层抽样）
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    print(f"训练集: {len(X_train)}, 测试集: {len(X_test)}")

    # 2. 用 Pipeline 组合标准化 + KNN
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', KNNClassifier(n_neighbors=3))
    ])
    pipe.fit(X_train, y_train)
    print(f"\\nPipeline 在训练集 score: {pipe.score(X_train, y_train):.4f}")
    print(f"Pipeline 在测试集 score: {pipe.score(X_test, y_test):.4f}")

    # 3. 交叉验证
    scores = cross_val_score(pipe, X, y, cv=5)
    print(f"\\n5 折交叉验证得分: {[f'{s:.3f}' for s in scores]}")
    print(f"平均: {sum(scores)/len(scores):.4f}")

    # 4. 网格搜索调参
    print("\\n网格搜索 KNN 的 n_neighbors...")
    grid = GridSearchCV(
        KNNClassifier(),
        param_grid={'n_neighbors': [1, 3, 5, 7, 9, 11]},
        cv=5
    )
    # 注意：网格搜索内部会重新标准化（这里仅演示 API，实际应包在 Pipeline 中）
    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    grid.fit(X_train_s, y_train)
    print(f"最佳参数: {grid.best_params_}")
    print(f"最佳 CV 得分: {grid.best_score_:.4f}")

    # 5. 用最佳模型在测试集评估
    X_test_s = scaler.transform(X_test)
    test_score = grid.best_estimator_.score(X_test_s, y_test)
    print(f"最佳模型在测试集 score: {test_score:.4f}")

    print("\\n" + "=" * 60)
    print("✅ Scikit-learn API 演示完成！")
    print("你可以把这套 API 设计模式直接迁移到真实的 sklearn 上。")
    print("=" * 60)
`,
  },

  // =============================================================
  // 第3章：特征工程详解
  // =============================================================
  {
    id: "aipy-feature",
    icon: "🔧",
    group: "机器学习基础",
    title: "特征工程详解",
    content: `
# 特征工程详解

## 引言：数据决定上限，算法逼近上限

在机器学习圈子里流传着一句话：**"数据和特征决定了机器学习的上限，而模型和算法只是逼近这个上限。"** 这句话的潜台词是：再先进的算法，如果输入的是糟糕的特征，也难以取得好效果；反过来，朴素如线性回归，如果喂给它精心设计的特征，往往也能跑出令人惊艳的成绩。

特征工程（Feature Engineering）就是"把原始数据转化为模型能更好利用的特征"的过程。它包括特征提取、特征清洗、特征编码、特征缩放、特征变换、特征选择、特征组合等一系列技术。在工业界，资深算法工程师 60%~80% 的时间都花在特征工程上，而不是调模型。

本章将系统介绍特征工程的五大主题：**特征提取、特征编码、特征缩放、多项式特征、特征选择**。每个主题都会讲解原理、适用场景和注意事项，并配以纯 Python 实现，让你"知其然且知其所以然"。

## 一、特征提取（Feature Extraction）

特征提取是从原始数据中构造出数值向量的过程。原始数据的形态千差万别——文本、图像、时间序列、类别——必须转化为数值特征才能被模型消费。

### 1.1 数值型特征

数值型特征是最理想的形式，但也要注意几点：
- **量纲**：年龄（0~100）和收入（0~1000000）的尺度差异巨大，需要缩放
- **分布**：长尾分布的特征取对数后往往更接近正态，对线性模型友好
- **异常值**：极端值会扭曲均值和方差，需要 clip 或分箱

常见的数值变换：
- 对数变换：\`x' = log(x + 1)\`，适合右偏分布
- 平方根变换：\`x' = sqrt(x)\`，比 log 更温和
- Box-Cox 变换：可调参数的幂变换

### 1.2 类别型特征

类别特征不能直接喂给大多数模型（树模型除外），需要编码。常见编码方式：
- **One-Hot 编码**：每个类别一个二值位
- **Label Encoding**：把类别映射为整数（仅适合有序类别或树模型）
- **Target Encoding**：用类别对应的目标均值替代（注意交叉验证防止泄漏）
- **Frequency Encoding**：用类别出现的频率替代
- **Embedding**：把类别映射为低维稠密向量（深度学习常用）

### 1.3 文本特征

文本是最常见的非结构化数据，提取特征的主流方法：
- **词袋模型（Bag of Words）**：统计每个词出现的次数，得到稀疏向量
- **TF-IDF**：词频乘以逆文档频率，降低常见词权重
- **N-gram**：考虑相邻词组，捕获局部语序
- **词向量（Word2Vec / GloVe）**：把每个词映射为稠密向量
- **Transformer 嵌入**：BERT 等模型输出的上下文相关向量

### 1.4 时间特征

时间戳蕴含丰富信息，常见的拆解：
- 年、月、日、小时、分钟、秒
- 星期几、是否周末、是否节假日
- 季节、季度
- 距某事件的天数（距上次购买、距活动开始）

### 1.5 图像特征

- 像素值（最朴素）
- 颜色直方图
- 边缘特征（Sobel、Canny）
- 纹理特征（LBP、HOG）
- 深度学习特征（CNN 倒数第二层输出）

## 二、特征编码（Feature Encoding）

### 2.1 One-Hot 编码

One-Hot 把每个类别扩展为一个二值列：

| 原始 | 颜色 | One-Hot |
| --- | --- | --- |
| 0 | 红 | [1, 0, 0] |
| 1 | 绿 | [0, 1, 0] |
| 2 | 蓝 | [0, 0, 1] |

**优点**：不引入虚假的序数关系，适合大多数模型
**缺点**：类别很多时维度爆炸（如城市、用户 ID）

实践建议：
- 类别数 < 10：直接 One-Hot
- 类别数 10~50：可考虑 Frequency/Target Encoding
- 类别数 > 50：考虑 Embedding 或先做聚类

### 2.2 Label Encoding

把类别映射为整数：红=0, 绿=1, 蓝=2。

**注意**：这只适合有序类别（如低/中/高），或树模型（树能处理任意划分）。如果给线性模型或 SVM，会被错误地理解为"红 < 绿 < 蓝"的序数关系。

### 2.3 Target Encoding

用每个类别对应的目标均值替代。例如"北京"这个城市的房价均值是 500 万，就把"北京"编码为 500。

**关键问题**：直接用全量数据算均值会**数据泄漏**——训练时用到了标签信息。正确做法是在交叉验证的每一折内部计算，或者加噪声平滑。

公式（带平滑）：
\`\`\`
enc(cat) = (n_cat * mean_cat + alpha * global_mean) / (n_cat + alpha)
\`\`\`
其中 \`alpha\` 是平滑参数，类别样本少时趋向全局均值。

## 三、特征缩放（Feature Scaling）

特征缩放是把不同特征的取值范围统一到相近尺度的过程。**对距离敏感的算法（KNN、SVM、K-Means）和梯度下降类算法（线性回归、神经网络）尤其重要**；树模型则不需要。

### 3.1 标准化（StandardScaler）

\`z = (x - μ) / σ\`

变换后均值为 0、方差为 1。**最常用**，适合大多数场景，尤其是假设特征服从正态分布的算法（如逻辑回归、PCA）。

### 3.2 归一化（MinMaxScaler）

\`x' = (x - min) / (max - min)\`

变换后落在 [0, 1]。适合像素值、需要固定范围的场景（如神经网络输入）。

**缺点**：对异常值敏感——一个极端大值会把其他值压缩到极小区间。

### 3.3 RobustScaler

\`x' = (x - median) / IQR\`

用中位数和四分位距，对异常值鲁棒。适合数据中存在显著离群点的场景。

### 3.4 MaxAbsScaler

除以绝对值最大值，结果落在 [-1, 1]。适合稀疏数据，能保留 0 的稀疏性。

### 3.5 缩放的注意事项

- **必须用训练集的统计量变换测试集**，不能合并 fit
- **必须放在 Pipeline 内部**，交叉验证时每折重新 fit
- **树模型不需要缩放**：决策树按阈值划分，与尺度无关

## 四、多项式特征（Polynomial Features）

### 4.1 为什么要构造多项式特征

线性模型 \`y = w1*x1 + w2*x2 + b\` 只能拟合线性关系。但如果真实关系是 \`y = 2*x1² + 3*x1*x2 - x2²\`，线性模型就无能为力。

通过多项式特征展开，把 \`x1, x2\` 扩展为 \`x1, x2, x1², x1*x2, x2²\`，线性模型就能拟合上述非线性关系。这就是"用线性模型表达非线性"的经典技巧。

### 4.2 数学形式

对 d 个特征，degree=n 的多项式展开包含所有 \`x1^a1 * x2^a2 * ... * xd^ad\`，其中 \`a1+a2+...+ad <= n\`。

特征数从 d 增长到 \`C(d+n, n)\`。例如 d=3, n=2 时，特征数从 3 变为 10。

### 4.3 实践建议

- degree 不要太大（2~3 即可），否则特征数爆炸、过拟合严重
- 多项式特征后**必须缩放**，否则数值范围差异极大
- 与正则化（Ridge/Lasso）配合使用，避免过拟合
- 对树模型无意义（树本身就能拟合非线性）

## 五、特征选择（Feature Selection）

特征不是越多越好。冗余特征会带来：
- 维度灾难（距离失效、模型变慢）
- 噪声引入（无关特征误导模型）
- 可解释性下降

特征选择三大类：

### 5.1 过滤法（Filter）

**独立于模型**，用统计指标评估特征与标签的相关性，选 top-k。

- **方差阈值**：删除方差过小的特征（几乎恒定的特征无信息量）
- **相关系数**：回归任务用 Pearson/Spearman 与目标的相关性
- **卡方检验**：分类任务中非负特征的独立性检验
- **互信息**：衡量特征与标签的互信息量，能捕获非线性关系

**优点**：速度快
**缺点**：忽略特征间的交互作用

### 5.2 包裹法（Wrapper）

**用模型评估特征子集**，搜索最佳组合。

- **递归特征消除（RFE）**：从全量特征开始，每次删除最不重要的，直到达到目标数量
- **前向选择**：从空集开始，每次加入最有提升的特征
- **后向消除**：从全集开始，每次删除影响最小的特征

**优点**：考虑特征组合
**缺点**：计算开销大

### 5.3 嵌入法（Embedded）

**特征选择内嵌在模型训练中**。

- **Lasso 回归**：L1 正则化使部分系数变为 0，自动做特征选择
- **岭回归**：L2 正则化缩小系数但不归零
- **树模型特征重要性**：基于不纯度下降或排列重要性
- ** Elastic Net**：L1+L2 组合

**优点**：高效且准确，工业界最常用

### 5.4 实践建议

- 先用方差阈值和相关性筛选，去掉明显无用的
- 再用树模型特征重要性排序，保留 top-k
- 最后用业务理解做人工复核
- 注意：**特征选择必须在交叉验证内部进行**，否则会泄漏测试集信息

## 六、特征工程的常见陷阱

### 6.1 数据泄漏（Data Leakage）

最危险的陷阱：训练时无意中用到了测试集信息。常见来源：
- 用全量数据 fit 缩放器，再划分
- 用全量数据做 Target Encoding
- 用全量数据做特征选择
- 时间序列中，用未来信息预测过去

**对策**：所有"学习参数"的操作都放在 Pipeline 内部，并配合交叉验证。

### 6.2 训练-测试分布不一致

如果训练集和测试集的特征分布不同（例如时间不同、来源不同），模型性能会大幅下降。可以用 KS 检验、Adversarial Validation 检测。

### 6.3 类别不平衡

当正负样本比例悬殊（如 1:100）时，准确率会失真。对策：
- 重采样（过采样少数类 / 欠采样多数类 / SMOTE）
- 调整类别权重（class_weight='balanced'）
- 用 PR-AUC、F1 等指标替代 Accuracy

## 七、纯 Python 实现示例

下面的代码用纯标准库实现以下特征工程技术：
- OneHot 编码器
- Label 编码器
- StandardScaler / MinMaxScaler
- PolynomialFeatures
- 基于方差的过滤法特征选择
- 基于相关系数的特征选择

通过运行代码，你将看到每种技术对数据的具体变换效果，加深对原理的理解。

## 本章小结

- 特征工程是把"原始数据"变为"模型友好输入"的过程，决定模型上限
- 特征提取把非数值数据（文本/类别/时间）转为数值向量
- 特征编码（One-Hot / Target Encoding）让模型能消费类别信息
- 特征缩放（Standard / MinMax / Robust）让距离和梯度类算法正常工作
- 多项式特征让线性模型表达非线性关系
- 特征选择（Filter / Wrapper / Embedded）降维去冗余
- 数据泄漏是最大陷阱，所有变换必须严格在交叉验证内部

下一章我们将进入分类算法实战，亲手实现 KNN、决策树、逻辑回归等经典算法。
`,
    code: `
# =============================================================
# 第3章代码：特征工程纯 Python 实现
# =============================================================
# 实现：
#   - LabelEncoder / OneHotEncoder
#   - StandardScaler / MinMaxScaler
#   - PolynomialFeatures
#   - 方差阈值过滤 / 相关系数特征选择
#   - TargetEncoder（带平滑）

import math
import random
from collections import defaultdict


# -------------------------------------------------------------
# LabelEncoder：类别 -> 整数
# -------------------------------------------------------------
class LabelEncoder:
    """模拟 sklearn.preprocessing.LabelEncoder"""

    def fit(self, y):
        self.classes_ = sorted(set(y))
        self.mapping_ = {c: i for i, c in enumerate(self.classes_)}
        return self

    def transform(self, y):
        return [self.mapping_[v] for v in y]

    def fit_transform(self, y):
        return self.fit(y).transform(y)

    def inverse_transform(self, codes):
        inv = {i: c for c, i in self.mapping_.items()}
        return [inv[c] for c in codes]


# -------------------------------------------------------------
# OneHotEncoder：类别 -> 独热向量
# -------------------------------------------------------------
class OneHotEncoder:
    """模拟 sklearn.preprocessing.OneHotEncoder（单列）"""

    def fit(self, y):
        self.categories_ = sorted(set(y))
        self.cat_to_idx_ = {c: i for i, c in enumerate(self.categories_)}
        return self

    def transform(self, y):
        n = len(self.categories_)
        out = []
        for v in y:
            row = [0] * n
            row[self.cat_to_idx_[v]] = 1
            out.append(row)
        return out

    def fit_transform(self, y):
        return self.fit(y).transform(y)


# -------------------------------------------------------------
# StandardScaler
# -------------------------------------------------------------
class StandardScaler:
    def fit(self, X, y=None):
        n, d = len(X), len(X[0])
        self.mean_ = [sum(X[i][j] for i in range(n)) / n for j in range(d)]
        self.scale_ = []
        for j in range(d):
            var = sum((X[i][j] - self.mean_[j]) ** 2 for i in range(n)) / n
            self.scale_.append(math.sqrt(var) if var > 0 else 1.0)
        return self

    def transform(self, X):
        return [[(x[j] - self.mean_[j]) / self.scale_[j] for j in range(len(x))] for x in X]

    def fit_transform(self, X, y=None):
        return self.fit(X).transform(X)


# -------------------------------------------------------------
# MinMaxScaler
# -------------------------------------------------------------
class MinMaxScaler:
    def fit(self, X, y=None):
        d = len(X[0])
        self.min_ = [min(X[i][j] for i in range(len(X))) for j in range(d)]
        maxs = [max(X[i][j] for i in range(len(X))) for j in range(d)]
        self.scale_ = [(maxs[j] - self.min_[j]) or 1.0 for j in range(d)]
        return self

    def transform(self, X):
        return [[(x[j] - self.min_[j]) / self.scale_[j] for j in range(len(x))] for x in X]

    def fit_transform(self, X, y=None):
        return self.fit(X).transform(X)


# -------------------------------------------------------------
# PolynomialFeatures
# -------------------------------------------------------------
class PolynomialFeatures:
    """模拟 sklearn.preprocessing.PolynomialFeatures（degree=2 简化版）"""

    def __init__(self, degree=2, include_bias=True):
        self.degree = degree
        self.include_bias = include_bias

    def fit(self, X, y=None):
        d = len(X[0])
        # 生成所有 (a1, a2, ..., ad) 使得 sum <= degree
        combos = []
        if self.include_bias:
            combos.append((0,) * d)
        for total in range(1, self.degree + 1):
            # 简化：仅生成 degree=2 的所有组合
            if total == 1:
                for j in range(d):
                    combo = [0] * d
                    combo[j] = 1
                    combos.append(tuple(combo))
            elif total == 2:
                for j in range(d):
                    combo = [0] * d
                    combo[j] = 2
                    combos.append(tuple(combo))
                for j in range(d):
                    for k in range(j + 1, d):
                        combo = [0] * d
                        combo[j] = 1
                        combo[k] = 1
                        combos.append(tuple(combo))
        self.combinations_ = combos
        return self

    def transform(self, X):
        out = []
        for x in X:
            row = []
            for combo in self.combinations_:
                val = 1
                for j, e in enumerate(combo):
                    val *= x[j] ** e
                row.append(val)
            out.append(row)
        return out

    def fit_transform(self, X, y=None):
        return self.fit(X).transform(X)


# -------------------------------------------------------------
# VarianceThreshold：方差阈值过滤
# -------------------------------------------------------------
class VarianceThreshold:
    def __init__(self, threshold=0.0):
        self.threshold = threshold

    def fit(self, X, y=None):
        n, d = len(X), len(X[0])
        means = [sum(X[i][j] for i in range(n)) / n for j in range(d)]
        self.variances_ = [sum((X[i][j] - means[j]) ** 2 for i in range(n)) / n for j in range(d)]
        self.mask_ = [v > self.threshold for v in self.variances_]
        return self

    def transform(self, X):
        return [[x[j] for j in range(len(x)) if self.mask_[j]] for x in X]

    def fit_transform(self, X, y=None):
        return self.fit(X).transform(X)

    def get_support(self):
        return self.mask_


# -------------------------------------------------------------
# 相关系数特征选择
# -------------------------------------------------------------
def pearson_correlation(x_list, y_list):
    """计算 x 与 y 的 Pearson 相关系数"""
    n = len(x_list)
    mx = sum(x_list) / n
    my = sum(y_list) / n
    num = sum((x_list[i] - mx) * (y_list[i] - my) for i in range(n))
    dx = math.sqrt(sum((x - mx) ** 2 for x in x_list))
    dy = math.sqrt(sum((y - my) ** 2 for y in y_list))
    if dx == 0 or dy == 0:
        return 0.0
    return num / (dx * dy)


class SelectKBestByCorrelation:
    """根据 |pearson(x_j, y)| 选 top-k 特征（适合回归）"""

    def __init__(self, k=5):
        self.k = k

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.scores_ = [abs(pearson_correlation([X[i][j] for i in range(n)], y)) for j in range(d)]
        # 选 top-k 索引
        ranked = sorted(range(d), key=lambda j: self.scores_[j], reverse=True)
        self.selected_idx_ = sorted(ranked[: self.k])
        return self

    def transform(self, X):
        return [[x[j] for j in self.selected_idx_] for x in X]

    def fit_transform(self, X, y):
        return self.fit(X, y).transform(X)


# -------------------------------------------------------------
# TargetEncoder：带平滑的目标编码
# -------------------------------------------------------------
class TargetEncoder:
    """模拟带平滑的 Target Encoding（适合二分类 y ∈ {0,1}）"""

    def __init__(self, alpha=10):
        self.alpha = alpha

    def fit(self, cats, y):
        global_mean = sum(y) / len(y)
        self.global_mean_ = global_mean
        stats = defaultdict(list)
        for c, t in zip(cats, y):
            stats[c].append(t)
        self.encoding_ = {}
        for c, ts in stats.items():
            n = len(ts)
            mean_c = sum(ts) / n
            self.encoding_[c] = (n * mean_c + self.alpha * global_mean) / (n + self.alpha)
        return self

    def transform(self, cats):
        return [self.encoding_.get(c, self.global_mean_) for c in cats]

    def fit_transform(self, cats, y):
        return self.fit(cats, y).transform(cats)


# -------------------------------------------------------------
# 演示：每种技术的效果
# -------------------------------------------------------------
def demo_label_onehot():
    print("=" * 60)
    print("演示 1：LabelEncoder 与 OneHotEncoder")
    print("=" * 60)
    colors = ['红', '绿', '蓝', '红', '绿']
    le = LabelEncoder()
    codes = le.fit_transform(colors)
    print(f"原始: {colors}")
    print(f"Label 编码: {codes}")
    print(f"类别顺序: {le.classes_}")

    ohe = OneHotEncoder()
    onehot = ohe.fit_transform(colors)
    print(f"OneHot 编码: {onehot}")


def demo_scalers():
    print("\\n" + "=" * 60)
    print("演示 2：StandardScaler 与 MinMaxScaler")
    print("=" * 60)
    X = [[1, 100], [2, 200], [3, 300], [4, 400], [5, 500]]
    print(f"原始 X: {X}")
    ss = StandardScaler()
    Xs = ss.fit_transform(X)
    print(f"标准化后: {[[round(v, 3) for v in row] for row in Xs]}")
    print(f"  均值 ≈ 0, 方差 ≈ 1")
    mm = MinMaxScaler()
    Xm = mm.fit_transform(X)
    print(f"归一化后: {Xm}")
    print(f"  范围 [0, 1]")


def demo_polynomial():
    print("\\n" + "=" * 60)
    print("演示 3：PolynomialFeatures（degree=2）")
    print("=" * 60)
    X = [[2, 3], [4, 5]]
    poly = PolynomialFeatures(degree=2, include_bias=True)
    Xp = poly.fit_transform(X)
    print(f"原始 X: {X}")
    print(f"特征数: 2 -> {len(Xp[0])}")
    print(f"组合: {poly.combinations_}")
    print(f"展开后: {Xp}")
    print("解读: [1, x1, x2, x1², x1*x2, x2²]")


def demo_variance_threshold():
    print("\\n" + "=" * 60)
    print("演示 4：VarianceThreshold 方差过滤")
    print("=" * 60)
    # 第 3 列几乎恒定，方差极小
    X = [
        [1.0, 10, 5.0],
        [2.0, 20, 5.0],
        [3.0, 30, 5.0],
        [4.0, 40, 5.1],
        [5.0, 50, 5.0],
    ]
    vt = VarianceThreshold(threshold=0.05)
    Xt = vt.fit_transform(X)
    print(f"原始特征方差: {[round(v, 4) for v in vt.variances_]}")
    print(f"保留特征掩码: {vt.get_support()}")
    print(f"过滤后 X: {Xt}")


def demo_select_kbest():
    print("\\n" + "=" * 60)
    print("演示 5：SelectKBest 相关系数特征选择")
    print("=" * 60)
    # 构造 y = 2*x1 + 噪声，x2 是噪声特征
    random.seed(0)
    X = []
    y = []
    for _ in range(50):
        x1 = random.uniform(0, 10)
        x2 = random.uniform(0, 10)  # 与 y 无关
        x3 = random.uniform(0, 10)
        X.append([x1, x2, x3])
        y.append(2 * x1 + random.gauss(0, 0.5))
    skb = SelectKBestByCorrelation(k=2)
    Xt = skb.fit_transform(X, y)
    print(f"各特征与 y 的 |相关系数|: {[round(s, 3) for s in skb.scores_]}")
    print(f"被选中的特征索引: {skb.selected_idx_}")
    print(f"过滤后样本维度: {len(Xt[0])}")


def demo_target_encoder():
    print("\\n" + "=" * 60)
    print("演示 6：TargetEncoder 带平滑")
    print("=" * 60)
    cities = ['北京', '上海', '北京', '广州', '上海', '北京', '广州', '上海', '广州', '北京']
    y = [1, 1, 1, 0, 1, 0, 0, 1, 0, 1]  # 1 表示购买
    te = TargetEncoder(alpha=5)
    enc = te.fit_transform(cities, y)
    print(f"原始类别: {cities}")
    print(f"目标值: {y}")
    print(f"全局均值: {te.global_mean_:.4f}")
    for c, v in te.encoding_.items():
        print(f"  {c} -> {v:.4f}")
    print(f"编码结果: {[round(v, 3) for v in enc]}")


if __name__ == "__main__":
    demo_label_onehot()
    demo_scalers()
    demo_polynomial()
    demo_variance_threshold()
    demo_select_kbest()
    demo_target_encoder()
    print("\\n" + "=" * 60)
    print("✅ 特征工程演示完成！")
    print("=" * 60)
`,
  },

  // =============================================================
  // 第4章：分类算法实战
  // =============================================================
  {
    id: "aipy-classification",
    icon: "🏷️",
    group: "机器学习基础",
    title: "分类算法实战",
    content: `
# 分类算法实战

## 引言：从理论到代码，亲手实现经典分类器

分类是监督学习中最常见的任务之一：垃圾邮件识别、疾病诊断、信用评估、人脸识别……都本质上是分类问题。理解分类算法的内部机制，是机器学习工程师的必备技能——即使你日常用 Scikit-learn 一行代码就调用，知道背后发生了什么，才能在模型不工作时知道如何排查。

本章将深入讲解五种经典分类算法的原理、优缺点、适用场景，并用纯 Python 实现其中两个最具代表性的算法——**KNN 与 决策树**——让你从代码层面理解它们的运作机制。同时我们会介绍逻辑回归、朴素贝叶斯、SVM 的核心思想。

## 一、K 近邻（KNN）

### 1.1 算法原理

KNN（K-Nearest Neighbors）是最"懒惰"的算法——它几乎没有训练过程，只是把训练数据"记住"。预测时，计算待预测样本与所有训练样本的距离，取距离最近的 K 个邻居，通过投票（分类）或平均（回归）得出结果。

**核心思想**：物以类聚。相似的样本倾向于属于同一类别。

### 1.2 算法步骤

1. 计算测试样本 x 到所有训练样本的距离
2. 按距离升序排序，取前 K 个
3. 统计这 K 个邻居的标签
4. 投票：返回出现次数最多的标签

### 1.3 距离度量

- **欧氏距离**：\`sqrt(sum((a-b)²))\`，最常用
- **曼哈顿距离**：\`sum(|a-b|)\`，对异常值鲁棒
- **闵可夫斯基距离**：\`(sum(|a-b|^p))^(1/p)\`，p=2 即欧氏，p=1 即曼哈顿
- **余弦相似度**：衡量方向相似性，常用于文本

### 1.4 K 值选择

- K 太小（如 1）：模型复杂，易过拟合，对噪声敏感
- K 太大：模型简单，易欠拟合，决策边界过于平滑
- 经验：K 取 \`sqrt(n)\` 附近的奇数，或通过交叉验证选择

### 1.5 加权 KNN

距离近的邻居应有更大发言权。常用加权方式：
- 反距离加权：\`w = 1 / distance\`
- 高斯加权：\`w = exp(-distance² / (2σ²))\`

加权能缓解"平票"问题，并提升边界附近的精度。

### 1.6 KNN 的优缺点

**优点**：
- 原理简单，无需训练
- 天然支持多分类
- 对决策边界形状无假设

**缺点**：
- 预测慢（每次都要算所有距离）
- 维度灾难：高维下距离失效
- 需要特征缩放
- 对不平衡数据敏感

### 1.7 优化：KD 树 / 球树

朴素 KNN 的时间复杂度是 O(n*d)。用 KD 树可降到 O(log n)（低维下）。Scikit-learn 的 \`KNeighborsClassifier\` 默认用 KD 树或球树。

## 二、决策树（Decision Tree）

### 2.1 直觉

决策树模拟人类做决策的过程：通过一系列"是/否"问题逐步缩小范围。例如判断"是否会买这本书"，可以先问"价格是否<50"，再问"作者是否知名"……

树由节点和边组成：
- **根节点**：包含所有样本
- **内部节点**：一个特征上的判断
- **叶子节点**：预测结果（类别或数值）

### 2.2 划分准则

每个内部节点选择"最佳"特征和阈值进行划分。所谓"最佳"是让划分后子节点的纯度更高。

**基尼系数（Gini）**：
\`Gini(D) = 1 - sum(p_k²)\`

划分后的基尼：\`Gini_split = (|D1|/|D|) * Gini(D1) + (|D2|/|D|) * Gini(D2)\`

选择使 \`Gini_split\` 最小的划分。CART 算法用 Gini。

**信息熵（Entropy）**：
\`Ent(D) = -sum(p_k * log2(p_k))\`

信息增益 = \`Ent(D) - Ent_split\`。ID3 / C4.5 用信息增益或增益率。

**对比**：Gini 计算更快（无需 log），结果与熵相近。Scikit-learn 默认 Gini。

### 2.3 停止条件

何时停止划分？
- 节点样本数少于阈值（如 min_samples_split）
- 节点纯度已足够（Gini=0）
- 树达到最大深度 max_depth
- 划分不再带来增益

### 2.4 剪枝（Pruning）

不限制深度会导致过拟合（每个叶子只有 1 个样本）。剪枝分两种：
- **预剪枝**：训练时限制深度、叶子最小样本数等
- **后剪枝**：先生长完整树，再自底向上合并节点

### 2.5 决策树的优缺点

**优点**：
- 可解释性强（可可视化）
- 不需要特征缩放
- 能处理数值和类别特征
- 能捕获特征交互

**缺点**：
- 容易过拟合
- 对数据微小变化敏感（不稳定）
- 倾向于偏向多数类
- 难以捕获线性关系

### 2.6 集成的诞生

单棵决策树不稳，集成多棵能显著提升：
- **Bagging + 决策树 = 随机森林**：并行训练多棵树，投票
- **Boosting + 决策树 = GBDT / XGBoost / LightGBM**：串行训练，每棵纠正前一棵的错误

## 三、逻辑回归（Logistic Regression）

### 3.1 模型形式

虽然叫"回归"，但其实是分类。逻辑回归用 sigmoid 把线性组合压缩到 (0, 1)，作为正类概率：

\`p = 1 / (1 + exp(-(w·x + b)))\`

预测时：\`p >= 0.5\` 判为正类，否则负类。

### 3.2 损失函数

对数似然损失（交叉熵）：
\`L = -[y*log(p) + (1-y)*log(1-p)]\`

求平均后用梯度下降优化。

### 3.3 优缺点

**优点**：
- 概率输出，可解释
- 训练快，适合大规模数据
- 系数反映特征重要性
- 多分类用 softmax 推广

**缺点**：
- 只能拟合线性决策边界（除非加多项式特征）
- 对多重共线性敏感
- 需要特征缩放

## 四、朴素贝叶斯（Naive Bayes）

### 4.1 贝叶斯定理

\`P(Y|X) = P(X|Y) * P(Y) / P(X)\`

### 4.2 朴素假设

假设特征在给定类别下条件独立：
\`P(X|Y) = P(x1|Y) * P(x2|Y) * ... * P(xd|Y)\`

虽然"朴素"（特征很少真的独立），但实际效果出奇地好，尤其在文本分类。

### 4.3 变体

- **高斯朴素贝叶斯**：特征服从高斯分布，适合连续特征
- **多项式朴素贝叶斯**：特征是计数（如词频），适合文本
- **伯努利朴素贝叶斯**：特征是二值

### 4.4 优缺点

**优点**：训练快（只算均值方差/频率）、对小数据鲁棒、可解释
**缺点**：独立性假设过强、概率输出不一定准（但排序可用）

## 五、支持向量机（SVM）

### 5.1 最大间隔

SVM 寻找能正确分类且"间隔最大"的超平面。间隔越大，泛化越好。

### 5.2 软间隔

允许少量样本被错分或落入间隔内，引入松弛变量 \`ξ\` 和惩罚参数 \`C\`：
- C 大 → 严格分类，易过拟合
- C 小 → 容忍错分，泛化好

### 5.3 核技巧（Kernel Trick）

通过核函数把数据映射到高维空间，在高维中线性可分：
- 线性核：\`K(x, z) = x·z\`
- 多项式核：\`K(x, z) = (x·z + 1)^d\`
- RBF 核：\`K(x, z) = exp(-γ|x-z|²)\`，最常用

### 5.4 优缺点

**优点**：高维小样本表现好、核技巧强大、理论严谨
**缺点**：大规模数据训练慢、参数（C, γ）难调、对缺失值敏感

## 六、算法对比与选择

| 算法 | 训练 | 预测 | 可解释 | 适合场景 |
| --- | --- | --- | --- | --- |
| KNN | O(1) | O(n*d) | 中 | 小数据、基线 |
| 决策树 | O(n*d*log n) | O(log n) | 高 | 需要解释 |
| 逻辑回归 | O(n*d*iter) | O(d) | 高 | 大数据、概率输出 |
| 朴素贝叶斯 | O(n*d) | O(d) | 中 | 文本、小数据 |
| SVM | O(n²~n³) | O(sv*d) | 低 | 高维小样本 |

**选择建议**：
- 先用逻辑回归做基线
- 数据小且高维 → SVM 或朴素贝叶斯
- 数据大且需解释 → 决策树 / 逻辑回归
- 追求最高精度 → 随机森林 / GBDT
- 文本分类 → 朴素贝叶斯 / 逻辑回归

## 七、分类评估指标

### 7.1 混淆矩阵

|  | 预测正 | 预测负 |
| --- | --- | --- |
| 实际正 | TP | FN |
| 实际负 | FP | TN |

### 7.2 关键指标

- **Accuracy（准确率）** = (TP+TN) / 总数
- **Precision（精确率）** = TP / (TP+FP)，预测为正的里面真正为正的比例
- **Recall（召回率）** = TP / (TP+FN)，真正为正的里面被预测为正的比例
- **F1** = 2*P*R / (P+R)，调和平均

### 7.3 ROC 与 AUC

ROC 曲线：横轴 FPR，纵轴 TPR。AUC 是曲线下面积，衡量整体排序能力。
- AUC=0.5：随机
- AUC=1：完美
- AUC>0.9：优秀

### 7.4 不平衡数据

正负样本 1:100 时，全预测负类准确率 99% 但毫无意义。此时应看 PR-AUC、F1，并配合重采样或调整 class_weight。

## 八、纯 Python 实现

下面我们用纯标准库实现两个最具代表性的算法：
- **KNN 分类器**：支持加权投票
- **决策树分类器**：基于 Gini 系数，支持 max_depth 剪枝

并实现一个评估函数，输出准确率、Precision、Recall、F1 和混淆矩阵。

## 本章小结

- KNN 是惰性学习，预测时计算距离投票，简单但慢
- 决策树通过递归划分构建规则，可解释但易过拟合
- 逻辑回归用 sigmoid 输出概率，是大规模分类的首选基线
- 朴素贝叶斯基于贝叶斯定理 + 独立性假设，文本分类利器
- SVM 通过最大间隔和核技巧处理高维非线性
- 评估要看任务性质，不平衡数据慎用 Accuracy

下一章我们将进入回归算法实战，实现线性回归、岭回归、Lasso 等经典算法。
`,
    code: `
# =============================================================
# 第4章代码：分类算法纯 Python 实现
# =============================================================
# 实现：
#   - KNN 分类器（含加权投票）
#   - 决策树分类器（CART，Gini，max_depth 剪枝）
#   - 评估函数：准确率、Precision、Recall、F1、混淆矩阵
#   - 生成数据 + 完整对比实验

import math
import random
from collections import Counter


# =============================================================
# 工具函数
# =============================================================
def euclidean(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def accuracy(y_true, y_pred):
    return sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true)


def confusion_matrix(y_true, y_pred, labels):
    """返回 dict: {(true, pred): count}"""
    cm = {(t, p): 0 for t in labels for p in labels}
    for t, p in zip(y_true, y_pred):
        cm[(t, p)] += 1
    return cm


def classification_report(y_true, y_pred, labels):
    """打印每个类别的 P/R/F1 + 总体 Accuracy"""
    print(f"{'类别':>6} | {'Precision':>9} | {'Recall':>9} | {'F1':>9} | {'Support':>8}")
    print("-" * 55)
    cm = confusion_matrix(y_true, y_pred, labels)
    acc = accuracy(y_true, y_pred)
    for c in labels:
        tp = cm[(c, c)]
        fp = sum(cm[(other, c)] for other in labels if other != c)
        fn = sum(cm[(c, other)] for other in labels if other != c)
        support = tp + fn
        p = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        r = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
        print(f"{c:>6} | {p:>9.4f} | {r:>9.4f} | {f1:>9.4f} | {support:>8}")
    print("-" * 55)
    print(f"总体准确率: {acc:.4f}  (共 {len(y_true)} 样本)")


# =============================================================
# KNN 分类器（支持加权投票）
# =============================================================
class KNNClassifier:
    def __init__(self, n_neighbors=5, weights='uniform'):
        self.k = n_neighbors
        self.weights = weights

    def fit(self, X, y):
        self.X = X
        self.y = y
        self.classes_ = sorted(set(y))
        return self

    def _vote(self, neighbors):
        """neighbors: [(distance, label), ...]"""
        if self.weights == 'distance':
            # 反距离加权
            scores = Counter()
            for d, lab in neighbors:
                w = 1.0 / (d + 1e-9)
                scores[lab] += w
            return scores.most_common(1)[0][0]
        else:
            labels = [lab for _, lab in neighbors]
            return Counter(labels).most_common(1)[0][0]

    def _predict_one(self, x):
        dists = [(euclidean(x, xt), self.y[i]) for i, xt in enumerate(self.X)]
        dists.sort(key=lambda t: t[0])
        k = min(self.k, len(dists))
        return self._vote(dists[:k])

    def predict(self, X):
        return [self._predict_one(x) for x in X]

    def score(self, X, y):
        return accuracy(y, self.predict(X))


# =============================================================
# 决策树分类器（CART + Gini + max_depth）
# =============================================================
class DecisionTreeClassifier:
    def __init__(self, max_depth=5, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.tree = None

    def _gini(self, labels):
        n = len(labels)
        if n == 0:
            return 0.0
        counts = Counter(labels)
        return 1 - sum((c / n) ** 2 for c in counts.values())

    def _gini_split(self, left_labels, right_labels):
        n = len(left_labels) + len(right_labels)
        return len(left_labels) / n * self._gini(left_labels) + \
               len(right_labels) / n * self._gini(right_labels)

    def _best_split(self, X, y):
        """寻找使 Gini 最小的 (feature_idx, threshold)"""
        best_gini = float('inf')
        best_split = None
        n_features = len(X[0])
        for feat in range(n_features):
            # 候选阈值：该特征的所有取值
            values = sorted(set(x[feat] for x in X))
            for i in range(len(values) - 1):
                thr = (values[i] + values[i + 1]) / 2
                left_y = [y[j] for j in range(len(X)) if X[j][feat] <= thr]
                right_y = [y[j] for j in range(len(X)) if X[j][feat] > thr]
                if not left_y or not right_y:
                    continue
                g = self._gini_split(left_y, right_y)
                if g < best_gini:
                    best_gini = g
                    best_split = (feat, thr)
        return best_split

    def _build(self, X, y, depth):
        # 终止条件
        labels_count = Counter(y)
        majority = labels_count.most_common(1)[0][0]
        if depth >= self.max_depth or len(set(y)) == 1 or len(y) < self.min_samples_split:
            return {'leaf': True, 'label': majority}

        split = self._best_split(X, y)
        if split is None:
            return {'leaf': True, 'label': majority}
        feat, thr = split
        left_idx = [i for i in range(len(X)) if X[i][feat] <= thr]
        right_idx = [i for i in range(len(X)) if X[i][feat] > thr]
        if not left_idx or not right_idx:
            return {'leaf': True, 'label': majority}

        return {
            'leaf': False,
            'feat': feat,
            'thr': thr,
            'left': self._build([X[i] for i in left_idx], [y[i] for i in left_idx], depth + 1),
            'right': self._build([X[i] for i in right_idx], [y[i] for i in right_idx], depth + 1),
        }

    def fit(self, X, y):
        self.classes_ = sorted(set(y))
        self.tree = self._build(X, y, 0)
        return self

    def _predict_one(self, x, node=None):
        if node is None:
            node = self.tree
        if node['leaf']:
            return node['label']
        if x[node['feat']] <= node['thr']:
            return self._predict_one(x, node['left'])
        else:
            return self._predict_one(x, node['right'])

    def predict(self, X):
        return [self._predict_one(x) for x in X]

    def score(self, X, y):
        return accuracy(y, self.predict(X))

    def print_tree(self, node=None, depth=0, prefix=""):
        if node is None:
            node = self.tree
        indent = "  " * depth
        if node['leaf']:
            print(f"{indent}{prefix}-> 叶子: 类别 {node['label']}")
        else:
            print(f"{indent}{prefix}-> 特征[{node['feat']}] <= {node['thr']:.3f}?")
            self.print_tree(node['left'], depth + 1, "是")
            self.print_tree(node['right'], depth + 1, "否")


# =============================================================
# 数据生成
# =============================================================
def make_classification(n_per_class=40, seed=42):
    rng = random.Random(seed)
    X, y = [], []
    for _ in range(n_per_class):
        X.append([rng.gauss(2, 1), rng.gauss(2, 1)])
        y.append(0)
        X.append([rng.gauss(6, 1), rng.gauss(6, 1)])
        y.append(1)
        X.append([rng.gauss(4, 1), rng.gauss(8, 1)])
        y.append(2)
    return X, y


def train_test_split(X, y, test_size=0.3, seed=42):
    rng = random.Random(seed)
    idx = list(range(len(X)))
    rng.shuffle(idx)
    sp = int(len(X) * (1 - test_size))
    tr, te = idx[:sp], idx[sp:]
    return [X[i] for i in tr], [X[i] for i in te], [y[i] for i in tr], [y[i] for i in te]


# =============================================================
# 演示
# =============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("分类算法实战演示：KNN vs 决策树")
    print("=" * 60)

    X, y = make_classification(n_per_class=40)
    labels = sorted(set(y))
    print(f"数据集: {len(X)} 样本, {len(X[0])} 特征, {len(labels)} 类别")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
    print(f"训练集 {len(X_train)}, 测试集 {len(X_test)}\\n")

    # ---- KNN ----
    print("【KNN 分类器】")
    for k in [1, 3, 5, 7]:
        for w in ['uniform', 'distance']:
            clf = KNNClassifier(n_neighbors=k, weights=w)
            clf.fit(X_train, y_train)
            tr_acc = clf.score(X_train, y_train)
            te_acc = clf.score(X_test, y_test)
            print(f"  k={k}, weights={w}: train={tr_acc:.4f}, test={te_acc:.4f}")

    print()
    knn = KNNClassifier(n_neighbors=5, weights='distance').fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    print("KNN(k=5, distance) 详细评估:")
    classification_report(y_test, y_pred, labels)

    # ---- 决策树 ----
    print("\\n【决策树分类器】")
    for depth in [1, 3, 5, 10, None]:
        if depth is None:
            clf = DecisionTreeClassifier(max_depth=100)
            label = "无限制"
        else:
            clf = DecisionTreeClassifier(max_depth=depth)
            label = f"depth={depth}"
        clf.fit(X_train, y_train)
        tr_acc = clf.score(X_train, y_train)
        te_acc = clf.score(X_test, y_test)
        print(f"  {label:>12}: train={tr_acc:.4f}, test={te_acc:.4f}")

    print()
    tree = DecisionTreeClassifier(max_depth=3).fit(X_train, y_train)
    y_pred = tree.predict(X_test)
    print("决策树(max_depth=3) 详细评估:")
    classification_report(y_test, y_pred, labels)

    print("\\n决策树结构:")
    tree.print_tree()

    print("\\n" + "=" * 60)
    print("✅ 分类算法实战完成！")
    print("=" * 60)
`,
  },

  // =============================================================
  // 第5章：回归算法实战
  // =============================================================
  {
    id: "aipy-regression",
    icon: "📈",
    group: "机器学习基础",
    title: "回归算法实战",
    content: `
# 回归算法实战

## 引言：预测连续值的艺术

回归（Regression）是监督学习中预测连续数值的任务。房价预测、销量预测、温度预测、股票收益预测……这些问题的共同点是输出 y 是连续实数，而非离散类别。

回归与分类在算法层面有很多共通之处——逻辑回归本质就是线性回归 + sigmoid，决策树既能分类也能回归——但回归有其独特的挑战：
- 评估指标不同（MSE、R² 而非 Accuracy）
- 对异常值更敏感
- 需要考虑线性/非线性关系
- 模型外推能力（在训练数据范围之外的预测）很重要

本章我们将系统讲解五种经典回归算法：**线性回归、多项式回归、岭回归、Lasso、弹性网络**，并用纯 Python 实现其中核心的线性回归、岭回归和 Lasso，让你从代码层面理解它们的差异。

## 一、线性回归（Linear Regression）

### 1.1 模型形式

最简单的线性回归假设 y 与特征 x 线性相关：

\`y = w1*x1 + w2*x2 + ... + wd*xd + b\`

写成向量形式：\`y = w·x + b\`

### 1.2 损失函数：MSE

用均方误差（Mean Squared Error）作为损失：

\`MSE = (1/n) * sum((y_i - ŷ_i)²)\`

求平均后变成 \`L = (1/(2n)) * sum((y_i - ŷ_i)²)\`（除以 2 方便求导）。

### 1.3 求解方法

**解析解（Normal Equation）**：

令 \`X\` 为增广特征矩阵（一列全 1 表示偏置），则：
\`w = (X^T X)^(-1) X^T y\`

优点：一步到位，无需学习率
缺点：\`X^T X\` 求逆在特征多时（d>10000）很慢，且矩阵奇异时不可逆

**梯度下降**：

\`w := w - α * (1/n) * X^T (Xw - y)\`

优点：适合大规模数据
缺点：需要调学习率、需要特征缩放、可能收敛慢

### 1.4 线性回归的假设

经典线性回归有如下假设（GLM 假设）：
1. 线性关系：y 与 x 线性相关
2. 误差独立：样本间不相关（时间序列要特别小心）
3. 误差同方差：方差恒定
4. 误差正态：误差服从均值 0 的正态分布
5. 特征无多重共线性：特征间不高度相关

实际工作中这些假设很少完全满足，但了解有助于诊断模型问题。

### 1.5 优缺点

**优点**：
- 简单、可解释（系数反映特征影响）
- 训练快
- 是很多复杂模型的基础

**缺点**：
- 只能拟合线性关系（需配合多项式特征）
- 对异常值敏感
- 多重共线性会导致系数不稳定

## 二、多项式回归（Polynomial Regression）

### 2.1 思路

真实数据往往是非线性的。多项式回归通过添加 x²、x³、x1*x2 等高次项，让"线性模型"拟合非线性关系：

\`y = w0 + w1*x + w2*x² + w3*x³\`

虽然形式是非线性，但相对于参数 w 仍是线性的，所以可以用线性回归求解。

### 2.2 实现

1. 用 \`PolynomialFeatures(degree=d)\` 把 \`[x]\` 展开为 \`[1, x, x², ..., x^d]\`
2. 在展开后的特征上训练 \`LinearRegression\`

### 2.3 过拟合风险

degree 越高，模型越灵活，但也越容易过拟合。degree=10 时，曲线可能在数据点之间剧烈震荡。

**对策**：
- 交叉验证选择 degree
- 配合正则化（Ridge / Lasso）
- 限制 degree（一般 2~3 足够）

## 三、岭回归（Ridge Regression）

### 3.1 动机

当特征间存在多重共线性，\`X^T X\` 接近奇异，线性回归的系数会变得极大且不稳定。岭回归通过加入 L2 正则化项解决这个问题：

\`L = MSE + α * ||w||²\`

其中 \`α\` 是正则化强度，\`||w||² = sum(w_i²)\`（不含偏置）。

### 3.2 解析解

\`w = (X^T X + αI)^(-1) X^T y\`

加入 \`αI\` 后矩阵必然可逆，数值稳定。

### 3.3 α 的作用

- α=0：退化为线性回归
- α 小：轻微正则，系数小幅收缩
- α 大：系数大幅收缩趋于 0，模型变简单（可能欠拟合）

α 通常用对数尺度搜索（0.001, 0.01, 0.1, 1, 10, 100）。

### 3.4 L2 正则化的几何直觉

把损失函数看作等高线，L2 约束 \`||w||² <= t\` 是一个球。最优解在损失等高线与球的切点——系数被"压"向 0 但不等于 0。

### 3.5 何时用岭回归

- 特征多于样本（d > n）
- 特征间高度相关
- 想保留所有特征但稳定系数

## 四、Lasso 回归

### 4.1 损失函数

Lasso 用 L1 正则化：

\`L = MSE + α * ||w||_1\`

其中 \`||w||_1 = sum(|w_i|)\`。

### 4.2 稀疏性

L1 正则化的关键特性：能把部分系数精确压到 0，自动做特征选择。这正是 Lasso 名字的由来（**L**east **A**bsolute **S**hrinkage and **S**election **O**perator）。

### 4.3 几何直觉

L1 约束 \`||w||_1 <= t\` 是一个菱形（高维下是带尖角的形状）。最优解常落在尖角上，对应某些系数 = 0。

### 4.4 求解

Lasso 没有闭式解（L1 不可导），常用坐标下降法或近端梯度下降。

### 4.5 何时用 Lasso

- 怀疑只有少数特征真正有用
- 想做特征选择
- 高维稀疏数据

### 4.6 Ridge vs Lasso

| 维度 | Ridge (L2) | Lasso (L1) |
| --- | --- | --- |
| 系数 | 收缩但不为 0 | 部分精确为 0 |
| 特征选择 | 否 | 是 |
| 解 | 闭式 | 迭代 |
| 共线性 | 把相关特征的系数一起缩小 | 倾向于选其一，其他置 0 |
| 适用 | 都有用 | 只有少数有用 |

## 五、弹性网络（Elastic Net）

### 5.1 动机

Lasso 在特征高度相关时有问题：它倾向于随机选其中一个、丢弃其他。弹性网络结合 L1 和 L2：

\`L = MSE + α * (ρ * ||w||_1 + (1-ρ) * ||w||²)\`

其中 \`ρ\`（l1_ratio）控制 L1 占比。

### 5.2 优势

- 既有特征选择（L1）又有稳定性（L2）
- 相关特征会被一起选中或一起丢弃
- 是 Lasso 和 Ridge 的超集

实践建议：先用 Ridge 做基线，再试 Lasso 看哪些特征被选中，最后用 ElasticNet 综合。

## 六、回归评估指标

### 6.1 MSE / RMSE

\`MSE = (1/n) * sum((y - ŷ)²)\`
\`RMSE = sqrt(MSE)\`

优点：与 y 同量纲（RMSE），可解释
缺点：对异常值敏感

### 6.2 MAE

\`MAE = (1/n) * sum(|y - ŷ|)\`

优点：对异常值鲁棒
缺点：不可导，优化稍麻烦

### 6.3 R²（决定系数）

\`R² = 1 - SS_res / SS_tot\`

其中 \`SS_res = sum((y-ŷ)²)\`，\`SS_tot = sum((y-ȳ)²)\`。

含义：模型解释了 y 总变异的百分比。
- R²=1：完美
- R²=0：等价于预测均值
- R²<0：比预测均值还差（很糟糕）

注意：R² 在训练集上单调递增（加特征必然升高），调整后的 R² 才能公平比较不同特征数的模型。

### 6.4 调整 R²

\`Adj R² = 1 - (1-R²) * (n-1) / (n-d-1)\`

惩罚特征数，更适合比较模型。

## 七、回归算法的常见陷阱

### 7.1 异常值

一个极端值可能让整条回归线严重偏移。对策：
- 用 RobustScaler 预处理
- 用 RANSAC、Huber 回归等鲁棒回归
- 用 MAE 评估

### 7.2 异方差

误差方差随 x 变化（如预测收入，高收入者误差更大）。残差图呈"喇叭口"。对策：对 y 取对数，或用加权最小二乘。

### 7.3 多重共线性

特征间高度相关会让系数不稳定、解释困难。诊断：VIF（方差膨胀因子）> 10 提示严重共线性。对策：Ridge、PCA 降维、删除相关特征。

### 7.4 外推风险

线性模型在训练数据范围之外可能给出荒谬预测。例如训练数据 x ∈ [0, 10]，预测 x=100 时模型外推，结果不一定可信。对策：避免外推、或用树模型（树不外推，但只能预测到叶子节点均值）。

### 7.5 数据泄漏

回归中尤其容易发生：用未来预测过去、用全量数据 fit 缩放器。务必严格在训练集内学参数。

## 八、纯 Python 实现

下面用纯标准库实现：
- **线性回归**（梯度下降 + 解析解两种）
- **岭回归**（带 L2 正则化的解析解）
- **Lasso**（坐标下降法）
- **评估指标**：MSE、RMSE、MAE、R²

并在合成数据上对比它们的表现，观察正则化如何抑制过拟合。

## 本章小结

- 线性回归是回归的基础，MSE + 解析解或梯度下降
- 多项式回归通过特征展开拟合非线性，但易过拟合
- 岭回归用 L2 正则化稳定系数，适合多重共线性场景
- Lasso 用 L1 正则化做特征选择，适合稀疏高维数据
- 弹性网络结合 L1+L2，兼顾稳定性和稀疏性
- 评估看 MSE/RMSE/MAE/R²，注意异常值和共线性陷阱

至此，"机器学习基础"组的 5 章内容已经讲完。从概念、API、特征工程到分类与回归实战，你已经具备了解决真实机器学习问题的核心能力。下一步，可以继续学习集成学习、无监督学习、深度学习等更高级的主题。
`,
    code: `
# =============================================================
# 第5章代码：回归算法纯 Python 实现
# =============================================================
# 实现：
#   - LinearRegression（梯度下降 + 解析解）
#   - RidgeRegression（L2 正则化，解析解）
#   - LassoRegression（L1 正则化，坐标下降法）
#   - 评估函数：MSE / RMSE / MAE / R²
#   - 完整对比实验：观察正则化如何抑制过拟合

import math
import random


# =============================================================
# 矩阵运算工具（纯 Python）
# =============================================================
def mat_T(M):
    """转置"""
    return [list(col) for col in zip(*M)]


def mat_mult(A, B):
    """矩阵乘法"""
    n, m, p = len(A), len(A[0]), len(B[0])
    BT = mat_T(B)
    return [[sum(A[i][k] * BT[j][k] for k in range(m)) for j in range(p)] for i in range(n)]


def mat_add_diag(M, alpha):
    """M + alpha * I"""
    n = len(M)
    return [[M[i][j] + (alpha if i == j else 0) for j in range(n)] for i in range(n)]


def mat_inverse(M):
    """高斯-约旦消元法求逆（小矩阵）"""
    n = len(M)
    # 增广矩阵 [M | I]
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for col in range(n):
        # 找主元
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        if abs(aug[pivot][col]) < 1e-12:
            raise ValueError("矩阵不可逆")
        aug[col], aug[pivot] = aug[pivot], aug[col]
        # 归一化主元行
        pivot_val = aug[col][col]
        aug[col] = [v / pivot_val for v in aug[col]]
        # 消去其他行
        for r in range(n):
            if r != col and abs(aug[r][col]) > 1e-12:
                factor = aug[r][col]
                aug[r] = [a - factor * b for a, b in zip(aug[r], aug[col])]
    return [row[n:] for row in aug]


def add_bias_column(X):
    """在 X 左侧添加一列 1（用于偏置）"""
    return [[1.0] + list(x) for x in X]


# =============================================================
# 评估指标
# =============================================================
def mse(y_true, y_pred):
    n = len(y_true)
    return sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / n


def rmse(y_true, y_pred):
    return math.sqrt(mse(y_true, y_pred))


def mae(y_true, y_pred):
    n = len(y_true)
    return sum(abs(t - p) for t, p in zip(y_true, y_pred)) / n


def r2_score(y_true, y_pred):
    y_mean = sum(y_true) / len(y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    ss_tot = sum((t - y_mean) ** 2 for t in y_true)
    return 1 - ss_res / ss_tot if ss_tot > 0 else 0.0


# =============================================================
# 线性回归（梯度下降）
# =============================================================
class LinearRegressionGD:
    """用梯度下降训练的线性回归"""

    def __init__(self, lr=0.01, n_iter=1000):
        self.lr = lr
        self.n_iter = n_iter

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.w_ = [0.0] * d
        self.b_ = 0.0
        for _ in range(self.n_iter):
            # 计算梯度
            grad_w = [0.0] * d
            grad_b = 0.0
            for xi, yi in zip(X, y):
                pred = sum(wi * xi_j for wi, xi_j in zip(self.w_, xi)) + self.b_
                err = pred - yi
                for j in range(d):
                    grad_w[j] += err * xi[j]
                grad_b += err
            grad_w = [g / n for g in grad_w]
            grad_b = grad_b / n
            # 更新
            self.w_ = [w - self.lr * g for w, g in zip(self.w_, grad_w)]
            self.b_ -= self.lr * grad_b
        return self

    def predict(self, X):
        return [sum(wi * xi_j for wi, xi_j in zip(self.w_, x)) + self.b_ for x in X]


# =============================================================
# 线性回归（解析解）
# =============================================================
class LinearRegression:
    """用解析解 w = (X^T X)^(-1) X^T y 训练"""

    def fit(self, X, y):
        Xb = add_bias_column(X)
        Xt = mat_T(Xb)
        XtX = mat_mult(Xt, Xb)
        XtX_inv = mat_inverse(XtX)
        Xty = [sum(Xt[i][k] * y[k] for k in range(len(y))) for i in range(len(Xt))]
        w = [sum(XtX_inv[i][j] * Xty[j] for j in range(len(Xty))) for i in range(len(XtX_inv))]
        self.coef_ = w[1:]   # 系数
        self.intercept_ = w[0]  # 偏置
        return self

    def predict(self, X):
        return [sum(c * xi_j for c, xi_j in zip(self.coef_, x)) + self.intercept_ for x in X]


# =============================================================
# 岭回归（L2 正则化，解析解）
# =============================================================
class RidgeRegression:
    """w = (X^T X + αI)^(-1) X^T y"""

    def __init__(self, alpha=1.0):
        self.alpha = alpha

    def fit(self, X, y):
        Xb = add_bias_column(X)
        Xt = mat_T(Xb)
        XtX = mat_mult(Xt, Xb)
        # 不对偏置项正则化（约定）
        reg = mat_add_diag(XtX, self.alpha)
        reg[0][0] -= self.alpha  # 偏置不正则化
        reg_inv = mat_inverse(reg)
        Xty = [sum(Xt[i][k] * y[k] for k in range(len(y))) for i in range(len(Xt))]
        w = [sum(reg_inv[i][j] * Xty[j] for j in range(len(Xty))) for i in range(len(reg_inv))]
        self.coef_ = w[1:]
        self.intercept_ = w[0]
        return self

    def predict(self, X):
        return [sum(c * xi_j for c, xi_j in zip(self.coef_, x)) + self.intercept_ for x in X]


# =============================================================
# Lasso 回归（坐标下降法）
# =============================================================
class LassoRegression:
    """用坐标下降法求解 Lasso"""

    def __init__(self, alpha=1.0, n_iter=100):
        self.alpha = alpha
        self.n_iter = n_iter

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        # 标准化 X 方便坐标下降（这里简化处理，假设已缩放）
        self.coef_ = [0.0] * d
        self.intercept_ = sum(y) / n  # 偏置用均值
        y_centered = [yi - self.intercept_ for yi in y]
        # 每个特征的列平方和
        col_sq = [sum(X[i][j] ** 2 for i in range(n)) for j in range(d)]
        for _ in range(self.n_iter):
            for j in range(d):
                # 计算残差（去掉第 j 维的贡献）
                rho = sum(X[i][j] * (y_centered[i] - sum(self.coef_[k] * X[i][k]
                                                          for k in range(d) if k != j))
                          for i in range(n))
                # 软阈值
                if col_sq[j] == 0:
                    self.coef_[j] = 0
                else:
                    if rho > self.alpha * n:
                        self.coef_[j] = (rho - self.alpha * n) / col_sq[j]
                    elif rho < -self.alpha * n:
                        self.coef_[j] = (rho + self.alpha * n) / col_sq[j]
                    else:
                        self.coef_[j] = 0.0
        return self

    def predict(self, X):
        return [sum(c * xi_j for c, xi_j in zip(self.coef_, x)) + self.intercept_ for x in X]


# =============================================================
# 数据生成与划分
# =============================================================
def make_regression(n=60, n_features=5, n_informative=2, noise=5.0, seed=42):
    """生成回归数据：只有前 n_informative 个特征真正有用"""
    rng = random.Random(seed)
    true_w = [3.0, -2.0, 0.0, 0.0, 0.0][:n_features]
    X, y = [], []
    for _ in range(n):
        x = [rng.uniform(-3, 3) for _ in range(n_features)]
        # 真实关系：y = 3*x1 - 2*x2 + 噪声
        yv = sum(w * xi for w, xi in zip(true_w, x)) + rng.gauss(0, noise)
        X.append(x)
        y.append(yv)
    return X, y, true_w


def train_test_split(X, y, test_size=0.3, seed=42):
    rng = random.Random(seed)
    idx = list(range(len(X)))
    rng.shuffle(idx)
    sp = int(len(X) * (1 - test_size))
    tr, te = idx[:sp], idx[sp:]
    return [X[i] for i in tr], [X[i] for i in te], [y[i] for i in tr], [y[i] for i in te]


# =============================================================
# 演示
# =============================================================
if __name__ == "__main__":
    print("=" * 70)
    print("回归算法实战演示：线性 / 岭 / Lasso 对比")
    print("=" * 70)

    X, y, true_w = make_regression(n=60, n_features=5, n_informative=2, noise=5.0)
    print(f"数据集: {len(X)} 样本, {len(X[0])} 特征")
    print(f"真实系数: {true_w}")
    print(f"  (注意: 真实模型只有前 2 个特征有用，其余应为 0)\\n")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
    print(f"训练集 {len(X_train)}, 测试集 {len(X_test)}\\n")

    # ---- 线性回归 ----
    print("【1. 线性回归（解析解）】")
    lr = LinearRegression().fit(X_train, y_train)
    print(f"  系数: {[round(c, 3) for c in lr.coef_]}")
    print(f"  截距: {lr.intercept_:.3f}")
    print(f"  训练 MSE: {mse(y_train, lr.predict(X_train)):.3f}")
    print(f"  测试 MSE: {mse(y_test, lr.predict(X_test)):.3f}")
    print(f"  测试 R²:  {r2_score(y_test, lr.predict(X_test)):.3f}")

    # ---- 线性回归（梯度下降）----
    print("\\n【2. 线性回归（梯度下降）】")
    lrgd = LinearRegressionGD(lr=0.01, n_iter=2000).fit(X_train, y_train)
    print(f"  系数: {[round(c, 3) for c in lrgd.w_]}")
    print(f"  截距: {lrgd.b_:.3f}")
    print(f"  测试 R²:  {r2_score(y_test, lrgd.predict(X_test)):.3f}")

    # ---- 岭回归 ----
    print("\\n【3. 岭回归（不同 alpha）】")
    print(f"  {'alpha':>8} | {'测试 MSE':>10} | {'测试 R²':>8} | 系数")
    print("  " + "-" * 60)
    for alpha in [0.0, 0.1, 1.0, 10.0, 100.0]:
        rr = RidgeRegression(alpha=alpha).fit(X_train, y_train)
        mse_te = mse(y_test, rr.predict(X_test))
        r2_te = r2_score(y_test, rr.predict(X_test))
        coefs = [round(c, 3) for c in rr.coef_]
        print(f"  {alpha:>8.2f} | {mse_te:>10.3f} | {r2_te:>8.3f} | {coefs}")

    # ---- Lasso ----
    print("\\n【4. Lasso 回归（不同 alpha）】")
    print(f"  {'alpha':>8} | {'测试 MSE':>10} | {'测试 R²':>8} | 系数  (观察 0 的出现)")
    print("  " + "-" * 60)
    for alpha in [0.01, 0.1, 1.0, 5.0, 20.0]:
        las = LassoRegression(alpha=alpha, n_iter=200).fit(X_train, y_train)
        mse_te = mse(y_test, las.predict(X_test))
        r2_te = r2_score(y_test, las.predict(X_test))
        coefs = [round(c, 3) for c in las.coef_]
        print(f"  {alpha:>8.2f} | {mse_te:>10.3f} | {r2_te:>8.3f} | {coefs}")

    # ---- 综合评估 ----
    print("\\n【5. 综合评估指标】")
    best = RidgeRegression(alpha=1.0).fit(X_train, y_train)
    y_pred = best.predict(X_test)
    print(f"  Ridge(alpha=1.0) 在测试集上:")
    print(f"    MSE  = {mse(y_test, y_pred):.4f}")
    print(f"    RMSE = {rmse(y_test, y_pred):.4f}")
    print(f"    MAE  = {mae(y_test, y_pred):.4f}")
    print(f"    R²   = {r2_score(y_test, y_pred):.4f}")

    print("\\n【6. 解读】")
    print("  - 真实模型只有前 2 个特征有贡献，其余系数 = 0")
    print("  - 线性回归给所有特征非零系数（含噪声特征）")
    print("  - Lasso 能把无关特征的系数精确压到 0（特征选择）")
    print("  - Ridge 让所有系数一起缩小，但不为 0")
    print("  - alpha 越大，正则化越强，模型越简单")

    print("\\n" + "=" * 70)
    print("✅ 回归算法实战完成！")
    print("=" * 70)
`,
  },
];
