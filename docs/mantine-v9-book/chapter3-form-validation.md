# 第三章 · Mantine Form 表单验证

> 表单是 Web 应用中最常见、最复杂的交互场景之一。它涉及状态管理、用户输入校验、错误提示、提交处理、异步流程等多个层面。Mantine 通过 `@mantine/form` 提供了一套完整、灵活、现代化的表单解决方案，让表单开发变得简单而可靠。

本章将从 `@mantine/form` 的核心概念出发，逐步深入到内置验证、Schema 验证、异步验证、嵌套表单、动态表单、跨组件共享、最佳实践等各个方面，帮助你全面掌握 Mantine v9 的表单验证体系。

---

## 3.1 @mantine/form 概述

### 3.1.1 什么是 @mantine/form

`@mantine/form` 是 Mantine 官方提供的表单管理包，其核心是 `useForm` hook。它负责：

- **表单状态管理**：集中管理所有字段的值、错误、交互状态
- **字段验证**：支持同步验证、异步验证和 Schema 验证
- **提交处理**：管理提交状态、提供提交回调
- **与 Mantine 组件无缝集成**：通过 `getInputProps` 一键绑定

### 3.1.2 核心特性

- **零额外依赖**：除了可选的 Schema 验证库（如 Zod、Valibot），`@mantine/form` 自身不依赖任何第三方库
- **与 @mantine/core 无缝结合**：通过 `getInputProps` 将表单状态自动绑定到 Mantine 输入组件
- **支持复杂结构**：原生支持嵌套对象、数组的字段路径（Property Paths）操作
- **完整的状态体系**：内置 `touched`、`dirty`、`submitting`、`validating` 等状态
- **Schema 验证统一**：v9 开始，所有基于 Schema 的验证统一为 `schemaResolver`，遵循 Standard Schema 规范

### 3.1.3 安装

```bash
npm install @mantine/form

# 如果使用 Schema 验证，还需要安装验证库
npm install zod       # 推荐：Zod 验证库
npm install valibot   # 或者：Valibot（更轻量）
```

---

## 3.2 useForm 基础用法

### 3.2.1 最简单的表单

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box } from '@mantine/core';

function SimpleForm() {
  // 创建表单实例
  const form = useForm({
    // 初始值
    initialValues: {
      name: '',
      email: '',
    },

    // 验证函数
    validate: {
      name: (value) => (value.trim().length < 2 ? '姓名至少需要 2 个字符' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '请输入有效的邮箱地址'),
    },
  });

  // 提交处理
  const handleSubmit = (values) => {
    console.log('表单提交：', values);
    // values = { name: '...', email: '...' }
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="姓名"
        placeholder="请输入姓名"
        // getInputProps 自动绑定 value、onChange、error
        {...form.getInputProps('name')}
      />

      <TextInput
        label="邮箱"
        placeholder="请输入邮箱"
        {...form.getInputProps('email')}
        mt="md"
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </Box>
  );
}
```

### 3.2.2 useForm 配置项详解

`useForm` 接受一个配置对象，以下是核心配置项：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `initialValues` | `Record<string, any>` | 表单的初始值（必填） |
| `validate` | `Record<string, function>` | 字段级验证函数对象 |
| `validateInputOnBlur` | `boolean \| string[]` | 在失焦时触发验证 |
| `validateInputOnChange` | `boolean \| string[]` | 在输入变化时触发验证 |
| `transformValues` | `function` | 提交前转换值的函数 |
| `onValuesChange` | `function` | 表单值变化时的回调 |

### 3.2.3 验证时机控制

Mantine 提供了灵活的验证时机控制：

```tsx
const form = useForm({
  initialValues: { name: '', email: '' },

  validate: {
    name: (value) => (value.length < 2 ? '太短了' : null),
    email: (value) => (/^\S+@\S+$/.test(value) ? null : '无效的邮箱'),
  },

  // 选项 1：在失焦时验证（推荐用于大多数场景）
  validateInputOnBlur: true,

  // 选项 2：在输入变化时立即验证（适合实时反馈）
  // validateInputOnChange: true,

  // 选项 3：只对特定字段在变化时验证
  // validateInputOnChange: ['email'],

  // 选项 4：只对特定字段在失焦时验证
  // validateInputOnBlur: ['name'],
});
```

---

## 3.3 内置验证函数

### 3.3.1 基础验证

Mantine 的验证函数遵循一个简单的约定：**返回 `null` 表示验证通过，返回字符串表示错误信息**。

```tsx
const form = useForm({
  initialValues: {
    username: '',
    age: '',
    website: '',
    password: '',
    confirmPassword: '',
  },

  validate: {
    // 必填验证
    username: (value) => (!value ? '用户名不能为空' : null),

    // 长度验证
    username: (value) =>
      value.length < 3
        ? '用户名至少需要 3 个字符'
        : value.length > 20
        ? '用户名不能超过 20 个字符'
        : null,

    // 数字范围验证
    age: (value) => {
      const num = Number(value);
      if (isNaN(num)) return '请输入有效数字';
      if (num < 0) return '年龄不能为负数';
      if (num > 150) return '请输入有效的年龄';
      return null;
    },

    // 正则验证
    website: (value) =>
      /^https?:\/\/.+/.test(value) ? null : '请输入有效的网址（以 http:// 或 https:// 开头）',

    // 密码强度验证
    password: (value) => {
      if (value.length < 8) return '密码至少需要 8 个字符';
      if (!/[A-Z]/.test(value)) return '密码需要包含大写字母';
      if (!/[a-z]/.test(value)) return '密码需要包含小写字母';
      if (!/[0-9]/.test(value)) return '密码需要包含数字';
      return null;
    },
  },
});
```

### 3.3.2 跨字段验证

有时候你需要根据其他字段的值来验证当前字段。`validate` 函数的第二个参数就是整个表单的 `values` 对象：

```tsx
const form = useForm({
  initialValues: {
    password: '',
    confirmPassword: '',
  },

  validate: {
    // 使用 values 参数访问其他字段
    confirmPassword: (value, values) =>
      value !== values.password ? '两次输入的密码不一致' : null,
  },
});
```

### 3.3.3 验证规则函数

Mantine 提供了 `isNotEmpty`、`isEmail`、`isInRange`、`hasLength` 等验证辅助函数，你可以直接使用它们：

```tsx
import { useForm, isNotEmpty, isEmail, isInRange, hasLength } from '@mantine/form';

const form = useForm({
  initialValues: {
    name: '',
    email: '',
    age: '',
    bio: '',
  },

  validate: {
    // isNotEmpty：检查值是否非空
    name: isNotEmpty('姓名不能为空'),

    // isEmail：检查邮箱格式
    email: isEmail('请输入有效的邮箱地址'),

    // isInRange：检查数字是否在范围内
    age: isInRange({ min: 0, max: 150 }, '请输入 0-150 之间的年龄'),

    // hasLength：检查字符串长度
    bio: hasLength({ min: 10, max: 500 }, '简介需要 10-500 个字符'),
  },
});
```

---

## 3.4 Schema 验证（Zod 集成）

### 3.4.1 为什么使用 Schema 验证

对于复杂表单，手写验证函数可能导致代码重复、维护困难。Schema 验证库（如 Zod）提供了：

- **声明式验证**：用简洁的 DSL 描述验证规则
- **类型推断**：从 Schema 自动推断 TypeScript 类型
- **复杂规则**：轻松处理嵌套对象、数组、条件验证等
- **可复用**：Schema 可以在前后端共享

### 3.4.2 Zod 基础集成

Mantine v9 通过 `zodResolver` 函数将 Zod Schema 与 `useForm` 连接：

```tsx
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { TextInput, NumberInput, Button, Box, Group } from '@mantine/core';

// 定义 Zod Schema
const userSchema = z.object({
  name: z
    .string()
    .min(2, '姓名至少需要 2 个字符')
    .max(50, '姓名不能超过 50 个字符'),

  email: z
    .string()
    .email('请输入有效的邮箱地址'),

  age: z
    .number()
    .min(0, '年龄不能为负数')
    .max(150, '请输入有效的年龄'),

  website: z
    .string()
    .url('请输入有效的网址')
    .optional()
    .or(z.literal('')),

  role: z
    .enum(['admin', 'editor', 'viewer'], {
      errorMap: () => ({ message: '请选择有效的角色' }),
    }),
});

function ZodForm() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      age: 0,
      website: '',
      role: 'viewer',
    },

    // 使用 zodResolver 连接 Zod Schema
    validate: zodResolver(userSchema),
  });

  return (
    <Box component="form" onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        label="姓名"
        placeholder="请输入姓名"
        {...form.getInputProps('name')}
      />

      <TextInput
        label="邮箱"
        placeholder="请输入邮箱"
        {...form.getInputProps('email')}
        mt="md"
      />

      <NumberInput
        label="年龄"
        placeholder="请输入年龄"
        {...form.getInputProps('age')}
        mt="md"
      />

      <TextInput
        label="网站（选填）"
        placeholder="请输入网址"
        {...form.getInputProps('website')}
        mt="md"
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </Box>
  );
}
```

### 3.4.3 Zod 高级验证

```tsx
import { z } from 'zod';

const advancedSchema = z.object({
  // 字符串转换（自动 trim）
  username: z.string().trim().min(3).max(20),

  // 密码 + 确认密码匹配
  password: z
    .string()
    .min(8, '密码至少需要 8 个字符')
    .regex(/[A-Z]/, '密码需要包含大写字母')
    .regex(/[a-z]/, '密码需要包含小写字母')
    .regex(/[0-9]/, '密码需要包含数字'),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'], // 错误指向 confirmPassword 字段
});

// 条件验证
const conditionalSchema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string().optional(),
}).refine(
  (data) => {
    // 如果 hasCompany 为 true，则 companyName 必填
    if (data.hasCompany && !data.companyName) {
      return false;
    }
    return true;
  },
  {
    message: '公司名称不能为空',
    path: ['companyName'],
  }
);
```

### 3.4.4 从 Schema 推断 TypeScript 类型

```typescript
import { z } from 'zod';

// 定义 Schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

// 推断 TypeScript 类型
type User = z.infer<typeof userSchema>;
// type User = { name: string; email: string; age: number }

// 在 useForm 中使用
const form = useForm<User>({
  initialValues: {
    name: '',
    email: '',
    age: 0,
  },
  validate: zodResolver(userSchema),
});

// form.values 的类型自动推断为 User
```

---

## 3.5 嵌套表单与数组字段

### 3.5.1 嵌套对象

Mantine 的 `useForm` 支持通过点号路径（dot notation）访问嵌套字段：

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group } from '@mantine/core';

function NestedForm() {
  const form = useForm({
    initialValues: {
      user: {
        name: '',
        email: '',
      },
      address: {
        street: '',
        city: '',
        zipCode: '',
      },
    },

    validate: {
      // 使用点号路径验证嵌套字段
      'user.name': (value) => (value.length < 2 ? '姓名至少需要 2 个字符' : null),
      'user.email': (value) => (/^\S+@\S+$/.test(value) ? null : '无效的邮箱'),
      'address.street': (value) => (!value ? '街道地址不能为空' : null),
      'address.city': (value) => (!value ? '城市不能为空' : null),
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
      <TextInput
        label="姓名"
        {...form.getInputProps('user.name')}
      />
      <TextInput
        label="邮箱"
        {...form.getInputProps('user.email')}
        mt="md"
      />
      <TextInput
        label="街道"
        {...form.getInputProps('address.street')}
        mt="md"
      />
      <TextInput
        label="城市"
        {...form.getInputProps('address.city')}
        mt="md"
      />
      <TextInput
        label="邮编"
        {...form.getInputProps('address.zipCode')}
        mt="md"
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </Box>
  );
}
```

### 3.5.2 数组字段（动态表单）

Mantine 提供了 `form.insertListItem`、`form.removeListItem`、`form.reorderListItem` 等方法来操作数组字段：

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box, ActionIcon, Text } from '@mantine/core';

function DynamicForm() {
  const form = useForm({
    initialValues: {
      // 用户列表（数组）
      members: [
        { name: '', email: '' },
      ],
    },

    validate: {
      // 验证数组中的每个元素
      'members.*.name': (value) => (!value ? '姓名不能为空' : null),
      'members.*.email': (value) => (/^\S+@\S+$/.test(value) ? null : '无效的邮箱'),
    },
  });

  // 动态添加成员
  const addMember = () => {
    form.insertListItem('members', { name: '', email: '' });
  };

  // 动态删除成员
  const removeMember = (index) => {
    form.removeListItem('members', index);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
      <Text fw={600} mb="md">团队成员</Text>

      {form.values.members.map((member, index) => (
        <Group key={index} mb="md" align="flex-start">
          <Box style={{ flex: 1 }}>
            <TextInput
              label={`成员 ${index + 1} 姓名`}
              placeholder="请输入姓名"
              {...form.getInputProps(`members.${index}.name`)}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <TextInput
              label={`成员 ${index + 1} 邮箱`}
              placeholder="请输入邮箱"
              {...form.getInputProps(`members.${index}.email`)}
            />
          </Box>
          <ActionIcon
            color="red"
            onClick={() => removeMember(index)}
            disabled={form.values.members.length <= 1}
            mt="xl"
          >
            ✕
          </ActionIcon>
        </Group>
      ))}

      <Group>
        <Button variant="outline" onClick={addMember}>
          添加成员
        </Button>
        <Button type="submit">提交</Button>
      </Group>
    </Box>
  );
}
```

### 3.5.3 数组字段的 Zod 验证

```tsx
import { z } from 'zod';
import { zodResolver } from '@mantine/form';

const teamSchema = z.object({
  members: z.array(
    z.object({
      name: z.string().min(1, '姓名不能为空'),
      email: z.string().email('无效的邮箱'),
    })
  ).min(1, '至少需要一个团队成员'),
});

const form = useForm({
  initialValues: {
    members: [{ name: '', email: '' }],
  },
  validate: zodResolver(teamSchema),
});
```

---

## 3.6 异步验证

### 3.6.1 字段级异步验证

异步验证最常用于检查用户名或邮箱是否已存在：

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group } from '@mantine/core';

// 模拟异步检查用户名是否已存在
async function checkUsernameExists(username) {
  // 模拟 API 请求
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 假设 'admin' 和 'user' 已被占用
  return ['admin', 'user'].includes(username.toLowerCase());
}

function AsyncValidationForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
    },

    validate: {
      // 异步验证函数返回 Promise
      username: async (value) => {
        if (!value) return '用户名不能为空';
        if (value.length < 3) return '用户名至少需要 3 个字符';

        const exists = await checkUsernameExists(value);
        if (exists) return '该用户名已被占用';

        return null;
      },

      email: (value) => (/^\S+@\S+$/.test(value) ? null : '无效的邮箱'),
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
      <TextInput
        label="用户名"
        placeholder="请输入用户名"
        // 显示异步验证状态
        rightSection={form.validating ? '...' : null}
        {...form.getInputProps('username')}
      />

      <TextInput
        label="邮箱"
        placeholder="请输入邮箱"
        {...form.getInputProps('email')}
        mt="md"
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit" loading={form.submitting}>
          提交
        </Button>
      </Group>
    </Box>
  );
}
```

### 3.6.2 Zod 的异步验证

Zod 也支持异步验证（通过 `.refine()` 的异步版本）：

```tsx
import { z } from 'zod';

const asyncSchema = z.object({
  username: z.string().min(3).refine(
    async (value) => {
      const exists = await checkUsernameExists(value);
      return !exists;
    },
    { message: '该用户名已被占用' }
  ),
  email: z.string().email(),
});
```

---

## 3.7 表单状态管理

### 3.7.1 核心状态

`useForm` 返回的表单对象包含以下核心状态：

| 状态 | 类型 | 说明 |
|------|------|------|
| `values` | `object` | 当前表单值 |
| `errors` | `Record<string, string>` | 验证错误信息 |
| `isValid` | `boolean` | 表单是否通过验证 |
| `isDirty` | `boolean` | 表单是否有修改 |
| `isTouched` | `function` | 检查字段是否被触碰过 |
| `submitting` | `boolean` | 是否正在提交 |
| `validating` | `boolean` | 是否正在异步验证 |

### 3.7.2 使用表单状态

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Text, Group, Box } from '@mantine/core';

function StatusAwareForm() {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validate: {
      name: (value) => (value.length < 2 ? '姓名太短' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '无效邮箱'),
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
      <TextInput label="姓名" {...form.getInputProps('name')} />
      <TextInput label="邮箱" {...form.getInputProps('email')} mt="md" />

      {/* 显示表单状态 */}
      <Group mt="md">
        <Text size="sm" c="dimmed">
          已修改：{form.isDirty() ? '是' : '否'}
        </Text>
        <Text size="sm" c="dimmed">
          已验证通过：{form.isValid() ? '是' : '否'}
        </Text>
        <Text size="sm" c={form.isValid() ? 'green' : 'red'}>
          {form.isValid() ? '✓ 表单有效' : '✗ 表单有误'}
        </Text>
      </Group>

      <Group justify="flex-end" mt="md">
        {/* 重置表单 */}
        <Button variant="outline" onClick={() => form.reset()}>
          重置
        </Button>
        <Button
          type="submit"
          disabled={!form.isValid()}
          loading={form.submitting}
        >
          提交
        </Button>
      </Group>
    </Box>
  );
}
```

### 3.7.3 编程式验证与操作

```tsx
// 手动触发验证
form.validate(); // 验证所有字段
form.validateField('name'); // 验证单个字段

// 手动设置字段值
form.setValues({ name: 'John', email: 'john@example.com' });
form.setFieldValue('name', 'Jane');

// 手动设置错误
form.setErrors({ name: '自定义错误信息' });
form.setFieldError('email', '自定义邮箱错误');

// 清除错误
form.clearErrors();
form.clearFieldError('name');

// 重置表单
form.reset(); // 重置为初始值
form.resetDirty(); // 清除 dirty 状态
```

---

## 3.8 跨组件共享表单

### 3.8.1 使用 React Context 共享

在大型表单中，你可能需要将表单拆分为多个组件。通过 React Context 可以共享表单实例：

```tsx
// form-context.tsx
import { createContext, useContext } from 'react';
import { UseFormReturnType } from '@mantine/form';

// 创建表单上下文
const FormContext = createContext(null);

// Provider 组件
export function FormProvider({ form, children }) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

// 自定义 Hook 获取表单实例
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext 必须在 FormProvider 内部使用');
  }
  return context;
}
```

```tsx
// 使用示例
import { useForm } from '@mantine/form';
import { FormProvider } from './form-context';
import { PersonalInfoSection } from './PersonalInfoSection';
import { AddressSection } from './AddressSection';
import { Button, Box } from '@mantine/core';

function MultiStepForm() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      street: '',
      city: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? '姓名太短' : null),
      email: (value) => (/^\S@\S/.test(value) ? null : '无效邮箱'),
      street: (value) => (!value ? '街道不能为空' : null),
      city: (value) => (!value ? '城市不能为空' : null),
    },
  });

  return (
    <FormProvider form={form}>
      <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
        <PersonalInfoSection />
        <AddressSection />
        <Button type="submit" mt="md">提交</Button>
      </Box>
    </FormProvider>
  );
}
```

```tsx
// PersonalInfoSection.tsx
import { TextInput } from '@mantine/core';
import { useFormContext } from './form-context';

export function PersonalInfoSection() {
  const form = useFormContext();

  return (
    <>
      <TextInput label="姓名" {...form.getInputProps('name')} />
      <TextInput label="邮箱" {...form.getInputProps('email')} mt="md" />
    </>
  );
}
```

### 3.8.2 使用 useFormContext（Mantine 内置）

Mantine v9 也提供了内置的 `FormProvider` 和 `useFormContext`：

```tsx
import { useForm, FormProvider } from '@mantine/form';
import { TextInput, Button, Box } from '@mantine/core';

function ChildComponent() {
  // 使用 Mantine 内置的 useFormContext
  const form = useFormContext();

  return (
    <TextInput label="姓名" {...form.getInputProps('name')} />
  );
}

function ParentComponent() {
  const form = useForm({
    initialValues: { name: '' },
  });

  return (
    <FormProvider form={form}>
      <Box component="form" onSubmit={form.onSubmit((v) => console.log(v))}>
        <ChildComponent />
        <Button type="submit" mt="md">提交</Button>
      </Box>
    </FormProvider>
  );
}
```

---

## 3.9 transformValues —— 提交前转换

`transformValues` 允许你在提交前对表单值进行转换，这在需要格式化数据时非常有用：

```tsx
const form = useForm({
  initialValues: {
    name: '',
    birthDate: '',
    tags: '',
  },

  // 提交前转换值
  transformValues: (values) => ({
    ...values,
    // 去除首尾空格
    name: values.name.trim(),
    // 字符串转日期对象
    birthDate: new Date(values.birthDate),
    // 逗号分隔的字符串转数组
    tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  }),
});
```

---

## 3.10 表单清理与脏状态管理

### 3.10.1 重置表单

```tsx
const form = useForm({
  initialValues: { name: '', email: '' },
});

// 完全重置：恢复初始值，清除错误和 dirty 状态
form.reset();

// 重置 dirty 状态（保留当前值）
form.resetDirty();

// 重置为指定值
form.setValues({ name: 'John', email: 'john@example.com' });
form.resetDirty({ name: 'John', email: 'john@example.com' });
```

### 3.10.2 脏状态检测

```tsx
function DirtyForm() {
  const form = useForm({
    initialValues: { name: '', email: '' },
  });

  // 检查整体是否被修改
  const isDirty = form.isDirty();

  // 检查特定字段是否被修改
  const isNameDirty = form.isDirty('name');

  return (
    <>
      <TextInput {...form.getInputProps('name')} />
      {isNameDirty && <Text size="xs" c="blue">姓名字段已修改</Text>}
    </>
  );
}
```

---

## 3.11 表单最佳实践

### 3.11.1 验证时机选择

- **注册/登录表单**：使用 `validateInputOnBlur: true`，在用户离开字段时验证，避免过早打断用户
- **实时搜索/筛选**：使用 `validateInputOnChange: true`，提供即时反馈
- **复杂表单**：使用 `validateInputOnBlur: true`，在提交时做最终验证，避免频繁的异步请求

### 3.11.2 错误信息设计

- 错误信息要具体、可操作（"密码至少需要 8 个字符" 优于 "密码无效"）
- 不要泄露敏感信息（验证失败时不要说出"用户名不存在" vs "密码错误"的区别）
- 使用一致的错误信息语气和格式

### 3.11.3 性能优化

- 避免在 `validate` 函数中执行昂贵的计算，考虑使用防抖（debounce）
- 对于大型表单，将表单拆分为多个小组件，使用 React Context 共享表单实例
- 使用 `transformValues` 做数据转换，而不是在提交函数中手动处理

### 3.11.4 可访问性

- 始终为输入框添加 `label` 或 `aria-label`
- 错误信息应该与对应的输入框关联（Mantine 自动处理）
- 使用 `aria-describedby` 关联帮助文本和错误信息
- 提交按钮在表单无效时应该 `disabled`，并给出视觉提示

### 3.11.5 完整的表单模板

```tsx
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import {
  TextInput,
  Button,
  Group,
  Box,
  Text,
  Alert,
  PasswordInput,
  Anchor,
} from '@mantine/core';

// 定义 Schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要 3 个字符')
    .max(20, '用户名不能超过 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

  email: z.string().email('请输入有效的邮箱地址'),

  password: z
    .string()
    .min(8, '密码至少需要 8 个字符')
    .regex(/[A-Z]/, '需要包含大写字母')
    .regex(/[a-z]/, '需要包含小写字母')
    .regex(/[0-9]/, '需要包含数字'),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

function RegisterForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    validate: zodResolver(registerSchema),
    validateInputOnBlur: true,
    validateInputOnChange: ['confirmPassword'],
  });

  const handleSubmit = async (values) => {
    try {
      // 模拟 API 调用
      console.log('注册数据：', values);
      // await api.register(values);
      alert('注册成功！');
      form.reset();
    } catch (error) {
      form.setErrors({
        email: '该邮箱已被注册',
      });
    }
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Text size="lg" fw={700} mb="md">
        创建账户
      </Text>

      <TextInput
        label="用户名"
        placeholder="请输入用户名"
        description="3-20 个字符，只能包含字母、数字和下划线"
        {...form.getInputProps('username')}
      />

      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
        mt="md"
      />

      <PasswordInput
        label="密码"
        placeholder="请输入密码"
        description="至少 8 个字符，包含大小写字母和数字"
        {...form.getInputProps('password')}
        mt="md"
      />

      <PasswordInput
        label="确认密码"
        placeholder="请再次输入密码"
        {...form.getInputProps('confirmPassword')}
        mt="md"
      />

      {/* 表单状态提示 */}
      {Object.keys(form.errors).length > 0 && (
        <Alert color="red" mt="md" title="表单验证失败">
          请检查并修正上方标记的错误字段。
        </Alert>
      )}

      <Group justify="space-between" mt="xl">
        <Text size="sm" c="dimmed">
          已有账户？
          <Anchor size="sm" component="button" type="button">
            立即登录
          </Anchor>
        </Text>
        <Button
          type="submit"
          loading={form.submitting}
          disabled={!form.isValid()}
        >
          注册
        </Button>
      </Group>
    </Box>
  );
}
```

---

## 3.12 本章小结

本章我们全面深入地学习了 Mantine v9 的表单验证体系：

1. **@mantine/form 概述**：核心特性、安装方式、与 Mantine 组件的无缝集成
2. **useForm 基础**：配置项、验证时机控制、`getInputProps` 自动绑定
3. **内置验证**：验证函数约定、基础验证、跨字段验证、验证辅助函数
4. **Schema 验证（Zod）**：`zodResolver` 集成、高级验证、类型推断
5. **嵌套表单**：点号路径访问嵌套字段、数组字段动态操作
6. **异步验证**：字段级异步验证、Zod 异步验证、loading 状态展示
7. **表单状态管理**：核心状态（values、errors、isValid、isDirty 等）、编程式操作
8. **跨组件共享**：React Context 模式、Mantine 内置 `FormProvider`
9. **最佳实践**：验证时机选择、错误信息设计、性能优化、可访问性、完整模板

至此，你已经掌握了 Mantine v9 的三大核心系统：设计理念、Theme 系统和 Form 验证。这些知识将帮助你构建出外观精美、交互流畅、可访问性优秀的现代化 React 应用。