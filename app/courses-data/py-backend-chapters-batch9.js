// =============================================================
// Python后端面试指南 - 第9批章节（Django核心）
// =============================================================

export const chapters = [
  {
    id: "pyb-9-1",
    group: "Django核心",
    icon: "🎸",
    title: "Django框架概述 - Django设计哲学(MTV模式、DRY原则、可插拔应用)、Django版本特性、适用场景分析",
    content: `

# Django框架概述

Django是Python生态中最成熟、最流行的全栈Web框架，被称为"完美主义者的Web框架"（the web framework for perfectionists with deadlines）。

## 一、Django简介与历史

Django诞生于2003年，由劳伦斯出版集团（Lawrence Journal-World newspaper）的Adrian Holovaty和Simon Willison开发，最初用于快速开发新闻类网站。2005年以BSD许可证开源，以爵士吉他手Django Reinhardt命名。

### Django的核心定位

- **全栈框架**：自带ORM、模板、认证、Admin、表单、路由等组件，不需要额外集成
- **"电池包含"（Batteries Included）**：开箱即用，Web开发常见功能都有官方实现
- **企业级成熟度**：经过20年发展，被Instagram、Pinterest、Spotify、NASA、Disqus等大公司使用
- **社区活跃**：文档完善，第三方包丰富（Django Packages网站收录数万个包）

## 二、Django设计哲学

### 1. MTV模式（Model-Template-View）

Django采用MTV架构，本质是MVC的变体：

| MTV组件 | 对应MVC | 职责 |
|--------|--------|------|
| **Model（模型）** | Model | 数据层，定义数据结构和数据库交互（ORM） |
| **Template（模板）** | View | 表现层，负责HTML渲染显示 |
| **View（视图）** | Controller | 业务逻辑层，处理请求、调用Model、渲染Template |

Django中还有一个**URL分发器（URLconf）**，负责将URL路由到对应的View。

\`\`\`
浏览器请求 → URLconf路由 → View视图 → Model模型（数据库）
                              ↓
                         Template模板 → 返回HTML响应
\`\`\`

### 2. DRY原则（Don't Repeat Yourself）

不要重复自己！Django从各个层面践行DRY：

- **ORM模型**：定义一次字段，自动生成SQL、Admin表单、表单验证
- **模板继承**：父模板定义基础结构，子模板重写块，避免重复HTML
- **Class-Based View（CBV）**：通用视图封装常见CRUD逻辑，继承复用
- **Static/Media**：静态文件和媒体文件统一管理配置

\`\`\`python
# DRY示例：模型定义一处，多处使用
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)

# 自动：
# 1. 数据库表迁移生成
# 2. Admin后台自动生成表单
# 3. ModelForm自动生成验证
# 4. DRF序列化器可以直接复用（部分）
\`\`\`

### 3. 可插拔应用（Pluggable Apps）

Django项目由多个App组成，App是可复用的功能模块：

- 一个App是一个独立的功能模块（如用户认证、博客、电商商品）
- App可以在多个项目间复用
- 配置INSTALLED_APPS即可启用/禁用功能
- Django自带admin、auth、sessions等都是内置App

\`\`\`python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',         # 内置后台管理App
    'django.contrib.auth',          # 内置认证App
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'blog',          # 我们自己的博客App
    'accounts',      # 用户账户App
    'shop',          # 商城App
    'rest_framework',# 第三方DRF
]
\`\`\`

### 4. 其他设计原则

- **显式优于隐式**：配置优先于约定（对比Rails的"约定优于配置"）
- **快速开发**：帮助开发者尽快完成项目
- **安全默认**：CSRF、XSS、SQL注入、点击劫持默认防护
- **松耦合**：各层之间解耦，可以替换部分组件（如模板引擎可以换Jinja2）

## 三、Django版本特性

### Django版本号规则

- **LTS版本（Long Term Support）**：长期支持版本，推荐生产使用（如1.11、2.2、3.2、4.2、5.2）
- LTS版本提供约3年安全更新支持
- 非LTS版本支持周期约8个月
- 版本号：主版本.次版本.补丁（如4.2.10）

### 各版本重要特性

| 版本 | 发布时间 | Python支持 | 关键特性 |
|-----|---------|-----------|---------|
| Django 2.2 | 2019-04 | 3.5-3.8 | LTS |
| Django 3.0 | 2019-12 | 3.6-3.9 | ASGI支持、MariaDB支持 |
| Django 3.2 | 2021-04 | 3.6-3.10 | LTS，自动APP_CONFIG、BigAutoField默认 |
| Django 4.0 | 2021-12 | 3.8-3.10 | zoneinfo默认时区、Redis缓存后端 |
| Django 4.2 | 2023-04 | 3.8-3.11 | LTS，Psycopg 3支持、流式聚合 |
| Django 5.0 | 2023-12 | 3.10-3.12 | 数据库生成列、简化模型字段表单渲染 |
| Django 5.1 | 2024-08 | 3.10-3.13 | 异步CBV、搜索查询优化 |
| Django 5.2 | 2025-04 | 3.10-3.13 | LTS |

### 学习和生产版本选择建议

- **学习**：用最新稳定版，学习新特性
- **生产**：用LTS版本（当前推荐4.2 LTS或5.2 LTS）
- **升级策略**：不要追最新小版本，等.x.2+稳定后再升级

## 四、Django生态系统

### Django的核心组件

| 组件 | 功能 |
|-----|------|
| ORM | 对象关系映射，数据库交互 |
| URL Dispatcher | URL路由配置 |
| View | 函数视图/类视图，请求处理 |
| Template | 模板引擎，HTML渲染 |
| Forms | 表单处理、验证 |
| Auth | 用户认证、权限、组 |
| Admin | 后台管理界面（杀手级功能！） |
| Sessions | 会话管理 |
| Middleware | 请求/响应中间件 |
| Static Files | 静态文件管理 |
| Cache | 缓存框架（支持Redis/Memcached等） |
| Signals | 信号机制，事件解耦 |

### 流行第三方包

| 包名 | 用途 |
|-----|------|
| Django REST Framework (DRF) | RESTful API开发 |
| Celery | 异步任务/定时任务 |
| Channels | WebSocket/异步支持 |
| Django Allauth | 第三方登录（微信/微博/GitHub等） |
| Django Debug Toolbar | 开发调试工具（显示SQL、性能等） |
| Django Filter | 复杂查询过滤 |
| Django Cors Headers | CORS跨域配置 |
| Django Guardian | 对象级权限 |
| Django Import Export | 数据导入导出 |
| Wagtail | 企业级CMS |

## 五、Django适用场景分析

### 适合Django的场景

1. **内容驱动网站**：博客、新闻、CMS（内容管理系统）——Django起源就是新闻网站
2. **快速原型开发**：需要快速交付MVP（最小可行产品）
3. **传统Web应用**：服务端渲染HTML、有后台管理需求的项目
4. **企业内部系统**：Admin后台是巨大优势，快速搭建管理系统
5. **电商平台**：配合第三方包可以快速开发商城
6. **API后端**：配合Django REST Framework开发REST API
7. **需要安全合规的项目**：Django默认提供完善的安全防护

### 不太适合Django的场景

1. **超大规模超高并发API**：虽然Instagram用Django，但做了大量定制；简单微服务用FastAPI/Flask更轻量
2. **纯WebSocket/实时应用**：用Channels可以做，但不如FastAPI+WebSocket原生异步方便
3. **极简单个API服务**：Flask/FastAPI更轻量，不需要整个Django全家桶
4. **非Web的Python脚本/数据处理**：Django不适合做CLI工具或ETL脚本

### Django vs Flask vs FastAPI对比

| 对比项 | Django | Flask | FastAPI |
|-------|--------|-------|---------|
| 定位 | 全栈框架 | 微框架 | 现代API框架 |
| 自带功能 | 极丰富（ORM/Admin/表单/认证...） | 极少（路由+模板） | 少（API文档/类型验证） |
| 灵活度 | 中等（有固定约定） | 极高（自由选择组件） | 高（基于Starlette） |
| 异步支持 | 3.0+逐步支持 | 2.0+ | 原生异步 |
| 学习曲线 | 较陡（概念多） | 平缓 | 中等（需要类型注解知识） |
| 后台Admin | 自带 | 需要扩展 | 无自带 |
| ORM | 自带强大ORM | 自由选（SQLAlchemy等） | 自由选（SQLAlchemy等） |
| 开发速度 | 快（功能全） | 中等（需要自己集成） | 中等（API场景快） |
| 性能 | 中等 | 中等 | 高（基于Starlette） |
| 适用场景 | 全栈Web/CMS/有后台 | 小型Web/灵活定制 | 高性能API/微服务 |

## 六、Django的安全特性（面试常问）

Django默认提供很多安全防护，这是它的一大优势：

### 1. SQL注入防护
ORM自动使用参数化查询，防止SQL注入：
\`\`\`python
# 安全：ORM自动参数化
User.objects.filter(username=username)
# 生成：SELECT * FROM users WHERE username = %s

# ⚠️ 原生SQL必须用参数，不要字符串拼接
User.objects.raw("SELECT * FROM users WHERE username = %s", [username])  # 安全
\`\`\`

### 2. XSS（跨站脚本）防护
模板默认自动转义HTML特殊字符：
\`\`\`html
<!-- Django模板中{{ }}默认转义 -->
{{ user_input }}  <!-- 自动转义< > & " '等字符 -->

<!-- 需要渲染原始HTML用|safe，必须确保输入可信 -->
{{ trusted_html|safe }}
\`\`\`

### 3. CSRF（跨站请求伪造）防护
默认开启CSRF中间件，POST表单必须带{% csrf_token %}：
\`\`\`html
<form method="post">
    {% csrf_token %}
    <input type="text" name="username">
    <button type="submit">提交</button>
</form>
\`\`\`

### 4. 点击劫持防护
XFrameOptionsMiddleware设置X-Frame-Options头，防止被iframe嵌入。

### 5. HTTPS安全增强
SECURE_SSL_REDIRECT、SESSION_COOKIE_SECURE、CSRF_COOKIE_SECURE等配置。

### 6. 密码哈希
默认使用PBKDF2算法哈希存储密码，支持bcrypt/Argon2。

## 最佳实践

1. **新项目直接用LTS版本**：生产环境稳定性最重要
2. **合理拆分App**：按功能模块拆分App，不要把所有代码塞到一个App里
3. **善用Django Admin**：内部管理系统直接用Admin，不要重复造轮子
4. **先看文档和源码**：Django文档质量极高，遇到问题先查文档
5. **不要过早优化**：Django性能足够支撑大多数中小项目，等真有瓶颈再优化
6. **settings分环境配置**：开发/测试/生产用不同配置文件
7. **多用第三方包**：Django Packages上成熟的包优先于自己写

## 常见坑点

1. **版本不兼容**：第三方包经常和Django版本不兼容，安装前检查兼容的Django版本
2. **App循环引用**：两个App互相import模型导致循环导入
3. **settings提交敏感信息**：SECRET_KEY、数据库密码不要硬编码提交到Git
4. **DEBUG=True生产环境开启**：DEBUG=True会暴露敏感配置和SQL，生产必须关闭
5. **N+1查询**：Django ORM也有N+1问题，忘记select_related/prefetch_related
6. **时区问题**：USE_TZ=True时DateTimeField存UTC时间，显示时要注意转换
7. **静态文件配置错误**：生产环境STATIC_ROOT和STATICFILES_DIRS搞混
8. **migrate冲突**：多人开发时迁移文件冲突
`
  },
  {
    id: "pyb-9-2",
    group: "Django核心",
    icon: "🎸",
    title: "Django项目搭建 - django-admin startproject、项目目录结构解析、settings.py配置详解、APP概念与创建",
    content: `

# Django项目搭建

## 一、Django安装

### 环境准备

\`\`\`bash
# 建议使用虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 安装Django（指定LTS版本）
pip install django==4.2  # 或5.2 LTS版本

# 验证安装
python -m django --version
# 或
django-admin --version
\`\`\`

### 使用pip-tools或Poetry管理依赖（推荐）

\`\`\`bash
# 使用pip-tools
pip install pip-tools
echo "django==4.2" > requirements.in
pip-compile requirements.in  # 生成requirements.txt锁定版本
pip-sync requirements.txt   # 安装依赖
\`\`\`

## 二、创建项目

### django-admin startproject

\`\`\`bash
# 创建项目
django-admin startproject myproject .

# 注意最后那个.很重要！表示在当前目录创建，避免嵌套目录
\`\`\`

如果不加\`.\`，会创建myproject/myproject/嵌套结构，不推荐。

### 项目目录结构

创建完成后目录结构如下：

\`\`\`
myproject/               # 项目根目录
├── manage.py            # 命令行工具，交互入口
├── myproject/           # 项目配置包（与项目同名）
│   ├── __init__.py
│   ├── asgi.py          # ASGI配置（异步/部署用）
│   ├── settings.py      # ⭐ 项目配置文件（最重要）
│   ├── urls.py          # ⭐ 根路由配置
│   └── wsgi.py          # WSGI配置（同步/部署用）
└── venv/                # 虚拟环境（自己创建的）
\`\`\`

### 各文件说明

- **manage.py**：Django命令行工具，通过它运行各种命令：
  - \`python manage.py runserver\`：启动开发服务器
  - \`python manage.py startapp\`：创建App
  - \`python manage.py makemigrations\`：生成迁移
  - \`python manage.py migrate\`：执行迁移
  - \`python manage.py createsuperuser\`：创建管理员
  - \`python manage.py shell\`：Django shell（带环境的Python shell）
  - \`python manage.py collectstatic\`：收集静态文件

- **settings.py**：项目所有配置，数据库、App、中间件、模板等
- **urls.py**：根URL配置，把URL路径映射到视图
- **wsgi.py/asgi.py**：部署时用的WSGI/ASGI应用入口

## 三、运行开发服务器

\`\`\`bash
# 启动开发服务器（默认127.0.0.1:8000）
python manage.py runserver

# 指定端口
python manage.py runserver 8080

# 允许外部访问（局域网访问）
python manage.py runserver 0.0.0.0:8000
\`\`\`

打开浏览器访问 http://127.0.0.1:8000/ 看到Django欢迎页面就是成功了！

⚠️ **注意**：runserver是开发服务器，自动重载代码，**绝对不能用于生产环境**！

## 四、创建App（应用）

### Django App概念

App是Django项目的功能模块，一个项目可以有多个App：
- 一个App对应一个相对独立的功能
- 例如：blog（博客）、accounts（用户）、shop（商城）、comments（评论）
- App可以复用到其他项目
- App必须在INSTALLED_APPS中注册才能使用

### 创建App

\`\`\`bash
# python manage.py startapp <app_name>
python manage.py startapp blog
\`\`\`

创建后目录结构：

\`\`\`
myproject/
├── blog/                    # 新建的blog App
│   ├── __init__.py
│   ├── admin.py             # ⭐ Admin后台注册
│   ├── apps.py              # App配置
│   ├── migrations/          # 数据库迁移文件
│   │   └── __init__.py
│   ├── models.py            # ⭐ 数据模型定义
│   ├── tests.py             # 测试
│   └── views.py             # ⭐ 视图函数/类
├── manage.py
└── myproject/
    ├── __init__.py
    ├── asgi.py
    ├── settings.py
    ├── urls.py
    └── wsgi.py
\`\`\`

### 注册App

在settings.py的INSTALLED_APPS中添加App，否则Django识别不到：

\`\`\`python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'blog',  # 👈 添加我们的blog App
    # 或者用AppConfig：
    # 'blog.apps.BlogConfig',
]
\`\`\`

推荐写AppConfig方式（blog.apps.BlogConfig），这样可以自定义App配置。

\`\`\`python
# blog/apps.py
from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'
    verbose_name = '博客管理'  # 后台显示的名称
\`\`\`

## 五、settings.py配置详解

settings.py是Django最重要的配置文件，这里详细说明常用配置项。

### 基础配置

\`\`\`python
# 项目根目录路径（不要硬编码路径！用BASE_DIR）
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent

# ⚠️ 安全密钥！生产环境保密，不要提交Git！
SECRET_KEY = 'django-insecure-xxxxxxxxxxxxxxxxxxxxxx'

# Debug模式：开发True，生产False！
DEBUG = True

# 允许的主机头（生产环境必须配置域名）
ALLOWED_HOSTS = []
# 生产环境：ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
\`\`\`

### 已安装的App

\`\`\`python
INSTALLED_APPS = [
    # Django内置App
    'django.contrib.admin',         # Admin后台
    'django.contrib.auth',          # 认证系统
    'django.contrib.contenttypes',  # 内容类型框架
    'django.contrib.sessions',      # 会话框架
    'django.contrib.messages',      # 消息框架
    'django.contrib.staticfiles',   # 静态文件
    
    # 第三方App
    # 'rest_framework',
    
    # 自己的App
    'blog.apps.BlogConfig',
]
\`\`\`

### 中间件

中间件是请求/响应的钩子，按顺序执行：

\`\`\`python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',       # 安全
    'django.contrib.sessions.middleware.SessionMiddleware',  # 会话支持
    'django.middleware.common.CommonMiddleware',             # 通用处理
    'django.middleware.csrf.CsrfViewMiddleware',             # CSRF防护
    'django.contrib.auth.middleware.AuthenticationMiddleware',# 认证
    'django.contrib.messages.middleware.MessageMiddleware',  # 消息
    'django.middleware.clickjacking.XFrameOptionsMiddleware',# 点击劫持防护
]
# 顺序很重要：请求从上到下，响应从下到上
\`\`\`

### 模板配置

\`\`\`python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # 模板目录（项目级）
        'APP_DIRS': True,                   # 自动查找App内templates目录
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
\`\`\`

在根目录创建templates文件夹存放项目级模板，App内可以放App自己的templates在app/templates/下。

### 数据库配置

默认SQLite，开发方便；生产换MySQL/PostgreSQL：

\`\`\`python
# 默认SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MySQL配置（需要安装mysqlclient或pymysql）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mydb',
        'USER': 'root',
        'PASSWORD': 'yourpassword',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# PostgreSQL配置（需要安装psycopg2或psycopg2-binary）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydb',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
\`\`\`

### 静态文件与媒体文件

\`\`\`python
# 静态文件（CSS/JS/图片）URL前缀
STATIC_URL = 'static/'

# 开发时App内static目录自动发现；项目级静态文件目录
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# collectstatic收集静态文件的目录（生产用）
STATIC_ROOT = BASE_DIR / 'staticfiles'

# 用户上传媒体文件
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
\`\`\`

### 时区与语言

\`\`\`python
# 语言代码
LANGUAGE_CODE = 'zh-hans'  # 简体中文，默认'en-us'

# 时区
TIME_ZONE = 'Asia/Shanghai'  # 中国时区，默认'UTC'

USE_I18N = True  # 国际化
USE_TZ = True    # 使用时区（推荐True，存UTC时间）
\`\`\`

### 默认主键字段类型

Django 3.2+默认BigAutoField（大整数自增）：

\`\`\`python
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# 老项目用AutoField（int范围）：
# DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
\`\`\`

## 六、第一个视图和URL

现在写一个简单的Hello World来熟悉流程：

### 1. 写视图（blog/views.py）

\`\`\`python
from django.http import HttpResponse

def hello(request):
    return HttpResponse("Hello Django!")
\`\`\`

### 2. App内配置URL（新建blog/urls.py）

\`\`\`python
from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello, name='hello'),
]
\`\`\`

### 3. 根路由include（myproject/urls.py）

\`\`\`python
from django.contrib import admin
from django.urls import path, include  # 导入include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),  # 👈 引入blog App的URL
]
\`\`\`

### 4. 访问测试

启动开发服务器，访问 http://127.0.0.1:8000/blog/hello/ 看到"Hello Django!"就成功了！

## 七、多环境配置最佳实践

生产环境不要把DEBUG=True、数据库密码等硬编码在settings里，推荐拆分配置：

\`\`\`
myproject/
└── myproject/
    ├── settings/
    │   ├── __init__.py
    │   ├── base.py          # 公共配置
    │   ├── development.py   # 开发环境配置
    │   └── production.py    # 生产环境配置
    ├── urls.py
    └── wsgi.py
\`\`\`

\`\`\`python
# settings/base.py
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SECRET_KEY = 'xxx'
INSTALLED_APPS = [...]
# ... 其他公共配置

# settings/development.py
from .base import *
DEBUG = True
ALLOWED_HOSTS = ['*']
DATABASES = { 'default': { 'ENGINE': 'django.db.backends.sqlite3', ... } }

# settings/production.py
from .base import *
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
DATABASES = { 'default': { 'ENGINE': 'django.db.backends.mysql', ... } }

# 启动时指定配置文件：
# python manage.py runserver --settings=myproject.settings.development
\`\`\`

## 常见坑点

1. **startproject最后不加点**：导致嵌套一层项目目录，import路径混乱
2. **忘记注册App**：创建App后忘记加到INSTALLED_APPS，迁移找不到模型
3. **DEBUG=True生产开启**：暴露敏感信息和配置，极其危险
4. **SECRET_KEY泄露**：生产SECRET_KEY必须保密，用环境变量读取
5. **ALLOWED_HOSTS不配置**：生产环境启动报错"Bad Request (400)"
6. **时区错误**：TIME_ZONE设成UTC导致时间差8小时
7. **静态文件404**：开发时没配置STATICFILES_DIRS或App没在INSTALLED_APPS
8. **App命名冲突**：不要用test、django等关键字命名App
`
  },
  {
    id: "pyb-9-3",
    group: "Django核心",
    icon: "🎸",
    title: "Django路由系统 - URLconf配置、path/re_path/URL命名、include路由分发、反向解析reverse、路由参数",
    content: `

# Django路由系统

Django通过URLconf（URL configuration）将URL路径映射到视图函数/类，实现优雅简洁的路由配置。

## 一、URLconf基本配置

### 路由配置位置

根路由在项目目录下的\`urls.py\`，每个App也可以有自己的\`urls.py\`通过include引入。

\`\`\`python
# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # 后台路由（自带）
    path('blog/', include('blog.urls')),  # 分发给blog App的urls
    path('shop/', include('shop.urls')),  # 分发给shop App的urls
]
\`\`\`

App内的urls.py：

\`\`\`python
# blog/urls.py
from django.urls import path
from . import views

app_name = 'blog'  # URL命名空间，用于反向解析

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('<int:post_id>/', views.post_detail, name='post_detail'),
    path('create/', views.post_create, name='post_create'),
    path('<int:post_id>/edit/', views.post_edit, name='post_edit'),
    path('<int:post_id>/delete/', views.post_delete, name='post_delete'),
]
\`\`\`

## 二、path()函数详解

path()是Django 2.0+推荐的路由写法，使用路径转换器捕获参数。

### path()语法

\`\`\`python
path(route, view, name=None, kwargs=None)
\`\`\`

- **route**：URL路径字符串，可以包含路径转换器
- **view**：视图函数或as_view()（类视图）
- **name**：URL名称，用于反向解析
- **kwargs**：额外参数，字典形式传给视图

### 路径转换器（Path Converters）

Django内置以下路径转换器：

| 转换器 | 匹配规则 | 返回类型 | 示例 |
|-------|---------|---------|------|
| str | 匹配非空字符串，不含/ | str（默认） | <str:username> |
| int | 匹配0或正整数 | int | <int:post_id> |
| slug | 匹配ASCII字母、数字、连字符、下划线 | str | <slug:post_slug> |
| uuid | 匹配UUID格式字符串 | UUID对象 | <uuid:order_uuid> |
| path | 匹配任意非空字符串，包含/ | str | <path:file_path> |

\`\`\`python
# 示例
path('post/<int:post_id>/', views.post_detail),
# 匹配 /post/1/, /post/99/ ；不匹配 /post/abc/

path('user/<str:username>/', views.user_profile),
# 匹配 /user/zhangsan/, /user/lisi/

path('article/<slug:slug>/', views.article_detail),
# 匹配 /article/hello-world/, /article/django_tutorial/

path('file/<path:filepath>/', views.serve_file),
# 匹配 /file/static/css/style.css/, /file/uploads/2024/a.jpg/

path('order/<uuid:order_id>/', views.order_detail),
# 匹配 /order/550e8400-e29b-41d4-a716-446655440000/
\`\`\`

### 多个参数捕获

\`\`\`python
# 捕获多个参数
path('blog/<int:year>/<int:month>/', views.post_archive),
# 匹配 /blog/2024/3/，视图参数：year=2024, month=3

# 视图函数接收参数
def post_archive(request, year, month):
    posts = Post.objects.filter(create_time__year=year, create_time__month=month)
    return render(request, 'archive.html', {'posts': posts})
\`\`\`

## 三、re_path()：正则表达式路由

path()不够用的时候，可以用re_path()写正则表达式：

\`\`\`python
from django.urls import path, re_path

urlpatterns = [
    # path()写法
    path('post/<int:post_id>/', views.post_detail),
    
    # re_path()正则写法，?P<name>pattern是命名捕获组
    re_path(r'^post/(?P<post_id>[0-9]+)/$', views.post_detail),
    
    # 更复杂的正则
    re_path(r'^archive/(?P<year>[0-9]{4})/(?P<month>[0-9]{1,2})/$', views.archive),
    
    # 只允许GET等（虽然应该在视图层处理）
    re_path(r'^api/.*$', views.api_handler),
]
\`\`\`

⚠️ **最佳实践**：优先用path()，简单可读；只有path()满足不了才用re_path()。

## 四、路由分发include()

大型项目必须拆分路由，include()实现路由分发：

### 1. include App的urls.py（最常用）

\`\`\`python
# 根urls.py
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),  # blog/开头的URL交给blog.urls处理
    path('api/v1/', include('api.urls')),
]
\`\`\`

include()会去掉匹配的前缀（如'blog/'），剩下的部分给App的urls处理。

例如：\`/blog/123/\` → include去掉\`blog/\` → App urls处理\`<int:post_id>/\`

### 2. include其他URLconf列表

\`\`\`python
from django.urls import path, include
from . import views

extra_patterns = [
    path('reports/<int:id>/', views.report),
    path('reports/<int:id>/pdf/', views.report_pdf),
]

urlpatterns = [
    path('blog/', include(extra_patterns)),
]
\`\`\`

### 3. include元组指定app_name（命名空间）

\`\`\`python
# 方式1：App的urls.py里写app_name
# blog/urls.py里写 app_name = 'blog'

# 方式2：include时指定命名空间
path('blog/', include(('blog.urls', 'blog'), namespace='blog')),
\`\`\`

### 4. include Admin路由（自带）

\`\`\`python
urlpatterns = [
    path('admin/', admin.site.urls),  # 这也是include！
]
\`\`\`

## 五、URL反向解析reverse()

硬编码URL是维护噩梦，用name反向解析URL：

### 在Python代码中reverse

\`\`\`python
from django.urls import reverse

# 无参数
url = reverse('blog:post_list')  # '/blog/'

# 位置参数
url = reverse('blog:post_detail', args=[123])  # '/blog/123/'

# 关键字参数（推荐，更清晰）
url = reverse('blog:post_detail', kwargs={'post_id': 123})  # '/blog/123/'

# 多个参数
url = reverse('blog:archive', kwargs={'year': 2024, 'month': 3})
\`\`\`

### 在模板中{% url %}

\`\`\`html
<!-- 无参数 -->
<a href="{% url 'blog:post_list' %}">文章列表</a>

<!-- 带参数 -->
<a href="{% url 'blog:post_detail' post_id=post.id %}">{{ post.title }}</a>

<!-- 带多个参数 -->
<a href="{% url 'blog:archive' year=2024 month=3 %}">2024年3月</a>
\`\`\`

### 重定向中使用

\`\`\`python
from django.shortcuts import redirect, reverse

def post_create(request):
    if request.method == 'POST':
        post = Post.objects.create(...)
        # 重定向到详情页
        return redirect('blog:post_detail', post_id=post.id)
        # 等价于：return redirect(reverse('blog:post_detail', kwargs={'post_id': post.id}))
\`\`\`

## 六、URL命名空间

多个App可能有同名的URL（如都有'index'），用app_name做命名空间隔离：

\`\`\`python
# blog/urls.py
app_name = 'blog'  # 👈 命名空间
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:pk>/', views.detail, name='detail'),
]

# shop/urls.py
app_name = 'shop'
urlpatterns = [
    path('', views.index, name='index'),  # 同名index，不会冲突！
    path('<int:pk>/', views.detail, name='detail'),
]

# 反向解析时加命名空间前缀
reverse('blog:index')  # '/blog/'
reverse('shop:index')  # '/shop/'
reverse('blog:detail', kwargs={'pk': 1})  # '/blog/1/'
\`\`\`

### 嵌套命名空间

\`\`\`python
# 根urls.py
path('api/v1/', include('api.v1.urls', namespace='v1')),

# api/v1/urls.py
app_name = 'v1'
urlpatterns = [
    path('posts/', include('api.v1.posts.urls', namespace='posts')),
]

# 使用
reverse('v1:posts:list')  # '/api/v1/posts/'
\`\`\`

## 七、额外参数kwargs

path()的kwargs参数可以传递额外参数给视图：

\`\`\`python
# urls.py
path('blog/', views.post_list, {'paginate_by': 10}, name='post_list'),
path('blog/archive/', views.post_list, {'paginate_by': 20}, name='post_archive'),

# views.py接收额外参数
def post_list(request, paginate_by=10):
    posts = Post.objects.all()[:paginate_by]
    return render(request, 'list.html', {'posts': posts})
\`\`\`

还可以传递额外参数给include()，所有包含的路由都会收到：

\`\`\`python
path('blog/', include('blog.urls'), {'blog_id': 1}),
# blog.urls里的所有视图都会收到blog_id参数
\`\`\`

## 八、路由尾斜杠问题

Django默认APPEND_SLASH=True，访问不带/的URL会自动重定向到带/的：

- 访问\`/blog/post/123\` → 自动301重定向到\`/blog/post/123/\`
- 所以定义路由时统一以/结尾
- 如果不想自动加斜杠，设置\`APPEND_SLASH = False\`（不推荐）

## 九、自定义路径转换器

可以自定义路径转换器：

\`\`\`python
# 创建converters.py
class FourDigitYearConverter:
    regex = '[0-9]{4}'
    
    def to_python(self, value):
        return int(value)  # URL字符串转Python类型
    
    def to_url(self, value):
        return f'{value:04d}'  # Python类型转URL字符串（反向解析用）

# 注册转换器（在urls.py中）
from django.urls import register_converter
from .converters import FourDigitYearConverter

register_converter(FourDigitYearConverter, 'yyyy')

# 使用
urlpatterns = [
    path('archive/<yyyy:year>/', views.archive, name='archive'),
]
\`\`\`

## 最佳实践

1. **路由统一以/结尾**：符合Django约定，避免重定向
2. **每个App都建自己的urls.py**：不要把所有路由塞到根urls里
3. **总是给路由设置name参数**：方便反向解析，避免硬编码
4. **总是设置app_name命名空间**：避免重名冲突
5. **优先用path()，少用re_path()**：path()更清晰易读
6. **URL设计RESTful风格**：名词+HTTP方法，URL不暴露动词
7. **参数使用关键字参数**：kwargs比args可读性高
8. **用reverse()/{% url %}而不是硬编码**：URL修改时只需要改一处

\`\`\`
# RESTful风格路由设计
GET    /posts/              → 列表
GET    /posts/<int:id>/     → 详情
POST   /posts/create/       → 创建表单/创建
GET    /posts/<int:id>/edit/  → 编辑表单
POST   /posts/<int:id>/edit/  → 提交编辑
POST   /posts/<int:id>/delete/ → 删除
\`\`\`

## 常见坑点

1. **路由顺序问题**：Django按urlpatterns顺序匹配，从上到下，匹配到第一个就停止。把精确路由放前面，模糊/通用路由放后面：
\`\`\`python
# ✅ 正确顺序
path('posts/create/', views.post_create),      # 先匹配create
path('posts/<int:pk>/', views.post_detail),    # 再匹配参数

# ❌ 错误顺序：<int:pk>会匹配到'create'字符串（如果用str转换器）
path('posts/<int:pk>/', views.post_detail),
path('posts/create/', views.post_create),
\`\`\`

2. **include时路径前缀问题**：include()会去掉匹配的前缀，App urls里不要重复写前缀

3. **正则re_path忘记^和$**：正则路由开头^结尾$精确匹配

4. **参数名不匹配**：路径转换器捕获的参数名必须和视图参数名一致

5. **忘记加app_name**：反向解析时报错NoReverseMatch

6. **APPEND_SLASH导致的POST数据丢失**：POST请求访问不带/的URL，301重定向会变成GET，POST数据丢失

7. **kwargs参数覆盖捕获参数**：如果kwargs的key和路径捕获参数重名，kwargs会覆盖捕获值
`
  },
  {
    id: "pyb-9-4",
    group: "Django核心",
    icon: "🎸",
    title: "Django视图层 - 函数视图FBV与类视图CBV、HttpRequest/HttpResponse对象、JsonResponse、快捷函数",
    content: `

# Django视图层

视图是Django处理Web请求的核心，接收HttpRequest，返回HttpResponse。

## 一、请求响应流程

\`\`\`
浏览器 → WSGI/ASGI → Middleware → URL路由 → 视图View → Model/Form
                                                         ↓
                                           HttpResponse ← Template
\`\`\`

视图必须是可调用对象（函数或实现了__call__的类），接收HttpRequest作为第一个参数，返回HttpResponse。

## 二、函数视图FBV（Function-Based Views）

函数视图最直观，用Python函数处理请求：

\`\`\`python
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from .models import Post

# 最简单的视图
def hello(request):
    return HttpResponse("Hello World!")

# 带参数的视图（来自URL捕获）
def post_detail(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return HttpResponseNotFound("文章不存在")
    
    # 判断请求方法
    if request.method == 'GET':
        return render(request, 'post_detail.html', {'post': post})
    elif request.method == 'POST':
        # 处理POST提交
        pass

# 返回JSON
def api_posts(request):
    posts = list(Post.objects.values('id', 'title', 'create_time'))
    return JsonResponse({'posts': posts}, safe=False)
\`\`\`

## 三、HttpRequest对象详解

request是Django传递给视图的请求对象，包含所有请求信息。

### 常用属性

| 属性 | 说明 | 示例 |
|-----|------|------|
| request.method | 请求方法，大写字符串 | 'GET', 'POST', 'PUT', 'DELETE' |
| request.GET | GET参数，类字典对象QueryDict | request.GET.get('page', 1) |
| request.POST | POST表单数据 | request.POST.get('username') |
| request.body | 原始请求体（bytes） | 处理JSON/XML用 |
| request.FILES | 上传的文件 | request.FILES.get('avatar') |
| request.path | 请求路径（不含域名） | '/blog/123/' |
| request.path_info | 同上，推荐用这个 |
| request.user | 当前登录用户（User对象） | request.user.is_authenticated |
| request.session | 会话字典 | request.session['user_id'] = 1 |
| request.COOKIES | Cookie字典 | request.COOKIES.get('token') |
| request.META | 请求头/环境变量 | request.META.get('REMOTE_ADDR') |
| request.content_type | 请求Content-Type | 'application/json' |
| request.scheme | 'http'或'https' |
| request.encoding | 编码 | 'utf-8' |

\`\`\`python
def view_demo(request):
    # 请求方法
    if request.method == 'POST':
        username = request.POST.get('username')  # 获取POST参数
        password = request.POST.get('password')
    
    # GET参数
    page = request.GET.get('page', 1)
    keyword = request.GET.get('keyword', '')
    
    # 请求头
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    ip = request.META.get('REMOTE_ADDR')
    auth = request.META.get('HTTP_AUTHORIZATION')
    
    # JSON请求体（AJAX/fetch提交JSON）
    import json
    if request.content_type == 'application/json':
        data = json.loads(request.body)
        print(data)
    
    # 当前用户
    if request.user.is_authenticated:
        print(f"登录用户：{request.user.username}")
    else:
        print("未登录")
    
    return HttpResponse("OK")
\`\`\`

### QueryDict的特殊用法

request.GET和request.POST是QueryDict，支持多值：

\`\`\`python
# ?tags=python&tags=django
tags = request.GET.getlist('tags')  # ['python', 'django']
# 不要用.get()，只会返回最后一个值
\`\`\`

## 四、HttpResponse对象

### 基本HttpResponse

\`\`\`python
from django.http import HttpResponse

# 返回文本
resp = HttpResponse("Hello")
resp = HttpResponse("Hello", content_type="text/plain; charset=utf-8")

# 设置状态码
resp = HttpResponse("Not Found", status=404)
resp = HttpResponse("Created", status=201)

# 设置响应头
resp = HttpResponse()
resp['X-Custom-Header'] = 'value'
resp.set_cookie('token', 'abc123', max_age=3600)
resp.delete_cookie('old_cookie')

# 返回文件
resp = HttpResponse(image_data, content_type='image/png')
resp['Content-Disposition'] = 'attachment; filename="image.png"'
\`\`\`

### 常用HttpResponse子类

| 类 | 状态码 | 用途 |
|---|-------|------|
| HttpResponseRedirect | 302 | 重定向（用redirect()快捷函数） |
| HttpResponsePermanentRedirect | 301 | 永久重定向 |
| HttpResponseNotModified | 304 | 未修改（缓存用） |
| HttpResponseBadRequest | 400 | 错误请求 |
| HttpResponseNotFound | 404 | 未找到 |
| HttpResponseForbidden | 403 | 禁止访问 |
| HttpResponseNotAllowed | 405 | 方法不允许 |
| HttpResponseServerError | 500 | 服务器错误 |
| JsonResponse | 200 | 返回JSON |
| FileResponse | 200 | 返回文件 |

### JsonResponse详解

\`\`\`python
from django.http import JsonResponse

# 返回字典（默认safe=True，只能传dict）
def user_info(request):
    return JsonResponse({
        'id': 1,
        'name': '张三',
        'email': 'z@e.com'
    })

# 返回列表（safe=False）
def post_list(request):
    posts = list(Post.objects.values('id', 'title'))
    return JsonResponse(posts, safe=False)

# 自定义状态码
return JsonResponse({'error': '参数错误'}, status=400)

# 处理中文不转Unicode
return JsonResponse({'msg': '成功'}, json_dumps_params={'ensure_ascii': False})
\`\`\`

### FileResponse返回文件

\`\`\`python
from django.http import FileResponse
import os

def download_file(request, filename):
    filepath = os.path.join(settings.MEDIA_ROOT, filename)
    response = FileResponse(open(filepath, 'rb'), as_attachment=True)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
\`\`\`

## 五、快捷函数（Shortcuts）

Django提供常用快捷函数简化视图开发：

### render()：渲染模板

\`\`\`python
from django.shortcuts import render

def post_list(request):
    posts = Post.objects.all()
    # render(request, 模板名, 上下文字典)
    return render(request, 'blog/post_list.html', {
        'posts': posts,
        'title': '文章列表'
    })
# 等价于：
# from django.template import loader
# template = loader.get_template('blog/post_list.html')
# return HttpResponse(template.render({'posts': posts}, request))
\`\`\`

### redirect()：重定向

\`\`\`python
from django.shortcuts import redirect

def post_create(request):
    if request.method == 'POST':
        post = Post.objects.create(title=request.POST['title'])
        # 1. 反向解析URL（推荐）
        return redirect('blog:post_detail', post_id=post.id)
        # 2. 硬编码URL
        # return redirect('/blog/{}/'.format(post.id))
        # 3. 相对URL
        # return redirect('/blog/')
        # 4. 外部URL
        # return redirect('https://www.example.com/')
        # 5. 传递permanent=True做301永久重定向
        # return redirect('blog:post_list', permanent=True)
\`\`\`

### get_object_or_404()：获取对象或404

\`\`\`python
from django.shortcuts import get_object_or_404

def post_detail(request, post_id):
    # ✅ 优雅写法：找不到直接返回404
    post = get_object_or_404(Post, id=post_id)
    
    # ❌ 繁琐写法：
    # try:
    #     post = Post.objects.get(id=post_id)
    # except Post.DoesNotExist:
    #     raise Http404("文章不存在")
    
    # 可以加过滤条件
    post = get_object_or_404(Post, id=post_id, is_published=True)
    
    return render(request, 'detail.html', {'post': post})
\`\`\`

### get_list_or_404()：获取列表或404

\`\`\`python
from django.shortcuts import get_list_or_404

def post_by_category(request, category_id):
    # 查不到任何数据返回404
    posts = get_list_or_404(Post, category_id=category_id, is_published=True)
    return render(request, 'list.html', {'posts': posts})
\`\`\`

## 六、类视图CBV（Class-Based Views）

类视图是用类实现的视图，支持继承、Mixin，代码复用性更高。

### 基础View类

\`\`\`python
from django.http import HttpResponse
from django.views import View

class HelloView(View):
    # 处理GET请求
    def get(self, request):
        return HttpResponse("Hello GET")
    
    # 处理POST请求
    def post(self, request):
        return HttpResponse("Hello POST")
    
    # 其他方法：put, delete, patch等

# urls.py中需要as_view()
from django.urls import path
from .views import HelloView
urlpatterns = [
    path('hello/', HelloView.as_view(), name='hello'),
]
\`\`\`

### 通用视图（Generic Views）

Django提供很多通用CBV封装常见操作：

| 通用视图 | 用途 |
|---------|------|
| TemplateView | 渲染模板 |
| RedirectView | 重定向 |
| ListView | 列表页（分页） |
| DetailView | 详情页 |
| CreateView | 创建对象 |
| UpdateView | 更新对象 |
| DeleteView | 删除对象 |
| FormView | 表单处理 |

\`\`\`python
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Post

# 列表视图
class PostListView(ListView):
    model = Post                    # 模型
    template_name = 'blog/list.html'  # 模板
    context_object_name = 'posts'   # 上下文变量名
    paginate_by = 10                # 每页条数
    ordering = ['-create_time']     # 排序
    
    def get_queryset(self):
        # 自定义查询集
        return Post.objects.filter(is_published=True)

# 详情视图
class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/detail.html'
    context_object_name = 'post'
    
    def get_object(self, queryset=None):
        # 自定义对象获取
        obj = super().get_object(queryset)
        obj.view_count += 1
        obj.save(update_fields=['view_count'])
        return obj

# 创建视图
class PostCreateView(CreateView):
    model = Post
    fields = ['title', 'content', 'category']
    template_name = 'blog/form.html'
    success_url = reverse_lazy('blog:post_list')  # 反向解析用reverse_lazy！
    
    def form_valid(self, form):
        form.instance.author = self.request.user  # 自动设置作者
        return super().form_valid(form)

# urls.py
urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('create/', PostCreateView.as_view(), name='post_create'),
]
\`\`\`

### FBV vs CBV对比

| 对比项 | FBV | CBV |
|-------|-----|-----|
| 可读性 | 直观易懂，流程清晰 | 相对不直观，需要了解类继承 |
| 代码复用 | 装饰器复用 | 继承/Mixin复用性更好 |
| HTTP方法区分 | if request.method判断 | 直接写get/post/put方法 |
| 适用场景 | 简单视图、特殊逻辑 | 标准CRUD、需要复用代码 |
| 学习成本 | 低 | 较高（需要了解各种Mixin和通用视图） |

**建议**：简单逻辑用FBV，标准CRUD用CBV，不要为了用CBV而用CBV。

## 七、HTTP方法处理与装饰器

### require_http_methods装饰器

\`\`\`python
from django.views.decorators.http import (
    require_http_methods,
    require_GET,
    require_POST,
    require_safe,  # GET/HEAD
)

@require_GET
def post_list(request):
    # 只允许GET，其他方法返回405
    posts = Post.objects.all()
    return render(request, 'list.html', {'posts': posts})

@require_POST
def post_create(request):
    # 只允许POST
    pass

@require_http_methods(["GET", "POST"])
def post_edit(request, pk):
    # 允许GET和POST
    pass
\`\`\`

### 类视图添加装饰器

\`\`\`python
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

# 方式1：装饰as_view()
# urls.py
path('profile/', login_required(ProfileView.as_view()), name='profile')

# 方式2：method_decorator在类上
@method_decorator(login_required, name='dispatch')
class ProfileView(View):
    def get(self, request):
        return render(request, 'profile.html')

# 方式3：装饰具体方法
class PostEditView(View):
    @method_decorator(login_required)
    def get(self, request):
        pass
\`\`\`

## 最佳实践

1. **视图只做请求/响应处理**：业务逻辑抽离到service层或model方法，不要写在视图里
2. **视图保持精简**：复杂逻辑抽到函数/服务类中
3. **善用快捷函数**：render/redirect/get_object_or_404简化代码
4. **标准CRUD优先考虑CBV**：CreateView/ListView等通用视图快速开发
5. **FBV不要嵌套太深**：if method/if valid/if auth嵌套太多层时考虑拆分或用CBV
6. **返回合适的HTTP状态码**：创建成功201，删除成功204，参数错误400，未认证401，权限不足403，不存在404
7. **JSON API统一响应格式**：code/msg/data结构统一
8. **永远不要信任用户输入**：所有参数校验后再使用

\`\`\`python
# ✅ 好的视图分层
def post_create(request):
    # 视图层：参数解析、权限校验、返回响应
    if not request.user.is_authenticated:
        return JsonResponse({'code': 401, 'msg': '未登录'}, status=401)
    
    serializer = PostSerializer(data=request.POST)
    if not serializer.is_valid():
        return JsonResponse({'code': 400, 'msg': serializer.errors}, status=400)
    
    # 业务逻辑层：创建文章（单独函数）
    post = create_post(request.user, serializer.validated_data)
    
    return JsonResponse({'code': 0, 'data': {'id': post.id}})
\`\`\`

## 常见坑点

1. **request.POST取不到JSON数据**：axios/fetch提交JSON时在request.body里，需要json.loads(request.body)
2. **FBV中if method判断忘记else/return**：导致代码继续往下执行
3. **CBV里忘记加as_view()**：urls.py直接写HelloView会报错，必须HelloView.as_view()
4. **reverse_lazy vs reverse**：CBV类属性（如success_url）中用reverse_lazy，因为URLconf还没加载
5. **QueryDict的get()只返回最后一个值**：多选/多值参数用getlist()
6. **request.user在匿名时是AnonymousUser**：不是None！要用is_authenticated判断
7. **JsonResponse返回列表需要safe=False**：默认只允许dict，传list要设safe=False
8. **FileResponse忘记打开文件为rb模式**：二进制文件必须'rb'打开
`
  },
  {
    id: "pyb-9-5",
    group: "Django核心",
    icon: "🎸",
    title: "Django模板引擎 - DTL模板语法、模板继承extends/include、模板标签(if/for/url)、自定义标签过滤器",
    content: `

# Django模板引擎

Django自带DTL（Django Template Language）模板引擎，用于动态渲染HTML。模板专注于表现层，不嵌入复杂业务逻辑。

## 一、模板配置与基础

### 模板目录配置

\`\`\`python
# settings.py
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # 项目级模板目录
        'APP_DIRS': True,  # 自动查找每个App下的templates目录
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
\`\`\`

模板查找顺序：
1. 先找DIRS中的目录
2. 再找INSTALLED_APPS中每个App的templates目录

所以App内模板推荐路径：\`app/templates/app/xxx.html\` 避免命名冲突。

### render()渲染模板

\`\`\`python
from django.shortcuts import render

def post_list(request):
    posts = Post.objects.all()
    # render(request, 模板路径, 上下文字典)
    return render(request, 'blog/post_list.html', {
        'posts': posts,
        'site_name': '我的博客',
    })
\`\`\`

## 二、DTL模板语法

### 1. 变量输出{{ }}

\`\`\`html
<!-- 简单变量 -->
<h1>{{ site_name }}</h1>
<p>作者：{{ author.name }}</p>

<!-- 点语法访问属性/方法/索引 -->
<p>{{ post.title }}</p>          <!-- 属性 -->
<p>{{ post.get_status_display }}</p>  <!-- 无参数方法（自动调用） -->
<p>{{ posts.0.title }}</p>      <!-- 列表/元组索引 -->
<p>{{ user_dict.name }}</p>     <!-- 字典key -->

<!-- 如果变量不存在，默认输出空（不会报错） -->
<p>{{ 不存在的变量 }}</p>  <!-- 空字符串 -->
\`\`\`

### 2. 标签{% %}

标签用于逻辑控制、循环、条件等。

#### if条件判断

\`\`\`html
{% if user.is_authenticated %}
    <p>欢迎，{{ user.username }}！</p>
{% else %}
    <a href="/login/">登录</a>
{% endif %}

<!-- 多条件 -->
{% if post.status == 'published' %}
    <span class="badge badge-success">已发布</span>
{% elif post.status == 'draft' %}
    <span class="badge badge-warning">草稿</span>
{% else %}
    <span class="badge badge-secondary">未知</span>
{% endif %}

<!-- 逻辑运算 -->
{% if posts and posts|length > 0 %}
    {% for post in posts %}...{% endfor %}
{% else %}
    <p>暂无文章</p>
{% endif %}

<!-- 比较运算符（DTL中用关键字） -->
{% if age >= 18 %}成年人{% endif %}
{% if age < 18 %}未成年人{% endif %}
{% if name == "张三" %}...{% endif %}
{% if name != "李四" %}...{% endif %}

<!-- 逻辑运算符 and/or/not -->
{% if is_active and age >= 18 %}
{% if not is_banned %}
{% if role == "admin" or role == "editor" %}

<!-- in 运算符 -->
{% if user.role in "admin,editor" %}
{% if 1 in selected_ids %}

<!-- is运算符 -->
{% if some_var is None %}
{% if some_var is not None %}
\`\`\`

⚠️ DTL的if中**不能用圆括号分组**！也**不支持Python的任意表达式**，只能用允许的运算符。复杂逻辑在视图里处理好再传给模板。

#### for循环

\`\`\`html
<ul>
{% for post in posts %}
    <li>
        {{ forloop.counter }}. {{ post.title }}
        <small>{{ post.create_time|date:"Y-m-d" }}</small>
    </li>
{% empty %}
    <li>暂无文章</li>
{% endfor %}
</ul>
\`\`\`

forloop变量：

| 变量 | 说明 |
|-----|------|
| forloop.counter | 当前循环次数，从1开始 |
| forloop.counter0 | 从0开始 |
| forloop.revcounter | 倒序计数（到1结束） |
| forloop.revcounter0 | 倒序计数（到0结束） |
| forloop.first | 是否第一次循环（bool） |
| forloop.last | 是否最后一次循环（bool） |
| forloop.parentloop | 外层循环的forloop对象 |

\`\`\`html
<!-- 嵌套循环 -->
{% for category in categories %}
    <h3>{{ category.name }}</h3>
    <ul>
    {% for post in category.post_set.all %}
        <li>{{ forloop.parentloop.counter }}-{{ forloop.counter }}: {{ post.title }}</li>
    {% endfor %}
    </ul>
{% endfor %}

<!-- 字典循环 -->
{% for key, value in my_dict.items %}
    <p>{{ key }}: {{ value }}</p>
{% endfor %}

<!-- 循环reversed倒序 -->
{% for post in posts reversed %}
    {{ post.title }}
{% endfor %}
\`\`\`

### 3. 过滤器|

过滤器修改变量显示格式，用|管道符，可以链式调用。

常用内置过滤器：

| 过滤器 | 说明 | 示例 |
|-------|------|------|
| default | 默认值 | {{ value\\|default:"暂无" }} |
| length | 长度 | {{ list\\|length }} |
| lower/upper | 大小写 | {{ name\\|upper }} |
| title | 标题格式 | {{ name\\|title }} |
| truncatechars | 截断字符 | {{ text\\|truncatechars:30 }} |
| truncatewords | 截断单词 | {{ text\\|truncatewords:10 }} |
| date | 日期格式化 | {{ time\\|date:"Y-m-d H:i:s" }} |
| safe | 不转义HTML | {{ html\\|safe }} |
| escape | 转义HTML（默认已转） | {{ data\\|escape }} |
| striptags | 去除HTML标签 | {{ html\\|striptags }} |
| slice | 切片 | {{ list\\|slice:":5" }} |
| join | 列表连接 | {{ list\\|join:", " }} |
| floatformat | 小数格式化 | {{ price\\|floatformat:2 }} |
| add | 加法 | {{ num\\|add:1 }} |
| dictsort | 字典排序 | {{ list\\|dictsort:"name" }} |
| pluralize | 复数 | {{ count }} item{{ count\\|pluralize }} |
| filesizeformat | 文件大小 | {{ size\\|filesizeformat }} |

\`\`\`html
<!-- 链式调用 -->
<p>{{ post.content|truncatechars:100|striptags }}</p>

<!-- 日期格式化 -->
<p>{{ post.create_time|date:"Y年m月d日 H:i" }}</p>

<!-- 数字格式化 -->
<p>价格：¥{{ price|floatformat:2 }}</p>

<!-- 文件大小 -->
<p>文件大小：{{ file.size|filesizeformat }}</p>

<!-- 默认值 -->
<p>{{ bio|default:"这个人很懒，什么也没写" }}</p>
\`\`\`

### 4. 注释

\`\`\`html
<!-- 单行注释，HTML注释用户能看到源码 -->
{# 这是DTL注释，不会渲染到HTML #}

{% comment "注释说明" %}
多行DTL注释
所有内容都不会渲染
{% endcomment %}
\`\`\`

## 三、模板继承（extends/block）

模板继承是DTL最强大的功能，实现模板复用，符合DRY原则。

### 1. 定义基础模板base.html

\`\`\`html
<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}默认标题{% endblock %} - 我的博客</title>
    {% block extra_css %}{% endblock %}
</head>
<body>
    <header>
        <nav>
            <a href="/">首页</a>
            <a href="/blog/">博客</a>
            {% if user.is_authenticated %}
                <a href="/accounts/profile/">{{ user.username }}</a>
                <a href="/accounts/logout/">退出</a>
            {% else %}
                <a href="/accounts/login/">登录</a>
            {% endif %}
        </nav>
    </header>

    <main>
        {% block content %}
        <!-- 子页面重写这个block -->
        {% endblock %}
    </main>

    <footer>
        <p>&copy; 2024 我的博客</p>
    </footer>

    {% block extra_js %}{% endblock %}
</body>
</html>
\`\`\`

### 2. 子模板继承并重写block

\`\`\`html
<!-- templates/blog/post_list.html -->
{% extends "base.html" %}

{% block title %}文章列表{% endblock %}

{% block extra_css %}
<style>
    .post-list { list-style: none; }
</style>
{% endblock %}

{% block content %}
<h1>文章列表</h1>
<ul class="post-list">
{% for post in posts %}
    <li>
        <a href="{% url 'blog:post_detail' post_id=post.id %}">{{ post.title }}</a>
        <small>{{ post.create_time|date:"Y-m-d" }}</small>
    </li>
{% empty %}
    <p>暂无文章</p>
{% endfor %}
</ul>
{% endblock %}

{% block extra_js %}
<script>
    // 页面额外JS
</script>
{% endblock %}
\`\`\`

### 3. block.super保留父模板内容

\`\`\`html
{% block extra_css %}
{{ block.super }}  {# 保留父模板的extra_css内容 #}
<style>
    /* 追加子页面样式 */
</style>
{% endblock %}
\`\`\`

### include包含子模板

include用于包含其他模板片段，复用公共组件：

\`\`\`html
<!-- templates/blog/post_list.html -->
{% extends "base.html" %}

{% block content %}
<h1>文章列表</h1>

{% for post in posts %}
    {% include "blog/_post_card.html" with post=post show_detail=True %}
{% endfor %}

<!-- 分页组件 -->
{% include "_pagination.html" %}
{% endblock %}
\`\`\`

\`\`\`html
<!-- templates/blog/_post_card.html (通常用_开头表示是片段) -->
<div class="post-card">
    <h3><a href="{% url 'blog:post_detail' post_id=post.id %}">{{ post.title }}</a></h3>
    <p>{{ post.content|truncatechars:200 }}</p>
    {% if show_detail %}
        <a href="{% url 'blog:post_detail' post_id=post.id %}">阅读全文</a>
    {% endif %}
</div>
\`\`\`

with关键字给include模板传递额外变量。

## 四、URL标签{% url %}

模板中用{% url %}反向解析URL，避免硬编码：

\`\`\`html
<!-- 无参数 -->
<a href="{% url 'blog:post_list' %}">文章列表</a>

<!-- 位置参数 -->
<a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a>

<!-- 关键字参数 -->
<a href="{% url 'blog:archive' year=2024 month=3 %}">2024年3月</a>

<!-- as保存到变量 -->
{% url 'blog:post_detail' post.id as post_url %}
<a href="{{ post_url }}">{{ post.title }}</a>
\`\`\`

## 五、静态文件加载

\`\`\`html
{% load static %}

<img src="{% static 'images/logo.png' %}" alt="Logo">
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<script src="{% static 'js/main.js' %}"></script>
\`\`\`

需要在模板开头\`{% load static %}\`加载static标签。

## 六、自定义模板标签和过滤器

当内置标签/过滤器不够用时，可以自定义。

### 1. 创建templatetags目录

在App下创建\`templatetags\`目录，包含\`__init__.py\`和自定义标签文件：

\`\`\`
blog/
├── templatetags/
│   ├── __init__.py
│   └── blog_tags.py   # 自定义标签/过滤器
\`\`\`

重启开发服务器，模板中{% load blog_tags %}使用。

### 2. 自定义过滤器

\`\`\`python
# blog/templatetags/blog_tags.py
from django import template

register = template.Library()

# 方式1：装饰器注册
@register.filter
def markdown_to_html(text):
    """将Markdown文本转为HTML"""
    import markdown
    return markdown.markdown(text)

@register.filter(name='add_class')
def add_class(field, css_class):
    """给表单字段添加CSS类"""
    return field.as_widget(attrs={'class': css_class})

# 方式2：register.filter注册
def cut(value, arg):
    return value.replace(arg, '')
register.filter('cut', cut)
\`\`\`

模板中使用：

\`\`\`html
{% load blog_tags %}

<!-- 使用自定义过滤器 -->
<div class="content">{{ post.content|markdown_to_html|safe }}</div>

<!-- 表单加CSS类 -->
<form>
    {{ form.username|add_class:"form-control" }}
    {{ form.password|add_class:"form-control" }}
</form>

<p>{{ text|cut:" " }}</p>
\`\`\`

### 3. 自定义简单标签（simple_tag）

\`\`\`python
@register.simple_tag
def get_latest_posts(count=5):
    """获取最新N篇文章"""
    from blog.models import Post
    return Post.objects.filter(is_published=True)[:count]

@register.simple_tag(takes_context=True)
def current_time(context, format_string='%Y-%m-%d %H:%M:%S'):
    """获取当前时间（takes_context=True接收上下文）"""
    import datetime
    return datetime.datetime.now().strftime(format_string)
\`\`\`

模板中使用：

\`\`\`html
{% load blog_tags %}

<!-- simple_tag用as保存结果到变量 -->
{% get_latest_posts 5 as latest_posts %}
<ul>
{% for post in latest_posts %}
    <li><a href="{% url 'blog:post_detail' post.id %}">{{ post.title }}</a></li>
{% endfor %}
</ul>

<p>当前时间：{% current_time "%Y年%m月%d日" %}</p>
\`\`\`

### 4. 包含标签（inclusion_tag）渲染模板片段

\`\`\`python
@register.inclusion_tag('blog/_latest_posts.html')
def show_latest_posts(count=5):
    from blog.models import Post
    posts = Post.objects.filter(is_published=True)[:count]
    return {'latest_posts': posts}
\`\`\`

\`\`\`html
<!-- templates/blog/_latest_posts.html -->
<div class="latest-posts">
    <h4>最新文章</h4>
    <ul>
    {% for post in latest_posts %}
        <li><a href="{{ post.get_absolute_url }}">{{ post.title }}</a></li>
    {% endfor %}
    </ul>
</div>
\`\`\`

模板中直接使用标签名：

\`\`\`html
{% show_latest_posts 10 %}
\`\`\`

## 最佳实践

1. **模板中不要写复杂逻辑**：业务逻辑在视图/模型中处理，模板只做展示
2. **善用模板继承**：base.html定义基础骨架，子模板重写block
3. **公共组件用include**：分页、卡片、侧边栏等复用片段拆成独立模板
4. **模板命名用App前缀**：blog/post_list.html而不是post_list.html，避免冲突
5. **不轻易用safe过滤器**：只有确定内容可信时才用|safe，防止XSS
6. **自定义标签/过滤器放在对应App的templatetags**：按功能组织
7. **不要在模板中调用会触发查询的方法**：避免在模板中触发N+1查询，视图中select_related/prefetch_related预加载
8. **context_processors添加全局变量**：站点名称、分类列表等全局上下文用context_processor

\`\`\`python
# 自定义context_processor：所有模板都能拿到categories
# blog/context_processors.py
def categories(request):
    from .models import Category
    return {'all_categories': Category.objects.all()}

# settings.py context_processors中添加
TEMPLATES = [{
    'OPTIONS': {
        'context_processors': [
            # ...
            'blog.context_processors.categories',
        ],
    },
}]
\`\`\`

## 常见坑点

1. **模板中不能做算术运算**：{{ a + b }}不行，需要add过滤器或视图中计算好
2. **变量不存在不报错**：输出空字符串，调试困难，开发时注意检查变量名
3. **for循环中不能用break/continue**：Django模板不支持，需要视图层面预处理数据
4. **忘记{% load static %}/{% load blog_tags %}**：自定义标签/静态文件必须先load
5. **extends必须是模板第一行**：extends标签前面不能有任何内容（包括空格）
6. **include的模板找不到**：注意App是否在INSTALLED_APPS，模板路径是否正确
7. **DateTimeField时区显示问题**：USE_TZ=True时显示UTC时间，需要激活时区或用timezone模板标签
8. **静态文件开发环境能访问生产404**：生产需要运行collectstatic收集静态文件，Nginx配置正确
`
  },
  {
    id: "pyb-9-6",
    group: "Django核心",
    icon: "🎸",
    title: "Django模型层 - Model定义、字段类型(CharField/IntegerField/ForeignKey/ManyToManyField等)、Meta类选项、__str__方法",
    content: `

# Django模型层（Model）

Model是Django的数据层，定义数据结构，通过ORM与数据库交互，负责创建表、CRUD操作、关系映射。

## 一、模型定义基础

每个模型类继承\`models.Model\`，类属性对应数据库字段：

\`\`\`python
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='分类名称')
    slug = models.SlugField(unique=True, verbose_name='URL别名')
    description = models.TextField(blank=True, verbose_name='描述')
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        db_table = 'blog_category'
        verbose_name = '分类'
        verbose_name_plural = verbose_name
        ordering = ['-create_time']
    
    def __str__(self):
        return self.name

class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', '草稿'),
        ('published', '已发布'),
        ('archived', '已归档'),
    )
    
    title = models.CharField(max_length=200, verbose_name='标题')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL别名')
    content = models.TextField(verbose_name='内容')
    excerpt = models.CharField(max_length=500, blank=True, verbose_name='摘要')
    
    # 外键：多对一
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name='作者'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts',
        verbose_name='分类'
    )
    
    # 多对多
    tags = models.ManyToManyField('Tag', blank=True, related_name='posts', verbose_name='标签')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='状态'
    )
    
    view_count = models.IntegerField(default=0, verbose_name='浏览量')
    is_published = models.BooleanField(default=False, verbose_name='是否发布')
    
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    update_time = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    publish_time = models.DateTimeField(null=True, blank=True, verbose_name='发布时间')
    
    class Meta:
        db_table = 'blog_post'
        verbose_name = '文章'
        verbose_name_plural = verbose_name
        ordering = ['-publish_time', '-create_time']
        indexes = [
            models.Index(fields=['-publish_time']),
            models.Index(fields=['status', 'is_published']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_published and not self.publish_time:
            self.publish_time = datetime.now()
        if not self.excerpt:
            self.excerpt = self.content[:200]
        super().save(*args, **kwargs)
\`\`\`

## 二、常用字段类型

### 基础字段类型

| 字段类型 | 对应数据库类型 | 说明 | 常用参数 |
|---------|-------------|------|---------|
| **CharField** | VARCHAR | 字符串 | max_length（必填）, null, blank, default, choices, unique |
| **TextField** | TEXT | 长文本 | blank, null, default |
| **IntegerField** | INT | 整数 | null, blank, default |
| **BigIntegerField** | BIGINT | 大整数 | 同上 |
| **SmallIntegerField** | SMALLINT | 小整数 | 同上 |
| **PositiveIntegerField** | INT UNSIGNED | 正整数（含0） | 同上 |
| **FloatField** | FLOAT/REAL | 浮点数 | 同上 |
| **DecimalField** | DECIMAL | 精确小数（金额用！） | max_digits, decimal_places |
| **BooleanField** | BOOLEAN/TINYINT | 布尔值 | default |
| **NullBooleanField** | - | 允许NULL的布尔（Django 3.1+用BooleanField(null=True)） |

### 字符串与文本

\`\`\`python
name = models.CharField(max_length=100)                    # 短文本
email = models.EmailField()                                # 邮箱（带验证）
url = models.URLField()                                    # URL
slug = models.SlugField(max_length=100, unique=True)       # URL别名（字母/数字/-/_）
uuid = models.UUIDField(default=uuid.uuid4, unique=True)   # UUID
content = models.TextField()                               # 长文本（无长度限制）
description = models.TextField(blank=True)                 # 可以为空的文本
\`\`\`

### 数值字段

\`\`\`python
age = models.IntegerField(default=0)
price = models.DecimalField(max_digits=10, decimal_places=2)  # 金额：最多10位，2位小数
discount = models.FloatField(default=0.0)                     # 浮点数（不要存金额！）
count = models.PositiveIntegerField(default=0)                # 正整数
\`\`\`

⚠️ **金额必须用DecimalField，不要用FloatField**，浮点数有精度问题！

### 日期时间字段

| 字段类型 | 说明 |
|---------|------|
| DateField | 日期（datetime.date） |
| TimeField | 时间（datetime.time） |
| DateTimeField | 日期时间（datetime.datetime） |
| DurationField | 时间间隔（timedelta） |

\`\`\`python
from datetime import datetime

create_time = models.DateTimeField(auto_now_add=True)  # 创建时自动设置（不可手动修改）
update_time = models.DateTimeField(auto_now=True)      # 每次save时自动更新
birthday = models.DateField(null=True, blank=True)
start_time = models.TimeField(default=datetime.now().time)
expire_time = models.DateTimeField(null=True, blank=True)
\`\`\`

### 二进制与文件字段

| 字段类型 | 说明 |
|---------|------|
| BinaryField | 二进制数据（存bytes） |
| FileField | 文件上传字段 |
| ImageField | 图片上传（需要Pillow库） |
| FilePathField | 文件路径 |

\`\`\`python
avatar = models.ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True)
resume = models.FileField(upload_to='resumes/', blank=True)
\`\`\`

### 关系字段

| 字段类型 | 关系 | 说明 |
|---------|-----|------|
| **ForeignKey** | 多对一 | 外键，关联到另一个模型 |
| **OneToOneField** | 一对一 | 类似ForeignKey+unique=True |
| **ManyToManyField** | 多对多 | 自动创建中间表 |

\`\`\`python
# ForeignKey参数详解
author = models.ForeignKey(
    User,                              # 关联的模型
    on_delete=models.CASCADE,          # 主表删除时的行为（必填！）
    related_name='posts',              # 反向关系名称（User.posts访问）
    related_query_name='post',         # 反向查询名
    null=True,                         # 数据库允许NULL
    blank=True,                        # Admin/表单允许为空
    default=None,                      # 默认值
    verbose_name='作者'
)

# on_delete选项：
# models.CASCADE：级联删除（删除用户也删除其文章）
# models.PROTECT：保护，抛出ProtectedError不让删除
# models.SET_NULL：设为NULL（需要null=True）
# models.SET_DEFAULT：设为默认值（需要default）
# models.SET()：设为指定值/函数返回值
# models.DO_NOTHING：什么都不做（数据库层面处理）

# ManyToManyField
tags = models.ManyToManyField('Tag', blank=True, related_name='posts')
# through参数指定自定义中间表
# tags = models.ManyToManyField('Tag', through='PostTag', through_fields=('post', 'tag'))

# OneToOneField
profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='user')
\`\`\`

### 其他常用字段

\`\`\`python
# IP地址
ip = models.GenericIPAddressField(protocol='both', unpack_ipv4=False, null=True)
# protocol: 'both'/'IPv4'/'IPv6'

# JSON（Django 3.1+支持，数据库用JSON类型）
extra = models.JSONField(default=dict, blank=True)
# 可以直接存dict/list等JSON可序列化数据
\`\`\`

## 三、字段常用参数

所有字段都支持的通用参数：

| 参数 | 说明 |
|-----|------|
| **null** | 数据库层面是否允许NULL（默认False） |
| **blank** | 表单验证时是否允许为空（默认False） |
| **default** | 默认值（可以是值或可调用对象） |
| **unique** | 是否唯一（默认False） |
| **db_index** | 是否创建索引（默认False） |
| **primary_key** | 是否为主键（默认False，自动创建id字段） |
| **choices** | 可选值列表（枚举下拉框） |
| **verbose_name** | 人类可读名称（Admin/表单显示） |
| **help_text** | 帮助文本（Admin/表单显示） |
| **db_column** | 数据库列名（默认字段名） |
| **editable** | 是否可编辑（Admin/表单，默认True） |
| **validators** | 自定义验证器列表 |

### null vs blank区别（重要！）

- **null**是数据库层面的：\`null=True\`表示数据库列允许NULL
- **blank**是表单验证层面的：\`blank=True\`表示表单提交时可以不填

\`\`\`python
# 字符串字段：不要同时用null=True，空字符串''即可
title = models.CharField(max_length=200)  # 默认NOT NULL，空就是''
# ✅ 推荐
description = models.TextField(blank=True)  # 允许表单为空，数据库存''
# ❌ 不推荐
description = models.TextField(null=True, blank=True)  # 会有两种空值：NULL和''

# 非字符串字段（日期、数字、外键）：允许为空时需要null=True
birthday = models.DateField(null=True, blank=True)
category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
\`\`\`

### choices选项

\`\`\`python
class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', '草稿'),       # (存储值, 显示值)
        ('published', '已发布'),
        ('archived', '已归档'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Django 3.0+推荐用TextChoices/IntegerChoices枚举类
    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        PUBLISHED = 'published', '已发布'
        ARCHIVED = 'archived', '已归档'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

# 获取显示值：post.get_status_display()
\`\`\`

## 四、Meta内部类

Meta类定义模型的元数据（表名、排序、索引、权限等）：

\`\`\`python
from django.db import models

class Post(models.Model):
    # ... 字段定义 ...
    
    class Meta:
        # 数据库表名（默认app名_model名，如blog_post）
        db_table = 'blog_post'
        
        # 可读名称
        verbose_name = '文章'
        verbose_name_plural = '文章管理'  # 复数名称（默认verbose_name + 's'）
        
        # 默认排序：字段名前缀-为降序
        ordering = ['-publish_time', 'id']
        
        # 联合唯一约束
        unique_together = [['author', 'slug']]  # Django 5.1+推荐用constraints
        
        # 联合索引
        index_together = [['status', 'is_published']]  # Django 5.1+推荐用indexes
        
        # 索引（Django 1.11+推荐写法）
        indexes = [
            models.Index(fields=['-publish_time']),
            models.Index(fields=['status', 'is_published'], name='status_pub_idx'),
        ]
        
        # 约束（Django 2.2+）
        constraints = [
            models.UniqueConstraint(fields=['author', 'slug'], name='unique_author_slug'),
            models.CheckConstraint(check=models.Q(age__gte=0), name='age_non_negative'),
        ]
        
        # 权限
        permissions = [
            ('can_publish_post', '可以发布文章'),
            ('can_edit_all_post', '可以编辑所有文章'),
        ]
        
        # 抽象基类（不会创建表，作为父类继承用）
        # abstract = True
        
        # 代理模型
        # proxy = True
        
        # 指定数据库
        # app_label = 'blog'
\`\`\`

## 五、__str__方法与其他常用方法

### __str__方法

\`\`\`python
class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name  # Admin后台、print(obj)、调试时显示这个值

class Post(models.Model):
    title = models.CharField(max_length=200)
    
    def __str__(self):
        return self.title
\`\`\`

**必须定义__str__**，否则Admin后台显示"Post object (1)"这种不可读内容。

### get_absolute_url

定义对象的标准URL，用于Admin站点"在站点查看"按钮：

\`\`\`python
from django.urls import reverse

class Post(models.Model):
    # ...
    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={'pk': self.pk})
\`\`\`

### save方法重写

可以重写save方法添加自定义逻辑：

\`\`\`python
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True)
    
    def save(self, *args, **kwargs):
        # 保存前自动生成摘要
        if not self.excerpt and self.content:
            self.excerpt = self.content[:200]
        
        # 自动设置slug
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        
        super().save(*args, **kwargs)  # 调用父类save，必须！
\`\`\`

## 六、模型之间的关系

### 1. 多对一（ForeignKey）

\`\`\`python
class Author(models.Model):
    name = models.CharField(max_length=100)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')

# 访问：正向（从多到一）
book = Book.objects.get(id=1)
print(book.author.name)  # 访问作者

# 访问：反向（从一到多），通过related_name
author = Author.objects.get(id=1)
books = author.books.all()  # 这个作者的所有书
# 没有related_name默认是 book_set
# books = author.book_set.all()
\`\`\`

### 2. 多对多（ManyToManyField）

\`\`\`python
class Student(models.Model):
    name = models.CharField(max_length=50)

class Course(models.Model):
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(Student, related_name='courses')

# 添加关联
student = Student.objects.get(id=1)
course = Course.objects.get(id=1)
course.students.add(student)  # 选课
course.students.remove(student)  # 退课
course.students.clear()  # 清空所有学生

# 查询
course.students.all()  # 选这门课的所有学生
student.courses.all()  # 这个学生选的所有课
student.courses.add(course1, course2)  # 同时选多门课
\`\`\`

### 3. 一对一（OneToOneField）

\`\`\`python
class User(models.Model):
    username = models.CharField(max_length=50, unique=True)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(blank=True)
    bio = models.TextField(blank=True)

# 访问
user = User.objects.get(id=1)
print(user.profile.bio)  # 用户资料（OneToOne直接返回对象，不是QuerySet）
\`\`\`

## 最佳实践

1. **模型拆分不要太粗也不要太细**：一个App对应一组相关模型
2. **每个模型都定义__str__**：方便调试和Admin显示
3. **每个模型加verbose_name**：Admin后台显示中文名称
4. **字符串字段不要null=True**：用blank=True，空字符串表示空
5. **金额用DecimalField**：FloatField有精度问题
6. **DateTimeField设置auto_now_add/auto_now**：自动维护创建/更新时间
7. **ForeignKey必须设置on_delete和related_name**：明确级联行为和反向访问名
8. **相关字段加db_index=True**：外键、查询频繁的字段建索引
9. **重写save时记得调用super().save()**：否则不会保存到数据库
10. **不要在模型方法中写复杂业务逻辑**：复杂业务放service层

## 常见坑点

1. **on_delete忘记写**：Django 2.0+ ForeignKey必须指定on_delete
2. **null=True给CharField/TextField**：导致有两种空值（NULL和''），查询困难
3. **auto_now/auto_now_add字段不能手动修改**：这些字段在save时自动覆盖
4. **related_name冲突**：不同模型ForeignKey到同一个模型时related_name不能重名
5. **ManyToManyField不能加null=True**：多对多是中间表，不存在null的概念
6. **save()方法忘记*args, **kwargs参数**：重写save时参数必须和父类一致
7. **循环导入问题**：模型互相引用时用字符串形式（如'Category'而不是import后引用）
8. **DateTimeField时区问题**：USE_TZ=True时存UTC时间，注意转换
9. **FileField/ImageField只是存路径**：文件实际存MEDIA_ROOT目录，不是存数据库BLOB
10. **模型变更需要makemigrations/migrate**：字段增删改后必须生成迁移并执行
`
  },
  {
    id: "pyb-9-7",
    group: "Django核心",
    icon: "🎸",
    title: "Django Admin后台 - admin注册与定制、list_display/list_filter/search_fields、Inline内联、自定义Admin页面",
    content: `

# Django Admin后台

Django Admin是Django杀手级功能，自动生成专业的后台管理界面，几乎不需要写代码就能实现数据增删改查。

## 一、Admin基础配置

### 创建超级管理员

\`\`\`bash
python manage.py createsuperuser
# 按提示输入用户名、邮箱、密码
\`\`\`

启动开发服务器，访问 http://127.0.0.1:8000/admin/ 登录。

### 注册模型

在App的admin.py中注册模型：

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Category, Tag, Post

# 最简单的注册
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(Post)
\`\`\`

这样模型就会出现在Admin后台，但显示比较简陋，需要定制。

## 二、ModelAdmin定制

通过ModelAdmin类定制后台显示效果：

\`\`\`python
from django.contrib import admin
from .models import Post, Category, Tag

@admin.register(Post)  # 方式1：装饰器注册（推荐）
class PostAdmin(admin.ModelAdmin):
    # 列表页显示字段
    list_display = ['id', 'title', 'author', 'category', 'status', 'view_count', 'create_time']
    
    # 列表页可点击链接到详情页的字段
    list_display_links = ['id', 'title']
    
    # 右侧过滤器
    list_filter = ['status', 'category', 'create_time', 'author']
    
    # 搜索框搜索字段
    search_fields = ['title', 'content', 'excerpt']
    
    # 可编辑字段（列表页直接编辑，不用进详情页）
    list_editable = ['status']
    
    # 每页显示条数
    list_per_page = 20
    
    # 默认排序
    ordering = ['-create_time']
    
    # 详情页字段分组显示
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'slug', 'author', 'category', 'tags')
        }),
        ('内容', {
            'fields': ('excerpt', 'content'),
            'classes': ('collapse',)  # 可折叠
        }),
        ('发布设置', {
            'fields': ('status', 'is_published', 'publish_time'),
        }),
        ('统计', {
            'fields': ('view_count',),
            'classes': ('collapse',),
        }),
    )
    
    # 多对多字段用左右穿梭框（默认是多选下拉）
    filter_horizontal = ['tags']
    # filter_vertical = ['tags']  # 竖向
    
    # 外键字段搜索（数据量大时不要用下拉选择，用弹窗搜索）
    raw_id_fields = ['author']
    
    # 自动填充slug字段（根据title自动生成）
    prepopulated_fields = {'slug': ('title',)}
    
    # 日期层级导航
    date_hierarchy = 'create_time'
    
    # 只读字段
    readonly_fields = ['view_count', 'create_time', 'update_time']

# 方式2：注册时指定ModelAdmin
# admin.site.register(Post, PostAdmin)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'create_time']
    list_display_links = ['id', 'name']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
\`\`\`

### list_display详解

list_display控制列表页显示哪些字段，可以是：
1. 模型字段名
2. 模型方法名
3. ModelAdmin方法名
4. 可调用对象

\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'colored_status', 'view_count', 'create_time']
    
    # 在ModelAdmin中定义方法显示自定义内容
    def colored_status(self, obj):
        color_map = {
            'draft': 'gray',
            'published': 'green',
            'archived': 'red',
        }
        color = color_map.get(obj.status, 'black')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_status_display()
        )
    colored_status.short_description = '状态'  # 列标题
    colored_status.admin_order_field = 'status'  # 允许按此字段排序
\`\`\`

## 三、Inline内联（关联模型编辑）

在编辑主模型时，可以同时编辑关联的子模型，比如编辑文章时直接编辑文章的评论。

### TabularInline（表格形式）

\`\`\`python
from django.contrib import admin
from .models import Post, Comment

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1  # 默认显示1个空行
    fields = ['author', 'content', 'create_time']
    readonly_fields = ['create_time']
    ordering = ['-create_time']
    # max_num = 20  # 最多显示多少条

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status']
    inlines = [CommentInline]  # 👈 内联评论
\`\`\`

### StackedInline（块状形式，每组字段堆叠）

\`\`\`python
class CommentInline(admin.StackedInline):
    model = Comment
    extra = 0
    fields = ['author', 'content']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    inlines = [CommentInline]
\`\`\`

## 四、Admin自定义操作（Actions）

列表页下拉框可以添加自定义批量操作：

\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'create_time']
    actions = ['make_published', 'make_draft', 'export_as_csv']
    
    def make_published(self, request, queryset):
        """批量发布选中的文章"""
        updated = queryset.update(status='published', is_published=True)
        self.message_user(request, f'成功发布{updated}篇文章')
    make_published.short_description = '发布选中文章'
    
    def make_draft(self, request, queryset):
        """批量转为草稿"""
        updated = queryset.update(status='draft', is_published=False)
        self.message_user(request, f'成功将{updated}篇文章转为草稿')
    make_draft.short_description = '转为草稿'
    
    def export_as_csv(self, request, queryset):
        """导出CSV"""
        import csv
        from django.http import HttpResponse
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="posts.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', '标题', '作者', '状态', '创建时间'])
        for post in queryset:
            writer.writerow([post.id, post.title, post.author.username, post.status, post.create_time])
        return response
    export_as_csv.short_description = '导出CSV'
\`\`\`

## 五、Admin权限控制

### 字段级权限

\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status']
    
    def get_readonly_fields(self, request, obj=None):
        """不同用户看到不同只读字段"""
        readonly_fields = list(super().get_readonly_fields(request, obj))
        # 普通编辑不能改作者，只有超级管理员能改
        if not request.user.is_superuser:
            readonly_fields.append('author')
        return readonly_fields
    
    def get_queryset(self, request):
        """普通编辑只能看到自己的文章"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)
    
    def has_change_permission(self, request, obj=None):
        """只有作者本人或超管能编辑"""
        if obj is None:
            return True
        return obj.author == request.user or request.user.is_superuser
    
    def save_model(self, request, obj, form, change):
        """保存时自动设置作者"""
        if not change:  # 新建时
            obj.author = request.user
        super().save_model(request, obj, form, change)
\`\`\`

### 站点级Admin配置

\`\`\`python
# admin.py 或 admin/__init__.py
admin.site.site_header = '我的博客后台管理'  # 顶部标题
admin.site.site_title = '博客管理'           # 浏览器标题
admin.site.index_title = '欢迎来到管理后台'  # 首页标题

# 修改Admin站点URL（默认是/admin/）
# urls.py
from django.contrib import admin
from django.urls import path
urlpatterns = [
    path('mysecretadmin/', admin.site.urls),  # 改个不容易猜到的路径
]
\`\`\`

## 六、覆盖Admin模板（高级定制）

如果Admin默认样式不能满足需求，可以覆盖模板：

1. 在项目templates目录创建admin目录
2. 复制Django admin模板到对应位置修改
3. 或 extends admin/base_site.html等

\`\`\`html
<!-- templates/admin/base_site.html -->
{% extends "admin/base.html" %}

{% block title %}{% if subtitle %}{{ subtitle }} | {% endif %}{{ title }} | 我的博客后台{% endblock %}

{% block branding %}
<h1 id="site-name"><a href="{% url 'admin:index' %}">🎸 我的博客管理系统</a></h1>
{% endblock %}

{% block nav-global %}{% endblock %}
\`\`\`

### ModelAdmin Media自定义CSS/JS

给特定Admin页面添加CSS和JS：

\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    class Media:
        css = {
            'all': ('css/admin_custom.css',)
        }
        js = ('js/admin_custom.js',)
\`\`\`

## 七、自定义Admin视图（添加独立页面）

可以在Admin中添加自定义页面：

\`\`\`python
from django.urls import path
from django.template.response import TemplateResponse
from django.contrib import admin

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status']
    
    def get_urls(self):
        """添加自定义URL"""
        urls = super().get_urls()
        my_urls = [
            path('statistics/', self.admin_site.admin_view(self.statistics_view), name='post-statistics'),
        ]
        return my_urls + urls
    
    def statistics_view(self, request):
        """自定义统计页面"""
        from django.db.models import Count, Sum
        context = {
            'title': '文章统计',
            'total_posts': Post.objects.count(),
            'published_count': Post.objects.filter(status='published').count(),
            'draft_count': Post.objects.filter(status='draft').count(),
            'total_views': Post.objects.aggregate(total=Sum('view_count'))['total'] or 0,
            **self.admin_site.each_context(request),  # Admin公共上下文
        }
        return TemplateResponse(request, 'admin/post_statistics.html', context)
\`\`\`

## 最佳实践

1. **list_display选择合适字段**：不要显示太多字段，关键字段即可
2. **大数据模型用raw_id_fields**：外键字段超过100条数据不要用下拉选择，会加载所有选项
3. **filter_horizontal/fiter_vertical用在多对多**：比默认多选框好用
4. **search_fields不要在大表太多字段搜索**：LIKE '%keyword%'可能慢，考虑搜索引擎
5. **合理使用list_editable**：不要让太多字段可编辑，避免误操作
6. **敏感操作加权限控制**：删除、发布等操作限制权限
7. **actions批量操作给出反馈**：操作后用message_user提示结果
8. **生产环境修改Admin路径**：不要用默认/admin/路径，增加安全性
9. **不要在Admin做复杂业务逻辑**：Admin是管理工具，复杂业务走前台API
10. **readonly_fields保护不可编辑字段**：创建时间、统计字段设为只读

## 常见坑点

1. **list_display不能放ManyToManyField**：多对多字段不能直接在list_display显示，需要自定义方法
2. **search_fields用了ForeignKey字段导致JOIN慢**：跨表搜索注意性能，用外键__字段名如author__username
3. **list_per_page太大导致内存问题**：默认100，不要设太大
4. **inline extra太多导致页面慢**：extra=0或1即可
5. **actions如果返回None刷新页面，返回HttpResponse会下载/跳转**：导出CSV需要返回response
6. **prepopulated_fields不支持DateTimeField等非字符串字段**：只针对SlugField等字符字段
7. **自定义Admin页面忘记用admin_view装饰**：自定义视图需要self.admin_site.admin_view包装做权限校验
8. **覆盖模板路径不对**：模板要放在templates/admin/下，且APP要在INSTALLED_APPS中顺序正确
`
  },
  {
    id: "pyb-9-8",
    group: "Django核心",
    icon: "🎸",
    title: "Django表单系统 - Form与ModelForm、表单验证(clean_字段名/clean方法)、表单渲染、CSRF保护、文件上传处理",
    content: `

# Django表单系统

Django表单系统提供表单生成、数据验证、错误提示等功能，既可以生成HTML表单，也能处理提交数据。

## 一、Form基础

### 定义Form类

\`\`\`python
# forms.py
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(
        label='姓名',
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '请输入姓名'})
    )
    email = forms.EmailField(
        label='邮箱',
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': '请输入邮箱'})
    )
    phone = forms.CharField(
        label='电话',
        max_length=11,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '选填'})
    )
    subject = forms.ChoiceField(
        label='咨询类型',
        choices=(
            ('product', '产品咨询'),
            ('order', '订单问题'),
            ('other', '其他'),
        ),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    message = forms.CharField(
        label='留言内容',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        min_length=10,
        error_messages={
            'required': '请填写留言内容',
            'min_length': '留言至少10个字',
        }
    )
\`\`\`

### 视图中使用Form

\`\`\`python
from django.shortcuts import render, redirect
from .forms import ContactForm
from django.contrib import messages

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # 获取验证后的数据
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']
            
            # 发送邮件等业务逻辑
            from django.core.mail import send_mail
            send_mail(
                f'来自{name}的咨询',
                message,
                email,
                ['admin@example.com'],
            )
            
            messages.success(request, '提交成功，我们会尽快联系您！')
            return redirect('contact')
    else:
        form = ContactForm()  # 空表单（GET请求）
        # 带初始数据
        # form = ContactForm(initial={'name': request.user.username if request.user.is_authenticated else ''})
    
    return render(request, 'contact.html', {'form': form})
\`\`\`

### 模板渲染表单

\`\`\`html
<!-- templates/contact.html -->
<form method="post" novalidate>
    {% csrf_token %}
    
    <!-- 显示表单全局错误 -->
    {% if form.non_field_errors %}
        <div class="alert alert-danger">
            {% for error in form.non_field_errors %}
                <p>{{ error }}</p>
            {% endfor %}
        </div>
    {% endif %}
    
    <!-- 方式1：as_p/as_table/as_ul 快速渲染 -->
    {{ form.as_p }}
    
    <!-- 方式2：手动逐字段渲染（推荐，控制样式） -->
    {% for field in form %}
    <div class="form-group">
        <label>{{ field.label }}</label>
        {{ field }}
        {% if field.errors %}
            <div class="text-danger">
                {% for error in field.errors %}
                    <small>{{ error }}</small>
                {% endfor %}
            </div>
        {% endif %}
        {% if field.help_text %}
            <small class="form-text text-muted">{{ field.help_text }}</small>
        {% endif %}
    </div>
    {% endfor %}
    
    <button type="submit" class="btn btn-primary">提交</button>
</form>
\`\`\`

## 二、常用字段类型

| Form字段 | 说明 | 默认widget |
|---------|------|-----------|
| CharField | 字符串 | TextInput |
| EmailField | 邮箱（带格式验证） | EmailInput |
| IntegerField | 整数 | NumberInput |
| FloatField | 浮点数 | NumberInput |
| DecimalField | 精确小数 | NumberInput |
| BooleanField | 布尔/复选框 | CheckboxInput |
| DateField | 日期 | DateInput |
| DateTimeField | 日期时间 | DateTimeInput |
| ChoiceField | 单选下拉 | Select |
| TypedChoiceField | 带类型转换的选择 | Select |
| MultipleChoiceField | 多选 | SelectMultiple |
| FileField | 文件上传 | ClearableFileInput |
| ImageField | 图片上传 | ClearableFileInput |
| URLField | URL | URLInput |
| RegexField | 正则验证 | TextInput |
| UUIDField | UUID | TextInput |
| IPAddressField | IP地址 | TextInput |
| GenericIPAddressField | IPv4/IPv6 | TextInput |

### 常用字段参数

| 参数 | 说明 |
|-----|------|
| required=True | 是否必填（默认True） |
| label | 字段标签 |
| initial | 初始值 |
| widget | 指定渲染控件 |
| help_text | 帮助文本 |
| error_messages | 自定义错误消息 |
| validators | 自定义验证器列表 |
| disabled | 是否禁用 |
| localize | 是否本地化 |

## 三、Widget控件

Widget控制HTML渲染和数据提取：

\`\`\`python
from django import forms

class DemoForm(forms.Form):
    # 文本框
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '用户名',
            'maxlength': '20',
        })
    )
    
    # 密码框
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    
    # 隐藏域
    user_id = forms.IntegerField(
        widget=forms.HiddenInput(),
        initial=1
    )
    
    # 多行文本
    bio = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 50, 'class': 'form-control'})
    )
    
    # 复选框
    agree = forms.BooleanField(
        label='我同意用户协议',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    
    # 单选按钮
    gender = forms.ChoiceField(
        choices=(('M', '男'), ('F', '女')),
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    
    # 复选框多选
    hobbies = forms.MultipleChoiceField(
        choices=(('read', '阅读'), ('music', '音乐'), ('sports', '运动')),
        widget=forms.CheckboxSelectMultiple()
    )
    
    # 下拉选择
    city = forms.ChoiceField(
        choices=(('bj', '北京'), ('sh', '上海'), ('gz', '广州')),
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    # 文件上传
    avatar = forms.ImageField(
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )
    
    # 日期时间选择
    birthday = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
\`\`\`

## 四、表单验证（核心）

Django表单验证分多层：字段内置验证 → validators → clean_字段名 → clean

### 1. 内置验证

字段类型自动验证：EmailField验证邮箱格式，IntegerField验证整数等。

### 2. validators自定义验证器

\`\`\`python
from django import forms
from django.core.exceptions import ValidationError
import re

def validate_phone(value):
    """验证手机号"""
    if not re.match(r'^1[3-9]\\d{9}$', value):
        raise ValidationError('请输入正确的11位手机号')

class RegisterForm(forms.Form):
    phone = forms.CharField(
        validators=[validate_phone],
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

# Django内置validators
from django.core.validators import (
    MinLengthValidator, MaxLengthValidator,
    MinValueValidator, MaxValueValidator,
    EmailValidator, URLValidator, RegexValidator,
    FileExtensionValidator,
)
\`\`\`

### 3. clean_<fieldname> 单字段验证

\`\`\`python
class RegisterForm(forms.Form):
    username = forms.CharField(min_length=3, max_length=20)
    phone = forms.CharField(max_length=11)
    password = forms.CharField(min_length=6)
    password2 = forms.CharField(min_length=6)
    
    def clean_username(self):
        """验证用户名是否已存在"""
        username = self.cleaned_data['username']
        from django.contrib.auth.models import User
        if User.objects.filter(username=username).exists():
            raise ValidationError('用户名已被注册')
        return username  # 必须返回清理后的值
    
    def clean_phone(self):
        """验证手机号"""
        phone = self.cleaned_data['phone']
        if not re.match(r'^1[3-9]\\d{9}$', phone):
            raise ValidationError('手机号格式不正确')
        return phone
\`\`\`

### 4. clean() 多字段联合验证

\`\`\`python
class RegisterForm(forms.Form):
    password = forms.CharField(min_length=6)
    password2 = forms.CharField(min_length=6)
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')
        
        if password and password2 and password != password2:
            self.add_error('password2', '两次密码输入不一致')
            # 或 raise ValidationError('两次密码不一致')
        
        return cleaned_data
\`\`\`

验证顺序：
1. 字段内置验证（CharField的max_length等）
2. 字段validators验证
3. clean_<field>()方法
4. clean()方法（联合验证）

## 五、ModelForm（模型表单）最常用

ModelForm直接根据Model自动生成表单字段，CRUD场景极其方便：

\`\`\`python
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post                 # 关联的模型
        fields = ['title', 'slug', 'category', 'tags', 'excerpt', 'content', 'status']  # 需要的字段
        # fields = '__all__'  # 所有字段
        # exclude = ['author', 'view_count', 'create_time']  # 排除某些字段
        
        # 自定义widgets
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 15}),
            'excerpt': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'tags': forms.CheckboxSelectMultiple(),
            'status': forms.Select(attrs={'class': 'form-select'}),
        }
        
        # 自定义标签
        labels = {
            'title': '文章标题',
            'slug': 'URL别名',
            'content': '正文内容',
        }
        
        # 自定义错误消息
        error_messages = {
            'title': {
                'required': '请填写标题',
                'max_length': '标题不能超过200字',
            }
        }
    
    # 也可以重写字段
    content = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control markdown-editor', 'rows': 20}),
        label='正文',
        help_text='支持Markdown语法'
    )
    
    # 同样可以写clean验证
    def clean_slug(self):
        slug = self.cleaned_data['slug']
        # 检查slug唯一性（编辑时排除自己）
        qs = Post.objects.filter(slug=slug)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError('该URL别名已存在')
        return slug
\`\`\`

视图中使用ModelForm：

\`\`\`python
from django.shortcuts import render, redirect, get_object_or_404
from .forms import PostForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required
def post_create(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)  # FILES处理文件上传
        if form.is_valid():
            post = form.save(commit=False)  # commit=False先不保存到数据库
            post.author = request.user      # 设置外键作者
            post.save()                     # 保存
            form.save_m2m()                 # 多对多字段需要save_m2m()
            messages.success(request, '文章发布成功！')
            return redirect('blog:post_detail', pk=post.pk)
    else:
        form = PostForm()
    return render(request, 'post_form.html', {'form': form})

@login_required
def post_edit(request, pk):
    post = get_object_or_404(Post, pk=pk, author=request.user)
    if request.method == 'POST':
        form = PostForm(request.POST, instance=post)  # instance传入现有对象
        if form.is_valid():
            form.save()  # 更新现有对象
            messages.success(request, '文章更新成功！')
            return redirect('blog:post_detail', pk=post.pk)
    else:
        form = PostForm(instance=post)
    return render(request, 'post_form.html', {'form': form, 'post': post})
\`\`\`

## 六、文件上传处理

### 表单需要添加enctype="multipart/form-data"

\`\`\`html
<form method="post" enctype="multipart/form-data">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">上传</button>
</form>
\`\`\`

### 视图处理FILES

\`\`\`python
def upload_avatar(request):
    if request.method == 'POST':
        form = AvatarForm(request.POST, request.FILES)  # 必须传request.FILES
        if form.is_valid():
            avatar = form.cleaned_data['avatar']
            
            # 处理上传文件
            import os
            from django.conf import settings
            filename = f'{request.user.id}_{avatar.name}'
            save_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)
            
            # 方式1：逐块写（大文件推荐）
            with open(save_path, 'wb+') as f:
                for chunk in avatar.chunks():
                    f.write(chunk)
            
            # 保存到模型
            request.user.profile.avatar = f'avatars/{filename}'
            request.user.profile.save()
            return redirect('profile')
    else:
        form = AvatarForm()
    return render(request, 'upload.html', {'form': form})
\`\`\`

### settings配置文件上传

\`\`\`python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# 限制上传大小
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
# 内存文件上限：小于这个值存内存，大文件存临时文件
FILE_UPLOAD_TEMP_DIR = '/tmp/'
\`\`\`

开发环境media访问配置：

\`\`\`python
# urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
]

# 开发环境media文件服务（生产由Nginx处理）
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

## 七、CSRF保护

Django默认开启CSRF中间件，所有POST/PUT/DELETE请求必须带CSRF Token。

### 表单中使用

\`\`\`html
<form method="post">
    {% csrf_token %}  <!-- 自动生成隐藏input -->
    {{ form.as_p }}
    <button type="submit">提交</button>
</form>
\`\`\`

### AJAX请求设置CSRF

\`\`\`javascript
// 获取cookie中的csrftoken
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// jQuery/axios统一设置
const csrftoken = getCookie('csrftoken');

// jQuery
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// axios
axios.defaults.headers.common['X-CSRFToken'] = csrftoken;
\`\`\`

### 禁用CSRF（不推荐，仅限API用Token认证时）

\`\`\`python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # 该视图跳过CSRF检查
def api_webhook(request):
    pass
\`\`\`

## 最佳实践

1. **优先使用ModelForm**：CRUD场景ModelForm大大减少代码量
2. **永远不要信任用户输入**：后端验证是必须的，前端验证只是体验优化
3. **敏感操作加权限验证**：表单视图加login_required或自定义权限
4. **文件上传验证类型和大小**：用FileExtensionValidator限制扩展名
5. **form.save(commit=False)处理外键**：多对多字段记得save_m2m()
6. **错误提示友好**：自定义error_messages给用户清晰提示
7. **表单模板统一渲染风格**：封装form字段宏/partial保持风格一致
8. **上传文件注意大小和类型**：防止上传恶意文件
9. **GET请求用于展示表单，POST请求用于提交数据**：遵循HTTP方法语义
10. **提交成功后redirect（PRG模式）**：Post/Redirect/Get防止重复提交

\`\`\`python
# PRG模式（Post-Redirect-Get）
def post_create(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save()
            return redirect('post_detail', pk=post.pk)  # 提交成功后重定向
    else:
        form = PostForm()
    return render(request, 'form.html', {'form': form})
# 防止用户刷新页面重复提交表单
\`\`\`

## 常见坑点

1. **表单不校验/拿不到数据**：忘记request.POST或request.POST中name不对
2. **文件上传request.FILES为空**：表单没加enctype="multipart/form-data"，或视图没传request.FILES
3. **多对多字段commit=False后没调用save_m2m()**：m2m关系不会保存
4. **clean方法中字段可能不存在**：如果前面验证失败，cleaned_data中可能没有该字段，用get()
5. **initial值只在GET时生效**：POST绑定时initial无效
6. **disabled字段不会提交数据**：disabled的字段即使前端有值，POST也拿不到
7. **DateTimeField时区问题**：USE_TZ=True时注意时区转换
8. **CSRF验证失败**：AJAX请求没带X-CSRFToken头，或cookie没获取到
9. **表单errors是字典但不显示**：模板没有遍历field.errors或form.non_field_errors
10. **ModelFormexclude排除的字段不会被验证**：必填字段不能exclude，否则保存时报错
`
  }
]