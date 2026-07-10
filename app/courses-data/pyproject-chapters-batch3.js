// =============================================================
// Python 实战项目教程 - 第 3 批章节(Web 应用开发)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章:博客系统:架构与数据模型
  // ============================================================
  {
    id: "pyproject-blog-arch",
    group: "Web 应用开发",
    icon: "📝",
    title: "博客系统:架构与数据模型",
    content: `# 博客系统:架构与数据模型

## 一、为什么要做一个博客系统

写博客系统是后端入门最经典的练手项目,原因有三:

1. **需求清晰**:发文章、看文章、评论,谁都懂,不用纠结产品。
2. **覆盖全栈**:涉及数据库设计、模板渲染、表单处理、用户认证、分页、文件上传,该有的都有。
3. **可扩展**:从最小可用版本(MVP)起步,能逐步加标签、分类、富文本、搜索、API、缓存……练到哪里算哪里。

本章先把**架构和数据模型**想清楚,下一章再写完整代码。先设计后编码,是工程化的第一课。

## 二、博客系统功能分析

把需求拆成「实体(Entity)」和「关系(Relationship)」。

### 2.1 核心实体

| 实体 | 说明 | 关键属性 |
| --- | --- | --- |
| User(用户) | 作者/读者 | id, username, email, password_hash |
| Post(文章) | 博客正文 | id, title, body, created_at, author_id |
| Category(分类) | 一篇文章一个分类 | id, name |
| Tag(标签) | 一篇文章多个标签 | id, name |
| Comment(评论) | 读者对文章的评论 | id, body, post_id, user_id, created_at |

### 2.2 关系梳理

- **User → Post**:一对多(一个作者写多篇文章)。
- **Category → Post**:一对多(一个分类下多篇文章)。
- **Post ↔ Tag**:多对多(一篇文章多个标签,一个标签多篇文章),需要中间表 \`post_tags\`。
- **Post → Comment**:一对多(一篇文章多条评论)。
- **User → Comment**:一对多(一个用户多条评论)。

### 2.3 功能清单

| 模块 | 功能点 |
| --- | --- |
| 文章 | 列表/详情/发布/编辑/删除/分页 |
| 分类 | 增删改查、按分类筛选文章 |
| 标签 | 增删改查、按标签筛选文章 |
| 评论 | 发表评论、删除评论、楼层显示 |
| 用户 | 注册/登录/登出/个人主页 |
| 后台 | 管理员审核评论、用户管理 |

## 三、技术选型:Flask vs Django vs FastAPI

三个主流框架各有定位,选哪个看团队和场景。

| 维度 | Flask | Django | FastAPI |
| --- | --- | --- | --- |
| 定位 | 微框架,核心小 | 大而全, batteries included | 现代 API 框架,异步优先 |
| 学习曲线 | 低,上手快 | 中,要学 ORM/ Admin/ Form | 低-中,会装饰器即可 |
| ORM | 默认无,常配 SQLAlchemy | 内置 Django ORM | 默认无,常配 SQLAlchemy |
| 表单 | Flask-WTF | Django Forms | 无,用 Pydantic |
| 后台 | 无内置 | 内置 Admin(超强) | 无 |
| 异步 | 不支持(Werkzeug 同步) | 3.x 部分支持 | 原生 async/await |
| API 文档 | 手写/Swagger 插件 | DRF + drf-spectacular | 自动生成 OpenAPI |
| 适合场景 | 中小 Web、学习项目 | 内容站点、CMS、企业内部系统 | 纯 API、微服务、AI 服务 |

**博客选 Flask 的理由**:模板渲染方便、生态轻、代码量小、把每一步都讲清楚。Django 写博客更快,但很多自动化让你「看不见」原理;FastAPI 更适合写 API,博客需要模板渲染时不太顺手。

## 四、MVC / MTV 架构模式

### 4.1 MVC

经典三层分离:

- **Model(模型)**:数据 + 业务逻辑。
- **View(视图)**:界面展示。
- **Controller(控制器)**:接收请求、调用 Model、选 View。

请求流向:'Request → Controller → Model → Controller → View → Response'。

### 4.2 MTV(Django/Flask 的变体)

Python 圈子把 MVC 改了个名字:

- **Model**:同 MVC 的 Model。
- **Template(模板)**:对应 MVC 的 View,负责渲染 HTML。
- **View(视图函数)**:对应 MVC 的 Controller,处理请求逻辑。

本质和 MVC 一样,只是叫法不同,新人不要被名字绕晕。

### 4.3 博客项目的分层

\`\`\`text
浏览器请求 /post/1
      │
      ▼
┌────────────────┐
│  路由(URL Rule)│  ← Flask 用 @app.route 注册
└────────────────┘
      │
      ▼
┌────────────────┐
│  View(视图函数)│  ← 读数据库、处理表单
└────────────────┘
      │
      ▼
┌────────────────┐
│  Model(ORM)    │  ← SQLAlchemy 操作数据库
└────────────────┘
      │
      ▼
┌────────────────┐
│  Template(Jinja2)│ ← 渲染 HTML
└────────────────┘
      │
      ▼
   返回 HTML
\`\`\`

## 五、数据模型设计

把 2.1 的实体落成表结构。下面用表格列出字段,**加粗**的是主键/外键。

### 5.1 users 表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **id** | Integer | PK, 自增 | 主键 |
| username | String(80) | 唯一、非空 | 登录名 |
| email | String(120) | 唯一、非空 | 邮箱 |
| password_hash | String(255) | 非空 | 加密后的密码 |
| is_admin | Boolean | 默认 False | 是否管理员 |
| created_at | DateTime | 默认当前时间 | 注册时间 |

### 5.2 categories 表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **id** | Integer | PK, 自增 | 主键 |
| name | String(50) | 唯一、非空 | 分类名 |
| slug | String(50) | 唯一 | URL 友好名 |

### 5.3 posts 表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **id** | Integer | PK, 自增 | 主键 |
| title | String(200) | 非空 | 标题 |
| body | Text | 非空 | 正文 |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 可空 | 更新时间 |
| **author_id** | Integer | FK → users.id | 作者 |
| **category_id** | Integer | FK → categories.id | 分类 |

### 5.4 tags 表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **id** | Integer | PK, 自增 | 主键 |
| name | String(50) | 唯一、非空 | 标签名 |

### 5.5 post_tags 表(多对多中间表)

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **post_id** | Integer | FK → posts.id | 文章 |
| **tag_id** | Integer | FK → tags.id | 标签 |

复合主键 (post_id, tag_id)。

### 5.6 comments 表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| **id** | Integer | PK, 自增 | 主键 |
| body | Text | 非空 | 评论内容 |
| created_at | DateTime | 默认当前时间 | 评论时间 |
| **post_id** | Integer | FK → posts.id | 所属文章 |
| **user_id** | Integer | FK → users.id | 评论者 |

### 5.7 关系图(文字描述)

\`\`\`text
users ──┬──< posts >──< comments
        │        │
        │        ├──< post_tags >── tags
        │        │
        │        └──< categories
        │
        └──< comments(同一张表,user_id 关联)
\`\`\`

要点:
- 一对多用 \`ForeignKey\` + \`db.relationship\`。
- 多对多用 \`secondary\` 参数指定中间表。
- 反向引用用 \`backref\` 或 \`back_populates\`。

## 六、项目目录结构规范

\`\`\`text
blog_project/
├── app/
│   ├── __init__.py        # Flask 工厂函数 create_app
│   ├── config.py          # 配置类(开发/生产/测试)
│   ├── extensions.py      # db/login 等扩展实例化
│   ├── models.py          # 数据模型
│   ├── auth.py            # 认证蓝图(登录/注册)
│   ├── blog.py            # 博客蓝图(文章/评论)
│   ├── forms.py           # WTForms 表单类
│   ├── templates/
│   │   ├── base.html      # 基础模板
│   │   ├── index.html     # 首页
│   │   ├── post_detail.html
│   │   ├── edit_post.html
│   │   └── auth/
│   │       ├── login.html
│   │       └── register.html
│   └── static/
│       ├── css/style.css
│       └── js/main.js
├── migrations/            # 数据库迁移脚本
├── tests/
├── run.py                 # 入口
├── requirements.txt
└── .env                   # 环境变量(不提交)
\`\`\`

**工厂模式(Factory Pattern)**:用 \`create_app()\` 函数返回 app 实例,而不是模块级 \`app = Flask(__name__)\`。好处:测试时能创建多个配置不同的 app,扩展初始化和配置解耦。

## 七、模板引擎:Jinja2 基础

Jinja2 是 Flask 默认模板引擎,语法像 Django 模板但更强大。

### 7.1 核心语法

| 语法 | 作用 | 示例 |
| --- | --- | --- |
| \`{{ var }}\` | 输出变量 | \`{{ post.title }}\` |
| \`{% if %}\` ... \`{% endif %}\` | 条件 | \`{% if user.is_admin %}\` |
| \`{% for x in xs %}\` ... \`{% endfor %}\` | 循环 | \`{% for p in posts %}\` |
| \`{% extends "base.html" %}\` | 继承 | 复用基础布局 |
| \`{% block content %}\` ... \`{% endblock %}\` | 占位 | 子模板填充内容 |
| \`{{ x | filter }}\` | 过滤器 | \`{{ name | upper }}\` |
| \`{# 注释 #}\` | 注释 | 不输出到 HTML |

### 7.2 常见过滤器

- \`{{ name | default("匿名") }}\`:为空时给默认值。
- \`{{ body | truncate(100) }}\`:截断到 100 字符。
- \`{{ created_at | strftime("%Y-%m-%d") }}\`:格式化日期。
- \`{{ html | safe }}\`:标记为安全,不转义(慎用,防 XSS)。
- \`{{ price | round(2) }}\`:保留两位小数。

## 八、Demo:Flask 应用骨架

最小可运行的 Flask 应用,体现工厂模式:

\`\`\`python
# app/__init__.py
from flask import Flask  # 导入 Flask 类

def create_app(config_name="default"):
    """工厂函数:创建并配置一个 Flask 应用实例。
    参数:
        config_name: 配置名,对应 config.py 里的类
    返回:
        配置好的 app 实例
    """
    app = Flask(__name__)               # 创建应用实例
    app.config.from_object(f"app.config.{config_name.title()}Config")

    # 注册扩展(db、login 等)——这里先留空,后续章节填
    # from app.extensions import db, login
    # db.init_app(app)
    # login.init_app(app)

    # 注册蓝图:每个蓝图是一组相关路由
    from app.blog import blog_bp
    from app.auth import auth_bp
    app.register_blueprint(blog_bp)      # 博客主路由
    app.register_blueprint(auth_bp, url_prefix="/auth")  # 认证路由加前缀

    return app
\`\`\`

\`\`\`python
# run.py
from app import create_app  # 导入工厂函数

app = create_app("development")  # 用开发配置创建应用

if __name__ == "__main__":
    # debug=True 改代码自动重启,且出错显示详细堆栈(生产禁用)
    app.run(host="0.0.0.0", port=5000, debug=True)
\`\`\`

运行:\`python run.py\`,浏览器访问 http://localhost:5000。

## 九、Demo:路由设计

Flask 用装饰器注册路由,语义清晰:

\`\`\`python
# app/blog.py
from flask import Blueprint, render_template

blog_bp = Blueprint("blog", __name__)  # 创建蓝图,名字 "blog"

@blog_bp.route("/")
def index():
    """首页:展示文章列表。
    URL: GET /
    """
    # 假装从数据库查出来的(下一章换真数据)
    posts = [
        {"id": 1, "title": "Hello Flask", "summary": "第一篇"},
        {"id": 2, "title": "学 SQLAlchemy", "summary": "ORM 入门"},
    ]
    # render_template 找 templates/index.html 渲染
    return render_template("index.html", posts=posts)

@blog_bp.route("/post/<int:post_id>")
def post_detail(post_id):
    """文章详情页。
    URL: GET /post/1
    <int:post_id> 是转换器,只匹配数字,非数字直接 404
    """
    return f"查看文章 {post_id}"  # 这里先返回字符串,后续改模板

@blog_bp.route("/post/new", methods=["GET", "POST"])
def new_post():
    """发布文章。
    GET 返回表单,POST 处理提交。
    """
    if request.method == "POST":
        # 处理表单数据,存数据库
        return "文章已发布"
    return render_template("edit_post.html")
\`\`\`

**路由设计原则**:
- 列表页用名词复数:\`/posts\`。
- 详情页用 \`/posts/<id>\`。
- 编辑用 \`/posts/<id>/edit\`。
- 删除用 \`/posts/<id>/delete\`(POST 提交,不用 GET,因为 GET 不应有副作用)。

## 十、Demo:Jinja2 模板渲染

\`\`\`html
<!-- app/templates/index.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>我的博客</title>
</head>
<body>
    <h1>最新文章</h1>
    <!-- for 循环遍历 posts -->
    {% for post in posts %}
        <article>
            <!-- {{ }} 输出变量 -->
            <h2>{{ post.title }}</h2>
            <p>{{ post.summary }}</p>
            <!-- url_for 反向构造 URL,不要硬编码 -->
            <a href="{{ url_for('blog.post_detail', post_id=post.id) }}">阅读全文</a>
        </article>
    {% else %}
        <!-- for-else:循环为空时执行 -->
        <p>还没有文章,快来发一篇吧!</p>
    {% endfor %}
</body>
</html>
\`\`\`

**关键点**:
- 永远用 \`url_for\` 构造 URL,不要写死 \`/post/1\`,改路由时 URL 自动更新。
- \`{{ }}\` 默认会做 HTML 转义,防止 XSS。
- 需要输出原始 HTML 时用 \`| safe\`,但要确保内容可信。

## 十一、Demo:数据模型定义

用 Flask-SQLAlchemy 定义模型,把第五节的表结构映射成 Python 类:

\`\`\`python
# app/models.py
from datetime import datetime
from app.extensions import db  # 从 extensions 导入 db 实例

# 多对多关系的中间表,不需要建模型类,直接用 Table
post_tags = db.Table(
    "post_tags",
    db.Column("post_id", db.Integer, db.ForeignKey("posts.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)

class User(db.Model):
    """用户模型:作者/读者共用一张表。"""
    __tablename__ = "users"  # 指定表名

    id = db.Column(db.Integer, primary_key=True)        # 主键
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 反向关系:一个用户有多篇文章
    posts = db.relationship("Post", backref="author", lazy="dynamic")

class Category(db.Model):
    """分类模型。"""
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(50), unique=True)

    posts = db.relationship("Post", backref="category", lazy="dynamic")

class Post(db.Model):
    """文章模型。"""
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))

    # 多对多:secondary 指向中间表
    tags = db.relationship("Tag", secondary=post_tags, backref="posts")

class Tag(db.Model):
    """标签模型。"""
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Comment(db.Model):
    """评论模型。"""
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    post = db.relationship("Post", backref="comments")
    user = db.relationship("User", backref="comments")
\`\`\`

**字段说明**:
- \`lazy="dynamic"\`:返回 query 对象,支持后续过滤(如 \`user.posts.filter(...)\`),适合需要分页的场景。
- \`backref="author"\`:反向创建 \`Post.author\` 属性,无需在 Post 里再写一遍。
- \`onupdate\`:更新时自动写时间戳。

## 十二、Demo:数据库初始化

第一次运行要建表、塞点测试数据:

\`\`\`python
# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()                   # 先创建实例,不绑定 app
login = LoginManager()
login.login_view = "auth.login"     # 未登录时跳转到哪个视图

# app/__init__.py 里调用 db.init_app(app) 绑定
\`\`\`

\`\`\`python
# scripts/init_db.py
from app import create_app
from app.extensions import db
from app.models import User, Category, Post, Tag

app = create_app("development")

with app.app_context():  # Flask 需要 app context 才能操作数据库
    db.create_all()      # 根据 Model 创建所有表(已存在则跳过)

    # 塞点初始数据
    if not User.query.first():  # 表为空才插
        admin = User(username="admin", email="admin@blog.com", password_hash="xxx")
        cat = Category(name="默认分类", slug="default")
        post = Post(title="Hello", body="第一篇文章", author=admin, category=cat)
        db.session.add_all([admin, cat, post])
        db.session.commit()  # 一次性提交,失败会回滚
    print("数据库初始化完成")
\`\`\`

运行:\`python scripts/init_db.py\`。

**注意**:\`create_all\` 不会修改已存在的表结构,生产环境用 \`Flask-Migrate\`(Alembic)做迁移。

## 十三、Demo:模板继承

模板继承是 Jinja2 的精髓,避免每个页面都重复写 \`<head>\`、导航栏:

\`\`\`html
<!-- app/templates/base.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}我的博客{% endblock %}</title>
    <!-- 静态文件用 url_for('static', filename=...) -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <nav>
        <a href="{{ url_for('blog.index') }}">首页</a>
        {% if current_user.is_authenticated %}
            <a href="{{ url_for('blog.new_post') }}">写文章</a>
            <a href="{{ url_for('auth.logout') }}">登出 ({{ current_user.username }})</a>
        {% else %}
            <a href="{{ url_for('auth.login') }}">登录</a>
        {% endif %}
    </nav>
    <!-- flash 消息:操作成功/失败时显示 -->
    {% with messages = get_flashed_messages() %}
        {% for msg in messages %}
            <div class="flash">{{ msg }}</div>
        {% endfor %}
    {% endwith %}
    <!-- 子模板内容插入这里 -->
    {% block content %}{% endblock %}
</body>
</html>
\`\`\`

\`\`\`html
<!-- app/templates/index.html -->
{% extends "base.html" %}

{% block title %}首页 - {{ super() }}{% endblock %}
<!-- super() 输出父模板的同名 block 内容 -->

{% block content %}
    <h1>最新文章</h1>
    {% for post in posts %}
        <article>
            <h2>{{ post.title }}</h2>
            <p>{{ post.body | truncate(100) }}</p>
            <a href="{{ url_for('blog.post_detail', post_id=post.id) }}">阅读全文</a>
        </article>
    {% else %}
        <p>还没有文章。</p>
    {% endfor %}
{% endblock %}
\`\`\`

**模板继承的层次**:
- \`base.html\`:全站布局(导航、页脚、CSS 引入)。
- \`index.html\` / \`post_detail.html\`:继承 base,填充 content block。
- 表单页可能再加一层 \`form_base.html\`,统一表单样式。

## 十四、架构设计图(文字描述)

整体架构分四层:

\`\`\`text
┌─────────────────────────────────────┐
│  表现层(Template)                  │  ← Jinja2 渲染 HTML
│  index.html / post_detail.html      │
└─────────────────────────────────────┘
              ▲
              │ render_template
              │
┌─────────────────────────────────────┐
│  控制层(View Function)            │  ← Flask 视图函数
│  blog.py / auth.py                  │  ← 蓝图组织
└─────────────────────────────────────┘
              ▲
              │ 调用 ORM
              │
┌─────────────────────────────────────┐
│  模型层(Model)                    │  ← SQLAlchemy
│  User / Post / Category / Tag ...   │
└─────────────────────────────────────┘
              ▲
              │ SQL
              │
┌─────────────────────────────────────┐
│  存储层(Database)                 │  ← SQLite/PostgreSQL/MySQL
└─────────────────────────────────────┘
\`\`\`

**横切关注点(Cross-cutting Concerns)**:
- **认证**:Flask-Login,通过装饰器 \`@login_required\` 保护视图。
- **表单**:Flask-WTF,自动 CSRF 防护。
- **配置**:\`config.py\` 用类继承区分开发/生产/测试。
- **日志**:Flask 自带 \`app.logger\`。
- **迁移**:Flask-Migrate(Alembic)做表结构版本管理。

## 十五、小结

- 博客系统的核心实体是 User / Post / Category / Tag / Comment,关系清晰,适合练习 ORM。
- 框架选型看场景:Flask 适合学习和小项目,Django 适合内容站,FastAPI 适合 API。
- 用 MTV 模式分层,工厂模式管理 app 生命周期。
- 模板继承是 Jinja2 精髓,合理拆 \`base.html\` 能省一半代码。
- 先设计后编码,数据模型想清楚再写视图函数,避免边写边改。

下一章我们把这些设计落成完整可运行的代码,包括 CRUD、评论、用户认证。
`,
  },

  // ============================================================
  // 第 2 章:实战:Flask 博客系统(完整实现)
  // ============================================================
  {
    id: "pyproject-blog-impl",
    group: "Web 应用开发",
    icon: "🚀",
    title: "实战:Flask 博客系统(完整实现)",
    content: `# 实战:Flask 博客系统(完整实现)

## 一、目标与依赖

本章把上一章的设计落成完整可运行的项目。功能:文章 CRUD、分类管理、评论、用户登录。

依赖(\`requirements.txt\`):

\`\`\`text
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-WTF==1.2.1
Flask-Login==0.6.3
email-validator==2.1.0
python-dotenv==1.0.0
\`\`\`

安装:\`pip install -r requirements.txt\`。

## 二、配置与扩展

\`\`\`python
# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()  # 加载 .env 文件

class BaseConfig:
    """所有配置的基类。"""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///blog.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # 关掉事件追踪,省内存
    WTF_CSRF_ENABLED = True                # 开启 CSRF 防护

class DevelopmentConfig(BaseConfig):
    DEBUG = True

class ProductionConfig(BaseConfig):
    DEBUG = False
    # 生产环境 SECRET_KEY 必须从环境变量读
    SECRET_KEY = os.environ["SECRET_KEY"]

class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"  # 内存数据库,测试快
    WTF_CSRF_ENABLED = False                       # 测试关 CSRF
\`\`\`

\`\`\`python
# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login = LoginManager()
login.login_view = "auth.login"   # 未登录访问受保护页面时跳转
login.login_message = "请先登录"   # 自定义提示
\`\`\`

## 三、工厂函数与蓝图

\`\`\`python
# app/__init__.py
from flask import Flask
from app.config import DevelopmentConfig, ProductionConfig, TestingConfig
from app.extensions import db, login

# 配置名 → 配置类的映射
CONFIGS = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}

def create_app(config_name="development"):
    """工厂函数:创建并配置 Flask 应用。"""
    app = Flask(__name__)
    app.config.from_object(CONFIGS[config_name])

    # 初始化扩展
    db.init_app(app)
    login.init_app(app)

    # 注册蓝图
    from app.blog import blog_bp
    from app.auth import auth_bp
    app.register_blueprint(blog_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")

    # 注册 user_loader:Flask-Login 需要知道如何根据 id 取用户
    from app.models import User

    @login.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    return app
\`\`\`

## 四、数据模型(完整版)

\`\`\`python
# app/models.py
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db, login

# 多对多中间表
post_tags = db.Table(
    "post_tags",
    db.Column("post_id", db.Integer, db.ForeignKey("posts.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)

class User(UserMixin, db.Model):
    """用户模型。UserMixin 自动提供 is_authenticated 等属性。"""
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    posts = db.relationship("Post", backref="author", lazy="dynamic")

    def set_password(self, password):
        """设置密码:存哈希不存明文。"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码:用同样的算法哈希后比对。"""
        return check_password_hash(self.password_hash, password)

@login.user_loader
def load_user(user_id):
    """Flask-Login 回调:根据 id 取用户。"""
    return db.session.get(User, int(user_id))

class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(50), unique=True)
    posts = db.relationship("Post", backref="category", lazy="dynamic")

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))
    tags = db.relationship("Tag", secondary=post_tags, backref="posts")

    def to_dict(self):
        """转成字典,API 用。"""
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "author": self.author.username if self.author else None,
            "created_at": self.created_at.isoformat(),
        }

class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    post = db.relationship("Post", backref="comments")
    user = db.relationship("User", backref="comments")
\`\`\`

## 五、表单类(Flask-WTF)

\`\`\`python
# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length

class LoginForm(FlaskForm):
    """登录表单。"""
    username = StringField("用户名", validators=[DataRequired()])
    password = PasswordField("密码", validators=[DataRequired()])
    submit = SubmitField("登录")

class RegisterForm(FlaskForm):
    """注册表单。"""
    username = StringField("用户名", validators=[DataRequired(), Length(3, 30)])
    email = StringField("邮箱", validators=[DataRequired(), Email()])
    password = PasswordField("密码", validators=[DataRequired(), Length(6, 64)])
    password2 = PasswordField("确认密码", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("注册")

class PostForm(FlaskForm):
    """文章编辑表单。"""
    title = StringField("标题", validators=[DataRequired(), Length(1, 200)])
    body = TextAreaField("正文", validators=[DataRequired()])
    category = StringField("分类", validators=[DataRequired()])
    tags = StringField("标签(逗号分隔)")
    submit = SubmitField("保存")

class CommentForm(FlaskForm):
    """评论表单。"""
    body = TextAreaField("评论", validators=[DataRequired(), Length(1, 500)])
    submit = SubmitField("发表")
\`\`\`

**WTF 的好处**:自动生成 CSRF token、字段校验、错误信息回显。

## 六、Demo:文章列表页

\`\`\`python
# app/blog.py
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
from flask_login import current_user, login_required
from app.extensions import db
from app.models import Post, Category, Tag, Comment
from app.forms import PostForm, CommentForm

blog_bp = Blueprint("blog", __name__)

@blog_bp.route("/")
@blog_bp.route("/index")
def index():
    """首页:分页展示文章列表。
    URL: GET /?page=2
    """
    page = request.args.get("page", 1, type=int)  # type=int 自动转换,失败返回默认值
    per_page = 10  # 每页 10 条
    # paginate 返回 Pagination 对象,有 items/has_next/has_prev/page/total
    pagination = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return render_template("index.html", pagination=pagination, posts=pagination.items)

@blog_bp.route("/category/<slug>")
def category(slug):
    """按分类筛选文章。"""
    cat = Category.query.filter_by(slug=slug).first_or_404()
    page = request.args.get("page", 1, type=int)
    pagination = cat.posts.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template("index.html", pagination=pagination, posts=pagination.items)
\`\`\`

\`\`\`html
<!-- app/templates/index.html -->
{% extends "base.html" %}
{% block title %}首页{% endblock %}
{% block content %}
    <h1>最新文章</h1>
    {% for post in posts %}
        <article>
            <h2><a href="{{ url_for('blog.post_detail', post_id=post.id) }}">{{ post.title }}</a></h2>
            <p class="meta">
                作者:{{ post.author.username }} |
                {{ post.created_at.strftime('%Y-%m-%d') }} |
                分类:{{ post.category.name if post.category else '未分类' }}
            </p>
            <p>{{ post.body | truncate(100) }}</p>
        </article>
    {% else %}
        <p>还没有文章。</p>
    {% endfor %}

    <!-- 分页导航 -->
    {% if pagination.pages > 1 %}
        <nav class="pagination">
            {% if pagination.has_prev %}
                <a href="{{ url_for('blog.index', page=pagination.prev_num) }}">上一页</a>
            {% endif %}
            <span>第 {{ pagination.page }} / {{ pagination.pages }} 页</span>
            {% if pagination.has_next %}
                <a href="{{ url_for('blog.index', page=pagination.next_num) }}">下一页</a>
            {% endif %}
        </nav>
    {% endif %}
{% endblock %}
\`\`\`

## 七、Demo:文章详情页

\`\`\`python
# app/blog.py(续)
@blog_bp.route("/post/<int:post_id>")
def post_detail(post_id):
    """文章详情页 + 评论列表 + 评论表单。"""
    post = db.session.get(Post, post_id) or abort(404)
    form = CommentForm()  # 评论表单
    return render_template("post_detail.html", post=post, form=form)
\`\`\`

\`\`\`html
<!-- app/templates/post_detail.html -->
{% extends "base.html" %}
{% block title %}{{ post.title }}{% endblock %}
{% block content %}
    <article>
        <h1>{{ post.title }}</h1>
        <p class="meta">
            作者:{{ post.author.username }} |
            {{ post.created_at.strftime('%Y-%m-%d %H:%M') }}
        </p>
        <!-- 正文用 safe 标记,因为可能含富文本(慎用,确保来源可信) -->
        <div class="body">{{ post.body }}</div>

        <p>标签:
            {% for tag in post.tags %}
                <span class="tag">{{ tag.name }}</span>
            {% endfor %}
        </p>
    </article>

    <section class="comments">
        <h2>评论 ({{ post.comments.count() }})</h2>
        {% for c in post.comments %}
            <div class="comment">
                <strong>{{ c.user.username }}</strong>
                <small>{{ c.created_at.strftime('%Y-%m-%d %H:%M') }}</small>
                <p>{{ c.body }}</p>
            </div>
        {% else %}
            <p>还没有评论,快来抢沙发。</p>
        {% endfor %}

        {% if current_user.is_authenticated %}
            <h3>发表评论</h3>
            <form method="post" action="{{ url_for('blog.add_comment', post_id=post.id) }}">
                {{ form.hidden_tag() }}  <!-- CSRF token,必加 -->
                <p>{{ form.body.label }} {{ form.body(rows=3) }}</p>
                <p>{{ form.submit() }}</p>
            </form>
        {% else %}
            <p><a href="{{ url_for('auth.login') }}">登录</a>后才能评论。</p>
        {% endif %}
    </section>
{% endblock %}
\`\`\`

## 八、Demo:发布文章

\`\`\`python
# app/blog.py(续)
@blog_bp.route("/post/new", methods=["GET", "POST"])
@login_required  # 必须登录才能访问
def new_post():
    """发布新文章。"""
    form = PostForm()
    if form.validate_on_submit():  # 同时校验 method==POST 和字段
        # 分类:有就用,没有就新建
        category = Category.query.filter_by(name=form.category.data).first()
        if not category:
            category = Category(name=form.category.data, slug=form.category.data.lower())
            db.session.add(category)

        post = Post(
            title=form.title.data,
            body=form.body.data,
            author=current_user,
            category=category,
        )

        # 标签:逗号分隔,逐个处理
        if form.tags.data:
            for name in form.tags.data.split(","):
                name = name.strip()
                if not name:
                    continue
                tag = Tag.query.filter_by(name=name).first()
                if not tag:
                    tag = Tag(name=name)
                    db.session.add(tag)
                post.tags.append(tag)

        db.session.add(post)
        db.session.commit()
        flash("文章已发布")
        return redirect(url_for("blog.post_detail", post_id=post.id))
    return render_template("edit_post.html", form=form)
\`\`\`

\`\`\`html
<!-- app/templates/edit_post.html -->
{% extends "base.html" %}
{% block title %}写文章{% endblock %}
{% block content %}
    <h1>写文章</h1>
    <form method="post">
        {{ form.hidden_tag() }}
        <p>{{ form.title.label }}<br>{{ form.title(size=60) }}</p>
        {% for err in form.title.errors %}<span class="err">{{ err }}</span>{% endfor %}
        <p>{{ form.body.label }}<br>{{ form.body(rows=15, style="width:100%") }}</p>
        <p>{{ form.category.label }} {{ form.category() }}</p>
        <p>{{ form.tags.label }} {{ form.tags() }}</p>
        <p>{{ form.submit() }}</p>
    </form>
{% endblock %}
\`\`\`

## 九、Demo:编辑文章

\`\`\`python
# app/blog.py(续)
@blog_bp.route("/post/<int:post_id>/edit", methods=["GET", "POST"])
@login_required
def edit_post(post_id):
    """编辑文章。只有作者本人或管理员能改。"""
    post = db.session.get(Post, post_id) or abort(404)
    # 权限检查:作者本人或管理员
    if post.author != current_user and not current_user.is_admin:
        abort(403)  # 403 Forbidden

    form = PostForm()
    if form.validate_on_submit():
        post.title = form.title.data
        post.body = form.body.data
        # 处理分类变更
        category = Category.query.filter_by(name=form.category.data).first()
        if not category:
            category = Category(name=form.category.data, slug=form.category.data.lower())
            db.session.add(category)
        post.category = category
        # 清空旧标签
        post.tags = []
        if form.tags.data:
            for name in form.tags.data.split(","):
                name = name.strip()
                if name:
                    tag = Tag.query.filter_by(name=name).first() or Tag(name=name)
                    post.tags.append(tag)
        db.session.commit()
        flash("文章已更新")
        return redirect(url_for("blog.post_detail", post_id=post.id))

    # GET 请求:用现有数据填充表单
    form.title.data = post.title
    form.body.data = post.body
    form.category.data = post.category.name if post.category else ""
    form.tags.data = ",".join(t.name for t in post.tags)
    return render_template("edit_post.html", form=form)
\`\`\`

\`\`\`python
# app/blog.py(续)
@blog_bp.route("/post/<int:post_id>/delete", methods=["POST"])
@login_required
def delete_post(post_id):
    """删除文章。用 POST 不是 GET,因为删除有副作用。"""
    post = db.session.get(Post, post_id) or abort(404)
    if post.author != current_user and not current_user.is_admin:
        abort(403)
    db.session.delete(post)
    db.session.commit()
    flash("文章已删除")
    return redirect(url_for("blog.index"))
\`\`\`

## 十、Demo:评论功能

\`\`\`python
# app/blog.py(续)
@blog_bp.route("/post/<int:post_id>/comment", methods=["POST"])
@login_required
def add_comment(post_id):
    """发表评论。"""
    post = db.session.get(Post, post_id) or abort(404)
    form = CommentForm()
    if form.validate_on_submit():
        comment = Comment(body=form.body.data, post=post, user=current_user)
        db.session.add(comment)
        db.session.commit()
        flash("评论已发表")
    else:
        flash("评论内容不能为空")
    return redirect(url_for("blog.post_detail", post_id=post_id))
\`\`\`

## 十一、Demo:用户登录

\`\`\`python
# app/auth.py
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.urls import url_parse
from app.extensions import db
from app.models import User
from app.forms import LoginForm, RegisterForm

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """用户注册。"""
    if current_user.is_authenticated:
        return redirect(url_for("blog.index"))
    form = RegisterForm()
    if form.validate_on_submit():
        # 检查用户名/邮箱是否已存在
        if User.query.filter_by(username=form.username.data).first():
            flash("用户名已存在")
            return redirect(url_for("auth.register"))
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)  # 存哈希
        db.session.add(user)
        db.session.commit()
        flash("注册成功,请登录")
        return redirect(url_for("auth.login"))
    return render_template("auth/register.html", form=form)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """用户登录。"""
    if current_user.is_authenticated:
        return redirect(url_for("blog.index"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        # 用户不存在或密码错误
        if user is None or not user.check_password(form.password.data):
            flash("用户名或密码错误")
            return redirect(url_for("auth.login"))
        login_user(user, remember=True)  # 登录,remember=True 记住 365 天
        # 登录后跳转到 next 指定的页面(注意校验 next 是否本站 URL,防开放重定向)
        next_page = request.args.get("next")
        if not next_page or url_parse(next_page).netloc != "":
            next_page = url_for("blog.index")
        return redirect(next_page)
    return render_template("auth/login.html", form=form)

@auth_bp.route("/logout")
@login_required
def logout():
    """登出。"""
    logout_user()
    flash("已登出")
    return redirect(url_for("blog.index"))
\`\`\`

\`\`\`html
<!-- app/templates/auth/login.html -->
{% extends "base.html" %}
{% block title %}登录{% endblock %}
{% block content %}
    <h1>登录</h1>
    <form method="post">
        {{ form.hidden_tag() }}
        <p>{{ form.username.label }} {{ form.username() }}</p>
        <p>{{ form.password.label }} {{ form.password() }}</p>
        <p>{{ form.submit() }}</p>
    </form>
    <p>没有账号?<a href="{{ url_for('auth.register') }}">注册</a></p>
{% endblock %}
\`\`\`

## 十二、Demo:完整运行流程

\`\`\`bash
# 1. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 写 .env 文件
cat > .env <<EOF
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///blog.db
EOF

# 4. 初始化数据库
python -c "from app import create_app; from app.extensions import db; \\
app=create_app('development'); \\
app.app_context().push(); \\
db.create_all()"

# 5. 启动服务
python run.py
\`\`\`

\`\`\`python
# scripts/init_admin.py —— 创建管理员账号
from app import create_app
from app.extensions import db
from app.models import User

app = create_app("development")
with app.app_context():
    if not User.query.filter_by(username="admin").first():
        admin = User(username="admin", email="admin@blog.com", is_admin=True)
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("管理员已创建:admin / admin123")
\`\`\`

**手动测试流程**:

1. 访问 http://localhost:5000 → 看到首页(空)。
2. 点「登录」→ 跳转到 /auth/login。
3. 点「注册」→ 填表单注册一个新用户。
4. 登录后点「写文章」→ 发一篇文章。
5. 在详情页发表评论。
6. 点「编辑」修改文章。
7. 登出 → 再登录。

## 十三、部署建议(Gunicorn + Nginx)

开发用 \`app.run(debug=True)\`,生产用 WSGI 服务器:

\`\`\`bash
# 1. 用 Gunicorn 跑应用(4 个 worker,绑定 Unix socket)
gunicorn -w 4 -b unix:/tmp/blog.sock run:app

# 或绑定本地端口
gunicorn -w 4 -b 127.0.0.1:8000 run:app
\`\`\`

\`\`\`nginx
# /etc/nginx/sites-available/blog
server {
    listen 80;
    server_name blog.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/app/static/;  # 静态文件直接 Nginx 处理,不经过 Python
        expires 30d;
    }
}
\`\`\`

**生产 checklist**:
- \`debug=False\`,SECRET_KEY 从环境变量读。
- 数据库换 PostgreSQL/MySQL,别用 SQLite。
- 静态文件用 CDN 或 Nginx 直接服务。
- 用 systemd 管理 Gunicorn 进程,挂了自动重启。
- 定期备份数据库。
- 配 HTTPS(Let's Encrypt 免费证书)。

\`\`\`ini
# /etc/systemd/system/blog.service
[Unit]
Description=Flask Blog Gunicorn
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/blog
EnvironmentFile=/path/to/blog/.env
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 run:app
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

启动:\`sudo systemctl enable blog && sudo systemctl start blog\`。

## 十四、小结

- 工厂模式 + 蓝图:配置和路由解耦,测试方便。
- Flask-Login:\`@login_required\` 保护视图,\`current_user\` 全局可访问。
- Flask-WTF:自动 CSRF、字段校验、错误回显。
- 分页:\`paginate()\` 一行搞定,模板里用 \`pagination.has_next\` 等。
- 模板继承:\`base.html\` + \`{% block %}\` 复用布局。
- 生产部署:Gunicorn(WSGI)+ Nginx(反代 + 静态文件)+ systemd(进程管理)。

至此一个完整的博客系统就能跑起来了。下一章我们换主题,讲用户权限管理系统的架构设计。
`,
  },

  // ============================================================
  // 第 3 章:用户权限管理系统:RBAC 模型设计
  // ============================================================
  {
    id: "pyproject-auth-arch",
    group: "Web 应用开发",
    icon: "🔐",
    title: "用户权限管理系统:RBAC 模型设计",
    content: `# 用户权限管理系统:RBAC 模型设计

## 一、认证 vs 授权:别混为一谈

做权限系统前,先分清两个概念:

| 概念 | 英文 | 回答的问题 | 例子 |
| --- | --- | --- | --- |
| 认证 | Authentication | **你是谁?** | 登录、扫码、指纹 |
| 授权 | Authorization | **你能干啥?** | 普通用户不能删别人文章 |

记忆口诀:**AuthN 认身份,AuthZ 判权限**(N=Who am i,Z=What can i do)。

常见错误:只做了登录(认证),没做权限检查(授权),导致任何登录用户都能调管理员接口。这就是为什么 OWASP 把「Broken Access Control」列为 Web 安全 Top 1。

## 二、权限模型演进

### 2.1 ACL(Access Control List,访问控制列表)

最早的模型:每个资源挂一张「谁能干什么」的清单。

\`\`\`text
文章 1:
  - user:alice → [read, edit, delete]
  - user:bob   → [read]
  - role:admin → [read, edit, delete]
\`\`\`

**优点**:简单直接,资源少时清楚。

**缺点**:
- 资源一多,清单爆炸(10 万文章 × 1000 用户 = 1 亿条)。
- 改一个用户的权限要扫所有资源。
- 没有角色概念,新员工入职要逐个资源授权。

### 2.2 RBAC(Role-Based Access Control,基于角色的访问控制)

把权限挂在**角色**上,用户通过角色间接获得权限。

\`\`\`text
角色:editor → [post:create, post:edit, post:delete_own]
用户:alice → 角色 [editor]
\`\`\`

alice 通过 editor 角色获得权限,不用每个资源单独授权。

**优点**:
- 用户和权限解耦,新增用户只需分配角色。
- 角色是业务概念(编辑、管理员、访客),贴合组织架构。
- 改一个角色的权限,所有该角色用户同时生效。

**缺点**:角色爆炸——业务复杂时角色数量激增(细粒度难控制)。

### 2.3 ABAC(Attribute-Based Access Control,基于属性的访问控制)

用规则表达式判断:「满足条件 X 才允许」。

\`\`\`text
规则:允许 当 用户.部门 == 资源.部门 且 用户.级别 >= 资源.密级
\`\`\`

**优点**:细粒度,能表达复杂策略(时间、地点、属性组合)。

**缺点**:规则复杂,性能差,难审计。

### 2.4 对比表

| 维度 | ACL | RBAC | ABAC |
| --- | --- | --- | --- |
| 授权对象 | 资源 | 角色 | 属性/规则 |
| 灵活性 | 低 | 中 | 高 |
| 管理成本 | 高(资源多时) | 中 | 高(规则复杂) |
| 适合场景 | 文件系统、小项目 | 企业应用(主流) | 政府、金融、复杂策略 |
| 实现难度 | 低 | 中 | 高 |

**本章重点 RBAC**:企业 90% 的场景用 RBAC 就够了,简单且够用。

## 三、RBAC 模型详解

### 3.1 三要素

- **User(用户)**:具体的人。
- **Role(角色)**:权限的集合,如 admin、editor、viewer。
- **Permission(权限)**:对某个资源的某个操作,如 \`post:delete\`。

关系:**User — Role — Permission**,用户通过角色间接获得权限。

\`\`\`text
用户 alice
   │
   │ assigned
   ▼
角色 editor
   │
   │ has
   ▼
权限 [post:create, post:edit, post:read]
\`\`\`

### 3.2 RBAC 的三个级别

| 级别 | 名字 | 特点 |
| --- | --- | --- |
| RBAC0 | 基础 | User-Role-Permission,够用 |
| RBAC1 | 带角色继承 | 角色之间有父子关系,子继承父的权限 |
| RBAC2 | 带约束 | 角色互斥(会计和审核不能同一人)、角色数量上限 |
| RBAC3 | = RBAC1 + RBAC2 | 完整版 |

### 3.3 权限命名规范

推荐用 \`资源:操作\` 格式,清晰且可解析:

| 权限 | 含义 |
| --- | --- |
| \`post:read\` | 读文章 |
| \`post:create\` | 创建文章 |
| \`post:update\` | 更新文章 |
| \`post:delete\` | 删除文章 |
| \`user:manage\` | 管理用户 |
| \`*:*\` | 所有权限(超级管理员) |

## 四、数据库设计

### 4.1 表结构

五张表:用户、角色、权限,加两张关联表。

**users 表**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Integer PK | 主键 |
| username | String(80) | 用户名 |
| email | String(120) | 邮箱 |
| password_hash | String(255) | 密码哈希 |
| is_active | Boolean | 账号是否启用 |
| created_at | DateTime | 创建时间 |

**roles 表**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Integer PK | 主键 |
| name | String(50) | 角色名(如 admin) |
| description | String(200) | 角色描述 |
| parent_id | Integer FK→roles.id | 父角色(用于继承) |

**permissions 表**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Integer PK | 主键 |
| name | String(80) | 权限名(如 post:delete) |
| description | String(200) | 权限描述 |

**user_roles 表(多对多中间表)**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| user_id | Integer FK→users.id | 用户 |
| role_id | Integer FK→roles.id | 角色 |

**role_permissions 表(多对多中间表)**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| role_id | Integer FK→roles.id | 角色 |
| permission_id | Integer FK→permissions.id | 权限 |

### 4.2 关系图

\`\`\`text
users ──< user_roles >── roles ──< role_permissions >── permissions
                              │
                              └──> parent_id(自引用,角色继承)
\`\`\`

## 五、密码安全

### 5.1 为什么不能存明文

数据库泄露 → 所有用户密码暴露。用户喜欢一码走天下,你的库泄了,他的邮箱、银行都危险。

### 5.2 哈希(Hash)

用单向哈希函数把密码变成定长字符串,不可逆:

\`\`\`text
password "abc123" --hash--> "$2b$12$XXXXX..."
\`\`\`

存哈希不存明文。验证时:把用户输入的密码同样哈希,比对结果。

### 5.3 加盐(Salt)

同样的密码哈希后结果一样,攻击者能用「彩虹表」反查。加盐:每个用户一个随机串,混入密码一起哈希。

\`\`\`text
password + salt --hash--> hash
\`\`\`

盐不需要保密,但每个用户要不同。

### 5.4 算法选择

| 算法 | 特点 | 推荐度 |
| --- | --- | --- |
| MD5 / SHA1 | 太快,易被暴力破解 | ❌ 禁用 |
| SHA256 | 快,不适合密码 | ❌ |
| bcrypt | 自带盐,可调成本因子 | ✅ 推荐 |
| argon2 | 抗 GPU/ASIC,2015 密码哈希竞赛冠军 | ✅✅ 最推荐 |
| pbkdf2 | 标准库自带,可调迭代次数 | ✅ |

**慢哈希的意义**:每次验证耗时 100ms,用户登录无感;但攻击者暴力破解时,每秒只能试 10 次,千万密码库要算 10 天。

## 六、JWT vs Session

### 6.1 Session 认证

服务器存一份会话状态,客户端拿 session_id(Cookie)。

\`\`\`text
1. 用户登录 → 服务器创建 session,返回 session_id
2. 客户端把 session_id 存 Cookie
3. 后续请求带 Cookie → 服务器查 session → 认用户
4. 登出 → 删除 session
\`\`\`

### 6.2 JWT 认证

服务器不存状态,把用户信息编码成 Token 发给客户端,客户端每次请求带上。

\`\`\`text
1. 用户登录 → 服务器签发 JWT
2. 客户端把 JWT 存 localStorage/cookie
3. 后续请求 Authorization: Bearer <token>
4. 服务器验证签名 → 解析用户 → 认用户
\`\`\`

JWT 结构:\`header.payload.signature\`,三段 Base64URL 用点连接。

### 6.3 对比表

| 维度 | Session | JWT |
| --- | --- | --- |
| 状态 | 服务器存(有状态) | 服务器不存(无状态) |
| 扩展性 | 多服务器要共享 session(粘性/Redis) | 天然支持,任何机器都能验 |
| 撤销 | 删 session 即可立即失效 | 难,要黑名单(违背无状态) |
| 大小 | session_id 几十字节 | JWT 几百字节~1KB |
| 适合 | 传统 Web(渲染 HTML) | API、微服务、移动端、SSO |
| 安全 | 防止 XSS(用 HttpOnly Cookie) | 防 CSRF(不放 Cookie) |

**经验**:博客这种传统 Web 用 Session(配合 CSRF token);纯 API 服务用 JWT。

## 七、Token 设计:Access + Refresh

JWT 直接放用户权限,如果泄露就完蛋。业界做法:**双 Token**。

| Token | 用途 | 有效期 | 存储位置 |
| --- | --- | --- | --- |
| Access Token | 访问 API,每次请求带 | 短(15~30 分钟) | 内存 / localStorage |
| Refresh Token | 用来换新的 Access Token | 长(7~30 天) | HttpOnly Cookie |

流程:

\`\`\`text
1. 登录 → 服务器返回 access_token + refresh_token
2. 客户端用 access_token 调 API
3. access_token 过期 → 用 refresh_token 换新的
4. refresh_token 过期 → 重新登录
5. 登出 → 把 refresh_token 加入黑名单
\`\`\`

**为什么这么设计**:access_token 短命,泄露了损失小;refresh_token 长命但不常传输,放 HttpOnly Cookie 防 XSS 读取。

## 八、Demo:密码哈希与验证

用 \`passlib\` 库,支持多种算法:

\`\`\`bash
pip install passlib[bcrypt]
\`\`\`

\`\`\`python
# security/password.py
from passlib.context import CryptContext

# CryptContext 支持多算法,可配置默认和弃用列表
pwd_context = CryptContext(
    schemes=["bcrypt"],          # 支持的算法
    deprecated="auto",          # 自动标记旧算法为弃用
    bcrypt__rounds=12,           # 成本因子,12 是当前推荐值(越大越慢)
)

def hash_password(password: str) -> str:
    """把明文密码哈希成可存储的字符串。
    bcrypt 自带盐,无需手动处理。
    """
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """验证密码:把 plain 用同样算法哈希,与 hashed 比对。
    内部会用 hashed 里的盐和成本因子。
    """
    return pwd_context.verify(plain, hashed)

# 测试
if __name__ == "__main__":
    h = hash_password("my-secret")
    print("哈希:", h)
    print("验证正确密码:", verify_password("my-secret", h))   # True
    print("验证错误密码:", verify_password("wrong", h))       # False
\`\`\`

**关键点**:
- 同一密码每次哈希结果不同(盐随机),不能用 \`==\` 直接比。
- \`verify\` 内部会从哈希串里解析盐和成本因子,所以 \`rounds=12\` 升级后旧哈希仍能验证。

## 九、Demo:JWT 生成与解析

用 \`pyjwt\` 库:

\`\`\`bash
pip install pyjwt
\`\`\`

\`\`\`python
# security/jwt.py
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

# 密钥从环境变量读,生产必须保密
SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"  # HMAC + SHA256,对称加密

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """生成 access token。
    参数:
        data: 要编码的数据(通常是 {"sub": user_id})
        expires_delta: 有效期,默认 30 分钟
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire, "type": "access"})  # 加过期时间和类型
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """生成 refresh token,有效期长。"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """解析并验证 token。
    失败会抛 jwt.PyJWTError 的子类:
      - ExpiredSignatureError:过期
      - InvalidTokenError:无效
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# 测试
if __name__ == "__main__":
    # 生成
    access = create_access_token({"sub": "user-123"})
    refresh = create_refresh_token({"sub": "user-123"})
    print("access:", access)
    print("refresh:", refresh)

    # 解析
    payload = decode_token(access)
    print("payload:", payload)
    # 输出类似:{'sub': 'user-123', 'exp': ..., 'type': 'access'}
\`\`\`

**JWT 三段结构**:\`header.payload.signature\`,header 是算法,payload 是数据,signature 是签名。Base64URL 编码,用点连接。**注意 payload 不加密**,别放敏感信息(密码、密钥)。

## 十、Demo:RBAC 数据模型

用 SQLAlchemy 实现:

\`\`\`python
# models/rbac.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from extensions import Base  # declarative base

# 用户-角色 关联表(多对多)
user_roles = Table(
    "user_roles", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)

# 角色-权限 关联表(多对多)
role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship("Role", secondary=user_roles, back_populates="users")

    def has_permission(self, perm_name: str) -> bool:
        """检查用户是否有某权限(考虑角色继承)。"""
        for role in self.roles:
            if role.has_permission(perm_name):
                return True
        return False

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    parent_id = Column(Integer, ForeignKey("roles.id"))  # 自引用,角色继承

    # 自引用关系:子角色 → 父角色
    parent = relationship(
        "Role", remote_side=[id], backref="children"
    )
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, backref="roles")

    def has_permission(self, perm_name: str, _visited=None) -> bool:
        """检查角色是否有某权限,递归查父角色。
        _visited 防止循环引用导致死循环。
        """
        if _visited is None:
            _visited = set()
        if self.id in _visited:
            return False
        _visited.add(self.id)
        # 自己直接拥有的权限
        for p in self.permissions:
            if p.name == perm_name or p.name == "*:*":
                return True
        # 递归查父角色(继承)
        if self.parent:
            return self.parent.has_permission(perm_name, _visited)
        return False

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, nullable=False)  # 如 post:delete
    description = Column(String(200))
\`\`\`

## 十一、Demo:权限检查逻辑

\`\`\`python
# security/permission.py
from functools import wraps
from flask import abort, request
from flask_login import current_user
import jwt

def has_permission(perm_name: str):
    """装饰器:检查当前用户是否有指定权限。
    用法:@has_permission("post:delete")
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 1. 必须登录
            if not current_user.is_authenticated:
                abort(401, description="请先登录")
            # 2. 账号必须启用
            if not current_user.is_active:
                abort(403, description="账号已被禁用")
            # 3. 检查权限(考虑角色继承)
            if not current_user.has_permission(perm_name):
                abort(403, description=f"需要权限: {perm_name}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

def require_token():
    """装饰器:从 Authorization 头解析 JWT,设置 current_user。"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                abort(401, description="缺少 Bearer Token")
            token = auth_header[7:]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                # 用 payload["sub"] 查用户,设到 current_user
                # user = User.query.get(payload["sub"])
                # ...
                return func(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                abort(401, description="Token 已过期")
            except jwt.InvalidTokenError:
                abort(401, description="Token 无效")
        return wrapper
    return decorator
\`\`\`

## 十二、Demo:角色继承

角色有父子关系,子角色自动继承父角色权限:

\`\`\`python
# scripts/seed_roles.py
"""初始化角色和权限数据。"""
from app import create_app
from extensions import db
from models.rbac import Role, Permission

app = create_app("development")
with app.app_context():
    # 创建权限
    perms = [
        Permission(name="post:read", description="读文章"),
        Permission(name="post:create", description="写文章"),
        Permission(name="post:edit", description="编辑文章"),
        Permission(name="post:delete", description="删除文章"),
        Permission(name="user:manage", description="管理用户"),
        Permission(name="*:*", description="所有权限"),
    ]
    db.session.add_all(perms)
    db.session.flush()  # flush 后能拿到 id

    # 创建角色,体现继承关系
    viewer = Role(name="viewer", description="访客")
    editor = Role(name="editor", description="编辑", parent_id=viewer.id)
    admin = Role(name="admin", description="管理员", parent_id=editor.id)

    # 分配权限
    viewer.permissions = [Permission.query.filter_by(name="post:read").first()]
    editor.permissions = [
        Permission.query.filter_by(name="post:read").first(),
        Permission.query.filter_by(name="post:create").first(),
        Permission.query.filter_by(name="post:edit").first(),
    ]
    admin.permissions = [
        Permission.query.filter_by(name="post:delete").first(),
        Permission.query.filter_by(name="user:manage").first(),
        Permission.query.filter_by(name="*:*").first(),
    ]

    db.session.add_all([viewer, editor, admin])
    db.session.commit()
    print("角色权限初始化完成")

# 验证继承
# editor 通过继承获得 viewer 的 post:read 权限
# admin 通过继承获得 editor 的所有权限 + 自己的
\`\`\`

**继承链**:\`admin → editor → viewer\`。admin 自动有 viewer 和 editor 的所有权限,不用重复分配。

## 十三、Demo:中间件鉴权

FastAPI 用依赖注入实现,Flask 用装饰器。下面是 FastAPI 版本:

\`\`\`python
# deps/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """依赖:从 token 解出当前用户。
    所有需要登录的接口都 Depends 这个函数。
    """
    cred_err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise cred_err
    except jwt.PyJWTError:
        raise cred_err
    # 这里查数据库,返回 user 对象
    # user = db.query(User).get(user_id)
    # if not user or not user.is_active:
    #     raise cred_err
    return {"id": user_id}  # 简化:实际返回 user 对象

def require_permission(perm: str):
    """依赖工厂:返回一个检查权限的依赖。
    用法:@router.get("/users", dependencies=[Depends(require_permission("user:manage"))])
    """
    def checker(current_user = Depends(get_current_user)):
        if not current_user.has_permission(perm):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限: {perm}",
            )
        return current_user
    return checker
\`\`\`

\`\`\`python
# main.py
from fastapi import FastAPI, Depends
from deps.auth import get_current_user, require_permission

app = FastAPI()

@app.get("/public")
def public():
    """公开接口,不需要登录。"""
    return {"msg": "hello"}

@app.get("/me")
def me(current_user = Depends(get_current_user)):
    """需要登录。"""
    return {"user": current_user["id"]}

@app.delete("/posts/{post_id}", dependencies=[Depends(require_permission("post:delete"))])
def delete_post(post_id: int):
    """需要 post:delete 权限。"""
    return {"deleted": post_id}
\`\`\`

**FastAPI 依赖注入的优势**:
- 函数即依赖,\`Depends()\` 自动解析参数,链式组合。
- 文档(OpenAPI)自动识别 OAuth2 流程。
- 测试时可以覆盖依赖(用假用户)。

## 十四、权限设计原则

### 14.1 最小权限原则(Principle of Least Privilege)

只给完成任务必需的最小权限。新人不是 admin,只给必需角色;用完即收回。

### 14.2 默认拒绝(Deny by Default)

默认啥都不让干,需要明确授权才能访问。\`if has_permission():\` 而不是 \`if not has_permission():\`。

### 13.3 职责分离(Separation of Duties)

互斥角色不能同一人担任。如:会计和审核不能同一人,防作弊。RBAC2 的约束。

### 14.4 权限粒度

太粗(\`can_edit\`)不够灵活,太细(\`can_edit_post_title_of_others\`)难管理。推荐资源:操作粒度,业务需要时再细化。

### 14.5 审计日志

谁在什么时候干了什么,必须可追溯:

\`\`\`python
from dataclasses import dataclass
# 记录所有敏感操作
@dataclass
class AuditLog:
    user_id: int
    action: str        # 如 "post:delete"
    resource_id: str    # 操作的资源
    ip: str
    timestamp: datetime
    success: bool       # 是否成功
\`\`\`

### 14.6 缓存策略

权限检查每次查数据库太慢。缓存策略:
- 用户登录时,把权限列表一次性查出来,放 Token 或 Redis。
- 权限变更时,主动刷新缓存或让 Token 失效。
- 缓存失效时间要短(5~10 分钟),避免改了权限不生效。

## 十五、小结

- 认证(AuthN)和授权(AuthZ)是两件事,都要做。
- RBAC = User-Role-Permission 三要素,简单实用。
- 角色继承让权限分配更省事,但要小心循环引用。
- 密码必须哈希(bcrypt/argon2),带盐,慢哈希防暴力破解。
- JWT 适合 API,Session 适合传统 Web;双 Token(Access + Refresh)兼顾安全和体验。
- 权限检查要在每个受保护接口做,用装饰器/依赖注入统一处理。
- 设计遵循:最小权限、默认拒绝、职责分离、可审计。

下一章我们用 FastAPI 把这套设计完整实现出来。
`,
  },

  // ============================================================
  // 第 4 章:实战:权限管理系统(完整实现)
  // ============================================================
  {
    id: "pyproject-auth-impl",
    group: "Web 应用开发",
    icon: "🛡️",
    title: "实战:权限管理系统(完整实现)",
    content: `# 实战:权限管理系统(完整实现)

## 一、目标与依赖

本章用 FastAPI + SQLAlchemy 实现完整 RBAC 系统。功能:用户注册/登录、JWT 认证、角色分配、权限检查、受保护接口。

依赖(\`requirements.txt\`):

\`\`\`text
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic[email]==2.5.3
passlib[bcrypt]==1.7.4
pyjwt==2.8.0
python-dotenv==1.0.0
\`\`\`

安装:\`pip install -r requirements.txt\`。

## 二、项目结构

\`\`\`text
auth_project/
├── app/
│   ├── __init__.py
│   ├── config.py          # 配置
│   ├── database.py        # 数据库连接
│   ├── models.py          # 数据模型
│   ├── schemas.py         # Pydantic 模型(API 数据格式)
│   ├── security.py        # 密码哈希、JWT
│   ├── deps.py            # 依赖注入(鉴权)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py        # 注册/登录
│   │   ├── users.py       # 用户管理
│   │   └── roles.py       # 角色权限管理
│   └── main.py            # FastAPI 应用入口
├── .env
└── requirements.txt
\`\`\`

## 三、配置与数据库

\`\`\`python
# app/config.py
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    """应用配置,从环境变量读取。"""
    database_url: str = "sqlite:///./auth.db"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
\`\`\`

\`\`\`python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# SQLite 需要 check_same_thread=False 才能在多线程用
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """依赖:每个请求一个数据库 session,用完关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

## 四、数据模型

\`\`\`python
# app/models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# 多对多关联表
user_roles = Table(
    "user_roles", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)
role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)  # 超级用户绕过权限检查
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship("Role", secondary=user_roles, back_populates="users")

    def has_permission(self, perm_name: str, db) -> bool:
        """检查用户是否拥有某权限。
        超级用户直接返回 True。
        """
        if self.is_superuser:
            return True
        # 遍历所有角色(含继承)
        for role in self.roles:
            if _role_has_permission(role, perm_name, set()):
                return True
        return False

def _role_has_permission(role, perm_name: str, visited: set) -> bool:
    """递归检查角色权限(考虑继承)。visited 防止循环。"""
    if role.id in visited:
        return False
    visited.add(role.id)
    for p in role.permissions:
        if p.name == perm_name or p.name == "*:*":
            return True
    # 递归父角色
    if role.parent:
        return _role_has_permission(role.parent, perm_name, visited)
    return False

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    parent_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    parent = relationship("Role", remote_side=[id], backref="children")
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, backref="roles")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)  # 如 post:delete
    description = Column(String(200))
\`\`\`

## 五、Pydantic Schema(API 数据格式)

Pydantic 模型负责请求/响应的数据校验和序列化,和数据库模型分离:

\`\`\`python
# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """注册请求。"""
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=64)

class UserOut(BaseModel):
    """用户响应(不含密码)。"""
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    roles: list[str] = []  # 角色名列表

    class Config:
        from_attributes = True  # 允许从 ORM 对象读属性

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    """登录响应。"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # access_token 有效期(秒)

class RoleCreate(BaseModel):
    name: str
    description: str | None = None
    parent_id: int | None = None

class RoleOut(BaseModel):
    id: int
    name: str
    description: str | None
    parent_id: int | None
    permissions: list[str] = []

    class Config:
        from_attributes = True

class PermissionCreate(BaseModel):
    name: str  # 如 post:delete
    description: str | None = None

class AssignRoleRequest(BaseModel):
    """给用户分配角色。"""
    role_name: str

class AssignPermissionRequest(BaseModel):
    """给角色分配权限。"""
    permission_name: str
\`\`\`

## 六、安全工具:密码哈希 + JWT

\`\`\`python
# app/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
from app.config import settings

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    """哈希密码,bcrypt 自带盐。"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """验证密码。"""
    return pwd_context.verify(plain, hashed)

def create_access_token(subject: str | int, extra: Optional[dict] = None) -> str:
    """生成 access token,有效期短。"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(subject), "exp": expire, "type": "access"}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def create_refresh_token(subject: str | int) -> str:
    """生成 refresh token,有效期长。"""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": str(subject), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_token(token: str) -> dict:
    """解码并验证 token。失败抛 jwt 异常。"""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
\`\`\`

## 七、依赖注入:鉴权

\`\`\`python
# app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from app.database import get_db
from app.models import User
from app.security import decode_token
from app.config import settings

# tokenUrl 指向登录接口,FastAPI 文档会用这个 URL 展示登录流程
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """依赖:从 token 解出当前用户。所有需要登录的接口 Depends 这个。"""
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "access":
            raise cred_exc
    except jwt.PyJWTError:
        raise cred_exc
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise cred_exc
    if not user.is_active:
        raise HTTPException(status_code=403, detail="账号已被禁用")
    return user

def require_permission(perm: str):
    """依赖工厂:返回一个检查权限的依赖。
    用法:@router.get("/x", dependencies=[Depends(require_permission("post:read"))])
    """
    def checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not current_user.has_permission(perm, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限: {perm}",
            )
        return current_user
    return checker

def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    """依赖:只允许超级用户。"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="需要超级管理员权限")
    return current_user
\`\`\`

## 八、Demo:用户注册

\`\`\`python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, LoginRequest, Token
from app.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """用户注册。
    - 检查用户名/邮箱是否已存在
    - 哈希密码后存储
    """
    # 用户名唯一性检查
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="用户名已被占用")
    # 邮箱唯一性检查
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="邮箱已注册")
    # 创建用户
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新拿到 id
    return user
\`\`\`

测试(运行后访问 http://localhost:8000/docs):

\`\`\`bash
curl -X POST http://localhost:8000/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
\`\`\`

## 九、Demo:登录获取 Token

\`\`\`python
# app/routers/auth.py(续)
@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """用户登录,返回 access_token 和 refresh_token。"""
    # 用户名查找
    user = db.query(User).filter(User.username == payload.username).first()
    # 用户不存在或密码错误(统一报错,防枚举攻击)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="账号已被禁用")
    # 生成双 token
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    return Token(
        access_token=access,
        refresh_token=refresh,
        expires_in=settings.access_token_expire_minutes * 60,
    )

@router.post("/refresh", response_model=Token)
def refresh_token(refresh: str, db: Session = Depends(get_db)):
    """用 refresh token 换新的 access token。"""
    from app.security import decode_token
    try:
        payload = decode_token(refresh)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="token 类型错误")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="refresh token 无效")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="用户不存在或被禁用")
    # 生成新的 access token
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=refresh,  # refresh 不换,等它过期再说
        expires_in=settings.access_token_expire_minutes * 60,
    )
\`\`\`

\`\`\`bash
# 登录拿 token
curl -X POST http://localhost:8000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","password":"secret123"}'
# 返回 {"access_token":"eyJ...","refresh_token":"eyJ...","token_type":"bearer","expires_in":1800}
\`\`\`

## 十、Demo:角色分配

\`\`\`python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Role, Permission
from app.schemas import UserOut, AssignRoleRequest
from app.deps import get_current_user, require_superuser

router = APIRouter(prefix="/users", tags=["用户管理"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息。"""
    return current_user

@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_superuser)])
def list_users(db: Session = Depends(get_db)):
    """列出所有用户(仅超级管理员)。"""
    return db.query(User).all()

@router.post("/{user_id}/roles", response_model=UserOut, dependencies=[Depends(require_superuser)])
def assign_role(user_id: int, payload: AssignRoleRequest, db: Session = Depends(get_db)):
    """给用户分配角色。"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    # 避免重复分配
    if role not in user.roles:
        user.roles.append(role)
        db.commit()
        db.refresh(user)
    return user

@router.delete("/{user_id}/roles/{role_name}", dependencies=[Depends(require_superuser)])
def revoke_role(user_id: int, role_name: str, db: Session = Depends(get_db)):
    """撤销用户的角色。"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    role = db.query(Role).filter(Role.name == role_name).first()
    if role and role in user.roles:
        user.roles.remove(role)
        db.commit()
    return {"msg": "已撤销"}
\`\`\`

\`\`\`python
# app/routers/roles.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Role, Permission
from app.schemas import RoleCreate, RoleOut, PermissionCreate
from app.deps import require_superuser

router = APIRouter(prefix="/roles", tags=["角色权限管理"])

@router.post("/", response_model=RoleOut, dependencies=[Depends(require_superuser)])
def create_role(payload: RoleCreate, db: Session = Depends(get_db)):
    """创建角色。"""
    if db.query(Role).filter(Role.name == payload.name).first():
        raise HTTPException(status_code=400, detail="角色已存在")
    # 校验父角色
    if payload.parent_id:
        if not db.query(Role).filter(Role.id == payload.parent_id).first():
            raise HTTPException(status_code=400, detail="父角色不存在")
    role = Role(name=payload.name, description=payload.description, parent_id=payload.parent_id)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@router.post("/{role_id}/permissions", response_model=RoleOut, dependencies=[Depends(require_superuser)])
def assign_permission(role_id: int, perm_name: str, db: Session = Depends(get_db)):
    """给角色分配权限。"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    perm = db.query(Permission).filter(Permission.name == perm_name).first()
    if not perm:
        raise HTTPException(status_code=404, detail="权限不存在")
    if perm not in role.permissions:
        role.permissions.append(perm)
        db.commit()
        db.refresh(role)
    return role

@router.post("/permissions", dependencies=[Depends(require_superuser)])
def create_permission(payload: PermissionCreate, db: Session = Depends(get_db)):
    """创建权限。"""
    if db.query(Permission).filter(Permission.name == payload.name).first():
        raise HTTPException(status_code=400, detail="权限已存在")
    perm = Permission(name=payload.name, description=payload.description)
    db.add(perm)
    db.commit()
    return {"id": perm.id, "name": perm.name}
\`\`\`

## 十一、Demo:权限检查(受保护接口)

\`\`\`python
# app/routers/posts.py(示例,展示权限检查)
from fastapi import APIRouter, Depends
from app.deps import require_permission, get_current_user
from app.models import User

router = APIRouter(prefix="/posts", tags=["文章"])

@router.get("/", dependencies=[Depends(require_permission("post:read"))])
def list_posts():
    """读文章:需要 post:read 权限。"""
    return [{"id": 1, "title": "hello"}]

@router.post("/", dependencies=[Depends(require_permission("post:create"))])
def create_post():
    """写文章:需要 post:create 权限。"""
    return {"msg": "已创建"}

@router.delete("/{post_id}", dependencies=[Depends(require_permission("post:delete"))])
def delete_post(post_id: int):
    """删文章:需要 post:delete 权限。"""
    return {"deleted": post_id}
\`\`\`

## 十二、Demo:受保护接口 + 完整权限流程

\`\`\`python
# app/main.py
from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, users, roles
from app.routers import posts

app = FastAPI(title="RBAC 权限系统", version="1.0.0")

# 启动时建表(生产用 Alembic)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# 注册路由
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(posts.router)

@app.get("/")
def root():
    return {"msg": "RBAC 权限系统,访问 /docs 看 API 文档"}

@app.get("/health")
def health():
    """健康检查,公开。"""
    return {"status": "ok"}
\`\`\`

\`\`\`python
# scripts/init_data.py
"""初始化超级管理员和基础权限。"""
from app.database import SessionLocal, engine, Base
from app.models import User, Role, Permission
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# 创建权限
perms_data = [
    ("post:read", "读文章"),
    ("post:create", "写文章"),
    ("post:update", "改文章"),
    ("post:delete", "删文章"),
    ("user:manage", "管理用户"),
    ("role:manage", "管理角色"),
    ("*:*", "所有权限"),
]
for name, desc in perms_data:
    if not db.query(Permission).filter(Permission.name == name).first():
        db.add(Permission(name=name, description=desc))
db.commit()

# 创建角色 + 分配权限
viewer = Role(name="viewer", description="访客")
editor = Role(name="editor", description="编辑")
admin = Role(name="admin", description="管理员")
db.add_all([viewer, editor, admin])
db.commit()

# 角色继承:admin -> editor -> viewer
editor.parent_id = viewer.id
admin.parent_id = editor.id
db.commit()

# 分配权限
viewer.permissions = db.query(Permission).filter(Permission.name.in_(["post:read"])).all()
editor.permissions = db.query(Permission).filter(
    Permission.name.in_(["post:read", "post:create", "post:update"])
).all()
admin.permissions = db.query(Permission).filter(
    Permission.name.in_(["post:delete", "user:manage", "role:manage", "*:*"])
).all()
db.commit()

# 创建超级管理员
if not db.query(User).filter(User.username == "root").first():
    root = User(
        username="root",
        email="root@example.com",
        password_hash=hash_password("root123456"),
        is_superuser=True,
    )
    db.add(root)
    db.commit()
    print("超级管理员:root / root123456")

db.close()
\`\`\`

\`\`\`bash
# 完整流程演示
python scripts/init_data.py

# 1. 用 root 登录拿 token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"root","password":"root123456"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
echo "Token: $TOKEN"

# 2. 访问受保护接口(需要 post:read)
curl -X GET http://localhost:8000/posts/ \\
  -H "Authorization: Bearer $TOKEN"
# 返回 [{"id":1,"title":"hello"}]

# 3. 不带 token 访问
curl -X GET http://localhost:8000/posts/
# 返回 401 未认证

# 4. 注册一个普通用户
curl -X POST http://localhost:8000/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"bob","email":"bob@x.com","password":"bob123"}'

# 5. 用 root 给 bob 分配 editor 角色
curl -X POST http://localhost:8000/users/2/roles \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"role_name":"editor"}'

# 6. bob 登录,可以读和写,但不能删
BOB_TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"bob","password":"bob123"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -X POST http://localhost:8000/posts/ \\
  -H "Authorization: Bearer $BOB_TOKEN"
# 返回 {"msg":"已创建"}

curl -X DELETE http://localhost:8000/posts/1 \\
  -H "Authorization: Bearer $BOB_TOKEN"
# 返回 403 需要 post:delete 权限
\`\`\`

启动服务:\`uvicorn app.main:app --reload\`,访问 http://localhost:8000/docs 看 Swagger 文档。

## 十三、安全最佳实践总结

### 13.1 密码安全

- ✅ 用 bcrypt/argon2 哈希,带盐,慢哈希。
- ✅ 密码强度校验(最少 6 位,推荐大小写+数字+符号)。
- ❌ 不存明文,不存可逆加密。
- ❌ 不用 MD5/SHA1 这种快哈希。

### 13.2 Token 安全

- ✅ Access token 短命(15~30 分钟),Refresh token 长命(7~30 天)。
- ✅ Refresh token 放 HttpOnly Cookie,防 XSS 读取。
- ✅ 登出把 refresh token 加入黑名单(Redis 存到过期)。
- ❌ 别把 JWT 放 localStorage(易被 XSS 偷)。

### 13.3 接口防护

- ✅ 每个**写**接口都做权限检查(读接口也要,按业务需要)。
- ✅ 用依赖注入/装饰器统一处理,避免漏写。
- ✅ 错误信息要模糊(不告诉攻击者「这个用户存在」),但日志要详细。
- ✅ 限流(防暴力登录),如 5 次失败锁定 5 分钟。

### 13.4 防 OWASP Top 10

| 风险 | 防护措施 |
| --- | --- |
| 失效的访问控制 | 每个接口做权限检查,默认拒绝 |
| 加密失败 | HTTPS、密码哈希、密钥管理 |
| 注入 | 用 ORM/参数化查询,不拼 SQL |
| 不安全设计 | 威胁建模、最小权限 |
| 安全配置错误 | 关 debug、设安全头、强密钥 |
| 易受攻击组件 | 定期升级依赖,\`pip-audit\` 查漏洞 |
| 认证失败 | 双 token、限流、MFA |

### 13.5 审计与监控

\`\`\`python
# 简单审计日志中间件示例
from datetime import datetime
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class AuditMiddleware(BaseHTTPMiddleware):
    """记录所有请求,便于事后追溯。"""
    async def dispatch(self, request: Request, call_next):
        # 请求前
        start = datetime.utcnow()
        response = await call_next(request)
        # 请求后
        duration = (datetime.utcnow() - start).total_seconds()
        # 这里写入数据库/日志文件
        print(f"[AUDIT] {request.client.host} {request.method} {request.url.path} "
              f"-> {response.status_code} ({duration:.3f}s)")
        return response

# main.py 里加
# app.add_middleware(AuditMiddleware)
\`\`\`

记录内容:时间、IP、用户、操作、结果、耗时。出问题时能快速定位。

### 13.6 测试

- 单元测试:权限检查函数、密码哈希、JWT 生成。
- 集成测试:注册→登录→分配角色→访问受保护接口。
- 安全测试:越权访问、SQL 注入、XSS、CSRF。

\`\`\`python
# tests/test_auth.py 示例
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    """注册并登录。"""
    client.post("/auth/register", json={
        "username": "testuser", "email": "t@x.com", "password": "pass1234"
    })
    resp = client.post("/auth/login", json={
        "username": "testuser", "password": "pass1234"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()

def test_protected_endpoint_without_token():
    """没 token 访问受保护接口应 401。"""
    resp = client.get("/posts/")
    assert resp.status_code == 401
\`\`\`

运行:\`pytest tests/\`。

## 十四、小结

- FastAPI + SQLAlchemy + Pydantic 三件套:模型/数据/校验分层清晰。
- 双 Token(Access + Refresh)兼顾安全和体验,是 JWT 最佳实践。
- 依赖注入让鉴权逻辑统一且可测试,\`Depends(require_permission("xxx"))\` 一行搞定。
- 角色继承让权限分配更省事,递归检查时注意防循环。
- 超级用户(\`is_superuser\`)绕过权限检查,只在内部管理用,业务接口不要靠它。
- 安全不是一次性的,要持续:限流、审计、依赖升级、漏洞扫描。

至此,一个完整可运行的 RBAC 权限系统就完成了。结合上一章的博客系统,你已经有了一套能跑的 Web 应用骨架——可以继续扩展搜索、富文本、文件上传、WebSocket 通知等功能。
`,
  },
];
