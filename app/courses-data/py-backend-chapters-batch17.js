export const chapters = [
  {
    id: "pyb-17-1",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "单元测试基础",
    content: `
# 单元测试基础

## 一、为什么需要单元测试

### 1.1 单元测试的价值

单元测试（Unit Testing）是对软件中最小可测试单元进行验证的过程，其价值体现在：

| 价值维度 | 具体说明 |
|---------|---------|
| 质量保障 | 提前发现bug，减少线上故障 |
| 重构信心 | 修改代码后快速验证是否破坏原有功能 |
| 文档作用 | 测试用例是最好的代码使用文档 |
| 设计驱动 | 促使代码解耦，编写可测试代码（TDD） |
| 调试效率 | 定位问题范围大大缩小 |

### 1.2 pytest框架概述

pytest是Python生态中最流行的测试框架，相比unittest：
- 语法更简洁，不需要继承TestCase类
- 强大的fixture机制
- 丰富的插件生态
- 支持参数化测试
- 兼容unittest测试用例

安装：
\`\`\`bash
pip install pytest pytest-cov pytest-mock
\`\`\`

## 二、pytest基础用法

### 2.1 测试函数与测试类

测试文件命名规范：\`test_*.py\` 或 \`*_test.py\`
测试函数命名：\`test_*\`
测试类命名：\`Test*\`，且不能有\`__init__\`方法

\`\`\`python
# test_calculator.py
import pytest

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为0")
    return a / b

class TestCalculator:
    def test_add(self):
        assert add(1, 2) == 3
        assert add(-1, 1) == 0
        assert add(-1, -1) == -2
    
    def test_divide(self):
        assert divide(6, 2) == 3.0
        assert divide(5, 2) == 2.5
    
    def test_divide_by_zero(self):
        with pytest.raises(ValueError) as exc_info:
            divide(1, 0)
        assert "除数不能为0" in str(exc_info.value)
\`\`\`

### 2.2 常用断言

pytest直接使用Python原生assert语句，自动提供详细的失败信息：

\`\`\`python
def test_assertions():
    assert 1 == 1
    assert "hello" in "hello world"
    assert [1, 2, 3] == [1, 2, 3]
    assert {"a": 1} == {"a": 1}
    assert 1 > 0
    assert None is None
    
    user = {"name": "Alice", "age": 25}
    assert user["name"] == "Alice"
    assert user["age"] >= 18
    
    result = [1, 2, 3]
    assert len(result) == 3
    assert 2 in result
\`\`\`

## 三、fixture机制

### 3.1 fixture基础

fixture是pytest最核心的功能，用于提供测试前置条件和资源清理：

\`\`\`python
import pytest

class Database:
    def __init__(self):
        self.connected = False
        self.data = {}
    
    def connect(self):
        self.connected = True
    
    def close(self):
        self.connected = False
    
    def insert(self, key, value):
        if not self.connected:
            raise RuntimeError("数据库未连接")
        self.data[key] = value
    
    def get(self, key):
        return self.data.get(key)

@pytest.fixture
def db():
    db = Database()
    db.connect()
    yield db
    db.close()

def test_db_insert(db):
    db.insert("user:1", {"name": "Alice"})
    assert db.get("user:1") == {"name": "Alice"}

def test_db_disconnected(db):
    db.close()
    with pytest.raises(RuntimeError):
        db.insert("key", "value")
\`\`\`

### 3.2 fixture作用域

fixture可以设置不同的作用域，减少重复创建：

| 作用域 | 说明 | 装饰器参数 |
|-------|------|-----------|
| function | 每个测试函数执行一次（默认） | scope="function" |
| class | 每个测试类执行一次 | scope="class" |
| module | 每个模块执行一次 | scope="module" |
| package | 每个包执行一次 | scope="package" |
| session | 整个测试会话执行一次 | scope="session" |

\`\`\`python
@pytest.fixture(scope="session")
def db_connection():
    conn = create_connection("postgresql://localhost/test")
    yield conn
    conn.close()

@pytest.fixture
def db_transaction(db_connection):
    transaction = db_connection.begin()
    yield
    transaction.rollback()
\`\`\`

### 3.3 conftest.py共享fixture

在\`conftest.py\`中定义的fixture可以被同一目录及子目录下的所有测试使用，无需import：

\`\`\`python
# tests/conftest.py
import pytest
from myapp import create_app, db as _db

@pytest.fixture(scope="session")
def app():
    app = create_app(testing=True)
    with app.app_context():
        yield app

@pytest.fixture(scope="session")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def db(app):
    _db.create_all()
    yield _db
    _db.session.remove()
    _db.drop_all()

@pytest.fixture(scope="function")
def session(db):
    connection = db.engine.connect()
    transaction = connection.begin()
    session = db.create_scoped_session(
        options={"bind": connection, "binds": {}}
    )
    db.session = session
    yield session
    transaction.rollback()
    connection.close()
    session.remove()
\`\`\`

## 四、参数化测试

### 4.1 @pytest.mark.parametrize

\`\`\`python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (-1, -1, -2),
    (100, 200, 300),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected

@pytest.mark.parametrize("value", [0, 1, -1, 100, -100])
def test_is_integer(value):
    assert isinstance(value, int)

@pytest.mark.parametrize("username, expected", [
    ("alice", True),
    ("bob123", True),
    ("a", False),
    ("ab", False),
    ("user@name", False),
    ("", False),
])
def test_username_validation(username, expected):
    import re
    pattern = r'^[a-zA-Z][a-zA-Z0-9_]{2,15}$'
    assert bool(re.match(pattern, username)) == expected
\`\`\`

### 4.2 fixture参数化

\`\`\`python
@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def database_backend(request):
    backend = request.param
    if backend == "sqlite":
        return create_sqlite_db()
    elif backend == "postgresql":
        return create_pg_db()
    else:
        return create_mysql_db()

def test_database_operations(database_backend):
    db = database_backend
    db.insert("test", {"data": 123})
    assert db.get("test")["data"] == 123
\`\`\`

## 五、Mock与Patch

### 5.1 unittest.mock基础

Mock用于替换依赖，隔离测试目标：

\`\`\`python
from unittest.mock import Mock, MagicMock, patch, PropertyMock
import requests

def get_user_info(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    if response.status_code == 200:
        return response.json()
    return None

@patch('requests.get')
def test_get_user_info_success(mock_get):
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": 1, "name": "Alice"}
    mock_get.return_value = mock_response
    
    result = get_user_info(1)
    assert result == {"id": 1, "name": "Alice"}
    mock_get.assert_called_once_with("https://api.example.com/users/1")

@patch('requests.get')
def test_get_user_info_failure(mock_get):
    mock_response = Mock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response
    
    result = get_user_info(999)
    assert result is None
\`\`\`

### 5.2 MagicMock常用断言

\`\`\`python
def test_mock_assertions():
    mock = Mock()
    
    mock("hello", name="Alice")
    mock("world")
    
    mock.assert_called()
    mock.assert_called_once()
    mock.assert_called_with("world")
    mock.assert_called_once_with("hello", name="Alice")
    mock.assert_any_call("hello", name="Alice")
    
    assert mock.call_count == 2
    
    mock.reset_mock()
    assert mock.call_count == 0
\`\`\`

### 5.3 patch使用场景

\`\`\`python
# patch对象方法
class UserService:
    def get_user(self, user_id):
        return {"id": user_id, "name": "Real User"}

@patch.object(UserService, 'get_user')
def test_user_service(mock_get_user):
    mock_get_user.return_value = {"id": 1, "name": "Mock User"}
    service = UserService()
    user = service.get_user(1)
    assert user["name"] == "Mock User"

# patch环境变量
@patch.dict('os.environ', {'DATABASE_URL': 'sqlite:///:memory:'})
def test_database_url_from_env():
    import os
    assert os.environ['DATABASE_URL'] == 'sqlite:///:memory:'
\`\`\`

### 5.4 pytest-mock插件

pytest-mock提供了mocker fixture，更方便地使用mock：

\`\`\`python
def test_with_pytest_mock(mocker):
    mock_get = mocker.patch('requests.get')
    mock_get.return_value.json.return_value = {"data": "mocked"}
    
    mock_send_email = mocker.patch('myapp.email.send_email', return_value=True)
    
    result = myapp.notify_user(1, "Hello")
    assert result is True
    mock_send_email.assert_called_once()
\`\`\`

## 六、测试覆盖率

### 6.1 pytest-cov使用

\`\`\`bash
pytest --cov=myapp tests/
pytest --cov=myapp --cov-report=html tests/
pytest --cov=myapp --cov-report=term-missing tests/
pytest --cov=myapp --cov-fail-under=80 tests/
\`\`\`

### 6.2 覆盖率配置

在\`.coveragerc\`或\`pytest.ini\`中配置：

\`\`\`ini
[coverage:run]
source = myapp
omit =
    */migrations/*
    */settings/*
    */test_*
    */conftest.py

[coverage:report]
show_missing = True
skip_covered = False
fail_under = 80
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
\`\`\`

## 七、标记与筛选测试

### 7.1 自定义标记

\`\`\`python
# pytest.ini注册标记
[pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests

@pytest.mark.slow
def test_large_data_processing():
    import time
    time.sleep(5)

@pytest.mark.integration
def test_api_integration():
    pass
\`\`\`

运行筛选：
\`\`\`bash
pytest -m "not slow"
pytest -m "integration"
pytest -m "unit and not slow"
pytest -k "test_add"
\`\`\`

### 7.2 跳过测试

\`\`\`python
import sys

@pytest.mark.skip(reason="功能暂未实现")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.version_info < (3, 9), reason="需要Python 3.9+")
def test_new_feature():
    assert True

@pytest.mark.xfail(reason="已知bug #123")
def test_known_bug():
    assert 1 == 2
\`\`\`

## 八、最佳实践与常见坑点

### 8.1 最佳实践

1. **测试命名清晰**：test_{被测函数}_{场景}_{预期结果}
2. **一个测试一个断言点**：便于定位问题
3. **测试要快**：避免依赖外部服务，使用mock
4. **AAA模式**：Arrange（准备）、Act（执行）、Assert（断言）
5. **测试边界条件**：空值、最大值、异常输入
6. **避免测试实现细节**：测试行为而非实现
7. **保持测试独立**：测试之间不共享状态

### 8.2 常见坑点

1. **忘记yield**：fixture中yield前是setup，后是teardown
2. **patch路径错误**：patch的是**使用处**的引用，不是定义处
3. **fixture作用域过大**：function级db fixture避免测试间数据污染
4. **Mock返回真实对象**：Mock返回值应该是Mock或简单数据结构
5. **过度mock**：该测试真实逻辑时不要mock
6. **测试顺序依赖**：不要让测试的执行顺序影响结果

### 8.3 AAA模式示例

\`\`\`python
def test_transfer_money():
    # Arrange - 准备数据和依赖
    sender = Account(balance=1000)
    receiver = Account(balance=500)
    amount = 200
    
    # Act - 执行被测试的操作
    sender.transfer(receiver, amount)
    
    # Assert - 验证结果
    assert sender.balance == 800
    assert receiver.balance == 700
\`\`\`

## 九、面试题

**Q1: pytest和unittest有什么区别？**
A: pytest语法更简洁，不需要类继承；有强大的fixture机制支持依赖注入；参数化更方便；插件生态丰富；自动发现测试；兼容unittest用例。

**Q2: 什么是fixture？fixture的作用域有哪些？**
A: fixture是pytest用于提供测试前置条件和资源清理的机制，通过装饰器@pytest.fixture定义。作用域有function（默认）、class、module、package、session五种，控制fixture的创建和销毁频率。

**Q3: 如何mock一个外部API调用？**
A: 使用unittest.mock.patch装饰器或上下文管理器patch目标模块中的requests.get等函数，设置mock返回值模拟响应。注意patch的是被测试模块中import的引用，不是requests库本身。

**Q4: 什么是测试覆盖率？覆盖率高就代表测试好吗？**
A: 测试覆盖率衡量被测试代码占总代码的比例。高覆盖率不代表测试质量好，可能只覆盖了路径没验证逻辑；但低覆盖率一定说明测试不足。应该关注分支覆盖率而非仅行覆盖率。
`
  },
  {
    id: "pyb-17-2",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "API集成测试",
    content: `
# API集成测试

## 一、集成测试概述

### 1.1 什么是集成测试

集成测试（Integration Testing）是在单元测试基础上，将多个模块组合在一起测试它们之间的交互是否正确。对于Web API来说，重点测试：
- HTTP请求响应链路
- 路由、中间件、控制器协作
- 数据库读写
- 认证授权流程
- 第三方服务集成

### 1.2 测试客户端对比

| 工具 | 框架支持 | 特点 |
|-----|---------|------|
| Flask test_client | Flask | 内置，无需启动服务器 |
| Django test_client | Django | 内置，支持模板上下文检查 |
| FastAPI TestClient | FastAPI | 基于httpx，支持异步 |
| httpx | 通用 | 支持异步，可测试真实服务 |
| requests | 通用 | 成熟稳定，同步为主 |

## 二、Flask/FastAPI测试

### 2.1 Flask测试客户端

\`\`\`python
# app.py
from flask import Flask, jsonify, request, g
import sqlite3

app = Flask(__name__)

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(':memory:')
        g.db.row_factory = sqlite3.Row
        g.db.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)')
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

@app.route('/api/users', methods=['GET'])
def list_users():
    db = get_db()
    users = db.execute('SELECT * FROM users').fetchall()
    return jsonify([dict(u) for u in users])

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or 'name' not in data or 'email' not in data:
        return jsonify({"error": "缺少必填字段"}), 400
    db = get_db()
    cursor = db.execute('INSERT INTO users (name, email) VALUES (?, ?)',
                        (data['name'], data['email']))
    db.commit()
    return jsonify({"id": cursor.lastrowid, **data}), 201

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if user is None:
        return jsonify({"error": "用户不存在"}), 404
    return jsonify(dict(user))
\`\`\`

\`\`\`python
# test_api.py
import pytest
from app import app as flask_app

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_list_users_empty(client):
    response = client.get('/api/users')
    assert response.status_code == 200
    assert response.get_json() == []

def test_create_user(client):
    response = client.post('/api/users', json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] == 1
    assert data["name"] == "Alice"
    assert data["email"] == "alice@example.com"

def test_get_user(client):
    client.post('/api/users', json={"name": "Bob", "email": "bob@example.com"})
    response = client.get('/api/users/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Bob"

def test_get_user_not_found(client):
    response = client.get('/api/users/999')
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_create_user_missing_fields(client):
    response = client.post('/api/users', json={"name": "Charlie"})
    assert response.status_code == 400
\`\`\`

### 2.2 FastAPI TestClient

\`\`\`python
# main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class User(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        orm_mode = True

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/users", response_model=User, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = UserDB(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[User])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(UserDB).offset(skip).limit(limit).all()

@app.get("/api/users/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
\`\`\`

\`\`\`python
# test_main.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client(test_db):
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_create_user(client):
    response = client.post("/api/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Alice"
    assert data["id"] == 1

def test_read_users(client):
    client.post("/api/users", json={"name": "Bob", "email": "bob@example.com"})
    response = client.get("/api/users")
    assert response.status_code == 200
    assert len(response.json()) == 1
\`\`\`

## 三、数据库测试fixture

### 3.1 事务回滚模式

每个测试开始前开启事务，结束后回滚，保证测试隔离：

\`\`\`python
# conftest.py
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from myapp.models import Base
from myapp import create_app

@pytest.fixture(scope="session")
def engine():
    return create_engine("postgresql://localhost/test_db", echo=False)

@pytest.fixture(scope="session")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_connection(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    yield connection
    transaction.rollback()
    connection.close()

@pytest.fixture
def db_session(db_connection):
    session = Session(bind=db_connection)
    yield session
    session.close()

@pytest.fixture
def app(db_session):
    app = create_app(testing=True)
    
    @app.before_request
    def override_db_session():
        from myapp import db
        db.session = db_session
    
    yield app
\`\`\`

### 3.2 工厂模式创建测试数据

使用工厂函数灵活创建测试对象：

\`\`\`python
# factories.py
import factory
from myapp.models import User, Post
from datetime import datetime

class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = None
    
    name = factory.Faker('name')
    email = factory.LazyAttribute(lambda obj: f"{obj.name.lower().replace(' ', '.')}@example.com")
    created_at = factory.LazyFunction(datetime.now)

class PostFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Post
    
    title = factory.Faker('sentence')
    content = factory.Faker('paragraph')
    author = factory.SubFactory(UserFactory)

# 使用示例
def test_user_posts(db_session, client):
    user = UserFactory()
    posts = PostFactory.create_batch(3, author=user)
    db_session.commit()
    
    response = client.get(f"/api/users/{user.id}/posts")
    assert response.status_code == 200
    assert len(response.json()) == 3
\`\`\`

## 四、认证测试

### 4.1 JWT认证测试

\`\`\`python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "test-secret-key"

def create_test_token(user_id: int, expires_delta: timedelta = None):
    if expires_delta is None:
        expires_delta = timedelta(minutes=30)
    expire = datetime.utcnow() + expires_delta
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@pytest.fixture
def auth_headers():
    token = create_test_token(user_id=1)
    return {"Authorization": f"Bearer {token}"}

def test_protected_endpoint(client, auth_headers):
    response = client.get("/api/protected", headers=auth_headers)
    assert response.status_code == 200

def test_protected_endpoint_no_token(client):
    response = client.get("/api/protected")
    assert response.status_code == 401

def test_protected_endpoint_expired_token(client):
    expired_token = create_test_token(user_id=1, expires_delta=timedelta(seconds=-1))
    response = client.get("/api/protected", headers={
        "Authorization": f"Bearer {expired_token}"
    })
    assert response.status_code == 401
\`\`\`

### 4.2 Session认证测试

\`\`\`python
def test_login_logout(client, db_session):
    user = UserFactory(password_hash=hash_password("test123"))
    db_session.commit()
    
    response = client.post("/api/login", json={
        "email": user.email,
        "password": "test123"
    })
    assert response.status_code == 200
    
    response = client.get("/api/me")
    assert response.status_code == 200
    assert response.json()["email"] == user.email
    
    response = client.post("/api/logout")
    assert response.status_code == 200
    
    response = client.get("/api/me")
    assert response.status_code == 401
\`\`\`

## 五、文件上传测试

\`\`\`python
import io

def test_upload_avatar(client, auth_headers):
    data = {
        "file": (io.BytesIO(b"fake image content"), "avatar.png", "image/png")
    }
    response = client.post(
        "/api/upload-avatar",
        headers=auth_headers,
        files=data,
        content_type="multipart/form-data"
    )
    assert response.status_code == 200
    assert "url" in response.json()

def test_upload_large_file(client, auth_headers):
    large_file = io.BytesIO(b"x" * (10 * 1024 * 1024))
    data = {"file": (large_file, "large.bin", "application/octet-stream")}
    response = client.post(
        "/api/upload",
        headers=auth_headers,
        files=data
    )
    assert response.status_code == 413

def test_upload_invalid_type(client, auth_headers):
    data = {"file": (io.BytesIO(b"<?php ?>"), "shell.php", "application/x-php")}
    response = client.post(
        "/api/upload",
        headers=auth_headers,
        files=data
    )
    assert response.status_code == 400
\`\`\`

## 六、契约测试

### 6.1 响应结构验证

使用pydantic或jsonschema验证API响应格式：

\`\`\`python
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    page_size: int

def test_user_list_response(client):
    response = client.get("/api/users?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    
    validated = UserListResponse(**data)
    assert validated.page == 1
    assert len(validated.items) <= 10
\`\`\`

## 七、最佳实践与常见坑点

### 7.1 最佳实践

1. **测试环境隔离**：使用独立的测试数据库，不要用开发/生产库
2. **事务回滚**：每个测试后回滚数据库，保证测试独立
3. **测试真实HTTP状态码**：200/201/400/401/403/404/500都要覆盖
4. **测试边界情况**：空列表、大数据量、非法输入
5. **测试认证权限**：未登录、无权限、权限正确三种情况
6. **不要mock数据库**：集成测试要走真实的数据库层
7. **复用fixture**：认证头、测试客户端等提取为fixture

### 7.2 常见坑点

1. **测试数据污染**：忘记清理或回滚导致测试间相互影响
2. **测试顺序依赖**：测试依赖前一个测试创建的数据
3. **硬编码ID**：不要假设id=1存在，通过创建获取真实id
4. **异步测试问题**：FastAPI异步端点用pytest-asyncio
5. **文件句柄泄漏**：上传测试后关闭文件对象
6. **时间依赖**：使用freezegun冻结时间，避免时间相关测试不稳定

\`\`\`python
from freezegun import freeze_time

@freeze_time("2024-01-01 12:00:00")
def test_token_expiry():
    token = create_token(user_id=1, ttl_seconds=3600)
    assert not is_token_expired(token)
    
    with freeze_time("2024-01-01 13:00:01"):
        assert is_token_expired(token)
\`\`\`

## 八、面试题

**Q1: 单元测试和集成测试的区别是什么？什么时候需要集成测试？**
A: 单元测试隔离测试单个函数/类，速度快，定位问题精确；集成测试测试模块间协作，覆盖真实链路。需要集成测试的场景：数据库读写、API端点、第三方服务集成、认证流程、缓存逻辑等。

**Q2: 如何保证API测试的数据隔离？**
A: 常用方法：1) 每个测试使用独立事务，结束后回滚；2) 测试数据库在session级fixture中创建，每个function级fixture清理数据；3) 使用UUID等唯一标识避免冲突；4) 测试运行前清理数据库。

**Q3: 测试API时需要覆盖哪些场景？**
A: 正常成功场景、参数校验失败、未认证访问、无权限访问、资源不存在、业务规则失败、边界值（空列表/最大分页/超长输入）、并发场景、幂等性验证。
`
  },
  {
    id: "pyb-17-3",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "Web服务器配置",
    content: `
# Web服务器配置

## 一、Nginx核心概念

### 1.1 Nginx简介

Nginx（engine x）是高性能的HTTP和反向代理服务器，特点：
- 高并发：事件驱动架构，单机支持数万并发连接
- 低内存：异步非阻塞处理，内存占用小
- 高可靠：Master-Worker进程模型，Worker可热重启
- 热部署：支持不停止服务更新配置和升级二进制文件
- 丰富功能：反向代理、负载均衡、缓存、静态文件服务

### 1.2 Nginx进程模型

| 进程 | 角色 | 数量 | 说明 |
|-----|------|------|------|
| Master进程 | 管理进程 | 1个 | 读取配置、管理Worker、热重启 |
| Worker进程 | 工作进程 | CPU核心数 | 处理具体请求，相互独立 |
| Cache Loader | 缓存加载 | 启动时临时 | 加载磁盘缓存到内存 |
| Cache Manager | 缓存管理 | 周期性 | 清理过期缓存 |

## 二、Nginx核心配置

### 2.1 配置文件结构

\`\`\`nginx
# 全局块 - 配置影响Nginx全局
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;
worker_rlimit_nofile 65535;

# events块 - 配置网络连接
events {
    use epoll;
    worker_connections 65535;
    multi_accept on;
}

# http块 - HTTP服务器配置
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    gzip on;
    
    # upstream块 - 后端服务器组
    upstream backend {
        server 127.0.0.1:8000;
        server 127.0.0.1:8001;
    }
    
    # server块 - 虚拟主机配置
    server {
        listen 80;
        server_name example.com;
        
        # location块 - 请求路由
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
\`\`\`

### 2.2 location匹配规则

location匹配优先级从高到低：

| 优先级 | 匹配类型 | 语法 | 说明 |
|-------|---------|------|------|
| 1 | 精确匹配 | location = /path | 完全匹配路径 |
| 2 | 前缀匹配（优先） | location ^~ /path | 匹配前缀且不检查正则 |
| 3 | 正则匹配（区分大小写） | location ~ \\.jpg$ | 区分大小写正则 |
| 4 | 正则匹配（不区分） | location ~* \\.jpg$ | 不区分大小写正则 |
| 5 | 普通前缀匹配 | location /path | 最长前缀匹配 |
| 6 | 通用匹配 | location / | 匹配所有请求 |

\`\`\`nginx
location = / {
    return 200 "精确匹配根路径";
}

location ^~ /static/ {
    root /var/www/;
    expires 30d;
}

location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
    root /var/www/assets/;
    expires 7d;
    add_header Cache-Control "public, no-transform";
}

location /api/ {
    proxy_pass http://backend;
}

location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
\`\`\`

## 三、反向代理与负载均衡

### 3.1 反向代理配置

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffer_size 4k;
        proxy_buffers 4 32k;
        proxy_busy_buffers_size 64k;
        
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
\`\`\`

### 3.2 upstream负载均衡策略

| 策略 | 配置 | 说明 |
|-----|------|------|
| 轮询（默认） | server backend1; server backend2; | 请求按顺序分发 |
| 权重 | server backend1 weight=3; server backend2 weight=1; | 权重越高分配越多 |
| ip_hash | ip_hash; | 同一IP固定访问同一后端 |
| least_conn | least_conn; | 转发到连接数最少的后端 |
| 哈希 | hash $request_uri consistent; | 按指定key哈希，一致性哈希 |

\`\`\`nginx
upstream gunicorn_backend {
    ip_hash;
    server 127.0.0.1:8000 weight=3 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 backup;
    keepalive 64;
}

upstream fastapi_backend {
    least_conn;
    server 127.0.0.1:9000;
    server 127.0.0.1:9001;
}
\`\`\`

## 四、HTTPS配置

### 4.1 Let's Encrypt证书申请

使用certbot免费申请HTTPS证书：

\`\`\`bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 自动申请并配置Nginx
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期测试
sudo certbot renew --dry-run
\`\`\`

### 4.2 HTTPS Nginx配置

\`\`\`nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /var/www/static/;
        expires 30d;
    }
}
\`\`\`

## 五、静态文件服务

### 5.1 静态资源配置

\`\`\`nginx
# Django静态文件
location /static/ {
    alias /path/to/project/staticfiles/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /media/ {
    alias /path/to/project/media/;
    expires 7d;
    add_header Cache-Control "public";
}

# SPA前端路由 - history模式
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}

# 大文件上传
client_max_body_size 100M;
client_body_buffer_size 128k;

# 开启gzip压缩
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
gzip_min_length 1024;
\`\`\`

## 六、Nginx与Python WSGI/ASGI服务器配合

### 6.1 Gunicorn配置（WSGI）

Gunicorn是Python最常用的WSGI服务器，用于Django/Flask：

\`\`\`python
# gunicorn.conf.py
import multiprocessing

bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 60
graceful_timeout = 30
keepalive = 5
accesslog = "-"
errorlog = "-"
loglevel = "info"
preload_app = True
\`\`\`

启动命令：
\`\`\`bash
gunicorn myproject.wsgi:application -c gunicorn.conf.py
\`\`\`

### 6.2 Uvicorn配置（ASGI）

Uvicorn是ASGI服务器，用于FastAPI/Starlette：

\`\`\`python
# uvicorn启动
uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4 \\
    --proxy-headers --forwarded-allow-ips='*' \\
    --log-level info --access-log
\`\`\`

生产环境多进程用gunicorn管理uvicorn workers：
\`\`\`bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker \\
    --bind 127.0.0.1:8000 --proxy-headers
\`\`\`

### 6.3 Nginx + Gunicorn部署架构

\`\`\`
                    ┌─────────────────┐
                    │     用户请求     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Nginx (80/443) │ -- SSL终结、静态文件、反向代理
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Gunicorn Worker1 │ │ Gunicorn Worker2 │ │ Gunicorn Worker3 │
│    (port 8000)   │ │    (port 8001)   │ │    (port 8002)   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  PostgreSQL/DB  │
                    └─────────────────┘
\`\`\`

## 七、常用运维命令

### 7.1 Nginx管理

\`\`\`bash
# 检查配置语法
sudo nginx -t

# 重载配置（不中断服务）
sudo nginx -s reload

# 快速停止
sudo nginx -s stop

# 优雅停止（处理完当前请求）
sudo nginx -s quit

# 重新打开日志文件（用于日志切割）
sudo nginx -s reopen

# 查看版本和编译参数
nginx -V
\`\`\`

### 7.2 Systemd服务配置

\`\`\`ini
# /etc/systemd/system/gunicorn.service
[Unit]
Description=Gunicorn daemon for myapp
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/project
Environment="PATH=/path/to/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=myapp.settings.production"
ExecStart=/path/to/venv/bin/gunicorn myapp.wsgi:application -c gunicorn.conf.py
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -f
\`\`\`

## 八、最佳实践与常见坑点

### 8.1 最佳实践

1. **worker_processes设为auto**：自动匹配CPU核心数
2. **开启epoll模型**：Linux下使用epoll，高并发性能好
3. **静态文件由Nginx直接服务**：不要让Python应用处理静态文件
4. **配置合理的超时**：避免长时间挂起的连接
5. **开启gzip压缩**：减少传输体积
6. **设置安全头**：HSTS、X-Frame-Options等
7. **proxy_set_header传递真实IP**：后端应用才能获取用户真实IP
8. **使用keepalive连接**：减少Nginx到后端的连接建立开销

### 8.2 常见坑点

1. **proxy_pass末尾斜杠**：带斜杠是替换，不带是追加，容易搞混
2. **alias vs root**：alias是替换路径，root是追加路径
3. **权限问题**：Nginx运行用户（nginx/www-data）要有文件访问权限
4. **SELinux**：CentOS/RHEL下可能阻止Nginx反向代理，需要设置setsebool
5. **大文件上传**：忘记设置client_max_body_size导致413错误
6. **X-Forwarded-For**：后端需要配置信任代理，否则获取不到真实IP

## 九、面试题

**Q1: Nginx的正向代理和反向代理有什么区别？**
A: 正向代理代理客户端（如VPN、科学上网），客户端知道目标服务器但需要通过代理访问；反向代理代理服务器（如负载均衡），客户端不知道真实后端服务器，请求发给代理，代理转发到后端。

**Q2: Nginx有哪些负载均衡策略？**
A: 1) 轮询（默认）按顺序分配；2) weight加权轮询，按权重比例分配；3) ip_hash同一IP到同一后端解决session问题；4) least_conn最少连接数；5) url_hash按URL哈希；6) fair按响应时间。

**Q3: Nginx如何处理高并发？**
A: 采用Master-Worker多进程模型，Worker进程使用epoll/kqueue等IO多路复用技术，异步非阻塞处理请求，单个Worker进程可以同时处理数千连接，而不是一个连接一个进程/线程。

**Q4: location匹配优先级是怎样的？**
A: 精确匹配(=) > 前缀匹配不检查正则(^~) > 正则匹配(~和~*)，按配置顺序匹配第一个命中的 > 普通前缀匹配，取最长前缀 > 通用匹配(/)。
`
  },
  {
    id: "pyb-17-4",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "Docker容器化",
    content: `
# Docker容器化

## 一、Docker基础概念

### 1.1 容器 vs 虚拟机

| 特性 | Docker容器 | 虚拟机 |
|-----|-----------|-------|
| 隔离级别 | 进程级隔离 | 操作系统级隔离 |
| 启动速度 | 秒级 | 分钟级 |
| 性能损耗 | <5% | 10%-30% |
| 镜像大小 | MB级 | GB级 |
| 系统内核 | 共享宿主机内核 | 独立内核 |
| 资源占用 | 极低 | 较高 |
| 数量级 | 单机可运行数百容器 | 单机数十个虚拟机 |

### 1.2 核心概念

- **镜像（Image）**：只读模板，包含应用运行所需的代码、依赖、环境，类似快照
- **容器（Container）**：镜像运行时实例，可读写，相互隔离
- **仓库（Registry）**：存储镜像的地方，如Docker Hub、私有Harbor
- **Dockerfile**：构建镜像的脚本文件
- **docker-compose**：多容器编排工具

## 二、Dockerfile编写

### 2.1 基础指令

\`\`\`dockerfile
# FROM - 指定基础镜像
FROM python:3.11-slim

# LABEL - 添加元数据
LABEL maintainer="dev@example.com"
LABEL version="1.0"
LABEL description="My Python application"

# WORKDIR - 设置工作目录（自动创建）
WORKDIR /app

# ENV - 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

# COPY - 复制文件（比ADD推荐，ADD会自动解压）
COPY requirements.txt .

# RUN - 执行命令（构建镜像时运行）
RUN pip install -r requirements.txt

# COPY应用代码（利用分层缓存，依赖不变不重新安装）
COPY . .

# EXPOSE - 声明暴露的端口（仅文档作用）
EXPOSE 8000

# USER - 切换运行用户（不要用root）
RUN useradd -m appuser
USER appuser

# CMD - 容器启动命令（可被docker run参数覆盖）
CMD ["gunicorn", "myapp.wsgi:application", "--bind", "0.0.0.0:8000"]

# ENTRYPOINT - 入口点（不易被覆盖，适合固定启动命令）
# ENTRYPOINT ["gunicorn"]
# CMD ["myapp.wsgi:application", "--bind", "0.0.0.0:8000"]
\`\`\`

### 2.2 多阶段构建

多阶段构建可以显著减小最终镜像体积，构建依赖不进入运行时镜像：

\`\`\`dockerfile
# 构建阶段
FROM python:3.11 AS builder

WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --upgrade pip && \\
    pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

# 运行阶段
FROM python:3.11-slim

WORKDIR /app

# 只从builder复制venv和应用代码
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app/staticfiles /app/staticfiles
COPY . .

ENV PATH="/opt/venv/bin:$PATH" \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["gunicorn", "myapp.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
\`\`\`

### 2.3 前端项目多阶段构建

\`\`\`dockerfile
# Node构建阶段
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Python运行阶段
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/frontend/dist /app/static

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["gunicorn", "app:create_app()", "--bind", "0.0.0.0:8000"]
\`\`\`

## 三、.dockerignore文件

类似.gitignore，避免不必要的文件进入构建上下文：

\`\`\`
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
*.egg-info/
dist/
build/
.eggs/
venv/
.venv/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 环境文件
.env
.env.local
.env.*.local

# Git
.git/
.gitignore
.gitattributes

# 日志
*.log
logs/

# 测试
tests/
.pytest_cache/
.coverage
htmlcov/

# Node
node_modules/
frontend/node_modules/

# OS
.DS_Store
Thumbs.db

# 其他
README.md
docker-compose*.yml
Dockerfile*
\`\`\`

## 四、Docker Compose编排

### 4.1 docker-compose.yml基础

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    command: gunicorn myapp.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - ./:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:1.25-alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - static_volume:/app/staticfiles:ro
      - media_volume:/app/media:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - app-network

  celery:
    build: .
    command: celery -A myapp worker -l info
    volumes:
      - ./:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network

  celery-beat:
    build: .
    command: celery -A myapp beat -l info
    volumes:
      - ./:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:

networks:
  app-network:
    driver: bridge
\`\`\`

### 4.2 常用docker-compose命令

\`\`\`bash
# 构建镜像
docker-compose build
docker-compose build --no-cache

# 启动服务（后台运行）
docker-compose up -d

# 启动并重新构建
docker-compose up -d --build

# 查看日志
docker-compose logs -f
docker-compose logs -f web

# 执行命令
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec db psql -U postgres myapp

# 停止服务
docker-compose stop
docker-compose down

# 停止并删除数据卷（谨慎！）
docker-compose down -v

# 查看服务状态
docker-compose ps

# 重启某个服务
docker-compose restart web
\`\`\`

## 五、镜像优化

### 5.1 优化技巧

| 优化方法 | 效果 | 说明 |
|---------|------|------|
| 使用Alpine镜像 | 体积减小 | 但注意musl libc兼容性问题 |
| 多阶段构建 | 体积大幅减小 | 构建依赖不进入运行镜像 |
| 合并RUN指令 | 减少层数 | 用&&连接多个命令 |
| 合理利用缓存 | 构建加快 | 先复制requirements.txt再复制代码 |
| .dockerignore | 减少上下文 | 排除无关文件 |
| 使用非root用户 | 更安全 | 不要用root运行应用 |
| 清理缓存 | 减小体积 | apt-get clean、pip --no-cache-dir |

\`\`\`dockerfile
# 不好的写法 - 层数多，缓存利用差
FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install django
RUN pip install gunicorn
RUN pip install psycopg2-binary
RUN apt-get update
RUN apt-get install -y curl

# 好的写法 - 层数少，缓存友好
FROM python:3.11-slim

WORKDIR /app

# 先复制依赖文件，依赖不变不重新安装
COPY requirements.txt .

RUN apt-get update && \\
    apt-get install -y --no-install-recommends curl && \\
    rm -rf /var/lib/apt/lists/* && \\
    pip install --no-cache-dir -r requirements.txt

# 再复制应用代码
COPY . .

RUN useradd -m appuser
USER appuser

CMD ["gunicorn", "myapp.wsgi:application", "--bind", "0.0.0.0:8000"]
\`\`\`

## 六、Docker网络与数据卷

### 6.1 网络模式

| 网络模式 | 配置 | 说明 |
|---------|------|------|
| bridge（默认） | --network bridge | 默认网桥，容器间可通过IP通信 |
| host | --network host | 共享宿主机网络栈，性能好但隔离性差 |
| none | --network none | 无网络 |
| 自定义网络 | docker network create | 自定义网桥，可通过服务名DNS解析 |

compose中默认创建自定义网络，服务名即DNS名，可以直接用\`db\`\`redis\`连接。

### 6.2 数据卷类型

| 类型 | 语法 | 说明 |
|-----|------|------|
| 具名卷 | postgres_data:/var/lib/postgresql/data | Docker管理，推荐用于持久化数据 |
| 绑定挂载 | ./:/app | 挂载宿主机目录，适合开发时代码热重载 |
| tmpfs | --tmpfs /tmp | 内存文件系统，临时数据 |

生产环境使用具名卷持久化数据库数据，不要用绑定挂载。

## 七、开发环境Docker配置

开发时需要代码热重载、调试端口等，可用不同的compose文件：

\`\`\`yaml
# docker-compose.override.yml（开发环境自动加载）
version: '3.8'

services:
  web:
    command: python manage.py runserver 0.0.0.0:8000
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
    volumes:
      - ./:/app

  celery:
    command: celery -A myapp worker -l info --autoreload

  db:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"

  flower:
    build: .
    command: celery -A myapp flower --port=5555
    ports:
      - "5555:5555"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
\`\`\`

## 八、最佳实践与常见坑点

### 8.1 最佳实践

1. **每个容器一个进程**：一个容器只跑一个主进程，不要在一个容器里跑Nginx+应用+数据库
2. **使用官方基础镜像**：不要用不明来源的镜像
3. **固定镜像版本**：不要用latest标签，指定具体版本如python:3.11.4-slim
4. **合理设置WORKDIR**：不要在根目录或/home下散乱放文件
5. **设置健康检查**：HEALTHCHECK指令，方便编排系统判断容器状态
6. **日志输出到stdout/stderr**：不要写文件，让Docker收集日志
7. **容器无状态**：不要在容器内存储持久化数据，用数据卷

### 8.2 常见坑点

1. **PID 1僵尸进程问题**：容器内PID 1进程不处理SIGTERM信号，导致docker stop超时，使用dumb-init或tini
2. **时区问题**：容器默认UTC，需要设置TZ环境变量或挂载localtime
3. **alpine镜像兼容性**：musl libc和glibc有差异，某些Python包（如numpy、psycopg2）可能需要额外安装编译依赖
4. **构建上下文过大**：忘记.dockerignore导致把node_modules、venv传进去构建很慢
5. **服务启动顺序**：depends_on只保证启动顺序，不保证服务就绪，需要用healthcheck或wait-for-it脚本
6. **文件权限**：容器内非root用户创建的文件在宿主机上权限不匹配

\`\`\`dockerfile
# 添加tini解决PID 1问题
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini && \\
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["gunicorn", "myapp.wsgi:application", "--bind", "0.0.0.0:8000"]
\`\`\`

## 九、面试题

**Q1: Docker和虚拟机的核心区别是什么？**
A: 虚拟机是硬件级虚拟化，每个VM有独立内核、操作系统，通过Hypervisor管理；Docker是进程级虚拟化，使用容器运行时（runc）通过Linux Namespace和Cgroups实现隔离，共享宿主机内核，因此更轻量启动更快。

**Q2: Dockerfile中COPY和ADD有什么区别？**
A: COPY只做纯粹的文件复制，是推荐用法；ADD额外支持自动解压tar文件和从URL下载文件，但URL下载的文件不会自动解压且权限不好处理，大部分情况用COPY更清晰。

**Q3: 如何减小Docker镜像体积？**
A: 1) 使用alpine或slim基础镜像；2) 多阶段构建，构建阶段和运行阶段分离；3) 合并RUN指令减少层数；4) 利用构建缓存，先复制依赖文件再复制代码；5) 安装包后清理缓存（apt-get clean、pip --no-cache-dir）；6) 使用.dockerignore排除无关文件。

**Q4: docker-compose中depends_on为什么不够用？如何解决？**
A: depends_on只保证容器启动顺序，不保证容器内的应用已经就绪（如PostgreSQL启动需要时间）。解决方法：1) 使用healthcheck检查服务健康状态；2) 使用wait-for-it.sh或dockerize等工具等待端口开放；3) 应用层添加重试逻辑，启动时尝试重连数据库。
`
  },
  {
    id: "pyb-17-5",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "CI/CD流水线",
    content: `
# CI/CD流水线

## 一、CI/CD概念

### 1.1 什么是CI/CD

- **CI（Continuous Integration，持续集成）**：开发人员频繁将代码合并到主干，每次合并自动触发构建、测试
- **CD（Continuous Delivery，持续交付）**：代码通过测试后自动部署到预发布环境，可随时手动发布到生产
- **CD（Continuous Deployment，持续部署）**：代码通过测试后自动部署到生产环境，无需人工干预

### 1.2 CI/CD流水线阶段

| 阶段 | 说明 | 关键动作 |
|-----|------|---------|
| 代码提交 | 开发者push代码 | git push、PR/MR |
| 代码检查 | 静态分析、代码风格 | lint、type check、安全扫描 |
| 构建 | 编译打包、构建镜像 | pip install、docker build |
| 测试 | 自动化测试 | 单元测试、集成测试、覆盖率 |
| 制品 | 存储构建产物 | 推送到镜像仓库、PyPI |
| 部署 | 部署到环境 | 开发/测试/预发/生产环境 |
| 验证 | 部署后验证 | 健康检查、冒烟测试 |

## 二、GitHub Actions配置

### 2.1 基础Workflow配置

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11"]
        postgres-version: ["15"]
    
    services:
      postgres:
        image: postgres:\${{ matrix.postgres-version }}
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run linter
        run: |
          flake8 .
          black --check .
          isort --check-only .
          mypy .

      - name: Run tests with pytest
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test-secret-key
        run: |
          pytest --cov=myapp --cov-report=xml --cov-report=term

      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
          fail_ci_if_error: false
\`\`\`

### 2.2 构建并推送Docker镜像

\`\`\`yaml
  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
\`\`\`

### 2.3 部署到服务器

\`\`\`yaml
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/myapp
            docker-compose pull web
            docker-compose up -d web nginx
            docker-compose exec -T web python manage.py migrate
            docker-compose exec -T web python manage.py collectstatic --noinput
\`\`\`

## 三、GitLab CI配置

\`\`\`yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.example.com
  APP_NAME: myapp
  DOCKER_HOST: tcp://docker:2376
  DOCKER_TLS_CERTDIR: "/certs"

lint:
  stage: lint
  image: python:3.11
  before_script:
    - pip install flake8 black isort mypy
  script:
    - flake8 .
    - black --check .
    - isort --check-only .
  only:
    - branches
    - merge_requests

test:
  stage: test
  image: python:3.11
  services:
    - name: postgres:15
      alias: postgres
    - name: redis:7
      alias: redis
  variables:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
    REDIS_URL: redis://redis:6379/0
  before_script:
    - pip install -r requirements.txt -r requirements-dev.txt
  script:
    - pytest --cov=myapp --cov-report=term
  coverage: '/(?i)total.*? (100(?:\\.0+)?\\%|[1-9]?\\d(?:\\.\\d+)?\\%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - |
      if [ "$CI_COMMIT_BRANCH" == "main" ]; then
        docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA $CI_REGISTRY_IMAGE:latest
        docker push $CI_REGISTRY_IMAGE:latest
      fi
  only:
    - main
    - tags

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
  script:
    - ssh deploy@server "cd /opt/myapp && docker-compose pull && docker-compose up -d && docker-compose exec -T web python manage.py migrate"
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
\`\`\`

## 四、部署策略

### 4.1 常见部署策略对比

| 部署策略 |  downtime | 回滚速度 | 资源占用 | 复杂度 | 适用场景 |
|---------|----------|---------|---------|--------|---------|
| 停机部署 | 有 | 快 | 无额外 | 低 | 内部系统、非核心业务 |
| 滚动发布 | 无 | 较快 | 少量额外 | 中 | 大多数业务 |
| 蓝绿部署 | 无 | 极快 | 2倍资源 | 中 | 核心业务、要求快速回滚 |
| 灰度/金丝雀 | 无 | 快 | 少量额外 | 高 | 大流量、新功能验证 |
| A/B测试 | 无 | 快 | 少量额外 | 高 | 用户体验测试 |

### 4.2 滚动发布（Rolling Update）

逐步替换旧版本实例为新版本：
\`\`\`yaml
# docker-compose 滚动更新示例
version: '3.8'
services:
  web:
    image: myapp:latest
    deploy:
      replicas: 4
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
        failure_action: rollback
      rollback_config:
        parallelism: 0
        order: stop-first
      restart_policy:
        condition: on-failure
\`\`\`

Kubernetes滚动更新：
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    RollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
      - name: web
        image: myapp:v2
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

### 4.3 蓝绿部署

同时运行两个版本，通过切换流量实现零停机：

\`\`\`nginx
upstream blue {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

upstream green {
    server 127.0.0.1:8003;
    server 127.0.0.1:8004;
}

server {
    listen 80;
    
    # 切换流量：blue -> green 或 green -> blue
    location / {
        proxy_pass http://blue;
        # proxy_pass http://green;
    }
}
\`\`\`

蓝绿部署流程：
1. 当前流量全部在Blue环境（v1）
2. 部署新版本到Green环境（v2）
3. 在Green环境进行测试验证
4. 切换Nginx/负载均衡配置，流量切到Green
5. 观察监控，有问题快速切回Blue
6. 验证没问题后，Blue环境可以留作下次部署

### 4.4 金丝雀发布（灰度发布）

先让少量用户使用新版本，逐步扩大范围：

\`\`\`nginx
upstream v1 {
    server 127.0.0.1:8001 weight=9;
}

upstream v2 {
    server 127.0.0.1:8002 weight=1;
}

split_clients "\${remote_addr}AAA" $variant {
    10% "v2";
    * "v1";
}

server {
    listen 80;
    
    location / {
        proxy_pass http://$variant;
    }
}
\`\`\`

更精细的灰度可以基于用户ID、请求头、Cookie等路由：
\`\`\`nginx
map $http_cookie $backend {
    default v1;
    ~*beta_tester=true v2;
}
\`\`\`

## 五、数据库迁移策略

### 5.1 迁移原则

1. **向后兼容**：新版本代码要兼容旧版本数据库schema
2. **多步部署**：先加字段/表（不删），部署代码，再清理旧字段
3. **避免长事务**：大表DDL要注意锁表问题，使用pt-online-schema-change或pg_repack
4. **备份优先**：迁移前备份数据库
5. **先在预发环境测试**：验证迁移脚本正确性

### 5.2 常见迁移模式

| 操作 | 风险 | 安全做法 |
|-----|------|---------|
| 加字段 | 低 | 允许NULL或设默认值，直接加 |
| 删字段 | 高 | 先部署代码不再使用该字段，再删除 |
| 加索引 | 中（大表锁） | CONCURRENTLY创建（PostgreSQL） |
| 改字段类型 | 高 | 新建字段，双写，迁移数据，切换 |
| 重命名字段 | 高 | 同改类型，新建字段迁移 |
| 删表 | 高 | 确认无代码使用后再删除 |

## 六、最佳实践与常见坑点

### 6.1 最佳实践

1. **流水线要快**：超过10分钟的流水线会让开发者不想等，优化缓存、并行任务
2. **一次构建多处部署**：同一个镜像在所有环境部署，不重新构建
3. **环境一致性**：开发、测试、生产环境尽可能一致（Docker的优势）
4. **失败尽早反馈**：lint、单元测试放在流水线前面，快速失败
5. **自动化测试是基础**：没有足够的自动化测试就不要谈持续部署
6. **部署后健康检查**：部署完验证应用确实正常运行
7. **版本可追溯**：每次部署对应明确的git commit版本

### 6.2 常见坑点

1. **secrets管理**：不要把密钥、密码硬编码在代码或配置里，用CI/CD的secrets功能
2. **flakey tests**：不稳定的测试（时过时不过）会破坏对CI的信任，要及时修复或删除
3. **部署不迁移数据库**：忘记执行migrate导致应用报错
4. **缓存问题**：CI缓存配置不对，使用了过期依赖
5. **权限问题**：CI runner用户权限不足，部署后文件权限不对
6. **数据库连接耗尽**：部署时新老版本同时连接数据库，超过连接数限制

## 七、面试题

**Q1: CI和CD分别是什么意思？有什么区别？**
A: CI持续集成是频繁合并代码到主干并自动构建测试，尽早发现集成问题；CD持续交付是CI的延伸，代码通过测试后自动部署到预发环境可随时手动发布；持续部署更进一步，自动部署到生产无需人工审核。CI是CD的基础。

**Q2: 蓝绿部署和滚动发布有什么区别？**
A: 滚动发布是逐步替换实例，过程中新旧版本同时存在，资源占用少但回滚慢；蓝绿部署是新版本全量部署好后一次性切换流量，需要双倍资源但回滚极快（切流量就行），没有新旧版本共存问题。

**Q3: 如何在CI/CD中安全管理密钥？**
A: 1) 不要把密钥提交到代码仓库，用环境变量注入；2) 使用CI系统提供的secrets存储功能（GitHub Secrets、GitLab CI Variables）；3) 使用专门的密钥管理服务（HashiCorp Vault、AWS Secrets Manager）；4) 配置文件中的敏感信息加密存储（如ansible-vault、sops）。

**Q4: 数据库迁移如何做到不停机？**
A: 核心原则是向后兼容、多步执行：1) 扩展阶段：添加新字段/表，设为允许NULL，双写新旧数据；2) 部署阶段：部署应用代码，逐步切换到使用新字段；3) 清理阶段：确认旧字段无使用后再删除。大表DDL使用在线DDL工具避免锁表。
`
  },
  {
    id: "pyb-17-6",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "日志体系",
    content: `
# 日志体系

## 一、日志基础

### 1.1 为什么需要日志

日志是应用程序运行时产生的事件记录，是排查问题、监控系统、审计安全的最重要依据：
- **问题排查**：线上故障定位根本原因
- **行为审计**：记录用户操作、数据变更
- **性能分析**：分析接口耗时、慢查询
- **业务统计**：基于日志做业务指标统计
- **安全监控**：发现异常访问、攻击行为

### 1.2 日志级别

| 级别 | 数值 | 使用场景 | 示例 |
|-----|------|---------|------|
| DEBUG | 10 | 开发调试信息，生产环境一般关闭 | 变量值、函数调用参数 |
| INFO | 20 | 正常运行的关键信息 | 服务启动、用户登录、订单创建 |
| WARNING | 30 | 警告但不影响运行，需要关注 | 配置缺失、重试、慢查询 |
| ERROR | 40 | 错误导致部分功能失败 | 数据库连接失败、API调用失败 |
| CRITICAL/FATAL | 50 | 严重错误导致服务不可用 | 内存耗尽、核心服务崩溃 |

正确使用日志级别：
- 不要什么都打DEBUG，生产环境DEBUG量太大会影响性能
- ERROR表示需要人工介入处理的问题
- WARNING是潜在问题，积累多了可能变成ERROR
- 不要用print打日志，print没有级别、格式、输出位置控制

## 二、Python logging模块

### 2.1 基础使用

\`\`\`python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

logger.debug("这是debug信息")
logger.info("这是info信息")
logger.warning("这是warning信息")
logger.error("这是error信息")
logger.critical("这是critical信息")

try:
    1 / 0
except ZeroDivisionError:
    logger.exception("发生了除零错误")
\`\`\`

\`logger.exception()\`会自动包含异常栈信息，在except块中使用非常方便。

### 2.2 核心组件

logging模块四大组件：

| 组件 | 作用 | 常用类 |
|-----|------|-------|
| Logger | 日志记录器，应用代码直接使用 | Logger |
| Handler | 日志处理器，控制日志输出到哪 | StreamHandler、FileHandler、RotatingFileHandler |
| Filter | 过滤器，精细控制哪些日志输出 | Filter |
| Formatter | 格式化器，控制日志输出格式 | Formatter |

\`\`\`python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import sys

logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s'
)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

file_handler = RotatingFileHandler(
    'app.log',
    maxBytes=10 * 1024 * 1024,
    backupCount=10,
    encoding='utf-8'
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

error_handler = TimedRotatingFileHandler(
    'error.log',
    when='midnight',
    interval=1,
    backupCount=30,
    encoding='utf-8'
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)
logger.addHandler(error_handler)

logger.info("日志配置完成")
\`\`\`

### 2.3 日志格式变量

| 变量 | 说明 |
|-----|------|
| %(asctime)s | 时间戳 |
| %(name)s | Logger名称 |
| %(levelname)s | 日志级别名称 |
| %(levelno)s | 日志级别数字 |
| %(message)s | 日志消息内容 |
| %(module)s | 模块名 |
| %(filename)s | 文件名 |
| %(funcName)s | 函数名 |
| %(lineno)d | 行号 |
| %(process)d | 进程ID |
| %(thread)d | 线程ID |
| %(threadName)s | 线程名 |

## 三、结构化日志

### 3.1 为什么需要结构化日志

普通文本日志：
\`\`\`
2024-01-15 10:30:45 - myapp - INFO - 用户123登录成功，IP: 192.168.1.100
\`\`\`
人容易读，但机器很难解析查询。结构化日志输出JSON格式，便于ELK/Loki等工具检索分析。

### 3.2 python-json-logger

\`\`\`python
pip install python-json-logger
\`\`\`

\`\`\`python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(name)s %(levelname)s %(module)s %(message)s %(exc_info)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)

logger.info("用户登录", extra={
    "user_id": 123,
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "action": "login",
    "duration_ms": 45
})
\`\`\`

输出：
\`\`\`json
{
  "asctime": "2024-01-15 10:30:45,123",
  "name": "root",
  "levelname": "INFO",
  "module": "app",
  "message": "用户登录",
  "user_id": 123,
  "ip": "192.168.1.100",
  "action": "login",
  "duration_ms": 45
}
\`\`\`

### 3.3 structlog

structlog提供更强大的结构化日志API，支持上下文绑定：

\`\`\`python
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

logger.info("用户登录", user_id=123, ip="192.168.1.100")

def process_order(order_id):
    log = logger.bind(order_id=order_id)
    log.info("开始处理订单")
    try:
        log.debug("验证订单信息")
        log.info("订单处理完成", amount=99.9)
    except Exception as e:
        log.error("订单处理失败", error=str(e))
        raise
\`\`\`

## 四、Web框架日志配置

### 4.1 Django日志配置

\`\`\`python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {module} {lineno} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(module)s %(message)s',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'request_id': {
            '()': 'myapp.logging.RequestIdFilter',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
            'filters': ['request_id'],
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/myapp/app.log',
            'maxBytes': 10485760,
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'myapp': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
\`\`\`

### 4.2 FastAPI日志中间件

\`\`\`python
import time
import uuid
from fastapi import Request
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        client_ip=request.client.host if request.client else None,
    )
    
    start_time = time.time()
    logger.info("请求开始")
    
    try:
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        logger.info(
            "请求完成",
            status_code=response.status_code,
            duration_ms=round(duration, 2)
        )
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            "请求异常",
            error=str(e),
            duration_ms=round(duration, 2),
            exc_info=True
        )
        raise
\`\`\`

## 五、请求ID链路追踪

### 5.1 请求ID传递

分布式系统中，一个请求经过多个服务，需要用Request ID串联所有日志：

\`\`\`python
# middleware.py
import uuid
import contextvars
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

class RequestIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        request_id = request.META.get("HTTP_X_REQUEST_ID") or str(uuid.uuid4())
        request_id_var.set(request_id)
        
        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response

# logging filter
import logging

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

# 调用下游服务时传递Request ID
import requests

def call_api(url):
    headers = {
        "X-Request-ID": request_id_var.get()
    }
    return requests.get(url, headers=headers)
\`\`\`

## 六、日志采集与分析

### 6.1 ELK Stack

| 组件 | 作用 |
|-----|------|
| Elasticsearch | 分布式搜索存储引擎，存储日志并索引 |
| Logstash | 日志收集处理管道，多源采集、转换、发送 |
| Kibana | 可视化界面，查询、图表、仪表盘 |
| Filebeat | 轻量日志采集器，部署在应用服务器上 |

日志采集流程：
\`\`\`
应用容器 -> stdout/stderr -> Docker日志驱动 -> Filebeat -> Logstash -> Elasticsearch -> Kibana
\`\`\`

Filebeat配置：
\`\`\`yaml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    json.keys_under_root: true
    json.add_error_key: true
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

output.logstash:
  hosts: ["logstash:5044"]

logging.json: true
logging.metrics.enabled: false
\`\`\`

### 6.2 Loki + Grafana

Loki是Grafana Labs推出的日志聚合系统，相比ELK更轻量：
- 只索引标签（label），不索引日志内容，成本更低
- 与Prometheus、Grafana无缝集成
- 使用LogQL查询语法，类似PromQL

\`\`\`
应用 -> Promtail采集 -> Loki存储 -> Grafana查询展示
\`\`\`

## 七、日志最佳实践

### 7.1 应该打什么日志

1. **关键操作**：登录、注册、下单、支付、数据修改
2. **外部依赖调用**：数据库、缓存、第三方API调用的耗时和结果
3. **异常情况**：所有捕获的异常都要打日志，包含上下文
4. **状态变化**：订单状态变更、配置更新、服务启动停止
5. **性能点**：慢查询、耗时较长的操作

### 7.2 不应该打什么日志

1. **敏感信息**：密码、token、密钥、身份证、银行卡号（必须脱敏）
2. **大量内容**：请求响应的完整body（只记录摘要或ID）
3. **循环里的DEBUG**：高频率循环打日志IO开销大
4. **冗余信息**：重复记录相同信息，上层调用已经打的日志

\`\`\`python
# 错误示范 - 打印密码
logger.info(f"用户登录: username={username}, password={password}")

# 正确 - 不打敏感信息
logger.info("用户登录", extra={"username": username})

# 日志脱敏
def mask_phone(phone):
    if phone and len(phone) == 11:
        return phone[:3] + "****" + phone[7:]
    return phone

logger.info("用户注册", extra={"phone": mask_phone(phone)})
\`\`\`

### 7.3 常见坑点

1. **日志打印对象而非字符串**：\`logger.info(user)\` 改为 \`logger.info("用户信息: %s", user)\`
2. **f-string在低级别日志**：即使日志级别不输出，f-string也会执行字符串拼接，用%格式或参数传递
3. **异常不打栈**：\`logger.error("出错了")\` 丢失异常栈，用\`logger.exception()\`或exc_info=True
4. **重复打日志**：底层打了，上层又try catch打一遍，造成重复
5. **日志配置在模块加载时**：导入模块时日志还没配置就使用了，需要在应用入口统一配置
6. **同步日志阻塞**：大量日志同步写文件/网络阻塞业务线程，考虑异步handler

\`\`\`python
# 不好的写法 - DEBUG级别不输出但仍会执行字符串拼接
logger.debug(f"处理用户数据: {user.to_dict()}")

# 好的写法 - 惰性求值，DEBUG关闭时不执行
logger.debug("处理用户数据: %s", user.id)
\`\`\`

## 八、面试题

**Q1: 常见日志级别有哪些？怎么正确使用？**
A: DEBUG开发调试详细信息，生产关闭；INFO正常运行关键事件；WARNING潜在问题但不影响使用；ERROR部分功能失败需要关注；CRITICAL系统级严重错误。原则：ERROR需要人工介入处理，WARNING要关注但不一定马上处理，INFO记录关键业务节点，不要滥用ERROR。

**Q2: 为什么要用结构化日志（JSON格式）？**
A: 传统文本日志是人读友好但机器解析困难，尤其是格式不统一时。JSON结构化日志每个字段都是键值对，便于日志采集系统（ELK/Loki）索引、检索、聚合分析，可以按user_id、request_id、status_code等字段筛选统计，是微服务可观测性的基础。

**Q3: 如何实现跨服务的请求链路追踪？**
A: 1) 生成全局唯一Request ID（UUID）在请求入口（网关/Nginx/中间件）；2) 通过HTTP Header（如X-Request-ID）在服务间传递；3) 日志中都包含这个Request ID；4) 日志采集到统一系统后，可以通过Request ID查出整个调用链路上所有服务的日志。

**Q4: logger.info("User %s logged in", user_id) 和 logger.info(f"User {user_id} logged in") 有什么区别？**
A: 使用%传参是惰性计算，当日志级别高于INFO（如WARNING）时，不会执行字符串拼接操作；f-string会立即计算字符串内容，即使日志不输出也会做格式化，有不必要的性能开销。另外%传参还能被logging的处理器更好地结构化处理。
`
  },
  {
    id: "pyb-17-7",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "监控告警",
    content: `
# 监控告警

## 一、监控体系概述

### 1.1 监控的四大黄金指标

Google SRE提出的四个核心监控指标：

| 指标 | 英文 | 说明 |
|-----|------|------|
| 延迟 | Latency | 处理请求花费的时间，区分成功请求和失败请求的延迟 |
| 流量 | Traffic | 系统负载，QPS、并发数、请求量 |
| 错误 | Errors | 失败请求比例，5xx错误、业务错误码 |
| 饱和度 | Saturation | 资源使用程度，CPU、内存、磁盘、连接池使用率 |

### 1.2 监控分层

| 层级 | 监控对象 | 示例指标 |
|-----|---------|---------|
| 基础设施监控 | 服务器、网络 | CPU、内存、磁盘、网络IO、负载 |
| 中间件监控 | 数据库、缓存、MQ | MySQL连接数、Redis命中率、RabbitMQ积压 |
| 应用监控 | 服务进程 | QPS、错误率、响应时间、JVM/Python GC |
| 业务监控 | 业务指标 | 订单量、支付成功率、注册数、DAU |
| 端用户监控 | 真实用户体验 | 页面加载时间、接口可用率、CDN命中率 |

## 二、Prometheus指标采集

### 2.1 Prometheus核心概念

Prometheus是CNCF毕业的开源监控系统，特点：
- 多维数据模型：指标名+标签键值对
- PromQL查询语言：强大灵活
- 拉模型：主动抓取targets的指标
- 支持服务发现
- 本地时序数据库，高性能

核心组件：
- **Prometheus Server**：采集存储指标，提供PromQL查询
- **Exporter**：暴露指标的HTTP端点，如node_exporter、mysqld_exporter
- **Pushgateway**：短生命周期任务推送指标
- **AlertManager**：处理告警，发送通知
- **Grafana**：可视化仪表盘

### 2.2 指标类型

| 类型 | 说明 | 典型用途 |
|-----|------|---------|
| Counter | 单调递增计数器，只能增加或重置为0 | 请求数、错误数、任务完成数 |
| Gauge | 可升可降的数值 | 温度、内存使用、并发连接数 |
| Histogram | 直方图，分布统计，分桶计数 | 请求延迟分布、响应大小 |
| Summary | 摘要，类似Histogram但客户端计算分位数 | 延迟分位数（不推荐聚合） |

### 2.3 Python客户端 prometheus-client

\`\`\`bash
pip install prometheus-client
\`\`\`

\`\`\`python
from prometheus_client import Counter, Gauge, Histogram, Summary, generate_latest, REGISTRY
import time
import random
from functools import wraps
from flask import Flask, Response

app = Flask(__name__)

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'Number of HTTP requests in progress',
    ['method', 'endpoint']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

DB_QUERY_DURATION = Summary(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type']
)

def track_metrics(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        method = flask_request.method
        endpoint = flask_request.endpoint
        
        REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).inc()
        start_time = time.time()
        status_code = 200
        
        try:
            response = f(*args, **kwargs)
            status_code = response.status_code
            return response
        except Exception as e:
            status_code = 500
            raise
        finally:
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
            REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
            REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).dec()
    return wrapper

from flask import request as flask_request

@app.route('/metrics')
def metrics():
    return Response(generate_latest(REGISTRY), mimetype='text/plain')

@app.route('/api/users')
@track_metrics
def list_users():
    time.sleep(random.uniform(0.01, 0.1))
    return {"users": []}

@app.route('/api/orders')
@track_metrics
def list_orders():
    if random.random() < 0.1:
        return {"error": "server error"}, 500
    time.sleep(random.uniform(0.05, 0.5))
    return {"orders": []}
\`\`\`

### 2.4 FastAPI集成

\`\`\`python
from prometheus_fastapi_instrumentator import Instrumentator, metrics

app = FastAPI()

Instrumentator(
    should_group_status_codes=False,
    excluded_handlers=["/metrics"],
).add(
    metrics.latency(
        metric_name="http_request_duration_seconds",
        buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
    )
).add(
    metrics.requests(
        metric_name="http_requests_total"
    )
).add(
    metrics.requests_in_progress()
).instrument(app).expose(app)
\`\`\`

## 三、PromQL基础查询

### 3.1 常用查询示例

| 需求 | PromQL |
|-----|--------|
| QPS（每秒请求数） | rate(http_requests_total[5m]) |
| 错误率 | sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) |
| P99延迟 | histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, endpoint)) |
| 平均延迟 | rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]) |
| CPU使用率 | 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) |
| 内存使用率 | 100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) |
| 磁盘使用率 \| 100 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"} / node_filesystem_size_bytes * 100) |
| Redis命中率 | rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) |

### 3.2 常用函数

- **rate()**：计算区间向量每秒平均增长率，Counter用
- **irate()**：瞬时增长率，基于最近两个数据点，更灵敏
- **increase()**：区间内总增量
- **sum()/avg()/max()/min()**：聚合函数
- **by()/without()**：分组聚合
- **histogram_quantile()**：计算分位数
- **topk()/bottomk()**：取前k个/后k个

## 四、Grafana仪表盘

### 4.1 关键面板建议

应用服务仪表盘：
1. **概览区**：QPS、错误率、P99延迟、实例数（单值面板+趋势）
2. **流量趋势**：QPS按endpoint堆叠图
3. **延迟分布**：P50/P90/P95/P99延迟折线图
4. **错误分布**：按status_code、endpoint的错误率
5. **运行时指标**：Python GC次数、内存使用、线程数、事件循环延迟
6. **依赖监控**：数据库连接池使用率、Redis延迟、MQ积压

主机监控仪表盘：
1. **资源概览**：CPU、内存、磁盘、网络（各主机表格）
2. **CPU使用率**：按mode拆分（user/system/iowait/idle）
3. **内存**：used/cached/buffers/free
4. **磁盘IO**：读写速率、IOPS、使用率
5. **网络**：进出流量、TCP连接数、丢包
6. **Load负载**：1/5/15分钟负载

## 五、AlertManager告警

### 5.1 告警规则配置

\`\`\`yaml
# prometheus/rules/app.yml
groups:
  - name: application_alerts
    rules:
      - alert: ServiceDown
        expr: up{job="myapp"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务实例 {{ $labels.instance }} 下线"
          description: "服务 {{ $labels.job }} 实例 {{ $labels.instance }} 已经1分钟无法抓取"
      
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
          / sum(rate(http_requests_total[5m])) by (service) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.service }} 错误率过高"
          description: "错误率 {{ $value | humanizePercentage }}，超过5%阈值"
      
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务 {{ $labels.service }} P99延迟过高"
          description: "P99延迟 {{ $value }}s，超过1s阈值"
      
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "主机 {{ $labels.instance }} CPU使用率过高"
          description: "CPU使用率 {{ $value | humanize }}%，持续10分钟"
      
      - alert: DiskSpaceAlmostFull
        expr: 100 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "主机 {{ $labels.instance }} 磁盘空间不足"
          description: "磁盘使用率 {{ $value | humanize }}%"
\`\`\`

### 5.2 AlertManager配置

\`\`\`yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'smtp-password'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10m
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      repeat_interval: 15m
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-dingtalk:8060/dingtalk/default/send'
  
  - name: 'critical'
    email_configs:
      - to: 'oncall@example.com'
    webhook_configs:
      - url: 'http://webhook-dingtalk:8060/dingtalk/critical/send'
    pagerduty_configs:
      - service_key: 'pagerduty-service-key'
  
  - name: 'warning'
    webhook_configs:
      - url: 'http://webhook-dingtalk:8060/dingtalk/warning/send'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
\`\`\`

### 5.3 告警设计原则

1. **告警必须可操作**：收到告警要知道做什么，不要告警没人处理
2. **严重级别清晰**：P0(critical)立即处理、P1(warning)工作时间处理、P2(info)记录
3. **避免告警风暴**：合理使用for持续时间、抑制规则、分组
4. **高信噪比**：减少误报，宁少勿滥，狼来了效应
5. **包含上下文**：告警内容说清楚是什么、在哪、怎么处理
6. **分级告警**：严重问题打电话/短信，一般问题发消息/邮件

## 六、APM性能监控

APM（Application Performance Monitoring）应用性能监控，提供代码级链路追踪：

| 工具 | 厂商 | 特点 |
|-----|------|------|
| Jaeger | CNCF/Uber | 开源，OpenTracing兼容 |
| Zipkin | Twitter | 开源，轻量 |
| SkyWalking | Apache | 国产，多语言支持好，无侵入 |
| New Relic | 商业 | SaaS服务，功能强大 |
| Datadog | 商业 | SaaS，云原生集成好 |
| Sentry | 开源/商业 | 错误监控为主，也有APM |

### 6.1 OpenTelemetry

OpenTelemetry是CNCF统一可观测性标准，合并了OpenTracing和OpenCensus：
- **Traces**：分布式链路追踪
- **Metrics**：指标
- **Logs**：日志

Python快速接入：
\`\`\`bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi \\
    opentelemetry-instrumentation-requests opentelemetry-exporter-otlp
\`\`\`

\`\`\`python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

resource = Resource.create({"service.name": "myapp", "service.version": "1.0.0"})
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://jaeger:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)
RequestsInstrumentor().instrument()
\`\`\`

## 七、最佳实践与常见坑点

### 7.1 最佳实践

1. **RED/USE方法**：服务用RED（Rate/Errors/Duration），资源用USE（Utilization/Saturation/Errors）
2. **标签基数控制**：不要把user_id、request_id等高基数维度作为Prometheus标签
3. **Histogram分桶合理**：根据实际延迟分布设置buckets，不要用默认值
4. **告警分级**：P0立即响应（5分钟）、P1工作时间（1小时）、P2天级处理
5. **监控覆盖全面**：基础设施、中间件、应用、业务每层都要有监控
6. **先告警后优化**：发现问题先加告警，再解决根本问题
7. **监控自身也要监控**：Prometheus挂了谁都不知道，需要对监控系统本身做告警

### 7.2 常见坑点

1. **Counter误用为Gauge**：只增不减的用Counter，不要用Gauge存请求数
2. **rate()使用问题**：rate至少要4个数据点，区间选5m以上，不要用rate(1m)
3. **Summary不能聚合**：跨实例聚合分位数用Histogram，不要用Summary
4. **标签爆炸**：高基数标签（如URL带query参数）导致Prometheus内存暴涨
5. **告警阈值太低**：阈值太严导致误报太多，没人管了
6. **忘记摘挂告警**：发布维护时没有静默告警，半夜被误报叫醒
7. **只有技术指标没有业务指标**：技术指标正常不代表业务正常，订单量跌0要告警

## 八、面试题

**Q1: Prometheus的Counter和Gauge有什么区别？分别用于什么场景？**
A: Counter是单调递增的计数器，只能增加或重置为0，适合请求总数、错误数这种累计值，用rate()计算速率；Gauge是可上下波动的值，适合温度、内存使用、并发连接数这种瞬时值，可以直接取当前值、计算avg/max/min。

**Q2: Histogram和Summary有什么区别？**
A: 两者都用于统计分布。Histogram在服务端分桶存储，histogram_quantile在Prometheus侧计算分位数，支持跨实例聚合；Summary在客户端直接计算分位数，精度更高但不能聚合，因为不同实例的分位点无法直接平均。推荐优先使用Histogram。

**Q3: 什么是高基数标签问题？为什么Prometheus怕这个？**
A: 标签基数是指标的不同标签组合数，比如把user_id作为标签，有100万用户就有100万条时间序列。Prometheus的时序数据库是按指标+标签组合作key存储的，高基数会导致时间序列数量爆炸，内存和磁盘占用剧增，查询变慢甚至OOM。高基数维度放日志里，不要放指标标签。

**Q4: 设计一个告警规则应该考虑什么？**
A: 1) 告警条件明确，基于什么指标什么阈值；2) for持续时间，避免毛刺触发；3) 严重级别合理，区分warning和critical；4) 告警信息清晰，包含问题描述、影响范围、处理建议；5) 配置抑制和分组，避免重复告警；6) 接收人正确，严重告警要确保有人及时响应。
`
  },
  {
    id: "pyb-17-8",
    group: "测试部署与监控",
    icon: "🛠️",
    title: "性能调优",
    content: `
# 性能调优

## 一、性能调优概述

### 1.1 性能优化原则

1. **先测量再优化**：不要凭感觉优化，用数据说话，80%的性能问题在20%的代码里
2. **避免过早优化**：正确比快重要，先保证功能正确再谈性能
3. **权衡取舍**：空间换时间、时间换空间，没有免费午餐
4. **优化瓶颈**：优化非瓶颈部分是浪费时间，找到真正的瓶颈点
5. **持续监控**：优化后要验证效果，性能没有终点

### 1.2 常见性能瓶颈

| 层级 | 常见问题 |
|-----|---------|
| 应用层 | 算法复杂度高、同步阻塞、锁竞争、不必要的计算 |
| 数据库层 | 慢查询、缺少索引、N+1查询、大表JOIN、连接池耗尽 |
| 缓存层 | 缓存命中率低、缓存穿透/击穿、大Key/热Key |
| 网络层 | 带宽不足、延迟高、HTTP头太大、没有连接复用 |
| 系统层 | CPU饱和、内存泄漏、磁盘IO瓶颈、文件描述符耗尽 |

## 二、Python性能分析

### 2.1 cProfile：CPU性能分析

cProfile是Python标准库的性能分析工具，统计函数调用次数和耗时：

\`\`\`bash
# 分析整个脚本
python -m cProfile -s cumulative myscript.py

# 生成统计文件用工具查看
python -m cProfile -o profile.stats myscript.py
\`\`\`

代码中使用：
\`\`\`python
import cProfile
import pstats
import io

def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

def fast_function():
    return sum(range(1000000))

def main():
    for _ in range(10):
        slow_function()
        fast_function()

if __name__ == "__main__":
    profiler = cProfile.Profile()
    profiler.enable()
    
    main()
    
    profiler.disable()
    s = io.StringIO()
    ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
    ps.print_stats(20)
    print(s.getvalue())
\`\`\`

输出字段说明：
- **ncalls**：调用次数
- **tottime**：函数自身耗时（不含子函数）
- **percall**：tottime/ncalls
- **cumtime**：累计耗时（含子函数）
- **percall**：cumtime/ncalls
- **filename:lineno(function)**：函数位置

### 2.2 py-spy：采样分析器

py-spy是非侵入式采样分析器，不需要修改代码，可以分析正在运行的进程：

\`\`\`bash
pip install py-spy

# 实时查看函数耗时
py-spy top --pid 12345

# 生成火焰图
py-spy record -o profile.svg --pid 12345

# 分析启动脚本
py-spy record -o profile.svg -- python myscript.py
\`\`\`

火焰图怎么看：
- X轴是CPU时间占比，宽度越宽占用越多
- Y轴是调用栈深度，下面的是调用方，上面的是被调用方
- 找**宽的平顶**，那就是性能瓶颈
- 颜色没有特殊含义，只是区分不同函数

### 2.3 line_profiler：行级耗时

line_profiler分析每行代码的耗时：

\`\`\`bash
pip install line_profiler
\`\`\`

\`\`\`python
from line_profiler import LineProfiler

def process_data(data):
    result = []
    for item in data:
        transformed = item * 2
        result.append(transformed)
    return sorted(result)

def calculate_sum(numbers):
    total = 0
    for n in numbers:
        total += n * n
    return total

lp = LineProfiler()
lp.add_function(process_data)
lp.add_function(calculate_sum)
lp_wrapper = lp(main)
lp_wrapper()
lp.print_stats()
\`\`\`

### 2.4 memory_profiler：内存分析

\`\`\`bash
pip install memory_profiler
\`\`\`

\`\`\`python
from memory_profiler import profile

@profile
def memory_hungry_function():
    a = [i for i in range(1000000)]
    b = [i * 2 for i in a]
    del a
    c = b[:500000]
    return c

if __name__ == "__main__":
    memory_hungry_function()
\`\`\`

## 三、慢查询优化

### 3.1 如何发现慢查询

Django配置慢查询日志：
\`\`\`python
# settings.py
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
    },
}

# 或者用中间件记录慢查询
import time
from django.db import connection

class SlowQueryMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = (time.time() - start_time) * 1000
        
        for q in connection.queries:
            q_time = float(q['time']) * 1000
            if q_time > 100:
                logger.warning(f"慢查询: {q_time}ms - {q['sql']}")
        
        return response
\`\`\`

SQLAlchemy事件监听：
\`\`\`python
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info["query_start"] = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info["query_start"]
    if total > 0.1:
        logger.warning(f"慢查询 {total:.3f}s: {statement}")
\`\`\`

### 3.2 常见SQL优化

1. **添加合适索引**：WHERE、JOIN、ORDER BY的字段考虑加索引
2. **避免SELECT ***：只查需要的字段
3. **分页优化**：深分页用WHERE id > xxx LIMIT xxx，不要用OFFSET 100000
4. **避免N+1查询**：使用select_related/prefetch_related（Django）或joinedload（SQLAlchemy）
5. **批量操作**：bulk_create、bulk_update代替循环单条插入
6. **JOIN优化**：小表驱动大表，JOIN字段加索引
7. **避免在索引字段上做函数运算**：WHERE DATE(create_time) = 'xxx' 导致索引失效

\`\`\`python
# 不好的写法 - N+1查询
def list_orders_bad():
    orders = Order.objects.all()[:100]
    for order in orders:
        print(order.user.name)  # 循环里查数据库

# 好的写法 - 一次性JOIN查出
def list_orders_good():
    orders = Order.objects.select_related('user').all()[:100]
    for order in orders:
        print(order.user.name)

# 批量创建
users = [User(name=f"user{i}") for i in range(1000)]
User.objects.bulk_create(users)  # 一条INSERT插入多行，比循环save快100倍
\`\`\`

### 3.3 EXPLAIN分析执行计划

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
\`\`\`

关键字段：
- **type**：ALL全表扫描 < index < range < ref < eq_ref < const，至少要range级别
- **key**：实际使用的索引，如果NULL说明没用到索引
- **rows**：预估扫描行数，越少越好
- **Extra**：Using filesort/Using temporary需要优化，Using index是覆盖索引好

## 四、Gunicorn/Uvicorn调优

### 4.1 Worker数量配置

Gunicorn Worker不是越多越好，经验公式：
\`\`\`
workers = CPU核心数 * 2 + 1
\`\`\`

为什么不是越多越好：
- Python GIL限制，CPU密集型一个进程同一时刻只能跑一个线程
- 太多Worker进程导致频繁上下文切换
- 每个Worker占用内存，太多Worker耗尽内存
- 数据库连接数有限，每个Worker一个连接池，Worker太多连接爆了

CPU密集型（计算、图像处理）：
\`\`\`
workers = CPU核心数
worker_class = sync
\`\`\`

IO密集型（Web API、数据库操作多）：
\`\`\`
workers = CPU核心数 * 2
# 或者用异步worker
worker_class = gevent  # 需要安装gevent
worker_connections = 1000
\`\`\`

### 4.2 常用配置说明

\`\`\`python
# gunicorn.conf.py
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 30
graceful_timeout = 30
keepalive = 5
preload_app = True
\`\`\`

| 参数 | 作用 | 建议值 |
|-----|------|-------|
| workers | Worker进程数 | CPU*2+1 |
| worker_class | Worker模式 | sync/gevent/uvicorn.workers.UvicornWorker |
| max_requests | 处理多少请求后重启Worker | 10000-50000，防止内存泄漏 |
| max_requests_jitter | 重启抖动值 | max_requests的10%，避免所有Worker同时重启 |
| timeout | 请求超时时间 | 30s，长时间任务不要走HTTP |
| preload_app | 预加载应用 | True，节省内存，支持SO_REUSEPORT |

## 五、数据库连接池调优

### 5.1 连接池配置原则

连接数公式：
\`\`\`
连接池大小 = ((核心数 * 2) + 1) * 每个worker连接数
\`\`\`

PostgreSQL默认max_connections=100，不要开太大：
- 每个连接占用约10MB内存
- 连接太多数据库CPU调度开销大
- 实际上几百个并发连接足够处理数万QPS

SQLAlchemy连接池配置：

\`\`\`python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    pool_timeout=30,
)
\`\`\`

| 参数 | 说明 | 建议值 |
|-----|------|-------|
| pool_size | 常驻连接数 | 5-20，根据Worker数量计算 |
| max_overflow | 额外溢出连接数 | 10-30，突发流量 |
| pool_recycle | 连接回收时间（秒） | 3600，避免数据库超时断开 |
| pool_pre_ping | 取连接前ping检查 | True，防止拿到死连接 |
| pool_timeout | 获取连接等待超时 | 30s |

## 六、缓存策略优化

### 6.1 多级缓存

浏览器缓存 -> CDN -> Nginx缓存 -> 进程内缓存 -> Redis分布式缓存 -> 数据库

\`\`\`python
from functools import lru_cache
import redis
import json

r = redis.Redis()

def get_user(user_id):
    # 1. 本地缓存
    cached = local_cache.get(f"user:{user_id}")
    if cached:
        return cached
    
    # 2. Redis缓存
    data = r.get(f"user:{user_id}")
    if data:
        user = json.loads(data)
        local_cache.set(f"user:{user_id}", user, ttl=60)
        return user
    
    # 3. 数据库
    user = db.query(User).get(user_id)
    if user:
        r.setex(f"user:{user_id}", 3600, json.dumps(user.to_dict()))
        local_cache.set(f"user:{user_id}", user, ttl=60)
    return user
\`\`\`

### 6.2 缓存优化要点

1. **设置合理过期时间**：热点数据长一点，防止雪崩加随机值
2. **缓存预热**：启动时加载热点数据
3. **避免大Key**：单个value不要超过10KB，大对象拆分
4. **避免热Key**：热Key复制多份打散，本地缓存兜底
5. **缓存击穿防护**：热点Key用互斥锁，永不过期+后台异步更新
6. **空值缓存**：不存在的数据也缓存短时间，防穿透

## 七、压测工具

### 7.1 ab（Apache Bench）

简单易用的HTTP压测工具：
\`\`\`bash
ab -n 10000 -c 100 http://localhost:8000/api/users
\`\`\`
- -n：总请求数
- -c：并发数
- -k：开启keepalive

### 7.2 wrk/wrk2

高性能压测工具，支持Lua脚本：
\`\`\`bash
wrk -t4 -c100 -d30s http://localhost:8000/api/users
\`\`\`
- -t：线程数（一般等于CPU核心数）
- -c：连接数
- -d：压测时长
- wrk2支持固定QPS压测：\`--rate 1000\`

### 7.3 locust：Python编写的分布式压测工具

\`\`\`python
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        response = self.client.post("/api/login", json={
            "username": "test",
            "password": "test123"
        })
        self.token = response.json()["token"]
    
    @task(10)
    def list_users(self):
        self.client.get("/api/users")
    
    @task(3)
    def get_user_detail(self):
        self.client.get("/api/users/1")
    
    @task(1)
    def create_order(self):
        self.client.post(
            "/api/orders",
            json={"product_id": 1, "quantity": 1},
            headers={"Authorization": f"Bearer {self.token}"}
        )
\`\`\`

运行：
\`\`\`bash
locust -f locustfile.py --host=http://localhost:8000
# 打开 http://localhost:8089 设置并发数和启动速率
\`\`\`

## 八、Python代码层面优化

### 8.1 常见优化技巧

| 优化手段 | 效果 | 示例 |
|---------|------|------|
| 使用内置函数/数据结构 | 快数倍到数十倍 | 用list/dict/set推导式，用内置sum/max |
| 用生成器代替列表 | 节省内存 | (x*2 for x in big_list) 而非 [x*2 for x ...] |
| 局部变量访问更快 | 快20-30% | 把频繁访问的属性/方法赋值给局部变量 |
| 避免属性查找 | 快 | 在循环外先取到局部变量 |
| 使用join拼接字符串 | 快很多 | ''.join(list) 而非 += |
| 使用合适的数据结构 | 数量级差异 | 查存在用set不用list，O(1) vs O(n) |
| 避免全局变量 | 略快 | 函数内访问全局变量比局部慢 |

\`\`\`python
# 不好的写法
def process_items_bad(items):
    result = ""
    for item in items:
        result += str(item)
    return result

# 好的写法 - join比+=高效
def process_items_good(items):
    return ''.join(str(item) for item in items)

# 不好的写法 - 每次循环都属性查找
def calculate_bad(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i] * numbers[i]
    return total

# 好的写法 - 局部变量，直接迭代
def calculate_good(numbers):
    total = 0
    append = total.__add__
    for n in numbers:
        total = append(n * n)
    return total

# 快的写法 - 用内置和生成器
def calculate_fast(numbers):
    return sum(n * n for n in numbers)
\`\`\`

### 8.2 异步IO优化IO密集型

对于大量IO操作（数据库、HTTP请求），用异步框架：
\`\`\`python
import asyncio
import aiohttp
import time

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# 顺序请求可能需要几秒，并发几百毫秒完成
urls = [f"https://api.example.com/users/{i}" for i in range(100)]
results = asyncio.run(fetch_all(urls))
\`\`\`

### 8.3 多进程利用多核

CPU密集型任务用多进程绕过GIL：
\`\`\`python
import time
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

def cpu_heavy_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

if __name__ == "__main__":
    numbers = [10_000_000] * 8
    
    # 单进程
    start = time.time()
    results = [cpu_heavy_task(n) for n in numbers]
    print(f"单进程: {time.time() - start:.2f}s")
    
    # 多进程
    start = time.time()
    with ProcessPoolExecutor(max_workers=multiprocessing.cpu_count()) as executor:
        results = list(executor.map(cpu_heavy_task, numbers))
    print(f"多进程: {time.time() - start:.2f}s")
\`\`\`

## 九、最佳实践与常见坑点

### 9.1 性能调优最佳实践

1. **先测量再优化**：用profiler找到瓶颈，不要凭感觉优化
2. **优化热点路径**：20%代码占用80%时间，优化那20%
3. **优化顺序**：数据库优化 > 缓存 > 架构 > 代码微优化
4. **不要过度优化**：代码可读性更重要，瓶颈不在就别优化
5. **优化前后对比**：用基准测试量化优化效果
6. **渐进式优化**：一次改一个地方，验证效果再继续
7. **考虑扩展**：优化单实例性能不如考虑水平扩展

### 9.2 常见坑点

1. **过早优化**：写代码时刻意"优化"反而让代码难读，瓶颈往往不在那
2. **微优化无意义**：把i++换成++i这种在Python里没用，热点在循环里的IO和计算
3. **忽视数据库优化**：数据库优化带来的提升是数量级的，比代码优化效果大得多
4. **缓存使用不当**：缓存没设过期时间导致内存泄漏，缓存更新不及时导致脏数据
5. **Gunicorn worker太多**：超过CPU核数太多反而上下文切换拖慢性能
6. **连接池配置不合理**：太小不够用排队，太大数据库扛不住
7. **压测环境与生产不一致**：压测结果没有参考价值

## 十、面试题

**Q1: 如何定位Python应用的性能瓶颈？**
A: 1) 用cProfile分析CPU耗时，找出耗时最长的函数；2) 用py-spy对正在运行的进程采样生成火焰图，不重启服务；3) 数据库开启慢查询日志，找慢SQL；4) 用memory_profiler分析内存泄漏；5) 用APM工具（SkyWalking/Jaeger）看链路耗时，找到慢的服务调用。

**Q2: Gunicorn worker数量设多少合适？为什么不是越多越好？**
A: 经验公式是CPU核心数*2+1。太多worker不好因为：1) Python GIL限制同一进程同一时刻只能一个线程执行Python字节码，CPU密集型worker多了反而抢CPU；2) 每个进程占用内存，多了内存耗尽；3) 每个worker有数据库连接池，连接数过多数据库扛不住；4) 进程间上下文切换开销增大。

**Q3: 如何优化数据库慢查询？**
A: 1) EXPLAIN分析执行计划，看有没有走索引；2) 给WHERE/JOIN/ORDER BY字段加合适索引；3) 避免SELECT *只查需要字段；4) 避免N+1查询用select_related/joinedload；5) 深分页改用基于游标的分页；6) 大表加索引用CONCURRENTLY避免锁表；7) 复杂查询考虑冗余字段或宽表，或者用ES做搜索。

**Q4: 压测时应该关注哪些指标？**
A: 1) QPS/TPS：每秒处理请求数；2) 延迟：平均、P50、P95、P99、P999延迟；3) 错误率：压测过程中错误率多少；4) 资源使用率：CPU、内存、磁盘IO、网络；5) 数据库指标：连接数、慢查询、QPS；6) 缓存：命中率、连接数；7) 饱和点：QPS到多少时延迟陡增、错误率上升，找到系统瓶颈。
`
  }
]