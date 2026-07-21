# 第五章 综合实战：企业级用户注册页面

经过前面四章的学习，我们已经掌握了 Mantine v9 的设计哲学、生态结构、Theme 系统和 Form 验证。本章将把这些知识整合起来，构建一个完整的企业级用户注册页面。

这个实战项目将包含：

- 一个自定义的 Mantine 主题；
- 亮/暗色模式切换；
- 基于 Zod 的表单验证；
- 嵌套对象和列表字段；
- 可访问的表单布局；
- 提交状态与错误反馈。

---

## 5.1 项目目标与设计稿

### 5.1.1 功能需求

| 功能 | 说明 |
|---|---|
| 用户信息 | 邮箱、密码、确认密码、用户名 |
| 个人资料 | 真实姓名、出生日期 |
| 兴趣爱好 | 可动态添加/删除的兴趣标签 |
| 主题切换 | 页面顶部提供亮/暗色模式切换 |
| 表单验证 | 使用 Zod 进行完整验证 |
| 提交反馈 | 提交按钮 loading 状态、表单级错误提示 |

### 5.1.2 页面结构

```
┌─────────────────────────────────────┐
│  Logo          [🌙 暗色模式切换]      │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐   │
│   │      创建新账户              │   │
│   │                             │   │
│   │   邮箱                       │   │
│   │   密码                       │   │
│   │   确认密码                   │   │
│   │   用户名                     │   │
│   │                             │   │
│   │   个人资料                   │   │
│   │   真实姓名  出生日期          │   │
│   │                             │   │
│   │   兴趣爱好                   │   │
│   │   [标签1] [标签2] [+ 添加]   │   │
│   │                             │   │
│   │   [创建账户]                 │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 5.2 第一步：配置主题

首先创建一个自定义主题文件，定义颜色、字体、圆角和组件默认行为。

```jsx
// theme.js
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  // 使用 indigo 作为主色，偏商务稳重
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 8 },

  // 默认圆角
  defaultRadius: "md",

  // 字体栈：优先系统字体
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif",

  // 标题样式
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif",
    fontWeight: "700",
  },

  // 组件默认 props
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
    },
  },
});
```

---

## 5.3 第二步：定义 Zod Schema

将验证规则集中管理在一个 schema 文件中，便于前后端共享。

```jsx
// schema.js
import { z } from "zod";

export const registrationSchema = z
  .object({
    email: z
      .string()
      .min(1, "邮箱不能为空")
      .email("请输入有效的邮箱地址"),

    password: z
      .string()
      .min(8, "密码至少需要 8 个字符")
      .regex(/[a-z]/, "密码必须包含小写字母")
      .regex(/[A-Z]/, "密码必须包含大写字母")
      .regex(/\d/, "密码必须包含数字"),

    confirmPassword: z
      .string()
      .min(1, "请确认密码"),

    username: z
      .string()
      .min(3, "用户名至少 3 个字符")
      .max(20, "用户名最多 20 个字符")
      .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),

    profile: z.object({
      fullName: z
        .string()
        .min(2, "真实姓名至少 2 个字符"),
      birthDate: z
        .string()
        .min(1, "请选择出生日期"),
    }),

    interests: z
      .array(z.string().min(1, "兴趣标签不能为空"))
      .min(1, "请至少添加一个兴趣标签"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
```

---

## 5.4 第三步：构建注册页面组件

```jsx
// components/RegistrationForm.jsx
"use client";

import { useState } from "react";
import { useForm, zodResolver } from "@mantine/form";
import {
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Divider,
  ActionIcon,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconTrash, IconPlus, IconMoon, IconSun } from "@tabler/icons-react";
import { registrationSchema } from "@/schema";

export function RegistrationForm({ onToggleColorScheme, colorScheme }) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      profile: {
        fullName: "",
        birthDate: "",
      },
      interests: ["React"],
    },
    validate: zodResolver(registrationSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setSubmitError("");

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("注册成功:", values);
      form.reset();
    } catch (error) {
      setSubmitError(error.message || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    form.insertListItem("interests", "");
  };

  const removeInterest = (index) => {
    form.removeListItem("interests", index);
  };

  return (
    <Box pos="relative" maw={560} mx="auto" mt="xl">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "lg" }} />

      <Card padding="xl" radius="lg" shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={2}>创建新账户</Title>
          <ActionIcon
            variant="light"
            color={colorScheme === "dark" ? "yellow" : "blue"}
            onClick={onToggleColorScheme}
            size="lg"
            radius="md"
            aria-label="切换主题"
          >
            {colorScheme === "dark" ? (
              <IconSun size={20} />
            ) : (
              <IconMoon size={20} />
            )}
          </ActionIcon>
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* 账户信息 */}
            <TextInput
              label="邮箱"
              placeholder="your@email.com"
              withAsterisk
              key={form.key("email")}
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="密码"
              placeholder="至少 8 位，包含大小写字母和数字"
              withAsterisk
              key={form.key("password")}
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="确认密码"
              placeholder="请再次输入密码"
              withAsterisk
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
            />

            <TextInput
              label="用户名"
              placeholder="3-20 位字母、数字或下划线"
              withAsterisk
              key={form.key("username")}
              {...form.getInputProps("username")}
            />

            <Divider label="个人资料" labelPosition="center" />

            {/* 嵌套对象 */}
            <Group grow>
              <TextInput
                label="真实姓名"
                placeholder="请输入真实姓名"
                withAsterisk
                key={form.key("profile.fullName")}
                {...form.getInputProps("profile.fullName")}
              />

              <DateInput
                label="出生日期"
                placeholder="选择日期"
                withAsterisk
                valueFormat="YYYY-MM-DD"
                key={form.key("profile.birthDate")}
                {...form.getInputProps("profile.birthDate")}
              />
            </Group>

            <Divider label="兴趣爱好" labelPosition="center" />

            {/* 列表字段 */}
            {form.values.interests.map((interest, index) => (
              <Group key={`interest-${index}`} gap="xs">
                <TextInput
                  placeholder="例如：摄影、阅读、编程"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`interests.${index}`)}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeInterest(index)}
                  disabled={form.values.interests.length <= 1}
                  aria-label="删除兴趣标签"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}

            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addInterest}
              fullWidth
            >
              添加兴趣标签
            </Button>

            {/* 表单级错误 */}
            {submitError && (
              <Text c="red" size="sm" ta="center">
                {submitError}
              </Text>
            )}

            {/* 提交按钮 */}
            <Button
              type="submit"
              size="md"
              fullWidth
              loading={loading}
            >
              创建账户
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
```

---

## 5.5 第四步：根布局与主题切换

```jsx
// app/layout.js
"use client";

import { useState } from "react";
import { MantineProvider, AppShell, Container } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { theme } from "@/theme";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function RegistrationPage() {
  const [colorScheme, setColorScheme] = useState("light");

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <AppShell padding="md">
        <AppShell.Main>
          <Container size="md">
            <RegistrationForm
              onToggleColorScheme={toggleColorScheme}
              colorScheme={colorScheme}
            />
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
```

---

## 5.6 第五步：可访问性优化

一个真正的企业级表单，必须考虑可访问性。以下是本实战中的关键 a11y 措施：

### 5.6.1 标签关联

所有输入框都使用了 `label` prop，Mantine 会自动生成 `<label for="inputId">`，确保屏幕阅读器可以正确朗读。

### 5.6.2 必填标识

使用 `withAsterisk` 在视觉上标识必填字段，同时 Mantine 会自动添加 `aria-required="true"`。

### 5.6.3 错误提示关联

Mantine 输入框的错误提示会自动通过 `aria-describedby` 与输入框关联，屏幕阅读器会在聚焦时朗读错误信息。

### 5.6.4 按钮状态

提交按钮使用 `loading` 状态，避免用户重复提交，同时保持焦点可访问。

### 5.6.5 图标按钮标签

主题切换和删除标签的 `ActionIcon` 都设置了 `aria-label`，确保没有视觉文本的按钮也能被屏幕阅读器理解。

---

## 5.7 第六步：测试与调试

### 5.7.1 验证测试用例

| 用例 | 预期结果 |
|---|---|
| 邮箱为空并提交 | 显示 "邮箱不能为空" |
| 密码为 "123" | 显示密码强度相关错误 |
| 两次密码不一致 | 确认密码显示 "两次输入的密码不一致" |
| 用户名包含特殊字符 | 显示 "用户名只能包含字母、数字和下划线" |
| 删除所有兴趣标签并提交 | 显示 "请至少添加一个兴趣标签" |
| 所有字段正确 | 提交成功，表单重置 |

### 5.7.2 主题切换测试

- 点击主题切换按钮，页面应在亮/暗色模式间平滑切换；
- 输入框、卡片、按钮的颜色应自动适应新模式；
- 不应出现文字不可读或背景突兀的问题。

### 5.7.3 键盘导航测试

- 使用 Tab 键可以顺序访问所有输入框和按钮；
- 按 Enter 在输入框内不会意外提交；
- 删除标签按钮可通过键盘激活。

---

## 5.8 代码组织建议

对于真实项目，建议将代码进一步拆分：

```
app/
├── registration/
│   ├── page.js              # 页面入口
│   └── layout.js            # 页面级布局
├── components/
│   ├── RegistrationForm.jsx # 表单组件
│   ├── InterestTags.jsx     # 兴趣标签子组件
│   └── ThemeToggle.jsx      # 主题切换按钮
├── hooks/
│   └── useRegistration.js   # 表单逻辑 Hook
├── schema/
│   └── registration.js      # Zod schema
└── theme.js                 # 主题配置
```

### 5.8.1 抽离自定义 Hook

```jsx
// hooks/useRegistration.js
import { useState } from "react";
import { useForm, zodResolver } from "@mantine/form";
import { registrationSchema } from "@/schema/registration";

export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      profile: { fullName: "", birthDate: "" },
      interests: [""],
    },
    validate: zodResolver(registrationSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setSubmitError("");

    try {
      await api.register(values);
      form.reset();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    submitError,
    handleSubmit,
  };
}
```

---

## 5.9 本章小结

本章通过一个完整的企业级用户注册页面，串联了 Mantine v9 的多个核心能力：

1. **自定义主题**：使用 `createTheme` 统一颜色、字体、圆角和组件默认行为；
2. **暗色模式**：通过状态控制 `MantineProvider` 的 `defaultColorScheme`；
3. **Zod 验证**：将复杂验证规则集中管理，提高可维护性；
4. **嵌套对象**：通过 `profile.fullName` 等点号路径访问嵌套字段；
5. **列表字段**：使用 `insertListItem` 和 `removeListItem` 管理动态兴趣标签；
6. **可访问性**：标签关联、必填标识、错误提示、键盘导航一应俱全；
7. **代码组织**：将表单逻辑抽离为自定义 Hook，便于测试和复用。

这个实战项目展示了 Mantine 如何在真实业务中帮助你快速构建高质量、可维护、可访问的表单界面。希望你能在此基础上，根据实际业务需求继续扩展。

---

## 附录：本书代码速查

### 安装依赖

```bash
npm install @mantine/core @mantine/hooks @mantine/form @mantine/dates zod dayjs
npm install @tabler/icons-react
```

### 最小可运行的登录表单

```jsx
import { useForm } from "@mantine/form";
import { TextInput, Button, Group } from "@mantine/core";

function LoginForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "邮箱格式不正确"),
      password: (value) =>
        value.length >= 6 ? null : "密码至少 6 个字符",
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        label="邮箱"
        key={form.key("email")}
        {...form.getInputProps("email")}
      />
      <TextInput
        label="密码"
        type="password"
        mt="md"
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">登录</Button>
      </Group>
    </form>
  );
}
```

### 创建自定义主题

```jsx
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <YourApp />
    </MantineProvider>
  );
}
```

### 切换暗色模式

```jsx
import { Button } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Button
      onClick={() =>
        setColorScheme(colorScheme === "light" ? "dark" : "light")
      }
    >
      切换主题
    </Button>
  );
}
```

祝你在 Mantine v9 的学习与实践中一帆风顺！
