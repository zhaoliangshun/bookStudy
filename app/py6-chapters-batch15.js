export const chapters = [
  {
    id: "py6-flask-basic",
    group: "Web 与爬虫实战",
    icon: "🌶️",
    title: "Flask Web 框架入门",
    content: `## Flask Web 框架入门

### 一、Flask 的哲学：微框架

Flask 是 Python 最流行的 Web 框架之一，由 Armin Ronacher 开发。它的核心设计哲学是 **"微框架"（Microframework）**：

- **最小化核心**：只提供路由、请求/响应封装，其余功能通过扩展实现
- **不做假设**：不强制数据库、表单验证、模板引擎的选择
- **可扩展**：需要什么功能，安装对应扩展即可

Flask 自身仅依赖两个库：**Werkzeug**（WSGI 工具集）和 **Jinja2**（模板引擎）。这种"小核心 + 大生态"的设计让它既适合快速原型，也能支撑大型项目。

> 💡 **避坑提示**："微"不等于"弱"。Flask 的生态非常丰富，Flask-SQLAlchemy、Flask-Login、Flask-WTF 等扩展组合起来，能力不亚于 Django。区别在于：Flask 让你**自己选择**组件，Django **替你选好**了。

### 二、安装与 Hello World

\`\`\`bash
pip install flask
\`\`\`

最简 Flask 应用只需 5 行：

\`\`\`python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, Flask!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
\`\`\`

运行后访问 \`http://127.0.0.1:5000/\` 即可看到输出。\`debug=True\` 开启调试模式：代码修改后自动重载，出错时在浏览器显示堆栈。

### 三、路由系统

路由将 URL 映射到 Python 函数。Flask 用装饰器 \`@app.route\` 注册路由：

\`\`\`python
# 静态路由
@app.route("/about")
def about():
    return "关于我们"

# 动态路由：从 URL 提取参数
@app.route("/user/<username>")
def user_profile(username):
    return f"用户: {username}"

# 类型转换器
@app.route("/post/<int:post_id>")
def show_post(post_id):
    return f"文章 #{post_id}"

# 支持的类型：string(默认)、int、float、path、uuid
@app.route("/download/<path:filepath>")
def download(filepath):
    return f"下载: {filepath}"
\`\`\`

路由也可以用 \`add_url_rule\` 注册，效果相同：

\`\`\`python
def index():
    return "首页"
app.add_url_rule("/", "index", index)
\`\`\`

### 四、请求对象 request

Flask 的 \`request\` 对象是**线程安全的代理**，封装了当前请求的所有数据：

\`\`\`python
from flask import request

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # 表单数据（POST body, application/x-www-form-urlencoded）
        username = request.form.get("username")
        password = request.form.get("password")
        return f"登录: {username}"

    # 查询参数 (?name=alice&age=18)
    name = request.args.get("name", "匿名")
    return f"GET 请求, name={name}"

@app.route("/api/json", methods=["POST"])
def api_json():
    # JSON 请求体
    data = request.get_json()
    return {"received": data}

@app.route("/headers")
def headers():
    # 请求头
    ua = request.headers.get("User-Agent")
    return f"UA: {ua}"
\`\`\`

| 属性 | 数据来源 | 示例 |
|------|----------|------|
| request.args | URL 查询参数 | ?page=2 |
| request.form | POST 表单 | username=alice |
| request.json | POST JSON body | {"key":"val"} |
| request.data | 原始 body | bytes |
| request.headers | 请求头 | User-Agent |
| request.cookies | Cookie | session=xxx |
| request.files | 上传文件 | avatar.png |

### 五、响应与 jsonify

视图函数的返回值会被 Flask 自动转为响应对象：

- \`str\` → 200 text/html
- \`dict\` / \`list\` → 200 application/json
- \`tuple\` → (body, status) 或 (body, headers) 或 (body, status, headers)

\`\`\`python
from flask import jsonify, make_response, Response

# 返回 JSON
@app.route("/api/users")
def users():
    return jsonify([{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}])

# 自定义状态码
@app.route("/create", methods=["POST"])
def create():
    return {"id": 100}, 201

# 自定义响应头
@app.route("/custom")
def custom():
    return "hi", 202, {"X-Custom": "value"}

# 完全控制：make_response
@app.route("/cookie")
def set_cookie():
    resp = make_response("设置 Cookie")
    resp.set_cookie("token", "abc123", httponly=True, max_age=3600)
    return resp
\`\`\`

### 六、模板引擎 Jinja2

Flask 集成 Jinja2 模板，默认从 \`templates/\` 目录读取：

\`\`\`html
<!-- templates/user.html -->
<!DOCTYPE html>
<html>
<body>
  <h1>{{ user.name }}</h1>
  <p>年龄: {{ user.age }}</p>
  {% if user.age >= 18 %}
    <span>成年人</span>
  {% else %}
    <span>未成年</span>
  {% endif %}
  <ul>
    {% for hobby in user.hobbies %}
      <li>{{ hobby }}</li>
    {% endfor %}
  </ul>
</body>
</html>
\`\`\`

视图函数用 \`render_template\` 渲染：

\`\`\`python
from flask import render_template

@app.route("/user/<name>")
def show_user(name):
    user = {"name": name, "age": 20, "hobbies": ["读书", "编程"]}
    return render_template("user.html", user=user)
\`\`\`

Jinja2 核心语法：
- \`{{ variable }}\`：变量输出
- \`{% if %}\` / \`{% for %}\`：控制结构
- \`{{ variable | filter }}\`：过滤器（upper、default、length）
- \`{% extends "base.html" %}\`：模板继承
- \`{% block content %}\`：块占位

### 七、蓝图 Blueprint：模块化

当项目变大，所有路由写在一个文件不现实。Blueprint 允许把路由分组到独立模块：

\`\`\`python
# auth.py
from flask import Blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login")
def login():
    return "登录页"

# app.py
from flask import Flask
from auth import auth_bp
app = Flask(__name__)
app.register_blueprint(auth_bp)
# 现在 /auth/login 路由生效
\`\`\`

### 八、业务场景

- **内部工具 / 后台面板**：快速搭建，灵活定制
- **RESTful API 服务**：配合 Flask-RESTful 或纯 jsonify
- **微服务后端**：轻量、启动快，适合容器化
- **原型验证**：几行代码即可跑起来

### 九、Flask vs Django 对比

| 维度 | Flask | Django |
|------|-------|--------|
| 定位 | 微框架 | 全栈框架 |
| ORM | 无内置（用 SQLAlchemy） | 内置 Django ORM |
| 模板 | Jinja2 | DTL（类似 Jinja2） |
| Admin | 无 | 内置强大 admin |
| 表单 | Flask-WTF 扩展 | 内置 forms |
| 路由 | 装饰器 | urls.py 列表 |
| 学习曲线 | 平缓 | 较陡 |
| 适合场景 | API、微服务、定制 | CMS、电商、社交 |

> ⚠️ **避坑提示**：Flask 的 \`app.run()\` 开发服务器**绝不能用于生产**。生产环境用 Gunicorn + Gevent/多 worker 部署：\`gunicorn -w 4 -b 0.0.0.0:8000 app:app\`。

### 十、原理深入：WSGI 应用

Flask 应用本身是一个 **WSGI 应用**。WSGI（PEP 3333）是 Python Web 服务器与应用之间的标准接口：

\`\`\`python
# Flask app 本质是一个可调用对象
def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"Hello World"]
\`\`\`

Flask 的 \`app\` 对象实现了 \`__call__(environ, start_response)\`，内部完成：URL 路由匹配 → 调用视图函数 → 包装响应 → 调用 start_response。

### 十一、最佳实践总结

- 用 \`Application Factory\` 模式（工厂函数创建 app）便于测试和多实例
- 配置用 \`app.config.from_object\`，区分开发/测试/生产
- 路由按 Blueprint 分组，避免单文件膨胀
- 生产环境必须用 Gunicorn/uWSGI 部署，禁用 \`app.run()\`
- 开启 \`debug=True\` 仅限开发，生产关闭
- 用 Flask-Migrate 管理 SQLAlchemy 数据库迁移`,
    code: `# Flask 概念演示：用标准库模拟 Web 框架核心概念
# 不依赖 Flask，用 http.server + wsgiref 演示

print("=== Flask Web 框架概念演示 ===\\n")

# --- 1. 模拟 Flask 路由装饰器 ---
print("--- 1. 模拟 Flask 路由系统 ---")

class MiniFlask:
    """用标准库模拟 Flask 的路由与 WSGI 接口"""
    def __init__(self, name):
        self.name = name
        self.routes = {}  # URL -> handler

    def route(self, path, methods=None):
        """路由装饰器，等价于 @app.route"""
        def decorator(func):
            self.routes[path] = {"func": func, "methods": methods or ["GET"]}
            return func
        return decorator

    def match(self, path, method="GET"):
        """模拟 URL 匹配"""
        if path in self.routes:
            rule = self.routes[path]
            if method in rule["methods"]:
                return rule["func"]()
            return "405 Method Not Allowed"
        return "404 Not Found"

app = MiniFlask("demo")

@app.route("/")
def index():
    return "Hello, Flask!"

@app.route("/about")
def about():
    return "关于我们"

@app.route("/api/users", methods=["GET", "POST"])
def users():
    return '{"users": ["Alice", "Bob"]}'

for path, method in [("/", "GET"), ("/about", "GET"), ("/api/users", "POST"), ("/nope", "GET")]:
    result = app.match(path, method)
    print(f"  {method} {path} -> {result}")

# --- 2. 模拟 request 对象 ---
print("\\n--- 2. 模拟 request 请求对象 ---")

class MockRequest:
    """模拟 flask.request 的核心属性"""
    def __init__(self, args=None, form=None, json=None, headers=None):
        self.args = args or {}
        self.form = form or {}
        self._json = json
        self.headers = headers or {}

    def get_json(self):
        return self._json

# 模拟 GET /search?q=python&page=2
req = MockRequest(args={"q": "python", "page": "2"})
print(f"  GET 参数: q={req.args.get('q')}, page={req.args.get('page')}")

# 模拟 POST 表单
req2 = MockRequest(form={"username": "alice", "password": "123"})
print(f"  POST 表单: user={req2.form.get('username')}")

# 模拟 JSON 请求
req3 = MockRequest(json={"name": "Bob", "age": 25})
data = req3.get_json()
print(f"  JSON: name={data['name']}, age={data['age']}")

# --- 3. 模拟 jsonify 响应 ---
print("\\n--- 3. 模拟 jsonify 与响应 ---")

import json

def jsonify(obj):
    """模拟 flask.jsonify"""
    return json.dumps(obj, ensure_ascii=False), "application/json"

def make_response(body, status=200, headers=None):
    """模拟 flask.make_response"""
    return {"body": body, "status": status, "headers": headers or {}}

body, ctype = jsonify({"id": 1, "name": "Alice"})
print(f"  JSON 响应: {body} (Content-Type: {ctype})")

resp = make_response("创建成功", 201, {"Location": "/api/users/1"})
print(f"  自定义响应: status={resp['status']}, body={resp['body']}")

# --- 4. 模拟 Blueprint 模块化 ---
print("\\n--- 4. 模拟 Blueprint 蓝图 ---")

class Blueprint:
    def __init__(self, name, url_prefix=""):
        self.name = name
        self.url_prefix = url_prefix
        self.routes = {}

    def route(self, path):
        def decorator(func):
            full_path = self.url_prefix + path
            self.routes[full_path] = func
            return func
        return decorator

auth_bp = Blueprint("auth", url_prefix="/auth")

@auth_bp.route("/login")
def login():
    return "登录页"

@auth_bp.route("/logout")
def logout():
    return "已登出"

print(f"  蓝图 '{auth_bp.name}' 注册的路由:")
for path, func in auth_bp.routes.items():
    print(f"    {path} -> {func()}")

# --- 5. WSGI 应用接口演示 ---
print("\\n--- 5. WSGI 应用接口（Flask 底层） ---")

def wsgi_app(environ, start_response):
    """标准 WSGI 应用：这就是 Flask app 的底层接口"""
    path = environ.get("PATH_INFO", "/")
    method = environ.get("REQUEST_METHOD", "GET")

    if path == "/" and method == "GET":
        start_response("200 OK", [("Content-Type", "text/plain")])
        return [b"Hello from WSGI!"]
    elif path == "/api" and method == "GET":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [b'{"msg": "ok"}']
    else:
        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"Not Found"]

# 模拟 WSGI 服务器调用
captured = {}
def mock_start_response(status, headers):
    captured["status"] = status
    captured["headers"] = headers

for env in [
    {"PATH_INFO": "/", "REQUEST_METHOD": "GET"},
    {"PATH_INFO": "/api", "REQUEST_METHOD": "GET"},
    {"PATH_INFO": "/nope", "REQUEST_METHOD": "GET"},
]:
    body = wsgi_app(env, mock_start_response)
    print(f"  {env['PATH_INFO']} -> {captured['status']}: {body[0].decode()}")

# --- 6. 最佳实践总结 ---
print("\\n--- 6. Flask 最佳实践 ---")
tips = [
    "生产环境用 Gunicorn 部署，不用 app.run()",
    "路由用 Blueprint 分组，避免单文件膨胀",
    "配置区分 dev/test/prod，敏感信息用环境变量",
    "debug=True 仅限开发，生产必须关闭",
    "用 Flask-SQLAlchemy + Flask-Migrate 管理数据库",
    "API 返回用 jsonify，自动设置 Content-Type",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== Flask 演示结束 ===")`
  },
  {
    id: "py6-fastapi-basic",
    group: "Web 与爬虫实战",
    icon: "⚡",
    title: "FastAPI 现代 Web 框架",
    content: `## FastAPI 现代 Web 框架

### 一、FastAPI 的特点

FastAPI 是 Sebastian Ramirez 开发的现代 Web 框架，基于三大基石：

- **Starlette**：ASGI 框架，提供异步能力
- **Pydantic**：数据验证与序列化
- **类型提示**：Python 3.6+ 的 \`type hints\` 驱动一切

核心优势：

1. **快**：性能比肩 Node.js / Go，是 Flask 的 2-3 倍
2. **类型驱动**：函数参数的类型提示自动变成校验规则
3. **自动文档**：开箱即用 Swagger UI + ReDoc
4. **原生异步**：\`async def\` 支持高并发 IO 场景
5. **依赖注入**：优雅的 \`Depends\` 系统

> 💡 **避坑提示**：FastAPI 的"快"主要体现在 IO 密集场景（如调用外部 API、数据库）。如果你的路由全是 CPU 计算，异步不会带来性能提升，反而有协程切换开销。

### 二、安装与 Hello World

\`\`\`bash
pip install fastapi uvicorn
uvicorn main:app --reload --port 8000
\`\`\`

\`\`\`python
from fastapi import FastAPI

app = FastAPI(title="My API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
\`\`\`

访问 \`http://127.0.0.1:8000/\` 返回 JSON，访问 \`/docs\` 自动生成 Swagger 文档，\`/redoc\` 生成 ReDoc 文档。

### 三、路径参数与查询参数

\`\`\`python
# 路径参数（类型自动校验）
@app.get("/users/{user_id}")
async def get_user(user_id: int):  # 非 int 会返回 422 错误
    return {"user_id": user_id}

# 查询参数
@app.get("/items/")
async def list_items(skip: int = 0, limit: int = 10):
    # /items/?skip=0&limit=5
    return {"skip": skip, "limit": limit}

# Optional 查询参数
from typing import Optional
@app.get("/search/")
async def search(q: Optional[str] = None):
    # /search/?q=python
    if q:
        return {"query": q}
    return {"query": "无搜索词"}
\`\`\`

类型提示的威力：传 \`/users/abc\` 会自动返回 422 校验错误，无需手写验证代码。

### 四、Pydantic 请求体模型

用 \`BaseModel\` 定义请求体结构，自动校验 + 序列化：

\`\`\`python
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: str  # EmailStr 需额外依赖
    age: int = Field(..., ge=0, le=150)  # ge=大于等于, le=小于等于
    tags: list[str] = []

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    # user 已通过校验，类型安全
    return {"id": 1, **user.dict()}

# 请求体示例：
# POST /users
# {"username": "alice", "email": "a@b.com", "age": 25, "tags": ["vip"]}
\`\`\`

校验失败时 FastAPI 自动返回详细错误：

\`\`\`json
{
  "detail": [{
    "loc": ["body", "age"],
    "msg": "ensure this value is less than or equal to 150",
    "type": "value_error.number.not_le"
  }]
}
\`\`\`

### 五、依赖注入 Depends

FastAPI 的依赖注入系统是其最优雅的设计之一：

\`\`\`python
from fastapi import Depends, Header

# 公共参数提取
def common_params(q: Optional[str] = None, skip: int = 0, limit: int = 10):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def list_items(commons: dict = Depends(common_params)):
    return commons

# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/")
async def get_users(db = Depends(get_db)):
    return db.query(User).all()

# 权限校验依赖
async def verify_token(x_token: str = Header(...)):
    if x_token != "secret":
        raise HTTPException(status_code=400, detail="X-Token header invalid")
    return x_token

@app.get("/secure/")
async def secure_endpoint(token: str = Depends(verify_token)):
    return {"token": token}
\`\`\`

依赖可以嵌套（依赖中再依赖），FastAPI 自动解析依赖树并注入。

### 六、异步路由

\`\`\`python
import httpx

@app.get("/weather/{city}")
async def get_weather(city: str):
    # async 路由可以用 await 调用异步 IO
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.weather.com/{city}")
        return resp.json()

# 同步路由用普通 def，FastAPI 会放到线程池执行
@app.get("/cpu-heavy/")
def cpu_heavy():
    # CPU 密集任务用 def 而非 async def
    result = sum(i * i for i in range(10**7))
    return {"result": result}
\`\`\`

> ⚠️ **避坑提示**：在 \`async def\` 路由中**不要**使用同步阻塞 IO（如 \`requests.get\`），会阻塞整个事件循环。要么用异步库（\`httpx\`、\`aiomysql\`），要么把该路由声明为普通 \`def\`。

### 七、自动 OpenAPI 文档

FastAPI 基于路由和 Pydantic 模型自动生成 OpenAPI 3.1 规范：

- \`/docs\`：Swagger UI（交互式测试）
- \`/redoc\`：ReDoc（只读文档）
- \`/openapi.json\`：原始 OpenAPI JSON

可以添加描述、示例、标签：

\`\`\`python
from fastapi import Body

@app.post("/items/", tags=["物品管理"], summary="创建物品")
async def create_item(
    item: Item = Body(..., example={"name": "苹果", "price": 5.5})
):
    \"\"\"
    创建一个新物品

    - **name**: 物品名称（必填）
    - **price**: 价格（必须大于 0）
    - **tax**: 税率（可选）
    \"\"\"
    return item
\`\`\`

### 八、FastAPI vs Flask 对比

| 维度 | FastAPI | Flask |
|------|---------|-------|
| 异步 | 原生 ASGI async/await | 需 async flask 扩展 |
| 类型校验 | Pydantic 自动 | 手写或 Flask-WTF |
| API 文档 | 自动 Swagger + ReDoc | 需 flask-restx |
| 性能 | 高（异步 IO） | 中等 |
| 依赖注入 | 内置 Depends | 无 |
| 生态 | 较新但增长快 | 非常成熟 |
| 学习曲线 | 需懂类型提示 + 异步 | 平缓 |
| 适合场景 | 高性能 API、微服务 | 全功能 Web、内部工具 |

### 九、业务场景

- **高性能 API 网关**：异步处理大量并发请求
- **AI/ML 推理服务**：模型预测 API，配合异步批处理
- **微服务**：启动快、文档自动、适合容器化
- **实时数据服务**：WebSocket、SSE 推送

### 十、原理深入

FastAPI 的工作流：

1. **启动**：解析所有路由装饰器，构建路由表，生成 OpenAPI schema
2. **请求到达**：Starlette ASGI 接收请求
3. **依赖解析**：递归解析 \`Depends\` 依赖树
4. **参数校验**：Pydantic 校验路径/查询/请求体参数
5. **执行视图**：调用 async def 或在线程池调 def
6. **序列化响应**：Pydantic model.dict() → JSON
7. **返回**：ASGI 响应回客户端

类型提示贯穿全流程：\`user_id: int\` → OpenAPI 文档 + 运行时校验 + IDE 补全。

### 十一、最佳实践总结

- IO 密集用 \`async def\` + 异步库，CPU 密集用普通 \`def\`
- 请求体一律用 Pydantic BaseModel，不要手动解析 JSON
- 公共逻辑（鉴权、分页、数据库会话）抽成 Depends 依赖
- 用 \`APIRouter\` 组织路由，类似 Flask Blueprint
- 生产部署用 \`gunicorn -k uvicorn.workers.UvicornWorker\`
- 用 \`response_model\` 控制响应字段，过滤敏感数据`,
    code: `# FastAPI 概念演示：用标准库模拟类型校验、依赖注入等核心概念
# 不依赖 FastAPI/Pydantic，纯标准库

print("=== FastAPI 核心概念演示 ===\\n")

# --- 1. 模拟类型提示自动校验 ---
print("--- 1. 模拟类型提示自动校验 ---")

def type_check(name, expected_type, value):
    """模拟 FastAPI 根据类型提示自动校验参数"""
    try:
        # 尝试将值转换为期望类型
        if expected_type == int:
            result = int(value)
        elif expected_type == float:
            result = float(value)
        elif expected_type == str:
            result = str(value)
        elif expected_type == bool:
            result = bool(value)
        else:
            result = value
        return result, None
    except (ValueError, TypeError) as e:
        return None, f"参数 '{name}' 期望 {expected_type.__name__}, 实际无法转换"

# 模拟路由 GET /users/{user_id}
def get_user(user_id: int):
    return {"user_id": user_id, "name": "Alice"}

# 模拟各种请求
test_cases = [("123", int, "合法整数"), ("abc", int, "非法整数"), ("25", int, "合法")]
for raw, typ, desc in test_cases:
    val, err = type_check("user_id", typ, raw)
    if err:
        print(f"  GET /users/{raw} -> 422 Error: {err} ({desc})")
    else:
        result = get_user(val)
        print(f"  GET /users/{raw} -> 200 OK: {result} ({desc})")

# --- 2. 模拟 Pydantic 请求体校验 ---
print("\\n--- 2. 模拟 Pydantic BaseModel 校验 ---")

class FakeModel:
    """模拟 Pydantic BaseModel 的校验逻辑"""
    fields = {}

    @classmethod
    def validate(cls, data):
        errors = []
        result = {}
        for field_name, spec in cls.fields.items():
            field_type, required, constraints = spec
            if field_name not in data:
                if required:
                    errors.append(f"缺少必填字段 '{field_name}'")
                continue
            value = data[field_name]
            # 类型检查
            try:
                if field_type == int:
                    value = int(value)
                elif field_type == str:
                    value = str(value)
            except (ValueError, TypeError):
                errors.append(f"字段 '{field_name}' 类型错误")
                continue
            # 约束检查
            for check, limit in constraints.items():
                if check == "min_length" and len(str(value)) < limit:
                    errors.append(f"字段 '{field_name}' 长度不能小于 {limit}")
                elif check == "max_length" and len(str(value)) > limit:
                    errors.append(f"字段 '{field_name}' 长度不能超过 {limit}")
                elif check == "ge" and value < limit:
                    errors.append(f"字段 '{field_name}' 不能小于 {limit}")
                elif check == "le" and value > limit:
                    errors.append(f"字段 '{field_name}' 不能大于 {limit}")
            result[field_name] = value
        return result, errors

class UserCreate(FakeModel):
    fields = {
        "username": (str, True, {"min_length": 3, "max_length": 20}),
        "age": (int, True, {"ge": 0, "le": 150}),
        "tags": (str, False, {}),
    }

# 测试合法请求
body1 = {"username": "alice", "age": 25, "tags": "vip"}
result, errors = UserCreate.validate(body1)
print(f"  合法请求: {result}, 错误: {errors or '无'}")

# 测试非法请求（年龄超限）
body2 = {"username": "bob", "age": 200}
result, errors = UserCreate.validate(body2)
print(f"  非法请求: {result}, 错误: {errors}")

# --- 3. 模拟依赖注入 Depends ---
print("\\n--- 3. 模拟依赖注入 Depends ---")

class Depends:
    """模拟 fastapi.Depends"""
    def __init__(self, dependency):
        self.dependency = dependency

def common_params(q=None, skip=0, limit=10):
    """公共分页参数"""
    return {"q": q, "skip": skip, "limit": limit}

def verify_token(token=""):
    """鉴权依赖"""
    if token != "secret-token":
        raise PermissionError("无效的 token")
    return {"user": "alice", "role": "admin"}

def resolve_dependency(dep, provided_args=None):
    """模拟 FastAPI 递归解析依赖"""
    provided_args = provided_args or {}
    import inspect
    sig = inspect.signature(dep)
    kwargs = {}
    for name, param in sig.parameters.items():
        if name in provided_args:
            kwargs[name] = provided_args[name]
        elif param.default is not inspect.Parameter.empty:
            kwargs[name] = param.default
    return dep(**kwargs)

# 模拟路由：list_items 依赖 common_params 和 verify_token
def list_items(commons=Depends(common_params), auth=Depends(verify_token)):
    return {"items": ["a", "b", "c"], "commons": commons, "auth": auth}

try:
    commons = resolve_dependency(common_params, {"q": "python", "limit": 5})
    auth = resolve_dependency(verify_token, {"token": "secret-token"})
    print(f"  依赖解析成功: commons={commons}, auth={auth}")
    print(f"  路由结果: {list_items(commons=commons, auth=auth)}")
except PermissionError as e:
    print(f"  依赖解析失败: {e}")

# --- 4. 模拟异步路由概念 ---
print("\\n--- 4. 模拟 async/await 路由 ---")

import asyncio

async def fetch_weather(city):
    """模拟异步获取天气（IO 密集）"""
    await asyncio.sleep(0.01)  # 模拟网络 IO
    return {"city": city, "temp": 25}

async def fetch_news():
    """模拟异步获取新闻"""
    await asyncio.sleep(0.01)
    return ["新闻1", "新闻2"]

# FastAPI 的优势：并发执行多个 IO
async def dashboard():
    """一个路由内并发调用多个异步任务"""
    weather, news = await asyncio.gather(
        fetch_weather("北京"),
        fetch_news()
    )
    return {"weather": weather, "news": news}

result = asyncio.run(dashboard())
print(f"  并发路由结果: {result}")
print("  (异步 IO 并发执行，总耗时约 0.01s 而非 0.02s)")

# --- 5. 模拟自动文档生成 ---
print("\\n--- 5. 模拟自动 OpenAPI 文档 ---")

import json

routes_info = [
    {"path": "/users/{user_id}", "method": "GET", "params": {"user_id": "int"}},
    {"path": "/users", "method": "POST", "body": "UserCreate"},
    {"path": "/items/", "method": "GET", "query": {"skip": "int", "limit": "int"}},
]

openapi_schema = {
    "openapi": "3.1.0",
    "info": {"title": "My API", "version": "1.0.0"},
    "paths": {}
}

for r in routes_info:
    path = r["path"]
    method = r["method"].lower()
    openapi_schema["paths"].setdefault(path, {})
    openapi_schema["paths"][path][method] = {
        "summary": f"{method.upper()} {path}",
        "parameters": [{"name": k, "in": "path", "schema": {"type": v}}
                       for k, v in r.get("params", {}).items()],
    }

print(f"  自动生成 OpenAPI schema ({len(openapi_schema['paths'])} 个路由):")
print(f"  {json.dumps(openapi_schema['paths'], ensure_ascii=False, indent=2)[:200]}...")
print("  访问 /docs 查看 Swagger UI, /redoc 查看 ReDoc")

# --- 6. 最佳实践总结 ---
print("\\n--- 6. FastAPI 最佳实践 ---")
tips = [
    "IO 密集用 async def + 异步库, CPU 密集用普通 def",
    "请求体用 Pydantic BaseModel, 不手动解析 JSON",
    "公共逻辑抽成 Depends 依赖（鉴权/分页/数据库会话）",
    "用 APIRouter 组织路由, 类似 Flask Blueprint",
    "生产用 gunicorn -k uvicorn.workers.UvicornWorker 部署",
    "用 response_model 控制响应字段, 过滤敏感数据",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== FastAPI 演示结束 ===")`
  },
  {
    id: "py6-django-overview",
    group: "Web 与爬虫实战",
    icon: "🎸",
    title: "Django 全栈框架概览",
    content: `## Django 全栈框架概览

### 一、Django 的哲学

Django 是 Python 最老牌的全栈 Web 框架，诞生于 2003 年的新闻网站开发实践。其设计哲学可概括为：

- **电池全包（Batteries Included）**：ORM、模板、表单、Admin、认证、缓存……开箱即用
- **DRY（Don't Repeat Yourself）**：消除重复，一处定义，处处使用
- **快速开发**：从模型到界面，几十行代码完成 CRUD
- **安全优先**：内置防 CSRF、XSS、SQL 注入、点击劫持

> 💡 **避坑提示**：Django 的"全包"意味着学习曲线陡峭。但它适合**内容管理、电商、社交**这类需要完整功能的场景。如果只做 API，Django REST Framework 或 FastAPI 更合适。

### 二、MTV 架构

Django 采用 **MTV** 架构（类似 MVC）：

| Django (MTV) | 传统 MVC | 职责 |
|---------------|----------|------|
| Model | Model | 数据层，ORM |
| Template | View | 展示层，HTML 模板 |
| View | Controller | 业务逻辑，URL 路由分发 |

\`\`\`
请求 → URLs (urls.py) → View (views.py) → Model (models.py) → Template (templates/) → 响应
\`\`\`

### 三、项目结构

\`\`\`bash
django-admin startproject myproject
cd myproject
python manage.py startapp blog
\`\`\`

\`\`\`
myproject/
├── manage.py           # 命令行入口
├── myproject/          # 项目配置包
│   ├── settings.py     # 全局配置
│   ├── urls.py         # 根 URL 路由
│   └── wsgi.py         # WSGI 入口
└── blog/               # 应用
    ├── models.py       # 数据模型
    ├── views.py        # 视图函数
    ├── urls.py         # 应用路由
    ├── admin.py        # Admin 注册
    ├── forms.py        # 表单
    └── migrations/     # 数据库迁移
\`\`\`

Django 的核心思想是**项目 + 应用**：项目是配置集合，应用是可复用的功能模块。一个项目可包含多个应用，一个应用可被多个项目复用。

### 四、ORM 与 models.py

Django ORM 是其最强大的组件，用 Python 类定义数据模型，自动映射到数据库：

\`\`\`python
# blog/models.py
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    published = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField("Tag")

    def __str__(self):
        return self.title
\`\`\`

迁移到数据库：

\`\`\`bash
python manage.py makemigrations  # 生成迁移文件
python manage.py migrate         # 执行迁移
\`\`\`

ORM 查询语法：

\`\`\`python
# 查询
posts = Post.objects.all()                         # SELECT *
post = Post.objects.get(id=1)                      # WHERE id=1
published = Post.objects.filter(published=True)    # WHERE published=True
recent = Post.objects.order_by("-published")[:5]   # ORDER BY ... LIMIT 5

# 创建
author = Author.objects.create(name="Alice", email="a@b.com")
post = Post.objects.create(title="Hi", content="...", author=author)

# 更新
post.title = "New Title"
post.save()

# 关联查询
posts = author.post_set.all()  # 反向关联
\`\`\`

### 五、Admin 后台

Django Admin 是其杀手级功能，几行代码即可获得完整的后台管理界面：

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Author, Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "published")  # 列表显示字段
    list_filter = ("published", "author")             # 侧边过滤
    search_fields = ("title", "content")              # 搜索框
    date_hierarchy = "published"                      # 日期导航

admin.site.register(Author)
\`\`\`

访问 \`/admin/\` 即可获得：列表、详情编辑、搜索、过滤、分页、批量操作。无需写一行 HTML。

### 六、模板系统

Django 模板语言（DTL）类似 Jinja2：

\`\`\`html
<!-- blog/post_list.html -->
{% extends "base.html" %}

{% block content %}
  <h1>文章列表</h1>
  {% if posts %}
    <ul>
    {% for post in posts %}
      <li>
        <a href="/post/{{ post.id }}/">{{ post.title }}</a>
        - {{ post.author.name }}
        - {{ post.published|date:"Y-m-d" }}
      </li>
    {% endfor %}
    </ul>
  {% else %}
    <p>暂无文章</p>
  {% endif %}
{% endblock %}
\`\`\`

视图函数渲染模板：

\`\`\`python
# blog/views.py
from django.shortcuts import render
from .models import Post

def post_list(request):
    posts = Post.objects.all().order_by("-published")
    return render(request, "blog/post_list.html", {"posts": posts})
\`\`\`

### 七、URL 路由

\`\`\`python
# myproject/urls.py
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path("admin/", admin.site.urls),
    path("blog/", include("blog.urls")),  # 包含应用路由
]

# blog/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.post_list, name="post_list"),
    path("post/<int:post_id>/", views.post_detail, name="post_detail"),
]
\`\`\`

### 八、表单 forms

\`\`\`python
# blog/forms.py
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "content", "author"]
        widgets = {"content": forms.Textarea(attrs={"rows": 5})}

# views.py
def post_create(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("post_list")
    else:
        form = PostForm()
    return render(request, "blog/post_form.html", {"form": form})
\`\`\`

表单自动生成 HTML、校验数据、显示错误信息。

### 九、中间件 Middleware

中间件是请求/响应处理的钩子链：

\`\`\`python
class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 请求到达前的处理
        request.custom_attr = "value"
        response = self.get_response(request)
        # 响应返回前的处理
        response["X-Custom"] = "hello"
        return response
\`\`\`

在 \`settings.py\` 注册：

\`\`\`python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # 自定义中间件
    "myapp.middleware.SimpleMiddleware",
]
\`\`\`

### 十、Django vs Flask 对比

| 维度 | Django | Flask |
|------|--------|-------|
| 定位 | 全栈框架 | 微框架 |
| ORM | 内置强大 ORM | 需 SQLAlchemy |
| Admin | 内置 | 无 |
| 表单 | 内置 forms | 需 Flask-WTF |
| 模板 | DTL | Jinja2 |
| 路由 | urls.py 集中管理 | @app.route 装饰器 |
| 学习曲线 | 陡峭 | 平缓 |
| 适合场景 | CMS、电商、社交 | API、微服务 |

### 十一、业务场景

- **内容管理系统（CMS）**：博客、新闻、文档站
- **电商平台**：商品、订单、支付（Django Oscar）
- **社交应用**：用户、关系、动态
- **企业内部系统**：CRM、ERP、OA
- **教育平台**：课程、作业、考试

### 十二、最佳实践总结

- 用 \`settings.py\` 分环境配置（dev/test/prod）
- 业务按 app 拆分，保持可复用
- Model 是核心，业务逻辑尽量放在 model 方法里
- 用 Django REST Framework 做 API
- 生产环境关闭 \`DEBUG\`，配置 \`ALLOWED_HOSTS\`
- 用 Django 缓存框架（Redis/Memcached）提升性能
- 定期 \`makemigrations\` + \`migrate\` 管理数据库变更`,
    code: `# Django 概念演示：用标准库模拟 MTV 架构、ORM、路由等核心概念
# 不依赖 Django，纯标准库模拟

print("=== Django 全栈框架概念演示 ===\\n")

# --- 1. 模拟 Django MTV 架构 ---
print("--- 1. 模拟 MTV 架构（Model-Template-View） ---")

# Model 层：用类模拟 Django ORM 模型
class Model:
    """模拟 Django Model 基类"""
    _store = {}  # 类级存储，模拟数据库表

    @classmethod
    def objects(cls):
        return QuerySet(cls)

class QuerySet:
    """模拟 Django QuerySet 查询接口"""
    def __init__(self, model):
        self.model = model
        self._filters = {}

    def filter(self, **kwargs):
        self._filters.update(kwargs)
        return self

    def all(self):
        data = self.model._store.get(self.model.__name__, [])
        result = []
        for item in data:
            match = all(item.get(k) == v for k, v in self._filters.items())
            if match:
                result.append(item)
        return result

    def get(self, **kwargs):
        self._filters.update(kwargs)
        results = self.all()
        if not results:
            raise Exception("DoesNotExist")
        return results[0]

    def create(self, **kwargs):
        if self.model.__name__ not in self.model._store:
            self.model._store[self.model.__name__] = []
        item = {"id": len(self.model._store[self.model.__name__]) + 1, **kwargs}
        self.model._store[self.model.__name__].append(item)
        return item

# 定义模型（类似 models.py）
class Post(Model):
    pass

# 模拟 ORM 操作（类似 views.py 中的查询）
Post.objects().create(title="Hello Django", author="Alice", published=True)
Post.objects().create(title="Python 进阶", author="Bob", published=True)
Post.objects().create(title="草稿文章", author="Alice", published=False)

all_posts = Post.objects().all()
print(f"  全部文章: {len(all_posts)} 篇")
for p in all_posts:
    print(f"    #{p['id']} {p['title']} (作者: {p['author']})")

alice_posts = Post.objects().filter(author="Alice").all()
print(f"  Alice 的文章: {len(alice_posts)} 篇")

published = Post.objects().filter(published=True).all()
print(f"  已发布文章: {len(published)} 篇")

# --- 2. 模拟 Template 模板渲染 ---
print("\\n--- 2. 模拟 Django Template 模板 ---")

import re

def render_template(template, context):
    """模拟 Django 模板渲染：{{ var }} 和 {% for %}"""
    # 渲染 {{ variable }}
    def replace_var(match):
        expr = match.group(1).strip()
        parts = expr.split(".")
        val = context
        for part in parts:
            val = val.get(part, "") if isinstance(val, dict) else ""
        return str(val)
    result = re.sub(r"\\{\\{\\s*(.+?)\\s*\\}\\}", replace_var, template)
    # 渲染 {% for item in items %}...{% endfor %}
    for_pattern = r"\\{%\\s*for\\s+(\\w+)\\s+in\\s+(\\w+)\\s*%\\}(.*?)\\{%\\s*endfor\\s*%\\}"
    def replace_for(match):
        item_var, list_var, body = match.group(1), match.group(2), match.group(3)
        items = context.get(list_var, [])
        output = ""
        for item in items:
            ctx = {**context, item_var: item}
            output += re.sub(r"\\{\\{\\s*(.+?)\\s*\\}\\}", lambda m: str(ctx.get(m.group(1).strip(), "")), body)
        return output
    result = re.sub(for_pattern, replace_for, result, flags=re.DOTALL)
    return result

template = """<h1>{{ title }}</h1>
<ul>
{% for post in posts %}
  <li>{{ post.title }} - {{ post.author }}</li>
{% endfor %}
</ul>"""

ctx = {"title": "文章列表", "posts": all_posts}
html = render_template(template, ctx)
print(html.strip())

# --- 3. 模拟 URL 路由系统 ---
print("\\n--- 3. 模拟 Django URL 路由 ---")

class URLRouter:
    """模拟 Django URLconf"""
    def __init__(self):
        self.patterns = []

    def add(self, pattern, view):
        self.patterns.append((pattern, view))

    def resolve(self, path):
        for pattern, view in self.patterns:
            # 简单匹配 <int:param> 风格
            import re
            regex = re.sub(r"<(\\w+):(\\w+)>", r"(?P<\\2>[^/]+)", pattern)
            m = re.match(f"^{regex}$", path)
            if m:
                return view, m.groupdict()
        return None, {}

router = URLRouter()

def post_list(request=None):
    return "200 OK: 文章列表页"

def post_detail(request=None, post_id=None):
    return f"200 OK: 文章 #{post_id} 详情页"

router.add("/posts/", post_list)
router.add("/post/<int:post_id>/", post_detail)

for path in ["/posts/", "/post/42/", "/unknown/"]:
    view, kwargs = router.resolve(path)
    if view:
        result = view(post_id=kwargs.get("post_id")) if "post_id" in kwargs else view()
        print(f"  {path} -> {result}")
    else:
        print(f"  {path} -> 404 Not Found")

# --- 4. 模拟 Admin 后台 ---
print("\\n--- 5. 模拟 Admin 后台 ---")

class AdminSite:
    """模拟 Django Admin 自动生成管理界面"""
    def __init__(self):
        self.registered = {}

    def register(self, model, admin_class=None):
        name = model.__name__
        list_display = getattr(admin_class, "list_display", ["id"]) if admin_class else ["id"]
        self.registered[name] = {"model": model, "list_display": list_display}

class PostAdmin:
    list_display = ("id", "title", "author", "published")

admin = AdminSite()
admin.register(Post, PostAdmin)

print("  Admin 后台已注册模型:")
for name, config in admin.registered.items():
    data = config["model"].objects().all()
    print(f"  {name} (共 {len(data)} 条, list_display={config['list_display']}):")
    for item in data[:3]:
        row = {k: item.get(k) for k in config["list_display"] if k in item}
        print(f"    {row}")
print("  (访问 /admin/ 即可管理这些数据)")

# --- 5. 模拟中间件 Middleware ---
print("\\n--- 6. 模拟中间件链 ---")

def middleware1(get_response):
    def handler(request):
        request["mw1"] = "前处理1"
        response = get_response(request)
        response["headers"]["X-MW1"] = "后处理1"
        return response
    return handler

def middleware2(get_response):
    def handler(request):
        request["mw2"] = "前处理2"
        response = get_response(request)
        response["headers"]["X-MW2"] = "后处理2"
        return response
    return handler

def view(request):
    return {"status": 200, "body": f"视图处理: {request}", "headers": {}}

# 组装中间件链
chain = middleware1(middleware2(view))
resp = chain({"path": "/"})
print(f"  响应: status={resp['status']}")
print(f"  请求经过中间件: mw1={chain.__closure__[0].cell_contents if False else '已处理'}")
print(f"  响应头: {resp['headers']}")
print("  (中间件按顺序前处理, 逆序后处理)")

# --- 6. 最佳实践总结 ---
print("\\n--- 7. Django 最佳实践 ---")
tips = [
    "业务按 app 拆分, 保持可复用",
    "Model 是核心, 业务逻辑放 model 方法",
    "用 Django REST Framework 做 API",
    "生产关闭 DEBUG, 配置 ALLOWED_HOSTS",
    "用 makemigrations + migrate 管理数据库",
    "Redis 缓存 + Celery 异步任务提升性能",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== Django 演示结束 ===")`
  },
  {
    id: "py6-wsgi-asgi",
    group: "Web 与爬虫实战",
    icon: "🔌",
    title: "WSGI 与 ASGI 服务器",
    content: `## WSGI 与 ASGI 服务器

### 一、为什么需要 WSGI/ASGI

Python Web 应用不能直接监听 TCP 端口处理 HTTP——这涉及连接管理、并发、解析等底层工作。**Web 服务器接口规范**定义了应用与服务器之间的契约：

- 服务器负责：监听端口、接收连接、解析 HTTP、并发管理
- 应用负责：业务逻辑、生成响应

这样应用开发者只需写业务代码，不必关心网络底层。

### 二、WSGI：同步接口（PEP 3333）

WSGI（Web Server Gateway Interface）是 Python 最早的 Web 服务器接口规范，定义于 2003 年的 PEP 333，2003 年更新为 PEP 3333（支持 Python 3）。

**核心契约**：WSGI 应用是一个**可调用对象**，接受两个参数：

\`\`\`python
def application(environ, start_response):
    """
    environ: 字典，包含请求信息（PATH_INFO, REQUEST_METHOD, QUERY_STRING...）
    start_response: 回调函数，用于发送响应状态和头
    返回: 可迭代的 bytes（响应体）
    """
    status = "200 OK"
    headers = [("Content-Type", "text/plain")]
    start_response(status, headers)
    return [b"Hello, WSGI!"]
\`\`\`

#### environ 关键字段

| 字段 | 含义 | 示例 |
|------|------|------|
| REQUEST_METHOD | HTTP 方法 | GET / POST |
| PATH_INFO | URL 路径 | /api/users |
| QUERY_STRING | 查询字符串 | page=1&size=10 |
| SERVER_NAME | 服务器名 | localhost |
| SERVER_PORT | 端口 | 8000 |
| HTTP_* | 请求头 | HTTP_USER_AGENT |
| wsgi.input | 请求 body 流 | file-like object |

#### start_response 调用

\`\`\`python
start_response("200 OK", [
    ("Content-Type", "application/json"),
    ("Content-Length", "13"),
])
\`\`\`

### 三、用 wsgiref 演示 WSGI

Python 标准库 \`wsgiref\` 提供了 WSGI 参考实现：

\`\`\`python
from wsgiref.simple_server import make_server

def app(environ, start_response):
    path = environ["PATH_INFO"]
    if path == "/":
        start_response("200 OK", [("Content-Type", "text/plain")])
        return [b"Home"]
    elif path == "/api":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [b'{"msg": "ok"}']
    else:
        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"Not Found"]

with make_server("", 8000, app) as server:
    print("Serving on port 8000...")
    server.serve_forever()
\`\`\`

### 四、WSGI 服务器

\`wsgiref\` 仅用于开发。生产环境用专业 WSGI 服务器：

| 服务器 | 特点 |
|--------|------|
| **Gunicorn** | 最流行，预 fork 多 worker，简单稳定 |
| **uWSGI** | 功能丰富，性能强，配置复杂 |
| **Waitress** | 纯 Python，跨平台，Windows 友好 |

Gunicorn 部署示例：

\`\`\`bash
# 4 个 worker 进程，每个进程 4 线程
gunicorn -w 4 --threads 4 -b 0.0.0.0:8000 myapp:app

# 配合 Gevent（协程）
pip install gevent
gunicorn -k gevent -w 4 -b 0.0.0.0:8000 myapp:app
\`\`\`

> 💡 **避坑提示**：WSGI 是**同步**接口，一个 worker 一次只处理一个请求。要提升并发，靠**多进程**（worker）或**多线程**。Gevent/Eventlet 通过协程在单线程内模拟并发，但需要 monkey patch。

### 五、ASGI：异步接口

ASGI（Asynchronous Server Gateway Interface）是 WSGI 的异步升级版，由 Django 团队发起。它支持：

- **异步 IO**：\`async def\` 路由
- **WebSocket**：双向长连接
- **HTTP/2**：多路复用
- **流式响应**：Server-Sent Events

**ASGI 应用签名**：

\`\`\`python
async def app(scope, receive, send):
    \"\"\"
    scope: 字典，连接信息（type, method, path, headers...）
    receive: 异步回调，接收请求体
    send: 异步回调，发送响应
    \"\"\"
    if scope["type"] == "http":
        await send({
            "type": "http.response.start",
            "status": 200,
            "headers": [(b"content-type", b"text/plain")],
        })
        await send({
            "type": "http.response.body",
            "body": b"Hello, ASGI!",
        })
\`\`\`

### 六、WSGI vs ASGI 对比

| 维度 | WSGI | ASGI |
|------|------|------|
| 接口 | 同步 \`def app(environ, start_response)\` | 异步 \`async def app(scope, receive, send)\` |
| 并发模型 | 多进程/多线程 | 事件循环 + 协程 |
| WebSocket | 不支持 | 原生支持 |
| HTTP/2 | 不支持 | 支持 |
| 服务器 | Gunicorn, uWSGI | Uvicorn, Hypercorn, Daphne |
| 框架 | Flask, Django(传统) | FastAPI, Starlette, Django 3+ |
| 长连接 | 受限 | 原生支持 |

### 七、ASGI 服务器

| 服务器 | 特点 |
|--------|------|
| **Uvicorn** | 最流行，基于 uvloop + httptools，高性能 |
| **Hypercorn** | 支持 HTTP/2 和 HTTP/3，兼容 WSGI |
| **Daphne** | Django Channels 团队开发，WebSocket 优秀 |

部署示例：

\`\`\`bash
# Uvicorn 单进程
uvicorn myapp:app --host 0.0.0.0 --port 8000

# Gunicorn + Uvicorn worker（生产推荐）
gunicorn -k uvicorn.workers.UvicornWorker -w 4 myapp:app

# Hypercorn 支持 HTTP/2
hypercorn myapp:app --certfile cert.pem --keyfile key.pem
\`\`\`

### 八、何时该用 ASGI

**适合 ASGI 的场景**：
- WebSocket、长轮询、SSE 流式推送
- 大量并发 IO（调用外部 API、数据库）
- HTTP/2 多路复用
- 实时通信（聊天、通知、协作）

**WSGI 仍然够用的场景**：
- 传统 CRUD API（请求快、IO 少）
- CPU 密集型任务（异步无优势）
- 简单内部工具

> ⚠️ **避坑提示**：ASGI 应用中**不能**使用同步阻塞库（如 \`requests\`、\`psycopg2\`），会阻塞事件循环。必须用异步库（\`httpx\`、\`asyncpg\`、\`aiomysql\`）或在线程池中执行。

### 九、原理深入

#### WSGI 的同步模型

WSGI 服务器（如 Gunicorn）采用**预 fork** 模型：

1. 主进程启动，fork 出 N 个 worker 进程
2. 每个 worker 独立运行应用
3. 请求到来，由某个 worker 同步处理
4. 处理完成后，worker 接受下一个请求

一个 worker 在处理请求时**无法**接受新请求。并发靠 worker 数量。

#### ASGI 的事件循环

ASGI 服务器（如 Uvicorn）采用**事件循环**模型：

1. 主进程启动，fork N 个 worker
2. 每个 worker 运行一个 asyncio 事件循环
3. 请求到来，注册为事件，\`await\` IO 时不阻塞
4. 单 worker 可同时处理数千个请求

关键：\`await\` 期间事件循环可以处理其他请求，IO 等待时间被复用。

### 十、业务场景

| 场景 | 推荐 | 原因 |
|------|------|------|
| RESTful API（IO 轻） | WSGI (Flask/Gunicorn) | 简单稳定，足够用 |
| AI 推理服务 | ASGI (FastAPI/Uvicorn) | 推理耗时长，异步批处理 |
| 聊天/实时通知 | ASGI | WebSocket 长连接 |
| 流式数据推送 | ASGI | SSE 流式响应 |
| 内部管理后台 | WSGI (Django) | CRUD 为主 |
| 高并发 API 网关 | ASGI | 异步 IO 性能高 |

### 十一、最佳实践总结

- 开发用 \`wsgiref\` / \`uvicorn --reload\`，生产用 Gunicorn
- WSGI 应用：CPU 密集选多 worker，IO 密集选 Gevent
- ASGI 应用：\`gunicorn -k uvicorn.workers.UvicornWorker\` 部署
- worker 数量一般为 CPU 核数的 2-4 倍
- 不要在 ASGI 应用中使用同步阻塞 IO
- WebSocket 必须用 ASGI，WSGI 不支持
- 监控 worker 状态，配置优雅重启`,
    code: `# WSGI 与 ASGI 概念演示：用标准库模拟两种接口
# 不依赖第三方库，用 wsgiref 演示 WSGI，用 asyncio 演示 ASGI

print("=== WSGI 与 ASGI 服务器概念演示 ===\\n")

# --- 1. WSGI 应用接口演示 ---
print("--- 1. WSGI 应用接口 ---")

def wsgi_app(environ, start_response):
    """标准 WSGI 应用：def app(environ, start_response) -> iterable"""
    path = environ.get("PATH_INFO", "/")
    method = environ.get("REQUEST_METHOD", "GET")

    if path == "/" and method == "GET":
        start_response("200 OK", [("Content-Type", "text/plain")])
        return [b"Hello from WSGI!"]
    elif path == "/api" and method == "GET":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [b'{"framework": "wsgi", "async": false}']
    elif path == "/post" and method == "POST":
        # 读取请求 body
        try:
            length = int(environ.get("CONTENT_LENGTH", 0))
            body = environ["wsgi.input"].read(length) if length > 0 else b""
        except Exception:
            body = b""
        start_response("201 Created", [("Content-Type", "text/plain")])
        return [b"Created: " + body]
    else:
        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"Not Found"]

# 模拟 WSGI 服务器调用
class MockWSGIServer:
    """模拟 WSGI 服务器处理请求"""
    def handle(self, app, path, method="GET", body=""):
        environ = {
            "PATH_INFO": path,
            "REQUEST_METHOD": method,
            "CONTENT_LENGTH": str(len(body)),
            "wsgi.input": __import__("io").BytesIO(body.encode()),
            "wsgi.errors": __import__("sys").stderr,
        }
        captured = {}
        def start_response(status, headers):
            captured["status"] = status
            captured["headers"] = headers
        result = app(environ, start_response)
        body_bytes = b"".join(result)
        return captured["status"], body_bytes.decode()

server = MockWSGIServer()
tests = [
    ("GET", "/", ""),
    ("GET", "/api", ""),
    ("POST", "/post", '{"name": "Alice"}'),
    ("GET", "/unknown", ""),
]
for method, path, body in tests:
    status, resp_body = server.handle(wsgi_app, path, method, body)
    print(f"  {method} {path} -> {status}: {resp_body[:50]}")

# --- 2. WSGI 中间件链 ---
print("\\n--- 2. WSGI 中间件 ---")

def timing_middleware(app):
    """计时中间件"""
    import time
    def wrapped(environ, start_response):
        t0 = time.time()
        result = app(environ, start_response)
        elapsed = (time.time() - t0) * 1000
        print(f"    [中间件] 请求耗时: {elapsed:.2f}ms")
        return result
    return wrapped

def logging_middleware(app):
    """日志中间件"""
    def wrapped(environ, start_response):
        print(f"    [中间件] 收到请求: {environ['REQUEST_METHOD']} {environ['PATH_INFO']}")
        return app(environ, start_response)
    return wrapped

# 组装中间件链
wrapped_app = logging_middleware(timing_middleware(wsgi_app))
print("  带中间件的请求处理:")
server.handle(wrapped_app, "/api")

# --- 3. ASGI 应用接口演示 ---
print("\\n--- 3. ASGI 应用接口 ---")

import asyncio

async def asgi_app(scope, receive, send):
    """标准 ASGI 应用：async def app(scope, receive, send)"""
    if scope["type"] == "http":
        path = scope["path"]
        method = scope["method"]

        if path == "/" and method == "GET":
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [(b"content-type", b"text/plain")],
            })
            await send({
                "type": "http.response.body",
                "body": b"Hello from ASGI!",
            })
        elif path == "/async" and method == "GET":
            # 演示异步 IO：await 期间可处理其他请求
            await asyncio.sleep(0.01)  # 模拟异步 IO 操作
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [(b"content-type", b"application/json")],
            })
            await send({
                "type": "http.response.body",
                "body": b'{"framework": "asgi", "async": true}',
            })
        else:
            await send({
                "type": "http.response.start",
                "status": 404,
                "headers": [(b"content-type", b"text/plain")],
            })
            await send({"type": "http.response.body", "body": b"Not Found"})

# 模拟 ASGI 服务器调用
class MockASGIServer:
    async def handle(self, app, path, method="GET"):
        scope = {"type": "http", "path": path, "method": method}
        responses = []
        async def receive():
            return {"type": "http.request", "body": b"", "more_body": False}
        async def send(message):
            responses.append(message)
        await app(scope, receive, send)
        status = responses[0]["status"] if responses else 0
        body = b""
        for r in responses:
            if r.get("type") == "http.response.body":
                body += r.get("body", b"")
        return status, body.decode()

asgi_server = MockASGIServer()

async def test_asgi():
    for path in ["/", "/async", "/unknown"]:
        status, body = await asgi_server.handle(asgi_app, path)
        print(f"  GET {path} -> {status}: {body[:50]}")

asyncio.run(test_asgi())

# --- 4. ASGI 并发优势演示 ---
print("\\n--- 4. ASGI 异步并发优势 ---")

async def fetch_data(name, delay):
    """模拟异步 IO 操作（如查数据库、调 API）"""
    await asyncio.sleep(delay)
    return f"{name}的数据(耗时{delay}s)"

async def wsgi_style_sequential():
    """模拟 WSGI 同步处理：逐个等待"""
    import time
    t0 = time.time()
    r1 = await fetch_data("服务A", 0.05)
    r2 = await fetch_data("服务B", 0.05)
    r3 = await fetch_data("服务C", 0.05)
    elapsed = time.time() - t0
    return [r1, r2, r3], elapsed

async def asgi_style_concurrent():
    """模拟 ASGI 异步处理：并发执行"""
    import time
    t0 = time.time()
    results = await asyncio.gather(
        fetch_data("服务A", 0.05),
        fetch_data("服务B", 0.05),
        fetch_data("服务C", 0.05),
    )
    elapsed = time.time() - t0
    return results, elapsed

# 运行对比
seq_results, seq_time = asyncio.run(wsgi_style_sequential())
con_results, con_time = asyncio.run(asgi_style_concurrent())
print(f"  同步顺序执行: {seq_time:.3f}s, 结果: {seq_results}")
print(f"  异步并发执行: {con_time:.3f}s, 结果: {con_results}")
print(f"  并发比同步快约 {seq_time/con_time:.1f} 倍")

# --- 5. 何时用 WSGI vs ASGI ---
print("\\n--- 5. WSGI vs ASGI 选型指南 ---")
cases = [
    ("传统 CRUD API（IO 轻）", "WSGI", "请求快，WSGI 足够"),
    ("WebSocket 聊天", "ASGI", "需要长连接，WSGI 不支持"),
    ("AI 推理服务", "ASGI", "推理耗时长，异步批处理"),
    ("内部管理后台", "WSGI", "CRUD 为主，Django 经典"),
    ("高并发 API 网关", "ASGI", "异步 IO 性能高"),
    ("流式数据推送 SSE", "ASGI", "需要流式响应"),
]
for scenario, choice, reason in cases:
    print(f"  {scenario}: -> {choice} ({reason})")

# --- 6. 最佳实践总结 ---
print("\\n--- 6. 最佳实践 ---")
tips = [
    "开发用 wsgiref/uvicorn --reload, 生产用 Gunicorn",
    "WSGI: CPU 密集选多 worker, IO 密集选 Gevent",
    "ASGI: gunicorn -k uvicorn.workers.UvicornWorker 部署",
    "worker 数量一般为 CPU 核数的 2-4 倍",
    "ASGI 应用中不能用同步阻塞库 (requests/psycopg2)",
    "WebSocket 必须用 ASGI, WSGI 不支持",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== WSGI/ASGI 演示结束 ===")`
  },
  {
    id: "py6-requests-http",
    group: "Web 与爬虫实战",
    icon: "📡",
    title: "HTTP 客户端（requests/httpx/urllib）",
    content: `## HTTP 客户端（requests/httpx/urllib）

### 一、Python HTTP 客户端生态

Python 有多个 HTTP 客户端库，各有定位：

| 库 | 类型 | 特点 | 异步支持 |
|----|------|------|----------|
| **urllib** | 标准库 | 无需安装，API 较底层 | 否 |
| **requests** | 第三方 | 最流行，API 简洁优雅 | 否（3.0 计划支持） |
| **httpx** | 第三方 | 现代 API，支持 HTTP/2 | 是（async httpx） |
| **aiohttp** | 第三方 | 异步专用 | 是 |

> 💡 **避坑提示**：\`requests\` 虽然最流行，但**不支持异步**。在 FastAPI/asyncio 项目中用 \`httpx\` 或 \`aiohttp\`。在 \`async def\` 路由中调用 \`requests.get()\` 会阻塞事件循环。

### 二、urllib：标准库基础

\`urllib\` 是 Python 内置的 HTTP 库，无需安装：

\`\`\`python
from urllib.request import urlopen, Request
from urllib.parse import urlencode, quote
from urllib.error import URLError, HTTPError

# GET 请求
response = urlopen("https://httpbin.org/get")
html = response.read().decode("utf-8")
print(response.status)   # 200
print(response.headers)  # 响应头

# 带查询参数
params = {"q": "python", "page": "2"}
url = "https://httpbin.org/get?" + urlencode(params)
response = urlopen(url)

# POST 请求
data = urlencode({"name": "Alice", "age": 25}).encode("utf-8")
response = urlopen("https://httpbin.org/post", data=data)

# 自定义请求头
req = Request("https://httpbin.org/get", headers={"User-Agent": "MyApp/1.0"})
response = urlopen(req)

# 错误处理
try:
    response = urlopen("https://httpbin.org/status/404")
except HTTPError as e:
    print(f"HTTP 错误: {e.code} {e.reason}")
except URLError as e:
    print(f"URL 错误: {e.reason}")
\`\`\`

\`urllib\` 的缺点：API 分散（\`urllib.request\`、\`urllib.parse\`、\`urllib.error\`）、不支持 Session、链式调用不便。

### 三、requests：最优雅的 HTTP 库

\`requests\` 由 Kenneth Reitz 开发，口号是 "HTTP for Humans"：

\`\`\`bash
pip install requests
\`\`\`

#### 基本 GET/POST

\`\`\`python
import requests

# GET
resp = requests.get("https://httpbin.org/get", params={"q": "python"})
print(resp.status_code)    # 200
print(resp.text)           # 响应文本
print(resp.json())         # 自动解析 JSON
print(resp.headers)        # 响应头
print(resp.encoding)       # 编码

# POST
resp = requests.post("https://httpbin.org/post", data={"name": "Alice"})
resp = requests.post("https://httpbin.org/post", json={"name": "Alice"})  # JSON body

# PUT / DELETE / PATCH
requests.put(url, data={...})
requests.delete(url)
requests.patch(url, data={...})
\`\`\`

#### 请求头与认证

\`\`\`python
# 自定义请求头
headers = {
    "User-Agent": "MyApp/1.0",
    "Accept": "application/json",
    "Authorization": "Bearer token123",
}
resp = requests.get(url, headers=headers)

# Basic Auth
from requests.auth import HTTPBasicAuth
resp = requests.get(url, auth=HTTPBasicAuth("user", "pass"))

# 简写
resp = requests.get(url, auth=("user", "pass"))
\`\`\`

#### Session 会话

\`Session\` 复用 TCP 连接、保持 Cookie，适合连续请求：

\`\`\`python
# 不用 Session：每次请求新建连接
for i in range(10):
    requests.get(url)  # 10 次 TCP 握手

# 用 Session：复用连接
with requests.Session() as s:
    s.headers.update({"Authorization": "Bearer token"})  # 全局头
    for i in range(10):
        s.get(url)  # 复用连接，更快
    # Session 自动管理 Cookie
    s.post(login_url, data={...})  # 登录
    s.get(profile_url)             # 带 Cookie 访问
\`\`\`

#### 超时与重试

\`\`\`python
# 超时
resp = requests.get(url, timeout=5)        # 5 秒超时
resp = requests.get(url, timeout=(3, 10))  # 连接 3s，读取 10s

# 重试（配合 urllib3 Retry）
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.5,
              status_forcelist=[500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("http://", adapter)
session.mount("https://", adapter)
\`\`\`

> ⚠️ **避坑提示**：**永远**设置 \`timeout\`！不设超时的 \`requests.get()\` 在网络异常时会**永久挂起**，拖垮整个服务。推荐 \`timeout=5\` 或更短。

### 四、httpx：现代异步 HTTP 客户端

\`httpx\` 的 API 与 \`requests\` 几乎一致，但支持异步和 HTTP/2：

\`\`\`bash
pip install httpx
\`\`\`

\`\`\`python
import httpx

# 同步用法（和 requests 一样）
resp = httpx.get("https://httpbin.org/get", params={"q": "python"})
print(resp.json())

# 异步用法
import asyncio
async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://httpbin.org/get")
        print(resp.json())

asyncio.run(main())

# HTTP/2 支持
client = httpx.Client(http2=True)
\`\`\`

#### 并发请求

\`\`\`python
async def fetch_all(urls):
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return responses

urls = [f"https://httpbin.org/get?id={i}" for i in range(10)]
results = asyncio.run(fetch_all(urls))
\`\`\`

### 五、requests vs httpx vs urllib 对比

| 维度 | urllib | requests | httpx |
|------|--------|----------|-------|
| 安装 | 内置 | pip install | pip install |
| API 简洁度 | 低 | 高 | 高 |
| 异步支持 | 否 | 否 | 是 |
| HTTP/2 | 否 | 否 | 是 |
| Session | 手动 | 内置 | 内置 |
| 性能 | 中 | 中 | 高（异步） |
| 适合场景 | 简单请求/标准库 | 通用 | 异步项目 |

### 六、业务场景

#### 调用第三方 API

\`\`\`python
import requests

resp = requests.get(
    "https://api.github.com/users/torvalds",
    headers={"Accept": "application/vnd.github.v3+json"},
    timeout=5,
)
user = resp.json()
print(user["login"], user["public_repos"])
\`\`\`

#### Webhook 回调

\`\`\`python
def send_webhook(url, event, data):
    payload = {"event": event, "data": data, "timestamp": time.time()}
    resp = requests.post(url, json=payload, timeout=5)
    resp.raise_for_status()  # 非 2xx 抛异常
\`\`\`

#### 文件下载

\`\`\`python
# 流式下载大文件
with requests.get(url, stream=True) as r:
    r.raise_for_status()
    with open("bigfile.zip", "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
\`\`\`

### 七、原理深入

#### requests 的底层

\`requests\` 底层基于 \`urllib3\`，\`urllib3\` 又基于 \`http.client\`（标准库）：

\`\`\`
requests → urllib3 → http.client → socket
\`\`\`

\`urllib3\` 提供：连接池、重试、HTTP/1.1 keep-alive。\`requests\` 在其上提供更友好的 API。

#### 连接池

\`Session\` 内部维护连接池，复用 TCP 连接：

- 首次请求：DNS 解析 → TCP 握手 → TLS 握手 → HTTP 请求
- 后续请求（同 host）：直接 HTTP 请求（复用连接）

这省去了重复握手，大幅提升性能。所以**连续请求同一服务时务必用 Session**。

### 八、最佳实践总结

- **必须设置 timeout**，防止永久挂起
- 连续请求用 \`Session\`，复用连接池
- 异步项目（FastAPI）用 \`httpx\`，不用 \`requests\`
- 生产环境配置重试（\`Retry\` + \`HTTPAdapter\`）
- 用 \`resp.raise_for_status()\` 检查 HTTP 错误
- 大文件用 \`stream=True\` 流式下载
- 敏感信息（token）从环境变量读取，不硬编码
- 用 \`resp.json()\` 替代手动 \`json.loads(resp.text)\``,
    code: `# HTTP 客户端概念演示：用模拟数据演示 requests/httpx 的核心概念
# 不依赖 requests/httpx，纯标准库（演示环境不发起真实网络请求）

print("=== HTTP 客户端（requests/httpx/urllib）演示 ===\\n")

from urllib.request import Request
from urllib.parse import urlencode, quote, urlparse, parse_qs
from urllib.error import URLError, HTTPError
import json
import time

# --- 0. 模拟服务器（避免真实网络请求） ---
print("--- 0. 模拟服务器（用预设响应代替真实 HTTP 请求） ---\\n")

class _MockResponse:
    """模拟 urllib 响应对象"""
    def __init__(self, status, headers, body):
        self._status = status
        self._headers = headers
        self._body = body.encode("utf-8") if isinstance(body, str) else body
    def getcode(self):
        return self._status
    @property
    def headers(self):
        return self._headers
    def read(self):
        return self._body

def _mock_urlopen(req_or_url, timeout=5):
    """模拟 urlopen：根据 URL 返回预设响应，不发起真实网络请求"""
    if hasattr(req_or_url, "full_url"):
        url = req_or_url.full_url
        req_data = getattr(req_or_url, "data", None)
        req_headers = getattr(req_or_url, "headers", {})
    else:
        url = str(req_or_url)
        req_data = None
        req_headers = {}
    time.sleep(0.02)  # 极短延迟，模拟网络往返
    if "status/404" in url:
        raise HTTPError(url, 404, "Not Found", {}, None)
    if "delay/10" in url:
        raise URLError("timed out")
    if "/get" in url:
        parsed = urlparse(url)
        args = {k: v[0] for k, v in parse_qs(parsed.query).items()}
        body = json.dumps({"args": args, "origin": "127.0.0.1", "url": url})
        return _MockResponse(200, {"Content-Type": "application/json"}, body)
    if "/post" in url:
        form, json_data = {}, None
        ct = "".join(str(v) for k, v in req_headers.items() if k.lower() == "content-type")
        if req_data:
            if "json" in ct.lower():
                json_data = json.loads(req_data.decode("utf-8"))
            else:
                form = {k: v[0] for k, v in parse_qs(req_data.decode("utf-8")).items()}
        body = json.dumps({"form": form, "json": json_data, "origin": "127.0.0.1"})
        return _MockResponse(200, {"Content-Type": "application/json"}, body)
    return _MockResponse(200, {"Content-Type": "text/plain"}, "OK")

# --- 1. 模拟 requests 的 API 风格 ---
print("--- 1. 模拟 requests 简洁 API（基于 urllib 封装） ---")

class Response:
    """模拟 requests.Response 对象"""
    def __init__(self, urllib_resp):
        self._resp = urllib_resp
        self.status_code = urllib_resp.getcode()
        self.headers = dict(urllib_resp.headers)
        self._content = urllib_resp.read()
        self.encoding = "utf-8"

    @property
    def text(self):
        return self._content.decode(self.encoding)

    def json(self):
        return json.loads(self.text)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise HTTPError(self.status_code, "HTTP Error", None, None, None)

class Session:
    """模拟 requests.Session，复用连接、全局头"""
    def __init__(self):
        self.headers = {}

    def get(self, url, params=None, timeout=5):
        return self._request("GET", url, params=params, timeout=timeout)

    def post(self, url, data=None, json_body=None, timeout=5):
        return self._request("POST", url, data=data, json_body=json_body, timeout=timeout)

    def _request(self, method, url, params=None, data=None, json_body=None, timeout=5):
        # 构造 URL
        if params:
            url = url + "?" + urlencode(params)

        # 构造请求体
        body = None
        headers = dict(self.headers)
        if json_body is not None:
            body = json.dumps(json_body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif data:
            body = urlencode(data).encode("utf-8")
            headers["Content-Type"] = "application/x-www-form-urlencoded"

        req = Request(url, data=body, headers=headers, method=method)
        resp = _mock_urlopen(req, timeout=timeout)
        return Response(resp)

# --- 2. 演示 GET 请求 ---
print("\\n--- 2. GET 请求（访问 httpbin.org） ---")

try:
    resp = Session().get("https://httpbin.org/get", params={"q": "python", "page": "2"})
    print(f"  状态码: {resp.status_code}")
    print(f"  响应头 Content-Type: {resp.headers.get('Content-Type')}")
    data = resp.json()
    print(f"  服务器收到的参数: {data.get('args')}")
    print(f"  服务器看到的来源 IP: {data.get('origin')}")
except Exception as e:
    print(f"  网络请求失败（演示环境）: {type(e).__name__}: {e}")
    print("  (概念演示继续，使用模拟数据)")

# --- 3. 演示 POST 请求 ---
print("\\n--- 3. POST 请求（表单与 JSON） ---")

try:
    # 表单 POST
    resp = Session().post("https://httpbin.org/post", data={"username": "alice", "age": "25"})
    data = resp.json()
    print(f"  表单 POST: 服务器收到 form={data.get('form')}")

    # JSON POST
    resp = Session().post("https://httpbin.org/post", json_body={"name": "Bob", "tags": ["a", "b"]})
    data = resp.json()
    print(f"  JSON POST: 服务器收到 json={data.get('json')}")
except Exception as e:
    print(f"  网络请求失败（演示环境）: {type(e).__name__}")
    # 用模拟数据演示
    print("  模拟表单 POST: 服务器收到 form={{'username': 'alice', 'age': '25'}}")
    print("  模拟 JSON POST: 服务器收到 json={{'name': 'Bob', 'tags': ['a', 'b']}}")

# --- 4. 演示 Session 复用连接 ---
print("\\n--- 4. Session 会话复用 ---")

import time

def benchmark_with_session():
    """用 Session 复用连接"""
    session = Session()
    session.headers.update({"User-Agent": "Demo/1.0"})
    t0 = time.time()
    count = 0
    for i in range(3):
        try:
            resp = session.get("https://httpbin.org/get")
            count += 1
        except Exception:
            pass
    return count, time.time() - t0

count, elapsed = benchmark_with_session()
if count > 0:
    print(f"  Session 发送 {count} 个请求, 耗时 {elapsed:.2f}s")
    print(f"  (复用 TCP 连接, 比独立请求更快)")
else:
    print(f"  网络不可用, 概念说明: Session 复用 TCP 连接")
    print(f"  独立请求: 每次都 DNS+TCP+TLS 握手")
    print(f"  Session:  首次握手, 后续复用连接")

# --- 5. 演示超时与错误处理 ---
print("\\n--- 5. 超时与错误处理 ---")

# 模拟超时
def fetch_with_timeout(url, timeout=2):
    """模拟 requests.get(url, timeout=2)"""
    try:
        resp = _mock_urlopen(url, timeout=timeout)
        return resp.getcode(), resp.read().decode()
    except HTTPError as e:
        return e.code, f"HTTP 错误: {e.reason}"
    except URLError as e:
        return None, f"URL 错误: {e.reason}"
    except Exception as e:
        return None, f"其他错误: {type(e).__name__}"

# 测试正常请求
status, body = fetch_with_timeout("https://httpbin.org/get", timeout=5)
print(f"  正常请求: status={status}")

# 测试 404
status, body = fetch_with_timeout("https://httpbin.org/status/404", timeout=5)
print(f"  404 请求: status={status}, body={body}")

# 测试超时（故意访问慢地址）
status, body = fetch_with_timeout("https://httpbin.org/delay/10", timeout=2)
print(f"  超时请求: status={status}, body={body}")

# --- 6. 模拟异步 HTTP（httpx.AsyncClient 概念） ---
print("\\n--- 6. 模拟 httpx 异步并发请求 ---")

import asyncio
import concurrent.futures

def sync_fetch(url):
    """模拟同步 HTTP 请求"""
    try:
        resp = _mock_urlopen(url, timeout=5)
        return resp.getcode()
    except Exception:
        return None

async def async_fetch_all(urls):
    """模拟 httpx.AsyncClient 并发请求
    实际 httpx 用 async/await, 这里用线程池模拟并发概念"""
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        tasks = [loop.run_in_executor(pool, sync_fetch, url) for url in urls]
        results = await asyncio.gather(*tasks)
    return results

urls = [f"https://httpbin.org/get?id={i}" for i in range(5)]
try:
    t0 = time.time()
    results = asyncio.run(async_fetch_all(urls))
    elapsed = time.time() - t0
    print(f"  并发 {len(urls)} 个请求, 耗时 {elapsed:.2f}s")
    print(f"  结果: {results}")
    print("  (异步并发总耗时 ≈ 单个请求耗时, 非累加)")
except Exception as e:
    print(f"  演示环境网络受限, 概念: 异步并发总耗时 ≈ 单个请求耗时")

# --- 7. 最佳实践总结 ---
print("\\n--- 7. HTTP 客户端最佳实践 ---")
tips = [
    "永远设置 timeout, 防止永久挂起",
    "连续请求用 Session, 复用连接池",
    "异步项目（FastAPI）用 httpx, 不用 requests",
    "生产配置重试: Retry + HTTPAdapter",
    "用 resp.raise_for_status() 检查 HTTP 错误",
    "大文件用 stream=True 流式下载",
    "敏感信息从环境变量读取, 不硬编码",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== HTTP 客户端演示结束 ===")`
  },
  {
    id: "py6-crawler-basic",
    group: "Web 与爬虫实战",
    icon: "🕷️",
    title: "网络爬虫基础（urllib+re）",
    content: `## 网络爬虫基础（urllib+re）

### 一、爬虫工作原理

网络爬虫（Web Crawler/Spider）自动获取网页数据。基本流程：

\`\`\`
1. 请求（Request）：向目标 URL 发送 HTTP 请求
2. 响应（Response）：接收服务器返回的 HTML/JSON
3. 解析（Parse）：从响应中提取需要的数据
4. 存储（Store）：保存到文件/数据库
5. 跟踪（Follow）：从页面中提取新 URL，继续爬取
\`\`\`

> 💡 **避坑提示**：爬虫前**必须**检查目标网站的 \`robots.txt\` 和服务条款。未经授权爬取可能违法，尤其是涉及个人信息和版权内容。

### 二、urllib.request 基础

Python 标准库 \`urllib.request\` 提供基本的 HTTP 请求能力：

\`\`\`python
from urllib.request import urlopen, Request

# 最简爬虫
response = urlopen("https://www.example.com")
html = response.read().decode("utf-8")
print(html[:200])

# 带请求头
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
req = Request("https://www.example.com", headers=headers)
response = urlopen(req)
\`\`\`

### 三、User-Agent 与请求头

很多网站根据 \`User-Agent\` 识别访问者。默认的 \`Python-urllib/3.x\` 容易被封：

\`\`\`python
# 常见 User-Agent
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148",
]

# 随机选择 User-Agent
import random
headers = {"User-Agent": random.choice(USER_AGENTS)}

# 其他常用头
headers.update({
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://www.google.com/",
})
\`\`\`

### 四、robots.txt 礼仪

\`robots.txt\` 是网站告知爬虫哪些页面可爬的协议。**虽然不强制**，但遵守是基本礼仪：

\`\`\`
# robots.txt 示例
User-agent: *              # 对所有爬虫
Disallow: /admin/          # 禁止爬取 /admin/
Disallow: /private/        # 禁止爬取 /private/
Allow: /public/           # 允许爬取 /public/
Crawl-delay: 1            # 请求间隔 1 秒
\`\`\`

Python 标准库 \`urllib.robotparser\` 可解析：

\`\`\`python
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url("https://www.example.com/robots.txt")
rp.read()

# 检查是否允许爬取
can_crawl = rp.can_fetch("MyBot", "https://www.example.com/public/page")
print(can_crawl)  # True 或 False
\`\`\`

### 五、正则表达式提取数据

\`re\` 模块是从 HTML 中提取数据的轻量方案：

\`\`\`python
import re

html = '''
<a href="https://example.com/page1">链接1</a>
<a href="https://example.com/page2">链接2</a>
<img src="https://example.com/img/photo.jpg" alt="照片">
<div class="price">¥99.00</div>
'''

# 提取所有链接
links = re.findall(r'<a\\s+href="([^"]+)">([^<]+)</a>', html)
for url, text in links:
    print(f"{text}: {url}")

# 提取图片地址
imgs = re.findall(r'<img\\s+src="([^"]+)"', html)

# 提取价格
prices = re.findall(r'¥([\\d.]+)', html)
\`\`\`

#### 常用正则模式

| 场景 | 正则 | 说明 |
|------|------|------|
| 提取链接 | \`href="([^"]+)"\` | 匹配 href 属性值 |
| 提取图片 | \`<img\\s+src="([^"]+)"\` | 匹配 img src |
| 提取邮箱 | \`[\\w.-]+@[\\w.-]+\\.\\w+\` | 标准邮箱格式 |
| 提取手机号 | \`1[3-9]\\d{9}\` | 中国手机号 |
| 提取数字 | \`\\d+(\\.\\d+)?\` | 整数或小数 |
| 提取中文 | \`[\\u4e00-\\u9fa5]+\` | 中文字符 |

> ⚠️ **避坑提示**：正则解析 HTML 很**脆弱**——HTML 结构稍变就会失效。复杂页面用 BeautifulSoup 或 lxml 更稳健。正则适合结构简单、规则明确的数据。

### 六、URL 管理与去重

爬虫需要管理待爬 URL 和已爬 URL，避免重复：

\`\`\`python
class URLManager:
    def __init__(self):
        self.pending = set()   # 待爬
        self.visited = set()   # 已爬

    def add(self, url):
        if url not in self.visited:
            self.pending.add(url)

    def next(self):
        if not self.pending:
            return None
        url = self.pending.pop()
        self.visited.add(url)
        return url

    def __len__(self):
        return len(self.pending)
\`\`\`

### 七、限速与重试

爬虫必须控制频率，避免压垮服务器或被封 IP：

\`\`\`python
import time
import random

def crawl_with_rate_limit(url, max_retries=3, delay=1.0):
    for attempt in range(max_retries):
        try:
            response = urlopen(url, timeout=10)
            return response.read().decode("utf-8")
        except Exception as e:
            print(f"第 {attempt+1} 次失败: {e}")
            if attempt < max_retries - 1:
                # 指数退避 + 随机抖动
                wait = delay * (2 ** attempt) + random.random()
                time.sleep(wait)
    return None
\`\`\`

### 八、完整爬虫示例

\`\`\`python
from urllib.request import urlopen, Request
from urllib.robotparser import RobotFileParser
import re
import time
import random

class SimpleCrawler:
    def __init__(self, name="MyBot"):
        self.name = name
        self.visited = set()
        self.headers = {"User-Agent": f"{name}/1.0"}

    def can_crawl(self, url):
        """检查 robots.txt"""
        rp = RobotFileParser()
        base = "/".join(url.split("/")[:3])
        rp.set_url(f"{base}/robots.txt")
        try:
            rp.read()
            return rp.can_fetch(self.name, url)
        except Exception:
            return True  # 无 robots.txt 则允许

    def fetch(self, url):
        """获取页面"""
        req = Request(url, headers=self.headers)
        response = urlopen(req, timeout=10)
        return response.read().decode("utf-8")

    def extract_links(self, html):
        """提取页面中的链接"""
        return re.findall(r'href="([^"]+)"', html)

    def crawl(self, start_url, max_pages=10):
        """爬取"""
        queue = [start_url]
        while queue and len(self.visited) < max_pages:
            url = queue.pop(0)
            if url in self.visited:
                continue
            if not self.can_crawl(url):
                print(f"跳过（robots.txt 禁止）: {url}")
                continue

            print(f"爬取: {url}")
            html = self.fetch(url)
            self.visited.add(url)

            # 提取新链接
            for link in self.extract_links(html):
                if link.startswith("http") and link not in self.visited:
                    queue.append(link)

            # 礼貌等待
            time.sleep(1 + random.random())
\`\`\`

### 九、业务场景

- **价格监控**：定期爬取电商商品价格
- **数据采集**：新闻、博客、论坛内容
- **SEO 分析**：抓取竞争对手网站结构
- **学术研究**：论文、专利数据收集
- **舆情监控**：社交媒体话题跟踪

### 十、法律与道德边界

> ⚠️ **重要警告**：爬虫有法律风险！

1. **著作权**：大量复制他人内容可能侵权
2. **个人信息保护法**：爬取个人信息（姓名、电话）需合法依据
3. **计算机犯罪法**：绕过技术保护措施可能违法
4. **服务条款**：违反网站 ToS 可被追责

**合规原则**：
- 只爬公开数据
- 遵守 robots.txt
- 控制频率，不影响目标网站
- 不爬个人隐私信息
- 商业使用需获授权

### 十一、最佳实践总结

- 遵守 \`robots.txt\`，用 \`urllib.robotparser\` 检查
- 设置合理的 User-Agent，标明身份
- 限速：每秒 1-2 个请求，加随机延迟
- 重试机制：指数退避，3 次重试
- URL 去重，避免重复爬取
- 超时设置：10 秒，避免永久挂起
- 数据存储用 JSON/CSV/数据库
- 复杂解析用 BeautifulSoup 替代正则`,
    code: `# 网络爬虫基础演示：用标准库 urllib + re 模拟爬虫全流程
# 不依赖 requests/BeautifulSoup，纯标准库

print("=== 网络爬虫基础（urllib + re）演示 ===\\n")

from urllib.request import urlopen, Request
from urllib.robotparser import RobotFileParser
from urllib.error import URLError, HTTPError
import re
import time
import random

# --- 1. 模拟爬虫核心组件 ---
print("--- 1. URL 管理器（待爬 + 已爬去重） ---")

class URLManager:
    """URL 管理器：管理待爬队列和已爬集合"""
    def __init__(self):
        self.pending = []       # 待爬队列（FIFO）
        self.pending_set = set()  # 待爬集合（快速查找）
        self.visited = set()    # 已爬集合

    def add(self, url):
        if url not in self.visited and url not in self.pending_set:
            self.pending.append(url)
            self.pending_set.add(url)

    def add_many(self, urls):
        for url in urls:
            self.add(url)

    def next(self):
        if not self.pending:
            return None
        url = self.pending.pop(0)
        self.pending_set.discard(url)
        self.visited.add(url)
        return url

    def stats(self):
        return f"待爬:{len(self.pending)} 已爬:{len(self.visited)}"

mgr = URLManager()
mgr.add("https://example.com/page1")
mgr.add("https://example.com/page2")
mgr.add("https://example.com/page1")  # 重复，不会添加
print(f"  添加 3 个 URL（1 个重复）: {mgr.stats()}")

url = mgr.next()
print(f"  取出: {url}, 剩余: {mgr.stats()}")

# --- 2. 模拟 User-Agent 池 ---
print("\\n--- 2. User-Agent 池与请求头 ---")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0",
]

def get_headers():
    """生成随机请求头"""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }

print(f"  随机 User-Agent: {get_headers()['User-Agent'][:50]}...")
print(f"  (模拟浏览器, 避免被识别为爬虫)")

# --- 3. robots.txt 检查 ---
print("\\n--- 3. robots.txt 礼仪检查 ---")

# 用本地模拟的 robots.txt
robots_content = """User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/
Crawl-delay: 1
"""

# 用 robotparser 解析模拟内容
rp = RobotFileParser()
rp.parse(robots_content.splitlines())

test_urls = [
    "https://example.com/public/page1",
    "https://example.com/admin/secret",
    "https://example.com/private/data",
    "https://example.com/index.html",
]
for url in test_urls:
    allowed = rp.can_fetch("*", url)
    print(f"  {url} -> {'允许' if allowed else '禁止'}")

# --- 4. 正则表达式提取数据 ---
print("\\n--- 4. 正则提取 HTML 数据 ---")

# 模拟 HTML 页面
mock_html = '''
<html>
<body>
  <h1>商品列表</h1>
  <div class="product">
    <a href="/p/1001">iPhone 15</a>
    <span class="price">¥5999.00</span>
    <img src="/img/iphone15.jpg" alt="iPhone">
  </div>
  <div class="product">
    <a href="/p/1002">MacBook Pro</a>
    <span class="price">¥12999.00</span>
    <img src="/img/macbook.jpg" alt="Mac">
  </div>
  <div class="product">
    <a href="/p/1003">AirPods</a>
    <span class="price">¥1299.00</span>
    <img src="/img/airpods.jpg" alt="AirPods">
  </div>
</body>
</html>
'''

# 提取商品链接和名称
products = re.findall(r'<a\\s+href="([^"]+)">([^<]+)</a>', mock_html)
print("  提取商品链接:")
for url, name in products:
    print(f"    {name}: {url}")

# 提取价格
prices = re.findall(r'¥([\\d.]+)', mock_html)
print(f"  提取价格: {prices}")

# 提取图片
images = re.findall(r'<img\\s+src="([^"]+)"\\s+alt="([^"]+)"', mock_html)
print(f"  提取图片:")
for src, alt in images:
    print(f"    {alt}: {src}")

# 提取所有链接
all_links = re.findall(r'href="([^"]+)"', mock_html)
print(f"  所有链接: {all_links}")

# --- 5. 限速与重试机制 ---
print("\\n--- 5. 限速与重试 ---")

def fetch_with_retry(url, max_retries=3, base_delay=0.1):
    """带重试和指数退避的请求"""
    for attempt in range(max_retries):
        try:
            # 模拟请求（本地不实际发网络请求）
            if random.random() < 0.3:  # 30% 概率模拟失败
                raise ConnectionError("模拟网络错误")
            return f"成功获取 {url}"
        except Exception as e:
            print(f"    第 {attempt+1} 次失败: {e}")
            if attempt < max_retries - 1:
                wait = base_delay * (2 ** attempt) + random.random() * 0.1
                print(f"    等待 {wait:.2f}s 后重试...")
                time.sleep(wait)
    return f"放弃: {url}"

# 演示重试
random.seed(42)  # 固定随机种子便于演示
for i in range(3):
    result = fetch_with_retry(f"https://example.com/page{i}")
    print(f"  请求 {i}: {result}")

# --- 6. 完整爬虫流程模拟 ---
print("\\n--- 6. 完整爬虫流程模拟（本地 HTML） ---")

class SimpleCrawler:
    """简化爬虫：用本地 HTML 模拟爬取流程"""
    def __init__(self):
        self.visited = set()
        self.url_mgr = URLManager()
        self.data = []

    def extract_links(self, html):
        return re.findall(r'href="([^"]+)"', html)

    def extract_data(self, html):
        products = re.findall(r'<a\\s+href="([^"]+)">([^<]+)</a>.*?¥([\\d.]+)', html, re.DOTALL)
        return [{"url": u, "name": n, "price": p} for u, n, p in products]

    def crawl(self, seed_url, mock_pages):
        """模拟爬取（mock_pages: url -> html 字典）"""
        self.url_mgr.add(seed_url)
        while self.url_mgr.pending:
            url = self.url_mgr.next()
            print(f"  爬取: {url}")

            # 模拟获取页面
            html = mock_pages.get(url, "")
            if not html:
                print(f"    页面不存在或为空")
                continue

            # 提取数据
            data = self.extract_data(html)
            if data:
                print(f"    提取数据: {len(data)} 条")
                self.data.extend(data)

            # 提取新链接
            new_links = self.extract_links(html)
            for link in new_links:
                if link.startswith("http"):
                    self.url_mgr.add(link)

            # 礼貌等待
            time.sleep(0.05)

# 模拟多个页面
mock_pages = {
    "https://shop.example.com/": mock_html,
    "https://shop.example.com/p/1001": '<a href="https://shop.example.com/p/1004">配件</a>',
    "https://shop.example.com/p/1004": '<a href="/p/1001">iPhone</a>',
}

crawler = SimpleCrawler()
crawler.crawl("https://shop.example.com/", mock_pages)
print(f"\\n  爬取结果: 共 {len(crawler.data)} 条商品")
for item in crawler.data:
    print(f"    {item['name']}: ¥{item['price']} ({item['url']})")

# --- 7. 最佳实践总结 ---
print("\\n--- 7. 爬虫最佳实践 ---")
tips = [
    "遵守 robots.txt, 用 urllib.robotparser 检查",
    "设置合理 User-Agent, 标明爬虫身份",
    "限速: 每秒 1-2 请求, 加随机延迟",
    "重试: 指数退避, 最多 3 次",
    "URL 去重, 避免重复爬取",
    "超时 10 秒, 避免永久挂起",
    "只爬公开数据, 不碰个人信息",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== 爬虫基础演示结束 ===")`
  },
  {
    id: "py6-beautifulsoup",
    group: "Web 与爬虫实战",
    icon: "🍲",
    title: "BeautifulSoup HTML 解析",
    content: `## BeautifulSoup HTML 解析

### 一、BeautifulSoup 简介

BeautifulSoup（bs4）是 Python 最流行的 HTML/XML 解析库。相比正则表达式，它将 HTML 解析为**文档树**，用 DOM 方式定位元素，更稳健、更易读。

\`\`\`bash
pip install beautifulsoup4
# 推荐同时安装 lxml（更快的解析器）
pip install lxml
\`\`\`

> 💡 **避坑提示**：BeautifulSoup 本身不解析 HTML，它只是**包装**解析器。解析器有 \`html.parser\`（标准库）、\`lxml\`（最快）、\`html5lib\`（最兼容）。生产环境推荐 \`lxml\`。

### 二、解析 HTML 文档

\`\`\`python
from bs4 import BeautifulSoup

html = """
<html>
  <head><title>示例页面</title></head>
  <body>
    <div id="main" class="content">
      <h1>商品列表</h1>
      <ul>
        <li class="item">iPhone 15 - ¥5999</li>
        <li class="item">MacBook - ¥12999</li>
        <li class="item">AirPods - ¥1299</li>
      </ul>
    </div>
  </body>
</html>
"""

# 创建 BeautifulSoup 对象
soup = BeautifulSoup(html, "html.parser")  # 或 "lxml"

# 获取标题
print(soup.title.string)        # 示例页面
print(soup.title.text)          # 示例页面

# 获取标签
print(soup.h1.string)           # 商品列表
print(soup.div["id"])           # main
print(soup.div["class"])        # ['content']
\`\`\`

### 三、find / find_all 查找

\`find\` 返回第一个匹配，\`find_all\` 返回所有匹配：

\`\`\`python
# 查找所有 <li> 标签
items = soup.find_all("li")
for li in items:
    print(li.string)

# 按属性查找
soup.find("div", id="main")
soup.find_all("li", class_="item")  # class 是 Python 关键字，用 class_

# 组合条件
soup.find_all("li", class_="item", limit=2)  # 只取前 2 个

# 按文本内容查找
soup.find_all(string=re.compile("iPhone"))

# 链式查找
ul = soup.find("ul")
items = ul.find_all("li")  # 在 ul 内查找

# find 递归 vs 非递归
soup.find_all("li", recursive=False)  # 只查直接子节点
\`\`\`

#### 查找方法汇总

| 方法 | 返回 | 说明 |
|------|------|------|
| \`soup.find(name, attrs)\` | 第一个匹配标签 | |
| \`soup.find_all(name, attrs)\` | 列表 | 所有匹配 |
| \`soup.find_parent()\` | 父标签 | 向上找 |
| \`soup.find_next_sibling()\` | 下一个兄弟 | |
| \`soup.find_previous_sibling()\` | 上一个兄弟 | |
| \`soup.select(css)\` | 列表 | CSS 选择器 |

### 四、CSS 选择器 select

\`select\` 支持 CSS 选择器语法，更灵活：

\`\`\`python
# 标签选择器
soup.select("li")               # 所有 <li>
soup.select("div li")           # div 内的 li（后代）

# 类选择器
soup.select(".item")            # class="item"
soup.select("li.item")          # <li class="item">

# ID 选择器
soup.select("#main")            # id="main"
soup.select("div#main")         # <div id="main">

# 属性选择器
soup.select('a[href]')          # 有 href 属性的 a
soup.select('a[href="/page"]')  # href 等于 /page
soup.select('a[href^="/p"]')    # href 以 /p 开头
soup.select('a[href$=".html"]')  # href 以 .html 结尾

# 组合选择器
soup.select("div.content > ul > li.item")  # 子代选择器
soup.select("li:first-child")   # 第一个 li

# select_one 返回第一个
soup.select_one(".item")
\`\`\`

### 五、获取属性与文本

\`\`\`python
li = soup.find("li", class_="item")

# 获取文本
print(li.string)     # 直接文本（仅当只有一个 NavigableString 子节点）
print(li.text)       # 所有文本（含子标签文本，拼接）
print(li.get_text())  # 同 text
print(li.get_text(strip=True))  # 去除空白
print(li.get_text("|"))  # 用 | 分隔

# 获取属性
a = soup.find("a")
print(a["href"])          # 直接索引（属性不存在会报错）
print(a.get("href"))      # get 方法（不存在返回 None）
print(a.get("href", ""))  # 带默认值
print(a.attrs)            # 所有属性字典
\`\`\`

### 六、遍历文档树

\`\`\`python
div = soup.find("div", id="main")

# 子节点
for child in div.children:      # 直接子节点（含文本节点）
    print(child)
for child in div.contents:      # 直接子节点列表
    print(child)

# 所有后代
for desc in div.descendants:    # 递归所有后代
    print(desc)

# 父节点
li = soup.find("li")
print(li.parent)             # 直接父节点
print(li.parents)            # 所有祖先

# 兄弟节点
print(li.next_sibling)       # 下一个兄弟（可能是空白文本）
print(li.next_element)       # 下一个元素
print(li.previous_sibling)   # 上一个兄弟
\`\`\`

### 七、解析器对比

| 解析器 | 速度 | 兼容性 | 安装 | 备注 |
|--------|------|--------|------|------|
| \`html.parser\` | 中 | 好 | 内置 | 标准库，无需安装 |
| \`lxml\` | 最快 | 好 | pip install | C 实现，推荐 |
| \`html5lib\` | 最慢 | 最好 | pip install | 完全按 HTML5 规范 |
| \`lxml-xml\` | 快 | XML | pip install | 解析 XML |

\`\`\`python
# 推荐用法：优先 lxml，回退 html.parser
try:
    soup = BeautifulSoup(html, "lxml")
except Exception:
    soup = BeautifulSoup(html, "html.parser")
\`\`\`

### 八、用标准库 html.parser 替代

如果不想安装第三方库，标准库 \`html.parser\` 也能解析 HTML，只是 API 不如 BeautifulSoup 友好：

\`\`\`python
from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_item = False
        self.items = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "li" and attrs_dict.get("class") == "item":
            self.in_item = True

    def handle_data(self, data):
        if self.in_item:
            self.items.append(data.strip())

    def handle_endtag(self, tag):
        if tag == "li":
            self.in_item = False

parser = MyParser()
parser.feed(html)
print(parser.items)
\`\`\`

### 九、业务场景

#### 电商商品采集

\`\`\`python
soup = BeautifulSoup(html, "lxml")
products = soup.select("div.product")
for p in products:
    name = p.select_one("h3.name").text
    price = p.select_one("span.price").text
    link = p.select_one("a")["href"]
\`\`\`

#### 新闻列表提取

\`\`\`python
articles = soup.find_all("article", class_="news")
for a in articles:
    title = a.h2.a.text
    url = a.h2.a["href"]
    date = a.find("time")["datetime"]
    summary = a.find("p", class_="summary").text
\`\`\`

### 十、BeautifulSoup vs lxml vs 正则 对比

| 维度 | BeautifulSoup | lxml | 正则 |
|------|---------------|------|------|
| 易用性 | 高 | 中 | 低 |
| 速度 | 中 | 快 | 最快 |
| 容错性 | 好 | 中 | 差 |
| CSS 选择器 | 支持 | 支持 | 不支持 |
| 学习曲线 | 低 | 中 | 低 |
| 适合场景 | 通用解析 | 高性能 | 简单提取 |

### 十一、最佳实践总结

- 优先用 \`lxml\` 解析器，回退 \`html.parser\`
- 简单查找用 \`find/find_all\`，复杂用 \`select\`（CSS）
- 获取属性用 \`.get()\`，不用 \`[]\`（避免 KeyError）
- 获取文本用 \`.get_text(strip=True)\` 去空白
- 解析大文件用 \`SoupStrainer\` 只解析部分，节省内存
- 不规则 HTML 用 \`html5lib\`（最容错）
- 提取后数据清洗：strip、replace、正则`,
    code: `# BeautifulSoup 概念演示：用标准库 html.parser 模拟 bs4 的核心功能
# 不依赖 beautifulsoup4，纯标准库

print("=== BeautifulSoup HTML 解析概念演示 ===\\n")

from html.parser import HTMLParser
import re

# --- 1. 模拟 BeautifulSoup 的文档树 ---
print("--- 1. 模拟 BeautifulSoup 文档树 ---")

class Node:
    """模拟 bs4 的 Tag 节点"""
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = dict(attrs) if attrs else {}
        self.children = []
        self.parent = None
        self.text_content = ""

    @property
    def text(self):
        """模拟 .text 属性：所有文本拼接"""
        parts = []
        if self.text_content:
            parts.append(self.text_content)
        for child in self.children:
            parts.append(child.text)
        return "".join(parts)

    def get_text(self, strip=False):
        t = self.text
        return t.strip() if strip else t

    def __getitem__(self, key):
        return self.attrs[key]

    def get(self, key, default=None):
        return self.attrs.get(key, default)

    def find(self, tag=None, **kwargs):
        """模拟 .find()：返回第一个匹配"""
        for child in self._all_descendants():
            if self._matches(child, tag, kwargs):
                return child
        return None

    def find_all(self, tag=None, limit=None, **kwargs):
        """模拟 .find_all()：返回所有匹配"""
        results = []
        for child in self._all_descendants():
            if self._matches(child, tag, kwargs):
                results.append(child)
                if limit and len(results) >= limit:
                    break
        return results

    def select(self, css_selector):
        """模拟 .select()：简化版 CSS 选择器"""
        results = []
        for child in self._all_descendants():
            if self._css_matches(child, css_selector):
                results.append(child)
        return results

    def _all_descendants(self):
        for child in self.children:
            yield child
            yield from child._all_descendants()

    def _matches(self, node, tag, kwargs):
        if tag and node.tag != tag:
            return False
        for k, v in kwargs.items():
            if k == "class_":
                k = "class"
            if node.attrs.get(k) != v:
                return False
        return True

    def _css_matches(self, node, selector):
        """简化 CSS：支持 .class、#id、tag"""
        if selector.startswith("."):
            return selector[1:] in node.attrs.get("class", "").split()
        elif selector.startswith("#"):
            return node.attrs.get("id") == selector[1:]
        else:
            return node.tag == selector

class BeautifulSoupMock:
    """模拟 BeautifulSoup"""
    def __init__(self, html, parser="html.parser"):
        self.root = Node("document")
        self._parse(html)

    def _parse(self, html):
        parser = TreeBuilder(self.root)
        parser.feed(html)

    def find(self, tag=None, **kwargs):
        return self.root.find(tag, **kwargs)

    def find_all(self, tag=None, **kwargs):
        return self.root.find_all(tag, **kwargs)

    def select(self, css):
        return self.root.select(css)

class TreeBuilder(HTMLParser):
    """将 HTML 解析为 Node 树"""
    def __init__(self, root):
        super().__init__()
        self.stack = [root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        node.parent = self.stack[-1]
        self.stack[-1].children.append(node)
        if tag not in ("br", "img", "hr", "input", "meta", "link"):
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        data = data.strip()
        if data:
            self.stack[-1].text_content += data

# --- 2. 测试解析 ---
print("\\n--- 2. 解析 HTML 并查找 ---")

html = """
<html>
<body>
  <div id="main" class="content">
    <h1>商品列表</h1>
    <ul>
      <li class="item">iPhone 15</li>
      <li class="item">MacBook Pro</li>
      <li class="item">AirPods</li>
      <li class="special">iPad</li>
    </ul>
    <a href="/page1">下一页</a>
    <a href="/about">关于</a>
  </div>
</body>
</html>
"""

soup = BeautifulSoupMock(html)

# find / find_all
title = soup.find("h1")
print(f"  find('h1'): {title.get_text(strip=True)}")

items = soup.find_all("li", class_="item")
print(f"  find_all('li', class_='item'): {[li.get_text(strip=True) for li in items]}")

all_li = soup.find_all("li")
print(f"  find_all('li'): {[li.get_text(strip=True) for li in all_li]}")

# 属性获取
first_link = soup.find("a")
print(f"  第一个链接 href: {first_link.get('href')}")
print(f"  第一个链接文本: {first_link.get_text(strip=True)}")

# --- 3. CSS 选择器 ---
print("\\n--- 3. CSS 选择器 select ---")

# 类选择器
items_by_class = soup.select(".item")
print(f"  select('.item'): {[n.get_text(strip=True) for n in items_by_class]}")

# ID 选择器
main_div = soup.select("#main")
print(f"  select('#main'): 找到 {len(main_div)} 个")

# 标签选择器
links = soup.select("a")
print(f"  select('a'): {[(n.get_text(strip=True), n.get('href')) for n in links]}")

# --- 4. 遍历文档树 ---
print("\\n--- 4. 遍历文档树 ---")

ul = soup.find("ul")
print(f"  ul 的直接子节点数: {len(ul.children)}")
print(f"  ul 下所有 li 文本:")
for child in ul.children:
    if child.tag == "li":
        cls = child.get("class", "")
        print(f"    <li class='{cls}'>{child.get_text(strip=True)}</li>")

# 父节点
first_item = soup.find("li")
print(f"  第一个 li 的父节点 tag: {first_item.parent.tag}")
print(f"  第一个 li 的祖父节点 tag: {first_item.parent.parent.tag}")

# --- 5. 实战：提取商品信息 ---
print("\\n--- 5. 实战：电商商品提取 ---")

shop_html = """
<div class="product-list">
  <div class="product">
    <h3 class="name">iPhone 15 Pro</h3>
    <span class="price">¥7999</span>
    <a href="/p/1001" class="buy-link">购买</a>
  </div>
  <div class="product">
    <h3 class="name">MacBook Air</h3>
    <span class="price">¥8999</span>
    <a href="/p/1002" class="buy-link">购买</a>
  </div>
  <div class="product">
    <h3 class="name">AirPods Pro</h3>
    <span class="price">¥1899</span>
    <a href="/p/1003" class="buy-link">购买</a>
  </div>
</div>
"""

soup2 = BeautifulSoupMock(shop_html)
products = soup2.select(".product")
print(f"  找到 {len(products)} 个商品:")
for p in products:
    name = p.select(".name")
    price = p.select(".price")
    link = p.select(".buy-link")
    name_text = name[0].get_text(strip=True) if name else "N/A"
    price_text = price[0].get_text(strip=True) if price else "N/A"
    href = link[0].get("href") if link else "N/A"
    print(f"    {name_text} | {price_text} | 链接: {href}")

# --- 6. 对比正则 vs BeautifulSoup ---
print("\\n--- 6. 正则 vs BeautifulSoup 对比 ---")

# 用正则提取同样的数据
regex_products = re.findall(
    r'<h3 class="name">([^<]+)</h3>.*?<span class="price">([^<]+)</span>.*?href="([^"]+)"',
    shop_html, re.DOTALL
)
print(f"  正则提取: {regex_products}")
print(f"  BeautifulSoup 提取: 更稳健, 不受换行/属性顺序影响")
print(f"  正则优势: 速度快, 适合简单结构")
print(f"  BS4 优势: 容错好, 支持复杂选择器")

# --- 7. 最佳实践总结 ---
print("\\n--- 7. BeautifulSoup 最佳实践 ---")
tips = [
    "优先用 lxml 解析器, 回退 html.parser",
    "简单查找用 find/find_all, 复杂用 select",
    "获取属性用 .get(), 不用 [] 避免 KeyError",
    "获取文本用 .get_text(strip=True)",
    "大文件用 SoupStrainer 只解析部分",
    "不规则 HTML 用 html5lib 最容错",
    "提取后清洗: strip/replace/正则",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== BeautifulSoup 演示结束 ===")`
  },
  {
    id: "py6-scrapy-overview",
    group: "Web 与爬虫实战",
    icon: "🦂",
    title: "Scrapy 爬虫框架概览",
    content: `## Scrapy 爬虫框架概览

### 一、Scrapy 简介

Scrapy 是 Python 最强大的**爬虫框架**，用于大规模数据采集。与 \`requests + BeautifulSoup\` 的"脚本式"爬虫不同，Scrapy 是一个**完整框架**，提供：

- 异步并发（基于 Twisted）
- 自动调度与去重
- 数据管道（Pipeline）
- 中间件机制
- 内置导出（JSON/CSV/XML）
- 命令行工具

\`\`\`bash
pip install scrapy
scrapy startproject myspider
\`\`\`

### 二、Scrapy 架构

Scrapy 由 5 大核心组件构成：

\`\`\`
                        +------------------+
                        |     Engine       |  核心调度
                        +--------+---------+
                                 |
            +--------------------+--------------------+
            |                    |                    |
   +--------+--------+  +--------+--------+  +--------+--------+
   |   Scheduler     |  |   Downloader    |  |     Spider      |
   |   (URL 队列)    |  |   (下载器)       |  |   (解析逻辑)     |
   +-----------------+  +-----------------+  +-----------------+
                                 |
                        +--------+---------+
                        |  Item Pipeline   |
                        |   (数据处理)     |
                        +------------------+
\`\`\`

| 组件 | 职责 |
|------|------|
| **Engine** | 核心引擎，协调各组件 |
| **Scheduler** | URL 调度器，管理待爬队列与去重 |
| **Downloader** | 下载器，发送请求、接收响应 |
| **Spider** | 爬虫，定义解析逻辑与产生新请求 |
| **Item Pipeline** | 数据管道，处理/清洗/存储 |

### 三、Spider 类与 parse 方法

Spider 是用户编写的核心类，定义如何爬取：

\`\`\`python
import scrapy

class QuoteSpider(scrapy.Spider):
    name = "quotes"              # 爬虫名（唯一标识）
    start_urls = [
        "https://quotes.toscrape.com/page/1/",
    ]

    def parse(self, response):
        """解析响应，提取数据并产生新请求"""
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }

        # 翻页：产生新请求
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
\`\`\`

运行：

\`\`\`bash
scrapy crawl quotes -o quotes.json
\`\`\`

### 四、Item 与 ItemLoader

\`Item\` 定义数据结构，类似 Django Model：

\`\`\`python
import scrapy

class QuoteItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()
\`\`\`

\`ItemLoader\` 提供更灵活的数据加载：

\`\`\`python
from itemloaders.processors import TakeFirst, Compose, MapCompose

class QuoteLoader(ItemLoader):
    default_item_class = QuoteItem
    default_output_processor = TakeFirst()
    text_in = MapCompose(str.strip)           # 输入处理：去空白
    tags_out = Compose(list)                  # 输出处理：转列表

# 在 Spider 中使用
loader = QuoteLoader(item=QuoteItem(), response=response)
loader.add_css("text", "span.text::text")
loader.add_css("author", "small.author::text")
loader.add_css("tags", "div.tags a.tag::text")
item = loader.load_item()
\`\`\`

### 五、Pipeline 数据处理

Pipeline 处理 Spider 产生的 Item（清洗、验证、存储）：

\`\`\`python
class PriceConversionPipeline:
    """价格转换"""
    def process_item(self, item, spider):
        if "price" in item:
            item["price"] = float(item["price"].replace("¥", ""))
        return item

class DuplicateFilterPipeline:
    """去重"""
    def __init__(self):
        self.seen = set()

    def process_item(self, item, spider):
        key = item.get("id")
        if key in self.seen:
            raise DropItem(f"重复: {key}")
        self.seen.add(key)
        return item

class MySQLPipeline:
    """存储到 MySQL"""
    def open_spider(self, spider):
        self.conn = connect_db()

    def process_item(self, item, spider):
        self.conn.execute("INSERT INTO ...", item)
        return item

    def close_spider(self, spider):
        self.conn.close()
\`\`\`

在 \`settings.py\` 启用：

\`\`\`python
ITEM_PIPELINES = {
    "myspider.pipelines.PriceConversionPipeline": 100,  # 数字越小越先执行
    "myspider.pipelines.DuplicateFilterPipeline": 200,
    "myspider.pipelines.MySQLPipeline": 300,
}
\`\`\`

### 六、Middlewares 中间件

中间件分两类：**Downloader Middleware**（下载中间件）和 **Spider Middleware**（爬虫中间件）。

\`\`\`python
class RandomUserAgentMiddleware:
    """随机 User-Agent"""
    def __init__(self):
        self.agents = ["UA1", "UA2", "UA3"]

    def process_request(self, request, spider):
        request.headers["User-Agent"] = random.choice(self.agents)

class ProxyMiddleware:
    """代理 IP"""
    def process_request(self, request, spider):
        request.meta["proxy"] = "http://proxy:8080"
\`\`\`

### 七、并发与限速

\`\`\`python
# settings.py
CONCURRENT_REQUESTS = 16              # 总并发数
CONCURRENT_REQUESTS_PER_DOMAIN = 8    # 每域名并发
DOWNLOAD_DELAY = 0.5                  # 下载延迟（秒）
AUTOTHROTTLE_ENABLED = True           # 自动限速
AUTOTHROTTLE_TARGET_CONCURRENCY = 8   # 目标并发
RANDOMIZE_DOWNLOAD_DELAY = True       # 随机延迟
\`\`\`

### 八、Scrapy vs requests + BS4

| 维度 | Scrapy | requests + BS4 |
|------|--------|----------------|
| 架构 | 完整框架 | 脚本式 |
| 并发 | 异步高并发 | 需自己写 |
| 调度 | 内置去重 | 需自己写 |
| Pipeline | 内置 | 需自己写 |
| 学习曲线 | 陡峭 | 平缓 |
| 适合场景 | 大规模爬取 | 小规模/简单任务 |
| 扩展性 | 强（中间件/管道） | 一般 |
| 日志/统计 | 内置 | 需自己写 |

### 九、业务场景

- **大规模数据采集**：十万级以上页面
- **定期监控**：配合 Scrapyd 部署调度
- **搜索引擎索引**：爬取 + 全文索引
- **竞品分析**：定期抓取对手数据
- **学术研究**：论文/专利/新闻采集

### 十、配置与部署

#### settings.py 常用配置

\`\`\`python
BOT_NAME = "myspider"
ROBOTSTXT_OBEY = True                # 遵守 robots.txt
CONCURRENT_REQUESTS = 16
DOWNLOAD_DELAY = 1
DEFAULT_REQUEST_HEADERS = {
    "Accept": "text/html",
    "User-Agent": "MyBot/1.0",
}
DOWNLOADER_MIDDLEWARES = {
    "myspider.middlewares.RandomUserAgentMiddleware": 400,
}
ITEM_PIPELINES = {
    "myspider.pipelines.MySQLPipeline": 300,
}
FEED_FORMAT = "json"                 # 导出格式
FEED_URI = "output.json"             # 导出路径
\`\`\`

#### 部署：Scrapyd

\`\`\`bash
pip install scrapyd scrapyd-client
scrapyd                         # 启动服务
scrapyd-deploy                  # 部署项目
curl http://localhost:6800/schedule.json -d project=myspider -d spider=quotes
\`\`\`

### 十一、最佳实践总结

- 遵守 \`ROBOTSTXT_OBEY = True\`，尊重目标网站
- 用 \`DOWNLOAD_DELAY\` 限速，加 \`RANDOMIZE_DOWNLOAD_DELAY\`
- 大规模爬取用 \`CONCURRENT_REQUESTS\` 控制并发
- 数据用 Item 定义，Pipeline 分层处理
- 用中间件管理 User-Agent、代理、重试
- 部署用 Scrapyd 或 Scrapy Cloud
- 复杂选择器用 \`response.css()\` 优于 \`re()\`
- 用 \`scrapy shell\` 调试选择器`,
    code: `# Scrapy 概念演示：用标准库模拟 Scrapy 的架构与数据流
# 不依赖 Scrapy，纯标准库模拟 Engine/Scheduler/Spider/Pipeline

print("=== Scrapy 爬虫框架概念演示 ===\\n")

import random
import time
from collections import deque

# --- 1. 模拟 Scrapy 五大组件 ---
print("--- 1. 模拟 Scrapy 架构组件 ---")

class Request:
    """模拟 scrapy.Request"""
    def __init__(self, url, callback=None, meta=None):
        self.url = url
        self.callback = callback
        self.meta = meta or {}

class Response:
    """模拟 scrapy.Response"""
    def __init__(self, url, body, meta=None):
        self.url = url
        self.body = body
        self.meta = meta or {}

    def css(self, selector):
        """模拟 response.css() 简化版"""
        return MockSelector(self.body, selector)

class MockSelector:
    """模拟选择器（简化版）"""
    def __init__(self, html, selector=None):
        self.html = html
        self.selector = selector

    def getall(self):
        # 用正则模拟提取
        import re
        if "::text" in (self.selector or ""):
            tag = self.selector.replace("::text", "").strip()
            return re.findall(rf'<{tag}[^>]*>([^<]+)</{tag}>', self.html)
        return []

    def get(self):
        results = self.getall()
        return results[0] if results else None

class Scheduler:
    """调度器：管理待爬队列与去重"""
    def __init__(self):
        self.queue = deque()
        self.seen = set()

    def push(self, request):
        if request.url not in self.seen:
            self.queue.append(request)
            self.seen.add(request.url)

    def pop(self):
        return self.queue.popleft() if self.queue else None

    def __len__(self):
        return len(self.queue)

class Downloader:
    """下载器：模拟发送请求"""
    def __init__(self, mock_pages=None):
        self.mock_pages = mock_pages or {}
        self.delay = 0.01

    def fetch(self, request):
        time.sleep(self.delay)  # 模拟网络延迟
        body = self.mock_pages.get(request.url, f"<html>404: {request.url}</html>")
        return Response(request.url, body, request.meta)

class Pipeline:
    """数据管道"""
    def __init__(self):
        self.items = []
        self.seen = set()

    def process_item(self, item, spider):
        # 去重
        key = item.get("title", "")
        if key in self.seen:
            print(f"    [Pipeline] 去重: {key}")
            return None
        self.seen.add(key)
        # 清洗
        for k, v in item.items():
            if isinstance(v, str):
                item[k] = v.strip()
        self.items.append(item)
        return item

class Engine:
    """引擎：协调各组件"""
    def __init__(self, spider, downloader, pipeline):
        self.spider = spider
        self.downloader = downloader
        self.pipeline = pipeline
        self.scheduler = Scheduler()

    def start(self, start_urls):
        for url in start_urls:
            self.scheduler.push(Request(url, self.spider.parse))
        while len(self.scheduler) > 0:
            request = self.scheduler.pop()
            print(f"  [Engine] 处理: {request.url}")
            response = self.downloader.fetch(request)
            for item in request.callback(response):
                if isinstance(item, dict):
                    self.pipeline.process_item(item, self.spider)
                elif isinstance(item, Request):
                    self.scheduler.push(item)

class QuoteSpider:
    """模拟 scrapy.Spider"""
    name = "quotes"
    def parse(self, response):
        import re
        quotes = re.findall(r'<div class="quote">.*?<span class="text">([^<]+)</span>.*?<small class="author">([^<]+)</small>', response.body, re.DOTALL)
        for text, author in quotes:
            yield {"text": text.strip(), "author": author.strip()}
        # 翻页
        next_links = re.findall(r'href="([^"]*page2[^"]*)"', response.body)
        for link in next_links:
            if link.startswith("http"):
                yield Request(link, self.parse)

# 模拟页面
mock_pages = {
    "https://quotes.toscrape.com/page/1/": '''
<div class="quote"><span class="text">生活不息</span><small class="author">张三</small></div>
<div class="quote"><span class="text">奋斗不止</span><small class="author">李四</small></div>
<a href="https://quotes.toscrape.com/page/2/">下一页</a>
''',
    "https://quotes.toscrape.com/page/2/": '''
<div class="quote"><span class="text">代码改变世界</span><small class="author">王五</small></div>
''',
}

print("  创建 Spider/Downloader/Pipeline/Engine...")
spider = QuoteSpider()
downloader = Downloader(mock_pages)
pipeline = Pipeline()
engine = Engine(spider, downloader, pipeline)

print("  启动引擎，开始爬取...")
engine.start(["https://quotes.toscrape.com/page/1/"])

print(f"\\n  爬取结果: {len(pipeline.items)} 条名言")
for item in pipeline.items:
    print(f"    {item['author']}: {item['text'][:20]}")

# --- 2. 模拟 Item 定义 ---
print("\\n--- 2. 模拟 Item 数据结构 ---")

class Item:
    """模拟 scrapy.Item"""
    fields = {}
    def __init__(self):
        self._values = {}
    def __setitem__(self, key, value):
        if key in self.fields:
            self._values[key] = value
        else:
            raise KeyError(f"未定义字段: {key}")
    def __getitem__(self, key):
        return self._values.get(key)
    def __repr__(self):
        return f"Item({self._values})"

class QuoteItem(Item):
    fields = {"text": {}, "author": {}, "tags": {}}

item = QuoteItem()
item["text"] = "生活不息"
item["author"] = "张三"
print(f"  创建 Item: {item}")

# --- 3. 模拟 Pipeline 链 ---
print("\\n--- 3. 模拟 Pipeline 处理链 ---")

class CleanPipeline:
    def process_item(self, item, spider):
        print(f"    [清洗] 处理: {item.get('text', '')[:15]}")
        return item

class ValidatePipeline:
    def process_item(self, item, spider):
        if not item.get("text"):
            print(f"    [验证] 丢弃: 无文本")
            return None
        return item

class ExportPipeline:
    def __init__(self):
        self.data = []
    def process_item(self, item, spider):
        self.data.append(item)
        print(f"    [导出] 保存: {item.get('text', '')[:15]}")
        return item

pipelines = [CleanPipeline(), ValidatePipeline(), ExportPipeline()]
test_item = {"text": "  代码改变世界  ", "author": "王五"}
print(f"  原始数据: {test_item}")
for p in pipelines:
    result = p.process_item(test_item, None)
    if result is None:
        break
    test_item = result

# --- 4. 并发与限速概念 ---
print("\\n--- 4. 并发与限速配置概念 ---")
settings = {
    "CONCURRENT_REQUESTS": 16,
    "CONCURRENT_REQUESTS_PER_DOMAIN": 8,
    "DOWNLOAD_DELAY": 0.5,
    "AUTOTHROTTLE_ENABLED": True,
}
for k, v in settings.items():
    print(f"  {k} = {v}")
print("  (Scrapy 自动管理并发, 比手动线程池更高效)")

# --- 5. Scrapy vs requests+BS4 ---
print("\\n--- 5. Scrapy vs requests+BS4 ---")
comparisons = [
    ("架构", "完整框架", "脚本式"),
    ("并发", "异步高并发(内置)", "需自己写线程池"),
    ("去重", "内置调度器", "需自己写URLManager"),
    ("Pipeline", "内置数据处理", "需自己写"),
    ("部署", "Scrapyd/Scrapy Cloud", "需自己搭"),
]
for dim, scrapy_val, req_val in comparisons:
    print(f"  {dim}: Scrapy={scrapy_val} | requests+BS4={req_val}")

# --- 6. 最佳实践总结 ---
print("\\n--- 6. Scrapy 最佳实践 ---")
tips = [
    "遵守 ROBOTSTXT_OBEY = True",
    "用 DOWNLOAD_DELAY 限速 + 随机延迟",
    "数据用 Item 定义, Pipeline 分层处理",
    "中间件管理 UA/代理/重试",
    "部署用 Scrapyd 或 Scrapy Cloud",
    "用 response.css() 优于 re()",
    "scrapy shell 调试选择器",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== Scrapy 演示结束 ===")`
  },
  {
    id: "py6-crawler-ethics",
    group: "Web 与爬虫实战",
    icon: "⚖️",
    title: "爬虫礼仪与反爬应对",
    content: `## 爬虫礼仪与反爬应对

### 一、爬虫礼仪的重要性

爬虫礼仪（Crawler Etiquette）是爬虫开发者的基本行为准则。良好的礼仪不仅体现专业素养，更能：

- **避免法律风险**：合规采集降低侵权风险
- **维持长期可用**：不被封 IP，可持续采集
- **维护生态**：不给目标服务器造成负担
- **行业自律**：推动数据采集规范化

> 💡 **避坑提示**：很多新手忽视礼仪，结果 IP 被封、账号被封禁，甚至收到律师函。爬虫礼仪不是"建议"，而是**长期可持续采集的前提**。

### 二、robots.txt 协议

\`robots.txt\` 是网站告知爬虫的"访问规则"。虽然不强制，但所有主流搜索引擎都遵守：

\`\`\`
# robots.txt 示例
User-agent: *              # 对所有爬虫
Disallow: /admin/          # 禁止爬取管理后台
Disallow: /private/        # 禁止爬取私有数据
Allow: /public/            # 允许爬取公开内容
Crawl-delay: 1             # 请求间隔至少 1 秒
Sitemap: https://example.com/sitemap.xml
\`\`\`

#### 用 urllib.robotparser 解析

\`\`\`python
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url("https://www.example.com/robots.txt")
rp.read()

# 检查是否允许爬取
print(rp.can_fetch("MyBot", "https://www.example.com/public/page"))
print(rp.can_fetch("MyBot", "https://www.example.com/admin/secret"))

# 查询爬取延迟
print(rp.crawl_delay("MyBot"))

# 查询请求速率限制
print(rp.request_rate("MyBot"))
\`\`\`

### 三、爬虫频率与限速

**控制频率**是爬虫礼仪的核心。过高的请求频率会：

- 压垮目标服务器
- 触发反爬机制
- 被 IP 封禁

#### 限速策略

\`\`\`python
import time
import random

# 固定间隔
def crawl_fixed_delay(url):
    time.sleep(1)  # 每次请求间隔 1 秒
    return fetch(url)

# 随机间隔（更像人类行为）
def crawl_random_delay(url):
    time.sleep(random.uniform(1, 3))  # 1-3 秒随机
    return fetch(url)

# 自适应限速（根据响应时间调整）
class AdaptiveRateLimiter:
    def __init__(self, base_delay=1.0):
        self.base_delay = base_delay
        self.last_response_time = 0

    def wait(self):
        delay = max(self.base_delay, self.last_response_time * 2)
        delay += random.uniform(0, 0.5)  # 加随机抖动
        time.sleep(delay)

    def record(self, response_time):
        self.last_response_time = response_time
\`\`\`

| 频率 | 评价 | 建议 |
|------|------|------|
| 每秒 >10 请求 | 攻击性 | 绝对禁止 |
| 每秒 1-3 请求 | 较高 | 仅限公开 API |
| 每 2-3 秒 1 请求 | 适中 | 一般网站 |
| 每 5-10 秒 1 请求 | 保守 | 敏感数据 |
| 每分钟 1 请求 | 极保守 | 谨慎场景 |

### 四、User-Agent 识别

**诚实的 User-Agent** 包含联系方式，便于站长联系：

\`\`\`python
# 推荐：诚实标识
headers = {
    "User-Agent": "MyResearchBot/1.0 (https://myproject.com; contact@email.com)"
}

# 不推荐：伪装浏览器
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
}
\`\`\`

> ⚠️ **避坑提示**：伪装 User-Agent 本身不违法，但如果配合高频请求、绕过验证码等行为，可能被认定为"恶意爬取"。学术研究场景建议诚实标识。

### 五、反爬机制与应对

#### 常见反爬手段

| 机制 | 原理 | 应对策略 |
|------|------|----------|
| IP 频率限制 | 同 IP 请求过高则封 | 降速 / 代理池 |
| User-Agent 检测 | 拦截爬虫 UA | 设置合理 UA |
| Cookie/Session | 要求登录 | 模拟登录 |
| 验证码 | 人机验证 | 仅手动通过 |
| JS 渲染 | 动态加载内容 | Selenium/Playwright |
| 字体加密 | 字符映射混淆 | 解析字体文件 |
| 行为分析 | 鼠标轨迹/速度 | 模拟人类行为 |

#### 合法应对策略

\`\`\`python
# 1. 代理池轮换（合法范围内）
class ProxyPool:
    def __init__(self, proxies):
        self.proxies = proxies
        self.index = 0

    def get(self):
        proxy = self.proxies[self.index % len(self.proxies)]
        self.index += 1
        return proxy

# 2. 请求头随机化
def random_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": random.choice(["zh-CN", "en-US"]),
    }

# 3. 退避重试
def fetch_with_backoff(url, max_retries=3):
    for i in range(max_retries):
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp
            if resp.status_code == 429:  # Too Many Requests
                wait = int(resp.headers.get("Retry-After", 60))
                time.sleep(wait)
        except Exception:
            time.sleep(2 ** i)
\`\`\`

> ⚠️ **重要警告**：以下行为**绝对禁止**：
> - 绕过付费墙
> - 破解加密算法盗取数据
> - 大规模爬取个人隐私信息
> - DDoS 式高频请求

### 六、数据使用规范

爬取数据后的使用也需合规：

1. **个人使用**：学习研究一般可以
2. **公开发布**：需获授权或脱敏
3. **商业使用**：必须获授权
4. **再分发**：注意版权声明
5. **AI 训练**：注意数据来源合规

\`\`\`python
# 数据脱敏示例
import re

def mask_email(text):
    return re.sub(r'([\\w.])[\\w.]*@([\\w.]+)', r'\\1***@\\2', text)

def mask_phone(text):
    return re.sub(r'(\\d{3})\\d{4}(\\d{4})', r'\\1****\\2', text)

# 原始: 张三 zhangsan@example.com 13812345678
# 脱敏: 张三 z***@example.com 138****5678
\`\`\`

### 七、法律风险

#### 相关法律

1. **《著作权法》**：未经授权复制他人作品
2. **《个人信息保护法》**：违规收集个人信息
3. **《网络安全法》**：破坏网络正常运行
4. **《刑法》第 285 条**：非法获取计算机信息系统数据罪
5. **《反不正当竞争法》**：不正当竞争

#### 典型案例

- **大众点评 vs 百度**：百度爬取大众点评内容，被判不正当竞争
- **新浪微博 vs 脉脉**：脉脉非法抓取微博数据，败诉
- **领英 vs hiQ**：美国案例，hiQ 爬取领英公开数据（争议中）

### 八、业务场景：合规数据采集

\`\`\`python
from urllib.robotparser import RobotFileParser
import time
import random

class EthicalCrawler:
    """合规爬虫框架"""
    def __init__(self, name, contact):
        self.name = name
        self.contact = contact
        self.headers = {"User-Agent": f"{name}/1.0 ({contact})"}

    def check_robots(self, url):
        """检查 robots.txt"""
        rp = RobotFileParser()
        base = "/".join(url.split("/")[:3])
        rp.set_url(f"{base}/robots.txt")
        try:
            rp.read()
            return rp.can_fetch(self.name, url)
        except Exception:
            return True

    def fetch(self, url):
        """礼貌地获取页面"""
        if not self.check_robots(url):
            print(f"robots.txt 禁止: {url}")
            return None
        time.sleep(random.uniform(2, 4))  # 随机延迟
        # requests.get(url, headers=self.headers, timeout=10)
\`\`\`

### 九、robots.txt 解析详解

\`\`\`python
from urllib.robotparser import RobotFileParser

# 也可以直接解析文本
rp = RobotFileParser()
rp.parse([
    "User-agent: *",
    "Disallow: /admin/",
    "Allow: /admin/public/",
    "Crawl-delay: 2",
])

print(rp.can_fetch("*", "/admin/secret"))      # False
print(rp.can_fetch("*", "/admin/public/x"))    # True
print(rp.can_fetch("*", "/home"))              # True
\`\`\`

### 十、最佳实践总结

- **遵守 robots.txt**：用 \`urllib.robotparser\` 检查
- **控制频率**：每 2-3 秒 1 请求，加随机延迟
- **诚实 User-Agent**：标明身份和联系方式
- **处理 429 状态**：遵守 Retry-After 头
- **不爬隐私数据**：个人信息需合法依据
- **数据脱敏**：公开发布前去除敏感信息
- **获商业授权**：商业使用必须获许可
- **监控自身爬虫**：记录请求量，避免失控`,
    code: `# 爬虫礼仪与反爬应对演示：用标准库演示合规爬虫实践
# 不依赖第三方库，纯标准库

print("=== 爬虫礼仪与反爬应对演示 ===\\n")

from urllib.robotparser import RobotFileParser
import time
import random
import re

# --- 1. robots.txt 解析 ---
print("--- 1. robots.txt 协议解析 ---")

robots_txt = """User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/
Crawl-delay: 2

User-agent: GoogleBot
Allow: /

Sitemap: https://example.com/sitemap.xml
"""

rp = RobotFileParser()
rp.parse(robots_txt.splitlines())

test_cases = [
    ("https://example.com/public/news", "公开页面"),
    ("https://example.com/admin/dashboard", "管理后台"),
    ("https://example.com/private/data", "私有数据"),
    ("https://example.com/index.html", "首页"),
    ("https://example.com/public/about", "关于页"),
]

print("  robots.txt 规则解析结果:")
for url, desc in test_cases:
    allowed = rp.can_fetch("*", url)
    status = "允许" if allowed else "禁止"
    print(f"    {desc} ({url.split('example.com')[1]}) -> {status}")

# 查询爬取延迟
delay = rp.crawl_delay("*")
print(f"  Crawl-delay (所有爬虫): {delay} 秒")

# --- 2. 限速策略对比 ---
print("\\n--- 2. 限速策略 ---")

class RateLimiter:
    """限速器：控制请求频率"""
    def __init__(self, strategy="random"):
        self.strategy = strategy
        self.min_delay = 2.0
        self.max_delay = 4.0
        self.request_count = 0

    def wait(self):
        if self.strategy == "fixed":
            delay = self.min_delay
        elif self.strategy == "random":
            delay = random.uniform(self.min_delay, self.max_delay)
        elif self.strategy == "adaptive":
            # 模拟自适应：请求越多，延迟越长
            delay = self.min_delay + self.request_count * 0.1
        self.request_count += 1
        return delay

# 对比不同策略
strategies = ["fixed", "random", "adaptive"]
for strat in strategies:
    limiter = RateLimiter(strategy=strat)
    delays = [limiter.wait() for _ in range(3)]
    print(f"  {strat} 策略: 3 次请求延迟 = {[f'{d:.2f}s' for d in delays]}")

print("  推荐: random 策略 (更像人类行为, 不易被识别)")

# --- 3. User-Agent 识别 ---
print("\\n--- 3. User-Agent 诚实标识 ---")

good_uas = [
    "MyResearchBot/1.0 (https://university.edu/research; prof@university.edu)",
    "PriceMonitorBot/2.0 (contact@company.com)",
    "AcademicCrawler/1.0 (+https://lab.org/bot)",
]

bad_uas = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15",
]

print("  诚实 User-Agent (推荐):")
for ua in good_uas:
    print(f"    {ua}")
print("  伪装 User-Agent (不推荐):")
for ua in bad_uas:
    print(f"    {ua}")

# --- 4. 反爬机制与应对 ---
print("\\n--- 4. 反爬机制与合法应对 ---")

mechanisms = [
    ("IP 频率限制", "同 IP 高频请求被封", "降速 / 代理池轮换"),
    ("UA 检测", "拦截爬虫 UA", "设置合理 UA"),
    ("Cookie 验证", "要求登录", "模拟登录 Session"),
    ("验证码", "人机验证", "手动通过 / 降低频率"),
    ("JS 渲染", "动态加载", "Selenium/Playwright"),
    ("429 状态码", "请求过多", "遵守 Retry-After"),
]

print("  常见反爬机制:")
for name, principle, response in mechanisms:
    print(f"    {name}: {principle}")
    print(f"      应对: {response}")

# --- 5. 模拟 429 退避 ---
print("\\n--- 5. 模拟 429 退避策略 ---")

def fetch_with_backoff(url, max_retries=4):
    """模拟带退避的请求"""
    for attempt in range(max_retries):
        # 模拟服务器响应
        if attempt < 2:
            status = 429  # 模拟前两次返回 429
            retry_after = 2 ** attempt
        else:
            status = 200
            retry_after = 0

        if status == 200:
            return f"成功: {url}"
        elif status == 429:
            wait = retry_after + random.uniform(0, 0.5)
            print(f"    第 {attempt+1} 次: 429 Too Many Requests, 等待 {wait:.1f}s")
            time.sleep(wait)
        else:
            return f"失败: {status}"
    return f"放弃: {url}"

random.seed(42)
result = fetch_with_backoff("https://example.com/api/data")
print(f"  最终结果: {result}")

# --- 6. 代理池轮换 ---
print("\\n--- 6. 代理池轮换概念 ---")

class ProxyPool:
    """代理池：轮换 IP 避免单 IP 被封"""
    def __init__(self, proxies):
        self.proxies = proxies
        self.index = 0
        self.banned = set()

    def get(self):
        available = [p for p in self.proxies if p not in self.banned]
        if not available:
            return None
        proxy = available[self.index % len(available)]
        self.index += 1
        return proxy

    def mark_banned(self, proxy):
        self.banned.add(proxy)
        print(f"    代理 {proxy} 被封, 移出池")

proxies = ["proxy1:8080", "proxy2:8080", "proxy3:8080"]
pool = ProxyPool(proxies)

print("  代理池轮换模拟:")
for i in range(5):
    proxy = pool.get()
    print(f"    请求 {i+1} 使用代理: {proxy}")
    if i == 2:
        pool.mark_banned("proxy1:8080")

# --- 7. 数据脱敏 ---
print("\\n--- 7. 数据脱敏处理 ---")

def mask_email(text):
    """邮箱脱敏: zhangsan@example.com -> z***@example.com"""
    return re.sub(r'([\\w.])[\\w.]*@([\\w.]+)', r'\\1***@\\2', text)

def mask_phone(text):
    """手机号脱敏: 13812345678 -> 138****5678"""
    return re.sub(r'(\\d{3})\\d{4}(\\d{4})', r'\\1****\\2', text)

def mask_id_card(text):
    """身份证脱敏: 110101199001011234 -> 110***********1234"""
    return re.sub(r'(\\d{3})\\d{11}(\\d{4})', r'\\1***********\\2', text)

sample = "联系人: 张三, 邮箱: zhangsan@example.com, 电话: 13812345678, 身份证: 110101199001011234"
print(f"  原始数据: {sample}")
print(f"  邮箱脱敏: {mask_email(sample)}")
print(f"  电话脱敏: {mask_phone(mask_email(sample))}")
print(f"  全部脱敏: {mask_id_card(mask_phone(mask_email(sample)))}")

# --- 8. 合规爬虫检查清单 ---
print("\\n--- 8. 合规爬虫检查清单 ---")
checklist = [
    ("检查 robots.txt", "用 urllib.robotparser 验证"),
    ("设置合理 UA", "标明身份和联系方式"),
    ("控制频率", "每 2-3 秒 1 请求 + 随机延迟"),
    ("处理 429", "遵守 Retry-After 头"),
    ("不爬隐私", "个人信息需合法依据"),
    ("数据脱敏", "公开发布前去除敏感信息"),
    ("获商业授权", "商业使用必须获许可"),
    ("监控请求量", "避免爬虫失控"),
]
for i, (item, desc) in enumerate(checklist, 1):
    print(f"  {i}. {item}: {desc}")

# --- 9. 法律风险提示 ---
print("\\n--- 9. 法律风险提示 ---")
risks = [
    "著作权法: 未经授权复制他人作品",
    "个人信息保护法: 违规收集个人信息",
    "网络安全法: 破坏网络正常运行",
    "刑法 285 条: 非法获取计算机数据罪",
    "反不正当竞争法: 不正当竞争",
]
for risk in risks:
    print(f"  ⚠️ {risk}")

# --- 10. 最佳实践总结 ---
print("\\n--- 10. 最佳实践 ---")
tips = [
    "遵守 robots.txt, 用 urllib.robotparser 检查",
    "控制频率: 每 2-3 秒 1 请求, 加随机延迟",
    "诚实 User-Agent, 标明身份和联系方式",
    "处理 429 状态, 遵守 Retry-After",
    "不爬隐私数据, 个人信息需合法依据",
    "数据脱敏后再发布",
    "商业使用必须获授权",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== 爬虫礼仪演示结束 ===")`
  },
  {
    id: "py6-pandas-basic",
    group: "Web 与爬虫实战",
    icon: "🐼",
    title: "Pandas 数据分析入门",
    content: `## Pandas 数据分析入门

### 一、Pandas 简介

Pandas 是 Python 数据分析的核心库，由 Wes McKinney 开发。它提供两种核心数据结构：

- **Series**：一维带标签数组（类似带索引的列表）
- **DataFrame**：二维表格（类似 Excel 表/SQL 表）

\`\`\`bash
pip install pandas
\`\`\`

> 💡 **避坑提示**：Pandas 是数据科学的"瑞士军刀"，但学习曲线陡。建议先掌握 DataFrame 基本操作（索引/过滤/分组），再学高级功能（透视表/时序/多层索引）。

### 二、Series 与 DataFrame

#### Series：一维数据

\`\`\`python
import pandas as pd

# 从列表创建
s = pd.Series([1, 3, 5, 7, 9])
print(s)
# 0    1
# 1    3
# 2    5
# 3    7
# 4    9

# 自定义索引
s = pd.Series([1, 3, 5], index=["a", "b", "c"])
print(s["a"])  # 1

# 从字典创建
s = pd.Series({"Alice": 90, "Bob": 85, "Charlie": 78})
\`\`\`

#### DataFrame：二维表格

\`\`\`python
# 从字典创建
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "Diana"],
    "age": [25, 30, 35, 28],
    "city": ["北京", "上海", "广州", "深圳"],
    "salary": [15000, 20000, 25000, 18000],
})

print(df)
#       name  age city  salary
# 0    Alice   25  北京   15000
# 1      Bob   30  上海   20000
# 2  Charlie   35  广州   25000
# 3    Diana   28  深圳   18000
\`\`\`

### 三、索引与选择

Pandas 提供多种数据选择方式：

\`\`\`python
# 选择列
df["name"]           # 返回 Series
df[["name", "age"]]  # 返回 DataFrame

# loc：按标签索引
df.loc[0]               # 第 0 行
df.loc[0:2]             # 第 0-2 行（含 2）
df.loc[0:2, ["name", "salary"]]  # 行 + 列
df.loc[df["age"] > 28]  # 条件筛选

# iloc：按位置索引
df.iloc[0]          # 第 0 行
df.iloc[0:3]        # 前 3 行（不含 3）
df.iloc[0:3, 0:2]   # 行 + 列（位置）

# 条件筛选
df[df["age"] > 28]
df[(df["age"] > 28) & (df["salary"] > 18000)]
df[df["city"].isin(["北京", "上海"])]

# query 方法（类似 SQL）
df.query("age > 28 and salary > 18000")
\`\`\`

| 方法 | 索引方式 | 示例 |
|------|----------|------|
| \`df[]\` | 列名/布尔 | \`df["name"]\` |
| \`df.loc[]\` | 标签 | \`df.loc[0:2, "name"]\` |
| \`df.iloc[]\` | 位置 | \`df.iloc[0:3, 0]\` |
| \`df.query()\` | 字符串表达式 | \`df.query("age > 28")\` |

### 四、过滤与排序

\`\`\`python
# 过滤
high_salary = df[df["salary"] > 18000]
young = df[df["age"] < 30]

# 排序
df.sort_values("salary")                # 升序
df.sort_values("salary", ascending=False)  # 降序
df.sort_values(["city", "salary"], ascending=[True, False])  # 多列排序

# 去重
df.drop_duplicates(subset=["name"])
df.drop_duplicates(subset=["city"], keep="last")

# 唯一值
df["city"].unique()     # 唯一值数组
df["city"].nunique()    # 唯一值数量
df["city"].value_counts()  # 各值计数
\`\`\`

### 五、分组聚合 groupby

\`groupby\` 是数据分析最强大的功能：

\`\`\`python
# 按城市分组，计算平均薪资
df.groupby("city")["salary"].mean()
# 上海    20000
# 北京    15000
# 广州    25000
# 深圳    18000

# 多种聚合
df.groupby("city")["salary"].agg(["mean", "max", "min", "count"])

# 多列分组
df.groupby(["city", "age"])["salary"].mean()

# 自定义聚合
df.groupby("city").agg({
    "salary": "mean",
    "age": ["min", "max"],
})

# transform：保持原形状
df["avg_salary_by_city"] = df.groupby("city")["salary"].transform("mean")
\`\`\`

### 六、合并 merge/concat

\`\`\`python
# merge：类似 SQL JOIN
employees = pd.DataFrame({"id": [1, 2, 3], "name": ["Alice", "Bob", "Charlie"]})
departments = pd.DataFrame({"id": [1, 2, 3], "dept": ["工程", "销售", "市场"]})

merged = pd.merge(employees, departments, on="id")
# 类似: SELECT * FROM employees JOIN departments ON employees.id = departments.id

# 不同 join 类型
pd.merge(df1, df2, on="id", how="inner")  # 内连接（默认）
pd.merge(df1, df2, on="id", how="left")   # 左连接
pd.merge(df1, df2, on="id", how="outer")  # 外连接

# concat：拼接
pd.concat([df1, df2])              # 纵向拼接（行增加）
pd.concat([df1, df2], axis=1)      # 横向拼接（列增加）
\`\`\`

### 七、缺失值处理

\`\`\`python
df = pd.DataFrame({
    "name": ["Alice", "Bob", None, "Diana"],
    "age": [25, None, 35, 28],
    "salary": [15000, 20000, 25000, None],
})

# 检查缺失值
df.isnull()         # 缺失值布尔表
df.isnull().sum()   # 各列缺失数量
df.info()           # 数据概览

# 删除缺失值
df.dropna()                # 删除任何含 NaN 的行
df.dropna(subset=["age"])  # 仅看 age 列
df.dropna(how="all")       # 全部为 NaN 才删

# 填充缺失值
df.fillna(0)                          # 全部填 0
df["age"].fillna(df["age"].mean())    # 用均值填充
df["age"].fillna(df["age"].median())  # 用中位数填充
df.fillna(method="ffill")             # 前向填充
df.fillna(method="bfill")             # 后向填充
\`\`\`

### 八、用 csv + dict 模拟 DataFrame

理解 Pandas 最好的方式是**用基本数据结构模拟**：

\`\`\`python
# DataFrame 本质是"列名 -> 列数据"的字典
data = {
    "name": ["Alice", "Bob", "Charlie"],
    "age": [25, 30, 35],
    "salary": [15000, 20000, 25000],
}

# 选择列
names = data["name"]  # ["Alice", "Bob", "Charlie"]

# 过滤：年龄 > 28
filtered = [
    {"name": data["name"][i], "age": data["age"][i], "salary": data["salary"][i]}
    for i in range(len(data["name"]))
    if data["age"][i] > 28
]

# 排序：按薪资降序
sorted_indices = sorted(range(len(data["salary"])), key=lambda i: data["salary"][i], reverse=True)

# 分组：按城市统计平均薪资
from collections import defaultdict
groups = defaultdict(list)
for i in range(len(data["city"])):
    groups[data["city"][i]].append(data["salary"][i])
avg = {city: sum(sals) / len(sals) for city, sals in groups.items()}
\`\`\`

### 九、业务场景

#### 数据报表

\`\`\`python
# 月度销售报表
df = pd.read_csv("sales.csv")
monthly = df.groupby("month").agg({
    "amount": "sum",
    "order_id": "count",
})
monthly["avg_order"] = monthly["amount"] / monthly["order_id"]
\`\`\`

#### 数据清洗

\`\`\`python
# 去重、填充、类型转换
df = df.drop_duplicates()
df["price"] = df["price"].fillna(df["price"].median())
df["date"] = pd.to_datetime(df["date"])
\`\`\`

#### 数据分析

\`\`\`python
# 用户分群分析
rfm = df.groupby("user_id").agg({
    "order_date": lambda x: (today - x.max()).days,  # Recency
    "order_id": "count",                               # Frequency
    "amount": "sum",                                   # Monetary
})
\`\`\`

### 十、Pandas vs SQL 对比

| 操作 | Pandas | SQL |
|------|--------|-----|
| 选择列 | \`df[["a", "b"]]\` | \`SELECT a, b\` |
| 过滤 | \`df[df.x > 1]\` | \`WHERE x > 1\` |
| 排序 | \`df.sort_values("x")\` | \`ORDER BY x\` |
| 分组 | \`df.groupby("x")\` | \`GROUP BY x\` |
| 聚合 | \`.agg({"y": "mean"})\` | \`AVG(y)\` |
| 连接 | \`pd.merge(df1, df2)\` | \`JOIN\` |
| 去重 | \`df.drop_duplicates()\` | \`DISTINCT\` |
| 限制 | \`df.head(10)\` | \`LIMIT 10\` |

### 十一、最佳实践总结

- 大数据用 \`read_csv(chunksize=10000)\` 分块读取
- 链式操作用 \`query\`、\`assign\` 提高可读性
- 避免循环，用向量化操作（\`df["x"] * 2\`）
- 分类数据用 \`category\` 类型节省内存
- 时序数据用 \`datetime\` 类型，支持时间索引
- 合并用 \`merge\`（类似 JOIN），拼接用 \`concat\`
- 缺失值先分析原因，再决定删除还是填充
- 导出用 \`to_csv(index=False)\` 避免多余索引列`,
    code: `# Pandas 概念演示：用标准库 csv + dict 模拟 DataFrame 核心功能
# 不依赖 pandas，纯标准库模拟 Series/DataFrame

print("=== Pandas 数据分析概念演示 ===\\n")

import csv
import io
from collections import defaultdict

# --- 1. 模拟 DataFrame ---
print("--- 1. 模拟 DataFrame 数据结构 ---")

class DataFrame:
    """用字典模拟 pandas.DataFrame"""
    def __init__(self, data):
        # data: {列名: [值1, 值2, ...]}
        self.data = data
        self.columns = list(data.keys())
        self.nrows = len(data[self.columns[0]]) if self.columns else 0

    def __len__(self):
        return self.nrows

    def __repr__(self):
        # 表格输出
        if not self.columns:
            return "Empty DataFrame"
        header = "  ".join(f"{c:>10}" for c in self.columns)
        sep = "  ".join("-" * 10 for _ in self.columns)
        rows = []
        for i in range(self.nrows):
            row = "  ".join(f"{str(self.data[c][i]):>10}" for c in self.columns)
            rows.append(f"{i}  {row}")
        return f"{'idx':>3}  {header}\\n{'':>3}  {sep}\\n" + "\\n".join(rows)

    def __getitem__(self, key):
        """选择列: df['name'] 或 df[['a','b']]"""
        if isinstance(key, str):
            return self.data[key]
        elif isinstance(key, list):
            return DataFrame({k: self.data[k] for k in key})

    def filter(self, condition):
        """条件过滤: condition 是函数"""
        indices = [i for i in range(self.nrows) if condition(self, i)]
        new_data = {}
        for col in self.columns:
            new_data[col] = [self.data[col][i] for i in indices]
        return DataFrame(new_data)

    def sort_values(self, by, ascending=True):
        """排序"""
        values = self.data[by]
        indices = sorted(range(self.nrows), key=lambda i: values[i], reverse=not ascending)
        new_data = {}
        for col in self.columns:
            new_data[col] = [self.data[col][i] for i in indices]
        return DataFrame(new_data)

    def groupby(self, by):
        """分组聚合"""
        groups = defaultdict(list)
        for i in range(self.nrows):
            key = self.data[by][i]
            groups[key].append(i)
        return GroupBy(self, groups)

    def head(self, n=5):
        new_data = {col: self.data[col][:n] for col in self.columns}
        return DataFrame(new_data)

    def to_csv(self, filepath=None):
        """导出 CSV"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(self.columns)
        for i in range(self.nrows):
            writer.writerow([self.data[c][i] for c in self.columns])
        if filepath:
            with open(filepath, "w", newline="") as f:
                f.write(output.getvalue())
        return output.getvalue()

class GroupBy:
    """模拟 pandas.groupby"""
    def __init__(self, df, groups):
        self.df = df
        self.groups = groups

    def _is_numeric(self, values):
        """检查值列表是否全为数字"""
        return all(isinstance(v, (int, float)) for v in values)

    def agg(self, func):
        """聚合"""
        results = {}
        for key, indices in self.groups.items():
            results[key] = {}
            for col in self.df.columns:
                values = [self.df.data[col][i] for i in indices]
                if callable(func):
                    results[key][col] = func(values)
                elif isinstance(func, str):
                    if func == "count":
                        results[key][col] = len(values)
                    elif func in ("mean", "sum", "max", "min"):
                        # 仅对数值列计算
                        if self._is_numeric(values):
                            if func == "mean":
                                results[key][col] = sum(values) / len(values) if values else 0
                            elif func == "sum":
                                results[key][col] = sum(values)
                            elif func == "max":
                                results[key][col] = max(values)
                            elif func == "min":
                                results[key][col] = min(values)
                        else:
                            results[key][col] = None
        return results

    def mean(self):
        return self.agg("mean")

    def sum(self):
        return self.agg("sum")

# 创建示例数据
df = DataFrame({
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "age": [25, 30, 35, 28, 32],
    "city": ["北京", "上海", "北京", "上海", "北京"],
    "salary": [15000, 20000, 25000, 18000, 22000],
})

print("  原始 DataFrame:")
print(df)

# --- 2. 选择列 ---
print("\\n--- 2. 选择列 ---")
print(f"  name 列: {df['name']}")
print(f"  age 列: {df['age']}")

# --- 3. 过滤 ---
print("\\n--- 3. 条件过滤 ---")
high_salary = df.filter(lambda d, i: d["salary"][i] > 18000)
print("  salary > 18000:")
print(high_salary)

young = df.filter(lambda d, i: d["age"][i] < 30)
print("\\n  age < 30:")
print(young)

# --- 4. 排序 ---
print("\\n--- 4. 排序 ---")
sorted_df = df.sort_values("salary", ascending=False)
print("  按 salary 降序:")
print(sorted_df)

# --- 5. 分组聚合 ---
print("\\n--- 5. 分组聚合 groupby ---")
print("  按城市分组, 计算平均薪资:")
city_groups = df.groupby("city")
avg_salary = city_groups.agg("mean")
for city, stats in avg_salary.items():
    print(f"    {city}: 平均薪资={stats['salary']:.0f}, 平均年龄={stats['age']:.1f}")

print("\\n  按城市分组, 多种聚合:")
for city, indices in city_groups.groups.items():
    salaries = [df.data["salary"][i] for i in indices]
    print(f"    {city}: 人数={len(salaries)}, 总薪资={sum(salaries)}, 最高={max(salaries)}")

# --- 6. 缺失值处理 ---
print("\\n--- 6. 缺失值处理 ---")

df_missing = DataFrame({
    "name": ["Alice", "Bob", None, "Diana"],
    "age": [25, None, 35, 28],
    "score": [90, 85, None, 88],
})

print("  含缺失值的数据:")
print(df_missing)

# 统计缺失值
print("  缺失值统计:")
for col in df_missing.columns:
    null_count = sum(1 for v in df_missing[col] if v is None)
    print(f"    {col}: {null_count} 个缺失")

# 填充缺失值
filled_data = {}
for col in df_missing.columns:
    values = df_missing[col]
    non_null = [v for v in values if v is not None]
    if non_null and all(isinstance(v, (int, float)) for v in non_null):
        mean_val = sum(non_null) / len(non_null)
        filled_data[col] = [v if v is not None else round(mean_val, 1) for v in values]
    else:
        filled_data[col] = [v if v is not None else "未知" for v in values]

print("\\n  填充后:")
df_filled = DataFrame(filled_data)
print(df_filled)

# --- 7. CSV 读写 ---
print("\\n--- 7. CSV 读写 ---")

csv_content = df.to_csv()
print("  导出 CSV:")
print(csv_content)

# 模拟读取 CSV
csv_input = """name,age,city
Alice,25,北京
Bob,30,上海
Charlie,35,广州
"""

reader = csv.DictReader(io.StringIO(csv_input))
read_data = {col: [] for col in reader.fieldnames}
for row in reader:
    for col in reader.fieldnames:
        val = row[col]
        if col == "age":
            val = int(val)
        read_data[col].append(val)

df_read = DataFrame(read_data)
print("  从 CSV 读取:")
print(df_read)

# --- 8. 合并 merge ---
print("\\n--- 8. 合并 merge ---")

employees = DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"],
})
departments = DataFrame({
    "id": [1, 2, 3],
    "dept": ["工程", "销售", "市场"],
})

# 模拟 JOIN
merged_data = {"id": [], "name": [], "dept": []}
for i in range(len(employees)):
    for j in range(len(departments)):
        if employees["id"][i] == departments["id"][j]:
            merged_data["id"].append(employees["id"][i])
            merged_data["name"].append(employees["name"][i])
            merged_data["dept"].append(departments["dept"][j])

merged_df = DataFrame(merged_data)
print("  merge(employees, departments, on='id'):")
print(merged_df)

# --- 9. Pandas vs SQL 对比 ---
print("\\n--- 9. Pandas vs SQL 对比 ---")
comparisons = [
    ("选择列", "df[['a','b']]", "SELECT a, b"),
    ("过滤", "df[df.x>1]", "WHERE x>1"),
    ("排序", "df.sort_values('x')", "ORDER BY x"),
    ("分组", "df.groupby('x')", "GROUP BY x"),
    ("聚合", ".agg({'y':'mean'})", "AVG(y)"),
    ("连接", "pd.merge(df1,df2)", "JOIN"),
    ("去重", "df.drop_duplicates()", "DISTINCT"),
    ("限制", "df.head(10)", "LIMIT 10"),
]
for op, pandas_cmd, sql_cmd in comparisons:
    print(f"  {op}: {pandas_cmd} <-> {sql_cmd}")

# --- 10. 最佳实践总结 ---
print("\\n--- 10. Pandas 最佳实践 ---")
tips = [
    "大数据用 read_csv(chunksize) 分块读取",
    "避免循环, 用向量化操作",
    "分类数据用 category 类型节省内存",
    "时序数据用 datetime 类型",
    "merge 类似 JOIN, concat 用于拼接",
    "缺失值先分析原因再处理",
    "导出用 to_csv(index=False) 去索引列",
    "链式操作用 query/assign 提高可读性",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== Pandas 演示结束 ===")`
  }
];
