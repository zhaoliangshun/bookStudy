// =============================================================
// Python Web 应用开发实战 - 第十五批章节(测试与调试,共 4 章)
// 章节 57-60:Flask 测试 / Django 测试 / Mock 与外部依赖 / 调试技巧与工具
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十七章:Flask 测试
  // =============================================================
  {
    id: 'test-flask',
    group: '测试与调试',
    icon: '🧪',
    title: 'Flask 测试',
    content: `## 第五十七章　Flask 测试

### 57.1 为什么写测试

很多人觉得"接口手动测一下能跑就行",这种想法在项目小的时候没问题,但项目一旦长大立刻翻车:

- **改了 A 接口,不知道有没有把 B 改坏**:只能手动点一遍所有功能,慢又漏;
- **重构没底气**:想优化一段代码却不敢动,因为没有测试保证改完行为不变;
- **回归 bug 反复出现**:今天修好的 bug,下个月又冒出来,因为没人记得当初为什么这么写;
- **新人不敢碰代码**:没测试的代码,改一行都提心吊胆。

> 一句话:**测试不是"证明代码没问题",而是"给未来的自己留一张安全网"**。它的价值在三个月后你回来改代码的那一秒才显现。

### 57.2 Flask test_client()

Flask 自带一个测试客户端 \`app.test_client()\`,它模拟 HTTP 请求**但不走真实网络**:直接在内存里调用你的视图函数,返回响应对象。特点:

- 不用启动服务器;
- 不用占端口;
- 速度快(一次请求就是一次函数调用);
- API 风格和 \`requests\` 几乎一样。

\`\`\`python
from flask import Flask

app = Flask(__name__)

@app.get("/")
def index():
    return {"msg": "hello"}

# 创建测试客户端
client = app.test_client()
response = client.get("/")
print(response.status_code)  # 200
print(response.json)          # {"msg": "hello"}
\`\`\`

### 57.3 各种 HTTP 方法的测试

\`\`\`python
import pytest
from app import app, db

@pytest.fixture
def client():
    """每个测试用例都能拿到一个干净的 client"""
    app.config["TESTING"] = True            # 开启测试模式,报错更友好
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # 内存数据库
    with app.test_client() as client:
        with app.app_context():
            db.create_all()                # 建表
        yield client
        # 测试结束清理
        with app.app_context():
            db.drop_all()

def test_get_user(client):
    # GET 请求
    resp = client.get("/users/1")
    assert resp.status_code == 200
    assert resp.json["id"] == 1

def test_create_user(client):
    # POST 请求,json= 自动设 Content-Type 并序列化
    resp = client.post("/users", json={"name": "老王", "email": "w@x.com"})
    assert resp.status_code == 201
    assert resp.json["name"] == "老王"

def test_update_user(client):
    # PUT 整体更新
    resp = client.put("/users/1", json={"name": "老张", "email": "z@x.com"})
    assert resp.status_code == 200

def test_delete_user(client):
    resp = client.delete("/users/1")
    assert resp.status_code == 204

def test_query_params(client):
    # query 参数用 query_string
    resp = client.get("/users?status=active", query_string={"page": 1})
    assert resp.status_code == 200
\`\`\`

### 57.4 响应断言

\`\`\`python
def test_response_fields(client):
    resp = client.get("/users/1")
    # 状态码
    assert resp.status_code == 200
    # JSON body
    data = resp.get_json()
    assert data["id"] == 1
    assert "name" in data
    # 原始字节(非 JSON 时用)
    assert b"hello" in resp.data
    # 响应头
    assert resp.headers["Content-Type"] == "application/json"
\`\`\`

### 57.5 测试数据库

测试千万不要用生产数据库!两个常用做法:

**做法 1:内存 SQLite**(适合单元测试,快):

\`\`\`python
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
\`\`\`

**做法 2:独立的测试数据库**(更接近生产):

\`\`\`python
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:pass@localhost/test_db"
\`\`\`

每个测试用例前后建表/删表,保证用例之间互不干扰(见上面 fixture 的 \`db.create_all()\` / \`db.drop_all()\`)。

### 57.6 fixture 复用

pytest 的 fixture 把"准备测试环境"的代码抽出来,所有测试共享:

\`\`\`python
import pytest
from app import app, db, User

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # 预置一条数据
            db.session.add(User(name="老王", email="w@x.com"))
            db.session.commit()
        yield client
        db.drop_all()
\`\`\`

### 57.7 测试登录(Session 认证)

测需要登录的接口,要在请求里带 session。Flask test_client 提供了 \`session_transaction()\`:

\`\`\`python
def test_profile_requires_login(client):
    # 未登录访问应跳转或 401
    resp = client.get("/profile")
    assert resp.status_code == 401

def test_profile_after_login(client):
    # 模拟登录:往 session 里塞 user_id
    with client.session_transaction() as sess:
        sess["user_id"] = 1
    # 现在请求带了 session
    resp = client.get("/profile")
    assert resp.status_code == 200
\`\`\`

### 57.8 测试 API(JWT 认证)

测 JWT 保护的 API,流程是:先调登录接口拿 token,再在后续请求的 Authorization 头带上:

\`\`\`python
def test_get_jwt_protected_api(client):
    # 1. 登录拿 token
    resp = client.post("/auth/login", json={"username": "老王", "password": "123456"})
    token = resp.json["access_token"]

    # 2. 带 token 访问受保护接口
    resp = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {token}"},  # 注意 f-string 没有 $
    )
    assert resp.status_code == 200
    assert resp.json["username"] == "老王"

def test_no_token_returns_401(client):
    # 不带 token 访问受保护接口
    resp = client.get("/api/me")
    assert resp.status_code == 401
\`\`\`

> 注意上面的 \`f"Bearer {token}"\` 是 Python f-string,**花括号前没有 \`$\`**,不会和 JS 模板字符串冲突。Python f-string 永远是 \`{var}\` 不带 \`$\`。

### 57.9 覆盖率(pytest-cov)

\`pytest-cov\` 测你的测试跑过了多少行代码:

\`\`\`bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing
\`\`\`

输出形如:

\`\`\`text
Name         Stmts   Miss  Cover
--------------------------------
app.py          50      5    90%
auth.py         30      8    73%
--------------------------------
TOTAL           80     13    84%
\`\`\`

\`--cov-report=html\` 会生成一个网页,逐行标红哪些没覆盖到,定位很方便。设下限守住:\`--cov-fail-under=80\`。

### 57.10 完整示例:Flask 用户 API 测试

下面是一个完整的 Flask + SQLAlchemy 用户 API 加测试:

\`\`\`python
# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True)

@app.get("/users/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "not found"}), 404
    return jsonify({"id": user.id, "name": user.name})

@app.post("/users")
def create_user():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "name 必填"}), 400
    user = User(name=data["name"], email=data.get("email"))
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name}), 201


# tests/test_user_api.py
import pytest
from app import app, db, User

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_create_user_success(client):
    resp = client.post("/users", json={"name": "老王", "email": "w@x.com"})
    assert resp.status_code == 201
    assert resp.json["name"] == "老王"

def test_create_user_missing_name(client):
    resp = client.post("/users", json={"email": "w@x.com"})
    assert resp.status_code == 400

def test_get_user_not_found(client):
    resp = client.get("/users/999")
    assert resp.status_code == 404

def test_get_user_after_create(client):
    # 先创建,再查
    create_resp = client.post("/users", json={"name": "老王"})
    user_id = create_resp.json["id"]
    resp = client.get(f"/users/{user_id}")
    assert resp.status_code == 200
    assert resp.json["name"] == "老王"
\`\`\`

运行:\`pytest tests/\`,全绿就说明 API 行为符合预期。

### 57.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 测试用生产数据库 | 测试数据污染生产 | 用内存 SQLite 或独立测试库 |
| 测试用例之间共享数据 | 用例相互影响,顺序敏感 | 每个用例前后清理表 |
| 没设 \`TESTING=True\` | 报错页不友好,异常被吞 | fixture 里设上 |
| 测 JWT 不带 Authorization 头 | 总是 401 | 先登录拿 token 再带上 |
| 测覆盖率只看百分比 | 漏关键路径 | 看哪些行没覆盖,补边界用例 |
| \`client.get\` 传 body | GET 不该有 body | GET 用 query_string |

> **本章小结**:Flask 用 \`app.test_client()\` 模拟请求,内存 SQLite 隔离测试数据,fixture 复用环境准备,JWT 测试先登录再带 token。pytest-cov 看覆盖率,守住下限。下一章讲 Django 的测试体系。`,
  },

  // =============================================================
  // 第五十八章:Django 测试
  // =============================================================
  {
    id: 'test-django',
    group: '测试与调试',
    icon: '🎯',
    title: 'Django 测试',
    content: `## 第五十八章　Django 测试

### 58.1 Django 自带测试体系

Django 不需要装额外测试框架——它自带了基于 \`unittest\` 的测试体系和专属的 \`TestCase\`:

- \`django.test.TestCase\`:Django 增强版,自动用事务隔离测试数据;
- \`django.test.Client\`:类似 Flask test_client,模拟请求;
- 一堆断言方法:\`assertTemplateUsed\`、\`assertRedirects\` 等。

测试文件放在每个 app 的 \`tests.py\`(或 \`tests/\` 目录下多个文件),\`python manage.py test\` 自动发现并运行。

### 58.2 Django TestCase

\`\`\`python
from django.test import TestCase
from .models import Post

class PostModelTest(TestCase):
    """测试模型"""

    def setUp(self):
        """每个测试方法前自动调用,准备数据"""
        Post.objects.create(title="第一条", content="hello")

    def test_post_has_title(self):
        post = Post.objects.get(title="第一条")
        self.assertEqual(post.content, "hello")

    def test_post_str(self):
        post = Post.objects.first()
        self.assertEqual(str(post), "第一条")
\`\`\`

> \`TestCase\` 的关键特性:**每个测试方法包在一个数据库事务里,方法结束自动回滚**。所以上一个方法创建的数据,下一个方法看不见,完全隔离。

### 58.3 Client 测试客户端

\`django.test.Client\` 模拟发请求,响应对象有 \`status_code\`、\`json()\`、\`content\` 等:

\`\`\`python
from django.test import TestCase, Client

class PostViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_list_posts(self):
        resp = self.client.get("/posts/")
        self.assertEqual(resp.status_code, 200)

    def test_create_post(self):
        resp = self.client.post(
            "/posts/new/",
            {"title": "新文章", "content": "正文"},
        )
        # 表单提交后通常重定向
        self.assertEqual(resp.status_code, 302)
\`\`\`

> \`TestCase\` 子类可以直接用 \`self.client\`,不用手动 new:\`self.client = Client()\` 都省了。

### 58.4 各种断言方法

Django 提供一堆专用断言,测试 Web 场景很方便:

\`\`\`python
from django.test import TestCase

class MyTest(TestCase):
    def test_assertions(self):
        resp = self.client.get("/posts/1/")

        # 1. 检查用了哪个模板
        self.assertTemplateUsed(resp, "posts/detail.html")

        # 2. 检查重定向
        self.assertRedirects(resp, "/posts/")

        # 3. 检查上下文变量(视图传给模板的 context)
        self.assertEqual(resp.context["post"].title, "REST 入门")

        # 4. 检查查询集
        from .models import Post
        self.assertQuerysetEqual(
            Post.objects.all(),
            ["<Post: REST 入门>"],  # 期望的字符串表示
            transform=str,
        )

        # 5. 检查表单错误
        resp = self.client.post("/posts/new/", {"title": ""})
        self.assertFormError(resp.context["form"], "title", "这个字段是必填项")
\`\`\`

### 58.5 测试数据库

Django 测试时**自动**:
1. 创建一个叫 \`test_<原数据库名>\` 的数据库;
2. 跑完所有测试后销毁。

你什么都不用配,迁移会自动应用。这也是为什么 Django 测试比 Flask "省心":数据库隔离是内建的。

\`\`\`python
# settings.py 里可以单独配测试数据库
if "test" in sys.argv:
    DATABASES["default"]["NAME"] = "test_myapp"
\`\`\`

### 58.6 fixture(loaddata)

要预置一些数据(比如测试用户),用 \`fixture\`:把数据导出成 JSON,\`setUp\` 里加载。

\`\`\`bash
# 导出现有数据为 fixture
python manage.py dumpdata auth.User --indent 2 > users.json
\`\`\`

\`\`\`json
[
  {"model": "auth.user", "pk": 1, "fields": {"username": "laowang", "is_staff": true}}
]
\`\`\`

\`\`\`python
class MyTest(TestCase):
    fixtures = ["users.json"]  # 测试前自动加载这个 fixture

    def test_login(self):
        # 这里数据库里已经有 laowang 这个用户
        resp = self.client.post("/login/", {"username": "laowang", "password": "..."})
\`\`\`

### 58.7 测试用户和登录

\`\`\`python
from django.contrib.auth.models import User
from django.test import TestCase

class ProfileViewTest(TestCase):
    def setUp(self):
        # 创建一个测试用户(密码明文,只测试用)
        self.user = User.objects.create_user(
            username="laowang", password="test12345"
        )

    def test_profile_requires_login(self):
        # 未登录访问重定向到登录页
        resp = self.client.get("/profile/")
        self.assertRedirects(resp, "/accounts/login/?next=/profile/")

    def test_profile_after_login(self):
        # 用 Client 模拟登录
        self.client.login(username="laowang", password="test12345")
        resp = self.client.get("/profile/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "laowang")
\`\`\`

### 58.8 测试表单

\`\`\`python
from django.test import TestCase
from .forms import PostForm

class PostFormTest(TestCase):
    def test_valid_form(self):
        form = PostForm(data={"title": "标题", "content": "正文"})
        self.assertTrue(form.is_valid())

    def test_title_required(self):
        form = PostForm(data={"title": "", "content": "正文"})
        self.assertFalse(form.is_valid())
        self.assertIn("title", form.errors)

    def test_title_too_long(self):
        form = PostForm(data={"title": "x" * 300, "content": "正文"})
        self.assertFalse(form.is_valid())
\`\`\`

### 58.9 测试模型

\`\`\`python
class PostModelTest(TestCase):
    def setUp(self):
        self.author = User.objects.create_user(username="w", password="x")
        self.post = Post.objects.create(
            title="标题", content="内容", author=self.author
        )

    def test_default_status(self):
        # 新文章默认状态是 draft
        self.assertEqual(self.post.status, "draft")

    def test_publish(self):
        self.post.publish()  # 调用模型方法
        self.assertEqual(self.post.status, "published")
        self.assertIsNotNone(self.post.published_at)

    def test_str(self):
        self.assertEqual(str(self.post), "标题")

    def test_can_comment(self):
        # 测试关系是否正确建立
        Comment.objects.create(post=self.post, author=self.author, text="不错")
        self.assertEqual(self.post.comments.count(), 1)
\`\`\`

### 58.10 完整示例:博客 CRUD 测试

\`\`\`python
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Post

class BlogCRUDTest(TestCase):
    def setUp(self):
        # 准备一个登录用户
        self.user = User.objects.create_user("laowang", password="123")
        self.client.login(username="laowang", password="123")

    # ===== 创建 =====
    def test_create_post(self):
        resp = self.client.post("/posts/new/", {
            "title": "REST 入门",
            "content": "REST 是资源状态转移",
        })
        # 创建后重定向到详情页
        self.assertEqual(resp.status_code, 302)
        # 数据库里有这条记录
        self.assertTrue(Post.objects.filter(title="REST 入门").exists())

    # ===== 查询列表 =====
    def test_list_posts(self):
        Post.objects.create(title="A", content="a", author=self.user)
        Post.objects.create(title="B", content="b", author=self.user)
        resp = self.client.get("/posts/")
        self.assertEqual(resp.status_code, 200)
        # 模板里应该有 2 篇文章
        self.assertEqual(len(resp.context["posts"]), 2)

    # ===== 查询详情 =====
    def test_detail_post(self):
        post = Post.objects.create(title="X", content="x", author=self.user)
        resp = self.client.get(f"/posts/{post.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "posts/detail.html")
        self.assertEqual(resp.context["post"].title, "X")

    # ===== 更新 =====
    def test_update_post(self):
        post = Post.objects.create(title="原标题", content="x", author=self.user)
        resp = self.client.post(f"/posts/{post.id}/edit/", {
            "title": "新标题",
            "content": "x",
        })
        post.refresh_from_db()  # 重新从数据库读
        self.assertEqual(post.title, "新标题")

    # ===== 删除 =====
    def test_delete_post(self):
        post = Post.objects.create(title="待删", content="x", author=self.user)
        resp = self.client.post(f"/posts/{post.id}/delete/")
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(Post.objects.filter(id=post.id).exists())

    # ===== 权限 =====
    def test_anonymous_cannot_create(self):
        self.client.logout()
        resp = self.client.get("/posts/new/")
        # 未登录应该重定向到登录页
        self.assertEqual(resp.status_code, 302)
\`\`\`

运行:\`python manage.py test\`,会自动发现所有 \`tests.py\` 并跑。

### 58.11 Django 测试最佳实践

- **每个测试方法只测一件事**:出错时容易定位;
- **用 \`setUp\` 准备共用数据**,不要每个方法重复建数据;
- **测视图、模型、表单分开**:用不同的 TestCase 子类;
- **测试目录化**:测试多了拆成 \`tests/\` 包,内部分 \`test_models.py\`、\`test_views.py\`;
- **用 \`pytest-django\` 替代原生 runner**:断言用 \`assert\` 比 \`self.assertEqual\` 简洁。

### 58.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 测试方法之间数据干扰 | 用例顺序敏感 | TestCase 自动回滚,别用 TransactionTestCase 除非必要 |
| 直接 \`User.objects.create\` 设密码 | 登录失败 | 用 \`create_user\` 才会哈希密码 |
| 测登录用 \`client.get\` 而不是 \`client.login\` | 慢且易出错 | 用 \`client.login()\` 模拟会话 |
| \`assertQuerysetEqual\` 不传 \`transform\` | 比较失败 | 默认按 \`repr\` 比较,记得转 |
| 测试里改了对象没 \`refresh_from_db\` | 看不到更新 | 改完从数据库重新读 |
| 测了模板和 context,没测业务逻辑 | 测了皮没测肉 | 重点测模型方法、视图副作用 |

> **本章小结**:Django 自带 \`TestCase\` 自动隔离数据库,\`Client\` 模拟请求,专用断言测模板/重定向/上下文/表单。模型、视图、表单分文件测,优先测业务逻辑。下一章讲怎么 Mock 外部依赖,让测试不依赖第三方服务。`,
  },

  // =============================================================
  // 第五十九章:Mock 与外部依赖
  // =============================================================
  {
    id: 'test-mock',
    group: '测试与调试',
    icon: '🎭',
    title: 'Mock 与外部依赖',
    content: `## 第五十九章　Mock 与外部依赖

### 59.1 为什么要 Mock

真实项目里,你的代码会依赖一堆外部服务:
- 第三方 API(支付宝、微信、GitHub 登录);
- 邮件发送(SMTP);
- 文件系统(上传到 OSS);
- 数据库、缓存、消息队列。

测试时如果真的去调这些,会出大问题:
- **慢**:一次网络请求几百毫秒,跑一遍测试要几分钟;
- **不稳定**:第三方服务一抖动,测试就红,但代码没问题;
- **费钱**:发短信、调付费 API 要花钱;
- **不可控**:你没法让它返回"余额不足"这种特定错误来测你的容错逻辑。

**Mock(模拟)** 就是:测试时用"假对象"替换"真依赖",让它返回你指定的值,让测试**快、稳、免费、可控**。

### 59.2 unittest.mock.patch

Python 标准库 \`unittest.mock\` 提供 \`patch\`,可以临时把一个对象替换成 MagicMock:

\`\`\`python
from unittest.mock import patch

# 被测代码调用了 requests.get
import requests

def get_user_name(user_id):
    resp = requests.get(f"https://api.example.com/users/{user_id}")
    return resp.json()["name"]

# 测试:不真的发请求
@patch("myapp.requests.get")
def test_get_user_name(mock_get):
    # 设置 mock 的返回值
    mock_get.return_value.json.return_value = {"name": "老王"}

    name = get_user_name(1)
    assert name == "老王"
    # 还能断言 mock 被调用过,且参数正确
    mock_get.assert_called_once_with("https://api.example.com/users/1")
\`\`\`

> 关键:\`@patch("myapp.requests.get")\` 不是 patch \`requests\` 模块,而是 patch \`myapp\` 模块里那个 \`requests.get\` 引用。要 patch"被测代码用的那个引用",不是定义处。

### 59.3 MagicMock

\`MagicMock\` 是个"万能替身":你访问任何属性、调用任何方法,它都不会报错,默认返回另一个 MagicMock。

\`\`\`python
from unittest.mock import MagicMock

mock = MagicMock()
# 任意属性访问都不报错
mock.anything.return_value = 42
mock.anything()  # 返回 42

# 配置方法返回值
mock.get_user.return_value = {"id": 1, "name": "老王"}

# 配置方法抛异常(测容错)
mock.send.side_effect = ConnectionError("网络断了")
\`\`\`

\`return_value\` 设返回值,\`side_effect\` 设副作用(抛异常、按顺序返回不同值)。

### 59.4 Mock requests.get 响应

最常见的场景:Mock 一个 HTTP 调用:

\`\`\`python
from unittest.mock import patch, MagicMock

def test_fetch_post(client):
    # 模拟 requests.get 返回的响应对象
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"title": "REST 入门"}

    with patch("myapp.views.requests.get", return_value=mock_resp):
        resp = client.get("/sync-post/1")
    assert resp.status_code == 200
    assert resp.json["title"] == "REST 入门"

def test_fetch_post_timeout(client):
    # 测超时容错
    with patch("myapp.views.requests.get", side_effect=TimeoutError("超时")):
        resp = client.get("/sync-post/1")
    assert resp.status_code == 502
\`\`\`

### 59.5 Mock 邮件发送

发邮件的代码测试时绝对不能真发。Mock 掉发送函数:

\`\`\`python
from unittest.mock import patch
from myapp.emails import send_welcome_email

@patch("myapp.emails.send_mail")
def test_register_sends_email(mock_send_mail):
    # 注册时应该触发一封欢迎邮件
    client.post("/register", json={"email": "w@x.com", "name": "老王"})

    # 断言 send_mail 被调用过
    assert mock_send_mail.called
    # 检查参数
    args, kwargs = mock_send_mail.call_args
    assert "w@x.com" in kwargs["recipient_list"]
    assert "欢迎" in kwargs["subject"]
\`\`\`

### 59.6 Mock 文件系统

写文件、读文件的操作,测试时不想真的写磁盘,可以 patch 掉 \`open\`:

\`\`\`python
from unittest.mock import patch, mock_open

@patch("builtins.open", new_callable=mock_open, read_data='{"name":"老王"}')
def test_read_config(mock_file):
    config = read_config("config.json")
    assert config["name"] == "老王"
\`\`\`

### 59.7 Mock 数据库

更常见的做法是用测试数据库(见前两章)。但偶尔要 Mock 某个查询返回特定结果:

\`\`\`python
from unittest.mock import patch

@patch("myapp.views.User.query")
def test_get_user(mock_query):
    mock_query.get.return_value = None  # 模拟用户不存在
    resp = client.get("/users/999")
    assert resp.status_code == 404
\`\`\`

> 注意:Mock ORM 容易让测试脱离真实行为,优先用真数据库测,只在无法构造特殊状态时用 Mock。

### 59.8 Flask app.test_client + Mock

Flask 测试客户端 + Mock,组合用最常见:

\`\`\`python
import pytest
from unittest.mock import patch
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_pay(client):
    # Mock 支付网关的调用
    with patch("myapp.views.call_payment_gateway") as mock_pay:
        mock_pay.return_value = {"status": "success", "trade_no": "T001"}
        resp = client.post("/pay", json={"amount": 100})
    assert resp.status_code == 200
    assert resp.json["trade_no"] == "T001"
\`\`\`

### 59.9 Django override_settings

Django 测试常要改某个 settings(比如关掉发邮件、换缓存),用 \`override_settings\`:

\`\`\`python
from django.test import TestCase, override_settings

class EmailTest(TestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_send_email_goes_to_memory(self):
        # 邮件不发出去,只放在内存里(测试专用后端)
        from django.core import mail
        send_welcome_email("w@x.com")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["w@x.com"])

    @override_settings(DEBUG=False)
    def test_production_mode(self):
        # 模拟生产环境配置跑某个逻辑
        pass
\`\`\`

### 59.10 测试隔离

Mock 容易"污染"全局状态,要保证测试之间互不影响:
- **用 \`with patch(...):\` 上下文管理器**,出了块自动恢复;
- **每个测试方法独立 setup**,不依赖别的测试;
- **mock 对象别跨测试共享**,在 fixture 里每次新建;
- **测完检查 mock 调用次数**,\`assert_called_once\` 防止被多调。

### 59.11 完整示例:Mock 第三方支付 API

下面是一个完整的"调支付 API 但测试时不真调"的例子:

\`\`\`python
# payment.py —— 被测代码
import requests

class PaymentService:
    GATEWAY = "https://api.pay.com/charge"

    def charge(self, user_id, amount):
        """调支付网关扣款"""
        resp = requests.post(self.GATEWAY, json={"user_id": user_id, "amount": amount})
        data = resp.json()
        if data["status"] != "success":
            raise PaymentError("支付失败")
        return data["trade_no"]


# tests/test_payment.py
import pytest
from unittest.mock import patch, MagicMock
from myapp.payment import PaymentService, PaymentError

@pytest.fixture
def service():
    return PaymentService()

def test_charge_success(service):
    # 1. 构造 mock 响应
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"status": "success", "trade_no": "T100"}
    # 2. patch requests.post
    with patch("myapp.payment.requests.post", return_value=mock_resp) as mock_post:
        # 3. 调被测方法
        trade_no = service.charge(user_id=1, amount=100)

    assert trade_no == "T100"
    # 4. 验证 mock 被正确调用
    mock_post.assert_called_once_with(
        "https://api.pay.com/charge",
        json={"user_id": 1, "amount": 100},
    )

def test_charge_failure_raises(service):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"status": "failed"}
    with patch("myapp.payment.requests.post", return_value=mock_resp):
        # 支付失败应该抛异常
        with pytest.raises(PaymentError):
            service.charge(user_id=1, amount=100)

def test_charge_timeout(service):
    # 模拟超时
    with patch("myapp.payment.requests.post", side_effect=TimeoutError("超时")):
        with pytest.raises(TimeoutError):
            service.charge(user_id=1, amount=100)
\`\`\`

三个测试覆盖了"成功、失败、超时"三种状态,完全不碰真实支付网关,**快、稳、免费、可控**。

### 59.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| patch 错路径(定义处而非使用处) | Mock 不生效,真去调外部 | patch"被测模块里那个引用" |
| 用 Mock 替代不该替代的东西 | 测了 Mock 没测代码 | 优先测真业务逻辑,只 Mock 外部依赖 |
| Mock 没设 \`return_value\` | 返回 MagicMock,断言奇怪 | 显式配 \`return_value\` |
| 不验证 mock 调用参数 | 调错了也通过 | 加 \`assert_called_with\` |
| Mock 跨用例共享 | 用例间状态污染 | 每次新建,用 \`with\` 自动恢复 |
| Django 测试用真 SMTP 发邮件 | 真的给用户发邮件 | 用 locmem 邮件后端 |

> **本章小结**:Mock 让测试不依赖外部服务,核心是 \`unittest.mock.patch\` + \`MagicMock\`。原则:**只 Mock 外部依赖,不 Mock 被测代码本身**;patch 要 patch 使用处;验证 mock 被怎么调用。下一章讲调试技巧。`,
  },

  // =============================================================
  // 第六十章:调试技巧与工具
  // =============================================================
  {
    id: 'debug-tools',
    group: '测试与调试',
    icon: '🐛',
    title: '调试技巧与工具',
    content: `## 第六十章　调试技巧与工具

### 60.1 调试的本质

代码不会一次写对,但bug 是怎么"修"的?核心就两件事:
- **定位**:错误出在哪一行、为什么;
- **验证**:改完是不是真的好了。

调试工具的价值都在这两件事上:让"看现场"更容易、让"假设验证"更快。从低级到高级,工具依次是:print → logging → 断点调试 → 框架自带调试器 → 生产监控。

### 60.2 print 调试

最原始但有效:在怀疑的地方 print 变量看值。

\`\`\`python
def calculate_total(items):
    total = 0
    for item in items:
        print("item:", item, "price:", item["price"])  # 临时调试
        total += item["price"]
    print("total:", total)  # 看中间结果
    return total
\`\`\`

优点:零成本,啥都能看。缺点:
- 调试完要手动删(忘删就污染日志);
- 多线程下 print 顺序乱;
- 生产环境没法用(总不能线上加 print 重启);
- 看不到调用栈、没法条件触发。

> 经验:print 适合临时排查,正式项目要换成 \`logging\`。

### 60.3 logging 模块

\`logging\` 是 Python 标准库的日志模块,比 print 强在:分级、可格式化、可写文件、生产可用。

\`\`\`python
import logging

# 配置:同时输出到控制台和文件
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),                      # 控制台
        logging.FileHandler("app.log", encoding="utf-8"),  # 文件
    ],
)
logger = logging.getLogger(__name__)

# 分级输出
logger.debug("调试信息,默认不输出")
logger.info("用户登录:%s", username)
logger.warning("库存不足,剩余 %d", stock)
logger.error("订单 %s 处理失败", order_id, exc_info=True)  # exc_info 带堆栈
logger.critical("数据库连不上!")
\`\`\`

日志级别从低到高:DEBUG < INFO < WARNING < ERROR < CRITICAL。设 \`level=logging.INFO\` 表示 INFO 及以上才输出,DEBUG 被过滤。

\`format\` 里常用变量:\`%(asctime)s\`(时间)、\`%(levelname)s\`(级别)、\`%(name)s\`(logger 名,通常是模块名)、\`%(message)s\`(消息)、\`%(lineno)d\`(行号)。

### 60.4 pdb / ipdb 断点调试

\`pdb\` 是 Python 标准库的交互式调试器,在代码里加 \`breakpoint()\`(Python 3.7+)就能暂停:

\`\`\`python
def calculate_total(items):
    total = 0
    for item in items:
        breakpoint()  # 程序在这里暂停,进入 pdb
        total += item["price"]
    return total
\`\`\`

运行到这行会暂停,出现 \`->\` 提示符,常用命令:

| 命令 | 简写 | 作用 |
| --- | --- | --- |
| next | n | 执行下一行,不进入函数 |
| step | s | 执行下一行,进入函数 |
| continue | c | 继续运行到下一个断点 |
| print | p | 打印变量值:\`p total\` |
| list | l | 显示当前位置前后代码 |
| where | w | 看调用栈 |
| quit | q | 退出调试 |

\`ipdb\` 是 \`pdb\` 的增强版(自动补全、语法高亮):

\`\`\`bash
pip install ipdb
\`\`\`

\`\`\`python
# 在 settings 里指定用 ipdb
import ipdb; ipdb.set_trace()
\`\`\`

> \`breakpoint()\` 默认调 pdb,要让它用 ipdb,设环境变量 \`PYTHONBREAKPOINT=ipdb.set_trace\`。

### 60.5 Flask debug 模式

Flask 开 \`debug=True\`,出错时浏览器直接显示**交互式调试器**(Werkzeug debugger):你能点开任意一帧栈,看变量、甚至执行 Python 代码。

\`\`\`python
app.run(debug=True)
\`\`\`

> ⚠️ **生产环境绝对不能开 debug=True**!Werkzeug debugger 能在浏览器里执行任意 Python 代码,等于把服务器交给攻击者。生产用 \`app.run(debug=False)\`,错误页用自定义 500 模板。

### 60.6 Django DEBUG=True

Django \`settings.DEBUG=True\` 时,出错会显示一个**详细的错误页**:请求信息、栈追踪、本地变量、SQL 查询、设置。开发时极其有用。

\`\`\`python
# settings.py
DEBUG = True  # 开发环境
\`\`\`

同样**生产环境必须 \`DEBUG=False\`**,否则错误页会泄露源码、配置、密钥。

### 60.7 错误邮件(ADMINS 配置)

Django 生产环境可以让 500 错误自动发邮件给管理员:

\`\`\`python
# settings.py
ADMINS = [("老王", "admin@example.com")]
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.example.com"

# 当 DEBUG=False,500 错误会自动发邮件给 ADMINS
\`\`\`

配合 \`MANAGERS\` 配置,404 错误也能发(但要 \`SEND_BROKEN_LINK_EMAILS=True\`)。

### 60.8 Sentry 错误监控(生产环境)

生产环境出了错,用户不会告诉你,你要主动知道。**Sentry** 是业界最流行的错误监控平台:

- 自动捕获未处理异常;
- 记录完整调用栈、请求信息、用户信息;
- 聚合同一类错误,避免刷屏;
- 邮件/钉钉/Slack 报警。

\`\`\`bash
pip install sentry-sdk
\`\`\`

\`\`\`python
# Flask 接入 Sentry
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/123",  # 在 Sentry 后台拿到的 DSN
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,  # 性能采样率
    environment="production",
)
\`\`\`

\`\`\`python
# Django 接入
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/123",
    integrations=[DjangoIntegration()],
)
\`\`\`

接入后,生产环境任何未捕获异常都会自动上报到 Sentry,你能立刻知道"哪个用户、什么时候、什么操作触发了什么错"。

### 60.9 慢查询日志

数据库慢查询是性能问题主因。开启慢查询日志:

\`\`\`sql
-- MySQL:记录执行超过 1 秒的查询
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
\`\`\`

\`\`\`python
# Django 开发时打印每条 SQL
LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "django.db.backends": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
    },
}
\`\`\`

### 60.10 flask-sqlalchemy 记录 SQL

Flask-SQLAlchemy 配置一下就能打印所有 SQL:

\`\`\`python
import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
# 现在每个 SQL 都会打到日志,包括参数和耗时
\`\`\`

### 60.11 Django Debug Toolbar

开发时右侧悬浮一个面板,显示:SQL 查询数及每条耗时、模板渲染、静态文件、请求/响应头、信号。开发调试神器:

\`\`\`bash
pip install django-debug-toolbar
\`\`\`

\`\`\`python
# settings.py
INSTALLED_APPS = [..., "debug_toolbar"]
MIDDLEWARE = [..., "debug_toolbar.middleware.DebugToolbarMiddleware"]
INTERNAL_IPS = ["127.0.0.1"]

# urls.py
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
\`\`\`

访问任意页面,右上角就有面板,点 "SQL" 能看到这次请求跑了多少条查询,哪条慢,哪条重复。

### 60.12 完整示例:配置 logging 和 pdb

把 logging 配成生产可用 + 开发用 pdb 调试的完整例子:

\`\`\`python
# logging_config.py
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d %(message)s"
        },
        "simple": {"format": "[%(levelname)s] %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "app.log",
            "maxBytes": 10 * 1024 * 1024,  # 10MB 一卷
            "backupCount": 5,              # 保留 5 个旧文件
            "formatter": "verbose",
            "level": "DEBUG",
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "myapp": {"handlers": ["console", "file"], "level": "DEBUG"},
        "django.db.backends": {"handlers": ["console"], "level": "WARNING"},
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}

logging.config.dictConfig(LOGGING_CONFIG)
\`\`\`

业务代码里用 logger,不用 print:

\`\`\`python
import logging
logger = logging.getLogger(__name__)

def process_order(order_id):
    logger.info("开始处理订单 %s", order_id)
    try:
        # ...业务逻辑
        if some_condition:
            # 怀疑这里有 bug,临时加断点
            breakpoint()  # 运行到这暂停,用 p 看变量,n 单步执行
        result = do_something(order_id)
        logger.info("订单 %s 处理完成: %s", order_id, result)
    except Exception as e:
        # exc_info=True 会把完整堆栈记进日志
        logger.error("订单 %s 处理失败", order_id, exc_info=True)
        raise
\`\`\`

调试流程:
1. **复现 bug**:在测试环境跑出错误;
2. **看日志**:在 \`app.log\` 里搜 order_id,看堆栈定位出错位置;
3. **加断点**:在怀疑的行加 \`breakpoint()\`,重跑;
4. **单步排查**:用 \`n\`、\`s\`、\`p 变量\` 找到根因;
5. **改代码**:验证修复,删除断点;
6. **加测试**:为这个 bug 写个回归测试,防止再次出现。

### 60.13 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 生产开 Flask debug=True | 服务器被攻破 | 生产 debug=False |
| 生产 DEBUG=True(Django) | 错误页泄露源码密钥 | 生产 DEBUG=False |
| 用 print 不用 logging | 日志没法分级、没法持久化 | 用 logging |
| logger 没配 handler | 日志丢失 | 配 basicConfig 或 dictConfig |
| pdb 断点忘删 | 生产环境卡死 | 用 \`breakpoint()\`(可在环境变量关掉) |
| 慢查询没排查 | 线上偶发卡顿 | 开慢查询日志、用 Debug Toolbar |
| 生产错误没人知道 | 用户投诉了才发现 | 接 Sentry |

> **本章小结**:调试从低到高——print 临时排查、logging 持久化分级日志、pdb/ipdb 交互式断点、Flask/Django 调试器开发用、Sentry 生产监控。原则:**开发用调试器快、生产用日志和监控稳**。测试与调试这一批到此结束,下一批进入部署与实战。`,
  },
];
