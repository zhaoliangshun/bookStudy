"use client";

// =============================================================
// /zod-mini 路由 —— mini-zod 实战 Demo 页面
// -------------------------------------------------------------
// 三个 Demo 展示 mini-zod 在真实表单场景的应用：
//   1. 📝 注册：用户名 / 邮箱 / 密码 / 确认密码 / 同意条款
//   2. 🔢 OTP：6 位验证码（自动跳格 + 重发倒计时）
//   3. 🔑 修改密码：当前密码 / 新密码 / 确认新密码
//
// 每个 Demo 都展示：
//   - 左侧：表单（实时校验反馈）
//   - 右侧：对应的 mini-zod Schema 定义 + 实时 safeParse 结果（JSON）
//
// 通过实时展示 safeParse 的输出，直观感受 Schema 驱动校验的威力：
// 输入任意内容，右侧立刻显示 { success, data } 或 { success, error }。
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { z } from "./mini-zod";

// -------------------------------------------------------------
// 通用 Hook：字段「已触碰」状态管理
// -------------------------------------------------------------
// 用途：解决「默认空表单就显示校验错误」的问题。
// 行为：
//   - 默认所有字段都是 untouched（未触碰）
//   - 用户首次聚焦某个字段时，标记为 touched
//   - 只有 touched 的字段才显示校验错误
// 这样初始空表单不会显示任何错误，符合「聚焦之后才检查」的预期。
// -------------------------------------------------------------
function useTouchedFields() {
  const [touched, setTouched] = useState({});

  // 聚焦时把字段标记为 touched（已用 prev[field] 判等避免无谓 setState）
  const handleFocus = useCallback((field) => {
    setTouched((prev) =>
      prev[field] ? prev : { ...prev, [field]: true }
    );
  }, []);

  // 重置 touched（清空表单时同步调用）
  const resetTouched = useCallback(() => setTouched({}), []);

  return { touched, handleFocus, resetTouched };
}

// -------------------------------------------------------------
// 通用样式常量
// -------------------------------------------------------------
const styles = {
  page: {
    // 注意：全局 globals.css 对 html/body 设置了 height:100%; overflow:hidden
    // 所以页面根容器必须自己变成滚动容器，否则内容超出视口后无法滚动
    height: "100vh",
    overflowY: "auto",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--sans)",
    padding: "32px 24px 64px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "0 0 8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.6,
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 20px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--primary)",
    color: "#fff",
    // 用 border 简写而非 borderColor，避免与 tab 的 border 简写在切换时冲突
    border: "1px solid var(--primary)",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
    overflow: "hidden",
  },
  cardLeft: {
    padding: "28px",
  },
  cardRight: {
    padding: "28px",
    background: "var(--bg-console)",
    color: "var(--text-code)",
    fontFamily: "var(--mono)",
    fontSize: "13px",
    overflow: "auto",
    maxHeight: "700px",
  },
  fieldGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "6px",
    color: "var(--text)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    background: "var(--bg-elevated)",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "var(--error)",
    boxShadow: "0 0 0 3px var(--error-bg)",
  },
  inputSuccess: {
    borderColor: "var(--success)",
  },
  hint: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  errorText: {
    fontSize: "12px",
    color: "var(--error)",
    marginTop: "4px",
  },
  successText: {
    fontSize: "12px",
    color: "var(--success)",
    marginTop: "4px",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "var(--primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  buttonSecondary: {
    background: "var(--bg-elevated)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  codeBlock: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: 1.6,
  },
  codeLabel: {
    color: "#94a3b8",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    display: "block",
  },
  codeDivider: {
    borderTop: "1px solid #334155",
    margin: "16px 0",
  },
  resultSuccess: {
    color: "#4ade80",
  },
  resultError: {
    color: "#f87171",
  },
  resultData: {
    color: "#7dd3fc",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  alertSuccess: {
    background: "var(--success-bg)",
    color: "var(--success)",
    border: "1px solid #bbf7d0",
  },
  alertError: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1px solid #fecaca",
  },
  otpContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    margin: "16px 0",
  },
  otpInput: {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
    border: "2px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    color: "var(--text)",
    fontFamily: "var(--mono)",
    outline: "none",
    boxSizing: "border-box",
  },
};

// -------------------------------------------------------------
// 工具函数：把 safeParse 结果格式化成高亮 JSON
// -------------------------------------------------------------
function formatParseResult(result) {
  if (result.success) {
    return (
      <span style={styles.resultSuccess}>
        {"✅ success: true\n"}
        <span style={styles.resultData}>
          {"data: " + JSON.stringify(result.data, null, 2)}
        </span>
      </span>
    );
  }
  const issues = result.error.issues.map((iss) => ({
    path: iss.path.join(".") || "(root)",
    message: iss.message,
    code: iss.code,
  }));
  return (
    <span style={styles.resultError}>
      {"❌ success: false\n"}
      <span style={styles.resultError}>
        {"error.issues: " + JSON.stringify(issues, null, 2)}
      </span>
    </span>
  );
}

// 把 Schema 定义源码以字符串形式展示（教学用）
function SchemaSource({ code }) {
  return (
    <div>
      <span style={styles.codeLabel}>Schema 定义</span>
      <pre style={styles.codeBlock}>{code}</pre>
    </div>
  );
}

// -------------------------------------------------------------
// Demo 1：注册表单
// -------------------------------------------------------------
// Schema 设计要点：
//   - username: 3-20 字符，只能字母数字下划线
//   - email: 邮箱格式
//   - password: 至少 8 位，必须包含大小写字母和数字（用 refine）
//   - confirmPassword: 用 refine 确保和 password 一致
//   - agreeTerms: 必须为 true（同意条款才能注册）
// -------------------------------------------------------------
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少 3 个字符")
      .max(20, "用户名最多 20 个字符")
      .regex(/^[a-zA-Z0-9_]+$/, "只能包含字母、数字、下划线"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z
      .string()
      .min(8, "密码至少 8 位")
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "密码必须包含大小写字母和数字"
      ),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v === true, "必须同意服务条款"),
  })
  // 对象级 refine：跨字段校验，用 path 把错误挂到 confirmPassword 字段
  .refine(
    (data) => data.password === data.confirmPassword,
    { message: "两次输入的密码不一致", path: ["confirmPassword"] }
  );

const registerSchemaSource = `const registerSchema = z
  .object({
    username: z.string()
      .min(3, "用户名至少 3 个字符")
      .max(20, "用户名最多 20 个字符")
      .regex(/^[a-zA-Z0-9_]+$/, "只能包含字母、数字、下划线"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z.string()
      .min(8, "密码至少 8 位")
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "密码必须包含大小写字母和数字"
      ),
    confirmPassword: z.string(),
    agreeTerms: z.boolean()
      .refine((v) => v === true, "必须同意服务条款"),
  })
  // path: ["confirmPassword"] 让错误显示在确认密码字段下
  .refine(
    (data) => data.password === data.confirmPassword,
    { message: "两次输入的密码不一致", path: ["confirmPassword"] }
  );`;

function RegisterDemo() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(null);
  // touched：记录用户已聚焦过的字段，只有 touched 的字段才会显示校验错误
  const { touched, handleFocus } = useTouchedFields();

  // 实时校验：每次输入变化都 safeParse 一次
  const parseResult = useMemo(() => {
    return registerSchema.safeParse(form);
  }, [form]);

  // 按字段名提取错误（用 flatten 把 issues 转成 { fieldName: [msg] }）
  const fieldErrors = useMemo(() => {
    if (parseResult.success) return {};
    return parseResult.error.flatten();
  }, [parseResult]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitted(null);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (parseResult.success) {
        setSubmitted({
          success: true,
          message: `注册成功！欢迎 ${parseResult.data.username}`,
        });
      } else {
        setSubmitted({
          success: false,
          message: "表单校验未通过，请检查标红字段",
        });
      }
    },
    [parseResult]
  );

  // 输入框样式：touched 后才显示红/绿边框，避免初始空表单就标红
  const inputStyle = (field) => {
    const hasError = touched[field] && fieldErrors[field] && form[field];
    const isValid =
      touched[field] && !hasError && form[field] && form[field].length > 0;
    return {
      ...styles.input,
      ...(hasError ? styles.inputError : {}),
      ...(isValid ? styles.inputSuccess : {}),
    };
  };

  return (
    <div style={styles.card}>
      {/* 左侧：表单 */}
      <div style={styles.cardLeft}>
        <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>📝 用户注册</h3>

        {submitted && (
          <div
            style={{
              ...styles.alert,
              ...(submitted.success ? styles.alertSuccess : styles.alertError),
            }}
          >
            {submitted.success ? "✅ " : "⚠️ "}
            {submitted.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>用户名</label>
            <input
              style={inputStyle("username")}
              type="text"
              placeholder="3-20 位字母数字下划线"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              onFocus={() => handleFocus("username")}
            />
            {touched.username && fieldErrors.username ? (
              <div style={styles.errorText}>{fieldErrors.username[0]}</div>
            ) : (
              form.username && (
                <div style={styles.successText}>用户名可用</div>
              )
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>邮箱</label>
            <input
              style={inputStyle("email")}
              type="text"
              placeholder="example@domain.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              onFocus={() => handleFocus("email")}
            />
            {touched.email && fieldErrors.email && (
              <div style={styles.errorText}>{fieldErrors.email[0]}</div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>密码</label>
            <input
              style={inputStyle("password")}
              type="password"
              placeholder="至少 8 位，含大小写字母和数字"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onFocus={() => handleFocus("password")}
            />
            {touched.password && fieldErrors.password ? (
              <div style={styles.errorText}>{fieldErrors.password[0]}</div>
            ) : (
              <div style={styles.hint}>密码必须包含大写、小写字母和数字</div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>确认密码</label>
            <input
              style={inputStyle("confirmPassword")}
              type="password"
              placeholder="再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              onFocus={() => handleFocus("confirmPassword")}
            />
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <div style={styles.errorText}>
                {fieldErrors.confirmPassword[0]}
              </div>
            )}
          </div>

          <div style={{ ...styles.fieldGroup, ...styles.checkboxRow }}>
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => updateField("agreeTerms", e.target.checked)}
              onFocus={() => handleFocus("agreeTerms")}
              style={{ marginTop: "2px" }}
            />
            <span>
              我已阅读并同意 <a href="#" style={{ color: "var(--primary)" }} onClick={(e) => e.preventDefault()}>服务条款</a> 和{" "}
              <a href="#" style={{ color: "var(--primary)" }} onClick={(e) => e.preventDefault()}>隐私政策</a>
            </span>
          </div>
          {touched.agreeTerms && fieldErrors.agreeTerms && (
            <div style={{ ...styles.errorText, marginBottom: "12px" }}>
              {fieldErrors.agreeTerms[0]}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(!parseResult.success ? styles.buttonDisabled : {}),
            }}
            disabled={!parseResult.success}
          >
            注册
          </button>
        </form>
      </div>

      {/* 右侧：Schema 定义 + 实时校验结果 */}
      <div style={styles.cardRight}>
        <SchemaSource code={registerSchemaSource} />
        <div style={styles.codeDivider} />
        <span style={styles.codeLabel}>实时 safeParse 结果</span>
        <pre style={styles.codeBlock}>{formatParseResult(parseResult)}</pre>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Demo 2：OTP 验证码
// -------------------------------------------------------------
// Schema 设计要点：
//   - code: 6 位纯数字字符串（用 length + regex 约束）
//   - 用 transform 把输入转成数字类型（展示类型转换能力）
// -------------------------------------------------------------
const otpSchema = z.object({
  code: z
    .string()
    .length(6, "验证码必须是 6 位")
    .regex(/^\d{6}$/, "验证码只能包含数字")
    .transform((val) => parseInt(val, 10)),
});

const otpSchemaSource = `const otpSchema = z.object({
  code: z.string()
    .length(6, "验证码必须是 6 位")
    .regex(/^\\d{6}$/, "验证码只能包含数字")
    .transform((val) => parseInt(val, 10)),  // 校验通过后转成数字
});`;

function OtpDemo() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [submitted, setSubmitted] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendTimes, setResendTimes] = useState(0);
  const inputRefs = useRef([]);
  // 6 个格子作为一个整体字段 code：任一格聚焦都视为用户已开始填写
  const { touched, handleFocus } = useTouchedFields();

  // 把 6 个输入框的值拼成完整 code
  const code = digits.join("");

  // 实时校验
  const parseResult = useMemo(() => {
    return otpSchema.safeParse({ code });
  }, [code]);

  const fieldErrors = useMemo(() => {
    if (parseResult.success) return {};
    return parseResult.error.flatten();
  }, [parseResult]);

  // 重发倒计时逻辑
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // 处理单个输入框的变化：只接受数字，自动跳到下一格
  const handleChange = useCallback((index, value) => {
    // 只保留数字，只取最后一位
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setSubmitted(null);

    // 输入后自动跳到下一格
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  // 处理退格：当前格为空时跳回上一格
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  // 处理粘贴：把粘贴内容拆分到 6 个格子
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = pasted.split("");
      while (newDigits.length < 6) newDigits.push("");
      setDigits(newDigits);
      setSubmitted(null);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (parseResult.success) {
        setSubmitted({
          success: true,
          message: `验证成功！验证码: ${parseResult.data.code}（已转为数字类型）`,
        });
      } else {
        setSubmitted({
          success: false,
          message: "请输入完整的 6 位验证码",
        });
      }
    },
    [parseResult]
  );

  const handleResend = useCallback(() => {
    if (resendCountdown > 0) return;
    setResendCountdown(60);
    setResendTimes((n) => n + 1);
    setSubmitted({
      success: true,
      message: `验证码已重新发送（第 ${resendTimes + 1} 次）`,
    });
  }, [resendCountdown, resendTimes]);

  const handleClear = useCallback(() => {
    setDigits(["", "", "", "", "", ""]);
    setSubmitted(null);
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.cardLeft}>
        <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>🔢 OTP 验证码</h3>

        {submitted && (
          <div
            style={{
              ...styles.alert,
              ...(submitted.success ? styles.alertSuccess : styles.alertError),
            }}
          >
            {submitted.success ? "✅ " : "⚠️ "}
            {submitted.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ ...styles.hint, marginBottom: "12px" }}>
            请输入发送到你手机的 6 位验证码（支持粘贴）
          </p>

          {/* 6 个独立输入框 */}
          <div style={styles.otpContainer} onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                style={{
                  ...styles.otpInput,
                  ...(touched.code && fieldErrors.code && !parseResult.success
                    ? styles.inputError
                    : {}),
                  ...(parseResult.success ? styles.inputSuccess : {}),
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => {
                  e.target.select();
                  handleFocus("code");
                }}
              />
            ))}
          </div>

          {touched.code && fieldErrors.code && (
            <div style={{ ...styles.errorText, textAlign: "center" }}>
              {fieldErrors.code[0]}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(!parseResult.success ? styles.buttonDisabled : {}),
              }}
              disabled={!parseResult.success}
            >
              验证
            </button>
            <button
              type="button"
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                ...(resendCountdown > 0 ? styles.buttonDisabled : {}),
              }}
              onClick={handleResend}
              disabled={resendCountdown > 0}
            >
              {resendCountdown > 0 ? `重新发送 (${resendCountdown}s)` : "重新发送"}
            </button>
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={handleClear}
            >
              清空
            </button>
          </div>
        </form>
      </div>

      <div style={styles.cardRight}>
        <SchemaSource code={otpSchemaSource} />
        <div style={styles.codeDivider} />
        <span style={styles.codeLabel}>实时 safeParse 结果</span>
        <pre style={styles.codeBlock}>{formatParseResult(parseResult)}</pre>
        <div style={styles.codeDivider} />
        <span style={styles.codeLabel}>说明</span>
        <pre style={styles.codeBlock}>
{`注意 transform 的作用：
  输入 code 是 string 类型 "123456"
  校验通过后 transform 把它转成 number 123456
  所以结果中 data.code 是数字类型

这是 mini-zod 的类型转换能力：
  Schema 不仅是校验器，也是「数据变换器」。`}
        </pre>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Demo 3：修改密码
// -------------------------------------------------------------
// Schema 设计要点：
//   - currentPassword: 非空字符串
//   - newPassword: 至少 8 位，含大小写字母和数字，且不能和当前密码相同
//   - confirmNewPassword: 必须和新密码一致
//   - 用对象级 refine 做跨字段校验
// -------------------------------------------------------------
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().nonempty("请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "新密码至少 8 位")
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "新密码必须包含大小写字母和数字"
      ),
    confirmNewPassword: z.string(),
  })
  // 跨字段校验 1：两次新密码一致，错误挂到 confirmNewPassword
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    { message: "两次输入的新密码不一致", path: ["confirmNewPassword"] }
  )
  // 跨字段校验 2：新密码不能和当前密码相同，错误挂到 newPassword
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    { message: "新密码不能与当前密码相同", path: ["newPassword"] }
  );

const passwordChangeSchemaSource = `const passwordChangeSchema = z
  .object({
    currentPassword: z.string().nonempty("请输入当前密码"),
    newPassword: z.string()
      .min(8, "新密码至少 8 位")
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "新密码必须包含大小写字母和数字"
      ),
    confirmNewPassword: z.string(),
  })
  // path 指定错误归属字段，方便 UI 在对应输入框下显示
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    { message: "两次输入的新密码不一致", path: ["confirmNewPassword"] }
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    { message: "新密码不能与当前密码相同", path: ["newPassword"] }
  );`;

// 模拟当前用户密码（演示用）
const MOCK_CURRENT_PASSWORD = "OldPass123";

function PasswordChangeDemo() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [submitted, setSubmitted] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  // touched：聚焦过的字段才显示校验错误
  const { touched, handleFocus } = useTouchedFields();

  const parseResult = useMemo(() => {
    return passwordChangeSchema.safeParse(form);
  }, [form]);

  const fieldErrors = useMemo(() => {
    if (parseResult.success) return {};
    return parseResult.error.flatten();
  }, [parseResult]);

  // 额外校验：当前密码是否正确（模拟服务端校验）
  const currentPasswordCorrect = form.currentPassword === MOCK_CURRENT_PASSWORD;

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitted(null);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!parseResult.success) {
        setSubmitted({ success: false, message: "表单校验未通过" });
        return;
      }
      // 模拟服务端校验当前密码
      if (!currentPasswordCorrect) {
        setSubmitted({
          success: false,
          message: "当前密码不正确（演示密码: OldPass123）",
        });
        return;
      }
      setSubmitted({
        success: true,
        message: "密码修改成功！请用新密码重新登录",
      });
    },
    [parseResult, currentPasswordCorrect]
  );

  const inputStyle = (field) => {
    const hasError = touched[field] && fieldErrors[field] && form[field];
    const isValid =
      touched[field] && !hasError && form[field] && form[field].length > 0;
    return {
      ...styles.input,
      ...(hasError ? styles.inputError : {}),
      ...(isValid ? styles.inputSuccess : {}),
    };
  };

  // 密码强度评估（简单版）
  const passwordStrength = useMemo(() => {
    const pwd = form.newPassword;
    if (!pwd) return { level: 0, text: "", color: "var(--text-muted)" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    const levels = [
      { level: 1, text: "很弱", color: "#ef4444" },
      { level: 2, text: "弱", color: "#f97316" },
      { level: 3, text: "中等", color: "#eab308" },
      { level: 4, text: "强", color: "#22c55e" },
      { level: 5, text: "很强", color: "#16a34a" },
      { level: 6, text: "极强", color: "#15803d" },
    ];
    return levels[Math.min(score, 6) - 1] || levels[0];
  }, [form.newPassword]);

  return (
    <div style={styles.card}>
      <div style={styles.cardLeft}>
        <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>🔑 修改密码</h3>

        {submitted && (
          <div
            style={{
              ...styles.alert,
              ...(submitted.success ? styles.alertSuccess : styles.alertError),
            }}
          >
            {submitted.success ? "✅ " : "⚠️ "}
            {submitted.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>当前密码</label>
            <input
              style={{
                ...inputStyle("currentPassword"),
                ...(form.currentPassword && !currentPasswordCorrect
                  ? styles.inputError
                  : {}),
              }}
              type={showPasswords ? "text" : "password"}
              placeholder="输入当前密码"
              value={form.currentPassword}
              onChange={(e) => updateField("currentPassword", e.target.value)}
              onFocus={() => handleFocus("currentPassword")}
            />
            {touched.currentPassword && fieldErrors.currentPassword ? (
              <div style={styles.errorText}>{fieldErrors.currentPassword[0]}</div>
            ) : form.currentPassword && !currentPasswordCorrect ? (
              <div style={styles.errorText}>
                当前密码不正确（演示密码: OldPass123）
              </div>
            ) : null}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>新密码</label>
            <input
              style={inputStyle("newPassword")}
              type={showPasswords ? "text" : "password"}
              placeholder="至少 8 位，含大小写字母和数字"
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              onFocus={() => handleFocus("newPassword")}
            />
            {touched.newPassword && fieldErrors.newPassword ? (
              <div style={styles.errorText}>{fieldErrors.newPassword[0]}</div>
            ) : null}

            {/* 密码强度条 */}
            {form.newPassword && (
              <div style={{ marginTop: "6px" }}>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(passwordStrength.level / 6) * 100}%`,
                      background: passwordStrength.color,
                      transition: "width 0.2s, background 0.2s",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: passwordStrength.color,
                    marginTop: "2px",
                  }}
                >
                  密码强度：{passwordStrength.text}
                </div>
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>确认新密码</label>
            <input
              style={inputStyle("confirmNewPassword")}
              type={showPasswords ? "text" : "password"}
              placeholder="再次输入新密码"
              value={form.confirmNewPassword}
              onChange={(e) =>
                updateField("confirmNewPassword", e.target.value)
              }
              onFocus={() => handleFocus("confirmNewPassword")}
            />
            {touched.confirmNewPassword && fieldErrors.confirmNewPassword && (
              <div style={styles.errorText}>
                {fieldErrors.confirmNewPassword[0]}
              </div>
            )}
          </div>

          <div style={{ ...styles.fieldGroup, ...styles.checkboxRow }}>
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              style={{ marginTop: "2px" }}
            />
            <span>显示密码</span>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(!parseResult.success || !currentPasswordCorrect
                ? styles.buttonDisabled
                : {}),
            }}
            disabled={!parseResult.success || !currentPasswordCorrect}
          >
            确认修改
          </button>
        </form>
      </div>

      <div style={styles.cardRight}>
        <SchemaSource code={passwordChangeSchemaSource} />
        <div style={styles.codeDivider} />
        <span style={styles.codeLabel}>实时 safeParse 结果</span>
        <pre style={styles.codeBlock}>{formatParseResult(parseResult)}</pre>
        <div style={styles.codeDivider} />
        <span style={styles.codeLabel}>说明</span>
        <pre style={styles.codeBlock}>
{`本 Schema 用了两个对象级 refine：
  1. 确认两次新密码一致
  2. 新密码不能和当前密码相同

对象级 refine 能访问所有字段的值，
适合做跨字段校验（单个字段的 refine 做不到）。

演示当前密码: "${MOCK_CURRENT_PASSWORD}"`}
        </pre>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 主页面组件
// -------------------------------------------------------------
export default function ZodMiniPage() {
  const [activeTab, setActiveTab] = useState("register");

  const tabs = [
    { id: "register", label: "📝 注册", component: <RegisterDemo /> },
    { id: "otp", label: "🔢 OTP 验证", component: <OtpDemo /> },
    { id: "password", label: "🔑 修改密码", component: <PasswordChangeDemo /> },
  ];

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 头部 */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span>🧩</span>
            mini-zod 实战
          </h1>
          <p style={styles.subtitle}>
            用 ~500 行手写的 Zod 迷你版，驱动注册 / OTP / 改密码三个真实表单。
            每次输入都会触发 safeParse 实时校验，右侧面板展示 Schema 定义与解析结果。
          </p>
        </div>

        {/* Tab 切换 */}
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 当前 Demo */}
        {active.component}
      </div>
    </div>
  );
}
