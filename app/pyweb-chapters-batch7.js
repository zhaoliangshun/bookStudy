// =============================================================
// Python Web 应用开发实战教程 - 第 7 批章节(Django 视图与模板 4 章)
// -------------------------------------------------------------
// 本批包含 4 章:
//   django-cbv        : 类视图与通用视图
//   django-form       : Django 表单 Forms
//   django-middleware : Django 中间件
//   django-decorator  : Django 装饰器与权限
//
// 教程定位:纯阅读型,代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」,视图会变,请求响应思想长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 25 章:类视图与通用视图
  // ============================================================
  {
    id: "django-cbv",
    group: "Django 视图与模板",
    icon: "🏗️",
    title: "类视图与通用视图",
    content: `# 类视图与通用视图

## 函数视图 vs 类视图

Django 写视图有两种风格:

- **函数视图(FBV,Function-Based View)**:用 \`def\` 定义函数,简单直接,适合小逻辑。
- **类视图(CBV,Class-Based View)**:用 \`class\` 定义类,把通用逻辑封装成基类,适合重复模式。

\`\`\`python
# 函数视图:简单但重复
def post_list(request):
    posts = Post.objects.all()
    return render(request, "blog/post_list.html", {"posts": posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, "blog/post_detail.html", {"post": post})

# 类视图:封装通用逻辑
class PostListView(ListView):
    model = Post
    template_name = "blog/post_list.html"
\`\`\`

何时用哪种?社区有句经验:

- **简单逻辑、一次性页面** → FBV,代码读起来一目了然。
- **标准 CRUD、可复用模式** → CBV,几行配置搞定。
- **团队约定统一** → 选一种坚持用,别混。

## as_view():类视图的入口

类视图是 Python 类,但 URL 路由需要「可调用对象」。所以类视图要调 \`as_view()\`:

\`\`\`python
# urls.py
from django.urls import path
from .views import PostListView

urlpatterns = [
    path("", PostListView.as_view(), name="post_list"),
]
\`\`\`

\`as_view()\` 返回一个函数,这个函数被调用时会:

1. 实例化视图类(\`view = MyView()\`)。
2. 调用 \`setup()\` 注入 request、args、kwargs。
3. 调用 \`dispatch()\`,根据 \`request.method\` 分发到对应方法(\`get\`/\`post\`/\`put\`/\`delete\`)。
4. 返回 HTTP 响应。

\`\`\`python
# dispatch 的等价逻辑
class MyView(View):
    def dispatch(self, request, *args, **kwargs):
        method = request.method.lower()  # "get"/"post"
        handler = getattr(self, method, self.http_method_not_allowed)
        return handler(request, *args, **kwargs)
\`\`\`

## HTTP 方法分发

类视图最大的好处是「**按 HTTP 方法分发**」,不用手写 \`if request.method == "POST"\`:

\`\`\`python
from django.views import View
from django.http import HttpResponse

class ContactView(View):
    def get(self, request):
        # GET 请求:显示空表单
        return render(request, "contact.html", {"form": ContactForm()})

    def post(self, request):
        # POST 请求:处理表单提交
        form = ContactForm(request.POST)
        if form.is_valid():
            # 处理数据...
            return redirect("success")
        return render(request, "contact.html", {"form": form})
\`\`\`

对比函数视图的写法:

\`\`\`python
# 函数视图:要手动判断 method
def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            return redirect("success")
    else:
        form = ContactForm()
    return render(request, "contact.html", {"form": form})
\`\`\`

## 通用视图(Generic Views)

Django 内置一套「通用视图」,把常见 CRUD 场景封装成基类。这是 CBV 的精华。

### 1. ListView:列表

\`\`\`python
from django.views.generic import ListView
from .models import Post

class PostListView(ListView):
    model = Post                              # 数据模型
    template_name = "blog/post_list.html"    # 模板路径
    context_object_name = "posts"             # 模板里的变量名
    paginate_by = 10                          # 每页 10 条(自动分页)
    ordering = ["-created_at"]                # 默认排序

    # 重写 get_queryset 自定义查询
    def get_queryset(self):
        # 只返回已发布文章,且按当前用户过滤
        qs = super().get_queryset()
        return qs.filter(status="published")

    # 重写 get_context_data 加额外上下文
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "文章列表"
        context["tags"] = Tag.objects.all()
        return context
\`\`\`

模板里可用的变量:

- \`{{ posts }}\`:文章列表(用 context_object_name)。
- \`{{ page_obj }}\`:当前页对象(分页用)。
- \`{{ is_paginated }}\`:是否分页。
- \`{{ paginator }}\`:分页器对象。

### 2. DetailView:详情

\`\`\`python
from django.views.generic import DetailView

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/post_detail.html"
    context_object_name = "post"

    # 默认从 URL 的 <int:pk> 取主键查对象
    # 也可以用 slug
    slug_field = "slug"
    slug_url_kwarg = "slug"
\`\`\`

### 3. CreateView:创建

\`\`\`python
from django.views.generic import CreateView
from django.urls import reverse_lazy

class PostCreateView(CreateView):
    model = Post
    template_name = "blog/post_form.html"
    fields = ["title", "content", "tags"]    # 表单字段
    success_url = reverse_lazy("blog:post_list")  # 成功后跳转

    # 重写 form_valid 在保存前注入数据
    def form_valid(self, form):
        form.instance.author = self.request.user  # 自动填作者
        return super().form_valid(form)
\`\`\`

\`CreateView\` 流程:

1. GET → 渲染空表单。
2. POST → 校验表单,\`form_valid\` 保存并跳转,\`form_invalid\` 重新渲染。

### 4. UpdateView:更新

\`\`\`python
class PostUpdateView(UpdateView):
    model = Post
    template_name = "blog/post_form.html"
    fields = ["title", "content", "tags"]
    success_url = reverse_lazy("blog:post_list")
\`\`\`

和 CreateView 几乎一样,只是 GET 时预填已有数据。

### 5. DeleteView:删除

\`\`\`python
class PostDeleteView(DeleteView):
    model = Post
    template_name = "blog/post_confirm_delete.html"  # 确认页
    success_url = reverse_lazy("blog:post_list")
\`\`\`

流程:GET 显示确认页,POST 才真删(避免 GET 请求误删)。

### 6. TemplateView:静态模板

\`\`\`python
from django.views.generic import TemplateView

class AboutView(TemplateView):
    template_name = "about.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "关于我们"
        return context
\`\`\`

适合不需要查数据库的静态页(关于、隐私政策等)。

## FormView:表单视图

如果表单不直接对应 Model,用 \`FormView\`:

\`\`\`python
from django.views.generic import FormView
from .forms import ContactForm

class ContactView(FormView):
    template_name = "contact.html"
    form_class = ContactForm
    success_url = reverse_lazy("contact_success")

    def form_valid(self, form):
        # 表单校验通过,处理数据(如发邮件)
        form.send_email()
        return super().form_valid(form)
\`\`\`

## LoginRequiredMixin:权限控制

类视图加权限用 Mixin:

\`\`\`python
from django.contrib.auth.mixins import LoginRequiredMixin

# 必须登录才能访问
class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ["title", "content"]
    # 未登录会跳到 LOGIN_URL

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

# 只有作者本人能编辑
from django.contrib.auth.mixins import UserPassesTestMixin

class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    fields = ["title", "content"]

    def test_func(self):
        # 只有本文作者能编辑
        post = self.get_object()
        return post.author == self.request.user
\`\`\`

## Mixin:组合复用

Mixin 是「**可插拔的功能片段**」,用多继承组合出复杂视图。Django CBV 的整个体系就是 Mixin 组合:

\`\`\`python
# ListView 的继承链(简化)
# View → ContextMixin → TemplateResponseMixin → BaseListView → ListView
# 每个 Mixin 负责一块:
#   ContextMixin      → 处理 context
#   TemplateResponseMixin → 渲染模板
#   BaseListView      → 处理 list 逻辑
#   ListView          → 整合上面

# 自定义 Mixin:给所有视图加「最近文章」侧边栏
class RecentPostsMixin:
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["recent_posts"] = Post.objects.all()[:5]
        return context

# 组合使用
class PostDetailView(RecentPostsMixin, DetailView):
    model = Post
    template_name = "blog/post_detail.html"
\`\`\`

## 重写钩子

通用视图提供大量「钩子方法」,你重写它们就能注入业务逻辑:

| 方法 | 调用时机 | 常用操作 |
|---|---|---|
| \`get_queryset()\` | 取数据时 | 过滤、排序 |
| \`get_object()\` | DetailView 取单条时 | 自定义查询条件 |
| \`get_context_data()\` | 渲染前 | 加额外模板变量 |
| \`form_valid(form)\` | 表单校验通过 | 注入数据、发邮件 |
| \`form_invalid(form)\` | 表单校验失败 | 加日志 |
| \`get_success_url()\` | 增删改成功后 | 动态跳转 |
| \`get_form_kwargs()\` | 创建表单时 | 传 request 给表单 |
| \`dispatch()\` | 最入口 | 全局拦截(权限、限流) |

\`\`\`python
class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    fields = ["title", "content"]

    # 动态成功跳转:回到详情页
    def get_success_url(self):
        return reverse("blog:post_detail", kwargs={"pk": self.object.pk})

    # 把 request 传给表单(表单里能用 request.user)
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["request"] = self.request
        return kwargs

    # 最早期拦截:限制只有作者能访问
    def dispatch(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
\`\`\`

## 完整示例:博客 CRUD 全用通用视图

\`\`\`python
# blog/views.py
from django.urls import reverse_lazy, reverse
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView
)
from .models import Post, Tag

class PostListView(ListView):
    model = Post
    template_name = "blog/post_list.html"
    context_object_name = "posts"
    paginate_by = 10

    def get_queryset(self):
        # 默认只看已发布;有 ?q= 就搜索
        qs = Post.objects.filter(status="published")
        q = self.request.GET.get("q")
        if q:
            qs = qs.filter(title__icontains=q)
        return qs.select_related("author").prefetch_related("tags")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["q"] = self.request.GET.get("q", "")
        return context

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/post_detail.html"
    context_object_name = "post"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # 增加浏览量
        self.object.increase_views()
        # 相关文章
        context["related"] = self.object.tags.first().posts.exclude(pk=self.object.pk)[:3] if self.object.tags.exists() else []
        return context

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    template_name = "blog/post_form.html"
    fields = ["title", "content", "status", "tags"]

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    template_name = "blog/post_form.html"
    fields = ["title", "content", "status", "tags"]

    # 只有作者能编辑
    def test_func(self):
        post = self.get_object()
        return post.author == self.request.user

class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Post
    template_name = "blog/post_confirm_delete.html"
    success_url = reverse_lazy("blog:post_list")

    def test_func(self):
        post = self.get_object()
        return post.author == self.request.user
\`\`\`

\`\`\`python
# blog/urls.py
from django.urls import path
from .views import (
    PostListView, PostDetailView,
    PostCreateView, PostUpdateView, PostDeleteView,
)

app_name = "blog"

urlpatterns = [
    path("", PostListView.as_view(), name="post_list"),
    path("post/<int:pk>/", PostDetailView.as_view(), name="post_detail"),
    path("post/new/", PostCreateView.as_view(), name="post_create"),
    path("post/<int:pk>/edit/", PostUpdateView.as_view(), name="post_edit"),
    path("post/<int:pk>/delete/", PostDeleteView.as_view(), name="post_delete"),
]
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 类视图没调 as_view() | urls.py 写错 | path(..., View.as_view()) |
| LoginRequiredMixin 不在最前 | MRO 出问题 | 放列表最左 |
| form_valid 没调 super | 数据没保存 | 必须 super().form_valid(form) |
| get_queryset 没调 super | 失去默认行为 | 看情况,通常要 super |
| fields 和 form_class 同时用 | 冲突 | 二选一 |
| success_url 用 reverse | 模块加载时 URL 还没好 | 用 reverse_lazy |
| DetailView 找不到对象 | URL 参数名不对 | 默认 pk,改用 slug_field |
| paginate_by 没配 | 不分页 | 配上才有分页 |
| test_func 返回 False | 跳到登录页 | 检查权限逻辑 |
| 多继承顺序乱 | MRO 复杂 | View 放最后,Mixin 放前面 |

## 设计思想

类视图和 Mixin 体现的设计哲学是「**组合优于继承 + 约定优于配置**」。每个 Mixin 是一个「职责单一」的功能片段(渲染模板、处理表单、检查登录),通过多继承组合出复杂视图。通用视图把「列表/详情/增删改」这五种最常见的模式封装好,你只需声明属性(\`model\`、\`fields\`、\`template_name\`),遇到特殊需求再重写钩子方法。理解 CBV 的关键不是背 API,而理解它的「执行流程」(dispatch → get/post → get_queryset/get_object → get_context_data → render),所有钩子都挂在这条流程上。
`,
  },

  // ============================================================
  // 第 26 章:Django 表单 Forms
  // ============================================================
  {
    id: "django-form",
    group: "Django 视图与模板",
    icon: "📝",
    title: "Django 表单 Forms",
    content: `# Django 表单 Forms

## Form 是什么

Web 开发里表单无处不在:登录、注册、发文章、搜索。表单的本质是「**接收用户输入、校验、处理**」三步。如果手写,你会:

1. 写 HTML 表单(\`<input>\` \`<textarea>\`)。
2. 接收 POST 数据,逐个字段取值。
3. 写校验逻辑(必填、长度、格式)。
4. 错误时重新渲染表单并显示错误。
5. 通过后存数据库。

这五步又长又重复。Django 的 \`Form\` 把这些封装成一个类:**字段定义 = HTML 渲染 + 校验规则**。

\`\`\`python
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(max_length=50, label="姓名")
    email = forms.EmailField(label="邮箱")
    message = forms.CharField(widget=forms.Textarea, label="留言")
\`\`\`

这一份定义同时用于:渲染 HTML、接收数据、校验。

## 字段类型与校验

每个表单字段自带「校验规则」:

\`\`\`python
class RegisterForm(forms.Form):
    # 必填(默认),最少 3 字符
    username = forms.CharField(min_length=3, max_length=20, label="用户名")

    # 密码:渲染成 <input type="password">
    password = forms.CharField(
        widget=forms.PasswordInput,
        min_length=8,
        label="密码",
    )

    # 邮箱:自动校验格式
    email = forms.EmailField(label="邮箱")

    # 整数:校验是数字
    age = forms.IntegerField(min_value=0, max_value=150, required=False)

    # 选择字段
    gender = forms.ChoiceField(
        choices=[("M", "男"), ("F", "女")],
        widget=forms.RadioSelect,
    )

    # 多选
    interests = forms.MultipleChoiceField(
        choices=[("py", "Python"), ("js", "JavaScript"), ("go", "Go")],
        widget=forms.CheckboxSelectMultiple,
        required=False,
    )

    # 布尔
    agree = forms.BooleanField(required=True, label="同意条款")

    # 日期
    birthday = forms.DateField(widget=forms.SelectDateWidget, required=False)
\`\`\`

常用字段类型:

| 字段 | 校验 | HTML 类型 |
|---|---|---|
| \`CharField\` | 字符串 | text |
| \`EmailField\` | 邮箱格式 | email |
| \`URLField\` | URL 格式 | url |
| \`IntegerField\` | 整数 | number |
| \`FloatField\` | 浮点数 | number |
| \`DecimalField\` | 定点数 | number |
| \`BooleanField\` | 布尔 | checkbox |
| \`ChoiceField\` | 单选 | select |
| \`MultipleChoiceField\` | 多选 | select multiple |
| \`DateField\` | 日期 | date |
| \`DateTimeField\` | 日期时间 | datetime |
| \`FileField\` | 文件 | file |
| \`ImageField\` | 图片 | file |

## ModelForm:从 Model 自动生成表单

大部分表单是为了存数据到某个 Model。手写 Form 字段会跟 Model 字段重复(改一处忘改另一处)。 \`ModelForm\` 自动从 Model 生成表单:

\`\`\`python
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "content", "status", "tags"]  # 包含哪些字段
        # 或 fields = "__all__"  全部字段
        # 或 exclude = ["views"]  排除某些字段

        # 自定义 widget(控件)
        widgets = {
            "content": forms.Textarea(attrs={"rows": 10, "class": "form-control"}),
            "status": forms.Select(attrs={"class": "form-control"}),
        }

        # 标签
        labels = {
            "title": "标题",
            "content": "正文",
        }

        # 提示
        help_texts = {
            "title": "请输入有吸引力的标题",
        }

        # 错误信息
        error_messages = {
            "title": {
                "required": "标题不能为空",
                "max_length": "标题最多 200 字",
            },
        }
\`\`\`

ModelForm 的好处:

- 字段定义不用重复(从 Model 读)。
- \`form.save()\` 直接存数据库。
- Model 改了,Form 自动跟上。

## 表单渲染

### 1. 自动渲染

\`\`\`html
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}        <!-- 每个字段一个 <p> -->
    <!-- 或 {{ form.as_table }}  表格形式 -->
    <!-- 或 {{ form.as_ul }}     列表形式 -->
    <button type="submit">提交</button>
</form>
\`\`\`

\`as_p\` 渲染:每个字段一个 \`<p>\`,包含 \`<label>\` + \`<input>\` + 错误信息。简单但样式固定。

### 2. 手动渲染字段

要自定义布局,逐字段渲染:

\`\`\`html
<form method="post">
    {% csrf_token %}

    <div class="form-group">
        {{ form.title.label_tag }}
        {{ form.title }}
        {% if form.title.errors %}
            <div class="error">{{ form.title.errors }}</div>
        {% endif %}
    </div>

    <div class="form-group">
        {{ form.content.label_tag }}
        {{ form.content }}
        {{ form.content.errors }}
    </div>

    <button type="submit">提交</button>
</form>
\`\`\`

每个字段对象有这些属性:

- \`{{ form.title }}\`:渲染 input。
- \`{{ form.title.label_tag }}\`:渲染 \`<label>\`。
- \`{{ form.title.id_for_label }}\`:input 的 id。
- \`{{ form.title.errors }}\`:错误列表。
- \`{{ form.title.help_text }}\`:帮助文字。

### 3. 遍历渲染

\`\`\`html
<form method="post">
    {% csrf_token %}
    {% for field in form %}
        <div class="form-group {% if field.errors %}has-error{% endif %}">
            {{ field.label_tag }}
            {{ field }}
            {% if field.help_text %}
                <small>{{ field.help_text }}</small>
            {% endif %}
            {{ field.errors }}
        </div>
    {% endfor %}
    <button type="submit">提交</button>
</form>
\`\`\`

## 表单校验流程

视图里典型用法:

\`\`\`python
from django.shortcuts import render, redirect
from .forms import PostForm

def post_new(request):
    if request.method == "POST":
        # 用 POST 数据构造表单
        form = PostForm(request.POST)
        if form.is_valid():
            # 校验通过,form.cleaned_data 是清洗后的数据
            post = form.save(commit=False)  # 不立即存,先改一下
            post.author = request.user
            post.save()
            form.save_m2m()  # 保存多对多关系
            return redirect("blog:post_detail", pk=post.pk)
    else:
        # GET 请求:空表单
        form = PostForm()

    return render(request, "blog/post_form.html", {"form": form})
\`\`\`

流程:

1. **GET** → 渲染空表单。
2. **POST** → 用 POST 数据构造表单。
3. \`form.is_valid()\` → 触发校验。
4. 校验通过 → \`form.cleaned_data\` 拿清洗后数据 → \`form.save()\` 存库。
5. 校验失败 → 重新渲染表单(带错误信息)。

## cleaned_data:清洗后的数据

\`is_valid()\` 通过后,\`form.cleaned_data\` 是「清洗后」的字典:

\`\`\`python
form = ContactForm(request.POST)
if form.is_valid():
    # cleaned_data 是 dict,字段名 → Python 类型
    name = form.cleaned_data["name"]      # str
    age = form.cleaned_data["age"]         # int(自动转换)
    birthday = form.cleaned_data["birthday"]  # date 对象
    email = form.cleaned_data["email"]    # str(已校验格式)
\`\`\`

「清洗」做了:

- 类型转换(字符串 → int/date)。
- 去除首尾空白(\`strip=True\` 默认)。
- 应用所有校验规则。
- 返回 Python 原生类型。

## 表单错误

校验失败,\`form.errors\` 是错误字典:

\`\`\`python
form = PostForm(request.POST)
if not form.is_valid():
    # form.errors 是 dict:字段名 → 错误列表
    form.errors  # {'title': ['这个字段是必填项。'], 'email': ['输入有效的邮箱地址。']}

    # 单字段错误
    form["title"].errors  # ['这个字段是必填项。']

    # 模板里
    {{ form.title.errors }}  # <ul><li>这个字段是必填项。</li></ul>
\`\`\`

## clean():自定义校验

字段级校验:写 \`clean_<fieldname>\` 方法。

\`\`\`python
class RegisterForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(widget=forms.PasswordInput, min_length=8)
    password2 = forms.CharField(widget=forms.PasswordInput, label="确认密码")

    # 字段级校验:用户名是否已存在
    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("用户名已存在")
        return username  # 必须 return

    # 表单级校验:两次密码是否一致
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")
        if password and password2 and password != password2:
            # raise 会绑定到 password2 字段
            self.add_error("password2", "两次密码不一致")
        return cleaned_data
\`\`\`

两种方式:

- \`clean_<field>\`:校验单字段,只管自己。\`raise ValidationError\` 绑到该字段。
- \`clean()\`:校验多字段关系(如密码确认)。\`add_error(field, msg)\` 绑到指定字段。

## CSRF token

POST 表单必须带 CSRF token,否则 Django 拒绝(403):

\`\`\`html
<form method="post">
    {% csrf_token %}    <!-- 生成隐藏字段,提交时校验 -->
    <!-- 表单字段 -->
</form>
\`\`\`

CSRF(Cross-Site Request Forgery)是攻击者诱导用户在你已登录的站点上执行非自愿操作。Django 给每个 session 一个随机 token,表单提交时比对,token 不匹配就拒绝。

\`{% csrf_token %}\` 渲染成:

\`\`\`html
<input type="hidden" name="csrfmiddlewaretoken" value="abc123xyz...">
\`\`\`

AJAX 请求要手动带 token(从 cookie 读):

\`\`\`javascript
// 从 cookie 取 csrftoken
function getCookie(name) {
    // ... 读 cookie ...
}
fetch("/api/post/", {
    method: "POST",
    headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
});
\`\`\`

## 完整示例:文章发布表单

\`\`\`python
# blog/forms.py
from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "content", "status", "tags"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "文章标题"}),
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 15}),
            "status": forms.Select(attrs={"class": "form-control"}),
            "tags": forms.CheckboxSelectMultiple,
        }
        labels = {
            "title": "标题",
            "content": "正文",
            "status": "状态",
            "tags": "标签",
        }

    # 自定义校验:标题不能含「测试」二字(示例)
    def clean_title(self):
        title = self.cleaned_data["title"]
        if "测试" in title:
            raise forms.ValidationError("标题不能含敏感词「测试」")
        return title

    # 表单级校验:草稿状态不强制要正文
    def clean(self):
        cleaned_data = super().clean()
        status = cleaned_data.get("status")
        content = cleaned_data.get("content")
        if status == "published" and not content:
            self.add_error("content", "已发布文章必须有正文")
        return cleaned_data
\`\`\`

\`\`\`python
# blog/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import PostForm

@login_required
def post_new(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            form.save_m2m()  # 保存多对多(tags)
            return redirect("blog:post_detail", pk=post.pk)
    else:
        form = PostForm()
    return render(request, "blog/post_form.html", {"form": form})

@login_required
def post_edit(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.author != request.user:
        raise PermissionDenied
    if request.method == "POST":
        form = PostForm(request.POST, instance=post)  # instance 预填
        if form.is_valid():
            form.save()
            return redirect("blog:post_detail", pk=post.pk)
    else:
        form = PostForm(instance=post)  # 编辑:预填已有数据
    return render(request, "blog/post_form.html", {"form": form, "post": post})
\`\`\`

\`\`\`html
<!-- templates/blog/post_form.html -->
{% extends "base.html" %}

{% block content %}
<h1>{% if post %}编辑文章{% else %}新建文章{% endif %}</h1>

<form method="post">
    {% csrf_token %}

    <div class="form-group">
        {{ form.title.label_tag }}
        {{ form.title }}
        {{ form.title.errors }}
        {{ form.title.help_text }}
    </div>

    <div class="form-group">
        {{ form.content.label_tag }}
        {{ form.content }}
        {{ form.content.errors }}
    </div>

    <div class="form-group">
        {{ form.status.label_tag }}
        {{ form.status }}
        {{ form.status.errors }}
    </div>

    <div class="form-group">
        <label>{{ form.tags.label }}</label>
        {% for tag in form.tags %}
            <label class="checkbox-inline">
                {{ tag.tag }} {{ tag.choice_label }}
            </label>
        {% endfor %}
        {{ form.tags.errors }}
    </div>

    <button type="submit" class="btn btn-primary">保存</button>
    <a href="{% url 'blog:post_list' %}" class="btn btn-default">取消</a>
</form>
{% endblock %}
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| POST 报 403 | 漏 CSRF token | 表单加 {% csrf_token %} |
| ModelForm save 没存外键 | commit=False 后没设值 | 设值后调 save + save_m2m |
| clean 没返回值 | 数据丢失 | 必须 return cleaned_data |
| 字段校验没生效 | 方法名拼错 | clean_<field> 严格匹配 |
| ModelForm 没存多对多 | save(commit=False) 跳过 | 单独调 form.save_m2m() |
| 表单数据没预填 | 编辑忘传 instance | PostForm(instance=post) |
| is_valid 之前访问 cleaned_data | 还没清洗 | 报 KeyError |
| widget 没设 | 默认 input 丑 | 用 widgets 参数 |
| BooleanField 必填逻辑 | checkbox 没勾算 False | required=True 也不行,用其他字段 |
| ModelForm 字段类型不符 | Model 是 TextField,Form 默认 TextInput | 用 widgets 指定 Textarea |

## 设计思想

Django Forms 体现的设计哲学是「**一处定义,多处使用**」。一份 Form 类同时用于:HTML 渲染(知道字段类型)、数据接收(知道字段名)、类型校验(知道字段规则)、错误展示(知道错误信息)。这种「字段定义 = 渲染 + 校验」的统一,消除了「HTML 字段」「后端校验」「错误信息」三处不同步的经典 bug。理解 Form 的关键不在背 API,而理解「数据流」:原始 POST → Form 构造 → is_valid 校验 → cleaned_data 清洗 → save 持久化,每一步都对应一个明确的职责。
`,
  },

  // ============================================================
  // 第 27 章:Django 中间件
  // ============================================================
  {
    id: "django-middleware",
    group: "Django 视图与模板",
    icon: "🔌",
    title: "Django 中间件",
    content: `# Django 中间件

## 中间件是什么

中间件(Middleware)是「**请求/响应处理过程中的钩子链**」。它像一个流水线:每个请求进来,依次穿过所有中间件;每个响应出去,也依次穿过所有中间件。每个中间件可以在「穿过时」做点事(改请求、拦请求、加响应头、记日志)。

形象理解:**洋葱模型**。请求从外向内穿,响应从内向外穿,每层中间件都能在两个方向上动手脚。

\`\`\`
请求 → [Security] → [Session] → [Common] → [CSRF] → [Auth] → 视图
响应 ← [Security] ← [Session] ← [Common] ← [CSRF] ← [Auth] ← 视图
\`\`\`

中间件 vs 装饰器:

- **中间件**:全局生效,所有请求都过。适合通用逻辑(认证、Session、日志)。
- **装饰器**:局部生效,只装饰某个视图。适合特定视图的逻辑。

## 中间件执行顺序

\`settings.MIDDLEWARE\` 是一个列表,**顺序非常重要**:

\`\`\`python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",      # 1. 安全
    "django.contrib.sessions.middleware.SessionMiddleware", # 2. Session
    "django.middleware.common.CommonMiddleware",         # 3. 通用
    "django.middleware.csrf.CsrfViewMiddleware",          # 4. CSRF
    "django.contrib.auth.middleware.AuthenticationMiddleware", # 5. 认证
    "django.contrib.messages.middleware.MessageMiddleware",  # 6. 消息
    "django.middleware.clickjacking.XFrameOptionsMiddleware", # 7. 防点击劫持
]
\`\`\`

规则:

- **请求阶段**:从上到下执行(列表顺序)。
- **响应阶段**:从下到上执行(反向)。

所以认证中间件(Auth)在后面,因为它依赖 Session(Session 必须先建好)。CSRF 在 Auth 前,因为 CSRF 检查要在认证前完成。

## 自定义中间件(新式)

Django 1.10+ 用「新式中间件」,本质是一个**可调用对象**(实现了 \`__call__\`):

\`\`\`python
# myapp/middleware.py
import time

class TimingMiddleware:
    """请求计时中间件:记录每个请求耗时"""

    def __init__(self, get_response):
        # get_response 是下一个中间件或最终视图
        # Django 启动时调用一次
        self.get_response = get_response

    def __call__(self, request):
        # 请求阶段:在视图之前执行
        start_time = time.time()

        # 调用下一层(可能是下一个中间件,或视图)
        response = self.get_response(request)

        # 响应阶段:在视图之后执行
        duration = time.time() - start_time
        print(f"{request.method} {request.path} 耗时 {duration:.3f}s")

        # 加响应头
        response["X-Response-Time"] = f"{duration:.3f}s"
        return response
\`\`\`

注册到 settings:

\`\`\`python
MIDDLEWARE = [
    # ... 其他中间件 ...
    "myapp.middleware.TimingMiddleware",  # 自己的中间件(路径)
]
\`\`\`

执行逻辑:

1. \`__init__(get_response)\`:Django 启动时调用一次,构建中间件链。\`get_response\` 是「下一层」。
2. \`__call__(request)\`:每次请求调用。调 \`self.get_response(request)\` 前 = 请求阶段,调之后 = 响应阶段。

## process_view():视图前钩子

除了 \`__call__\`,中间件还可以定义 \`process_view\`,在「**路由解析后、视图执行前**」被调用:

\`\`\`python
class PermissionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    # process_view 在视图执行前调用
    # 参数:request, 视图函数, 视图参数, 视图关键字参数
    def process_view(self, request, view_func, view_args, view_kwargs):
        # 检查视图是否有 required_permission 属性
        required = getattr(view_func, "required_permission", None)
        if required and not request.user.has_perm(required):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("需要权限:" + required)
        # 返回 None 表示继续,返回 HttpResponse 则短路
\`\`\`

\`process_view\` 返回值:

- \`None\`:继续执行后续中间件和视图。
- \`HttpResponse\`:短路,直接返回这个响应(视图不执行)。

## process_exception():异常钩子

视图抛异常时调用:

\`\`\`python
class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        # 视图抛异常时调用
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"视图异常: {request.path}")

        # 返回 None:继续抛异常
        # 返回 HttpResponse:用这个响应替代 500
        from django.http import JsonResponse
        return JsonResponse({"error": "服务器内部错误"}, status=500)
\`\`\`

## 旧式中间件(了解)

Django 1.10 之前的「旧式中间件」用五个钩子方法:

\`\`\`python
class OldStyleMiddleware:
    def process_request(self, request):
        # 请求进来时(视图前)
        pass

    def process_view(self, request, view_func, view_args, view_kwargs):
        # 路由后、视图前
        pass

    def process_template_response(self, request, response):
        # 模板响应时
        pass

    def process_response(self, request, response):
        # 响应出去时
        return response

    def process_exception(self, request, exception):
        # 异常时
        pass
\`\`\`

新项目用新式即可,旧式了解就行(读老代码会看到)。

## 常用内置中间件

| 中间件 | 作用 |
|---|---|
| \`SecurityMiddleware\` | 安全:重写 HTTP→HTTPS、HSTS |
| \`SessionMiddleware\` | 启用 Session(\`request.session\`) |
| \`CommonMiddleware\` | URL 规范化(APPEND_SLASH、PREPEND_WWW) |
| \`CsrfViewMiddleware\` | CSRF 防护 |
| \`AuthenticationMiddleware\` | 注入 \`request.user\` |
| \`MessageMiddleware\` | 消息框架(\`messages\`) |
| \`XFrameOptionsMiddleware\` | 防点击劫持(X-Frame-Options) |
| \`GZipMiddleware\` | 压缩响应 |
| \`ConditionalGetMiddleware\` | 条件 GET(ETag/Last-Modified) |
| \`LocaleMiddleware\` | 国际化(语言切换) |
| \`FlatpageFallbackMiddleware\` | 扁平页面回退 |
| \`RedirectFallbackMiddleware\` | 重定向回退 |

\`AuthenticationMiddleware\` 特别重要:没有它,\`request.user\` 不存在(报 AttributeError)。

## 中间件 vs 装饰器

| 维度 | 中间件 | 装饰器 |
|---|---|---|
| 作用范围 | 全局所有请求 | 单个视图 |
| 配置位置 | settings.MIDDLEWARE | 视图函数上 |
| 适合场景 | 通用:认证、日志、CORS | 特定:某视图权限 |
| 性能 | 每个请求都过 | 只装饰的视图 |
| 灵活性 | 顺序敏感 | 互不影响 |

经验:能用装饰器解决就别用中间件,中间件是「全局兜底」用的。

## 完整示例:请求计时日志中间件

\`\`\`python
# blog/middleware.py
import time
import logging

logger = logging.getLogger("django.request")

class RequestTimingMiddleware:
    """记录每个请求的耗时、路径、用户,超过阈值告警"""

    # 慢请求阈值(秒)
    SLOW_THRESHOLD = 1.0

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # === 请求阶段(视图前)===
        start_time = time.time()
        request.start_time = start_time  # 存到 request 上,视图里也能用

        # 调用下一层
        response = self.get_response(request)

        # === 响应阶段(视图后)===
        duration = time.time() - start_time

        # 构造日志信息
        user = getattr(request, "user", None)
        username = user.username if user and user.is_authenticated else "anonymous"

        log_data = {
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration": round(duration, 3),
            "user": username,
            "ip": request.META.get("REMOTE_ADDR"),
        }

        # 慢请求告警
        if duration > self.SLOW_THRESHOLD:
            logger.warning(f"慢请求: {log_data}")
        else:
            logger.info(f"请求: {log_data}")

        # 加响应头(客户端能看到耗时)
        response["X-Response-Time"] = f"{duration:.3f}s"
        return response

    def process_exception(self, request, exception):
        # 视图异常时也记日志
        duration = time.time() - getattr(request, "start_time", time.time())
        logger.exception(
            f"视图异常: {request.method} {request.path} "
            f"耗时 {duration:.3f}s 异常: {exception}"
        )
        return None  # 返回 None 让异常继续抛
\`\`\`

\`\`\`python
# 注册到 settings.py
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # 自定义中间件
    "blog.middleware.RequestTimingMiddleware",
]
\`\`\`

另一个常用中间件:CORS(跨域资源共享,前后端分离必用):

\`\`\`python
class CORSMiddleware:
    """允许跨域请求"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 预检请求(OPTIONS)直接放行
        if request.method == "OPTIONS":
            response = self.get_response(request)
        else:
            response = self.get_response(request)

        # 加跨域头
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
\`\`\`

实际项目用 \`django-cors-headers\` 库更完善,这里只是示例原理。

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| request.user 不存在 | 漏 AuthenticationMiddleware | settings 加上 |
| 中间件顺序错 | 依赖关系乱 | Session 在 Auth 前 |
| __call__ 忘了调 get_response | 请求被吞 | 必须 self.get_response(request) |
| process_view 返回值错 | 短路或继续 | None 继续,HttpResponse 短路 |
| 中间件路径写错 | import 失败 | "app.module.ClassName" |
| __init__ 参数错 | 老式写法 | 新式只接 get_response |
| 改了中间件没重启 | 启动时构建链 | 重启服务 |
| 中间件里查数据库慢 | 每个请求都查 | 加缓存或换方案 |
| 异常中间件没返回 | 默认继续抛 | None 继续,HttpResponse 替代 |
| Session 读不到 | 中间件顺序 | Session 必须在用到它的之前 |

## 设计思想

中间件体现的设计哲学是「**洋葱模型 + 责任链**」。每个中间件是流水线上的一环,只关心自己的职责(认证、日志、压缩),通过 \`get_response\` 把控制权交给下一环。这种结构让通用横切逻辑(每个请求都要做的事)和业务逻辑(视图)彻底解耦。理解中间件的关键是分清「请求阶段」(调 \`get_response\` 前)和「响应阶段」(调 \`get_response\` 后),所有逻辑都挂在这两个时机上。顺序敏感是因为后置中间件可能依赖前置中间件的产物(如 Auth 依赖 Session)。
`,
  },

  // ============================================================
  // 第 28 章:Django 装饰器与权限
  // ============================================================
  {
    id: "django-decorator",
    group: "Django 视图与模板",
    icon: "🎫",
    title: "Django 装饰器与权限",
    content: `# Django 装饰器与权限

## 装饰器是什么

装饰器是 Python 的语法糖,本质是「**接收函数、返回函数**」的高阶函数。在视图上用装饰器,可以在不修改视图代码的前提下,给它加「前置检查」(是否登录、是否有权限、是否是某种 HTTP 方法)。

\`\`\`python
from django.contrib.auth.decorators import login_required

# @login_required 包裹视图,未登录用户访问会跳到登录页
@login_required
def profile(request):
    return render(request, "profile.html")
\`\`\`

等价于:

\`\`\`python
def profile(request):
    return render(request, "profile.html")
profile = login_required(profile)
\`\`\`

Django 提供一组内置装饰器覆盖常见场景。

## @login_required:必须登录

最常用的权限装饰器:

\`\`\`python
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    # 只有登录用户能访问
    return render(request, "dashboard.html")

# 自定义跳转和重定向参数
@login_required(login_url="/accounts/login/", redirect_field_name="next")
def settings(request):
    return render(request, "settings.html")
\`\`\`

未登录用户访问 → 跳转到 \`settings.LOGIN_URL\`(默认 \`/accounts/login/\`),并把当前 URL 作为 \`?next=...\` 参数带上,登录后跳回。

\`settings.LOGIN_URL\` 配置:

\`\`\`python
# settings.py
LOGIN_URL = "/login/"          # 未登录跳转到这里
LOGIN_REDIRECT_URL = "/"        # 登录成功后跳这里(没 next 参数时)
LOGOUT_REDIRECT_URL = "/"       # 登出后跳这里
\`\`\`

## @permission_required:需要权限

Django 自带「模型级权限」(每个 Model 自动有 add/change/delete/view 四种权限):

\`\`\`python
from django.contrib.auth.decorators import permission_required

@permission_required("blog.add_post", raise_exception=True)
def post_new(request):
    # 只有「能新增 post」权限的用户能访问
    ...

# 多个权限(默认 AND)
@permission_required(["blog.add_post", "blog.change_post"])
def post_edit(request, pk):
    ...

# raise_exception=True:无权限直接 403(不跳登录页)
# raise_exception=False(默认):无权限跳登录页
@permission_required("blog.delete_post", raise_exception=True)
def post_delete(request, pk):
    ...
\`\`\`

权限名格式是 \`<app>.<action>_<model>\`,如:

- \`blog.add_post\`:新增文章
- \`blog.change_post\`:修改文章
- \`blog.delete_post\`:删除文章
- \`blog.view_post\`:查看文章

这些权限在 \`makemigrations\` + \`migrate\` 后自动创建。

## @user_passes_test:自定义判断

内置装饰器不够用时,用 \`@user_passes_test\` 写自定义判断函数:

\`\`\`python
from django.contrib.auth.decorators import user_passes_test

def is_staff(user):
    return user.is_authenticated and user.is_staff

@user_passes_test(is_staff, login_url="/staff/login/")
def admin_dashboard(request):
    # 只有 staff 用户能访问
    ...

# 检查邮箱后缀
def is_internal_user(user):
    return user.is_authenticated and user.email.endswith("@company.com")

@user_passes_test(is_internal_user)
def internal_page(request):
    ...
\`\`\`

判断函数接收 \`user\` 参数,返回 \`True\` 通过,\`False\` 跳登录页。

## require_GET / require_POST / require_http_methods:HTTP 方法限制

限制视图只接受某种 HTTP 方法:

\`\`\`python
from django.views.decorators.http import (
    require_GET, require_POST, require_http_methods
)

@require_GET         # 只接受 GET
def post_detail(request, pk):
    ...

@require_POST        # 只接受 POST
def post_delete(request, pk):
    ...

@require_http_methods(["GET", "POST"])   # 接受 GET 和 POST
def post_edit(request, pk):
    ...

@require_http_methods(["GET", "HEAD"])  # 接受 GET 和 HEAD
def api_list(request):
    ...
\`\`\`

不匹配的方法返回 **405 Method Not Allowed**。这比手写 \`if request.method != "POST"\` 简洁。

## @csrf_exempt:取消 CSRF(慎用)

\`CsrfViewMiddleware\` 默认对所有 POST 校验 CSRF。极少数场景(API、webhook)要取消:

\`\`\`python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def webhook(request):
    # 第三方服务回调,没有 CSRF token
    ...
\`\`\`

⚠️ 慎用!取消 CSRF 等于放弃防 CSRF 攻击。只在「确实无法带 token」的场景用,并且要有其他鉴权(签名、IP 白名单)。

## @api_view(Django REST Framework)

DRF 提供 \`@api_view\` 把函数视图转成 API 视图:

\`\`\`python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def post_list(request):
    if request.method == "GET":
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
\`\`\`

\`@api_view\` 做了:解析 JSON 请求体、内容协商、DRF 异常处理、自动加权限检查。

## 自定义装饰器:检查用户角色

内置装饰器不够时,自己写:

\`\`\`python
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required

def role_required(*roles):
    """检查用户是否拥有指定角色之一"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            # 先确保登录
            if not request.user.is_authenticated:
                from django.contrib.auth.views import redirect_to_login
                return redirect_to_login(request.get_full_path())

            # 检查角色(user.profile.role 假设存了角色)
            user_role = getattr(request.user, "profile", None)
            if user_role and user_role.role in roles:
                return view_func(request, *args, **kwargs)
            raise PermissionDenied("需要角色:" + ", ".join(roles))
        return _wrapped
    return decorator

# 使用
@role_required("editor", "admin")
def post_publish(request, pk):
    # 只有 editor 或 admin 能发布
    ...
\`\`\`

\`functools.wraps\` 很重要:它让包装后的函数保留原函数的 \`__name__\`、\`__doc__\`,否则 URL 反向解析、调试会乱。

## 装饰器顺序

多个装饰器从下往上应用,从上往下执行:

\`\`\`python
@login_required          # 3. 最后应用,最外层
@permission_required("blog.add_post")  # 2. 中间应用
@require_POST            # 1. 先应用,最内层
def post_new(request):
    ...
\`\`\`

执行顺序(从外到内):

1. \`login_required\` 先检查:未登录跳走。
2. 登录了 → \`permission_required\` 检查:无权限跳走。
3. 有权限 → \`require_POST\` 检查:不是 POST 返回 405。
4. 是 POST → 执行 \`post_new\`。

⚠️ 顺序错了会出问题:比如 \`@require_POST\` 在最外层,GET 请求会直接 405(而不是跳登录)。

## 类视图用装饰器

类视图用 \`method_decorator\`:

\`\`\`python
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

# 方式 1:装饰整个类(应用到 dispatch)
@method_decorator(login_required, name="dispatch")
class PostCreateView(CreateView):
    model = Post
    fields = ["title", "content"]

# 方式 2:装饰单个方法
class PostCreateView(CreateView):
    model = Post
    fields = ["title", "content"]

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

# 方式 3:装饰多个方法
@method_decorator(login_required, name="dispatch")
@method_decorator(permission_required("blog.add_post"), name="post")
class PostCreateView(CreateView):
    model = Post
    fields = ["title", "content"]
\`\`\`

但更推荐用 Mixin(\`LoginRequiredMixin\`),更符合 CBV 风格。

## 完整示例:管理员才能发布文章

\`\`\`python
# blog/decorators.py
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

def author_required(model_class):
    """只有文章作者本人才能访问"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            pk = kwargs.get("pk")
            obj = get_object_or_404(model_class, pk=pk)
            if obj.author != request.user and not request.user.is_superuser:
                raise PermissionDenied("只有作者能操作")
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator

def editor_or_author_required(model_class):
    """编辑组成员或作者本人能访问"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            pk = kwargs.get("pk")
            obj = get_object_or_404(model_class, pk=pk)
            is_author = obj.author == request.user
            is_editor = request.user.groups.filter(name="editors").exists()
            if not (is_author or is_editor or request.user.is_superuser):
                raise PermissionDenied("需要作者或编辑权限")
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator
\`\`\`

\`\`\`python
# blog/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from django.views.decorators.http import require_POST
from .models import Post
from .forms import PostForm
from .decorators import author_required, editor_or_author_required

# 新建:需要登录 + add_post 权限
@login_required
@permission_required("blog.add_post", raise_exception=True)
def post_new(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            form.save_m2m()
            return redirect("blog:post_detail", pk=post.pk)
    else:
        form = PostForm()
    return render(request, "blog/post_form.html", {"form": form})

# 编辑:只有作者本人能改
@login_required
@author_required(Post)
def post_edit(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
        form = PostForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect("blog:post_detail", pk=post.pk)
    else:
        form = PostForm(instance=post)
    return render(request, "blog/post_form.html", {"form": form, "post": post})

# 发布:编辑或作者能发布
@login_required
@editor_or_author_required(Post)
@require_POST
def post_publish(request, pk):
    post = get_object_or_404(Post, pk=pk)
    post.status = "published"
    post.save()
    return redirect("blog:post_detail", pk=post.pk)

# 删除:需要 delete_post 权限 + 是作者
@login_required
@permission_required("blog.delete_post", raise_exception=True)
@author_required(Post)
def post_delete(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
        post.delete()
        return redirect("blog:post_list")
    return render(request, "blog/post_confirm_delete.html", {"post": post})
\`\`\`

\`\`\`python
# blog/urls.py
from django.urls import path
from . import views

app_name = "blog"
urlpatterns = [
    path("post/new/", views.post_new, name="post_new"),
    path("post/<int:pk>/edit/", views.post_edit, name="post_edit"),
    path("post/<int:pk>/publish/", views.post_publish, name="post_publish"),
    path("post/<int:pk>/delete/", views.post_delete, name="post_delete"),
]
\`\`\`

## 易错点小结

| 错误 | 原因 | 解决 |
|---|---|---|
| 装饰器顺序错 | 权限检查时机不对 | 登录在最外,HTTP 方法在最内 |
| 自定义装饰器没 wraps | 函数名丢失 | 加 @wraps(view_func) |
| permission_required 名字错 | 权限不存在 | 格式 app.action_model |
| require_POST 配 GET | 返回 405 | 检查前端请求方法 |
| csrf_exempt 滥用 | 安全漏洞 | 只在 webhook 等场景 |
| 类视图直接用装饰器 | dispatch 没被装饰 | 用 method_decorator |
| LOGIN_URL 没配 | 跳转 404 | settings 设 LOGIN_URL |
| 装饰器参数错 | 漏括号 | @role_required("admin") 不是 @role_required |
| raise_exception 默认 False | 无权限跳登录 | 改 True 直接 403 |
| 多装饰器逻辑冲突 | 互相覆盖 | 想清楚执行顺序 |

## 设计思想

装饰器体现的设计哲学是「**横切关注点分离 + 函数组合**」。权限检查、HTTP 方法限制、CSRF 校验这些「和业务无关但每个视图都要做」的逻辑,抽成装饰器,视图函数就只剩业务逻辑本身。多个装饰器像「洋葱」层层包裹,每个负责一件事,通过组合实现复杂权限策略。理解装饰器的关键不在语法(那只是 \`f = decorator(f)\` 的糖),而在「执行顺序」(从下往上应用、从上往下执行)和「职责划分」(认证 vs 授权 vs 方法限制是不同层面)。
`,
  },
];
