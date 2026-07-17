"use client";
// =============================================================
// 文件：app/auth-demo/components/ForgotPasswordFlow.jsx
// -------------------------------------------------------------
// 【整体职责】
//   忘记密码流程组件。引导用户通过"邮箱验证 → 重置密码"两步
//   完成密码重置，底层调用 @forgerock/javascript-sdk 的 Mock 认证树。
//
// 【流程说明】
//   UI 分 2 步，但 SDK 认证树内部有 3 个阶段：
//     1. ForgotPasswordEmail —— 收集邮箱（UI 第一步）
//     2. OTP                —— 收集验证码（SDK 中间步骤，UI 不单独展示）
//     3. ForgotPasswordReset—— 收集验证码+新密码+确认密码（UI 第二步）
//   因此 UI 第二步提交时，会先推进 OTP 步骤拿到 reset 步骤，
//   再把验证码和新密码一起提交完成重置。
//
// 【技术栈】
//   - Mantine v9：UI 组件库
//   - @mantine/form 的 useForm + schemaResolver：表单状态与校验
//   - Zod v4：Schema 校验（forgotPasswordSchema / resetPasswordSchema）
//   - @forgerock/javascript-sdk：FRStep / FRCallback API
// =============================================================

import { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Stack,
  Alert,
  Text,
  Code,
  Group,
} from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { forgotPasswordSchema, resetPasswordSchema } from "../lib/schemas.js";
import { startAuth, nextAuth } from "../lib/sdk.js";

// ForgeRock 的 StepType 枚举本质是字符串（值与名字相同），
// 用字符串常量做比较，避免再额外 import SDK 枚举，保持依赖最小。
const STEP_TYPE_FAILURE = "LoginFailure"; // 失败终态

export default function ForgotPasswordFlow({ onSwitchToLogin }) {
  // ---- 流程阶段状态 ----
  // "email"   : 第一步，输入注册邮箱
  // "reset"   : 第二步，输入验证码 + 新密码 + 确认密码
  // "success" : 重置成功，展示提示
  const [phase, setPhase] = useState("email");

  // 错误信息（展示在 Alert 中）
  const [error, setError] = useState(null);
  // 提交中 loading 状态（禁用按钮，防止重复提交）
  const [loading, setLoading] = useState(false);

  // ---- SDK step 与 context（用 useState 而非 useRef，避免渲染期读取 ref）----
  // step：当前 FRStep 实例。提交时把表单值写入它的 callbacks，再交给 nextAuth。
  const [step, setStep] = useState(null);
  // context：跨步骤共享的上下文对象。SDK 的 nextAuth 在处理
  //   ForgotPasswordEmail 阶段时往 context 上写入 email / username / flowType，
  //   后续步骤需要读取这些字段，因此用同一个对象引用贯穿整个流程。
  const [context, setContext] = useState({});

  // ---- 第一步表单：邮箱（使用 forgotPasswordSchema 校验）----
  const emailForm = useForm({
    initialValues: { email: "" },
    validate: schemaResolver(forgotPasswordSchema),
  });

  // ---- 第二步表单：验证码 + 新密码 + 确认密码（使用 resetPasswordSchema 校验）----
  const resetForm = useForm({
    initialValues: { code: "", newPassword: "", confirmPassword: "" },
    validate: schemaResolver(resetPasswordSchema),
  });

  // ---- 挂载时启动忘记密码流程 ----
  // 调用 startAuth("forgotPassword") 获取第一个 step（ForgotPasswordEmail 阶段）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const firstStep = await startAuth("forgotPassword");
        if (cancelled) return;
        setStep(firstStep);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "启动流程失败，请重试");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    // 清理函数：组件卸载时阻止 setState
    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // 提交第一步：输入邮箱
  // ============================================================
  // 1. 把邮箱写入 step 的 StringAttributeInputCallback
  // 2. 调用 nextAuth(step, ctx) 提交
  //    - SDK 内部会校验邮箱是否存在，生成验证码，
  //      并往 ctx 写入 email/username/flowType
  //    - 成功 → 返回 OTP 步骤（FRStep，stage="OTP"）
  //    - 失败 → 返回 LoginFailure
  // 3. 保存 OTP step 和被 SDK 修改后的 context，切换到第二步 UI
  async function handleEmailSubmit(values) {
    if (!step) {
      setError("流程未初始化，请刷新重试");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 把邮箱写入第一个 callback（StringAttributeInputCallback）
      step.callbacks[0].setInputValue(values.email);
      // 新建 context 对象传给 nextAuth，SDK 会在其上写入 email/username/flowType
      const ctx = {};
      // 提交给 SDK，获取下一步
      const result = await nextAuth(step, ctx);
      // 判断返回类型：LoginFailure 表示失败
      if (result.type === STEP_TYPE_FAILURE) {
        setError(result.getDetail());
        return;
      }
      // 成功：result 是 OTP 步骤的 FRStep
      // 保存 OTP step 和被 SDK 写入字段的 context，供第二步使用
      setStep(result);
      setContext(ctx);
      setPhase("reset");
    } catch (e) {
      setError(e.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 提交第二步：验证码 + 新密码 + 确认密码
  // ============================================================
  // 由于 SDK 内部有 OTP 和 ForgotPasswordReset 两个阶段，这里需要
  // 依次推进两次 nextAuth：
  //   1. 用验证码推进 OTP 步骤 → 拿到 ForgotPasswordReset 步骤
  //   2. 把验证码+新密码+确认密码写入 reset 步骤 → 完成重置
  async function handleResetSubmit(values) {
    if (!step) {
      setError("流程异常，请重新开始");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // ---- 第 1 次提交：推进 OTP 步骤 ----
      // OTP 步骤只有一个 TextInputCallback（验证码）
      step.callbacks[0].setInputValue(values.code);
      // context 在第一步已被 SDK 写入 flowType="forgotPassword"，这里直接复用
      const resetStep = await nextAuth(step, context);
      if (resetStep.type === STEP_TYPE_FAILURE) {
        setError(resetStep.getDetail());
        return;
      }

      // ---- 第 2 次提交：推进 ForgotPasswordReset 步骤 ----
      // reset 步骤有 3 个 callback：
      //   [0] TextInputCallback  —— 验证码（SDK 内部已校验，这里再写一次）
      //   [1] PasswordCallback   —— 新密码
      //   [2] PasswordCallback   —— 确认新密码
      resetStep.callbacks[0].setInputValue(values.code);
      resetStep.callbacks[1].setInputValue(values.newPassword);
      resetStep.callbacks[2].setInputValue(values.confirmPassword);
      const result = await nextAuth(resetStep, context);

      if (result.type === STEP_TYPE_FAILURE) {
        setError(result.getDetail());
        return;
      }

      // 重置成功，切换到成功页面
      setPhase("success");
    } catch (e) {
      setError(e.message || "重置失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 渲染层
  // ============================================================

  // ---- 成功页面 ----
  if (phase === "success") {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Alert color="green" variant="light" title="密码重置成功">
            您的密码已成功重置，请使用新密码登录。
          </Alert>
          <Group justify="center">
            <Button onClick={onSwitchToLogin}>前往登录</Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  // ---- 第一步：输入邮箱 ----
  if (phase === "email") {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            忘记密码
          </Text>
          <Text size="sm" c="dimmed">
            请输入注册时使用的邮箱，我们将发送验证码到该邮箱。
          </Text>

          {/* 错误提示 */}
          {error && (
            <Alert color="red" variant="light" title="出错了">
              {error}
            </Alert>
          )}

          {/* 邮箱表单：form.onSubmit 会先做 Zod 校验，通过后才调用 handleEmailSubmit */}
          <form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
            <Stack gap="md">
              <TextInput
                label="注册邮箱"
                placeholder="请输入注册邮箱"
                key={emailForm.key("email")}
                {...emailForm.getInputProps("email")}
                withAsterisk
              />
              <Button type="submit" loading={loading} fullWidth>
                发送验证码
              </Button>
            </Stack>
          </form>

          {/* 测试提示：展示预置账号的邮箱 */}
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              测试邮箱：
            </Text>
            <Code>demo@example.com</Code>
          </Group>

          {/* 返回登录入口 */}
          <Group justify="center">
            <Button variant="subtle" size="xs" onClick={onSwitchToLogin}>
              想起密码了？返回登录
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  // ---- 第二步：输入验证码 + 新密码 + 确认密码 ----
  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={600}>
          重置密码
        </Text>
        <Text size="sm" c="dimmed">
          验证码已发送至您的邮箱，请输入验证码并设置新密码。
        </Text>

        {/* 错误提示 */}
        {error && (
          <Alert color="red" variant="light" title="出错了">
            {error}
          </Alert>
        )}

        {/* 重置密码表单 */}
        <form onSubmit={resetForm.onSubmit(handleResetSubmit)}>
          <Stack gap="md">
            <TextInput
              label="验证码"
              placeholder="请输入 6 位验证码"
              key={resetForm.key("code")}
              {...resetForm.getInputProps("code")}
              withAsterisk
              maxLength={6}
            />
            <PasswordInput
              label="新密码"
              placeholder="至少 8 位，含字母和数字"
              key={resetForm.key("newPassword")}
              {...resetForm.getInputProps("newPassword")}
              withAsterisk
            />
            <PasswordInput
              label="确认新密码"
              placeholder="请再次输入新密码"
              key={resetForm.key("confirmPassword")}
              {...resetForm.getInputProps("confirmPassword")}
              withAsterisk
            />
            <Button type="submit" loading={loading} fullWidth>
              重置密码
            </Button>
          </Stack>
        </form>

        {/* 验证码提示：Mock 模式下验证码会打印在浏览器控制台 */}
        <Text size="xs" c="dimmed">
          提示：Mock 模式下验证码会打印在浏览器控制台（F12 查看）。
        </Text>
      </Stack>
    </Paper>
  );
}
