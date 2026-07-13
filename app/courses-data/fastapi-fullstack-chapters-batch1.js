// =============================================================
// FastAPI 全栈实战 - 第 1 批章节（项目启动与 FastAPI 入门 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ff-overview:   项目概览——我们要做什么
//   ff-envsetup:   环境搭建与虚拟环境
//   ff-firstapp:   第一个 FastAPI 应用
//   ff-params:     路径参数与查询参数
//   ff-pydantic:   请求体与 Pydantic 模型
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：项目概览——我们要做什么
  // ============================================================
  {
    id: "ff-overview",
    group: "项目启动与 FastAPI 入门",
    icon: "🎯",
    title: "项目概览：我们要做什么",
    content: `# 项目概览：我们要做什么

## 一、这个教程要带你做什么

欢迎来到 **FastAPI 全栈实战**！在这个教程里，我们会**从零开始**，一步步搭建一个完整的**任务看板系统 TaskBoard**——一个类似 Trello / Jira 的看板应用。

学完之后你将拥有：

- 一个**能跑的全栈应用**：FastAPI 后端 + Next.js 前端 + SQLite 数据库
- 一份**完整的代码资产**：每行关键代码都有详细中文注释
- 一套**现代 FastAPI 开发体系**：从设计、编码、测试到部署的完整方法论

## 二、最终产品长什么样

我们要做的 TaskBoard 看板系统包含这些功能：

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  TaskBoard 看板                          [alice ▾]  [退出]   │
├─────────────────────────────────────────────────────────────┤
│  📋 我的项目看板                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 待办     │  │ 进行中   │  │ 待审核   │  │ 已完成   │   │
│  │          │  │          │  │          │  │          │   │
│  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │   │
│  │ │任务A │ │  │ │任务C │ │  │ │任务E │ │  │ │任务G │ │   │
│  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │   │
│  │ ┌──────┐ │  │ ┌──────┐ │  │          │  │          │   │
│  │ │任务B │ │  │ │任务D │ │  │          │  │          │   │
│  │ └──────┘ │  │ └──────┘ │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

**核心功能清单：**

| 功能模块 | 说明 |
|---------|------|
| 用户注册/登录 | 邮箱+密码注册，JWT 令牌认证 |
| 多看板管理 | 每个用户可以创建多个看板 |
| 看板列管理 | 看板下有多个列（待办、进行中、已完成） |
| 任务卡片 | 列下有多个任务卡片，可拖拽排序 |
| 实时同步 | 多人同时操作时通过 WebSocket 实时同步 |
| 头像上传 | 用户可以上传头像 |
| 权限控制 | 看板有所有者，只有所有者能删看板 |

## 三、技术栈一览

| 层级 | 技术 | 为什么选它 |
|------|------|----------|
| 后端框架 | **FastAPI** | 现代、高性能、自动文档、类型安全 |
| 数据库 | **SQLite** | 零配置、文件型、教学友好 |
| ORM | **SQLAlchemy 2.0** | Python 最强 ORM，支持类型注解 |
| 数据校验 | **Pydantic v2** | 与 FastAPI 深度集成，类型即文档 |
| 认证 | **JWT + bcrypt** | 无状态认证、密码哈希防泄漏 |
| 前端框架 | **Next.js 16** | React 全栈框架、App Router |
| 前端语言 | **JavaScript** | 教学友好，专注 FastAPI 学习 |
| 实时通信 | **WebSocket** | FastAPI 原生支持 |
| 测试 | **pytest + httpx** | Python 测试事实标准 |
| 部署 | **Docker + Uvicorn** | 容器化部署，生产可用 |

## 四、为什么选 FastAPI

FastAPI 是 Sebastian Ramirez 在 2018 年开源的现代 Python Web 框架，它的设计哲学是**用 Python 类型注解驱动一切**：

\`\`\`python
# 这是一段典型的 FastAPI 代码
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 用 Pydantic 定义数据结构——这就是接口的"契约"
class Task(BaseModel):
    title: str           # 标题必须是字符串
    done: bool = False   # done 可选，默认 False

@app.post("/tasks")
def create_task(task: Task):  # 类型注解 → FastAPI 自动校验
    return {"created": task}
\`\`\`

**FastAPI 的四大杀手锏：**

1. **类型即文档**：你写类型注解，FastAPI 自动生成 OpenAPI 文档（/docs）
2. **自动校验**：请求体不符合 schema，框架直接返回 422，你不用写一行校验代码
3. **依赖注入**：用 \`Depends()\` 把"获取数据库会话"、"获取当前用户"做成可复用的零件
4. **同步异步通吃**：\`def\` 和 \`async def\` 都能用，按需选择

## 五、教程学习路线图

\`\`\`
第 1 阶段：项目启动与 FastAPI 入门（5 章）
  └─ 搭好开发环境，理解 FastAPI 基本用法
       │
第 2 阶段：数据持久化与 SQLAlchemy（5 章）
  └─ 学会用 ORM 操作数据库，告别裸 SQL
       │
第 3 阶段：用户认证系统（5 章）
  └─ 实现 JWT 登录，掌握现代 Web 认证
       │
第 4 阶段：看板核心 CRUD（6 章）
  └─ 实现看板/列/卡片的增删改查
       │
第 5 阶段：高级特性（6 章）
  └─ WebSocket、文件上传、后台任务、中间件
       │
第 6 阶段：Next.js 前端集成（5 章）
  └─ 用 Next.js 写出可交互的看板界面
       │
第 7 阶段：测试与部署（5 章）
  └─ 写测试、容器化、上线生产
\`\`\`

## 六、你需要准备什么

| 准备项 | 说明 |
|--------|------|
| Python 3.10+ | 推荐 3.11 或 3.12，类型注解支持最好 |
| Node.js 20+ | 跑前端用，LTS 版本即可 |
| 一个编辑器 | VS Code 推荐，装 Python + ESLint 插件 |
| 命令行基础 | 会用 cd、ls、pip、npm 就行 |
| Python 基础 | 知道类、函数、装饰器即可，不需要精通 |

## 七、本项目与现有 FastAPI 教程的区别

| 维度 | 普通 FastAPI 教程 | 本教程 |
|------|------------------|--------|
| 项目规模 | 单文件 demo | 37 章搭出完整应用 |
| 知识广度 | 只讲后端 | 后端 + 前端 + 数据库 + 部署 |
| 代码注释 | 简略 | 每段代码详细中文注释 |
| 可运行性 | 需要本地配环境 | 浏览器在线运行每个 demo |
| 教学导向 | API 罗列 | 项目驱动，按需引入 |

## 八、开始之前的心态调整

1. **不要怕报错**：报错是 FastAPI 在帮你。它的错误信息精确到字段，比绝大多数框架都友好。
2. **多动手敲**：每个 demo 都可以在线运行，改一改参数看看会发生什么。
3. **理解而非背诵**：FastAPI 的设计很统一，理解了"类型注解驱动"这一条主线，80% 的 API 你都能猜出来。
4. **善用 /docs**：FastAPI 自带的 Swagger 文档是最好的"接口说明书"，写代码时随时打开对照。

准备好了吗？下一章我们开始搭开发环境。🚀`,
  },

  // ============================================================
  // 第 2 章：环境搭建与虚拟环境
  // ============================================================
  {
    id: "ff-envsetup",
    group: "项目启动与 FastAPI 入门",
    icon: "🛠️",
    title: "环境搭建与虚拟环境",
    content: `# 环境搭建与虚拟环境

## 一、为什么需要虚拟环境

生活类比：假设你有两个项目，A 项目需要 FastAPI 0.100，B 项目需要 FastAPI 0.115。如果都用系统 Python，装一个就覆盖另一个，永远没法同时跑。

**虚拟环境（virtual environment）** 就是给每个项目一个独立的"Python 小房间"——里面装的包互不干扰。

\`\`\`
系统 Python（共享）
  ├── 项目 A 的虚拟环境（FastAPI 0.100）
  └── 项目 B 的虚拟环境（FastAPI 0.115）
\`\`\`

## 二、Python 自带的 venv

Python 3.3 起内置了 \`venv\` 模块，不需要额外安装。下面是完整流程。

### 2.1 创建项目目录

\`\`\`bash
# 在任意位置创建项目根目录
mkdir taskboard
cd taskboard
\`\`\`

### 2.2 创建虚拟环境

\`\`\`bash
# macOS / Linux
python3 -m venv .venv

# Windows
python -m venv .venv
\`\`\`

执行后会在当前目录生成 \`.venv\` 文件夹，里面是一个独立的 Python 解释器。

### 2.3 激活虚拟环境

\`\`\`bash
# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1

# Windows (CMD)
.venv\\Scripts\\activate.bat
\`\`\`

激活成功后，命令行提示符前面会出现 \`(.venv)\`：

\`\`\`
(.venv) user@machine:~/taskboard$
\`\`\`

### 2.4 退出虚拟环境

\`\`\`bash
deactivate
\`\`\`

## 三、安装 FastAPI 相关依赖

激活虚拟环境后，用 pip 安装我们需要的包：

\`\`\`bash
# FastAPI 全家桶：
#   fastapi     —— 框架本体
#   uvicorn     —— ASGI 服务器，用来跑 FastAPI
#   [standard]  —— 含 standard 套件，包含表单、cookie 等常用依赖
pip install "fastapi[standard]"

# SQLAlchemy 2.0 —— Python 最强 ORM
pip install "sqlalchemy>=2.0"

# bcrypt —— 密码哈希库
pip install bcrypt

# python-multipart —— 文件上传需要
pip install python-multipart

# 测试相关
pip install pytest httpx
\`\`\`

## 四、requirements.txt：锁定依赖

好的工程习惯是把依赖列表写进 \`requirements.txt\`，方便别人一键安装。

\`\`\`txt
# requirements.txt
fastapi[standard]>=0.115
sqlalchemy>=2.0
bcrypt>=4.0
python-multipart>=0.0.9
pytest>=8.0
httpx>=0.27
\`\`\`

一键安装：

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 五、项目目录结构

我们最终的项目结构长这样（先有个印象，后面章节会逐个创建）：

\`\`\`
taskboard/
├── .venv/                       # 虚拟环境（不提交到 git）
├── backend/                     # 后端（FastAPI）
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # 应用入口
│   │   ├── config.py            # 配置管理
│   │   ├── database.py          # 数据库引擎与会话
│   │   ├── models.py            # ORM 模型
│   │   ├── schemas.py           # Pydantic 数据结构
│   │   ├── security.py          # 密码哈希 + JWT
│   │   ├── deps.py              # 依赖注入（get_db / get_current_user）
│   │   └── routers/             # 路由分组
│   │       ├── __init__.py
│   │       ├── auth.py          # 注册/登录
│   │       ├── boards.py        # 看板 CRUD
│   │       ├── columns.py       # 列 CRUD
│   │       └── cards.py         # 卡片 CRUD
│   ├── tests/                   # 测试
│   └── requirements.txt
├── frontend/                    # 前端（Next.js）
│   └── ...
└── README.md
\`\`\`

## 六、Demo：验证环境是否装好

下面这个 demo 不依赖任何外部包，只用标准库模拟一下"环境信息"。你可以直接在线运行看看效果。后面章节的 demo 会真正用到 fastapi、sqlalchemy 等已安装的包。

\`\`\`python
# Demo：打印当前 Python 环境信息（不依赖第三方包）
import sys
import platform

# sys.version_info 是一个命名元组，包含 Python 主版本号
# 我们用它来判断当前 Python 版本是否满足 3.10+
v = sys.version_info
print(f"Python 版本：{v.major}.{v.minor}.{v.micro}")

# 检查版本是否达标
if v.major >= 3 and v.minor >= 10:
    print("✅ 版本满足 FastAPI 全栈开发要求（>= 3.10）")
else:
    print("❌ 建议升级到 Python 3.10+")

# 打印解释器路径
print(f"解释器路径：{sys.executable}")

# 打印操作系统信息
print(f"操作系统：{platform.system()} {platform.release()}")

# 检查关键依赖是否安装（不导入，只看 sys.modules）
# 注意：这里只是演示，实际开发中你应该直接尝试 import
print()
print("环境检查清单：")
print("  [ ] 已创建虚拟环境 .venv")
print("  [ ] 已激活虚拟环境")
print("  [ ] 已安装 fastapi[standard]")
print("  [ ] 已安装 sqlalchemy>=2.0")
print("  [ ] 已安装 bcrypt")
\`\`\`

## 七、IDE 配置建议（VS Code）

1. **选解释器**：\`Cmd/Ctrl + Shift + P\` → "Python: Select Interpreter" → 选 \`.venv/bin/python\`
2. **装插件**：Python（微软官方）、Pylance、autopep8 或 black
3. **保存自动格式化**：在 \`settings.json\` 加 \`"editor.formatOnSave": true\`

## 八、常见问题

### Q1：pip install 时报 "Permission denied"？

不要用 \`sudo\`！说明你没用虚拟环境，pip 想往系统目录写。回到第 2.3 步激活虚拟环境。

### Q2：Windows 上执行 activate.ps1 报"禁止运行脚本"？

PowerShell 默认禁止执行脚本，用管理员身份运行：
\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### Q3：装了包但 import 报 ModuleNotFoundError？

99% 是没激活虚拟环境，或者 IDE 选错了解释器。检查命令行提示符有没有 \`(.venv)\`。

### Q4：能不能用 poetry 或 uv 代替 pip？

可以，本教程用 pip 是因为它最通用。如果你熟悉 poetry 或 uv，把 \`pip install\` 换成对应命令即可。

## 九、本章小结

- 虚拟环境让每个项目有独立的依赖，互不污染
- \`python -m venv .venv\` 创建，\`source .venv/bin/activate\` 激活
- 用 \`requirements.txt\` 锁定依赖，方便协作
- 下章我们写第一个 FastAPI 应用！`,
  },

  // ============================================================
  // 第 3 章：第一个 FastAPI 应用
  // ============================================================
  {
    id: "ff-firstapp",
    group: "项目启动与 FastAPI 入门",
    icon: "⚡",
    title: "第一个 FastAPI 应用",
    content: `# 第一个 FastAPI 应用

## 一、Hello World：3 行代码起步

创建 \`backend/app/main.py\`，写入下面 3 行代码——这就是一个完整的 FastAPI 应用：

\`\`\`python
# 文件：backend/app/main.py
from fastapi import FastAPI

# 创建一个 FastAPI 应用实例
# FastAPI() 接收可选的元信息参数，用于 OpenAPI 文档展示
app = FastAPI(
    title="TaskBoard API",        # 文档标题
    description="任务看板系统后端 API",  # 文档描述
    version="0.1.0",              # API 版本号
)

# 用 @app.get 装饰器注册一个路由：当 GET / 被请求时，执行下面的函数
@app.get("/")
def root():
    # FastAPI 会自动把返回的 dict 转成 JSON 响应
    return {"message": "Hello, TaskBoard!"}
\`\`\`

## 二、启动应用

在 \`backend/\` 目录下执行：

\`\`\`bash
# uvicorn 是 ASGI 服务器，负责接收 HTTP 请求转给 FastAPI 处理
# app.main:app 表示"app/main.py 文件里的 app 变量"
# --reload 开启热重载，改代码自动重启
uvicorn app.main:app --reload
\`\`\`

控制台会输出：

\`\`\`
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
\`\`\`

浏览器访问 \`http://127.0.0.1:8000/\`，你会看到：

\`\`\`json
{"message": "Hello, TaskBoard!"}
\`\`\`

## 三、FastAPI 的自动文档（重点！）

FastAPI 最大的卖点之一：**你写代码，它自动生成文档**。启动应用后访问：

| URL | 文档形式 | 特点 |
|-----|---------|------|
| \`/docs\` | **Swagger UI** | 可交互，能直接发请求测试 |
| \`/redoc\` | ReDoc | 美观、适合阅读 |
| \`/openapi.json\` | 原始 OpenAPI JSON | 给工具消费的 |

打开 \`http://127.0.0.1:8000/docs\`，你会看到一个交互式文档界面，里面有我们刚写的 \`GET /\` 接口，点 "Try it out" 就能直接调用。

**这意味着你再也不用单独维护接口文档了**——代码就是文档。

## 四、Demo：在线体验 FastAPI 应用

下面这个 demo 用 FastAPI 的 \`TestClient\` 模拟完整的请求-响应流程，你可以在浏览器里直接运行看到效果（无需启动真实服务器）：

\`\`\`python
# Demo：用 TestClient 体验 FastAPI 应用
# TestClient 本质是 httpx + Starlette TestTransport 的封装
# 它不需要真正启动 HTTP 服务器，但会完整跑一遍路由、校验、序列化
from fastapi import FastAPI
from fastapi.testclient import TestClient

# ===== 1. 创建应用 + 注册路由 =====
app = FastAPI(title="TaskBoard Demo", version="0.1.0")

# 路由 1：根路径，返回欢迎信息
@app.get("/")
def root():
    return {"message": "Hello, TaskBoard!"}

# 路由 2：健康检查，运维用来探活
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "taskboard"}

# 路由 3：返回应用信息
@app.get("/info")
def app_info():
    return {
        "name": "TaskBoard",
        "version": "0.1.0",
        "description": "一个任务看板系统",
    }

# ===== 2. 用 TestClient 包装 app =====
# 之后 client.get / client.post 的用法跟 requests 库一模一样
client = TestClient(app)

# ===== 3. 发请求，看响应 =====
print("=== 测试 GET / ===")
r = client.get("/")
print(f"状态码：{r.status_code}")  # 200
print(f"响应体：{r.json()}")        # {"message": "Hello, TaskBoard!"}

print("\\n=== 测试 GET /health ===")
r = client.get("/health")
print(f"状态码：{r.status_code}")
print(f"响应体：{r.json()}")

print("\\n=== 测试 GET /info ===")
r = client.get("/info")
print(f"状态码：{r.status_code}")
print(f"响应体：{r.json()}")

# ===== 4. 测试一个不存在的路径 =====
print("\\n=== 测试 GET /not-exist（不存在的路径）===")
r = client.get("/not-exist")
print(f"状态码：{r.status_code}")  # 404
print(f"响应体：{r.json()}")        # {"detail": "Not Found"}
# FastAPI 自动给 404 返回了结构化的错误信息，不用我们手写
\`\`\`

运行这个 demo，你会看到 FastAPI 的几个关键行为：

1. **自动 JSON 序列化**：返回 dict 自动转成 JSON
2. **统一错误格式**：404 返回 \`{"detail": "Not Found"}\`，全局统一
3. **状态码语义化**：成功 200，找不到 404，校验失败 422

## 五、同步路由 vs 异步路由

FastAPI 同时支持两种写法：

\`\`\`python
# 同步路由：用 def 定义
# 适合 CPU 密集型或调同步库（如 SQLAlchemy 同步模式）
@app.get("/sync")
def sync_handler():
    return {"type": "sync"}

# 异步路由：用 async def 定义
# 适合 IO 密集型，能并发处理多个请求
@app.get("/async")
async def async_handler():
    return {"type": "async"}
\`\`\`

**选哪个？** 简单规则：
- 调数据库（同步 SQLAlchemy）、调同步库 → \`def\`
- 调外部 API、用 aiofiles 等 async 库 → \`async def\`
- 不确定？先用 \`def\`，性能瓶颈出现再优化

## 六、路由装饰器详解

FastAPI 提供了对应 HTTP 方法的装饰器：

| 装饰器 | HTTP 方法 | 用途 | 例子 |
|--------|----------|------|------|
| \`@app.get()\` | GET | 查询资源 | 获取看板列表 |
| \`@app.post()\` | POST | 创建资源 | 创建新看板 |
| \`@app.put()\` | PUT | 全量更新 | 替换整个看板 |
| \`@app.patch()\` | PATCH | 部分更新 | 改看板标题 |
| \`@app.delete()\` | DELETE | 删除资源 | 删除看板 |

RESTful 风格的核心：**URL 表示资源，HTTP 方法表示操作**。

\`\`\`python
# RESTful 设计示例
@app.get("/boards")           # 列出所有看板
@app.post("/boards")          # 创建看板
@app.get("/boards/{board_id}")     # 获取某个看板
@app.put("/boards/{board_id}")     # 更新某个看板
@app.delete("/boards/{board_id}")  # 删除某个看板
\`\`\`

## 七、Demo：CRUD 路由雏形

下面这个 demo 用内存 dict 模拟数据库，演示完整的 CRUD 路由设计：

\`\`\`python
# Demo：用内存 dict 模拟一个看板 CRUD
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI(title="TaskBoard CRUD Demo")

# 内存"数据库"：key 是看板 id，value 是看板 dict
# 真实项目里会用 SQLAlchemy + SQLite，下章会讲
fake_db = {}

@app.get("/boards")
def list_boards():
    """列出所有看板。"""
    # dict.values() 返回所有看板，转成 list 返回
    return list(fake_db.values())

@app.post("/boards")
def create_board(title: str):
    """创建一个看板。title 通过查询参数传入（后面会讲请求体）。"""
    # 用 len(fake_db) + 1 模拟自增 id
    # 真实项目里数据库会自动生成 id
    board_id = len(fake_db) + 1
    board = {"id": board_id, "title": title}
    fake_db[board_id] = board
    return board

@app.get("/boards/{board_id}")
def get_board(board_id: int):
    """获取指定看板。"""
    if board_id not in fake_db:
        # HTTPException 会被 FastAPI 捕获，转成结构化错误响应
        # 第一个参数是状态码，第二个是错误详情
        raise HTTPException(status_code=404, detail="看板不存在")
    return fake_db[board_id]

@app.delete("/boards/{board_id}")
def delete_board(board_id: int):
    """删除指定看板。"""
    if board_id not in fake_db:
        raise HTTPException(status_code=404, detail="看板不存在")
    del fake_db[board_id]
    return {"ok": True}

# ===== 测试 =====
client = TestClient(app)

# 创建 3 个看板
print("=== 创建看板 ===")
for title in ["工作", "学习", "生活"]:
    r = client.post("/boards", params={"title": title})
    print(f"  创建 {title}：{r.json()}")

# 列出所有看板
print("\\n=== 列出看板 ===")
r = client.get("/boards")
print(f"  共 {len(r.json())} 个看板")

# 获取单个看板
print("\\n=== 获取看板 id=2 ===")
r = client.get("/boards/2")
print(f"  {r.json()}")

# 获取不存在的看板
print("\\n=== 获取不存在的看板 id=99 ===")
r = client.get("/boards/99")
print(f"  状态码：{r.status_code}")
print(f"  错误信息：{r.json()}")

# 删除看板
print("\\n=== 删除看板 id=1 ===")
r = client.delete("/boards/1")
print(f"  {r.json()}")

# 再列出，应该剩 2 个
print("\\n=== 删除后列出 ===")
r = client.get("/boards")
print(f"  共 {len(r.json())} 个看板")
\`\`\`

运行这个 demo，观察 CRUD 的完整流程。注意几个细节：

1. **HTTPException**：抛出后 FastAPI 自动转成 \`{"detail": "..."}\` 格式的错误响应
2. **状态码**：404 表示资源不存在，是 RESTful 的惯例
3. **路由顺序**：\`/boards\` 和 \`/boards/{board_id}\` 是不同路径，不会冲突

## 八、本章小结

- 一个 FastAPI 应用 = 一个 \`FastAPI()\` 实例 + 若干个路由装饰器
- 用 \`uvicorn\` 启动，\`--reload\` 开发热重载
- \`/docs\` 自动生成可交互文档，开发时随时打开对照
- \`TestClient\` 不需要真实服务器就能测试应用
- \`HTTPException\` 是抛错误的标准方式
- 下章我们详细讲路径参数和查询参数`,
  },

  // ============================================================
  // 第 4 章：路径参数与查询参数
  // ============================================================
  {
    id: "ff-params",
    group: "项目启动与 FastAPI 入门",
    icon: "🔗",
    title: "路径参数与查询参数",
    content: `# 路径参数与查询参数

## 一、URL 的结构

先复习一下 URL 的结构，这决定了参数从哪里来：

\`\`\`
http://127.0.0.1:8000/boards/42/cards?status=done&limit=10
└────────┬────────┘└────┬────┘└──┬──┘└──────────┬───────────┘
     服务器地址       路径      路径参数      查询参数（query string）
\`\`\`

- **路径参数**：URL 路径里 \`{...}\` 包起来的部分，如 \`/boards/42\` 里的 \`42\`
- **查询参数**：\`?\` 后面的 key=value 对，如 \`?status=done&limit=10\`

## 二、路径参数

### 2.1 基本用法

\`\`\`python
@app.get("/boards/{board_id}")
def get_board(board_id: int):  # 类型注解 int → FastAPI 自动校验
    return {"board_id": board_id}
\`\`\`

请求 \`GET /boards/42\`：
- \`board_id\` 自动绑定到 \`42\`，并且**已经是 int 类型**（不是字符串 "42"）
- 如果你请求 \`GET /boards/abc\`，FastAPI 返回 422 校验错误：

\`\`\`json
{
  "detail": [{
    "type": "int_parsing",
    "loc": ["path", "board_id"],
    "msg": "Input should be a valid integer..."
  }]
}
\`\`\`

### 2.2 类型注解的威力

FastAPI 用类型注解做了三件事：

1. **校验**：类型不对直接 422
2. **转换**：把 URL 字符串转成 Python 类型
3. **文档**：在 \`/docs\` 里显示参数类型

支持的类型：\`int\`、\`float\`、\`str\`、\`bool\`、\`UUID\`、\`Enum\`、\`datetime\` 等。

### 2.3 路由顺序的坑（重要！）

\`\`\`python
# ❌ 错误顺序：/users/me 会被 /users/{user_id} 抢先匹配
@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}

@app.get("/users/me")
def get_me():
    return {"user": "current user"}
\`\`\`

请求 \`GET /users/me\` 时，FastAPI 会先把 \`me\` 当成 \`user_id\` 匹配到第一个路由，永远走不到第二个。

**正确做法**：固定路径放在动态路径前面。

\`\`\`python
# ✅ 正确顺序：固定路径优先
@app.get("/users/me")
def get_me():
    return {"user": "current user"}

@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}
\`\`\`

## 三、查询参数

### 3.1 基本用法

函数参数里**不在路径中声明**的，自动成为查询参数：

\`\`\`python
@app.get("/boards")
def list_boards(skip: int = 0, limit: int = 10):
    # skip 和 limit 是查询参数，都有默认值
    return {"skip": skip, "limit": limit}
\`\`\`

| 请求 | skip | limit | 说明 |
|------|------|-------|------|
| \`/boards\` | 0 | 10 | 都用默认值 |
| \`/boards?skip=20\` | 20 | 10 | 只传 skip |
| \`/boards?skip=20&limit=5\` | 20 | 5 | 都传 |
| \`/boards?limit=abc\` | - | - | 422 校验错误 |

### 3.2 必填 vs 可选

\`\`\`python
@app.get("/search")
def search(keyword: str, limit: int = 10):
    # keyword 没有默认值 → 必填查询参数
    # limit 有默认值 → 可选查询参数
    return {"keyword": keyword, "limit": limit}
\`\`\`

请求 \`GET /search\`（不带 keyword）会 422：\`field required\`。

### 3.3 可选参数（None）

\`\`\`python
from typing import Optional  # Python 3.9 及更早用 Optional
# Python 3.10+ 可以直接写 str | None

@app.get("/boards")
def list_boards(tag: str | None = None):
    # tag 是可选查询参数，不传时为 None
    if tag is None:
        return {"filter": "no tag"}
    return {"filter": tag}
\`\`\`

## 四、查询参数的高级用法

### 4.1 bool 类型的智能转换

\`\`\`python
@app.get("/boards")
def list_boards(include_archived: bool = False):
    return {"include_archived": include_archived}
\`\`\`

FastAPI 会把这些都识别成 \`True\`：\`true\`、\`1\`、\`yes\`、\`on\`。

| 请求 | include_archived |
|------|-----------------|
| \`/boards\` | False |
| \`/boards?include_archived=true\` | True |
| \`/boards?include_archived=1\` | True |
| \`/boards?include_archived=yes\` | True |

### 4.2 Enum 枚举

\`\`\`python
from enum import Enum

# 定义枚举类，继承 str 和 Enum
class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

@app.get("/tasks")
def list_tasks(status: TaskStatus = TaskStatus.todo):
    # status 只能是枚举里的值，否则 422
    return {"filter_status": status}
\`\`\`

请求 \`GET /tasks?status=invalid\` 会返回 422，并提示可选值。

### 4.3 Query 函数：添加元数据

\`\`\`python
from fastapi import Query

@app.get("/boards")
def list_boards(
    # 用 Query 给参数加描述、限制范围
    q: str | None = Query(None, description="搜索关键词"),
    skip: int = Query(0, ge=0, description="跳过条数，不能为负"),
    limit: int = Query(10, ge=1, le=100, description="每页条数，1-100"),
):
    # ge = greater than or equal（>=）
    # le = less than or equal（<=）
    # gt = greater than（>）
    # lt = less than（<）
    return {"q": q, "skip": skip, "limit": limit}
\`\`\`

请求 \`GET /boards?skip=-1\` 会 422，因为 \`ge=0\` 要求 skip >= 0。

## 五、Demo：完整的参数用法

\`\`\`python
# Demo：路径参数 + 查询参数的各种用法
from fastapi import FastAPI, Query, HTTPException
from fastapi.testclient import TestClient
from enum import Enum

app = FastAPI()

# 模拟数据库
boards = {
    1: {"id": 1, "title": "工作", "archived": False},
    2: {"id": 2, "title": "学习", "archived": False},
    3: {"id": 3, "title": "旧项目", "archived": True},
}

# 枚举：任务状态
class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

# 路由 1：路径参数 + 查询参数混用
@app.get("/boards/{board_id}")
def get_board(
    board_id: int,                              # 路径参数（必填）
    include_cards: bool = False,                # 查询参数（可选，默认 False）
    detail_level: str | None = None,            # 查询参数（可选，默认 None）
):
    """获取看板详情，可控制是否返回卡片信息。"""
    if board_id not in boards:
        raise HTTPException(404, "看板不存在")
    board = boards[board_id]
    result = {"board": board}
    if include_cards:
        result["cards"] = []
    if detail_level:
        result["detail_level"] = detail_level
    return result

# 路由 2：分页查询参数 + 范围校验
@app.get("/boards")
def list_boards(
    skip: int = Query(0, ge=0, description="跳过条数"),
    limit: int = Query(10, ge=1, le=50, description="每页 1-50 条"),
    archived: bool = Query(False, description="是否包含已归档"),
):
    """分页列出看板。"""
    all_boards = list(boards.values())
    # 过滤归档
    if not archived:
        all_boards = [b for b in all_boards if not b["archived"]]
    # 分页
    paged = all_boards[skip:skip + limit]
    return {"items": paged, "total": len(all_boards), "skip": skip, "limit": limit}

# 路由 3：枚举查询参数
@app.get("/tasks")
def list_tasks(status: TaskStatus = TaskStatus.todo):
    """按状态过滤任务。"""
    return {"filter": status, "label": status.value}

# ===== 测试 =====
client = TestClient(app)

print("=== 1. 路径参数 + 默认查询参数 ===")
r = client.get("/boards/1")
print(f"  {r.json()}")

print("\\n=== 2. 路径参数 + 查询参数 include_cards=true ===")
r = client.get("/boards/1?include_cards=true")
print(f"  {r.json()}")

print("\\n=== 3. 路径参数类型校验：传非整数 ===")
r = client.get("/boards/abc")
print(f"  状态码 {r.status_code}：{r.json()['detail'][0]['msg']}")

print("\\n=== 4. 分页查询：skip=1&limit=1 ===")
r = client.get("/boards?skip=1&limit=1")
print(f"  {r.json()}")

print("\\n=== 5. 包含归档：archived=true ===")
r = client.get("/boards?archived=true")
print(f"  总数：{r.json()['total']}（包含归档的）")

print("\\n=== 6. 范围校验：limit=200（超过 50）===")
r = client.get("/boards?limit=200")
print(f"  状态码 {r.status_code}：{r.json()['detail'][0]['msg']}")

print("\\n=== 7. 枚举查询参数：status=done ===")
r = client.get("/tasks?status=done")
print(f"  {r.json()}")

print("\\n=== 8. 枚举校验：status=invalid ===")
r = client.get("/tasks?status=invalid")
print(f"  状态码 {r.status_code}")
\`\`\`

运行这个 demo，仔细看每个测试用例的输出。重点体会：

1. **类型注解 → 自动校验**：写 \`board_id: int\` 就够了，框架替你校验
2. **Query → 加元数据**：范围限制、描述、示例都从这里加
3. **错误信息精确**：422 响应里 \`loc\` 字段告诉你哪个参数错了

## 六、参数优先级与冲突

如果路径参数和函数参数同名，会发生什么？

\`\`\`python
# ❌ 不要这么写：q 既是路径参数又是查询参数，会冲突
@app.get("/items/{q}")
def get_items(q: str | None = None):
    return {"q": q}
\`\`\`

FastAPI 会把 \`q\` 当作路径参数（因为路径里有 \`{q}\`），查询参数 \`?q=xxx\` 会被忽略。**避免重名**。

## 七、本章小结

- 路径参数：URL 路径里 \`{...}\` 的部分，类型注解决定校验
- 查询参数：函数参数里不在路径声明的，有默认值即可选
- \`Query()\` 用来加元数据：范围限制、描述、示例
- 路由顺序：固定路径优先于动态路径
- 下章我们学习用 Pydantic 接收复杂的请求体`,
  },

  // ============================================================
  // 第 5 章：请求体与 Pydantic 模型
  // ============================================================
  {
    id: "ff-pydantic",
    group: "项目启动与 FastAPI 入门",
    icon: "📦",
    title: "请求体与 Pydantic 模型",
    content: `# 请求体与 Pydantic 模型

## 一、什么是请求体

GET 请求只能带 URL 参数（路径+查询），但创建资源时数据量可能很大，这时候用 **请求体（request body）** 传 JSON 数据。

\`\`\`
POST /boards HTTP/1.1
Content-Type: application/json

{
  "title": "我的看板",
  "description": "工作计划",
  "color": "blue"
}
\`\`\`

**FastAPI 用 Pydantic 模型来定义请求体的结构**——这是它最强大的特性之一。

## 二、Pydantic 模型入门

Pydantic 是 Python 的数据校验库。你用类继承 \`BaseModel\`，声明字段类型，它就帮你做：

1. **校验**：传入的数据类型对不对
2. **转换**：把 dict 转成对象，把字符串转成目标类型
3. **序列化**：把对象转回 dict / JSON

\`\`\`python
from pydantic import BaseModel

# 定义一个看板模型
class BoardCreate(BaseModel):
    title: str                    # 标题：必须是字符串
    description: str | None = None  # 描述：可选，默认 None
    color: str = "blue"           # 颜色：可选，默认 "blue"
\`\`\`

### 2.1 基本用法（脱离 FastAPI 也能用）

\`\`\`python
# 创建实例：传 dict 或关键字参数都行
board = BoardCreate(title="工作", description="日常工作计划")
print(board.title)        # "工作"
print(board.description)  # "日常工作计划"
print(board.color)        # "blue"（用了默认值）

# 类型不对会抛 ValidationError
try:
    bad = BoardCreate(title=123)  # title 应该是 str
except Exception as e:
    print(e)
\`\`\`

## 三、在 FastAPI 中使用 Pydantic

把 Pydantic 模型作为函数参数的类型注解，FastAPI 自动从请求体解析：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class BoardCreate(BaseModel):
    title: str
    description: str | None = None
    color: str = "blue"

@app.post("/boards")
def create_board(board: BoardCreate):  # 类型注解是 BoardCreate
    # board 已经是 BoardCreate 实例，类型绝对正确
    return {"created": board}
\`\`\`

请求 \`POST /boards\`，body 为 \`{"title": "工作"}\`：

\`\`\`json
{
  "created": {
    "title": "工作",
    "description": null,
    "color": "blue"
  }
}
\`\`\`

如果 body 是 \`{"description": "测试"}\`（缺 title），FastAPI 返回 422：

\`\`\`json
{
  "detail": [{
    "type": "missing",
    "loc": ["body", "title"],
    "msg": "Field required"
  }]
}
\`\`\`

## 四、字段校验

Pydantic v2 用 \`Field\` 函数加校验规则：

\`\`\`python
from pydantic import BaseModel, Field

class BoardCreate(BaseModel):
    # min_length / max_length 限制字符串长度
    title: str = Field(
        ...,                    # ... 表示必填（Python 的 Ellipsis 对象）
        min_length=1,
        max_length=100,
        description="看板标题，1-100 个字符",
        examples=["我的工作看板"],
    )
    # ge / le 限制数字范围
    priority: int = Field(
        default=0,
        ge=0,
        le=10,
        description="优先级，0-10",
    )
    # pattern 用正则校验字符串
    color: str = Field(
        default="blue",
        pattern="^(blue|green|red|yellow)$",
        description="颜色，只能是这几种",
    )
\`\`\`

**常用校验规则：**

| 类型 | 规则 | 说明 |
|------|------|------|
| 字符串 | \`min_length\` / \`max_length\` | 长度范围 |
| 字符串 | \`pattern\` | 正则匹配 |
| 数字 | \`ge\` / \`gt\` / \`le\` / \`lt\` | >= / > / <= / < |
| 列表 | \`min_items\` / \`max_items\` | 元素数量 |
| 任意 | \`default\` | 默认值 |
| 任意 | \`...\` (Ellipsis) | 必填标记 |

## 五、嵌套模型

Pydantic 模型可以嵌套，表达复杂的数据结构：

\`\`\`python
from pydantic import BaseModel
from typing import List

# 子模型：卡片
class CardCreate(BaseModel):
    title: str
    description: str | None = None

# 父模型：看板，里面有多张卡片
class BoardCreate(BaseModel):
    title: str
    cards: list[CardCreate] = []   # 嵌套模型列表，默认空
\`\`\`

请求 body：

\`\`\`json
{
  "title": "工作",
  "cards": [
    {"title": "写文档"},
    {"title": "开会", "description": "周会"}
  ]
}
\`\`\`

FastAPI 会**递归校验**每一层。

## 六、Demo：完整的请求体用法

\`\`\`python
# Demo：用 Pydantic 实现看板创建接口
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from datetime import datetime

app = FastAPI()

# ===== 1. 定义 Pydantic 模型 =====

# 创建看板的请求体
class BoardCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="看板标题",
        examples=["我的工作看板"],
    )
    description: str | None = Field(
        default=None,
        max_length=500,
        description="看板描述（可选）",
    )
    color: str = Field(
        default="blue",
        pattern="^(blue|green|red|yellow|purple)$",
        description="看板颜色",
    )

# 更新看板的请求体（所有字段都可选）
class BoardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    color: str | None = Field(default=None, pattern="^(blue|green|red|yellow|purple)$")

# 响应模型：返回给前端的数据结构
class BoardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    color: str
    created_at: datetime

# ===== 2. 内存数据库 + 自增 id =====
boards_db = {}
next_id = 1

# ===== 3. 路由 =====

@app.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(board: BoardCreate):
    """创建看板。response_model 限制返回字段，status_code=201 表示创建成功。"""
    global next_id
    # board.model_dump() 把 Pydantic 模型转成 dict（Pydantic v2 方法）
    # v1 用 .dict()，v2 改名 .model_dump()
    data = board.model_dump()
    data["id"] = next_id
    data["created_at"] = datetime.now()
    boards_db[next_id] = data
    next_id += 1
    return data  # FastAPI 会用 response_model 自动序列化

@app.get("/boards/{board_id}", response_model=BoardResponse)
def get_board(board_id: int):
    if board_id not in boards_db:
        raise HTTPException(404, "看板不存在")
    return boards_db[board_id]

@app.patch("/boards/{board_id}", response_model=BoardResponse)
def update_board(board_id: int, payload: BoardUpdate):
    """部分更新：只更新传入的字段。"""
    if board_id not in boards_db:
        raise HTTPException(404, "看板不存在")
    # model_dump(exclude_unset=True) 只取客户端实际传入的字段
    # 没传的字段不会被覆盖（这是 PATCH 的正确语义）
    update_data = payload.model_dump(exclude_unset=True)
    boards_db[board_id].update(update_data)
    return boards_db[board_id]

# ===== 4. 测试 =====
client = TestClient(app)

print("=== 1. 正常创建 ===")
r = client.post("/boards", json={
    "title": "工作看板",
    "description": "日常工作",
    "color": "green",
})
print(f"  状态码：{r.status_code}")
print(f"  响应：{r.json()}")

print("\\n=== 2. 用默认值创建 ===")
r = client.post("/boards", json={"title": "学习"})
print(f"  description：{r.json()['description']}")  # None
print(f"  color：{r.json()['color']}")              # blue（默认）

print("\\n=== 3. 校验失败：title 为空 ===")
r = client.post("/boards", json={"title": ""})
print(f"  状态码：{r.status_code}")
print(f"  错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 4. 校验失败：color 不在枚举里 ===")
r = client.post("/boards", json={"title": "测试", "color": "pink"})
print(f"  状态码：{r.status_code}")
print(f"  错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 5. 校验失败：缺 title ===")
r = client.post("/boards", json={"color": "red"})
print(f"  状态码：{r.status_code}")
print(f"  错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 6. 部分更新（PATCH）===")
r = client.patch("/boards/1", json={"title": "工作看板-改名"})
print(f"  新标题：{r.json()['title']}")
print(f"  color 没变：{r.json()['color']}")  # 还是 green

print("\\n=== 7. response_model 过滤字段 ===")
# 虽然 boards_db 里存了完整数据，但 response_model=BoardResponse 会过滤
# 比如我们内部存了 password 字段，response_model 不写就不会返回
r = client.get("/boards/1")
print(f"  返回字段：{list(r.json().keys())}")
\`\`\`

运行这个 demo，重点理解这几个概念：

### 6.1 \`response_model\` 的作用

\`\`\`python
@app.post("/boards", response_model=BoardResponse)
def create_board(board: BoardCreate):
    ...
\`\`\`

- 限制返回给客户端的字段（即使你返回了更多字段，也会被过滤掉）
- 自动生成响应文档
- 把返回的 dict / ORM 对象自动转成 \`BoardResponse\` 格式

**这是数据安全的重要保障**：内部数据模型可以包含敏感字段（如 password_hash），但 \`response_model\` 只暴露允许返回的字段。

### 6.2 \`model_dump(exclude_unset=True)\` 的妙用

PATCH 更新时，客户端可能只传了 \`{"title": "新标题"}\`，没传 \`color\`。

- \`model_dump()\`：返回所有字段（包括默认值），会把 color 覆盖成默认值 "blue" ❌
- \`model_dump(exclude_unset=True)\`：只返回客户端实际传入的字段 ✅

这是 PATCH 的标准实现方式。

## 七、Pydantic v1 vs v2 速查

本教程使用 **Pydantic v2**（FastAPI 0.100+ 默认）。常见 API 差异：

| 操作 | v1 | v2 |
|------|----|----|
| 转 dict | \`model.dict()\` | \`model.model_dump()\` |
| 转 JSON | \`model.json()\` | \`model.model_dump_json()\` |
| 从 dict 创建 | \`Model.parse_obj(d)\` | \`Model.model_validate(d)\` |
| 字段校验 | \`@validator\` | \`@field_validator\` |
| 模型配置 | \`class Config:\` | \`model_config = ConfigDict(...)\` |

## 八、本章小结

- Pydantic 模型定义请求体结构，类型注解驱动校验
- \`Field()\` 加校验规则：长度、范围、正则
- 模型可嵌套，表达复杂数据结构
- \`response_model\` 控制返回字段，保护敏感数据
- \`model_dump(exclude_unset=True)\` 实现 PATCH 语义
- 下章我们学习用 SQLAlchemy 把数据真正存到数据库`,
  },
];
