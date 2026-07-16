// =============================================================
// Mantine 教程 —— 第 3 批：Form + Zod 深度集成（重点章节）
// -------------------------------------------------------------
// 覆盖：zod schema 入门、form + zod 校验、复杂表单实战、
//       异步校验、表单联动、Form 与 Modal 配合、表单提交模式。
// 章节对象格式：{ id, group, icon, title, content, code }
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：Zod 入门
  // -------------------------------------------------------------
  {
    id: "m-zod-intro",
    group: "Form + Zod",
    icon: "🛡️",
    title: "Zod Schema 入门",
    content: `# Zod Schema 入门

在讲 \`@mantine/form\` + \`zod\` 之前，先快速过一遍 zod 的基础用法。

## 什么是 zod

\`zod\` 是 TypeScript 优先的 schema 声明与校验库。你声明一个"期望的数据形状"，zod 帮你：

1. **运行时校验**：检查数据是否符合 schema
2. **类型推导**：自动从 schema 推出 TS 类型
3. **错误信息**：失败时返回结构化的错误

## 安装

\`\`\`bash
npm install zod
\`\`\`

## 基本类型

\`\`\`js
import { z } from "zod";

// 基本标量
const str = z.string(); // 字符串
const num = z.number(); // 数字
const bool = z.boolean(); // 布尔
const date = z.date(); // Date 对象

// 字符串校验链
const email = z.string().email("邮箱格式不正确");
const password = z.string().min(8, "至少 8 位").max(64, "最多 64 位");
const username = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "只能含字母数字下划线");

// 数字校验
const age = z.number().int().min(0).max(150);
const price = z.number().positive().multipleOf(0.01);

// 可选 / 默认 / 可空
const nickname = z.string().optional(); // string | undefined
const bio = z.string().default("无简介"); // string
const avatar = z.string().nullable(); // string | null
\`\`\`

## 对象 schema

\`\`\`js
const userSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位"),
  email: z.string().email("邮箱格式错误"),
  age: z.number().int().min(18, "必须成年"),
});

// 类型自动推导
type User = z.infer<typeof userSchema>;
// 等价于
// { username: string; email: string; age: number }
\`\`\`

## parse vs safeParse

\`\`\`js
const result = userSchema.safeParse({
  username: "ab",
  email: "not-email",
  age: 16,
});

if (!result.success) {
  console.log(result.error.issues);
  // [
  //   { path: ["username"], message: "用户名至少 3 位", code: "too_small" },
  //   { path: ["email"], message: "邮箱格式错误", code: "invalid_string" },
  //   { path: ["age"], message: "必须成年", code: "too_small" },
  // ]
} else {
  console.log(result.data);  // 类型安全的合法数据
}
\`\`\`

- \`parse(data)\`：失败抛错；成功返回 data
- \`safeParse(data)\`：永远返回 \`{ success, data?, error? }\`，不抛错

## 常用方法

\`\`\`js
// 枚举
const role = z.enum(["admin", "user", "guest"]);

// 联合类型
const id = z.union([z.string(), z.number()]);

// 数组
const tags = z.array(z.string()).max(5, "最多 5 个标签");

// 对象部分字段可选
const partial = userSchema.partial(); // 所有字段变可选
const picked = userSchema.pick({ username: true }); // 只取 username
const omitted = userSchema.omit({ age: true }); // 去掉 age

// refine：自定义校验
const password = z.string().min(8).refine(
  (v) => /[A-Z]/.test(v) && /[0-9]/.test(v),
  "需包含大写字母和数字"
);

// transform：转换值
const trimmed = z.string().transform((v) => v.trim());
\`\`\`

## zod v4 与 v3 的差异

zod v4（当前安装版本 4.4.3）相对 v3 主要变化：

- 错误信息更结构化（\`error.issues\` 替代 \`error.errors\`）
- 性能提升
- \`z.string().email()\` 等 API 兼容（建议用 \`z.email()\` 简写）
- \`z.coerce\` 类型强制转换更完善

\`\`\`js
// v4 推荐
const num = z.coerce.number(); // "123" → 123

// 等价于
const num2 = z.string().transform(Number);
\`\`\`

下一章我们正式把 zod 接入 \`@mantine/form\`。
`,
  },

  // -------------------------------------------------------------
  // 章节 2：Form 接入 Zod
  // -------------------------------------------------------------
  {
    id: "m-form-zod-basic",
    group: "Form + Zod",
    icon: "🔗",
    title: "Form 接入 Zod 校验",
    content: `# Form 接入 Zod 校验

\`@mantine/form\` v9 内置 Standard Schema 集成，通过 \`schemaResolver\` 把 schema（zod/valibot 等）转成 form 的校验器。

## 安装

\`\`\`bash
npm install @mantine/form zod
\`\`\`

注意：v9 的 \`schemaResolver\` 从 \`@mantine/form\` 主包导出，基于 Standard Schema 协议，支持 zod v4 / valibot 等任何符合标准的 schema 库。

## 最小示例

\`\`\`jsx
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";
import { TextInput, Button, Box } from "@mantine/core";

// 1. 定义 schema
const schema = z.object({
  username: z.string().min(3, "用户名至少 3 位"),
  email: z.string().email("邮箱格式不正确"),
  age: z.coerce.number().int().min(18, "必须成年"),
});

// 2. 推导类型（可选，用于类型安全）
type FormValues = z.infer<typeof schema>;

export default function Demo() {
  // 3. 用 schemaResolver 把 schema 接入 form
  const form = useForm({
    initialValues: { username: "", email: "", age: 18 },
    validate: schemaResolver(schema),
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <TextInput
          label="用户名"
          withAsterisk
          {...form.getInputProps("username")}
        />
        <TextInput
          label="邮箱"
          withAsterisk
          mt="md"
          {...form.getInputProps("email")}
        />
        <TextInput
          label="年龄"
          type="number"
          withAsterisk
          mt="md"
          {...form.getInputProps("age")}
        />
        <Button type="submit" mt="md" fullWidth>
          提交
        </Button>
      </form>
    </Box>
  );
}
\`\`\`

## 关键点

### 1. \`schemaResolver\` 从 \`@mantine/form\` 导入

\`\`\`js
import { schemaResolver } from "@mantine/form";
\`\`\

注意：v9 改用 Standard Schema 协议，\`schemaResolver\` 直接从 \`@mantine/form\` 主包导出（不再有 \`@mantine/form/zod\` 子路径）。zod v4 已内置 Standard Schema 支持，可以直接传 zod schema。

### 2. \`validate\` 接受 resolver 函数

\`useForm({ validate })\` 既接受自定义函数也接受 resolver。Mantine 内部会调用 \`resolver(values)\`，期望返回 \`{ field: errorString }\` 或 \`null\`。

### 3. \`z.coerce.number()\` 处理 \`<input type="number">\`

\`TextInput\` 的值永远是字符串。如果 schema 是 \`z.number()\`，校验会失败。用 \`z.coerce.number()\` 会自动把字符串转 number 再校验。

### 4. \`initialValues\` 的字段要和 schema 对应

- schema 里有的字段，\`initialValues\` 也要有（即使空字符串）
- schema 里没有的字段不要写到 \`initialValues\`（否则 form 状态会冗余）

## 错误展示

\`getInputProps\` 自动把校验错误通过 \`error\` prop 传给 \`TextInput\`：

\`\`\`jsx
<TextInput
  label="邮箱"
  {...form.getInputProps("email")}
/>
// 如果 email 不合法，下方自动显示红色错误文字
\`\`\

也可以手动取错误：

\`\`\`js
const errors = form.errors;
// { email: "邮箱格式不正确", username: undefined }
\`\`\

## 校验时机

默认 \`validate\` 在 **submit** 和 **onChange after first submit** 时触发：

- 第一次提交前不校验
- 提交后开始 onChange 校验
- 失焦不校验（除非用 \`validateInputOnBlur\`）

\`\`\`js
const form = useForm({
  initialValues: { ... },
  validate: schemaResolver(schema),
  validateInputOnBlur: true, // 失焦也校验
  validateInputOnChange: true, // 改变也校验（实时）
});
\`\`\

**推荐**：用 \`validateInputOnBlur: true\`，避免用户输入到一半就被红色错误打断。

## 完整流程

\`\`\`js
// 1. 写 schema
const schema = z.object({ ... });

// 2. 推导类型（可选）
type Values = z.infer<typeof schema>;

// 3. useForm
const form = useForm<Values>({
  initialValues: { ... },
  validate: schemaResolver(schema),
});

// 4. 拿值
form.onSubmit((values: Values) => {
  // values 类型安全，且已通过 zod 校验
});
\`\`\`

下一章讲复杂表单场景。
`,
  },

  // -------------------------------------------------------------
  // 章节 3：复杂表单实战
  // -------------------------------------------------------------
  {
    id: "m-form-zod-complex",
    group: "Form + Zod",
    icon: "🏗️",
    title: "复杂表单实战",
    content: `# 复杂表单实战

本章用 zod 处理嵌套对象、数组、枚举、联合类型等复杂场景。

## 1. 嵌套对象

\`\`\`jsx
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";
import { TextInput, Box, Button } from "@mantine/core";

const schema = z.object({
  name: z.string().min(2, "姓名至少 2 字"),
  address: z.object({
    province: z.string().min(1, "省份必填"),
    city: z.string().min(1, "城市必填"),
    detail: z.string().min(5, "详细地址至少 5 字"),
  }),
});

export default function Demo() {
  const form = useForm({
    initialValues: {
      name: "",
      address: { province: "", city: "", detail: "" },
    },
    validate: schemaResolver(schema),
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(console.log)}>
        <TextInput label="姓名" withAsterisk {...form.getInputProps("name")} />

        <Box mt="md" p="md" bg="gray.0">
          <TextInput
            label="省份"
            withAsterisk
            {...form.getInputProps("address.province")}
          />
          <TextInput
            label="城市"
            withAsterisk
            mt="xs"
            {...form.getInputProps("address.city")}
          />
          <TextInput
            label="详细地址"
            withAsterisk
            mt="xs"
            {...form.getInputProps("address.detail")}
          />
        </Box>

        <Button type="submit" mt="md" fullWidth>提交</Button>
      </form>
    </Box>
  );
}
\`\`\

\`getInputProps("address.province")\` 用点号访问嵌套字段，zod 的错误路径也会是 \`["address", "province"]\`，自动映射到对应 \`TextInput\`。

## 2. 数组字段（form.list + zod）

\`\`\`jsx
const schema = z.object({
  contacts: z.array(
    z.object({
      type: z.enum(["email", "phone"]),
      value: z.string().min(1, "必填"),
    })
  ).min(1, "至少一个联系方式"),
});

export default function Demo() {
  const form = useForm({
    initialValues: { contacts: [{ type: "email", value: "" }] },
    validate: schemaResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      {form.values.contacts.map((_, i) => (
        <Group key={i} mt="xs">
          <Select
            data={[
              { value: "email", label: "邮箱" },
              { value: "phone", label: "电话" },
            ]}
            {...form.getInputProps(\`contacts.\${i}.type\`)}
          />
          <TextInput
            style={{ flex: 1 }}
            {...form.getInputProps(\`contacts.\${i}.value\`)}
          />
          <Button
            color="red"
            variant="light"
            onClick={() => form.removeListItem("contacts", i)}
          >
            删除
          </Button>
        </Group>
      ))}
      <Button
        variant="light"
        mt="xs"
        onClick={() => form.insertListItem("contacts", { type: "email", value: "" })}
      >
        添加
      </Button>
      <Button type="submit" mt="md" fullWidth>提交</Button>
    </form>
  );
}
\`\`\

\`form.list\` 是更高级的写法，等价于上面手动 \`map\`：

\`\`\`jsx
<form.list
  values={form.values.contacts}
  onPush={() => form.insertListItem("contacts", { type: "email", value: "" })}
  onRemove={(i) => form.removeListItem("contacts", i)}
>
  {({ item, index }) => (
    <Group>
      <Select data={...} {...form.getInputProps(\`contacts.\${index}.type\`)} />
      <TextInput {...form.getInputProps(\`contacts.\${index}.value\`)} />
    </Group>
  )}
</form.list>
\`\`\

## 3. 枚举 + Select

\`\`\`js
const roleEnum = z.enum(["admin", "user", "guest"]);
// z.enum 接受 readonly tuple，必须用 as const

const schema = z.object({
  role: z.enum(["admin", "user", "guest"]),
});
\`\`\

\`Select\` 的 \`data\` 可以从 schema 推导：

\`\`\`js
const roles = schema.shape.role.options; // ["admin", "user", "guest"]
const selectData = roles.map((r) => ({ value: r, label: r }));
\`\`\

## 4. 条件必填（refine）

"邮箱或电话至少填一个"：

\`\`\`js
const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\\d{11}$/).optional().or(z.literal("")),
}).refine(
  (data) => data.email || data.phone,
  {
    message: "邮箱或电话至少填一个",
    path: ["email"], // 错误挂到 email 字段
  }
);
\`\`\

\`path\` 决定错误显示在哪个 \`TextInput\` 下面。

## 5. 字段间联动校验

"密码确认必须一致"：

\`\`\`js
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  }
);
\`\`\

切换密码时，confirmPassword 的错误会自动更新（因为 refine 每次校验整个对象）。

## 6. 联合类型 + discriminatedUnion

\`discriminatedUnion\` 用于"根据某字段决定 schema"的场景：

\`\`\`js
const emailLogin = z.object({
  method: z.literal("email"),
  email: z.string().email(),
  password: z.string().min(8),
});

const smsLogin = z.object({
  method: z.literal("sms"),
  phone: z.string().regex(/^\\d{11}$/),
  code: z.string().length(6),
});

const loginSchema = z.discriminatedUnion("method", [emailLogin, smsLogin]);
\`\`\

在 React 中：

\`\`\`jsx
function Login() {
  const form = useForm({
    initialValues: { method: "email", email: "", password: "", phone: "", code: "" },
    validate: schemaResolver(loginSchema),
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <Select
        label="登录方式"
        data={[
          { value: "email", label: "邮箱" },
          { value: "sms", label: "短信" },
        ]}
        {...form.getInputProps("method")}
      />
      {form.values.method === "email" ? (
        <>
          <TextInput label="邮箱" {...form.getInputProps("email")} />
          <TextInput label="密码" type="password" {...form.getInputProps("password")} />
        </>
      ) : (
        <>
          <TextInput label="手机号" {...form.getInputProps("phone")} />
          <TextInput label="验证码" {...form.getInputProps("code")} />
        </>
      )}
    </form>
  );
}
\`\`\

## 踩坑提示

- \`z.enum\` 的参数必须用 \`as const\`，否则 TS 会推导成 \`string[]\`
- \`refine\` 的 \`path\` 决定错误挂哪个字段，可传数组 \`["address", "province"]\` 挂到嵌套
- 数组字段移除后，zod 会自动重新校验剩余元素
- \`z.coerce.number()\` 处理 \`TextInput type="number"\` 的字符串值
- \`schemaResolver\` 会忽略 \`transform\`，校验后 \`values\` 是原值；要 transform 用 \`transformValues\`
`,
  },

  // -------------------------------------------------------------
  // 章节 4：异步校验
  // -------------------------------------------------------------
  {
    id: "m-form-zod-async",
    group: "Form + Zod",
    icon: "⏳",
    title: "异步校验与 refine",
    content: `# 异步校验与 refine

zod 的 \`refine\` / \`superRefine\` 可以返回 Promise，实现"查重"等异步校验。

## 1. 基本 refine（同步）

\`\`\`js
const schema = z.object({
  username: z.string().min(3).refine(
    (v) => !v.includes("admin"),
    "用户名不能包含 admin"
  ),
});
\`\`\

## 2. 异步 refine

\`\`\`js
const schema = z.object({
  username: z.string().min(3).refine(
    async (v) => {
      const res = await fetch(\`/api/check-username?u=\${v}\`);
      const { available } = await res.json();
      return available;
    },
    "用户名已被占用"
  ),
});
\`\`\

\`schemaResolver\` 会 \`await\` 整个 schema 校验，所以异步 refine 自动生效。

## 3. 完整示例：用户名查重

\`\`\`jsx
import { useState } from "react";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";
import { TextInput, Button, Box } from "@mantine/core";

const schema = z.object({
  username: z.string()
    .min(3, "至少 3 位")
    .refine(
      async (v) => {
        // 模拟接口查重
        await new Promise((r) => setTimeout(r, 500));
        const taken = ["admin", "alice", "bob"];
        return !taken.includes(v.toLowerCase());
      },
      "用户名已被占用"
    ),
});

export default function AsyncDemo() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    initialValues: { username: "" },
    validate: schemaResolver(schema),
  });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log("注册成功:", values);
    setSubmitting(false);
  };

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="用户名"
          withAsterisk
          description="试试 admin / alice / bob（会被占用）"
          {...form.getInputProps("username")}
        />
        <Button type="submit" loading={submitting} mt="md" fullWidth>
          注册
        </Button>
      </form>
    </Box>
  );
}
\`\`\

## 4. 防抖异步校验

默认 \`validateInputOnChange\` 会在每次按键触发异步 refine，性能差。建议：

- 关闭 \`validateInputOnChange\`，只在 blur 校验
- 或自己实现防抖，手动调用 \`form.validateField("username")\`

\`\`\`jsx
import { useRef } from "react";

function UsernameField() {
  const form = useFormContext();
  const timer = useRef(null);

  return (
    <TextInput
      label="用户名"
      {...form.getInputProps("username")}
      onChange={(e) => {
        form.setFieldValue("username", e.target.value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          form.validateField("username");
        }, 500);
      }}
    />
  );
}
\`\`\

## 5. superRefine：多字段错误

\`refine\` 只能返回一个错误，\`superRefine\` 可以返回多个：

\`\`\`js
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      code: "custom",
      message: "两次密码不一致",
    });
  }
  if (data.password.length < 8) {
    ctx.addIssue({
      path: ["password"],
      code: "custom",
      message: "密码至少 8 位",
    });
  }
});
\`\`\

\`ctx.addIssue\` 可以挂任意字段任意多个错误，schemaResolver 会全部收集并映射到 \`form.errors\`。

## 6. 与服务端校验的分工

**前端 zod 校验**：用户体验，即时反馈，过滤明显错误
**服务端校验**：安全，必须做（前端可被绕过）

不要把服务端逻辑搬到前端（比如查询数据库），用异步 refine 调接口即可。

## 踩坑提示

- 异步 refine 在 \`validateInputOnChange: true\` 时会频繁请求，要手动防抖
- \`refine\` 失败时 zod 不返回 \`data\`，只能从 \`form.values\` 拿原值
- \`superRefine\` 返回 \`void\`，所有错误通过 \`ctx.addIssue\` 添加
- zod resolver 内部用 \`Promise.allSettled\`，多个异步 refine 并行执行
`,
  },

  // -------------------------------------------------------------
  // 章节 5：Form 与 Modal 配合
  // -------------------------------------------------------------
  {
    id: "m-form-modal",
    group: "Form + Zod",
    icon: "🪟",
    title: "Form 与 Modal 配合",
    content: `# Form 与 Modal 配合

Modal 里的表单有几个常见坑：失焦关闭、ESC 关闭、表单状态保留。本章给出标准模式。

## 1. 基本模式

\`\`\`jsx
import { useState } from "react";
import { Modal, TextInput, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "至少 2 字"),
  email: z.string().email("邮箱格式错误"),
});

export default function ModalFormDemo() {
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: { name: "", email: "" },
    validate: schemaResolver(schema),
  });

  const handleSubmit = (values) => {
    console.log("提交:", values);
    setOpened(false);
    form.reset();
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>打开表单</Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="用户信息"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="姓名"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="邮箱"
            withAsterisk
            mt="md"
            {...form.getInputProps("email")}
          />
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
\`\`\

## 2. 阻止 ESC 关闭（避免误操作）

如果用户填了一半，ESC 关闭会丢失数据：

\`\`\`jsx
<Modal
  opened={opened}
  onClose={() => {
    if (form.isDirty()) {
      // 有改动时弹确认
      if (confirm("有未保存的修改，确定关闭吗？")) {
        setOpened(false);
        form.reset();
      }
    } else {
      setOpened(false);
    }
  }}
  closeOnClickOutside={false} // 禁止点击遮罩关闭
  closeOnEscape={false}       // 禁止 ESC 关闭
  title="用户信息"
>
  ...
</Modal>
\`\`\

\`form.isDirty()\` 返回 true 表示表单有改动。

## 3. 编辑模式：预设值

\`\`\`jsx
function UserEditModal({ user, opened, onClose }) {
  const form = useForm({
    initialValues: user ?? { name: "", email: "" },
    validate: schemaResolver(schema),
  });

  // user 变化时重置表单
  useEffect(() => {
    if (opened) {
      form.setValues(user ?? { name: "", email: "" });
      form.clearErrors();
    }
  }, [user, opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="编辑用户">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="姓名" {...form.getInputProps("name")} />
        <TextInput label="邮箱" mt="md" {...form.getInputProps("email")} />
        <Button type="submit" mt="md" fullWidth>保存</Button>
      </form>
    </Modal>
  );
}
\`\`\

## 4. 异步提交时禁用按钮

\`\`\`jsx
function ModalForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm({ ... });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.save(values);
      form.reset();
      setOpened(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={() => setOpened(false)}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput {...form.getInputProps("name")} />
        <Button type="submit" loading={loading} fullWidth mt="md">
          保存
        </Button>
      </form>
    </Modal>
  );
}
\`\`\

\`loading\` prop 会自动禁用按钮并显示 spinner。

## 5. 大表单：FormProvider + Context

如果表单很大（几十个字段），把所有 \`TextInput\` 写在一个组件里会变得臃肿。用 \`FormProvider\` 拆分：

\`\`\`jsx
import { FormProvider, useForm, createContextForm } from "@mantine/form";

const form = useForm({ ... });

return (
  <FormProvider form={form}>
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <BasicInfoSection />
      <AddressSection />
      <ContactsSection />
      <Button type="submit">提交</Button>
    </form>
  </FormProvider>
);

// 子组件
function BasicInfoSection() {
  const form = useFormContext(); // 从 Context 拿 form
  return (
    <>
      <TextInput label="姓名" {...form.getInputProps("name")} />
      <TextInput label="邮箱" {...form.getInputProps("email")} />
    </>
  );
}
\`\`\

## 踩坑提示

- \`initialValues\` 是**首次渲染的快照**，后续变化不会自动更新；要更新用 \`form.setValues\`
- Modal 关闭时如果不 \`form.reset()\`，下次打开会保留上次输入
- \`closeOnClickOutside={false}\` 适合长表单，避免用户误触遮罩
- \`FormProvider\` 必须在 \`<form>\` 外层（或同一层），子组件用 \`useFormContext\` 拿
`,
  },

  // -------------------------------------------------------------
  // 章节 6：表单提交模式
  // -------------------------------------------------------------
  {
    id: "m-form-submit-patterns",
    group: "Form + Zod",
    icon: "📤",
    title: "表单提交模式",
    content: `# 表单提交模式

本章总结 \`@mantine/form\` 的几种提交模式，覆盖 90% 场景。

## 1. 基本 submit

\`\`\`jsx
const form = useForm({ ... });

<form onSubmit={form.onSubmit((values) => {
  console.log(values);  // 已通过校验
})}>
  ...
</form>
\`\`\

\`form.onSubmit\` 接受一个回调，**只有校验通过时才会调用**。回调参数 \`values\` 类型与 \`initialValues\` 一致。

## 2. 异步 submit

\`\`\`jsx
const handleSubmit = async (values) => {
  await api.post("/users", values);
  notifications.show({ message: "保存成功" });
  form.reset();
};

<form onSubmit={form.onSubmit(handleSubmit)}>
  <Button type="submit" loading={loading}>保存</Button>
</form>
\`\`\

\`onSubmit\` 自动支持 async，不用手动处理 Promise。

## 3. transformValues：提交前转换

如果 schema 用了 \`z.coerce.number()\`，\`values\` 仍是字符串；要转 number 用 \`transformValues\`：

\`\`\`jsx
const form = useForm({
  initialValues: { age: "18" },
  validate: schemaResolver(schema),
  transformValues: (values) => ({
    ...values,
    age: Number(values.age),
  }),
});

form.onSubmit((values) => {
  console.log(values.age); // 18 (number)
});
\`\`\

\`transformValues\` 在校验通过后、回调调用前执行。

## 4. onValuesChange：实时联动

\`\`\`jsx
const form = useForm({
  initialValues: { country: "cn", province: "" },
  onValuesChange: (values) => {
    // 切换国家时清空省份
    if (values.country !== form.values.country) {
      form.setFieldValue("province", "");
    }
  },
});
\`\`\

适合"省市联动"、"切换类型清空字段"等场景。注意不要在这里调 \`setFieldValue\` 改当前字段，会死循环。

## 5. 手动校验 + 提交

不依赖 \`<form onSubmit>\`，手动触发：

\`\`\`jsx
async function handleSave() {
  const result = form.validate();
  if (result.hasErrors) return;

  const values = form.getValues();
  await api.post("/users", values);
}

<Button onClick={handleSave}>保存</Button>
\`\`\

\`form.validate()\` 返回 \`{ hasErrors, errors }\`。

## 6. 局部提交（多步表单）

\`\`\`jsx
function StepperForm() {
  const form = useForm({
    initialValues: { ... },
    validate: schemaResolver(schema),
    validateInputOnChange: true,
  });

  const [step, setStep] = useState(0);

  function next() {
    // 只校验当前步骤的字段
    const fields = step === 0 ? ["name", "email"] : ["password"];
    const results = fields.map(f => form.validateField(f));
    if (results.some(r => r.hasError)) return;
    setStep(s => s + 1);
  }

  return (
    <>
      {step === 0 && <NameFields />}
      {step === 1 && <PasswordFields />}
      {step === 2 && <Summary />}
      {step < 2
        ? <Button onClick={next}>下一步</Button>
        : <Button type="submit">提交</Button>}
    </>
  );
}
\`\`\

\`form.validateField("name")\` 返回 \`{ hasError, error }\`，只校验单字段。

## 7. reset 与 initialize

\`\`\`jsx
// 重置到 initialValues
form.reset();

// 重置到指定值
form.reset({ name: "alice", email: "" });

// 重置并保留某些字段
form.reset({ ...form.values, password: "" });

// 重新设置 initialValues（影响后续 reset）
form.initialize({ name: "bob", email: "" });
\`\`\

\`initialize\` 会改变 \`initialValues\`，下次 \`reset()\` 回到新值。适合"编辑模式"切换不同记录。

## 8. isDirty 与 isTouched

\`\`\`js
form.isDirty();         // 是否有字段被改过
form.isTouched("name"); // 某字段是否被聚焦过
form.isTouched();        // 任意字段被聚焦过
\`\`\

用于"离开页面前提示"等场景：

\`\`\`jsx
useEffect(() => {
  const handler = (e) => {
    if (form.isDirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [form]);
\`\`\

## 速查表

| 需求 | API |
| --- | --- |
| 提交时校验 | \`form.onSubmit(callback)\` |
| 手动校验全部 | \`form.validate()\` |
| 手动校验单字段 | \`form.validateField("name")\` |
| 提交前转换值 | \`transformValues: (v) => v\` |
| 值变化时联动 | \`onValuesChange: (v) => {}\` |
| 重置 | \`form.reset()\` / \`form.initialize()\` |
| 是否有改动 | \`form.isDirty()\` |
| 是否被聚焦 | \`form.isTouched()\` |

下一批讲 CSS 自定义。
`,
  },
];
