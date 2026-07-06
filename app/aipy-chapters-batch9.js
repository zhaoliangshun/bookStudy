// =============================================================
// Python 人工智能开发教程 —— 第九批章节（AI项目实战组，共 5 章）
// =============================================================

export const chapters = [
  // =============================================================
  // 第1章：AI项目开发全流程
  // =============================================================
  {
    id: "aipy-project-flow",
    icon: "🚀",
    group: "AI项目实战",
    title: "AI项目开发全流程",
    content: `
# AI项目开发全流程

## 引言：从代码到产品的鸿沟

很多人以为 AI 项目就是"调包 + 训练模型 + 出预测结果"，但实际上，把一个 AI 想法落地成真正能给业务带来价值的产品，需要经历一条相当完整且曲折的流水线。在工业界，模型训练代码只占整个项目工作量的 20% 甚至更少，其余 80% 都花在问题定义、数据准备、特征工程、部署、监控、迭代上。

本章将系统性地讲解一个完整 AI 项目的生命周期，覆盖从业务需求到线上监控的八个阶段。无论你未来做的是推荐系统、风控模型、计算机视觉、自然语言处理还是大模型应用，这套流程都适用——区别只在于每个阶段的细节实现。

理解全流程的最大价值在于：**它能帮你提前规避风险**。一个常见误区是工程师拿到需求后立刻开始建模，结果模型准确率很高却无法上线——可能是数据分布与线上不一致，可能是延迟要求无法满足，可能是业务方根本不需要这种粒度的预测。这些"坑"都应在流程前期通过沟通与设计规避。

## 一、阶段一：问题定义（Problem Definition）

### 1.1 业务理解优先

AI 项目的起点不是数据，不是算法，而是**业务问题**。工程师必须先回答清楚三个问题：

1. **要解决的业务痛点是什么？** 例如：客服人力成本高、用户流失率上升、商品推荐点击率低。
2. **AI 是否是最优解？** 很多问题用规则、SQL、传统统计就能解决，AI 不一定是最优选择。判断标准：问题中是否存在人类也难以清晰描述规则的复杂模式。
3. **成功的衡量标准是什么？** 不是"AUC 高于 0.9"这种技术指标，而是"客服人力成本下降 30%"、"用户留存提升 5%"这种业务指标。

### 1.2 问题类型映射

把业务问题翻译成 AI 问题：

| 业务问题 | AI 问题类型 | 输出 |
|---------|------------|------|
| 判断邮件是否垃圾 | 二分类 | 是/否 |
| 识别图片中的动物 | 多分类 | 类别标签 |
| 预测房价 | 回归 | 连续数值 |
| 给用户分群 | 无监督聚类 | 簇编号 |
| 给用户推荐商品 | 推荐/排序 | 排序列表 |
| 客服对话生成 | 序列生成 | 文本 |

### 1.3 约束条件

定义问题时必须明确约束：

- **延迟要求**：实时推荐要求毫秒级响应，离线预测可以是分钟级
- **数据可用性**：是否有标注数据？标注成本多高？
- **可解释性**：金融、医疗领域要求模型决策可解释
- **公平性**：是否存在对特定群体的歧视风险
- **成本上限**：算力、人力、时间预算

## 二、阶段二：数据收集（Data Collection）

### 2.1 数据来源

- **内部业务数据**：用户行为日志、交易记录、CRM 系统数据
- **公开数据集**：Kaggle、UCI、Hugging Face Datasets、政府开放数据
- **爬虫采集**：注意合规与版权
- **数据采购**：第三方数据供应商
- **人工标注**：Labelbox、Scale AI、自建标注团队
- **合成数据**：用 GAN、扩散模型或规则生成数据，常用于自动驾驶、医疗影像

### 2.2 数据质量评估

收集数据后立即评估质量，关注：

- **完整性**：缺失值比例
- **一致性**：字段含义、单位、编码是否统一
- **时效性**：数据是否过期
- **准确性**：标注是否正确
- **代表性**：是否覆盖所有业务场景
- **合规性**：是否包含敏感信息（身份证、手机号等），是否符合 GDPR/PIPL

### 2.3 数据划分

数据集通常划分为三份：

- **训练集（Training Set）**：用于训练模型，占 60%-80%
- **验证集（Validation Set）**：用于调参、模型选择，占 10%-20%
- **测试集（Test Set）**：仅在最终评估时使用一次，占 10%-20%

划分时要注意：时间序列数据要按时间切分，不能随机切分；类别不平衡时要用分层抽样。

## 三、阶段三：探索性数据分析（EDA）

EDA 是数据科学家花时间最多的环节之一，目的是"让数据自己说话"。常用方法：

- **描述性统计**：均值、方差、分位数、最大最小值
- **分布可视化**：直方图、密度图、箱线图
- **关系分析**：散点图、相关系数矩阵、热力图
- **分组对比**：按类别分组的箱线图、小提琴图
- **缺失值分析**：缺失比例、缺失模式（随机缺失 or 有规律）
- **异常值检测**：3σ 原则、IQR、孤立森林

EDA 的产出通常是：一份"数据体检报告"，列出数据存在的问题、值得挖掘的特征、潜在的工程方向。

## 四、阶段四：特征工程（Feature Engineering）

业界有句名言："数据决定了上限，模型只是逼近这个上限。"特征工程就是抬升这个上限的关键手段。

### 4.1 数值特征

- **标准化**：减均值除标准差
- **归一化**：缩放到 [0, 1]
- **对数变换**：处理长尾分布
- **分箱**：连续值离散化
- **交叉特征**：a/b、a*b、a+b

### 4.2 类别特征

- **One-Hot 编码**：适用于低基数
- **Label Encoding**：适用于树模型
- **Target Encoding**：用目标均值替换类别
- **Embedding**：高基数类别用神经网络学习向量表示

### 4.3 时间特征

- 提取年、月、日、时、分、秒、星期、是否周末、是否节假日
- 计算距某事件的天数（距上次购买、距注册时长）

### 4.4 文本特征

- 词袋模型（BoW）
- TF-IDF
- Word2Vec / GloVe / BERT Embedding

## 五、阶段五：建模（Modeling）

### 5.1 模型选择

根据问题类型和数据规模选择：

- **小数据 + 表格**：逻辑回归、决策树、随机森林、XGBoost
- **大数据 + 表格**：LightGBM、深度学习
- **图像**：CNN（ResNet、EfficientNet）、ViT
- **文本**：Transformer（BERT、GPT、LLaMA）
- **序列**：RNN、LSTM、Transformer

### 5.2 训练流程

1. 选择基线模型（Baseline）：最简单的模型，如线性回归、多数类预测
2. 训练复杂模型并对比基线
3. 分析误差：哪些样本预测错？为什么？
4. 迭代优化：调整特征、调整模型、调整超参

### 5.3 避免数据泄露

数据泄露是项目最常见的"暗坑"：

- 用未来数据预测过去
- 训练时用了测试集统计量（如目标编码时用了测试集标签）
- 特征工程在划分数据集之前完成

正确做法：特征工程也要在训练集上 fit，在测试集上 transform。

## 六、阶段六：模型评估（Evaluation）

### 6.1 分类指标

- **准确率（Accuracy）**：整体预测正确比例
- **精确率（Precision）**：预测为正的样本中实际为正的比例
- **召回率（Recall）**：实际为正的样本中被预测为正的比例
- **F1 Score**：精确率与召回率的调和平均
- **ROC-AUC**：阈值无关的整体排序能力
- **混淆矩阵**：直观展示各类别预测情况

### 6.2 回归指标

- **MAE**：平均绝对误差
- **MSE**：均方误差，对大误差敏感
- **RMSE**：MSE 开根号，与目标同量纲
- **R²**：决定系数，解释方差比例
- **MAPE**：平均绝对百分比误差

### 6.3 业务指标对齐

技术指标好不代表业务效果好。例如：模型 AUC 从 0.85 提升到 0.88，但实际业务转化率没提升，说明提升没有落地到业务关键路径上。要始终把业务指标纳入评估。

## 七、阶段七：部署（Deployment）

### 7.1 部署形态

- **实时推理（Online Inference）**：REST API、gRPC，毫秒级响应
- **批处理（Batch Inference）**：定时跑批，处理大量数据
- **流式推理（Streaming Inference）**：Flink/Spark Streaming，处理实时数据流
- **边缘部署（Edge Deployment）**：手机、IoT 设备，模型需要压缩

### 7.2 部署架构

- **模型服务化**：Flask/FastAPI 包装模型为 HTTP 服务
- **容器化**：Docker 打包，Kubernetes 编排
- **模型仓库**：MLflow、DVC、TF Serving 管理模型版本
- **A/B 测试框架**：流量切分，对比新旧模型

## 八、阶段八：监控与迭代（Monitoring & Iteration）

### 8.1 监控指标

- **系统指标**：QPS、延迟、CPU/GPU 利用率、错误率
- **模型指标**：预测分布漂移、特征分布漂移
- **业务指标**：转化率、点击率、留存率

### 8.2 数据漂移（Data Drift）

模型上线后，真实数据分布会逐渐偏离训练分布，导致效果下降。检测方法：

- **PSI（Population Stability Index）**：大于 0.2 提示漂移
- **KS 检验**：比较两分布
- **特征分布对比**：KL 散度、Wasserstein 距离

### 8.3 迭代闭环

建立"数据 → 模型 → 部署 → 监控 → 反馈数据"的飞轮：

1. 收集线上预测日志和真实标签
2. 分析模型在哪些样本上犯错
3. 把错例加入训练集
4. 重新训练并发布新版本
5. 持续监控新版本效果

## 九、实战案例：信用卡欺诈检测

以一个完整案例串联上述流程：

1. **问题定义**：识别信用卡交易是否欺诈，要求召回率优先
2. **数据收集**：交易日志、用户画像、设备指纹
3. **EDA**：发现欺诈率仅 0.17%，金额分布长尾，凌晨欺诈高发
4. **特征工程**：构造"近 1 小时交易次数"、"金额分位数"、"IP 与常用地址距离"
5. **建模**：用 XGBoost，处理类别不平衡（下采样 + 调整类权重）
6. **评估**：AUC=0.92，recall@precision=0.8 时召回率 0.78
7. **部署**：实时推理 API，P99 延迟 < 50ms
8. **监控**：每日监控欺诈率分布，PSI > 0.2 触发告警

## 本章小结

本章完整梳理了 AI 项目从 0 到 1 的八个阶段：

- **问题定义**决定方向，决定 AI 是否适用
- **数据收集**决定上限，质量比数量更重要
- **EDA** 让数据说话，发现隐藏模式
- **特征工程**抬升上限，是工程师核心竞争力
- **建模**是逼近上限的过程，要选对算法
- **评估**要技术与业务并重
- **部署**把模型变成可用产品
- **监控与迭代**让模型持续创造价值

后续章节将深入每个阶段的关键技术：模型评估、模型保存、模型部署、AI 伦理。
`,
    code: `
# =============================================================
# 第1章代码：AI项目全流程模拟（纯标准库实现）
# =============================================================
# 本代码演示一个简化版的 AI 项目全流程：
# 1. 模拟业务问题与数据生成
# 2. 探索性数据分析（EDA）
# 3. 特征工程
# 4. 训练简单模型（逻辑回归梯度下降）
# 5. 模型评估（多指标）
# 6. 模拟部署与监控

import random
import math
from collections import Counter


# =============================================================
# 阶段一：问题定义 —— 信用卡欺诈检测
# =============================================================
# 业务目标：识别欺诈交易，召回率优先（不漏抓）
# 输入特征：交易金额、时间、用户历史交易次数、距离上次交易时长
# 输出：0=正常 1=欺诈


# =============================================================
# 阶段二：数据收集 —— 模拟生成交易数据
# =============================================================
def generate_transactions(n=1000, fraud_rate=0.15, seed=42):
    """
    生成模拟交易数据
    欺诈交易的特征：金额偏大、凌晨多发、距离上次交易时间短
    """
    random.seed(seed)
    X, y = [], []
    for i in range(n):
        if random.random() < fraud_rate:
            # 欺诈交易
            amount = random.gauss(800, 300)       # 金额偏大
            hour = random.gauss(3, 2)             # 凌晨多发
            if hour < 0: hour = 0
            if hour > 23: hour = 23
            last_txn_gap = random.gauss(5, 3)     # 距上次交易时间短
            if last_txn_gap < 0: last_txn_gap = 0
            label = 1
        else:
            # 正常交易
            amount = random.gauss(150, 80)
            hour = random.gauss(14, 5)
            if hour < 0: hour = 0
            if hour > 23: hour = 23
            last_txn_gap = random.gauss(720, 600)  # 距上次交易时间长
            if last_txn_gap < 0: last_txn_gap = 0
            label = 0
        X.append([amount, hour, last_txn_gap])
        y.append(label)
    return X, y


def train_test_split(X, y, test_size=0.3, seed=42):
    """划分训练集与测试集"""
    random.seed(seed)
    idx = list(range(len(X)))
    random.shuffle(idx)
    split = int(len(X) * (1 - test_size))
    tr, te = idx[:split], idx[split:]
    Xtr = [X[i] for i in tr]; ytr = [y[i] for i in tr]
    Xte = [X[i] for i in te]; yte = [y[i] for i in te]
    return Xtr, Xte, ytr, yte


# =============================================================
# 阶段三：EDA —— 探索性数据分析
# =============================================================
def eda(X, y, name="数据集"):
    """简单的 EDA：按类别统计各特征的均值与方差"""
    print(f"\\n【EDA - {name}】")
    print(f"  总样本数: {len(y)}")
    counter = Counter(y)
    for k, v in sorted(counter.items()):
        print(f"  类别 {k}: {v} 条 ({v/len(y)*100:.1f}%)")

    # 计算每个特征在两类下的均值
    n_feat = len(X[0])
    feat_names = ["金额", "小时", "距上次交易(分)"]
    for j in range(n_feat):
        vals_0 = [X[i][j] for i in range(len(X)) if y[i] == 0]
        vals_1 = [X[i][j] for i in range(len(X)) if y[i] == 1]
        mean_0 = sum(vals_0) / len(vals_0)
        mean_1 = sum(vals_1) / len(vals_1)
        print(f"  特征[{feat_names[j]}] 正常均值={mean_0:.2f}, 欺诈均值={mean_1:.2f}")


# =============================================================
# 阶段四：特征工程 —— 标准化
# =============================================================
class StandardScaler:
    """Z-score 标准化：减均值除标准差"""
    def fit(self, X):
        n = len(X); d = len(X[0])
        self.mean_ = [sum(X[i][j] for i in range(n)) / n for j in range(d)]
        self.std_ = []
        for j in range(d):
            var = sum((X[i][j] - self.mean_[j]) ** 2 for i in range(n)) / n
            self.std_.append(math.sqrt(var) + 1e-8)
        return self

    def transform(self, X):
        return [[(x[j] - self.mean_[j]) / self.std_[j] for j in range(len(x))] for x in X]

    def fit_transform(self, X):
        return self.fit(X).transform(X)


# =============================================================
# 阶段五：建模 —— 逻辑回归（梯度下降）
# =============================================================
class LogisticRegression:
    """逻辑回归，支持类权重处理不平衡"""
    def __init__(self, lr=0.1, n_iter=500, class_weight=None):
        self.lr = lr
        self.n_iter = n_iter
        self.class_weight = class_weight
        self.w = None
        self.b = 0.0

    @staticmethod
    def _sigmoid(z):
        if z >= 0:
            ez = math.exp(-z)
            return 1.0 / (1.0 + ez)
        else:
            ez = math.exp(z)
            return ez / (1.0 + ez)

    def fit(self, X, y):
        n = len(X); d = len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        if self.class_weight is None:
            weights = [1.0] * n
        else:
            weights = [self.class_weight.get(y[i], 1.0) for i in range(n)]

        for epoch in range(self.n_iter):
            grad_w = [0.0] * d
            grad_b = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = self._sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    grad_w[j] += weights[i] * err * X[i][j]
                grad_b += weights[i] * err
            for j in range(d):
                self.w[j] -= self.lr * grad_w[j] / n
            self.b -= self.lr * grad_b / n
        return self

    def predict_proba(self, X):
        return [self._sigmoid(sum(self.w[j] * x[j] for j in range(len(x))) + self.b) for x in X]

    def predict(self, X, threshold=0.5):
        return [1 if p >= threshold else 0 for p in self.predict_proba(X)]


# =============================================================
# 阶段六：模型评估 —— 多指标
# =============================================================
def confusion_matrix(y_true, y_pred):
    """返回 [[TN, FP], [FN, TP]]"""
    cm = [[0, 0], [0, 0]]
    for t, p in zip(y_true, y_pred):
        cm[t][p] += 1
    return cm


def classification_report(y_true, y_pred):
    """输出准确率、精确率、召回率、F1"""
    cm = confusion_matrix(y_true, y_pred)
    tn, fp = cm[0][0], cm[0][1]
    fn, tp = cm[1][0], cm[1][1]
    acc = (tp + tn) / (tp + tn + fp + fn)
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
    print(f"  混淆矩阵: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"  准确率 Accuracy : {acc:.4f}")
    print(f"  精确率 Precision: {prec:.4f}")
    print(f"  召回率 Recall   : {rec:.4f}")
    print(f"  F1 Score        : {f1:.4f}")
    return {"acc": acc, "prec": prec, "rec": rec, "f1": f1}


def roc_auc(y_true, y_score):
    """计算 ROC-AUC（用 Mann-Whitney U 统计量简化计算）"""
    pos = [s for t, s in zip(y_true, y_score) if t == 1]
    neg = [s for t, s in zip(y_true, y_score) if t == 0]
    if not pos or not neg:
        return 0.5
    # 统计正样本分数 > 负样本分数的对数
    n_pos = len(pos); n_neg = len(neg)
    correct = 0
    for p in pos:
        for n in neg:
            if p > n:
                correct += 1
            elif p == n:
                correct += 0.5
    return correct / (n_pos * n_neg)


# =============================================================
# 阶段七：模拟部署 —— 简单的推理函数
# =============================================================
class FraudDetector:
    """模拟线上部署的欺诈检测服务"""
    def __init__(self, model, scaler):
        self.model = model
        self.scaler = scaler
        self.call_count = 0
        self.fraud_count = 0

    def predict(self, raw_features):
        """raw_features: [amount, hour, last_txn_gap]"""
        scaled = self.scaler.transform([raw_features])
        proba = self.model.predict_proba(scaled)[0]
        pred = 1 if proba >= 0.5 else 0
        self.call_count += 1
        if pred == 1:
            self.fraud_count += 1
        return {"label": pred, "probability": round(proba, 4)}

    def stats(self):
        return {"总请求数": self.call_count, "拦截数": self.fraud_count}


# =============================================================
# 阶段八：模拟监控 —— 数据漂移检测
# =============================================================
def psi(train_values, test_values, buckets=10):
    """计算 PSI（Population Stability Index）"""
    # 用训练集分位数划分桶
    sorted_train = sorted(train_values)
    n_train = len(sorted_train)
    edges = [sorted_train[min(int(n_train * i / buckets), n_train - 1)] for i in range(buckets + 1)]
    edges[0] = -float('inf')
    edges[-1] = float('inf')

    def count_in_buckets(values):
        counts = [0] * buckets
        for v in values:
            for k in range(buckets):
                if edges[k] < v <= edges[k + 1]:
                    counts[k] += 1
                    break
        return counts

    train_counts = count_in_buckets(train_values)
    test_counts = count_in_buckets(test_values)
    n_train = len(train_values); n_test = len(test_values)
    psi_val = 0.0
    for k in range(buckets):
        p_tr = (train_counts[k] + 0.0001) / n_train
        p_te = (test_counts[k] + 0.0001) / n_test
        psi_val += (p_te - p_tr) * math.log(p_te / p_tr)
    return psi_val


# =============================================================
# 主程序：串联全流程
# =============================================================
def main():
    print("=" * 70)
    print("AI 项目全流程演示：信用卡欺诈检测")
    print("=" * 70)

    # 阶段二：数据收集
    print("\\n[阶段 2] 数据收集")
    X, y = generate_transactions(n=2000, fraud_rate=0.15)
    print(f"  生成交易数据: {len(X)} 条")

    # 阶段三：EDA
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3)
    eda(Xtr, ytr, "训练集")
    eda(Xte, yte, "测试集")

    # 阶段四：特征工程（标准化）
    print("\\n[阶段 4] 特征工程：标准化")
    scaler = StandardScaler()
    Xtr_s = scaler.fit_transform(Xtr)
    Xte_s = scaler.transform(Xte)
    print(f"  训练集特征均值: {[round(scaler.mean_[j], 2) for j in range(len(scaler.mean_))]}")
    print(f"  训练集特征标准差: {[round(scaler.std_[j], 2) for j in range(len(scaler.std_))]}")

    # 阶段五：建模
    print("\\n[阶段 5] 建模：逻辑回归（带类权重处理不平衡）")
    model = LogisticRegression(lr=0.1, n_iter=300, class_weight={0: 1.0, 1: 5.0})
    model.fit(Xtr_s, ytr)
    print(f"  模型权重 w: {[round(w, 4) for w in model.w]}")
    print(f"  模型偏置 b: {model.b:.4f}")

    # 阶段六：评估
    print("\\n[阶段 6] 模型评估")
    y_pred = model.predict(Xte_s)
    y_score = model.predict_proba(Xte_s)
    print("  -- 测试集评估结果 --")
    classification_report(yte, y_pred)
    auc = roc_auc(yte, y_score)
    print(f"  ROC-AUC         : {auc:.4f}")

    # 阶段七：模拟部署
    print("\\n[阶段 7] 模拟部署：欺诈检测服务")
    detector = FraudDetector(model, scaler)
    # 模拟 10 笔交易
    test_cases = [
        [120, 14, 800],   # 正常
        [950, 3, 2],      # 欺诈
        [80, 16, 1200],   # 正常
        [700, 4, 1],      # 欺诈
        [200, 13, 600],   # 正常
    ]
    for tc in test_cases:
        result = detector.predict(tc)
        print(f"  输入 {tc} -> {result}")
    print(f"  服务统计: {detector.stats()}")

    # 阶段八：监控 —— 漂移检测
    print("\\n[阶段 8] 模拟监控：数据漂移检测")
    # 模拟线上数据分布变化（金额上升）
    X_drift, _ = generate_transactions(n=600, fraud_rate=0.15, seed=99)
    # 故意让金额漂移
    X_drift = [[x[0] * 1.5, x[1], x[2]] for x in X_drift]
    for j, fname in enumerate(["金额", "小时", "距上次交易"]):
        train_vals = [Xtr[i][j] for i in range(len(Xtr))]
        drift_vals = [X_drift[i][j] for i in range(len(X_drift))]
        score = psi(train_vals, drift_vals)
        status = "⚠️漂移" if score > 0.2 else "✅稳定"
        print(f"  特征[{fname}] PSI = {score:.4f} {status}")

    print("\\n" + "=" * 70)
    print("✅ AI 项目全流程演示完成！")
    print("=" * 70)


if __name__ == "__main__":
    main()
`,
  },

  // =============================================================
  // 第2章：模型评估与调优
  // =============================================================
  {
    id: "aipy-eval",
    icon: "📊",
    group: "AI项目实战",
    title: "模型评估与调优",
    content: `
# 模型评估与调优

## 引言：评估决定一切

在机器学习中，"如何评估"比"如何训练"更关键。一个常见的失败场景是：模型在训练集上准确率 99%，上线后效果却一塌糊涂——这就是过拟合。如何科学地评估模型、如何系统地调优超参数，是数据工程师与算法工程师的分水岭。

本章将系统讲解：交叉验证的原理与实现、混淆矩阵与派生指标、ROC 与 AUC 的计算细节、学习曲线的诊断方法、超参数调优的三种策略（网格搜索、随机搜索、贝叶斯优化）。所有概念都用纯 Python 实现，让你不仅会"调包"，更能从底层理解每一行代码在做什么。

## 一、为什么需要交叉验证

### 1.1 简单留出法的局限

最简单的评估方法是"留出法"：把数据切成训练集和测试集，模型在训练集训练，在测试集评估。但这种方法有两个问题：

1. **评估结果受划分影响大**：测试集小则评估方差大，测试集大则训练数据少
2. **没有充分利用数据**：每次只用了一部分数据训练

### 1.2 K 折交叉验证（K-Fold CV）

K 折交叉验证的流程：

1. 把数据均分成 K 份
2. 每次取其中 1 份作为验证集，其余 K-1 份作为训练集
3. 训练并评估，记录分数
4. 重复 K 次，得到 K 个分数
5. 取均值作为最终评估，取标准差衡量稳定性

K 通常取 5 或 10。K 越大评估越准但计算开销越大。

### 1.3 分层 K 折（Stratified K-Fold）

当类别不平衡时，普通 K 折可能让某一折全是负样本。分层 K 折保证每一折中类别比例与整体一致。例如整体正样本 20%，则每一折中正样本也占 20%。

### 1.4 时间序列交叉验证

时间序列数据不能随机切分（会用未来预测过去）。正确做法是"前向验证"：

- 第 1 折：用 [1, 2, 3] 月训练，预测 4 月
- 第 2 折：用 [1, 2, 3, 4] 月训练，预测 5 月
- 依次类推

## 二、混淆矩阵与派生指标

### 2.1 混淆矩阵

二分类的混淆矩阵是 2×2 矩阵：

|  | 预测为正 | 预测为负 |
|---|---|---|
| **实际为正** | TP (真阳性) | FN (假阴性) |
| **实际为负** | FP (假阳性) | TN (真阴性) |

### 2.2 派生指标

- **准确率 Accuracy = (TP+TN) / (TP+TN+FP+FN)**：整体正确率
- **精确率 Precision = TP / (TP+FP)**：预测为正中实际为正的比例
- **召回率 Recall = TP / (TP+FN)**：实际为正中被预测为正的比例
- **F1 Score = 2·P·R / (P+R)**：精确率与召回率的调和平均
- **Specificity = TN / (TN+FP)**：实际为负中被预测为负的比例

### 2.3 指标选择策略

不同业务场景关注不同指标：

- **欺诈检测**：召回率优先（不漏抓）
- **垃圾邮件过滤**：精确率优先（不误杀）
- **医疗诊断**：召回率优先（不漏诊）
- **搜索引擎排序**：Precision@K

### 2.4 类别不平衡的处理

当正负样本比例悬殊（如 1:100）时，准确率会失真——全部预测为负也有 99% 准确率。处理方法：

- **重采样**：过采样少数类（SMOTE）或下采样多数类
- **类权重**：在损失函数中给少数类更高权重
- **更换指标**：用 F1、AUC、PR-AUC 而非准确率

## 三、ROC 曲线与 AUC

### 3.1 ROC 曲线

ROC（Receiver Operating Characteristic）曲线描绘不同阈值下的两个指标：

- **横轴**：FPR = FP / (FP + TN)（假阳性率）
- **纵轴**：TPR = TP / (TP + FN)（真阳性率，即召回率）

绘制流程：

1. 模型输出每个样本的预测概率
2. 按概率从高到低排序
3. 遍历每个概率作为阈值，计算 (FPR, TPR)
4. 把所有点连成曲线

### 3.2 AUC 的含义

AUC（Area Under Curve）是 ROC 曲线下面积，取值 [0, 1]：

- AUC = 0.5：随机预测
- AUC = 1.0：完美分类
- AUC < 0.5：比随机还差（标签可能反了）

AUC 有一个直观的统计含义：**随机抽一个正样本和一个负样本，正样本预测分数高于负样本的概率**。

### 3.3 AUC 的优缺点

优点：

- 阈值无关，衡量模型整体排序能力
- 对类别不平衡不敏感

缺点：

- 对业务不直观
- 当负样本远多于正样本时可能高估效果

### 3.4 PR 曲线与 PR-AUC

PR 曲线（Precision-Recall Curve）以召回率为横轴、精确率为纵轴。在类别极不平衡时，PR-AUC 比 ROC-AUC 更敏感、更准确。

## 四、学习曲线

学习曲线描绘训练集大小与模型表现的关系，用于诊断：

- **欠拟合**：训练分数和验证分数都低，且接近
- **过拟合**：训练分数高，验证分数低，差距大
- **数据不足**：训练分数高，验证分数随数据增加而上升，但尚未收敛

通过学习曲线可以决定：

- 是否需要更多数据
- 是否需要更简单/复杂的模型
- 是否需要更强的正则化

## 五、超参数调优

### 5.1 超参数 vs 参数

- **参数**：模型从数据中学习到的，如线性回归的系数
- **超参数**：人工设定的，如学习率、正则化系数、树的深度

### 5.2 网格搜索（Grid Search）

穷举所有超参数组合，每组用交叉验证评估，选最优。优点是简单全面，缺点是组合爆炸。

### 5.3 随机搜索（Random Search）

在超参空间随机采样 N 组，每组交叉验证评估。优点是同样预算下能探索更多区域，对重要超参更敏感。

### 5.4 贝叶斯优化

用高斯过程或 TPE 建模超参与性能的关系，智能选择下一组尝试。适合评估成本高的场景（如深度学习）。

### 5.5 调优最佳实践

1. 先用粗粒度随机搜索缩小范围
2. 再用细粒度网格搜索精调
3. 始终用交叉验证评估
4. 重要超参优先调（学习率 > 正则化 > 树的深度）
5. 设置合理搜索空间（对数空间 vs 线性空间）

## 六、验证曲线

验证曲线描绘单个超参数与模型表现的关系，用于：

- 判断超参的合理范围
- 识别过拟合/欠拟合的临界点
- 决定调参方向

例如决策树的 max_depth：太小时欠拟合，太大时过拟合，中间有最优值。

## 七、误差分析

模型评估不止看整体指标，还要做**误差分析**：

1. 找出所有预测错误的样本
2. 按特征分组统计错误率
3. 识别错误模式（某类样本系统性预测错）
4. 反推原因：特征缺失？标注错误？模型容量不足？
5. 针对性改进

## 本章小结

本章系统讲解了模型评估与调优的核心方法：

- **交叉验证**是科学评估的基础，K 折、分层 K 折、时间序列各有适用场景
- **混淆矩阵**及其派生指标（精确率、召回率、F1）覆盖不同业务需求
- **ROC/AUC** 衡量整体排序能力，阈值无关
- **学习曲线**诊断欠/过拟合，决定是否需要更多数据
- **超参数调优**有网格、随机、贝叶斯三种策略，结合使用最佳
- **误差分析**是从指标到改进的桥梁

掌握这些方法后，你就能科学地回答"模型好不好"、"为什么不好"、"如何变好"这三个核心问题。
`,
    code: `
# =============================================================
# 第2章代码：模型评估与调优（纯标准库实现）
# =============================================================
# 本代码用纯 Python 实现：
# 1. K 折交叉验证 + 分层 K 折
# 2. 混淆矩阵与多指标计算
# 3. ROC 曲线绘制数据 + AUC 计算
# 4. 学习曲线生成
# 5. 网格搜索超参数调优

import random
import math
from collections import Counter


# =============================================================
# 工具函数
# =============================================================
def euclidean(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


# =============================================================
# 简单分类器：逻辑回归（用于演示评估）
# =============================================================
class LogReg:
    def __init__(self, lr=0.1, n_iter=300, l2=0.0):
        self.lr = lr
        self.n_iter = n_iter
        self.l2 = l2
        self.w = None
        self.b = 0.0

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        for _ in range(self.n_iter):
            gw = [0.0] * d
            gb = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    gw[j] += err * X[i][j]
                gb += err
            for j in range(d):
                gw[j] = gw[j] / n + self.l2 * self.w[j]
                self.w[j] -= self.lr * gw[j]
            self.b -= self.lr * gb / n
        return self

    def predict_proba(self, X):
        return [sigmoid(sum(self.w[j] * x[j] for j in range(len(x))) + self.b) for x in X]

    def predict(self, X, thr=0.5):
        return [1 if p >= thr else 0 for p in self.predict_proba(X)]


# =============================================================
# 数据集划分工具
# =============================================================
def shuffle_indices(n, seed=42):
    random.seed(seed)
    idx = list(range(n))
    random.shuffle(idx)
    return idx


def kfold_indices(n, k=5, seed=42):
    """普通 K 折：返回 [(train_idx, val_idx), ...]"""
    idx = shuffle_indices(n, seed)
    fold_size = n // k
    folds = []
    for i in range(k):
        val_idx = idx[i * fold_size: (i + 1) * fold_size]
        train_idx = idx[: i * fold_size] + idx[(i + 1) * fold_size:]
        folds.append((train_idx, val_idx))
    return folds


def stratified_kfold_indices(y, k=5, seed=42):
    """分层 K 折：保证每折类别比例一致"""
    random.seed(seed)
    # 按类别分组
    class_indices = {}
    for i, label in enumerate(y):
        class_indices.setdefault(label, []).append(i)
    # 每个类别内部打乱
    for label in class_indices:
        random.shuffle(class_indices[label])
    # 把每个类别的样本均匀分配到 K 折
    folds = [[] for _ in range(k)]
    for label, indices in class_indices.items():
        for i, idx in enumerate(indices):
            folds[i % k].append(idx)
    # 生成 (train, val)
    result = []
    for i in range(k):
        val_idx = folds[i]
        train_idx = []
        for j in range(k):
            if j != i:
                train_idx.extend(folds[j])
        result.append((train_idx, val_idx))
    return result


# =============================================================
# 评估指标
# =============================================================
def confusion_matrix(y_true, y_pred):
    cm = {"TP": 0, "FP": 0, "TN": 0, "FN": 0}
    for t, p in zip(y_true, y_pred):
        if t == 1 and p == 1: cm["TP"] += 1
        elif t == 0 and p == 1: cm["FP"] += 1
        elif t == 0 and p == 0: cm["TN"] += 1
        else: cm["FN"] += 1
    return cm


def accuracy(y_true, y_pred):
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)


def precision(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    return cm["TP"] / (cm["TP"] + cm["FP"]) if (cm["TP"] + cm["FP"]) > 0 else 0.0


def recall(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    return cm["TP"] / (cm["TP"] + cm["FN"]) if (cm["TP"] + cm["FN"]) > 0 else 0.0


def f1_score(y_true, y_pred):
    p = precision(y_true, y_pred)
    r = recall(y_true, y_pred)
    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0


def roc_curve(y_true, y_score):
    """返回 (fpr_list, tpr_list, thresholds)"""
    # 按分数降序排列
    pairs = sorted(zip(y_score, y_true), reverse=True)
    P = sum(1 for t in y_true if t == 1)
    N = sum(1 for t in y_true if t == 0)
    fprs, tprs, thrs = [1.0], [1.0], [pairs[0][0] + 1]
    tp, fp = 0, 0
    prev_score = None
    for score, label in pairs:
        if score != prev_score:
            fprs.append(fp / N if N > 0 else 0)
            tprs.append(tp / P if P > 0 else 0)
            thrs.append(score)
            prev_score = score
        if label == 1:
            tp += 1
        else:
            fp += 1
    fprs.append(0.0)
    tprs.append(0.0)
    thrs.append(0.0)
    return fprs, tprs, thrs


def auc_score(y_true, y_score):
    """用 Mann-Whitney U 计算 AUC"""
    pos = [s for t, s in zip(y_true, y_score) if t == 1]
    neg = [s for t, s in zip(y_true, y_score) if t == 0]
    if not pos or not neg:
        return 0.5
    correct = 0
    for p in pos:
        for n in neg:
            if p > n: correct += 1
            elif p == n: correct += 0.5
    return correct / (len(pos) * len(neg))


# =============================================================
# 交叉验证
# =============================================================
def cross_val_score(model_factory, X, y, cv=5, stratified=True, metric="accuracy"):
    """交叉验证，返回每折的分数"""
    if stratified:
        folds = stratified_kfold_indices(y, k=cv)
    else:
        folds = kfold_indices(len(y), k=cv)
    scores = []
    for train_idx, val_idx in folds:
        Xtr = [X[i] for i in train_idx]
        ytr = [y[i] for i in train_idx]
        Xval = [X[i] for i in val_idx]
        yval = [y[i] for i in val_idx]
        model = model_factory()
        model.fit(Xtr, ytr)
        y_pred = model.predict(Xval)
        if metric == "accuracy":
            s = accuracy(yval, y_pred)
        elif metric == "f1":
            s = f1_score(yval, y_pred)
        elif metric == "auc":
            s = auc_score(yval, model.predict_proba(Xval))
        else:
            s = accuracy(yval, y_pred)
        scores.append(s)
    return scores


# =============================================================
# 学习曲线
# =============================================================
def learning_curve(model_factory, X, y, train_sizes=None, cv=5):
    """学习曲线：返回 train_sizes, train_scores, val_scores"""
    if train_sizes is None:
        n = len(X)
        train_sizes = [int(n * f) for f in [0.2, 0.4, 0.6, 0.8, 1.0]]
    folds = stratified_kfold_indices(y, k=cv)
    train_scores, val_scores = [], []
    for size in train_sizes:
        ts, vs = [], []
        for train_idx, val_idx in folds:
            sub_train = train_idx[:size]
            Xtr = [X[i] for i in sub_train]
            ytr = [y[i] for i in sub_train]
            Xval = [X[i] for i in val_idx]
            yval = [y[i] for i in val_idx]
            model = model_factory()
            model.fit(Xtr, ytr)
            ts.append(accuracy(ytr, model.predict(Xtr)))
            vs.append(accuracy(yval, model.predict(Xval)))
        train_scores.append(sum(ts) / len(ts))
        val_scores.append(sum(vs) / len(vs))
    return train_sizes, train_scores, val_scores


# =============================================================
# 网格搜索
# =============================================================
def grid_search(model_factory, param_grid, X, y, cv=5, metric="accuracy"):
    """
    param_grid: {"lr": [0.01, 0.1, 0.5], "n_iter": [100, 300]}
    model_factory: 接收参数字典，返回模型实例
    """
    # 生成所有参数组合
    keys = list(param_grid.keys())
    combos = [{}]
    for k in keys:
        new_combos = []
        for c in combos:
            for v in param_grid[k]:
                nc = dict(c)
                nc[k] = v
                new_combos.append(nc)
        combos = new_combos

    results = []
    for params in combos:
        def factory(p=params):
            return model_factory(p)
        scores = cross_val_score(factory, X, y, cv=cv, metric=metric)
        mean = sum(scores) / len(scores)
        std = (sum((s - mean) ** 2 for s in scores) / len(scores)) ** 0.5
        results.append((params, mean, std))
        print(f"  参数 {params} -> {metric}={mean:.4f} ± {std:.4f}")

    best = max(results, key=lambda x: x[1])
    return best


# =============================================================
# 生成数据
# =============================================================
def make_classification(n=400, n_features=4, seed=42):
    random.seed(seed)
    X, y = [], []
    for _ in range(n // 2):
        # 类别 0
        X.append([random.gauss(-1, 1) for _ in range(n_features)])
        y.append(0)
        # 类别 1
        X.append([random.gauss(1.5, 1) for _ in range(n_features)])
        y.append(1)
    # 标准化
    for j in range(n_features):
        col = [X[i][j] for i in range(len(X))]
        mean = sum(col) / len(col)
        std = math.sqrt(sum((c - mean) ** 2 for c in col) / len(col)) + 1e-8
        for i in range(len(X)):
            X[i][j] = (X[i][j] - mean) / std
    return X, y


# =============================================================
# 主程序
# =============================================================
def main():
    print("=" * 70)
    print("模型评估与调优演示")
    print("=" * 70)

    X, y = make_classification(n=400, n_features=4)
    print(f"\\n数据集: {len(X)} 条样本, {len(X[0])} 个特征")
    print(f"类别分布: {Counter(y)}")

    # 演示 1：K 折交叉验证
    print("\\n" + "=" * 70)
    print("演示 1：5 折分层交叉验证")
    print("=" * 70)
    factory = lambda: LogReg(lr=0.1, n_iter=300)
    scores = cross_val_score(factory, X, y, cv=5, stratified=True, metric="accuracy")
    print(f"  每折准确率: {[round(s, 4) for s in scores]}")
    print(f"  平均: {sum(scores)/len(scores):.4f}")
    print(f"  标准差: {(sum((s - sum(scores)/len(scores))**2 for s in scores)/len(scores))**0.5:.4f}")

    # 演示 2：混淆矩阵与多指标
    print("\\n" + "=" * 70)
    print("演示 2：混淆矩阵与多指标")
    print("=" * 70)
    # 简单划分
    idx = shuffle_indices(len(X))
    split = int(len(X) * 0.7)
    Xtr = [X[i] for i in idx[:split]]
    ytr = [y[i] for i in idx[:split]]
    Xte = [X[i] for i in idx[split:]]
    yte = [y[i] for i in idx[split:]]
    model = LogReg(lr=0.1, n_iter=300).fit(Xtr, ytr)
    y_pred = model.predict(Xte)
    cm = confusion_matrix(yte, y_pred)
    print(f"  混淆矩阵: {cm}")
    print(f"  Accuracy : {accuracy(yte, y_pred):.4f}")
    print(f"  Precision: {precision(yte, y_pred):.4f}")
    print(f"  Recall   : {recall(yte, y_pred):.4f}")
    print(f"  F1       : {f1_score(yte, y_pred):.4f}")

    # 演示 3：ROC 曲线与 AUC
    print("\\n" + "=" * 70)
    print("演示 3：ROC 曲线与 AUC")
    print("=" * 70)
    y_score = model.predict_proba(Xte)
    fprs, tprs, thrs = roc_curve(yte, y_score)
    auc = auc_score(yte, y_score)
    print(f"  AUC = {auc:.4f}")
    print(f"  ROC 关键点 (前 10 个):")
    print(f"    {'阈值':>10} | {'FPR':>6} | {'TPR':>6}")
    for i in range(0, min(10, len(fprs))):
        print(f"    {thrs[i]:>10.4f} | {fprs[i]:>6.3f} | {tprs[i]:>6.3f}")

    # 演示 4：学习曲线
    print("\\n" + "=" * 70)
    print("演示 4：学习曲线")
    print("=" * 70)
    sizes, tr_scores, val_scores = learning_curve(factory, X, y, cv=5)
    print(f"  {'训练集大小':>10} | {'训练分数':>8} | {'验证分数':>8} | {'差距':>8}")
    for i in range(len(sizes)):
        gap = tr_scores[i] - val_scores[i]
        print(f"  {sizes[i]:>10} | {tr_scores[i]:>8.4f} | {val_scores[i]:>8.4f} | {gap:>8.4f}")
    print("  解读: 训练分数与验证分数都高且接近 -> 拟合良好")

    # 演示 5：网格搜索
    print("\\n" + "=" * 70)
    print("演示 5：网格搜索超参数调优")
    print("=" * 70)
    param_grid = {
        "lr": [0.05, 0.1, 0.3],
        "n_iter": [200, 500],
        "l2": [0.0, 0.1],
    }
    def factory_grid(p):
        return LogReg(lr=p["lr"], n_iter=p["n_iter"], l2=p["l2"])
    print(f"  参数网格: {param_grid}")
    print(f"  共 {3*2*2} 种组合")
    best_params, best_score, best_std = grid_search(factory_grid, param_grid, X, y, cv=5, metric="f1")
    print(f"\\n  ✅ 最优参数: {best_params}")
    print(f"  ✅ 最优 F1: {best_score:.4f} ± {best_std:.4f}")

    print("\\n" + "=" * 70)
    print("✅ 模型评估与调优演示完成！")
    print("=" * 70)


if __name__ == "__main__":
    main()
`,
  },

  // =============================================================
  // 第3章：模型保存与加载
  // =============================================================
  {
    id: "aipy-model-io",
    icon: "💾",
    group: "AI项目实战",
    title: "模型保存与加载",
    content: `
# 模型保存与加载

## 引言：训练完成只是开始

训练一个模型可能需要几分钟到几天，但训练完成后，模型必须能够"持久化"到磁盘，否则进程一结束所有努力归零。更现实的需求是：训练环境与推理环境可能完全不同（不同的机器、不同的语言、不同的硬件），如何让模型在两者之间无缝迁移？

本章将系统讲解模型持久化的多种方案：从最基础的 pickle/joblib，到跨语言的 ONNX 格式，再到生产级的模型版本管理。理解这些方案后，你才能把模型从"notebook 实验"真正搬到"线上服务"。

## 一、为什么需要保存模型

### 1.1 训练成本高

- 深度学习模型训练可能耗时数天
- 大模型微调动辄消耗数千 GPU 小时
- 重新训练意味着重新消耗算力与时间

### 1.2 训练与推理分离

- 训练用 GPU 服务器，推理用 CPU 边缘设备
- 训练用 Python + PyTorch，推理用 C++ + ONNX Runtime
- 训练在云上，推理在本地

### 1.3 模型复用与共享

- 把训练好的模型分享给团队
- 在多个项目中复用同一个模型
- 上传到模型仓库供他人下载

### 1.4 A/B 测试与回滚

线上同时运行多个模型版本，需要保存历史版本以便对比与回滚。

## 二、Pickle：Python 原生序列化

### 2.1 基本用法

pickle 是 Python 标准库的序列化模块，可以把任意 Python 对象转成字节流：

\`\`\`python
import pickle

# 保存
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

# 加载
with open("model.pkl", "rb") as f:
    model = pickle.load(f)
\`\`\`

### 2.2 优势与局限

优势：

- Python 自带，无需安装
- 几乎能序列化任何 Python 对象
- 使用简单

局限：

- **只能 Python 用**：其他语言无法读取
- **不安全**：加载恶意 pickle 可执行任意代码
- **版本兼容性差**：Python 2/3 之间、不同库版本之间可能不兼容
- **大文件效率低**：纯文本序列化体积大

### 2.3 注意事项

- 永远不要加载来源不明的 pickle 文件
- 保存时记录 Python 版本、库版本
- 大模型用 joblib 替代

## 三、Joblib：科学计算场景的优化

### 3.1 与 pickle 的关系

joblib 是 scikit-learn 推荐的持久化方式，底层基于 pickle，但针对 NumPy 数组做了优化：

- 使用压缩存储，文件更小
- 支持内存映射，加载大数组更快
- 支持 parallel 持久化

### 3.2 基本用法

\`\`\`python
import joblib

# 保存（可指定压缩）
joblib.dump(model, "model.joblib", compress=3)

# 加载
model = joblib.load("model.joblib")
\`\`\`

compress 参数取值 0-9，数字越大压缩越强但保存/加载越慢。常用 3。

### 3.3 何时用 joblib

- 模型包含大量 NumPy 数组（如随机森林的树结构）
- 需要更小的文件体积
- 在 scikit-learn 生态内

## 四、自定义序列化格式

### 4.1 为什么需要自定义

pickle/joblib 把"整个对象"序列化，但这有几个问题：

- 反序列化必须用同样的类定义
- 类内部修改后旧模型可能无法加载
- 无法跨语言使用

更稳健的做法是：**只保存模型的参数**，加载时根据参数重建模型。

### 4.2 参数保存示例

\`\`\`python
import json

# 保存
params = {"w": model.coef_.tolist(), "b": model.intercept_}
with open("model.json", "w") as f:
    json.dump(params, f)

# 加载
with open("model.json") as f:
    params = json.load(f)
model = MyModel()
model.coef_ = params["w"]
model.intercept_ = params["b"]
\`\`\`

优势：

- 格式透明可读
- 跨语言兼容（JSON 通用）
- 不依赖类定义

劣势：

- 需要手动设计序列化逻辑
- 复杂模型（如神经网络）参数太多

### 4.3 配合元数据

保存模型时应同时保存元数据：

\`\`\`python
artifact = {
    "model_type": "logistic_regression",
    "version": "1.0.0",
    "trained_at": "2026-07-06",
    "features": ["age", "income", "score"],
    "hyperparams": {"lr": 0.1, "n_iter": 300},
    "metrics": {"accuracy": 0.92, "auc": 0.88},
    "parameters": {"w": [...], "b": ...}
}
\`\`\`

## 五、ONNX：跨语言跨框架标准

### 5.1 ONNX 是什么

ONNX（Open Neural Network Exchange）是微软、Facebook 等联合推出的开放模型格式。它的目标是：

- 一次训练，到处运行
- 跨框架互转（PyTorch → ONNX → TensorFlow）
- 高性能推理（ONNX Runtime 比 PyTorch 推理快 2-3 倍）

### 5.2 ONNX 的核心概念

- **算子（Operator）**：标准化的计算单元，如 Conv、Relu、MatMul
- **计算图（Graph）**：算子组成的 DAG，描述模型结构
- **权重（Initializer）**：模型的参数

### 5.3 优势

- 跨语言：Python、C++、Java、C#、JavaScript 都能加载
- 跨硬件：CPU、GPU、NPU、移动端
- 高性能：ONNX Runtime 针对各硬件做了优化
- 可量化：支持 INT8 量化，加速推理

### 5.4 局限

- 不是所有算子都支持
- 动态结构（如变长序列）支持有限
- 转换过程可能丢失信息

### 5.5 典型流程

1. PyTorch 训练：\`model.pt\`
2. 导出 ONNX：\`torch.onnx.export(model, ...)\`
3. 优化：\`onnxoptimizer.optimize\`
4. 量化：\`onnxruntime.quantization\`
5. 部署：C++/Java 加载 ONNX Runtime 推理

## 六、模型版本管理

### 6.1 为什么需要版本管理

模型上线后会持续迭代，每个版本都要可追溯：

- 哪个版本上线了？什么时候？效果如何？
- 出问题时能快速回滚到上一版本
- A/B 测试需要明确版本对比

### 6.2 版本号规范

推荐用语义化版本：

- **MAJOR**：模型结构变化（如换算法）
- **MINOR**：超参或特征调整
- **PATCH**：重新训练（数据更新）

例如 v1.2.3 表示第 1 个大版本，第 2 次特征调整，第 3 次重训。

### 6.3 模型注册表（Model Registry）

模型注册表是集中管理模型版本的服务，常见实现：

- **MLflow Model Registry**：开源，与 MLflow 生态集成
- **DVC**：Git 风格的模型版本管理
- **Weights & Biases**：商业服务，集成实验跟踪
- **AWS SageMaker Model Registry**：云原生方案

注册表核心字段：

- 模型名称、版本号
- 训练数据集版本
- 超参数
- 评估指标
- 训练时间、训练者
- 状态：Staging / Production / Archived

### 6.4 模型工件（Artifact）结构

推荐的目录结构：

\`\`\`
models/
└── fraud_detector/
    └── v1.2.3/
        ├── model.pkl          # 模型文件
        ├── config.json        # 超参与特征配置
        ├── metrics.json       # 评估指标
        ├── preprocess.pkl     # 预处理管道
        ├── requirements.txt   # 依赖版本
        └── README.md          # 模型说明
\`\`\`

## 七、模型加载的安全考虑

### 7.1 反序列化漏洞

pickle.load 可执行任意代码，攻击者可构造恶意 pickle 文件窃取数据或控制服务器。

防御措施：

- 永不加载来源不明的 pickle
- 用 JSON/ONNX 替代 pickle
- 用 pickle RestrictedLoader 限制可加载的类

### 7.2 模型水印与签名

为防止模型被窃取，可以：

- 在模型中嵌入水印（不影响功能但能溯源）
- 用数字签名验证模型完整性
- 加密存储敏感模型

## 八、实战建议

### 8.1 选型决策树

1. 仅 Python 内部用 → pickle/joblib
2. 跨语言/跨框架 → ONNX
3. 简单线性模型 → JSON 存参数
4. 深度学习线上推理 → ONNX + ONNX Runtime
5. 大模型 → 专用格式（GGUF、SafeTensors）

### 8.2 工程最佳实践

- 模型与代码一起版本化
- 保存训练时的随机种子
- 记录依赖版本（pip freeze）
- 上线前在 hold-out 测试集验证
- 加载后用已知样本验证输出

## 本章小结

本章系统讲解了模型持久化的多种方案：

- **pickle/joblib**：Python 内部使用，简单但局限
- **自定义参数序列化**：稳健可控，适合简单模型
- **ONNX**：跨语言跨框架标准，工业级推理首选
- **版本管理**：用语义化版本号 + 注册表管理模型生命周期
- **安全考虑**：警惕 pickle 反序列化漏洞

实际项目中往往是多种方案组合使用：训练时用 pickle 保存检查点，导出时转 ONNX，注册到 MLflow，线上用 ONNX Runtime 推理。掌握这些方案后，模型才能真正"流动"起来。
`,
    code: `
# =============================================================
# 第3章代码：模型保存与加载（纯标准库实现）
# =============================================================
# 本代码用纯 Python 演示：
# 1. 用 pickle 保存/加载模型
# 2. 用 JSON 保存模型参数（自定义格式）
# 3. 简单的模型版本管理
# 4. 模型工件目录结构生成
# 5. 加载后的模型验证

import pickle
import json
import os
import time
import math
import random
from collections import Counter


# =============================================================
# 自定义模型类：逻辑回归
# =============================================================
class LogisticRegression:
    """简单的逻辑回归，支持 save/load"""
    def __init__(self, lr=0.1, n_iter=300, l2=0.0):
        self.lr = lr
        self.n_iter = n_iter
        self.l2 = l2
        self.w = None
        self.b = 0.0
        self.classes_ = None

    @staticmethod
    def _sigmoid(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def fit(self, X, y):
        self.classes_ = sorted(set(y))
        n, d = len(X), len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        for _ in range(self.n_iter):
            gw = [0.0] * d
            gb = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = self._sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    gw[j] += err * X[i][j]
                gb += err
            for j in range(d):
                gw[j] = gw[j] / n + self.l2 * self.w[j]
                self.w[j] -= self.lr * gw[j]
            self.b -= self.lr * gb / n
        return self

    def predict_proba(self, X):
        return [self._sigmoid(sum(self.w[j] * x[j] for j in range(len(x))) + self.b) for x in X]

    def predict(self, X, thr=0.5):
        return [1 if p >= thr else 0 for p in self.predict_proba(X)]

    # ---------- pickle 方式 ----------
    def save_pickle(self, path):
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load_pickle(cls, path):
        with open(path, "rb") as f:
            return pickle.load(f)

    # ---------- JSON 参数方式 ----------
    def to_dict(self):
        """把模型参数转成可 JSON 序列化的字典"""
        return {
            "model_type": "LogisticRegression",
            "hyperparams": {
                "lr": self.lr,
                "n_iter": self.n_iter,
                "l2": self.l2,
            },
            "parameters": {
                "w": self.w,
                "b": self.b,
            },
            "classes": self.classes_,
        }

    @classmethod
    def from_dict(cls, d):
        model = cls(**d["hyperparams"])
        model.w = d["parameters"]["w"]
        model.b = d["parameters"]["b"]
        model.classes_ = d["classes"]
        return model

    def save_json(self, path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)

    @classmethod
    def load_json(cls, path):
        with open(path, "r", encoding="utf-8") as f:
            return cls.from_dict(json.load(f))


# =============================================================
# 模型版本管理器
# =============================================================
class ModelRegistry:
    """简单的模型版本注册表"""
    def __init__(self, base_dir="model_registry"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)
        self.index_path = os.path.join(base_dir, "index.json")
        if os.path.exists(self.index_path):
            with open(self.index_path, "r") as f:
                self.index = json.load(f)
        else:
            self.index = {"models": {}}

    def register(self, name, version, model, metrics=None, features=None, status="staging"):
        """注册一个模型版本"""
        # 创建模型目录
        model_dir = os.path.join(self.base_dir, name, version)
        os.makedirs(model_dir, exist_ok=True)

        # 保存模型
        model_path = os.path.join(model_dir, "model.pkl")
        model.save_pickle(model_path)

        # 保存元数据
        meta = {
            "name": name,
            "version": version,
            "status": status,
            "registered_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "metrics": metrics or {},
            "features": features or [],
            "model_path": model_path,
        }
        meta_path = os.path.join(model_dir, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        # 更新索引
        if name not in self.index["models"]:
            self.index["models"][name] = {"versions": {}}
        self.index["models"][name]["versions"][version] = meta
        self._save_index()
        print(f"  ✅ 已注册模型 {name}@{version} (status={status})")
        return model_dir

    def transition(self, name, version, status):
        """转换模型状态：staging -> production -> archived"""
        if name not in self.index["models"]:
            raise ValueError(f"模型 {name} 不存在")
        if version not in self.index["models"][name]["versions"]:
            raise ValueError(f"版本 {version} 不存在")
        self.index["models"][name]["versions"][version]["status"] = status
        self._save_index()
        print(f"  ✅ {name}@{version} -> {status}")

    def get_production(self, name):
        """获取生产环境的模型版本"""
        if name not in self.index["models"]:
            return None
        for v, meta in self.index["models"][name]["versions"].items():
            if meta["status"] == "production":
                return meta
        return None

    def load(self, name, version=None):
        """加载模型，version=None 则加载生产版本"""
        if version is None:
            meta = self.get_production(name)
            if meta is None:
                raise ValueError(f"没有 {name} 的生产版本")
        else:
            meta = self.index["models"][name]["versions"][version]
        return LogisticRegression.load_pickle(meta["model_path"]), meta

    def list_versions(self, name):
        """列出某个模型的所有版本"""
        if name not in self.index["models"]:
            return []
        return self.index["models"][name]["versions"]

    def _save_index(self):
        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(self.index, f, ensure_ascii=False, indent=2)


# =============================================================
# 数据生成与评估
# =============================================================
def make_data(n=400, seed=42):
    random.seed(seed)
    X, y = [], []
    for _ in range(n // 2):
        X.append([random.gauss(-1, 1), random.gauss(-1, 1)])
        y.append(0)
        X.append([random.gauss(1.5, 1), random.gauss(1.5, 1)])
        y.append(1)
    # 标准化
    for j in range(2):
        col = [X[i][j] for i in range(len(X))]
        m = sum(col) / len(col)
        s = math.sqrt(sum((c - m) ** 2 for c in col) / len(col)) + 1e-8
        for i in range(len(X)):
            X[i][j] = (X[i][j] - m) / s
    return X, y


def accuracy(y_true, y_pred):
    return sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true)


# =============================================================
# 主程序
# =============================================================
def main():
    print("=" * 70)
    print("模型保存与加载演示")
    print("=" * 70)

    # 准备数据与模型
    X, y = make_data(n=400)
    split = int(len(X) * 0.7)
    Xtr, ytr = X[:split], y[:split]
    Xte, yte = X[split:], y[split:]
    model = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr, ytr)
    acc = accuracy(yte, model.predict(Xte))
    print(f"\\n训练完成，测试集准确率: {acc:.4f}")
    print(f"模型权重 w: {[round(w, 4) for w in model.w]}, b: {model.b:.4f}")

    # 演示 1：pickle 保存与加载
    print("\\n" + "=" * 70)
    print("演示 1：Pickle 保存与加载")
    print("=" * 70)
    pickle_path = "/tmp/demo_model.pkl"
    model.save_pickle(pickle_path)
    file_size = os.path.getsize(pickle_path)
    print(f"  保存路径: {pickle_path}")
    print(f"  文件大小: {file_size} 字节")
    loaded = LogisticRegression.load_pickle(pickle_path)
    print(f"  加载后权重: {[round(w, 4) for w in loaded.w]}, b: {loaded.b:.4f}")
    # 验证一致性
    pred_orig = model.predict(Xte[:5])
    pred_load = loaded.predict(Xte[:5])
    print(f"  原模型预测: {pred_orig}")
    print(f"  加载模型预测: {pred_load}")
    print(f"  一致性: {'✅ 完全一致' if pred_orig == pred_load else '❌ 不一致'}")

    # 演示 2：JSON 参数保存与加载
    print("\\n" + "=" * 70)
    print("演示 2：JSON 参数保存与加载")
    print("=" * 70)
    json_path = "/tmp/demo_model.json"
    model.save_json(json_path)
    file_size = os.path.getsize(json_path)
    print(f"  保存路径: {json_path}")
    print(f"  文件大小: {file_size} 字节")
    with open(json_path) as f:
        content = json.load(f)
    print(f"  元数据: model_type={content['model_type']}")
    print(f"  超参数: {content['hyperparams']}")
    print(f"  类别: {content['classes']}")
    loaded_json = LogisticRegression.load_json(json_path)
    pred_json = loaded_json.predict(Xte[:5])
    print(f"  JSON 模型预测: {pred_json}")
    print(f"  一致性: {'✅ 完全一致' if pred_orig == pred_json else '❌ 不一致'}")

    # 演示 3：模型版本管理
    print("\\n" + "=" * 70)
    print("演示 3：模型版本管理（Model Registry）")
    print("=" * 70)
    registry = ModelRegistry(base_dir="/tmp/model_registry")
    # 注册多个版本
    print("\\n-- 注册 v1.0.0 --")
    model_v1 = LogisticRegression(lr=0.01, n_iter=100).fit(Xtr, ytr)
    acc_v1 = accuracy(yte, model_v1.predict(Xte))
    registry.register(
        name="fraud_detector",
        version="v1.0.0",
        model=model_v1,
        metrics={"accuracy": round(acc_v1, 4)},
        features=["amount", "hour"],
        status="staging",
    )
    print("\\n-- 注册 v1.1.0 --")
    model_v2 = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr, ytr)
    acc_v2 = accuracy(yte, model_v2.predict(Xte))
    registry.register(
        name="fraud_detector",
        version="v1.1.0",
        model=model_v2,
        metrics={"accuracy": round(acc_v2, 4)},
        features=["amount", "hour"],
        status="staging",
    )
    # 把 v1.1.0 转为生产
    print("\\n-- 提升 v1.1.0 为生产 --")
    registry.transition("fraud_detector", "v1.1.0", "production")

    # 列出所有版本
    print("\\n-- 所有版本 --")
    versions = registry.list_versions("fraud_detector")
    for v, meta in versions.items():
        print(f"  {v}: status={meta['status']}, acc={meta['metrics'].get('accuracy', 'N/A')}")

    # 加载生产版本
    print("\\n-- 加载生产版本 --")
    prod_model, prod_meta = registry.load("fraud_detector")
    print(f"  加载版本: {prod_meta['version']}")
    print(f"  准确率: {prod_meta['metrics']['accuracy']}")
    print(f"  特征: {prod_meta['features']}")

    # 演示 4：模型工件目录结构
    print("\\n" + "=" * 70)
    print("演示 4：模型工件目录结构")
    print("=" * 70)
    print("  model_registry/")
    print("  ├── index.json")
    for name in registry.index["models"]:
        print(f"  └── {name}/")
        for v, meta in registry.index["models"][name]["versions"].items():
            print(f"      └── {v}/")
            print(f"          ├── model.pkl")
            print(f"          └── metadata.json (status={meta['status']})")

    # 演示 5：加载后验证
    print("\\n" + "=" * 70)
    print("演示 5：加载后验证（健全性检查）")
    print("=" * 70)
    print("  用已知样本验证模型输出是否符合预期")
    test_samples = Xte[:5]
    expected = model.predict(test_samples)
    actual = loaded.predict(test_samples)
    print(f"  测试样本: {[[round(v, 2) for v in x] for x in test_samples]}")
    print(f"  期望输出: {expected}")
    print(f"  实际输出: {actual}")
    if expected == actual:
        print("  ✅ 模型加载验证通过")
    else:
        print("  ❌ 模型加载验证失败")

    print("\\n" + "=" * 70)
    print("✅ 模型保存与加载演示完成！")
    print("=" * 70)


if __name__ == "__main__":
    main()
`,
  },

  // =============================================================
  // 第4章：AI模型部署实战
  // =============================================================
  {
    id: "aipy-deploy",
    icon: "🌐",
    group: "AI项目实战",
    title: "AI模型部署实战",
    content: `
# AI模型部署实战

## 引言：模型上线的最后一公里

训练出一个 AUC 0.95 的模型只是开始，让它真正服务用户才是终点。但很多团队卡在"最后一公里"：模型在 notebook 里跑得好好的，一旦要变成可调用的服务，就遇到一堆工程问题——延迟高、内存爆、并发崩、版本乱、监控缺失。

本章系统讲解 AI 模型部署的方方面面：从最简单的 Flask API，到 Docker 容器化，再到模型压缩量化，最后对比批处理与实时推理的选型。学完本章，你能把任何模型变成生产级服务。

## 一、部署形态对比

### 1.1 实时推理（Online Inference）

模型作为常驻服务，对每个请求即时响应。

特点：

- **延迟低**：毫秒级响应
- **可用性高**：需要负载均衡、健康检查
- **资源常驻**：模型常驻内存/GPU
- **适用场景**：推荐、搜索、风控、对话

典型架构：客户端 → API 网关 → 模型服务（多个副本） → 监控

### 1.2 批处理推理（Batch Inference）

定时跑批，一次处理大量数据。

特点：

- **吞吐高**：可并行处理百万级数据
- **延迟不敏感**：分钟到小时级
- **资源弹性**：可临时拉起大量算力
- **适用场景**：日报、月度评分、用户分群、特征预计算

典型架构：调度系统 → Spark/Flink 任务 → 写入数据库/缓存

### 1.3 流式推理（Streaming Inference）

处理实时数据流，介于批处理与实时之间。

特点：

- **近实时**：秒级延迟
- **状态管理**：维护会话/窗口状态
- **适用场景**：实时风控、IoT 监控、日志分析

### 1.4 边缘部署（Edge Deployment）

模型部署在手机、IoT 设备、车载芯片上。

特点：

- **离线可用**：不依赖网络
- **隐私友好**：数据不出端
- **资源受限**：模型必须轻量
- **适用场景**：人脸解锁、语音助手、自动驾驶

## 二、Flask API：最简单的部署方式

### 2.1 基本结构

\`\`\`python
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    features = data["features"]
    pred = model.predict([features])
    return jsonify({"prediction": pred[0]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
\`\`\`

### 2.2 生产化改进

裸 Flask 不适合生产，需要补充：

- **模型预加载**：启动时加载，避免每次请求加载
- **输入校验**：用 pydantic 校验请求体
- **错误处理**：try-except 返回明确错误
- **日志记录**：记录每次请求的输入输出
- **限流**：防止恶意刷接口
- **认证**：API Key / OAuth

### 2.3 性能优化

- **多 worker**：gunicorn -w 4 启动多进程
- **异步任务**：耗时操作用 Celery 异步
- **批处理请求**：一次预测多条样本
- **模型缓存**：把热门用户的预测结果缓存

### 2.4 用 FastAPI 替代 Flask

FastAPI 在 AI 部署中更流行，因为：

- 原生异步支持
- 自动生成 OpenAPI 文档
- 基于 Pydantic 的类型校验
- 性能比 Flask 高

## 三、Docker 容器化

### 3.1 为什么要容器化

- **环境隔离**：避免依赖冲突
- **可移植**：一次构建，到处运行
- **可扩展**：Kubernetes 编排副本数
- **可复现**：镜像版本固定环境

### 3.2 Dockerfile 示例

\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖（利用缓存层）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码与模型
COPY app.py .
COPY model.pkl .

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
\`\`\`

### 3.3 镜像优化技巧

- **用 slim/alpine 基础镜像**：体积小
- **多阶段构建**：编译环境与运行环境分离
- **合并 RUN 指令**：减少层数
- **.dockerignore**：排除不必要文件
- **固定版本号**：避免依赖漂移

### 3.4 Kubernetes 部署

K8s 管理 Docker 容器集群，核心概念：

- **Deployment**：管理 Pod 副本数
- **Service**：提供稳定访问入口
- **HPA**：根据 CPU/QPS 自动扩缩容
- **Ingress**：HTTP 路由与 TLS

模型服务部署到 K8s 后能享受：自愈、滚动更新、自动扩缩、灰度发布。

## 四、模型推理优化

### 4.1 推理瓶颈分析

模型推理慢的常见原因：

- 模型本身计算量大（如大 Transformer）
- 内存带宽瓶颈（参数搬运）
- 单条请求无法利用批处理
- Python 解释器开销

### 4.2 模型压缩

**剪枝（Pruning）**：移除不重要的权重或神经元

- 非结构化剪枝：把小权重置零
- 结构化剪枝：移除整个通道/层

**量化（Quantization）**：把 FP32 权重转成 INT8/INT4

- 动态量化：推理时量化
- 静态量化：训练后量化
- QAT（Quantization Aware Training）：训练时模拟量化

**蒸馏（Distillation）**：用大模型教小模型

- Teacher 模型（大）→ Student 模型（小）
- Student 学习 Teacher 的软标签
- 体积减少 10 倍，性能保留 90%

### 4.3 推理加速库

- **ONNX Runtime**：跨平台高性能推理
- **TensorRT**：NVIDIA GPU 优化
- **OpenVINO**：Intel CPU 优化
- **TFLite**：移动端
- **vLLM**：大模型推理加速（PagedAttention）

### 4.4 批处理与动态批处理

GPU 推理时，单条请求效率低。批处理把多条请求合并：

- **静态批处理**：等够 N 条再处理（延迟换吞吐）
- **动态批处理**：在窗口期内收集请求，超时也处理（平衡延迟与吞吐）

Triton Inference Server 内置动态批处理，是工业级方案。

## 五、批处理 vs 实时推理选型

### 5.1 决策矩阵

| 维度 | 实时推理 | 批处理 |
|------|---------|--------|
| 延迟要求 | 毫秒-秒 | 分钟-小时 |
| 吞吐量 | 中 | 高 |
| 资源占用 | 常驻 | 弹性 |
| 成本 | 高 | 低 |
| 复杂度 | 高 | 低 |
| 适用 | 在线服务 | 离线分析 |

### 5.2 混合架构

实际系统常是混合：

- **离线预计算**：用批处理预计算用户 embedding、商品 embedding
- **实时召回**：用向量检索快速找候选
- **实时排序**：小模型实时打分
- **缓存层**：热门请求结果缓存

### 5.3 案例分析：推荐系统

完整推荐链路：

1. **离线**：训练召回模型、排序模型，预计算用户/物品 embedding
2. **近线**：用户行为流式处理，更新用户兴趣向量
3. **在线召回**：从千万商品中召回数百候选
4. **在线粗排**：轻量模型快速过滤
5. **在线精排**：复杂模型精排 Top 50
6. **重排**：业务规则（多样性、去重、广告位）

## 六、部署监控

### 6.1 监控层次

- **系统层**：CPU、内存、磁盘、网络
- **应用层**：QPS、延迟、错误率、并发数
- **模型层**：预测分布、特征分布、置信度分布
- **业务层**：转化率、点击率、营收

### 6.2 关键指标

- **P50/P90/P99 延迟**：关注尾部延迟
- **错误率**：5xx 错误、模型异常
- **吞吐量**：每秒处理请求数
- **资源利用率**：CPU/GPU/内存使用率

### 6.3 告警策略

- 延迟 P99 > 500ms 持续 5 分钟
- 错误率 > 1% 持续 1 分钟
- 模型预测分布偏离 > 阈值
- GPU 利用率持续 < 30% 或 > 95%

## 七、灰度发布与 A/B 测试

### 7.1 灰度发布

新模型不一次性全量上线，而是逐步放量：

- 1% 流量 → 观察 1 小时
- 5% 流量 → 观察 4 小时
- 25% 流量 → 观察 1 天
- 50% → 100%

每个阶段监控指标，异常立即回滚。

### 7.2 A/B 测试

把用户随机分成 A、B 两组：

- A 组用旧模型
- B 组用新模型
- 统计一段时间后两组业务指标差异
- 用假设检验判断差异是否显著

注意：

- 样本量要足够（统计功效）
- 实验周期要覆盖周期性（至少 1 周）
- 用户分组要稳定（同一用户始终在同一组）

## 八、部署常见坑

1. **训练-推理特征不一致**：训练标准化用训练集统计量，推理忘了用同样的
2. **特征缺失处理不一致**：训练用中位数填充，推理用了 0
3. **模型版本混乱**：线上同时跑多个版本，日志没记录
4. **冷启动慢**：模型加载耗时几分钟，影响扩容
5. **Python GIL**：多线程无法利用多核，要用多进程
6. **GPU 显存泄漏**：长时间运行后显存占满
7. **依赖版本漂移**：库升级导致结果不一致

## 本章小结

本章覆盖了 AI 模型部署的完整知识体系：

- **部署形态**：实时、批处理、流式、边缘各有适用场景
- **Flask/FastAPI**：最简单的服务化方式
- **Docker + K8s**：生产级容器化方案
- **模型压缩**：剪枝、量化、蒸馏让模型更轻
- **推理加速**：ONNX Runtime、TensorRT、动态批处理
- **监控告警**：四层监控保障稳定
- **灰度发布**：渐进式上线降低风险

部署是把"模型"变成"产品"的关键工程能力，需要数据科学家与平台工程师协作。
`,
    code: `
# =============================================================
# 第4章代码：AI 模型部署实战（纯标准库模拟）
# =============================================================
# 本代码用纯 Python 模拟部署场景：
# 1. 简单的 HTTP 推理服务（用 http.server 模拟）
# 2. 批处理推理
# 3. 模型量化（FP32 -> INT8 模拟）
# 4. 性能对比：原始 vs 量化
# 5. A/B 测试框架模拟

import math
import random
import time
import json
from collections import Counter


# =============================================================
# 模型：逻辑回归
# =============================================================
class LogisticRegression:
    def __init__(self, lr=0.1, n_iter=300):
        self.lr = lr
        self.n_iter = n_iter
        self.w = None
        self.b = 0.0

    @staticmethod
    def _sigmoid(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        for _ in range(self.n_iter):
            gw = [0.0] * d
            gb = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = self._sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    gw[j] += err * X[i][j]
                gb += err
            for j in range(d):
                self.w[j] -= self.lr * gw[j] / n
            self.b -= self.lr * gb / n
        return self

    def predict_proba(self, X):
        return [self._sigmoid(sum(self.w[j] * x[j] for j in range(len(x))) + self.b) for x in X]

    def predict(self, X, thr=0.5):
        return [1 if p >= thr else 0 for p in self.predict_proba(X)]


# =============================================================
# 量化模型：把 FP32 权重转换为 INT8
# =============================================================
class QuantizedLogisticRegression:
    """模拟 INT8 量化的逻辑回归"""
    def __init__(self, fp_model):
        # 找出权重的最大绝对值
        max_abs = max(abs(w) for w in fp_model.w + [fp_model.b])
        self.scale = max_abs / 127.0
        # 量化为 INT8（-128 到 127）
        self.w_int8 = [int(round(w / self.scale)) for w in fp_model.w]
        self.b_int8 = int(round(fp_model.b / self.scale))
        self.w_fp = fp_model.w  # 保留原始用于对比
        self.b_fp = fp_model.b

    def _dequantize_w(self):
        return [w * self.scale for w in self.w_int8]

    @property
    def dequantized_b(self):
        return self.b_int8 * self.scale

    @staticmethod
    def _sigmoid(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def predict_proba(self, X):
        w = self._dequantize_w()
        b = self.dequantized_b
        return [self._sigmoid(sum(w[j] * x[j] for j in range(len(x))) + b) for x in X]

    def predict(self, X, thr=0.5):
        return [1 if p >= thr else 0 for p in self.predict_proba(X)]

    def memory_size(self):
        """INT8 模型占用字节数"""
        return len(self.w_int8) + 1  # 每个 int8 占 1 字节

    def fp_memory_size(self):
        """对应 FP32 模型占用字节数"""
        return (len(self.w_fp) + 1) * 4  # 每个 float32 占 4 字节


# =============================================================
# HTTP 推理服务（用 http.server 模拟）
# =============================================================
class InferenceServer:
    """模拟一个模型推理服务"""
    def __init__(self, model, name="model-v1"):
        self.model = model
        self.name = name
        self.request_count = 0
        self.total_latency = 0.0
        self.prediction_log = []

    def predict(self, features_list):
        """处理一次预测请求"""
        start = time.time()
        # 模拟网络 + 序列化开销
        time.sleep(0.001)
        predictions = self.model.predict(features_list)
        latency = (time.time() - start) * 1000  # ms
        self.request_count += 1
        self.total_latency += latency
        self.prediction_log.append({
            "request_id": self.request_count,
            "input_count": len(features_list),
            "latency_ms": round(latency, 3),
            "predictions": predictions,
        })
        return {
            "model": self.name,
            "predictions": predictions,
            "latency_ms": round(latency, 3),
        }

    def stats(self):
        avg_latency = self.total_latency / self.request_count if self.request_count else 0
        return {
            "model": self.name,
            "total_requests": self.request_count,
            "avg_latency_ms": round(avg_latency, 3),
        }


# =============================================================
# 批处理推理
# =============================================================
def batch_inference(model, X, batch_size=32):
    """模拟批处理推理，对比单条与批处理性能"""
    # 单条推理
    start = time.time()
    single_results = []
    for x in X:
        single_results.extend(model.predict([x]))
    single_time = time.time() - start

    # 批处理推理
    start = time.time()
    batch_results = []
    for i in range(0, len(X), batch_size):
        batch = X[i:i + batch_size]
        batch_results.extend(model.predict(batch))
    batch_time = time.time() - start

    return {
        "single_time_ms": round(single_time * 1000, 3),
        "batch_time_ms": round(batch_time * 1000, 3),
        "speedup": round(single_time / batch_time, 2),
        "results_match": single_results == batch_results,
    }


# =============================================================
# A/B 测试框架
# =============================================================
class ABTest:
    """简单的 A/B 测试框架"""
    def __init__(self, model_a, model_b, name_a="A", name_b="B"):
        self.model_a = model_a
        self.model_b = model_b
        self.name_a = name_a
        self.name_b = name_b
        self.results_a = []
        self.results_b = []

    def route_and_predict(self, user_id, features):
        """根据 user_id 哈希到 A 或 B 组"""
        group = "A" if user_id % 2 == 0 else "B"
        if group == "A":
            pred = self.model_a.predict([features])[0]
            self.results_a.append({"user_id": user_id, "pred": pred, "features": features})
        else:
            pred = self.model_b.predict([features])[0]
            self.results_b.append({"user_id": user_id, "pred": pred, "features": features})
        return group, pred

    def summary(self):
        n_a = len(self.results_a)
        n_b = len(self.results_b)
        pos_a = sum(1 for r in self.results_a if r["pred"] == 1)
        pos_b = sum(1 for r in self.results_b if r["pred"] == 1)
        rate_a = pos_a / n_a if n_a else 0
        rate_b = pos_b / n_b if n_b else 0
        return {
            "group_a": {"samples": n_a, "positive_rate": round(rate_a, 4)},
            "group_b": {"samples": n_b, "positive_rate": round(rate_b, 4)},
            "diff": round(rate_b - rate_a, 4),
        }


# =============================================================
# 数据生成
# =============================================================
def make_data(n=500, seed=42):
    random.seed(seed)
    X, y = [], []
    for _ in range(n // 2):
        X.append([random.gauss(-1, 1), random.gauss(-1, 1), random.gauss(0, 1)])
        y.append(0)
        X.append([random.gauss(1.5, 1), random.gauss(1.5, 1), random.gauss(0.5, 1)])
        y.append(1)
    # 标准化
    for j in range(3):
        col = [X[i][j] for i in range(len(X))]
        m = sum(col) / len(col)
        s = math.sqrt(sum((c - m) ** 2 for c in col) / len(col)) + 1e-8
        for i in range(len(X)):
            X[i][j] = (X[i][j] - m) / s
    return X, y


def accuracy(y_true, y_pred):
    return sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true)


# =============================================================
# 主程序
# =============================================================
def main():
    print("=" * 70)
    print("AI 模型部署实战演示")
    print("=" * 70)

    # 训练模型
    X, y = make_data(n=500)
    split = int(len(X) * 0.7)
    Xtr, ytr = X[:split], y[:split]
    Xte, yte = X[split:], y[split:]
    model = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr, ytr)
    print(f"\\n模型训练完成，测试集准确率: {accuracy(yte, model.predict(Xte)):.4f}")

    # 演示 1：HTTP 推理服务模拟
    print("\\n" + "=" * 70)
    print("演示 1：HTTP 推理服务模拟")
    print("=" * 70)
    server = InferenceServer(model, name="fraud-detector-v1")
    # 模拟 5 次请求
    test_requests = [
        [[0.5, -0.3, 0.1]],
        [[1.2, 0.8, -0.5], [0.1, -1.0, 0.3]],
        [[-0.5, 0.2, 0.4]],
        [[1.5, 1.1, 0.6], [-0.8, -0.9, -0.2], [0.0, 0.1, 0.0]],
        [[0.9, 0.7, 0.3]],
    ]
    for i, req in enumerate(test_requests, 1):
        result = server.predict(req)
        print(f"  请求 {i}: 输入 {len(req)} 条 -> 预测 {result['predictions']} ({result['latency_ms']} ms)")
    print(f"\\n  服务统计: {server.stats()}")

    # 演示 2：批处理 vs 单条推理
    print("\\n" + "=" * 70)
    print("演示 2：批处理 vs 单条推理性能对比")
    print("=" * 70)
    # 用更大的测试集
    X_large, _ = make_data(n=2000, seed=99)
    result = batch_inference(model, X_large, batch_size=64)
    print(f"  样本数: {len(X_large)}")
    print(f"  单条推理耗时: {result['single_time_ms']} ms")
    print(f"  批处理推理耗时: {result['batch_time_ms']} ms (batch_size=64)")
    print(f"  加速比: {result['speedup']}x")
    print(f"  结果一致: {'✅' if result['results_match'] else '❌'}")

    # 演示 3：模型量化
    print("\\n" + "=" * 70)
    print("演示 3：模型量化（FP32 -> INT8）")
    print("=" * 70)
    quantized = QuantizedLogisticRegression(model)
    print(f"  原始 FP32 权重: {[round(w, 6) for w in model.w]}")
    print(f"  量化 INT8 权重: {quantized.w_int8}")
    print(f"  反量化权重: {[round(w, 6) for w in quantized._dequantize_w()]}")
    print(f"  量化 scale: {quantized.scale:.6f}")
    print(f"  FP32 模型大小: {quantized.fp_memory_size()} 字节")
    print(f"  INT8 模型大小: {quantized.memory_size()} 字节")
    print(f"  压缩比: {quantized.fp_memory_size() / quantized.memory_size():.1f}x")
    # 准确率对比
    acc_fp = accuracy(yte, model.predict(Xte))
    acc_int8 = accuracy(yte, quantized.predict(Xte))
    print(f"  FP32 准确率: {acc_fp:.4f}")
    print(f"  INT8 准确率: {acc_int8:.4f}")
    print(f"  准确率损失: {acc_fp - acc_int8:.4f}")

    # 演示 4：量化模型推理性能对比
    print("\\n" + "=" * 70)
    print("演示 4：量化模型推理性能对比")
    print("=" * 70)
    # 测量推理时间
    n_runs = 100
    start = time.time()
    for _ in range(n_runs):
        model.predict(Xte[:100])
    fp_time = time.time() - start

    start = time.time()
    for _ in range(n_runs):
        quantized.predict(Xte[:100])
    int8_time = time.time() - start

    print(f"  FP32 模型 {n_runs} 次推理: {fp_time*1000:.2f} ms")
    print(f"  INT8 模型 {n_runs} 次推理: {int8_time*1000:.2f} ms")
    print(f"  推理加速比: {fp_time/int8_time:.2f}x")

    # 演示 5：A/B 测试
    print("\\n" + "=" * 70)
    print("演示 5：A/B 测试框架")
    print("=" * 70)
    # 训练两个不同超参的模型
    model_a = LogisticRegression(lr=0.01, n_iter=100).fit(Xtr, ytr)
    model_b = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr, ytr)
    print(f"  模型 A: lr=0.01, n_iter=100 (简单)")
    print(f"  模型 B: lr=0.1, n_iter=300 (复杂)")

    ab = ABTest(model_a, model_b, name_a="A-简单", name_b="B-复杂")
    # 模拟 200 个用户请求
    random.seed(7)
    for user_id in range(200):
        features = random.choice(Xte)
        ab.route_and_predict(user_id, features)

    summary = ab.summary()
    print(f"\\n  A 组: {summary['group_a']['samples']} 样本, 正样本率 {summary['group_a']['positive_rate']}")
    print(f"  B 组: {summary['group_b']['samples']} 样本, 正样本率 {summary['group_b']['positive_rate']}")
    print(f"  差异: {summary['diff']:+.4f}")

    # 演示 6：部署清单
    print("\\n" + "=" * 70)
    print("演示 6：部署检查清单")
    print("=" * 70)
    checklist = [
        ("模型已序列化保存", True),
        ("加载后通过健全性测试", True),
        ("输入特征 schema 已定义", True),
        ("输出格式已规范化", True),
        ("延迟 P99 < 200ms", True),
        ("Docker 镜像已构建", True),
        ("健康检查端点已实现", True),
        ("监控指标已埋点", True),
        ("A/B 测试框架已就绪", True),
        ("回滚机制已就位", True),
    ]
    for item, ok in checklist:
        print(f"  {'✅' if ok else '❌'} {item}")
    print(f"\\n  部署就绪: {'是' if all(ok for _, ok in checklist) else '否'}")

    print("\\n" + "=" * 70)
    print("✅ AI 模型部署实战演示完成！")
    print("=" * 70)


if __name__ == "__main__":
    main()
`,
  },

  // =============================================================
  // 第5章：AI伦理与未来展望
  // =============================================================
  {
    id: "aipy-ethics",
    icon: "🤝",
    group: "AI项目实战",
    title: "AI伦理与未来展望",
    content: `
# AI伦理与未来展望

## 引言：技术不是中立的

人工智能正在以前所未有的速度渗透到社会的每个角落：决定谁能拿到贷款、谁能进入面试、谁会被监禁保释、谁会看到什么新闻。这些决定直接影响个人命运与社会公平。AI 不是中立的工具——它继承了训练数据中的偏见，放大了设计者的价值观，也可能产生意料之外的社会后果。

本章从三个维度展开：**AI 伦理**（偏见、公平、可解释、隐私）、**AI 未来**（AGI、大模型、技术趋势）、**职业发展**（如何在 AI 时代找到自己的位置）。这些内容没有标准答案，但每个从业者都应当思考。

## 一、AI 偏见与公平性

### 1.1 偏见的来源

AI 系统的偏见可能来自多个环节：

**数据偏见**：

- 历史数据反映了历史的不平等（如招聘数据中男性偏多）
- 采样不均（人脸数据集中白人占比过高）
- 标注者偏见（标注者主观判断带入数据）

**算法偏见**：

- 优化目标单一（只追求准确率，忽视子群体表现）
- 特征选择不当（用邮编作为信用特征，间接歧视少数族裔）
- 模型容量不足（在小群体上欠拟合）

**部署偏见**：

- 反馈循环（推荐系统放大已有偏好）
- 部署场景与训练场景不一致

### 1.2 经典案例

**COMPAS 案**：美国法院用 COMPAS 系统评估罪犯再犯风险，ProPublica 调查发现系统对黑人误报高再犯率的比例是白人的 2 倍。这引发了"什么是公平"的深度讨论——是预测准确率公平，还是误报率公平？两者常常无法同时满足。

**亚马逊招聘工具**：亚马逊曾开发自动筛选简历的 AI，结果发现系统歧视女性——因为训练数据来自过去 10 年的简历，男性占多数，模型学到了"男性简历优先"。最终项目被废弃。

**图像生成偏见**：早期的 Stable Diffusion 把"CEO"生成白人男性、"护士"生成女性，放大了性别刻板印象。

### 1.3 公平性度量

不同的公平性定义可能冲突，常见的有：

- **统计均等（Demographic Parity）**：不同群体的正预测率相同
- **机会均等（Equal Opportunity）**：不同群体的真阳性率相同
- **预测均等（Predictive Parity）**：不同群体的精确率相同
- **校准（Calibration）**：不同群体相同预测分数下的实际概率相同

数学上已证明：当不同群体的实际分布不同时，这些定义无法同时满足。所以"公平"需要结合业务场景选择。

### 1.4 减少偏见的方法

- **数据层面**：均衡采样、合成少数群体数据、去除敏感特征（注意代理特征）
- **训练层面**：在损失函数中加入公平性约束、对抗去偏
- **后处理层面**：对不同群体设置不同阈值
- **评估层面**：分群体报告指标，关注最差群体

## 二、可解释性

### 2.1 为什么需要可解释

- **合规要求**：GDPR 赋予用户"获得解释的权利"
- **信任建立**：医生不会信任黑盒模型的诊断
- **调试需要**：模型预测错时需要知道为什么
- **安全审查**：高 stakes 场景必须可审计

### 2.2 可解释性方法

**全局解释**：

- 线性模型的权重
- 决策树的规则路径
- 特征重要性（如随机森林的 Gini 重要性）

**局部解释**：

- **LIME**：在预测点附近用简单模型近似
- **SHAP**：基于博弈论的 Shapley 值，分配每个特征的贡献
- **集成梯度**：沿输入到基准的路径积分梯度

**可视化**：

- 注意力可视化（Attention Map）
- 显著图（Saliency Map）
- 部分依赖图（PDP）
- 个体条件期望（ICE）

### 2.3 可解释性 vs 性能

经典权衡：可解释模型（决策树、线性回归）通常性能略低，黑盒模型（深度学习、GBDT）性能高但难解释。但 SHAP 等方法让黑盒模型也能事后解释，缩小了这一差距。

## 三、隐私保护

### 3.1 AI 中的隐私风险

**训练数据泄露**：

- 模型可能"记住"训练数据中的具体样本
- 成员推断攻击：判断某样本是否在训练集中
- 模型反演：从模型输出反推输入特征

**生成模型风险**：

- 大语言模型可能输出训练数据中的私人信息
- 扩散模型可能生成真实人物的照片

**联邦学习的隐患**：

- 梯度信息可能泄露原始数据

### 3.2 隐私保护技术

**差分隐私（Differential Privacy）**：

- 在训练过程中注入噪声，使单个样本的影响可控
- 数学上保证：单个样本是否在训练集中，模型分布几乎不变
- 代价：精度下降

**联邦学习（Federated Learning）**：

- 数据不出端，只上传模型更新
- 适合移动端、医疗等敏感场景
- 仍需配合差分隐私防止梯度泄露

**同态加密（Homomorphic Encryption）**：

- 在加密数据上直接计算
- 完全保护隐私但计算开销大
- 适合极敏感场景（医疗、金融）

**安全多方计算（MPC）**：

- 多方协作计算，互不泄露各自数据
- 适合跨机构联合建模

### 3.3 合规框架

- **GDPR**：欧盟通用数据保护条例，赋予"被遗忘权"、"解释权"
- **CCPA**：加州消费者隐私法
- **PIPL**：中国个人信息保护法
- **AI Act**：欧盟 AI 法案，按风险分级管理 AI 应用

## 四、AI 安全

### 4.1 对抗攻击

在输入中加入人眼不可见的扰动，让模型预测错误：

- 图像分类：熊猫 + 噪声 → 误判为长臂猿
- 自动驾驶：交通标志贴贴纸 → 误识别
- 人脸识别：特殊眼镜 → 冒充他人

防御方法：对抗训练、输入平滑、检测后拒绝。

### 4.2 数据投毒

攻击者在训练数据中注入恶意样本，让模型学到错误模式。防御：数据清洗、鲁棒训练、来源审计。

### 4.3 模型窃取

通过大量查询 API 重建模型。防御：限制查询频率、添加噪声、监测异常查询模式。

## 五、AGI 展望

### 5.1 什么是 AGI

AGI（Artificial General Intelligence）指能在广泛任务上达到或超越人类水平的 AI。当前的大语言模型（GPT-4、Claude、Gemini）展现出一定的通用能力，但距离真正的 AGI 还有距离。

### 5.2 AGI 的能力维度

- **推理**：跨领域迁移、抽象思考
- **学习**：少量样本快速学习新任务
- **规划**：长期目标分解与执行
- **创造**：生成真正新颖的想法
- **具身**：与物理世界交互
- **情感**：理解与共情

### 5.3 AGI 的时间表

业界分歧巨大：

- 乐观派（OpenAI、DeepMind）：5-15 年
- 中性派：30-50 年
- 悲观派：可能永远不会以纯软件形式实现

### 5.4 AGI 的风险

- **价值对齐**：如何让 AGI 的目标与人类一致
- **权力集中**：先达到 AGI 的组织可能主导世界
- **失业冲击**：大量白领工作被替代
- **存在性风险**：失控的 AGI 可能威胁人类生存

OpenAI、Anthropic 等公司把"对齐研究"作为核心使命，但目前的对齐技术（RLHF、Constitutional AI）远未成熟。

### 5.5 AI 发展趋势

**短期内（1-3 年）**：

- 多模态大模型成为标配
- Agent（智能体）应用爆发
- AI 编程助手普及
- 端侧大模型成熟

**中期（3-10 年）**：

- 具身智能（机器人 + 大模型）
- AI for Science 加速科研
- 个性化 AI 助手普及
- AI 监管框架成熟

**长期（10+ 年）**：

- AGI 可能实现
- 人机融合（脑机接口）
- 科学发现主要由 AI 完成
- 社会结构深度变革

## 六、AI 时代的职业发展

### 6.1 受冲击的岗位

- **重复性脑力劳动**：数据录入、基础翻译、初级客服
- **模板化内容创作**：基础文案、SEO 文章、简单插画
- **初级编程**：CRUD 开发、简单脚本
- **常规分析**：基础报表、数据清洗

### 6.2 不易被替代的能力

- **复杂决策**：涉及多方利益权衡的战略判断
- **人际信任**：心理咨询、销售、领导力
- **创造力**：真正的创新与跨界融合
- **物理交互**：维修、护理、手工技艺
- **价值观判断**：伦理、艺术、哲学

### 6.3 AI 时代的新机会

**技术侧**：

- AI 工程师：把模型变成产品
- 提示工程师：与 LLM 高效协作
- AI 训练师：微调与对齐模型
- 数据策展人：构建高质量数据集

**应用侧**：

- AI + 行业专家：懂 AI 又懂垂直领域
- AI 产品经理：设计符合用户心智的 AI 产品
- AI 伦理顾问：帮助企业合规
- AI 教育者：普及 AI 素养

### 6.4 给从业者的建议

1. **学会用 AI 工具**：把 AI 当成"放大器"，而非威胁
2. **深耕垂直领域**：通用知识会被 AI 掌握，深度经验不会
3. **培养元能力**：学习如何学习、如何思考、如何沟通
4. **关注伦理与社会影响**：技术决策也是社会决策
5. **保持终身学习**：AI 让知识半衰期变短

## 七、构建负责任的 AI

### 7.1 负责任 AI 原则

主流框架（如微软 RAI、谷歌 AI Principles）共识：

- **公平**：避免偏见与歧视
- **可靠与安全**：在异常情况下仍表现合理
- **隐私与安全**：保护用户数据
- **包容**：服务于所有人
- **透明**：可解释、可审计
- **问责**：明确责任主体

### 7.2 实施框架

- **评估**：上线前进行偏见、安全、隐私评估
- **缓解**：针对发现的问题进行修复
- **监控**：上线后持续监控指标
- **治理**：建立审查委员会与流程

### 7.3 工程实践

- 建立模型卡片（Model Card）记录用途与限制
- 建立数据卡片（Datasheet）记录数据来源与质量
- 实施 Red Team 测试寻找漏洞
- 定期审计已上线模型

## 本章小结

本章从伦理、未来、职业三个维度展开：

- **偏见与公平**：AI 不是中立的，需要主动识别与缓解偏见
- **可解释性**：高 stakes 场景必须可解释，SHAP/LIME 是实用工具
- **隐私保护**：差分隐私、联邦学习、同态加密各有适用场景
- **AI 安全**：对抗攻击、数据投毒、模型窃取是新型威胁
- **AGI 展望**：技术进步加速，但价值对齐仍是核心难题
- **职业发展**：与 AI 协作、深耕垂直、培养元能力是制胜之道
- **负责任 AI**：公平、可靠、隐私、透明、问责是底线

AI 技术的力量越来越大，从业者的责任也越来越重。希望你在追求技术卓越的同时，也思考技术的社会影响——这才是真正的"高级 AI 工程师"。
`,
    code: `
# =============================================================
# 第5章代码：AI 伦理与公平性演示（纯标准库实现）
# =============================================================
# 本代码用纯 Python 演示：
# 1. 数据偏见的检测
# 2. 公平性指标计算（统计均等、机会均等）
# 3. 模型可解释性（特征重要性、SHAP 简化版）
# 4. 差分隐私模拟（在梯度中加噪声）
# 5. 对抗样本生成演示

import random
import math
from collections import defaultdict


# =============================================================
# 逻辑回归模型
# =============================================================
class LogisticRegression:
    def __init__(self, lr=0.1, n_iter=300):
        self.lr = lr
        self.n_iter = n_iter
        self.w = None
        self.b = 0.0

    @staticmethod
    def _sigmoid(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        for _ in range(self.n_iter):
            gw = [0.0] * d
            gb = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = self._sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    gw[j] += err * X[i][j]
                gb += err
            for j in range(d):
                self.w[j] -= self.lr * gw[j] / n
            self.b -= self.lr * gb / n
        return self

    def predict_proba(self, X):
        return [self._sigmoid(sum(self.w[j] * x[j] for j in range(len(x))) + self.b) for x in X]

    def predict(self, X, thr=0.5):
        return [1 if p >= thr else 0 for p in self.predict_proba(X)]


# =============================================================
# 生成带偏见的数据
# =============================================================
def generate_biased_data(n=1000, seed=42):
    """
    模拟招聘场景：
    特征: [技术分数, 经验年数, 性别(0=女, 1=男)]
    标签: 是否录用
    数据中存在性别偏见：男性录用率高于女性
    """
    random.seed(seed)
    X, y, sensitive = [], [], []
    for _ in range(n):
        gender = random.choice([0, 1])
        tech_score = random.gauss(70, 15)
        experience = random.gauss(5, 3)
        if experience < 0: experience = 0
        # 标准化
        tech_n = (tech_score - 70) / 15
        exp_n = (experience - 5) / 3
        X.append([tech_n, exp_n, gender])
        # 录用规则：技术 + 经验决定，但男性有额外加分（偏见！）
        base_score = 0.5 * tech_n + 0.4 * exp_n
        if gender == 1:
            base_score += 0.3  # 性别偏见
        prob = 1 / (1 + math.exp(-base_score))
        label = 1 if random.random() < prob else 0
        y.append(label)
        sensitive.append(gender)
    return X, y, sensitive


# =============================================================
# 公平性指标
# =============================================================
def demographic_parity(y_pred, sensitive):
    """统计均等：不同群体的正预测率"""
    groups = defaultdict(list)
    for pred, g in zip(y_pred, sensitive):
        groups[g].append(pred)
    rates = {}
    for g, preds in groups.items():
        rates[g] = sum(preds) / len(preds)
    return rates


def equal_opportunity(y_true, y_pred, sensitive):
    """机会均等：不同群体在真实正样本中的真阳性率"""
    groups = defaultdict(lambda: {"tp": 0, "p": 0})
    for t, p, g in zip(y_true, y_pred, sensitive):
        if t == 1:
            groups[g]["p"] += 1
            if p == 1:
                groups[g]["tp"] += 1
    rates = {}
    for g, counts in groups.items():
        rates[g] = counts["tp"] / counts["p"] if counts["p"] > 0 else 0
    return rates


def predictive_parity(y_true, y_pred, sensitive):
    """预测均等：不同群体在预测正样本中的精确率"""
    groups = defaultdict(lambda: {"tp": 0, "pp": 0})
    for t, p, g in zip(y_true, y_pred, sensitive):
        if p == 1:
            groups[g]["pp"] += 1
            if t == 1:
                groups[g]["tp"] += 1
    rates = {}
    for g, counts in groups.items():
        rates[g] = counts["tp"] / counts["pp"] if counts["pp"] > 0 else 0
    return rates


def fairness_report(y_true, y_pred, sensitive):
    """生成完整公平性报告"""
    dp = demographic_parity(y_pred, sensitive)
    eo = equal_opportunity(y_true, y_pred, sensitive)
    pp = predictive_parity(y_true, y_pred, sensitive)
    print("  公平性指标:")
    print(f"    统计均等 (正预测率): {dp}")
    print(f"    机会均等 (TPR): {eo}")
    print(f"    预测均等 (PPV): {pp}")
    # 计算差异
    dp_diff = max(dp.values()) - min(dp.values())
    eo_diff = max(eo.values()) - min(eo.values())
    print(f"    统计均等差异: {dp_diff:.4f} (越小越公平)")
    print(f"    机会均等差异: {eo_diff:.4f} (越小越公平)")
    return {"dp": dp, "eo": eo, "pp": pp, "dp_diff": dp_diff, "eo_diff": eo_diff}


# =============================================================
# 模型可解释性：特征重要性 + 简化版 SHAP
# =============================================================
def feature_importance(model, feature_names):
    """用权重绝对值作为特征重要性"""
    importances = [(name, abs(w)) for name, w in zip(feature_names, model.w)]
    importances.sort(key=lambda x: -x[1])
    print("  特征重要性 (按 |权重| 排序):")
    for name, imp in importances:
        print(f"    {name}: {imp:.4f} (权重 {model.w[feature_names.index(name)]:+.4f})")
    return importances


def simple_shap(model, x, baseline, feature_names):
    """
    简化版 SHAP：用扰动法估计每个特征对预测的贡献
    真正的 SHAP 基于 Shapley 值，这里用近似
    """
    def predict(x):
        return sum(model.w[j] * x[j] for j in range(len(x))) + model.b

    base_pred = predict(baseline)
    actual_pred = predict(x)
    contributions = {}
    for j in range(len(x)):
        # 把第 j 个特征从 baseline 改为 x[j]，看预测变化
        perturbed = list(baseline)
        perturbed[j] = x[j]
        contributions[feature_names[j]] = predict(perturbed) - base_pred
    print(f"  样本: {dict(zip(feature_names, [round(v, 3) for v in x]))}")
    print(f"  基准预测: {base_pred:.4f}, 实际预测: {actual_pred:.4f}")
    print(f"  各特征贡献:")
    for name, contrib in sorted(contributions.items(), key=lambda x: -abs(x[1])):
        print(f"    {name}: {contrib:+.4f}")
    return contributions


# =============================================================
# 差分隐私训练
# =============================================================
class DPSGDLogisticRegression(LogisticRegression):
    """带差分隐私噪声的逻辑回归"""
    def __init__(self, lr=0.1, n_iter=300, noise_scale=0.1):
        super().__init__(lr, n_iter)
        self.noise_scale = noise_scale

    def fit(self, X, y):
        n, d = len(X), len(X[0])
        self.w = [0.0] * d
        self.b = 0.0
        for _ in range(self.n_iter):
            gw = [0.0] * d
            gb = 0.0
            for i in range(n):
                z = sum(self.w[j] * X[i][j] for j in range(d)) + self.b
                p = self._sigmoid(z)
                err = p - y[i]
                for j in range(d):
                    gw[j] += err * X[i][j]
                gb += err
            # 加入高斯噪声（差分隐私）
            for j in range(d):
                noise = random.gauss(0, self.noise_scale)
                gw[j] = gw[j] / n + noise
                self.w[j] -= self.lr * gw[j]
            self.b -= self.lr * (gb / n + random.gauss(0, self.noise_scale))
        return self


# =============================================================
# 对抗样本生成（简化版 FGSM）
# =============================================================
def fgsm_attack(model, x, y_true, epsilon=0.1):
    """
    FGSM (Fast Gradient Sign Method) 对抗攻击
    在输入上加上梯度的符号方向 * epsilon
    """
    # 计算对输入的梯度
    z = sum(model.w[j] * x[j] for j in range(len(x))) + model.b
    p = model._sigmoid(z)
    # dL/dx = (p - y) * w
    grad = [(p - y_true) * model.w[j] for j in range(len(x))]
    # 取符号
    sign = [1 if g > 0 else (-1 if g < 0 else 0) for g in grad]
    # 生成对抗样本
    x_adv = [x[j] + epsilon * sign[j] for j in range(len(x))]
    return x_adv


# =============================================================
# 评估
# =============================================================
def accuracy(y_true, y_pred):
    return sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true)


def train_test_split(X, y, sensitive, test_size=0.3, seed=42):
    random.seed(seed)
    idx = list(range(len(X)))
    random.shuffle(idx)
    split = int(len(X) * (1 - test_size))
    tr, te = idx[:split], idx[split:]
    return (
        [X[i] for i in tr], [X[i] for i in te],
        [y[i] for i in tr], [y[i] for i in te],
        [sensitive[i] for i in tr], [sensitive[i] for i in te],
    )


# =============================================================
# 主程序
# =============================================================
def main():
    print("=" * 70)
    print("AI 伦理与公平性演示")
    print("=" * 70)

    # 生成带偏见的数据
    X, y, sensitive = generate_biased_data(n=1000)
    print(f"\\n数据集: {len(X)} 条样本")
    print(f"特征: [技术分数, 经验年数, 性别(0=女, 1=男)]")

    # 数据偏见分析
    print("\\n" + "=" * 70)
    print("演示 1：数据偏见检测")
    print("=" * 70)
    female_pos = sum(1 for i in range(len(y)) if sensitive[i] == 0 and y[i] == 1)
    male_pos = sum(1 for i in range(len(y)) if sensitive[i] == 1 and y[i] == 1)
    female_n = sum(1 for s in sensitive if s == 0)
    male_n = sum(1 for s in sensitive if s == 1)
    print(f"  女性录用率: {female_pos}/{female_n} = {female_pos/female_n:.4f}")
    print(f"  男性录用率: {male_pos}/{male_n} = {male_pos/male_n:.4f}")
    print(f"  录用率差异: {male_pos/male_n - female_pos/female_n:+.4f} (反映数据偏见)")

    # 训练模型并评估公平性
    print("\\n" + "=" * 70)
    print("演示 2：模型公平性评估")
    print("=" * 70)
    Xtr, Xte, ytr, yte, str_, ste = train_test_split(X, y, sensitive)
    model = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr, ytr)
    y_pred = model.predict(Xte)
    print(f"  整体准确率: {accuracy(yte, y_pred):.4f}")
    fairness_report(yte, y_pred, ste)

    # 演示 3：去除敏感特征重新训练
    print("\\n" + "=" * 70)
    print("演示 3：去除敏感特征后重新训练")
    print("=" * 70)
    Xtr_no_gender = [[x[0], x[1]] for x in Xtr]
    Xte_no_gender = [[x[0], x[1]] for x in Xte]
    model_fair = LogisticRegression(lr=0.1, n_iter=300).fit(Xtr_no_gender, ytr)
    y_pred_fair = model_fair.predict(Xte_no_gender)
    print(f"  整体准确率: {accuracy(yte, y_pred_fair):.4f}")
    fairness_report(yte, y_pred_fair, ste)
    print("  解读: 去除性别特征后公平性改善，但未必完全消除（代理特征）")

    # 演示 4：模型可解释性
    print("\\n" + "=" * 70)
    print("演示 4：模型可解释性")
    print("=" * 70)
    feature_names = ["技术分数", "经验年数", "性别"]
    feature_importance(model, feature_names)
    # SHAP 解释单一样本
    print("\\n  -- SHAP 局部解释 --")
    sample = Xte[0]
    baseline = [0.0, 0.0, 0.0]
    simple_shap(model, sample, baseline, feature_names)

    # 演示 5：差分隐私训练
    print("\\n" + "=" * 70)
    print("演示 5：差分隐私训练")
    print("=" * 70)
    print("  在梯度中加入高斯噪声，保护训练数据隐私")
    dp_model = DPSGDLogisticRegression(lr=0.1, n_iter=300, noise_scale=0.05).fit(Xtr, ytr)
    dp_pred = dp_model.predict(Xte)
    print(f"  原始模型准确率: {accuracy(yte, y_pred):.4f}")
    print(f"  DP 模型准确率: {accuracy(yte, dp_pred):.4f}")
    print(f"  原始权重: {[round(w, 4) for w in model.w]}")
    print(f"  DP 权重: {[round(w, 4) for w in dp_model.w]}")
    print("  解读: 隐私保护以精度下降为代价")

    # 演示 6：对抗样本
    print("\\n" + "=" * 70)
    print("演示 6：对抗样本攻击（FGSM）")
    print("=" * 70)
    # 选一个原本预测为 0 的样本
    for i in range(len(Xte)):
        if yte[i] == 0 and y_pred[i] == 0:
            target = i
            break
    x_orig = Xte[target]
    print(f"  原始样本: {[round(v, 3) for v in x_orig]}")
    print(f"  原始预测: {model.predict([x_orig])[0]} (置信度 {model.predict_proba([x_orig])[0]:.4f})")
    # 生成对抗样本
    for eps in [0.05, 0.1, 0.2, 0.5]:
        x_adv = fgsm_attack(model, x_orig, yte[target], epsilon=eps)
        pred_adv = model.predict([x_adv])[0]
        proba_adv = model.predict_proba([x_adv])[0]
        diff = max(abs(a - b) for a, b in zip(x_orig, x_adv))
        print(f"  epsilon={eps}: 扰动幅度 {diff:.3f}, 预测 {pred_adv} (置信度 {proba_adv:.4f})")
    print("  解读: 极小的扰动可能让模型预测翻转，揭示模型的脆弱性")

    # 演示 7：负责任 AI 检查清单
    print("\\n" + "=" * 70)
    print("演示 7：负责任 AI 检查清单")
    print("=" * 70)
    checklist = [
        ("是否评估了不同群体的公平性？", True),
        ("是否提供了模型可解释性？", True),
        ("是否保护了用户隐私？", True),
        ("是否进行了对抗样本测试？", True),
        ("是否有数据卡片与模型卡片？", False),
        ("是否建立了监控与回滚机制？", True),
        ("是否有伦理审查流程？", False),
        ("是否记录了模型限制？", True),
    ]
    print("  负责任 AI 检查项:")
    for item, ok in checklist:
        status = "✅" if ok else "⚠️"
        print(f"    {status} {item}")
    passed = sum(1 for _, ok in checklist if ok)
    print(f"\\n  通过: {passed}/{len(checklist)}")

    print("\\n" + "=" * 70)
    print("✅ AI 伦理与公平性演示完成！")
    print("=" * 70)


if __name__ == "__main__":
    main()
`,
  },
];

