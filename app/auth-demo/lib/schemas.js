// =============================================================
// 文件：app/auth-demo/lib/schemas.js
// -------------------------------------------------------------
// 【职责】
//   集中定义本 Demo 所有用到的 Zod 校验 Schema。
//   Zod 的核心思想：用「schema（模式）」声明式描述数据形状，
//   然后拿数据去匹配。同一份 schema 既能给前端表单校验，
//   也能给后端 API 校验，还能用 z.infer 自动推导 TypeScript 类型。
//
// 【Zod v4 注意事项】
//   本项目使用 zod v4.4.3。v4 与 v3 的关键差异：
//   - 自定义错误消息：v3 用 { errorMap: () => ({ message: "..." }) }，
//     v4 改为第二个参数直接传字符串，或用 { error: "..." } 选项
//   - z.literal(true, "消息") 而非 z.literal(true, { errorMap: ... })
//   - 如果仍用旧的 errorMap 写法，自定义消息会被静默忽略
// =============================================================

import { z } from "zod";

// ============================================================
// 1. 登录 Schema
// ============================================================
// 用户名：至少 2 个字符
// 密码：至少 6 个字符（真实项目通常要求更复杂，这里简化）
export const loginSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(32, "用户名最多 32 个字符"),

  password: z
    .string()
    .min(6, "密码至少 6 个字符")
    .max(128, "密码最多 128 个字符"),
});

// ============================================================
// 2. OTP 验证码 Schema
// ============================================================
// 6 位数字验证码。用 regex 确保纯数字 + 固定 6 位。
// ^\d{6}$ 表示：开头到结尾必须是 6 个数字字符
export const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^\d{6}$/, "验证码必须是 6 位数字"),
});

// ============================================================
// 3. 注册 Schema
// ============================================================
// 注册表单需要更严格的校验：邮箱格式、密码强度、确认密码一致性
export const registerSchema = z
  .object({
    // 用户名：2-32 字符，只允许字母数字下划线
    // regex 第二个参数是校验失败时的错误消息
    username: z
      .string()
      .min(2, "用户名至少 2 个字符")
      .max(32, "用户名最多 32 个字符")
      .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),

    // 邮箱：Zod 内置 email 规则（含 @ 和域名结构）
    email: z
      .string()
      .min(1, "邮箱不能为空")
      .email("邮箱格式不正确"),

    // 密码：至少 8 位，必须包含字母和数字
    // 用 regex 做强度校验：(?=.*[a-zA-Z]) 确保含字母，(?=.*\d) 确保含数字
    password: z
      .string()
      .min(8, "密码至少 8 个字符")
      .max(128, "密码最多 128 个字符")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d).+$/,
        "密码必须包含字母和数字"
      ),

    // 确认密码：只需要是字符串，一致性校验用 refine 在对象层面做
    confirmPassword: z.string().min(1, "请确认密码"),

    // 同意条款：必须为 true
    // z.literal(true, "消息") —— Zod v4 直接传字符串作为错误消息
    agree: z.literal(true, "必须同意服务条款才能注册"),
  })
  // refine：在对象层面做跨字段校验
  // 这里校验两次输入的密码是否一致
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    // path 指定错误显示在哪个字段上（显示在 confirmPassword 输入框下方）
    path: ["confirmPassword"],
  });

// ============================================================
// 4. 忘记密码 Schema
// ============================================================
// 第一步：输入邮箱
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("邮箱格式不正确"),
});

// 第二步：重置密码（需要验证码 + 新密码 + 确认密码）
export const resetPasswordSchema = z
  .object({
    // 重置验证码：6 位数字
    code: z.string().regex(/^\d{6}$/, "验证码必须是 6 位数字"),

    // 新密码：与注册密码强度要求一致
    newPassword: z
      .string()
      .min(8, "密码至少 8 个字符")
      .max(128, "密码最多 128 个字符")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d).+$/,
        "密码必须包含字母和数字"
      ),

    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

// ============================================================
// 5. 修改密码 Schema（已登录用户）
// ============================================================
export const changePasswordSchema = z
  .object({
    // 当前密码：至少 1 个字符（不强制强度，因为旧密码可能是弱密码）
    currentPassword: z.string().min(1, "请输入当前密码"),

    // 新密码：强度要求与注册一致
    newPassword: z
      .string()
      .min(8, "新密码至少 8 个字符")
      .max(128, "新密码最多 128 个字符")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d).+$/,
        "新密码必须包含字母和数字"
      ),

    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  // 校验1：新密码不能与旧密码相同
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "新密码不能与当前密码相同",
    path: ["newPassword"],
  })
  // 校验2：两次输入的新密码一致
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

// ============================================================
// 6. 安全问题 Schema（KBA - Knowledge Based Authentication）
// ============================================================
// 安全问题用于账户恢复验证。用户需要设置 2-3 个安全问题及答案。
export const securityQuestionsSchema = z.object({
  // 问题1：从预定义列表中选择
  question1: z.string().min(1, "请选择安全问题 1"),
  // 答案1：至少 2 个字符
  answer1: z.string().min(2, "答案至少 2 个字符").max(100, "答案最多 100 个字符"),

  question2: z.string().min(1, "请选择安全问题 2"),
  answer2: z.string().min(2, "答案至少 2 个字符").max(100, "答案最多 100 个字符"),

  // 校验两个问题不能相同 —— 用 refine 在对象层面做
}).refine((data) => data.question1 !== data.question2, {
  message: "两个安全问题不能相同",
  path: ["question2"],
});

// 安全问题验证 Schema（用于账户恢复时验证答案）
export const verifySecurityQuestionsSchema = z.object({
  answer1: z.string().min(1, "请输入答案"),
  answer2: z.string().min(1, "请输入答案"),
});

// ============================================================
// 7. 个人资料 Schema
// ============================================================
export const profileSchema = z.object({
  // 显示名：1-50 字符
  displayName: z
    .string()
    .min(1, "显示名不能为空")
    .max(50, "显示名最多 50 个字符"),

  // 邮箱
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("邮箱格式不正确"),

  // 手机号：可选，但填了必须是有效格式
  // .optional() 表示字段可以不存在；如果存在则走前面的校验
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号")
    .optional()
    .or(z.literal("")),

  // 个人简介：可选，最多 500 字
  bio: z.string().max(500, "简介最多 500 字").optional(),
});

// ============================================================
// 8. 双因素认证（2FA）设置 Schema
// ============================================================
export const twoFactorSetupSchema = z.object({
  // 验证码：6 位数字
  verificationCode: z
    .string()
    .regex(/^\d{6}$/, "验证码必须是 6 位数字"),

  // 是否信任此设备（30 天内免验证）
  trustDevice: z.boolean(),
});
