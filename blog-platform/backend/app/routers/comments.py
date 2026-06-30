"""
============================================================
 评论路由 —— CRUD + 自引用回复
------------------------------------------------------------

【接口列表】
    GET    /comments/post/{post_id}   获取某文章的评论树
    POST   /comments                  创建评论（需登录）
    PUT    /comments/{id}             更新评论（需登录 + 作者本人/管理员）
    DELETE /comments/{id}             删除评论（需登录 + 作者本人/管理员）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models import Comment, Post, User
from app.schemas import CommentCreate, CommentOut, MessageOut

router = APIRouter(prefix="/comments", tags=["评论"])


@router.get("/post/{post_id}", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    """获取某文章的评论树（顶级评论 + 递归回复）。

    SQLAlchemy 的关系配置里已经写了 selectinload，
    所以查顶级评论时会自动带出 replies，递归回复也带出来。
    """
    # 确认文章存在
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 只查顶级评论（parent_id IS NULL），replies 会自动带
    comments = db.scalars(
        select(Comment)
        .options(selectinload(Comment.author), selectinload(Comment.replies))
        .where(Comment.post_id == post_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at)
    ).all()
    return comments


@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    payload: CommentCreate,
    post_id: int = None,  # 通过 query string 或 body 传，下面校验
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建评论。

    前端调用方式：
        POST /comments?post_id=5
        body: {"content": "评论内容", "parent_id": null}

    或者 body 里带 post_id（这里我用 query string 方式更直观）
    """
    # 由于 post_id 是必填，但 FastAPI 默认会要求 query string
    # 这里改成从 body 取，更符合 REST 习惯
    # 实际上更优雅的做法是再封装一层 schema 含 post_id
    # 为简化教学，这里要求前端 URL 上带 post_id
    if post_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="缺少 post_id 参数",
        )

    # 校验文章存在
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 校验 parent_id（如果传了）
    if payload.parent_id is not None:
        parent = db.get(Comment, payload.parent_id)
        if parent is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="父评论不存在",
            )
        # 防止回复跨文章的评论
        if parent.post_id != post_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能回复其他文章的评论",
            )

    comment = Comment(
        content=payload.content,
        author_id=current_user.id,
        post_id=post_id,
        parent_id=payload.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.put("/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    content: str,  # 简化：直接 query string 传内容，或 body
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新评论内容。作者本人或管理员可改。"""
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="评论不存在")

    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权修改他人评论")

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="内容不能为空")

    comment.content = content.strip()
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}", response_model=MessageOut)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除评论。

    cascade 配置会让其所有回复也被删除。
    """
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="评论不存在")

    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权删除他人评论")

    db.delete(comment)
    db.commit()
    return MessageOut(message="已删除")
