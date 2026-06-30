"""
============================================================
 Blog Platform —— FastAPI 应用入口
------------------------------------------------------------

【启动方式】
    cd blog-platform/backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

    或：python -m app.main

【启动后访问】
    http://127.0.0.1:8000/             健康检查
    http://127.0.0.1:8000/docs         Swagger UI（在线试调）
    http://127.0.0.1:8000/redoc        ReDoc 文档

【架构概览】
    app/
    ├── main.py          ← 本文件，FastAPI app 实例、路由注册、中间件
    ├── config.py        配置
    ├── database.py      引擎、Session、Base
    ├── models.py        ORM 模型
    ├── schemas.py       Pydantic schemas
    ├── security.py      密码哈希、JWT
    ├── deps.py          依赖注入
    └── routers/         各资源路由
        ├── auth.py
        ├── posts.py
        ├── comments.py
        └── tags.py
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine, SessionLocal
from app.routers import auth, posts, comments, tags

settings = get_settings()


# -------------------------------------------------------------
# 启动事件：建表
# -------------------------------------------------------------
# 【用 lifespan 替代 @app.on_event】
#   旧 API on_event("startup") 已弃用，推荐用 lifespan 上下文管理器。
#   yield 之前是启动逻辑，yield 之后是关闭逻辑。
#
# 【为什么用 create_all 而不是 Alembic】
#   create_all 适合 demo / 开发期，启动时自动建表（已存在则跳过）。
#   生产环境用 Alembic 做迁移，因为：
#     1. create_all 不会改已有表结构（加字段、改类型）
#     2. Alembic 能生成迁移脚本，版本可追溯
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时建表。"""
    # 启动时建表（已存在的表会被跳过）
    Base.metadata.create_all(bind=engine)
    print(f"✓ 数据库表已就绪：{settings.DATABASE_URL.split('@')[-1]}")
    yield
    # 关闭时无需特殊处理（连接池会自动回收）


# -------------------------------------------------------------
# 创建 FastAPI 实例
# -------------------------------------------------------------
app = FastAPI(
    title="Blog Platform API",
    description=(
        "一个教学用博客平台后端，覆盖：\n"
        "- JWT 认证（注册/登录/找回）\n"
        "- 用户 / 文章 / 评论 / 标签 CRUD\n"
        "- 评论自引用（回复树）\n"
        "- 文章-标签 多对多\n"
        "- 分页、过滤、权限校验\n"
        "- MySQL 持久化（SQLAlchemy 2.0 ORM）\n\n"
        "前端联调：所有路径在 /api/blog 前缀下，Next.js rewrites 代理到本服务。"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# -------------------------------------------------------------
# CORS 中间件
# -------------------------------------------------------------
# 浏览器同源策略会拦截跨域请求。前端 3000 → 后端 8000 是跨域。
# CORSMiddleware 在响应头加上 Access-Control-Allow-Origin 让前端能拿到数据。
# 注意：用了 Next.js rewrites 代理后，前端实际是同源，CORS 是双保险。
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)


# -------------------------------------------------------------
# 注册路由
# -------------------------------------------------------------
# prefix="/api/blog"：所有接口都在这个前缀下
#   - 前端通过 Next.js rewrites 代理 /api/blog/* → http://127.0.0.1:8000/api/blog/*
#   - 也可以直接访问 http://127.0.0.1:8000/api/blog/docs 看 Swagger
app.include_router(auth.router, prefix="/api/blog")
app.include_router(posts.router, prefix="/api/blog")
app.include_router(comments.router, prefix="/api/blog")
app.include_router(tags.router, prefix="/api/blog")


# -------------------------------------------------------------
# 健康检查
# -------------------------------------------------------------
@app.get("/", tags=["默认"], summary="健康检查")
def health_check():
    """服务健康检查。前端可定期调用判断后端是否在线。"""
    return {
        "status": "ok",
        "service": "blog-platform",
        "version": "1.0.0",
        "docs": "/docs",
        "api_prefix": "/api/blog",
    }


@app.get("/api/blog", tags=["默认"], summary="API 概览")
def api_root():
    """API 根路径，列出主要资源。"""
    return {
        "service": "blog-platform",
        "endpoints": {
            "auth": "/api/blog/auth",
            "posts": "/api/blog/posts",
            "comments": "/api/blog/comments",
            "tags": "/api/blog/tags",
            "docs": "/docs",
        },
    }


# -------------------------------------------------------------
# 直接运行入口
# -------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,  # 改代码自动重启，开发必备
    )
