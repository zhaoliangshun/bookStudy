// =============================================================
// FastAPI 全栈实战 - 第 4 批章节（看板核心 CRUD 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   ff-board-model:   Board 模型与 Schema
//   ff-column-model:  Column 模型与 Schema
//   ff-card-model:    Card 模型与 Schema
//   ff-board-crud:    Board CRUD 接口
//   ff-column-crud:   Column CRUD 接口
//   ff-card-crud:     Card CRUD 接口
// =============================================================

export const chapters = [
  // ============================================================
  // 第 16 章：Board 模型与 Schema
  // ============================================================
  {
    id: "ff-board-model",
    group: "看板核心 CRUD",
    icon: "📋",
    title: "Board 模型与 Schema",
    content: `# Board 模型与 Schema

## 一、模型 vs Schema 的区别

新手常搞混这两个概念：

| 概念 | 用途 | 例子 |
|------|------|------|
| **Model（ORM 模型）** | 数据库表结构 | \`class Board(Base)\` 定义 \`boards\` 表 |
| **Schema（Pydantic）** | API 数据结构 | \`class BoardCreate\` 定义创建请求体 |

为什么要分开？

- **安全**：Model 含所有字段（包括 password_hash），Schema 只暴露允许的字段
- **灵活**：一个 Model 可对应多个 Schema（创建、更新、响应各一个）
- **解耦**：数据库结构变化不影响 API 接口

\`\`\`python
# Model：完整数据库结构
class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    owner_id: Mapped[int]          # 内部字段
    created_at: Mapped[datetime]   # 自动生成

# Schema：创建请求（客户端传什么）
class BoardCreate(BaseModel):
    title: str
    # 没有 owner_id（从 token 拿）
    # 没有 created_at（自动生成）

# Schema：响应（返回给客户端什么）
class BoardResponse(BaseModel):
    id: int
    title: str
    owner_id: int
    created_at: datetime
\`\`\`

## 二、Board 模型设计

\`\`\`python
# 文件：backend/app/models.py
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), default=None)
    color: Mapped[str] = mapped_column(String(20), default="blue")

    # 外键：所有者
    # ondelete="CASCADE" 删用户时连带删看板
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,  # 加索引，按 owner 查询快
    )

    # 软删除：归档而不真删
    archived: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.now,
        onupdate=datetime.now,  # 更新时自动改
    )

    # 关系
    owner: Mapped["User"] = relationship(back_populates="boards")
    columns: Mapped[list["Column"]] = relationship(
        back_populates="board",
        cascade="all, delete-orphan",
        order_by="Column.position",  # 默认按 position 排序
    )
\`\`\`

**设计要点：**

1. **\`index=True\`**：owner_id 加索引，因为经常按 owner 查看板列表
2. **\`archived\`**：软删除字段，归档不真删，方便恢复
3. **\`onupdate=datetime.now\`**：更新时自动改 updated_at
4. **\`order_by="Column.position"\`**：列默认按位置排序

## 三、Board Schema 设计

\`\`\`python
# 文件：backend/app/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# ===== Board 相关 Schema =====

# 创建看板请求
class BoardCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=100,
        description="看板标题",
        examples=["我的工作看板"],
    )
    description: str | None = Field(
        default=None,
        max_length=500,
        description="看板描述",
    )
    color: str = Field(
        default="blue",
        pattern="^(blue|green|red|yellow|purple|pink|orange)$",
        description="看板颜色主题",
    )

# 更新看板请求（所有字段可选，支持 PATCH 语义）
class BoardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    color: str | None = Field(
        default=None,
        pattern="^(blue|green|red|yellow|purple|pink|orange)$",
    )
    archived: bool | None = None  # 归档/取消归档

# 基础响应
class BoardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    color: str
    owner_id: int
    archived: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# 带列的响应（详情页用）
class ColumnBrief(BaseModel):
    id: int
    title: str
    position: int
    model_config = ConfigDict(from_attributes=True)

class BoardDetailResponse(BoardResponse):
    """看板详情：包含列的概要信息。"""
    columns: list[ColumnBrief] = []

# 列表项响应（精简版）
class BoardListItem(BaseModel):
    """看板列表项：只返回必要字段，减少响应体积。"""
    id: int
    title: str
    color: str
    archived: bool
    column_count: int = 0  # 列数（动态计算）
    model_config = ConfigDict(from_attributes=True)
\`\`\`

## 四、为什么有这么多 Schema？

一个 Board 模型对应 5 个 Schema，看起来冗余，但每个都有用途：

| Schema | 用途 | 字段 |
|--------|------|------|
| \`BoardCreate\` | POST 请求体 | title, description, color |
| \`BoardUpdate\` | PATCH 请求体 | 全部可选 |
| \`BoardResponse\` | 标准响应 | 全部字段 |
| \`BoardDetailResponse\` | 详情页响应 | 含 columns 概要 |
| \`BoardListItem\` | 列表页响应 | 精简字段 + column_count |

**好处**：

1. **安全**：\`BoardCreate\` 没有 \`owner_id\`，客户端无法伪造所有者
2. **灵活**：列表页只返回必要字段，减少流量
3. **文档清晰**：\`/docs\` 里每个接口的请求/响应结构一目了然

## 五、Demo：模型与 Schema 配合

\`\`\`python
# Demo：Board 模型 + Schema 完整配合
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# ===== 基础设施 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# ===== 模型 =====
class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), default=None)
    color: Mapped[str] = mapped_column(String(20), default="blue")
    owner_id: Mapped[int] = mapped_column(default=1)  # 简化，假设 owner_id=1
    archived: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.now,
        onupdate=datetime.now,
    )

Base.metadata.create_all(engine)

# ===== Schemas =====
class BoardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    color: str = Field(default="blue", pattern="^(blue|green|red|yellow)$")

class BoardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    color: str | None = Field(default=None, pattern="^(blue|green|red|yellow)$")
    archived: bool | None = None

class BoardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    color: str
    owner_id: int
    archived: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ===== 路由 =====
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(payload: BoardCreate, db: Session = Depends(get_db)):
    board = Board(
        title=payload.title,
        description=payload.description,
        color=payload.color,
        owner_id=1,  # 实际从 current_user 拿
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@app.get("/boards", response_model=list[BoardResponse])
def list_boards(db: Session = Depends(get_db)):
    return db.scalars(select(Board).where(Board.archived == False)).all()

@app.get("/boards/{board_id}", response_model=BoardResponse)
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    return board

@app.patch("/boards/{board_id}", response_model=BoardResponse)
def update_board(board_id: int, payload: BoardUpdate, db: Session = Depends(get_db)):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    # exclude_unset=True：只更新客户端传的字段
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(board, key, value)  # 等价于 board.key = value
    db.commit()
    db.refresh(board)
    return board

# ===== 测试 =====
client = TestClient(app)

print("=== 1. 创建看板 ===")
r = client.post("/boards", json={"title": "工作", "color": "green"})
print(f"  {r.json()}")

print("\\n=== 2. 创建带默认值 ===")
r = client.post("/boards", json={"title": "学习"})
b = r.json()
print(f"  color={b['color']}, description={b['description']}")

print("\\n=== 3. 校验失败：颜色非法 ===")
r = client.post("/boards", json={"title": "测试", "color": "pink"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 4. 部分更新 ===")
r = client.patch("/boards/1", json={"title": "工作-改名", "archived": True})
print(f"  title={r.json()['title']}, archived={r.json()['archived']}")

print("\\n=== 5. 列表（archived=True 不在列表）===")
r = client.get("/boards")
print(f"  数量：{len(r.json())}")  # 1（被归档的不算）

print("\\n=== 6. 详情仍能拿到 ===")
r = client.get("/boards/1")
print(f"  archived={r.json()['archived']}")  # True

print("\\n=== 7. updated_at 自动更新 ===")
import time
time.sleep(0.1)
r = client.patch("/boards/1", json={"color": "red"})
print(f"  updated_at 变了：{r.json()['updated_at']}")
\`\`\`

运行这个 demo，重点理解：

1. **\`model_dump(exclude_unset=True)\` + \`setattr\`**：PATCH 标准实现
2. **\`onupdate=datetime.now\`**：updated_at 自动更新
3. **\`response_model\` 自动序列化**：ORM 对象 → JSON 响应

## 六、本章小结

- Model 是数据库结构，Schema 是 API 数据结构，分开设计
- 一个 Model 可对应多个 Schema：Create / Update / Response / Detail
- \`BoardCreate\` 不含 owner_id，从 token 拿，防伪造
- 下章我们设计 Column 模型`,
  },

  // ============================================================
  // 第 17 章：Column 模型与 Schema
  // ============================================================
  {
    id: "ff-column-model",
    group: "看板核心 CRUD",
    icon: "📊",
    title: "Column 模型与 Schema",
    content: `# Column 模型与 Schema

## 一、Column（看板列）的设计

看板里的"列"就是横向分组的栏目，比如"待办"、"进行中"、"已完成"。

\`\`\`
┌─────────┐  ┌─────────┐  ┌─────────┐
│ 待办     │  │ 进行中   │  │ 已完成   │  ← Column
│ pos=0   │  │ pos=1   │  │ pos=2   │
│         │  │         │  │         │
│ [卡片]  │  │ [卡片]  │  │ [卡片]  │  ← Card
│ [卡片]  │  │ [卡片]  │  │         │
└─────────┘  └─────────┘  └─────────┘
\`\`\`

**关键字段：\`position\`**

列的顺序由 \`position\` 字段决定。拖拽排序时，改 position 即可。

## 二、Column 模型

\`\`\`python
# 文件：backend/app/models.py（追加）
class Column(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(default=0)

    # 外键：所属看板
    # ondelete="CASCADE" 删看板时连带删列
    board_id: Mapped[int] = mapped_column(
        ForeignKey("boards.id", ondelete="CASCADE"),
        index=True,
    )

    # 可选：WIP 限制（Work In Progress，进行中的卡片上限）
    # 设为 None 表示不限制
    wip_limit: Mapped[int | None] = mapped_column(default=None)

    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # 关系
    board: Mapped["Board"] = relationship(back_populates="columns")
    cards: Mapped[list["Card"]] = relationship(
        back_populates="column",
        cascade="all, delete-orphan",
        order_by="Card.position",  # 卡片也按 position 排序
    )
\`\`\`

## 三、Column Schema

\`\`\`python
# 文件：backend/app/schemas.py（追加）
class ColumnCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    position: int | None = Field(
        default=None,
        ge=0,
        description="位置。不传则追加到末尾。",
    )
    wip_limit: int | None = Field(default=None, ge=1, description="WIP 限制")

class ColumnUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    position: int | None = Field(default=None, ge=0)
    wip_limit: int | None = Field(default=None, ge=1)

class CardBrief(BaseModel):
    id: int
    title: str
    position: int
    model_config = ConfigDict(from_attributes=True)

class ColumnResponse(BaseModel):
    id: int
    title: str
    position: int
    board_id: int
    wip_limit: int | None
    created_at: datetime
    cards: list[CardBrief] = []  # 含卡片概要
    model_config = ConfigDict(from_attributes=True)
\`\`\`

## 四、position 自动追加逻辑

创建列时，如果不传 \`position\`，自动追加到末尾：

\`\`\`python
def create_column(payload: ColumnCreate, board_id: int, db: Session):
    # 如果没传 position，计算下一个位置
    if payload.position is None:
        # 查当前看板下最大的 position
        max_pos = db.scalar(
            select(func.max(Column.position))
            .where(Column.board_id == board_id)
        )
        # max_pos 是 None（没有列）时，从 0 开始
        position = (max_pos or 0)
        # 追加到末尾，position = max + 1
        if max_pos is not None:
            position = max_pos + 1
    else:
        position = payload.position
        # 如果指定了 position，需要把后面的列往后挪
        # 例如插入到 position=1，原来 position>=1 的都 +1
        db.scalars(
            select(Column)
            .where(Column.board_id == board_id, Column.position >= position)
        ).all()  # 这里需要批量更新
\`\`\`

## 五、Demo：Column 模型与自动追加

\`\`\`python
# Demo：Column 完整 CRUD + position 自动追加
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, select, func
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# ===== 基础设施 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# ===== 模型 =====
class Column(Base):
    __tablename__ = "columns"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(default=0)
    board_id: Mapped[int] = mapped_column(default=1)  # 简化
    wip_limit: Mapped[int | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

Base.metadata.create_all(engine)

# ===== Schemas =====
class ColumnCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    position: int | None = Field(default=None, ge=0)
    wip_limit: int | None = Field(default=None, ge=1)

class ColumnUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    position: int | None = Field(default=None, ge=0)
    wip_limit: int | None = Field(default=None, ge=1)

class ColumnResponse(BaseModel):
    id: int
    title: str
    position: int
    board_id: int
    wip_limit: int | None
    model_config = ConfigDict(from_attributes=True)

# ===== 路由 =====
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_next_position(db: Session, board_id: int) -> int:
    """计算下一个 position（追加到末尾）。"""
    max_pos = db.scalar(
        select(func.max(Column.position))
        .where(Column.board_id == board_id)
    )
    return (max_pos or -1) + 1  # 没列时返回 0

@app.post("/columns", response_model=ColumnResponse, status_code=201)
def create_column(payload: ColumnCreate, db: Session = Depends(get_db)):
    # 自动追加 position
    position = payload.position
    if position is None:
        position = get_next_position(db, board_id=1)
    else:
        # 指定 position：把 >= 该位置的列往后挪
        existing = db.scalars(
            select(Column).where(
                Column.board_id == 1,
                Column.position >= position,
            )
        ).all()
        for col in existing:
            col.position += 1

    column = Column(
        title=payload.title,
        position=position,
        board_id=1,
        wip_limit=payload.wip_limit,
    )
    db.add(column)
    db.commit()
    db.refresh(column)
    return column

@app.get("/columns", response_model=list[ColumnResponse])
def list_columns(db: Session = Depends(get_db)):
    # 按 position 排序
    return db.scalars(
        select(Column).where(Column.board_id == 1).order_by(Column.position)
    ).all()

@app.patch("/columns/{col_id}", response_model=ColumnResponse)
def update_column(col_id: int, payload: ColumnUpdate, db: Session = Depends(get_db)):
    col = db.get(Column, col_id)
    if not col:
        raise HTTPException(404, "列不存在")
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(col, k, v)
    db.commit()
    db.refresh(col)
    return col

@app.delete("/columns/{col_id}")
def delete_column(col_id: int, db: Session = Depends(get_db)):
    col = db.get(Column, col_id)
    if not col:
        raise HTTPException(404, "列不存在")
    deleted_pos = col.position
    db.delete(col)
    db.commit()
    # 删除后，后面的列往前挪
    after = db.scalars(
        select(Column).where(
            Column.board_id == 1,
            Column.position > deleted_pos,
        )
    ).all()
    for c in after:
        c.position -= 1
    db.commit()
    return {"ok": True}

# ===== 测试 =====
client = TestClient(app)

print("=== 自动追加 position ===")
for title in ["待办", "进行中", "已完成"]:
    r = client.post("/columns", json={"title": title})
    print(f"  {title}: position={r.json()['position']}")

print("\\n=== 插入到中间（position=1）===")
r = client.post("/columns", json={"title": "审核", "position": 1})
print(f"  插入'审核'到 position=1")

print("\\n=== 列出所有列（按 position 排序）===")
r = client.get("/columns")
for col in r.json():
    print(f"  pos={col['position']}: {col['title']}")

print("\\n=== 移动列：把'已完成'移到最前 ===")
# '已完成'在 position=3，移到 0
client.patch("/columns/3", json={"position": 0})
r = client.get("/columns")
for col in r.json():
    print(f"  pos={col['position']}: {col['title']}")

print("\\n=== 删除中间列 ===")
client.delete("/columns/2")  # 删'审核'
r = client.get("/columns")
print("  删除后：")
for col in r.json():
    print(f"  pos={col['position']}: {col['title']}")
# 后面的列自动往前挪，position 连续
\`\`\`

运行这个 demo，重点理解 position 维护：

1. **创建不传 position**：自动追加到末尾
2. **创建指定 position**：后面的列往后挪
3. **删除列**：后面的列往前挪，保持连续
4. **移动列**：直接改 position 即可

## 六、WIP 限制

\`wip_limit\` 是看板方法论的概念：限制"进行中"的卡片数量，防止任务堆积。

\`\`\`python
# 创建卡片时检查 WIP
def create_card(column_id, db):
    column = db.get(Column, column_id)
    if column.wip_limit:
        current_count = db.scalar(
            select(func.count()).select_from(Card)
            .where(Card.column_id == column_id)
        )
        if current_count >= column.wip_limit:
            raise HTTPException(400, f"超过 WIP 限制（{column.wip_limit}）")
    # ... 创建卡片
\`\`\`

## 七、本章小结

- Column 用 \`position\` 字段维护顺序
- 创建/删除时自动调整后续列的 position
- \`wip_limit\` 限制进行中卡片数量
- 下章设计 Card 模型`,
  },

  // ============================================================
  // 第 18 章：Card 模型与 Schema
  // ============================================================
  {
    id: "ff-card-model",
    group: "看板核心 CRUD",
    icon: "📇",
    title: "Card 模型与 Schema",
    content: `# Card 模型与 Schema

## 一、Card（卡片）的设计

卡片是看板里最小的单元，代表一个具体任务。

\`\`\`
┌────────────────────────┐
│ 写文档              [🏷] │  ← 标题 + 标签
│ ─────────────────────  │
│ 描述这个任务的具体内容  │  ← 描述（Markdown）
│                        │
│ 👤 alice   📅 2024-12-31│  ← 负责人 + 截止日期
└────────────────────────┘
\`\`\`

## 二、Card 模型

\`\`\`python
# 文件：backend/app/models.py（追加）
class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    position: Mapped[int] = mapped_column(default=0)

    # 外键：所属列
    column_id: Mapped[int] = mapped_column(
        ForeignKey("columns.id", ondelete="CASCADE"),
        index=True,
    )

    # 可选：负责人（用户）
    assignee_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        default=None,
    )

    # 可选：截止日期
    due_date: Mapped[datetime | None] = mapped_column(default=None)

    # 可选：标签（用 JSON 字段存）
    # SQLite 不原生支持 JSON，SQLAlchemy 会用 TEXT 模拟
    labels: Mapped[list[str]] = mapped_column(
        default=list,
        server_default="[]",
    )

    # 可选：优先级
    priority: Mapped[int] = mapped_column(default=0)  # 0=普通, 1=重要, 2=紧急

    # 时间戳
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.now,
        onupdate=datetime.now,
    )

    # 关系
    column: Mapped["Column"] = relationship(back_populates="cards")
    assignee: Mapped["User | None"] = relationship()
\`\`\`

## 三、Card Schema

\`\`\`python
# 文件：backend/app/schemas.py（追加）
class CardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    position: int | None = Field(default=None, ge=0)
    assignee_id: int | None = None
    due_date: datetime | None = None
    labels: list[str] = Field(default=[], max_length=10)
    priority: int = Field(default=0, ge=0, le=2)

class CardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    position: int | None = Field(default=None, ge=0)
    assignee_id: int | None = None
    due_date: datetime | None = None
    labels: list[str] | None = None
    priority: int | None = Field(default=None, ge=0, le=2)

class CardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    position: int
    column_id: int
    assignee_id: int | None
    due_date: datetime | None
    labels: list[str]
    priority: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# 移动卡片请求：跨列移动专用
class CardMove(BaseModel):
    """移动卡片到指定列的指定位置。"""
    target_column_id: int
    target_position: int = Field(ge=0)
\`\`\`

**重点：\`CardMove\` 单独定义**

拖拽卡片跨列移动是看板的核心交互，单独设计 schema 让接口语义更清晰：

\`\`\`python
@app.patch("/cards/{card_id}/move")
def move_card(card_id: int, payload: CardMove):
    # 移动到 target_column_id 的 target_position 位置
    ...
\`\`\`

## 四、Demo：Card 模型与标签

\`\`\`python
# Demo：Card 完整模型 + 标签 + 优先级
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, Text, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)
from typing import Any

# ===== 模型 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# 用 TypeDecorator 实现 JSON 字段（SQLite 兼容）
from sqlalchemy import TypeDecorator, JSON

class Card(Base):
    __tablename__ = "cards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    position: Mapped[int] = mapped_column(default=0)
    column_id: Mapped[int] = mapped_column(default=1)
    due_date: Mapped[datetime | None] = mapped_column(default=None)
    labels: Mapped[list[str]] = mapped_column(JSON, default=list)
    priority: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

Base.metadata.create_all(engine)

# ===== Schemas =====
class CardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    labels: list[str] = []
    priority: int = Field(default=0, ge=0, le=2)

class CardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    position: int
    column_id: int
    labels: list[str]
    priority: int
    model_config = ConfigDict(from_attributes=True)

# ===== 测试 =====
with SessionLocal() as db:
    # 创建带标签的卡片
    card = Card(
        title="写文档",
        description="API 文档",
        labels=["文档", "紧急"],  # JSON 字段直接传 list
        priority=2,
        column_id=1,
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    print(f"卡片：{card.title}")
    print(f"  labels: {card.labels} (type={type(card.labels).__name__})")
    print(f"  priority: {card.priority}")

    # 修改标签
    card.labels.append("v2")
    db.commit()
    print(f"  修改后 labels: {card.labels}")

    # 查询：按标签过滤
    # SQLite 的 JSON 查询有限，这里用 Python 过滤演示
    all_cards = db.scalars(select(Card)).all()
    urgent = [c for c in all_cards if "紧急" in c.labels]
    print(f"  '紧急' 标签的卡片：{[c.title for c in urgent]}")

    # Pydantic 序列化
    response = CardResponse.model_validate(card)
    print(f"  Schema 序列化：{response.model_dump()}")
\`\`\`

## 五、本章小结

- Card 是看板最小单元，包含标题、描述、标签、优先级
- \`labels\` 用 JSON 字段存（SQLAlchemy 自动适配 SQLite）
- \`CardMove\` 单独定义，用于跨列移动
- 下章实现 Board 的 CRUD 接口`,
  },

  // ============================================================
  // 第 19 章：Board CRUD 接口
  // ============================================================
  {
    id: "ff-board-crud",
    group: "看板核心 CRUD",
    icon: "📚",
    title: "Board CRUD 接口",
    content: `# Board CRUD 接口

## 一、CRUD 路由规划

\`\`\`
GET    /boards                 列出我的看板
POST   /boards                 创建看板
GET    /boards/{board_id}      获取看板详情
PATCH  /boards/{board_id}      更新看板
DELETE /boards/{board_id}      删除看板
\`\`\`

## 二、路由分组：APIRouter

之前都是用 \`@app.get\`，路由直接挂在 app 上。项目变大后需要分组：

\`\`\`python
# 文件：backend/app/routers/boards.py
from fastapi import APIRouter

# prefix：所有路由自动加 /boards 前缀
# tags：OpenAPI 文档分组
router = APIRouter(prefix="/boards", tags=["看板"])

@router.get("/")          # 实际路径 /boards/
def list_boards(): ...

@router.get("/{board_id}")  # 实际路径 /boards/{board_id}
def get_board(board_id: int): ...
\`\`\`

在 main.py 注册：

\`\`\`python
# 文件：backend/app/main.py
from fastapi import FastAPI
from app.routers import boards, columns, cards, auth

app = FastAPI(title="TaskBoard API")
app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(columns.router)
app.include_router(cards.router)
\`\`\`

## 三、Board CRUD 完整实现

\`\`\`python
# 文件：backend/app/routers/boards.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Board
from app.schemas import BoardCreate, BoardUpdate, BoardResponse, BoardDetailResponse
from app.deps import get_current_user

router = APIRouter(prefix="/boards", tags=["看板"])

@router.get("/", response_model=list[BoardResponse])
def list_my_boards(
    archived: bool = Query(False, description="是否包含已归档"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """列出当前用户的看板。"""
    stmt = select(Board).where(Board.owner_id == current_user.id)
    if not archived:
        stmt = stmt.where(Board.archived == False)
    stmt = stmt.order_by(Board.updated_at.desc())
    return db.scalars(stmt).all()

@router.post("/", response_model=BoardResponse, status_code=201)
def create_board(
    payload: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建看板。owner 自动绑定当前用户。"""
    board = Board(
        title=payload.title,
        description=payload.description,
        color=payload.color,
        owner_id=current_user.id,  # 从 token 拿，防伪造
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/{board_id}", response_model=BoardDetailResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取看板详情（含列概要）。"""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    # 权限：只有所有者能查看
    if board.owner_id != current_user.id:
        raise HTTPException(403, "无权访问此看板")
    return board

@router.patch("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    payload: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新看板。"""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != current_user.id:
        raise HTTPException(403, "无权修改此看板")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(board, key, value)
    db.commit()
    db.refresh(board)
    return board

@router.delete("/{board_id}", status_code=204)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除看板（级联删除列和卡片）。"""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != current_user.id:
        raise HTTPException(403, "无权删除此看板")

    db.delete(board)  # 级联删除由 ORM 处理
    db.commit()
    # 204 No Content：成功但不返回 body
\`\`\`

## 四、Demo：Board CRUD 完整测试

\`\`\`python
# Demo：Board CRUD 完整流程（含权限校验）
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# ===== 基础设施 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# ===== 模型 =====
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), default=None)
    color: Mapped[str] = mapped_column(String(20), default="blue")
    owner_id: Mapped[int] = mapped_column()
    archived: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

Base.metadata.create_all(engine)

# ===== Schemas =====
class BoardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    color: str = Field(default="blue", pattern="^(blue|green|red|yellow)$")

class BoardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    color: str | None = Field(default=None, pattern="^(blue|green|red|yellow)$")
    archived: bool | None = None

class BoardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    color: str
    owner_id: int
    archived: bool
    model_config = ConfigDict(from_attributes=True)

# ===== 依赖 =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 模拟当前用户依赖（简化版，直接用 query 参数 user_id）
def get_current_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "未登录")
    return user

# ===== 路由 =====
app = FastAPI()

@app.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(
    payload: BoardCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    board = Board(
        title=payload.title,
        description=payload.description,
        color=payload.color,
        owner_id=user.id,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@app.get("/boards", response_model=list[BoardResponse])
def list_boards(
    archived: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(Board).where(Board.owner_id == user.id)
    if not archived:
        stmt = stmt.where(Board.archived == False)
    return db.scalars(stmt).all()

@app.get("/boards/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != user.id:
        raise HTTPException(403, "无权访问")
    return board

@app.patch("/boards/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    payload: BoardUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != user.id:
        raise HTTPException(403, "无权修改")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(board, k, v)
    db.commit()
    db.refresh(board)
    return board

@app.delete("/boards/{board_id}", status_code=204)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != user.id:
        raise HTTPException(403, "无权删除")
    db.delete(board)
    db.commit()

# ===== 测试 =====
client = TestClient(app)

# 先创建两个用户
with SessionLocal() as db:
    alice = User(username="alice")
    bob = User(username="bob")
    db.add_all([alice, bob])
    db.commit()
    print(f"alice.id={alice.id}, bob.id={bob.id}")

# alice 创建看板
print("\\n=== alice 创建看板 ===")
r = client.post("/boards", json={"title": "alice 的工作"}, params={"user_id": 1})
print(f"  owner_id={r.json()['owner_id']}")  # 1 (alice)

# bob 创建看板
print("\\n=== bob 创建看板 ===")
r = client.post("/boards", json={"title": "bob 的学习"}, params={"user_id": 2})
print(f"  owner_id={r.json()['owner_id']}")  # 2 (bob)

# alice 列表只能看到自己的
print("\\n=== alice 的看板列表 ===")
r = client.get("/boards", params={"user_id": 1})
print(f"  数量：{len(r.json())}, 标题：{[b['title'] for b in r.json()]}")

# bob 试图访问 alice 的看板 → 403
print("\\n=== bob 试图访问 alice 的看板 ===")
r = client.get("/boards/1", params={"user_id": 2})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

# alice 更新自己的看板
print("\\n=== alice 更新看板 ===")
r = client.patch("/boards/1", json={"title": "alice 的工作-改名", "archived": True}, params={"user_id": 1})
print(f"  title={r.json()['title']}, archived={r.json()['archived']}")

# 归档后列表看不到
print("\\n=== alice 列表（不含归档）===")
r = client.get("/boards", params={"user_id": 1})
print(f"  数量：{len(r.json())}")

# 包含归档
print("\\n=== alice 列表（含归档）===")
r = client.get("/boards", params={"user_id": 1, "archived": True})
print(f"  数量：{len(r.json())}")

# alice 删除看板
print("\\n=== alice 删除看板 ===")
r = client.delete("/boards/1", params={"user_id": 1})
print(f"  状态码：{r.status_code}")  # 204

# bob 试图删除 alice 的看板（已删）
print("\\n=== bob 试图删除 ===")
r = client.delete("/boards/2", params={"user_id": 1})  # board 2 属于 bob
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")
\`\`\`

## 五、本章小结

- 用 \`APIRouter\` 分组路由，\`prefix\` 自动加前缀
- 权限校验：\`board.owner_id != current_user.id\` → 403
- 204 状态码：删除成功但不返回内容
- 下章实现 Column 的 CRUD`,
  },

  // ============================================================
  // 第 20 章：Column CRUD 接口
  // ============================================================
  {
    id: "ff-column-crud",
    group: "看板核心 CRUD",
    icon: "📈",
    title: "Column CRUD 接口",
    content: `# Column CRUD 接口

## 一、Column 路由规划

\`\`\`
GET    /boards/{board_id}/columns          列出看板下的所有列
POST   /boards/{board_id}/columns          创建列
GET    /columns/{column_id}                获取列详情
PATCH  /columns/{column_id}                更新列
DELETE /columns/{column_id}                删除列
PATCH  /columns/{column_id}/move           移动列（改 position）
\`\`\`

**两种路径风格**：

- \`/boards/{board_id}/columns\`：嵌套路径，体现归属关系
- \`/columns/{column_id}\`：扁平路径，直接操作资源

## 二、完整实现

\`\`\`python
# 文件：backend/app/routers/columns.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Board, Column
from app.schemas import (
    ColumnCreate, ColumnUpdate, ColumnResponse, ColumnMove,
)
from app.deps import get_current_user

router = APIRouter(tags=["列"])

def get_board_if_owned(board_id: int, user: User, db: Session) -> Board:
    """获取看板并校验所有权。"""
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != user.id:
        raise HTTPException(403, "无权操作此看板")
    return board

@router.get("/boards/{board_id}/columns", response_model=list[ColumnResponse])
def list_columns(
    board_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """列出看板的所有列。"""
    get_board_if_owned(board_id, user, db)
    stmt = (
        select(Column)
        .where(Column.board_id == board_id)
        .order_by(Column.position)
    )
    return db.scalars(stmt).all()

@router.post(
    "/boards/{board_id}/columns",
    response_model=ColumnResponse,
    status_code=201,
)
def create_column(
    board_id: int,
    payload: ColumnCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """创建列。不传 position 则追加到末尾。"""
    get_board_if_owned(board_id, user, db)

    # 自动追加 position
    if payload.position is None:
        max_pos = db.scalar(
            select(func.max(Column.position))
            .where(Column.board_id == board_id)
        )
        position = (max_pos or -1) + 1
    else:
        position = payload.position
        # 把 >= position 的列往后挪
        cols_to_shift = db.scalars(
            select(Column).where(
                Column.board_id == board_id,
                Column.position >= position,
            )
        ).all()
        for c in cols_to_shift:
            c.position += 1

    column = Column(
        title=payload.title,
        position=position,
        board_id=board_id,
        wip_limit=payload.wip_limit,
    )
    db.add(column)
    db.commit()
    db.refresh(column)
    return column

@router.patch("/columns/{column_id}", response_model=ColumnResponse)
def update_column(
    column_id: int,
    payload: ColumnUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """更新列。"""
    column = db.get(Column, column_id)
    if not column:
        raise HTTPException(404, "列不存在")
    # 通过列反查看板，校验所有权
    board = db.get(Board, column.board_id)
    if board.owner_id != user.id:
        raise HTTPException(403, "无权修改此列")

    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(column, k, v)
    db.commit()
    db.refresh(column)
    return column

@router.delete("/columns/{column_id}", status_code=204)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """删除列。"""
    column = db.get(Column, column_id)
    if not column:
        raise HTTPException(404, "列不存在")
    board = db.get(Board, column.board_id)
    if board.owner_id != user.id:
        raise HTTPException(403, "无权删除此列")

    deleted_pos = column.position
    board_id = column.board_id
    db.delete(column)
    db.commit()

    # 后面的列往前挪
    after = db.scalars(
        select(Column).where(
            Column.board_id == board_id,
            Column.position > deleted_pos,
        )
    ).all()
    for c in after:
        c.position -= 1
    db.commit()
\`\`\`

## 三、Demo：Column CRUD 完整测试

\`\`\`python
# Demo：Column CRUD（含权限校验）
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, select, func
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# 基础设施 + 模型
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    owner_id: Mapped[int] = mapped_column()

class Column(Base):
    __tablename__ = "columns"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(default=0)
    board_id: Mapped[int] = mapped_column()
    wip_limit: Mapped[int | None] = mapped_column(default=None)

Base.metadata.create_all(engine)

# Schemas
class ColumnCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    position: int | None = Field(default=None, ge=0)
    wip_limit: int | None = Field(default=None, ge=1)

class ColumnUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    position: int | None = Field(default=None, ge=0)

class ColumnResponse(BaseModel):
    id: int
    title: str
    position: int
    board_id: int
    wip_limit: int | None
    model_config = ConfigDict(from_attributes=True)

# 依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "未登录")
    return user

def get_board_if_owned(board_id, user, db):
    board = db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    if board.owner_id != user.id:
        raise HTTPException(403, "无权操作")
    return board

# 路由
app = FastAPI()

@app.post("/boards/{board_id}/columns", response_model=ColumnResponse, status_code=201)
def create_column(
    board_id: int,
    payload: ColumnCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_board_if_owned(board_id, user, db)
    if payload.position is None:
        max_pos = db.scalar(
            select(func.max(Column.position)).where(Column.board_id == board_id)
        )
        position = (max_pos or -1) + 1
    else:
        position = payload.position
        # 后移
        cols = db.scalars(
            select(Column).where(
                Column.board_id == board_id,
                Column.position >= position,
            )
        ).all()
        for c in cols:
            c.position += 1
    column = Column(title=payload.title, position=position, board_id=board_id)
    db.add(column)
    db.commit()
    db.refresh(column)
    return column

@app.get("/boards/{board_id}/columns", response_model=list[ColumnResponse])
def list_columns(
    board_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_board_if_owned(board_id, user, db)
    return db.scalars(
        select(Column).where(Column.board_id == board_id).order_by(Column.position)
    ).all()

@app.delete("/columns/{column_id}", status_code=204)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    col = db.get(Column, column_id)
    if not col:
        raise HTTPException(404, "列不存在")
    board = db.get(Board, col.board_id)
    if board.owner_id != user.id:
        raise HTTPException(403, "无权删除")
    deleted_pos = col.position
    board_id = col.board_id
    db.delete(col)
    db.commit()
    # 后移
    after = db.scalars(
        select(Column).where(
            Column.board_id == board_id,
            Column.position > deleted_pos,
        )
    ).all()
    for c in after:
        c.position -= 1
    db.commit()

# 测试
client = TestClient(app)

with SessionLocal() as db:
    alice = User(username="alice")
    bob = User(username="bob")
    board1 = Board(title="看板1", owner_id=1)
    board2 = Board(title="看板2", owner_id=2)
    db.add_all([alice, bob, board1, board2])
    db.commit()

print("=== 创建列（自动追加 position）===")
for title in ["待办", "进行中", "已完成"]:
    r = client.post(f"/boards/1/columns", json={"title": title}, params={"user_id": 1})
    print(f"  {title}: pos={r.json()['position']}")

print("\\n=== 插入到中间 ===")
r = client.post("/boards/1/columns", json={"title": "审核", "position": 1}, params={"user_id": 1})
print(f"  插入'审核'到 pos=1")

print("\\n=== 列出列（按 pos 排序）===")
r = client.get("/boards/1/columns", params={"user_id": 1})
for c in r.json():
    print(f"  pos={c['position']}: {c['title']}")

print("\\n=== bob 试图在 alice 的看板创建列 ===")
r = client.post("/boards/1/columns", json={"title": "hack"}, params={"user_id": 2})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 删除中间列（自动重排）===")
client.delete("/columns/2", params={"user_id": 1})  # 删"审核"
r = client.get("/boards/1/columns", params={"user_id": 1})
print("  删除后：")
for c in r.json():
    print(f"  pos={c['position']}: {c['title']}")
\`\`\`

## 四、本章小结

- 嵌套路径 \`/boards/{board_id}/columns\` 体现归属
- 创建时自动维护 position（追加或插入）
- 删除时自动重排后续列
- 权限校验：通过列反查看板，检查所有权
- 下章实现 Card 的 CRUD`,
  },

  // ============================================================
  // 第 21 章：Card CRUD 接口
  // ============================================================
  {
    id: "ff-card-crud",
    group: "看板核心 CRUD",
    icon: "🗂️",
    title: "Card CRUD 接口",
    content: `# Card CRUD 接口

## 一、Card 路由规划

\`\`\`
GET    /columns/{column_id}/cards          列出列下的卡片
POST   /columns/{column_id}/cards          创建卡片
GET    /cards/{card_id}                    获取卡片详情
PATCH  /cards/{card_id}                    更新卡片
DELETE /cards/{card_id}                    删除卡片
PATCH  /cards/{card_id}/move               移动卡片（跨列/同列）
\`\`\`

## 二、跨列移动：Card 的核心交互

看板最常用的操作是**拖拽卡片**：

- 同列内移动：改 position
- 跨列移动：改 column_id + position

\`\`\`python
@router.patch("/cards/{card_id}/move")
def move_card(card_id, payload: CardMove):
    # 1. 从原列移除（后面的卡片往前挪）
    # 2. 目标列 >= target_position 的往后挪
    # 3. 更新 card 的 column_id 和 position
\`\`\`

## 三、完整实现

\`\`\`python
# 文件：backend/app/routers/cards.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Board, Column, Card
from app.schemas import CardCreate, CardUpdate, CardResponse, CardMove
from app.deps import get_current_user

router = APIRouter(tags=["卡片"])

def get_column_if_accessible(column_id: int, user: User, db: Session) -> Column:
    """获取列并校验当前用户有权访问（通过列→看板→owner 链）。"""
    column = db.get(Column, column_id)
    if not column:
        raise HTTPException(404, "列不存在")
    board = db.get(Board, column.board_id)
    if board.owner_id != user.id:
        raise HTTPException(403, "无权操作此列")
    return column

@router.post(
    "/columns/{column_id}/cards",
    response_model=CardResponse,
    status_code=201,
)
def create_card(
    column_id: int,
    payload: CardCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """创建卡片。"""
    column = get_column_if_accessible(column_id, user, db)

    # WIP 限制检查
    if column.wip_limit:
        current = db.scalar(
            select(func.count()).select_from(Card)
            .where(Card.column_id == column_id)
        )
        if current >= column.wip_limit:
            raise HTTPException(400, f"超过 WIP 限制（{column.wip_limit}）")

    # position 自动追加
    if payload.position is None:
        max_pos = db.scalar(
            select(func.max(Card.position)).where(Card.column_id == column_id)
        )
        position = (max_pos or -1) + 1
    else:
        position = payload.position
        # 后移
        cards_to_shift = db.scalars(
            select(Card).where(
                Card.column_id == column_id,
                Card.position >= position,
            )
        ).all()
        for c in cards_to_shift:
            c.position += 1

    card = Card(
        title=payload.title,
        description=payload.description,
        position=position,
        column_id=column_id,
        labels=payload.labels,
        priority=payload.priority,
        due_date=payload.due_date,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.patch("/cards/{card_id}/move", response_model=CardResponse)
def move_card(
    card_id: int,
    payload: CardMove,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """移动卡片到指定列的指定位置。"""
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(404, "卡片不存在")
    # 校验原列权限
    get_column_if_accessible(card.column_id, user, db)
    # 校验目标列权限
    target_column = get_column_if_accessible(payload.target_column_id, user, db)

    # WIP 限制检查（目标列）
    if target_column.wip_limit and card.column_id != payload.target_column_id:
        current = db.scalar(
            select(func.count()).select_from(Card)
            .where(Card.column_id == payload.target_column_id)
        )
        if current >= target_column.wip_limit:
            raise HTTPException(400, f"目标列超过 WIP 限制")

    old_column_id = card.column_id
    old_position = card.position
    new_column_id = payload.target_column_id
    new_position = payload.target_position

    # 1. 原列：后面的卡片往前挪
    cards_after = db.scalars(
        select(Card).where(
            Card.column_id == old_column_id,
            Card.position > old_position,
        )
    ).all()
    for c in cards_after:
        c.position -= 1

    # 2. 目标列：>= new_position 的往后挪
    cards_to_shift = db.scalars(
        select(Card).where(
            Card.column_id == new_column_id,
            Card.position >= new_position,
        )
    ).all()
    for c in cards_to_shift:
        c.position += 1

    # 3. 更新卡片
    card.column_id = new_column_id
    card.position = new_position
    db.commit()
    db.refresh(card)
    return card

@router.delete("/cards/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """删除卡片。"""
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(404, "卡片不存在")
    get_column_if_accessible(card.column_id, user, db)

    old_column_id = card.column_id
    old_position = card.position
    db.delete(card)
    db.commit()

    # 后面的卡片往前挪
    after = db.scalars(
        select(Card).where(
            Card.column_id == old_column_id,
            Card.position > old_position,
        )
    ).all()
    for c in after:
        c.position -= 1
    db.commit()
\`\`\`

## 四、Demo：Card CRUD + 跨列移动

\`\`\`python
# Demo：Card 完整 CRUD（含跨列移动）
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, Text, select, func, JSON
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# 基础设施
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column()

class Column(Base):
    __tablename__ = "columns"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(default=0)
    board_id: Mapped[int] = mapped_column()
    wip_limit: Mapped[int | None] = mapped_column(default=None)

class Card(Base):
    __tablename__ = "cards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    position: Mapped[int] = mapped_column(default=0)
    column_id: Mapped[int] = mapped_column()
    labels: Mapped[list] = mapped_column(JSON, default=list)
    priority: Mapped[int] = mapped_column(default=0)

Base.metadata.create_all(engine)

# Schemas
class CardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    labels: list[str] = []
    priority: int = Field(default=0, ge=0, le=2)

class CardResponse(BaseModel):
    id: int
    title: str
    description: str | None
    position: int
    column_id: int
    labels: list
    priority: int
    model_config = ConfigDict(from_attributes=True)

class CardMove(BaseModel):
    target_column_id: int
    target_position: int = Field(ge=0)

# 依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "未登录")
    return user

# 路由（简化，省略权限校验细节）
app = FastAPI()

@app.post("/columns/{column_id}/cards", response_model=CardResponse, status_code=201)
def create_card(
    column_id: int,
    payload: CardCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    max_pos = db.scalar(
        select(func.max(Card.position)).where(Card.column_id == column_id)
    )
    position = (max_pos or -1) + 1
    card = Card(
        title=payload.title,
        description=payload.description,
        position=position,
        column_id=column_id,
        labels=payload.labels,
        priority=payload.priority,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@app.get("/columns/{column_id}/cards", response_model=list[CardResponse])
def list_cards(column_id: int, db: Session = Depends(get_db)):
    return db.scalars(
        select(Card).where(Card.column_id == column_id).order_by(Card.position)
    ).all()

@app.patch("/cards/{card_id}/move", response_model=CardResponse)
def move_card(
    card_id: int,
    payload: CardMove,
    db: Session = Depends(get_db),
):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(404, "卡片不存在")
    old_col = card.column_id
    old_pos = card.position
    new_col = payload.target_column_id
    new_pos = payload.target_position

    # 原列后挪
    for c in db.scalars(
        select(Card).where(Card.column_id == old_col, Card.position > old_pos)
    ).all():
        c.position -= 1
    # 目标列前移
    for c in db.scalars(
        select(Card).where(Card.column_id == new_col, Card.position >= new_pos)
    ).all():
        c.position += 1
    card.column_id = new_col
    card.position = new_pos
    db.commit()
    db.refresh(card)
    return card

# 测试
client = TestClient(app)

# 准备数据
with SessionLocal() as db:
    db.add(User(id=1))
    db.add(Board(id=1, owner_id=1))
    db.add_all([
        Column(id=1, title="待办", position=0, board_id=1),
        Column(id=2, title="进行中", position=1, board_id=1),
        Column(id=3, title="已完成", position=2, board_id=1),
    ])
    db.commit()

# 创建卡片
print("=== 在'待办'列创建 3 张卡片 ===")
for title in ["任务A", "任务B", "任务C"]:
    r = client.post("/columns/1/cards", json={"title": title, "labels": ["前端"]})
    print(f"  {r.json()['title']}: pos={r.json()['position']}, col={r.json()['column_id']}")

# 列出
print("\\n=== '待办'列的卡片 ===")
r = client.get("/columns/1/cards")
for c in r.json():
    print(f"  pos={c['position']}: {c['title']} labels={c['labels']}")

# 跨列移动：把任务B移到"进行中"列的 pos=0
print("\\n=== 把任务B移到'进行中' ===")
r = client.patch("/cards/2/move", json={"target_column_id": 2, "target_position": 0})
print(f"  移动后：col={r.json()['column_id']}, pos={r.json()['position']}")

# 验证'待办'列重排
print("\\n=== '待办'列（B 移走后重排）===")
r = client.get("/columns/1/cards")
for c in r.json():
    print(f"  pos={c['position']}: {c['title']}")

# 验证'进行中'列
print("\\n=== '进行中'列 ===")
r = client.get("/columns/2/cards")
for c in r.json():
    print(f"  pos={c['position']}: {c['title']}")

# 再移一张到'进行中'的 pos=0（插入到最前）
print("\\n=== 把任务A也移到'进行中' pos=0 ===")
r = client.patch("/cards/1/move", json={"target_column_id": 2, "target_position": 0})
print(f"  移动后：col={r.json()['column_id']}, pos={r.json()['position']}")

print("\\n=== '进行中'列最终状态 ===")
r = client.get("/columns/2/cards")
for c in r.json():
    print(f"  pos={c['position']}: {c['title']}")
\`\`\`

## 五、本章小结

- Card CRUD 与 Column 类似，多了跨列移动
- \`/cards/{id}/move\` 专用接口处理跨列移动
- 移动逻辑：原列后挪 + 目标列前移 + 更新卡片
- WIP 限制：创建/移动时检查
- 至此看板核心 CRUD 完整！下章进入高级特性`,
  },
];
