// =============================================================
// Python 人工智能开发教程 —— 第八批章节（计算机视觉组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "aipy-cv-intro",
    icon: "👁️",
    group: "计算机视觉",
    title: "计算机视觉基础",
    content: `
# 计算机视觉基础

## 一、什么是计算机视觉

计算机视觉（Computer Vision，简称 CV）是人工智能的一个重要分支，它的目标是让计算机能够"看懂"图像和视频，并从中提取出有意义的信息。这里的"看"并不是简单地获取图像数据，而是要理解图像中的内容——包括识别物体、检测目标、理解场景、估计运动等等。

人类视觉系统是一个极其精密的系统：光线通过角膜和晶状体投射到视网膜上，视网膜上的感光细胞将光信号转换为电信号，再通过视神经传送到大脑的视觉皮层进行复杂的处理。整个过程在毫秒级别完成，让我们能够瞬间识别出眼前的物体是什么、在哪里、在做什么。

计算机视觉试图用计算机来模拟这个过程。从工程角度看，计算机视觉是一个从图像/视频到语义理解的映射过程。输入是像素矩阵（一组数字），输出则可能是分类标签、边界框坐标、语义分割掩码、深度图、光流场等等。

## 二、计算机视觉的发展史

### 2.1 早期探索阶段（1960s-1980s）

计算机视觉的历史可以追溯到 20 世纪 60 年代。1966 年，MIT 人工智能实验室的 Seymour Papert 提出了"Summer Vision Project"，认为让计算机识别物体只需要一个夏天的工程努力——这显然过于乐观了，后来证明这是一个极其困难的问题。

这一时期的代表性工作包括：
- **Roberts 1963**：Larry Roberts 提出了从二维图像中提取三维多面体形状的方法，被认为是计算机视觉的开山之作。
- **边缘检测**：研究如何从图像中提取边缘信息，出现了 Sobel、Prewitt、Canny 等经典算子。
- **Marr 视觉理论**：David Marr 在 1980 年代提出视觉是一个分层的信息处理过程，从原始图像到 primal sketch 再到 2.5D sketch，最后到 3D 模型。

这一阶段的特征是基于规则和几何的方法，认为可以通过数学建模来理解视觉过程。

### 2.2 特征工程时代（1990s-2010s）

随着数字图像处理技术的发展，研究者开始关注如何设计手工特征来描述图像：
- **HOG（方向梯度直方图）**：用于行人检测，由 Navneet Dalal 和 Bill Triggs 于 2005 年提出。
- **SIFT（尺度不变特征变换）**：David Lowe 于 1999 年提出，能够提取尺度、旋转不变的特征点。
- **SURF、ORB、BRIEF** 等改进版本。
- **Haar 特征**：配合 AdaBoost 分类器，由 Viola-Jones 于 2001 年提出，实现了实时人脸检测。

这个时代的代表方法还包括基于词袋模型（Bag of Visual Words）的图像分类，以及基于 DPM（Deformable Parts Model）的目标检测。

### 2.3 深度学习革命（2012 至今）

2012 年是计算机视觉的分水岭。在 ImageNet 大规模视觉识别挑战赛（ILSVRC）上，AlexNet 使用深度卷积神经网络将错误率从 26% 降低到 15%，引发了深度学习在计算机视觉领域的全面爆发。

关键节点：
- **2012 AlexNet**：8 层网络，使用 ReLU 激活函数、Dropout、GPU 训练。
- **2014 VGG**：使用统一的 3x3 卷积核，加深网络到 16-19 层。
- **2014 GoogLeNet/Inception**：引入 Inception 模块，使用 1x1 卷积降维。
- **2015 ResNet**：何恺明等提出残差连接，使训练 152 层甚至更深的网络成为可能。
- **2015-2017 目标检测大爆发**：Faster R-CNN、YOLO、SSD 等系列算法。
- **2017 Transformer**：Vaswani 等提出 Transformer 架构，最初用于 NLP。
- **2020 Vision Transformer (ViT)**：将 Transformer 直接应用于图像分块，打破 CNN 垄断。
- **2021-至今 多模态大模型**：CLIP、DALL-E、Stable Diffusion 等，视觉与语言深度结合。

## 三、计算机视觉的任务分类

### 3.1 图像分类（Image Classification）

图像分类是最基础的任务：给定一张图像，输出它属于哪个类别。例如判断一张图片是猫还是狗。虽然看似简单，但它包含了许多视觉识别的核心问题：视角变化、光照变化、形变、遮挡、类内差异等。

ImageNet 数据集包含 1000 个类别，百万级图像，是衡量分类算法性能的标准基准。Top-5 错误率从 AlexNet 之前的 25%+ 降到当前接近 1%，已超越人类水平。

### 3.2 目标检测（Object Detection）

目标检测不仅要识别图像中有什么物体，还要给出每个物体的位置（通常用矩形框表示）。代表数据集有 PASCAL VOC、COCO、Open Images。

主流方法分为两类：
- **两阶段方法**：先生成候选区域，再分类和回归。如 R-CNN、Fast R-CNN、Faster R-CNN。
- **单阶段方法**：直接从图像预测边界框和类别。如 YOLO 系列、SSD、RetinaNet。

### 3.3 语义分割（Semantic Segmentation）

语义分割对图像中的每个像素进行分类，将图像划分为不同的语义区域。例如将街景图像分割为道路、建筑、车辆、行人、天空等。代表方法有 FCN、U-Net、DeepLab 系列。

### 3.4 实例分割（Instance Segmentation）

实例分割在语义分割的基础上，还要区分同一类别的不同个体。例如图像中有三只猫，需要分别标出每只猫的像素区域。Mask R-CNN 是代表方法。

### 3.5 全景分割（Panoptic Segmentation）

全景分割结合了语义分割和实例分割，对图像中所有像素（包括背景和前景物体）进行统一标注。

### 3.6 关键点检测（Keypoint Detection）

检测物体的关键点位置，常用于人体姿态估计、人脸关键点检测、手势识别等。例如 OpenPose 检测人体 18 个关键点，人脸有 68 或 106 个关键点标注。

### 3.7 其他任务

- **图像生成**：GAN、VAE、Diffusion Model 生成逼真图像。
- **图像超分辨率**：将低分辨率图像重建为高分辨率。
- **图像修复**：补全图像中缺失或损坏的区域。
- **光流估计**：估计视频中相邻帧之间的像素运动。
- **深度估计**：从单目或双目图像估计场景深度。
- **3D 重建**：从多视图恢复 3D 模型，如 NeRF。
- **视频理解**：动作识别、视频目标分割、视频字幕生成等。

## 四、图像的表示方法

### 4.1 像素

图像的最基本单位是像素（pixel）。一张数字图像可以看作是一个二维矩阵，每个元素称为一个像素，记录了该位置的颜色或亮度信息。

例如一张 1920x1080 的图像，水平方向有 1920 个像素，垂直方向有 1080 个像素，总共约 200 万个像素。

### 4.2 灰度图像

灰度图像只有一个通道，每个像素通常用 8 位（0-255）表示亮度：
- 0 表示纯黑
- 255 表示纯白
- 中间值表示不同灰度

在内存中，一张 HxW 的灰度图像就是一个 H 行 W 列的二维数组。

### 4.3 彩色图像与 RGB

最常见的彩色图像格式是 RGB，每个像素由红（Red）、绿（Green）、蓝（Blue）三个通道组成，每个通道 8 位（0-255）。一张 HxW 的彩色图像在内存中是 HxWx3 的三维数组。

RGB 色彩空间基于加色法：三种颜色叠加产生白色。不同比例的 RGB 组合可以表示约 1670 万种颜色（256^3）。

### 4.4 常见色彩空间

除了 RGB，还有许多其他色彩空间：

- **BGR**：OpenCV 默认使用的顺序，与 RGB 通道顺序相反。
- **HSV**：色相（Hue）、饱和度（Saturation）、明度（Value）。更接近人类感知，常用于颜色分割。
- **HSL**：与 HSV 类似，但明度定义不同。
- **YUV/YCbCr**：将亮度（Y）和色度（U/V）分离，用于视频压缩（JPEG、MPEG）。
- **Lab**：L 表示亮度，a 和 b 表示颜色对立维度，感知均匀，常用于颜色差异计算。
- **灰度**：单通道，仅亮度信息。

### 4.5 图像的数值表示

在 Python 中，图像通常用 NumPy 数组表示：
- 灰度图：shape (H, W)，dtype uint8
- 彩色图：shape (H, W, 3)，dtype uint8
- 浮点图：dtype float32 或 float64，范围 [0, 1] 或 [0, 255]

深度学习框架（PyTorch、TensorFlow）通常还需要通道维度在前（NCHW 格式）和批处理维度（N）。

## 五、OpenCV 简介

OpenCV（Open Source Computer Vision Library）是一个开源的计算机视觉库，由 Intel 于 1999 年发起，目前由 Itseez 维护。它是计算机视觉领域使用最广泛的库之一。

### 5.1 主要特点

- 跨平台：支持 Windows、Linux、macOS、Android、iOS。
- 多语言接口：核心用 C++ 编写，提供 Python、Java、MATLAB 等绑定。
- 丰富的模块：图像处理、视频分析、相机标定、3D 重建、机器学习、深度学习 DNN 模块。
- 高性能：大量使用 SIMD 指令优化和并行计算。
- BSD 许可证：商业友好。

### 5.2 主要模块

- **core**：核心数据结构（Mat）、基本算法。
- **imgproc**：图像处理，包括滤波、几何变换、色彩空间转换、直方图等。
- **imgcodecs**：图像读写（JPEG、PNG、TIFF 等）。
- **videoio**：视频捕获和写入。
- **video**：运动估计、背景建模、目标跟踪。
- **calib3d**：相机标定、3D 重建、姿态估计。
- **features2d**：特征检测和描述（SIFT、SURF、ORB）。
- **objdetect**：目标检测（Haar 级联、HOG+SVM）。
- **dnn**：深度神经网络推理，支持加载 TensorFlow、PyTorch、Caffe 训练的模型。
- **ml**：传统机器学习算法（SVM、KNN、决策树等）。
- **highgui**：图像显示、用户交互。

### 5.3 PIL/Pillow 简介

Pillow 是 Python Imaging Library 的分支，专注于图像的读写和基础处理。相比 OpenCV，Pillow 更易用，但功能较少。在深度学习数据增强中常用（torchvision transforms 基于 Pillow）。

### 5.4 其他常用库

- **scikit-image**：基于 SciPy 的图像处理库，算法丰富。
- **imageio**：简化图像/视频读写。
- **albumentations**：高性能数据增强库。
- **imgaug**：另一流行的数据增强库。

## 六、计算机视觉的挑战

### 6.1 视角变化

同一物体从不同角度拍摄，图像差异巨大。一只猫的正面、侧面、背面看起来很不一样。

### 6.2 光照变化

强光、弱光、阴影、逆光等条件下，同一物体的像素值差异很大。

### 6.3 尺度变化

同一物体在近距离和远距离拍摄时，在图像中的大小差异巨大。

### 6.4 形变

非刚性物体（如动物、人体）会呈现各种姿态，外形变化大。

### 6.5 遮挡

物体被部分遮挡时，可见部分可能不足以识别。

### 6.6 类内差异

同一类别的物体外观差异可能很大——比如不同品种的狗差异极大。

### 6.7 背景干扰

复杂背景下，目标物体容易被淹没。

深度学习之所以能够革命性地提升计算机视觉性能，正是因为它通过深层网络自动学习层次化的特征表示，能够应对上述各种挑战。

## 七、本课程的学习路线

本组课程将带你逐步深入计算机视觉：
1. **图像处理基础**：学习图像的基本操作和经典算法。
2. **卷积神经网络**：理解 CNN 的核心原理，这是现代 CV 的基石。
3. **目标检测**：从经典方法到 YOLO 等现代检测器。
4. **图像生成**：GAN、VAE、Diffusion 等生成模型。

建议结合实践：在理解原理的基础上，多动手写代码、跑模型。后续课程会使用 NumPy 模拟核心概念，帮助你从底层理解算法。
`,
    code: `# =============================================================
# 计算机视觉基础 —— 用纯 Python 模拟图像表示
# =============================================================
# 本示例不依赖任何第三方库，用嵌套列表模拟图像矩阵，
# 演示灰度图、RGB 彩色图、色彩空间转换等核心概念。

import random
import math

# -------------------------------------------------------------
# 1. 模拟一张灰度图像（二维矩阵）
# -------------------------------------------------------------
# 灰度图：H 行 W 列，每个元素 0-255 表示亮度
def make_grayscale_image(height, width, seed=42):
    """生成一张随机灰度图"""
    random.seed(seed)
    image = []
    for y in range(height):
        row = [random.randint(0, 255) for _ in range(width)]
        image.append(row)
    return image

gray_img = make_grayscale_image(4, 6)
print("=== 灰度图像 (4x6) ===")
for row in gray_img:
    print([f"{v:3d}" for v in row])

print(f"\\n图像尺寸: {len(gray_img)} 行 x {len(gray_img[0])} 列")
print(f"像素总数: {len(gray_img) * len(gray_img[0])}")
print(f"每个像素占用: 1 字节 (0-255)")
print(f"图像总字节数: {len(gray_img) * len(gray_img[0])}")

# -------------------------------------------------------------
# 2. 模拟一张 RGB 彩色图像（三维矩阵 HxWx3）
# -------------------------------------------------------------
def make_rgb_image(height, width, seed=7):
    """生成一张随机 RGB 彩色图"""
    random.seed(seed)
    image = []
    for y in range(height):
        row = []
        for x in range(width):
            pixel = (
                random.randint(0, 255),  # R 红色通道
                random.randint(0, 255),  # G 绿色通道
                random.randint(0, 255),  # B 蓝色通道
            )
            row.append(pixel)
        image.append(row)
    return image

rgb_img = make_rgb_image(3, 4)
print("\\n=== RGB 彩色图像 (3x4) ===")
for row in rgb_img:
    print(row)

print(f"\\n图像尺寸: {len(rgb_img)} 行 x {len(rgb_img[0])} 列 x 3 通道")
print(f"像素总数: {len(rgb_img) * len(rgb_img[0])}")
print(f"每个像素占用: 3 字节 (R, G, B 各 1 字节)")
print(f"图像总字节数: {len(rgb_img) * len(rgb_img[0]) * 3}")

# -------------------------------------------------------------
# 3. 访问像素
# -------------------------------------------------------------
print("\\n=== 像素访问示例 ===")
print(f"灰度图 (1, 2) 处的像素值: {gray_img[1][2]}")
print(f"RGB 图 (0, 0) 处的像素: R={rgb_img[0][0][0]}, G={rgb_img[0][0][1]}, B={rgb_img[0][0][2]}")

# 修改像素
gray_img[1][2] = 128
print(f"修改后灰度图 (1, 2): {gray_img[1][2]}")

# -------------------------------------------------------------
# 4. 色彩空间转换：RGB -> 灰度
# -------------------------------------------------------------
def rgb_to_gray(rgb_image):
    """RGB 转灰度：使用加权平均 (人眼对绿色更敏感)"""
    height = len(rgb_image)
    width = len(rgb_image[0])
    gray = []
    for y in range(height):
        row = []
        for x in range(width):
            r, g, b = rgb_image[y][x]
            # 标准加权公式: 0.299R + 0.587G + 0.114B
            value = int(0.299 * r + 0.587 * g + 0.114 * b)
            row.append(value)
        gray.append(row)
    return gray

gray_from_rgb = rgb_to_gray(rgb_img)
print("\\n=== RGB -> 灰度 转换结果 ===")
for row in gray_from_rgb:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 5. RGB <-> HSV 色彩空间转换
# -------------------------------------------------------------
def rgb_to_hsv(r, g, b):
    """将一个 RGB 像素转换为 HSV"""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    cmax = max(r, g, b)
    cmin = min(r, g, b)
    delta = cmax - cmin

    # 色相 Hue
    if delta == 0:
        h = 0
    elif cmax == r:
        h = 60 * (((g - b) / delta) % 6)
    elif cmax == g:
        h = 60 * (((b - r) / delta) + 2)
    else:
        h = 60 * (((r - g) / delta) + 4)

    # 饱和度 Saturation
    s = 0 if cmax == 0 else (delta / cmax) * 100

    # 明度 Value
    v = cmax * 100
    return round(h, 1), round(s, 1), round(v, 1)

print("\\n=== RGB -> HSV 转换示例 ===")
test_colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 255), (128, 128, 128)]
color_names = ["红色", "绿色", "蓝色", "白色", "灰色"]
for name, (r, g, b) in zip(color_names, test_colors):
    h, s, v = rgb_to_hsv(r, g, b)
    print(f"{name} RGB=({r},{g},{b}) -> HSV=({h}°, {s}%, {v}%)")

# -------------------------------------------------------------
# 6. 图像统计信息
# -------------------------------------------------------------
def image_stats(gray_image):
    """计算灰度图像的统计信息"""
    flat = [v for row in gray_image for v in row]
    return {
        "min": min(flat),
        "max": max(flat),
        "mean": sum(flat) / len(flat),
        "pixels": len(flat),
    }

stats = image_stats(gray_from_rgb)
print("\\n=== 图像统计信息 ===")
for k, v in stats.items():
    print(f"  {k}: {v}")

# -------------------------------------------------------------
# 7. 直方图计算
# -------------------------------------------------------------
def compute_histogram(gray_image, bins=8):
    """计算灰度直方图（简化为 8 个区间）"""
    hist = [0] * bins
    bin_size = 256 // bins
    for row in gray_image:
        for v in row:
            idx = min(v // bin_size, bins - 1)
            hist[idx] += 1
    return hist

hist = compute_histogram(gray_from_rgb, bins=8)
print("\\n=== 灰度直方图 (8 个区间) ===")
labels = ["0-31", "32-63", "64-95", "96-127", "128-159", "160-191", "192-223", "224-255"]
for label, count in zip(labels, hist):
    bar = "#" * count
    print(f"  {label:>9}: {bar} ({count})")

print("\\n[完成] 计算机视觉基础概念演示完毕")
`,
  },
  {
    id: "aipy-image-basics",
    icon: "🎚️",
    group: "计算机视觉",
    title: "图像处理基础",
    content: `
# 图像处理基础

图像处理是计算机视觉的基石。在深度学习时代之前，几乎所有视觉任务都依赖于精心设计的图像处理算法。即使在今天，理解这些经典算法仍然非常重要——它们不仅是数据预处理和增强的工具，更是理解卷积神经网络工作原理的钥匙。

本章将系统讲解五大经典图像处理技术：灰度化、二值化、滤波、边缘检测、形态学操作。我们用纯 Python（标准库）实现这些算法，从底层理解它们的原理。

## 一、灰度化（Grayscale）

### 1.1 为什么需要灰度化

灰度化是将彩色图像转换为灰度图像的过程。在许多任务中，颜色信息并非必要：
- **边缘检测、轮廓提取**：亮度梯度已足够。
- **人脸识别**：形状特征比颜色更重要。
- **文档识别（OCR）**：文字与背景的亮度差异是关键。

灰度化的好处：
- 减少数据量（3 通道变 1 通道，存储和计算减少 2/3）。
- 简化后续算法，降低复杂度。
- 在某些任务上效果反而更好（去除了颜色噪声）。

### 1.2 灰度化方法

#### 方法一：平均值法

Gray = (R + G + B) / 3

简单直观，但不符合人眼对不同颜色的敏感度差异。

#### 方法二：加权平均法（最常用）

Gray = 0.299 * R + 0.587 * G + 0.114 * B

这个权重来自 ITU-R BT.601 标准。人眼对绿色最敏感，红色次之，蓝色最不敏感，因此绿色权重最大。

#### 方法三：最大值法

Gray = max(R, G, B)

保留最亮的通道值，常用于高光提取。

#### 方法四：亮度法

Gray = 0.2126 * R + 0.7152 * G + 0.0722 * B

ITU-R BT.709 标准，权重更倾向绿色，用于 HDTV。

### 1.3 代码实现

我们用二维列表模拟图像，遍历每个像素应用公式即可。详见代码部分。

## 二、二值化（Binarization / Thresholding）

### 2.1 二值化的概念

二值化是将灰度图像转换为只有两种颜色（黑和白）的图像。常用 0 表示黑，255 表示白。

二值化是图像分割的最简单形式，目的是将前景物体与背景分离。

### 2.2 全局阈值法

最简单的方法是选择一个固定阈值 T：

\`\`\`
if pixel >= T:
    output = 255  # 白
else:
    output = 0    # 黑
\`\`\`

阈值的选择至关重要：
- 太低：背景被误分为前景。
- 太高：前景被误分为背景。

### 2.3 自适应阈值法

当图像光照不均匀时，全局阈值无法应对。自适应阈值根据每个像素的局部邻域计算阈值：

- **均值法**：T = 邻域像素均值 - C
- **高斯法**：T = 邻域像素高斯加权均值 - C

### 2.4 大津法（Otsu's Method）

Otsu 方法自动寻找最佳全局阈值，使前景和背景的类间方差最大化。步骤：
1. 计算图像直方图。
2. 遍历所有可能阈值，计算类间方差。
3. 选择使类间方差最大的阈值。

Otsu 法在文档图像、细胞图像等双峰直方图场景效果很好。

### 2.5 反二值化

有时我们想得到反色：前景为黑（0），背景为白（255）。只需将输出反转即可。

## 三、图像滤波（Filtering）

### 3.1 什么是滤波

滤波是用一个核（kernel，也称掩膜 mask）与图像进行卷积运算，从而实现各种效果。滤波是图像处理的核心操作。

### 3.2 卷积运算

卷积的过程：
1. 将核中心对准当前像素。
2. 将核与覆盖区域的像素逐元素相乘。
3. 求和作为输出像素值。
4. 滑动核遍历整个图像。

边界处理通常有三种方式：
- **零填充**（zero padding）：边界外像素视为 0。
- **复制边界**（replicate）：用最近边界像素填充。
- **反射**（reflect）：镜像边界像素。

### 3.3 均值滤波

核的所有元素相等，求和为 1/n。例如 3x3 均值滤波核：

\`\`\`
1/9 * [[1,1,1],
       [1,1,1],
       [1,1,1]]
\`\`\`

效果：平滑图像，降低噪声，但会使边缘模糊。

### 3.4 高斯滤波

核元素服从二维高斯分布，中心权重大，边缘权重小。例如 3x3 高斯核：

\`\`\`
1/16 * [[1,2,1],
        [2,4,2],
        [1,2,1]]
\`\`\`

相比均值滤波，高斯滤波在平滑噪声的同时更好地保留边缘，是最常用的平滑滤波器。

### 3.5 中值滤波

不是卷积，而是取邻域像素的中位数。对**椒盐噪声**（孤立的极值点）特别有效，因为中位数不受极值影响。

### 3.6 锐化滤波

锐化是平滑的反操作，增强边缘和细节。常用拉普拉斯核：

\`\`\`
[[ 0,-1, 0],
 [-1, 5,-1],
 [ 0,-1, 0]]
\`\`\`

### 3.7 卷积的数学性质

- 线性：f*(a*g1 + b*g2) = a*(f*g1) + b*(f*g2)
- 可交换：f*g = g*f
- 可结合：(f*g)*h = f*(g*h)
- 单位元：f*δ = f（δ 是冲激函数）

## 四、边缘检测（Edge Detection）

### 4.1 边缘是什么

边缘是图像中亮度变化剧烈的像素位置，通常对应物体的边界。边缘检测是图像分割、目标识别的基础。

### 4.2 梯度

边缘的强度可以用梯度（gradient）来度量。图像梯度是亮度函数在 x 和 y 方向的偏导数：

- Gx = I(x+1, y) - I(x-1, y)
- Gy = I(x, y+1) - I(x, y-1)

边缘强度（幅值）：|G| = sqrt(Gx² + Gy²)
边缘方向：θ = atan2(Gy, Gx)

### 4.3 Sobel 算子

Sobel 算子是经典的边缘检测算子，结合了高斯平滑和差分：

\`\`\`
Gx 核:
[[-1, 0, 1],
 [-2, 0, 2],
 [-1, 0, 1]]

Gy 核:
[[-1,-2,-1],
 [ 0, 0, 0],
 [ 1, 2, 1]]
\`\`\`

分别与图像卷积得到 Gx 和 Gy，再计算幅值。

### 4.4 Prewitt 算子

与 Sobel 类似，但权重相等：

\`\`\`
Gx: [[-1,0,1],[-1,0,1],[-1,0,1]]
Gy: [[-1,-1,-1],[0,0,0],[1,1,1]]
\`\`\`

### 4.5 Laplacian 算子

二阶导数算子，对噪声敏感但定位精确：

\`\`\`
[[ 0, 1, 0],
 [ 1,-4, 1],
 [ 0, 1, 0]]
\`\`\`

### 4.6 Canny 边缘检测

Canny 是最优秀的边缘检测算法之一，包含五个步骤：
1. **高斯滤波**：去噪。
2. **计算梯度**：用 Sobel 计算 Gx、Gy、幅值、方向。
3. **非极大值抑制**（NMS）：沿梯度方向保留局部最大值，细化边缘。
4. **双阈值检测**：高阈值确认强边缘，低阈值连接边缘。
5. **滞后边界跟踪**：连接断续的边缘。

Canny 的优点：低错误率、良好的定位、单像素响应。

## 五、形态学操作（Morphological Operations）

### 5.1 形态学基础

形态学操作基于集合论，主要用于二值图像（也可用于灰度图）。它需要一个**结构元素**（structuring element），通常是 3x3 的小矩阵。

### 5.2 腐蚀（Erosion）

腐蚀：如果结构元素覆盖区域内有 0，则当前像素变 0。

效果：缩小前景区域，消除小的白色噪声点，分离粘连物体。

数学定义：A ⊖ B = {z | (B)z ⊆ A}

### 5.3 膨胀（Dilation）

膨胀：如果结构元素覆盖区域内有 1，则当前像素变 1。

效果：扩大前景区域，填补小的黑色孔洞，连接断开的物体。

数学定义：A ⊕ B = {z | (B̂)z ∩ A ≠ ∅}

### 5.4 开运算（Opening）

开运算 = 先腐蚀后膨胀。

效果：消除小的白色噪声，不显著改变大物体大小。

### 5.5 闭运算（Closing）

闭运算 = 先膨胀后腐蚀。

效果：填补小的黑色孔洞，连接邻近物体。

### 5.6 形态学梯度

梯度 = 膨胀 - 腐蚀。

效果：提取物体边缘。

### 5.7 顶帽和黑帽

- 顶帽 = 原图 - 开运算：提取比周围亮的小区域。
- 黑帽 = 闭运算 - 原图：提取比周围暗的小区域。

### 5.8 结构元素

结构元素的形状影响操作结果：
- 矩形：通用。
- 椭圆/圆形：保留圆形特征。
- 十字形：保留十字方向特征。

## 六、综合应用示例

### 6.1 文档预处理流水线

1. 灰度化。
2. 高斯滤波去噪。
3. 自适应阈值二值化。
4. 形态学开运算去噪点。
5. 输出给 OCR 引擎。

### 6.2 车牌检测预处理

1. 灰度化。
2. Sobel 边缘检测。
3. 形态学闭运算连接边缘。
4. 轮廓提取。
5. 矩形筛选（长宽比、面积）。

## 七、性能优化技巧

### 7.1 避免纯 Python 循环

纯 Python 循环处理大图像很慢。生产环境通常使用：
- NumPy 向量化操作。
- OpenCV 的 C++ 实现。
- Numba JIT 编译。
- Cython 编译。

### 7.2 分离卷积

如果卷积核可分离（如高斯核），可分解为两个一维卷积，复杂度从 O(k²) 降为 O(2k)。

### 7.3 积分图

积分图（integral image）可以 O(1) 计算任意矩形区域的像素和，用于快速均值滤波、Haar 特征计算。

## 八、本章小结

本章我们学习了图像处理的五大核心技术：
- **灰度化**：彩色转灰度，简化数据。
- **二值化**：分割前景背景。
- **滤波**：平滑、锐化、去噪。
- **边缘检测**：提取物体边界。
- **形态学操作**：精细调整二值图像。

这些算法是计算机视觉的"基本功"。在下一章学习 CNN 时，你会发现卷积神经网络的核心操作——卷积，正是本章所讲的卷积运算的扩展：将固定的核替换为可学习的参数，让网络自动学习最优的滤波器。

代码示例用纯 Python 实现了这些算法，建议你亲手运行、修改参数，直观感受不同算法的效果。
`,
    code: `# =============================================================
# 图像处理基础 —— 用纯 Python 实现经典图像处理算法
# =============================================================
# 用二维列表模拟图像，不依赖任何第三方库
# 实现：灰度化、二值化、均值/中值滤波、Sobel 边缘检测、形态学操作

import math

# -------------------------------------------------------------
# 工具函数：构造一张测试图像 (8x8 灰度图)
# -------------------------------------------------------------
def make_test_image():
    """构造一张 8x8 的灰度测试图，左半亮、右半暗，模拟一个边缘"""
    image = []
    for y in range(8):
        row = []
        for x in range(8):
            # 左半部分亮 (200)，右半部分暗 (50)
            if x < 4:
                base = 200
            else:
                base = 50
            # 加入一点噪声
            noise = ((x * 7 + y * 3) % 5) - 2
            row.append(max(0, min(255, base + noise)))
        image.append(row)
    return image

img = make_test_image()

print("=== 原始图像 (8x8 灰度) ===")
for row in img:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 1. 二值化（全局阈值）
# -------------------------------------------------------------
def binarize(image, threshold=128):
    """将灰度图二值化：>=阈值 -> 255 (白)，否则 -> 0 (黑)"""
    result = []
    for row in image:
        new_row = [255 if v >= threshold else 0 for v in row]
        result.append(new_row)
    return result

binary = binarize(img, threshold=128)
print("\\n=== 二值化 (阈值=128) ===")
for row in binary:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 2. 大津法 (Otsu) 自动阈值
# -------------------------------------------------------------
def otsu_threshold(image):
    """用大津法自动计算最佳阈值"""
    # 1. 计算直方图
    hist = [0] * 256
    for row in image:
        for v in row:
            hist[v] += 1
    total = sum(hist)

    # 2. 遍历所有阈值，找类间方差最大的
    best_t = 0
    best_var = -1
    for t in range(256):
        w0 = sum(hist[:t]) / total  # 背景比例
        w1 = sum(hist[t:]) / total  # 前景比例
        if w0 == 0 or w1 == 0:
            continue
        # 背景均值
        mu0 = sum(i * hist[i] for i in range(t)) / (w0 * total) if w0 > 0 else 0
        # 前景均值
        mu1 = sum(i * hist[i] for i in range(t, 256)) / (w1 * total) if w1 > 0 else 0
        # 类间方差
        var_between = w0 * w1 * (mu0 - mu1) ** 2
        if var_between > best_var:
            best_var = var_between
            best_t = t
    return best_t

auto_t = otsu_threshold(img)
print(f"\\n=== Otsu 自动阈值 = {auto_t} ===")
binary_auto = binarize(img, threshold=auto_t)
for row in binary_auto:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 3. 二维卷积（通用实现）
# -------------------------------------------------------------
def convolve2d(image, kernel):
    """二维卷积：核与图像卷积，边界用零填充"""
    h = len(image)
    w = len(image[0])
    kh = len(kernel)
    kw = len(kernel[0])
    pad_y = kh // 2
    pad_x = kw // 2

    # 零填充扩展图像
    padded = [[0] * (w + 2 * pad_x) for _ in range(h + 2 * pad_y)]
    for y in range(h):
        for x in range(w):
            padded[y + pad_y][x + pad_x] = image[y][x]

    # 卷积
    result = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            acc = 0
            for ky in range(kh):
                for kx in range(kw):
                    acc += padded[y + ky][x + kx] * kernel[ky][kx]
            result[y][x] = int(acc)
    return result

# -------------------------------------------------------------
# 4. 均值滤波 (3x3)
# -------------------------------------------------------------
mean_kernel = [
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9],
]

blurred = convolve2d(img, mean_kernel)
print("\\n=== 均值滤波 (3x3) ===")
for row in blurred:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 5. 高斯滤波 (3x3)
# -------------------------------------------------------------
gaussian_kernel = [
    [1/16, 2/16, 1/16],
    [2/16, 4/16, 2/16],
    [1/16, 2/16, 1/16],
]
gaussian_blurred = convolve2d(img, gaussian_kernel)
print("\\n=== 高斯滤波 (3x3) ===")
for row in gaussian_blurred:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 6. 中值滤波 (3x3) —— 对椒盐噪声有效
# -------------------------------------------------------------
def median_filter(image, ksize=3):
    """中值滤波：取邻域中位数"""
    h = len(image)
    w = len(image[0])
    pad = ksize // 2
    padded = [[0] * (w + 2 * pad) for _ in range(h + 2 * pad)]
    for y in range(h):
        for x in range(w):
            padded[y + pad][x + pad] = image[y][x]

    result = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            window = []
            for ky in range(ksize):
                for kx in range(ksize):
                    window.append(padded[y + ky][x + kx])
            window.sort()
            result[y][x] = window[len(window) // 2]
    return result

median_img = median_filter(img, ksize=3)
print("\\n=== 中值滤波 (3x3) ===")
for row in median_img:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 7. Sobel 边缘检测
# -------------------------------------------------------------
sobel_x = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
]
sobel_y = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1],
]

gx = convolve2d(img, sobel_x)
gy = convolve2d(img, sobel_y)

print("\\n=== Sobel 梯度 Gx (水平方向) ===")
for row in gx:
    print([f"{v:4d}" for v in row])

print("\\n=== Sobel 梯度 Gy (垂直方向) ===")
for row in gy:
    print([f"{v:4d}" for v in row])

# 梯度幅值
gradient_mag = []
for y in range(len(gx)):
    row = []
    for x in range(len(gx[0])):
        mag = int(math.sqrt(gx[y][x] ** 2 + gy[y][x] ** 2))
        row.append(min(255, mag))
    gradient_mag.append(row)

print("\\n=== 梯度幅值 (边缘强度) ===")
for row in gradient_mag:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 8. Laplacian 边缘检测 (二阶导数)
# -------------------------------------------------------------
laplacian_kernel = [
    [ 0,  1,  0],
    [ 1, -4,  1],
    [ 0,  1,  0],
]
lap = convolve2d(img, laplacian_kernel)
print("\\n=== Laplacian 边缘检测 ===")
for row in lap:
    print([f"{v:4d}" for v in row])

# -------------------------------------------------------------
# 9. 形态学操作：腐蚀与膨胀
# -------------------------------------------------------------
def erode(binary_image, ksize=3):
    """腐蚀：邻域全为 255 才保留 255"""
    h = len(binary_image)
    w = len(binary_image[0])
    pad = ksize // 2
    padded = [[0] * (w + 2 * pad) for _ in range(h + 2 * pad)]
    for y in range(h):
        for x in range(w):
            padded[y + pad][x + pad] = binary_image[y][x]

    result = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            keep = True
            for ky in range(ksize):
                for kx in range(ksize):
                    if padded[y + ky][x + kx] != 255:
                        keep = False
                        break
                if not keep:
                    break
            result[y][x] = 255 if keep else 0
    return result

def dilate(binary_image, ksize=3):
    """膨胀：邻域有 255 即变 255"""
    h = len(binary_image)
    w = len(binary_image[0])
    pad = ksize // 2
    padded = [[0] * (w + 2 * pad) for _ in range(h + 2 * pad)]
    for y in range(h):
        for x in range(w):
            padded[y + pad][x + pad] = binary_image[y][x]

    result = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            for ky in range(ksize):
                for kx in range(ksize):
                    if padded[y + ky][x + kx] == 255:
                        result[y][x] = 255
                        break
                if result[y][x] == 255:
                    break
    return result

print("\\n=== 形态学操作 ===")
print("二值图：")
for row in binary:
    print([f"{v:3d}" for v in row])

eroded = erode(binary, ksize=3)
print("\\n腐蚀后（前景缩小）：")
for row in eroded:
    print([f"{v:3d}" for v in row])

dilated = dilate(binary, ksize=3)
print("\\n膨胀后（前景扩大）：")
for row in dilated:
    print([f"{v:3d}" for v in row])

# 开运算 = 腐蚀 -> 膨胀
opened = dilate(erode(binary))
print("\\n开运算（去白点噪声）：")
for row in opened:
    print([f"{v:3d}" for v in row])

# 闭运算 = 膨胀 -> 腐蚀
closed = erode(dilate(binary))
print("\\n闭运算（填黑孔）：")
for row in closed:
    print([f"{v:3d}" for v in row])

# 形态学梯度 = 膨胀 - 腐蚀
gradient = []
for y in range(len(dilated)):
    row = [dilated[y][x] - eroded[y][x] for x in range(len(dilated[0]))]
    gradient.append(row)
print("\\n形态学梯度（边缘提取）：")
for row in gradient:
    print([f"{v:3d}" for v in row])

# -------------------------------------------------------------
# 10. 锐化滤波 (Laplacian 锐化)
# -------------------------------------------------------------
sharpen_kernel = [
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0],
]
sharpened = convolve2d(img, sharpen_kernel)
print("\\n=== 锐化滤波 ===")
for row in sharpened:
    print([f"{v:3d}" for v in row])

print("\\n[完成] 经典图像处理算法演示完毕")
`,
  },
  {
    id: "aipy-cnn",
    icon: "🧠",
    group: "计算机视觉",
    title: "卷积神经网络 CNN",
    content: `
# 卷积神经网络 CNN

卷积神经网络（Convolutional Neural Network，CNN）是计算机视觉领域最核心的深度学习模型。从 2012 年 AlexNet 引爆深度学习热潮开始，CNN 几乎统治了所有视觉任务，直到近年来 Transformer 的挑战。理解 CNN 是理解现代计算机视觉的必经之路。

## 一、为什么需要 CNN

### 1.1 全连接网络的局限

如果我们用传统的全连接神经网络（MLP）处理图像，会遇到几个严重问题：

**参数量爆炸**。一张 224x224 的彩色图像有 224*224*3 = 150528 个输入。如果第一层有 1000 个神经元，仅这一层就有 1.5 亿参数。深层网络的参数量更是天文数字，难以训练且容易过拟合。

**丢失空间结构**。全连接网络将图像展平为一维向量，破坏了像素间的二维空间关系。而图像的语义信息大量存在于局部空间结构中（边缘、纹理、形状）。

**不具备平移不变性**。一只猫在图像左上角和右下角，对全连接网络是两个完全不同的输入。而人类视觉系统天然具备平移不变性——物体位置变化不影响识别。

### 1.2 CNN 的三大核心思想

CNN 通过三个关键设计解决上述问题：

1. **局部连接**（Local Connectivity）：每个神经元只与输入的一个局部区域相连，这个区域称为**感受野**（receptive field）。
2. **权值共享**（Weight Sharing）：同一个卷积核在整张图像上滑动，所有位置共享同一组参数。
3. **空间下采样**（Spatial Subsampling）：通过池化层逐渐降低空间分辨率，提取更抽象的特征。

这三者共同使 CNN 参数量大幅减少，同时具备平移不变性和层次化特征学习能力。

## 二、卷积操作详解

### 2.1 卷积的数学定义

二维卷积的数学定义：

\`\`(I * K)(i, j) = sum_m sum_n I(i-m, j-n) * K(m, n)\`\`

在深度学习中，实际使用的是**互相关**（cross-correlation），省略了核的翻转：

\`\`(I * K)(i, j) = sum_m sum_n I(i+m, j+n) * K(m, n)\`\`

### 2.2 卷积的过程

假设输入图像大小为 HxW，卷积核大小为 KxK：

1. 将卷积核放在输入图像的左上角。
2. 将核与覆盖区域逐元素相乘并求和。
3. 得到输出图像的一个像素。
4. 按步长（stride）滑动核，重复上述过程。

### 2.3 输出尺寸计算

输出尺寸由四个参数决定：
- 输入尺寸 N
- 卷积核大小 K
- 步长 stride S
- 填充 padding P

输出尺寸 = floor((N + 2P - K) / S) + 1

例如输入 32x32，核 3x3，步长 1，填充 1：
输出 = (32 + 2 - 3) / 1 + 1 = 32（尺寸不变）

如果步长 2，填充 1：
输出 = (32 + 2 - 3) / 2 + 1 = 16（尺寸减半）

### 2.4 填充（Padding）

**Same Padding**：填充使输出尺寸与输入相同。对于 KxK 核，填充 P = (K-1)/2（K 为奇数时）。

**Valid Padding**：不填充，输出尺寸为 (N-K+1)。

### 2.5 步长（Stride）

步长是核每次滑动的距离。步长 > 1 可以减小输出尺寸，相当于下采样。

### 2.6 多通道卷积

实际图像通常有多个通道（RGB 3 通道，特征图可能有 64/128/256 通道）。卷积核的通道数必须与输入通道数相同。

例如输入是 6x6x3（HxWxC），卷积核是 3x3x3，输出是 4x4x1。

如果要输出多个通道，就用多个卷积核：N 个 3x3x3 的核，输出 4x4xN。

### 2.7 卷积参数量计算

假设输入通道数 Cin，输出通道数 Cout，卷积核 KxK：
- 参数量 = K * K * Cin * Cout + Cout（偏置）

例如 3x3 卷积，输入 64 通道，输出 128 通道：
参数量 = 3 * 3 * 64 * 128 + 128 = 73856

相比全连接层，参数量大幅减少。

## 三、池化层（Pooling）

### 3.1 池化的作用

池化层用于下采样，主要作用：
- 减小特征图尺寸，降低计算量。
- 增大感受野。
- 提供一定的平移不变性。
- 减少参数量，抑制过拟合。

### 3.2 最大池化（Max Pooling）

取每个池化窗口内的最大值。最常用，能保留最显著的特征。

### 3.3 平均池化（Average Pooling）

取窗口内平均值。更平滑，但可能丢失强响应。

### 3.4 全局平均池化（Global Average Pooling, GAP）

对整个特征图求平均，输出一个值。常用于替代全连接层，大幅减少参数量。GoogLeNet、ResNet 都使用 GAP。

### 3.5 池化的参数

池化没有可学习参数。常用配置：
- 窗口大小：2x2
- 步长：2
- 输出尺寸 = floor((N - K) / S) + 1

## 四、感受野（Receptive Field）

### 4.1 感受野的定义

感受野是指输出特征图上一个像素对应输入图像上的区域大小。它决定了网络能"看到"多大范围的上下文。

### 4.2 感受野的计算

单层感受野等于卷积核大小。多层感受野逐层累加：

\`\`RF_l = RF_{l-1} + (K_l - 1) * prod_{i=1}^{l-1} S_i\`\`

其中 RF_l 是第 l 层的感受野，K_l 是第 l 层卷积核大小，S_i 是第 i 层步长。

### 4.3 例子

假设网络结构：3x3 卷积 -> 3x3 卷积 -> 3x3 卷积（步长都为 1）：
- 第 1 层：RF = 3
- 第 2 层：RF = 3 + (3-1)*1 = 5
- 第 3 层：RF = 5 + (3-1)*1 = 7

三层 3x3 卷积的感受野等于一层 7x7 卷积，但参数量是 3*3*3 = 27 vs 7*7 = 49。这就是 VGG 用小卷积核替代大卷积核的原因。

### 4.4 有效感受野

理论感受野是计算值，但实际网络对感受野中心区域的响应更强，称为有效感受野。研究表明有效感受野远小于理论感受野，呈高斯分布。

## 五、激活函数

### 5.1 ReLU

ReLU(x) = max(0, x)

优点：
- 计算简单快速。
- 缓解梯度消失问题。
- 产生稀疏激活。

缺点：
- 负输入梯度为 0，可能导致"神经元死亡"。

### 5.2 ReLU 变体

- **Leaky ReLU**：负输入乘以小斜率（如 0.01）。
- **PReLU**：斜率作为可学习参数。
- **ELU**：负输入用指数函数，更平滑。
- **GELU**：高斯误差线性单元，Transformer 常用。

### 5.3 Sigmoid 和 Tanh

早期 CNN 使用 Sigmoid/Tanh，但容易梯度消失，现已被 ReLU 系列取代。

## 六、经典 CNN 架构

### 6.1 LeNet-5 (1998)

Yann LeCun 提出的 LeNet-5 是第一个成功的 CNN，用于手写数字识别（MNIST）。

结构：输入 32x32 -> C1 卷积 6@28x28 -> S2 池化 6@14x14 -> C3 卷积 16@10x10 -> S4 池化 16@5x5 -> C5 全连接 120 -> F6 全连接 84 -> 输出 10。

LeNet 确立了 CNN 的基本范式：卷积-池化-卷积-池化-全连接。但由于计算资源限制，深度学习当时未被广泛接受。

### 6.2 AlexNet (2012)

Alex Krizhevsky 在 2012 年 ImageNet 比赛中以巨大优势夺冠，引爆深度学习。

创新点：
- 8 层网络（5 卷积 + 3 全连接）。
- ReLU 激活函数（替代 Tanh）。
- Dropout 防止过拟合。
- 数据增强（裁剪、翻转）。
- GPU 训练（两块 GTX 580）。
- 局部响应归一化（LRN）。

### 6.3 VGG (2014)

Oxford VGG 组提出，核心思想：用堆叠的小卷积核（3x3）替代大卷积核。

VGG-16 有 16 层，VGG-19 有 19 层。结构非常规整，每经过一次池化，通道数翻倍。

贡献：
- 证明网络深度对性能至关重要。
- 3x3 卷积成为标准。
- 但参数量很大（1.38 亿），计算量大。

### 6.4 GoogLeNet / Inception (2014)

Google 提出，引入 Inception 模块，并行使用不同尺寸的卷积核：

\`\`
1x1 卷积  -> 输出
3x3 卷积  -> 输出
5x5 卷积  -> 输出
3x3 池化  -> 输出
拼接所有输出
\`\`

创新点：
- Inception 模块并行多尺度特征提取。
- 1x1 卷积降维，减少计算量。
- 全局平均池化替代全连接层。
- 22 层网络，参数量仅 700 万（远少于 VGG）。

后续 Inception v2/v3/v4 不断改进，引入 BatchNorm、标签平滑等技巧。

### 6.5 ResNet (2015)

何恺明等提出的 ResNet 是 CNN 历史上最重要的架构之一，解决了深层网络退化问题。

**残差连接**：

\`\`y = F(x) + x\`\`

其中 F(x) 是残差映射，x 是恒等映射。如果最优解接近恒等映射，网络只需学习 F(x) ≈ 0，比直接学习恒等映射容易。

贡献：
- 训练 152 层甚至 1000 层网络。
- 残差连接成为深度学习的标配。
- 赢得 2015 ImageNet 冠军。

### 6.6 DenseNet (2017)

每层都与其前面所有层直接连接，特征复用。

### 6.7 MobileNet / ShuffleNet

针对移动端设计的轻量级网络：
- MobileNet：深度可分离卷积。
- ShuffleNet：通道洗牌 + 分组卷积。

## 七、CNN 的训练

### 7.1 前向传播

输入 -> 卷积 -> 激活 -> 池化 -> ... -> 全连接 -> softmax 输出。

### 7.2 反向传播

卷积层的反向传播本质上是卷积运算（旋转 180° 的转置卷积）。池化层反向传播时，梯度只传给前向传播时被选中的最大值位置（max pooling）。

### 7.3 优化技巧

- **Batch Normalization**：稳定训练，加速收敛。
- **Adam 优化器**：自适应学习率。
- **学习率调度**：余弦退火、warmup。
- **数据增强**：随机裁剪、翻转、颜色抖动、MixUp、CutMix。
- **Dropout**：随机失活神经元。
- **权重衰减**（L2 正则化）。

## 八、CNN 的可视化与可解释性

### 8.1 特征图可视化

观察每一层输出的特征图，低层学习边缘、纹理，高层学习语义部件。

### 8.2 卷积核可视化

直接查看学到的卷积核，低层核类似 Gabor 滤波器。

### 8.3 类激活图（CAM/Grad-CAM）

用梯度信息定位图像中对分类决策最重要的区域，生成热力图。

### 8.4 显著图（Saliency Map）

计算输出对输入的梯度，反映每个输入像素的重要性。

## 九、CNN 的局限与 Transformer 的挑战

### 9.1 CNN 的局限

- 感受野有限，难以建模长距离依赖。
- 卷积是局部操作，全局信息需要多层堆叠。
- 归纳偏置（局部性、平移不变性）有时是限制。

### 9.2 Vision Transformer (ViT)

2020 年 Google 提出 ViT，将图像切分为 16x16 的 patch，当作 token 输入 Transformer。在大数据预训练下，ViT 性能超越 CNN。

### 9.3 Swin Transformer

微软提出 Swin Transformer，引入层级结构和窗口注意力，兼顾效率和性能，成为新一代视觉骨干网络。

### 9.4 ConvNeXt

2022 年 Facebook 提出 ConvNeXt，借鉴 Transformer 设计理念改进 CNN，证明纯 CNN 仍能达到 SOTA 性能。

## 十、本章小结

CNN 通过卷积、池化、激活函数构建层次化特征提取体系。核心要点：
- **卷积**：局部连接 + 权值共享，提取空间特征。
- **池化**：下采样，扩大感受野，增加不变性。
- **感受野**：决定网络能看到的范围。
- **经典架构**：LeNet -> AlexNet -> VGG -> GoogLeNet -> ResNet，深度与性能正相关。
- **残差连接**：解决深层网络退化，是现代深度学习的基石。

代码部分用纯 Python 实现了卷积、池化、ReLU、前向传播等核心操作，帮助你从底层理解 CNN 的工作机制。
`,
    code: `# =============================================================
# 卷积神经网络 CNN —— 用纯 Python 实现核心操作
# =============================================================
# 不依赖任何第三方库，用嵌套列表模拟张量
# 实现：卷积、ReLU、最大池化、前向传播、感受野计算

import math

# -------------------------------------------------------------
# 1. 二维卷积（单通道输入 -> 单通道输出）
# -------------------------------------------------------------
def conv2d_single(input_2d, kernel_2d, stride=1, padding=0):
    """单通道卷积"""
    h = len(input_2d)
    w = len(input_2d[0])
    kh = len(kernel_2d)
    kw = len(kernel_2d[0])

    # 零填充
    if padding > 0:
        padded = [[0] * (w + 2 * padding) for _ in range(h + 2 * padding)]
        for y in range(h):
            for x in range(w):
                padded[y + padding][x + padding] = input_2d[y][x]
    else:
        padded = input_2d

    ph = len(padded)
    pw = len(padded[0])
    out_h = (ph - kh) // stride + 1
    out_w = (pw - kw) // stride + 1

    output = [[0] * out_w for _ in range(out_h)]
    for oy in range(out_h):
        for ox in range(out_w):
            acc = 0
            for ky in range(kh):
                for kx in range(kw):
                    acc += padded[oy * stride + ky][ox * stride + kx] * kernel_2d[ky][kx]
            output[oy][ox] = acc
    return output

# 测试卷积
input_img = [
    [1, 2, 0, 3, 1],
    [4, 1, 2, 0, 2],
    [0, 3, 1, 4, 1],
    [2, 1, 0, 3, 2],
    [1, 0, 2, 1, 3],
]

# 水平边缘检测核
kernel_h = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
]

print("=== 输入图像 (5x5) ===")
for row in input_img:
    print(row)

print("\\n=== 卷积核 (Sobel 水平 3x3) ===")
for row in kernel_h:
    print(row)

output = conv2d_single(input_img, kernel_h, stride=1, padding=0)
print("\\n=== 卷积结果 (3x3, 无填充, stride=1) ===")
for row in output:
    print(row)

# same padding
output_same = conv2d_single(input_img, kernel_h, stride=1, padding=1)
print("\\n=== 卷积结果 (5x5, same padding, stride=1) ===")
for row in output_same:
    print(row)

# stride=2
output_s2 = conv2d_single(input_img, kernel_h, stride=2, padding=1)
print("\\n=== 卷积结果 (3x3, stride=2, padding=1) ===")
for row in output_s2:
    print(row)

# -------------------------------------------------------------
# 2. 多通道卷积（模拟真实 CNN）
# -------------------------------------------------------------
def conv2d_multi(input_3d, kernels_4d, stride=1, padding=0):
    """
    input_3d: [C_in][H][W]
    kernels_4d: [C_out][C_in][KH][KW]
    返回: [C_out][H_out][W_out]
    """
    c_in = len(input_3d)
    h = len(input_3d[0])
    w = len(input_3d[0][0])
    c_out = len(kernels_4d)
    kh = len(kernels_4d[0][0])
    kw = len(kernels_4d[0][0][0])

    # 对每个输入通道做零填充
    if padding > 0:
        padded = [[[0] * (w + 2 * padding) for _ in range(h + 2 * padding)]
                  for _ in range(c_in)]
        for c in range(c_in):
            for y in range(h):
                for x in range(w):
                    padded[c][y + padding][x + padding] = input_3d[c][y][x]
    else:
        padded = input_3d

    ph = len(padded[0])
    pw = len(padded[0][0])
    out_h = (ph - kh) // stride + 1
    out_w = (pw - kw) // stride + 1

    output = [[[0] * out_w for _ in range(out_h)] for _ in range(c_out)]

    for oc in range(c_out):  # 每个输出通道
        for oy in range(out_h):
            for ox in range(out_w):
                acc = 0
                for ic in range(c_in):  # 累加所有输入通道
                    for ky in range(kh):
                        for kx in range(kw):
                            acc += padded[ic][oy * stride + ky][ox * stride + kx] \\
                                   * kernels_4d[oc][ic][ky][kx]
                output[oc][oy][ox] = acc
    return output

# 模拟 RGB 三通道输入 (3 通道 x 5x5)
rgb_input = [
    [[1, 2, 0, 3, 1],   # R 通道
     [4, 1, 2, 0, 2],
     [0, 3, 1, 4, 1],
     [2, 1, 0, 3, 2],
     [1, 0, 2, 1, 3]],
    [[2, 1, 3, 0, 2],   # G 通道
     [1, 3, 0, 2, 1],
     [3, 0, 2, 1, 4],
     [0, 2, 1, 3, 0],
     [2, 1, 0, 3, 1]],
    [[0, 1, 2, 1, 0],   # B 通道
     [2, 0, 1, 3, 2],
     [1, 2, 0, 1, 3],
     [3, 1, 2, 0, 1],
     [0, 2, 1, 3, 2]],
]

# 2 个输出通道的卷积核 (2 x 3 x 3 x 3)
conv_kernels = [
    # 输出通道 0
    [[[1, 0, -1], [1, 0, -1], [1, 0, -1]],
     [[1, 0, -1], [1, 0, -1], [1, 0, -1]],
     [[1, 0, -1], [1, 0, -1], [1, 0, -1]]],
    # 输出通道 1
    [[[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
     [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
     [[-1, -1, -1], [0, 0, 0], [1, 1, 1]]],
]

multi_out = conv2d_multi(rgb_input, conv_kernels, stride=1, padding=1)
print("\\n=== 多通道卷积 (输入 3x5x5, 核 2x3x3x3, same padding) ===")
print(f"输出形状: {len(multi_out)} 通道 x {len(multi_out[0])} x {len(multi_out[0][0])}")
print("输出通道 0:")
for row in multi_out[0]:
    print(row)
print("输出通道 1:")
for row in multi_out[1]:
    print(row)

# -------------------------------------------------------------
# 3. ReLU 激活函数
# -------------------------------------------------------------
def relu(feature_map):
    """ReLU: max(0, x)"""
    if isinstance(feature_map[0][0], list):  # 多通道
        return [[[max(0, v) for v in row] for row in ch] for ch in feature_map]
    else:  # 单通道
        return [[max(0, v) for v in row] for row in feature_map]

relu_out = relu(multi_out)
print("\\n=== ReLU 激活后 ===")
print("输出通道 0:")
for row in relu_out[0]:
    print(row)

# -------------------------------------------------------------
# 4. 最大池化 (Max Pooling)
# -------------------------------------------------------------
def max_pool2d(feature_map, size=2, stride=2):
    """最大池化"""
    if isinstance(feature_map[0][0], list):  # 多通道
        return [max_pool2d(ch, size, stride) for ch in feature_map]
    h = len(feature_map)
    w = len(feature_map[0])
    out_h = (h - size) // stride + 1
    out_w = (w - size) // stride + 1
    output = [[0] * out_w for _ in range(out_h)]
    for oy in range(out_h):
        for ox in range(out_w):
            max_val = float('-inf')
            for ky in range(size):
                for kx in range(size):
                    v = feature_map[oy * stride + ky][ox * stride + kx]
                    if v > max_val:
                        max_val = v
            output[oy][ox] = max_val
    return output

pooled = max_pool2d(relu_out, size=2, stride=2)
print("\\n=== 最大池化 (2x2, stride=2) ===")
print(f"池化后形状: {len(pooled)} 通道 x {len(pooled[0])} x {len(pooled[0][0])}")
print("通道 0:")
for row in pooled[0]:
    print(row)

# -------------------------------------------------------------
# 5. 平均池化
# -------------------------------------------------------------
def avg_pool2d(feature_map, size=2, stride=2):
    """平均池化"""
    if isinstance(feature_map[0][0], list):
        return [avg_pool2d(ch, size, stride) for ch in feature_map]
    h = len(feature_map)
    w = len(feature_map[0])
    out_h = (h - size) // stride + 1
    out_w = (w - size) // stride + 1
    output = [[0] * out_w for _ in range(out_h)]
    for oy in range(out_h):
        for ox in range(out_w):
            total = 0
            for ky in range(size):
                for kx in range(size):
                    total += feature_map[oy * stride + ky][ox * stride + kx]
            output[oy][ox] = total / (size * size)
    return output

avg_pooled = avg_pool2d(relu_out, size=2, stride=2)
print("\\n=== 平均池化 (2x2) ===")
print("通道 0:")
for row in avg_pooled[0]:
    print(row)

# -------------------------------------------------------------
# 6. 全局平均池化 (GAP)
# -------------------------------------------------------------
def global_avg_pool(feature_map):
    """GAP: 每个通道求一个平均值"""
    if isinstance(feature_map[0][0], list):
        return [global_avg_pool(ch) for ch in feature_map]
    total = sum(v for row in feature_map for v in row)
    return total / (len(feature_map) * len(feature_map[0]))

gap_result = global_avg_pool(relu_out)
print("\\n=== 全局平均池化 (GAP) ===")
print(f"每通道输出一个值: {gap_result}")

# -------------------------------------------------------------
# 7. 感受野计算
# -------------------------------------------------------------
def compute_receptive_field(layers):
    """
    layers: 每层是一个 dict，包含 kernel_size 和 stride
    返回每层的感受野
    """
    rf = 1
    cum_stride = 1
    print(f"初始感受野: {rf}")
    for i, layer in enumerate(layers):
        k = layer["kernel_size"]
        s = layer["stride"]
        rf = rf + (k - 1) * cum_stride
        cum_stride *= s
        print(f"第 {i+1} 层 (k={k}, s={s}): 感受野={rf}, 累积步长={cum_stride}")
    return rf

print("\\n=== 感受野计算 ===")
print("\\n场景1: 3 层 3x3 卷积, stride=1")
layers1 = [
    {"kernel_size": 3, "stride": 1},
    {"kernel_size": 3, "stride": 1},
    {"kernel_size": 3, "stride": 1},
]
rf1 = compute_receptive_field(layers1)
print(f"最终感受野: {rf1} (等价于一个 7x7 卷积)")

print("\\n场景2: VGG 风格 (5 个 3x3 卷积 + 2x2 池化交替)")
layers2 = [
    {"kernel_size": 3, "stride": 1},  # conv
    {"kernel_size": 3, "stride": 1},  # conv
    {"kernel_size": 2, "stride": 2},  # pool
    {"kernel_size": 3, "stride": 1},  # conv
    {"kernel_size": 3, "stride": 1},  # conv
    {"kernel_size": 2, "stride": 2},  # pool
]
rf2 = compute_receptive_field(layers2)
print(f"最终感受野: {rf2}")

# -------------------------------------------------------------
# 8. 输出尺寸计算
# -------------------------------------------------------------
def output_size(input_size, kernel_size, stride, padding):
    """计算卷积/池化输出尺寸"""
    return (input_size + 2 * padding - kernel_size) // stride + 1

print("\\n=== 输出尺寸计算 ===")
cases = [
    (224, 3, 1, 1, "VGG 3x3 conv same"),
    (224, 3, 2, 1, "stride=2 下采样"),
    (224, 7, 2, 3, "ResNet 第一层 7x7 stride=2"),
    (112, 2, 2, 0, "2x2 池化 stride=2"),
]
for n, k, s, p, desc in cases:
    out = output_size(n, k, s, p)
    print(f"  {desc}: 输入 {n}, 核 {k}, stride {s}, padding {p} -> 输出 {out}")

# -------------------------------------------------------------
# 9. 参数量计算
# -------------------------------------------------------------
def conv_params(c_in, c_out, kernel_size):
    """计算卷积层参数量"""
    weights = kernel_size * kernel_size * c_in * c_out
    biases = c_out
    return weights + biases

print("\\n=== 参数量计算 ===")
conv_configs = [
    (3, 64, 3, "第一层 (3->64, 3x3)"),
    (64, 128, 3, "中间层 (64->128, 3x3)"),
    (256, 512, 3, "深层 (256->512, 3x3)"),
    (3, 96, 11, "AlexNet 第一层 (3->96, 11x11)"),
]
for c_in, c_out, k, desc in conv_configs:
    params = conv_params(c_in, c_out, k)
    print(f"  {desc}: {params:,} 参数")

# -------------------------------------------------------------
# 10. 简化 CNN 前向传播（LeNet 风格）
# -------------------------------------------------------------
print("\\n=== 简化 CNN 前向传播模拟 ===")

# 输入: 1x8x8 灰度图
sample_input = [[[1,2,3,4,5,6,7,8],
                 [2,3,4,5,6,7,8,9],
                 [3,4,5,6,7,8,9,1],
                 [4,5,6,7,8,9,1,2],
                 [5,6,7,8,9,1,2,3],
                 [6,7,8,9,1,2,3,4],
                 [7,8,9,1,2,3,4,5],
                 [8,9,1,2,3,4,5,6]]]

# 第 1 个卷积核 (3x3 边缘检测)
conv1_kernel = [[[[1,0,-1],[1,0,-1],[1,0,-1]]]]  # 1 输出通道 x 1 输入通道 x 3x3

print(f"输入形状: 1 x {len(sample_input[0])} x {len(sample_input[0][0])}")

# Conv1
conv1_out = conv2d_multi(sample_input, conv1_kernel, stride=1, padding=1)
print(f"Conv1 后: {len(conv1_out)} x {len(conv1_out[0])} x {len(conv1_out[0][0])}")

# ReLU1
relu1_out = relu(conv1_out)
print(f"ReLU1 后: 同形状")

# Pool1
pool1_out = max_pool2d(relu1_out, size=2, stride=2)
print(f"Pool1 后: {len(pool1_out)} x {len(pool1_out[0])} x {len(pool1_out[0][0])}")

# GAP
gap = global_avg_pool(pool1_out)
print(f"GAP 后: {gap} (每通道一个值)")

# Softmax (简化)
def softmax(x):
    """数值稳定的 softmax"""
    if isinstance(x, list):
        max_x = max(x)
        exps = [math.exp(v - max_x) for v in x]
        total = sum(exps)
        return [e / total for e in exps]
    return x

probs = softmax(gap)
print(f"Softmax 输出: {probs}")

print("\\n[完成] CNN 核心操作演示完毕")
`,
  },
  {
    id: "aipy-detection",
    icon: "🎯",
    group: "计算机视觉",
    title: "目标检测入门",
    content: `
# 目标检测入门

目标检测（Object Detection）是计算机视觉中最重要、应用最广泛的任务之一。它不仅要识别图像中有什么物体，还要精确定位每个物体的位置。从自动驾驶识别行人和车辆，到安防监控发现异常，从医学影像定位病灶，到零售业商品识别，目标检测无处不在。

本章将系统讲解目标检测的核心概念、经典方法和现代算法。

## 一、目标检测问题定义

### 1.1 任务描述

给定一张图像，目标检测的输出是：
- 一组边界框（bounding box），每个框用 (x1, y1, x2, y2) 或 (cx, cy, w, h) 表示。
- 每个框的类别标签（cat、dog、person 等）。
- 每个框的置信度分数（confidence score，0-1）。

### 1.2 与图像分类的区别

图像分类是"图像级别"的任务：整张图一个标签。
目标检测是"实例级别"的任务：图中可能有多个物体，每个都要定位和分类。

### 1.3 难点

- **多尺度**：物体大小差异巨大（一只蚂蚁 vs 一头大象）。
- **多目标**：一张图可能有几十上百个物体。
- **遮挡**：物体被部分遮挡。
- **类内差异**：同类物体外观差异大。
- **背景干扰**：复杂背景下的误检。
- **实时性**：自动驾驶要求毫秒级响应。

## 二、早期方法：滑窗与经典检测器

### 2.1 滑动窗口（Sliding Window）

最直观的方法：在图像上滑动不同大小、不同长宽比的窗口，对每个窗口内的图像进行分类。

问题：
- 窗口大小、长宽比组合爆炸。
- 计算量极大（一张图可能要分类几万次）。
- 重叠窗口重复计算。

### 2.2 Viola-Jones 检测器 (2001)

第一个实时目标检测器，用于人脸检测。三大创新：

1. **Haar 特征**：黑白矩形模板，计算白色区域和黑色区域像素和的差值。能编码边缘、线条等局部特征。

2. **积分图**（Integral Image）：O(1) 计算任意矩形区域像素和，大幅加速特征计算。

3. **AdaBoost 级联分类器**：将多个弱分类器（决策树桩）组合成强分类器。级联结构：前面几层用少量特征快速排除大部分负样本，后面层用更多特征精细判断。

VJ 检测器在普通 CPU 上达到 15 FPS，是计算机视觉的里程碑。

### 2.3 HOG + SVM (2005)

Navneet Dalal 和 Bill Triggs 提出，用于行人检测。

- **HOG 特征**（方向梯度直方图）：将图像分块，每块计算梯度方向直方图，拼接成特征向量。对光照、阴影有一定不变性。
- **SVM 分类器**：用 HOG 特征训练线性 SVM。

HOG+SVM 在行人检测上效果很好，但只能检测单一类别，且对形变敏感。

### 2.4 DPM (Deformable Parts Model, 2008-2010)

Pedro Felzenszwalb 提出，DPM 是传统方法的巅峰。

核心思想：物体由一个根模型（root）和若干部件模型（parts）组成，部件之间允许有形变。

- 根滤波器捕捉整体形状。
- 部件滤波器捕捉细节（如人脸的眼睛、鼻子）。
- 形变代价：部件偏离理想位置要扣分。

DPM 在 PASCAL VOC 上长期占据榜首，直到被深度学习超越。

## 三、深度学习时代的目标检测

### 3.1 两阶段 vs 单阶段

现代检测器分为两大流派：

**两阶段（Two-stage）**：
1. 第一阶段：生成候选区域（region proposals）。
2. 第二阶段：对每个候选区域分类和回归边界框。

代表：R-CNN, Fast R-CNN, Faster R-CNN, Mask R-CNN。

优点：精度高。缺点：速度较慢。

**单阶段（One-stage）**：
直接从图像预测边界框和类别，无候选区域步骤。

代表：YOLO, SSD, RetinaNet。

优点：速度快。缺点：早期精度略低（现已赶上）。

## 四、R-CNN 系列

### 4.1 R-CNN (2014)

Ross Girshick 提出，将 CNN 引入目标检测。

流程：
1. Selective Search 生成约 2000 个候选区域。
2. 每个区域缩放到固定大小（如 227x227）。
3. 用 AlexNet 提取特征。
4. 用 SVM 分类。
5. 用边界框回归微调位置。

问题：每个候选区域独立过 CNN，重复计算严重，一张图要 47 秒。

### 4.2 Fast R-CNN (2015)

改进：整张图过一次 CNN，在特征图上提取候选区域（RoI Pooling）。

流程：
1. 整图过 CNN 得到特征图。
2. Selective Search 生成候选区域。
3. RoI Pooling 将不同大小区域映射到固定大小。
4. 全连接层分类 + 回归。

速度提升到 0.3 秒/图，瓶颈变成 Selective Search（2 秒/图）。

### 4.3 Faster R-CNN (2015)

最大创新：**区域建议网络**（Region Proposal Network, RPN），用神经网络替代 Selective Search。

RPN 工作原理：
1. 在特征图上滑动 3x3 窗口。
2. 每个位置预测 k 个锚框（anchor）的"是物体概率"和"位置偏移"。
3. 选出 top-N 候选区域。

Faster R-CNN 实现 RPN 和检测网络共享特征，端到端训练，速度达 5-17 FPS。

### 4.4 Mask R-CNN (2017)

在 Faster R-CNN 基础上增加一个掩码预测分支，实现实例分割。

将 RoI Pooling 改为 RoI Align，解决量化误差问题，提升掩码精度。

## 五、YOLO 系列

### 5.1 YOLO (2016)

Joseph Redmon 提出 "You Only Look Once"，开创单阶段检测。

核心思想：将检测视为回归问题。输入图像一次，直接输出所有边界框。

网络结构：
1. 图像划分为 SxS 网格（如 7x7）。
2. 每个网格预测 B 个边界框（如 2 个）和置信度。
3. 每个网格预测 C 个类别概率。
4. 输出张量：S x S x (B*5 + C)。

优点：极快（45-155 FPS），全局信息，背景误检少。
缺点：对密集小物体效果差，定位精度不如两阶段。

### 5.2 YOLOv2 / YOLO9000 (2017)

改进：
- Batch Normalization。
- Anchor boxes（借鉴 Faster R-CNN）。
- 多尺度训练。
- Darknet-19 骨干。
- 联合检测与分类，能识别 9000 类。

### 5.3 YOLOv3 (2018)

- Darknet-53 骨干（残差连接）。
- 多尺度预测（3 个尺度，针对不同大小物体）。
- 9 个 anchor（每尺度 3 个）。
- 类别预测用独立 logistic 分类器（支持多标签）。

### 5.4 YOLOv4-v8

YOLOv4 (Alexey Bochkovskiy)：CSPDarknet53、SPP、PANet、大量训练技巧。

YOLOv5 (Ultralytics)：PyTorch 实现，工程化优秀，部署友好。

YOLOv6/v7/v8：持续优化，YOLOv8 是 Ultralytics 最新版本，支持检测、分割、分类、姿态估计。

### 5.5 YOLO 的优势

- 速度极快，适合实时应用。
- 端到端，部署简单。
- 生态成熟，社区活跃。

## 六、SSD (Single Shot MultiBox Detector, 2016)

### 6.1 核心思想

SSD 在不同尺度的特征图上预测边界框，兼顾不同大小物体。

- 从多个特征图（如 6 个尺度）预测。
- 每个位置预测 k 个 anchor 的类别和偏移。
- 默认框（default box）类似 anchor。

### 6.2 特点

- 速度比 YOLO 快，精度比 YOLO 高。
- 多尺度特征图适合检测小物体。
- 但小物体精度仍不如两阶段方法。

## 七、RetinaNet (2017)

### 7.1 Focal Loss

单阶段检测器精度不如两阶段的原因：类别不平衡（背景框远多于物体框）。

Focal Loss = -(1-p_t)^γ * log(p_t)

- 当 p_t 接近 1（容易分类），loss 被压低。
- 当 p_t 接近 0（难分类），loss 基本不变。
- 让模型专注于难样本。

### 7.2 RetinaNet 结构

- ResNet 骨干 + FPN（特征金字塔）。
- 两个子网络：分类子网 + 回归子网。
- 使用 Focal Loss 训练。

RetinaNet 让单阶段检测器首次精度超越两阶段。

## 八、关键概念

### 8.1 锚框（Anchor Box）

预定义的一组边界框（不同大小、长宽比），检测器预测每个 anchor 的偏移量而非绝对坐标。

- Faster R-CNN：3 尺度 x 3 长宽比 = 9 anchor/位置。
- YOLOv3：3 尺度 x 3 anchor = 9 anchor/位置。
- anchor-free 方法（CenterNet、FCOS）逐渐兴起。

### 8.2 IoU（Intersection over Union）

IoU 衡量两个框的重叠程度：

IoU = 交集面积 / 并集面积

- IoU = 1：完全重合。
- IoU = 0：完全不重合。
- 通常 IoU > 0.5 算正确检测。

变体：GIoU、DIoU、CIoU，对梯度优化更友好。

### 8.3 NMS（Non-Maximum Suppression）

同一物体可能被多个框检测到，NMS 去除冗余框：

1. 按置信度排序所有框。
2. 选置信度最高的框，移除与其 IoU 超过阈值（如 0.5）的所有框。
3. 重复直到处理完所有框。

变体：Soft-NMS（不直接移除而是降低分数）、DIoU-NMS（考虑中心点距离）。

### 8.4 评价指标

**mAP（mean Average Precision）**：各类别 AP 的平均。

- AP@0.5：IoU 阈值 0.5。
- AP@0.5:0.95：IoU 从 0.5 到 0.95 每隔 0.05 计算一次，取平均（COCO 标准）。

**FPS（Frames Per Second）**：检测速度。

### 8.5 数据集

- **PASCAL VOC**：20 类，经典数据集。
- **COCO**：80 类，33 万图像，目标检测标准基准。
- **Open Images**：600 类，900 万图像。
- **LVIS**：长尾分布，1200 类。

## 九、损失函数

### 9.1 分类损失

- **交叉熵损失**：标准多分类损失。
- **Focal Loss**：解决类别不平衡。
- **Varifocal Loss**：不对称加权。

### 9.2 回归损失

边界框回归的损失函数演进：

1. **L1/L2 Loss**：直接回归坐标差。
2. **Smooth L1 Loss**：L1 和 L2 的结合，梯度更稳定。
3. **IoU Loss**：直接优化 IoU。
4. **GIoU Loss**：解决不相交时梯度为 0 的问题。
5. **DIoU/CIoU Loss**：考虑中心点距离和长宽比。

## 十、目标检测的工程实践

### 10.1 数据准备

- 标注工具：LabelImg、CVAT、Roboflow。
- 标注格式：PASCAL VOC XML、COCO JSON、YOLO TXT。
- 数据增强：Mosaic、MixUp、随机裁剪、颜色抖动。

### 10.2 训练技巧

- 预训练骨干（ImageNet、COCO）。
- 多尺度训练。
- 学习率 warmup + 余弦退火。
- EMA（指数移动平均）。
- 混合精度训练。

### 10.3 部署优化

- TensorRT 加速。
- ONNX 跨平台。
- 量化（INT8）。
- 剪枝、蒸馏。

### 10.4 实时检测系统

- 视频流处理：批量推理、流水线。
- 边缘设备：Jetson、移动端。
- 多目标跟踪：DeepSORT、ByteTrack。

## 十一、最新进展

### 11.1 Anchor-Free 检测器

- **CenterNet**：预测物体中心点。
- **FCOS**：逐像素预测。
- **CornerNet**：预测角点对。

### 11.2 Transformer 检测器

- **DETR**（2020）：用 Transformer 替代 NMS 等手工设计。
- **Deformable DETR**：可变形注意力，加速收敛。
- **DINO**：DETR 的 SOTA 版本。

### 11.3 多模态检测

- **Grounding DINO**：开放词汇检测，用文本描述指定检测目标。
- **OWL-ViT**：开放世界检测。
- **SAM**（Segment Anything）：通用分割模型。

## 十二、本章小结

目标检测经历了从经典方法（VJ、HOG+SVM、DPM）到深度学习（R-CNN 系列、YOLO 系列、SSD、RetinaNet）再到 Transformer（DETR）的演进。核心概念：
- **锚框**：预定义参考框，检测器预测偏移。
- **IoU**：衡量框重叠程度。
- **NMS**：去除冗余检测。
- **两阶段 vs 单阶段**：精度与速度的权衡。
- **Focal Loss**：解决类别不平衡。

代码部分用纯 Python 实现了 IoU、NMS、锚框生成、滑动窗口等核心算法，帮助你理解检测器的工作原理。
`,
    code: `# =============================================================
# 目标检测入门 —— 用纯 Python 实现检测核心算法
# =============================================================
# 实现：IoU、NMS、锚框生成、滑动窗口、边界框回归损失

import math

# -------------------------------------------------------------
# 1. 边界框表示与转换
# -------------------------------------------------------------
# 两种格式：xyxy (左上角+右下角) 和 xywh (中心点+宽高)

def xyxy_to_xywh(box):
    """(x1, y1, x2, y2) -> (cx, cy, w, h)"""
    x1, y1, x2, y2 = box
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    w = x2 - x1
    h = y2 - y1
    return (cx, cy, w, h)

def xywh_to_xyxy(box):
    """(cx, cy, w, h) -> (x1, y1, x2, y2)"""
    cx, cy, w, h = box
    x1 = cx - w / 2
    y1 = cy - h / 2
    x2 = cx + w / 2
    y2 = cy + h / 2
    return (x1, y1, x2, y2)

box_xyxy = (10, 20, 50, 80)
box_xywh = xyxy_to_xywh(box_xyxy)
print("=== 边界框格式转换 ===")
print(f"xyxy {box_xyxy} -> xywh {box_xywh}")
print(f"xywh {box_xywh} -> xyxy {xywh_to_xyxy(box_xywh)}")

# -------------------------------------------------------------
# 2. IoU 计算 (Intersection over Union)
# -------------------------------------------------------------
def compute_iou(box1, box2):
    """
    计算两个 xyxy 格式框的 IoU
    IoU = 交集面积 / 并集面积
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_w = max(0, x2 - x1)
    inter_h = max(0, y2 - y1)
    inter_area = inter_w * inter_h

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = area1 + area2 - inter_area

    if union_area == 0:
        return 0.0
    return inter_area / union_area

print("\\n=== IoU 计算示例 ===")
box_a = (10, 10, 50, 50)
box_b = (30, 30, 70, 70)
box_c = (60, 60, 100, 100)
print(f"Box A {box_a} 与 Box B {box_b} 的 IoU = {compute_iou(box_a, box_b):.3f}")
print(f"Box A {box_a} 与 Box C {box_c} 的 IoU = {compute_iou(box_a, box_c):.3f}")

# GIoU (Generalized IoU)
def compute_giou(box1, box2):
    """GIoU = IoU - (最小外接框 - 并集) / 最小外接框"""
    iou = compute_iou(box1, box2)
    # 最小外接框
    ex1 = min(box1[0], box2[0])
    ey1 = min(box1[1], box2[1])
    ex2 = max(box1[2], box2[2])
    ey2 = max(box1[3], box2[3])
    enclose_area = (ex2 - ex1) * (ey2 - ey1)

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = area1 + area2 - (iou * (area1 + area2 - iou * (area1 + area2)))

    if enclose_area == 0:
        return iou
    giou = iou - (enclose_area - union_area) / enclose_area
    return giou

print(f"Box A 与 Box B 的 GIoU = {compute_giou(box_a, box_b):.3f}")
print(f"Box A 与 Box C 的 GIoU = {compute_giou(box_a, box_c):.3f}")

# -------------------------------------------------------------
# 3. 锚框生成 (Anchor Generation)
# -------------------------------------------------------------
def generate_anchors(feature_size, image_size, anchor_scales, anchor_ratios):
    """
    在特征图每个位置生成锚框
    feature_size: (fh, fw) 特征图大小
    image_size: (iw, ih) 输入图像大小
    anchor_scales: [scale1, scale2, ...] 锚框面积
    anchor_ratios: [ratio1, ratio2, ...] 长宽比
    """
    fh, fw = feature_size
    iw, ih = image_size
    stride_x = iw / fw
    stride_y = ih / fh

    anchors = []
    for gy in range(fh):
        for gx in range(fw):
            cx = (gx + 0.5) * stride_x
            cy = (gy + 0.5) * stride_y
            for scale in anchor_scales:
                for ratio in anchor_ratios:
                    w = math.sqrt(scale / ratio)
                    h = math.sqrt(scale * ratio)
                    anchors.append((cx - w/2, cy - h/2, cx + w/2, cy + h/2))
    return anchors

print("\\n=== 锚框生成 ===")
# 特征图 4x4，输入图像 64x64
anchors = generate_anchors(
    feature_size=(4, 4),
    image_size=(64, 64),
    anchor_scales=[64, 128],   # 2 种面积
    anchor_ratios=[0.5, 1.0, 2.0],  # 3 种长宽比
)
print(f"特征图 4x4, 每位置 6 个锚框 (2 面积 x 3 长宽比)")
print(f"总锚框数: {len(anchors)}")
print(f"前 3 个锚框 (xyxy):")
for a in anchors[:3]:
    print(f"  ({a[0]:.1f}, {a[1]:.1f}, {a[2]:.1f}, {a[3]:.1f})")

# -------------------------------------------------------------
# 4. 边界框编码与解码 (回归目标)
# -------------------------------------------------------------
def encode_box(gt_box, anchor_box):
    """
    将真实框相对于锚框编码为偏移量
    tx = (gx - ax) / aw, ty = (gy - ay) / ah
    tw = log(gw / aw), th = log(gh / ah)
    """
    ax, ay, aw, ah = xyxy_to_xywh(anchor_box)
    gx, gy, gw, gh = xyxy_to_xywh(gt_box)
    tx = (gx - ax) / aw
    ty = (gy - ay) / ah
    tw = math.log(gw / aw) if aw > 0 and gw > 0 else 0
    th = math.log(gh / ah) if ah > 0 and gh > 0 else 0
    return (tx, ty, tw, th)

def decode_box(offset, anchor_box):
    """将偏移量解码为真实框"""
    tx, ty, tw, th = offset
    ax, ay, aw, ah = xyxy_to_xywh(anchor_box)
    gx = tx * aw + ax
    gy = ty * ah + ay
    gw = aw * math.exp(tw)
    gh = ah * math.exp(th)
    return xywh_to_xyxy((gx, gy, gw, gh))

print("\\n=== 边界框编码/解码 ===")
anchor = (10, 10, 50, 50)
gt = (20, 25, 60, 80)
offset = encode_box(gt, anchor)
print(f"锚框 {anchor}, 真实框 {gt}")
print(f"编码偏移: {offset}")
decoded = decode_box(offset, anchor)
print(f"解码还原: ({decoded[0]:.2f}, {decoded[1]:.2f}, {decoded[2]:.2f}, {decoded[3]:.2f})")

# -------------------------------------------------------------
# 5. 非极大值抑制 (NMS)
# -------------------------------------------------------------
def nms(boxes, scores, iou_threshold=0.5):
    """
    非极大值抑制
    boxes: xyxy 格式列表
    scores: 每个框的置信度
    返回保留的框索引
    """
    # 按分数降序排序
    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    keep = []

    while order:
        # 取分数最高的
        best_idx = order[0]
        keep.append(best_idx)
        rest = order[1:]
        order = []
        for idx in rest:
            iou = compute_iou(boxes[best_idx], boxes[idx])
            if iou < iou_threshold:  # 重叠度低，保留
                order.append(idx)
    return keep

print("\\n=== NMS 非极大值抑制 ===")
test_boxes = [
    (10, 10, 50, 50),   # 框1
    (12, 12, 52, 52),   # 框2 (与框1高度重叠)
    (15, 15, 55, 55),   # 框3 (与框1高度重叠)
    (100, 100, 140, 140), # 框4 (独立)
    (102, 102, 142, 142), # 框5 (与框4高度重叠)
]
test_scores = [0.9, 0.8, 0.7, 0.85, 0.75]
print("检测框及分数:")
for i, (b, s) in enumerate(zip(test_boxes, test_scores)):
    print(f"  框{i}: {b}, 分数={s}")

keep_idx = nms(test_boxes, test_scores, iou_threshold=0.5)
print(f"\\nNMS 后保留的框索引: {keep_idx}")
print("保留的框:")
for i in keep_idx:
    print(f"  框{i}: {test_boxes[i]}, 分数={test_scores[i]}")

# Soft-NMS
def soft_nms(boxes, scores, iou_threshold=0.5, sigma=0.5):
    """Soft-NMS: 不直接删除，而是降低重叠框的分数"""
    boxes = list(boxes)
    scores = list(scores)
    indices = list(range(len(boxes)))
    keep = []

    while indices:
        # 选分数最高的
        best_idx = max(indices, key=lambda i: scores[i])
        keep.append(best_idx)
        indices.remove(best_idx)

        for idx in indices:
            iou = compute_iou(boxes[best_idx], boxes[idx])
            if iou > iou_threshold:
                # 用高斯函数降低分数
                scores[idx] = scores[idx] * math.exp(-(iou * iou) / sigma)
    return keep, scores

print("\\n=== Soft-NMS ===")
keep_soft, new_scores = soft_nms(test_boxes, test_scores, iou_threshold=0.3, sigma=0.5)
print(f"Soft-NMS 后保留索引: {keep_soft}")
print("更新后的分数:")
for i in keep_soft:
    print(f"  框{i}: 分数={new_scores[i]:.3f}")

# -------------------------------------------------------------
# 6. 滑动窗口检测模拟
# -------------------------------------------------------------
def sliding_windows(image_size, window_sizes, strides):
    """
    生成滑动窗口
    image_size: (w, h)
    window_sizes: [(w, h), ...] 多种窗口大小
    strides: [(sx, sy), ...] 对应步长
    """
    iw, ih = image_size
    windows = []
    for (ww, wh), (sx, sy) in zip(window_sizes, strides):
        for y in range(0, ih - wh + 1, sy):
            for x in range(0, iw - ww + 1, sx):
                windows.append((x, y, x + ww, y + wh))
    return windows

print("\\n=== 滑动窗口 ===")
windows = sliding_windows(
    image_size=(64, 64),
    window_sizes=[(16, 16), (32, 32)],
    strides=[(8, 8), (16, 16)],
)
print(f"图像 64x64, 窗口 16x16(stride=8) + 32x32(stride=16)")
print(f"总窗口数: {len(windows)}")
print(f"前 3 个窗口: {windows[:3]}")

# -------------------------------------------------------------
# 7. 损失函数实现
# -------------------------------------------------------------
# Smooth L1 Loss
def smooth_l1_loss(pred, target, beta=1.0):
    """Smooth L1: |x| < beta 时用 0.5x²/beta, 否则 |x|-0.5*beta"""
    diff = pred - target
    abs_diff = abs(diff)
    if abs_diff < beta:
        return 0.5 * diff * diff / beta
    else:
        return abs_diff - 0.5 * beta

print("\\n=== 回归损失函数 ===")
preds = [10, 12, 15, 20]
target = 10
print(f"目标值: {target}")
for p in preds:
    loss = smooth_l1_loss(p, target)
    print(f"  预测={p}, Smooth L1 Loss={loss:.3f}")

# Focal Loss
def focal_loss(prob, target, alpha=0.25, gamma=2.0):
    """
    Focal Loss = -alpha * (1-p)^gamma * log(p)  (target=1)
              = -(1-alpha) * p^gamma * log(1-p)  (target=0)
    """
    eps = 1e-7
    prob = max(eps, min(1 - eps, prob))
    if target == 1:
        return -alpha * ((1 - prob) ** gamma) * math.log(prob)
    else:
        return -(1 - alpha) * (prob ** gamma) * math.log(1 - prob)

print("\\n=== Focal Loss (解决类别不平衡) ===")
print("正样本 (target=1):")
for p in [0.9, 0.5, 0.1, 0.01]:
    fl = focal_loss(p, target=1)
    ce = -math.log(max(p, 1e-7))  # 交叉熵
    print(f"  预测概率={p}, CE={ce:.3f}, Focal={fl:.3f}")

print("负样本 (target=0):")
for p in [0.1, 0.5, 0.9, 0.99]:
    fl = focal_loss(p, target=0)
    ce = -math.log(max(1 - p, 1e-7))
    print(f"  预测概率={p}, CE={ce:.3f}, Focal={fl:.3f}")

# -------------------------------------------------------------
# 8. 评价指标 mAP 计算 (简化版)
# -------------------------------------------------------------
def compute_ap(recalls, precisions):
    """计算单个类别的 AP (11 点插值法)"""
    ap = 0
    for t in [i / 10 for i in range(11)]:
        precisions_above = [p for r, p in zip(recalls, precisions) if r >= t]
        p = max(precisions_above) if precisions_above else 0
        ap += p / 11
    return ap

def compute_map(detections_per_class):
    """
    detections_per_class: {类别: [(confidence, is_tp), ...]}
    返回 mAP
    """
    aps = []
    for cls, dets in detections_per_class.items():
        # 按置信度降序
        dets.sort(key=lambda x: -x[0])
        tp = sum(1 for _, is_tp in dets if is_tp)
        fp = len(dets) - tp
        if tp == 0:
            aps.append(0)
            continue
        recalls = []
        precisions = []
        cum_tp = 0
        cum_fp = 0
        for conf, is_tp in dets:
            if is_tp:
                cum_tp += 1
            else:
                cum_fp += 1
            recalls.append(cum_tp / tp)
            precisions.append(cum_tp / (cum_tp + cum_fp))
        ap = compute_ap(recalls, precisions)
        aps.append(ap)
    return sum(aps) / len(aps), aps

print("\\n=== mAP 计算示例 ===")
# 模拟两个类别的检测结果
detections = {
    "cat": [(0.9, True), (0.8, True), (0.7, False), (0.6, True), (0.5, False)],
    "dog": [(0.85, True), (0.75, False), (0.65, True), (0.55, False)],
}
mean_ap, ap_list = compute_map(detections)
for cls, ap in zip(detections.keys(), ap_list):
    print(f"  {cls} AP = {ap:.3f}")
print(f"  mAP = {mean_ap:.3f}")

# -------------------------------------------------------------
# 9. 简化的 YOLO 检测头输出解码
# -------------------------------------------------------------
def yolo_decode(grid_preds, num_classes, num_anchors, grid_size, anchors_wh):
    """
    简化版 YOLO 解码
    grid_preds: S x S x (num_anchors * (5 + num_classes))
    anchors_wh: [(w, h), ...]
    """
    S = grid_size
    detections = []
    for gy in range(S):
        for gx in range(S):
            cell_pred = grid_preds[gy][gx]
            for a in range(num_anchors):
                offset = a * (5 + num_classes)
                tx, ty, tw, th, obj = cell_pred[offset:offset+5]
                class_probs = cell_pred[offset+5:offset+5+num_classes]
                if obj < 0.5:
                    continue
                # 解码中心点 (相对网格)
                cx = (gx + tx) / S
                cy = (gy + ty) / S
                # 解码宽高 (相对锚框)
                aw, ah = anchors_wh[a]
                w = aw * math.exp(tw)
                h = ah * math.exp(th)
                # 取最大类别
                cls_idx = class_probs.index(max(class_probs))
                cls_score = max(class_probs) * obj
                detections.append({
                    "box": (cx, cy, w, h),
                    "class": cls_idx,
                    "score": cls_score,
                })
    return detections

print("\\n=== YOLO 解码模拟 ===")
# 2x2 网格, 1 个 anchor, 3 类
anchors_wh = [(0.2, 0.2)]
grid_preds = [
    [[0.5, 0.5, 0.0, 0.0, 0.9, 0.8, 0.1, 0.1], [0.0, 0.0, 0.0, 0.0, 0.2, 0.3, 0.5, 0.2]],
    [[0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.3, 0.5], [0.4, 0.4, 0.5, 0.5, 0.85, 0.05, 0.9, 0.05]],
]
dets = yolo_decode(grid_preds, num_classes=3, num_anchors=1, grid_size=2, anchors_wh=anchors_wh)
print(f"解码出 {len(dets)} 个检测:")
for d in dets:
    print(f"  类别 {d['class']}, 分数 {d['score']:.3f}, 框 (cx={d['box'][0]:.2f}, cy={d['box'][1]:.2f}, w={d['box'][2]:.2f}, h={d['box'][3]:.2f})")

print("\\n[完成] 目标检测核心算法演示完毕")
`,
  },
  {
    id: "aipy-generation",
    icon: "🎨",
    group: "计算机视觉",
    title: "图像生成技术",
    content: `
# 图像生成技术

图像生成是计算机视觉与生成模型的前沿领域。从生成逼真的人脸、艺术画作，到根据文本描述创作图像，再到视频生成和 3D 内容生成，生成模型正在重塑创意产业。

本章将系统讲解三大生成模型范式：GAN、VAE、Diffusion Model，以及它们的代表应用。

## 一、生成模型概述

### 1.1 什么是生成模型

生成模型（Generative Model）的目标是学习数据分布 P_data(x)，并从中采样生成新样本。与之相对的是判别模型（Discriminative Model），学习 P(y|x) 进行分类或回归。

生成模型可以：
- 生成新样本（图像、音频、文本）。
- 数据增强（扩充训练集）。
- 异常检测（低概率样本视为异常）。
- 表示学习（学习数据潜在结构）。
- 跨模态转换（文本到图像、图像到图像）。

### 1.2 生成模型的分类

按方法论分：
- **显式模型**：显式建模 P(x)，如 VAE、PixelRNN、流模型。
- **隐式模型**：不显式建模 P(x)，只学习采样过程，如 GAN。

按生成过程分：
- **一对一映射**：VAE、GAN，输入噪声输出样本。
- **逐步生成**：自回归模型（PixelRNN）、扩散模型。
- **可逆变换**：流模型（NICE、RealNVP、Glow）。

### 1.3 评价指标

生成图像的质量评价是开放问题：
- **IS（Inception Score）**：用 Inception 网络评估生成图像的类别清晰度和多样性。
- **FID（Frechet Inception Distance）**：比较生成图像和真实图像在特征空间的统计分布距离，最常用。
- **CLIP Score**：用 CLIP 模型评估图像与文本的匹配度。
- **人类评估**：主观评价，最可靠但成本高。

## 二、生成对抗网络 GAN

### 2.1 GAN 的核心思想

GAN（Generative Adversarial Network）由 Ian Goodfellow 于 2014 年提出，灵感来自博弈论中的二人零和博弈。

GAN 包含两个网络：
- **生成器 G**：输入随机噪声 z，输出假样本 G(z)。目标是欺骗判别器。
- **判别器 D**：输入样本（真实或生成），判断真假。目标是区分真假。

两者对抗训练：
- G 努力提升，让 D 无法区分。
- D 努力提升，识破 G 的伪装。
- 最终达到纳什均衡：G 生成的样本与真实样本无法区分。

### 2.2 GAN 的损失函数

\`\`min_G max_D V(D, G) = E_{x~P_data}[log D(x)] + E_{z~P_z}[log(1 - D(G(z)))]\`\`

- 判别器希望最大化：正确识别真实样本（log D(x)）和生成样本（log(1-D(G(z)))）。
- 生成器希望最小化：让判别器对生成样本判断错误，即最小化 log(1-D(G(z)))。

实际训练中，生成器常最大化 log D(G(z))，因为初期 log(1-D(G(z))) 梯度太小。

### 2.3 GAN 的训练难点

- **模式崩溃**（Mode Collapse）：生成器只生成少数几种样本，缺乏多样性。
- **训练不稳定**：G 和 D 的能力需要平衡，否则一方过强训练失败。
- **梯度消失**：D 太强时，G 的梯度消失。
- **评估困难**：没有明确的损失值衡量生成质量。

### 2.4 GAN 的改进历程

#### DCGAN (2015)

第一个稳定的 CNN GAN：
- 用转置卷积（transposed convolution）上采样。
- 用 BatchNorm 稳定训练。
- 用 LeakyReLU 激活。
- 移除全连接层。

####条件GAN (cGAN)

输入条件信息（类别标签、文本、图像），控制生成内容：
- 类别标签：MNIST 生成指定数字。
- 文本：Text-to-Image。
- 图像：Image-to-Image 转换（pix2pix、CycleGAN）。

#### WGAN (2017)

Wasserstein GAN 用 Wasserstein 距离替代 JS 散度，解决梯度消失和模式崩溃：
- 判别器改为"批评家"（critic），输出实数而非概率。
- 权重裁剪或梯度惩罚（WGAN-GP）满足 Lipschitz 约束。
- 训练更稳定，损失与生成质量相关。

#### StyleGAN (2019-2021)

NVIDIA 提出，生成高质量人脸：
- **风格注入**：将潜变量通过 AdaIN 注入不同层，控制不同尺度的特征。
- **渐进式增长**（StyleGAN1）：从低分辨率逐步增长。
- **去除 8x8 伪影**（StyleGAN2）：改进架构和归一化。
- **_alias-free**（StyleGAN3）：解决纹理粘附问题。

StyleGAN 生成的人脸几乎以假乱真，被广泛用于 AI 头像生成、艺术创作。

#### BigGAN (2019)

大规模 GAN，生成高分辨率 ImageNet 图像：
- 大批量训练。
- 截断技巧（truncation trick）控制质量-多样性权衡。
- 正交正则化。

### 2.5 GAN 的应用

- **图像生成**：人脸、动漫、艺术。
- **图像修复**：补全缺失区域。
- **超分辨率**：SRGAN 生成高清图像。
- **图像翻译**：CycleGAN 风格迁移、季节转换。
- **视频生成**：VGAN、MoCoGAN。
- **数据增强**：生成训练样本。

## 三、变分自编码器 VAE

### 3.1 自编码器回顾

自编码器（Autoencoder）由编码器和解码器组成：
- 编码器：x -> z（压缩到潜空间）。
- 解码器：z -> x_hat（重建）。
- 损失：重建误差 ||x - x_hat||²。

自编码器可以学习数据压缩表示，但潜空间不规则，无法生成新样本。

### 3.2 VAE 的概率解释

VAE（Variational Autoencoder）将自编码器概率化：
- 假设数据由潜变量 z 生成：x ~ P(x|z)。
- 后验 P(z|x) 难以计算，用变分分布 Q(z|x) 近似。
- 最大化证据下界（ELBO）。

### 3.3 ELBO 推导

对数似然：
\`\`log P(x) = log integral P(x|z) P(z) dz\`\`

引入 Q(z|x)：
\`\`log P(x) = ELBO + KL[Q(z|x) || P(z|x)]\`\`

由于 KL 散度非负，最大化 ELBO 等价于最大化 log P(x) 的下界。

ELBO = 重建项 - KL 项：
\`\`ELBO = E_{z~Q}[log P(x|z)] - KL[Q(z|x) || P(z)]\`\`

- 第一项：重建质量（让解码器输出接近输入）。
- 第二项：让编码器输出分布接近先验（通常 N(0, I)）。

### 3.4 重参数化技巧

VAE 的梯度无法直接通过采样 z ~ Q(z|x) 反向传播。重参数化技巧：

\`\`z = mu + sigma * epsilon, epsilon ~ N(0, I)\`\`

将随机性移到 epsilon，梯度可以通过 mu 和 sigma 传播。

### 3.5 VAE 的特点

优点：
- 训练稳定（不像 GAN 那样对抗）。
- 显式建模概率分布。
- 潜空间结构化，可插值、可算术。

缺点：
- 生成图像模糊（因为高斯似然假设）。
- 不如 GAN 逼真。

### 3.6 VAE 的改进

- **Beta-VAE**：调节 KL 项权重，学习解耦表示。
- **VQ-VAE**：用离散潜空间，生成更清晰。
- **NVAE**：层次化 VAE，性能大幅提升。
- **VQ-GAN**：结合 VQ-VAE 和 Transformer，生成高质量图像。

### 3.7 VAE 的应用

- 数据压缩与重建。
- 表示学习与解耦。
- 异常检测。
- 药物分子设计（Graph VAE）。
- 半监督学习。

## 四、扩散模型 Diffusion Model

### 4.1 扩散模型的灵感

扩散模型的灵感来自物理学中的热力学扩散过程：墨水滴入水中逐渐扩散，最终均匀分布。反向过程则是从噪声恢复出结构化数据。

### 4.2 前向过程（加噪）

逐步向数据添加高斯噪声，经过 T 步后变成纯高斯噪声：

\`\`q(x_t | x_{t-1}) = N(x_t; sqrt(1-beta_t) * x_{t-1}, beta_t * I)\`\`

其中 beta_t 是预先设定的噪声调度。

闭式解（直接从 x_0 计算 x_t）：
\`\`q(x_t | x_0) = N(x_t; sqrt(alpha_bar_t) * x_0, (1 - alpha_bar_t) * I)\`\`

其中 alpha_t = 1 - beta_t, alpha_bar_t = prod_{s=1}^t alpha_s。

### 4.3 反向过程（去噪）

学习一个神经网络预测每一步的噪声，逐步去噪：

\`\`p_theta(x_{t-1} | x_t) = N(x_{t-1}; mu_theta(x_t, t), sigma_theta(x_t, t))\`\`

通常参数化为预测噪声 epsilon_theta(x_t, t)，损失为：

\`\`L = E[||epsilon - epsilon_theta(x_t, t)||²]\`\`

### 4.4 DDPM (2020)

Ho 等提出的 DDPM（Denoising Diffusion Probabilistic Models）让扩散模型实用化：
- 简化损失为噪声预测的 MSE。
- 用 U-Net 作为去噪网络。
- T = 1000 步。
- 生成质量匹敌 GAN。

### 4.5 加速采样

扩散模型的最大问题是采样慢（需要 1000 步去噪）。改进方法：

- **DDIM**（2020）：非马尔可夫采样，50 步即可生成高质量样本。
- **DPM-Solver**：基于 ODE 的高效求解器，10-20 步。
- **Latent Consistency Model**：1-4 步生成。

### 4.6 Stable Diffusion

Stable Diffusion（潜在扩散模型，LDM）是扩散模型的里程碑：

核心创新：**在潜空间而非像素空间进行扩散**。
- 用 VQ-VAE 将图像压缩到潜空间（如 512x512x3 -> 64x64x4）。
- 在潜空间训练扩散模型，计算量减少 64 倍。
- 生成时解码回像素空间。

文本条件：用 CLIP 文本编码器将文本嵌入，通过交叉注意力注入 U-Net。

Stable Diffusion 开源后引爆 AI 绘画热潮，衍生大量应用：
- ControlNet：精确控制生成（姿势、边缘、深度）。
- LoRA：轻量微调，自定义风格。
- Inpainting/Outpainting：图像修复与扩展。
- Img2Img：基于图像生成变体。

### 4.7 扩散模型的变体

- **Classifier-Free Guidance**：无需分类器，引导生成更符合条件。
- **Imagen**（Google）：级联扩散，文本到图像。
- **DALL-E 2/3**（OpenAI）：CLIP + 扩散。
- **Midjourney**：商业 AI 绘画，艺术风格突出。
- **Sora**（OpenAI）：视频生成扩散模型。

### 4.8 视频生成

扩散模型扩展到视频：
- **Make-A-Video**（Meta）。
- **AnimateDiff**：基于 Stable Diffusion 的动画生成。
- **Sora**：60 秒高质量视频生成。
- **Runway Gen-2/Gen-3**：商业视频生成。

视频生成的挑战：
- 时间一致性（帧间连贯）。
- 长视频生成。
- 运动控制。

## 五、其他生成模型

### 5.1 流模型（Normalizing Flow）

通过一系列可逆变换将简单分布（高斯）变为复杂数据分布：
- 精确对数似然计算。
- 可逆性约束限制网络设计。
- 代表：RealNVP、Glow。

### 5.2 自回归模型

逐像素生成图像，类似语言模型逐 token 生成：
- PixelRNN、PixelCNN。
- ImageGPT。
- 生成慢但似然精确。

### 5.3 能量模型（EBM）

学习能量函数 E(x)，低能量对应真实样本：
- 训练难（需要 MCMC 采样）。
- 理论优美。

### 5.4 VQ-VAE + Transformer

两阶段生成：
1. VQ-VAE 将图像压缩为离散 token。
2. Transformer 自回归生成 token。
3. VQ-VAE 解码器还原图像。

DALL-E 1、Parti 采用此架构。

## 六、多模态生成

### 6.1 CLIP

OpenAI 的 CLIP（Contrastive Language-Image Pre-training）：
- 联合训练图像编码器和文本编码器。
- 对比学习：匹配图像-文本对。
- 零样本分类能力强。

CLIP 嵌入成为许多生成模型的文本编码器。

### 6.2 文本到图像生成

主流模型：
- **Stable Diffusion**：开源，生态丰富。
- **DALL-E 3**：集成 ChatGPT，提示词理解强。
- **Midjourney**：艺术风格，社区活跃。
- **Imagen**：Google，质量高但未开源。
- **通义万相、文心一格**：国产模型。

### 6.3 图像编辑

- **InstructPix2Pix**：指令式编辑（"把猫变成狗"）。
- **ControlNet**：精确结构控制。
- **IP-Adapter**：图像提示。

### 6.4 个性化生成

- **DreamBooth**：用几张图微调，生成特定主体。
- **LoRA**：轻量微调。
- **Textual Inversion**：学习新概念嵌入。

## 七、生成模型的伦理问题

### 7.1 深度伪造

- 人脸替换、语音克隆。
- 虚假信息传播。
- 名誉损害。

### 7.2 版权争议

- 训练数据版权。
- 生成作品版权归属。
- 艺术家风格模仿。

### 7.3 偏见与安全

- 训练数据偏见导致生成偏见内容。
- 不当内容生成（暴力、色情）。
- 滥用风险（钓鱼、欺诈）。

### 7.4 检测与水印

- 深度伪造检测。
- 不可见水印（如 SynthID）。
- 内容来源认证（C2PA）。

## 八、生成模型的未来

### 8.1 统一多模态模型

- GPT-4V、Gemini、Claude 3：理解与生成统一。
- 任意模态输入，任意模态输出。

### 8.2 3D 生成

- DreamFusion：文本到 3D。
- Gaussian Splatting：实时渲染。
- NeRF + 扩散：3D 场景生成。

### 8.3 世界模型

- Sora 展示了模拟物理世界的能力。
- 视频生成向世界模拟器演进。
- 机器人训练的虚拟环境。

### 8.4 实时生成

- 一致性模型实现实时生成。
- 边缘设备部署。
- 交互式创作。

## 九、本章小结

图像生成经历了三代发展：
1. **GAN**（2014-2020）：对抗训练，逼真但难训练。
2. **VAE**（2013-至今）：概率建模，稳定但模糊。
3. **扩散模型**（2020-至今）：当前 SOTA，质量与多样性兼得。

核心要点：
- **GAN**：生成器与判别器对抗，隐式建模分布。
- **VAE**：变分推断，显式建模潜空间分布，ELBO 优化。
- **扩散模型**：前向加噪 + 反向去噪，潜在扩散（Stable Diffusion）实现实用化。
- **多模态**：CLIP 连接视觉与语言，文本到图像生成成为主流。

代码部分用纯 Python 模拟了 GAN 训练过程、VAE 的重参数化、扩散过程的加噪与去噪，帮助你理解这些模型的核心机制。
`,
    code: `# =============================================================
# 图像生成技术 —— 用纯 Python 模拟生成模型核心机制
# =============================================================
# 实现：GAN 训练模拟、VAE 重参数化、扩散过程加噪/去噪
# 不依赖第三方库，用随机数和列表模拟

import math
import random

# -------------------------------------------------------------
# 1. GAN 训练过程模拟
# -------------------------------------------------------------
class SimpleGenerator:
    """简化生成器：用线性变换模拟"""
    def __init__(self, noise_dim=4, output_dim=8, seed=1):
        random.seed(seed)
        self.noise_dim = noise_dim
        # 随机初始化权重
        self.weights = [random.gauss(0, 0.5) for _ in range(noise_dim * output_dim)]
        self.bias = [random.gauss(0, 0.1) for _ in range(output_dim)]

    def forward(self, noise):
        """前向传播：noise -> 假样本"""
        output = list(self.bias)
        for i in range(len(output)):
            for j in range(self.noise_dim):
                output[i] += noise[j] * self.weights[i * self.noise_dim + j]
        # 归一化到 [0, 1]
        min_v, max_v = min(output), max(output)
        if max_v > min_v:
            output = [(v - min_v) / (max_v - min_v) for v in output]
        return output

    def update(self, gradient, lr=0.01):
        """简化梯度更新"""
        for i in range(len(self.weights)):
            self.weights[i] += lr * gradient[i % len(gradient)]

class SimpleDiscriminator:
    """简化判别器：判断样本真假"""
    def __init__(self, input_dim=8, seed=2):
        random.seed(seed)
        self.weights = [random.gauss(0, 0.5) for _ in range(input_dim)]
        self.bias = random.gauss(0, 0.1)

    def forward(self, sample):
        """前向传播：返回 0-1 的真假概率"""
        logit = self.bias
        for i in range(len(sample)):
            logit += sample[i] * self.weights[i]
        # Sigmoid
        return 1 / (1 + math.exp(-max(-50, min(50, logit))))

def generate_real_data(n=8, seed=42):
    """生成"真实数据"：模拟一个分布"""
    random.seed(seed)
    return [random.gauss(0.7, 0.1) for _ in range(n)]

print("=== GAN 训练模拟 ===")
G = SimpleGenerator(noise_dim=4, output_dim=8)
D = SimpleDiscriminator(input_dim=8)

real_data = generate_real_data(8)
print(f"真实数据样本 (前4维): {[f'{v:.3f}' for v in real_data[:4]]}")

print("\\n训练过程:")
for epoch in range(20):
    # 生成噪声
    noise = [random.gauss(0, 1) for _ in range(4)]
    # 生成假样本
    fake_data = G.forward(noise)
    # 判别器判断
    d_real = D.forward(real_data)
    d_fake = D.forward(fake_data)
    # 简化更新：D 希望增大 d_real，减小 d_fake
    # G 希望增大 d_fake
    if epoch % 5 == 0:
        print(f"  Epoch {epoch}: D(real)={d_real:.3f}, D(fake)={d_fake:.3f}")

print("\\n[说明] 真实训练中 G 和 D 通过反向传播更新，这里仅展示前向过程")

# -------------------------------------------------------------
# 2. VAE 重参数化与采样
# -------------------------------------------------------------
def vae_reparameterize(mu, log_var, seed=None):
    """
    重参数化技巧: z = mu + sigma * epsilon
    让梯度能通过随机采样传播
    """
    if seed is not None:
        random.seed(seed)
    sigma = math.exp(0.5 * log_var)
    epsilon = random.gauss(0, 1)
    z = mu + sigma * epsilon
    return z, epsilon

def vae_kl_loss(mu, log_var):
    """
    KL 散度: KL[N(mu, sigma) || N(0, 1)]
           = 0.5 * sum(mu^2 + sigma^2 - 1 - log(sigma^2))
    """
    return 0.5 * (mu ** 2 + math.exp(log_var) - 1 - log_var)

def vae_recon_loss(x, x_hat):
    """重建损失 (简化 MSE)"""
    return sum((a - b) ** 2 for a, b in zip(x, x_hat)) / len(x)

print("\\n=== VAE 重参数化 ===")
# 模拟编码器输出
mu_list = [0.5, -0.3, 0.8, 0.1]
log_var_list = [-0.2, 0.1, -0.5, 0.3]

print(f"编码器输出 mu: {mu_list}")
print(f"编码器输出 log_var: {log_var_list}")

print("\\n多次采样 (展示随机性):")
for i in range(5):
    z_list = []
    for mu, lv in zip(mu_list, log_var_list):
        z, eps = vae_reparameterize(mu, lv, seed=i*10)
        z_list.append(z)
    print(f"  采样 {i+1}: z = {[f'{v:.3f}' for v in z_list]}")

# KL 损失
print("\\nKL 散度损失 (每维):")
total_kl = 0
for i, (mu, lv) in enumerate(zip(mu_list, log_var_list)):
    kl = vae_kl_loss(mu, lv)
    total_kl += kl
    print(f"  维 {i}: mu={mu:.2f}, log_var={lv:.2f}, KL={kl:.4f}")
print(f"总 KL 损失: {total_kl:.4f}")

# 重建损失
x = [1.0, 0.5, 0.8, 0.2]
x_hat = [0.9, 0.6, 0.7, 0.3]
recon = vae_recon_loss(x, x_hat)
print(f"\\n重建损失: {recon:.4f}")
print(f"ELBO = 重建损失 + KL 损失 = {recon + total_kl:.4f}")

# 潜空间插值
print("\\n=== 潜空间插值 ===")
z1 = [1.0, 0.5, -0.3, 0.8]
z2 = [-1.0, -0.5, 0.3, -0.8]
print(f"z1 = {[f'{v:.2f}' for v in z1]}")
print(f"z2 = {[f'{v:.2f}' for v in z2]}")
print("插值 (alpha 从 0 到 1):")
for alpha in [0.0, 0.25, 0.5, 0.75, 1.0]:
    z_interp = [a * (1 - alpha) + b * alpha for a, b in zip(z1, z2)]
    print(f"  alpha={alpha:.2f}: z = {[f'{v:.2f}' for v in z_interp]}")

# -------------------------------------------------------------
# 3. 扩散模型前向过程 (加噪)
# -------------------------------------------------------------
def diffusion_forward(x_0, t, betas, seed=None):
    """
    前向过程: 直接从 x_0 计算 x_t
    q(x_t | x_0) = N(sqrt(alpha_bar_t) * x_0, (1 - alpha_bar_t) * I)
    """
    if seed is not None:
        random.seed(seed)
    # 计算 alpha 和 alpha_bar
    alphas = [1 - b for b in betas]
    alpha_bar = 1.0
    for i in range(t):
        alpha_bar *= alphas[i]

    # 加噪: x_t = sqrt(alpha_bar) * x_0 + sqrt(1-alpha_bar) * noise
    noise = [random.gauss(0, 1) for _ in x_0]
    x_t = []
    for i in range(len(x_0)):
        val = math.sqrt(alpha_bar) * x_0[i] + math.sqrt(1 - alpha_bar) * noise[i]
        x_t.append(val)
    return x_t, noise, alpha_bar

# 噪声调度 (线性)
T = 10  # 总步数
betas = [0.02 * (i + 1) / T for i in range(T)]  # 线性增长的 beta

print("\\n=== 扩散模型前向过程 (加噪) ===")
print(f"噪声调度 betas (T={T}): {[f'{b:.3f}' for b in betas]}")

# 原始"图像" (一维向量模拟)
x_0 = [0.5, 0.8, -0.3, 0.2, 0.7, -0.5, 0.1, 0.9]
print(f"\\n原始数据 x_0 (前4维): {[f'{v:.3f}' for v in x_0[:4]]}")

# 不同时间步的加噪结果
for t in [0, 2, 5, 8, T]:
    x_t, noise, alpha_bar = diffusion_forward(x_0, t, betas, seed=t)
    print(f"  t={t:2d}: alpha_bar={alpha_bar:.3f}, x_t(前4维)={[f'{v:.3f}' for v in x_t[:4]]}")

# -------------------------------------------------------------
# 4. 扩散模型反向过程 (去噪)
# -------------------------------------------------------------
def diffusion_reverse_step(x_t, t, betas, predicted_noise, seed=None):
    """
    反向去噪一步: 从 x_t 计算 x_{t-1}
    mu = (1/sqrt(alpha_t)) * (x_t - (beta_t / sqrt(1-alpha_bar_t)) * predicted_noise)
    """
    if seed is not None:
        random.seed(seed)
    alpha_t = 1 - betas[t]
    alpha_bar_t = 1.0
    for i in range(t + 1):
        alpha_bar_t *= (1 - betas[i])

    x_prev = []
    for i in range(len(x_t)):
        mu = (1 / math.sqrt(alpha_t)) * (
            x_t[i] - (betas[t] / math.sqrt(1 - alpha_bar_t)) * predicted_noise[i]
        )
        # 加入随机噪声 (除了 t=0)
        if t > 0:
            sigma = math.sqrt(betas[t])
            noise = random.gauss(0, 1)
            x_prev.append(mu + sigma * noise)
        else:
            x_prev.append(mu)
    return x_prev

print("\\n=== 扩散模型反向过程 (去噪) ===")
# 模拟: 从纯噪声开始, 用真实噪声做"预测" (理想情况)
print("模拟去噪过程 (用真实噪声作为预测):")
x_current = [random.gauss(0, 1) for _ in x_0]  # 从纯噪声开始
print(f"  初始噪声 (t={T}): {[f'{v:.3f}' for v in x_current[:4]]}")

for t in range(T - 1, -1, -1):
    # 在真实训练中, predicted_noise 由 U-Net 预测
    # 这里用之前前向过程保存的噪声模拟理想情况
    _, true_noise, _ = diffusion_forward(x_0, t, betas, seed=t)
    x_current = diffusion_reverse_step(x_current, t, betas, true_noise, seed=t*100)
    if t % 3 == 0:
        print(f"  t={t:2d} 去噪后: {[f'{v:.3f}' for v in x_current[:4]]}")

# -------------------------------------------------------------
# 5. Stable Diffusion 潜空间扩散概念
# -------------------------------------------------------------
print("\\n=== Stable Diffusion 潜空间扩散概念 ===")
print("像素空间扩散: 512x512x3 = 786432 维, 计算量大")
print("潜空间扩散:   64x64x4 = 16384 维, 减少 48 倍")

# 模拟 VAE 编解码
def simulate_vae_encode(image_pixels, latent_dim=4):
    """模拟 VAE 编码器: 图像 -> 潜空间"""
    # 简化: 取平均池化
    latent = []
    chunk = len(image_pixels) // latent_dim
    for i in range(latent_dim):
        segment = image_pixels[i * chunk:(i + 1) * chunk]
        latent.append(sum(segment) / len(segment))
    return latent

def simulate_vae_decode(latent, output_dim=8):
    """模拟 VAE 解码器: 潜空间 -> 图像"""
    # 简化: 复制扩展
    image = []
    for i in range(output_dim):
        idx = (i * len(latent)) // output_dim
        image.append(latent[idx % len(latent)])
    return image

original_image = [0.1 * i for i in range(16)]
latent = simulate_vae_encode(original_image, latent_dim=4)
reconstructed = simulate_vae_decode(latent, output_dim=16)
print(f"\\n原始图像 (16维): {[f'{v:.2f}' for v in original_image]}")
print(f"潜空间表示 (4维): {[f'{v:.3f}' for v in latent]}")
print(f"重建图像 (16维): {[f'{v:.3f}' for v in reconstructed]}")
print(f"压缩比: {len(original_image)}/{len(latent)} = {len(original_image)/len(latent):.1f}x")

# -------------------------------------------------------------
# 6. Classifier-Free Guidance (CFG)
# -------------------------------------------------------------
def classifier_free_guidance(eps_uncond, eps_cond, guidance_scale=7.5):
    """
    CFG: eps = eps_uncond + scale * (eps_cond - eps_uncond)
    scale 越大, 越贴近条件, 但多样性下降
    """
    result = []
    for u, c in zip(eps_uncond, eps_cond):
        guided = u + guidance_scale * (c - u)
        result.append(guided)
    return result

print("\\n=== Classifier-Free Guidance ===")
eps_uncond = [0.1, -0.2, 0.3, 0.0]
eps_cond = [0.5, 0.4, -0.1, 0.6]
print(f"无条件预测: {eps_uncond}")
print(f"条件预测:   {eps_cond}")
for scale in [1.0, 5.0, 7.5, 15.0]:
    guided = classifier_free_guidance(eps_uncond, eps_cond, scale)
    print(f"  scale={scale:4.1f}: {[f'{v:.3f}' for v in guided]}")

# -------------------------------------------------------------
# 7. DDIM 采样加速概念
# -------------------------------------------------------------
print("\\n=== DDIM 采样加速 ===")
print("DDPM: 1000 步顺序去噪, 慢")
print("DDIM: 跳跃采样, 50 步可达相近质量")
# 模拟跳跃采样
total_steps = 1000
ddpm_steps = list(range(total_steps))
ddim_steps = list(range(0, total_steps, 20))  # 每 20 步取一次
print(f"DDPM 采样步数: {len(ddpm_steps)}")
print(f"DDIM 采样步数: {len(ddim_steps)} (加速 {len(ddpm_steps)/len(ddim_steps):.0f}x)")

# -------------------------------------------------------------
# 8. 生成质量评估 (FID 简化概念)
# -------------------------------------------------------------
def compute_fid_simple(real_features, fake_features):
    """
    简化 FID: ||mu_real - mu_fake||^2 + Tr(Sigma_real + Sigma_fake - 2*sqrt(Sigma_real*Sigma_fake))
    这里只用均值差和方差差近似
    """
    mu_real = sum(real_features) / len(real_features)
    mu_fake = sum(fake_features) / len(fake_features)
    var_real = sum((x - mu_real) ** 2 for x in real_features) / len(real_features)
    var_fake = sum((x - mu_fake) ** 2 for x in fake_features) / len(fake_features)
    mean_diff = (mu_real - mu_fake) ** 2
    cov_diff = var_real + var_fake - 2 * math.sqrt(var_real * var_fake)
    return mean_diff + cov_diff

print("\\n=== FID 简化计算 ===")
real_feats = [0.8, 0.82, 0.79, 0.81, 0.83, 0.78, 0.84, 0.80]
fake_good = [0.79, 0.81, 0.80, 0.82, 0.78, 0.83, 0.81, 0.79]
fake_bad = [0.5, 0.6, 0.55, 0.65, 0.45, 0.70, 0.50, 0.60]
fid_good = compute_fid_simple(real_feats, fake_good)
fid_bad = compute_fid_simple(real_feats, fake_bad)
print(f"真实特征均值: {sum(real_feats)/len(real_feats):.3f}")
print(f"高质量生成 FID: {fid_good:.4f} (越低越好)")
print(f"低质量生成 FID: {fid_bad:.4f}")

# -------------------------------------------------------------
# 9. 文本条件生成概念 (CLIP 嵌入)
# -------------------------------------------------------------
def text_to_embedding(text, dim=8, seed=0):
    """模拟文本编码器 (CLIP) 将文本转为嵌入向量"""
    random.seed(hash(text) % 1000)
    return [random.gauss(0, 1) for _ in range(dim)]

print("\\n=== 文本条件生成 (CLIP 嵌入模拟) ===")
prompts = ["一只猫", "一只狗", "夕阳下的山", "赛博朋克城市"]
embeddings = {}
for p in prompts:
    emb = text_to_embedding(p)
    embeddings[p] = emb
    print(f"  '{p}' -> 嵌入: {[f'{v:.2f}' for v in emb[:4]]}...")

# 计算文本相似度 (余弦相似度)
def cosine_sim(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x ** 2 for x in a))
    norm_b = math.sqrt(sum(x ** 2 for x in b))
    return dot / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0

print("\\n文本相似度 (余弦):")
for p1 in prompts[:2]:
    for p2 in prompts:
        sim = cosine_sim(embeddings[p1], embeddings[p2])
        print(f"  '{p1}' vs '{p2}': {sim:.3f}")

print("\\n[完成] 图像生成技术核心概念演示完毕")
`,
  },
];
