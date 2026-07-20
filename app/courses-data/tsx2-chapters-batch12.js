// =============================================================
// TypeScript + React 从入门到精通大全 —— 第 12 批
// -------------------------------------------------------------
// 章节 56-60：第十二部分 数据请求
// 沙箱：/api/run-ts（TS 转译 + ReactJSX 运行时）
// 导出：const chapters
// =============================================================

const chapters = [
  // ===========================================================
  // tsx2-ch56：fetch 基础与类型
  // ===========================================================
  {
    id: "tsx2-ch56",
    group: "第十二部分 数据请求",
    icon: "🌐",
    title: "第五十六章 fetch 基础与类型",
    content: `# 第五十六章 fetch 基础与类型

fetch 是浏览器自带的 HTTP 请求 API。本章讲清楚 fetch 的基本用法、Response 处理、错误处理、AbortController 取消，以及怎么用 TypeScript 写一个"类型安全"的 fetch 封装。

---

## 一、fetch 最简形式

\`\`\`tsx
// fetch(url, options?) 返回 Promise<Response>
fetch("/api/users")
  .then(res => res.json())      // 把响应体解析成 JS 对象
  .then(data => console.log(data))
  .catch(err => console.error(err));

// 或者 async/await
async function load() {
  const res = await fetch("/api/users");
  const data = await res.json();
  return data;
}
\`\`\`

**注意**：fetch 不像 axios，它**只在网络层失败**时 reject（断网、DNS 失败等）。HTTP 400/500 都会 resolve 一个 Response 对象——你需要手动检查 \`res.ok\`。

---

## 二、Response 对象

\`\`\`tsx
const res = await fetch("/api/users");

res.status;       // 200
res.statusText;   // "OK"
res.ok;           // true（200~299）
res.headers;      // Headers 对象
res.body;         // ReadableStream

// 取响应体的几种方式
res.json();       // 解析为 JSON
res.text();       // 解析为文本
res.blob();       // 解析为 Blob（二进制）
res.arrayBuffer();// 解析为 ArrayBuffer
res.formData();   // 解析为 FormData

// 注意：body 只能读一次
const data = await res.json();
const text = await res.text();  // ❌ body 已读完，bodyUsed = true
\`\`\`

---

## 三、错误处理

\`\`\`tsx
async function loadUsers() {
  try {
    const res = await fetch("/api/users");

    // 1. 检查 HTTP 状态
    if (!res.ok) {
      // 2. 拿到错误体（可能是 JSON 也可能是 HTML）
      const errorBody = await res.text();
      throw new Error(\`HTTP \${res.status}: \${errorBody}\`);
    }

    return await res.json();
  } catch (err) {
    // 网络错误或上面 throw 的错误
    console.error("加载失败：", err);
    throw err;  // 重新抛给上层
  }
}
\`\`\`

---

## 四、POST 请求与请求体

\`\`\`tsx
async function createUser(user: { name: string; email: string }) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 鉴权头
      "Authorization": \`Bearer \${getToken()}\`,
    },
    body: JSON.stringify(user),  // 字符串化
  });

  if (!res.ok) throw new Error("创建失败");
  return await res.json();
}
\`\`\`

常见 Content-Type：
- \`application/json\`（最常用）
- \`application/x-www-form-urlencoded\`（表单）
- \`multipart/form-data\`（文件上传）
- \`text/plain\`

---

## 五、AbortController：取消请求

\`\`\`tsx
// 用 AbortController 取消还在飞的请求
const controller = new AbortController();
const signal = controller.signal;

fetch("/api/slow", { signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("请求被取消");
    } else {
      throw err;
    }
  });

// 500ms 后取消
setTimeout(() => controller.abort(), 500);
\`\`\`

> React 里的 useEffect 清理函数里 abort 是经典模式——组件卸载时取消还在飞的请求，避免"组件已卸载，setState 警告"。

\`\`\`tsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(\`/api/users/\${id}\`, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setUser);
  return () => ctrl.abort();  // 卸载时取消
}, [id]);
\`\`\`

---

## 六、TypeScript：让 fetch 有类型

\`\`\`tsx
// 默认 fetch 返回 Promise<any>，没有类型
const res = await fetch("/api/users");
const data = await res.json();  // data: any

// 1. 自己写一个 typedFetch 包装
async function typedFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<T>;
}

// 用法
type User = { id: number; name: string; email: string };
const users = await typedFetch<User[]>("/api/users");
//    ^^^^^ User[]，不再是 any
\`\`\`

---

## 七、类型安全的 fetch 封装（带错误处理）

\`\`\`tsx
// 进阶版：定义 Result 类型，把错误也带出来
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

async function safeFetch<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: \`HTTP \${res.status}\`,
      };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "未知错误",
    };
  }
}

// 用法
const result = await safeFetch<User>(\`/api/users/\${id}\`);
if (result.ok) {
  console.log(result.data.name);
} else {
  console.error(result.message);
}
\`\`\`

---

## 八、超时控制

\`\`\`tsx
// fetch 本身不支持超时，自己用 AbortController + setTimeout 实现
function fetchWithTimeout(url: string, timeout = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);

  return fetch(url, { signal: ctrl.signal })
    .finally(() => clearTimeout(id));
}

// 用法
try {
  const res = await fetchWithTimeout("/api/slow", 3000);
} catch (err) {
  if (err.name === "AbortError") console.log("超时");
}
\`\`\`

---

## 九、常见坑

\`\`\`tsx
// 1. 不要忘记 await res.json()，否则拿到的是 Promise<any>
//    const data = res.json();  ❌
//    const data = await res.json();  ✅

// 2. 跨域：默认 fetch 跨域会发预检 OPTIONS，需要服务端 CORS 头

// 3. cookie 默认不带
//    fetch(url, { credentials: "include" })  // 才会带 cookie

// 4. 大文件下载用 stream，不要 res.json()
//    const reader = res.body.getReader();
//    while (...) { const { done, value } = await reader.read(); ... }

// 5. 不能在 Service Worker 之外用相对 URL（如果从 file:// 加载 HTML）
//    建议用绝对 URL 或 base url
\`\`\`

---

## 小结

- fetch 返回 Promise<Response>，**只在网络层失败时 reject**。
- 必须手动检查 \`res.ok\`（状态码 200~299）。
- AbortController 是标准取消方式，配合 useEffect 清理函数防"组件卸载后 setState"。
- 用一个 typedFetch<T> 包装函数让 fetch 有类型。
- fetch 不带超时，需要 AbortController + setTimeout 自己实现。`,
  },

  // ===========================================================
  // tsx2-ch57：React 中数据请求模式
  // ===========================================================
  {
    id: "tsx2-ch57",
    group: "第十二部分 数据请求",
    icon: "📡",
    title: "第五十七章 React 中数据请求模式",
    content: `# 第五十七章 React 中数据请求模式

在 React 里发请求看似简单，但要处理"loading / error / data"三态、避免内存泄漏、防竞态条件……这一章讲清所有这些模式，并给出一个能复用的 useFetch 自定义 Hook。

---

## 一、最朴素的 useEffect + fetch

\`\`\`tsx
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 每次 id 变都重新拉
    setLoading(true);
    setError(null);

    fetch(\`/api/users/\${id}\`)
      .then(r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json();
      })
      .then((data: User) => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>加载中…</p>;
  if (error)   return <p>出错：{error}</p>;
  if (!user)   return null;
  return <div>{user.name}</div>;
}
\`\`\`

**问题**：
1. 组件卸载后 setState 警告。
2. id 快速变化时，可能旧请求"后返回"覆盖新数据。
3. 三个 state 散落，写起来啰嗦。

---

## 二、解决"卸载后 setState"

\`\`\`tsx
useEffect(() => {
  let cancelled = false;  // 标志：组件是否已卸载

  fetch(\`/api/users/\${id}\`)
    .then(r => r.json())
    .then((data: User) => {
      if (cancelled) return;  // 卸载了就不 setState
      setUser(data);
    });

  return () => { cancelled = true; };  // 卸载时设标志
}, [id]);
\`\`\`

---

## 三、解决"竞态条件"（race condition）

\`\`\`tsx
// 场景：id 从 1 变到 2 又变回 1
// 三个请求的返回顺序可能是 2 → 1 → 3（最慢的是 id=1）
// 用 cancelled 标志只能解决"卸载"，解决不了"id=3 的请求晚于 id=1"

// 解决：用 AbortController
useEffect(() => {
  const ctrl = new AbortController();

  fetch(\`/api/users/\${id}\`, { signal: ctrl.signal })
    .then(r => r.json())
    .then((data: User) => setUser(data))
    .catch(err => {
      if (err.name === "AbortError") return;  // 被取消，不算错误
      setError(err.message);
    });

  return () => ctrl.abort();  // id 变时取消旧请求
}, [id]);
\`\`\`

> AbortController 是真正解决竞态的方案——旧请求**直接被取消**，永远不会 setState。

---

## 四、整合成 useFetch Hook

\`\`\`tsx
// ch45 写过更复杂的，这里给个"够用版"
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });

  useEffect(() => {
    // 每次 url 变都重新跑
    const ctrl = new AbortController();
    setState({ status: "loading" });

    fetch(url, { signal: ctrl.signal })
      .then(async r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return (await r.json()) as T;
      })
      .then((data) => {
        // 即使没 abort，也用 isMounted 检查（双重保险）
        setState({ status: "success", data });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;  // 被取消，静默
        setState({ status: "error", error: err.message });
      });

    return () => ctrl.abort();
  }, [url]);

  return state;
}

function UserList() {
  const state = useFetch<User[]>("/api/users");
  switch (state.status) {
    case "idle":
    case "loading": return <p>加载中…</p>;
    case "error":   return <p>出错：{state.error}</p>;
    case "success": return <ul>{state.data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  }
}
\`\`\`

---

## 五、扩展：可手动触发重新拉取

\`\`\`tsx
function useFetchWithRefresh<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });
  // 用 ref 存储当前的 AbortController
  const ctrlRef = useRef<AbortController | null>(null);

  const run = useCallback(() => {
    ctrlRef.current?.abort();  // 取消上一次
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    setState({ status: "loading" });
    fetch(url, { signal: ctrl.signal })
      .then(async r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return (await r.json()) as T;
      })
      .then(data => setState({ status: "success", data }))
      .catch(err => {
        if (err.name === "AbortError") return;
        setState({ status: "error", error: err.message });
      });
  }, [url]);

  useEffect(() => {
    run();
    return () => ctrlRef.current?.abort();
  }, [run]);

  return { state, refresh: run };
}

function UserList() {
  const { state, refresh } = useFetchWithRefresh<User[]>("/api/users");
  return (
    <>
      <button onClick={refresh}>刷新</button>
      {/* ... */}
    </>
  );
}
\`\`\`

---

## 六、SWR 思想：stale-while-revalidate

\`\`\`tsx
// SWR = Stale While Revalidate
// 思路：先显示"旧数据"（stale），后台重新拉（revalidate），拉完更新

function useSWR<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    const cached = cacheRef.current.get(url) as T | undefined;

    // 1. 立刻显示缓存（如果有）
    if (cached) setData(cached);

    // 2. 后台重新拉
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then(r => r.json())
      .then((fresh: T) => {
        cacheRef.current.set(url, fresh);
        setData(fresh);
      })
      .catch(err => {
        if (err.name !== "AbortError") setError(err);
      });

    return () => ctrl.abort();
  }, [url]);

  return { data, error };
}
\`\`\`

> 这就是 SWR / React Query 的核心思想，下一章详细讲。

---

## 七、依赖请求（dependent fetch）

\`\`\`tsx
// 用户 → 拿到 user.teamId → 拉团队 → 渲染团队成员
function Team({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  // 第一步：拿 user
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(setUser);
  }, [userId]);

  // 第二步：拿 team（依赖 user）
  const [team, setTeam] = useState<Team | null>(null);
  useEffect(() => {
    if (!user) return;  // user 没拿到就不拉
    fetch(\`/api/teams/\${user.teamId}\`)
      .then(r => r.json())
      .then(setTeam);
  }, [user]);  // user 变时触发

  return <div>{team?.name}</div>;
}
\`\`\`

> 这种链式请求在数据请求库里用"dependent query"更优雅。

---

## 八、分页请求

\`\`\`tsx
function usePagination<T>(url: string) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!hasMore) return;
    const ctrl = new AbortController();

    // 假设后端支持 ?page=N
    fetch(\`\${url}?page=\${page}\`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((data: T[]) => {
        if (data.length === 0) setHasMore(false);
        else setItems(prev => [...prev, ...data]);
      })
      .catch(err => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => ctrl.abort();
  }, [page, url, hasMore]);

  return { items, loadMore: () => setPage(p => p + 1), hasMore };
}
\`\`\`

---

## 小结

- useEffect + fetch 三件套：loading / error / data state。
- AbortController 解决竞态条件：组件卸载 / id 变时取消旧请求。
- 自己写的 useFetch / useSWR Hook 适合简单项目，复杂项目用 SWR / React Query。
- 依赖请求用"条件 + 依赖数组"控制；分页请求用 state 记录页码。
- 永远在 useEffect 清理函数里 abort，不要依赖"组件是否卸载"标志。`,
  },

  // ===========================================================
  // tsx2-ch58：SWR 与 React Query 思想
  // ===========================================================
  {
    id: "tsx2-ch58",
    group: "第十二部分 数据请求",
    icon: "🔄",
    title: "第五十八章 SWR 与 React Query 思想",
    content: `# 第五十八章 SWR 与 React Query 思想

自己写 useFetch 在 5 个组件以内还好，10 个以上就开始重复。专业的数据请求库（Vercel SWR、TanStack Query）解决：缓存、失效、乐观更新、轮询、焦点同步、分页……本章讲它们的核心思想。

---

## 一、为什么要用数据请求库

\`\`\`tsx
// 不用库时，每个组件都要处理：
// 1. 缓存（多个组件请求同一份数据，不重复发请求）
// 2. 失效（数据过期了怎么重新拉）
// 3. 错误重试
// 4. 焦点同步（窗口切回来自动刷新）
// 5. 乐观更新（点赞立即 +1，失败回滚）
// 6. 分页 / 无限滚动
// 7. 轮询
// 8. SSR 数据注水
// 9. devtools
// 自己实现 ≈ 重复造 TanStack Query 的轮子
\`\`\`

---

## 二、核心思想：stale-while-revalidate

\`\`\`tsx
// 当组件订阅 key="users" 时：

// 1. 立刻从缓存返回旧数据（如果有）— 哪怕过期
//    用户看到旧 UI，零等待
const cached = cache.get("users");
if (cached) emit(cached);

// 2. 立刻发起 revalidate 请求
const fresh = await fetch("/api/users");
cache.set("users", fresh);
emit(fresh);  // 拿到新数据后通知

// 优点：
// - 首屏极快（用缓存）
// - 始终是最新的（重新拉过）
// - 多个组件共享同一份缓存
\`\`\`

---

## 三、Query Key 与缓存

\`\`\`tsx
// 数据请求库用"key"管理缓存
// key 通常是数组形式，便于传参

// 简单 key
useQuery({ queryKey: ["users"], queryFn: () => fetch("/api/users").then(r => r.json()) });

// 带参数
useQuery({ queryKey: ["users", id], queryFn: () => fetch(\`/api/users/\${id}\`).then(r => r.json()) });

// 分页（用对象区分）
useQuery({
  queryKey: ["users", { page: 1, pageSize: 20 }],
  queryFn: () => fetch(\`/api/users?page=1&size=20\`).then(r => r.json()),
});

// key 的"前缀相同"被认为是同一类数据，可以批量失效
// 比如让所有 ["users", ...] 的缓存失效
queryClient.invalidateQueries({ queryKey: ["users"] });
\`\`\`

---

## 四、staleTime 与 gcTime

\`\`\`tsx
// staleTime：数据多久后被认为"过期"
// 过期后下次访问会重新发起请求（后台）
// 没过期的话就用缓存
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,  // 5 分钟内不算过期
});

// gcTime（garbage collection time）：数据多久没被订阅后从内存清掉
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  gcTime: 10 * 60 * 1000,  // 10 分钟没人用就清
});
\`\`\`

> staleTime 管"用不用缓存"，gcTime 管"还在不在内存"。

---

## 五、Mutation 与失效

\`\`\`tsx
// 写操作（POST/PUT/DELETE）用 useMutation
const createUser = useMutation({
  mutationFn: (newUser: User) => fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(newUser),
    headers: { "Content-Type": "application/json" },
  }).then(r => r.json()),

  // 成功后让相关 query 失效，下次访问会重新拉
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});

// 用法
<button onClick={() => createUser.mutate({ name: "小明" })}>
  创建
</button>
{createUser.isPending && "创建中…"}
{createUser.isError && "出错"}
\`\`\`

---

## 六、乐观更新

\`\`\`tsx
// 场景：点赞按钮，用户点了立即 +1，失败回滚
const likePost = useMutation({
  mutationFn: (postId: string) => fetch(\`/api/posts/\${postId}/like\`, { method: "POST" }),

  // 关键：发起请求前修改缓存
  onMutate: async (postId) => {
    // 1. 取消正在进行的查询，避免覆盖
    await queryClient.cancelQueries({ queryKey: ["post", postId] });

    // 2. 拿到当前值（快照，用于回滚）
    const previous = queryClient.getQueryData<Post>(["post", postId]);

    // 3. 立即更新缓存为乐观值
    if (previous) {
      queryClient.setQueryData<Post>(["post", postId], {
        ...previous,
        likes: previous.likes + 1,
      });
    }

    return { previous };  // 返回给 onError
  },

  // 失败时回滚
  onError: (err, postId, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["post", postId], context.previous);
    }
  },

  // 无论成功失败，最后都重新拉一次
  onSettled: (data, err, postId) => {
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  },
});
\`\`\`

> 乐观更新 = 立即给用户反馈，错了再回滚。体感上比"等服务器响应"快得多。

---

## 七、轮询（polling）

\`\`\`tsx
// 场景：股票价格、消息列表
useQuery({
  queryKey: ["stock", symbol],
  queryFn: () => fetch(\`/api/stocks/\${symbol}\`).then(r => r.json()),
  refetchInterval: 5000,  // 每 5 秒拉一次
  refetchIntervalInBackground: false,  // 切到后台标签页时停止
});

// 或者手动控制
useQuery({
  queryKey: ["stock", symbol],
  queryFn,
  refetchInterval: (query) => {
    // 涨跌超过 1% 才轮询
    const data = query.state.data;
    return data && Math.abs(data.change) > 1 ? 1000 : false;
  },
});
\`\`\`

---

## 八、焦点同步 / 网络重连

\`\`\`tsx
// 数据请求库默认在以下情况自动 refetch：
// 1. 窗口重新获得焦点（用户切回来）
// 2. 网络从断到连
// 3. 组件 mount 时

// 关闭这些行为
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  refetchOnWindowFocus: false,  // 切窗口不重拉
  refetchOnReconnect: false,     // 联网不重拉
  refetchOnMount: false,         // mount 不重拉（用缓存）
});
\`\`\`

---

## 九、依赖查询（dependent query）

\`\`\`tsx
// 拿 userId 之后才拉 user
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

const { data: projects } = useQuery({
  queryKey: ["projects", user?.id],
  queryFn: () => fetchProjects(user!.id),
  enabled: !!user,  // user 拿到后才执行
});
\`\`\`

> \`enabled: false\` 时 query 不执行，缓存可保留但不发起请求。

---

## 十、无限查询（Infinite Query）

\`\`\`tsx
// 无限滚动场景
import { useInfiniteQuery } from "@tanstack/react-query";

const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ["feed"],
  queryFn: ({ pageParam }) => fetch(\`/api/feed?cursor=\${pageParam}\`).then(r => r.json()),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// data.pages 是分页数组
return data?.pages.map((page, i) => (
  <Fragment key={i}>
    {page.items.map(item => <Card key={item.id} {...item} />)}
  </Fragment>
));

// 滚动到底加载
<div onIntersect={() => hasNextPage && fetchNextPage()}>加载更多</div>
\`\`\`

---

## 小结

- 数据请求库（TanStack Query / SWR）解决 9 大问题：缓存、失效、重试、焦点同步、轮询、乐观更新等。
- 核心思想：stale-while-revalidate（先用缓存后台刷新）。
- query key 是缓存的标识，invalidateQueries 让一类缓存失效。
- mutation 用 useMutation，乐观更新通过 onMutate + onError + onSettled 三步。
- dependent query 用 \`enabled: false\` 暂停；无限滚动用 useInfiniteQuery。`,
  },

  // ===========================================================
  // tsx2-ch59：TanStack Query (React Query) 实战
  // ===========================================================
  {
    id: "tsx2-ch59",
    group: "第十二部分 数据请求",
    icon: "🎯",
    title: "第五十九章 TanStack Query (React Query) 实战",
    content: `# 第五十九章 TanStack Query (React Query) 实战

上一章讲了思想，本章用 TanStack Query（React Query 的现名）写一个完整 CRUD 案例，覆盖 useQuery、useMutation、分页、依赖查询、乐观更新。

---

## 一、安装与初始化

\`\`\`tsx
// npm i @tanstack/react-query

// 在 App 根挂 QueryClientProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 全局默认 5 分钟
      retry: 1,                   // 失败重试 1 次
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} />  {/* 调试用 */}
    </QueryClientProvider>
  );
}
\`\`\`

---

## 二、useQuery 基本用法

\`\`\`tsx
import { useQuery } from "@tanstack/react-query";

type User = { id: number; name: string; email: string };

function UserList() {
  // queryKey：缓存 key（必须是数组）
  // queryFn：拉数据的函数（必须返回 Promise）
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("加载失败");
      return res.json();
    },
  });

  if (isLoading) return <p>加载中…</p>;
  if (isError)   return <p>出错：{error.message}</p>;

  return (
    <>
      {/* isFetching 是"后台拉数据中"，isLoading 是"首次加载中" */}
      {isFetching && <span>（更新中）</span>}
      <button onClick={() => refetch()}>手动刷新</button>
      <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
    </>
  );
}
\`\`\`

---

## 三、带参数的 query

\`\`\`tsx
function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading } = useQuery({
    // key 里包含 id，不同 id 是不同缓存
    queryKey: ["user", id],
    queryFn: async (): Promise<User> => {
      const res = await fetch(\`/api/users/\${id}\`);
      if (!res.ok) throw new Error("用户不存在");
      return res.json();
    },
    enabled: !!id,  // id 为空时不发请求
  });

  if (isLoading) return <p>加载中…</p>;
  if (!user) return <p>找不到</p>;
  return <div>{user.name}</div>;
}
\`\`\`

> **重要**：queryKey 包含所有依赖的变量，React Query 才能正确切换缓存。

---

## 四、staleTime / gcTime / refetch 行为

\`\`\`tsx
useQuery({
  queryKey: ["users"],
  queryFn,
  staleTime: 60 * 1000,        // 1 分钟内视为"新鲜"，不重拉
  gcTime: 5 * 60 * 1000,       // 5 分钟没人用就清
  refetchOnMount: true,         // 组件 mount 时
  refetchOnWindowFocus: true,   // 切回窗口
  refetchOnReconnect: true,     // 网络重连
  refetchInterval: false,       // 轮询（默认 false）
  retry: 3,                    // 失败重试次数
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),  // 指数退避
});
\`\`\`

---

## 五、useMutation：增删改

\`\`\`tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("创建失败");
      return res.json() as Promise<User>;
    },

    // 成功后让 users 列表失效
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = (data: { name: string; email: string }) => {
    createUser.mutate(data, {
      onSuccess: (user) => alert(\`创建了 \${user.name}\`),
      onError: (err) => alert(err.message),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={createUser.isPending}>
        {createUser.isPending ? "创建中…" : "创建"}
      </button>
    </form>
  );
}
\`\`\`

---

## 六、乐观更新完整示例

\`\`\`tsx
function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      fetch(\`/api/posts/\${postId}/like\`, { method: "POST" }).then(r => r.json()),

    onMutate: async (postId) => {
      // 1. 取消正在进行的查询，避免覆盖
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 2. 快照（用于回滚）
      const previous = queryClient.getQueryData<Post>(["post", postId]);

      // 3. 立即更新缓存
      if (previous) {
        queryClient.setQueryData<Post>(["post", postId], {
          ...previous,
          likes: previous.likes + 1,
        });
      }

      return { previous };
    },

    onError: (err, postId, context) => {
      // 失败回滚
      if (context?.previous) {
        queryClient.setQueryData(["post", postId], context.previous);
      }
    },

    onSettled: (data, err, postId) => {
      // 不管成功失败，重新拉一次
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
\`\`\`

---

## 七、分页查询

\`\`\`tsx
import { keepPreviousData } from "@tanstack/react-query";

function PaginatedUsers() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["users", { page, pageSize }],
    queryFn: () => fetch(\`/api/users?page=\${page}&size=\${pageSize}\`).then(r => r.json()),
    placeholderData: keepPreviousData,  // 切页时保留旧数据
  });

  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      <ul>{data?.items.map((u: User) => <li key={u.id}>{u.name}</li>)}</ul>
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>上一页</button>
      <span>第 {page} 页</span>
      <button onClick={() => setPage(p => p + 1)} disabled={!data?.hasMore}>下一页</button>
    </div>
  );
}
\`\`\`

---

## 八、依赖查询

\`\`\`tsx
function Team({ userId }: { userId: string }) {
  // 先拿 user
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  });

  // 再拿 team（依赖 user）
  const { data: team } = useQuery({
    queryKey: ["team", user?.teamId],
    queryFn: () => fetch(\`/api/teams/\${user!.teamId}\`).then(r => r.json()),
    enabled: !!user,  // user 拿到才执行
  });

  return <div>{team?.name}</div>;
}
\`\`\`

---

## 九、无限滚动

\`\`\`tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

function InfiniteFeed() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) =>
      fetch(\`/api/feed?cursor=\${pageParam ?? ""}\`).then(r => r.json()),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  // 滚到底时加载
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <>
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page.items.map((item: FeedItem) => <Card key={item.id} {...item} />)}
        </Fragment>
      ))}

      <div ref={ref}>
        {isFetchingNextPage ? "加载中…" : hasNextPage ? "加载更多" : "没有更多了"}
      </div>
    </>
  );
}
\`\`\`

---

## 十、预取数据

\`\`\`tsx
// 鼠标悬停时预取，用户点击瞬间看到数据
function UserLink({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["user", id],
      queryFn: () => fetch(\`/api/users/\${id}\`).then(r => r.json()),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Link to={\`/users/\${id}\`} onMouseEnter={prefetch}>
      查看
    </Link>
  );
}
\`\`\`

---

## 十一、错误边界

\`\`\`tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>出错了：{error.message}</p>
              <button onClick={resetErrorBoundary}>重试</button>
            </div>
          )}
        >
          <MyApp />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
\`\`\`

---

## 小结

- TanStack Query 解决了缓存、失效、轮询、乐观更新等所有数据请求问题。
- useQuery 读、useMutation 写；queryKey 决定缓存粒度。
- 关键配置：staleTime（新鲜度）、gcTime（内存保留）、refetch 行为。
- 乐观更新 = onMutate 改缓存 + onError 回滚 + onSettled 重新拉。
- 配合 react-intersection-observer 实现无限滚动；用 prefetchQuery 提前拉数据。`,
  },

  // ===========================================================
  // tsx2-ch60：Axios 与拦截器
  // ===========================================================
  {
    id: "tsx2-ch60",
    group: "第十二部分 数据请求",
    icon: "🛠️",
    title: "第六十章 Axios 与拦截器",
    content: `# 第六十章 Axios 与拦截器

fetch 是浏览器原生 API，功能基础。Axios 是更成熟的选择：拦截器、自动 JSON、取消请求、并发控制……本章对比两者，并实战 axios + 拦截器 + 类型化。

---

## 一、fetch vs axios

| 维度 | fetch | axios |
|---|---|---|
| 浏览器内置 | ✅ | ❌ 需安装 |
| 自动 JSON | ❌ 手动 | ✅ |
| HTTP 错误 reject | ❌ 手动检查 | ✅ 默认 reject |
| 拦截器 | ❌ 自己包 | ✅ 内置 |
| 取消请求 | AbortController | AbortController + CancelToken |
| 请求/响应转换 | ❌ 自己包 | ✅ 内置 |
| 并发控制 | ❌ 自己写 | ✅ axios.all |
| 进度事件 | ❌ 不支持 | ✅ onUploadProgress / onDownloadProgress |
| 体积 | 0 | ~13KB gzip |
| SSR | ✅ | ✅ |

> 选哪个？**小项目用 fetch 即可**（+ 几个工具函数）。**大项目用 axios**（拦截器、自动 JSON、错误归一化省很多代码）。

---

## 二、Axios 基本用法

\`\`\`tsx
import axios from "axios";

// GET
const res = await axios.get("/api/users");
res.data;        // 自动 JSON 解析
res.status;      // 200
res.headers;     // 响应头

// POST
await axios.post("/api/users", { name: "小明" });

// 完整配置
await axios({
  method: "POST",
  url: "/api/users",
  data: { name: "小明" },
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});
\`\`\`

> axios 在 HTTP 4xx/5xx 时**自动 reject**，错误对象包含 \`response\` 字段（Response 对象），网络错误则只有 \`message\`。

---

## 三、Axios 实例

\`\`\`tsx
// 推荐：每个项目建一个 axios 实例，统一管理配置
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 用法
const res = await api.get("/users");
\`\`\`

**多个实例**应对不同服务：

\`\`\`tsx
const authApi = axios.create({ baseURL: "/api/auth", timeout: 5000 });
const dataApi = axios.create({ baseURL: "/api/data", timeout: 30000 });
const fileApi = axios.create({ baseURL: "/api/file", timeout: 60000 });
\`\`\`

---

## 四、请求拦截器

\`\`\`tsx
// 拦截器：在请求发出前 / 响应回来后统一处理
api.interceptors.request.use(
  (config) => {
    // 1. 加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }

    // 2. 加时间戳防缓存（GET）
    if (config.method === "get") {
      config.params = { ...config.params, _t: Date.now() };
    }

    // 3. 显示加载动画
    NProgress.start();

    console.log("请求发出：", config.url);
    return config;
  },
  (error) => {
    // 请求错误（很少触发）
    return Promise.reject(error);
  }
);
\`\`\`

---

## 五、响应拦截器

\`\`\`tsx
api.interceptors.response.use(
  (response) => {
    // 成功：返回 response.data 而不是 response
    // 这样业务代码里直接 res.data 就是后端 data
    NProgress.done();
    return response.data;
  },
  (error) => {
    // 失败：统一处理错误
    NProgress.done();

    if (error.response) {
      // HTTP 错误
      const { status, data } = error.response;
      if (status === 401) {
        // 未授权：跳登录
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (status === 403) {
        alert("无权限");
      } else if (status >= 500) {
        alert("服务器错误");
      }
      console.error(\`HTTP \${status}\`, data);
    } else if (error.request) {
      // 网络错误（没收到响应）
      alert("网络异常，请检查连接");
    } else {
      // 其他错误
      console.error(error.message);
    }

    return Promise.reject(error);
  }
);

// 业务代码
const users = await api.get("/users");  // 直接拿 data，不用 .data
\`\`\`

---

## 六、TypeScript 集成

\`\`\`tsx
// 1. 让 axios 接收泛型，response.data 自动是 T
const res = await api.get<User[]>("/users");
res.data;  // User[]

// 2. 自定义 error 类型
import { AxiosError } from "axios";

type ApiError = { code: string; message: string };

try {
  await api.post("/users", newUser);
} catch (err) {
  if (err instanceof AxiosError) {
    const apiErr = err.response?.data as ApiError;
    console.log(apiErr.message);
  }
}

// 3. 给 axios 实例加泛型
import type { AxiosInstance, AxiosRequestConfig } from "axios";

function createApi<TError = unknown>(config: AxiosRequestConfig): AxiosInstance {
  return axios.create(config);
}
\`\`\`

---

## 七、Axios 取消请求

\`\`\`tsx
// 方式 1：AbortController（推荐，和 fetch 一致）
const ctrl = new AbortController();
api.get("/users", { signal: ctrl.signal })
  .then(/*...*/)
  .catch(err => {
    if (axios.isCancel(err)) console.log("已取消");
  });
// 取消
ctrl.abort();

// 方式 2：CancelToken（旧 API，仍可用）
const source = axios.CancelToken.source();
api.get("/users", { cancelToken: source.token });
source.cancel("手动取消");
\`\`\`

> 在 React 里通常是组件卸载时 abort，配合 useEffect 清理函数。

\`\`\`tsx
useEffect(() => {
  const ctrl = new AbortController();
  api.get(\`/users/\${id}\`, { signal: ctrl.signal }).then(setUser);
  return () => ctrl.abort();
}, [id]);
\`\`\`

---

## 八、并发请求

\`\`\`tsx
// axios.all：并行发多个请求
const [users, posts] = await axios.all([
  api.get("/users"),
  api.get("/posts"),
]);

// 等价于 Promise.all
const [users, posts] = await Promise.all([
  api.get("/users"),
  api.get("/posts"),
]);

// axios.spread：解构结果
const [users, posts] = await axios.all([
  api.get("/users"),
  api.get("/posts"),
]).then(axios.spread((u, p) => [u, p] as const));
\`\`\`

---

## 九、上传/下载进度

\`\`\`tsx
// 上传进度
await api.post("/upload", formData, {
  onUploadProgress: (e) => {
    if (e.total) {
      const percent = (e.loaded / e.total) * 100;
      console.log(\`上传 \${percent.toFixed(0)}%\`);
    }
  },
});

// 下载进度
await api.get("/big-file", {
  onDownloadProgress: (e) => {
    if (e.total) {
      const percent = (e.loaded / e.total) * 100;
      console.log(\`下载 \${percent.toFixed(0)}%\`);
    }
  },
});
\`\`\`

---

## 十、错误归一化（推荐做法）

\`\`\`tsx
// 把 axios 错误统一包装成业务错误
type BizError = { code: string; message: string; status: number };

function normalizeError(err: unknown): BizError {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // HTTP 错误
      const data = err.response.data as any;
      return {
        code: data?.code ?? \`HTTP_\${err.response.status}\`,
        message: data?.message ?? err.message,
        status: err.response.status,
      };
    }
    if (err.request) {
      return { code: "NETWORK_ERROR", message: "网络异常", status: 0 };
    }
  }
  return { code: "UNKNOWN", message: String(err), status: -1 };
}

// 业务代码
try {
  await api.post("/users", data);
} catch (err) {
  const bizErr = normalizeError(err);
  console.log(bizErr.code, bizErr.message);
}
\`\`\`

---

## 十一、完整的 axios 封装示例

\`\`\`tsx
// lib/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const TOKEN_KEY = "token";

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  timeout: 15000,
});

// 请求拦截
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// 响应拦截
api.interceptors.response.use(
  (res) => res.data,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      // token 失效
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// 类型化请求函数
export async function getUsers(): Promise<User[]> {
  return api.get<User[]>("/users");
}
export async function getUser(id: string): Promise<User> {
  return api.get<User>(\`/users/\${id}\`);
}
export async function createUser(data: Omit<User, "id">): Promise<User> {
  return api.post<User>("/users", data);
}
\`\`\`

---

## 十二、和 TanStack Query 配合

\`\`\`tsx
// 把 axios 调用作为 queryFn
import { useQuery } from "@tanstack/react-query";

function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),  // 调上面封装好的 axios 函数
  });
}

// 写操作
const createUser = useMutation({
  mutationFn: (data: Omit<User, "id">) => createUser(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});
\`\`\`

> 拦截器帮我们处理了 token / 错误，业务代码只关心数据。

---

## 小结

- axios 比 fetch 多出：自动 JSON、HTTP 错误 reject、拦截器、并发、进度事件。
- 拦截器是 axios 的灵魂：请求前加 token，响应后做错误归一化。
- 一定要用 axios.create 建实例，多服务时建多个。
- TypeScript 用泛型 + AxiosError 让类型完整。
- 和 TanStack Query 配合：拦截器做底层，业务用 query/mutation。`,
  },
];

export { chapters };
