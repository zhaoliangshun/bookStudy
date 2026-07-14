// =============================================================
// FastAPI 全栈实战 - 第 7 批章节（测试与部署 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ff-pytest:       pytest 测试框架入门
//   ff-unit-test:    单元测试（业务逻辑层）
//   ff-integration:  集成测试（API + DB）
//   ff-docker:       Docker 容器化
//   ff-deploy:       生产部署（uvicorn + gunicorn + nginx）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 33 章：pytest 测试框架入门
  // ============================================================
  {
    id: "ff-pytest",
    group: "测试与部署",
    icon: "🧪",
    title: "pytest 测试框架入门",
    content: `# pytest 测试框架入门

## 一、为什么选 pytest

Python 自带 \`unittest\`，为什么还要学 pytest？看一个对比：

\`\`\`python
# ===== unittest 风格：啰嗦 =====
import unittest

class TestAdd(unittest.TestCase):
    def test_add_positive(self):
        # 必须用 self.assertEqual
        self.assertEqual(add(1, 2), 3)

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

# ===== pytest 风格：简洁 =====
def test_add_positive():
    # 直接用 assert，任何表达式都行
    assert add(1, 2) == 3

def test_add_negative():
    assert add(-1, -2) == -3
\`\`\`

pytest 的优势：

| 特性 | unittest | pytest |
|------|---------|--------|
| 断言 | \`self.assertEqual(a, b)\` | \`assert a == b\` |
| 测试类 | 必须继承 \`TestCase\` | 不需要类，函数即可 |
| fixture | \`setUp/tearDown\` 写在类里 | 独立的 \`@pytest.fixture\`，可复用 |
| 参数化 | 自己写循环 | \`@pytest.mark.parametrize\` |
| 插件生态 | 弱 | 强（coverage、mock、asyncio...）|

**结论：pytest 是 Python 测试的事实标准**，FastAPI 官方文档的所有测试示例都用 pytest。

## 二、安装与第一个测试

\`\`\`bash
# 安装 pytest 和测试覆盖率工具
pip install pytest pytest-cov

# 安装 httpx（FastAPI TestClient 依赖）
pip install httpx

# 查看版本
pytest --version
\`\`\`

写第一个测试文件：

\`\`\`python
# 文件：test_demo.py
def add(a, b):
    return a + b

# 测试函数必须以 test_ 开头
def test_add_int():
    assert add(1, 2) == 3

def test_add_float():
    assert add(0.1, 0.2) == 0.3  # 这条会失败！浮点数精度问题

def test_add_str():
    assert add("a", "b") == "ab"
\`\`\`

运行测试：

\`\`\`bash
# 运行所有 test_*.py 文件
pytest

# 运行指定文件
pytest test_demo.py

# 显示详细输出
pytest -v

# 失败时打印变量值
pytest -v --tb=long

# 只跑名字匹配的用例
pytest -v -k "add_int"
\`\`\`

## 三、fixture：测试前置数据

### 3.1 为什么需要 fixture

测试经常需要"准备数据"：创建用户、初始化数据库、造临时文件。如果每个测试都自己造一遍，代码会重复。

\`\`\`python
# ❌ 反面：每个测试都造一遍数据
def test_create_board():
    user = User(name="tom")
    db.add(user)
    board = Board(title="工作", owner=user)
    db.add(board)
    # 测试逻辑...

def test_archive_board():
    user = User(name="tom")
    db.add(user)
    board = Board(title="工作", owner=user)
    db.add(board)
    # 测试逻辑...

# ✅ 正面：用 fixture 复用
@pytest.fixture
def sample_board():
    user = User(name="tom")
    db.add(user)
    board = Board(title="工作", owner=user)
    db.add(board)
    return board

def test_create_board(sample_board):
    # 直接拿 fixture 返回的数据
    assert sample_board.title == "工作"

def test_archive_board(sample_board):
    sample_board.archived = True
    assert sample_board.archived is True
\`\`\`

### 3.2 fixture 的作用域

\`\`\`python
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# scope="function"：每个测试函数都重建（默认）
# 适合：测试数据库这种需要隔离的
@pytest.fixture(scope="function")
def db_session():
    session = SessionLocal()
    yield session  # yield 让 fixture 在测试后执行清理
    session.rollback()
    session.close()

# scope="module"：每个 .py 文件只建一次
# 适合：FastAPI app 这种创建一次就够的
@pytest.fixture(scope="module")
def app():
    app = FastAPI()
    # 注册路由...
    return app

# scope="session"：整个测试会话只建一次
# 适合：数据库引擎这种全局昂贵的资源
@pytest.fixture(scope="session")
def engine():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()

# scope="class"：每个测试类只建一次
# 适合：类里多个测试方法共享数据
@pytest.fixture(scope="class")
def shared_data():
    return {"counter": 0}

# 注意 scope 越大越省时间，但隔离性越差
# 一般原则：能用 function 就用 function
\`\`\`

### 3.3 fixture 之间的依赖

\`\`\`python
# fixture 可以依赖其他 fixture
@pytest.fixture
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture
def tables(engine):  # 注入 engine
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine, tables):  # 注入 engine 和 tables
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_create_user(db_session):  # 链式注入
    user = User(name="tom")
    db_session.add(user)
    db_session.commit()
    assert db_session.query(User).count() == 1
\`\`\`

## 四、参数化：一个测试跑多种场景

\`\`\`python
import pytest

# 传统写法：每个场景写一个函数
def test_add_positive():
    assert add(1, 2) == 3
def test_add_zero():
    assert add(0, 5) == 5
def test_add_negative():
    assert add(-1, -2) == -3

# 参数化写法：一个函数跑所有场景
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),       # 正数
    (0, 5, 5),       # 零
    (-1, -2, -3),    # 负数
    (100, 200, 300), # 大数
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# 还可以给每个场景取名字，方便排查失败
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, -2, -3),
], ids=["正数相加", "负数相加"])
def test_add_named(a, b, expected):
    assert add(a, b) == expected
\`\`\`

## 五、mark：标记测试

\`\`\`python
import pytest

# 自定义标记
@pytest.mark.slow  # 标记为慢测试
def test_large_data():
    # 模拟处理 100 万条数据
    ...

@pytest.mark.smoke  # 标记为冒烟测试
def test_health_check():
    ...

@pytest.mark.skip(reason="等后端 API 改完再开")
def test_pending_feature():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="Linux only")
def test_unix_feature():
    ...

# 跑测试时按标记筛选
# pytest -m smoke          只跑冒烟测试
# pytest -m "not slow"     跳过慢测试
# pytest -m "smoke and not slow"  组合
\`\`\`

需要在 \`pyproject.toml\` 注册自定义 mark：

\`\`\`toml
[tool.pytest.ini_options]
markers = [
    "slow: 慢测试",
    "smoke: 冒烟测试",
    "integration: 集成测试",
]
addopts = "--strict-markers"  # 未注册的 mark 报错，防打错字
\`\`\`

## 六、Demo：完整 pytest 工作流

\`\`\`python
# Demo：pytest 工作流（直接运行可看输出）
# 这个 demo 不依赖外部文件，所有逻辑都在一个文件里
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

# ===== 被测应用 =====
class Item(BaseModel):
    # min_length=1：名字不能为空字符串，否则校验失败返回 422
    name: str = Field(min_length=1)
    price: float

app = FastAPI()

# 内存存储（demo 用）
_items: dict[int, dict] = {}
_next_id = 1

@app.get("/items")
def list_items():
    return list(_items.values())

@app.post("/items", status_code=201)
def create_item(item: Item):
    global _next_id
    _items[_next_id] = {"id": _next_id, **item.model_dump()}
    _next_id += 1
    return _items[_next_id - 1]

# ===== 测试代码 =====
# 注意：测试代码和被测代码放一起是为了 demo 方便
# 实际项目里应该分文件：app/main.py + tests/test_items.py

# fixture：每个测试前清空数据
@pytest.fixture(autouse=True)
def reset_data():
    """autouse=True 表示自动应用到所有测试，无需手动注入"""
    _items.clear()
    global _next_id
    _next_id = 1
    yield  # 测试执行
    _items.clear()

# 基础 fixture：返回 TestClient
@pytest.fixture
def client():
    return TestClient(app)

# 参数化测试：创建商品
@pytest.mark.parametrize("name, price, expected_status", [
    ("苹果", 5.5, 201),
    ("香蕉", 3.0, 201),
    ("", 1.0, 422),  # 空名字应该校验失败
])
def test_create_item(client, name, price, expected_status):
    r = client.post("/items", json={"name": name, "price": price})
    assert r.status_code == expected_status

def test_list_items(client):
    # 先创建两个
    client.post("/items", json={"name": "苹果", "price": 5.5})
    client.post("/items", json={"name": "香蕉", "price": 3.0})
    # 再查询
    r = client.get("/items")
    assert r.status_code == 200
    assert len(r.json()) == 2

def test_create_item_returns_id(client):
    r = client.post("/items", json={"name": "梨", "price": 4.0})
    data = r.json()
    assert data["id"] == 1
    assert data["name"] == "梨"

# ===== 运行测试 =====
if __name__ == "__main__":
    # 用 pytest.main() 在脚本里直接跑测试
    # 等价于命令行：pytest <this_file> -v
    pytest.main([__file__, "-v", "--tb=short"])
\`\`\`

运行上面的 demo：

\`\`\`bash
python main.py
\`\`\`

输出会显示每个用例的通过/失败状态。

## 七、覆盖率测试

\`\`\`bash
# 安装
pip install pytest-cov

# 跑测试时统计覆盖率
pytest --cov=app --cov-report=term-missing

# 输出示例：
# Name                Stmts   Miss  Cover   Missing
# -----------------------------------------------
# app/__init__.py        0      0   100%
# app/main.py           20      2    90%   15-16
# app/models.py         15      0   100%
# -----------------------------------------------
# TOTAL                 35      2    94%
\`\`\`

配置文件：

\`\`\`toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-report=term-missing --cov-report=html"
# 这样每次跑 pytest 都自动统计覆盖率，还生成 html 报告
\`\`\`

打开 \`htmlcov/index.html\` 可看可视化报告，红行是没覆盖到的代码。

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| pytest | Python 事实标准测试框架 |
| fixture | 测试前置数据，可复用 |
| scope | function/module/session，越大越省时但越不隔离 |
| parametrize | 一个测试跑多种场景 |
| mark | 给测试打标签，方便筛选 |
| coverage | 统计测试覆盖率 |
| TestClient | FastAPI 测试利器，不需启动服务器 |

下章我们写真实业务逻辑的单元测试。`,
  },

  // ============================================================
  // 第 34 章：单元测试
  // ============================================================
  {
    id: "ff-unit-test",
    group: "测试与部署",
    icon: "🔬",
    title: "单元测试（业务逻辑层）",
    content: `# 单元测试（业务逻辑层）

## 一、什么算"单元"

**单元测试的"单元"= 一个函数或一个类**，不包括数据库、网络、文件系统。

\`\`\`python
# ===== 这是单元测试 =====
def test_calculate_tax():
    # 纯函数测试，无外部依赖
    assert calculate_tax(1000, rate=0.1) == 100

# ===== 这不是单元测试（是集成测试）=====
def test_create_user_writes_to_db():
    # 涉及真实数据库
    user = create_user(db, "tom")
    assert db.query(User).count() == 1

# ===== 这也不是单元测试（是 E2E 测试）=====
def test_user_can_register_via_api():
    # 涉及 HTTP 请求
    r = client.post("/users", json={"name": "tom"})
    assert r.status_code == 201
\`\`\`

**单元测试的好处**：
1. **快**：毫秒级，跑 1000 个不卡
2. **隔离**：失败时定位明确，就是这个函数的 bug
3. **可重复**：不依赖环境，任何机器都能跑

## 二、被测代码：业务逻辑层

实际项目里，我们通常把路由里的业务逻辑抽到一个 \`services/\` 层：

\`\`\`python
# 文件：app/services/board_service.py
from sqlalchemy.orm import Session
from app.models import Board, User
from app.schemas import BoardCreate, BoardUpdate

class BoardService:
    """看板业务逻辑层。

    为什么单独抽一层？
    - 路由层只管 HTTP（参数解析、返回格式）
    - 业务层管规则（校验、组合、状态机）
    - 这样业务层可独立测试，不需要 HTTP
    """

    def __init__(self, db: Session):
        self.db = db

    def create_board(self, owner: User, data: BoardCreate) -> Board:
        """创建看板。"""
        # 规则：每个用户最多 10 个看板
        count = self.db.query(Board).filter(Board.owner_id == owner.id).count()
        if count >= 10:
            raise ValueError("看板数量已达上限（10 个）")

        board = Board(
            title=data.title,
            description=data.description,
            color=data.color,
            owner_id=owner.id,
        )
        self.db.add(board)
        self.db.commit()
        self.db.refresh(board)
        return board

    def archive_board(self, board_id: int, owner: User) -> Board:
        """归档看板。只有所有者能归档。"""
        board = self.db.get(Board, board_id)
        if not board:
            raise ValueError("看板不存在")
        if board.owner_id != owner.id:
            raise PermissionError("无权操作他人的看板")
        board.archived = True
        self.db.commit()
        self.db.refresh(board)
        return board

    def calculate_progress(self, board: Board) -> float:
        """计算看板完成进度。

        规则：所有卡片中已完成的比例。
        没有卡片时返回 0.0。
        """
        total = sum(len(col.cards) for col in board.columns)
        if total == 0:
            return 0.0
        done = sum(
            1
            for col in board.columns
            for card in col.cards
            if col.title in ("已完成", "Done")
        )
        return done / total
\`\`\`

## 三、纯函数测试：进度计算

\`\`\`python
# 文件：tests/unit/test_board_service.py
import pytest
from unittest.mock import MagicMock
from app.services.board_service import BoardService

# 测试 calculate_progress：纯逻辑，无 DB 依赖
class TestCalculateProgress:
    """测试进度计算。用类组织相关测试。"""

    def _make_board(self, columns_data):
        """造一个假 board 对象，不依赖数据库。

        columns_data: [("待办", 3), ("进行中", 2), ("已完成", 5)]
        表示：待办列有 3 张卡，已完成列有 5 张卡
        """
        board = MagicMock()
        board.columns = []
        for title, count in columns_data:
            col = MagicMock()
            col.title = title
            col.cards = [MagicMock() for _ in range(count)]
            board.columns.append(col)
        return board

    def test_empty_board(self):
        """空看板（没卡片）进度为 0。"""
        service = BoardService(db=MagicMock())
        board = self._make_board([])
        assert service.calculate_progress(board) == 0.0

    def test_all_done(self):
        """所有卡片都在'已完成'列。"""
        service = BoardService(db=MagicMock())
        board = self._make_board([("已完成", 5)])
        assert service.calculate_progress(board) == 1.0

    def test_half_done(self):
        """一半完成的看板。"""
        service = BoardService(db=MagicMock())
        board = self._make_board([("待办", 5), ("已完成", 5)])
        assert service.calculate_progress(board) == 0.5

    def test_no_done_column(self):
        """没有'已完成'列，进度为 0。"""
        service = BoardService(db=MagicMock())
        board = self._make_board([("待办", 3), ("进行中", 2)])
        assert service.calculate_progress(board) == 0.0

    def test_english_done_column(self):
        """支持英文 Done 列名。"""
        service = BoardService(db=MagicMock())
        board = self._make_board([("Todo", 3), ("Done", 2)])
        assert service.calculate_progress(board) == 0.4  # 2/5
\`\`\`

## 四、mock 数据库：测试 create_board

\`\`\`python
from unittest.mock import MagicMock, call
from app.services.board_service import BoardService
from app.models import Board, User
from app.schemas import BoardCreate

class TestCreateBoard:
    """测试创建看板。"""

    def _make_user(self, user_id=1):
        user = MagicMock(spec=User)
        user.id = user_id
        return user

    def _make_db(self, current_count=0):
        """造一个假 db，所有方法都是 mock。"""
        db = MagicMock()
        # query().filter().count() 返回指定数量
        db.query.return_value.filter.return_value.count.return_value = current_count
        return db

    def test_create_success(self):
        """正常创建。"""
        db = self._make_db(current_count=5)
        service = BoardService(db)
        owner = self._make_user()
        data = BoardCreate(title="新看板", color="blue")

        board = service.create_board(owner, data)

        # 断言 db.add 被调用
        db.add.assert_called_once()
        db.commit.assert_called_once()
        # 断言创建的 board 属性正确
        assert board.title == "新看板"
        assert board.owner_id == owner.id

    def test_create_exceeds_limit(self):
        """超过 10 个看板限制应该报错。"""
        db = self._make_db(current_count=10)  # 已经 10 个了
        service = BoardService(db)
        owner = self._make_user()
        data = BoardCreate(title="第 11 个")

        # 断言抛出 ValueError
        with pytest.raises(ValueError, match="上限"):
            service.create_board(owner, data)

        # 断言没写入数据库
        db.add.assert_not_called()
        db.commit.assert_not_called()
\`\`\`

## 五、mock 的常见技巧

### 5.1 MagicMock vs spec

\`\`\`python
from unittest.mock import MagicMock, Mock

# MagicMock：所有方法都自动存在，返回值也是 MagicMock
m = MagicMock()
m.any_method()  # 不报错，返回 MagicMock
m.foo.bar.baz   # 链式访问也不报错

# 危险：拼写错误不会被发现
m.tilte = "x"  # 你想写 title，但打错了，MagicMock 不会提醒

# 用 spec=类名 限制只能访问真实存在的方法
m = MagicMock(spec=User)
m.id = 1        # OK，User 有 id
m.tilte = "x"   # 报错！User 没有 tilte 属性
\`\`\`

### 5.2 side_effect：模拟副作用

\`\`\`python
# 模拟函数抛异常
m = MagicMock()
m.get.side_effect = ValueError("not found")
m.get(1)  # 抛 ValueError

# 模拟函数多次调用返回不同值
m = MagicMock()
m.get.side_effect = [user1, user2, None]
m.get(1)  # 返回 user1
m.get(2)  # 返回 user2
m.get(3)  # 返回 None
\`\`\`

### 5.3 return_value vs side_effect

\`\`\`python
# return_value：永远返回同一个值
m = MagicMock()
m.get.return_value = "hello"
m.get(1)  # "hello"
m.get(2)  # "hello"

# side_effect：每次调用都可能不同
m = MagicMock()
m.get.side_effect = lambda x: f"got {x}"
m.get(1)  # "got 1"
m.get(2)  # "got 2"
\`\`\`

### 5.4 assert_called_with：验证调用参数

\`\`\`python
m = MagicMock()
m.create_user(name="tom", age=18)

# 验证调用了一次
m.create_user.assert_called_once()
# 验证调用的参数
m.create_user.assert_called_with(name="tom", age=18)
# 验证只被调用一次（不是多次）
m.create_user.assert_called_once_with(name="tom", age=18)
\`\`\`

## 六、参数化 + mock 组合

\`\`\`python
@pytest.mark.parametrize("current_count, should_fail", [
    (0, False),   # 0 个，可创建
    (5, False),   # 5 个，可创建
    (9, False),   # 9 个，可创建
    (10, True),   # 10 个，应该失败
    (15, True),   # 15 个，应该失败
])
def test_create_board_limit(current_count, should_fail):
    """测试看板数量限制。"""
    db = MagicMock()
    db.query.return_value.filter.return_value.count.return_value = current_count
    service = BoardService(db)
    owner = MagicMock(spec=User)
    owner.id = 1
    data = BoardCreate(title="测试")

    if should_fail:
        with pytest.raises(ValueError, match="上限"):
            service.create_board(owner, data)
    else:
        board = service.create_board(owner, data)
        assert board.title == "测试"
\`\`\`

## 七、Demo：完整单元测试套件

\`\`\`python
# Demo：可直接运行的单元测试套件
# 包含：纯函数测试 + mock 测试 + 参数化
import pytest
from unittest.mock import MagicMock
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy.orm import Session

# ===== 被测代码 =====
class Card(BaseModel):
    id: int
    title: str
    done: bool = False

class CardService:
    """卡片业务逻辑。"""
    def __init__(self, db):
        self.db = db

    def mark_done(self, card_id: int) -> Card:
        """标记卡片完成。"""
        card = self.db.get(Card, card_id)
        if not card:
            raise ValueError("卡片不存在")
        if card.done:
            raise ValueError("卡片已完成，无需重复标记")
        card.done = True
        self.db.commit()
        return card

    def stats(self, cards: list[Card]) -> dict:
        """统计卡片完成情况。"""
        total = len(cards)
        if total == 0:
            return {"total": 0, "done": 0, "progress": 0.0}
        done = sum(1 for c in cards if c.done)
        return {
            "total": total,
            "done": done,
            "progress": done / total,
        }

# ===== 单元测试 =====
class TestStats:
    """测试统计函数（纯函数）。"""
    def _cards(self, done_count, total_count):
        return [
            Card(id=i, title=f"c{i}", done=(i < done_count))
            for i in range(total_count)
        ]

    def test_empty(self):
        service = CardService(db=MagicMock())
        result = service.stats([])
        assert result == {"total": 0, "done": 0, "progress": 0.0}

    @pytest.mark.parametrize("done, total, expected_progress", [
        (0, 4, 0.0),
        (1, 4, 0.25),
        (2, 4, 0.5),
        (3, 4, 0.75),
        (4, 4, 1.0),
    ])
    def test_progress(self, done, total, expected_progress):
        service = CardService(db=MagicMock())
        cards = self._cards(done, total)
        result = service.stats(cards)
        assert result["progress"] == expected_progress

class TestMarkDone:
    """测试标记完成（需要 mock db）。"""
    def test_success(self):
        # 造一个未完成的卡片
        card = Card(id=1, title="任务", done=False)
        db = MagicMock()
        db.get.return_value = card

        service = CardService(db)
        result = service.mark_done(1)

        assert result.done is True
        db.commit.assert_called_once()

    def test_not_found(self):
        db = MagicMock()
        db.get.return_value = None  # 卡片不存在

        service = CardService(db)
        with pytest.raises(ValueError, match="不存在"):
            service.mark_done(999)

        db.commit.assert_not_called()  # 失败不应该 commit

    def test_already_done(self):
        card = Card(id=1, title="任务", done=True)
        db = MagicMock()
        db.get.return_value = card

        service = CardService(db)
        with pytest.raises(ValueError, match="已完成"):
            service.mark_done(1)

# ===== 运行 =====
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
\`\`\`

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| 单元测试 | 测一个函数/类，不碰外部依赖 |
| service 层 | 业务逻辑抽出来，方便测 |
| MagicMock | 造假对象，模拟依赖 |
| spec | 限制 mock 只能访问真实属性，防拼写错误 |
| side_effect | 模拟异常或多次返回不同值 |
| parametrize | 测多种场景，少写重复代码 |

下章我们写集成测试——真实跑一遍 API + 数据库。`,
  },

  // ============================================================
  // 第 35 章：集成测试
  // ============================================================
  {
    id: "ff-integration",
    group: "测试与部署",
    icon: "🔗",
    title: "集成测试（API + DB）",
    content: `# 集成测试（API + DB）

## 一、单元测试 vs 集成测试

\`\`\`
单元测试：函数 → 函数    （快、隔离）
集成测试：HTTP → 路由 → DB  （慢、真实）
\`\`\`

集成测试的价值：
1. **验证组件协作**：路由能不能调通 service？service 能不能写进 DB？
2. **发现配置问题**：表关系对不对？字段类型对不对？外键约束对不对？
3. **回归保护**：改了 schema 后，老接口不挂

## 二、conftest.py：共享 fixture

pytest 的 \`conftest.py\` 是个特殊文件——里面定义的 fixture **所有测试都能用，不需要 import**。

\`\`\`python
# 文件：tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models import User

# ===== session 级 fixture：整个测试会话共享一次 =====
@pytest.fixture(scope="session")
def engine():
    """用内存 SQLite，跑完即销毁，不污染开发库。"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()

# ===== function 级 fixture：每个测试函数独立的 session =====
@pytest.fixture
def db_session(engine):
    """每个测试函数独立的数据库会话。

    用事务 + 回滚隔离：
    - 测试内的 commit 会被外层事务拦截，不真正写入
    - 测试结束 rollback，下个测试看到的是干净库
    """
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    # 嵌套事务：savepoint
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(*args, **kwargs):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

# ===== function 级 fixture：注入 db_session 到 app =====
@pytest.fixture
def client(db_session):
    """TestClient，依赖注入替换为测试 db。"""
    # 关键：用 dependency_overrides 替换 get_db
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

# ===== 业务 fixture：造测试数据 =====
@pytest.fixture
def auth_user(db_session):
    """造一个登录用户。"""
    from app.auth import hash_password
    user = User(
        username="testuser",
        password_hash=hash_password("testpass"),
    )
    db_session.add(user)
    db_session.commit()
    return user

@pytest.fixture
def auth_token(client, auth_user):
    """用真实登录接口换 token。"""
    r = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "testpass"},
    )
    return r.json()["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    """带 token 的请求头。"""
    return {"Authorization": f"Bearer {auth_token}"}
\`\`\`

## 三、测试用例示例

\`\`\`python
# 文件：tests/api/test_boards.py
import pytest

class TestCreateBoard:
    """测试 POST /boards。"""

    def test_create_success(self, client, auth_headers):
        """正常创建。"""
        r = client.post(
            "/boards",
            json={"title": "工作", "color": "blue"},
            headers=auth_headers,
        )
        assert r.status_code == 201
        data = r.json()
        assert data["title"] == "工作"
        assert data["color"] == "blue"
        assert "id" in data
        assert "created_at" in data

    def test_without_auth(self, client):
        """未登录应该返回 401。"""
        r = client.post("/boards", json={"title": "工作"})
        assert r.status_code == 401

    def test_invalid_color(self, client, auth_headers):
        """非法颜色应该返回 422。"""
        r = client.post(
            "/boards",
            json={"title": "工作", "color": "pink"},
            headers=auth_headers,
        )
        assert r.status_code == 422

    def test_empty_title(self, client, auth_headers):
        """空标题应该返回 422。"""
        r = client.post(
            "/boards",
            json={"title": ""},
            headers=auth_headers,
        )
        assert r.status_code == 422

class TestListBoards:
    """测试 GET /boards。"""

    def test_empty_list(self, client, auth_headers):
        """没创建过看板，列表为空。"""
        r = client.get("/boards", headers=auth_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_after_create(self, client, auth_headers):
        """创建后能查到。"""
        client.post(
            "/boards",
            json={"title": "工作"},
            headers=auth_headers,
        )
        r = client.get("/boards", headers=auth_headers)
        assert len(r.json()) == 1
        assert r.json()[0]["title"] == "工作"

    def test_only_own_boards(self, client, auth_headers, db_session):
        """用户只能看到自己的看板。"""
        # 造另一个用户的看板
        other_user = User(username="other", password_hash="x")
        db_session.add(other_user)
        db_session.commit()
        other_board = Board(title="别人的", owner_id=other_user.id)
        db_session.add(other_board)
        db_session.commit()

        # 当前用户看不到 other_board
        r = client.get("/boards", headers=auth_headers)
        assert len(r.json()) == 0

class TestUpdateBoard:
    """测试 PATCH /boards/{id}。"""

    def test_update_title(self, client, auth_headers):
        # 先创建
        r = client.post(
            "/boards",
            json={"title": "旧名"},
            headers=auth_headers,
        )
        board_id = r.json()["id"]
        # 再更新
        r = client.patch(
            f"/boards/{board_id}",
            json={"title": "新名"},
            headers=auth_headers,
        )
        assert r.status_code == 200
        assert r.json()["title"] == "新名"

    def test_partial_update(self, client, auth_headers):
        """PATCH 部分更新，只改一个字段，其他不变。"""
        r = client.post(
            "/boards",
            json={"title": "T", "color": "blue"},
            headers=auth_headers,
        )
        board_id = r.json()["id"]
        # 只改 color
        r = client.patch(
            f"/boards/{board_id}",
            json={"color": "red"},
            headers=auth_headers,
        )
        data = r.json()
        assert data["color"] == "red"
        assert data["title"] == "T"  # 没变

class TestDeleteBoard:
    """测试 DELETE /boards/{id}。"""

    def test_delete_success(self, client, auth_headers):
        r = client.post(
            "/boards",
            json={"title": "T"},
            headers=auth_headers,
        )
        board_id = r.json()["id"]
        r = client.delete(f"/boards/{board_id}", headers=auth_headers)
        assert r.status_code == 204
        # 再查应该 404
        r = client.get(f"/boards/{board_id}", headers=auth_headers)
        assert r.status_code == 404

    def test_delete_not_found(self, client, auth_headers):
        r = client.delete("/boards/99999", headers=auth_headers)
        assert r.status_code == 404

    def test_delete_others_board(self, client, auth_headers, db_session):
        """删别人的看板应该 403。"""
        other = User(username="other", password_hash="x")
        db_session.add(other)
        db_session.commit()
        other_board = Board(title="别人的", owner_id=other.id)
        db_session.add(other_board)
        db_session.commit()

        r = client.delete(
            f"/boards/{other_board.id}",
            headers=auth_headers,
        )
        assert r.status_code == 403
\`\`\`

## 四、测试完整业务流：注册 → 登录 → 增删改查

\`\`\`python
# 文件：tests/integration/test_full_flow.py
"""完整业务流测试：模拟真实用户操作链路。"""

class TestUserFlow:
    """测试一个完整用户旅程。"""

    def test_register_login_create_board(self, client):
        """注册 → 登录 → 创建看板。"""
        # 1. 注册
        r = client.post("/auth/register", json={
            "username": "newuser",
            "password": "pass123",
        })
        assert r.status_code == 201

        # 2. 登录拿 token
        r = client.post("/auth/login", data={
            "username": "newuser",
            "password": "pass123",
        })
        assert r.status_code == 200
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. 创建看板
        r = client.post("/boards", json={
            "title": "我的看板",
        }, headers=headers)
        assert r.status_code == 201
        board_id = r.json()["id"]

        # 4. 创建列
        r = client.post(f"/boards/{board_id}/columns", json={
            "title": "待办",
        }, headers=headers)
        assert r.status_code == 201
        column_id = r.json()["id"]

        # 5. 创建卡片
        r = client.post(f"/columns/{column_id}/cards", json={
            "title": "学习 FastAPI",
        }, headers=headers)
        assert r.status_code == 201
        card_id = r.json()["id"]

        # 6. 移动卡片到另一列
        r = client.post(f"/boards/{board_id}/columns", json={
            "title": "已完成",
        }, headers=headers)
        done_column_id = r.json()["id"]

        r = client.patch(f"/cards/{card_id}/move", json={
            "target_column_id": done_column_id,
            "target_position": 0,
        }, headers=headers)
        assert r.status_code == 200

        # 7. 验证最终状态
        r = client.get(f"/boards/{board_id}", headers=headers)
        board = r.json()
        assert len(board["columns"]) == 2
        assert board["columns"][1]["cards"][0]["title"] == "学习 FastAPI"
\`\`\`

## 五、Demo：可运行的集成测试

\`\`\`python
# Demo：完整集成测试（含 app + DB + 测试，单文件可跑）
import pytest
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
from jose import jwt

# ===== 基础设施 =====
# 注意：SQLite :memory: 默认每个连接一个独立数据库。
# 用 StaticPool 强制所有会话共享同一个连接，这样 create_all 创建的表
# 对所有后续请求都可见。这是 FastAPI + SQLite 内存库测试的标准做法。
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== 模型 =====
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(200))

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    owner_id: Mapped[int] = mapped_column(default=1)
    archived: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

Base.metadata.create_all(engine)

# ===== Schema =====
class BoardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)

class BoardResponse(BaseModel):
    id: int
    title: str
    owner_id: int
    archived: bool
    created_at: datetime

# ===== 简化的认证 =====
SECRET = "test-secret"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(hours=1)}
    return jwt.encode(payload, SECRET, algorithm="HS256")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    user_id = int(payload["sub"])
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "无效 token")
    return user

# ===== 路由 =====
app = FastAPI()

@app.post("/auth/register", status_code=201)
def register(username: str, password: str, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.username == username)):
        raise HTTPException(400, "用户名已存在")
    user = User(username=username, password_hash=f"hash_{password}")
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username}

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == form.username))
    if not user or user.password_hash != f"hash_{form.password}":
        raise HTTPException(401, "用户名或密码错误")
    return {"access_token": create_token(user.id), "token_type": "bearer"}

@app.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(payload: BoardCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = Board(title=payload.title, owner_id=user.id)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@app.get("/boards", response_model=list[BoardResponse])
def list_boards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Board).where(Board.owner_id == user.id)).all()

# ===== 测试 =====
@pytest.fixture
def client():
    # 用 dependency_overrides 替换 get_db
    TestSession = sessionmaker(bind=engine)
    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_register_and_login(client):
    """注册 → 登录。"""
    r = client.post("/auth/register", params={"username": "tom", "password": "123"})
    assert r.status_code == 201

    r = client.post("/auth/login", data={"username": "tom", "password": "123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_create_board_without_auth(client):
    """未登录创建应该 401。"""
    r = client.post("/boards", json={"title": "T"})
    assert r.status_code == 401

def test_full_flow(client):
    """完整流程：注册 → 登录 → 创建 → 查询。"""
    client.post("/auth/register", params={"username": "tom", "password": "123"})
    r = client.post("/auth/login", data={"username": "tom", "password": "123"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 创建
    r = client.post("/boards", json={"title": "工作"}, headers=headers)
    assert r.status_code == 201
    assert r.json()["title"] == "工作"

    # 查询
    r = client.get("/boards", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1

def test_user_isolation(client):
    """两个用户数据隔离。"""
    # 用户 A
    client.post("/auth/register", params={"username": "a", "password": "1"})
    r = client.post("/auth/login", data={"username": "a", "password": "1"})
    token_a = r.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    client.post("/boards", json={"title": "A 的看板"}, headers=headers_a)

    # 用户 B
    client.post("/auth/register", params={"username": "b", "password": "1"})
    r = client.post("/auth/login", data={"username": "b", "password": "1"})
    token_b = r.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # B 看不到 A 的看板
    r = client.get("/boards", headers=headers_b)
    assert len(r.json()) == 0

# ===== 运行 =====
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
\`\`\`

## 六、本章小结

| 概念 | 一句话 |
|------|-------|
| 集成测试 | HTTP → 路由 → DB 全跑一遍 |
| conftest.py | 共享 fixture，所有测试自动可用 |
| transaction rollback | 测试间数据库隔离的秘诀 |
| dependency_overrides | 替换 FastAPI 依赖，注入测试 db |
| 完整流测试 | 模拟真实用户旅程，端到端验证 |

下章我们用 Docker 把整个应用打包。`,
  },

  // ============================================================
  // 第 36 章：Docker 容器化
  // ============================================================
  {
    id: "ff-docker",
    group: "测试与部署",
    icon: "🐳",
    title: "Docker 容器化",
    content: `# Docker 容器化

## 一、为什么用 Docker

**没 Docker 的痛**：
- "在我电脑上能跑"——到服务器就炸
- Python 版本不对、依赖冲突、系统库缺失
- 部署一次装半小时环境

**Docker 解决的问题**：
- 把代码 + 依赖 + 系统 全部打包成一个"镜像"
- 任何机器装了 Docker 就能跑，环境完全一致
- 一条命令启动整个应用（后端 + 数据库 + 前端）

生活类比：Docker 就像集装箱——你把货物（代码）装进标准箱子（镜像），任何码头（服务器）的吊车（Docker 引擎）都能搬，不用管箱子里装的是啥。

## 二、核心概念

\`\`\`
镜像 (Image)     → 类比：模具、模板
容器 (Container) → 类比：用模具做出来的实物
仓库 (Registry)  → 类比：模具仓库（Docker Hub）

构建：docker build → 用 Dockerfile 生成镜像
运行：docker run  → 用镜像启动一个容器
推送：docker push → 把镜像传到仓库
拉取：docker pull → 从仓库下载镜像
\`\`\`

## 三、Dockerfile：后端镜像

\`\`\`dockerfile
# 文件：backend/Dockerfile
# ===== 阶段 1：基础镜像 =====
# 用官方 Python slim 版（比 alpine 兼容性好，比 full 小）
FROM python:3.12-slim

# ===== 阶段 2：工作目录 =====
WORKDIR /app

# ===== 阶段 3：系统依赖 =====
# gcc：编译某些 Python 包需要
# libffi-dev：cffi 需要（bcrypt 依赖）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    libffi-dev \\
    && rm -rf /var/lib/apt/lists/*

# ===== 阶段 4：Python 依赖 =====
# 先复制 requirements.txt，利用 Docker 缓存
# 只要 requirements.txt 没变，这层就命中缓存，不重新 pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ===== 阶段 5：复制代码 =====
COPY . .

# ===== 阶段 6：暴露端口 =====
EXPOSE 8000

# ===== 阶段 7：启动命令 =====
# 用 uvicorn 启动，host=0.0.0.0 让外部能访问
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

**requirements.txt**：

\`\`\`txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
pydantic-settings==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
\`\`\`

## 四、Dockerfile：前端镜像

\`\`\`dockerfile
# 文件：frontend/Dockerfile
# ===== 阶段 1：构建（多阶段构建，减小最终镜像体积）=====
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci  # 比 npm install 更严格，按 lock 文件装

COPY . .
RUN npm run build

# ===== 阶段 2：运行 =====
# 用 standalone 输出，不装 devDependencies
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**为什么多阶段构建**：builder 阶段装了一堆 devDependencies（typescript、eslint），但运行时不需要。多阶段构建只把构建产物复制到最终镜像，体积小很多。

## 五、docker-compose：编排多个容器

一个完整应用通常有多个服务：后端、前端、数据库。\`docker-compose.yml\` 用来一键启动它们。

\`\`\`yaml
# 文件：docker-compose.yml
version: "3.9"

services:
  # ===== 数据库 =====
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: taskboard
      POSTGRES_PASSWORD: taskboard_pass
      POSTGRES_DB: taskboard
    volumes:
      - pgdata:/var/lib/postgresql/data  # 数据持久化
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskboard"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ===== 后端 =====
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://taskboard:taskboard_pass@db:5432/taskboard
      JWT_SECRET: my-super-secret-key-change-in-prod
      CORS_ORIGINS: http://localhost:3000
    depends_on:
      db:
        condition: service_healthy  # 等 db 健康再启动
    ports:
      - "8000:8000"
    # 启动前自动迁移数据库
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000"

  # ===== 前端 =====
  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000  # 浏览器访问后端的地址
    depends_on:
      - backend
    ports:
      - "3000:3000"

# 数据卷
volumes:
  pgdata:
\`\`\`

**启动**：

\`\`\`bash
# 一键启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f backend

# 停止
docker compose down

# 停止并删除数据
docker compose down -v
\`\`\`

## 六、.dockerignore：减小构建上下文

\`\`\`txt
# 文件：.dockerignore
# 不发送这些文件到 Docker daemon，加快构建
node_modules
.next
.git
*.md
.env
.env.local
__pycache__
*.pyc
.venv
.vscode
\`\`\`

**为什么重要**：\`docker build\` 会把当前目录所有文件发送给 Docker daemon。如果不 ignore \`node_modules\`，几百 MB 的垃圾文件每次都传一遍，构建慢得要命。

## 七、Demo：用 Dockerfile 打包一个最小 FastAPI

\`\`\`python
# Demo：完整的 Docker 化 FastAPI 应用
# 以下是一个最小可运行示例，展示 Docker 工作流

# ===== 文件 1：app/main.py =====
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from Docker", "version": "1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ===== 文件 2：requirements.txt =====
"""
fastapi==0.115.0
uvicorn[standard]==0.30.0
"""

# ===== 文件 3：Dockerfile =====
"""
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# ===== 文件 4：.dockerignore =====
"""
__pycache__
*.pyc
.env
.git
"""

# ===== 构建与运行 =====
"""
# 构建镜像
docker build -t my-fastapi:1.0 .

# 运行容器
docker run -d -p 8000:8000 --name myapp my-fastapi:1.0

# 测试
curl http://localhost:8000/
# 输出：{"message":"Hello from Docker","version":"1.0"}

# 查看日志
docker logs myapp

# 进入容器
docker exec -it myapp sh

# 停止并删除
docker stop myapp
docker rm myapp
"""

# ===== 上面这部分是说明，下面是可运行的 Python demo =====
# 演示 FastAPI 在 Docker 里的等价行为（不需要真的装 Docker）

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI(title="Dockerized App", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Hello from Docker", "version": "1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ===== 测试（模拟 Docker 启动后的行为）=====
client = TestClient(app)

print("=== 模拟 Docker 化应用运行 ===")
r = client.get("/")
print(f"GET / → {r.json()}")

r = client.get("/health")
print(f"GET /health → {r.json()}")

# 验证版本信息（生产环境常用作健康检查的扩展）
print(f"\\n应用名：{app.title}")
print(f"版本：{app.version}")
print(f"OpenAPI 文档：http://localhost:8000/docs")
print(f"\\n生产环境启动命令：")
print(f"  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4")
\`\`\`

## 八、镜像优化技巧

### 8.1 用 slim/alpine 减小体积

\`\`\`dockerfile
# python:3.12         → 1GB+（不推荐）
# python:3.12-slim    → 150MB（推荐，兼容性好）
# python:3.12-alpine  → 50MB（最小，但某些包要编译，麻烦）
\`\`\`

### 8.2 多阶段构建

\`\`\`dockerfile
# 构建阶段：装编译工具，编译依赖
FROM python:3.12-slim AS builder
RUN apt-get update && apt-get install -y gcc
COPY requirements.txt .
RUN pip install --user -r requirements.txt  # --user 装到 /root/.local

# 运行阶段：只复制装好的包，不带编译工具
FROM python:3.12-slim
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
\`\`\`

### 8.3 合并 RUN 指令

\`\`\`dockerfile
# ❌ 不好：每条 RUN 产生一层
RUN apt-get update
RUN apt-get install -y gcc
RUN rm -rf /var/lib/apt/lists/*

# ✅ 好：合并成一条，最后清理
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

## 九、Docker Compose 进阶

### 9.1 环境变量文件

\`\`\`yaml
# docker-compose.yml
services:
  backend:
    env_file:
      - .env  # 从 .env 文件读环境变量
    environment:
      - EXTRA_VAR=value  # 也可直接写
\`\`\`

\`\`\`bash
# .env 文件
DATABASE_URL=postgresql://user:pass@db:5432/mydb
JWT_SECRET=my-secret
\`\`\`

### 9.2 数据卷持久化

\`\`\`yaml
volumes:
  # 命名卷：Docker 管理，跨容器共享
  pgdata:
  # 绑定挂载：映射到宿主机路径，方便开发时热重载
  - ./app:/app/app  # 改本地代码，容器里立刻生效
\`\`\`

### 9.3 健康检查

\`\`\`yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s  # 启动后给 10 秒宽限
\`\`\`

## 十、本章小结

| 概念 | 一句话 |
|------|-------|
| Docker | 集装箱，把代码+环境一起打包 |
| 镜像 | 模板，用 Dockerfile 构建 |
| 容器 | 镜像的运行实例 |
| docker-compose | 一键编排多个容器 |
| 多阶段构建 | builder 装编译器，runner 只留产物 |
| slim/alpine | 减小镜像体积 |
| 健康检查 | 让 compose 知道服务是否就绪 |

下章我们讲生产部署的完整方案。`,
  },

  // ============================================================
  // 第 37 章：生产部署
  // ============================================================
  {
    id: "ff-deploy",
    group: "测试与部署",
    icon: "🚀",
    title: "生产部署（uvicorn + gunicorn + nginx）",
    content: `# 生产部署（uvicorn + gunicorn + nginx）

## 一、生产环境 vs 开发环境

| 维度 | 开发 | 生产 |
|------|------|------|
| 启动命令 | \`uvicorn --reload\` | \`gunicorn -w 4\` |
| 进程数 | 1 | 多个（CPU 核数） |
| 前置代理 | 无 | nginx |
| HTTPS | 无 | 必须 |
| 日志 | 控制台 | 文件 + 切割 |
| 错误处理 | 直接打印堆栈 | 自定义错误页 |
| 配置 | .env.local | 环境变量 / 配置中心 |

## 二、为什么不能直接用 uvicorn --reload

开发时我们用：

\`\`\`bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

生产环境不能这么用，原因：

1. **单进程**：uvicorn 单进程跑，多核 CPU 用不满
2. **--reload 开销大**：每次改文件都重启，生产环境不需要
3. **没有进程管理**：崩了没人拉起来
4. **没有优雅重启**：升级时老连接直接断

## 三、gunicorn：WSGI 进程管理器

gunicorn 是成熟的进程管理器，用 pre-fork 模式：

\`\`\`
                   ┌→ worker 1 (uvicorn worker)
主进程 → fork → ──┼→ worker 2 (uvicorn worker)
                   ├→ worker 3 (uvicorn worker)
                   └→ worker 4 (uvicorn worker)
\`\`\`

主进程负责管理 worker，worker 负责处理请求。某个 worker 崩了，主进程会拉起新的。

### 3.1 安装与启动

\`\`\`bash
# 安装 gunicorn 和 uvicorn worker
pip install gunicorn uvicorn[standard]

# 启动（4 个 worker）
gunicorn app.main:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    --bind 0.0.0.0:8000
\`\`\`

### 3.2 关键参数

\`\`\`bash
gunicorn app.main:app \\
    -w 4 \\                          # worker 数量，推荐 (2*CPU核数+1)
    -k uvicorn.workers.UvicornWorker \\  # 用 uvicorn worker 支持 ASGI
    --bind 0.0.0.0:8000 \\           # 监听地址
    --workers 4 \\                   # 等价 -w
    --worker-connections 1000 \\     # 每个 worker 最大并发连接
    --max-requests 1000 \\           # 每个 worker 处理 1000 请求后重启（防内存泄漏）
    --max-requests-jitter 50 \\      # 加随机抖动，避免所有 worker 同时重启
    --timeout 30 \\                  # 请求超时 30 秒
    --graceful-timeout 20 \\         # 优雅关闭等待 20 秒
    --keep-alive 5 \\                # keep-alive 5 秒
    --access-logfile - \\            # 访问日志输出到 stdout
    --error-logfile - \\             # 错误日志输出到 stdout
    --log-level info \\              # 日志级别
    --preload                        # 预加载应用，节省内存（共享内存）
\`\`\`

### 3.3 worker 数怎么算

\`\`\`python
# 经验公式：CPU 核数 * 2 + 1
# 2 核机器：5 个 worker
# 4 核机器：9 个 worker
# 8 核机器：17 个 worker

# 但 IO 密集型应用（FastAPI 大量 async）可以更多
# 因为 async 不占线程，一个 worker 能扛很多并发

# 实际建议：
# - 小应用（< 100 QPS）：2-4 个 worker
# - 中应用（100-1000 QPS）：4-8 个 worker
# - 大应用（> 1000 QPS）：8-16 个 worker + 横向扩展
\`\`\`

### 3.4 gunicorn.conf.py：配置文件

\`\`\`python
# 文件：gunicorn.conf.py
import multiprocessing
import os

# 自动根据 CPU 核数算 worker 数
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# 性能调优
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
graceful_timeout = 20
keepalive = 5

# 日志
accesslog = "-"  # 输出到 stdout
errorlog = "-"
loglevel = "info"

# 预加载
preload_app = True

# 优雅关闭
# 收到 SIGTERM 后等 worker 处理完当前请求再退出
graceful_timeout = 30

# 生产环境禁用热重载
reload = False

# 用环境变量覆盖
if os.getenv("GUNICORN_WORKERS"):
    workers = int(os.getenv("GUNICORN_WORKERS"))
\`\`\`

启动：

\`\`\`bash
gunicorn -c gunicorn.conf.py app.main:app
\`\`\`

## 四、nginx：反向代理

为什么不直接暴露 gunicorn？因为 nginx 提供了很多 gunicorn 不擅长的能力：

\`\`\`
浏览器 → nginx (80/443) → gunicorn (8000) → FastAPI
                ↓
            ├── 静态文件：nginx 直接返回（快）
            ├── HTTPS：nginx 处理证书
            ├── 压缩：nginx gzip
            ├── 限流：nginx 限 IP
            ├── 缓存：nginx 缓存响应
            └── 日志：nginx 访问日志
\`\`\`

### 4.1 nginx 配置

\`\`\`nginx
# 文件：/etc/nginx/conf.d/taskboard.conf

# 上游服务器：gunicorn
upstream taskboard_backend {
    # 后端地址，可挂多个实现负载均衡
    server 127.0.0.1:8000;
    # server 127.0.0.1:8001;  # 横向扩展时加
}

# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/taskboard_access.log;
    error_log /var/log/nginx/taskboard_error.log;

    # 请求体大小限制（文件上传）
    client_max_body_size 10M;

    # gzip 压缩
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
    gzip_min_length 1000;

    # 反向代理到后端
    location / {
        proxy_pass http://taskboard_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（实时同步需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 静态文件：FastAPI 自动文档的静态资源
    location /docs {
        proxy_pass http://taskboard_backend;
    }
    location /openapi.json {
        proxy_pass http://taskboard_backend;
    }

    # 健康检查（不记日志）
    location /health {
        proxy_pass http://taskboard_backend;
        access_log off;
    }
}
\`\`\`

### 4.2 HTTPS 证书：Let's Encrypt

\`\`\`bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 自动申请并配置证书
sudo certbot --nginx -d api.example.com

# 证书自动续期（crontab）
# 每月 1 号检查，快过期就续
0 0 1 * * /usr/bin/certbot renew --quiet
\`\`\`

## 五、systemd：服务管理

让 gunicorn 像系统服务一样，开机自启、崩溃自动重启。

\`\`\`ini
# 文件：/etc/systemd/system/taskboard.service
[Unit]
Description=TaskBoard FastAPI Application
After=network.target postgresql.service

[Service]
# 用户和组
User=taskboard
Group=taskboard

# 工作目录
WorkingDirectory=/opt/taskboard/backend

# 虚拟环境
Environment="PATH=/opt/taskboard/backend/.venv/bin"

# 环境变量文件
EnvironmentFile=/opt/taskboard/backend/.env

# 启动命令
ExecStart=/opt/taskboard/backend/.venv/bin/gunicorn \\
    -c gunicorn.conf.py \\
    app.main:app

# 优雅重启
ExecReload=/bin/kill -s HUP $MAINPID

# 崩溃自动重启
Restart=always
RestartSec=5

# 标准输出/错误重定向到 journal
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
\`\`\`

常用命令：

\`\`\`bash
# 启动
sudo systemctl start taskboard

# 停止
sudo systemctl stop taskboard

# 重启
sudo systemctl restart taskboard

# 重新加载配置（优雅重启）
sudo systemctl reload taskboard

# 查看状态
sudo systemctl status taskboard

# 查看日志
sudo journalctl -u taskboard -f

# 设置开机自启
sudo systemctl enable taskboard
\`\`\`

## 六、CI/CD：GitHub Actions 自动部署

\`\`\`yaml
# 文件：.github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r backend/requirements.txt
      - run: pip install pytest pytest-cov httpx
      - run: cd backend && pytest tests/ --cov=app

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/taskboard
            git pull origin main
            cd backend
            source .venv/bin/activate
            pip install -r requirements.txt
            alembic upgrade head
            sudo systemctl restart taskboard
\`\`\`

## 七、环境变量管理

### 7.1 Pydantic Settings

\`\`\`python
# 文件：app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 应用
    APP_NAME: str = "TaskBoard"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "postgresql://user:pass@localhost/db"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # 文件上传
    UPLOAD_DIR: str = "/var/taskboard/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # 从 .env 文件读
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
\`\`\`

### 7.2 .env 文件

\`\`\`bash
# 文件：.env（不要提交到 git）
APP_NAME=TaskBoard
DEBUG=False
DATABASE_URL=postgresql://taskboard:pass@localhost/taskboard
JWT_SECRET=my-super-secret-key-change-me
CORS_ORIGINS=["https://taskboard.example.com"]
\`\`\`

### 7.3 敏感信息保护

\`\`\`bash
# .gitignore 必须包含
.env
.env.local
*.pem
*.key
\`\`\`

\`\`\`bash
# 生产环境用环境变量注入，不写文件
# Docker
docker run -e JWT_SECRET=xxx -e DATABASE_URL=xxx ...

# systemd
# EnvironmentFile=/etc/taskboard/secrets.env
# chmod 600 /etc/taskboard/secrets.env
\`\`\`

## 八、Demo：模拟生产部署

\`\`\`python
# Demo：模拟生产环境的 FastAPI 配置
# 直接运行可看输出
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import time
import logging

# ===== 日志配置（生产环境风格）=====
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("taskboard")

# ===== 应用 =====
app = FastAPI(
    title="TaskBoard API",
    version="1.0.0",
    docs_url="/docs",       # 生产可关掉：docs_url=None
    redoc_url="/redoc",
)

# ===== 中间件（生产环境标配）=====
# GZip 压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS（严格限定域名）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://taskboard.example.com"],  # 生产严格限定
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ===== 请求计时中间件 =====
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    """记录每个请求的处理时间。"""
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    response.headers["X-Response-Time"] = f"{duration:.2f}ms"
    if duration > 1000:
        logger.warning(f"慢请求: {request.method} {request.url.path} 耗时 {duration:.2f}ms")
    return response

# ===== 健康检查 =====
@app.get("/health")
def health():
    """健康检查端点。"""
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": time.time(),
    }

@app.get("/ready")
def readiness():
    """就绪检查：数据库等依赖都可用。"""
    # 实际项目里这里检查 DB 连接
    return {"status": "ready"}

# ===== 业务路由 =====
@app.get("/")
def root():
    return {"app": "TaskBoard", "version": "1.0.0"}

# ===== 测试 =====
client = TestClient(app)

print("=== 模拟生产部署 ===")
print()

# 1. 健康检查
r = client.get("/health")
print(f"健康检查 /health: {r.json()}")
print(f"  响应头 X-Response-Time: {r.headers.get('X-Response-Time')}")

# 2. 就绪检查
r = client.get("/ready")
print(f"就绪检查 /ready: {r.json()}")

# 3. 根路径
r = client.get("/")
print(f"根路径 /: {r.json()}")

# 4. CORS 检查
r = client.options(
    "/",
    headers={
        "Origin": "https://taskboard.example.com",
        "Access-Control-Request-Method": "GET",
    },
)
print(f"CORS 预检: {r.status_code}")
print(f"  Allow-Origin: {r.headers.get('Access-Control-Allow-Origin')}")

# 5. 慢请求告警
print()
print("=== 模拟慢请求（会触发告警日志）===")
# 这里不真的等 1 秒，只是演示逻辑
print("  实际生产环境，超过 1 秒的请求会记录 warning 日志")

# 6. 生产启动命令
print()
print("=== 生产环境启动命令 ===")
print("gunicorn app.main:app \\")
print("    -w 4 \\")
print("    -k uvicorn.workers.UvicornWorker \\")
print("    -c gunicorn.conf.py")
print()
print("=== nginx 前置代理 ===")
print("nginx 监听 80/443，反代到 gunicorn:8000")
print()
print("=== systemd 服务 ===")
print("sudo systemctl start taskboard")
print("sudo systemctl enable taskboard  # 开机自启")
\`\`\`

## 九、性能监控

### 9.1 Prometheus + Grafana

\`\`\`python
# 安装：pip install prometheus-fastapi-instrumentator
from prometheus_fastapi_instrumentator import Instrumentator

# 在 app 初始化后加一行
Instrumentator().instrument(app).expose(app, endpoint="/metrics")
\`\`\`

访问 \`/metrics\` 可看到 Prometheus 格式的指标：请求数、延迟分位数、状态码分布。

### 9.2 Sentry：错误追踪

\`\`\`python
# pip install sentry-sdk[fastapi]
import sentry_sdk

sentry_sdk.init(
    dsn="https://xxx@sentry.io/123",
    traces_sample_rate=0.1,  # 10% 请求性能追踪
    environment="production",
)
\`\`\`

线上崩了立刻收到告警，带完整堆栈。

## 十、部署检查清单

上线前对照这个清单逐项检查：

- [ ] **环境变量**：JWT_SECRET 已改为随机长字符串，不是默认值
- [ ] **DEBUG=False**：关闭调试模式，错误页不暴露堆栈
- [ ] **CORS 严格**：allow_origins 只列具体域名，不用 \`*\`
- [ ] **HTTPS 强制**：HTTP 自动 301 到 HTTPS
- [ ] **数据库备份**：配置了定时备份脚本
- [ ] **日志切割**：logrotate 配好，避免日志撑满磁盘
- [ ] **健康检查**：\`/health\` 端点可访问，监控告警接好
- [ ] **限流**：nginx 或 slowapi 配好，防 DDoS
- [ ] **静态资源 CDN**：前端走 CDN，不占后端带宽
- [ ] **依赖锁版本**：requirements.txt 用 == 锁定版本
- [ ] **密钥轮换**：JWT_SECRET 定期换，且支持多密钥并存
- [ ] **优雅关闭**：gunicorn graceful_timeout 配好，升级时不断连接

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| gunicorn | 进程管理器，pre-fork 多 worker |
| UvicornWorker | 让 gunicorn 支持 ASGI |
| nginx | 反向代理，处理 HTTPS/静态/限流 |
| systemd | Linux 服务管理，崩溃自动重启 |
| CI/CD | GitHub Actions 自动测试+部署 |
| Pydantic Settings | 类型安全的环境变量管理 |
| Prometheus | 指标采集 |
| Sentry | 错误追踪 |

## 全书总结

恭喜你完成了整个 FastAPI 全栈实战教程！回顾一下我们学过的：

1. **FastAPI 入门**：路由、参数、Pydantic 校验
2. **SQLAlchemy**：ORM、模型关系、会话管理、依赖注入
3. **认证系统**：bcrypt 哈希、JWT、OAuth2
4. **核心 CRUD**：Board/Column/Card，拖拽排序、WIP 限制
5. **高级特性**：后台任务、文件上传、WebSocket、中间件、异常处理、分页
6. **Next.js 前端**：API 客户端、Zustand、拖拽、实时同步
7. **测试与部署**：pytest、单元测试、集成测试、Docker、生产部署

你现在掌握了 FastAPI 现代开发的全部核心知识。去构建你自己的应用吧！`,
  },
];
