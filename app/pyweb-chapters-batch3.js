// =============================================================
// Python Web 应用开发实战教程 - 第 3 批章节（Flask 入门 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   flask-intro   : Flask 框架入门
//   flask-route   : Flask 路由与参数
//   flask-template: Flask 模板与静态文件
//   flask-request : Flask Request 与 Response
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 9 章：Flask 框架入门
  // ============================================================
  {
    id: "flask-intro",
    group: "Flask 入门",
    icon: "🧪",
    title: "Flask 框架入门",
    content: `# Flask 框架入门

## 一句话定义

Flask 是 Python 的轻量级 Web 框架，由 Armin Ronacher 于 2010 年发布。它被称为 microframework（微框架）——核心小、只做最基础的 Web 的事（路由、请求响应），其他能力（数据库、表单、认证）通过扩展按需加上。简单说：Flask 给你搭好了 Web 的骨架，肉你自己长。

## Flask 是什么

\"micro\" 不是说功能少或者只能做小项目，而是说**核心极简、不绑定**：
- 没有内置 ORM（不像 Django 自带），你想用 SQLAlchemy 就装 Flask-SQLAlchemy。
- 没有内置表单，想用就装 Flask-WTF。
- 没有内置认证，想用就装 Flask-Login。
- 没有内置 Admin 后台。

这种「核心 + 扩展」的设计让 Flask 极其灵活——你只装你需要的东西，框架不替你做决定。同时它的核心（路由、请求响应、模板渲染）足够稳定好用。

## Flask 的特点

| 特点 | 说明 |
|------|------|
| 轻量 | 核心代码少，依赖少（就两个：Werkzeug + Jinja2） |
| 灵活 | 不绑定具体技术栈，ORM/表单/认证自己选 |
| 同步 | 基于 WSGI，同步模型（也有 async-flask 扩展） |
| 上手快 | 一个文件就能跑起 Web 应用 |
| 生态成熟 | 大量扩展、文档、社区案例 |
| 可控 | 不像 Django 那么多「魔法」，行为可预测 |

## 安装

\`\`\`bash
# 安装 Flask（会自动装依赖：Werkzeug、Jinja2、click、itsdangerous）
# 安装 Python 包: flask
pip install flask

# 验证
# flask --version
flask --version
\`\`\`

Werkzeug 是 Flask 的底层（WSGI 工具集，负责路由匹配、请求响应封装），Jinja2 是模板引擎。Flask 本质是「在 Werkzeug 和 Jinja2 上包了一层好用的 API」。

## 第一个 Flask 应用

\`\`\`python
# 从 flask 导入 Flask
from flask import Flask

# 创建应用实例
# __name__ 告诉 Flask 当前模块名，用来定位静态文件、模板等资源
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 用装饰器注册路由：访问 / 时执行 index 函数
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 "Hello, Flask!"
    return "Hello, Flask!"

# 再加一个路由
# 装饰器：app.route
@app.route("/about")
# 定义函数 about，参数: 
def about():
    # 返回 "这是关于页面"
    return "这是关于页面"

# 启动开发服务器
# 判断是否直接运行此脚本
if __name__ == "__main__":
    # debug=True 开启调试模式：代码出错在浏览器显示详细错误，改代码自动重启
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

运行 \`python app.py\`，访问 \`http://localhost:5000\` 看到 Hello, Flask!。

\`app.run()\` 启动的是开发服务器（Werkzeug），只能开发用，**不能上生产**（生产用 Gunicorn，前面章节讲过）。

## 路由装饰器

\`@app.route(\"/\")\` 是 Flask 最标志性的语法。它做的事：
1. 把 URL 规则 \`\"/\"\` 和下面的视图函数 \`index\` 绑定。
2. 请求来时，Flask 根据 URL 匹配到这个规则。
3. 调用 \`index\` 函数，把返回值作为响应体发给客户端。

视图函数的返回值会被 Flask 包装成响应：
- 返回字符串：当成 HTML 正文，状态码 200。
- 返回字典：Flask 2.x 自动转成 JSON。
- 返回 (body, status)：指定状态码。
- 返回完整 Response 对象：完全自定义。

\`\`\`python
# 返回字符串（HTML）
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 "<h1>首页</h1>"
    return "<h1>首页</h1>"

# 返回字典（自动转 JSON）
# 装饰器：app.route
@app.route("/api/info")
# 定义函数 info，参数: 
def info():
    # 返回 {"name": "Flask", "version": "3.0"}
    return {"name": "Flask", "version": "3.0"}

# 返回元组（body + 状态码）
# 装饰器：app.route
@app.route("/created")
# 定义函数 created，参数: 
def created():
    # 返回 "新建成功", 201
    return "新建成功", 201
\`\`\`

## Jinja2 模板渲染

返回字符串写死了 HTML，不实用。真实页面要动态生成。Flask 用 Jinja2 模板引擎，把 HTML 和 Python 变量结合：

\`\`\`python
# 从 flask 导入 render_template
from flask import render_template

# 装饰器：app.route
@app.route("/user/<name>")
# 定义函数 user，参数: name
def user(name):
    # render_template 渲染模板，传入变量
    # 会在 templates/ 目录找 user.html
    # 返回 render_template("user.html", name=name, age=25)
    return render_template("user.html", name=name, age=25)
\`\`\`

\`templates/user.html\`：

\`\`\`html
# <h1>你好，{{ name }}</h1>
<h1>你好，{{ name }}</h1>
# <p>年龄：{{ age }}</p>
<p>年龄：{{ age }}</p>
\`\`\`

模板里 \`{{ name }}\` 会被替换成传入的值。Jinja2 的详细语法下一章讲。

## 为什么选 Flask

四个理由：

1. **轻量上手快**：十行代码跑起 Web 应用，不用学一堆概念。适合学习 Web 原理。
2. **灵活可控**：不绑技术栈，你想用什么数据库、什么表单库都行。适合对架构有想法的项目。
3. **适合中小项目**：CRUD 应用、内部工具、API 服务，Flask 绰绰有余。
4. **生态成熟**：踩坑有人填过，扩展多，文档好。

## Flask vs Django

这是 Python Web 最经典的对比：

| 维度 | Flask | Django |
|------|-------|--------|
| 定位 | 微框架（核心 + 扩展） | 全栈框架（全家桶） |
| ORM | 无内置（装 SQLAlchemy） | 内置 Django ORM |
| Admin 后台 | 无（自己写或装扩展） | 内置强大的 Admin |
| 认证 | 无内置（装 Flask-Login） | 内置 auth 系统 |
| 表单 | 无（装 Flask-WTF） | 内置 forms |
| 模板 | Jinja2 | Django Templates（像 Jinja2） |
| 学习曲线 | 平缓 | 较陡（概念多） |
| 约定 | 少，自由组织 | 多，约定优先（convention over configuration） |
| 适合 | API、中小项目、定制需求 | 内容网站、管理后台、标准 CRUD |

选型：
- 做 REST API、微服务、需要轻量灵活，选 Flask。
- 做需要后台管理的内容网站、企业内部系统，选 Django。
- 不确定？先学 Flask（理解 Web 原理），再学 Django（理解全家桶）。

## 代码示例：Hello World + 多路由

一个稍完整的小应用，含多个路由：

\`\`\`python
# 从 flask 导入 Flask, jsonify, render_template
from flask import Flask, jsonify, render_template

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 首页：返回 HTML
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 "<h1>欢迎来到我的网站</h1>"
    return "<h1>欢迎来到我的网站</h1>"

# API 接口：返回 JSON
# 装饰器：app.route
@app.route("/api/time")
# 定义函数 api_time，参数: 
def api_time():
    # 从 datetime 导入 datetime
    from datetime import datetime
    # 返回 jsonify({
    return jsonify({
        # "current_time": datetime.now().isoformat(),
        "current_time": datetime.now().isoformat(),
        # "server": "flask",
        "server": "flask",
    # })
    })

# 带路径参数的路由：<name> 会作为参数传给视图函数
# 装饰器：app.route
@app.route("/greet/<name>")
# 定义函数 greet，参数: name
def greet(name):
    # 返回 f"你好，{name}！"
    return f"你好，{name}！"

# 返回指定状态码
# 装饰器：app.route
@app.route("/error")
# 定义函数 error，参数: 
def error():
    # 返回 "出错了", 500
    return "出错了", 500

# 健康检查（给负载均衡探活）
# 装饰器：app.route
@app.route("/health")
# 定义函数 health，参数: 
def health():
    # 返回 jsonify({"status": "ok"}), 200
    return jsonify({"status": "ok"}), 200

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

跑起来后：
- \`/\` 返回首页 HTML。
- \`/api/time\` 返回当前时间 JSON。
- \`/greet/Tom\` 返回「你好，Tom！」。
- \`/health\` 给监控用。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 生产用 app.run | 开发服务器跑线上 | 用 gunicorn 部署 |
| 忘关 debug | 生产开 debug=True | 生产 debug=False |
| 路由重复 | 两个函数同一路由 | 一个 URL 一个视图 |
| 返回值不规范 | 返回 None | 返回字符串/字典/Response |
| 模板目录错 | 模板放根目录 | 放 templates/ 目录 |
| __name__ 写错 | Flask("app") | Flask(__name__) |

下一章我们深入 Flask 路由，看路径参数、查询参数、表单数据怎么处理。`
  },

  // ============================================================
  // 第 10 章：Flask 路由与参数
  // ============================================================
  {
    id: "flask-route",
    group: "Flask 入门",
    icon: "🛤️",
    title: "Flask 路由与参数",
    content: `# Flask 路由与参数

## @app.route 装饰器

路由是 Web 框架的核心：把 URL 映射到处理函数。Flask 用装饰器语法，简洁直观：

\`\`\`python
# 装饰器：app.route
@app.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    # 返回 "用户列表"
    return "用户列表"
\`\`\`

\`@app.route\` 的参数：
- 第一个参数：URL 规则（字符串）。
- \`methods\`：允许的 HTTP 方法列表。
- \`endpoint\`：路由端点名（默认用函数名，用于 url_for 反向生成）。

## methods 指定 HTTP 方法

默认只允许 GET。要处理 POST/PUT/DELETE，得显式指定：

\`\`\`python
# 同一个 URL，不同方法不同处理
# 装饰器：app.route
@app.route("/users", methods=["GET"])
# 定义函数 list_users，参数: 
def list_users():
    return "用户列表"  # 查

# 装饰器：app.route
@app.route("/users", methods=["POST"])
# 定义函数 create_user，参数: 
def create_user():
    return "创建用户", 201  # 建

# 装饰器：app.route
@app.route("/users/<int:user_id>", methods=["PUT"])
# 定义函数 update_user，参数: user_id
def update_user(user_id):
    return f"更新用户 {user_id}"  # 改

# 装饰器：app.route
@app.route("/users/<int:user_id>", methods=["DELETE"])
# 定义函数 delete_user，参数: user_id
def delete_user(user_id):
    return "", 204  # 删
\`\`\`

也可以合并到一个函数，用 \`request.method\` 判断：

\`\`\`python
# 装饰器：app.route
@app.route("/users", methods=["GET", "POST"])
# 定义函数 users，参数: 
def users():
    # 条件判断：如果 request.method == "GET"
    if request.method == "GET":
        # 返回 "查"
        return "查"
    # 否则如果 request.method == "POST"
    elif request.method == "POST":
        # 返回 "建", 201
        return "建", 201
\`\`\`

REST 风格推荐前一种（分开函数，职责清晰）。

## 路径参数与转换器

URL 里的 \`<xxx>\` 是路径参数，会传给视图函数：

\`\`\`python
# 装饰器：app.route
@app.route("/users/<username>")
# 定义函数 user，参数: username
def user(username):
    # 返回 f"用户：{username}"
    return f"用户：{username}"
\`\`\`

默认是字符串类型。可以用**转换器**指定类型：

| 转换器 | 类型 | 示例 | 不匹配时 |
|--------|------|------|----------|
| string（默认） | 任意文本（不含 /） | /users/tom | — |
| int | 正整数 | /users/42 | 404 |
| float | 正浮点数 | /price/9.9 | 404 |
| path | 含 / 的文本 | /files/a/b/c | — |
| uuid | UUID 字符串 | /item/uuid-xxx | 404 |

\`\`\`python
# int 转换器：只匹配整数
# 装饰器：app.route
@app.route("/users/<int:user_id>")
# 定义函数 user，参数: user_id
def user(user_id):
    return f"用户ID：{user_id}"  # user_id 是 int 类型

# path 转换器：能匹配带斜杠的路径
# 装饰器：app.route
@app.route("/files/<path:filepath>")
# 定义函数 file，参数: filepath
def file(filepath):
    return f"文件：{filepath}"  # filepath = "a/b/c"

# 如果访问 /users/abc（非整数），直接 404，不进视图函数
\`\`\`

转换器的好处：**类型不匹配直接 404，不会进你的函数**。不用自己写 \`try: int(id)\` 转换。

## 查询参数 request.args

查询串里的参数（\`?key=value\`）用 \`request.args\` 取：

\`\`\`python
# 从 flask 导入 request
from flask import request

# 装饰器：app.route
@app.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    # request.args 像字典，但值都是字符串
    page = request.args.get("page", "1")  # 默认 "1"
    # 定义变量 size，赋值为 request.args.get("size", "10")
    size = request.args.get("size", "10")
    role = request.args.get("role")  # 没传就是 None
    
    # 取出来是字符串，要自己转类型
    # 定义变量 page，赋值为 int(page)
    page = int(page)
    # 定义变量 size，赋值为 int(size)
    size = int(size)
    
    # 返回 f"第 {page} 页，每页 {size} 条，角色 {role}"
    return f"第 {page} 页，每页 {size} 条，角色 {role}"
\`\`\`

访问 \`/users?page=2&size=20&role=admin\`：
- \`request.args.get(\"page\")\` = \"2\"
- \`request.args.get(\"size\")\` = \"20\"
- \`request.args.get(\"role\")\` = \"admin\"

注意：
- \`request.args\` 的值**永远是字符串**，要用得自己转 int/float。
- 用 \`.get(key, default)\` 而不是 \`[key]\`，避免 KeyError。
- 一个参数多个值（\`?tag=a&tag=b\`）用 \`request.args.getlist(\"tag\")\`。

## 表单数据 request.form

POST 表单提交的数据（\`application/x-www-form-urlencoded\`）用 \`request.form\`：

\`\`\`python
# 装饰器：app.route
@app.route("/login", methods=["GET", "POST"])
# 定义函数 login，参数: 
def login():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # request.form 取表单字段
        # 定义变量 username，赋值为 request.form.get("username")
        username = request.form.get("username")
        # 定义变量 password，赋值为 request.form.get("password")
        password = request.form.get("password")
        # 条件判断：如果 check_user(username, password)
        if check_user(username, password):
            # 返回 "登录成功"
            return "登录成功"
        # 返回 "密码错误", 401
        return "密码错误", 401
    # GET 返回登录表单
    # 返回 '''<form method="post">
    return '''<form method="post">
        # <input name="username">
        <input name="username">
        # <input name="password" type="password">
        <input name="password" type="password">
        # <button>登录</button>
        <button>登录</button>
    # </form>'''
    </form>'''
\`\`\`

\`request.form\` 和 \`request.args\` 用法一样（像字典），区别是数据来源：args 来自查询串，form 来自请求体。

## JSON 数据 request.get_json()

现代 API 多用 JSON。用 \`request.get_json()\` 解析请求体的 JSON：

\`\`\`python
# 装饰器：app.route
@app.route("/api/users", methods=["POST"])
# 定义函数 create_user，参数: 
def create_user():
    # 解析 JSON 请求体
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # data 是个字典
    # 定义变量 name，赋值为 data["name"]
    name = data["name"]
    # 定义变量 age，赋值为 data["age"]
    age = data["age"]
    
    # 创建用户...
    # 返回 jsonify({"id": 1, "name": name}), 201
    return jsonify({"id": 1, "name": name}), 201
\`\`\`

注意：
- \`get_json()\` 默认要求 Content-Type 是 application/json，否则返回 None。
- 加 \`silent=True\` 解析失败返回 None 而不是报错。
- 加 \`force=True\` 忽略 Content-Type 强制解析（不推荐，宽松易出问题）。

## 三种数据来源对比

| 取法 | 数据来源 | 典型场景 |
|------|----------|----------|
| request.args | URL 查询串 ?key=val | GET 请求的筛选参数 |
| request.form | 请求体（表单格式） | POST HTML 表单 |
| request.get_json() | 请求体（JSON 格式） | POST API JSON |
| request.files | 请求体（multipart） | 文件上传 |
| 路径参数 <int:id> | URL 路径 | 标识资源 |

记住：**数据从哪来，用哪个对象取**。查询串用 args，表单用 form，JSON 用 get_json。

## URL 构建 url_for

不要硬编码 URL 字符串，用 \`url_for\` 反向生成：

\`\`\`python
# 从 flask 导入 url_for
from flask import url_for

# 装饰器：app.route
@app.route("/users/<int:user_id>")
# 定义函数 user_profile，参数: user_id
def user_profile(user_id):
    # 返回 f"用户 {user_id}"
    return f"用户 {user_id}"

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # url_for("user_profile", user_id=42) 生成 "/users/42"
    # 定义变量 url，赋值为 url_for("user_profile", user_id=42)
    url = url_for("user_profile", user_id=42)
    # 也可以生成带查询参数的
    # 定义变量 list_url，赋值为 url_for("list_users", page=2, size=20)
    list_url = url_for("list_users", page=2, size=20)
    # = "/users?page=2&size=20"
    # 返回 f'<a href="{url}">查看用户</a>'
    return f'<a href="{url}">查看用户</a>'
\`\`\`

\`url_for(\"函数名\", 参数=值)\` —— 第一个参数是**视图函数名**（endpoint），不是 URL。

为什么用 url_for 而不直接写 URL？
- **解耦**：URL 改了（\`/users/\` 变 \`/u/\`），模板和代码不用改。
- **自动编码**：参数含特殊字符会自动 URL 编码。
- **集中管理**：URL 结构改一次，到处生效。

## 蓝图 Blueprint 模块化

项目大了，所有路由写一个文件太乱。Blueprint 把相关路由分组到模块：

\`\`\`python
# users.py —— 用户蓝图
# 从 flask 导入 Blueprint
from flask import Blueprint

# 创建蓝图
# 定义变量 users_bp，赋值为 Blueprint("users", __name__, url_prefix="/use...
users_bp = Blueprint("users", __name__, url_prefix="/users")

# 装饰器：users_bp.route
@users_bp.route("/")
# 定义函数 list_users，参数: 
def list_users():
    # 返回 "用户列表"
    return "用户列表"

# 装饰器：users_bp.route
@users_bp.route("/<int:user_id>")
# 定义函数 user_detail，参数: user_id
def user_detail(user_id):
    # 返回 f"用户 {user_id}"
    return f"用户 {user_id}"

# app.py —— 主应用
# 从 flask 导入 Flask
from flask import Flask
# 从 users 导入 users_bp
from users import users_bp

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 注册蓝图
# 调用 app.register_blueprint()
app.register_blueprint(users_bp)
# 现在 /users/ 和 /users/<id> 都能访问
\`\`\`

\`url_prefix\` 给蓝图下所有路由加前缀。蓝图让项目结构清晰，团队协作友好（下一批会详细讲蓝图）。

## 代码示例：用户 CRUD 路由

\`\`\`python
# 从 flask 导入 Flask, request, jsonify, url_for
from flask import Flask, request, jsonify, url_for

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 模拟数据库
# 定义字典 USERS
USERS = {}
# 定义变量 next_id，赋值为 1
next_id = 1

# 列出用户（GET，带查询参数分页）
# 装饰器：app.route
@app.route("/api/users", methods=["GET"])
# 定义函数 list_users，参数: 
def list_users():
    # 定义变量 page，赋值为 int(request.args.get("page", "1"))
    page = int(request.args.get("page", "1"))
    # 定义变量 size，赋值为 int(request.args.get("size", "10"))
    size = int(request.args.get("size", "10"))
    # 简单分页
    # 定义变量 all_users，赋值为 list(USERS.values())
    all_users = list(USERS.values())
    # 定义变量 start，赋值为 (page - 1) * size
    start = (page - 1) * size
    # 定义变量 end，赋值为 start + size
    end = start + size
    # 返回 jsonify({
    return jsonify({
        # "data": all_users[start:end],
        "data": all_users[start:end],
        # "page": page,
        "page": page,
        # "size": size,
        "size": size,
        # "total": len(all_users),
        "total": len(all_users),
    # })
    })

# 创建用户（POST，收 JSON）
# 装饰器：app.route
@app.route("/api/users", methods=["POST"])
# 定义函数 create_user，参数: 
def create_user():
    # global next_id
    global next_id
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义字典 user
    user = {"id": next_id, "name": data["name"]}
    # USERS[next_id] = user
    USERS[next_id] = user
    # next_id += 1
    next_id += 1
    # 201 + Location 头（用 url_for 生成新资源 URL）
    # 定义变量 response，赋值为 jsonify(user)
    response = jsonify(user)
    # response.status_code = 201
    response.status_code = 201
    # response.headers["Location"] = url_for("get_user",
    response.headers["Location"] = url_for("get_user", user_id=user["id"])
    # 返回 response
    return response

# 获取单个用户（GET，路径参数）
# 装饰器：app.route
@app.route("/api/users/<int:user_id>", methods=["GET"])
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 定义变量 user，赋值为 USERS.get(user_id)
    user = USERS.get(user_id)
    # 条件判断：如果 not user
    if not user:
        # 返回 jsonify({"error": "用户不存在"}), 404
        return jsonify({"error": "用户不存在"}), 404
    # 返回 jsonify(user)
    return jsonify(user)

# 更新用户（PUT）
# 装饰器：app.route
@app.route("/api/users/<int:user_id>", methods=["PUT"])
# 定义函数 update_user，参数: user_id
def update_user(user_id):
    # 条件判断：如果 user_id not in USERS
    if user_id not in USERS:
        # 返回 jsonify({"error": "用户不存在"}), 404
        return jsonify({"error": "用户不存在"}), 404
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # USERS[user_id]["name"] = data["name"]
    USERS[user_id]["name"] = data["name"]
    # 返回 jsonify(USERS[user_id])
    return jsonify(USERS[user_id])

# 删除用户（DELETE）
# 装饰器：app.route
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
# 定义函数 delete_user，参数: user_id
def delete_user(user_id):
    # 条件判断：如果 user_id not in USERS
    if user_id not in USERS:
        # 返回 jsonify({"error": "用户不存在"}), 404
        return jsonify({"error": "用户不存在"}), 404
    # del USERS[user_id]
    del USERS[user_id]
    # 返回 "", 204
    return "", 204

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

这是一个完整的 RESTful 用户 CRUD API，覆盖了 GET/POST/PUT/DELETE、路径参数、查询参数、JSON 请求体、状态码、url_for。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 查询参数当路径 | /users?page=1 标识资源 | 资源标识用路径 /users/1 |
| args 不转类型 | page = request.args["page"] + 1 | int(request.args.get("page", 1)) |
| GET 传敏感数据 | GET /login?password=xxx | 用 POST 放 body |
| get_json 没判 None | data["name"] 直接取 | 先判 data 是否 None |
| 硬编码 URL | return "/users/" + str(id) | 用 url_for 生成 |
| 忘写 methods | POST 接口不写 methods | methods=["POST"] |

下一章我们看 Flask 的模板渲染和静态文件处理。`
  },

  // ============================================================
  // 第 11 章：Flask 模板与静态文件
  // ============================================================
  {
    id: "flask-template",
    group: "Flask 入门",
    icon: "📄",
    title: "Flask 模板与静态文件",
    content: `# Flask 模板与静态文件

## 模板是什么

前面章节返回的都是字符串或 JSON。但做网页要返回完整的 HTML——如果用字符串拼接 HTML（\`"<h1>" + name + "</h1>"\`），又丑又易错（XSS 漏洞）。

模板引擎解决这个问题：把 HTML 写在独立文件里，用特殊语法嵌入变量和逻辑。Flask 用 Jinja2 模板引擎。

## templates 目录

Flask 默认在 \`templates/\` 目录找模板文件：

\`\`\`
项目根目录/
├── app.py
└── templates/
    ├── base.html      # 基础模板
    ├── index.html     # 首页
    └── user.html      # 用户页
\`\`\`

## render_template 渲染

视图函数用 \`render_template\` 渲染模板：

\`\`\`python
# 从 flask 导入 render_template
from flask import render_template

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 渲染 index.html，传入变量
    # 返回 render_template("index.html", title="首页", user="Tom")
    return render_template("index.html", title="首页", user="Tom")

# 装饰器：app.route
@app.route("/user/<name>")
# 定义函数 user，参数: name
def user(name):
    # 传入对象、列表都行
    # 返回 render_template("user.html", name=name, hobbies=["读书", "游泳"])
    return render_template("user.html", name=name, hobbies=["读书", "游泳"])
\`\`\`

\`render_template(\"文件名\", 变量=值)\` —— 第一个参数是 templates 目录下的文件路径，后面是传给模板的变量。

## Jinja2 模板语法

Jinja2 有两类标记：

### {{ }} 变量

输出变量的值：

\`\`\`html
# <h1>{{ title }}</h1>
<h1>{{ title }}</h1>
# <p>欢迎，{{ user }}</p>
<p>欢迎，{{ user }}</p>
\`\`\`

可以访问对象属性和字典键：

\`\`\`html
# <p>{{ user.name }}</p>      <!-- 对象属性 -->
<p>{{ user.name }}</p>      <!-- 对象属性 -->
# <p>{{ user["age"] }}</p>    <!-- 字典键 -->
<p>{{ user["age"] }}</p>    <!-- 字典键 -->
# <p>{{ hobbies[0] }}</p>     <!-- 列表索引 -->
<p>{{ hobbies[0] }}</p>     <!-- 列表索引 -->
\`\`\`

### {% %} 控制语句

\`\`\`html
# <!-- if 判断 -->
<!-- if 判断 -->
# {% if user %}
{% if user %}
    # <p>欢迎，{{ user }}</p>
    <p>欢迎，{{ user }}</p>
# {% else %}
{% else %}
    # <p>请登录</p>
    <p>请登录</p>
# {% endif %}
{% endif %}

# <!-- for 循环 -->
<!-- for 循环 -->
# <ul>
<ul>
# {% for hobby in hobbies %}
{% for hobby in hobbies %}
    # <li>{{ hobby }}</li>
    <li>{{ hobby }}</li>
# {% endfor %}
{% endfor %}
# </ul>
</ul>
\`\`\`

注意控制语句都要用 \`{% endif %}\`、\`{% endfor %}\` 闭合。

## 模板继承（extends/block）

这是 Jinja2 最强大的特性。先写一个基础模板 \`base.html\`：

\`\`\`html
# <!DOCTYPE html>
<!DOCTYPE html>
# <html>
<html>
# <head>
<head>
    # <title>{% block title %}默认标题{% endblock %}</title>
    <title>{% block title %}默认标题{% endblock %}</title>
# </head>
</head>
# <body>
<body>
    # <nav>导航栏（所有页面共享）</nav>
    <nav>导航栏（所有页面共享）</nav>
    # <main>
    <main>
        # {% block content %}{% endblock %}
        {% block content %}{% endblock %}
    # </main>
    </main>
    # <footer>页脚（所有页面共享）</footer>
    <footer>页脚（所有页面共享）</footer>
# </body>
</body>
# </html>
</html>
\`\`\`

子模板继承它，只填自己的内容：

\`\`\`html
# <!-- index.html -->
<!-- index.html -->
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block title %}首页{% endblock %}
{% block title %}首页{% endblock %}

# {% block content %}
{% block content %}
# <h1>欢迎来到首页</h1>
<h1>欢迎来到首页</h1>
# <p>这是首页内容</p>
<p>这是首页内容</p>
# {% endblock %}
{% endblock %}
\`\`\`

\`{% extends \"base.html\" %}\` 表示继承基础模板，\`{% block xxx %}\` 定义要填充的块。

好处：导航栏、页脚这些公共部分只写一次，所有页面共享。改一处全站生效。这是「DRY（不要重复自己）」原则在模板层的体现。

## static 目录放静态文件

CSS、JS、图片这些静态文件放 \`static/\` 目录：

\`\`\`
项目根目录/
├── app.py
├── templates/
└── static/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── img/
        └── logo.png
\`\`\`

## 引用静态文件 url_for

模板里引用静态文件用 \`url_for\`：

\`\`\`html
# <!-- 引用 CSS -->
<!-- 引用 CSS -->
# <link rel="stylesheet" href="{{ url_for('static', 
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">

# <!-- 引用 JS -->
<!-- 引用 JS -->
# <script src="{{ url_for('static', filename='js/mai
<script src="{{ url_for('static', filename='js/main.js') }}"></script>

# <!-- 引用图片 -->
<!-- 引用图片 -->
# <img src="{{ url_for('static', filename='img/logo.
<img src="{{ url_for('static', filename='img/logo.png') }}">
\`\`\`

\`url_for(\"static\", filename=\"路径\")\` 生成静态文件的 URL（如 \`/static/css/style.css\`）。

为什么用 url_for 而不直接写 \`/static/css/style.css\`？因为 Flask 支持自定义静态目录路径和 URL，用 url_for 能自动适配。

## flash 消息闪现

flash 用来给用户「一次性」反馈消息（如「保存成功」「密码错误」），显示一次后就消失：

\`\`\`python
# 从 flask 导入 flash, redirect, url_for
from flask import flash, redirect, url_for

app.secret_key = "xxx"  # flash 需要 session，所以要 secret_key

# 装饰器：app.route
@app.route("/save")
# 定义函数 save，参数: 
def save():
    # 存一条 flash 消息
    # 调用 flash()
    flash("保存成功！")
    # 返回 redirect(url_for("index"))
    return redirect(url_for("index"))
\`\`\`

模板里取出并显示：

\`\`\`html
# <!-- 取所有 flash 消息 -->
<!-- 取所有 flash 消息 -->
# {% with messages = get_flashed_messages() %}
{% with messages = get_flashed_messages() %}
  # {% if messages %}
  {% if messages %}
    # <div class="alert">
    <div class="alert">
      # {% for message in messages %}
      {% for message in messages %}
        # <p>{{ message }}</p>
        <p>{{ message }}</p>
      # {% endfor %}
      {% endfor %}
    # </div>
    </div>
  # {% endif %}
  {% endif %}
# {% endwith %}
{% endwith %}
\`\`\`

flash 存在 session 里，取一次就没了——适合「操作后跳转，新页面显示提示」的场景。

## 代码示例：带模板和静态文件的页面

一个完整的模板示例，含继承、变量、循环、静态文件：

\`templates/base.html\`：

\`\`\`html
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh">
<html lang="zh">
# <head>
<head>
    # <meta charset="UTF-8">
    <meta charset="UTF-8">
    # <title>{% block title %}我的网站{% endblock %}</title>
    <title>{% block title %}我的网站{% endblock %}</title>
    # <!-- 引入静态 CSS -->
    <!-- 引入静态 CSS -->
    # <link rel="stylesheet" href="{{ url_for('static', 
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
# </head>
</head>
# <body>
<body>
    # <nav>
    <nav>
        # <a href="{{ url_for('index') }}">首页</a>
        <a href="{{ url_for('index') }}">首页</a>
        # <a href="{{ url_for('users') }}">用户</a>
        <a href="{{ url_for('users') }}">用户</a>
    # </nav>
    </nav>
    # <main>
    <main>
        # {% block content %}{% endblock %}
        {% block content %}{% endblock %}
    # </main>
    </main>
    # <!-- flash 消息 -->
    <!-- flash 消息 -->
    # {% with messages = get_flashed_messages() %}
    {% with messages = get_flashed_messages() %}
        # {% if messages %}
        {% if messages %}
            # <div class="flash">
            <div class="flash">
                # {% for m in messages %}<p>{{ m }}</p>{% endfor %}
                {% for m in messages %}<p>{{ m }}</p>{% endfor %}
            # </div>
            </div>
        # {% endif %}
        {% endif %}
    # {% endwith %}
    {% endwith %}
    # <script src="{{ url_for('static', filename='js/mai
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
# </body>
</body>
# </html>
</html>
\`\`\`

\`templates/users.html\`：

\`\`\`html
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block title %}用户列表{% endblock %}
{% block title %}用户列表{% endblock %}

# {% block content %}
{% block content %}
# <h1>用户列表</h1>
<h1>用户列表</h1>
# <table>
<table>
    # <tr><th>ID</th><th>姓名</th><th>角色</th></tr>
    <tr><th>ID</th><th>姓名</th><th>角色</th></tr>
    # {% for user in users %}
    {% for user in users %}
    # <tr>
    <tr>
        # <td>{{ user.id }}</td>
        <td>{{ user.id }}</td>
        # <td>{{ user.name }}</td>
        <td>{{ user.name }}</td>
        # <td>{{ user.role }}</td>
        <td>{{ user.role }}</td>
    # </tr>
    </tr>
    # {% else %}
    {% else %}
    # <tr><td colspan="3">没有用户</td></tr>
    <tr><td colspan="3">没有用户</td></tr>
    # {% endfor %}
    {% endfor %}
# </table>
</table>
\`\`\`

\`app.py\`：

\`\`\`python
# 从 flask 导入 Flask, render_template, flash, redirect, url_for
from flask import Flask, render_template, flash, redirect, url_for

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 定义列表 USERS
USERS = [
    # {"id": 1, "name": "Tom", "role": "admin"},
    {"id": 1, "name": "Tom", "role": "admin"},
    # {"id": 2, "name": "Jerry", "role": "user"},
    {"id": 2, "name": "Jerry", "role": "user"},
# ]
]

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 render_template("index.html")
    return render_template("index.html")

# 装饰器：app.route
@app.route("/users")
# 定义函数 users，参数: 
def users():
    # 返回 render_template("users.html", users=USERS)
    return render_template("users.html", users=USERS)

# 装饰器：app.route
@app.route("/add")
# 定义函数 add_user，参数: 
def add_user():
    # 调用 USERS.append()
    USERS.append({"id": 3, "name": "新用户", "role": "user"})
    flash("用户添加成功")  # 闪现消息
    return redirect(url_for("users"))  # 跳回列表页
\`\`\`

注意 \`{% for ... else %}\` 语法：列表为空时执行 else 块。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 模板目录错 | 放根目录 | 放 templates/ |
| 静态目录错 | 放根目录 | 放 static/ |
| 拼接 HTML | "<h1>" + name | 用模板 + 自动转义 |
| 忘 extends 闭合 | {% block %} 没 endblock | 必须闭合 |
| flash 没 secret_key | 不设密钥 | flash 要 session，必设 |
| 静态文件硬编码 | /static/xxx.css | 用 url_for 生成 |

下一章我们深入 Flask 的 request 和 response 对象，看怎么精细控制请求响应。`
  },

  // ============================================================
  // 第 12 章：Flask Request 与 Response
  // ============================================================
  {
    id: "flask-request",
    group: "Flask 入门",
    icon: "📋",
    title: "Flask Request 与 Response",
    content: `# Flask Request 与 Response

## request 对象

Flask 把当前请求封装成 \`request\` 对象（全局代理，实际上是请求上下文里的局部变量）。它包含请求的所有信息：

\`\`\`python
# 从 flask 导入 request
from flask import request

# 装饰器：app.route
@app.route("/test")
# 定义函数 test，参数: 
def test():
    # 请求方法
    method = request.method  # "GET" / "POST"
    # 完整 URL
    url = request.url  # "http://localhost:5000/test?a=1"
    # 路径
    path = request.path  # "/test"
    # 请求头
    # 定义变量 ua，赋值为 request.headers.get("User-Agent")
    ua = request.headers.get("User-Agent")
    # Cookie
    # 定义变量 theme，赋值为 request.cookies.get("theme", "light")
    theme = request.cookies.get("theme", "light")
    # ...
\`\`\`

### request 的常用属性

| 属性 | 含义 | 类型 |
|------|------|------|
| method | HTTP 方法 | 字符串 |
| url | 完整 URL | 字符串 |
| path | 路径 | 字符串 |
| args | 查询参数 | ImmutableMultiDict |
| form | 表单数据 | ImmutableMultiDict |
| files | 上传文件 | MultiDict |
| values | args + form 合并 | CombinedMultiDict |
| json / get_json() | JSON 请求体 | 字典 |
| headers | 请求头 | dict-like |
| cookies | Cookie | dict-like |
| data | 原始请求体字节 | bytes |
| remote_addr | 客户端 IP | 字符串 |

### 请求头 headers

\`\`\`python
# headers 像字典，键不区分大小写
# 定义变量 content_type，赋值为 request.headers.get("Content-Type")
content_type = request.headers.get("Content-Type")
# 定义变量 auth，赋值为 request.headers.get("Authorization")
auth = request.headers.get("Authorization")
# 遍历所有头部
# 遍历 request.headers，取 key, value
for key, value in request.headers:
    # 调用 print()
    print(key, value)
\`\`\`

### Cookie cookies

\`\`\`python
# cookies 是字典，键是 cookie 名
# 定义变量 session_id，赋值为 request.cookies.get("session_id")
session_id = request.cookies.get("session_id")
theme = request.cookies.get("theme", "light")  # 默认值
\`\`\`

## response 构建

视图函数返回字符串时，Flask 自动包成 Response 对象。要精细控制响应（设状态码、头部、Cookie），自己构建：

### make_response

\`\`\`python
# 从 flask 导入 make_response
from flask import make_response

# 装饰器：app.route
@app.route("/custom")
# 定义函数 custom，参数: 
def custom():
    # make_response(正文, 状态码)
    # 定义变量 resp，赋值为 make_response("自定义响应", 201)
    resp = make_response("自定义响应", 201)
    # 设响应头
    # resp.headers["X-Custom"] = "hello"
    resp.headers["X-Custom"] = "hello"
    # 设 Cookie
    # 调用 resp.set_cookie()
    resp.set_cookie("visited", "yes", max_age=3600)
    # 返回 resp
    return resp
\`\`\`

### Response 对象

\`\`\`python
# 从 flask 导入 Response
from flask import Response

# 直接构造 Response
# 定义变量 resp，赋值为 Response(
resp = Response(
        # "响应内容",
        "响应内容",
        # 定义变量 status，赋值为 200,
        status=200,
        # 定义变量 content_type，赋值为 "text/plain; charset=utf-8",
        content_type="text/plain; charset=utf-8",
    # )
    )
# 等价于设 headers
# resp.headers["X-Powered-By"] = "Flask"
resp.headers["X-Powered-By"] = "Flask"
\`\`\`

## 返回 JSON jsonify

API 返回 JSON，用 \`jsonify\`：

\`\`\`python
# 从 flask 导入 jsonify
from flask import jsonify

# 装饰器：app.route
@app.route("/api/user")
# 定义函数 api_user，参数: 
def api_user():
    # jsonify 会：1. 序列化成 JSON 2. 设 Content-Type: application/json 3. 中文不转义（新版）
    # 返回 jsonify({"id": 1, "name": "Tom", "role": "管理员"})
    return jsonify({"id": 1, "name": "Tom", "role": "管理员"})

# Flask 2.x+ 也支持直接返回字典（自动 jsonify）
# 装饰器：app.route
@app.route("/api/info")
# 定义函数 api_info，参数: 
def api_info():
    return {"version": "3.0", "name": "Flask"}  # 自动转 JSON
\`\`\`

为什么用 \`jsonify\` 而不 \`json.dumps\`？因为 jsonify 会自动设正确的 \`Content-Type: application/json\`，并处理一些编码细节（如中文）。直接 \`json.dumps\` 返回的是 text/html，前端解析可能出问题。

## 返回模板 render_template

\`\`\`python
# 从 flask 导入 render_template
from flask import render_template

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回渲染好的 HTML，Content-Type 自动设为 text/html
    # 返回 render_template("index.html", title="首页")
    return render_template("index.html", title="首页")
\`\`\`

## 设置 Cookie

\`\`\`python
# 从 flask 导入 make_response
from flask import make_response

# 装饰器：app.route
@app.route("/set-pref")
# 定义函数 set_pref，参数: 
def set_pref():
    # 定义变量 resp，赋值为 make_response("偏好已保存")
    resp = make_response("偏好已保存")
    # 设置 cookie，带安全属性
    # 调用 resp.set_cookie()
    resp.set_cookie("theme", "dark", max_age=30*24*3600, httponly=True)
    # 调用 resp.set_cookie()
    resp.set_cookie("lang", "zh", httponly=True, samesite="Lax")
    # 返回 resp
    return resp
\`\`\`

注意：**设置 Cookie 必须在 response 上设**，不能在 request 上。因为 Cookie 是服务器发给客户端的，属于响应。

## 设置 Header

\`\`\`python
# 装饰器：app.route
@app.route("/download")
# 定义函数 download，参数: 
def download():
    # 定义变量 resp，赋值为 make_response("文件内容...")
    resp = make_response("文件内容...")
    # 设 Content-Disposition 让浏览器下载而非显示
    # resp.headers["Content-Disposition"] = 'attachment;
    resp.headers["Content-Disposition"] = 'attachment; filename="data.txt"'
    # resp.headers["Content-Type"] = "text/plain"
    resp.headers["Content-Type"] = "text/plain"
    # 返回 resp
    return resp

# CORS 跨域头（简化版，生产用 flask-cors 扩展）
# 装饰器：app.after_request
@app.after_request
# 定义函数 add_cors，参数: resp
def add_cors(resp):
    # resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Origin"] = "*"
    # 返回 resp
    return resp
\`\`\`

## 重定向 redirect

\`\`\`python
# 从 flask 导入 redirect, url_for
from flask import redirect, url_for

# 装饰器：app.route
@app.route("/old")
# 定义函数 old，参数: 
def old():
    # 永久重定向到新地址
    # 返回 redirect(url_for("new"), code=301)
    return redirect(url_for("new"), code=301)

# 装饰器：app.route
@app.route("/new")
# 定义函数 new，参数: 
def new():
    # 返回 "新页面"
    return "新页面"

# 登录后跳回原页面
# 装饰器：app.route
@app.route("/login")
# 定义函数 login，参数: 
def login():
    # 条件判断：如果 not logged_in()
    if not logged_in():
        # 返回 redirect(url_for("login_page"))
        return redirect(url_for("login_page"))
    # 返回 "已登录"
    return "已登录"
\`\`\`

\`redirect(url, code=302)\` 默认 302 临时重定向。SEO 相关的换地址用 301 永久重定向。

## 错误处理 abort

\`\`\`python
# 从 flask 导入 abort
from flask import abort

# 装饰器：app.route
@app.route("/users/<int:user_id>")
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 定义变量 user，赋值为 find_user(user_id)
    user = find_user(user_id)
    # 条件判断：如果 not user
    if not user:
        # 直接抛出 404，中断视图执行
        # 调用 abort()
        abort(404)
    # 如果没权限
    # 条件判断：如果 not has_permission()
    if not has_permission():
        abort(403, "你没有权限查看此用户")  # 带自定义消息
    # 返回 jsonify(user)
    return jsonify(user)
\`\`\`

\`abort(状态码)\` 会立刻停止视图函数并返回对应错误页。不用自己写 \`if not user: return \"...\", 404\` 那么啰嗦。

## 自定义错误页

\`\`\`python
# 装饰器：app.errorhandler
@app.errorhandler(404)
# 定义函数 not_found，参数: error
def not_found(error):
    # 当 404 发生时，返回自定义页面
    # 返回 render_template("404.html"), 404
    return render_template("404.html"), 404

# 装饰器：app.errorhandler
@app.errorhandler(500)
# 定义函数 server_error，参数: error
def server_error(error):
    # 500 错误的统一处理
    # 返回 render_template("500.html"), 500
    return render_template("500.html"), 500

# 装饰器：app.errorhandler
@app.errorhandler(403)
# 定义函数 forbidden，参数: error
def forbidden(error):
    # 返回 "禁止访问", 403
    return "禁止访问", 403
\`\`\`

## 上下文 g 和 current_app

Flask 有两种上下文：

**应用上下文（Application Context）：**
- \`current_app\`：当前应用实例（在多应用场景下定位）。
- \`g\`：请求级的临时存储，请求结束销毁。

\`\`\`python
# 从 flask 导入 g, current_app
from flask import g, current_app

# 装饰器：app.before_request
@app.before_request
# 定义函数 before，参数: 
def before():
    # 在请求开始时，把数据库连接存到 g
    # g.db = connect_db()
    g.db = connect_db()

# 装饰器：app.route
@app.route("/users")
# 定义函数 users，参数: 
def users():
    # 视图里取出来用
    # 定义变量 users，赋值为 g.db.query("SELECT * FROM users")
    users = g.db.query("SELECT * FROM users")
    # 返回 jsonify(users)
    return jsonify(users)

# 装饰器：app.teardown_request
@app.teardown_request
# 定义函数 teardown，参数: exception
def teardown(exception):
    # 请求结束关闭连接
    # 定义变量 db，赋值为 getattr(g, "db", None)
    db = getattr(g, "db", None)
    # 条件判断：如果 db is not None
    if db is not None:
        # 调用 db.close()
        db.close()
\`\`\`

**请求上下文（Request Context）：**
- \`request\`：当前请求对象。
- \`session\`：当前会话。

\`g\` 的作用：在请求生命周期内共享数据（before_request 设，视图用，teardown 清）。避免全局变量（线程不安全）。

## 代码示例：完整请求响应处理

\`\`\`python
# 从 flask 导入（多行）
from flask import (Flask, request, jsonify, make_response, 
                   # redirect, url_for, abort, render_template, g)
                   redirect, url_for, abort, render_template, g)

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 请求前：模拟认证检查
# 装饰器：app.before_request
@app.before_request
# 定义函数 check_auth，参数: 
def check_auth():
    # /public 不需要认证
    # 条件判断：如果 request.path.startswith("/public")
    if request.path.startswith("/public"):
        return None  # 返回 None 表示继续
    # 其他接口检查 token
    # 定义变量 token，赋值为 request.headers.get("Authorization")
    token = request.headers.get("Authorization")
    # 条件判断：如果 not token
    if not token:
        # 没带 token，返回 401
        # 返回 jsonify({"error": "未认证"}), 401
        return jsonify({"error": "未认证"}), 401
    # 模拟解析 token，存到 g
    g.user_id = 1  # 假设从 token 解出

# 首页：返回 HTML
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 render_template("index.html", user_id=g.user_id)
    return render_template("index.html", user_id=g.user_id)

# 公开接口（不需认证）
# 装饰器：app.route
@app.route("/public/health")
# 定义函数 health，参数: 
def health():
    # 返回 jsonify({"status": "ok"})
    return jsonify({"status": "ok"})

# 获取用户：带路径参数和错误处理
# 装饰器：app.route
@app.route("/users/<int:user_id>")
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 条件判断：如果 user_id != g.user_id
    if user_id != g.user_id:
        # 调用 abort()
        abort(403, "无权访问他人信息")
    # 定义字典 user
    user = {"id": user_id, "name": "Tom"}
    # 返回 jsonify(user)
    return jsonify(user)

# 设置偏好：演示设 Cookie
# 装饰器：app.route
@app.route("/prefs/theme/<theme>")
# 定义函数 set_theme，参数: theme
def set_theme(theme):
    # 定义变量 resp，赋值为 make_response(jsonify({"theme": theme}))
    resp = make_response(jsonify({"theme": theme}))
    # 调用 resp.set_cookie()
    resp.set_cookie("theme", theme, max_age=30*24*3600, httponly=True)
    # 返回 resp
    return resp

# 旧地址重定向
# 装饰器：app.route
@app.route("/home")
# 定义函数 home，参数: 
def home():
    # 返回 redirect(url_for("index"))
    return redirect(url_for("index"))

# 自定义错误页
# 装饰器：app.errorhandler
@app.errorhandler(404)
# 定义函数 not_found，参数: error
def not_found(error):
    # 返回 jsonify({"error": "资源不存在"}), 404
    return jsonify({"error": "资源不存在"}), 404

# 装饰器：app.errorhandler
@app.errorhandler(403)
# 定义函数 forbidden，参数: error
def forbidden(error):
    # 返回 jsonify({"error": "禁止访问"}), 403
    return jsonify({"error": "禁止访问"}), 403

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

这个示例覆盖了：认证检查、路径参数、错误处理、Cookie、重定向、JSON 响应、上下文 g。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| Cookie 设在 request | request.set_cookie | 在 response 上设 |
| json.dumps 当响应 | return json.dumps(...) | 用 jsonify |
| abort 后写代码 | abort(404); return ... | abort 已中断 |
| g 跨请求复用 | 以为 g 是持久的 | g 只在请求内有效 |
| 全局变量存数据 | 全局变量存请求信息 | 用 g（请求级） |
| 忘 Content-Type | 返回 JSON 没设头 | jsonify 自动设 |

下一批我们进入 Flask 进阶，看蓝图、数据库、中间件和实战项目。`
  },
];
