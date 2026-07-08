// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 7 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-performance",
    icon: "⚡",
    title: "性能维度对比",
    group: "选型指南",
    content: `# 性能维度对比

## 一、性能不是单一数字

谈论"Python 和 Node.js 谁快"没有意义——性能取决于**做什么任务**。一把锤子和一把螺丝刀，谁更好？取决于你在拧螺丝还是钉钉子。

| 任务类型 | Python | Node.js | 胜出 |
|----------|--------|---------|------|
| CPU 密集（纯计算） | 慢（解释执行） | 中等（JIT 加速） | Node.js |
| CPU 密集（NumPy） | 极快（C 扩展） | 无对应 | Python |
| I/O 密集（高并发） | 中等（asyncio） | 快（事件循环原生） | Node.js |
| JSON 序列化 | 中等 | 快（V8 原生优化） | Node.js |
| 字符串处理 | 中等 | 快（V8 优化） | Node.js |
| 启动速度 | 快（直接执行） | 中等（V8 初始化） | Python |
| 内存效率 | 中等 | 较好（V8 优化） | Node.js |

## 二、纯计算性能

### 解释器执行速度

\`\`\`python
# Python：纯 Python 循环计算
def sum_n(n):
    total = 0
    for i in range(n):
        total += i
    return total

import time
start = time.perf_counter()
result = sum_n(10_000_000)
print(f"Python: {time.perf_counter() - start:.3f}s, result={result}")
# 典型结果：约 0.8-1.2s
\`\`\`

\`\`\`javascript
// Node.js：同样的循环
function sumN(n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
        total += i;
    }
    return total;
}

const start = performance.now();
const result = sumN(10000000);
console.log(\`Node.js: \${(performance.now() - start) / 1000}s, result=\${result}\`);
// 典型结果：约 0.05-0.15s（V8 JIT 优化后快 5-10 倍）
\`\`\`

V8 的 JIT 编译器会把热点代码（被频繁执行的函数）编译成机器码，执行速度接近原生。CPython 是纯字节码解释器，每条字节码都要经过 ceval 循环 dispatch，慢一个数量级。

### NumPy 翻盘

但 Python 有 NumPy：

\`\`\`python
import numpy as np
import time

start = time.perf_counter()
arr = np.arange(10_000_000)
result = arr.sum()
print(f"NumPy: {time.perf_counter() - start:.3f}s, result={result}")
# 典型结果：约 0.02-0.05s —— 比 Node.js 还快！
\`\`\`

NumPy 快是因为它底层是 C/Fortran 实现，使用连续内存和 SIMD 指令。**在数据科学计算领域，Python 实际上比 Node.js 快得多。**

## 三、I/O 并发性能

### HTTP 请求并发

\`\`\`python
# Python asyncio：并发 1000 个 HTTP 请求
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, f"http://example.com/{i}") for i in range(1000)]
        results = await asyncio.gather(*tasks)

import time
start = time.perf_counter()
asyncio.run(main())
print(f"Python asyncio: {time.perf_counter() - start:.3f}s")
\`\`\`

\`\`\`javascript
// Node.js：并发 1000 个 HTTP 请求
const fetch = require('node-fetch');

async function main() {
    const promises = Array.from({ length: 1000 }, (_, i) =>
        fetch(\`http://example.com/\${i}\`).then(r => r.text())
    );
    const results = await Promise.all(promises);
}

const start = performance.now();
main().then(() => {
    console.log(\`Node.js: \${(performance.now() - start) / 1000}s\`);
});
\`\`\`

两者在 I/O 密集型场景下性能接近。Node.js 稍占优势，因为：
1. 事件循环是运行时内置的，不需要额外的 asyncio 调度开销
2. V8 的 Promise 实现高度优化
3. Node.js 的 HTTP 解析器（http-parser/llhttp）是 C 实现

但差距不大（通常 10-30%），且 Python 可以用 uvloop 替换默认事件循环，性能接近 Node.js。

### WebSocket 连接数

\`\`\`text
单进程最大 WebSocket 连接数（典型值）：
Node.js (ws):        5-10 万连接
Python (websockets): 3-8 万连接
Python (uvloop):     5-10 万连接

内存占用（每连接）：
Node.js:  ~35 KB
Python:   ~50 KB
\`\`\`

Node.js 在高并发实时应用（如聊天、推送）中略有优势。

## 四、启动速度

\`\`\`text
冷启动时间（典型值）：
Python (python3 -c "print(1)"):        ~30ms
Node.js (node -e "console.log(1)"):    ~70ms

AWS Lambda 冷启动：
Python:   200-500ms
Node.js:  300-800ms
\`\`\`

Python 启动更快——CPython 解释器初始化比 V8 轻量。这对 Serverless 场景有影响：Python Lambda 冷启动通常比 Node.js 快。

## 五、内存占用

\`\`\`python
# Python：一个简单对象的内存占用
import sys
class Point:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(sys.getsizeof(p))  # 约 48-56 字节（__slots__ 优化）
# 不用 __slots__ 的普通实例：约 56-64 字节 + __dict__ ~100 字节
\`\`\`

\`\`\`javascript
// Node.js：一个简单对象的内存占用
const p = { x: 1, y: 2 };
// V8 中约 32-40 字节（隐藏类优化，连续属性存储）
\`\`\`

V8 的隐藏类（Hidden Class）机制让对象属性可以紧凑存储，内存效率通常优于 CPython。但 Python 的 \`__slots__\` 可以大幅减少内存占用。

## 六、性能优化手段对比

| 优化手段 | Python | Node.js |
|----------|--------|---------|
| JIT 编译 | ❌（3.13 实验性） | ✅ V8 内置 |
| 类型注解加速 | ❌（仅类型检查） | ⚠️（TS 类型擦除） |
| C 扩展 | ✅ ctypes/Cython/pybind11 | ✅ N-API |
| 多线程加速 | ⚠️（GIL 限制） | ⚠️（Worker Threads） |
| 多进程 | ✅ multiprocessing | ✅ cluster/child_process |
| 异步 I/O | ✅ asyncio | ✅ 原生事件循环 |
| 内存视图 | ✅ memoryview/buffer | ✅ ArrayBuffer/Buffer |
| SIMD | ✅ NumPy 内部使用 | ⚠️ SIMD.js（有限支持） |

## 七、什么时候性能差异重要？

**重要**：
- 高并发 API 网关（每秒万级请求）
- 实时数据处理管道
- 游戏服务器
- 高频交易系统

**不重要**：
- 内部管理后台（QPS < 100）
- 数据分析脚本（瓶颈在 I/O 不在 CPU）
- CI/CD 脚本
- 原型开发

> **过早优化是万恶之源。** 大多数应用，Python 和 Node.js 的性能差异不是瓶颈。数据库查询、网络延迟、第三方 API 调用才是真正的瓶颈。选语言的依据应该是团队能力和生态匹配度，而不是 10% 的性能差异。

## 八、本章小结

- **纯 CPU 计算**：Node.js（JIT）比 Python 快 5-10 倍，但 NumPy 反超
- **I/O 并发**：Node.js 略快（10-30%），Python + uvloop 接近
- **启动速度**：Python 更快，Serverless 冷启动有优势
- **内存效率**：Node.js（V8 隐藏类）略优
- **性能优化路径**：Python 靠 C 扩展，Node.js 靠 JIT

选型时：**如果性能是第一优先级，两门语言都不是最优选择（考虑 Go/Rust）。在 Python 和 Node.js 之间，性能差异通常不是决定性因素。**`,
  },

  {
    id: "pyvsjs-team",
    icon: "👥",
    title: "开发效率与团队协作",
    group: "选型指南",
    content: `# 开发效率与团队协作

## 一、开发效率的多个维度

语言选型不只是技术问题，更是**人的问题**。一个团队用熟悉的语言，效率远高于用"更快但陌生"的语言。

| 维度 | Python | Node.js |
|------|--------|---------|
| 学习曲线 | 平缓（语法简单） | 中等（this/闭包/原型链/异步） |
| 代码可读性 | 高（强制缩进、单一风格） | 中等（风格多样） |
| 类型安全 | 可选（mypy/pyright） | 可选（TypeScript） |
| 调试体验 | 良好（pdb/IDE） | 良好（Chrome DevTools） |
| 热重载 | ✅（uvicorn --reload） | ✅（nodemon） |
| 文档生态 | 优秀（标准库文档 + Read the Docs） | 优秀（MDN + 官方文档） |
| Stack Overflow 答案 | 海量 | 海量 |

## 二、学习曲线

### Python：入门最容易的语言之一

\`\`\`python
# Python：读文件并统计词频，5 行代码
from collections import Counter
with open("article.txt", encoding="utf-8") as f:
    words = f.read().split()
freq = Counter(words)
print(freq.most_common(10))
\`\`\`

Python 的语法接近伪代码，新手能在一天内写出有用的程序。这也是为什么 Python 是大学计算机科学入门课的首选语言。

### JavaScript：入门容易，精通难

\`\`\`javascript
// JavaScript：同样的功能
const fs = require('fs');
const text = fs.readFileSync('article.txt', 'utf-8');
const words = text.split(/\\s+/);
const freq = words.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
}, {});
const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log(sorted);
\`\`\`

JavaScript 语法也不难，但精通需要理解：
- \`this\` 的 4 种绑定规则
- 原型链和 \`__proto__\`
- 闭包和变量捕获
- 事件循环和微任务/宏任务
- \`var\`/\`let\`/\`const\` 的区别和 TDZ
- 类型强制转换规则

## 三、团队代码一致性

### Python：天然统一

Python 的强制缩进 + PEP 8 + black（自动格式化）让团队代码高度统一。两个 Python 程序员写的代码，风格差异很小。

\`\`\`python
# 100 个 Python 程序员写同一个函数，看起来几乎一样
def calculate_price(quantity, unit_price, discount=0):
    subtotal = quantity * unit_price
    discount_amount = subtotal * discount
    return subtotal - discount_amount
\`\`\`

### JavaScript：需要工具约束

JavaScript 的自由度导致团队代码风格差异大。需要 ESLint + Prettier + TypeScript + husky + lint-staged 才能勉强统一。

\`\`\`javascript
// 同一个函数，5 个 JS 程序员可能有 5 种写法

// 写法 1：传统函数
function calculatePrice(quantity, unitPrice, discount) {
    discount = discount || 0;
    var subtotal = quantity * unitPrice;
    return subtotal - subtotal * discount;
}

// 写法 2：箭头函数 + 默认参数
const calculatePrice = (quantity, unitPrice, discount = 0) => {
    const subtotal = quantity * unitPrice;
    return subtotal * (1 - discount);
};

// 写法 3：函数式
const calculatePrice = (q, p, d = 0) => q * p * (1 - d);

// 写法 4：TypeScript + 接口
function calculatePrice(params: { quantity: number; unitPrice: number; discount?: number }): number {
    const { quantity, unitPrice, discount = 0 } = params;
    return quantity * unitPrice * (1 - discount);
}
\`\`\`

## 四、类型安全

### Python 类型提示

\`\`\`python
# Python：类型提示是可选的，运行时不检查
def greet(name: str) -> str:
    return f"Hello, {name}"

# 类型检查靠 mypy 或 pyright（IDE 插件）
# 运行时传错类型不会报错：
greet(123)  # 运行时不会报错，但类型检查器会警告
\`\`\`

### TypeScript

\`\`\`typescript
// TypeScript：编译时类型检查，类型擦除后运行
function greet(name: string): string {
    return \`Hello, \${name}\`;
}

// 编译时就报错：
// greet(123);  // error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

TypeScript 的类型系统比 Python 类型提示更成熟：
- 编译时强制检查（Python 需要额外运行 mypy）
- 类型推断更强（不需要处处标注）
- IDE 支持更好（VS Code 原生集成）
- 生态系统更完善（ DefinitelyTyped 类型定义）

但 Python 类型提示也在快速进步，pyright（Pylance 底层）的体验已经接近 TypeScript。

## 五、招聘与团队组建

### Python 开发者画像

\`\`\`text
常见背景：
- 数据科学/机器学习背景
- 后端开发（Django/Flask/FastAPI）
- 运维/DevOps
- 学术研究/科研
- 非计算机专业转行（数据分析师等）

薪资范围（国内一线城市，2024）：
- 初级：8-15K
- 中级：15-30K
- 高级：30-60K
- AI/ML 方向：40-100K+

招聘难度：中等（候选人多，但 ML 方向高端人才稀缺）
\`\`\`

### Node.js 开发者画像

\`\`\`text
常见背景：
- 前端转全栈
- 后端开发（Express/NestJS）
- 全栈开发者
- 移动端（React Native）

薪资范围（国内一线城市，2024）：
- 初级：8-15K
- 中级：15-35K
- 高级：30-60K
- 架构师：50-80K

招聘难度：容易（前端开发者众多，转 Node.js 门槛低）
\`\`\`

## 六、全栈同语言的优势

Node.js 最大的团队优势是**前后端同语言**：

\`\`\`text
全栈 TypeScript 团队的工作流：
前端（React + TypeScript）
    ↕ 共享类型定义
后端（NestJS + TypeScript）
    ↕ 共享验证逻辑
数据库（Prisma + TypeScript）

优势：
1. 前后端共享类型定义（DTO/接口类型）
2. 前端开发者可以写后端 API
3. 代码复用（验证逻辑、工具函数）
4. 一个开发者全栈交付功能
5. 招聘只需招 TypeScript 开发者
\`\`\`

Python 做不到这一点——前端必须用 JavaScript，后端用 Python，团队需要两种技能。

\`\`\`python
# Python 后端 + JS 前端的痛点
# 后端定义的数据结构：
class User(BaseModel):
    id: int
    name: str
    email: str

# 前端需要手动重新定义对应的 TypeScript 类型：
# interface User { id: number; name: string; email: string; }
# 两边不同步 → bug

# 解决方案：用 FastAPI 自动生成 OpenAPI schema，
# 前端用 openapi-typescript 自动生成 TS 类型
# 但仍然是额外工具链，不如 Node.js 天然同构
\`\`\`

## 七、何时选 Python（团队角度）

1. **团队以数据/AI 为核心**：ML 工程师、数据科学家天然用 Python
2. **后端需要重数据处理**：直接调 Pandas/NumPy/Scikit-learn
3. **团队有 Python 传统**：运维、科研团队已有 Python 基础
4. **项目需要快速原型**：Python 的开发速度最快
5. **招聘数据方向人才**：Python 候选人池更大

## 八、何时选 Node.js（团队角度）

1. **团队以前端为核心**：前端开发者转全栈成本最低
2. **需要全栈同构**：前后端类型共享、逻辑复用
3. **实时应用**：WebSocket、SSE、长轮询
4. **Serverless 优先**：Vercel/Netlify 生态原生支持
5. **招聘全栈开发者**：TypeScript 全栈候选人多

## 九、本章小结

| 维度 | Python 优势 | Node.js 优势 |
|------|-------------|-------------|
| 学习曲线 | ✅ 更平缓 | |
| 代码一致性 | ✅ 天然统一 | |
| 类型安全 | | ✅ TypeScript 更成熟 |
| 全栈同构 | | ✅ 前后端同语言 |
| 招聘 | ✅ AI/数据方向 | ✅ 全栈方向 |
| 开发速度 | ✅ 快速原型 | |
| 团队复用 | | ✅ 前端可写后端 |

> **选语言本质是选团队。** 一个熟悉 Python 的数据团队用 Node.js 写后端是灾难；一个 TypeScript 全栈团队用 Python 写后端也是浪费。**让工具适配团队，而不是让团队适配工具。**`,
  },

  {
    id: "pyvsjs-decision",
    icon: "🧭",
    title: "场景决策树：选 Python 还是 Node.js",
    group: "选型指南",
    content: `# 场景决策树：选 Python 还是 Node.js

## 一、终极决策框架

本章是全书的落地章节。前面 37 章讲了两门语言的差异，现在回答最实际的问题：**我的项目该选哪个？**

### 决策流程图

\`\`\`
                    ┌─ 需要 AI/ML/数据科学？─→ Python
                    │
                    │  ┌─ 需要 SSR/前端渲染？─→ Node.js
                    │  │
  项目需求 ─→ ──────┤  │  ┌─ 高并发实时通信？─→ Node.js
                    │  │  │
                    │  │  │  ┌─ 重 CPU 计算（非 NumPy）？─→ Node.js
                    │  │  │  │
                    │  │  │  │           ┌─ 团队偏前端？─→ Node.js
                    │  │  │  │           │
                    └──┴──┴──┴──→ 通用 Web 后端 ──┤
                                                │
                                                └─ 团队偏数据/Python？─→ Python
\`\`\`

## 二、明确选 Python 的场景

### 场景 1：AI/机器学习项目

\`\`\`text
项目特征：
- 需要训练模型（PyTorch/TensorFlow）
- 需要数据处理（Pandas/NumPy）
- 需要 NLP/CV（HuggingFace/OpenCV）
- 模型推理 API

选择：Python（无替代）
原因：整个 AI 生态围绕 Python 建立，Node.js 无法竞争
\`\`\`

\`\`\`python
# 典型场景：用 FastAPI 部署 ML 模型
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()
model = joblib.load("model.pkl")

class InputData(BaseModel):
    features: list[float]

@app.post("/predict")
async def predict(data: InputData):
    prediction = model.predict([data.features])
    return {"prediction": prediction.tolist()}
\`\`\`

### 场景 2：数据处理/ETL 管道

\`\`\`text
项目特征：
- 大量数据清洗、转换
- 定时任务/cron job
- 数据库读写 + 文件处理
- 报表生成

选择：Python
原因：Pandas + 标准库 + 简单语法，开发效率最高
\`\`\`

### 场景 3：爬虫与数据采集

\`\`\`text
项目特征：
- 大规模网页抓取
- 需要解析 HTML/JSON
- 反爬虫对抗
- 数据清洗入库

选择：Python
原因：requests/BeautifulSoup/Scrapy/Playwright 生态最成熟
\`\`\`

### 场景 4：内部工具与自动化

\`\`\`text
项目特征：
- 运维脚本
- 批量文件处理
- 内部管理后台（Django Admin）
- 快速原型

选择：Python
原因：标准库强大、开发速度快、Django Admin 开箱即用
\`\`\`

### 场景 5：量化交易/金融分析

\`\`\`text
项目特征：
- 时间序列分析
- 统计建模
- 回测框架
- 实时行情处理

选择：Python
原因：NumPy/Pandas/SciPy/statsmodels 生态不可替代
\`\`\`

## 三、明确选 Node.js 的场景

### 场景 6：全栈 Web 应用（前端驱动）

\`\`\`text
项目特征：
- 前端复杂（React/Vue/Next.js）
- 需要 SSR/SSG
- 前后端类型共享
- 一个团队全栈交付

选择：Node.js
原因：前后端同语言，Next.js 全栈方案成熟
\`\`\`

\`\`\`typescript
// Next.js 全栈：一个项目里前后端共享类型
// app/api/users/route.ts（后端 API）
import { NextRequest } from 'next/server';
import { UserSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const user = UserSchema.parse(body);  // 前后端共享的验证
    // 保存到数据库...
    return Response.json({ success: true, user });
}

// app/users/page.tsx（前端页面）
import { UserSchema } from '@/lib/schemas';
// 同一个类型定义，前端也能用
\`\`\`

### 场景 7：实时应用

\`\`\`text
项目特征：
- WebSocket 实时通信
- 在线协作（文档/白板）
- 即时通讯
- 实时数据推送

选择：Node.js
原因：事件循环天生适合长连接，Socket.io 生态成熟
\`\`\`

### 场景 8：BFF（Backend for Frontend）

\`\`\`text
项目特征：
- 为前端定制的 API 聚合层
- 多个微服务的 API 网关
- GraphQL 服务端

选择：Node.js
原因：前端团队可以自己写 BFF，不需要后端团队介入
\`\`\`

### 场景 9：Serverless/边缘计算

\`\`\`text
项目特征：
- AWS Lambda / Vercel / Cloudflare Workers
- 冷启动敏感
- 按需执行

选择：Node.js（或 Python，看团队）
原因：Node.js 在 Serverless 生态支持最好，但 Python 冷启动更快
\`\`\`

### 场景 10：CLI 工具（前端生态）

\`\`\`text
项目特征：
- 前端构建工具
- 脚手架工具
- 开发者工具

选择：Node.js
原因：npm 生态 + npx 直接运行，前端开发者天然使用
\`\`\`

## 四、都可以——看团队倾向的场景

### 场景 11：RESTful API 服务

\`\`\`text
项目特征：
- 标准 CRUD API
- 数据库读写
- 用户认证
- 中等并发

两个选择都很好：
- Python：FastAPI（自动文档、类型验证、asyncio）
- Node.js：NestJS（TypeScript、DI、装饰器）

决策依据：看团队更熟悉哪个
\`\`\`

\`\`\`python
# FastAPI 方案
from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    # 自动生成 OpenAPI 文档
    # 自动类型验证
    return {"item": item}
\`\`\`

\`\`\`typescript
// NestJS 方案
import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsNumber } from 'class-validator';

class CreateItemDto {
    @IsString() name: string;
    @IsNumber() price: number;
}

@Controller('items')
export class ItemsController {
    @Post()
    async create(@Body() dto: CreateItemDto) {
        return { item: dto };
    }
}
\`\`\`

### 场景 12：微服务后端

\`\`\`text
项目特征：
- 多个独立服务
- 消息队列
- gRPC/HTTP 通信
- 容器化部署

两个选择都好：
- Python：FastAPI 轻量、gRPC 支持好
- Node.js：NestJS 企业级、TypeScript 类型安全

决策依据：看整体技术栈一致性
\`\`\`

### 场景 13：GraphQL API

\`\`\`text
- Python：Strawberry / Graphene / Ariadne
- Node.js：Apollo Server / graphql-yoga

Node.js 生态略成熟（Apollo 工具链），但 Python 也可以用
\`\`\`

## 五、不该选的场景

### 不该选 Python

\`\`\`text
❌ 前端渲染/SSR → 用 Node.js
❌ 浏览器端逻辑 → 用 JavaScript
❌ 超高并发实时推送（10万+连接） → 用 Go/Erlang
❌ 系统级编程 → 用 C/C++/Rust
❌ 嵌入式（资源极受限） → 用 C
❌ 移动端原生开发 → 用 Swift/Kotlin
\`\`\`

### 不该选 Node.js

\`\`\`text
❌ AI/ML 项目 → 用 Python
❌ 数据科学/分析 → 用 Python
❌ CPU 密集型计算 → 用 C/C++/Rust/Go
❌ 需要极低延迟 → 用 C/C++/Rust
❌ 大规模爬虫 → 用 Python
❌ 需要精确数值计算 → 用 Python（整数无限精度）
\`\`\`

## 六、混合架构：两全其美

很多成功的项目不是"二选一"，而是**混合架构**——让每种语言做它最擅长的事：

\`\`\`text
混合架构示例：

用户请求 → Node.js (BFF/API 网关)
                ↓
        ┌───────┴───────┐
        │               │
   Python 微服务     Node.js 微服务
   (AI 推理/数据处理)   (用户管理/订单)
        │               │
        └───────┬───────┘
                ↓
            数据库 + 缓存
\`\`\`

\`\`\`text
典型混合架构：
1. Node.js 做 API 网关 + 前端 SSR
2. Python 做 AI 推理服务（gRPC 通信）
3. Python 做 ETL 数据管道
4. Go 做高性能微服务（如果有）
\`\`\`

## 七、决策清单

回答以下问题，就能做出选择：

\`\`\`text
1. 项目涉及 AI/ML/数据科学吗？
   是 → Python

2. 项目需要前端 SSR/全栈同构吗？
   是 → Node.js

3. 项目需要大规模数据采集（爬虫）吗？
   是 → Python

4. 项目是实时应用（聊天/协作）吗？
   是 → Node.js

5. 团队主要是前端开发者吗？
   是 → Node.js

6. 团队主要是数据/AI 工程师吗？
   是 → Python

7. 以上都不是？
   → 看团队更熟悉哪个，两者都可以
   → 看公司技术栈一致性
   → 看招聘市场
\`\`\`

## 八、本章小结

| 场景 | 推荐 | 理由 |
|------|------|------|
| AI/ML/数据科学 | Python | 生态不可替代 |
| 数据处理/ETL | Python | Pandas 生态 |
| 爬虫 | Python | Scrapy/requests |
| 全栈 Web | Node.js | 前后端同语言 |
| 实时应用 | Node.js | 事件循环 |
| Serverless | 都可以 | 看团队 |
| RESTful API | 都可以 | 看团队 |
| 内部工具 | Python | Django Admin |
| CLI 工具（前端） | Node.js | npm 生态 |
| 量化交易 | Python | NumPy/Pandas |

> **没有最好的语言，只有最合适的语言。** 选型的核心是：**在正确的场景用正确的工具，并保持技术栈的一致性。**`,
  },

  {
    id: "pyvsjs-hybrid",
    icon: "🔗",
    title: "混合架构实践",
    group: "选型指南",
    content: `# 混合架构实践

## 一、为什么要混合架构

真实世界的系统很少只用一种语言。每种语言有自己的主场：

\`\`\`text
Python 主场：AI 推理、数据处理、科学计算、爬虫
Node.js 主场：API 网关、前端 SSR、实时通信、BFF
Go 主场：高性能微服务、网关
Rust 主场：性能关键路径、系统编程
\`\`\`

混合架构的核心思想：**让每种语言做它最擅长的事，通过标准协议通信。**

## 二、经典混合架构模式

### 模式 1：Node.js 网关 + Python AI 服务

这是最常见的混合模式——前端用 Node.js，AI 用 Python：

\`\`\`text
用户浏览器
    ↓ HTTP
Node.js API 网关（Next.js / Express）
    ↓ gRPC / HTTP
Python AI 服务（FastAPI + PyTorch）
    ↓
模型推理 / 数据处理
\`\`\`

\`\`\`javascript
// Node.js 网关：接收用户请求，调用 Python AI 服务
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/recommend', async (req, res) => {
    const { userId, preferences } = req.body;

    // 调用 Python AI 服务
    const response = await axios.post('http://ai-service:8000/predict', {
        user_id: userId,
        preferences
    });

    // 加上前端需要的额外信息
    const recommendations = response.data.predictions.map(item => ({
        ...item,
        url: \`/products/\${item.id}\`,
        image_url: \`https://cdn.example.com/\${item.id}.jpg\`
    }));

    res.json({ recommendations });
});

app.listen(3000);
\`\`\`

\`\`\`python
# Python AI 服务：模型推理
from fastapi import FastAPI
from pydantic import BaseModel
import torch
from model import RecommendationModel

app = FastAPI()
model = RecommendationModel.load("model.pth")
model.eval()

class PredictRequest(BaseModel):
    user_id: str
    preferences: list[float]

@app.post("/predict")
async def predict(req: PredictRequest):
    with torch.no_grad():
        tensor = torch.tensor([req.preferences])
        predictions = model(tensor)
    return {"predictions": predictions[0].tolist()}
\`\`\`

### 模式 2：Python 后端 + Node.js 前端 SSR

\`\`\`text
用户浏览器
    ↓ HTTP
Next.js（Node.js SSR + 前端）
    ↓ HTTP / GraphQL
Python 后端（Django / FastAPI）
    ↓
数据库
\`\`\`

\`\`\`typescript
// Next.js 的 getServerSideProps 调用 Python 后端 API
export async function getServerSideProps(context) {
    const { data } = await fetch('http://python-backend:8000/api/articles');
    return { props: { articles: data } };
}

function ArticleList({ articles }) {
    return (
        <div>
            {articles.map(a => <Article key={a.id} {...a} />)}
        </div>
    );
}
\`\`\`

### 模式 3：消息队列解耦

\`\`\`text
Node.js API
    ↓ 发布任务
消息队列（Redis / RabbitMQ / Kafka）
    ↓ 消费任务
Python Worker（数据处理 / AI 训练）
    ↓ 写结果
数据库
    ↓ 查询结果
Node.js API 返回给用户
\`\`\`

\`\`\`javascript
// Node.js：发布任务到 Redis 队列
const Redis = require('ioredis');
const redis = new Redis();

app.post('/api/process', async (req, res) => {
    const taskId = generateId();
    await redis.lpush('processing_queue', JSON.stringify({
        taskId,
        data: req.body,
        createdAt: Date.now()
    }));
    res.json({ taskId, status: 'queued' });
});

app.get('/api/result/:taskId', async (req, res) => {
    const result = await redis.get(\`result:\${req.params.taskId}\`);
    if (result) {
        res.json({ status: 'done', result: JSON.parse(result) });
    } else {
        res.json({ status: 'pending' });
    }
});
\`\`\`

\`\`\`python
# Python Worker：消费队列任务
import redis
import json
import time

r = redis.Redis()

while True:
    # 阻塞等待任务
    _, task_data = r.brpop('processing_queue')
    task = json.loads(task_data)

    # 执行耗时操作（AI 推理 / 数据处理）
    result = heavy_computation(task['data'])

    # 写回结果
    r.setex(f"result:{task['taskId']}", 3600, json.dumps(result))
\`\`\`

## 三、通信协议选择

| 协议 | 适用场景 | Python | Node.js |
|------|----------|--------|---------|
| HTTP/REST | 简单 API 调用 | requests/httpx | fetch/axios |
| gRPC | 高性能微服务通信 | grpcio | @grpc/grpc-js |
| GraphQL | 灵活查询 | Strawberry/strawberry | Apollo/graphql-yoga |
| WebSocket | 实时双向通信 | websockets | ws/socket.io |
| 消息队列 | 异步任务解耦 | Celery/RQ | BullMQ/ioredis |
| Redis Pub/Sub | 事件广播 | redis-py | ioredis |

### gRPC 示例（跨语言类型安全）

\`\`\`protobuf
// proto/recommendation.proto
syntax = "proto3";

service Recommender {
    rpc Predict (PredictRequest) returns (PredictResponse);
}

message PredictRequest {
    string user_id = 1;
    repeated float preferences = 2;
}

message PredictResponse {
    repeated Prediction predictions = 1;
}

message Prediction {
    string item_id = 1;
    float score = 2;
}
\`\`\`

\`\`\`python
# Python gRPC 服务端
import grpc
from concurrent import futures
import recommendation_pb2
import recommendation_pb2_grpc

class RecommenderServicer(recommendation_pb2_grpc.RecommenderServicer):
    def Predict(self, request, context):
        # AI 推理
        scores = model.predict(request.preferences)
        return recommendation_pb2.PredictResponse(
            predictions=[
                recommendation_pb2.Prediction(item_id=str(i), score=s)
                for i, s in enumerate(scores)
            ]
        )

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
recommendation_pb2_grpc.add_RecommenderServicer_to_server(
    RecommenderServicer(), server
)
server.add_insecure_port('[::]:50051')
server.start()
\`\`\`

\`\`\`javascript
// Node.js gRPC 客户端
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/recommendation.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.Recommender(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

client.Predict(
    { user_id: '123', preferences: [0.1, 0.5, 0.3] },
    (err, response) => {
        if (err) console.error(err);
        else console.log('推荐结果:', response.predictions);
    }
);
\`\`\`

gRPC 的优势：Protobuf 定义类型，两端自动生成代码，跨语言类型安全。

## 四、共享类型定义的方案

### 方案 1：OpenAPI/Swagger

\`\`\`python
# Python FastAPI 自动生成 OpenAPI schema
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    return User(id=user_id, name="Alice", email="alice@example.com")

# FastAPI 自动在 /openapi.json 生成 schema
\`\`\`

\`\`\`bash
# 用 openapi-typescript 从 schema 生成 TypeScript 类型
npx openapi-typescript http://localhost:8000/openapi.json -o types/api.ts
\`\`\`

\`\`\`typescript
// 自动生成的类型，前端直接用
import { paths } from './types/api';

type User = paths['/users/{user_id}']['get']['responses']['200']['content']['application/json'];
// User 类型：{ id: number; name: string; email: string }
\`\`\`

### 方案 2：Protobuf（gRPC 场景）

Protobuf 天然跨语言——一个 .proto 文件生成 Python 和 TypeScript 两端的代码。

### 方案 3：JSON Schema 共享

\`\`\`python
# Python 定义 JSON Schema
user_schema = {
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"}
    },
    "required": ["id", "name", "email"]
}
\`\`\`

\`\`\`typescript
// TypeScript 用 json-schema-to-typescript 生成类型
import { compile } from 'json-schema-to-typescript';
// 自动生成：interface User { id: number; name: string; email: string }
\`\`\`

## 五、部署架构

### Docker Compose 混合部署

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  # Node.js API 网关
  api-gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service
      - redis

  # Python AI 服务
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/models/recommender.pth
    volumes:
      - ./models:/models

  # Python Worker（后台任务）
  data-worker:
    build: ./worker
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # Redis 消息队列
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
\`\`\`

## 六、真实案例

### 案例 1：电商推荐系统

\`\`\`text
架构：
- Next.js（Node.js）→ 前端 SSR + API 路由
- FastAPI（Python）→ 推荐引擎（PyTorch 模型推理）
- Celery（Python）→ 离线训练 + 数据处理
- Redis → 消息队列 + 缓存
- PostgreSQL → 商品/用户数据

数据流：
1. 用户浏览商品 → Next.js 接收请求
2. Next.js 调用 FastAPI 推荐服务 → 获取个性化推荐
3. 推荐结果缓存到 Redis → 下次直接读缓存
4. 用户行为异步写入 Kafka → Python 消费者更新模型
\`\`\`

### 案例 2：内容管理平台

\`\`\`text
架构：
- Django（Python）→ CMS 后端 + Admin 管理界面
- Next.js（Node.js）→ 前端渲染
- Python 脚本 → 定时抓取/清洗内容（爬虫）
- Elasticsearch → 全文搜索
\`\`\`

### 案例 3：实时协作工具

\`\`\`text
架构：
- Node.js + Socket.io → WebSocket 实时通信
- Python + FastAPI → 文档分析/AI 辅助写作
- Redis Pub/Sub → 跨服务事件广播
\`\`\`

## 七、混合架构的注意事项

### 1. 服务边界要清晰

\`\`\`text
✅ 好的边界：
- AI 服务只负责"输入特征 → 输出预测"
- API 网关只负责"聚合 + 路由 + 认证"

❌ 坏的边界：
- AI 服务里有用户认证逻辑
- API 网关里有数据处理逻辑
\`\`\`

### 2. 数据库不要共享

\`\`\`text
✅ 好的做法：每个服务有自己的数据库，通过 API 通信
❌ 坏的做法：Python 和 Node.js 直接连同一个数据库表

原因：共享数据库会导致耦合，改表结构时两个服务都要改
\`\`\`

### 3. 统一错误处理

\`\`\`python
# Python 服务：统一错误格式
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(exc),
                "service": "ai-service"
            }
        }
    )
\`\`\`

\`\`\`javascript
// Node.js 网关：统一拦截下游服务错误
app.use(async (err, req, res, next) => {
    if (err.isAxiosError && err.response) {
        // 转发下游服务的错误格式
        return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: err.message,
            service: 'api-gateway'
        }
    });
});
\`\`\`

### 4. 监控和链路追踪

\`\`\`text
使用 OpenTelemetry 统一追踪：
- 请求从 Node.js 进入 → 生成 trace ID
- 调用 Python 服务 → 传递 trace ID（HTTP header）
- 两端都上报到同一个追踪系统（Jaeger/Zipkin）

这样能看到一个请求在 Node.js 和 Python 中分别花了多少时间
\`\`\`

## 八、全书总结

\`\`\`text
本书 38 章的核心结论：

1. Python 和 JavaScript 是两种哲学：
   - Python：统一、可读、电池全含
   - JavaScript：灵活、兼容、生态庞大

2. 底层实现差异巨大：
   - CPython：树遍历解释器 + 引用计数 GC
   - V8：JIT 编译器 + 分代 GC
   - 但对大多数应用，性能差异不是瓶颈

3. 并发模型不同但殊途同归：
   - Python：GIL + multiprocessing + asyncio
   - Node.js：单线程事件循环 + Worker Threads
   - 都有 async/await 语法

4. 生态互补：
   - Python 主场：AI/数据/爬虫/运维
   - Node.js 主场：前端/全栈/实时/Serverless

5. 选型原则：
   - 在正确的场景用正确的工具
   - 团队熟悉度 > 语言特性
   - 混合架构是成熟的实践
\`\`\`

> **最终建议：不要纠结"哪种语言更好"，而要思考"我的问题最适合用哪种语言解决"。最好的架构不是全用一种语言，而是让每种语言各司其职。**`,
  },
];
