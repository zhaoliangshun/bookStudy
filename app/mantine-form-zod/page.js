"use client";

// =============================================================
// 文件：app/mantine-form-zod/page.js
// 路由：/mantine-form-zod
// -------------------------------------------------------------
// 【一句话职责】
//   用一个「用户注册表单」演示 Mantine Form 与 Zod 校验的【进阶用法】，
//   重点演示用户名/密码字段的【实时规则提示条】（RuleHints）组件：
//   默认隐藏 → 聚焦时灰色条款 → 输入时实时变绿✓/红✕。
//
// 【表单字段】
//   ① 基础信息：username、password、confirmPassword
//   ② OTP：一次性验证码（6 位数字，异步后端校验）
//
// 【用户名规则（3 条）】
//   1. Must be 8-15 characters in length
//   2. Must include alphabets and numbers
//   3. Must be unique login name（异步校验）
//
// 【密码规则（3 条）】
//   1. Must contain 8-20 characters in length (Case sensitive)
//   2. Must include Uppercase and Lowercase alphabets, Numbers,
//      and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)
//   3. Must be different from your Login Name（跨字段校验）
//
// 【三方库版本】
//   - @mantine/core ^9.4.1
//   - @mantine/form  ^9.4.1   ← 新版用 schemaResolver 而非旧的 zodResolver
//   - zod            ^4.4.3
//   - next           ^16.2.9
//   - react          19.2.4
// =============================================================

import "@mantine/core/styles.css";

import { useState } from "react";
import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import {
  MantineProvider,
  createTheme,
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Divider,
  TextInput,
  PasswordInput,
  PinInput,
  Button,
  Box,
  Code,
  Alert,
  Modal,
} from "@mantine/core";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  autoContrast: true,
  fontFamily:
    "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  headings: {
    fontFamily:
      "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  },
});

// =============================================================
// 规则定义：用户名和密码的校验规则
// -------------------------------------------------------------
// 每条规则包含：
//   id     : 唯一标识
//   label  : 显示文案
//   test   : 同步校验函数，(value, allValues) => boolean
//   pending: 判断是否处于"待校验"状态（灰色✓），(value, data) => boolean
//            返回 true  → 灰色（待校验/输入中）
//            返回 false → 走 test() 判断通过/失败
//
// 【状态逻辑】
//   字段为空（value === ""）→ 所有规则 pending（灰色✓）
//   字段有值 → 逐条计算：
//     pending(v, data) === true  → 灰色✓（信息不足，还无法判断）
//     test(v, data)             → true: 绿色✓ / false: 红色✕
// =============================================================

// ---- 已被占用的用户名（模拟后端数据库）----
const TAKEN_USERNAMES = ["admin123", "root1234", "test12345"];

const usernameRules = [
  {
    id: "u_len",
    label: "Must be 8-15 characters in length",
    test: (v) => v.length >= 8 && v.length <= 15,
    pending: (v) => v.length === 0,
  },
  {
    id: "u_alphanum",
    label: "Must include alphabets and numbers",
    test: (v) => /[a-zA-Z]/.test(v) && /\d/.test(v),
    pending: (v) => v.length === 0,
  },
  {
    id: "u_unique",
    label: "Must be unique login name",
    test: (v) => {
      return v.length >= 8 && !TAKEN_USERNAMES.includes(v.toLowerCase());
    },
    pending: (v) => v.length < 8,
  },
];

const passwordRules = [
  {
    id: "p_len",
    label: "Must contain 8-20 characters in length (Case sensitive)",
    test: (v) => v.length >= 8 && v.length <= 20,
    pending: (v) => v.length === 0,
  },
  {
    id: "p_chars",
    label:
      "Must include Uppercase and Lowercase alphabets, Numbers, and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)",
    test: (v) =>
      /[A-Z]/.test(v) &&
      /[a-z]/.test(v) &&
      /\d/.test(v) &&
      /[!@#$%^&*{}\[\]/|.,<>?`]/.test(v),
    pending: (v) => v.length === 0,
  },
  {
    id: "p_diffname",
    label: "Must be different from your Login Name",
    test: (v, data) => {
      const uname = (data.username || "").toLowerCase();
      if (!uname || uname.length < 3) return true;
      return !v.toLowerCase().includes(uname);
    },
    pending: (v, data) => !data.username || data.username.length < 3,
  },
];

// =============================================================
// RuleHints 组件：三色规则提示条
// =============================================================

const STATUS_COLORS = {
  pending: { bg: "#9ca3af", text: "#9ca3af" },
  pass: { bg: "#22c55e", text: "#16a34a" },
  fail: { bg: "#ef4444", text: "#dc2626" },
};

function RuleHints({ rules, value, data, visible, forceValidate }) {
  if (!visible) return null;

  return (
    <Stack gap={6} mt={6}>
      {rules.map((rule) => {
        // ---- 计算本条规则的状态 ----
        // forceValidate=true（失焦后）时，不再显示灰色 pending，
        // 直接走 test() 判定 pass/fail，确保空字段显示红色错误而非灰色待校验
        let status; // "pending" | "pass" | "fail"
        if (!forceValidate && rule.pending(value, data)) {
          status = "pending";
        } else {
          status = rule.test(value, data) ? "pass" : "fail";
        }

        // ---- 根据状态选颜色和图标 ----
        const icon = status === "fail" ? "\u2715" : "\u2713";

        return (
          <Group key={rule.id} gap={8} wrap="nowrap">
            {/* 圆形图标 */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: STATUS_COLORS[status].bg,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {icon}
            </span>
            <Text size="sm" c={STATUS_COLORS[status].text} style={{ lineHeight: 1.5 }}>
              {rule.label}
            </Text>
          </Group>
        );
      })}
    </Stack>
  );
}

// =============================================================
// Zod Schema 定义
// =============================================================

const schema = z
  .object({
    // ---- username：用户名（3 条规则）----
    username: z
      .string()
      .min(8, "Must be 8-15 characters in length")
      .max(15, "Must be 8-15 characters in length")
      .regex(/[a-zA-Z]/, "Must include alphabets and numbers")
      .regex(/\d/, "Must include alphabets and numbers")
      .refine(async (v) => {
        await new Promise((r) => setTimeout(r, 200));
        return !TAKEN_USERNAMES.includes(v.toLowerCase());
      }, "Must be unique login name"),

    // ---- password：密码（3 条规则，第 3 条跨字段在 superRefine）----
    password: z
      .string()
      .min(8, "Must contain 8-20 characters in length (Case sensitive)")
      .max(20, "Must contain 8-20 characters in length (Case sensitive)")
      .refine(
        (v) => /[A-Z]/.test(v),
        "Must include Uppercase and Lowercase alphabets, Numbers, and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)"
      )
      .refine(
        (v) => /[a-z]/.test(v),
        "Must include Uppercase and Lowercase alphabets, Numbers, and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)"
      )
      .refine(
        (v) => /\d/.test(v),
        "Must include Uppercase and Lowercase alphabets, Numbers, and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)"
      )
      .refine(
        (v) => /[!@#$%^&*{}\[\]/|.,<>?`]/.test(v),
        "Must include Uppercase and Lowercase alphabets, Numbers, and Special characters (Such as !@#$%^&*{}[]/|.,<>?`)"
      ),

    // ---- confirmPassword：确认密码 ----
    confirmPassword: z.string().min(1, "请再次输入密码"),

    // ---- otp：一次性验证码 ----
    otp: z
      .string()
      .min(6, "验证码必须是 6 位")
      .max(6, "验证码必须是 6 位")
      .regex(/^\d{6}$/, "验证码只能是数字")
      .refine(
        (v) => !/^(\d)\1{5}$/.test(v),
        "验证码不能是 6 位全相同（如 000000）"
      )
      .refine(async (v) => {
        await new Promise((r) => setTimeout(r, 300));
        return v === "246810";
      }, "验证码不正确，请检查后重新输入"),
  })
  // ---- superRefine：跨字段校验（密码=确认密码，密码≠用户名）----
  .superRefine((data, ctx) => {
    // 规则 A：两次密码一致
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "两次输入的密码不一致",
      });
    }

    // 规则 B：密码必须与登录名不同（用户名长度 ≥ 3 才检查）
    if (
      data.username &&
      data.username.length >= 3 &&
      data.password.toLowerCase().includes(data.username.toLowerCase())
    ) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "Must be different from your Login Name",
      });
    }
  });

// =============================================================
// 初始值
// =============================================================
const initialValues = {
  username: "",
  password: "",
  confirmPassword: "",
  otp: "",
};

// =============================================================
// 注册表单组件
// =============================================================
function RegistrationForm({ onSubmit }) {
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    validateInputOnBlur: true,
    // 所有字段均不在 onChange 时触发 Zod 校验，统一在失焦时校验：
    //   · username/password：RuleHints 组件已提供同步实时反馈（绿✓/红✕），
    //     且含异步 refine（用户名查重），onChange 触发会导致每次按键都发
    //     异步请求，有竞态风险
    //   · confirmPassword：只在失焦时校验与 password 的一致性
    //   · otp：含异步后端校验，不做 onChange
    validateInputOnChange: [],
  });

  // ---- 聚焦 + touched 状态控制 RuleHints 显示/隐藏 ----
  // touched 一旦失焦变为 true 后不再复位，配合 forceValidate 消除闪烁：
  //   - 默认隐藏 → 聚焦时显示（灰色 pending）→ 输入时同步判定 pass/fail
  //   - 失焦后：touched=true 保持显示，forceValidate 跳过 pending 直判 pass/fail
  //   - 重置时：touched 复位为 false → 隐藏
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const usernameHintsVisible = usernameFocused || usernameTouched;
  const passwordHintsVisible = passwordFocused || passwordTouched;
  const usernameForceValidate = usernameTouched && !usernameFocused;
  const passwordForceValidate = passwordTouched && !passwordFocused;

  // ---- 同步计算 error 状态（消除边框闪烁）----
  // 不用 form.errors（异步，需等 async refine 完成），改用 test() 同步计算
  const usernameHasError =
    usernameTouched &&
    !usernameRules.every((r) => r.test(form.values.username, form.values));
  const passwordHasError =
    passwordTouched &&
    !passwordRules.every((r) => r.test(form.values.password, form.values));

  // ---- confirmPassword 同步 error（与 password 一致时才通过）----
  const confirmPasswordHasError =
    form.values.confirmPassword.length > 0 &&
    form.values.confirmPassword !== form.values.password;

  return (
    <Paper p="lg" withBorder shadow="sm">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {/* ========== 区块 1：基础信息 ========== */}
          <Title order={4}>① 基础信息</Title>

          {/* ---- username + RuleHints ---- */}
          <Box>
            <TextInput
              label="Login Name"
              placeholder="8-15 characters, letters and numbers"
              withAsterisk
              {...form.getInputProps("username")}
              error={usernameHasError}
              onFocus={(e) => {
                setUsernameFocused(true);
                form.getInputProps("username").onFocus?.(e);
              }}
              onBlur={(e) => {
                form.getInputProps("username").onBlur?.(e);
                setUsernameFocused(false);
                setUsernameTouched(true);
              }}
            />
            <RuleHints
              rules={usernameRules}
              value={form.values.username}
              data={form.values}
              visible={usernameHintsVisible}
              forceValidate={usernameForceValidate}
            />
          </Box>

          {/* ---- password + RuleHints ---- */}
          <Box>
            <PasswordInput
              label="Group Password"
              placeholder="8-20 characters, include A-Z, a-z, 0-9, special chars"
              withAsterisk
              {...form.getInputProps("password")}
              error={passwordHasError}
              onFocus={(e) => {
                setPasswordFocused(true);
                form.getInputProps("password").onFocus?.(e);
              }}
              onBlur={(e) => {
                form.getInputProps("password").onBlur?.(e);
                setPasswordFocused(false);
                setPasswordTouched(true);
              }}
            />
            <RuleHints
              rules={passwordRules}
              value={form.values.password}
              data={form.values}
              visible={passwordHintsVisible}
              forceValidate={passwordForceValidate}
            />
          </Box>

          {/* ---- confirmPassword ---- */}
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            withAsterisk
            {...form.getInputProps("confirmPassword")}
            error={confirmPasswordHasError}
          />

          <Divider my="xs" />

          {/* ========== 区块 2：OTP ========== */}
          <Title order={4}>② 一次性验证码（OTP）</Title>

          <Box>
            <Text size="sm" fw={500} mb={4}>
              验证码 <Text component="span" c="red" size="sm">*</Text>
            </Text>
            <Text size="xs" c="dimmed" mb={8}>
              请输入发送到你手机的 6 位数字验证码（演示用：正确码为{" "}
              <Code>246810</Code>）。
            </Text>

            {/* PinInput 手动受控不走 getInputProps，外层 Box onBlur 冒泡捕获
                焦点离开，用 relatedTarget 排除 6 个 digit 之间切换的误触发 */}
            <Box
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  form.validateField("otp");
                }
              }}
            >
              <PinInput
                length={6}
                type="number"
                oneTimeCode
                size="md"
                gap="md"
                value={form.values.otp}
                onChange={(v) => form.setFieldValue("otp", v)}
                error={!!form.errors.otp}
              />
            </Box>
            {form.errors.otp && (
              <Text size="xs" c="red" mt={6}>
                {form.errors.otp}
              </Text>
            )}

            <Group mt="xs" gap="xs">
              <Text size="xs" c="dimmed">
                没收到？
              </Text>
              <Button size="xs" variant="subtle">
                重新发送（60s）
              </Button>
            </Group>
          </Box>

          <Divider my="xs" />

          {/* ========== 按钮 ========== */}
          <Group justify="space-between" mt="md">
            <Group>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  form.reset();
                  setUsernameFocused(false);
                  setPasswordFocused(false);
                  setUsernameTouched(false);
                  setPasswordTouched(false);
                }}
              >
                重置
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => form.clearErrors()}
              >
                清除错误
              </Button>
            </Group>
            <Button type="submit">提交注册</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

// =============================================================
// 主页面
// =============================================================
export default function MantineFormZodPage() {
  const [submitted, setSubmitted] = useState(null);
  const [opened, setOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(values);
    setOpened(true);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <div style={{ height: "100vh", overflowY: "auto" }}>
        <Container size="md" py="xl">
          <Stack>
            <Group justify="space-between" align="flex-start">
              <Box>
                <Title order={2}>Mantine Form + Zod 进阶 Demo</Title>
                <Text size="sm" c="dimmed" mt={4}>
                  聚焦用户名/密码字段可看到实时三色规则提示：灰色待校验 →
                  绿色通过 → 红色失败
                </Text>
              </Box>
            </Group>

            <Alert color="indigo" variant="light" title="用户名/密码规则提示演示">
              <Stack gap={4}>
                <Text size="xs">
                  • <Code>RuleHints</Code> 组件：三色圆形图标 + 文字
                </Text>
                <Text size="xs">
                  • 默认隐藏 → 聚焦时灰色 ✓ → 输入时绿色 ✓ / 红色 ✕
                </Text>
                <Text size="xs">
                  • 用户名 3 条规则、密码 3 条规则
                </Text>
                <Text size="xs">
                  • 规则状态实时根据 form.values 计算，不依赖 Zod 异步校验
                </Text>
                <Text size="xs">
                  • 密码第 3 条 &ldquo;Must be different from your Login Name&rdquo; 为跨字段校验
                </Text>
              </Stack>
            </Alert>

            {submitting && (
              <Alert color="blue" variant="light">
                正在提交...
              </Alert>
            )}

            <RegistrationForm onSubmit={handleSubmit} />

            {/* 提交结果弹窗 */}
            <Modal
              opened={opened}
              onClose={() => setOpened(false)}
              title="注册成功！"
              size="lg"
            >
              {submitted && (
                <Box>
                  <Text size="sm" mb="sm">
                    校验通过的数据：
                  </Text>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 12,
                      overflowX: "auto",
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(submitted, null, 2)}
                  </pre>
                </Box>
              )}
              <Button fullWidth mt="md" onClick={() => setOpened(false)}>
                关闭
              </Button>
            </Modal>
          </Stack>
        </Container>
      </div>
    </MantineProvider>
  );
}
