"""
============================================================
 种子数据脚本 —— 初始化演示用数据
------------------------------------------------------------

【用途】
    跑一遍这个脚本，往数据库里塞入：
    - 1 个管理员用户（admin/admin123）
    - 2 个普通用户
    - 5 个标签
    - 6 篇文章（含草稿、含标签关联）
    - 若干评论（含回复）

【使用】
    cd blog-platform/backend
    python -m scripts.seed

    或：
    python scripts/seed.py

【注意】
    - 脚本会清空现有数据（TRUNCATE）再插入，仅开发用
    - 已存在的邮箱/用户名会跳过
"""
import sys
import os
from pathlib import Path

# 让脚本能从 backend/ 目录直接运行
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, engine, SessionLocal  # noqa: E402
from app.models import User, Post, Comment, Tag  # noqa: E402
from app.security import hash_password  # noqa: E402


def reset_database():
    """删表重建。仅开发用！"""
    print("⚠️  删除所有表并重建...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✓ 表已重建")


def seed():
    """插入演示数据。"""
    db = SessionLocal()
    try:
        # ---------- 用户 ----------
        print("插入用户...")
        admin = User(
            username="admin",
            email="admin@blog.dev",
            password_hash=hash_password("admin123"),
            is_admin=True,
            bio="我是管理员，负责管理这个博客平台。",
        )
        alice = User(
            username="alice",
            email="alice@blog.dev",
            password_hash=hash_password("alice123"),
            bio="前端工程师，喜欢写 React 和 Vue。",
        )
        bob = User(
            username="bob",
            email="bob@blog.dev",
            password_hash=hash_password("bob123"),
            bio="后端工程师，写 Go 和 Python。",
        )
        db.add_all([admin, alice, bob])
        db.commit()
        # 刷新拿到自增 id
        db.refresh(admin)
        db.refresh(alice)
        db.refresh(bob)
        print(f"  ✓ 3 个用户：admin / alice / bob")

        # ---------- 标签 ----------
        print("插入标签...")
        tags_data = [
            Tag(name="前端", description="前端相关：HTML/CSS/JS/框架"),
            Tag(name="后端", description="后端相关：API/数据库/服务端"),
            Tag(name="DevOps", description="运维、CI/CD、容器"),
            Tag(name="数据库", description="MySQL/PostgreSQL/Redis 等"),
            Tag(name="随笔", description="技术之外的思考"),
        ]
        db.add_all(tags_data)
        db.commit()
        for t in tags_data:
            db.refresh(t)
        print(f"  ✓ {len(tags_data)} 个标签")

        # 方便后面取
        tag_by_name = {t.name: t for t in tags_data}

        # ---------- 文章 ----------
        print("插入文章...")
        posts_data = [
            {
                "title": "React 19 新特性速览",
                "summary": "Actions、use()、Server Components 等核心新特性介绍。",
                "content": (
                    "# React 19 新特性\n\n"
                    "## 1. Actions\n"
                    "Actions 简化了表单和异步操作的处理...\n\n"
                    "## 2. use() Hook\n"
                    "use() 可以在组件中读取 Promise 或 Context...\n\n"
                    "## 3. Server Components\n"
                    "服务端组件默认开启，让首屏更快...\n"
                ),
                "author": alice,
                "is_published": True,
                "tags": [tag_by_name["前端"]],
            },
            {
                "title": "FastAPI 入门：用 Python 写高性能 API",
                "summary": "FastAPI 凭借类型注解和异步支持，成为 Python 最快的 Web 框架之一。",
                "content": (
                    "# FastAPI 入门\n\n"
                    "## 安装\n```bash\npip install fastapi uvicorn\n```\n\n"
                    "## 第一个接口\n"
                    "```python\nfrom fastapi import FastAPI\n"
                    "app = FastAPI()\n\n"
                    "@app.get('/')\n"
                    "def root():\n    return {'hello': 'world'}\n```\n\n"
                    "## 自动文档\n"
                    "启动后访问 /docs 即可看到 Swagger UI...\n"
                ),
                "author": bob,
                "is_published": True,
                "tags": [tag_by_name["后端"], tag_by_name["数据库"]],
            },
            {
                "title": "Docker 容器化部署实战",
                "summary": "从 Dockerfile 到 docker-compose，一步步把应用容器化。",
                "content": (
                    "# Docker 容器化部署\n\n"
                    "## Dockerfile\n"
                    "```dockerfile\nFROM python:3.11-slim\n"
                    "WORKDIR /app\nCOPY . .\n"
                    "RUN pip install -r requirements.txt\n"
                    "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n```\n\n"
                    "## docker-compose\n"
                    "多服务编排...\n"
                ),
                "author": bob,
                "is_published": True,
                "tags": [tag_by_name["DevOps"]],
            },
            {
                "title": "MySQL 索引优化指南",
                "summary": "B+ 树索引原理、覆盖索引、最左前缀原则等。",
                "content": (
                    "# MySQL 索引优化\n\n"
                    "## B+ 树\n"
                    "InnoDB 的索引基于 B+ 树实现...\n\n"
                    "## 覆盖索引\n"
                    "如果查询的列都在索引里，就不用回表...\n\n"
                    "## EXPLAIN\n"
                    "用 EXPLAIN 看执行计划，判断是否走索引...\n"
                ),
                "author": bob,
                "is_published": True,
                "tags": [tag_by_name["数据库"], tag_by_name["后端"]],
            },
            {
                "title": "我的 2026 年技术清单",
                "summary": "新一年想学的技术、想做的项目、想读的书。",
                "content": (
                    "# 2026 技术清单\n\n"
                    "## 想学的\n"
                    "- Rust（系统编程）\n"
                    "- LLM 应用开发\n"
                    "- WebAssembly\n\n"
                    "## 想做的\n"
                    "- 一个开源博客平台\n"
                    "- 一个 LLM 工具\n\n"
                    "## 想读的\n"
                    "- 《Designing Data-Intensive Applications》\n"
                ),
                "author": alice,
                "is_published": True,
                "tags": [tag_by_name["随笔"]],
            },
            {
                "title": "（草稿）Vue 3 Composition API 深入",
                "summary": "未完成的草稿。",
                "content": "## Vue 3 Composition API\n\n待补充...",
                "author": alice,
                "is_published": False,
                "tags": [tag_by_name["前端"]],
            },
        ]

        for p_data in posts_data:
            tags = p_data.pop("tags")
            author = p_data.pop("author")
            post = Post(**p_data, author_id=author.id, tags=tags)
            db.add(post)
        db.commit()
        print(f"  ✓ {len(posts_data)} 篇文章（含 1 篇草稿）")

        # 重新查询所有文章（拿到 id）
        all_posts = db.query(Post).all()
        post1 = next(p for p in all_posts if "React 19" in p.title)
        post2 = next(p for p in all_posts if "FastAPI" in p.title)

        # ---------- 评论 ----------
        print("插入评论...")
        comments_data = [
            # post1 的评论
            Comment(content="写得很好，Action 那部分讲得很清楚！", author_id=bob.id, post_id=post1.id),
            Comment(content="同问，跟 React Query 比有什么优势？", author_id=admin.id, post_id=post1.id),
            # post2 的评论 + 回复
            Comment(content="FastAPI 真的好用，自动文档省了好多事。", author_id=alice.id, post_id=post2.id),
        ]
        db.add_all(comments_data)
        db.commit()
        for c in comments_data:
            db.refresh(c)

        # 加一条回复（评论 3 回复评论 1）
        reply = Comment(
            content="谢谢支持！下篇会写 React 19 的实战案例。",
            author_id=alice.id,
            post_id=post1.id,
            parent_id=comments_data[0].id,
        )
        db.add(reply)
        db.commit()
        print(f"  ✓ {len(comments_data) + 1} 条评论（含 1 条回复）")

        # ---------- 完成 ----------
        print("\n✅ 种子数据已就绪")
        print("\n可用账号：")
        print("  管理员：admin / admin123")
        print("  用户1：alice / alice123")
        print("  用户2：bob / bob123")
        print("\nAPI 文档：http://127.0.0.1:8000/docs")

    finally:
        db.close()


if __name__ == "__main__":
    # 询问确认
    if "--yes" not in sys.argv:
        ans = input("⚠️  此操作会清空数据库所有表并重建，继续？(y/N): ").strip().lower()
        if ans != "y":
            print("已取消")
            sys.exit(0)

    reset_database()
    seed()
