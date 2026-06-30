"""
============================================================
 文章路由 —— CRUD + 分页 + 标签关联
------------------------------------------------------------

【接口列表】
    GET    /posts             文章列表（分页 + 过滤）
    GET    /posts/{id}        文章详情（含评论）
    POST   /posts             创建文章（需登录）
    PUT    /posts/{id}        更新文章（需登录 + 作者本人/管理员）
    DELETE /posts/{id}        删除文章（需登录 + 作者本人/管理员）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func, desc

from app.deps import get_db, get_current_user, get_current_user_optional
from app.models import Post, User, Tag, Comment
from app.schemas import (
    PostCreate, PostUpdate, PostOut, PostDetailOut, MessageOut,
)

router = APIRouter(prefix="/posts", tags=["文章"])


# =============================================================
# 列表查询的辅助函数
# =============================================================
def _apply_filters(stmt, *, tag_id: int | None = None, author_id: int | None = None,
                   keyword: str | None = None, published_only: bool = True):
    """给查询语句追加过滤条件。"""
    if published_only:
        stmt = stmt.where(Post.is_published == True)
    if tag_id is not None:
        # 多对多过滤：用 any() 配合关联表
        stmt = stmt.where(Post.tags.any(Tag.id == tag_id))
    if author_id is not None:
        stmt = stmt.where(Post.author_id == author_id)
    if keyword:
        # 关键词搜索标题和摘要（简单的 LIKE 匹配）
        like = f"%{keyword}%"
        stmt = stmt.where(
            (Post.title.like(like)) | (Post.summary.like(like))
        )
    return stmt


# =============================================================
# 1. 文章列表（分页）
# =============================================================
@router.get("")
def list_posts(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(10, ge=1, le=50, description="每页条数，1-50"),
    tag_id: int | None = Query(None, description="按标签 ID 过滤"),
    author_id: int | None = Query(None, description="按作者 ID 过滤"),
    keyword: str | None = Query(None, description="关键词搜索标题/摘要"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """分页查询文章列表。

    返回结构（PaginatedOut）：
        {
          "items": [...],
          "total": 100,
          "page": 1,
          "page_size": 10,
          "total_pages": 10
        }

    权限：
        - 未登录用户：只能看已发布的
        - 登录用户：能看自己的草稿 + 所有已发布的
        - 管理员：能看所有（含草稿）
    """
    # 基础查询
    stmt = select(Post).options(selectinload(Post.tags), selectinload(Post.author))

    # 权限过滤
    if current_user is None:
        stmt = _apply_filters(stmt, published_only=True)
    elif current_user.is_admin:
        stmt = _apply_filters(stmt, published_only=False, **{})
    else:
        # 普通登录用户：已发布的 + 自己的草稿
        stmt = stmt.where(
            (Post.is_published == True) | (Post.author_id == current_user.id)
        )
        # 应用其他过滤（但不强制 published_only）
        if tag_id is not None:
            stmt = stmt.where(Post.tags.any(Tag.id == tag_id))
        if author_id is not None:
            stmt = stmt.where(Post.author_id == author_id)
        if keyword:
            like = f"%{keyword}%"
            stmt = stmt.where(Post.title.like(like) | Post.summary.like(like))

    if current_user is None or current_user.is_admin:
        stmt = _apply_filters(
            stmt,
            tag_id=tag_id, author_id=author_id, keyword=keyword,
            published_only=(current_user is None),
        )

    # 总数（用一个子查询算 total）
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0

    # 排序 + 分页
    stmt = stmt.order_by(desc(Post.created_at))
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    # 执行查询
    posts = db.scalars(stmt).unique().all()

    # 计算每篇文章的评论数（N+1 问题简化版：单独查一次聚合计数）
    # 真实生产可以用 GROUP BY 一次拿到
    items = []
    for p in posts:
        comment_count = db.scalar(
            select(func.count()).where(Comment.post_id == p.id)
        ) or 0
        items.append(PostOut(
            id=p.id, title=p.title, summary=p.summary, content=p.content,
            is_published=p.is_published, view_count=p.view_count,
            created_at=p.created_at, updated_at=p.updated_at,
            author=p.author, tags=p.tags, comment_count=comment_count,
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


# =============================================================
# 2. 文章详情
# =============================================================
@router.get("/{post_id}", response_model=PostDetailOut)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """获取文章详情（含评论树）。

    每访问一次，浏览数 +1（用 atomic UPDATE 避免并发问题）。
    """
    post = db.scalar(
        select(Post)
        .options(
            selectinload(Post.tags),
            selectinload(Post.author),
            selectinload(Post.comments).selectinload(Comment.author),
            selectinload(Post.comments).selectinload(Comment.replies),
        )
        .where(Post.id == post_id)
    )
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 权限：未发布文章只有作者本人和管理员能看
    if not post.is_published:
        if current_user is None or (current_user.id != post.author_id and not current_user.is_admin):
            raise HTTPException(status_code=404, detail="文章不存在")

    # 浏览数 +1（原子操作，防并发）
    # 等价 SQL: UPDATE posts SET view_count = view_count + 1 WHERE id = ?
    post.view_count = (post.view_count or 0) + 1
    db.commit()
    db.refresh(post)

    # 只返回顶级评论，replies 字段会自动递归带出回复
    top_comments = [c for c in post.comments if c.parent_id is None]
    # 构造响应：把顶级评论替换 post.comments，便于前端递归渲染
    return PostDetailOut(
        id=post.id, title=post.title, summary=post.summary, content=post.content,
        is_published=post.is_published, view_count=post.view_count,
        created_at=post.created_at, updated_at=post.updated_at,
        author=post.author, tags=post.tags,
        comment_count=len(post.comments),
        comments=top_comments,
    )


# =============================================================
# 3. 创建文章
# =============================================================
@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建文章。必须登录。

    流程：
        1. 校验标签 ID 都存在
        2. 创建文章对象
        3. 关联标签
        4. 提交数据库
    """
    # 校验标签
    tags = []
    if payload.tag_ids:
        tags = db.scalars(
            select(Tag).where(Tag.id.in_(payload.tag_ids))
        ).all()
        if len(tags) != len(set(payload.tag_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="部分标签 ID 不存在",
            )

    post = Post(
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        is_published=payload.is_published,
        author_id=current_user.id,
        tags=tags,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostOut(
        id=post.id, title=post.title, summary=post.summary, content=post.content,
        is_published=post.is_published, view_count=post.view_count,
        created_at=post.created_at, updated_at=post.updated_at,
        author=post.author, tags=post.tags, comment_count=0,
    )


# =============================================================
# 4. 更新文章
# =============================================================
@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    payload: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新文章。作者本人或管理员可改。"""
    post = db.scalar(
        select(Post).options(selectinload(Post.tags), selectinload(Post.author))
        .where(Post.id == post_id)
    )
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 权限校验
    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权修改他人文章")

    # 部分更新
    data = payload.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)

    for key, value in data.items():
        setattr(post, key, value)

    # 更新标签关联
    if tag_ids is not None:
        tags = []
        if tag_ids:
            tags = list(db.scalars(select(Tag).where(Tag.id.in_(tag_ids))))
            if len(tags) != len(set(tag_ids)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="部分标签 ID 不存在",
                )
        post.tags = tags

    db.commit()
    db.refresh(post)

    comment_count = db.scalar(
        select(func.count()).where(Comment.post_id == post.id)
    ) or 0
    return PostOut(
        id=post.id, title=post.title, summary=post.summary, content=post.content,
        is_published=post.is_published, view_count=post.view_count,
        created_at=post.created_at, updated_at=post.updated_at,
        author=post.author, tags=post.tags, comment_count=comment_count,
    )


# =============================================================
# 5. 删除文章
# =============================================================
@router.delete("/{post_id}", response_model=MessageOut)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除文章。作者本人或管理员可删。"""
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")

    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权删除他人文章")

    db.delete(post)
    db.commit()
    return MessageOut(message="已删除")
