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
//
// 【整体架构】
//   ZodMiniPage（主页面，Tab 切换）
//   ├── RegisterDemo（注册表单）
//   │   └── useTouchedFields + useMemo(safeParse) + 实时错误提示
//   ├── OtpDemo（OTP 验证码）
//   │   └── 6 个独立 input + 拼接成 code + transform 转数字
//   └── PasswordChangeDemo（修改密码）
//       └── 两个对象级 refine（跨字段校验）+ 密码强度条
//
// 【关键技术点】
//   1. useTouchedFields Hook：管理「字段已触碰」状态，
//      避免初始空表单就显示校验错误（聚焦后才检查）。
//   2. useMemo + safeParse：每次输入变化都重新校验，
//      利用 React 的 memo 避免无谓重算。
//   3. flatten()：把 ZodError 的 issues 数组扁平化成 { 字段名: [错误] }，
//      方便按字段名取错误信息渲染到对应输入框下方。
//   4. 对象级 refine + path：跨字段校验（如两次密码一致）时，
//      用 path 把错误挂到具体字段，让 UI 能在对应输入框下显示。
//   5. transform：OTP demo 演示了 string → number 的类型转换，
//      展示 Zod 不仅是校验器，也是数据变换器。
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { z } from "./mini-zod";

// -------------------------------------------------------------
// 通用 Hook：字段「已触碰」状态管理
// -------------------------------------------------------------
// 用途：解决「默认空表单就显示校验错误」的问题。
//
// 背景：如果表单一打开就把所有字段都 safeParse 一遍，空字段必然校验失败，
// 用户看到一堆红字会困惑（"我还没输入怎么就错了？"）。
// 解决：引入 touched 状态，只有用户「碰过」的字段才显示错误。
//
// 行为模式（业界标准：首次失焦后开始校验，之后实时更新）：
//   1. 默认所有字段都是 untouched（未触碰）→ 不显示任何错误
//   2. 用户首次失焦（blur）某字段时，标记为 touched → 显示该字段错误/成功状态
//   3. 字段一旦 touched，后续每次输入都实时更新校验状态（不再隐藏错误）
//   4. 提交表单时，若校验失败则把所有字段标记为 touched → 显示所有错误
//   5. resetTouched() 清空所有 touched 状态（用于清空/重置表单）
//
// 为什么用 blur 而不是 focus：
//   - onFocus：用户一进入字段还没打字就报错，体验太激进
//   - onBlur：用户离开字段（tab走/点其他地方）才开始校验，给用户输入机会
//   - touched 之后实时校验：用户已经"提交"过这个字段，继续打字时实时反馈是合理的
//
// 这就是业界表单库（react-hook-form / formik / Mantine Form）的标准模式。
// -------------------------------------------------------------
function useTouchedFields() {
  const [touched, setTouched] = useState({});

  // 首次失焦时标记字段为 touched（之后即使再 blur 也不重复 setState）
  const handleBlur = useCallback((field) => {
    setTouched((prev) =>
      prev[field] ? prev : { ...prev, [field]: true }
    );
  }, []);

  // 提交时一次性标记所有字段为 touched，让所有错误都显示出来
  // 场景：用户跳过某些字段直接点提交，此时这些字段的错误也应该可见
  const markAllTouched = useCallback((fieldNames) => {
    setTouched((prev) => {
      const next = { ...prev };
      for (const name of fieldNames) {
        next[name] = true;
      }
      return next;
    });
  }, []);

  // 重置 touched（清空表单时同步调用，让错误全部隐藏）
  const resetTouched = useCallback(() => setTouched({}), []);

  return { touched, handleBlur, markAllTouched, resetTouched };
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
    // 注意：移除了原 maxHeight: "700px"，因为页面根容器已经是滚动容器
    // (styles.page 设置了 height:100vh; overflowY:auto)，
    // 右侧面板再加固定 maxHeight 会导致「页面能滚 + 右侧也能滚」的双重滚动条，
    // 体验差。让两侧等高、由页面统一滚动更自然。
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
    // 用 border 简写而非 borderColor，避免与 input 的 border 简写在切换时冲突
    border: "1px solid var(--error)",
    boxShadow: "0 0 0 3px var(--error-bg)",
  },
  inputSuccess: {
    border: "1px solid var(--success)",
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
// 这是「教学型」展示：让用户直观看到 Schema 校验的内部数据结构。
// 成功时显示 data（可能经过 transform 转换），
// 失败时显示 issues 数组（path + message + code）。
//
// 颜色编码：
//   成功 → 绿色（resultSuccess）
//   失败 → 红色（resultError）
//   数据 → 蓝色（resultData，让 data 字段更醒目）
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
  // 失败时把 issues 整理成更易读的格式：
  //   path 用 "." 连接（如 "user.email"），空 path 显示 "(root)"
  //   保留 message 和 code，便于调试
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
// 这样用户能同时看到「Schema 长什么样」和「它产出的校验结果」，
// 形成完整的「声明 → 执行」因果链。
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
//   - username: 3-20 字符，只能字母数字下划线（用 min/max/regex 链式约束）
//   - email: 邮箱格式（用内置 email check）
//   - password: 至少 8 位 + 必须含大小写字母和数字（用 refine 做组合校验）
//   - confirmPassword: 字段级只校验是字符串，跨字段一致性用对象级 refine
//   - agreeTerms: 必须为 true（用 refine 强制勾选）
//
// 跨字段校验的关键：
//   对象级 refine 能访问整个 data 对象，可以比较 password 和 confirmPassword。
//   用 path: ["confirmPassword"] 把错误挂到确认密码字段，
//   这样 UI 能在确认密码输入框下方显示「两次密码不一致」。
//   如果不指定 path，错误会落到 _root，UI 无法定位到具体字段。
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
      // 字段级 refine：只关心当前字段值（password）
      // 校验「同时包含大小写字母和数字」这种组合约束
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "密码必须包含大小写字母和数字"
      ),
    confirmPassword: z.string(),
    // boolean 类型 + refine：强制勾选服务条款
    agreeTerms: z.boolean().refine((v) => v === true, "必须同意服务条款"),
  })
  // 对象级 refine：跨字段校验，用 path 把错误挂到 confirmPassword 字段
  // 注意这里 refine 的参数是整个 data 对象（而非单个字段值）
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
  // 表单状态：所有字段集中在 form 对象里，便于一次 setState 更新多个字段
  // agreeTerms 默认 false（checkbox 未勾选），符合用户预期
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(null);
  // touched：记录用户已失焦过的字段，只有 touched 的字段才会显示校验错误
  // 采用「首次 blur 后开始校验，之后实时更新」的业界标准模式
  const { touched, handleBlur, markAllTouched } = useTouchedFields();

  // 所有字段名列表，用于提交时 markAllTouched
  const fieldNames = ["username", "email", "password", "confirmPassword", "agreeTerms"];

  // 实时校验：每次输入变化都 safeParse 一次
  // useMemo 确保 form 没变时不会重复校验（性能优化）
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
        // 提交失败时把所有字段标记为 touched，让所有错误都显示出来
        // 否则用户跳过的字段不会显示错误，用户不知道哪里填错了
        markAllTouched(fieldNames);
        setSubmitted({
          success: false,
          message: "表单校验未通过，请检查标红字段",
        });
      }
    },
    [parseResult, markAllTouched]
  );

  // 输入框样式：touched 后才显示红/绿边框
  // 三种状态：
  //   默认（未 touched）：灰色边框
  //   touched + 有错误：红色边框（inputError）—— 包括空字段（nonempty 错误）
  //   touched + 无错误 + 有内容：绿色边框（inputSuccess）
  //
  // 修复：原来 hasError 里有 form[field] 判断，导致空字符串字段即使已 touched
  // 且有 nonempty 错误也不显示红边框（因为 "" 是 falsy）。
  // 现在只检查 touched[field] && fieldErrors[field]，空字段有错也会红边框。
  const inputStyle = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && form[field] && form[field].length > 0;
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
              onBlur={() => handleBlur("username")}
            />
            {touched.username && fieldErrors.username ? (
              <div style={styles.errorText}>{fieldErrors.username[0]}</div>
            ) : (
              touched.username && form.username && !fieldErrors.username && (
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
              onBlur={() => handleBlur("email")}
            />
            {touched.email && fieldErrors.email ? (
              <div style={styles.errorText}>{fieldErrors.email[0]}</div>
            ) : (
              touched.email && form.email && !fieldErrors.email && (
                <div style={styles.successText}>邮箱格式正确</div>
              )
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
              onBlur={() => handleBlur("password")}
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
              onBlur={() => handleBlur("confirmPassword")}
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
              onBlur={() => handleBlur("agreeTerms")}
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
// 【场景】6 位短信验证码输入框，常见于登录/支付/注册二次校验场景。
//
// 【UX 设计要点】
//   1. 拆成 6 个独立输入框（而非单个长输入框），视觉上更像「验证码」
//   2. 输入一位后自动跳到下一格（用户不需要手动 Tab）
//   3. 退格时若当前格已空，自动回到上一格（修正更顺手）
//   4. 支持粘贴整段验证码（用户从短信复制后一次粘贴即可填完）
//   5. 重发倒计时 60s，防止滥用
//
// 【Schema 设计要点】
//   - code: 6 位纯数字字符串（用 length + regex 约束）
//   - 用 transform 把字符串转成数字类型（展示 Zod 的类型转换能力）
//     真实业务中验证码经常需要作为数字传给后端 API，transform 一次到位
//   - 注意 transform 只在前面所有 check 通过后才执行，避免脏数据进入 transform
// -------------------------------------------------------------
const otpSchema = z.object({
  code: z
    .string()
    .length(6, "验证码必须是 6 位")
    .regex(/^\d{6}$/, "验证码只能包含数字")
    // transform：校验通过后把 "123456" 转成 123456
    // 这体现了 Zod「校验器 + 数据变换器」的二合一特性
    .transform((val) => parseInt(val, 10)),
});

const otpSchemaSource = `const otpSchema = z.object({
  code: z.string()
    .length(6, "验证码必须是 6 位")
    .regex(/^\\d{6}$/, "验证码只能包含数字")
    .transform((val) => parseInt(val, 10)),  // 校验通过后转成数字
});`;

function OtpDemo() {
  // 6 个格子的值用数组维护，比 6 个独立 state 更易管理
  // 初始值都是空字符串（不是 null/undefined），便于 join 和受控 input
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [submitted, setSubmitted] = useState(null);
  // 重发倒计时（秒），0 表示可重发
  const [resendCountdown, setResendCountdown] = useState(0);
  // 已重发次数（仅展示用，提示用户「第 N 次发送」）
  const [resendTimes, setResendTimes] = useState(0);
  // 收集 6 个 input 的 DOM 引用，用于程序化 focus（自动跳格、回退、清空后聚焦首格）
  const inputRefs = useRef([]);
  // 6 个格子作为一个整体字段 code：任一格失焦都视为用户已开始填写
  // 采用「首次 blur 后开始校验」模式，避免用户一点击格子就看到红字
  const { touched, handleBlur, markAllTouched, resetTouched } = useTouchedFields();

  // 把 6 个输入框的值拼成完整 code
  // 注意：join 会自动跳过空字符串（"" + "" + "1" = "1"），
  // 所以未填完时 code 长度 < 6，会被 length(6) 校验拦下
  const code = digits.join("");

  // 实时校验：每次 digits 变化（=> code 变化）都重新 safeParse
  // 由于 code 是字符串派生量，依赖 [code] 即可触发重新计算
  const parseResult = useMemo(() => {
    return otpSchema.safeParse({ code });
  }, [code]);

  const fieldErrors = useMemo(() => {
    if (parseResult.success) return {};
    return parseResult.error.flatten();
  }, [parseResult]);

  // 重发倒计时逻辑：每秒减 1，到 0 时停止
  // 关键：useEffect 的依赖是 resendCountdown 本身，
  // 每次 countdown 减 1 都会重新启动 setTimeout，形成自递减链条
  // cleanup 函数清掉上一次的 timer，避免组件卸载时 timer 还在跑（内存泄漏）
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // 处理单个输入框的变化：只接受数字，自动跳到下一格
  // 设计思路：input 的 value 可能是用户粘贴/输入的任意内容，
  // 先用 \D 去掉非数字，再 slice(-1) 只取最后一位
  // （这样用户在已有数字的格子里输入新数字会覆盖，符合直觉）
  const handleChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setSubmitted(null);

    // 输入后自动跳到下一格（只在有值且不是最后一格时跳）
    // 可选链 ?. 防止 inputRefs.current[index + 1] 为空时报错
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  // 处理退格：当前格为空时跳回上一格
  // 直觉体验：用户在空格按退格，预期是删除上一格的内容（而非什么都不做）
  // 注意：浏览器默认行为是「删除当前格内容」，所以只在「当前格已空」时才回退
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  // 处理粘贴：把粘贴内容拆分到 6 个格子
  // 场景：用户从短信 App 复制「123456」，在第一个格粘贴，应自动填满 6 格
  // 实现：从剪贴板取文本 → 去非数字 → 截前 6 位 → 拆成数组 → 不足 6 位补空字符串
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = pasted.split("");
      // 不足 6 位补空字符串，保持数组长度恒为 6
      while (newDigits.length < 6) newDigits.push("");
      setDigits(newDigits);
      setSubmitted(null);
      // 粘贴后标记 code 为已触碰（用户已操作验证码字段）
      // 修复：原代码粘贴后不标记 touched，导致粘贴不完整时错误不显示
      handleBlur("code");
      // 粘贴后聚焦到「下一个空格」或「最后一格」
      // Math.min(pasted.length, 5) 防止越界（pasted.length 可能等于 6）
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }, [handleBlur]);

  // 提交：parseResult 已经实时算好，直接用
  // 注意 parseResult.data.code 是 number 类型（因为 transform 转过），
  // 模板字符串会自动 toString，无需手动转换
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (parseResult.success) {
        setSubmitted({
          success: true,
          message: `验证成功！验证码: ${parseResult.data.code}（已转为数字类型）`,
        });
      } else {
        // 提交失败时标记 code 为 touched，让错误显示
        markAllTouched(["code"]);
        setSubmitted({
          success: false,
          message: "请输入完整的 6 位验证码",
        });
      }
    },
    [parseResult, markAllTouched]
  );

  // 重发验证码：开启 60s 倒计时 + 累计次数 + 提示
  // resendCountdown > 0 时按钮 disabled，防止重复点击
  const handleResend = useCallback(() => {
    if (resendCountdown > 0) return;
    setResendCountdown(60);
    setResendTimes((n) => n + 1);
    setSubmitted({
      success: true,
      message: `验证码已重新发送（第 ${resendTimes + 1} 次）`,
    });
  }, [resendCountdown, resendTimes]);

  // 清空：重置 digits 数组 + 清掉 submitted 状态 + 重置 touched + 聚焦到第一格
  // 修复：原代码不清 touched，导致清空后错误仍然显示
  const handleClear = useCallback(() => {
    setDigits(["", "", "", "", "", ""]);
    setSubmitted(null);
    resetTouched();
    inputRefs.current[0]?.focus();
  }, [resetTouched]);

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
          {/* onPaste 挂在容器上而非每个 input，这样无论粘贴发生在哪格都能统一处理 */}
          <div style={styles.otpContainer} onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                // 用块体赋值，避免箭头函数隐式返回赋值结果——
                // React 19 会把 ref 回调的返回值当作 cleanup 函数，返回非函数会告警
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                style={{
                  ...styles.otpInput,
                  // 视觉状态：touched + 校验失败 → 红框；校验成功 → 绿框
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
                  // 聚焦时全选当前格内容，方便用户直接覆盖输入
                  e.target.select();
                }}
                onBlur={() => handleBlur("code")}
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
// 【场景】用户已登录后修改密码，需要验证当前密码 + 输入新密码 + 确认新密码。
// 这类场景的难点在于跨字段校验：
//   - newPassword 必须和 confirmNewPassword 一致
//   - newPassword 不能等于 currentPassword（防止用户改了个寂寞）
// 这两条都是「跨字段」约束，单个字段的 refine 做不到，必须用对象级 refine。
//
// 【Schema 设计要点】
//   - currentPassword: 非空字符串（用 nonempty，比 min(1) 语义更清晰）
//   - newPassword: 至少 8 位 + 必须含大小写字母和数字（字段级 refine 做组合约束）
//   - confirmNewPassword: 字段级无约束（一致性校验由对象级 refine 负责）
//   - 两个对象级 refine 分别处理两种跨字段约束，并用 path 挂到不同字段
//
// 【path 的关键作用】
//   两条 refine 都涉及 newPassword，但错误应该显示在不同字段下：
//     - 「两次不一致」→ 错在 confirmNewPassword → path: ["confirmNewPassword"]
//     - 「新旧相同」 → 错在 newPassword     → path: ["newPassword"]
//   这样 UI 用 flatten() 取出错误后，能在对应输入框下方精准显示。
//   如果不指定 path，错误会落到 _root，UI 只能在表单顶部统一显示，体验差。
//
// 【两个 refine 的执行顺序】
//   refine 是「短路」的：第一个失败就立即返回，不会继续执行第二个。
//   所以如果「两次不一致」失败，用户不会同时看到「新旧相同」的错误。
//   这避免了错误信息爆炸，符合「一次只暴露一个问题」的 UX 原则。
// -------------------------------------------------------------
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().nonempty("请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "新密码至少 8 位")
      // 字段级 refine：只校验 newPassword 本身（不含其他字段）
      // 用正则同时检查大写、小写、数字三类字符
      .refine(
        (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
        "新密码必须包含大小写字母和数字"
      ),
    confirmNewPassword: z.string(),
  })
  // 跨字段校验 1：两次新密码一致，错误挂到 confirmNewPassword
  // 注意 refine 参数是整个 data 对象，能同时访问 newPassword 和 confirmNewPassword
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    { message: "两次输入的新密码不一致", path: ["confirmNewPassword"] }
  )
  // 跨字段校验 2：新密码不能和当前密码相同，错误挂到 newPassword
  // 防止用户「修改密码」后实际密码没变（容易让人误以为修改成功了）
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
// 真实场景这个校验在服务端做（前端不能存用户密码），
// 这里为了 demo 完整性，用一个常量模拟「服务端校验当前密码」的失败分支
const MOCK_CURRENT_PASSWORD = "OldPass123";

function PasswordChangeDemo() {
  // 三个字段集中在一个 form 对象里，便于一次 setState 更新多个字段
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [submitted, setSubmitted] = useState(null);
  // 显示/隐藏密码切换
  const [showPasswords, setShowPasswords] = useState(false);
  // touched：失焦过的字段才显示校验错误
  // currentPasswordError：提交后因「当前密码不正确」返回时标记为 true，
  // 用于在字段下方显示服务端校验错误（只在提交失败后显示，不在打字过程中报错）
  const { touched, handleBlur, markAllTouched } = useTouchedFields();
  const [currentPasswordError, setCurrentPasswordError] = useState(false);

  const fieldNames = ["currentPassword", "newPassword", "confirmNewPassword"];

  // 实时校验：每次 form 变化都 safeParse 一次
  const parseResult = useMemo(() => {
    return passwordChangeSchema.safeParse(form);
  }, [form]);

  const fieldErrors = useMemo(() => {
    if (parseResult.success) return {};
    return parseResult.error.flatten();
  }, [parseResult]);

  // 当前密码是否正确（模拟服务端校验）
  // 注意：这模拟的是「服务端」校验，前端本不该提前知道结果，
  // 所以它「只」在点击提交后用于展示错误，不参与提交按钮的 disabled 判断，
  // 也不在打字过程中显示错误（避免用户输到一半就看到「密码不正确」）。
  //
  // 修复：原来 disabled 条件里带了 !currentPasswordCorrect，导致当前密码错误时
  // 按钮被禁用、根本无法提交，handleSubmit 里「当前密码不正确」的分支成了死代码，
  // 演示服务端校验失败的效果永远无法触发。现在只按 Schema 校验结果决定 disabled。
  const currentPasswordCorrect = form.currentPassword === MOCK_CURRENT_PASSWORD;

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitted(null);
    // 用户修改当前密码时，清除之前提交产生的「密码不正确」错误
    if (field === "currentPassword") {
      setCurrentPasswordError(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!parseResult.success) {
        // Schema 校验失败：标记所有字段为 touched，让所有错误可见
        markAllTouched(fieldNames);
        setSubmitted({ success: false, message: "表单校验未通过，请检查标红字段" });
        return;
      }
      // 模拟服务端校验当前密码
      if (!currentPasswordCorrect) {
        // 服务端校验失败：标记 currentPassword 错误，让字段下方显示提示
        markAllTouched(["currentPassword"]);
        setCurrentPasswordError(true);
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
    [parseResult, currentPasswordCorrect, markAllTouched]
  );

  // 输入框样式：touched 后才显示红/绿边框
  // 修复：去掉 hasError 中 form[field] 的判断，空字段的 nonempty 错误也要红边框
  const inputStyle = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && form[field] && form[field].length > 0;
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
          {/* 当前密码字段 */}
          {/* 服务端密码错误只在提交后显示（currentPasswordError），打字过程中不报错 */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>当前密码</label>
            <input
              style={{
                ...inputStyle("currentPassword"),
                // 提交后服务端返回密码错误时，显示红框
                ...(currentPasswordError ? styles.inputError : {}),
              }}
              type={showPasswords ? "text" : "password"}
              placeholder="输入当前密码"
              value={form.currentPassword}
              onChange={(e) => updateField("currentPassword", e.target.value)}
              onBlur={() => handleBlur("currentPassword")}
            />
            {/* 错误优先级：Schema 空字段错误 > 服务端密码错误 */}
            {touched.currentPassword && fieldErrors.currentPassword ? (
              <div style={styles.errorText}>{fieldErrors.currentPassword[0]}</div>
            ) : currentPasswordError ? (
              <div style={styles.errorText}>
                当前密码不正确（演示密码: OldPass123）
              </div>
            ) : null}
          </div>

          {/* 新密码字段 */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>新密码</label>
            <input
              style={inputStyle("newPassword")}
              type={showPasswords ? "text" : "password"}
              placeholder="至少 8 位，含大小写字母和数字"
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              onBlur={() => handleBlur("newPassword")}
            />
            {touched.newPassword && fieldErrors.newPassword ? (
              <div style={styles.errorText}>{fieldErrors.newPassword[0]}</div>
            ) : null}

            {/* 密码强度条：仅在有输入时显示 */}
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

          {/* 确认新密码字段 */}
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
              onBlur={() => handleBlur("confirmNewPassword")}
            />
            {touched.confirmNewPassword && fieldErrors.confirmNewPassword && (
              <div style={styles.errorText}>
                {fieldErrors.confirmNewPassword[0]}
              </div>
            )}
          </div>

          {/* 显示密码切换 */}
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
              // 只按 Schema 校验结果禁用；当前密码是否正确属于「服务端校验」，
              // 提交后才判定，不在此提前拦截（否则永远无法触发服务端错误分支）
              ...(!parseResult.success ? styles.buttonDisabled : {}),
            }}
            disabled={!parseResult.success}
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
// 职责：用 Tab 切换三个 demo，每个 demo 独立维护自己的状态。
// 这种「Tab + 独立组件」结构的好处：
//   1. 切换 Tab 时未挂载的 demo 不占内存（React 卸载了它）
//   2. 每个 demo 的状态独立，互不影响
//   3. 新增 demo 只需在 tabs 数组里加一项，无需改主页面结构
// -------------------------------------------------------------
export default function ZodMiniPage() {
  // 当前激活的 Tab id，默认 "register"
  const [activeTab, setActiveTab] = useState("register");

  // Tab 配置：把每个 demo 的 JSX 元素预先创建好放进数组
  // 注意：component 是 <RegisterDemo /> 元素，不是组件函数本身
  // 这样 active.component 直接渲染即可，无需条件分支判断
  const tabs = [
    { id: "register", label: "📝 注册", component: <RegisterDemo /> },
    { id: "otp", label: "🔢 OTP 验证", component: <OtpDemo /> },
    { id: "password", label: "🔑 修改密码", component: <PasswordChangeDemo /> },
  ];

  // 找到当前激活的 Tab（每次 render 都 find 一次，开销可忽略）
  // 也可以用 tabs.find(...) ?? tabs[0] 兜底，但这里 activeTab 必在 tabs 中
  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 头部：标题 + 副标题说明本页用途 */}
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

        {/* Tab 切换栏：用按钮组而非 select，更直观 */}
        {/* activeTab === tab.id 时叠加 tabActive 样式（高亮） */}
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

        {/* 当前 Demo：直接渲染 active.component */}
        {/* 切换 Tab 时旧的 demo 组件会被卸载，状态被销毁 */}
        {/* 这意味着用户切回时是「重新开始」而非「接着填」，符合 demo 场景 */}
        {active.component}
      </div>
    </div>
  );
}
