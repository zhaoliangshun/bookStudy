"""
============================================================
 ORM 模型 —— 数据库表的 Python 定义
------------------------------------------------------------

【本模块定义了 5 张表】
    1. users        用户表
    2. posts        文章表
    3. comments     评论表（自引用，支持回复评论）
    4. tags         标签表
    5. post_tags    文章-标签 多对多关联表

【关系图】
    User 1───N Post           （一个用户写多篇文章）
    User 1───N Comment        （一个用户发多条评论）
    Post 1───N Comment        （一篇文章有多条评论）
    Comment 1───N Comment     （一条评论有多条回复，自引用）
    Post N───M Tag            （文章与标签多对多，通过 post_tags 关联）

【SQLAlchemy 2.0 风格要点】
    - 用 Mapped[X] 类型注解字段（替代旧的 Column(type)）
    - 用 mapped_column() 配置列属性
    - relationship() 定义关系，配合 back_populates 双向导航
    - List[X] 表示「多个」，X 表示「一个」

【兼容性说明】
    本文件用 typing.Optional / typing.List 而不是 `X | None` / `list[X]`，
    以兼容 Python 3.9。SQLAlchemy 2.0 在 3.9 下需要真实可求值的注解。
"""
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database import Base


# =============================================================
# 多对多关联表：post_tags
# =============================================================
# 【为什么单独一张关联表】
#   多对多关系不能直接用外键表达，必须借助中间表。
#   post_tags 里每行存一对 (post_id, tag_id)。
#
# 【为什么用 Table 而不是类】
#   关联表如果只是存外键、没有额外字段，用 Table 更轻量。
#   如果关联表还要存额外信息（如添加时间、添加人），
#   就改成完整的 ORM 类，加自己的主键和字段。
post_tags = Table(
    "post_tags",
    Base.metadata,
    # 文章 ID 外键，指向 posts.id
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    # 标签 ID 外键，指向 tags.id
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    # 复合主键 (post_id, tag_id) 天然唯一，避免一篇文章重复打同一标签
)


# =============================================================
# 用户表
# =============================================================
class User(Base):
    """用户表：注册用户、文章作者、评论者都从这里来。"""

    __tablename__ = "users"

    # 主键：自增 ID。Mapped[int] 表示 Python 侧是 int
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # 用户名：唯一索引，3-50 字符
    # index=True 让数据库建索引，加速 WHERE username = ? 查询
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    # 邮箱：唯一索引，最长 255
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    # 密码哈希：存的是 bcrypt 哈希，绝不存明文密码！
    # 字段名叫 password_hash 而不是 password，提醒自己别存明文
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # 头像 URL：可选
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # 个人简介：可选
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 是否管理员：默认 False
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # 是否启用：可用于「软删除」或封禁用户
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # 创建/更新时间：服务端默认值用 func.now()，对应 MySQL 的 NOW()
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ---------- 关系 ----------
    # back_populates 双向绑定：User.posts ←→ Post.author
    # cascade="all, delete-orphan"：删用户时连带删他写的文章
    #   但这里我们通常不真删用户（外键约束会让删除失败），用软删除更稳
    posts: Mapped[List["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        # 调试时打印友好信息
        return f"<User id={self.id} username={self.username!r}>"


# =============================================================
# 文章表
# =============================================================
class Post(Base):
    """文章表：博客的核心内容。"""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # 标题：最长 200
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # 摘要：列表页用，可选
    summary: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # 正文：长文本
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # 作者 ID：外键指向 users.id
    # ondelete="CASCADE"：删作者时连带删文章（但我们一般不真删用户）
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 是否发布：False 表示草稿，列表页不显示
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # 浏览数：默认 0，每次访问详情页 +1
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ---------- 关系 ----------
    # author：每篇文章属于一个用户。lazy="joined" 表示查文章时自动 JOIN 作者表
    #   适合「几乎每次查文章都要作者信息」的场景
    author: Mapped["User"] = relationship(back_populates="posts", lazy="joined")
    # comments：一篇文章有多条评论
    # cascade="all, delete-orphan"：删文章时连带删评论
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="post",
        cascade="all, delete-orphan",
        # 按创建时间正序排，最早的评论在最前面
        order_by="Comment.created_at",
    )
    # tags：多对多。secondary 指向关联表
    #   back_populates 双向绑定：Post.tags ←→ Tag.posts
    tags: Mapped[List["Tag"]] = relationship(
        secondary=post_tags, back_populates="posts", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Post id={self.id} title={self.title!r}>"


# =============================================================
# 评论表（自引用：评论可以回复评论）
# =============================================================
class Comment(Base):
    """评论表。

    【自引用关系】
        一条评论可以有多个回复，回复也是评论。
        通过 parent_id 指向另一条评论，形成树状结构。
    """

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # 评论内容
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # 作者 ID
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 文章 ID：顶级评论必填，回复评论也带上（方便按文章查所有评论）
    post_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 父评论 ID：可空。NULL 表示顶级评论，非空表示回复
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ---------- 关系 ----------
    author: Mapped["User"] = relationship(back_populates="comments", lazy="joined")
    post: Mapped["Post"] = relationship(back_populates="comments")

    # 自引用关系：回复指向父评论，父评论挂载回复列表
    # remote_side=[id] 告诉 SQLAlchemy：parent_id 是远端，id 是近端
    parent: Mapped[Optional["Comment"]] = relationship(
        "Comment", back_populates="replies", remote_side=[id]
    )
    replies: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
        # 回复按时间正序
        order_by="Comment.created_at",
    )

    def __repr__(self) -> str:
        return f"<Comment id={self.id} post_id={self.post_id}>"


# =============================================================
# 标签表
# =============================================================
class Tag(Base):
    """标签表：文章分类用，多对多关联文章。"""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # 标签名：唯一，最长 50
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    # 标签描述：可选
    description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # 多对多关系
    posts: Mapped[List["Post"]] = relationship(
        secondary=post_tags, back_populates="tags"
    )

    def __repr__(self) -> str:
        return f"<Tag id={self.id} name={self.name!r}>"
