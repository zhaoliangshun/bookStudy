// =============================================================
// mini-zod —— 参照官方 Zod v4 核心逻辑实现的迷你版 Schema 校验库
// -------------------------------------------------------------
// 【核心架构（对齐 Zod v4）】
//   1. 每个 schema 实例持有 _zod 内部对象：{ def, parse, run, ... }
//   2. _parse(payload, ctx) 接收 { value, issues }，通过向 issues 数组 push
//      收集错误，并就地替换 payload.value 为校验/转换后的值
//   3. run(payload, ctx) = parse（类型/结构解析）+ checks（约束校验）
//   4. 递归校验不短路：对象/数组遍历所有字段/元素，收集所有错误
//      子 schema 的 issues 通过 prefix path 合并到父 issues
//   5. 链式方法（optional/refine/transform）通过创建包装 schema 实现，不可变
//
// 【与官方 v4 的对应关系】
//   schema._zod.run(payload, ctx)   ← v4 run(payload, ctx)
//   schema._zod.parse(payload, ctx) ← v4 parse(payload, ctx)（不含 checks）
//   payload = { value, issues }     ← v4 ParsePayload
//   prefixIssues(path, issues)      ← v4 util.prefixIssues
//   def.type                        ← v4 $ZodTypeDef.type
// =============================================================

// -------------------------------------------------------------
// 工具
// -------------------------------------------------------------

function isObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isPlainObject(val) {
  return isObject(val) && (Object.getPrototypeOf(val) === Object.prototype || Object.getPrototypeOf(val) === null);
}

function prefixIssues(key, issues) {
  return issues.map((iss) => ({
    ...iss,
    path: [key, ...iss.path],
  }));
}

function makeIssue(code, message, path, extra) {
  return { code, message, path: path || [], ...(extra || {}) };
}

function getType(val) {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

// -------------------------------------------------------------
// 错误
// -------------------------------------------------------------

export class ZodError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.name = "ZodError";
    this.issues = issues;
  }

  flatten() {
    const fieldErrors = {};
    for (const issue of this.issues) {
      const key = issue.path.length === 0 ? "_root" : issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return fieldErrors;
  }

  toString() {
    return this.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  }
}

// -------------------------------------------------------------
// 基类：ZodType
// -------------------------------------------------------------
// v4 中每个 schema 的 _zod 对象持有 parse/run 方法。
// 为 mini 简洁性，我们用类 + _zod 对象混合：实例方法 _parse 定义类型解析，
// run 方法在基类中统一实现，负责调用 _parse 后执行 checks（refine 等）。
// -------------------------------------------------------------

export class ZodType {
  constructor(def = {}) {
    this._zod = {
      def: { type: undefined, checks: [], ...def },
    };
  }

  get _def() {
    return this._zod.def;
  }

  // 子类实现：类型/结构解析，修改 payload 就地（替换 payload.value，push issues）
  _parse(payload, _ctx) {
    throw new Error("_parse must be implemented by subclass");
  }

  // 执行 checks（min/max/refine 等）。返回 payload
  _runChecks(payload) {
    const checks = this._zod.def.checks || [];
    for (const ch of checks) {
      ch.fn(payload);
    }
    return payload;
  }

  // 对外 run 方法：parse + checks。接收并返回 payload
  // 对齐 v4：_parse（类型解析）阶段如果产生 fatal 错误（aborted=true），
  // 跳过 checks 直接返回；否则执行所有 checks（收集全部错误，不短路）
  _run(payload, ctx) {
    this._parse(payload, ctx);
    if (payload.aborted) return payload;
    this._runChecks(payload);
    return payload;
  }

  // ---- 公开 API ----

  parse(data) {
    const result = this.safeParse(data);
    if (!result.success) throw result.error;
    return result.data;
  }

  safeParse(data) {
    const payload = { value: data, issues: [] };
    this._run(payload, { direction: "forward" });
    if (payload.issues.length > 0) {
      return { success: false, error: new ZodError(payload.issues) };
    }
    return { success: true, data: payload.value };
  }

  // ---- 修饰器（不可变，返回新 schema）----

  optional() {
    return new ZodOptional({ innerType: this });
  }

  nullable() {
    return new ZodNullable({ innerType: this });
  }

  nullish() {
    return this.optional().nullable();
  }

  default(defaultValue) {
    return new ZodDefault({ innerType: this, defaultValue });
  }

  // ---- checks / effects ----

  _addCheck(check) {
    const Ctor = this.constructor;
    const cloned = new Ctor({
      ...this._zod.def,
      checks: [...(this._zod.def.checks || []), check],
    });
    return cloned;
  }

  refine(check, message) {
    const opts =
      typeof message === "string"
        ? { message }
        : { message: message?.message || "校验失败", path: message?.path || [] };
    return new ZodEffects({
      innerType: this,
      effect: { type: "refinement", check, ...opts },
    });
  }

  transform(fn) {
    return new ZodEffects({
      innerType: this,
      effect: { type: "transform", transform: fn },
    });
  }

  superRefine(fn) {
    return new ZodEffects({
      innerType: this,
      effect: { type: "superRefinement", check: fn },
    });
  }

  pipe(target) {
    return new ZodPipe({ in: this, out: target });
  }

  catch(catchValue) {
    return new ZodCatch({ innerType: this, catchValue });
  }
}

// -------------------------------------------------------------
// 原始类型：string
// -------------------------------------------------------------

class ZodString extends ZodType {
  constructor(def = {}) {
    super({ type: "string", checks: [], ...def });
  }

  _parse(payload) {
    if (typeof payload.value !== "string") {
      payload.issues.push(
        makeIssue("invalid_type", `期望 string，实际 ${getType(payload.value)}`, [])
      );
      payload.aborted = true;
      return payload;
    }
    return payload;
  }

  _addStringCheck(kind, value, message) {
    return this._addCheck({
      kind,
      fn: (payload) => {
        const v = payload.value;
        if (typeof v !== "string") return;
        switch (kind) {
          case "min":
            if (v.length < value) {
              payload.issues.push(makeIssue("too_small", message || `至少 ${value} 个字符`, []));
            }
            break;
          case "max":
            if (v.length > value) {
              payload.issues.push(makeIssue("too_big", message || `最多 ${value} 个字符`, []));
            }
            break;
          case "length":
            if (v.length !== value) {
              payload.issues.push(makeIssue("invalid_length", message || `必须是 ${value} 个字符`, []));
            }
            break;
          case "email":
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
              payload.issues.push(makeIssue("invalid_string", message || "邮箱格式不正确", []));
            }
            break;
          case "url":
            try { new URL(v); } catch {
              payload.issues.push(makeIssue("invalid_string", message || "URL 格式不正确", []));
            }
            break;
          case "uuid":
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
              payload.issues.push(makeIssue("invalid_string", message || "UUID 格式不正确", []));
            }
            break;
          case "regex":
            if (!value.test(v)) {
              payload.issues.push(makeIssue("invalid_string", message || "格式不正确", []));
            }
            break;
          case "startsWith":
            if (!v.startsWith(value)) {
              payload.issues.push(makeIssue("invalid_string", message || `必须以 "${value}" 开头`, []));
            }
            break;
          case "endsWith":
            if (!v.endsWith(value)) {
              payload.issues.push(makeIssue("invalid_string", message || `必须以 "${value}" 结尾`, []));
            }
            break;
          case "includes":
            if (!v.includes(value)) {
              payload.issues.push(makeIssue("invalid_string", message || `必须包含 "${value}"`, []));
            }
            break;
          case "nonempty":
            if (v.length === 0) {
              payload.issues.push(makeIssue("too_small", message || "不能为空", []));
            }
            break;
        }
      },
    });
  }

  min(n, message) { return this._addStringCheck("min", n, message); }
  max(n, message) { return this._addStringCheck("max", n, message); }
  length(n, message) { return this._addStringCheck("length", n, message); }
  email(message) { return this._addStringCheck("email", 0, message); }
  url(message) { return this._addStringCheck("url", 0, message); }
  uuid(message) { return this._addStringCheck("uuid", 0, message); }
  regex(re, message) { return this._addStringCheck("regex", re, message); }
  startsWith(s, message) { return this._addStringCheck("startsWith", s, message); }
  endsWith(s, message) { return this._addStringCheck("endsWith", s, message); }
  includes(s, message) { return this._addStringCheck("includes", s, message); }
  nonempty(message) { return this._addStringCheck("nonempty", 0, message); }
  trim() {
    return new ZodEffects({
      innerType: this,
      effect: { type: "transform", transform: (v) => (typeof v === "string" ? v.trim() : v) },
    });
  }
}

// -------------------------------------------------------------
// 原始类型：number
// -------------------------------------------------------------

class ZodNumber extends ZodType {
  constructor(def = {}) {
    super({ type: "number", checks: [], ...def });
  }

  _parse(payload) {
    if (typeof payload.value !== "number" || Number.isNaN(payload.value)) {
      payload.issues.push(
        makeIssue("invalid_type", `期望 number，实际 ${getType(payload.value)}`, [])
      );
      payload.aborted = true;
      return payload;
    }
    return payload;
  }

  _addNumberCheck(kind, value, message) {
    return this._addCheck({
      kind,
      fn: (payload) => {
        const v = payload.value;
        if (typeof v !== "number" || Number.isNaN(v)) return;
        switch (kind) {
          case "min":
            if (v < value) {
              payload.issues.push(makeIssue("too_small", message || `必须 ≥ ${value}`, []));
            }
            break;
          case "max":
            if (v > value) {
              payload.issues.push(makeIssue("too_big", message || `必须 ≤ ${value}`, []));
            }
            break;
          case "int":
            if (!Number.isInteger(v)) {
              payload.issues.push(makeIssue("invalid_type", message || "必须是整数", []));
            }
            break;
          case "positive":
            if (v <= 0) {
              payload.issues.push(makeIssue("too_small", message || "必须是正数", []));
            }
            break;
          case "nonnegative":
            if (v < 0) {
              payload.issues.push(makeIssue("too_small", message || "不能为负数", []));
            }
            break;
          case "negative":
            if (v >= 0) {
              payload.issues.push(makeIssue("too_big", message || "必须是负数", []));
            }
            break;
          case "multipleOf":
            if (v % value !== 0) {
              payload.issues.push(makeIssue("invalid_type", message || `必须是 ${value} 的倍数`, []));
            }
            break;
        }
      },
    });
  }

  min(n, message) { return this._addNumberCheck("min", n, message); }
  max(n, message) { return this._addNumberCheck("max", n, message); }
  int(message) { return this._addNumberCheck("int", 0, message); }
  positive(message) { return this._addNumberCheck("positive", 0, message); }
  nonnegative(message) { return this._addNumberCheck("nonnegative", 0, message); }
  negative(message) { return this._addNumberCheck("negative", 0, message); }
  multipleOf(n, message) { return this._addNumberCheck("multipleOf", n, message); }
}

// -------------------------------------------------------------
// 原始类型：boolean / bigint / date / nan
// -------------------------------------------------------------

class ZodBoolean extends ZodType {
  constructor(def = {}) { super({ type: "boolean", ...def }); }
  _parse(payload) {
    if (typeof payload.value !== "boolean") {
      payload.issues.push(makeIssue("invalid_type", `期望 boolean，实际 ${getType(payload.value)}`, []));
      payload.aborted = true;
    }
    return payload;
  }
}

class ZodBigInt extends ZodType {
  constructor(def = {}) { super({ type: "bigint", ...def }); }
  _parse(payload) {
    if (typeof payload.value !== "bigint") {
      payload.issues.push(makeIssue("invalid_type", `期望 bigint，实际 ${getType(payload.value)}`, []));
      payload.aborted = true;
    }
    return payload;
  }
}

class ZodDate extends ZodType {
  constructor(def = {}) { super({ type: "date", ...def }); }
  _parse(payload) {
    const v = payload.value;
    if (v instanceof Date) {
      if (Number.isNaN(v.getTime())) {
        payload.issues.push(makeIssue("invalid_date", "无效日期", []));
        payload.aborted = true;
      }
      return payload;
    }
    if (typeof v !== "number" && typeof v !== "string") {
      payload.issues.push(makeIssue("invalid_type", `期望 date，实际 ${getType(v)}`, []));
      payload.aborted = true;
      return payload;
    }
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      payload.issues.push(makeIssue("invalid_type", "无法解析为日期", []));
      payload.aborted = true;
      return payload;
    }
    payload.value = d;
    return payload;
  }
}

class ZodNaN extends ZodType {
  constructor(def = {}) { super({ type: "nan", ...def }); }
  _parse(payload) {
    if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
      payload.issues.push(makeIssue("invalid_type", "期望 NaN", []));
      payload.aborted = true;
    }
    return payload;
  }
}

// -------------------------------------------------------------
// 空类型
// -------------------------------------------------------------

class ZodNull extends ZodType {
  constructor(def = {}) { super({ type: "null", ...def }); }
  _parse(payload) {
    if (payload.value !== null) {
      payload.issues.push(makeIssue("invalid_type", `期望 null，实际 ${getType(payload.value)}`, []));
      payload.aborted = true;
    }
    return payload;
  }
}

class ZodUndefined extends ZodType {
  constructor(def = {}) { super({ type: "undefined", ...def }); }
  _parse(payload) {
    if (payload.value !== undefined) {
      payload.issues.push(makeIssue("invalid_type", `期望 undefined`, []));
      payload.aborted = true;
    }
    return payload;
  }
}

class ZodVoid extends ZodType {
  constructor(def = {}) { super({ type: "void", ...def }); }
  _parse(payload) {
    if (payload.value !== undefined) {
      payload.issues.push(makeIssue("invalid_type", `期望 void/undefined，实际 ${getType(payload.value)}`, []));
      payload.aborted = true;
    }
    return payload;
  }
}

class ZodAny extends ZodType {
  constructor(def = {}) { super({ type: "any", ...def }); }
  _parse(payload) { return payload; }
}

class ZodUnknown extends ZodType {
  constructor(def = {}) { super({ type: "unknown", ...def }); }
  _parse(payload) { return payload; }
}

class ZodNever extends ZodType {
  constructor(def = {}) { super({ type: "never", ...def }); }
  _parse(payload) {
    payload.issues.push(makeIssue("invalid_type", "期望 never，不允许任何值", []));
    payload.aborted = true;
    return payload;
  }
}

// -------------------------------------------------------------
// array
// -------------------------------------------------------------
// 对齐 v4：遍历所有元素收集全部错误，不短路；
// 子错误通过 prefixIssues(i) 合并到父 payload.issues
// -------------------------------------------------------------

class ZodArray extends ZodType {
  constructor(def) {
    super({ type: "array", checks: [], ...def });
  }

  _parse(payload, ctx) {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push(makeIssue("invalid_type", `期望 array，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }

    const elementSchema = this._zod.def.element;
    const result = new Array(input.length);

    for (let i = 0; i < input.length; i++) {
      const childPayload = { value: input[i], issues: [] };
      elementSchema._run(childPayload, ctx);
      if (childPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(i, childPayload.issues));
      }
      result[i] = childPayload.value;
    }

    payload.value = result;
    return payload;
  }

  _addArrayCheck(kind, value, message) {
    return this._addCheck({
      kind,
      fn: (payload) => {
        if (!Array.isArray(payload.value)) return;
        const len = payload.value.length;
        switch (kind) {
          case "min":
            if (len < value) {
              payload.issues.push(makeIssue("too_small", message || `至少 ${value} 个元素`, []));
            }
            break;
          case "max":
            if (len > value) {
              payload.issues.push(makeIssue("too_big", message || `最多 ${value} 个元素`, []));
            }
            break;
          case "length":
            if (len !== value) {
              payload.issues.push(makeIssue("invalid_length", message || `必须 ${value} 个元素`, []));
            }
            break;
        }
      },
    });
  }

  min(n, message) { return this._addArrayCheck("min", n, message); }
  max(n, message) { return this._addArrayCheck("max", n, message); }
  length(n, message) { return this._addArrayCheck("length", n, message); }
  nonempty(message) { return this.min(1, message || "不能为空"); }
}

// -------------------------------------------------------------
// object
// -------------------------------------------------------------
// 对齐 v4：
//   - 遍历 shape 所有字段，每个字段用独立 payload 跑 _run
//   - 全部字段校验完后统一合并 issues（prefix key）
//   - optional 通过 innerType 的 optin 标记判断：字段为 undefined 时直接跳过
//   - extra key 处理：strip（默认丢弃）/ passthrough（保留）/ strict（报错）
//   - catchall schema 校验额外字段
// -------------------------------------------------------------

class ZodObject extends ZodType {
  constructor(def) {
    super({ type: "object", unknownKeys: "strip", ...def });
  }

  _parse(payload, ctx) {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push(makeIssue("invalid_type", `期望 object，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }

    const shape = this._zod.def.shape;
    const unknownKeys = this._zod.def.unknownKeys;
    const catchall = this._zod.def.catchall;
    const result = {};
    const shapeKeys = Object.keys(shape);

    // 1. 校验 shape 中定义的每个字段（收集全部，不短路）
    // 对齐 v4：每个字段都用独立 payload 调用 _run，由 ZodOptional/ZodDefault
    // 等包装 schema 自己处理 undefined 情况（而非父 object 提前跳过）
    for (const key of shapeKeys) {
      const fieldSchema = shape[key];
      const childValue = input[key];
      const childPayload = { value: childValue, issues: [] };
      fieldSchema._run(childPayload, ctx);
      if (childPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(key, childPayload.issues));
      }
      result[key] = childPayload.value;
    }

    // 2. 处理额外字段
    const extraKeys = Object.keys(input).filter((k) => !(k in shape));
    if (catchall) {
      for (const key of extraKeys) {
        const childPayload = { value: input[key], issues: [] };
        catchall._run(childPayload, ctx);
        if (childPayload.issues.length > 0) {
          payload.issues.push(...prefixIssues(key, childPayload.issues));
        }
        result[key] = childPayload.value;
      }
    } else if (unknownKeys === "strict") {
      for (const key of extraKeys) {
        payload.issues.push(makeIssue("unrecognized_keys", `未定义的字段：${key}`, [key]));
      }
    } else if (unknownKeys === "passthrough") {
      for (const key of extraKeys) {
        result[key] = input[key];
      }
    }
    // strip: 丢弃（不写入 result）

    payload.value = result;
    return payload;
  }

  // ---- 对象方法 ----

  _clone(extra) {
    return new ZodObject({ ...this._zod.def, ...extra });
  }

  passthrough() { return this._clone({ unknownKeys: "passthrough" }); }
  strict() { return this._clone({ unknownKeys: "strict" }); }
  strip() { return this._clone({ unknownKeys: "strip" }); }
  catchall(schema) { return this._clone({ catchall: schema }); }

  partial() {
    const newShape = {};
    for (const [k, v] of Object.entries(this._zod.def.shape)) {
      newShape[k] = v.optional();
    }
    return this._clone({ shape: newShape });
  }

  required() {
    const newShape = {};
    for (const [k, v] of Object.entries(this._zod.def.shape)) {
      newShape[k] = v instanceof ZodOptional ? v._zod.def.innerType : v;
    }
    return this._clone({ shape: newShape });
  }

  pick(keys) {
    const newShape = {};
    for (const k of keys) {
      if (k in this._zod.def.shape) newShape[k] = this._zod.def.shape[k];
    }
    return this._clone({ shape: newShape });
  }

  omit(keys) {
    const newShape = {};
    for (const [k, v] of Object.entries(this._zod.def.shape)) {
      if (!keys.includes(k)) newShape[k] = v;
    }
    return this._clone({ shape: newShape });
  }

  extend(extra) {
    return this._clone({ shape: { ...this._zod.def.shape, ...extra } });
  }

  merge(other) {
    return this.extend(other._zod.def.shape);
  }

  get shape() {
    return this._zod.def.shape;
  }
}

// -------------------------------------------------------------
// record / map / set
// -------------------------------------------------------------

class ZodRecord extends ZodType {
  constructor(def) {
    super({ type: "record", ...def });
  }

  _parse(payload, ctx) {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push(makeIssue("invalid_type", `期望 record/object，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }

    const keyType = this._zod.def.keyType;
    const valueType = this._zod.def.valueType;
    const result = {};

    for (const key of Object.keys(input)) {
      const keyPayload = { value: key, issues: [] };
      keyType._run(keyPayload, ctx);
      if (keyPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(key, keyPayload.issues));
        continue;
      }
      const valPayload = { value: input[key], issues: [] };
      valueType._run(valPayload, ctx);
      if (valPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(key, valPayload.issues));
      } else {
        result[keyPayload.value] = valPayload.value;
      }
    }

    payload.value = result;
    return payload;
  }
}

class ZodMap extends ZodType {
  constructor(def) { super({ type: "map", ...def }); }
  _parse(payload, ctx) {
    const input = payload.value;
    if (!(input instanceof Map)) {
      payload.issues.push(makeIssue("invalid_type", `期望 Map，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }
    const { keyType, valueType } = this._zod.def;
    const result = new Map();
    let i = 0;
    for (const [k, v] of input.entries()) {
      const keyPayload = { value: k, issues: [] };
      keyType._run(keyPayload, ctx);
      const hasKeyErr = keyPayload.issues.length > 0;
      if (hasKeyErr) payload.issues.push(...prefixIssues(i, keyPayload.issues));

      const valPayload = { value: v, issues: [] };
      valueType._run(valPayload, ctx);
      if (valPayload.issues.length > 0) payload.issues.push(...prefixIssues(i, valPayload.issues));

      if (!hasKeyErr && valPayload.issues.length === 0) {
        result.set(keyPayload.value, valPayload.value);
      }
      i++;
    }
    payload.value = result;
    return payload;
  }
}

class ZodSet extends ZodType {
  constructor(def) { super({ type: "set", ...def }); }
  _parse(payload, ctx) {
    const input = payload.value;
    if (!(input instanceof Set)) {
      payload.issues.push(makeIssue("invalid_type", `期望 Set，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }
    const { valueType } = this._zod.def;
    const result = new Set();
    let i = 0;
    for (const v of input.values()) {
      const valPayload = { value: v, issues: [] };
      valueType._run(valPayload, ctx);
      if (valPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(i, valPayload.issues));
      } else {
        result.add(valPayload.value);
      }
      i++;
    }
    payload.value = result;
    return payload;
  }
}

// -------------------------------------------------------------
// tuple
// -------------------------------------------------------------

class ZodTuple extends ZodType {
  constructor(def) { super({ type: "tuple", ...def }); }
  _parse(payload, ctx) {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push(makeIssue("invalid_type", `期望 tuple/array，实际 ${getType(input)}`, []));
      payload.aborted = true;
      return payload;
    }
    const items = this._zod.def.items;
    const rest = this._zod.def.rest;
    const result = [];

    for (let i = 0; i < items.length; i++) {
      const childPayload = { value: input[i], issues: [] };
      items[i]._run(childPayload, ctx);
      if (childPayload.issues.length > 0) {
        payload.issues.push(...prefixIssues(i, childPayload.issues));
      }
      result[i] = childPayload.value;
    }

    if (rest) {
      for (let i = items.length; i < input.length; i++) {
        const childPayload = { value: input[i], issues: [] };
        rest._run(childPayload, ctx);
        if (childPayload.issues.length > 0) {
          payload.issues.push(...prefixIssues(i, childPayload.issues));
        }
        result.push(childPayload.value);
      }
    } else if (input.length > items.length) {
      payload.issues.push(
        makeIssue("too_big", `期望 ${items.length} 个元素，实际 ${input.length} 个`, [])
      );
    }

    payload.value = result;
    return payload;
  }
}

// -------------------------------------------------------------
// 修饰器：optional / nullable / default / catch
// -------------------------------------------------------------
// v4 中这些不是 "返回 undefined 就跳过" 的简单包装——它们通过 optin/optout
// 标记让父 object 感知。mini 版采用简化方式：在 _parse 中处理 undefined/null，
// 同时设置 _zod.optin 让 object 识别 optional 字段。
// -------------------------------------------------------------

class ZodOptional extends ZodType {
  constructor(def) {
    super({ type: "optional", ...def });
    this._zod.optin = "optional";
    this._zod.optout = "optional";
  }
  _parse(payload, ctx) {
    // 如果 innerType 本身也是 optional（如 .optional().optional()），委托给它处理
    if (this._zod.def.innerType._zod?.optin === "optional") {
      return this._zod.def.innerType._run(payload, ctx);
    }
    if (payload.value === undefined) return payload;
    return this._zod.def.innerType._run(payload, ctx);
  }
}

class ZodNullable extends ZodType {
  constructor(def) {
    super({ type: "nullable", ...def });
    // 继承 innerType 的 optin
    const innerOptin = def.innerType._zod?.optin;
    if (innerOptin) this._zod.optin = innerOptin;
  }
  _parse(payload, ctx) {
    if (payload.value === null) return payload;
    return this._zod.def.innerType._run(payload, ctx);
  }
}

class ZodDefault extends ZodType {
  constructor(def) {
    super({ type: "default", ...def });
    this._zod.optin = "optional";
  }
  _parse(payload, ctx) {
    if (payload.value === undefined) {
      const dv = this._zod.def.defaultValue;
      payload.value = typeof dv === "function" ? dv() : dv;
      // v4 forward 方向：default 值不经过 inner 校验；但为了 transform 链一致，仍 run innerType
      return this._zod.def.innerType._run(payload, ctx);
    }
    return this._zod.def.innerType._run(payload, ctx);
  }
}

class ZodCatch extends ZodType {
  constructor(def) { super({ type: "catch", ...def }); this._zod.optin = "optional"; }
  _parse(payload, ctx) {
    const childPayload = { value: payload.value, issues: [] };
    this._zod.def.innerType._run(childPayload, ctx);
    if (childPayload.issues.length > 0) {
      const cv = this._zod.def.catchValue;
      payload.value = typeof cv === "function" ? cv() : cv;
      payload.issues.length = 0; // 捕获后清除错误
      return payload;
    }
    payload.value = childPayload.value;
    return payload;
  }
}

class ZodNonNullable extends ZodType {
  constructor(def) { super({ type: "nonnullable", ...def }); }
  _parse(payload, ctx) {
    if (payload.value === null || payload.value === undefined) {
      payload.issues.push(makeIssue("invalid_type", `期望非 null/undefined`, []));
      payload.aborted = true;
      return payload;
    }
    return this._zod.def.innerType._run(payload, ctx);
  }
}

// -------------------------------------------------------------
// enum / literal / nativeEnum
// -------------------------------------------------------------

class ZodEnum extends ZodType {
  constructor(def) { super({ type: "enum", ...def }); }
  _parse(payload) {
    const values = this._zod.def.values;
    if (!values.includes(payload.value)) {
      payload.issues.push(makeIssue("invalid_enum_value", `必须是 ${values.join(" | ")} 之一`, []));
    }
    return payload;
  }
  get options() { return this._zod.def.values; }
  get enum() {
    const e = {};
    for (const v of this._zod.def.values) e[v] = v;
    return e;
  }
}

class ZodNativeEnum extends ZodType {
  constructor(def) { super({ type: "nativeEnum", ...def }); }
  _parse(payload) {
    const values = Object.values(this._zod.def.values);
    if (!values.includes(payload.value)) {
      payload.issues.push(makeIssue("invalid_enum_value", `必须是枚举值之一`, []));
    }
    return payload;
  }
}

class ZodLiteral extends ZodType {
  constructor(def) { super({ type: "literal", ...def }); }
  _parse(payload) {
    if (payload.value !== this._zod.def.value) {
      payload.issues.push(makeIssue("invalid_literal", `必须是 ${JSON.stringify(this._zod.def.value)}`, []));
    }
    return payload;
  }
}

// -------------------------------------------------------------
// union / discriminatedUnion / intersection
// -------------------------------------------------------------

class ZodUnion extends ZodType {
  constructor(def) { super({ type: "union", ...def }); }
  _parse(payload, ctx) {
    const options = this._zod.def.options;
    const branchIssues = [];
    for (const option of options) {
      const childPayload = { value: payload.value, issues: [] };
      option._run(childPayload, ctx);
      if (childPayload.issues.length === 0) {
        payload.value = childPayload.value;
        return payload;
      }
      branchIssues.push(childPayload.issues);
    }
    payload.issues.push(
      makeIssue("invalid_union", "所有分支均校验失败", [], { unionErrors: branchIssues })
    );
    return payload;
  }
}

class ZodDiscriminatedUnion extends ZodType {
  constructor(def) { super({ type: "discriminatedUnion", ...def }); }
  _parse(payload, ctx) {
    const { discriminator, options } = this._zod.def;
    const discValue = payload.value?.[discriminator];
    for (const option of options) {
      const discField = option._zod.def.shape?.[discriminator];
      if (discField instanceof ZodLiteral && discField._zod.def.value === discValue) {
        return option._run(payload, ctx);
      }
    }
    payload.issues.push(
      makeIssue("invalid_union_discriminator", `无效的判别值: ${JSON.stringify(discValue)}`, [])
    );
    return payload;
  }
}

class ZodIntersection extends ZodType {
  constructor(def) { super({ type: "intersection", ...def }); }
  _parse(payload, ctx) {
    const leftPayload = { value: payload.value, issues: [] };
    const rightPayload = { value: payload.value, issues: [] };
    this._zod.def.left._run(leftPayload, ctx);
    this._zod.def.right._run(rightPayload, ctx);

    if (leftPayload.issues.length) payload.issues.push(...leftPayload.issues);
    if (rightPayload.issues.length) payload.issues.push(...rightPayload.issues);

    if (leftPayload.issues.length === 0 && rightPayload.issues.length === 0) {
      if (isPlainObject(leftPayload.value) && isPlainObject(rightPayload.value)) {
        payload.value = { ...leftPayload.value, ...rightPayload.value };
      } else {
        payload.value = rightPayload.value;
      }
    }
    return payload;
  }
}

// -------------------------------------------------------------
// effects：refine / transform / preprocess / superRefine
// -------------------------------------------------------------
// v4 中 transform 是独立 schema 类型（$ZodTransform），refine 通过 $ZodCustom check 实现。
// mini 版用一个统一 ZodEffects 类处理所有 effect 类型。
// -------------------------------------------------------------

class ZodEffects extends ZodType {
  constructor(def) { super({ type: "effects", ...def }); }

  _parse(payload, ctx) {
    const effect = this._zod.def.effect;
    const inner = this._zod.def.innerType;

    // preprocess：先转换输入再交给 innerType（v4 中 preprocess 最先执行）
    if (effect.type === "preprocess") {
      payload.value = effect.transform(payload.value);
      return inner._run(payload, ctx);
    }

    // transform：inner 校验完再变换数据；inner 有任何错误都不转换（脏数据不转换）
    if (effect.type === "transform") {
      inner._run(payload, ctx);
      if (payload.issues.length > 0) return payload;
      try {
        payload.value = effect.transform(payload.value);
      } catch (e) {
        payload.issues.push(makeIssue("custom", e.message, []));
      }
      return payload;
    }

    // refinement / superRefinement：inner 校验（含 checks）后执行自定义校验。
    // 对齐 v4：只有 fatal 错误（aborted=true，如类型错误）才跳过自定义校验；
    // non-fatal 的 check 错误（如 min 太短）不阻止 refine 继续收集错误
    inner._run(payload, ctx);
    if (payload.aborted) return payload;

    if (effect.type === "refinement") {
      try {
        const ok = effect.check(payload.value);
        if (!ok) {
          const path = effect.path && effect.path.length > 0 ? effect.path : [];
          payload.issues.push(makeIssue("custom", effect.message, path));
        }
      } catch (e) {
        const path = effect.path && effect.path.length > 0 ? effect.path : [];
        payload.issues.push(makeIssue("custom", e.message, path));
      }
      return payload;
    }

    if (effect.type === "superRefinement") {
      const addIssue = (opts) => {
        const path = opts.path ? [...(opts.pathFromRoot || []), ...opts.path] : [];
        payload.issues.push(makeIssue(opts.code || "custom", opts.message || "校验失败", path, opts));
      };
      effect.check(payload.value, { addIssue });
      return payload;
    }

    return payload;
  }
}

class ZodPreprocess extends ZodEffects {
  constructor(fn, schema) {
    super({ innerType: schema, effect: { type: "preprocess", transform: fn } });
  }
}

// -------------------------------------------------------------
// pipe / branded / readonly / lazy / promise / function
// -------------------------------------------------------------

class ZodPipe extends ZodType {
  constructor(def) { super({ type: "pipe", ...def }); }
  _parse(payload, ctx) {
    this._zod.def.in._run(payload, ctx);
    if (payload.aborted) return payload;
    return this._zod.def.out._run(payload, ctx);
  }
}

class ZodBranded extends ZodType {
  constructor(def) { super({ type: "branded", ...def }); }
  _parse(payload, ctx) { return this._zod.def.innerType._run(payload, ctx); }
}

class ZodReadonly extends ZodType {
  constructor(def) { super({ type: "readonly", ...def }); }
  _parse(payload, ctx) { return this._zod.def.innerType._run(payload, ctx); }
}

class ZodLazy extends ZodType {
  constructor(def) { super({ type: "lazy", ...def }); }
  _parse(payload, ctx) {
    const schema = this._zod.def.getter();
    return schema._run(payload, ctx);
  }
}

class ZodPromise extends ZodType {
  constructor(def) { super({ type: "promise", ...def }); }
  _parse(payload) {
    if (payload.value instanceof Promise || typeof payload.value?.then === "function") {
      return payload;
    }
    payload.issues.push(makeIssue("invalid_type", `期望 Promise`, []));
    payload.aborted = true;
    return payload;
  }
}

class ZodFunction extends ZodType {
  constructor(def) { super({ type: "function", ...def }); }
  _parse(payload) {
    if (typeof payload.value !== "function") {
      payload.issues.push(makeIssue("invalid_type", `期望 function`, []));
      payload.aborted = true;
      return payload;
    }
    const { args, returns } = this._zod.def;
    const fn = payload.value;
    payload.value = (...inputArgs) => {
      if (args) {
        for (let i = 0; i < args.length; i++) {
          const p = { value: inputArgs[i], issues: [] };
          args[i]._run(p, {});
          if (p.issues.length > 0) throw new ZodError(p.issues);
          inputArgs[i] = p.value;
        }
      }
      const result = fn(...inputArgs);
      if (returns) {
        const p = { value: result, issues: [] };
        returns._run(p, {});
        if (p.issues.length > 0) throw new ZodError(p.issues);
        return p.value;
      }
      return result;
    };
    return payload;
  }
}

// -------------------------------------------------------------
// coerce：preprocess + 原生 JS 类型转换
// -------------------------------------------------------------

function coerceString(schema) { return new ZodPreprocess((v) => String(v), schema); }
function coerceNumber(schema) { return new ZodPreprocess((v) => Number(v), schema); }
function coerceBoolean(schema) { return new ZodPreprocess((v) => Boolean(v), schema); }
function coerceBigInt(schema) { return new ZodPreprocess((v) => BigInt(v), schema); }
function coerceDate(schema) { return new ZodPreprocess((v) => new Date(v), schema); }

// -------------------------------------------------------------
// 工厂函数 z
// -------------------------------------------------------------

export const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  boolean: () => new ZodBoolean(),
  bigint: () => new ZodBigInt(),
  date: () => new ZodDate(),
  nan: () => new ZodNaN(),

  null: () => new ZodNull(),
  undefined: () => new ZodUndefined(),
  void: () => new ZodVoid(),
  any: () => new ZodAny(),
  unknown: () => new ZodUnknown(),
  never: () => new ZodNever(),

  array: (element) => new ZodArray({ element, checks: [] }),
  object: (shape) => new ZodObject({ shape: shape || {}, unknownKeys: "strip" }),
  strictObject: (shape) => new ZodObject({ shape, unknownKeys: "strict" }),
  looseObject: (shape) => new ZodObject({ shape, unknownKeys: "passthrough" }),
  record: (keyType, valueType) => {
    if (!valueType || !("_zod" in valueType)) {
      return new ZodRecord({ keyType: new ZodString(), valueType: keyType });
    }
    return new ZodRecord({ keyType, valueType });
  },
  map: (keyType, valueType) => new ZodMap({ keyType, valueType }),
  set: (valueType) => new ZodSet({ valueType }),
  tuple: (items) => new ZodTuple({ items }),

  enum: (values) => new ZodEnum({ values }),
  nativeEnum: (values) => new ZodNativeEnum({ values }),
  literal: (value) => new ZodLiteral({ value }),

  union: (options) => new ZodUnion({ options }),
  discriminatedUnion: (discriminator, options) =>
    new ZodDiscriminatedUnion({ discriminator, options }),
  intersection: (left, right) => new ZodIntersection({ left, right }),

  lazy: (getter) => new ZodLazy({ getter }),
  promise: (schema) => new ZodPromise({ innerType: schema }),
  function: (args, returns) => new ZodFunction({ args, returns }),
  preprocess: (fn, schema) => new ZodPreprocess(fn, schema),
  effect: (schema, effect) => new ZodEffects({ innerType: schema, effect }),
  pipe: (inSchema, outSchema) => new ZodPipe({ in: inSchema, out: outSchema }),

  custom: (check, params) => {
    const base = new ZodAny();
    if (check) {
      const msg = typeof params === "string" ? params : params?.message || "自定义校验失败";
      return base.refine(check, msg);
    }
    return base;
  },
  instanceOf: (cls, params) => {
    const msg = typeof params === "string" ? params : params?.message || `期望 ${cls.name} 实例`;
    return new ZodAny().refine((v) => v instanceof cls, msg);
  },
  coalesce: (schema, defaultValue) => schema.optional().nullable().catch(defaultValue),

  // 对象工具
  extend: (schema, extra) => schema.extend(extra),
  merge: (a, b) => a.merge(b),
  pick: (schema, keys) => schema.pick(keys),
  omit: (schema, keys) => schema.omit(keys),
  partial: (schema) => schema.partial(),
  required: (schema) => schema.required(),

  coerce: {
    string: () => coerceString(new ZodString()),
    number: () => coerceNumber(new ZodNumber()),
    boolean: () => coerceBoolean(new ZodBoolean()),
    bigint: () => coerceBigInt(new ZodBigInt()),
    date: () => coerceDate(new ZodDate()),
  },

  optional: (schema) => schema.optional(),
  nullable: (schema) => schema.nullable(),
  nullish: (schema) => schema.nullish(),
  default: (schema, val) => schema.default(val),
  transform: (fn) => new ZodEffects({ innerType: new ZodAny(), effect: { type: "transform", transform: fn } }),
};

// -------------------------------------------------------------
// 导出所有内部类
// -------------------------------------------------------------

export {
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodBigInt,
  ZodDate,
  ZodNaN,
  ZodNull,
  ZodUndefined,
  ZodVoid,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodArray,
  ZodObject,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodTuple,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodNonNullable,
  ZodEnum,
  ZodNativeEnum,
  ZodLiteral,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodEffects,
  ZodPreprocess,
  ZodPipe,
  ZodCatch,
  ZodBranded,
  ZodReadonly,
  ZodLazy,
  ZodPromise,
  ZodFunction,
};
