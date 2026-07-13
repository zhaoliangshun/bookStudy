// =============================================================
// FastAPI 测试与部署全书 - 第 1 批章节（测试基础 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-overview: 测试概览
//   ft-starlette: FastAPI 测试体系
//   ft-pytest: pytest 入门与配置
//   ft-testclient: 第一个 TestClient 测试
//   ft-httpx: httpx 异步测试
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：测试概览
  // ============================================================
  {
    id: "ft-overview",
    group: "测试基础",
    icon: "🧪",
    title: "测试概览",
    content: `# 测试概览

## 一、为什么需要测试

### 1.1 生活类比：测试就像给代码做体检

人要定期体检，为什么？因为很多病在早期没有症状，等你自己感觉到疼的时候，往往已经晚了。代码也是一样：很多 bug 在写出来的那一刻没有暴露，等到上线后被真实用户撞上，损失可能已经是十倍、百倍。

测试，就是给你的代码做"体检"——在它还没伤害任何人之前，把潜在问题找出来。

| 场景 | 体检 | 测试 |
|------|------|------|
| 时机 | 还没生病时主动检查 | 还没上线时主动跑用例 |
| 目的 | 早发现、早治疗 | 早发现、早修复 |
| 代价 | 花几十分钟抽血化验 | 花几秒钟跑一次 pytest |
| 不做的后果 | 小病拖成大病，治疗费翻倍 | 小 bug 拖成线上事故，修复费翻倍 |

有人会说："我代码写得很小心，不需要测试。"这就像说"我身体很好，不需要体检"一样——你觉得自己很好，但客观事实未必如此。**测试不是因为你信不过自己，而是因为你信不过"未来的自己"和"团队里的其他人"。**

### 1.2 没有测试的真实代价

来看一个真实场景：你写了一个用户注册接口，今天上线。三个月后，产品要求把"用户名最少 3 位"改成"最少 6 位"。你改了一行代码，自测了一下能跑，就上线了。结果第二天客服炸了——老用户里有人用户名是 4 位、5 位的，他们现在登录直接报错。

如果有测试，这种问题在改代码的当天就会被发现：测试用例里写死了"用户名 3 位应该注册成功"，你改了规则后，这条测试立刻变红。**测试的本质是把你脑子里的"假设"变成可执行的"断言"。** 你假设"3 位用户名合法"，测试就替你永远盯着这个假设，一旦被破坏立刻报警。

### 1.3 测试带来的三个隐形收益

很多人只看到测试的"找 bug"功能，但其实它还有三个更重要的隐形收益：

1. **重构的勇气**：有测试兜底，你才敢动祖传代码。没有测试的代码，谁都不敢改，最后变成"技术债黑洞"。
2. **活文档**：好的测试用例就是最好的文档——"输入 X 应该返回 Y"比任何注释都清楚。
3. **设计反馈**：如果一个函数很难写测试，说明它依赖太多、职责太杂。测试是代码设计的"试金石"。

## 二、测试金字塔

### 2.1 经典三层结构

测试金字塔是 Mike Cohn 在《Succeeding with Agile》里提出的经典模型，它用三角形的形状告诉你：**越往下的测试越多、越快、越便宜；越往上的测试越少、越慢、越贵。**

\`\`\`
            /\\
           /  \\          E2E 测试（少）
          /----\\         慢、贵、易碎
         /      \\
        / 集成   \\       集成测试（中）
       /  测试    \\      速度、价格适中
      /------------\\
     /              \\
    /   单元测试      \\   单元测试（多）
   /                  \\  快、便宜、稳定
  ----------------------
\`\`\`

| 层级 | 数量占比 | 速度 | 成本 | 稳定性 | 测什么 |
|------|---------|------|------|--------|--------|
| 单元测试 | 70% | 毫秒级 | 极低 | 高 | 单个函数、单个类的逻辑 |
| 集成测试 | 20% | 秒级 | 中 | 中 | 多模块协作、与数据库/外部服务交互 |
| E2E 测试 | 10% | 分钟级 | 高 | 低 | 完整用户流程，端到端 |

### 2.2 为什么是金字塔而不是倒三角

生活类比：盖楼房。地基（单元测试）要打得最宽最厚，因为整栋楼都压在它上面；中间楼层（集成测试）适量；楼顶的装饰（E2E 测试）少而精。如果你倒过来——地基薄薄一层，楼顶堆满东西——这楼随时会塌。

倒三角测试（E2E 多、单元少）的典型毛病：**测试又慢又脆**。改一行代码，50 个 E2E 测试挂了，你花一上午排查，发现只是因为按钮文案从"确定"改成了"确认"。这种"假阳性"会慢慢消磨团队对测试的信任，最后大家干脆不写测试了。

### 2.3 FastAPI 项目里的金字塔长什么样

| 层级 | FastAPI 项目里的例子 |
|------|---------------------|
| 单元测试 | 测试一个 \`calculate_tax(price)\` 函数返回对不对 |
| 集成测试 | 测试 \`POST /users\` 是否真的往数据库里写了一条记录 |
| E2E 测试 | 启动完整服务，用浏览器/Playwright 模拟用户注册→登录→下单 |

FastAPI 的 \`TestClient\` 主要服务于**集成测试**这一层——它不走网络，但会完整跑一遍路由、依赖注入、校验、序列化。这正是 FastAPI 测试最甜的点。

## 三、FastAPI 测试的优势

为什么在所有 Python Web 框架里，FastAPI 的测试体验被公认最好？因为它从设计之初就把"可测试性"焊进了基因。

### 3.1 类型系统 = 免费的契约

FastAPI 用 Pydantic + 类型注解定义接口。这意味着你的请求体、响应体都有明确的 schema，测试时不用猜"这个字段是字符串还是数字"。

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 用 Pydantic 定义请求体，字段类型一目了然
class CreateUserRequest(BaseModel):
    username: str          # 用户名必须是字符串
    age: int               # 年龄必须是整数
    email: str | None = None  # 邮箱可选，默认 None

@app.post("/users")
def create_user(req: CreateUserRequest):
    # 业务逻辑
    return {"id": 1, **req.model_dump()}
\`\`\`

测试时，如果你传了 \`{"username": "tom", "age": "二十"}\`（age 是字符串），FastAPI 会自动返回 422 校验错误，你根本不用自己写校验逻辑——**框架替你校验，你替框架测试，分工明确。**

### 3.2 OpenAPI 自动文档 = 可对照的接口规范

FastAPI 会自动生成 OpenAPI 文档（/docs）。测试时你可以直接对照文档里的 schema 写断言，不用担心"文档和代码不一致"——因为文档就是从代码生成的。

### 3.3 依赖注入 = 可替换的零件

FastAPI 的 \`Depends\` 机制让你可以轻松替换依赖。测试数据库？换成内存 SQLite。第三方 API？换成 mock。这是后面"测试数据库与认证"章节的核心，这里先埋个伏笔。

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 真实环境：从配置读数据库 URL
def get_db_url():
    return "postgresql://user:pass@prod-db/mydb"

# 测试环境：用 dependency_overrides 一行替换
def override_get_db_url():
    return "sqlite:///:memory:"

app.dependency_overrides[get_db_url] = override_get_db_url
\`\`\`

### 3.4 同步异步通吃

FastAPI 同时支持 \`def\` 和 \`async def\` 路由，测试工具也同步异步都有：\`TestClient\` 走同步，\`httpx.AsyncClient\` 走异步。你不会因为用了 async 就被迫用难用的测试工具。

## 四、测试类型详解

光知道"单元/集成/E2E"还不够，工程里你会遇到更多细分类型。下面逐个讲清楚。

| 类型 | 定义 | FastAPI 例子 | 跑得快不快 |
|------|------|-------------|-----------|
| 单元测试（Unit）| 测试最小单元，不碰外部依赖 | 测 \`hash_password()\` 函数 | 极快 |
| 集成测试（Integration）| 多模块协作，可碰数据库 | 测 \`POST /users\` + 真实 DB | 中 |
| 功能测试（Functional）| 验证功能是否符合需求，常与集成测试重叠 | 测"注册成功后能登录"完整链路 | 中 |
| E2E 测试（End-to-End）| 从用户视角走完整流程 | Playwright 模拟浏览器点注册按钮 | 慢 |
| 冒烟测试（Smoke）| 上线前快速验证核心链路没挂 | 只测首页能打开、登录能成功 | 快 |
| 回归测试（Regression）| 修 bug 后验证没引入新问题 | 重跑历史用例，确保旧功能还在 | 看用例量 |

### 4.1 冒烟测试：上线的"烟雾报警器"

生活类比：买新房拿到钥匙，你不会立刻验收每块瓷砖，而是先开灯、开水龙头、冲个马桶——核心功能没炸，就算"冒烟测试"通过。FastAPI 项目里，冒烟测试通常就是几个请求：首页 200、健康检查 200、登录接口能返回 token。

### 4.2 回归测试：bug 的"防复发现锁"

你修了一个 bug，第一件事不是上线，而是写一个测试**复现这个 bug**，确保它红着，然后再修，修到它变绿。这个测试以后永远跑着——一旦哪天它又红了，说明 bug 复发了。这就是回归测试的精髓：**让修过的 bug 永远不再回来。**

## 五、测试驱动开发 TDD 简介

### 5.1 TDD 的三步循环

TDD（Test-Driven Development）的核心是"先写测试，再写代码"，循环三步：

1. **红（Red）**：写一个失败的测试，描述你想要的功能。
2. **绿（Green）**：写最简单的代码让测试通过（哪怕硬编码返回值）。
3. **重构（Refactor）**：在测试保护下优化代码结构。

\`\`\`
   写测试 ──> 测试失败（红）──> 写代码 ──> 测试通过（绿）──> 重构 ──┐
        ^                                                       │
        └───────────────────────────────────────────────────────┘
\`\`\`

### 5.2 生活类比：先想好菜谱再下厨

TDD 就像做饭前先写菜谱：你先想清楚"这道菜应该咸鲜口、出锅是金黄色"（写测试），然后才去买菜、切菜、炒菜（写代码）。如果你边炒边想，很容易炒糊或者忘放盐。

TDD 不是银弹，它适合"需求明确"的场景。对于探索性需求，可以先写代码再补测试。但**无论顺序如何，测试必须要有。**

## 六、Demo 1：一个没有测试的 FastAPI 应用（反面教材）

先看一个"裸奔"的应用——它能跑，但任何改动都像在雷区蹦迪。

\`\`\`python
# 文件：main.py（反面教材，没有任何测试）
from fastapi import FastAPI

app = FastAPI()

# 一个内存"数据库"，重启就丢
fake_db = {}

@app.get("/users/{username}")
def get_user(username: str):
    """查询用户。如果用户不存在，返回 None（这是个大坑）。"""
    # 直接返回 dict.get 的结果，可能是 None
    # FastAPI 会把 None 序列化成 null，但前端可能没处理这种情况
    return fake_db.get(username)

@app.post("/users/{username}")
def create_user(username: str, age: int):
    """创建用户。没有校验、没有去重、没有错误处理。"""
    # 不管用户存不存在，直接覆盖
    fake_db[username] = {"username": username, "age": age}
    return {"ok": True}

@app.delete("/users/{username}")
def delete_user(username: str):
    """删除用户。删不存在的用户也不报错。"""
    # pop 加默认值，删不掉也不抛异常
    fake_db.pop(username, None)
    return {"ok": True}
\`\`\`

这个应用的问题：查询不存在的用户返回 \`null\`，前端如果直接读 \`data.username\` 会崩；创建用户能覆盖老用户，数据可能被误删；删除不报错，调用方无法判断到底删没删。**但没有测试，这些问题你一个都不会发现——直到上线。**

## 七、Demo 2：给上面的应用补一个最简单的测试

现在给 Demo 1 补测试。哪怕只补一条，也能立刻暴露"查询不存在用户"的隐患。

\`\`\`python
# 文件：test_main.py
# 用 pytest 风格写测试，函数名以 test_ 开头
from fastapi.testclient import TestClient
from main import app

# 用 TestClient 把 app 包一层，就能像调 HTTP 一样调接口
# TestClient 不需要真正启动服务器，后面章节会详细讲它的原理
client = TestClient(app)

def test_get_existing_user():
    """测试：先创建用户，再查询，应该能查到。"""
    # 先造数据：POST 创建一个叫 tom 的用户
    client.post("/users/tom", params={"age": 18})
    # 再查询
    response = client.get("/users/tom")
    # 断言状态码是 200
    assert response.status_code == 200
    # 断言返回的 body 符合预期
    assert response.json() == {"username": "tom", "age": 18}

def test_get_nonexistent_user():
    """测试：查询一个不存在的用户，暴露返回 null 的隐患。"""
    response = client.get("/users/ghost")
    # 这条断言会失败！因为现在返回的是 200 + null
    # 这正是测试的价值：它把"隐式假设"变成了"显式失败"
    assert response.status_code == 404
\`\`\`

运行测试：

\`\`\`bash
# 安装 pytest 和 httpx（TestClient 依赖 httpx）
pip install pytest httpx

# 跑测试，-v 表示 verbose，打印每个用例的名字
pytest test_main.py -v
\`\`\`

输出大致是：

\`\`\`txt
test_main.py::test_get_existing_user PASSED
test_main.py::test_get_nonexistent_user FAILED

# 第二条测试失败了，因为接口返回 200 + null，不是 404
# 这就是测试在帮你发现问题
\`\`\`

看到失败别沮丧——**测试失败不是测试的问题，是代码的问题被测试照出来了。** 接下来你就可以修代码：让查询不到用户时返回 404。这就是"测试驱动开发"的小循环。

## 八、Demo 3：测试目录结构推荐

项目大了之后，测试全堆在一个文件里会乱。推荐下面的目录结构：

\`\`\`txt
my_project/
├── app/                      # 应用代码
│   ├── __init__.py
│   ├── main.py               # FastAPI 实例
│   ├── routers/              # 路由
│   ├── models/               # Pydantic 模型
│   ├── services/             # 业务逻辑
│   └── deps.py               # 依赖注入
├── tests/                    # 测试代码（与 app 平级）
│   ├── __init__.py
│   ├── conftest.py           # 共享 fixture（pytest 自动发现）
│   ├── unit/                 # 单元测试
│   │   ├── __init__.py
│   │   └── test_services.py  # 测 services 里的纯函数
│   ├── api/                  # API 集成测试（用 TestClient）
│   │   ├── __init__.py
│   │   ├── test_users.py     # 测 /users 相关接口
│   │   └── test_auth.py      # 测 /auth 相关接口
│   └── integration/          # 跨模块集成测试
│       ├── __init__.py
│       └── test_user_flow.py # 测"注册→登录→下单"链路
├── pyproject.toml            # 项目配置（含 pytest 配置）
└── requirements.txt
\`\`\`

要点说明：

- \`tests/\` 与 \`app/\` 平级，不要塞进 \`app/\` 里——测试和生产代码要分开管理。
- \`conftest.py\` 是 pytest 的"共享配置文件"，里面定义的 fixture 所有测试都能用，不需要 import。
- 按"测试类型"分子目录（unit/api/integration），而不是按"模块"分。这样跑某个类型的测试很方便：\`pytest tests/unit\`。
- 每个目录都要有 \`__init__.py\`（除非你用 pytest 的 rootdir 模式且确定不会重名）。

## 九、Demo 4：pyproject.toml / pytest.ini 配置示例

pytest 的配置可以写在 \`pyproject.toml\`（推荐，现代 Python 项目标配）或 \`pytest.ini\`（老式）。下面给一个生产可用的配置。

\`\`\`toml
# 文件：pyproject.toml
[tool.pytest.ini_options]
# 测试文件发现路径
testpaths = ["tests"]

# 测试文件名的匹配规则
python_files = ["test_*.py", "*_test.py"]

# 测试类的匹配规则（类名以 Test 开头，且无 __init__）
python_classes = ["Test*"]

# 测试函数的匹配规则（函数名以 test_ 开头）
python_functions = ["test_*"]

# 默认命令行参数：每次跑 pytest 都自动加这些参数
addopts = [
    "-v",                # 显示每个用例的名字
    "--strict-markers",  # 未注册的 mark 会报错，防止打错字
    "--tb=short",        # 失败时显示简短的 traceback
    "--cov=app",         # 统计 app 目录的覆盖率
    "--cov-report=term-missing",  # 终端报告里显示没覆盖到的行
]

# 自定义标记，配合 --strict-markers 使用
markers = [
    "slow: 跑得慢的用例，可用 -m 'not slow' 跳过",
    "integration: 集成测试，需要数据库",
    "smoke: 冒烟测试，核心链路",
]

# 异步测试配置（pytest-asyncio 用）
asyncio_mode = "auto"
\`\`\`

如果用老的 \`pytest.ini\`，等价写法：

\`\`\`ini
# 文件：pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --strict-markers --tb=short
markers =
    slow: 跑得慢的用例
    integration: 集成测试
    smoke: 冒烟测试
\`\`\`

常用跑法：

\`\`\`bash
# 跑所有测试
pytest

# 只跑冒烟测试
pytest -m smoke

# 跑除了 slow 以外的所有测试
pytest -m "not slow"

# 只跑某个文件
pytest tests/api/test_users.py

# 失败后只重跑失败的
pytest --lf
\`\`\`

## 十、本章小结

| 概念 | 一句话 |
|------|-------|
| 测试 | 给代码做体检，早发现早修复 |
| 测试金字塔 | 单元多、集成中、E2E 少 |
| 单元测试 | 测最小单元，最快最便宜 |
| 集成测试 | 测多模块协作，FastAPI TestClient 的主战场 |
| E2E 测试 | 测完整用户流程，慢但真实 |
| 冒烟测试 | 上线前核心链路快速验证 |
| 回归测试 | 修完 bug 后防复发 |
| TDD | 红-绿-重构循环 |
| FastAPI 测试优势 | 类型契约 + OpenAPI + 依赖注入 + 同步异步通吃 |
| 目录结构 | tests/{unit,api,integration} + conftest.py |
| pyproject.toml | 配置 testpaths、markers、addopts |

测试不是负担，而是"未来的你"给"现在的你"买的保险。从下一章开始，我们会深入 FastAPI 测试的底层原理——为什么 TestClient 不用启动服务器就能测接口？答案藏在 Starlette 和 httpx 里。
`
  },

  // ============================================================
  // 第 2 章：FastAPI 测试体系（核心章节）
  // ============================================================
  {
    id: "ft-starlette",
    group: "测试基础",
    icon: "🏗️",
    title: "FastAPI 测试体系",
    content: `# FastAPI 测试体系

> 这是全书最核心的一章。理解了这一章，你就理解了 FastAPI 测试的"底层逻辑"——为什么不用启动服务器就能测接口？TestClient 到底是个什么东西？httpx 和 TestClient 是什么关系？答案全在这里。

## 一、FastAPI 继承自 Starlette

### 1.1 一句话真相

很多初学者以为 FastAPI 是"从零造的框架"，其实不是。**FastAPI 是在 Starlette 之上加了一层"类型 + 文档"的壳。** 用面向对象的话说：

\`\`\`python
# FastAPI 源码的核心一行（简化版）
from starlette.applications import Starlette

class FastAPI(Starlette):
    """FastAPI 继承自 Starlette。"""
    pass
\`\`\`

这意味着什么？意味着 Starlette 能干的事 FastAPI 全都能干，Starlette 的测试工具 FastAPI 也能直接用。**FastAPI 的测试体系，本质上是 Starlette 测试体系的"继承"。**

### 1.2 生活类比：父子关系

把 Starlette 想象成"父亲"，FastAPI 想象成"儿子"：

- 父亲（Starlette）会一套武功：路由、中间件、ASGI、TestClient。
- 儿子（FastAPI）继承了父亲全部武功，又自己练了新招：类型注解、自动文档、依赖注入。
- 儿子打架（处理请求）时，用的新招多，但底子是父亲的武功。

所以你给儿子写测试，本质上是在测"父亲教的武功 + 儿子自己的新招"。测试工具 TestClient 是父亲传下来的，儿子直接拿来用。

### 1.3 源码层面的证据

打开 FastAPI 的源码（fastapi/applications.py），你会看到：

\`\`\`python
# FastAPI 源码（简化，只看继承关系）
from starlette.applications import Starlette
from starlette.routing import Route

class FastAPI(Starlette):
    # FastAPI 继承 Starlette，新增了 add_api_route 等方法
    # 但底层的 ASGI 调用、路由分发、中间件链全是 Starlette 的
    def __init__(self, ...):
        super().__init__(...)  # 调用 Starlette 的初始化
        # 额外初始化 OpenAPI、依赖注入等
\`\`\`

这就是为什么 \`from fastapi.testclient import TestClient\` 和 \`from starlette.testclient import TestClient\` 几乎是同一个东西——FastAPI 只是把 Starlette 的 TestClient 重新导出了一下，方便你 import。

## 二、Starlette 的测试能力

### 2.1 ASGI 协议：测试不启动服务器的秘密

要理解 TestClient，必须先理解 ASGI。ASGI（Asynchronous Server Gateway Interface）是 Python 异步 Web 的"标准接口"，类似 WSGI 的异步版。

一个 ASGI app 长这样：

\`\`\`python
# 一个最简单的 ASGI app
async def app(scope, receive, send):
    # scope：请求的元信息（方法、路径、headers）
    # receive：异步函数，用来读请求体
    # send：异步函数，用来发响应
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"application/json")],
    })
    await send({
        "type": "http.response.body",
        "body": b'{"msg": "hello"}',
    })
\`\`\`

关键洞察：**ASGI app 只是一个"可调用对象"，不需要绑定端口、不需要启动服务器。** 你可以直接在代码里"调用"它，把请求喂给它，把响应接回来。TestClient 干的就是这件事——它不启动 uvicorn，而是直接在内存里"调用"你的 app。

生活类比：你想测试一台电视机，正常做法是插上电、接上天线、打开看节目（启动 uvicorn 服务器）。但 ASGI 让你不用插电——你直接拿一根线把信号发生器接到电视的内部电路（直接调用 app），看屏幕亮不亮。省掉了"插电、开机、等启动"这一整套麻烦。

### 2.2 Starlette 提供的测试工具

Starlette 的 \`starlette.testclient\` 模块提供了 \`TestClient\` 类，它是测试 ASGI app 的"标准工具"。FastAPI 直接复用它。

\`\`\`python
# starlette/testclient.py 的核心结构（简化）
from httpx import Client
from httpx._transports.asgi import ASGITransport

class TestClient(Client):
    """TestClient 继承自 httpx.Client。"""
    def __init__(self, app, ...):
        # 把 ASGI app 包成 httpx 的 transport
        transport = ASGITransport(app=app)
        super().__init__(transport=transport, ...)
\`\`\`

看明白了吗？**TestClient 的本质就是"一个用 ASGITransport 当传输层的 httpx.Client"。** 它把你的 ASGI app 伪装成一个"HTTP 服务器"，但实际请求根本没走网络，全在内存里转一圈。

## 三、三者关系：FastAPI → Starlette → TestClient → httpx

### 3.1 关系图

下面这张文字图把四个角色的关系画清楚了：

\`\`\`
┌──────────────┐
│   FastAPI    │  你的 app = FastAPI() 实例
│  (子类)      │  继承自 Starlette，加了类型/文档/依赖注入
└──────┬───────┘
       │ 继承（is-a）
       ▼
┌──────────────┐
│  Starlette   │  提供 ASGI 协议实现、路由、中间件
│  (父类)      │  提供 TestClient（在 starlette.testclient）
└──────┬───────┘
       │ 提供工具
       ▼
┌──────────────┐
│  TestClient  │  继承自 httpx.Client
│              │  把 ASGI app 包成 transport
└──────┬───────┘
       │ 继承（is-a）+ 内部用 ASGITransport
       ▼
┌──────────────┐
│    httpx     │  真正的 HTTP 客户端库
│              │  同步 Client / 异步 AsyncClient
└──────────────┘
\`\`\`

一句话总结：**你的 FastAPI app 是一个 ASGI app；TestClient 是一个把 ASGI app 当服务器的 httpx.Client；测试请求在内存里通过 ASGITransport 转发，不走网络。**

### 3.2 为什么要强调这个关系

因为这能解释三件让你困惑的事：

1. **为什么 TestClient 有 \`client.get()\`、\`client.post()\`？** 因为它继承自 httpx.Client，这些方法都是 httpx 的。
2. **为什么 response 对象有 \`response.json()\`、\`response.headers\`？** 因为 response 也是 httpx 的 Response 对象。
3. **为什么 async 测试要用 httpx.AsyncClient？** 因为 TestClient 是同步的（继承 httpx.Client），异步得用 httpx.AsyncClient + ASGITransport。

理解了这条链，后面所有章节的代码你都能"看穿"——表面是 FastAPI 的 API，底层全是 httpx + ASGI。

## 四、TestClient 的本质：httpx.Client + ASGITransport

### 4.1 拆解 TestClient 的构造

我们用"剥洋葱"的方式拆 TestClient。先看它的构造函数：

\`\`\`python
# 你写的代码
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
\`\`\`

\`TestClient(app)\` 内部做了什么？

\`\`\`python
# 等价于（简化版，源码在 starlette/testclient.py）
from httpx import Client
from httpx._transports.asgi import ASGITransport

# 第 1 步：把 ASGI app 包成 transport
# ASGITransport 实现了 httpx 的 Transport 接口
# 当 httpx 发请求时，transport 不走网络，而是直接调用 app(scope, receive, send)
transport = ASGITransport(app=app)

# 第 2 步：用这个 transport 构造一个 httpx.Client
client = Client(transport=transport, base_url="http://testserver")

# 之后 client.get("/users") 的完整路径：
# 1. httpx 构造一个 Request 对象
# 2. 把 Request 交给 transport（ASGITransport）
# 3. ASGITransport 把 Request 翻译成 ASGI 的 scope/receive/send
# 4. 直接 await app(scope, receive, send) —— 你的 FastAPI app 被调用了
# 5. app 通过 send 把响应发回来
# 6. ASGITransport 把响应翻译成 httpx.Response
# 7. httpx 返回给你
\`\`\`

### 4.2 生活类比：内部直拨电话

普通 HTTP 请求像"打电话"：你（httpx）拨号 → 走电话线（网络）→ 对方接听（uvicorn 服务器）→ 通话。

TestClient 像公司里的"内部直拨"：你和同事在同一个办公室（同一个进程），你不用拨外线，直接走内线（ASGITransport），秒通，还不用付话费（没有网络开销）。

### 4.3 为什么这很牛

- **快**：没有网络往返，没有序列化/反序列化的字节流，毫秒级响应。
- **稳**：不依赖端口占用，不会因为"端口被占"导致测试失败。
- **省**：不用为每个测试启动/关闭 uvicorn，CI 里快几倍。
- **真**：你的 app 被完整调用，路由、依赖、校验、中间件一个不漏。

## 五、httpx 简介

### 5.1 httpx 是什么

httpx 是现代 Python 的 HTTP 客户端库，号称"requests 的继任者"。它的两大卖点：

1. **同步异步双模式**：既提供 \`httpx.Client\`（同步），又提供 \`httpx.AsyncClient\`（异步）。
2. **支持 ASGI/WSGI transport**：可以直接把 ASGI app 当服务器测，这正是 TestClient 的底层。

\`\`\`python
# 同步用法
import httpx
response = httpx.get("https://example.com")
print(response.status_code)

# 异步用法
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://example.com")
        print(response.status_code)

asyncio.run(main())
\`\`\`

### 5.2 httpx vs requests

| 特性 | requests | httpx |
|------|----------|-------|
| 同步 | 支持 | 支持 |
| 异步 | 不支持 | 支持 |
| ASGI transport | 不支持 | 支持 |
| WSGI transport | 不支持 | 支持 |
| HTTP/2 | 不支持 | 支持 |
| API 风格 | 经典 | 类似 requests，迁移成本低 |

FastAPI 之所以选 httpx 而不是 requests，就是因为 httpx 支持异步和 ASGI transport——这俩是测 FastAPI 的刚需。

## 六、TestClient vs httpx 对比

既然 TestClient 内部就是 httpx，那我们什么时候用 TestClient，什么时候直接用 httpx？

| 维度 | TestClient | 直接用 httpx |
|------|-----------|--------------|
| 导入 | \`from fastapi.testclient import TestClient\` | \`from httpx import Client, AsyncClient\` |
| 构造 | \`TestClient(app)\` 一行搞定 | 需要手动 \`ASGITransport(app)\` + \`Client(transport=...)\` |
| 同步 | 支持（继承 httpx.Client） | 支持（httpx.Client） |
| 异步 | 不支持 | 支持（httpx.AsyncClient） |
| 生命周期事件 | 自动处理 startup/shutdown | 需要手动管理 |
| raise_server_exceptions | 默认 True，服务端异常会抛到测试里 | 默认不抛 |
| 适用场景 | 90% 的同步测试 | 异步测试、需要细粒度控制 |

**经验法则：默认用 TestClient，遇到异步需求才换 httpx.AsyncClient。** 后面章节会详细演示两者的代码。

## 七、为什么 TestClient 不需要真正启动服务器

### 7.1 普通 HTTP 测试的笨办法

如果你不用 TestClient，测 FastAPI 接口的"笨办法"是：

\`\`\`python
# 笨办法：启动真实服务器再测（不推荐）
import subprocess
import httpx

# 1. 启动 uvicorn 服务器（占用一个端口）
server = subprocess.Popen(["uvicorn", "main:app", "--port", "8000"])
import time; time.sleep(2)  # 等服务器起来

# 2. 用 httpx 真的发 HTTP 请求
response = httpx.get("http://localhost:8000/users/tom")

# 3. 测完关服务器
server.terminate()
\`\`\`

这套流程的问题：慢（启动 uvicorn 要 1-2 秒）、不稳（端口可能被占）、难调试（服务器异常不会直接抛到测试里）。

### 7.2 TestClient 的聪明办法

TestClient 直接"跳过"服务器，在内存里调用 app：

\`\`\`python
# 聪明办法：TestClient 直接调 app（推荐）
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
# client.get 内部直接调用 app(scope, receive, send)
# 没有端口、没有网络、没有 uvicorn
response = client.get("/users/tom")
\`\`\`

生活类比：你想测试一道菜（接口）好不好吃。笨办法是把厨师（uvicorn）请到家里，让他开火炒一遍；聪明办法是直接去厨房尝厨师正在炒的菜（直接调 app）。后者省时省力，还能立刻知道哪一步出了问题。

## 八、Demo 1：用纯 Starlette 写一个 app，用 TestClient 测试

为了证明 TestClient 是 Starlette 的工具，我们先不碰 FastAPI，用纯 Starlette 写 app。

\`\`\`python
# 文件：starlette_app.py
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse

# 定义一个路由处理函数
# 它接收 request 对象，返回 response 对象
async def hello(request):
    # request.query_params 拿 query 参数
    name = request.query_params.get("name", "world")
    return JSONResponse({"msg": f"hello, {name}"})

# 定义另一个路由
async def health(request):
    return JSONResponse({"status": "ok"})

# 把路由注册到 Starlette app
app = Starlette(routes=[
    Route("/", hello),
    Route("/health", health),
])
\`\`\`

用 Starlette 自己的 TestClient 测试：

\`\`\`python
# 文件：test_starlette_app.py
from starlette.testclient import TestClient
from starlette_app import app

# 注意：这里是 starlette.testclient.TestClient
# 它和 fastapi.testclient.TestClient 是同一个东西
client = TestClient(app)

def test_hello_default():
    """测试：不带 name 参数，应该返回 hello, world。"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "hello, world"}

def test_hello_with_name():
    """测试：带 name=tom，应该返回 hello, tom。"""
    response = client.get("/?name=tom")
    assert response.status_code == 200
    assert response.json() == {"msg": "hello, tom"}

def test_health():
    """测试健康检查端点。"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
\`\`\`

运行：

\`\`\`bash
pytest test_starlette_app.py -v
\`\`\`

\`\`\`txt
test_starlette_app.py::test_hello_default PASSED
test_starlette_app.py::test_hello_with_name PASSED
test_starlette_app.py::test_health PASSED
\`\`\`

## 九、Demo 2：同样的 app 用 FastAPI 写，用 TestClient 测试

现在把 Demo 1 的 app 用 FastAPI 重写，测试代码几乎不变——这就是兼容性的体现。

\`\`\`python
# 文件：fastapi_app.py
from fastapi import FastAPI

app = FastAPI()

# FastAPI 的路由用装饰器声明，比 Starlette 简洁
@app.get("/")
def hello(name: str = "world"):
    # name 直接作为参数声明，FastAPI 自动从 query params 取
    # 还自动生成 OpenAPI 文档，Starlette 没这能力
    return {"msg": f"hello, {name}"}

@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

测试代码：

\`\`\`python
# 文件：test_fastapi_app.py
from fastapi.testclient import TestClient
from fastapi_app import app

# 注意：这里是 fastapi.testclient.TestClient
# 但它内部就是 starlette.testclient.TestClient 的再导出
client = TestClient(app)

def test_hello_default():
    """和 Starlette 版本一模一样的测试。"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "hello, world"}

def test_hello_with_name():
    """带 name 参数。"""
    response = client.get("/?name=tom")
    assert response.status_code == 200
    assert response.json() == {"msg": "hello, tom"}

def test_health():
    """健康检查。"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
\`\`\`

运行结果一样全绿。**对比 Demo 1 和 Demo 2 你会发现：app 代码变了（Starlette → FastAPI），但测试代码几乎没变。** 这就是因为 TestClient 测的是"ASGI 接口"，而 FastAPI 和 Starlette 都是 ASGI app，对 TestClient 来说没区别。

## 十、Demo 3：直接用 httpx.AsyncClient + ASGITransport 测试 FastAPI（异步方式）

TestClient 是同步的。如果你的路由是 \`async def\`，并且你想在测试里用 async（比如要测并发），就得用 httpx.AsyncClient + ASGITransport。

\`\`\`python
# 文件：test_async_httpx.py
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi_app import app

# pytest-asyncio 的标记，告诉 pytest 这是异步测试
@pytest.mark.asyncio
async def test_hello_async():
    """用异步方式测试 FastAPI app。"""
    # 第 1 步：把 app 包成 ASGITransport
    transport = ASGITransport(app=app)
    # 第 2 步：用 AsyncClient 包 transport
    # base_url 是必须的，但值随便填，因为请求根本不走网络
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 第 3 步：await client.get 发请求
        response = await client.get("/")
        assert response.status_code == 200
        assert response.json() == {"msg": "hello, world"}

@pytest.mark.asyncio
async def test_health_async():
    """异步测试健康检查。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
\`\`\`

运行前要装 pytest-asyncio：

\`\`\`bash
pip install pytest-asyncio
pytest test_async_httpx.py -v
\`\`\`

\`\`\`txt
test_async_httpx.py::test_hello_async PASSED
test_async_httpx.py::test_health_async PASSED
\`\`\`

注意：这里我们没用 \`TestClient\`，而是直接用了 httpx 的 AsyncClient + ASGITransport。**这证明了 TestClient 不是必需的——只要你愿意，可以完全用 httpx 手搓测试。** TestClient 只是把"同步 + 自动管理生命周期"的常见场景封装得更顺手而已。

## 十一、Demo 4：打印 TestClient 的类型和 MRO，证明它继承自 httpx.Client

口说无凭，我们用代码证明 TestClient 真的继承自 httpx.Client。

\`\`\`python
# 文件：inspect_testclient.py
from fastapi.testclient import TestClient
from fastapi import FastAPI
import httpx

app = FastAPI()
client = TestClient(app)

# 1. 看 client 的类型
print("type(client):", type(client))
# 输出：<class 'starlette.testclient.TestClient'>

# 2. 看 TestClient 的 MRO（方法解析顺序，即继承链）
print("MRO:")
for cls in type(client).__mro__:
    print("  ", cls)
# 输出大致：
#    <class 'starlette.testclient.TestClient'>
#    <class 'httpx._client.Client'>
#    <class 'object'>

# 3. 验证 TestClient 是 httpx.Client 的子类
print("issubclass(TestClient, httpx.Client):",
      issubclass(TestClient, httpx.Client))
# 输出：True

# 4. 看 client 内部的 transport 类型
# httpx.Client 有个 _transport 属性（私有，但能看）
print("transport:", type(client._transport))
# 输出：<class 'httpx._transports.asgi.ASGITransport'>
\`\`\`

运行：

\`\`\`bash
python inspect_testclient.py
\`\`\`

\`\`\`txt
type(client): <class 'starlette.testclient.TestClient'>
MRO:
   <class 'starlette.testclient.TestClient'>
   <class 'httpx._client.Client'>
   <class 'object'>
issubclass(TestClient, httpx.Client): True
transport: <class 'httpx._transports.asgi.ASGITransport'>
\`\`\`

铁证如山：

1. TestClient 的 MRO 里第二个就是 \`httpx._client.Client\`——它是 httpx.Client 的子类。
2. \`issubclass\` 返回 True。
3. client 内部的 transport 是 \`ASGITransport\`——它确实把 ASGI app 当传输层。

## 十二、Demo 5：对比 TestClient 和真实 uvicorn 服务的请求

TestClient 和真实服务器有什么区别？我们用一个会抛异常的 app 来对比。

\`\`\`python
# 文件：compare_testclient_vs_uvicorn.py
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/boom")
def boom():
    """故意抛异常的端点。"""
    raise RuntimeError("服务器内部爆炸！")

# ---- 用 TestClient 测试 ----
client = TestClient(app)

# 默认情况下，TestClient 会把服务端异常重新抛到测试里
# 这叫 raise_server_exceptions=True（默认值）
# 好处：你能在测试里直接看到完整的 traceback，方便调试
try:
    response = client.get("/boom")
    print("TestClient 默认：拿到 response，状态码 =", response.status_code)
except RuntimeError as e:
    print("TestClient 默认：异常被抛出来了 ->", e)
    # 输出：TestClient 默认：异常被抛出来了 -> 服务器内部爆炸！

# 如果不想让异常抛出来（模拟真实服务器的 500 行为），可以关掉
client2 = TestClient(app, raise_server_exceptions=False)
response = client2.get("/boom")
print("TestClient 关掉异常：状态码 =", response.status_code)
# 输出：TestClient 关掉异常：状态码 = 500
print("TestClient 关掉异常：body =", response.text)
# 输出：TestClient 关掉异常：body = Internal Server Error
\`\`\`

运行：

\`\`\`bash
python compare_testclient_vs_uvicorn.py
\`\`\`

\`\`\`txt
TestClient 默认：异常被抛出来了 -> 服务器内部爆炸！
TestClient 关掉异常：状态码 = 500
TestClient 关掉异常：body = Internal Server Error
\`\`\`

对比真实 uvicorn 服务器：

\`\`\`bash
# 终端 1：启动 uvicorn
uvicorn compare_testclient_vs_uvicorn:app --port 8000

# 终端 2：发请求
curl -i http://localhost:8000/boom
\`\`\`

\`\`\`txt
HTTP/1.1 500 Internal Server Error
content-type: text/plain; charset=utf-8

Internal Server Error
\`\`\`

区别总结：

- **真实 uvicorn**：异常被服务器捕获，返回 500 + "Internal Server Error"，异常不会抛到客户端。
- **TestClient 默认**：异常直接抛到测试代码里（raise_server_exceptions=True），方便你看到完整 traceback。
- **TestClient 关异常**：行为和真实 uvicorn 一致，返回 500。

**经验法则：开发调试时用默认（异常抛出来，好排查）；写"行为测试"想验证 500 响应时关掉异常。**

## 十三、本章小结

| 概念 | 一句话 |
|------|-------|
| FastAPI 与 Starlette | FastAPI 继承自 Starlette，\`class FastAPI(Starlette)\` |
| ASGI | Python 异步 Web 标准接口，app 是可调用对象，无需启动服务器 |
| TestClient 本质 | httpx.Client + ASGITransport，把 ASGI app 当传输层 |
| 继承链 | TestClient → httpx.Client → object |
| 请求路径 | client.get → ASGITransport → app(scope,receive,send) → response |
| 为什么不用启动服务器 | ASGI app 可直接调用，ASGITransport 在内存里转发请求 |
| httpx 角色 | 真正的 HTTP 客户端，TestClient 是它的子类 |
| 同步测试 | 用 TestClient（默认选择） |
| 异步测试 | 用 httpx.AsyncClient + ASGITransport |
| raise_server_exceptions | True（默认）抛异常方便调试；False 模拟真实 500 |
| TestClient vs httpx | 默认用 TestClient，异步或细粒度控制用 httpx |

这一章是全书的"地基"。后面所有章节的代码，无论表面多花哨，底层都是"ASGITransport 调用 ASGI app"这一套。理解了这点，你就从"会用 TestClient"升级到"看透 TestClient"了。
`
  },

  // ============================================================
  // 第 3 章：pytest 入门与配置
  // ============================================================
  {
    id: "ft-pytest",
    group: "测试基础",
    icon: "⚙️",
    title: "pytest 入门与配置",
    content: `# pytest 入门与配置

## 一、pytest 简介

### 1.1 为什么是 pytest

Python 的测试框架有很多：unittest（标准库）、nose、pytest、Robot Framework……但今天 90% 的 Python 项目用的都是 pytest。为什么？

- **写法简单**：用 \`assert\` 语句，不用记 \`self.assertEqual\` 这种长名字方法。
- **自动发现**：按命名规则自动找测试文件和测试函数，不用手动注册。
- **fixture 系统**：优雅地管理测试前置/后置操作，比 unittest 的 setUp/tearDown 强大十倍。
- **插件生态**：800+ 插件，要啥有啥（覆盖率、异步、并行、mock……）。
- **兼容 unittest**：你以前的 unittest 测试，pytest 也能直接跑。

生活类比：unittest 像一把"瑞士军刀"——功能齐全但每把刀都得按特定姿势用；pytest 像一把"魔术扳手"——你只要说"拧这个螺丝"，它自己找对口的扳手头。

### 1.2 安装

\`\`\`bash
# 安装 pytest 本体
pip install pytest

# 安装异步测试支持（FastAPI 异步测试必备）
pip install pytest-asyncio

# 安装 httpx（TestClient 依赖）
pip install httpx

# 安装覆盖率统计（可选，但强烈推荐）
pip install pytest-cov

# 一次性装齐
pip install pytest pytest-asyncio httpx pytest-cov
\`\`\`

## 二、pytest 的发现规则

pytest 不需要你"注册"测试，它按规则自动找。规则如下：

| 类型 | 规则 | 例子 |
|------|------|------|
| 测试文件 | 文件名以 \`test_\` 开头或 \`_test\` 结尾 | \`test_users.py\`、\`users_test.py\` |
| 测试类 | 类名以 \`Test\` 开头，且**没有** \`__init__\` 方法 | \`class TestUserApi:\` |
| 测试函数 | 函数名以 \`test_\` 开头 | \`def test_login():\` |

注意几个坑：

- 测试类的 \`__init__\` 方法不能写——pytest 不支持带 \`__init__\` 的测试类，写了会被忽略。
- 文件名和函数名前缀默认是 \`test_\`，可以在 \`pyproject.toml\` 里改，但一般别改，约定俗成。
- 测试目录通常叫 \`tests/\`，pytest 默认从当前目录开始递归找。

## 三、assert 语句的魔法

### 3.1 不需要 self.assertEqual

unittest 时代，断言要这样写：

\`\`\`python
# unittest 风格（啰嗦）
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)              # 相等
        self.assertTrue(1 < 2)                  # 为真
        self.assertIn(3, [1, 2, 3])             # 包含
        self.assertRaises(ValueError, int, "x") # 抛异常
\`\`\`

pytest 时代，全部用 \`assert\`：

\`\`\`python
# pytest 风格（清爽）
def test_add():
    assert 1 + 1 == 2                    # 相等
    assert 1 < 2                         # 为真
    assert 3 in [1, 2, 3]                # 包含
    import pytest
    with pytest.raises(ValueError):      # 抛异常
        int("x")
\`\`\`

### 3.2 为什么 assert 这么聪明

pytest 会"重写"你的 assert 语句（assert rewriting），当 assert 失败时，它不只告诉你"失败了"，还会告诉你"失败时的中间值"。

\`\`\`python
def test_demo():
    name = "tom"
    age = 18
    assert name == "jerry" and age == 20
\`\`\`

普通 Python 跑这个 assert，只会说 \`AssertionError\`。pytest 跑会告诉你：

\`\`\`txt
>       assert name == "jerry" and age == 20
E       assert 'tom' == 'jerry' and 18 == 20
E         where 'tom' = name
E         and   18 = age
\`\`\`

每个变量的实际值都给你标出来。这就是 pytest 的"魔法"，调试体验拉满。

## 四、Demo 1：一个最简单的 pytest 用例

\`\`\`python
# 文件：test_simple.py
# 最简单的 pytest 用例：一个普通函数 + assert

def test_addition():
    """测试加法。"""
    result = 1 + 1
    assert result == 2

def test_string_upper():
    """测试字符串大写。"""
    assert "hello".upper() == "HELLO"

def test_list_append():
    """测试列表追加。"""
    lst = [1, 2]
    lst.append(3)
    assert lst == [1, 2, 3]
\`\`\`

运行：

\`\`\`bash
pytest test_simple.py -v
\`\`\`

\`\`\`txt
test_simple.py::test_addition PASSED
test_simple.py::test_string_upper PASSED
test_simple.py::test_list_append PASSED
\`\`\`

## 五、Demo 2：使用 fixture（function/session/module scope）

fixture 是 pytest 的杀手锏。它解决的问题是"测试前置/后置操作"——创建数据库连接、启动 app、造测试数据、清理环境……

### 5.1 基本用法

\`\`\`python
# 文件：test_fixture_basic.py
import pytest

# 用 @pytest.fixture 装饰一个函数，它就成了 fixture
@pytest.fixture
def sample_user():
    """造一个测试用户。每个用 test_ 函数都能用。"""
    user = {"username": "tom", "age": 18}
    return user

# 把 fixture 名字作为参数传给测试函数，pytest 会自动注入
def test_username(sample_user):
    """sample_user 会被自动注入成 fixture 的返回值。"""
    assert sample_user["username"] == "tom"

def test_user_age(sample_user):
    """同一个 fixture 可以被多个测试用。"""
    assert sample_user["age"] == 18
\`\`\`

### 5.2 scope：控制 fixture 的"作用域"

fixture 默认每个测试函数都重新跑一次（scope="function"）。但有些 fixture（比如数据库连接）太贵，希望整个 session 只跑一次。用 \`scope\` 参数控制：

\`\`\`python
# 文件：test_fixture_scope.py
import pytest

# scope="function"：每个测试函数前后都跑一次（默认）
@pytest.fixture(scope="function")
def db_connection_function():
    print("\\n[function] 建立数据库连接")
    yield "db_conn"
    print("\\n[function] 关闭数据库连接")

# scope="module"：每个 .py 文件只跑一次
@pytest.fixture(scope="module")
def db_connection_module():
    print("\\n[module] 建立数据库连接")
    yield "db_conn"
    print("\\n[module] 关闭数据库连接")

# scope="session"：整个 pytest 运行只跑一次
@pytest.fixture(scope="session")
def db_connection_session():
    print("\\n[session] 建立数据库连接")
    yield "db_conn"
    print("\\n[session] 关闭数据库连接")

# yield 之前是"前置"，yield 之后是"后置"
# yield 的值就是 fixture 注入到测试里的值

def test_a(db_connection_function, db_connection_module, db_connection_session):
    assert db_connection_function == "db_conn"

def test_b(db_connection_function, db_connection_module, db_connection_session):
    assert db_connection_module == "db_conn"
\`\`\`

| scope | 何时创建 | 何时销毁 | 典型场景 |
|-------|---------|---------|---------|
| function（默认）| 每个测试函数前 | 每个测试函数后 | 临时数据、mock 对象 |
| class | 每个测试类前 | 每个测试类后 | 类共享的昂贵对象 |
| module | 每个 .py 文件前 | 每个 .py 文件后 | 文件级共享资源 |
| session | 整个 pytest 运行前 | 整个 pytest 运行后 | 数据库连接、Redis 连接 |

生活类比：scope 像水电费账单的"结算周期"。function 是"按次结算"（每次用完就结），session 是"按年结算"（一年结一次）。贵的资源用大 scope，省时间。

## 六、Demo 3：parametrize 参数化测试

同一个测试逻辑，想用不同输入跑多遍？用 \`@pytest.mark.parametrize\`。

\`\`\`python
# 文件：test_parametrize.py
import pytest

# 被测函数：判断一个数是否为偶数
def is_even(n):
    return n % 2 == 0

# 参数化：用 4 组输入各跑一次
# 第一个参数是参数名（逗号分隔），第二个是参数值列表
@pytest.mark.parametrize("n, expected", [
    (2, True),     # 输入 2，期望 True
    (3, False),    # 输入 3，期望 False
    (0, True),     # 输入 0，期望 True
    (-4, True),    # 输入 -4，期望 True
])
def test_is_even(n, expected):
    """n 和 expected 会从 parametrize 注入。"""
    assert is_even(n) == expected
\`\`\`

运行：

\`\`\`bash
pytest test_parametrize.py -v
\`\`\`

\`\`\`txt
test_parametrize.py::test_is_even[2-True] PASSED
test_parametrize.py::test_is_even[3-False] PASSED
test_parametrize.py::test_is_even[0-True] PASSED
test_parametrize.py::test_is_even[-4-True] PASSED
\`\`\`

每个用例的名字里会带上参数值，一眼就知道哪组输入挂了。**参数化是减少重复代码的利器——一组数据写一遍逻辑，比复制粘贴 5 个测试函数强多了。**

## 七、Demo 4：mark 标记（skip, xfail, custom mark）

### 7.1 内置标记

\`\`\`python
# 文件：test_marks.py
import pytest

# skip：无条件跳过（用例没写完，先不跑）
@pytest.mark.skip(reason="还没实现，下个版本补")
def test_not_implemented():
    assert False

# skipif：条件跳过（比如只在 Windows 跳过）
@pytest.mark.skipif(sys.platform == "win32", reason="Linux 专用")
def test_linux_only():
    assert True

# xfail：预期失败（已知 bug，先标记，修了之后会提醒你取消标记）
@pytest.mark.xfail(reason="已知 bug #123，等后端修接口")
def test_known_bug():
    assert 1 == 2  # 这条会"失败"，但 pytest 标记为 XFAIL（预期失败），不报红
\`\`\`

### 7.2 自定义标记

\`\`\`python
# 文件：test_custom_marks.py
import pytest

# 自定义标记：标记"慢测试"
@pytest.mark.slow
def test_big_data():
    """跑得很慢的测试。"""
    import time
    time.sleep(5)
    assert True

# 自定义标记：标记"集成测试"
@pytest.mark.integration
def test_with_db():
    """需要数据库的测试。"""
    assert True

def test_fast():
    """普通快测试。"""
    assert True
\`\`\`

跑的时候可以筛选：

\`\`\`bash
# 只跑集成测试
pytest -m integration

# 跑除了 slow 以外的所有测试
pytest -m "not slow"

# 同时跑 slow 和 integration
pytest -m "slow or integration"
\`\`\`

注意：自定义 mark 要在 \`pyproject.toml\` 里注册（用 \`--strict-markers\` 时强制要求），否则会警告。

\`\`\`toml
[tool.pytest.ini_options]
markers = [
    "slow: 跑得慢的用例",
    "integration: 集成测试",
]
\`\`\`

## 八、Demo 5：conftest.py 共享 fixture

如果每个测试文件都要 import fixture，太麻烦。pytest 提供 \`conftest.py\`：放在里面的 fixture，同目录及子目录的所有测试都能用，**不需要 import**。

\`\`\`python
# 文件：tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from main import app

# 这个 fixture 所有 tests/ 下的测试都能直接用，不用 import
@pytest.fixture(scope="session")
def app_instance():
    """整个 session 共享一个 app 实例。"""
    return app

# 这个 fixture 依赖 app_instance，pytest 会自动注入
@pytest.fixture(scope="session")
def client(app_instance):
    """整个 session 共享一个 TestClient。"""
    return TestClient(app_instance)

# 一个造测试数据的 fixture
@pytest.fixture
def sample_user_payload():
    """每个测试函数独立的 payload（scope 默认 function）。"""
    return {
        "username": "testuser",
        "age": 20,
        "email": "test@example.com",
    }
\`\`\`

测试文件里直接用：

\`\`\`python
# 文件：tests/api/test_users.py
# 注意：不用 import conftest 里的 fixture，pytest 自动找

def test_create_user(client, sample_user_payload):
    """client 和 sample_user_payload 都从 conftest 来。"""
    response = client.post("/users", json=sample_user_payload)
    assert response.status_code == 201

def test_get_user(client):
    response = client.get("/users/testuser")
    assert response.status_code == 200
\`\`\`

conftest.py 的层级规则：

- \`tests/conftest.py\`：所有测试共享。
- \`tests/api/conftest.py\`：只 \`tests/api/\` 下的测试共享。
- 子目录的 conftest 可以"覆盖"父目录的同名 fixture。

## 九、Demo 6：pyproject.toml 中 [tool.pytest.ini_options] 配置

把常用配置写进 \`pyproject.toml\`，省得每次敲一长串命令行参数。

\`\`\`toml
# 文件：pyproject.toml
[tool.pytest.ini_options]
# 测试文件搜索路径
testpaths = ["tests"]

# 文件名匹配规则
python_files = ["test_*.py"]

# 类名匹配规则
python_classes = ["Test*"]

# 函数名匹配规则
python_functions = ["test_*"]

# 默认参数（每次 pytest 都自动加）
addopts = [
    "-v",                          # 显示用例名
    "--strict-markers",            # 未注册的 mark 报错
    "--tb=short",                  # 简短 traceback
    "--cov=app",                   # 覆盖率统计 app 目录
    "--cov-report=term-missing",   # 终端报告显示未覆盖行
    "--cov-report=html",           # 同时生成 html 报告
]

# 注册的自定义标记
markers = [
    "slow: 跑得慢的用例",
    "integration: 集成测试，需要数据库",
    "smoke: 冒烟测试，核心链路",
    "auth: 认证相关测试",
]

# pytest-asyncio 配置
# auto 模式：自动给 async def 测试函数加 @pytest.mark.asyncio
asyncio_mode = "auto"
\`\`\`

配好后，直接敲 \`pytest\` 就等于敲一长串参数，省心。

## 十、pytest 常用命令行参数表

| 参数 | 作用 | 例子 |
|------|------|------|
| \`-v\` | verbose，显示每个用例名 | \`pytest -v\` |
| \`-s\` | 不捕获 print 输出，直接显示 | \`pytest -s\` |
| \`-k\` | 按名字筛选用例 | \`pytest -k "login"\` |
| \`-m\` | 按标记筛选用例 | \`pytest -m "not slow"\` |
| \`--tb=\` | traceback 风格（short/long/line/no） | \`pytest --tb=short\` |
| \`--lf\` | 只跑上次失败的 | \`pytest --lf\` |
| \`--ff\` | 先跑上次失败的，再跑其他 | \`pytest --ff\` |
| \`-x\` | 遇到第一个失败就停 | \`pytest -x\` |
| \`--maxfail=N\` | 失败 N 次就停 | \`pytest --maxfail=3\` |
| \`-n=N\` | 并行跑（需 pytest-xdist） | \`pytest -n=4\` |
| \`--cov=PKG\` | 统计覆盖率（需 pytest-cov） | \`pytest --cov=app\` |
| \`--cov-report=html\` | 生成 html 覆盖率报告 | \`pytest --cov-report=html\` |
| \`--durations=10\` | 显示最慢的 10 个用例 | \`pytest --durations=10\` |
| \`-rA\` | 显示所有用例的简短摘要 | \`pytest -rA\` |

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| pytest | Python 最流行的测试框架，assert 风格 |
| 发现规则 | test_*.py 文件、Test* 类、test_* 函数 |
| assert | pytest 重写后能显示中间值，调试友好 |
| fixture | 管理前置/后置操作，scope 控制作用域 |
| scope | function（默认）/class/module/session |
| parametrize | 参数化测试，一组逻辑跑多组数据 |
| mark | skip/xfail/自定义标记，配合 -m 筛选 |
| conftest.py | 共享 fixture，无需 import，按目录层级生效 |
| pyproject.toml | 配置 testpaths/markers/addopts |
| 常用参数 | -v -s -k -m --tb --lf --cov |
| asyncio_mode | auto 模式自动给 async 测试加标记 |

pytest 是 FastAPI 测试的"骨架"。从下一章开始，我们正式把 pytest 和 TestClient 结合起来，写真实的接口测试。
`
  },

  // ============================================================
  // 第 4 章：第一个 TestClient 测试（核心章节）
  // ============================================================
  {
    id: "ft-testclient",
    group: "测试基础",
    icon: "🚀",
    title: "第一个 TestClient 测试",
    content: `# 第一个 TestClient 测试

> 这一章我们正式动手——用 \`fastapi.testclient.TestClient\` 写一组完整的接口测试。从最简单的 GET 到 POST、query、headers、cookies、422 校验、生命周期事件，全部覆盖。看完这章你就能独立给任何 FastAPI 接口写测试。

## 一、from fastapi.testclient import TestClient 详解

### 1.1 导入来源

\`\`\`python
# 写法 1：从 fastapi.testclient 导入（推荐，语义清晰）
from fastapi.testclient import TestClient

# 写法 2：从 starlette.testclient 导入（等价，证明它来自 Starlette）
from starlette.testclient import TestClient

# 写法 3：直接从 httpx 构造（最底层，不推荐日常用）
from httpx import Client
from httpx._transports.asgi import ASGITransport
client = Client(transport=ASGITransport(app=app), base_url="http://test")
\`\`\`

三种写法效果几乎一样，但**日常用写法 1**——它最简洁，且语义上"我在测 FastAPI"。

### 1.2 TestClient 的构造

\`\`\`python
TestClient(
    app,                        # 必填：一个 ASGI app（通常是 FastAPI 实例）
    base_url="http://testserver",  # 基础 URL，仅用于拼路径，不走网络
    raise_server_exceptions=True,  # 服务端异常是否抛到测试里（默认 True）
    root_path="",               # 等价于 ASGI root_path，用于挂子路径
    backend="asyncio",          # 异步后端（asyncio/trio）
    backend_options=None,       # 后端选项
)
\`\`\`

日常 99% 的场景你只需要 \`TestClient(app)\`，其他参数用默认值。

### 1.3 生活类比：TestClient 是个"翻译官"

把 TestClient 想象成一个翻译官：

- 你说"GET /users"（httpx 风格的 HTTP 请求）。
- 翻译官把它翻译成 ASGI 的 scope/receive/send，递给你的 app。
- app 用 ASGI 回答，翻译官再翻译回 httpx 的 Response 给你。
- 全程没出这间办公室（同一进程），秒回。

## 二、Demo 1：Hello World 应用的第一个测试

\`\`\`python
# 文件：main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    """最简单的根路由。"""
    return {"msg": "hello"}
\`\`\`

\`\`\`python
# 文件：test_main.py
from fastapi.testclient import TestClient
from main import app

# 用 TestClient 包住 app
# 之后 client.get("/foo") 等价于"对 app 发 GET /foo 请求"
client = TestClient(app)

def test_root():
    """测试根路由返回 hello。"""
    # 发 GET 请求，response 是 httpx.Response 对象
    response = client.get("/")
    # 断言状态码
    assert response.status_code == 200
    # 断言 JSON body
    # response.json() 把响应体反序列化成 dict/list
    assert response.json() == {"msg": "hello"}
\`\`\`

运行：

\`\`\`bash
pytest test_main.py -v
\`\`\`

\`\`\`txt
test_main.py::test_root PASSED
\`\`\`

恭喜，这是你第一个 FastAPI 测试！短短几行就完成了"发请求-收响应-验状态-验 body"的全流程。

## 三、Demo 2：测试 POST 请求 + json body

\`\`\`python
# 文件：main.py（追加）
from pydantic import BaseModel

# 请求体模型
class CreateUserRequest(BaseModel):
    username: str
    age: int

@app.post("/users")
def create_user(req: CreateUserRequest):
    """创建用户接口。"""
    # 真实工程会存数据库，这里简化
    return {"id": 1, "username": req.username, "age": req.age}
\`\`\`

测试：

\`\`\`python
# 文件：test_users.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user():
    """测试 POST 创建用户。"""
    # 准备请求体
    payload = {"username": "tom", "age": 18}
    # client.post 发 POST 请求
    # json= 参数会自动序列化成 JSON 并设置 content-type
    response = client.post("/users", json=payload)
    # 断言状态码（FastAPI 默认 POST 成功返回 200，除非你显式设 201）
    assert response.status_code == 200
    # 断言返回的 body
    body = response.json()
    assert body["id"] == 1
    assert body["username"] == "tom"
    assert body["age"] == 18

def test_create_user_missing_field():
    """测试：少传字段，应该返回 422。"""
    # 故意不传 age
    payload = {"username": "tom"}
    response = client.post("/users", json=payload)
    # FastAPI 校验失败返回 422
    assert response.status_code == 422
\`\`\`

注意 \`json=\` 参数的用法：TestClient（继承自 httpx）会自动把 dict 序列化成 JSON 字符串，并设置 \`content-type: application/json\`。你不用手动 \`json.dumps\`。

## 四、Demo 3：测试 query params 和 headers

\`\`\`python
# 文件：main.py（追加）
@app.get("/search")
def search(q: str, limit: int = 10):
    """搜索接口，带 query 参数。"""
    return {"query": q, "limit": limit}

@app.get("/me")
def me(x_user_id: str = None):
    """读请求头 X-User-Id 的接口。"""
    # FastAPI 把 X-User-Id 这种 Header 名映射成 x_user_id 参数
    # 需要 Header 声明才严格，这里用简化方式
    return {"user_id": x_user_id}
\`\`\`

更标准的 Header 用法（推荐）：

\`\`\`python
from fastapi import Header

@app.get("/me2")
def me2(x_user_id: str = Header(None)):
    """用 Header 声明读请求头。"""
    return {"user_id": x_user_id}
\`\`\`

测试：

\`\`\`python
# 文件：test_query_headers.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_search_with_query():
    """测试 query 参数。"""
    # params= 参数会拼成 ?q=fastapi&limit=5
    response = client.get("/search", params={"q": "fastapi", "limit": 5})
    assert response.status_code == 200
    assert response.json() == {"query": "fastapi", "limit": 5}

def test_search_default_limit():
    """测试 limit 有默认值。"""
    response = client.get("/search", params={"q": "py"})
    assert response.status_code == 200
    assert response.json() == {"query": "py", "limit": 10}

def test_me_with_header():
    """测试请求头。"""
    # headers= 参数设置请求头
    response = client.get("/me2", headers={"X-User-Id": "user-123"})
    assert response.status_code == 200
    assert response.json() == {"user_id": "user-123"}

def test_me_without_header():
    """测试不传 header，user_id 应为 None。"""
    response = client.get("/me2")
    assert response.status_code == 200
    assert response.json() == {"user_id": None}
\`\`\`

\`params=\` 和 \`headers=\` 都是 httpx 的 API，TestClient 直接继承。注意 Header 名大小写不敏感，\`X-User-Id\` 和 \`x-user-id\` 都行。

## 五、Demo 4：测试 cookies 和 set_cookie

\`\`\`python
# 文件：main.py（追加）
from fastapi import Response, Cookie

@app.post("/login-cookie")
def login_cookie(response: Response):
    """登录接口，下发一个 session_id cookie。"""
    # response.set_cookie 在响应里加 Set-Cookie 头
    response.set_cookie(key="session_id", value="abc123", httponly=True)
    return {"ok": True}

@app.get("/me-cookie")
def me_cookie(session_id: str = Cookie(None)):
    """读 cookie 里的 session_id。"""
    if session_id == "abc123":
        return {"user": "tom"}
    return {"user": None}
\`\`\`

测试：

\`\`\`python
# 文件：test_cookies.py
from fastapi.testclient import TestClient
from main import app

def test_cookie_flow():
    """测试完整的 cookie 流程：登录拿 cookie，再带 cookie 访问。"""
    # 注意：这里不共用一个 client，每次新建，避免 cookie 串扰
    client = TestClient(app)

    # 第 1 步：登录，服务器应该 Set-Cookie
    response = client.post("/login-cookie")
    assert response.status_code == 200
    # response.cookies 是个 Cookies 对象，可以按 key 取
    assert "session_id" in response.cookies
    assert response.cookies["session_id"] == "abc123"

    # 第 2 步：再访问，TestClient 会自动带上刚才的 cookie
    # （因为同一个 client 会保存 cookie jar）
    response = client.get("/me-cookie")
    assert response.status_code == 200
    assert response.json() == {"user": "tom"}

def test_no_cookie():
    """测试不带 cookie 访问。"""
    client = TestClient(app)
    response = client.get("/me-cookie")
    assert response.status_code == 200
    assert response.json() == {"user": None}
\`\`\`

关键点：**同一个 TestClient 实例会保存 cookie jar**，登录后再次请求会自动带 cookie。如果不想带，新建一个 TestClient 或者用 \`client.cookies.clear()\`。

## 六、Demo 5：测试 422 校验错误

FastAPI 的 Pydantic 校验失败会返回 422，body 里带详细错误信息。测试时不仅要验状态码，还要验错误结构。

\`\`\`python
# 文件：main.py（追加）
class Item(BaseModel):
    name: str
    price: float
    tags: list[str] = []

@app.post("/items")
def create_item(item: Item):
    return item
\`\`\`

测试：

\`\`\`python
# 文件：test_422.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_item_ok():
    """正常创建，应该 200。"""
    payload = {"name": "apple", "price": 1.5, "tags": ["fruit"]}
    response = client.post("/items", json=payload)
    assert response.status_code == 200
    assert response.json() == payload

def test_create_item_missing_price():
    """少传 price，应该 422。"""
    payload = {"name": "apple"}  # 没 price
    response = client.post("/items", json=payload)
    assert response.status_code == 422
    # 422 的 body 是 {"detail": [{"loc": [...], "msg": ..., "type": ...}]}
    body = response.json()
    assert "detail" in body
    # detail 是个列表，每项描述一个错误
    assert isinstance(body["detail"], list)
    # 检查错误的字段位置（loc 里有 "price"）
    # loc 是 ["body", "price"]，表示请求体的 price 字段
    error_locs = [tuple(e["loc"]) for e in body["detail"]]
    assert ("body", "price") in error_locs

def test_create_item_wrong_type():
    """price 传字符串，应该 422。"""
    payload = {"name": "apple", "price": "not-a-number"}
    response = client.post("/items", json=payload)
    assert response.status_code == 422
    body = response.json()
    # 错误类型应该是 float_parsing 之类
    assert any("price" in e["loc"] for e in body["detail"])
\`\`\`

422 错误结构详解：

\`\`\`txt
{
  "detail": [
    {
      "type": "missing",              // 错误类型
      "loc": ["body", "price"],       // 错误位置（body 里的 price 字段）
      "msg": "Field required",        // 错误信息
      "input": {"name": "apple"}      // 当时的输入
    }
  ]
}
\`\`\`

断言 422 时，最好不只验状态码，还要验 \`detail\` 里的 \`loc\`——这样能确保"是正确的字段报错了"，而不是别的字段。

## 七、Demo 6：用 with 语法（TestClient 上下文管理器）

### 7.1 为什么需要 with 语法

FastAPI 有 \`@app.on_event("startup")\` 和 \`@app.on_event("shutdown")\`（或 lifespan）生命周期事件。普通 \`TestClient(app)\` 不会触发它们。要触发，得用 \`with\` 语法：

\`\`\`python
# 文件：main_lifespan.py
from fastapi import FastAPI

app = FastAPI()

# 启动事件：app 启动时跑一次
@app.on_event("startup")
def on_startup():
    print("app 启动，初始化数据库连接...")
    app.state.db = {"connection": "fake-db-conn"}

# 关闭事件：app 关闭时跑一次
@app.on_event("shutdown")
def on_shutdown():
    print("app 关闭，清理数据库连接...")
    del app.state.db

@app.get("/db-status")
def db_status():
    # 用 app.state 里启动时初始化的 db
    if hasattr(app.state, "db"):
        return {"db": app.state.db["connection"]}
    return {"db": None}
\`\`\`

测试：

\`\`\`python
# 文件：test_lifespan.py
from fastapi.testclient import TestClient
from main_lifespan import app

def test_with_lifespan():
    """用 with 语法，触发 startup/shutdown。"""
    # with 块进入时：触发 startup
    with TestClient(app) as client:
        # 这里能访问到 startup 初始化的 app.state.db
        response = client.get("/db-status")
        assert response.status_code == 200
        assert response.json() == {"db": "fake-db-conn"}
    # with 块退出时：触发 shutdown

def test_without_lifespan():
    """不用 with，不触发生命周期事件。"""
    client = TestClient(app)
    response = client.get("/db-status")
    assert response.status_code == 200
    # 这条会失败！因为没 with，startup 没跑，app.state.db 没初始化
    # 返回的是 {"db": None}
    assert response.json() == {"db": "fake-db-conn"}
\`\`\`

**经验法则：如果你的接口依赖 startup 初始化的资源（数据库连接、缓存连接），测试时一定要用 \`with TestClient(app) as client\`。** 否则 startup 没跑，资源不存在，测试会莫名其妙失败。

### 7.2 现代 lifespan 写法（FastAPI 0.93+）

新写法用 \`lifespan\` 上下文，比 \`on_event\` 更推荐：

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动逻辑（等价于 startup）
    app.state.db = {"connection": "fake-db-conn"}
    yield
    # 关闭逻辑（等价于 shutdown）
    del app.state.db

app = FastAPI(lifespan=lifespan)
\`\`\`

测试时一样用 \`with TestClient(app) as client\`，TestClient 会处理 async lifespan。

## 八、TestClient 常用方法表

TestClient 继承自 httpx.Client，所以所有 HTTP 方法都有：

| 方法 | 签名 | 用途 |
|------|------|------|
| \`client.get(url, params=, headers=)\` | GET 请求 | 读资源 |
| \`client.post(url, json=, data=, files=)\` | POST 请求 | 创建资源 |
| \`client.put(url, json=)\` | PUT 请求 | 整体替换 |
| \`client.patch(url, json=)\` | PATCH 请求 | 部分更新 |
| \`client.delete(url)\` | DELETE 请求 | 删除资源 |
| \`client.options(url)\` | OPTIONS 请求 | 查询支持的动词 |
| \`client.head(url)\` | HEAD 请求 | 只取 header 不取 body |
| \`client.request(method, url, ...)\` | 通用请求 | 自定义方法 |

常用参数（所有方法通用）：

| 参数 | 用途 |
|------|------|
| \`params=\` | query 参数，dict 会被拼成 ?k=v |
| \`headers=\` | 请求头 |
| \`cookies=\` | 显式传 cookie |
| \`json=\` | 请求体，自动序列化 JSON |
| \`data=\` | 请求体，表单格式 |
| \`files=\` | 上传文件 |
| \`content=\` | 请求体，原始字节 |
| \`timeout=\` | 超时（TestClient 里基本用不到） |

## 九、response 对象属性表

\`client.get()\` 返回的是 \`httpx.Response\` 对象，常用属性：

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| \`response.status_code\` | int | 状态码，如 200/404/422 |
| \`response.json()\` | dict/list | 把 body 反序列化成 JSON |
| \`response.text\` | str | body 的文本形式 |
| \`response.content\` | bytes | body 的字节形式 |
| \`response.headers\` | Headers | 响应头（大小写不敏感） |
| \`response.cookies\` | Cookies | 响应里的 cookie |
| \`response.url\` | URL | 最终请求的 URL |
| \`response.request\` | Request | 发出的请求对象（调试用） |
| \`response.elapsed\` | timedelta | 请求耗时 |
| \`response.is_success\` | bool | 状态码 2xx 为 True |
| \`response.is_error\` | bool | 状态码 4xx/5xx 为 True |

实用技巧：

\`\`\`python
response = client.get("/users/tom")

# 一行判断成功
assert response.is_success

# 取 header
content_type = response.headers["content-type"]

# 调试时打印完整请求和响应
print(response.request.method, response.request.url)
print(response.status_code, response.text)
\`\`\`

## 十、运行测试的命令

\`\`\`bash
# 跑所有测试（用 pyproject.toml 里的配置）
pytest

# 跑指定文件
pytest test_users.py

# 跑指定用例
pytest test_users.py::test_create_user

# 详细模式 + 显示 print
pytest -v -s

# 遇到第一个失败就停
pytest -x

# 只跑上次失败的
pytest --lf

# 按名字筛选
pytest -k "create"

# 统计覆盖率
pytest --cov=app --cov-report=term-missing
\`\`\`

典型输出：

\`\`\`txt
tests/api/test_users.py::test_create_user PASSED
tests/api/test_users.py::test_create_user_missing_field PASSED
tests/api/test_cookies.py::test_cookie_flow PASSED

========== 3 passed in 0.45s ==========

Name                Stmts   Miss  Cover
---------------------------------------
app/main.py            12      2    83%
app/routers/users.py   18      0   100%
---------------------------------------
TOTAL                  30      2    93%
\`\`\`

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| TestClient 导入 | \`from fastapi.testclient import TestClient\` |
| 构造 | \`TestClient(app)\`，其他参数用默认 |
| GET | \`client.get(url, params=, headers=)\` |
| POST | \`client.post(url, json=)\`，json= 自动序列化 |
| query 参数 | 用 \`params=\` |
| 请求头 | 用 \`headers=\` |
| cookie | 同一 client 自动保存 cookie jar |
| 422 校验 | 验 status_code + detail 里的 loc |
| with 语法 | 触发 startup/shutdown 生命周期事件 |
| raise_server_exceptions | 默认 True，异常抛到测试里 |
| response.json() | 反序列化 body |
| response.status_code | 状态码 |
| response.headers | 响应头 |
| is_success / is_error | 2xx / 4xx 5xx 判断 |

这一章覆盖了 TestClient 90% 的日常用法。下一章我们进入异步领域——用 httpx.AsyncClient 测试 async 路由，解锁并发测试能力。
`
  },

  // ============================================================
  // 第 5 章：httpx 异步测试（核心章节）
  // ============================================================
  {
    id: "ft-httpx",
    group: "测试基础",
    icon: "⚡",
    title: "httpx 异步测试",
    content: `# httpx 异步测试

> 前面几章我们一直在用同步的 TestClient。但 FastAPI 是异步框架，很多场景（async 路由、并发请求、async 依赖）需要异步测试。这一章我们用 httpx.AsyncClient + ASGITransport 解锁异步测试能力，并用 asyncio.gather 演示并发测试。

## 一、为什么需要异步测试

### 1.1 同步 TestClient 的局限

\`TestClient\` 是同步的（继承 \`httpx.Client\`）。它能测 async 路由吗？能——TestClient 内部用 \`anyio\` 起一个事件循环来跑 async app。但有三个场景它搞不定：

1. **测试代码本身要 await**：比如你有个 \`async def get_user_from_cache()\` 的辅助函数，测试里想直接 await 调它，TestClient 做不到。
2. **并发请求测试**：想验证"多个请求同时打过来，接口表现正确"（比如限流、并发安全），同步 TestClient 只能串行发。
3. **async 依赖注入**：如果你的 Depends 是 \`async def\`，并且要在测试里覆盖它，异步上下文更顺手。

### 1.2 生活类比：单窗口 vs 多窗口

同步 TestClient 像只有一个窗口的银行——你排队办业务，一个一个来，永远串行。

异步 AsyncClient 像有多个窗口的银行——你可以同时开 10 个窗口，10 个请求并行处理。要测"高并发下接口会不会崩"，必须用异步。

### 1.3 FastAPI 异步路由的例子

\`\`\`python
# 文件：main.py
import asyncio
from fastapi import FastAPI

app = FastAPI()

# 这是一个 async 路由，里面可以 await
@app.get("/slow")
async def slow_endpoint():
    """模拟一个慢接口，等 0.5 秒。"""
    await asyncio.sleep(0.5)  # 异步等待，不阻塞线程
    return {"msg": "done"}

@app.get("/fast")
async def fast_endpoint():
    """快接口。"""
    return {"msg": "fast"}
\`\`\`

要测"同时发 10 个 /slow 请求，总耗时约 0.5 秒（而不是 5 秒）"——这就是异步并发测试要解决的事。

## 二、httpx.AsyncClient 简介

\`httpx.AsyncClient\` 是 httpx 的异步客户端，用法和同步 \`Client\` 几乎一样，区别是：

- 构造和请求都要在 async 上下文里。
- 用 \`async with\` 管理生命周期。
- 请求方法要 \`await\`。

\`\`\`python
import httpx
import asyncio

async def main():
    # async with 管理生命周期
    async with httpx.AsyncClient() as client:
        # await 发请求
        response = await client.get("https://example.com")
        print(response.status_code)

asyncio.run(main())
\`\`\`

## 三、httpx.ASGITransport：把 ASGI app 包装成 transport

\`httpx.ASGITransport\` 是 httpx 提供的"传输层适配器"，它把一个 ASGI app 包装成 httpx 的 transport。这样 AsyncClient 就能直接"请求"这个 app，而不走网络。

\`\`\`python
from httpx import AsyncClient, ASGITransport
from main import app

# 把 app 包成 transport
transport = ASGITransport(app=app)
# 用 transport 构造 AsyncClient
# base_url 必须填，但值随便写，因为请求根本不走网络
async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.get("/")
\`\`\`

**这正是 TestClient 内部做的事——只是 TestClient 用同步 Client + ASGITransport，我们这里用异步 AsyncClient + ASGITransport。** 底层完全一样，只是一个同步一个异步。

## 四、Demo 1：同步 httpx.Client + ASGITransport 测试

先从同步开始——证明不用 TestClient 也能测，手动用 httpx.Client + ASGITransport。

\`\`\`python
# 文件：test_sync_httpx.py
from httpx import Client, ASGITransport
from main import app

def test_slow_with_sync_httpx():
    """用同步 httpx.Client + ASGITransport 测 FastAPI。"""
    # 第 1 步：把 app 包成 transport
    transport = ASGITransport(app=app)
    # 第 2 步：用 transport 构造 Client（注意是同步 Client）
    with Client(transport=transport, base_url="http://test") as client:
        # 第 3 步：发请求（同步，不用 await）
        response = client.get("/slow")
        assert response.status_code == 200
        assert response.json() == {"msg": "done"}

def test_fast_with_sync_httpx():
    """测快接口。"""
    transport = ASGITransport(app=app)
    with Client(transport=transport, base_url="http://test") as client:
        response = client.get("/fast")
        assert response.status_code == 200
        assert response.json() == {"msg": "fast"}
\`\`\`

运行：

\`\`\`bash
pytest test_sync_httpx.py -v
\`\`\`

\`\`\`txt
test_sync_httpx.py::test_slow_with_sync_httpx PASSED
test_sync_httpx.py::test_fast_with_sync_httpx PASSED
\`\`\`

这段代码和 TestClient 等价——它就是 TestClient 内部的"展开版"。理解了它，你就彻底懂了 TestClient。

## 五、Demo 2：异步 httpx.AsyncClient + ASGITransport 测试（用 pytest-asyncio）

现在进入正题——异步测试。需要装 pytest-asyncio：

\`\`\`bash
pip install pytest-asyncio
\`\`\`

\`\`\`python
# 文件：test_async_httpx.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

# @pytest.mark.asyncio 告诉 pytest 这是异步测试
# pytest-asyncio 会自动起事件循环跑它
@pytest.mark.asyncio
async def test_slow_async():
    """异步测试 slow 接口。"""
    # 第 1 步：包 transport
    transport = ASGITransport(app=app)
    # 第 2 步：用 AsyncClient 包 transport
    # 注意：async with，因为 AsyncClient 是异步上下文管理器
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 第 3 步：await client.get 发请求
        response = await client.get("/slow")
        assert response.status_code == 200
        assert response.json() == {"msg": "done"}

@pytest.mark.asyncio
async def test_fast_async():
    """异步测试 fast 接口。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/fast")
        assert response.status_code == 200
        assert response.json() == {"msg": "fast"}
\`\`\`

运行：

\`\`\`bash
pytest test_async_httpx.py -v
\`\`\`

\`\`\`txt
test_async_httpx.py::test_slow_async PASSED
test_async_httpx.py::test_fast_async PASSED
\`\`\`

注意三个"异步特征"：

1. 函数是 \`async def\`。
2. 用 \`async with\` 包 AsyncClient。
3. 用 \`await client.get\` 发请求。

如果忘了 await，会得到一个 coroutine 对象而不是 response，pytest 会警告"coroutine never awaited"。

## 六、Demo 3：对比 TestClient（同步）和 AsyncClient（异步）测试同一个端点

同一个接口，分别用同步和异步测，对比代码差异。

\`\`\`python
# 文件：test_compare_sync_async.py
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient
from main import app

# ---- 同步版本：用 TestClient ----
def test_slow_sync():
    """同步测 slow。"""
    client = TestClient(app)
    response = client.get("/slow")
    assert response.status_code == 200
    assert response.json() == {"msg": "done"}

# ---- 异步版本：用 AsyncClient + ASGITransport ----
@pytest.mark.asyncio
async def test_slow_async():
    """异步测 slow。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/slow")
        assert response.status_code == 200
        assert response.json() == {"msg": "done"}
\`\`\`

对比表：

| 维度 | TestClient（同步） | AsyncClient（异步） |
|------|-------------------|--------------------|
| 函数 | \`def\` | \`async def\` |
| 标记 | 不需要 | \`@pytest.mark.asyncio\` |
| 构造 | \`TestClient(app)\` | \`AsyncClient(transport=ASGITransport(app), ...)\` |
| 上下文 | 不需要 \`with\` 也能用 | 建议 \`async with\` |
| 请求 | \`client.get(...)\` | \`await client.get(...)\` |
| 适用场景 | 90% 日常测试 | 并发测试、async 依赖 |

**结论：日常测试用 TestClient 更省事；只有需要并发或 await 辅助函数时才用 AsyncClient。** 不要为了"显得高级"而全部用异步——异步代码更难写、更难调试。

## 七、Demo 4：异步测试中测试并发请求（asyncio.gather）

这是异步测试的"杀手锏"——同时发多个请求，验证接口的并发行为。

\`\`\`python
# 文件：test_concurrent.py
import pytest
import asyncio
import time
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_concurrent_slow_requests():
    """同时发 5 个 /slow 请求，总耗时应接近 0.5 秒，而非 2.5 秒。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 记录开始时间
        start = time.perf_counter()

        # asyncio.gather 并发执行多个协程
        # 这里同时发 5 个请求
        responses = await asyncio.gather(
            client.get("/slow"),
            client.get("/slow"),
            client.get("/slow"),
            client.get("/slow"),
            client.get("/slow"),
        )

        # 计算耗时
        elapsed = time.perf_counter() - start
        # 因为是并发的，5 个请求总共应该约 0.5 秒（不是 2.5 秒）
        # 留点余量，断言小于 1.5 秒
        assert elapsed < 1.5, f"并发失效了，耗时 {elapsed:.2f}s"

        # 每个响应都应该是 200
        for r in responses:
            assert r.status_code == 200
            assert r.json() == {"msg": "done"}

@pytest.mark.asyncio
async def test_serial_slow_requests():
    """对比：串行发 5 个 /slow 请求，总耗时应约 2.5 秒。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        start = time.perf_counter()
        # 串行：一个一个 await
        for _ in range(5):
            r = await client.get("/slow")
            assert r.status_code == 200
        elapsed = time.perf_counter() - start
        # 串行 5 个 0.5 秒，应该 > 2 秒
        assert elapsed > 2.0, f"应该串行耗时 2.5s，实际 {elapsed:.2f}s"
\`\`\`

运行：

\`\`\`bash
pytest test_concurrent.py -v
\`\`\`

\`\`\`txt
test_concurrent.py::test_concurrent_slow_requests PASSED
test_concurrent.py::test_serial_slow_requests PASSED
\`\`\`

这个对比很有意思：

- \`test_concurrent_slow_requests\`：5 个请求并发，总耗时约 0.5 秒——证明 FastAPI 的 async 路由确实能并发处理。
- \`test_serial_slow_requests\`：5 个请求串行，总耗时约 2.5 秒。

**asyncio.gather 是异步测试的核心武器。** 它能验证"接口在并发下是否正确"——比如限流（5 个并发应该拒绝 4 个）、并发安全（并发写数据库不会数据错乱）。

## 八、Demo 5：用 anyio_backend 配置 pytest-asyncio

pytest-asyncio 默认用 asyncio 后端。如果你想用 trio（另一个异步框架），或者想显式声明后端，可以配 \`anyio_backend\`。

### 8.1 用 fixture 配置后端

\`\`\`python
# 文件：test_anyio.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

# 这个 fixture 告诉 anyio/pytest-asyncio 用哪个后端
# 默认 "asyncio"，也可以设 "trio"
@pytest.fixture
def anyio_backend():
    return "asyncio"

# 用 anyio 风格的标记（pytest-anyio 提供，或 pytest-asyncio 0.21+ 也兼容）
@pytest.mark.anyio
async def test_with_anyio():
    """用 anyio 标记的异步测试。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/fast")
        assert response.status_code == 200
        assert response.json() == {"msg": "fast"}
\`\`\`

### 8.2 在 pyproject.toml 里配置 asyncio_mode

更省事的做法：在 \`pyproject.toml\` 里设 \`asyncio_mode = "auto"\`，这样所有 \`async def\` 的测试函数都自动当异步测试，不用加 \`@pytest.mark.asyncio\`。

\`\`\`toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
\`\`\`

配置后：

\`\`\`python
# 不用加 @pytest.mark.asyncio 了！
async def test_auto_async():
    """asyncio_mode=auto 时，async def 自动是异步测试。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/fast")
        assert response.status_code == 200
\`\`\`

**推荐用 auto 模式**——少写一个装饰器，代码更清爽。但要注意：auto 模式下，所有 async def 都会被当测试跑，不要在测试文件里写 async def 的辅助函数（除非加 \`__test__ = False\` 或挪到非 test_ 文件里）。

## 九、Demo 6：在 conftest.py 中封装 async client fixture

每个测试都写 \`ASGITransport + AsyncClient\` 太重复。在 conftest.py 里封装成 fixture，测试代码瞬间清爽。

\`\`\`python
# 文件：tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

# 异步 client fixture
# scope="function"：每个测试函数一个新的 client（默认）
# 也可以用 scope="session"，但要配合 anyio 的 session loop
@pytest.fixture
async def async_client():
    """异步 TestClient，所有异步测试都能用。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # yield 把 client 交给测试用
        yield client
        # 退出 async with 时清理

# 如果用 lifespan，可以加一个带 lifespan 的版本
from fastapi.testclient import TestClient

@pytest.fixture
def sync_client():
    """同步 TestClient，需要触发 lifespan 时用 with。"""
    with TestClient(app) as client:
        yield client
\`\`\`

测试文件里直接用：

\`\`\`python
# 文件：tests/api/test_async_endpoints.py
# 注意：不用 import async_client，conftest 自动提供

# 假设 asyncio_mode = "auto"
async def test_slow(async_client):
    """async_client 自动注入。"""
    response = await async_client.get("/slow")
    assert response.status_code == 200
    assert response.json() == {"msg": "done"}

async def test_fast(async_client):
    """复用同一个 fixture。"""
    response = await async_client.get("/fast")
    assert response.status_code == 200
    assert response.json() == {"msg": "fast"}

async def test_concurrent(async_client):
    """并发测试也能用 fixture。"""
    import asyncio
    responses = await asyncio.gather(
        async_client.get("/slow"),
        async_client.get("/slow"),
        async_client.get("/slow"),
    )
    for r in responses:
        assert r.status_code == 200
\`\`\`

对比没 fixture 时的代码——每个测试都要写 4 行 transport + AsyncClient 模板，现在一行 \`async_client\` 参数搞定。**fixture 是减少样板代码的关键。**

## 十、TestClient vs AsyncClient 对比表

| 维度 | TestClient | httpx.AsyncClient |
|------|-----------|-------------------|
| 同步/异步 | 同步 | 异步 |
| 导入 | \`fastapi.testclient.TestClient\` | \`httpx.AsyncClient\` + \`httpx.ASGITransport\` |
| 构造 | \`TestClient(app)\` | \`AsyncClient(transport=ASGITransport(app), base_url=...)\` |
| 请求 | \`client.get(...)\` | \`await client.get(...)\` |
| 测试函数 | \`def test_x():\` | \`async def test_x():\` + \`@pytest.mark.asyncio\`（或 auto） |
| 生命周期事件 | \`with TestClient(app)\` 触发 | 需要手动处理 lifespan |
| 并发能力 | 串行，无法并发 | \`asyncio.gather\` 并发 |
| 适合场景 | 90% 日常测试 | 并发测试、async 依赖、await 辅助函数 |
| 学习成本 | 低 | 中 |
| 调试难度 | 简单（同步栈） | 稍复杂（异步栈） |

**选型建议：**

- 默认用 TestClient——简单、够用、调试友好。
- 只有以下三种情况才换 AsyncClient：
  1. 要测并发行为（限流、并发安全）。
  2. 测试里要 await 一个 async 辅助函数。
  3. 要覆盖 async 依赖注入（且依赖本身难同步化）。

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| 异步测试原因 | 测 async 路由、并发请求、async 依赖 |
| AsyncClient | httpx 的异步客户端，用 \`async with\` + \`await\` |
| ASGITransport | 把 ASGI app 包装成 httpx 的 transport |
| 同步等价 | TestClient = httpx.Client + ASGITransport |
| 异步等价 | AsyncClient + ASGITransport |
| asyncio.gather | 并发发多个请求，验证并发行为 |
| pytest-asyncio | 异步测试支持，\`@pytest.mark.asyncio\` 标记 |
| asyncio_mode | auto 模式下 async def 自动是异步测试 |
| anyio_backend | 可选 trio 后端，默认 asyncio |
| conftest fixture | 封装 async client，减少样板代码 |
| 选型 | 默认 TestClient，并发/async 依赖才用 AsyncClient |

至此，"测试基础"五章节结束。你已掌握：测试理念、FastAPI 测试体系底层原理、pytest 用法、TestClient 同步测试、httpx 异步测试。下一批章节进入"测试核心"，会讲依赖注入测试、数据库测试、认证测试——把测试能力用到真实业务场景上。
`
  },
];
