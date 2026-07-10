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
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/users")
# 定义函数 users，参数: 
def users(): ...

# 装饰器：app.route
@app.route("/posts")
# 定义函数 posts，参数: 
def posts(): ...

# 装饰器：app.route
@app.route("/comments")
# 定义函数 comments，参数: 
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
# 从 flask 导入 Blueprint, request, jsonify
from flask import Blueprint, request, jsonify

# 创建蓝图对象
# 第一个参数是蓝图名（用于 url_for）
# __name__ 帮助定位模块（找模板、静态文件）
# 定义变量 users_bp，赋值为 Blueprint("users", __name__)
users_bp = Blueprint("users", __name__)

# 在蓝图上注册路由，语法和 @app.route 一样
# 装饰器：users_bp.route
@users_bp.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    # 返回 jsonify([{"id": 1, "name": "Tom"}])
    return jsonify([{"id": 1, "name": "Tom"}])

# 装饰器：users_bp.route
@users_bp.route("/users/<int:user_id>")
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 返回 jsonify({"id": user_id, "name": "Tom"})
    return jsonify({"id": user_id, "name": "Tom"})

# 装饰器：users_bp.route
@users_bp.route("/users", methods=["POST"])
# 定义函数 create_user，参数: 
def create_user():
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 返回 jsonify({"id": 2, "name": data["name"]}), 201
    return jsonify({"id": 2, "name": data["name"]}), 201
\`\`\`

注意：蓝图上的路由用 \`@users_bp.route\` 而不是 \`@app.route\`。但语法完全一样。

## 注册蓝图

主应用里注册蓝图：

\`\`\`python
# app.py —— 主应用
# 从 flask 导入 Flask
from flask import Flask
# 从 users 导入 users_bp
from users import users_bp
from posts import posts_bp  # 文章蓝图

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 注册蓝图
# 调用 app.register_blueprint()
app.register_blueprint(users_bp)
# 调用 app.register_blueprint()
app.register_blueprint(posts_bp)

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

注册后，蓝图里定义的路由就和直接定义在 app 上一样能访问了。

## 蓝图 url_prefix

给蓝图加 URL 前缀，让所有路由自动加前缀：

\`\`\`python
# 在创建时指定
# 定义变量 users_bp，赋值为 Blueprint("users", __name__, url_prefix="/api...
users_bp = Blueprint("users", __name__, url_prefix="/api/v1")

# 或在注册时指定
# 调用 app.register_blueprint()
app.register_blueprint(users_bp, url_prefix="/api/v1")
\`\`\`

这样蓝图里的 \`/users\` 实际路径变成 \`/api/v1/users\`。好处：
- 统一加版本号或前缀，不用每个路由都写。
- 蓝图可以独立开发（路由是 /users），注册时再决定挂哪。

## 蓝图的静态文件和模板

蓝图也能有自己的静态文件和模板目录：

\`\`\`python
# 定义变量 admin_bp，赋值为 Blueprint(
admin_bp = Blueprint(
    # "admin",
    "admin",
    # __name__,
    __name__,
    static_folder="static",      # 蓝图的静态文件目录
    static_url_path="/admin/static",  # 静态文件 URL 前缀
    template_folder="templates",     # 蓝图的模板目录
# )
)
\`\`\`

蓝图找模板时，会先找自己的 \`templates\` 目录，再找主应用的。这使得模块的资源可以自包含。

## 蓝图内的钩子

蓝图可以注册自己的 \`before_request\`、\`after_request\` 等钩子，**只对该蓝图的路由生效**：

\`\`\`python
# admin.py —— 管理员蓝图
# 定义变量 admin_bp，赋值为 Blueprint("admin", __name__, url_prefix="/adm...
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# 这个钩子只对 /admin 下的路由生效
# 装饰器：admin_bp.before_request
@admin_bp.before_request
# 定义函数 require_admin，参数: 
def require_admin():
    # 从 flask 导入 session, abort
    from flask import session, abort
    # 检查是否是管理员
    # 条件判断：如果 not session.get("is_admin")
    if not session.get("is_admin"):
        abort(403)  # 不是管理员，禁止访问

# 装饰器：admin_bp.route
@admin_bp.route("/dashboard")
# 定义函数 dashboard，参数: 
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
# 从 flask 导入 Blueprint, request, session, jsonify
from flask import Blueprint, request, session, jsonify

# 定义变量 auth_bp，赋值为 Blueprint("auth", __name__, url_prefix="/auth...
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# 装饰器：auth_bp.route
@auth_bp.route("/login", methods=["POST"])
# 定义函数 login，参数: 
def login():
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 模拟验证（实际要查数据库、哈希密码）
    # 条件判断：如果 data["username"] == "admin" and data["password"] == "123"
    if data["username"] == "admin" and data["password"] == "123":
        # session["user_id"] = 1
        session["user_id"] = 1
        # 返回 jsonify({"msg": "登录成功"})
        return jsonify({"msg": "登录成功"})
    # 返回 jsonify({"error": "密码错误"}), 401
    return jsonify({"error": "密码错误"}), 401

# 装饰器：auth_bp.route
@auth_bp.route("/logout")
# 定义函数 logout，参数: 
def logout():
    # 调用 session.clear()
    session.clear()
    # 返回 jsonify({"msg": "已退出"})
    return jsonify({"msg": "已退出"})

# 装饰器：auth_bp.route
@auth_bp.route("/me")
# 定义函数 me，参数: 
def me():
    # 定义变量 uid，赋值为 session.get("user_id")
    uid = session.get("user_id")
    # 条件判断：如果 not uid
    if not uid:
        # 返回 jsonify({"error": "未登录"}), 401
        return jsonify({"error": "未登录"}), 401
    # 返回 jsonify({"id": uid, "name": "admin"})
    return jsonify({"id": uid, "name": "admin"})
\`\`\`

\`blueprints/posts.py\`：

\`\`\`python
# 从 flask 导入 Blueprint, request, session, jsonify, abort, url_for
from flask import Blueprint, request, session, jsonify, abort, url_for

# 定义变量 posts_bp，赋值为 Blueprint("posts", __name__, url_prefix="/pos...
posts_bp = Blueprint("posts", __name__, url_prefix="/posts")

# 模拟数据库
# 定义字典 POSTS
POSTS = {}
# 定义变量 next_id，赋值为 1
next_id = 1

# 文章蓝图自己的钩子：要求登录才能操作
# 装饰器：posts_bp.before_request
@posts_bp.before_request
# 定义函数 require_login，参数: 
def require_login():
    # 条件判断：如果 not session.get("user_id")
    if not session.get("user_id"):
        # 调用 abort()
        abort(401, "请先登录")

# 装饰器：posts_bp.route
@posts_bp.route("/", methods=["GET"])
# 定义函数 list_posts，参数: 
def list_posts():
    # 返回 jsonify(list(POSTS.values()))
    return jsonify(list(POSTS.values()))

# 装饰器：posts_bp.route
@posts_bp.route("/", methods=["POST"])
# 定义函数 create_post，参数: 
def create_post():
    # global next_id
    global next_id
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义字典 post
    post = {
        # "id": next_id,
        "id": next_id,
        # "title": data["title"],
        "title": data["title"],
        # "content": data["content"],
        "content": data["content"],
        # "author": session["user_id"],
        "author": session["user_id"],
    # }
    }
    # POSTS[next_id] = post
    POSTS[next_id] = post
    # next_id += 1
    next_id += 1
    # 用 url_for 生成新文章 URL（注意要加蓝图名前缀）
    # 定义变量 location，赋值为 url_for("posts.get_post", post_id=post["id"])
    location = url_for("posts.get_post", post_id=post["id"])
    # 定义变量 response，赋值为 jsonify(post)
    response = jsonify(post)
    # response.status_code = 201
    response.status_code = 201
    # response.headers["Location"] = location
    response.headers["Location"] = location
    # 返回 response
    return response

# 装饰器：posts_bp.route
@posts_bp.route("/<int:post_id>")
# 定义函数 get_post，参数: post_id
def get_post(post_id):
    # 定义变量 post，赋值为 POSTS.get(post_id)
    post = POSTS.get(post_id)
    # 条件判断：如果 not post
    if not post:
        # 调用 abort()
        abort(404)
    # 返回 jsonify(post)
    return jsonify(post)
\`\`\`

\`app.py\`：

\`\`\`python
# 从 flask 导入 Flask
from flask import Flask
# 从 blueprints.auth 导入 auth_bp
from blueprints.auth import auth_bp
# 从 blueprints.posts 导入 posts_bp
from blueprints.posts import posts_bp

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret-please-change"
app.secret_key = "dev-secret-please-change"

# 注册蓝图
# 调用 app.register_blueprint()
app.register_blueprint(auth_bp)
# 调用 app.register_blueprint()
app.register_blueprint(posts_bp)

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
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
# 调用 cursor.execute()
cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
# 定义变量 row，赋值为 cursor.fetchone()
row = cursor.fetchone()

# 用 ORM：操作对象
user = db.session.query(User).get(1)  # 或 User.query.get(1)
# 调用 print()
print(user.name)
\`\`\`

## 安装

\`\`\`bash
# 安装 Python 包: flask flask-sqlalchemy
pip install flask flask-sqlalchemy
\`\`\`

## 配置数据库

通过 Flask 配置项指定数据库连接：

\`\`\`python
# 从 flask 导入 Flask
from flask import Flask
# 从 flask_sqlalchemy 导入 SQLAlchemy
from flask_sqlalchemy import SQLAlchemy

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 配置数据库 URI
# 格式：dialect+driver://user:password@host:port/database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"  # SQLite
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://user:pass@localhost/mydb"  # MySQL
# app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:pass@localhost/mydb"  # PostgreSQL

# 关闭修改追踪（节省内存，生产建议关）
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = Fal
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
# 定义类 User，继承 db.Model
class User(db.Model):
    # __tablename__ 指定表名（不写默认用类名小写）
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    
    # db.Column 定义列
    id = db.Column(db.Integer, primary_key=True)  # 主键
    username = db.Column(db.String(80), unique=True, nullable=False)  # 唯一、非空
    # 定义变量 email，赋值为 db.Column(db.String(120), unique=True)
    email = db.Column(db.String(120), unique=True)
    age = db.Column(db.Integer, default=0)  # 默认值
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 默认函数
    
    # 定义函数 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<User {self.username}>"
        return f"<User {self.username}>"

# 定义类 Post，继承 db.Model
class Post(db.Model):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 title，赋值为 db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    # 定义变量 content，赋值为 db.Column(db.Text)
    content = db.Column(db.Text)
    # 外键：关联 users 表的 id
    # 定义变量 author_id，赋值为 db.Column(db.Integer, db.ForeignKey("users.id...
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    # 关系：反向引用（通过 user.posts 访问该用户的所有文章）
    # 定义变量 author，赋值为 db.relationship("User", backref="posts")
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
# 使用上下文管理器 app.app_context()
with app.app_context():
    db.create_all()  # 根据所有模型建表
\`\`\`

注意：\`create_all\` 只建不存在的表，**不会修改已存在的表结构**。改了模型后要更新表，得用迁移工具（Flask-Migrate，基于 Alembic）：

\`\`\`bash
# 安装 Python 包: flask-migrate
pip install flask-migrate
flask db init      # 初始化迁移
flask db migrate   # 生成迁移脚本
flask db upgrade   # 执行迁移
\`\`\`

## CRUD 操作

### Create 创建

\`\`\`python
# 创建对象（还没入库）
# 定义变量 user，赋值为 User(username="tom", email="tom@example.com",...
user = User(username="tom", email="tom@example.com", age=25)
# 加入会话
# 调用 db.session.add()
db.session.add(user)
# 提交事务（真正写入数据库）
# 调用 db.session.commit()
db.session.commit()
# 提交后 user.id 才有值（自增主键）
print(user.id)  # 1

# 批量创建
# 定义列表 users
users = [User(username="a"), User(username="b")]
# 调用 db.session.add_all()
db.session.add_all(users)
# 调用 db.session.commit()
db.session.commit()
\`\`\`

### Read 查询

\`\`\`python
# 按主键查
user = User.query.get(1)  # 返回 None 或对象

# 查所有
# 定义变量 users，赋值为 User.query.all()
users = User.query.all()

# 按条件过滤（filter_by 用关键字，filter 用表达式）
user = User.query.filter_by(username="tom").first()  # 取第一个
users = User.query.filter(User.age >= 18).all()  # 表达式过滤

# 复杂条件
# 从 sqlalchemy 导入 or_, and_
from sqlalchemy import or_, and_
# 定义变量 users，赋值为 User.query.filter(
users = User.query.filter(
    # 调用 and_()
    and_(User.age >= 18, User.age <= 30)
# ).all()
).all()
# 定义变量 users，赋值为 User.query.filter(
users = User.query.filter(
    # 调用 or_()
    or_(User.username == "tom", User.username == "jerry")
# ).all()
).all()

# 排序
users = User.query.order_by(User.age.desc()).all()  # 降序

# 限制数量
# 定义变量 users，赋值为 User.query.limit(10).all()
users = User.query.limit(10).all()

# 组合：分页查询
# 定义变量 page，赋值为 2
page = 2
# 定义变量 users，赋值为 User.query.order_by(User.id).offset((page-1)*...
users = User.query.order_by(User.id).offset((page-1)*10).limit(10).all()

# count
# 定义变量 count，赋值为 User.query.filter_by(active=True).count()
count = User.query.filter_by(active=True).count()
\`\`\`

### Update 更新

\`\`\`python
# 方式一：取出再改
# 定义变量 user，赋值为 User.query.get(1)
user = User.query.get(1)
# user.email = "new@example.com"
user.email = "new@example.com"
db.session.commit()  # 提交后才更新

# 方式二：批量更新
# 调用 User.query.filter_by()
User.query.filter_by(active=False).update({"active": True})
# 调用 db.session.commit()
db.session.commit()
\`\`\`

### Delete 删除

\`\`\`python
# 定义变量 user，赋值为 User.query.get(1)
user = User.query.get(1)
# 调用 db.session.delete()
db.session.delete(user)
# 调用 db.session.commit()
db.session.commit()
\`\`\`

## 关系 db.relationship

模型间的关联用 \`relationship\` 表达：

\`\`\`python
# 定义类 User，继承 db.Model
class User(db.Model):
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 username，赋值为 db.Column(db.String(80))
    username = db.Column(db.String(80))
    # 一对多：一个用户有多篇文章
    # 定义变量 posts，赋值为 db.relationship("Post", backref="author", laz...
    posts = db.relationship("Post", backref="author", lazy=True)

# 定义类 Post，继承 db.Model
class Post(db.Model):
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 title，赋值为 db.Column(db.String(200))
    title = db.Column(db.String(200))
    # 定义变量 author_id，赋值为 db.Column(db.Integer, db.ForeignKey("users.id...
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
\`\`\`

- \`backref=\"author\"\`：自动给 Post 加一个 \`author\` 属性，访问文章的作者。
- \`lazy=True\`：懒加载，访问 \`user.posts\` 时才查数据库。

使用：

\`\`\`python
# 正向：用户 -> 文章
# 定义变量 user，赋值为 User.query.get(1)
user = User.query.get(1)
for post in user.posts:  # 访问时触发查询
    # 调用 print()
    print(post.title)

# 反向：文章 -> 作者
# 定义变量 post，赋值为 Post.query.get(1)
post = Post.query.get(1)
print(post.author.username)  # 通过 backref
\`\`\`

## 分页 paginate

Flask-SQLAlchemy 内置分页：

\`\`\`python
# 装饰器：app.route
@app.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    # 定义变量 page，赋值为 request.args.get("page", 1, type=int)
    page = request.args.get("page", 1, type=int)
    # per_page 每页条数，error_out 超界是否报错
    # 定义变量 pagination，赋值为 User.query.paginate(page=page, per_page=10, e...
    pagination = User.query.paginate(page=page, per_page=10, error_out=False)
    
    # 返回 jsonify({
    return jsonify({
        "items": [u.to_dict() for u in pagination.items],  # 当前页数据
        "page": pagination.page,          # 当前页码
        "pages": pagination.pages,        # 总页数
        "total": pagination.total,        # 总记录数
        "has_next": pagination.has_next,  # 有没有下一页
        "has_prev": pagination.has_prev,  # 有没有上一页
    # })
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
# 从 flask 导入 Flask, request, jsonify
from flask import Flask, request, jsonify
# 从 flask_sqlalchemy 导入 SQLAlchemy
from flask_sqlalchemy import SQLAlchemy
# 从 datetime 导入 datetime
from datetime import datetime

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///blog.db"
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = Fal
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# 定义变量 db，赋值为 SQLAlchemy(app)
db = SQLAlchemy(app)

# 用户模型
# 定义类 User，继承 db.Model
class User(db.Model):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 username，赋值为 db.Column(db.String(80), unique=True, nullabl...
    username = db.Column(db.String(80), unique=True, nullable=False)
    # 定义变量 email，赋值为 db.Column(db.String(120))
    email = db.Column(db.String(120))
    # 关系：用户有多篇文章
    # 定义变量 posts，赋值为 db.relationship("Post", backref="author", laz...
    posts = db.relationship("Post", backref="author", lazy=True)
    
    # 定义函数 to_dict，参数: self
    def to_dict(self):
        # 返回 {"id": self.id, "username": self.username, "email": self.email}
        return {"id": self.id, "username": self.username, "email": self.email}

# 文章模型
# 定义类 Post，继承 db.Model
class Post(db.Model):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 title，赋值为 db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    # 定义变量 content，赋值为 db.Column(db.Text)
    content = db.Column(db.Text)
    # 定义变量 author_id，赋值为 db.Column(db.Integer, db.ForeignKey("users.id...
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    # 定义变量 created_at，赋值为 db.Column(db.DateTime, default=datetime.utcno...
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 定义函数 to_dict，参数: self
    def to_dict(self):
        # 返回 {
        return {
            # "id": self.id,
            "id": self.id,
            # "title": self.title,
            "title": self.title,
            # "content": self.content,
            "content": self.content,
            # "author_id": self.author_id,
            "author_id": self.author_id,
            # "created_at": self.created_at.isoformat(),
            "created_at": self.created_at.isoformat(),
        # }
        }

# 建表（开发用，生产用 Flask-Migrate）
# 使用上下文管理器 app.app_context()
with app.app_context():
    # 调用 db.create_all()
    db.create_all()

# 创建用户
# 装饰器：app.route
@app.route("/api/users", methods=["POST"])
# 定义函数 create_user，参数: 
def create_user():
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义变量 user，赋值为 User(username=data["username"], email=data.ge...
    user = User(username=data["username"], email=data.get("email"))
    # 调用 db.session.add()
    db.session.add(user)
    # 调用 db.session.commit()
    db.session.commit()
    # 返回 jsonify(user.to_dict()), 201
    return jsonify(user.to_dict()), 201

# 用户列表（分页）
# 装饰器：app.route
@app.route("/api/users", methods=["GET"])
# 定义函数 list_users，参数: 
def list_users():
    # 定义变量 page，赋值为 request.args.get("page", 1, type=int)
    page = request.args.get("page", 1, type=int)
    # 定义变量 pagination，赋值为 User.query.paginate(page=page, per_page=10, e...
    pagination = User.query.paginate(page=page, per_page=10, error_out=False)
    # 返回 jsonify({
    return jsonify({
        # "items": [u.to_dict() for u in pagination.items],
        "items": [u.to_dict() for u in pagination.items],
        # "total": pagination.total,
        "total": pagination.total,
        # "pages": pagination.pages,
        "pages": pagination.pages,
    # })
    })

# 创建文章
# 装饰器：app.route
@app.route("/api/posts", methods=["POST"])
# 定义函数 create_post，参数: 
def create_post():
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 检查作者存在
    # 定义变量 user，赋值为 User.query.get(data["author_id"])
    user = User.query.get(data["author_id"])
    # 条件判断：如果 not user
    if not user:
        # 返回 jsonify({"error": "作者不存在"}), 404
        return jsonify({"error": "作者不存在"}), 404
    # 定义变量 post，赋值为 Post(title=data["title"], content=data.get("c...
    post = Post(title=data["title"], content=data.get("content", ""), 
                # 定义变量 author_id，赋值为 data["author_id"])
                author_id=data["author_id"])
    # 调用 db.session.add()
    db.session.add(post)
    # 调用 db.session.commit()
    db.session.commit()
    # 返回 jsonify(post.to_dict()), 201
    return jsonify(post.to_dict()), 201

# 查文章（带作者信息）
# 装饰器：app.route
@app.route("/api/posts/<int:post_id>")
# 定义函数 get_post，参数: post_id
def get_post(post_id):
    # 定义变量 post，赋值为 Post.query.get(post_id)
    post = Post.query.get(post_id)
    # 条件判断：如果 not post
    if not post:
        # 返回 jsonify({"error": "文章不存在"}), 404
        return jsonify({"error": "文章不存在"}), 404
    # 定义变量 data，赋值为 post.to_dict()
    data = post.to_dict()
    data["author"] = post.author.to_dict()  # 通过关系访问作者
    # 返回 jsonify(data)
    return jsonify(data)

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
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
# 从 flask 导入 request, session, redirect, url_for, g
from flask import request, session, redirect, url_for, g

# 装饰器：app.before_request
@app.before_request
# 定义函数 check_login，参数: 
def check_login():
    # 白名单：不需要登录的路径
    # 条件判断：如果 request.path in ["/login", "/register", "/static"]
    if request.path in ["/login", "/register", "/static"]:
        return None  # 返回 None 表示继续往下走
    
    # 检查是否登录
    # 条件判断：如果 not session.get("user_id")
    if not session.get("user_id"):
        # 返回非 None 会中断请求，直接返回给客户端
        # 返回 redirect(url_for("login"))
        return redirect(url_for("login"))
    
    # 把当前用户存到 g，视图里能用
    # g.user = get_user_by_id(session["user_id"])
    g.user = get_user_by_id(session["user_id"])
\`\`\`

关键点：
- \`before_request\` 函数**返回非 None 值**就会中断请求，直接把返回值当响应发给客户端。
- 返回 None（或不 return）表示继续，进入视图函数。
- 适合：认证、权限、限流、请求日志。

## after_request：请求后执行

在**每个请求处理完之后**（视图返回后）执行。适合加响应头、记录响应日志：

\`\`\`python
# 装饰器：app.after_request
@app.after_request
# 定义函数 add_headers，参数: response
def add_headers(response):
    # 给所有响应加 CORS 头（简化版跨域）
    # response.headers["Access-Control-Allow-Origin"] = 
    response.headers["Access-Control-Allow-Origin"] = "*"
    # response.headers["Access-Control-Allow-Headers"] =
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    # 加安全头
    # response.headers["X-Content-Type-Options"] = "nosn
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
# 装饰器：app.teardown_request
@app.teardown_request
# 定义函数 cleanup，参数: exception
def cleanup(exception):
    # exception 不为 None 说明请求处理出错了
    # 无论成功失败，都要关闭数据库连接
    # 定义变量 db，赋值为 getattr(g, "db", None)
    db = getattr(g, "db", None)
    # 条件判断：如果 db is not None
    if db is not None:
        # 调用 db.close()
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
# 装饰器：app.errorhandler
@app.errorhandler(404)
# 定义函数 not_found，参数: error
def not_found(error):
    # 返回自定义 404 页面
    # 返回 render_template("404.html"), 404
    return render_template("404.html"), 404

# 处理 500
# 装饰器：app.errorhandler
@app.errorhandler(500)
# 定义函数 server_error，参数: error
def server_error(error):
    # 记录错误日志
    # 调用 app.logger.error()
    app.logger.error(f"服务器错误: {error}")
    # 返回 render_template("500.html"), 500
    return render_template("500.html"), 500

# 处理 403
# 装饰器：app.errorhandler
@app.errorhandler(403)
# 定义函数 forbidden，参数: error
def forbidden(error):
    # 返回 "禁止访问", 403
    return "禁止访问", 403

# 处理特定异常
# 装饰器：app.errorhandler
@app.errorhandler(ValueError)
# 定义函数 handle_value_error，参数: error
def handle_value_error(error):
    # 返回 jsonify({"error": str(error)}), 400
    return jsonify({"error": str(error)}), 400

# 处理所有未捕获的异常
# 装饰器：app.errorhandler
@app.errorhandler(Exception)
# 定义函数 handle_all，参数: error
def handle_all(error):
    # 调用 app.logger.exception()
    app.logger.exception("未处理异常")
    # 返回 jsonify({"error": "服务器内部错误"}), 500
    return jsonify({"error": "服务器内部错误"}), 500
\`\`\`

好处：错误处理逻辑集中，不用每个视图都 try/except。

## before_first_request（已弃用）

\`before_first_request\` 在**第一个请求到来前**执行一次（只执行一次），适合做一次性初始化。

**注意：Flask 2.3+ 已弃用此钩子**，移除是因为多进程部署时它只在每个 worker 各执行一次，行为不可预期。替代方案是用 \`lifespan\` 或在创建 app 时直接初始化：

\`\`\`python
# 替代方案：创建 app 后直接初始化
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
init_database()  # 在这里做初始化，而不是 before_first_request
\`\`\`

## g 对象：请求级共享数据

\`g\` 是一个请求级的命名空间，在**同一个请求内**共享数据：

\`\`\`python
# 装饰器：app.before_request
@app.before_request
# 定义函数 load_user，参数: 
def load_user():
    # 在请求开始时加载当前用户
    # 条件判断：如果 session.get("user_id")
    if session.get("user_id"):
        # g.user = User.query.get(session["user_id"])
        g.user = User.query.get(session["user_id"])

# 装饰器：app.route
@app.route("/profile")
# 定义函数 profile，参数: 
def profile():
    # 视图里直接取，不用再查一次
    # 条件判断：如果 hasattr(g, "user")
    if hasattr(g, "user"):
        # 返回 f"欢迎，{g.user.username}"
        return f"欢迎，{g.user.username}"
    # 返回 "请登录"
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
# 从 flask 导入 current_app, request, session, g
from flask import current_app, request, session, g

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 应用上下文
    print(current_app.config["DEBUG"])  # 读配置
    g.request_id = "abc123"  # 存请求级数据
    
    # 请求上下文
    print(request.method)  # 请求方法
    session["visited"] = True  # 会话数据
    
    # 返回 "hello"
    return "hello"
\`\`\`

为什么分两层？因为有些场景只有应用上下文没有请求上下文（比如 CLI 命令、后台任务），这时能用 \`current_app\` 和 \`g\`，但不能用 \`request\`。

在视图外用这些对象，要手动推上下文：

\`\`\`python
# 在 Flask shell 或脚本里
# 使用上下文管理器 app.app_context()
with app.app_context():
    # 这里能用 current_app 和 g
    # 调用 print()
    print(current_app.config)

# 使用上下文管理器 app.test_request_context("/")
with app.test_request_context("/"):
    # 这里能用 request（模拟一个请求）
    # 调用 print()
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
# 从 flask 导入（多行）
from flask import (Flask, request, session, g, jsonify, 
                   # redirect, url_for, render_template)
                   redirect, url_for, render_template)
# 导入 time 模块
import time

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 白名单：不需要登录的路径
# 定义字典 PUBLIC_PATHS
PUBLIC_PATHS = {"/login", "/register", "/api/health"}

# 1. 请求前：认证 + 计时
# 装饰器：app.before_request
@app.before_request
# 定义函数 before，参数: 
def before():
    # 记录开始时间
    # g.start_time = time.time()
    g.start_time = time.time()
    
    # 健康检查和静态文件跳过
    # 条件判断：如果 request.path.startswith("/static") or request.path in PUBLIC_PATHS
    if request.path.startswith("/static") or request.path in PUBLIC_PATHS:
        # 返回 None
        return None
    
    # 认证检查
    # 定义变量 uid，赋值为 session.get("user_id")
    uid = session.get("user_id")
    # 条件判断：如果 not uid
    if not uid:
        # API 返回 JSON，页面跳转登录
        # 条件判断：如果 request.path.startswith("/api/")
        if request.path.startswith("/api/"):
            # 返回 jsonify({"error": "未登录"}), 401
            return jsonify({"error": "未登录"}), 401
        # 返回 redirect(url_for("login"))
        return redirect(url_for("login"))
    
    # 模拟加载用户
    # g.current_user = {"id": uid, "name": "tom"}
    g.current_user = {"id": uid, "name": "tom"}

# 2. 请求后：加响应头 + 记录耗时
# 装饰器：app.after_request
@app.after_request
# 定义函数 after，参数: response
def after(response):
    # 计算耗时
    # 定义变量 elapsed，赋值为 time.time() - getattr(g, "start_time", time.t...
    elapsed = time.time() - getattr(g, "start_time", time.time())
    # response.headers["X-Response-Time"] = f"{elapsed:.
    response.headers["X-Response-Time"] = f"{elapsed:.4f}s"
    # 加安全头
    # response.headers["X-Content-Type-Options"] = "nosn
    response.headers["X-Content-Type-Options"] = "nosniff"
    # 记录访问日志
    # 调用 app.logger.info()
    app.logger.info(f"{request.method} {request.path} {response.status_code} {elapsed:.4f}s")
    # 返回 response
    return response

# 3. 请求结束：清理资源
# 装饰器：app.teardown_request
@app.teardown_request
# 定义函数 teardown，参数: exception
def teardown(exception):
    # 条件判断：如果 exception
    if exception:
        # 调用 app.logger.error()
        app.logger.error(f"请求异常: {exception}")
    # 关闭数据库连接（模拟）
    # 定义变量 db，赋值为 getattr(g, "db", None)
    db = getattr(g, "db", None)
    # 条件判断：如果 db
    if db:
        # 调用 db.close()
        db.close()

# 4. 错误处理
# 装饰器：app.errorhandler
@app.errorhandler(404)
# 定义函数 not_found，参数: error
def not_found(error):
    # 条件判断：如果 request.path.startswith("/api/")
    if request.path.startswith("/api/"):
        # 返回 jsonify({"error": "资源不存在"}), 404
        return jsonify({"error": "资源不存在"}), 404
    # 返回 render_template("404.html"), 404
    return render_template("404.html"), 404

# 装饰器：app.errorhandler
@app.errorhandler(500)
# 定义函数 server_error，参数: error
def server_error(error):
    # 调用 app.logger.exception()
    app.logger.exception("服务器错误")
    # 返回 jsonify({"error": "服务器内部错误"}), 500
    return jsonify({"error": "服务器内部错误"}), 500

# 视图
# 装饰器：app.route
@app.route("/api/health")
# 定义函数 health，参数: 
def health():
    # 返回 jsonify({"status": "ok"})
    return jsonify({"status": "ok"})

# 装饰器：app.route
@app.route("/api/me")
# 定义函数 me，参数: 
def me():
    # 返回 jsonify(g.current_user)
    return jsonify(g.current_user)

# 装饰器：app.route
@app.route("/login", methods=["GET", "POST"])
# 定义函数 login，参数: 
def login():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 模拟登录
        # session["user_id"] = 1
        session["user_id"] = 1
        # 返回 redirect(url_for("me"))
        return redirect(url_for("me"))
    # 返回 '<form method="post"><button>登录</button></form>'
    return '<form method="post"><button>登录</button></form>'

# 装饰器：app.route
@app.route("/me")
# 定义函数 me_page，参数: 
def me_page():
    # 返回 f"你好，{g.current_user['name']}"
    return f"你好，{g.current_user['name']}"

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
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
# 导入 os 模块
import os

# 定义类 Config
class Config:
    # 密钥（生产要从环境变量读，别硬编码）
    # 定义变量 SECRET_KEY，赋值为 os.environ.get("SECRET_KEY", "dev-secret-chan...
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    # 数据库
    # 定义变量 SQLALCHEMY_DATABASE_URI，赋值为 os.environ.get("DATABASE_URL", "sqlite:///blo...
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///blog.db")
    # 定义变量 SQLALCHEMY_TRACK_MODIFICATIONS，赋值为 False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# 定义类 DevelopmentConfig，继承 Config
class DevelopmentConfig(Config):
    # 定义变量 DEBUG，赋值为 True
    DEBUG = True

# 定义类 ProductionConfig，继承 Config
class ProductionConfig(Config):
    # 定义变量 DEBUG，赋值为 False
    DEBUG = False
    # 生产用 MySQL/PostgreSQL
    # 定义变量 SQLALCHEMY_DATABASE_URI，赋值为 os.environ.get("DATABASE_URL")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

# 按环境变量选择配置
# 定义字典 config
config = {
    # "development": DevelopmentConfig,
    "development": DevelopmentConfig,
    # "production": ProductionConfig,
    "production": ProductionConfig,
# }
}
\`\`\`

用环境变量管敏感信息（密钥、数据库密码），**绝不硬编码到代码里**（会进 git 泄漏）。

## 应用工厂 app.py

用「应用工厂」模式创建 app（方便测试和多实例）：

\`\`\`python
# app.py
# 从 flask 导入 Flask
from flask import Flask
# 从 flask_sqlalchemy 导入 SQLAlchemy
from flask_sqlalchemy import SQLAlchemy
# 从 config 导入 config
from config import config

# 定义变量 db，赋值为 SQLAlchemy()
db = SQLAlchemy()

# 定义函数 create_app，参数: config_name="development"
def create_app(config_name="development"):
    # 定义变量 app，赋值为 Flask(__name__)
    app = Flask(__name__)
    # 调用 app.config.from_object()
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    # 调用 db.init_app()
    db.init_app(app)
    
    # 注册蓝图
    # 从 blueprints.auth 导入 auth_bp
    from blueprints.auth import auth_bp
    # 从 blueprints.posts 导入 posts_bp
    from blueprints.posts import posts_bp
    # 调用 app.register_blueprint()
    app.register_blueprint(auth_bp)
    # 调用 app.register_blueprint()
    app.register_blueprint(posts_bp)
    
    # 建表
    # 使用上下文管理器 app.app_context()
    with app.app_context():
        # 从 models 导入 User, Post, Comment
        from models import User, Post, Comment
        # 调用 db.create_all()
        db.create_all()
    
    # 返回 app
    return app

# 创建应用实例
# 定义变量 app，赋值为 create_app()
app = create_app()

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

应用工厂模式：\`create_app()\` 函数创建并返回 app。好处是能传不同配置创建不同 app（测试用一个、生产用一个）。

## 数据库模型 models.py

三个模型：用户、文章、评论。

\`\`\`python
# models.py
# 从 app 导入 db
from app import db
# 从 datetime 导入 datetime
from datetime import datetime
# 从 werkzeug.security 导入 generate_password_hash, check_password_hash
from werkzeug.security import generate_password_hash, check_password_hash

# 定义类 User，继承 db.Model
class User(db.Model):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 username，赋值为 db.Column(db.String(80), unique=True, nullabl...
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))  # 存哈希，不存明文
    # 定义变量 created_at，赋值为 db.Column(db.DateTime, default=datetime.utcno...
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系：用户有多篇文章、多条评论
    # 定义变量 posts，赋值为 db.relationship("Post", backref="author", laz...
    posts = db.relationship("Post", backref="author", lazy=True)
    # 定义变量 comments，赋值为 db.relationship("Comment", backref="author", ...
    comments = db.relationship("Comment", backref="author", lazy=True)
    
    # 密码哈希：set 时存哈希，check 时验证
    # 定义函数 set_password，参数: self, password
    def set_password(self, password):
        # self.password_hash = generate_password_hash(passwo
        self.password_hash = generate_password_hash(password)
    
    # 定义函数 check_password，参数: self, password
    def check_password(self, password):
        # 返回 check_password_hash(self.password_hash, password)
        return check_password_hash(self.password_hash, password)

# 定义类 Post，继承 db.Model
class Post(db.Model):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 title，赋值为 db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    # 定义变量 content，赋值为 db.Column(db.Text)
    content = db.Column(db.Text)
    # 定义变量 author_id，赋值为 db.Column(db.Integer, db.ForeignKey("users.id...
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    # 定义变量 created_at，赋值为 db.Column(db.DateTime, default=datetime.utcno...
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 关系：文章有多条评论
    # 定义变量 comments，赋值为 db.relationship("Comment", backref="post", la...
    comments = db.relationship("Comment", backref="post", lazy=True)

# 定义类 Comment，继承 db.Model
class Comment(db.Model):
    # 定义变量 __tablename__，赋值为 "comments"
    __tablename__ = "comments"
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 content，赋值为 db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    # 定义变量 post_id，赋值为 db.Column(db.Integer, db.ForeignKey("posts.id...
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    # 定义变量 author_id，赋值为 db.Column(db.Integer, db.ForeignKey("users.id...
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    # 定义变量 created_at，赋值为 db.Column(db.DateTime, default=datetime.utcno...
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
# <!-- templates/base.html -->
<!-- templates/base.html -->
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh">
<html lang="zh">
# <head>
<head>
    # <meta charset="UTF-8">
    <meta charset="UTF-8">
    # <title>{% block title %}我的博客{% endblock %}</title>
    <title>{% block title %}我的博客{% endblock %}</title>
    # <style>
    <style>
        # body { font-family: sans-serif; max-width: 800px; 
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        # nav { padding: 10px; background: #f0f0f0; margin-b
        nav { padding: 10px; background: #f0f0f0; margin-bottom: 20px; }
        # nav a { margin-right: 15px; }
        nav a { margin-right: 15px; }
        # .flash { background: #d4edda; padding: 10px; margi
        .flash { background: #d4edda; padding: 10px; margin: 10px 0; }
        # .post { border-bottom: 1px solid #eee; padding: 15
        .post { border-bottom: 1px solid #eee; padding: 15px 0; }
    # </style>
    </style>
# </head>
</head>
# <body>
<body>
    # <nav>
    <nav>
        # <a href="{{ url_for('posts.index') }}">首页</a>
        <a href="{{ url_for('posts.index') }}">首页</a>
        # {% if session.get('user_id') %}
        {% if session.get('user_id') %}
            # <a href="{{ url_for('posts.create') }}">写文章</a>
            <a href="{{ url_for('posts.create') }}">写文章</a>
            # <a href="{{ url_for('auth.logout') }}">退出</a>
            <a href="{{ url_for('auth.logout') }}">退出</a>
        # {% else %}
        {% else %}
            # <a href="{{ url_for('auth.login') }}">登录</a>
            <a href="{{ url_for('auth.login') }}">登录</a>
            # <a href="{{ url_for('auth.register') }}">注册</a>
            <a href="{{ url_for('auth.register') }}">注册</a>
        # {% endif %}
        {% endif %}
    # </nav>
    </nav>
    
    # <!-- flash 消息 -->
    <!-- flash 消息 -->
    # {% with messages = get_flashed_messages() %}
    {% with messages = get_flashed_messages() %}
        # {% if messages %}
        {% if messages %}
            # {% for m in messages %}
            {% for m in messages %}
                # <div class="flash">{{ m }}</div>
                <div class="flash">{{ m }}</div>
            # {% endfor %}
            {% endfor %}
        # {% endif %}
        {% endif %}
    # {% endwith %}
    {% endwith %}
    
    # {% block content %}{% endblock %}
    {% block content %}{% endblock %}
# </body>
</body>
# </html>
</html>
\`\`\`

## 登录认证蓝图 auth.py

\`\`\`python
# blueprints/auth.py
# 从 flask 导入（多行）
from flask import (Blueprint, render_template, request, 
                   # redirect, url_for, session, flash)
                   redirect, url_for, session, flash)
# 从 models 导入 User
from models import User
# 从 app 导入 db
from app import db

# 定义变量 auth_bp，赋值为 Blueprint("auth", __name__, url_prefix="/auth...
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# 装饰器：auth_bp.route
@auth_bp.route("/register", methods=["GET", "POST"])
# 定义函数 register，参数: 
def register():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 username，赋值为 request.form.get("username")
        username = request.form.get("username")
        # 定义变量 password，赋值为 request.form.get("password")
        password = request.form.get("password")
        # 检查用户名是否已存在
        # 条件判断：如果 User.query.filter_by(username=username).first()
        if User.query.filter_by(username=username).first():
            # 调用 flash()
            flash("用户名已存在")
            # 返回 redirect(url_for("auth.register"))
            return redirect(url_for("auth.register"))
        # 创建用户（密码哈希存储）
        # 定义变量 user，赋值为 User(username=username)
        user = User(username=username)
        # 调用 user.set_password()
        user.set_password(password)
        # 调用 db.session.add()
        db.session.add(user)
        # 调用 db.session.commit()
        db.session.commit()
        # 调用 flash()
        flash("注册成功，请登录")
        # 返回 redirect(url_for("auth.login"))
        return redirect(url_for("auth.login"))
    # 返回 render_template("register.html")
    return render_template("register.html")

# 装饰器：auth_bp.route
@auth_bp.route("/login", methods=["GET", "POST"])
# 定义函数 login，参数: 
def login():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 username，赋值为 request.form.get("username")
        username = request.form.get("username")
        # 定义变量 password，赋值为 request.form.get("password")
        password = request.form.get("password")
        # 查用户并验证密码
        # 定义变量 user，赋值为 User.query.filter_by(username=username).first...
        user = User.query.filter_by(username=username).first()
        # 条件判断：如果 user and user.check_password(password)
        if user and user.check_password(password):
            # 登录成功，把 user_id 存 session
            # session["user_id"] = user.id
            session["user_id"] = user.id
            # 调用 flash()
            flash("登录成功")
            # 返回 redirect(url_for("posts.index"))
            return redirect(url_for("posts.index"))
        # 调用 flash()
        flash("用户名或密码错误")
    # 返回 render_template("login.html")
    return render_template("login.html")

# 装饰器：auth_bp.route
@auth_bp.route("/logout")
# 定义函数 logout，参数: 
def logout():
    # 调用 session.clear()
    session.clear()
    # 调用 flash()
    flash("已退出登录")
    # 返回 redirect(url_for("posts.index"))
    return redirect(url_for("posts.index"))
\`\`\`

## 文章蓝图 posts.py

\`\`\`python
# blueprints/posts.py
# 从 flask 导入（多行）
from flask import (Blueprint, render_template, request, 
                   # redirect, url_for, session, flash, abort, g)
                   redirect, url_for, session, flash, abort, g)
# 从 models 导入 User, Post, Comment
from models import User, Post, Comment
# 从 app 导入 db
from app import db
# 从 functools 导入 wraps
from functools import wraps

# 定义变量 posts_bp，赋值为 Blueprint("posts", __name__)
posts_bp = Blueprint("posts", __name__)

# 登录验证装饰器
# 定义函数 login_required，参数: f
def login_required(f):
    # 装饰器：wraps
    @wraps(f)
    # 定义函数 decorated，参数: *args, **kwargs
    def decorated(*args, **kwargs):
        # 条件判断：如果 not session.get("user_id")
        if not session.get("user_id"):
            # 调用 flash()
            flash("请先登录")
            # 返回 redirect(url_for("auth.login"))
            return redirect(url_for("auth.login"))
        # 加载当前用户到 g
        # g.current_user = User.query.get(session["user_id"]
        g.current_user = User.query.get(session["user_id"])
        # 返回 f(*args, **kwargs)
        return f(*args, **kwargs)
    # 返回 decorated
    return decorated

# 首页：文章列表
# 装饰器：posts_bp.route
@posts_bp.route("/")
# 定义函数 index，参数: 
def index():
    # 查所有文章，按时间倒序
    # 定义变量 posts，赋值为 Post.query.order_by(Post.created_at.desc()).a...
    posts = Post.query.order_by(Post.created_at.desc()).all()
    # 返回 render_template("index.html", posts=posts)
    return render_template("index.html", posts=posts)

# 文章详情
# 装饰器：posts_bp.route
@posts_bp.route("/post/<int:post_id>")
# 定义函数 detail，参数: post_id
def detail(post_id):
    post = Post.query.get_or_404(post_id)  # 不存在直接 404
    # 返回 render_template("post.html", post=post)
    return render_template("post.html", post=post)

# 写文章（需登录）
# 装饰器：posts_bp.route
@posts_bp.route("/post/new", methods=["GET", "POST"])
# 装饰器：login_required
@login_required
# 定义函数 create，参数: 
def create():
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 title，赋值为 request.form.get("title")
        title = request.form.get("title")
        # 定义变量 content，赋值为 request.form.get("content")
        content = request.form.get("content")
        # 定义变量 post，赋值为 Post(title=title, content=content, author_id=...
        post = Post(title=title, content=content, author_id=g.current_user.id)
        # 调用 db.session.add()
        db.session.add(post)
        # 调用 db.session.commit()
        db.session.commit()
        # 调用 flash()
        flash("文章发布成功")
        # 返回 redirect(url_for("posts.detail", post_id=post.id))
        return redirect(url_for("posts.detail", post_id=post.id))
    # 返回 render_template("create.html")
    return render_template("create.html")

# 发表评论（需登录）
# 装饰器：posts_bp.route
@posts_bp.route("/post/<int:post_id>/comment", methods=["POST"])
# 装饰器：login_required
@login_required
# 定义函数 comment，参数: post_id
def comment(post_id):
    # 定义变量 content，赋值为 request.form.get("content")
    content = request.form.get("content")
    # 定义变量 c，赋值为 Comment(content=content, post_id=post_id, aut...
    c = Comment(content=content, post_id=post_id, author_id=g.current_user.id)
    # 调用 db.session.add()
    db.session.add(c)
    # 调用 db.session.commit()
    db.session.commit()
    # 返回 redirect(url_for("posts.detail", post_id=post_id))
    return redirect(url_for("posts.detail", post_id=post_id))

# 删除文章（作者才能删）
# 装饰器：posts_bp.route
@posts_bp.route("/post/<int:post_id>/delete", methods=["POST"])
# 装饰器：login_required
@login_required
# 定义函数 delete，参数: post_id
def delete(post_id):
    # 定义变量 post，赋值为 Post.query.get_or_404(post_id)
    post = Post.query.get_or_404(post_id)
    # 权限检查：只有作者能删
    # 条件判断：如果 post.author_id != g.current_user.id
    if post.author_id != g.current_user.id:
        # 调用 abort()
        abort(403)
    # 调用 db.session.delete()
    db.session.delete(post)
    # 调用 db.session.commit()
    db.session.commit()
    # 调用 flash()
    flash("文章已删除")
    # 返回 redirect(url_for("posts.index"))
    return redirect(url_for("posts.index"))
\`\`\`

## 核心模板

\`templates/index.html\`：

\`\`\`html
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block title %}首页 - 我的博客{% endblock %}
{% block title %}首页 - 我的博客{% endblock %}
# {% block content %}
{% block content %}
# <h1>最新文章</h1>
<h1>最新文章</h1>
# {% for post in posts %}
{% for post in posts %}
# <div class="post">
<div class="post">
    # <h2><a href="{{ url_for('posts.detail', post_id=po
    <h2><a href="{{ url_for('posts.detail', post_id=post.id) }}">{{ post.title }}</a></h2>
    # <p>{{ post.content[:100] }}...</p>
    <p>{{ post.content[:100] }}...</p>
    # <small>作者：{{ post.author.username }} | {{ post.cre
    <small>作者：{{ post.author.username }} | {{ post.created_at.strftime('%Y-%m-%d') }}</small>
# </div>
</div>
# {% else %}
{% else %}
# <p>还没有文章，<a href="{{ url_for('posts.create') }}">写
<p>还没有文章，<a href="{{ url_for('posts.create') }}">写第一篇</a></p>
# {% endfor %}
{% endfor %}
# {% endblock %}
{% endblock %}
\`\`\`

\`templates/post.html\`：

\`\`\`html
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block title %}{{ post.title }}{% endblock %}
{% block title %}{{ post.title }}{% endblock %}
# {% block content %}
{% block content %}
# <h1>{{ post.title }}</h1>
<h1>{{ post.title }}</h1>
# <p>作者：{{ post.author.username }} | {{ post.created
<p>作者：{{ post.author.username }} | {{ post.created_at.strftime('%Y-%m-%d %H:%M') }}</p>
# <div>{{ post.content }}</div>
<div>{{ post.content }}</div>

# <h3>评论</h3>
<h3>评论</h3>
# {% for c in post.comments %}
{% for c in post.comments %}
# <div>
<div>
    # <strong>{{ c.author.username }}</strong>: {{ c.con
    <strong>{{ c.author.username }}</strong>: {{ c.content }}
# </div>
</div>
# {% else %}
{% else %}
# <p>暂无评论</p>
<p>暂无评论</p>
# {% endfor %}
{% endfor %}

# {% if session.get('user_id') %}
{% if session.get('user_id') %}
# <form method="post" action="{{ url_for('posts.comm
<form method="post" action="{{ url_for('posts.comment', post_id=post.id) }}">
    # <textarea name="content" placeholder="写评论"></texta
    <textarea name="content" placeholder="写评论"></textarea>
    # <button>发表评论</button>
    <button>发表评论</button>
# </form>
</form>
# {% else %}
{% else %}
# <p><a href="{{ url_for('auth.login') }}">登录</a>后评论
<p><a href="{{ url_for('auth.login') }}">登录</a>后评论</p>
# {% endif %}
{% endif %}
# {% endblock %}
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
