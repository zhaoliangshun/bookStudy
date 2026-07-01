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
<form action="/register" method="post">
  <input type="text" name="username" placeholder="用户名">
  <input type="password" name="password" placeholder="密码">
  <button type="submit">注册</button>
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
<!-- 提交后地址变成 /search?q=python -->
<form action="/search" method="get">
  <input type="text" name="q">
  <button>搜索</button>
</form>
\`\`\`

\`\`\`html filename="POST 表单：登录"
<!-- 数据在请求体里，地址栏看不到 -->
<form action="/login" method="post">
  <input type="text" name="username">
  <input type="password" name="password">
  <button>登录</button>
</form>
\`\`\`

> **敏感数据必须用 POST**：密码、邮箱、信用卡号用 GET 会暴露在 URL 里，被浏览器历史、代理日志、服务器日志记录。但 POST 不是加密，传输层安全要靠 HTTPS。

## 三、Flask 处理表单

\`\`\`python filename="Flask 取表单数据"
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # request.form 是 POST 表单数据的字典
        username = request.form.get("username")
        password = request.form.get("password")
        # GET 参数用 request.args
        # request.values 是 form + args 的合并
        # 校验...
        return f"注册成功：{username}"
    # GET：渲染表单页面
    return render_template("register.html")
\`\`\`

\`\`\`python filename="Flask 表单字段访问"
# 单值
username = request.form.get("username")   # 没有返回 None
username = request.form["username"]       # 没有会 KeyError

# 多选（checkbox 同名多个值）
tags = request.form.getlist("tags")       # 返回 list

# 所有字段
for key, value in request.form.items():
    print(key, value)
\`\`\`

## 四、Django 处理表单

\`\`\`python filename="Django 取表单数据"
# views.py
from django.shortcuts import render, redirect

def register(request):
    if request.method == "POST":
        # Django 用 request.POST
        username = request.POST.get("username")
        password = request.POST.get("password")
        return redirect("/")
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
@app.route("/register", methods=["GET", "POST"])
def register():
    errors = {}
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        email = request.form.get("email", "").strip()

        # 必填
        if not username:
            errors["username"] = "用户名不能为空"
        elif len(username) < 3 or len(username) > 20:
            errors["username"] = "用户名长度需 3-20"

        # 密码强度
        if len(password) < 8:
            errors["password"] = "密码至少 8 位"
        elif not any(c.isdigit() for c in password):
            errors["password"] = "密码需含数字"

        # 邮箱格式
        if "@" not in email:
            errors["email"] = "邮箱格式错误"

        if not errors:
            # 校验通过，存库
            return "注册成功"

    # 校验失败或 GET，回显表单 + 错误
    return render_template("register.html",
                           form=request.form, errors=errors)
\`\`\`

### 2. 校验后回显

\`\`\`html filename="校验失败回显上次输入"
<form method="post">
  <input type="text" name="username"
         value="{{ form.username if form else '' }}">
  {% if errors.username %}<span class="err">{{ errors.username }}</span>{% endif %}

  <input type="password" name="password">
  {% if errors.password %}<span class="err">{{ errors.password }}</span>{% endif %}
  <button>注册</button>
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
<form method="post">
  <!-- 隐藏字段：随机 token -->
  <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
  <input type="text" name="amount">
  <button>转账</button>
</form>
\`\`\`

\`\`\`python filename="Flask 手动 CSRF"
import secrets

app.secret_key = "dev-secret"

@app.route("/transfer", methods=["GET", "POST"])
def transfer():
    if request.method == "GET":
        # 生成 token 存 session
        token = secrets.token_hex(16)
        session["csrf_token"] = token
        return render_template("transfer.html", csrf_token=token)
    else:
        # 校验 token
        if request.form.get("csrf_token") != session.get("csrf_token"):
            abort(400, "CSRF 校验失败")
        # 处理转账...
\`\`\`

\`\`\`python filename="Flask-WTF 自动 CSRF（推荐）"
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.secret_key = "dev-secret"
csrf = CSRFProtect(app)  # 所有 POST 自动校验 CSRF

# 模板里用 {{ form.csrf_token }} 或 {{ csrf_token() }}
\`\`\`

\`\`\`python filename="Django 自带 CSRF"
# Django 默认开启 CSRF 中间件
# 模板里加 {% csrf_token %} 标签
<form method="post">
  {% csrf_token %}  {# 自动生成隐藏字段 #}
  ...
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
from flask import redirect, url_for, flash

@app.route("/post/new", methods=["GET", "POST"])
def post_new():
    if request.method == "POST":
        # 处理表单
        title = request.form.get("title")
        create_post(title)
        flash("发布成功")  # 闪现消息存 session，下次请求取
        # 关键：重定向到详情页，不是直接返回
        return redirect(url_for("post_detail", pid=new_id))
    # GET：渲染表单
    return render_template("post_new.html")
\`\`\`

## 八、表单数据清洗

校验前先"清洗"（clean）数据：去空格、统一大小写、去非法字符。

\`\`\`python filename="数据清洗"
def clean_username(raw):
    """清洗用户名"""
    if raw is None:
        return ""
    s = raw.strip()            # 去首尾空格
    s = s.lower()              # 统一小写（按需）
    # 去非法字符（只留字母数字下划线）
    import re
    s = re.sub(r"[^a-z0-9_]", "", s)
    return s

def clean_email(raw):
    if raw is None:
        return ""
    return raw.strip().lower()
\`\`\`

> **清洗在校验前**：先 strip 再校验长度，避免"  abc  "因为前后空格被误判超长。

## 九、完整示例：Flask 注册表单

\`\`\`python filename="完整注册流程"
from flask import Flask, render_template, request, redirect, url_for, flash, session
import re

app = Flask(__name__)
app.secret_key = "dev-secret"

def is_strong_password(pwd):
    """密码强度：至少 8 位，含字母和数字"""
    if len(pwd) < 8:
        return False
    return bool(re.search(r"[a-zA-Z]", pwd)) and bool(re.search(r"\d", pwd))

@app.route("/register", methods=["GET", "POST"])
def register():
    errors = {}
    form = {}
    if request.method == "POST":
        # 1. 取数据并清洗
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")
        email = request.form.get("email", "").strip()
        agreed = request.form.get("agreed")
        form = {"username": username, "email": email}  # 回显用（不回显密码）

        # 2. 校验
        if not username:
            errors["username"] = "用户名不能为空"
        elif len(username) < 3:
            errors["username"] = "用户名至少 3 位"
        if not is_strong_password(password):
            errors["password"] = "密码至少 8 位且含字母和数字"
        if password != confirm:
            errors["confirm"] = "两次密码不一致"
        if "@" not in email:
            errors["email"] = "邮箱格式错误"
        if not agreed:
            errors["agreed"] = "必须同意协议"

        # 3. 校验通过：存库（这里假装）
        if not errors:
            # user = create_user(username, password_hash, email)
            flash("注册成功，请登录")
            return redirect(url_for("login"))  # PRG：重定向

    return render_template("register.html", errors=errors, form=form)
\`\`\`

\`\`\`html filename="templates/register.html"
<form method="post">
  <div>
    <label>用户名</label>
    <input type="text" name="username" value="{{ form.username|default('') }}">
    {% if errors.username %}<span class="err">{{ errors.username }}</span>{% endif %}
  </div>
  <div>
    <label>密码</label>
    <input type="password" name="password">
    {% if errors.password %}<span class="err">{{ errors.password }}</span>{% endif %}
  </div>
  <div>
    <label>确认密码</label>
    <input type="password" name="confirm">
    {% if errors.confirm %}<span class="err">{{ errors.confirm }}</span>{% endif %}
  </div>
  <div>
    <label>邮箱</label>
    <input type="email" name="email" value="{{ form.email|default('') }}">
    {% if errors.email %}<span class="err">{{ errors.email }}</span>{% endif %}
  </div>
  <div>
    <label><input type="checkbox" name="agreed" value="1"> 同意协议</label>
    {% if errors.agreed %}<span class="err">{{ errors.agreed }}</span>{% endif %}
  </div>
  <button>注册</button>
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
pip install wtforms

# Flask 集成扩展：加 CSRF、文件上传、表单保护
pip install flask-wtf
\`\`\`

## 三、表单类与字段

\`\`\`python filename="定义 WTForms 表单类"
from wtforms import Form, StringField, IntegerField, PasswordField, TextAreaField, BooleanField
from wtforms.validators import DataRequired, Length, Email, EqualTo, NumberRange

class RegisterForm(Form):
    # 字段类型 + 校验器列表
    username = StringField(
        "用户名",
        validators=[DataRequired(message="必填"), Length(min=3, max=20, message="3-20 字符")],
    )
    email = StringField(
        "邮箱",
        validators=[DataRequired(), Email(message="邮箱格式错误")],
    )
    password = PasswordField(
        "密码",
        validators=[DataRequired(), Length(min=8, message="至少 8 位")],
    )
    confirm = PasswordField(
        "确认密码",
        validators=[EqualTo("password", message="两次密码不一致")],
    )
    age = IntegerField(
        "年龄",
        validators=[NumberRange(min=0, max=150, message="年龄不合法")],
    )
    bio = TextAreaField("个人简介")  # 无校验，可空
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
from flask import Flask, request, render_template
app = Flask(__name__)

@app.route("/register", methods=["GET", "POST"])
def register():
    # 传入请求数据实例化表单
    # Flask-WTF 直接传 request.form；纯 WTForms 传 formdata=request.form
    if request.method == "POST":
        form = RegisterForm(request.form)
        # validate() 触发校验，返回布尔
        if form.validate():
            # form.username.data 是清洗后的值
            username = form.username.data
            email = form.email.data
            # 存库...
            return "注册成功"
        # 校验失败，form.errors 是 {字段名: [错误信息]}
    else:
        form = RegisterForm()  # GET 时空表单
    return render_template("register.html", form=form)
\`\`\`

\`\`\`python filename="纯 WTForms（不依赖 Flask）"
from wtforms import Form
from werkzeug.datastructures import MultiDict

# 从字典实例化（测试用）
form = RegisterForm(formdata=MultiDict({
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123",
    "confirm": "password123",
    "agreed": "y",
}))
if form.validate():
    print("校验通过")
else:
    print(form.errors)
    # 如 {'email': ['邮箱格式错误'], 'password': ['至少 8 位']}
\`\`\`

## 五、errors 错误信息

\`\`\`python filename="访问错误信息"
form = RegisterForm(request.form)
if not form.validate():
    # form.errors: dict[str, list[str]]
    # 每个字段可能多个错误
    for field_name, error_list in form.errors.items():
        for err in error_list:
            print(f"{field_name}: {err}")

    # 单字段取第一个错误
    username_err = form.username.errors[0] if form.username.errors else ""
\`\`\`

## 六、在模板里渲染表单

WTForms 字段调用 \`()\` 生成 HTML，省去手写 input。

\`\`\`html filename="用 WTForms 渲染表单"
<form method="post">
  {{ form.hidden_tag() if form.hidden_tag }}  {# CSRF 等隐藏字段 #}

  <div>
    {{ form.username.label }}           {# <label>用户名</label> #}
    {{ form.username() }}                {# <input type="text" name="username"> #}
    {% if form.username.errors %}
      <span class="err">{{ form.username.errors[0] }}</span>
    {% endif %}
  </div>

  <div>
    {{ form.email.label }}
    {{ form.email(placeholder="请输入邮箱") }}  {# 可传 HTML 属性 #}
    {% if form.email.errors %}
      <span class="err">{{ form.email.errors[0] }}</span>
    {% endif %}
  </div>

  <div>
    {{ form.password.label }}
    {{ form.password() }}
    {% if form.password.errors %}
      <span class="err">{{ form.password.errors[0] }}</span>
    {% endif %}
  </div>

  {{ form.agreed() }} {{ form.agreed.label }}
  {{ form.submit() }}
</form>
\`\`\`

\`\`\`python filename="自定义字段属性和 CSS class"
# 在字段定义时设默认属性
username = StringField("用户名", validators=[...], render_kw={
    "class": "form-control",
    "placeholder": "3-20 字符",
    "maxlength": 20,
})

# 渲染时覆盖
{{ form.username(class_="input-error", placeholder="再输入") }}
\`\`\`

\`\`\`html filename="用宏统一渲染带错误的字段"
{# macros.html #}
{% macro render_field(field) %}
<div class="form-group {% if field.errors %}has-error{% endif %}">
  {{ field.label }}
  {{ field(class="form-control") }}
  {% for error in field.errors %}
    <span class="err">{{ error }}</span>
  {% endfor %}
</div>
{% endmacro %}

{# 使用 #}
{% from "macros.html" import render_field %}
<form method="post">
  {{ form.hidden_tag() }}
  {{ render_field(form.username) }}
  {{ render_field(form.email) }}
  {{ render_field(form.password) }}
  {{ form.submit() }}
</form>
\`\`\`

## 七、Flask-WTF 集成

Flask-WTF 在 WTForms 之上加了：自动 CSRF 保护、文件上传字段、表单类基类、错误本地化。

\`\`\`python filename="Flask-WTF 用法"
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.secret_key = "dev-secret"  # CSRF 需要
csrf = CSRFProtect(app)  # 全局开启 CSRF 保护

# Flask-WTF 表单基类是 FlaskForm（自动带 CSRF）
class RegisterForm(FlaskForm):
    username = StringField("用户名", validators=[DataRequired(), Length(3, 20)])
    email = StringField("邮箱", validators=[DataRequired(), Email()])
    password = PasswordField("密码", validators=[DataRequired(), Length(min=8)])
    confirm = PasswordField("确认", validators=[EqualTo("password")])
    submit = SubmitField("注册")

@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    # Flask-WTF 自动从 request.form 取数据 + CSRF 校验
    if form.validate_on_submit():  # 等价 request.method==POST and validate()
        # 存库
        flash("注册成功")
        return redirect(url_for("index"))
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
from wtforms import SelectField, SelectMultipleField

class PostForm(FlaskForm):
    # 单选下拉
    category = SelectField("分类", choices=[
        ("tech", "技术"),
        ("life", "生活"),
        ("other", "其他"),
    ])  # choices 是 (value, label) 列表
    # 多选
    tags = SelectMultipleField("标签", choices=[("py","Python"),("web","Web")])
    submit = SubmitField("发布")

# 渲染：<select><option value="tech">技术</option>...</select>
\`\`\`

\`\`\`python filename="动态 choices（从数据库来）"
@app.route("/post/new", methods=["GET", "POST"])
def post_new():
    form = PostForm()
    # 从数据库查分类，填进 choices
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    if form.validate_on_submit():
        cat_id = form.category.data  # 拿到 value
        ...
\`\`\`

## 九、自定义校验器

\`\`\`python filename="行内校验方法"
from wtforms.validators import ValidationError

class RegisterForm(FlaskForm):
    username = StringField("用户名", validators=[DataRequired(), Length(3, 20)])

    # 名字以 validate_ 开头的方法会自动作为该字段校验器
    def validate_username(self, field):
        if field.data.lower() in ["admin", "root", "system"]:
            raise ValidationError("该用户名被保留")
        # 查重
        if user_exists(field.data):
            raise ValidationError("用户名已存在")

    def validate_email(self, field):
        # 跨字段校验可访问 self.field_name.data
        if self.is_banned_email(field.data):
            raise ValidationError("该邮箱被禁")
\`\`\`

\`\`\`python filename="可复用的校验器函数"
from wtforms.validators import Regexp

def phone_required(form, field):
    """手机号校验器"""
    import re
    if not re.match(r"^1[3-9]\d{9}$", field.data):
        raise ValidationError("手机号格式错误")

class Form(FlaskForm):
    phone = StringField("手机", validators=[DataRequired(), phone_required])
\`\`\`

## 十、完整示例：WTForms 用户注册表单

\`\`\`python filename="完整 WTForms 注册"
from flask import Flask, render_template, redirect, url_for, flash
from flask_wtf import FlaskForm, CSRFProtect
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
import re

app = Flask(__name__)
app.secret_key = "dev-secret-keep-safe"
csrf = CSRFProtect(app)

class RegisterForm(FlaskForm):
    username = StringField("用户名", validators=[
        DataRequired(message="必填"),
        Length(min=3, max=20, message="3-20 个字符"),
    ], render_kw={"placeholder": "3-20 位字母数字下划线"})
    email = StringField("邮箱", validators=[
        DataRequired(), Email(message="邮箱格式错误"),
    ])
    password = PasswordField("密码", validators=[
        DataRequired(), Length(min=8, message="至少 8 位"),
    ])
    confirm = PasswordField("确认密码", validators=[
        DataRequired(), EqualTo("password", message="两次密码不一致"),
    ])
    agreed = BooleanField("同意服务条款", validators=[DataRequired(message="必须同意")])
    submit = SubmitField("注册")

    def validate_password(self, field):
        """密码必须含字母和数字"""
        if not (re.search(r"[a-zA-Z]", field.data) and re.search(r"\d", field.data)):
            raise ValidationError("密码需同时含字母和数字")

@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        # form.username.data / form.email.data 等已校验
        flash(f"欢迎 {form.username.data}！注册成功")
        return redirect(url_for("index"))
    return render_template("register.html", form=form)

@app.route("/")
def index():
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
<!-- enctype 必须是 multipart/form-data -->
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="avatar">
  <input type="file" name="photos" multiple>  {# multiple 多选 #}
  <button>上传</button>
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
from flask import Flask, request

app = Flask(__name__)

@app.route("/upload", methods=["POST"])
def upload():
    # request.files 是所有上传文件的字典
    file = request.files.get("avatar")
    if not file:
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
    file.save("/path/to/save/avatar.jpg")
    return "上传成功"
\`\`\`

\`\`\`python filename="多文件上传"
@app.route("/upload", methods=["POST"])
def upload_multi():
    # 同名 multiple，getlist 拿列表
    files = request.files.getlist("photos")
    for f in files:
        if f.filename:
            f.save(f"/uploads/{f.filename}")
    return f"上传了 {len(files)} 个文件"
\`\`\`

## 三、Django 处理文件上传

\`\`\`python filename="Django 取上传文件"
def upload(request):
    if request.method == "POST":
        # request.FILES 拿上传文件
        file = request.FILES.get("avatar")
        if file:
            print(file.name)         # 文件名
            print(file.size)         # 字节数
            print(file.content_type)
            # 分块读大文件
            for chunk in file.chunks():
                process(chunk)
            # 保存
            with open(f"/uploads/{file.name}", "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)
    return render(request, "upload.html")
\`\`\`

## 四、安全文件名：secure_filename

**绝对不能直接用客户端传的文件名存盘**！攻击者可能传 \`../../etc/passwd\` 当文件名，导致**路径穿越**，覆盖系统文件或读到敏感目录。

\`\`\`python filename="路径穿越攻击"
# 危险！
file.save(f"/uploads/{file.filename}")
# 如果 file.filename = "../../../etc/passwd"
# 实际存到 /etc/passwd，系统被改！

# 安全：用 secure_filename 清洗文件名
from werkzeug.utils import secure_filename

name = secure_filename("../../../etc/passwd")  # → "etc_passwd"
name = secure_filename("我的 照片.jpg")          # → "我的_照片.jpg"（去空格）
name = secure_filename("hello world.txt")       # → "hello_world.txt"
\`\`\`

\`\`\`python filename="安全的保存"
import os
from werkzeug.utils import secure_filename

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("avatar")
    if not file or not file.filename:
        return "没文件", 400
    # 清洗文件名
    safe_name = secure_filename(file.filename)
    if not safe_name:  # 清洗后可能为空（如纯中文）
        safe_name = "unnamed"
    # 拼接绝对路径（join 自动防穿越）
    save_path = os.path.join(UPLOAD_DIR, safe_name)
    file.save(save_path)
    return "保存成功"
\`\`\`

> **\`secure_filename\` 的局限**：它只保留 ASCII 字符，中文文件名会变成下划线。要保留中文，自己加白名单或统一重命名（如用 UUID）。

## 五、文件名策略：重命名避免冲突

\`\`\`python filename="用 UUID 重命名避免冲突"
import uuid
import os

def save_upload(file, allowed_exts):
    # 1. 校验扩展名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise ValueError(f"不支持的类型: {ext}")
    # 2. 用 UUID 生成唯一文件名（防冲突、防猜测）
    new_name = f"{uuid.uuid4().hex}{ext}"
    # 3. 分子目录（避免单目录文件过多）
    sub_dir = new_name[:2]  # 取前两位当目录名
    save_dir = os.path.join("uploads", sub_dir)
    os.makedirs(save_dir, exist_ok=True)
    # 4. 保存
    save_path = os.path.join(save_dir, new_name)
    file.save(save_path)
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

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp"}

def validate_image(file):
    # 1. 扩展名白名单
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise ValueError("扩展名不允许")

    # 2. MIME 白名单（可伪造，但能挡住明显错误的）
    if file.content_type not in ALLOWED_IMAGE_MIME:
        raise ValueError("MIME 不允许")

    # 3. 真实类型检测（读头部字节判断）
    # 先读前 32 字节判断
    head = file.read(32)
    file.seek(0)  # 读完要 seek 回去，不然 save 会少开头
    real_type = imghdr.what(None, h=head)
    if real_type not in {"jpeg", "png", "gif"}:
        raise ValueError("不是真正的图片")

    return True
\`\`\`

\`\`\`python filename="用 python-magic 检测真实类型"
# pip install python-magic
import magic

def detect_mime(data_bytes):
    return magic.from_buffer(data_bytes, mime=True)
# 比 imghdr 更全，能检测所有文件类型
\`\`\`

## 七、文件大小限制

\`\`\`python filename="限制上传大小"
# Flask 配置最大上传大小（字节）
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB
# 超过会抛 413 Request Entity Too Large

@app.errorhandler(413)
def too_large(e):
    return "文件太大（最大 16MB）", 413

# 手动控制读多少
def save_with_limit(file, max_size=16 * 1024 * 1024):
    size = 0
    chunks = []
    while True:
        chunk = file.stream.read(8192)
        if not chunk:
            break
        size += len(chunk)
        if size > max_size:
            raise ValueError("超过大小限制")
        chunks.append(chunk)
    return b"".join(chunks)
\`\`\`

\`\`python filename="Django 限制大小"
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
import oss2

auth = oss2.Auth("access_id", "access_key")
bucket = oss2.Bucket(auth, "oss-cn-hangzhou.aliyuncs.com", "my-bucket")

def upload_to_oss(file_data, key):
    bucket.put_object(key, file_data)
    return f"https://my-bucket.oss-cn-hangzhou.aliyuncs.com/{key}"
\`\`\`

\`\`\`txt filename="本地 vs 云存储"
本地磁盘：开发方便，生产不推荐（扩展难、没 CDN、易丢）
云对象存储：S3/OSS/七牛，海量扩展，自带 CDN，多副本备份
推荐架构：上传到服务器临时区 → 传到云 → 删本地 → 返回云 URL
\`\`\`

## 九、完整示例：图片上传接口

\`\`\`python filename="完整的图片上传"
import os
import uuid
from flask import Flask, request, jsonify, abort
from werkzeug.utils import secure_filename
import imghdr

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["ALLOWED_IMAGE_EXT"] = {".jpg", ".jpeg", ".png", ".webp"}

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "文件超过 8MB"}), 413

@app.route("/api/avatar", methods=["POST"])
def upload_avatar():
    file = request.files.get("avatar")
    if not file or not file.filename:
        return jsonify({"error": "未选择文件"}), 400

    # 1. 扩展名校验
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in app.config["ALLOWED_IMAGE_EXT"]:
        return jsonify({"error": "仅支持 jpg/png/webp"}), 400

    # 2. 真实类型校验
    head = file.read(32)
    file.seek(0)
    if imghdr.what(None, h=head) not in {"jpeg", "png", "webp"}:
        return jsonify({"error": "文件不是真实图片"}), 400

    # 3. 重命名（UUID 防冲突防猜测）
    new_name = f"{uuid.uuid4().hex}{ext}"
    sub = new_name[:2]
    save_dir = os.path.join(app.config["UPLOAD_FOLDER"], sub)
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, new_name)

    # 4. 保存
    file.save(save_path)

    # 5. 返回访问 URL
    url = f"/static/uploads/{sub}/{new_name}"
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
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, FileField, SubmitField
from wtforms.validators import DataRequired, Length, Optional
from flask_wtf.file import FileField, FileAllowed, FileSize

class PostForm(FlaskForm):
    title = StringField("标题", validators=[
        DataRequired(message="标题必填"),
        Length(max=200, message="标题最长 200 字"),
    ])
    body = TextAreaField("正文", validators=[
        DataRequired(message="正文必填"),
    ])
    category = SelectField("分类", validators=[DataRequired()])
    cover = FileField("封面图", validators=[
        Optional(),  # 编辑时可不上传新图
        FileAllowed(["jpg", "png", "webp"], "仅支持 jpg/png/webp"),
        FileSize(max_size=5 * 1024 * 1024, message="封面图最大 5MB"),
    ])
    submit = SubmitField("保存")
\`\`\`

\`\`\`python filename="新建和编辑视图复用"
@app.route("/posts/new", methods=["GET", "POST"])
def post_new():
    form = PostForm()
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    if form.validate_on_submit():
        # 处理封面上传
        cover_url = None
        if form.cover.data:
            cover_url = save_cover(form.cover.data)
        # 创建文章
        post = create_post(
            title=form.title.data,
            body=form.body.data,
            category_id=form.category.data,
            cover_url=cover_url,
        )
        flash("发布成功")
        return redirect(url_for("post_detail", pid=post.id))
    return render_template("post_form.html", form=form, is_new=True)

@app.route("/posts/<int:pid>/edit", methods=["GET", "POST"])
def post_edit(pid):
    post = get_post(pid)  # 从数据库取
    form = PostForm(obj=post)  # ★ obj=post 自动用 post 的字段预填表单
    form.category.choices = [(c.id, c.name) for c in get_categories()]
    if form.validate_on_submit():
        # 更新字段
        post.title = form.title.data
        post.body = form.body.data
        post.category_id = form.category.data
        # 封面：仅当上传了新图才替换
        if form.cover.data:
            post.cover_url = save_cover(form.cover.data)
        db.session.commit()
        flash("修改已保存")
        return redirect(url_for("post_detail", pid=post.id))
    return render_template("post_form.html", form=form, is_new=False, post=post)
\`\`\`

\`\`\`html filename="post_form.html - 新建/编辑共用"
{% extends "base.html" %}
{% from "macros.html" import render_field %}

{% block title %}{% if is_new %}新建文章{% else %}编辑文章{% endif %}{% endblock %}

{% block content %}
<h1>{% if is_new %}新建文章{% else %}编辑文章{% endif %}</h1>
<form method="post" enctype="multipart/form-data">
  {{ form.hidden_tag() }}
  {{ render_field(form.title) }}
  {{ render_field(form.category) }}
  {{ render_field(form.body) }}
  <div>
    {{ form.cover.label }}
    {% if not is_new and post.cover_url %}
      <p>当前封面：<img src="{{ post.cover_url }}" width="100"></p>
    {% endif %}
    {{ form.cover() }}
    <small>仅在上传新图时替换</small>
  </div>
  {{ form.submit() }}
</form>
{% endblock %}
\`\`\`

## 三、文件上传 + 表单数据混合

注意表单要同时有 \`enctype="multipart/form-data"\`（传文件）和普通字段。WTForms 会自动从 \`request.form\` 取文本、从 \`request.files\` 取文件。

\`\`\`python filename="混合数据处理"
@app.route("/upload", methods=["POST"])
def upload():
    # 普通文本字段
    title = request.form.get("title")
    # 文件
    file = request.files.get("cover")
    # WTForms 表单：FlaskForm 自动合并两者
    form = PostForm()
    # form.title.data 来自 request.form
    # form.cover.data 来自 request.files
\`\`\`

## 四、表单向导：多步表单

复杂表单（如多步注册、长问卷）拆成多步，每步存进度，最后合并提交。用 session 临时存中间数据。

\`\`\`python filename="多步表单"
@app.route("/wizard/step1", methods=["GET", "POST"])
def wizard_step1():
    form = Step1Form()
    if form.validate_on_submit():
        session["wizard"] = {"step1": form.data}  # 存 session
        return redirect(url_for("wizard_step2"))
    return render_template("step1.html", form=form)

@app.route("/wizard/step2", methods=["GET", "POST"])
def wizard_step2():
    if "wizard" not in session:
        return redirect(url_for("wizard_step1"))  # 没走第一步不让跳
    form = Step2Form()
    if form.validate_on_submit():
        session["wizard"]["step2"] = form.data
        return redirect(url_for("wizard_step3"))
    return render_template("step2.html", form=form)

@app.route("/wizard/step3", methods=["GET", "POST"])
def wizard_step3():
    data = session.get("wizard")
    if not data or "step2" not in data:
        return redirect(url_for("wizard_step1"))
    form = Step3Form()
    if form.validate_on_submit():
        # 合并所有步骤
        full = {**data["step1"], **data["step2"], **form.data}
        create_user(full)
        session.pop("wizard")  # 清理
        flash("注册完成")
        return redirect(url_for("index"))
    return render_template("step3.html", form=form)
\`\`\`

## 五、富文本编辑器集成

用户要写带格式的文章（加粗、图片、链接），用富文本编辑器（CKEditor、TinyMCE）。前端集成后，提交的 HTML 存进数据库。

\`\`\`html filename="集成 CKEditor"
<textarea name="body" id="editor"></textarea>
<script src="https://cdn.ckeditor.com/4.16.0/standard/ckeditor.js"></script>
<script>
  CKEDITOR.replace("editor");
</script>
\`\`\`

\`\`\`python filename="富文本安全：防 XSS"
import bleach  # pip install bleach

def sanitize_html(raw_html):
    """清洗富文本 HTML，防 XSS"""
    return bleach.clean(
        raw_html,
        tags={"p", "br", "strong", "em", "u", "a", "ul", "ol", "li",
              "h1", "h2", "h3", "blockquote", "code", "pre", "img"},
        attributes={
            "a": ["href", "title"],
            "img": ["src", "alt", "width", "height"],
        },
        protocols=["http", "https", "mailto"],
    )

# 存库前清洗
post.body = sanitize_html(form.body.data)
# 模板里 | safe 显示（因为已经清洗过）
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
from models import Post, User
from extensions import db  # Flask-SQLAlchemy

@app.route("/posts/new", methods=["GET", "POST"])
def post_new():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(
            title=form.title.data,
            body=form.body.data,
            category_id=form.category.data,
            author_id=current_user.id,  # 当前登录用户
        )
        db.session.add(post)
        db.session.commit()
        flash("发布成功")
        return redirect(url_for("post_detail", pid=post.id))
    return render_template("post_form.html", form=form)
\`\`\`

\`\`\`python filename="表单校验查重"
class PostForm(FlaskForm):
    title = StringField("标题", validators=[DataRequired(), Length(max=200)])
    # ...

    def validate_title(self, field):
        """标题不能重复"""
        existing = Post.query.filter_by(title=field.data).first()
        if existing and existing.id != (self.obj_id if hasattr(self, "obj_id") else 0):
            raise ValidationError("该标题已存在")

# 使用时传入正在编辑的对象 id
form = PostForm(obj=post)
form.obj_id = post.id
\`\`\`

## 七、错误处理与用户反馈

\`\`\`python filename="统一错误反馈"
@app.route("/posts/new", methods=["GET", "POST"])
def post_new():
    form = PostForm()
    if form.validate_on_submit():
        try:
            post = create_post(form, current_user)
            flash("发布成功", "success")
            return redirect(url_for("post_detail", pid=post.id))
        except ValueError as e:
            flash(str(e), "error")  # 业务错误
        except Exception as e:
            app.logger.exception("发布失败")
            flash("系统错误，请重试", "error")
    return render_template("post_form.html", form=form)
\`\`\`

\`\`\`html filename="flash 消息分类显示"
{% with messages = get_flashed_messages(with_categories=true) %}
  {% for category, msg in messages %}
    <div class="alert alert-{{ category }}">{{ msg }}</div>
  {% endfor %}
{% endwith %}
\`\`\`

## 八、完整示例：文章发布 + 封面图上传

\`\`\`python filename="完整文章发布"
import os
import uuid
from flask import Flask, render_template, redirect, url_for, flash, current_app
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileSize
from wtforms import StringField, TextAreaField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length
from werkzeug.utils import secure_filename
from models import db, Post, Category

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev"
app.config["UPLOAD_FOLDER"] = "uploads/covers"
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
db.init_app(app)

class PostForm(FlaskForm):
    title = StringField("标题", validators=[DataRequired(), Length(max=200)])
    body = TextAreaField("正文", validators=[DataRequired()])
    category_id = SelectField("分类", coerce=int, validators=[DataRequired()])
    cover = FileField("封面图", validators=[
        FileAllowed(["jpg", "png", "webp"], "仅支持 jpg/png/webp"),
        FileSize(max_size=5 * 1024 * 1024, message="最大 5MB"),
    ])
    submit = SubmitField("发布")

def save_cover(file):
    """保存封面图，返回访问 URL"""
    ext = os.path.splitext(file.filename)[1].lower()
    new_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], new_name)
    file.save(save_path)
    return f"/static/covers/{new_name}"

@app.route("/posts/new", methods=["GET", "POST"])
def post_new():
    form = PostForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    if form.validate_on_submit():
        cover_url = save_cover(form.cover.data) if form.cover.data else None
        post = Post(
            title=form.title.data,
            body=form.body.data,
            category_id=form.category_id.data,
            cover_url=cover_url,
            author_id=1,  # 假装当前用户
        )
        db.session.add(post)
        db.session.commit()
        flash("发布成功", "success")
        return redirect(url_for("post_detail", pid=post.id))
    return render_template("post_form.html", form=form, is_new=True)
\`\`\`

\`\`\`html filename="templates/post_form.html"
{% extends "base.html" %}
{% block content %}
<h1>新建文章</h1>
<form method="post" enctype="multipart/form-data">
  {{ form.hidden_tag() }}
  <p>{{ form.title.label }} {{ form.title() }}</p>
  {% if form.title.errors %}<span class="err">{{ form.title.errors[0] }}</span>{% endif %}
  <p>{{ form.category_id.label }} {{ form.category_id() }}</p>
  <p>{{ form.body.label }} {{ form.body(rows=15, cols=60) }}</p>
  {% if form.body.errors %}<span class="err">{{ form.body.errors[0] }}</span>{% endif %}
  <p>{{ form.cover.label }} {{ form.cover() }}</p>
  {% if form.cover.errors %}<span class="err">{{ form.cover.errors[0] }}</span>{% endif %}
  <p>{{ form.submit() }}</p>
</form>
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
