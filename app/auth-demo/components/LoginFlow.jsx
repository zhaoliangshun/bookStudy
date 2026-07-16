"use client";

// =============================================================
// 文件：app/auth-demo/components/LoginFlow.jsx
// -------------------------------------------------------------
// 【职责】
//   ForgeRock 认证 Demo 的「登录流程」组件。封装完整的两步登录：
//     第一步：用户名 + 密码（loginSchema 校验）
//     第二步：OTP 短信验证码（otpSchema 校验，含 60 秒重发倒计时）
//   登录成功后通过 onLoginSuccess 回调把会话信息回传给父组件。
//
// 【状态机】
//   phase: idle → running → success / failure
//     - idle    : 初始化中（正在向 startAuth 请求第一步 step）
//     - running : 已拿到 step，正在与用户交互；stage 区分 "login" / "otp"
//     - success : 登录成功（收到 LoginSuccess 终态）
//     - failure : 登录失败（收到 LoginFailure 终态或抛异常）
//   stage : "login" | "otp"   —— 仅在 running 阶段有意义，决定渲染哪个表单
//
// 【三方库】
//   @mantine/core   : UI 组件库（Paper/Stack/TextInput/PasswordInput/Button...）
//   @mantine/form   : useForm 管理表单状态；schemaResolver 把 Zod schema 转成校验函数
//   zod             : 声明式数据校验（v4 兼容 Standard Schema，可直接喂给 schemaResolver）
//   @forgerock/javascript-sdk（间接）：通过 ../lib/sdk.js 的 startAuth/nextAuth
//                     拿到 FRStep 实例，用其 callback API 读写表单值
//
// 【ForgeRock 关键概念】
//   - FRStep      : 认证树的一个步骤，内部封装若干 callback
//   - callback    : 步骤需要收集的输入单元（如 NameCallback=用户名、
//                   PasswordCallback=密码、TextInputCallback=通用文本/OTP）
//   - setInputValue : 把用户的输入写回 callback，提交时由 nextAuth 读取
//   - 终态        : step.type 为 LoginSuccess / LoginFailure 时流程结束
//
// 【测试账号】demo / Demo1234，OTP 任意 6 位数字（控制台会打印“发送”的验证码）
// =============================================================

import { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Text,
  Code,
  Group,
  Divider,
  Progress,
} from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { loginSchema, otpSchema } from "../lib/schemas.js";
import {
  startAuth,
  nextAuth,
  isLoggedIn,
  getSession,
} from "../lib/sdk.js";

// ForgeRock 的 StepType / CallbackType 枚举本质是字符串（值与名字相同），
// 这里用字符串常量做比较，避免再额外 import SDK 枚举，保持本组件依赖最小。
const STEP_TYPE_STEP = "Step";                 // 中间步骤（还需继续交互）
const STEP_TYPE_SUCCESS = "LoginSuccess";      // 登录成功终态
const STEP_TYPE_FAILURE = "LoginFailure";      // 登录失败终态

const CB_NAME = "NameCallback";                // 用户名输入 callback 类型
const CB_PASSWORD = "PasswordCallback";        // 密码输入 callback 类型
const CB_TEXT = "TextInputCallback";           // 通用文本输入（OTP 用）callback 类型

const OTP_COUNTDOWN_TOTAL = 60;                // OTP 重发倒计时总秒数

/**
 * 登录流程组件
 * @param {object} props
 * @param {(session: object|null) => void} [props.onLoginSuccess]
 *        登录成功回调，把当前会话信息传给父组件
 * @param {() => void} [props.onSwitchToRegister]
 *        点击「去注册」时触发，由父组件切换视图
 * @param {() => void} [props.onSwitchToForgotPassword]
 *        点击「忘记密码」时触发，由父组件切换视图
 */
export default function LoginFlow({
  onLoginSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) {
  // ============================== 状态机 ==============================
  // phase：流程阶段。用「惰性初始值」：若挂载时已登录直接 success，否则 idle。
  //   idle    : 初始化中（正在向 startAuth 请求第一步 step）
  //   running : 已拿到 step，正在与用户交互
  //   success : 登录成功（收到 LoginSuccess 终态）
  //   failure : 登录失败（收到 LoginFailure 终态或抛异常）
  const [phase, setPhase] = useState(() => (isLoggedIn() ? "success" : "idle"));
  // stage：running 阶段下的子步骤标识，"login" 渲染账密表单，"otp" 渲染验证码表单
  const [stage, setStage] = useState(null);
  // step：当前 FRStep 实例。提交时把表单值写入它的 callbacks，再交给 nextAuth
  const [step, setStep] = useState(null);
  // context：跨步骤传递的上下文。OTP 步骤需要 flowType + username 关联用户
  const [context, setContext] = useState({ flowType: "login" });
  // error：失败时展示的错误信息（来自 LoginFailure.getMessage 或异常）
  const [error, setError] = useState("");
  // loading：请求进行中标记，用于禁用按钮、显示 loading 文案。
  // 未登录时挂载即开始请求第一步，故初始为 true；已登录则无需 loading。
  const [loading, setLoading] = useState(() => !isLoggedIn());
  // otpCountdown：OTP 重发倒计时剩余秒数，> 0 时重发按钮禁用
  const [otpCountdown, setOtpCountdown] = useState(0);
  // lastLoginValues：缓存第一步的账密，供「重发验证码」时重新走一遍登录生成新 OTP
  const [lastLoginValues, setLastLoginValues] = useState(null);

  // ============================== 表单实例 ==============================
  // 第一步：用户名 + 密码表单
  // useForm 返回 form 对象：values、errors、getInputProps（桥接输入控件）、onSubmit 等。
  // validate 接收 schemaResolver(loginSchema)：schemaResolver 把 Zod schema
  // 转成 Mantine 期望的 (values) => FormErrors 校验函数（Zod v4 实现 Standard Schema）。
  const loginForm = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: schemaResolver(loginSchema),
  });

  // 第二步：OTP 验证码表单
  // otpSchema 校验：必须是 6 位纯数字（正则 ^\d{6}$）
  const otpForm = useForm({
    initialValues: {
      otp: "",
    },
    validate: schemaResolver(otpSchema),
  });

  // ============================== 倒计时副作用 ==============================
  // 当 otpCountdown > 0 时，每秒减 1，到 0 自动停止（ clearInterval 在 cleanup 中执行）
  // 依赖 [otpCountdown]：每次值变化都会重建定时器，保证准确递减
  useEffect(() => {
    if (otpCountdown <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // ============================== 分发下一步 ==============================
  // 根据 nextAuth 返回的对象 type 字段决定走向：
  //   Step         -> 中间步骤，更新 step/stage，继续交互（如进入 OTP）
  //   LoginSuccess -> 登录成功，通知父组件，切到 success 态
  //   LoginFailure -> 登录失败，提取错误信息，切到 failure 态
  // 注意：成功/失败对象不是 FRStep，而是带 getMessage/getDetail 的普通对象，
  //       所以读取消息时用可选链防止方法不存在时报错。
  const dispatchNextStep = useCallback((next, ctx) => {
    const type = next?.type;

    if (type === STEP_TYPE_STEP) {
      // 中间步骤：读取 stage 判断是 OTP 还是其它
      const nextStage = next.getStage?.() || "";
      setStep(next);
      if (nextStage === "OTP") {
        // 进入 OTP 步骤：重置 OTP 表单并启动 60 秒倒计时
        setStage("otp");
        setOtpCountdown(OTP_COUNTDOWN_TOTAL);
        otpForm.reset();
      } else {
        // 其它中间步骤（本流程不会出现，保留兜底）
        setStage(nextStage);
      }
      setPhase("running");
      return;
    }

    if (type === STEP_TYPE_SUCCESS) {
      // 登录成功：从 Mock 会话管理器取出会话信息回传父组件
      const session = getSession();
      setPhase("success");
      onLoginSuccess?.(session);
      return;
    }

    if (type === STEP_TYPE_FAILURE) {
      // 登录失败：优先用 getMessage，其次 getDetail，最后兜底文案
      const msg =
        next.getMessage?.() || next.getDetail?.() || "登录失败，请重试";
      setError(msg);
      setPhase("failure");
      return;
    }

    // 未知类型兜底
    setError("收到未知的认证响应类型：" + String(type));
    setPhase("failure");
    // 依赖 onLoginSuccess（父组件回调）与 otpForm（Mantine 表单实例，引用稳定）：
    // 加上 onLoginSuccess 避免父组件传入新回调时拿到 stale 闭包
  }, [onLoginSuccess, otpForm]);

  // ============================== 请求第一步 step（纯异步，不含 setState）==============================
  // 仅负责调用 startAuth("login") 拿到第一步 FRStep，不触碰任何 state。
  // 拆出来的目的：让 effect 与事件处理器都能复用同一段「取 step」逻辑，
  // 而把 setState 留在各自调用点（effect 中需放在 await 之后以满足
  // react-hooks/set-state-in-effect 规则；事件处理器中可自由同步调用）。
  const loadFirstStep = useCallback(async () => {
    return await startAuth("login");
  }, []);

  // 挂载时自动启动登录流程：
  //   - 已登录：phase 初始已是 success（惰性初始值），仅同步通知父组件（调用 prop 非 setState）
  //   - 未登录：用 async IIFE 发起 startAuth，所有 setState 都在 await 之后，非同步触发
  useEffect(() => {
    if (isLoggedIn()) {
      // 已登录：把会话信息回传父组件（onLoginSuccess 是 prop 回调，非 setState，可在 effect 同步调用）
      onLoginSuccess?.(getSession());
      return;
    }
    // cancelled 标记：组件卸载后不再 setState，避免内存泄漏与「setState on unmounted」警告
    let cancelled = false;
    (async () => {
      try {
        const firstStep = await loadFirstStep();
        if (cancelled) return;
        setStep(firstStep);
        setStage("login");
        setPhase("running");
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "启动登录流程失败");
        setPhase("failure");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFirstStep, onLoginSuccess]);

  // ============================== 工具：在 step 中按类型找 callback ==============================
  // step.callbacks 是 FRCallback 实例数组；cb.getType() 返回类型字符串。
  // 用 find 取第一个匹配类型的 callback，找不到返回 undefined。
  const findCallback = (currentStep, type) => {
    if (!currentStep?.callbacks) return undefined;
    return currentStep.callbacks.find((cb) => cb.getType() === type);
  };

  // ============================== 工具：读取 callback 的 prompt 文案 ==============================
  // ForgeRock 的 callback 通过 output 数组里的 { name: "prompt", value: "..." } 下发字段标签。
  // getOutputByName("prompt", fallback) 取不到时返回 fallback，保证 UI 一定有文案。
  const getCallbackPrompt = (cb, fallback) => {
    if (!cb) return fallback;
    return cb.getOutputByName?.("prompt", fallback) || fallback;
  };

  // ============================== 第一步提交：用户名 + 密码 ==============================
  // 流程：
  //   1) form.onSubmit 校验通过后回调本函数，values 是表单当前值
  //   2) 把 username/password 写入 step 对应 callback（setInputValue）
  //   3) 组装 context（flowType + username，供 OTP 步骤关联用户）
  //   4) 调用 nextAuth(step, context) 拿下一步，由 dispatchNextStep 分发
  const handleLoginSubmit = async (values) => {
    setLoading(true);
    setError("");
    setLastLoginValues(values); // 缓存账密，供重发 OTP 复用
    try {
      // 把表单值写回 step 的 callbacks —— nextAuth 内部会读取这些值做校验
      const nameCb = findCallback(step, CB_NAME);
      const pwdCb = findCallback(step, CB_PASSWORD);
      if (nameCb) nameCb.setInputValue(values.username);
      if (pwdCb) pwdCb.setInputValue(values.password);

      // context.username 供 OTP 步骤在 Mock 引擎里查找用户
      const ctx = { flowType: "login", username: values.username };
      setContext(ctx);

      const next = await nextAuth(step, ctx);
      dispatchNextStep(next, ctx);
    } catch (e) {
      setError(e?.message || "登录请求失败");
      setPhase("failure");
    } finally {
      setLoading(false);
    }
  };

  // ============================== 第二步提交：OTP 验证码 ==============================
  // 把 6 位验证码写入 TextInputCallback，再用同一份 context 调 nextAuth。
  // context.flowType === "login" 让 Mock 引擎走「登录 OTP → 登录成功」分支。
  const handleOtpSubmit = async (values) => {
    setLoading(true);
    setError("");
    try {
      const otpCb = findCallback(step, CB_TEXT);
      if (otpCb) otpCb.setInputValue(values.otp);

      const next = await nextAuth(step, context);
      dispatchNextStep(next, context);
    } catch (e) {
      setError(e?.message || "验证码校验失败");
      setPhase("failure");
    } finally {
      setLoading(false);
    }
  };

  // ============================== 重发 OTP 验证码 ==============================
  // 倒计时结束后可点击。实现方式：用缓存的账密重新走一遍「登录第一步」，
  // 让 Mock 引擎重新生成验证码（会打印到控制台），并拿到新的 OTP step。
  const handleResendOtp = async () => {
    // 倒计时未结束或没有缓存账密时禁止重发
    if (otpCountdown > 0 || !lastLoginValues) return;
    setLoading(true);
    setError("");
    try {
      // 重新拿一个干净的登录 step（旧的已写入上一次输入，不复用）
      const freshStep = await startAuth("login");
      const nameCb = findCallback(freshStep, CB_NAME);
      const pwdCb = findCallback(freshStep, CB_PASSWORD);
      if (nameCb) nameCb.setInputValue(lastLoginValues.username);
      if (pwdCb) pwdCb.setInputValue(lastLoginValues.password);

      const ctx = { flowType: "login", username: lastLoginValues.username };
      setContext(ctx);

      const next = await nextAuth(freshStep, ctx);
      // 进入新的 OTP step，dispatchNextStep 会重置倒计时与 OTP 表单
      dispatchNextStep(next, ctx);
    } catch (e) {
      setError(e?.message || "重发验证码失败");
    } finally {
      setLoading(false);
    }
  };

  // ============================== 失败后重试 ==============================
  // 重置所有状态并重新启动登录流程。
  // 本函数由按钮 onClick 触发（事件处理器），同步 setState 在事件处理器中是允许的，
  // 不会触发 react-hooks/set-state-in-effect 规则。
  const handleRetry = () => {
    setError("");
    setStep(null);
    setStage(null);
    setContext({ flowType: "login" });
    setOtpCountdown(0);
    setLoading(true); // 重新进入请求中状态
    loginForm.reset();
    otpForm.reset();
    // 复用 loadFirstStep 取第一步 step；事件处理器中可直接 setState
    (async () => {
      try {
        const firstStep = await loadFirstStep();
        setStep(firstStep);
        setStage("login");
        setPhase("running");
      } catch (e) {
        setError(e?.message || "启动登录流程失败");
        setPhase("failure");
      } finally {
        setLoading(false);
      }
    })();
  };

  // ============================== 渲染：从 step 读取字段标签 ==============================
  // 仅在 running 且 step 存在时读取，体现「用 FRStep API 读取 callbacks 渲染表单」
  const usernamePrompt =
    step && stage === "login"
      ? getCallbackPrompt(findCallback(step, CB_NAME), "用户名")
      : "用户名";
  const passwordPrompt =
    step && stage === "login"
      ? getCallbackPrompt(findCallback(step, CB_PASSWORD), "密码")
      : "密码";
  const otpPrompt =
    step && stage === "otp"
      ? getCallbackPrompt(findCallback(step, CB_TEXT), "验证码")
      : "验证码";
  const stepDescription = step?.getDescription?.() || "";

  // ============================== 渲染分支 ==============================
  return (
    <Paper p="xl" withBorder shadow="md" radius="md">
      <Stack gap="lg">
        {/* ---------- 标题区 ---------- */}
        <div>
          <Text size="xl" fw={700}>
            🔐 登录
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            ForgeRock 两步登录 Demo · Mantine v9 + Zod v4
          </Text>
        </div>

        <Divider />

        {/* ---------- 成功态 ---------- */}
        {phase === "success" && (
          <Stack gap="md">
            <Alert color="green" variant="light" title="登录成功">
              <Text size="sm">
                欢迎回来！你已通过 ForgeRock 认证树完成登录。
              </Text>
            </Alert>
            {/* getSession() 取回 Mock 会话信息展示，证明登录态已建立 */}
            {getSession() && (
              <Paper p="sm" withBorder bg="var(--mantine-color-gray-0)">
                <Text size="xs" c="dimmed" mb={4}>
                  当前会话信息：
                </Text>
                <Code block>
                  {JSON.stringify(getSession(), null, 2)}
                </Code>
              </Paper>
            )}
          </Stack>
        )}

        {/* ---------- 失败态 ---------- */}
        {phase === "failure" && (
          <Stack gap="md">
            <Alert color="red" variant="light" title="登录失败">
              <Text size="sm" component="div">
                {error || "未知错误"}
              </Text>
            </Alert>
            <Group>
              <Button onClick={handleRetry} loading={loading}>
                重试
              </Button>
              <Button variant="subtle" onClick={onSwitchToForgotPassword}>
                忘记密码？
              </Button>
            </Group>
          </Stack>
        )}

        {/* ---------- 初始化中（idle）---------- */}
        {phase === "idle" && (
          <Stack align="center" gap="sm" py="xl">
            <Text size="sm" c="dimmed">
              正在初始化登录流程…
            </Text>
            <Progress
              value={100}
              size="xs"
              w="100%"
              color="indigo"
              animated
            />
          </Stack>
        )}

        {/* ---------- 第一步：用户名 + 密码 ---------- */}
        {phase === "running" && stage === "login" && (
          <form onSubmit={loginForm.onSubmit(handleLoginSubmit)}>
            <Stack gap="md">
              {stepDescription && (
                <Text size="sm" c="dimmed">
                  {stepDescription}
                </Text>
              )}

              {/* 用户名输入：label 来自 callback 的 prompt，体现 FRStep 驱动渲染 */}
              <TextInput
                label={usernamePrompt}
                placeholder="请输入用户名"
                withAsterisk
                description="测试账号：demo"
                // getInputProps 桥接 value/onChange/onError，让表单状态自动同步
                {...loginForm.getInputProps("username")}
              />

              {/* 密码输入：PasswordInput 自带显示/隐藏切换（右侧眼睛图标） */}
              <PasswordInput
                label={passwordPrompt}
                placeholder="请输入密码"
                withAsterisk
                description="测试密码：Demo1234"
                {...loginForm.getInputProps("password")}
              />

              <Button type="submit" loading={loading} fullWidth>
                登录
              </Button>

              {/* 辅助链接区 */}
              <Group justify="space-between" mt="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  p={0}
                  onClick={onSwitchToForgotPassword}
                >
                  忘记密码？
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  p={0}
                  onClick={onSwitchToRegister}
                >
                  没有账号？去注册
                </Button>
              </Group>
            </Stack>
          </form>
        )}

        {/* ---------- 第二步：OTP 验证码 ---------- */}
        {phase === "running" && stage === "otp" && (
          <form onSubmit={otpForm.onSubmit(handleOtpSubmit)}>
            <Stack gap="md">
              {stepDescription && (
                <Text size="sm" c="dimmed">
                  {stepDescription}
                </Text>
              )}

              <Alert color="blue" variant="light" title="二次验证（2FA）">
                <Text size="sm">
                  已向您的手机发送短信验证码，请输入 6 位数字。
                  任意 6 位数字均可通过（Mock 模式，验证码已打印到控制台）。
                </Text>
              </Alert>

              {/* OTP 输入：otpSchema 校验必须为 6 位纯数字 */}
              <TextInput
                label={otpPrompt}
                placeholder="请输入 6 位验证码"
                withAsterisk
                inputMode="numeric"
                maxLength={6}
                {...otpForm.getInputProps("otp")}
              />

              {/* 倒计时进度条：随剩余秒数从满到空，最后 10 秒变红提示 */}
              <Progress
                value={(otpCountdown / OTP_COUNTDOWN_TOTAL) * 100}
                size="sm"
                color={otpCountdown < 10 ? "red" : "indigo"}
                radius="xs"
              />

              {/* 重发按钮：倒计时中禁用并显示剩余秒数 */}
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {otpCountdown > 0
                    ? `${otpCountdown} 秒后可重新发送`
                    : "可重新发送验证码"}
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  loading={loading}
                  disabled={otpCountdown > 0}
                  onClick={handleResendOtp}
                >
                  {otpCountdown > 0
                    ? `重新发送 (${otpCountdown}s)`
                    : "重新发送验证码"}
                </Button>
              </Group>

              <Button type="submit" loading={loading} fullWidth>
                验证
              </Button>

              <Button
                variant="subtle"
                size="xs"
                onClick={handleRetry}
                fullWidth
              >
                返回重新登录
              </Button>
            </Stack>
          </form>
        )}

        {/* ---------- 测试账号提示（仅 login 步骤显示）---------- */}
        {phase === "running" && stage === "login" && (
          <Paper p="xs" withBorder bg="var(--mantine-color-gray-0)">
            <Text size="xs" c="dimmed">
              测试账号：<Code>demo</Code> / <Code>Demo1234</Code>，OTP 任意 6 位数字
            </Text>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
