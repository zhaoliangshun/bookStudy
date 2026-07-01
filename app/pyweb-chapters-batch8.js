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
from django.contrib.auth.models import User

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
from django.contrib.auth import authenticate

# 校验用户名密码
user = authenticate(request, username="admin", password="secret123")
if user is not None:
    # 校验通过(密码正确 且 账户 active)
    print("OK", user)
else:
    # 用户名不存在 或 密码错 或 账户被禁用
    print("失败")
\`\`\`

注意:

- \`authenticate\` 只校验,不会登录(不创建 Session)。
- 返回 None 可能是「密码错」或「账户被禁用」(不区分,防枚举攻击)。
- \`request\` 参数可选,但建议传(自定义认证后端可能需要)。

## login():登录(创建 Session)

\`authenticate\` 通过后,调 \`login\` 把用户「写入 Session」:

\`\`\`python
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # 登录:把 user.id 写入 session
            login(request, user)
            # 跳到 ?next= 指定的页面,或首页
            next_url = request.GET.get("next", "/")
            return redirect(next_url)
        else:
            # 登录失败
            return render(request, "login.html", {"error": "用户名或密码错误"})
    return render(request, "login.html")
\`\`\`

\`login(request, user)\` 做了:

1. 把 \`user.id\` 写入 \`request.session\`。
2. 重置 Session 防止 Session 固定攻击(每次登录换新 session key)。
3. 设置 \`request.user\` 为该用户(后续视图能用)。

## logout():登出(清空 Session)

\`\`\`python
from django.contrib.auth import logout
from django.shortcuts import redirect

def logout_view(request):
    logout(request)  # 清空 session,把 user 设为 AnonymousUser
    return redirect("/")
\`\`\`

\`logout\` 清空 Session 数据,把 \`request.user\` 设为 \`AnonymousUser\`。

## is_authenticated:判断是否登录

\`\`\`python
# 视图里
if request.user.is_authenticated:
    # 已登录
    print("当前用户:", request.user.username)
else:
    # 未登录(AnonymousUser)
    print("匿名用户")
\`\`\`

\`is_authenticated\` 是属性(\`@property\`),返回布尔。\`AnonymousUser\` 和 \`User\` 都有这个属性,前者恒为 False,后者恒为 True。所以统一用 \`request.user.is_authenticated\` 判断,不用区分类型。

⚠️ 常见错误:写成 \`request.user.is_authenticated()\`(带括号)。Django 1.10 后是属性不是方法,加括号会报错。

## request.user:当前用户

\`AuthenticationMiddleware\` 把当前登录用户注入 \`request.user\`:

- 已登录 → \`User\` 对象(有 \`username\`、\`email\` 等)。
- 未登录 → \`AnonymousUser\` 对象(只有 \`id=None\`、\`is_authenticated=False\`)。

\`\`\`python
def profile(request):
    if not request.user.is_authenticated:
        return redirect("login")

    # 已登录,可以直接用
    username = request.user.username
    email = request.user.email
    is_staff = request.user.is_staff
    return render(request, "profile.html", {"user": request.user})
\`\`\`

模板里 \`{{ user }}\` 由上下文处理器自动注入,不用视图传:

\`\`\`html
{% if user.is_authenticated %}
    <p>欢迎,{{ user.username }}</p>
    <a href="{% url 'logout' %}">退出</a>
{% else %}
    <a href="{% url 'login' %}">登录</a>
{% endif %}
\`\`\`

## @login_required

最常用的权限装饰器,未登录跳转到 \`LOGIN_URL\`:

\`\`\`python
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    # 未登录用户访问会跳到 /accounts/login/?next=/dashboard/
    return render(request, "dashboard.html")
\`\`\`

类视图用 \`LoginRequiredMixin\`:

\`\`\`python
from django.contrib.auth.mixins import LoginRequiredMixin

class DashboardView(LoginRequiredMixin, View):
    # 未登录跳登录页
    ...
\`\`\`

## Password Hasher:密码哈希

Django **绝不存明文密码**。用户注册时,密码经过「哈希算法」处理后存入数据库。哈希是单向的(不能从哈希反推密码),所以即使数据库泄露,攻击者也拿不到明文密码。

Django 默认用 \`PBKDF2\`(Python 自带,无需额外依赖),也可切换更强算法:

\`\`\`python
# settings.py
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",  # 首选 Argon2(需 pip install argon2-cffi)
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",  # 备选 bcrypt(需 pip install bcrypt)
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",  # Django 默认
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]
\`\`\`

Django 按列表顺序选第一个可用的算法。换算法时,旧密码在下次登录时自动「升级」为新算法。

创建用户用 \`create_user\`(自动哈希密码):

\`\`\`python
from django.contrib.auth.models import User

# 创建用户(密码自动哈希)
user = User.objects.create_user(
    username="alice",
    email="alice@example.com",
    password="secret123",
)

# ⚠️ 绝不能用 create,密码不会哈希!
# user = User.objects.create(username="bob", password="plain")  # ❌ 危险

# 改密码:用 set_password
user.set_password("newpass456")
user.save()
\`\`\`

\`create_user\` 和 \`set_password\` 内部调 hasher 做哈希。直接 \`create(password=...)\` 存的是明文,登录不了(因为 authenticate 哈希后比对不上)。

## check_password:手动校验密码

\`\`\`python
from django.contrib.auth.hashers import check_password

# 校验明文密码是否匹配哈希(用于改密码时验证旧密码)
if check_password("oldpass", user.password):
    print("旧密码正确")
\`\`\`

\`make_password\` 哈希明文:

\`\`\`python
from django.contrib.auth.hashers import make_password

hashed = make_password("mypassword")  # 返回哈希字符串
\`\`\`

## 完整示例:登录登出视图

\`\`\`python
# accounts/views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.views.decorators.http import require_GET

def login_view(request):
    """登录"""
    if request.user.is_authenticated:
        return redirect("/")  # 已登录别再来

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # 登录成功,跳到 next 或首页
            next_url = request.GET.get("next") or request.POST.get("next") or "/"
            return redirect(next_url)
        else:
            return render(request, "registration/login.html", {
                "error": "用户名或密码错误",
                "username": username,
            })
    return render(request, "registration/login.html")

@require_GET
def logout_view(request):
    """登出(GET 触发,带 next 跳转)"""
    logout(request)
    return redirect("/")

@login_required
def change_password_view(request):
    """修改密码:验证旧密码后设新密码"""
    if request.method == "POST":
        old_password = request.POST.get("old_password")
        new_password = request.POST.get("new_password")
        confirm = request.POST.get("confirm_password")

        # 1. 校验旧密码
        if not request.user.check_password(old_password):
            return render(request, "registration/change_password.html", {
                "error": "旧密码错误",
            })
        # 2. 校验新密码一致
        if new_password != confirm:
            return render(request, "registration/change_password.html", {
                "error": "两次新密码不一致",
            })
        # 3. 设置新密码
        request.user.set_password(new_password)
        request.user.save()
        # 改密码后 session 失效,需要重新登录
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, request.user)  # 保持登录
        return redirect("profile")
    return render(request, "registration/change_password.html")
\`\`\`

\`\`\`python
# accounts/urls.py
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("change-password/", views.change_password_view, name="change_password"),
    # 用 Django 内置的密码重置/找回视图
    path("password-reset/", auth_views.PasswordResetView.as_view(), name="password_reset"),
    path("password-reset/done/", auth_views.PasswordResetDoneView.as_view(), name="password_reset_done"),
    path("reset/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("reset/done/", auth_views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),
]
\`\`\`

\`\`\`html
<!-- templates/registration/login.html -->
{% extends "base.html" %}
{% block title %}登录{% endblock %}

{% block content %}
<h1>登录</h1>

{% if error %}
    <div class="alert alert-danger">{{ error }}</div>
{% endif %}

<form method="post">
    {% csrf_token %}
    <input type="hidden" name="next" value="{{ request.GET.next }}">

    <div class="form-group">
        <label>用户名</label>
        <input type="text" name="username" value="{{ username }}" required autofocus>
    </div>

    <div class="form-group">
        <label>密码</label>
        <input type="password" name="password" required>
    </div>

    <button type="submit">登录</button>
    <a href="{% url 'password_reset' %}">忘记密码?</a>
</form>
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
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """自定义用户:在默认基础上加字段"""
    phone = models.CharField(max_length=20, blank=True, verbose_name="手机号")
    avatar = models.ImageField(upload_to="avatars/", blank=True, verbose_name="头像")
    bio = models.TextField(blank=True, verbose_name="个人简介")
    birthday = models.DateField(null=True, blank=True, verbose_name="生日")

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return self.username
\`\`\`

注册到 settings:

\`\`\`python
# settings.py
# 必须配置!否则 Django 还是认默认 User
AUTH_USER_MODEL = "users.User"
\`\`\`

\`AUTH_USER_MODEL\` 格式是 \`<app_label>.<ModelName>\`,指向你自定义的 User。

注意:

- 在**第一次 migrate 之前**就配好 \`AUTH_USER_MODEL\`。
- 配置后,Django 自带的 \`django.contrib.auth.models.User\` 不再用(但别删,内部还引用)。
- 其他 Model 引用用户用 \`settings.AUTH_USER_MODEL\`,不要直接 \`import User\`。

\`\`\`python
# blog/models.py
from django.conf import settings
from django.db import models

class Post(models.Model):
    # ❌ 不要直接 import User
    # from django.contrib.auth.models import User
    # author = models.ForeignKey(User, ...)

    # ✅ 用 settings.AUTH_USER_MODEL(字符串)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
\`\`\`

用字符串 \`settings.AUTH_USER_MODEL\` 而非直接 import,避免循环引用和迁移顺序问题。

## 方案 2:AbstractBaseUser(完全自定义)

完全自定义 User,自己定义字段、自己实现认证:

\`\`\`python
# users/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# 第 1 步:自定义 Manager(管理用户创建)
class UserManager(BaseUserManager):
    """用邮箱登录的 User Manager"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("必须填邮箱")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # 哈希密码
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("超级用户必须 is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("超级用户必须 is_superuser=True")
        return self.create_user(email, password, **extra_fields)

# 第 2 步:自定义 User
class User(AbstractBaseUser, PermissionsMixin):
    """用邮箱登录的用户模型"""

    email = models.EmailField(unique=True, verbose_name="邮箱")
    nickname = models.CharField(max_length=30, verbose_name="昵称")
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True, verbose_name="启用")
    is_staff = models.BooleanField(default=False, verbose_name="管理员")
    date_joined = models.DateTimeField(auto_now_add=True)

    # 关键:指定用哪个字段登录
    USERNAME_FIELD = "email"
    # createsuperuser 时额外必填的字段
    REQUIRED_FIELDS = ["nickname"]

    # 指定 Manager
    objects = UserManager()

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return self.email
\`\`\`

关键点:

- \`USERNAME_FIELD = "email"\`:指定用 email 登录(替代 username)。
- \`REQUIRED_FIELDS\`:\`createsuperuser\` 时除了 USERNAME_FIELD 和 password 外必填的字段。
- 必须继承 \`AbstractBaseUser\`(提供 password 哈希)+ \`PermissionsMixin\`(提供权限)。
- 必须实现 \`UserManager\` 的 \`create_user\` 和 \`create_superuser\`。

\`\`\`python
# settings.py
AUTH_USER_MODEL = "users.User"
\`\`\`

\`\`\`bash
# 创建超级用户(交互会问 email、nickname、password)
python manage.py createsuperuser
# Email: admin@example.com
# Nickname: 管理员
# Password: ********
\`\`\`

## profile app:分离用户信息

有时不想把所有用户字段塞进 User 表,可以拆「核心认证信息」和「扩展资料」:

\`\`\`python
# users/models.py
class User(AbstractUser):
    """核心:认证必需"""
    phone = models.CharField(max_length=20, blank=True)

    # 添加时返回 signal 自动创建 Profile
    pass

class Profile(models.Model):
    """扩展:非核心资料"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)

# 用 signal 自动建 Profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
\`\`\`

\`AbstractUser + Profile\` 适合「核心字段少,扩展字段多」的场景。如果只是加几个字段,直接用 \`AbstractUser\` 加字段更简单。

## settings.AUTH_USER_MODEL

引用用户模型的最佳方式:

\`\`\`python
from django.conf import settings

# 1. Model 外键
class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

# 2. 拿到 User 类(运行时)
User = settings.AUTH_USER_MODEL  # ❌ 这是字符串,不是类!
# 正确:用 get_user_model
from django.contrib.auth import get_user_model
User = get_user_model()  # ✅ 返回 User 类

# 3. 在 Form/Serializer 里
class PostForm(forms.ModelForm):
    class Meta:
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
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("邮箱必填")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, verbose_name="邮箱")
    nickname = models.CharField(max_length=30, verbose_name="昵称")
    avatar = models.ImageField(upload_to="avatars/", blank=True, default="")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname"]
    objects = UserManager()

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return f"{self.nickname} <{self.email}>"
\`\`\`

\`\`\`python
# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # 因为用 email 登录,要调整 Admin 的字段
    list_display = ("email", "nickname", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "nickname")
    ordering = ("email",)

    # 编辑页字段布局
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("个人信息", {"fields": ("nickname", "avatar")}),
        ("权限", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("重要日期", {"fields": ("last_login", "date_joined")}),
    )

    # 创建用户页字段
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "nickname", "password1", "password2"),
        }),
    )
\`\`\`

\`\`\`python
# settings.py
INSTALLED_APPS = [
    # ...
    "users",  # 注册 users 应用
]
AUTH_USER_MODEL = "users.User"
\`\`\`

\`\`\`python
# 注册/登录视图(用 email)
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

def register_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        nickname = request.POST.get("nickname")
        password = request.POST.get("password")

        from .models import User
        if User.objects.filter(email=email).exists():
            return render(request, "register.html", {"error": "邮箱已注册"})
        user = User.objects.create_user(
            email=email, password=password, nickname=nickname
        )
        login(request, user)
        return redirect("/")
    return render(request, "register.html")

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = authenticate(request, username=email, password=password)
        # 注意:authenticate 的 username 参数还是叫 username,但值传 email
        if user is not None:
            login(request, user)
            return redirect(request.GET.get("next", "/"))
        return render(request, "login.html", {"error": "邮箱或密码错误"})
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
from django.contrib.auth.models import Group, Permission, User

# 创建分组(角色)
editors, _ = Group.objects.get_or_create(name="editors")
authors, _ = Group.objects.get_or_create(name="authors")

# 给分组加权限
editors.permissions.add(
    Permission.objects.get(codename="add_post"),
    Permission.objects.get(codename="change_post"),
    Permission.objects.get(codename="delete_post"),
)
authors.permissions.add(
    Permission.objects.get(codename="add_post"),
    Permission.objects.get(codename="change_post"),
)

# 用户加入分组
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
from django.contrib.auth.models import Permission
Permission.objects.filter(content_type__app_label="blog")
\`\`\`

### 2. 自定义权限

在 Model 的 \`Meta.permissions\` 里定义:

\`\`\`python
class Post(models.Model):
    title = models.CharField(max_length=200)
    # ...

    class Meta:
        permissions = [
            ("publish_post", "可以发布文章"),
            ("unpublish_post", "可以下架文章"),
            ("moderate_comments", "可以审核评论"),
        ]
\`\`\`

\`makemigrations + migrate\` 后,这三种权限自动创建。

### 3. 检查权限

\`\`\`python
# 视图里
user = request.user

# 检查是否有某权限
if user.has_perm("blog.add_post"):
    print("可以新增文章")

# 检查多个权限(任一)
if user.has_perms(["blog.add_post", "blog.change_post"]):
    print("可以新增或修改")

# 检查某 Model 的所有权限
if user.has_module_perms("blog"):
    print("对 blog 应用有某种权限")

# 模板里
{% if perms.blog.add_post %}
    <a href="{% url 'blog:post_new' %}">写文章</a>
{% endif %}
{% if perms.blog.delete_post %}
    <button onclick="deletePost()">删除</button>
{% endif %}
\`\`\`

## @permission_required

装饰器强制视图需要某权限:

\`\`\`python
from django.contrib.auth.decorators import permission_required

@permission_required("blog.add_post", raise_exception=True)
def post_new(request):
    # 无权限直接 403(raise_exception=True)
    ...

# 多个权限(默认 AND)
@permission_required(["blog.add_post", "blog.change_post"])
def post_edit(request, pk):
    ...

# 类视图用 PermissionRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin

class PostCreateView(PermissionRequiredMixin, CreateView):
    model = Post
    permission_required = "blog.add_post"
    raise_exception = True
\`\`\`

## Group 批量授权

实际项目里,给用户逐个加权限太繁琐。用 Group 批量管理:

\`\`\`python
# 初始化角色(用 data migration 或 shell 一次性建)
from django.contrib.auth.models import Group, Permission

def init_groups():
    """初始化角色分组(在 data migration 里调用)"""

    # 编辑:能增删改所有文章
    editor_perms = Permission.objects.filter(
        codename__in=["add_post", "change_post", "delete_post",
                       "publish_post", "moderate_comments"]
    )
    editors, _ = Group.objects.get_or_create(name="editors")
    editors.permissions.set(editor_perms)

    # 作者:能增改自己的文章
    author_perms = Permission.objects.filter(
        codename__in=["add_post", "change_post"]
    )
    authors, _ = Group.objects.get_or_create(name="authors")
    authors.permissions.set(author_perms)

    # 审核员:能审核评论
    moderator_perms = Permission.objects.filter(
        codename__in=["moderate_comments"]
    )
    moderators, _ = Group.objects.get_or_create(name="moderators")
    moderators.permissions.set(moderator_perms)

# 给用户分配角色
user = User.objects.get(username="alice")
user.groups.add(authors)  # 成为作者

# 检查用户是否在某组
if user.groups.filter(name="editors").exists():
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
def post_edit(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.author != request.user:
        raise PermissionDenied  # 不是作者,拒绝
    # ...
\`\`\`

### 2. django-guardian(对象级权限库)

\`\`\`bash
pip install django-guardian
\`\`\`

\`\`\`python
# settings.py
INSTALLED_APPS = [
    # ...
    "guardian",
]
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",  # 默认
    "guardian.backends.ObjectPermissionBackend",  # 加对象级
)

# 给用户对某对象的权限
from guardian.shortcuts import assign_perm, remove_perm, get_objects_for_user

post = Post.objects.get(pk=1)
user = request.user

# 赋权:alice 能改 post 1
assign_perm("change_post", user, post)

# 检查
user.has_perm("change_post", post)  # True

# 查询 alice 能改的所有 post
editable = get_objects_for_user(user, "blog.change_post")

# 移除权限
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
user.user_permissions.add(Permission.objects.get(codename="delete_post"))

# 用户最终权限 = 自身权限 ∪ 所有组权限
user.get_all_permissions()
\`\`\`

设计建议:

- **角色稳定、用户多** → 用 Group(角色)+ 用户入组。
- **个别特殊授权** → 直接给用户加权限(覆盖组)。
- **每条记录不同权限** → django-guardian 对象级。

## 完整示例:编辑权限只有作者和编辑组

\`\`\`python
# blog/decorators.py
from functools import wraps
from django.core.exceptions import PermissionDenied

def can_edit_post(view_func):
    """只有文章作者 或 editors 组成员能编辑"""
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        pk = kwargs.get("pk")
        from blog.models import Post
        from django.shortcuts import get_object_or_404
        post = get_object_or_404(Post, pk=pk)

        is_author = post.author == request.user
        is_editor = request.user.groups.filter(name="editors").exists()
        is_superuser = request.user.is_superuser

        if not (is_author or is_editor or is_superuser):
            raise PermissionDenied("只有作者或编辑能修改")

        return view_func(request, *args, **kwargs)
    return _wrapped

def can_publish_post(view_func):
    """只有 editors 组能发布"""
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not (request.user.groups.filter(name="editors").exists()
                or request.user.is_superuser):
            raise PermissionDenied("需要编辑权限才能发布")
        return view_func(request, *args, **kwargs)
    return _wrapped
\`\`\`

\`\`\`python
# blog/views.py
from django.contrib.auth.decorators import login_required, permission_required
from django.views.decorators.http import require_POST
from .decorators import can_edit_post, can_publish_post

@login_required
@permission_required("blog.add_post", raise_exception=True)
def post_new(request):
    # 需登录 + 有 add_post 权限
    ...

@login_required
@can_edit_post
def post_edit(request, pk):
    # 需登录 + 是作者或编辑组成员
    ...

@login_required
@can_edit_post
@require_POST
def post_delete(request, pk):
    # 删除:作者或编辑,且必须是 POST
    ...

@login_required
@can_publish_post
@require_POST
def post_publish(request, pk):
    # 发布:只有编辑组
    post = get_object_or_404(Post, pk=pk)
    post.status = "published"
    post.save()
    return redirect("blog:post_detail", pk=post.pk)
\`\`\`

\`\`\`python
# 模板里按权限显示按钮
{% extends "base.html" %}
{% block content %}
<article>
    <h1>{{ post.title }}</h1>
    <div>{{ post.content }}</div>

    {% if user.is_authenticated %}
        {% if perms.blog.change_post and post.author == user %}
            <a href="{% url 'blog:post_edit' post.pk %}">编辑</a>
        {% endif %}
        {% if perms.blog.delete_post and post.author == user %}
            <a href="{% url 'blog:post_delete' post.pk %}">删除</a>
        {% endif %}
        {% if perms.blog.publish_post %}
            <form method="post" action="{% url 'blog:post_publish' post.pk %}">
                {% csrf_token %}
                <button type="submit">发布</button>
            </form>
        {% endif %}
    {% endif %}
</article>
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
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
\`\`\`

\`signed_cookies\` 比较特殊:数据存客户端(加密签名),不占服务端存储,但**不能存敏感数据**(虽然签名防篡改,但内容可被解密看到),且 Cookie 大小限制 4KB。

## request.session:字典接口

Session 通过 \`request.session\` 访问,行为像字典:

\`\`\`python
def view(request):
    # 设置
    request.session["key"] = "value"
    request.session["user_id"] = 42
    request.session["cart"] = [{"id": 1, "qty": 2}]

    # 读取(带默认值)
    user_id = request.session.get("user_id", 0)  # 不存在返回 0
    val = request.session["user_id"]              # 不存在抛 KeyError

    # 删除
    del request.session["key"]
    request.session.pop("key", None)  # 安全删除

    # 判断存在
    if "user_id" in request.session:
        ...

    # 清空所有
    request.session.clear()

    # 键值遍历
    for key in request.session.keys():
        ...
\`\`\`

注意:

- session 的 key 和 value 必须能被 JSON 序列化(字符串、数字、列表、字典、布尔)。**不能存 Python 对象、datetime(用 ISO 字符串)、Model 实例**。
- 修改「可变对象」(如列表)后要显式标记修改:\`request.session.modified = True\`,否则可能不保存。

\`\`\`python
# ❌ 修改嵌套对象可能不保存
cart = request.session.get("cart", [])
cart.append({"id": 2, "qty": 1})
request.session["cart"] = cart  # 重新赋值才保存

# 或显式标记
request.session.modified = True
\`\`\`

## Session 过期配置

\`\`\`python
# settings.py
# Session Cookie 有效期(秒),默认 2 周
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14  # 14 天

# 浏览器关闭时是否过期(False = 浏览器关就过期)
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Cookie 的域名(None = 当前域)
SESSION_COOKIE_DOMAIN = None

# 是否仅 HTTPS 传输(False 开发用,生产 True)
SESSION_COOKIE_SECURE = False  # 生产改 True

# 是否仅 HTTP 访问(防 JS 读取,防 XSS 偷)
SESSION_COOKIE_HTTPONLY = True  # 默认 True,建议保持

# Cookie 名(默认 sessionid)
SESSION_COOKIE_NAME = "sessionid"

# 同站策略(Lax/Strict/None),防 CSRF
SESSION_COOKIE_SAMESITE = "Lax"
\`\`\`

## flush():清空 Session 并换 id

\`clear()\` 只清数据,\`flush()\` 清数据 + 重新生成 session id(防 session 固定攻击):

\`\`\`python
from django.contrib.auth import logout

def logout_view(request):
    logout(request)  # 内部调 flush
    # 或手动:
    # request.session.flush()
    return redirect("/")
\`\`\`

登录时也要换 id(防固定攻击),Django 的 \`login()\` 自动做了。

## 测试 Cookie

Cookie 可能被用户禁用。Django 提供「测试 cookie」机制:设一个测试 cookie,下次请求检查是否带回来:

\`\`\`python
def login_view(request):
    if request.method == "POST":
        # 检查上一步设的测试 cookie
        if request.session.test_cookie_worked():
            request.session.delete_test_cookie()  # 用完删掉
            # 正常登录逻辑...
            return redirect("/")
        else:
            return render(request, "login.html", {"error": "请启用 Cookie"})
    else:
        # 设测试 cookie
        request.session.set_test_cookie()
        return render(request, "login.html")
\`\`\`

## Session 序列化

Session 数据要存到 db/cache/cookie,必须序列化。Django 默认用 JSON 序列化:

\`\`\`python
# settings.py
SESSION_SERIALIZER = "django.contrib.sessions.serializers.JSONSerializer"
\`\`\`

JSON 序列化的限制:

- 只支持 JSON 兼容类型(str/int/float/bool/list/dict/None)。
- 不支持 datetime、Decimal、bytes、自定义对象。

如果存了不兼容类型会报错。解决:存前转字符串,取后转回。

\`\`\`python
# ❌ 不能直接存 datetime
# request.session["login_time"] = timezone.now()

# ✅ 转 ISO 字符串
request.session["login_time"] = timezone.now().isoformat()

# 取出转回
from datetime import datetime
login_time = datetime.fromisoformat(request.session["login_time"])
\`\`\`

## 完整示例:购物车 Session 实现

\`\`\`python
# cart/cart.py
class Cart:
    """购物车:基于 Session 封装"""

    def __init__(self, request):
        """从 request.session 初始化"""
        self.session = request.session
        cart = self.session.get("cart")
        if not cart:
            # 没购物车,建空的
            cart = self.session["cart"] = {}
        self.cart = cart

    def add(self, product, quantity=1, override_quantity=False):
        """添加商品到购物车"""
        product_id = str(product.id)  # session 的 key 必须是字符串
        if product_id not in self.cart:
            self.cart[product_id] = {"quantity": 0, "price": str(product.price)}
        if override_quantity:
            self.cart[product_id]["quantity"] = quantity
        else:
            self.cart[product_id]["quantity"] += quantity
        self.save()  # 标记修改

    def save(self):
        """标记 session 已修改,确保保存"""
        self.session.modified = True

    def remove(self, product):
        """移除商品"""
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]
            self.save()

    def __iter__(self):
        """迭代:把 id 换成 product 对象"""
        from shop.models import Product
        product_ids = self.cart.keys()
        products = Product.objects.filter(id__in=product_ids)
        cart = self.cart.copy()
        for product in products:
            cart[str(product.id)]["product"] = product
        for item in cart.values():
            item["price"] = float(item["price"])
            item["total_price"] = item["price"] * item["quantity"]
            yield item

    def __len__(self):
        """商品总数(每种数量相加)"""
        return sum(item["quantity"] for item in self.cart.values())

    def get_total_price(self):
        """总价"""
        return sum(
            float(item["price"]) * item["quantity"]
            for item in self.cart.values()
        )

    def clear(self):
        """清空购物车"""
        del self.session["cart"]
        self.save()
\`\`\`

\`\`\`python
# cart/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from shop.models import Product
from .cart import Cart
from .forms import CartAddForm

@require_POST
def cart_add(request, product_id):
    """加入购物车"""
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    form = CartAddForm(request.POST)
    if form.is_valid():
        cd = form.cleaned_data
        cart.add(product, quantity=cd["quantity"], override_quantity=cd["override"])
    return redirect("cart_detail")

@require_POST
def cart_remove(request, product_id):
    """从购物车移除"""
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.remove(product)
    return redirect("cart_detail")

def cart_detail(request):
    """购物车详情"""
    cart = Cart(request)
    return render(request, "cart/detail.html", {"cart": cart})
\`\`\`

\`\`\`python
# cart/urls.py
from django.urls import path
from . import views

app_name = "cart"
urlpatterns = [
    path("add/<int:product_id>/", views.cart_add, name="cart_add"),
    path("remove/<int:product_id>/", views.cart_remove, name="cart_remove"),
    path("", views.cart_detail, name="cart_detail"),
]
\`\`\`

\`\`\`html
<!-- templates/cart/detail.html -->
{% extends "base.html" %}
{% block title %}购物车{% endblock %}

{% block content %}
<h1>购物车</h1>

{% if cart|length > 0 %}
    <table>
        <tr>
            <th>商品</th>
            <th>数量</th>
            <th>单价</th>
            <th>小计</th>
            <th>操作</th>
        </tr>
        {% for item in cart %}
        <tr>
            <td>{{ item.product.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>¥{{ item.price }}</td>
            <td>¥{{ item.total_price }}</td>
            <td>
                <form method="post" action="{% url 'cart:cart_remove' item.product.id %}">
                    {% csrf_token %}
                    <button type="submit">移除</button>
                </form>
            </td>
        </tr>
        {% endfor %}
        <tr>
            <td colspan="3" align="right"><b>合计:</b></td>
            <td colspan="2"><b>¥{{ cart.get_total_price }}</b></td>
        </tr>
    </table>
    <a href="/checkout/">去结算</a>
{% else %}
    <p>购物车是空的,<a href="{% url 'shop:product_list' %}">去逛逛</a></p>
{% endif %}
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
