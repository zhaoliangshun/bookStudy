"""
============================================================
 认证路由 —— 注册 / 登录 / 获取当前用户
------------------------------------------------------------

【接口列表】
    POST /auth/register    注册新用户
    POST /auth/login       登录，返回 JWT
    GET  /auth/me          获取当前登录用户信息
    PUT  /auth/me          更新当前用户资料
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models import User
from app.schemas import UserCreate, UserLogin, UserOut, TokenOut, UserUpdate, MessageOut
from app.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """注册新用户。

    流程：
        1. 校验用户名 / 邮箱是否已被注册
        2. 哈希密码
        3. 写入数据库
        4. 返回用户信息（不含密码哈希）
    """
    # 检查用户名是否已存在
    exists_username = db.scalar(
        select(User).where(User.username == payload.username)
    )
    if exists_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已被占用",
        )

    # 检查邮箱是否已存在
    exists_email = db.scalar(
        select(User).where(User.email == payload.email)
    )
    if exists_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="邮箱已被注册",
        )

    # 创建用户
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新拿到数据库生成的 id、created_at
    return user


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """登录。

    流程：
        1. 按用户名或邮箱查用户
        2. 校验密码
        3. 生成 JWT
        4. 返回 token + 用户信息

    注意：出于安全，用户名错和密码错的提示是一样的，
    避免攻击者根据不同提示判断用户名是否存在。
    """
    # 用户名或邮箱都能登录：先用 username 查，再 fallback 用 email 查
    user = db.scalar(
        select(User).where(
            (User.username == payload.username) | (User.email == payload.username)
        )
    )

    # 用户不存在或密码不对，统一报「用户名或密码错误」
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用",
        )

    # 生成 token，把 user_id 和 is_admin 放进 payload
    token = create_access_token(
        subject=user.id,
        extra_data={"username": user.username, "is_admin": user.is_admin},
    )
    return TokenOut(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息。需要带 Authorization: Bearer <token>。"""
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新当前用户资料（头像、简介）。"""
    # 用 exclude_unset=True 只取客户端传了的字段
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password", response_model=MessageOut)
def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """修改密码。前端应作为 JSON body 传 {old_password, new_password}。"""
    # 校验旧密码
    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="旧密码错误",
        )
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="新密码至少 6 位",
        )
    # 更新密码哈希
    current_user.password_hash = hash_password(new_password)
    db.commit()
    return MessageOut(message="密码修改成功")
