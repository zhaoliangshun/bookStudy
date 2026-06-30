"""
============================================================
 Pydantic Schemas —— 请求体 / 响应体 的数据结构定义
------------------------------------------------------------

【为什么 ORM 模型还不够，还要单独写 schemas】
    ORM 模型描述「数据库里的数据长什么样」。
    Schemas 描述「HTTP 接口收发数据长什么样」。
    两者职责不同：
    - 数据库可能有内部字段（password_hash），不该返回给客户端
    - 客户端创建用户时要传密码，但响应里不该有密码哈希
    - 不同接口对同一资源结构要求不同（如创建时不传 id，响应时要带 id）

    Pydantic schemas 帮我们：
    1. 自动校验请求体（类型、长度、必填）
    2. 自动过滤响应字段（白名单机制）
    3. 自动生成 OpenAPI 文档
    4. 自动序列化 JSON

    还可以配合 model_config = ConfigDict(from_attributes=True)
    把 ORM 对象直接转成 schema（取代旧版的 orm_mode = True）。
"""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# =============================================================
# 通用响应包装
# =============================================================
class MessageOut(BaseModel):
    """简单的消息响应，用于不需要返回数据的接口（如删除）。"""
    message: str
    success: bool = True


class PaginatedOut(BaseModel):
    """分页响应包装。所有列表接口统一用这个结构。"""
    items: list  # 具体类型在子类里覆盖
    total: int       # 总条数（用于前端显示「共 N 条」）
    page: int        # 当前页码
    page_size: int   # 每页条数
    total_pages: int # 总页数


# =============================================================
# 用户相关 schemas
# =============================================================
class UserCreate(BaseModel):
    """注册用户时的请求体。"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名，3-50 字符")
    email: EmailStr = Field(..., description="邮箱（会被 Pydantic 校验格式）")
    password: str = Field(..., min_length=6, max_length=100, description="密码，6-100 字符")


class UserLogin(BaseModel):
    """登录时的请求体。"""
    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., description="密码")


class UserUpdate(BaseModel):
    """更新用户资料。所有字段可选，支持部分更新。"""
    avatar: str | None = Field(None, max_length=500)
    bio: str | None = Field(None, max_length=1000)


class UserOut(BaseModel):
    """对外暴露的用户信息。不含 password_hash！"""
    # 从_attributes=True：允许从 ORM 对象的属性直接构造（取代旧 orm_mode）
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    avatar: str | None
    bio: str | None
    is_admin: bool
    is_active: bool
    created_at: datetime


class TokenOut(BaseModel):
    """登录成功返回的 token。"""
    access_token: str
    token_type: str = "bearer"  # OAuth2 标准格式：bearer token
    user: UserOut


# =============================================================
# 标签相关 schemas
# =============================================================
class TagCreate(BaseModel):
    """创建标签。"""
    name: str = Field(..., min_length=1, max_length=50, description="标签名")
    description: str | None = Field(None, max_length=200)


class TagOut(BaseModel):
    """标签响应。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime


# =============================================================
# 评论相关 schemas
# =============================================================
class CommentCreate(BaseModel):
    """创建评论。"""
    content: str = Field(..., min_length=1, max_length=2000, description="评论内容")
    parent_id: int | None = Field(None, description="父评论 ID，回复评论时传，顶级评论不传")


class CommentOut(BaseModel):
    """评论响应。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    post_id: int
    parent_id: int | None
    author: UserOut  # 嵌套用户 schema
    created_at: datetime
    updated_at: datetime
    # 回复列表（递归嵌套）
    replies: list["CommentOut"] = []


# =============================================================
# 文章相关 schemas
# =============================================================
class PostCreate(BaseModel):
    """创建文章。"""
    title: str = Field(..., min_length=1, max_length=200, description="标题")
    summary: str | None = Field(None, max_length=500, description="摘要")
    content: str = Field(..., min_length=1, description="正文")
    is_published: bool = Field(False, description="是否发布（False=草稿）")
    tag_ids: list[int] = Field(default_factory=list, description="标签 ID 列表")


class PostUpdate(BaseModel):
    """更新文章。所有字段可选。"""
    title: str | None = Field(None, min_length=1, max_length=200)
    summary: str | None = Field(None, max_length=500)
    content: str | None = Field(None, min_length=1)
    is_published: bool | None = None
    tag_ids: list[int] | None = None


class PostOut(BaseModel):
    """文章响应（列表页用，不含正文）。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary: str | None
    content: str
    is_published: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
    author: UserOut
    tags: list[TagOut] = []
    # 评论数：从 ORM 查询时动态计算（不一定来自字段）
    comment_count: int = 0


class PostDetailOut(PostOut):
    """文章详情响应。继承 PostOut，加上评论列表。"""
    comments: list[CommentOut] = []


# 解决 forward reference（CommentOut 里引用了未来定义的 PostOut 类似情况）
# Python 3.10+ 的 from __future__ import annotations 也可以
CommentOut.model_rebuild()
PostDetailOut.model_rebuild()
