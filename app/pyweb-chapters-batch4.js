// =============================================================
// Python Web 应用开发实战教程 - 第 4 批章节（Flask 进阶 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   flask-blueprint  : Flask 蓝图 Blueprint
//   flask-sqlalchemy : Flask-SQLAlchemy 数据库
//   flask-middleware : Flask 钩子与中间件
//   flask-practice   : Flask 实战：小型博客
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 13 章：Flask 蓝图 Blueprint
  // ============================================================
  {
    id: "flask-blueprint",
    group: "Flask 进阶",
    icon: "📦",
    title: "Flask 蓝图 Blueprint",
    content: `# Flask 蓝图 Blueprint

## 蓝图是什么

Blueprint（蓝图）是 Flask 用来**模块化组织路由**的机制。它把一组相关的路由（比如「用户相关的所有接口」）打包成一个蓝图，然后注册到主应用里。简单说：蓝图是「子应用」，把大项目的路由按功能拆分到不同文件，而不是全堆在一个 app.py 里。

## 为什么需要蓝图

项目小的时候，所有路由写一个文件没问题：

\`\`\`python
app = Flask(__name__)

@app.route("/users")
def users(): ...

@app.route("/posts")
def posts(): ...

@app.route("/comments")
def comments(): ...

# ...几十上百个路由全挤在这里
\`\`\`

项目大了，问题就来了：
- **文件巨大**：一个 app.py 几千行，找路由像大海捞针。
- **职责混乱**：用户、文章、评论的逻辑纠缠在一起。
- **团队冲突**：多人改同一个文件，git 合并冲突不断。
- **难以复用**：想把这个模块用到别的项目，没法整体搬走。

蓝图解决这些：每个功能模块一个文件、一个蓝图，互不干扰。

## 创建蓝图

创建蓝图用 \`Blueprint\` 类：

\`\`\`python
# users.py —— 用户模块
from flask import Blueprint, request, jsonify

# 创建蓝图对象
# 第一个参数是蓝图名（用于 url_for）
# __name__ 帮助定位模块（找模板、静态文件）
users_bp = Blueprint("users", __name__)

# 在蓝图上注册路由，语法和 @app.route 一样
@users_bp.route("/users")
def list_users():
    return jsonify([{"id": 1, "name": "Tom"}])

@users_bp.route("/users/<int:user_id>")
def get_user(user_id):
    return jsonify({"id": user_id, "name": "Tom"})

@users_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    return jsonify({"id": 2, "name": data["name"]}), 201
\`\`\`

注意：蓝图上的路由用 \`@users_bp.route\` 而不是 \`@app.route\`。但语法完全一样。

## 注册蓝图

主应用里注册蓝图：

\`\`\`python
# app.py —— 主应用
from flask import Flask
from users import users_bp
from posts import posts_bp  # 文章蓝图

app = Flask(__name__)

# 注册蓝图
app.register_blueprint(users_bp)
app.register_blueprint(posts_bp)

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

注册后，蓝图里定义的路由就和直接定义在 app 上一样能访问了。

## 蓝图 url_prefix

给蓝图加 URL 前缀，让所有路由自动加前缀：

\`\`\`python
# 在创建时指定
users_bp = Blueprint("users", __name__, url_prefix="/api/v1")

# 或在注册时指定
app.register_blueprint(users_bp, url_prefix="/api/v1")
\`\`\`

这样蓝图里的 \`/users\` 实际路径变成 \`/api/v1/users\`。好处：
- 统一加版本号或前缀，不用每个路由都写。
- 蓝图可以独立开发（路由是 /users），注册时再决定挂哪。

## 蓝图的静态文件和模板

蓝图也能有自己的静态文件和模板目录：

\`\`\`python
admin_bp = Blueprint(
    "admin",
    __name__,
    static_folder="static",      # 蓝图的静态文件目录
    static_url_path="/admin/static",  # 静态文件 URL 前缀
    template_folder="templates",     # 蓝图的模板目录
)
\`\`\`

蓝图找模板时，会先找自己的 \`templates\` 目录，再找主应用的。这使得模块的资源可以自包含。

## 蓝图内的钩子

蓝图可以注册自己的 \`before_request\`、\`after_request\` 等钩子，**只对该蓝图的路由生效**：

\`\`\`python
# admin.py —— 管理员蓝图
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# 这个钩子只对 /admin 下的路由生效
@admin_bp.before_request
def require_admin():
    from flask import session, abort
    # 检查是否是管理员
    if not session.get("is_admin"):
        abort(403)  # 不是管理员，禁止访问

@admin_bp.route("/dashboard")
def dashboard():
    return "管理后台"  # 访问前会先经过 require_admin 检查
\`\`\`

这样每个模块可以有自己的认证、日志逻辑，互不干扰。比如用户模块要登录，文章模块要登录+发帖权限，各自用蓝图钩子实现。

## 代码示例：用户模块和文章模块分离

完整的项目结构示例：

\`\`\`
myapp/
├── app.py              # 主应用
├── blueprints/
│   ├── __init__.py
│   ├── auth.py         # 认证蓝图
│   ├── posts.py        # 文章蓝图
│   └── users.py        # 用户蓝图
└── templates/
\`\`\`

\`blueprints/auth.py\`：

\`\`\`python
from flask import Blueprint, request, session, jsonify

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    # 模拟验证（实际要查数据库、哈希密码）
    if data["username"] == "admin" and data["password"] == "123":
        session["user_id"] = 1
        return jsonify({"msg": "登录成功"})
    return jsonify({"error": "密码错误"}), 401

@auth_bp.route("/logout")
def logout():
    session.clear()
    return jsonify({"msg": "已退出"})

@auth_bp.route("/me")
def me():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "未登录"}), 401
    return jsonify({"id": uid, "name": "admin"})
\`\`\`

\`blueprints/posts.py\`：

\`\`\`python
from flask import Blueprint, request, session, jsonify, abort, url_for

posts_bp = Blueprint("posts", __name__, url_prefix="/posts")

# 模拟数据库
POSTS = {}
next_id = 1

# 文章蓝图自己的钩子：要求登录才能操作
@posts_bp.before_request
def require_login():
    if not session.get("user_id"):
        abort(401, "请先登录")

@posts_bp.route("/", methods=["GET"])
def list_posts():
    return jsonify(list(POSTS.values()))

@posts_bp.route("/", methods=["POST"])
def create_post():
    global next_id
    data = request.get_json()
    post = {
        "id": next_id,
        "title": data["title"],
        "content": data["content"],
        "author": session["user_id"],
    }
    POSTS[next_id] = post
    next_id += 1
    # 用 url_for 生成新文章 URL（注意要加蓝图名前缀）
    location = url_for("posts.get_post", post_id=post["id"])
    response = jsonify(post)
    response.status_code = 201
    response.headers["Location"] = location
    return response

@posts_bp.route("/<int:post_id>")
def get_post(post_id):
    post = POSTS.get(post_id)
    if not post:
        abort(404)
    return jsonify(post)
\`\`\`

\`app.py\`：

\`\`\`python
from flask import Flask
from blueprints.auth import auth_bp
from blueprints.posts import posts_bp

app = Flask(__name__)
app.secret_key = "dev-secret-please-change"

# 注册蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(posts_bp)

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

现在项目结构清晰：认证逻辑在 auth.py，文章逻辑在 posts.py，主应用只负责组装。团队可以各管各的模块。

## url_for 在蓝图里的用法

蓝图里的路由，endpoint 变成 \`蓝图名.函数名\`：

\`\`\`python
# 在 posts 蓝图里
url_for("posts.get_post", post_id=1)  # 生成 /posts/1

# 跨蓝图引用
url_for("auth.login")  # 生成 /auth/login
\`\`\`

记住：**用 url_for 时要带蓝图名前缀**。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 蓝图路由用 @app | @app.route 注册 | 用 @蓝图.route |
| 忘注册蓝图 | 创建了不 register | app.register_blueprint(bp) |
| url_for 没加蓝图名 | url_for("login") | url_for("auth.login") |
| 钩子作用域错 | 以为蓝图钩子全局生效 | 蓝图钩子只对该蓝图生效 |
| url_prefix 重复 | 路由写 /posts 又加 prefix /posts | 二选一，别重复 |

下一章我们看 Flask 怎么连数据库，用 Flask-SQLAlchemy。`
  },

  // ============================================================
  // 第 14 章：Flask-SQLAlchemy 数据库
  // ============================================================
  {
    id: "flask-sqlalchemy",
    group: "Flask 进阶",
    icon: "🗃️",
    title: "Flask-SQLAlchemy 数据库",
    content: `# Flask-SQLAlchemy 数据库

## Flask-SQLAlchemy 是什么

Flask-SQLAlchemy 是 Flask 的 SQLAlchemy 扩展。SQLAlchemy 是 Python 最强大的 ORM（对象关系映射）框架，Flask-SQLAlchemy 把它和 Flask 集成起来——处理配置、连接池、Flask 上下文，让你在 Flask 里用 ORM 更顺手。

简单说：**ORM 让你用 Python 对象操作数据库，不用写 SQL**。

\`\`\`python
# 不用 ORM：手写 SQL
cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
row = cursor.fetchone()

# 用 ORM：操作对象
user = db.session.query(User).get(1)  # 或 User.query.get(1)
print(user.name)
\`\`\`

## 安装

\`\`\`bash
pip install flask flask-sqlalchemy
\`\`\`

## 配置数据库

通过 Flask 配置项指定数据库连接：

\`\`\`python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# 配置数据库 URI
# 格式：dialect+driver://user:password@host:port/database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"  # SQLite
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://user:pass@localhost/mydb"  # MySQL
# app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:pass@localhost/mydb"  # PostgreSQL

# 关闭修改追踪（节省内存，生产建议关）
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)  # 初始化扩展
\`\`\`

常见连接 URI：
- SQLite：\`sqlite:///app.db\`（三个斜杠是相对路径，四个是绝对路径）
- MySQL：\`mysql+pymysql://user:pass@host:3306/dbname\`
- PostgreSQL：\`postgresql://user:pass@host:5432/dbname\`

## 模型定义

模型就是 Python 类，继承 \`db.Model\`，属性对应数据库列：

\`\`\`python
class User(db.Model):
    # __tablename__ 指定表名（不写默认用类名小写）
    __tablename__ = "users"
    
    # db.Column 定义列
    id = db.Column(db.Integer, primary_key=True)  # 主键
    username = db.Column(db.String(80), unique=True, nullable=False)  # 唯一、非空
    email = db.Column(db.String(120), unique=True)
    age = db.Column(db.Integer, default=0)  # 默认值
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 默认函数
    
    def __repr__(self):
        return f"<User {self.username}>"

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    # 外键：关联 users 表的 id
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    # 关系：反向引用（通过 user.posts 访问该用户的所有文章）
    author = db.relationship("User", backref="posts")
\`\`\`

常用列类型：
| 类型 | Python 类型 | 数据库类型 |
|------|-------------|------------|
| db.Integer | int | INT |
| db.String(n) | str | VARCHAR(n) |
| db.Text | str | TEXT |
| db.Float | float | FLOAT |
| db.Boolean | bool | BOOLEAN |
| db.DateTime | datetime | DATETIME |
| db.Text | str | TEXT（长文本） |

常用列参数：
- \`primary_key=True\`：主键
- \`unique=True\`：唯一约束
- \`nullable=False\`：非空
- \`default=value\`：默认值
- \`default=func\`：默认函数（如 datetime.utcnow）
- \`db.ForeignKey(\"表.列\")\`：外键

## 建表

定义模型后，要建表（开发时）：

\`\`\`python
# 在 Flask shell 或代码里
with app.app_context():
    db.create_all()  # 根据所有模型建表
\`\`\`

注意：\`create_all\` 只建不存在的表，**不会修改已存在的表结构**。改了模型后要更新表，得用迁移工具（Flask-Migrate，基于 Alembic）：

\`\`\`bash
pip install flask-migrate
flask db init      # 初始化迁移
flask db migrate   # 生成迁移脚本
flask db upgrade   # 执行迁移
\`\`\`

## CRUD 操作

### Create 创建

\`\`\`python
# 创建对象（还没入库）
user = User(username="tom", email="tom@example.com", age=25)
# 加入会话
db.session.add(user)
# 提交事务（真正写入数据库）
db.session.commit()
# 提交后 user.id 才有值（自增主键）
print(user.id)  # 1

# 批量创建
users = [User(username="a"), User(username="b")]
db.session.add_all(users)
db.session.commit()
\`\`\`

### Read 查询

\`\`\`python
# 按主键查
user = User.query.get(1)  # 返回 None 或对象

# 查所有
users = User.query.all()

# 按条件过滤（filter_by 用关键字，filter 用表达式）
user = User.query.filter_by(username="tom").first()  # 取第一个
users = User.query.filter(User.age >= 18).all()  # 表达式过滤

# 复杂条件
from sqlalchemy import or_, and_
users = User.query.filter(
    and_(User.age >= 18, User.age <= 30)
).all()
users = User.query.filter(
    or_(User.username == "tom", User.username == "jerry")
).all()

# 排序
users = User.query.order_by(User.age.desc()).all()  # 降序

# 限制数量
users = User.query.limit(10).all()

# 组合：分页查询
page = 2
users = User.query.order_by(User.id).offset((page-1)*10).limit(10).all()

# count
count = User.query.filter_by(active=True).count()
\`\`\`

### Update 更新

\`\`\`python
# 方式一：取出再改
user = User.query.get(1)
user.email = "new@example.com"
db.session.commit()  # 提交后才更新

# 方式二：批量更新
User.query.filter_by(active=False).update({"active": True})
db.session.commit()
\`\`\`

### Delete 删除

\`\`\`python
user = User.query.get(1)
db.session.delete(user)
db.session.commit()
\`\`\`

## 关系 db.relationship

模型间的关联用 \`relationship\` 表达：

\`\`\`python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    # 一对多：一个用户有多篇文章
    posts = db.relationship("Post", backref="author", lazy=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
\`\`\`

- \`backref=\"author\"\`：自动给 Post 加一个 \`author\` 属性，访问文章的作者。
- \`lazy=True\`：懒加载，访问 \`user.posts\` 时才查数据库。

使用：

\`\`\`python
# 正向：用户 -> 文章
user = User.query.get(1)
for post in user.posts:  # 访问时触发查询
    print(post.title)

# 反向：文章 -> 作者
post = Post.query.get(1)
print(post.author.username)  # 通过 backref
\`\`\`

## 分页 paginate

Flask-SQLAlchemy 内置分页：

\`\`\`python
@app.route("/users")
def list_users():
    page = request.args.get("page", 1, type=int)
    # per_page 每页条数，error_out 超界是否报错
    pagination = User.query.paginate(page=page, per_page=10, error_out=False)
    
    return jsonify({
        "items": [u.to_dict() for u in pagination.items],  # 当前页数据
        "page": pagination.page,          # 当前页码
        "pages": pagination.pages,        # 总页数
        "total": pagination.total,        # 总记录数
        "has_next": pagination.has_next,  # 有没有下一页
        "has_prev": pagination.has_prev,  # 有没有上一页
    })
\`\`\`

## 为什么用扩展而非原生 SQLAlchemy

| 维度 | 原生 SQLAlchemy | Flask-SQLAlchemy |
|------|-----------------|-------------------|
| 配置 | 自己管连接字符串、引擎 | 从 Flask 配置读 |
| 上下文 | 自己管 session 生命周期 | 自动适配 Flask 上下文 |
| 查询 | session.query(Model) | Model.query（更简洁） |
| 集成 | 要写胶水代码 | 开箱即用 |
| 分页 | 自己实现 | 内置 paginate |

如果你的项目纯用 Flask，Flask-SQLAlchemy 省心。如果项目脱离 Flask（比如命令行工具也用），可以考虑用原生 SQLAlchemy 更解耦。

## 代码示例：用户和文章模型 + CRUD

\`\`\`python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///blog.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# 用户模型
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120))
    # 关系：用户有多篇文章
    posts = db.relationship("Post", backref="author", lazy=True)
    
    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}

# 文章模型
class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "author_id": self.author_id,
            "created_at": self.created_at.isoformat(),
        }

# 建表（开发用，生产用 Flask-Migrate）
with app.app_context():
    db.create_all()

# 创建用户
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = User(username=data["username"], email=data.get("email"))
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

# 用户列表（分页）
@app.route("/api/users", methods=["GET"])
def list_users():
    page = request.args.get("page", 1, type=int)
    pagination = User.query.paginate(page=page, per_page=10, error_out=False)
    return jsonify({
        "items": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
    })

# 创建文章
@app.route("/api/posts", methods=["POST"])
def create_post():
    data = request.get_json()
    # 检查作者存在
    user = User.query.get(data["author_id"])
    if not user:
        return jsonify({"error": "作者不存在"}), 404
    post = Post(title=data["title"], content=data.get("content", ""), 
                author_id=data["author_id"])
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201

# 查文章（带作者信息）
@app.route("/api/posts/<int:post_id>")
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "文章不存在"}), 404
    data = post.to_dict()
    data["author"] = post.author.to_dict()  # 通过关系访问作者
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘 commit | add 后不提交 | add 后必须 db.session.commit() |
| create_all 改表 | 以为改模型就自动改表 | 用 Flask-Migrate 迁移 |
| 懒加载 N+1 | 循环里访问关系触发多次查询 | 用 join 预加载 |
| session 没关 | 长期运行 session 泄漏 | 用完 db.session.remove() |
| 外键写错 | ForeignKey("User.id") | ForeignKey("users.id") 表名 |
| 生产用 SQLite | 多写入并发锁库 | 生产用 MySQL/PostgreSQL |

下一章我们看 Flask 的钩子函数和中间件机制。`
  },

  // ============================================================
  // 第 15 章：Flask 钩子与中间件
  // ============================================================
  {
    id: "flask-middleware",
    group: "Flask 进阶",
    icon: "🔌",
    title: "Flask 钩子与中间件",
    content: `# Flask 钩子与中间件

## Flask 的钩子机制

Flask 提供了一系列「钩子（hook）」，让你在请求的不同阶段插入自己的逻辑——请求前、请求后、出错时、清理时。这是 Flask 实现「横切关注点（cross-cutting concern）」的方式：认证、日志、性能监控这些和具体业务无关但又到处需要的逻辑，用钩子统一处理，不用每个视图都重复写。

## before_request：请求前执行

在**每个请求到达视图函数之前**执行。适合做认证检查、权限校验、日志记录：

\`\`\`python
from flask import request, session, redirect, url_for, g

@app.before_request
def check_login():
    # 白名单：不需要登录的路径
    if request.path in ["/login", "/register", "/static"]:
        return None  # 返回 None 表示继续往下走
    
    # 检查是否登录
    if not session.get("user_id"):
        # 返回非 None 会中断请求，直接返回给客户端
        return redirect(url_for("login"))
    
    # 把当前用户存到 g，视图里能用
    g.user = get_user_by_id(session["user_id"])
\`\`\`

关键点：
- \`before_request\` 函数**返回非 None 值**就会中断请求，直接把返回值当响应发给客户端。
- 返回 None（或不 return）表示继续，进入视图函数。
- 适合：认证、权限、限流、请求日志。

## after_request：请求后执行

在**每个请求处理完之后**（视图返回后）执行。适合加响应头、记录响应日志：

\`\`\`python
@app.after_request
def add_headers(response):
    # 给所有响应加 CORS 头（简化版跨域）
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    # 加安全头
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response  # 必须返回 response 对象
\`\`\`

关键点：
- \`after_request\` 接收一个 \`response\` 参数，必须返回修改后的 response。
- **即使视图抛异常也会执行**（除非是 HTTPException 且没被 errorhandler 捕获）。
- 适合：统一加响应头、CORS、压缩、响应日志。

## teardown_request：请求结束清理

在**请求结束后**执行，**即使发生了异常也会执行**。适合资源清理：

\`\`\`python
@app.teardown_request
def cleanup(exception):
    # exception 不为 None 说明请求处理出错了
    # 无论成功失败，都要关闭数据库连接
    db = getattr(g, "db", None)
    if db is not None:
        db.close()
\`\`\`

和 after_request 的区别：
- \`after_request\`：正常流程执行，能改 response。
- \`teardown_request\`：**一定执行**（即使异常），不能改 response，专门做清理。

记住：**清理资源用 teardown，改响应用 after**。

## errorhandler：错误处理器

注册特定状态码或异常的处理器：

\`\`\`python
# 处理 404
@app.errorhandler(404)
def not_found(error):
    # 返回自定义 404 页面
    return render_template("404.html"), 404

# 处理 500
@app.errorhandler(500)
def server_error(error):
    # 记录错误日志
    app.logger.error(f"服务器错误: {error}")
    return render_template("500.html"), 500

# 处理 403
@app.errorhandler(403)
def forbidden(error):
    return "禁止访问", 403

# 处理特定异常
@app.errorhandler(ValueError)
def handle_value_error(error):
    return jsonify({"error": str(error)}), 400

# 处理所有未捕获的异常
@app.errorhandler(Exception)
def handle_all(error):
    app.logger.exception("未处理异常")
    return jsonify({"error": "服务器内部错误"}), 500
\`\`\`

好处：错误处理逻辑集中，不用每个视图都 try/except。

## before_first_request（已弃用）

\`before_first_request\` 在**第一个请求到来前**执行一次（只执行一次），适合做一次性初始化。

**注意：Flask 2.3+ 已弃用此钩子**，移除是因为多进程部署时它只在每个 worker 各执行一次，行为不可预期。替代方案是用 \`lifespan\` 或在创建 app 时直接初始化：

\`\`\`python
# 替代方案：创建 app 后直接初始化
app = Flask(__name__)
init_database()  # 在这里做初始化，而不是 before_first_request
\`\`\`

## g 对象：请求级共享数据

\`g\` 是一个请求级的命名空间，在**同一个请求内**共享数据：

\`\`\`python
@app.before_request
def load_user():
    # 在请求开始时加载当前用户
    if session.get("user_id"):
        g.user = User.query.get(session["user_id"])

@app.route("/profile")
def profile():
    # 视图里直接取，不用再查一次
    if hasattr(g, "user"):
        return f"欢迎，{g.user.username}"
    return "请登录"
\`\`\`

\`g\` 的生命周期：请求开始创建，请求结束销毁。**不要用全局变量存请求数据**（多线程并发会串数据），用 \`g\`。

## 上下文：应用上下文 vs 请求上下文

Flask 有两种上下文：

**应用上下文（Application Context）：**
- \`current_app\`：当前应用实例。
- \`g\`：请求级共享数据（属于应用上下文）。

**请求上下文（Request Context）：**
- \`request\`：当前请求对象。
- \`session\`：当前会话。

\`\`\`python
from flask import current_app, request, session, g

@app.route("/")
def index():
    # 应用上下文
    print(current_app.config["DEBUG"])  # 读配置
    g.request_id = "abc123"  # 存请求级数据
    
    # 请求上下文
    print(request.method)  # 请求方法
    session["visited"] = True  # 会话数据
    
    return "hello"
\`\`\`

为什么分两层？因为有些场景只有应用上下文没有请求上下文（比如 CLI 命令、后台任务），这时能用 \`current_app\` 和 \`g\`，但不能用 \`request\`。

在视图外用这些对象，要手动推上下文：

\`\`\`python
# 在 Flask shell 或脚本里
with app.app_context():
    # 这里能用 current_app 和 g
    print(current_app.config)

with app.test_request_context("/"):
    # 这里能用 request（模拟一个请求）
    print(request.path)
\`\`\`

## 钩子执行顺序

一个正常请求的执行顺序：

\`\`\`
1. before_request（多个按注册顺序执行）
2. 视图函数
3. after_request（多个按注册逆序执行）
4. teardown_request（多个按注册逆序执行）
\`\`\`

如果 \`before_request\` 返回了非 None 值（中断请求）：

\`\`\`
1. before_request（返回非 None，中断）
2. after_request（仍执行）
3. teardown_request（仍执行）
\`\`\`

如果视图抛异常：

\`\`\`
1. before_request
2. 视图抛异常
3. errorhandler（如果匹配）
4. after_request
5. teardown_request（exception 参数非 None）
\`\`\`

## 代码示例：认证检查 + 错误处理

一个完整的钩子使用示例：

\`\`\`python
from flask import (Flask, request, session, g, jsonify, 
                   redirect, url_for, render_template)
import time

app = Flask(__name__)
app.secret_key = "dev-secret"

# 白名单：不需要登录的路径
PUBLIC_PATHS = {"/login", "/register", "/api/health"}

# 1. 请求前：认证 + 计时
@app.before_request
def before():
    # 记录开始时间
    g.start_time = time.time()
    
    # 健康检查和静态文件跳过
    if request.path.startswith("/static") or request.path in PUBLIC_PATHS:
        return None
    
    # 认证检查
    uid = session.get("user_id")
    if not uid:
        # API 返回 JSON，页面跳转登录
        if request.path.startswith("/api/"):
            return jsonify({"error": "未登录"}), 401
        return redirect(url_for("login"))
    
    # 模拟加载用户
    g.current_user = {"id": uid, "name": "tom"}

# 2. 请求后：加响应头 + 记录耗时
@app.after_request
def after(response):
    # 计算耗时
    elapsed = time.time() - getattr(g, "start_time", time.time())
    response.headers["X-Response-Time"] = f"{elapsed:.4f}s"
    # 加安全头
    response.headers["X-Content-Type-Options"] = "nosniff"
    # 记录访问日志
    app.logger.info(f"{request.method} {request.path} {response.status_code} {elapsed:.4f}s")
    return response

# 3. 请求结束：清理资源
@app.teardown_request
def teardown(exception):
    if exception:
        app.logger.error(f"请求异常: {exception}")
    # 关闭数据库连接（模拟）
    db = getattr(g, "db", None)
    if db:
        db.close()

# 4. 错误处理
@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "资源不存在"}), 404
    return render_template("404.html"), 404

@app.errorhandler(500)
def server_error(error):
    app.logger.exception("服务器错误")
    return jsonify({"error": "服务器内部错误"}), 500

# 视图
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/me")
def me():
    return jsonify(g.current_user)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # 模拟登录
        session["user_id"] = 1
        return redirect(url_for("me"))
    return '<form method="post"><button>登录</button></form>'

@app.route("/me")
def me_page():
    return f"你好，{g.current_user['name']}"

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

这个示例实现了：统一的认证、计时日志、安全响应头、错误处理、资源清理——所有这些不侵入具体视图，靠钩子统一搞定。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 清理用 after | 资源清理放 after_request | 放 teardown_request（必执行） |
| 改响应用 teardown | teardown 改 response | 改响应用 after_request |
| 全局变量存数据 | 全局变量存当前用户 | 用 g 对象 |
| 视图外用 request | CLI 命令里用 request | 手动推 test_request_context |
| after 不返回 | after_request 忘 return response | 必须返回 response |
| 忘注册 errorhandler | 期望自动捕获 | 要 @app.errorhandler 注册 |

下一章我们用学到的所有知识，做一个完整的小型博客项目。`
  },

  // ============================================================
  // 第 16 章：Flask 实战：小型博客
  // ============================================================
  {
    id: "flask-practice",
    group: "Flask 进阶",
    icon: "🛠️",
    title: "Flask 实战：小型博客",
    content: `# Flask 实战：小型博客

## 需求分析

这一章我们把前面学的串起来，做一个完整的小型博客。需求：

1. **文章 CRUD**：发布、查看、编辑、删除文章。
2. **用户登录**：注册、登录、退出，登录后才能发文章。
3. **评论**：登录用户可以给文章评论。
4. **首页**：文章列表，按时间倒序。

用到的知识：路由、模板、Session 认证、Flask-SQLAlchemy 模型、蓝图模块化、密码哈希。

## 项目结构

按蓝图和功能分文件：

\`\`\`
blog/
├── app.py              # 应用工厂 + 启动
├── config.py           # 配置
├── models.py           # 数据库模型
├── blueprints/
│   ├── __init__.py
│   ├── auth.py         # 认证蓝图
│   └── posts.py        # 文章蓝图
└── templates/
    ├── base.html       # 基础模板
    ├── index.html      # 首页
    ├── post.html       # 文章详情
    ├── login.html      # 登录
    └── register.html   # 注册
\`\`\`

这种结构让职责清晰：配置、模型、视图、模板各归各位。

## 配置管理 config.py

把配置集中在配置文件里：

\`\`\`python
# config.py
import os

class Config:
    # 密钥（生产要从环境变量读，别硬编码）
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    # 数据库
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///blog.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # 生产用 MySQL/PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

# 按环境变量选择配置
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
\`\`\`

用环境变量管敏感信息（密钥、数据库密码），**绝不硬编码到代码里**（会进 git 泄漏）。

## 应用工厂 app.py

用「应用工厂」模式创建 app（方便测试和多实例）：

\`\`\`python
# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import config

db = SQLAlchemy()

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    db.init_app(app)
    
    # 注册蓝图
    from blueprints.auth import auth_bp
    from blueprints.posts import posts_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    
    # 建表
    with app.app_context():
        from models import User, Post, Comment
        db.create_all()
    
    return app

# 创建应用实例
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

应用工厂模式：\`create_app()\` 函数创建并返回 app。好处是能传不同配置创建不同 app（测试用一个、生产用一个）。

## 数据库模型 models.py

三个模型：用户、文章、评论。

\`\`\`python
# models.py
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))  # 存哈希，不存明文
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系：用户有多篇文章、多条评论
    posts = db.relationship("Post", backref="author", lazy=True)
    comments = db.relationship("Comment", backref="author", lazy=True)
    
    # 密码哈希：set 时存哈希，check 时验证
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 关系：文章有多条评论
    comments = db.relationship("Comment", backref="post", lazy=True)

class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
\`\`\`

### 密码哈希

**绝对不能明文存密码**。用 \`werkzeug.security\` 的哈希函数：
- \`generate_password_hash(密码)\`：生成哈希（带盐）。
- \`check_password_hash(哈希, 密码)\`：验证密码是否匹配。

哈希是单向的，即使数据库泄漏，攻击者也拿不到明文密码。

## 模板继承 base.html

基础模板，所有页面共享：

\`\`\`html
<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}我的博客{% endblock %}</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        nav { padding: 10px; background: #f0f0f0; margin-bottom: 20px; }
        nav a { margin-right: 15px; }
        .flash { background: #d4edda; padding: 10px; margin: 10px 0; }
        .post { border-bottom: 1px solid #eee; padding: 15px 0; }
    </style>
</head>
<body>
    <nav>
        <a href="{{ url_for('posts.index') }}">首页</a>
        {% if session.get('user_id') %}
            <a href="{{ url_for('posts.create') }}">写文章</a>
            <a href="{{ url_for('auth.logout') }}">退出</a>
        {% else %}
            <a href="{{ url_for('auth.login') }}">登录</a>
            <a href="{{ url_for('auth.register') }}">注册</a>
        {% endif %}
    </nav>
    
    <!-- flash 消息 -->
    {% with messages = get_flashed_messages() %}
        {% if messages %}
            {% for m in messages %}
                <div class="flash">{{ m }}</div>
            {% endfor %}
        {% endif %}
    {% endwith %}
    
    {% block content %}{% endblock %}
</body>
</html>
\`\`\`

## 登录认证蓝图 auth.py

\`\`\`python
# blueprints/auth.py
from flask import (Blueprint, render_template, request, 
                   redirect, url_for, session, flash)
from models import User
from app import db

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            flash("用户名已存在")
            return redirect(url_for("auth.register"))
        # 创建用户（密码哈希存储）
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash("注册成功，请登录")
        return redirect(url_for("auth.login"))
    return render_template("register.html")

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        # 查用户并验证密码
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            # 登录成功，把 user_id 存 session
            session["user_id"] = user.id
            flash("登录成功")
            return redirect(url_for("posts.index"))
        flash("用户名或密码错误")
    return render_template("login.html")

@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("已退出登录")
    return redirect(url_for("posts.index"))
\`\`\`

## 文章蓝图 posts.py

\`\`\`python
# blueprints/posts.py
from flask import (Blueprint, render_template, request, 
                   redirect, url_for, session, flash, abort, g)
from models import User, Post, Comment
from app import db
from functools import wraps

posts_bp = Blueprint("posts", __name__)

# 登录验证装饰器
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user_id"):
            flash("请先登录")
            return redirect(url_for("auth.login"))
        # 加载当前用户到 g
        g.current_user = User.query.get(session["user_id"])
        return f(*args, **kwargs)
    return decorated

# 首页：文章列表
@posts_bp.route("/")
def index():
    # 查所有文章，按时间倒序
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template("index.html", posts=posts)

# 文章详情
@posts_bp.route("/post/<int:post_id>")
def detail(post_id):
    post = Post.query.get_or_404(post_id)  # 不存在直接 404
    return render_template("post.html", post=post)

# 写文章（需登录）
@posts_bp.route("/post/new", methods=["GET", "POST"])
@login_required
def create():
    if request.method == "POST":
        title = request.form.get("title")
        content = request.form.get("content")
        post = Post(title=title, content=content, author_id=g.current_user.id)
        db.session.add(post)
        db.session.commit()
        flash("文章发布成功")
        return redirect(url_for("posts.detail", post_id=post.id))
    return render_template("create.html")

# 发表评论（需登录）
@posts_bp.route("/post/<int:post_id>/comment", methods=["POST"])
@login_required
def comment(post_id):
    content = request.form.get("content")
    c = Comment(content=content, post_id=post_id, author_id=g.current_user.id)
    db.session.add(c)
    db.session.commit()
    return redirect(url_for("posts.detail", post_id=post_id))

# 删除文章（作者才能删）
@posts_bp.route("/post/<int:post_id>/delete", methods=["POST"])
@login_required
def delete(post_id):
    post = Post.query.get_or_404(post_id)
    # 权限检查：只有作者能删
    if post.author_id != g.current_user.id:
        abort(403)
    db.session.delete(post)
    db.session.commit()
    flash("文章已删除")
    return redirect(url_for("posts.index"))
\`\`\`

## 核心模板

\`templates/index.html\`：

\`\`\`html
{% extends "base.html" %}
{% block title %}首页 - 我的博客{% endblock %}
{% block content %}
<h1>最新文章</h1>
{% for post in posts %}
<div class="post">
    <h2><a href="{{ url_for('posts.detail', post_id=post.id) }}">{{ post.title }}</a></h2>
    <p>{{ post.content[:100] }}...</p>
    <small>作者：{{ post.author.username }} | {{ post.created_at.strftime('%Y-%m-%d') }}</small>
</div>
{% else %}
<p>还没有文章，<a href="{{ url_for('posts.create') }}">写第一篇</a></p>
{% endfor %}
{% endblock %}
\`\`\`

\`templates/post.html\`：

\`\`\`html
{% extends "base.html" %}
{% block title %}{{ post.title }}{% endblock %}
{% block content %}
<h1>{{ post.title }}</h1>
<p>作者：{{ post.author.username }} | {{ post.created_at.strftime('%Y-%m-%d %H:%M') }}</p>
<div>{{ post.content }}</div>

<h3>评论</h3>
{% for c in post.comments %}
<div>
    <strong>{{ c.author.username }}</strong>: {{ c.content }}
</div>
{% else %}
<p>暂无评论</p>
{% endfor %}

{% if session.get('user_id') %}
<form method="post" action="{{ url_for('posts.comment', post_id=post.id) }}">
    <textarea name="content" placeholder="写评论"></textarea>
    <button>发表评论</button>
</form>
{% else %}
<p><a href="{{ url_for('auth.login') }}">登录</a>后评论</p>
{% endif %}
{% endblock %}
\`\`\`

## 代码结构概览

回顾这个项目的架构：

1. **config.py**：配置集中管理，环境隔离。
2. **app.py**：应用工厂，创建 app、初始化扩展、注册蓝图。
3. **models.py**：数据模型，含密码哈希、关系定义。
4. **blueprints/auth.py**：认证模块，注册/登录/退出。
5. **blueprints/posts.py**：文章模块，CRUD + 评论。
6. **templates/**：模板，base.html 继承，flash 消息。

每一层职责单一，改一处不影响全局。这就是好架构的目标：**高内聚、低耦合**。

## 部署注意

开发跑起来了，生产部署要注意：

1. **关 debug**：\`app.run(debug=False)\`，或用环境变量控制。
2. **用生产服务器**：用 Gunicorn，别用 \`app.run\`。
   \`\`\`bash
   gunicorn "app:create_app()" --workers 4 --bind 0.0.0.0:8000
   \`\`\`
3. **换数据库**：SQLite 不支持并发写，生产换 MySQL/PostgreSQL。
4. **密钥从环境变量读**：\`SECRET_KEY\` 绝不硬编码。
5. **用迁移管理表结构**：装 Flask-Migrate，别手动改表。
6. **前端加 Nginx**：处理 TLS、静态文件、负载均衡。
7. **密码一定要哈希**：我们用了 \`generate_password_hash\`，正确。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 明文存密码 | password 列存明文 | 存 generate_password_hash |
| 生产用 SQLite | 多人写入锁库 | 换 MySQL/PostgreSQL |
| debug 上生产 | debug=True | debug=False |
| 密钥硬编码 | SECRET_KEY = "xxx" | 从环境变量读 |
| 没权限检查 | 谁都能删别人文章 | 校验 author_id == 当前用户 |
| 忘 commit | add 后不提交 | db.session.commit() |
| 表结构手改 | 直接改数据库 | 用 Flask-Migrate 迁移 |

到这里，Flask 部分告一段落。你已经能独立用 Flask 搭一个带认证、数据库、模板的完整 Web 应用了。后续章节会继续探索 Django、ORM 进阶、REST API 设计、部署实战等主题。`
  },
];
