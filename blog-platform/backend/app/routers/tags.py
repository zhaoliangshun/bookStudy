"""
============================================================
 标签路由 —— CRUD
------------------------------------------------------------

【接口列表】
    GET    /tags         标签列表
    POST   /tags         创建标签（需登录）
    PUT    /tags/{id}    更新标签（需管理员）
    DELETE /tags/{id}    删除标签（需管理员）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.deps import get_db, get_current_user, get_current_admin
from app.models import Tag, Post, User
from app.schemas import TagCreate, TagOut, MessageOut

router = APIRouter(prefix="/tags", tags=["标签"])


@router.get("", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    """获取所有标签。"""
    tags = db.scalars(select(Tag).order_by(Tag.name)).all()
    return tags


@router.get("/{tag_id}/posts/count")
def get_tag_post_count(tag_id: int, db: Session = Depends(get_db)):
    """统计某标签下有多少篇文章。"""
    tag = db.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="标签不存在")
    count = db.scalar(
        select(func.count())
        .select_from(Post)
        .where(Post.tags.any(Tag.id == tag_id), Post.is_published == True)
    ) or 0
    return {"tag_id": tag_id, "post_count": count}


@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建标签。需要登录。"""
    # 检查同名
    exists = db.scalar(select(Tag).where(Tag.name == payload.name))
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="标签已存在",
        )
    tag = Tag(name=payload.name, description=payload.description)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/{tag_id}", response_model=TagOut)
def update_tag(
    tag_id: int,
    payload: TagCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """更新标签。仅管理员。"""
    tag = db.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="标签不存在")
    tag.name = payload.name
    tag.description = payload.description
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", response_model=MessageOut)
def delete_tag(
    tag_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """删除标签。仅管理员。

    多对多关联表会自动清理（ondelete=CASCADE）。
    """
    tag = db.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="标签不存在")
    db.delete(tag)
    db.commit()
    return MessageOut(message="已删除")
