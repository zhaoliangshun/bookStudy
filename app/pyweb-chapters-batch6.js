// =============================================================
// Python Web 应用开发实战教程 - 第 6 批章节(Django 模型 4 章)
// -------------------------------------------------------------
// 本批包含 4 章:
//   django-model             : Django ORM 模型定义
//   django-queryset          : QuerySet 查询 API
//   django-model-relationship: 模型关系:一对多/多对多
//   django-admin             : Django Admin 后台
//
// 教程定位:纯阅读型,代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」,ORM 用法会变,数据建模思想长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 21 章:Django ORM 模型定义
  // ============================================================
  {
    id: "django-model",
    group: "Django 模型",
    icon: "🗃️",
    title: "Django ORM 模型定义",
    content: `# Django ORM 模型定义

## Model 是什么

Django 的 Model 是「数据模型」,本质是一个继承 \`models.Model\` 的 Python 类。**一个 Model 类对应数据库里的一张表,类的每个属性对应一个字段(列)**。

你写 Python 类,Django 自动帮你:

1. 生成建表 SQL(\`makemigrations\` + \`migrate\`)。
2. 提供查询 API(\`Post.objects.all()\`)。
3. 处理类型转换(Python 对象 ↔ 数据库行)。

这样你全程用 Python 操作数据库,几乎不用写 SQL——这就是 ORM(Object-Relational Mapping,对象关系映射)。

\`\`\`python
# 你写的 Python 类
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# Django 自动生成的建表 SQL(简化版)
# CREATE TABLE blog_post (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     title VARCHAR(200) NOT NULL,
#     content TEXT NOT NULL,
#     created_at DATETIME NOT NULL
# );
\`\`\`

ORM 的好处是「数据库无关」:同一份 Model 代码,开发用 SQLite,生产切 PostgreSQL,只改 \`settings.py\` 不改 Model。

## 定义第一个模型

\`\`\`python
# blog/models.py
from django.db import models

class Post(models.Model):
    # 字段 = 字段类型(属性)
    title = models.CharField(max_length=200, verbose_name="标题")
    content = models.TextField(verbose_name="正文")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    # __str__ 定义对象在后台/打印时的显示
    def __str__(self):
        return self.title

    # Meta 内部类:模型元数据
    class Meta:
        ordering = ["-created_at"]   # 默认按创建时间倒序
        verbose_name = "文章"        # 单数名
        verbose_name_plural = "文章" # 复数名(中文通常相同)
        db_table = "blog_post"       # 自定义表名(默认 blog_post)
\`\`\`

注意:

- **不需要显式定义 \`id\` 字段**,Django 自动加一个自增主键(除非你用 \`primary_key=True\` 自定义)。
- 表名默认是 \`应用名_模型名小写\`,如 \`blog_post\`。
- \`__str__\` 必须返回字符串,它决定对象在 Admin、shell 里怎么显示。

## 字段类型大全

Django 提供几十种字段类型,常用如下:

### 文本类

| 字段 | 数据库类型 | 用途 | 必填参数 |
|---|---|---|---|
| \`CharField\` | VARCHAR | 短文本(标题、姓名) | \`max_length\` |
| \`TextField\` | TEXT/LONGTEXT | 长文本(正文、描述) | 无 |
| \`SlugField\` | VARCHAR | URL 友好字符串(hello-world) | \`max_length\`(默认 50) |
| \`EmailField\` | VARCHAR | 邮箱(带校验) | \`max_length\` |
| \`URLField\` | VARCHAR | URL(带校验) | \`max_length\` |
| \`UUIDField\` | CHAR(32) | UUID | 无 |

### 数字类

| 字段 | 数据库类型 | 用途 |
|---|---|---|
| \`IntegerField\` | INT | 普通整数 |
| \`BigIntegerField\` | BIGINT | 大整数(到 9e18) |
| \`SmallIntegerField\` | SMALLINT | 小整数(-32768~32767) |
| \`PositiveIntegerField\` | INT UNSIGNED | 正整数 |
| \`FloatField\` | FLOAT | 浮点数 |
| \`DecimalField\` | DECIMAL | 定点数(金额等) | \`max_digits\` \`decimal_places\` |

\`\`\`python
class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # 最多 8 位整数 + 2 位小数
    stock = models.PositiveIntegerField(default=0)
\`\`\`

### 时间类

| 字段 | 用途 |
|---|---|
| \`DateField\` | 日期(年月日) |
| \`DateTimeField\` | 日期时间(年月日时分秒) |
| \`TimeField\` | 时间(时分秒) |
| \`DurationField\` | 时间间隔(timedelta) |

\`\`\`python
class Post(models.Model):
    # auto_now_add=True: 创建对象时自动设为当前时间(只一次)
    created_at = models.DateTimeField(auto_now_add=True)
    # auto_now=True: 每次 save() 都更新为当前时间
    updated_at = models.DateTimeField(auto_now=True)
    # 手动指定的日期
    published_at = models.DateTimeField(null=True, blank=True)
\`\`\`

### 布尔、二进制、文件

| 字段 | 用途 |
|---|---|
| \`BooleanField\` | True/False |
| \`NullBooleanField\`(已废弃,用 \`BooleanField(null=True)\`) | True/False/None |
| \`BinaryField\` | 原始字节(图片二进制等,慎用) |
| \`FileField\` | 文件上传 |
| \`ImageField\` | 图片上传(需 Pillow) |
| \`FilePathField\` | 文件系统路径选择 |

### 关系类(下一章详讲)

| 字段 | 用途 |
|---|---|
| \`ForeignKey\` | 一对多(外键) |
| \`OneToOneField\` | 一对一 |
| \`ManyToManyField\` | 多对多 |

### 选择类

| 字段 | 用途 |
|---|---|
| \`choices\` | 枚举值(不是字段类型,是 CharField 的属性) |

\`\`\`python
class Post(models.Model):
    # 用 choices 限制取值范围
    STATUS_DRAFT = "draft"
    STATUS_PUBLISHED = "published"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "草稿"),
        (STATUS_PUBLISHED, "已发布"),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT)

# 使用时
post = Post.objects.get(pk=1)
post.status                # "published"
post.get_status_display()  # "已发布"(自动生成的方法)
\`\`\`

Django 3.x 后推荐用 \`TextChoices\`/\`IntegerChoices\` 写得更优雅:

\`\`\`python
from django.db import models

class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "草稿"
        PUBLISHED = "published", "已发布"

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
    )
\`\`\`

## 字段通用属性

所有字段都支持的属性:

| 属性 | 含义 | 默认 |
|---|---|---|
| \`null\` | 数据库是否允许 NULL | False |
| \`blank\` | 表单是否允许空(校验用) | False |
| \`default\` | 默认值 | 无 |
| \`choices\` | 可选值列表 | 无 |
| \`verbose_name\` | 人类可读名 | 字段名 |
| \`help_text\` | 表单提示文字 | 无 |
| \`unique\` | 是否唯一 | False |
| \`db_index\` | 是否建索引 | False |
| \`editable\` | 是否可在表单/Admin 编辑 | True |
| \`primary_key\` | 是否主键 | False |

⚠️ **null 和 blank 的区别**(最常混淆):

- \`null=True\`:**数据库层面**允许该字段为 NULL(空)。
- \`blank=True\`:**表单校验层面**允许提交空值(不影响数据库)。

\`\`\`python
class Post(models.Model):
    # 标题:必填,数据库 NOT NULL
    title = models.CharField(max_length=200)
    # 副标题:可空,数据库允许 NULL,表单也可留空
    subtitle = models.CharField(max_length=200, null=True, blank=True)
    # 摘要:表单可留空,但数据库存空字符串(CharField 不推荐 null=True)
    summary = models.CharField(max_length=500, blank=True, default="")
\`\`\`

经验法则:

- **字符串字段(CharField/TextField)不要用 \`null=True\`**,用 \`blank=True, default=""\`。否则会出现「空字符串」和「NULL」两种「空」,查询时要 \`Q(field="") | Q(field__isnull=True)\`,麻烦。
- **数字、日期字段**用 \`null=True\` 表示「没有值」。

## __str__ 方法

\`__str__\` 决定对象在 Admin、shell、日志里怎么显示,**强烈建议每个 Model 都写**:

\`\`\`python
class Post(models.Model):
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.title} (#{self.id})"
        # 必须返回 str,f-string 是最佳选择

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.CharField(max_length=50)
    content = models.TextField()

    def __str__(self):
        return f"{self.author} 评论了 {self.post.title}"
\`\`\`

注意:上面 f-string 里的 \`{self.title}\` 是 Python 花括号,**不是** JS 的 \`\${...}\`,所以不会和 JS 模板字符串冲突。但在 JS 模板字符串里写字面量时,花括号前如果有 \`$\` 才需要警惕。这里没有 \`$\`,安全。

## Meta 内部类

\`Meta\` 类放模型的「元数据」(不是字段的配置):

\`\`\`python
class Post(models.Model):
    # ... 字段 ...

    class Meta:
        # 默认排序:created_at 倒序(最新在前)
        ordering = ["-created_at"]
        # 多字段排序:先按 published_at,再按 id
        # ordering = ["-published_at", "id"]

        # 自定义表名
        db_table = "blog_posts"

        # 后台显示名
        verbose_name = "文章"
        verbose_name_plural = "文章列表"

        # 复合唯一约束:同一作者标题不能重复
        constraints = [
            models.UniqueConstraint(
                fields=["author", "title"],
                name="unique_author_title",
            ),
        ]

        # 联合索引(查询优化)
        indexes = [
            models.Index(fields=["-created_at"], name="idx_created_at"),
            models.Index(fields=["status", "-created_at"], name="idx_status_created"),
        ]
\`\`\`

⚠️ \`ordering\` 有副作用:每次 \`Post.objects.all()\` 都会加 \`ORDER BY\`,如果不需要排序会拖慢查询。可用 \`Post.objects.all().order_by()\` 显式取消。

## 迁移(migrations)

Model 改了之后,要让数据库跟上变化,需要两步:

\`\`\`bash
# 第 1 步:生成迁移文件(对比当前 Model 和上次迁移的差异,生成 Python 文件)
python manage.py makemigrations

# 输出:
# Migrations for 'blog':
#   blog/migrations/0001_initial.py
#     - Create model Post

# 第 2 步:应用迁移(执行迁移文件里的 SQL)
python manage.py migrate

# 输出:
# Applying blog.0001_initial... OK
\`\`\`

迁移文件是版本控制数据库结构的「Git」:

- \`makemigrations\` = \`git add\`(检测变化)。
- \`migrate\` = \`git commit\`(应用变化)。
- 迁移文件(\`0001_initial.py\` 等)要提交到 Git,队友拉代码后执行 \`migrate\` 即可同步数据库结构。

常用命令:

\`\`\`bash
# 查看迁移状态(哪些已应用,哪些未应用)
python manage.py showmigrations

# 看迁移会执行什么 SQL(不真的执行)
python manage.py sqlmigrate blog 0001

# 回滚到某个迁移
python manage.py migrate blog 0002

# 假装执行(更新迁移记录但不真改库,慎用)
python manage.py migrate --fake blog 0001
\`\`\`

## 完整示例:博客 Post/Comment/Tag 模型

\`\`\`python
# blog/models.py
from django.db import models
from django.contrib.auth.models import User

class Tag(models.Model):
    """标签:多对多关联文章"""
    name = models.CharField(max_length=30, unique=True, verbose_name="标签名")
    slug = models.SlugField(max_length=30, unique=True, verbose_name="URL别名")

    class Meta:
        ordering = ["name"]
        verbose_name = "标签"
        verbose_name_plural = "标签"

    def __str__(self):
        return self.name

class Post(models.Model):
    """文章"""
    class Status(models.TextChoices):
        DRAFT = "draft", "草稿"
        PUBLISHED = "published", "已发布"

    title = models.CharField(max_length=200, verbose_name="标题")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="URL别名")
    content = models.TextField(verbose_name="正文")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name="状态",
    )
    views = models.PositiveIntegerField(default=0, verbose_name="浏览量")

    # 关系字段
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts",
        verbose_name="作者",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts", verbose_name="标签")

    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="发布时间")

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "文章"
        verbose_name_plural = "文章"
        indexes = [
            models.Index(fields=["-published_at"], name="idx_published"),
            models.Index(fields=["status", "-published_at"], name="idx_status_pub"),
        ]

    def __str__(self):
        return self.title

    # 自定义方法:增加浏览量
    def increase_views(self):
        self.views += 1
        self.save(update_fields=["views"])  # 只更新 views 字段,避免并发覆盖

class Comment(models.Model):
    """评论:外键关联文章"""
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="文章",
    )
    author = models.CharField(max_length=50, verbose_name="评论者")
    content = models.TextField(verbose_name="评论内容")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="评论时间")
    active = models.BooleanField(default=True, verbose_name="是否显示")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "评论"
        verbose_name_plural = "评论"

    def __str__(self):
        return f"{self.author} 评论 {self.post.title}"
\`\`\`

\`\`\`bash
# 生成并应用迁移
python manage.py makemigrations
python manage.py migrate
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 改了 Model 没生效 | 忘 makemigrations + migrate | 两步都执行 |
| CharField 用 null=True | 出现两种「空」 | 用 blank=True, default="" |
| 忘了写 __str__ | 后台显示 Post object (1) | 加 __str__ 方法 |
| makemigrations 报 No changes | 没改 Model 或没注册 App | 检查 INSTALLED_APPS |
| 迁移冲突(队友都建了迁移) | 0004 撞号 | merge 迁移: makemigrations --merge |
| DateTimeField 漏时区 | 时间显示不对 | settings 配 TIME_ZONE + USE_TZ=True |
| DecimalField 用 FloatField | 金额算错精度 | 金额用 DecimalField |
| on_delete 没指定 | 报错 | 必填,常用 CASCADE/SET_NULL |
| 迁移文件没提交 git | 队友数据库不同步 | 迁移文件必须入库 |
| Meta.ordering 拖慢 | 每次查询都排序 | 不需要的用 .order_by() |

## 设计思想

Django ORM 的设计思想是「**用 Python 类描述数据结构,让数据库细节对开发者透明**」。Model 既是数据结构的定义,也是操作数据的接口。这种「数据即代码」的方式让数据库 schema 和代码一起版本控制,避免「数据库漂移」。理解 Model 的关键不在记字段类型,而在理解「字段类型 ↔ 数据库类型 ↔ Python 类型」的三层映射,以及 null/blank/choices 这些属性分别作用于哪一层(数据库层、表单层、还是值域层)。
`,
  },

  // ============================================================
  // 第 22 章:QuerySet 查询 API
  // ============================================================
  {
    id: "django-queryset",
    group: "Django 模型",
    icon: "🔍",
    title: "QuerySet 查询 API",
    content: `# QuerySet 查询 API

## QuerySet 是什么

\`QuerySet\` 是 Django ORM 查询的核心概念,它是「**数据库查询的惰性集合**」。理解三点:

- **集合**:代表多条记录,可以像列表一样迭代、切片、统计。
- **惰性**:**只有真正要用数据时才查数据库**。你写 \`Post.objects.all().filter(...).order_by(...)\` 时,SQL 还没执行;直到迭代、\`len()\`、\`list()\` 时才发 SQL。
- **链式调用**:每个查询方法返回新的 QuerySet,可以一直 \`.\` 下去。

\`\`\`python
# 这一行不会查数据库!只是构建查询
qs = Post.objects.filter(status="published").order_by("-created_at")

# 这时才真正查
for post in qs:        # 触发查询
    print(post.title)

# 或者
print(len(qs))         # 触发 COUNT 查询
print(list(qs))        # 触发 SELECT 查询
\`\`\`

惰性是性能优化的关键:你可以放心地「先组合查询,再决定要不要执行」,中间环节不浪费 I/O。

## Manager 与 objects

每个 Model 类都有一个 \`objects\` 属性,叫 **Manager**(管理器),是查询入口。

\`\`\`python
Post.objects        # Manager 对象
Post.objects.all()  # QuerySet
Post.objects.get(pk=1)  # Post 实例(不是 QuerySet)
\`\`\`

可以自定义 Manager 加业务方法:

\`\`\`python
class PublishedManager(models.Manager):
    def get_queryset(self):
        # 默认只返回已发布文章
        return super().get_queryset().filter(status="published")

class Post(models.Model):
    # ... 字段 ...
    objects = models.Manager()         # 默认 manager(重命名)
    published = PublishedManager()     # 自定义 manager

# 使用
Post.published.all()     # 只返回已发布
Post.objects.all()       # 返回所有(含草稿)
\`\`\`

## 基本查询

### 1. all():查全部

\`\`\`python
posts = Post.objects.all()   # 所有记录(QuerySet,惰性)
\`\`\`

### 2. get():查单条(必须唯一)

\`\`\`python
post = Post.objects.get(pk=1)             # 按主键
post = Post.objects.get(slug="hello")     # 按 slug
post = Post.objects.get(title="测试")     # 按 title

# ⚠️ get 找不到会抛 DoesNotExist
# ⚠️ get 找到多条会抛 MultipleObjectsReturned
\`\`\`

更安全的写法用 \`get_object_or_404\`:

\`\`\`python
from django.shortcuts import get_object_or_404

# 找不到返回 404,而不是抛异常
post = get_object_or_404(Post, pk=pk)
\`\`\`

### 3. filter():过滤(返回 QuerySet)

\`\`\`python
# 等于
Post.objects.filter(status="published")

# 多条件 AND
Post.objects.filter(status="published", author=user)

# 链式(等价于上面的 AND)
Post.objects.filter(status="published").filter(author=user)
\`\`\`

### 4. exclude():排除

\`\`\`python
# 排除草稿
Post.objects.exclude(status="draft")

# 已发布且不是某个作者
Post.objects.filter(status="published").exclude(author=bad_user)
\`\`\`

### 5. first()/last():取首/尾

\`\`\`python
post = Post.objects.order_by("-created_at").first()  # 最新一篇(没有返回 None)
post = Post.objects.order_by("created_at").last()   # 最早一篇
\`\`\`

### 6. count():计数

\`\`\`python
Post.objects.count()                       # 总数
Post.objects.filter(status="published").count()  # 已发布数
# 比 len(Post.objects.all()) 高效,因为 count() 用 SELECT COUNT(*)
\`\`\`

### 7. exists():是否存在

\`\`\`python
if Post.objects.filter(title="测试").exists():
    print("已存在")
# 比 if Post.objects.filter(...).count() > 0 高效
\`\`\`

## 字段查找(Lookups)

\`filter\`/\`exclude\` 的参数支持「字段名__查找类型」语法:

\`\`\`python
# 精确等于(默认)
Post.objects.filter(title="Hello")

# 大小写敏感包含
Post.objects.filter(title__contains="Hello")
Post.objects.filter(title__icontains="hello")  # i = ignore case

# 开头/结尾
Post.objects.filter(title__startswith="Hello")
Post.objects.filter(title__istartswith="hello")
Post.objects.filter(title__endswith="world")

# 大于/小于
Post.objects.filter(views__gt=100)       # > 100
Post.objects.filter(views__gte=100)       # >= 100
Post.objects.filter(views__lt=100)        # < 100
Post.objects.filter(views__lte=100)       # <= 100

# 在范围内
Post.objects.filter(id__in=[1, 2, 3, 5, 8])

# 时间范围
from django.utils import timezone
from datetime import timedelta
now = timezone.now()
Post.objects.filter(created_at__gte=now - timedelta(days=7))  # 最近 7 天
Post.objects.filter(created_at__year=2024)
Post.objects.filter(created_at__month=6)
Post.objects.filter(created_at__date__gte="2024-06-01")

# 是否为空
Post.objects.filter(published_at__isnull=True)   # NULL
Post.objects.filter(published_at__isnull=False)  # 非 NULL

# 精确时间
Post.objects.filter(created_at__date="2024-06-15")
Post.objects.filter(created_at__date__range=["2024-06-01", "2024-06-30"])
\`\`\`

## 排序、切片、去重

### order_by():排序

\`\`\`python
Post.objects.order_by("created_at")         # 升序(旧→新)
Post.objects.order_by("-created_at")        # 降序(新→旧)
Post.objects.order_by("author", "-created_at")  # 多字段排序

# 随机
Post.objects.order_by("?")[:1]   # 随机一篇(性能差,慎用于大表)
\`\`\`

### 切片(限制结果)

\`\`\`python
Post.objects.all()[:10]        # 前 10 条(LIMIT 10)
Post.objects.all()[5:15]       # 第 6~15 条(LIMIT 10 OFFSET 5)
Post.objects.all()[:1][0]      # 第一条(等价 .first())

# ⚠️ 不支持负索引
# Post.objects.all()[-1]  # 报错 AssertionError
\`\`\`

### distinct():去重

\`\`\`python
# 有评论的文章作者(去重)
Post.objects.filter(comments__isnull=False).distinct().values_list("author", flat=True)
\`\`\`

## 聚合与分组

### aggregate():聚合(返回字典)

\`\`\`python
from django.db.models import Count, Sum, Avg, Max, Min

# 单个聚合
Post.objects.aggregate(total=Count("id"))
# {'total': 42}

# 多个聚合
Post.objects.aggregate(
    total=Count("id"),
    avg_views=Avg("views"),
    max_views=Max("views"),
    min_views=Min("views"),
)
# {'total': 42, 'avg_views': 123.4, 'max_views': 9999, 'min_views': 0}
\`\`\`

### annotate():分组(给每条记录附加聚合值)

\`\`\`python
from django.db.models import Count

# 每篇文章的评论数
posts = Post.objects.annotate(comment_count=Count("comments"))
for post in posts:
    print(post.title, post.comment_count)  # 直接读附加字段

# 按作者分组,统计每人写了多少篇
from django.contrib.auth.models import User
authors = User.objects.annotate(post_count=Count("posts"))
for author in authors:
    print(author.username, author.post_count)
\`\`\`

\`aggregate\` vs \`annotate\`:

- \`aggregate\`:对**整个 QuerySet**算一个值(总数、平均),返回 dict。
- \`annotate\`:给**每条记录**附加一个聚合字段,返回 QuerySet。

## 关联查询

### 正向查询(从有外键的一方)

\`\`\`python
post = Post.objects.get(pk=1)
post.author             # 作者对象(User)
post.author.username    # 跨表取字段

post.tags.all()         # 多对多:所有标签(QuerySet)
post.comments.all()     # 反向一对多:所有评论
post.comments.count()   # 评论数
\`\`\`

### 跨表过滤

\`\`\`python
# 查「作者是 admin 的文章」(双下划线跨表)
Post.objects.filter(author__username="admin")

# 查「标签包含 python 的文章」
Post.objects.filter(tags__name="python")

# 查「有评论的文章」
Post.objects.filter(comments__isnull=False).distinct()

# 查「评论内容包含 "好" 的文章」
Post.objects.filter(comments__content__contains="好")
\`\`\`

### 反向查询

\`\`\`python
user = User.objects.get(username="admin")
# 反向查询用 <model>_set(没指定 related_name 时)
user.post_set.all()        # 该用户所有文章
user.post_set.filter(status="published")

# 如果 ForeignKey 指定了 related_name="posts"
user.posts.all()           # 用 related_name
user.posts.filter(status="published")
\`\`\`

## F 表达式:字段间比较

\`F()\` 引用字段值,用于「字段和字段比较」或「原子自增」:

\`\`\`python
from django.db.models import F

# 字段间比较:库存大于销量的商品
Product.objects.filter(stock__gt=F("sales"))

# 原子自增(避免并发覆盖)
post = Post.objects.get(pk=1)
post.views = F("views") + 1   # SQL 层面 +1,不是 Python 层面
post.save()
# 等价 UPDATE blog_post SET views = views + 1 WHERE id = 1

# 批量更新
Post.objects.filter(status="draft").update(status="archived")
\`\`\`

## Q 对象:复杂条件(OR/NOT)

\`filter\` 默认是 AND。要 OR、NOT 用 \`Q\`:

\`\`\`python
from django.db.models import Q

# OR:标题或正文包含 python
Post.objects.filter(
    Q(title__icontains="python") | Q(content__icontains="python")
)

# NOT:不是草稿
Post.objects.filter(~Q(status="draft"))

# 组合:(已发布 OR 作者 admin) 且 不含某标签
Post.objects.filter(
    (Q(status="published") | Q(author__username="admin"))
    & ~Q(tags__name="广告")
)
\`\`\`

\`Q\` 用 \`|\` \`&\` \`~\` 表示 OR/AND/NOT。

## select_related / prefetch_related:解决 N+1

**N+1 问题**是 ORM 最常见的性能坑:

\`\`\`python
# ❌ N+1 问题:查 N 篇文章,会发 1+N 条 SQL
posts = Post.objects.all()[:10]      # 1 条 SQL:查 10 篇文章
for post in posts:
    print(post.author.username)       # 每次循环 1 条 SQL:查作者 → 共 10 条

# 总计 1 + 10 = 11 条 SQL
\`\`\`

### select_related:外键/一对一(JOIN)

\`\`\`python
# ✅ 用 select_related 一次性 JOIN 查出
posts = Post.objects.select_related("author")[:10]  # 1 条 SQL(JOIN user 表)
for post in posts:
    print(post.author.username)        # 不再查库

# 多层:select_related("author__profile")
posts = Post.objects.select_related("author", "category")
\`\`\`

\`select_related\` 用 SQL JOIN,一次查询拿到所有数据。适合**外键、一对一**(单值关系)。

### prefetch_related:多对多/反向(分开查)

\`\`\`python
# ✅ 多对多用 prefetch_related(分两次查,再在 Python 里关联)
posts = Post.objects.prefetch_related("tags")[:10]
for post in posts:
    print(post.tags.all())            # 不再查库

# 反向一对多也用 prefetch_related
users = User.objects.prefetch_related("posts")
for user in users:
    print(user.posts.count())
\`\`\`

\`prefetch_related\` 用「分两次查 + Python 拼接」,适合**多对多、反向一对多**(多值关系)。

### 组合使用

\`\`\`python
# 同时优化外键和多对多
posts = (
    Post.objects
    .select_related("author", "category")
    .prefetch_related("tags", "comments")
    .filter(status="published")[:20]
)
\`\`\`

## 创建、更新、删除

\`\`\`python
# 创建
post = Post.objects.create(
    title="Hello",
    content="...",
    author=user,
)
# 或
post = Post(title="...", author=user)
post.save()

# 更新
post.title = "New Title"
post.save()  # 更新所有字段
post.save(update_fields=["title"])  # 只更新 title(性能好)

# 批量更新
Post.objects.filter(status="draft").update(status="archived")

# 删除
post.delete()                              # 删单条
Post.objects.filter(views=0).delete()      # 批量删

# 批量创建(比循环 create 快)
Post.objects.bulk_create([
    Post(title="A", author=user),
    Post(title="B", author=user),
    Post(title="C", author=user),
])
\`\`\`

## 完整示例:博客查询

\`\`\`python
from django.db.models import Count, Q, F
from django.shortcuts import get_object_or_404
from .models import Post, Tag

# 1. 首页:最新 10 篇已发布文章(带作者和标签)
def get_recent_posts():
    return (
        Post.objects
        .select_related("author")
        .prefetch_related("tags")
        .filter(status="published")
        .order_by("-published_at")[:10]
    )

# 2. 热门文章:浏览量前 5
def get_hot_posts():
    return (
        Post.objects
        .filter(status="published", views__gte=100)
        .order_by("-views")[:5]
    )

# 3. 搜索:标题或正文包含关键词
def search_posts(keyword):
    return (
        Post.objects
        .filter(
            Q(title__icontains=keyword) |
            Q(content__icontains=keyword)
        )
        .filter(status="published")
        .distinct()
    )

# 4. 按标签筛选
def posts_by_tag(slug):
    return (
        Post.objects
        .filter(tags__slug=slug, status="published")
        .select_related("author")
        .order_by("-published_at")
    )

# 5. 每个作者的发文数(分组)
def authors_with_count():
    from django.contrib.auth.models import User
    return (
        User.objects
        .annotate(post_count=Count("posts"))
        .filter(post_count__gt=0)
        .order_by("-post_count")
    )

# 6. 每篇文章带评论数(annotate)
def posts_with_comment_count():
    return (
        Post.objects
        .filter(status="published")
        .annotate(comment_count=Count("comments"))
        .order_by("-comment_count")[:20]
    )

# 7. 浏览量原子自增
def increase_views(post_id):
    Post.objects.filter(pk=post_id).update(views=F("views") + 1)

# 8. 统计:总文章数、总浏览量、平均浏览量
def get_stats():
    from django.db.models import Sum, Avg
    return Post.objects.filter(status="published").aggregate(
        total=Count("id"),
        total_views=Sum("views"),
        avg_views=Avg("views"),
    )

# 9. 归档:按年月分组
def archive_by_month():
    from django.db.models.functions import TruncMonth
    return (
        Post.objects
        .filter(status="published")
        .annotate(month=TruncMonth("published_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("-month")
    )

# 10. 相关文章:共享标签的其他文章
def related_posts(post, limit=5):
    tag_ids = post.tags.values_list("id", flat=True)
    return (
        Post.objects
        .filter(tags__in=tag_ids, status="published")
        .exclude(pk=post.pk)
        .distinct()[:limit]
    )
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| filter 链式不生效 | 没接住返回值 | qs = qs.filter(...) |
| N+1 查询慢 | 循环里访问外键 | select_related/prefetch_related |
| get 找不到抛异常 | 数据不存在 | 用 get_object_or_404 或 filter().first() |
| count() 在循环里 | 每次都查库 | 用 annotate 一次算好 |
| 切片用负索引 | 报错 | 用 .last() 或 order_by 反向 |
| Q 对象混 filter 参数 | 优先级混乱 | 全用 Q 或注意 AND 优先级 |
| bulk_create 不触发 save | 绕过模型方法 | 注意信号和 save 逻辑 |
| update 不触发 save | 同上 | 需要的逻辑用循环 save |
| distinct 后还有重复 | JOIN 笔笛卡尔积 | 配合 values/values_list |
| 跨表过滤忘 distinct | 重复记录 | 多对多过滤后 distinct() |

## 设计思想

QuerySet 的「惰性」是 Django ORM 最优雅的设计:它让你能像写函数式编程一样「组合查询描述」,而真正执行 SQL 的时机由你掌控。这既保留了声明式编程的清晰,又给了性能优化空间。理解 QuerySet 的关键不是背 API,而理解「**构建查询**」和「**执行查询**」是两件事——你写的所有 \`.filter().order_by()\` 都只是构造查询描述,真正发 SQL 的只有少数几个动作:迭代、\`len\`、\`list\`、\`bool\`、切片取值、\`get\`。
`,
  },

  // ============================================================
  // 第 23 章:模型关系:一对多/多对多
  // ============================================================
  {
    id: "django-model-relationship",
    group: "Django 模型",
    icon: "🔗",
    title: "模型关系:一对多/多对多",
    content: `# 模型关系:一对多/多对多

## 三种关系

现实世界的关系无非三种:

- **一对多(1:N)**:一个用户写多篇文章,一篇文章只属于一个用户。最常见。
- **多对多(M:N)**:一篇文章有多个标签,一个标签属于多篇文章。
- **一对一(1:1)**:一个用户对应一个资料卡。

数据库层面,这三种关系分别用:

- 一对多:在「多」的一方加外键(\`ForeignKey\`)。
- 多对多:建中间表(\`ManyToManyField\` 自动建)。
- 一对一:加外键 + 唯一约束(\`OneToOneField\`)。

## 一对多:ForeignKey

\`\`\`python
from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    title = models.CharField(max_length=200)
    # ForeignKey:外键,定义在「多」的一方
    author = models.ForeignKey(
        User,                          # 关联的模型
        on_delete=models.CASCADE,      # 被关联对象删除时的行为
        related_name="posts",          # 反向查询的属性名
        verbose_name="作者",
    )
\`\`\`

### on_delete 选项(必填)

被关联对象删除时,关联对象怎么办:

| 选项 | 行为 | 用途 |
|---|---|---|
| \`CASCADE\` | 一起删除 | 强依赖(用户删了,文章也删) |
| \`PROTECT\` | 报错阻止删除 | 重要数据不能丢 |
| \`SET_NULL\` | 设为 NULL(字段要 null=True) | 软关联(作者删了,文章保留作者为空) |
| \`SET_DEFAULT\` | 设为默认值(要 default=) | 设默认作者 |
| \`SET(value)\` | 设为指定值/回调返回值 | 自定义 |
| \`DO_NOTHING\` | 什么都不做(会破坏数据完整性,慎用) | 不推荐 |

\`\`\`python
class Post(models.Model):
    # 作者删了,文章保留,author 设为 NULL
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="posts"
    )

    # 分类删了,文章归到默认分类
    category = models.ForeignKey(
        Category, on_delete=models.SET_DEFAULT, default=1, related_name="posts"
    )

    # 用户删了,禁止删除(先处理文章)
    author = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="posts"
    )
\`\`\`

### 正向查询(有外键的一方)

\`\`\`python
post = Post.objects.get(pk=1)
post.author              # User 对象(直接访问)
post.author.username     # 跨表取字段
post.author.email        # 跨表取字段
\`\`\`

### 反向查询(被关联的一方)

\`\`\`python
user = User.objects.get(pk=1)

# 没指定 related_name 时:用 <model>_set
user.post_set.all()           # 该用户所有文章
user.post_set.filter(status="published")
user.post_set.count()

# 指定 related_name="posts" 后:用 related_name
user.posts.all()              # 更直观
user.posts.filter(status="published")
user.posts.count()
\`\`\`

### related_name 的作用

\`related_name\` 是「反向查询时的属性名」。强烈建议总是显式指定,原因:

- \`post_set\` 不直观,\`user.posts\` 一眼明白。
- 一个模型有多个外键指向同一模型时,必须用 \`related_name\` 区分。

\`\`\`python
class Post(models.Model):
    # 一个 Post 有两个 User 外键:作者和编辑
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="authored_posts")
    editor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="edited_posts")

# 用法
user.authored_posts.all()   # 他写的文章
user.edited_posts.all()     # 他编辑过的文章
\`\`\`

## 多对多:ManyToManyField

\`\`\`python
class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)

class Post(models.Model):
    title = models.CharField(max_length=200)
    # 多对多:可以定义在任意一方
    tags = models.ManyToManyField(Tag, related_name="posts", blank=True)
\`\`\`

Django 自动创建中间表(名字默认 \`app_post_tags\`),你不用管。

### 操作

\`\`\`python
post = Post.objects.get(pk=1)
tag_python = Tag.objects.get(name="python")

# 添加(单个/多个)
post.tags.add(tag_python)
post.tags.add(tag1, tag2, tag3)
post.tags.add(*[tag1, tag2])  # 解包列表

# 移除
post.tags.remove(tag_python)

# 清空所有
post.tags.clear()

# 赋值(覆盖)
post.tags.set([tag1, tag2])  # 等价 clear + add

# 查询
post.tags.all()              # 该文章所有标签
post.tags.count()
post.tags.filter(name__startswith="py")

# 反向查询(Tag → Posts)
tag = Tag.objects.get(name="python")
tag.posts.all()              # 该标签所有文章(用 related_name)
tag.posts.count()
\`\`\`

### 跨表过滤

\`\`\`python
# 查「带 python 标签的文章」
Post.objects.filter(tags__name="python")

# 查「同时带 python 和 django 标签的文章」
from django.db.models import Q
Post.objects.filter(
    tags__name="python"
).filter(
    tags__name="django"
)
# ⚠️ 不能写 filter(tags__name="python", tags__name="django")
# 因为同一字段的两个条件会被当成「同一个 tag 既叫 python 又叫 django」,无解

# 查「带任一标签的文章」
Post.objects.filter(Q(tags__name="python") | Q(tags__name="django"))
\`\`\`

### 中间模型(through)

默认中间表只有两个外键(\`post_id\`、\`tag_id\`)。如果中间表要存额外信息(如「文章加标签的时间」「加标签的人」),用 \`through\` 自定义中间模型:

\`\`\`python
class PostTag(models.Model):
    """自定义的中间表:带额外信息"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 同一篇文章同一标签只能有一条
        unique_together = [("post", "tag")]

class Post(models.Model):
    # through 指定中间模型
    tags = models.ManyToManyField(Tag, through=PostTag, related_name="posts")
\`\`\`

用 \`through\` 后,\`add\`/\`remove\`/\`set\` 不能直接用(因为 Django 不知道额外字段填什么),要操作中间模型:

\`\`\`python
# ❌ 不能这样(会报错)
# post.tags.add(tag)

# ✅ 要操作中间模型
PostTag.objects.create(post=post, tag=tag, added_by=user)

# 查询仍可用
post.tags.all()           # 照常工作
post.tags.filter(name="python")
\`\`\`

## 一对一:OneToOneField

\`\`\`python
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    website = models.URLField(blank=True)

# 用法
user = User.objects.get(pk=1)
user.profile          # Profile 对象(一对一,直接取)
user.profile.bio

profile = Profile.objects.get(pk=1)
profile.user          # 反向也直接取(不是 _set,因为一对一)
\`\`\`

一对一本质是 \`ForeignKey(unique=True)\`,但语义更明确:「一对一」。常见用途:

- **扩展 User 模型**:User 字段不够,加 Profile 存额外信息。
- **模型拆分**:把不常用的大字段拆到另一张表,按需 join。

## 级联删除实例

理解 \`on_delete\` 最好的方式是看实际行为:

\`\`\`python
# 假设有这样的关系
class Author(models.Model):
    name = models.CharField(max_length=50)

class Post(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="posts")

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()

# 删作者 → 级联删文章 → 级联删评论
author = Author.objects.get(pk=1)
author.delete()
# 一条 SQL 删了:1 个作者 + N 篇文章 + M 条评论
\`\`\`

级联删除很方便但危险:删一个用户可能删掉他所有的文章和评论。生产环境建议:

- 重要数据用 \`PROTECT\` 或软删除(\`is_deleted\` 字段)。
- 大量级联删除可能锁表,用 \`on_delete=DO_NOTHING\` + 异步任务清理。

## 完整示例:博客三表关系

\`\`\`python
# blog/models.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    """分类:一对多关联文章(一篇文章一个分类)"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "分类"
        verbose_name_plural = "分类"

    def __str__(self):
        return self.name

class Tag(models.Model):
    """标签:多对多关联文章"""
    name = models.CharField(max_length=30, unique=True)
    slug = models.SlugField(max_length=30, unique=True)

    class Meta:
        verbose_name = "标签"
        verbose_name_plural = "标签"

    def __str__(self):
        return self.name

class Post(models.Model):
    """文章"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    status = models.CharField(max_length=10, default="draft")

    # 一对多:文章属于一个分类
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,    # 分类删了,文章保留,分类设空
        null=True, blank=True,
        related_name="posts",
        verbose_name="分类",
    )

    # 一对多:文章有一个作者
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,      # 作者删了,文章也删
        related_name="posts",
        verbose_name="作者",
    )

    # 多对多:文章有多个标签
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="posts",
        verbose_name="标签",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Comment(models.Model):
    """评论:一对多关联文章"""
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,      # 文章删了,评论也删
        related_name="comments",
    )
    author = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey(       # 自引用:评论的父评论(树形)
        "self",
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="replies",
    )

    def __str__(self):
        return f"{self.author} → {self.post.title}"
\`\`\`

### 查询示例(串起所有关系)

\`\`\`python
# 1. 某分类下的所有文章
category = Category.objects.get(slug="python")
category.posts.all()                         # 反向一对多
category.posts.count()
category.posts.filter(status="published")

# 2. 某标签的所有文章
tag = Tag.objects.get(slug="django")
tag.posts.all()                              # 反向多对多

# 3. 某作者的所有文章
user.posts.all()                             # 反向(用 related_name)
user.posts.filter(status="published").count()

# 4. 某文章的所有评论
post.comments.all()
post.comments.filter(parent__isnull=True)   # 只取顶层评论

# 5. 某评论的所有回复
comment.replies.all()                        # 自引用反向

# 6. 跨多表:某作者在「python」分类下、带「django」标签的文章
Post.objects.filter(
    author=user,
    category__slug="python",
    tags__slug="django",
).distinct()

# 7. 每个分类的文章数(分组)
from django.db.models import Count
Category.objects.annotate(post_count=Count("posts")).order_by("-post_count")

# 8. 没有标签的文章
Post.objects.filter(tags__isnull=True)

# 9. 评论最多的文章
Post.objects.annotate(c=Count("comments")).order_by("-c").first()

# 10. 优化 N+1:取 10 篇文章带分类、作者、标签、评论数
posts = (
    Post.objects
    .select_related("category", "author")
    .prefetch_related("tags")
    .annotate(comment_count=Count("comments"))
    .filter(status="published")[:10]
)
for post in posts:
    print(post.title, post.category, post.author, post.comment_count, list(post.tags.all()))
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| on_delete 没写 | 报错 | 必填,常用 CASCADE/SET_NULL |
| SET_NULL 没 null=True | 报错 | 加 null=True |
| 多个外键指向同一模型没 related_name | 反向冲突 | 必加 related_name |
| 多对多过滤重复 | 笛卡尔积 | 加 distinct() |
| 「同时带 A 和 B 标签」写成 filter(tags__name=A, tags__name=B) | 逻辑错 | 拆两个 filter 链 |
| through 后用 add() | 报错 | 改用中间模型 create |
| 自引用没加 "self" | 报错 | ForeignKey("self", ...) |
| 一对一反向取不到 | 没创建对应对象 | 报 RelatedObjectDoesNotExist |
| 反向查询用错名字 | 忘了 related_name | 记住 related_name |
| 级联删除误删 | CASCADE 默认行为 | 重要数据用 PROTECT |

## 设计思想

关系建模的本质是「**把现实世界的关联,翻译成数据库的外键结构**」。一对多最常见(把外键放「多」的一方),多对多需要中间表(Django 帮你建),一对一用得少但语义清晰(扩展模型)。理解 Django 关系的关键是分清「正向」(从有外键的一方查,直接属性访问)和「反向」(从被关联的一方查,用 \`_set\` 或 \`related_name\`)。\`related_name\` 不是可有可无的糖,它是大型项目避免反向查询命名冲突的必需品。
`,
  },

  // ============================================================
  // 第 24 章:Django Admin 后台
  // ============================================================
  {
    id: "django-admin",
    group: "Django 模型",
    icon: "👨‍💼",
    title: "Django Admin 后台",
    content: `# Django Admin 后台

## Django Admin 是什么

Django Admin 是 Django 内置的**自动生成的后台管理系统**。你只要定义好 Model,注册到 Admin,Django 就自动给你一套完整的:

- 列表页(分页、排序、筛选、搜索)
- 详情页(增、删、改、查看)
- 表单校验
- 权限控制
- 历史记录

整套后台零代码,直接能用。这是 Django 的「**杀手锏特性**」——别的框架要花一周搭的后台,Django 一行代码搞定。

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Post

# 一行注册,后台立刻能用
admin.site.register(Post)
\`\`\`

访问 \`http://localhost:8000/admin/\`,就能看到完整的 CRUD 界面。

## 创建超级用户

Admin 需要登录,默认只有「超级用户」能访问。创建超级用户:

\`\`\`bash
python manage.py createsuperuser

# 交互式输入:
# Username (leave blank to use 'admin'): admin
# Email: admin@example.com
# Password: ********
# Password (again): ********
# Superuser created successfully.
\`\`\`

超级用户拥有所有权限(\`is_superuser=True\`),能管理所有应用。

## 注册模型

### 1. 最简注册

\`\`\`python
# blog/admin.py
from django.contrib import admin
from .models import Post, Comment, Tag

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Tag)
\`\`\`

这样后台就有这三个模型的管理页面,但默认显示很简陋:列表页只显示 \`Post object (1)\` 这样的对象名。

### 2. 用 ModelAdmin 定制

\`\`\`python
@admin.register(Post)   # 装饰器注册(等价 admin.site.register(Post, PostAdmin))
class PostAdmin(admin.ModelAdmin):
    # 列表页显示的字段
    list_display = ("title", "author", "status", "created_at", "views")

    # 侧边栏过滤器(按这些字段筛选)
    list_filter = ("status", "created_at", "author")

    # 搜索框(按这些字段搜索)
    search_fields = ("title", "content")

    # 按日期分层过滤(顶部出现年月导航)
    date_hierarchy = "created_at"

    # 默认排序
    ordering = ("-created_at",)

    # 每页显示条数
    list_per_page = 25

    # 列表页可编辑(双击直接改)
    list_editable = ("status",)

    # 列表页显示的链接字段(点击进详情)
    list_display_links = ("title",)
\`\`\`

这样列表页立刻专业起来:有筛选、搜索、日期导航、分页、可编辑字段。

## ModelAdmin 常用配置

### 1. list_display:列表显示字段

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "created_at")

    # 可以显示外键关联字段(用方法)
    def author_name(self, obj):
        return obj.author.username
    author_name.short_description = "作者"

    # 可以显示计算字段
    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = "评论数"

    list_display = ("title", "author_name", "comment_count", "status")
\`\`\`

### 2. list_filter:过滤器

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    list_filter = ("status", "author", "created_at")

    # 自定义过滤器(按是否已发布)
    class PublishedFilter(admin.SimpleListFilter):
        title = "发布状态"
        parameter_name = "published"

        def lookups(self, request, model_admin):
            return (
                ("yes", "已发布"),
                ("no", "未发布"),
            )

        def queryset(self, request, queryset):
            if self.value() == "yes":
                return queryset.filter(status="published")
            if self.value() == "no":
                return queryset.exclude(status="published")

    list_filter = (PublishedFilter, "author")
\`\`\`

### 3. search_fields:搜索

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    # 在 title 和 content 里搜(支持 LIKE)
    search_fields = ("title", "content")

    # 外键字段(双下划线)
    search_fields = ("title", "author__username")
\`\`\`

### 4. date_hierarchy:日期导航

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"  # 顶部出现「2024 年 6 月」可点击导航
\`\`\`

### 5. raw_id_fields / readonly_fields

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    # 外键默认是下拉框(选项多时很慢),改成搜索框
    raw_id_fields = ("author", "category")

    # 只读字段(详情页不可编辑)
    readonly_fields = ("views", "created_at", "updated_at")
\`\`\`

## Inline 内联编辑

如果两个模型有外键关系(如 Post 和 Comment),编辑 Post 时想顺便编辑 Comment,用 **Inline**:

### 1. StackedInline:垂直堆叠

\`\`\`python
class CommentInline(admin.StackedInline):
    model = Comment          # 关联的模型
    extra = 1                # 默认显示几个空行
    readonly_fields = ("created_at",)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    inlines = [CommentInline]   # 在 Post 详情页内联编辑评论
\`\`\`

编辑文章时,下面会出现评论区,可以直接增删改评论。

### 2. TabularInline:表格形式

\`\`\`python
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 3
    fields = ("author", "content", "created_at")
    readonly_fields = ("created_at",)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    inlines = [CommentInline]
\`\`\`

区别:

- \`StackedInline\`:每个内联对象占一块(适合字段多)。
- \`TabularInline\`:表格一行一个对象(适合字段少)。

## Admin 动作(actions)

列表页顶部有「动作」下拉框,可以对勾选的多条记录批量操作。默认有「删除选中」。可以自定义:

\`\`\`python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    actions = ["make_published", "make_draft"]

    @admin.action(description="标记为已发布")
    def make_published(self, request, queryset):
        # queryset 是勾选的对象集合
        updated = queryset.update(status="published")
        self.message_user(request, f"成功发布 {updated} 篇文章")

    @admin.action(description="标记为草稿")
    def make_draft(self, request, queryset):
        updated = queryset.update(status="draft")
        self.message_user(request, f"成功转草稿 {updated} 篇")
\`\`\`

\`self.message_user\` 会在页面顶部显示成功提示(用 Django 的 messages 框架)。

## Admin 主题与定制

### 1. 改标题

\`\`\`python
# 在任意 admin.py 顶部
from django.contrib import admin

admin.site.site_header = "我的博客后台"      # 浏览器标签 + 顶部标题
admin.site.site_title = "博客管理"           # 浏览器标签尾部
admin.site.index_title = "欢迎使用"          # 首页标题
\`\`\`

### 2. 自定义首页

\`\`\`python
# 覆盖默认模板:templates/admin/index.html
{% extends "admin/index.html" %}
{% block content %}
{{ block.super }}  {# 保留默认内容 #}
<div>
    <h3>运营提示</h3>
    <p>本周新增文章:{{ stats.weekly_posts }}</p>
</div>
{% endblock %}
\`\`\`

### 3. 自定义字段显示样式

\`\`\`python
from django.utils.html import format_html

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "colored_status", "created_at")

    def colored_status(self, obj):
        color = "green" if obj.status == "published" else "gray"
        return format_html(
            '<b style="color: {};">{}</b>',
            color, obj.get_status_display(),
        )
    colored_status.short_description = "状态"
\`\`\`

用 \`format_html\` 输出 HTML(自动转义防 XSS)。⚠️ 不要用普通字符串拼接,会有 XSS 风险。

## 权限控制

Admin 自带权限:每个 Model 自动生成「增/改/删」三种权限。用户没有权限就看不到对应模块。

\`\`\`python
class PostAdmin(admin.ModelAdmin):
    # 限制用户只能看/改自己的文章
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    # 没权限的字段不显示
    def get_list_display(self, request):
        if request.user.is_superuser:
            return ("title", "author", "status")
        return ("title", "status")

    # 保存时自动填作者
    def save_model(self, request, obj, form, change):
        if not change:  # 新建时
            obj.author = request.user
        super().save_model(request, obj, form, change)

    # 只有作者能删自己的文章
    def has_delete_permission(self, request, obj=None):
        if obj is None:
            return True
        return obj.author == request.user or request.user.is_superuser
\`\`\`

## 完整示例:博客 Admin 配置

\`\`\`python
# blog/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Post, Comment, Tag, Category

# ========== 标签 ==========
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "post_count")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}  # 自动填 slug

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = "文章数"

# ========== 分类 ==========
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "description", "post_count")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = "文章数"

# ========== 评论(内联用) ==========
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    readonly_fields = ("author", "content", "created_at")
    can_delete = True
    verbose_name = "评论"
    verbose_name_plural = "评论"

# ========== 文章 ==========
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # 列表显示
    list_display = ("title", "colored_status", "author", "category",
                    "tag_list", "views", "comment_count", "created_at")
    # 过滤器
    list_filter = ("status", "category", "author", "tags", "created_at")
    # 搜索
    search_fields = ("title", "content", "author__username")
    # 日期导航
    date_hierarchy = "created_at"
    # 排序
    ordering = ("-created_at",)
    # 分页
    list_per_page = 20
    # 可编辑字段(双击改)
    list_editable = ("category",)
    # 预填 slug
    prepopulated_fields = {"slug": ("title",)}
    # 外键搜索框
    raw_id_fields = ("author",)
    # 只读字段
    readonly_fields = ("views", "created_at", "updated_at")
    # 字段分组(详情页布局)
    fieldsets = (
        ("基本信息", {
            "fields": ("title", "slug", "author", "category")
        }),
        ("内容", {
            "fields": ("content", "tags")
        }),
        ("状态", {
            "fields": ("status", "views", "published_at")
        }),
        ("时间", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),  # 默认折叠
        }),
    )
    # 内联评论
    inlines = [CommentInline]
    # 动作
    actions = ["make_published", "make_draft"]

    # 自定义显示方法
    def colored_status(self, obj):
        color = "green" if obj.status == "published" else "orange"
        return format_html(
            '<b style="color: {};">{}</b>',
            color, obj.get_status_display(),
        )
    colored_status.short_description = "状态"

    def tag_list(self, obj):
        return ", ".join(t.name for t in obj.tags.all())
    tag_list.short_description = "标签"

    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = "评论数"

    # 自定义动作
    @admin.action(description="批量发布")
    def make_published(self, request, queryset):
        count = queryset.update(status="published")
        self.message_user(request, f"已发布 {count} 篇文章", level="success")

    @admin.action(description="批量转草稿")
    def make_draft(self, request, queryset):
        count = queryset.update(status="draft")
        self.message_user(request, f"已转草稿 {count} 篇文章")

    # 权限:非超级用户只能看自己的
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    # 保存时自动填作者
    def save_model(self, request, obj, form, change):
        if not change:
            obj.author = request.user
        super().save_model(request, obj, form, change)
\`\`\`

## 为什么 Admin 是 Django 杀手锏

对比其他框架搭后台的工作量:

| 框架 | 后台方案 | 工作量 |
|---|---|---|
| Django | 内置 Admin | 几行配置 |
| Flask | Flask-Admin(第三方) | 中等 |
| Express | 无,自建 | 大 |
| Rails | ActiveAdmin(第三方) | 中等 |
| Spring Boot | 无,自建 | 大 |

Admin 适合的场景:

- **内部管理系统**:CMS、运营后台、数据管理(本来就要后台,Admin 直接用)。
- **快速原型**:验证想法时,Admin 当临时后台。
- **数据调试**:开发时直接改数据库数据,比写 SQL 快。

Admin **不适合**的场景:

- **面向最终用户**:Admin 是给「懂技术的人」用的,UI 不够友好。
- **复杂业务流程**:特殊审批流、定制交互,Admin 改起来比自建还累。
- **高并发**:Admin 查询多,大表性能差。

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| Admin 看不到模型 | 没注册 | admin.site.register 或 @admin.register |
| 列表只显示 Post object (1) | 没写 __str__ | Model 加 __str__ |
| 外键下拉慢 | 选项太多 | 用 raw_id_fields |
| format_html 漏写 | XSS 风险 | 用 format_html 不用拼接 |
| list_display 字段不存在 | 拼错名 | 字段名或方法名要对应 |
| 权限不够 | 用户没加权限 | 加 superuser 或赋权限 |
| prepopulated_fields 不生效 | 字段没配 | 配 slug 依赖 name |
| get_queryset 没调 super | 数据全没了 | 必须 super().get_queryset |
| list_editable 含主键 | 报错 | 主键和链接字段不能 editable |
| Admin 中文显示英文 | 没翻译 | settings 设 LANGUAGE_CODE="zh-hans" |

## 设计思想

Django Admin 体现的设计哲学是「**约定优于配置 + 自动化**」。框架假设「大部分后台长得都差不多」(列表 + 筛选 + 搜索 + 增删改),就把这套模式封装好,你只需声明「我要显示哪些字段、按什么过滤」,其余全部自动生成。这把「重复劳动」变成了「配置工作」。理解 Admin 的关键不是记 API,而理解它的扩展点:\`get_queryset\`/\`save_model\`/\`has_*_permission\` 这些钩子让你能在不破坏自动化的前提下注入业务逻辑,这是「开箱即用」和「可定制」的平衡点。
`,
  },
];
