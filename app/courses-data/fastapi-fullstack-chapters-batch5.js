// =============================================================
// FastAPI 全栈实战 - 第 5 批章节（高级特性 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   ff-background-tasks: 后台任务 BackgroundTasks
//   ff-file-upload:      文件上传 UploadFile
//   ff-websocket:        WebSocket 实时同步
//   ff-middleware:       中间件机制
//   ff-exception:        异常处理与统一错误响应
//   ff-pagination:       分页与过滤
// =============================================================

export const chapters = [
  // ============================================================
  // 第 22 章：后台任务 BackgroundTasks
  // ============================================================
  {
    id: "ff-background-tasks",
    group: "高级特性",
    icon: "📨",
    title: "后台任务 BackgroundTasks",
    content: `# 后台任务 BackgroundTasks

## 一、为什么需要后台任务

### 1.1 同步处理的痛点

考虑用户注册场景：用户填完表单点提交，服务器要：

1. 写入数据库（50ms）
2. 发欢迎邮件（2-5 秒，SMTP 慢）
3. 写入日志文件（10ms）
4. 推送统计事件（500ms）

如果全同步处理，用户要等 3-6 秒才能看到"注册成功"。**而真正影响用户体验的只有第 1 步**——后面的步骤用户根本不关心什么时候完成。

| 方式 | 用户等待 | 邮件延迟 | 复杂度 |
|------|---------|---------|--------|
| 同步执行 | 3-6 秒 | 立刻 | 简单 |
| 后台任务 | 50ms | 1-2 秒 | 简单 |
| Celery 队列 | 50ms | 1-2 秒 | 复杂 |

**BackgroundTasks 就是同步与队列之间的"甜点"**：用最简单的代码实现"用户不等待，任务后台跑"。

### 1.2 生活类比：餐厅点餐

- **同步**：点餐 → 厨师做菜 → 服务员等你吃完 → 才让你结账（傻等）
- **后台任务**：点餐 → 厨师做菜（后台）→ 你立刻去逛街 → 做好了电话通知你
- **消息队列**：点餐 → 扔给外卖平台（解耦）→ 平台派骑手 → 你不用管

BackgroundTasks 是第二种——服务器响应完请求后，"顺手"在同一个进程里把任务跑掉。

### 1.3 BackgroundTasks vs Celery

| 维度 | BackgroundTasks | Celery |
|------|----------------|--------|
| 部署 | 无需额外组件 | 需要 Redis/RabbitMQ |
| 学习成本 | 5 分钟 | 半天起步 |
| 持久化 | 无（重启丢失） | 有（broker 持久化） |
| 重试 | 需自己写 | 内置 |
| 分布式 | 单进程 | 多 worker 分布式 |
| 适合场景 | 发邮件、写日志、轻清理 | 大数据、定时任务、重计算 |

**口诀：简单任务用 BackgroundTasks，复杂任务用 Celery。** 教学项目里我们用前者就够。

## 二、BackgroundTasks 的工作原理

### 2.1 ASGI 生命周期

FastAPI 基于 Starlette，每个请求的生命周期：

\`\`\`
请求进来 ──> 中间件链 ──> 路由匹配 ──> 依赖注入 ──> 路由函数
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  返回 Response    │
                                              └──────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  执行 background  │ ← 后台任务在这里跑
                                              │  tasks            │   客户端已经收到响应了
                                              └──────────────────┘
\`\`\`

**关键点：响应已经返回给客户端了，后台任务才开始跑。** 这意味着：

- 后台任务里的异常**不会**影响用户已经收到的响应
- 后台任务里不能往 Response 里写东西（已经发出去了）
- 后台任务抛异常会被 Starlette 捕获并打印日志，但不会重试

### 2.2 源码追踪

\`BackgroundTasks\` 来自 \`starlette.background\`，本质是一个任务列表：

\`\`\`python
# starlette 源码简化版
class BackgroundTasks(BackgroundTask):
    def __init__(self, tasks=None):
        self.tasks = list(tasks) if tasks else []

    def add_task(self, func, *args, **kwargs):
        # 把 (函数, 参数, 关键字参数) 三元组塞进列表
        self.tasks.append((func, args, kwargs))

    async def __call__(self):
        # 响应发送完后，Starlette 调用这个方法
        for func, args, kwargs in self.tasks:
            if asyncio.iscoroutinefunction(func):
                await func(*args, **kwargs)  # 异步函数 await
            else:
                # 同步函数扔到线程池跑，避免阻塞事件循环
                await run_in_threadpool(func, *args, **kwargs)
\`\`\`

注意第三点：**同步函数会被扔到线程池**。这意味着即使你的后台任务是同步的 \`def\`，也不会阻塞 FastAPI 的事件循环。这是 BackgroundTasks 的一个隐藏优势。

## 三、Demo 1：第一个后台任务

最简单的例子：响应立刻返回，后台打印日志。

\`\`\`python
# 文件：demo_bg_basic.py
# 演示 BackgroundTasks 的基础用法
from fastapi import FastAPI, BackgroundTasks
from fastapi.testclient import TestClient
import time

app = FastAPI()

# 模拟一个耗时的后台任务：写日志
def write_log(message: str):
    """模拟写日志到文件，耗时 1 秒。"""
    # 故意 sleep 模拟磁盘 IO 慢
    time.sleep(1)
    # 真实场景：open("app.log", "a").write(message + "\\n")
    print(f"[LOG] {message}")

# 路由参数里声明 background_tasks: BackgroundTasks
# FastAPI 会自动注入一个 BackgroundTasks 实例
@app.post("/register/{username}")
def register(username: str, background_tasks: BackgroundTasks):
    """用户注册接口：立刻返回，后台异步写日志。"""
    # 1. 主流程：写入数据库（这里用 print 代替）
    print(f"[DB] 用户 {username} 已写入数据库")

    # 2. 添加后台任务：等响应返回后再跑
    # 第一个参数是函数，后面的参数会原样传给该函数
    background_tasks.add_task(write_log, f"用户 {username} 注册成功")

    # 3. 立刻返回响应，不等 write_log 跑完
    return {"message": f"注册成功，欢迎 {username}！"}

# ============ 测试 ============
client = TestClient(app)

# 测试：响应应该立刻返回，不等后台任务
start = time.time()
response = client.post("/register/alice")
elapsed = time.time() - start

print(f"响应耗时: {elapsed:.2f}s")  # 应该远小于 1 秒
print(f"响应内容: {response.json()}")
# 注意：TestClient 会等后台任务跑完才返回，所以 elapsed 可能接近 1 秒
# 但在生产环境（真实 HTTP）客户端会立刻收到响应
\`\`\`

**重要说明**：\`TestClient\` 内部会等待后台任务完成才返回响应，这是为了方便测试。**生产环境下真实 HTTP 客户端会立刻收到响应，后台任务在服务器进程里继续跑。**

## 四、Demo 2：多个后台任务

可以添加多个任务，按添加顺序执行。

\`\`\`python
# 文件：demo_bg_multi.py
# 演示多个后台任务的执行顺序
from fastapi import FastAPI, BackgroundTasks
from fastapi.testclient import TestClient
import time

app = FastAPI()

def task_a():
    print("任务 A 开始")
    time.sleep(0.5)
    print("任务 A 完成")

def task_b():
    print("任务 B 开始")
    time.sleep(0.3)
    print("任务 B 完成")

def task_c(name: str, value: int):
    print(f"任务 C 收到参数: name={name}, value={value}")

@app.post("/do-stuff")
def do_stuff(background_tasks: BackgroundTasks):
    """添加 3 个后台任务，按顺序执行。"""
    # 任务按添加顺序串行执行（不是并行！）
    background_tasks.add_task(task_a)
    background_tasks.add_task(task_b)
    background_tasks.add_task(task_c, "hello", 42)
    return {"status": "ok"}

client = TestClient(app)
response = client.post("/do-stuff")
print(f"响应: {response.json()}")
# 输出顺序：
#   任务 A 开始 → 任务 A 完成 → 任务 B 开始 → 任务 B 完成 → 任务 C 收到参数...
\`\`\`

**注意：后台任务是串行的，不是并行的。** 如果要并行，得自己写 \`asyncio.gather\` 或者上 Celery。

## 五、Demo 3：实战——用户注册后发邮件

这是 BackgroundTasks 最经典的实战场景。

\`\`\`python
# 文件：demo_bg_email.py
# 实战：用户注册后异步发送欢迎邮件
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import time

# ============ 数据库 ============
engine = create_engine("sqlite:///:memory:", echo=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String)
    welcome_sent = Column(String, default="no")  # 标记欢迎邮件是否已发

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ 邮件发送（模拟）============
# 真实场景会用 smtplib 或 SendGrid SDK
def send_welcome_email(to_email: str, username: str, db_factory):
    """
    模拟发邮件：耗时 2 秒（SMTP 慢）。
    发送完成后更新数据库的 welcome_sent 标记。

    注意：后台任务拿不到 Depends 注入的 db，需要自己开 session。
    所以这里传 db_factory（即 SessionLocal 类）。
    """
    print(f"  → 正在给 {to_email} 发邮件...")
    time.sleep(2)  # 模拟 SMTP 慢
    print(f"  ✓ 邮件已发送给 {username} <{to_email}>")

    # 更新数据库标记
    db = db_factory()
    try:
        user = db.query(User).filter(User.email == to_email).first()
        if user:
            user.welcome_sent = "yes"
            db.commit()
    finally:
        db.close()

# ============ Schema ============
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr

# ============ 路由 ============
app = FastAPI()

@app.post("/register")
def register(
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """用户注册：立刻返回，后台发邮件。"""
    # 1. 检查用户名是否已存在
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 2. 写入数据库（主流程，必须立刻完成）
    user = User(username=req.username, email=req.email, welcome_sent="no")
    db.add(user)
    db.commit()
    db.refresh(user)

    # 3. 后台任务：发欢迎邮件
    # 注意：传 SessionLocal（工厂）而不是 db 实例
    # 因为 db 实例在请求结束后会被关闭，后台任务跑时已不可用
    background_tasks.add_task(
        send_welcome_email,
        to_email=req.email,
        username=req.username,
        db_factory=SessionLocal,
    )

    # 4. 立刻返回，用户不用等 2 秒邮件发送
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "message": "注册成功，欢迎邮件稍后发送",
    }

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """查询用户，可以看 welcome_sent 状态。"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "welcome_sent": user.welcome_sent,
    }

# ============ 测试 ============
client = TestClient(app)

# 注册（TestClient 会等后台任务跑完才返回）
print("=== 注册用户 ===")
start = time.time()
resp = client.post("/register", json={"username": "alice", "email": "alice@example.com"})
print(f"耗时: {time.time() - start:.2f}s")  # 接近 2 秒（因为 TestClient 等后台任务）
print(f"响应: {resp.json()}")

# 查询：welcome_sent 应该已经是 "yes"
print("\\n=== 查询用户 ===")
resp = client.get("/users/1")
print(f"用户信息: {resp.json()}")
# welcome_sent: "yes"，说明后台任务已执行
\`\`\`

### 5.1 关键陷阱：依赖注入的 db 不能直接传给后台任务

\`\`\`python
# ❌ 错误写法：把 db 传给后台任务
@app.post("/register")
def register(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(send_email, db=db)  # db 在请求结束后被 close 了！
    return {"ok": True}

# 后台任务跑时 db 已经关闭，操作会抛 StatementError
\`\`\`

\`\`\`python
# ✅ 正确写法：传 db 工厂（SessionLocal），后台任务自己开 session
@app.post("/register")
def register(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(send_email, db_factory=SessionLocal)
    return {"ok": True}

def send_email(db_factory):
    db = db_factory()  # 后台任务自己开新 session
    try:
        # ... 操作数据库 ...
        db.commit()
    finally:
        db.close()
\`\`\`

**原因**：FastAPI 的 \`get_db\` 是 yield 依赖，请求结束后会执行 \`db.close()\`。但后台任务在响应返回**之后**才跑，那时 db 已经关了。所以后台任务必须自己开 session。

## 六、Demo 4：依赖里也能添加后台任务

\`BackgroundTasks\` 不只能从路由函数参数拿，还能从依赖里拿——这是 FastAPI 的一个高级用法。

\`\`\`python
# 文件：demo_bg_dep.py
# 演示在依赖里添加后台任务
from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.testclient import TestClient

app = FastAPI()

def write_log(message: str):
    print(f"[LOG] {message}")

# 依赖里也能注入 BackgroundTasks
def logging_dependency(background_tasks: BackgroundTasks):
    """每个请求都自动写一条访问日志。"""
    # 这里 add_task 会在路由函数执行前添加
    # 但实际执行在响应返回后
    background_tasks.add_task(write_log, "有新请求")
    # 依赖也可以返回其他东西
    return {"log_added": True}

@app.get("/items", dependencies=[Depends(logging_dependency)])
def list_items():
    """路由函数本身不需要 BackgroundTasks，但依赖会自动加日志。"""
    return [{"id": 1, "name": "apple"}, {"id": 2, "name": "banana"}]

client = TestClient(app)
resp = client.get("/items")
print(resp.json())
# 后台会打印：[LOG] 有新请求
\`\`\`

**用法场景**：写一个全局的访问日志中间件式依赖，所有路由都自动加日志，但路由函数本身不用关心。

## 七、Demo 5：异步后台任务

后台任务可以是 \`async def\`，FastAPI 会自动 await。

\`\`\`python
# 文件：demo_bg_async.py
# 演示异步后台任务
from fastapi import FastAPI, BackgroundTasks
from fastapi.testclient import TestClient
import asyncio

app = FastAPI()

async def async_task(seconds: float):
    """异步任务：用 asyncio.sleep 不阻塞事件循环。"""
    print(f"异步任务开始，等待 {seconds}s")
    await asyncio.sleep(seconds)
    print(f"异步任务完成")

@app.post("/trigger")
def trigger(background_tasks: BackgroundTasks):
    # 添加异步任务，FastAPI 会自动 await
    background_tasks.add_task(async_task, 1.0)
    return {"status": "triggered"}

client = TestClient(app)
resp = client.post("/trigger")
print(resp.json())
\`\`\`

### 7.1 同步任务 vs 异步任务怎么选

| 任务类型 | 写法 | 执行方式 | 适用场景 |
|---------|------|---------|---------|
| CPU 密集 | \`def\` | 扔线程池 | 计算、压缩 |
| IO 密集（async 库） | \`async def\` | 事件循环 | httpx、asyncpg |
| IO 密集（同步库） | \`def\` | 扔线程池 | smtplib、requests |

**口诀**：库支持 async 就用 async def，不支持就用 def，FastAPI 都能正确处理。

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| BackgroundTasks | 响应返回后，在同进程内异步执行的任务 |
| 执行时机 | 响应发送完毕之后 |
| 执行方式 | 串行（按添加顺序），同步任务扔线程池 |
| 添加任务 | \`background_tasks.add_task(func, *args, **kwargs)\` |
| 数据库陷阱 | 不能传请求的 db，要传 SessionLocal 工厂 |
| vs Celery | 简单轻量，但无持久化、无重试、无分布式 |
| 依赖里也能用 | 路由函数不需要参数也能加后台任务 |
| 异步任务 | \`async def\` 任务会被自动 await |

下一章我们看文件上传——这又是一个特殊的请求处理场景。`
  },

  // ============================================================
  // 第 23 章：文件上传 UploadFile
  // ============================================================
  {
    id: "ff-file-upload",
    group: "高级特性",
    icon: "📎",
    title: "文件上传 UploadFile",
    content: `# 文件上传 UploadFile

## 一、文件上传的特殊性

### 1.1 为什么不能用 JSON 传文件

JSON 是文本格式，文件是二进制数据。理论上可以把文件 base64 编码后塞进 JSON：

\`\`\`json
{
  "filename": "avatar.png",
  "content": "iVBORw0KGgoAAAANSUhEUgAA..."  // base64 编码
}
\`\`\`

但这样有几个问题：

| 问题 | 说明 |
|------|------|
| 体积膨胀 33% | base64 编码后体积变大 |
| 全部加载到内存 | 大文件直接撑爆内存 |
| 不能流式处理 | 必须等整个 JSON 接完才能解析 |
| 浏览器不友好 | \`<input type="file">\` 默认走 multipart，不是 JSON |

所以 HTTP 协议专门为文件上传设计了 \`multipart/form-data\` 格式，FastAPI 用 \`UploadFile\` 支持。

### 1.2 multipart/form-data 格式

普通表单是 \`application/x-www-form-urlencoded\`，长这样：

\`\`\`
username=alice&age=18
\`\`\`

文件上传用 \`multipart/form-data\`，长这样：

\`\`\`
------boundary123
Content-Disposition: form-data; name="title"

我的头像
------boundary123
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<二进制数据>
------boundary123--
\`\`\`

每个字段用 \`--boundary\` 分隔，文件字段还带 \`filename\` 和 \`Content-Type\`。**这种格式支持流式解析，大文件不会撑爆内存。**

## 二、UploadFile vs bytes

FastAPI 提供两种文件接收方式：

### 2.1 bytes：一次性读

\`\`\`python
@app.post("/upload")
def upload(file: bytes = File(...)):
    # bytes 把整个文件读进内存
    # 适合小文件（<1MB）
    print(f"收到 {len(file)} 字节")
    return {"size": len(file)}
\`\`\`

### 2.2 UploadFile：流式读

\`\`\`python
@app.post("/upload")
def upload(file: UploadFile):
    # UploadFile 是文件对象，可以流式读
    # 适合大文件
    contents = file.read()  # 也可以 read(size) 分块读
    print(f"收到 {len(contents)} 字节，文件名 {file.filename}")
    return {"size": len(contents), "filename": file.filename}
\`\`\`

### 2.3 对比

| 维度 | bytes | UploadFile |
|------|-------|-----------|
| 内存 | 全部读入 | 默认 SpooledTemporaryFile（超过 1MB 才落盘） |
| 流式 | 不支持 | 支持 \`await file.read(size)\` |
| 文件名 | 拿不到 | \`file.filename\` |
| MIME 类型 | 拿不到 | \`file.content_type\` |
| 异步 | 同步 | 既支持同步也支持 async |
| 适合 | 小文件（<1MB） | 大文件、需要元信息 |

**口诀：永远用 UploadFile，除非你确定文件一定很小。**

### 2.4 UploadFile 的属性和方法

\`\`\`python
file.filename       # 文件名（来自客户端，不可信！）
file.content_type   # MIME 类型，如 image/png
file.size           # 文件大小（字节）
file.file           # 底层文件对象（SpooledTemporaryFile）

# 方法
contents = await file.read(size=-1)  # 读全部或指定字节数
await file.seek(0)                   # 移动指针到开头
chunks = []
while chunk := await file.read(1024):
    chunks.append(chunk)
await file.close()                   # 关闭文件
\`\`\`

注意：\`read()\` 后指针在末尾，再读就是空的。要重读必须先 \`seek(0)\`。

## 三、Demo 1：最简单的文件上传

\`\`\`python
# 文件：demo_upload_basic.py
# 最简单的文件上传
from fastapi import FastAPI, UploadFile, File
from fastapi.testclient import TestClient

app = FastAPI()

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    """
    接收单个文件上传。
    File(...) 表示这个参数从 multipart/form-data 的 file 字段取。
    """
    # 读文件内容
    contents = file.file.read()

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        # 实际项目里这里会把 contents 写到磁盘或对象存储
    }

client = TestClient(app)

# 测试上传
# files 参数格式: {"字段名": ("文件名", 文件内容, "MIME类型")}
response = client.post(
    "/upload",
    files={"file": ("test.txt", b"hello world", "text/plain")},
)
print(response.json())
# {'filename': 'test.txt', 'content_type': 'text/plain', 'size': 11}
\`\`\`

## 四、Demo 2：保存文件到磁盘

实际项目里要把上传的文件保存到磁盘或对象存储。

\`\`\`python
# 文件：demo_upload_save.py
# 上传文件并保存到磁盘
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.testclient import TestClient
import os
import uuid
import shutil

app = FastAPI()

# 上传文件保存目录
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# 最大文件大小：5MB
MAX_FILE_SIZE = 5 * 1024 * 1024

@app.post("/upload-avatar")
def upload_avatar(file: UploadFile = File(...)):
    """上传头像，保存到 ./uploads 目录。"""
    # 1. 校验文件扩展名
    # os.path.splitext 返回 (basename, ext)，ext 包含点号
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {ext}，仅支持 {ALLOWED_EXTENSIONS}",
        )

    # 2. 校验文件大小
    # 注意：file.size 在某些情况下可能为 None，需要读完才知道
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"文件太大: {len(contents)} 字节，最大 {MAX_FILE_SIZE} 字节",
        )

    # 3. 生成唯一文件名（防止重名覆盖）
    # 用 uuid4 生成随机字符串，保留原扩展名
    # 不要用原文件名——用户可能上传同名文件覆盖别人的
    new_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    # 4. 写入磁盘
    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "filename": new_filename,
        "original_name": file.filename,
        "size": len(contents),
        "path": file_path,
    }

# ============ 测试 ============
client = TestClient(app)

# 测试正常上传
print("=== 上传图片 ===")
# 模拟一个 PNG 文件头（前 8 字节）
fake_png = b"\\x89PNG\\r\\n\\x1a\\n" + b"\\x00" * 100
resp = client.post(
    "/upload-avatar",
    files={"file": ("avatar.png", fake_png, "image/png")},
)
print(resp.json())

# 测试上传非法扩展名
print("\\n=== 上传 .exe ===")
resp = client.post(
    "/upload-avatar",
    files={"file": ("virus.exe", b"MZ", "application/octet-stream")},
)
print(f"状态码: {resp.status_code}")  # 400
print(f"错误: {resp.json()['detail']}")

# 测试上传超大文件
print("\\n=== 上传超大文件 ===")
big_data = b"x" * (6 * 1024 * 1024)  # 6MB
resp = client.post(
    "/upload-avatar",
    files={"file": ("big.png", big_data, "image/png")},
)
print(f"状态码: {resp.status_code}")  # 413

# 清理测试文件
import glob
for f in glob.glob("./uploads/*.png"):
    os.remove(f)
os.rmdir(UPLOAD_DIR)
\`\`\`

### 4.1 安全要点

| 风险 | 防御 |
|------|------|
| 文件名注入（\`../../etc/passwd\`） | 用 uuid 生成新文件名，不用原文件名 |
| 类型欺骗（.png 实际是 .exe） | 校验扩展名 + 校验文件头魔数 |
| 大文件撑爆磁盘 | 限制大小 + 流式写盘 |
| 路径穿越 | 永远用 \`os.path.join\` + \`os.path.abspath\` 检查最终路径在 UPLOAD_DIR 内 |

## 五、Demo 3：多文件上传

\`\`\`python
# 文件：demo_upload_multi.py
# 多文件上传
from fastapi import FastAPI, UploadFile, File, List
from fastapi.testclient import TestClient
from typing import List

app = FastAPI()

@app.post("/upload-multiple")
def upload_multiple(files: List[UploadFile] = File(...)):
    """
    接收多个文件。
    List[UploadFile] 表示这个字段是多个文件。
    """
    results = []
    for file in files:
        contents = file.file.read()
        results.append({
            "filename": file.filename,
            "size": len(contents),
            "content_type": file.content_type,
        })
    return {
        "count": len(files),
        "files": results,
    }

client = TestClient(app)

# 测试：同时上传 3 个文件
# files 字段是列表，每个元素是一个 (filename, content, mime) 元组
resp = client.post(
    "/upload-multiple",
    files=[
        ("files", ("a.txt", b"aaa", "text/plain")),
        ("files", ("b.txt", b"bbb", "text/plain")),
        ("files", ("c.jpg", b"\\xff\\xd8\\xff", "image/jpeg")),
    ],
)
print(resp.json())
\`\`\`

## 六、Demo 4：流式上传大文件

对于大文件（>100MB），不能一次性 \`read()\`，要分块读写。

\`\`\`python
# 文件：demo_upload_stream.py
# 流式上传大文件
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.testclient import TestClient
import os

app = FastAPI()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CHUNK_SIZE = 1024 * 1024  # 1MB 一块

@app.post("/upload-large")
async def upload_large(file: UploadFile = File(...)):
    """
    流式上传大文件，分块写盘，避免内存爆炸。
    用 async def + await file.read(size) 异步读。
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    total_size = 0

    # 异步分块读写
    with open(file_path, "wb") as f:
        while True:
            # 每次读 1MB
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            f.write(chunk)
            total_size += len(chunk)

    return {
        "filename": file.filename,
        "size": total_size,
        "path": file_path,
    }

# 测试用例略，大文件不方便在 TestClient 里测
# 实际项目可以用 curl 上传：
#   curl -X POST http://localhost:8000/upload-large \\
#     -F "file=@big_video.mp4"
\`\`\`

### 6.1 流式 vs 一次性

| 方式 | 内存占用 | 速度 | 适合 |
|------|---------|------|------|
| \`contents = file.read()\` | 文件大小 | 快 | 小文件 <10MB |
| \`while chunk = file.read(size)\` | CHUNK_SIZE | 略慢 | 大文件 |

## 七、Demo 5：文件 + 表单字段混合

实际场景：上传头像时还要传用户 ID。

\`\`\`python
# 文件：demo_upload_form.py
# 文件 + 表单字段混合提交
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.testclient import TestClient

app = FastAPI()

@app.post("/profile/avatar")
def update_avatar(
    user_id: int = Form(...),          # 表单字段
    description: str = Form(None),     # 可选表单字段
    file: UploadFile = File(...),      # 文件
):
    """
    同时接收表单字段和文件。
    注意：Form 和 File 必须都从 multipart/form-data 取。
    """
    contents = file.file.read()
    return {
        "user_id": user_id,
        "description": description,
        "filename": file.filename,
        "size": len(contents),
    }

client = TestClient(app)

# 同时传表单字段和文件
resp = client.post(
    "/profile/avatar",
    data={"user_id": 42, "description": "我的新头像"},  # 表单字段
    files={"file": ("avatar.png", b"fake_png_data", "image/png")},  # 文件
)
print(resp.json())
\`\`\`

### 7.1 关键点：Form / File / Body 不能混用

\`\`\`python
# ❌ 错误：Body 是 JSON，File 是 multipart，不能同时用
@app.post("/upload")
def upload(data: MyModel = Body(...), file: UploadFile = File(...)):
    ...

# ✅ 正确：表单字段用 Form，文件用 File，都走 multipart
@app.post("/upload")
def upload(name: str = Form(...), file: UploadFile = File(...)):
    ...
\`\`\`

**原因**：一个请求只能有一种 body 编码（JSON 或 multipart），不能同时两种。

## 八、Demo 6：上传头像实战（结合 User 模型）

\`\`\`python
# 文件：demo_upload_avatar.py
# 实战：用户上传头像，更新数据库
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import os
import uuid

# ============ 数据库 ============
engine = create_engine("sqlite:///:memory:")
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    avatar_path = Column(String, nullable=True)  # 头像路径

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ 应用 ============
app = FastAPI()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

@app.post("/users/{user_id}/avatar")
def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """给指定用户上传头像。"""
    # 1. 查用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 2. 校验扩展名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="不支持的文件类型")

    # 3. 删除旧头像（如果有）
    if user.avatar_path and os.path.exists(user.avatar_path):
        os.remove(user.avatar_path)

    # 4. 保存新头像
    new_filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # 5. 更新数据库
    user.avatar_path = file_path
    db.commit()

    return {
        "user_id": user.id,
        "avatar_path": file_path,
        "message": "头像更新成功",
    }

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"id": user.id, "username": user.username, "avatar_path": user.avatar_path}

# ============ 测试 ============
client = TestClient(app)

# 先创建一个用户
db = SessionLocal()
user = User(username="alice")
db.add(user)
db.commit()
db.refresh(user)
db.close()

# 上传头像
resp = client.post(
    f"/users/{user.id}/avatar",
    files={"file": ("avatar.png", b"fake_png", "image/png")},
)
print("上传头像:", resp.json())

# 查询用户，看头像是否更新
resp = client.get(f"/users/{user.id}")
print("用户信息:", resp.json())

# 清理
import shutil
shutil.rmtree(UPLOAD_DIR, ignore_errors=True)
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| 文件上传格式 | multipart/form-data |
| bytes vs UploadFile | 小文件用 bytes，大文件用 UploadFile |
| UploadFile | 流式文件对象，支持 filename/content_type/size |
| 安全要点 | 用 uuid 改名 + 校验扩展名 + 校验大小 |
| 多文件 | \`List[UploadFile]\` |
| 大文件流式 | \`while chunk = await file.read(size)\` |
| Form + File | 可以混合，但 Body 不行 |
| 数据库更新 | 先保存文件，再更新数据库 |

下一章我们看 WebSocket——让看板支持实时多人协作。`
  },

  // ============================================================
  // 第 24 章：WebSocket 实时同步
  // ============================================================
  {
    id: "ff-websocket",
    group: "高级特性",
    icon: "🔌",
    title: "WebSocket 实时同步",
    content: `# WebSocket 实时同步

## 一、HTTP vs WebSocket

### 1.1 HTTP 的局限

HTTP 是请求-响应模型：客户端发请求，服务器返响应，**连接就断了**。服务器无法主动推消息给客户端。

考虑看板场景：A 用户拖动卡片，B 用户怎么看到？HTTP 方案：

| 方案 | 实现 | 缺点 |
|------|------|------|
| 轮询 | 客户端每 2 秒请求一次 | 延迟大、浪费流量 |
| 长轮询 | 服务器 hold 住请求 30 秒 | 复杂、连接数多 |
| SSE | Server-Sent Events | 只能服务器→客户端单向 |
| WebSocket | 全双工长连接 | 完美，但需要单独协议 |

### 1.2 WebSocket 的特点

\`\`\`
HTTP:
  客户端 ──请求──> 服务器
  客户端 <──响应── 服务器
  （连接关闭）

WebSocket:
  客户端 <══════════> 服务器
  （长连接，双向随时发消息）
\`\`\`

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 连接 | 短连接（默认） | 长连接 |
| 方向 | 单向（客户端发起） | 双向 |
| 协议 | HTTP | WS（基于 HTTP 升级） |
| 适合 | 普通接口 | 聊天、实时同步、推送 |
| 端口 | 80/443 | 同 HTTP（80/443） |

### 1.3 握手过程

WebSocket 连接建立前，先走一次 HTTP 请求：

\`\`\`
客户端发：
  GET /ws HTTP/1.1
  Upgrade: websocket          ← 请求升级协议
  Connection: Upgrade
  Sec-WebSocket-Key: ...

服务器返：
  HTTP/1.1 101 Switching Protocols   ← 101 状态码
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: ...
\`\`\`

握手成功后，TCP 连接不关闭，双方随时可以发消息。FastAPI 用 \`@app.websocket()\` 处理。

## 二、FastAPI 的 WebSocket 支持

### 2.1 最简 WebSocket

\`\`\`python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()           # 接受连接
    while True:
        data = await ws.receive_text()  # 等待客户端消息
        await ws.send_text(f"echo: {data}")  # 回消息
\`\`\`

注意：

- WebSocket 路由**必须**用 \`async def\`（同步会阻塞事件循环）
- 必须先 \`accept()\` 才能收发
- \`receive_text()\` 会阻塞，直到收到消息
- 客户端断开会抛 \`WebSocketDisconnect\` 异常

### 2.2 WebSocketDisconnect

客户端断开时，\`receive_*\` 会抛异常。必须捕获，否则整个服务崩。

\`\`\`python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        print("客户端断开了")
        # 这里不用 ws.close()，因为已经断了
\`\`\`

## 三、连接管理器（核心组件）

多人协作场景需要广播：一个用户操作，所有用户都收到。这需要一个"连接管理器"维护所有活跃连接。

### 3.1 ConnectionManager 设计

\`\`\`python
# 文件：demo_ws_manager.py
# 连接管理器：维护所有活跃 WebSocket 连接，支持广播
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.testclient import TestClient
from typing import List

class ConnectionManager:
    """
    WebSocket 连接管理器。

    职责：
      1. 维护所有活跃连接（self.active_connections）
      2. 新连接进来时加入列表
      3. 断开时移除
      4. 支持广播（给所有连接发消息）

    设计要点：
      - 用 list 存连接，简单直观
      - 真实项目可能按"房间"分组（如 board_id -> [connections]）
      - 广播时遍历 list 逐个 send，失败的要移除
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        """接受新连接并加入列表。"""
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        """断开连接，从列表移除。"""
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, message: str):
        """
        广播消息给所有连接。
        遍历列表逐个 send_text，失败的就移除（说明客户端断了）。
        """
        # 复制一份遍历，避免遍历时修改原列表
        # （如果某个连接 send 失败要 disconnect，会修改 active_connections）
        for ws in self.active_connections[:]:
            try:
                await ws.send_text(message)
            except Exception:
                # send 失败说明连接已断，移除
                self.disconnect(ws)

# 全局单例
manager = ConnectionManager()

app = FastAPI()

@app.websocket("/ws/chat")
async def chat_endpoint(ws: WebSocket):
    """聊天室 WebSocket：收到消息后广播给所有人。"""
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            # 广播给所有连接（包括发送者自己）
            await manager.broadcast(f"用户说: {data}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast("有人离开了聊天室")

# ============ 测试 ============
client = TestClient(app)

# 测试：两个客户端同时连接
with client.websocket_connect("/ws/chat") as ws1:
    with client.websocket_connect("/ws/chat") as ws2:
        # ws1 发消息
        ws1.send_text("你好")
        # 两个客户端都应该收到广播
        msg1 = ws1.receive_text()
        msg2 = ws2.receive_text()
        print(f"ws1 收到: {msg1}")  # 用户说: 你好
        print(f"ws2 收到: {msg2}")  # 用户说: 你好
\`\`\`

## 四、Demo 1：看板实时同步

实战场景：A 用户拖动卡片，B 用户的看板立刻更新。

\`\`\`python
# 文件：demo_ws_kanban.py
# 看板实时同步：WebSocket 广播卡片移动事件
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.testclient import TestClient
from typing import Dict, List, Set
import json

# ============ 按看板分组的连接管理器 ============
class BoardConnectionManager:
    """
    按看板 ID 分组的连接管理器。

    结构：
      self.connections = {
          "board_1": {ws_user_a, ws_user_b},
          "board_2": {ws_user_c},
      }

    设计思路：
      - 用户进入看板时 connect(board_id, ws)
      - 卡片变化时 broadcast_to_board(board_id, message)
      - 用户离开看板时 disconnect(board_id, ws)
    """

    def __init__(self):
        # board_id -> set of WebSocket
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, board_id: str, ws: WebSocket):
        """用户连接到某个看板。"""
        await ws.accept()
        if board_id not in self.connections:
            self.connections[board_id] = set()
        self.connections[board_id].add(ws)
        # 通知该看板所有人：有人加入了
        await self.broadcast_to_board(board_id, {
            "type": "user_joined",
            "online_count": len(self.connections[board_id]),
        })

    def disconnect(self, board_id: str, ws: WebSocket):
        """用户断开某个看板。"""
        if board_id in self.connections:
            self.connections[board_id].discard(ws)
            if not self.connections[board_id]:
                del self.connections[board_id]

    async def broadcast_to_board(self, board_id: str, message: dict):
        """给某个看板的所有连接广播消息。"""
        if board_id not in self.connections:
            return
        text = json.dumps(message, ensure_ascii=False)
        # 复制一份遍历，避免遍历时修改
        for ws in list(self.connections[board_id]):
            try:
                await ws.send_text(text)
            except Exception:
                self.connections[board_id].discard(ws)

# 全局单例
board_manager = BoardConnectionManager()

app = FastAPI()

@app.websocket("/ws/board/{board_id}")
async def board_ws(ws: WebSocket, board_id: str):
    """看板 WebSocket 端点。"""
    await board_manager.connect(board_id, ws)
    try:
        while True:
            # 等待客户端发消息（卡片移动事件）
            data = await ws.receive_text()
            # 解析消息，加上 source 标记后广播给同看板所有人
            event = json.loads(data)
            event["source"] = "other"  # 接收方知道是别人操作
            await board_manager.broadcast_to_board(board_id, event)
    except WebSocketDisconnect:
        board_manager.disconnect(board_id, ws)
        await board_manager.broadcast_to_board(board_id, {
            "type": "user_left",
            "online_count": len(board_manager.connections.get(board_id, set())),
        })

# ============ 测试 ============
client = TestClient(app)

# 模拟两个用户同时看 board_1
with client.websocket_connect("/ws/board/board_1") as ws1:
    # ws1 连上后会收到 user_joined
    msg = ws1.receive_json()
    print(f"ws1 收到: {msg}")  # {type: user_joined, online_count: 1}

    with client.websocket_connect("/ws/board/board_1") as ws2:
        # ws2 连上，ws1 和 ws2 都收到 user_joined
        msg1 = ws1.receive_json()
        msg2 = ws2.receive_json()
        print(f"ws1 收到: {msg1}")  # online_count: 2
        print(f"ws2 收到: {msg2}")  # online_count: 2

        # ws1 发送卡片移动事件
        ws1.send_text(json.dumps({
            "type": "card_moved",
            "card_id": 42,
            "from_column": 1,
            "to_column": 2,
            "position": 0,
        }))
        # 两个客户端都应收到广播
        event1 = ws1.receive_json()
        event2 = ws2.receive_json()
        print(f"ws1 收到事件: {event1}")
        print(f"ws2 收到事件: {event2}")
\`\`\`

### 4.1 实战集成思路

实际项目里，WebSocket 广播要和 HTTP 接口配合：

\`\`\`
1. 用户 A 调用 PATCH /cards/42/move  ← HTTP 接口
2. 服务器更新数据库
3. 服务器调用 board_manager.broadcast_to_board(board_id, ...)
4. 所有看该看板的 WebSocket 连接收到事件
5. 前端收到事件，更新 UI
\`\`\`

代码示例：

\`\`\`python
@app.patch("/cards/{card_id}/move")
def move_card(card_id: int, payload: CardMove, ...):
    # 1. 更新数据库
    card = ...
    db.commit()

    # 2. 广播给所有看该看板的用户
    # 注意：HTTP 路由是同步的，但 broadcast 是 async
    # 需要用 asyncio.run_coroutine_threadsafe 或者把路由改成 async
    # 这里简化演示
    import asyncio
    from fastapi.encoders import jsonable_encoder
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(
        board_manager.broadcast_to_board(
            str(card.column.board_id),
            {
                "type": "card_moved",
                "card_id": card.id,
                "from_column": payload.from_column,
                "to_column": payload.to_column,
                "position": payload.position,
            },
        )
    )
    return {"ok": True}
\`\`\`

更优雅的做法是把路由改成 \`async def\`，直接 \`await\` 广播。

## 五、Demo 2：JSON 消息协议

实际项目里 WebSocket 消息一般是 JSON，结构化好处理。

\`\`\`python
# 文件：demo_ws_json.py
# 结构化 JSON 消息
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.testclient import TestClient
from pydantic import BaseModel
from typing import Optional
import json

app = FastAPI()

# 定义消息 Schema
class ChatMessage(BaseModel):
    type: str           # message / join / leave
    username: str
    content: Optional[str] = None
    timestamp: Optional[str] = None

@app.websocket("/ws/chat")
async def chat(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # 接收 JSON 文本
            raw = await ws.receive_text()
            # 解析为 Pydantic 模型（自动校验）
            try:
                msg = ChatMessage.model_validate_json(raw)
            except Exception as e:
                await ws.send_text(json.dumps({
                    "type": "error",
                    "content": f"消息格式错误: {e}",
                }))
                continue

            # 根据 type 分发处理
            if msg.type == "join":
                await ws.send_text(json.dumps({
                    "type": "system",
                    "content": f"欢迎 {msg.username}！",
                }))
            elif msg.type == "message":
                await ws.send_text(json.dumps({
                    "type": "message",
                    "username": msg.username,
                    "content": msg.content,
                }))
    except WebSocketDisconnect:
        pass

# 测试
client = TestClient(app)
with client.websocket_connect("/ws/chat") as ws:
    # 发送 join 消息
    ws.send_text(json.dumps({"type": "join", "username": "alice"}))
    print("收到:", ws.receive_json())

    # 发送 chat 消息
    ws.send_text(json.dumps({
        "type": "message",
        "username": "alice",
        "content": "大家好",
    }))
    print("收到:", ws.receive_json())

    # 发送非法消息
    ws.send_text("not a json")
    print("收到:", ws.receive_json())  # error
\`\`\`

## 六、Demo 3：心跳保活

WebSocket 连接空闲超过一定时间，代理（nginx、云负载均衡）会主动断开。需要定时发心跳。

\`\`\`python
# 文件：demo_ws_ping.py
# 心跳保活
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.testclient import TestClient
import asyncio

app = FastAPI()

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # 用 asyncio.wait_for 设置超时
            # 如果 30 秒没收到消息，认为是死连接，主动断开
            try:
                data = await asyncio.wait_for(ws.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                await ws.send_text("ping timeout, closing")
                await ws.close()
                break

            # 客户端发 "ping"，服务器回 "pong"
            if data == "ping":
                await ws.send_text("pong")
            else:
                await ws.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        pass

# 测试
client = TestClient(app)
with client.websocket_connect("/ws") as ws:
    ws.send_text("ping")
    print(ws.receive_text())  # pong
    ws.send_text("hello")
    print(ws.receive_text())  # echo: hello
\`\`\`

## 七、前端如何连接 WebSocket

Next.js 前端连接 WebSocket 的简单示例：

\`\`\`javascript
// 浏览器原生 WebSocket API
const ws = new WebSocket("ws://localhost:8000/ws/board/1")

ws.onopen = () => {
  console.log("已连接")
  // 可以发消息了
  ws.send(JSON.stringify({ type: "join", username: "alice" }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log("收到:", data)
  if (data.type === "card_moved") {
    // 更新 UI：把卡片移到新列
    moveCardInUI(data.card_id, data.to_column, data.position)
  }
}

ws.onclose = () => {
  console.log("断开，3 秒后重连")
  setTimeout(() => location.reload(), 3000)
}

// 发送卡片移动事件
function sendCardMove(cardId, fromCol, toCol, position) {
  ws.send(JSON.stringify({
    type: "card_moved",
    card_id: cardId,
    from_column: fromCol,
    to_column: toCol,
    position: position,
  }))
}
\`\`\`

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| WebSocket | 全双工长连接，适合实时场景 |
| FastAPI WebSocket | \`@app.websocket("/path")\` |
| 必须异步 | 路由函数必须是 \`async def\` |
| accept | 必须先 \`await ws.accept()\` |
| WebSocketDisconnect | 客户端断开时抛，必须捕获 |
| 连接管理器 | 维护活跃连接，支持广播 |
| 按房间分组 | \`Dict[room_id, Set[WebSocket]]\` |
| JSON 消息 | 用 Pydantic 校验结构 |
| 心跳保活 | \`asyncio.wait_for\` 设置超时 |
| 前端连接 | \`new WebSocket(url)\` |

下一章我们看中间件——横切关注点的处理。`
  },

  // ============================================================
  // 第 25 章：中间件 Middleware
  // ============================================================
  {
    id: "ff-middleware",
    group: "高级特性",
    icon: "🧱",
    title: "中间件 Middleware",
    content: `# 中间件 Middleware

## 一、什么是中间件

### 1.1 生活类比：地铁安检

去坐地铁，进站要过安检：

\`\`\`
你 ──> 安检员1（查包）──> 安检员2（测体温）──> 安检员3（刷码）──> 站台
                                                          │
                                                          ▼
                                                       上车
                                                          │
                                                          ▼
你 <── 安检员3 <── 安检员2 <── 安检员1 <── 出站 <──────────┘
\`\`\`

每个安检员就是一个"中间件"——他们**在请求到达目标前做预处理，在响应返回客户端前做后处理**。

### 1.2 Web 中间件的位置

\`\`\`
HTTP 请求 ──> 中间件A ──> 中间件B ──> 中间件C ──> 路由函数
                                                    │
                                                    ▼
                                                 响应
                                                    │
HTTP 响应 <── 中间件A <── 中间件B <── 中间件C <────────┘
\`\`\`

中间件像一个"洋葱"，请求一层层穿透进去，响应一层层穿透出来。每个中间件都能：

- **请求前**：修改请求、拒绝请求、记录日志
- **响应后**：修改响应、添加 header、记录耗时

### 1.3 中间件 vs 依赖

| 维度 | 中间件 | 依赖（Depends） |
|------|--------|----------------|
| 作用范围 | 所有请求 | 加了 Depends 的路由 |
| 执行时机 | 路由匹配**之前** | 路由匹配**之后** |
| 能否拒绝 | 可以直接返回响应 | 只能 raise HTTPException |
| 能否改响应 | 可以 | 不能 |
| 典型用途 | CORS、日志、鉴权 | 数据库、当前用户 |

**口诀：全局的、和路由无关的，用中间件；和具体路由相关的，用依赖。**

## 二、FastAPI 中间件的两种写法

### 2.1 装饰器写法

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def my_middleware(request: Request, call_next):
    # 请求前：可以修改 request、记录日志、拒绝等
    print(f"收到请求: {request.method} {request.url}")

    # 调用下一个中间件或路由
    response = await call_next(request)

    # 响应后：可以修改 response、添加 header
    response.headers["X-Process-Time"] = "0.05s"

    return response
\`\`\`

### 2.2 类写法（Starlette 风格）

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware

class MyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print(f"收到请求: {request.method}")
        response = await call_next(request)
        response.headers["X-Custom"] = "hello"
        return response

app.add_middleware(MyMiddleware)
\`\`\`

两种写法效果一样，装饰器更简洁，类写法适合复杂中间件（可配置）。

## 三、Demo 1：请求耗时日志中间件

\`\`\`python
# 文件：demo_mw_timing.py
# 记录每个请求的耗时
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
import time

app = FastAPI()

@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    """
    记录请求耗时，添加到响应头 X-Process-Time。
    """
    # 请求前：记录开始时间
    start = time.time()

    # 调用下一个中间件或路由
    response = await call_next(request)

    # 响应后：计算耗时
    duration = time.time() - start
    # 添加自定义响应头（客户端可见）
    response.headers["X-Process-Time"] = f"{duration:.4f}s"
    # 也可以打印日志（真实项目用 logging）
    print(f"{request.method} {request.url.path} -> {response.status_code} ({duration:.4f}s)")

    return response

@app.get("/")
def root():
    return {"hello": "world"}

@app.get("/slow")
def slow():
    time.sleep(0.5)
    return {"slow": True}

# 测试
client = TestClient(app)
resp = client.get("/")
print(f"X-Process-Time: {resp.headers.get('x-process-time')}")

resp = client.get("/slow")
print(f"slow X-Process-Time: {resp.headers.get('x-process-time')}")
\`\`\`

## 四、Demo 2：CORS 中间件

跨域是前后端分离项目的必备配置。浏览器有同源策略：\`http://localhost:3000\` 的 JS 默认不能访问 \`http://localhost:8000\`。

\`\`\`python
# 文件：demo_mw_cors.py
# CORS 跨域配置
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    # 允许跨域的源（前端地址）
    # 真实生产环境不要用 ["*"]，要写明确的前端域名
    allow_origins=[
        "http://localhost:3000",   # Next.js 开发服务器
        "http://localhost:3001",
        "https://myapp.com",       # 生产域名
    ],
    # 允许的 HTTP 方法
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # 允许的请求头
    allow_headers=["*"],
    # 是否允许带 Cookie（前端 fetch 要 credentials: "include"）
    allow_credentials=True,
    # 预检请求的缓存时间（秒）
    # 浏览器在这段时间内不再发 OPTIONS 预检
    max_age=600,
)

@app.get("/api/data")
def get_data():
    return {"data": "hello"}

# 测试：模拟跨域请求
client = TestClient(app)

# 正常请求
resp = client.get("/api/data",
    headers={"Origin": "http://localhost:3000"})
print("正常请求:", resp.json())
print("Access-Control-Allow-Origin:", resp.headers.get("access-control-allow-origin"))

# 预检请求（OPTIONS）
resp = client.options("/api/data",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    })
print("预检状态码:", resp.status_code)  # 200

# 非法源（不在 allow_origins 里）
resp = client.get("/api/data",
    headers={"Origin": "http://evil.com"})
print("非法源 Allow-Origin:", resp.headers.get("access-control-allow-origin"))  # None
\`\`\`

### 4.1 CORS 工作原理

\`\`\`
浏览器                          服务器
  │                               │
  │ ── GET /api/data ──────────>  │  (带 Origin header)
  │   Origin: localhost:3000      │
  │                               │
  │ <── 200 OK ─────────────────  │
  │   Access-Control-Allow-Origin:│  (服务器决定是否允许)
  │   http://localhost:3000       │
  │                               │
  │ 浏览器检查 Origin 是否匹配     │
  │ 匹配 → 放行                   │
  │ 不匹配 → 拒绝 JS 读取响应     │
\`\`\`

对于复杂请求（POST/PUT 或带自定义 header），浏览器会先发 OPTIONS 预检：

\`\`\`
  │ ── OPTIONS /api/data ──────>  │  (预检)
  │   Origin: localhost:3000      │
  │   Access-Control-Request-     │
  │     Method: POST              │
  │                               │
  │ <── 200 OK ─────────────────  │
  │   Access-Control-Allow-       │
  │     Methods: POST, GET, ...   │
  │   Access-Control-Max-Age: 600 │
  │                               │
  │ 浏览器缓存预检结果 600 秒     │
  │ 这段时间内不再发 OPTIONS      │
  │                               │
  │ ── POST /api/data ──────────> │  (真实请求)
  │ <── 201 Created ────────────  │
\`\`\`

## 五、Demo 3：自定义鉴权中间件

\`\`\`python
# 文件：demo_mw_auth.py
# 自定义鉴权中间件
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
import jwt
import time

app = FastAPI()

# 不需要鉴权的路径白名单
PUBLIC_PATHS = {"/login", "/register", "/docs", "/openapi.json", "/"}

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """
    简单的 JWT 鉴权中间件。
    - 白名单路径直接放行
    - 其他路径要求 Authorization: Bearer <token>
    """
    path = request.url.path

    # 白名单放行
    if path in PUBLIC_PATHS:
        return await call_next(request)

    # 取 Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "未提供有效的认证信息"},
        )

    # 提取 token
    token = auth_header.split(" ", 1)[1]

    # 验证 JWT
    try:
        payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
        # 把用户信息塞进 request.state，路由函数可以取
        request.state.current_user = payload
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"detail": "token 已过期"})
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={"detail": "token 无效"})

    # 鉴权通过，继续处理
    return await call_next(request)

@app.get("/login")
def login():
    # 模拟登录，返回 token
    token = jwt.encode(
        {"user_id": 1, "username": "alice", "exp": int(time.time()) + 3600},
        "secret_key",
        algorithm="HS256",
    )
    return {"access_token": token}

@app.get("/me")
def me(request: Request):
    # 从 request.state 取中间件塞的用户信息
    user = request.state.current_user
    return {"user": user}

# 测试
client = TestClient(app)

# 1. 不带 token 访问 /me
resp = client.get("/me")
print("无 token:", resp.status_code, resp.json())  # 401

# 2. 登录拿 token
resp = client.get("/login")
token = resp.json()["access_token"]
print("token:", token[:20] + "...")

# 3. 带 token 访问 /me
resp = client.get("/me", headers={"Authorization": f"Bearer {token}"})
print("有 token:", resp.status_code, resp.json())

# 4. 假 token
resp = client.get("/me", headers={"Authorization": "Bearer fake_token"})
print("假 token:", resp.status_code, resp.json())
\`\`\`

### 5.1 中间件鉴权 vs Depends 鉴权

中间件鉴权粗暴：要么过要么不过。\`Depends\` 鉴权灵活：可以按路由配置不同策略。

\`\`\`python
# 推荐：用 Depends 鉴权
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 解析 token
    return user

@app.get("/me")
def me(user = Depends(get_current_user)):
    return user  # 自动从 token 解出

@app.get("/admin")
def admin(user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(403)
    return {"admin": True}
\`\`\`

中间件鉴权适合：统一拦截、IP 黑名单、限流。具体到路由的鉴权还是用 Depends。

## 六、Demo 4：GZip 压缩中间件

\`\`\`python
# 文件：demo_mw_gzip.py
# GZip 压缩响应
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.testclient import TestClient

app = FastAPI()

# 启用 GZip 压缩
# minimum_size=500 表示响应体小于 500 字节不压缩
# （压缩小文件反而变大，因为要加 gzip 头）
app.add_middleware(GZipMiddleware, minimum_size=500)

@app.get("/big")
def big():
    # 返回一个大响应体
    return {"data": "x" * 5000}

@app.get("/small")
def small():
    return {"data": "small"}

client = TestClient(app)

# 大响应会被压缩
resp = client.get("/big", headers={"Accept-Encoding": "gzip"})
print("大响应 Content-Encoding:", resp.headers.get("content-encoding"))  # gzip
print("响应长度:", len(resp.content))

# 小响应不压缩
resp = client.get("/small", headers={"Accept-Encoding": "gzip"})
print("小响应 Content-Encoding:", resp.headers.get("content-encoding"))  # None
\`\`\`

GZip 能把文本响应压缩到原来的 30%，大幅节省带宽。生产环境必开。

## 七、Demo 5：TrustedHost 中间件

\`\`\`python
# 文件：demo_mw_host.py
# TrustedHost 中间件：限制允许的 Host header
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.testclient import TestClient

app = FastAPI()

# 只允许这些 Host 访问
# 防止别人把你的 IP 绑到他们的域名上做钓鱼
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com", "localhost"],
)

@app.get("/")
def root():
    return {"hello": "world"}

client = TestClient(app)

# 合法 Host
resp = client.get("/", headers={"Host": "example.com"})
print("合法 Host:", resp.status_code)  # 200

# 非法 Host
resp = client.get("/", headers={"Host": "evil.com"})
print("非法 Host:", resp.status_code)  # 400
\`\`\`

## 八、中间件的执行顺序

中间件按"洋葱模型"执行：

\`\`\`python
app.add_middleware(MiddlewareA)  # 后添加，但最外层
app.add_middleware(MiddlewareB)  # 先添加，最内层

# 实际执行顺序：
# 请求进来 → A.请求前 → B.请求前 → 路由 → B.响应后 → A.响应后 → 响应出去
\`\`\`

**注意：\`add_middleware\` 后添加的在外层。** 如果用 \`@app.middleware\` 装饰器，后定义的在外层。

\`\`\`python
# 文件：demo_mw_order.py
# 中间件执行顺序演示
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

app = FastAPI()

@app.middleware("http")
async def mw_a(request: Request, call_next):
    print("A 请求前")
    response = await call_next(request)
    print("A 响应后")
    return response

@app.middleware("http")
async def mw_b(request: Request, call_next):
    print("B 请求前")
    response = await call_next(request)
    print("B 响应后")
    return response

@app.get("/")
def root():
    print("  路由处理")
    return {"ok": True}

client = TestClient(app)
client.get("/")

# 输出顺序：
#   B 请求前
#   A 请求前
#     路由处理
#   A 响应后
#   B 响应后
\`\`\`

装饰器写法：**后定义的在外层**（B 后定义，所以 B 在外层先执行）。
\`add_middleware\` 写法：**后添加的在外层**。

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| 中间件 | 请求/响应的"洋葱"层 |
| 装饰器写法 | \`@app.middleware("http")\` |
| 类写法 | \`BaseHTTPMiddleware\` |
| 请求前 | \`await call_next(request)\` 之前 |
| 响应后 | \`await call_next(request)\` 之后 |
| CORS | 跨域必备，\`CORSMiddleware\` |
| GZip | 压缩响应，省带宽 |
| TrustedHost | 防止 Host 伪造 |
| 执行顺序 | 后添加的在外层 |
| vs Depends | 全局用中间件，路由专属用依赖 |

下一章看异常处理——把错误统一管理起来。`
  },

  // ============================================================
  // 第 26 章：异常处理与统一错误响应
  // ============================================================
  {
    id: "ff-exception",
    group: "高级特性",
    icon: "❌",
    title: "异常处理与统一错误响应",
    content: `# 异常处理与统一错误响应

## 一、为什么需要统一错误响应

### 1.1 默认错误响应的问题

FastAPI 校验失败默认返回：

\`\`\`json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
\`\`\`

问题：

| 问题 | 说明 |
|------|------|
| 字段名是 \`detail\` | 前端要写 \`err.detail[0].msg\`，丑 |
| 校验错误是数组 | 前端要循环判断哪条字段错了 |
| 没有错误码 | 前端无法用 \`err.code\` 分支处理 |
| 没有时间戳 | 排查问题困难 |
| 不同错误结构不同 | HTTPException 是 \`{detail: "string"}\`，校验错误是数组 |

### 1.2 理想的错误响应

\`\`\`json
{
  "code": "VALIDATION_ERROR",
  "message": "age 必须是整数",
  "field": "age",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/users"
}
\`\`\`

字段统一、有错误码、有上下文。前端处理一致：\`if (err.code === "VALIDATION_ERROR") {...}\`。

## 二、HTTPException 详解

### 2.1 基本用法

\`\`\`python
from fastapi import HTTPException

raise HTTPException(
    status_code=404,
    detail="用户不存在",
    headers={"X-Error": "user_not_found"},  # 可选，加自定义响应头
)
\`\`\`

FastAPI 会把 HTTPException 转成响应：

\`\`\`json
{
  "detail": "用户不存在"
}
\`\`\`

### 2.2 detail 可以是任意 JSON 可序列化的值

\`\`\`python
# detail 是字符串
raise HTTPException(404, "用户不存在")

# detail 是字典（更结构化）
raise HTTPException(400, detail={
    "code": "USERNAME_EXISTS",
    "message": "用户名已被占用",
    "field": "username",
})

# detail 是列表
raise HTTPException(422, detail=[
    {"field": "username", "msg": "太短"},
    {"field": "email", "msg": "格式错误"},
])
\`\`\`

## 三、Demo 1：自定义异常类

业务异常用 HTTPException 不够语义化。比如"用户不存在"应该是 404，但"账户被禁用"也是 404？应该用专门的异常类。

\`\`\`python
# 文件：demo_exc_custom.py
# 自定义业务异常
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from datetime import datetime

app = FastAPI()

# ============ 自定义异常类 ============
class BusinessError(Exception):
    """所有业务异常的基类。"""
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

class UserNotFound(BusinessError):
    def __init__(self, user_id: int):
        super().__init__(
            code="USER_NOT_FOUND",
            message=f"用户 {user_id} 不存在",
            status_code=404,
        )

class UsernameExists(BusinessError):
    def __init__(self, username: str):
        super().__init__(
            code="USERNAME_EXISTS",
            message=f"用户名 {username} 已被占用",
            status_code=409,
        )

class PermissionDenied(BusinessError):
    def __init__(self, action: str):
        super().__init__(
            code="PERMISSION_DENIED",
            message=f"无权限执行: {action}",
            status_code=403,
        )

# ============ 注册异常处理器 ============
@app.exception_handler(BusinessError)
async def business_error_handler(request: Request, exc: BusinessError):
    """统一处理所有 BusinessError 子类。"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )

# ============ 路由 ============
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id != 1:
        # 业务异常，会被 business_error_handler 处理
        raise UserNotFound(user_id)
    return {"id": 1, "username": "alice"}

@app.post("/register/{username}")
def register(username: str):
    if username == "admin":
        raise UsernameExists(username)
    return {"username": username}

# ============ 测试 ============
client = TestClient(app)

# 用户不存在
resp = client.get("/users/999")
print(f"状态码: {resp.status_code}")  # 404
print(f"响应: {resp.json()}")
# {code: USER_NOT_FOUND, message: 用户 999 不存在, ...}

# 用户名冲突
resp = client.post("/register/admin")
print(f"状态码: {resp.status_code}")  # 409
print(f"响应: {resp.json()}")
\`\`\`

### 3.1 自定义异常的好处

| 维度 | HTTPException | 自定义异常 |
|------|---------------|-----------|
| 语义 | "404" | "USER_NOT_FOUND" |
| 扩展 | 只能改 detail | 可以加任意字段 |
| 继承 | 不能继承 | 可以建异常家族 |
| 处理 | 各路由自己 raise | 统一 handler 处理 |
| 文档 | OpenAPI 不显示 | 可以加 responses 文档 |

## 四、Demo 2：统一校验错误响应

FastAPI 默认的 422 校验错误格式不好用，我们改成统一格式。

\`\`\`python
# 文件：demo_exc_validation.py
# 统一校验错误响应
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from datetime import datetime

app = FastAPI()

# 自定义校验错误处理器
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """
    覆盖 FastAPI 默认的 422 校验错误响应。

    默认格式: {detail: [{loc, msg, type}, ...]}
    我们改成: {code, message, errors: [{field, msg}], timestamp, path}
    """
    # 把 exc.errors() 转成更简洁的格式
    errors = []
    for err in exc.errors():
        # err['loc'] 是 ['body', 'username'] 这种路径
        # 取最后一个元素作为字段名
        field = ".".join(str(x) for x in err["loc"][1:])  # 跳过 'body'
        errors.append({
            "field": field or "_root",
            "message": err["msg"],
        })

    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "请求数据校验失败",
            "errors": errors,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )

# ============ 路由 ============
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    age: int = Field(ge=0, le=150)
    email: str

@app.post("/register")
def register(req: RegisterRequest):
    return {"username": req.username, "age": req.age}

# ============ 测试 ============
client = TestClient(app)

# 故意传错数据
resp = client.post("/register", json={
    "username": "ab",      # 太短
    "age": 200,            # 太大
    "email": 123,          # 类型错
})
print(f"状态码: {resp.status_code}")  # 422
import json
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
# {
#   "code": "VALIDATION_ERROR",
#   "message": "请求数据校验失败",
#   "errors": [
#     {"field": "username", "message": "String should have at least 3 characters"},
#     {"field": "age", "message": "Input should be less than or equal to 150"},
#     {"field": "email", "message": "Input should be a valid string"}
#   ],
#   "timestamp": "...",
#   "path": "/register"
# }
\`\`\`

## 五、Demo 3：全局兜底异常处理器

有些异常你预料不到（比如数据库连接断了），需要一个全局兜底，避免 500 错误把堆栈暴露给用户。

\`\`\`python
# 文件：demo_exc_global.py
# 全局兜底异常处理
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from datetime import datetime
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# 模拟一个会抛未知异常的依赖
class FakeDB:
    def query(self, sql):
        # 模拟数据库连接断开
        raise ConnectionError("数据库连接断开")

# 全局兜底：所有未被其他 handler 处理的异常
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    兜底处理所有未捕获的异常。
    - 记录详细日志（带堆栈，方便排查）
    - 返回简化错误响应（不暴露内部细节）
    """
    # 记录完整堆栈到日志
    logger.exception(
        f"未捕获异常: {request.method} {request.url.path} - {exc}"
    )

    # 返回用户友好的错误响应
    # 注意：不要把 exc 信息暴露给用户（可能含敏感信息）
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误，请稍后重试",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
            # 真实生产环境不要返回 detail
            # 开发环境可以返回 exc.__class__.__name__ 方便调试
            "detail": str(exc) if app.debug else None,
        },
    )

@app.get("/crash")
def crash_endpoint():
    db = FakeDB()
    return db.query("SELECT 1")

# 测试
client = TestClient(app, raise_server_exceptions=False)
# 注意：raise_server_exceptions=False 让 TestClient 不重新抛异常
# 否则 500 错误会直接抛到测试代码里

resp = client.get("/crash")
print(f"状态码: {resp.status_code}")  # 500
print(f"响应: {resp.json()}")
\`\`\`

### 5.1 注意事项

- \`@app.exception_handler(Exception)\` 会捕获**所有**异常，包括 HTTPException
- 如果想保留 HTTPException 的默认处理，要单独注册：

\`\`\`python
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    # 自定义 HTTPException 的响应格式
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": "HTTP_ERROR",
            "message": exc.detail,
            "status_code": exc.status_code,
        },
    )
\`\`\`

## 六、Demo 4：综合实战——统一错误响应系统

把上面三个组合起来，形成完整的错误处理体系。

\`\`\`python
# 文件：demo_exc_full.py
# 综合实战：统一错误响应系统
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from datetime import datetime
import logging

# ============ 错误响应工具 ============
def error_response(code: str, message: str, status_code: int = 400, **extra):
    """构造统一格式的错误响应。"""
    body = {
        "code": code,
        "message": message,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    body.update(extra)
    return JSONResponse(status_code=status_code, content=body)

# ============ 自定义异常 ============
class AppException(Exception):
    """应用异常基类。"""
    code = "APP_ERROR"
    message = "应用错误"
    status_code = 400

    def __init__(self, message=None, **extra):
        if message:
            self.message = message
        self.extra = extra

class NotFoundError(AppException):
    code = "NOT_FOUND"
    status_code = 404

class PermissionDeniedError(AppException):
    code = "PERMISSION_DENIED"
    status_code = 403

class ConflictError(AppException):
    code = "CONFLICT"
    status_code = 409

# ============ 应用 ============
app = FastAPI()
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# 处理自定义异常
@app.exception_handler(AppException)
async def app_exc_handler(request: Request, exc: AppException):
    return error_response(
        code=exc.code,
        message=exc.message,
        status_code=exc.status_code,
        path=str(request.url.path),
        **exc.extra,
    )

# 处理 HTTPException（统一格式）
@app.exception_handler(HTTPException)
async def http_exc_handler(request: Request, exc: HTTPException):
    return error_response(
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
        status_code=exc.status_code,
        path=str(request.url.path),
    )

# 处理校验错误
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(x) for x in err["loc"][1:])
        errors.append({"field": field or "_root", "message": err["msg"]})
    return error_response(
        code="VALIDATION_ERROR",
        message="请求数据校验失败",
        status_code=422,
        path=str(request.url.path),
        errors=errors,
    )

# 处理所有未捕获的异常
@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.exception(f"未捕获: {exc}")
    return error_response(
        code="INTERNAL_ERROR",
        message="服务器内部错误",
        status_code=500,
        path=str(request.url.path),
    )

# ============ 路由 ============
class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    age: int = Field(ge=0, le=150)

# 模拟数据库
fake_users = {}

@app.post("/users")
def create_user(req: UserCreate):
    if req.username in fake_users:
        raise ConflictError(f"用户名 {req.username} 已存在")
    fake_users[req.username] = req.model_dump()
    return {"username": req.username}

@app.get("/users/{username}")
def get_user(username: str):
    if username not in fake_users:
        raise NotFoundError(f"用户 {username} 不存在")
    return fake_users[username]

@app.delete("/users/{username}")
def delete_user(username: str):
    if username not in fake_users:
        raise NotFoundError(f"用户 {username} 不存在")
    del fake_users[username]
    return {"deleted": username}

@app.get("/crash")
def crash():
    # 模拟未捕获异常
    raise RuntimeError("故意抛错")

# ============ 测试 ============
client = TestClient(app, raise_server_exceptions=False)

# 1. 校验错误
print("=== 校验错误 ===")
resp = client.post("/users", json={"username": "ab", "age": 200})
print(resp.json())

# 2. 正常创建
print("\\n=== 正常创建 ===")
resp = client.post("/users", json={"username": "alice", "age": 18})
print(resp.json())

# 3. 冲突错误
print("\\n=== 冲突错误 ===")
resp = client.post("/users", json={"username": "alice", "age": 18})
print(resp.status_code, resp.json())

# 4. 未找到
print("\\n=== 未找到 ===")
resp = client.get("/users/ghost")
print(resp.status_code, resp.json())

# 5. 内部错误
print("\\n=== 内部错误 ===")
resp = client.get("/crash")
print(resp.status_code, resp.json())
\`\`\`

## 七、在 OpenAPI 文档里展示错误响应

\`\`\`python
@app.get(
    "/users/{user_id}",
    responses={
        404: {"description": "用户不存在", "content": {"application/json": {"example": {
            "code": "NOT_FOUND",
            "message": "用户 999 不存在",
        }}}},
        403: {"description": "无权限"},
    },
)
def get_user(user_id: int):
    ...
\`\`\`

这样 \`/docs\` 页面就能看到所有可能的错误响应，方便前端对照开发。

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| HTTPException | FastAPI 内置异常，转成 HTTP 响应 |
| 自定义异常 | 继承 Exception，语义化业务错误 |
| exception_handler | 注册异常处理器，统一响应格式 |
| RequestValidationError | 校验失败抛的异常，可改默认 422 响应 |
| 全局兜底 | \`@app.exception_handler(Exception)\` |
| 统一格式 | code + message + timestamp + path |
| OpenAPI responses | 在文档里展示错误响应 |

下一章我们看分页——列表接口的标配。`
  },

  // ============================================================
  // 第 27 章：分页与过滤
  // ============================================================
  {
    id: "ff-pagination",
    group: "高级特性",
    icon: "📄",
    title: "分页与过滤",
    content: `# 分页与过滤

## 一、为什么需要分页

### 1.1 不分页的灾难

\`\`\`python
@app.get("/cards")
def list_cards():
    return db.query(Card).all()  # 返回所有卡片
\`\`\`

如果有 10 万张卡片：

| 问题 | 后果 |
|------|------|
| 内存爆炸 | 服务器要一次加载 10 万条记录到内存 |
| 网络堵塞 | 几十 MB 的 JSON 要传好几分钟 |
| 浏览器卡死 | 渲染 10 万个 DOM 节点直接死机 |
| 用户体验差 | 用户只看前几条，但等了所有数据 |

**分页就是"按需加载"——一次只返回一部分。**

### 1.2 生活类比：图书馆

去图书馆找书，不会有人把所有书搬到一张桌子上让你翻。书架按分类摆，每架几十本，你一架一架翻。这就是分页。

## 二、limit/offset 分页（最经典）

### 2.1 原理

\`\`\`
数据: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, ...]

第 1 页: limit=5, offset=0  →  [1, 2, 3, 4, 5]
第 2 页: limit=5, offset=5  →  [6, 7, 8, 9, 10]
第 3 页: limit=5, offset=10 →  [11, 12, ...]
\`\`\`

- \`limit\`: 每页多少条（SQL 的 LIMIT）
- \`offset\`: 跳过多少条（SQL 的 OFFSET）
- 页码 = offset / limit + 1

### 2.2 SQL 实现

\`\`\`sql
SELECT * FROM cards LIMIT 5 OFFSET 0;   -- 第 1 页
SELECT * FROM cards LIMIT 5 OFFSET 5;   -- 第 2 页
SELECT * FROM cards LIMIT 5 OFFSET 10;  -- 第 3 页
\`\`\`

SQLAlchemy：

\`\`\`python
db.query(Card).limit(5).offset(0).all()
# 或者 2.0 风格
db.execute(select(Card).limit(5).offset(0)).scalars().all()
\`\`\`

## 三、Demo 1：基础分页接口

\`\`\`python
# 文件：demo_page_basic.py
# 基础分页接口
from fastapi import FastAPI, Query, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String, select
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import List
from pydantic import BaseModel

# ============ 数据库 ============
engine = create_engine("sqlite:///:memory:")
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    status = Column(String, default="todo")

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 初始化 25 条测试数据
db = SessionLocal()
for i in range(1, 26):
    db.add(Card(title=f"任务 {i}", status="todo"))
db.commit()
db.close()

# ============ Schema ============
class CardOut(BaseModel):
    id: int
    title: str
    status: str

class PageResponse(BaseModel):
    """统一分页响应。"""
    items: List[CardOut]
    total: int          # 总条数
    page: int           # 当前页码
    page_size: int      # 每页条数
    total_pages: int    # 总页数

# ============ 路由 ============
app = FastAPI()

@app.get("/cards", response_model=PageResponse)
def list_cards(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(10, ge=1, le=100, description="每页条数"),
    db: Session = Depends(get_db),
):
    """
    分页查询卡片列表。
    - page: 页码（从 1 开始，前端友好）
    - page_size: 每页条数
    """
    # 1. 计算 offset
    offset = (page - 1) * page_size

    # 2. 查当前页数据
    stmt = select(Card).offset(offset).limit(page_size)
    items = db.execute(stmt).scalars().all()

    # 3. 查总条数（用于计算总页数）
    # 注意：count 不需要 limit/offset，要单独查
    from sqlalchemy import func
    total = db.scalar(select(func.count(Card.id)))

    # 4. 计算总页数
    # 用 (total + page_size - 1) // page_size 实现"向上取整"
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PageResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

# ============ 测试 ============
client = TestClient(app)

# 第 1 页
resp = client.get("/cards?page=1&page_size=10")
data = resp.json()
print(f"第 1 页: {len(data['items'])} 条, 总共 {data['total']} 条, 总 {data['total_pages']} 页")

# 第 3 页（最后一页，应该只有 5 条）
resp = client.get("/cards?page=3&page_size=10")
data = resp.json()
print(f"第 3 页: {len(data['items'])} 条")  # 5 条

# 越界（第 100 页，应该返回空）
resp = client.get("/cards?page=100&page_size=10")
data = resp.json()
print(f"第 100 页: {len(data['items'])} 条")  # 0 条

# 非法参数（page=0，应该 422）
resp = client.get("/cards?page=0")
print(f"page=0 状态码: {resp.status_code}")  # 422
\`\`\`

### 3.1 分页响应的标准字段

| 字段 | 说明 |
|------|------|
| items | 当前页数据数组 |
| total | 总条数（用于显示"共 XX 条"） |
| page | 当前页码 |
| page_size | 每页条数 |
| total_pages | 总页数（用于渲染页码导航） |

前端拿到这些信息就能渲染分页器：\`上一页 | 1 2 3 ... 10 | 下一页\`。

## 四、Demo 2：过滤与排序

实际项目里列表接口都要支持过滤（只看"已完成"的）和排序（按创建时间倒序）。

\`\`\`python
# 文件：demo_page_filter.py
# 分页 + 过滤 + 排序
from fastapi import FastAPI, Query, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String, DateTime, select, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# ============ 数据库 ============
engine = create_engine("sqlite:///:memory:")
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    status = Column(String, default="todo")  # todo / doing / done
    priority = Column(Integer, default=0)    # 0=低 1=中 2=高
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

# 测试数据
db = SessionLocal()
import random
for i in range(1, 51):
    db.add(Card(
        title=f"任务 {i}",
        status=random.choice(["todo", "doing", "done"]),
        priority=random.randint(0, 2),
    ))
db.commit()
db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ Schema ============
class CardOut(BaseModel):
    id: int
    title: str
    status: str
    priority: int
    created_at: datetime

class PageResponse(BaseModel):
    items: List[CardOut]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============ 路由 ============
app = FastAPI()

@app.get("/cards", response_model=PageResponse)
def list_cards(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    # 过滤参数
    status: Optional[str] = Query(None, description="按状态过滤: todo/doing/done"),
    priority: Optional[int] = Query(None, ge=0, le=2, description="按优先级过滤"),
    keyword: Optional[str] = Query(None, description="标题关键词模糊搜索"),
    # 排序参数
    sort_by: str = Query("created_at", description="排序字段: created_at/priority/id"),
    order: str = Query("desc", pattern="^(asc|desc)$", description="asc 或 desc"),
    db: Session = Depends(get_db),
):
    """
    分页 + 过滤 + 排序的卡片列表。
    """
    # 1. 构造基础查询
    stmt = select(Card)
    count_stmt = select(func.count(Card.id))

    # 2. 应用过滤条件（过滤条件要同时加到 stmt 和 count_stmt）
    if status:
        stmt = stmt.where(Card.status == status)
        count_stmt = count_stmt.where(Card.status == status)

    if priority is not None:
        stmt = stmt.where(Card.priority == priority)
        count_stmt = count_stmt.where(Card.priority == priority)

    if keyword:
        # 模糊搜索：ilike 是大小写不敏感的 LIKE
        stmt = stmt.where(Card.title.ilike(f"%{keyword}%"))
        count_stmt = count_stmt.where(Card.title.ilike(f"%{keyword}%"))

    # 3. 应用排序
    # 白名单：只允许这几个字段排序，防止 SQL 注入
    sort_fields = {
        "created_at": Card.created_at,
        "priority": Card.priority,
        "id": Card.id,
    }
    sort_column = sort_fields.get(sort_by, Card.created_at)
    if order == "asc":
        stmt = stmt.order_by(sort_column.asc())
    else:
        stmt = stmt.order_by(sort_column.desc())

    # 4. 应用分页
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    # 5. 执行查询
    items = db.execute(stmt).scalars().all()
    total = db.scalar(count_stmt)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PageResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

# ============ 测试 ============
client = TestClient(app)

# 1. 不带任何过滤
resp = client.get("/cards")
data = resp.json()
print(f"全部: {data['total']} 条")

# 2. 按状态过滤
resp = client.get("/cards?status=todo")
data = resp.json()
print(f"todo: {data['total']} 条")

# 3. 按优先级过滤
resp = client.get("/cards?priority=2")
data = resp.json()
print(f"priority=2: {data['total']} 条")

# 4. 组合过滤
resp = client.get("/cards?status=done&priority=2")
data = resp.json()
print(f"done + priority=2: {data['total']} 条")

# 5. 关键词搜索
resp = client.get("/cards?keyword=任务 1")
data = resp.json()
print(f"关键词'任务 1': {data['total']} 条")  # 任务 1, 10-19, 100+

# 6. 排序
resp = client.get("/cards?sort_by=priority&order=asc&page_size=3")
data = resp.json()
print("按优先级升序前 3 条:")
for item in data["items"]:
    print(f"  {item['title']} (priority={item['priority']})")
\`\`\`

### 4.1 关键点

**1. 过滤条件要同时加到数据查询和 count 查询：**

\`\`\`python
# ❌ 错误：count 没加过滤，total 会一直是全表数量
stmt = stmt.where(Card.status == status)
total = db.scalar(select(func.count(Card.id)))  # 没加 where

# ✅ 正确
stmt = stmt.where(Card.status == status)
count_stmt = select(func.count(Card.id)).where(Card.status == status)
total = db.scalar(count_stmt)
\`\`\`

**2. 排序字段要用白名单：**

\`\`\`python
# ❌ 危险：直接用用户传的字符串，有 SQL 注入风险
stmt = stmt.order_by(f"Card.{sort_by}")  # 如果 sort_by 是 "id; DROP TABLE cards"?

# ✅ 安全：用字典白名单映射
sort_fields = {"created_at": Card.created_at, "priority": Card.priority}
sort_column = sort_fields.get(sort_by, Card.created_at)
stmt = stmt.order_by(sort_column.asc())
\`\`\`

## 五、limit/offset 的缺点

### 5.1 深翻页性能差

\`\`\`sql
SELECT * FROM cards LIMIT 10 OFFSET 1000000;
\`\`\`

数据库要先扫描前 100 万条，再扔掉，返回后 10 条。**OFFSET 越大越慢。**

### 5.2 数据漂移

用户看第 2 页时，第 1 页有人删了一条。原本第 11 条变成第 10 条，被挤到第 1 页，但用户在第 2 页看不到——它"漂移"了。

## 六、游标分页（Cursor）

### 6.1 原理

不用 offset，用"上一页最后一条的 ID"作为游标：

\`\`\`
第 1 页: SELECT * FROM cards ORDER BY id DESC LIMIT 10
         返回 id = [50, 49, 48, ..., 41]

第 2 页: SELECT * FROM cards WHERE id < 41 ORDER BY id DESC LIMIT 10
         返回 id = [40, 39, ..., 31]
\`\`\`

### 6.2 优点

- 性能稳定：\`WHERE id < 41\` 走索引，速度恒定
- 不会漂移：每条记录都基于上一页最后一条的 ID

### 6.3 缺点

- 不能跳页：只能"上一页/下一页"
- 实现复杂：要处理游标编码

### 6.4 Demo

\`\`\`python
# 文件：demo_page_cursor.py
# 游标分页
from fastapi import FastAPI, Query, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String, select, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import List, Optional
from pydantic import BaseModel
import base64

engine = create_engine("sqlite:///:memory:")
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True)
    title = Column(String)

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

db = SessionLocal()
for i in range(1, 101):
    db.add(Card(title=f"任务 {i}"))
db.commit()
db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CardOut(BaseModel):
    id: int
    title: str

class CursorPageResponse(BaseModel):
    items: List[CardOut]
    next_cursor: Optional[str]  # 下一页游标，None 表示没有下一页
    has_next: bool

app = FastAPI()

def encode_cursor(card_id: int) -> str:
    """把卡片 ID 编码成不透明的游标字符串。"""
    return base64.b64encode(f"cursor:{card_id}".encode()).decode()

def decode_cursor(cursor: str) -> int:
    """解码游标，返回卡片 ID。"""
    raw = base64.b64decode(cursor.encode()).decode()
    return int(raw.split(":")[1])

@app.get("/cards", response_model=CursorPageResponse)
def list_cards(
    cursor: Optional[str] = Query(None, description="上一页返回的 next_cursor"),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """游标分页查询。"""
    stmt = select(Card).order_by(Card.id.desc()).limit(page_size)

    # 如果带游标，加 WHERE id < cursor_id
    if cursor:
        try:
            cursor_id = decode_cursor(cursor)
            stmt = stmt.where(Card.id < cursor_id)
        except Exception:
            from fastapi import HTTPException
            raise HTTPException(400, "无效的 cursor")

    items = db.execute(stmt).scalars().all()

    # 是否还有下一页：看本页是否满了
    has_next = len(items) == page_size
    # 下一页游标：本页最后一条的 ID
    next_cursor = encode_cursor(items[-1].id) if has_next and items else None

    return CursorPageResponse(
        items=items,
        next_cursor=next_cursor,
        has_next=has_next,
    )

# 测试
client = TestClient(app)

# 第 1 页
resp = client.get("/cards?page_size=10")
data = resp.json()
print(f"第 1 页: {[item['id'] for item in data['items']]}")
print(f"has_next: {data['has_next']}")
print(f"next_cursor: {data['next_cursor']}")

# 第 2 页（用上一页返回的 next_cursor）
resp = client.get(f"/cards?page_size=10&cursor={data['next_cursor']}")
data = resp.json()
print(f"第 2 页: {[item['id'] for item in data['items']]}")

# 一直翻到没有下一页
cursor = None
page = 0
while True:
    url = f"/cards?page_size=30"
    if cursor:
        url += f"&cursor={cursor}"
    resp = client.get(url)
    data = resp.json()
    page += 1
    print(f"第 {page} 页: {[item['id'] for item in data['items']]}")
    if not data["has_next"]:
        print("没有下一页了")
        break
    cursor = data["next_cursor"]
\`\`\`

### 6.5 什么时候用游标分页

| 场景 | 推荐 |
|------|------|
| 后台管理（要跳页） | limit/offset |
| 移动端无限滚动 | 游标分页 |
| 时间线（微博、朋友圈） | 游标分页 |
| 数据量大（百万级） | 游标分页 |
| 数据量小（<1万） | limit/offset |

## 七、Demo 3：通用分页工具

把分页逻辑封装成工具函数，所有列表接口都能用。

\`\`\`python
# 文件：demo_page_utils.py
# 通用分页工具
from fastapi import FastAPI, Query, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String, select, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import List, Type, TypeVar, Optional
from pydantic import BaseModel
from dataclasses import dataclass

# ============ 通用分页工具 ============
T = TypeVar("T")

@dataclass
class PageParams:
    """分页参数。"""
    page: int = 1
    page_size: int = 10

    @property
    def offset(self):
        return (self.page - 1) * self.page_size

def paginate(
    db: Session,
    stmt,               # SQLAlchemy 查询语句（不含 limit/offset）
    page: int = 1,
    page_size: int = 10,
):
    """
    通用分页函数。
    返回: {items, total, page, page_size, total_pages}
    """
    # 查总数
    # 从 stmt 提取 count 语句（subquery 包装）
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0

    # 查当前页
    items = db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).scalars().all()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

# ============ 应用 ============
engine = create_engine("sqlite:///:memory:")
Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    status = Column(String, default="todo")

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

db = SessionLocal()
for i in range(1, 26):
    db.add(Card(title=f"任务 {i}"))
db.commit()
db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CardOut(BaseModel):
    id: int
    title: str
    status: str

class PageResponse(BaseModel):
    items: List[CardOut]
    total: int
    page: int
    page_size: int
    total_pages: int

app = FastAPI()

@app.get("/cards", response_model=PageResponse)
def list_cards(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """使用通用分页工具。"""
    stmt = select(Card)
    if status:
        stmt = stmt.where(Card.status == status)

    result = paginate(db, stmt, page=page, page_size=page_size)

    # 把 ORM 对象转成 Pydantic 模型
    # response_model 会自动转，但要在返回前确认结构匹配
    return result

# 测试
client = TestClient(app)
resp = client.get("/cards?page=1&page_size=5")
data = resp.json()
print(f"items 数: {len(data['items'])}, total: {data['total']}, total_pages: {data['total_pages']}")
\`\`\`

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| 分页的必要性 | 避免内存爆炸、网络堵塞、浏览器卡死 |
| limit/offset | 经典分页，简单但有深翻页问题 |
| 游标分页 | 性能稳定，但不能跳页 |
| 分页响应字段 | items + total + page + page_size + total_pages |
| 过滤 | WHERE 条件，同时加到数据查询和 count 查询 |
| 排序 | order_by，字段用白名单防止注入 |
| 通用工具 | 封装成函数，所有列表接口复用 |
| 选择原则 | 小数据/后台用 offset，大数据/无限滚动用 cursor |

至此高级特性部分结束。下一章开始 Next.js 前端集成，把后端接口接到漂亮的前端 UI 上。`
  },
];
