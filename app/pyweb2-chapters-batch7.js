// =============================================================
// Python Web 后端开发教程 - 第 7 批章节（Django 框架 6 章）
// -------------------------------------------------------------
// 本批为「Django 框架」主题，中等篇幅，覆盖 Django 全栈框架核心机制：
//   1. pyweb2-django-intro     : Django 简介与项目结构
//   2. pyweb2-django-models    : Django ORM 与模型
//   3. pyweb2-django-views     : 视图、URL 路由与 CBV
//   4. pyweb2-django-templates : 模板系统与表单
//   5. pyweb2-django-auth      : 认证系统与权限
//   6. pyweb2-django-admin     : Admin 后台与部署
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：Django 简介与项目结构
  // ============================================================
  {
    id: "pyweb2-django-intro",
    group: "Django 框架",
    icon: "🎯",
    title: "Django 简介与项目结构",
    content: `## 一、Django 是什么

Django（发音 JANG-oh，不发音 D）是一个用 Python 编写的**开源全栈 Web 框架**，2005 年由 Adrian Holovaty 和 Simon Willison 在堪萨斯州劳伦斯的一份报纸编辑部创建，并以爵士吉他手 Django Reinhardt 命名。它贯彻 "Batteries Included"（自带电池）的设计哲学，几乎提供了构建一个完整 Web 应用所需的所有组件：ORM、模板、表单、认证、Admin 后台、缓存、信号、中间件……开箱即用。

一句话定位：**Django 是一个让 Web 开发「又快又全」的 Python 全栈框架，适合内容型、业务型网站，特别强调「不要重复自己（DRY）」。**

### 1. Django 的设计哲学

Django 的几个核心原则决定了它今天的样貌：

- **Batteries Included（自带电池）**：常见需求（认证、后台、表单、CSRF、Session）框架都内置好了，不用东拼西凑第三方库。这是 Django 与 Flask 的根本区别——Flask 只给你路由和请求响应，其他全靠扩展；Django 给你全套。
- **DRY（Don't Repeat Yourself，不要重复自己）**：每个概念只在一处定义。比如模型定义了字段，表单、Admin、序列化器都能从模型推导，不用重写。
- **MTV（Model-Template-View）**：Django 自己的架构变体，本质就是 MVC，只是叫法不同（见下文）。
- **Explicit is better than implicit（显式优于隐式）**：配置文件、URL 路由都写得很显式，少点魔法，多点可读性。
- **Loosely Coupled（松耦合）**：各层之间尽量独立，模型不依赖模板，视图不依赖具体数据库，方便替换。

### 2. Django 适合做什么

| 场景 | 是否适合 | 说明 |
| --- | --- | --- |
| 内容型网站（CMS、博客、新闻） | ⭐⭐⭐⭐⭐ | Django 诞生于新闻网站，Admin 后台天生为内容管理设计 |
| 业务后台系统（CRM、ERP、OA） | ⭐⭐⭐⭐⭐ | 表单、ORM、权限完备，开发效率高 |
| REST API 后端 | ⭐⭐⭐⭐ | 配合 Django REST Framework 强大 |
| 实时通信（聊天、推送） | ⭐⭐ | 异步支持较新（Django 3.1+），不如 FastAPI/Node |
| 高并发 IO 密集型服务 | ⭐⭐ | 同步为主，IO 密集场景性能不如异步框架 |
| 单页应用后端 + GraphQL | ⭐⭐⭐⭐ | 配合 graphene-django 等可用 |

## 二、MTV 模式 vs MVC

学过 Java/PHP 的同学一定听过 **MVC（Model-View-Controller）**。Django 用的是它自己的变体叫 **MTV（Model-Template-View）**，本质一样，只是改了名字和职责划分。

### 1. 三层职责对照

| 传统 MVC | Django MTV | 职责 | Django 实例 |
| --- | --- | --- | --- |
| Model（模型） | Model | 数据层，定义表结构和操作 | \`models.py\` 里的类 |
| View（视图） | Template | 表现层，渲染 HTML | \`templates/*.html\` |
| Controller（控制器） | View | 业务逻辑层，处理请求 | \`views.py\` 里的函数/类 |

注意：Django 的 "View" 对应 MVC 的 "Controller"，Django 的 "Template" 对应 MVC 的 "View"。名字换了，活还是那些活。

### 2. 为什么要改名

Django 团队认为：传统 MVC 里 Controller 这个词被滥用了——大多数所谓的 "Controller" 其实只做了「把请求分发给对应函数」的事，真正的逻辑都在那个函数里。于是 Django 干脆把分发逻辑交给框架（URLconf），把处理请求的函数直接叫 View，把渲染 HTML 的模板叫 Template，更直白。

### 3. 一次请求的完整流程

\`\`\`text
浏览器请求 /articles/2024/
   │
   ▼
[1] Django 接收 HTTP 请求，构造 HttpRequest 对象
   │
   ▼
[2] URLconf（urls.py）按顺序匹配路径 /articles/2024/
   │   path("articles/<int:year>/", views.article_list)
   ▼
[3] 调用对应视图函数 views.article_list(request, year=2024)
   │
   ▼
[4] 视图调用 Model（models.py）从数据库取数据
   │   Article.objects.filter(pub_date__year=2024)
   ▼
[5] 视图把数据传给 Template（templates/article_list.html）
   │   render(request, "article_list.html", {"articles": articles})
   ▼
[6] Template 渲染成 HTML 字符串
   │
   ▼
[7] 包装成 HttpResponse 返回给浏览器
\`\`\`

## 三、安装与项目创建

### 1. 安装 Django

强烈建议用虚拟环境隔离依赖：

\`\`\`bash
# 创建并激活虚拟环境
python -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\\Scripts\\activate      # Windows

# 安装 Django（最新稳定版，目前是 5.x）
pip install django

# 查看版本
python -m django --version
# 输出类似：5.0.2
\`\`\`

Django 的版本策略：每 8 个月一个 minor 版本（如 5.0、5.1），每个 LTS（长期支持）版本维护 3 年。生产环境建议跟 LTS（如 4.2 LTS、5.2 LTS）。

### 2. 创建项目

Django 用 \`django-admin\` 命令创建项目骨架：

\`\`\`bash
# 在当前目录创建一个名为 mysite 的项目
django-admin startproject mysite

# 也可以在指定目录下创建，项目名和目录名分离
django-admin startproject mysite /path/to/project_root
\`\`\`

执行后生成如下结构：

\`\`\`text
mysite/                  # 项目根目录（容器，可改名）
├── manage.py            # 命令行工具（入口），不修改
└── mysite/              # 项目包（与项目同名，存放配置）
    ├── __init__.py      # 空文件，标识这是个 Python 包
    ├── settings.py      # 项目配置文件（核心）
    ├── urls.py          # 根 URL 路由配置
    ├── asgi.py          # ASGI 入口（异步部署用，如 uvicorn）
    └── wsgi.py          # WSGI 入口（同步部署用，如 gunicorn）
\`\`\`

> 注意区分「项目根目录」和「项目包目录」。manage.py 在根目录，settings.py 在包目录里。

### 3. 创建应用

Django 里「项目」和「应用」是两个层次的概念：

- **项目（Project）**：一整套配置和应用的集合，对应一个网站。
- **应用（App）**：一个可复用的功能模块，比如博客、论坛、投票。一个项目可以包含多个应用，一个应用也可以被多个项目复用。

\`\`\`bash
# 进入项目根目录
cd mysite

# 创建一个名为 blog 的应用
python manage.py startapp blog
\`\`\`

生成的应用结构：

\`\`\`text
blog/
├── __init__.py
├── admin.py       # Admin 后台注册配置
├── apps.py        # 应用配置类（AppConfig）
├── migrations/    # 数据库迁移文件目录（自动生成）
│   └── __init__.py
├── models.py      # 数据模型定义
├── tests.py       # 单元测试
└── views.py       # 视图函数/类
\`\`\`

应用创建后，必须在 \`settings.py\` 的 \`INSTALLED_APPS\` 里注册才能生效：

\`\`\`python
# mysite/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",        # 内置 Admin 后台
    "django.contrib.auth",         # 认证系统
    "django.contrib.contenttypes", # 内容类型框架
    "django.contrib.sessions",     # Session 支持
    "django.contrib.messages",     # 消息框架
    "django.contrib.staticfiles",  # 静态文件管理
    # 第三方应用...
    "blog",                        # ← 我们自己的应用，加在这里
]
\`\`\`

## 四、settings.py 核心配置

\`settings.py\` 是 Django 的中枢神经。常用的配置项：

\`\`\`python
# mysite/settings.py
import os
from pathlib import Path

# 项目根目录（Django 3.x+ 推荐用 pathlib）
BASE_DIR = Path(__file__).resolve().parent.parent

# 密钥：用于签名 cookie、CSRF token 等，绝对不能泄露
SECRET_KEY = "django-insecure-xxxxxxxxxxxxx"

# 调试模式：开发 True，生产必须 False
DEBUG = True

# 允许访问的 Host：生产环境必须配置具体域名
ALLOWED_HOSTS = []

# 已安装应用（见上）
INSTALLED_APPS = [...]

# 中间件：请求/响应处理的钩子链
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# 根 URL 配置
ROOT_URLCONF = "mysite.urls"

# 模板配置
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],   # 全局模板目录
        "APP_DIRS": True,                    # 自动从各应用的 templates/ 找模板
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# 数据库配置：默认 SQLite，生产换 PostgreSQL/MySQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# 密码哈希算法（顺序代表优先级）
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

# 语言和时区
LANGUAGE_CODE = "zh-hans"     # 简体中文
TIME_ZONE = "Asia/Shanghai"   # 北京时间
USE_I18N = True               # 启用国际化
USE_TZ = True                 # 启用时区感知

# 静态文件 URL 前缀和目录
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]   # 开发时静态文件目录

# 默认主键字段类型（Django 3.2+）
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
\`\`\`

## 五、启动开发服务器

Django 内置一个轻量开发服务器，禁止用于生产：

\`\`\`bash
# 默认 127.0.0.1:8000
python manage.py runserver

# 指定端口
python manage.py runserver 8080

# 监听所有网卡（局域网可访问）
python manage.py runserver 0.0.0.0:8000

# 自动重载：默认开启，改代码自动重启
\`\`\`

开发服务器特点：

- 单线程、自动重载（基于文件监视）
- 不稳定、性能差，**仅用于开发**
- 每次请求都会检查代码是否有变动，有则重启
- 不支持 HTTPS（生产用 Nginx 反代 + Gunicorn）

## 六、第一个 Hello World 视图

### 1. 写视图函数

\`\`\`python
# blog/views.py
from django.http import HttpResponse

# 视图函数：接收 HttpRequest，返回 HttpResponse
def hello(request):
    """最简单的 Hello World 视图"""
    # request 是 HttpRequest 对象，包含请求的所有信息
    # method、GET、POST、META、COOKIES、session 等
    name = request.GET.get("name", "World")  # 从查询参数取 name，默认 World
    return HttpResponse(f"Hello, {name}!")   # 返回字符串响应
\`\`\`

### 2. 配置 URL

\`\`\`python
# blog/urls.py（应用级 URL，需要自己创建）
from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello, name="hello"),  # name 用于 reverse 反查
]
\`\`\`

\`\`\`python
# mysite/urls.py（项目级 URL，根路由）
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),         # Admin 后台
    path("blog/", include("blog.urls")),     # 把 /blog/ 开头的请求转给 blog 应用的 urls
]
\`\`\`

\`include\` 的作用是把请求路径进一步分发到子应用的 URLconf，类似 Nginx 的 location 反代。

### 3. 测试访问

启动服务器后访问：

\`\`\`text
http://127.0.0.1:8000/blog/hello/             → Hello, World!
http://127.0.0.1:8000/blog/hello/?name=Django → Hello, Django!
\`\`\`

### 4. 用 path 转换器捕获路径参数

\`\`\`python
# blog/urls.py
urlpatterns = [
    # <int:article_id> 表示匹配整数，传给视图的 article_id 参数
    path("articles/<int:article_id>/", views.article_detail),

    # <slug:tag> 匹配 slug 字符串（字母数字下划线连字符）
    path("tags/<slug:tag>/", views.posts_by_tag),

    # <str:username> 匹配任意非空字符串（不含 /）
    path("u/<str:username>/", views.user_profile),
]
\`\`\`

内置转换器：\`str\`（默认）、\`int\`、\`slug\`、\`uuid\`、\`path\`（含 /）。

### 5. 用 re_path 写正则路由

复杂场景下 \`path\` 转换器不够用，可以用 \`re_path\` 写正则：

\`\`\`python
from django.urls import re_path

urlpatterns = [
    # 匹配 /2024/03/15/ 这种日期格式
    re_path(r"^articles/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})/$",
            views.article_by_date),
]
\`\`\`

正则命名分组 \`(?P<name>pattern)\` 会作为关键字参数传给视图。

## 七、小结

- Django 是 "batteries included" 的全栈框架，适合内容型、业务型网站。
- MTV 是 Django 版的 MVC：Model（数据）、Template（渲染）、View（逻辑）。
- 项目（Project）是配置集合，应用（App）是功能模块，一个项目可包含多个应用。
- \`django-admin startproject\` 创建项目，\`python manage.py startapp\` 创建应用。
- \`settings.py\` 是配置中枢，\`INSTALLED_APPS\` 必须注册应用。
- 开发用 \`runserver\`，生产用 Gunicorn/uWSGI。
- 视图函数接收 \`HttpRequest\` 返回 \`HttpResponse\`，URL 用 \`path\`/\`re_path\` 配置。`,
  },

  // ============================================================
  // 第 2 章：Django ORM 与模型
  // ============================================================
  {
    id: "pyweb2-django-models",
    group: "Django 框架",
    icon: "🗃️",
    title: "Django ORM 与模型",
    content: `## 一、模型层做什么

模型（Model）是 Django ORM 的核心。它做三件事：

1. **定义数据结构**：用 Python 类描述数据库表，每个属性对应一个字段。
2. **生成 SQL**：根据模型自动生成建表语句（DDL），无需手写 SQL。
3. **提供查询 API**：用 Python 对象方法操作数据库（增删改查），不用拼 SQL 字符串。

ORM 的核心价值：**用 Python 代码替代 SQL，避免手写 SQL 的繁琐和安全风险（SQL 注入），同时获得数据库无关性（换数据库不改代码）。**

代价：复杂查询 ORM 写起来比 SQL 别扭，性能也不如手写 SQL。所以 Django 也允许混用——简单查询用 ORM，复杂查询用 \`raw()\` 或直接执行 SQL。

## 二、定义模型

每个模型类继承 \`django.db.models.Model\`，必须放在 \`models.py\` 里。Django 会自动创建一个名为 \`id\` 的自增主键（除非你自定义主键）。

\`\`\`python
# blog/models.py
from django.db import models

class Category(models.Model):
    """文章分类"""
    # CharField：字符串，必须指定 max_length
    name = models.CharField("分类名称", max_length=50, unique=True)
    # TextField：长文本，不限长度
    description = models.TextField("描述", blank=True, default="")

    class Meta:
        verbose_name = "分类"            # 单数名
        verbose_name_plural = "分类"     # 复数名（中文不分单复数）

    def __str__(self):
        return self.name


class Article(models.Model):
    """文章"""
    # 标题
    title = models.CharField("标题", max_length=200)
    # 正文
    content = models.TextField("正文")
    # 发布时间：auto_now_add=True 表示创建时自动设为当前时间
    pub_date = models.DateTimeField("发布时间", auto_now_add=True)
    # 更新时间：auto_now=True 表示每次 save 时自动更新
    updated_at = models.DateTimeField("更新时间", auto_now=True)
    # 外键：关联 Category，一篇文章属于一个分类
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,    # 删除分类时级联删除文章
        related_name="articles",     # 反查：category.articles 拿所有文章
        verbose_name="分类",
    )
    # 状态字段：用 choices 限定取值
    STATUS_CHOICES = [
        ("draft", "草稿"),
        ("published", "已发布"),
        ("archived", "已归档"),
    ]
    status = models.CharField(
        "状态", max_length=10, choices=STATUS_CHOICES, default="draft"
    )
    # 浏览量
    views = models.PositiveIntegerField("浏览量", default=0)

    class Meta:
        ordering = ["-pub_date"]    # 默认按发布时间倒序
        verbose_name = "文章"
        verbose_name_plural = "文章"

    def __str__(self):
        return self.title
\`\`\`

\`__str__\` 方法很重要——Admin 后台、print、shell 显示都用它，必须返回字符串。

## 三、字段类型

Django 内置几十种字段类型，对应不同的数据库列类型和 HTML 表单控件：

### 1. 常用字段一览

| 字段类型 | 用途 | 对应 SQL（PostgreSQL） |
| --- | --- | --- |
| \`CharField\` | 短字符串（必须 \`max_length\`） | \`varchar(n)\` |
| \`TextField\` | 长文本 | \`text\` |
| \`IntegerField\` | 整数 | \`integer\` |
| \`BigIntegerField\` | 大整数（64 位） | \`bigint\` |
| \`PositiveIntegerField\` | 正整数 | \`integer\`（带检查约束） |
| \`FloatField\` | 浮点数 | \`double precision\` |
| \`DecimalField\` | 定点小数（金额） | \`numeric(p, s)\` |
| \`BooleanField\` | 布尔 | \`boolean\` |
| \`DateField\` | 日期 | \`date\` |
| \`DateTimeField\` | 日期时间 | \`timestamp\` |
| \`EmailField\` | 邮箱（带格式校验） | \`varchar\` |
| \`URLField\` | URL | \`varchar\` |
| \`UUIDField\` | UUID | \`uuid\` |
| \`FileField\` | 文件上传 | \`varchar\`（存路径） |
| \`ImageField\` | 图片上传（含 Pillow 校验） | \`varchar\` |
| \`JSONField\` | JSON 数据（Django 3.1+） | \`json\` |

### 2. 金额字段为什么用 DecimalField 不用 FloatField

\`\`\`python
# 错误：用 Float 存金额会有精度丢失
# 0.1 + 0.2 = 0.30000000000000004
price = models.FloatField()  # 别这样

# 正确：用 DecimalField
price = models.DecimalField(
    "价格", max_digits=10, decimal_places=2
)
# max_digits：总位数（含小数），decimal_places：小数位数
# 上例最大可表示 99999999.99
\`\`\`

DecimalField 在数据库里用 \`numeric\` 类型存储，精度无损；Python 里用 \`decimal.Decimal\` 运算，金融场景必选。

## 四、字段选项

所有字段都支持的通用选项：

\`\`\`python
class Example(models.Model):
    # null=True：数据库允许 NULL
    # blank=True：表单验证允许空（Django 表单层）
    # default：默认值
    name = models.CharField(max_length=100, null=False, blank=False)

    # null vs blank 区别：
    # null 是数据库层（NULL），blank 是表单层（空字符串）
    # 字符串字段习惯 null=True 配合 default=""
    nickname = models.CharField(max_length=50, null=True, blank=True, default="")

    # choices：限定取值，Admin 显示成下拉框
    GENDER = [("M", "男"), ("F", "女"), ("O", "其他")]
    gender = models.CharField(max_length=1, choices=GENDER, default="M")

    # unique=True：唯一约束（数据库层）
    email = models.EmailField(unique=True)

    # db_index=True：建索引，加速查询
    phone = models.CharField(max_length=20, db_index=True)

    # editable=False：不在 Admin/表单里显示
    created_by = models.ForeignKey("auth.User", on_delete=models.SET_NULL,
                                   null=True, editable=False)

    # help_text：表单提示文字
    age = models.IntegerField(help_text="周岁年龄")

    # verbose_name：第一个位置参数，人类可读名
    bio = models.TextField("个人简介", blank=True)
\`\`\`

> 经验：\`null=True, blank=True\` 经常成对出现，但字符串字段（CharField/TextField）建议只用 \`blank=True\` 配 \`default=""\`，避免 NULL 和空字符串混存的尴尬。

## 五、关系字段

Django 提供三种关系字段对应数据库的三种关系：

### 1. ForeignKey（一对多）

最常见。比如「一篇文章有多条评论」：

\`\`\`python
class Comment(models.Model):
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,      # 关键参数：被关联对象删除时的行为
        related_name="comments",       # 反查字段：article.comments.all()
        related_query_name="comment",  # 反查时的查询名：article.comment_set
        null=True,
        blank=True,
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# on_delete 可选值：
# - CASCADE：级联删除（删文章，评论一起删）
# - PROTECT：禁止删除（有评论就不让删文章）
# - SET_NULL：设为 NULL（必须 null=True）
# - SET_DEFAULT：设为默认值（必须 default=...）
# - DO_NOTHING：什么都不做（会导致数据库完整性错误，慎用）
# - SET()：设为指定值或函数返回值
# - RESTRICT：类似 PROTECT，但允许级联链路上的删除
\`\`\`

### 2. OneToOneField（一对一）

类似 ForeignKey 加 \`unique=True\`，但反查直接返回对象而不是查询集。常用于「扩展 User 模型」：

\`\`\`python
class UserProfile(models.Model):
    user = models.OneToOneField(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.URLField(blank=True)
    bio = models.TextField(blank=True)

# 反查：user.profile.avatar（直接对象，不是 .all()）
\`\`\`

### 3. ManyToManyField（多对多）

比如「文章和标签」——一篇文章有多个标签，一个标签也对应多篇文章：

\`\`\`python
class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)

class Article(models.Model):
    # ... 其他字段
    tags = models.ManyToManyField(
        Tag,
        related_name="articles",
        blank=True,
    )

# 使用：
# article.tags.add(tag1, tag2)         # 添加
# article.tags.remove(tag1)            # 移除
# article.tags.clear()                 # 清空
# article.tags.set([tag1, tag2])       # 重置
# article.tags.all()                   # 查询所有标签
# tag.articles.all()                   # 反查：该标签下所有文章
\`\`\`

Django 会自动创建一张中间表 \`blog_article_tags\`。如果中间表需要额外字段（比如添加时间、添加人），用 \`through\` 指定自定义中间表：

\`\`\`python
class ArticleTag(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey("auth.User", on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = [("article", "tag")]   # 联合唯一约束

class Article(models.Model):
    tags = models.ManyToManyField(Tag, through=ArticleTag, blank=True)
\`\`\`

## 六、Meta 选项

\`Meta\` 内部类控制模型的元信息：

\`\`\`python
class Article(models.Model):
    # ...

    class Meta:
        # 默认排序：发布时间倒序，相同则按 id 倒序
        ordering = ["-pub_date", "-id"]
        # 自定义表名（默认是 app_model，如 blog_article）
        db_table = "blog_articles"
        # 人类可读名
        verbose_name = "文章"
        verbose_name_plural = "文章列表"
        # 联合唯一约束
        unique_together = [("title", "pub_date")]
        # 索引
        indexes = [
            models.Index(fields=["status"], name="idx_status"),
            models.Index(fields=["-pub_date"], name="idx_pub_date"),
        ]
        # 抽象基类：不建表，子类继承字段
        # abstract = True
        # 排序时 NULL 值放最后
        # order_with_respect_to = "category"
\`\`\`

> 注意：\`ordering\` 会给所有查询默认加 ORDER BY，如果你不需要排序，用 \`.all().order_by()\` 显式清除。

## 七、迁移

模型改了不会立刻影响数据库，需要走「迁移」流程把模型变化同步到数据库。

### 1. 迁移三步走

\`\`\`bash
# 第 1 步：检测模型变化，生成迁移文件（在 migrations/ 目录）
python manage.py makemigrations

# 第 2 步：把迁移应用到数据库（执行 SQL）
python manage.py migrate

# 第 3 步（可选）：查看迁移会执行哪些 SQL
python manage.py sqlmigrate blog 0001
\`\`\`

### 2. 迁移文件的本质

\`\`\`python
# blog/migrations/0001_initial.py（自动生成）
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True

    dependencies = []    # 依赖哪些前置迁移

    operations = [
        migrations.CreateModel(
            name="Article",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=200)),
                # ...
            ],
        ),
    ]
\`\`\`

迁移文件就是一份「数据库变更脚本」，可以提交到 Git。团队协作时，每个人拉到迁移文件后执行 \`migrate\` 即可同步结构。

### 3. 常用迁移命令

\`\`\`bash
python manage.py makemigrations blog       # 只针对 blog 应用生成迁移
python manage.py migrate blog              # 只迁移 blog
python manage.py migrate blog 0002         # 迁移到指定版本（可回滚）
python manage.py showmigrations            # 查看所有迁移状态
python manage.py showmigrations blog       # 查看某应用的迁移状态
\`\`\`

## 八、ORM 查询

### 1. 增

\`\`\`python
# 方式 1：create()，一步到位
article = Article.objects.create(
    title="Django 入门",
    content="...",
    category_id=1,
    status="published",
)

# 方式 2：先实例化再 save
article = Article(title="...", content="...", category_id=1)
article.save()       # 此时才执行 INSERT

# 方式 3：通过外键反查创建（related_name）
category = Category.objects.get(pk=1)
category.articles.create(title="...", content="...")
\`\`\`

### 2. 查

\`\`\`python
# 全部
Article.objects.all()                       # 查询集 QuerySet
# SELECT * FROM blog_article;

# get()：取单条，找不到抛 DoesNotExist，多条抛 MultipleObjectsReturned
Article.objects.get(pk=1)
Article.objects.get(title="Django 入门")

# filter()：过滤，返回 QuerySet（可能为空）
Article.objects.filter(status="published")
# SELECT * FROM blog_article WHERE status = 'published';

# exclude()：反向过滤
Article.objects.exclude(status="draft")

# 字段查找（双下划线语法）
Article.objects.filter(pub_date__year=2024)         # 年份
Article.objects.filter(pub_date__gte="2024-01-01")  # 大于等于
Article.objects.filter(title__icontains="django")   # 不区分大小写包含
Article.objects.filter(title__startswith="Django")  # 以...开头
Article.objects.filter(views__in=[100, 200, 300])    # 在列表中
Article.objects.filter(category__name="Python")      # 跨表查询
Article.objects.filter(category__isnull=True)        # 外键为 NULL

# 排序、限制、去重
Article.objects.order_by("-pub_date")         # 排序
Article.objects.order_by("-pub_date", "title")  # 多字段排序
Article.objects.all()[:10]                    # LIMIT 10
Article.objects.all()[5:15]                   # OFFSET 5 LIMIT 10
Article.objects.values("title", "pub_date").distinct()  # 去重
\`\`\`

### 3. 改

\`\`\`python
# 单条修改
article = Article.objects.get(pk=1)
article.title = "新标题"
article.save()        # 执行 UPDATE

# 批量修改
Article.objects.filter(status="draft").update(status="archived")
# UPDATE blog_article SET status='archived' WHERE status='draft';

# 增加数值字段（避免读-改-写的竞态）
Article.objects.filter(pk=1).update(views=models.F("views") + 1)
\`\`\`

### 4. 删

\`\`\`python
article = Article.objects.get(pk=1)
article.delete()                                # 单条删除

Article.objects.filter(status="archived").delete()  # 批量删除
\`\`\`

## 九、Q 对象：复杂 OR/AND/NOT 条件

\`filter\` 默认是 AND 关系。需要 OR/NOT 时用 \`Q\` 对象：

\`\`\`python
from django.db.models import Q

# 查询：标题包含 "Django" 或 状态为 published 的文章
Article.objects.filter(
    Q(title__icontains="django") | Q(status="published")
)

# 查询：标题包含 "Django" 且 不是草稿
Article.objects.filter(
    Q(title__icontains="django") & ~Q(status="draft")
)

# 查询：标题包含 "Django" 或（已发布 且 浏览量大于 100）
Article.objects.filter(
    Q(title__icontains="django") |
    (Q(status="published") & Q(views__gt=100))
)

# Q 对象可以和普通关键字参数混用，但 Q 必须在前
Article.objects.filter(
    Q(title__icontains="django"),
    status="published",   # 等同于 Q(status="published")
)
\`\`\`

## 十、F 对象：引用字段值

\`F()\` 用来引用同一行其他字段的值，常用于：

- 字段值自增/自减（避免读-改-写竞态）
- 比较两个字段

\`\`\`python
from django.db.models import F

# 浏览量 +1（原子操作，一条 SQL）
Article.objects.filter(pk=1).update(views=F("views") + 1)

# 比较：找出更新时间晚于发布时间的文章（理论不会发生，仅演示）
Article.objects.filter(updated_at__gt=F("pub_date"))

# 字段间运算：找出"评论数大于浏览量 1%" 的文章
Article.objects.filter(comment_count__gt=F("views") * 0.01)
\`\`\`

## 十一、聚合与分组

\`\`\`python
from django.db.models import Count, Sum, Avg, Max, Min

# 聚合：对所有文章求统计
Article.objects.aggregate(
    total=Count("id"),
    avg_views=Avg("views"),
    max_views=Max("views"),
)
# 返回字典：{"total": 100, "avg_views": 50.5, "max_views": 1000}

# 分组：按分类统计文章数
Category.objects.annotate(
    article_count=Count("articles")
)
# 之后每个 category 对象都能用 .article_count 访问
# SELECT category.*, COUNT(article.id) AS article_count
# FROM category LEFT JOIN article ON ... GROUP BY category.id
\`\`\`

## 十二、小结

- 模型 = Python 类描述数据库表，自动生成 DDL 和查询 API。
- 字段类型对应 SQL 类型，金额用 DecimalField，文本用 TextField。
- 字段选项控制约束（null/blank/unique/choices/default）。
- 关系字段：ForeignKey（一对多）、OneToOneField（一对一）、ManyToManyField（多对多）。
- Meta 控制排序、表名、索引、约束等元信息。
- 迁移三步：\`makemigrations\` → \`migrate\` → （可选）\`sqlmigrate\` 查看 SQL。
- ORM 查询：\`get\`（单条）、\`filter\`（多条）、\`exclude\`（反向）、\`update\`（批量改）、\`delete\`（删）。
- Q 对象处理 OR/NOT，F 对象引用字段值做原子运算，\`aggregate\`/\`annotate\` 做聚合分组。`,
  },

  // ============================================================
  // 第 3 章：视图、URL 路由与 CBV
  // ============================================================
  {
    id: "pyweb2-django-views",
    group: "Django 框架",
    icon: "👁️",
    title: "视图、URL 路由与 CBV",
    content: `## 一、视图层职责

视图（View）是 Django MTV 里的「业务逻辑层」，对应 MVC 的 Controller。它做三件事：

1. **接收请求**：拿到 \`HttpRequest\` 对象（方法、参数、body、session 等）。
2. **处理业务**：调模型取数据、调外部 API、做权限校验。
3. **返回响应**：返回 \`HttpResponse\`（HTML/JSON/文件/重定向等）。

视图分两种风格：

- **FBV（Function-Based View，函数视图）**：用函数写，简单直观。
- **CBV（Class-Based View，类视图）**：用类写，可复用、可继承。

Django 两种都支持，没有绝对优劣，看场景选。

## 二、函数视图（FBV）基础

\`\`\`python
# blog/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse, Http404
from .models import Article

# 最朴素的函数视图
def article_list(request):
    """文章列表"""
    # 1. 从模型取数据
    articles = Article.objects.filter(status="published").order_by("-pub_date")

    # 2. 渲染模板
    context = {
        "articles": articles,
        "total": articles.count(),
    }
    return render(request, "blog/article_list.html", context)
    # render 是快捷函数，等价于：
    # template = loader.get_template("blog/article_list.html")
    # return HttpResponse(template.render(context, request))


def article_detail(request, article_id):
    """文章详情"""
    # get_object_or_404：找不到自动返回 404，比 try/except 简洁
    article = get_object_or_404(Article, pk=article_id, status="published")

    # 浏览量 +1（用 F 对象原子操作）
    Article.objects.filter(pk=article_id).update(views=models.F("views") + 1)
    # 注意：这里 article.views 还是旧值，要刷新
    article.refresh_from_db()

    return render(request, "blog/article_detail.html", {"article": article})
\`\`\`

### 处理不同 HTTP 方法

\`\`\`python
def article_create(request):
    """创建文章：GET 显示表单，POST 处理提交"""
    if request.method == "GET":
        # 显示空表单
        return render(request, "blog/article_form.html", {"form": ArticleForm()})

    elif request.method == "POST":
        # 处理提交
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save()                  # 保存到数据库
            return redirect("blog:article_detail", article_id=article.id)
        # 校验失败，重新渲染带错误的表单
        return render(request, "blog/article_form.html", {"form": form})

    # 其他方法不允许
    return HttpResponse(status=405)
\`\`\`

\`request.method\` 判断方法的方式适合简单场景。如果方法多了，\`if/elif\` 链会很长，这时改用 CBV 更清晰。

## 三、URL 配置

### 1. urlpatterns 与 path

\`\`\`python
# blog/urls.py
from django.urls import path
from . import views

# 应用命名空间，模板里用 {% url 'blog:detail' article.id %}
app_name = "blog"

urlpatterns = [
    # path(route, view, kwargs=None, name=None)
    path("", views.article_list, name="list"),
    path("articles/<int:article_id>/", views.article_detail, name="detail"),
    path("new/", views.article_create, name="create"),
    path("articles/<int:article_id>/edit/", views.article_edit, name="edit"),
]
\`\`\`

### 2. include 分发

\`\`\`python
# mysite/urls.py（项目根路由）
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("blog/", include("blog.urls")),            # 应用级 URL
    path("blog/", include(("blog.urls", "blog"), namespace="blog")),  # 带命名空间
    path("accounts/", include("django.contrib.auth.urls")),  # 内置认证视图
]
\`\`\`

### 3. URL 名称与 reverse

给 URL 起名字的好处：**改路径不用全项目搜替换，反向生成 URL 用名字**。

\`\`\`python
from django.urls import reverse

# 反向生成 URL 字符串
url = reverse("blog:detail", kwargs={"article_id": 42})
# 返回 "/blog/articles/42/"

# 带查询参数
url = reverse("blog:list") + "?page=2"
# 返回 "/blog/?page=2"

# 在视图里跳转
return redirect("blog:detail", article_id=42)
\`\`\`

模板里用 \`{% url %}\` 标签：

\`\`\`html
<a href="{% url 'blog:detail' article.id %}">{{ article.title }}</a>
\`\`\`

### 4. path 转换器

\`\`\`python
urlpatterns = [
    path("articles/<int:year>/", views.by_year),        # 整数
    path("articles/<int:year>/<int:month>/", views.by_month),
    path("u/<str:username>/", views.profile),           # 字符串
    path("tags/<slug:tag>/", views.by_tag),             # slug
    path("files/<path:filepath>/", views.serve_file),   # 含 / 的路径
    path("uuid/<uuid:uid>/", views.by_uuid),            # UUID
]
\`\`\`

### 5. 自定义转换器

\`\`\`python
# blog/converters.py
class YearConverter:
    """4 位年份转换器"""
    regex = r"[0-9]{4}"     # 必须定义 regex 类属性

    def to_python(self, value):
        """URL 中的字符串 → Python 值"""
        return int(value)

    def to_url(self, value):
        """Python 值 → URL 字符串（用于 reverse）"""
        return f"{value:04d}"

# blog/urls.py
from django.urls import register_converter, path
from .converters import YearConverter

register_converter(YearConverter, "yyyy")

urlpatterns = [
    path("articles/<yyyy:year>/", views.by_year),
]
\`\`\`

## 四、类视图（CBV）基础

### 1. 最简单的 CBV

\`\`\`python
from django.views import View

class ArticleListView(View):
    """文章列表视图（CBV 版）"""

    def get(self, request):
        """处理 GET 请求"""
        articles = Article.objects.filter(status="published")
        return render(request, "blog/article_list.html", {"articles": articles})

    def post(self, request):
        """处理 POST 请求"""
        # 处理表单提交
        ...
\`\`\`

URL 配置里要调用 \`as_view()\` 把类转成可调用的函数：

\`\`\`python
# blog/urls.py
urlpatterns = [
    path("", views.ArticleListView.as_view(), name="list"),
]
\`\`\`

### 2. as_view() 的工作原理

\`as_view()\` 返回一个闭包函数，请求到来时：

1. 实例化类（\`self = View()\`）。
2. 把 \`request\`、\`args\`、\`kwargs\` 赋给实例属性。
3. 调用 \`self.dispatch(request, *args, **kwargs)\`。
4. \`dispatch\` 根据 \`request.method\` 找到对应的方法（get/post/put/...）并调用。
5. 不支持的方法返回 405。

理解 \`dispatch\` 是理解 CBV 的钥匙——所有装饰器、Mixin 都靠重写它实现。

## 五、通用视图

Django 内置一套「通用视图」\`django.views.generic\`，把常见 CRUD 操作封装好，几行代码搞定一个页面：

### 1. ListView：列表页

\`\`\`python
from django.views.generic import ListView
from .models import Article

class ArticleListView(ListView):
    model = Article
    template_name = "blog/article_list.html"        # 模板路径
    context_object_name = "articles"                 # 模板里的变量名（默认 object_list）
    paginate_by = 10                                 # 每页 10 条，自动分页

    def get_queryset(self):
        """重写查询集，加过滤条件"""
        qs = super().get_queryset()
        return qs.filter(status="published").order_by("-pub_date")

    def get_context_data(self, **kwargs):
        """往模板注入额外变量"""
        ctx = super().get_context_data(**kwargs)
        ctx["total"] = self.get_queryset().count()
        return ctx
\`\`\`

模板里能用的变量：\`articles\`（当前页数据）、\`page_obj\`（分页对象）、\`is_paginated\`、\`object_list\`。

### 2. DetailView：详情页

\`\`\`python
from django.views.generic import DetailView

class ArticleDetailView(DetailView):
    model = Article
    template_name = "blog/article_detail.html"
    context_object_name = "article"

    # 默认按 pk 或 slug 查询，URL 必须有 <pk> 或 <slug>
    # 也可以自定义：
    # pk_url_kwarg = "article_id"   # URL 里的参数名

    def get_object(self, queryset=None):
        """重写取对象逻辑"""
        obj = super().get_object(queryset)
        # 浏览量 +1
        obj.__class__.objects.filter(pk=obj.pk).update(views=models.F("views") + 1)
        return obj
\`\`\`

### 3. CreateView / UpdateView：表单页

\`\`\`python
from django.views.generic import CreateView, UpdateView
from django.urls import reverse_lazy

class ArticleCreateView(LoginRequiredMixin, CreateView):
    model = Article
    fields = ["title", "content", "category", "tags", "status"]   # 表单字段
    template_name = "blog/article_form.html"
    success_url = reverse_lazy("blog:list")    # 提交成功后跳转

    def form_valid(self, form):
        """表单校验通过时调用"""
        form.instance.author = self.request.user   # 自动填当前用户
        return super().form_valid(form)

class ArticleUpdateView(LoginRequiredMixin, UpdateView):
    model = Article
    fields = ["title", "content", "status"]
    template_name = "blog/article_form.html"

    def get_success_url(self):
        return reverse("blog:detail", kwargs={"pk": self.object.pk})
\`\`\`

### 4. DeleteView：删除页

\`\`\`python
from django.views.generic import DeleteView

class ArticleDeleteView(LoginRequiredMixin, DeleteView):
    model = Article
    template_name = "blog/article_confirm_delete.html"   # 确认页模板
    success_url = reverse_lazy("blog:list")
\`\`\`

DeleteView 默认 GET 显示确认页，POST 才真正删除，避免 GET 请求误删。

## 六、视图装饰器

### 1. login_required

\`\`\`python
from django.contrib.auth.decorators import login_required

# FBV：用装饰器
@login_required
def dashboard(request):
    return render(request, "dashboard.html")

# 未登录用户会被重定向到 settings.LOGIN_URL（默认 /accounts/login/）
\`\`\`

### 2. permission_required

\`\`\`python
from django.contrib.auth.decorators import permission_required

@permission_required("blog.add_article", raise_exception=True)
def article_create(request):
    ...
# raise_exception=True：无权限直接抛 403，不重定向到登录页
\`\`\`

### 3. 给 CBV 加装饰器

CBV 加装饰器要小心，不能直接 \`@login_required\` 套在类上，要用 \`method_decorator\`：

\`\`\`python
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

# 方式 1：装饰 dispatch 方法（推荐，所有 HTTP 方法都生效）
@method_decorator(login_required, name="dispatch")
class DashboardView(View):
    def get(self, request):
        ...

# 方式 2：装饰单个方法
class DashboardView(View):
    @method_decorator(login_required)
    def get(self, request):
        ...

# 方式 3：在 URL 里装饰
urlpatterns = [
    path("dashboard/", login_required(DashboardView.as_view())),
]
\`\`\`

\`name="dispatch"\` 是关键——dispatch 是 CBV 的总入口，装饰它就能拦住所有 HTTP 方法。

## 七、请求与响应对象

### 1. HttpRequest

\`\`\`python
def view(request):
    # 请求方法
    request.method              # "GET" / "POST" / "PUT" ...
    request.is_ajax()           # 是否 AJAX（已废弃，新版看 HTTP_X_REQUESTED_WITH）

    # URL 信息
    request.path                # "/blog/articles/42/"
    request.path_info           # 同上但不含脚本名
    request.get_full_path()     # 含查询字符串 "/blog/articles/42/?page=2"
    request.build_absolute_uri("/api/")   # "http://host/api/"

    # 查询参数（GET）
    request.GET.get("page", "1")        # 单值
    request.GET.getlist("tags")         # 多值（同名参数多次出现）
    request.GET["page"]                 # 直接取（找不到抛 KeyError）

    # 表单数据（POST，form-urlencoded/multipart）
    request.POST.get("title")
    request.POST.getlist("tags")

    # JSON body（需要手动解析）
    import json
    data = json.loads(request.body)

    # 头部
    request.META["HTTP_USER_AGENT"]     # UA
    request.META["REMOTE_ADDR"]         # 客户端 IP
    request.META["HTTP_AUTHORIZATION"]  # Authorization 头

    # 文件上传
    request.FILES.get("avatar")         # InMemoryUploadedFile 对象

    # Cookie 和 Session
    request.COOKIES.get("sessionid")
    request.session["user_id"] = 1      # 写 session
    user_id = request.session.get("user_id")

    # 当前用户
    request.user                        # 当前登录用户（未登录是 AnonymousUser）
\`\`\`

### 2. HttpResponse

\`\`\`python
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect

# 普通文本
response = HttpResponse("Hello", content_type="text/plain")

# HTML（默认 content_type 就是 text/html）
response = HttpResponse("<h1>Hi</h1>")

# 设置响应头
response["X-Custom-Header"] = "value"
response["Content-Disposition"] = 'attachment; filename="report.pdf"'

# 设置 Cookie
response.set_cookie("token", "abc123", max_age=3600, httponly=True)
response.delete_cookie("token")

# JSON 响应（自动 json.dumps + 设 Content-Type）
return JsonResponse({"code": 0, "data": {"id": 1}})
# 处理非字典对象要加 safe=False
return JsonResponse([1, 2, 3], safe=False)

# 重定向
return redirect("/blog/")                          # URL 字符串
return redirect("blog:detail", pk=1)               # 反向解析
return HttpResponseRedirect("/blog/")              # 等价于 redirect
\`\`\`

### 3. 流式响应

\`\`\`python
from django.http import StreamingHttpResponse

def download_big_file(request):
    """大文件下载，避免内存爆炸"""
    def file_iterator(path, chunk_size=8192):
        with open(path, "rb") as f:
            while chunk := f.read(chunk_size):
                yield chunk

    response = StreamingHttpResponse(file_iterator("/big/file.bin"))
    response["Content-Type"] = "application/octet-stream"
    response["Content-Disposition"] = 'attachment; filename="big.bin"'
    return response
\`\`\`

## 八、FBV vs CBV 对比

| 维度 | FBV（函数视图） | CBV（类视图） |
| --- | --- | --- |
| 写法 | 函数，简单直接 | 类，方法分治 |
| 复用 | 自己写装饰器/辅助函数 | 用继承和 Mixin 复用 |
| HTTP 方法 | \`if request.method == "GET"\` | 定义 \`get\`/\`post\` 方法 |
| 通用操作 | 自己实现 CRUD | \`generic.CreateView\` 等开箱即用 |
| 学习曲线 | 低 | 中（要懂 MRO、dispatch、Mixin） |
| 灵活性 | 高，想怎么写怎么写 | 受类继承约束 |
| 调试 | 直接看函数 | 要跳多个父类，调试链长 |
| 适合场景 | 简单视图、API 接口 | 标准 CRUD 页面、需要复用 |

**经验法则**：

- 标准 CRUD 页面 → CBV（用 \`generic\`）。
- 复杂业务、API → FBV 或 CBV 都行，看团队习惯。
- Django REST Framework 的 \`APIView\`、\`ViewSet\` 是 CBV 思路的延伸。

## 九、小结

- 视图接收 \`HttpRequest\`、返回 \`HttpResponse\`，是业务逻辑层。
- FBV 用函数，CBV 用类，\`as_view()\` 把类转成可调用对象。
- URL 用 \`path\` 配置，\`include\` 分发到子应用，\`name\` 配合 \`reverse\` 反向生成。
- 通用视图（ListView/DetailView/CreateView/UpdateView/DeleteView）封装常见 CRUD，几行代码搞定一个页面。
- 装饰器：\`login_required\`（FBV）、\`method_decorator\`（CBV，装饰 \`dispatch\`）、\`permission_required\`。
- \`HttpRequest\` 提供请求所有信息（GET/POST/FILES/session/user），\`HttpResponse\` 控制响应（头部/Cookie/状态码）。
- FBV 简单直接，CBV 复用强；标准 CRUD 用 CBV，复杂业务看团队。`,
  },

  // ============================================================
  // 第 4 章：模板系统与表单
  // ============================================================
  {
    id: "pyweb2-django-templates",
    group: "Django 框架",
    icon: "📄",
    title: "模板系统与表单",
    content: `## 一、Django 模板系统简介

Django 自带一套模板引擎叫 **DTL（Django Template Language）**，专门用于把 Python 数据渲染成 HTML（也支持其他文本格式）。它的设计目标不是「图灵完备的编程语言」，而是「表现层胶水」——只做展示逻辑，不做业务计算。

DTL 的核心语法三件套：

- **变量**：\`{{ variable }}\`，输出值。
- **标签**：\`{% tag %}\`，执行逻辑（if/for/block/url 等）。
- **过滤器**：\`{{ variable|filter }}\`，对值做变换。

DTL vs Jinja2：DTL 更安全（默认转义、限制 Python 表达式），Jinja2 更灵活（性能也略快）。Django 3.x 后内置支持 Jinja2，可以切换。但 DTL 仍是默认且与 Django 表单、Admin 深度集成，新手优先学 DTL。

## 二、模板配置

\`\`\`python
# settings.py
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],   # 全局模板目录
        "APP_DIRS": True,                    # 自动从各应用的 templates/ 找
        "OPTIONS": {
            "context_processors": [
                # 这些 processor 会自动往每个模板注入变量
                "django.template.context_processors.debug",
                "django.template.context_processors.request",  # 注入 request
                "django.contrib.auth.context_processors.auth", # 注入 user、perms
                "django.contrib.messages.context_processors.messages",  # 注入 messages
            ],
        },
    },
]
\`\`\`

\`APP_DIRS=True\` 时，Django 会从每个已安装应用的 \`templates/\` 子目录找模板。模板路径要带上应用名前缀避免冲突：\`blog/templates/blog/article_list.html\`，模板里用 \`blog/article_list.html\` 引用。

## 三、变量与属性访问

\`\`\`html
<!-- 模板里访问变量 -->
{{ title }}                    <!-- 字符串 -->
{{ article.title }}            <!-- 对象属性 -->
{{ article.get_absolute_url }} <!-- 对象方法（不能带括号、不能传参） -->
{{ items.0 }}                  <!-- 列表索引（只能取字面量，不能变量） -->
{{ user.email|lower }}         <!-- 过滤器链式调用 -->
\`\`\`

DTL 的变量查找顺序：字典 key → 对象属性 → 对象方法（无参）。找不到返回空字符串（默认 \`settings.TEMPLATE_STRING_IF_INVALID = ""\`），不报错。

## 四、标签

### 1. if / elif / else

\`\`\`html
{% if user.is_authenticated %}
  <p>欢迎，{{ user.username }}</p>
{% elif user.is_anonymous %}
  <p>请登录</p>
{% else %}
  <p>未知状态</p>
{% endif %}

<!-- 支持运算符：and or not == != > < >= <= in not in -->
{% if articles and articles|length > 0 %}
  有文章
{% endif %}

{% if "admin" in user.groups|stringformat:"s" %}
  <!-- 注意：DTL 不能直接判断对象在列表里，要看具体类型 -->
{% endif %}
\`\`\`

### 2. for / forloop

\`\`\`html
<ul>
{% for article in articles %}
  <li>
    {{ forloop.counter }}. {{ article.title }}
    <!-- forloop 提供的变量 -->
    <!-- forloop.counter：从 1 开始计数 -->
    <!-- forloop.counter0：从 0 开始 -->
    <!-- forloop.revcounter：倒序计数（剩余次数，从总数开始） -->
    <!-- forloop.first：是否第一次循环（True/False） -->
    <!-- forloop.last：是否最后一次循环 -->
    <!-- forloop.parentloop：嵌套循环时父循环的 forloop -->
  </li>
{% empty %}
  <li>暂无文章</li>
{% endfor %}
</ul>
\`\`\`

\`{% empty %}\` 是个有用的标签：列表为空时显示，比 \`{% if %}\` 判断更简洁。

### 3. block / extends：模板继承

\`\`\`html
<!-- templates/base.html（父模板） -->
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}默认标题{% endblock %}</title>
  {% block extra_head %}{% endblock %}
</head>
<body>
  <nav>{% block nav %}默认导航{% endblock %}</nav>
  <main>{% block content %}{% endblock %}</main>
  <footer>© 2024</footer>
  {% block extra_js %}{% endblock %}
</body>
</html>

<!-- templates/blog/article_list.html（子模板） -->
{% extends "base.html" %}

{% block title %}文章列表{% endblock %}

{% block content %}
  <h1>文章列表</h1>
  {% for article in articles %}
    <article>{{ article.title }}</article>
  {% endfor %}
{% endblock %}

{% block extra_js %}
  <script src="..."></script>
{% endblock %}
\`\`\`

继承的规则：

- \`{% extends %}\` 必须是模板的第一个标签。
- 子模板只能填充父模板里 \`{% block %}\` 定义的占位符，外面的内容会被忽略。
- \`{{ block.super }}\` 可以引用父模板同名 block 的内容，做叠加。

\`\`\`html
{% block content %}
  {{ block.super }}    <!-- 先输出父模板的 content -->
  <p>子模板追加内容</p>
{% endblock %}
\`\`\`

### 4. include：包含子模板

\`\`\`html
<!-- 在任意位置包含另一个模板 -->
{% include "blog/_article_card.html" with article=article show_summary=True %}
\`\`\`

\`with\` 给子模板传额外变量，子模板可以用 \`{{ article }}\`、\`{{ show_summary }}\`。

### 5. url / static / csrf_token

\`\`\`html
<!-- 反向生成 URL -->
<a href="{% url 'blog:detail' article.id %}">查看</a>
<a href="{% url 'blog:by_tag' tag='python' %}">Python 标签</a>

<!-- 静态文件 -->
{% load static %}
<img src="{% static 'img/logo.png' %}">
<script src="{% static 'js/app.js' %}"></script>

<!-- CSRF token（POST 表单必须有） -->
<form method="post">
  {% csrf_token %}
  <input name="title">
  <button type="submit">提交</button>
</form>
\`\`\`

### 6. with：临时变量

\`\`\`html
{% with total=articles.count %}
  共 {{ total }} 篇文章
  <!-- with 块内 total 可用 -->
{% endwith %}
\`\`\`

### 7. autoescape：控制转义

\`\`\`html
{% autoescape off %}
  {{ html_content }}    <!-- 不转义，按 HTML 解析 -->
{% endautoescape %}

<!-- 单个变量用 safe 过滤器 -->
{{ html_content|safe }}
\`\`\`

DTL 默认对 \`{{ }}\` 内容做 HTML 转义（\`<\` → \`&lt;\`），防止 XSS。除非你确信内容安全，否则别关。

## 五、过滤器

\`\`\`html
<!-- 常用过滤器 -->
{{ name|lower }}                       <!-- 转小写 -->
{{ name|upper }}                       <!-- 转大写 -->
{{ title|title }}                      <!-- 首字母大写 -->
{{ body|truncatewords:30 }}            <!-- 截断 30 个词 -->
{{ body|truncatechars:100 }}           <!-- 截断 100 个字符 -->
{{ content|striptags }}                <!-- 去除 HTML 标签 -->
{{ content|safe }}                     <!-- 标记为安全，不转义 -->
{{ price|floatformat:2 }}              <!-- 保留 2 位小数 -->
{{ pub_date|date:"Y-m-d H:i" }}        <!-- 格式化日期 -->
{{ pub_date|timesince }}               <!-- 距今多久（"3 days, 5 hours"） -->
{{ pub_date|timeuntil }}               <!-- 距离未来多久 -->
{{ nothing|default:"N/A" }}            <!-- 默认值 -->
{{ nothing|default_if_none:"N/A" }}    <!-- 仅 None 时默认值 -->
{{ items|length }}                     <!-- 长度 -->
{{ items|join:", " }}                  <!-- 用逗号连接 -->
{{ name|slugify }}                     <!-- 转 slug -->
{{ html|escape }}                      <!-- 手动转义 -->

<!-- 链式调用 -->
{{ "Hello World"|lower|slugify }}      <!-- "hello-world" -->

<!-- 带参数的过滤器 -->
{{ value|add:10 }}                     <!-- 加 10（数字）或拼接（字符串） -->
{{ value|cut:" " }}                    <!-- 删除所有空格 -->
{{ list|slice:":2" }}                  <!-- 取前 2 个 -->
\`\`\`

### 自定义过滤器

\`\`\`python
# blog/templatetags/blog_extras.py
from django import template

register = template.Library()

@register.filter(name="currency")
def currency(value, symbol="¥"):
    """格式化为货币"""
    try:
        return f"{symbol}{float(value):.2f}"
    except (ValueError, TypeError):
        return value

@register.simple_tag
def current_time(format_string="%Y-%m-%d"):
    """简单标签：可带参数，返回字符串"""
    from datetime import datetime
    return datetime.now().strftime(format_string)
\`\`\`

模板里使用：

\`\`\`html
{% load blog_extras %}

{{ product.price|currency }}
{{ product.price|currency:"$" }}
{% current_time "%H:%M" %}
\`\`\`

## 六、静态文件

### 1. 配置

\`\`\`python
# settings.py
STATIC_URL = "static/"                       # URL 前缀
STATICFILES_DIRS = [BASE_DIR / "static"]     # 开发时静态文件目录
STATIC_ROOT = BASE_DIR / "staticfiles"       # collectstatic 收集目录（生产用）
\`\`\`

目录结构：

\`\`\`text
mysite/
├── static/                  # 开发时全局静态文件
│   ├── css/
│   ├── js/
│   └── img/
└── blog/
    └── static/              # 应用级静态文件
        └── blog/
            └── js/
\`\`\`

### 2. 模板里引用

\`\`\`html
{% load static %}

<link rel="stylesheet" href="{% static 'css/style.css' %}">
<img src="{% static 'img/logo.png' %}" alt="logo">

<!-- 动态路径 -->
<img src="{% static 'img/'|add:user.avatar %}">
\`\`\`

开发时 \`django.contrib.staticfiles\` 会自动服务静态文件；生产时需要 \`collectstatic\` 后由 Nginx 等服务。

## 七、表单

Django 表单系统做的事：

1. **定义**：用 \`Form\` 类描述字段，类似 Model。
2. **渲染**：自动生成 HTML 控件。
3. **校验**：根据字段类型和验证器自动校验。
4. **错误处理**：校验失败自动收集错误信息，重新渲染。

### 1. Form 类

\`\`\`python
# blog/forms.py
from django import forms

class ContactForm(forms.Form):
    """联系表单"""
    name = forms.CharField(
        label="姓名", max_length=50,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    email = forms.EmailField(label="邮箱")
    message = forms.CharField(
        label="留言",
        max_length=500,
        widget=forms.Textarea(attrs={"rows": 5, "class": "form-control"}),
    )
    # 单选
    subject = forms.ChoiceField(
        label="主题",
        choices=[("bug", "Bug 反馈"), ("suggest", "建议"), ("other", "其他")],
    )
    # 多选
    tags = forms.MultipleChoiceField(
        label="标签",
        choices=[("python", "Python"), ("django", "Django")],
        required=False,
    )
    # 复选框
    agree = forms.BooleanField(label="同意条款", required=True)

    def clean_email(self):
        """自定义字段校验：clean_<fieldname>"""
        email = self.cleaned_data["email"]
        if email.endswith("@spam.com"):
            raise forms.ValidationError("禁止使用该邮箱")
        return email

    def clean(self):
        """跨字段校验"""
        cleaned_data = super().clean()
        name = cleaned_data.get("name")
        message = cleaned_data.get("message")
        if name and message and name.lower() in message.lower():
            raise forms.ValidationError("留言不能包含姓名")
        return cleaned_data
\`\`\`

### 2. 在视图中使用

\`\`\`python
# blog/views.py
def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)        # 用提交数据填充表单
        if form.is_valid():                     # 触发校验
            # 校验通过的数据在 cleaned_data 字典里
            data = form.cleaned_data
            # 发邮件、存库等业务
            send_mail(
                subject=data["subject"],
                message=data["message"],
                from_email=data["email"],
                to=["admin@example.com"],
            )
            return redirect("blog:contact_ok")
        # 校验失败，form.errors 里会有错误信息，渲染时自动显示
    else:
        form = ContactForm()                    # GET 显示空表单

    return render(request, "blog/contact.html", {"form": form})
\`\`\`

### 3. 模板渲染表单

\`\`\`html
<!-- 方式 1：一键渲染整个表单 -->
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}    <!-- 每个字段包在 <p> 里 -->
  <!-- 也可用 form.as_table（表格）、form.as_ul（列表） -->
  <button type="submit">提交</button>
</form>

<!-- 方式 2：手动渲染每个字段 -->
<form method="post">
  {% csrf_token %}
  <div class="form-group">
    {{ form.name.label_tag }}
    {{ form.name }}
    {% if form.name.errors %}
      <div class="alert alert-danger">{{ form.name.errors }}</div>
    {% endif %}
  </div>
  <div class="form-group">
    {{ form.email.label_tag }}
    {{ form.email }}
    {{ form.email.errors }}
  </div>
  <!-- ... -->
  <button type="submit">提交</button>
</form>

<!-- 方式 3：循环渲染 -->
<form method="post">
  {% csrf_token %}
  {% for field in form %}
    <div class="form-group">
      {{ field.label_tag }}
      {{ field }}
      {% if field.errors %}<div class="error">{{ field.errors }}</div>{% endif %}
      {% if field.help_text %}<small>{{ field.help_text }}</small>{% endif %}
    </div>
  {% endfor %}
  <button type="submit">提交</button>
</form>
\`\`\`

### 4. ModelForm：从模型生成表单

大多数场景下，表单字段和模型字段几乎一样，手写 \`Form\` 重复且易错。\`ModelForm\` 自动从模型生成：

\`\`\`python
# blog/forms.py
from django import forms
from .models import Article

class ArticleForm(forms.ModelForm):
    """文章表单：从模型自动生成"""
    class Meta:
        model = Article
        fields = ["title", "content", "category", "tags", "status"]   # 包含字段
        # exclude = ["views"]                                          # 或排除字段
        labels = {"title": "标题", "content": "正文"}
        widgets = {
            "content": forms.Textarea(attrs={"rows": 10, "class": "editor"}),
            "status": forms.Select(attrs={"class": "form-control"}),
        }
        help_texts = {"title": "不超过 200 字"}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 动态修改字段，比如根据用户权限禁用某些字段
        self.fields["title"].widget.attrs.update({"class": "form-control"})

    def clean_title(self):
        title = self.cleaned_data["title"]
        if len(title) < 5:
            raise forms.ValidationError("标题至少 5 个字")
        return title
\`\`\`

视图中使用：

\`\`\`python
def article_create(request):
    if request.method == "POST":
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save()    # 直接保存到数据库
            return redirect("blog:detail", pk=article.pk)
    else:
        form = ArticleForm()
    return render(request, "blog/article_form.html", {"form": form})

def article_edit(request, pk):
    article = get_object_or_404(Article, pk=pk)
    if request.method == "POST":
        # 编辑用 instance 指定要修改的对象
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            form.save()
            return redirect("blog:detail", pk=article.pk)
    else:
        form = ArticleForm(instance=article)   # 用现有数据填充
    return render(request, "blog/article_form.html", {"form": form})
\`\`\`

\`form.save(commit=False)\` 返回未保存的对象，方便加额外字段再保存：

\`\`\`python
if form.is_valid():
    article = form.save(commit=False)
    article.author = request.user
    article.save()
    form.save_m2m()    # 如果有 M2M 字段，要单独保存
\`\`\`

## 八、CSRF 防护

CSRF（Cross-Site Request Forgery，跨站请求伪造）：攻击者诱导用户在已登录状态下，向目标网站发送恶意请求。

Django 默认开启 CSRF 防护（\`CsrfViewMiddleware\`），所有 POST/PUT/DELETE/PATCH 请求必须带 CSRF token，否则返回 403。

\`\`\`html
<!-- 表单里加 {% csrf_token %}，会生成一个隐藏 input -->
<form method="post">
  {% csrf_token %}
  <!-- 等价于：<input type="hidden" name="csrfmiddlewaretoken" value="xxxxx"> -->
  ...
</form>
\`\`\`

AJAX 请求要手动带 token：

\`\`\`html
<script>
// 从 cookie 取（settings.py 配置 CSRF_COOKIE_NAME）
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

fetch("/api/article/", {
  method: "POST",
  headers: {
    "X-CSRFToken": getCookie("csrftoken"),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "test" }),
});
</script>
\`\`\`

某些 API 视图不需要 CSRF（比如纯 Token 认证的 REST API），可以用 \`@csrf_exempt\` 豁免：

\`\`\`python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_webhook(request):
    """第三方回调，没法带 CSRF token"""
    ...
\`\`\`

> 但 \`@csrf_exempt\` 要慎用，确认场景真的不需要 CSRF 防护（如 webhook、Token 认证的 API）。

## 九、小结

- DTL 三件套：\`{{ 变量 }}\`、\`{% 标签 %}\`、\`{{ 值|过滤器 }}\`。
- 标签：\`if\`/\`for\`/\`block\`/\`extends\`/\`include\`/\`url\`/\`static\`/\`csrf_token\`/\`with\`。
- 模板继承：\`{% extends %}\` + \`{% block %}\`，\`{{ block.super }}\` 叠加父内容。
- 过滤器链式调用，\`|safe\` 关闭转义要谨慎。
- 静态文件用 \`{% load static %}\` + \`{% static 'path' %}\`，生产用 \`collectstatic\` 收集。
- \`Form\` 类定义字段、自动渲染和校验；\`ModelForm\` 从模型生成表单。
- \`clean_<field>\` 校验单字段，\`clean()\` 跨字段校验，\`form.is_valid()\` 触发校验。
- CSRF 防护默认开启，POST 表单必须 \`{% csrf_token %}\`，AJAX 要带 \`X-CSRFToken\` 头。`,
  },

  // ============================================================
  // 第 5 章：认证系统与权限
  // ============================================================
  {
    id: "pyweb2-django-auth",
    group: "Django 框架",
    icon: "🔐",
    title: "认证系统与权限",
    content: `## 一、Django 认证系统概览

Django 内置一套完整的认证系统（\`django.contrib.auth\`），开箱即用，包括：

- **User 模型**：用户表，包含用户名、密码、邮箱等字段。
- **权限系统**：细粒度的增删改查权限。
- **分组**：权限的集合，方便批量授权。
- **登录/登出视图**：内置视图函数。
- **装饰器**：\`login_required\`、\`permission_required\`。
- **后端机制**：可插拔的认证后端（默认是数据库，可以接 LDAP、OAuth）。

这套系统覆盖了 80% 的认证需求，你不用从零写用户表、密码哈希、会话管理。

## 二、User 模型

### 1. 内置 User 模型

\`django.contrib.auth.models.User\` 是默认用户模型，字段如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| \`id\` | AutoField | 主键 |
| \`username\` | CharField(150) | 用户名，唯一 |
| \`password\` | CharField(128) | 哈希后的密码（不是明文！） |
| \`email\` | EmailField | 邮箱 |
| \`first_name\` | CharField(30) | 名 |
| \`last_name\` | CharField(150) | 姓 |
| \`is_active\` | BooleanField | 是否启用（禁用用户无法登录） |
| \`is_staff\` | BooleanField | 是否能登录 Admin 后台 |
| \`is_superuser\` | BooleanField | 是否超级管理员（拥有所有权限） |
| \`date_joined\` | DateTimeField | 注册时间 |
| \`last_login\` | DateTimeField | 最后登录时间 |
| \`groups\` | ManyToManyField | 用户所属分组 |
| \`user_permissions\` | ManyToManyField | 用户直接拥有的权限 |

### 2. 自定义 User 模型

内置 User 字段有限（比如没有手机号、头像），官方强烈建议**项目开始时就自定义 User 模型**，哪怕只是继承 AbstractUser 加几个字段，也比后期迁移轻松。

\`\`\`python
# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """自定义用户模型：继承 AbstractUser 保留所有字段，再加自己的"""
    # 在 AbstractUser 基础上加字段
    phone = models.CharField("手机号", max_length=20, blank=True, unique=True)
    avatar = models.URLField("头像", blank=True)
    nickname = models.CharField("昵称", max_length=50, blank=True)
    birthday = models.DateField("生日", null=True, blank=True)

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return self.nickname or self.username
\`\`\`

注册到 \`settings.py\`：

\`\`\`python
# settings.py
AUTH_USER_MODEL = "users.User"   # app_label.ModelName
\`\`\`

> 注意：\`AUTH_USER_MODEL\` 必须在第一次 \`migrate\` 之前设置好，项目跑起来后再改 User 模型迁移极麻烦，要么新建项目，要么用 \`django-custom-user\` 等工具小心迁移。

### 3. AbstractUser vs AbstractBaseUser

- \`AbstractUser\`：继承它，保留所有字段（username/email/first_name...），只加字段或方法。**推荐**。
- \`AbstractBaseUser\`：更底层，只有 password 和 last_login，所有字段都要自己定义。完全自定义用户模型（比如用邮箱登录、不要 username）时用。

\`\`\`python
# 用邮箱登录的 User（AbstractBaseUser + PermissionsMixin）
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    """自定义用户管理器：定义 create_user / create_superuser"""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("邮箱必填")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()    # 指定自定义管理器

    USERNAME_FIELD = "email"          # 用 email 作为登录字段
    REQUIRED_FIELDS = ["nickname"]    # createsuperuser 时额外要问的字段

    def __str__(self):
        return self.email
\`\`\`

## 三、注册与用户创建

\`\`\`python
# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .forms import UserRegistrationForm

def register(request):
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            # 方式 1：用 create_user 创建（自动哈希密码）
            user = User.objects.create_user(
                username=form.cleaned_data["username"],
                email=form.cleaned_data["email"],
                password=form.cleaned_data["password"],
            )
            # 方式 2：实例化后 set_password
            # user = User(username="...", email="...")
            # user.set_password("raw_password")   # 哈希
            # user.save()

            # 注册后自动登录
            login(request, user)
            return redirect("home")
    else:
        form = UserRegistrationForm()
    return render(request, "users/register.html", {"form": form})


# users/forms.py
class UserRegistrationForm(forms.Form):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(label="确认密码", widget=forms.PasswordInput)

    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("用户名已存在")
        return username

    def clean_password2(self):
        pw1 = self.cleaned_data.get("password")
        pw2 = self.cleaned_data.get("password2")
        if pw1 and pw2 and pw1 != pw2:
            raise forms.ValidationError("两次密码不一致")
        return pw2
\`\`\`

> 切记：**永远不要明文存密码**。用 \`create_user()\` 或 \`set_password()\`，它们会自动用 PBKDF2/Argon2/BCrypt 哈希。

## 四、authenticate / login / logout

\`\`\`python
from django.contrib.auth import authenticate, login, logout

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        # authenticate：验证用户名密码，返回 User 对象或 None
        # 它会走 AUTHENTICATION_BACKENDS 里配置的所有后端
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # 用户密码正确，且 is_active=True
            login(request, user)    # 把 user.id 写入 session
            return redirect("home")
        else:
            # 用户名密码错，或用户被禁用
            return render(request, "users/login.html", {"error": "用户名或密码错误"})
    return render(request, "users/login.html")


def logout_view(request):
    logout(request)     # 清除 session 数据
    return redirect("home")
\`\`\`

\`login(request, user)\` 做了什么：

1. 在 session 里存 \`_auth_user_id = user.id\`、\`_auth_user_backend = ...\`。
2. 调用 \`user.save()\` 更新 \`last_login\`。
3. 后续请求里 \`request.user\` 自动是当前登录用户（依赖 \`AuthenticationMiddleware\`）。

## 五、内置登录视图

Django 内置一套登录/登出/改密/重置密码的视图，配置 URL 即可用：

\`\`\`python
# mysite/urls.py
urlpatterns = [
    path("accounts/", include("django.contrib.auth.urls")),
]
\`\`\`

这一行就启用了这些 URL：

| URL 名称 | 路径 | 视图 |
| --- | --- | --- |
| \`login\` | \`/accounts/login/\` | \`LoginView\` |
| \`logout\` | \`/accounts/logout/\` | \`LogoutView\` |
| \`password_change\` | \`/accounts/password_change/\` | \`PasswordChangeView\` |
| \`password_change_done\` | \`/accounts/password_change/done/\` | \`PasswordChangeDoneView\` |
| \`password_reset\` | \`/accounts/password_reset/\` | \`PasswordResetView\` |
| \`password_reset_done\` | \`/accounts/password_reset/done/\` | \`PasswordResetDoneView\` |
| \`password_reset_confirm\` | \`/accounts/reset/<uidb64>/<token>/\` | \`PasswordResetConfirmView\` |
| \`password_reset_complete\` | \`/accounts/reset/done/\` | \`PasswordResetCompleteView\` |

它们用默认模板 \`registration/login.html\` 等。自己建这些模板即可定制 UI：

\`\`\`html
<!-- templates/registration/login.html -->
{% extends "base.html" %}
{% block content %}
<h2>登录</h2>
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">登录</button>
</form>
{% endblock %}
\`\`\`

### 自定义登录视图

\`\`\`python
# users/views.py
from django.contrib.auth.views import LoginView

class MyLoginView(LoginView):
    template_name = "users/login.html"
    redirect_authenticated_user = True    # 已登录用户访问登录页直接跳转

    def get_success_url(self):
        """登录成功后跳转"""
        next_url = self.get_redirect_url()    # 取 ?next= 参数
        return next_url or reverse("home")

    def form_invalid(self, form):
        """登录失败时记录日志"""
        logger.warning(f"登录失败：{form.data.get('username')}")
        return super().form_invalid(form)
\`\`\`

\`settings.py\` 里配置：

\`\`\`python
LOGIN_URL = "login"           # @login_required 跳转目标
LOGIN_REDIRECT_URL = "home"   # 登录后默认跳转
LOGOUT_REDIRECT_URL = "home"  # 登出后跳转
\`\`\`

## 六、密码哈希与验证

Django 不会存明文密码，而是存哈希值。默认用 PBKDF2（基于密码的密钥派生函数），可通过 \`PASSWORD_HASHERS\` 配置：

\`\`\`python
# settings.py
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",   # 优先 Argon2（需 pip install argon2-cffi）
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
\`\`\`

第一个是「主哈希器」用于新密码，其他用于校验旧密码（方便升级算法）。哈希格式：

\`\`\`text
pbkdf2_sha256$390000$abcdef$<hash_hex>
└─算法────迭代次数─盐──哈希值──┘
\`\`\`

密码校验：

\`\`\`python
# 校验密码
from django.contrib.auth.hashers import check_password, make_password

hashed = make_password("mypassword")    # 哈希
check_password("mypassword", hashed)    # True
check_password("wrong", hashed)         # False

# User 对象有 set_password / check_password 方法
user.set_password("new_password")    # 哈希后存
user.save()
user.check_password("raw_password")  # 校验密码是否正确
\`\`\`

### 密码强度校验

\`AUTH_PASSWORD_VALIDATORS\` 配置密码强度规则：

\`\`\`python
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},  # 常见密码黑名单
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},  # 全数字禁用
]
\`\`\`

\`UserAttributeSimilarityValidator\` 检查密码和用户名/邮箱太相似（防 "username123"）。

## 七、权限系统

### 1. 默认权限

每个模型自动生成 4 个权限：

- \`<app>.add_<model>\`：添加权限
- \`<app>.change_<model>\`：修改权限
- \`<app>.delete_<model>\`：删除权限
- \`<app>.view_<model>\`：查看权限（Django 2.1+）

比如 \`blog\` 应用的 \`Article\` 模型，自动有：

\`\`\`text
blog.add_article
blog.change_article
blog.delete_article
blog.view_article
\`\`\`

\`migrate\` 时这些权限会写入 \`auth_permission\` 表。

### 2. 自定义权限

\`\`\`python
class Article(models.Model):
    # ...

    class Meta:
        permissions = [
            ("publish_article", "可以发布文章"),
            ("unpublish_article", "可以下架文章"),
            ("edit_others_article", "可以编辑他人文章"),
        ]
\`\`\`

\`migrate\` 后这些自定义权限也会进表。

### 3. 给用户/分组授权

\`\`\`python
from django.contrib.auth.models import Permission, Group

# 给用户加权限
user.user_permissions.add(Permission.objects.get(codename="publish_article"))

# 检查权限
user.has_perm("blog.publish_article")          # True/False
user.has_perms(["blog.add_article", "blog.change_article"])  # 多权限同时检查
user.has_module_perms("blog")                  # 是否对 blog 应用有任何权限

# 超级用户（is_superuser=True）拥有所有权限，无需显式授权

# 创建分组并授权
editors, _ = Group.objects.get_or_create(name="editors")
editors.permissions.add(
    Permission.objects.get(codename="add_article"),
    Permission.objects.get(codename="change_article"),
)
# 用户加入分组，自动继承分组权限
user.groups.add(editors)
\`\`\`

### 4. @permission_required 装饰器

\`\`\`python
from django.contrib.auth.decorators import permission_required, login_required

@permission_required("blog.publish_article", raise_exception=True)
def publish_article(request, pk):
    """只有有 publish_article 权限的用户能访问"""
    article = get_object_or_404(Article, pk=pk)
    article.status = "published"
    article.save()
    return redirect("blog:detail", pk=pk)

# 多个权限（默认 AND）
@permission_required(["blog.add_article", "blog.change_article"])
def article_create_or_edit(request):
    ...

# CBV 用 method_decorator
@method_decorator(permission_required("blog.publish_article", raise_exception=True),
                  name="dispatch")
class PublishView(View):
    ...
\`\`\`

### 5. 模板里检查权限

\`django.contrib.auth.context_processors.auth\` 会自动注入 \`perms\` 变量：

\`\`\`html
{% if perms.blog.publish_article %}
  <a href="{% url 'blog:publish' article.id %}">发布</a>
{% endif %}

{% if perms.blog.add_article and perms.blog.change_article %}
  ...
{% endif %}
\`\`\`

## 八、Session 认证 vs Token 认证

### 1. Session 认证（Django 默认）

工作流程：

1. 用户登录，\`login(request, user)\` 把 \`user.id\` 写入 session。
2. Session 数据存在服务端（数据库/缓存/文件），返回 sessionid 给浏览器（cookie）。
3. 后续请求带 cookie，Django 解析 sessionid 找到对应用户。

特点：

- 状态有：服务端要存 session。
- 浏览器友好：cookie 自动带。
- 跨域难：cookie 受同源策略限制。
- 不适合移动端/前后端分离：跨域 + 多端共享难。

### 2. Token 认证

工作流程：

1. 用户登录，服务端返回一个 token（JWT 或随机串）。
2. 客户端把 token 存起来（localStorage / cookie）。
3. 后续请求在 \`Authorization\` 头里带 \`Bearer <token>\`。
4. 服务端校验 token 找到用户。

特点：

- 无状态：服务端不存 session（JWT 自包含）。
- 跨域友好：header 不受 cookie 限制。
- 适合前后端分离、移动端、第三方接入。

### 3. Django REST Framework 的 Token 认证

\`\`\`python
# settings.py
INSTALLED_APPS = [..., "rest_framework", "rest_framework.authtoken"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}
\`\`\`

\`\`\`python
# 获取 token
from rest_framework.authtoken.models import Token
token, created = Token.objects.get_or_create(user=user)
print(token.key)    # 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
\`\`\`

客户端请求带 \`Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b\`。

## 九、SimpleJWT 简介

JWT（JSON Web Token）是无状态 token 的主流方案，结构：

\`\`\`text
<header>.<payload>.<signature>
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.abc123...
\`\`\`

- header：算法和类型
- payload：声明（user_id、exp、iat 等）
- signature：用密钥对前两部分签名，防篡改

DRF 的 \`djangorestframework-simplejwt\` 库提供 JWT 认证，支持 access + refresh 双 token 机制：

\`\`\`bash
pip install djangorestframework-simplejwt
\`\`\`

\`\`\`python
# settings.py
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),     # access token 有效期
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),        # refresh token 有效期
    "ROTATE_REFRESH_TOKENS": True,                       # 刷新时发新 refresh token
    "AUTH_HEADER_TYPES": ("Bearer",),                   # Authorization: Bearer <token>
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}
\`\`\`

\`\`\`python
# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view()),         # 登录，返回 access + refresh
    path("api/token/refresh/", TokenRefreshView.as_view()),    # 用 refresh 换新 access
    path("api/token/verify/", TokenVerifyView.as_view()),      # 校验 token
]
\`\`\`

客户端使用流程：

\`\`\`text
1. POST /api/token/ {username, password}
   → 返回 {access: "xxx", refresh: "yyy"}

2. 业务请求带 Authorization: Bearer <access>

3. access 过期后，POST /api/token/refresh/ {refresh: "yyy"}
   → 返回新的 {access, refresh}
\`\`\`

access token 短命（15 分钟）用于业务请求，refresh token 长命（7 天）只用于换 access，被盗风险低。

## 十、小结

- \`django.contrib.auth\` 提供完整的用户/权限/分组系统，开箱即用。
- User 模型推荐项目开始就自定义（继承 \`AbstractUser\`），通过 \`AUTH_USER_MODEL\` 注册。
- \`create_user\`/\`set_password\` 自动哈希密码，禁止明文存密码。
- \`authenticate\` 校验密码，\`login\` 写 session，\`logout\` 清 session。
- 内置 \`django.contrib.auth.urls\` 提供登录/登出/改密/重置密码全套视图。
- 权限按模型自动生成（add/change/delete/view），可自定义；分组批量授权。
- \`@permission_required\` 装饰器、模板 \`{% if perms.app.codename %}\` 控制权限。
- Session 认证有状态、浏览器友好；Token 认证无状态、跨域友好、适合前后端分离。
- SimpleJWT 提供 access + refresh 双 token，access 短命防泄露，refresh 长命换 access。`,
  },

  // ============================================================
  // 第 6 章：Admin 后台与部署
  // ============================================================
  {
    id: "pyweb2-django-admin",
    group: "Django 框架",
    icon: "⚙️",
    title: "Admin 后台与部署",
    content: `## 一、Admin 后台简介

Django Admin 是整个框架最「杀手级」的特性之一。它根据你的模型自动生成一个**功能完整的管理后台**——列表、详情、增删改查、搜索、过滤、批量操作、权限控制，全都有，几乎不用写代码。

一句话：**Admin 让运营/编辑/管理员直接管理数据，开发者不用再为「后台」单独写一套 CRUD 界面。**

为什么 Django 这么贴心？因为它最初就是为新闻网站（劳伦斯日报）做的，编辑每天要发文章、改文章，Admin 就是给编辑用的。这种「内容管理」基因保留至今。

## 二、Admin 站点配置

### 1. 启用 Admin

新建项目时 Admin 默认已启用，确认 \`INSTALLED_APPS\` 里有：

\`\`\`python
INSTALLED_APPS = [
    "django.contrib.admin",         # Admin 站点
    "django.contrib.auth",          # 认证（Admin 依赖）
    "django.contrib.contenttypes",  # 内容类型（权限系统依赖）
    "django.contrib.messages",      # 消息框架（Admin 显示提示）
    "django.contrib.sessions",      # Session（登录用）
    # ...
]

MIDDLEWARE = [
    # ...
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]
\`\`\`

URL 配置（默认已加）：

\`\`\`python
# mysite/urls.py
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
\`\`\`

### 2. 创建超级管理员

\`\`\`bash
python manage.py createsuperuser

# 交互式输入：
# Username: admin
# Email: admin@example.com
# Password: ********
# Password (again): ********

# 之后访问 http://127.0.0.1:8000/admin/ 登录
\`\`\`

\`is_staff=True\` 的用户才能登录 Admin（超级管理员自动满足）。

### 3. 自定义 Admin 站点

\`\`\`python
# mysite/admin.py（项目级）
from django.contrib import admin

# 修改站点标题（浏览器标签栏）
admin.site.site_header = "我的博客后台"
admin.site.site_title = "博客管理"          # <title>
admin.site.index_title = "欢迎来到管理界面"   # 首页大标题
admin.site.site_url = "/blog/"              # 右上角"查看站点"链接
\`\`\`

## 三、注册模型

### 1. 最简注册

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Article, Category, Tag

# 方式 1：最简注册，一行搞定
admin.site.register(Article)
admin.site.register(Category)
admin.site.register(Tag)
\`\`\`

注册后 Admin 后台就能看到这三个模型的列表，点进去能增删改查，但默认列表只有一行「Article object」，体验差。

### 2. ModelAdmin 自定义

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Article, Category

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """文章 Admin 配置"""
    # 列表页显示的字段
    list_display = ("title", "category", "status", "views", "pub_date")

    # 列表页右侧过滤器
    list_filter = ("status", "category", "pub_date")

    # 搜索框（按这些字段搜索）
    search_fields = ("title", "content")

    # 默认排序
    ordering = ("-pub_date",)

    # 分页
    list_per_page = 20

    # 可编辑字段（直接在列表页改，点保存）
    list_editable = ("status",)

    # 时间层级过滤（按日期钻取）
    date_hierarchy = "pub_date"

    # 详情页字段分组
    fieldsets = (
        (None, {
            "fields": ("title", "category", "tags", "status")
        }),
        ("内容", {
            "fields": ("content",),
            "classes": ("wide",),    # CSS 类
        }),
        ("高级", {
            "fields": ("views",),
            "classes": ("collapse",),  # 默认折叠
        }),
    })

    # 只读字段（详情页显示但不能改）
    readonly_fields = ("views", "pub_date")

    # 自动填充 slug
    prepopulated_fields = {"slug": ("title",)}

    # 原地保存时执行的动作
    save_on_top = True       # 顶部也显示保存按钮
    save_as = True           # "保存为新"按钮（复制）

admin.site.register(Category)
\`\`\`

### 3. list_display 详解

\`list_display\` 是最常用的配置，控制列表页显示哪些列。除了模型字段，还能放方法名：

\`\`\`python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "colored_status", "view_count", "is_recent")

    def colored_status(self, obj):
        """自定义列：根据状态显示彩色标签"""
        colors = {
            "draft": "gray",
            "published": "green",
            "archived": "red",
        }
        color = colors.get(obj.status, "black")
        return f'<span style="color:{color}">{obj.get_status_display()}</span>'
    colored_status.short_description = "状态"      # 列标题
    colored_status.allow_tags = True               # 允许 HTML（Django 1.x 写法）
    colored_status.admin_order_field = "status"    # 点击列标题排序的字段

    def view_count(self, obj):
        """自定义列：格式化显示"""
        return f"{obj.views:,} 次"     # 千分位
    view_count.short_description = "浏览量"

    def is_recent(self, obj):
        """自定义列：布尔标记"""
        from datetime import timedelta
        from django.utils import timezone
        return obj.pub_date > timezone.now() - timedelta(days=7)
    is_recent.short_description = "近 7 天"
    is_recent.boolean = True     # 渲染成对勾/叉号图标
\`\`\`

### 4. list_filter 过滤器

\`\`\`python
list_filter = ("status", "category", "pub_date")

# 日期过滤自动按"今天/本周/本月/今年"分组
# 也可以自定义过滤器
class StatusFilter(admin.SimpleListFilter):
    """自定义过滤器"""
    title = "状态"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        """可选值"""
        return [
            ("published", "已发布"),
            ("draft", "草稿"),
            ("popular", "热门（浏览 > 100）"),
        ]

    def queryset(self, request, queryset):
        """根据选择的值过滤查询集"""
        value = self.value()
        if value == "popular":
            return queryset.filter(views__gt=100)
        if value:
            return queryset.filter(status=value)
        return queryset

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_filter = (StatusFilter, "category")
\`\`\`

### 5. search_fields 搜索

\`\`\`python
search_fields = ("title", "content", "category__name", "author__username")
# 用 __ 跨表搜索
# 默认用 LIKE '%keyword%'，性能不好（大数据量要全文搜索）
\`\`\`

## 四、自定义表单

Admin 详情页用的是 ModelForm，可以自定义：

\`\`\`python
from django import forms
from .models import Article

class ArticleAdminForm(forms.ModelForm):
    """文章 Admin 表单"""
    class Meta:
        model = Article
        fields = "__all__"

    def clean_title(self):
        title = self.cleaned_data["title"]
        if len(title) < 5:
            raise forms.ValidationError("标题至少 5 个字")
        return title

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    form = ArticleAdminForm

    # 字段顺序
    fields = ("title", "category", "tags", "status", "content")

    # 字段横向布局（多个字段一行）
    # fields = (("title", "status"), ("category", "tags"), "content")

    # 排除某些字段
    # exclude = ("views",)

    # 自定义 widget
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields["content"].widget.attrs.update({
            "rows": 20, "class": "markdown-editor"
        })
        return form
\`\`\`

## 五、内联编辑

如果两个模型有外键关系（比如文章和评论），可以在文章详情页直接编辑评论，叫「内联」：

\`\`\`python
class CommentInline(admin.TabularInline):    # 或 StackedInline
    """评论内联：在文章页显示评论列表，可增删改"""
    model = Comment
    extra = 3              # 默认显示 3 个空行
    fields = ("author", "body", "created_at")
    readonly_fields = ("created_at",)
    # 自动关联：不需要重复指定 article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    inlines = [CommentInline]
    # ...
\`\`\`

- \`TabularInline\`：表格形式，紧凑。
- \`StackedInline\`：堆叠形式，每个对象一块。

## 六、Admin 动作（actions）

动作是列表页下拉框里的批量操作，比如「批量删除」「批量发布」。

\`\`\`python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    actions = ["make_published", "make_archived", "export_as_csv"]

    def make_published(self, request, queryset):
        """批量发布"""
        count = queryset.update(status="published")
        self.message_user(request, f"已发布 {count} 篇文章", level="success")
    make_published.short_description = "发布选中文章"
    make_published.allowed_permissions = ("change",)   # 有 change 权限才能用

    def make_archived(self, request, queryset):
        """批量归档"""
        queryset.update(status="archived")
        self.message_user(request, "已归档")
    make_archived.short_description = "归档选中文章"

    def export_as_csv(self, request, queryset):
        """批量导出 CSV"""
        import csv
        from django.http import HttpResponse
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=articles.csv"
        writer = csv.writer(response)
        writer.writerow(["ID", "标题", "状态", "浏览量"])
        for article in queryset:
            writer.writerow([article.id, article.title, article.status, article.views])
        return response
    export_as_csv.short_description = "导出为 CSV"
\`\`\`

\`actions\` 列表里的字符串是方法名，下拉框显示 \`short_description\`。

## 七、Admin 权限控制

Admin 自动遵守权限系统：

- 有 \`blog.view_article\` 才能看文章列表。
- 有 \`blog.add_article\` 才能新增。
- 有 \`blog.change_article\` 才能修改。
- 有 \`blog.delete_article\` 才能删除。

### 限制可见数据

\`\`\`python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        """普通用户只能看自己的文章，超级管理员能看所有"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    def has_change_permission(self, request, obj=None):
        """只有作者本人能改自己的文章"""
        if obj is not None and obj.author != request.user and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        """同上，删除权限"""
        if obj is not None and obj.author != request.user and not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)
\`\`\`

## 八、生产部署清单

把 Django 从开发搬上生产，要做一堆配置调整。Django 官方有完整的 [Deployment checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)，核心几条：

### 1. 关键 settings 改造

\`\`\`python
# settings.py（生产版）
import os

# 1. DEBUG 必须关
DEBUG = False

# 2. SECRET_KEY 不能硬编码，从环境变量取
SECRET_KEY = os.environ["SECRET_KEY"]   # 别用默认值，缺失就报错

# 3. ALLOWED_HOSTS 必须配具体域名
ALLOWED_HOSTS = ["example.com", "www.example.com"]

# 4. 数据库换 PostgreSQL/MySQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": "5432",
        "CONN_MAX_AGE": 60,    # 连接复用 60 秒
    }
}

# 5. 缓存用 Redis/Memcached
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}

# 6. 静态文件
STATIC_ROOT = "/var/www/mysite/static/"   # collectstatic 收集到这里
STATIC_URL = "/static/"

# 7. 媒体文件（用户上传）
MEDIA_ROOT = "/var/www/mysite/media/"
MEDIA_URL = "/media/"

# 8. 安全相关
SECURE_SSL_REDIRECT = True              # HTTP 自动跳 HTTPS
SESSION_COOKIE_SECURE = True            # cookie 只走 HTTPS
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000          # HSTS 一年
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"                # 防点击劫持

# 9. 日志
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "WARNING",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "/var/log/mysite/django.log",
            "maxBytes": 1024 * 1024 * 10,    # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
        "mail_admins": {
            "level": "ERROR",
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "WARNING",
            "propagate": True,
        },
        "mysite": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": True,
        },
    },
}
\`\`\`

### 2. 用 check 命令自检

\`\`\`bash
python manage.py check --deploy
\`\`\`

它会输出一系列警告，比如「SECRET_KEY 太短」「DEBUG 还开着」「没配 SECURE_SSL_REDIRECT」等，照着修就行。

## 九、静态文件收集

开发时 \`django.contrib.staticfiles\` 自动服务静态文件，生产时不工作（性能差且不安全）。需要用 \`collectstatic\` 把所有静态文件收集到一个目录，由 Nginx 直接服务。

\`\`\`bash
# 把所有应用的静态文件（包括 admin）收集到 STATIC_ROOT
python manage.py collectstatic

# 输出类似：
# Copying '/static/css/style.css'
# Copying '/static/js/app.js'
# ...
# 62 static files copied to '/var/www/mysite/static'.
\`\`\`

Nginx 配置：

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    location /static/ {
        alias /var/www/mysite/static/;    # 直接服务静态文件
        expires 30d;                       # 浏览器缓存 30 天
    }

    location /media/ {
        alias /var/www/mysite/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;    # 反代到 Gunicorn
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## 十、WSGI 部署

Django 是 WSGI 应用，生产用 Gunicorn（最流行）或 uWSGI 部署。

### 1. 项目里的 wsgi.py

\`\`\`python
# mysite/wsgi.py（自动生成）
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
application = get_wsgi_application()
\`\`\`

\`application\` 就是 WSGI 入口，Gunicorn 会找它。

### 2. Gunicorn 部署

\`\`\`bash
# 安装
pip install gunicorn

# 启动（最简）
gunicorn mysite.wsgi:application

# 常用参数
gunicorn mysite.wsgi:application \\
    --bind 0.0.0.0:8000 \\
    --workers 4 \\                          # worker 数，建议 2*CPU+1
    --threads 2 \\                           # 每个 worker 的线程数
    --timeout 30 \\                          # 请求超时
    --max-requests 1000 \\                   # 处理 1000 请求后重启 worker（防内存泄漏）
    --max-requests-jitter 50 \\
    --access-logfile - \\                     # 访问日志输出到 stdout
    --error-logfile - \\
    --daemon                                  # 后台运行

# 通过环境变量传配置
DJANGO_SETTINGS_MODULE=mysite.settings_prod gunicorn mysite.wsgi:application
\`\`\`

### 3. 用 systemd 管理 Gunicorn

\`\`\`ini
# /etc/systemd/system/mysite.service
[Unit]
Description=MySite Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mysite
Environment="DJANGO_SETTINGS_MODULE=mysite.settings"
Environment="SECRET_KEY=xxxxx"
Environment="DB_PASSWORD=xxxxx"
ExecStart=/var/www/mysite/venv/bin/gunicorn \\
    --workers 4 \\
    --bind 127.0.0.1:8000 \\
    mysite.wsgi:application
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl start mysite
sudo systemctl enable mysite     # 开机自启
sudo systemctl status mysite
sudo journalctl -u mysite -f     # 查看日志
\`\`\`

### 4. 完整部署架构

\`\`\`text
                    ┌──────────────┐
   HTTPS 443 ─────► │   Nginx      │
                    │  反向代理     │
                    │  + 静态文件   │
                    └──────┬───────┘
                           │ HTTP 127.0.0.1:8000
                           ▼
                    ┌──────────────┐
                    │  Gunicorn    │
                    │  WSGI 服务器  │
                    │  (4 workers) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │PostgreSQL│  │  Redis  │  │  其他   │
        │  数据库  │  │  缓存   │  │  服务   │
        └─────────┘  └─────────┘  └─────────┘
\`\`\`

层次职责：

- **Nginx**：HTTPS 终止、静态文件服务、负载均衡、限流。
- **Gunicorn**：WSGI 容器，跑 Django 应用，多 worker 提并发。
- **PostgreSQL/MySQL**：业务数据。
- **Redis**：缓存、Session、Celery 队列。

### 5. ASGI 异步部署

Django 3.0+ 支持 ASGI，需要异步特性（WebSocket、长连接）时用 Uvicorn/Daphne：

\`\`\`bash
pip install uvicorn

# 启动
uvicorn mysite.asgi:application --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

异步部署适合 IO 密集场景，但要注意：Django ORM 大部分仍是同步的，异步视图中调用 ORM 要 \`sync_to_async\` 包裹，否则会阻塞事件循环。

## 十一、部署后第一次要做的事

\`\`\`bash
# 1. 应用迁移
python manage.py migrate

# 2. 收集静态文件
python manage.py collectstatic --noinput

# 3. 压缩 JS/CSS（如果用了 django-compressor）
python manage.py compress

# 4. 创建超级管理员（如果还没有）
python manage.py createsuperuser

# 5. 检查部署
python manage.py check --deploy

# 6. 重启 Gunicorn
sudo systemctl restart mysite
\`\`\`

## 十二、小结

- Django Admin 自动生成管理后台，几乎零代码，运营直接用。
- \`@admin.register(Model)\` + \`ModelAdmin\` 配置列表/详情页样式。
- 关键配置：\`list_display\`（列）、\`list_filter\`（过滤）、\`search_fields\`（搜索）、\`date_hierarchy\`（时间钻取）、\`fieldsets\`（分组）、\`readonly_fields\`（只读）。
- 内联编辑（\`TabularInline\`/\`StackedInline\`）让相关模型在父模型详情页编辑。
- Actions 实现批量操作，重写 \`get_queryset\`/\`has_*_permission\` 控制可见数据和权限。
- 生产部署：\`DEBUG=False\`、\`SECRET_KEY\` 环境变量、\`ALLOWED_HOSTS\`、HTTPS 强制、PostgreSQL + Redis。
- \`collectstatic\` 收集静态文件，Nginx 直接服务。
- Gunicorn + systemd 管理 WSGI 应用，Nginx 反代 + 静态文件 + HTTPS。
- 异步场景用 Uvicorn + ASGI，但 ORM 仍主要同步，慎用异步视图。`,
  },
];
