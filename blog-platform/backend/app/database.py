"""
============================================================
 数据库连接模块 —— SQLAlchemy 引擎与会话工厂
------------------------------------------------------------

【核心概念：ORM 是什么】
    ORM（Object Relational Mapping，对象关系映射）让数据库里的表
    对应到 Python 里的类，行对应到对象。我们写 Python 代码操作对象，
    ORM 自动翻译成 SQL 执行。好处：
    1. 不用拼 SQL 字符串，少出错
    2. 自动参数化，防 SQL 注入
    3. 切换数据库（MySQL → PostgreSQL）改动小

【SQLAlchemy 2.0 的两个核心对象】
    1. engine：连接池 + DBAPI 的封装，所有 SQL 最终通过它执行
    2. Session：工作单元，一次会话里的所有操作共享一个事务
       - 增删改查都通过 session
       - commit() 提交事务，rollback() 回滚
       - 用完必须 close()，否则连接泄漏

【为什么用 sessionmaker】
    直接用 Session(bind=engine) 也能跑，但每次都手写 bind 不优雅。
    sessionmaker 是个工厂，预先绑好 engine，之后每次调用产出
    一个配置相同的 Session。把它做成函数级依赖注入（get_db），
    每个请求拿一个独立 session，请求结束自动关闭。
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import get_settings

# 读配置
settings = get_settings()

# -------------------------------------------------------------
# 创建 engine
# -------------------------------------------------------------
# 【参数说明】
#   echo=False：不打印执行的 SQL（调试时可以改成 True，看每条 SQL）
#   pool_pre_ping=True：每次取连接前发 ping，避免拿到失效连接
#     （MySQL 默认 8 小时空闲会断开，没这个会偶发 "MySQL server has gone away"）
#   pool_recycle=3600：连接每 3600 秒回收一次，比 MySQL 的 wait_timeout 短
#   pool_size=10：连接池大小（默认 5）
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

# -------------------------------------------------------------
# Session 工厂
# -------------------------------------------------------------
# autocommit=False：不开自动提交，必须显式 commit（推荐做法）
# autoflush=False：不开自动 flush，避免意外触发 SQL
#   （flush：把内存里 pending 的对象同步到数据库，但还没 commit）
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# -------------------------------------------------------------
# ORM 模型基类
# -------------------------------------------------------------
# 所有模型都继承 Base，Base.metadata 收集所有表的定义。
# Base.metadata.create_all(engine) 会自动建表（仅开发用，生产用 Alembic 迁移）。
# SQLAlchemy 2.0 推荐用 declarative_base()（从 sqlalchemy.orm 导入）。
Base = declarative_base()
