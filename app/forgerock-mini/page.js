"use client";

// =============================================================
// 文件：app/forgerock-mini/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /forgerock-mini 路由的主页面。用 mini-forgerock 库演示
//   ForgeRock 的"认证树驱动"认证模式：UI 不预先知道要收集什么，
//   而是根据服务端返回的 callbacks 动态渲染输入控件。
//
// 【三个 demo】
//   1. 🔐 登录（OTP）—— 账号密码 + 验证码 两步登录
//   2. 📝 注册   —— 4 步树：用户名 → 密码 → 资料 → 确认
//   3. 🔑 改密码 —— 3 步树：当前密码 → 新密码 → 确认
//
// 【布局】
//   左侧：动态表单（根据当前 Step 的 callbacks 类型渲染）
//   右侧：Tree 状态面板（stage / header / callbacks JSON / 已收集数据）
//
// 【技术亮点】
//   - CallbackRenderer：根据 callback.type 分发到不同输入控件
//     这正是 ForgeRock 的核心——服务端定义 UI 结构，客户端泛化渲染
//   - FRAuth.next(step) 驱动流程推进
//   - ValidatedCreatePasswordCallback 的策略实时校验
// =============================================================

import { useState, useMemo, useCallback, useEffect } from "react";
import { FRAuth, FRUser } from "./mini-forgerock";

// =============================================================
// 通用样式（沿用项目 CSS 变量，与 zod-mini 保持视觉一致）
// =============================================================
const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--sans)",
    padding: "32px 24px 64px",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "0 0 8px",
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
  },
  panel: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 16px",
    color: "var(--text)",
  },
  stage: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    background: "var(--bg-inline-code)",
    padding: "2px 8px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "8px",
  },
  stepHeader: {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 4px",
  },
  stepDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "var(--text)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    outline: "none",
    transition: "border-color 0.15s",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    outline: "none",
    cursor: "pointer",
  },
  hint: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
    lineHeight: 1.5,
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
    padding: "10px 24px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "var(--primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  buttonSecondary: {
    padding: "10px 24px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginRight: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  alertError: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1px solid var(--error)",
  },
  alertSuccess: {
    background: "var(--success-bg)",
    color: "var(--success)",
    border: "1px solid var(--success)",
  },
  alertInfo: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    border: "1px solid var(--primary)",
  },
  codeBlock: {
    background: "var(--bg-code)",
    color: "var(--text-code)",
    padding: "16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "12px",
    fontFamily: "var(--mono)",
    overflow: "auto",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "500px",
  },
  row: {
    display: "flex",
    gap: "12px",
    marginBottom: "8px",
    fontSize: "12px",
  },
  rowKey: {
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    minWidth: "80px",
  },
  rowVal: {
    color: "var(--text)",
    fontFamily: "var(--mono)",
    wordBreak: "break-all",
  },
};

// =============================================================
// CallbackRenderer —— 根据 callback.type 动态渲染输入控件
// -------------------------------------------------------------
// 这是 Tree-driven auth 的核心：UI 不写死字段，
// 而是拿到 service 返回的 callback 对象后按类型分发渲染。
// 新增一种 callback 类型只需在这里加一个 case。
// =============================================================
function CallbackRenderer({ callback, onChange }) {
  // 根据 callback 类型渲染不同 UI
  switch (callback.type) {
    case "NameCallback":
    case "ValidatedCreateUsernameCallback":
      return (
        <NameField
          label={callback.getPrompt()}
          type="text"
          callback={callback}
          onChange={onChange}
        />
      );

    case "PasswordCallback":
      return (
        <NameField
          label={callback.getPrompt()}
          type="password"
          callback={callback}
          onChange={onChange}
        />
      );

    case "ValidatedCreatePasswordCallback":
      return (
        <PasswordField callback={callback} onChange={onChange} />
      );

    case "ChoiceCallback":
      return (
        <ChoiceField callback={callback} onChange={onChange} />
      );

    case "ConfirmationCallback":
      // ConfirmationCallback 不需要输入框，按钮组在表单底部统一渲染
      // 这里返回 null，按钮放在 submit 区域
      return null;

    case "TextOutputCallback":
      return (
        <div style={styles.alertInfo}>{callback.getMessage()}</div>
      );

    default:
      return (
        <div style={styles.hint}>
          未知 callback 类型: {callback.type}
        </div>
      );
  }
}

// 普通文本/密码输入框
function NameField({ label, type, callback, onChange }) {
  const [value, setValue] = useState("");
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(callback, e.target.value);
        }}
        style={styles.input}
        autoComplete="off"
      />
    </div>
  );
}

// 带策略校验的密码框 + 实时反馈
function PasswordField({ callback, onChange }) {
  const [value, setValue] = useState("");
  const policies = callback.getPolicies();
  const check = useMemo(() => callback.validate(value), [value, callback]);

  return (
    <div style={styles.field}>
      <label style={styles.label}>{callback.getPrompt()}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(callback, e.target.value);
        }}
        style={styles.input}
        autoComplete="new-password"
      />
      {/* 实时策略校验提示 */}
      {value && (
        <div style={{ marginTop: "8px" }}>
          {policies.map((p, i) => {
            const ok =
              (!p.minLength || value.length >= p.minLength) &&
              (!p.regex || new RegExp(p.regex).test(value));
            return (
              <div
                key={i}
                style={{
                  fontSize: "12px",
                  color: ok ? "var(--success)" : "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {ok ? "✓ " : "○ "}
                {p.message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 下拉选择框
function ChoiceField({ callback, onChange }) {
  const [selected, setSelected] = useState(-1);
  return (
    <div style={styles.field}>
      <label style={styles.label}>{callback.getPrompt()}</label>
      <select
        value={selected}
        onChange={(e) => {
          const idx = parseInt(e.target.value, 10);
          setSelected(idx);
          onChange(callback, idx);
        }}
        style={styles.select}
      >
        <option value={-1}>请选择...</option>
        {callback.getChoices().map((choice, i) => (
          <option key={i} value={i}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );
}

// =============================================================
// 右侧 Tree 状态面板：显示当前 step 的元信息和 callbacks JSON
// =============================================================
function TreeStatusPanel({ step }) {
  if (!step) {
    return (
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Tree 状态</h3>
        <div style={styles.hint}>等待认证树启动...</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>Tree 状态</h3>

      {/* 元信息 */}
      <div style={styles.row}>
        <span style={styles.rowKey}>tree:</span>
        <span style={styles.rowVal}>{step.tree}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>stage:</span>
        <span style={styles.rowVal}>{step.stage}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>sessionId:</span>
        <span style={styles.rowVal}>{step.sessionId}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowKey}>success:</span>
        <span style={styles.rowVal}>{String(step.success)}</span>
      </div>
      {step.token && (
        <div style={styles.row}>
          <span style={styles.rowKey}>token:</span>
          <span style={styles.rowVal}>{step.token}</span>
        </div>
      )}
      {step.error && (
        <div style={styles.row}>
          <span style={styles.rowKey}>error:</span>
          <span style={{ ...styles.rowVal, color: "var(--error)" }}>
            {step.error}
          </span>
        </div>
      )}

      {/* callbacks JSON */}
      <h4
        style={{
          fontSize: "13px",
          fontWeight: 600,
          margin: "16px 0 8px",
          color: "var(--text-secondary)",
        }}
      >
        Callbacks（服务端下发）
      </h4>
      <pre style={styles.codeBlock}>
        {JSON.stringify(
          step.callbacks.map((cb) => ({
            type: cb.type,
            payload: cb.payload,
            input: cb.input,
          })),
          null,
          2
        )}
      </pre>
    </div>
  );
}

// =============================================================
// Demo 1：登录（OTP 两步）
// -------------------------------------------------------------
// 登录成功后用 FRUser.login 持久化 session（写入 localStorage）
// =============================================================
function LoginDemo() {
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="login"
      successMessage="登录成功！会话已建立"
      onComplete={async (finalStep) => {
        // 登录成功，用 FRUser 持久化 session（真实 SDK 会自动做这步）
        await FRUser.login(finalStep);
      }}
      onStepChange={setStep}
    >
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// Demo 2：注册（4 步树）
// =============================================================
function RegisterDemo() {
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="registration"
      successMessage="注册成功！用户已创建"
      onStepChange={setStep}
    >
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// Demo 3：修改密码（3 步树）
// =============================================================
function ChangePasswordDemo() {
  const [step, setStep] = useState(null);

  return (
    <AuthFlowWrapper
      treeName="changePassword"
      successMessage="密码修改成功！"
      onStepChange={setStep}
    >
      <TreeStatusPanel step={step} />
    </AuthFlowWrapper>
  );
}

// =============================================================
// AuthFlowWrapper —— 包装 AuthFlowRunner，捕获 step 给右侧面板
// -------------------------------------------------------------
// AuthFlowRunner 内部管理 step，但右侧面板也需要 step。
// 这里通过 onStepChange 回调把 step 透传出来。
// =============================================================
function AuthFlowWrapper({ treeName, onComplete, onRestart, onStepChange, successMessage, children }) {
  // 用一个状态捕获 AuthFlowRunner 内部的 step
  const [capturedStep, setCapturedStep] = useState(null);

  // 自定义版本的 AuthFlowRunner，额外暴露 step
  const [step, setStep] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const firstStep = await FRAuth.start(treeName);
      if (!cancelled) {
        setStep(firstStep);
        onStepChange && onStepChange(firstStep);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // onStepChange 是父组件 useState 的 setter，引用稳定，可安全加入依赖
  }, [treeName, onStepChange]);

  const handleCallbackChange = useCallback(
    (callback, value) => {
      if (!step) return;
      callback.setInput(value);
      const newStep = { ...step, callbacks: [...step.callbacks] };
      setStep(newStep);
      onStepChange && onStepChange(newStep);
    },
    [step, onStepChange]
  );

  const handleSubmit = async () => {
    if (!step) return;
    setLoading(true);
    setError("");

    const confirmCb = step.getCallback("ConfirmationCallback");
    if (confirmCb && confirmCb.getOutput() < 0) {
      confirmCb.select(0);
    }

    const nextStep = await FRAuth.next(step);
    setStep(nextStep);
    onStepChange && onStepChange(nextStep);

    if (nextStep.error) {
      setError(nextStep.error);
    } else if (nextStep.success) {
      onComplete && onComplete(nextStep);
    }
    setLoading(false);
  };

  const handleRestart = async () => {
    setLoading(true);
    setError("");
    onRestart && onRestart();
    const firstStep = await FRAuth.start(treeName);
    setStep(firstStep);
    onStepChange && onStepChange(firstStep);
    setLoading(false);
  };

  const leftPanel = (() => {
    if (!step) return <div style={styles.hint}>正在启动认证树...</div>;
    if (step.success) {
      return (
        <div>
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            ✓ {successMessage || "认证成功"}
            <br />
            Session Token: <code>{step.token}</code>
          </div>
          <button style={styles.button} onClick={handleRestart}>
            重新开始
          </button>
        </div>
      );
    }
    return (
      <div>
        <div style={styles.stage}>{step.stage}</div>
        <h3 style={styles.stepHeader}>{step.header}</h3>
        <p style={styles.stepDesc}>{step.description}</p>

        {error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            ✕ {error}
          </div>
        )}

        {step.callbacks.map((cb, i) => (
          <CallbackRenderer
            key={i}
            callback={cb}
            onChange={handleCallbackChange}
          />
        ))}

        <div style={{ ...styles.buttonGroup, marginTop: "20px" }}>
          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "处理中..." : "下一步"}
          </button>
          <button style={styles.buttonSecondary} onClick={handleRestart}>
            重新开始
          </button>
        </div>
      </div>
    );
  })();

  return (
    <div style={styles.card}>
      <div style={styles.panel}>{leftPanel}</div>
      {children}
    </div>
  );
}

// =============================================================
// 主页面：Tab 切换三个 demo
// =============================================================
const tabs = [
  { id: "login", label: "🔐 登录（OTP）", component: LoginDemo },
  { id: "register", label: "📝 注册", component: RegisterDemo },
  { id: "changePassword", label: "🔑 改密码", component: ChangePasswordDemo },
];

export default function ForgeRockMiniPage() {
  const [activeTab, setActiveTab] = useState("login");
  const ActiveComponent = tabs.find((t) => t.id === activeTab).component;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 页头 */}
        <div style={styles.header}>
          <h1 style={styles.title}>ForgeRock Mini SDK</h1>
          <p style={styles.subtitle}>
            手写迷你版 ForgeRock SDK，演示 Authentication Tree 驱动的渐进式认证。
            UI 不写死字段，而是根据服务端返回的 callbacks 动态渲染输入控件。
            <br />
            测试账号：<code>demo</code> / <code>Demo1234</code>（登录 demo 用）
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

        {/* 当前 demo */}
        <ActiveComponent />
      </div>
    </div>
  );
}
