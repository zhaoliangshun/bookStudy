"use client";
// =============================================================
// ForgeRock Mock Demo —— 不依赖 AM 服务器的完整流程演示
// -------------------------------------------------------------
// 用真实 SDK 的 FRStep / Callback API，但 step 由本地构造，
// 模拟一个两步登录流程：
//   Step1: UsernamePassword (NameCallback + PasswordCallback)
//   Step2: OTP (TextInputCallback)
//   LoginSuccess
//
// 测试账号：demo / demo123，OTP 任意
// =============================================================

import { useState, useEffect, useCallback } from "react";

// 动态导入 SDK，避免 SSR 阶段打包 redux/immer（SDK 只能在客户端运行）
// 真实 SDK 的 FRStep / CallbackType / StepType 都会被用到
let _sdk = null;
async function loadSdk() {
  if (_sdk) return _sdk;
  _sdk = await import("@forgerock/javascript-sdk");
  return _sdk;
}

export default function ForgeRockMockDemo() {
  // SDK 加载状态
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  // 业务状态
  const [step, setStep] = useState(null); // FRStep 实例
  const [status, setStatus] = useState("idle"); // idle | running | success | failure
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});
  const [logLines, setLogLines] = useState([]); // 操作日志（教学用）

  // 客户端挂载后加载 SDK
  useEffect(() => {
    loadSdk()
      .then(() => {
        setSdkReady(true);
        addLog("SDK 加载完成");
      })
      .catch((e) => {
        setSdkError(e.message);
        addLog("SDK 加载失败: " + e.message);
      });
  }, []);

  const addLog = useCallback((line) => {
    setLogLines((prev) => [
      ...prev.slice(-20), // 只保留最近 20 条
      `[${new Date().toLocaleTimeString()}] ${line}`,
    ]);
  }, []);

  // ---------- mock payload 构造 ----------
  // 这些 payload 模拟 AM 认证树返回的原始结构
  // FRStep 会用真实 callbackFactory 解析它们

  function makeUsernamePasswordStep(sdk) {
    return {
      type: sdk.StepType.Step,
      stage: "UsernamePassword",
      description: "请输入用户名和密码",
      callbacks: [
        {
          type: sdk.CallbackType.NameCallback,
          output: [{ name: "prompt", value: "用户名" }],
          input: [{ name: "IDToken1", value: "" }],
        },
        {
          type: sdk.CallbackType.PasswordCallback,
          output: [{ name: "prompt", value: "密码" }],
          input: [{ name: "IDToken2", value: "" }],
        },
      ],
    };
  }

  function makeOTPStep(sdk) {
    return {
      type: sdk.StepType.Step,
      stage: "OTP",
      description: "请输入 6 位短信验证码（任意输入即可）",
      callbacks: [
        {
          type: sdk.CallbackType.TextInputCallback,
          output: [{ name: "prompt", value: "验证码" }],
          input: [{ name: "IDToken1", value: "" }],
        },
      ],
    };
  }

  function makeLoginSuccess(sdk) {
    return {
      type: sdk.StepType.LoginSuccess,
      sessionId: "mock-session-" + Date.now(),
      // FRLoginSuccess 没有这些方法，但 mock 模式我们直接返回 plain object
      getDetail: () => "登录成功",
      getMessage: () => "Mock 登录成功",
    };
  }

  // 用真实 FRStep 包装 payload，享受 getCallbackOfType / setInputValue 等 API
  function wrapStep(sdk, payload) {
    return new sdk.FRStep(payload);
  }

  // 模拟 AM 的 next 逻辑：根据 stage 判断走哪一步
  async function mockNext(sdk, step) {
    await new Promise((r) => setTimeout(r, 400)); // 模拟网络延迟

    if (step.getStage() === "UsernamePassword") {
      const nameCb = step.getCallbackOfType(sdk.CallbackType.NameCallback);
      const pwdCb = step.getCallbackOfType(sdk.CallbackType.PasswordCallback);
      const name = nameCb.getInputValue();
      const pwd = pwdCb.getInputValue();
      addLog(`提交用户名: ${name}, 密码: ${"*".repeat(pwd.length)}`);

      if (name === "demo" && pwd === "demo123") {
        addLog("✓ 凭证正确，进入 OTP 步骤");
        return wrapStep(sdk, makeOTPStep(sdk));
      }
      addLog("✗ 凭证错误");
      return {
        type: sdk.StepType.LoginFailure,
        getDetail: () => "用户名或密码错误",
        getMessage: () => "用户名或密码错误（mock：正确的是 demo / demo123）",
      };
    }

    if (step.getStage() === "OTP") {
      const otpCb = step.getCallbackOfType(sdk.CallbackType.TextInputCallback);
      const otp = otpCb.getInputValue();
      addLog(`提交 OTP: ${otp}`);
      addLog("✓ OTP 验证通过（mock 模式不校验）");
      return makeLoginSuccess(sdk);
    }

    return {
      type: sdk.StepType.LoginFailure,
      getDetail: () => "未知 stage: " + step.getStage(),
    };
  }

  // ---------- 流程控制 ----------

  async function start() {
    try {
      const sdk = await loadSdk();
      setStatus("running");
      setError(null);
      setLogLines([]);
      addLog("开始认证树（mock）");
      const first = wrapStep(sdk, makeUsernamePasswordStep(sdk));
      setStep(first);
      setValues({});
      addLog(`收到 Step1: stage=${first.getStage()}, callbacks=${first.callbacks.map((c) => c.getType()).join(", ")}`);
    } catch (e) {
      setStatus("failure");
      setError(e.message);
    }
  }

  async function next() {
    if (!step) return;
    const sdk = await loadSdk();
    // 把表单值灌到 step 的 callback
    step.callbacks.forEach((cb) => {
      const prompt = cb.getOutputByName("prompt", cb.getType());
      const key = cb.getType() + "|" + prompt;
      cb.setInputValue(values[key] ?? "");
    });

    try {
      const result = await mockNext(sdk, step);
      if (result.type === sdk.StepType.LoginSuccess) {
        addLog("🎉 LoginSuccess");
        setStatus("success");
        setStep(null);
      } else if (result.type === sdk.StepType.LoginFailure) {
        addLog("💥 LoginFailure: " + result.getDetail());
        setStatus("failure");
        setError(result.getDetail());
        setStep(null);
      } else {
        // FRStep 实例
        addLog(`收到新 Step: stage=${result.getStage()}`);
        setStep(result);
        setValues({});
      }
    } catch (e) {
      setStatus("failure");
      setError(e.message);
      addLog("异常: " + e.message);
    }
  }

  function reset() {
    setStep(null);
    setStatus("idle");
    setError(null);
    setValues({});
    setLogLines([]);
  }

  // ---------- 渲染 ----------

  // 加载中
  if (!sdkReady && !sdkError) {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-loading">正在加载 @forgerock/javascript-sdk...</div>
        </div>
      </div>
    );
  }

  // SDK 加载失败
  if (sdkError) {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-error">
            <h3>SDK 加载失败</h3>
            <p>{sdkError}</p>
            <p style={{ opacity: 0.6, fontSize: 13 }}>
              可能是 SDK 依赖未安装，或 SSR 阶段误执行。请检查 <code>node_modules/@forgerock/javascript-sdk</code> 是否存在。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 登录成功
  if (status === "success") {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-success">
            <div className="fr-demo-success-icon">✓</div>
            <h2>登录成功</h2>
            <p>（mock）session 已建立</p>
            <div className="fr-demo-log">
              <div className="fr-demo-log-title">流程日志</div>
              <pre>{logLines.join("\n")}</pre>
            </div>
            <button className="fr-demo-btn" onClick={reset}>
              重新开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 登录失败
  if (status === "failure") {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-failure">
            <div className="fr-demo-failure-icon">×</div>
            <h2>登录失败</h2>
            <p className="fr-demo-failure-msg">{error}</p>
            <div className="fr-demo-log">
              <div className="fr-demo-log-title">流程日志</div>
              <pre>{logLines.join("\n")}</pre>
            </div>
            <button className="fr-demo-btn" onClick={start}>
              重试
            </button>
            <button className="fr-demo-btn fr-demo-btn-ghost" onClick={reset}>
              重置
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 初始状态
  if (!step) {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-intro">
            <h1>ForgeRock Mock Demo</h1>
            <p className="fr-demo-subtitle">
              用真实 <code>@forgerock/javascript-sdk</code> 的
              <code>FRStep</code> / <code>FRCallback</code> API，
              模拟一个两步登录流程（无需 AM 服务器）
            </p>
            <div className="fr-demo-flow">
              <div className="fr-demo-flow-step">
                <div className="fr-demo-flow-num">1</div>
                <div>用户名密码</div>
                <div className="fr-demo-flow-cb">NameCallback<br/>PasswordCallback</div>
              </div>
              <div className="fr-demo-flow-arrow">→</div>
              <div className="fr-demo-flow-step">
                <div className="fr-demo-flow-num">2</div>
                <div>OTP 验证码</div>
                <div className="fr-demo-flow-cb">TextInputCallback</div>
              </div>
              <div className="fr-demo-flow-arrow">→</div>
              <div className="fr-demo-flow-step fr-demo-flow-success">
                <div className="fr-demo-flow-num">✓</div>
                <div>LoginSuccess</div>
                <div className="fr-demo-flow-cb">登录完成</div>
              </div>
            </div>
            <div className="fr-demo-tip">
              <strong>测试账号：</strong>
              <code>demo</code> / <code>demo123</code>，OTP 任意
            </div>
            <button className="fr-demo-btn fr-demo-btn-primary" onClick={start}>
              开始登录
            </button>
          </div>
        </div>
        <DemoStyles />
      </div>
    );
  }

  // 渲染当前 step 的表单
  const stage = step.getStage();
  const description = step.getDescription();
  const header = step.getHeader?.() ?? description ?? stage;

  return (
    <div className="fr-demo-wrap">
      <div className="fr-demo-card">
        <div className="fr-demo-step-header">
          <span className="fr-demo-stage-badge">stage: {stage}</span>
          <h2>{header}</h2>
          {description && description !== header && (
            <p className="fr-demo-step-desc">{description}</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="fr-demo-form"
        >
          {step.callbacks.map((cb, i) => {
            const prompt = cb.getOutputByName("prompt", cb.getType());
            const key = cb.getType() + "|" + prompt;
            const isPassword = cb.getType() === "PasswordCallback";
            const cbType = cb.getType();
            return (
              <div key={i} className="fr-demo-field">
                <label className="fr-demo-label">
                  <span className="fr-demo-label-text">{prompt}</span>
                  <span className="fr-demo-label-type">{cbType}</span>
                </label>
                <input
                  type={isPassword ? "password" : "text"}
                  value={values[key] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                  className="fr-demo-input"
                  placeholder={isPassword ? "输入密码" : `输入${prompt}`}
                  autoFocus={i === 0}
                />
              </div>
            );
          })}
          <button type="submit" className="fr-demo-btn fr-demo-btn-primary">
            下一步
          </button>
        </form>

        <div className="fr-demo-log">
          <div className="fr-demo-log-title">流程日志</div>
          <pre>{logLines.join("\n")}</pre>
        </div>
      </div>
      <DemoStyles />
    </div>
  );
}

// 局部样式（避免污染全局，所有 class 带 fr-demo 前缀）
function DemoStyles() {
  return (
    <style jsx global>{`
      .fr-demo-wrap {
        min-height: 100vh;
        padding: 32px 16px;
        background: linear-gradient(135deg, #f6f8fc 0%, #eef2f9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      }
      .fr-demo-card {
        width: 100%;
        max-width: 520px;
        background: #fff;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 24px rgba(30, 60, 120, 0.08);
      }
      .fr-demo-loading,
      .fr-demo-error,
      .fr-demo-success,
      .fr-demo-failure,
      .fr-demo-intro {
        text-align: center;
        color: #1a2b4a;
      }
      .fr-demo-intro h1 {
        font-size: 22px;
        margin: 0 0 8px;
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .fr-demo-subtitle {
        color: #5b6b85;
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 24px;
      }
      .fr-demo-subtitle code {
        background: #eef2f9;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: #2563eb;
      }
      .fr-demo-flow {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr;
        align-items: center;
        gap: 8px;
        margin: 24px 0;
      }
      .fr-demo-flow-step {
        padding: 14px 8px;
        background: #f6f8fc;
        border-radius: 10px;
        border: 1px solid #e3e9f5;
        font-size: 13px;
        color: #1a2b4a;
      }
      .fr-demo-flow-step.fr-demo-flow-success {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #065f46;
      }
      .fr-demo-flow-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #2563eb;
        color: #fff;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
      }
      .fr-demo-flow-success .fr-demo-flow-num {
        background: #10b981;
      }
      .fr-demo-flow-cb {
        font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 11px;
        color: #5b6b85;
        margin-top: 4px;
        line-height: 1.4;
      }
      .fr-demo-flow-arrow {
        color: #9aa8c0;
        font-size: 18px;
      }
      .fr-demo-tip {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #9a3412;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        margin: 16px 0;
      }
      .fr-demo-tip code {
        background: #ffedd5;
        padding: 1px 6px;
        border-radius: 4px;
        font-family: var(--mono, ui-monospace, monospace);
      }
      .fr-demo-btn {
        background: #2563eb;
        color: #fff;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        margin: 4px;
      }
      .fr-demo-btn:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }
      .fr-demo-btn-primary {
        width: 100%;
        margin-top: 8px;
      }
      .fr-demo-btn-ghost {
        background: transparent;
        color: #5b6b85;
        border: 1px solid #d1d9e6;
      }
      .fr-demo-btn-ghost:hover {
        background: #f6f8fc;
        color: #1a2b4a;
      }
      .fr-demo-step-header {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #eef2f9;
      }
      .fr-demo-stage-badge {
        display: inline-block;
        font-family: var(--mono, monospace);
        font-size: 11px;
        background: #eef2f9;
        color: #2563eb;
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 8px;
      }
      .fr-demo-step-header h2 {
        margin: 0 0 4px;
        font-size: 18px;
        color: #1a2b4a;
      }
      .fr-demo-step-desc {
        margin: 0;
        font-size: 13px;
        color: #5b6b85;
      }
      .fr-demo-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .fr-demo-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .fr-demo-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #1a2b4a;
      }
      .fr-demo-label-type {
        font-family: var(--mono, monospace);
        font-size: 11px;
        color: #9aa8c0;
        background: #f6f8fc;
        padding: 1px 6px;
        border-radius: 4px;
      }
      .fr-demo-input {
        padding: 10px 12px;
        border: 1px solid #d1d9e6;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.15s;
        background: #fff;
        color: #1a2b4a;
      }
      .fr-demo-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }
      .fr-demo-log {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px dashed #e3e9f5;
      }
      .fr-demo-log-title {
        font-size: 12px;
        color: #9aa8c0;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .fr-demo-log pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 12px;
        border-radius: 8px;
        font-family: var(--mono, ui-monospace, monospace);
        font-size: 11px;
        line-height: 1.6;
        overflow-x: auto;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
      }
      .fr-demo-success-icon,
      .fr-demo-failure-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 28px;
        font-weight: 700;
        color: #fff;
      }
      .fr-demo-success-icon {
        background: #10b981;
      }
      .fr-demo-failure-icon {
        background: #ef4444;
      }
      .fr-demo-failure-msg {
        color: #b91c1c;
        font-size: 14px;
        margin: 8px 0 16px;
      }
    `}</style>
  );
}
