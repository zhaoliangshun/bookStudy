// =============================================================
// Python Web 应用开发实战教程 - 第 5 批章节(Django 入门 4 章)
// -------------------------------------------------------------
// 本批包含 4 章:
//   django-intro   : Django 框架入门
//   django-settings: Django 配置与项目结构
//   django-url-view: Django URL 路由与视图
//   django-template: Django 模板系统
//
// 教程定位:纯阅读型,代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」,框架会变,Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 17 章:Django 框架入门
  // ============================================================
  {
    id: "django-intro",
    group: "Django 入门",
    icon: "🎯",
    title: "Django 框架入门",
    content: `# Django 框架入门

## 一句话定义

Django 是一个基于 Python 的高级全栈 Web 框架,鼓励快速开发、干净、务实的设计。它的官方口号是 **"The web framework for perfectionists with deadlines"**(为有 deadline 的完美主义者准备的 Web 框架)。由 Adrian Holovaty 和 Simon Willison 于 2003 年创建,2005 年开源发布,以比利时吉普赛爵士吉他手 Django Reinhardt 命名。

拆开看几个关键词:

- **全栈**:从 ORM、模板、表单、认证、路由到后台管理,Django 全部内置,开箱即用。
- **快速开发**:约定优于配置,大量默认配置直接可用,几乎不用写样板代码。
- **务实设计**:遵循 DRY(Don't Repeat Yourself)原则,强调代码复用。
- **有 deadline 的完美主义者**:既要在期限内交付,又不想写烂代码,Django 替你做了大量基础设施工作。

## Django 的核心特点

### 1. 全家桶式设计

这是 Django 和 Flask 最大的区别。Flask 是微框架,只给你路由和请求响应,其余(ORM、表单、认证、后台)都要自己挑第三方库。Django 反过来,这些全部内置:

| 组件 | Django 内置 | Flask 需要 |
|---|---|---|
| ORM | Django ORM | SQLAlchemy |
| 模板引擎 | Django Template Language | Jinja2 |
| 表单 | django.forms | Flask-WTF |
| 认证 | django.contrib.auth | Flask-Login |
| 后台管理 | django.contrib.admin | 无(需自建) |
| 路由 | django.urls | Flask 路由 |
| 中间件 | django.middleware | Flask 钩子 |

全家桶的好处是「开箱即用 + 高度集成」,坏处是「替换组件困难」。如果你用 Django,基本就接受它的全套约定。

### 2. MTV 架构

Django 把经典的 MVC 架构改了个名字,叫 **MTV**(Model-Template-View):

- **Model(模型)**:数据层,定义数据结构和数据库交互,对应 MVC 的 Model。
- **Template(模板)**:表现层,渲染 HTML,对应 MVC 的 View。
- **View(视图)**:控制层,处理请求逻辑、调用 Model、返回 Template,对应 MVC 的 Controller。

为什么要改名?Django 团队认为,在 Web 框架里叫 "View" 的那个东西,实际上是「处理请求、返回响应」的逻辑,和 MVC 里"展示界面"的 View 概念不符。为了语义更清晰,Django 把"控制逻辑"叫 View,把"展示层"叫 Template。本质还是分层解耦,只是名词不同。

### 3. 内置 Admin 后台

这是 Django 的「杀手锏」。只要你定义好 Model,Django 自动生成一套完整的管理后台:列表页、详情页、增删改查、筛选、搜索、分页,全都有。建站初期,后台管理直接省下一周工作量。

### 4. 强大的 ORM

Django ORM 用 Python 类定义数据模型,自动映射到数据库表,提供链式查询 API。会写 Python 就能查数据库,几乎不用写 SQL。

## 安装 Django

Django 是纯 Python 包,用 pip 安装即可:

\`\`\`bash
# 安装最新稳定版
# 安装 Python 包: django
pip install django

# 指定版本安装
# 安装 Python 包: django==4.2
pip install django==4.2

# 查看版本
# 以模块方式运行 django
python -m django --version
# 输出:4.2.x
\`\`\`

Django 是 LTS(长期支持版)策略,每个版本支持约 3 年。生产环境建议选 LTS 版本(如 4.2 LTS),避免频繁升级。

## 创建第一个项目

### 1. 用 startproject 创建项目

\`\`\`bash
# 语法:django-admin startproject 项目名 [目标目录]
# django-admin startproject mysite
django-admin startproject mysite

# 进入项目目录
# 切换到目录 mysite
cd mysite
\`\`\`

执行后会生成这样的目录结构:

\`\`\`
mysite/                  # 项目根目录(可随意改名)
├── manage.py            # 命令行工具(管理项目)
└── mysite/              # 项目包(与项目同名,不可随意改名)
    ├── __init__.py      # 空文件,标识这是个 Python 包
    ├── settings.py      # 项目配置文件
    ├── urls.py          # 根路由配置
    ├── asgi.py          # ASGI 入口(异步部署用)
    └── wsgi.py          # WSGI 入口(同步部署用)
\`\`\`

区分两个概念:

- **项目(Project)**:整个 Web 应用,包含配置和多个应用。
- **应用(App)**:一个具体的功能模块,可插拔、可复用。一个项目可以包含多个应用。

### 2. 创建应用

Django 鼓励把功能拆成多个 App。比如博客站,可以拆成 blog(文章)、comments(评论)、users(用户)等。

\`\`\`bash
# 在项目根目录下执行
# 运行 Python 脚本 manage.py
python manage.py startapp blog

# 生成应用目录结构
# blog/
# ├── __init__.py
# ├── admin.py      # Admin 后台配置
# ├── apps.py       # 应用配置
# ├── migrations/    # 数据库迁移文件目录
# ├── models.py     # 数据模型定义
# ├── tests.py      # 测试代码
# └── views.py      # 视图函数
\`\`\`

创建 App 后,需要在 \`settings.py\` 的 \`INSTALLED_APPS\` 里注册才能生效:

\`\`\`python
# mysite/settings.py
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    "django.contrib.admin",       # 内置后台
    "django.contrib.auth",        # 内置认证
    # "django.contrib.contenttypes", # 内容类型
    "django.contrib.contenttypes", # 内容类型
    "django.contrib.sessions",    # Session
    "django.contrib.messages",    # 消息框架
    # "django.contrib.staticfiles", # 静态文件
    "django.contrib.staticfiles", # 静态文件
    # 注册自己的应用
    # "blog",
    "blog",
# ]
]
\`\`\`

### 3. 启动开发服务器

\`\`\`bash
# 运行 Python 脚本 manage.py
python manage.py runserver

# 输出:
# Watching for file changes with StatReloader
# Performing system checks...
#
# System check identified no issues (0 silenced).
#
# You have 18 unapplied migration(s). Your project may not work properly
# until you apply the migrations for app(s): admin, auth, contenttypes, sessions.
# Run 'python manage.py migrate' to apply them.
#
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C.
\`\`\`

浏览器访问 \`http://127.0.0.1:8000/\` 就能看到 Django 欢迎页。

注意几点:

- 这是**开发服务器**,默认 8000 端口,自动热重载,**严禁用于生产**。
- 提示有未执行的迁移,执行 \`python manage.py migrate\` 创建内置表。
- 指定端口和 IP:\`python manage.py runserver 0.0.0.0:8080\`。

## 完整示例:第一个 Django 项目

让我们把整套流程串起来,做一个「Hello World」博客首页。

### 第一步:创建项目和应用

\`\`\`bash
# django-admin startproject mysite
django-admin startproject mysite
# 切换到目录 mysite
cd mysite
# 运行 Python 脚本 manage.py
python manage.py startapp blog
\`\`\`

### 第二步:注册应用

\`\`\`python
# mysite/settings.py
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ... 默认应用
    "blog",  # 注册 blog 应用
# ]
]
\`\`\`

### 第三步:写视图

\`\`\`python
# blog/views.py
# 从 django.http 导入 HttpResponse
from django.http import HttpResponse

# 视图函数:接收一个 HttpRequest,返回一个 HttpResponse
# 定义函数 index，参数: request
def index(request):
    # request.method 是请求方法,如 "GET"/"POST"
    # request.GET/request.POST 是查询参数
    # 返回 HttpResponse("<h1>欢迎来到我的博客</h1>")
    return HttpResponse("<h1>欢迎来到我的博客</h1>")
\`\`\`

### 第四步:配置应用路由

每个应用有自己的 \`urls.py\`,叫「URLconf」:

\`\`\`python
# blog/urls.py(新建此文件)
# 从 django.urls 导入 path
from django.urls import path
# 从 . 导入 views
from . import views

# urlpatterns 是 Django 约定的路由列表
# 定义列表 urlpatterns
urlpatterns = [
    # path(路由模式, 视图函数, name=别名)
    # 调用 path()
    path("", views.index, name="index"),
# ]
]
\`\`\`

### 第五步:包含到根路由

\`\`\`python
# mysite/urls.py
# 从 django.contrib 导入 admin
from django.contrib import admin
# 从 django.urls 导入 path, include
from django.urls import path, include

# 定义列表 urlpatterns
urlpatterns = [
    path("admin/", admin.site.urls),        # 后台路由
    path("blog/", include("blog.urls")),    # 包含 blog 应用的路由
# ]
]
\`\`\`

现在访问 \`http://127.0.0.1:8000/blog/\` 就能看到「欢迎来到我的博客」。

### 第六步:执行数据库迁移

\`\`\`bash
# 生成迁移文件(根据 Model 变化)
# 运行 Python 脚本 manage.py
python manage.py makemigrations

# 应用迁移(执行 SQL 建表)
# 运行 Python 脚本 manage.py
python manage.py migrate
\`\`\`

### 第七步:创建超级用户访问后台

\`\`\`bash
# 运行 Python 脚本 manage.py
python manage.py createsuperuser
# 输入用户名、邮箱、密码
\`\`\`

访问 \`http://127.0.0.1:8000/admin/\` 用超级用户登录,就能看到内置后台。

## Django vs Flask 对比

| 维度 | Django | Flask |
|---|---|---|
| 定位 | 全栈框架(全家桶) | 微框架(最小核心) |
| 内置组件 | ORM/模板/表单/认证/Admin | 仅路由和请求响应 |
| 学习曲线 | 陡(要学全套约定) | 缓(从 hello 开始) |
| 开发速度 | 大项目快(约定现成) | 小项目快(灵活自由) |
| 灵活性 | 低(组件强耦合) | 高(自由组合第三方库) |
| 适合场景 | 内容站/CMS/后台系统 | API 服务/微服务/原型 |
| ORM | Django ORM(强耦合) | SQLAlchemy(独立) |
| 后台 | 内置 Admin | 需自建 |
| 社区 | 大而稳 | 大而活 |

选型建议:

- 业务有大量 CRUD、需要后台管理、团队大、维护周期长 → **Django**。
- 做 API 服务、追求灵活、微服务架构、团队小 → **Flask**。
- 两者都能做 REST API,Django 用 DRF(Django REST Framework)更顺手。

## 常用 manage.py 命令

\`\`\`bash
python manage.py runserver         # 启动开发服务器
python manage.py makemigrations     # 生成迁移文件
python manage.py migrate            # 执行数据库迁移
python manage.py createsuperuser    # 创建超级用户
python manage.py shell              # 进入 Django 交互环境
python manage.py dbshell            # 进入数据库命令行
python manage.py startapp appname   # 创建应用
python manage.py test               # 运行测试
python manage.py collectstatic      # 收集静态文件(部署用)
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 修改了 Model 没生效 | 忘了 makemigrations + migrate | 两步都执行 |
| 应用没注册 | settings.py 的 INSTALLED_APPS 漏了 | 加上应用名 |
| 访问 /admin/ 报 404 | 没配 admin 路由 | 在根 urls.py 加 admin.site.urls |
| 模板找不到 | 模板路径没配或放错位置 | 检查 TEMPLATES 配置 |
| 静态文件 404 | DEBUG=False 时不自动服务 | 用 collectstatic + nginx |
| 端口被占 | 8000 被其他进程占用 | runserver 0:8080 换端口 |
| 中文乱码 | 文件编码不是 UTF-8 | 保存为 UTF-8 |
| 改了代码没生效 | 没保存或被 __pycache__ 缓存 | 删除 __pycache__ |

## 设计思想

Django 的核心思想是**「不要重复造轮子」和「约定优于配置」**。它把 Web 开发中反复出现的模式(增删改查、认证、表单、后台)封装成可复用的组件,让你专注业务逻辑。这种"全家桶"策略的代价是灵活性下降,但换来的是开发速度和维护成本的大幅降低。理解 Django 的关键不是记住多少 API,而是理解它的分层思想:Model 管数据,View 管逻辑,Template 管展示,URL 把请求分发给 View。
`,
  },

  // ============================================================
  // 第 18 章:Django 配置与项目结构
  // ============================================================
  {
    id: "django-settings",
    group: "Django 入门",
    icon: "⚙️",
    title: "Django 配置与项目结构",
    content: `# Django 配置与项目结构

## settings.py 是什么

\`settings.py\` 是 Django 项目的「大脑」,所有全局配置都集中在这个文件里:数据库连哪个、装了哪些应用、中间件链是什么、模板放哪、静态文件怎么处理、密钥是什么、DEBUG 开不开……全在这里。

Django 启动时第一件事就是读 \`settings.py\`,根据配置初始化整个应用。所以理解 settings 是理解 Django 的前提。

## 核心配置项详解

### 1. BASE_DIR:项目根目录

\`\`\`python
# 从 pathlib 导入 Path
from pathlib import Path

# Path(__file__) 是当前 settings.py 的路径
# resolve().parent.parent 向上两级 = 项目根目录
# 定义变量 BASE_DIR，赋值为 Path(__file__).resolve().parent.parent
BASE_DIR = Path(__file__).resolve().parent.parent
\`\`\`

Django 4.x 开始用 \`pathlib.Path\`,比老的 \`os.path\` 更现代、更清晰。后面所有路径配置都基于 \`BASE_DIR\`。

### 2. SECRET_KEY:密钥

\`\`\`python
# 用于加密签名:Session、CSRF token、密码重置 token
# 必须保密,泄露后可伪造 Session 等敏感数据
# 定义变量 SECRET_KEY，赋值为 "django-insecure-xxxxxxxxxxxxxxxxxxxx"
SECRET_KEY = "django-insecure-xxxxxxxxxxxxxxxxxxxx"
\`\`\`

⚠️ 生产环境绝对不能硬编码在代码里。应该从环境变量读取:

\`\`\`python
# 导入 os 模块
import os
# 定义变量 SECRET_KEY，赋值为 os.environ.get("DJANGO_SECRET_KEY")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
\`\`\`

### 3. DEBUG:调试模式

\`\`\`python
# True:开发模式,出错显示详细堆栈,自动服务静态文件
# False:生产模式,出错只显示 500 页面,静态文件需 nginx 配合
# 定义变量 DEBUG，赋值为 True
DEBUG = True
\`\`\`

⚠️ **生产环境必须设为 False**。DEBUG=True 时,出错页面会暴露代码、环境变量、数据库配置等敏感信息,是重大安全隐患。

### 4. ALLOWED_HOSTS:允许的域名

\`\`\`python
# DEBUG=False 时必填,防止 HTTP Host 头攻击
# 空列表表示不允许任何域名
# "*" 表示允许所有(不安全,慎用)
# 定义列表 ALLOWED_HOSTS
ALLOWED_HOSTS = ["example.com", "www.example.com"]

# 本地开发
# 定义列表 ALLOWED_HOSTS
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]
\`\`\`

### 5. INSTALLED_APPS:已安装应用

\`\`\`python
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # Django 内置应用(一般别删)
    "django.contrib.admin",        # 后台管理
    "django.contrib.auth",         # 用户认证
    # "django.contrib.contenttypes", # 内容类型框架
    "django.contrib.contenttypes", # 内容类型框架
    "django.contrib.sessions",      # Session 框架
    "django.contrib.messages",     # 消息框架
    "django.contrib.staticfiles",  # 静态文件管理

    # 第三方应用(从 pip 安装的)
    "rest_framework",              # Django REST Framework
    "crispy_forms",                # 表单美化

    # 自己的应用
    "blog",                        # 博客应用
    "users",                       # 用户应用
# ]
]
\`\`\`

注意:自己的应用必须在 INSTALLED_APPS 注册,否则 Model 不会被发现、迁移不生效、模板找不到。

### 6. MIDDLEWARE:中间件链

\`\`\`python
# 定义列表 MIDDLEWARE
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",      # 安全相关
    # "django.contrib.sessions.middleware.SessionMiddlew
    "django.contrib.sessions.middleware.SessionMiddleware", # Session
    "django.middleware.common.CommonMiddleware",           # 通用请求处理
    "django.middleware.csrf.CsrfViewMiddleware",          # CSRF 防护
    # "django.contrib.auth.middleware.AuthenticationMidd
    "django.contrib.auth.middleware.AuthenticationMiddleware", # 认证
    "django.contrib.messages.middleware.MessageMiddleware",   # 消息
    # "django.middleware.clickjacking.XFrameOptionsMiddl
    "django.middleware.clickjacking.XFrameOptionsMiddleware", # 防点击劫持
# ]
]
\`\`\`

中间件是「洋葱模型」:请求进来时从上到下依次执行,响应返回时从下到上依次执行。顺序很重要,改了可能出问题。

### 7. DATABASES:数据库配置

默认用 SQLite,无需安装,适合开发:

\`\`\`python
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.sqlite3",
        "ENGINE": "django.db.backends.sqlite3",
        # "NAME": BASE_DIR / "db.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    # }
    }
# }
}
\`\`\`

切换到 MySQL:

\`\`\`python
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.mysql",
        "ENGINE": "django.db.backends.mysql",
        "NAME": "mydb",                  # 数据库名
        "USER": "myuser",                # 用户名
        "PASSWORD": "mypassword",        # 密码
        "HOST": "127.0.0.1",             # 主机
        "PORT": "3306",                  # 端口
        # 可选:连接池参数
        # "OPTIONS": {
        "OPTIONS": {
            "charset": "utf8mb4",        # 支持 emoji 等 4 字节字符
            # "init_command": "SET sql_mode='STRICT_TRANS_TABLES
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        # },
        },
    # }
    }
# }
}
\`\`\`

切换到 PostgreSQL:

\`\`\`python
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.postgresql",
        "ENGINE": "django.db.backends.postgresql",
        # "NAME": "mydb",
        "NAME": "mydb",
        # "USER": "myuser",
        "USER": "myuser",
        # "PASSWORD": "mypassword",
        "PASSWORD": "mypassword",
        # "HOST": "localhost",
        "HOST": "localhost",
        # "PORT": "5432",
        "PORT": "5432",
    # }
    }
# }
}
\`\`\`

⚠️ 切换数据库需要安装对应驱动:

\`\`\`bash
pip install mysqlclient    # MySQL
# 安装 Python 包: psycopg2-binary # PostgreSQL
pip install psycopg2-binary # PostgreSQL
\`\`\`

### 8. TEMPLATES:模板配置

\`\`\`python
# 定义列表 TEMPLATES
TEMPLATES = [
    # {
    {
        # "BACKEND": "django.template.backends.django.Django
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # 模板查找目录(项目级)
        # "DIRS": [BASE_DIR / "templates"],
        "DIRS": [BASE_DIR / "templates"],
        # 是否到应用内 templates/ 找
        # "APP_DIRS": True,
        "APP_DIRS": True,
        # "OPTIONS": {
        "OPTIONS": {
            # "context_processors": [
            "context_processors": [
                # 内置上下文处理器(模板里能直接用这些变量)
                # "django.template.context_processors.debug",
                "django.template.context_processors.debug",
                # "django.template.context_processors.request",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",    # 注入 user
                # "django.contrib.messages.context_processors.messag
                "django.contrib.messages.context_processors.messages", # 注入 messages
            # ],
            ],
        # },
        },
    # },
    },
# ]
]
\`\`\`

\`DIRS\` 配置项目级模板目录,\`APP_DIRS=True\` 让 Django 自动到每个应用的 \`templates/\` 子目录找模板。

### 9. STATIC:静态文件配置

\`\`\`python
# URL 前缀,如 /static/css/style.css
# 定义变量 STATIC_URL，赋值为 "/static/"
STATIC_URL = "/static/"

# 开发时静态文件目录(Django 会从这里服务)
# 定义列表 STATICFILES_DIRS
STATICFILES_DIRS = [
    # BASE_DIR / "static",
    BASE_DIR / "static",
# ]
]

# collectstatic 命令收集到的目录(部署时用 nginx 直接服务)
# 定义变量 STATIC_ROOT，赋值为 BASE_DIR / "staticfiles"
STATIC_ROOT = BASE_DIR / "staticfiles"

# 媒体文件(用户上传的)
# 定义变量 MEDIA_URL，赋值为 "/media/"
MEDIA_URL = "/media/"
# 定义变量 MEDIA_ROOT，赋值为 BASE_DIR / "media"
MEDIA_ROOT = BASE_DIR / "media"
\`\`\`

区别:

- \`STATIC_*\`:开发者写的静态文件(CSS/JS/图片)。
- \`MEDIA_*\`:用户上传的文件(头像、附件)。

## 多环境配置分离

实际项目中,开发/测试/生产环境配置不同(数据库、DEBUG、密钥)。最佳实践是把配置拆分:

\`\`\`
mysite/
├── settings/
│   ├── __init__.py
│   ├── base.py      # 公共配置
│   ├── dev.py       # 开发环境
│   ├── prod.py      # 生产环境
│   └── test.py      # 测试环境
└── ...
\`\`\`

\`\`\`python
# settings/base.py —— 公共配置
# 从 pathlib 导入 Path
from pathlib import Path
# 定义变量 BASE_DIR，赋值为 Path(__file__).resolve().parent.parent.parent
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ... 公共应用
# ]
]
# 其他公共配置...
\`\`\`

\`\`\`python
# settings/dev.py —— 开发环境
# 从 .base 导入 *
from .base import *

# 定义变量 DEBUG，赋值为 True
DEBUG = True
# 定义列表 ALLOWED_HOSTS
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.sqlite3",
        "ENGINE": "django.db.backends.sqlite3",
        # "NAME": BASE_DIR / "db.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    # }
    }
# }
}
\`\`\`

\`\`\`python
# settings/prod.py —— 生产环境
# 从 .base 导入 *
from .base import *
# 导入 os 模块
import os

# 定义变量 DEBUG，赋值为 False
DEBUG = False
# 定义变量 SECRET_KEY，赋值为 os.environ.get("DJANGO_SECRET_KEY")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
# 定义列表 ALLOWED_HOSTS
ALLOWED_HOSTS = ["example.com"]

# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.postgresql",
        "ENGINE": "django.db.backends.postgresql",
        # "NAME": os.environ.get("DB_NAME"),
        "NAME": os.environ.get("DB_NAME"),
        # "USER": os.environ.get("DB_USER"),
        "USER": os.environ.get("DB_USER"),
        # "PASSWORD": os.environ.get("DB_PASSWORD"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        # "HOST": os.environ.get("DB_HOST", "localhost"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        # "PORT": "5432",
        "PORT": "5432",
    # }
    }
# }
}
\`\`\`

启动时通过 \`DJANGO_SETTINGS_MODULE\` 环境变量指定用哪套:

\`\`\`bash
# 开发
# 设置环境变量 DJANGO_SETTINGS_MODULE=mysite.settings.dev
export DJANGO_SETTINGS_MODULE=mysite.settings.dev
# 运行 Python 脚本 manage.py
python manage.py runserver

# 生产(gunicorn 启动)
# 设置环境变量 DJANGO_SETTINGS_MODULE=mysite.settings.prod
export DJANGO_SETTINGS_MODULE=mysite.settings.prod
# gunicorn mysite.wsgi:application
gunicorn mysite.wsgi:application
\`\`\`

或者用命令行参数:

\`\`\`bash
# 运行 Python 脚本 manage.py
python manage.py runserver --settings=mysite.settings.dev
\`\`\`

## 环境变量读取

生产环境的敏感信息(密钥、数据库密码)绝不能硬编码,必须从环境变量读。Python 标准做法:

\`\`\`python
# 导入 os 模块
import os

# 读取环境变量,带默认值
# 定义变量 DEBUG，赋值为 os.environ.get("DJANGO_DEBUG", "False") == "T...
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
# 定义变量 SECRET_KEY，赋值为 os.environ.get("DJANGO_SECRET_KEY")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

# 数据库配置
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.postgresql",
        "ENGINE": "django.db.backends.postgresql",
        # "NAME": os.environ.get("DB_NAME", "mydb"),
        "NAME": os.environ.get("DB_NAME", "mydb"),
        # "USER": os.environ.get("DB_USER", "postgres"),
        "USER": os.environ.get("DB_USER", "postgres"),
        # "PASSWORD": os.environ.get("DB_PASSWORD"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        # "HOST": os.environ.get("DB_HOST", "localhost"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        # "PORT": os.environ.get("DB_PORT", "5432"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    # }
    }
# }
}
\`\`\`

更优雅的方案是 \`python-dotenv\`,从 \`.env\` 文件读:

\`\`\`bash
# 安装 Python 包: python-dotenv
pip install python-dotenv
\`\`\`

\`\`\`python
# .env 文件(加入 .gitignore,绝不提交)
# 定义变量 DJANGO_SECRET_KEY，赋值为 your-secret-key-here
DJANGO_SECRET_KEY=your-secret-key-here
# 定义变量 DB_NAME，赋值为 mydb
DB_NAME=mydb
# 定义变量 DB_USER，赋值为 postgres
DB_USER=postgres
# 定义变量 DB_PASSWORD，赋值为 secret
DB_PASSWORD=secret

# settings.py
# 从 dotenv 导入 load_dotenv
from dotenv import load_dotenv
load_dotenv()  # 加载 .env 文件

# 导入 os 模块
import os
# 定义变量 SECRET_KEY，赋值为 os.environ.get("DJANGO_SECRET_KEY")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
\`\`\`

## Django 项目结构最佳实践

中型项目推荐结构:

\`\`\`
mysite/
├── manage.py
├── requirements.txt        # 依赖列表
├── .env                    # 环境变量(不提交)
├── .gitignore
├── mysite/                 # 项目包
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                   # 所有应用放这
│   ├── __init__.py
│   ├── blog/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   └── users/
├── templates/              # 项目级模板
│   ├── base.html
│   └── blog/
├── static/                 # 项目级静态文件
│   ├── css/
│   ├── js/
│   └── images/
├── media/                  # 用户上传文件
└── tests/                  # 项目级测试
\`\`\`

注意:把应用放在 \`apps/\` 子目录后,需要在 \`settings.py\` 加路径:

\`\`\`python
# 导入 sys 模块
import sys
# 调用 sys.path.insert()
sys.path.insert(0, BASE_DIR / "apps")
\`\`\`

## 完整示例:配置 MySQL 数据库

下面是一个真实项目的数据库配置示例:

\`\`\`python
# settings/prod.py
# 导入 os 模块
import os
# 从 .base 导入 *
from .base import *

# 定义变量 DEBUG，赋值为 False
DEBUG = False
# 定义变量 SECRET_KEY，赋值为 os.environ.get("DJANGO_SECRET_KEY")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
# 定义列表 ALLOWED_HOSTS
ALLOWED_HOSTS = ["www.example.com", "example.com"]

# MySQL 配置
# 定义字典 DATABASES
DATABASES = {
    # "default": {
    "default": {
        # "ENGINE": "django.db.backends.mysql",
        "ENGINE": "django.db.backends.mysql",
        # "NAME": os.environ.get("DB_NAME", "blog_db"),
        "NAME": os.environ.get("DB_NAME", "blog_db"),
        # "USER": os.environ.get("DB_USER", "blog_user"),
        "USER": os.environ.get("DB_USER", "blog_user"),
        # "PASSWORD": os.environ.get("DB_PASSWORD"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        # "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
        "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
        # "PORT": os.environ.get("DB_PORT", "3306"),
        "PORT": os.environ.get("DB_PORT", "3306"),
        # "OPTIONS": {
        "OPTIONS": {
            "charset": "utf8mb4",  # 支持 emoji 等 4 字节字符
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",  # 严格模式
        # },
        },
        "CONN_MAX_AGE": 60,  # 连接复用 60 秒,避免频繁建连
    # }
    }
# }
}

# 日志配置
# 定义字典 LOGGING
LOGGING = {
    # "version": 1,
    "version": 1,
    # "disable_existing_loggers": False,
    "disable_existing_loggers": False,
    # "formatters": {
    "formatters": {
        # "verbose": {
        "verbose": {
            # "format": "[{asctime}] {levelname} {name} {message
            "format": "[{asctime}] {levelname} {name} {message}",
            # "style": "{",
            "style": "{",
        # },
        },
    # },
    },
    # "handlers": {
    "handlers": {
        # "file": {
        "file": {
            # "level": "INFO",
            "level": "INFO",
            # "class": "logging.handlers.RotatingFileHandler",
            "class": "logging.handlers.RotatingFileHandler",
            # "filename": BASE_DIR / "logs" / "django.log",
            "filename": BASE_DIR / "logs" / "django.log",
            "maxBytes": 1024 * 1024 * 10,  # 10MB
            # "backupCount": 5,
            "backupCount": 5,
            # "formatter": "verbose",
            "formatter": "verbose",
        # },
        },
    # },
    },
    # "loggers": {
    "loggers": {
        # "django": {
        "django": {
            # "handlers": ["file"],
            "handlers": ["file"],
            # "level": "INFO",
            "level": "INFO",
            # "propagate": True,
            "propagate": True,
        # },
        },
    # },
    },
# }
}
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| SECRET_KEY 硬编码提交到 git | 安全隐患 | 用环境变量,.env 加入 .gitignore |
| 生产环境 DEBUG=True | 暴露敏感信息 | 设为 False |
| ALLOWED_HOSTS 为空 | 生产环境 400 错误 | 配置允许的域名 |
| MySQL 中文乱码 | charset 不对 | 用 utf8mb4 |
| 应用没注册到 INSTALLED_APPS | Model 不生效、模板找不到 | 加上应用名 |
| 改了配置没重启 | 配置在启动时加载 | 重启 runserver |
| 静态文件 404(DEBUG=False) | 不自动服务静态文件 | collectstatic + nginx |
| 数据库连接报错 | 驱动没装或参数错 | 检查 mysqlclient/psycopg2 |

## 设计思想

Django 的配置设计体现了「集中管理 + 默认合理」的哲学。所有配置集中在 \`settings.py\`,让你一眼看清项目的「骨架」;同时所有配置都有合理默认值,新手项目几乎不用改任何配置就能跑起来。多环境分离(\`base/dev/prod\`)是工程化的关键,把「不变的公共配置」和「环境特定的配置」分开,既能复用又能隔离。
`,
  },

  // ============================================================
  // 第 19 章:Django URL 路由与视图
  // ============================================================
  {
    id: "django-url-view",
    group: "Django 入门",
    icon: "🔗",
    title: "Django URL 路由与视图",
    content: `# Django URL 路由与视图

## URL 路由:把请求分发给视图

Web 框架的核心任务之一是「URL 路由」:把用户访问的 URL 路径映射到对应的处理函数。Django 用一个 \`urlpatterns\` 列表来定义这种映射,放在 \`urls.py\` 文件里。

\`\`\`python
# mysite/urls.py —— 根路由
# 从 django.contrib 导入 admin
from django.contrib import admin
# 从 django.urls 导入 path
from django.urls import path
# 从 blog 导入 views
from blog import views

# 定义列表 urlpatterns
urlpatterns = [
    path("admin/", admin.site.urls),     # /admin/ → 后台
    path("", views.home, name="home"),    # / → home 视图
    # 调用 path()
    path("about/", views.about, name="about"), # /about/ → about 视图
# ]
]
\`\`\`

每个 \`path()\` 定义一条路由,四个要素:

- 路由模式字符串,如 \`"blog/"\`。
- 视图函数(或 \`include()\` 包含子路由)。
- \`name\` 别名(可选,用于反向解析)。
- \`kwargs\` 额外参数(可选,很少用)。

## include():应用级路由

大型项目不会把所有路由堆在根 \`urls.py\`,而是按应用拆分。每个应用有自己的 \`urls.py\`,根路由用 \`include()\` 引入:

\`\`\`python
# mysite/urls.py —— 根路由
# 从 django.contrib 导入 admin
from django.contrib import admin
# 从 django.urls 导入 path, include
from django.urls import path, include

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("admin/", admin.site.urls),
    path("blog/", include("blog.urls")),       # /blog/* 交给 blog 应用
    path("users/", include("users.urls")),     # /users/* 交给 users 应用
    path("api/", include("api.urls")),         # /api/* 交给 api 应用
# ]
]
\`\`\`

\`\`\`python
# blog/urls.py —— 应用级路由
# 从 django.urls 导入 path
from django.urls import path
# 从 . 导入 views
from . import views

# 定义列表 urlpatterns
urlpatterns = [
    path("", views.post_list, name="post_list"),       # /blog/
    # 调用 path()
    path("post/<int:pk>/", views.post_detail, name="post_detail"), # /blog/post/5/
    # 调用 path()
    path("post/new/", views.post_new, name="post_new"), # /blog/post/new/
# ]
]
\`\`\`

\`include("blog.urls")\` 的作用:把 \`/blog/\` 前缀剥掉,剩余路径交给 \`blog/urls.py\` 处理。比如访问 \`/blog/post/5/\`,根路由匹配 \`blog/\` 后,把 \`post/5/\` 传给 \`blog/urls.py\`,后者匹配 \`post/<int:pk>/\`,调用 \`post_detail\` 视图。

这种分层让应用可插拔:把 \`blog/\` 改成 \`articles/\` 只需改根路由一处,应用内 \`urls.py\` 完全不动。应用甚至可以「换前缀」复用到不同项目。

## path() 路径参数

URL 里可以「挖坑」捕获变量,传给视图函数:

\`\`\`python
# 捕获整数
# 调用 path()
path("post/<int:pk>/", views.post_detail)
# 访问 /post/42/ → 调用 post_detail(request, pk=42)

# 捕获字符串(默认,不能含 /)
# 调用 path()
path("post/<slug:slug>/", views.post_by_slug)
# 访问 /post/hello-world/ → post_by_slug(request, slug="hello-world")

# 捕获任意字符串(可含 /)
# 调用 path()
path("files/<path:filepath>/", views.serve_file)
# 访问 /files/a/b/c.txt → serve_file(request, filepath="a/b/c.txt")
\`\`\`

常用路径转换器:

| 转换器 | 匹配 | 示例 |
|---|---|---|
| \`<int:pk>\` | 整数 | 42 |
| \`<str:name>\` | 不含 / 的字符串 | hello |
| \`<slug:slug>\` | 字母数字下划线连字符 | hello-world |
| \`<uuid:uid>\` | UUID 格式 | 12345678-1234-... |
| \`<path:rest>\` | 含 / 的路径 | a/b/c |

⚠️ 路由模式末尾的 \`/\` 是 Django 默认行为:\`APPEND_SLASH=True\` 时,访问 \`/post/5\` 会自动 301 重定向到 \`/post/5/\`。

## re_path():正则路由

需要更复杂的匹配时,用 \`re_path()\` 配合正则表达式:

\`\`\`python
# 从 django.urls 导入 re_path
from django.urls import re_path

# 定义列表 urlpatterns
urlpatterns = [
    # 匹配 4 位年份
    # 调用 re_path()
    re_path(r"^posts/(?P<year>[0-9]{4})/$", views.posts_by_year),
    # 访问 /posts/2024/ → posts_by_year(request, year="2024")

    # 匹配 YYYY/MM 格式
    # 调用 re_path()
    re_path(r"^archive/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$", views.archive),
    # 访问 /archive/2024/06/ → archive(request, year="2024", month="06")
# ]
]
\`\`\`

注意:

- 用原始字符串 \`r"..."\` 避免 \`\\\` 转义问题。
- 用命名分组 \`(?P<name>...)\` 才能传参给视图。
- 优先用 \`path()\`,只在它表达不了时才用 \`re_path()\`。

## 视图函数

视图是「接收请求、返回响应」的函数(或类)。最简单的视图:

\`\`\`python
# 从 django.http 导入 HttpResponse, HttpRequest
from django.http import HttpResponse, HttpRequest

# 定义函数 hello，返回: HttpResponse
def hello(request: HttpRequest) -> HttpResponse:
    # 返回 HttpResponse("Hello, Django!")
    return HttpResponse("Hello, Django!")
\`\`\`

\`request\` 是 Django 封装的 \`HttpRequest\` 对象,包含请求所有信息:

\`\`\`python
# 定义函数 example，参数: request
def example(request):
    # 请求方法
    request.method           # "GET" / "POST" / "PUT" / "DELETE"

    # GET 参数(query string)
    request.GET.get("q", "")  # /?q=python → "python"
    request.GET.getlist("tags")  # /?tags=python&tags=django → ["python", "django"]

    # POST 数据(form 表单)
    # 调用 request.POST.get()
    request.POST.get("title")
    # 调用 request.POST.getlist()
    request.POST.getlist("tags")

    # 请求头(Django 自动加 HTTP_ 前缀,大写,横线变下划线)
    request.META.get("HTTP_USER_AGENT")    # 浏览器标识
    request.META.get("HTTP_HOST")           # Host 头
    request.META.get("REMOTE_ADDR")         # 客户端 IP
    request.META.get("CONTENT_TYPE")        # 内容类型

    # 路径信息
    request.path            # "/blog/post/5/"
    # 调用 request.get_full_path()
    request.get_full_path() # "/blog/post/5/?from=home"

    # Body(原始字节)
    request.body           # b'{"key":"value"}'

    # 当前登录用户(需 AuthenticationMiddleware)
    request.user           # AnonymousUser 或 User 对象
    request.user.is_authenticated  # 是否已登录

    # Session(需 SessionMiddleware)
    # request.session["cart"] = [...]
    request.session["cart"] = [...]
\`\`\`

## 视图返回响应的方式

### 1. HttpResponse:返回字符串

\`\`\`python
# 从 django.http 导入 HttpResponse
from django.http import HttpResponse

# 定义函数 hello，参数: request
def hello(request):
    return HttpResponse("Hello")            # 默认 text/html

# 定义函数 download，参数: request
def download(request):
    # 定义变量 response，赋值为 HttpResponse(b"file content", content_type="a...
    response = HttpResponse(b"file content", content_type="application/octet-stream")
    # response["Content-Disposition"] = 'attachment; fil
    response["Content-Disposition"] = 'attachment; filename="data.bin"'
    # 返回 response
    return response
\`\`\`

### 2. render:渲染模板

\`\`\`python
# 从 django.shortcuts 导入 render
from django.shortcuts import render

# 定义函数 post_list，参数: request
def post_list(request):
    posts = Post.objects.all()[:10]  # 查最新 10 篇
    # render(request, 模板路径, 上下文字典)
    # 返回 render(request, "blog/post_list.html", {"posts": posts})
    return render(request, "blog/post_list.html", {"posts": posts})
\`\`\`

\`render\` 是最常用的返回方式:加载模板、传入 context、渲染成 HTML 字符串、包装成 HttpResponse。

### 3. JsonResponse:返回 JSON

\`\`\`python
# 从 django.http 导入 JsonResponse
from django.http import JsonResponse

# 定义函数 api_posts，参数: request
def api_posts(request):
    # 定义变量 posts，赋值为 Post.objects.all().values("id", "title", "cre...
    posts = Post.objects.all().values("id", "title", "created_at")
    return JsonResponse(list(posts), safe=False)  # safe=False 允许返回列表
\`\`\`

做 API 时常用。注意默认 \`safe=True\` 只允许返回 dict,返回 list 要设 \`safe=False\`。

### 4. redirect:重定向

\`\`\`python
# 从 django.shortcuts 导入 redirect
from django.shortcuts import redirect

# 定义函数 old_url，参数: request
def old_url(request):
    # 永久重定向到新 URL
    return redirect("/new-url/")               # 重定向到路径
    return redirect("blog:post_detail", pk=1)  # 反向解析路由
    return redirect(some_model_instance)        # 重定向到对象的 get_absolute_url
\`\`\`

## 类视图(Class-based Views)

函数视图简单直接,但有大量重复代码(查列表、查详情、创建、更新、删除)。Django 提供类视图,把通用逻辑封装成基类。

### 1. 最基础的类视图

\`\`\`python
# 从 django.views 导入 View
from django.views import View
# 从 django.http 导入 HttpResponse
from django.http import HttpResponse

# 定义类 HelloView，继承 View
class HelloView(View):
    # 根据 HTTP 方法自动分发:GET 调 get,POST 调 post
    # 定义函数 get，参数: self, request
    def get(self, request):
        # 返回 HttpResponse("Hello, GET!")
        return HttpResponse("Hello, GET!")

    # 定义函数 post，参数: self, request
    def post(self, request):
        # 返回 HttpResponse("Hello, POST!")
        return HttpResponse("Hello, POST!")
\`\`\`

类视图要在 \`urls.py\` 里调用 \`as_view()\` 转成可调用对象:

\`\`\`python
# 从 django.urls 导入 path
from django.urls import path
# 从 .views 导入 HelloView
from .views import HelloView

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("hello/", HelloView.as_view(), name="hello"),
# ]
]
\`\`\`

\`as_view()\` 返回一个函数,Django 调用它时,内部实例化 \`HelloView\`,根据请求方法分发到对应方法。

### 2. 通用视图

Django 内置一组通用视图,把常见 CRUD 场景封装好:

| 视图 | 用途 | 默认方法 |
|---|---|---|
| \`ListView\` | 列出多个对象 | \`get\` |
| \`DetailView\` | 显示单个对象详情 | \`get\` |
| \`CreateView\` | 创建对象 | \`get\`(空表单)/\`post\`(提交) |
| \`UpdateView\` | 更新对象 | \`get\`(预填表单)/\`post\`(提交) |
| \`DeleteView\` | 删除对象 | \`get\`(确认页)/\`post\`(删除) |
| \`TemplateView\` | 渲染静态模板 | \`get\` |
| \`FormView\` | 处理表单 | \`get\`/\`post\` |

\`\`\`python
# 从 django.views.generic 导入 ListView, DetailView
from django.views.generic import ListView, DetailView
# 从 .models 导入 Post
from .models import Post

# 定义类 PostListView，继承 ListView
class PostListView(ListView):
    model = Post                          # 数据模型
    # 定义变量 template_name，赋值为 "blog/post_list.html" # 模板路径
    template_name = "blog/post_list.html" # 模板路径
    context_object_name = "posts"         # 模板里的变量名(默认 object_list)
    paginate_by = 10                      # 每页 10 条,自动分页

# 定义类 PostDetailView，继承 DetailView
class PostDetailView(DetailView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_detail.html"
    template_name = "blog/post_detail.html"
    # 定义变量 context_object_name，赋值为 "post"
    context_object_name = "post"
    # 默认从 URL 的 <int:pk> 取主键查对象
\`\`\`

\`\`\`python
# urls.py
# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("", PostListView.as_view(), name="post_list"),
    # 调用 path()
    path("post/<int:pk>/", PostDetailView.as_view(), name="post_detail"),
# ]
]
\`\`\`

通用视图的好处:几十行代码变成几行,而且自动处理分页、404、表单校验。

## URL 反向解析

「反向解析」是从路由 name 反推 URL,而不是硬编码路径。好处是改路由时不用改代码。

\`\`\`python
# 从 django.urls 导入 reverse
from django.urls import reverse
# 从 django.shortcuts 导入 redirect
from django.shortcuts import redirect

# 定义函数 go_to_post，参数: request, pk
def go_to_post(request, pk):
    # 正向:写死字符串,改路由要改代码
    # return redirect(f"/blog/post/{pk}/")  # ❌ 硬编码

    # 反向:从 name 推 URL
    # 定义变量 url，赋值为 reverse("blog:post_detail", kwargs={"pk": pk}...
    url = reverse("blog:post_detail", kwargs={"pk": pk})
    # 返回 redirect(url)
    return redirect(url)
    # → /blog/post/5/
\`\`\`

在模板里用 \`{% url %}\` 标签:

\`\`\`html
# <!-- 反向解析,自动生成 /blog/post/5/ -->
<!-- 反向解析,自动生成 /blog/post/5/ -->
# <a href="{% url 'blog:post_detail' post.id %}">{{ 
<a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a>
\`\`\`

\`blog:post_detail\` 是「命名空间:name」格式。在应用的 \`urls.py\` 里定义命名空间:

\`\`\`python
# blog/urls.py
app_name = "blog"  # 命名空间

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("post/<int:pk>/", views.post_detail, name="post_detail"),
# ]
]
\`\`\`

这样 \`reverse("blog:post_detail", kwargs={"pk": 1})\` 就能找到。

## 完整示例:博客路由和视图

下面是一个完整博客应用的路由和视图:

\`\`\`python
# blog/urls.py
# 从 django.urls 导入 path
from django.urls import path
# 从 . 导入 views
from . import views

# 定义变量 app_name，赋值为 "blog"
app_name = "blog"

# 定义列表 urlpatterns
urlpatterns = [
    # 文章列表
    # 调用 path()
    path("", views.PostListView.as_view(), name="post_list"),
    # 文章详情
    # 调用 path()
    path("post/<int:pk>/", views.PostDetailView.as_view(), name="post_detail"),
    # 创建文章
    # 调用 path()
    path("post/new/", views.PostCreateView.as_view(), name="post_create"),
    # 编辑文章
    # 调用 path()
    path("post/<int:pk>/edit/", views.PostUpdateView.as_view(), name="post_edit"),
    # 删除文章
    # 调用 path()
    path("post/<int:pk>/delete/", views.PostDeleteView.as_view(), name="post_delete"),
    # 按标签筛选
    # 调用 path()
    path("tag/<slug:slug>/", views.posts_by_tag, name="posts_by_tag"),
    # 搜索
    # 调用 path()
    path("search/", views.search, name="search"),
# ]
]
\`\`\`

\`\`\`python
# blog/views.py
# 从 django.shortcuts 导入 render, get_object_or_404, redirect
from django.shortcuts import render, get_object_or_404, redirect
# 从 django.urls 导入 reverse_lazy
from django.urls import reverse_lazy
# 从 django.views.generic 导入 ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
# 从 .models 导入 Post, Tag
from .models import Post, Tag

# 函数视图:按标签筛选
# 定义函数 posts_by_tag，参数: request, slug
def posts_by_tag(request, slug):
    # 定义变量 tag，赋值为 get_object_or_404(Tag, slug=slug)
    tag = get_object_or_404(Tag, slug=slug)
    # 定义变量 posts，赋值为 tag.posts.all().order_by("-created_at")[:20]
    posts = tag.posts.all().order_by("-created_at")[:20]
    # 返回 render(request, "blog/post_list.html", {"posts": posts, "tag": tag})
    return render(request, "blog/post_list.html", {"posts": posts, "tag": tag})

# 函数视图:搜索
# 定义函数 search，参数: request
def search(request):
    # 定义变量 q，赋值为 request.GET.get("q", "").strip()
    q = request.GET.get("q", "").strip()
    # 条件判断：如果 not q
    if not q:
        # 返回 render(request, "blog/search.html", {"posts": [], "q": q})
        return render(request, "blog/search.html", {"posts": [], "q": q})
    # 定义变量 posts，赋值为 Post.objects.filter(title__icontains=q)[:20]
    posts = Post.objects.filter(title__icontains=q)[:20]
    # 返回 render(request, "blog/search.html", {"posts": posts, "q": q})
    return render(request, "blog/search.html", {"posts": posts, "q": q})

# 类视图:文章列表(带分页)
# 定义类 PostListView，继承 ListView
class PostListView(ListView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_list.html"
    template_name = "blog/post_list.html"
    # 定义变量 context_object_name，赋值为 "posts"
    context_object_name = "posts"
    # 定义变量 paginate_by，赋值为 10
    paginate_by = 10
    # 定义列表 ordering
    ordering = ["-created_at"]

    # 重写 get_queryset 加自定义过滤
    # 定义函数 get_queryset，参数: self
    def get_queryset(self):
        # 只返回已发布文章
        # 返回 Post.objects.filter(status="published").order_by("-created_at")
        return Post.objects.filter(status="published").order_by("-created_at")

# 类视图:文章详情
# 定义类 PostDetailView，继承 DetailView
class PostDetailView(DetailView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_detail.html"
    template_name = "blog/post_detail.html"
    # 定义变量 context_object_name，赋值为 "post"
    context_object_name = "post"

    # 重写 get_context_data 加额外上下文
    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # 传「上一篇」和「下一篇」给模板
        # 定义变量 post，赋值为 self.object
        post = self.object
        # context["prev_post"] = Post.objects.filter(id__lt=
        context["prev_post"] = Post.objects.filter(id__lt=post.id).order_by("-id").first()
        # context["next_post"] = Post.objects.filter(id__gt=
        context["next_post"] = Post.objects.filter(id__gt=post.id).order_by("id").first()
        # 返回 context
        return context

# 类视图:创建文章
# 定义类 PostCreateView，继承 CreateView
class PostCreateView(CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    fields = ["title", "content", "tags"]  # 表单包含哪些字段
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")

# 类视图:编辑文章
# 定义类 PostUpdateView，继承 UpdateView
class PostUpdateView(UpdateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    # 定义列表 fields
    fields = ["title", "content", "tags"]
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")

# 类视图:删除文章
# 定义类 PostDeleteView，继承 DeleteView
class PostDeleteView(DeleteView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_confirm_delete.html"
    template_name = "blog/post_confirm_delete.html"
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 类视图没调 as_view() | urls.py 写错 | path(..., View.as_view()) |
| path 参数类型错 | <int:pk> 写成 <pk> | 用正确转换器 |
| 视图没返回 HttpResponse | 返回 None | 必须返回响应对象 |
| include 路径错 | "blog.urls" 写错 | 用应用名.urls |
| reverse 找不到 name | 没配 name 或命名空间 | urls.py 加 name 和 app_name |
| POST 没 CSRF token | 表单漏了 {% csrf_token %} | 加上 |
| URL 末尾斜杠问题 | APPEND_SLASH 行为 | 保持路由模式以 / 结尾 |
| get_object_or_404 没导入 | 报 NameError | from django.shortcuts import |

## 设计思想

Django 的路由设计体现了「分层 + 解耦」思想。根路由只负责把不同前缀分发到不同应用,应用路由只关心自己的路径,视图只处理业务逻辑。这种分层让应用可复用、可插拔。反向解析则体现了「不要硬编码 URL」的最佳实践:URL 是会变的,但 name 不变,代码就稳定。类视图把「列表/详情/增删改」这些重复模式封装好,是 DRY 原则的典范。
`,
  },

  // ============================================================
  // 第 20 章:Django 模板系统
  // ============================================================
  {
    id: "django-template",
    group: "Django 入门",
    icon: "📄",
    title: "Django 模板系统",
    content: `# Django 模板系统

## 模板系统是什么

模板系统负责「把数据渲染成 HTML」。你写一个带占位符的 HTML 文件(模板),视图把数据塞进占位符,最终输出完整 HTML 给浏览器。这就是经典的「数据 + 模板 = 视图」分离。

Django 自带一套模板语言叫 **Django Template Language(DTL)**,语法类似 Jinja2 但不完全相同。它的设计目标是「让设计师也能看懂」,所以刻意限制了能写复杂 Python 逻辑。

## 变量:\`{{ var }}\`

双花括号输出变量:

\`\`\`html
# <h1>{{ title }}</h1>
<h1>{{ title }}</h1>
# <p>作者:{{ post.author.username }}</p>
<p>作者:{{ post.author.username }}</p>
# <p>价格:{{ product.price }}</p>
<p>价格:{{ product.price }}</p>
\`\`\`

支持点号链式访问:

- \`{{ post.author }}\` → 先试 \`post["author"]\`(字典),再试 \`post.author\`(属性),最后试 \`post.author()\`(方法)。
- \`{{ user.get_full_name }}\` → 调用无参方法(不加括号)。

变量不存在时,Django 默认静默返回空字符串(可配置 \`string_if_invalid\`)。

## 标签:\`{% tag %}\`

花括号百分号是「标签」,执行逻辑控制。

### 1. if 条件

\`\`\`html
# {% if user.is_authenticated %}
{% if user.is_authenticated %}
    # <p>欢迎回来,{{ user.username }}</p>
    <p>欢迎回来,{{ user.username }}</p>
# {% elif user.is_staff %}
{% elif user.is_staff %}
    # <p>管理员请登录</p>
    <p>管理员请登录</p>
# {% else %}
{% else %}
    # <p><a href="/login/">请登录</a></p>
    <p><a href="/login/">请登录</a></p>
# {% endif %}
{% endif %}
\`\`\`

支持运算符:\`==\` \`!=\` \`>\` \`<\` \`>=\` \`<=\` \`and\` \`or\` \`not\` \`in\` \`not in\`。

\`\`\`html
# {% if age >= 18 and age < 60 %}
{% if age >= 18 and age < 60 %}
    # 成年人
    成年人
# {% endif %}
{% endif %}

# {% if "admin" in user.groups %}
{% if "admin" in user.groups %}
    # 管理员
    管理员
# {% endif %}
{% endif %}
\`\`\`

### 2. for 循环

\`\`\`html
# <ul>
<ul>
# {% for post in posts %}
{% for post in posts %}
    # <li>{{ forloop.counter }}. {{ post.title }}</li>
    <li>{{ forloop.counter }}. {{ post.title }}</li>
# {% endfor %}
{% endfor %}
# </ul>
</ul>
\`\`\`

\`forloop\` 是循环内建变量:

| 变量 | 含义 |
|---|---|
| \`forloop.counter\` | 当前序号(从 1 开始) |
| \`forloop.counter0\` | 当前序号(从 0 开始) |
| \`forloop.first\` | 是否第一次循环 |
| \`forloop.last\` | 是否最后一次循环 |
| \`forloop.revcounter\` | 剩余次数(从 1 开始倒序) |

\`\`\`html
# {% for post in posts %}
{% for post in posts %}
    # <div class="post {% if forloop.first %}first{% end
    <div class="post {% if forloop.first %}first{% endif %}">
        # {{ forloop.counter }}. {{ post.title }}
        {{ forloop.counter }}. {{ post.title }}
    # </div>
    </div>
# {% endfor %}
{% endfor %}
\`\`\`

空列表处理用 \`{% empty %}\`:

\`\`\`html
# {% for post in posts %}
{% for post in posts %}
    # <li>{{ post.title }}</li>
    <li>{{ post.title }}</li>
# {% empty %}
{% empty %}
    # <li>暂无文章</li>
    <li>暂无文章</li>
# {% endfor %}
{% endfor %}
\`\`\`

### 3. block 块(模板继承用)

\`\`\`html
# {% block content %}
{% block content %}
    # 调用 默认内容()
    默认内容(子模板可覆盖)
# {% endblock %}
{% endblock %}
\`\`\`

### 4. 其他常用标签

\`\`\`html
# {# 注释,单行 #}
{# 注释,单行 #}
# {% comment "说明" %}多行注释{% endcomment %}
{% comment "说明" %}多行注释{% endcomment %}

# {% now "Y-m-d H:i" %}    {# 当前时间 #}
{% now "Y-m-d H:i" %}    {# 当前时间 #}

# {% with total=posts|length %}
{% with total=posts|length %}
    # 共 {{ total }} 篇文章
    共 {{ total }} 篇文章
# {% endwith %}
{% endwith %}

# {% url "blog:post_detail" post.id %}  {# 反向解析 URL 
{% url "blog:post_detail" post.id %}  {# 反向解析 URL #}

# {% csrf_token %}  {# CSRF token,POST 表单必加 #}
{% csrf_token %}  {# CSRF token,POST 表单必加 #}

# {% load static %} {# 加载 static 标签库 #}
{% load static %} {# 加载 static 标签库 #}
# {% load humanize %} {# 加载第三方标签库 #}
{% load humanize %} {# 加载第三方标签库 #}
\`\`\`

## 过滤器

管道符 \`|\` 对变量做转换:

\`\`\`html
# {# 大小写 #}
{# 大小写 #}
# {{ name|upper }}        {# HELLO #}
{{ name|upper }}        {# HELLO #}
# {{ name|lower }}        {# hello #}
{{ name|lower }}        {# hello #}
# {{ name|title }}        {# Hello World #}
{{ name|title }}        {# Hello World #}

# {# 长度 #}
{# 长度 #}
# {{ posts|length }}      {# 10 #}
{{ posts|length }}      {# 10 #}
# {{ name|length_is:"5" }} {# True/False #}
{{ name|length_is:"5" }} {# True/False #}

# {# 默认值 #}
{# 默认值 #}
# {{ user.nickname|default:"匿名用户" }}
{{ user.nickname|default:"匿名用户" }}

# {# 截断 #}
{# 截断 #}
# {{ post.content|truncatewords:30 }}  {# 截 30 个词 #}
{{ post.content|truncatewords:30 }}  {# 截 30 个词 #}
# {{ post.content|truncatechars:50 }}  {# 截 50 个字符 #
{{ post.content|truncatechars:50 }}  {# 截 50 个字符 #}

# {# 日期格式化 #}
{# 日期格式化 #}
# {{ post.created_at|date:"Y年m月d日 H:i" }}  {# 2024年0
{{ post.created_at|date:"Y年m月d日 H:i" }}  {# 2024年06月15日 14:30 #}

# {# 数字格式化 #}
{# 数字格式化 #}
# {{ price|floatformat:2 }}  {# 3.14159 → 3.14 #}
{{ price|floatformat:2 }}  {# 3.14159 → 3.14 #}

# {# 字符串 #}
{# 字符串 #}
# {{ name|slugify }}     {# "Hello World" → "hello-w
{{ name|slugify }}     {# "Hello World" → "hello-world" #}
# {{ content|striptags }} {# 去掉 HTML 标签 #}
{{ content|striptags }} {# 去掉 HTML 标签 #}

# {# 链式组合 #}
{# 链式组合 #}
# {{ post.content|striptags|truncatewords:30 }}
{{ post.content|striptags|truncatewords:30 }}
\`\`\`

常用日期格式字符:

| 字符 | 含义 | 示例 |
|---|---|---|
| \`Y\` | 4 位年 | 2024 |
| \`m\` | 2 位月 | 06 |
| \`d\` | 2 位日 | 15 |
| \`H\` | 24 小时 | 14 |
| \`i\` | 分钟 | 30 |
| \`s\` | 秒 | 45 |
| \`D\` | 星期缩写 | Mon |
| \`F\` | 月份全名 | January |

## 模板继承

模板继承是 DTL 最强大的特性。定义一个 \`base.html\` 作为骨架,子模板只填充需要变化的 \`{% block %}\`:

\`\`\`html
# <!-- templates/base.html -->
<!-- templates/base.html -->
# <!DOCTYPE html>
<!DOCTYPE html>
# <html>
<html>
# <head>
<head>
    # <title>{% block title %}我的博客{% endblock %}</title>
    <title>{% block title %}我的博客{% endblock %}</title>
    # {% block extra_head %}{% endblock %}
    {% block extra_head %}{% endblock %}
# </head>
</head>
# <body>
<body>
    # <nav>
    <nav>
        # <a href="/">首页</a>
        <a href="/">首页</a>
        # <a href="/about/">关于</a>
        <a href="/about/">关于</a>
    # </nav>
    </nav>

    # <main>
    <main>
        # {% block content %}
        {% block content %}
            # 默认内容
            默认内容
        # {% endblock %}
        {% endblock %}
    # </main>
    </main>

    # <footer>© 2024 我的博客</footer>
    <footer>© 2024 我的博客</footer>

    # {% block extra_js %}{% endblock %}
    {% block extra_js %}{% endblock %}
# </body>
</body>
# </html>
</html>
\`\`\`

子模板用 \`{% extends %}\` 继承,然后覆盖 block:

\`\`\`html
# <!-- templates/blog/post_list.html -->
<!-- templates/blog/post_list.html -->
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block title %}文章列表 - {{ block.super }}{% endblo
{% block title %}文章列表 - {{ block.super }}{% endblock %}

# {% block content %}
{% block content %}
    # <h1>文章列表</h1>
    <h1>文章列表</h1>
    # <ul>
    <ul>
    # {% for post in posts %}
    {% for post in posts %}
        # <li>
        <li>
            # <a href="{% url 'blog:post_detail' post.id %}">{{ 
            <a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a>
            # <small>{{ post.created_at|date:"Y-m-d" }}</small>
            <small>{{ post.created_at|date:"Y-m-d" }}</small>
        # </li>
        </li>
    # {% endfor %}
    {% endfor %}
    # </ul>
    </ul>
\`\`\`

\`{{ block.super }}\` 渲染父模板该 block 的内容,用于「追加」而非「替换」。

模板继承的好处:整个站点共享一套骨架(导航栏、页脚、样式),改一处全站生效,子模板只关心自己的内容。

## include 引入子模板

把重复的小片段抽成独立模板,用 \`{% include %}\` 引入:

\`\`\`html
# <!-- templates/_post_card.html -->
<!-- templates/_post_card.html -->
# <div class="post-card">
<div class="post-card">
    # <h3>{{ post.title }}</h3>
    <h3>{{ post.title }}</h3>
    # <p>{{ post.content|truncatewords:20 }}</p>
    <p>{{ post.content|truncatewords:20 }}</p>
    # <small>{{ post.author.username }} · {{ post.create
    <small>{{ post.author.username }} · {{ post.created_at|date:"Y-m-d" }}</small>
# </div>
</div>
\`\`\`

\`\`\`html
# <!-- 在其他模板里引入 -->
<!-- 在其他模板里引入 -->
# {% for post in posts %}
{% for post in posts %}
    # {% include "_post_card.html" with post=post %}
    {% include "_post_card.html" with post=post %}
# {% endfor %}
{% endfor %}
\`\`\`

\`with\` 给子模板传额外变量。 \`include\` 适合「小片段复用」,而 \`extends\` 适合「整体布局复用」。

## 静态文件

CSS/JS/图片等静态文件,用 \`{% static %}\` 标签引用:

\`\`\`html
# {% load static %}
{% load static %}

# <!DOCTYPE html>
<!DOCTYPE html>
# <html>
<html>
# <head>
<head>
    # <link rel="stylesheet" href="{% static 'css/style.
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
    # <script src="{% static 'js/main.js' %}"></script>
    <script src="{% static 'js/main.js' %}"></script>
# </head>
</head>
# <body>
<body>
    # <img src="{% static 'images/logo.png' %}" alt="Log
    <img src="{% static 'images/logo.png' %}" alt="Logo">
# </body>
</body>
# </html>
</html>
\`\`\`

\`{% static %}\` 会自动加上 \`STATIC_URL\` 前缀,生产环境还能配合 CDN 域名。

\`{% load static %}\` 必须在使用前调用,通常放在模板最顶部。

## 模板上下文(context)

视图通过 \`render()\` 传 context 字典给模板:

\`\`\`python
# 从 django.shortcuts 导入 render
from django.shortcuts import render
# 从 .models 导入 Post
from .models import Post

# 定义函数 post_list，参数: request
def post_list(request):
    # context 是字典,键是模板里的变量名
    # 定义字典 context
    context = {
        # "posts": Post.objects.all()[:10],
        "posts": Post.objects.all()[:10],
        # "title": "最新文章",
        "title": "最新文章",
        # "user": request.user,
        "user": request.user,
    # }
    }
    # 返回 render(request, "blog/post_list.html", context)
    return render(request, "blog/post_list.html", context)
\`\`\`

context 之外,Django 还会自动注入「上下文处理器」提供的变量(在 \`settings.TEMPLATES\` 里配置):

- \`request\`:\`django.template.context_processors.request\` 注入当前 request。
- \`user\`:\`django.contrib.auth.context_processors.auth\` 注入 \`{{ user }}\` 和 \`{{ perms }}\`。
- \`messages\`:\`django.contrib.messages.context_processors.messages\` 注入消息列表。

所以模板里可以**直接用 \`{{ user }}\`**,不用每次在视图里传。

## render() 的工作原理

\`render()\` 是个快捷函数,内部做了三件事:

\`\`\`python
# render 的等价写法
# 从 django.template.loader 导入 get_template
from django.template.loader import get_template
# 从 django.http 导入 HttpResponse
from django.http import HttpResponse

# 定义函数 post_list，参数: request
def post_list(request):
    # 定义变量 posts，赋值为 Post.objects.all()
    posts = Post.objects.all()
    template = get_template("blog/post_list.html")  # 1. 加载模板
    # 定义变量 html，赋值为 template.render({"posts": posts}, request) # ...
    html = template.render({"posts": posts}, request) # 2. 渲染(传 context 和 request)
    return HttpResponse(html)                        # 3. 包装成响应
\`\`\`

\`render(request, template, context)\` 的 \`request\` 参数很重要:它让上下文处理器能拿到 request,从而注入 \`user\`、\`messages\` 等变量。漏传会导致模板里 \`{{ user }}\` 取不到。

## DTL vs Jinja2 对比

| 维度 | DTL | Jinja2 |
|---|---|---|
| 语法 | \`{{ }}\` \`{% %}\` | \`{{ }}\` \`{% %}\`(相同) |
| 函数调用 | 不支持 \`{{ foo() }}\` | 支持 |
| if/for 逻辑 | 简化版 | 完整 Python 风格 |
| 过滤器 \| \`{{ x|filter }}\` \| \`{{ x|filter }}\`(相同) |
| 模板继承 | \`{% extends %}\` \`{% block %}\` | 相同 |
| 性能 | 较慢 | 更快 |
| 设计哲学 | 限制逻辑,设计师友好 | 灵活,接近 Python |
| 默认引擎 | Django 内置 | Flask 默认 |

Django 也可配 Jinja2 作为模板引擎,但大部分项目用 DTL 就够了。它的限制是「特性」而非「缺陷」,迫使你把复杂逻辑放视图里,模板保持简单。

## 完整示例:博客列表页和详情页

### base.html(共享骨架)

\`\`\`html
# {% load static %}
{% load static %}
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh-CN">
<html lang="zh-CN">
# <head>
<head>
    # <meta charset="UTF-8">
    <meta charset="UTF-8">
    # <meta name="viewport" content="width=device-width,
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    # <title>{% block title %}我的博客{% endblock %}</title>
    <title>{% block title %}我的博客{% endblock %}</title>
    # <link rel="stylesheet" href="{% static 'css/style.
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
# </head>
</head>
# <body>
<body>
    # <nav class="navbar">
    <nav class="navbar">
        # <a href="{% url 'blog:post_list' %}" class="logo">
        <a href="{% url 'blog:post_list' %}" class="logo">我的博客</a>
        # <div class="nav-links">
        <div class="nav-links">
            # {% if user.is_authenticated %}
            {% if user.is_authenticated %}
                # <span>欢迎,{{ user.username }}</span>
                <span>欢迎,{{ user.username }}</span>
                # <a href="{% url 'logout' %}">退出</a>
                <a href="{% url 'logout' %}">退出</a>
            # {% else %}
            {% else %}
                # <a href="{% url 'login' %}">登录</a>
                <a href="{% url 'login' %}">登录</a>
            # {% endif %}
            {% endif %}
        # </div>
        </div>
    # </nav>
    </nav>

    # <main class="container">
    <main class="container">
        # {% if messages %}
        {% if messages %}
            # {% for message in messages %}
            {% for message in messages %}
                # <div class="alert alert-{{ message.tags }}">{{ mes
                <div class="alert alert-{{ message.tags }}">{{ message }}</div>
            # {% endfor %}
            {% endfor %}
        # {% endif %}
        {% endif %}

        # {% block content %}{% endblock %}
        {% block content %}{% endblock %}
    # </main>
    </main>

    # <footer class="footer">
    <footer class="footer">
        # <p>© {% now "Y" %} 我的博客 · 由 Django 驱动</p>
        <p>© {% now "Y" %} 我的博客 · 由 Django 驱动</p>
    # </footer>
    </footer>
# </body>
</body>
# </html>
</html>
\`\`\`

### post_list.html(列表页)

\`\`\`html
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block title %}文章列表 - {{ block.super }}{% endblo
{% block title %}文章列表 - {{ block.super }}{% endblock %}

# {% block content %}
{% block content %}
    # <h1>文章列表</h1>
    <h1>文章列表</h1>

    # {% if posts %}
    {% if posts %}
        # <div class="post-list">
        <div class="post-list">
        # {% for post in posts %}
        {% for post in posts %}
            # <article class="post-item">
            <article class="post-item">
                # <h2>
                <h2>
                    # <a href="{% url 'blog:post_detail' post.id %}">{{ 
                    <a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a>
                # </h2>
                </h2>
                # <div class="post-meta">
                <div class="post-meta">
                    # 字段 作者，类型: {{ post.author.username }}
                    作者:{{ post.author.username }}
                    # · 发布于 {{ post.created_at|date:"Y年m月d日" }}
                    · 发布于 {{ post.created_at|date:"Y年m月d日" }}
                    # · 评论 {{ post.comments.count }} 条
                    · 评论 {{ post.comments.count }} 条
                # </div>
                </div>
                # <p class="post-excerpt">{{ post.content|truncatewo
                <p class="post-excerpt">{{ post.content|truncatewords:30 }}</p>

                # {% if post.tags.all %}
                {% if post.tags.all %}
                    # <div class="post-tags">
                    <div class="post-tags">
                    # {% for tag in post.tags.all %}
                    {% for tag in post.tags.all %}
                        # <a href="{% url 'blog:posts_by_tag' tag.slug %}" c
                        <a href="{% url 'blog:posts_by_tag' tag.slug %}" class="tag">#{{ tag.name }}</a>
                    # {% endfor %}
                    {% endfor %}
                    # </div>
                    </div>
                # {% endif %}
                {% endif %}
            # </article>
            </article>
        # {% endfor %}
        {% endfor %}
        # </div>
        </div>

        # {# 分页 #}
        {# 分页 #}
        # {% if page_obj.has_other_pages %}
        {% if page_obj.has_other_pages %}
            # <nav class="pagination">
            <nav class="pagination">
                # {% if page_obj.has_previous %}
                {% if page_obj.has_previous %}
                    # <a href="?page={{ page_obj.previous_page_number }}
                    <a href="?page={{ page_obj.previous_page_number }}">上一页</a>
                # {% endif %}
                {% endif %}
                # <span>第 {{ page_obj.number }} / {{ page_obj.pagina
                <span>第 {{ page_obj.number }} / {{ page_obj.paginator.num_pages }} 页</span>
                # {% if page_obj.has_next %}
                {% if page_obj.has_next %}
                    # <a href="?page={{ page_obj.next_page_number }}">下一
                    <a href="?page={{ page_obj.next_page_number }}">下一页</a>
                # {% endif %}
                {% endif %}
            # </nav>
            </nav>
        # {% endif %}
        {% endif %}

    # {% else %}
    {% else %}
        # <p class="empty">暂无文章,敬请期待。</p>
        <p class="empty">暂无文章,敬请期待。</p>
    # {% endif %}
    {% endif %}
# {% endblock %}
{% endblock %}
\`\`\`

### post_detail.html(详情页)

\`\`\`html
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block title %}{{ post.title }} - {{ block.super
{% block title %}{{ post.title }} - {{ block.super }}{% endblock %}

# {% block content %}
{% block content %}
    # <article class="post-detail">
    <article class="post-detail">
        # <h1>{{ post.title }}</h1>
        <h1>{{ post.title }}</h1>
        # <div class="post-meta">
        <div class="post-meta">
            # 字段 作者，类型: {{ post.author.get_full_name|default:post.author.username }}
            作者:{{ post.author.get_full_name|default:post.author.username }}
            # · {{ post.created_at|date:"Y年m月d日 H:i" }}
            · {{ post.created_at|date:"Y年m月d日 H:i" }}
            # · 阅读 {{ post.views }} 次
            · 阅读 {{ post.views }} 次
        # </div>
        </div>

        # <div class="post-content">
        <div class="post-content">
            # {{ post.content|linebreaks }}
            {{ post.content|linebreaks }}
        # </div>
        </div>

        # {% if post.tags.all %}
        {% if post.tags.all %}
            # <div class="post-tags">
            <div class="post-tags">
                # 标签:
                标签:
                # {% for tag in post.tags.all %}
                {% for tag in post.tags.all %}
                    # <a href="{% url 'blog:posts_by_tag' tag.slug %}" c
                    <a href="{% url 'blog:posts_by_tag' tag.slug %}" class="tag">#{{ tag.name }}</a>
                    # {% if not forloop.last %},{% endif %}
                    {% if not forloop.last %},{% endif %}
                # {% endfor %}
                {% endfor %}
            # </div>
            </div>
        # {% endif %}
        {% endif %}

        # <div class="post-nav">
        <div class="post-nav">
            # {% if prev_post %}
            {% if prev_post %}
                # <a href="{% url 'blog:post_detail' prev_post.id %}
                <a href="{% url 'blog:post_detail' prev_post.id %}">← {{ prev_post.title|truncatechars:20 }}</a>
            # {% endif %}
            {% endif %}
            # {% if next_post %}
            {% if next_post %}
                # <a href="{% url 'blog:post_detail' next_post.id %}
                <a href="{% url 'blog:post_detail' next_post.id %}">{{ next_post.title|truncatechars:20 }} →</a>
            # {% endif %}
            {% endif %}
        # </div>
        </div>
    # </article>
    </article>

    # {# 评论区 #}
    {# 评论区 #}
    # <section class="comments">
    <section class="comments">
        # <h2>评论 ({{ post.comments.count }})</h2>
        <h2>评论 ({{ post.comments.count }})</h2>
        # {% for comment in post.comments.all %}
        {% for comment in post.comments.all %}
            # <div class="comment">
            <div class="comment">
                # <strong>{{ comment.author.username }}</strong>
                <strong>{{ comment.author.username }}</strong>
                # <small>{{ comment.created_at|date:"Y-m-d H:i" }}</
                <small>{{ comment.created_at|date:"Y-m-d H:i" }}</small>
                # <p>{{ comment.content|linebreaks }}</p>
                <p>{{ comment.content|linebreaks }}</p>
            # </div>
            </div>
        # {% empty %}
        {% empty %}
            # <p>暂无评论,快来抢沙发!</p>
            <p>暂无评论,快来抢沙发!</p>
        # {% endfor %}
        {% endfor %}

        # {# 评论表单 #}
        {# 评论表单 #}
        # {% if user.is_authenticated %}
        {% if user.is_authenticated %}
            # <form method="post" action="{% url 'blog:post_deta
            <form method="post" action="{% url 'blog:post_detail' post.id %}">
                # {% csrf_token %}
                {% csrf_token %}
                # <textarea name="content" placeholder="写下你的评论..." r
                <textarea name="content" placeholder="写下你的评论..." required></textarea>
                # <button type="submit">发表评论</button>
                <button type="submit">发表评论</button>
            # </form>
            </form>
        # {% else %}
        {% else %}
            # <p><a href="{% url 'login' %}">登录</a>后才能评论</p>
            <p><a href="{% url 'login' %}">登录</a>后才能评论</p>
        # {% endif %}
        {% endif %}
    # </section>
    </section>
# {% endblock %}
{% endblock %}
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 模板找不到 | 路径错或 APP_DIRS 没开 | 检查 TEMPLATES 配置 |
| 变量不显示 | context 没传或名字错 | 检查视图传的字典 |
| {% extends %} 必须在第一行 | 前面有内容 | 移到文件顶部 |
| forloop 在 for 外用 | 报错或空 | 只在 {% for %} 内用 |
| 静态文件 404 | {% load static %} 没写 | 模板顶部加 |
| {{ user }} 取不到 | 漏传 request 给 render | render(request, ...) |
| 过滤器参数没引号 | date:Y 错 | date:"Y" 带引号 |
| 模板里有 HTML 注释 | <!----> 会输出到页面 | 用 {# #} 注释 |

## 设计思想

Django 模板系统的设计哲学是「**模板不应该有复杂逻辑**」。它刻意不支持函数调用、复杂表达式,逼着你把逻辑放视图里、把展示放模板里。这种限制让模板保持「设计师友好」:设计师改 HTML 不用懂 Python,工程师改视图不影响展示。模板继承解决了「页面骨架复用」问题,include 解决了「小片段复用」问题,两者配合让大型站点的 HTML 维护成本可控。
`,
  },
];
