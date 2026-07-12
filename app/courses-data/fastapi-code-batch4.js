// =============================================================
// FastAPI 代码详解 - 第 4 批：实战进阶（4 章）
// -------------------------------------------------------------
// 本批章节：
//   fc-auth:        用户认证（JWT）
//   fc-file-deep:   文件处理实战
//   fc-bg-tasks:    后台任务
//   fc-test-deploy: 测试与部署
//
// 编写原则：demo 驱动，重点在代码注释里讲解，少废话
// =============================================================

export const chapters = [
  {
    id: "fc-auth",
    group: "实战进阶",
    icon: "🔐",
    title: "用户认证（JWT）",
    content: `# 用户认证（JWT）

## JWT 是什么

JWT（JSON Web Token）是一种无状态的认证方式。用户登录后服务器发一个 token，之后每次请求带 token 来证明身份。

## Demo 1：密码哈希

\`\`\`python
# pip install python-jose[cryptography] passlib[bcrypt]
from passlib.context import CryptContext

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 哈希密码（永远不要明文存储密码！）
def hash_password(password: str) -> str:
    # bcrypt 自动加盐（salt），相同密码每次哈希结果不同
    return pwd_context.hash(password)

# 验证密码
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 对比明文和哈希值
    return pwd_context.verify(plain_password, hashed_password)

# 测试
hashed = hash_password("123456")
# hashed = "$2b$12$..."  # 每次不同
verify_password("123456", hashed)  # True
verify_password("wrong", hashed)   # False
\`\`\`

## Demo 2：生成 JWT Token

\`\`\`python
from datetime import datetime, timedelta
from jose import jwt  # python-jose 库

# 密钥（生产环境用环境变量，不要硬编码！）
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # token 有效期 30 分钟

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    # 复制数据，避免修改原字典
    to_encode = data.copy()

    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})  # exp 是 JWT 标准字段，表示过期时间

    # 编码生成 token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 测试
token = create_access_token(data={"sub": "user123"})
# token = "eyJhbGciOi..."  # 三段式，用 . 分隔
# 第一段：header（算法信息）
# 第二段：payload（数据，如 user123）
# 第三段：signature（签名，防篡改）
\`\`\`

## Demo 3：注册接口

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

# 请求模型
class UserRegister(BaseModel):
    username: str
    password: str
    email: str | None = None

# 模拟数据库
fake_users_db = {}

@app.post("/register", status_code=201)
def register(user: UserRegister):
    # 检查用户名是否已存在
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 哈希密码后存储
    hashed_password = hash_password(user.password)
    fake_users_db[user.username] = {
        "username": user.username,
        "hashed_password": hashed_password,
        "email": user.email,
    }
    return {"msg": "注册成功"}
\`\`\`

## Demo 4：登录接口

\`\`\`python
class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(user: UserLogin):
    # 1. 查找用户
    db_user = fake_users_db.get(user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 2. 验证密码
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 3. 生成 token（sub 是 JWT 标准字段，表示"主题"即用户标识）
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

## Demo 5：Token 认证依赖

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

# OAuth2PasswordBearer 告诉 FastAPI 从请求头获取 token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # tokenUrl 是登录接口路径

# 认证依赖：验证 token 有效性
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # 解码 token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # 提取用户名
        if username is None:
            raise HTTPException(status_code=401, detail="无效的令牌")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="令牌已过期")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="无效的令牌")

    # 查找用户
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user

# 使用认证保护路由
@app.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "email": current_user["email"]}

# 测试：
# 1. 登录获取 token：POST /login → {"access_token":"xxx"}
# 2. 用 token 访问：GET /me -H "Authorization: Bearer xxx"
\`\`\`

## Demo 6：完整认证流程总结

\`\`\`python
# 完整认证流程：
# 1. 用户注册：POST /register → 密码哈希存储
# 2. 用户登录：POST /login → 验证密码 → 返回 JWT token
# 3. 访问受保护资源：GET /me → 请求头带 Authorization: Bearer <token>
# 4. FastAPI 自动验证 token → 提取用户信息 → 返回数据

# 关键点：
# - 密码永远不存明文，用 bcrypt 哈希
# - JWT 是无状态的，服务器不存 token，靠签名验证
# - token 有过期时间，过期后需要重新登录
# - Authorization 头格式：Bearer <token>

# 使用 /docs 页面测试更方便：
# 点击右上角 "Authorize" 按钮，输入 token
# 之后所有请求自动带上 Authorization 头
\`\`\`

## 小结

| 步骤 | 操作 |
|------|------|
| 密码处理 | hash_password / verify_password |
| 生成 token | jwt.encode(data, key, algorithm) |
| 验证 token | jwt.decode(token, key, algorithms) |
| 认证依赖 | OAuth2PasswordBearer + Depends |
| 保护路由 | Depends(get_current_user) |`
  },

  {
    id: "fc-file-deep",
    group: "实战进阶",
    icon: "📁",
    title: "文件处理实战",
    content: `# 文件处理实战

## 进阶文件操作

上一章讲了基本文件上传，本章做更实用的功能：图片处理、静态文件服务、文件下载。

## Demo 1：返回文件（下载）

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

# 返回文件给用户下载
@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = f"uploads/{filename}"
    return FileResponse(
        path=file_path,           # 文件路径
        filename=filename,        # 下载时显示的文件名
        media_type="application/octet-stream",  # 二进制流，浏览器会触发下载
    )

# FileResponse 和 return {"file": ...} 的区别：
# FileResponse 直接返回文件内容，浏览器会下载
# return {"file": ...} 返回 JSON，浏览器显示文本
\`\`\`

## Demo 2：图片上传 + 缩略图

\`\`\`python
# pip install Pillow  # 图片处理库
from PIL import Image
import io

THUMB_SIZE = (200, 200)  # 缩略图尺寸

@app.post("/upload-image")
async def upload_image(file: UploadFile = File()):
    # 读取上传的图片
    content = await file.read()

    # 用 Pillow 打开图片
    image = Image.open(io.BytesIO(content))

    # 生成缩略图
    image.thumbnail(THUMB_SIZE)  # 等比缩放，不超过 200x200

    # 保存缩略图
    thumb_bytes = io.BytesIO()
    image.save(thumb_bytes, format="JPEG", quality=85)

    # 保存原图
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(content)

    # 保存缩略图
    thumb_name = f"thumb_{file.filename}"
    with open(f"uploads/{thumb_name}", "wb") as f:
        f.write(thumb_bytes.getvalue())

    return {
        "original": file.filename,
        "thumbnail": thumb_name,
        "original_size": len(content),
        "thumb_size": len(thumb_bytes.getvalue()),
    }
\`\`\`

## Demo 3：静态文件服务

\`\`\`python
from fastapi.staticfiles import StaticFiles

# 挂载静态文件目录
# 访问 /static/logo.png → 自动返回 static/ 目录下的 logo.png
app.mount("/static", StaticFiles(directory="static"), name="static")

# 创建目录结构：
# ├── main.py
# ├── static/
# │   ├── logo.png
# │   ├── style.css
# │   └── script.js
# └── uploads/
#     └── ...

# 访问规则：
# /static/logo.png  → static/logo.png
# /static/style.css → static/style.css
\`\`\`

## Demo 4：文件类型校验

\`\`\`python
ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
}

MAX_SIZE = 10 * 1024 * 1024  # 10MB

@app.post("/upload-safe")
async def upload_safe(file: UploadFile = File()):
    # 1. 校验文件类型（通过 MIME 类型）
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型：{file.content_type}。仅支持：{', '.join(ALLOWED_TYPES.keys())}",
        )

    # 2. 校验文件大小
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"文件过大：{len(content)} 字节。最大允许：{MAX_SIZE} 字节",
        )

    # 3. 保存文件
    ext = ALLOWED_TYPES[file.content_type]  # 根据 MIME 类型获取扩展名
    filename = f"{uuid.uuid4()}.{ext}"      # 用 UUID 避免文件名冲突
    save_path = f"uploads/{filename}"

    with open(save_path, "wb") as f:
        f.write(content)

    return {"filename": filename, "size": len(content)}
\`\`\`

## Demo 5：流式返回大文件

\`\`\`python
from fastapi.responses import StreamingResponse

def file_iterator(file_path: str, chunk_size: int = 1024 * 1024):
    # 生成器函数：每次读取一块，不一次性加载到内存
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)  # 每次读 1MB
            if not chunk:
                break
            yield chunk  # yield 返回一块数据

@app.get("/stream/{filename}")
def stream_file(filename: str):
    file_path = f"uploads/{filename}"
    return StreamingResponse(
        file_iterator(file_path),  # 传入生成器
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

# StreamingResponse 适合大文件（几百 MB 甚至 GB）
# 不会一次性加载到内存，节省服务器资源
\`\`\`

## 小结

| 功能 | 方法 |
|------|------|
| 文件下载 | FileResponse |
| 图片处理 | Pillow (PIL) |
| 静态文件 | StaticFiles app.mount |
| 类型校验 | content_type 检查 |
| 大文件流式 | StreamingResponse + 生成器 |`
  },

  {
    id: "fc-bg-tasks",
    group: "实战进阶",
    icon: "⏳",
    title: "后台任务",
    content: `# 后台任务

## 为什么需要后台任务

有些操作不需要立即完成（发邮件、写日志、处理图片），可以在后台慢慢做，用户不用等。

## Demo 1：BackgroundTasks 基本用法

\`\`\`python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

# 后台任务函数：普通函数，不需要 async
def write_log(message: str):
    # 模拟耗时操作（写日志）
    with open("app.log", "a") as f:
        f.write(f"{message}\\n")

@app.post("/send-notification")
def send_notification(
    email: str,
    background_tasks: BackgroundTasks,  # FastAPI 自动注入
):
    # 添加后台任务
    background_tasks.add_task(
        write_log,  # 任务函数
        f"通知已发送到 {email}",  # 参数
    )

    # 响应立即返回，write_log 在后台执行
    return {"msg": "通知已发送"}

# 用户收到响应后，write_log 可能还没执行完
# 但用户不需要等待，体验更好
\`\`\`

## Demo 2：多个后台任务

\`\`\`python
def send_email(to: str, subject: str, body: str):
    print(f"📧 发送邮件到 {to}: {subject}")

def update_statistics(user_id: int):
    print(f"📊 更新用户 {user_id} 的统计数据")

def clean_cache():
    print("🧹 清理缓存")

@app.post("/register")
def register(
    username: str,
    background_tasks: BackgroundTasks,
):
    # 注册用户（同步操作）
    print(f"用户 {username} 注册成功")

    # 添加多个后台任务（它们会按顺序执行）
    background_tasks.add_task(send_email, username, "欢迎注册", "感谢注册！")
    background_tasks.add_task(update_statistics, 123)
    background_tasks.add_task(clean_cache)

    # 用户立即收到响应，后台任务在之后执行
    return {"msg": "注册成功"}
\`\`\`

## Demo 3：后台任务 + 异常处理

\`\`\`python
def risky_task(task_id: int):
    try:
        # 可能出错的操作
        if task_id == 0:
            raise ValueError("无效的任务 ID")
        print(f"任务 {task_id} 完成")
    except Exception as e:
        print(f"任务 {task_id} 失败: {e}")

@app.post("/tasks")
def create_task(
    task_id: int,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(risky_task, task_id)
    return {"msg": "任务已提交"}

# 注意：后台任务的异常不会影响主请求
# 主请求返回 200，但后台任务可能失败
# 需要自己处理异常，否则异常会丢失
\`\`\`

## Demo 4：用 Celery 做真正的后台任务

\`\`\`python
# 对于需要持久化、重试、定时触发的后台任务，用 Celery

# 安装：pip install celery redis
# 需要 Redis 作为消息队列

# tasks.py —— Celery 任务定义
from celery import Celery

# 创建 Celery 应用
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",   # 消息队列（Redis）
    backend="redis://localhost:6379/0",  # 结果存储
)

# 定义 Celery 任务
@celery_app.task
def send_welcome_email(email: str):
    # 模拟发送邮件（耗时操作）
    import time
    time.sleep(5)  # 模拟 5 秒的耗时操作
    print(f"欢迎邮件已发送到 {email}")
    return f"OK: {email}"

# main.py —— FastAPI 调用 Celery 任务
from tasks import send_welcome_email

@app.post("/register-celery")
def register_celery(username: str, email: str):
    # 发送到 Celery 队列，不阻塞请求
    task = send_welcome_email.delay(email)  # .delay() 异步发送
    return {
        "msg": "注册成功，欢迎邮件稍后发送",
        "task_id": task.id,  # Celery 任务 ID，可以查询进度
    }

# 启动 Celery worker：
# celery -A tasks worker --loglevel=info
\`\`\`

## Demo 5：BackgroundTasks vs Celery

\`\`\`python
# 什么时候用 BackgroundTasks，什么时候用 Celery？

# BackgroundTasks（轻量级）：
# ✅ 简单，不需要额外服务
# ✅ 适合短任务（几秒内完成）
# ❌ 服务重启后任务丢失
# ❌ 无法监控任务进度
# 场景：写日志、发简单通知、更新缓存

# Celery（重量级）：
# ✅ 任务持久化（重启不丢失）
# ✅ 重试机制（失败自动重试）
# ✅ 定时任务（cron 表达式）
# ✅ 监控任务进度
# ❌ 需要额外部署 Redis/RabbitMQ
# 场景：发邮件、处理大文件、定时任务、数据导出
\`\`\`

## 小结

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| BackgroundTasks | 轻量级后台操作 | 简单，无需额外服务 |
| Celery | 重量级异步任务 | 持久化、重试、定时、监控 |`
  },

  {
    id: "fc-test-deploy",
    group: "实战进阶",
    icon: "🚀",
    title: "测试与部署",
    content: `# 测试与部署

## 测试 API

FastAPI 基于 Starlette 的 TestClient，写测试非常简单。

## Demo 1：基本测试

\`\`\`python
# pip install httpx  # TestClient 基于 httpx
from fastapi.testclient import TestClient
from main import app  # 导入你的 FastAPI 应用

# TestClient 模拟 HTTP 请求，不需要启动服务器
client = TestClient(app)

# 测试 GET 请求
def test_read_root():
    response = client.get("/")  # 发送 GET 请求
    assert response.status_code == 200  # 断言状态码
    assert response.json() == {"msg": "Hello"}  # 断言响应 JSON

# 测试 POST 请求
def test_create_item():
    response = client.post(
        "/items",
        json={"name": "测试商品", "price": 9.99},  # JSON 请求体
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "测试商品"

# 运行测试：pytest test_main.py
\`\`\`

## Demo 2：测试带认证的路由

\`\`\`python
def test_protected_route():
    # 测试无 token 时返回 401
    response = client.get("/me")
    assert response.status_code == 401

    # 测试带有效 token
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200

    # 测试带无效 token
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer wrong-token"},
    )
    assert response.status_code == 401
\`\`\`

## Demo 3：测试数据库操作

\`\`\`python
# 用测试数据库，不影响生产数据
TEST_DATABASE_URL = "sqlite:///./test.db"

# 测试前创建表，测试后删除
def setup_module():
    Base.metadata.create_all(bind=engine)

def teardown_module():
    Base.metadata.drop_all(bind=engine)

def test_create_user():
    response = client.post(
        "/users",
        json={"name": "测试用户", "email": "test@test.com", "age": 25},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "测试用户"

def test_get_user():
    # 先创建一个用户
    client.post("/users", json={"name": "张三", "email": "zs@test.com", "age": 30})
    # 再查询
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["name"] == "张三"
\`\`\`

## Demo 4：部署到服务器

\`\`\`bash
# 方式一：直接用 uvicorn 启动（适合开发）
uvicorn main:app --host 0.0.0.0 --port 8000

# 方式二：用 gunicorn + uvicorn workers（适合生产）
# pip install gunicorn
gunicorn main:app \\
  --workers 4 \\           # 4 个工作进程
  --worker-class uvicorn.workers.UvicornWorker \\  # 使用 uvicorn worker
  --bind 0.0.0.0:8000     # 绑定地址和端口

# 方式三：用 Docker 部署
# Dockerfile
# FROM python:3.11-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install -r requirements.txt
# COPY . .
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# 构建和运行：
# docker build -t myapp .
# docker run -p 8000:8000 myapp
\`\`\`

## Demo 5：生产环境配置

\`\`\`python
# 用环境变量管理配置，不要把密钥写死在代码里
import os

# 敏感信息从环境变量读取
SECRET_KEY = os.getenv("SECRET_KEY", "default-dev-key")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# 启动时设置环境变量：
# 开发环境：
# uvicorn main:app --reload

# 生产环境：
# export SECRET_KEY=production-secret-key
# export DATABASE_URL=postgresql://user:pass@localhost/db
# gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
\`\`\`

## Demo 6：项目结构建议

\`\`\`python
# 推荐的项目目录结构（中型项目）
# myapp/
# ├── main.py          # 入口文件，创建 app 实例
# ├── models.py        # 数据库模型（SQLAlchemy）
# ├── schemas.py       # Pydantic 模型（请求/响应）
# ├── crud.py          # CRUD 操作函数
# ├── database.py      # 数据库连接配置
# ├── auth.py          # 认证相关（JWT）
# ├── routers/         # 路由模块
# │   ├── users.py     # 用户相关路由
# │   ├── items.py     # 商品相关路由
# │   └── auth.py      # 认证路由
# ├── dependencies.py  # 依赖注入函数
# ├── tests/           # 测试文件
# │   ├── test_users.py
# │   └── test_items.py
# ├── static/          # 静态文件
# ├── uploads/         # 上传文件
# └── requirements.txt # 依赖列表
\`\`\`

## 小结

| 环节 | 要点 |
|------|------|
| 测试 | TestClient 模拟请求，pytest 运行 |
| 部署 | uvicorn（开发）/ gunicorn（生产） |
| 配置 | 环境变量管理敏感信息 |
| 项目结构 | 按功能拆分模块 |
| Docker | 容器化部署，环境一致 |`
  },
];