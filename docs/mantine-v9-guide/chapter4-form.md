# 第四章 Mantine Form 表单验证实战

表单是 Web 应用中最复杂、最容易出错的交互场景之一。一个好的表单方案需要同时解决三个问题：**状态管理**、**验证逻辑** 和 **UI 反馈**。Mantine 通过 `@mantine/form` 包提供了一套轻量但强大的表单解决方案，它与 Mantine 组件天然集成，同时保持了对第三方验证库的开放。

本章将从 `useForm` 的基础用法出发，逐步深入到受控/非受控模式、同步与异步验证、`schemaResolver`、嵌套表单、列表字段、错误处理与最佳实践。

---

## 4.1 为什么选择 @mantine/form

在 React 生态中，表单方案众多：Formik、React Hook Form、TanStack Form、以及各组件库自带的表单方案。`@mantine/form` 的优势在于：

| 优势 | 说明 |
|---|---|
| **与 Mantine 组件深度集成** | `getInputProps` 一行代码即可连接输入框与表单状态 |
| **不依赖 UI 层** | 可以单独使用，也可以配合其他 UI 库 |
| **验证方式灵活** | 支持内联验证函数、schema 验证（Zod/Yup/Valibot） |
| **体积小巧** | 仅约 8 KB（gzip），无额外运行时依赖 |
| **TypeScript 友好** | 类型推断完整，支持嵌套对象和数组 |

> 注意：`@mantine/form` 不依赖 `@mantine/core`。如果你使用其他 UI 库，也可以单独使用它管理表单状态。

---

## 4.2 useForm 基础用法

### 4.2.1 安装

```bash
npm install @mantine/form
```

### 4.2.2 最简单的表单

```jsx
import { useForm } from "@mantine/form";
import { TextInput, Button, Group } from "@mantine/core";

function SimpleForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        withAsterisk
        key={form.key("email")}
        {...form.getInputProps("email")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </form>
  );
}
```

### 4.2.3 关键 API 解释

| API | 作用 |
|---|---|
| `useForm(options)` | 创建表单实例 |
| `form.values` | 当前表单值 |
| `form.setFieldValue(path, value)` | 设置某个字段的值 |
| `form.getInputProps(path)` | 返回 `{ value, onChange, error, onFocus, onBlur }`，可直接解构给输入组件 |
| `form.key(path)` | 生成稳定的 key，用于非受控模式 |
| `form.onSubmit(handler)` | 包装提交事件，自动触发验证 |
| `form.reset()` | 重置为 initialValues |
| `form.errors` | 当前错误信息对象 |

---

## 4.3 受控模式 vs 非受控模式

`@mantine/form` 支持两种工作模式：`controlled`（受控）和 `uncontrolled`（非受控）。

### 4.3.1 非受控模式（推荐）

非受控模式下，表单值由 Mantine 内部管理，只在需要时（如提交、验证）读取。这种模式性能更好，适合大多数场景。

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: { email: "" },
});

// 使用 key + getInputProps 连接输入框
<TextInput key={form.key("email")} {...form.getInputProps("email")} />
```

`key={form.key("email")}` 的作用是在非受控模式下帮助 React 稳定地识别输入框，确保 reset 等行为正常工作。

### 4.3.2 受控模式

受控模式下，输入框的值由 `form.values` 驱动，每次输入都会触发重新渲染。适合需要实时响应输入值的场景。

```jsx
const form = useForm({
  mode: "controlled",
  initialValues: { email: "" },
});

// 直接绑定 value 和 onChange
<TextInput
  value={form.values.email}
  onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
  error={form.errors.email}
/>
```

### 4.3.3 模式对比

| 维度 | 非受控模式 | 受控模式 |
|---|---|---|
| 性能 | 更好，减少不必要的重渲染 | 每次输入都触发渲染 |
| 代码量 | 较少 | 较多 |
| 实时响应 | 需要手动读取 | 天然支持 |
| 适用场景 | 大多数表单 | 需要即时计算/联动的表单 |

在 Mantine v9 的文档中，**非受控模式被作为默认推荐**。

---

## 4.4 同步验证

同步验证是最常见的验证形式。`@mantine/form` 提供了多种配置验证规则的方式。

### 4.4.1 对象形式验证

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: {
    email: "",
    password: "",
    age: 18,
  },
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
    password: (value) =>
      value.length >= 6 ? null : "密码至少需要 6 个字符",
    age: (value) => (value >= 18 ? null : "年龄必须大于等于 18"),
  },
});
```

### 4.4.2 返回错误对象

对于复杂字段，验证函数可以返回一个对象，用于分别提示多个错误：

```jsx
validate: {
  password: (value) => {
    const errors = [];
    if (value.length < 6) errors.push("密码长度至少 6 位");
    if (!/\d/.test(value)) errors.push("密码必须包含数字");
    if (!/[A-Z]/.test(value)) errors.push("密码必须包含大写字母");

    return errors.length > 0 ? errors.join("；") : null;
  },
}
```

### 4.4.3 使用 validateInputOnBlur

默认情况下，验证只在提交时触发。你可以配置为失去焦点时验证：

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: { email: "" },
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
  },
  validateInputOnBlur: true,
});
```

还可以只对特定字段启用：

```jsx
validateInputOnBlur: ["email", "password"],
```

### 4.4.4 使用 validateInputOnChange

如果你希望输入时实时验证，可以启用 `validateInputOnChange`：

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: { email: "" },
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
  },
  validateInputOnChange: true,
});
```

> 注意：实时验证可能带来频繁的错误提示，建议只在必要场景使用。

---

## 4.5 使用 schemaResolver 进行 schema 验证

当表单字段较多、验证规则复杂时，使用 schema 验证库（如 Zod）会更加清晰可维护。`@mantine/form` 通过 `schemaResolver` 支持 Zod、Yup、Valibot 等库。

### 4.5.1 配合 Zod

```bash
npm install zod
```

```jsx
import { useForm } from "@mantine/form";
import { zodResolver } from "@mantine/form";
import { z } from "zod";
import { TextInput, Button, Group, PasswordInput } from "@mantine/core";

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少需要 6 个字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

function ZodForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        label="邮箱"
        placeholder="your@email.com"
        withAsterisk
        key={form.key("email")}
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="密码"
        placeholder="请输入密码"
        mt="md"
        withAsterisk
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <PasswordInput
        label="确认密码"
        placeholder="请再次输入密码"
        mt="md"
        withAsterisk
        key={form.key("confirmPassword")}
        {...form.getInputProps("confirmPassword")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">注册</Button>
      </Group>
    </form>
  );
}
```

### 4.5.2 schemaResolver 的优势

| 优势 | 说明 |
|---|---|
| **可复用** | schema 可以单独抽离，前后端共享 |
| **可组合** | 可以定义基础 schema，通过 `merge`、`pick`、`omit` 组合 |
| **类型安全** | Zod schema 可推断出 TypeScript 类型 |
| **错误信息集中** | 所有验证规则在一个地方管理 |

### 4.5.3 自定义错误映射

Zod 的错误信息默认是英文，可以通过参数自定义：

```jsx
const schema = z.object({
  email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少需要 6 个字符")
    .regex(/\d/, "密码必须包含数字"),
});
```

---

## 4.6 嵌套表单值

实际业务中的表单往往不是扁平的，而是包含嵌套对象。`@mantine/form` 支持通过点号路径访问嵌套字段。

### 4.6.1 嵌套对象

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: {
    user: {
      firstName: "",
      lastName: "",
    },
    address: {
      city: "",
      street: "",
    },
  },
  validate: {
    "user.firstName": (value) =>
      value.length > 0 ? null : "名字不能为空",
    "address.city": (value) =>
      value.length > 0 ? null : "城市不能为空",
  },
});

// 绑定嵌套字段
<TextInput
  label="名字"
  key={form.key("user.firstName")}
  {...form.getInputProps("user.firstName")}
/>
```

### 4.6.2 嵌套对象验证

```jsx
validate: {
  "user.firstName": (value) =>
    value.length > 0 ? null : "名字不能为空",
  "user.lastName": (value) =>
    value.length > 0 ? null : "姓氏不能为空",
}
```

### 4.6.3 使用 Zod 处理嵌套

```jsx
const schema = z.object({
  user: z.object({
    firstName: z.string().min(1, "名字不能为空"),
    lastName: z.string().min(1, "姓氏不能为空"),
  }),
  address: z.object({
    city: z.string().min(1, "城市不能为空"),
    street: z.string().min(1, "街道不能为空"),
  }),
});
```

---

## 4.7 列表字段（数组表单）

列表字段是表单中的常见需求，例如：添加多个标签、多个地址、多个联系人。`@mantine/form` 提供了专门的方法管理数组字段。

### 4.7.1 基础用法

```jsx
import { useForm } from "@mantine/form";
import { TextInput, Button, Group, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

function TagsForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      tags: ["React", "Mantine"],
    },
  });

  const addTag = () => form.insertListItem("tags", "");
  const removeTag = (index) => form.removeListItem("tags", index);

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      {form.values.tags.map((tag, index) => (
        <Group key={`tag-${index}`} mt="xs">
          <TextInput
            placeholder="输入标签"
            style={{ flex: 1 }}
            {...form.getInputProps(`tags.${index}`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => removeTag(index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}

      <Group mt="md">
        <Button variant="light" onClick={addTag}>
          添加标签
        </Button>
        <Button type="submit">提交</Button>
      </Group>
    </form>
  );
}
```

### 4.7.2 列表字段相关方法

| 方法 | 作用 |
|---|---|
| `form.insertListItem(path, item, index?)` | 在指定位置插入元素 |
| `form.removeListItem(path, index)` | 移除指定位置的元素 |
| `form.reorderListItem(path, { from, to })` | 重新排序元素 |
| `form.setFieldValue(path, value)` | 设置某个元素的值 |

### 4.7.3 对象数组

列表字段中的元素也可以是对象：

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: {
    users: [
      { name: "张三", email: "zhangsan@example.com" },
      { name: "李四", email: "lisi@example.com" },
    ],
  },
});

// 绑定对象数组字段
<TextInput
  label="姓名"
  {...form.getInputProps(`users.${index}.name`)}
/>
<TextInput
  label="邮箱"
  {...form.getInputProps(`users.${index}.email`)}
/>
```

---

## 4.8 异步验证

有时验证需要依赖服务端，例如检查用户名是否已存在。`@mantine/form` 支持异步验证函数。

### 4.8.1 异步字段验证

```jsx
const form = useForm({
  mode: "uncontrolled",
  initialValues: { username: "" },
  validate: {
    username: async (value) => {
      if (value.length < 3) return "用户名至少 3 个字符";

      // 模拟 API 请求
      const exists = await checkUsernameExists(value);
      return exists ? "用户名已被占用" : null;
    },
  },
});
```

### 4.8.2 异步验证的注意事项

- 异步验证会在提交时自动等待；
- 如果用户在验证过程中继续输入，可能会产生竞争条件，建议配合防抖；
- 异步错误会显示在对应输入框的错误提示中。

> 注意：项目经验表明，异步验证如果与 `form.errors` 直接绑定到输入框的 `error` prop，可能会因为状态更新时机导致 UI 闪烁。建议在异步验证逻辑中使用同步验证函数匹配 RuleHints，确保错误显示 timing 一致。

---

## 4.9 错误处理与提交状态

### 4.9.1 显示表单级错误

除了字段级错误，有时还需要显示表单级错误：

```jsx
<form onSubmit={form.onSubmit((values) => console.log(values))}>
  {/* 字段 */}
  {form.errors.submit && (
    <Text c="red" size="sm" mt="sm">
      {form.errors.submit}
    </Text>
  )}
</form>
```

### 4.9.2 提交时设置错误

```jsx
<form
  onSubmit={form.onSubmit(async (values) => {
    try {
      await api.register(values);
    } catch (error) {
      form.setErrors({ submit: error.message });
    }
  })}
>
  {/* ... */}
</form>
```

### 4.9.3 使用 isValid 与 isDirty

```jsx
const { isValid, isDirty } = form;

// isValid：当前表单是否通过验证
// isDirty：表单值是否与 initialValues 不同
```

---

## 4.10 表单最佳实践

### 4.10.1 始终使用非受控模式，除非有特殊需求

非受控模式性能更好，代码更简洁。只有需要实时响应输入值时才使用受控模式。

### 4.10.2 复杂验证优先使用 schemaResolver

当字段超过 5 个，或验证规则涉及多个字段关联时，建议使用 Zod 等 schema 库。

### 4.10.3 将表单逻辑抽离为自定义 Hook

对于复杂表单，建议将 `useForm` 配置、提交逻辑抽离成自定义 Hook：

```jsx
function useLoginForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
      password: (value) =>
        value.length >= 6 ? null : "密码至少需要 6 个字符",
    },
  });

  const handleSubmit = async (values) => {
    await api.login(values);
  };

  return { form, handleSubmit };
}
```

### 4.10.4 不要忘记 key

在非受控模式下，`key={form.key("fieldName")}` 是推荐写法，它确保 reset 后输入框能正确同步。

---

## 4.11 本章小结

本章系统讲解了 `@mantine/form` 的使用：

1. **`useForm`** 是表单状态管理的核心；
2. **非受控模式** 是默认推荐，性能更好；
3. **同步验证** 可以通过对象形式或返回错误对象实现；
4. **`schemaResolver`** 支持 Zod/Yup/Valibot，适合复杂验证；
5. **嵌套表单值** 和 **列表字段** 通过点号路径访问；
6. **异步验证** 支持服务端校验，但需注意竞争条件；
7. **错误处理** 包括字段级错误、表单级错误和提交状态。

下一章将结合 Theme 与 Form，完成一个企业级用户注册页面的综合实战。
