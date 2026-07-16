"use client";
// =============================================================
// 文件：app/auth-demo/components/ChangePasswordFlow.jsx
// -------------------------------------------------------------
// 【整体职责】
//   修改密码流程组件（已登录用户）。引导用户输入当前密码和新密码，
//   底层调用 @forgerock/javascript-sdk 的 Mock 认证树完成修改。
//
// 【流程说明】
//   1. 先检查登录状态（isLoggedIn），未登录则提示"请先登录"
//   2. 已登录则调用 startAuth("changePassword") 获取 step
//      - step 包含 3 个 PasswordCallback：当前密码、新密码、确认新密码
//   3. 用户填写表单并提交，把值写入 callbacks 后调用 nextAuth(step)
//   4. 成功 → 展示成功提示 + "返回"按钮
//
// 【技术栈】
//   - Mantine v9：UI 组件库
//   - @mantine/form 的 useForm + schemaResolver：表单状态与校验
//   - Zod v4：Schema 校验（changePasswordSchema）
//   - @forgerock/javascript-sdk：FRStep / FRCallback API
// =============================================================

import { useState, useEffect } from "react";
import {
  PasswordInput,
  Button,
  Paper,
  Stack,
  Alert,
  Text,
  Group,
} from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { changePasswordSchema } from "../lib/schemas.js";
import { startAuth, nextAuth, isLoggedIn } from "../lib/sdk.js";

// ForgeRock 的 StepType 枚举本质是字符串（值与名字相同），
// 用字符串常量做比较，避免再额外 import SDK 枚举，保持依赖最小。
const STEP_TYPE_FAILURE = "LoginFailure"; // 失败终态

// PasswordCallback 类型字符串，用于 getCallbacksOfType 检索
const CB_PASSWORD = "PasswordCallback";

export default function ChangePasswordFlow({ onBack }) {
  // ---- 组件状态机 ----
  // "checking"   : 正在检查登录状态 / 加载 step
  // "notLoggedIn": 未登录，展示提示
  // "form"       : 已登录且 step 就绪，展示修改密码表单
  // "success"    : 修改成功，展示成功提示
  const [status, setStatus] = useState("checking");
  // 错误信息（展示在 Alert 中）
  const [error, setError] = useState(null);
  // 提交中 loading 状态
  const [loading, setLoading] = useState(false);

  // step：startAuth 返回的 FRStep 实例。
  // 用 useState 而非 useRef，避免渲染期读取 ref 触发 lint 警告。
  const [step, setStep] = useState(null);

  // ---- 表单：当前密码 + 新密码 + 确认密码（使用 changePasswordSchema 校验）----
  // changePasswordSchema 包含跨字段校验：
  //   - 新密码不能与当前密码相同
  //   - 两次输入的新密码必须一致
  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: schemaResolver(changePasswordSchema),
  });

  // ---- 挂载时检查登录状态并加载 step ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 先检查是否已登录
      if (!isLoggedIn()) {
        if (!cancelled) setStatus("notLoggedIn");
        return;
      }
      try {
        // 已登录，调用 startAuth 获取修改密码的 step
        const authStep = await startAuth("changePassword");
        if (cancelled) return;
        // startAuth 在未登录时也会返回 LoginFailure，做二次兜底
        if (authStep.type === STEP_TYPE_FAILURE) {
          if (!cancelled) {
            setError(authStep.getDetail());
            setStatus("notLoggedIn");
          }
          return;
        }
        // step 就绪，展示表单
        setStep(authStep);
        if (!cancelled) setStatus("form");
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "加载失败，请重试");
          setStatus("form");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // 提交修改密码
  // ============================================================
  // 1. 用 FRStep API 读取 3 个 PasswordCallback
  //    - callbacks[0]：当前密码
  //    - callbacks[1]：新密码
  //    - callbacks[2]：确认新密码
  // 2. 把表单值写入对应 callback
  // 3. 调用 nextAuth(step) 提交
  //    - SDK 内部会校验当前密码是否正确、新密码一致性等
  //    - 成功 → 返回 LoginSuccess
  //    - 失败 → 返回 LoginFailure
  async function handleSubmit(values) {
    if (!step) {
      setError("流程未初始化，请返回重试");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 用 FRStep API 读取所有 PasswordCallback
      // getCallbacksOfType 返回该步骤中指定类型的所有 callback
      const passwordCallbacks = step.getCallbacksOfType(CB_PASSWORD);

      // 按顺序写入表单值：
      //   [0] 当前密码、[1] 新密码、[2] 确认新密码
      passwordCallbacks[0].setInputValue(values.currentPassword);
      passwordCallbacks[1].setInputValue(values.newPassword);
      passwordCallbacks[2].setInputValue(values.confirmPassword);

      // 提交给 SDK
      const result = await nextAuth(step);

      // 判断返回类型
      if (result.type === STEP_TYPE_FAILURE) {
        setError(result.getDetail());
        return;
      }

      // 修改成功
      setStatus("success");
    } catch (e) {
      setError(e.message || "修改失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 渲染层
  // ============================================================

  // ---- 未登录提示 ----
  if (status === "notLoggedIn") {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md" align="center">
          <Alert color="orange" variant="light" title="未登录" w="100%">
            请先登录后再修改密码。
          </Alert>
          <Button variant="subtle" onClick={onBack}>
            返回
          </Button>
        </Stack>
      </Paper>
    );
  }

  // ---- 加载中 ----
  if (status === "checking") {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md" align="center">
          <Text c="dimmed">正在加载...</Text>
        </Stack>
      </Paper>
    );
  }

  // ---- 修改成功 ----
  if (status === "success") {
    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Alert color="green" variant="light" title="密码修改成功">
            您的密码已成功修改，下次登录请使用新密码。
          </Alert>
          <Group justify="center">
            <Button onClick={onBack}>返回</Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  // ---- 修改密码表单 ----
  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={600}>
          修改密码
        </Text>
        <Text size="sm" c="dimmed">
          请输入当前密码并设置新密码。新密码不能与当前密码相同。
        </Text>

        {/* 错误提示 */}
        {error && (
          <Alert color="red" variant="light" title="出错了">
            {error}
          </Alert>
        )}

        {/* 修改密码表单：form.onSubmit 会先做 Zod 校验，通过后才调用 handleSubmit */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="当前密码"
              placeholder="请输入当前密码"
              key={form.key("currentPassword")}
              {...form.getInputProps("currentPassword")}
              withAsterisk
            />
            <PasswordInput
              label="新密码"
              placeholder="至少 8 位，含字母和数字"
              key={form.key("newPassword")}
              {...form.getInputProps("newPassword")}
              withAsterisk
            />
            <PasswordInput
              label="确认新密码"
              placeholder="请再次输入新密码"
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
              withAsterisk
            />
            <Group justify="flex-end" mt="xs">
              <Button variant="subtle" onClick={onBack} disabled={loading}>
                返回
              </Button>
              <Button type="submit" loading={loading}>
                确认修改
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
