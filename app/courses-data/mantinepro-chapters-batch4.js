// =============================================================
// Mantine v9 深度实战 —— 第 4 批章节（Form 表单基础）
// -------------------------------------------------------------
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "mantinepro-form-intro",
    icon: "📋",
    title: "@mantine/form 入门",
    group: "三、Mantine Form 验证",
    content: `# @mantine/form 入门

## 一、为什么需要 @mantine/form

在 React 中管理表单状态是一项繁琐的工作：跟踪每个字段的值、处理验证错误、管理提交状态、处理嵌套字段和动态列表……@mantine/form 就是为了解决这些问题而存在的。

@mantine/form 的优势：

1. **独立包**：不依赖 @mantine/core，可以和任何 UI 库甚至原生 input 一起使用
2. **类型安全**：完整的 TypeScript 类型推断
3. **灵活验证**：支持内联验证函数、schema 验证（Zod/Yup/Valibot）
4. **非受控模式**：输入不触发重渲染，性能优秀
5. **嵌套和列表**：原生支持嵌套对象和动态数组
6. **功能完整**：dirty/touched/submitting/validating 状态管理

### 安装

\`\`\`bash
npm install @mantine/form
# 如果使用 Zod schema 验证
npm install zod
\`\`\`

---

## 二、useForm 基础

### 2.1 最小示例

\`\`\`jsx
import { TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';

function LoginForm() {
  // useForm 返回一个 form 对象，包含所有表单操作方法
  const form = useForm({
    mode: 'uncontrolled', // 非受控模式（v7+ 推荐）
    initialValues: {
      email: '',
      password: '',
    },
    // 验证规则：每个字段对应一个验证函数
    validate: {
      email: (value) =>
        /^\\S+@\\S+\\.\\S+\$/.test(value) ? null : '邮箱格式不正确',
      password: (value) =>
        value.length >= 6 ? null : '密码至少 6 个字符',
    },
  });

  // form.onSubmit：提交处理
  // 验证通过后调用第一个回调，失败则自动显示错误
  const handleSubmit = (values) => {
    console.log('提交数据：', values);
    // 调用 API...
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* getInputProps：自动绑定 value/onChange/onBlur/error */}
      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        withAsterisk
        key={form.key('email')} // 非受控模式必须
        {...form.getInputProps('email')}
      />
      <TextInput
        label="密码"
        placeholder="请输入密码"
        type="password"
        withAsterisk
        mt="md"
        key={form.key('password')}
        {...form.getInputProps('password')}
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">登录</Button>
      </Group>
    </form>
  );
}
\`\`\`

### 2.2 form 对象的核心 API

| API | 说明 |
|-----|------|
| \`form.values\` | 当前表单值 |
| \`form.errors\` | 当前验证错误 |
| \`form.getInputProps(path)\` | 获取字段绑定 props |
| \`form.setFieldValue(path, value)\` | 设置单个字段值 |
| \`form.setValues(values)\` | 设置多个字段值 |
| \`form.setFieldError(path, error)\` | 设置单个字段错误 |
| \`form.clearErrors()\` | 清除所有错误 |
| \`form.validate()\` | 触发所有字段验证 |
| \`form.validateField(path)\` | 验证单个字段 |
| \`form.isValid()\` | 检查表单是否有效 |
| \`form.reset()\` | 重置表单到 initialValues |
| \`form.onSubmit(success, error?)\` | 提交处理 |

---

## 三、验证策略详解

### 3.1 内联验证函数

最基础的验证方式是给每个字段一个函数：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '', age: 0 },
  validate: {
    name: (value) => {
      if (!value) return '姓名不能为空';
      if (value.length < 2) return '姓名至少 2 个字符';
      if (value.length > 20) return '姓名最多 20 个字符';
      return null; // 返回 null 表示验证通过
    },
    email: (value) =>
      /^\\S+@\\S+\\.\\S+\$/.test(value) ? null : '邮箱格式不正确',
    age: (value) => {
      if (value < 18) return '必须年满 18 岁';
      if (value > 150) return '年龄超出范围';
      return null;
    },
  },
});
\`\`\`

### 3.2 验证函数的参数

每个验证函数接收四个参数：

\`\`\`jsx
validate: {
  confirmPassword: (
    value,   // 该字段的值
    values,  // 所有表单值（用于跨字段验证）
    path,    // 字段路径，如 'confirmPassword' 或 'user.email'
    signal,  // AbortSignal，用于取消异步验证
  ) => {
    // 跨字段验证：确认密码与密码一致
    if (value !== values.password) return '两次密码不一致';
    return null;
  },
},
\`\`\`

### 3.3 函数式验证

当验证逻辑复杂，需要访问所有字段时，可以用函数式验证：

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', age: undefined, role: '' },
  // validate 是一个函数，接收所有表单值，返回错误对象
  validate: (values) => ({
    name: values.name?.length < 2 ? '姓名太短' : null,
    age: values.age === undefined
      ? '请输入年龄'
      : values.age < 18 ? '必须年满 18 岁' : null,
    role: !values.role ? '请选择角色' : null,
  }),
});
\`\`\`

---

## 四、验证时机控制

### 4.1 默认：提交时验证

默认情况下，验证只在表单提交时触发。

### 4.2 validateInputOnChange：输入时验证

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  // 所有字段输入时都验证
  validateInputOnChange: true,
  // 或者只验证指定字段
  // validateInputOnChange: ['email', 'username'],
});
\`\`\`

### 4.3 validateInputOnBlur：失焦时验证

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  // 所有字段失焦时验证（推荐的用户体验）
  validateInputOnBlur: true,
});
\`\`\`

### 4.4 clearInputErrorOnChange

\`\`\`jsx
const form = useForm({
  mode: 'uncontrolled',
  clearInputErrorOnChange: true, // 默认：输入变化时清除该字段错误
});
\`\`\`

---

## 五、内置验证函数

@mantine/form 导出了常用的验证函数，不用自己写正则：

\`\`\`jsx
import {
  useForm,
  isNotEmpty,  // 非空检查
  isEmail,     // 邮箱格式
  isInRange,   // 数值范围
  hasLength,   // 长度检查
  matches,     // 正则匹配
  matchesField,// 与另一字段匹配
  isUrl,       // URL 格式
  isOneOf,     // 枚举值
  isJSONString,// JSON 字符串
} from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    name: '',
    email: '',
    age: 18,
    password: '',
    confirmPassword: '',
    website: '',
    role: '',
  },
  validate: {
    name: hasLength({ min: 2, max: 20 }, '姓名长度 2-20 字符'),
    email: isEmail('邮箱格式不正确'),
    age: isInRange({ min: 18, max: 99 }, '年龄 18-99 岁'),
    password: hasLength({ min: 8 }, '密码至少 8 个字符'),
    confirmPassword: matchesField('password', '两次密码不一致'),
    website: isUrl('URL 格式不正确'),
    role: isOneOf(['user', 'admin'], '请选择有效角色'),
  },
});
\`\`\`

---

## 六、getInputProps 的 type 选项

对于 Checkbox、Switch 等非文本输入组件，需要指定 type：

\`\`\`jsx
import { Checkbox, Switch, Radio } from '@mantine/core';

<Checkbox
  label="同意条款"
  key={form.key('agree')}
  // type: 'checkbox' 必须
  {...form.getInputProps('agree', { type: 'checkbox' })}
/>

<Switch
  label="接收通知"
  key={form.key('notify')}
  {...form.getInputProps('notify', { type: 'checkbox' })}
/>

<Radio.Group
  label="性别"
  key={form.key('gender')}
  {...form.getInputProps('gender')}
>
  <Radio value="male" label="男" />
  <Radio value="female" label="女" />
</Radio.Group>;
\`\`\`

---

## 本章小结

- @mantine/form 是独立的表单状态管理库，不依赖 UI 组件
- useForm 的 mode: 'uncontrolled' 是推荐模式，配合 key={form.key()} 使用
- getInputProps 自动绑定字段的 value、onChange、onBlur、error
- 验证方式：内联函数（rules object）和函数式验证
- 验证时机：默认提交时验证，也可配置输入时/失焦时验证
- 内置验证函数：isNotEmpty、isEmail、hasLength、matchesField 等
- Checkbox/Switch 需要传 { type: 'checkbox' }

下一章我们学习 Schema 验证，这是 v9 最重要的更新之一。`,
  },
  {
    id: "mantinepro-form-schema",
    icon: "✅",
    title: "Schema 验证（v9 重点）",
    group: "三、Mantine Form 验证",
    content: `# Schema 验证（v9 重点）

## 一、Standard Schema 规范

**v9 重大变更**：Mantine Form v9 采用 [Standard Schema](https://standardschema.dev/) 规范，统一了 Zod、Valibot、ArkType 等 schema 库的接口。

在 v8 中，你需要为不同的 schema 库导入不同的 resolver：
- \`zodResolver\`（Zod）
- \`yupResolver\`（Yup）
- \`valibotResolver\`（Valibot）

在 v9 中，**全部统一为 \`schemaResolver\`**，只要 schema 库符合 Standard Schema 规范就能直接使用。

---

## 二、使用 Zod 验证（推荐）

### 2.1 基本用法

\`\`\`jsx
import { z } from 'zod/v4'; // 注意：v9 推荐使用 zod/v4
import { useForm, schemaResolver } from '@mantine/form';

// 1. 定义 Zod schema
const schema = z.object({
  name: z.string().min(2, '姓名至少 2 个字符'),
  email: z.email('邮箱格式不正确'), // v4 新增 z.email()
  age: z.number().min(18, '必须年满 18 岁'),
});

// 2. 使用 schemaResolver
const form = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '', email: '', age: 18 },
  // { sync: true } 表示同步验证（Zod 支持同步模式）
  validate: schemaResolver(schema, { sync: true }),
});
\`\`\`

### 2.2 常用 Zod 验证规则

\`\`\`jsx
const userSchema = z.object({
  // 字符串
  username: z.string()
    .min(2, '至少 2 个字符')
    .max(20, '最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+\$/, '只能包含字母、数字、下划线'),

  // 邮箱
  email: z.email('邮箱格式不正确'),

  // 密码
  password: z.string()
    .min(8, '密码至少 8 个字符')
    .regex(/^(?=.*[a-zA-Z])(?=.*\\d).+\$/, '必须包含字母和数字'),

  // 布尔值：必须勾选
  agree: z.literal(true, '必须同意服务条款'),

  // 可选字段
  bio: z.string().max(500, '简介最多 500 字').optional(),
});
\`\`\`

### 2.3 跨字段验证：refine

\`\`\`jsx
const registerSchema = z
  .object({
    password: z.string().min(8, '密码至少 8 个字符'),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  // refine：对象级别的跨字段验证
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: '两次输入的密码不一致',
      path: ['confirmPassword'], // 错误显示在 confirmPassword 字段
    }
  );
\`\`\`

### 2.4 多条跨字段规则：superRefine

\`\`\`jsx
const schema = z
  .object({
    username: z.string().min(2),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    // 规则1：两次密码一致
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: '两次密码不一致',
      });
    }
    // 规则2：密码不能包含用户名
    if (
      data.username.length >= 3 &&
      data.password.toLowerCase().includes(data.username.toLowerCase())
    ) {
      ctx.addIssue({
        path: ['password'],
        code: 'custom',
        message: '密码不能包含用户名',
      });
    }
  });
\`\`\`

### 2.5 异步验证

\`\`\`jsx
// 模拟检查用户名是否已被占用
async function checkUsernameExists(username) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return ['admin', 'root', 'test'].includes(username.toLowerCase());
}

const schema = z
  .object({
    username: z.string().min(2, '用户名至少 2 个字符'),
    email: z.email('邮箱格式不正确'),
  })
  .refine(
    async (data) => {
      // 异步验证：调用 API 检查用户名
      const exists = await checkUsernameExists(data.username);
      return !exists;
    },
    {
      message: '用户名已被使用',
      path: ['username'],
    }
  );

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { username: '', email: '' },
  // 异步验证不传 { sync: true }
  validate: schemaResolver(schema),
});

// 异步验证时，form.validate() 返回 Promise
const result = await form.validate();
\`\`\`

---

## 三、sync 与 async 模式

\`\`\`jsx
// ============ 同步模式 ============
// 当 schema 中没有异步验证时，传 { sync: true }
// form.validate() 同步返回结果，不返回 Promise
const syncForm = useForm({
  mode: 'uncontrolled',
  initialValues: { name: '' },
  validate: schemaResolver(zodSchema, { sync: true }),
});

// 直接调用，不需要 await
syncForm.validate();
console.log(syncForm.isValid()); // 同步返回 boolean

// ============ 异步模式（默认）==========
// 当 schema 包含异步验证（refine async）时
// 不传 { sync: true }
const asyncForm = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '' },
  validate: schemaResolver(asyncSchema),
});

// 需要 await
await asyncForm.validate();
console.log(await asyncForm.isValid());
\`\`\`

**什么时候用 sync: true？**

- 纯字段验证（min、max、regex、email 等同步规则）
- 需要同步获取验证结果（如按钮禁用状态）

**什么时候不用？**

- 包含异步 refine（如 API 检查用户名是否存在）
- 包含异步 transform

---

## 四、嵌套和数组字段

### 4.1 嵌套对象

\`\`\`jsx
const nestedSchema = z.object({
  user: z.object({
    firstName: z.string().min(2, '名至少 2 字符'),
    lastName: z.string().min(2, '姓至少 2 字符'),
  }),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { user: { firstName: '', lastName: '' } },
  validate: schemaResolver(nestedSchema, { sync: true }),
});

// 使用点号路径访问嵌套字段
<TextInput
  label="名"
  key={form.key('user.firstName')}
  {...form.getInputProps('user.firstName')}
/>;
\`\`\`

### 4.2 数组字段

\`\`\`jsx
import { randomId } from '@mantine/hooks';

const listSchema = z.object({
  employees: z.array(
    z.object({
      name: z.string().min(2, '姓名至少 2 字符'),
      active: z.boolean(),
    })
  ),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: {
    employees: [{ name: '', active: false, key: randomId() }],
  },
  validate: schemaResolver(listSchema, { sync: true }),
});

// 添加列表项
form.insertListItem('employees', {
  name: '',
  active: false,
  key: randomId(), // 用 randomId 生成唯一 key
});

// 删除列表项
form.removeListItem('employees', index);

// 渲染列表
const fields = form.getValues().employees.map((item, index) => (
  <TextInput
    key={item.key}
    label={\`员工 \${index + 1}\`}
    {...form.getInputProps(\`employees.\${index}.name\`)}
  />
));
\`\`\`

Mantine Form 提供 4 个列表操作方法：

| 方法 | 说明 |
|------|------|
| \`insertListItem(path, item, index?)\` | 插入项（默认追加到末尾） |
| \`removeListItem(path, index)\` | 删除指定索引的项 |
| \`replaceListItem(path, index, item)\` | 替换指定索引的项 |
| \`reorderListItem(path, {from, to})\` | 交换两项位置 |

---

## 五、使用 Valibot

Valibot 同样支持 Standard Schema，用法完全相同：

\`\`\`jsx
import * as v from 'valibot';
import { useForm, schemaResolver } from '@mantine/form';

const schema = v.object({
  email: v.pipe(v.string(), v.email('邮箱格式不正确')),
  name: v.pipe(v.string(), v.minLength(2, '姓名至少 2 字符')),
});

const form = useForm({
  mode: 'uncontrolled',
  initialValues: { email: '', name: '' },
  validate: schemaResolver(schema, { sync: true }),
});
\`\`\`

---

## 六、实战：完整注册表单

\`\`\`jsx
import { useState } from 'react';
import {
  TextInput, PasswordInput, Button, Stack, Checkbox,
  Alert, Progress, Box, Text,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod/v4';

// ===== Schema =====
const registerSchema = z
  .object({
    username: z.string()
      .min(2, '至少 2 字符')
      .max(20, '最多 20 字符')
      .regex(/^[a-zA-Z0-9_]+\$/, '只能使用字母、数字、下划线'),
    email: z.email('邮箱格式不正确'),
    password: z.string()
      .min(8, '至少 8 字符')
      .regex(/^(?=.*[a-zA-Z])(?=.*\\d).+\$/, '必须包含字母和数字'),
    confirmPassword: z.string(),
    agree: z.literal(true, '必须同意条款'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '', email: '', password: '', confirmPassword: '', agree: false,
    },
    validate: schemaResolver(registerSchema),
    validateInputOnBlur: true,
    validateInputOnChange: ['username', 'email'],
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise((r) => setTimeout(r, 1500));
      console.log('注册成功', values);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  // 密码强度计算
  const pwd = form.getValues().password;
  const strength = [
    pwd.length >= 8,
    /[a-zA-Z]/.test(pwd) && /\\d/.test(pwd),
    /[^a-zA-Z0-9]/.test(pwd),
    pwd.length >= 12,
  ].filter(Boolean).length * 25;

  if (success) {
    return <Alert color="green" title="注册成功！">欢迎加入！</Alert>;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="用户名" withAsterisk
          key={form.key('username')} {...form.getInputProps('username')} />
        <TextInput label="邮箱" withAsterisk
          key={form.key('email')} {...form.getInputProps('email')} />

        <Box>
          <PasswordInput label="密码" withAsterisk
            key={form.key('password')} {...form.getInputProps('password')} />
          {pwd && (
            <Progress value={strength} size="xs" mt="xs"
              color={strength < 50 ? 'red' : strength < 75 ? 'yellow' : 'green'} />
          )}
        </Box>

        <PasswordInput label="确认密码" withAsterisk
          key={form.key('confirmPassword')} {...form.getInputProps('confirmPassword')} />

        <Checkbox label="我已阅读并同意服务条款"
          key={form.key('agree')} {...form.getInputProps('agree', { type: 'checkbox' })} />

        <Button type="submit" loading={loading} fullWidth mt="md">注册</Button>
      </Stack>
    </form>
  );
}
\`\`\`

---

## 本章小结

- v9 使用 schemaResolver 统一所有 schema 库的验证，基于 Standard Schema 规范
- Zod v4 推荐使用 z.email()、z.literal(true, 'msg') 等新 API
- sync: true 用于同步验证，异步验证不传
- refine 用于单条跨字段规则，superRefine 用于多条规则
- 嵌套字段用点号路径（user.firstName），数组用索引（employees.0.name）
- insertListItem/removeListItem/reorderListItem 管理动态列表
- Checkbox/Switch 记得传 { type: 'checkbox' }

下一章我们学习表单状态管理和高级用法。`,
  },
];
