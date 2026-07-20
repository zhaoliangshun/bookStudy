"use client";

// =============================================================
// 文件：app/betting-activation/page.js
// 路由：/betting-activation
// -------------------------------------------------------------
// 【一句话职责】
//   根据设计图一比一还原「Group Account Activation（集团账户激活）」
//   流程的第一步 —— Account Activation（账户激活登录页）。
//
// 【页面结构】（从上到下）
//   ① Logo 区域：品牌 Logo 方块 + "API" 大标题
//   ② 页面标题："Group Account Activation"
//   ③ 描述文字：Lorem ipsum 占位文本
//   ④ 步骤指示器（StepIndicator）：4 步横向进度条
//      - Step 1: Account Activation（当前激活步，蓝色实心+白点牛眼效果）
//      - Step 2: SMS Verification（深灰实心圆，灰色文字）
//      - Step 3: Group Account（深灰实心圆，灰色文字）
//      - Step 4: Key Generation（深灰实心圆，灰色文字）
//   ⑤ 分区标题："Login [小Logo] Account"
//   ⑥ 表单字段：
//      - Account Number（账号）：锁图标+标签，8位纯数字，失焦校验
//      - Security PIN（安全PIN）：密码输入框，内置眼睛图标切换显示/隐藏
//   ⑦ "Next" 按钮：胶囊圆角，表单无效时灰色禁用，有效时海军蓝可点击
//   ⑧ 底部文字："support helpdesk contact information"
//
// 【错误状态】（设计图 2）
//   - Account Number 输入非法值（如10位数字"8812381235"）失焦后：
//     → 输入框边框变红 (#dc2626)、输入文字变红、下方红色错误提示
//     → 错误消息："Invalid Account Number. Please try again."
//   - Security PIN 未触碰时不显示错误
//   - Next 按钮保持灰色禁用（直到两个字段均为 8 位纯数字）
//
// 【技术栈】
//   - Next.js 16 (App Router, "use client" 客户端组件)
//   - React 19
//   - @mantine/core ^9.4.1（UI 组件库）
//   - @mantine/form ^9.4.1（表单状态管理）
//   - zod ^4.4.3（声明式校验 Schema，用 safeParse 同步校验）
//
// 【配色方案】（严格对齐设计图取色）
//   - 主色（海军蓝）  : #1a365d  → 标题、激活步骤圆点/文字、Logo、启用按钮
//   - 默认边框       : #888888  → 输入框默认边框（设计图中灰色边框）
//   - 错误红         : #d32f2f  → 错误边框、错误文字、错误时输入文字
//   - 按钮禁用灰     : #aaaaaa  → Next 按钮禁用态背景
//   - 步骤连接线灰   : #bbbbbb  → 步骤之间的水平连接线
//   - 未激活步骤圆   : #333333  → 未激活步骤圆点（深近乎黑）
//   - 未激活文字灰   : #666666  → 未激活步骤标签文字
//   - 占位符灰       : #999999  → 输入框 placeholder 颜色
//   - 正文黑         : #1a1a1a  → 正文/标签/描述文字
// =============================================================

import "@mantine/core/styles.css";

import { useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import {
  MantineProvider,
  createTheme,
  Container,
  Title,
  Text,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Button,
  Box,
} from "@mantine/core";

// =============================================================
// 设计系统常量（颜色、尺寸统一管理，便于维护和对齐设计图）
// =============================================================
const NAVY = "#1a365d";
const NAVY_HOVER = "#142d4f";
const BORDER_GRAY = "#888888";
const ERROR_RED = "#d32f2f";
const BTN_DISABLED_GRAY = "#aaaaaa";
const STEP_LINE_GRAY = "#bbbbbb";
const STEP_DOT_INACTIVE = "#333333";
const STEP_LABEL_INACTIVE = "#666666";
const PLACEHOLDER_GRAY = "#999999";
const TEXT_BLACK = "#1a1a1a";
const LOCK_ICON_GRAY = "#777777";

// =============================================================
// 自定义 Mantine 主题
// -------------------------------------------------------------
// 注册海军蓝为自定义主色板，设置字体和默认圆角。
// 注意：输入框样式不通过全局 components 覆盖（因为需要根据错误
// 状态动态切换边框/文字颜色），而是在每个组件的 styles prop 中
// 根据错误状态动态传入。
// =============================================================
const theme = createTheme({
  colors: {
    navy: [
      "#eef2f7", // 0
      "#d0dceb", // 1
      "#a2b9d6", // 2
      "#7496c1", // 3
      "#4a75ad", // 4
      "#2d5694", // 5
      "#1e4278", // 6
      NAVY,      // 7 ← 主色
      NAVY_HOVER,// 8
      "#0f2340", // 9
    ],
  },
  primaryColor: "navy",
  primaryShade: 7,
  autoContrast: true,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});

// =============================================================
// 步骤数据定义
// -------------------------------------------------------------
// 4 个激活步骤，label 使用 \n 分隔两行文字（如 "Account\nActivation"），
// 渲染时 split 为两个 <Text> 元素实现两行排版。
// =============================================================
const STEPS = [
  { id: 1, label: "Account\nActivation" },
  { id: 2, label: "SMS\nVerification" },
  { id: 3, label: "Group\nAccount" },
  { id: 4, label: "Key\nGeneration" },
];

// =============================================================
// Zod Schema：表单校验规则
// -------------------------------------------------------------
// Account Number 规则：
//   1. 不能为空（min 1）
//   2. 必须是纯数字（regex /^\d+$/）
//   3. 长度必须恰好为 8 位（length 8）
//   → 任何一条不满足均返回设计图指定的错误消息
//
// Security PIN 规则：
//   1. 不能为空
//   2. 必须是纯数字
//   3. 长度必须恰好为 8 位
// =============================================================
const accountNumberSchema = z
  .string()
  .min(1)
  .regex(/^\d+$/)
  .length(8);

const securityPinSchema = z
  .string()
  .min(1)
  .regex(/^\d+$/)
  .length(8);

const formSchema = z.object({
  accountNumber: accountNumberSchema,
  securityPin: securityPinSchema,
});

// 设计图指定的 Account Number 错误消息
const ACCOUNT_ERROR_MSG = "Invalid Account Number. Please try again.";

// =============================================================
// 工具函数：校验单个字段，返回错误消息字符串或 null
// -------------------------------------------------------------
// 使用 Zod 的 safeParse 同步校验，不走异步，确保失焦时即时反馈。
// 对于空值（用户还没输入），返回 null 表示"暂无错误"（不显示红色），
// 这符合设计图2的行为：Security PIN 未触碰时不显示错误。
// =============================================================
function validateAccountNumber(value) {
  if (!value) return null; // 空值不报错（placeholder 状态）
  const result = accountNumberSchema.safeParse(value);
  if (result.success) return null;
  return ACCOUNT_ERROR_MSG;
}

function validateSecurityPin(value) {
  if (!value) return null;
  const result = securityPinSchema.safeParse(value);
  if (result.success) return null;
  return "Invalid Security PIN. Please try again.";
}

// =============================================================
// StepIndicator 组件：4步横向进度指示器
// -------------------------------------------------------------
// 布局结构：
//   - 外层容器（py=24 控制上下间距）
//   - 圆点行：relative 容器内包含一条绝对定位的灰色横线，
//     以及 4 个 flex 等距分布的圆点（zIndex 高于横线，遮盖线的穿过部分）
//   - 标签行：圆点下方 12px，4 列等宽，每列文字居中两行排列
//
// 激活步样式：
//   - 圆点：海军蓝实心圆（20px），中心叠加 8px 白色实心圆（牛眼效果）
//   - 标签：海军蓝、font-weight 700（粗体）
// 未激活步样式：
//   - 圆点：#333 深灰实心圆（20px）
//   - 标签：#666 灰色、font-weight 400（常规）
// =============================================================
function StepIndicator({ currentStep = 1 }) {
  return (
    <Box py={28}>
      {/* ---- 圆点 + 连接线行 ---- */}
      <Box pos="relative" px={10}>
        {/* 水平连接线：绝对定位，位于圆点中心高度（top=10，圆点半径10px） */}
        <Box
          pos="absolute"
          top={10}
          left={10}
          right={10}
          h={1.5}
          bg={STEP_LINE_GRAY}
        />

        {/* 4 个圆点：flex space-between 等距分布 */}
        <Group justify="space-between" gap={0} pos="relative">
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            return (
              <Box key={step.id} style={{ textAlign: "center", zIndex: 1 }}>
                <Box
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: isActive ? NAVY : STEP_DOT_INACTIVE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  {/* 激活步中心的白色小圆点（牛眼/靶心效果） */}
                  {isActive && (
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Group>
      </Box>

      {/* ---- 标签文字行（圆点下方）---- */}
      <Group justify="space-between" gap={0} mt={14}>
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          return (
            <Box key={step.id} style={{ textAlign: "center", flex: 1 }}>
              {step.label.split("\n").map((line, i) => (
                <Text
                  key={i}
                  size="lg"
                  fw={isActive ? 700 : 400}
                  c={isActive ? NAVY : STEP_LABEL_INACTIVE}
                  lh={1.35}
                >
                  {line}
                </Text>
              ))}
            </Box>
          );
        })}
      </Group>
    </Box>
  );
}

// =============================================================
// LockIcon 组件：Account Number 标签前的小挂锁图标
// -------------------------------------------------------------
// 设计图中 Account Number 标签前有一把灰色小挂锁图标。
// 使用简洁的填充式 SVG 挂锁，清晰可辨，颜色通过 color prop 控制。
// =============================================================
function LockIcon({ size = 18, color = LOCK_ICON_GRAY }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 4 }}
    >
      {/* 锁身（圆角矩形） */}
      <rect x="4" y="10" width="16" height="11" rx="2" />
      {/* 锁梁（U 形，半圆弧+两竖线，闭合挂锁） */}
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// =============================================================
// EyeSlashIcon 组件：Security PIN 右侧的"眼睛+斜线"图标
// -------------------------------------------------------------
// 设计图中 Security PIN 输入框右侧显示一个带斜线的眼睛图标，
// 表示密码当前为隐藏/掩码状态。使用简洁清晰的 SVG 路径绘制。
// =============================================================
function EyeSlashIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={PLACEHOLDER_GRAY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 眼球（中心圆点） */}
      <circle cx="12" cy="12" r="2.5" />
      {/* 眼睛外轮廓：上弧线 + 下弧线（杏仁形） */}
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      {/* 斜线（从左上到右下，斜划穿过眼睛，表示隐藏） */}
      <line x1="2" y1="2" x2="22" y2="22" strokeWidth={2.2} />
    </svg>
  );
}

// =============================================================
// LogoWordmark 组件：品牌 Logo
// -------------------------------------------------------------
// 设计图中 Logo 区域经过像素化处理，无法提取原始 Logo 图形。
// 根据 Figma 文件名 "Betting-API_to_IT" 推断为博彩 API 品牌，
// 此处使用一个带渐变的品牌方块（内含字母 B）+ "API" 大标题
// 作为 Logo 占位。
//
// size="large" → 页面顶部大 Logo（56px 方块 + 48px "API"）
// size="small" → 分区标题中的小 Logo（36px 方块，"Login [B] Account"）
// =============================================================
function LogoWordmark({ size = "large" }) {
  if (size === "small") {
    return (
      <Box
        component="span"
        style={{
          display: "inline-flex",
          alignItems: "center",
          margin: "0 6px",
          verticalAlign: "middle",
        }}
      >
        <Box
          style={{
            width: 32,
            height: 26,
            background: `linear-gradient(135deg, ${NAVY} 0%, #2d5694 100%)`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="xs" fw={900} c="white" lh={1}>
            B
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Group gap={14} align="center" wrap="nowrap">
      <Box
        style={{
          width: 60,
          height: 48,
          background: `linear-gradient(145deg, ${NAVY} 0%, #2b528a 50%, #1e4278 100%)`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text size="xl" fw={900} c="white" lh={1}>
          B
        </Text>
      </Box>
      <Text
        size={52}
        fw={800}
        lh={1}
        c={NAVY}
        style={{ letterSpacing: "-1.5px" }}
      >
        API
      </Text>
    </Group>
  );
}

// =============================================================
// 表单初始值（两个字段均为空字符串）
// =============================================================
const initialValues = {
  accountNumber: "",
  securityPin: "",
};

// =============================================================
// ActivationForm 组件：账户激活登录表单
// -------------------------------------------------------------
// 【校验策略】
//   - 不依赖 Mantine form 的 schemaResolver/validate 机制做 blur 校验
//     （因为 v9 的 schemaResolver 默认异步，blur 校验反馈不及时）
//   - 手动管理 touched 状态（accountTouched/securityTouched）：
//     · 初始 false → 不显示任何错误
//     · 失焦（onBlur）时设为 true → 开始显示该字段的校验结果
//   - 使用 Zod safeParse 同步实时校验输入值：
//     · 错误状态驱动边框变红、文字变红、错误消息显示
//     · 全表单通过校验时 Next 按钮变蓝可点击
//
// 【按钮状态逻辑】
//   - 两个字段均通过 Zod 校验 → 海军蓝背景白字，可点击
//   - 任一字段未通过校验 → 灰色背景白字，disabled
//   - 始终为全宽胶囊圆角（borderRadius: 9999px）
// =============================================================
function ActivationForm() {
  const form = useForm({
    initialValues,
  });

  // ---- touched 状态：标记字段是否被"触碰过"（失焦过）----
  // 只有 touched=true 的字段才显示错误红框/红字/错误消息，
  // 避免用户正在输入时就弹错（符合设计图交互）。
  const [accountTouched, setAccountTouched] = useState(false);
  const [securityTouched, setSecurityTouched] = useState(false);

  // ---- 密码可见性状态（控制 Security PIN 显示明文/掩码）----
  const [pinVisible, setPinVisible] = useState(false);

  // ---- 同步校验：根据当前值计算各字段的错误消息 ----
  // 使用 Zod safeParse（同步），不依赖 form.errors，确保即时响应。
  const accountError = accountTouched
    ? validateAccountNumber(form.values.accountNumber)
    : null;
  const securityError = securityTouched
    ? validateSecurityPin(form.values.securityPin)
    : null;

  // ---- 全表单校验：两个字段均合法时为 true ----
  const isFormValid = formSchema.safeParse(form.values).success;

  // ---- 提交处理 ----
  const handleSubmit = useCallback((values) => {
    // 提交时强制将两个字段标记为 touched（以便显示所有错误）
    setAccountTouched(true);
    setSecurityTouched(true);

    const result = formSchema.safeParse(values);
    if (!result.success) return;

    // 校验通过，模拟提交（真实场景应调用后端 API）
    console.log("Activation form submitted:", values);
    alert(
      `Account Number: ${values.accountNumber}\nSecurity PIN: ${values.securityPin}\n\nProceeding to SMS Verification step...`
    );
  }, []);

  // ---- 计算输入框动态样式 ----
  const hasAccountError = !!accountError;
  const hasSecurityError = !!securityError;

  // 通用输入框样式（根据是否错误动态调整边框和文字颜色）
  const getInputStyle = (hasError) => ({
    borderColor: hasError ? ERROR_RED : BORDER_GRAY,
    borderWidth: "2px",
    fontSize: 18,
    padding: "14px 16px",
    height: 56,
    lineHeight: "28px",
    borderRadius: 8,
    color: hasError ? ERROR_RED : TEXT_BLACK,
    caretColor: hasError ? ERROR_RED : NAVY,
    transition: "border-color 0.15s ease",
    "&::placeholder": {
      color: PLACEHOLDER_GRAY,
    },
    "&:focus": {
      borderColor: hasError ? ERROR_RED : NAVY,
      outline: "none",
    },
  });

  const labelStyle = (hasError) => ({
    fontSize: 20,
    fontWeight: 400,
    color: hasError ? ERROR_RED : TEXT_BLACK,
    marginBottom: 6,
  });

  const errorStyle = {
    fontSize: 16,
    color: ERROR_RED,
    fontWeight: 400,
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap={28}>
        {/* ========== Account Number 字段 ========== */}
        {/* 设计图规格：
            - 标签含锁图标 + "Account Number" 文字
            - 错误时标签/锁图标/边框/输入文字/错误消息全部变红
            - 错误消息位于输入框正下方，红色文字 */}
        <Box>
          <TextInput
            label={
              <Group gap={2} wrap="nowrap" align="center">
                <LockIcon size={18} color={hasAccountError ? ERROR_RED : LOCK_ICON_GRAY} />
                <span>Account Number</span>
              </Group>
            }
            placeholder="12345678"
            type="text"
            value={form.values.accountNumber}
            onChange={(e) => {
              // 只允许输入数字（过滤非数字字符）
              const raw = e.target.value.replace(/\D/g, "");
              form.setFieldValue("accountNumber", raw);
            }}
            onBlur={() => setAccountTouched(true)}
            error={accountError}
            maxLength={10}
            inputMode="numeric"
            styles={{
              input: getInputStyle(hasAccountError),
              label: labelStyle(hasAccountError),
              error: errorStyle,
            }}
          />
        </Box>

        {/* ========== Security PIN 字段 ========== */}
        {/* 设计图规格：
            - 标签 "Security PIN"（无锁图标）
            - 右侧有眼睛斜线图标（密码隐藏状态，点击切换显示）
            - 使用自定义可见性按钮（斜线眼/睁眼图标）
            - 密码掩码（圆点显示）*/}
        <Box>
          <PasswordInput
            label="Security PIN"
            placeholder="12345678"
            value={form.values.securityPin}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              form.setFieldValue("securityPin", raw);
            }}
            onBlur={() => setSecurityTouched(true)}
            error={securityError}
            maxLength={10}
            inputMode="numeric"
            visible={pinVisible}
            onVisibilityChange={setPinVisible}
            visibilityToggleIcon={() => <EyeSlashIcon />}
            styles={{
              input: {
                ...getInputStyle(hasSecurityError),
                paddingRight: "52px",
              },
              label: labelStyle(hasSecurityError),
              error: errorStyle,
              innerInput: {
                fontSize: 18,
                height: "100%",
                color: hasSecurityError ? ERROR_RED : TEXT_BLACK,
              },
              visibilityToggle: {
                color: PLACEHOLDER_GRAY,
                right: 12,
              },
            }}
          />
        </Box>

        {/* ========== Next 按钮 ========== */}
        {/* 设计图规格：
            - 全宽（fullWidth）、胶囊圆角（borderRadius: 9999px）
            - 高度约 60px
            - 禁用态：#aaaaaa 灰色背景，白色 "Next" 文字，不可点击
            - 启用态：#1a365d 海军蓝背景，白色 "Next" 文字，可点击
            - hover（启用态）：颜色加深至 #142d4f
            - 文字居中，字号约 22px，字重 500 */}
        <Button
          type="submit"
          fullWidth
          disabled={!isFormValid}
          style={{
            height: 64,
            borderRadius: 9999,
            fontSize: 24,
            fontWeight: 500,
            backgroundColor: isFormValid ? NAVY : BTN_DISABLED_GRAY,
            color: "#ffffff",
            border: "none",
            cursor: isFormValid ? "pointer" : "not-allowed",
            transition: "background-color 0.2s ease",
            marginTop: 4,
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            if (isFormValid) e.currentTarget.style.backgroundColor = NAVY_HOVER;
          }}
          onMouseLeave={(e) => {
            if (isFormValid) e.currentTarget.style.backgroundColor = NAVY;
          }}
        >
          Next
        </Button>
      </Stack>
    </form>
  );
}

// =============================================================
// 主页面组件（默认导出）
// -------------------------------------------------------------
// 页面为纯客户端组件（"use client"），使用 MantineProvider 包裹
// 并注入自定义海军蓝主题，强制 light 模式（设计图为白色背景）。
//
// 布局：
//   - 外层 Box：白色背景，最小高度 100vh，上下 padding 48px
//   - Container：max-width 640px，水平居中，左右 padding 36px
//   - Stack：垂直排列各区块，gap=0（间距通过各元素 mt/mb 精确控制）
// =============================================================
export default function BettingActivationPage() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Box
        style={{
          // 全局 CSS 中 html/body 设了 overflow: hidden，
          // 这里让页面容器自身可滚动，避免影响主应用的全局样式。
          height: "100vh",
          overflowY: "auto",
          backgroundColor: "#ffffff",
          paddingTop: 48,
          paddingBottom: 48,
        }}
      >
        <Container size={640} px={36}>
          <Stack gap={0}>
            {/* ① Logo 区域：品牌方块 + "API" 大字 */}
            <LogoWordmark size="large" />

            {/* ② 页面标题 */}
            <Title
              order={1}
              size={32}
              fw={700}
              c={NAVY}
              mt={24}
              lh={1.3}
            >
              Group Account Activation
            </Title>

            {/* ③ 描述文字（Lorem ipsum 占位文本） */}
            <Text size="lg" c={TEXT_BLACK} mt={14} lh={1.6} style={{ fontSize: 18 }}>
              Lorem ipsum dolor sit amet, adipiscing elit. Nullam sollicitudin
              orci vel diam pellentesque aliquet.
            </Text>

            {/* ④ 4步进度指示器（当前在第1步） */}
            <StepIndicator currentStep={1} />

            {/* ⑤ 分区标题 "Login [小Logo] Account" */}
            <Group gap={0} align="center" mt={4} mb={28}>
              <Text size={28} fw={700} c={NAVY} lh={1.3}>
                Login
              </Text>
              <LogoWordmark size="small" />
              <Text size={28} fw={700} c={NAVY} lh={1.3}>
                Account
              </Text>
            </Group>

            {/* ⑥ 表单区域 */}
            <ActivationForm />

            {/* ⑧ 底部帮助/客服联系信息 */}
            <Text
              size="lg"
              c={TEXT_BLACK}
              mt={44}
              style={{ fontSize: 20 }}
            >
              support helpdesk contact information
            </Text>
          </Stack>
        </Container>
      </Box>
    </MantineProvider>
  );
}
