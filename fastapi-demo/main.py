"""
============================================================
 FastAPI 入门 demo —— 一个最小的「待办事项」API
-------------------------------------------------------------

【这个 demo 在做什么】
    用 FastAPI 实现一个待办事项（Todo）的增删改查接口。
    数据存在内存里（用 Python 列表模拟数据库），重点演示
    FastAPI 的核心能力：路由、参数校验、Pydantic、自动文档。

【功能演示】
   1. Hello World 路由            GET  /
   2. 路径参数 + 类型校验          GET  /items/{item_id}
   3. 查询参数 + 分页              GET  /items?skip=0&limit=10
   4. Pydantic 请求体校验         POST /items
   5. 内存 CRUD（增删改查）        PUT  / DELETE
   6. 自动文档：启动后访问 /docs

【如何使用】
   1) 安装依赖（推荐先创建并激活虚拟环境）：
        pip install -r requirements.txt
   2) 启动服务（开发模式，带热重载）：
        uvicorn main:app --reload
      或直接：
        python main.py
   3) 打开浏览器：
        - 接口首页:     http://127.0.0.1:8000/
        - Swagger 文档: http://127.0.0.1:8000/docs   （可在线试调）
        - ReDoc 文档:    http://127.0.0.1:8000/redoc

【关键概念速览】
   - ASGI：异步服务器网关接口，FastAPI 跑在 ASGI 服务器（Uvicorn）上
   - 路由装饰器：@app.get / @app.post ... 告诉框架哪个 URL 由哪个函数处理
   - Pydantic：用类型注解自动校验请求体，校验不通过自动返回 422
   - response_model：声明响应结构，框架会按模型过滤字段（白名单）
   - 自动文档：根据路由和模型，自动生成 Swagger UI / ReDoc
============================================================
"""

# -------------------------------------------------------------
# 导入部分：解释每个导入的作用
# -------------------------------------------------------------

# Optional 来自标准库 typing，表示「可选类型」，例如 Optional[str] 等价于 str | None
# Python 3.10+ 也可以直接写 str | None，这里为了兼容性用 Optional
from typing import Optional

# FastAPI：框架核心类，用来创建 app 实例
# HTTPException：用来主动抛出 HTTP 错误（如 404、403），框架会捕获并转成响应
# Query：用来给查询参数加约束（最小值、最大值、描述等）
# status：HTTP 状态码常量模块，用 status.HTTP_201_CREATED 比直接写 201 更清晰
from fastapi import FastAPI, HTTPException, Query, status

# CORSMiddleware：跨域中间件，前端（不同源的页面）调用本接口时需要它
#   否则浏览器会拦截响应（同源策略），前端拿不到数据
from fastapi.middleware.cors import CORSMiddleware

# BaseModel：Pydantic 的基类，继承它就能定义一个会自动校验的数据模型
# Field：给模型字段加约束和元信息（必填、长度、描述、示例等）
from pydantic import BaseModel, Field


# =============================================================
# 一、创建 FastAPI 应用实例
# =============================================================
# FastAPI() 会创建一个 ASGI 应用对象，所有路由都挂在这个对象上。
# 传给它的元信息（title/description/version）会显示在自动文档页面顶部，
# 让前端/调用方一眼知道这个 API 是做什么的。
#
# 这个 app 对象非常关键：
#   - 启动命令 uvicorn main:app 里的 "app" 就是指它
#   - 所有 @app.get / @app.post 装饰器都是给它注册路由
app = FastAPI(
    title="待办事项 API（入门 demo）",
    description="一个用 FastAPI 写的最小待办事项接口，演示路由、参数校验、Pydantic、CRUD。",
    version="0.1.0",
)


# =============================================================
# 一点五、CORS 跨域配置（前端联调必需）
# =============================================================
# 【为什么需要 CORS】
#   浏览器有「同源策略」：协议 + 域名 + 端口任一不同，都算跨域。
#   本 demo 后端跑在 127.0.0.1:8000，Next.js 前端跑在 127.0.0.1:3000，
#   端口不同 → 跨域 → 默认浏览器会拦截响应。
#   CORSMiddleware 会在响应头加上 Access-Control-Allow-Origin，
#   让前端能正常拿到数据。
#
# 【allow_origins】
#   允许哪些来源访问。开发环境用具体地址；生产环境应改成你的真实域名。
#   ["*"] 表示允许所有来源（仅开发用，生产别这么写）。
#
# 【allow_methods】
#   允许哪些 HTTP 方法。本 demo 用到 GET/POST/PUT/DELETE，全列出来。
#
# 【allow_headers】
#   允许哪些请求头。["*"] 表示所有，简单场景够用。
#
# 【allow_credentials】
#   是否允许带 Cookie / Authorization 头。配合 allow_origins=["*"] 时不能开。
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js 开发服务器
        "http://127.0.0.1:3000",   # Next.js 开发服务器（IP 访问）
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)


# =============================================================
# 二、Pydantic 数据模型
# =============================================================
# 【为什么需要模型层】
#   HTTP 请求传过来的是 JSON 字符串，后端需要：
#     1. 把 JSON 解析成 Python 对象
#     2. 校验字段类型对不对、长度够不够、必填有没有传
#     3. 把响应数据序列化回 JSON
#   Pydantic 的 BaseModel 帮你把这三件事一次性搞定。
#
# 【类型注解驱动】
#   你只要写 `title: str`，Pydantic 就知道：
#     - 客户端必须传 title
#     - 必须是字符串
#     - 不是就自动返回 422 错误，并指出哪里错了
#
# 【Field 的作用】
#   Field(...) 给字段加约束和文档元信息：
#     - 第一个参数是默认值：... 表示「必填」（无默认值），None 表示「默认 None」
#     - min_length / max_length：字符串长度约束
#     - ge / gt / le / lt：数值约束（≥、>、≤、<）
#     - description：字段描述，会出现在自动文档里
#     - examples：示例值，文档里会展示
#
# 【为什么定义三个模型】
#   ItemCreate：创建时的入参（没有 id，因为 id 由服务端生成）
#   ItemUpdate：更新时的入参（字段都可选，支持「部分更新」）
#   ItemOut   ：对外响应（含服务端生成的 id）
#   拆开定义的好处：入参和出参可以有不同的字段，避免泄露内部字段。


class ItemCreate(BaseModel):
    """创建待办事项的请求体（客户端 POST 时传的 JSON 结构）"""

    # title：必填，字符串，长度 1-100
    # ... 是 Python 的 Ellipsis 对象，Pydantic 用它表示「必填」
    title: str = Field(
        ...,  # 必填（没有默认值）
        min_length=1,  # 最短 1 个字符
        max_length=100,  # 最长 100 个字符
        description="事项标题，1-100 字符",  # 会显示在 /docs 文档里
        examples=["学习 FastAPI"],  # 文档里的示例值
    )
    # done：可选，布尔值，默认 False（未完成）
    # 有默认值 → 客户端可以不传，不传就用默认值
    done: bool = Field(default=False, description="是否完成，默认未完成")


class ItemUpdate(BaseModel):
    """
    更新待办事项的请求体。

    【为什么字段都用 Optional】
        PUT / PATCH 更新时，客户端可能只想改某一个字段（比如只改 done）。
        如果把字段定义成必填，客户端就得把所有字段都传一遍，很不方便。
        用 Optional + 默认值 None，客户端只传想改的字段即可。
        路由里配合 model_dump(exclude_unset=True) 只取「客户端显式传了的字段」。
    """

    title: Optional[str] = Field(None, min_length=1, max_length=100)  # 默认 None → 可选
    done: Optional[bool] = None  # 默认 None → 可选


class ItemOut(BaseModel):
    """
    对外响应模型（返回给客户端的 JSON 结构）。

    【为什么要单独定义响应模型】
        内部数据可能含敏感字段（如 password_hash、internal_notes），
        直接 return 字典会全部泄露。
        用 response_model=ItemOut 声明响应结构后，FastAPI 会：
          1. 按 ItemOut 的字段过滤，多余字段不返回（白名单机制）
          2. 自动序列化成 JSON
          3. 在 /docs 里生成响应示例
    """

    id: int  # 服务端生成的自增 id
    title: str
    done: bool = False


# =============================================================
# 三、内存「数据库」
# =============================================================
# 【为什么用内存存】
#   demo 为了聚焦 FastAPI 本身，不引入数据库依赖。
#   用 Python 列表 + 字典模拟一张数据库表。
#
# 【局限】
#   1. 进程重启数据就没了
#   2. 多进程/多实例之间数据不共享
#   真实项目请替换为数据库（推荐 SQLAlchemy 2.0 + SQLite/PostgreSQL）。
ITEMS: list[dict] = []

# 自增主键：每创建一条记录就 +1，模拟数据库的 AUTO_INCREMENT
_next_id: int = 1


# =============================================================
# 四、路由（核心部分）
# =============================================================
# 【路由是什么】
#   路由 = HTTP 方法 + URL 路径 + 处理函数。
#   当请求进来，FastAPI 根据「方法 + 路径」找到对应的函数执行。
#
# 【装饰器对照表】
#   @app.get(...)     → GET    查询资源
#   @app.post(...)    → POST   创建资源
#   @app.put(...)     → PUT    全量更新资源
#   @app.patch(...)   → PATCH  部分更新资源
#   @app.delete(...)  → DELETE 删除资源
#
# 【装饰器常用参数】
#   response_model：声明响应结构（白名单过滤）
#   status_code   ：成功时返回的 HTTP 状态码
#   tags          ：在 /docs 里给接口分组
#   summary       ：接口的简短标题
#   description   ：详细描述（也支持写在函数 docstring 里）


# -------------------------------------------------------------
# 接口 1：健康检查（Hello World）
# -------------------------------------------------------------
# 最简单的路由：GET /，返回一个字典，FastAPI 自动转成 JSON。
# tags=["默认"] 让这个接口在 /docs 里归到「默认」分组。
# summary 是接口标题，docstring 会作为详细描述显示在文档里。
@app.get("/", tags=["默认"], summary="健康检查")
async def root():
    """根路径，返回服务状态，用来确认服务是否在运行。"""
    # 返回字典 → FastAPI 自动序列化成 JSON 响应
    # 并自动设置 Content-Type: application/json
    return {
        "status": "ok",
        "service": "fastapi-demo",
        "docs": "/docs",
    }


# -------------------------------------------------------------
# 接口 2：获取事项列表（查询参数 + 分页）
# -------------------------------------------------------------
# 【查询参数 vs 路径参数】
#   路径参数：在 URL 路径里，如 /items/{item_id}
#   查询参数：在 URL ? 后面，如 /items?skip=0&limit=10
#
# 【FastAPI 怎么区分】
#   函数参数里：出现在路径里的（如 {item_id}）是路径参数；
#   其余的（如 skip/limit）自动被当作查询参数。
#
# 【Query 的作用】
#   Query(0, ge=0, ...) 中：
#     0       → 默认值（不传时用 0）
#     ge=0    → 大于等于 0（greater than or equal），传 -1 会返回 422
#     le=100  → 小于等于 100（less than or equal）
#     description → 文档描述
#
# 【response_model=list[ItemOut]】
#   表示返回的是「ItemOut 组成的列表」，FastAPI 会逐个按 ItemOut 过滤。
@app.get("/items", response_model=list[ItemOut], tags=["事项"], summary="获取事项列表")
async def list_items(
    skip: int = Query(0, ge=0, description="跳过多少条，不能为负"),
    limit: int = Query(10, ge=1, le=100, description="每页条数，1-100"),
    done: Optional[bool] = Query(None, description="按完成状态过滤"),
):
    """
    分页查询待办事项。

    访问示例：
      - 不传参数：        /items            → 返回前 10 条
      - ?skip=5&limit=5： /items?skip=5&limit=5 → 跳过 5 条后取 5 条
      - ?done=false：    /items?done=false → 只返回未完成的事项
    """
    result = ITEMS
    # done 是可选过滤条件：传了才过滤，没传就返回全部
    if done is not None:
        result = [it for it in result if it["done"] == done]
    # 切片实现分页：[skip : skip+limit]
    return result[skip : skip + limit]


# -------------------------------------------------------------
# 接口 3：获取单个事项（路径参数 + 自动类型校验 + 404）
# -------------------------------------------------------------
# 【路径参数】
#   URL 里的 {item_id} 是路径参数占位符，
#   函数签名的 item_id: int 会自动接收它。
#
# 【类型注解的魔法】
#   item_id: int 告诉 FastAPI：
#     1. 自动把 URL 里的字符串 "1" 转成整数 1
#     2. 如果传的不是整数（如 /items/abc）→ 自动返回 422
#     3. 在 /docs 里标注 item_id 是 integer 类型
#
# 【HTTPException】
#   找不到资源要返回 404，但 return 只能返回成功响应。
#   raise HTTPException(status_code=404, detail="...") 会被
#   FastAPI 捕获并转成 {"detail": "..."} 的 404 响应。
@app.get(
    "/items/{item_id}",
    response_model=ItemOut,
    tags=["事项"],
    summary="获取单个事项",
)
async def get_item(item_id: int):
    """
    按 id 获取单个事项。

    自动校验：
      - /items/abc  → 422（item_id 不是有效整数）
      - /items/999  → 404（事项不存在）
    """
    for item in ITEMS:
        if item["id"] == item_id:
            return item
    # 遍历完都没找到 → 抛 404 异常
    # detail 会作为响应体的 detail 字段返回给客户端
    raise HTTPException(status_code=404, detail=f"事项 {item_id} 不存在")


# -------------------------------------------------------------
# 接口 4：创建事项（Pydantic 请求体校验）
# -------------------------------------------------------------
# 【请求体参数】
#   函数签名 item: ItemCreate 告诉 FastAPI：
#   「把请求体 JSON 解析成 ItemCreate 模型」。
#   客户端发的 JSON 字段不对、类型不对、长度不够 → 自动 422。
#
# 【status_code=status.HTTP_201_CREATED】
#   POST 创建资源成功，惯例返回 201（而非默认的 200）。
#   用 status 模块的常量比直接写数字 201 更清晰、更不容易写错。
#
# 【为什么用 async def】
#   FastAPI 路由可以是 async def（异步）或 def（同步）：
#     - async def：跑在事件循环里，适合 I/O 密集型（查数据库、调外部 API）
#     - def：自动放到线程池，适合调同步阻塞库
#   本 demo 里都是内存操作，async def 和 def 都行，这里统一用 async def。
@app.post(
    "/items",
    response_model=ItemOut,
    status_code=status.HTTP_201_CREATED,
    tags=["事项"],
    summary="创建事项",
)
async def create_item(item: ItemCreate):
    """
    创建一个新的待办事项。

    请求体示例：
        {"title": "学习 FastAPI", "done": false}

    FastAPI 会自动用 ItemCreate 模型校验：
        - title 必填，1-100 字符
        - done 可选，必须是布尔值
    校验不通过会返回 422，不会进到这个函数里。
    """
    # 声明用全局变量 _next_id（Python 函数里修改全局变量需要 global）
    global _next_id

    # item.model_dump()：把 Pydantic 模型转成字典
    #   ItemCreate(title="学习 FastAPI", done=False).model_dump()
    #   → {"title": "学习 FastAPI", "done": False}
    # {**{"id": _next_id}, **item.model_dump()}：合并字典，加上服务端生成的 id
    new_item = {"id": _next_id, **item.model_dump()}

    # 存进「数据库」（内存列表）
    ITEMS.append(new_item)
    # 主键自增，为下一条记录准备
    _next_id += 1

    # 返回新记录。response_model=ItemOut 会自动过滤、序列化成 JSON
    return new_item


# -------------------------------------------------------------
# 接口 5：更新事项（部分更新）
# -------------------------------------------------------------
# 【为什么用 ItemUpdate】
#   更新时客户端可能只传想改的字段，比如只想改 done：
#       {"done": true}
#   ItemUpdate 的字段都是 Optional + 默认 None，正好支持这种用法。
#
# 【model_dump(exclude_unset=True) 的关键作用】
#   默认 model_dump() 会返回所有字段（包括用默认值填充的）。
#   exclude_unset=True 只返回「客户端显式传了的字段」。
#   这样客户端没传的字段就不会被覆盖成 None，实现真正的「部分更新」。
#
# 举例：
#   客户端 PUT {"done": true}
#   item.model_dump()                    → {"title": None, "done": true}
#   item.model_dump(exclude_unset=True)  → {"done": true}    ← 只取这个
#   合并后：{...原数据..., "done": true}    ← title 保持不变
@app.put(
    "/items/{item_id}",
    response_model=ItemOut,
    tags=["事项"],
    summary="更新事项",
)
async def update_item(item_id: int, item: ItemUpdate):
    """更新指定 id 的事项，只更新客户端传了的字段。"""
    # enumerate 同时拿到下标和元素，方便后续用下标更新列表
    for i, existing in enumerate(ITEMS):
        if existing["id"] == item_id:
            # exclude_unset=True：只取客户端显式传了的字段
            # {**existing, **传入的字段}：用传入的字段覆盖原有字段
            updated = {**existing, **item.model_dump(exclude_unset=True)}
            ITEMS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail=f"事项 {item_id} 不存在")


# -------------------------------------------------------------
# 接口 6：删除事项（204 无响应体）
# -------------------------------------------------------------
# 【为什么用 204 状态码】
#   删除成功通常不需要返回任何内容（客户端只关心成不成功）。
#   204 No Content 表示「成功，但没有响应体」。
#   函数里 return（返回 None）即可，FastAPI 不会序列化任何内容。
@app.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["事项"],
    summary="删除事项",
)
async def delete_item(item_id: int):
    """删除指定 id 的事项。删除成功返回 204（无响应体）。"""
    for i, existing in enumerate(ITEMS):
        if existing["id"] == item_id:
            # pop(i) 按下标删除列表元素
            ITEMS.pop(i)
            # 注意：这里 response_model 没设，且状态码是 204
            # 函数不 return 任何值 → 响应体为空
            return
    raise HTTPException(status_code=404, detail=f"事项 {item_id} 不存在")


# =============================================================
# 五、入口：让 main.py 可以直接 python main.py 运行
# =============================================================
# 【__name__ == "__main__" 的含义】
#   每个 Python 文件都有一个内置变量 __name__：
#     - 直接运行（python main.py）时，__name__ 等于 "__main__"
#     - 被导入（import main）时，__name__ 等于 "main"
#   这个 if 判断让「直接运行时才启动服务器」，被导入时不启动。
#
# 【两种启动方式的区别】
#   方式 A：uvicorn main:app --reload      （命令行启动，更常用）
#     - "main:app" 表示「从 main.py 文件里找名为 app 的对象」
#     - --reload 开启热重载：改代码自动重启，开发必备
#
#   方式 B：python main.py                  （本文件直接启动）
#     - 走这里的 uvicorn.run(...)，效果等价于上面的命令行
#     - 适合在 IDE 里点「运行」按钮调试
if __name__ == "__main__":
    import uvicorn

    # 等价于命令行：uvicorn main:app --reload --host 127.0.0.1 --port 8000
    # 参数说明：
    #   "main:app"：从 main.py 找 app 对象
    #   host：监听地址，127.0.0.1 只本机可访问；0.0.0.0 局域网可访问
    #   port：监听端口，默认 8000
    #   reload=True：热重载，改代码自动重启（仅开发用，生产别开）
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
