// =============================================================
// Python Web 应用开发实战教程 - 第 8 批章节(Django 认证 4 章)
// -------------------------------------------------------------
// 本批包含 4 章:
//   django-auth        : Django 认证系统
//   django-user-model  : 自定义用户模型
//   django-permission  : Django 权限与分组
//   django-session     : Django Session 管理
//
// 教程定位:纯阅读型,代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」,认证方案会变,安全思想长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 29 章:Django 认证系统
  // ============================================================
  {
    id: "django-auth",
    group: "Django 认证",
    icon: "🔑",
    title: "Django 认证系统",
    content: `# Django 认证系统

## Django auth 是什么

Django 内置一套完整的用户认证系统(\`django.contrib.auth\`),开箱即用,涵盖:

- **用户模型**(User):存用户名、密码、邮箱。
- **认证**(authenticate):校验用户名密码。
- **登录/登出**(login/logout):管理 Session。
- **权限**(Permission):细粒度授权。
- **分组**(Group):批量授权。
- **密码哈希**(Password Hasher):安全存储密码。

这套系统是 Django「全家桶」的精华之一。别的框架要自己拼 Flask-Login + Werkzeug + itsdangerous,Django 一句 \`from django.contrib.auth import authenticate, login\` 搞定。

## User 模型

Django 自带的 \`User\` 模型(\`django.contrib.auth.models.User\`)字段:

\`\`\`python
# 从 django.contrib.auth.models 导入 User
from django.contrib.auth.models import User

# 定义变量 user，赋值为 User.objects.get(username="admin")
user = User.objects.get(username="admin")
user.username        # 用户名(唯一)
user.password        # 哈希后的密码(不是明文!)
user.email          # 邮箱
user.first_name     # 名
user.last_name     # 姓
user.is_active      # 是否启用(禁用账户设 False)
user.is_staff       # 是否能登录 Admin
user.is_superuser   # 是否超级用户(拥有所有权限)
user.last_login     # 上次登录时间
user.date_joined    # 注册时间
\`\`\`

三个布尔标志的区别:

- \`is_active\`:账户是否激活。False 表示「冻结账户」,用户不能登录但数据保留。
- \`is_staff\`:能否登录 Django Admin 后台。
- \`is_superuser\`:是否拥有所有权限(绕过权限检查)。

\`password\` 字段存的是**哈希值**不是明文,格式像 \`pbkdf2_sha256$260000$abc...$xyz...\`,包含算法、迭代次数、盐、哈希。

## authenticate():校验用户名密码

\`authenticate\` 函数校验「用户名密码是否正确」,返回 User 对象或 None:

\`\`\`python
# 从 django.contrib.auth 导入 authenticate
from django.contrib.auth import authenticate

# 校验用户名密码
# 定义变量 user，赋值为 authenticate(request, username="admin", passw...
user = authenticate(request, username="admin", password="secret123")
# 条件判断：如果 user is not None
if user is not None:
    # 校验通过(密码正确 且 账户 active)
    # 调用 print()
    print("OK", user)
# 否则执行
else:
    # 用户名不存在 或 密码错 或 账户被禁用
    # 调用 print()
    print("失败")
\`\`\`

注意:

- \`authenticate\` 只校验,不会登录(不创建 Session)。
- 返回 None 可能是「密码错」或「账户被禁用」(不区分,防枚举攻击)。
- \`request\` 参数可选,但建议传(自定义认证后端可能需要)。

## login():登录(创建 Session)

\`authenticate\` 通过后,调 \`login\` 把用户「写入 Session」:

\`\`\`python
# 从 django.contrib.auth 导入 authenticate, login
from django.contrib.auth import authenticate, login
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect

# 定义函数 login_view，参数: request
def login_view(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 username，赋值为 request.POST.get("username")
        username = request.POST.get("username")
        # 定义变量 password，赋值为 request.POST.get("password")
        password = request.POST.get("password")
        # 定义变量 user，赋值为 authenticate(request, username=username, pass...
        user = authenticate(request, username=username, password=password)
        # 条件判断：如果 user is not None
        if user is not None:
            # 登录:把 user.id 写入 session
            # 调用 login()
            login(request, user)
            # 跳到 ?next= 指定的页面,或首页
            # 定义变量 next_url，赋值为 request.GET.get("next", "/")
            next_url = request.GET.get("next", "/")
            # 返回 redirect(next_url)
            return redirect(next_url)
        # 否则执行
        else:
            # 登录失败
            # 返回 render(request, "login.html", {"error": "用户名或密码错误"})
            return render(request, "login.html", {"error": "用户名或密码错误"})
    # 返回 render(request, "login.html")
    return render(request, "login.html")
\`\`\`

\`login(request, user)\` 做了:

1. 把 \`user.id\` 写入 \`request.session\`。
2. 重置 Session 防止 Session 固定攻击(每次登录换新 session key)。
3. 设置 \`request.user\` 为该用户(后续视图能用)。

## logout():登出(清空 Session)

\`\`\`python
# 从 django.contrib.auth 导入 logout
from django.contrib.auth import logout
# 从 django.shortcuts 导入 redirect
from django.shortcuts import redirect

# 定义函数 logout_view，参数: request
def logout_view(request):
    logout(request)  # 清空 session,把 user 设为 AnonymousUser
    # 返回 redirect("/")
    return redirect("/")
\`\`\`

\`logout\` 清空 Session 数据,把 \`request.user\` 设为 \`AnonymousUser\`。

## is_authenticated:判断是否登录

\`\`\`python
# 视图里
# 条件判断：如果 request.user.is_authenticated
if request.user.is_authenticated:
    # 已登录
    # 调用 print()
    print("当前用户:", request.user.username)
# 否则执行
else:
    # 未登录(AnonymousUser)
    # 调用 print()
    print("匿名用户")
\`\`\`

\`is_authenticated\` 是属性(\`@property\`),返回布尔。\`AnonymousUser\` 和 \`User\` 都有这个属性,前者恒为 False,后者恒为 True。所以统一用 \`request.user.is_authenticated\` 判断,不用区分类型。

⚠️ 常见错误:写成 \`request.user.is_authenticated()\`(带括号)。Django 1.10 后是属性不是方法,加括号会报错。

## request.user:当前用户

\`AuthenticationMiddleware\` 把当前登录用户注入 \`request.user\`:

- 已登录 → \`User\` 对象(有 \`username\`、\`email\` 等)。
- 未登录 → \`AnonymousUser\` 对象(只有 \`id=None\`、\`is_authenticated=False\`)。

\`\`\`python
# 定义函数 profile，参数: request
def profile(request):
    # 条件判断：如果 not request.user.is_authenticated
    if not request.user.is_authenticated:
        # 返回 redirect("login")
        return redirect("login")

    # 已登录,可以直接用
    # 定义变量 username，赋值为 request.user.username
    username = request.user.username
    # 定义变量 email，赋值为 request.user.email
    email = request.user.email
    # 定义变量 is_staff，赋值为 request.user.is_staff
    is_staff = request.user.is_staff
    # 返回 render(request, "profile.html", {"user": request.user})
    return render(request, "profile.html", {"user": request.user})
\`\`\`

模板里 \`{{ user }}\` 由上下文处理器自动注入,不用视图传:

\`\`\`html
# {% if user.is_authenticated %}
{% if user.is_authenticated %}
    # <p>欢迎,{{ user.username }}</p>
    <p>欢迎,{{ user.username }}</p>
    # <a href="{% url 'logout' %}">退出</a>
    <a href="{% url 'logout' %}">退出</a>
# {% else %}
{% else %}
    # <a href="{% url 'login' %}">登录</a>
    <a href="{% url 'login' %}">登录</a>
# {% endif %}
{% endif %}
\`\`\`

## @login_required

最常用的权限装饰器,未登录跳转到 \`LOGIN_URL\`:

\`\`\`python
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required

# 装饰器：login_required
@login_required
# 定义函数 dashboard，参数: request
def dashboard(request):
    # 未登录用户访问会跳到 /accounts/login/?next=/dashboard/
    # 返回 render(request, "dashboard.html")
    return render(request, "dashboard.html")
\`\`\`

类视图用 \`LoginRequiredMixin\`:

\`\`\`python
# 从 django.contrib.auth.mixins 导入 LoginRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin

# 定义类 DashboardView，继承 LoginRequiredMixin, View
class DashboardView(LoginRequiredMixin, View):
    # 未登录跳登录页
    # ...
    ...
\`\`\`

## Password Hasher:密码哈希

Django **绝不存明文密码**。用户注册时,密码经过「哈希算法」处理后存入数据库。哈希是单向的(不能从哈希反推密码),所以即使数据库泄露,攻击者也拿不到明文密码。

Django 默认用 \`PBKDF2\`(Python 自带,无需额外依赖),也可切换更强算法:

\`\`\`python
# settings.py
# 定义列表 PASSWORD_HASHERS
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",  # 首选 Argon2(需 pip install argon2-cffi)
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",  # 备选 bcrypt(需 pip install bcrypt)
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",  # Django 默认
    # "django.contrib.auth.hashers.PBKDF2SHA1PasswordHas
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
# ]
]
\`\`\`

Django 按列表顺序选第一个可用的算法。换算法时,旧密码在下次登录时自动「升级」为新算法。

创建用户用 \`create_user\`(自动哈希密码):

\`\`\`python
# 从 django.contrib.auth.models 导入 User
from django.contrib.auth.models import User

# 创建用户(密码自动哈希)
# 定义变量 user，赋值为 User.objects.create_user(
user = User.objects.create_user(
    # 定义变量 username，赋值为 "alice",
    username="alice",
    # 定义变量 email，赋值为 "alice@example.com",
    email="alice@example.com",
    # 定义变量 password，赋值为 "secret123",
    password="secret123",
# )
)

# ⚠️ 绝不能用 create,密码不会哈希!
# user = User.objects.create(username="bob", password="plain")  # ❌ 危险

# 改密码:用 set_password
# 调用 user.set_password()
user.set_password("newpass456")
# 调用 user.save()
user.save()
\`\`\`

\`create_user\` 和 \`set_password\` 内部调 hasher 做哈希。直接 \`create(password=...)\` 存的是明文,登录不了(因为 authenticate 哈希后比对不上)。

## check_password:手动校验密码

\`\`\`python
# 从 django.contrib.auth.hashers 导入 check_password
from django.contrib.auth.hashers import check_password

# 校验明文密码是否匹配哈希(用于改密码时验证旧密码)
# 条件判断：如果 check_password("oldpass", user.password)
if check_password("oldpass", user.password):
    # 调用 print()
    print("旧密码正确")
\`\`\`

\`make_password\` 哈希明文:

\`\`\`python
# 从 django.contrib.auth.hashers 导入 make_password
from django.contrib.auth.hashers import make_password

hashed = make_password("mypassword")  # 返回哈希字符串
\`\`\`

## 完整示例:登录登出视图

\`\`\`python
# accounts/views.py
# 从 django.contrib.auth 导入 authenticate, login, logout
from django.contrib.auth import authenticate, login, logout
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect
# 从 django.views.decorators.http 导入 require_GET
from django.views.decorators.http import require_GET

# 定义函数 login_view，参数: request
def login_view(request):
    # """登录"""
    """登录"""
    # 条件判断：如果 request.user.is_authenticated
    if request.user.is_authenticated:
        return redirect("/")  # 已登录别再来

    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 username，赋值为 request.POST.get("username", "").strip()
        username = request.POST.get("username", "").strip()
        # 定义变量 password，赋值为 request.POST.get("password", "")
        password = request.POST.get("password", "")

        # 定义变量 user，赋值为 authenticate(request, username=username, pass...
        user = authenticate(request, username=username, password=password)
        # 条件判断：如果 user is not None
        if user is not None:
            # 调用 login()
            login(request, user)
            # 登录成功,跳到 next 或首页
            # 定义变量 next_url，赋值为 request.GET.get("next") or request.POST.get("...
            next_url = request.GET.get("next") or request.POST.get("next") or "/"
            # 返回 redirect(next_url)
            return redirect(next_url)
        # 否则执行
        else:
            # 返回 render(request, "registration/login.html", {
            return render(request, "registration/login.html", {
                # "error": "用户名或密码错误",
                "error": "用户名或密码错误",
                # "username": username,
                "username": username,
            # })
            })
    # 返回 render(request, "registration/login.html")
    return render(request, "registration/login.html")

# 装饰器：require_GET
@require_GET
# 定义函数 logout_view，参数: request
def logout_view(request):
    # """登出(GET 触发,带 next 跳转)"""
    """登出(GET 触发,带 next 跳转)"""
    # 调用 logout()
    logout(request)
    # 返回 redirect("/")
    return redirect("/")

# 装饰器：login_required
@login_required
# 定义函数 change_password_view，参数: request
def change_password_view(request):
    # """修改密码:验证旧密码后设新密码"""
    """修改密码:验证旧密码后设新密码"""
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 old_password，赋值为 request.POST.get("old_password")
        old_password = request.POST.get("old_password")
        # 定义变量 new_password，赋值为 request.POST.get("new_password")
        new_password = request.POST.get("new_password")
        # 定义变量 confirm，赋值为 request.POST.get("confirm_password")
        confirm = request.POST.get("confirm_password")

        # 1. 校验旧密码
        # 条件判断：如果 not request.user.check_password(old_password)
        if not request.user.check_password(old_password):
            # 返回 render(request, "registration/change_password.html", {
            return render(request, "registration/change_password.html", {
                # "error": "旧密码错误",
                "error": "旧密码错误",
            # })
            })
        # 2. 校验新密码一致
        # 条件判断：如果 new_password != confirm
        if new_password != confirm:
            # 返回 render(request, "registration/change_password.html", {
            return render(request, "registration/change_password.html", {
                # "error": "两次新密码不一致",
                "error": "两次新密码不一致",
            # })
            })
        # 3. 设置新密码
        # 调用 request.user.set_password()
        request.user.set_password(new_password)
        # 调用 request.user.save()
        request.user.save()
        # 改密码后 session 失效,需要重新登录
        # 从 django.contrib.auth 导入 update_session_auth_hash
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, request.user)  # 保持登录
        # 返回 redirect("profile")
        return redirect("profile")
    # 返回 render(request, "registration/change_password.html")
    return render(request, "registration/change_password.html")
\`\`\`

\`\`\`python
# accounts/urls.py
# 从 django.urls 导入 path
from django.urls import path
# 从 django.contrib.auth 导入 views as auth_views
from django.contrib.auth import views as auth_views
# 从 . 导入 views
from . import views

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("login/", views.login_view, name="login"),
    # 调用 path()
    path("logout/", views.logout_view, name="logout"),
    # 调用 path()
    path("change-password/", views.change_password_view, name="change_password"),
    # 用 Django 内置的密码重置/找回视图
    # 调用 path()
    path("password-reset/", auth_views.PasswordResetView.as_view(), name="password_reset"),
    # 调用 path()
    path("password-reset/done/", auth_views.PasswordResetDoneView.as_view(), name="password_reset_done"),
    # 调用 path()
    path("reset/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    # 调用 path()
    path("reset/done/", auth_views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),
# ]
]
\`\`\`

\`\`\`html
# <!-- templates/registration/login.html -->
<!-- templates/registration/login.html -->
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block title %}登录{% endblock %}
{% block title %}登录{% endblock %}

# {% block content %}
{% block content %}
# <h1>登录</h1>
<h1>登录</h1>

# {% if error %}
{% if error %}
    # <div class="alert alert-danger">{{ error }}</div>
    <div class="alert alert-danger">{{ error }}</div>
# {% endif %}
{% endif %}

# <form method="post">
<form method="post">
    # {% csrf_token %}
    {% csrf_token %}
    # <input type="hidden" name="next" value="{{ request
    <input type="hidden" name="next" value="{{ request.GET.next }}">

    # <div class="form-group">
    <div class="form-group">
        # <label>用户名</label>
        <label>用户名</label>
        # <input type="text" name="username" value="{{ usern
        <input type="text" name="username" value="{{ username }}" required autofocus>
    # </div>
    </div>

    # <div class="form-group">
    <div class="form-group">
        # <label>密码</label>
        <label>密码</label>
        # <input type="password" name="password" required>
        <input type="password" name="password" required>
    # </div>
    </div>

    # <button type="submit">登录</button>
    <button type="submit">登录</button>
    # <a href="{% url 'password_reset' %}">忘记密码?</a>
    <a href="{% url 'password_reset' %}">忘记密码?</a>
# </form>
</form>
# {% endblock %}
{% endblock %}
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| is_authenticated 加括号 | 老写法 | 是属性不是方法,去掉 () |
| 用 create 建用户 | 密码没哈希 | 用 create_user |
| 改密码后 session 失效 | set_password 改了密码 | update_session_auth_hash |
| authenticate 不传 request | 警告 | Django 2.x+ 建议传 |
| login 前没 authenticate | 直接 login 任意 user | 必须 authenticate 校验 |
| 登录失败区分原因 | 防枚举 | 统一返回「用户名或密码错误」 |
| 密码明文存库 | 重大漏洞 | 永远 set_password 哈希 |
| logout 没 GET | CSRF 风险 | 用 POST 或 @require_GET |
| 模板 {{ user }} 取不到 | 漏 context_processor | 检查 settings TEMPLATES |
| 自己实现登录绕过 auth | 重复造轮子 | 用 Django 内置 |

## 设计思想

Django auth 体现的设计哲学是「**安全默认 + 不重复造轮子**」。密码哈希、Session 固定攻击防护、登录限流、密码重置 token,这些安全细节 Django 全部处理好。你只要调 \`authenticate\` + \`login\`,背后是 PBKDF2 哈希、Session 重置、CSRF 防护等一系列安全措施。理解 auth 的关键不在 API(就 authenticate/login/logout 三个),而在「认证(authentication,你是谁)」和「授权(authorization,你能做什么)」的区分,以及密码「永远不存明文」的安全铁律。
`,
  },

  // ============================================================
  // 第 30 章:自定义用户模型
  // ============================================================
  {
    id: "django-user-model",
    group: "Django 认证",
    icon: "👤",
    title: "自定义用户模型",
    content: `# 自定义用户模型

## 为什么自定义 User 模型

Django 自带的 \`User\` 模型字段固定:\`username\`、\`password\`、\`email\`、\`first_name\`、\`last_name\`。但实际项目常有额外需求:

- 用邮箱登录(不要 username)。
- 加手机号、头像、生日字段。
- 区分用户类型(普通用户、企业用户)。

如果用默认 \`User\` + 一对一 \`Profile\` 表,会出现:

- 跨表查询麻烦(\`user.profile.phone\`)。
- 邮箱登录要自己实现(覆盖 authenticate)。
- Admin 后台分两个表管理。

**最佳实践:项目一开始就自定义 User 模型**,一劳永逸。

⚠️ **铁律:在项目最开始(第一次 migrate 之前)就建好自定义 User**。已经有数据后再改,迁移极其痛苦(要删表重建,数据丢失)。

## 两种方案对比

Django 提供两条路:

| 方案 | 继承 | 改动量 | 推荐场景 |
|---|---|---|---|
| \`AbstractUser\` | 继承扩展 | 小 | 只加字段,保留 username/password 等 |
| \`AbstractBaseUser\` | 完全自定义 | 大 | 完全改字段(如邮箱登录、改密码校验) |

经验法则:**优先用 \`AbstractUser\`**,只有需要「颠覆性改动」(如完全用邮箱替代 username)才用 \`AbstractBaseUser\`。

## 方案 1:AbstractUser(推荐)

继承 \`AbstractUser\`,只加字段,保留原有认证逻辑:

\`\`\`python
# users/models.py
# 从 django.contrib.auth.models 导入 AbstractUser
from django.contrib.auth.models import AbstractUser
# 从 django.db 导入 models
from django.db import models

# 定义类 User，继承 AbstractUser
class User(AbstractUser):
    # """自定义用户:在默认基础上加字段"""
    """自定义用户:在默认基础上加字段"""
    # 定义变量 phone，赋值为 models.CharField(max_length=20, blank=True, v...
    phone = models.CharField(max_length=20, blank=True, verbose_name="手机号")
    # 定义变量 avatar，赋值为 models.ImageField(upload_to="avatars/", blank...
    avatar = models.ImageField(upload_to="avatars/", blank=True, verbose_name="头像")
    # 定义变量 bio，赋值为 models.TextField(blank=True, verbose_name="个人...
    bio = models.TextField(blank=True, verbose_name="个人简介")
    # 定义变量 birthday，赋值为 models.DateField(null=True, blank=True, verbo...
    birthday = models.DateField(null=True, blank=True, verbose_name="生日")

    # 定义类 Meta
    class Meta:
        # 定义变量 verbose_name，赋值为 "用户"
        verbose_name = "用户"
        # 定义变量 verbose_name_plural，赋值为 "用户"
        verbose_name_plural = "用户"

    # 定义函数 __str__，参数: self
    def __str__(self):
        # 返回 self.username
        return self.username
\`\`\`

注册到 settings:

\`\`\`python
# settings.py
# 必须配置!否则 Django 还是认默认 User
# 定义变量 AUTH_USER_MODEL，赋值为 "users.User"
AUTH_USER_MODEL = "users.User"
\`\`\`

\`AUTH_USER_MODEL\` 格式是 \`<app_label>.<ModelName>\`,指向你自定义的 User。

注意:

- 在**第一次 migrate 之前**就配好 \`AUTH_USER_MODEL\`。
- 配置后,Django 自带的 \`django.contrib.auth.models.User\` 不再用(但别删,内部还引用)。
- 其他 Model 引用用户用 \`settings.AUTH_USER_MODEL\`,不要直接 \`import User\`。

\`\`\`python
# blog/models.py
# 从 django.conf 导入 settings
from django.conf import settings
# 从 django.db 导入 models
from django.db import models

# 定义类 Post，继承 models.Model
class Post(models.Model):
    # ❌ 不要直接 import User
    # from django.contrib.auth.models import User
    # author = models.ForeignKey(User, ...)

    # ✅ 用 settings.AUTH_USER_MODEL(字符串)
    # 定义变量 author，赋值为 models.ForeignKey(
    author = models.ForeignKey(
        # settings.AUTH_USER_MODEL,
        settings.AUTH_USER_MODEL,
        # 定义变量 on_delete，赋值为 models.CASCADE,
        on_delete=models.CASCADE,
        # 定义变量 related_name，赋值为 "posts",
        related_name="posts",
    # )
    )
\`\`\`

用字符串 \`settings.AUTH_USER_MODEL\` 而非直接 import,避免循环引用和迁移顺序问题。

## 方案 2:AbstractBaseUser(完全自定义)

完全自定义 User,自己定义字段、自己实现认证:

\`\`\`python
# users/models.py
# 从 django.contrib.auth.models 导入 AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
# 从 django.db 导入 models
from django.db import models

# 第 1 步:自定义 Manager(管理用户创建)
# 定义类 UserManager，继承 BaseUserManager
class UserManager(BaseUserManager):
    # """用邮箱登录的 User Manager"""
    """用邮箱登录的 User Manager"""

    # 定义函数 create_user，参数: self, email, password=None, **extra_fields
    def create_user(self, email, password=None, **extra_fields):
        # 条件判断：如果 not email
        if not email:
            # 抛出 ValueError 异常: "必须填邮箱"
            raise ValueError("必须填邮箱")
        # 定义变量 email，赋值为 self.normalize_email(email)
        email = self.normalize_email(email)
        # 定义变量 user，赋值为 self.model(email=email, **extra_fields)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # 哈希密码
        # 调用 user.save()
        user.save(using=self._db)
        # 返回 user
        return user

    # 定义函数 create_superuser，参数: self, email, password=None, **extra_fields
    def create_superuser(self, email, password=None, **extra_fields):
        # 调用 extra_fields.setdefault()
        extra_fields.setdefault("is_staff", True)
        # 调用 extra_fields.setdefault()
        extra_fields.setdefault("is_superuser", True)
        # 条件判断：如果 extra_fields.get("is_staff") is not True
        if extra_fields.get("is_staff") is not True:
            # 抛出 ValueError 异常: "超级用户必须 is_staff=True"
            raise ValueError("超级用户必须 is_staff=True")
        # 条件判断：如果 extra_fields.get("is_superuser") is not True
        if extra_fields.get("is_superuser") is not True:
            # 抛出 ValueError 异常: "超级用户必须 is_superuser=True"
            raise ValueError("超级用户必须 is_superuser=True")
        # 返回 self.create_user(email, password, **extra_fields)
        return self.create_user(email, password, **extra_fields)

# 第 2 步:自定义 User
# 定义类 User，继承 AbstractBaseUser, PermissionsMixin
class User(AbstractBaseUser, PermissionsMixin):
    # """用邮箱登录的用户模型"""
    """用邮箱登录的用户模型"""

    # 定义变量 email，赋值为 models.EmailField(unique=True, verbose_name="...
    email = models.EmailField(unique=True, verbose_name="邮箱")
    # 定义变量 nickname，赋值为 models.CharField(max_length=30, verbose_name=...
    nickname = models.CharField(max_length=30, verbose_name="昵称")
    # 定义变量 avatar，赋值为 models.ImageField(upload_to="avatars/", blank...
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    # 定义变量 phone，赋值为 models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # 定义变量 is_active，赋值为 models.BooleanField(default=True, verbose_nam...
    is_active = models.BooleanField(default=True, verbose_name="启用")
    # 定义变量 is_staff，赋值为 models.BooleanField(default=False, verbose_na...
    is_staff = models.BooleanField(default=False, verbose_name="管理员")
    # 定义变量 date_joined，赋值为 models.DateTimeField(auto_now_add=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # 关键:指定用哪个字段登录
    # 定义变量 USERNAME_FIELD，赋值为 "email"
    USERNAME_FIELD = "email"
    # createsuperuser 时额外必填的字段
    # 定义列表 REQUIRED_FIELDS
    REQUIRED_FIELDS = ["nickname"]

    # 指定 Manager
    # 定义变量 objects，赋值为 UserManager()
    objects = UserManager()

    # 定义类 Meta
    class Meta:
        # 定义变量 verbose_name，赋值为 "用户"
        verbose_name = "用户"
        # 定义变量 verbose_name_plural，赋值为 "用户"
        verbose_name_plural = "用户"

    # 定义函数 __str__，参数: self
    def __str__(self):
        # 返回 self.email
        return self.email
\`\`\`

关键点:

- \`USERNAME_FIELD = "email"\`:指定用 email 登录(替代 username)。
- \`REQUIRED_FIELDS\`:\`createsuperuser\` 时除了 USERNAME_FIELD 和 password 外必填的字段。
- 必须继承 \`AbstractBaseUser\`(提供 password 哈希)+ \`PermissionsMixin\`(提供权限)。
- 必须实现 \`UserManager\` 的 \`create_user\` 和 \`create_superuser\`。

\`\`\`python
# settings.py
# 定义变量 AUTH_USER_MODEL，赋值为 "users.User"
AUTH_USER_MODEL = "users.User"
\`\`\`

\`\`\`bash
# 创建超级用户(交互会问 email、nickname、password)
# 运行 Python 脚本 manage.py
python manage.py createsuperuser
# Email: admin@example.com
# Nickname: 管理员
# Password: ********
\`\`\`

## profile app:分离用户信息

有时不想把所有用户字段塞进 User 表,可以拆「核心认证信息」和「扩展资料」:

\`\`\`python
# users/models.py
# 定义类 User，继承 AbstractUser
class User(AbstractUser):
    # """核心:认证必需"""
    """核心:认证必需"""
    # 定义变量 phone，赋值为 models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # 添加时返回 signal 自动创建 Profile
    # 空操作占位
    pass

# 定义类 Profile，继承 models.Model
class Profile(models.Model):
    # """扩展:非核心资料"""
    """扩展:非核心资料"""
    # 定义变量 user，赋值为 models.OneToOneField(
    user = models.OneToOneField(
        # settings.AUTH_USER_MODEL,
        settings.AUTH_USER_MODEL,
        # 定义变量 on_delete，赋值为 models.CASCADE,
        on_delete=models.CASCADE,
        # 定义变量 related_name，赋值为 "profile",
        related_name="profile",
    # )
    )
    # 定义变量 avatar，赋值为 models.ImageField(upload_to="avatars/", blank...
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    # 定义变量 bio，赋值为 models.TextField(blank=True)
    bio = models.TextField(blank=True)
    # 定义变量 website，赋值为 models.URLField(blank=True)
    website = models.URLField(blank=True)

# 用 signal 自动建 Profile
# 从 django.db.models.signals 导入 post_save
from django.db.models.signals import post_save
# 从 django.dispatch 导入 receiver
from django.dispatch import receiver

# 装饰器：receiver
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
# 定义函数 create_profile，参数: sender, instance, created, **kwargs
def create_profile(sender, instance, created, **kwargs):
    # 条件判断：如果 created
    if created:
        # 调用 Profile.objects.create()
        Profile.objects.create(user=instance)

# 装饰器：receiver
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
# 定义函数 save_profile，参数: sender, instance, **kwargs
def save_profile(sender, instance, **kwargs):
    # 调用 instance.profile.save()
    instance.profile.save()
\`\`\`

\`AbstractUser + Profile\` 适合「核心字段少,扩展字段多」的场景。如果只是加几个字段,直接用 \`AbstractUser\` 加字段更简单。

## settings.AUTH_USER_MODEL

引用用户模型的最佳方式:

\`\`\`python
# 从 django.conf 导入 settings
from django.conf import settings

# 1. Model 外键
# 定义类 Post，继承 models.Model
class Post(models.Model):
    # 定义变量 author，赋值为 models.ForeignKey(settings.AUTH_USER_MODEL, o...
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

# 2. 拿到 User 类(运行时)
User = settings.AUTH_USER_MODEL  # ❌ 这是字符串,不是类!
# 正确:用 get_user_model
# 从 django.contrib.auth 导入 get_user_model
from django.contrib.auth import get_user_model
User = get_user_model()  # ✅ 返回 User 类

# 3. 在 Form/Serializer 里
# 定义类 PostForm，继承 forms.ModelForm
class PostForm(forms.ModelForm):
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 Post
        model = Post
        fields = ["title", "author"]  # author 自动是 AUTH_USER_MODEL
\`\`\`

## 为什么一开始就建自定义 User

**痛点**:项目跑了一段时间(已有用户数据),想从默认 User 换成自定义 User,迁移极其痛苦:

- Django 的 \`auth\`、\`admin\` 等内置应用都依赖 \`User\` 表。
- 换 User 模型 = 删旧表 + 建新表 + 迁移外键 + 重新建超级用户。
- 已有用户数据全部丢失(或要写复杂的数据迁移脚本)。

\`\`\`bash
# 中途换 User 的报错(简化)
# django.db.utils.OperationalError: no such table: auth_user
# 或外键约束冲突
\`\`\`

**所以铁律是:每个新项目第一步,先建自定义 User,再 migrate。**即使觉得「现在用默认 User 够了」,也先建着,免得日后后悔。

## 完整示例:用 email 登录的自定义 User

\`\`\`python
# users/models.py
# 从 django.contrib.auth.models 导入 AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
# 从 django.db 导入 models
from django.db import models
# 从 django.utils 导入 timezone
from django.utils import timezone

# 定义类 UserManager，继承 BaseUserManager
class UserManager(BaseUserManager):
    # 定义函数 create_user，参数: self, email, password=None, **extra
    def create_user(self, email, password=None, **extra):
        # 条件判断：如果 not email
        if not email:
            # 抛出 ValueError 异常: "邮箱必填"
            raise ValueError("邮箱必填")
        # 定义变量 email，赋值为 self.normalize_email(email)
        email = self.normalize_email(email)
        # 定义变量 user，赋值为 self.model(email=email, **extra)
        user = self.model(email=email, **extra)
        # 调用 user.set_password()
        user.set_password(password)
        # 调用 user.save()
        user.save(using=self._db)
        # 返回 user
        return user

    # 定义函数 create_superuser，参数: self, email, password=None, **extra
    def create_superuser(self, email, password=None, **extra):
        # 调用 extra.setdefault()
        extra.setdefault("is_staff", True)
        # 调用 extra.setdefault()
        extra.setdefault("is_superuser", True)
        # 返回 self.create_user(email, password, **extra)
        return self.create_user(email, password, **extra)

# 定义类 User，继承 AbstractBaseUser, PermissionsMixin
class User(AbstractBaseUser, PermissionsMixin):
    # 定义变量 email，赋值为 models.EmailField(unique=True, verbose_name="...
    email = models.EmailField(unique=True, verbose_name="邮箱")
    # 定义变量 nickname，赋值为 models.CharField(max_length=30, verbose_name=...
    nickname = models.CharField(max_length=30, verbose_name="昵称")
    # 定义变量 avatar，赋值为 models.ImageField(upload_to="avatars/", blank...
    avatar = models.ImageField(upload_to="avatars/", blank=True, default="")
    # 定义变量 is_active，赋值为 models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    # 定义变量 is_staff，赋值为 models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    # 定义变量 date_joined，赋值为 models.DateTimeField(default=timezone.now)
    date_joined = models.DateTimeField(default=timezone.now)

    # 定义变量 USERNAME_FIELD，赋值为 "email"
    USERNAME_FIELD = "email"
    # 定义列表 REQUIRED_FIELDS
    REQUIRED_FIELDS = ["nickname"]
    # 定义变量 objects，赋值为 UserManager()
    objects = UserManager()

    # 定义类 Meta
    class Meta:
        # 定义变量 verbose_name，赋值为 "用户"
        verbose_name = "用户"
        # 定义变量 verbose_name_plural，赋值为 "用户"
        verbose_name_plural = "用户"

    # 定义函数 __str__，参数: self
    def __str__(self):
        # 返回 f"{self.nickname} <{self.email}>"
        return f"{self.nickname} <{self.email}>"
\`\`\`

\`\`\`python
# users/admin.py
# 从 django.contrib 导入 admin
from django.contrib import admin
# 从 django.contrib.auth.admin 导入 UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# 从 .models 导入 User
from .models import User

# 装饰器：admin.register
@admin.register(User)
# 定义类 UserAdmin，继承 BaseUserAdmin
class UserAdmin(BaseUserAdmin):
    # 因为用 email 登录,要调整 Admin 的字段
    # 定义变量 list_display，赋值为 ("email", "nickname", "is_staff", "is_active"...
    list_display = ("email", "nickname", "is_staff", "is_active")
    # 定义变量 list_filter，赋值为 ("is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    # 定义变量 search_fields，赋值为 ("email", "nickname")
    search_fields = ("email", "nickname")
    # 定义变量 ordering，赋值为 ("email",)
    ordering = ("email",)

    # 编辑页字段布局
    # 定义变量 fieldsets，赋值为 (
    fieldsets = (
        # (None, {"fields": ("email", "password")}),
        (None, {"fields": ("email", "password")}),
        # ("个人信息", {"fields": ("nickname", "avatar")}),
        ("个人信息", {"fields": ("nickname", "avatar")}),
        # ("权限", {"fields": ("is_active", "is_staff", "is_su
        ("权限", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        # ("重要日期", {"fields": ("last_login", "date_joined")}
        ("重要日期", {"fields": ("last_login", "date_joined")}),
    # )
    )

    # 创建用户页字段
    # 定义变量 add_fieldsets，赋值为 (
    add_fieldsets = (
        # (None, {
        (None, {
            # "classes": ("wide",),
            "classes": ("wide",),
            # "fields": ("email", "nickname", "password1", "pass
            "fields": ("email", "nickname", "password1", "password2"),
        # }),
        }),
    # )
    )
\`\`\`

\`\`\`python
# settings.py
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    "users",  # 注册 users 应用
# ]
]
# 定义变量 AUTH_USER_MODEL，赋值为 "users.User"
AUTH_USER_MODEL = "users.User"
\`\`\`

\`\`\`python
# 注册/登录视图(用 email)
# 从 django.contrib.auth 导入 authenticate, login
from django.contrib.auth import authenticate, login
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect

# 定义函数 register_view，参数: request
def register_view(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 email，赋值为 request.POST.get("email")
        email = request.POST.get("email")
        # 定义变量 nickname，赋值为 request.POST.get("nickname")
        nickname = request.POST.get("nickname")
        # 定义变量 password，赋值为 request.POST.get("password")
        password = request.POST.get("password")

        # 从 .models 导入 User
        from .models import User
        # 条件判断：如果 User.objects.filter(email=email).exists()
        if User.objects.filter(email=email).exists():
            # 返回 render(request, "register.html", {"error": "邮箱已注册"})
            return render(request, "register.html", {"error": "邮箱已注册"})
        # 定义变量 user，赋值为 User.objects.create_user(
        user = User.objects.create_user(
            # 定义变量 email，赋值为 email, password=password, nickname=nickname
            email=email, password=password, nickname=nickname
        # )
        )
        # 调用 login()
        login(request, user)
        # 返回 redirect("/")
        return redirect("/")
    # 返回 render(request, "register.html")
    return render(request, "register.html")

# 定义函数 login_view，参数: request
def login_view(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 email，赋值为 request.POST.get("email")
        email = request.POST.get("email")
        # 定义变量 password，赋值为 request.POST.get("password")
        password = request.POST.get("password")
        # 定义变量 user，赋值为 authenticate(request, username=email, passwor...
        user = authenticate(request, username=email, password=password)
        # 注意:authenticate 的 username 参数还是叫 username,但值传 email
        # 条件判断：如果 user is not None
        if user is not None:
            # 调用 login()
            login(request, user)
            # 返回 redirect(request.GET.get("next", "/"))
            return redirect(request.GET.get("next", "/"))
        # 返回 render(request, "login.html", {"error": "邮箱或密码错误"})
        return render(request, "login.html", {"error": "邮箱或密码错误"})
    # 返回 render(request, "login.html")
    return render(request, "login.html")
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 中途换 User 模型 | 迁移地狱 | 项目一开始就建 |
| 没配 AUTH_USER_MODEL | 还是默认 User | settings 加配置 |
| 外键直接 import User | 循环引用 | 用 settings.AUTH_USER_MODEL |
| AbstractBaseUser 没写 Manager | create_user 报错 | 实现 UserManager |
| USERNAME_FIELD 不唯一 | 注册重复 | 字段加 unique=True |
| REQUIRED_FIELDS 含 USERNAME_FIELD | 报错 | 自动包含,别重复写 |
| 拿 User 类用 settings.AUTH_USER_MODEL | 是字符串不是类 | 用 get_user_model() |
| Admin 没适配 email 登录 | 字段对不上 | 重写 UserAdmin fieldsets |
| 没继承 PermissionsMixin | 没有权限系统 | 加上 PermissionsMixin |
| Profile 重复创建 | signal 重复触发 | 加 if created 判断 |

## 设计思想

自定义 User 模型体现的设计哲学是「**早期决策决定长期架构**」。User 是整个系统的「根模型」,几乎所有业务都引用它。一旦上线有数据,改 User 模型就像换楼房地基——几乎不可能不伤筋动骨。所以 Django 社区铁律是「项目第一行代码就定 User」。理解 User 模型的关键不在选 AbstractUser 还是 AbstractBaseUser(那是细节),而在理解「认证字段(USERNAME_FIELD)」「Manager(create_user/create_superuser)」「AUTH_USER_MODEL 全局引用」这三者构成了 Django 用户系统的骨架,改动牵一发动全身。
`,
  },

  // ============================================================
  // 第 31 章:Django 权限与分组
  // ============================================================
  {
    id: "django-permission",
    group: "Django 认证",
    icon: "🛡️",
    title: "Django 权限与分组",
    content: `# Django 权限与分组

## 权限系统是什么

Django 内置一套「**RBAC(Role-Based Access Control,基于角色的访问控制)**」权限系统,包含三个核心概念:

- **Permission(权限)**:可执行的操作,如「新增文章」「删除评论」。
- **Group(分组/角色)**:权限的集合,把多个权限打包,批量授权给用户。
- **User(用户)**:可以拥有多个权限和属于多个分组。

权限分两层:

- **模型级权限**:对某类 Model 的操作(add/change/delete/view),Django 自动生成。
- **对象级权限**:对某条具体记录的操作(如「只能编辑自己的文章」),Django 默认不支持,需 \`django-guardian\` 扩展。

## Group:用户分组

Group 是「权限的集合」,本质是把多个 Permission 打包,方便批量授权:

\`\`\`python
# 从 django.contrib.auth.models 导入 Group, Permission, User
from django.contrib.auth.models import Group, Permission, User

# 创建分组(角色)
# editors, _ = Group.objects.get_or_create(name="edi
editors, _ = Group.objects.get_or_create(name="editors")
# authors, _ = Group.objects.get_or_create(name="aut
authors, _ = Group.objects.get_or_create(name="authors")

# 给分组加权限
# editors.permissions.add(
editors.permissions.add(
    # 调用 Permission.objects.get()
    Permission.objects.get(codename="add_post"),
    # 调用 Permission.objects.get()
    Permission.objects.get(codename="change_post"),
    # 调用 Permission.objects.get()
    Permission.objects.get(codename="delete_post"),
# )
)
# authors.permissions.add(
authors.permissions.add(
    # 调用 Permission.objects.get()
    Permission.objects.get(codename="add_post"),
    # 调用 Permission.objects.get()
    Permission.objects.get(codename="change_post"),
# )
)

# 用户加入分组
# 定义变量 user，赋值为 User.objects.get(username="alice")
user = User.objects.get(username="alice")
user.groups.add(editors)  # alice 现在是 editors 组,自动拥有该组所有权限
\`\`\`

用户加入某 Group 后,自动继承该 Group 的所有权限。换角色就是换 Group,不用逐个权限调。

## Permission:权限

### 1. 模型级权限(自动生成)

每个 Model 在 \`migrate\` 后自动生成 4 种权限:

| 权限 | codename | 含义 |
|---|---|---|
| \`blog.add_post\` | \`add_post\` | 新增 |
| \`blog.change_post\` | \`change_post\` | 修改 |
| \`blog.delete_post\` | \`delete_post\` | 删除 |
| \`blog.view_post\` | \`view_post\` | 查看 |

命名格式:\`<app_label>.<action>_<modelname_lower>\`。

\`\`\`python
# 查看所有权限
# 从 django.contrib.auth.models 导入 Permission
from django.contrib.auth.models import Permission
# 调用 Permission.objects.filter()
Permission.objects.filter(content_type__app_label="blog")
\`\`\`

### 2. 自定义权限

在 Model 的 \`Meta.permissions\` 里定义:

\`\`\`python
# 定义类 Post，继承 models.Model
class Post(models.Model):
    # 定义变量 title，赋值为 models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    # ...

    # 定义类 Meta
    class Meta:
        # 定义列表 permissions
        permissions = [
            # ("publish_post", "可以发布文章"),
            ("publish_post", "可以发布文章"),
            # ("unpublish_post", "可以下架文章"),
            ("unpublish_post", "可以下架文章"),
            # ("moderate_comments", "可以审核评论"),
            ("moderate_comments", "可以审核评论"),
        # ]
        ]
\`\`\`

\`makemigrations + migrate\` 后,这三种权限自动创建。

### 3. 检查权限

\`\`\`python
# 视图里
# 定义变量 user，赋值为 request.user
user = request.user

# 检查是否有某权限
# 条件判断：如果 user.has_perm("blog.add_post")
if user.has_perm("blog.add_post"):
    # 调用 print()
    print("可以新增文章")

# 检查多个权限(任一)
# 条件判断：如果 user.has_perms(["blog.add_post", "blog.change_post"])
if user.has_perms(["blog.add_post", "blog.change_post"]):
    # 调用 print()
    print("可以新增或修改")

# 检查某 Model 的所有权限
# 条件判断：如果 user.has_module_perms("blog")
if user.has_module_perms("blog"):
    # 调用 print()
    print("对 blog 应用有某种权限")

# 模板里
# {% if perms.blog.add_post %}
{% if perms.blog.add_post %}
    # <a href="{% url 'blog:post_new' %}">写文章</a>
    <a href="{% url 'blog:post_new' %}">写文章</a>
# {% endif %}
{% endif %}
# {% if perms.blog.delete_post %}
{% if perms.blog.delete_post %}
    # <button onclick="deletePost()">删除</button>
    <button onclick="deletePost()">删除</button>
# {% endif %}
{% endif %}
\`\`\`

## @permission_required

装饰器强制视图需要某权限:

\`\`\`python
# 从 django.contrib.auth.decorators 导入 permission_required
from django.contrib.auth.decorators import permission_required

# 装饰器：permission_required
@permission_required("blog.add_post", raise_exception=True)
# 定义函数 post_new，参数: request
def post_new(request):
    # 无权限直接 403(raise_exception=True)
    # ...
    ...

# 多个权限(默认 AND)
# 装饰器：permission_required
@permission_required(["blog.add_post", "blog.change_post"])
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # ...
    ...

# 类视图用 PermissionRequiredMixin
# 从 django.contrib.auth.mixins 导入 PermissionRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin

# 定义类 PostCreateView，继承 PermissionRequiredMixin, CreateView
class PostCreateView(PermissionRequiredMixin, CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 permission_required，赋值为 "blog.add_post"
    permission_required = "blog.add_post"
    # 定义变量 raise_exception，赋值为 True
    raise_exception = True
\`\`\`

## Group 批量授权

实际项目里,给用户逐个加权限太繁琐。用 Group 批量管理:

\`\`\`python
# 初始化角色(用 data migration 或 shell 一次性建)
# 从 django.contrib.auth.models 导入 Group, Permission
from django.contrib.auth.models import Group, Permission

# 定义函数 init_groups，参数: 
def init_groups():
    # """初始化角色分组(在 data migration 里调用)"""
    """初始化角色分组(在 data migration 里调用)"""

    # 编辑:能增删改所有文章
    # 定义变量 editor_perms，赋值为 Permission.objects.filter(
    editor_perms = Permission.objects.filter(
        # 定义列表 codename__in
        codename__in=["add_post", "change_post", "delete_post",
                       # "publish_post", "moderate_comments"]
                       "publish_post", "moderate_comments"]
    # )
    )
    # editors, _ = Group.objects.get_or_create(name="edi
    editors, _ = Group.objects.get_or_create(name="editors")
    # 调用 editors.permissions.set()
    editors.permissions.set(editor_perms)

    # 作者:能增改自己的文章
    # 定义变量 author_perms，赋值为 Permission.objects.filter(
    author_perms = Permission.objects.filter(
        # 定义列表 codename__in
        codename__in=["add_post", "change_post"]
    # )
    )
    # authors, _ = Group.objects.get_or_create(name="aut
    authors, _ = Group.objects.get_or_create(name="authors")
    # 调用 authors.permissions.set()
    authors.permissions.set(author_perms)

    # 审核员:能审核评论
    # 定义变量 moderator_perms，赋值为 Permission.objects.filter(
    moderator_perms = Permission.objects.filter(
        # 定义列表 codename__in
        codename__in=["moderate_comments"]
    # )
    )
    # moderators, _ = Group.objects.get_or_create(name="
    moderators, _ = Group.objects.get_or_create(name="moderators")
    # 调用 moderators.permissions.set()
    moderators.permissions.set(moderator_perms)

# 给用户分配角色
# 定义变量 user，赋值为 User.objects.get(username="alice")
user = User.objects.get(username="alice")
user.groups.add(authors)  # 成为作者

# 检查用户是否在某组
# 条件判断：如果 user.groups.filter(name="editors").exists()
if user.groups.filter(name="editors").exists():
    # 调用 print()
    print("是编辑")

# 用户所有权限(自身 + 所有组)
user.get_all_permissions()  # {'blog.add_post', 'blog.change_post', ...}
user.get_group_permissions()  # 仅来自组的
user.get_user_permissions()    # 仅自身的
\`\`\`

## 对象级权限(django-guardian)

Django 默认权限是「模型级」(对整类 Model),不是「对象级」(对具体某条记录)。比如「\`blog.change_post\`」表示「能改所有文章」,不能表达「只能改自己的文章」。

「只能改自己的文章」这种需求,有两种实现:

### 1. 视图里手动判断(简单场景)

\`\`\`python
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # 条件判断：如果 post.author != request.user
    if post.author != request.user:
        raise PermissionDenied  # 不是作者,拒绝
    # ...
\`\`\`

### 2. django-guardian(对象级权限库)

\`\`\`bash
# 安装 Python 包: django-guardian
pip install django-guardian
\`\`\`

\`\`\`python
# settings.py
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    # "guardian",
    "guardian",
# ]
]
# 定义变量 AUTHENTICATION_BACKENDS，赋值为 (
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",  # 默认
    "guardian.backends.ObjectPermissionBackend",  # 加对象级
# )
)

# 给用户对某对象的权限
# 从 guardian.shortcuts 导入 assign_perm, remove_perm, get_objects_for_user
from guardian.shortcuts import assign_perm, remove_perm, get_objects_for_user

# 定义变量 post，赋值为 Post.objects.get(pk=1)
post = Post.objects.get(pk=1)
# 定义变量 user，赋值为 request.user
user = request.user

# 赋权:alice 能改 post 1
# 调用 assign_perm()
assign_perm("change_post", user, post)

# 检查
user.has_perm("change_post", post)  # True

# 查询 alice 能改的所有 post
# 定义变量 editable，赋值为 get_objects_for_user(user, "blog.change_post"...
editable = get_objects_for_user(user, "blog.change_post")

# 移除权限
# 调用 remove_perm()
remove_perm("change_post", user, post)
\`\`\`

适合「权限关系复杂、动态变化」的场景(如协作文档:某文档只给某些人编辑)。

## RBAC 在 Django 的实现

完整的 RBAC 模型:

\`\`\`
用户(User)──┬── 用户-权限(直接授权)
              └── 用户-分组(Group)── 分组-权限
\`\`\`

即用户通过两种方式获得权限:

1. 直接授权(\`user.user_permissions.add(...)\`)。
2. 通过分组(\`user.groups.add(...)\`,继承组权限)。

\`user.has_perm(...)\` 会自动检查两种来源。

\`\`\`python
# 直接给用户授权(不通过组)
# 调用 user.user_permissions.add()
user.user_permissions.add(Permission.objects.get(codename="delete_post"))

# 用户最终权限 = 自身权限 ∪ 所有组权限
# 调用 user.get_all_permissions()
user.get_all_permissions()
\`\`\`

设计建议:

- **角色稳定、用户多** → 用 Group(角色)+ 用户入组。
- **个别特殊授权** → 直接给用户加权限(覆盖组)。
- **每条记录不同权限** → django-guardian 对象级。

## 完整示例:编辑权限只有作者和编辑组

\`\`\`python
# blog/decorators.py
# 从 functools 导入 wraps
from functools import wraps
# 从 django.core.exceptions 导入 PermissionDenied
from django.core.exceptions import PermissionDenied

# 定义函数 can_edit_post，参数: view_func
def can_edit_post(view_func):
    # """只有文章作者 或 editors 组成员能编辑"""
    """只有文章作者 或 editors 组成员能编辑"""
    # 装饰器：wraps
    @wraps(view_func)
    # 定义函数 _wrapped，参数: request, *args, **kwargs
    def _wrapped(request, *args, **kwargs):
        # 定义变量 pk，赋值为 kwargs.get("pk")
        pk = kwargs.get("pk")
        # 从 blog.models 导入 Post
        from blog.models import Post
        # 从 django.shortcuts 导入 get_object_or_404
        from django.shortcuts import get_object_or_404
        # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
        post = get_object_or_404(Post, pk=pk)

        # 定义变量 is_author，赋值为 post.author == request.user
        is_author = post.author == request.user
        # 定义变量 is_editor，赋值为 request.user.groups.filter(name="editors").ex...
        is_editor = request.user.groups.filter(name="editors").exists()
        # 定义变量 is_superuser，赋值为 request.user.is_superuser
        is_superuser = request.user.is_superuser

        # 条件判断：如果 not (is_author or is_editor or is_superuser)
        if not (is_author or is_editor or is_superuser):
            # 抛出 PermissionDenied 异常: "只有作者或编辑能修改"
            raise PermissionDenied("只有作者或编辑能修改")

        # 返回 view_func(request, *args, **kwargs)
        return view_func(request, *args, **kwargs)
    # 返回 _wrapped
    return _wrapped

# 定义函数 can_publish_post，参数: view_func
def can_publish_post(view_func):
    # """只有 editors 组能发布"""
    """只有 editors 组能发布"""
    # 装饰器：wraps
    @wraps(view_func)
    # 定义函数 _wrapped，参数: request, *args, **kwargs
    def _wrapped(request, *args, **kwargs):
        # if not (request.user.groups.filter(name="editors")
        if not (request.user.groups.filter(name="editors").exists()
                # or request.user.is_superuser):
                or request.user.is_superuser):
            # 抛出 PermissionDenied 异常: "需要编辑权限才能发布"
            raise PermissionDenied("需要编辑权限才能发布")
        # 返回 view_func(request, *args, **kwargs)
        return view_func(request, *args, **kwargs)
    # 返回 _wrapped
    return _wrapped
\`\`\`

\`\`\`python
# blog/views.py
# 从 django.contrib.auth.decorators 导入 login_required, permission_required
from django.contrib.auth.decorators import login_required, permission_required
# 从 django.views.decorators.http 导入 require_POST
from django.views.decorators.http import require_POST
# 从 .decorators 导入 can_edit_post, can_publish_post
from .decorators import can_edit_post, can_publish_post

# 装饰器：login_required
@login_required
# 装饰器：permission_required
@permission_required("blog.add_post", raise_exception=True)
# 定义函数 post_new，参数: request
def post_new(request):
    # 需登录 + 有 add_post 权限
    # ...
    ...

# 装饰器：login_required
@login_required
# 装饰器：can_edit_post
@can_edit_post
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # 需登录 + 是作者或编辑组成员
    # ...
    ...

# 装饰器：login_required
@login_required
# 装饰器：can_edit_post
@can_edit_post
# 装饰器：require_POST
@require_POST
# 定义函数 post_delete，参数: request, pk
def post_delete(request, pk):
    # 删除:作者或编辑,且必须是 POST
    # ...
    ...

# 装饰器：login_required
@login_required
# 装饰器：can_publish_post
@can_publish_post
# 装饰器：require_POST
@require_POST
# 定义函数 post_publish，参数: request, pk
def post_publish(request, pk):
    # 发布:只有编辑组
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # post.status = "published"
    post.status = "published"
    # 调用 post.save()
    post.save()
    # 返回 redirect("blog:post_detail", pk=post.pk)
    return redirect("blog:post_detail", pk=post.pk)
\`\`\`

\`\`\`python
# 模板里按权限显示按钮
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block content %}
{% block content %}
# <article>
<article>
    # <h1>{{ post.title }}</h1>
    <h1>{{ post.title }}</h1>
    # <div>{{ post.content }}</div>
    <div>{{ post.content }}</div>

    # {% if user.is_authenticated %}
    {% if user.is_authenticated %}
        # {% if perms.blog.change_post and post.author == us
        {% if perms.blog.change_post and post.author == user %}
            # <a href="{% url 'blog:post_edit' post.pk %}">编辑</a
            <a href="{% url 'blog:post_edit' post.pk %}">编辑</a>
        # {% endif %}
        {% endif %}
        # {% if perms.blog.delete_post and post.author == us
        {% if perms.blog.delete_post and post.author == user %}
            # <a href="{% url 'blog:post_delete' post.pk %}">删除<
            <a href="{% url 'blog:post_delete' post.pk %}">删除</a>
        # {% endif %}
        {% endif %}
        # {% if perms.blog.publish_post %}
        {% if perms.blog.publish_post %}
            # <form method="post" action="{% url 'blog:post_publ
            <form method="post" action="{% url 'blog:post_publish' post.pk %}">
                # {% csrf_token %}
                {% csrf_token %}
                # <button type="submit">发布</button>
                <button type="submit">发布</button>
            # </form>
            </form>
        # {% endif %}
        {% endif %}
    # {% endif %}
    {% endif %}
# </article>
</article>
# {% endblock %}
{% endblock %}
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 权限名格式错 | 拼写 | app.action_model 如 blog.add_post |
| 改 Meta.permissions 没 migrate | 权限没生成 | makemigrations + migrate |
| 权限检查用 user_permissions | 漏组权限 | 用 has_perm(包含组) |
| 对象级权限用 has_perm | 不支持对象级 | 装 django-guardian |
| Group 不复用 | 每次重建重复 | get_or_create |
| 权限不生效 | 用户没登录 | 先 @login_required |
| raise_exception 默认 False | 无权限跳登录页 | 改 True 直接 403 |
| 模板 perms 取不到 | context_processor 漏 | 检查 auth context processor |
| 超级用户绕过所有检查 | is_superuser=True | 注意:它无视 has_perm |
| 权限粒度太粗 | 模型级不够 | 用对象级或自定义判断 |

## 设计思想

Django 权限系统体现的设计哲学是「**RBAC + 约定生成**」。每个 Model 自动生成增删改查四种权限,你不用手动声明;Group 把权限打包成「角色」,实现批量授权;User 通过「直接授权 + 组授权」两条路获得权限。这套模型覆盖了 80% 的授权需求。剩下 20%(对象级、动态权限)用 django-guardian 或自定义逻辑补。理解权限系统的关键不在记 API(就 has_perm/has_perms/permission_required),而在理清「Permission(原子操作)→ Group(角色打包)→ User(授权对象)」的三层关系,以及「模型级(默认)」和「对象级(扩展)」的边界。
`,
  },

  // ============================================================
  // 第 32 章:Django Session 管理
  // ============================================================
  {
    id: "django-session",
    group: "Django 认证",
    icon: "🔄",
    title: "Django Session 管理",
    content: `# Django Session 管理

## Django Session 是什么

HTTP 是**无状态协议**:每个请求独立,服务器记不住「上一个请求是谁发的」。但实际业务需要「记住用户」:登录状态、购物车、上次浏览页。

**Session(会话)**是解决方案:在服务器存一份「每个用户的数据」,用 **Cookie 里的 session id** 关联。流程:

1. 用户首次访问,服务器生成一个 session id(随机字符串)。
2. session id 通过 Cookie 发给浏览器。
3. 后续请求,浏览器带 session id,服务器用它找到对应数据。

\`\`\`
浏览器                        服务器
  │  请求(无 cookie)            │
  │ ──────────────────────────→ │ 创建 session(id=abc)
  │ ←────────────────────────── │ Set-Cookie: sessionid=abc
  │  请求(cookie: abc)          │
  │ ──────────────────────────→ │ 用 abc 找到数据
  │ ←────────────────────────── │ 响应(带个性化内容)
\`\`\`

Django 内置 Session 框架(\`django.contrib.sessions\`),开箱即用。

## 引擎配置

Session 数据存哪里?Django 提供多种「引擎」:

\`\`\`python
# settings.py
SESSION_ENGINE = "django.contrib.sessions.backends.db"  # 默认:存数据库
\`\`\`

可选引擎:

| 引擎 | 存储位置 | 适合场景 |
|---|---|---|
| \`db\` | 数据库(django_session 表) | 默认,单机小项目 |
| \`cached_db\` | 缓存 + 数据库(双写) | 高性能 + 持久化 |
| \`cache\` | 仅缓存(memcached/redis) | 高性能,可丢失 |
| \`file\` | 文件系统 | 无数据库环境 |
| \`signed_cookies\` | 客户端 Cookie(签名加密) | 无服务端存储,小数据 |

\`\`\`python
# 生产环境用 redis(需 django-redis)
# 定义变量 SESSION_ENGINE，赋值为 "django.contrib.sessions.backends.cache"
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
# 定义字典 CACHES
CACHES = {
    # "default": {
    "default": {
        # "BACKEND": "django_redis.cache.RedisCache",
        "BACKEND": "django_redis.cache.RedisCache",
        # "LOCATION": "redis://127.0.0.1:6379/1",
        "LOCATION": "redis://127.0.0.1:6379/1",
    # }
    }
# }
}
\`\`\`

\`signed_cookies\` 比较特殊:数据存客户端(加密签名),不占服务端存储,但**不能存敏感数据**(虽然签名防篡改,但内容可被解密看到),且 Cookie 大小限制 4KB。

## request.session:字典接口

Session 通过 \`request.session\` 访问,行为像字典:

\`\`\`python
# 定义函数 view，参数: request
def view(request):
    # 设置
    # request.session["key"] = "value"
    request.session["key"] = "value"
    # request.session["user_id"] = 42
    request.session["user_id"] = 42
    # request.session["cart"] = [{"id": 1, "qty": 2}]
    request.session["cart"] = [{"id": 1, "qty": 2}]

    # 读取(带默认值)
    user_id = request.session.get("user_id", 0)  # 不存在返回 0
    val = request.session["user_id"]              # 不存在抛 KeyError

    # 删除
    # del request.session["key"]
    del request.session["key"]
    request.session.pop("key", None)  # 安全删除

    # 判断存在
    # 条件判断：如果 "user_id" in request.session
    if "user_id" in request.session:
        # ...
        ...

    # 清空所有
    # 调用 request.session.clear()
    request.session.clear()

    # 键值遍历
    # 遍历 request.session.keys()，取 key
    for key in request.session.keys():
        # ...
        ...
\`\`\`

注意:

- session 的 key 和 value 必须能被 JSON 序列化(字符串、数字、列表、字典、布尔)。**不能存 Python 对象、datetime(用 ISO 字符串)、Model 实例**。
- 修改「可变对象」(如列表)后要显式标记修改:\`request.session.modified = True\`,否则可能不保存。

\`\`\`python
# ❌ 修改嵌套对象可能不保存
# 定义变量 cart，赋值为 request.session.get("cart", [])
cart = request.session.get("cart", [])
# 调用 cart.append()
cart.append({"id": 2, "qty": 1})
request.session["cart"] = cart  # 重新赋值才保存

# 或显式标记
# request.session.modified = True
request.session.modified = True
\`\`\`

## Session 过期配置

\`\`\`python
# settings.py
# Session Cookie 有效期(秒),默认 2 周
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14  # 14 天

# 浏览器关闭时是否过期(False = 浏览器关就过期)
# 定义变量 SESSION_EXPIRE_AT_BROWSER_CLOSE，赋值为 False
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Cookie 的域名(None = 当前域)
# 定义变量 SESSION_COOKIE_DOMAIN，赋值为 None
SESSION_COOKIE_DOMAIN = None

# 是否仅 HTTPS 传输(False 开发用,生产 True)
SESSION_COOKIE_SECURE = False  # 生产改 True

# 是否仅 HTTP 访问(防 JS 读取,防 XSS 偷)
SESSION_COOKIE_HTTPONLY = True  # 默认 True,建议保持

# Cookie 名(默认 sessionid)
# 定义变量 SESSION_COOKIE_NAME，赋值为 "sessionid"
SESSION_COOKIE_NAME = "sessionid"

# 同站策略(Lax/Strict/None),防 CSRF
# 定义变量 SESSION_COOKIE_SAMESITE，赋值为 "Lax"
SESSION_COOKIE_SAMESITE = "Lax"
\`\`\`

## flush():清空 Session 并换 id

\`clear()\` 只清数据,\`flush()\` 清数据 + 重新生成 session id(防 session 固定攻击):

\`\`\`python
# 从 django.contrib.auth 导入 logout
from django.contrib.auth import logout

# 定义函数 logout_view，参数: request
def logout_view(request):
    logout(request)  # 内部调 flush
    # 或手动:
    # request.session.flush()
    # 返回 redirect("/")
    return redirect("/")
\`\`\`

登录时也要换 id(防固定攻击),Django 的 \`login()\` 自动做了。

## 测试 Cookie

Cookie 可能被用户禁用。Django 提供「测试 cookie」机制:设一个测试 cookie,下次请求检查是否带回来:

\`\`\`python
# 定义函数 login_view，参数: request
def login_view(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 检查上一步设的测试 cookie
        # 条件判断：如果 request.session.test_cookie_worked()
        if request.session.test_cookie_worked():
            request.session.delete_test_cookie()  # 用完删掉
            # 正常登录逻辑...
            # 返回 redirect("/")
            return redirect("/")
        # 否则执行
        else:
            # 返回 render(request, "login.html", {"error": "请启用 Cookie"})
            return render(request, "login.html", {"error": "请启用 Cookie"})
    # 否则执行
    else:
        # 设测试 cookie
        # 调用 request.session.set_test_cookie()
        request.session.set_test_cookie()
        # 返回 render(request, "login.html")
        return render(request, "login.html")
\`\`\`

## Session 序列化

Session 数据要存到 db/cache/cookie,必须序列化。Django 默认用 JSON 序列化:

\`\`\`python
# settings.py
# 定义变量 SESSION_SERIALIZER，赋值为 "django.contrib.sessions.serializers.JSONSeri...
SESSION_SERIALIZER = "django.contrib.sessions.serializers.JSONSerializer"
\`\`\`

JSON 序列化的限制:

- 只支持 JSON 兼容类型(str/int/float/bool/list/dict/None)。
- 不支持 datetime、Decimal、bytes、自定义对象。

如果存了不兼容类型会报错。解决:存前转字符串,取后转回。

\`\`\`python
from datetime import timezone
# ❌ 不能直接存 datetime
# request.session["login_time"] = timezone.now()

# ✅ 转 ISO 字符串
# request.session["login_time"] = timezone.now().iso
request.session["login_time"] = timezone.now().isoformat()

# 取出转回
# 从 datetime 导入 datetime
from datetime import datetime
# 定义变量 login_time，赋值为 datetime.fromisoformat(request.session["login...
login_time = datetime.fromisoformat(request.session["login_time"])
\`\`\`

## 完整示例:购物车 Session 实现

\`\`\`python
# cart/cart.py
# 定义类 Cart
class Cart:
    # """购物车:基于 Session 封装"""
    """购物车:基于 Session 封装"""

    # 定义函数 __init__，参数: self, request
    def __init__(self, request):
        # """从 request.session 初始化"""
        """从 request.session 初始化"""
        # self.session = request.session
        self.session = request.session
        # 定义变量 cart，赋值为 self.session.get("cart")
        cart = self.session.get("cart")
        # 条件判断：如果 not cart
        if not cart:
            # 没购物车,建空的
            # 定义变量 cart，赋值为 self.session["cart"] = {}
            cart = self.session["cart"] = {}
        # self.cart = cart
        self.cart = cart

    # 定义函数 add，参数: self, product, quantity=1, override_quantity=False
    def add(self, product, quantity=1, override_quantity=False):
        # """添加商品到购物车"""
        """添加商品到购物车"""
        product_id = str(product.id)  # session 的 key 必须是字符串
        # 条件判断：如果 product_id not in self.cart
        if product_id not in self.cart:
            # self.cart[product_id] = {"quantity": 0, "price": s
            self.cart[product_id] = {"quantity": 0, "price": str(product.price)}
        # 条件判断：如果 override_quantity
        if override_quantity:
            # self.cart[product_id]["quantity"] = quantity
            self.cart[product_id]["quantity"] = quantity
        # 否则执行
        else:
            # self.cart[product_id]["quantity"] += quantity
            self.cart[product_id]["quantity"] += quantity
        self.save()  # 标记修改

    # 定义函数 save，参数: self
    def save(self):
        # """标记 session 已修改,确保保存"""
        """标记 session 已修改,确保保存"""
        # self.session.modified = True
        self.session.modified = True

    # 定义函数 remove，参数: self, product
    def remove(self, product):
        # """移除商品"""
        """移除商品"""
        # 定义变量 product_id，赋值为 str(product.id)
        product_id = str(product.id)
        # 条件判断：如果 product_id in self.cart
        if product_id in self.cart:
            # del self.cart[product_id]
            del self.cart[product_id]
            # 调用 self.save()
            self.save()

    # 定义函数 __iter__，参数: self
    def __iter__(self):
        # """迭代:把 id 换成 product 对象"""
        """迭代:把 id 换成 product 对象"""
        # 从 shop.models 导入 Product
        from shop.models import Product
        # 定义变量 product_ids，赋值为 self.cart.keys()
        product_ids = self.cart.keys()
        # 定义变量 products，赋值为 Product.objects.filter(id__in=product_ids)
        products = Product.objects.filter(id__in=product_ids)
        # 定义变量 cart，赋值为 self.cart.copy()
        cart = self.cart.copy()
        # 遍历 products，取 product
        for product in products:
            # cart[str(product.id)]["product"] = product
            cart[str(product.id)]["product"] = product
        # 遍历 cart.values()，取 item
        for item in cart.values():
            # item["price"] = float(item["price"])
            item["price"] = float(item["price"])
            # item["total_price"] = item["price"] * item["quanti
            item["total_price"] = item["price"] * item["quantity"]
            # 生成值: item
            yield item

    # 定义函数 __len__，参数: self
    def __len__(self):
        # """商品总数(每种数量相加)"""
        """商品总数(每种数量相加)"""
        # 返回 sum(item["quantity"] for item in self.cart.values())
        return sum(item["quantity"] for item in self.cart.values())

    # 定义函数 get_total_price，参数: self
    def get_total_price(self):
        # """总价"""
        """总价"""
        # 返回 sum(
        return sum(
            # 调用 float()
            float(item["price"]) * item["quantity"]
            # for item in self.cart.values()
            for item in self.cart.values()
        # )
        )

    # 定义函数 clear，参数: self
    def clear(self):
        # """清空购物车"""
        """清空购物车"""
        # del self.session["cart"]
        del self.session["cart"]
        # 调用 self.save()
        self.save()
\`\`\`

\`\`\`python
# cart/views.py
# 从 django.shortcuts 导入 render, redirect, get_object_or_404
from django.shortcuts import render, redirect, get_object_or_404
# 从 django.views.decorators.http 导入 require_POST
from django.views.decorators.http import require_POST
# 从 shop.models 导入 Product
from shop.models import Product
# 从 .cart 导入 Cart
from .cart import Cart
# 从 .forms 导入 CartAddForm
from .forms import CartAddForm

# 装饰器：require_POST
@require_POST
# 定义函数 cart_add，参数: request, product_id
def cart_add(request, product_id):
    # """加入购物车"""
    """加入购物车"""
    # 定义变量 cart，赋值为 Cart(request)
    cart = Cart(request)
    # 定义变量 product，赋值为 get_object_or_404(Product, id=product_id)
    product = get_object_or_404(Product, id=product_id)
    # 定义变量 form，赋值为 CartAddForm(request.POST)
    form = CartAddForm(request.POST)
    # 条件判断：如果 form.is_valid()
    if form.is_valid():
        # 定义变量 cd，赋值为 form.cleaned_data
        cd = form.cleaned_data
        # 调用 cart.add()
        cart.add(product, quantity=cd["quantity"], override_quantity=cd["override"])
    # 返回 redirect("cart_detail")
    return redirect("cart_detail")

# 装饰器：require_POST
@require_POST
# 定义函数 cart_remove，参数: request, product_id
def cart_remove(request, product_id):
    # """从购物车移除"""
    """从购物车移除"""
    # 定义变量 cart，赋值为 Cart(request)
    cart = Cart(request)
    # 定义变量 product，赋值为 get_object_or_404(Product, id=product_id)
    product = get_object_or_404(Product, id=product_id)
    # 调用 cart.remove()
    cart.remove(product)
    # 返回 redirect("cart_detail")
    return redirect("cart_detail")

# 定义函数 cart_detail，参数: request
def cart_detail(request):
    # """购物车详情"""
    """购物车详情"""
    # 定义变量 cart，赋值为 Cart(request)
    cart = Cart(request)
    # 返回 render(request, "cart/detail.html", {"cart": cart})
    return render(request, "cart/detail.html", {"cart": cart})
\`\`\`

\`\`\`python
# cart/urls.py
# 从 django.urls 导入 path
from django.urls import path
# 从 . 导入 views
from . import views

# 定义变量 app_name，赋值为 "cart"
app_name = "cart"
# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("add/<int:product_id>/", views.cart_add, name="cart_add"),
    # 调用 path()
    path("remove/<int:product_id>/", views.cart_remove, name="cart_remove"),
    # 调用 path()
    path("", views.cart_detail, name="cart_detail"),
# ]
]
\`\`\`

\`\`\`html
# <!-- templates/cart/detail.html -->
<!-- templates/cart/detail.html -->
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block title %}购物车{% endblock %}
{% block title %}购物车{% endblock %}

# {% block content %}
{% block content %}
# <h1>购物车</h1>
<h1>购物车</h1>

# {% if cart|length > 0 %}
{% if cart|length > 0 %}
    # <table>
    <table>
        # <tr>
        <tr>
            # <th>商品</th>
            <th>商品</th>
            # <th>数量</th>
            <th>数量</th>
            # <th>单价</th>
            <th>单价</th>
            # <th>小计</th>
            <th>小计</th>
            # <th>操作</th>
            <th>操作</th>
        # </tr>
        </tr>
        # {% for item in cart %}
        {% for item in cart %}
        # <tr>
        <tr>
            # <td>{{ item.product.name }}</td>
            <td>{{ item.product.name }}</td>
            # <td>{{ item.quantity }}</td>
            <td>{{ item.quantity }}</td>
            # <td>¥{{ item.price }}</td>
            <td>¥{{ item.price }}</td>
            # <td>¥{{ item.total_price }}</td>
            <td>¥{{ item.total_price }}</td>
            # <td>
            <td>
                # <form method="post" action="{% url 'cart:cart_remo
                <form method="post" action="{% url 'cart:cart_remove' item.product.id %}">
                    # {% csrf_token %}
                    {% csrf_token %}
                    # <button type="submit">移除</button>
                    <button type="submit">移除</button>
                # </form>
                </form>
            # </td>
            </td>
        # </tr>
        </tr>
        # {% endfor %}
        {% endfor %}
        # <tr>
        <tr>
            # <td colspan="3" align="right"><b>合计:</b></td>
            <td colspan="3" align="right"><b>合计:</b></td>
            # <td colspan="2"><b>¥{{ cart.get_total_price }}</b>
            <td colspan="2"><b>¥{{ cart.get_total_price }}</b></td>
        # </tr>
        </tr>
    # </table>
    </table>
    # <a href="/checkout/">去结算</a>
    <a href="/checkout/">去结算</a>
# {% else %}
{% else %}
    # <p>购物车是空的,<a href="{% url 'shop:product_list' %}">
    <p>购物车是空的,<a href="{% url 'shop:product_list' %}">去逛逛</a></p>
# {% endif %}
{% endif %}
# {% endblock %}
{% endblock %}
\`\`\`

## Session vs JWT vs Token

| 维度 | Django Session | JWT | 自定义 Token |
|---|---|---|---|
| 存储 | 服务端(db/cache) | 客户端(签名) | 服务端(db) |
| 状态 | 有状态(服务端记) | 无状态 | 有状态 |
| 注销 | flush 即可 | 难(需黑名单) | 删 token |
| 适合 | 传统 Web 站点 | API/微服务 | API |
| 安全 | 高(数据在服务端) | 中(可解密) | 高 |
| 扩展性 | 需共享 session 存储 | 天然分布式 | 需共享存储 |

Django Session 适合「传统 Web 应用」(浏览器 + 服务端渲染)。如果是前后端分离的 API,考虑 JWT(用 \`djangorestframework-simplejwt\`),但要注意 JWT 注销难题。

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 改嵌套对象不保存 | 没标记修改 | request.session.modified = True |
| Session 丢数据 | value 不可序列化 | 用 JSON 兼容类型 |
| datetime 不能存 | 序列化失败 | 转 ISO 字符串 |
| Cookie 被禁用 | 用户禁了 Cookie | 用 set_test_cookie 检测 |
| 跨域 Session 丢失 | Cookie 域问题 | 配 SESSION_COOKIE_DOMAIN |
| 生产 HTTPOnly=False | XSS 可偷 | 保持 True |
| Secure=False 生产 | 中间人可截 | 生产改 True |
| db 引擎慢 | 每次查库 | 换 cache/cached_db |
| 数据太大超 4KB | signed_cookies 限制 | 换 db/cache 引擎 |
| flush 没 flush | 用 clear | 注销要 flush 换 id |

## 设计思想

Session 体现的设计哲学是「**用服务端存储换无状态协议的有状态体验**」。HTTP 本身无状态,Session 通过「服务端存数据 + Cookie 传 id」让服务器「记住」用户。这种设计把「状态」从不可信的客户端移到可信的服务端,安全性更高(用户改不了自己的 session 数据,只能改自己的 cookie id,而 id 是随机不可猜的)。理解 Session 的关键不在 API(就一个字典),而在「数据存服务端、id 存客户端」的分工,以及不同引擎(db/cache/cookie)在「性能、持久化、容量」上的权衡。登录登出本质就是「写入 session」和「清空 session」,购物车、最近浏览、表单暂存都是 session 的典型应用。
`,
  },
];
