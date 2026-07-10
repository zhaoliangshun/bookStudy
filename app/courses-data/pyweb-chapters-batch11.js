// =============================================================
// Python Web 应用开发实战教程 - 第 11 批章节（表单与文件上传篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   41. form-handling : 表单数据处理
//   42. wtforms      : WTForms 表单库
//   43. file-upload   : 文件上传处理
//   44. form-practice : 表单与上传实战
//
// 技术栈：Python 3.11+ / Flask / Django / WTForms / Flask-WTF
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式（shell/docker 变量）统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"表单与文件上传"
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十一章：表单数据处理
  // =========================================================
  {
    id: "form-handling",
    group: "表单与文件上传",
    icon: "📝",
    title: "表单数据处理",
    content: `

# 表单数据处理

## 一、表单是什么

**表单**是浏览器向服务器提交数据的标准方式：用户在输入框里填内容，点提交按钮，浏览器把数据打包发给服务器。登录、注册、搜索、发文、评论——几乎所有"用户输入"都走表单。

\`\`\`txt filename="表单提交的 HTTP 流程"
1. 浏览器渲染 <form>，用户填数据
2. 点提交 → 浏览器把数据按 method 编码
   - GET：拼到 URL 查询串 ?name=alice&age=18
   - POST：放在请求体里
3. 服务器接收 → 解码 → 校验 → 存库/响应
\`\`\`

\`\`\`html filename="一个最简单的表单"
# <form action="/register" method="post">
<form action="/register" method="post">
  # <input type="text" name="username" placeholder="用户
  <input type="text" name="username" placeholder="用户名">
  # <input type="password" name="password" placeholder
  <input type="password" name="password" placeholder="密码">
  # <button type="submit">注册</button>
  <button type="submit">注册</button>
# </form>
</form>
\`\`\`

关键属性：
- \`action\`：提交到哪个 URL（不写就是当前页）。
- \`method\`：GET 或 POST（默认 GET）。
- \`name\`：每个输入控件的**名字**，服务器靠它取值。

## 二、GET 表单 vs POST 表单

\`\`\`txt filename="GET vs POST 表单"
            GET                          POST
数据位置    URL 查询串 ?a=1&b=2          请求体
可见性      浏览器地址栏能看到            不在地址栏
长度限制    有（URL 一般 2KB 上限）        无（理论上无限制）
缓存        会被浏览器缓存历史            不缓存
语义        查询（幂等，可收藏）           修改（非幂等，不可收藏）
典型场景    搜索、筛选、分页             登录、注册、发文
\`\`\`

\`\`\`html filename="GET 表单：搜索"
# <!-- 提交后地址变成 /search?q=python -->
<!-- 提交后地址变成 /search?q=python -->
# <form action="/search" method="get">
<form action="/search" method="get">
  # <input type="text" name="q">
  <input type="text" name="q">
  # <button>搜索</button>
  <button>搜索</button>
# </form>
</form>
\`\`\`

\`\`\`html filename="POST 表单：登录"
# <!-- 数据在请求体里，地址栏看不到 -->
<!-- 数据在请求体里，地址栏看不到 -->
# <form action="/login" method="post">
<form action="/login" method="post">
  # <input type="text" name="username">
  <input type="text" name="username">
  # <input type="password" name="password">
  <input type="password" name="password">
  # <button>登录</button>
  <button>登录</button>
# </form>
</form>
\`\`\`

> **敏感数据必须用 POST**：密码、邮箱、信用卡号用 GET 会暴露在 URL 里，被浏览器历史、代理日志、服务器日志记录。但 POST 不是加密，传输层安全要靠 HTTPS。

## 三、Flask 处理表单

\`\`\`python filename="Flask 取表单数据"
# 从 flask 导入 Flask, request, render_template
from flask import Flask, request, render_template

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # request.form 是 POST 表单数据的字典
        # 定义变量 username，赋值为 request.form.get("username")
        username = request.form.get("username")
        # 定义变量 password，赋值为 request.form.get("password")
        password = request.form.get("password")
        # GET 参数用 request.args
        # request.values 是 form + args 的合并
        # 校验...
        # 返回 f"注册成功：{username}"
        return f"注册成功：{username}"
    # GET：渲染表单页面
    # 返回 render_template("register.html")
    return render_template("register.html")
\`\`\`

\`\`\`python filename="Flask 表单字段访问"
# 单值
username = request.form.get("username")   # 没有返回 None
username = request.form["username"]       # 没有会 KeyError

# 多选（checkbox 同名多个值）
tags = request.form.getlist("tags")       # 返回 list

# 所有字段
# 遍历 request.form.items()，取 key, value
for key, value in request.form.items():
    # 调用 print()
    print(key, value)
\`\`\`

## 四、Django 处理表单

\`\`\`python filename="Django 取表单数据"
# views.py
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect

# 定义函数 register，参数: request
def register(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # Django 用 request.POST
        # 定义变量 username，赋值为 request.POST.get("username")
        username = request.POST.get("username")
        # 定义变量 password，赋值为 request.POST.get("password")
        password = request.POST.get("password")
        # 返回 redirect("/")
        return redirect("/")
    # 返回 render(request, "register.html")
    return render(request, "register.html")
\`\`\`

\`\`\`txt filename="Flask vs Django 表单对象"
Flask    request.form      POST 表单
Flask    request.args      GET 查询参数
Flask    request.values    form + args 合并
Django   request.POST      POST 表单
Django   request.GET       GET 查询参数
\`\`\`

## 五、表单校验

服务器收到的数据**绝对不能直接信任**：可能为空、格式错、超长、含恶意字符。校验是后端的底线。

### 1. 手动校验

\`\`\`python filename="手动校验表单"
# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 定义字典 errors
    errors = {}
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 username，赋值为 request.form.get("username", "").strip()
        username = request.form.get("username", "").strip()
        # 定义变量 password，赋值为 request.form.get("password", "")
        password = request.form.get("password", "")
        # 定义变量 email，赋值为 request.form.get("email", "").strip()
        email = request.form.get("email", "").strip()

        # 必填
        # 条件判断：如果 not username
        if not username:
            # errors["username"] = "用户名不能为空"
            errors["username"] = "用户名不能为空"
        # 否则如果 len(username) < 3 or len(username) > 20
        elif len(username) < 3 or len(username) > 20:
            # errors["username"] = "用户名长度需 3-20"
            errors["username"] = "用户名长度需 3-20"

        # 密码强度
        # 条件判断：如果 len(password) < 8
        if len(password) < 8:
            # errors["password"] = "密码至少 8 位"
            errors["password"] = "密码至少 8 位"
        # 否则如果 not any(c.isdigit() for c in password)
        elif not any(c.isdigit() for c in password):
            # errors["password"] = "密码需含数字"
            errors["password"] = "密码需含数字"

        # 邮箱格式
        # 条件判断：如果 "@" not in email
        if "@" not in email:
            # errors["email"] = "邮箱格式错误"
            errors["email"] = "邮箱格式错误"

        # 条件判断：如果 not errors
        if not errors:
            # 校验通过，存库
            # 返回 "注册成功"
            return "注册成功"

    # 校验失败或 GET，回显表单 + 错误
    # 返回 render_template("register.html",
    return render_template("register.html",
                           # 定义变量 form，赋值为 request.form, errors=errors)
                           form=request.form, errors=errors)
\`\`\`

### 2. 校验后回显

\`\`\`html filename="校验失败回显上次输入"
# <form method="post">
<form method="post">
  # <input type="text" name="username"
  <input type="text" name="username"
         # 定义变量 value，赋值为 "{{ form.username if form else '' }}">
         value="{{ form.username if form else '' }}">
  # {% if errors.username %}<span class="err">{{ error
  {% if errors.username %}<span class="err">{{ errors.username }}</span>{% endif %}

  # <input type="password" name="password">
  <input type="password" name="password">
  # {% if errors.password %}<span class="err">{{ error
  {% if errors.password %}<span class="err">{{ errors.password }}</span>{% endif %}
  # <button>注册</button>
  <button>注册</button>
# </form>
</form>
\`\`\`

## 六、CSRF 防护

**CSRF**（Cross-Site Request Forgery，跨站请求伪造）：攻击者诱导用户在已登录状态下，向目标网站发 POST 请求（如转账）。浏览器自动带上 cookie，服务器以为是用户本人操作。

\`\`\`txt filename="CSRF 攻击示意"
1. 用户登录 bank.com，浏览器存了 session cookie
2. 用户访问 evil.com，里面有个隐藏表单自动提交到 bank.com/transfer
3. 浏览器带上 bank.com 的 cookie 发请求
4. bank.com 以为是用户本人 → 转账成功
\`\`\`

**防御：CSRF Token**。服务器给表单发一个随机 token，提交时验证。evil.com 拿不到这个 token，伪造的请求通不过。

\`\`\`html filename="表单里带 CSRF Token"
# <form method="post">
<form method="post">
  # <!-- 隐藏字段：随机 token -->
  <!-- 隐藏字段：随机 token -->
  # <input type="hidden" name="csrf_token" value="{{ c
  <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
  # <input type="text" name="amount">
  <input type="text" name="amount">
  # <button>转账</button>
  <button>转账</button>
# </form>
</form>
\`\`\`

\`\`\`python filename="Flask 手动 CSRF"
# 导入 secrets 模块
import secrets

# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 装饰器：app.route
@app.route("/transfer", methods=["GET", "POST"])
# 定义函数 transfer，参数: 
def transfer():
    # 条件判断：如果 request.method == "GET"
    if request.method == "GET":
        # 生成 token 存 session
        # 定义变量 token，赋值为 secrets.token_hex(16)
        token = secrets.token_hex(16)
        # session["csrf_token"] = token
        session["csrf_token"] = token
        # 返回 render_template("transfer.html", csrf_token=token)
        return render_template("transfer.html", csrf_token=token)
    # 否则执行
    else:
        # 校验 token
        # 条件判断：如果 request.form.get("csrf_token") != session.get("csrf_token")
        if request.form.get("csrf_token") != session.get("csrf_token"):
            # 调用 abort()
            abort(400, "CSRF 校验失败")
        # 处理转账...
\`\`\`

\`\`\`python filename="Flask-WTF 自动 CSRF（推荐）"
# 从 flask_wtf.csrf 导入 CSRFProtect
from flask_wtf.csrf import CSRFProtect

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"
csrf = CSRFProtect(app)  # 所有 POST 自动校验 CSRF

# 模板里用 {{ form.csrf_token }} 或 {{ csrf_token() }}
\`\`\`

\`\`\`python filename="Django 自带 CSRF"
# Django 默认开启 CSRF 中间件
# 模板里加 {% csrf_token %} 标签
# <form method="post">
<form method="post">
  # {% csrf_token %}  {# 自动生成隐藏字段 #}
  {% csrf_token %}  {# 自动生成隐藏字段 #}
  # ...
  ...
# </form>
</form>
\`\`\`

## 七、PRG 模式：防重复提交

用户提交表单后按 F5 刷新，浏览器会提示"重新提交表单数据"——如果点是，就会重复创建订单/重复发帖。

\`\`\`txt filename="PRG（Post/Redirect/Get）模式"
Post      用户提交表单（POST /create）
  ↓ 服务器处理，存库
Redirect  服务器返回 302 重定向到 /success
  ↓ 浏览器发 GET
Get       浏览器请求 /success，显示成功页
  ↓ 此时按 F5
          只重发 GET /success，不会重新提交表单 ✅
\`\`\`

\`\`\`python filename="Flask PRG 实现"
# 从 flask 导入 redirect, url_for, flash
from flask import redirect, url_for, flash

# 装饰器：app.route
@app.route("/post/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 处理表单
        # 定义变量 title，赋值为 request.form.get("title")
        title = request.form.get("title")
        # 调用 create_post()
        create_post(title)
        flash("发布成功")  # 闪现消息存 session，下次请求取
        # 关键：重定向到详情页，不是直接返回
        # 返回 redirect(url_for("post_detail", pid=new_id))
        return redirect(url_for("post_detail", pid=new_id))
    # GET：渲染表单
    # 返回 render_template("post_new.html")
    return render_template("post_new.html")
\`\`\`

## 八、表单数据清洗

校验前先"清洗"（clean）数据：去空格、统一大小写、去非法字符。

\`\`\`python filename="数据清洗"
# 定义函数 clean_username，参数: raw
def clean_username(raw):
    # """清洗用户名"""
    """清洗用户名"""
    # 条件判断：如果 raw is None
    if raw is None:
        # 返回 ""
        return ""
    s = raw.strip()            # 去首尾空格
    s = s.lower()              # 统一小写（按需）
    # 去非法字符（只留字母数字下划线）
    # 导入 re 模块
    import re
    # 定义变量 s，赋值为 re.sub(r"[^a-z0-9_]", "", s)
    s = re.sub(r"[^a-z0-9_]", "", s)
    # 返回 s
    return s

# 定义函数 clean_email，参数: raw
def clean_email(raw):
    # 条件判断：如果 raw is None
    if raw is None:
        # 返回 ""
        return ""
    # 返回 raw.strip().lower()
    return raw.strip().lower()
\`\`\`

> **清洗在校验前**：先 strip 再校验长度，避免"  abc  "因为前后空格被误判超长。

## 九、完整示例：Flask 注册表单

\`\`\`python filename="完整注册流程"
# 从 flask 导入 Flask, render_template, request, redirect, url_for, flash, session
from flask import Flask, render_template, request, redirect, url_for, flash, session
# 导入 re 模块
import re

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 定义函数 is_strong_password，参数: pwd
def is_strong_password(pwd):
    # """密码强度：至少 8 位，含字母和数字"""
    """密码强度：至少 8 位，含字母和数字"""
    # 条件判断：如果 len(pwd) < 8
    if len(pwd) < 8:
        # 返回 False
        return False
    # 返回 bool(re.search(r"[a-zA-Z]", pwd)) and bool(re.search(r"\d", pwd))
    return bool(re.search(r"[a-zA-Z]", pwd)) and bool(re.search(r"\d", pwd))

# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 定义字典 errors
    errors = {}
    # 定义字典 form
    form = {}
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 1. 取数据并清洗
        # 定义变量 username，赋值为 request.form.get("username", "").strip()
        username = request.form.get("username", "").strip()
        # 定义变量 password，赋值为 request.form.get("password", "")
        password = request.form.get("password", "")
        # 定义变量 confirm，赋值为 request.form.get("confirm", "")
        confirm = request.form.get("confirm", "")
        # 定义变量 email，赋值为 request.form.get("email", "").strip()
        email = request.form.get("email", "").strip()
        # 定义变量 agreed，赋值为 request.form.get("agreed")
        agreed = request.form.get("agreed")
        form = {"username": username, "email": email}  # 回显用（不回显密码）

        # 2. 校验
        # 条件判断：如果 not username
        if not username:
            # errors["username"] = "用户名不能为空"
            errors["username"] = "用户名不能为空"
        # 否则如果 len(username) < 3
        elif len(username) < 3:
            # errors["username"] = "用户名至少 3 位"
            errors["username"] = "用户名至少 3 位"
        # 条件判断：如果 not is_strong_password(password)
        if not is_strong_password(password):
            # errors["password"] = "密码至少 8 位且含字母和数字"
            errors["password"] = "密码至少 8 位且含字母和数字"
        # 条件判断：如果 password != confirm
        if password != confirm:
            # errors["confirm"] = "两次密码不一致"
            errors["confirm"] = "两次密码不一致"
        # 条件判断：如果 "@" not in email
        if "@" not in email:
            # errors["email"] = "邮箱格式错误"
            errors["email"] = "邮箱格式错误"
        # 条件判断：如果 not agreed
        if not agreed:
            # errors["agreed"] = "必须同意协议"
            errors["agreed"] = "必须同意协议"

        # 3. 校验通过：存库（这里假装）
        # 条件判断：如果 not errors
        if not errors:
            # user = create_user(username, password_hash, email)
            # 调用 flash()
            flash("注册成功，请登录")
            return redirect(url_for("login"))  # PRG：重定向

    # 返回 render_template("register.html", errors=errors, form=form)
    return render_template("register.html", errors=errors, form=form)
\`\`\`

\`\`\`html filename="templates/register.html"
# <form method="post">
<form method="post">
  # <div>
  <div>
    # <label>用户名</label>
    <label>用户名</label>
    # <input type="text" name="username" value="{{ form.
    <input type="text" name="username" value="{{ form.username|default('') }}">
    # {% if errors.username %}<span class="err">{{ error
    {% if errors.username %}<span class="err">{{ errors.username }}</span>{% endif %}
  # </div>
  </div>
  # <div>
  <div>
    # <label>密码</label>
    <label>密码</label>
    # <input type="password" name="password">
    <input type="password" name="password">
    # {% if errors.password %}<span class="err">{{ error
    {% if errors.password %}<span class="err">{{ errors.password }}</span>{% endif %}
  # </div>
  </div>
  # <div>
  <div>
    # <label>确认密码</label>
    <label>确认密码</label>
    # <input type="password" name="confirm">
    <input type="password" name="confirm">
    # {% if errors.confirm %}<span class="err">{{ errors
    {% if errors.confirm %}<span class="err">{{ errors.confirm }}</span>{% endif %}
  # </div>
  </div>
  # <div>
  <div>
    # <label>邮箱</label>
    <label>邮箱</label>
    # <input type="email" name="email" value="{{ form.em
    <input type="email" name="email" value="{{ form.email|default('') }}">
    # {% if errors.email %}<span class="err">{{ errors.e
    {% if errors.email %}<span class="err">{{ errors.email }}</span>{% endif %}
  # </div>
  </div>
  # <div>
  <div>
    # <label><input type="checkbox" name="agreed" value=
    <label><input type="checkbox" name="agreed" value="1"> 同意协议</label>
    # {% if errors.agreed %}<span class="err">{{ errors.
    {% if errors.agreed %}<span class="err">{{ errors.agreed }}</span>{% endif %}
  # </div>
  </div>
  # <button>注册</button>
  <button>注册</button>
# </form>
</form>
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 敏感数据用 GET | URL 暴露 | 用 POST |
| 不做服务端校验 | 脏数据入库 | 后端必校验，前端校验只是体验 |
| 不回显上次输入 | 用户体验差 | 校验失败把数据回填 |
| 不防 CSRF | 跨站伪造 | 用 CSRF Token |
| 提交后直接返回页面 | F5 重复提交 | PRG 模式重定向 |
| 不清洗就校验 | 空格导致误判 | 先 strip 再校验 |
| \`request.form["x"]\` 没字段 | KeyError | 用 \`.get("x", "")\` |
| 密码明文存库 | 泄露灾难 | 哈希存储（见后续章节） |
| 表单 action 写错 | 提交到错地方 | 用 \`url_for\` 生成 |
| GET 表单做修改操作 | 误触发 | 修改必 POST |

## 十一、小结

表单是用户输入的核心入口：GET 适合查询（参数在 URL），POST 适合修改（数据在请求体）。Flask 用 \`request.form\`，Django 用 \`request.POST\`。后端必须校验（前端校验只是体验），校验失败要回显。CSRF Token 防跨站伪造，PRG 模式防重复提交，清洗数据保证质量。手动校验啰嗦，下一章用 WTForms 把校验和渲染封装进表单类。
`
  },

  // =========================================================
  // 第四十二章：WTForms 表单库
  // =========================================================
  {
    id: "wtforms",
    group: "表单与文件上传",
    icon: "📋",
    title: "WTForms 表单库",
    content: `

# WTForms 表单库

## 一、为什么需要 WTForms

上一章手动校验表单，代码又长又重复：每个字段都要取值、清洗、写一堆 if。WTForms 把这些封装成"表单类"：声明字段类型和校验器，框架自动完成取值、校验、错误收集、HTML 渲染。

\`\`\`txt filename="WTForms 的价值"
声明式：写表单类描述字段，不用手写 if/else
复用：一个表单类多处用（注册、编辑）
校验集中：每个字段的校验规则跟字段绑定
渲染统一：{{ form.username() }} 自动生成输入框
错误友好：校验失败自动收集错误信息
\`\`\`

## 二、安装

\`\`\`bash filename="安装 WTForms 和 Flask-WTF"
# 核心库：不依赖任何框架
# 安装 Python 包: wtforms
pip install wtforms

# Flask 集成扩展：加 CSRF、文件上传、表单保护
# 安装 Python 包: flask-wtf
pip install flask-wtf
\`\`\`

## 三、表单类与字段

\`\`\`python filename="定义 WTForms 表单类"
# 从 wtforms 导入 Form, StringField, IntegerField, PasswordField, TextAreaField, BooleanField
from wtforms import Form, StringField, IntegerField, PasswordField, TextAreaField, BooleanField
# 从 wtforms.validators 导入 DataRequired, Length, Email, EqualTo, NumberRange
from wtforms.validators import DataRequired, Length, Email, EqualTo, NumberRange

# 定义类 RegisterForm，继承 Form
class RegisterForm(Form):
    # 字段类型 + 校验器列表
    # 定义变量 username，赋值为 StringField(
    username = StringField(
        # "用户名",
        "用户名",
        # 定义列表 validators
        validators=[DataRequired(message="必填"), Length(min=3, max=20, message="3-20 字符")],
    # )
    )
    # 定义变量 email，赋值为 StringField(
    email = StringField(
        # "邮箱",
        "邮箱",
        # 定义列表 validators
        validators=[DataRequired(), Email(message="邮箱格式错误")],
    # )
    )
    # 定义变量 password，赋值为 PasswordField(
    password = PasswordField(
        # "密码",
        "密码",
        # 定义列表 validators
        validators=[DataRequired(), Length(min=8, message="至少 8 位")],
    # )
    )
    # 定义变量 confirm，赋值为 PasswordField(
    confirm = PasswordField(
        # "确认密码",
        "确认密码",
        # 定义列表 validators
        validators=[EqualTo("password", message="两次密码不一致")],
    # )
    )
    # 定义变量 age，赋值为 IntegerField(
    age = IntegerField(
        # "年龄",
        "年龄",
        # 定义列表 validators
        validators=[NumberRange(min=0, max=150, message="年龄不合法")],
    # )
    )
    bio = TextAreaField("个人简介")  # 无校验，可空
    # 定义变量 agreed，赋值为 BooleanField("同意协议", validators=[DataRequired...
    agreed = BooleanField("同意协议", validators=[DataRequired(message="必须同意")])
\`\`\`

### 常用字段类型

\`\`\`txt filename="WTForms 字段速查"
字段               Python 类型    HTML 控件
StringField        str            <input type="text">
PasswordField      str            <input type="password">
IntegerField       int            <input type="number">
FloatField         float          <input type="number">
BooleanField       bool           <input type="checkbox">
TextAreaField      str            <textarea>
SelectField        str            <select><option>
SelectMultipleField list          <select multiple>
FileField          文件对象        <input type="file">
DateField          date           <input type="date">
HiddenField        str            <input type="hidden">
SubmitField        -              <button type="submit">
\`\`\`

### 常用校验器

\`\`\`txt filename="WTForms 校验器速查"
校验器              作用
DataRequired()      必填（空字符串算没填）
Length(min, max)    长度范围
Email()             邮箱格式
EqualTo("field")    等于另一字段（确认密码）
NumberRange(min,max) 数值范围
URL()               URL 格式
Regexp(pattern)     正则匹配
Optional()          可空（没填就跳过其他校验）
InputRequired()     必须有输入（空串也算）
AnyOf([a,b])        值在给定列表里
NoneOf([a,b])       值不在列表里
\`\`\`

## 四、表单实例化与校验

\`\`\`python filename="实例化与校验"
# 从 flask 导入 Flask, request, render_template
from flask import Flask, request, render_template
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 传入请求数据实例化表单
    # Flask-WTF 直接传 request.form；纯 WTForms 传 formdata=request.form
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 form，赋值为 RegisterForm(request.form)
        form = RegisterForm(request.form)
        # validate() 触发校验，返回布尔
        # 条件判断：如果 form.validate()
        if form.validate():
            # form.username.data 是清洗后的值
            # 定义变量 username，赋值为 form.username.data
            username = form.username.data
            # 定义变量 email，赋值为 form.email.data
            email = form.email.data
            # 存库...
            # 返回 "注册成功"
            return "注册成功"
        # 校验失败，form.errors 是 {字段名: [错误信息]}
    # 否则执行
    else:
        form = RegisterForm()  # GET 时空表单
    # 返回 render_template("register.html", form=form)
    return render_template("register.html", form=form)
\`\`\`

\`\`\`python filename="纯 WTForms（不依赖 Flask）"
# 从 wtforms 导入 Form
from wtforms import Form
# 从 werkzeug.datastructures 导入 MultiDict
from werkzeug.datastructures import MultiDict

# 从字典实例化（测试用）
# 定义变量 form，赋值为 RegisterForm(formdata=MultiDict({
form = RegisterForm(formdata=MultiDict({
    # "username": "alice",
    "username": "alice",
    # "email": "alice@example.com",
    "email": "alice@example.com",
    # "password": "password123",
    "password": "password123",
    # "confirm": "password123",
    "confirm": "password123",
    # "agreed": "y",
    "agreed": "y",
# }))
}))
# 条件判断：如果 form.validate()
if form.validate():
    # 调用 print()
    print("校验通过")
# 否则执行
else:
    # 调用 print()
    print(form.errors)
    # 如 {'email': ['邮箱格式错误'], 'password': ['至少 8 位']}
\`\`\`

## 五、errors 错误信息

\`\`\`python filename="访问错误信息"
# 定义变量 form，赋值为 RegisterForm(request.form)
form = RegisterForm(request.form)
# 条件判断：如果 not form.validate()
if not form.validate():
    # form.errors: dict[str, list[str]]
    # 每个字段可能多个错误
    # 遍历 form.errors.items()，取 field_name, error_list
    for field_name, error_list in form.errors.items():
        # 遍历 error_list，取 err
        for err in error_list:
            # 调用 print()
            print(f"{field_name}: {err}")

    # 单字段取第一个错误
    # 定义变量 username_err，赋值为 form.username.errors[0] if form.username.erro...
    username_err = form.username.errors[0] if form.username.errors else ""
\`\`\`

## 六、在模板里渲染表单

WTForms 字段调用 \`()\` 生成 HTML，省去手写 input。

\`\`\`html filename="用 WTForms 渲染表单"
# <form method="post">
<form method="post">
  # {{ form.hidden_tag() if form.hidden_tag }}  {# CSR
  {{ form.hidden_tag() if form.hidden_tag }}  {# CSRF 等隐藏字段 #}

  # <div>
  <div>
    # {{ form.username.label }}           {# <label>用户名<
    {{ form.username.label }}           {# <label>用户名</label> #}
    # {{ form.username() }}                {# <input typ
    {{ form.username() }}                {# <input type="text" name="username"> #}
    # {% if form.username.errors %}
    {% if form.username.errors %}
      # <span class="err">{{ form.username.errors[0] }}</s
      <span class="err">{{ form.username.errors[0] }}</span>
    # {% endif %}
    {% endif %}
  # </div>
  </div>

  # <div>
  <div>
    # {{ form.email.label }}
    {{ form.email.label }}
    # {{ form.email(placeholder="请输入邮箱") }}  {# 可传 HTML 
    {{ form.email(placeholder="请输入邮箱") }}  {# 可传 HTML 属性 #}
    # {% if form.email.errors %}
    {% if form.email.errors %}
      # <span class="err">{{ form.email.errors[0] }}</span
      <span class="err">{{ form.email.errors[0] }}</span>
    # {% endif %}
    {% endif %}
  # </div>
  </div>

  # <div>
  <div>
    # {{ form.password.label }}
    {{ form.password.label }}
    # {{ form.password() }}
    {{ form.password() }}
    # {% if form.password.errors %}
    {% if form.password.errors %}
      # <span class="err">{{ form.password.errors[0] }}</s
      <span class="err">{{ form.password.errors[0] }}</span>
    # {% endif %}
    {% endif %}
  # </div>
  </div>

  # {{ form.agreed() }} {{ form.agreed.label }}
  {{ form.agreed() }} {{ form.agreed.label }}
  # {{ form.submit() }}
  {{ form.submit() }}
# </form>
</form>
\`\`\`

\`\`\`python filename="自定义字段属性和 CSS class"
# 在字段定义时设默认属性
# 定义变量 username，赋值为 StringField("用户名", validators=[...], render_k...
username = StringField("用户名", validators=[...], render_kw={
    # "class": "form-control",
    "class": "form-control",
    # "placeholder": "3-20 字符",
    "placeholder": "3-20 字符",
    # "maxlength": 20,
    "maxlength": 20,
# })
})

# 渲染时覆盖
# {{ form.username(class_="input-error", placeholder
{{ form.username(class_="input-error", placeholder="再输入") }}
\`\`\`

\`\`\`html filename="用宏统一渲染带错误的字段"
# {# macros.html #}
{# macros.html #}
# {% macro render_field(field) %}
{% macro render_field(field) %}
# <div class="form-group {% if field.errors %}has-er
<div class="form-group {% if field.errors %}has-error{% endif %}">
  # {{ field.label }}
  {{ field.label }}
  # {{ field(class="form-control") }}
  {{ field(class="form-control") }}
  # {% for error in field.errors %}
  {% for error in field.errors %}
    # <span class="err">{{ error }}</span>
    <span class="err">{{ error }}</span>
  # {% endfor %}
  {% endfor %}
# </div>
</div>
# {% endmacro %}
{% endmacro %}

# {# 使用 #}
{# 使用 #}
# {% from "macros.html" import render_field %}
{% from "macros.html" import render_field %}
# <form method="post">
<form method="post">
  # {{ form.hidden_tag() }}
  {{ form.hidden_tag() }}
  # {{ render_field(form.username) }}
  {{ render_field(form.username) }}
  # {{ render_field(form.email) }}
  {{ render_field(form.email) }}
  # {{ render_field(form.password) }}
  {{ render_field(form.password) }}
  # {{ form.submit() }}
  {{ form.submit() }}
# </form>
</form>
\`\`\`

## 七、Flask-WTF 集成

Flask-WTF 在 WTForms 之上加了：自动 CSRF 保护、文件上传字段、表单类基类、错误本地化。

\`\`\`python filename="Flask-WTF 用法"
# 从 flask 导入 Flask, render_template, request, redirect, url_for, flash
from flask import Flask, render_template, request, redirect, url_for, flash
# 从 flask_wtf 导入 FlaskForm
from flask_wtf import FlaskForm
# 从 wtforms 导入 StringField, PasswordField, SubmitField
from wtforms import StringField, PasswordField, SubmitField
# 从 wtforms.validators 导入 DataRequired, Email, Length, EqualTo
from wtforms.validators import DataRequired, Email, Length, EqualTo
# 从 flask_wtf.csrf 导入 CSRFProtect
from flask_wtf.csrf import CSRFProtect

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
app.secret_key = "dev-secret"  # CSRF 需要
csrf = CSRFProtect(app)  # 全局开启 CSRF 保护

# Flask-WTF 表单基类是 FlaskForm（自动带 CSRF）
# 定义类 RegisterForm，继承 FlaskForm
class RegisterForm(FlaskForm):
    # 定义变量 username，赋值为 StringField("用户名", validators=[DataRequired()...
    username = StringField("用户名", validators=[DataRequired(), Length(3, 20)])
    # 定义变量 email，赋值为 StringField("邮箱", validators=[DataRequired(),...
    email = StringField("邮箱", validators=[DataRequired(), Email()])
    # 定义变量 password，赋值为 PasswordField("密码", validators=[DataRequired(...
    password = PasswordField("密码", validators=[DataRequired(), Length(min=8)])
    # 定义变量 confirm，赋值为 PasswordField("确认", validators=[EqualTo("pass...
    confirm = PasswordField("确认", validators=[EqualTo("password")])
    # 定义变量 submit，赋值为 SubmitField("注册")
    submit = SubmitField("注册")

# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 定义变量 form，赋值为 RegisterForm()
    form = RegisterForm()
    # Flask-WTF 自动从 request.form 取数据 + CSRF 校验
    if form.validate_on_submit():  # 等价 request.method==POST and validate()
        # 存库
        # 调用 flash()
        flash("注册成功")
        # 返回 redirect(url_for("index"))
        return redirect(url_for("index"))
    # 返回 render_template("register.html", form=form)
    return render_template("register.html", form=form)
\`\`\`

\`\`\`txt filename="Flask-WTF vs 纯 WTForms"
FlaskForm 基类       自动带 csrf_token 字段
validate_on_submit() 一行判断 POST + 校验 + CSRF
自动从 request 取值  不用手动传 request.form
全局 CSRFProtect     保护所有 POST 表单
文件上传             FileField 处理更顺手
\`\`\`

## 八、SelectField 下拉选择

\`\`\`python filename="SelectField 下拉"
# 从 wtforms 导入 SelectField, SelectMultipleField
from wtforms import SelectField, SelectMultipleField

# 定义类 PostForm，继承 FlaskForm
class PostForm(FlaskForm):
    # 单选下拉
    # 定义变量 category，赋值为 SelectField("分类", choices=[
    category = SelectField("分类", choices=[
        # ("tech", "技术"),
        ("tech", "技术"),
        # ("life", "生活"),
        ("life", "生活"),
        # ("other", "其他"),
        ("other", "其他"),
    ])  # choices 是 (value, label) 列表
    # 多选
    # 定义变量 tags，赋值为 SelectMultipleField("标签", choices=[("py","Pyt...
    tags = SelectMultipleField("标签", choices=[("py","Python"),("web","Web")])
    # 定义变量 submit，赋值为 SubmitField("发布")
    submit = SubmitField("发布")

# 渲染：<select><option value="tech">技术</option>...</select>
\`\`\`

\`\`\`python filename="动态 choices（从数据库来）"
# 装饰器：app.route
@app.route("/post/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # 从数据库查分类，填进 choices
    # form.category.choices = [(c.id, c.name) for c in g
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        cat_id = form.category.data  # 拿到 value
        # ...
        ...
\`\`\`

## 九、自定义校验器

\`\`\`python filename="行内校验方法"
# 从 wtforms.validators 导入 ValidationError
from wtforms.validators import ValidationError

# 定义类 RegisterForm，继承 FlaskForm
class RegisterForm(FlaskForm):
    # 定义变量 username，赋值为 StringField("用户名", validators=[DataRequired()...
    username = StringField("用户名", validators=[DataRequired(), Length(3, 20)])

    # 名字以 validate_ 开头的方法会自动作为该字段校验器
    # 定义函数 validate_username，参数: self, field
    def validate_username(self, field):
        # 条件判断：如果 field.data.lower() in ["admin", "root", "system"]
        if field.data.lower() in ["admin", "root", "system"]:
            # 抛出 ValidationError 异常: "该用户名被保留"
            raise ValidationError("该用户名被保留")
        # 查重
        # 条件判断：如果 user_exists(field.data)
        if user_exists(field.data):
            # 抛出 ValidationError 异常: "用户名已存在"
            raise ValidationError("用户名已存在")

    # 定义函数 validate_email，参数: self, field
    def validate_email(self, field):
        # 跨字段校验可访问 self.field_name.data
        # 条件判断：如果 self.is_banned_email(field.data)
        if self.is_banned_email(field.data):
            # 抛出 ValidationError 异常: "该邮箱被禁"
            raise ValidationError("该邮箱被禁")
\`\`\`

\`\`\`python filename="可复用的校验器函数"
# 从 wtforms.validators 导入 Regexp
from wtforms.validators import Regexp

# 定义函数 phone_required，参数: form, field
def phone_required(form, field):
    # """手机号校验器"""
    """手机号校验器"""
    # 导入 re 模块
    import re
    # 条件判断：如果 not re.match(r"^1[3-9]\d{9}$", field.data)
    if not re.match(r"^1[3-9]\d{9}$", field.data):
        # 抛出 ValidationError 异常: "手机号格式错误"
        raise ValidationError("手机号格式错误")

# 定义类 Form，继承 FlaskForm
class Form(FlaskForm):
    # 定义变量 phone，赋值为 StringField("手机", validators=[DataRequired(),...
    phone = StringField("手机", validators=[DataRequired(), phone_required])
\`\`\`

## 十、完整示例：WTForms 用户注册表单

\`\`\`python filename="完整 WTForms 注册"
# 从 flask 导入 Flask, render_template, redirect, url_for, flash
from flask import Flask, render_template, redirect, url_for, flash
# 从 flask_wtf 导入 FlaskForm, CSRFProtect
from flask_wtf import FlaskForm, CSRFProtect
# 从 wtforms 导入 StringField, PasswordField, BooleanField, SubmitField
from wtforms import StringField, PasswordField, BooleanField, SubmitField
# 从 wtforms.validators 导入 DataRequired, Email, Length, EqualTo, ValidationError
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
# 导入 re 模块
import re

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret-keep-safe"
app.secret_key = "dev-secret-keep-safe"
# 定义变量 csrf，赋值为 CSRFProtect(app)
csrf = CSRFProtect(app)

# 定义类 RegisterForm，继承 FlaskForm
class RegisterForm(FlaskForm):
    # 定义变量 username，赋值为 StringField("用户名", validators=[
    username = StringField("用户名", validators=[
        # 调用 DataRequired()
        DataRequired(message="必填"),
        # 调用 Length()
        Length(min=3, max=20, message="3-20 个字符"),
    # ], render_kw={"placeholder": "3-20 位字母数字下划线"})
    ], render_kw={"placeholder": "3-20 位字母数字下划线"})
    # 定义变量 email，赋值为 StringField("邮箱", validators=[
    email = StringField("邮箱", validators=[
        # 调用 DataRequired()
        DataRequired(), Email(message="邮箱格式错误"),
    # ])
    ])
    # 定义变量 password，赋值为 PasswordField("密码", validators=[
    password = PasswordField("密码", validators=[
        # 调用 DataRequired()
        DataRequired(), Length(min=8, message="至少 8 位"),
    # ])
    ])
    # 定义变量 confirm，赋值为 PasswordField("确认密码", validators=[
    confirm = PasswordField("确认密码", validators=[
        # 调用 DataRequired()
        DataRequired(), EqualTo("password", message="两次密码不一致"),
    # ])
    ])
    # 定义变量 agreed，赋值为 BooleanField("同意服务条款", validators=[DataRequir...
    agreed = BooleanField("同意服务条款", validators=[DataRequired(message="必须同意")])
    # 定义变量 submit，赋值为 SubmitField("注册")
    submit = SubmitField("注册")

    # 定义函数 validate_password，参数: self, field
    def validate_password(self, field):
        # """密码必须含字母和数字"""
        """密码必须含字母和数字"""
        # 条件判断：如果 not (re.search(r"[a-zA-Z]", field.data) and re.search(r"\d", field.data))
        if not (re.search(r"[a-zA-Z]", field.data) and re.search(r"\d", field.data)):
            # 抛出 ValidationError 异常: "密码需同时含字母和数字"
            raise ValidationError("密码需同时含字母和数字")

# 装饰器：app.route
@app.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 定义变量 form，赋值为 RegisterForm()
    form = RegisterForm()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # form.username.data / form.email.data 等已校验
        # 调用 flash()
        flash(f"欢迎 {form.username.data}！注册成功")
        # 返回 redirect(url_for("index"))
        return redirect(url_for("index"))
    # 返回 render_template("register.html", form=form)
    return render_template("register.html", form=form)

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 "首页"
    return "首页"
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 忘 \`app.secret_key\` | CSRF 报错 | Flask-WTF 依赖 secret_key |
| SelectField 忘填 choices | 渲染空 | 渲染前赋值 choices |
| 自定义校验器命名错 | 不生效 | 方法名必须 \`validate_字段名\` |
| \`DataRequired\` 当可空用 | 空字符串报错 | 可空用 \`Optional()\` |
| 文件上传用 StringField | 取不到文件 | 用 \`FileField\` |
| 校验器顺序错 | Optional 后还报必填 | Optional 放最前 |
| 模板忘 \`form.hidden_tag()\` | CSRF 失败 | 表单第一行加 |
| 用 \`form.username\` 不加 \`()\` | 不渲染 | 调用 \`form.username()\` |
| 密码字段当文本渲染 | 明文显示 | 用 \`PasswordField\` |
| FlaskForm vs Form 混用 | 缺 CSRF | Flask 项目用 FlaskForm |

## 十二、小结

WTForms 用声明式表单类封装字段类型和校验器，\`validate_on_submit()\` 一行完成取值、校验、CSRF 检查，\`form.errors\` 自动收集错误。模板里 \`{{ form.field() }}\` 生成 HTML，配合宏统一渲染。Flask-WTF 加了自动 CSRF 和 Flask 集成。自定义校验器用 \`validate_字段名\` 方法扩展。下一章处理表单里最特殊的输入：文件上传。
`
  },

  // =========================================================
  // 第四十三章：文件上传处理
  // =========================================================
  {
    id: "file-upload",
    group: "表单与文件上传",
    icon: "📁",
    title: "文件上传处理",
    content: `

# 文件上传处理

## 一、文件上传原理

普通表单数据是 \`application/x-www-form-urlencoded\`（键值对），上传文件要用 **\`multipart/form-data\`** 编码：把文件拆成多个"部分"传输，每部分带自己的类型和文件名。

\`\`\`html filename="文件上传表单"
# <!-- enctype 必须是 multipart/form-data -->
<!-- enctype 必须是 multipart/form-data -->
# <form action="/upload" method="post" enctype="mult
<form action="/upload" method="post" enctype="multipart/form-data">
  # <input type="file" name="avatar">
  <input type="file" name="avatar">
  # <input type="file" name="photos" multiple>  {# mul
  <input type="file" name="photos" multiple>  {# multiple 多选 #}
  # <button>上传</button>
  <button>上传</button>
# </form>
</form>
\`\`\`

\`\`\`txt filename="multipart 请求体长什么样"
Content-Type: multipart/form-data; boundary=----xyz123

------xyz123
Content-Disposition: form-data; name="avatar"; filename="cat.jpg"
Content-Type: image/jpeg

<二进制数据...>
------xyz123
Content-Disposition: form-data; name="title"

我的标题
------xyz123--
\`\`\`

> **\`enctype="multipart/form-data"\` 是上传的关键**：不写（默认 urlencoded），浏览器只传文件名不传内容。

## 二、Flask 处理文件上传

\`\`\`python filename="Flask 取上传文件"
# 从 flask 导入 Flask, request
from flask import Flask, request

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/upload", methods=["POST"])
# 定义函数 upload，参数: 
def upload():
    # request.files 是所有上传文件的字典
    # 定义变量 file，赋值为 request.files.get("avatar")
    file = request.files.get("avatar")
    # 条件判断：如果 not file
    if not file:
        # 返回 "没传文件", 400
        return "没传文件", 400

    # 文件对象属性
    print(file.filename)       # 客户端原文件名（不可信！）
    print(file.content_type)  # 客户端声明的类型（不可信！）
    print(file.mimetype)       # 同上
    # 读取内容
    data = file.read()         # 一次读完，返回 bytes
    # 或按行读
    # for line in file:
    #     ...

    # 保存到磁盘
    # 调用 file.save()
    file.save("/path/to/save/avatar.jpg")
    # 返回 "上传成功"
    return "上传成功"
\`\`\`

\`\`\`python filename="多文件上传"
# 装饰器：app.route
@app.route("/upload", methods=["POST"])
# 定义函数 upload_multi，参数: 
def upload_multi():
    # 同名 multiple，getlist 拿列表
    # 定义变量 files，赋值为 request.files.getlist("photos")
    files = request.files.getlist("photos")
    # 遍历 files，取 f
    for f in files:
        # 条件判断：如果 f.filename
        if f.filename:
            # 调用 f.save()
            f.save(f"/uploads/{f.filename}")
    # 返回 f"上传了 {len(files)} 个文件"
    return f"上传了 {len(files)} 个文件"
\`\`\`

## 三、Django 处理文件上传

\`\`\`python filename="Django 取上传文件"
# 定义函数 upload，参数: request
def upload(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # request.FILES 拿上传文件
        # 定义变量 file，赋值为 request.FILES.get("avatar")
        file = request.FILES.get("avatar")
        # 条件判断：如果 file
        if file:
            print(file.name)         # 文件名
            print(file.size)         # 字节数
            # 调用 print()
            print(file.content_type)
            # 分块读大文件
            # 遍历 file.chunks()，取 chunk
            for chunk in file.chunks():
                # 调用 process()
                process(chunk)
            # 保存
            # 使用上下文管理器 open(f"/uploads/{file.name}", "wb")，赋值为 f
            with open(f"/uploads/{file.name}", "wb") as f:
                # 遍历 file.chunks()，取 chunk
                for chunk in file.chunks():
                    # 调用 f.write()
                    f.write(chunk)
    # 返回 render(request, "upload.html")
    return render(request, "upload.html")
\`\`\`

## 四、安全文件名：secure_filename

**绝对不能直接用客户端传的文件名存盘**！攻击者可能传 \`../../etc/passwd\` 当文件名，导致**路径穿越**，覆盖系统文件或读到敏感目录。

\`\`\`python filename="路径穿越攻击"
# 危险！
# 调用 file.save()
file.save(f"/uploads/{file.filename}")
# 如果 file.filename = "../../../etc/passwd"
# 实际存到 /etc/passwd，系统被改！

# 安全：用 secure_filename 清洗文件名
# 从 werkzeug.utils 导入 secure_filename
from werkzeug.utils import secure_filename

name = secure_filename("../../../etc/passwd")  # → "etc_passwd"
name = secure_filename("我的 照片.jpg")          # → "我的_照片.jpg"（去空格）
name = secure_filename("hello world.txt")       # → "hello_world.txt"
\`\`\`

\`\`\`python filename="安全的保存"
# 导入 os 模块
import os
# 从 werkzeug.utils 导入 secure_filename
from werkzeug.utils import secure_filename

# 定义变量 UPLOAD_DIR，赋值为 "uploads"
UPLOAD_DIR = "uploads"
# 调用 os.makedirs()
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 装饰器：app.route
@app.route("/upload", methods=["POST"])
# 定义函数 upload，参数: 
def upload():
    # 定义变量 file，赋值为 request.files.get("avatar")
    file = request.files.get("avatar")
    # 条件判断：如果 not file or not file.filename
    if not file or not file.filename:
        # 返回 "没文件", 400
        return "没文件", 400
    # 清洗文件名
    # 定义变量 safe_name，赋值为 secure_filename(file.filename)
    safe_name = secure_filename(file.filename)
    if not safe_name:  # 清洗后可能为空（如纯中文）
        # 定义变量 safe_name，赋值为 "unnamed"
        safe_name = "unnamed"
    # 拼接绝对路径（join 自动防穿越）
    # 定义变量 save_path，赋值为 os.path.join(UPLOAD_DIR, safe_name)
    save_path = os.path.join(UPLOAD_DIR, safe_name)
    # 调用 file.save()
    file.save(save_path)
    # 返回 "保存成功"
    return "保存成功"
\`\`\`

> **\`secure_filename\` 的局限**：它只保留 ASCII 字符，中文文件名会变成下划线。要保留中文，自己加白名单或统一重命名（如用 UUID）。

## 五、文件名策略：重命名避免冲突

\`\`\`python filename="用 UUID 重命名避免冲突"
# 导入 uuid 模块
import uuid
# 导入 os 模块
import os

# 定义函数 save_upload，参数: file, allowed_exts
def save_upload(file, allowed_exts):
    # 1. 校验扩展名
    # 定义变量 ext，赋值为 os.path.splitext(file.filename)[1].lower()
    ext = os.path.splitext(file.filename)[1].lower()
    # 条件判断：如果 ext not in allowed_exts
    if ext not in allowed_exts:
        # 抛出 ValueError 异常: f"不支持的类型: {ext}"
        raise ValueError(f"不支持的类型: {ext}")
    # 2. 用 UUID 生成唯一文件名（防冲突、防猜测）
    # 定义变量 new_name，赋值为 f"{uuid.uuid4().hex}{ext}"
    new_name = f"{uuid.uuid4().hex}{ext}"
    # 3. 分子目录（避免单目录文件过多）
    sub_dir = new_name[:2]  # 取前两位当目录名
    # 定义变量 save_dir，赋值为 os.path.join("uploads", sub_dir)
    save_dir = os.path.join("uploads", sub_dir)
    # 调用 os.makedirs()
    os.makedirs(save_dir, exist_ok=True)
    # 4. 保存
    # 定义变量 save_path，赋值为 os.path.join(save_dir, new_name)
    save_path = os.path.join(save_dir, new_name)
    # 调用 file.save()
    file.save(save_path)
    # 返回 save_path
    return save_path
\`\`\`

\`\`\`txt filename="文件名策略对比"
原文件名      冲突风险高，泄露隐私，路径穿越风险
secure_filename  安全但丢中文
UUID 重命名     推荐生产用，唯一防猜测
哈希命名        内容相同不重复存（去重）
时间戳+随机      可读性中等
\`\`\`

## 六、文件类型校验

客户端声明的 \`content_type\` 不可信（可伪造）。要校验**实际内容**。

\`\`\`python filename="文件类型校验"
import imghdr  # Python 标准库，检测图片真实类型

# 定义字典 ALLOWED_IMAGE_EXT
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# 定义字典 ALLOWED_IMAGE_MIME
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp"}

# 定义函数 validate_image，参数: file
def validate_image(file):
    # 1. 扩展名白名单
    # 导入 os 模块
    import os
    # 定义变量 ext，赋值为 os.path.splitext(file.filename)[1].lower()
    ext = os.path.splitext(file.filename)[1].lower()
    # 条件判断：如果 ext not in ALLOWED_IMAGE_EXT
    if ext not in ALLOWED_IMAGE_EXT:
        # 抛出 ValueError 异常: "扩展名不允许"
        raise ValueError("扩展名不允许")

    # 2. MIME 白名单（可伪造，但能挡住明显错误的）
    # 条件判断：如果 file.content_type not in ALLOWED_IMAGE_MIME
    if file.content_type not in ALLOWED_IMAGE_MIME:
        # 抛出 ValueError 异常: "MIME 不允许"
        raise ValueError("MIME 不允许")

    # 3. 真实类型检测（读头部字节判断）
    # 先读前 32 字节判断
    # 定义变量 head，赋值为 file.read(32)
    head = file.read(32)
    file.seek(0)  # 读完要 seek 回去，不然 save 会少开头
    # 定义变量 real_type，赋值为 imghdr.what(None, h=head)
    real_type = imghdr.what(None, h=head)
    # 条件判断：如果 real_type not in {"jpeg", "png", "gif"}
    if real_type not in {"jpeg", "png", "gif"}:
        # 抛出 ValueError 异常: "不是真正的图片"
        raise ValueError("不是真正的图片")

    # 返回 True
    return True
\`\`\`

\`\`\`python filename="用 python-magic 检测真实类型"
# pip install python-magic
# 导入 magic 模块
import magic

# 定义函数 detect_mime，参数: data_bytes
def detect_mime(data_bytes):
    # 返回 magic.from_buffer(data_bytes, mime=True)
    return magic.from_buffer(data_bytes, mime=True)
# 比 imghdr 更全，能检测所有文件类型
\`\`\`

## 七、文件大小限制

\`\`\`python filename="限制上传大小"
# Flask 配置最大上传大小（字节）
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB
# 超过会抛 413 Request Entity Too Large

# 装饰器：app.errorhandler
@app.errorhandler(413)
# 定义函数 too_large，参数: e
def too_large(e):
    # 返回 "文件太大（最大 16MB）", 413
    return "文件太大（最大 16MB）", 413

# 手动控制读多少
# 定义函数 save_with_limit，参数: file, max_size=16 * 1024 * 1024
def save_with_limit(file, max_size=16 * 1024 * 1024):
    # 定义变量 size，赋值为 0
    size = 0
    # 定义列表 chunks
    chunks = []
    # 当 True 为真时循环
    while True:
        # 定义变量 chunk，赋值为 file.stream.read(8192)
        chunk = file.stream.read(8192)
        # 条件判断：如果 not chunk
        if not chunk:
            # 跳出循环
            break
        # size += len(chunk)
        size += len(chunk)
        # 条件判断：如果 size > max_size
        if size > max_size:
            # 抛出 ValueError 异常: "超过大小限制"
            raise ValueError("超过大小限制")
        # 调用 chunks.append()
        chunks.append(chunk)
    # 返回 b"".join(chunks)
    return b"".join(chunks)
\`\`\`

\`\`\`python filename="Django 限制大小"
# settings.py
DATA_UPLOAD_MAX_MEMORY_SIZE = 16 * 1024 * 1024  # 内存上限
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024   # 超过就写临时文件
\`\`\`

## 八、保存到云存储

生产环境不建议存本地磁盘（不好扩展、没备份、多机不同步）。用云存储（对象存储）。

\`\`\`python filename="上传到 AWS S3"
# pip install boto3
import boto3

s3 = boto3.client("s3",
    aws_access_key_id="xxx",
    aws_secret_access_key="xxx",
    region_name="us-east-1",
)

def upload_to_s3(file_data, key, bucket="my-bucket"):
    s3.put_object(
        Bucket=bucket,
        Key=key,                       # 对象名
        Body=file_data,
        ContentType="image/jpeg",
    )
    return f"https://{bucket}.s3.amazonaws.com/{key}"
\`\`\`

\`\`\`python filename="上传到阿里云 OSS"
# pip install oss2
# 导入 oss2 模块
import oss2

# 定义变量 auth，赋值为 oss2.Auth("access_id", "access_key")
auth = oss2.Auth("access_id", "access_key")
# 定义变量 bucket，赋值为 oss2.Bucket(auth, "oss-cn-hangzhou.aliyuncs.c...
bucket = oss2.Bucket(auth, "oss-cn-hangzhou.aliyuncs.com", "my-bucket")

# 定义函数 upload_to_oss，参数: file_data, key
def upload_to_oss(file_data, key):
    # 调用 bucket.put_object()
    bucket.put_object(key, file_data)
    # 返回 f"https://my-bucket.oss-cn-hangzhou.aliyuncs.com/{key}"
    return f"https://my-bucket.oss-cn-hangzhou.aliyuncs.com/{key}"
\`\`\`

\`\`\`txt filename="本地 vs 云存储"
本地磁盘：开发方便，生产不推荐（扩展难、没 CDN、易丢）
云对象存储：S3/OSS/七牛，海量扩展，自带 CDN，多副本备份
推荐架构：上传到服务器临时区 → 传到云 → 删本地 → 返回云 URL
\`\`\`

## 九、完整示例：图片上传接口

\`\`\`python filename="完整的图片上传"
# 导入 os 模块
import os
# 导入 uuid 模块
import uuid
# 从 flask 导入 Flask, request, jsonify, abort
from flask import Flask, request, jsonify, abort
# 从 werkzeug.utils 导入 secure_filename
from werkzeug.utils import secure_filename
# 导入 imghdr 模块
import imghdr

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB
# app.config["UPLOAD_FOLDER"] = "uploads"
app.config["UPLOAD_FOLDER"] = "uploads"
# app.config["ALLOWED_IMAGE_EXT"] = {".jpg", ".jpeg"
app.config["ALLOWED_IMAGE_EXT"] = {".jpg", ".jpeg", ".png", ".webp"}

# 调用 os.makedirs()
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# 装饰器：app.errorhandler
@app.errorhandler(413)
# 定义函数 too_large，参数: e
def too_large(e):
    # 返回 jsonify({"error": "文件超过 8MB"}), 413
    return jsonify({"error": "文件超过 8MB"}), 413

# 装饰器：app.route
@app.route("/api/avatar", methods=["POST"])
# 定义函数 upload_avatar，参数: 
def upload_avatar():
    # 定义变量 file，赋值为 request.files.get("avatar")
    file = request.files.get("avatar")
    # 条件判断：如果 not file or not file.filename
    if not file or not file.filename:
        # 返回 jsonify({"error": "未选择文件"}), 400
        return jsonify({"error": "未选择文件"}), 400

    # 1. 扩展名校验
    # 定义变量 ext，赋值为 os.path.splitext(file.filename)[1].lower()
    ext = os.path.splitext(file.filename)[1].lower()
    # 条件判断：如果 ext not in app.config["ALLOWED_IMAGE_EXT"]
    if ext not in app.config["ALLOWED_IMAGE_EXT"]:
        # 返回 jsonify({"error": "仅支持 jpg/png/webp"}), 400
        return jsonify({"error": "仅支持 jpg/png/webp"}), 400

    # 2. 真实类型校验
    # 定义变量 head，赋值为 file.read(32)
    head = file.read(32)
    # 调用 file.seek()
    file.seek(0)
    # 条件判断：如果 imghdr.what(None, h=head) not in {"jpeg", "png", "webp"}
    if imghdr.what(None, h=head) not in {"jpeg", "png", "webp"}:
        # 返回 jsonify({"error": "文件不是真实图片"}), 400
        return jsonify({"error": "文件不是真实图片"}), 400

    # 3. 重命名（UUID 防冲突防猜测）
    # 定义变量 new_name，赋值为 f"{uuid.uuid4().hex}{ext}"
    new_name = f"{uuid.uuid4().hex}{ext}"
    # 定义变量 sub，赋值为 new_name[:2]
    sub = new_name[:2]
    # 定义变量 save_dir，赋值为 os.path.join(app.config["UPLOAD_FOLDER"], sub...
    save_dir = os.path.join(app.config["UPLOAD_FOLDER"], sub)
    # 调用 os.makedirs()
    os.makedirs(save_dir, exist_ok=True)
    # 定义变量 save_path，赋值为 os.path.join(save_dir, new_name)
    save_path = os.path.join(save_dir, new_name)

    # 4. 保存
    # 调用 file.save()
    file.save(save_path)

    # 5. 返回访问 URL
    # 定义变量 url，赋值为 f"/static/uploads/{sub}/{new_name}"
    url = f"/static/uploads/{sub}/{new_name}"
    # 返回 jsonify({"url": url, "size": os.path.getsize(save_path)}), 201
    return jsonify({"url": url, "size": os.path.getsize(save_path)}), 201
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 忘 \`enctype="multipart/form-data"\` | 文件没传上去 | 表单加 enctype |
| 直接用原文件名存盘 | 路径穿越 | \`secure_filename\` 或 UUID 重命名 |
| 只信 content_type | 假类型上传 | 校验真实内容（imghdr/magic） |
| 不限大小 | 大文件耗内存 | \`MAX_CONTENT_LENGTH\` |
| 读完不 seek(0) | 保存的文件损坏 | 读后 \`file.seek(0)\` |
| 存 web 根目录外 | 用户能直接访问 | 存非 web 目录或加权限 |
| 同名覆盖 | 文件丢失 | UUID/时间戳重命名 |
| 上传目录可执行 | 上传 .py 被执行 | 配置目录禁止执行 |
| 不校验扩展名 | 上传 .exe .sh | 扩展名白名单 |
| 本地存储不上云 | 扩展难 | 生产用对象存储 |

## 十一、小结

文件上传用 \`multipart/form-data\` 编码，Flask \`request.files\`、Django \`request.FILES\` 取文件。安全核心：\`secure_filename\` 防路径穿越（或 UUID 重命名），扩展名 + 真实内容双重校验类型，\`MAX_CONTENT_LENGTH\` 限大小。生产用云对象存储替代本地磁盘。下一章把表单和上传组合，做完整的内容发布功能。
`
  },

  // =========================================================
  // 第四十四章：表单与上传实战
  // =========================================================
  {
    id: "form-practice",
    group: "表单与文件上传",
    icon: "🛠️",
    title: "表单与上传实战",
    content: `

# 表单与上传实战

## 一、完整表单流程回顾

\`\`\`txt filename="表单处理的标准流程"
1. GET 渲染空表单（带 CSRF token）
2. 用户填写 + 提交（POST）
3. 服务端取数据 → 清洗 → 校验
   ├ 校验失败：回显表单 + 错误信息
   └ 校验通过：存库 / 处理业务
4. PRG 重定向到成功页（防重复提交）
5. flash 消息反馈结果
\`\`\`

本章把前三章的能力组合，做一个真实场景：**文章发布 + 封面图上传**。

## 二、表单复用：新建和编辑共用

新建文章和编辑文章的表单几乎一样，只差"有没有预填数据"。用同一个表单类，按场景传不同初始数据。

\`\`\`python filename="文章表单类"
# 从 flask_wtf 导入 FlaskForm
from flask_wtf import FlaskForm
# 从 wtforms 导入 StringField, TextAreaField, SelectField, FileField, SubmitField
from wtforms import StringField, TextAreaField, SelectField, FileField, SubmitField
# 从 wtforms.validators 导入 DataRequired, Length, Optional
from wtforms.validators import DataRequired, Length, Optional
# 从 flask_wtf.file 导入 FileField, FileAllowed, FileSize
from flask_wtf.file import FileField, FileAllowed, FileSize

# 定义类 PostForm，继承 FlaskForm
class PostForm(FlaskForm):
    # 定义变量 title，赋值为 StringField("标题", validators=[
    title = StringField("标题", validators=[
        # 调用 DataRequired()
        DataRequired(message="标题必填"),
        # 调用 Length()
        Length(max=200, message="标题最长 200 字"),
    # ])
    ])
    # 定义变量 body，赋值为 TextAreaField("正文", validators=[
    body = TextAreaField("正文", validators=[
        # 调用 DataRequired()
        DataRequired(message="正文必填"),
    # ])
    ])
    # 定义变量 category，赋值为 SelectField("分类", validators=[DataRequired()]...
    category = SelectField("分类", validators=[DataRequired()])
    # 定义变量 cover，赋值为 FileField("封面图", validators=[
    cover = FileField("封面图", validators=[
        Optional(),  # 编辑时可不上传新图
        # 调用 FileAllowed()
        FileAllowed(["jpg", "png", "webp"], "仅支持 jpg/png/webp"),
        # 调用 FileSize()
        FileSize(max_size=5 * 1024 * 1024, message="封面图最大 5MB"),
    # ])
    ])
    # 定义变量 submit，赋值为 SubmitField("保存")
    submit = SubmitField("保存")
\`\`\`

\`\`\`python filename="新建和编辑视图复用"
# 装饰器：app.route
@app.route("/posts/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # form.category.choices = [(c.id, c.name) for c in g
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 处理封面上传
        # 定义变量 cover_url，赋值为 None
        cover_url = None
        # 条件判断：如果 form.cover.data
        if form.cover.data:
            # 定义变量 cover_url，赋值为 save_cover(form.cover.data)
            cover_url = save_cover(form.cover.data)
        # 创建文章
        # 定义变量 post，赋值为 create_post(
        post = create_post(
            # 定义变量 title，赋值为 form.title.data,
            title=form.title.data,
            # 定义变量 body，赋值为 form.body.data,
            body=form.body.data,
            # 定义变量 category_id，赋值为 form.category.data,
            category_id=form.category.data,
            # 定义变量 cover_url，赋值为 cover_url,
            cover_url=cover_url,
        # )
        )
        # 调用 flash()
        flash("发布成功")
        # 返回 redirect(url_for("post_detail", pid=post.id))
        return redirect(url_for("post_detail", pid=post.id))
    # 返回 render_template("post_form.html", form=form, is_new=True)
    return render_template("post_form.html", form=form, is_new=True)

# 装饰器：app.route
@app.route("/posts/<int:pid>/edit", methods=["GET", "POST"])
# 定义函数 post_edit，参数: pid
def post_edit(pid):
    post = get_post(pid)  # 从数据库取
    form = PostForm(obj=post)  # ★ obj=post 自动用 post 的字段预填表单
    # form.category.choices = [(c.id, c.name) for c in g
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 更新字段
        # post.title = form.title.data
        post.title = form.title.data
        # post.body = form.body.data
        post.body = form.body.data
        # post.category_id = form.category.data
        post.category_id = form.category.data
        # 封面：仅当上传了新图才替换
        # 条件判断：如果 form.cover.data
        if form.cover.data:
            # post.cover_url = save_cover(form.cover.data)
            post.cover_url = save_cover(form.cover.data)
        # 调用 db.session.commit()
        db.session.commit()
        # 调用 flash()
        flash("修改已保存")
        # 返回 redirect(url_for("post_detail", pid=post.id))
        return redirect(url_for("post_detail", pid=post.id))
    # 返回 render_template("post_form.html", form=form, is_new=False, post=post)
    return render_template("post_form.html", form=form, is_new=False, post=post)
\`\`\`

\`\`\`html filename="post_form.html - 新建/编辑共用"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% from "macros.html" import render_field %}
{% from "macros.html" import render_field %}

# {% block title %}{% if is_new %}新建文章{% else %}编辑文章
{% block title %}{% if is_new %}新建文章{% else %}编辑文章{% endif %}{% endblock %}

# {% block content %}
{% block content %}
# <h1>{% if is_new %}新建文章{% else %}编辑文章{% endif %}</
<h1>{% if is_new %}新建文章{% else %}编辑文章{% endif %}</h1>
# <form method="post" enctype="multipart/form-data">
<form method="post" enctype="multipart/form-data">
  # {{ form.hidden_tag() }}
  {{ form.hidden_tag() }}
  # {{ render_field(form.title) }}
  {{ render_field(form.title) }}
  # {{ render_field(form.category) }}
  {{ render_field(form.category) }}
  # {{ render_field(form.body) }}
  {{ render_field(form.body) }}
  # <div>
  <div>
    # {{ form.cover.label }}
    {{ form.cover.label }}
    # {% if not is_new and post.cover_url %}
    {% if not is_new and post.cover_url %}
      # <p>当前封面：<img src="{{ post.cover_url }}" width="100
      <p>当前封面：<img src="{{ post.cover_url }}" width="100"></p>
    # {% endif %}
    {% endif %}
    # {{ form.cover() }}
    {{ form.cover() }}
    # <small>仅在上传新图时替换</small>
    <small>仅在上传新图时替换</small>
  # </div>
  </div>
  # {{ form.submit() }}
  {{ form.submit() }}
# </form>
</form>
# {% endblock %}
{% endblock %}
\`\`\`

## 三、文件上传 + 表单数据混合

注意表单要同时有 \`enctype="multipart/form-data"\`（传文件）和普通字段。WTForms 会自动从 \`request.form\` 取文本、从 \`request.files\` 取文件。

\`\`\`python filename="混合数据处理"
# 装饰器：app.route
@app.route("/upload", methods=["POST"])
# 定义函数 upload，参数: 
def upload():
    # 普通文本字段
    # 定义变量 title，赋值为 request.form.get("title")
    title = request.form.get("title")
    # 文件
    # 定义变量 file，赋值为 request.files.get("cover")
    file = request.files.get("cover")
    # WTForms 表单：FlaskForm 自动合并两者
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # form.title.data 来自 request.form
    # form.cover.data 来自 request.files
\`\`\`

## 四、表单向导：多步表单

复杂表单（如多步注册、长问卷）拆成多步，每步存进度，最后合并提交。用 session 临时存中间数据。

\`\`\`python filename="多步表单"
# 装饰器：app.route
@app.route("/wizard/step1", methods=["GET", "POST"])
# 定义函数 wizard_step1，参数: 
def wizard_step1():
    # 定义变量 form，赋值为 Step1Form()
    form = Step1Form()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        session["wizard"] = {"step1": form.data}  # 存 session
        # 返回 redirect(url_for("wizard_step2"))
        return redirect(url_for("wizard_step2"))
    # 返回 render_template("step1.html", form=form)
    return render_template("step1.html", form=form)

# 装饰器：app.route
@app.route("/wizard/step2", methods=["GET", "POST"])
# 定义函数 wizard_step2，参数: 
def wizard_step2():
    # 条件判断：如果 "wizard" not in session
    if "wizard" not in session:
        return redirect(url_for("wizard_step1"))  # 没走第一步不让跳
    # 定义变量 form，赋值为 Step2Form()
    form = Step2Form()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # session["wizard"]["step2"] = form.data
        session["wizard"]["step2"] = form.data
        # 返回 redirect(url_for("wizard_step3"))
        return redirect(url_for("wizard_step3"))
    # 返回 render_template("step2.html", form=form)
    return render_template("step2.html", form=form)

# 装饰器：app.route
@app.route("/wizard/step3", methods=["GET", "POST"])
# 定义函数 wizard_step3，参数: 
def wizard_step3():
    # 定义变量 data，赋值为 session.get("wizard")
    data = session.get("wizard")
    # 条件判断：如果 not data or "step2" not in data
    if not data or "step2" not in data:
        # 返回 redirect(url_for("wizard_step1"))
        return redirect(url_for("wizard_step1"))
    # 定义变量 form，赋值为 Step3Form()
    form = Step3Form()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 合并所有步骤
        # 定义字典 full
        full = {**data["step1"], **data["step2"], **form.data}
        # 调用 create_user()
        create_user(full)
        session.pop("wizard")  # 清理
        # 调用 flash()
        flash("注册完成")
        # 返回 redirect(url_for("index"))
        return redirect(url_for("index"))
    # 返回 render_template("step3.html", form=form)
    return render_template("step3.html", form=form)
\`\`\`

## 五、富文本编辑器集成

用户要写带格式的文章（加粗、图片、链接），用富文本编辑器（CKEditor、TinyMCE）。前端集成后，提交的 HTML 存进数据库。

\`\`\`html filename="集成 CKEditor"
# <textarea name="body" id="editor"></textarea>
<textarea name="body" id="editor"></textarea>
# <script src="https://cdn.ckeditor.com/4.16.0/stand
<script src="https://cdn.ckeditor.com/4.16.0/standard/ckeditor.js"></script>
# <script>
<script>
  # 调用 CKEDITOR.replace()
  CKEDITOR.replace("editor");
# </script>
</script>
\`\`\`

\`\`\`python filename="富文本安全：防 XSS"
import bleach  # pip install bleach

# 定义函数 sanitize_html，参数: raw_html
def sanitize_html(raw_html):
    # """清洗富文本 HTML，防 XSS"""
    """清洗富文本 HTML，防 XSS"""
    # 返回 bleach.clean(
    return bleach.clean(
        # raw_html,
        raw_html,
        # 定义字典 tags
        tags={"p", "br", "strong", "em", "u", "a", "ul", "ol", "li",
              # "h1", "h2", "h3", "blockquote", "code", "pre", "im
              "h1", "h2", "h3", "blockquote", "code", "pre", "img"},
        # 定义字典 attributes
        attributes={
            # "a": ["href", "title"],
            "a": ["href", "title"],
            # "img": ["src", "alt", "width", "height"],
            "img": ["src", "alt", "width", "height"],
        # },
        },
        # 定义列表 protocols
        protocols=["http", "https", "mailto"],
    # )
    )

# 存库前清洗
# post.body = sanitize_html(form.body.data)
post.body = sanitize_html(form.body.data)
# 模板里 | safe 显示（因为已经清洗过）
# {{ post.body | safe }}
{{ post.body | safe }}
\`\`\`

\`\`\`txt filename="富文本安全要点"
用户提交的 HTML 必须先用 bleach.clean 过滤
只允许白名单标签和属性
去掉 <script>、onerror、javascript: 等危险内容
过滤后才能 | safe 输出到模板
\`\`\`

## 六、表单和数据库交互

\`\`\`python filename="表单数据存库"
# 从 models 导入 Post, User
from models import Post, User
from extensions import db  # Flask-SQLAlchemy

# 装饰器：app.route
@app.route("/posts/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 定义变量 post，赋值为 Post(
        post = Post(
            # 定义变量 title，赋值为 form.title.data,
            title=form.title.data,
            # 定义变量 body，赋值为 form.body.data,
            body=form.body.data,
            # 定义变量 category_id，赋值为 form.category.data,
            category_id=form.category.data,
            author_id=current_user.id,  # 当前登录用户
        # )
        )
        # 调用 db.session.add()
        db.session.add(post)
        # 调用 db.session.commit()
        db.session.commit()
        # 调用 flash()
        flash("发布成功")
        # 返回 redirect(url_for("post_detail", pid=post.id))
        return redirect(url_for("post_detail", pid=post.id))
    # 返回 render_template("post_form.html", form=form)
    return render_template("post_form.html", form=form)
\`\`\`

\`\`\`python filename="表单校验查重"
# 定义类 PostForm，继承 FlaskForm
class PostForm(FlaskForm):
    # 定义变量 title，赋值为 StringField("标题", validators=[DataRequired(),...
    title = StringField("标题", validators=[DataRequired(), Length(max=200)])
    # ...

    # 定义函数 validate_title，参数: self, field
    def validate_title(self, field):
        # """标题不能重复"""
        """标题不能重复"""
        # 定义变量 existing，赋值为 Post.query.filter_by(title=field.data).first(...
        existing = Post.query.filter_by(title=field.data).first()
        # 条件判断：如果 existing and existing.id != (self.obj_id if hasattr(self, "obj_id") else 0)
        if existing and existing.id != (self.obj_id if hasattr(self, "obj_id") else 0):
            # 抛出 ValidationError 异常: "该标题已存在"
            raise ValidationError("该标题已存在")

# 使用时传入正在编辑的对象 id
# 定义变量 form，赋值为 PostForm(obj=post)
form = PostForm(obj=post)
# form.obj_id = post.id
form.obj_id = post.id
\`\`\`

## 七、错误处理与用户反馈

\`\`\`python filename="统一错误反馈"
# 装饰器：app.route
@app.route("/posts/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 尝试执行，捕获异常
        try:
            # 定义变量 post，赋值为 create_post(form, current_user)
            post = create_post(form, current_user)
            # 调用 flash()
            flash("发布成功", "success")
            # 返回 redirect(url_for("post_detail", pid=post.id))
            return redirect(url_for("post_detail", pid=post.id))
        # 捕获 ValueError 异常，赋值为 e
        except ValueError as e:
            flash(str(e), "error")  # 业务错误
        # 捕获 Exception 异常，赋值为 e
        except Exception as e:
            # 调用 app.logger.exception()
            app.logger.exception("发布失败")
            # 调用 flash()
            flash("系统错误，请重试", "error")
    # 返回 render_template("post_form.html", form=form)
    return render_template("post_form.html", form=form)
\`\`\`

\`\`\`html filename="flash 消息分类显示"
# {% with messages = get_flashed_messages(with_categ
{% with messages = get_flashed_messages(with_categories=true) %}
  # {% for category, msg in messages %}
  {% for category, msg in messages %}
    # <div class="alert alert-{{ category }}">{{ msg }}<
    <div class="alert alert-{{ category }}">{{ msg }}</div>
  # {% endfor %}
  {% endfor %}
# {% endwith %}
{% endwith %}
\`\`\`

## 八、完整示例：文章发布 + 封面图上传

\`\`\`python filename="完整文章发布"
# 导入 os 模块
import os
# 导入 uuid 模块
import uuid
# 从 flask 导入 Flask, render_template, redirect, url_for, flash, current_app
from flask import Flask, render_template, redirect, url_for, flash, current_app
# 从 flask_wtf 导入 FlaskForm
from flask_wtf import FlaskForm
# 从 flask_wtf.file 导入 FileField, FileAllowed, FileSize
from flask_wtf.file import FileField, FileAllowed, FileSize
# 从 wtforms 导入 StringField, TextAreaField, SelectField, SubmitField
from wtforms import StringField, TextAreaField, SelectField, SubmitField
# 从 wtforms.validators 导入 DataRequired, Length
from wtforms.validators import DataRequired, Length
# 从 werkzeug.utils 导入 secure_filename
from werkzeug.utils import secure_filename
# 从 models 导入 db, Post, Category
from models import db, Post, Category

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.config["SECRET_KEY"] = "dev"
app.config["SECRET_KEY"] = "dev"
# app.config["UPLOAD_FOLDER"] = "uploads/covers"
app.config["UPLOAD_FOLDER"] = "uploads/covers"
# app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024
# 调用 os.makedirs()
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
# 调用 db.init_app()
db.init_app(app)

# 定义类 PostForm，继承 FlaskForm
class PostForm(FlaskForm):
    # 定义变量 title，赋值为 StringField("标题", validators=[DataRequired(),...
    title = StringField("标题", validators=[DataRequired(), Length(max=200)])
    # 定义变量 body，赋值为 TextAreaField("正文", validators=[DataRequired(...
    body = TextAreaField("正文", validators=[DataRequired()])
    # 定义变量 category_id，赋值为 SelectField("分类", coerce=int, validators=[Dat...
    category_id = SelectField("分类", coerce=int, validators=[DataRequired()])
    # 定义变量 cover，赋值为 FileField("封面图", validators=[
    cover = FileField("封面图", validators=[
        # 调用 FileAllowed()
        FileAllowed(["jpg", "png", "webp"], "仅支持 jpg/png/webp"),
        # 调用 FileSize()
        FileSize(max_size=5 * 1024 * 1024, message="最大 5MB"),
    # ])
    ])
    # 定义变量 submit，赋值为 SubmitField("发布")
    submit = SubmitField("发布")

# 定义函数 save_cover，参数: file
def save_cover(file):
    # """保存封面图，返回访问 URL"""
    """保存封面图，返回访问 URL"""
    # 定义变量 ext，赋值为 os.path.splitext(file.filename)[1].lower()
    ext = os.path.splitext(file.filename)[1].lower()
    # 定义变量 new_name，赋值为 f"{uuid.uuid4().hex}{ext}"
    new_name = f"{uuid.uuid4().hex}{ext}"
    # 定义变量 save_path，赋值为 os.path.join(current_app.config["UPLOAD_FOLDE...
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], new_name)
    # 调用 file.save()
    file.save(save_path)
    # 返回 f"/static/covers/{new_name}"
    return f"/static/covers/{new_name}"

# 装饰器：app.route
@app.route("/posts/new", methods=["GET", "POST"])
# 定义函数 post_new，参数: 
def post_new():
    # 定义变量 form，赋值为 PostForm()
    form = PostForm()
    # form.category_id.choices = [(c.id, c.name) for c i
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    # 条件判断：如果 form.validate_on_submit()
    if form.validate_on_submit():
        # 定义变量 cover_url，赋值为 save_cover(form.cover.data) if form.cover.dat...
        cover_url = save_cover(form.cover.data) if form.cover.data else None
        # 定义变量 post，赋值为 Post(
        post = Post(
            # 定义变量 title，赋值为 form.title.data,
            title=form.title.data,
            # 定义变量 body，赋值为 form.body.data,
            body=form.body.data,
            # 定义变量 category_id，赋值为 form.category_id.data,
            category_id=form.category_id.data,
            # 定义变量 cover_url，赋值为 cover_url,
            cover_url=cover_url,
            author_id=1,  # 假装当前用户
        # )
        )
        # 调用 db.session.add()
        db.session.add(post)
        # 调用 db.session.commit()
        db.session.commit()
        # 调用 flash()
        flash("发布成功", "success")
        # 返回 redirect(url_for("post_detail", pid=post.id))
        return redirect(url_for("post_detail", pid=post.id))
    # 返回 render_template("post_form.html", form=form, is_new=True)
    return render_template("post_form.html", form=form, is_new=True)
\`\`\`

\`\`\`html filename="templates/post_form.html"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block content %}
{% block content %}
# <h1>新建文章</h1>
<h1>新建文章</h1>
# <form method="post" enctype="multipart/form-data">
<form method="post" enctype="multipart/form-data">
  # {{ form.hidden_tag() }}
  {{ form.hidden_tag() }}
  # <p>{{ form.title.label }} {{ form.title() }}</p>
  <p>{{ form.title.label }} {{ form.title() }}</p>
  # {% if form.title.errors %}<span class="err">{{ for
  {% if form.title.errors %}<span class="err">{{ form.title.errors[0] }}</span>{% endif %}
  # <p>{{ form.category_id.label }} {{ form.category_i
  <p>{{ form.category_id.label }} {{ form.category_id() }}</p>
  # <p>{{ form.body.label }} {{ form.body(rows=15, col
  <p>{{ form.body.label }} {{ form.body(rows=15, cols=60) }}</p>
  # {% if form.body.errors %}<span class="err">{{ form
  {% if form.body.errors %}<span class="err">{{ form.body.errors[0] }}</span>{% endif %}
  # <p>{{ form.cover.label }} {{ form.cover() }}</p>
  <p>{{ form.cover.label }} {{ form.cover() }}</p>
  # {% if form.cover.errors %}<span class="err">{{ for
  {% if form.cover.errors %}<span class="err">{{ form.cover.errors[0] }}</span>{% endif %}
  # <p>{{ form.submit() }}</p>
  <p>{{ form.submit() }}</p>
# </form>
</form>
# {% endblock %}
{% endblock %}
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 编辑忘 \`obj=post\` 预填 | 表单空白 | \`Form(obj=post)\` |
| 文件字段忘 \`enctype\` | 文件没传 | 表单加 \`multipart/form-data\` |
| 富文本不清洗就 \`| safe\` | XSS | \`bleach.clean\` 后才 safe |
| 表单类复用忘校验查重 | 标题重复 | 自定义校验排除自己 |
| 多步表单不校验步骤 | 跳步脏数据 | 每步检查 session 上一步 |
| flash 消息不消费 | 堆积 | 用 \`get_flashed_messages\` |
| 文件覆盖已有封面 | 旧图丢 | 仅上传新图才替换 |
| SelectField coerce 不设 | value 是字符串 | \`coerce=int\` 转整数 |
| 不区分新建/编辑提交接口 | 编辑变新建 | form action 区分 |
| 业务异常不捕获 | 500 错误 | try/except + flash |

## 十、小结

实战层面，表单流程是"渲染→提交→校验→存储→反馈"，PRG 模式防重复。新建和编辑复用一个表单类，用 \`obj=\` 预填。\`enctype="multipart/form-data"\` 让文本和文件混传，WTForms 自动合并。富文本必须 \`bleach.clean\` 后才 \`| safe\`。多步表单用 session 存中间态。至此表单篇闭环，下一章进入 Session 与认证。
`
  },
];
