// =============================================================
// Python 人工智能开发教程 —— 第一批章节（AI开发入门组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "aipy-overview",
    icon: "🧠",
    group: "AI开发入门",
    title: "Python人工智能开发全景概览",
    content: `
# Python人工智能开发全景概览

## 引言：为什么是 Python，为什么是现在

人工智能（Artificial Intelligence，简称 AI）正在重塑每一个行业。从你手机里的语音助手，到自动驾驶汽车；从电商平台的商品推荐，到医院的影像诊断；从 ChatGPT 能与人流畅对话，到 AlphaFold 解析蛋白质结构——AI 已经从实验室走向了生产生活的每一个角落。

而在这场 AI 革命中，**Python 是当之无愧的"通用语言"**。根据 GitHub Octoverse 报告、Stack Overflow 开发者调查、Kaggle 数据科学调查等多份权威报告，Python 在 AI / 机器学习 / 数据科学领域的使用率长期保持在 **80% 以上**。无论是 Google 的 TensorFlow、Meta 的 PyTorch，还是 OpenAI 的各类模型 SDK，Python 都是首选甚至唯一的官方语言。

本章将带你从宏观视角理解：
- AI 领域的全貌与分层结构
- Python 在 AI 生态中的核心地位
- AI 开发的核心技术栈
- 一条清晰的、可执行的学习路径

读完本章，你将对"用 Python 做 AI 开发"这件事有一个完整的认知地图，知道每个阶段学什么、为什么学、学完能做什么。

## 一、人工智能领域的全貌

### 1.1 AI 的层次结构

人工智能并不是一个单一的技术，而是一个包含多个层次的庞大领域。理解它的层次结构，是学习 AI 的第一步。

\`\`\`
┌─────────────────────────────────────────────────────┐
│  人工智能 (Artificial Intelligence)                  │
│  ── 让机器具备类人智能的总目标                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  机器学习 (Machine Learning)                   │  │
│  │  ── 从数据中学习规律，无需显式编程              │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  深度学习 (Deep Learning)                │  │  │
│  │  │  ── 基于多层神经网络的机器学习             │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │  大模型 (LLM) / 生成式 AI          │  │  │  │
│  │  │  │  ── GPT、Claude、Gemini 等         │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
\`\`\`

**各层级的含义：**

| 层级 | 定义 | 典型技术 | 典型应用 |
|------|------|---------|---------|
| 人工智能 | 让机器模拟人类智能 | 专家系统、规则引擎 | 早期下棋程序、医疗诊断系统 |
| 机器学习 | 通过数据训练模型 | 决策树、SVM、随机森林 | 垃圾邮件过滤、信用评分 |
| 深度学习 | 多层神经网络 | CNN、RNN、Transformer | 图像识别、语音识别、机器翻译 |
| 生成式 AI | 生成新内容 | GPT、Diffusion、VAE | 文本生成、图像生成、代码生成 |

**关键认知：** 深度学习是机器学习的子集，机器学习是 AI 的子集。不要把它们混为一谈。一个用 if-else 规则实现的"智能客服"是 AI 但不是机器学习；一个用决策树做风控的系统是机器学习但不是深度学习。

### 1.2 AI 的三大流派

AI 发展历程中形成了三大主要流派，理解它们有助于你把握技术演进的方向。

**1. 符号主义（Symbolism）——"老派 AI"**
- 核心思想：智能 = 符号操作 + 逻辑推理
- 代表技术：专家系统、知识图谱、Prolog 语言
- 优点：可解释性强，逻辑严密
- 缺点：难以处理模糊信息，知识获取瓶颈
- 现代应用：知识图谱、规则引擎、可解释 AI

**2. 连接主义（Connectionism）——"神经网络派"**
- 核心思想：智能 = 模拟大脑神经元连接
- 代表技术：神经网络、深度学习
- 优点：能从数据中自动学习特征，处理复杂模式
- 缺点：可解释性差，需要大量数据和算力
- 现代应用：几乎所有的深度学习应用

**3. 行为主义（Actionism）——"控制论派"**
- 核心思想：智能 = 感知-行动的反馈循环
- 代表技术：强化学习、机器人学
- 优点：能处理动态环境，自主学习策略
- 缺点：训练困难，奖励设计复杂
- 现代应用：游戏 AI（AlphaGo）、机器人控制、自动驾驶

**今天的主流是连接主义**，特别是以 Transformer 为代表的深度学习架构。但符号主义和强化学习也在与深度学习融合，形成更强大的混合方法。

### 1.3 AI 能解决的核心问题类型

从工程视角看，AI 主要解决以下几类问题：

| 问题类型 | 描述 | 典型任务 | 常用算法 |
|---------|------|---------|---------|
| 分类 | 把输入划分到预定义类别 | 垃圾邮件识别、图像分类 | 逻辑回归、CNN、BERT |
| 回归 | 预测连续数值 | 房价预测、销量预测 | 线性回归、XGBoost |
| 聚类 | 无监督分组 | 用户分群、异常检测 | K-Means、DBSCAN |
| 生成 | 创造新内容 | 文本生成、图像生成 | GPT、Stable Diffusion |
| 排序 | 给候选项排序 | 搜索排序、推荐排序 | LambdaMART、深度推荐 |
| 检测 | 定位感兴趣目标 | 目标检测、人脸检测 | YOLO、Faster R-CNN |
| 分割 | 像素级分类 | 医学图像分割、自动驾驶 | U-Net、Mask R-CNN |
| 决策 | 选择最优行动 | 游戏AI、推荐策略 | DQN、PPO、A3C |

理解这些问题类型，能帮助你在面对实际需求时，快速判断"这是一个什么类型的 AI 问题"。

## 二、Python 在 AI 中的核心地位

### 2.1 为什么是 Python

为什么 AI 领域几乎统一选择了 Python？这不是偶然，而是多方面因素共同作用的结果。

**1. 语法简洁，专注于算法而非语法**
Python 的语法非常接近伪代码，这让研究人员能把精力集中在算法本身，而不是语言细节上。对比同样实现一个神经网络的前向传播：

\`\`\`python
# Python 版本 —— 简洁清晰
import numpy as np
def forward(x, w, b):
    return np.maximum(0, np.dot(x, w) + b)  # ReLU 激活
\`\`\`

\`\`\`java
// Java 版本 —— 冗长
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.nd4j.linalg.ops.transforms.Transforms;
public class NeuralNet {
    public static INDArray forward(INDArray x, INDArray w, INDArray b) {
        INDArray z = x.mmul(w).addi(b);
        return Transforms.relu(z, true);
    }
}
\`\`\`

在快速迭代的研究场景中，Python 的简洁性带来了巨大的效率提升。

**2. 生态极其丰富**
Python 拥有 AI 领域最完整的生态链：
- 数值计算：NumPy、SciPy
- 数据处理：Pandas、Polars
- 可视化：Matplotlib、Seaborn、Plotly
- 机器学习：scikit-learn、XGBoost、LightGBM
- 深度学习：PyTorch、TensorFlow、JAX
- 大模型：Transformers、LangChain、LlamaIndex
- 计算机视觉：OpenCV、Pillow、Albumentations
- 自然语言处理：NLTK、spaCy、jieba

**3. "胶水语言"特性**
Python 可以方便地调用 C/C++ 编写的高性能库。AI 计算密集的部分用 C/CUDA 实现，Python 负责上层逻辑和接口。这种"Python 外壳 + C 内核"的模式，兼顾了开发效率和运行效率。

例如 NumPy 的底层是 C 和 Fortran，PyTorch 的核心是 C++ 和 CUDA，但用户接触的都是简洁的 Python API。

**4. 社区和文档完善**
Python AI 社区极其活跃：
- Stack Overflow 上 Python AI 相关问题数量是其他语言总和的数倍
- GitHub 上 AI 项目 80% 以上使用 Python
- 几乎所有 AI 论文都会发布 Python 实现
- 各类教程、课程、书籍丰富

**5. 与 AI 工具链深度集成**
现代 AI 开发工具（Jupyter、Colab、Kaggle）都以 Python 为核心。深度学习框架的官方教程、文档、示例都是 Python 优先。

### 2.2 Python 在 AI 工作流中的角色

Python 不仅仅用于"训练模型"，它贯穿 AI 开发的整个生命周期：

\`\`\`
数据采集 → 数据清洗 → 特征工程 → 模型训练 → 模型评估 → 模型部署 → 监控迭代
   │          │          │          │          │          │          │
 Python    Python     Python     Python     Python     Python     Python
 爬虫/SQL  Pandas    scikit-   PyTorch   matplotlib  FastAPI   Prometheus
                     learn                /seaborn    /ONNX     /Grafana
\`\`\`

**这意味着：掌握 Python，你就拥有了贯穿整个 AI 工作流的能力。** 不需要切换语言，不需要重新学习工具链，这种一致性是其他语言难以匹敌的优势。

### 2.3 Python 的局限性

客观地说，Python 在 AI 中并非没有弱点：

| 局限性 | 影响 | 解决方案 |
|--------|------|---------|
| 运行速度慢 | 不适合高并发推理 | 用 C++/Rust 重写关键路径 |
| GIL 限制 | 难以利用多核 | 用多进程、异步 IO |
| 类型不安全 | 大型项目维护难 | 用 type hints + mypy |
| 部署体积大 | 容器镜像大 | 用 ONNX、TensorRT |
| 移动端支持弱 | 难以部署到手机 | 用 TFLite、CoreML |

**关键认知：** 这些局限主要影响"生产部署"环节，而研究和训练阶段 Python 仍是最佳选择。现代 AI 工程的常见模式是"Python 训练 + C++/Rust 部署"。

## 三、AI 开发的核心技术栈

### 3.1 技术栈全景图

一个完整的 AI 开发技术栈可以分为以下几层：

\`\`\`
┌──────────────────────────────────────────────────────────┐
│  应用层    │ ChatGPT 类应用 / 推荐系统 / 自动驾驶 / ...    │
├──────────────────────────────────────────────────────────┤
│  框架层    │ LangChain / LlamaIndex / HuggingFace         │
├──────────────────────────────────────────────────────────┤
│  模型层    │ PyTorch / TensorFlow / JAX / scikit-learn     │
├──────────────────────────────────────────────────────────┤
│  数据层    │ Pandas / NumPy / Polars / Datasets           │
├──────────────────────────────────────────────────────────┤
│  计算层    │ CUDA / cuDNN / OpenCL / Metal / ROCm         │
├──────────────────────────────────────────────────────────┤
│  硬件层    │ GPU (NVIDIA) / TPU / NPU / CPU               │
└──────────────────────────────────────────────────────────┘
\`\`\`

### 3.2 各层详解

**硬件层 —— AI 的"肌肉"**
- **GPU**：AI 训练的主力，NVIDIA 几乎垄断。H100、A100、V100 是数据中心标配
- **TPU**：Google 专为深度学习设计的芯片，用于 Google Cloud
- **NPU**：神经网络处理器，手机端 AI 推理（如苹果 Neural Engine）
- **CPU**：通用计算，用于小模型推理和数据预处理

**计算层 —— AI 的"驱动"**
- **CUDA**：NVIDIA 的并行计算平台，深度学习的基石
- **cuDNN**：NVIDIA 的深度神经网络库，加速常见操作
- **Metal**：Apple 平台的 GPU 计算框架（MPS）
- **ROCm**：AMD 的 GPU 计算平台

**数据层 —— AI 的"粮食"**
- **NumPy**：多维数组计算，所有 AI 库的基础
- **Pandas**：表格数据处理，数据清洗的瑞士军刀
- **Polars**：新一代 DataFrame 库，比 Pandas 更快
- **Datasets**：HuggingFace 的数据集库，集成海量公开数据

**模型层 —— AI 的"大脑"**
- **PyTorch**：Meta 开源，研究界主流，动态图设计
- **TensorFlow**：Google 开源，工业部署强，静态图优化
- **JAX**：Google 新一代框架，函数式设计，自动微分
- **scikit-learn**：传统机器学习神器，简单易用

**框架层 —— AI 的"工具箱"**
- **Transformers**：HuggingFace 出品，海量预训练模型
- **LangChain**：大模型应用开发框架，链式调用
- **LlamaIndex**：数据增强的 LLM 应用框架
- **FastAPI**：高性能 API 框架，模型部署首选

### 3.3 学习优先级建议

面对这么多技术，新手容易迷茫。以下是按优先级排序的学习建议：

**第一阶段（必学，1-2 个月）：**
1. Python 基础语法（变量、控制流、函数、类）
2. NumPy 数组操作（向量化、广播、索引）
3. Pandas 数据处理（读写、过滤、聚合、合并）
4. Matplotlib 基础可视化

**第二阶段（核心，2-3 个月）：**
5. scikit-learn 传统机器学习（分类、回归、聚类）
6. PyTorch 基础（张量、自动微分、模型定义、训练循环）
7. 经典神经网络（MLP、CNN、RNN）

**第三阶段（进阶，3-6 个月）：**
8. Transformer 架构与注意力机制
9. HuggingFace Transformers 库
10. 大模型微调（LoRA、QLoRA）

**第四阶段（应用，持续）：**
11. LangChain / LlamaIndex 应用开发
12. RAG 检索增强生成
13. Agent 智能体开发
14. 模型部署与优化

## 四、AI 开发的典型工作流

### 4.1 数据科学工作流（CRISP-DM）

\`\`\`
业务理解 → 数据理解 → 数据准备 → 建模 → 评估 → 部署
   ↑                                          │
   └──────────────── 反馈迭代 ←───────────────┘
\`\`\`

**1. 业务理解**
- 明确要解决什么问题
- 定义成功标准（准确率？召回率？业务指标？）
- 评估可行性（数据是否可用？算力是否足够？）

**2. 数据理解**
- 探索性数据分析（EDA）
- 评估数据质量（缺失值、异常值、分布）
- 发现数据中的模式和关系

**3. 数据准备**
- 数据清洗（去重、填补缺失、处理异常）
- 特征工程（特征提取、特征选择、特征变换）
- 数据集划分（训练集、验证集、测试集）

**4. 建模**
- 选择模型算法
- 训练模型并调参
- 交叉验证

**5. 评估**
- 评估模型性能
- 业务指标对齐
- 错误分析

**6. 部署**
- 模型服务化
- 性能监控
- 持续迭代

### 4.2 大模型应用工作流

随着大模型的兴起，AI 开发出现了新的工作流：

\`\`\`
需求分析 → 模型选择 → Prompt 设计 → 应用开发 → 评估优化 → 上线
                                        │
                                        ├── RAG 知识库
                                        ├── Agent 工具
                                        └── 记忆系统
\`\`\`

这种工作流更轻量，不再需要从头训练模型，而是基于预训练大模型进行应用开发。

## 五、学习路径与建议

### 5.1 三条不同的学习路径

根据你的目标和背景，可以选择不同的路径：

**路径一：AI 研究员路径**
适合：想深入理解算法原理，发表论文，进入研究院
重点：数学基础（线性代数、概率论、微积分）、算法推导、论文复现
时间：1-2 年起步

**路径二：AI 工程师路径**
适合：想在实际业务中应用 AI，解决工程问题
重点：框架使用、模型调优、部署优化、系统设计
时间：6-12 个月见效

**路径三：AI 应用开发者路径**
适合：想快速用大模型构建应用，偏向产品
重点：Prompt 工程、RAG、Agent 开发、LangChain
时间：1-3 个月入门

### 5.2 学习方法建议

**1. 项目驱动学习**
不要只看教程，要在做中学。建议的学习节奏：
- 学完一个知识点 → 立刻做一个迷你项目
- 学完一个模块 → 做一个综合项目
- 学完一个阶段 → 参与一个开源项目或 Kaggle 比赛

**2. 代码优先，理论补充**
AI 领域有个特点：**先跑通代码，再理解原理**。先看到模型能工作，建立信心，再深入数学细节。

**3. 善用 AI 工具辅助学习**
用 ChatGPT / Claude 解释论文、调试代码、设计实验。但要注意：
- 不要让 AI 替你思考
- 要追问"为什么"
- 主动验证 AI 的回答

**4. 建立知识体系**
不要零散地学，要建立知识地图：
- 算法之间有什么联系？（如 CNN 和 Transformer 都是基于注意力/卷积的模式提取）
- 技术演进有什么脉络？（如 RNN → LSTM → Transformer → GPT）
- 不同问题用什么方法？（如表格数据用 XGBoost，图像用 CNN，文本用 Transformer）

### 5.3 常见误区

**误区一：必须先学完所有数学**
❌ 错误：花半年学完线性代数、概率论再开始
✅ 正确：用到什么学什么，在实践中补数学

**误区二：必须从底层实现一切**
❌ 错误：从零实现神经网络、自己写优化器
✅ 正确：先用框架做出东西，再回头理解原理

**误区三：追新逐热，忽视基础**
❌ 错误：每天追新论文，但不会写训练循环
✅ 正确：基础扎实后，再有选择地跟进前沿

**误区四：只看不练**
❌ 错误：看完视频觉得"懂了"，但不写代码
✅ 正确：每个知识点都要有对应的代码实践

## 六、本教程的定位

本教程面向**已有 Python 基础**的开发者，带你进入 AI 开发的世界。我们的目标不是培养研究员，而是培养能**用 AI 解决实际问题**的工程师。

教程特点：
- **代码优先**：每章都有可运行的代码示例
- **原理为辅**：在代码基础上讲清楚"为什么"
- **循序渐进**：从环境搭建到模型部署，逐步深入
- **注重实践**：每章都有真实场景的案例

接下来，我们将从最基础的环境搭建开始，一步步进入 AI 开发的世界。记住：**AI 开发的本质是用数据和算法解决问题，而不是堆砌时髦的名词**。保持务实，保持好奇，你一定能走通这条路。

> 💡 本章的代码示例展示了 AI 技术栈的层级结构和最简单的"神经元"模型，你可以直接运行观察结果。
    `,
    code: `
# =============================================================
# Python 人工智能开发全景概览 —— 演示代码
# 本代码使用纯 Python 标准库，演示以下概念：
# 1. AI 技术栈层级结构
# 2. 简单"神经元"的前向传播（用纯 Python 实现）
# 3. 数据统计分析（机器学习的基础）
# =============================================================

print("=" * 60)
print("  Python 人工智能开发 —— 全景概览演示")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：AI 技术栈层级展示
# -------------------------------------------------------------
print("\\n【第一部分】AI 技术栈层级结构\\n")

# 用嵌套字典表示 AI 技术栈
ai_stack = {
    "应用层": {
        "说明": "面向最终用户的 AI 产品",
        "代表": ["ChatGPT", "推荐系统", "自动驾驶", "智能客服"],
    },
    "框架层": {
        "说明": "封装常见 AI 工作流的工具库",
        "代表": ["LangChain", "LlamaIndex", "HuggingFace Transformers"],
    },
    "模型层": {
        "说明": "实现各类机器学习算法的库",
        "代表": ["PyTorch", "TensorFlow", "scikit-learn", "JAX"],
    },
    "数据层": {
        "说明": "数据加载、清洗、变换的工具",
        "代表": ["NumPy", "Pandas", "Polars", "Datasets"],
    },
    "计算层": {
        "说明": "底层并行计算与加速库",
        "代表": ["CUDA", "cuDNN", "Metal", "ROCm"],
    },
    "硬件层": {
        "说明": "实际执行计算的物理设备",
        "代表": ["GPU", "TPU", "NPU", "CPU"],
    },
}

# 逐层打印技术栈
for level, info in ai_stack.items():
    print(f"  ▸ {level}")
    print(f"      说明：{info['说明']}")
    print(f"      代表：{', '.join(info['代表'])}")
    print()

print("  💡 越往下越底层、越接近硬件；越往上越抽象、越接近业务。")
print("  💡 Python 开发者主要工作在上三层，但理解底层有助于性能优化。")


# -------------------------------------------------------------
# 第二部分：最简单的"神经元" —— 感知机
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第二部分】最简单的神经元：感知机")
print("=" * 60)

# 一个神经元接收多个输入 x1, x2, ...
# 每个输入有一个权重 w1, w2, ...
# 加权求和后加上偏置 b，再经过激活函数
# 输出：f(w·x + b)

def relu(x):
    """ReLU 激活函数：小于 0 输出 0，大于 0 原样输出"""
    # ReLU 是深度学习中最常用的激活函数
    # 公式：max(0, x)
    return max(0, x)

def sigmoid(x):
    """Sigmoid 激活函数：把任意实数压缩到 (0, 1) 区间"""
    # 常用于二分类问题的输出层
    # 公式：1 / (1 + e^(-x))
    # 注意：这里用近似计算避免 import math 也能工作（但实际推荐用 math）
    import math
    return 1 / (1 + math.exp(-x))

def neuron(inputs, weights, bias, activation=relu):
    """
    单个神经元的前向传播
    :param inputs: 输入列表，例如 [0.5, 0.8]
    :param weights: 权重列表，例如 [0.3, -0.6]
    :param bias: 偏置标量
    :param activation: 激活函数
    :return: 神经元的输出
    """
    # 第一步：加权求和
    # zip(inputs, weights) 把两个列表按位置配对
    weighted_sum = sum(x * w for x, w in zip(inputs, weights)) + bias

    # 第二步：经过激活函数
    output = activation(weighted_sum)

    # 打印中间过程，便于理解
    print(f"    输入：{inputs}")
    print(f"    权重：{weights}")
    print(f"    偏置：{bias}")
    print(f"    加权和：{weighted_sum:.4f}")
    print(f"    激活后输出：{output:.4f}")

    return output

# 测试用例 1：用 ReLU 激活
print("\\n▶ 测试 1：ReLU 神经元")
print("  场景：判断一封邮件是否是垃圾邮件（特征：关键词频率）")
# 两个特征：[免费 出现次数, 中奖 出现次数]
result1 = neuron(
    inputs=[0.8, 0.6],      # "免费"出现 0.8 次/词，"中奖"出现 0.6 次/词
    weights=[1.5, 2.0],     # "中奖"权重更高，因为更可疑
    bias=-1.2,              # 偏置：阈值，需要足够多的可疑词才触发
    activation=relu
)
print(f"  → 输出值：{result1:.4f}（>0 表示有垃圾邮件特征）")

# 测试用例 2：用 Sigmoid 激活
print("\\n▶ 测试 2：Sigmoid 神经元")
print("  场景：判断图片是否是猫（输出 0~1 的概率）")
result2 = neuron(
    inputs=[0.7, 0.9, 0.4],   # 三个特征：耳朵尖度、毛发纹理、眼睛形状
    weights=[0.8, 1.2, 0.5],  # 毛发纹理权重最高
    bias=-1.5,
    activation=sigmoid
)
print(f"  → 输出概率：{result2:.4f}（接近 1 表示很可能是猫）")

# 测试用例 3：权重的影响
print("\\n▶ 测试 3：对比不同权重的影响")
print("  场景：同样的输入，不同权重产生不同决策")
base_inputs = [1.0, 1.0, 1.0]
for name, w, b in [
    ("保守权重", [0.3, 0.3, 0.3], -0.5),
    ("激进权重", [1.0, 1.0, 1.0], -0.5),
    ("抑制权重", [-0.5, -0.5, -0.5], 0.5),
]:
    out = neuron(base_inputs, w, b, relu)
    print(f"  → {name}：输出 {out:.4f}")
    print()


# -------------------------------------------------------------
# 第三部分：数据统计分析 —— 机器学习的基础
# -------------------------------------------------------------
print("=" * 60)
print("  【第三部分】数据统计分析（机器学习的基础）")
print("=" * 60)

# 机器学习的第一步永远是"理解数据"
# 这里我们模拟一组学生的考试成绩，演示基本统计

# 模拟数据：10 个学生的数学成绩
math_scores = [78, 85, 92, 65, 88, 71, 95, 80, 76, 89]
english_scores = [82, 79, 88, 70, 92, 75, 90, 85, 78, 86]

print(f"\\n  数学成绩：{math_scores}")
print(f"  英语成绩：{english_scores}")

# 计算基本统计量
def describe(data, name):
    """计算并打印数据的基本统计量"""
    n = len(data)
    mean = sum(data) / n                              # 均值：平均值
    sorted_data = sorted(data)
    median = sorted_data[n // 2] if n % 2 == 1 else \\
              (sorted_data[n // 2 - 1] + sorted_data[n // 2]) / 2  # 中位数
    var = sum((x - mean) ** 2 for x in data) / n      # 方差
    std = var ** 0.5                                   # 标准差
    mn, mx = min(data), max(data)                      # 极值
    rng = mx - mn                                      # 极差

    print(f"\\n  📊 {name}统计：")
    print(f"      样本数：{n}")
    print(f"      均值  ：{mean:.2f}")
    print(f"      中位数：{median:.2f}")
    print(f"      方差  ：{var:.2f}")
    print(f"      标准差：{std:.2f}（越小越稳定）")
    print(f"      最小值：{mn}")
    print(f"      最大值：{mx}")
    print(f"      极差  ：{rng}")
    return {"mean": mean, "std": std, "n": n}

math_stats = describe(math_scores, "数学成绩")
english_stats = describe(english_scores, "英语成绩")

# 计算两科成绩的相关系数（衡量线性相关程度）
# 皮尔逊相关系数 = cov(X,Y) / (std(X) * std(Y))
def pearson_correlation(x, y):
    """计算皮尔逊相关系数"""
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    # 协方差
    cov = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y)) / n
    std_x = (sum((xi - mean_x) ** 2 for xi in x) / n) ** 0.5
    std_y = (sum((yi - mean_y) ** 2 for yi in y) / n) ** 0.5
    return cov / (std_x * std_y)

corr = pearson_correlation(math_scores, english_scores)
print(f"\\n  🔗 数学与英语成绩的相关系数：{corr:.4f}")
if corr > 0.7:
    print("      → 强正相关：数学好的同学英语也倾向于好")
elif corr > 0.3:
    print("      → 弱正相关：有一定关联但不强")
elif corr > -0.3:
    print("      → 几乎不相关")
elif corr > -0.7:
    print("      → 弱负相关")
else:
    print("      → 强负相关：一科好另一科倾向于差")


# -------------------------------------------------------------
# 第四部分：最简单的"学习"过程 —— 线性回归
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第四部分】最简单的"学习"：线性回归")
print("=" * 60)

# 机器学习的本质：从数据中"学"出参数
# 这里演示用梯度下降法拟合一条直线 y = w*x + b

# 生成带噪声的数据：真实关系 y = 2.5*x + 1.0
# 我们让算法从数据中"学"出这个 w 和 b
import random
random.seed(42)  # 固定随机种子，保证结果可复现

# 生成 50 个数据点
true_w, true_b = 2.5, 1.0
data_x = [0.1 * i for i in range(50)]
data_y = [true_w * x + true_b + random.gauss(0, 0.5) for x in data_x]  # 加高斯噪声

print(f"\\n  真实参数：w={true_w}, b={true_b}")
print(f"  数据点数：{len(data_x)}")
print(f"  前 5 个点：{[round(x, 2) for x in data_x[:5]]}")
print(f"  前 5 个标签：{[round(y, 2) for y in data_y[:5]]}")

# 梯度下降法训练
w, b = 0.0, 0.0          # 初始参数从 0 开始
lr = 0.01                 # 学习率
epochs = 100              # 训练轮数

print(f"\\n  初始参数：w={w:.4f}, b={b:.4f}")
print(f"  学习率：{lr}")
print(f"  训练轮数：{epochs}")
print(f"\\n  开始训练...")

for epoch in range(epochs):
    # 计算预测值和误差
    total_loss = 0
    grad_w = 0
    grad_b = 0
    n = len(data_x)

    for x, y in zip(data_x, data_y):
        # 前向传播：预测
        pred = w * x + b
        # 损失：均方误差
        loss = (pred - y) ** 2
        total_loss += loss
        # 反向传播：求梯度
        grad_w += 2 * (pred - y) * x
        grad_b += 2 * (pred - y)

    # 更新参数（梯度下降）
    w -= lr * grad_w / n
    b -= lr * grad_b / n

    # 每 20 轮打印一次进度
    if (epoch + 1) % 20 == 0:
        avg_loss = total_loss / n
        print(f"    轮次 {epoch + 1:3d}：w={w:.4f}, b={b:.4f}, loss={avg_loss:.4f}")

print(f"\\n  ✅ 训练完成！")
print(f"  学到的参数：w={w:.4f}（真实 {true_w}），b={b:.4f}（真实 {true_b}）")
print(f"  误差：w 误差 {abs(w - true_w):.4f}，b 误差 {abs(b - true_b):.4f}")

# 用学到的模型做预测
print(f"\\n  📈 用模型做预测：")
for test_x in [1.0, 2.5, 5.0, 10.0]:
    pred = w * test_x + b
    true_val = true_w * test_x + true_b
    print(f"    x={test_x:5.2f} → 预测 y={pred:.2f}，真实 y={true_val:.2f}")


# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  🎯 本章总结")
print("=" * 60)
print("""
  1. AI 是一个分层领域：AI > 机器学习 > 深度学习 > 生成式 AI
  2. Python 是 AI 领域的事实标准语言，生态完整、简洁高效
  3. AI 技术栈从硬件层到应用层，Python 开发者主要工作在上三层
  4. 机器学习的本质是从数据中"学"参数，本章演示了线性回归
  5. 一个神经元 = 加权求和 + 激活函数，是神经网络的基本单元

  下一章我们将搭建 Python AI 开发环境，正式开始动手实践！
""")
`,
  },
  {
    id: "aipy-env",
    icon: "⚙️",
    group: "AI开发入门",
    title: "Python开发环境搭建",
    content: `
# Python开发环境搭建

## 引言：工欲善其事，必先利其器

在开始 AI 开发之前，搭建一个稳定、高效的开发环境是至关重要的第一步。很多新手在这一步就踩了无数坑：Python 版本不对、pip 装不上包、虚拟环境混乱、IDE 配置错误……这些问题看似琐碎，却会持续消耗你的精力。

本章的目标是帮你**一次性把环境搭好**，让你后续的学习和工作不会被环境问题打断。我们会覆盖：

- Python 解释器的安装与验证
- pip 包管理工具的全面用法
- 虚拟环境的原理与使用
- 主流 IDE（VS Code、PyCharm）的配置
- 常见环境问题的排查

读完本章，你将拥有一个干净、可复现、可管理的 Python AI 开发环境。

## 一、Python 解释器的安装

### 1.1 Python 版本选择

Python 目前有 Python 2 和 Python 3 两个大版本。**Python 2 已于 2020 年停止官方维护**，所有新项目都应该使用 Python 3。

在 Python 3 中，又有多个小版本。对于 AI 开发，版本选择建议：

| 版本 | 状态 | AI 兼容性 | 建议 |
|------|------|-----------|------|
| 3.8 | 维护中 | 良好 | 可用，但不推荐新项目 |
| 3.9 | 维护中 | 良好 | 可用 |
| 3.10 | 维护中 | 优秀 | 推荐 |
| 3.11 | 维护中 | 优秀 | 推荐（性能提升 60%） |
| 3.12 | 稳定 | 优秀 | 强烈推荐 |
| 3.13 | 较新 | 良好 | 早期采用者可尝试 |

**AI 开发推荐版本：Python 3.10 ~ 3.12**。这个范围既保证了性能和新特性，又能确保主流 AI 库（PyTorch、TensorFlow、Transformers 等）都有良好支持。

> ⚠️ 注意：太新的 Python 版本（如 3.13 刚发布时）可能存在 AI 库的兼容性问题，因为部分库需要时间适配。生产环境建议用稳定版本。

### 1.2 各平台安装方法

**Windows 安装：**

1. 访问 https://www.python.org/downloads/ 下载安装包
2. 双击运行安装程序
3. **关键步骤**：勾选 "Add Python to PATH"（务必勾选！）
4. 选择 "Install Now" 或自定义安装路径
5. 安装完成后重启 PowerShell

验证安装：
\`\`\`powershell
python --version
pip --version
\`\`\`

**macOS 安装：**

方式一：使用 Homebrew（推荐）
\`\`\`bash
# 先安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Python
brew install python@3.12

# 验证
python3 --version
\`\`\`

方式二：使用官方安装包
从 https://www.python.org/downloads/ 下载 .pkg 文件，双击安装。

方式三：使用 pyenv（多版本管理，进阶推荐）
\`\`\`bash
brew install pyenv
pyenv install 3.12.0
pyenv global 3.12.0
\`\`\`

**Linux 安装（Ubuntu/Debian）：**

\`\`\`bash
# 更新包索引
sudo apt update

# 安装 Python 3 和 pip
sudo apt install python3 python3-pip python3-venv

# 验证
python3 --version
pip3 --version
\`\`\`

如果需要更新版本的 Python（系统源自带的版本较旧），可以使用 deadsnakes PPA：
\`\`\`bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12 python3.12-venv
\`\`\`

### 1.3 Python 解释器验证

安装完成后，进行以下验证：

\`\`\`bash
# 1. 检查 Python 版本
python3 --version
# 期望输出：Python 3.12.x

# 2. 检查 Python 路径
which python3
# macOS/Linux 期望输出：/usr/local/bin/python3 或 /usr/bin/python3

# 3. 进入交互式解释器
python3
>>> print("Hello, AI!")
>>> import sys
>>> print(sys.version)
>>> exit()
\`\`\`

### 1.4 多版本管理：pyenv

当你需要同时维护多个项目，且它们依赖不同的 Python 版本时，pyenv 是最佳工具。

\`\`\`bash
# 安装 pyenv
curl https://pyenv.run | bash

# 配置 shell（以 zsh 为例）
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# 重启 shell 后
pyenv install --list              # 列出所有可用版本
pyenv install 3.12.0              # 安装指定版本
pyenv versions                    # 查看已安装版本
pyenv global 3.12.0               # 设置全局默认
pyenv local 3.10.13               # 为当前目录设置版本
pyenv shell 3.11.6                # 为当前 shell 设置版本
\`\`\`

## 二、pip 包管理工具

### 2.1 pip 是什么

pip 是 Python 的官方包管理工具，用于安装和管理第三方库。它能：
- 从 PyPI（Python Package Index）安装包
- 管理包的版本和依赖
- 卸载、升级、查询包
- 导出和恢复依赖环境

PyPI 上有超过 50 万个第三方包，几乎所有 AI 相关的库都可以通过 pip 安装。

### 2.2 pip 基础用法

\`\`\`bash
# 安装最新版本
pip install numpy

# 安装指定版本
pip install numpy==1.24.0
pip install "numpy>=1.20,<2.0"

# 升级包
pip install --upgrade numpy
pip install -U numpy

# 卸载包
pip uninstall numpy

# 查看已安装的包
pip list
pip list | grep numpy        # 配合 grep 过滤

# 查看某个包的详细信息
pip show numpy

# 查看过期的包
pip list --outdated

# 搜索包（注意：pip 21+ 移除了 search 命令，建议在 pypi.org 搜索）
\`\`\`

### 2.3 镜像源配置

在国内访问 PyPI 官方源速度很慢，配置国内镜像源能大幅提升下载速度。

**临时使用镜像源：**
\`\`\`bash
pip install numpy -i https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

**永久配置镜像源：**

方式一：命令行配置
\`\`\`bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn
\`\`\`

方式二：手动编辑配置文件
- Linux/macOS: \`~/.pip/pip.conf\` 或 \`~/.config/pip/pip.conf\`
- Windows: \`%APPDATA%\\\\pip\\\\pip.ini\`

\`\`\`ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
\`\`\`

**常用国内镜像源：**

| 镜像源 | URL | 维护方 |
|--------|-----|--------|
| 清华大学 | https://pypi.tuna.tsinghua.edu.cn/simple | 清华 TUNA |
| 阿里云 | https://mirrors.aliyun.com/pypi/simple | 阿里云 |
| 中国科技大学 | https://pypi.mirrors.ustc.edu.cn/simple | USTC |
| 豆瓣 | https://pypi.douban.com/simple | 豆瓣 |
| 华为云 | https://mirrors.huaweicloud.com/repository/pypi/simple | 华为云 |

### 2.4 pip 进阶用法

**批量安装：**
\`\`\`bash
# 从 requirements.txt 安装
pip install -r requirements.txt

# requirements.txt 格式示例：
# numpy==1.24.0
# pandas>=2.0,<3.0
# scikit-learn
# matplotlib~=3.7
\`\`\`

**导出当前环境的依赖：**
\`\`\`bash
pip freeze > requirements.txt
\`\`\`

**只下载不安装（用于离线安装）：**
\`\`\`bash
pip download numpy -d ./packages
pip install --no-index --find-links=./packages numpy
\`\`\`

**安装特定特性（extras）：**
\`\`\`bash
pip install "fastapi[all]"      # 安装 fastapi 及所有可选依赖
pip install "transformers[torch]"  # 安装带 torch 支持的 transformers
\`\`\`

**从 Git 仓库安装：**
\`\`\`bash
pip install git+https://github.com/user/repo.git
pip install git+https://github.com/user/repo.git@v1.0.0
\`\`\`

### 2.5 pip 常见问题

**问题一：pip 版本过旧**
\`\`\`bash
# 升级 pip 自身
pip install --upgrade pip
# 或
python -m pip install --upgrade pip
\`\`\`

**问题二：权限不足**
\`\`\`bash
# 方式一：使用 --user 安装到用户目录
pip install numpy --user

# 方式二：使用虚拟环境（推荐）
python -m venv myenv
source myenv/bin/activate
pip install numpy

# 方式三：使用 sudo（不推荐，可能导致系统问题）
sudo pip install numpy
\`\`\`

**问题三：构建失败**
某些包（如 lxml、Pillow）需要 C 编译器。解决方法：
- Windows：安装 Microsoft C++ Build Tools
- macOS：安装 Xcode Command Line Tools (\`xcode-select --install\`)
- Linux：安装 \`python3-dev\` 和 \`build-essential\`

## 三、虚拟环境

### 3.1 为什么需要虚拟环境

虚拟环境是 Python 开发中**最重要的概念之一**。不使用虚拟环境，你几乎一定会遇到以下问题：

**问题场景：**
- 项目 A 需要 NumPy 1.20，项目 B 需要 NumPy 1.24
- 全局安装的某个包被升级后，其他项目突然不能用了
- 在服务器上部署时，环境与本地不一致
- 不同项目的依赖相互冲突

**虚拟环境的本质：** 一个独立的 Python 运行环境，有自己的解释器、库目录和 pip。不同虚拟环境之间的包互不影响。

\`\`\`
全局 Python 环境
├── /usr/bin/python3
├── /usr/lib/python3.12/site-packages/
│       ├── numpy 1.24
│       └── ...
│
├── 项目A虚拟环境 (venv_a)
│   ├── bin/python
│   └── lib/site-packages/
│       ├── numpy 1.20      ← 项目A专用
│       └── ...
│
└── 项目B虚拟环境 (venv_b)
    ├── bin/python
    └── lib/site-packages/
        ├── numpy 1.24      ← 项目B专用
        └── ...
\`\`\`

### 3.2 venv：Python 自带的虚拟环境

Python 3.3+ 内置了 \`venv\` 模块，无需额外安装。

**创建虚拟环境：**
\`\`\`bash
# 在项目目录下创建名为 .venv 的虚拟环境
python3 -m venv .venv

# 也可以指定 Python 版本
python3.12 -m venv .venv
\`\`\`

**激活虚拟环境：**

macOS/Linux:
\`\`\`bash
source .venv/bin/activate
\`\`\`

Windows (PowerShell):
\`\`\`powershell
.\\.venv\\Scripts\\Activate.ps1
\`\`\`

Windows (CMD):
\`\`\`cmd
.venv\\Scripts\\activate.bat
\`\`\`

**激活后你会看到命令行前缀变化：**
\`\`\`bash
(.venv) user@host:~/project$
\`\`\`

**退出虚拟环境：**
\`\`\`bash
deactivate
\`\`\`

**验证虚拟环境：**
\`\`\`bash
# 激活后，python 和 pip 都指向虚拟环境
which python
# 输出：/Users/user/project/.venv/bin/python

which pip
# 输出：/Users/user/project/.venv/bin/pip

# 安装的包只在虚拟环境中
pip install numpy
python -c "import numpy; print(numpy.__file__)"
\`\`\`

### 3.3 virtualenv：第三方增强版

\`virtualenv\` 是 \`venv\` 的第三方版本，功能更强大：

\`\`\`bash
# 安装
pip install virtualenv

# 创建虚拟环境
virtualenv .venv

# 创建时指定 Python 版本
virtualenv -p python3.12 .venv

# 启用系统站点包（可以访问全局安装的包）
virtualenv --system-site-packages .venv
\`\`\`

### 3.4 conda：科学计算的瑞士军刀

对于 AI 开发，特别是需要管理非 Python 依赖（如 CUDA、MKL）时，conda 是另一个选择。

**Miniconda vs Anaconda：**
- **Miniconda**：精简版，只包含 conda 和 Python，推荐
- **Anaconda**：完整版，预装 1500+ 科学计算包，体积庞大

**conda 基本用法：**
\`\`\`bash
# 创建环境
conda create -n ai-env python=3.12

# 激活环境
conda activate ai-env

# 安装包
conda install numpy pandas scikit-learn
conda install pytorch torchvision -c pytorch

# 退出环境
conda deactivate

# 列出所有环境
conda env list

# 删除环境
conda remove -n ai-env --all

# 导出环境
conda env export > environment.yml

# 从文件创建环境
conda env create -f environment.yml
\`\`\`

**conda vs pip vs venv 对比：**

| 特性 | venv | virtualenv | conda |
|------|------|------------|-------|
| Python 版本 | 仅创建时的版本 | 可指定 | 可指定 |
| 非 Python 依赖 | 不支持 | 不支持 | 支持 |
| 速度 | 快 | 快 | 慢 |
| 包数量 | PyPI 全部 | PyPI 全部 | 较少但精选 |
| 适合场景 | 通用 Python | 通用 Python | 数据科学/AI |
| 体积 | 小 | 小 | 大 |

**建议：** 一般 Web 开发用 venv，AI 开发可以用 conda（特别是需要管理 CUDA 版本时）。

### 3.5 虚拟环境最佳实践

**1. 每个项目一个虚拟环境**
\`\`\`
projects/
├── project_a/
│   ├── .venv/              ← 项目 A 的虚拟环境
│   ├── requirements.txt
│   └── main.py
└── project_b/
    ├── .venv/              ← 项目 B 的虚拟环境
    ├── requirements.txt
    └── main.py
\`\`\`

**2. 将 .venv 加入 .gitignore**
\`\`\`
# .gitignore
.venv/
venv/
env/
__pycache__/
*.pyc
\`\`\`

**3. 用 requirements.txt 记录依赖**
\`\`\`bash
# 激活虚拟环境后
pip freeze > requirements.txt

# 别人 clone 项目后
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
\`\`\`

**4. 命名规范**
- 推荐用 \`.venv\`（隐藏目录，IDE 自动识别）
- 不要用 \`env\`、\`venv\`（可能与系统变量冲突）
- 不要用 \`myenv\`、\`test\`（不专业）

## 四、IDE 选择与配置

### 4.1 VS Code：轻量强大的全能选手

Visual Studio Code 是微软出品的免费编辑器，通过插件可以变成强大的 Python IDE。

**安装：**
- 官网：https://code.visualstudio.com/
- 跨平台：Windows、macOS、Linux

**必装插件：**

| 插件 | 作用 | 必要性 |
|------|------|--------|
| Python | 微软官方 Python 插件 | 必装 |
| Pylance | 类型检查和智能提示 | 必装 |
| Jupyter | 在 VS Code 中运行 Notebook | AI 必装 |
| Python Debugger | 调试工具 | 必装 |
| Black Formatter | 代码格式化 | 推荐 |
| Ruff | 快速 linter | 推荐 |
| GitLens | Git 增强 | 推荐 |
| Remote-SSH | 远程开发 | 按需 |

**AI 开发增强插件：**
- **GitHub Copilot**：AI 代码补全
- **Cursor**：基于 VS Code 的 AI 编辑器
- **Jupyter Cell Tags**：Notebook 标签管理

**配置 Python 解释器：**

1. 按 \`Cmd+Shift+P\`（macOS）或 \`Ctrl+Shift+P\`（Windows）
2. 输入 "Python: Select Interpreter"
3. 选择你的虚拟环境中的 Python

或者点击 VS Code 底部状态栏的 Python 版本号。

**推荐配置（settings.json）：**
\`\`\`json
{
    "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "editor.formatOnSave": true,
    "editor.rulers": [88],
    "files.trimTrailingWhitespace": true,
    "jupyter.askForKernelRestart": false
}
\`\`\`

### 4.2 PyCharm：专业的 Python IDE

PyCharm 是 JetBrains 出品的专业 Python IDE，功能强大但较重。

**版本对比：**

| 特性 | Community（免费） | Professional（付费） |
|------|------------------|---------------------|
| Python 开发 | ✅ | ✅ |
| 调试 | ✅ | ✅ |
| 虚拟环境 | ✅ | ✅ |
| Web 框架 | ❌ | ✅ |
| 数据库工具 | ❌ | ✅ |
| 远程开发 | ❌ | ✅ |
| Jupyter | 部分 | ✅ |
| 科学模式 | ❌ | ✅ |

**AI 开发推荐：**
- 学生/开源作者：申请免费的 Professional
- 个人开发者：Community 足够
- 企业团队：Professional

**PyCharm 配置要点：**

1. **配置解释器：**
   - Settings → Project → Python Interpreter
   - 点击齿轮 → Add → Existing → 选择 .venv/bin/python

2. **启用科学模式（Scientific Mode）：**
   - View → Scientific Mode
   - 适合数据探索，自动排列代码、输出、图表

3. **配置代码风格：**
   - Settings → Editor → Code Style → Python
   - 推荐遵循 PEP 8

### 4.3 Jupyter Notebook：数据探索利器

Jupyter Notebook 是 AI 开发中不可或缺的工具，特别适合：
- 数据探索和可视化
- 模型实验和快速原型
- 教学和技术分享
- 数据分析报告

**安装：**
\`\`\`bash
pip install jupyter
# 或更现代的 JupyterLab
pip install jupyterlab
\`\`\`

**启动：**
\`\`\`bash
jupyter notebook
# 或
jupyter lab
\`\`\`

Jupyter 的详细用法将在后续章节专门介绍。

### 4.4 IDE 选择建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| 学生入门 | VS Code | 免费、轻量、社区好 |
| 数据科学家 | JupyterLab + VS Code | 探索用 Jupyter，工程用 VS Code |
| Web 后端 | PyCharm Professional | 框架集成完善 |
| AI 研究员 | PyCharm Professional + Jupyter | 科学模式强大 |
| 远程开发 | VS Code + Remote-SSH | 远程体验最好 |
| 团队协作 | 视团队习惯 | 统一即可 |

**个人建议：以 VS Code 为主，Jupyter 为辅。** VS Code 通过 Jupyter 插件可以直接在编辑器里运行 .ipynb 文件，几乎覆盖所有场景。

## 五、环境验证清单

完成环境搭建后，运行以下检查清单，确保一切正常：

\`\`\`bash
# 1. Python 版本
python3 --version
# 期望：Python 3.10.x ~ 3.12.x

# 2. pip 可用
pip --version
# 期望：pip 23.x+ 

# 3. 创建测试虚拟环境
python3 -m venv test-env
source test-env/bin/activate

# 4. 安装核心 AI 库（验证 pip 和镜像源）
pip install numpy pandas matplotlib

# 5. 测试导入
python3 -c "import numpy; import pandas; import matplotlib; print('All OK!')"

# 6. 清理
deactivate
rm -rf test-env
\`\`\`

如果以上步骤全部通过，恭喜你，环境搭建完成！

## 六、常见问题排查

### 6.1 "command not found: python"

**原因：** macOS/Linux 上 Python 3 的命令是 \`python3\` 而非 \`python\`。

**解决：**
\`\`\`bash
# 方式一：创建别名
echo 'alias python=python3' >> ~/.bashrc
source ~/.bashrc

# 方式二：安装 python-is-python3 包（Ubuntu）
sudo apt install python-is-python3
\`\`\`

### 6.2 pip 安装包很慢

**原因：** 默认使用 PyPI 官方源，国内访问慢。

**解决：** 配置国内镜像源（见 2.3 节）。

### 6.3 "ModuleNotFoundError: No module named 'xxx'"

**可能原因：**
1. 包未安装 → \`pip install xxx\`
2. 虚拟环境未激活 → \`source .venv/bin/activate\`
3. 安装到了错误的 Python → 用 \`python -m pip install xxx\`
4. Python 版本不兼容 → 检查包的版本要求

**排查步骤：**
\`\`\`bash
# 检查当前 Python
which python
python --version

# 检查包是否安装
pip list | grep xxx

# 检查包的安装位置
python -c "import sys; print(sys.path)"
\`\`\`

### 6.4 多个 Python 版本冲突

**解决：** 使用 pyenv 统一管理，或用虚拟环境隔离。

### 6.5 VS Code 识别不到虚拟环境

**解决：**
1. 确保虚拟环境在项目目录下（如 \`.venv\`）
2. 在 VS Code 中按 \`Cmd+Shift+P\` → "Python: Select Interpreter" → 选择虚拟环境的 Python
3. 检查 settings.json 中的 \`python.defaultInterpreterPath\`

## 七、本章总结

本章我们从零开始搭建了 Python AI 开发环境：

1. **Python 解释器**：选择 3.10~3.12 版本，使用官方安装包或包管理器安装
2. **pip 包管理**：掌握安装、升级、卸载、镜像源配置
3. **虚拟环境**：每个项目独立环境，避免依赖冲突
4. **IDE 选择**：VS Code 为主，Jupyter 辅助，PyCharm 按需
5. **问题排查**：建立基本的调试能力

**关键原则：**
- 永远在虚拟环境中开发
- 永远记录 requirements.txt
- 永远不要用 sudo pip install
- 镜像源能省 90% 的时间

环境搭建是一次性投入，做好之后你会受益终身。下一章我们将深入依赖管理和项目结构，让你的 AI 项目更加专业。

> 💡 本章的代码示例模拟了环境检查的完整流程，你可以直接运行观察输出。
    `,
    code: `
# =============================================================
# Python 开发环境搭建 —— 环境检查演示
# 本代码使用纯 Python 标准库，模拟环境检查工具
# 演示：版本检查、包管理、虚拟环境检测、依赖分析
# =============================================================

import sys
import os
import platform
import importlib
import json
from collections import OrderedDict

print("=" * 60)
print("  Python 开发环境检查工具")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：Python 解释器信息
# -------------------------------------------------------------
print("\\n【第一部分】Python 解释器信息\\n")

def check_python_info():
    """检查 Python 解释器的基本信息"""
    info = {
        "Python 版本": sys.version,
        "Python 版本号": "{}.{}.{}".format(*sys.version_info[:3]),
        "可执行文件路径": sys.executable,
        "平台": sys.platform,
        "操作系统": platform.platform(),
        "架构": platform.machine(),
        "字节序": sys.byteorder,
    }

    for key, value in info.items():
        print(f"  ▸ {key}：{value}")

    # 版本判断
    major, minor = sys.version_info[:2]
    if major < 3:
        print(f"\\n  ❌ 警告：Python {major} 已停止维护，请升级到 Python 3！")
    elif minor < 10:
        print(f"\\n  ⚠️ 提示：Python 3.{minor} 版本较旧，建议升级到 3.10+")
    elif minor <= 12:
        print(f"\\n  ✅ Python 3.{minor} 版本适合 AI 开发")
    else:
        print(f"\\n  ⚠️ Python 3.{minor} 较新，部分 AI 库可能尚未完全支持")

    return info

py_info = check_python_info()


# -------------------------------------------------------------
# 第二部分：sys.path 分析（理解模块搜索路径）
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第二部分】模块搜索路径 (sys.path)")
print("=" * 60)

print("\\n  Python 导入模块时会按以下顺序搜索：\\n")
for i, path in enumerate(sys.path, 1):
    if path:
        print(f"  {i}. {path}")
    else:
        print(f"  {i}. （当前目录）")

print(f"\\n  💡 共 {len(sys.path)} 个搜索路径")
print("  💡 虚拟环境激活后，site-packages 会指向虚拟环境的目录")


# -------------------------------------------------------------
# 第三部分：虚拟环境检测
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第三部分】虚拟环境检测")
print("=" * 60)

def detect_virtual_env():
    """检测当前是否在虚拟环境中"""
    # 方法 1：检查 sys.prefix 和 sys.base_prefix 是否不同
    in_venv = sys.prefix != sys.base_prefix

    # 方法 2：检查环境变量
    venv_path = os.environ.get("VIRTUAL_ENV", "")
    conda_env = os.environ.get("CONDA_PREFIX", "")

    # 方法 3：检查 sys.executable 路径
    exe_path = sys.executable
    is_venv_by_path = (
        ".venv" in exe_path or
        "venv" in exe_path or
        "env" in exe_path or
        "conda" in exe_path.lower()
    )

    print(f"\\n  检测方式 1 - sys.prefix 检查：")
    print(f"    sys.prefix       = {sys.prefix}")
    print(f"    sys.base_prefix  = {sys.base_prefix}")
    print(f"    是否在虚拟环境   = {'是' if in_venv else '否'}")

    print(f"\\n  检测方式 2 - 环境变量检查：")
    print(f"    VIRTUAL_ENV = {venv_path or '（未设置）'}")
    print(f"    CONDA_PREFIX = {conda_env or '（未设置）'}")

    print(f"\\n  检测方式 3 - 解释器路径检查：")
    print(f"    sys.executable = {exe_path}")
    print(f"    路径特征       = {'疑似虚拟环境' if is_venv_by_path else '可能是全局环境'}")

    return in_venv or bool(venv_path) or bool(conda_env)

is_in_venv = detect_virtual_env()

if is_in_venv:
    print("\\n  ✅ 当前在虚拟环境中运行，符合最佳实践")
else:
    print("\\n  ⚠️ 当前可能在使用全局 Python，建议为项目创建虚拟环境")
    print("     命令：python3 -m venv .venv && source .venv/bin/activate")


# -------------------------------------------------------------
# 第四部分：核心包可用性检查
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第四部分】AI 核心包可用性检查")
print("=" * 60)

# 定义 AI 开发常用的包及其用途
ai_packages = {
    # 标准库（一定可用）
    "math": "数学函数（标准库）",
    "statistics": "统计计算（标准库）",
    "json": "JSON 处理（标准库）",
    "csv": "CSV 处理（标准库）",
    "collections": "高级数据结构（标准库）",
    "itertools": "迭代工具（标准库）",
    "functools": "函数工具（标准库）",
    "pathlib": "路径处理（标准库）",
    "typing": "类型提示（标准库）",
    # 第三方库（可能未安装）
    "numpy": "数值计算（AI 基础）",
    "pandas": "数据处理",
    "matplotlib": "数据可视化",
    "sklearn": "机器学习（scikit-learn）",
    "torch": "深度学习（PyTorch）",
    "tensorflow": "深度学习（TensorFlow）",
    "transformers": "大模型库（HuggingFace）",
}

print("\\n  检查结果：\\n")

installed = []
missing = []

for pkg, desc in ai_packages.items():
    try:
        mod = importlib.import_module(pkg)
        version = getattr(mod, "__version__", "（无版本号）")
        file_path = getattr(mod, "__file__", "（内置）")
        print(f"  ✅ {pkg:15s} {version:15s} {desc}")
        installed.append(pkg)
    except ImportError:
        print(f"  ❌ {pkg:15s} {'未安装':15s} {desc}")
        missing.append(pkg)

print(f"\\n  📊 统计：已安装 {len(installed)} 个，缺失 {len(missing)} 个")

if missing:
    print(f"\\n  💡 安装缺失包的命令：")
    # 只显示第三方库的安装命令
    third_party_missing = [p for p in missing if p not in
                          ["math", "statistics", "json", "csv", "collections",
                           "itertools", "functools", "pathlib", "typing"]]
    if third_party_missing:
        cmd = "pip install " + " ".join(third_party_missing)
        print(f"     {cmd}")


# -------------------------------------------------------------
# 第五部分：模拟依赖管理
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第五部分】模拟 requirements.txt 解析")
print("=" * 60)

# 模拟一个 requirements.txt 文件内容
sample_requirements = """
# AI 项目依赖
numpy==1.24.0
pandas>=2.0,<3.0
scikit-learn~=1.3
matplotlib>=3.7
torch>=2.0
# 以下为可选依赖
jupyter
"""

print("\\n  模拟的 requirements.txt 内容：")
print(sample_requirements)

def parse_requirements(content):
    """解析 requirements.txt 格式的内容"""
    requirements = []
    for line in content.strip().split("\\n"):
        line = line.strip()
        # 跳过空行和注释
        if not line or line.startswith("#"):
            continue

        # 解析版本说明符
        # 支持的格式：==, >=, <=, ~=, >, <
        import re
        match = re.match(r"^([a-zA-Z0-9_-]+)\\s*(.*)$", line)
        if match:
            name = match.group(1)
            version_spec = match.group(2).strip()
            requirements.append({
                "name": name,
                "version_spec": version_spec or "（任意版本）",
                "raw": line,
            })
    return requirements

reqs = parse_requirements(sample_requirements)

print("  解析结果：\\n")
print(f"  {'包名':20s} {'版本要求':20s} {'原始行'}")
print(f"  {'-'*20} {'-'*20} {'-'*30}")
for req in reqs:
    print(f"  {req['name']:20s} {req['version_spec']:20s} {req['raw']}")

print(f"\\n  共解析出 {len(reqs)} 个依赖")


# -------------------------------------------------------------
# 第六部分：生成项目结构建议
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第六部分】AI 项目结构建议")
print("=" * 60)

project_structure = """
  推荐的 AI 项目目录结构：

  my-ai-project/
  ├── .venv/                  # 虚拟环境（不提交到 git）
  ├── .gitignore
  ├── README.md               # 项目说明
  ├── requirements.txt        # 依赖列表
  ├── setup.py                # 可选：包安装配置
  ├── pyproject.toml          # 可选：现代项目配置
  │
  ├── data/                   # 数据目录
  │   ├── raw/                # 原始数据（不修改）
  │   ├── processed/          # 处理后的数据
  │   └── external/           # 外部数据
  │
  ├── notebooks/              # Jupyter Notebook
  │   ├── 01_explore.ipynb    # 数据探索
  │   ├── 02_features.ipynb   # 特征工程
  │   └── 03_model.ipynb      # 模型实验
  │
  ├── src/                    # 源代码
  │   ├── __init__.py
  │   ├── data/               # 数据处理
  │   │   ├── load.py
  │   │   └── preprocess.py
  │   ├── features/           # 特征工程
  │   ├── models/             # 模型定义
  │   ├── training/           # 训练代码
  │   └── visualization/      # 可视化
  │
  ├── models/                 # 训练好的模型
  ├── tests/                  # 测试代码
  └── docs/                   # 文档
"""

print(project_structure)


# -------------------------------------------------------------
# 第七部分：环境健康度评分
# -------------------------------------------------------------
print("=" * 60)
print("  【第七部分】环境健康度评分")
print("=" * 60)

score = 0
max_score = 0
checks = []

# 检查 1：Python 版本
max_score += 20
major, minor = sys.version_info[:2]
if major == 3 and 10 <= minor <= 12:
    score += 20
    checks.append(("Python 版本合适", 20, 20, "✅"))
elif major == 3 and minor >= 10:
    score += 15
    checks.append(("Python 版本较新", 15, 20, "⚠️"))
else:
    checks.append(("Python 版本不推荐", 0, 20, "❌"))

# 检查 2：虚拟环境
max_score += 20
if is_in_venv:
    score += 20
    checks.append(("使用虚拟环境", 20, 20, "✅"))
else:
    checks.append(("未使用虚拟环境", 0, 20, "❌"))

# 检查 3：标准库完整
max_score += 20
stdlib_ok = all(importlib.util.find_spec(p) for p in
                ["math", "json", "csv", "collections", "itertools"])
if stdlib_ok:
    score += 20
    checks.append(("标准库完整", 20, 20, "✅"))
else:
    checks.append(("标准库缺失", 0, 20, "❌"))

# 检查 4：第三方 AI 库
max_score += 20
ai_libs = ["numpy", "pandas", "matplotlib"]
ai_installed = sum(1 for p in ai_libs if importlib.util.find_spec(p))
score += int(ai_installed / len(ai_libs) * 20)
checks.append((f"AI 核心库 ({ai_installed}/{len(ai_libs)})",
               int(ai_installed / len(ai_libs) * 20), 20,
               "✅" if ai_installed == len(ai_libs) else "⚠️"))

# 检查 5：路径无中文/空格
max_score += 20
if " " not in sys.executable and not any(ord(c) > 127 for c in sys.executable):
    score += 20
    checks.append(("路径无中文/空格", 20, 20, "✅"))
else:
    checks.append(("路径含中文/空格（可能导致问题）", 10, 20, "⚠️"))
    score += 10

print(f"\\n  检查项明细：\\n")
print(f"  {'检查项':30s} {'得分':>6s} {'满分':>6s} 状态")
print(f"  {'-'*30} {'-'*6} {'-'*6} {'-'*4}")
for name, got, full, status in checks:
    print(f"  {name:30s} {got:>6d} {full:>6d} {status}")

print(f"\\n  📊 总分：{score} / {max_score}")

if score >= 80:
    print("  🎉 环境健康度优秀！可以开始 AI 开发")
elif score >= 60:
    print("  👍 环境基本可用，建议优化部分项目")
else:
    print("  ⚠️ 环境需要改进，请参考本章内容调整")


# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  🎯 本章总结")
print("=" * 60)
print("""
  1. Python AI 开发推荐版本：3.10 ~ 3.12
  2. pip 是包管理工具，配置国内镜像源可大幅提速
  3. 虚拟环境是每个项目的必备，避免依赖冲突
  4. VS Code + Jupyter 是性价比最高的 AI 开发组合
  5. 环境检查应包含：版本、虚拟环境、核心库、路径

  下一章我们将学习更专业的依赖管理和项目结构！
""")
`,
  },
  {
    id: "aipy-deps",
    icon: "📦",
    group: "AI开发入门",
    title: "依赖管理与项目结构",
    content: `
# 依赖管理与项目结构

## 引言：从"能跑"到"专业"

写一个能跑的脚本很容易，但管理一个真实的 AI 项目却复杂得多。当你的项目从 100 行代码增长到 10000 行，当你需要和团队成员协作，当你需要在多台机器上部署——这时候，依赖管理和项目结构就成了决定项目成败的关键。

很多新手 AI 开发者会经历这样的痛苦：
- "在我电脑上能跑啊？" —— 环境不一致
- "pip 装了半天还是报错" —— 依赖冲突
- "这个函数在哪里？" —— 目录结构混乱
- "怎么又升级了？" —— 版本未固定
- "新人入职一周才能跑起来项目" —— 缺乏文档和规范

本章将系统介绍 Python 项目的依赖管理工具和最佳实践，帮你从"能跑"走向"专业"。内容涵盖：

- requirements.txt 的完整用法
- Pipenv：兼顾开发与生产
- Poetry：现代 Python 项目管理之王
- AI 项目的标准目录结构
- 依赖锁定与可复现性

## 一、requirements.txt 详解

### 1.1 什么是 requirements.txt

\`requirements.txt\` 是 Python 社区最通用的依赖声明文件，记录项目依赖的所有第三方包及其版本。它的优点是：
- 简单：纯文本，每行一个包
- 通用：所有 Python 工具都支持
- 标准：pip 官方推荐方式

### 1.2 基本格式

\`\`\`txt
# requirements.txt 示例

# 注释以 # 开头
# 可以指定精确版本
numpy==1.24.0

# 可以指定版本范围
pandas>=2.0,<3.0

# 可以使用兼容版本号（~= 表示兼容小版本）
scikit-learn~=1.3.0    # 等价于 >=1.3.0,<1.4.0

# 可以不指定版本（不推荐，可能导致不可复现）
matplotlib

# 可以安装带 extras 的包
transformers[torch]>=4.30

# 可以从 git 仓库安装
# git+https://github.com/user/repo.git@v1.0.0

# 可以从本地路径安装
# ./my_local_package/
\`\`\`

### 1.3 版本说明符详解

| 说明符 | 含义 | 示例 | 解释 |
|--------|------|------|------|
| \`==\` | 精确版本 | \`numpy==1.24.0\` | 必须是 1.24.0 |
| \`>=\` | 大于等于 | \`numpy>=1.20\` | 1.20 及以上 |
| \`<=\` | 小于等于 | \`numpy<=2.0\` | 2.0 及以下 |
| \`>\` | 大于 | \`numpy>1.20\` | 必须 > 1.20 |
| \`<\` | 小于 | \`numpy<2.0\` | 必须 < 2.0 |
| \`~=\` | 兼容版本 | \`numpy~=1.24\` | >=1.24, <2.0 |
| \`!=\` | 排除版本 | \`numpy!=1.24.1\` | 排除有 bug 的版本 |

**版本号约定（语义化版本）：**
\`\`\`
MAJOR.MINOR.PATCH
   1    . 24 . 0
\`\`\`
- **MAJOR**：不兼容的 API 变更
- **MINOR**：向后兼容的新功能
- **PATCH**：向后兼容的 bug 修复

**建议的版本固定策略：**

| 项目阶段 | 建议 | 原因 |
|---------|------|------|
| 开发阶段 | \`>=\` | 想用最新版 |
| 测试阶段 | \`~=\` | 允许 patch 更新 |
| 生产部署 | \`==\` | 严格固定，确保可复现 |
| 库开发 | \`>=\` | 给用户最大灵活性 |

### 1.4 多环境管理

实际项目通常需要区分开发、测试、生产等不同环境的依赖。

**方式一：多个 requirements 文件**

\`\`\`
requirements/
├── base.txt        # 所有环境通用
├── dev.txt         # 开发环境（测试、格式化工具）
├── test.txt        # 测试环境
└── prod.txt        # 生产环境
\`\`\`

\`\`\`txt
# requirements/dev.txt
-r base.txt              # 引入 base 依赖
pytest>=7.0
black
ruff
ipykernel
\`\`\`

**方式二：使用 extras（pyproject.toml 方式）**

\`\`\`toml
[project.optional-dependencies]
dev = ["pytest", "black", "ruff"]
test = ["pytest", "pytest-cov"]
docs = ["sphinx", "mkdocs"]
\`\`\`

### 1.5 pip freeze 与 pip-compile

**pip freeze 的局限：**
\`\`\`bash
pip freeze > requirements.txt
\`\`\`

这会生成所有已安装包的列表，包括**间接依赖**。结果是一个冗长且难以维护的文件：

\`\`\`txt
# pip freeze 生成的文件（示例片段）
numpy==1.24.0
pandas==2.0.1
python-dateutil==2.8.2      # pandas 的依赖
pytz==2023.3                # pandas 的依赖
six==1.16.0                 # python-dateutil 的依赖
\`\`\`

**更好的方式：pip-tools**

\`\`\`bash
pip install pip-tools

# 编写 requirements.in（只写直接依赖）
echo "numpy" > requirements.in
echo "pandas" >> requirements.in

# 生成锁定的 requirements.txt（包含所有间接依赖）
pip-compile requirements.in

# 同步环境（卸载不在 requirements.txt 中的包）
pip-sync requirements.txt
\`\`\`

\`pip-compile\` 生成的文件示例：
\`\`\`txt
#
# This file is autogenerated by pip-compile with Python 3.12
# To update, run:
#
#    pip-compile requirements.in
#
numpy==1.24.0
    # via
    #   -r requirements.in
    #   pandas
pandas==2.0.1
    # via -r requirements.in
python-dateutil==2.8.2
    # via pandas
\`\`\`

## 二、Pipenv：开发与生产的桥梁

### 2.1 Pipenv 简介

Pipenv 是 Kenneth Reitz（requests 库作者）创建的工具，旨在解决 pip + virtualenv 的痛点。它的核心特点：
- 自动管理虚拟环境
- 用 \`Pipfile\` 替代 \`requirements.txt\`
- 用 \`Pipfile.lock\` 保证可复现性
- 区分开发和生产依赖

### 2.2 安装与基本用法

\`\`\`bash
# 安装
pip install pipenv

# 在项目目录下初始化
cd my-project
pipenv --python 3.12

# 安装包
pipenv install numpy pandas
pipenv install --dev pytest black    # 开发依赖

# 卸载包
pipenv uninstall numpy

# 进入虚拟环境 shell
pipenv shell

# 在虚拟环境中运行命令
pipenv run python script.py
pipenv run jupyter notebook
\`\`\`

### 2.3 Pipfile 与 Pipfile.lock

**Pipfile：** 人类可读的项目依赖声明
\`\`\`toml
[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
numpy = "*"
pandas = ">=2.0"
scikit-learn = "==1.3.0"

[dev-packages]
pytest = "*"
black = "*"
ruff = "*"

[requires]
python_version = "3.12"
\`\`\`

**Pipfile.lock：** 机器生成的精确锁定文件
\`\`\`json
{
    "_meta": {
        "hash": {"sha256": "..."},
        "pipfile-spec": 6,
        "requires": {"python_version": "3.12"},
        "sources": [{"name": "pypi", "url": "...", "verify_ssl": true}]
    },
    "default": {
        "numpy": {
            "hashes": ["sha256:..."],
            "index": 0,
            "version": "==1.24.0"
        }
    },
    "develop": {
        "pytest": {
            "hashes": ["sha256:..."],
            "version": "==7.4.0"
        }
    }
}
\`\`\`

### 2.4 Pipenv 的优缺点

**优点：**
- 自动管理虚拟环境，无需手动 activate
- Pipfile 清晰区分开发和生产依赖
- Pipfile.lock 保证可复现性
- 内置安全检查（\`pipenv check\`）

**缺点：**
- 速度较慢（依赖解析）
- 与某些工具集成不佳
- 社区活跃度下降
- 复杂依赖场景下可能出错

## 三、Poetry：现代 Python 项目管理之王

### 3.1 Poetry 简介

Poetry 是目前最流行的现代 Python 项目管理工具，集成了：
- 依赖管理
- 虚拟环境管理
- 包构建与发布
- 版本锁定

相比 Pipenv，Poetry 速度更快、功能更全、社区更活跃。

### 3.2 安装 Poetry

\`\`\`bash
# 官方推荐安装方式
curl -sSL https://install.python-poetry.org | python3 -

# 或用 pip
pip install poetry

# 配置 shell 补全（zsh）
poetry completions zsh > ~/.zfunc/_poetry

# 验证
poetry --version
\`\`\`

### 3.3 创建新项目

\`\`\`bash
# 创建新项目
poetry new my-ai-project

# 生成的结构：
# my-ai-project/
# ├── pyproject.toml
# ├── README.md
# ├── my_ai_project/
# │   └── __init__.py
# └── tests/
#     └── test_my_ai_project.py

# 或者在现有项目初始化
cd existing-project
poetry init
\`\`\`

### 3.4 pyproject.toml 详解

\`\`\`toml
[tool.poetry]
name = "my-ai-project"
version = "0.1.0"
description = "A Python AI project"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
packages = [{include = "my_ai_project"}]

[tool.poetry.dependencies]
python = "^3.10"
numpy = "^1.24"
pandas = "^2.0"
scikit-learn = "^1.3"
matplotlib = "^3.7"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
ruff = "^0.1"
ipykernel = "^6.25"

[tool.poetry.group.docs.dependencies]
mkdocs = "^1.5"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
\`\`\`

**关键概念：**
- \`[tool.poetry.dependencies]\`：运行时必需依赖
- \`[tool.poetry.group.X.dependencies]\`：可选依赖组（如 dev、docs）
- \`python = "^3.10"\`：要求 Python 3.10+，但 < 4.0

### 3.5 Poetry 常用命令

\`\`\`bash
# 添加依赖
poetry add numpy
poetry add pandas@^2.0        # 指定版本范围
poetry add "torch>=2.0,<3.0"  # 复杂版本

# 添加开发依赖
poetry add --group dev pytest black

# 移除依赖
poetry remove numpy

# 安装所有依赖
poetry install
poetry install --with dev         # 包括 dev 组
poetry install --without dev      # 不包括 dev 组

# 更新依赖
poetry update
poetry update numpy               # 只更新 numpy

# 查看依赖树
poetry show --tree

# 运行命令
poetry run python script.py
poetry run python -m pytest

# 进入 shell
poetry shell

# 构建包
poetry build

# 发布到 PyPI
poetry publish
\`\`\`

### 3.6 poetry.lock 文件

\`poetry.lock\` 类似 \`Pipfile.lock\`，记录所有依赖的精确版本和哈希值。

**最佳实践：**
- **应用程序项目**：提交 \`poetry.lock\` 到 git，保证所有环境一致
- **库项目**：不提交 \`poetry.lock\`，让用户自行解析

### 3.7 Poetry vs Pipenv vs pip+venv 对比

| 特性 | pip + venv | Pipenv | Poetry |
|------|-----------|--------|--------|
| 学习曲线 | 低 | 中 | 中 |
| 虚拟环境管理 | 手动 | 自动 | 自动 |
| 依赖解析 | 弱 | 一般 | 强 |
| 速度 | 快 | 慢 | 快 |
| 包构建发布 | 不支持 | 不支持 | 支持 |
| 社区活跃度 | 高 | 低 | 高 |
| 现代化程度 | 低 | 中 | 高 |
| 推荐度 | ★★★ | ★★ | ★★★★★ |

**选择建议：**
- **个人小项目**：pip + venv 足够
- **团队项目**：Poetry 是首选
- **库开发**：Poetry（支持发布）
- **遗留项目**：保持原工具，不盲目迁移

## 四、uv：新一代极速工具

### 4.1 uv 简介

uv 是 Astral 公司（ruff 的作者）用 Rust 编写的 Python 包管理工具，号称比 pip 快 10-100 倍。

\`\`\`bash
# 安装
curl -LsSf https://astral.sh/uv/install.sh | sh

# 基本用法（替代 pip）
uv pip install numpy
uv pip install -r requirements.txt

# 创建虚拟环境
uv venv

# 同步依赖
uv pip sync requirements.txt
\`\`\`

### 4.2 uv 的优势

- **极致速度**：安装大型依赖快 10-100 倍
- **全局缓存**：相同包只下载一次
- **兼容性**：与 pip 命令兼容
- **磁盘节省**：硬链接机制节省空间

适合大型 AI 项目（如 PyTorch + Transformers 这类几百 MB 的依赖）。

## 五、AI 项目目录结构最佳实践

### 5.1 标准项目结构

借鉴 Cookiecutter Data Science（简称 CCDS）模板，AI 项目推荐以下结构：

\`\`\`
my-ai-project/
├── .venv/                          # 虚拟环境
├── .gitignore
├── .env                            # 环境变量（不提交）
├── .env.example                    # 环境变量示例
├── README.md
├── pyproject.toml                  # 项目配置（推荐）
├── requirements.txt                # 或用此文件
├── requirements-dev.txt
├── Makefile                        # 常用命令
├── Dockerfile                      # 容器化
│
├── data/                           # 数据目录
│   ├── raw/                        # 原始数据（只读）
│   ├── interim/                    # 中间处理数据
│   ├── processed/                  # 最终训练数据
│   └── external/                   # 外部数据源
│
├── notebooks/                      # Jupyter Notebook
│   ├── 01_data_exploration.ipynb
│   ├── 02_feature_engineering.ipynb
│   ├── 03_model_training.ipynb
│   └── 04_model_evaluation.ipynb
│
├── src/                            # 源代码
│   ├── __init__.py
│   ├── data/                       # 数据处理
│   │   ├── __init__.py
│   │   ├── load.py                 # 数据加载
│   │   ├── preprocess.py           # 数据预处理
│   │   └── validate.py             # 数据验证
│   ├── features/                   # 特征工程
│   │   ├── __init__.py
│   │   ├── build_features.py
│   │   └── select_features.py
│   ├── models/                     # 模型
│   │   ├── __init__.py
│   │   ├── base.py                 # 模型基类
│   │   ├── train.py                # 训练逻辑
│   │   ├── predict.py              # 预测逻辑
│   │   └── evaluate.py             # 评估逻辑
│   ├── visualization/              # 可视化
│   │   ├── __init__.py
│   │   └── visualize.py
│   └── utils/                      # 工具函数
│       ├── __init__.py
│       ├── config.py               # 配置管理
│       ├── logger.py               # 日志
│       └── io.py                   # IO 工具
│
├── models/                         # 训练好的模型（gitignore）
│   ├── checkpoints/                # 训练检查点
│   ├── final/                      # 最终模型
│   └── registry/                   # 模型注册表
│
├── configs/                        # 配置文件
│   ├── config.yaml                 # 主配置
│   ├── train.yaml                  # 训练配置
│   └── deploy.yaml                 # 部署配置
│
├── tests/                          # 测试
│   ├── __init__.py
│   ├── test_data.py
│   ├── test_features.py
│   ├── test_models.py
│   └── conftest.py                 # pytest 配置
│
├── scripts/                        # 脚本
│   ├── train.py                    # 训练入口
│   ├── predict.py                  # 预测入口
│   └── download_data.py            # 数据下载
│
├── docs/                           # 文档
│   ├── index.md
│   ├── api.md
│   └── architecture.md
│
└── .github/                        # CI/CD
    └── workflows/
        ├── test.yml
        └── deploy.yml
\`\`\`

### 5.2 关键目录说明

**data/ 目录的分层设计：**

\`\`\`
data/
├── raw/                # 原始数据，绝对不修改
│   ├── train.csv
│   └── test.csv
├── interim/            # 中间处理结果
│   └── cleaned.csv
└── processed/          # 最终训练用的数据
    ├── train_features.npy
    ├── train_labels.npy
    └── feature_names.json
\`\`\`

**为什么要分层？**
- 可追溯：从结果能回溯到原始数据
- 可复现：原始数据不变，结果可复现
- 可调试：出问题时能检查中间步骤
- 可节省：避免重复处理

**notebooks/ 的命名规范：**

\`\`\`
notebooks/
├── 01_data_exploration.ipynb       # 数字前缀表示顺序
├── 02_feature_engineering.ipynb
├── 03_model_training_v1.ipynb
├── 03_model_training_v2.ipynb      # 同一阶段的多个版本
└── exploration/                    # 探索性 notebook（可丢弃）
    └── quick_test.ipynb
\`\`\`

**src/ 的模块化设计：**

每个目录对应一个独立的"阶段"：
- \`data/\`：数据相关
- \`features/\`：特征相关
- \`models/\`：模型相关
- \`visualization/\`：可视化相关

这种分层让代码可复用、可测试。

### 5.3 配置管理

**方式一：YAML 配置文件（推荐）**

\`\`\`yaml
# configs/config.yaml
data:
  raw_path: data/raw/
  processed_path: data/processed/
  train_file: train.csv
  test_file: test.csv

model:
  name: random_forest
  params:
    n_estimators: 100
    max_depth: 10
    random_state: 42

training:
  batch_size: 32
  epochs: 100
  learning_rate: 0.001

logging:
  level: INFO
  file: logs/app.log
\`\`\`

配合 Python 读取：
\`\`\`python
import yaml
with open("configs/config.yaml") as f:
    config = yaml.safe_load(f)
\`\`\`

**方式二：环境变量（敏感信息）**

\`\`\`bash
# .env 文件
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=sk-xxxxxxx
MODEL_PATH=/data/models/latest
\`\`\`

\`\`\`python
# 用 python-dotenv 读取
from dotenv import load_dotenv
load_dotenv()
import os
api_key = os.getenv("API_KEY")
\`\`\`

### 5.4 .gitignore 模板

\`\`\`gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# 虚拟环境
.venv/
venv/
env/
ENV/

# 环境变量
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Jupyter
.ipynb_checkpoints/

# 数据和模型（大文件不提交）
data/raw/
data/processed/
*.csv
*.npy
*.pkl
*.h5
*.pt
*.onnx

# 日志
logs/
*.log

# 构建产物
build/
dist/
*.egg-info/

# 测试
.pytest_cache/
.coverage
htmlcov/

# 操作系统
.DS_Store
Thumbs.db
\`\`\`

### 5.5 Makefile 自动化

\`\`\`makefile
# Makefile 示例
.PHONY: install test lint format clean train predict

install:
\tpoetry install
\tpip install -r requirements.txt

test:
\tpytest tests/ -v --cov=src

lint:
\truff check src/ tests/
\tmypy src/

format:
\tblack src/ tests/
\truff check --fix src/ tests/

clean:
\trm -rf __pycache__ .pytest_cache .coverage htmlcov
\trm -rf data/interim data/processed
\trm -rf models/checkpoints

train:
\tpython scripts/train.py --config configs/train.yaml

predict:
\tpython scripts/predict.py --model models/final/model.pkl

setup:
\tpython -m venv .venv
\tsource .venv/bin/activate
\tpip install -r requirements.txt
\trunipython -m ipykernel install --user --name=my-project
\`\`\`

使用方式：
\`\`\`bash
make install    # 安装依赖
make test       # 运行测试
make train      # 训练模型
make help       # 查看所有命令
\`\`\`

## 六、依赖冲突与解决

### 6.1 什么是依赖冲突

当两个包要求同一个依赖的不兼容版本时，就产生了冲突：

\`\`\`
项目需要：
  ├── 包A → 需要 numpy>=1.20,<2.0
  └── 包B → 需要 numpy>=2.0
\`\`\`

这种情况下，无法同时满足 A 和 B 的要求。

### 6.2 排查冲突

\`\`\`bash
# 用 pip 查看依赖树
pip install pipdeptree
pipdeptree

# 输出示例：
# numpy==1.24.0
#   - pandas==2.0.1 [requires: numpy>=1.21]
#   - scikit-learn==1.3.0 [requires: numpy>=1.17]

# 查看某个包的依赖
pipdeptree -p pandas

# 反向查找（谁依赖了这个包）
pipdeptree -p numpy -r
\`\`\`

### 6.3 解决冲突的策略

**策略一：升级/降级冲突包**
\`\`\`bash
# 如果包 B 支持旧版 numpy，降级 B
pip install "包B<新版本"

# 或者升级包 A 到支持 numpy 2.0 的版本
pip install --upgrade 包A
\`\`\`

**策略二：寻找替代包**
如果包 A 不再维护，可以寻找功能类似的替代品。

**策略三：分环境使用**
如果无法调和，可以为 A 和 B 分别创建虚拟环境。

**策略四：用 Poetry 的依赖解析**
Poetry 的依赖解析更强大，能在很多场景下自动找到兼容版本。

## 七、可复现性保障

### 7.1 为什么要保证可复现性

AI 项目特别强调可复现性：
- **科研**：实验结果必须可复现才能发表
- **工程**：线上模型必须与训练时一致
- **协作**：团队成员必须能复现你的环境
- **调试**：复现问题是修复的前提

### 7.2 可复现性检查清单

\`\`\`markdown
- [ ] Python 版本固定（pyproject.toml 中声明）
- [ ] 依赖版本锁定（poetry.lock 或 requirements.txt 用 ==）
- [ ] 随机种子固定（numpy、torch、random）
- [ ] 数据版本记录（DVC 或 hash）
- [ ] 模型架构记录（配置文件）
- [ ] 训练超参数记录（配置文件）
- [ ] 硬件环境记录（GPU 型号、CUDA 版本）
- [ ] 操作系统记录
\`\`\`

### 7.3 固定随机种子

\`\`\`python
import random
import numpy as np
# import torch  # 如果用 PyTorch

def set_seed(seed=42):
    """固定所有随机种子，保证可复现性"""
    random.seed(seed)
    np.random.seed(seed)
    # torch.manual_seed(seed)
    # torch.cuda.manual_seed_all(seed)
    # torch.backends.cudnn.deterministic = True
    # torch.backends.cudnn.benchmark = False

set_seed(42)
\`\`\`

### 7.4 用 DVC 管理数据和模型

数据和模型文件太大，不适合用 git 管理。DVC（Data Version Control）是解决方案：

\`\`\`bash
# 安装
pip install dvc

# 初始化
dvc init

# 添加数据
dvc add data/raw/train.csv
# 生成 train.csv.dvc（记录文件的哈希），提交这个文件到 git

# 添加模型
dvc add models/final/model.pkl

# 推送到远程存储
dvc remote add -d storage s3://my-bucket/dvc
dvc push

# 拉取数据
dvc pull
\`\`\`

## 八、本章总结

本章系统介绍了 Python AI 项目的依赖管理和项目结构：

1. **requirements.txt**：最通用的依赖管理方式，配合 pip-tools 使用更佳
2. **Pipenv**：自动化程度高，但速度慢
3. **Poetry**：现代 Python 项目管理首选，功能全面
4. **uv**：新一代极速工具，适合大型项目
5. **项目结构**：参考 Cookiecutter Data Science 模板
6. **可复现性**：固定版本、固定随机种子、记录环境

**关键原则：**
- 应用项目锁定依赖版本，库项目给用户灵活性
- 数据分层管理（raw → interim → processed）
- 配置与代码分离
- 大文件用 DVC，小文件用 git

**行动建议：**
1. 为你的下一个 AI 项目使用 Poetry
2. 采用标准目录结构
3. 编写清晰的 README 和 Makefile
4. 用 DVC 管理大型数据和模型

下一章我们将学习 Jupyter Notebook，这是 AI 开发中数据探索和实验的核心工具。

> 💡 本章的代码示例展示了依赖解析、版本兼容性检查和项目结构生成，可以直接运行观察。
    `,
    code: `
# =============================================================
# 依赖管理与项目结构 —— 演示代码
# 本代码使用纯 Python 标准库，演示：
# 1. requirements.txt 解析与依赖树构建
# 2. 版本兼容性检查
# 3. AI 项目结构生成
# 4. 依赖冲突检测
# =============================================================

import re
import json
from collections import defaultdict

print("=" * 60)
print("  Python AI 项目依赖管理演示")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：requirements.txt 解析
# -------------------------------------------------------------
print("\\n【第一部分】requirements.txt 解析\\n")

# 模拟一个 requirements.txt 内容
sample_requirements = """
# AI 项目核心依赖
numpy==1.24.0
pandas>=2.0,<3.0
scikit-learn~=1.3.0
matplotlib>=3.7
torch>=2.0,<3.0
transformers[torch]>=4.30

# 开发工具
pytest>=7.0
black
"""

def parse_version_spec(spec):
    """
    解析版本说明符
    返回：[(操作符, 版本号), ...]
    例如 ">=2.0,<3.0" 返回 [(">=", "2.0"), ("<", "3.0")]
    """
    if not spec or spec == "*":
        return []

    # 用正则匹配所有版本说明符
    pattern = r'(==|!=|>=|<=|~=|>|<)\\s*([0-9][0-9.]*)'
    matches = re.findall(pattern, spec)
    return matches

def parse_requirements(content):
    """解析 requirements.txt 内容"""
    requirements = []
    for line in content.strip().split("\\n"):
        line = line.strip()
        # 跳过空行和注释
        if not line or line.startswith("#"):
            continue

        # 匹配包名和版本说明符
        # 包名允许字母、数字、-、_
        match = re.match(r'^([a-zA-Z0-9_-]+(?:\\[[a-z]+\\])?)\\s*(.*)$', line)
        if match:
            name = match.group(1).split('[')[0]  # 去掉 extras
            extras = re.search(r'\\[([a-z]+)\\]', match.group(1))
            extras = extras.group(1) if extras else None
            version_spec = match.group(2).strip()
            specs = parse_version_spec(version_spec)

            requirements.append({
                "name": name,
                "extras": extras,
                "version_spec": version_spec or "（任意版本）",
                "specs": specs,
                "raw": line,
            })
    return requirements

reqs = parse_requirements(sample_requirements)

print("  解析结果：")
print(f"  {'包名':20s} {'版本要求':25s} {'extras':10s}")
print(f"  {'-'*20} {'-'*25} {'-'*10}")
for req in reqs:
    extras = req['extras'] or '-'
    print(f"  {req['name']:20s} {req['version_spec']:25s} {extras:10s}")

print(f"\\n  共解析出 {len(reqs)} 个直接依赖")


# -------------------------------------------------------------
# 第二部分：版本兼容性检查
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第二部分】版本兼容性检查")
print("=" * 60)

def parse_version(version_str):
    """把版本字符串解析为元组，便于比较"""
    # "1.24.0" -> (1, 24, 0)
    return tuple(int(x) for x in version_str.split('.'))

def compare_versions(v1, v2):
    """比较两个版本号，返回 -1/0/1"""
    t1, t2 = parse_version(v1), parse_version(v2)
    # 补齐长度
    while len(t1) < len(t2):
        t1 = t1 + (0,)
    while len(t2) < len(t1):
        t2 = t2 + (0,)
    if t1 < t2:
        return -1
    elif t1 > t2:
        return 1
    return 0

def is_version_satisfied(version, specs):
    """
    检查版本是否满足所有版本说明符
    :param version: 要检查的版本，如 "1.24.0"
    :param specs: [(操作符, 版本号), ...]
    """
    for op, target in specs:
        cmp = compare_versions(version, target)
        if op == "==" and cmp != 0:
            return False
        elif op == "!=" and cmp == 0:
            return False
        elif op == ">=" and cmp < 0:
            return False
        elif op == "<=" and cmp > 0:
            return False
        elif op == ">" and cmp <= 0:
            return False
        elif op == "<" and cmp >= 0:
            return False
        elif op == "~=":
            # ~= 表示兼容版本：>=target 且 <下一个 major/minor
            # ~=1.3.0 等价于 >=1.3.0,<1.4.0
            # ~=1.3 等价于 >=1.3,<2.0
            target_parts = target.split('.')
            if len(target_parts) >= 2:
                if cmp < 0:
                    return False
                # 计算 < 的上界
                upper = '.'.join(target_parts[:-1])
                upper_parts = upper.split('.')
                upper_parts[-1] = str(int(upper_parts[-1]) + 1)
                upper_version = '.'.join(upper_parts)
                if compare_versions(version, upper_version) >= 0:
                    return False
    return True

# 测试版本兼容性
test_cases = [
    ("1.24.0", [("==", "1.24.0")], True),
    ("1.24.1", [("==", "1.24.0")], False),
    ("2.0.0", [(">=", "2.0"), ("<", "3.0")], True),
    ("3.0.0", [(">=", "2.0"), ("<", "3.0")], False),
    ("1.3.5", [("~=", "1.3.0")], True),
    ("1.4.0", [("~=", "1.3.0")], False),
]

print("\\n  版本兼容性测试：\\n")
for version, specs, expected in test_cases:
    result = is_version_satisfied(version, specs)
    status = "✅" if result == expected else "❌"
    spec_str = ",".join(f"{op}{v}" for op, v in specs)
    print(f"  {status} 版本 {version:10s} 满足 {spec_str:20s} → {result}")


# -------------------------------------------------------------
# 第三部分：依赖树构建与冲突检测
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第三部分】依赖树构建与冲突检测")
print("=" * 60)

# 模拟包的元信息（实际从 PyPI 获取）
# 每个包记录：版本 → 依赖列表
package_registry = {
    "numpy": {
        "1.24.0": [],
        "1.25.0": [],
        "2.0.0": [],
    },
    "pandas": {
        "2.0.0": [("numpy", ">=1.21"), ("python-dateutil", ">=2.8")],
        "2.0.3": [("numpy", ">=1.21"), ("python-dateutil", ">=2.8")],
        "2.1.0": [("numpy", ">=1.22"), ("python-dateutil", ">=2.8")],
    },
    "python-dateutil": {
        "2.8.2": [("six", ">=1.5")],
    },
    "six": {
        "1.16.0": [],
    },
    "scikit-learn": {
        "1.3.0": [("numpy", ">=1.17"), ("scipy", ">=1.3")],
    },
    "scipy": {
        "1.11.0": [("numpy", ">=1.17")],
    },
    "torch": {
        "2.0.0": [("numpy", "")],  # 空字符串表示任意版本
        "2.1.0": [("numpy", "")],
    },
}

# 模拟项目直接依赖
project_deps = [
    ("numpy", "==1.24.0"),
    ("pandas", ">=2.0,<3.0"),
    ("scikit-learn", "==1.3.0"),
    ("torch", ">=2.0,<3.0"),
]

print("\\n  项目直接依赖：")
for name, spec in project_deps:
    print(f"    {name} {spec}")

def find_compatible_version(pkg_name, specs, registry):
    """在注册表中找到满足规格的最新版本"""
    if pkg_name not in registry:
        return None
    versions = sorted(registry[pkg_name].keys(),
                      key=parse_version, reverse=True)
    parsed_specs = parse_version_spec(specs)
    for v in versions:
        if is_version_satisfied(v, parsed_specs):
            return v
    return None

def resolve_dependencies(direct_deps, registry):
    """
    简单的依赖解析器
    返回：{包名: 选中版本} 或 None（冲突时）
    """
    resolved = {}
    conflicts = []

    # 简化处理：直接遍历，不考虑复杂冲突
    for name, spec in direct_deps:
        version = find_compatible_version(name, spec, registry)
        if version:
            resolved[name] = version
        else:
            conflicts.append(f"无法找到 {name} {spec} 的兼容版本")

    # 处理间接依赖（简化版）
    queue = list(resolved.items())
    while queue:
        pkg, ver = queue.pop(0)
        if pkg not in registry:
            continue
        deps = registry[pkg].get(ver, [])
        for dep_name, dep_spec in deps:
            if dep_name in resolved:
                # 检查现有版本是否兼容
                if dep_spec and not is_version_satisfied(
                    resolved[dep_name], parse_version_spec(dep_spec)
                ):
                    conflicts.append(
                        f"冲突：{pkg} 需要 {dep_name} {dep_spec}，"
                        f"但已选 {resolved[dep_name]}"
                    )
            else:
                # 选择一个版本
                ver = find_compatible_version(dep_name, dep_spec, registry)
                if ver:
                    resolved[dep_name] = ver
                    queue.append((dep_name, ver))

    return resolved, conflicts

resolved, conflicts = resolve_dependencies(project_deps, package_registry)

print(f"\\n  依赖解析结果：")
print(f"  {'包名':25s} {'选中版本':15s}")
print(f"  {'-'*25} {'-'*15}")
for name, version in sorted(resolved.items()):
    print(f"  {name:25s} {version:15s}")

print(f"\\n  共解析 {len(resolved)} 个包（直接 + 间接）")

if conflicts:
    print(f"\\n  ⚠️ 发现 {len(conflicts)} 个冲突：")
    for c in conflicts:
        print(f"    - {c}")
else:
    print(f"\\n  ✅ 无依赖冲突")


# -------------------------------------------------------------
# 第四部分：生成 AI 项目结构
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第四部分】AI 项目结构生成器")
print("=" * 60)

def generate_project_structure(project_name, use_poetry=True):
    """生成 AI 项目的目录结构"""
    structure = {
        project_name: {
            "files": [".gitignore", ".env.example", "README.md",
                      "Makefile", "Dockerfile"],
            "dirs": {
                "data": {
                    "files": [".gitkeep"],
                    "dirs": {
                        "raw": {"files": [".gitkeep"], "dirs": {}},
                        "interim": {"files": [".gitkeep"], "dirs": {}},
                        "processed": {"files": [".gitkeep"], "dirs": {}},
                        "external": {"files": [".gitkeep"], "dirs": {}},
                    }
                },
                "notebooks": {
                    "files": ["01_exploration.ipynb", "02_features.ipynb"],
                    "dirs": {}
                },
                "src": {
                    "files": ["__init__.py"],
                    "dirs": {
                        "data": {"files": ["__init__.py", "load.py",
                                          "preprocess.py"], "dirs": {}},
                        "features": {"files": ["__init__.py",
                                              "build_features.py"], "dirs": {}},
                        "models": {"files": ["__init__.py", "train.py",
                                            "predict.py", "evaluate.py"],
                                  "dirs": {}},
                        "visualization": {"files": ["__init__.py",
                                                   "visualize.py"], "dirs": {}},
                        "utils": {"files": ["__init__.py", "config.py",
                                           "logger.py"], "dirs": {}},
                    }
                },
                "models": {
                    "files": [".gitkeep"],
                    "dirs": {
                        "checkpoints": {"files": [".gitkeep"], "dirs": {}},
                        "final": {"files": [".gitkeep"], "dirs": {}}
                    }
                },
                "configs": {
                    "files": ["config.yaml", "train.yaml"],
                    "dirs": {}
                },
                "tests": {
                    "files": ["__init__.py", "conftest.py"],
                    "dirs": {}
                },
                "scripts": {
                    "files": ["train.py", "predict.py"],
                    "dirs": {}
                },
                "docs": {
                    "files": ["index.md"],
                    "dirs": {}
                },
            }
        }
    }
    if use_poetry:
        structure[project_name]["files"].append("pyproject.toml")
    else:
        structure[project_name]["files"].extend(
            ["requirements.txt", "requirements-dev.txt"]
        )
    return structure

def print_structure(structure, indent=0):
    """递归打印项目结构"""
    for name, content in structure.items():
        prefix = "  " * indent
        print(f"{prefix}{name}/")
        # 打印文件
        for f in content.get("files", []):
            print(f"{prefix}  ├── {f}")
        # 递归打印子目录
        subdirs = content.get("dirs", {})
        if subdirs:
            print_structure(subdirs, indent + 1)

project = generate_project_structure("my-ai-project", use_poetry=True)
print("\\n  生成的项目结构：\\n")
print_structure(project)


# -------------------------------------------------------------
# 第五部分：生成 pyproject.toml 模板
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第五部分】生成 pyproject.toml 模板")
print("=" * 60)

def generate_pyproject(project_name, description, author, python_version="3.10"):
    """生成 pyproject.toml 内容"""
    template = f"""[tool.poetry]
name = "{project_name}"
version = "0.1.0"
description = "{description}"
authors = ["{author}"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^{python_version}"
numpy = "^1.24"
pandas = "^2.0"
scikit-learn = "^1.3"
matplotlib = "^3.7"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
ruff = "^0.1"
ipykernel = "^6.25"

[tool.poetry.group.jupyter.dependencies]
jupyter = "^1.0"
ipywidgets = "^8.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
    return template

pyproject_content = generate_pyproject(
    project_name="my-ai-project",
    description="AI 开发项目模板",
    author="Your Name <you@example.com>",
    python_version="3.10"
)
print(pyproject_content)


# -------------------------------------------------------------
# 第六部分：生成 .gitignore 模板
# -------------------------------------------------------------
print("=" * 60)
print("  【第六部分】生成 .gitignore 模板")
print("=" * 60)

gitignore_template = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# 虚拟环境
.venv/
venv/
env/

# 环境变量
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# Jupyter
.ipynb_checkpoints/

# 数据和模型（大文件用 DVC 管理）
data/raw/
data/processed/
*.csv
*.npy
*.pkl
*.pt
*.onnx

# 日志
logs/
*.log

# 测试
.pytest_cache/
.coverage
htmlcov/

# 系统
.DS_Store
Thumbs.db
"""
print(gitignore_template)


# -------------------------------------------------------------
# 第七部分：生成 Makefile 模板
# -------------------------------------------------------------
print("=" * 60)
print("  【第七部分】生成 Makefile 模板")
print("=" * 60)

makefile_template = """.PHONY: install test lint format clean train predict

install:
\tpoetry install
\tpoetry run python -m ipykernel install --user --name=my-ai-project

test:
\tpoetry run pytest tests/ -v --cov=src

lint:
\tpoetry run ruff check src/ tests/
\tpoetry run mypy src/

format:
\tpoetry run black src/ tests/
\tpoetry run ruff check --fix src/ tests/

clean:
\trm -rf __pycache__ .pytest_cache .coverage htmlcov
\trm -rf data/interim data/processed

train:
\tpoetry run python scripts/train.py --config configs/train.yaml

predict:
\tpoetry run python scripts/predict.py --model models/final/model.pkl

setup:
\tpython -m venv .venv
\tsource .venv/bin/activate
\tpip install -r requirements.txt
"""
print(makefile_template)


# -------------------------------------------------------------
# 第八部分：依赖健康度报告
# -------------------------------------------------------------
print("=" * 60)
print("  【第八部分】依赖健康度报告")
print("=" * 60)

# 分析解析后的依赖
report = {
    "总依赖数": len(reqs),
    "固定版本数": sum(1 for r in reqs if "==" in r["version_spec"]),
    "范围版本数": sum(1 for r in reqs
                    if any(op in r["version_spec"]
                          for op in [">=", "<=", "~=", ">", "<"])
                    and "==" not in r["version_spec"]),
    "未指定版本数": sum(1 for r in reqs if r["version_spec"] == "（任意版本）"),
    "有 extras": sum(1 for r in reqs if r["extras"]),
}

print("\\n  依赖健康度分析：\\n")
for key, value in report.items():
    print(f"  ▸ {key}：{value}")

# 评分
score = 100
if report["未指定版本数"] > 0:
    score -= report["未指定版本数"] * 10
if report["固定版本数"] == 0:
    score -= 20

score = max(0, score)
print(f"\\n  📊 依赖健康度评分：{score}/100")

if score >= 90:
    print("  ✅ 依赖管理优秀！版本固定充分")
elif score >= 70:
    print("  👍 依赖管理良好，可以进一步优化")
else:
    print("  ⚠️ 依赖管理需要改进：")
    if report["未指定版本数"] > 0:
        print(f"     - 有 {report['未指定版本数']} 个包未指定版本")
    if report["固定版本数"] == 0:
        print("     - 没有固定任何版本，可能导致不可复现")


# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  🎯 本章总结")
print("=" * 60)
print("""
  1. requirements.txt 是最通用的依赖管理方式
  2. Poetry 是现代 Python 项目管理首选工具
  3. AI 项目应采用标准目录结构（data/src/notebooks/models）
  4. 依赖版本应锁定以保证可复现性
  5. 配置与代码分离，敏感信息用环境变量
  6. 大文件用 DVC，小文件用 git

  下一章我们将学习 Jupyter Notebook，进入数据探索的世界！
""")
`,
  },
  {
    id: "aipy-jupyter",
    icon: "📓",
    group: "AI开发入门",
    title: "Jupyter Notebook开发环境",
    content: `
# Jupyter Notebook 开发环境

## 引言：数据科学家的"实验室"

如果说 Python 是 AI 开发的语言，那么 Jupyter Notebook 就是数据科学家的"实验室"。在这个交互式环境中，你可以：
- 一行一行地执行代码，立即看到结果
- 在代码中穿插 Markdown 文字，记录思路
- 直接在页面中显示图表、表格、图片
- 像写"实验报告"一样组织你的分析流程

Jupyter 的名字来源于它支持的三种核心语言：**Ju**lia、**Pyt**hon、**R**。但实际中，Python 是绝对的主流。

本章将带你全面掌握 Jupyter Notebook 的使用，从安装到高级技巧，让你高效地进行数据探索和模型实验。

## 一、Jupyter 简介与生态

### 1.1 Jupyter 是什么

Jupyter Notebook 是一个**基于网页的交互式计算环境**，让用户能在浏览器中：
- 编写和执行代码
- 添加富文本说明（Markdown）
- 嵌入可视化图表
- 展示数学公式（LaTeX）
- 导出多种格式（HTML、PDF、Markdown）

它的核心特点是**单元格（Cell）**机制：代码和文本被组织成一个个独立的单元格，可以单独执行、修改、重排。

### 1.2 Jupyter 生态

\`\`\`
Jupyter 生态
│
├── Jupyter Notebook    ← 经典版，单文档界面
├── JupyterLab          ← 新一代，多标签 IDE 风格
├── JupyterHub          ← 多用户版本，团队/教学用
├── Jupyter Console     ← 终端版的交互环境
├── Jupyter Book        ← 用 Notebook 写书
├── Voilà               ← 把 Notebook 转为 Web 应用
└── Binder              ← 在线运行 Notebook（无需安装）
\`\`\`

**JupyterLab vs Jupyter Notebook：**

| 特性 | Jupyter Notebook | JupyterLab |
|------|-----------------|------------|
| 界面 | 简洁，单文档 | 现代，多标签 |
| 文件浏览器 | 独立标签页 | 侧边栏 |
| 多 Notebook | 多窗口 | 多标签 |
| 终端 | 独立 | 内置 |
| 扩展系统 | nbextensions | labextensions（更强大） |
| 推荐度 | ★★★ | ★★★★★ |

**建议直接用 JupyterLab**，它是 Notebook 的下一代替代品，功能更强大。

### 1.3 为什么 AI 开发离不开 Jupyter

AI 开发的特点决定了 Jupyter 的不可替代性：

**1. 探索性**
AI 开发大量时间花在"试试看"上：试试这个特征、试试那个模型、试试这组参数。Jupyter 的单元格机制让你能快速试验，无需重跑整个脚本。

**2. 可视化密集**
数据理解、模型评估都需要大量图表。Jupyter 能直接在单元格下方显示 matplotlib 图表，无需保存文件再打开。

**3. 叙事性**
数据分析是一个"讲故事"的过程。Jupyter 让你能把代码、图表、文字说明组合成一份"分析报告"，便于分享和回顾。

**4. 教学友好**
AI 概念复杂，文字难以说清。Jupyter 的"代码 + 输出 + 说明"模式，是 AI 教学的最佳载体。

**5. 社区生态**
Kaggle、Colab、GitHub 都原生支持 Jupyter Notebook。海量公开 Notebook 是学习 AI 的宝库。

## 二、安装与启动

### 2.1 安装 Jupyter

**方式一：pip 安装（推荐）**
\`\`\`bash
# 安装经典 Jupyter Notebook
pip install notebook

# 安装 JupyterLab（推荐）
pip install jupyterlab

# 一次性安装常用数据科学栈
pip install jupyterlab numpy pandas matplotlib scikit-learn
\`\`\`

**方式二：conda 安装**
\`\`\`bash
# Miniconda/Anaconda 自带 Jupyter
conda install jupyterlab

# 或安装完整的数据科学环境
conda install -c conda-forge jupyterlab pandas numpy matplotlib
\`\`\`

**方式三：Docker（适合团队）**
\`\`\`bash
docker run -p 8888:8888 -v $(pwd):/home/jovyan/work jupyter/scipy-notebook
\`\`\`

### 2.2 启动 Jupyter

\`\`\`bash
# 启动 JupyterLab（推荐）
jupyter lab

# 启动经典 Notebook
jupyter notebook

# 指定端口
jupyter lab --port 8889

# 不自动打开浏览器
jupyter lab --no-browser

# 指定工作目录
jupyter lab --notebook-dir=/path/to/dir

# 允许远程访问（配合密码）
jupyter lab --ip='0.0.0.0' --allow-remote
\`\`\`

启动后，浏览器会自动打开 \`http://localhost:8888/lab\`。

### 2.3 配置 Jupyter

**生成配置文件：**
\`\`\`bash
jupyter lab --generate-config
# 生成 ~/.jupyter/jupyter_lab_config.py
\`\`\`

**设置密码（替代 token）：**
\`\`\`bash
jupyter lab password
# 输入两次密码，写入 ~/.jupyter/jupyter_lab_config.json
\`\`\`

**常用配置项：**
\`\`\`python
# ~/.jupyter/jupyter_lab_config.py
c.ServerApp.port = 8888
c.ServerApp.open_browser = True
c.ServerApp.root_dir = '/path/to/your/projects'
c.ServerApp.ip = '0.0.0.0'  # 允许远程访问
\`\`\`

### 2.4 在 VS Code 中使用 Jupyter

VS Code 内置了 Jupyter 支持，无需启动独立服务：

1. 安装 "Jupyter" 扩展
2. 创建 \`.ipynb\` 文件或 \`.py\` 文件
3. 在 .py 文件中使用 \`# %%\` 分隔单元格：
\`\`\`python
# %% 第一个单元格
import numpy as np
data = np.random.randn(100)

# %% 第二个单元格
import matplotlib.pyplot as plt
plt.hist(data)
plt.show()
\`\`\`
4. 点击 "Run Cell" 执行

**VS Code 中 Jupyter 的优势：**
- 集成 IDE 的代码补全、调试
- 支持 Git 版本控制
- 远程开发体验好
- 性能优于浏览器版本

## 三、Notebook 基本使用

### 3.1 单元格类型

Jupyter 有两种主要单元格类型：

**1. 代码单元格（Code Cell）**
\`\`\`python
# 可以执行的 Python 代码
import numpy as np
data = np.random.randn(100)
print(f"均值：{data.mean():.4f}")
print(f"标准差：{data.std():.4f}")
\`\`\`

**2. 文本单元格（Markdown Cell）**
支持完整的 Markdown 语法：

\`\`\`markdown
# 一级标题
## 二级标题

**粗体**、*斜体*、\`行内代码\`

- 列表项 1
- 列表项 2

| 列 1 | 列 2 |
|------|------|
| 内容 | 内容 |

数学公式：$E = mc^2$

$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
\`\`\`

**3. 原始单元格（Raw Cell）**
原始文本，不做任何渲染，用于导出特定格式。

### 3.2 单元格操作

**执行单元格：**
- \`Shift + Enter\`：执行并跳到下一个单元格
- \`Ctrl + Enter\`（macOS: \`Cmd + Enter\`）：执行但留在当前单元格
- \`Alt + Enter\`：执行并在下方插入新单元格

**编辑模式切换：**
- \`Enter\`：从命令模式进入编辑模式
- \`Esc\`：从编辑模式退出到命令模式
- 在命令模式下单元格边框为蓝色，编辑模式下为绿色

**单元格操作（命令模式下）：**
- \`A\`：在上方插入单元格（Above）
- \`B\`：在下方插入单元格（Below）
- \`DD\`：删除单元格（连按两次 D）
- \`Z\`：撤销删除
- \`C\`：复制单元格
- \`V\`：粘贴单元格
- \`X\`：剪切单元格
- \`M\`：转为 Markdown 单元格
- \`Y\`：转为代码单元格
- \`R\`：转为原始单元格

### 3.3 快捷键大全

**编辑模式快捷键：**

| 快捷键 | 作用 | macOS |
|--------|------|-------|
| Ctrl + Enter | 运行当前单元格 | Cmd + Enter |
| Shift + Enter | 运行并跳到下一个 | Shift + Enter |
| Alt + Enter | 运行并新建下方单元格 | Option + Enter |
| Ctrl + Z | 撤销 | Cmd + Z |
| Ctrl + Shift + Z | 重做 | Cmd + Shift + Z |
| Tab | 代码补全 | Tab |
| Shift + Tab | 查看函数文档 | Shift + Tab |
| Ctrl + / | 注释/取消注释 | Cmd + / |
| Ctrl + D | 删除当前行 | Cmd + D |

**命令模式快捷键：**

| 快捷键 | 作用 |
|--------|------|
| A | 上方插入 |
| B | 下方插入 |
| DD | 删除 |
| Z | 撤销删除 |
| C / V / X | 复制/粘贴/剪切 |
| M | 转 Markdown |
| Y | 转代码 |
| H | 显示快捷键帮助 |
| Shift + ↑/↓ | 多选 |
| Shift + M | 合并选中 |

### 3.4 内核管理

**内核（Kernel）**是实际执行代码的进程。每个 Notebook 关联一个内核。

**常见内核操作：**
- **重启内核**：清空所有变量，重新开始（\`Kernel → Restart\`）
- **重启并运行所有**：重启后从上到下执行所有单元格（\`Kernel → Restart & Run All\`）
- **中断**：停止正在运行的代码（\`Kernel → Interrupt\`）
- **关闭**：关闭内核，释放内存

**为什么需要重启内核？**
- 长时间运行后内存泄漏
- 修改了源代码但未生效
- 变量状态混乱
- 测试代码能否从头到尾跑通

**最佳实践：** 提交 Notebook 前，务必 "Restart & Run All"，确保没有隐式依赖。

## 四、魔法命令

Jupyter 提供了一系列"魔法命令"（Magic Commands），以 \`%\` 或 \`%%\` 开头，能大幅提升开发效率。

### 4.1 行魔法与单元格魔法

- **行魔法（Line Magic）**：以单个 \`%\` 开头，作用于单行
- **单元格魔法（Cell Magic）**：以 \`%%\` 开头，作用于整个单元格

### 4.2 常用行魔法

**%run：运行外部 Python 脚本**
\`\`\`python
%run my_script.py
# 脚本中定义的变量和函数会加载到当前 notebook
\`\`\`

**%load：把文件内容加载到单元格**
\`\`\`python
# %load my_script.py
# 执行后，这行会被替换为文件内容
\`\`\`

**%timeit：测量代码执行时间**
\`\`\`python
%timeit sum(range(1000))
# 输出：10000 loops, best of 5: 22.5 µs per loop

%timeit -n 100 -r 5 sum(range(1000))
# 自定义循环次数和重复次数
\`\`\`

**%time：测量单次执行时间**
\`\`\`python
%time result = [x**2 for x in range(1000000)]
# 输出：CPU times: user 85 ms, sys: 12 ms, total: 97 ms
#       Wall time: 97 ms
\`\`\`

**%who / %whos：查看变量**
\`\`\`python
%who       # 列出所有变量名
%who str   # 只列出字符串变量
%whos      # 详细列出变量（含类型和值）
\`\`\`

**%reset：清空所有变量**
\`\`\`python
%reset       # 交互式确认
%reset -f    # 强制清空，不询问
\`\`\`

**%pwd / %cd / %ls：目录操作**
\`\`\`python
%pwd          # 显示当前目录
%cd /path/to  # 切换目录
%ls           # 列出文件
\`\`\`

**%history：查看历史命令**
\`\`\`python
%history              # 显示所有历史
%history -n 5-10      # 显示第 5-10 行
%history -g numpy     # 搜索包含 numpy 的行
\`\`\`

**%env：环境变量**
\`\`\`python
%env                  # 列出所有环境变量
%env PATH             # 查看特定环境变量
%env MY_VAR=value     # 设置环境变量
\`\`\`

### 4.3 常用单元格魔法

**%%time：测量整个单元格时间**
\`\`\`python
%%time
import numpy as np
data = np.random.randn(1000000)
result = data ** 2
\`\`\`

**%%timeit：多次测量单元格**
\`\`\`python
%%timeit
data = list(range(10000))
squares = [x**2 for x in data]
\`\`\`

**%%writefile：把单元格内容写入文件**
\`\`\`python
%%writefile my_module.py
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b
\`\`\`

**%%capture：捕获输出**
\`\`\`python
%%capture captured
import numpy as np
data = np.random.randn(100)
print(f"均值: {data.mean()}")
# 输出被保存到 captured 变量，不显示
# 之后可以用 captured.show() 显示
\`\`\`

**%%bash：执行 bash 命令**
\`\`\`python
%%bash
echo "当前目录: $(pwd)"
ls -la *.csv
wc -l data.csv
\`\`\`

**%%html：渲染 HTML**
\`\`\`python
%%html
<div style="background:linear-gradient(90deg,#667eea,#764ba2);padding:20px;color:white;border-radius:8px;">
  <h3>自定义 HTML 内容</h3>
  <p>可以在 Notebook 中嵌入任意 HTML</p>
</div>
\`\`\`

**%%latex：渲染 LaTeX 公式**
\`\`\`python
%%latex
\\begin{equation}
\\hat{y} = \\sigma\\left(\\sum_{i=1}^{n} w_i x_i + b\\right)
\\end{equation}
\`\`\`

### 4.4 实用魔法命令总结

| 魔法命令 | 类型 | 作用 | 使用频率 |
|---------|------|------|---------|
| %timeit | 行 | 测量代码耗时（多次） | ★★★★★ |
| %%time | 单元格 | 测量整个单元格耗时 | ★★★★★ |
| %who / %whos | 行 | 查看变量 | ★★★★ |
| %reset | 行 | 清空变量 | ★★★★ |
| %run | 行 | 运行外部脚本 | ★★★ |
| %load | 行 | 加载文件到单元格 | ★★★ |
| %pwd / %cd | 行 | 目录操作 | ★★★ |
| %history | 行 | 查看历史 | ★★★ |
| %%writefile | 单元格 | 写入文件 | ★★★ |
| %matplotlib | 行 | 设置 matplotlib 后端 | ★★★ |
| %autoreload | 行 | 自动重载模块 | ★★★ |
| %debug | 行 | 调试模式 | ★★ |
| %env | 行 | 环境变量 | ★★ |

**%matplotlib inline 详解：**
\`\`\`python
%matplotlib inline
# 让 matplotlib 图表直接显示在 Notebook 中
# 这是 AI 开发中最常用的魔法命令之一

%matplotlib notebook
# 交互式图表，可缩放、旋转（适合 3D 图）

%matplotlib widget
# 使用 ipympl 后端，更现代的交互体验
\`\`\`

**%autoreload 详解：**
\`\`\`python
%load_ext autoreload
%autoreload 2
# 自动重载外部模块，修改 .py 文件后无需重启内核
# 对开发自己的库特别有用
\`\`\`

## 五、数据探索流程

### 5.1 EDA（探索性数据分析）标准流程

\`\`\`
1. 加载数据
   ↓
2. 查看概况（shape、dtypes、head、describe）
   ↓
3. 检查数据质量（缺失值、重复、异常）
   ↓
4. 单变量分析（分布、统计量、可视化）
   ↓
5. 双变量分析（相关性、散点图、分组统计）
   ↓
6. 多变量分析（相关性矩阵、PCA、聚类）
   ↓
7. 形成假设，进入特征工程
\`\`\`

### 5.2 Notebook 中的数据探索示例

\`\`\`python
# === 单元格 1：导入库 ===
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
%matplotlib inline

# === 单元格 2：加载数据 ===
df = pd.read_csv('data/raw/train.csv')

# === 单元格 3：查看概况 ===
print(f"数据形状: {df.shape}")
print(f"列名: {df.columns.tolist()}")
df.head()  # 显示前 5 行

# === 单元格 4：数据类型 ===
df.info()  # 显示每列的类型和非空数量

# === 单元格 5：统计描述 ===
df.describe()  # 数值列的统计量

# === 单元格 6：缺失值检查 ===
df.isnull().sum()

# === 单元格 7：单变量分布 ===
df['age'].hist(bins=30)
plt.title('Age Distribution')
plt.show()

# === 单元格 8：相关性分析 ===
df.corr()['target'].sort_values(ascending=False)
\`\`\`

### 5.3 Notebook 工作流最佳实践

**1. 自上而下顺序执行**
- Notebook 应该能从上到下顺序运行
- 避免"先运行第 5 格再运行第 2 格"的混乱

**2. 单一职责**
- 每个 Notebook 聚焦一个主题
- 不要把"数据探索 + 模型训练 + 评估"混在一个 Notebook

**3. 清晰的章节划分**
\`\`\`markdown
## 1. 数据加载
## 2. 数据清洗
## 3. 特征工程
## 4. 模型训练
## 5. 模型评估
\`\`\`

**4. 删除无用单元格**
- 实验过程中的临时代码，最终保留前清理掉
- 避免大量"被注释掉"的代码

**5. 添加说明文字**
- 每个重要步骤前用 Markdown 说明"为什么这么做"
- 关键结果用文字总结

**6. 固定随机种子**
\`\`\`python
import numpy as np
np.random.seed(42)
\`\`\`

## 六、可视化集成

### 6.1 Matplotlib 集成

\`\`\`python
%matplotlib inline
import matplotlib.pyplot as plt
import numpy as np

# 中文显示支持
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建图表
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# 子图 1：折线图
x = np.linspace(0, 10, 100)
axes[0, 0].plot(x, np.sin(x), label='sin')
axes[0, 0].plot(x, np.cos(x), label='cos')
axes[0, 0].legend()
axes[0, 0].set_title('Trigonometric')

# 子图 2：柱状图
axes[0, 1].bar(['A', 'B', 'C', 'D'], [3, 7, 2, 5])
axes[0, 1].set_title('Bar Chart')

# 子图 3：散点图
axes[1, 0].scatter(np.random.randn(100), np.random.randn(100))
axes[1, 0].set_title('Scatter')

# 子图 4：直方图
axes[1, 1].hist(np.random.randn(1000), bins=30)
axes[1, 1].set_title('Histogram')

plt.tight_layout()
plt.show()
\`\`\`

### 6.2 Pandas 内置可视化

\`\`\`python
import pandas as pd
df = pd.DataFrame({
    'A': np.random.randn(100),
    'B': np.random.randn(100) * 2
})

df.plot()              # 折线图
df.plot.hist(bins=20)  # 直方图
df.plot.scatter(x='A', y='B')  # 散点图
df.plot.box()          # 箱线图
\`\`\`

### 6.3 交互式可视化

\`\`\`python
# Plotly：交互式图表
import plotly.express as px
df = px.data.iris()
fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species')
fig.show()

# Altair：声明式可视化
import altair as alt
chart = alt.Chart(df).mark_point().encode(
    x='sepal_width',
    y='sepal_length',
    color='species'
)
chart.display()
\`\`\`

## 七、Notebook 进阶技巧

### 7.1 显示富内容

\`\`\`python
from IPython.display import display, HTML, Image, Markdown, JSON

# 显示 HTML
display(HTML('<h1 style="color:red">Hello</h1>'))

# 显示图片
display(Image(filename='chart.png'))

# 显示 Markdown
display(Markdown('## 标题\\n**粗体** *斜体*'))

# 显示 JSON
display(JSON({'name': 'Alice', 'age': 30}))

# 显示 DataFrame（美化）
import pandas as pd
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
display(df)
\`\`\`

### 7.2 自定义输出格式

\`\`\`python
# 美化 DataFrame 显示
df.style.background_gradient(cmap='Blues')\\
       .highlight_max(color='red')\\
       .format({'price': '\${:.2f}'})

# 设置 Pandas 显示选项
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', 100)
pd.set_option('display.precision', 2)
\`\`\`

### 7.3 调试技巧

**方法一：%debug 魔法命令**
\`\`\`python
# 出错后运行
%debug
# 进入交互式调试器，可以检查变量、调用栈

# 或预设断点
%pdb on  # 出错自动进入调试
\`\`\`

**方法二：在单元格中设置断点**
\`\`\`python
# Python 3.7+
breakpoint()  # 程序执行到这里会暂停
\`\`\`

**方法三：%%prun 性能分析**
\`\`\`python
%%prun
# 分析代码的执行时间和调用次数
result = [sum(range(i)) for i in range(1000)]
\`\`\`

### 7.4 扩展插件

**安装 jupyter_contrib_nbextensions：**
\`\`\`bash
pip install jupyter_contrib_nbextensions
jupyter contrib nbextension install --user
\`\`\`

**推荐扩展：**
- **Table of Contents**：自动生成目录
- **Codefolding**：代码折叠
- **Autopep8**：自动格式化
- **Variable Inspector**：变量检查器
- **ExecuteTime**：显示单元格执行时间
- **Hide input**：隐藏代码只显示输出

**JupyterLab 扩展：**
\`\`\`bash
# 安装 JupyterLab 扩展管理器
pip install jupyterlab-extension-manager

# 在 JupyterLab 中开启扩展管理器
# Settings → Advanced Settings → Extension Manager → enabled: true
\`\`\`

## 八、Notebook 导出与分享

### 8.1 导出格式

\`\`\`bash
# 导出为 HTML
jupyter nbconvert --to html notebook.ipynb

# 导出为 PDF（需要 LaTeX）
jupyter nbconvert --to pdf notebook.ipynb

# 导出为 Markdown
jupyter nbconvert --to markdown notebook.ipynb

# 导出为 Python 脚本
jupyter nbconvert --to script notebook.ipynb

# 导出为幻灯片
jupyter nbconvert --to slides notebook.ipynb --post serve
\`\`\`

### 8.2 隐藏代码只导出结果

\`\`\`bash
# 导出 HTML 时隐藏代码
jupyter nbconvert --to html --no-input notebook.ipynb

# 使用模板
jupyter nbconvert --to html --template hide_input notebook.ipynb
\`\`\`

### 8.3 在线分享

- **GitHub**：直接预览 .ipynb 文件
- **Google Colab**：上传后共享链接
- **Kaggle**：发布为 Kernel
- **nbviewer**：https://nbviewer.jupyter.org/
- **Binder**：让他人在线运行你的 Notebook

### 8.4 Voilà：把 Notebook 变成 Web 应用

\`\`\`bash
pip install voila

# 启动
voila notebook.ipynb
# 浏览器打开 http://localhost:8866/
# 只显示输出，隐藏代码，像 Web 应用一样
\`\`\`

## 九、常见问题与最佳实践

### 9.1 Notebook 变慢怎么办

**原因 1：内存占用过大**
\`\`\`python
# 查看内存使用
%whos  # 查看变量
import sys
print(sys.getsizeof(data) / 1024 / 1024, "MB")

# 释放不需要的变量
del large_data
import gc
gc.collect()
\`\`\`

**原因 2：DataFrame 过大**
\`\`\`python
# 减少内存占用
df = df.astype({'col_int': 'int32', 'col_float': 'float32'})

# 分块读取
for chunk in pd.read_csv('large.csv', chunksize=10000):
    process(chunk)
\`\`\`

**原因 3：图表太多**
\`\`\`python
# 关闭不显示的图表
plt.close('all')
\`\`\`

### 9.2 常见错误排查

| 错误 | 原因 | 解决 |
|------|------|------|
| NameError | 变量未定义 | 检查是否从上到下执行 |
| ModuleNotFoundError | 包未安装 | 在内核对应的虚拟环境安装 |
| Kernel Dead | 内存不足或崩溃 | 重启内核，分批处理 |
| 图表不显示 | 未用 %matplotlib inline | 在 Notebook 开头添加 |
| 中文乱码 | 字体问题 | 配置 matplotlib 中文字体 |

### 9.3 Notebook 最佳实践总结

**1. 结构清晰**
\`\`\`markdown
# 标题
## 1. 数据加载
## 2. 数据探索
## 3. 特征工程
## 4. 模型训练
## 5. 评估
\`\`\`

**2. 可复现**
- 固定随机种子
- 记录包版本
- Restart & Run All 验证

**3. 可读性**
- 添加 Markdown 说明
- 删除实验性代码
- 函数化重复逻辑

**4. 可分享**
- 导出 HTML 分享给非技术人员
- 上传 GitHub 让他人查看
- 用 Binder 让他人在线运行

## 十、本章总结

本章全面介绍了 Jupyter Notebook：

1. **安装与启动**：pip 安装 JupyterLab，命令行启动
2. **基本使用**：单元格操作、快捷键、内核管理
3. **魔法命令**：%timeit、%whos、%%time 等实用命令
4. **数据探索**：EDA 流程、可视化集成
5. **进阶技巧**：富内容显示、调试、扩展插件
6. **导出分享**：多种格式导出、Voilà 转应用

**关键认知：**
- Jupyter 是数据探索的"实验室"，不是生产环境
- Notebook 应该能从头到尾顺序执行
- 善用魔法命令能大幅提升效率
- Notebook 适合探索，不适合生产部署

下一章我们将学习 AI 开发中的核心数据结构，这是后续所有 AI 编程的基础。

> 💡 本章的代码示例模拟了 Notebook 的单元格执行流程、魔法命令和数据探索过程。
    `,
    code: `
# =============================================================
# Jupyter Notebook 开发环境 —— 演示代码
# 本代码使用纯 Python 标准库，模拟 Notebook 的核心功能：
# 1. 单元格执行机制
# 2. 魔法命令模拟
# 3. 数据探索流程
# 4. 可视化输出（文本形式）
# =============================================================

import sys
import time
import random
import math
from collections import OrderedDict

print("=" * 60)
print("  Jupyter Notebook 模拟器")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：模拟 Notebook 单元格机制
# -------------------------------------------------------------
print("\\n【第一部分】模拟 Notebook 单元格机制\\n")

class NotebookKernel:
    """
    模拟 Jupyter Notebook 的内核
    - 维护全局变量空间
    - 顺序执行单元格
    - 记录执行历史
    """
    def __init__(self):
        # 全局变量空间（模拟 notebook 的全局环境）
        self.namespace = {}
        # 执行历史
        self.history = []
        # 已执行的单元格数
        self.cell_count = 0

    def run_cell(self, code, cell_num=None):
        """执行一个单元格的代码"""
        if cell_num is None:
            self.cell_count += 1
            cell_num = self.cell_count

        print(f"\\n{'─' * 50}")
        print(f"📝 Cell [{cell_num}]")
        print(f"{'─' * 50}")
        print(f"In [{cell_num}]: {code[:80]}{'...' if len(code) > 80 else ''}")

        # 记录开始时间
        start_time = time.time()

        try:
            # 执行代码（在 notebook 的命名空间中）
            # 注意：实际 Jupyter 用 exec(code, self.namespace)
            # 这里简化处理，只支持简单语句
            exec(code, self.namespace)
            elapsed = time.time() - start_time

            # 记录历史
            self.history.append({
                "cell": cell_num,
                "code": code,
                "time": elapsed,
                "status": "ok"
            })

            print(f"\\n✅ 执行成功（耗时 {elapsed*1000:.1f} ms）")
            return True
        except Exception as e:
            elapsed = time.time() - start_time
            self.history.append({
                "cell": cell_num,
                "code": code,
                "time": elapsed,
                "status": "error",
                "error": str(e)
            })
            print(f"\\n❌ 执行失败：{e}")
            return False

    def show_variables(self):
        """显示当前所有变量（模拟 %whos）"""
        print("\\n📊 当前变量：")
        print(f"  {'变量名':20s} {'类型':15s} {'值'}")
        print(f"  {'-'*20} {'-'*15} {'-'*30}")
        # 过滤掉内部变量和模块
        user_vars = {k: v for k, v in self.namespace.items()
                    if not k.startswith('_') and not callable(v)
                    and not hasattr(v, '__module__')}
        for name, value in user_vars.items():
            type_name = type(value).__name__
            value_str = str(value)[:30]
            print(f"  {name:20s} {type_name:15s} {value_str}")

    def reset(self):
        """重置内核（模拟 Kernel → Restart）"""
        self.namespace.clear()
        self.history.clear()
        self.cell_count = 0
        print("\\n🔄 内核已重启，所有变量已清空")

# 创建一个 Notebook 内核
kernel = NotebookKernel()

# 执行一系列单元格（模拟真实的 Notebook 使用）
kernel.run_cell("import random\\nimport math")
kernel.run_cell("data = [random.randint(1, 100) for _ in range(20)]")
kernel.run_cell("print('数据:', data)")
kernel.run_cell("mean_val = sum(data) / len(data)\\nprint(f'均值: {mean_val:.2f}')")
kernel.run_cell("squared = [x**2 for x in data]\\nprint(f'平方和: {sum(squared)}')")

# 显示当前变量
kernel.show_variables()


# -------------------------------------------------------------
# 第二部分：模拟魔法命令
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第二部分】模拟魔法命令")
print("=" * 60)

def magic_timeit(code, number=1000, repeat=5):
    """模拟 %timeit 魔法命令"""
    print(f"\\n⏱️  %timeit {code}")
    times = []
    for _ in range(repeat):
        start = time.time()
        for _ in range(number):
            exec(code, {})
        elapsed = (time.time() - start) / number
        times.append(elapsed)

    best = min(times)
    print(f"   {number} loops, best of {repeat}: {best*1e6:.2f} µs per loop")
    return best

def magic_time(code, globals_dict=None):
    """模拟 %time 魔法命令"""
    print(f"\\n⏱️  %time {code}")
    start = time.time()
    result = exec(code, globals_dict or {})
    elapsed = time.time() - start
    print(f"   CPU times: user {elapsed*1000:.1f} ms")
    print(f"   Wall time: {elapsed*1000:.1f} ms")
    return elapsed

def magic_whos(namespace):
    """模拟 %whos 魔法命令"""
    print("\\n📊 %whos - 变量列表：")
    print(f"   {'变量名':15s} {'类型':15s} {'值预览'}")
    print(f"   {'-'*15} {'-'*15} {'-'*30}")
    for name, value in namespace.items():
        if name.startswith('_'):
            continue
        type_name = type(value).__name__
        preview = str(value)[:30]
        print(f"   {name:15s} {type_name:15s} {preview}")

# 测试魔法命令
test_ns = {"x": 42, "name": "AI", "data": [1, 2, 3]}

# %timeit 测试
magic_timeit("sum(range(100))", number=10000)
magic_timeit("[i**2 for i in range(100)]", number=5000)
magic_timeit("'+'.join(str(i) for i in range(50))", number=2000)

# %time 测试
magic_time("result = sum(x**2 for x in range(10000))", test_ns)

# %whos 测试
test_ns["result"] = sum(x**2 for x in range(10000))
magic_whos(test_ns)


# -------------------------------------------------------------
# 第三部分：数据探索流程（EDA）
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第三部分】数据探索流程（EDA）")
print("=" * 60)

# 模拟一个数据集：学生信息
print("\\n📦 加载数据集：student_data.csv（模拟）\\n")

# 模拟数据
random.seed(42)
students = []
for i in range(50):
    students.append({
        "id": 1001 + i,
        "name": f"学生{i+1:02d}",
        "age": random.randint(17, 22),
        "math": random.randint(50, 100),
        "english": random.randint(50, 100),
        "science": random.randint(50, 100),
    })

print("  前 5 行数据：")
print(f"  {'ID':6s} {'姓名':8s} {'年龄':4s} {'数学':4s} {'英语':4s} {'科学':4s}")
print(f"  {'-'*6} {'-'*8} {'-'*4} {'-'*4} {'-'*4} {'-'*4}")
for s in students[:5]:
    print(f"  {s['id']:<6d} {s['name']:8s} {s['age']:<4d} "
          f"{s['math']:<4d} {s['english']:<4d} {s['science']:<4d}")

# 数据概况
print(f"\\n📊 数据概况：")
print(f"  行数: {len(students)}")
print(f"  列数: 6")
print(f"  列名: {list(students[0].keys())}")

# 统计描述
def describe_column(data, col):
    """计算列的统计量"""
    values = [row[col] for row in data]
    n = len(values)
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    std = var ** 0.5
    return {
        "count": n,
        "mean": mean,
        "std": std,
        "min": min(values),
        "max": max(values),
    }

print(f"\\n📈 统计描述：")
print(f"  {'列名':10s} {'count':>6s} {'mean':>8s} {'std':>8s} "
      f"{'min':>5s} {'max':>5s}")
print(f"  {'-'*10} {'-'*6} {'-'*8} {'-'*8} {'-'*5} {'-'*5}")
for col in ["age", "math", "english", "science"]:
    stats = describe_column(students, col)
    print(f"  {col:10s} {stats['count']:>6d} {stats['mean']:>8.2f} "
          f"{stats['std']:>8.2f} {stats['min']:>5d} {stats['max']:>5d}")

# 缺失值检查
print(f"\\n🔍 缺失值检查：")
for col in students[0].keys():
    missing = sum(1 for s in students if s.get(col) is None)
    print(f"  {col:10s}: {missing} 个缺失")


# -------------------------------------------------------------
# 第四部分：可视化（文本形式）
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第四部分】文本可视化（模拟图表）")
print("=" * 60)

def text_histogram(data, bins=10, width=40, title="直方图"):
    """用文本字符绘制直方图"""
    print(f"\\n📊 {title}")

    mn, mx = min(data), max(data)
    bin_width = (mx - mn) / bins
    counts = [0] * bins

    for v in data:
        idx = min(int((v - mn) / bin_width), bins - 1)
        counts[idx] += 1

    max_count = max(counts)
    print(f"  范围: [{mn}, {mx}]，分 {bins} 组\\n")

    for i, count in enumerate(counts):
        lower = mn + i * bin_width
        upper = lower + bin_width
        bar_len = int(count / max_count * width) if max_count > 0 else 0
        bar = "█" * bar_len
        print(f"  [{lower:5.1f}, {upper:5.1f}) │{bar:<{width}s}│ {count}")

def text_scatter(x, y, width=50, height=15, title="散点图"):
    """用文本字符绘制散点图"""
    print(f"\\n📊 {title}")

    x_min, x_max = min(x), max(x)
    y_min, y_max = min(y), max(y)

    # 创建画布
    canvas = [[" " for _ in range(width)] for _ in range(height)]

    # 绘制点
    for xi, yi in zip(x, y):
        col = int((xi - x_min) / (x_max - x_min + 0.001) * (width - 1))
        row = int((y_max - yi) / (y_max - y_min + 0.001) * (height - 1))
        col = max(0, min(width - 1, col))
        row = max(0, min(height - 1, row))
        canvas[row][col] = "●"

    # 打印画布
    print(f"  y_max={y_max:.1f} ┌{'─' * width}┐")
    for row in canvas:
        print(f"           │{''.join(row)}│")
    print(f"  y_min={y_min:.1f} └{'─' * width}┘")
    print(f"           └{'─' * width}┘")
    print(f"           x_min={x_min:.1f}{'':>{width-15}s}x_max={x_max:.1f}")

# 绘制数学成绩直方图
math_scores = [s["math"] for s in students]
text_histogram(math_scores, bins=10, width=30, title="数学成绩分布")

# 绘制数学 vs 英语散点图
english_scores = [s["english"] for s in students]
text_scatter(math_scores, english_scores, title="数学 vs 英语成绩")


# -------------------------------------------------------------
# 第五部分：模拟 Notebook 单元格序列
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第五部分】模拟完整 Notebook 流程")
print("=" * 60)

notebook_cells = [
    ("# === 单元格 1：导入库 ===\\nimport random\\nimport math",
     "Code"),
    ("# === 单元格 2：生成数据 ===\\nrandom.seed(42)\\ndata = [random.gauss(100, 15) for _ in range(100)]",
     "Code"),
    ("# === 单元格 3：查看前 10 个 ===\\nprint('数据:', [round(x, 1) for x in data[:10]])",
     "Code"),
    ("# === 单元格 4：计算统计量 ===\\nmean = sum(data) / len(data)\\nvar = sum((x - mean) ** 2 for x in data) / len(data)\\nstd = var ** 0.5\\nprint(f'均值: {mean:.2f}')\\nprint(f'标准差: {std:.2f}')",
     "Code"),
    ("# === 单元格 5：排序查看分布 ===\\nsorted_data = sorted(data)\\nprint(f'最小值: {sorted_data[0]:.2f}')\\nprint(f'最大值: {sorted_data[-1]:.2f}')\\nprint(f'中位数: {sorted_data[len(sorted_data)//2]:.2f}')",
     "Code"),
    ("# === 单元格 6：分类统计 ===\\nbelow_mean = sum(1 for x in data if x < mean)\\nabove_mean = len(data) - below_mean\\nprint(f'低于均值: {below_mean} 人')\\nprint(f'高于均值: {above_mean} 人')",
     "Code"),
    ("## 分析结论\\n\\n- 数据呈正态分布\\n- 均值约为 100\\n- 大部分数据在 ±2 个标准差内",
     "Markdown"),
]

print("\\n  模拟执行 Notebook（7 个单元格）：\\n")

for i, (code, cell_type) in enumerate(notebook_cells, 1):
    print(f"  ┌─ Cell [{i}] ({cell_type}) ─────────────────")
    # 显示代码（只显示前 3 行）
    for line in code.split("\\n")[:3]:
        print(f"  │ {line}")
    if code.count("\\n") > 3:
        print(f"  │ ... ({code.count(chr(10)) - 2} more lines)")
    print(f"  └{'─' * 40}")
    print(f"    ✅ 执行成功\\n")


# -------------------------------------------------------------
# 第六部分：性能对比（魔法命令实战）
# -------------------------------------------------------------
print("=" * 60)
print("  【第六部分】性能对比（%timeit 实战）")
print("=" * 60)

print("\\n  对比不同方式计算平方和的性能：\\n")

# 方法 1：for 循环
def sum_squares_loop(n):
    total = 0
    for i in range(n):
        total += i ** 2
    return total

# 方法 2：列表推导 + sum
def sum_squares_list(n):
    return sum([i ** 2 for i in range(n)])

# 方法 3：生成器 + sum
def sum_squares_gen(n):
    return sum(i ** 2 for i in range(n))

# 方法 4：数学公式 n(n+1)(2n+1)/6
def sum_squares_formula(n):
    return n * (n + 1) * (2 * n + 1) // 6

methods = [
    ("for 循环", sum_squares_loop),
    ("列表推导", sum_squares_list),
    ("生成器", sum_squares_gen),
    ("数学公式", sum_squares_formula),
]

n = 10000
print(f"  计算 1 到 {n} 的平方和，每种方法运行 1000 次：\\n")

for name, func in methods:
    start = time.time()
    for _ in range(1000):
        result = func(n)
    elapsed = time.time() - start
    print(f"  {name:10s}: {elapsed*1000:.2f} ms (结果: {result})")

print(f"\\n  💡 数学公式比 for 循环快了数百倍！这就是算法的重要性")


# -------------------------------------------------------------
# 第七部分：Notebook 最佳实践提示
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第七部分】Notebook 最佳实践")
print("=" * 60)

best_practices = [
    "✅ 每个 Notebook 聚焦一个主题",
    "✅ 单元格自上而下顺序执行",
    "✅ 添加 Markdown 说明'为什么这么做'",
    "✅ 固定随机种子保证可复现",
    "✅ 提交前 Restart & Run All 验证",
    "✅ 删除实验性代码，保持整洁",
    "✅ 关键结果用文字总结",
    "❌ 不要把所有代码塞到一个单元格",
    "❌ 不要依赖隐式的执行顺序",
    "❌ 不要在 Notebook 中写生产代码",
    "❌ 不要忘记保存（虽然 Jupyter 会自动保存）",
]

print()
for practice in best_practices:
    print(f"  {practice}")


# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  🎯 本章总结")
print("=" * 60)
print("""
  1. Jupyter 是 AI 开发的"实验室"，适合数据探索和实验
  2. JupyterLab 是 Notebook 的现代升级，推荐使用
  3. 魔法命令（%timeit、%whos 等）大幅提升效率
  4. Notebook 应能从头到尾顺序执行
  5. 善用 Markdown 和可视化讲述数据故事
  6. Notebook 适合探索，不适合生产部署

  下一章我们将学习 AI 开发的核心数据结构！
""")
`,
  },
  {
    id: "aipy-data-types",
    icon: "🗂️",
    group: "AI开发入门",
    title: "AI开发核心数据结构",
    content: `
# AI 开发核心数据结构

## 引言：数据结构是 AI 的基石

在 AI 开发中，我们处理的是**数据**。而如何高效地组织、存储、操作数据，就离不开数据结构。选择正确的数据结构，可以让你的代码：
- **更快**：从 O(n) 优化到 O(1)
- **更省内存**：用更少的空间存同样的数据
- **更清晰**：代码意图更明确
- **更 Pythonic**：充分利用 Python 的特性

本章将带你深入理解 Python 核心数据结构在 AI 开发中的应用，并为后续学习 NumPy、Pandas 打下基础。

## 一、Python 核心数据结构回顾

### 1.1 数据结构全景

\`\`\`
Python 内置数据结构
│
├── 序列（Sequence）
│   ├── list   [1, 2, 3]      可变，有序
│   ├── tuple  (1, 2, 3)      不可变，有序
│   ├── str    "hello"        不可变，字符序列
│   └── range  range(10)      不可变，数字序列
│
├── 映射（Mapping）
│   └── dict   {"k": "v"}     可变，键值对
│
├── 集合（Set）
│   ├── set    {1, 2, 3}      可变，无序，唯一
│   └── frozenset             不可变集合
│
└── 其他
    ├── bytes/bytearray       字节序列
    └── collections 模块      高级数据结构
\`\`\`

### 1.2 时间复杂度对比

理解每种操作的时间复杂度，是选择数据结构的基础：

| 操作 | list | dict | set | tuple |
|------|------|------|-----|-------|
| 索引访问 | O(1) | O(1) | - | O(1) |
| 查找（in） | O(n) | O(1) | O(1) | O(n) |
| 插入（尾部） | O(1) | O(1) | O(1) | - |
| 插入（头部） | O(n) | - | - | - |
| 删除 | O(n) | O(1) | O(1) | - |
| 遍历 | O(n) | O(n) | O(n) | O(n) |

**关键认知：**
- 需要频繁查找 → 用 dict 或 set
- 需要保持顺序 → 用 list
- 需要去重 → 用 set
- 数据不可变 → 用 tuple

## 二、列表（List）在 AI 中的应用

### 2.1 列表基础

列表是 Python 最常用的数据结构，在 AI 中无处不在：

\`\`\`python
# 数据集（小型）
samples = [
    {"feature": [1.0, 2.0, 3.0], "label": 0},
    {"feature": [2.0, 3.0, 4.0], "label": 1},
    {"feature": [3.0, 4.0, 5.0], "label": 0},
]

# 模型预测结果
predictions = [0.8, 0.3, 0.9, 0.1, 0.7]

# 训练损失记录
losses = [2.3, 1.8, 1.2, 0.9, 0.7, 0.5]
\`\`\`

### 2.2 列表推导式：AI 中的利器

列表推导式让数据处理代码更简洁：

\`\`\`python
# 传统写法
squares = []
for x in range(10):
    squares.append(x ** 2)

# 列表推导式
squares = [x ** 2 for x in range(10)]

# 带条件过滤
even_squares = [x ** 2 for x in range(10) if x % 2 == 0]

# 多重循环
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]

# 处理数据集
features = [sample["feature"] for sample in samples]
labels = [sample["label"] for sample in samples]
\`\`\`

### 2.3 列表在 AI 中的典型场景

**场景 1：存储时序数据**
\`\`\`python
# 股票价格序列
prices = [100.0, 101.5, 99.8, 102.3, 103.1]

# 计算移动平均
window = 3
moving_avg = [
    sum(prices[i:i+window]) / window
    for i in range(len(prices) - window + 1)
]
\`\`\`

**场景 2：Batch 数据组织**
\`\`\`python
# 把 100 个样本分成 batch_size=32 的批次
data = list(range(100))
batch_size = 32
batches = [data[i:i+batch_size] for i in range(0, len(data), batch_size)]
# 结果：[[0..31], [32..63], [64..95], [96..99]]
\`\`\`

**场景 3：特征工程**
\`\`\`python
# 数值特征
numeric_features = [age, income, score]

# 归一化（min-max）
mn, mx = min(numeric_features), max(numeric_features)
normalized = [(x - mn) / (mx - mn) for x in numeric_features]
\`\`\`

### 2.4 列表的性能陷阱

\`\`\`python
# ❌ 错误：在循环中用 + 拼接列表（每次创建新对象）
result = []
for item in data:
    result = result + [item]  # O(n²) 总复杂度

# ✅ 正确：用 append 或 extend
result = []
for item in data:
    result.append(item)  # O(n) 总复杂度

# ✅ 更好：用列表推导式
result = [item for item in data]
\`\`\`

## 三、字典（Dict）在 AI 中的应用

### 3.1 字典基础

字典是键值对映射，在 AI 中用于：

\`\`\`python
# 模型超参数配置
config = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 100,
    "optimizer": "adam",
    "layers": [128, 64, 10],
}

# 类别标签映射
label_map = {
    0: "猫",
    1: "狗",
    2: "鸟",
}

# 词频统计
word_counts = {
    "the": 5200,
    "is": 3100,
    "at": 1800,
}
\`\`\`

### 3.2 字典推导式

\`\`\`python
# 反转键值
label_map = {0: "猫", 1: "狗", 2: "鸟"}
id2name = label_map
name2id = {v: k for k, v in label_map.items()}
# {"猫": 0, "狗": 1, "鸟": 2}

# 过滤
high_freq = {k: v for k, v in word_counts.items() if v > 2000}

# 转换
squared_values = {k: v**2 for k, v in data.items()}
\`\`\`

### 3.3 字典在 AI 中的典型场景

**场景 1：特征字典**
\`\`\`python
# 用户特征
user_features = {
    "age": 25,
    "gender": "M",
    "city": "Beijing",
    "interests": ["AI", "Music"],
    "purchase_history": [...],
}
\`\`\`

**场景 2：模型参数**
\`\`\`python
# 神经网络的权重
weights = {
    "layer1_w": [[0.1, 0.2], [0.3, 0.4]],
    "layer1_b": [0.0, 0.0],
    "layer2_w": [[0.5, 0.6]],
    "layer2_b": [0.0],
}
\`\`\`

**场景 3：结果聚合**
\`\`\`python
# 统计每个类别的样本数
from collections import Counter
labels = [0, 1, 0, 2, 1, 0, 1, 2, 0]
counts = Counter(labels)
# Counter({0: 4, 1: 3, 2: 2})
\`\`\`

### 3.4 collections 模块的高级字典

**defaultdict：带默认值的字典**
\`\`\`python
from collections import defaultdict

# 分组：按类别把样本分组
samples = [("A", 1), ("B", 2), ("A", 3), ("B", 4), ("A", 5)]
groups = defaultdict(list)
for category, value in samples:
    groups[category].append(value)
# {"A": [1, 3, 5], "B": [2, 4]}

# 计数
word_counts = defaultdict(int)
for word in text.split():
    word_counts[word] += 1
\`\`\`

**OrderedDict：有序字典（Python 3.7+ 普通 dict 已有序）**
\`\`\`python
from collections import OrderedDict
# 主要用于需要保持插入顺序且需要 move_to_end 等操作的场景
\`\`\`

**Counter：计数器**
\`\`\`python
from collections import Counter
text = "the cat sat on the mat the cat"
counts = Counter(text.split())
# Counter({'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1})

# 最常见元素
counts.most_common(2)  # [('the', 3), ('cat', 2)]
\`\`\`

## 四、集合（Set）在 AI 中的应用

### 4.1 集合基础

集合的核心特性是**唯一性**和**快速查找**：

\`\`\`python
# 去重
data = [1, 2, 2, 3, 3, 3, 4]
unique = set(data)  # {1, 2, 3, 4}

# 快速查找（O(1)）
valid_labels = {0, 1, 2, 3, 4}
if label in valid_labels:  # 比 list 快得多
    process(label)
\`\`\`

### 4.2 集合运算

\`\`\`python
set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

# 交集
intersection = set_a & set_b  # {4, 5}

# 并集
union = set_a | set_b  # {1, 2, 3, 4, 5, 6, 7, 8}

# 差集
difference = set_a - set_b  # {1, 2, 3}

# 对称差集（只在其中一个集合中）
symmetric_diff = set_a ^ set_b  # {1, 2, 3, 6, 7, 8}
\`\`\`

### 4.3 集合在 AI 中的典型场景

**场景 1：停用词过滤**
\`\`\`python
stop_words = {"the", "a", "an", "is", "at", "on", "in", "and"}
text = "the quick brown fox jumps over the lazy dog"
words = [w for w in text.split() if w not in stop_words]
# ["quick", "brown", "fox", "jumps", "over", "lazy", "dog"]
\`\`\`

**场景 2：数据去重**
\`\`\`python
# 大量数据中找重复
all_ids = [1001, 1002, 1003, 1001, 1004, 1002]
seen = set()
duplicates = set()
for id_ in all_ids:
    if id_ in seen:
        duplicates.add(id_)
    else:
        seen.add(id_)
\`\`\`

**场景 3：标签集合运算**
\`\`\`python
# 多标签分类中
true_labels = {"cat", "dog", "bird"}
pred_labels = {"cat", "dog", "fish"}

correct = true_labels & pred_labels  # {"cat", "dog"}
missed = true_labels - pred_labels    # {"bird"}
extra = pred_labels - true_labels     # {"fish"}
\`\`\`

## 五、元组（Tuple）的特殊用途

### 5.1 为什么需要不可变

\`\`\`python
# 元组不可变，可以安全地用作字典的键
coordinates = {(35.0, 118.0): "City A", (40.0, 116.0): "City B"}

# 列表不能作为字典键（不可哈希）
# coords = {[35.0, 118.0]: "City A"}  # TypeError!
\`\`\`

### 5.2 元组在 AI 中的应用

**场景 1：数据形状**
\`\`\`python
# 图像的形状 (height, width, channels)
image_shape = (224, 224, 3)

# 张量的形状
tensor_shape = (batch_size, channels, height, width)
\`\`\`

**场景 2：坐标点**
\`\`\`python
# 物体检测中的边界框
bboxes = [
    (10, 20, 100, 120),  # (x1, y1, x2, y2)
    (50, 60, 200, 180),
]
\`\`\`

**场景 3：函数返回多个值**
\`\`\`python
def train_test_split(data, test_ratio=0.2):
    split_idx = int(len(data) * (1 - test_ratio))
    return data[:split_idx], data[split_idx:]  # 返回元组

train, test = train_test_split(data)
\`\`\`

### 5.3 namedtuple：具名元组

\`\`\`python
from collections import namedtuple

# 定义一个数据点结构
DataPoint = namedtuple("DataPoint", ["features", "label"])

# 创建
point = DataPoint(features=[1.0, 2.0, 3.0], label=1)

# 访问（比普通元组更清晰）
print(point.features)  # [1.0, 2.0, 3.0]
print(point.label)     # 1
\`\`\`

## 六、NumPy 数组预览

### 6.1 为什么需要 NumPy

Python 列表处理数值计算时有明显劣势：

\`\`\`python
# 列表相加：拼接，不是数学运算
[1, 2, 3] + [4, 5, 6]  # [1, 2, 3, 4, 5, 6]

# 列表不能直接做数学运算
# [1, 2, 3] * 2  # [1, 2, 3, 1, 2, 3]（重复，不是乘 2）

# NumPy 数组可以
import numpy as np
np.array([1, 2, 3]) + np.array([4, 5, 6])  # array([5, 7, 9])
np.array([1, 2, 3]) * 2  # array([2, 4, 6])
\`\`\`

### 6.2 NumPy 的核心优势

**1. 向量化运算**
\`\`\`python
# 列表：需要循环
result = [x * 2 for x in data]

# NumPy：直接运算
result = np.array(data) * 2  # 快 10-100 倍
\`\`\`

**2. 广播机制**
\`\`\`python
# 不同形状的数组可以运算
a = np.array([[1, 2, 3], [4, 5, 6]])  # shape (2, 3)
b = np.array([10, 20, 30])             # shape (3,)
c = a + b  # b 自动广播到 (2, 3)
# array([[11, 22, 33], [14, 25, 36]])
\`\`\`

**3. 内存效率**
\`\`\`python
# 列表：每个元素是一个 Python 对象
import sys
python_list = list(range(1000))
print(sys.getsizeof(python_list))  # 约 9KB

# NumPy：连续内存，类型一致
import numpy as np
np_array = np.arange(1000)
print(np_array.nbytes)  # 约 8KB（int64）或 4KB（int32）
\`\`\`

### 6.3 NumPy 基本操作预览

\`\`\`python
import numpy as np

# 创建数组
a = np.array([1, 2, 3, 4, 5])
b = np.zeros(5)
c = np.ones((2, 3))
d = np.random.randn(3, 3)  # 标准正态分布

# 数组属性
print(a.shape)    # (5,)
print(a.dtype)    # int64
print(a.size)     # 5
print(a.ndim)     # 1

# 数学运算
a = np.array([1, 2, 3])
print(a + 10)        # [11 12 13]
print(a * 2)         # [2 4 6]
print(np.sqrt(a))    # [1. 1.41 1.73]
print(a.sum())       # 6
print(a.mean())      # 2.0
print(a.max())       # 3

# 索引和切片
a = np.array([1, 2, 3, 4, 5])
print(a[0])          # 1
print(a[1:4])        # [2 3 4]
print(a[a > 2])      # [3 4 5] 布尔索引
\`\`\`

> 💡 NumPy 的详细内容将在后续章节深入讲解，这里只是预览。

## 七、数据结构性能对比

### 7.1 实测对比

让我们用实际代码对比不同数据结构的性能：

\`\`\`python
import time

# 准备数据
n = 100000
data_list = list(range(n))
data_set = set(range(n))
data_dict = {i: i for i in range(n)}

# 测试查找性能
target = n - 1  # 查找最后一个元素

# 列表查找
start = time.time()
for _ in range(1000):
    target in data_list
list_time = time.time() - start

# 集合查找
start = time.time()
for _ in range(1000):
    target in data_set
set_time = time.time() - start

# 字典查找
start = time.time()
for _ in range(1000):
    target in data_dict
dict_time = time.time() - start

print(f"列表: {list_time:.3f}s")
print(f"集合: {set_time:.3f}s")
print(f"字典: {dict_time:.3f}s")
\`\`\`

**典型结果：**
- 列表：~1.0s（O(n)）
- 集合：~0.001s（O(1)）
- 字典：~0.001s（O(1)）

**结论：** 对于查找操作，集合和字典比列表快 1000 倍以上！

### 7.2 选择数据结构的决策树

\`\`\`
需要存储数据
│
├── 键值对映射？
│   ├── 是 → dict
│   └── 否 ↓
│
├── 需要唯一性？
│   ├── 是 → set
│   └── 否 ↓
│
├── 数据不可变？
│   ├── 是 → tuple
│   └── 否 ↓
│
├── 数值计算密集？
│   ├── 是 → numpy array
│   └── 否 ↓
│
└── 通用序列 → list
\`\`\`

### 7.3 AI 场景的数据结构选择

| AI 场景 | 推荐数据结构 | 原因 |
|---------|-------------|------|
| 小型数据集 | list of dict | 灵活，易读 |
| 大型数值数据 | numpy array | 向量化，高效 |
| 表格数据 | pandas DataFrame | 二维数据，操作丰富 |
| 词频统计 | Counter | 内置计数功能 |
| 类别映射 | dict | O(1) 查找 |
| 停用词/黑名单 | set | O(1) 判断存在 |
| 图像形状 | tuple | 不可变，语义明确 |
| 训练历史 | list | 有序追加 |
| 超参数 | dict | 键值对，灵活 |

## 八、实战案例：用数据结构优化 AI 代码

### 8.1 案例 1：文本预处理

\`\`\`python
# ❌ 低效写法
def preprocess_text(text):
    stop_words = ["the", "a", "an", "is"]  # list，查找慢
    words = text.lower().split()
    result = []
    for word in words:
        if word not in stop_words:  # O(n) 查找
            result.append(word)
    return result

# ✅ 高效写法
def preprocess_text_fast(text):
    stop_words = {"the", "a", "an", "is"}  # set，查找快
    words = text.lower().split()
    return [w for w in words if w not in stop_words]  # O(1) 查找
\`\`\`

### 8.2 案例 2：数据分组

\`\`\`python
# 数据集
data = [
    {"category": "A", "value": 10},
    {"category": "B", "value": 20},
    {"category": "A", "value": 30},
]

# ❌ 低效写法：多次遍历
categories = set(d["category"] for d in data)
groups = {}
for cat in categories:
    groups[cat] = [d["value"] for d in data if d["category"] == cat]
# 遍历 categories × data 次

# ✅ 高效写法：一次遍历
from collections import defaultdict
groups = defaultdict(list)
for d in data:
    groups[d["category"]].append(d["value"])
# 只遍历 data 一次
\`\`\`

### 8.3 案例 3：特征工程

\`\`\`python
# 独热编码
labels = ["cat", "dog", "bird", "cat", "dog"]

# 用字典映射
label_to_idx = {"cat": 0, "dog": 1, "bird": 2}
indices = [label_to_idx[l] for l in labels]  # [0, 1, 2, 0, 1]

# 独热向量
num_classes = 3
one_hot = [[1 if i == idx else 0 for i in range(num_classes)]
           for idx in indices]
# [[1,0,0], [0,1,0], [0,0,1], [1,0,0], [0,1,0]]
\`\`\`

## 九、本章总结

本章深入介绍了 Python 核心数据结构在 AI 开发中的应用：

1. **列表（list）**：通用序列，适合有序数据，查找慢
2. **字典（dict）**：键值映射，O(1) 查找，AI 配置必备
3. **集合（set）**：唯一元素，O(1) 查找，去重利器
4. **元组（tuple）**：不可变，用于形状、坐标、字典键
5. **NumPy 数组**：数值计算专用，向量化、广播、高效

**关键原则：**
- 查找多用 dict/set，顺序用 list
- 数值计算用 NumPy，不要用列表
- 数据不可变用 tuple
- 善用 collections 模块（Counter、defaultdict）
- 列表推导式比循环更 Pythonic

**性能认知：**
- dict/set 查找比 list 快 1000 倍
- NumPy 运算比列表循环快 10-100 倍
- 选择正确的数据结构 = 免费的性能优化

下一章我们将深入学习 NumPy，这是所有 AI 库的基础。掌握 NumPy 后，你将能高效处理大规模数值数据。

> 💡 本章代码示例对比了各种数据结构的性能，并演示了 AI 场景下的最佳实践。
    `,
    code: `
# =============================================================
# AI 开发核心数据结构 —— 演示代码
# 本代码使用纯 Python 标准库，演示：
# 1. 列表、字典、集合、元组在 AI 中的应用
# 2. 数据结构性能对比
# 3. NumPy 数组概念预览（用列表模拟）
# 4. 实战案例：文本处理、数据分组、特征工程
# =============================================================

import time
import random
from collections import Counter, defaultdict, namedtuple

print("=" * 60)
print("  AI 开发核心数据结构演示")
print("=" * 60)

# -------------------------------------------------------------
# 第一部分：列表在 AI 中的应用
# -------------------------------------------------------------
print("\\n【第一部分】列表（List）在 AI 中的应用\\n")

# 场景 1：模拟数据集
dataset = [
    {"features": [1.0, 2.0, 3.0], "label": 0},
    {"features": [2.0, 3.0, 4.0], "label": 1},
    {"features": [3.0, 4.0, 5.0], "label": 0},
    {"features": [4.0, 5.0, 6.0], "label": 1},
    {"features": [5.0, 6.0, 7.0], "label": 0},
]

print("  模拟数据集（5 个样本）：")
for i, sample in enumerate(dataset):
    print(f"    样本{i}: 特征={sample['features']}, 标签={sample['label']}")

# 列表推导式：提取特征和标签
all_features = [s["features"] for s in dataset]
all_labels = [s["label"] for s in dataset]
print(f"\\n  提取的特征矩阵：{all_features}")
print(f"  提取的标签列表：{all_labels}")

# 场景 2：Batch 划分
print("\\n  Batch 划分（batch_size=2）：")
batch_size = 2
batches = [dataset[i:i+batch_size] for i in range(0, len(dataset), batch_size)]
for i, batch in enumerate(batches):
    print(f"    Batch {i+1}: {len(batch)} 个样本")

# 场景 3：移动平均
print("\\n  移动平均计算：")
stock_prices = [100.0, 101.5, 99.8, 102.3, 103.1, 101.0, 104.5]
window = 3
moving_avg = [
    sum(stock_prices[i:i+window]) / window
    for i in range(len(stock_prices) - window + 1)
]
print(f"    原始价格: {stock_prices}")
print(f"    {window}日移动平均: {[round(x, 2) for x in moving_avg]}")


# -------------------------------------------------------------
# 第二部分：字典在 AI 中的应用
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第二部分】字典（Dict）在 AI 中的应用")
print("=" * 60)

# 场景 1：模型配置
print("\\n  模型超参数配置：")
config = {
    "model_name": "SimpleNN",
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 100,
    "layers": [128, 64, 10],
    "optimizer": "adam",
}
for key, value in config.items():
    print(f"    {key}: {value}")

# 场景 2：类别映射
print("\\n  类别标签映射：")
label_map = {0: "猫", 1: "狗", 2: "鸟", 3: "鱼"}
# 反转字典
name_to_label = {v: k for k, v in label_map.items()}
print(f"    ID→名称: {label_map}")
print(f"    名称→ID: {name_to_label}")

# 场景 3：词频统计
print("\\n  词频统计（Counter）：")
text = "the cat sat on the mat the cat ran the dog ran"
words = text.split()
word_counts = Counter(words)
print(f"    文本: '{text}'")
print(f"    词频统计:")
for word, count in word_counts.most_common():
    print(f"      {word}: {count}")

# 场景 4：defaultdict 分组
print("\\n  数据分组（defaultdict）：")
samples = [("A", 10), ("B", 20), ("A", 30), ("B", 40), ("A", 50), ("C", 60)]
groups = defaultdict(list)
for category, value in samples:
    groups[category].append(value)
print(f"    原始数据: {samples}")
print(f"    分组结果:")
for cat, values in sorted(groups.items()):
    print(f"      {cat}: {values} (均值={sum(values)/len(values):.1f})")


# -------------------------------------------------------------
# 第三部分：集合在 AI 中的应用
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第三部分】集合（Set）在 AI 中的应用")
print("=" * 60)

# 场景 1：停用词过滤
print("\\n  停用词过滤：")
stop_words = {"the", "a", "an", "is", "at", "on", "in", "and", "the"}
text = "the quick brown fox jumps over the lazy dog"
words = text.split()
filtered = [w for w in words if w not in stop_words]
print(f"    原文: {words}")
print(f"    过滤后: {filtered}")

# 场景 2：集合运算
print("\\n  多标签分类的集合运算：")
true_labels = {"cat", "dog", "bird"}
pred_labels = {"cat", "dog", "fish"}
print(f"    真实标签: {true_labels}")
print(f"    预测标签: {pred_labels}")
print(f"    正确预测: {true_labels & pred_labels}")
print(f"    遗漏标签: {true_labels - pred_labels}")
print(f"    多余标签: {pred_labels - true_labels}")

# 场景 3：去重
print("\\n  数据去重：")
all_ids = [1001, 1002, 1003, 1001, 1004, 1002, 1005, 1003]
unique_ids = list(set(all_ids))
print(f"    原始ID: {all_ids}")
print(f"    去重后: {sorted(unique_ids)}")
print(f"    重复数: {len(all_ids) - len(unique_ids)}")


# -------------------------------------------------------------
# 第四部分：元组在 AI 中的应用
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第四部分】元组（Tuple）在 AI 中的应用")
print("=" * 60)

# 场景 1：数据形状
print("\\n  数据形状表示：")
shapes = {
    "图像": (224, 224, 3),
    "灰度图": (224, 224),
    "批次图像": (32, 224, 224, 3),
    "特征向量": (512,),
    "权重矩阵": (128, 64),
}
for name, shape in shapes.items():
    print(f"    {name:12s}: {shape}")

# 场景 2：坐标点
print("\\n  物体检测的边界框：")
bboxes = [
    (10, 20, 100, 120, "cat"),
    (50, 60, 200, 180, "dog"),
    (30, 40, 80, 90, "bird"),
]
for x1, y1, x2, y2, label in bboxes:
    width = x2 - x1
    height = y2 - y1
    print(f"    {label}: 位置({x1},{y1})-({x2},{y2}), 尺寸{width}x{height}")

# 场景 3：namedtuple
print("\\n  namedtuple 数据点：")
DataPoint = namedtuple("DataPoint", ["features", "label", "weight"])
points = [
    DataPoint([1.0, 2.0], 0, 1.0),
    DataPoint([2.0, 3.0], 1, 0.8),
    DataPoint([3.0, 4.0], 0, 1.2),
]
for p in points:
    print(f"    特征={p.features}, 标签={p.label}, 权重={p.weight}")


# -------------------------------------------------------------
# 第五部分：性能对比
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第五部分】数据结构性能对比")
print("=" * 60)

def benchmark_find(data_struct, target, iterations=1000):
    """基准测试：查找操作"""
    start = time.time()
    for _ in range(iterations):
        _ = target in data_struct
    return time.time() - start

# 准备数据
n = 10000
data_list = list(range(n))
data_set = set(range(n))
data_dict = {i: i for i in range(n)}

# 查找最后一个元素（最坏情况）
target = n - 1
iterations = 1000

print(f"\\n  在 {n} 个元素中查找（重复 {iterations} 次）：\\n")

list_time = benchmark_find(data_list, target, iterations)
set_time = benchmark_find(data_set, target, iterations)
dict_time = benchmark_find(data_dict, target, iterations)

print(f"  {'数据结构':15s} {'耗时':>10s} {'相对速度':>10s}")
print(f"  {'-'*15} {'-'*10} {'-'*10}")
print(f"  {'list':15s} {list_time*1000:>8.2f}ms {'1x':>10s}")
print(f"  {'set':15s} {set_time*1000:>8.2f}ms {list_time/max(set_time,0.001):>9.0f}x")
print(f"  {'dict':15s} {dict_time*1000:>8.2f}ms {list_time/max(dict_time,0.001):>9.0f}x")

print(f"\\n  💡 dict/set 比 list 快约 {list_time/max(set_time, 0.001):.0f} 倍！")

# 插入性能对比
print("\\n  插入操作性能对比：")
data_list_copy = []
data_set_copy = set()

start = time.time()
for i in range(10000):
    data_list_copy.append(i)
list_insert_time = time.time() - start

start = time.time()
for i in range(10000):
    data_set_copy.add(i)
set_insert_time = time.time() - start

print(f"    list.append(10000次): {list_insert_time*1000:.2f}ms")
print(f"    set.add(10000次):     {set_insert_time*1000:.2f}ms")


# -------------------------------------------------------------
# 第六部分：NumPy 概念预览（用列表模拟）
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第六部分】NumPy 概念预览（用列表模拟）")
print("=" * 60)

# 模拟向量化运算
def list_add(a, b):
    """列表逐元素相加（模拟 NumPy）"""
    return [x + y for x, y in zip(a, b)]

def list_scale(a, scalar):
    """列表标量乘法（模拟 NumPy）"""
    return [x * scalar for x in a]

def list_dot(a, b):
    """列表点积（模拟 NumPy）"""
    return sum(x * y for x, y in zip(a, b))

print("\\n  向量运算（NumPy 的核心概念）：")
vec_a = [1.0, 2.0, 3.0, 4.0, 5.0]
vec_b = [10.0, 20.0, 30.0, 40.0, 50.0]

print(f"    向量 A: {vec_a}")
print(f"    向量 B: {vec_b}")
print(f"    A + B: {list_add(vec_a, vec_b)}")
print(f"    A * 2: {list_scale(vec_a, 2)}")
print(f"    A · B (点积): {list_dot(vec_a, vec_b)}")

# 模拟广播机制
print("\\n  广播机制预览：")
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
vector = [10, 20, 30]

print(f"    矩阵:")
for row in matrix:
    print(f"      {row}")
print(f"    向量: {vector}")

# 广播：矩阵每行加上向量
result = [list_add(row, vector) for row in matrix]
print(f"    矩阵 + 向量（广播）:")
for row in result:
    print(f"      {row}")


# -------------------------------------------------------------
# 第七部分：实战案例
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第七部分】实战案例")
print("=" * 60)

# 案例 1：独热编码
print("\\n  案例 1：独热编码\\n")
labels = ["cat", "dog", "bird", "cat", "dog", "bird"]
unique_labels = list(set(labels))
label_to_idx = {label: idx for idx, label in enumerate(unique_labels)}

print(f"    原始标签: {labels}")
print(f"    类别映射: {label_to_idx}")

# 转为索引
indices = [label_to_idx[l] for l in labels]
print(f"    索引表示: {indices}")

# 独热编码
num_classes = len(unique_labels)
one_hot = [[1 if i == idx else 0 for i in range(num_classes)]
           for idx in indices]
print(f"    独热编码:")
for label, vec in zip(labels, one_hot):
    print(f"      {label}: {vec}")

# 案例 2：文本特征提取
print("\\n  案例 2：文本特征提取（词袋模型）\\n")
documents = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "the cat and the dog ran",
]

# 构建词表
vocab = set()
for doc in documents:
    vocab.update(doc.split())
vocab = sorted(vocab)
print(f"    文档数: {len(documents)}")
print(f"    词表大小: {len(vocab)}")
print(f"    词表: {vocab}")

# 词频向量
print(f"\\n    词频向量:")
for i, doc in enumerate(documents):
    words = doc.split()
    counts = Counter(words)
    vector = [counts.get(word, 0) for word in vocab]
    print(f"      文档{i+1}: {vector}")

# 案例 3：KNN 简化版
print("\\n  案例 3：KNN 分类（简化版）\\n")

# 训练数据
train_data = [
    ([1.0, 1.0], "A"),
    ([1.1, 0.9], "A"),
    ([0.9, 1.1], "A"),
    ([5.0, 5.0], "B"),
    ([5.1, 4.9], "B"),
    ([4.9, 5.1], "B"),
]

# 测试点
test_point = [3.0, 3.0]

# 计算距离并排序
def euclidean_distance(a, b):
    """欧氏距离"""
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5

distances = []
for features, label in train_data:
    dist = euclidean_distance(test_point, features)
    distances.append((dist, label, features))

# 按距离排序
distances.sort(key=lambda x: x[0])

# 取前 k 个
k = 3
nearest = distances[:k]
print(f"    测试点: {test_point}")
print(f"    训练数据:")
for features, label in train_data:
    print(f"      {features} → {label}")
print(f"\\n    最近 {k} 个邻居:")
for dist, label, features in nearest:
    print(f"      {features} ({label}), 距离={dist:.3f}")

# 投票
votes = Counter(label for _, label, _ in nearest)
predicted = votes.most_common(1)[0][0]
print(f"\\n    预测结果: {predicted}")


# -------------------------------------------------------------
# 第八部分：数据结构选择指南
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("  【第八部分】数据结构选择指南")
print("=" * 60)

guide = """
  AI 场景的数据结构选择：

  ┌─────────────────────┬──────────────────┬──────────────────────────┐
  │ 场景                │ 推荐结构         │ 原因                     │
  ├─────────────────────┼──────────────────┼──────────────────────────┤
  │ 小型数据集          │ list of dict     │ 灵活，易读               │
  │ 大型数值数据        │ numpy array      │ 向量化，高效             │
  │ 表格数据            │ pandas DataFrame │ 二维数据，操作丰富       │
  │ 词频统计            │ Counter          │ 内置计数功能             │
  │ 类别映射            │ dict             │ O(1) 查找                │
  │ 停用词/黑名单       │ set              │ O(1) 判断存在            │
  │ 图像形状            │ tuple            │ 不可变，语义明确         │
  │ 训练历史            │ list             │ 有序追加                 │
  │ 超参数配置          │ dict             │ 键值对，灵活             │
  │ 分组聚合            │ defaultdict      │ 自动初始化默认值         │
  └─────────────────────┴──────────────────┴──────────────────────────┘
"""
print(guide)


# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("=" * 60)
print("  🎯 本章总结")
print("=" * 60)
print("""
  1. list：通用序列，适合有序数据，查找慢 O(n)
  2. dict：键值映射，O(1) 查找，AI 配置必备
  3. set：唯一元素，O(1) 查找，去重利器
  4. tuple：不可变，用于形状、坐标、字典键
  5. NumPy array：数值计算专用，向量化、广播

  关键原则：
  - 查找多用 dict/set，顺序用 list
  - 数值计算用 NumPy，不要用列表
  - 数据不可变用 tuple
  - 善用 collections 模块

  下一章我们将深入学习 NumPy，这是所有 AI 库的基础！
""")
`,
  },
];
