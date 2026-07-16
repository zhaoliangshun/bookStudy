"use client";

// =============================================================
// 文件：app/auth-demo/components/SecurityQuestionsPanel.jsx
// -------------------------------------------------------------
// 【职责】
//   安全问题面板，提供两种模式：
//     1. 查看模式：展示当前登录用户已设置的安全问题（从 getCurrentUser 获取）
//     2. 验证模式：输入用户名 → startAuth("securityVerify", {username})
//        拉取该用户的安全问题 → 用 TextInput 输入答案 → nextAuth 校验
//        （模拟账户恢复场景下的身份验证）
//
// 【技术栈】
//   - Mantine v9：Select / TextInput / Button / Paper / Stack /
//     Alert / Text / Group / Divider
//   - @mantine/form：useForm + schemaResolver（验证模式答案校验）
//   - Zod v4：verifySecurityQuestionsSchema
//   - @forgerock/javascript-sdk：startAuth / nextAuth 返回 FRStep，
//     通过其 callback API（getOutputValue / setInputValue）读写问题与答案
//
// 【props】
//   onBack {Function} 返回按钮回调
// =============================================================

import { useState } from "react";
// 导入 Mantine v9 组件
import {
  Select,
  TextInput,
  Button,
  Paper,
  Stack,
  Alert,
  Text,
  Group,
  Divider,
} from "@mantine/core";
// 导入 Mantine form 与 Zod schema 解析器
import { useForm, schemaResolver } from "@mantine/form";
// 导入安全问题验证 schema（含 answer1 / answer2 两个字段）
import { verifySecurityQuestionsSchema } from "../lib/schemas.js";
// 导入 Mock SDK 认证与会话函数
import {
  startAuth,
  nextAuth,
  isLoggedIn,
  getCurrentUser,
  getPredefinedQuestions,
} from "../lib/sdk.js";

/**
 * 安全问题面板组件
 * @param {{ onBack?: () => void }} props
 */
export default function SecurityQuestionsPanel({ onBack }) {
  // ---- 模式切换：view=查看 / verify=验证 ----
  const [mode, setMode] = useState("view");

  // ---- 查看模式状态 ----
  // 登录状态、当前用户、预设问题都来自 SDK 的同步函数，
  // 用 useState 懒初始化在首次渲染时读取一次，避免渲染闪烁，
  // 也避免在 useEffect 中同步 setState 触发级联渲染。
  const [loggedIn] = useState(() => isLoggedIn());
  const [user] = useState(() => getCurrentUser());
  // 系统支持的预设安全问题列表
  const [predefined] = useState(() => getPredefinedQuestions());

  // ---- 验证模式状态 ----
  // 用户名输入框的值
  const [verifyUsername, setVerifyUsername] = useState("");
  // startAuth 返回的 FRStep（包含安全问题 callback）
  const [verifyStep, setVerifyStep] = useState(null);
  // 从 step callback 中提取出的问题文本数组
  const [questions, setQuestions] = useState([]);
  // 验证结果提示：{ type: "success" | "error", message: string }
  const [verifyResult, setVerifyResult] = useState(null);
  // 异步加载状态
  const [loading, setLoading] = useState(false);

  // ---- 验证模式答案表单 ----
  // 字段固定 answer1 / answer2，与 verifySecurityQuestionsSchema 对齐
  // （Mock 用户默认设置 2 个安全问题）
  const form = useForm({
    initialValues: { answer1: "", answer2: "" },
    validate: schemaResolver(verifySecurityQuestionsSchema),
  });

  /**
   * 切换模式时清空验证流程的中间状态，避免残留数据
   * @param {string} value 新模式 "view" | "verify"
   */
  function handleModeChange(value) {
    setMode(value);
    setVerifyStep(null);
    setQuestions([]);
    setVerifyResult(null);
    form.reset();
  }

  /**
   * 启动安全问题验证
   * 输入用户名后调用 startAuth("securityVerify", {username}) 拉取问题
   */
  async function handleStartVerify() {
    if (!verifyUsername.trim()) {
      setVerifyResult({ type: "error", message: "请输入用户名" });
      return;
    }
    setLoading(true);
    setVerifyResult(null);
    try {
      // 调用 Mock SDK 启动 securityVerify 流程，传入用户名上下文
      const step = await startAuth("securityVerify", {
        username: verifyUsername.trim(),
      });
      // 判断返回类型：
      //   "LoginFailure" → 用户不存在等错误（返回的是普通对象，非 FRStep）
      //   其他（"Step"）→ 正常步骤，可从中提取问题
      if (step.type === "LoginFailure") {
        setVerifyResult({
          type: "error",
          message: step.getMessage?.() || "用户不存在",
        });
        setVerifyStep(null);
        setQuestions([]);
      } else {
        // 从每个 callback 的 output 中读取名为 "prompt" 的值，即问题文本
        // （安全问题验证步骤用 TextInputCallback，其 output[0].name === "prompt"）
        const qs = step.callbacks.map((cb) => cb.getOutputValue("prompt"));
        setVerifyStep(step);
        setQuestions(qs);
        form.reset();
      }
    } catch (e) {
      setVerifyResult({
        type: "error",
        message: "加载失败：" + (e?.message || String(e)),
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * 提交安全问题答案
   * 把表单答案写回各 callback 的 input，再调用 nextAuth 校验
   * @param {{answer1:string,answer2:string}} values
   */
  async function handleSubmitAnswers(values) {
    if (!verifyStep) return;
    setLoading(true);
    setVerifyResult(null);
    try {
      // 把表单答案按顺序写入对应 callback 的 input：
      //   answer1 → callbacks[0]，answer2 → callbacks[1]
      const answers = [values.answer1, values.answer2];
      verifyStep.callbacks.forEach((cb, i) => {
        cb.setInputValue(answers[i] ?? "");
      });
      // 提交给 Mock 引擎校验，传入用户名上下文以便定位用户
      const result = await nextAuth(verifyStep, {
        username: verifyUsername.trim(),
      });
      if (result.type === "LoginSuccess") {
        // 验证通过：提示成功并重置流程
        setVerifyResult({
          type: "success",
          message: result.getMessage?.() || "验证通过",
        });
        setVerifyStep(null);
        setQuestions([]);
        form.reset();
      } else if (result.type === "LoginFailure") {
        // 验证失败：显示错误，保留问题让用户重试
        setVerifyResult({
          type: "error",
          message: result.getMessage?.() || "验证失败",
        });
      } else {
        // 兜底：securityVerify 流程理论上只返回成功/失败
        setVerifyResult({ type: "error", message: "未知响应" });
      }
    } catch (e) {
      setVerifyResult({
        type: "error",
        message: "校验失败：" + (e?.message || String(e)),
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * 重置验证流程：回到“输入用户名”第一步
   */
  function resetVerifyFlow() {
    setVerifyStep(null);
    setQuestions([]);
    form.reset();
  }

  return (
    <Paper p="lg" withBorder shadow="xs">
      <Stack gap="md">
        {/* ---- 标题 + 模式切换下拉框 ---- */}
        <Group justify="space-between">
          <Text fw={600} size="lg">
            安全问题
          </Text>
          <Select
            w={160}
            value={mode}
            onChange={handleModeChange}
            data={[
              { value: "view", label: "查看模式" },
              { value: "verify", label: "验证模式" },
            ]}
          />
        </Group>

        <Divider />

        {/* ---- 验证结果提示（可关闭）---- */}
        {verifyResult && (
          <Alert
            color={verifyResult.type === "success" ? "green" : "red"}
            variant="light"
            withCloseButton
            onClose={() => setVerifyResult(null)}
          >
            {verifyResult.message}
          </Alert>
        )}

        {/* ====================================================== */}
        {/* 查看模式：展示当前用户已设置的安全问题                     */}
        {/* ====================================================== */}
        {mode === "view" && (
          <Stack gap="sm">
            {!loggedIn ? (
              <Text c="dimmed" ta="center">
                请先登录
              </Text>
            ) : !user?.securityQuestions?.length ? (
              <Text c="dimmed">您还未设置安全问题</Text>
            ) : (
              <>
                <Text fw={500}>已设置的安全问题</Text>
                {user.securityQuestions.map((q, i) => (
                  <Paper key={i} p="sm" withBorder>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        问题 {i + 1}
                      </Text>
                      <Text fw={500}>{q.question}</Text>
                      <Text size="sm" c="dimmed">
                        答案：{q.answer}
                      </Text>
                    </Stack>
                  </Paper>
                ))}

                {/* 预设问题参考列表 */}
                <Divider my="xs" label="可选预设问题" labelPosition="center" />
                <Text size="sm" c="dimmed">
                  系统支持的安全问题：
                </Text>
                {predefined.map((q, i) => (
                  <Text key={i} size="sm">
                    • {q}
                  </Text>
                ))}
              </>
            )}
          </Stack>
        )}

        {/* ====================================================== */}
        {/* 验证模式：输入用户名 → 回答问题 → 校验                    */}
        {/* ====================================================== */}
        {mode === "verify" && (
          <Stack gap="sm">
            <Text c="dimmed" size="sm">
              输入用户名后，系统会拉取该用户设置的安全问题，回答正确即可通过身份验证。
            </Text>

            {/* 第一步：输入用户名（verifyStep 为空时显示） */}
            {!verifyStep && (
              <Stack gap="sm">
                <TextInput
                  label="用户名"
                  placeholder="请输入要验证的用户名"
                  value={verifyUsername}
                  onChange={(event) =>
                    setVerifyUsername(event.currentTarget.value)
                  }
                />
                <Group justify="flex-end">
                  <Button variant="default" onClick={onBack}>
                    返回
                  </Button>
                  <Button loading={loading} onClick={handleStartVerify}>
                    获取安全问题
                  </Button>
                </Group>
              </Stack>
            )}

            {/* 第二步：回答安全问题（verifyStep 不为空时显示） */}
            {verifyStep && (
              <form onSubmit={form.onSubmit(handleSubmitAnswers)}>
                <Stack gap="sm">
                  {/* 用 TextInput 渲染每个问题的答案输入框 */}
                  {questions.map((q, i) => {
                    // 字段名 answer1 / answer2，与 schema 对应
                    const field = `answer${i + 1}`;
                    return (
                      <TextInput
                        key={form.key(field)}
                        label={`问题 ${i + 1}：${q}`}
                        placeholder="请输入答案"
                        withAsterisk
                        {...form.getInputProps(field)}
                      />
                    );
                  })}
                  <Group justify="flex-end">
                    <Button variant="default" onClick={resetVerifyFlow}>
                      重置
                    </Button>
                    <Button type="submit" loading={loading}>
                      提交答案
                    </Button>
                  </Group>
                </Stack>
              </form>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
