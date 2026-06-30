"""
============================================================
 依赖注入 —— FastAPI 的核心特性
------------------------------------------------------------

【什么是依赖注入】
    一个函数声明它需要什么（参数），由框架负责「注入」。
    FastAPI 用 Depends() 实现依赖注入。

【为什么用依赖注入】
    1. 复用：get_db、get_current_user 这种逻辑写一次，到处用
    2. 解耦：路由函数不用关心「db 从哪来」「当前用户怎么解析」
    3. 可测试：测试时可以替换依赖（mock 数据库、mock 用户）
    4. 自动文档：依赖里抛的异常会反映到 OpenAPI 文档

【典型用法】
    @app.get("/posts")
    def list_posts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
        ...
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User
from app.security import decode_access_token

# -------------------------------------------------------------
# 数据库会话依赖
# -------------------------------------------------------------
# 【为什么用 yield 而不是 return】
#   yield 让函数变成「生成器依赖」，可以做「请求前 + 请求后」逻辑：
#     1. yield 之前：创建 session（请求开始）
#     2. yield 出去：路由函数用这个 session
#     3. yield 之后：close session（请求结束，自动清理）
#   保证每个请求拿独立 session，且用完必关闭，不泄漏连接。
def get_db():
    """每个请求拿一个独立 DB session，请求结束自动关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------
# OAuth2 token 提取器
# -------------------------------------------------------------
# tokenUrl 指向「获取 token 的接口路径」，仅用于 OpenAPI 文档生成
# （Swagger UI 会显示「Authorize」按钮，点了让你输用户名密码登录）
# 实际请求时，前端要在 Authorization 头放 "Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/blog/auth/login")


# -------------------------------------------------------------
# 当前用户依赖（核心）
# -------------------------------------------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """从请求头解析 JWT，返回当前用户对象。

    失败抛 401（认证失败）。任何接口加上这个依赖，就强制要求登录。
    """
    # 1. 解码 JWT
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期",
            headers={"WWW-Authenticate": "Bearer"},  # 标准响应头，告诉客户端用 Bearer 认证
        )

    # 2. 从 payload 取 user_id（sub 字段）
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 缺少用户信息",
        )

    # 3. 查库确认用户存在（防止已删除用户的 token 还能用）
    user = db.get(User, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )

    # 4. 检查用户是否被禁用
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用",
        )

    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """要求当前用户是管理员，否则 403。"""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return user


def get_current_user_optional(
    token: str | None = Depends(OAuth2PasswordBearer(tokenUrl="/api/blog/auth/login", auto_error=False)),
    db: Session = Depends(get_db),
) -> User | None:
    """可选的当前用户依赖：登录了返回 user，没登录返回 None（不抛错）。

    用途：列表页对未登录用户也开放，但登录用户能看到更多内容。
    """
    if token is None:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        return None
    return user
