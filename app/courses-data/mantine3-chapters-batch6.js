// =============================================================
// Mantine 之道 · 理念与设计目的 —— 第六批章节
// -------------------------------------------------------------
// 本批包含：
//   mantine3-ch34 : 第三十四章 Next.js 16 中的表单最佳实践
//   mantine3-ch35 : 第三十五章 模态框表单（Modal Form）
//   mantine3-ch36 : 第三十六章 多步表单（Stepper Form）
//   mantine3-ch37 : 第三十七章 实战项目：登录/注册系统
//   mantine3-ch38 : 第三十八章 实战项目：用户管理后台
//   mantine3-ch39 : 第三十九章 总结：Mantine 之道的核心
//   mantine3-ch40 : 第四十章 总结：所有 API 速查 + 学习路径
//
// 风格：实战导向 + 总结收束
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第三十四章
  // ============================================================
  {
    id: "mantine3-ch34",
    group: "第五部分 综合实战",
    icon: "🚀",
    title: "第三十四章 Next.js 16 中的表单最佳实践",
    content: `## 34.1 Next.js 16 表单的 4 个关键决策

在 Next.js 16 中做表单，需要决定 4 件事：

1. **Server Component 还是 Client Component？**
2. **表单状态用什么管理？**（useForm / Server Actions / 第三方）
3. **校验在哪里？**（前端 / 后端 / 共享）
4. **提交如何处理？**（Server Actions / API Routes / fetch）

---

## 34.2 决策 1：Server 还是 Client

### 纯展示表单 → Server Component

\`\`\`tsx
// app/contact/page.tsx（Server Component）
import { TextInput, Textarea, Button, Stack } from '@mantine/core';

export default function ContactPage() {
  return (
    <form action="/api/contact" method="POST">
      <Stack>
        <TextInput name="name" label="姓名" required />
        <TextInput name="email" label="邮箱" type="email" required />
        <Textarea name="message" label="留言" required />
        <Button type="submit">提交</Button>
      </Stack>
    </form>
  );
}
\`\`\`

**适用场景**：

- 联系表单、订阅表单（无客户端交互）。
- 简单的搜索表单。
- 不需要客户端校验的表单。

### 复杂表单 → Client Component + useForm

\`\`\`tsx
// app/login/login-form.tsx
'use client';

import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, Button } from '@mantine/core';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => fetch('/api/login', { method: 'POST', body: JSON.stringify(values) }))}>
      <TextInput {...form.getInputProps('email')} />
      <PasswordInput {...form.getInputProps('password')} />
      <Button type="submit">登录</Button>
    </form>
  );
}
\`\`\`

**适用场景**：

- 需要客户端校验。
- 复杂联动（一个字段影响另一个）。
- 实时反馈（密码强度）。

### 混合模式

\`\`\`tsx
// app/register/page.tsx（Server Component）
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  // 服务端可以传 initialValues
  return <RegisterForm initialReferralCode="ABC123" />;
}

// app/register/register-form.tsx（Client Component）
'use client';

import { useForm } from '@mantine/form';

export function RegisterForm({ initialReferralCode }: { initialReferralCode: string }) {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      referralCode: initialReferralCode,  // 从服务端传过来
    },
  });
  // ...
}
\`\`\`

---

## 34.3 决策 2：Server Actions vs fetch

### Server Actions（v9 推荐）

\`\`\`tsx
// app/register/page.tsx
import { RegisterForm } from './register-form';
import { registerUser } from './actions';
import { revalidatePath } from 'next/cache';

export default function RegisterPage() {
  return (
    <RegisterForm
      action={async (values) => {
        'use server';
        const result = await registerUser(values);
        if (result.success) {
          revalidatePath('/dashboard');
          // 跳转
        }
        return result;
      }}
    />
  );
}

// app/register/register-form.tsx
'use client';

import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button } from '@mantine/core';

export function RegisterForm({ action }: { action: (values: any) => Promise<any> }) {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : '邮箱错误'),
      password: (value) => (value.length < 8 ? '密码至少 8 位' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(async (values) => {
      const result = await action(values);
      if (!result.success) {
        form.setFieldError(result.field, result.message);
      }
    })}>
      <TextInput {...form.getInputProps('email')} />
      <PasswordInput {...form.getInputProps('password')} />
      <Button type="submit">注册</Button>
    </form>
  );
}
\`\`\`

**Server Actions 的优势**：

- **零 API 路由**：不需要写 \`/api/register\`。
- **类型安全**：服务端函数，TypeScript 完整推断。
- **自动 revalidate**：配合 \`revalidatePath\` 自动更新页面。
- **进度条**：可以集成 \`@mantine/nprogress\`。

### fetch + API Routes

\`\`\`ts
// app/api/register/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  // 校验
  // 业务逻辑
  return Response.json({ success: true });
}
\`\`\`

\`\`\`tsx
// 客户端
const form = useForm({ /* ... */ });
return (
  <form onSubmit={form.onSubmit(async (values) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    // ...
  })}>
    {/* ... */}
  </form>
);
\`\`\`

**API Routes 的优势**：

- **解耦**：前后端可以独立开发。
- **RESTful**：符合 API 设计规范。
- **可缓存**：GET 请求可以被 Next.js 缓存。

---

## 34.4 决策 3：校验共享

### 用 Zod 共享 schema

\`\`\`ts
// lib/schemas/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
});

export type RegisterValues = z.infer<typeof registerSchema>;
\`\`\`

\`\`\`tsx
// 前端
import { zodResolver } from '@mantine/form';
import { registerSchema } from '@/lib/schemas/auth';

const form = useForm({
  validate: zodResolver(registerSchema),
  initialValues: { email: '', password: '', username: '' },
});
\`\`\`

\`\`\`ts
// 后端（Server Action）
'use server';

import { registerSchema } from '@/lib/schemas/auth';

export async function registerUser(values: unknown) {
  const result = registerSchema.safeParse(values);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  // 业务逻辑
  return { success: true, user: { /* ... */ } };
}
\`\`\`

\`\`\`ts
// 后端（API Route）
import { registerSchema } from '@/lib/schemas/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
  }
  // 业务逻辑
  return Response.json({ success: true });
}
\`\`\`

**好处**：

- 一份 schema，前端 + 后端都用。
- 改 schema，所有地方都跟着改。
- 类型自动推导。

---

## 34.5 决策 4：错误处理

### 整体错误 vs 字段错误

\`\`\`tsx
const handleSubmit = async (values) => {
  try {
    const res = await fetch('/api/register', { /* ... */ });
    if (!res.ok) {
      const data = await res.json();
      if (data.fieldErrors) {
        // 字段级错误（如 email 已被注册）
        Object.entries(data.fieldErrors).forEach(([field, messages]) => {
          form.setFieldError(field, (messages as string[])[0]);
        });
      } else if (data.message) {
        // 整体错误（如网络错误）
        form.setFieldError('root', data.message);
      }
      return;
    }
    // 成功
  } catch (err) {
    form.setFieldError('root', '网络错误，请稍后重试');
  }
};
\`\`\`

### 错误 UI

\`\`\`tsx
<form onSubmit={form.onSubmit(handleSubmit)}>
  {form.errors.root && (
    <Alert color="red" icon={<IconAlertCircle />} mb="md">
      {form.errors.root}
    </Alert>
  )}
  {/* 字段 */}
</form>
\`\`\`

---

## 34.6 实战：完整登录页

\`\`\`tsx
// app/login/page.tsx（Server Component）
import { Container, Title, Text, Anchor } from '@mantine/core';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="md">登录</Title>
      <Text c="dimmed" ta="center" mb="xl">欢迎回来</Text>
      <LoginForm />
      <Text ta="center" mt="md">
        还没有账号？<Anchor href="/register">立即注册</Anchor>
      </Text>
    </Container>
  );
}
\`\`\`

\`\`\`tsx
// app/login/login-form.tsx（Client Component）
'use client';

import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<Values>({
    initialValues: { email: '', password: '' },
    validate: zodResolver(schema),
    validateInputOnBlur: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.field) {
          form.setFieldError(data.field, data.message);
        } else {
          form.setFieldError('root', data.message || '登录失败');
        }
        return;
      }
      // 成功：跳转
      router.push('/dashboard');
    } catch (err) {
      form.setFieldError('root', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {form.errors.root && (
          <Alert color="red">{form.errors.root}</Alert>
        )}
        <TextInput
          label="邮箱"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 8 位"
          required
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={loading} fullWidth size="md">
          登录
        </Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 34.7 Server Action 完整示例

\`\`\`tsx
// app/actions/auth.ts
'use server';

import { registerSchema } from '@/lib/schemas/auth';
import { db } from '@/lib/db';
import { hash } from 'bcrypt';
import { cookies } from 'next/headers';

export async function registerUser(formData: FormData) {
  // 1. 校验
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  };
  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // 2. 业务逻辑
  const { email, password, username } = result.data;
  const existing = await db.users.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      fieldErrors: { email: ['邮箱已被注册'] },
    };
  }

  const hashed = await hash(password, 10);
  const user = await db.users.create({
    data: { email, password: hashed, username },
  });

  // 3. 设置 cookie
  cookies().set('session', user.id, { httpOnly: true });

  return { success: true, userId: user.id };
}
\`\`\`

---

## 34.8 实战：完整的注册 + 验证 + 重定向

\`\`\`tsx
// app/register/register-form.tsx
'use client';

import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
  username: z.string().min(3, '用户名至少 3 位'),
});

type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<Values>({
    initialValues: { email: '', password: '', username: '' },
    validate: zodResolver(schema),
    validateInputOnBlur: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, messages]) => {
            form.setFieldError(field as keyof Values, (messages as string[])[0]);
          });
        } else {
          form.setFieldError('root', data.message || '注册失败');
        }
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      form.setFieldError('root', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {form.errors.root && <Alert color="red">{form.errors.root}</Alert>}
        <TextInput label="用户名" {...form.getInputProps('username')} />
        <TextInput label="邮箱" {...form.getInputProps('email')} />
        <PasswordInput label="密码" {...form.getInputProps('password')} />
        <Button type="submit" loading={loading} fullWidth>注册</Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 34.9 useFormStatus 集成（Next.js 16 新特性）

\`\`\`tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@mantine/core';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      提交
    </Button>
  );
}

export function Form() {
  return (
    <form action={serverAction}>
      <TextInput name="email" />
      <SubmitButton />
    </form>
  );
}
\`\`\`

> ⚠️ 注意：\`useFormStatus\` 必须用在 \`<form action={...}>\` 场景，**不能用在 useForm 内部**。两个可以混用。

---

## 34.10 实战：useForm + useFormStatus 混用

\`\`\`tsx
// 1. 表单用 useForm（客户端校验）
'use client';

export function HybridForm() {
  const form = useForm({
    initialValues: { email: '' },
    validate: { email: (v) => (/^\\S+@\\S+\\.\\S+$/.test(v) ? null : '邮箱错误') },
  });

  return (
    <form
      action={async (formData) => {
        // 客户端校验失败时不提交
        if (!form.validate()) return;
        // 服务端 Action
      }}
    >
      <TextInput name="email" {...form.getInputProps('email')} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending}>提交</Button>;
}
\`\`\`

---

## 34.11 实战：完整的错误处理模式

\`\`\`ts
// lib/api.ts
import { ZodError } from 'zod';

export async function apiPost<T>(url: string, body: any, schema: ZodSchema<T>) {
  // 1. 客户端先校验
  const clientResult = schema.safeParse(body);
  if (!clientResult.success) {
    return { success: false, errors: clientResult.error.flatten().fieldErrors };
  }

  // 2. 发送到服务端
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientResult.data),
  });

  // 3. 服务端错误
  if (!res.ok) {
    const data = await res.json();
    return { success: false, ...data };
  }

  // 4. 成功
  const data = await res.json();
  return { success: true, data: schema.parse(data) };
}
\`\`\`

---

## 34.12 性能优化

### 1. 懒加载 form 组件

\`\`\`tsx
// 用 next/dynamic 懒加载
import dynamic from 'next/dynamic';

const RegisterForm = dynamic(() => import('./register-form'), {
  loading: () => <Skeleton h={400} />,
});
\`\`\`

### 2. 预加载

\`\`\`tsx
import { RegisterForm } from './register-form';

// 在 link 上预加载
<Link href="/register" prefetch>
  注册
</Link>
\`\`\`

### 3. 服务端预填

\`\`\`tsx
// Server Component 里预填
export default function EditUserPage({ params }: { params: { id: string } }) {
  const user = await db.users.findUnique({ where: { id: params.id } });
  return <EditUserForm initialValues={user} />;
}
\`\`\`

---

## 34.13 常见错误

### 错误 1：Server Component 里调用 useForm

\`\`\`tsx
// ❌ Server Component 不能用 hook
export default function Page() {
  const form = useForm({ /* ... */ });  // 报错
  return <TextInput {...form.getInputProps('email')} />;
}

// ✅ 拆出 Client Component
\`\`\`

### 错误 2：Server Action 没用 'use server'

\`\`\`tsx
// ❌ 没 'use server'，被当作客户端函数
export async function registerUser(values: any) {
  // ...
}

// ✅ 加 'use server'
'use server';
export async function registerUser(values: any) {
  // ...
}
\`\`\`

### 错误 3：跨域 fetch

\`\`\`ts
// ❌ 同源 OK
fetch('/api/register', { /* ... */ });

// ❌ 跨域需要 CORS
fetch('https://api.example.com/register', { /* ... */ });
\`\`\`

---

## 34.14 小结

- **Server Component 表单**：纯展示、无客户端校验。
- **Client Component + useForm**：复杂校验、实时反馈。
- **Server Actions**：v9 推荐，无 API 路由，类型安全。
- **Zod 共享 schema**：一份代码，前后端共用。
- **错误处理**：字段错误用 setFieldError，整体错误用 setFieldError('root')。
- **useFormStatus**：配合 Server Actions，自动 loading 状态。

> ⭐ 记住：**「Client Component + useForm + Server Action + Zod 共享 = Next.js 16 最佳表单方案」**。

下一章我们看模态框表单。
`,
  },

  // ============================================================
  // 第三十五章
  // ============================================================
  {
    id: "mantine3-ch35",
    group: "第五部分 综合实战",
    icon: "📦",
    title: "第三十五章 模态框表单（Modal Form）",
    content: `## 35.1 模态框表单的挑战

模态框表单是**最容易写错的表单**之一，常见问题：

1. 关闭后状态没清空（下次打开还有旧值）。
2. 提交失败后错误显示不出来。
3. 编辑时初始值没正确加载。
4. Modal 关闭动画期间还能操作。

---

## 35.2 基础：受控 Modal + Form

\`\`\`tsx
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '名称必填'),
  email: z.string().email('邮箱错误'),
});

export function AddUserButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>添加用户</Button>
      <AddUserModal opened={opened} onClose={close} />
    </>
  );
}

function AddUserModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validate: zodResolver(schema),
  });

  const handleSubmit = async (values) => {
    await fetch('/api/users', { method: 'POST', body: JSON.stringify(values) });
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="添加用户"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="姓名" {...form.getInputProps('name')} />
          <TextInput label="邮箱" {...form.getInputProps('email')} />
          <Button type="submit">保存</Button>
        </Stack>
      </form>
    </Modal>
  );
}
\`\`\`

**关键点**：

- 关闭时 \`form.reset()\` 清空状态。
- \`onClose\` 调用时同时重置表单。

---

## 35.3 进阶：编辑模式

\`\`\`tsx
interface User {
  id: string;
  name: string;
  email: string;
}

function EditUserModal({
  user,
  opened,
  onClose,
  onSave,
}: {
  user: User | null;
  opened: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validate: zodResolver(schema),
  });

  // 当 user 变化时，重置表单
  useEffect(() => {
    if (user) {
      form.setValues(user);
      form.resetDirty();
    }
  }, [user]);

  const handleSubmit = async (values) => {
    const updated = { ...user, ...values };
    await onSave(updated);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="编辑用户"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="姓名" {...form.getInputProps('name')} />
          <TextInput label="邮箱" {...form.getInputProps('email')} />
          <Button type="submit">保存</Button>
        </Stack>
      </form>
    </Modal>
  );
}
\`\`\`

---

## 35.4 进阶：受控 useFormInput

把 useForm 的配置抽出来，让多个 Modal 复用：

\`\`\`tsx
// hooks/useUserForm.ts
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '名称必填'),
  email: z.string().email('邮箱错误'),
});

export type UserFormValues = z.infer<typeof schema>;

export function useUserForm(initialValues?: Partial<UserFormValues>) {
  return useForm<UserFormValues>({
    initialValues: {
      name: initialValues?.name || '',
      email: initialValues?.email || '',
    },
    validate: zodResolver(schema),
  });
}
\`\`\`

\`\`\`tsx
// AddUserModal.tsx
import { useUserForm } from '@/hooks/useUserForm';

function AddUserModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const form = useUserForm();

  // 每次打开时重置
  useEffect(() => {
    if (opened) form.reset();
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="添加">
      <form onSubmit={form.onSubmit((values) => {
        // 提交
        onClose();
      })}>
        <TextInput {...form.getInputProps('name')} />
        <TextInput {...form.getInputProps('email')} />
        <Button type="submit">保存</Button>
      </form>
    </Modal>
  );
}
\`\`\`

---

## 35.5 进阶：未保存提示

如果用户编辑了表单但没提交，关闭时应该提示。

\`\`\`tsx
function SmartModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const form = useUserForm();
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const handleClose = () => {
    if (form.isDirty()) {
      openConfirm();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    form.reset();
    closeConfirm();
    onClose();
  };

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="编辑">
        <form onSubmit={form.onSubmit((values) => {
          onClose();
        })}>
          <TextInput {...form.getInputProps('name')} />
          <TextInput {...form.getInputProps('email')} />
          <Button type="submit">保存</Button>
        </form>
      </Modal>

      <Modal opened={confirmOpen} onClose={closeConfirm} title="未保存的修改">
        <p>你有未保存的修改，确定要关闭吗？</p>
        <Group>
          <Button variant="default" onClick={closeConfirm}>取消</Button>
          <Button color="red" onClick={handleConfirm}>放弃修改</Button>
        </Group>
      </Modal>
    </>
  );
}
\`\`\`

---

## 35.6 进阶：受控 + 异步初始值

编辑时从服务器加载数据：

\`\`\`tsx
function EditUserModal({ userId, opened, onClose }: { userId: string; opened: boolean; onClose: () => void }) {
  const form = useUserForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && userId) {
      setLoading(true);
      fetch(\`/api/users/\${userId}\`)
        .then(r => r.json())
        .then(user => form.setValues(user))
        .finally(() => setLoading(false));
    }
  }, [opened, userId]);

  return (
    <Modal opened={opened} onClose={onClose} title="编辑用户">
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={form.onSubmit((values) => {
          // 提交
          onClose();
        })}>
          <TextInput {...form.getInputProps('name')} />
          <TextInput {...form.getInputProps('email')} />
          <Button type="submit">保存</Button>
        </form>
      )}
    </Modal>
  );
}
\`\`\`

---

## 35.7 命令式 Modal：modals

用 \`@mantine/modals\` 的命令式 API：

\`\`\`tsx
import { modals } from '@mantine/modals';

function Page() {
  const openAddUserModal = () => {
    const id = modals.open({
      title: '添加用户',
      children: (
        <AddUserForm
          onSuccess={() => modals.close(id)}
        />
      ),
    });
  };

  return <Button onClick={openAddUserModal}>添加用户</Button>;
}
\`\`\`

**优势**：

- 不需要 useDisclosure。
- 可以从任何地方调用。
- 集中管理 Modal 状态。

---

## 35.8 命令式确认 Modal

\`\`\`tsx
import { modals } from '@mantine/modals';

function DeleteButton({ userId }: { userId: string }) {
  const handleDelete = () => {
    modals.openConfirmModal({
      title: '确认删除',
      children: <p>确定要删除这个用户吗？此操作不可恢复。</p>,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch(\`/api/users/\${userId}\`, { method: 'DELETE' });
      },
    });
  };

  return <Button color="red" onClick={handleDelete}>删除</Button>;
}
\`\`\`

---

## 35.9 实战：完整的用户管理 Modal

\`\`\`tsx
'use client';

import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Modal, Button, Group, TextInput, Stack, Table, ActionIcon,
  Card, Title, Text,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useUserForm, UserFormValues } from '@/hooks/useUserForm';
import { modals } from '@mantine/modals';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleAdd = () => {
    setEditing(null);
    open();
  };

  const handleEdit = (user: User) => {
    setEditing(user);
    open();
  };

  const handleDelete = (user: User) => {
    modals.openConfirmModal({
      title: '确认删除',
      children: <Text>确定要删除 <b>{user.name}</b> 吗？</Text>,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setUsers(users.filter((u) => u.id !== user.id));
        fetch(\`/api/users/\${user.id}\`, { method: 'DELETE' });
      },
    });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>用户管理</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
          添加用户
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>姓名</Table.Th>
            <Table.Th>邮箱</Table.Th>
            <Table.Th>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.name}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => handleEdit(user)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(user)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <UserFormModal
        opened={opened}
        onClose={close}
        user={editing}
        onSave={(user) => {
          if (editing) {
            setUsers(users.map((u) => (u.id === user.id ? user : u)));
          } else {
            setUsers([...users, { ...user, id: Date.now().toString() }]);
          }
          close();
        }}
      />
    </Stack>
  );
}

function UserFormModal({
  opened,
  onClose,
  user,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
}) {
  const form = useUserForm(user || undefined);

  // 当 user 变化时重置表单
  useEffect(() => {
    if (opened) {
      if (user) {
        form.setValues(user);
      } else {
        form.reset();
      }
    }
  }, [opened, user]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? '编辑用户' : '添加用户'}
    >
      <form onSubmit={form.onSubmit((values) => {
        onSave({ ...values, id: user?.id || Date.now().toString() });
      })}>
        <Stack>
          <TextInput label="姓名" {...form.getInputProps('name')} />
          <TextInput label="邮箱" {...form.getInputProps('email')} />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>取消</Button>
            <Button type="submit">{user ? '更新' : '添加'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
\`\`\`

---

## 35.10 实战：Drawer 表单

\`\`\`tsx
import { Drawer, Button, Stack, TextInput } from '@mantine/core';

function FilterDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const form = useForm({
    initialValues: {
      keyword: '',
      category: '',
      minPrice: 0,
      maxPrice: 0,
    },
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title="筛选"
    >
      <form onSubmit={form.onSubmit((values) => {
        // 应用筛选
        onClose();
      })}>
        <Stack>
          <TextInput label="关键词" {...form.getInputProps('keyword')} />
          {/* 其他字段 */}
          <Button type="submit">应用</Button>
        </Stack>
      </form>
    </Drawer>
  );
}
\`\`\`

---

## 35.11 小结

- 模态框表单要点：**关闭时 form.reset()**。
- 编辑模式用 \`useEffect\` 监听 user 变化，\`setValues\` 重置。
- 未保存提示：\`form.isDirty()\` 检查。
- 命令式 Modal：\`@mantine/modals\` 的 \`modals.openConfirmModal\` 适合删除确认。
- Drawer 表单：左右滑出的表单，适合筛选。

> ⭐ 记住：**「打开 setValues，关闭 resetDirty，未保存用 isDirty 检查」**。

下一章我们看多步表单。
`,
  },

  // ============================================================
  // 第三十六章
  // ============================================================
  {
    id: "mantine3-ch36",
    group: "第五部分 综合实战",
    icon: "📊",
    title: "第三十六章 多步表单（Stepper Form）",
    content: `## 36.1 多步表单的设计

多步表单的 **3 个核心问题**：

1. **校验范围**：只校验当前步骤，还是所有步骤？
2. **状态管理**：所有字段在一个 form 里，还是分步？
3. **前进后退**：前进校验，后退不校验。

---

## 36.2 基础：单 form + Stepper

\`\`\`tsx
import { useState } from 'react';
import { Stepper, Button, Group, TextInput, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  address: z.string().min(1),
  phone: z.string().regex(/^1[3-9]\\d{9}$/),
});

type Values = z.infer<typeof schema>;

function RegisterWizard() {
  const [step, setStep] = useState(0);
  const form = useForm<Values>({
    initialValues: {
      name: '', email: '', password: '',
      address: '', phone: '',
    },
    validate: zodResolver(schema),
    validateInputOnBlur: true,
  });

  const nextStep = () => {
    // 校验当前步骤的字段
    const stepFields: Record<number, (keyof Values)[]> = {
      0: ['name', 'email', 'password'],
      1: ['address', 'phone'],
    };
    const fields = stepFields[step] || [];
    const valid = fields.every((field) => form.validateField(field));
    if (valid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <>
      <Stepper active={step} mb="xl">
        <Stepper.Step label="账号">
          <Stack>
            <TextInput label="姓名" {...form.getInputProps('name')} />
            <TextInput label="邮箱" {...form.getInputProps('email')} />
            <TextInput label="密码" type="password" {...form.getInputProps('password')} />
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="联系方式">
          <Stack>
            <TextInput label="地址" {...form.getInputProps('address')} />
            <TextInput label="手机" {...form.getInputProps('phone')} />
          </Stack>
        </Stepper.Step>
        <Stepper.Completed>
          <p>已完成所有步骤，可以提交了！</p>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between">
        <Button variant="default" onClick={prevStep} disabled={step === 0}>
          上一步
        </Button>
        {step < 2 ? (
          <Button onClick={nextStep}>下一步</Button>
        ) : (
          <Button onClick={form.onSubmit((values) => console.log('提交', values))}>
            提交
          </Button>
        )}
      </Group>
    </>
  );
}
\`\`\`

---

## 36.3 用 Zod 分步 schema

\`\`\`ts
import { z } from 'zod';

const step1Schema = z.object({
  name: z.string().min(1, '姓名必填'),
  email: z.string().email('邮箱错误'),
  password: z.string().min(8, '密码至少 8 位'),
});

const step2Schema = z.object({
  address: z.string().min(1, '地址必填'),
  phone: z.string().regex(/^1[3-9]\\d{9}$/, '手机号错误'),
});

const fullSchema = step1Schema.merge(step2Schema);
\`\`\`

\`\`\`tsx
// 切换 step 时切换 schema
const [step, setStep] = useState(0);
const form = useForm({
  initialValues: /* ... */,
  validate: step === 0 ? zodResolver(step1Schema) : zodResolver(step2Schema),
});
\`\`\`

**注意**：\`useForm\` 的 validate 切换可能有问题，**推荐用 form.validateField** 单独校验每个字段。

---

## 36.4 进阶：进度条

\`\`\`tsx
<Stack>
  <Stepper active={step} size="sm">
    <Stepper.Step label="账号" />
    <Stepper.Step label="联系方式" />
    <Stepper.Step label="完成" />
  </Stepper>
  <Progress value={((step + 1) / 3) * 100} />
  {/* 步骤内容 */}
</Stack>
\`\`\`

---

## 36.5 进阶：可点击切换步骤

\`\`\`tsx
<Stepper active={step} onStepClick={setStep}>
  <Stepper.Step label="账号" />
  <Stepper.Step label="联系方式" />
  <Stepper.Step label="完成" />
</Stepper>
\`\`\>

**注意**：允许点击切换可能让用户跳过校验。要在 onStepClick 里校验：

\`\`\`tsx
<Stepper
  active={step}
  onStepClick={(targetStep) => {
    // 只能往后点击（已校验的步骤）
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    // 校验从当前到目标的所有步骤
    let canProceed = true;
    for (let i = step; i < targetStep; i++) {
      const fields = stepFields[i] || [];
      if (!fields.every((f) => form.validateField(f))) {
        canProceed = false;
        break;
      }
    }
    if (canProceed) setStep(targetStep);
  }}
>
\`\`\`

---

## 36.6 进阶：每步独立 form

如果步骤之间**完全独立**（不共享数据），可以用**多个 useForm**：

\`\`\`tsx
const step1Form = useForm({ initialValues: { /* ... */ } });
const step2Form = useForm({ initialValues: { /* ... */ } });
const step3Form = useForm({ initialValues: { /* ... */ } });

const [allValues, setAllValues] = useState({});

const nextStep = () => {
  if (step1Form.validate()) {
    setAllValues({ ...allValues, ...step1Form.values });
    setStep(1);
  }
};
\`\`\`

**适用场景**：

- 步骤之间数据独立。
- 想完全隔离状态。

**缺点**：

- 不能跨步骤校验。
- 状态管理复杂。

---

## 36.7 实战：完整的注册向导

\`\`\`tsx
'use client';

import { useState } from 'react';
import {
  Stepper, Group, Button, TextInput, PasswordInput, Stack,
  Select, Title, Text, Card,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

const step1Schema = z.object({
  username: z.string().min(3, '用户名至少 3 位').max(20, '最多 20 位'),
  email: z.string().email('邮箱错误'),
  password: z.string().min(8, '密码至少 8 位'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  firstName: z.string().min(1, '名必填'),
  lastName: z.string().min(1, '姓必填'),
  age: z.number().min(18, '必须年满 18 岁').max(120, '年龄不合理'),
  gender: z.enum(['male', 'female', 'other']),
});

const step3Schema = z.object({
  receiveNewsletter: z.boolean(),
  newsletterEmail: z.string().email().optional(),
  receiveSMS: z.boolean(),
  phoneNumber: z.string().optional(),
  agreed: z.literal(true, { errorMap: () => ({ message: '请同意条款' }) }),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type Values = z.infer<typeof fullSchema>;

function RegisterWizard() {
  const [step, setStep] = useState(0);
  const form = useForm<Values>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      age: 18,
      gender: 'male',
      receiveNewsletter: false,
      newsletterEmail: '',
      receiveSMS: false,
      phoneNumber: '',
      agreed: false as true,
    },
    validate: zodResolver(fullSchema),
    validateInputOnBlur: true,
  });

  const stepFields: Record<number, (keyof Values)[]> = {
    0: ['username', 'email', 'password', 'confirmPassword'],
    1: ['firstName', 'lastName', 'age', 'gender'],
    2: ['agreed'],
  };

  const validateStep = (s: number) => {
    const fields = stepFields[s] || [];
    return fields.every((field) => form.validateField(field));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <Card withBorder maw={600} mx="auto" mt="xl">
      <Stepper active={step} mb="xl">
        <Stepper.Step label="账号" description="基本信息">
          <Stack>
            <Title order={3}>账号信息</Title>
            <TextInput label="用户名" {...form.getInputProps('username')} />
            <TextInput label="邮箱" {...form.getInputProps('email')} />
            <PasswordInput label="密码" {...form.getInputProps('password')} />
            <PasswordInput label="确认密码" {...form.getInputProps('confirmPassword')} />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="个人信息" description="详细资料">
          <Stack>
            <Title order={3}>个人信息</Title>
            <Group grow>
              <TextInput label="姓" {...form.getInputProps('lastName')} />
              <TextInput label="名" {...form.getInputProps('firstName')} />
            </Group>
            <TextInput
              label="年龄"
              type="number"
              {...form.getInputProps('age')}
            />
            <Select
              label="性别"
              data={[
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
                { value: 'other', label: '其他' },
              ]}
              {...form.getInputProps('gender')}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="偏好" description="通知设置">
          <Stack>
            <Title order={3}>通知偏好</Title>
            <Checkbox
              label="订阅邮件"
              {...form.getInputProps('receiveNewsletter', { type: 'checkbox' })}
            />
            {form.values.receiveNewsletter && (
              <TextInput
                label="订阅邮箱"
                {...form.getInputProps('newsletterEmail')}
              />
            )}
            <Checkbox
              label="接收短信"
              {...form.getInputProps('receiveSMS', { type: 'checkbox' })}
            />
            {form.values.receiveSMS && (
              <TextInput
                label="手机号"
                {...form.getInputProps('phoneNumber')}
              />
            )}
            <Checkbox
              label="我已阅读并同意服务条款"
              {...form.getInputProps('agreed', { type: 'checkbox' })}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack>
            <Title order={3}>完成</Title>
            <Text>所有信息已填写完毕，点击提交完成注册。</Text>
            <Card withBorder>
              <pre>{JSON.stringify(form.values, null, 2)}</pre>
            </Card>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between">
        <Button variant="default" onClick={prevStep} disabled={step === 0}>
          上一步
        </Button>
        {step < 3 ? (
          <Button onClick={nextStep}>下一步</Button>
        ) : (
          <Button
            onClick={form.onSubmit(async (values) => {
              await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
              });
            })}
          >
            提交注册
          </Button>
        )}
      </Group>
    </Card>
  );
}
\`\`\`

---

## 36.8 实战：保存草稿

\`\`\`tsx
function WizardWithDraft() {
  const form = useForm({ initialValues: /* 从 localStorage 恢复 */ { /* ... */ } });

  // 自动保存草稿
  useEffect(() => {
    localStorage.setItem('register-draft', JSON.stringify(form.values));
  }, [form.values]);

  // 清除草稿
  const clearDraft = () => {
    localStorage.removeItem('register-draft');
  };

  // 提交成功后清除
  const handleSubmit = async (values) => {
    await fetch('/api/register', { method: 'POST', body: JSON.stringify(values) });
    clearDraft();
  };
}
\`\`\`

---

## 36.9 实战：URL 同步步骤

\`\`\`tsx
import { useRouter, useSearchParams } from 'next/navigation';

function WizardWithURL() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get('step') || '0', 10);

  const setStep = (newStep: number) => {
    router.push(\`?step=\${newStep}\`);
  };

  return (
    <Stepper active={step} onStepClick={setStep}>
      {/* 步骤 */}
    </Stepper>
  );
}
\`\`\`

**好处**：

- 用户刷新页面不会丢失步骤。
- 可以分享带步骤的链接。

---

## 36.10 小结

- 多步表单用 **单 form + Stepper**，所有字段在一个 state。
- 用 \`form.validateField\` 单独校验当前步骤的字段。
- 每步可以用 Zod sub-schema（\`step1Schema\`），最后合并。
- 进度条：\`Stepper\` 自带 + \`Progress\` 配合。
- 保存草稿：用 \`useEffect\` 监听 values 变化，写 localStorage。
- URL 同步：步骤写入 \`?step=N\`，刷新不丢失。

> ⭐ 记住：**「单 form + validateField + 步骤字段映射」是多步表单的核心模式**。

下一章我们做完整实战项目。
`,
  },

  // ============================================================
  // 第三十七章
  // ============================================================
  {
    id: "mantine3-ch37",
    group: "第五部分 综合实战",
    icon: "🔐",
    title: "第三十七章 实战项目：登录/注册系统",
    content: `## 37.1 项目结构

\`\`\`
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── register/
│   │   ├── page.tsx
│   │   ├── register-form.tsx
│   │   └── register-wizard.tsx
│   └── dashboard/
│       └── page.tsx
├── lib/
│   ├── schemas/
│   │   └── auth.ts
│   ├── api/
│   │   └── auth.ts
│   └── theme/
│       └── index.ts
└── components/
    ├── ColorSchemeToggle.tsx
    └── AuthLayout.tsx
\`\`\`

---

## 37.2 共享 schema

\`\`\`ts
// lib/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
});

export const registerSchema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少 8 位'),
  username: z.string().min(3, '用户名至少 3 位'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
\`\`\`

---

## 37.3 主题

\`\`\`ts
// lib/theme/index.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, sans-serif',
  components: {
    Button: {
      defaultProps: { size: 'md' },
    },
  },
});
\`\`\`

---

## 37.4 AuthLayout

\`\`\`tsx
// components/AuthLayout.tsx
'use client';

import { Container, Paper, Title, Text, Center, Box } from '@mantine/core';
import { ColorSchemeToggle } from './ColorSchemeToggle';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Center mih="100vh" px="md">
      <Box pos="absolute" top={16} right={16}>
        <ColorSchemeToggle />
      </Box>
      <Container size="xs" w="100%">
        <Title order={1} ta="center" mb="xs">{title}</Title>
        <Text c="dimmed" ta="center" mb="xl">{subtitle}</Text>
        <Paper withBorder p="xl" radius="md">
          {children}
        </Paper>
      </Container>
    </Center>
  );
}
\`\`\`

---

## 37.5 登录页

\`\`\`tsx
// app/login/page.tsx（Server Component）
import { Anchor, Text } from '@mantine/core';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <AuthLayout title="登录" subtitle="欢迎回来">
      <LoginForm />
      <Text ta="center" mt="md">
        还没有账号？<Anchor href="/register">立即注册</Anchor>
      </Text>
    </AuthLayout>
  );
}
\`\`\`

\`\`\`tsx
// app/login/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { loginSchema, LoginValues } from '@/lib/schemas/auth';
import { IconAlertCircle } from '@tabler/icons-react';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '' },
    validate: zodResolver(loginSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.field) {
          form.setFieldError(data.field, data.message);
        } else {
          form.setFieldError('root', data.message || '登录失败');
        }
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      form.setFieldError('root', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {form.errors.root && (
          <Alert color="red" icon={<IconAlertCircle />}>
            {form.errors.root}
          </Alert>
        )}
        <TextInput
          label="邮箱"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 8 位"
          required
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={loading} fullWidth size="md">
          登录
        </Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 37.6 注册页

\`\`\`tsx
// app/register/page.tsx
import { Anchor, Text } from '@mantine/core';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <AuthLayout title="注册" subtitle="创建你的账号">
      <RegisterForm />
      <Text ta="center" mt="md">
        已有账号？<Anchor href="/login">立即登录</Anchor>
      </Text>
    </AuthLayout>
  );
}
\`\`\`

\`\`\`tsx
// app/register/register-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Alert, Checkbox } from '@mantine/core';
import { registerSchema, RegisterValues } from '@/lib/schemas/auth';
import { IconAlertCircle } from '@tabler/icons-react';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterValues>({
    initialValues: { email: '', password: '', username: '' },
    validate: zodResolver(registerSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, messages]) => {
            form.setFieldError(field as keyof RegisterValues, (messages as string[])[0]);
          });
        } else {
          form.setFieldError('root', data.message || '注册失败');
        }
        return;
      }
      // 注册成功，跳转登录
      router.push('/login');
    } catch (err) {
      form.setFieldError('root', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {form.errors.root && (
          <Alert color="red" icon={<IconAlertCircle />}>
            {form.errors.root}
          </Alert>
        )}
        <TextInput
          label="用户名"
          placeholder="3-20 位"
          required
          {...form.getInputProps('username')}
        />
        <TextInput
          label="邮箱"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 8 位"
          required
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={loading} fullWidth size="md">
          注册
        </Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 37.7 API Routes

\`\`\`ts
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '参数错误', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 验证用户
    const { email, password } = result.data;
    const user = await db.users.findUnique({ where: { email } });
    if (!user || !await verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 设置 session
    const session = await createSession(user.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', session, { httpOnly: true });
    return response;
  } catch (err) {
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
\`\`\`

\`\`\`ts
// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/schemas/auth';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { fieldErrors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, username } = result.data;
    const existing = await db.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { fieldErrors: { email: ['邮箱已被注册'] } },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 10);
    const user = await db.users.create({
      data: { email, password: hashed, username },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
\`\`\`

---

## 37.8 错误处理最佳实践

**后端返回结构**：

\`\`\`ts
// 成功
{ success: true, data: {...} }

// 字段错误
{ fieldErrors: { email: ['邮箱已被注册'], username: ['用户名已被占用'] } }

// 整体错误
{ message: '服务器错误' }

// 特定字段错误
{ field: 'email', message: '邮箱已被注册' }
\`\`\`

**前端处理**：

\`\`\`ts
const handleSubmit = async (values) => {
  const res = await fetch(/* ... */);
  if (!res.ok) {
    const data = await res.json();
    if (data.fieldErrors) {
      // 字段错误
      Object.entries(data.fieldErrors).forEach(([field, messages]) => {
        form.setFieldError(field, (messages as string[])[0]);
      });
    } else if (data.field) {
      // 单字段错误
      form.setFieldError(data.field, data.message);
    } else {
      // 整体错误
      form.setFieldError('root', data.message || '操作失败');
    }
    return;
  }
  // 成功
};
\`\`\`

---

## 37.9 第三方登录

\`\`\`tsx
function SocialLogin() {
  return (
    <Stack>
      <Divider label="或" labelPosition="center" />
      <Group grow>
        <Button leftSection={<IconBrandGoogle />} variant="default">Google</Button>
        <Button leftSection={<IconBrandGithub />} variant="default">GitHub</Button>
      </Group>
    </Stack>
  );
}
\`\`\`

---

## 37.10 密码强度指示

\`\`\`tsx
function PasswordStrength({ value }: { value: string }) {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(value);
  const labels = ['弱', '较弱', '一般', '良好', '强', '极强'];
  const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'teal'];

  if (!value) return null;

  return (
    <Stack gap={4}>
      <Group gap="xs">
        <Text size="sm">密码强度:</Text>
        <Text size="sm" fw={600} c={colors[strength]}>{labels[strength]}</Text>
      </Group>
      <Progress value={(strength / 5) * 100} color={colors[strength]} />
    </Stack>
  );
}
\`\`\`

---

## 37.11 小结

- **共享 schema**：前后端共用 Zod schema。
- **API 返回结构**：\`{ fieldErrors }\` / \`{ field, message }\` / \`{ message }\`。
- **前端错误回填**：\`form.setFieldError(field, message)\`。
- **密码强度**：实时计算 + Progress 显示。
- **第三方登录**：Divider + 按钮组合。

> ⭐ 记住：**「Zod 共享 + 一致的错误结构 + form.setFieldError」是登录注册系统的核心**。

下一章我们做用户管理后台。
`,
  },

  // ============================================================
  // 第三十八章
  // ============================================================
  {
    id: "mantine3-ch38",
    group: "第五部分 综合实战",
    icon: "👥",
    title: "第三十八章 实战项目：用户管理后台",
    content: `## 38.1 功能列表

我们要做一个完整的用户管理后台，包含：

1. 用户列表（搜索 / 筛选 / 分页）
2. 新增用户（Modal Form）
3. 编辑用户（Modal Form + 异步加载）
4. 删除用户（Confirm Modal）
5. 批量操作（多选 + 批量删除）
6. 导出 CSV

---

## 38.2 数据获取：用 SWR

\`\`\`bash
npm install swr
\`\`\`

\`\`\`tsx
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function useUsers(params: { page: number; search: string; role: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    \`/api/users?\${new URLSearchParams(params)}\`,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
\`\`\`

---

## 38.3 用户列表

\`\`\`tsx
'use client';

import { useState } from 'react';
import {
  Container, Title, Group, Button, TextInput, Select, Table,
  Pagination, ActionIcon, Menu, Checkbox, Skeleton,
} from '@mantine/core';
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useUsers } from './use-users';
import { UserFormModal } from './user-form-modal';

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit'; user?: any } | null>(null);

  const { users, total, isLoading, refresh } = useUsers({ page, search, role });
  const totalPages = Math.ceil(total / 10);

  const handleDelete = (user: any) => {
    modals.openConfirmModal({
      title: '确认删除',
      children: <p>确定要删除 <b>{user.name}</b> 吗？</p>,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch(\`/api/users/\${user.id}\`, { method: 'DELETE' });
        notifications.show({ message: '删除成功', color: 'green' });
        refresh();
      },
    });
  };

  const handleBatchDelete = () => {
    modals.openConfirmModal({
      title: \`确认删除 \${selected.length} 个用户\`,
      children: <p>此操作不可恢复。</p>,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await fetch('/api/users/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selected }),
        });
        setSelected([]);
        refresh();
        notifications.show({ message: \`已删除 \${selected.length} 个用户\`, color: 'green' });
      },
    });
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>用户管理</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setModalState({ type: 'add' })}
        >
          添加用户
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="搜索姓名 / 邮箱"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="筛选角色"
          data={['管理员', '普通用户', '访客']}
          value={role}
          onChange={setRole}
          clearable
        />
        {selected.length > 0 && (
          <Button color="red" onClick={handleBatchDelete}>
            批量删除 ({selected.length})
          </Button>
        )}
      </Group>

      {isLoading ? (
        <Skeleton h={400} />
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  checked={selected.length === users.length}
                  indeterminate={selected.length > 0 && selected.length < users.length}
                  onChange={(e) => {
                    setSelected(e.currentTarget.checked ? users.map((u: any) => u.id) : []);
                  }}
                />
              </Table.Th>
              <Table.Th>姓名</Table.Th>
              <Table.Th>邮箱</Table.Th>
              <Table.Th>角色</Table.Th>
              <Table.Th>创建时间</Table.Th>
              <Table.Th w={60}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user: any) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Checkbox
                    checked={selected.includes(user.id)}
                    onChange={(e) => {
                      setSelected(e.currentTarget.checked
                        ? [...selected, user.id]
                        : selected.filter(id => id !== user.id)
                      );
                    }}
                  />
                </Table.Td>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Badge color={user.role === 'admin' ? 'red' : 'blue'}>
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>{new Date(user.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => setModalState({ type: 'edit', user })}
                      >
                        编辑
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => handleDelete(user)}
                      >
                        删除
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Group justify="center" mt="md">
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>

      <UserFormModal
        opened={modalState !== null}
        onClose={() => setModalState(null)}
        user={modalState?.user}
        onSuccess={() => {
          setModalState(null);
          refresh();
        }}
      />
    </Container>
  );
}
\`\`\`

---

## 38.4 UserFormModal

\`\`\`tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Modal, Stack, TextInput, Select, Button, Group, Switch,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '姓名必填'),
  email: z.string().email('邮箱错误'),
  role: z.enum(['admin', 'user', 'guest']),
  active: z.boolean(),
});

type Values = z.infer<typeof schema>;

export function UserFormModal({
  opened,
  onClose,
  user,
  onSuccess,
}: {
  opened: boolean;
  onClose: () => void;
  user?: any;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<Values>({
    initialValues: {
      name: '',
      email: '',
      role: 'user',
      active: true,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (opened) {
      if (user) {
        form.setValues({
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        });
      } else {
        form.reset();
      }
    }
  }, [opened, user]);

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    try {
      const url = user ? \`/api/users/\${user.id}\` : '/api/users';
      const method = user ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, messages]) => {
            form.setFieldError(field as keyof Values, (messages as string[])[0]);
          });
        } else {
          form.setFieldError('root', data.message);
        }
        return;
      }
      notifications.show({
        message: user ? '更新成功' : '添加成功',
        color: 'green',
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? '编辑用户' : '添加用户'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {form.errors.root && (
            <Alert color="red">{form.errors.root}</Alert>
          )}
          <TextInput label="姓名" {...form.getInputProps('name')} />
          <TextInput label="邮箱" {...form.getInputProps('email')} />
          <Select
            label="角色"
            data={[
              { value: 'admin', label: '管理员' },
              { value: 'user', label: '普通用户' },
              { value: 'guest', label: '访客' },
            ]}
            {...form.getInputProps('role')}
          />
          <Switch
            label="启用"
            {...form.getInputProps('active', { type: 'checkbox' })}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>取消</Button>
            <Button type="submit" loading={loading}>
              {user ? '更新' : '添加'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
\`\`\`

---

## 38.5 导出 CSV

\`\`\`ts
function exportToCSV(users: User[], filename: string) {
  const headers = ['姓名', '邮箱', '角色', '创建时间'];
  const rows = users.map(u => [
    u.name,
    u.email,
    u.role,
    new Date(u.createdAt).toLocaleString(),
  ]);

  // 加 BOM 让 Excel 正确识别中文
  const csv = '\\uFEFF' + [headers, ...rows]
    .map(row => row.map(cell => \`"\${cell}"\`).join(','))
    .join('\\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 用法
<Button onClick={() => exportToCSV(users, 'users.csv')}>
  导出 CSV
</Button>
\`\`\`

---

## 38.6 高级筛选

\`\`\`tsx
function AdvancedFilter() {
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
    startDate: null,
    endDate: null,
  });

  return (
    <Stack>
      <Group>
        <TextInput
          label="姓名"
          {...form.getInputProps('name')}
        />
        <TextInput
          label="邮箱"
          {...form.getInputProps('email')}
        />
        <Select label="角色" data={['admin', 'user', 'guest']} {...form.getInputProps('role')} />
        <DatePickerInput label="开始日期" {...form.getInputProps('startDate')} />
        <DatePickerInput label="结束日期" {...form.getInputProps('endDate')} />
      </Group>
    </Stack>
  );
}
\`\`\`

---

## 38.7 性能优化

### 1. 虚拟滚动

\`\`\`bash
npm install @tanstack/react-virtual
\`\`\`

\`\`\`tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualUserList({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: \`translateY(\${virtualItem.start}px)\`,
              height: virtualItem.size,
            }}
          >
            {users[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 2. 防抖搜索

\`\`\`tsx
import { useDebouncedValue } from '@mantine/hooks';

function SearchInput() {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);

  // 用 debounced 触发请求
  useEffect(() => {
    fetchUsers({ search: debounced });
  }, [debounced]);

  return (
    <TextInput
      value={search}
      onChange={(e) => setSearch(e.currentTarget.value)}
    />
  );
}
\`\`\`

---

## 38.8 完整 API

\`\`\`ts
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  active: z.boolean(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  const where = {
    AND: [
      search ? { OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ] } : {},
      role ? { role } : {},
    ],
  };

  const [users, total] = await Promise.all([
    db.users.findMany({
      where,
      skip: (page - 1) * 10,
      take: 10,
    }),
    db.users.count({ where }),
  ]);

  return NextResponse.json({ users, total });
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const user = await db.users.create({ data: result.data });
  return NextResponse.json({ success: true, user });
}
\`\`\`

---

## 38.9 小结

用户管理后台的核心：

- **列表**：Table + 搜索 + 筛选 + 分页。
- **新增/编辑**：Modal Form + useForm。
- **删除**：modals.openConfirmModal。
- **批量操作**：Checkbox 多选 + 批量 API。
- **导出 CSV**：Blob + download。
- **性能**：虚拟滚动 + 防抖搜索。

> ⭐ 记住：**「SWR 拉数据 + Modal 表单 + modals 确认 + 防抖搜索 = 用户管理后台四件套」**。

下一章开始总结。
`,
  },

  // ============================================================
  // 第三十九章
  // ============================================================
  {
    id: "mantine3-ch39",
    group: "结尾",
    icon: "🏆",
    title: "第三十九章 总结：Mantine 之道的核心",
    content: `## 39.1 一图回顾 Mantine 全景

\`\`\`
┌───────────────────────────────────────────────┐
│              Mantine v9 架构                    │
├───────────────────────────────────────────────┤
│  设计理念                                       │
│  - CSS 变量层                                    │
│  - Hooks 一等公民                                 │
│  - 渐进式采用                                     │
├───────────────────────────────────────────────┤
│  设计目的                                       │
│  - 解决样式难覆盖                                 │
│  - 解决主题不灵活                                 │
│  - 解决暗色模式差                                 │
├───────────────────────────────────────────────┤
│  主题系统                                        │
│  - createTheme (主题对象)                         │
│  - MantineProvider (注入)                        │
│  - CSS 变量层 (编译期)                            │
│  - 浏览器原生级联 (运行时)                          │
├───────────────────────────────────────────────┤
│  Form 验证                                      │
│  - useForm (内置校验)                            │
│  - getInputProps (一站式)                        │
│  - zodResolver (Zod 集成)                        │
│  - 动态字段 / 数组字段 / 嵌套对象                   │
└───────────────────────────────────────────────┘
\`\`\`

---

## 39.2 三大核心理念回顾

### 理念 1：CSS 变量层

**为什么**：

- 运行时切换几乎零成本。
- SSR 友好。
- 浏览器原生支持。
- 可调试性强。

**怎么用**：

- \`createTheme\` 编译为 \`--mantine-*\` 变量。
- 业务代码用 \`var(--mantine-color-blue-5)\`。
- 暗色模式 = \`data-mantine-color-scheme\` 属性 + CSS 变量切换。

### 理念 2：Hooks 一等公民

**为什么**：

- 通用问题抽成 hook，组件只是 hook 的封装。
- \`@mantine/hooks\` 可独立使用。

**怎么用**：

- \`useDisclosure\`、\`useDebouncedValue\`、\`useLocalStorage\` 等 50+ hooks。
- 业务代码里灵活组合。

### 理念 3：渐进式采用

**为什么**：

- 不强求 all or nothing。
- 老项目可逐步替换。

**怎么用**：

- 只用 \`@mantine/hooks\`：零样式。
- 只用 1-2 个组件：按需装。
- 全部用上：完整 13 个包。

---

## 39.3 三大设计目的回顾

### 目的 1：解决样式难覆盖

**问题**：传统组件库样式深度嵌套（\`>>> .ant-btn .ant-btn-icon\`）。

**Mantine 解法**：

- \`styles\` prop：直接传样式对象。
- \`classNames\` prop：直接传 className。
- 主题级 \`components.Button.styles\`：全局默认。

### 目的 2：解决主题不灵活

**问题**：主题色只能在预定义颜色里选。

**Mantine 解法**：

- \`colors\` 接受任意 10 阶色板。
- Mantine Color Generator 工具。
- 24 个预定义色板 + 自定义。

### 目的 3：解决暗色模式差

**问题**：暗色模式只是颜色翻转，对比度差。

**Mantine 解法**：

- CSS 变量层，零 React 重渲染。
- 24 个色板都针对暗色优化。
- primaryShade 让亮色 / 暗色用不同色阶。

---

## 39.4 Theme 系统核心

### createTheme 的三大类配置

1. **设计 token**：\`primaryColor\`, \`defaultRadius\`, \`spacing\`, \`fontFamily\`, \`breakpoints\`。
2. **颜色系统**：\`colors\`（10 阶色板）, \`primaryShade\`（亮暗色阶）。
3. **组件覆盖**：\`components.Button.styles\` 等。

### 主题覆盖的优先级

\`\`\`
组件实例 styles > 主题级 components.styles > 默认值
组件实例 className > 主题级 components.classNames
组件实例 props > 主题级 components.defaultProps
\`\`\`

### 暗色模式的 5 个关键点

1. \`defaultColorScheme="auto"\` 跟随系统。
2. \`<ColorSchemeScript>\` 防止 SSR 闪烁。
3. \`primaryShade: { light: 6, dark: 4 }\` 优化对比度。
4. \`var(--mantine-color-body)\` 自动适配亮暗色。
5. \`useComputedColorScheme()\` 拿到实际生效的色板。

---

## 39.5 Form 验证核心

### useForm 的设计哲学

1. **校验内置**：\`validate\` 配置即可，不用额外库。
2. **getInputProps 一站式**：value / onChange / onBlur / error 一行绑定。
3. **controlled / uncontrolled 双模式**：性能 vs 易用性。
4. **TypeScript 泛型**：\`useForm<FormValues>\` 完整类型推断。

### Form 校验的 4 个核心 API

1. \`useForm\` - 创建表单。
2. \`form.validate()\` / \`form.validateField(name)\` - 手动校验。
3. \`form.setFieldError(name, msg)\` - 设置错误。
4. \`form.getInputProps(name, options)\` - 一站式绑定。

### Zod 联动的价值

- 一份 schema，前后端共用。
- TypeScript 类型自动推导。
- 复杂校验（嵌套、refine、superRefine）。

---

## 39.6 性能优化的核心

### 主题性能

- CSS 变量层：暗色切换 < 5ms（1000 组件）。
- 不展开 var()：保留响应式能力。
- \`useMemo\` 缓存 theme 对象。

### Form 性能

- controlled 模式：每次输入 re-render。
- uncontrolled 模式：只在 submit 时读 DOM。
- 大量动态字段用 React.memo 包装。

### 整体性能

- \`var()\` 替代 \`useMantineTheme()\`：零订阅。
- \`vars\` 替代 \`styles\`：CSS 变量级。
- 懒加载：\`next/dynamic\`。

---

## 39.7 实战项目的核心模式

### 登录 / 注册

- 共享 Zod schema。
- API 返回 \`{ fieldErrors }\` / \`{ message }\`。
- 前端 \`form.setFieldError\` 回填。

### 用户管理

- SWR 拉数据。
- Modal Form 编辑。
- modals.openConfirmModal 删除。
- 防抖搜索。

### 多步表单

- 单 form + Stepper。
- \`validateField\` 单步校验。
- URL 同步步骤。

### Modal Form

- 关闭时 form.reset。
- 编辑用 setValues 重置。
- 未保存用 isDirty 检查。

---

## 39.8 一句话总结

> **「Mantine 是 CSS 变量 + Hooks 驱动的 React 组件库，主题用 createTheme → MantineProvider → CSS 变量层编译期生成，Form 用 useForm + getInputProps + Zod 联动实现零依赖校验，性能靠 CSS 变量层零重渲染。」**

---

## 39.9 给读者的话

如果你读到这里，恭喜你——你已经理解了 Mantine 的「道」。

Mantine 不只是「另一个组件库」，它是一套**完整的 React UI 工具集**：

- **主题系统**：用 CSS 变量层实现 0 重渲染的暗色模式。
- **Form 验证**：用 useForm + Zod 实现零依赖、强类型的表单。
- **Hooks 生态**：50+ 通用 Hooks 解决 80% 常见问题。
- **包结构**：13 个包按需装，渐进式采用。

希望这本书能帮你在项目中**用好** Mantine，写出更优雅、更高效、更易维护的代码。

---

## 39.10 推荐资源

### 官方文档

- Mantine 官方文档：https://mantine.dev
- Mantine Color Generator：https://mantine.dev/colors-generator/
- Mantine Studio：https://studio.mantine.dev
- @mantine/devtools：用于调试主题。

### 社区资源

- GitHub：https://github.com/mantinedev/mantine
- Discord：https://discord.gg/mantine
- 中文社区：搜索「Mantine 中文」

### 相关库

- Zod：https://zod.dev
- dayjs：日期库（Mantine dates 依赖）
- @hello-pangea/dnd：拖拽排序

---

## 39.11 小结

- **核心理念**：CSS 变量 + Hooks + 渐进式。
- **设计目的**：解决样式、主题、暗色三大痛点。
- **Theme 系统**：createTheme + MantineProvider + CSS 变量。
- **Form 验证**：useForm + getInputProps + Zod。
- **性能**：CSS 变量层 + useMemo + var()。

> ⭐ 这是 Mantine 之道的**完整心智模型**。掌握了这个模型，你可以预判任何 Mantine API 的设计，遇到任何问题都能找到解决方案。

下一章是最后一章，我们给出完整的 API 速查和学习路径。
`,
  },

  // ============================================================
  // 第四十章
  // ============================================================
  {
    id: "mantine3-ch40",
    group: "结尾",
    icon: "📖",
    title: "第四十章 总结：所有 API 速查 + 学习路径",
    content: `## 40.1 完整 API 速查表

### 主题相关

| API | 作用 |
| --- | --- |
| \`createTheme(overrides)\` | 创建主题 |
| \`MantineProvider\` | 注入主题 + 暗色模式 |
| \`<ColorSchemeScript>\` | SSR 防闪烁 |
| \`mantineHtmlProps\` | 服务端 \`<html>\` 属性 |
| \`useMantineTheme()\` | 拿 JS 主题对象 |
| \`useMantineCssVariables()\` | 拿 CSS 变量 |
| \`useMantineColorScheme()\` | 拿 + 设置色板 |
| \`useColorScheme()\` | 用户偏好（light/dark/auto） |
| \`useComputedColorScheme()\` | 实际生效（light/dark） |
| \`setColorScheme(scheme)\` | 全局设置色板（不订阅） |

### 主题 token

| Token | 作用 |
| --- | --- |
| \`primaryColor\` | 全局主色 |
| \`primaryShade\` | 亮暗色阶（light: 6, dark: 4） |
| \`defaultRadius\` | 全局圆角（xs/sm/md/lg/xl） |
| \`colors\` | 自定义色板（10 阶） |
| \`spacing\` | 间距 token |
| \`radius\` | 圆角 token |
| \`shadows\` | 阴影 token |
| \`breakpoints\` | 断点 token |
| \`fontFamily\` / \`fontFamilyMonospace\` | 字体 |
| \`headings\` | 标题样式 |
| \`cursorType\` / \`focusRing\` / \`respectReducedMotion\` | 全局行为 |
| \`other\` | 自定义 token |

### 主题覆盖

| 子配置 | 作用 |
| --- | --- |
| \`defaultProps\` | 全局默认 props |
| \`classNames\` | 全局 className |
| \`styles\` | 全局样式对象（runtime 合并） |
| \`vars\` | 全局 CSS 变量（CSS 变量级） |

### Form 相关

| API | 作用 |
| --- | --- |
| \`useForm(config)\` | 创建表单 |
| \`form.values\` | 当前值 |
| \`form.errors\` | 当前错误 |
| \`form.touched\` / \`form.dirty\` | 触摸 / 改动状态 |
| \`form.isValid\` / \`form.isDirty\` | 全局校验 / 改动状态 |
| \`form.setFieldValue(k, v)\` | 设置单个值 |
| \`form.setValues(values)\` | 设置多个值 |
| \`form.setFieldError(k, msg)\` | 设置单个错误 |
| \`form.setErrors(errors)\` | 设置多个错误 |
| \`form.clearFieldError(k)\` | 清除单个错误 |
| \`form.clearErrors()\` | 清除所有错误 |
| \`form.validate()\` | 校验整个表单 |
| \`form.validateField(k)\` | 校验单个字段 |
| \`form.reset()\` | 重置 |
| \`form.onSubmit(handler)\` | 提交（先校验） |
| \`form.getInputProps(k, options)\` | 一站式绑定 |
| \`form.insertListItem(k, v, i?)\` | 数组插入 |
| \`form.removeListItem(k, i)\` | 数组删除 |
| \`form.reorderListItem(k, from, to)\` | 数组移动 |
| \`form.replaceListItem(k, i, v)\` | 数组替换 |
| \`zodResolver(schema)\` | Zod 集成 |

### Form 配置

| 字段 | 作用 |
| --- | --- |
| \`mode\` | controlled / uncontrolled |
| \`initialValues\` | 初始值 |
| \`validate\` | 校验函数 / Zod resolver |
| \`validateInputOnBlur\` | blur 时校验 |
| \`validateInputOnChange\` | change 时校验（boolean 或字段数组） |
| \`validateInputOnChangeIfTouched\` | 触摸后 change 校验 |
| \`clearErrorsOnFocus\` | focus 时清除错误 |
| \`transformValues\` | 提交前转换值 |
| \`initialErrors\` / \`initialTouched\` / \`initialDirty\` | 初始状态 |

### Provider

| Provider | 作用 |
| --- | --- |
| \`<MantineProvider>\` | 主题 + 暗色模式 |
| \`<DatesProvider>\` | 日期国际化 |
| \`<ModalsProvider>\` | 命令式弹窗 |
| \`<Notifications>\` | 全局通知 |
| \`<Spotlight>\` | Spotlight 搜索 |

### Hooks（最常用）

| Hook | 作用 |
| --- | --- |
| \`useDisclosure\` | 打开 / 关闭状态 |
| \`useDebouncedValue\` | 防抖值 |
| \`useLocalStorage\` | localStorage 同步 |
| \`useSessionStorage\` | sessionStorage 同步 |
| \`useMediaQuery\` | 媒体查询 |
| \`useContainerQuery\` | 容器查询 |
| \`useHotkeys\` | 快捷键 |
| \`useIdle\` | 空闲检测 |
| \`useIntersection\` | 进入视口 |
| \`useResizeObserver\` | 元素尺寸 |
| \`useMouse\` / \`useMove\` | 鼠标位置 |
| \`useNetwork\` | 网络状态 |
| \`useFullscreen\` | 全屏 |
| \`useDocumentTitle\` / \`useFavicon\` | 文档标题 |
| \`useScrollIntoView\` | 滚动到元素 |

---

## 40.2 完整组件速查（80+ 组件）

### 文本排版
\`Text\`, \`Title\`, \`Code\`, \`Blockquote\`, \`List\`, \`Mark\`, \`Highlight\`, \`Anchor\`, \`Kbd\`

### 布局
\`Box\`, \`Stack\`, \`Group\`, \`Grid\`, \`Flex\`, \`Container\`, \`Center\`, \`SimpleGrid\`, \`AspectRatio\`, \`AppShell\`

### 按钮标识
\`Button\`, \`ActionIcon\`, \`Badge\`, \`Indicator\`, \`ThemeIcon\`, \`CloseButton\`, \`CopyButton\`

### 表单输入
\`TextInput\`, \`NumberInput\`, \`PasswordInput\`, \`Textarea\`, \`Select\`, \`MultiSelect\`, \`Combobox\`, \`TagsInput\`, \`Autocomplete\`, \`Checkbox\`, \`Radio\`, \`Switch\`, \`Slider\`, \`RangeSlider\`, \`SegmentedControl\`, \`PinInput\`, \`FileInput\`, \`FileButton\`, \`ColorInput\`, \`ColorPicker\`, \`Rating\`

### 反馈
\`Loader\`, \`Alert\`, \`Notification\`, \`Skeleton\`, \`Progress\`, \`RingProgress\`, \`SemiCircleProgress\`

### 覆盖层
\`Modal\`, \`Drawer\`, \`Menu\`, \`Popover\`, \`HoverCard\`, \`Tooltip\`, \`Dialog\`, \`LoadingOverlay\`

### 导航
\`Tabs\`, \`Breadcrumbs\`, \`Pagination\`, \`NavLink\`, \`Stepper\`, \`Accordion\`, \`Tree\`

### 数据展示
\`Card\`, \`Paper\`, \`Table\`, \`Timeline\`, \`Avatar\`, \`Divider\`

### 其他包

| 包 | 主要组件 |
| --- | --- |
| \`@mantine/dates\` | DatePicker, DateTimePicker, MonthPicker, YearPicker, Calendar, DatePickerInput |
| \`@mantine/notifications\` | notifications.show / .update / .hide / .clean |
| \`@mantine/modals\` | modals.open / .openConfirmModal / .close / .closeAll |
| \`@mantine/spotlight\` | Spotlight |
| \`@mantine/dropzone\` | Dropzone |
| \`@mantine/carousel\` | Carousel |
| \`@mantine/charts\` | LineChart, BarChart, AreaChart, ScatterChart, DonutChart, PieChart, RadarChart, BubbleChart, CompositeChart |
| \`@mantine/tiptap\` | RichTextEditor |
| \`@mantine/nprogress\` | NavigationProgress |

---

## 40.3 学习路径推荐

### 初学者（1-2 周）

1. 安装 + 最简应用（\`@mantine/core\` + \`@mantine/hooks\`）。
2. 基础组件：Button、TextInput、Stack、Group、Grid。
3. \`createTheme\` + 基础主题配置。
4. 简单表单：useForm + 基础校验。

### 中级（2-4 周）

1. 完整 Provider 树（MantineProvider + DatesProvider + ModalsProvider + Notifications）。
2. 主题进阶：自定义色板、primaryShade、暗色模式。
3. 复杂表单：动态字段、数组字段、嵌套对象。
4. Zod 集成。
5. useDisclosure、useDebouncedValue、useLocalStorage。

### 高级（4+ 周）

1. 自定义主题 tokens（other 字段、vars resolver）。
2. 主题级组件覆盖（classNames、styles、vars）。
3. CSS 变量层优化、postcss 配置。
4. 多步表单、Modal Form、复杂业务场景。
5. 性能优化、devtools 调试、SSR / RSC 边界。

### 进阶（持续）

1. @mantine/hooks 50+ hooks 全掌握。
2. @mantine/dates、@mantine/charts、@mantine/tiptap 等扩展包。
3. Mantine 源码阅读（理解设计模式）。
4. 贡献社区 / 写自己的 Mantine 扩展。

---

## 40.4 实战项目推荐

### 入门项目

1. **个人博客**：用 Mantine + Next.js 16 做博客首页。
2. **Todo List**：练习 useForm、Notifications、Modals。
3. **登录注册页**：练习 Zod + useForm + 暗色模式。

### 中级项目

1. **用户管理后台**：Table + Modal + 搜索 + 分页 + 批量操作。
2. **Dashboard**：SimpleGrid + Card + 图表（@mantine/charts）。
3. **电商网站**：ProductCard + Filter + Cart。

### 高级项目

1. **CMS 系统**：完整的内容管理（CRUD + 权限 + 多租户）。
2. **企业级 SaaS**：多主题、多语言、复杂表单、权限管理。
3. **组件库**：基于 Mantine 封装自己的业务组件库。

---

## 40.5 常见错误总结

### 主题

1. ❌ colors 数组不是 10 阶 → ✅ 用 \`MantineColorsTuple\` 类型。
2. ❌ primaryColor 引用不存在的色 → ✅ 检查 colors 的 key。
3. ❌ 暗色模式 primaryShade=6 太深 → ✅ 改 dark: 4。
4. ❌ 硬编码颜色 → ✅ 用 \`var(--mantine-color-body)\`。
5. ❌ 主题切换触发重渲染 → ✅ 用 \`useMemo\` 缓存。

### Form

1. ❌ 忘记传 initialValues → ✅ 必填。
2. ❌ validate 函数没 return null → ✅ 显式返回。
3. ❌ 跨字段校验没用 values 参数 → ✅ 用 \`(value, values) => ...\`。
4. ❌ onSubmit 没用 form.onSubmit → ✅ 用 \`form.onSubmit(handler)\`。
5. ❌ 服务端错误没回填 → ✅ 用 \`form.setFieldError\`。
6. ❌ 关闭 Modal 时状态没清空 → ✅ 用 \`form.reset()\`。
7. ❌ 数组字段用 index 作 key → ✅ 用稳定 id。

### 性能

1. ❌ 每次 render 创建新 theme → ✅ 用 \`useMemo\`。
2. ❌ 用 useMantineTheme 拿颜色 → ✅ 用 \`var()\`。
3. ❌ styles 传内联对象 → ✅ 提取到组件外或用 vars。
4. ❌ 大表单用 controlled 模式 → ✅ 用 uncontrolled + React.memo。
5. ❌ 全局 import 所有组件 → ✅ 按需 import（虽然 tree-shake 会自动处理）。

---

## 40.6 速查：常用模式

### 主题切换按钮

\`\`\`tsx
function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme();
  return (
    <ActionIcon onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}>
      {computed === 'dark' ? <IconSun /> : <IconMoon />}
    </ActionIcon>
  );
}
\`\`\`

### 完整 Form 模板

\`\`\`tsx
const form = useForm({
  initialValues: { /* ... */ },
  validate: zodResolver(schema),
  validateInputOnBlur: true,
});

<form onSubmit={form.onSubmit(async (values) => {
  // 提交
})}>
  <TextInput {...form.getInputProps('field')} />
  <Button type="submit">提交</Button>
</form>
\`\`\`

### Modal Form 模板

\`\`\`tsx
<Modal opened={opened} onClose={close}>
  <form onSubmit={form.onSubmit(handleSubmit)}>
    {/* 字段 */}
    <Button type="submit">保存</Button>
  </form>
</Modal>
\`\`\`

### 多步表单模板

\`\`\`tsx
const [step, setStep] = useState(0);

<Stepper active={step}>
  <Stepper.Step>{/* 步骤 1 */}</Stepper.Step>
  <Stepper.Step>{/* 步骤 2 */}</Stepper.Step>
</Stepper>

<Button onClick={() => {
  if (validateStep(step)) setStep(step + 1);
}}>
  下一步
</Button>
\`\`\`

---

## 40.7 致谢

感谢你读完了这本《Mantine 之道 · 理念与设计目的》。

希望这本书能帮你在 React 项目的路上走得更稳、更远。

**记住**：

- **核心理念**：CSS 变量 + Hooks + 渐进式。
- **设计目的**：解决样式、主题、暗色三大痛点。
- **Form 验证**：useForm + getInputProps + Zod。
- **性能**：CSS 变量层 + useMemo + var()。

如果有任何问题，欢迎：

- 查看 Mantine 官方文档：https://mantine.dev
- 加入 Discord 社区：https://discord.gg/mantine
- 提交 GitHub Issue：https://github.com/mantinedev/mantine

祝你在 Mantine 的世界里玩得开心！

---

## 40.8 全书完

\`\`\`
┌──────────────────────────────────────────┐
│                                          │
│   Mantine 之道 · 理念与设计目的           │
│                                          │
│   40 章 · 6 部分 · 完整体系               │
│                                          │
│   - 核心理念（1-6 章）                    │
│   - 架构目的（7-13 章）                   │
│   - 主题系统（14-25 章）                  │
│   - Form 验证（26-33 章）                 │
│   - 综合实战（34-38 章）                  │
│   - 总结（39-40 章）                      │
│                                          │
│   写作完成时间：2026-07-21                │
│   适用版本：Mantine v9                    │
│                                          │
│   Happy coding with Mantine! 🚀          │
│                                          │
└──────────────────────────────────────────┘
\`\`\`
`,
  },
];

export { chapters };
