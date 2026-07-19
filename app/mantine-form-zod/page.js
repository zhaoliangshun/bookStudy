"use client";

// =============================================================
// 文件：app/mantine-form-zod/page.js
// 路由：/mantine-form-zod
// -------------------------------------------------------------
// 【一句话职责】
//   用一个「用户注册表单」综合演示 Mantine Form 与 Zod 校验的【进阶用法】，
//   重点演示用户名/密码字段的【实时规则提示条】（RuleHints）组件：
//   默认隐藏 → 聚焦时灰色条款 → 输入时实时变绿✓/红✕。
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

import { MantineProvider, createTheme } from "@mantine/core";

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

import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Divider,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Checkbox,
  PinInput,
  Button,
  Box,
  Code,
  Alert,
  Modal,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";

import { useForm, schemaResolver } from "@mantine/form";
import { z } from "zod";

// =============================================================
// 规则定义：用户名和密码的校验规则
// -------------------------------------------------------------
// 每条规则包含：
//   id     : 唯一标识
//   label  : 显示文案（与截图一致，英文）
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
// -------------------------------------------------------------
// 【视觉设计（对照截图）】
//   · 每条规则由一个【圆形图标】+ 【文字】组成
//   · 圆形直径约 26px，白色图标居中
//   · 三种状态：
//     - pending（待校验）：灰色圆 #9ca3af + 白色 ✓ + 灰色文字
//     - pass（通过）    ：绿色圆 #22c55e + 白色 ✓ + 绿色文字
//     - fail（失败）    ：红色圆 #ef4444 + 白色 ✕ + 红色文字
//
// 【Props】
//   rules        : 规则数组（见上方 usernameRules / passwordRules）
//   value        : 当前输入值
//   data         : 整个表单 values（跨字段校验用，比如密码要读 username）
//   visible      : 是否显示
//   forceValidate: 失焦后为 true，此时跳过 pending 状态，直接判定 pass/fail
//                  （避免空字段失焦后仍显示灰色待校验的 bug）
// =============================================================
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
        const colors = {
          pending: { bg: "#9ca3af", text: "#9ca3af" },
          pass: { bg: "#22c55e", text: "#16a34a" },
          fail: { bg: "#ef4444", text: "#dc2626" },
        };
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
                backgroundColor: colors[status].bg,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {icon}
            </span>
            {/* 规则文字：支持多行换行（p_chars 文案很长） */}
            <Text size="sm" c={colors[status].text} style={{ lineHeight: 1.5 }}>
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

    // ---- email：邮箱 ----
    email: z
      .string()
      .min(1, "邮箱不能为空")
      .email("邮箱格式不正确")
      .transform((v) => v.trim().toLowerCase()),

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

    // ---- age：年龄 ----
    age: z.coerce
      .number()
      .int("年龄必须是整数")
      .min(18, "必须年满 18 岁")
      .max(150, "年龄不合理"),

    // ---- website：个人网站（可选）----
    website: z.string().url("URL 格式不正确").optional().or(z.literal("")),

    // ---- address：地址（嵌套对象）----
    address: z.object({
      province: z.string().min(1, "请填写省份"),
      city: z.string().min(1, "请填写城市"),
      zip: z.string().regex(/^\d{6}$/, "邮编必须是 6 位数字"),
    }),

    // ---- tags：标签数组 ----
    tags: z
      .array(z.string().min(1, "标签不能为空").max(10, "单个标签最多 10 字"))
      .max(5, "最多添加 5 个标签"),

    // ---- notification：通知偏好（discriminatedUnion）----
    notification: z.discriminatedUnion("method", [
      z.object({
        method: z.literal("email"),
        notifyEmail: z
          .string()
          .min(1, "请填写通知邮箱")
          .email("邮箱格式不正确"),
      }),
      z.object({
        method: z.literal("sms"),
        phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
      }),
      z.object({
        method: z.literal("none"),
      }),
    ]),

    // ---- agree：同意条款 ----
    agree: z.literal(true, "必须同意服务条款才能注册"),

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
  // ---- superRefine：跨字段校验 ----
  // 只保留 2 条：密码=确认密码、密码≠用户名
  .superRefine((data, ctx) => {
    // 规则 A：两次密码一致
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "两次输入的密码不一致",
      });
    }

    // 规则 B（截图第 3 条）：密码必须与登录名不同
    // 用户名 ≥ 3 字符才检查，避免空串或太短的用户名误命中
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
  email: "",
  password: "",
  confirmPassword: "",
  age: 18,
  website: "",
  address: { province: "", city: "", zip: "" },
  tags: [],
  notification: { method: "none" },
  agree: false,
  otp: "",
};

// =============================================================
// 主题切换
// =============================================================
function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        主题:
      </Text>
      <Button
        size="xs"
        variant={colorScheme === "light" ? "filled" : "subtle"}
        onClick={() => setColorScheme("light")}
      >
        ☀️ 亮色
      </Button>
      <Button
        size="xs"
        variant={colorScheme === "dark" ? "filled" : "subtle"}
        onClick={() => setColorScheme("dark")}
      >
        🌙 暗色
      </Button>
    </Group>
  );
}

// =============================================================
// 注册表单组件
// =============================================================
function RegistrationForm({ onSubmit }) {
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    validateInputOnBlur: true,
    // username/password 不列入 onChange 校验：
    //   · RuleHints 组件已经提供同步实时反馈（绿✓/红✕）
    //   · 这两个字段含异步 refine（用户名查重），onChange 触发会导致
    //     每次按键都发异步请求，有竞态风险
    //   · 失焦时 validateInputOnBlur 会跑完整校验（含异步），
    //     此时 form.errors 更新 → 红色边框出现
    // confirmPassword 也只在失焦时校验一致性
    // otp 含异步后端校验，不做 onChange
    validateInputOnChange: [
      "email",
      "age",
      "website",
      "address.province",
      "address.city",
      "address.zip",
      "tags.__MANTINE_FORM_INDEX__",
      "notification.method",
      "notification.notifyEmail",
      "notification.phone",
      "agree",
    ],
  });

  // ---- 聚焦 + touched 状态：控制 RuleHints 的显示/隐藏 ----
  // 【为什么需要 touched】
  //   旧逻辑仅用 focused + form.errors 控制可见性，会导致失焦时闪烁：
  //   onBlur → setFocused(false) → 重渲染（此时异步校验尚未完成，errors 为空）→ 规则条消失
  //   → 校验完成 → errors 被设置 → 再次重渲染 → 规则条重新出现 = 闪烁。
  //
  //   新逻辑引入 touched（一旦失焦就变为 true，不再复位）：
  //   - 默认隐藏（从未聚焦/交互过）
  //   - 聚焦时：显示，pending 态为灰色
  //   - 失焦后（touched=true）：只要字段有值或有错误就显示
  //   - 失焦后空字段：显示红色错误（通过 forceValidate 跳过 pending 态）
  //   - 失焦后合法值：保持显示绿色对勾（给用户确认反馈）
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // 规则条显示条件（消除闪烁的核心逻辑）：
  //   1. 正在聚焦 → 始终显示
  //   2. 已经 touch 过 且（有值 或 有错误）→ 显示
  //      （空值 + 无错误的情况：首次加载或重置时，不显示；失焦空值必有 min 错误，会显示）
  const usernameHintsVisible =
    usernameFocused ||
    (usernameTouched &&
      (form.values.username.length > 0 || !!form.errors.username));
  const passwordHintsVisible =
    passwordFocused ||
    (passwordTouched &&
      (form.values.password.length > 0 || !!form.errors.password));

  // forceValidate：失焦后为 true，此时不再显示灰色 pending，直接判定 pass/fail
  // （空字段失焦后应显示红色✕而非灰色✓）
  const usernameForceValidate = usernameTouched && !usernameFocused;
  const passwordForceValidate = passwordTouched && !passwordFocused;

  return (
    <Paper p="lg" withBorder shadow="sm">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {/* ========== 区块 1：基础信息 ========== */}
          <Title order={4}>① 基础信息</Title>

          {/* ---- username + RuleHints ----
              ⚠️【error 覆盖为布尔值】
                 getInputProps 返回的 error 是字符串（错误消息），
                 会在输入框下方显示红字，与 RuleHints 视觉重复。
                 这里用 error={!!form.errors.username} 覆盖，
                 只保留红色边框（截图3中有红边框），不显示下方红字。
                 错误信息完全由 RuleHints 的红✕+红字承担。 */}
          <Box>
            <TextInput
              label="Login Name"
              placeholder="8-15 characters, letters and numbers"
              withAsterisk
              {...form.getInputProps("username")}
              error={!!form.errors.username}
              onFocus={(e) => {
                setUsernameFocused(true);
                form.getInputProps("username").onFocus?.(e);
              }}
              onBlur={(e) => {
                // 先触发 Mantine 的失焦校验，再更新本地状态
                // touched 置为 true 后，规则条不会因 focused=false 而消失，
                // 从而彻底消除"消失一下再出现"的闪烁
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

          {/* ---- email ---- */}
          <TextInput
            label="邮箱"
            placeholder="user@example.com"
            withAsterisk
            description="提交时会自动去除空格并转小写"
            {...form.getInputProps("email")}
          />

          {/* ---- password + RuleHints ----
              同样覆盖 error 为布尔值，只保留红色边框，红字由 RuleHints 承担 */}
          <Box>
            <PasswordInput
              label="Group Password"
              placeholder="8-20 characters, include A-Z, a-z, 0-9, special chars"
              withAsterisk
              {...form.getInputProps("password")}
              error={!!form.errors.password}
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
          />

          <Divider my="xs" />

          {/* ========== 区块 2：个人信息 ========== */}
          <Title order={4}>② 个人信息</Title>

          <NumberInput
            label="年龄"
            withAsterisk
            min={0}
            max={150}
            description="必须 18 岁以上"
            {...form.getInputProps("age")}
          />

          <TextInput
            label="个人网站（可选）"
            placeholder="https://example.com"
            description="留空或填合法 URL"
            {...form.getInputProps("website")}
          />

          <Divider my="xs" />

          {/* ========== 区块 3：地址 ========== */}
          <Title order={4}>③ 地址信息</Title>

          <Group grow>
            <TextInput
              label="省份"
              placeholder="如：广东省"
              withAsterisk
              {...form.getInputProps("address.province")}
            />
            <TextInput
              label="城市"
              placeholder="如：深圳市"
              withAsterisk
              {...form.getInputProps("address.city")}
            />
          </Group>
          <TextInput
            label="邮编"
            placeholder="6 位数字"
            withAsterisk
            {...form.getInputProps("address.zip")}
          />

          <Divider my="xs" />

          {/* ========== 区块 4：标签 ========== */}
          <Title order={4}>④ 兴趣标签（最多 5 个）</Title>

          {form.values.tags.map((_, i) => (
            <Group key={i} grow>
              <TextInput
                placeholder={"标签 " + (i + 1) + "（1~10 字符）"}
                {...form.getInputProps("tags." + i)}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                size="lg"
                onClick={() => form.removeListItem("tags", i)}
                aria-label="删除标签"
              >
                ✕
              </ActionIcon>
            </Group>
          ))}

          <Button
            variant="light"
            size="xs"
            disabled={form.values.tags.length >= 5}
            onClick={() => form.insertListItem("tags", "")}
          >
            + 添加标签
          </Button>

          <Divider my="xs" />

          {/* ========== 区块 5：通知偏好 ========== */}
          <Title order={4}>⑤ 通知偏好</Title>

          <Select
            label="通知方式"
            data={[
              { value: "email", label: "📧 邮件通知" },
              { value: "sms", label: "📱 短信通知" },
              { value: "none", label: "🔕 不通知" },
            ]}
            {...form.getInputProps("notification.method")}
            onChange={(v) => {
              form.setFieldValue("notification", { method: v });
            }}
          />

          {form.values.notification.method === "email" && (
            <TextInput
              label="通知邮箱"
              placeholder="notify@example.com"
              withAsterisk
              {...form.getInputProps("notification.notifyEmail")}
            />
          )}
          {form.values.notification.method === "sms" && (
            <TextInput
              label="手机号"
              placeholder="11 位手机号"
              withAsterisk
              {...form.getInputProps("notification.phone")}
            />
          )}
          {form.values.notification.method === "none" && (
            <Text size="xs" c="dimmed">
              已选择&ldquo;不通知&rdquo;，无需额外信息。
            </Text>
          )}

          <Divider my="xs" />

          {/* ========== 区块 6：OTP ========== */}
          <Title order={4}>⑥ 一次性验证码（OTP）</Title>

          <Box>
            <Text size="sm" fw={500} mb={4}>
              验证码 <Text component="span" c="red" size="sm">*</Text>
            </Text>
            <Text size="xs" c="dimmed" mb={8}>
              请输入发送到你手机/邮箱的 6 位数字验证码（演示用：正确码为{" "}
              <Code>246810</Code>）。
            </Text>

            {/* PinInput 使用手动受控模式（value/onChange），不走 getInputProps，
                所以 validateInputOnBlur 不会自动生效。
                外层 Box 的 onBlur 利用事件冒泡捕获 PinInput 内部 input 的 blur，
                再用 currentTarget.contains(relatedTarget) 判断焦点是否真正离开了
                整个 PinInput 区域（排除 6 个 digit 之间切换焦点的情况） */}
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

          {/* ========== 区块 7：同意条款 + 按钮 ========== */}
          <Checkbox
            label="我已阅读并同意《服务条款》和《隐私政策》"
            {...form.getInputProps("agree", { type: "checkbox" })}
            onBlur={() => {}}
          />

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
              <ThemeSwitcher />
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
                  • 用户名 3 条规则、密码 3 条规则（与截图一致）
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
                    校验通过并 transform 后的数据：
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
