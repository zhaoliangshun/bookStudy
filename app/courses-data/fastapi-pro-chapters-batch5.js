// =============================================================
// FastAPI 现代开发全书 - 第 5 批章节
// -------------------------------------------------------------
// 分组：依赖注入
// 本批包含 4 章：
//   fp-depends-basic: Depends 基础：函数即依赖
//   fp-yield-dep:     yield 依赖与资源管理
//   fp-nested-dep:    依赖嵌套与缓存机制
//   fp-class-dep:     类作为依赖与 Annotated 用法
// =============================================================

export const chapters = [
  {
    id: "fp-depends-basic",
    group: "依赖注入",
    icon: "💉",
    title: "Depends 基础：函数即依赖",
    content: `# Depends 基础：函数即依赖

依赖注入（Dependency Injection，简称 DI）是 FastAPI 最核心、也最优雅的特性之一。很多初学者听到"依赖注入"这四个字就头疼，觉得这是一个属于 Java/Spring 世界的复杂概念。但 FastAPI 的实现极其轻量——**任何一个普通函数都可以是一个依赖**，无需装饰器、无需配置文件、无需 XML。本章会从"为什么需要 DI"讲起，用对比的方式让你看清 DI 到底解决了什么问题，然后逐步掌握 \`Depends()\` 的所有基本用法。

## 一、什么是依赖注入（DI）

先抛开所有术语，用一个生活类比来理解。

假设你是一个厨师（路由函数），你要做一道菜（处理请求）。做菜需要"刀"和"食材"。你有两种方式获得它们：

1. **自己去找**：做菜前，自己跑去仓库拿刀、去冰箱拿食材。如果刀钝了，自己磨；如果冰箱没食材，自己采购。
2. **别人递给你**：你只管声明"我需要一把刀和一斤土豆"，自然有人在你开工前把它们准备好，放到你案板上。

第二种方式就是"依赖注入"——**你不再自己去获取依赖，而是声明你需要什么，由外部系统（框架）负责准备并递给你**。

在 Web 开发中，"依赖"通常是：数据库连接、当前登录用户、分页参数、配置项、权限校验逻辑等。如果每个路由函数都自己写一遍"从 token 解析用户"的代码，会出现大量重复。DI 的价值就在于**把这些公共逻辑抽成"依赖"，让路由函数只关心业务本身**。

## 二、没有 DI 的世界：看看重复有多严重

### Demo 1: 不使用 DI 的典型痛点

\`\`\`python
# 没有 DI 的写法：每个路由都要自己解析查询参数
from fastapi import FastAPI, Query

app = FastAPI()

# 路由 A：列出文章，需要分页参数
@app.get("/articles")
def list_articles(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    # 分页参数的校验逻辑在这里
    if page < 1 or size < 1 or size > 100:
        # 实际上 Query 已经做了校验，这里只是示意"如果手写校验"
        pass
    offset = (page - 1) * size
    # 假设从数据库查询
    return {"offset": offset, "size": size, "items": []}

# 路由 B：列出评论，也需要分页参数
@app.get("/comments")
def list_comments(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    # 完全相同的分页逻辑，复制粘贴
    offset = (page - 1) * size
    return {"offset": offset, "size": size, "items": []}

# 路由 C：列出用户，又需要分页参数
@app.get("/users")
def list_users(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    # 第三次复制粘贴……
    offset = (page - 1) * size
    return {"offset": offset, "size": size, "items": []}

# 问题：如果有一天要改分页规则（比如 size 上限从 100 改成 200）
# 你需要改三个地方，容易漏改
\`\`\`

这就是"重复代码"的经典症状。如果项目有 50 个分页接口，改一次分页规则就要改 50 处。DI 就是为了消灭这种重复。

## 三、IoC 控制反转：DI 的思想内核

DI 的背后是一个更宏观的设计原则——**IoC（Inversion of Control，控制反转）**。

"控制反转"反转的是什么？是"获取依赖的控制权"。

- **传统方式（正向控制）**：路由函数主动调用 \`db.get_session()\`、\`get_current_user()\`，自己决定什么时候、怎么获取依赖。
- **IoC 方式（反转控制）**：路由函数只声明"我需要一个 session"，由框架决定什么时候创建、怎么创建、创建后注入到哪里。

FastAPI 通过 \`Depends()\` 实现了 IoC。你把"获取依赖"的函数交给框架，框架在请求到来时自动调用它，把结果塞进路由参数。这就像"好莱坞原则"——**Don't call us, we'll call you**（别打电话给我们，我们会打给你）。路由函数不用主动去找依赖，框架会在合适的时机"打电话"给依赖函数，拿到结果再喂给路由。

## 四、Depends() 基本用法：函数即依赖

FastAPI 的 DI 极其简洁：**任何普通函数都是潜在的依赖**。你只需要在路由参数里用 \`Depends(那个函数)\` 声明，框架就会自动调用它。

### Demo 2: 第一个 Depends 示例

\`\`\`python
# 把分页逻辑抽成一个"依赖函数"
from fastapi import FastAPI, Depends, Query

app = FastAPI()

# 这是一个普通的 Python 函数，它就是"依赖"
# 它的参数会被 FastAPI 自动解析（就像路由函数一样）
def common_pagination(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    # 计算偏移量并返回一个字典
    offset = (page - 1) * size
    return {"page": page, "size": size, "offset": offset}

# 路由 A：用 Depends 注入分页参数
@app.get("/articles")
def list_articles(pagination: dict = Depends(common_pagination)):
    # pagination 的值是 common_pagination 的返回值
    # 不用再写分页逻辑了，直接用
    return {"offset": pagination["offset"], "size": pagination["size"], "items": []}

# 路由 B：同样的依赖，复用
@app.get("/comments")
def list_comments(pagination: dict = Depends(common_pagination)):
    return {"offset": pagination["offset"], "size": pagination["size"], "items": []}

# 路由 C：复用
@app.get("/users")
def list_users(pagination: dict = Depends(common_pagination)):
    return {"offset": pagination["offset"], "size": pagination["size"], "items": []}

# 现在如果要改分页规则，只需要改 common_pagination 一个函数
\`\`\`

这就是 DI 的核心威力：**一份逻辑，处处复用，改一处即生效**。

注意几个细节：
- \`common_pagination\` 是普通函数，没有任何特殊装饰器。
- 它的参数 \`page\` 和 \`size\` 也会被 FastAPI 当作查询参数自动解析（从 URL \`?page=2&size=50\` 读取）。
- \`Depends(common_pagination)\` 的返回值会被注入到路由的 \`pagination\` 参数。
- 路由函数本身的签名变得干净——不再有 \`page\` / \`size\`，只有一个 \`pagination\`。

## 五、依赖函数的参数也会被自动解析

这是 FastAPI DI 最巧妙的设计：**依赖函数的参数，和路由函数的参数享受同等待遇**。如果依赖函数声明了 \`Query\`、\`Path\`、\`Header\`、\`Cookie\`、\`Body\` 等参数，FastAPI 会自动从请求中解析。

### Demo 3: 依赖函数读取请求头

\`\`\`python
from fastapi import FastAPI, Depends, Header
from typing import Optional

app = FastAPI()

# 依赖函数：从请求头读取 API Key 并校验
def verify_api_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")):
    """
    这个函数会从请求头 X-API-Key 读取值
    如果没有这个头，x_api_key 为 None
    """
    if not x_api_key:
        # 在依赖里抛异常，路由函数不会执行
        # FastAPI 会自动把异常转成 HTTP 响应
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="X-API-Key header is missing")
    if x_api_key != "secret-123":
        raise HTTPException(status_code=403, detail="Invalid API Key")
    # 返回校验通过的 key，路由函数可以拿到
    return x_api_key

# 用 Depends 注入：每次请求 /secure 都会先执行 verify_api_key
@app.get("/secure")
def secure_endpoint(api_key: str = Depends(verify_api_key)):
    return {"message": "You have access", "your_key": api_key}

# 测试：
#   curl -H "X-API-Key: secret-123" http://127.0.0.1:8000/secure
#   -> {"message":"You have access","your_key":"secret-123"}
#
#   curl http://127.0.0.1:8000/secure
#   -> 401 {"detail":"X-API-Key header is missing"}
#
#   curl -H "X-API-Key: wrong" http://127.0.0.1:8000/secure
#   -> 403 {"detail":"Invalid API Key"}
\`\`\`

这个例子展示了 DI 在"鉴权"场景的典型用法：把校验逻辑抽成依赖，路由函数只管业务。如果鉴权失败，路由函数根本不会执行——这就是"前置校验"的优雅实现。

## 六、依赖的返回值注入

依赖函数的返回值会被注入到路由参数。返回值可以是任何类型：字典、对象、字符串、自定义类实例。

### Demo 4: 返回自定义对象而非字典

\`\`\`python
from fastapi import FastAPI, Depends, Query
from pydantic import BaseModel

app = FastAPI()

# 用 Pydantic 模型或 dataclass 封装分页参数，比字典更有类型提示
class PaginationParams:
    """分页参数容器"""
    def __init__(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

    def __repr__(self):
        return f"PaginationParams(page={self.page}, size={self.size}, offset={self.offset})"

# 依赖函数：构造并返回 PaginationParams 实例
def get_pagination(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)) -> PaginationParams:
    return PaginationParams(page=page, size=size)

@app.get("/articles")
def list_articles(pagination: PaginationParams = Depends(get_pagination)):
    # pagination 是 PaginationParams 实例，有 IDE 类型提示
    # 比 pagination["offset"] 这种字典访问更安全
    return {
        "page": pagination.page,
        "size": pagination.size,
        "offset": pagination.offset,
        "items": [],
    }

# 启动后访问 /articles?page=3&size=10
# -> {"page":3,"size":10,"offset":20,"items":[]}
\`\`\`

用对象代替字典的好处：IDE 能提供属性自动补全，拼错属性名会立刻报错，而不是等到运行时才暴露 \`KeyError\`。

## 七、同一请求内依赖缓存：同一个依赖只执行一次

这是 FastAPI DI 一个非常重要、也容易踩坑的特性：**在同一个请求中，如果多个参数依赖了同一个依赖函数，该函数只会执行一次，结果会被缓存复用**。

### Demo 5: 观察依赖缓存

\`\`\`python
from fastapi import FastAPI, Depends, Query
import time

app = FastAPI()

# 全局计数器，用于观察函数被调用了几次
call_count = 0

def slow_dependency():
    """
    模拟一个耗时的依赖（比如查数据库）
    """
    global call_count
    call_count += 1
    print(f"[slow_dependency] 第 {call_count} 次被调用，开始沉睡 1 秒……")
    time.sleep(1)  # 模拟耗时操作
    return {"value": f"result-{call_count}"}

# 路由：同时注入了 slow_dependency 两次
@app.get("/cache-test")
def cache_test(dep1: dict = Depends(slow_dependency), dep2: dict = Depends(slow_dependency)):
    # dep1 和 dep2 是同一个值吗？
    return {
        "dep1": dep1,
        "dep2": dep2,
        "same_object": dep1 is dep2,  # True！缓存让它们指向同一对象
        "call_count": call_count,     # 1！只调用了 1 次
    }

# 测试：curl http://127.0.0.1:8000/cache-test
# 耗时只有约 1 秒（而不是 2 秒），因为 slow_dependency 只执行了一次
# 返回：
# {
#   "dep1": {"value": "result-1"},
#   "dep2": {"value": "result-1"},
#   "same_object": true,
#   "call_count": 1
# }
\`\`\`

缓存的意义：如果一个请求里多个依赖都需要"当前用户"，查一次数据库就够了，不需要重复查询。这就是 \`use_cache=True\`（默认值）的行为。如果你想禁用缓存（每次都重新执行），可以传 \`use_cache=False\`，这个我们在下一章会详细讲。

### Demo 6: 依赖不带参数的简写

\`\`\`python
from fastapi import FastAPI, Depends
from typing import Annotated

app = FastAPI()

# 一个不带参数的依赖函数
def get_db_config():
    # 模拟返回数据库配置
    return {"host": "localhost", "port": 5432, "database": "myapp"}

# 写法 1：标准写法，显式传 Depends(get_db_config)
@app.get("/config1")
def get_config_v1(config: dict = Depends(get_db_config)):
    return config

# 写法 2：简写，直接 Depends() 不传参数
# FastAPI 会根据参数类型注解推断依赖函数
# 这里要求类型注解就是依赖函数本身
@app.get("/config2")
def get_config_v2(config: Annotated[dict, Depends(get_db_config)]):
    return config

# 写法 3：最简写法——不带参数的 Depends() 配合 Annotated
# FastAPI 允许 Depends() 不传参数，此时它会从类型注解推断
# 这种写法在 FastAPI 0.95+ 配合 Annotated 使用时最常见
DbConfigDep = Annotated[dict, Depends(get_db_config)]

@app.get("/config3")
def get_config_v3(config: DbConfigDep):
    return config

# 三种写法效果完全一样，返回的都是 {"host":"localhost","port":5432,"database":"myapp"}
\`\`\`

第三种写法（用 \`Annotated\` 定义类型别名）是 FastAPI 官方推荐的新写法，它的好处是：**把依赖声明和路由定义解耦**，依赖可以在多个路由间复用，且类型提示更清晰。我们会在第 19 章深入讲 \`Annotated\` 的各种用法。

## 八、Depends 的工作流程图解

用一个文字流程图总结 Depends 的工作过程：

\`\`\`text
请求到达 /articles?page=2&size=10
       |
       v
FastAPI 解析路由签名，发现 list_articles 依赖了 common_pagination
       |
       v
FastAPI 递归解析 common_pagination 的签名：
  - page: int = Query(1) -> 从 URL 取 page=2
  - size: int = Query(20) -> 从 URL 取 size=10
       |
       v
调用 common_pagination(page=2, size=10)
  -> 返回 {"page": 2, "size": 10, "offset": 10}
       |
       v
把返回值注入到 list_articles 的 pagination 参数
       |
       v
执行 list_articles(pagination={"page":2, "size":10, "offset":10})
       |
       v
返回响应给客户端
\`\`\`

关键点：**FastAPI 会递归地解析依赖树**。依赖函数自己也可以有依赖（用 \`Depends\` 声明），框架会一路解析到底。这种"依赖的依赖"就是嵌套依赖，我们在第 18 章会专门讲。

## 九、Depends 的设计哲学：声明式优于命令式

回顾本章，你会发现 FastAPI DI 的核心思想是**声明式编程**：

- **命令式**：路由函数里写 \`user = get_user_from_token(token)\`，主动调用。
- **声明式**：路由函数签名写 \`user: User = Depends(get_user_from_token)\`，声明需要什么。

声明式的好处是：路由函数变成了纯粹的"业务逻辑"，所有"如何获取依赖"的细节都被推到了依赖函数里。这让路由函数更短、更聚焦、更易测试（测试时可以替换依赖）。

这种设计还有一个隐藏优势：**FastAPI 能看到依赖的声明，从而自动生成 OpenAPI 文档**。比如 \`verify_api_key\` 里的 \`Header("X-API-Key")\` 会被文档记录为"该接口需要 X-API-Key 头"。如果用命令式写法，框架根本不知道接口需要什么头，文档也就无法自动生成。

## 十、本章小结

- **依赖注入（DI）**：把"获取依赖"的权力交给框架，路由函数只声明需要什么。核心价值是**消除重复、关注点分离**。
- **IoC 控制反转**：DI 的思想内核，反转的是"获取依赖的控制权"，从"路由主动找依赖"变成"框架把依赖喂给路由"。
- **\`Depends(fn)\`**：FastAPI DI 的语法入口。\`fn\` 是普通函数，它的参数会被自动解析，返回值注入路由。
- **依赖函数的参数**：和路由函数享受同等待遇，\`Query\`/\`Header\`/\`Body\` 等都能用。
- **返回值注入**：依赖返回什么，路由参数就拿到什么。推荐返回对象而非字典，便于 IDE 提示。
- **同一请求内缓存**：默认 \`use_cache=True\`，同一请求中同一依赖只执行一次，结果复用。
- **声明式优于命令式**：DI 让路由聚焦业务，还能让文档自动记录接口的输入需求。

下一章我们会深入 \`yield\` 依赖——它能在响应返回后执行清理代码，是管理数据库会话、文件句柄等资源的利器。
`
  },

  {
    id: "fp-yield-dep",
    group: "依赖注入",
    icon: "🔄",
    title: "yield 依赖与资源管理",
    content: `# yield 依赖与资源管理

在上一章我们学过，依赖函数用 \`return\` 返回值。但 \`return\` 有一个局限：**函数在 return 后就结束了，无法在"响应返回之后"再做清理工作**。比如数据库会话，你希望在请求处理完后关闭它；文件句柄，你希望在用完后释放它。这时候就需要 \`yield\` 依赖——它能"先产出资源，等路由执行完，再执行清理代码"。本章会从 \`yield\` 依赖的语法讲起，深入数据库会话管理、异常处理、执行顺序等关键话题。

## 一、为什么 return 不够用：资源管理的困境

先看一个真实场景：每个请求需要独立的数据库会话（Session），用完必须关闭，否则连接泄漏。

### Demo 1: 用 return 的困境

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 模拟一个数据库会话
class FakeSession:
    def __init__(self):
        self.opened = True
        print("[Session] 创建会话")

    def query(self, sql):
        if not self.opened:
            raise RuntimeError("会话已关闭")
        return f"结果: {sql}"

    def close(self):
        self.opened = False
        print("[Session] 关闭会话")

# 用 return 的依赖：能在创建时打开，但无法在请求结束后关闭
def get_session_bad():
    session = FakeSession()  # 创建会话
    return session           # 返回后就结束了，没法关闭
    # 问题：session.close() 永远不会被调用！
    # 连接会一直占用，直到 GC 回收（可能很久）

@app.get("/bad")
def bad_route(session: FakeSession = Depends(get_session_bad)):
    return {"data": session.query("SELECT 1")}
# 请求结束后，session 不会被关闭 -> 连接泄漏
\`\`\`

如果用 \`try/finally\` 呢？

\`\`\`python
# 尝试用 try/finally 解决
def get_session_still_bad():
    session = FakeSession()
    try:
        return session  # return 会直接返回，finally 会在 return 之后执行
    finally:
        session.close()  # 但这会在 return 之前就关闭了！
        # 路由函数拿到的 session 已经是关闭状态，无法使用
\`\`\`

看到了吗？\`return\` + \`finally\` 的组合行不通——\`finally\` 会在 \`return\` 时就执行，把资源提前释放。我们需要的是"**先给路由用，等路由用完了再清理**"。这正是 \`yield\` 依赖解决的问题。

## 二、yield 依赖的语法：产出值 + 清理代码

\`yield\` 依赖的语法非常简单：把 \`return value\` 换成 \`yield value\`，\`yield\` 之后的代码就是清理代码。

### Demo 2: 第一个 yield 依赖

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

class FakeSession:
    def __init__(self):
        self.opened = True
        print("[Session] 创建会话")

    def query(self, sql):
        return f"结果: {sql}"

    def close(self):
        self.opened = False
        print("[Session] 关闭会话")

# yield 依赖：yield 之前是"创建"，yield 之后是"清理"
def get_session():
    session = FakeSession()     # 1. 请求开始时执行：创建会话
    yield session               # 2. 把 session 交给路由函数
                                #    路由函数执行……
                                #    路由函数返回响应……
    session.close()             # 3. 响应返回后执行：关闭会话

@app.get("/items")
def list_items(session: FakeSession = Depends(get_session)):
    # session 在这里是"打开"状态
    return {"data": session.query("SELECT * FROM items")}

# 控制台输出顺序：
# [Session] 创建会话
# （路由函数执行）
# （响应返回给客户端）
# [Session] 关闭会话
\`\`\`

执行流程的关键：
1. 请求到达，FastAPI 调用 \`get_session()\`，执行到 \`yield session\`，把 session 交给路由。
2. 路由函数执行，使用 session。
3. 路由返回响应，FastAPI 把响应发给客户端。
4. FastAPI 回到 \`get_session()\`，执行 \`yield\` 之后的 \`session.close()\`。

**\`yield\` 之后的代码在响应返回后才执行**——这是 yield 依赖的核心价值，让"资源获取"和"资源释放"成对出现，不会泄漏。

## 三、数据库 Session 管理：yield 依赖的经典战场

yield 依赖最典型的应用就是数据库会话管理。下面用 SQLAlchemy 演示真实场景。

### Demo 3: SQLAlchemy 异步会话的 yield 依赖

\`\`\`python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

app = FastAPI()

# 创建异步引擎（连接池）
# echo=True 会打印 SQL 日志，便于调试
engine = create_async_engine(
    "postgresql+asyncpg://postgres:123456@localhost:5432/myapp",
    echo=True,
    pool_size=10,      # 连接池大小
    max_overflow=20,   # 允许超出 pool_size 的临时连接数
)

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # commit 后对象不过期，避免懒加载问题
)

# yield 依赖：每个请求一个独立会话，请求结束自动关闭
async def get_db() -> AsyncSession:
    """
    数据库会话依赖
    - yield 前：从连接池获取一个连接，创建会话
    - yield 后：关闭会话，连接归还连接池
    """
    async with AsyncSessionLocal() as session:
        # async with 会在退出时自动 close
        try:
            yield session
            # 路由函数执行完毕后，会回到这里
        except Exception:
            # 如果路由里抛异常，回滚事务
            await session.rollback()
            raise
        else:
            # 如果路由正常返回，提交事务
            # 注意：也可以不在依赖里自动提交，让路由自己控制
            await session.commit()

# 路由：注入会话
@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    # db 是 AsyncSession 实例，可以安全使用
    result = await db.execute(text("SELECT * FROM users WHERE id = :uid"), {"uid": user_id})
    row = result.fetchone()
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": row.id, "name": row.name}

# 每个请求结束后，session 自动关闭，连接归还连接池
# 即使路由抛异常，session 也会被正确关闭（async with 保证）
\`\`\`

这个模式是 FastAPI + SQLAlchemy 的"黄金标准"：每个请求独立会话，请求结束自动关闭，事务自动提交/回滚。

## 四、异常处理：yield 之后的 finally 与 except

yield 依赖可以捕获路由函数抛出的异常。在 \`yield\` 之后的代码里，你可以用 \`try/except/finally\` 来处理异常或做清理。

### Demo 4: yield 依赖的异常捕获

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

def risky_dependency():
    print("[dep] yield 之前：准备资源")
    try:
        yield {"resource": "ready"}
        # ---- 路由函数在这里执行 ----
        # 如果路由正常返回，yield 之后的代码从 yield 的下一行继续
        # 如果路由抛异常，异常会在这里"重现"，可以被 except 捕获
        print("[dep] yield 之后：正常结束（路由没抛异常）")
    except HTTPException as e:
        # 捕获路由抛出的 HTTPException
        print(f"[dep] 捕获到 HTTPException: {e.status_code} {e.detail}")
        # 注意：这里捕获后，异常仍然会被 FastAPI 的异常处理器处理
        # 如果不想让异常继续传播，可以不 raise（但通常不推荐）
        raise  # 重新抛出，让 FastAPI 转成 HTTP 响应
    except Exception as e:
        # 捕获其他异常
        print(f"[dep] 捕获到未知异常: {type(e).__name__}: {e}")
        raise
    finally:
        # finally 一定会执行，无论是否异常
        # 适合放"必须执行的清理逻辑"
        print("[dep] finally：释放资源")

@app.get("/ok")
def ok_route(dep: dict = Depends(risky_dependency)):
    print("[route] 路由执行中")
    return {"status": "ok", "dep": dep}

@app.get("/error")
def error_route(dep: dict = Depends(risky_dependency)):
    print("[route] 路由执行中，准备抛异常")
    raise HTTPException(status_code=500, detail="Something went wrong")

# 访问 /ok 的控制台输出：
# [dep] yield 之前：准备资源
# [route] 路由执行中
# [dep] yield 之后：正常结束（路由没抛异常）
# [dep] finally：释放资源

# 访问 /error 的控制台输出：
# [dep] yield 之前：准备资源
# [route] 路由执行中，准备抛异常
# [dep] 捕获到 HTTPException: 500 Something went wrong
# [dep] finally：释放资源
\`\`\`

**重要规则**：在 yield 依赖里捕获异常后，**如果你 \`raise\` 了，异常会继续传播**；如果你不 \`raise\`，异常会被"吞掉"（路由的异常处理器不会触发，客户端可能收到 200 而非 500）。通常你都应该重新 \`raise\`，除非你有充分的理由吞掉异常。

### Demo 5: 用 yield 依赖实现事务回滚

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

async def get_db_transaction():
    """
    带事务管理的数据库依赖
    - 路由正常返回 -> commit
    - 路由抛异常 -> rollback
    """
    from sqlalchemy.ext.asyncio import async_sessionmaker
    # 假设 SessionLocal 已定义
    SessionLocal = async_sessionmaker()
    
    async with SessionLocal() as session:
        try:
            yield session
            # 路由执行成功，提交事务
            await session.commit()
            print("[db] 事务已提交")
        except Exception as e:
            # 路由抛异常，回滚事务
            await session.rollback()
            print(f"[db] 事务已回滚，原因: {e}")
            raise  # 异常继续传播，让客户端收到错误响应
        finally:
            await session.close()
            print("[db] 会话已关闭")

# 转账路由：要么成功，要么全部回滚
@app.post("/transfer")
async def transfer(from_id: int, to_id: int, amount: float, db = Depends(get_db_transaction)):
    # 扣款
    result = await db.execute(
        text("UPDATE accounts SET balance = balance - :amt WHERE id = :fid AND balance >= :amt"),
        {"amt": amount, "fid": from_id}
    )
    if result.rowcount == 0:
        # 余额不足，抛异常 -> 触发 rollback
        raise HTTPException(status_code=400, detail="余额不足")
    
    # 加款
    await db.execute(
        text("UPDATE accounts SET balance = balance + :amt WHERE id = :tid"),
        {"amt": amount, "tid": to_id}
    )
    # 路由正常结束 -> get_db_transaction 会 commit
    return {"message": "转账成功", "amount": amount}
\`\`\`

这个例子展示了 yield 依赖在事务管理中的威力：路由函数只管写 SQL，提交/回滚的逻辑都在依赖里，业务代码非常干净。

## 五、yield 依赖的执行顺序

当一个请求有多个 yield 依赖时，它们的执行顺序遵循"**栈**"的规则（后进先出）。

### Demo 6: 多个 yield 依赖的执行顺序

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

def dep_a():
    print("[A] before yield")
    yield "A"
    print("[A] after yield（清理）")

def dep_b():
    print("[B] before yield")
    yield "B"
    print("[B] after yield（清理）")

def dep_c():
    print("[C] before yield")
    yield "C"
    print("[C] after yield（清理）")

@app.get("/order")
def order(a: str = Depends(dep_a), b: str = Depends(dep_b), c: str = Depends(dep_c)):
    print(f"[route] a={a}, b={b}, c={c}")
    return {"a": a, "b": b, "c": c}

# 控制台输出顺序：
# [A] before yield
# [B] before yield
# [C] before yield
# [route] a=A, b=B, c=C
# [C] after yield（清理）
# [B] after yield（清理）
# [A] after yield（清理）

# 分析：
# 1. 创建阶段：按声明顺序 A -> B -> C（先进先出，像排队进入）
# 2. 路由执行
# 3. 清理阶段：按相反顺序 C -> B -> A（后进先出，像栈弹出）
\`\`\`

这种"先进后出"的清理顺序和 Python 的 \`contextlib.ExitStack\` 行为一致，也和大多数编程语言的资源管理一致。它的好处是：**后创建的依赖依赖先创建的依赖时，清理顺序不会出错**。比如 B 依赖 A 的资源，那么 B 必须在 A 之前清理，否则 A 先清理了 B 就用不了——栈顺序天然保证了这一点。

## 六、yield 依赖与 async 的搭配

yield 依赖可以是同步函数（\`def\`），也可以是异步函数（\`async def\`）。选择规则和路由函数一样：

- 如果清理代码涉及异步操作（如 \`await session.close()\`），用 \`async def\`。
- 如果清理代码是纯同步操作（如 \`file.close()\`），可以用 \`def\`，FastAPI 会把它放到线程池执行。

### Demo 7: 同步与异步 yield 依赖对比

\`\`\`python
from fastapi import FastAPI, Depends
import asyncio
import time

app = FastAPI()

# 同步 yield 依赖：适合文件、同步数据库驱动
def get_file():
    f = open("example.txt", "w")
    try:
        yield f
    finally:
        f.close()
        print("[file] 文件已关闭")

# 异步 yield 依赖：适合异步数据库、异步 HTTP 客户端
async def get_async_resource():
    print("[async] 获取异步资源")
    try:
        yield {"type": "async", "connection": "established"}
    finally:
        # 异步清理
        await asyncio.sleep(0.01)  # 模拟异步关闭
        print("[async] 异步资源已释放")

@app.get("/sync-route")
def sync_route(f = Depends(get_file)):
    f.write("hello")
    return {"status": "written"}

@app.get("/async-route")
async def async_route(res = Depends(get_async_resource)):
    return res

# 同步依赖可以用于异步路由，反之亦然
# FastAPI 会自动处理同步/异步的桥接
@app.get("/mixed-route")
async def mixed_route(f = Depends(get_file), res = Depends(get_async_resource)):
    f.write("mixed")
    return {"file": "written", "res": res}
\`\`\`

## 七、yield 依赖的注意事项

使用 yield 依赖时，有几个容易踩的坑：

1. **一个函数只能 yield 一次**：yield 依赖是"单值生成器"，不能多次 yield。如果多次 yield，只有第一个值会被使用，后续的会被忽略。

2. **yield 之后的异常会传播**：如果你在 yield 之后不捕获异常，它会继续传播到 FastAPI 的异常处理器。这是正常行为，不要惊慌。

3. **不要在 yield 依赖里返回值**：\`yield\` 之后不要写 \`return value\`，\`return\` 只能单独使用（等价于 \`StopIteration\`）。

4. **依赖缓存对 yield 同样生效**：同一请求中，yield 依赖也只执行一次（创建+清理各一次），结果会被缓存。

### Demo 8: 错误示范——多次 yield

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 错误：多次 yield，只有第一个生效
def bad_dep():
    yield "first"
    yield "second"  # 这行永远不会被执行到
    print("这行也不会打印")

@app.get("/bad")
def bad_route(d: str = Depends(bad_dep)):
    return {"value": d}  # d 永远是 "first"

# 正确：只 yield 一次
def good_dep():
    resource = {"items": [1, 2, 3]}
    yield resource
    # 清理代码
    resource.clear()
    print("[good] 资源已清理")

@app.get("/good")
def good_route(d: dict = Depends(good_dep)):
    return d
\`\`\`

## 八、本章小结

- **yield 依赖**：用 \`yield\` 代替 \`return\`，yield 之前的代码在请求开始执行，yield 之后的代码在响应返回后执行。
- **资源管理**：yield 依赖是管理数据库会话、文件句柄、网络连接等资源的标准方式，保证"获取"和"释放"成对出现。
- **数据库 Session**：经典模式是 \`async with SessionLocal() as session: yield session\`，请求结束自动关闭。
- **异常处理**：yield 之后可以用 \`try/except/finally\` 捕获路由异常，决定是回滚事务还是吞掉异常（通常要重新 raise）。
- **执行顺序**：多个 yield 依赖的创建顺序是"先进先出"，清理顺序是"后进先出"（栈结构）。
- **同步/异步**：yield 依赖可以是 \`def\` 或 \`async def\`，选择规则同路由函数。
- **一个函数只 yield 一次**：多次 yield 只有第一个生效。

下一章我们深入依赖嵌套——依赖可以依赖其他依赖，形成依赖树，以及缓存机制的进阶用法。
`
  },

  {
    id: "fp-nested-dep",
    group: "依赖注入",
    icon: "🌳",
    title: "依赖嵌套与缓存机制",
    content: `# 依赖嵌套与缓存机制

在前两章里，我们学的依赖都是"扁平"的——一个依赖函数直接被路由使用。但在真实项目中，依赖往往会形成树状结构：路由依赖"当前用户"，"当前用户"依赖"token 解析"，"token 解析"依赖"请求头"。这种"依赖的依赖"就是**嵌套依赖**。FastAPI 会递归地解析整棵依赖树，并利用缓存机制避免重复执行。本章会讲透嵌套依赖、依赖树、缓存控制、全局依赖等进阶话题。

## 一、依赖可以依赖其他依赖

依赖函数本身也可以用 \`Depends()\` 声明自己的依赖。FastAPI 会递归解析，直到所有依赖都被满足。

### Demo 1: 嵌套依赖初体验

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException
from typing import Optional

app = FastAPI()

# 第一层依赖：从请求头读取 token
def extract_token(authorization: Optional[str] = Header(None)):
    """
    从 Authorization 头提取 Bearer token
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    # 期望格式：Bearer <token>
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    return parts[1]  # 返回 token 字符串

# 第二层依赖：根据 token 查用户
def get_current_user(token: str = Depends(extract_token)):
    """
    这个依赖自己依赖了 extract_token
    FastAPI 会先执行 extract_token，拿到 token，再执行本函数
    """
    # 模拟根据 token 查数据库
    users = {"abc123": {"id": 1, "name": "Alice"}, "def456": {"id": 2, "name": "Bob"}}
    user = users.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# 第三层（路由）：依赖 get_current_user
@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user

# 测试：
# curl -H "Authorization: Bearer abc123" http://127.0.0.1:8000/me
# -> {"id":1,"name":"Alice"}
#
# curl http://127.0.0.1:8000/me
# -> 401 {"detail":"Authorization header missing"}
#
# curl -H "Authorization: Bearer wrong" http://127.0.0.1:8000/me
# -> 401 {"detail":"Invalid token"}
\`\`\`

解析过程：路由 \`/me\` 依赖 \`get_current_user\` → \`get_current_user\` 依赖 \`extract_token\` → \`extract_token\` 依赖 \`Header(authorization)\`。FastAPI 从最底层的 \`Header\` 开始解析，逐层向上，最终把 \`user\` 注入路由。

## 二、依赖解析树：画出依赖关系

理解嵌套依赖的关键是能"画出依赖树"。以上面的例子为例：

\`\`\`text
路由: me(user = Depends(get_current_user))
         |
         v
  get_current_user(token = Depends(extract_token))
         |
         v
    extract_token(authorization = Header(None))
         |
         v
    从请求头读取 Authorization 的值
\`\`\`

FastAPI 的解析是**自底向上**的：先解析叶子节点（Header），逐层返回，最终把根依赖的结果注入路由。这和 Python 的函数调用栈一致。

### Demo 2: 更深的嵌套依赖

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException, Query
from typing import Optional

app = FastAPI()

# 依赖 1：读取并校验 API Key
def validate_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    if x_api_key != "admin-key":
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

# 依赖 2：读取并校验 token（依赖 1）
def validate_token(
    authorization: str = Header(..., alias="Authorization"),
    api_key: str = Depends(validate_api_key),  # 嵌套依赖
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization[7:]  # 去掉 "Bearer " 前缀
    return token

# 依赖 3：根据 token 查用户（依赖 2）
def get_current_user(token: str = Depends(validate_token)):
    users = {"token-001": {"id": 1, "name": "Alice", "role": "admin"}}
    user = users.get(token)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 依赖 4：检查是否是管理员（依赖 3）
def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# 路由：4 层依赖嵌套
@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    # 只有 admin 才能走到这里
    return {"deleted": user_id, "by": admin["name"]}

# 依赖树：
# delete_user
#   -> require_admin
#        -> get_current_user
#             -> validate_token
#                  -> validate_api_key
#                       -> Header(X-API-Key)
#                  -> Header(Authorization)
\`\`\`

这个 4 层嵌套的依赖树清晰地将"鉴权"逻辑分层：API Key 校验 → Token 校验 → 用户查询 → 角色检查。每一层只做一件事，组合起来形成完整的权限链。

## 三、use_cache=False：禁用缓存的场景

默认情况下，同一请求中同一依赖只执行一次（结果缓存）。但有些场景你需要每次都重新执行——这时用 \`use_cache=False\`。

### Demo 3: 缓存的默认行为

\`\`\`python
from fastapi import FastAPI, Depends
import uuid

app = FastAPI()

# 生成唯一 ID 的依赖
def gen_request_id():
    # 每次调用生成一个新 UUID
    rid = str(uuid.uuid4())
    print(f"[gen_request_id] 生成: {rid}")
    return rid

# 路由：同一个依赖注入两次
@app.get("/cached")
def cached_route(id1: str = Depends(gen_request_id), id2: str = Depends(gen_request_id)):
    return {"id1": id1, "id2": id2, "same": id1 == id2}

# 测试：curl http://127.0.0.1:8000/cached
# 控制台只打印一次 [gen_request_id] 生成: xxx
# 返回：{"id1":"xxx","id2":"xxx","same":true}
# id1 和 id2 相同 -> 依赖被缓存了，只执行一次
\`\`\`

### Demo 4: 禁用缓存

\`\`\`python
# 路由：禁用缓存
@app.get("/no-cache")
def no_cache_route(
    id1: str = Depends(gen_request_id, use_cache=False),
    id2: str = Depends(gen_request_id, use_cache=False),
):
    return {"id1": id1, "id2": id2, "same": id1 == id2}

# 测试：curl http://127.0.0.1:8000/no-cache
# 控制台打印两次 [gen_request_id] 生成: xxx
# 返回：{"id1":"aaa","id2":"bbb","same":false}
# id1 和 id2 不同 -> 依赖执行了两次，没缓存
\`\`\`

**何时需要 \`use_cache=False\`？**
- 依赖每次执行需要产生不同结果（如生成随机数、时间戳）。
- 依赖有副作用，需要每次都执行（如写日志）。

**何时保持 \`use_cache=True\`（默认）？**
- 依赖是"查询型"的（如查数据库拿当前用户），查一次就够了。
- 依赖开销大（如远程调用），不想重复执行。

绝大多数情况下，缓存是正确的行为（避免重复查数据库）。只有当你明确需要"每次都执行"时才禁用。

## 四、全局依赖：app 级别与 router 级别

除了在路由参数里声明依赖，FastAPI 还支持"全局依赖"——应用到所有路由的依赖。全局依赖分两级：app 级别和 router 级别。

### Demo 5: app 级别全局依赖

\`\`\`python
from fastapi import FastAPI, Depends, Request
import time

app = FastAPI()

# app 级别依赖：对所有路由生效
def log_request_time():
    """记录每个请求的开始时间"""
    start = time.time()
    print(f"[global] 请求开始: {start}")
    # 全局依赖的返回值不会注入路由（除非路由也声明了同名依赖）
    # 它主要用于"副作用"——执行校验、日志等

# 在创建 app 时声明全局依赖
# 注意：这里重新创建 app 以演示
app = FastAPI(dependencies=[Depends(log_request_time)])

@app.get("/a")
def route_a():
    return {"route": "a"}

@app.get("/b")
def route_b():
    return {"route": "b"}

# 访问 /a 和 /b 都会先执行 log_request_time
# 即使路由本身没有声明任何依赖
\`\`\`

app 级别依赖适合做"全站统一"的逻辑，比如：全站鉴权、请求日志、限流等。但注意：**app 级别依赖的返回值不会自动注入路由**（因为路由没声明对应参数），它只发挥"副作用"。

### Demo 6: router 级别全局依赖

\`\`\`python
from fastapi import FastAPI, APIRouter, Depends, Header, HTTPException
from typing import Optional

app = FastAPI()

# 管理后台的鉴权依赖
def require_admin_key(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key != "super-secret":
        raise HTTPException(status_code=403, detail="Admin key required")
    return x_admin_key

# 创建一个 router，所有挂在这个 router 上的路由都需要 admin key
admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin_key)],  # router 级别依赖
)

# 这些路由自动继承了 require_admin_key 依赖
@admin_router.get("/users")
def admin_list_users():
    return {"users": ["Alice", "Bob"]}

@admin_router.get("/orders")
def admin_list_orders():
    return {"orders": []}

@admin_router.delete("/users/{user_id}")
def admin_delete_user(user_id: int):
    return {"deleted": user_id}

# 把 admin_router 挂到 app
app.include_router(admin_router)

# 公开路由，不需要 admin key
@app.get("/public")
def public_route():
    return {"public": True}

# 测试：
# curl http://127.0.0.1:8000/public           -> 200 OK
# curl http://127.0.0.1:8000/admin/users      -> 403（缺 admin key）
# curl -H "X-Admin-Key: super-secret" http://127.0.0.1:8000/admin/users -> 200
\`\`\`

router 级别依赖的价值：**按模块分组鉴权**。管理后台所有接口都需要 admin key，公开接口不需要——用两个 router 分别挂不同依赖，比在每个路由里写 \`Depends\` 优雅得多。

## 五、依赖链中的异常传播

当嵌套依赖的某一层抛出异常，异常会向上传播，中断整个依赖链。FastAPI 会把异常转成 HTTP 响应。

### Demo 7: 异常中断依赖链

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException
from typing import Optional

app = FastAPI()

# 第一层：校验 token 格式
def parse_token(authorization: Optional[str] = Header(None)):
    print("[parse_token] 执行中")
    if not authorization:
        print("[parse_token] 抛异常：无 Authorization 头")
        raise HTTPException(status_code=401, detail="No auth header")
    return authorization

# 第二层：查用户
def get_user(token: str = Depends(parse_token)):
    print("[get_user] 执行中")
    # 如果 parse_token 抛了异常，这里不会执行
    return {"name": "Alice"}

# 路由
@app.get("/protected")
def protected(user: dict = Depends(get_user)):
    print("[protected] 执行中")
    # 如果 get_user 抛了异常，这里不会执行
    return user

# 测试：curl http://127.0.0.1:8000/protected（不带 Authorization 头）
# 控制台输出：
# [parse_token] 执行中
# [parse_token] 抛异常：无 Authorization 头
# （get_user 和 protected 都不会执行）
#
# 响应：401 {"detail":"No auth header"}

# 测试：curl -H "Authorization: Bearer xxx" http://127.0.0.1:8000/protected
# 控制台输出：
# [parse_token] 执行中
# [get_user] 执行中
# [protected] 执行中
#
# 响应：200 {"name":"Alice"}
\`\`\`

异常传播是 DI 的天然行为：依赖链就像调用栈，任何一层抛异常都会"短路"后续所有逻辑。这正好符合"鉴权失败就立即返回，不执行业务"的期望。

## 六、依赖缓存与嵌套的交互

在嵌套依赖中，缓存的行为有一个重要细节：**同一依赖在同一请求中只执行一次，即使它被多个依赖引用**。

### Demo 8: 共享底层依赖的缓存

\`\`\`python
from fastapi import FastAPI, Depends, Header
from typing import Optional
import time

app = FastAPI()

call_log = []

# 底层依赖：读取 token
def get_token(authorization: Optional[str] = Header(None)):
    call_log.append("get_token")
    return authorization or "default-token"

# 依赖 A：用 token 查用户
def get_user(token: str = Depends(get_token)):
    call_log.append("get_user")
    return {"name": "Alice", "token": token}

# 依赖 B：用 token 查权限
def get_permissions(token: str = Depends(get_token)):
    call_log.append("get_permissions")
    return ["read", "write"]

# 路由：同时依赖 get_user 和 get_permissions
# 它们又都依赖 get_token
@app.get("/dashboard")
def dashboard(
    user: dict = Depends(get_user),
    perms: list = Depends(get_permissions),
):
    return {"user": user, "permissions": perms, "call_log": call_log}

# 测试：curl http://127.0.0.1:8000/dashboard
# 返回的 call_log: ["get_token", "get_user", "get_permissions"]
# 注意：get_token 只出现了一次！
# 即使 get_user 和 get_permissions 都依赖它，它也只执行了一次
# 这就是依赖缓存的价值——避免重复查 token
\`\`\`

这个例子展示了缓存在复杂依赖树中的价值：\`get_token\` 被两个依赖引用，但只执行一次。如果不缓存，每次都要重新解析请求头，浪费性能。

## 七、依赖嵌套的设计原则

写嵌套依赖时，遵循以下原则能让代码更清晰：

1. **单一职责**：每层依赖只做一件事。\`extract_token\` 只管解析 token，\`get_user\` 只管查用户，\`require_admin\` 只管检查角色。
2. **自底向上设计**：先写最底层的依赖（如读请求头），再写上层依赖（如查用户），最后写路由。
3. **避免过深嵌套**：超过 4 层的嵌套会让调试困难。如果太深，考虑合并某些层。
4. **善用缓存**：默认缓存是好的，避免重复查询。只有需要"每次都执行"时才禁用。

### Demo 9: 完整的鉴权依赖设计

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException, APIRouter
from typing import Optional, Annotated
import jwt  # PyJWT 库

app = FastAPI()

SECRET = "my-secret-key"

# 底层依赖：提取 Bearer token
def get_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    return authorization[7:]

# 中层依赖：解码 JWT
def get_payload(token: str = Depends(get_token)) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# 上层依赖：获取当前用户
def get_current_user(payload: dict = Depends(get_payload)) -> dict:
    user_id = payload.get("sub")
    # 模拟查数据库
    users_db = {"1": {"id": 1, "name": "Alice", "role": "admin"}}
    user = users_db.get(str(user_id))
    if not user:
        raise HTTPException(404, "User not found")
    return user

# 顶层依赖：要求管理员
def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Admin access required")
    return user

# 类型别名，便于复用
CurrentUser = Annotated[dict, Depends(get_current_user)]
AdminUser = Annotated[dict, Depends(require_admin)]

# 普通用户路由
@app.get("/profile")
def profile(user: CurrentUser):
    return user

# 管理员路由
@app.delete("/users/{uid}")
def delete_user(uid: int, admin: AdminUser):
    return {"deleted": uid, "by": admin["name"]}

# 依赖树清晰：
# profile        -> get_current_user -> get_payload -> get_token
# delete_user    -> require_admin    -> get_current_user -> get_payload -> get_token
# get_token 和 get_payload 被共享，但缓存保证只执行一次
\`\`\`

## 八、本章小结

- **嵌套依赖**：依赖函数自己也可以用 \`Depends\` 声明依赖，FastAPI 递归解析整棵依赖树。
- **解析顺序**：自底向上——先解析叶子依赖，逐层返回，最终注入路由。
- **\`use_cache=False\`**：禁用缓存，每次调用都重新执行。适用于需要不同结果的场景（随机数、时间戳）。
- **app 级别依赖**：\`FastAPI(dependencies=[...])\`，对所有路由生效，适合全站鉴权/日志。
- **router 级别依赖**：\`APIRouter(dependencies=[...])\`，对该 router 下所有路由生效，适合模块化鉴权。
- **异常传播**：依赖链中任一层抛异常，后续依赖和路由都不执行，异常转成 HTTP 响应。
- **缓存与嵌套**：同一依赖即使被多个上层依赖引用，也只执行一次——避免重复查询。
- **设计原则**：单一职责、自底向上、避免过深嵌套、善用缓存。

下一章我们学习类作为依赖以及 \`Annotated\` 类型提示的进阶用法，让依赖声明更优雅、更可复用。
`
  },

  {
    id: "fp-class-dep",
    group: "依赖注入",
    icon: "📦",
    title: "类作为依赖与 Annotated 用法",
    content: `# 类作为依赖与 Annotated 用法

到目前为止，我们用的依赖都是函数。但 FastAPI 的 DI 系统同样支持**类作为依赖**——直接把一个类传给 \`Depends\`，FastAPI 会自动调用它的 \`__init__\` 并解析参数。配合 Python 3.9+ 的 \`Annotated\` 类型提示，依赖声明可以变得极其优雅且可复用。本章还会讲依赖覆盖（\`dependency_overrides\`）——这是测试时替换依赖的利器，以及一个完整的权限校验实战。

## 一、类作为依赖：__init__ 参数自动解析

FastAPI 不仅能用函数做依赖，还能用类。当你把类传给 \`Depends(MyClass)\` 时，FastAPI 会自动分析 \`MyClass.__init__\` 的参数签名，把它们当作请求参数来解析，然后实例化这个类。

### Demo 1: 类作为分页依赖

\`\`\`python
from fastapi import FastAPI, Depends, Query

app = FastAPI()

# 一个普通的类，__init__ 的参数会被 FastAPI 解析
class Pagination:
    def __init__(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
        # FastAPI 会从 URL 查询参数读取 page 和 size
        # 然后调用 Pagination(page=..., size=...)
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

# 直接把类传给 Depends，不需要写工厂函数
@app.get("/articles")
def list_articles(pagination: Pagination = Depends(Pagination)):
    # pagination 是 Pagination 实例
    return {"page": pagination.page, "size": pagination.size, "offset": pagination.offset}

# 简写：Depends() 不传参数时，从类型注解推断
@app.get("/comments")
def list_comments(pagination: Pagination = Depends()):
    return {"page": pagination.page, "size": pagination.size}

# 两种写法等价，Depends() 会从 pagination: Pagination 推断出 Depends(Pagination)
\`\`\`

类依赖的好处：**把"参数"和"行为"封装在一起**。\`Pagination\` 类不仅有 \`page\`/\`size\` 属性，还可以加方法（如 \`has_next()\`、\`next_page()\`），比裸函数返回字典更强大。

### Demo 2: 带方法的类依赖

\`\`\`python
from fastapi import FastAPI, Depends, Query

app = FastAPI()

class Pagination:
    def __init__(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

    def has_next(self, total: int) -> bool:
        """是否还有下一页"""
        return self.offset + self.size < total

    def next_page(self) -> int:
        return self.page + 1

    def prev_page(self) -> int:
        return max(1, self.page - 1)

@app.get("/articles")
def list_articles(pagination: Pagination = Depends(Pagination)):
    total = 100  # 假设总共 100 篇文章
    items = list(range(pagination.offset, min(pagination.offset + pagination.size, total)))
    return {
        "items": items,
        "page": pagination.page,
        "size": pagination.size,
        "has_next": pagination.has_next(total),
        "next_page": pagination.next_page() if pagination.has_next(total) else None,
    }
\`\`\`

## 二、Annotated 类型提示：依赖声明的现代写法

Python 3.9 引入了 \`Annotated\` 类型（\`typing.Annotated\`），它允许你在类型注解里附加"元数据"。FastAPI 从 0.95 版本开始支持用 \`Annotated\` 声明依赖，这是官方推荐的现代写法。

### Demo 3: Annotated 基础用法

\`\`\`python
from fastapi import FastAPI, Depends, Query
from typing import Annotated

app = FastAPI()

# 传统写法
def old_style(pagination: dict = Depends(some_dep)):
    ...

# Annotated 写法：把 Depends 放进类型注解
# Annotated[类型, 依赖声明]
def new_style(pagination: Annotated[dict, Depends(some_dep)]):
    ...

# Annotated 的优势：
# 1. 类型提示更完整——IDE 和 mypy 能看到 pagination 是 dict
# 2. 可以定义"类型别名"实现复用
\`\`\`

### Demo 4: 用 Annotated 定义可复用的依赖类型

\`\`\`python
from fastapi import FastAPI, Depends, Query, Header
from typing import Annotated, Optional

app = FastAPI()

# 定义依赖类型别名——一次声明，处处复用
PaginationDep = Annotated[
    int,  # 返回类型
    Query(1, ge=1, description="页码，从 1 开始"),
]

SizeDep = Annotated[
    int,
    Query(20, ge=1, le=100, description="每页数量"),
]

# 多个路由复用同一个类型别名
@app.get("/articles")
def list_articles(page: PaginationDep, size: SizeDep):
    return {"page": page, "size": size, "offset": (page - 1) * size}

@app.get("/comments")
def list_comments(page: PaginationDep, size: SizeDep):
    return {"page": page, "size": size, "offset": (page - 1) * size}

@app.get("/users")
def list_users(page: PaginationDep, size: SizeDep):
    return {"page": page, "size": size, "offset": (page - 1) * size}

# 类型别名让签名极其简洁，且改一处即生效
\`\`\`

对比传统写法（每个路由都写 \`page: int = Query(1, ge=1)\`），\`Annotated\` + 类型别名让代码量大幅减少，且消除了重复。

### Demo 5: Annotated 组合依赖

\`\`\`python
from fastapi import FastAPI, Depends, Header
from typing import Annotated, Optional

app = FastAPI()

# 依赖函数
def get_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    return x_api_key

def get_current_user(api_key: str = Depends(get_api_key)) -> dict:
    users = {"key-001": {"id": 1, "name": "Alice"}}
    user = users.get(api_key)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(401, "Invalid API key")
    return user

# 用 Annotated 定义依赖类型别名
ApiKeyDep = Annotated[str, Depends(get_api_key)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

# 路由签名极其干净
@app.get("/me")
def me(user: CurrentUserDep):
    return user

@app.get("/my-key")
def my_key(key: ApiKeyDep):
    return {"key": key}

@app.get("/dashboard")
def dashboard(user: CurrentUserDep, key: ApiKeyDep):
    return {"user": user, "key": key}
\`\`\`

## 三、Annotated 的复用与组合

\`Annotated\` 的真正威力在于**组合**——你可以把多个 \`Annotated\` 类型组合成更复杂的依赖。

### Demo 6: 组合多个依赖

\`\`\`python
from fastapi import FastAPI, Depends, Query, Header, Path
from typing import Annotated
from pydantic import BaseModel

app = FastAPI()

# 基础依赖
class Pagination:
    def __init__(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

def get_db():
    yield {"session": "active"}

def get_current_user(token: str = Header(...)) -> dict:
    return {"name": "Alice", "role": "admin"}

# 定义类型别名
PaginationDep = Annotated[Pagination, Depends(Pagination)]
DbDep = Annotated[dict, Depends(get_db)]
UserDep = Annotated[dict, Depends(get_current_user)]

# 响应模型
class ItemList(BaseModel):
    items: list
    page: int
    size: int

# 组合多个依赖——签名一目了然
@app.get("/items/{category}", response_model=ItemList)
def list_items(
    category: Annotated[str, Path(description="商品分类")],
    pagination: PaginationDep,
    db: DbDep,
    user: UserDep,
):
    items = [{"id": i, "category": category} for i in range(pagination.offset, pagination.offset + pagination.size)]
    return ItemList(items=items, page=pagination.page, size=pagination.size)
\`\`\`

## 四、依赖覆盖（dependency_overrides）：测试的利器

\`dependency_overrides\` 是 FastAPI 提供的依赖替换机制——在测试时把真实依赖替换成 mock 依赖，无需改业务代码。

### Demo 7: 用 dependency_overrides 做测试

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from typing import Annotated

app = FastAPI()

# 真实依赖：从数据库查用户
def get_current_user() -> dict:
    # 真实环境：解析 token，查数据库
    raise HTTPException(401, "Not authenticated")  # 测试环境会失败

UserDep = Annotated[dict, Depends(get_current_user)]

@app.get("/me")
def me(user: UserDep):
    return user

# ---- 测试 ----
client = TestClient(app)

def test_without_override():
    """不覆盖依赖：会 401"""
    response = client.get("/me")
    assert response.status_code == 401

def test_with_override():
    """覆盖依赖：返回 mock 用户"""
    # 定义 mock 依赖
    def mock_get_current_user() -> dict:
        return {"id": 999, "name": "TestUser", "role": "admin"}

    # 注册覆盖：把 get_current_user 替换成 mock_get_current_user
    app.dependency_overrides[get_current_user] = mock_get_current_user

    response = client.get("/me")
    assert response.status_code == 200
    assert response.json() == {"id": 999, "name": "TestUser", "role": "admin"}

    # 测试完清除覆盖
    app.dependency_overrides.clear()

def test_override_with_different_user():
    """覆盖成另一个用户"""
    def mock_admin() -> dict:
        return {"id": 1, "name": "Admin", "role": "admin"}

    app.dependency_overrides[get_current_user] = mock_admin
    response = client.get("/me")
    assert response.json()["role"] == "admin"
    app.dependency_overrides.clear()

# 依赖覆盖的关键：
# 1. 不需要改路由代码
# 2. mock 依赖的签名要和原依赖"兼容"（参数和返回值类型匹配）
# 3. 测试完记得 clear()，否则会影响其他测试
\`\`\`

\`dependency_overrides\` 的原理：FastAPI 内部用一个字典 \`{原依赖函数: 替换函数}\` 存储覆盖关系。解析依赖时，如果发现该依赖被覆盖，就调用替换函数而非原函数。

### Demo 8: 覆盖数据库依赖做单元测试

\`\`\`python
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from typing import Annotated

app = FastAPI()

# 真实数据库依赖
async def get_db():
    # 真实环境：连接 PostgreSQL
    yield {"type": "postgres", "connection": "real"}

DbDep = Annotated[dict, Depends(get_db)]

@app.get("/users")
async def list_users(db: DbDep):
    # 真实逻辑：查数据库
    # 这里简化为返回 db 信息
    return {"db_type": db["type"], "users": ["Alice", "Bob"]}

# 测试时用内存数据库
async def get_test_db():
    yield {"type": "sqlite-memory", "connection": "fake"}

def test_list_users():
    # 覆盖数据库依赖
    app.dependency_overrides[get_db] = get_test_db
    client = TestClient(app)

    response = client.get("/users")
    assert response.status_code == 200
    data = response.json()
    assert data["db_type"] == "sqlite-memory"  # 用的是 mock 数据库
    assert "users" in data

    app.dependency_overrides.clear()
\`\`\`

## 五、实战：权限校验依赖系统

把本章学到的所有知识组合起来，做一个完整的权限校验系统。

### Demo 9: 完整的权限校验系统

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException, APIRouter
from typing import Annotated, Optional
from enum import Enum

app = FastAPI()

# 角色枚举
class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# 模拟用户数据库
USERS_DB = {
    "admin-token": {"id": 1, "name": "Alice", "role": Role.ADMIN},
    "editor-token": {"id": 2, "name": "Bob", "role": Role.EDITOR},
    "viewer-token": {"id": 3, "name": "Charlie", "role": Role.VIEWER},
}

# 依赖 1：提取 token
def extract_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    return authorization[7:]

# 依赖 2：查用户
def get_current_user(token: str = Depends(extract_token)) -> dict:
    user = USERS_DB.get(token)
    if not user:
        raise HTTPException(401, "Invalid token")
    return user

# 依赖 3：角色检查工厂（返回一个依赖函数）
def require_role(*allowed_roles: Role):
    """
    角色检查工厂：传入允许的角色，返回一个依赖函数
    这是高阶依赖的用法——用函数生成依赖
    """
    def role_checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in allowed_roles:
            raise HTTPException(
                403,
                f"Role {user['role']} not allowed. Required: {allowed_roles}"
            )
        return user
    return role_checker

# 类型别名
CurrentUserDep = Annotated[dict, Depends(get_current_user)]
AdminDep = Annotated[dict, Depends(require_role(Role.ADMIN))]
EditorOrAdminDep = Annotated[dict, Depends(require_role(Role.ADMIN, Role.EDITOR))]

# 路由
@app.get("/public")
def public():
    return {"message": "公开接口"}

@app.get("/me")
def me(user: CurrentUserDep):
    return user

@app.post("/articles")
def create_article(user: EditorOrAdminDep):
    return {"created_by": user["name"], "role": user["role"]}

@app.delete("/articles/{article_id}")
def delete_article(article_id: int, user: AdminDep):
    return {"deleted": article_id, "by": user["name"]}

# 测试：
# curl http://127.0.0.1:8000/public
#   -> 200 {"message":"公开接口"}
#
# curl http://127.0.0.1:8000/me
#   -> 401（无 token）
#
# curl -H "Authorization: Bearer viewer-token" http://127.0.0.1:8000/me
#   -> 200 {"id":3,"name":"Charlie","role":"viewer"}
#
# curl -H "Authorization: Bearer viewer-token" -X POST http://127.0.0.1:8000/articles
#   -> 403（viewer 不能创建）
#
# curl -H "Authorization: Bearer editor-token" -X POST http://127.0.0.1:8000/articles
#   -> 200 {"created_by":"Bob","role":"editor"}
#
# curl -H "Authorization: Bearer editor-token" -X DELETE http://127.0.0.1:8000/articles/1
#   -> 403（editor 不能删除）
#
# curl -H "Authorization: Bearer admin-token" -X DELETE http://127.0.0.1:8000/articles/1
#   -> 200 {"deleted":1,"by":"Alice"}
\`\`\`

这个实战综合运用了：类依赖、嵌套依赖、Annotated 类型别名、依赖工厂（\`require_role\` 返回依赖函数）、依赖覆盖（测试时可 mock）。这是 FastAPI DI 在真实项目中的典型用法。

## 六、Annotated 的注意事项

### Demo 10: Annotated 的常见陷阱

\`\`\`python
from fastapi import FastAPI, Depends, Query
from typing import Annotated

app = FastAPI()

# 陷阱 1：Annotated 的顺序——类型在前，依赖在后
# 正确：Annotated[返回类型, Depends(...)]
def good_route(d: Annotated[dict, Depends(some_dep)]): ...

# 错误：顺序反了
# def bad_route(d: Annotated[Depends(some_dep), dict]): ...  # 不会正常工作

# 陷阱 2：Annotated 和默认值不能同时用
# 如果用了 Annotated，就不要再写 = Depends(...)
def good(p: Annotated[int, Query(ge=1)]): ...
# def bad(p: Annotated[int, Query(ge=1)] = Query(1)): ...  # 冗余，可能冲突

# 陷阱 3：Annotated 类型别名可以叠加
PageDep = Annotated[int, Query(1, ge=1)]
SizedPageDep = Annotated[PageDep, Query(20, ge=1, le=100)]  # 不推荐这样叠加
# 推荐分开定义，在路由里组合使用
\`\`\`

## 七、函数依赖 vs 类依赖：如何选择

| 维度 | 函数依赖 | 类依赖 |
|------|---------|--------|
| 适合场景 | 无状态、纯计算、鉴权 | 有状态、有方法、配置对象 |
| 复用性 | 函数复用 | 类 + Annotated 类型别名复用 |
| 可测试性 | dependency_overrides 覆盖 | 同样可覆盖 |
| 行为封装 | 只有返回值 | 属性 + 方法 |
| 语法简洁度 | Depends(fn) | Depends(Class) 或 Depends() |

**经验法则**：
- 如果依赖只是"返回一个值"（如查用户、读配置），用函数。
- 如果依赖是一个"有行为的数据对象"（如分页器、过滤器），用类。
- 如果依赖需要复用到很多路由，用 \`Annotated\` 定义类型别名。

## 八、本章小结

- **类作为依赖**：把类传给 \`Depends(MyClass)\`，FastAPI 自动解析 \`__init__\` 参数并实例化。适合封装"有行为的数据对象"。
- **\`Annotated[type, Depends(...)]\`**：现代依赖声明写法，类型提示更完整，官方推荐。
- **类型别名复用**：\`UserDep = Annotated[dict, Depends(get_user)]\`，一次定义处处复用，消除重复。
- **\`dependency_overrides\`**：测试时用 \`app.dependency_overrides[原依赖] = mock依赖\` 替换依赖，无需改业务代码。
- **高阶依赖**：用工厂函数返回依赖函数（如 \`require_role(*roles)\`），实现灵活的权限控制。
- **函数 vs 类**：纯计算用函数，有状态有方法用类，需要复用用 Annotated 类型别名。

至此，依赖注入的四个核心主题——基础、yield、嵌套、类与 Annotated——已经讲完。下一批章节我们将进入中间件与异常处理，学习如何在请求/响应层面做统一处理。
`
  }
];
