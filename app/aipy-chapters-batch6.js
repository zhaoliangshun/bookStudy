// =============================================================
// Python 人工智能开发教程 —— 第六批章节（深度学习入门组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "aipy-dl-intro",
    icon: "🧠",
    group: "深度学习入门",
    title: "深度学习基础概念",
    content: `
# 深度学习基础概念

## 一、什么是深度学习

深度学习（Deep Learning）是机器学习的一个重要分支，它基于人工神经网络（Artificial Neural Network）构建多层次的模型，通过层层叠加的非线性变换，从原始数据中自动学习层次化的特征表示。"深度"一词指的是模型包含多个隐藏层（Hidden Layer），与传统浅层机器学习方法（如逻辑回归、SVM）相比，深度学习能够自动完成特征工程，大幅减少了对人工特征设计的依赖。

深度学习的核心思想可以概括为以下几点：

1. **层次化特征学习**：底层网络学习简单的局部特征（如边缘、纹理），高层网络逐步组合这些特征形成更抽象的语义概念（如物体部件、整体物体）。这种从低级到高级的特征层次结构，模拟了人类视觉皮层的信息处理机制。

2. **端到端学习**：传统机器学习通常将特征提取和分类器训练分为两个独立步骤，而深度学习将整个流程统一为一个可优化的目标函数，从原始输入直接到最终输出，所有参数通过反向传播联合优化。

3. **非线性变换**：通过激活函数引入非线性，神经网络可以逼近任意复杂的函数映射关系。Universal Approximation Theorem（万能逼近定理）证明，只要隐藏层神经元足够多，带有一个隐藏层的前馈神经网络就能以任意精度逼近任何连续函数。

4. **梯度下降优化**：深度学习使用梯度下降及其变种（SGD、Adam等）来最小化损失函数，通过链式法则（反向传播）高效计算梯度。

## 二、生物神经元与人工神经元

### 2.1 生物神经元

人脑大约包含 860 亿个神经元（Neuron），每个神经元通过多达数千个突触（Synapse）与其他神经元相连，形成极其复杂的神经网络。生物神经元的基本结构包括：

- **树突（Dendrite）**：接收来自其他神经元的输入信号，相当于输入通道。
- **细胞体（Soma/Cell Body）**：对输入信号进行整合处理，当累积的电位超过阈值时，神经元被"激活"。
- **轴突（Axon）**：将神经元产生的输出信号（动作电位）传递给下游神经元，相当于输出通道。
- **突触（Synapse）**：神经元之间的连接点，突触强度（连接权重）会随学习过程而改变，这就是"神经可塑性"。

生物神经元的工作机制：当树突接收到的输入信号总和超过某个阈值时，细胞体会产生一个电脉冲（动作电位/尖峰信号），通过轴突传递给下游神经元。这是一种"积分-触发"（Integrate-and-Fire）模型。

### 2.2 人工神经元模型（MP模型）

1943年，心理学家 McCulloch 和数学家 Pitts 提出了第一个人工神经元数学模型，称为 **MP模型**（McCulloch-Pitts Model）。这是所有人工神经网络的基础。

人工神经元的数学描述：

一个神经元接收 n 个输入 x1, x2, ..., xn，每个输入对应一个权重 w1, w2, ..., wn，神经元首先计算输入的加权和（加权求和），然后加上偏置项 b，最后通过激活函数 f 得到输出：

\`\`\`
z = w1*x1 + w2*x2 + ... + wn*xn + b = Σ(wi*xi) + b
a = f(z)
\`\`\`

其中：
- **x** 是输入向量
- **w** 是权重向量，表示每个输入的重要性
- **b** 是偏置项，用于调整激活阈值
- **f** 是激活函数，引入非线性
- **z** 是加权和（线性变换的结果）
- **a** 是神经元的最终输出

与生物神经元的对应关系：
- 输入 x → 树突接收的信号
- 权重 w → 突触强度
- 偏置 b → 激活阈值
- 激活函数 f → 神经元的触发机制
- 输出 a → 轴突传递的信号

## 三、感知机（Perceptron）

### 3.1 感知机模型

1958年，Frank Rosenblatt 提出了感知机（Perceptron），这是第一个可以学习的神经网络模型。感知机是一个二分类器，本质上是人工神经元的最简单形式。

感知机的数学模型：

\`\`\`
f(x) = sign(w · x + b)
\`\`\`

其中 sign 是符号函数，当 w·x+b > 0 时输出 +1，否则输出 -1（或 0）。感知机的目标是找到一个超平面 w·x+b=0，将不同类别的数据分开。

### 3.2 感知机学习规则

感知机采用错误驱动的在线学习算法。对于每个误分类样本，更新规则为：

\`\`\`
w ← w + η * (y - ŷ) * x
b ← b + η * (y - ŷ)
\`\`\`

其中 η 是学习率，y 是真实标签，ŷ 是预测值。当预测正确时 (y - ŷ = 0)，权重不更新；当预测错误时，朝正确方向调整权重。

### 3.3 感知机的局限性

感知机只能解决**线性可分**问题。1969年，Minsky 和 Papert 在《Perceptrons》一书中证明了感知机无法解决 XOR（异或）问题。XOR 问题需要非线性决策边界，单层感知机无法实现。这一发现导致了神经网络研究的第一次低谷（AI寒冬）。

要解决 XOR 问题，需要引入隐藏层，即多层感知机（MLP）。直到 1986 年反向传播算法被广泛认识后，多层神经网络才重新受到重视。

## 四、激活函数

激活函数是神经网络中引入非线性的关键组件。没有激活函数，无论多少层的线性变换叠加，最终仍等价于一个线性变换，网络将无法学习复杂的非线性关系。

### 4.1 Sigmoid 函数

\`\`\`
σ(z) = 1 / (1 + e^(-z))
\`\`\`

Sigmoid 将任意实数压缩到 (0, 1) 区间，输出可以解释为概率。

**优点**：
- 输出范围 (0, 1)，适合二分类输出层
- 函数平滑可导，梯度计算简单：σ'(z) = σ(z)(1 - σ(z))

**缺点**：
- **梯度消失**：当 |z| 很大时，梯度趋近于 0，深层网络中梯度无法有效回传
- 输出非零中心（输出均值不为0），影响收敛速度
- 计算包含指数运算，开销较大

现代深度学习中，Sigmoid 主要用于二分类输出层，一般不用于隐藏层。

### 4.2 ReLU（Rectified Linear Unit）

\`\`\`
ReLU(z) = max(0, z)
\`\`\`

ReLU 是目前深度学习中最常用的激活函数。

**优点**：
- 计算简单快速（只需比较和取最大值）
- 在正区间梯度恒为1，有效缓解梯度消失问题
- 产生稀疏激活（负数输出为0），使网络具有稀疏表示能力
- 收敛速度比 Sigmoid/Tanh 快约 6 倍

**缺点**：
- **Dead ReLU 问题**（神经元死亡）：当输入持续为负时，梯度为0，神经元永远不会被激活
- 输出非零中心
- 不对称（负半轴恒为0）

ReLU 的改进版本包括 Leaky ReLU（负半轴给一个小的斜率）、PReLU（参数化ReLU）、ELU 等。

### 4.3 Tanh（双曲正切函数）

\`\`\`
tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))
\`\`\`

Tanh 将输出压缩到 (-1, 1) 区间，是 Sigmoid 的缩放平移版本：tanh(z) = 2σ(2z) - 1。

**优点**：
- 输出零中心，收敛速度比 Sigmoid 快
- 在原点附近近似线性，梯度较大

**缺点**：
- 仍然存在梯度消失问题（只是程度比 Sigmoid 轻）

Tanh 常用于 RNN/LSTM 的隐藏层和门控机制。

### 4.4 Softmax 函数

Softmax 用于多分类问题的输出层，将一个实数向量转换为概率分布：

\`\`\`
softmax(zi) = e^(zi) / Σ(e^(zj))
\`\`\`

Softmax 的性质：
- 输出之和为1，可解释为各类别的概率
- 放大最大值，抑制小值（"max"的软版本）
- 保持输入的相对大小顺序
- 可微且梯度计算优雅

Softmax 通常与交叉熵损失配合使用，在多分类任务中效果最佳。

### 4.5 激活函数选择指南

| 场景 | 推荐激活函数 |
|------|-------------|
| 隐藏层（通用） | ReLU |
| 隐藏层（RNN） | Tanh |
| 二分类输出层 | Sigmoid |
| 多分类输出层 | Softmax |
| 回归输出层 | 恒等函数（无激活） |

## 五、前向传播

前向传播（Forward Propagation）是神经网络从输入到输出计算预测值的过程。信息从输入层开始，逐层经过加权求和和激活函数，最终到达输出层。

对于一个 L 层的神经网络，前向传播的过程可以表示为：

\`\`\`
第1层: z1 = W1·x + b1,  a1 = f1(z1)
第2层: z2 = W2·a1 + b2, a2 = f2(z2)
...
第L层: zL = WL·a(L-1) + bL, aL = fL(zL)  (输出)
\`\`\`

其中：
- **Wl** 是第 l 层的权重矩阵，形状为 (神经元数, 上一层神经元数)
- **bl** 是第 l 层的偏置向量
- **fl** 是第 l 层的激活函数
- **zl** 是第 l 层的加权和（未激活值）
- **al** 是第 l 层的激活输出

每一层的输出成为下一层的输入，层层传递，最终得到网络的预测输出。前向传播的计算复杂度主要来自矩阵乘法，现代框架（如 TensorFlow、PyTorch）利用 GPU 并行计算大幅加速这一过程。

## 六、深度学习与传统机器学习的对比

| 特性 | 传统机器学习 | 深度学习 |
|------|------------|---------|
| 特征工程 | 人工设计 | 自动学习 |
| 数据需求 | 小到中等 | 大量 |
| 计算资源 | CPU即可 | 通常需GPU |
| 可解释性 | 较强 | 较弱（黑盒） |
| 适用场景 | 结构化数据 | 图像/文本/语音等 |
| 模型复杂度 | 相对简单 | 非常复杂 |

深度学习在大数据和高算力的推动下，在计算机视觉（CNN）、自然语言处理（Transformer）、语音识别等领域取得了突破性进展，成为当前 AI 技术的核心驱动力。

## 七、总结

本章介绍了深度学习的基础概念，包括生物神经元与人工神经元的对应关系、感知机模型及其局限性、常用激活函数的原理与特性、以及前向传播的计算过程。这些概念是理解后续章节（神经网络原理、框架使用、模型训练优化）的基础。深度学习的精髓在于通过多层非线性变换自动学习数据特征，配合反向传播算法和梯度下降优化，使模型能够处理极其复杂的模式识别和预测任务。
`,
    code: `# ============================================================
# 深度学习基础概念 —— 代码演示
# 实现激活函数、感知机、前向传播（纯Python标准库）
# ============================================================

import math
import random

# ----------------------------------------------------------
# 一、激活函数实现
# ----------------------------------------------------------

def sigmoid(z):
    """Sigmoid 激活函数：将输入压缩到 (0, 1) 区间"""
    # 公式：σ(z) = 1 / (1 + e^(-z))
    # 防止数值溢出，对大负数做截断
    if z < -500:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))

def sigmoid_derivative(z):
    """Sigmoid 的导数：σ'(z) = σ(z) * (1 - σ(z))"""
    s = sigmoid(z)
    return s * (1.0 - s)

def relu(z):
    """ReLU 激活函数：max(0, z)"""
    return max(0.0, z)

def relu_derivative(z):
    """ReLU 的导数：z>0 时为1，否则为0"""
    return 1.0 if z > 0 else 0.0

def tanh(z):
    """Tanh 双曲正切函数：输出范围 (-1, 1)"""
    # tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z))
    return math.tanh(z)

def tanh_derivative(z):
    """Tanh 的导数：1 - tanh(z)^2"""
    t = math.tanh(z)
    return 1.0 - t * t

def softmax(logits):
    """Softmax 函数：将向量转换为概率分布（和为1）"""
    # 减去最大值防止数值溢出
    max_val = max(logits)
    exp_vals = [math.exp(x - max_val) for x in logits]
    total = sum(exp_vals)
    return [v / total for v in exp_vals]

print("=" * 60)
print("一、激活函数演示")
print("=" * 60)

# 测试各激活函数
test_values = [-3, -1, 0, 1, 3]
print("\\n输入值:", test_values)
print("\\nSigmoid:")
for v in test_values:
    print(f"  sigmoid({v:>2}) = {sigmoid(v):.6f}, 导数 = {sigmoid_derivative(v):.6f}")

print("\\nReLU:")
for v in test_values:
    print(f"  relu({v:>2}) = {relu(v):.6f}, 导数 = {relu_derivative(v):.6f}")

print("\\nTanh:")
for v in test_values:
    print(f"  tanh({v:>2}) = {tanh(v):.6f}, 导数 = {tanh_derivative(v):.6f}")

print("\\nSoftmax:")
logits_test = [1.0, 2.0, 3.0]
probs = softmax(logits_test)
print(f"  输入 logits: {logits_test}")
print(f"  输出概率:    {[round(p, 6) for p in probs]}")
print(f"  概率之和:    {sum(probs):.6f}")

# ----------------------------------------------------------
# 二、感知机实现（二分类）
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("二、感知机实现（与门 AND）")
print("=" * 60)

class Perceptron:
    """单层感知机，用于二分类任务"""

    def __init__(self, n_inputs, learning_rate=0.1, n_epochs=100):
        self.weights = [0.0] * n_inputs  # 初始化权重为0
        self.bias = 0.0                   # 初始化偏置为0
        self.lr = learning_rate
        self.n_epochs = n_epochs

    def predict(self, inputs):
        """前向计算：加权和 + 阶跃函数"""
        z = sum(w * x for w, x in zip(self.weights, inputs)) + self.bias
        return 1 if z > 0 else 0  # 阶跃激活函数

    def fit(self, X_train, y_train):
        """训练感知机：错误驱动的权重更新"""
        for epoch in range(self.n_epochs):
            errors = 0
            for inputs, label in zip(X_train, y_train):
                prediction = self.predict(inputs)
                error = label - prediction
                if error != 0:
                    # 感知机学习规则
                    for i in range(len(self.weights)):
                        self.weights[i] += self.lr * error * inputs[i]
                    self.bias += self.lr * error
                    errors += 1
            if errors == 0:
                print(f"  Epoch {epoch}: 收敛！权重={self.weights}, 偏置={self.bias}")
                break
            if epoch % 10 == 0:
                print(f"  Epoch {epoch}: 错误数={errors}, 权重={self.weights}, 偏置={self.bias}")

# 训练与门（AND）
X_and = [[0, 0], [0, 1], [1, 0], [1, 1]]
y_and = [0, 0, 0, 1]

print("\\n训练 AND 门:")
perceptron_and = Perceptron(n_inputs=2, learning_rate=0.1, n_epochs=50)
perceptron_and.fit(X_and, y_and)

print("\\nAND 门测试结果:")
for inputs in X_and:
    result = perceptron_and.predict(inputs)
    print(f"  AND{inputs} = {result}")

# 尝试训练 XOR（会失败，感知机无法解决非线性问题）
X_xor = [[0, 0], [0, 1], [1, 0], [1, 1]]
y_xor = [0, 1, 1, 0]

print("\\n训练 XOR 门（感知机无法解决）:")
perceptron_xor = Perceptron(n_inputs=2, learning_rate=0.1, n_epochs=100)
perceptron_xor.fit(X_xor, y_xor)

print("\\nXOR 门测试结果（应为 0,1,1,0）:")
for inputs in X_xor:
    result = perceptron_xor.predict(inputs)
    print(f"  XOR{inputs} = {result}  ← 感知机无法正确分类")

# ----------------------------------------------------------
# 三、前向传播实现（单神经元 → 多层网络）
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("三、前向传播演示")
print("=" * 60)

def single_neuron_forward(inputs, weights, bias, activation):
    """单个神经元的前向传播"""
    # z = w·x + b
    z = sum(w * x for w, x in zip(weights, inputs)) + bias
    # a = f(z)
    a = activation(z)
    return z, a

print("\\n1. 单个神经元前向传播:")
inputs = [0.5, -0.3, 0.8]
weights = [0.2, 0.7, -0.5]
bias = 0.1
z, a = single_neuron_forward(inputs, weights, bias, sigmoid)
print(f"  输入:   {inputs}")
print(f"  权重:   {weights}")
print(f"  偏置:   {bias}")
print(f"  加权和 z = {z:.6f}")
print(f"  Sigmoid输出 a = {a:.6f}")

def forward_pass(network, input_data):
    """
    多层神经网络的前向传播
    network: 网络结构列表，每层包含 weights, bias, activation
    返回每层的 (z, a) 用于后续反向传播
    """
    activations = [input_data]  # 存储每层激活值，第0个是输入
    zs = []                     # 存储每层加权和

    current_input = input_data
    for layer in network:
        W = layer["weights"]
        b = layer["bias"]
        act_fn = layer["activation"]

        # 矩阵乘法：z = W·a_prev + b
        z = []
        for neuron_w, neuron_b in zip(W, b):
            z_i = sum(w * x for w, x in zip(neuron_w, current_input)) + neuron_b
            z.append(z_i)
        zs.append(z)

        # 激活：a = f(z)
        a = [act_fn(zi) for zi in z]
        activations.append(a)
        current_input = a

    return zs, activations

print("\\n2. 多层神经网络前向传播（2-3-1 结构）:")
# 网络：2输入 → 3神经元隐藏层(ReLU) → 1神经元输出层(Sigmoid)
network = [
    {
        "weights": [[0.2, 0.4], [-0.5, 0.1], [0.3, -0.2]],  # 3个神经元，每个2个输入
        "bias": [0.1, -0.2, 0.05],
        "activation": relu
    },
    {
        "weights": [[0.6, -0.3, 0.4]],  # 1个神经元，3个输入
        "bias": [0.2],
        "activation": sigmoid
    }
]

input_data = [0.5, -0.3]
zs, activations = forward_pass(network, input_data)

print(f"  输入层: {[round(v, 4) for v in activations[0]]}")
print(f"  隐藏层 z: {[round(v, 4) for v in zs[0]]}")
print(f"  隐藏层 a (ReLU): {[round(v, 4) for v in activations[1]]}")
print(f"  输出层 z: {[round(v, 4) for v in zs[1]]}")
print(f"  输出层 a (Sigmoid): {[round(v, 6) for v in activations[2]]}")
print(f"  最终预测值: {activations[2][0]:.6f}")

# ----------------------------------------------------------
# 四、多分类 Softmax 输出演示
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("四、多分类 Softmax 输出演示")
print("=" * 60)

# 模拟3分类问题的网络输出
print("\\n模拟3分类网络输出:")
print("  类别: [猫, 狗, 鸟]")

# 原始 logits（网络最后一层的输出）
test_cases = [
    {"logits": [2.0, 0.5, -1.0], "desc": "明显是猫"},
    {"logits": [-1.0, 2.0, 0.5], "desc": "明显是狗"},
    {"logits": [0.3, 0.3, 0.4], "desc": "不确定（接近均匀）"},
]

for case in test_cases:
    probs = softmax(case["logits"])
    labels = ["猫", "狗", "鸟"]
    print(f"\\n  场景: {case['desc']}")
    print(f"  Logits: {case['logits']}")
    print(f"  概率分布:")
    for label, p in zip(labels, probs):
        bar = "█" * int(p * 40)
        print(f"    {label}: {p:.4f} {bar}")
    predicted = labels[probs.index(max(probs))]
    print(f"  预测类别: {predicted} (置信度: {max(probs):.4f})")

print("\\n" + "=" * 60)
print("演示完成！")
print("=" * 60)
`,
  },
  {
    id: "aipy-nn-principle",
    icon: "⚙️",
    group: "深度学习入门",
    title: "神经网络原理详解",
    content: `
# 神经网络原理详解

## 一、多层感知机（MLP）架构

### 1.1 为什么需要多层网络

单层感知机只能解决线性可分问题，但现实世界中的大多数问题是非线性的。经典例子是 XOR（异或）问题：

\`\`\`
XOR 真值表：
(0, 0) → 0
(0, 1) → 1
(1, 0) → 1
(1, 0) → 1
(1, 1) → 0
\`\`\`

在二维平面上，XOR 的四个点无法用一条直线分开。但是，如果我们引入一个隐藏层，网络就可以学习非线性的决策边界。

多层感知机（Multi-Layer Perceptron, MLP）通过在网络中添加一个或多个隐藏层来解决非线性问题。每一层的神经元将上一层的输出作为输入，通过权重连接和激活函数进行非线性变换。

### 1.2 MLP 的结构

一个典型的 MLP 包含三部分：

1. **输入层（Input Layer）**：接收原始特征数据，神经元数量等于特征维度。输入层不做计算，只是将数据传递给下一层。

2. **隐藏层（Hidden Layer）**：位于输入层和输出层之间，可以有一层或多层。每个隐藏层神经元对上一层输出进行加权求和，然后通过激活函数。隐藏层的数量和宽度决定了网络的容量。

3. **输出层（Output Layer）**：产生最终预测结果。输出层的神经元数量和激活函数取决于任务类型：
   - 回归任务：1个神经元，无激活或线性激活
   - 二分类：1个神经元，Sigmoid 激活
   - 多分类：N个神经元（N为类别数），Softmax 激活

### 1.3 全连接层

MLP 中的层通常是全连接层（Fully Connected Layer / Dense Layer），即上一层每个神经元都与下一层每个神经元相连。如果第 l-1 层有 m 个神经元，第 l 层有 n 个神经元，则权重矩阵 W 的形状为 (n, m)，偏置向量 b 的形状为 (n,)。

前向传播的计算（向量化形式）：

\`\`\`
z(l) = W(l) · a(l-1) + b(l)
a(l) = f(z(l))
\`\`\`

## 二、损失函数

损失函数（Loss Function）衡量模型预测值与真实值之间的差距，是模型优化的目标。选择合适的损失函数对训练效果至关重要。

### 2.1 均方误差（MSE）

均方误差是回归任务最常用的损失函数：

\`\`\`
MSE = (1/n) * Σ(yi - ŷi)^2
\`\`\`

其中 yi 是真实值，ŷi 是预测值，n 是样本数。

**特点**：
- 对大误差惩罚更重（平方放大）
- 处处可导，梯度为 ∂MSE/∂ŷ = (2/n)(ŷ - y)
- 对异常值敏感

### 2.2 平均绝对误差（MAE）

\`\`\`
MAE = (1/n) * Σ|yi - ŷi|
\`\`\`

**特点**：
- 对异常值不敏感（鲁棒性更强）
- 在 ŷ=y 处不可导（梯度为 sign(ŷ-y)）

### 2.3 交叉熵损失（Cross-Entropy Loss）

交叉熵是分类任务的标准损失函数，衡量两个概率分布的差异。

**二分类交叉熵（Binary Cross-Entropy）**：

\`\`\`
BCE = -[y * log(ŷ) + (1-y) * log(1-ŷ)]
\`\`\`

其中 y ∈ {0, 1} 是真实标签，ŷ ∈ (0,1) 是预测概率。

**多分类交叉熵（Categorical Cross-Entropy）**：

\`\`\`
CE = -Σ yi * log(ŷi)
\`\`\`

其中 yi 是真实分布（one-hot编码），ŷi 是预测分布（softmax输出）。

**为什么分类用交叉熵而不用 MSE**：
- 交叉熵配合 Sigmoid/Softmax 时，梯度形式简洁，不会出现梯度消失
- MSE 在分类任务中非凸，容易陷入局部最优
- 交叉熵直接衡量概率分布差异，更符合分类问题的本质

### 2.4 损失函数求导

交叉熵 + Softmax 的梯度推导：

设 L = -Σ yi * log(ŷi)，其中 ŷ = softmax(z)，则：

\`\`\`
∂L/∂zj = ŷj - yj
\`\`\`

这个优雅的结果使得梯度计算非常简单高效。

对于二分类交叉熵 + Sigmoid：

\`\`\`
∂L/∂z = ŷ - y
\`\`\`

## 三、梯度下降

### 3.1 梯度下降的基本原理

梯度下降是一种迭代优化算法，通过沿损失函数梯度的反方向更新参数来最小化损失。

参数更新规则：

\`\`\`
θ ← θ - η * ∂L/∂θ
\`\`\`

其中 η 是学习率，∂L/∂θ 是损失对参数的梯度。

直观理解：想象你站在山上，想要到达最低点（谷底）。你看不到全貌，只能感受当前位置的坡度（梯度）。梯度指向上升最快的方向，所以你朝反方向（负梯度）走一步，重复这个过程直到到达谷底。

### 3.2 学习率的影响

学习率 η 是梯度下降最重要的超参数：

- **学习率太大**：步长过大，可能越过最低点来回震荡，甚至发散
- **学习率太小**：收敛速度慢，需要大量迭代
- **理想学习率**：在保证收敛的前提下尽快到达最低点

通常学习率在 0.001 到 0.1 之间，需要通过实验调优。现代优化器（如 Adam）具有自适应学习率功能。

### 3.3 梯度下降的变种

1. **批量梯度下降（Batch GD）**：每次使用全部训练数据计算梯度。优点是稳定，缺点是计算量大、内存占用高。

2. **随机梯度下降（SGD）**：每次只用一个样本计算梯度。优点是更新快、内存占用小，缺点是噪声大、震荡严重。

3. **小批量梯度下降（Mini-batch SGD）**：每次使用一小批样本（如32、64、128个）。结合了上述两者的优点，是深度学习最常用的方式。

\`\`\`
批量大小的影响：
- batch_size = 1:  震荡大，但能跳出局部最优
- batch_size = 全部: 平滑稳定，但容易陷入局部最优
- batch_size = 32~128: 折中方案，常用选择
\`\`\`

## 四、反向传播算法

### 4.1 反向传播的核心思想

反向传播（Backpropagation, BP）是训练神经网络的核心算法。它通过链式法则（Chain Rule）高效计算损失函数对每一层参数的梯度。

反向传播分为两个阶段：
1. **前向传播**：从输入到输出计算预测值，同时保存中间结果
2. **反向传播**：从输出到输入计算梯度，逐层传递误差信号

### 4.2 链式法则回顾

链式法则是微积分中复合函数求导的基本法则。如果 y = f(g(x))，则：

\`\`\`
dy/dx = (dy/dg) * (dg/dx)
\`\`\`

对于多层复合函数，链式法则可以递归应用：

如果 y = f(g(h(x)))，则：

\`\`\`
dy/dx = (dy/dg) * (dg/dh) * (dh/dx)
\`\`\`

### 4.3 反向传播的数学推导

考虑一个 L 层网络，损失函数为 L。我们要计算 ∂L/∂W(l) 和 ∂L/∂b(l)。

**步骤1：计算输出层误差**

定义误差 δ(l) = ∂L/∂z(l)，即损失对第 l 层加权和的梯度。

对于输出层（第 L 层）：

\`\`\`
δ(L) = ∂L/∂z(L) = ∂L/∂a(L) * ∂a(L)/∂z(L) = ∂L/∂a(L) ⊙ f'(z(L))
\`\`\`

其中 ⊙ 表示逐元素乘法。

如果输出层使用 Softmax + 交叉熵，则 δ(L) = ŷ - y（非常简洁）。

**步骤2：反向传播误差**

对于隐藏层 l（从 L-1 到 1）：

\`\`\`
δ(l) = ((W(l+1))^T · δ(l+1)) ⊙ f'(z(l))
\`\`\`

即：当前层的误差 = 下一层误差通过权重转置反向传播，再乘以当前层激活函数的导数。

**步骤3：计算参数梯度**

\`\`\`
∂L/∂W(l) = δ(l) · (a(l-1))^T
∂L/∂b(l) = δ(l)
\`\`\`

**步骤4：更新参数**

\`\`\`
W(l) ← W(l) - η * ∂L/∂W(l)
b(l) ← b(l) - η * ∂L/∂b(l)
\`\`\`

### 4.4 反向传播的计算流程

总结反向传播的完整流程：

\`\`\`
1. 前向传播：
   for l = 1 to L:
       z(l) = W(l) · a(l-1) + b(l)
       a(l) = f(z(l))
   计算损失 L(y, a(L))

2. 计算输出层误差：
   δ(L) = ∂L/∂a(L) ⊙ f'(z(L))

3. 反向传播误差：
   for l = L-1 down to 1:
       δ(l) = (W(l+1))^T · δ(l+1) ⊙ f'(z(l))

4. 计算梯度并更新：
   for l = 1 to L:
       ∂L/∂W(l) = δ(l) · (a(l-1))^T
       ∂L/∂b(l) = δ(l)
       W(l) -= η * ∂L/∂W(l)
       b(l) -= η * ∂L/∂b(l)
\`\`\`

### 4.5 为什么反向传播高效

反向传播的巧妙之处在于：它复用了前向传播的中间结果（z 和 a），避免了重复计算。对于一个 L 层网络，反向传播的时间复杂度与前向传播相同，都是 O(总参数量)。这使得训练深层神经网络成为可能。

如果没有反向传播，对每个参数单独用数值方法（有限差分）求梯度，计算量将是 O(参数量^2)，对于百万级参数的网络完全不可行。

## 五、梯度消失与梯度爆炸

### 5.1 问题现象

在深层网络中，反向传播时梯度需要经过多次矩阵乘法传递到浅层。如果每次乘的值小于1，梯度会指数级衰减（梯度消失）；如果大于1，梯度会指数级增长（梯度爆炸）。

### 5.2 梯度消失的原因

以 Sigmoid 为例，其导数最大值为 0.25（在 z=0 时）。如果一个网络有 10 层，每层都用 Sigmoid，梯度经过 10 次乘以 0.25：

\`\`\`
0.25^10 ≈ 0.0000001
\`\`\`

梯度几乎为零，浅层参数几乎无法更新。

### 5.3 解决方案

1. **使用 ReLU 激活函数**：正区间梯度恒为1，有效缓解梯度消失
2. **残差连接（ResNet）**：通过跳跃连接让梯度可以直接流过
3. **批归一化（Batch Normalization）**：将每层输入归一化，保持梯度稳定
4. **梯度裁剪**：限制梯度大小，防止梯度爆炸
5. **合适的权重初始化**：Xavier/He 初始化使各层方差一致

## 六、权重初始化

### 6.1 为什么不能全零初始化

如果所有权重初始化为相同的值（如0），则同一层所有神经元会计算完全相同的输出，反向传播时也会得到相同的梯度，导致所有神经元永远学习相同的特征（对称性问题）。

### 6.2 Xavier 初始化（Glorot 初始化）

适用于 Sigmoid/Tanh 激活函数：

\`\`\`
W ~ U(-√(6/(n_in+n_out)), √(6/(n_in+n_out)))
\`\`\`

或正态分布：W ~ N(0, 2/(n_in+n_out))

目标：使每层输出的方差与输入方差保持一致。

### 6.3 He 初始化

适用于 ReLU 激活函数：

\`\`\`
W ~ N(0, 2/n_in)
\`\`\`

ReLU 会将一半的输入置零，因此需要更大的方差来补偿。

## 七、总结

本章详细讲解了神经网络的核心原理：多层感知机的结构解决了非线性问题，损失函数定义了优化目标，梯度下降提供了参数更新的方向，反向传播通过链式法则高效计算梯度。理解这些原理对于调试网络、选择超参数、设计新架构都至关重要。下一章将介绍如何使用 TensorFlow/Keras 框架将这些理论付诸实践。
`,
    code: `# ============================================================
# 神经网络原理详解 —— 代码演示
# 实现完整的前向传播 + 反向传播（纯Python标准库）
# ============================================================

import math
import random

# ----------------------------------------------------------
# 激活函数及其导数
# ----------------------------------------------------------

def sigmoid(z):
    if z < -500:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))

def sigmoid_derivative(a):
    """注意：这里传入激活后的值 a，导数 = a*(1-a)"""
    return a * (1.0 - a)

def relu(z):
    return max(0.0, z)

def relu_derivative(z):
    return 1.0 if z > 0 else 0.0

# ----------------------------------------------------------
# 损失函数
# ----------------------------------------------------------

def mse_loss(y_true, y_pred):
    """均方误差"""
    return sum((yt - yp) ** 2 for yt, yp in zip(y_true, y_pred)) / len(y_true)

def mse_loss_derivative(y_true, y_pred):
    """MSE 对预测值的导数：(2/n)(ŷ - y)"""
    n = len(y_true)
    return [(2.0 / n) * (yp - yt) for yt, yp in zip(y_true, y_pred)]

def binary_cross_entropy(y_true, y_pred):
    """二分类交叉熵"""
    loss = 0.0
    for yt, yp in zip(y_true, y_pred):
        # 防止 log(0)
 yp_clipped = max(min(yp, 1 - 1e-15), 1e-15)
        loss += -(yt * math.log(yp_clipped) + (1 - yt) * math.log(1 - yp_clipped))
    return loss / len(y_true)

# ----------------------------------------------------------
# 完整的神经网络实现（前向传播 + 反向传播）
# ----------------------------------------------------------

class NeuralNetwork:
    """
    一个完整的前馈神经网络实现
    支持任意层数和神经元数量
    使用 SGD 进行训练
    """

    def __init__(self, layer_sizes, learning_rate=0.1, seed=42):
        """
        layer_sizes: 各层神经元数量列表，如 [2, 3, 1] 表示 2输入-3隐藏-1输出
        """
        self.layer_sizes = layer_sizes
        self.lr = learning_rate
        self.num_layers = len(layer_sizes) - 1  # 权重层的数量

        # 随机初始化权重和偏置（He/Xavier 初始化思想）
        random.seed(seed)
        self.weights = []
        self.biases = []

        for i in range(self.num_layers):
            n_in = layer_sizes[i]
            n_out = layer_sizes[i + 1]
            # Xavier 初始化：方差 = 1/n_in
            scale = math.sqrt(1.0 / n_in)
            W = [[random.gauss(0, scale) for _ in range(n_in)] for _ in range(n_out)]
            b = [0.0 for _ in range(n_out)]
            self.weights.append(W)
            self.biases.append(b)

        print(f"网络结构: {layer_sizes}")
        print(f"权重层数: {self.num_layers}")
        for i, (W, b) in enumerate(zip(self.weights, self.biases)):
            print(f"  第{i+1}层: {len(W)}个神经元, 每个接收{len(W[0])}个输入")

    def forward(self, x):
        """前向传播，返回 (zs, activations)"""
        activations = [x]  # activations[0] = 输入
        zs = []

        current = x
        for i in range(self.num_layers):
            W = self.weights[i]
            b = self.biases[i]

            # 最后一层用 sigmoid，其他层也用 sigmoid（简化）
            z = []
            for j in range(len(W)):
                z_j = sum(w * a for w, a in zip(W[j], current)) + b[j]
                z.append(z_j)
            zs.append(z)

            a = [sigmoid(zi) for zi in z]
            activations.append(a)
            current = a

        return zs, activations

    def backward(self, x, y_true, zs, activations):
        """反向传播，计算所有层的梯度"""
        # delta[l] = 第l层的误差（损失对z的梯度）
        deltas = [None] * self.num_layers

        # 1. 计算输出层误差
        # MSE + Sigmoid: delta = (ŷ - y) * sigmoid'(z)
        output_a = activations[-1]
        output_z = zs[-1]
        deltas[-1] = []
        for i in range(len(output_a)):
            # dL/da * da/dz = (ŷ - y) * a*(1-a)  （对于MSE）
            # 简化：MSE对a的导数 = (ŷ - y) * (2/n)，这里n=1
            dL_da = (output_a[i] - y_true[i])
            da_dz = sigmoid_derivative(output_a[i])
            deltas[-1].append(dL_da * da_dz)

        # 2. 反向传播到隐藏层
        for l in range(self.num_layers - 2, -1, -1):
            W_next = self.weights[l + 1]
            delta_next = deltas[l + 1]
            a_current = activations[l + 1]

            # delta[l] = (W[l+1]^T · delta[l+1]) ⊙ f'(z[l])
            # 先计算 W^T · delta_next
            n_neurons = len(self.weights[l])
            delta_l = []
            for j in range(n_neurons):
                # 对每个神经元j，累加下一层的贡献
                sum_delta = 0.0
                for k in range(len(W_next)):
                    sum_delta += W_next[k][j] * delta_next[k]
                # 乘以激活函数导数
                da_dz = sigmoid_derivative(a_current[j])
                delta_l.append(sum_delta * da_dz)
            deltas[l] = delta_l

        # 3. 计算参数梯度并更新
        for l in range(self.num_layers):
            a_prev = activations[l]  # 上一层的激活值
            delta_l = deltas[l]

            for j in range(len(self.weights[l])):
                for k in range(len(self.weights[l][j])):
                    # dL/dW = delta * a_prev
                    self.weights[l][j][k] -= self.lr * delta_l[j] * a_prev[k]
                # dL/db = delta
                self.biases[l][j] -= self.lr * delta_l[j]

    def train(self, X_train, y_train, epochs=1000, verbose=True):
        """训练网络"""
        print(f"\\n开始训练，共 {epochs} 个 epoch...")
        for epoch in range(epochs):
            total_loss = 0.0
            for x, y in zip(X_train, y_train):
                # 前向传播
                zs, activations = self.forward(x)
                # 计算损失
                pred = activations[-1]
                total_loss += mse_loss(y, pred)
                # 反向传播 + 参数更新
                self.backward(x, y, zs, activations)

            if verbose and (epoch % 200 == 0 or epoch == epochs - 1):
                avg_loss = total_loss / len(X_train)
                print(f"  Epoch {epoch:4d}: 平均损失 = {avg_loss:.6f}")

    def predict(self, x):
        """预测"""
        _, activations = self.forward(x)
        return activations[-1]

# ----------------------------------------------------------
# 演示1：用神经网络解决 XOR 问题
# ----------------------------------------------------------

print("=" * 60)
print("演示1：神经网络解决 XOR 问题")
print("=" * 60)

# XOR 数据集
X_xor = [[0, 0], [0, 1], [1, 0], [1, 1]]
y_xor = [[0], [1], [1], [0]]

# 创建网络：2-4-1 结构
nn = NeuralNetwork(layer_sizes=[2, 4, 1], learning_rate=1.0)
nn.train(X_xor, y_xor, epochs=2000)

print("\\nXOR 测试结果:")
for x, y in zip(X_xor, y_xor):
    pred = nn.predict(x)
    print(f"  输入{x} → 预测: {pred[0]:.4f}, 真实: {y[0]}, {'✓' if abs(pred[0] - y[0]) < 0.1 else '✗'}")

# ----------------------------------------------------------
# 演示2：简单的回归问题
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("演示2：回归问题（学习 y = 0.5*x1 + 0.3*x2 - 0.1）")
print("=" * 60)

# 生成训练数据
random.seed(10)
X_reg = []
y_reg = []
for _ in range(50):
    x1 = random.uniform(-1, 1)
    x2 = random.uniform(-1, 1)
    y = 0.5 * x1 + 0.3 * x2 - 0.1
    X_reg.append([x1, x2])
    y_reg.append([y])

nn_reg = NeuralNetwork(layer_sizes=[2, 5, 1], learning_rate=0.1)
nn_reg.train(X_reg, y_reg, epochs=500, verbose=True)

# 测试
print("\\n回归测试结果:")
test_cases = [[0.5, 0.5], [-0.3, 0.7], [0.8, -0.2]]
for x in test_cases:
    pred = nn_reg.predict(x)
    true_val = 0.5 * x[0] + 0.3 * x[1] - 0.1
    print(f"  输入{x} → 预测: {pred[0]:.4f}, 真实: {true_val:.4f}, 误差: {abs(pred[0]-true_val):.4f}")

# ----------------------------------------------------------
# 演示3：损失函数对比
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("演示3：损失函数对比")
print("=" * 60)

# 模拟预测值和真实值
y_true_cls = [1, 0, 1, 0, 1]
y_pred_good = [0.9, 0.1, 0.8, 0.2, 0.7]  # 好的预测
y_pred_bad  = [0.4, 0.6, 0.3, 0.7, 0.2]  # 差的预测

print("\\n分类任务损失对比:")
print(f"  真实标签:   {y_true_cls}")
print(f"  好的预测:   {y_pred_good}")
print(f"  差的预测:   {y_pred_bad}")
print(f"  BCE(好预测) = {binary_cross_entropy(y_true_cls, y_pred_good):.6f}")
print(f"  BCE(差预测) = {binary_cross_entropy(y_true_cls, y_pred_bad):.6f}")

# 回归损失
y_true_reg = [1.0, 2.0, 3.0, 4.0]
y_pred_reg1 = [1.1, 1.9, 3.2, 3.8]  # 小误差
y_pred_reg2 = [0.5, 3.0, 2.0, 5.5]  # 大误差

print("\\n回归任务损失对比:")
print(f"  真实值:     {y_true_reg}")
print(f"  小误差预测: {y_pred_reg1} → MSE={mse_loss(y_true_reg, y_pred_reg1):.4f}")
print(f"  大误差预测: {y_pred_reg2} → MSE={mse_loss(y_true_reg, y_pred_reg2):.4f}")

print("\\n" + "=" * 60)
print("演示完成！")
print("=" * 60)
`,
  },
  {
    id: "aipy-tensorflow",
    icon: "📊",
    group: "深度学习入门",
    title: "TensorFlow与Keras入门",
    content: `
# TensorFlow与Keras入门

## 一、TensorFlow 概述

TensorFlow 是 Google 开发的开源深度学习框架，于 2015 年正式发布。它以"计算图"为核心抽象，将计算过程表示为有向无环图（DAG），节点表示运算操作，边表示流动的数据（张量）。TensorFlow 名称中的 "Tensor" 指张量（多维数组），"Flow" 指数据在计算图中的流动。

TensorFlow 的核心特点：

1. **计算图抽象**：将计算表示为图结构，便于优化、并行和分布式执行
2. **自动微分**：内置自动求导机制，自动计算梯度
3. **多平台支持**：支持 CPU、GPU、TPU，以及移动端和嵌入式设备
4. **生产级部署**：提供 TensorFlow Serving（服务部署）、TF Lite（移动端）、TF.js（浏览器）等完整工具链
5. **强大的生态系统**：Keras（高层API）、TensorBoard（可视化）、TF Hub（预训练模型）等

### TensorFlow 2.x 的变化

TensorFlow 2.0（2019年发布）进行了重大改进：
- **默认即时执行（Eager Execution）**：不再需要先构建图再执行，代码像普通 Python 一样运行
- **Keras 成为官方高层 API**：简化模型构建流程
- **移除 Session 等旧 API**：更 Pythonic 的接口
- **统一的高级 API**：tf.keras 成为推荐入口

## 二、计算图

### 2.1 什么是计算图

计算图（Computational Graph）是将计算过程表示为有向无环图的方法。图中的：
- **节点（Node）**：表示数学运算（如加、乘、矩阵运算）
- **边（Edge）**：表示参与运算的数据（张量）

例如，表达式 y = (a + b) * c 的计算图：

\`\`\`
a ──┐
    ├──(+)── s ──┐
b ──┘            ├──(×)── y
            c ───┘
\`\`\`

其中 s = a + b 是中间结果，y = s * c 是最终结果。

### 2.2 计算图的优势

1. **自动微分**：计算图天然支持反向传播，通过链式法则自动计算梯度
2. **计算优化**：框架可以对图进行优化（常量折叠、算子融合、内存复用等）
3. **分布式执行**：图可以自动切分到多个设备（CPU/GPU/多机）上并行执行
4. **部署灵活性**：保存的图可以脱离 Python 环境运行（如 C++ 生产环境）

### 2.3 静态图 vs 动态图

- **静态图（TF 1.x）**：先定义完整的计算图，然后编译执行。优点是可优化、运行效率高；缺点是调试困难、不够灵活。
- **动态图（TF 2.x 默认 / PyTorch）**：计算在定义时即时执行，像普通 Python 代码。优点是易于调试、灵活；缺点是运行效率略低。

TensorFlow 2.x 通过 tf.function 装饰器可以在动态图基础上自动构建静态图，兼顾灵活性和性能。

## 三、Tensor 与 Variable

### 3.1 Tensor（张量）

Tensor 是 TensorFlow 中最基本的数据结构，类似于 NumPy 的 ndarray，表示多维数组。Tensor 是不可变的（immutable），一旦创建就不能修改其值。

张量的关键属性：
- **dtype**：数据类型（如 float32, int32, string）
- **shape**：形状（各维度大小）
- **rank**：维度数（标量 rank=0，向量 rank=1，矩阵 rank=2）

\`\`\`
标量 (rank 0):  42
向量 (rank 1):  [1, 2, 3]
矩阵 (rank 2):  [[1, 2], [3, 4]]
3D张量 (rank 3): [[[1,2],[3,4]], [[5,6],[7,8]]]
\`\`\`

### 3.2 Variable（变量）

Variable 是特殊的 Tensor，其值可以在训练过程中被修改（通过梯度下降更新）。模型的权重和偏置就是 Variable。

Variable 与 Tensor 的区别：
- **Tensor**：不可变，用于存储中间计算结果和数据输入
- **Variable**：可变，用于存储需要优化的模型参数

训练过程中，优化器会自动读取 Variable 的值进行前向计算，计算梯度后更新 Variable。

## 四、Keras Sequential API

### 4.1 Keras 简介

Keras 是一个高层神经网络 API，最初由 François Chollet 独立开发，后来被集成到 TensorFlow 中成为官方推荐 API。Keras 的设计理念是"用户友好、模块化、易扩展"，使构建深度学习模型像搭积木一样简单。

Keras 提供三种模型构建方式：
1. **Sequential API**：顺序模型，逐层堆叠，最简单
2. **Functional API**：函数式 API，支持多输入/输出和任意拓扑结构
3. **Model Subclassing**：模型子类化，最大灵活性，类似 PyTorch 风格

### 4.2 Sequential API 使用

Sequential 模型适用于"线性堆叠"的网络结构，即每一层有唯一的前驱和后继层。

构建一个 MLP 分类器的典型代码：

\`\`\`python
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])
\`\`\`

Dense 层就是全连接层，参数包括：
- **units**：神经元数量
- **activation**：激活函数
- **input_shape**：输入维度（仅第一层需要指定）
- **kernel_initializer**：权重初始化方式
- **use_bias**：是否使用偏置（默认 True）

### 4.3 常用网络层

| 层类型 | 说明 | 典型用途 |
|--------|------|---------|
| Dense | 全连接层 | MLP分类/回归 |
| Conv2D | 2D卷积层 | 图像处理 |
| MaxPooling2D | 最大池化 | 下采样 |
| Flatten | 展平层 | 维度转换 |
| Dropout | 随机失活 | 正则化 |
| BatchNormalization | 批归一化 | 训练稳定 |
| Embedding | 嵌入层 | NLP词向量 |
| LSTM/GRU | 循环层 | 序列数据 |

## 五、模型编译与训练

### 5.1 模型编译（compile）

构建模型后，需要编译它，指定三个关键要素：

\`\`\`python
model.compile(
    optimizer='adam',           # 优化器
    loss='sparse_categorical_crossentropy',  # 损失函数
    metrics=['accuracy']        # 评估指标
)
\`\`\`

**优化器（optimizer）**：
- 'sgd'：随机梯度下降
- 'adam'：自适应矩估计（最常用）
- 'rmsprop'：RMSProp 优化器
- 也可传入优化器对象以自定义学习率：tf.keras.optimizers.Adam(learning_rate=0.001)

**损失函数（loss）**：
- 回归：'mse'（均方误差）、'mae'（平均绝对误差）
- 二分类：'binary_crossentropy'
- 多分类（整数标签）：'sparse_categorical_crossentropy'
- 多分类（one-hot标签）：'categorical_crossentropy'

**评估指标（metrics）**：训练过程中监控的指标，不影响优化，仅用于报告。如 'accuracy'、'precision'、'recall'。

### 5.2 模型训练（fit）

\`\`\`python
history = model.fit(
    X_train, y_train,
    epochs=50,              # 训练轮数
    batch_size=32,          # 批大小
    validation_split=0.2,   # 20%数据用于验证
    verbose=1               # 日志显示模式
)
\`\`\`

fit 方法的关键参数：
- **epochs**：遍历整个训练集的次数
- **batch_size**：每次梯度更新使用的样本数
- **validation_split / validation_data**：验证集
- **callbacks**：回调函数列表（如早停、模型保存、学习率调度）
- **shuffle**：每轮是否打乱数据

fit 返回的 history 对象记录了每个 epoch 的训练和验证的损失及指标值，可用于绘制学习曲线。

### 5.3 模型评估与预测

\`\`\`python
# 评估
test_loss, test_acc = model.evaluate(X_test, y_test)

# 预测
predictions = model.predict(X_new)
\`\`\`

### 5.4 回调函数（Callbacks）

回调函数是在训练过程的特定时机（epoch开始/结束、batch开始/结束）执行的函数，常用的有：

- **EarlyStopping**：当验证损失不再改善时提前停止训练
- **ModelCheckpoint**：定期保存模型
- **ReduceLROnPlateau**：验证损失停滞时降低学习率
- **TensorBoard**：将训练日志写入 TensorBoard 可视化

\`\`\`python
callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
    tf.keras.callbacks.ModelCheckpoint('best_model.h5', save_best_only=True),
    tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
]
model.fit(..., callbacks=callbacks)
\`\`\`

## 六、完整的训练流程

一个典型的 TensorFlow/Keras 训练流程：

\`\`\`
1. 数据准备
   - 加载数据
   - 预处理（归一化、reshape等）
   - 划分训练/验证/测试集

2. 模型构建
   - 使用 Sequential 或 Functional API 定义网络结构
   - 选择合适的层、激活函数、初始化方式

3. 模型编译
   - 选择优化器、损失函数、评估指标

4. 模型训练
   - 调用 fit 方法
   - 配置 epochs、batch_size、validation
   - 使用 callbacks 进行训练控制

5. 模型评估
   - 在测试集上评估最终性能
   - 分析训练曲线，调整超参数

6. 模型部署
   - 保存模型
   - 加载模型进行推理
\`\`\`

## 七、TensorFlow 与 PyTorch 的对比

| 特性 | TensorFlow 2.x | PyTorch |
|------|---------------|---------|
| 计算图 | 动态图为主，tf.function可加速 | 动态图为主 |
| API风格 | Keras高层API，简洁 | 面向对象，灵活 |
| 调试 | 较好（即时执行） | 非常好（Python原生） |
| 部署 | 完善（TF Serving/Lite/JS） | 较好（TorchServe/ONNX） |
| 学术界 | 占比上升 | 最流行 |
| 工业界 | 最流行 | 快速增长 |
| 分布式 | 完善（tf.distribute） | 完善（DDP） |

## 八、总结

TensorFlow 配合 Keras 提供了从研究到生产的完整深度学习工具链。Keras 的 Sequential API 使模型构建极其简洁，只需几行代码就能搭建复杂的神经网络。理解计算图、Tensor/Variable、模型编译与训练的核心概念，是使用 TensorFlow 的基础。下一章将介绍 PyTorch，它在研究领域更受欢迎，提供了更灵活的编程体验。
`,
    code: `# ============================================================
# TensorFlow与Keras入门 —— 概念演示
# 由于只能使用纯Python标准库，本代码模拟TF/Keras的核心概念
# ============================================================

import math
import random

# ----------------------------------------------------------
# 模拟 Tensor 类（不可变张量）
# ----------------------------------------------------------

class Tensor:
    """模拟 TensorFlow 的 Tensor（不可变）"""

    def __init__(self, data, requires_grad=False):
        self.data = data
        self.requires_grad = requires_grad
        self.grad = None

    @property
    def shape(self):
        if isinstance(self.data, list):
            if len(self.data) > 0 and isinstance(self.data[0], list):
                return (len(self.data), len(self.data[0]))
            return (len(self.data),)
        return ()

    def __repr__(self):
        return f"Tensor(data={self.data}, shape={self.shape})"

    # 不可变：运算返回新 Tensor
    def __add__(self, other):
        if isinstance(other, Tensor):
            other = other.data
        if isinstance(self.data, list) and isinstance(self.data[0], list):
            result = [[self.data[i][j] + other[i][j] for j in range(len(self.data[0]))]
                      for i in range(len(self.data))]
        elif isinstance(self.data, list):
            result = [self.data[i] + other[i] for i in range(len(self.data))]
        else:
            result = self.data + other
        return Tensor(result)

    def __mul__(self, other):
        """逐元素乘法"""
        if isinstance(other, Tensor):
            other = other.data
        if isinstance(self.data, list):
            result = [self.data[i] * other[i] for i in range(len(self.data))]
        else:
            result = self.data * other
        return Tensor(result)

    def matmul(self, other):
        """矩阵乘法"""
        a = self.data
        b = other.data
        rows_a = len(a)
        cols_a = len(a[0])
        cols_b = len(b[0])
        result = [[sum(a[i][k] * b[k][j] for k in range(cols_a)) for j in range(cols_b)]
                  for i in range(rows_a)]
        return Tensor(result)


class Variable:
    """模拟 TensorFlow 的 Variable（可变，用于模型参数）"""

    def __init__(self, data, name=""):
        self.data = data
        self.name = name
        self.grad = None

    def assign(self, new_data):
        """更新值"""
        self.data = new_data

    def assign_add(self, delta):
        """增量更新（梯度下降用）"""
        if isinstance(self.data, list) and isinstance(self.data[0], list):
            self.data = [[self.data[i][j] + delta[i][j] for j in range(len(self.data[0]))]
                         for i in range(len(self.data))]
        elif isinstance(self.data, list):
            self.data = [self.data[i] + delta[i] for i in range(len(self.data))]
        else:
            self.data += delta

    def __repr__(self):
        return f"Variable(name='{self.name}', data={self.data})"


print("=" * 60)
print("一、Tensor 与 Variable 演示")
print("=" * 60)

# 创建 Tensor
t1 = Tensor([1.0, 2.0, 3.0])
t2 = Tensor([4.0, 5.0, 6.0])
print(f"\\nTensor t1: {t1}")
print(f"Tensor t2: {t2}")
print(f"t1 + t2 = {(t1 + t2).data}")
print(f"t1 * t2 = {(t1 * t2).data}")

# 矩阵乘法
t_mat = Tensor([[1.0, 2.0], [3.0, 4.0]])
t_vec = Tensor([[0.5], [0.7]])
result = t_mat.matmul(t_vec)
print(f"\\n矩阵乘法:")
print(f"  Matrix: {t_mat.data}")
print(f"  Vector: {t_vec.data}")
print(f"  Result: {result.data}")

# Variable
v = Variable([0.1, 0.2, 0.3], name="weights")
print(f"\\nVariable: {v}")
v.assign_add([0.01, 0.02, 0.03])
print(f"assign_add 后: {v}")

# ----------------------------------------------------------
# 模拟 Keras Dense 层
# ----------------------------------------------------------

def sigmoid(z):
    if z < -500:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))

def relu(z):
    return max(0.0, z)

def softmax(logits):
    max_val = max(logits)
    exp_vals = [math.exp(x - max_val) for x in logits]
    total = sum(exp_vals)
    return [v / total for v in exp_vals]


class Dense:
    """模拟 Keras 的 Dense（全连接）层"""

    def __init__(self, units, activation=None, input_shape=None, name=""):
        self.units = units
        self.activation = activation
        self.input_shape = input_shape
        self.name = name
        self.weights = None
        self.bias = None
        self._built = False

    def build(self, input_dim):
        """延迟构建权重（模拟 Keras 的 build 机制）"""
        # He 初始化
        scale = math.sqrt(2.0 / input_dim)
        self.weights = Variable(
            [[random.gauss(0, scale) for _ in range(input_dim)] for _ in range(self.units)],
            name=f"{self.name}_W"
        )
        self.bias = Variable(
            [0.0 for _ in range(self.units)],
            name=f"{self.name}_b"
        )
        self._built = True

    def call(self, inputs):
        """前向计算"""
        if not self._built:
            input_dim = len(inputs)
            self.build(input_dim)

        # z = W · x + b
        z = []
        for i in range(self.units):
            z_i = sum(self.weights.data[i][j] * inputs[j] for j in range(len(inputs)))
            z_i += self.bias.data[i]
            z.append(z_i)

        # 激活函数
        if self.activation == 'relu':
            a = [relu(zi) for zi in z]
        elif self.activation == 'sigmoid':
            a = [sigmoid(zi) for zi in z]
        elif self.activation == 'softmax':
            a = softmax(z)
        else:
            a = z  # 线性激活

        return a

    def get_config(self):
        return {
            "name": self.name,
            "units": self.units,
            "activation": self.activation,
            "input_shape": self.input_shape
        }


# ----------------------------------------------------------
# 模拟 Keras Sequential 模型
# ----------------------------------------------------------

class SequentialModel:
    """模拟 Keras 的 Sequential 模型"""

    def __init__(self, layers=None):
        self.layers = layers if layers else []
        self.optimizer = None
        self.loss_fn = None
        self.metrics = []

    def add(self, layer):
        self.layers.append(layer)

    def compile(self, optimizer='sgd', loss='mse', metrics=None):
        """编译模型"""
        self.optimizer = optimizer
        self.loss_fn = loss
        self.metrics = metrics or []
        print(f"模型编译完成:")
        print(f"  优化器: {optimizer}")
        print(f"  损失函数: {loss}")
        print(f"  评估指标: {metrics}")

    def forward(self, x):
        """前向传播"""
        current = x
        for layer in self.layers:
            current = layer.call(current)
        return current

    def summary(self):
        """打印模型结构"""
        print("\\n模型结构:")
        print("-" * 50)
        total_params = 0
        for i, layer in enumerate(self.layers):
            if layer._built:
                n_w = len(layer.weights.data) * len(layer.weights.data[0])
                n_b = len(layer.bias.data)
                params = n_w + n_b
            else:
                params = 0
            total_params += params
            print(f"  Layer {i}: {layer.name:<20} units={layer.units:<5} "
                  f"activation={str(layer.activation):<10} params={params}")
        print("-" * 50)
        print(f"  总参数量: {total_params}")

    def fit(self, X, y, epochs=10, batch_size=32, verbose=1):
        """模拟训练"""
        print(f"\\n开始训练: epochs={epochs}, batch_size={batch_size}")
        for epoch in range(epochs):
            epoch_loss = 0.0
            n_batches = 0
            # 简单的 mini-batch 训练
            for start in range(0, len(X), batch_size):
                X_batch = X[start:start + batch_size]
                y_batch = y[start:start + batch_size]

                batch_loss = 0.0
                for xi, yi in zip(X_batch, y_batch):
                    pred = self.forward(xi)
                    # 计算 MSE 损失
                    if isinstance(yi, list):
                        loss = sum((p - yi_) ** 2 for p, yi_ in zip(pred, yi)) / len(yi)
                    else:
                        loss = (pred[0] - yi) ** 2
                    batch_loss += loss
                epoch_loss += batch_loss / len(X_batch)
                n_batches += 1

            if verbose and (epoch % max(1, epochs // 5) == 0 or epoch == epochs - 1):
                print(f"  Epoch {epoch}/{epochs} - loss: {epoch_loss/n_batches:.6f}")


print("\\n" + "=" * 60)
print("二、Keras Sequential API 模拟演示")
print("=" * 60)

random.seed(42)

# 构建 Sequential 模型
model = SequentialModel()
model.add(Dense(units=5, activation='relu', input_shape=(3,), name="dense_1"))
model.add(Dense(units=3, activation='relu', name="dense_2"))
model.add(Dense(units=2, activation='sigmoid', name="output"))

# 先做一次前向传播以构建权重
dummy_input = [0.1, 0.2, 0.3]
_ = model.forward(dummy_input)

# 打印模型结构
model.summary()

# 编译模型
model.compile(optimizer='adam', loss='mse', metrics=['accuracy'])

# 生成训练数据
X_train = [[random.uniform(-1, 1) for _ in range(3)] for _ in range(50)]
y_train = [[0.5, 0.5] for _ in range(50)]  # 简单目标

# 训练
model.fit(X_train, y_train, epochs=20, batch_size=10)

# ----------------------------------------------------------
# 演示：计算图概念
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("三、计算图概念演示")
print("=" * 60)

print("""
计算图示例: y = (a + b) * c

  a ──┐
      ├──(+)── s=a+b ──┐
  b ──┘                ├──(×)── y=s*c
                c ─────┘

前向传播（计算输出）:
  s = a + b
  y = s * c

反向传播（计算梯度，链式法则）:
  ∂y/∂s = c           (y对s的梯度)
  ∂y/∂c = s           (y对c的梯度)
  ∂s/∂a = 1           (s对a的梯度)
  ∂s/∂b = 1           (s对b的梯度)
  ∂y/∂a = ∂y/∂s * ∂s/∂a = c * 1 = c   (链式法则)
  ∂y/∂b = ∂y/∂s * ∂s/∂b = c * 1 = c   (链式法则)
""")

# 数值验证
a, b, c = 3.0, 4.0, 2.0
s = a + b
y = s * c
print(f"数值验证: a={a}, b={b}, c={c}")
print(f"  s = a+b = {s}")
print(f"  y = s*c = {y}")
print(f"  ∂y/∂a = c = {c} (数值验证: {(y - ((a+0.001+b)*c))/0.001:.3f})")
print(f"  ∂y/∂b = c = {c} (数值验证: {(y - ((a+b+0.001)*c))/0.001:.3f})")
print(f"  ∂y/∂c = s = {s} (数值验证: {(y - (s*(c+0.001)))/0.001:.3f})")

print("\\n" + "=" * 60)
print("演示完成！")
print("=" * 60)
`,
  },
  {
    id: "aipy-pytorch",
    icon: "🔥",
    group: "深度学习入门",
    title: "PyTorch入门",
    content: `
# PyTorch入门

## 一、PyTorch 概述

PyTorch 是 Facebook（现 Meta）AI 研究团队开发的深度学习框架，于 2017 年开源发布。PyTorch 以"Pythonic"的设计哲学著称，其 API 风格与 NumPy 高度一致，使得使用者能够以最自然的方式编写深度学习代码。

PyTorch 的核心特点：

1. **动态计算图（Dynamic Computation Graph）**：计算图在运行时动态构建，每次前向传播都会创建新的计算图。这意味着你可以使用 Python 原生的控制流（if、for、while），调试非常方便。

2. **Pythonic 的 API 设计**：PyTorch 的 Tensor 操作与 NumPy 几乎一致，学习成本低。代码读起来就像普通 Python 代码，而不是框架特定的 DSL。

3. **自动微分（Autograd）**：内置强大的自动微分引擎，只需声明 requires_grad=True，就能自动追踪计算过程并计算梯度。

4. **丰富的生态系统**：TorchVision（视觉）、TorchText（文本）、TorchAudio（音频）、TorchServe（部署）、PyTorch Lightning（简化训练）等。

5. **学术界主导地位**：在顶会论文中，PyTorch 的使用率超过 80%，是新模型实现的首选框架。

## 二、动态计算图

### 2.1 动态图 vs 静态图

PyTorch 使用动态计算图（Define-by-Run），与 TensorFlow 1.x 的静态图（Define-and-Run）形成对比：

**动态图（PyTorch）**：
\`\`\`python
# 每次执行时动态构建图
result = model(x)  # 这次执行的图可能和上次不同
\`\`\`
- 图在前向传播时即时构建
- 可以使用 Python 控制流改变图结构
- 调试方便：可以随时 print 任何中间值
- 每次执行图都不同，适合可变结构（如 RNN、树结构网络）

**静态图（TF 1.x）**：
\`\`\`python
# 先定义图，再执行
graph = build_graph()  # 定义阶段
result = session.run(graph, feed_dict={x: data})  # 执行阶段
\`\`\`
- 图预先定义，重复执行
- 可以做编译优化
- 调试困难（图和执行分离）
- 适合固定结构的模型

### 2.2 动态图的优势

动态图的最大优势是**灵活性**和**易调试性**：

\`\`\`python
# PyTorch 中可以使用任意 Python 控制流
def forward(self, x):
    if x.mean() > 0:        # 条件分支
        x = self.layer_a(x)
    else:
        x = self.layer_b(x)
    for i in range(x.size(0)):  # 循环
        x[i] = self.process(x[i])
    return x
\`\`\`

这种代码在静态图框架中很难实现（需要用特殊的 tf.cond、tf.while_loop API）。

## 三、Tensor 操作

### 3.1 创建 Tensor

PyTorch 的 Tensor 类似于 NumPy ndarray，但支持 GPU 计算和自动微分。

\`\`\`python
import torch

# 从列表创建
x = torch.tensor([1, 2, 3])

# 创建特定形状的 Tensor
zeros = torch.zeros(3, 4)        # 全零
ones = torch.ones(2, 3)          # 全一
rand = torch.rand(2, 3)          # 均匀分布随机数
randn = torch.randn(2, 3)        # 标准正态分布
eye = torch.eye(3)               # 单位矩阵

# 从 NumPy 转换
import numpy as np
x_np = np.array([1, 2, 3])
x_tensor = torch.from_numpy(x_np)
\`\`\`

### 3.2 Tensor 属性

\`\`\`python
x = torch.randn(3, 4, 5)
x.shape      # torch.Size([3, 4, 5]) - 形状
x.dtype      # torch.float32 - 数据类型
x.device     # device(type='cpu') - 所在设备
x.requires_grad  # False - 是否需要梯度
x.grad       # None - 梯度值
\`\`\`

### 3.3 常用操作

\`\`\`python
# 算术运算
a = torch.tensor([1, 2, 3])
b = torch.tensor([4, 5, 6])
a + b    # tensor([5, 7, 9])
a * b    # 逐元素乘法
a @ b    # 或 torch.matmul(a, b) - 点积

# 矩阵乘法
A = torch.randn(2, 3)
B = torch.randn(3, 4)
C = torch.mm(A, B)  # 或 A @ B，结果 (2, 4)

# 形状操作
x = torch.randn(2, 3, 4)
x.view(6, 4)       # reshape（要求连续）
x.reshape(6, 4)    # reshape（不要求连续）
x.transpose(0, 1)  # 转置维度0和1
x.permute(2, 0, 1) # 重新排列所有维度

# 聚合操作
x = torch.tensor([[1, 2], [3, 4]])
x.sum()           # tensor(10) - 所有元素求和
x.sum(dim=0)      # tensor([4, 6]) - 沿维度0求和
x.mean()          # tensor(2.5) - 均值
x.max()           # tensor(4) - 最大值
\`\`\`

### 3.4 GPU 加速

\`\`\`python
# 检查 GPU 可用性
if torch.cuda.is_available():
    device = torch.device('cuda')
    x = x.to(device)  # 将 Tensor 移到 GPU
    model = model.to(device)  # 将模型移到 GPU
\`\`\`

GPU 计算对大规模矩阵运算有显著加速，是深度学习训练的核心硬件。

## 四、Autograd 自动微分

### 4.1 自动微分原理

Autograd 是 PyTorch 的自动微分引擎。当一个 Tensor 设置 requires_grad=True 时，PyTorch 会追踪所有对它的操作，构建计算图。调用 backward() 时，自动通过反向传播计算所有梯度。

自动微分不同于：
- **数值微分**：用 (f(x+ε) - f(x-ε))/(2ε) 近似，精度低
- **符号微分**：先生成导数表达式再计算，表达式可能很复杂
- **自动微分**：将计算分解为基本运算，用链式法则精确计算

### 4.2 使用示例

\`\`\`python
# 基本示例
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x + 1
# y = 2^2 + 3*2 + 1 = 11

y.backward()  # 自动计算梯度
print(x.grad)  # dy/dx = 2*x + 3 = 2*2+3 = 7
\`\`\`

### 4.3 计算图的生命周期

\`\`\`python
# 前向传播：构建计算图
y = model(x)
loss = criterion(y, target)

# 反向传播：计算梯度
loss.backward()  # 自动计算所有参数的梯度

# 更新参数
optimizer.step()

# 清零梯度（重要！）
optimizer.zero_grad()  # PyTorch 梯度默认累加，必须手动清零
\`\`\`

关键点：
- **梯度累加**：PyTorch 默认将梯度累加到 .grad 属性，每次 backward() 前需要 zero_grad()
- **计算图释放**：backward() 后计算图被释放（默认），下次前向传播会构建新图
- **retain_graph=True**：如果需要多次 backward()，需保留计算图

### 4.4 梯度截断

\`\`\`python
# 防止梯度爆炸
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
\`\`\`

## 五、nn.Module

### 5.1 模型定义

nn.Module 是所有神经网络模块的基类。自定义模型需要继承 nn.Module 并实现 forward() 方法。

\`\`\`python
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)  # 输出层通常不加激活
        return x

model = MLP(784, 256, 10)
\`\`\`

### 5.2 nn.Module 的关键功能

- **参数管理**：自动注册 nn.Parameter 和子模块的参数
- **model.parameters()**：返回所有可训练参数
- **model.to(device)**：将模型移到指定设备
- **model.train() / model.eval()**：切换训练/评估模式（影响 Dropout、BatchNorm）
- **model.save() / model.load()**：模型保存与加载

### 5.3 常用层

\`\`\`python
nn.Linear(in, out)           # 全连接层
nn.Conv2d(in_ch, out_ch, k)  # 2D卷积层
nn.ReLU()                    # ReLU激活
nn.Sigmoid()                 # Sigmoid激活
nn.Softmax(dim=-1)           # Softmax
nn.Dropout(p=0.5)            # Dropout
nn.BatchNorm1d(num_features) # 批归一化
nn.Embedding(num, dim)       # 嵌入层
nn.LSTM(input, hidden)       # LSTM层
\`\`\`

### 5.4 损失函数

\`\`\`python
nn.MSELoss()                       # 均方误差
nn.CrossEntropyLoss()              # 交叉熵（内置Softmax）
nn.BCELoss()                       # 二分类交叉熵
nn.BCEWithLogitsLoss()             # 带logits的二分类交叉熵
nn.L1Loss()                        # 平均绝对误差
nn.NLLLoss()                       # 负对数似然
\`\`\`

## 六、训练循环

### 6.1 标准训练流程

PyTorch 的训练需要手动编写训练循环，这提供了最大的灵活性：

\`\`\`python
# 1. 设置设备
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 2. 创建模型、损失函数、优化器
model = MLP(784, 256, 10).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 3. 训练循环
for epoch in range(num_epochs):
    model.train()  # 训练模式
    for batch_x, batch_y in train_loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)

        # 前向传播
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)

        # 反向传播
        optimizer.zero_grad()  # 清零梯度
        loss.backward()        # 计算梯度
        optimizer.step()       # 更新参数

    # 验证
    model.eval()  # 评估模式
    with torch.no_grad():  # 不计算梯度
        correct = 0
        total = 0
        for batch_x, batch_y in val_loader:
            outputs = model(batch_x)
            _, predicted = torch.max(outputs, 1)
            total += batch_y.size(0)
            correct += (predicted == batch_y).sum().item()
        print(f'Epoch {epoch}, Val Acc: {correct/total:.4f}')
\`\`\`

### 6.2 关键要点

1. **model.train() vs model.eval()**：
   - train() 启用 Dropout 和 BatchNorm 的训练行为
   - eval() 关闭 Dropout，BatchNorm 使用统计量而非批次统计

2. **torch.no_grad()**：评估时不需要梯度，用 no_grad() 上下文管理器可以节省内存和加速

3. **optimizer.zero_grad()**：PyTorch 梯度默认累加，每次反向传播前必须清零

4. **数据加载**：使用 DataLoader 进行批处理、打乱和并行加载

### 6.3 DataLoader

\`\`\`python
from torch.utils.data import DataLoader, TensorDataset

# 创建数据集
dataset = TensorDataset(X_tensor, y_tensor)

# 创建数据加载器
loader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=True,     # 每轮打乱
    num_workers=4,    # 多进程加载
    drop_last=False   # 最后不完整的batch是否丢弃
)

# 迭代获取批次
for batch_x, batch_y in loader:
    # 训练...
    pass
\`\`\`

## 七、模型保存与加载

\`\`\`python
# 方式1：保存整个模型（包括结构和参数）
torch.save(model, 'model.pth')
model = torch.load('model.pth')

# 方式2：只保存参数（推荐，更灵活）
torch.save(model.state_dict(), 'model_weights.pth')
model = MLP(784, 256, 10)  # 需要先创建模型结构
model.load_state_dict(torch.load('model_weights.pth'))

# 保存训练检查点（可恢复训练）
checkpoint = {
    'epoch': epoch,
    'model_state': model.state_dict(),
    'optimizer_state': optimizer.state_dict(),
    'loss': loss,
}
torch.save(checkpoint, 'checkpoint.pth')
\`\`\`

## 八、PyTorch vs TensorFlow 代码对比

**PyTorch 风格**（显式训练循环）：
\`\`\`python
for epoch in range(epochs):
    for x, y in loader:
        pred = model(x)
        loss = criterion(pred, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
\`\`\`

**Keras 风格**（一行训练）：
\`\`\`python
model.fit(X_train, y_train, epochs=10, batch_size=32)
\`\`\`

PyTorch 需要更多代码，但提供了对训练过程的完全控制；Keras 更简洁，适合快速原型。

## 九、总结

PyTorch 以动态计算图和 Pythonic 的设计赢得了学术界的青睐。理解 Tensor 操作、Autograd 自动微分、nn.Module 模型定义和训练循环，就掌握了 PyTorch 的核心。PyTorch 的"显式"风格虽然需要更多代码，但让用户对训练过程有完全的理解和控制，这正是研究和实验所需要的。下一章将深入探讨模型训练中的优化技术。
`,
    code: `# ============================================================
# PyTorch入门 —— 概念演示
# 由于只能使用纯Python标准库，本代码模拟PyTorch的核心概念
# ============================================================

import math
import random

# ----------------------------------------------------------
# 模拟 PyTorch 的 Tensor（支持自动微分）
# ----------------------------------------------------------

class Tensor:
    """模拟 PyTorch 的 Tensor，支持 autograd"""

    def __init__(self, data, requires_grad=False, _children=(), _op=''):
        if isinstance(data, (int, float)):
            data = [float(data)]
        self.data = list(data) if not isinstance(data[0], list) else data
        self.requires_grad = requires_grad
        self.grad = None
        # 自动微分相关的内部状态
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    @property
    def shape(self):
        if isinstance(self.data, list):
            if len(self.data) > 0 and isinstance(self.data[0], list):
                return (len(self.data), len(self.data[0]))
            return (len(self.data),)
        return ()

    def __repr__(self):
        return f"Tensor(data={self.data}, requires_grad={self.requires_grad})"

    def __add__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        if isinstance(self.data, list) and not isinstance(self.data[0], list):
            out_data = [self.data[i] + other.data[i] for i in range(len(self.data))]
        else:
            out_data = self.data + other.data

        out = Tensor(out_data, requires_grad=self.requires_grad or other.requires_grad,
                     _children=(self, other), _op='+')

        def _backward():
            if self.requires_grad:
                if self.grad is None:
                    self.grad = [0.0] * len(self.data)
                for i in range(len(self.data)):
                    self.grad[i] += out.grad[i]
            if other.requires_grad:
                if other.grad is None:
                    other.grad = [0.0] * len(other.data)
                for i in range(len(other.data)):
                    other.grad[i] += out.grad[i]
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out_data = [self.data[i] * other.data[i] for i in range(len(self.data))]
        out = Tensor(out_data, requires_grad=self.requires_grad or other.requires_grad,
                     _children=(self, other), _op='*')

        def _backward():
            if self.requires_grad:
                if self.grad is None:
                    self.grad = [0.0] * len(self.data)
                for i in range(len(self.data)):
                    self.grad[i] += other.data[i] * out.grad[i]
            if other.requires_grad:
                if other.grad is None:
                    other.grad = [0.0] * len(other.data)
                for i in range(len(other.data)):
                    other.grad[i] += self.data[i] * out.grad[i]
        out._backward = _backward
        return out

    def relu(self):
        out_data = [max(0.0, x) for x in self.data]
        out = Tensor(out_data, requires_grad=self.requires_grad,
                     _children=(self,), _op='relu')

        def _backward():
            if self.requires_grad:
                if self.grad is None:
                    self.grad = [0.0] * len(self.data)
                for i in range(len(self.data)):
                    self.grad[i] += (1.0 if self.data[i] > 0 else 0.0) * out.grad[i]
        out._backward = _backward
        return out

    def sum(self):
        out_data = [sum(self.data)]
        out = Tensor(out_data, requires_grad=self.requires_grad,
                     _children=(self,), _op='sum')

        def _backward():
            if self.requires_grad:
                if self.grad is None:
                    self.grad = [0.0] * len(self.data)
                for i in range(len(self.data)):
                    self.grad[i] += out.grad[0]
        out._backward = _backward
        return out

    def backward(self):
        """反向传播（拓扑排序后逆序执行）"""
        # 构建拓扑序
        topo = []
        visited = set()

        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)

        # 初始化梯度
        self.grad = [1.0] * len(self.data)
        # 逆序传播
        for v in reversed(topo):
            v._backward()


# ----------------------------------------------------------
# 演示 Autograd
# ----------------------------------------------------------

print("=" * 60)
print("一、Autograd 自动微分演示")
print("=" * 60)

# 示例1：简单函数 y = x^2 + 3x + 1
print("\\n示例1: y = x^2 + 3x + 1, 求 dy/dx")
x = Tensor([2.0], requires_grad=True)
# y = x*x + 3*x + 1
term1 = x * x       # x^2
term2 = x * Tensor([3.0])  # 3x
y = term1 + term2 + Tensor([1.0])
print(f"  x = {x.data[0]}")
print(f"  y = x^2 + 3x + 1 = {y.data[0]}")

y.backward()
print(f"  dy/dx = 2x + 3 = 2*2+3 = 7")
print(f"  autograd 计算结果: {x.grad[0]}")

# 示例2：复合函数
print("\\n示例2: z = relu(a*b + a), 其中 a=3, b=-2")
a = Tensor([3.0], requires_grad=True)
b = Tensor([-2.0], requires_grad=True)
ab = a * b         # a*b = -6
z_inner = ab + a   # a*b + a = -6 + 3 = -3
z = z_inner.relu()  # relu(-3) = 0
print(f"  a = {a.data[0]}, b = {b.data[0]}")
print(f"  z = relu(a*b + a) = relu({z_inner.data[0]}) = {z.data[0]}")

z.backward()
print(f"  dz/da = {a.grad[0]} (因为 z=0, relu导数为0)")
print(f"  dz/db = {b.grad[0]}")

# 示例3：向量运算
print("\\n示例3: 向量求和的梯度")
v = Tensor([1.0, 2.0, 3.0, 4.0], requires_grad=True)
s = v.sum()
print(f"  v = {v.data}")
print(f"  s = sum(v) = {s.data[0]}")
s.backward()
print(f"  ds/dv = {v.grad} (每个元素的梯度都是1)")


# ----------------------------------------------------------
# 模拟 nn.Module
# ----------------------------------------------------------

def sigmoid(z):
    if z < -500:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))

class Linear:
    """模拟 nn.Linear"""

    def __init__(self, in_features, out_features):
        self.in_features = in_features
        self.out_features = out_features
        # He 初始化
        scale = math.sqrt(2.0 / in_features)
        self.weight = [[random.gauss(0, scale) for _ in range(in_features)]
                       for _ in range(out_features)]
        self.bias = [0.0 for _ in range(out_features)]
        # 梯度
        self.weight_grad = None
        self.bias_grad = None

    def forward(self, x):
        """前向传播"""
        z = []
        for i in range(self.out_features):
            z_i = sum(self.weight[i][j] * x[j] for j in range(self.in_features))
            z_i += self.bias[i]
            z.append(z_i)
        return z

    def parameters(self):
        return {"weight": self.weight, "bias": self.bias}

    def __repr__(self):
        return f"Linear(in={self.in_features}, out={self.out_features})"


class MLP:
    """模拟 nn.Module 的多层感知机"""

    def __init__(self, layer_sizes):
        self.layers = []
        for i in range(len(layer_sizes) - 1):
            self.layers.append(Linear(layer_sizes[i], layer_sizes[i+1]))

    def forward(self, x):
        current = x
        for i, layer in enumerate(self.layers):
            current = layer.forward(current)
            # 隐藏层用 ReLU，输出层不加激活
            if i < len(self.layers) - 1:
                current = [max(0.0, v) for v in current]
        return current

    def __call__(self, x):
        return self.forward(x)

    def parameters(self):
        params = []
        for layer in self.layers:
            params.append(layer.parameters())
        return params


print("\\n" + "=" * 60)
print("二、nn.Module 模型定义演示")
print("=" * 60)

random.seed(42)
model = MLP([3, 4, 2])
print("\\n模型结构:")
for i, layer in enumerate(model.layers):
    print(f"  Layer {i}: {layer}")

# 前向传播
test_input = [0.5, -0.3, 0.8]
output = model(test_input)
print(f"\\n输入: {test_input}")
print(f"输出: {output}")

# 参数统计
total_params = 0
for layer in model.layers:
    n_w = len(layer.weight) * len(layer.weight[0])
    n_b = len(layer.bias)
    total_params += n_w + n_b
print(f"\\n总参数量: {total_params}")


# ----------------------------------------------------------
# 模拟训练循环
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("三、PyTorch 风格训练循环演示")
print("=" * 60)

# 简单的梯度下降训练（数值梯度）
class SimpleTrainer:
    """模拟 PyTorch 训练循环"""

    def __init__(self, model, lr=0.01):
        self.model = model
        self.lr = lr

    def compute_loss(self, X, y):
        """MSE 损失"""
        total = 0.0
        for xi, yi in zip(X, y):
            pred = self.model(xi)
            total += sum((p - yi_) ** 2 for p, yi_ in zip(pred, yi)) / len(yi)
        return total / len(X)

    def numerical_gradient(self, X, y, eps=1e-5):
        """数值梯度（模拟 autograd 的效果）"""
        gradients = []
        for layer in self.model.layers:
            # 权重梯度
            w_grad = [[0.0] * len(layer.weight[0]) for _ in range(len(layer.weight))]
            b_grad = [0.0] * len(layer.bias)

            for i in range(len(layer.weight)):
                for j in range(len(layer.weight[0])):
                    orig = layer.weight[i][j]
                    layer.weight[i][j] = orig + eps
                    loss_plus = self.compute_loss(X, y)
                    layer.weight[i][j] = orig - eps
                    loss_minus = self.compute_loss(X, y)
                    layer.weight[i][j] = orig
                    w_grad[i][j] = (loss_plus - loss_minus) / (2 * eps)

                orig_b = layer.bias[i]
                layer.bias[i] = orig_b + eps
                loss_plus = self.compute_loss(X, y)
                layer.bias[i] = orig_b - eps
                loss_minus = self.compute_loss(X, y)
                layer.bias[i] = orig_b
                b_grad[i] = (loss_plus - loss_minus) / (2 * eps)

            gradients.append({"weight": w_grad, "bias": b_grad})
        return gradients

    def step(self, gradients):
        """梯度下降更新参数"""
        for layer, grad in zip(self.model.layers, gradients):
            for i in range(len(layer.weight)):
                for j in range(len(layer.weight[0])):
                    layer.weight[i][j] -= self.lr * grad["weight"][i][j]
                layer.bias[i] -= self.lr * grad["bias"][i]

    def train(self, X, y, epochs=50, batch_size=10):
        print(f"\\n训练配置: lr={self.lr}, epochs={epochs}, batch_size={batch_size}")
        print("-" * 50)
        for epoch in range(epochs):
            # Mini-batch
            indices = list(range(len(X)))
            random.shuffle(indices)
            epoch_loss = 0.0
            n_batches = 0

            for start in range(0, len(X), batch_size):
                batch_idx = indices[start:start+batch_size]
                X_batch = [X[i] for i in batch_idx]
                y_batch = [y[i] for i in batch_idx]

                # 前向 + 计算梯度
                grads = self.numerical_gradient(X_batch, y_batch)
                # 更新参数
                self.step(grads)
                # 记录损失
                epoch_loss += self.compute_loss(X_batch, y_batch)
                n_batches += 1

            if epoch % max(1, epochs // 5) == 0 or epoch == epochs - 1:
                print(f"  Epoch {epoch:3d}/{epochs} - loss: {epoch_loss/n_batches:.6f}")


# 生成训练数据
random.seed(123)
X_train = [[random.uniform(-1, 1) for _ in range(3)] for _ in range(40)]
y_train = []
for x in X_train:
    target = [0.3 * x[0] + 0.5 * x[1] - 0.2 * x[2]]
    y_train.append(target)

# 训练
trainer = SimpleTrainer(model, lr=0.05)
trainer.train(X_train, y_train, epochs=30, batch_size=10)

# 测试
print("\\n测试结果:")
for x, y in zip(X_train[:5], y_train[:5]):
    pred = model(x)
    print(f"  输入{[round(v,3) for v in x]} → 预测: {pred[0]:.4f}, 真实: {y[0]:.4f}")

print("\\n" + "=" * 60)
print("演示完成！")
print("=" * 60)
`,
  },
  {
    id: "aipy-training",
    icon: "🎯",
    group: "深度学习入门",
    title: "模型训练与优化",
    content: `
# 模型训练与优化

## 一、优化器

优化器决定了如何利用梯度更新模型参数。不同的优化器在收敛速度、稳定性、泛化能力上有显著差异。

### 1.1 SGD（随机梯度下降）

最基础的优化器，沿负梯度方向更新参数：

\`\`\`
θ ← θ - η * ∇L(θ)
\`\`\`

**特点**：
- 简单直接，计算开销小
- 容易陷入局部最优（鞍点）
- 学习率需要手动调整
- 对不同参数使用相同学习率，不适合稀疏数据

### 1.2 SGD with Momentum（动量法）

动量法引入"惯性"概念，累积历史梯度方向：

\`\`\`
v ← β * v + ∇L(θ)       # v 是动量（速度）
θ ← θ - η * v
\`\`\`

其中 β（通常0.9）是动量系数。

**原理**：好比小球从山坡滚下，动量让它能冲过小的"坑洼"（局部最优），在一致的方向上加速，在方向震荡的方向上相互抵消。

**优点**：
- 加速收敛（在一致梯度方向上加速）
- 减少震荡（震荡方向梯度相互抵消）
- 有助于跳出局部最优

### 1.3 Nesterov 动量（NAG）

Nesterov Accelerated Gradient 是动量法的改进版本，先按动量"前瞻"一步，再在该位置计算梯度：

\`\`\`
v ← β * v + ∇L(θ - η * β * v)
θ ← θ - η * v
\`\`\`

NAG 比标准动量有更好的理论收敛性质，在实践中也常表现更优。

### 1.4 AdaGrad（自适应梯度）

AdaGrad 为每个参数维护独立的学习率，根据历史梯度的平方和自适应缩放：

\`\`\`
G ← G + ∇L(θ)^2          # 累积梯度平方
θ ← θ - η / √(G + ε) * ∇L(θ)
\`\`\`

**特点**：
- 频繁更新的参数 → 学习率变小（步长缩短）
- 很少更新的参数 → 学习率保持较大（适合稀疏特征）
- 学习率随训练单调下降

**缺点**：学习率衰减过快，训练后期可能停止学习。

### 1.5 RMSProp

RMSProp 解决 AdaGrad 学习率衰减过快的问题，使用指数移动平均代替累加：

\`\`\`
E[g^2] ← β * E[g^2] + (1-β) * ∇L(θ)^2   # 梯度平方的移动平均
θ ← θ - η / √(E[g^2] + ε) * ∇L(θ)
\`\`\`

**特点**：
- 学习率自适应但不会单调下降
- 对不同参数使用不同学习率
- β（通常0.9）控制衰减率
- 适合非平稳目标函数（如RNN）

### 1.6 Adam（自适应矩估计）

Adam 结合了 Momentum 和 RMSProp 的优点，同时维护梯度的一阶矩（均值）和二阶矩（方差）：

\`\`\`
m ← β1 * m + (1-β1) * ∇L(θ)           # 一阶矩（梯度的移动平均）
v ← β2 * v + (1-β2) * ∇L(θ)^2         # 二阶矩（梯度平方的移动平均）

# 偏差校正（消除初始零初始化的偏差）
m_hat ← m / (1 - β1^t)
v_hat ← v / (1 - β2^t)

# 参数更新
θ ← θ - η * m_hat / (√v_hat + ε)
\`\`\`

**默认超参数**：β1=0.9, β2=0.999, ε=1e-8

**优点**：
- 自适应学习率（每个参数不同）
- 结合动量加速收敛
- 偏差校正使初期训练稳定
- 对超参数不敏感，通常开箱即用

Adam 是目前最常用的优化器，适合大多数场景。

### 1.7 优化器选择指南

| 优化器 | 适用场景 | 特点 |
|--------|---------|------|
| SGD+Momentum | 图像分类（CNN） | 泛化性好，但需调参 |
| RMSProp | RNN/序列模型 | 适合非平稳目标 |
| Adam | 通用场景（默认选择） | 自适应，易用 |
| AdamW | Transformer | 改进的权重衰减 |
| Nadam | NLP任务 | Adam+Nesterov |

经验法则：先用 Adam 快速实验，如果追求极致性能再尝试 SGD+Momentum 调参。

## 二、学习率调度

### 2.1 学习率的重要性

学习率是训练中最重要的超参数：
- 太大：损失震荡或发散
- 太小：收敛缓慢
- 理想：训练初期大（快速接近），后期小（精细调整）

### 2.2 常见调度策略

**1. 阶梯衰减（Step Decay）**：
\`\`\`
每 N 个 epoch，学习率乘以 γ（如0.5）
lr = lr0 * γ^(epoch // step_size)
\`\`\`

**2. 指数衰减（Exponential Decay）**：
\`\`\`
lr = lr0 * γ^epoch
\`\`\`

**3. 余弦退火（Cosine Annealing）**：
\`\`\`
lr = lr_min + 0.5 * (lr_max - lr_min) * (1 + cos(π * t / T))
\`\`\`
学习率按余弦曲线从最大降到最小，平滑过渡。

**4. Warmup + 衰减**：
\`\`\`
前 N 步：线性增长到 lr_max（warmup）
之后：按某种策略衰减
\`\`\`
Warmup 使训练初期稳定，避免初期大梯度导致的发散，常用于 Transformer。

**5. ReduceLROnPlateau**：
监控验证损失，当连续若干 epoch 不改善时降低学习率。
\`\`\`
if val_loss 没有改善 for patience epochs:
    lr *= factor
\`\`\`

### 2.3 学习率范围测试

一种实用的调参方法：让学习率从极小值指数增长到极大值，绘制 loss-lr 曲线。当 loss 开始下降最快时的 lr 是一个好的起始值，当 loss 开始发散时的 lr 是上限。

## 三、批归一化（Batch Normalization）

### 3.1 问题背景

深层网络中，每层参数更新会导致后续层的输入分布发生变化（Internal Covariate Shift），使训练变得困难。批归一化通过在每层输入处进行归一化来解决这个问题。

### 3.2 BN 的计算

对于一个 mini-batch B = {x1, ..., xm}：

\`\`\`
# 1. 计算 batch 均值和方差
μ_B = (1/m) * Σ xi
σ²_B = (1/m) * Σ(xi - μ_B)^2

# 2. 归一化
x̂i = (xi - μ_B) / √(σ²_B + ε)

# 3. 缩放和平移（可学习参数）
yi = γ * x̂i + β
\`\`\`

其中 γ（scale）和 β（shift）是可学习参数，让网络可以恢复任意需要的分布。

### 3.3 BN 的作用

1. **加速训练**：允许使用更大的学习率
2. **减少对初始化的敏感度**：初始化不好也能训练
3. **正则化效果**：batch 内的统计量引入了噪声，有轻微正则化作用
4. **缓解梯度问题**：使各层输入分布稳定，梯度传播更顺畅

### 3.4 BN 的注意事项

- **batch_size 不能太小**：小 batch 的统计量不准，BN效果差
- **训练/推理行为不同**：训练用 batch 统计量，推理用移动平均统计量
- **RNN 不适用**：序列长度变化，BN 难以处理。RNN 用 Layer Normalization

### 3.5 其他归一化方法

| 方法 | 归一化维度 | 适用场景 |
|------|-----------|---------|
| Batch Norm | batch 维度 | CNN、MLP |
| Layer Norm | 特征维度 | RNN、Transformer |
| Instance Norm | 单样本空间 | 风格迁移 |
| Group Norm | 通道分组 | 小batch CNN |

## 四、Dropout

### 4.1 Dropout 原理

Dropout 是一种简单有效的正则化技术。训练时，以概率 p 随机将神经元输出置零（"丢弃"），推理时使用所有神经元但不缩放或做相应缩放。

\`\`\`
训练时:
  mask ~ Bernoulli(1-p)  # 生成0/1掩码
  a = a * mask / (1-p)   # 保留的神经元放大（inverted dropout）

推理时:
  a = a  # 直接使用，不做处理
\`\`\`

### 4.2 Dropout 的作用

1. **防止过拟合**：阻止神经元间的"共适应"（co-adaptation），每个神经元都要学到有用的特征
2. **模型集成效果**：每次 dropout 相当于采样一个子网络，训练过程相当于训练了指数级个子网络并集成
3. **增加鲁棒性**：网络不依赖任何单个神经元

### 4.3 Dropout 的使用

- 常用 dropout rate：0.2 ~ 0.5
- 通常放在全连接层之间，卷积层用得少（卷积本身有正则化效果）
- Dropout 越大正则化越强，但太大可能导致欠拟合
- 训练时启用，推理时关闭（model.eval() 自动处理）

### 4.4 Dropout 变种

- **Spatial Dropout**：丢弃整个特征图（用于CNN）
- **DropConnect**：丢弃权重而非激活值
- **Variational Dropout**：同一时间步使用相同的 dropout mask（用于RNN）

## 五、早停（Early Stopping）

### 5.1 早停原理

早停是一种基于验证集性能的训练策略：在验证损失不再改善时提前停止训练，防止过拟合。

\`\`\`
训练过程:
  Epoch 1: train_loss=0.8, val_loss=0.7 → 继续训练
  Epoch 5: train_loss=0.3, val_loss=0.4 → 继续训练
  Epoch 10: train_loss=0.15, val_loss=0.35 → 最佳，保存模型
  Epoch 15: train_loss=0.08, val_loss=0.38 → 开始过拟合
  Epoch 20: train_loss=0.05, val_loss=0.45 → 过拟合严重
  → 在 Epoch 10+patience 时停止，恢复最佳模型
\`\`\`

### 5.2 早停的实现

关键参数：
- **patience**：允许验证损失不改善的最大 epoch 数
- **min_delta**：视为"改善"的最小变化量
- **restore_best_weights**：是否恢复最佳模型的权重

\`\`\`python
# 伪代码
best_val_loss = float('inf')
patience_counter = 0

for epoch in range(max_epochs):
    train_loss = train_one_epoch()
    val_loss = validate()

    if val_loss < best_val_loss - min_delta:
        best_val_loss = val_loss
        patience_counter = 0
        save_best_model()
    else:
        patience_counter += 1
        if patience_counter >= patience:
            print("Early stopping!")
            restore_best_model()
            break
\`\`\`

### 5.3 早停的优势

- **自动确定训练轮数**：不需要猜测最佳 epoch 数
- **防止过拟合**：在开始过拟合时停止
- **节省时间**：避免无意义的训练
- **无额外参数**：不增加模型复杂度

## 六、过拟合与欠拟合

### 6.1 诊断模型

通过训练曲线判断模型状态：

| 现象 | 训练损失 | 验证损失 | 诊断 |
|------|---------|---------|------|
| 欠拟合 | 高 | 高 | 模型容量不足 |
| 理想 | 低 | 低，接近训练损失 | 恰到好处 |
| 过拟合 | 低 | 高于训练损失 | 模型容量过大 |

### 6.2 解决方案

**欠拟合**：
- 增大模型（更多层/神经元）
- 训练更久
- 减少正则化
- 特征工程改进

**过拟合**：
- 增加训练数据
- 数据增强
- 正则化（L1/L2）
- Dropout
- 早停
- 批归一化
- 减小模型

## 七、正则化技术

### 7.1 L1 正则化（Lasso）

\`\`\`
L_total = L_data + λ * Σ|wi|
\`\`\`

L1 使不重要的权重趋近于0，产生稀疏权重，可用于特征选择。

### 7.2 L2 正则化（Ridge / Weight Decay）

\`\`\`
L_total = L_data + λ * Σwi^2
\`\`\`

L2 惩罚大权重，使权重分布更均匀。在深度学习中最常用，称为权重衰减（weight decay）。

### 7.3 L1 + L2（Elastic Net）

\`\`\`
L_total = L_data + λ1 * Σ|wi| + λ2 * Σwi^2
\`\`\`

结合 L1 的稀疏性和 L2 的平滑性。

## 八、综合训练策略

一个完整的训练流程应该综合考虑：

1. **数据准备**：充足的训练数据 + 数据增强
2. **模型设计**：合适的容量（不过大不过小）
3. **优化器选择**：Adam 作为默认，SGD+Momentum 追求极致性能
4. **学习率调度**：Warmup + 余弦退火或 ReduceLROnPlateau
5. **正则化**：Dropout + L2 + BatchNorm 组合使用
6. **早停**：始终使用，自动确定训练轮数
7. **监控**：TensorBoard 跟踪 loss、accuracy、learning_rate 等
8. **超参数搜索**：网格搜索 / 随机搜索 / 贝叶斯优化

## 九、总结

模型训练与优化是深度学习的"工程"部分，直接决定了最终性能。优化器（SGD/Adam）、学习率调度、批归一化、Dropout、早停是五个最核心的技术。理解它们的原理和适用场景，能够针对不同问题选择合适的策略组合。在实践中，建议从标准配置（Adam + BN + Dropout + EarlyStopping）开始，根据训练曲线逐步调优。深度学习既是科学也是艺术，经验的积累和系统的实验方法同样重要。
`,
    code: `# ============================================================
# 模型训练与优化 —— 代码演示
# 实现优化器、学习率调度、BN、Dropout、早停（纯Python标准库）
# ============================================================

import math
import random

# ----------------------------------------------------------
# 激活函数
# ----------------------------------------------------------

def sigmoid(z):
    if z < -500:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))

def relu(z):
    return max(0.0, z)

# ----------------------------------------------------------
# 一、优化器实现
# ----------------------------------------------------------

print("=" * 60)
print("一、优化器实现与对比")
print("=" * 60)

class SGD:
    """SGD with Momentum"""

    def __init__(self, lr=0.01, momentum=0.9):
        self.lr = lr
        self.momentum = momentum
        self.velocities = {}  # 存储每个参数的动量

    def step(self, params, grads):
        for key in params:
            if key not in self.velocities:
                self.velocities[key] = 0.0
            # v = β*v + grad
            self.velocities[key] = self.momentum * self.velocities[key] + grads[key]
            # θ = θ - lr * v
            params[key] -= self.lr * self.velocities[key]


class RMSProp:
    """RMSProp 优化器"""

    def __init__(self, lr=0.01, beta=0.9, eps=1e-8):
        self.lr = lr
        self.beta = beta
        self.eps = eps
        self.cache = {}

    def step(self, params, grads):
        for key in params:
            if key not in self.cache:
                self.cache[key] = 0.0
            # E[g^2] = β*E[g^2] + (1-β)*g^2
            self.cache[key] = self.beta * self.cache[key] + (1 - self.beta) * grads[key] ** 2
            # θ = θ - lr * g / √(E[g^2] + ε)
            params[key] -= self.lr * grads[key] / (math.sqrt(self.cache[key]) + self.eps)


class Adam:
    """Adam 优化器"""

    def __init__(self, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m = {}  # 一阶矩
        self.v = {}  # 二阶矩
        self.t = 0   # 时间步

    def step(self, params, grads):
        self.t += 1
        for key in params:
            if key not in self.m:
                self.m[key] = 0.0
                self.v[key] = 0.0
            # 一阶矩
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grads[key]
            # 二阶矩
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grads[key] ** 2
            # 偏差校正
            m_hat = self.m[key] / (1 - self.beta1 ** self.t)
            v_hat = self.v[key] / (1 - self.beta2 ** self.t)
            # 更新参数
            params[key] -= self.lr * m_hat / (math.sqrt(v_hat) + self.eps)


# 测试优化器：优化函数 f(x,y) = x^2 + 10*y^2（椭球函数）
def test_optimizers():
    """比较不同优化器在优化 x^2 + 10y^2 上的表现"""
    print("\\n目标函数: f(x,y) = x^2 + 10*y^2")
    print("最优解: x=0, y=0, f=0")
    print(f"{'优化器':<15} {'初始值':<15} {'最终值':<15} {'最终f':<15} {'迭代次数':<10}")
    print("-" * 70)

    optimizers = {
        'SGD': SGD(lr=0.1, momentum=0.0),
        'SGD+Momentum': SGD(lr=0.1, momentum=0.9),
        'RMSProp': RMSProp(lr=0.1),
        'Adam': Adam(lr=0.1),
    }

    for name, opt in optimizers.items():
        params = {'x': 5.0, 'y': 5.0}
        init_vals = (params['x'], params['y'])

        for i in range(200):
            # 计算梯度: df/dx = 2x, df/dy = 20y
            grads = {'x': 2 * params['x'], 'y': 20 * params['y']}
            opt.step(params, grads)

            f_val = params['x'] ** 2 + 10 * params['y'] ** 2
            if f_val < 1e-10:
                break

        f_val = params['x'] ** 2 + 10 * params['y'] ** 2
        print(f"{name:<15} ({init_vals[0]:.1f},{init_vals[1]:.1f})    "
              f"({params['x']:.6f},{params['y']:.6f})  {f_val:.10f}  {i+1}")

test_optimizers()

# ----------------------------------------------------------
# 二、学习率调度
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("二、学习率调度策略")
print("=" * 60)

class StepLR:
    """阶梯衰减：每 step_size 个 epoch，lr *= gamma"""
    def __init__(self, lr0, step_size, gamma):
        self.lr0 = lr0
        self.step_size = step_size
        self.gamma = gamma

    def get_lr(self, epoch):
        return self.lr0 * (self.gamma ** (epoch // self.step_size))


class ExponentialLR:
    """指数衰减：lr = lr0 * gamma^epoch"""
    def __init__(self, lr0, gamma):
        self.lr0 = lr0
        self.gamma = gamma

    def get_lr(self, epoch):
        return self.lr0 * (self.gamma ** epoch)


class CosineAnnealingLR:
    """余弦退火"""
    def __init__(self, lr_max, lr_min, T_max):
        self.lr_max = lr_max
        self.lr_min = lr_min
        self.T_max = T_max

    def get_lr(self, epoch):
        return self.lr_min + 0.5 * (self.lr_max - self.lr_min) * \
               (1 + math.cos(math.pi * epoch / self.T_max))


class WarmupDecay:
    """Warmup + 余弦衰减"""
    def __init__(self, lr_max, warmup_epochs, total_epochs):
        self.lr_max = lr_max
        self.warmup = warmup_epochs
        self.total = total_epochs

    def get_lr(self, epoch):
        if epoch < self.warmup:
            # 线性 warmup
            return self.lr_max * (epoch + 1) / self.warmup
        else:
            # 余弦衰减
            progress = (epoch - self.warmup) / (self.total - self.warmup)
            return self.lr_max * 0.5 * (1 + math.cos(math.pi * progress))


print("\\n各调度策略的学习率变化（初始 lr=0.1）:")
print(f"{'Epoch':<8} {'StepLR':<12} {'ExpLR':<12} {'Cosine':<12} {'WarmupDecay':<12}")
print("-" * 56)

schedulers = {
    'StepLR': StepLR(0.1, step_size=10, gamma=0.5),
    'ExpLR': ExponentialLR(0.1, gamma=0.95),
    'Cosine': CosineAnnealingLR(0.1, 0.001, 30),
    'WarmupDecay': WarmupDecay(0.1, warmup_epochs=5, total_epochs=30),
}

for epoch in range(0, 31, 3):
    lrs = [s.get_lr(epoch) for s in schedulers.values()]
    print(f"{epoch:<8} {lrs[0]:<12.6f} {lrs[1]:<12.6f} {lrs[2]:<12.6f} {lrs[3]:<12.6f}")


# ----------------------------------------------------------
# 三、批归一化（Batch Normalization）
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("三、批归一化（Batch Normalization）")
print("=" * 60)

class BatchNorm1D:
    """1D 批归一化（简化实现）"""

    def __init__(self, num_features, eps=1e-5, momentum=0.9):
        self.eps = eps
        self.momentum = momentum
        # 可学习参数
        self.gamma = [1.0] * num_features   # 缩放参数
        self.beta = [0.0] * num_features    # 平移参数
        # 运行时统计量（推理用）
        self.running_mean = [0.0] * num_features
        self.running_var = [1.0] * num_features
        self.training = True

    def forward(self, x_batch):
        """x_batch: [样本数, 特征数]"""
        n = len(x_batch)
        num_features = len(x_batch[0])

        if self.training:
            # 训练模式：使用 batch 统计量
            means = [sum(x_batch[i][j] for i in range(n)) / n
                     for j in range(num_features)]
            vars_ = [sum((x_batch[i][j] - means[j]) ** 2 for i in range(n)) / n
                     for j in range(num_features)]

            # 更新运行时统计量
            for j in range(num_features):
                self.running_mean[j] = self.momentum * self.running_mean[j] + \
                                       (1 - self.momentum) * means[j]
                self.running_var[j] = self.momentum * self.running_var[j] + \
                                      (1 - self.momentum) * vars_[j]
        else:
            # 推理模式：使用运行时统计量
            means = self.running_mean
            vars_ = self.running_var

        # 归一化 + 缩放平移
        output = []
        for i in range(n):
            row = []
            for j in range(num_features):
                normalized = (x_batch[i][j] - means[j]) / math.sqrt(vars_[j] + self.eps)
                scaled = self.gamma[j] * normalized + self.beta[j]
                row.append(scaled)
            output.append(row)
        return output


# 演示 BN
random.seed(42)
bn = BatchNorm1D(num_features=3)

# 生成未归一化的数据
raw_data = [[random.gauss(10, 5) for _ in range(3)] for _ in range(8)]
print("\\n归一化前（前3个样本）:")
for i in range(3):
    print(f"  样本{i}: [{', '.join(f'{v:.3f}' for v in raw_data[i])}]")

# 计算原始统计量
orig_means = [sum(raw_data[i][j] for i in range(8)) / 8 for j in range(3)]
orig_stds = [math.sqrt(sum((raw_data[i][j] - orig_means[j]) ** 2 for i in range(8)) / 8)
             for j in range(3)]
print(f"  原始均值: [{', '.join(f'{v:.3f}' for v in orig_means)}]")
print(f"  原始标准差: [{', '.join(f'{v:.3f}' for v in orig_stds)}]")

# BN 训练模式
normalized = bn.forward(raw_data)
print("\\nBatchNorm 后（训练模式，前3个样本）:")
for i in range(3):
    print(f"  样本{i}: [{', '.join(f'{v:.3f}' for v in normalized[i])}]")

new_means = [sum(normalized[i][j] for i in range(8)) / 8 for j in range(3)]
new_stds = [math.sqrt(sum((normalized[i][j] - new_means[j]) ** 2 for i in range(8)) / 8)
            for j in range(3)]
print(f"  BN后均值: [{', '.join(f'{v:.6f}' for v in new_means)}] (≈0)")
print(f"  BN后标准差: [{', '.join(f'{v:.6f}' for v in new_stds)}] (≈1)")

# BN 推理模式
bn.training = False
test_data = [[12.0, 8.0, 15.0]]
inference = bn.forward(test_data)
print(f"\\n推理模式（使用运行时统计量）:")
print(f"  输入: {test_data[0]}")
print(f"  输出: [{', '.join(f'{v:.3f}' for v in inference[0])}]")


# ----------------------------------------------------------
# 四、Dropout
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("四、Dropout 演示")
print("=" * 60)

class Dropout:
    """Dropout 层"""

    def __init__(self, p=0.5):
        self.p = p  # 丢弃概率
        self.training = True

    def forward(self, x):
        if not self.training or self.p == 0:
            return x[:]

        # 生成 mask 并缩放（inverted dropout）
        # 保留的神经元放大 1/(1-p)，保证期望值不变
        scale = 1.0 / (1.0 - self.p)
        output = []
        for xi in x:
            if random.random() < self.p:
                output.append(0.0)  # 丢弃
            else:
                output.append(xi * scale)  # 保留并放大
        return output


# 演示 Dropout
random.seed(42)
dropout = Dropout(p=0.3)
dropout.training = True

input_vec = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
print(f"\\n输入向量: {input_vec}")
print(f"Dropout rate: {dropout.p}")

print("\\n训练模式（多次前向，观察随机性）:")
for trial in range(3):
    out = dropout.forward(input_vec[:])
    kept = sum(1 for v in out if v > 0)
    print(f"  第{trial+1}次: {[round(v, 2) for v in out]} (保留{kept}/{len(input_vec)})")

# 推理模式
dropout.training = False
out_eval = dropout.forward(input_vec[:])
print(f"\\n推理模式: {[round(v, 2) for v in out_eval]} (不丢弃，不缩放)")

# 统计 Dropout 的期望保持
print("\\n验证 Dropout 期望保持（10000次平均）:")
dropout.training = True
sums = [sum(dropout.forward(input_vec[:])) for _ in range(10000)]
avg_sum = sum(sums) / len(sums)
orig_sum = sum(input_vec)
print(f"  原始总和: {orig_sum}")
print(f"  Dropout后平均总和: {avg_sum:.2f} (应接近原始总和)")


# ----------------------------------------------------------
# 五、早停（Early Stopping）
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("五、早停（Early Stopping）演示")
print("=" * 60)

class EarlyStopping:
    """早停回调"""

    def __init__(self, patience=5, min_delta=0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = float('inf')
        self.counter = 0
        self.should_stop = False
        self.best_epoch = 0

    def __call__(self, val_loss, epoch):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            self.best_epoch = epoch
            return True  # 有改善
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
            return False  # 无改善


# 模拟训练过程
print("\\n模拟训练过程（patience=5, min_delta=0.001）:")
early_stop = EarlyStopping(patience=5, min_delta=0.001)

# 模拟损失曲线（先降后升，模拟过拟合）
train_losses = [0.9, 0.7, 0.5, 0.35, 0.25, 0.18, 0.13, 0.10, 0.08, 0.07,
                0.06, 0.055, 0.05, 0.048, 0.047]
val_losses =   [0.85, 0.65, 0.48, 0.38, 0.32, 0.30, 0.29, 0.295, 0.31, 0.33,
                0.36, 0.40, 0.44, 0.48, 0.52]

print(f"{'Epoch':<8} {'Train Loss':<14} {'Val Loss':<14} {'改善?':<8} {'计数':<6} {'动作'}")
print("-" * 65)

for epoch in range(len(val_losses)):
    improved = early_stop(val_losses[epoch], epoch)
    action = "保存模型" if improved else "继续"
    if early_stop.should_stop:
        action = "停止训练!"
    print(f"{epoch:<8} {train_losses[epoch]:<14.4f} {val_losses[epoch]:<14.4f} "
          f"{'是' if improved else '否':<8} {early_stop.counter:<6} {action}")
    if early_stop.should_stop:
        break

print(f"\\n最终结果:")
print(f"  最佳 epoch: {early_stop.best_epoch}")
print(f"  最佳验证损失: {early_stop.best_loss:.4f}")
print(f"  在 epoch {epoch} 提前停止（节省 {len(val_losses)-epoch-1} 个 epoch）")


# ----------------------------------------------------------
# 六、L1/L2 正则化
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("六、L1/L2 正则化演示")
print("=" * 60)

def l1_regularization(weights, lam):
    """L1 正则化项: λ * Σ|wi|"""
    return lam * sum(abs(w) for w in weights)

def l2_regularization(weights, lam):
    """L2 正则化项: λ * Σwi^2"""
    return lam * sum(w ** 2 for w in weights)

# 模拟权重
weights = [0.5, -0.3, 0.0, 0.8, -0.1, 0.0, 0.6, -0.4]
lam = 0.01

print(f"\\n权重: {weights}")
print(f"正则化系数 λ = {lam}")
print(f"L1 正则化项: {l1_regularization(weights, lam):.6f}")
print(f"L2 正则化项: {l2_regularization(weights, lam):.6f}")

# 演示 L1 产生稀疏性
print("\\nL1 正则化的稀疏化效果（梯度驱动权重趋近0）:")
print("  L1 梯度 = λ * sign(w)，对所有非零权重施加恒定大小的推力")
print("  小权重会被推到恰好0，产生稀疏解")

# 演示 L2 惩罚大权重
print("\\nL2 正则化对大权重的惩罚:")
for w in [0.1, 0.5, 1.0, 2.0]:
    l1_val = lam * abs(w)
    l2_val = lam * w ** 2
    print(f"  w={w:.1f}: L1惩罚={l1_val:.4f}, L2惩罚={l2_val:.4f}")
print("  → L2 对大权重惩罚更重（平方增长），促使权重均匀分布")


# ----------------------------------------------------------
# 七、综合训练演示
# ----------------------------------------------------------

print("\\n" + "=" * 60)
print("七、综合训练演示（优化器 + 调度 + 早停）")
print("=" * 60)

# 简单线性回归：y = 2x + 1
random.seed(42)
X_data = [random.uniform(-2, 2) for _ in range(30)]
y_data = [2.0 * x + 1.0 + random.gauss(0, 0.3) for x in X_data]

# 使用 Adam 优化器训练
adam = Adam(lr=0.05)
params = {'w': 0.0, 'b': 0.0}
scheduler = CosineAnnealingLR(0.05, 0.005, 50)
early_stopping = EarlyStopping(patience=8, min_delta=0.0001)

best_params = {}
print(f"\\n目标: 学习 y = 2x + 1")
print(f"初始参数: w={params['w']:.4f}, b={params['b']:.4f}")
print(f"{'Epoch':<8} {'lr':<10} {'w':<10} {'b':<10} {'Loss':<12} {'状态'}")
print("-" * 60)

for epoch in range(60):
    lr = scheduler.get_lr(epoch)
    adam.lr = lr

    # 计算梯度（MSE损失对w和b的导数）
    grad_w = sum((params['w'] * x + params['b'] - y) * x for x, y in zip(X_data, y_data)) / len(X_data)
    grad_b = sum(params['w'] * x + params['b'] - y for x, y in zip(X_data, y_data)) / len(X_data)
    grads = {'w': grad_w, 'b': grad_b}

    # 更新参数
    adam.step(params, grads)

    # 计算损失
    loss = sum((params['w'] * x + params['b'] - y) ** 2 for x, y in zip(X_data, y_data)) / len(X_data)

    # 早停检查
    improved = early_stopping(loss, epoch)
    if improved:
        best_params = {'w': params['w'], 'b': params['b']}

    if epoch % 5 == 0 or early_stopping.should_stop:
        status = "最佳" if improved else ""
        if early_stopping.should_stop:
            status = "早停!"
        print(f"{epoch:<8} {lr:<10.6f} {params['w']:<10.4f} {params['b']:<10.4f} {loss:<12.6f} {status}")

    if early_stopping.should_stop:
        break

print(f"\\n最终参数: w={params['w']:.4f} (目标2.0), b={params['b']:.4f} (目标1.0)")
print(f"最佳参数: w={best_params['w']:.4f}, b={best_params['b']:.4f} (epoch {early_stopping.best_epoch})")

print("\\n" + "=" * 60)
print("所有演示完成！")
print("=" * 60)
`,
  },
];
