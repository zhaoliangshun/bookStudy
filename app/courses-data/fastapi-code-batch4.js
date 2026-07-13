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
# python-jose：生成/验证 JWT token 的库
# passlib[bcrypt]：密码哈希库，使用 bcrypt 算法
# 导入 CryptContext，passlib 的密码哈希上下文类
from passlib.context import CryptContext

# 密码哈希上下文
# schemes=["bcrypt"]：指定使用 bcrypt 算法（安全性高，慢哈希防暴力破解）
# deprecated="auto"：自动处理旧算法的迁移
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 哈希密码（永远不要明文存储密码！）
# 参数 password: str 明文密码
# 返回值 str：哈希后的密码（形如 $2b$12$...）
def hash_password(password: str) -> str:
    # bcrypt 自动加盐（salt），相同密码每次哈希结果不同
    # salt 是随机字符串，拼接在密码前一起哈希，防止彩虹表攻击
    return pwd_context.hash(password)

# 验证密码
# 参数 plain_password: str 用户输入的明文密码
# 参数 hashed_password: str 数据库中存储的哈希值
# 返回值 bool：True 表示密码正确，False 表示密码错误
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 对比明文和哈希值
    # bcrypt 验证时会从 hashed_password 中提取 salt，重新哈希 plain_password 后对比
    return pwd_context.verify(plain_password, hashed_password)

# 测试
hashed = hash_password("123456")
# hashed = "$2b$12$..."  # 每次不同（因为 salt 是随机的）
# $2b$：bcrypt 算法版本
# $12$：成本因子（2^12 次哈希迭代，越大越安全也越慢）
# 后面 22 位是 salt，最后 31 位是哈希值
verify_password("123456", hashed)  # True：正确密码
verify_password("wrong", hashed)   # False：错误密码
\`\`\`

## Demo 2：生成 JWT Token

\`\`\`python
# 导入 datetime（时间点）和 timedelta（时间间隔）
# datetime 用于获取当前时间，timedelta 用于计算时间差
from datetime import datetime, timedelta
# 导入 jwt 模块，python-jose 库提供的 JWT 工具
from jose import jwt  # python-jose 库

# 密钥（生产环境用环境变量，不要硬编码！）
# SECRET_KEY 用来签名 token，泄露后攻击者可以伪造任意 token
SECRET_KEY = "your-secret-key-change-in-production"
# 签名算法：HS256（HMAC + SHA256），最常用的对称加密算法
ALGORITHM = "HS256"
# token 有效期 30 分钟，过期后需要重新登录
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 生成 access token 的函数
# 参数 data: dict 要写入 token 的数据（通常是用户标识）
# 参数 expires_delta: timedelta | None 过期时间间隔，None 表示用默认 15 分钟
# 返回值 str：编码后的 JWT 字符串
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    # 复制数据，避免修改原字典（防止副作用）
    to_encode = data.copy()

    # 设置过期时间
    # datetime.utcnow() 获取当前 UTC 时间（避免时区问题）
    if expires_delta:
        # 用传入的 expires_delta 计算过期时间
        expire = datetime.utcnow() + expires_delta
    else:
        # 默认 15 分钟后过期
        expire = datetime.utcnow() + timedelta(minutes=15)
    # exp 是 JWT 标准字段，表示过期时间（expiration）
    # JWT 标准字段还有：iat（签发时间）、sub（主题，通常是用户 ID）、iss（签发者）
    to_encode.update({"exp": expire})

    # 编码生成 token
    # jwt.encode 参数说明：
    # - to_encode：要编码的 payload 数据（dict）
    # - SECRET_KEY：签名密钥
    # - algorithm：签名算法
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 测试
token = create_access_token(data={"sub": "user123"})
# token = "eyJhbGciOi..."  # 三段式，用 . 分隔
# 第一段：header（算法信息），例如 {"alg": "HS256", "typ": "JWT"}
# 第二段：payload（数据，如 user123），Base64 编码，可以解码查看（不要放敏感信息！）
# 第三段：signature（签名，防篡改），用 SECRET_KEY + 算法生成
\`\`\`

## Demo 3：注册接口

\`\`\`python
# 导入 FastAPI（应用类）、Depends（依赖注入）、HTTPException（HTTP 异常）、status（状态码常量）
from fastapi import FastAPI, Depends, HTTPException, status
# 导入 BaseModel，Pydantic 模型基类，用于定义请求体结构
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 请求模型：注册接口的请求体结构
class UserRegister(BaseModel):
    username: str           # 必填：用户名
    password: str           # 必填：明文密码（哈希后存储）
    email: str | None = None  # 可选：邮箱，默认 None（str | None 表示可以是字符串或 None）

# 模拟数据库（生产环境用真实数据库如 PostgreSQL）
fake_users_db = {}

# @app.post 注册 POST 路由
# status_code=201：成功时返回 201 Created（201 表示资源已创建）
@app.post("/register", status_code=201)
# 参数 user: UserRegister FastAPI 自动解析 JSON 请求体到 UserRegister 模型
def register(user: UserRegister):
    # 检查用户名是否已存在
    if user.username in fake_users_db:
        # 400 Bad Request：客户端请求错误
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 哈希密码后存储（永远不要存明文密码！）
    hashed_password = hash_password(user.password)
    # 存入模拟数据库
    fake_users_db[user.username] = {
        "username": user.username,
        "hashed_password": hashed_password,  # 只存哈希值
        "email": user.email,
    }
    return {"msg": "注册成功"}
\`\`\`

## Demo 4：登录接口

\`\`\`python
# 登录请求模型
class UserLogin(BaseModel):
    username: str  # 必填：用户名
    password: str  # 必填：密码

# @app.post 注册 POST 路由（默认 status_code=200）
@app.post("/login")
# 参数 user: UserLogin FastAPI 自动解析 JSON 请求体
def login(user: UserLogin):
    # 1. 查找用户
    # dict.get(key) 找不到返回 None，不会报错
    db_user = fake_users_db.get(user.username)
    if not db_user:
        # 401 Unauthorized：未授权
        # 注意：不要说"用户不存在"，统一返回"用户名或密码错误"防止枚举攻击
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 2. 验证密码
    # verify_password 对比明文和哈希值
    if not verify_password(user.password, db_user["hashed_password"]):
        # 密码错误也返回相同信息（防枚举攻击）
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 3. 生成 token（sub 是 JWT 标准字段，表示"主题"即用户标识）
    # sub 通常存用户 ID 或用户名，后续通过它识别用户
    access_token = create_access_token(
        data={"sub": user.username},
        # expires_delta：token 有效期，30 分钟后过期
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # 返回 token 和类型
    # token_type="bearer" 是 OAuth2 标准，前端访问受保护接口时要带：
    # Authorization: Bearer <access_token>
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

## Demo 5：Token 认证依赖

\`\`\`python
# 导入 OAuth2PasswordBearer，OAuth2 密码模式的 token 提取器
# 它会自动从请求头 Authorization: Bearer xxx 中提取 token
from fastapi.security import OAuth2PasswordBearer

# OAuth2PasswordBearer 告诉 FastAPI 从请求头获取 token
# tokenUrl="/login"：登录接口路径，用于在 /docs 文档页面显示"Authorize"按钮
# 这个路径不影响实际逻辑，只是给 OpenAPI 文档用的
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# 认证依赖：验证 token 有效性
# 参数 token: str = Depends(oauth2_scheme)
# - Depends(oauth2_scheme) 自动从请求头提取 token 并赋给 token 参数
# 返回值 dict：当前用户信息（给路由函数使用）
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # 解码 token
        # jwt.decode 参数说明：
        # - token：JWT 字符串
        # - SECRET_KEY：签名密钥（用于验证签名）
        # - algorithms：允许的算法列表（必须是列表）
        # 解码时会自动验证签名和过期时间
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # 提取用户名（sub 字段）
        username: str = payload.get("sub")  # 提取用户名
        if username is None:
            # token 中没有 sub 字段，说明 token 不合法
            raise HTTPException(status_code=401, detail="无效的令牌")
    except jwt.ExpiredSignatureError:
        # token 已过期
        raise HTTPException(status_code=401, detail="令牌已过期")
    except jwt.JWTError:
        # 其他 JWT 错误（签名错误、格式错误等）
        raise HTTPException(status_code=401, detail="无效的令牌")

    # 查找用户（token 有效但用户可能已被删除）
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user  # 返回用户信息给路由函数

# 使用认证保护路由
@app.get("/me")
# 参数 current_user: dict = Depends(get_current_user)
# - FastAPI 会先调用 get_current_user，把它返回的 user 赋给 current_user
# - 如果 get_current_user 抛异常（401），请求不会到达 read_me
def read_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "email": current_user["email"]}

# 测试：
# 1. 登录获取 token：POST /login → {"access_token":"xxx"}
# 2. 用 token 访问：GET /me -H "Authorization: Bearer xxx"
# 不带 token 或 token 无效 → 401
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
# 导入 FastAPI 应用类
from fastapi import FastAPI
# 导入 FileResponse，用于返回文件给客户端下载
from fastapi.responses import FileResponse

# 创建应用实例
app = FastAPI()

# 返回文件给用户下载
# @app.get 注册 GET 路由，{filename} 是路径参数
@app.get("/download/{filename}")
# 参数 filename: str 路径参数，自动从 URL 提取
def download_file(filename: str):
    # f-string 拼接文件路径
    file_path = f"uploads/{filename}"
    # FileResponse 参数说明：
    # - path：服务器上文件的路径
    # - filename：下载时浏览器显示的文件名（Content-Disposition 头）
    # - media_type：MIME 类型，application/octet-stream 表示二进制流
    #   浏览器收到这个类型会触发下载而不是显示
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
# 导入 Image，Pillow 的核心类，用于打开和操作图片
from PIL import Image
# 导入 io，Python 标准库，提供 BytesIO（内存中的字节流）
# BytesIO 让图片数据在内存中操作，不需要写临时文件
import io

# 缩略图尺寸（宽，高）
THUMB_SIZE = (200, 200)  # 缩略图尺寸

# @app.post 注册 POST 路由
# async def 异步函数，因为文件读取是异步操作
@app.post("/upload-image")
# 参数 file: UploadFile = File() 接收上传的文件
async def upload_image(file: UploadFile = File()):
    # 读取上传的图片
    # await file.read() 异步读取全部字节内容到内存
    content = await file.read()

    # 用 Pillow 打开图片
    # io.BytesIO(content) 把字节流转成类文件对象，Pillow 才能打开
    image = Image.open(io.BytesIO(content))

    # 生成缩略图
    # thumbnail 方法会等比缩放，不会拉伸变形
    # 缩放后图片尺寸不超过 (200, 200)
    image.thumbnail(THUMB_SIZE)  # 等比缩放，不超过 200x200

    # 保存缩略图到内存中的字节流
    thumb_bytes = io.BytesIO()
    # image.save 参数说明：
    # - thumb_bytes：输出流（保存位置）
    # - format="JPEG"：输出格式
    # - quality=85：JPEG 质量（1-100，85 是质量和体积的平衡点）
    image.save(thumb_bytes, format="JPEG", quality=85)

    # 保存原图到磁盘
    # "wb" 表示二进制写入模式（图片是二进制数据）
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(content)

    # 保存缩略图到磁盘
    thumb_name = f"thumb_{file.filename}"
    # thumb_bytes.getvalue() 获取字节流中的全部内容
    with open(f"uploads/{thumb_name}", "wb") as f:
        f.write(thumb_bytes.getvalue())

    return {
        "original": file.filename,        # 原图文件名
        "thumbnail": thumb_name,          # 缩略图文件名
        "original_size": len(content),    # 原图大小（字节）
        "thumb_size": len(thumb_bytes.getvalue()),  # 缩略图大小
    }
\`\`\`

## Demo 3：静态文件服务

\`\`\`python
# 导入 StaticFiles，FastAPI 的静态文件服务类
from fastapi.staticfiles import StaticFiles

# 挂载静态文件目录
# app.mount 参数说明：
# - "/static"：URL 路径前缀，访问 /static/xxx 会映射到静态目录
# - StaticFiles(directory="static")：指定静态文件所在目录
# - name="static"：路由名称（用于反向查找 URL）
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
# 注意：如果 static/ 目录不存在，启动会报错
# 可以用 StaticFiles(directory="static", check_dir=False) 延迟检查
\`\`\`

## Demo 4：文件类型校验

\`\`\`python
# 允许的文件类型映射：MIME 类型 → 扩展名
# MIME 类型是 HTTP 中标识文件类型的标准（Content-Type 头）
ALLOWED_TYPES = {
    "image/jpeg": "jpg",   # JPEG 图片
    "image/png": "png",    # PNG 图片
    "image/gif": "gif",    # GIF 图片
    "image/webp": "webp",  # WebP 图片（现代格式，体积更小）
}

# 最大文件大小：10MB
# 10 * 1024 * 1024 = 10,485,760 字节
# 注意：不要用 10 * 1000 * 1000，文件大小用 1024 进制
MAX_SIZE = 10 * 1024 * 1024  # 10MB

# @app.post 注册 POST 路由
@app.post("/upload-safe")
# async def 异步函数
# 参数 file: UploadFile = File() 接收上传的文件
async def upload_safe(file: UploadFile = File()):
    # 1. 校验文件类型（通过 MIME 类型）
    # file.content_type 是浏览器上传时声明的 MIME 类型
    if file.content_type not in ALLOWED_TYPES:
        # 400 Bad Request：客户端请求错误
        # ', '.join(...) 把允许的类型用逗号拼起来显示
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型：{file.content_type}。仅支持：{', '.join(ALLOWED_TYPES.keys())}",
        )

    # 2. 校验文件大小
    # 必须先读取才能知道大小
    content = await file.read()
    if len(content) > MAX_SIZE:
        # 413 Payload Too Large：请求体过大
        raise HTTPException(
            status_code=413,
            detail=f"文件过大：{len(content)} 字节。最大允许：{MAX_SIZE} 字节",
        )

    # 3. 保存文件
    ext = ALLOWED_TYPES[file.content_type]  # 根据 MIME 类型获取扩展名
    # uuid.uuid4() 生成随机 UUID（通用唯一标识符）
    # 用 UUID 作为文件名避免：
    # - 用户上传同名文件覆盖
    # - 文件名包含特殊字符或中文导致问题
    # - 文件名注入攻击（如 ../../etc/passwd）
    filename = f"{uuid.uuid4()}.{ext}"      # 用 UUID 避免文件名冲突
    save_path = f"uploads/{filename}"

    # 保存到磁盘
    with open(save_path, "wb") as f:
        f.write(content)

    return {"filename": filename, "size": len(content)}
\`\`\`

## Demo 5：流式返回大文件

\`\`\`python
# 导入 StreamingResponse，用于流式返回响应
# 流式返回：数据一块一块地发送，不需要全部加载到内存
from fastapi.responses import StreamingResponse

# 生成器函数：每次读取一块数据
# 参数 file_path: str 文件路径
# 参数 chunk_size: int 每次读取的字节数，默认 1MB（1024*1024 字节）
def file_iterator(file_path: str, chunk_size: int = 1024 * 1024):
    # 生成器函数：每次读取一块，不一次性加载到内存
    # "rb" 表示二进制读取模式
    with open(file_path, "rb") as f:
        while True:
            # 每次读 chunk_size 字节
            chunk = f.read(chunk_size)  # 每次读 1MB
            # 读到空表示文件结束
            if not chunk:
                break
            # yield 返回一块数据，暂停函数
            # 下次迭代时从 yield 后继续执行
            yield chunk  # yield 返回一块数据

# @app.get 注册 GET 路由
@app.get("/stream/{filename}")
# 参数 filename: str 路径参数
def stream_file(filename: str):
    file_path = f"uploads/{filename}"
    # StreamingResponse 参数说明：
    # - file_iterator(file_path)：生成器，逐块产生数据
    # - media_type：MIME 类型，application/octet-stream 触发下载
    # - headers：自定义响应头
    #   Content-Disposition: attachment 让浏览器下载而不是显示
    return StreamingResponse(
        file_iterator(file_path),  # 传入生成器
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

# StreamingResponse 适合大文件（几百 MB 甚至 GB）
# 不会一次性加载到内存，节省服务器资源
# 对比 FileResponse：FileResponse 也支持大文件，但 StreamingResponse 更灵活
# 可以从任何迭代器返回数据（不只是文件）
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
# 导入 FastAPI（应用类）和 BackgroundTasks（后台任务类）
from fastapi import FastAPI, BackgroundTasks

# 创建应用实例
app = FastAPI()

# 后台任务函数：普通函数，不需要 async
# 参数 message: str 要写入日志的消息
def write_log(message: str):
    # 模拟耗时操作（写日志）
    # "a" 表示追加模式（append），不会覆盖原文件
    with open("app.log", "a") as f:
        # \\n 是换行符（在 JS 模板字符串中需要转义）
        f.write(f"{message}\\n")

# @app.post 注册 POST 路由
@app.post("/send-notification")
# 参数说明：
# - email: str 查询参数（来自 URL ?email=xxx）
# - background_tasks: BackgroundTasks FastAPI 自动注入的实例
#   不需要 = Depends()，FastAPI 看到类型就自动注入
def send_notification(
    email: str,
    background_tasks: BackgroundTasks,  # FastAPI 自动注入
):
    # 添加后台任务
    # add_task 参数说明：
    # - 第一个参数：任务函数（不要加括号，传函数本身）
    # - 后面的参数：传给任务函数的参数
    background_tasks.add_task(
        write_log,  # 任务函数
        f"通知已发送到 {email}",  # 参数
    )

    # 响应立即返回，write_log 在后台执行
    return {"msg": "通知已发送"}

# 用户收到响应后，write_log 可能还没执行完
# 但用户不需要等待，体验更好
# 注意：后台任务在响应发送后执行，如果任务抛异常用户感知不到
\`\`\`

## Demo 2：多个后台任务

\`\`\`python
# 后台任务函数 1：发送邮件
# 参数 to: str 收件人邮箱
# 参数 subject: str 邮件主题
# 参数 body: str 邮件正文
def send_email(to: str, subject: str, body: str):
    print(f"📧 发送邮件到 {to}: {subject}")

# 后台任务函数 2：更新统计
# 参数 user_id: int 用户 ID
def update_statistics(user_id: int):
    print(f"📊 更新用户 {user_id} 的统计数据")

# 后台任务函数 3：清理缓存（无参数）
def clean_cache():
    print("🧹 清理缓存")

# @app.post 注册 POST 路由
@app.post("/register")
# 参数说明：
# - username: str 查询参数
# - background_tasks: BackgroundTasks 后台任务管理器
def register(
    username: str,
    background_tasks: BackgroundTasks,
):
    # 注册用户（同步操作）
    print(f"用户 {username} 注册成功")

    # 添加多个后台任务（它们会按顺序执行）
    # add_task(函数, 参数1, 参数2, ...) 把任务加入队列
    # 多个任务按添加顺序依次执行（不是并发）
    background_tasks.add_task(send_email, username, "欢迎注册", "感谢注册！")
    background_tasks.add_task(update_statistics, 123)
    background_tasks.add_task(clean_cache)  # 无参数任务

    # 用户立即收到响应，后台任务在之后执行
    return {"msg": "注册成功"}
\`\`\`

## Demo 3：后台任务 + 异常处理

\`\`\`python
# 后台任务函数：可能会出错的任务
# 参数 task_id: int 任务 ID
def risky_task(task_id: int):
    try:
        # 可能出错的操作
        # task_id == 0 时抛出异常模拟错误
        if task_id == 0:
            # ValueError：值错误异常（Python 内置）
            raise ValueError("无效的任务 ID")
        print(f"任务 {task_id} 完成")
    except Exception as e:
        # 必须在任务函数内部捕获异常！
        # 后台任务的异常不会传播到主请求，如果不捕获就会丢失
        print(f"任务 {task_id} 失败: {e}")

# @app.post 注册 POST 路由
@app.post("/tasks")
# 参数说明：
# - task_id: int 查询参数
# - background_tasks: BackgroundTasks 后台任务管理器
def create_task(
    task_id: int,
    background_tasks: BackgroundTasks,
):
    # 添加后台任务
    background_tasks.add_task(risky_task, task_id)
    return {"msg": "任务已提交"}

# 注意：后台任务的异常不会影响主请求
# 主请求返回 200，但后台任务可能失败
# 需要自己处理异常，否则异常会丢失（用户感知不到）
# 如果任务很重要（如发邮件），应该用 Celery 而不是 BackgroundTasks
\`\`\`

## Demo 4：用 Celery 做真正的后台任务

\`\`\`python
# 对于需要持久化、重试、定时触发的后台任务，用 Celery
# Celery 是 Python 最流行的分布式任务队列

# 安装：pip install celery redis
# 需要 Redis 作为消息队列（broker）

# tasks.py —— Celery 任务定义
# 导入 Celery 类，Celery 任务的入口
from celery import Celery

# 创建 Celery 应用
# Celery 参数说明：
# - "tasks"：应用名称
# - broker：消息队列地址，任务通过它传递
#   redis://localhost:6379/0 表示 Redis 的 0 号数据库
# - backend：结果存储地址，任务执行结果存在这里
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",   # 消息队列（Redis）
    backend="redis://localhost:6379/0",  # 结果存储
)

# 定义 Celery 任务
# @celery_app.task 装饰器把普通函数变成 Celery 任务
# 装饰后可以用 .delay() 异步调用
@celery_app.task
# 参数 email: str 收件人邮箱
def send_welcome_email(email: str):
    # 模拟发送邮件（耗时操作）
    import time
    # time.sleep(5) 阻塞 5 秒模拟耗时操作
    # Celery 任务在独立进程执行，阻塞不影响 FastAPI
    time.sleep(5)  # 模拟 5 秒的耗时操作
    print(f"欢迎邮件已发送到 {email}")
    return f"OK: {email}"  # 返回值会存到 backend

# main.py —— FastAPI 调用 Celery 任务
# 从 tasks 模块导入 Celery 任务（需要在单独的文件定义）
from tasks import send_welcome_email

# @app.post 注册 POST 路由
@app.post("/register-celery")
# 参数说明：
# - username: str 用户名（查询参数）
# - email: str 邮箱（查询参数）
def register_celery(username: str, email: str):
    # 发送到 Celery 队列，不阻塞请求
    # .delay() 是 .apply_async() 的快捷方式
    # 立即返回 AsyncResult 对象，任务在 Celery worker 中执行
    task = send_welcome_email.delay(email)  # .delay() 异步发送
    return {
        "msg": "注册成功，欢迎邮件稍后发送",
        "task_id": task.id,  # Celery 任务 ID，可以查询进度
        # 可以用 task.status 查询状态（PENDING/STARTED/SUCCESS/FAILURE）
        # 可以用 task.result 获取结果（任务完成后）
    }

# 启动 Celery worker：
# celery -A tasks worker --loglevel=info
# -A tasks：指定应用模块
# worker：启动 worker 进程
# --loglevel=info：日志级别
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
# 导入 TestClient，FastAPI 的测试客户端
# TestClient 模拟 HTTP 请求，不需要真正启动服务器
from fastapi.testclient import TestClient
# 从 main 模块导入 app（你的 FastAPI 应用实例）
from main import app  # 导入你的 FastAPI 应用

# TestClient 模拟 HTTP 请求，不需要启动服务器
# client 是测试客户端，用法类似 requests 库
client = TestClient(app)

# 测试函数：以 test_ 开头，pytest 会自动发现并执行
# 测试 GET 请求
def test_read_root():
    # client.get("/") 发送 GET 请求到根路径
    response = client.get("/")  # 发送 GET 请求
    # assert 断言，条件为 False 时测试失败
    assert response.status_code == 200  # 断言状态码
    # response.json() 解析响应体为 dict
    assert response.json() == {"msg": "Hello"}  # 断言响应 JSON

# 测试 POST 请求
def test_create_item():
    # client.post 发送 POST 请求
    # json= 参数会自动设置 Content-Type: application/json
    response = client.post(
        "/items",
        json={"name": "测试商品", "price": 9.99},  # JSON 请求体
    )
    assert response.status_code == 201  # 201 Created
    data = response.json()
    assert data["name"] == "测试商品"  # 断言返回的商品名

# 运行测试：pytest test_main.py
# pytest 会自动收集所有 test_ 开头的函数并执行
\`\`\`

## Demo 2：测试带认证的路由

\`\`\`python
# 测试受保护的路由（需要认证）
def test_protected_route():
    # 测试无 token 时返回 401
    # 不带 Authorization 头访问受保护路由
    response = client.get("/me")
    # 401 Unauthorized：未认证
    assert response.status_code == 401

    # 测试带有效 token
    # headers= 参数设置请求头
    # Authorization: Bearer <token> 是 OAuth2 标准格式
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer valid-token"},
    )
    # 200 OK：认证成功
    assert response.status_code == 200

    # 测试带无效 token
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer wrong-token"},
    )
    # 401：token 无效
    assert response.status_code == 401

# 注意：测试带认证的路由时，可以 mock get_current_user 依赖
# 用 app.dependency_overrides[get_current_user] = lambda: fake_user
# 这样就不需要真的生成 token
\`\`\`

## Demo 3：测试数据库操作

\`\`\`python
# 用测试数据库，不影响生产数据
# sqlite:///./test.db 表示当前目录下的 test.db 文件
TEST_DATABASE_URL = "sqlite:///./test.db"

# pytest 的模块级 fixture（夹具）
# setup_module：模块开始执行前调用一次
# teardown_module：模块所有测试执行完后调用一次
# 测试前创建表，测试后删除
def setup_module():
    # Base.metadata.create_all 创建所有继承 Base 的模型对应的表
    # bind=engine 绑定引擎（指定在哪个数据库创建）
    Base.metadata.create_all(bind=engine)

def teardown_module():
    # Base.metadata.drop_all 删除所有表
    # 保证每个测试模块开始时数据库是干净的
    Base.metadata.drop_all(bind=engine)

# 测试创建用户
def test_create_user():
    response = client.post(
        "/users",
        # JSON 请求体
        json={"name": "测试用户", "email": "test@test.com", "age": 25},
    )
    assert response.status_code == 201  # 201 Created
    assert response.json()["name"] == "测试用户"

# 测试查询用户
def test_get_user():
    # 先创建一个用户（前置条件）
    client.post("/users", json={"name": "张三", "email": "zs@test.com", "age": 30})
    # 再查询 /users/1（ID 为 1 的用户）
    response = client.get("/users/1")
    assert response.status_code == 200  # 200 OK
    assert response.json()["name"] == "张三"
\`\`\`

## Demo 4：部署到服务器

\`\`\`bash
# 方式一：直接用 uvicorn 启动（适合开发）
# uvicorn 是 ASGI 服务器，用于运行 FastAPI 应用
# main:app 表示 main.py 文件中的 app 变量
# --host 0.0.0.0 监听所有网络接口（允许外部访问）
# --port 8000 监听 8000 端口
uvicorn main:app --host 0.0.0.0 --port 8000

# 方式二：用 gunicorn + uvicorn workers（适合生产）
# pip install gunicorn
# gunicorn 是 WSGI/ASGI 服务器，支持多进程管理
# gunicorn 比 uvicorn 更稳定，支持进程重启、平滑升级
gunicorn main:app \\
  --workers 4 \\           # 4 个工作进程（通常设为 CPU 核心数 * 2 + 1）
  --worker-class uvicorn.workers.UvicornWorker \\  # 使用 uvicorn worker（处理异步）
  --bind 0.0.0.0:8000     # 绑定地址和端口

# 方式三：用 Docker 部署
# Dockerfile 内容说明：
# FROM python:3.11-slim  基于 Python 3.11 精简镜像
# WORKDIR /app           设置工作目录
# COPY requirements.txt . 复制依赖文件（利用 Docker 缓存层）
# RUN pip install -r requirements.txt  安装依赖
# COPY . .               复制项目代码
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]  启动命令

# 构建和运行：
# docker build -t myapp .  构建 Docker 镜像，命名为 myapp
# docker run -p 8000:8000 myapp  运行容器，端口映射 8000
\`\`\`

## Demo 5：生产环境配置

\`\`\`python
# 用环境变量管理配置，不要把密钥写死在代码里
# 导入 os，Python 标准库，用于读取环境变量
import os

# os.getenv(key, default) 读取环境变量
# - key：环境变量名
# - default：如果环境变量不存在，返回的默认值
# 敏感信息从环境变量读取
# SECRET_KEY：JWT 签名密钥，生产环境必须设置
SECRET_KEY = os.getenv("SECRET_KEY", "default-dev-key")
# DATABASE_URL：数据库连接地址
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
# DEBUG：是否开启调试模式
# os.getenv 返回字符串，需要和 "true" 比较转成布尔值
# .lower() 把字符串转小写，兼容 "True"/"TRUE"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# 启动时设置环境变量：
# 开发环境：
# uvicorn main:app --reload
# --reload：代码修改后自动重启（仅开发用）

# 生产环境：
# export SECRET_KEY=production-secret-key
# export DATABASE_URL=postgresql://user:pass@localhost/db
# gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
# 注意：export 只在当前 shell 有效，永久生效需写入 ~/.bashrc 或用 systemd
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