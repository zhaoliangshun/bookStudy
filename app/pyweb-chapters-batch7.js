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
# 定义函数 post_list，参数: request
def post_list(request):
    # 定义变量 posts，赋值为 Post.objects.all()
    posts = Post.objects.all()
    # 返回 render(request, "blog/post_list.html", {"posts": posts})
    return render(request, "blog/post_list.html", {"posts": posts})

# 定义函数 post_detail，参数: request, pk
def post_detail(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # 返回 render(request, "blog/post_detail.html", {"post": post})
    return render(request, "blog/post_detail.html", {"post": post})

# 类视图:封装通用逻辑
# 定义类 PostListView，继承 ListView
class PostListView(ListView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_list.html"
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
# 从 django.urls 导入 path
from django.urls import path
# 从 .views 导入 PostListView
from .views import PostListView

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("", PostListView.as_view(), name="post_list"),
# ]
]
\`\`\`

\`as_view()\` 返回一个函数,这个函数被调用时会:

1. 实例化视图类(\`view = MyView()\`)。
2. 调用 \`setup()\` 注入 request、args、kwargs。
3. 调用 \`dispatch()\`,根据 \`request.method\` 分发到对应方法(\`get\`/\`post\`/\`put\`/\`delete\`)。
4. 返回 HTTP 响应。

\`\`\`python
# dispatch 的等价逻辑
# 定义类 MyView，继承 View
class MyView(View):
    # 定义函数 dispatch，参数: self, request, *args, **kwargs
    def dispatch(self, request, *args, **kwargs):
        method = request.method.lower()  # "get"/"post"
        # 定义变量 handler，赋值为 getattr(self, method, self.http_method_not_al...
        handler = getattr(self, method, self.http_method_not_allowed)
        # 返回 handler(request, *args, **kwargs)
        return handler(request, *args, **kwargs)
\`\`\`

## HTTP 方法分发

类视图最大的好处是「**按 HTTP 方法分发**」,不用手写 \`if request.method == "POST"\`:

\`\`\`python
# 从 django.views 导入 View
from django.views import View
# 从 django.http 导入 HttpResponse
from django.http import HttpResponse

# 定义类 ContactView，继承 View
class ContactView(View):
    # 定义函数 get，参数: self, request
    def get(self, request):
        # GET 请求:显示空表单
        # 返回 render(request, "contact.html", {"form": ContactForm()})
        return render(request, "contact.html", {"form": ContactForm()})

    # 定义函数 post，参数: self, request
    def post(self, request):
        # POST 请求:处理表单提交
        # 定义变量 form，赋值为 ContactForm(request.POST)
        form = ContactForm(request.POST)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 处理数据...
            # 返回 redirect("success")
            return redirect("success")
        # 返回 render(request, "contact.html", {"form": form})
        return render(request, "contact.html", {"form": form})
\`\`\`

对比函数视图的写法:

\`\`\`python
# 函数视图:要手动判断 method
# 定义函数 contact，参数: request
def contact(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 form，赋值为 ContactForm(request.POST)
        form = ContactForm(request.POST)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 返回 redirect("success")
            return redirect("success")
    # 否则执行
    else:
        # 定义变量 form，赋值为 ContactForm()
        form = ContactForm()
    # 返回 render(request, "contact.html", {"form": form})
    return render(request, "contact.html", {"form": form})
\`\`\`

## 通用视图(Generic Views)

Django 内置一套「通用视图」,把常见 CRUD 场景封装成基类。这是 CBV 的精华。

### 1. ListView:列表

\`\`\`python
# 从 django.views.generic 导入 ListView
from django.views.generic import ListView
# 从 .models 导入 Post
from .models import Post

# 定义类 PostListView，继承 ListView
class PostListView(ListView):
    model = Post                              # 数据模型
    template_name = "blog/post_list.html"    # 模板路径
    context_object_name = "posts"             # 模板里的变量名
    paginate_by = 10                          # 每页 10 条(自动分页)
    ordering = ["-created_at"]                # 默认排序

    # 重写 get_queryset 自定义查询
    # 定义函数 get_queryset，参数: self
    def get_queryset(self):
        # 只返回已发布文章,且按当前用户过滤
        # 定义变量 qs，赋值为 super().get_queryset()
        qs = super().get_queryset()
        # 返回 qs.filter(status="published")
        return qs.filter(status="published")

    # 重写 get_context_data 加额外上下文
    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # context["title"] = "文章列表"
        context["title"] = "文章列表"
        # context["tags"] = Tag.objects.all()
        context["tags"] = Tag.objects.all()
        # 返回 context
        return context
\`\`\`

模板里可用的变量:

- \`{{ posts }}\`:文章列表(用 context_object_name)。
- \`{{ page_obj }}\`:当前页对象(分页用)。
- \`{{ is_paginated }}\`:是否分页。
- \`{{ paginator }}\`:分页器对象。

### 2. DetailView:详情

\`\`\`python
# 从 django.views.generic 导入 DetailView
from django.views.generic import DetailView

# 定义类 PostDetailView，继承 DetailView
class PostDetailView(DetailView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_detail.html"
    template_name = "blog/post_detail.html"
    # 定义变量 context_object_name，赋值为 "post"
    context_object_name = "post"

    # 默认从 URL 的 <int:pk> 取主键查对象
    # 也可以用 slug
    # 定义变量 slug_field，赋值为 "slug"
    slug_field = "slug"
    # 定义变量 slug_url_kwarg，赋值为 "slug"
    slug_url_kwarg = "slug"
\`\`\`

### 3. CreateView:创建

\`\`\`python
# 从 django.views.generic 导入 CreateView
from django.views.generic import CreateView
# 从 django.urls 导入 reverse_lazy
from django.urls import reverse_lazy

# 定义类 PostCreateView，继承 CreateView
class PostCreateView(CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    fields = ["title", "content", "tags"]    # 表单字段
    success_url = reverse_lazy("blog:post_list")  # 成功后跳转

    # 重写 form_valid 在保存前注入数据
    # 定义函数 form_valid，参数: self, form
    def form_valid(self, form):
        form.instance.author = self.request.user  # 自动填作者
        # 返回 super().form_valid(form)
        return super().form_valid(form)
\`\`\`

\`CreateView\` 流程:

1. GET → 渲染空表单。
2. POST → 校验表单,\`form_valid\` 保存并跳转,\`form_invalid\` 重新渲染。

### 4. UpdateView:更新

\`\`\`python
# 定义类 PostUpdateView，继承 UpdateView
class PostUpdateView(UpdateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    # 定义列表 fields
    fields = ["title", "content", "tags"]
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")
\`\`\`

和 CreateView 几乎一样,只是 GET 时预填已有数据。

### 5. DeleteView:删除

\`\`\`python
# 定义类 PostDeleteView，继承 DeleteView
class PostDeleteView(DeleteView):
    # 定义变量 model，赋值为 Post
    model = Post
    template_name = "blog/post_confirm_delete.html"  # 确认页
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")
\`\`\`

流程:GET 显示确认页,POST 才真删(避免 GET 请求误删)。

### 6. TemplateView:静态模板

\`\`\`python
# 从 django.views.generic 导入 TemplateView
from django.views.generic import TemplateView

# 定义类 AboutView，继承 TemplateView
class AboutView(TemplateView):
    # 定义变量 template_name，赋值为 "about.html"
    template_name = "about.html"

    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # context["title"] = "关于我们"
        context["title"] = "关于我们"
        # 返回 context
        return context
\`\`\`

适合不需要查数据库的静态页(关于、隐私政策等)。

## FormView:表单视图

如果表单不直接对应 Model,用 \`FormView\`:

\`\`\`python
# 从 django.views.generic 导入 FormView
from django.views.generic import FormView
# 从 .forms 导入 ContactForm
from .forms import ContactForm

# 定义类 ContactView，继承 FormView
class ContactView(FormView):
    # 定义变量 template_name，赋值为 "contact.html"
    template_name = "contact.html"
    # 定义变量 form_class，赋值为 ContactForm
    form_class = ContactForm
    # 定义变量 success_url，赋值为 reverse_lazy("contact_success")
    success_url = reverse_lazy("contact_success")

    # 定义函数 form_valid，参数: self, form
    def form_valid(self, form):
        # 表单校验通过,处理数据(如发邮件)
        # 调用 form.send_email()
        form.send_email()
        # 返回 super().form_valid(form)
        return super().form_valid(form)
\`\`\`

## LoginRequiredMixin:权限控制

类视图加权限用 Mixin:

\`\`\`python
# 从 django.contrib.auth.mixins 导入 LoginRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin

# 必须登录才能访问
# 定义类 PostCreateView，继承 LoginRequiredMixin, CreateView
class PostCreateView(LoginRequiredMixin, CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]
    # 未登录会跳到 LOGIN_URL

    # 定义函数 form_valid，参数: self, form
    def form_valid(self, form):
        # form.instance.author = self.request.user
        form.instance.author = self.request.user
        # 返回 super().form_valid(form)
        return super().form_valid(form)

# 只有作者本人能编辑
# 从 django.contrib.auth.mixins 导入 UserPassesTestMixin
from django.contrib.auth.mixins import UserPassesTestMixin

# 定义类 PostUpdateView，继承 LoginRequiredMixin, UserPassesTestMixin, UpdateView
class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]

    # 定义函数 test_func，参数: self
    def test_func(self):
        # 只有本文作者能编辑
        # 定义变量 post，赋值为 self.get_object()
        post = self.get_object()
        # 返回 post.author == self.request.user
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
# 定义类 RecentPostsMixin
class RecentPostsMixin:
    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # context["recent_posts"] = Post.objects.all()[:5]
        context["recent_posts"] = Post.objects.all()[:5]
        # 返回 context
        return context

# 组合使用
# 定义类 PostDetailView，继承 RecentPostsMixin, DetailView
class PostDetailView(RecentPostsMixin, DetailView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_detail.html"
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
# 定义类 PostUpdateView，继承 LoginRequiredMixin, UpdateView
class PostUpdateView(LoginRequiredMixin, UpdateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]

    # 动态成功跳转:回到详情页
    # 定义函数 get_success_url，参数: self
    def get_success_url(self):
        # 返回 reverse("blog:post_detail", kwargs={"pk": self.object.pk})
        return reverse("blog:post_detail", kwargs={"pk": self.object.pk})

    # 把 request 传给表单(表单里能用 request.user)
    # 定义函数 get_form_kwargs，参数: self
    def get_form_kwargs(self):
        # 定义变量 kwargs，赋值为 super().get_form_kwargs()
        kwargs = super().get_form_kwargs()
        # kwargs["request"] = self.request
        kwargs["request"] = self.request
        # 返回 kwargs
        return kwargs

    # 最早期拦截:限制只有作者能访问
    # 定义函数 dispatch，参数: self, request, *args, **kwargs
    def dispatch(self, request, *args, **kwargs):
        # 定义变量 post，赋值为 self.get_object()
        post = self.get_object()
        # 条件判断：如果 post.author != request.user
        if post.author != request.user:
            # 抛出 PermissionDenied 异常
            raise PermissionDenied
        # 返回 super().dispatch(request, *args, **kwargs)
        return super().dispatch(request, *args, **kwargs)
\`\`\`

## 完整示例:博客 CRUD 全用通用视图

\`\`\`python
# blog/views.py
# 从 django.urls 导入 reverse_lazy, reverse
from django.urls import reverse_lazy, reverse
# 从 django.contrib.auth.mixins 导入 LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
# 从 django.views.generic 导入（多行）
from django.views.generic import (
    # ListView, DetailView, CreateView, UpdateView, Dele
    ListView, DetailView, CreateView, UpdateView, DeleteView
# )
)
# 从 .models 导入 Post, Tag
from .models import Post, Tag

# 定义类 PostListView，继承 ListView
class PostListView(ListView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_list.html"
    template_name = "blog/post_list.html"
    # 定义变量 context_object_name，赋值为 "posts"
    context_object_name = "posts"
    # 定义变量 paginate_by，赋值为 10
    paginate_by = 10

    # 定义函数 get_queryset，参数: self
    def get_queryset(self):
        # 默认只看已发布;有 ?q= 就搜索
        # 定义变量 qs，赋值为 Post.objects.filter(status="published")
        qs = Post.objects.filter(status="published")
        # 定义变量 q，赋值为 self.request.GET.get("q")
        q = self.request.GET.get("q")
        # 条件判断：如果 q
        if q:
            # 定义变量 qs，赋值为 qs.filter(title__icontains=q)
            qs = qs.filter(title__icontains=q)
        # 返回 qs.select_related("author").prefetch_related("tags")
        return qs.select_related("author").prefetch_related("tags")

    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # context["q"] = self.request.GET.get("q", "")
        context["q"] = self.request.GET.get("q", "")
        # 返回 context
        return context

# 定义类 PostDetailView，继承 DetailView
class PostDetailView(DetailView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_detail.html"
    template_name = "blog/post_detail.html"
    # 定义变量 context_object_name，赋值为 "post"
    context_object_name = "post"

    # 定义函数 get_context_data，参数: self, **kwargs
    def get_context_data(self, **kwargs):
        # 定义变量 context，赋值为 super().get_context_data(**kwargs)
        context = super().get_context_data(**kwargs)
        # 增加浏览量
        # 调用 self.object.increase_views()
        self.object.increase_views()
        # 相关文章
        # context["related"] = self.object.tags.first().post
        context["related"] = self.object.tags.first().posts.exclude(pk=self.object.pk)[:3] if self.object.tags.exists() else []
        # 返回 context
        return context

# 定义类 PostCreateView，继承 LoginRequiredMixin, CreateView
class PostCreateView(LoginRequiredMixin, CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    # 定义列表 fields
    fields = ["title", "content", "status", "tags"]

    # 定义函数 form_valid，参数: self, form
    def form_valid(self, form):
        # form.instance.author = self.request.user
        form.instance.author = self.request.user
        # 返回 super().form_valid(form)
        return super().form_valid(form)

# 定义类 PostUpdateView，继承 LoginRequiredMixin, UserPassesTestMixin, UpdateView
class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_form.html"
    template_name = "blog/post_form.html"
    # 定义列表 fields
    fields = ["title", "content", "status", "tags"]

    # 只有作者能编辑
    # 定义函数 test_func，参数: self
    def test_func(self):
        # 定义变量 post，赋值为 self.get_object()
        post = self.get_object()
        # 返回 post.author == self.request.user
        return post.author == self.request.user

# 定义类 PostDeleteView，继承 LoginRequiredMixin, UserPassesTestMixin, DeleteView
class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义变量 template_name，赋值为 "blog/post_confirm_delete.html"
    template_name = "blog/post_confirm_delete.html"
    # 定义变量 success_url，赋值为 reverse_lazy("blog:post_list")
    success_url = reverse_lazy("blog:post_list")

    # 定义函数 test_func，参数: self
    def test_func(self):
        # 定义变量 post，赋值为 self.get_object()
        post = self.get_object()
        # 返回 post.author == self.request.user
        return post.author == self.request.user
\`\`\`

\`\`\`python
# blog/urls.py
# 从 django.urls 导入 path
from django.urls import path
# 从 .views 导入（多行）
from .views import (
    # PostListView, PostDetailView,
    PostListView, PostDetailView,
    # PostCreateView, PostUpdateView, PostDeleteView,
    PostCreateView, PostUpdateView, PostDeleteView,
# )
)

# 定义变量 app_name，赋值为 "blog"
app_name = "blog"

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("", PostListView.as_view(), name="post_list"),
    # 调用 path()
    path("post/<int:pk>/", PostDetailView.as_view(), name="post_detail"),
    # 调用 path()
    path("post/new/", PostCreateView.as_view(), name="post_create"),
    # 调用 path()
    path("post/<int:pk>/edit/", PostUpdateView.as_view(), name="post_edit"),
    # 调用 path()
    path("post/<int:pk>/delete/", PostDeleteView.as_view(), name="post_delete"),
# ]
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
# 从 django 导入 forms
from django import forms

# 定义类 ContactForm，继承 forms.Form
class ContactForm(forms.Form):
    # 定义变量 name，赋值为 forms.CharField(max_length=50, label="姓名")
    name = forms.CharField(max_length=50, label="姓名")
    # 定义变量 email，赋值为 forms.EmailField(label="邮箱")
    email = forms.EmailField(label="邮箱")
    # 定义变量 message，赋值为 forms.CharField(widget=forms.Textarea, label=...
    message = forms.CharField(widget=forms.Textarea, label="留言")
\`\`\`

这一份定义同时用于:渲染 HTML、接收数据、校验。

## 字段类型与校验

每个表单字段自带「校验规则」:

\`\`\`python
# 定义类 RegisterForm，继承 forms.Form
class RegisterForm(forms.Form):
    # 必填(默认),最少 3 字符
    # 定义变量 username，赋值为 forms.CharField(min_length=3, max_length=20, ...
    username = forms.CharField(min_length=3, max_length=20, label="用户名")

    # 密码:渲染成 <input type="password">
    # 定义变量 password，赋值为 forms.CharField(
    password = forms.CharField(
        # 定义变量 widget，赋值为 forms.PasswordInput,
        widget=forms.PasswordInput,
        # 定义变量 min_length，赋值为 8,
        min_length=8,
        # 定义变量 label，赋值为 "密码",
        label="密码",
    # )
    )

    # 邮箱:自动校验格式
    # 定义变量 email，赋值为 forms.EmailField(label="邮箱")
    email = forms.EmailField(label="邮箱")

    # 整数:校验是数字
    # 定义变量 age，赋值为 forms.IntegerField(min_value=0, max_value=150...
    age = forms.IntegerField(min_value=0, max_value=150, required=False)

    # 选择字段
    # 定义变量 gender，赋值为 forms.ChoiceField(
    gender = forms.ChoiceField(
        # 定义列表 choices
        choices=[("M", "男"), ("F", "女")],
        # 定义变量 widget，赋值为 forms.RadioSelect,
        widget=forms.RadioSelect,
    # )
    )

    # 多选
    # 定义变量 interests，赋值为 forms.MultipleChoiceField(
    interests = forms.MultipleChoiceField(
        # 定义列表 choices
        choices=[("py", "Python"), ("js", "JavaScript"), ("go", "Go")],
        # 定义变量 widget，赋值为 forms.CheckboxSelectMultiple,
        widget=forms.CheckboxSelectMultiple,
        # 定义变量 required，赋值为 False,
        required=False,
    # )
    )

    # 布尔
    # 定义变量 agree，赋值为 forms.BooleanField(required=True, label="同意条款...
    agree = forms.BooleanField(required=True, label="同意条款")

    # 日期
    # 定义变量 birthday，赋值为 forms.DateField(widget=forms.SelectDateWidget...
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
# 从 django 导入 forms
from django import forms
# 从 .models 导入 Post
from .models import Post

# 定义类 PostForm，继承 forms.ModelForm
class PostForm(forms.ModelForm):
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 Post
        model = Post
        fields = ["title", "content", "status", "tags"]  # 包含哪些字段
        # 或 fields = "__all__"  全部字段
        # 或 exclude = ["views"]  排除某些字段

        # 自定义 widget(控件)
        # 定义字典 widgets
        widgets = {
            # "content": forms.Textarea(attrs={"rows": 10, "clas
            "content": forms.Textarea(attrs={"rows": 10, "class": "form-control"}),
            # "status": forms.Select(attrs={"class": "form-contr
            "status": forms.Select(attrs={"class": "form-control"}),
        # }
        }

        # 标签
        # 定义字典 labels
        labels = {
            # "title": "标题",
            "title": "标题",
            # "content": "正文",
            "content": "正文",
        # }
        }

        # 提示
        # 定义字典 help_texts
        help_texts = {
            # "title": "请输入有吸引力的标题",
            "title": "请输入有吸引力的标题",
        # }
        }

        # 错误信息
        # 定义字典 error_messages
        error_messages = {
            # "title": {
            "title": {
                # "required": "标题不能为空",
                "required": "标题不能为空",
                # "max_length": "标题最多 200 字",
                "max_length": "标题最多 200 字",
            # },
            },
        # }
        }
\`\`\`

ModelForm 的好处:

- 字段定义不用重复(从 Model 读)。
- \`form.save()\` 直接存数据库。
- Model 改了,Form 自动跟上。

## 表单渲染

### 1. 自动渲染

\`\`\`html
# <form method="post">
<form method="post">
    # {% csrf_token %}
    {% csrf_token %}
    # {{ form.as_p }}        <!-- 每个字段一个 <p> -->
    {{ form.as_p }}        <!-- 每个字段一个 <p> -->
    # <!-- 或 {{ form.as_table }}  表格形式 -->
    <!-- 或 {{ form.as_table }}  表格形式 -->
    # <!-- 或 {{ form.as_ul }}     列表形式 -->
    <!-- 或 {{ form.as_ul }}     列表形式 -->
    # <button type="submit">提交</button>
    <button type="submit">提交</button>
# </form>
</form>
\`\`\`

\`as_p\` 渲染:每个字段一个 \`<p>\`,包含 \`<label>\` + \`<input>\` + 错误信息。简单但样式固定。

### 2. 手动渲染字段

要自定义布局,逐字段渲染:

\`\`\`html
# <form method="post">
<form method="post">
    # {% csrf_token %}
    {% csrf_token %}

    # <div class="form-group">
    <div class="form-group">
        # {{ form.title.label_tag }}
        {{ form.title.label_tag }}
        # {{ form.title }}
        {{ form.title }}
        # {% if form.title.errors %}
        {% if form.title.errors %}
            # <div class="error">{{ form.title.errors }}</div>
            <div class="error">{{ form.title.errors }}</div>
        # {% endif %}
        {% endif %}
    # </div>
    </div>

    # <div class="form-group">
    <div class="form-group">
        # {{ form.content.label_tag }}
        {{ form.content.label_tag }}
        # {{ form.content }}
        {{ form.content }}
        # {{ form.content.errors }}
        {{ form.content.errors }}
    # </div>
    </div>

    # <button type="submit">提交</button>
    <button type="submit">提交</button>
# </form>
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
# <form method="post">
<form method="post">
    # {% csrf_token %}
    {% csrf_token %}
    # {% for field in form %}
    {% for field in form %}
        # <div class="form-group {% if field.errors %}has-er
        <div class="form-group {% if field.errors %}has-error{% endif %}">
            # {{ field.label_tag }}
            {{ field.label_tag }}
            # {{ field }}
            {{ field }}
            # {% if field.help_text %}
            {% if field.help_text %}
                # <small>{{ field.help_text }}</small>
                <small>{{ field.help_text }}</small>
            # {% endif %}
            {% endif %}
            # {{ field.errors }}
            {{ field.errors }}
        # </div>
        </div>
    # {% endfor %}
    {% endfor %}
    # <button type="submit">提交</button>
    <button type="submit">提交</button>
# </form>
</form>
\`\`\`

## 表单校验流程

视图里典型用法:

\`\`\`python
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect
# 从 .forms 导入 PostForm
from .forms import PostForm

# 定义函数 post_new，参数: request
def post_new(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 用 POST 数据构造表单
        # 定义变量 form，赋值为 PostForm(request.POST)
        form = PostForm(request.POST)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 校验通过,form.cleaned_data 是清洗后的数据
            post = form.save(commit=False)  # 不立即存,先改一下
            # post.author = request.user
            post.author = request.user
            # 调用 post.save()
            post.save()
            form.save_m2m()  # 保存多对多关系
            # 返回 redirect("blog:post_detail", pk=post.pk)
            return redirect("blog:post_detail", pk=post.pk)
    # 否则执行
    else:
        # GET 请求:空表单
        # 定义变量 form，赋值为 PostForm()
        form = PostForm()

    # 返回 render(request, "blog/post_form.html", {"form": form})
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
# 定义变量 form，赋值为 ContactForm(request.POST)
form = ContactForm(request.POST)
# 条件判断：如果 form.is_valid()
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
# 定义变量 form，赋值为 PostForm(request.POST)
form = PostForm(request.POST)
# 条件判断：如果 not form.is_valid()
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
# 定义类 RegisterForm，继承 forms.Form
class RegisterForm(forms.Form):
    # 定义变量 username，赋值为 forms.CharField(max_length=20)
    username = forms.CharField(max_length=20)
    # 定义变量 password，赋值为 forms.CharField(widget=forms.PasswordInput, m...
    password = forms.CharField(widget=forms.PasswordInput, min_length=8)
    # 定义变量 password2，赋值为 forms.CharField(widget=forms.PasswordInput, l...
    password2 = forms.CharField(widget=forms.PasswordInput, label="确认密码")

    # 字段级校验:用户名是否已存在
    # 定义函数 clean_username，参数: self
    def clean_username(self):
        # 定义变量 username，赋值为 self.cleaned_data["username"]
        username = self.cleaned_data["username"]
        # 条件判断：如果 User.objects.filter(username=username).exists()
        if User.objects.filter(username=username).exists():
            # 抛出 forms 异常
            raise forms.ValidationError("用户名已存在")
        return username  # 必须 return

    # 表单级校验:两次密码是否一致
    # 定义函数 clean，参数: self
    def clean(self):
        # 定义变量 cleaned_data，赋值为 super().clean()
        cleaned_data = super().clean()
        # 定义变量 password，赋值为 cleaned_data.get("password")
        password = cleaned_data.get("password")
        # 定义变量 password2，赋值为 cleaned_data.get("password2")
        password2 = cleaned_data.get("password2")
        # 条件判断：如果 password and password2 and password != password2
        if password and password2 and password != password2:
            # raise 会绑定到 password2 字段
            # 调用 self.add_error()
            self.add_error("password2", "两次密码不一致")
        # 返回 cleaned_data
        return cleaned_data
\`\`\`

两种方式:

- \`clean_<field>\`:校验单字段,只管自己。\`raise ValidationError\` 绑到该字段。
- \`clean()\`:校验多字段关系(如密码确认)。\`add_error(field, msg)\` 绑到指定字段。

## CSRF token

POST 表单必须带 CSRF token,否则 Django 拒绝(403):

\`\`\`html
# <form method="post">
<form method="post">
    # {% csrf_token %}    <!-- 生成隐藏字段,提交时校验 -->
    {% csrf_token %}    <!-- 生成隐藏字段,提交时校验 -->
    # <!-- 表单字段 -->
    <!-- 表单字段 -->
# </form>
</form>
\`\`\`

CSRF(Cross-Site Request Forgery)是攻击者诱导用户在你已登录的站点上执行非自愿操作。Django 给每个 session 一个随机 token,表单提交时比对,token 不匹配就拒绝。

\`{% csrf_token %}\` 渲染成:

\`\`\`html
# <input type="hidden" name="csrfmiddlewaretoken" va
<input type="hidden" name="csrfmiddlewaretoken" value="abc123xyz...">
\`\`\`

AJAX 请求要手动带 token(从 cookie 读):

\`\`\`javascript
// 从 cookie 取 csrftoken
// 定义函数 getCookie
function getCookie(name) {
    // ... 读 cookie ...
// }
}
// fetch("/api/post/", {
fetch("/api/post/", {
// method: "POST",
    method: "POST",
// headers: {
    headers: {
// "X-CSRFToken": getCookie("csrftoken"),
        "X-CSRFToken": getCookie("csrftoken"),
// "Content-Type": "application/json",
        "Content-Type": "application/json",
// },
    },
// body: JSON.stringify(data),
    body: JSON.stringify(data),
// });
});
\`\`\`

## 完整示例:文章发布表单

\`\`\`python
# blog/forms.py
# 从 django 导入 forms
from django import forms
# 从 .models 导入 Post
from .models import Post

# 定义类 PostForm，继承 forms.ModelForm
class PostForm(forms.ModelForm):
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 Post
        model = Post
        # 定义列表 fields
        fields = ["title", "content", "status", "tags"]
        # 定义字典 widgets
        widgets = {
            # "title": forms.TextInput(attrs={"class": "form-con
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "文章标题"}),
            # "content": forms.Textarea(attrs={"class": "form-co
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 15}),
            # "status": forms.Select(attrs={"class": "form-contr
            "status": forms.Select(attrs={"class": "form-control"}),
            # "tags": forms.CheckboxSelectMultiple,
            "tags": forms.CheckboxSelectMultiple,
        # }
        }
        # 定义字典 labels
        labels = {
            # "title": "标题",
            "title": "标题",
            # "content": "正文",
            "content": "正文",
            # "status": "状态",
            "status": "状态",
            # "tags": "标签",
            "tags": "标签",
        # }
        }

    # 自定义校验:标题不能含「测试」二字(示例)
    # 定义函数 clean_title，参数: self
    def clean_title(self):
        # 定义变量 title，赋值为 self.cleaned_data["title"]
        title = self.cleaned_data["title"]
        # 条件判断：如果 "测试" in title
        if "测试" in title:
            # 抛出 forms 异常
            raise forms.ValidationError("标题不能含敏感词「测试」")
        # 返回 title
        return title

    # 表单级校验:草稿状态不强制要正文
    # 定义函数 clean，参数: self
    def clean(self):
        # 定义变量 cleaned_data，赋值为 super().clean()
        cleaned_data = super().clean()
        # 定义变量 status，赋值为 cleaned_data.get("status")
        status = cleaned_data.get("status")
        # 定义变量 content，赋值为 cleaned_data.get("content")
        content = cleaned_data.get("content")
        # 条件判断：如果 status == "published" and not content
        if status == "published" and not content:
            # 调用 self.add_error()
            self.add_error("content", "已发布文章必须有正文")
        # 返回 cleaned_data
        return cleaned_data
\`\`\`

\`\`\`python
# blog/views.py
# 从 django.shortcuts 导入 render, redirect
from django.shortcuts import render, redirect
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required
# 从 .forms 导入 PostForm
from .forms import PostForm

# 装饰器：login_required
@login_required
# 定义函数 post_new，参数: request
def post_new(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 form，赋值为 PostForm(request.POST)
        form = PostForm(request.POST)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 定义变量 post，赋值为 form.save(commit=False)
            post = form.save(commit=False)
            # post.author = request.user
            post.author = request.user
            # 调用 post.save()
            post.save()
            form.save_m2m()  # 保存多对多(tags)
            # 返回 redirect("blog:post_detail", pk=post.pk)
            return redirect("blog:post_detail", pk=post.pk)
    # 否则执行
    else:
        # 定义变量 form，赋值为 PostForm()
        form = PostForm()
    # 返回 render(request, "blog/post_form.html", {"form": form})
    return render(request, "blog/post_form.html", {"form": form})

# 装饰器：login_required
@login_required
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # 条件判断：如果 post.author != request.user
    if post.author != request.user:
        # 抛出 PermissionDenied 异常
        raise PermissionDenied
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        form = PostForm(request.POST, instance=post)  # instance 预填
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 调用 form.save()
            form.save()
            # 返回 redirect("blog:post_detail", pk=post.pk)
            return redirect("blog:post_detail", pk=post.pk)
    # 否则执行
    else:
        form = PostForm(instance=post)  # 编辑:预填已有数据
    # 返回 render(request, "blog/post_form.html", {"form": form, "post": post})
    return render(request, "blog/post_form.html", {"form": form, "post": post})
\`\`\`

\`\`\`html
# <!-- templates/blog/post_form.html -->
<!-- templates/blog/post_form.html -->
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block content %}
{% block content %}
# <h1>{% if post %}编辑文章{% else %}新建文章{% endif %}</h1
<h1>{% if post %}编辑文章{% else %}新建文章{% endif %}</h1>

# <form method="post">
<form method="post">
    # {% csrf_token %}
    {% csrf_token %}

    # <div class="form-group">
    <div class="form-group">
        # {{ form.title.label_tag }}
        {{ form.title.label_tag }}
        # {{ form.title }}
        {{ form.title }}
        # {{ form.title.errors }}
        {{ form.title.errors }}
        # {{ form.title.help_text }}
        {{ form.title.help_text }}
    # </div>
    </div>

    # <div class="form-group">
    <div class="form-group">
        # {{ form.content.label_tag }}
        {{ form.content.label_tag }}
        # {{ form.content }}
        {{ form.content }}
        # {{ form.content.errors }}
        {{ form.content.errors }}
    # </div>
    </div>

    # <div class="form-group">
    <div class="form-group">
        # {{ form.status.label_tag }}
        {{ form.status.label_tag }}
        # {{ form.status }}
        {{ form.status }}
        # {{ form.status.errors }}
        {{ form.status.errors }}
    # </div>
    </div>

    # <div class="form-group">
    <div class="form-group">
        # <label>{{ form.tags.label }}</label>
        <label>{{ form.tags.label }}</label>
        # {% for tag in form.tags %}
        {% for tag in form.tags %}
            # <label class="checkbox-inline">
            <label class="checkbox-inline">
                # {{ tag.tag }} {{ tag.choice_label }}
                {{ tag.tag }} {{ tag.choice_label }}
            # </label>
            </label>
        # {% endfor %}
        {% endfor %}
        # {{ form.tags.errors }}
        {{ form.tags.errors }}
    # </div>
    </div>

    # <button type="submit" class="btn btn-primary">保存</
    <button type="submit" class="btn btn-primary">保存</button>
    # <a href="{% url 'blog:post_list' %}" class="btn bt
    <a href="{% url 'blog:post_list' %}" class="btn btn-default">取消</a>
# </form>
</form>
# {% endblock %}
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
# 定义列表 MIDDLEWARE
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",      # 1. 安全
    # "django.contrib.sessions.middleware.SessionMiddlew
    "django.contrib.sessions.middleware.SessionMiddleware", # 2. Session
    "django.middleware.common.CommonMiddleware",         # 3. 通用
    "django.middleware.csrf.CsrfViewMiddleware",          # 4. CSRF
    # "django.contrib.auth.middleware.AuthenticationMidd
    "django.contrib.auth.middleware.AuthenticationMiddleware", # 5. 认证
    "django.contrib.messages.middleware.MessageMiddleware",  # 6. 消息
    # "django.middleware.clickjacking.XFrameOptionsMiddl
    "django.middleware.clickjacking.XFrameOptionsMiddleware", # 7. 防点击劫持
# ]
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
# 导入 time 模块
import time

# 定义类 TimingMiddleware
class TimingMiddleware:
    # """请求计时中间件:记录每个请求耗时"""
    """请求计时中间件:记录每个请求耗时"""

    # 定义函数 __init__，参数: self, get_response
    def __init__(self, get_response):
        # get_response 是下一个中间件或最终视图
        # Django 启动时调用一次
        # self.get_response = get_response
        self.get_response = get_response

    # 定义函数 __call__，参数: self, request
    def __call__(self, request):
        # 请求阶段:在视图之前执行
        # 定义变量 start_time，赋值为 time.time()
        start_time = time.time()

        # 调用下一层(可能是下一个中间件,或视图)
        # 定义变量 response，赋值为 self.get_response(request)
        response = self.get_response(request)

        # 响应阶段:在视图之后执行
        # 定义变量 duration，赋值为 time.time() - start_time
        duration = time.time() - start_time
        # 调用 print()
        print(f"{request.method} {request.path} 耗时 {duration:.3f}s")

        # 加响应头
        # response["X-Response-Time"] = f"{duration:.3f}s"
        response["X-Response-Time"] = f"{duration:.3f}s"
        # 返回 response
        return response
\`\`\`

注册到 settings:

\`\`\`python
# 定义列表 MIDDLEWARE
MIDDLEWARE = [
    # ... 其他中间件 ...
    "myapp.middleware.TimingMiddleware",  # 自己的中间件(路径)
# ]
]
\`\`\`

执行逻辑:

1. \`__init__(get_response)\`:Django 启动时调用一次,构建中间件链。\`get_response\` 是「下一层」。
2. \`__call__(request)\`:每次请求调用。调 \`self.get_response(request)\` 前 = 请求阶段,调之后 = 响应阶段。

## process_view():视图前钩子

除了 \`__call__\`,中间件还可以定义 \`process_view\`,在「**路由解析后、视图执行前**」被调用:

\`\`\`python
# 定义类 PermissionMiddleware
class PermissionMiddleware:
    # 定义函数 __init__，参数: self, get_response
    def __init__(self, get_response):
        # self.get_response = get_response
        self.get_response = get_response

    # 定义函数 __call__，参数: self, request
    def __call__(self, request):
        # 返回 self.get_response(request)
        return self.get_response(request)

    # process_view 在视图执行前调用
    # 参数:request, 视图函数, 视图参数, 视图关键字参数
    # 定义函数 process_view，参数: self, request, view_func, view_args, view_kwargs
    def process_view(self, request, view_func, view_args, view_kwargs):
        # 检查视图是否有 required_permission 属性
        # 定义变量 required，赋值为 getattr(view_func, "required_permission", Non...
        required = getattr(view_func, "required_permission", None)
        # 条件判断：如果 required and not request.user.has_perm(required)
        if required and not request.user.has_perm(required):
            # 从 django.core.exceptions 导入 PermissionDenied
            from django.core.exceptions import PermissionDenied
            # 抛出 PermissionDenied 异常: "需要权限:" + required
            raise PermissionDenied("需要权限:" + required)
        # 返回 None 表示继续,返回 HttpResponse 则短路
\`\`\`

\`process_view\` 返回值:

- \`None\`:继续执行后续中间件和视图。
- \`HttpResponse\`:短路,直接返回这个响应(视图不执行)。

## process_exception():异常钩子

视图抛异常时调用:

\`\`\`python
# 定义类 ErrorHandlingMiddleware
class ErrorHandlingMiddleware:
    # 定义函数 __init__，参数: self, get_response
    def __init__(self, get_response):
        # self.get_response = get_response
        self.get_response = get_response

    # 定义函数 __call__，参数: self, request
    def __call__(self, request):
        # 返回 self.get_response(request)
        return self.get_response(request)

    # 定义函数 process_exception，参数: self, request, exception
    def process_exception(self, request, exception):
        # 视图抛异常时调用
        # 导入 logging 模块
        import logging
        # 定义变量 logger，赋值为 logging.getLogger(__name__)
        logger = logging.getLogger(__name__)
        # 调用 logger.exception()
        logger.exception(f"视图异常: {request.path}")

        # 返回 None:继续抛异常
        # 返回 HttpResponse:用这个响应替代 500
        # 从 django.http 导入 JsonResponse
        from django.http import JsonResponse
        # 返回 JsonResponse({"error": "服务器内部错误"}, status=500)
        return JsonResponse({"error": "服务器内部错误"}, status=500)
\`\`\`

## 旧式中间件(了解)

Django 1.10 之前的「旧式中间件」用五个钩子方法:

\`\`\`python
# 定义类 OldStyleMiddleware
class OldStyleMiddleware:
    # 定义函数 process_request，参数: self, request
    def process_request(self, request):
        # 请求进来时(视图前)
        # 空操作占位
        pass

    # 定义函数 process_view，参数: self, request, view_func, view_args, view_kwargs
    def process_view(self, request, view_func, view_args, view_kwargs):
        # 路由后、视图前
        # 空操作占位
        pass

    # 定义函数 process_template_response，参数: self, request, response
    def process_template_response(self, request, response):
        # 模板响应时
        # 空操作占位
        pass

    # 定义函数 process_response，参数: self, request, response
    def process_response(self, request, response):
        # 响应出去时
        # 返回 response
        return response

    # 定义函数 process_exception，参数: self, request, exception
    def process_exception(self, request, exception):
        # 异常时
        # 空操作占位
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
# 导入 time 模块
import time
# 导入 logging 模块
import logging

# 定义变量 logger，赋值为 logging.getLogger("django.request")
logger = logging.getLogger("django.request")

# 定义类 RequestTimingMiddleware
class RequestTimingMiddleware:
    # """记录每个请求的耗时、路径、用户,超过阈值告警"""
    """记录每个请求的耗时、路径、用户,超过阈值告警"""

    # 慢请求阈值(秒)
    # 定义变量 SLOW_THRESHOLD，赋值为 1.0
    SLOW_THRESHOLD = 1.0

    # 定义函数 __init__，参数: self, get_response
    def __init__(self, get_response):
        # self.get_response = get_response
        self.get_response = get_response

    # 定义函数 __call__，参数: self, request
    def __call__(self, request):
        # === 请求阶段(视图前)===
        # 定义变量 start_time，赋值为 time.time()
        start_time = time.time()
        request.start_time = start_time  # 存到 request 上,视图里也能用

        # 调用下一层
        # 定义变量 response，赋值为 self.get_response(request)
        response = self.get_response(request)

        # === 响应阶段(视图后)===
        # 定义变量 duration，赋值为 time.time() - start_time
        duration = time.time() - start_time

        # 构造日志信息
        # 定义变量 user，赋值为 getattr(request, "user", None)
        user = getattr(request, "user", None)
        # 定义变量 username，赋值为 user.username if user and user.is_authenticat...
        username = user.username if user and user.is_authenticated else "anonymous"

        # 定义字典 log_data
        log_data = {
            # "method": request.method,
            "method": request.method,
            # "path": request.path,
            "path": request.path,
            # "status": response.status_code,
            "status": response.status_code,
            # "duration": round(duration, 3),
            "duration": round(duration, 3),
            # "user": username,
            "user": username,
            # "ip": request.META.get("REMOTE_ADDR"),
            "ip": request.META.get("REMOTE_ADDR"),
        # }
        }

        # 慢请求告警
        # 条件判断：如果 duration > self.SLOW_THRESHOLD
        if duration > self.SLOW_THRESHOLD:
            # 调用 logger.warning()
            logger.warning(f"慢请求: {log_data}")
        # 否则执行
        else:
            # 调用 logger.info()
            logger.info(f"请求: {log_data}")

        # 加响应头(客户端能看到耗时)
        # response["X-Response-Time"] = f"{duration:.3f}s"
        response["X-Response-Time"] = f"{duration:.3f}s"
        # 返回 response
        return response

    # 定义函数 process_exception，参数: self, request, exception
    def process_exception(self, request, exception):
        # 视图异常时也记日志
        # 定义变量 duration，赋值为 time.time() - getattr(request, "start_time", ...
        duration = time.time() - getattr(request, "start_time", time.time())
        # logger.exception(
        logger.exception(
            # f"视图异常: {request.method} {request.path} "
            f"视图异常: {request.method} {request.path} "
            # f"耗时 {duration:.3f}s 异常: {exception}"
            f"耗时 {duration:.3f}s 异常: {exception}"
        # )
        )
        return None  # 返回 None 让异常继续抛
\`\`\`

\`\`\`python
# 注册到 settings.py
# 定义列表 MIDDLEWARE
MIDDLEWARE = [
    # "django.middleware.security.SecurityMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # "django.contrib.sessions.middleware.SessionMiddlew
    "django.contrib.sessions.middleware.SessionMiddleware",
    # "django.middleware.common.CommonMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    # "django.contrib.auth.middleware.AuthenticationMidd
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # "django.contrib.messages.middleware.MessageMiddlew
    "django.contrib.messages.middleware.MessageMiddleware",
    # "django.middleware.clickjacking.XFrameOptionsMiddl
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # 自定义中间件
    # "blog.middleware.RequestTimingMiddleware",
    "blog.middleware.RequestTimingMiddleware",
# ]
]
\`\`\`

另一个常用中间件:CORS(跨域资源共享,前后端分离必用):

\`\`\`python
# 定义类 CORSMiddleware
class CORSMiddleware:
    # """允许跨域请求"""
    """允许跨域请求"""

    # 定义函数 __init__，参数: self, get_response
    def __init__(self, get_response):
        # self.get_response = get_response
        self.get_response = get_response

    # 定义函数 __call__，参数: self, request
    def __call__(self, request):
        # 预检请求(OPTIONS)直接放行
        # 条件判断：如果 request.method == "OPTIONS"
        if request.method == "OPTIONS":
            # 定义变量 response，赋值为 self.get_response(request)
            response = self.get_response(request)
        # 否则执行
        else:
            # 定义变量 response，赋值为 self.get_response(request)
            response = self.get_response(request)

        # 加跨域头
        # response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Origin"] = "*"
        # response["Access-Control-Allow-Methods"] = "GET, P
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        # response["Access-Control-Allow-Headers"] = "Conten
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        # 返回 response
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
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required

# @login_required 包裹视图,未登录用户访问会跳到登录页
# 装饰器：login_required
@login_required
# 定义函数 profile，参数: request
def profile(request):
    # 返回 render(request, "profile.html")
    return render(request, "profile.html")
\`\`\`

等价于:

\`\`\`python
# 定义函数 profile，参数: request
def profile(request):
    # 返回 render(request, "profile.html")
    return render(request, "profile.html")
# 定义变量 profile，赋值为 login_required(profile)
profile = login_required(profile)
\`\`\`

Django 提供一组内置装饰器覆盖常见场景。

## @login_required:必须登录

最常用的权限装饰器:

\`\`\`python
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required

# 装饰器：login_required
@login_required
# 定义函数 dashboard，参数: request
def dashboard(request):
    # 只有登录用户能访问
    # 返回 render(request, "dashboard.html")
    return render(request, "dashboard.html")

# 自定义跳转和重定向参数
# 装饰器：login_required
@login_required(login_url="/accounts/login/", redirect_field_name="next")
# 定义函数 settings，参数: request
def settings(request):
    # 返回 render(request, "settings.html")
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
# 从 django.contrib.auth.decorators 导入 permission_required
from django.contrib.auth.decorators import permission_required

# 装饰器：permission_required
@permission_required("blog.add_post", raise_exception=True)
# 定义函数 post_new，参数: request
def post_new(request):
    # 只有「能新增 post」权限的用户能访问
    # ...
    ...

# 多个权限(默认 AND)
# 装饰器：permission_required
@permission_required(["blog.add_post", "blog.change_post"])
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # ...
    ...

# raise_exception=True:无权限直接 403(不跳登录页)
# raise_exception=False(默认):无权限跳登录页
# 装饰器：permission_required
@permission_required("blog.delete_post", raise_exception=True)
# 定义函数 post_delete，参数: request, pk
def post_delete(request, pk):
    # ...
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
# 从 django.contrib.auth.decorators 导入 user_passes_test
from django.contrib.auth.decorators import user_passes_test

# 定义函数 is_staff，参数: user
def is_staff(user):
    # 返回 user.is_authenticated and user.is_staff
    return user.is_authenticated and user.is_staff

# 装饰器：user_passes_test
@user_passes_test(is_staff, login_url="/staff/login/")
# 定义函数 admin_dashboard，参数: request
def admin_dashboard(request):
    # 只有 staff 用户能访问
    # ...
    ...

# 检查邮箱后缀
# 定义函数 is_internal_user，参数: user
def is_internal_user(user):
    # 返回 user.is_authenticated and user.email.endswith("@company.com")
    return user.is_authenticated and user.email.endswith("@company.com")

# 装饰器：user_passes_test
@user_passes_test(is_internal_user)
# 定义函数 internal_page，参数: request
def internal_page(request):
    # ...
    ...
\`\`\`

判断函数接收 \`user\` 参数,返回 \`True\` 通过,\`False\` 跳登录页。

## require_GET / require_POST / require_http_methods:HTTP 方法限制

限制视图只接受某种 HTTP 方法:

\`\`\`python
# 从 django.views.decorators.http 导入（多行）
from django.views.decorators.http import (
    # require_GET, require_POST, require_http_methods
    require_GET, require_POST, require_http_methods
# )
)

@require_GET         # 只接受 GET
# 定义函数 post_detail，参数: request, pk
def post_detail(request, pk):
    # ...
    ...

@require_POST        # 只接受 POST
# 定义函数 post_delete，参数: request, pk
def post_delete(request, pk):
    # ...
    ...

@require_http_methods(["GET", "POST"])   # 接受 GET 和 POST
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # ...
    ...

@require_http_methods(["GET", "HEAD"])  # 接受 GET 和 HEAD
# 定义函数 api_list，参数: request
def api_list(request):
    # ...
    ...
\`\`\`

不匹配的方法返回 **405 Method Not Allowed**。这比手写 \`if request.method != "POST"\` 简洁。

## @csrf_exempt:取消 CSRF(慎用)

\`CsrfViewMiddleware\` 默认对所有 POST 校验 CSRF。极少数场景(API、webhook)要取消:

\`\`\`python
# 从 django.views.decorators.csrf 导入 csrf_exempt
from django.views.decorators.csrf import csrf_exempt

# 装饰器：csrf_exempt
@csrf_exempt
# 定义函数 webhook，参数: request
def webhook(request):
    # 第三方服务回调,没有 CSRF token
    # ...
    ...
\`\`\`

⚠️ 慎用!取消 CSRF 等于放弃防 CSRF 攻击。只在「确实无法带 token」的场景用,并且要有其他鉴权(签名、IP 白名单)。

## @api_view(Django REST Framework)

DRF 提供 \`@api_view\` 把函数视图转成 API 视图:

\`\`\`python
# 从 rest_framework.decorators 导入 api_view, permission_classes
from rest_framework.decorators import api_view, permission_classes
# 从 rest_framework.response 导入 Response
from rest_framework.response import Response
# 从 rest_framework 导入 status
from rest_framework import status

# 装饰器：api_view
@api_view(["GET", "POST"])
# 装饰器：permission_classes
@permission_classes([IsAuthenticated])
# 定义函数 post_list，参数: request
def post_list(request):
    # 条件判断：如果 request.method == "GET"
    if request.method == "GET":
        # 定义变量 posts，赋值为 Post.objects.all()
        posts = Post.objects.all()
        # 定义变量 serializer，赋值为 PostSerializer(posts, many=True)
        serializer = PostSerializer(posts, many=True)
        # 返回 Response(serializer.data)
        return Response(serializer.data)
    # 否则如果 request.method == "POST"
    elif request.method == "POST":
        # 定义变量 serializer，赋值为 PostSerializer(data=request.data)
        serializer = PostSerializer(data=request.data)
        # 条件判断：如果 serializer.is_valid()
        if serializer.is_valid():
            # 调用 serializer.save()
            serializer.save(author=request.user)
            # 返回 Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # 返回 Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
\`\`\`

\`@api_view\` 做了:解析 JSON 请求体、内容协商、DRF 异常处理、自动加权限检查。

## 自定义装饰器:检查用户角色

内置装饰器不够时,自己写:

\`\`\`python
# 从 functools 导入 wraps
from functools import wraps
# 从 django.core.exceptions 导入 PermissionDenied
from django.core.exceptions import PermissionDenied
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required

# 定义函数 role_required，参数: *roles
def role_required(*roles):
    # """检查用户是否拥有指定角色之一"""
    """检查用户是否拥有指定角色之一"""
    # 定义函数 decorator，参数: view_func
    def decorator(view_func):
        # 装饰器：wraps
        @wraps(view_func)
        # 定义函数 _wrapped，参数: request, *args, **kwargs
        def _wrapped(request, *args, **kwargs):
            # 先确保登录
            # 条件判断：如果 not request.user.is_authenticated
            if not request.user.is_authenticated:
                # 从 django.contrib.auth.views 导入 redirect_to_login
                from django.contrib.auth.views import redirect_to_login
                # 返回 redirect_to_login(request.get_full_path())
                return redirect_to_login(request.get_full_path())

            # 检查角色(user.profile.role 假设存了角色)
            # 定义变量 user_role，赋值为 getattr(request.user, "profile", None)
            user_role = getattr(request.user, "profile", None)
            # 条件判断：如果 user_role and user_role.role in roles
            if user_role and user_role.role in roles:
                # 返回 view_func(request, *args, **kwargs)
                return view_func(request, *args, **kwargs)
            # 抛出 PermissionDenied 异常: "需要角色:" + ", ".join(roles)
            raise PermissionDenied("需要角色:" + ", ".join(roles))
        # 返回 _wrapped
        return _wrapped
    # 返回 decorator
    return decorator

# 使用
# 装饰器：role_required
@role_required("editor", "admin")
# 定义函数 post_publish，参数: request, pk
def post_publish(request, pk):
    # 只有 editor 或 admin 能发布
    # ...
    ...
\`\`\`

\`functools.wraps\` 很重要:它让包装后的函数保留原函数的 \`__name__\`、\`__doc__\`,否则 URL 反向解析、调试会乱。

## 装饰器顺序

多个装饰器从下往上应用,从上往下执行:

\`\`\`python
@login_required          # 3. 最后应用,最外层
@permission_required("blog.add_post")  # 2. 中间应用
@require_POST            # 1. 先应用,最内层
# 定义函数 post_new，参数: request
def post_new(request):
    # ...
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
# 从 django.utils.decorators 导入 method_decorator
from django.utils.decorators import method_decorator
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required

# 方式 1:装饰整个类(应用到 dispatch)
# 装饰器：method_decorator
@method_decorator(login_required, name="dispatch")
# 定义类 PostCreateView，继承 CreateView
class PostCreateView(CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]

# 方式 2:装饰单个方法
# 定义类 PostCreateView，继承 CreateView
class PostCreateView(CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]

    # 装饰器：method_decorator
    @method_decorator(login_required)
    # 定义函数 dispatch，参数: self, request, *args, **kwargs
    def dispatch(self, request, *args, **kwargs):
        # 返回 super().dispatch(request, *args, **kwargs)
        return super().dispatch(request, *args, **kwargs)

# 方式 3:装饰多个方法
# 装饰器：method_decorator
@method_decorator(login_required, name="dispatch")
# 装饰器：method_decorator
@method_decorator(permission_required("blog.add_post"), name="post")
# 定义类 PostCreateView，继承 CreateView
class PostCreateView(CreateView):
    # 定义变量 model，赋值为 Post
    model = Post
    # 定义列表 fields
    fields = ["title", "content"]
\`\`\`

但更推荐用 Mixin(\`LoginRequiredMixin\`),更符合 CBV 风格。

## 完整示例:管理员才能发布文章

\`\`\`python
# blog/decorators.py
# 从 functools 导入 wraps
from functools import wraps
# 从 django.core.exceptions 导入 PermissionDenied
from django.core.exceptions import PermissionDenied
# 从 django.contrib.auth.decorators 导入 login_required
from django.contrib.auth.decorators import login_required
# 从 django.shortcuts 导入 get_object_or_404
from django.shortcuts import get_object_or_404

# 定义函数 author_required，参数: model_class
def author_required(model_class):
    # """只有文章作者本人才能访问"""
    """只有文章作者本人才能访问"""
    # 定义函数 decorator，参数: view_func
    def decorator(view_func):
        # 装饰器：wraps
        @wraps(view_func)
        # 定义函数 _wrapped，参数: request, *args, **kwargs
        def _wrapped(request, *args, **kwargs):
            # 定义变量 pk，赋值为 kwargs.get("pk")
            pk = kwargs.get("pk")
            # 定义变量 obj，赋值为 get_object_or_404(model_class, pk=pk)
            obj = get_object_or_404(model_class, pk=pk)
            # 条件判断：如果 obj.author != request.user and not request.user.is_superuser
            if obj.author != request.user and not request.user.is_superuser:
                # 抛出 PermissionDenied 异常: "只有作者能操作"
                raise PermissionDenied("只有作者能操作")
            # 返回 view_func(request, *args, **kwargs)
            return view_func(request, *args, **kwargs)
        # 返回 _wrapped
        return _wrapped
    # 返回 decorator
    return decorator

# 定义函数 editor_or_author_required，参数: model_class
def editor_or_author_required(model_class):
    # """编辑组成员或作者本人能访问"""
    """编辑组成员或作者本人能访问"""
    # 定义函数 decorator，参数: view_func
    def decorator(view_func):
        # 装饰器：wraps
        @wraps(view_func)
        # 定义函数 _wrapped，参数: request, *args, **kwargs
        def _wrapped(request, *args, **kwargs):
            # 定义变量 pk，赋值为 kwargs.get("pk")
            pk = kwargs.get("pk")
            # 定义变量 obj，赋值为 get_object_or_404(model_class, pk=pk)
            obj = get_object_or_404(model_class, pk=pk)
            # 定义变量 is_author，赋值为 obj.author == request.user
            is_author = obj.author == request.user
            # 定义变量 is_editor，赋值为 request.user.groups.filter(name="editors").ex...
            is_editor = request.user.groups.filter(name="editors").exists()
            # 条件判断：如果 not (is_author or is_editor or request.user.is_superuser)
            if not (is_author or is_editor or request.user.is_superuser):
                # 抛出 PermissionDenied 异常: "需要作者或编辑权限"
                raise PermissionDenied("需要作者或编辑权限")
            # 返回 view_func(request, *args, **kwargs)
            return view_func(request, *args, **kwargs)
        # 返回 _wrapped
        return _wrapped
    # 返回 decorator
    return decorator
\`\`\`

\`\`\`python
# blog/views.py
# 从 django.shortcuts 导入 render, redirect, get_object_or_404
from django.shortcuts import render, redirect, get_object_or_404
# 从 django.contrib.auth.decorators 导入 login_required, permission_required
from django.contrib.auth.decorators import login_required, permission_required
# 从 django.views.decorators.http 导入 require_POST
from django.views.decorators.http import require_POST
# 从 .models 导入 Post
from .models import Post
# 从 .forms 导入 PostForm
from .forms import PostForm
# 从 .decorators 导入 author_required, editor_or_author_required
from .decorators import author_required, editor_or_author_required

# 新建:需要登录 + add_post 权限
# 装饰器：login_required
@login_required
# 装饰器：permission_required
@permission_required("blog.add_post", raise_exception=True)
# 定义函数 post_new，参数: request
def post_new(request):
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 form，赋值为 PostForm(request.POST)
        form = PostForm(request.POST)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 定义变量 post，赋值为 form.save(commit=False)
            post = form.save(commit=False)
            # post.author = request.user
            post.author = request.user
            # 调用 post.save()
            post.save()
            # 调用 form.save_m2m()
            form.save_m2m()
            # 返回 redirect("blog:post_detail", pk=post.pk)
            return redirect("blog:post_detail", pk=post.pk)
    # 否则执行
    else:
        # 定义变量 form，赋值为 PostForm()
        form = PostForm()
    # 返回 render(request, "blog/post_form.html", {"form": form})
    return render(request, "blog/post_form.html", {"form": form})

# 编辑:只有作者本人能改
# 装饰器：login_required
@login_required
# 装饰器：author_required
@author_required(Post)
# 定义函数 post_edit，参数: request, pk
def post_edit(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 定义变量 form，赋值为 PostForm(request.POST, instance=post)
        form = PostForm(request.POST, instance=post)
        # 条件判断：如果 form.is_valid()
        if form.is_valid():
            # 调用 form.save()
            form.save()
            # 返回 redirect("blog:post_detail", pk=post.pk)
            return redirect("blog:post_detail", pk=post.pk)
    # 否则执行
    else:
        # 定义变量 form，赋值为 PostForm(instance=post)
        form = PostForm(instance=post)
    # 返回 render(request, "blog/post_form.html", {"form": form, "post": post})
    return render(request, "blog/post_form.html", {"form": form, "post": post})

# 发布:编辑或作者能发布
# 装饰器：login_required
@login_required
# 装饰器：editor_or_author_required
@editor_or_author_required(Post)
# 装饰器：require_POST
@require_POST
# 定义函数 post_publish，参数: request, pk
def post_publish(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # post.status = "published"
    post.status = "published"
    # 调用 post.save()
    post.save()
    # 返回 redirect("blog:post_detail", pk=post.pk)
    return redirect("blog:post_detail", pk=post.pk)

# 删除:需要 delete_post 权限 + 是作者
# 装饰器：login_required
@login_required
# 装饰器：permission_required
@permission_required("blog.delete_post", raise_exception=True)
# 装饰器：author_required
@author_required(Post)
# 定义函数 post_delete，参数: request, pk
def post_delete(request, pk):
    # 定义变量 post，赋值为 get_object_or_404(Post, pk=pk)
    post = get_object_or_404(Post, pk=pk)
    # 条件判断：如果 request.method == "POST"
    if request.method == "POST":
        # 调用 post.delete()
        post.delete()
        # 返回 redirect("blog:post_list")
        return redirect("blog:post_list")
    # 返回 render(request, "blog/post_confirm_delete.html", {"post": post})
    return render(request, "blog/post_confirm_delete.html", {"post": post})
\`\`\`

\`\`\`python
# blog/urls.py
# 从 django.urls 导入 path
from django.urls import path
# 从 . 导入 views
from . import views

# 定义变量 app_name，赋值为 "blog"
app_name = "blog"
# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("post/new/", views.post_new, name="post_new"),
    # 调用 path()
    path("post/<int:pk>/edit/", views.post_edit, name="post_edit"),
    # 调用 path()
    path("post/<int:pk>/publish/", views.post_publish, name="post_publish"),
    # 调用 path()
    path("post/<int:pk>/delete/", views.post_delete, name="post_delete"),
# ]
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
