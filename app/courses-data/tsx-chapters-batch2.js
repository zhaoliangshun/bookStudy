// =============================================================
// TSX 教程 - 进阶篇（5 章）
// -------------------------------------------------------------
// 覆盖：useReducer / useContext / 自定义 Hook / forwardRef / 泛型组件
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 6 章：useReducer 类型安全
  // ===========================================================
  {
    id: "tsx-usereducer",
    group: "进阶篇",
    icon: "🎛️",
    title: "useReducer 类型安全",
    content: `# useReducer 类型安全

当组件的状态逻辑变得复杂——多个状态互相依赖、多种操作修改同一组数据——\`useState\` 会让你写出一堆 \`setX\` 散落在各处，难以追踪。\`useReducer\` 把"状态如何变化"集中到一个 reducer 函数里，配合 TypeScript 的判别式联合（discriminated union），能让所有状态变更路径都得到编译期校验。

---

## 一、为什么复杂状态要选 useReducer

先看一个反例：用多个 useState 管理购物车。

\`\`\`tsx
function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState<string | null>(null);

  // 加商品：要同时改 items、可能改 discount、可能改 coupon
  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
    if (item.bulk) setDiscount(0.1);
    if (item.coupon) setCoupon(item.coupon);
  };

  // 删商品：又得联动
  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    // 忘了重算 discount？bug 就来了
  };
}
\`\`\`

问题：
1. **逻辑分散**——每个 handler 都在多处 setX，改一处忘一处
2. **状态间依赖**——discount 依赖 items，容易漏更新
3. **难测试**——要渲染组件才能测逻辑

\`useReducer\` 把这些联动逻辑收拢成一个纯函数 \`(state, action) => state\`，可以独立测试，状态转换路径清晰。

---

## 二、useReducer 基本签名

\`\`\`tsx
const [state, dispatch] = useReducer(reducer, initialArg, init?);
\`\`\`

- \`reducer\`：\`(state: S, action: A) => S\`
- \`initialArg\`：初始状态（或传给 init 的参数）
- \`init\`（可选）：惰性初始化函数 \`(arg) => S\`

TypeScript 会根据 \`initialArg\`/\`init\` 推断 \`state\` 的类型，根据 \`reducer\` 的第二个参数推断 \`action\` 类型。但**最佳实践是显式定义 State 和 Action 类型**，避免推断不准。

---

## 三、定义 State 类型

\`\`\`tsx
type CartItem = { id: number; name: string; price: number; qty: number };

type CartState = {
  items: CartItem[];
  discount: number;       // 0 ~ 1
  coupon: string | null;
};

const initialState: CartState = {
  items: [],
  discount: 0,
  coupon: null,
};
\`\`\`

显式标注 \`initialState\` 为 \`CartState\`，能防止初始值漏字段或多字段。

---

## 四、判别式联合（Discriminated Union）定义 Action

这是 useReducer + TS 的灵魂。每个 action 都有一个公共的 \`type\` 字段作为判别符：

\`\`\`tsx
type CartAction =
  | { type: "addItem"; item: CartItem }
  | { type: "removeItem"; id: number }
  | { type: "updateQty"; id: number; qty: number }
  | { type: "applyCoupon"; code: string; discount: number }
  | { type: "clear" };
\`\`\`

要点：
- 公共字段 \`type\` 用字符串字面量，值唯一
- 每个 action 只携带自己需要的字段
- TS 会根据 \`type\` 在 switch 里自动收窄类型（下面详解）

**为什么不用 \`type: string\`？** 因为那样 TS 无法收窄，你要手动断言。字面量联合让编译器替你检查。

---

## 五、reducer 函数与类型收窄

\`\`\`tsx
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "addItem":
      // 这里 action 被收窄为 { type: "addItem"; item: CartItem }
      return { ...state, items: [...state.items, action.item] };

    case "removeItem":
      // action 收窄为 { type: "removeItem"; id: number }
      return { ...state, items: state.items.filter(i => i.id !== action.id) };

    case "updateQty":
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };

    case "applyCoupon":
      return { ...state, coupon: action.code, discount: action.discount };

    case "clear":
      return initialState;

    default: {
      // 穷尽性检查：漏写 case 编译报错
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
\`\`\`

### TypeScript 如何收窄 action 类型

在 \`case "addItem"\` 分支里，TS 知道 \`action.type\` 只能是 \`"addItem"\`，所以把 \`CartAction\` 收窄到 \`{ type: "addItem"; item: CartItem }\`——直接访问 \`action.item\` 不会报错，而访问 \`action.id\` 会报错（因为该分支没有 id）。

这就是判别式联合的威力：**编译器替你保证每个 case 用对字段**。

---

## 六、穷尽性检查（Exhaustiveness Check）

default 分支里：

\`\`\`tsx
const _exhaustive: never = action;
\`\`\`

如果将来新增一个 action 类型 \`{ type: "checkout" }\` 但忘了写对应 case，TS 会报错：\`Type '...' is not assignable to type 'never'\`。这能在编译期提醒你补全 switch。

**这是 useReducer + TS 最被低估的特性**——重构 reducer 时，加一个 action 后所有 switch 都会报错提醒你处理。

---

## 七、在组件中使用

\`\`\`tsx
function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const total = state.items.reduce(
    (sum, i) => sum + i.price * i.qty * (1 - state.discount),
    0
  );

  return (
    <div>
      <button onClick={() => dispatch({ type: "addItem", item: newItem })}>
        加商品
      </button>
      <button onClick={() => dispatch({ type: "clear" })}>清空</button>
      <p>合计：{total.toFixed(2)}</p>
    </div>
  );
}
\`\`\`

注意 \`dispatch\` 的参数是 \`CartAction\`——传错的 type 或漏字段都会编译报错：

\`\`\`tsx
dispatch({ type: "addItem" });              // ❌ 缺 item
dispatch({ type: "removeItem", id: "1" }); // ❌ id 必须是 number
dispatch({ type: "clear", extra: 1 });     // ❌ 多余字段
dispatch({ type: "checkout" });            // ❌ 不存在的 type
\`\`\`

---

## 八、useState vs useReducer 决策指南

| 场景 | 推荐 | 理由 |
|------|------|------|
| 单个独立状态 | \`useState\` | 简单直接 |
| 2~3 个相关状态 | \`useState\` | 还能 hold 住 |
| 状态间强联动 | \`useReducer\` | 集中管理联动 |
| 多种操作改同一状态 | \`useReducer\` | action 列表清晰 |
| 状态转换有复杂规则 | \`useReducer\` | reducer 可独立测试 |
| 下一个状态依赖多个前置状态 | \`useReducer\` | 避免 setX 嵌套地狱 |
| 需要状态历史/回放 | \`useReducer\` | reducer 是纯函数 |

**口诀**：状态像"机器"（多种动作驱动状态机）用 reducer；状态像"变量"（零散独立值）用 state。

---

## 九、惰性初始化（init 函数）

初始状态需要计算时用第三个参数：

\`\`\`tsx
type CounterState = { count: number; history: number[] };

function counterInit(initial: number): CounterState {
  return { count: initial, history: [initial] };
}

const [state, dispatch] = useReducer(counterReducer, 10, counterInit);
// state = { count: 10, history: [10] }
\`\`\`

好处：init 只在初次渲染时执行一次；也方便测试 reducer（直接传 init 算出的 state）。

---

## 十、Action Creator（可选）

dispatch 一个复杂对象多了会啰嗦，可以封装成函数：

\`\`\`tsx
const actions = {
  addItem: (item: CartItem): CartAction => ({ type: "addItem", item }),
  removeItem: (id: number): CartAction => ({ type: "removeItem", id }),
  clear: (): CartAction => ({ type: "clear" }),
};

dispatch(actions.addItem(item));  // 比 dispatch({ type: "addItem", item }) 清爽
\`\`\`

TS 会检查参数类型，传错同样报错。

---

## 十一、常见陷阱

### 1. 忘了 return

reducer 每个 case 必须返回新 state。忘了 return 会导致返回 \`undefined\`，运行时报错。开启严格模式时 TS 会提示。

### 2. 直接修改 state

\`\`\`tsx
case "addItem":
  state.items.push(action.item);  // ❌ 直接改原 state
  return state;
\`\`\`

React 不会检测到变化，UI 不更新。**永远返回新对象**。

### 3. action 字段命名混乱

判别符字段建议统一用 \`type\`，不要一个 case 用 \`kind\` 一个用 \`type\`——无法构成判别式联合。

### 4. reducer 副作用

reducer 必须是纯函数。不要在 reducer 里发请求、写 localStorage、调 \`Date.now()\`（除非你能接受不确定性）。副作用放 useEffect 或事件处理里。

---

## 十二、进阶：组合 reducer

状态分多块时，可以拆成多个子 reducer 再合并：

\`\`\`tsx
type AppState = { cart: CartState; user: UserState };

function appReducer(state: AppState, action: AppAction): AppState {
  return {
    cart: cartReducer(state.cart, action),  // 路由到 cart
    user: userReducer(state.user, action),  // 路由到 user
  };
}
\`\`\`

实际项目推荐用 \`useReducer\` + Context 组成全局状态（见第 7 章），避免 prop drilling。

---

**要点回顾**：
1. 复杂联动状态优先用 \`useReducer\`
2. Action 用判别式联合，\`type\` 字段作判别符
3. switch 里 TS 自动收窄，访问错字段会报错
4. default 用 \`never\` 做穷尽性检查，重构不漏 case
5. dispatch 参数强类型校验，传错即报错
6. reducer 必须纯函数，永远返回新对象`,

    code: `// useReducer 类型安全 - 可运行 Demo：购物车
import { useReducer, useState } from "react";

// === 1. 类型定义：CartItem 与 CartState ===
// 💡 提示：显式定义 State 类型，避免 useReducer 的类型推断不准
//   - 标注 initialState: CartState 能防止初始值漏字段或多字段
//   - 字段语义清晰，便于团队协作与重构
type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  coupon: string | null;
  discount: number;
};

// === 2. 判别式联合（Discriminated Union）定义 Action ===
// 💡 提示：判别式联合是 useReducer + TypeScript 的灵魂
//   优势 1：每个 action 都有公共的 type 字段（字符串字面量）作"判别符"
//   优势 2：TS 能根据 type 在 switch 的 case 分支自动收窄 action 类型
//   优势 3：dispatch 传参时强类型校验——传错 type、漏字段、多字段都编译报错
//   优势 4：重构时新增 action，所有 switch 都会被穷尽性检查提醒补全 case
//   对比：若用 type: string，TS 无法收窄，要手动断言，丢失类型安全保障
type CartAction =
  // 添加商品：需要完整的 CartItem 数据
  | { type: "addItem"; item: CartItem }
  // 删除商品：只需要 id 定位目标行
  | { type: "removeItem"; id: number }
  // 修改数量：需要 id 定位 + 新数量 qty
  | { type: "updateQty"; id: number; qty: number }
  // 应用优惠券：需要优惠券码 code 和折扣率 discount（0~1 之间小数）
  | { type: "applyCoupon"; code: string; discount: number }
  // 清空购物车：不需要额外字段，仅靠 type 即可判断
  | { type: "clear" };

// === 3. 初始状态 ===
const initialState: CartState = {
  items: [],
  coupon: null,
  discount: 0,
};

// === 4. reducer 函数：状态转换的纯函数 ===
// 💡 提示：reducer 必须是纯函数——同样的输入永远产出同样的输出
//   - 不要在 reducer 里发请求、写 localStorage、调 Date.now()
//   - 副作用放 useEffect 或事件处理里
//   - 永远返回新对象，不要直接修改 state（React 用引用比较判断变化）
function cartReducer(state: CartState, action: CartAction): CartState {
  // switch (action.type) 是判别式联合的类型收窄入口
  // 💡 提示：在每个 case 分支里，TS 会根据 type 字段值自动收窄 action 类型
  //   - case "addItem" 里，action 收窄为 { type: "addItem"; item: CartItem }
  //   - 此时访问 action.item 不会报错，访问 action.id 会报错（该分支没有 id）
  //   - 这就是判别式联合的威力：编译器替你保证每个 case 用对字段
  switch (action.type) {
    case "addItem": {
      // action 收窄为 { type: "addItem"; item: CartItem }
      // 检查购物车是否已有该商品（按 id 判断），已存在则数量累加
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        // 已存在：数量累加，不重复添加行
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, qty: i.qty + action.item.qty }
              : i
          ),
        };
      }
      // 不存在：直接追加到 items 数组末尾
      return { ...state, items: [...state.items, action.item] };
    }
    case "removeItem":
      // action 收窄为 { type: "removeItem"; id: number }
      // 按 id 过滤掉要删除的商品
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "updateQty":
      // action 收窄为 { type: "updateQty"; id: number; qty: number }
      // 更新指定商品数量，同时过滤掉 qty <= 0 的（自动移除数量为 0 的商品）
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
          .filter((i) => i.qty > 0),
      };
    case "applyCoupon":
      // action 收窄为 { type: "applyCoupon"; code: string; discount: number }
      // 设置优惠券码和折扣率（discount 为 0~1 之间的小数）
      return { ...state, coupon: action.code, discount: action.discount };
    case "clear":
      // action 收窄为 { type: "clear" }（无额外字段）
      // 重置为初始状态（返回新对象，避免引用共享导致 React 不更新）
      return { ...initialState };
    default: {
      // === 穷尽性检查（Exhaustiveness Check）===
      // 💡 提示：never 类型是 TypeScript 的"底类型"，表示"永远不可能发生的值"
      //   - 若所有 case 都已处理，default 分支里 action 类型会被收窄为 never
      //   - 把 never 赋值给 never 类型的变量不会报错
      //   - 若将来新增 action 类型（如 { type: "checkout" }）却忘了写 case，
      //     action 在 default 分支就不是 never，赋值给 _exhaustive 会编译报错：
      //     "Type '{ type: \"checkout\" }' is not assignable to type 'never'"
      //   - 这能在编译期提醒你补全 switch，是最被低估的 TS 特性之一
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// === 5. 商品库与优惠券 ===
const PRODUCTS: CartItem[] = [
  { id: 1, name: "TypeScript 实战", price: 89, qty: 1 },
  { id: 2, name: "React 进阶指南", price: 79, qty: 1 },
  { id: 3, name: "Node.js 服务端", price: 99, qty: 1 },
  { id: 4, name: "算法图解", price: 69, qty: 1 },
];

const COUPONS: Record<string, number> = {
  TS10: 0.1,
  SAVE20: 0.2,
};

// === 6. 演示：reducer 执行过程与 dispatch 流程 ===
// 💡 提示：以下 console.log 在模块加载时执行，演示 reducer 的纯函数特性
//   - 直接调用 cartReducer 模拟 dispatch，不依赖 React 渲染周期
//   - 每次调用都返回新 state，原 state 不变（纯函数特征）
//   - 真实组件中 dispatch 会触发 React 重新渲染并应用新 state
console.log("=== useReducer 演示：dispatch 流程与状态变化 ===");
console.log("[初始状态] state =", initialState);

// (1) 模拟 dispatch({ type: "addItem", item: PRODUCTS[0] }) —— 添加第一件商品
let demoState: CartState = initialState;
console.log('[dispatch 1] action = { type: "addItem", item: TypeScript 实战 }');
demoState = cartReducer(demoState, { type: "addItem", item: PRODUCTS[0] });
console.log("[状态变化] items.length =", demoState.items.length, "| items[0].name =", demoState.items[0].name);

// (2) 模拟 dispatch({ type: "addItem", item: PRODUCTS[1] }) —— 添加第二件商品
console.log('[dispatch 2] action = { type: "addItem", item: React 进阶指南 }');
demoState = cartReducer(demoState, { type: "addItem", item: PRODUCTS[1] });
console.log("[状态变化] items.length =", demoState.items.length);

// (3) 模拟 dispatch({ type: "addItem", item: PRODUCTS[0] }) —— 重复添加触发累加逻辑
console.log('[dispatch 3] action = { type: "addItem", item: TypeScript 实战（重复添加）}');
demoState = cartReducer(demoState, { type: "addItem", item: PRODUCTS[0] });
console.log("[状态变化] items[0].qty =", demoState.items[0].qty, "（数量累加为 2，未新增行）");

// (4) 模拟 dispatch({ type: "updateQty", id: 1, qty: 5 }) —— 修改数量
console.log('[dispatch 4] action = { type: "updateQty", id: 1, qty: 5 }');
demoState = cartReducer(demoState, { type: "updateQty", id: 1, qty: 5 });
console.log("[状态变化] items[0].qty =", demoState.items[0].qty);

// (5) 模拟 dispatch({ type: "applyCoupon", code: "TS10", discount: 0.1 }) —— 应用优惠券
console.log('[dispatch 5] action = { type: "applyCoupon", code: "TS10", discount: 0.1 }');
demoState = cartReducer(demoState, { type: "applyCoupon", code: "TS10", discount: 0.1 });
console.log("[状态变化] coupon =", demoState.coupon, "| discount =", demoState.discount);

// (6) 模拟 dispatch({ type: "removeItem", id: 2 }) —— 删除商品
console.log('[dispatch 6] action = { type: "removeItem", id: 2 }');
demoState = cartReducer(demoState, { type: "removeItem", id: 2 });
console.log("[状态变化] items.length =", demoState.items.length, "（删除后剩 1 件）");

// (7) 模拟 dispatch({ type: "clear" }) —— 清空购物车
console.log('[dispatch 7] action = { type: "clear" }');
demoState = cartReducer(demoState, { type: "clear" });
console.log("[状态变化] items.length =", demoState.items.length, "| coupon =", demoState.coupon, "（已重置）");

// (8) 演示穷尽性检查：漏写 case 会在编译期报错
// 💡 提示：若给 CartAction 新增 { type: "checkout" } 但 reducer 没写对应 case，
//   default 分支里 action 不是 never，赋值给 _exhaustive 会报错：
//   "Type '{ type: \"checkout\" }' is not assignable to type 'never'"
//   这就是穷尽性检查在编译期帮你发现遗漏 case 的机制
console.log("[穷尽性检查] 演示：若新增 action type 但漏写 case，TS 编译期报错");
console.log("[穷尽性检查] 报错信息：Type '...' is not assignable to type 'never'");

// === 7. Demo 组件 ===
export default function Demo() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // 派生数据：小计 / 折扣 / 合计
  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = subtotal * state.discount;
  const total = subtotal - discountAmount;

  // 组件每次渲染时输出当前 state，观察 dispatch 后的状态变化
  console.log("[Demo 渲染] items.length =", state.items.length, "| total =", total);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      // dispatch 参数是 CartAction，传错字段会编译报错
      console.log("[dispatch] applyCoupon: code =", code, "discount =", COUPONS[code]);
      dispatch({ type: "applyCoupon", code, discount: COUPONS[code] });
      setMessage("✅ 优惠券 " + code + " 已应用（-" + (COUPONS[code] * 100) + "%）");
    } else {
      setMessage("❌ 无效的优惠券：" + code);
    }
    setCouponInput("");
  };

  return (
    <div style={{ padding: 16, maxWidth: 520, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>
        🛒 购物车
      </h2>

      {/* 商品库 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
          可添加商品
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                console.log("[dispatch] addItem:", p.name);
                dispatch({ type: "addItem", item: p });
              }}
              style={{
                padding: "6px 12px", fontSize: 13, borderRadius: 6,
                border: "1px solid #d1d5db", background: "#fff",
                cursor: "pointer",
              }}
            >
              + {p.name}（￥{p.price}）
            </button>
          ))}
        </div>
      </div>

      {/* 购物车列表 */}
      <div style={{
        border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden",
        marginBottom: 16,
      }}>
        {state.items.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            购物车为空，点击上方按钮添加商品
          </div>
        ) : (
          state.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  ￥{item.price} × {item.qty} = ￥{(item.price * item.qty).toFixed(2)}
                </div>
              </div>

              {/* 数量控制 */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => dispatch({ type: "updateQty", id: item.id, qty: item.qty - 1 })}
                  style={qtyBtn}
                >－</button>
                <span style={{ minWidth: 24, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
                <button
                  onClick={() => dispatch({ type: "updateQty", id: item.id, qty: item.qty + 1 })}
                  style={qtyBtn}
                >＋</button>
              </div>

              <button
                onClick={() => dispatch({ type: "removeItem", id: item.id })}
                style={{
                  padding: "4px 8px", fontSize: 12, borderRadius: 4,
                  border: "none", background: "#ef4444", color: "#fff",
                  cursor: "pointer",
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>

      {/* 优惠券 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="输入优惠券（TS10 / SAVE20）"
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 6,
            border: "1px solid #d1d5db", fontSize: 13, outline: "none",
          }}
        />
        <button
          onClick={handleApplyCoupon}
          style={{
            padding: "8px 14px", borderRadius: 6, border: "none",
            background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13,
          }}
        >
          应用
        </button>
        {state.coupon && (
          <button
            onClick={() => dispatch({ type: "applyCoupon", code: "", discount: 0 })}
            style={{
              padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db",
              background: "#fff", cursor: "pointer", fontSize: 13,
            }}
          >
            取消券
          </button>
        )}
      </div>

      {message && (
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{message}</div>
      )}

      {/* 合计 */}
      <div style={{
        background: "#f9fafb", borderRadius: 8, padding: 14,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
          <span>小计</span>
          <span>￥{subtotal.toFixed(2)}</span>
        </div>
        {state.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ef4444" }}>
            <span>折扣（{state.coupon} -{(state.discount * 100).toFixed(0)}%）</span>
            <span>-￥{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 16, fontWeight: 700, color: "#111827",
          borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 4,
        }}>
          <span>合计</span>
          <span>￥{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: "clear" })}
        disabled={state.items.length === 0}
        style={{
          marginTop: 12, width: "100%", padding: "10px",
          borderRadius: 6, border: "1px solid #ef4444",
          background: state.items.length === 0 ? "#fff" : "#fff",
          color: "#ef4444", cursor: state.items.length === 0 ? "not-allowed" : "pointer",
          opacity: state.items.length === 0 ? 0.5 : 1, fontSize: 13,
        }}
      >
        清空购物车
      </button>
    </div>
  );
}

const qtyBtn = {
  width: 24, height: 24, borderRadius: 4, border: "1px solid #d1d5db",
  background: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1,
}`,
  },

  // ===========================================================
  // 第 7 章：useContext 类型安全
  // ===========================================================
  {
    id: "tsx-usecontext",
    group: "进阶篇",
    icon: "🌐",
    title: "useContext 类型安全",
    content: `# useContext 类型安全

组件层级很深时，逐层传 prop（prop drilling）非常痛苦。\`Context\` 提供"跨层传值"能力。在 TypeScript 下，Context 的类型设计有几个关键套路，掌握后能写出类型安全且易用的 Provider。

---

## 一、创建带类型的 Context

最推荐的写法：\`createContext<T | null>(null)\`。

\`\`\`tsx
import { createContext } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// 初始值传 null，类型标注为 ThemeContextValue | null
const ThemeContext = createContext<ThemeContextValue | null>(null);
\`\`\`

为什么是 \`T | null\`？因为 Provider 还没包裹时，Context 的初始值就是 null。后续消费时做 null 检查。

---

## 二、为什么不传默认值

新手容易这样写：

\`\`\`tsx
// ❌ 不推荐：给一个默认值
const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},  // 空函数，啥也不做
});
\`\`\`

问题：如果忘了用 Provider 包裹，\`useContext\` 不会报错，返回这个"假"的默认值，\`toggleTheme\` 点了没反应，bug 难排查。

**null + 检查模式** 的好处：忘了包 Provider 会立刻在调用处抛错，bug 立刻暴露。

---

## 三、Provider 组件模式

把 Provider 封装成一个组件，内部管理状态，对外只暴露 Context：

\`\`\`tsx
import { useState, useCallback, type ReactNode } from "react";

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value: ThemeContextValue = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

要点：
- \`children: ReactNode\` 是 Provider 的标准 props
- \`value\` 显式标注类型，确保传给 Provider 的值结构正确
- 用 \`useCallback\` 稳定函数引用

---

## 四、自定义 useCustomContext hook（抛错保护）

每次 useContext 都要判 null 太啰嗦。封装一个 hook：

\`\`\`tsx
import { useContext } from "react";

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  return ctx;  // 这里 TS 已收窄为非 null
}
\`\`\`

这样消费方直接用 \`useTheme()\` 拿到非空值，且忘包 Provider 会得到清晰的运行时错误。

**这是 Context + TS 的标准三件套**：
1. \`createContext<T | null>(null)\`
2. Provider 组件
3. \`useXxx\` hook 内部判 null 并抛错

---

## 五、Context 消费

\`\`\`tsx
function ThemeButton() {
  const { theme, toggleTheme } = useTheme();  // 类型安全，非空
  return (
    <button onClick={toggleTheme}>
      当前主题：{theme}
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeButton />
    </ThemeProvider>
  );
}
\`\`\`

\`useTheme()\` 返回类型是 \`ThemeContextValue\`（不是 \`... | null\`），因为 hook 内部已判空。

---

## 六、复杂 Context：多块状态

实际项目 Context 往往承载多块状态（主题 + 用户 + 设置）。两种组织方式：

### 方式 A：单个大 Context

\`\`\`tsx
type AppContextValue = {
  theme: Theme;
  user: User | null;
  settings: Settings;
  login: (user: User) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);
\`\`\`

优点：一次 useContext 拿全部。缺点：任一块状态变，所有消费组件都重渲染。

### 方式 B：拆分多个 Context（推荐）

\`\`\`tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);
const UserContext = createContext<UserContextValue | null>(null);
const SettingsContext = createContext<SettingsContextValue | null>(null);
\`\`\`

优点：各自独立，只重渲染消费该 Context 的组件。

---

## 七、性能考量：value 记忆化

Provider 的 \`value\` 如果每次渲染都是新对象，所有消费组件都会重渲染。**必须用 useMemo 记忆化**：

\`\`\`tsx
function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [user, setUser] = useState<User | null>(null);

  const themeValue = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light"),
  }), [theme]);

  const userValue = useMemo(() => ({
    user,
    login: (u: User) => setUser(u),
    logout: () => setUser(null),
  }), [user]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
\`\`\`

**拆分 + 记忆化的双重优化**：theme 变化不会触发只消费 user 的组件重渲染。

---

## 八、Context 拆分策略

| 策略 | 适用 |
|------|------|
| 静态值（如配置、字典） | 单个 Context，无需 memo（值不变） |
| 高频变化状态 | 拆分独立 Context + memo |
| 全局用户态 | 单独 UserContext |
| 主题/i18n | 单独 Context |

经验：**变化频率不同的状态不要塞同一个 Context**。

---

## 九、Context 默认值何时有用

有一种场景默认值是有意义的：当 Context 用于"可覆盖"的依赖注入，且不提供也能工作。

\`\`\`tsx
// Toast 服务的默认 no-op 实现
const ToastContext = createContext<ToastApi>({
  show: () => {},
  error: () => {},
});

// 没包 Provider 也能用，只是 toast 不显示——降级
\`\`\`

这种"软依赖"才适合给默认值。强依赖（必须有 Provider）还是用 null + 抛错。

---

## 十、Provider 组合

多个 Provider 嵌套会变成"金字塔"。可以写个组合函数：

\`\`\`tsx
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// 使用
<AppProviders>
  <App />
</AppProviders>
\`\`\`

---

## 十一、useContext 与 useReducer 结合

全局状态推荐 \`useReducer\` + \`Context\`：

\`\`\`tsx
const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
\`\`\`

\`dispatch\` 引用稳定，\`state\` 变化才触发更新。这是轻量版 Redux。

---

## 十二、TypeScript 技巧：组合 Context 类型

\`\`\`tsx
type AppContextType = React.ContextType<typeof AppContext>;
// 等价于 AppContextValue | null，方便复用
\`\`\`

---

**要点回顾**：
1. \`createContext<T | null>(null)\` + 抛错 hook 是标准模式
2. 不要给强依赖 Context 默认值
3. Provider 用 \`useMemo\` 记忆化 value
4. 变化频率不同的状态拆分多个 Context
5. \`useReducer + Context\` 实现轻量全局状态`,

    code: `// useContext 类型安全 - 可运行 Demo：主题切换 + 用户上下文
import {
  createContext, useContext, useState, useCallback, useMemo,
  type ReactNode,
} from "react";

// === 1. 类型定义：Theme 与 ThemeContextValue ===
type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// === 2. 创建 Context：createContext<T | null>(null) ===
// 💡 提示：createContext<T>(defaultValue) 中泛型 T 的作用
//   - T 指定 context 值的类型，决定了 Provider 的 value 必须是什么结构
//   - T 决定了 useContext 返回值的类型（这里是 ThemeContextValue | null）
//   - 泛型让 TypeScript 在编译期校验 value 结构，传错字段立刻报错
//
// 💡 提示：为什么默认值通常是 null 而不是真实对象？
//   1. 真实对象（如 { theme: "light", toggleTheme: () => {} }）会让 toggleTheme 是空函数
//      忘了包 Provider 时不会报错，但点击按钮没反应，bug 难排查
//   2. null + 抛错 hook 模式：忘包 Provider 会在调用 useContext 时立刻抛错
//      bug 立刻暴露在开发阶段，而不是上线后才被用户发现
//   3. 例外：只有"软依赖"（如 Toast 的 no-op 降级）才适合给真实默认值
const ThemeContext = createContext<ThemeContextValue | null>(null);

// === 3. Provider 组件：useMemo 记忆化 value ===
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // 💡 提示：useMemo 记忆化 context value 的作用
  //   - Provider 每次渲染都会创建新的 value 对象 { theme, toggleTheme }
  //   - 如果 value 引用每次都变，所有消费该 Context 的组件都会重渲染，即使 theme 没变
  //   - useMemo 让 value 引用只在依赖（theme, toggleTheme）变化时才更新
  //   - 配合 useCallback 稳定函数引用，能最大程度减少无谓的重渲染
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// === 4. 自定义 hook useTheme：封装的好处 ===
// 💡 提示：封装 useXxx hook 的好处
//   1. 收敛 null 检查：所有消费方都不用再写 if (ctx === null) throw ...
//   2. 错误信息清晰：忘包 Provider 时抛出明确的错误，而不是隐式返回 null
//   3. 类型自动收窄：useContext 返回 T | null，但 hook 内部抛错后 TS 知道返回的是 T
//   4. 调用方简洁：直接 const { theme } = useTheme() 拿到非空值
function useTheme(): ThemeContextValue {
  // 💡 提示：useContext 的返回类型与重渲染行为
  //   - 返回类型：Context<ThemeContextValue | null> 的当前值，即 ThemeContextValue | null
  //   - 重渲染行为：当 Provider 的 value 变化时，所有调用 useContext 的组件都会重渲染
  //     这是 React 内置的订阅机制，无需手动订阅/取消订阅
  //   - 性能要点：如果 value 是新对象（未 memo），即使内容相同也会触发重渲染
  //     所以 Provider 的 value 必须用 useMemo 记忆化
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  // 此处 TS 已将 ctx 从 ThemeContextValue | null 收窄为 ThemeContextValue
  return ctx;
}

// === 5. 用户 Context（拆分独立）===
// 💡 提示：为什么要拆分多个 Context？
//   - 主题和用户是两块独立的状态，变化频率不同
//   - 拆分后，主题变化只触发消费 ThemeContext 的组件重渲染
//   - 如果合并成一个大 Context，任一字段变化都会触发所有消费组件重渲染
type User = { id: number; name: string; role: string };

type UserContextValue = {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
};

// 同样使用 null + 抛错模式，避免忘包 Provider 的隐性 bug
const UserContext = createContext<UserContextValue | null>(null);

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // useCallback 稳定函数引用，配合 useMemo 让 value 引用稳定
  const login = useCallback((name: string) => {
    setUser({ id: Date.now(), name, role: "member" });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  // useMemo 记忆化：user 变化时 value 才变化，避免无谓重渲染
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// useUser hook：封装 null 检查，返回非空 UserContextValue
// 💡 提示：与 useTheme 一样，封装后消费方直接拿到强类型非空值
function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error("useUser 必须在 UserProvider 内部使用");
  }
  return ctx;
}

// === 6. 组合 Provider ===
// 💡 提示：多个 Provider 嵌套会变成"金字塔"，封装成 AppProviders 统一管理
//   - 调用方只需包一层 <AppProviders>，不用关心内部有几个 Context
//   - 顺序无关紧要（Context 之间无依赖时）
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
}

// === 7. 消费组件 ===
function ThemeToggle() {
  // useTheme() 返回 ThemeContextValue（非空），可直接解构
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 14px", borderRadius: 6, border: "none",
        background: isDark ? "#fbbf24" : "#1f2937",
        color: isDark ? "#1f2937" : "#fbbf24",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
      }}
    >
      {isDark ? "☀️ 切换到亮色" : "🌙 切换到暗色"}
    </button>
  );
}

function UserPanel() {
  // useUser() 返回 UserContextValue（非空），可直接解构
  const { user, login, logout } = useUser();
  const [name, setName] = useState("");

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#3b82f6", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600,
        }}>
          {user.name[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{user.role}</div>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "6px 12px", borderRadius: 6,
            border: "1px solid #d1d5db", background: "transparent",
            cursor: "pointer", fontSize: 12,
          }}
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入用户名"
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            login(name.trim());
            setName("");
          }
        }}
        style={{
          padding: "8px 12px", borderRadius: 6, width: 140,
          border: "1px solid #d1d5db", fontSize: 13, outline: "none",
        }}
      />
      <button
        onClick={() => {
          if (name.trim()) {
            login(name.trim());
            setName("");
          }
        }}
        style={{
          padding: "8px 16px", borderRadius: 6, border: "none",
          background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13,
        }}
      >
        登录
      </button>
    </div>
  );
}

function StatusBar() {
  // 同时消费两个 Context：theme 变化只重渲染依赖 theme 的部分
  const { theme } = useTheme();
  const { user } = useUser();
  const isDark = theme === "dark";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 16px", borderRadius: 8, marginBottom: 16,
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#f9fafb" : "#111827",
      border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
    }}>
      <span style={{ fontSize: 13 }}>
        当前主题：<b>{theme}</b> | 用户：<b>{user ? user.name : "未登录"}</b>
      </span>
      <ThemeToggle />
    </div>
  );
}

function Content() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div style={{
      padding: 20, borderRadius: 8,
      background: isDark ? "#111827" : "#f9fafb",
      color: isDark ? "#e5e7eb" : "#374151",
      border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
    }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>用户中心</h3>
      <p style={{ margin: 0, fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280" }}>
        下方用户面板从独立的 UserContext 获取数据，与主题 Context 解耦。
        主题切换不会触发用户面板无关的重渲染（拆分 + memo 优化）。
      </p>
      <div style={{ marginTop: 16 }}>
        <UserPanel />
      </div>
    </div>
  );
}

// === 8. console.log 演示：Context 的读取过程 ===
// 💡 提示：以下演示在模块加载时执行，展示 Context 的默认值与读取行为

// (1) 演示没有 Provider 时使用默认值的情况
//     ThemeContext 创建时默认值是 null，直接读取会得到 null
//     此时自定义 hook 会抛错，让开发者立刻发现问题
console.log("[useContext] 1. 无 Provider 时 ThemeContext 默认值演示");
const simulateNoProvider = (): string => {
  // 模拟 useContext(ThemeContext) 在无 Provider 时返回 null（即 createContext 的默认值）
  const ctx: ThemeContextValue | null = null;
  console.log("[useContext]    useContext 返回值 =", ctx);
  if (ctx === null) {
    return "抛错：useTheme 必须在 ThemeProvider 内部使用";
  }
  return "拿到 context 值：" + ctx.theme;
};
console.log("[useContext]    结果 =", simulateNoProvider());

// (2) 模拟有 Provider 时读取 context 值的过程
//     构造一个假的 context value，模拟 Provider 提供的值
const fakeThemeContextValue: ThemeContextValue = {
  theme: "dark",
  toggleTheme: () => console.log("[useContext] toggleTheme 被调用"),
};
console.log("[useContext] 2. 模拟 Provider 提供的 ThemeContextValue =");
console.log("[useContext]    theme =", fakeThemeContextValue.theme);
console.log("[useContext]    toggleTheme 类型 =", typeof fakeThemeContextValue.toggleTheme);

// (3) 演示 useContext 的重渲染行为
//     - Provider value 变化时，所有 useContext 消费组件都会重渲染
//     - 若 value 未 memo，每次渲染都是新对象，会触发无谓重渲染
//     - useMemo 让 value 引用在依赖不变时保持稳定
const unMemoizedValue1 = { theme: "light" };
const unMemoizedValue2 = { theme: "light" };
console.log("[useContext] 3. 未 memo 的 value 引用对比 =", unMemoizedValue1 === unMemoizedValue2, "（false：总是新对象）");
console.log("[useContext]    -> 每次渲染 value 引用都变，消费组件会被迫重渲染");

// (4) 输出 context 值的读取过程总结
console.log("[useContext] 4. Context 读取流程：");
console.log("[useContext]    createContext<T | null>(null) -> 创建 Context，默认值 null");
console.log("[useContext]    Provider value={...}        -> 设置当前 context 值");
console.log("[useContext]    useContext(Context)         -> 读取当前 context 值");
console.log("[useContext]    自定义 hook 判 null         -> 抛错或返回非空值");

// === 9. 入口组件 ===
export default function Demo() {
  return (
    <AppProviders>
      <Inner />
    </AppProviders>
  );
}

function Inner() {
  return (
    <div style={{ padding: 16, maxWidth: 520, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>
        🌐 Context 主题 + 用户
      </h2>
      <StatusBar />
      <Content />
    </div>
  );
}`,
  },

  // ===========================================================
  // 第 8 章：自定义 Hook 类型设计
  // ===========================================================
  {
    id: "tsx-custom-hook",
    group: "进阶篇",
    icon: "🪝",
    title: "自定义 Hook 类型设计",
    content: `# 自定义 Hook 类型设计

把重复逻辑抽成自定义 Hook 是 React 进阶必备技能。TypeScript 下，自定义 Hook 的类型设计有几个要点：返回值如何标注、泛型 Hook 怎么写、带回调的 Hook 怎么约束。

---

## 一、基本自定义 Hook：返回类型自动推断

\`\`\`tsx
import { useState, useCallback } from "react";

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(prev => !prev), []);
  const set = useCallback((value: boolean) => setOn(value), []);
  return { on, toggle, set };
}

// 使用：类型自动推断
const { on, toggle, set } = useToggle(true);
//    on: boolean
//    toggle: () => void
//    set: (value: boolean) => void
\`\`\`

**大部分 Hook 不用手动写返回类型**——TS 从 useState/useCallback 的返回值自动推断。

---

## 二、返回多个值：tuple vs object

### Object 返回（推荐大多数场景）

\`\`\`tsx
function useWindow() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return { size, setSize };
}

const { size, setSize } = useWindow();
// 解构时可改名、可省略，语义清晰
\`\`\`

优点：解构灵活、可改名、可省略字段。

### Tuple 返回（适合固定顺序）

\`\`\`tsx
function usePair<T, U>(a: T, b: U) {
  return [a, b] as const;
}

const [x, y] = usePair(1, "hello");
//    x: number, y: string
\`\`\`

注意 \`as const\` 让 TS 推断为元组而非 \`(T | U)[]\`。常见于 \`useState\` 的返回：\`[state, setState]\`。

**选择**：字段多或语义复杂用 object；固定两个值（值 + setter）用 tuple。

---

## 三、泛型 Hook：useArray<T>

让 Hook 跟随传入数据的类型：

\`\`\`tsx
function useArray<T>(initial: T[]) {
  const [arr, setArr] = useState<T[]>(initial);

  const push = (item: T) => setArr(prev => [...prev, item]);
  const remove = (index: number) => setArr(prev => prev.filter((_, i) => i !== index));
  const clear = () => setArr([]);

  return { arr, push, remove, clear };
}

// 使用时 T 被推断
const { arr, push } = useArray([1, 2, 3]);      // T = number
push(4);     // ✓
push("x");   // ❌ "x" 不是 number

const { arr: users } = useArray<User>([]);      // T = User
\`\`\`

要点：泛型参数 \`<T>\` 写在函数名前，调用时由参数推断。

---

## 四、泛型 Hook：useLocalStorage<T>

\`\`\`tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : initial;
  });

  const set = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set] as const;
}

const [token, setToken] = useLocalStorage<string>("token", "");
//    token: string
setToken("abc123");
\`\`\`

注意 \`as const\` 让返回推断为 \`[T, (v: T) => void]\` 而非联合数组。

---

## 五、带回调参数的 Hook

\`\`\`tsx
function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    asyncFn()
      .then(data => active && setState({ data, loading: false, error: null }))
      .catch(error => active && setState({ data: null, loading: false, error }));
    return () => { active = false; };
  }, deps);

  return state;
}
\`\`\`

要点：
- 泛型 \`T\` 是异步函数的返回类型
- \`deps\` 用 \`React.DependencyList\` 类型
- 返回值用对象类型标注，结构清晰

---

## 六、useDebounce：泛型 + 清理

经典防抖 Hook：

\`\`\`tsx
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);  // 清理上一次定时器
  }, [value, delay]);

  return debounced;
}

const [text, setText] = useState("");
const debouncedText = useDebounce(text, 500);
//    debouncedText: string
\`\`\`

要点：
- 泛型 \`T\` 跟随输入值类型
- useEffect 返回清理函数，避免重复触发
- 依赖数组 \`[value, delay]\` 保证 value 变化才重置定时器

---

## 七、useFetch：泛型数据获取

\`\`\`tsx
type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>;
      })
      .then(data => active && setState({ status: "success", data }))
      .catch(error => active && setState({ status: "error", error }));

    return () => { active = false; };
  }, [url]);

  return state;
}

// 使用
const result = useFetch<User>("/api/user");
if (result.status === "loading") return <Loading />;
if (result.status === "error") return <Error e={result.error} />;
// 这里 result 收窄为 { status: "success"; data: User }
return <UserView user={result.data} />;
\`\`\`

注意：状态用**判别式联合**，TS 会根据 \`status\` 自动收窄 \`data\` 或 \`error\`，比 \`{ loading, data, error }\` 三字段更安全（不会出现 loading 时 data 还有值）。

---

## 八、Hook 返回函数：useCallback 必备

返回给外部使用的函数必须用 \`useCallback\` 稳定引用，否则每次渲染都是新函数，下游 useEffect 会无限触发：

\`\`\`tsx
function useCounter() {
  const [count, setCount] = useState(0);
  // ✅ useCallback 稳定引用
  const increment = useCallback(() => setCount(c => c + 1), []);
  return { count, increment };
}
\`\`\`

---

## 九、Hook 的规则与 TS 影响

1. **只在顶层调用**——不能在条件/循环里调 Hook。TS 无法报这个错，靠 ESLint \`react-hooks/rules-of-hooks\`。
2. **同名 Hook 多次调用**——TS 类型不冲突，但注意 ref/state 各自独立。
3. **Hook 命名**——必须 \`use\` 开头，否则 ESLint 不认。
4. **依赖数组**——对象/函数依赖要稳定（memo/callback），否则 useEffect 频繁触发。

---

## 十、返回类型的显式标注

复杂 Hook 推断不准时，显式标注返回类型：

\`\`\`tsx
type UseMouseResult = {
  x: number;
  y: number;
  isInside: boolean;
};

function useMouse(): UseMouseResult {
  const [pos, setPos] = useState({ x: 0, y: 0, inside: false });
  // ...
  return { x: pos.x, y: pos.y, isInside: pos.inside };
}
\`\`\`

好处：调用方看到的类型稳定，Hook 内部实现变化不影响外部。

---

## 十一、Hook 组合

自定义 Hook 可以调用其他 Hook：

\`\`\`tsx
function useUserSearch(query: string) {
  const debounced = useDebounce(query, 500);          // 调用 useDebounce
  const result = useFetch<User[]>(\`/api/users?q=\${debounced}\`);
  return result;
}
\`\`\`

组合性是 Hook 的核心优势——像搭积木。

---

**要点回顾**：
1. 简单 Hook 返回类型自动推断
2. 多值返回优先 object，固定二元组用 \`as const\`
3. 泛型 Hook \`function useXxx<T>\` 跟随数据类型
4. 状态用判别式联合（loading/success/error）更安全
5. 返回函数必须 \`useCallback\``,

    code: `// 自定义 Hook 类型设计 - 可运行 Demo
import { useState, useEffect, useCallback, useRef } from "react";

// === 1. useToggle：最简单的自定义 Hook ===
// 💡 提示：自定义 Hook 必须以 "use" 开头
//   - React 靠命名约定识别 Hook，否则 ESLint 的 react-hooks/rules-of-hooks 规则不生效
//   - "use" 前缀也让开发者一眼看出这是个 Hook，需要在组件顶层调用
//   - 不以 use 开头（如 toggleState）会被当成普通函数，无法触发 Hook 检查
function useToggle(initial = false) {
  // initial 默认 false，类型推断为 boolean
  const [on, setOn] = useState(initial);

  // 💡 提示：返回给外部的函数必须用 useCallback 稳定引用
  //   - 不用 useCallback 的话每次渲染都是新函数，下游 useEffect 依赖会无限触发
  //   - 空依赖数组 [] 表示函数只创建一次，引用永远稳定
  const toggle = useCallback(() => setOn((p) => !p), []);
  const set = useCallback((value: boolean) => setOn(value), []);

  // 💡 提示：返回值类型设计 - 对象 vs 数组
  //   - 这里用对象返回 { on, toggle, set }，原因：
  //     1. 字段多于 2 个，对象语义更清晰
  //     2. 调用方解构时可改名、可省略字段：const { on: isOpen, toggle } = useToggle()
  //     3. 字段顺序无关，后续新增字段不破坏调用方代码
  //   - 对比数组返回 [on, toggle, set]：
  //     1. 调用方必须按顺序解构，中间字段不能省略
  //     2. 适合字段少且固定顺序的场景（如 useState 的 [state, setState]）
  return { on, toggle, set };
}

// === 2. useDebounce：泛型 + useEffect 清理函数 ===
// 💡 提示：泛型 <T> 让 Hook 跟随输入值类型
//   - 调用 useDebounce(text, 400) 时 T 被推断为 string
//   - 调用 useDebounce(count, 400) 时 T 被推断为 number
//   - 返回值 debounced 也是 T 类型，与输入值类型严格一致
//   - 无需手动标注，TypeScript 自动从参数推断
function useDebounce<T>(value: T, delay = 400): T {
  // debounced 状态类型是 T，初始值用传入的 value
  const [debounced, setDebounced] = useState<T>(value);

  // 💡 提示：useEffect 的清理函数作用（核心知识点）
  //   - 每当 value 或 delay 变化，useEffect 会重新执行
  //   - 执行流程：先运行上一次返回的清理函数（clearTimeout），再运行新的 effect
  //   - 没有清理函数的话：连续输入 "abc" 会启动 3 个定时器，最终都触发 setDebounced
  //   - 有清理函数：每次新输入都会取消上一次的定时器，只有最后一次输入的定时器会触发
  //   - 这就是"防抖"的本质：用清理函数取消未完成的定时器
  useEffect(() => {
    // 启动定时器，delay 毫秒后才更新 debounced 值
    const timer = setTimeout(() => setDebounced(value), delay);

    // 返回清理函数：组件卸载或依赖变化时执行，取消尚未触发的定时器
    return () => clearTimeout(timer);
  }, [value, delay]);  // 依赖数组：value 或 delay 变化时才重新执行

  return debounced;
}

// === 3. useLocalStorage：泛型 + 持久化 ===
// 💡 提示：泛型 <T> 让同一个 Hook 支持多种存储类型
//   - useLocalStorage<string>("token", "") 存字符串
//   - useLocalStorage<number>("count", 0) 存数字
//   - useLocalStorage<User>("user", null) 存对象
//   - T 的类型决定了 set 函数的参数类型，传错类型会编译报错
function useLocalStorage<T>(key: string, initial: T) {
  // 💡 提示：useState 的惰性初始化
  //   - 传入函数 () => {...}，只在首次渲染时执行一次
  //   - 避免每次渲染都去读 localStorage（虽然读操作不慢，但没必要重复）
  //   - SSR 安全：typeof window === "undefined" 判断服务端环境，避免报错
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = window.localStorage.getItem(key);
      // JSON.parse 后用 as T 断言类型，因为 localStorage 只存字符串
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      // 解析失败（如数据损坏）返回初始值，避免崩溃
      return initial;
    }
  });

  // 💡 提示：set 函数同时更新 state 和 localStorage
  //   - useCallback 稳定引用，key 变化时才重建函数
  //   - try/catch 处理写入失败（如 localStorage 已满、隐私模式禁用）
  const set = useCallback((newValue: T) => {
    setValue(newValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // 忽略写入失败
    }
  }, [key]);

  // 💡 提示：返回值类型设计 - 用 as const 返回元组
  //   - as const 让 TS 推断为 [T, (v: T) => void] 而非 (T | ((v: T) => void))[]
  //   - 调用方可以按位置解构：const [value, set] = useLocalStorage(...)
  //   - 对比对象返回 { value, set }：元组解构更简洁，符合 useState 的使用习惯
  //   - 选择依据：只有 2 个返回值（值 + setter）且语义明确时用元组，多值用对象
  return [value, set] as const;
}

// === 4. console.log 演示：Hook 行为模拟 ===
// 💡 提示：以下代码在模块加载时执行，演示 Hook 的运行时行为
//   实际的 Hook 调用必须在组件内部，这里用纯函数模拟其行为

// (1) 模拟 useDebounce 的防抖行为：实时值 vs 防抖值
//   连续输入时，防抖值会延迟更新，只保留最后一次输入
console.log("=== useDebounce 防抖行为模拟 ===");
let simulatedDebounced = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const simulateInput = (value: string, delay: number) => {
  console.log('[useDebounce] 实时值: "' + value + '" (输入时刻)');
  // 模拟 useEffect 的清理 + 重新设定：先清除上一次定时器
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    simulatedDebounced = value;
    console.log('[useDebounce] 防抖值: "' + simulatedDebounced + '" (' + delay + 'ms 后更新)');
  }, delay);
};
// 模拟连续输入："a" -> "ab" -> "abc"
simulateInput("a", 400);
simulateInput("ab", 400);
simulateInput("abc", 400);
// 输出说明：连续输入时只有最后一次 "abc" 会在 400ms 后触发更新（实际防抖由清理函数保证）

// (2) 模拟 useToggle 的切换过程
console.log("=== useToggle 切换过程模拟 ===");
let toggleState = false;
const simulateToggle = () => {
  toggleState = !toggleState;
  console.log("[useToggle] toggle() -> on = " + toggleState);
};
console.log("[useToggle] 初始值 on = " + toggleState);
simulateToggle();  // false -> true
simulateToggle();  // true -> false
simulateToggle();  // false -> true
// 输出说明：每次 toggle 都翻转当前值

// (3) 演示 useLocalStorage 的读写
console.log("=== useLocalStorage 读写模拟 ===");
// 模拟 localStorage（实际环境用 window.localStorage）
const fakeStorage: Record<string, string> = {};
const simulateLocalStorage = (key: string, value: unknown) => {
  // 写入：JSON.stringify 后存入
  fakeStorage[key] = JSON.stringify(value);
  console.log("[useLocalStorage] 写入 " + key + " = " + fakeStorage[key]);
  // 读取：JSON.parse 后取出
  const read = JSON.parse(fakeStorage[key]);
  console.log("[useLocalStorage] 读取 " + key + " = " + JSON.stringify(read) + " (类型: " + typeof read + ")");
};
simulateLocalStorage("tsx-demo-name", "张三");
simulateLocalStorage("tsx-demo-count", 42);
simulateLocalStorage("tsx-demo-user", { id: 1, name: "李四" });
// 输出说明：所有类型都被 JSON.stringify 转为字符串存储，读取时再 parse 还原

// === 5. Demo 组件 ===
function ToggleDemo() {
  const { on, toggle } = useToggle(false);
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>1. useToggle</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => {
            console.log("[useToggle] toggle() 被点击，当前 on = " + on + " -> 即将变为 " + !on);
            toggle();
          }}
          style={{
            width: 56, height: 30, borderRadius: 15, border: "none",
            background: on ? "#22c55e" : "#d1d5db", cursor: "pointer",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: on ? 29 : 3,
            width: 24, height: 24, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
          }} />
        </button>
        <span style={{ fontSize: 13, color: on ? "#22c55e" : "#6b7280" }}>
          {on ? "已开启" : "已关闭"}
        </span>
      </div>
    </div>
  );
}

function DebounceDemo() {
  const [text, setText] = useState("");
  const debounced = useDebounce(text, 400);

  // 💡 提示：useEffect 监听 text 和 debounced，输出"实时值 vs 防抖值"
  //   - text 每次输入立即变化（实时值）
  //   - debounced 延迟 400ms 才变化（防抖值）
  //   - 在控制台可以观察到：text 先变，debounced 延迟跟随
  useEffect(() => {
    console.log('[useDebounce] 实时值: "' + text + '" | 防抖值: "' + debounced + '"');
  }, [text, debounced]);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>2. useDebounce（400ms）</div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文字，停止 400ms 后更新"
        style={inputStyle}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        实时值：<span style={{ color: "#ef4444" }}>{text || "（空）"}</span>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        防抖值：<span style={{ color: "#22c55e", fontWeight: 600 }}>{debounced || "（空）"}</span>
      </div>
    </div>
  );
}

function LocalStorageDemo() {
  const [name, setName] = useLocalStorage<string>("tsx-demo-name", "");
  const [count, setCount] = useLocalStorage<number>("tsx-demo-count", 0);

  // 💡 提示：useEffect 监听 name 和 count，演示 localStorage 的读写
  //   - 首次渲染：从 localStorage 读取（如果之前存过）
  //   - 后续变化：写入 localStorage 并触发 useEffect
  useEffect(() => {
    console.log('[useLocalStorage] 读取/写入 name = "' + name + '"');
  }, [name]);
  useEffect(() => {
    console.log("[useLocalStorage] 读取/写入 count = " + count);
  }, [count]);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>3. useLocalStorage（刷新页面仍保留）</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="保存到 localStorage 的名字"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setCount(count + 1)}
          style={smallBtnStyle}
        >+1</button>
        <button
          onClick={() => setCount(count - 1)}
          style={smallBtnStyle}
        >-1</button>
        <button
          onClick={() => setCount(0)}
          style={{ ...smallBtnStyle, borderColor: "#ef4444", color: "#ef4444" }}
        >重置</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
          计数：{count}
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        {name ? \`已保存：\${name}\` : "（名字为空）"}
      </div>
    </div>
  );
}

// ============ 组合：搜索建议（useDebounce + 模拟 fetch）============
function SearchDemo() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  const allItems = ["TypeScript", "JavaScript", "React", "Vue", "Angular", "Node.js", "Next.js", "Python", "Rust"];

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    // 模拟异步搜索
    const timer = setTimeout(() => {
      if (id !== reqId.current) return;
      const matched = allItems.filter((x) =>
        x.toLowerCase().includes(debounced.toLowerCase())
      );
      setResults(matched);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [debounced]);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>4. 组合：防抖搜索（useDebounce + useEffect）</div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入技术栈名称"
        style={inputStyle}
      />
      <div style={{ marginTop: 10, minHeight: 28 }}>
        {loading && <span style={{ fontSize: 13, color: "#3b82f6" }}>搜索中...</span>}
        {!loading && results.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {results.map((r) => (
              <span key={r} style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 12,
                background: "#dbeafe", color: "#1e40af",
              }}>
                {r}
              </span>
            ))}
          </div>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <span style={{ fontSize: 13, color: "#9ca3af" }}>无匹配结果</span>
        )}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ padding: 16, maxWidth: 520, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>
        🪝 自定义 Hook 综合演示
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ToggleDemo />
        <DebounceDemo />
        <LocalStorageDemo />
        <SearchDemo />
      </div>
    </div>
  );
}

// ============ 样式常量 ============
const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 16,
  background: "#fff",
};

const titleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 10,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box" as const,
};

const smallBtnStyle = {
  padding: "5px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
};`,
  },

  // ===========================================================
  // 第 9 章：forwardRef 与 useImperativeHandle
  // ===========================================================
  {
    id: "tsx-forward-ref",
    group: "进阶篇",
    icon: "🔗",
    title: "forwardRef 与 useImperativeHandle",
    content: `# forwardRef 与 useImperativeHandle

父组件有时需要命令式操作子组件内部的 DOM（focus、scroll、measure）。但 \`ref\` 不是普通 prop，React 默认不会把 \`ref\` 传给子组件。\`forwardRef\` 解决"把 ref 透传给子组件"的问题，\`useImperativeHandle\` 则用于"自定义 ref 暴露哪些方法"。

---

## 一、为什么需要 forwardRef

React 对 \`ref\` 做了特殊处理——它不会出现在 \`props\` 里：

\`\`\`tsx
// ❌ 这样拿不到 ref
function MyInput(props) {
  // props 里没有 ref
  return <input {...props} />;
}

const inputRef = useRef<HTMLInputElement>(null);
<MyInput ref={inputRef} />;  // ref 被特殊处理，没传进去
\`\`\`

\`forwardRef\` 让组件能接收 \`ref\` 作为第二个参数：

\`\`\`tsx
const MyInput = forwardRef<HTMLInputElement>((props, ref) => {
  return <input ref={ref} {...props} />;
});

const inputRef = useRef<HTMLInputElement>(null);
<MyInput ref={inputRef} />;  // ✅ 现在 ref 能拿到 input DOM
\`\`\`

---

## 二、forwardRef 泛型语法

\`forwardRef\` 接受两个泛型参数：\`forwardRef<RefType, PropsType>\`。

\`\`\`tsx
type FancyInputProps = {
  placeholder?: string;
  defaultValue?: string;
};

const FancyInput = forwardRef<HTMLInputElement, FancyInputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);
\`\`\`

- 第一个泛型 \`HTMLInputElement\` 是 ref 指向的 DOM 类型
- 第二个泛型 \`FancyInputProps\` 是 props 类型

**顺序很重要**：先 ref 类型，再 props 类型，别搞反。

---

## 三、常见透传模式

### 透传给 input

\`\`\`tsx
const MyInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => <input ref={ref} {...props} />
);
\`\`\`

### 透传给 div

\`\`\`tsx
const Box = forwardRef<HTMLDivElement, { children?: ReactNode }>(
  (props, ref) => <div ref={ref} {...props} />
);
\`\`\`

### 透传给 button

\`\`\`tsx
const MyButton = forwardRef<HTMLButtonElement, { label: string }>(
  ({ label, ...rest }, ref) => <button ref={ref} {...rest}>{label}</button>
);
\`\`\`

---

## 四、useImperativeHandle：自定义暴露的方法

透传整个 DOM ref 有时太"裸"——父组件能改任意属性。更可控的方式是用 \`useImperativeHandle\` 只暴露你希望的方法：

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef } from "react";

// 定义暴露给父组件的 handle 类型
type FancyInputHandle = {
  focus: () => void;
  clear: () => void;
  select: () => void;
  getValue: () => string;
};

type FancyInputProps = {
  defaultValue?: string;
  placeholder?: string;
};

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(
  ({ defaultValue = "", placeholder }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = "";
      },
      select: () => inputRef.current?.select(),
      getValue: () => inputRef.current?.value ?? "",
    }));

    return <input ref={inputRef} defaultValue={defaultValue} placeholder={placeholder} />;
  }
);
\`\`\`

要点：
- \`forwardRef<FancyInputHandle, Props>\` 的 ref 类型是**自定义 handle**，不再是 DOM 类型
- \`useImperativeHandle(ref, () => ({...}))\` 返回的对象就是 \`ref.current\` 的值
- 内部用单独的 \`inputRef\` 拿真实 DOM

---

## 五、定义 handle 类型接口

把 handle 类型单独定义，方便复用和文档化：

\`\`\`tsx
interface ModalHandle {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

const Modal = forwardRef<ModalHandle, ModalProps>((props, ref) => {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    isOpen: () => open,
  }));
  // ...
});
\`\`\`

---

## 六、合并 forwarded ref 与内部 ref

有时你既要内部用 ref，又要透传给父。用 \`useImperativeHandle\` 组合：

\`\`\`tsx
const Combined = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);

  // 把 internalRef 同步到外部 ref
  useImperativeHandle(ref, () => internalRef.current!, []);

  return <div ref={internalRef} {...props} />;
});
\`\`\`

这样内部、外部都能访问同一个 DOM。

---

## 七、useImperativeHandle 的依赖数组

第三个参数是依赖数组，控制 handle 何时重建：

\`\`\`tsx
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
  setValue: (v: string) => { if (inputRef.current) inputRef.current.value = v; },
}), []);  // 空依赖：只创建一次，引用稳定
\`\`\`

如果 handle 里用到 state/props，要加入依赖：

\`\`\`tsx
useImperativeHandle(ref, () => ({
  scroll: () => divRef.current?.scrollTo(0, offset),
}), [offset]);  // offset 变化时重建 handle
\`\`\`

---

## 八、调用方使用

\`\`\`tsx
function App() {
  const inputRef = useRef<FancyInputHandle>(null);

  const handleFocus = () => inputRef.current?.focus();
  const handleClear = () => inputRef.current?.clear();
  const handleGetValue = () => {
    alert(\`当前值：\${inputRef.current?.getValue()}\`);
  };

  return (
    <>
      <FancyInput ref={inputRef} placeholder="试试" defaultValue="hello" />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleClear}>清空</button>
      <button onClick={handleGetValue}>取值</button>
    </>
  );
}
\`\`\`

注意 \`inputRef\` 的泛型是 \`FancyInputHandle\`（自定义接口），不是 \`HTMLInputElement\`。调用 \`inputRef.current?.focus()\` 类型安全。

---

## 九、forwardRef 的 props 类型：合并原生属性

\`\`\`tsx
type FancyInputProps = React.ComponentPropsWithoutRef<"input"> & {
  variant?: "primary" | "ghost";
};

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(
  ({ variant = "primary", ...rest }, ref) => {
    // rest 包含所有原生 input 属性
    return <input {...rest} />;
  }
);
\`\`\`

\`ComponentPropsWithoutRef\` 提取原生属性并去掉 \`ref\`（因为 forwardRef 自己处理 ref）。

---

## 十、React 19 变化：ref 作为 prop

React 19 起，函数组件可以直接接收 \`ref\` 作为普通 prop，不需要 \`forwardRef\`：

\`\`\`tsx
// React 19 写法
function FancyInput({ ref, placeholder }: {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
}) {
  return <input ref={ref} placeholder={placeholder} />;
}
\`\`\`

但 \`useImperativeHandle\` 仍然需要 ref 参数。旧项目用 forwardRef 没问题，新项目可考虑直接 prop。

---

## 十一、常见陷阱

### 1. ref 泛型写错

\`\`\`tsx
// ❌ 想拿 DOM 但泛型写成了 props
forwardRef<FancyInputProps, HTMLInputElement>(...)  // 顺序反了

// ✅ 先 ref 类型，再 props 类型
forwardRef<HTMLInputElement, FancyInputProps>(...)
\`\`\`

### 2. useImperativeHandle 漏依赖

handle 里用了最新的 state，但依赖数组为空，导致拿旧值。

### 3. ref 可能为 null

\`ref.current\` 类型是 \`Handle | null\`，访问要 \`?.\`。

---

**要点回顾**：
1. \`forwardRef<RefType, PropsType>\` 透传 ref
2. \`useImperativeHandle\` 自定义暴露的方法，更可控
3. handle 类型单独定义接口，复用方便
4. 内部 ref + useImperativeHandle 可同时满足内外需求
5. React 19 起 ref 可作普通 prop，但 useImperativeHandle 仍需 ref`,

    code: `// forwardRef 与 useImperativeHandle - 可运行 Demo
import {
  forwardRef, useRef, useImperativeHandle, useState,
  type ReactNode,
} from "react";

// === 1. 类型定义：FancyInputHandle（自定义 ref 暴露的接口）===
// 💡 提示：把 handle 类型单独定义，方便复用和文档化
//   - 这是 useImperativeHandle 暴露给父组件的"合同"
//   - 父组件的 useRef<FancyInputHandle> 必须与此接口结构匹配
//   - 不暴露原生 DOM，只暴露受控的方法，更安全
type FancyInputHandle = {
  focus: () => void;
  clear: () => void;
  select: () => void;
  setValue: (v: string) => void;
  getValue: () => string;
};

// === 2. Props 类型定义 ===
type FancyInputProps = {
  defaultValue?: string;
  placeholder?: string;
};

// === 3. forwardRef 组件：让函数组件能接收父组件传来的 ref ===
// 💡 提示：为什么需要 forwardRef？
//   - React 对 ref 做了特殊处理，默认不会出现在 props 里
//   - 函数组件无法直接拿到父组件传入的 ref（class 组件可以）
//   - forwardRef 包装后，渲染函数会收到第二个参数 ref，可透传给内部 DOM
//   - 泛型顺序：<RefType, PropsType>，第一个是 ref 指向的类型，第二个是 props 类型
//   - 这里 ref 类型是 FancyInputHandle（自定义接口），不是 HTMLInputElement
//     因为我们要用 useImperativeHandle 自定义暴露的内容
const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(
  ({ defaultValue = "", placeholder }, ref) => {
    // 💡 提示：useRef<HTMLInputElement>(null) 的返回类型是 RefObject<HTMLInputElement>
    //   - RefObject<T> 的结构：{ current: T | null }
    //   - 初始值传 null，所以 current 初始为 null
    //   - React 在组件挂载后会自动把 DOM 元素赋值给 current
    //   - 卸载时 React 会把 current 重置为 null
    //   - 生命周期：null（创建）→ HTMLInputElement（挂载）→ null（卸载）
    //   - 因此访问 current 的属性前必须判空（用 ?. 或 if 判断）
    const inputRef = useRef<HTMLInputElement>(null);

    // === 4. useImperativeHandle：自定义 ref.current 暴露的内容 ===
    // 💡 提示：useImperativeHandle 的作用
    //   - 默认情况下，forwardRef 透传的 ref.current 会指向整个 DOM 元素
    //   - 父组件能改任意属性，太"裸"，封装性差
    //   - useImperativeHandle 让你自定义 ref.current 暴露的内容
    //   - 第二个参数是工厂函数 () => ({...})，返回值就是 ref.current 的值
    //   - 这里只暴露 focus/clear/select/setValue/getValue 五个方法，隐藏原生 DOM
    //
    // 💡 提示：第三个参数 []（依赖数组）的作用
    //   - 类似 useEffect/useMemo 的依赖数组，控制 handle 何时重建
    //   - 空数组 []：handle 只在组件挂载时创建一次，引用永远稳定
    //     适合 handle 内部不依赖外部变量（都用 ref.current 读取最新值）的场景
    //   - 若 handle 内部用到 state/props（如闭包捕获的值），必须加入依赖
    //     否则会捕获旧值，导致调用方法时拿到过期的数据
    //   - 这里所有方法都通过 inputRef.current 读取最新的 DOM 值，无需依赖外部变量
    //     所以用空数组 [] 即可，性能最优
    //
    // 💡 提示：ref.current 可能为 null 的处理
    //   - ref 参数的类型是 Ref<FancyInputHandle>，是 RefObject | RefCallback | null 的联合
    //   - 组件挂载前或卸载后，inputRef.current 都可能是 null
    //   - 调用 DOM 方法时用可选链 ?.（如 inputRef.current?.focus()）
    //   - 写入 DOM 属性时用 if 判断（如 if (inputRef.current) inputRef.current.value = v）
    //   - getValue 返回值用 ?? "" 兜底，避免返回 undefined
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = "";
      },
      select: () => inputRef.current?.select(),
      setValue: (v: string) => {
        if (inputRef.current) inputRef.current.value = v;
      },
      getValue: () => inputRef.current?.value ?? "",
    }), []);

    return (
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "2px solid #e5e7eb", fontSize: 14, outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box" as const,
        }}
      />
    );
  }
);
FancyInput.displayName = "FancyInput";

// === 5. AutoScrollList：暴露 scrollToBottom/scrollToTop ===
// 💡 提示：第二个 forwardRef 示例，演示同一模式可复用
//   - ref 类型是 AutoScrollHandle（自定义接口），父组件只能调用 scrollToTop/scrollToBottom
//   - 内部用 listRef 拿到真实 DOM，方法体通过 listRef.current 操作 scrollTo API
//   - 同样使用空依赖数组 []，handle 只创建一次
type AutoScrollHandle = {
  scrollToBottom: () => void;
  scrollToTop: () => void;
};

const AutoScrollList = forwardRef<AutoScrollHandle, { items: string[] }>(
  ({ items }, ref) => {
    // listRef 类型是 RefObject<HTMLDivElement>，current 初始为 null
    const listRef = useRef<HTMLDivElement>(null);

    // useImperativeHandle：暴露 scrollToTop/scrollToBottom，隐藏原生 div
    // 依赖数组 []：handle 只创建一次，方法内通过 listRef.current 读最新 DOM
    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        if (listRef.current) {
          listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        }
      },
      scrollToTop: () => {
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
    }), []);

    return (
      <div
        ref={listRef}
        style={{
          height: 120, overflowY: "auto", borderRadius: 8,
          border: "1px solid #e5e7eb", padding: 8,
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{
            padding: "6px 10px", marginBottom: 4, borderRadius: 4,
            background: "#f3f4f6", fontSize: 13,
          }}>
            {i + 1}. {item}
          </div>
        ))}
      </div>
    );
  }
);
AutoScrollList.displayName = "AutoScrollList";

// === 6. console.log 演示：ref 的生命周期与类型信息 ===
// 💡 提示：以下代码在模块加载时执行，演示 ref 的运行时行为
//   实际开发中 ref.current 由 React 自动管理，这里用对象模拟其生命周期

// (1) 演示 ref.current 的生命周期：null → 赋值 → 调用方法 → 重置为 null
console.log("=== ref 生命周期演示 ===");

// 阶段 1：创建 ref，current 初始为 null（对应 useRef<T>(null) 的初始状态）
// RefObject<T> 的结构是 { current: T | null }，初始 current 为 null
const simulateRef: { current: { value: string; focus: () => void; select: () => void } | null } = {
  current: null,
};
console.log("[ref 生命周期] 1. 创建 ref，current =", simulateRef.current, "（初始为 null）");
console.log("[ref 生命周期]    current 类型 =", typeof simulateRef.current);

// 阶段 2：组件挂载后，React 把 DOM 元素赋值给 current
const fakeInput = {
  value: "hello",
  focus: () => console.log("[ref 生命周期]    fakeInput.focus() 被调用"),
  select: () => console.log("[ref 生命周期]    fakeInput.select() 被调用"),
};
simulateRef.current = fakeInput;
console.log("[ref 生命周期] 2. 组件挂载后，current 被赋值为 DOM 元素");
console.log("[ref 生命周期]    current 是否为 null =", simulateRef.current === null, "（false：已赋值）");
console.log("[ref 生命周期]    current.value =", simulateRef.current?.value);

// 阶段 3：通过 ref.current 调用方法（对应父组件调用 inputRef.current?.focus()）
console.log("[ref 生命周期] 3. 通过 ref.current 调用方法:");
simulateRef.current?.focus();
simulateRef.current?.select();

// 阶段 4：组件卸载后，React 把 current 重置为 null
simulateRef.current = null;
console.log("[ref 生命周期] 4. 组件卸载后，current 重置为 =", simulateRef.current, "（null）");
console.log("[ref 生命周期]    此时调用 ?.focus() 不会报错（可选链 ?. 短路）");

// (2) 演示 useImperativeHandle 暴露的方法
console.log("=== useImperativeHandle 暴露的方法演示 ===");

// 模拟 FancyInput 通过 useImperativeHandle 暴露的 handle 对象
// 注意：handle 不包含原生 DOM，只有 5 个受控方法（封装性更好）
const simulateHandle: FancyInputHandle = {
  focus: () => console.log("[useImperativeHandle] handle.focus() 被调用"),
  clear: () => console.log("[useImperativeHandle] handle.clear() 被调用"),
  select: () => console.log("[useImperativeHandle] handle.select() 被调用"),
  setValue: (v: string) => console.log("[useImperativeHandle] handle.setValue(" + v + ") 被调用"),
  getValue: () => {
    console.log("[useImperativeHandle] handle.getValue() 被调用");
    return "模拟的输入值";
  },
};

console.log("[useImperativeHandle] handle 的方法列表 =", Object.keys(simulateHandle));
console.log("[useImperativeHandle] handle.focus 类型 =", typeof simulateHandle.focus);
console.log("[useImperativeHandle] handle.getValue 类型 =", typeof simulateHandle.getValue);

// 调用暴露的方法（对应父组件调用 inputRef.current?.focus() 等）
simulateHandle.focus();
simulateHandle.setValue("新值");
const refValue = simulateHandle.getValue();
console.log("[useImperativeHandle] getValue() 返回值 =", refValue);

// (3) 输出 ref 的类型信息
console.log("=== ref 类型信息 ===");
console.log("[ref 类型] useRef<HTMLInputElement>(null) 返回类型 = RefObject<HTMLInputElement>");
console.log("[ref 类型]   RefObject<T> 的结构 = { current: T | null }");
console.log("[ref 类型]   current 可变，React 内部负责赋值/重置");
console.log("[ref 类型] forwardRef 的 ref 参数类型 = Ref<FancyInputHandle>");
console.log("[ref 类型]   Ref<T> = RefCallback<T> | RefObject<T> | null");
console.log("[ref 类型]   三种形态：对象 ref / 回调 ref / null");
console.log("[ref 类型] useImperativeHandle 把 Ref<Handle> 的 current 替换为自定义对象");

// ============ Demo 入口 ============
export default function Demo() {
  const inputRef = useRef<FancyInputHandle>(null);
  const listRef = useRef<AutoScrollHandle>(null);
  const [log, setLog] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([
    "第一条消息", "第二条消息", "第三条消息",
  ]);

  const addLog = (line: string) =>
    setLog((prev) => [...prev, \`[\${new Date().toLocaleTimeString()}] \${line}\`]);

  const messagesList = [
    "TypeScript 类型体操", "React Hooks 进阶", "Next.js App Router",
    "CSS-in-JS 方案", "状态管理对比", "性能优化技巧",
    "测试驱动开发", "可访问性实践", "国际化和本地化", "部署与监控",
  ];

  return (
    <div style={{ padding: 16, maxWidth: 520, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>
        🔗 forwardRef + useImperativeHandle
      </h2>

      {/* FancyInput 区 */}
      <div style={cardStyle}>
        <div style={titleStyle}>1. FancyInput（暴露 focus/clear/select/取值/设值）</div>
        <FancyInput ref={inputRef} defaultValue="初始内容" placeholder="点击下方按钮操作我" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <button onClick={() => { inputRef.current?.focus(); addLog("focus()"); }} style={btnStyle}>聚焦</button>
          <button onClick={() => { inputRef.current?.select(); addLog("select()"); }} style={btnStyle}>全选</button>
          <button onClick={() => { inputRef.current?.clear(); addLog("clear()"); }} style={btnStyle}>清空</button>
          <button
            onClick={() => {
              const v = inputRef.current?.getValue() ?? "";
              addLog(\`getValue() => "\${v}"\`);
            }}
            style={btnStyle}
          >取值</button>
          <button
            onClick={() => {
              inputRef.current?.setValue(\`随机值-\${Math.floor(Math.random() * 100)}\`);
              addLog("setValue()");
            }}
            style={btnStyle}
          >设值</button>
        </div>
      </div>

      {/* AutoScrollList 区 */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={titleStyle}>2. AutoScrollList（暴露 scrollToTop/scrollToBottom）</div>
        <AutoScrollList ref={listRef} items={messages} />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => { listRef.current?.scrollToTop(); addLog("scrollToTop()"); }} style={btnStyle}>滚到顶</button>
          <button onClick={() => { listRef.current?.scrollToBottom(); addLog("scrollToBottom()"); }} style={btnStyle}>滚到底</button>
          <button
            onClick={() => {
              const item = messagesList[messages.length % messagesList.length];
              setMessages((prev) => [...prev, item]);
              setTimeout(() => listRef.current?.scrollToBottom(), 50);
              addLog(\`添加并滚到底: \${item}\`);
            }}
            style={{ ...btnStyle, background: "#3b82f6", color: "#fff", borderColor: "#3b82f6" }}
          >添加并滚到底</button>
        </div>
      </div>

      {/* 操作日志 */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={titleStyle}>操作日志</div>
        <div style={{
          background: "#0f172a", borderRadius: 6, padding: 12,
          minHeight: 60, maxHeight: 140, overflowY: "auto",
          fontFamily: "monospace", fontSize: 12,
        }}>
          {log.length === 0 ? (
            <div style={{ color: "#64748b" }}>（点击上方按钮记录操作）</div>
          ) : (
            log.map((line, i) => (
              <div key={i} style={{ color: "#86efac", lineHeight: 1.6 }}>{line}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 样式常量 ============
const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 16,
  background: "#fff",
};

const titleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 10,
};

const btnStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
};`,
  },

  // ===========================================================
  // 第 10 章：泛型组件
  // ===========================================================
  {
    id: "tsx-generic",
    group: "进阶篇",
    icon: "🧬",
    title: "泛型组件",
    content: `# 泛型组件

普通组件的 props 类型是固定的。\`Table\` 组件要支持"用户列表"、"商品列表"，数据类型不同但 UI 结构一样——这时候需要泛型组件：\`<Table<User> ... />\`，让组件类型跟随数据类型。

---

## 一、为什么需要泛型组件

不泛型的写法，数据只能用 \`any\`：

\`\`\`tsx
// ❌ 不泛型：data 是 any，列配置没有类型约束
function Table({ data, columns }: { data: any[]; columns: any[] }) {
  return /* ... */;
}
\`\`\`

泛型写法：

\`\`\`tsx
// ✅ 泛型：T 是行数据类型
function Table<T>(props: { data: T[]; columns: Column<T>[] }) {
  return /* ... */;
}

// 使用：T 被推断为 User
<Table data={users} columns={userColumns} />
\`\`\`

\`columns\` 的 \`render\` 函数能拿到强类型的行数据，访问不存在的字段会报错。

---

## 二、基本语法

泛型组件的函数签名：

\`\`\`tsx
type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

function Table<T>(props: TableProps<T>) {
  // props.data: T[]
  // props.columns: Column<T>[]
  return /* ... */;
}
\`\`\`

泛型参数 \`<T>\` 写在函数名后，组件内 T 可用。

### 调用时不传泛型（靠推断）

\`\`\`tsx
<Table data={users} columns={cols} />
// T 被推断为 User（来自 data: User[]）
\`\`\`

### 调用时显式传泛型（推断不准时）

\`\`\`tsx
<Table<User> data={[]} columns={cols} />
\`\`\`

---

## 三、Column 类型设计

\`\`\`tsx
type Column<T> = {
  key: keyof T;            // 列对应数据的字段名
  title: string;          // 表头
  render?: (row: T) => React.ReactNode;  // 自定义渲染
  width?: number;
};
\`\`\`

注意 \`key: keyof T\`——key 必须是 T 的字段名，传错会报错：

\`\`\`tsx
type User = { id: number; name: string; age: number };

const cols: Column<User>[] = [
  { key: "id", title: "ID" },
  { key: "name", title: "姓名" },
  { key: "age", title: "年龄" },
  { key: "email", title: "邮箱" },  // ❌ User 没有 email 字段
];
\`\`\`

这就是泛型组件的核心价值：**列配置和数据结构强绑定**。

---

## 四、泛型约束（extends）

限制 T 必须有某些字段：

\`\`\`tsx
// T 必须有 id 字段
function DataTable<T extends { id: string | number }>(props: TableProps<T>) {
  return /* ... */;
}

// T 必须有 label 字段
function Tabs<T extends { label: string; value: string }>(props: TabsProps<T>) {
  return /* ... */;
}
\`\`\`

\`extends\` 约束让组件内能安全访问约束字段（如 \`row.id\` 当 key）。

---

## 五、Select<T> 组件

\`\`\`tsx
type Option<T> = {
  value: T;
  label: string;
};

type SelectProps<T> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
};

function Select<T>(props: SelectProps<T>) {
  const { options, value, onChange, placeholder } = props;
  return (
    <select
      value={value === null ? "" : String(value)}
      onChange={(e) => {
        const opt = options.find((o) => String(o.value) === e.target.value);
        if (opt) onChange(opt.value);  // opt.value: T
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, i) => (
        <option key={i} value={String(opt.value)}>{opt.label}</option>
      ))}
    </select>
  );
}

// 使用：value 类型跟随 T
const [status, setStatus] = useState<"draft" | "published" | null>(null);
<Select
  options={[
    { value: "draft", label: "草稿" },
    { value: "published", label: "已发布" },
  ]}
  value={status}
  onChange={(v) => setStatus(v)}  // v: "draft" | "published"
/>
\`\`\`

\`onChange\` 的参数 \`v\` 类型是 \`T\`，即选项的 value 类型——强类型安全。

---

## 六、完整 Table<T> 示例

\`\`\`tsx
type Column<T> = {
  key: keyof T;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: number;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  empty?: React.ReactNode;
};

function Table<T>(props: TableProps<T>) {
  const { data, columns, rowKey, empty } = props;
  if (data.length === 0) return <>{empty ?? "暂无数据"}</>;

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} style={{ width: col.width }}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={rowKey(row)}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render ? col.render(row, i) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
\`\`\`

要点：
- \`rowKey: (row: T) => string | number\` 让调用方指定唯一键
- \`col.render\` 拿到强类型 \`row: T\`
- 默认渲染用 \`String(row[col.key])\`，\`col.key\` 是 \`keyof T\` 保证存在

---

## 七、调用方使用

\`\`\`tsx
type User = { id: number; name: string; age: number; role: string };

const users: User[] = [
  { id: 1, name: "张三", age: 28, role: "admin" },
  { id: 2, name: "李四", age: 32, role: "editor" },
];

const columns: Column<User>[] = [
  { key: "id", title: "ID", width: 60 },
  { key: "name", title: "姓名" },
  { key: "age", title: "年龄", render: (row) => <span>{row.age} 岁</span> },
  {
    key: "role",
    title: "角色",
    render: (row) => (
      <span style={{ color: row.role === "admin" ? "red" : "blue" }}>
        {row.role}
      </span>
    ),
  },
];

<Table data={users} columns={columns} rowKey={(row) => row.id} />
\`\`\`

注意 \`columns\` 显式标注为 \`Column<User>[]\`——这样写每一列时 \`key\` 会有自动补全，传错字段名立刻报错。

---

## 八、泛型 + 约束组合

\`\`\`tsx
// 要求 T 有 id 字段，组件内可安全用 row.id
function KeyedList<T extends { id: string | number }>(props: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item.id}>{props.renderItem(item)}</li>
      ))}
    </ul>
  );
}
\`\`\`

约束让组件不必要求调用方传 \`rowKey\`，因为 T 一定有 \`id\`。

---

## 九、常见陷阱：forwardRef + 泛型

\`forwardRef\` 和泛型组件**不兼容**——forwardRef 的类型签名不支持泛型参数传递：

\`\`\`tsx
// ❌ 无法这样写泛型 + forwardRef
const Table = forwardRef<HTMLDivElement, TableProps<T>>(<T,>(props, ref) => {
  // T 在这里无法从外部推断
});
\`\`\`

变通方案：

1. **不用 forwardRef**：直接函数组件 + 泛型（React 19 推荐 ref 作 prop）
2. **用对象 props 包裹**：把泛型参数固定为某类型
3. **拆成两层**：外层泛型组件，内层 forwardRef 实例

\`\`\`tsx
// 方案 1：直接函数组件（React 19 ref 作 prop）
function Table<T>({ data, columns, ref }: TableProps<T> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref}>{/* ... */}</div>;
}
\`\`\`

---

## 十、泛型组件的.displayName 与类型导出

\`\`\`tsx
function Table<T>(props: TableProps<T>) { /* ... */ }
Table.displayName = "Table";

// 导出类型供调用方使用
export type { TableProps, Column };
\`\`\`

调用方写 \`Column<User>\` 时能拿到正确类型补全。

---

## 十一、泛型 Hook vs 泛型组件

| | 泛型 Hook | 泛型组件 |
|---|---|---|
| 定义 | \`function useXxx<T>\` | \`function Table<T>\` |
| 调用 | \`useXxx<User>(...)\` | \`<Table<User> ...>\` |
| 典型 | \`useState<T>\`、\`useArray<T>\` | \`<Table<T>>\`、\`<Select<T>>\` |

两者都是让类型跟随数据，提升类型安全。

---

**要点回顾**：
1. 泛型组件 \`function Comp<T>(props: Props<T>)\` 让组件类型跟随数据
2. \`Column<T>\` 的 \`key: keyof T\` 强绑定数据字段
3. \`T extends {...}\` 约束 T 必须有某字段
4. 调用方标注 \`Column<User>[]\` 获得字段补全
5. forwardRef + 泛型不兼容，React 19 用 ref 作 prop 绕过`,

    code: `// 泛型组件 - 可运行 Demo：泛型 Table + Select
import { useState, type ReactNode } from "react";

// === 1. 类型定义：Column<T> 与 keyof T ===
// 💡 提示：Column<T> 是泛型类型，T 代表"行数据类型"，会在调用方被推断
//   - keyof T 表示"T 的所有字段名的联合类型"
//   - 让 key 字段强绑定数据结构，拼错字段名会在编译期报错
type Column<T> = {
  // keyof T 保证 key 必须是 T 的字段名之一
  // 例如 Column<User> 的 key 只能是 "id" | "name" | "age" | "role" | "online"
  // 写成 "email" 会报错，避免运行时取到 undefined
  key: keyof T;
  title: string;
  // render 的 row 参数自动推断为 T，访问不存在字段会报错
  render?: (row: T, index: number) => ReactNode;
  width?: number;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  // rowKey 是回调函数：参数 row 由 T 推断，调用方写 (row) => row.id 时 row 是强类型
  rowKey: (row: T) => string | number;
  empty?: ReactNode;
};

// === 2. 类型定义：Option<T> 与 SelectProps<T> ===
type Option<T> = {
  // value 类型跟随 T，让选项值与 onChange 回调类型严格一致
  value: T;
  label: string;
};

type SelectProps<T> = {
  options: Option<T>[];
  value: T | null;
  // onChange 的参数类型是 T，与 options[].value 类型严格一致
  onChange: (value: T) => void;
  placeholder?: string;
};

// === 3. 泛型 Select<T> 组件 ===
// T extends string | number 限制了 T 的范围，让 T 可以被比较/索引：
//   原因 1：渲染 <option value={String(opt.value)}>，需要把 T 转成字符串作为 DOM 属性
//   原因 2：onChange 时用 String(o.value) === e.target.value 比较，T 必须可被 String() 转换
//   原因 3：string | number 是最常见的"可序列化值"类型，排除对象/数组等无法作为 option value 的类型
// 💡 提示：约束让组件内部可安全地用 String(value) 处理 T，无需 unknown 强转
function Select<T extends string | number>(props: SelectProps<T>) {
  const { options, value, onChange, placeholder } = props;
  return (
    <select
      value={value === null ? "" : String(value)}
      onChange={(e) => {
        // 通过 String 比较找到对应 option，再回调原始的 T 类型值（类型安全）
        const opt = options.find((o) => String(o.value) === e.target.value);
        if (opt) onChange(opt.value);  // opt.value 类型是 T，类型安全
      }}
      style={{
        padding: "8px 12px", borderRadius: 6,
        border: "1px solid #d1d5db", fontSize: 13, outline: "none",
        background: "#fff", cursor: "pointer",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, i) => (
        <option key={i} value={String(opt.value)}>{opt.label}</option>
      ))}
    </select>
  );
}

// === 4. 泛型 Table<T> 组件 ===
// Table<T> 的 T 没有约束，因为 Table 只做渲染和取值，不依赖 T 的特定字段
// 字段访问通过 col.key (keyof T) 完成，TypeScript 知道 row[col.key] 是合法的
function Table<T>(props: TableProps<T>) {
  const { data, columns, rowKey, empty } = props;

  if (data.length === 0) {
    return (
      <div style={{
        padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13,
        border: "1px solid #e5e7eb", borderRadius: 8,
      }}>
        {empty ?? "暂无数据"}
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{
                  padding: "10px 14px", textAlign: "left",
                  background: "#f9fafb", color: "#6b7280",
                  fontWeight: 600, fontSize: 12,
                  borderBottom: "1px solid #e5e7eb",
                  width: col.width,
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={rowKey(row)}  // rowKey 回调由调用方提供，row 是强类型 T
              style={{ borderBottom: i === data.length - 1 ? "none" : "1px solid #f3f4f6" }}
            >
              {columns.map((col) => (
                <td key={String(col.key)} style={{ padding: "10px 14px", color: "#111827" }}>
                  {/* col.key 是 keyof T，保证 row[col.key] 一定存在；col.render 的 row 是强类型 T */}
                  {col.render ? col.render(row, i) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// === 5. 数据定义 ===
type User = {
  id: number;
  name: string;
  age: number;
  role: "admin" | "editor" | "viewer";
  online: boolean;
};

const ALL_USERS: User[] = [
  { id: 1, name: "张三", age: 28, role: "admin", online: true },
  { id: 2, name: "李四", age: 32, role: "editor", online: false },
  { id: 3, name: "王五", age: 25, role: "viewer", online: true },
  { id: 4, name: "赵六", age: 40, role: "editor", online: true },
  { id: 5, name: "孙七", age: 22, role: "viewer", online: false },
];

// 💡 提示：显式标注 Column<User>[] 后，写 key 时 IDE 会自动补全 User 的字段名
//   key 是 keyof User，拼错字段名（如 "email"）会在编译期报错
const userColumns: Column<User>[] = [
  { key: "id", title: "ID", width: 60 },
  { key: "name", title: "姓名", render: (row) => (
    <span style={{ fontWeight: 600 }}>{row.name}</span>
  ) },
  { key: "age", title: "年龄", render: (row) => (
    <span style={{
      padding: "2px 8px", borderRadius: 10, fontSize: 12,
      background: row.age > 30 ? "#fef3c7" : "#dbeafe",
      color: row.age > 30 ? "#92400e" : "#1e40af",
    }}>
      {row.age} 岁
    </span>
  ) },
  { key: "role", title: "角色", render: (row) => {
    const colors: Record<User["role"], string> = {
      admin: "#ef4444", editor: "#3b82f6", viewer: "#6b7280",
    };
    return (
      <span style={{
        padding: "2px 10px", borderRadius: 10, fontSize: 12,
        background: colors[row.role] + "20", color: colors[row.role],
      }}>
        {row.role}
      </span>
    );
  } },
  { key: "online", title: "状态", render: (row) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: row.online ? "#22c55e" : "#d1d5db",
      }} />
      {row.online ? "在线" : "离线"}
    </span>
  ) },
];

// === 6. 演示：泛型类型推断与列配置结构 ===
// 💡 提示：以下 console.log 在模块加载时执行，演示泛型的运行时行为

// (1) 输出表格列配置的结构：每列包含 key（字段名）、title、可选 render/width
console.log("[泛型组件] 列配置结构 userColumns =", userColumns.map((c) => ({
  key: c.key,
  title: c.title,
  hasRender: typeof c.render === "function",
  width: c.width,
})));

// (2) 演示数据行的类型推断：由于 userColumns: Column<User>[]，Table<User> 的 data 必须是 User[]
console.log("[泛型组件] 数据行类型推断：ALL_USERS[0] 的字段 =", Object.keys(ALL_USERS[0]));
console.log("[泛型组件] ALL_USERS[0] =", ALL_USERS[0]);

// (3) 模拟 rowKey 回调的强类型保证：row 参数类型是 User，访问 row.id 安全
const simulateRowKey: (row: User) => number = (row) => row.id;
console.log("[泛型组件] rowKey 回调测试：第一行的 key =", simulateRowKey(ALL_USERS[0]));

// (4) 模拟 Select 的 onChange 回调：value 类型是 User["role"]，传非法值会编译报错
const simulateSelectChange: (value: User["role"]) => void = (value) => {
  console.log("[泛型组件] Select onChange 模拟触发，value =", value);
};
simulateSelectChange("admin");  // ✅ 合法
// simulateSelectChange("superadmin");  // ❌ 编译报错："superadmin" 不属于 User["role"]

// (5) 模拟点击行的交互行为：回调参数 row 是强类型 User
const simulateRowClick = (row: User) => {
  console.log("[泛型组件] 模拟点击行，row.id =", row.id, "row.name =", row.name);
};
simulateRowClick(ALL_USERS[0]);

// === 7. Demo 入口组件 ===
export default function Demo() {
  const [roleFilter, setRoleFilter] = useState<User["role"] | null>(null);
  const [onlyOnline, setOnlyOnline] = useState(false);

  const filtered = ALL_USERS.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (onlyOnline && !u.online) return false;
    return true;
  });

  // 输出选择器的当前值与过滤结果（每次渲染都会执行）
  console.log("[泛型组件] Select 当前值 roleFilter =", roleFilter);
  console.log("[泛型组件] 过滤后数据 filtered.length =", filtered.length, "条");

  return (
    <div style={{ padding: 16, maxWidth: 600, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>
        🧬 泛型组件 Table&lt;User&gt;
      </h2>

      {/* 过滤器 */}
      <div style={{
        display: "flex", gap: 12, alignItems: "center", marginBottom: 16,
        padding: 12, background: "#f9fafb", borderRadius: 8,
        flexWrap: "wrap",
      }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          角色筛选：
          <Select<User["role"]>
            options={[
              { value: "admin", label: "管理员" },
              { value: "editor", label: "编辑" },
              { value: "viewer", label: "访客" },
            ]}
            value={roleFilter}
            onChange={(v) => setRoleFilter(v)}
            placeholder="全部"
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={onlyOnline}
            onChange={(e) => setOnlyOnline(e.target.checked)}
          />
          仅看在线
        </label>

        {(roleFilter || onlyOnline) && (
          <button
            onClick={() => { setRoleFilter(null); setOnlyOnline(false); }}
            style={{
              padding: "4px 10px", fontSize: 12, borderRadius: 4,
              border: "1px solid #d1d5db", background: "#fff", cursor: "pointer",
              color: "#6b7280",
            }}
          >
            清除筛选
          </button>
        )}

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
          共 {filtered.length} / {ALL_USERS.length} 条
        </span>
      </div>

      {/* 泛型 Table：T 推断为 User */}
      <Table
        data={filtered}
        columns={userColumns}
        // rowKey 回调的强类型保证：row 参数是 User 类型，row.id 是 number
        // 若误写成 row.userId 会在编译期报错（User 没有 userId 字段）
        rowKey={(row) => row.id}
        empty="无符合条件的用户"
      />

      <div style={{
        marginTop: 16, padding: 12, background: "#eff6ff", borderRadius: 8,
        fontSize: 12, color: "#1e40af", lineHeight: 1.6,
      }}>
        💡 本组件中 Table 和 Select 都是泛型组件。\`columns\` 标注为 \`Column&lt;User&gt;[]\`，
        每列的 \`key\` 必须是 \`User\` 的字段（拼错会报错），\`render\` 的 \`row\` 自动推断为 \`User\` 类型。
      </div>
    </div>
  );
}`,
  },
];
