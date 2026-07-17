"use client";
// =============================================================
// 文件：app/forgerock-demo/ForgeRockMockDemo.jsx
// -------------------------------------------------------------
// 【整体职责】
//   在不依赖真实 ForgeRock AM 服务器的前提下，演示一个完整的
//   "认证树（Authentication Tree）" 两步登录流程：
//     Step1: 用户名 + 密码（NameCallback + PasswordCallback）
//     Step2: OTP 短信验证码（TextInputCallback）
//     终态：LoginSuccess / LoginFailure
//
// 【关键设计】
//   1. 使用真实 npm 包 @forgerock/javascript-sdk 的 FRStep / FRCallback
//      类来解析 callback payload，从而享受 SDK 自带的便捷 API：
//        - step.getStage()        读取当前阶段标识
//        - step.getCallbackOfType 按 CallbackType 取出某个 callback
//        - cb.getInputValue()     读取用户输入
//        - cb.setInputValue()     写入用户输入
//   2. "AM 服务器"由本组件内的 mockNext() 函数模拟：根据 stage
//      决定下一步返回什么 payload，用 setTimeout 模拟网络延迟。
//   3. 动态 import SDK：SDK 内部依赖 redux/immer 等只能在浏览器运行
//      的库，若走 SSR 会让 Next.js 报错；用 await import() 把它
//      挪到客户端运行时再加载，并通过模块级 _sdk 变量做单例缓存。
//
// 【测试账号】demo / demo123，OTP 任意输入即可通过
// =============================================================

import { useState, useEffect } from "react";

// ---- SDK 单例缓存 ----
// 模块级变量 _sdk：第一次调用 loadSdk() 时执行动态 import，
// 后续调用直接返回缓存的 module namespace 对象，避免重复加载。
// 注意：缓存的是 import() 返回的 module 对象（包含所有命名导出），
// 因此后续使用方式是 sdk.FRStep / sdk.StepType / sdk.CallbackType。
let _sdk = null;
async function loadSdk() {
  if (_sdk) return _sdk;
  _sdk = await import("@forgerock/javascript-sdk");
  return _sdk;
}

export default function ForgeRockMockDemo() {
  // ---- SDK 加载相关状态 ----
  // sdkReady：SDK 是否已加载完成，控制首屏 loading 占位
  const [sdkReady, setSdkReady] = useState(false);
  // sdkError：SDK 加载失败的错误信息（如依赖未安装）
  const [sdkError, setSdkError] = useState(null);

  // ---- 业务状态 ----
  // step：当前 FRStep 实例，null 表示尚未开始或已结束
  const [step, setStep] = useState(null);
  // status：整体流程状态机
  //   idle    未开始
  //   running 正在进行中（已展示表单，等待用户提交）
  //   success 登录成功
  //   failure 登录失败
  const [status, setStatus] = useState("idle");
  // error：失败原因，展示在 failure 页面
  const [error, setError] = useState(null);
  // values：表单输入值，key 格式为 "CallbackType|prompt"
  //   例如 "NameCallback|用户名" -> "demo"
  const [values, setValues] = useState({});
  // logLines：流程日志（教学演示用），最多保留最近 20 条
  const [logLines, setLogLines] = useState([]);

  // ---- 操作日志工具函数 ----
  // 用 function 声明：会被 JavaScript 引擎 hoist 到作用域顶部，
  // 因此即使写在 useEffect 之后也能在 useEffect 内被调用
  // （function 声明不存在 TDZ，TDZ 只影响 let / const）。
  // 内部使用 functional update（prev => ...），因此即使闭包
  // 捕获的是旧函数引用，也能基于最新 state 正确追加日志。
  function addLog(line) {
    setLogLines((prev) => [
      ...prev.slice(-20), // 只保留最近 20 条，避免无限增长
      `[${new Date().toLocaleTimeString()}] ${line}`,
    ]);
  }

  // ---- 客户端挂载后异步加载 SDK ----
  // 依赖数组为 []：只在挂载后执行一次。
  // 这里调用 addLog() 是安全的——function 声明被 hoist，
  // 且 addLog 内部用 functional update 不依赖外部变量。
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

  // ============================================================
  // mock payload 构造函数
  // ------------------------------------------------------------
  // 这些函数返回的 plain object 模拟 AM 认证树返回的原始 JSON。
  // 结构遵循 ForgeRock callback 协议：
  //   {
  //     type: StepType.Step,         // 步骤类型
  //     stage: "UsernamePassword",   // 阶段标识，前端可据此定制 UI
  //     description: "...",          // 步骤描述
  //     callbacks: [                 // 该步骤需要收集的输入
  //       {
  //         type: CallbackType.NameCallback,
  //         output: [{ name: "prompt", value: "用户名" }],  // 服务端下发的提示
  //         input:  [{ name: "IDToken1", value: "" }],       // 客户端填入的值
  //       },
  //       ...
  //     ]
  //   }
  // 用 new sdk.FRStep(payload) 包装后，即可使用 SDK 的便捷 API。
  // ============================================================

  // Step1：用户名 + 密码
  function makeUsernamePasswordStep(sdk) {
    return {
      type: sdk.StepType.Step,
      stage: "UsernamePassword",
      description: "请输入用户名和密码",
      callbacks: [
        {
          // NameCallback：文本输入，对应用户名
          type: sdk.CallbackType.NameCallback,
          output: [{ name: "prompt", value: "用户名" }],
          input: [{ name: "IDToken1", value: "" }],
        },
        {
          // PasswordCallback：密码输入，前端渲染为 type="password"
          type: sdk.CallbackType.PasswordCallback,
          output: [{ name: "prompt", value: "密码" }],
          input: [{ name: "IDToken2", value: "" }],
        },
      ],
    };
  }

  // Step2：OTP 验证码
  function makeOTPStep(sdk) {
    return {
      type: sdk.StepType.Step,
      stage: "OTP",
      description: "请输入 6 位短信验证码（任意输入即可）",
      callbacks: [
        {
          // TextInputCallback：通用文本输入，这里用于 OTP
          type: sdk.CallbackType.TextInputCallback,
          output: [{ name: "prompt", value: "验证码" }],
          input: [{ name: "IDToken1", value: "" }],
        },
      ],
    };
  }

  // 终态：登录成功
  // 注意：真实 SDK 的 FRLoginSuccess 是一个类实例，
  // 这里 mock 模式直接返回带 getDetail / getMessage 方法的 plain object，
  // 因为后续只调用 result.type 和 result.getDetail()，不调用 FRStep 方法。
  function makeLoginSuccess(sdk) {
    return {
      type: sdk.StepType.LoginSuccess,
      sessionId: "mock-session-" + Date.now(),
      getDetail: () => "登录成功",
      getMessage: () => "Mock 登录成功",
    };
  }

  // 用真实 FRStep 包装 payload
  // 包装后即可使用 step.getStage() / step.getCallbackOfType() 等 API
  function wrapStep(sdk, payload) {
    return new sdk.FRStep(payload);
  }

  // ============================================================
  // mockNext：模拟 AM 服务器的 "下一步" 逻辑
  // ------------------------------------------------------------
  // 真实流程中，前端会把当前 step（含用户输入）POST 给 AM，
  // AM 返回下一个 step 或终态。这里用本地函数模拟该过程：
  //   - 用 setTimeout 模拟 400ms 网络延迟
  //   - 根据 step.getStage() 判断当前所处阶段
  //   - UsernamePassword 阶段：校验 demo/demo123，正确则进入 OTP
  //   - OTP 阶段：不校验内容，直接返回 LoginSuccess
  // ============================================================
  async function mockNext(sdk, step) {
    // 模拟网络延迟，让 loading 体验更真实
    await new Promise((r) => setTimeout(r, 400));

    if (step.getStage() === "UsernamePassword") {
      // 取出用户填写的用户名和密码
      const nameCb = step.getCallbackOfType(sdk.CallbackType.NameCallback);
      const pwdCb = step.getCallbackOfType(sdk.CallbackType.PasswordCallback);
      // getInputValue() 返回 input 数组第一个元素的 value
      const name = nameCb.getInputValue();
      const pwd = pwdCb.getInputValue();
      addLog(`提交用户名: ${name}, 密码: ${"*".repeat(pwd.length)}`);

      // 校验测试账号
      if (name === "demo" && pwd === "demo123") {
        addLog("✓ 凭证正确，进入 OTP 步骤");
        return wrapStep(sdk, makeOTPStep(sdk));
      }
      // 凭证错误：返回 LoginFailure 终态
      addLog("✗ 凭证错误");
      return {
        type: sdk.StepType.LoginFailure,
        getDetail: () => "用户名或密码错误",
        getMessage: () => "用户名或密码错误（mock：正确的是 demo / demo123）",
      };
    }

    if (step.getStage() === "OTP") {
      // OTP 阶段：mock 模式不校验内容，任意输入都通过
      const otpCb = step.getCallbackOfType(sdk.CallbackType.TextInputCallback);
      const otp = otpCb.getInputValue();
      addLog(`提交 OTP: ${otp}`);
      addLog("✓ OTP 验证通过（mock 模式不校验）");
      return makeLoginSuccess(sdk);
    }

    // 未知 stage：返回失败，便于排查流程错误
    return {
      type: sdk.StepType.LoginFailure,
      getDetail: () => "未知 stage: " + step.getStage(),
    };
  }

  // ============================================================
  // 流程控制函数
  // ============================================================

  // start：开始认证流程，构造第一个 step 并展示表单
  async function start() {
    try {
      const sdk = await loadSdk();
      setStatus("running");
      setError(null);
      setLogLines([]);
      addLog("开始认证树（mock）");
      // 构造 Step1（用户名密码）并用 FRStep 包装
      const first = wrapStep(sdk, makeUsernamePasswordStep(sdk));
      setStep(first);
      setValues({});
      // 打印收到的 callback 类型列表，方便调试
      addLog(
        `收到 Step1: stage=${first.getStage()}, callbacks=${first.callbacks
          .map((c) => c.getType())
          .join(", ")}`
      );
    } catch (e) {
      setStatus("failure");
      setError(e.message);
    }
  }

  // next：用户点击"下一步"时调用
  //   1. 把表单输入值灌入当前 step 的 callback
  //   2. 调用 mockNext 获取下一个 step 或终态
  //   3. 根据返回类型更新状态
  async function next() {
    if (!step) return;
    const sdk = await loadSdk();

    // ---- 把表单值写入 step 的 callback ----
    // 遍历当前 step 的所有 callback，根据其 type + prompt 找到
    // 对应的表单值，调用 setInputValue 写入。
    // getOutputByName("prompt", cb.getType())：
    //   取 output 数组中 name==="prompt" 的 value，
    //   如果没有 prompt 输出，则回退为 callback 类型字符串。
    step.callbacks.forEach((cb) => {
      const prompt = cb.getOutputByName("prompt", cb.getType());
      const key = cb.getType() + "|" + prompt;
      cb.setInputValue(values[key] ?? "");
    });

    try {
      // 调用 mock 的 "下一步" 逻辑
      const result = await mockNext(sdk, step);

      if (result.type === sdk.StepType.LoginSuccess) {
        // 登录成功：切换到 success 状态，清空 step
        addLog("🎉 LoginSuccess");
        setStatus("success");
        setStep(null);
      } else if (result.type === sdk.StepType.LoginFailure) {
        // 登录失败：切换到 failure 状态，记录错误信息
        addLog("💥 LoginFailure: " + result.getDetail());
        setStatus("failure");
        setError(result.getDetail());
        setStep(null);
      } else {
        // 中间步骤：更新 step，清空表单值，等待下一轮输入
        addLog(`收到新 Step: stage=${result.getStage()}`);
        setStep(result);
        setValues({});
      }
    } catch (e) {
      // 异常：切换到 failure 状态
      setStatus("failure");
      setError(e.message);
      addLog("异常: " + e.message);
    }
  }

  // reset：完全重置，回到初始 idle 状态
  function reset() {
    setStep(null);
    setStatus("idle");
    setError(null);
    setValues({});
    setLogLines([]);
  }

  // ============================================================
  // 渲染层
  // ------------------------------------------------------------
  // 注意：每个 return 分支都必须渲染 <DemoStyles />！
  // 因为使用的是 <style jsx global>，组件树切换时旧样式会被移除，
  // 若新分支没有 <DemoStyles />，页面会变成无样式的纯文本。
  // ============================================================

  // ---- 状态1：SDK 加载中 ----
  if (!sdkReady && !sdkError) {
    return (
      <div className="fr-demo-wrap">
        <div className="fr-demo-card">
          <div className="fr-demo-loading">正在加载 @forgerock/javascript-sdk...</div>
        </div>
        <DemoStyles />
      </div>
    );
  }

  // ---- 状态2：SDK 加载失败 ----
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
        <DemoStyles />
      </div>
    );
  }

  // ---- 状态3：登录成功 ----
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
        <DemoStyles />
      </div>
    );
  }

  // ---- 状态4：登录失败 ----
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
        <DemoStyles />
      </div>
    );
  }

  // ---- 状态5：初始 idle 状态（未开始）----
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
            {/* 流程图：直观展示三个阶段 */}
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

  // ---- 状态6：表单状态（running 中，有 step 需要用户输入）----
  // 读取当前 step 的元信息，用于渲染表单标题
  const stage = step.getStage();
  const description = step.getDescription();
  // getHeader() 返回 AM 下发的标题文本，没有则回退到 description 或 stage
  // FRStep 确实有 getHeader() 方法，这里直接调用即可
  const header = step.getHeader() ?? description ?? stage;

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

        {/* 表单：提交时调用 next() */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="fr-demo-form"
        >
          {/* 遍历当前 step 的所有 callback，动态生成输入控件 */}
          {step.callbacks.map((cb, i) => {
            // 用 type + prompt 组合作为 key，确保唯一
            const prompt = cb.getOutputByName("prompt", cb.getType());
            const key = cb.getType() + "|" + prompt;
            // PasswordCallback 渲染为密码框
            const isPassword = cb.getType() === "PasswordCallback";
            const cbType = cb.getType();
            return (
              <div key={i} className="fr-demo-field">
                <label className="fr-demo-label">
                  <span className="fr-demo-label-text">{prompt}</span>
                  <span className="fr-demo-label-type">{cbType}</span>
                </label>
                {/* 用 functional update 避免闭包旧值问题：
                    当多个输入框快速切换输入时，展开运算符可能基于
                    过时的 values 快照，导致丢数据。
                    prev => 新对象 始终基于最新值。 */}
                <input
                  type={isPassword ? "password" : "text"}
                  value={values[key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [key]: e.target.value }))
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

// ============================================================
// 局部样式组件
// ------------------------------------------------------------
// 使用 styled-jsx 的 <style jsx global>：
//   - 所有 class 带 fr-demo 前缀，避免污染全局命名空间
//   - global 模式让样式能作用到子组件（如 <pre>、<code>）
//   - 重要：组件卸载时样式会被移除，因此每个渲染分支都必须
//     渲染 <DemoStyles />，否则该分支会失去样式
// ============================================================
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
