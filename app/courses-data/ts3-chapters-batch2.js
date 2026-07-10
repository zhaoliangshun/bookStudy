// =============================================================
// TypeScript 类型体操深入教程 —— 第二批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节（React 与 TypeScript 主题）：
//   1. ts3-react-component-types    — React 组件类型全解
//   2. ts3-react-hooks-types        — React Hooks 类型精解
//   3. ts3-react-state-management   — 类型安全的状态管理
//   4. ts3-react-forms              — 类型安全的表单处理
//   5. ts3-react-api-layer          — 类型安全的 API 层
//   6. ts3-react-advanced-patterns  — React 高级模式
//
export const chapters = [
  {
    id: "ts3-react-component-types",
    title: "React 组件类型全解",
    icon: "⚛️",
    group: "React 与 TypeScript",
    content: `# React 组件类型全解

在 React 与 TypeScript 的结合中，组件类型系统是构建可维护、类型安全应用的基石。本章将深入探讨 React 组件的各种类型定义方式，从基础的函数组件到高级的多态组件模式，帮助你建立完整的组件类型知识体系。

## 一、函数组件类型定义

在 React 18 之前，社区广泛使用 \`FC\`（FunctionComponent）类型来定义函数组件，但随着 TypeScript 和 React 的发展，现在更推荐直接使用普通函数签名。

### 1.1 FC 类型的历史与现状

\`FC\` 类型来自于 \`@types/react\` 包，它最初被设计用来自动包含 \`children\` 属性。但在 React 18 中，TypeScript 对 JSX 转换进行了改进，\`FC\` 的隐式 children 行为带来了一些问题。现在的最佳实践是：

- 如果组件需要 children，显式在 Props 中声明
- 如果组件不需要 children，直接使用函数返回 JSX.Element 的方式

\`FC\` 类型仍然可用，但它隐式包含 children 的特性在某些场景下可能导致类型不严格。例如，一个不应该接受 children 的组件，如果使用 FC 标注，TypeScript 不会报错，这可能导致运行时错误。FC 类型还隐式包含了一些其他属性，如 propTypes、contextTypes、defaultProps 等，这些在现代函数组件中并不常用。

### 1.2 现代函数组件类型写法

最推荐的方式是直接为组件的 props 定义接口，然后将组件声明为接收 props 并返回 JSX.Element 的普通函数。这种方式更加透明，类型检查也更加严格。在 TypeScript 中，你可以这样写：

\`\`\`tsx
interface GreetingProps {  // 定义接口 GreetingProps
  name: string;
  age?: number;
}

function Greeting(props: GreetingProps) {  // 定义函数 Greeting，参数: props: GreetingProps
  return <div>Hello {props.name}</div>;  // 返回 <div>Hello {props.name}</div>
}
\`\`\`

对于需要 children 的组件，可以使用 PropsWithChildren 工具类型，它会自动将 children 属性添加到你的 props 类型中。PropsWithChildren 是一个泛型类型，接收你的 props 类型作为参数，返回包含 children 的新类型。其定义大致为 \`type PropsWithChildren<P> = P & { children?: ReactNode }\`。

### 1.3 返回值类型的选择

在 React 中，组件可以返回多种类型的值：JSX.Element、ReactNode、ReactElement。理解它们之间的区别至关重要。

JSX.Element 是最具体的类型，它表示通过 JSX 语法创建的元素，或者通过 React.createElement 创建的元素。ReactNode 是最宽泛的类型，它可以是元素、字符串、数字、布尔值、null、undefined，或者是这些类型的数组。ReactElement 是 JSX.Element 的底层类型，它包含了组件类型、props 和 key 等信息。

在大多数情况下，让 TypeScript 自动推断返回值类型是最好的选择。但在某些高级场景下，你可能需要显式指定返回类型来实现更复杂的类型约束。例如，当你编写高阶组件时，可能需要精确控制返回组件的类型。

## 二、Props 类型设计

Props 是组件对外的接口，良好的 props 类型设计是组件易用性的关键。

### 2.1 基础 Props 类型

对于简单组件，直接定义 interface 即可。需要注意的是，对于可选属性，使用 ? 标记；对于必填属性，不要使用 ?。对于原始类型（string、number、boolean），直接标注即可；对于对象类型，最好也定义对应的接口。

在设计 props 时，应该遵循最小必要原则，只暴露组件真正需要的属性。避免使用 any 类型，这会失去 TypeScript 的类型保护。对于复杂的对象，使用嵌套接口来描述其结构，这样可以提高代码的可读性和可维护性。对于函数类型的 props（如事件处理函数），要明确标注参数类型和返回值类型。

### 2.2 PropsWithChildren 的使用

PropsWithChildren 是 React 提供的工具类型，它的定义非常简单：接收一个泛型参数 P，返回 P & { children?: ReactNode }。当你的组件需要渲染子元素时，可以使用这个类型来避免重复定义 children 属性。

需要注意的是，PropsWithChildren 中的 children 是可选的。如果你想强制要求组件必须有 children，可以不使用 PropsWithChildren，而是自己定义 children: ReactNode 作为必填属性。另外，children 的类型不一定总是 ReactNode，在某些高级模式下（如 render props），children 可能是一个函数。

### 2.3 条件 Props 与可辨识联合

在某些场景下，组件的 props 会根据某个属性的不同而变化。例如，一个按钮组件，当 variant 为 "link" 时需要 href 属性，而当 variant 为 "button" 时需要 onClick 属性。这时可以使用可辨识联合（Discriminated Unions）来实现类型安全的条件 props。

可辨识联合的关键是有一个公共的字段（如 kind 或 type）作为判别式，TypeScript 可以根据这个字段来缩小类型范围。这样，当你使用组件时，TypeScript 会根据判别式的值来检查其他属性是否存在和类型是否正确。这种模式在编写灵活的组件库时非常有用，可以提供极佳的开发体验。

### 2.4 默认 Props 的类型处理

在函数组件中，默认 props 通常使用默认参数值来实现。TypeScript 会自动将带有默认值的属性标记为可选。这种方式比旧的 defaultProps 属性更加类型安全，因为类型是直接从代码中推断出来的，不需要额外的类型注解。

使用 ES6 默认参数的另一个好处是，代码在运行时和编译时的行为一致，不会出现类型定义和实际实现不同步的问题。对于对象类型的默认 props，可以使用展开运算符合并默认值和传入的 props。

## 三、泛型组件

泛型组件是 React + TypeScript 中最强大的特性之一，它允许组件根据传入的 props 类型来推断其他相关类型。

### 3.1 泛型组件的定义

泛型组件的定义方式是在组件函数名后添加尖括号，里面是泛型参数列表。例如，一个 List 组件可以接收一个泛型 T，表示列表项的类型，然后 items 属性就是 T[]，renderItem 属性接收一个 T 类型的参数并返回 ReactNode。

泛型组件的好处是类型安全。当你使用这个组件时，TypeScript 会根据传入的 items 类型自动推断 renderItem 参数的类型，不需要手动指定。这大大减少了类型注解的工作量，同时提供了更好的类型推断。泛型组件在表格、列表、选择器等数据驱动的组件中非常常见。

### 3.2 泛型约束

在某些情况下，你需要对泛型参数进行约束。例如，一个列表组件可能要求每个列表项都有 id 属性，这时可以使用 extends 关键字来约束泛型参数：T extends { id: string }。这样，在组件内部你就可以安全地访问 item.id，而 TypeScript 也会确保传入的 items 满足这个约束。

泛型约束可以是复杂的类型，甚至可以是其他泛型类型。合理使用泛型约束可以让你的组件既灵活又类型安全。多个泛型参数之间也可以相互约束，例如 TValue extends TItem[keyof TItem]。

### 3.3 多泛型参数

组件可以有多个泛型参数。例如，一个 Select 组件可能有 TItem 和 TValue 两个泛型参数，分别表示选项类型和值类型。多个泛型参数之间可以相互约束，例如 TValue extends keyof TItem，表示值类型必须是选项类型的键名之一。

在使用多泛型参数的组件时，TypeScript 通常可以自动推断所有泛型参数的类型，不需要手动指定。但在某些情况下，如果类型推断失败，你可能需要显式指定部分或全部泛型参数。

## 四、多态组件与 as 属性

多态组件（Polymorphic Components）是一种高级模式，它允许组件根据 as 属性的值来改变渲染的元素类型，同时保留类型安全。

### 4.1 as 属性模式

as 属性是 styled-components 等库推广的一种模式，它允许你指定组件最终渲染成什么元素。例如，一个 Button 组件默认渲染 button 元素，但你可以通过 as="a" 让它渲染成 a 标签，并且 TypeScript 会自动推断出 a 标签应该接受的属性（如 href）。

实现多态组件需要一些高级的 TypeScript 技巧。核心思想是：组件接收一个泛型参数 C 表示渲染的元素类型，组件的 props 是 C 对应的元素属性加上组件自身的属性，同时 as 属性的类型是 C。

### 4.2 多态组件的类型实现

实现多态组件的关键在于使用 ComponentPropsWithoutRef 工具类型来获取某个元素或组件的 props 类型，然后通过交叉类型将自定义 props 合并进去。还需要处理 ref 的情况，这时候需要使用 ComponentPropsWithRef 或者 forwardRef。

在实际实现中，通常会定义一个 PolymorphicComponent 类型，它接收组件自身的 props 和默认渲染的元素类型，然后返回一个可以接收 as 属性的组件类型。Radix UI 等现代组件库大量使用了这种模式。

### 4.3 as 属性的常见问题

多态组件虽然强大，但也有一些陷阱。最常见的是类型推断问题，当 as 属性是一个组件而不是原生元素时，类型推断可能会失败。另外，ref 的处理也比较复杂，需要使用 forwardRef 并正确合并 ref 类型。在 TypeScript 4.7+ 中，instantiation expressions 可以帮助解决部分类型推断问题。

## 五、Render Props 模式

Render Props 是 React 中一种复用逻辑的模式，它通过一个值为函数的 prop 来共享代码。在 TypeScript 中，需要为这个函数 prop 提供正确的类型。

### 5.1 Render Props 的类型定义

Render prop 就是一个返回 ReactNode 的函数。关键是要正确标注这个函数的参数类型。例如，一个 Mouse 组件的 render prop 可能接收一个 { x: number; y: number } 类型的参数。使用 render props 时，TypeScript 会自动推断回调函数的参数类型，提供代码补全和类型检查。

### 5.2 children 作为 render prop

很多时候，render prop 会以 children 的形式传递，这时候 children 的类型不是 ReactNode，而是一个函数。需要注意区分这种情况，不要使用 PropsWithChildren，而是自己定义 children 的函数类型。这种模式在 React Context、表单库、状态管理库中非常常见。

## 六、其他组件类型

除了上述类型，还有一些特殊的组件类型需要了解。

### 6.1 ReactElement、ReactNode、JSX.Element 的区别总结

JSX.Element 是 ReactElement<unknown, string | JSXElementConstructor<any>> 的别名，它表示一个具体的 React 元素。ReactElement<T, P> 是更底层的类型，它有 type、props、key 等属性。ReactNode 是一个联合类型，包含了 ReactElement、string、number、boolean、null、undefined、ReactFragment、ReactPortal 等所有可以在 React 中渲染的类型。

简单来说：函数组件返回 JSX.Element；可以渲染的内容是 ReactNode；createElement 返回 ReactElement。理解这三者的区别对于正确标注组件类型和 children 类型至关重要。

### 6.2 高阶组件类型

高阶组件（HOC）是接收一个组件并返回一个新组件的函数。HOC 的类型比较复杂，需要正确推断被包裹组件的 props 类型，并在返回的组件中正确处理 props 的合并和透传。使用泛型和工具类型（如 ComponentProps、Omit 等）可以帮助你写出类型安全的 HOC。

### 6.3 forwardRef 的类型

当组件需要暴露 ref 给父组件时，需要使用 forwardRef。forwardRef 的类型需要指定 ref 的类型和 props 的类型，这样 TypeScript 才能正确推断 ref 上的方法和属性。在 React 19 中，ref 已经成为普通 prop，不再需要 forwardRef，但在 React 18 及之前版本中仍然需要。

掌握这些组件类型技巧，你就能写出类型安全、灵活可复用的 React 组件库，大大提高代码质量和开发效率。在实际项目中，根据组件的复杂度选择合适的类型方案，不要过度设计，也不要忽视类型安全。
`,
    code: `"use strict";
// React 组件类型全解 - 运行时演示
// 注意：本演示使用工厂函数模拟 React 元素创建，注释说明对应 TypeScript 类型

// ==========================================
// 模拟 React 基础
// ==========================================

// 模拟 React.createElement - 返回一个虚拟 DOM 对象
// TypeScript 类型: function createElement<P>(type: string | Function, props?: P | null, ...children: ReactNode[]): ReactElement<P>
function createElement(type, props, ...children) {
  return {
    type,
    props: { ...(props || {}), children: children.length === 1 ? children[0] : children },
    key: null,
  };
}

const h = createElement;

// 运行时 Props 校验工具（演示 TypeScript 类型检查的概念）
function validateProps(componentName, props, required, types) {
  const errors = [];
  for (const key of required) {
    if (props[key] === undefined) {
      errors.push('Missing required prop: ' + key);
    }
  }
  for (const [key, expectedType] of Object.entries(types)) {
    if (props[key] !== undefined && typeof props[key] !== expectedType) {
      errors.push('Prop ' + key + ' expected type ' + expectedType + ', got ' + typeof props[key]);
    }
  }
  if (errors.length > 0) {
    console.error('[' + componentName + '] Props validation errors:', errors);
    return false;
  }
  return true;
}

console.log('=== 1. 基础函数组件 ===');

// 1.1 普通函数组件（TypeScript 中: function Greeting(props: GreetingProps): JSX.Element）
// interface GreetingProps { name: string; age?: number }
function Greeting(props) {
  validateProps('Greeting', props, ['name'], { name: 'string' });
  return h('div', { className: 'greeting' },
    h('span', null, 'Hello, '),
    h('span', null, props.name),
    props.age != null ? h('span', null, ' (age: ' + props.age + ')') : null
  );
}

const greeting1 = Greeting({ name: 'Alice' });
const greeting2 = Greeting({ name: 'Bob', age: 25 });
console.log('Greeting({ name: "Alice" }):', JSON.stringify(greeting1, null, 2));
console.log('Greeting({ name: "Bob", age: 25 }):', JSON.stringify(greeting2, null, 2));

// 1.2 带 children 的组件（TypeScript 中使用 PropsWithChildren<CardProps>）
// PropsWithChildren<P> = P & { children?: ReactNode }
function Card(props) {
  validateProps('Card', props, ['title'], { title: 'string' });
  return h('div', { className: 'card card-' + (props.variant || 'elevated') },
    h('p', null, props.title),
    h('div', { className: 'card-content' }, props.children)
  );
}

const card = Card({
  title: 'Welcome',
  variant: 'outlined',
  children: h('p', null, 'This is card content')
});
console.log('\\nCard with children:', JSON.stringify(card, null, 2));

// 1.3 返回多种类型的组件（ReactNode 包括 null | string | number | element 等）
function MaybeGreeting(props) {
  if (!props.show) return null; // null 是有效的 ReactNode
  return Greeting({ name: props.name });
}

console.log('\\nMaybeGreeting({ show: false }):', MaybeGreeting({ show: false, name: 'Test' }));
console.log('MaybeGreeting({ show: true }):', JSON.stringify(MaybeGreeting({ show: true, name: 'Test' }), null, 2));

// ==========================================
// 2. 可辨识联合 Props（Discriminated Unions）
// ==========================================

console.log('\\n=== 2. 可辨识联合 Props ===');
// TypeScript 类型:
// type ButtonProps =
//   | { variant: 'primary' | 'secondary'; onClick: () => void; children: ReactNode }
//   | { variant: 'link'; href: string; children: ReactNode }
//   | { variant: 'icon'; icon: string; 'aria-label': string; onClick: () => void }

function createButton(props) {
  switch (props.variant) {
    case 'primary':
    case 'secondary':
      if (typeof props.onClick !== 'function') {
        throw new Error('Button variant "' + props.variant + '" requires onClick prop');
      }
      return h('button', {
        className: 'btn btn-' + props.variant,
        onClick: props.onClick,
      }, props.children);
    case 'link':
      if (typeof props.href !== 'string') {
        throw new Error('Button variant "link" requires href prop');
      }
      return h('a', {
        href: props.href,
        className: 'btn btn-link',
      }, props.children);
    case 'icon':
      if (typeof props.onClick !== 'function') {
        throw new Error('Button variant "icon" requires onClick prop');
      }
      return h('button', {
        className: 'btn btn-icon',
        onClick: props.onClick,
        'aria-label': props['aria-label'],
      }, props.icon);
    default:
      throw new Error('Unknown button variant: ' + props.variant);
  }
}

// 正确用法
const primaryBtn = createButton({
  variant: 'primary',
  onClick: function() { console.log('Primary clicked!'); },
  children: 'Submit'
});
console.log('Primary button:', JSON.stringify(primaryBtn, null, 2));

const linkBtn = createButton({
  variant: 'link',
  href: 'https://example.com',
  children: 'Visit Site'
});
console.log('\\nLink button:', JSON.stringify(linkBtn, null, 2));

const iconBtn = createButton({
  variant: 'icon',
  icon: '🔍',
  'aria-label': 'Search',
  onClick: function() { console.log('Search clicked!'); }
});
console.log('\\nIcon button:', JSON.stringify(iconBtn, null, 2));

// 演示运行时类型检查（对应 TypeScript 编译时检查）
console.log('\\n运行时类型检查演示:');
try {
  createButton({ variant: 'link', onClick: function() {}, children: 'oops' });
} catch(e) {
  console.log('❌ 错误（TypeScript 编译时也会报错）:', e.message);
}

// ==========================================
// 3. 泛型组件（Generic Components）
// ==========================================

console.log('\\n=== 3. 泛型组件 ===');

// 3.1 基础泛型列表组件
// TypeScript: function List<T>(props: { items: T[]; renderItem: (item: T, index: number) => ReactNode; keyExtractor?: (item: T) => string }): ReactElement
function List(props) {
  var items = props.items, renderItem = props.renderItem, keyExtractor = props.keyExtractor;
  return h('ul', { className: 'list' },
    items.map(function(item, index) {
      var key = keyExtractor ? keyExtractor(item, index) : String(index);
      return h('li', { key: 'item-' + key }, renderItem(item, index));
    })
  );
}

var users = [
  { id: 1, name: 'Alice', email: 'a***@example.com' },
  { id: 2, name: 'Bob', email: 'b***@example.com' },
];

// TypeScript 自动推断 item 类型为 User（通过 items 类型推断）
var userList = List({
  items: users,
  renderItem: function(user) {
    return h('span', null, user.name + ' <' + user.email + '>');
  },
  keyExtractor: function(user) { return String(user.id); },
});
console.log('User List (泛型组件):', JSON.stringify(userList, null, 2));

// 3.2 带约束的泛型组件
// TypeScript: function DataList<T extends { id: string | number }>(props: { data: T[]; renderItem: (item: T) => ReactNode }): ReactElement
function DataList(props) {
  // 运行时检查约束：T must have id
  for (var i = 0; i < props.data.length; i++) {
    if (props.data[i].id === undefined) {
      throw new Error('DataList: all items must have an "id" property');
    }
  }
  return h('ul', { className: 'data-list' },
    props.data.map(function(item) {
      return h('li', { key: String(item.id) }, props.renderItem(item));
    })
  );
}

var products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 29 },
];

var productList = DataList({
  data: products,
  renderItem: function(p) {
    return h('span', null, p.name + ': $' + p.price);
  },
});
console.log('\\nProduct List (约束泛型, T extends { id: string|number }):', JSON.stringify(productList, null, 2));

// ==========================================
// 4. 多态组件 (Polymorphic Components / as prop)
// ==========================================

console.log('\\n=== 4. 多态组件 (as prop) ===');

// TypeScript 类型（简化版）:
// type PolymorphicProps<C extends ElementType, P> = P & { as?: C } & ComponentProps<C>
function Text(props) {
  var as = props.as, size = props.size, color = props.color, children = props.children;
  var restProps = {};
  // 复制非组件自有属性
  for (var key in props) {
    if (key !== 'as' && key !== 'size' && key !== 'color' && key !== 'children') {
      restProps[key] = props[key];
    }
  }
  var Component = as || 'span';
  var className = 'text text-' + (size || 'md') + ' text-' + (color || 'primary');
  return createElement(Component, Object.assign({ className: className }, restProps), children);
}

// 默认渲染 span
var textSpan = Text({ children: 'Hello Span' });
console.log('Text default (span):', JSON.stringify(textSpan, null, 2));

// 渲染为 p 标签
var textP = Text({ as: 'p', size: 'lg', children: 'Hello Paragraph' });
console.log('\\nText as p:', JSON.stringify(textP, null, 2));

// 渲染为 a 标签，支持 href 属性
var textLink = Text({ as: 'a', href: 'https://example.com', color: 'secondary', children: 'Link Text' });
console.log('\\nText as link (支持 href):', JSON.stringify(textLink, null, 2));

// 渲染为 button，支持 onClick
var textButton = Text({ as: 'button', onClick: function() { console.log('clicked'); }, children: 'Click Me' });
console.log('\\nText as button (支持 onClick):', JSON.stringify(textButton, null, 2));

// ==========================================
// 5. Render Props 模式
// ==========================================

console.log('\\n=== 5. Render Props 模式 ===');

// Mouse 组件 - render prop 模式
// TypeScript: interface MouseProps { render: (state: { x: number; y: number }) => ReactNode }
function Mouse(props) {
  if (typeof props.render !== 'function') {
    throw new Error('Mouse requires a "render" function prop');
  }
  var mockMouseState = { x: 100, y: 200 };
  return h('div', { className: 'mouse-tracker' }, props.render(mockMouseState));
}

var mouseTracker = Mouse({
  render: function(state) {
    return h('p', null, 'Mouse position: (' + state.x + ', ' + state.y + ')');
  }
});
console.log('Mouse with render prop:', JSON.stringify(mouseTracker, null, 2));

// children 作为 render prop
// TypeScript: interface ToggleProps { children: (state: { on: boolean; toggle: () => void }) => ReactNode }
function Toggle(props) {
  if (typeof props.children !== 'function') {
    throw new Error('Toggle expects children to be a function (render prop pattern)');
  }
  var state = {
    on: false,
    toggle: function() { console.log('  toggle called, new state: ' + !state.on); state.on = !state.on; }
  };
  return h('div', { className: 'toggle' }, props.children(state));
}

var toggleComp = Toggle({
  children: function(_ref) {
    var on = _ref.on, toggle = _ref.toggle;
    return h('button', { onClick: toggle }, on ? 'ON' : 'OFF');
  }
});
console.log('\\nToggle (children as render prop):', JSON.stringify(toggleComp, null, 2));

// ==========================================
// 6. 工具函数演示
// ==========================================

console.log('\\n=== 6. 组件工具函数 ===');

// withDefaultProps - 类似 withDefaultProps HOC
// TypeScript: function withDefaultProps<P, D extends Partial<P>>(Component: Function, defaultProps: D): (props: P) => ReactElement
function withDefaultProps(Component, defaultProps) {
  return function(props) {
    return Component(Object.assign({}, defaultProps, props));
  };
}

function ButtonBase(props) {
  validateProps('ButtonBase', props, ['variant', 'size', 'children'], { variant: 'string', size: 'string' });
  return h('button', { className: 'btn-' + props.variant + ' btn-' + props.size }, props.children);
}

var DefaultButton = withDefaultProps(ButtonBase, { variant: 'primary', size: 'md' });

var btn1 = DefaultButton({ children: 'Default' });
var btn2 = DefaultButton({ variant: 'danger', size: 'sm', children: 'Danger' });
console.log('Default button:', JSON.stringify(btn1, null, 2));
console.log('Customized button:', JSON.stringify(btn2, null, 2));

console.log('\\n✅ React 组件类型演示完成！');
console.log('\\n本章总结:');
console.log('- 推荐使用普通函数 + Props 接口定义组件，而非 FC');
console.log('- PropsWithChildren 用于需要 children 的组件');
console.log('- 可辨识联合实现条件 Props 的类型安全');
console.log('- 泛型组件提供最大灵活性和类型推断');
console.log('- as prop 模式实现多态组件');
console.log('- Render Props 需要正确标注函数参数类型');
`
  },
  {
    id: "ts3-react-hooks-types",
    title: "React Hooks 类型精解",
    icon: "🪝",
    group: "React 与 TypeScript",
    content: `# React Hooks 类型精解

Hooks 是 React 函数组件的核心，掌握 Hooks 的类型定义对于编写类型安全的 React 应用至关重要。本章将详细讲解每个内置 Hook 的类型使用方法，以及如何创建类型安全的自定义 Hook。

## 一、useState 类型详解

useState 是最常用的 Hook，它的类型推断在大多数情况下是自动的，但在某些场景下需要手动指定泛型参数。

### 1.1 自动类型推断

当初始值不是 null 或 undefined 时，TypeScript 通常可以自动推断出 state 的类型。例如，useState(0) 会推断为 number 类型，useState('hello') 会推断为 string 类型，useState(false) 会推断为 boolean 类型。这种情况下不需要手动指定泛型参数，代码更加简洁，类型推断也完全准确。

但是，当初始值是 null 或 undefined 时，TypeScript 会将类型推断为 null 或 undefined，而不是你期望的其他类型。这时候就需要手动指定泛型参数。例如 useState<User | null>(null) 明确告诉 TypeScript 这个 state 可以是 User 类型或者 null。

### 1.2 手动指定泛型参数

当初始值可能为 null，或者 state 是联合类型时，需要显式指定 useState 的泛型参数。例如，useState<User | null>(null) 表示 state 可以是 User 类型或者 null。对于异步加载的数据，这种模式非常常见——初始状态为 null，加载完成后设置为具体数据。

对于对象类型的 state，直接定义接口后作为泛型参数传入即可。TypeScript 会确保 setState 时传入的对象符合该接口的结构。如果你想部分更新对象，需要使用展开运算符（...prev）来保留未修改的属性。

### 1.3 函数式更新的类型

当使用函数式更新时（setState(prev => newValue)），TypeScript 会自动推断 prev 的类型，与 state 的类型一致。返回值也必须与 state 类型匹配。如果你的 state 是联合类型，在更新函数中可能需要进行类型收窄。函数式更新在新状态依赖旧状态时非常重要（如计数器、toggle 等），它确保你总是基于最新的状态计算新值。

### 1.4 延迟初始化

useState 支持传入一个初始化函数，这个函数只在首次渲染时调用。初始化函数的返回值类型必须与 state 类型一致，TypeScript 会自动检查这一点。延迟初始化对于计算成本高的初始值很有用，可以避免每次渲染都重新计算。

## 二、useReducer 类型精解

useReducer 是另一种状态管理方式，它比 useState 更适合复杂的状态逻辑。结合 TypeScript 的可辨识联合，useReducer 可以实现极高的类型安全性。

### 2.1 定义 Action 类型

useReducer 类型安全的关键是定义正确的 Action 类型。最佳实践是使用可辨识联合，每个 action type 对应一个接口，接口中包含该 action 需要的 payload。这样，在 reducer 函数中，TypeScript 可以根据 action.type 自动缩小类型范围，确保你访问正确的 payload 属性。

例如，你可以定义 type Action = { type: 'increment' } | { type: 'set'; payload: number }，然后在 reducer 中 switch(action.type) 时，TypeScript 会自动知道在 'set' case 中 action.payload 存在且是 number 类型。

### 2.2 定义 State 类型

State 类型的定义方式与 useState 类似，使用接口描述状态的形状。对于复杂状态，建议将不同状态切片分组到嵌套接口中，保持代码清晰。State 类型应该完整描述所有可能的状态，包括加载中、错误等中间状态。

### 2.3 Reducer 函数类型

Reducer 函数接收当前 state 和 action，返回新的 state。TypeScript 会自动推断 reducer 的类型，但你也可以显式标注为 Reducer<State, Action> 类型，这来自 React 的类型定义。

使用可辨识联合的 Action 类型后，在 reducer 的 switch 语句中，TypeScript 能够进行穷尽检查（exhaustive checking）。如果你忘记处理某个 action type，TypeScript 会在编译时报错。可以使用 never 类型来实现这一点：在 default case 中将 action 赋值给一个 never 类型的变量，如果有未处理的 action，TypeScript 会报类型错误。

### 2.4 useReducer 的初始化

useReducer 接受三个参数：reducer、初始状态、初始化函数。初始化函数接收初始参数（useReducer 的第三个参数会作为第二个参数传给初始化函数），返回初始状态。这种惰性初始化的模式对于计算量大的初始状态很有用，也可以用于从 props 计算初始状态。

## 三、useRef 类型详解

useRef 有两种主要用途：持有 DOM 元素引用，以及持有可变值（类似于类组件的实例属性）。这两种用途的类型处理方式不同。

### 3.1 DOM 元素引用

当使用 useRef 获取 DOM 元素时，需要将 ref 传递给元素的 ref 属性。ref 的初始值应该是 null，泛型参数是对应的元素类型，例如 HTMLInputElement、HTMLDivElement、HTMLButtonElement 等。

需要注意的是，ref.current 在组件挂载之前是 null，所以在访问 ref.current 时需要进行 null 检查，或者使用可选链操作符（?.）。TypeScript 会强制你进行这些检查，避免空指针错误。如果你确定 ref 在访问时一定存在，可以使用非空断言（!），但不推荐这样做，因为它绕过了类型检查。

### 3.2 可变值引用

当 useRef 用来存储可变值（不需要触发重渲染的值）时，类型处理更加灵活。你可以提供初始值，TypeScript 会自动推断类型。与 DOM ref 不同的是，这种情况下 ref.current 是可变的，不需要是 null。

使用 useRef 存储可变值时，修改 ref.current 不会触发组件重渲染，这是它与 state 的核心区别。常见用例包括存储定时器 ID（setInterval/setTimeout 的返回值）、上一次的 props/state 值、第三方库实例等。

### 3.3 useImperativeHandle 配合 forwardRef

当你需要通过 ref 暴露组件方法给父组件时，需要结合使用 forwardRef 和 useImperativeHandle。这种情况下，需要定义一个 ref 类型（通常是一个包含方法的接口），然后在 forwardRef 的泛型参数中指定它。useImperativeHandle 允许你自定义暴露给父组件的 ref 值，而不是直接暴露 DOM 元素。

## 四、useEffect 和 useLayoutEffect

useEffect 本身的类型标注比较简单，因为它不返回值（除了清理函数），但它的依赖数组需要注意类型问题。

### 4.1 回调函数类型

useEffect 的回调函数可以返回 undefined 或者一个清理函数。清理函数没有参数，也没有返回值。TypeScript 会自动检查这一点，如果你返回了其他类型的值（例如字符串、数字），TypeScript 会报错。如果你的 effect 不需要清理函数，直接不返回任何值即可。

### 4.2 依赖数组类型

依赖数组是一个只读数组，包含 effect 依赖的所有值。TypeScript 本身不会检查依赖数组的正确性（这是 eslint-plugin-react-hooks 的工作），但 TypeScript 会确保依赖数组中的值类型与回调函数中使用的一致。如果你的 effect 使用了一个未在依赖数组中列出的值，eslint 会警告你，但 TypeScript 本身不会。

### 4.3 useLayoutEffect

useLayoutEffect 与 useEffect 的类型签名完全相同，区别只在于执行时机（DOM 更新后、浏览器绘制前）。类型处理方式一致。useLayoutEffect 在需要同步读取或修改 DOM 的场景下使用。

## 五、useMemo 和 useCallback

useMemo 和 useCallback 都用于性能优化，它们的类型处理也很相似。

### 5.1 useMemo 类型

useMemo 接收一个工厂函数和依赖数组，返回工厂函数返回的值。TypeScript 通常可以自动推断返回值类型，但在某些复杂场景下（例如返回值是联合类型），你可能需要显式指定泛型参数。

显式指定泛型参数的格式是 useMemo<ValueType>(factory, deps)，其中 ValueType 是你希望返回的值类型。这在工厂函数的返回类型可能被错误推断时很有用，例如当你希望返回一个更宽泛的类型而不是 TypeScript 推断出的字面量类型时。

### 5.2 useCallback 类型

useCallback 接收一个回调函数和依赖数组，返回该回调函数的 memoized 版本。TypeScript 会自动推断函数类型，但如果你想显式指定函数类型，可以使用 useCallback<FunctionType>(callback, deps)。

对于事件处理函数，通常建议显式标注函数参数类型，而不是依赖 useCallback 的类型推断。例如，onChange 事件的参数应该是 React.ChangeEvent<HTMLInputElement> 类型，onClick 事件的参数是 React.MouseEvent<HTMLButtonElement> 类型。这样可以获得更好的类型检查和代码补全。

## 六、useContext 类型安全

useContext 让我们可以消费 Context 提供的值，类型安全的关键是创建 Context 时提供正确的类型。

### 6.1 创建类型安全的 Context

创建 Context 时，泛型参数指定了 Context 值的类型。createContext 需要一个默认值，这个默认值在没有 Provider 时会被使用。

一个常见问题是：当 Context 值在 Provider 中才初始化时，初始值应该是什么？有两种方案：
1. 将初始值设为 undefined，并在 Context 类型中包含 undefined，然后在消费时进行检查
2. 创建一个自定义 Hook，在内部检查 Context 是否存在，如果不存在则抛出错误

第二种方案更加类型安全，因为它确保在使用 Context 时一定有 Provider 包裹，消费端不需要每次都进行 null/undefined 检查。

### 6.2 消费 Context

useContext 的返回值类型与创建 Context 时指定的泛型参数一致。如果 Context 的类型包含 undefined，你需要在使用时进行检查或使用非空断言（但不推荐非空断言，最好是创建自定义 Hook 来保证类型安全）。

## 七、自定义 Hook 类型设计

自定义 Hook 是复用逻辑的主要方式，类型良好的自定义 Hook 可以提供极佳的开发体验。

### 7.1 自定义 Hook 的返回类型

自定义 Hook 的返回类型有三种常见形式：
1. 返回单个值：直接返回该值的类型（如 useToggle 返回 boolean）
2. 返回元组（类似 useState）：返回一个固定长度的元组，每个位置有明确类型（如 [boolean, () => void]）
3. 返回对象：返回一个包含多个值/方法的对象

对于返回对象的情况，通常建议使用 as const 来确保 TypeScript 推断出最精确的类型，避免将字面量类型扩大为通用类型。as const 会将所有属性标记为 readonly，并保留字面量类型。

### 7.2 泛型自定义 Hook

自定义 Hook 可以使用泛型，使其更加灵活。例如，useLocalStorage Hook 可以接收一个泛型参数来指定存储值的类型。泛型参数可以有默认类型，也可以有约束。泛型自定义 Hook 是构建可复用逻辑库的基础。

### 7.3 自定义 Hook 的类型守卫

在某些场景下，自定义 Hook 返回的值可能需要类型守卫。例如，一个返回数据或加载状态或错误的 Hook，可以使用可辨识联合来让调用方能够根据状态字段进行类型收窄。例如 { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error }，这样调用方可以通过检查 status 字段来获取类型安全的 data 或 error。

## 八、其他 Hooks 类型

### 8.1 useTransition 和 useDeferredValue

React 18 引入的并发特性相关 Hooks。useTransition 返回 [isPending, startTransition] 元组，类型为 [boolean, (callback: () => void) => void]。useDeferredValue 接收一个值，返回该值的延迟版本，类型与输入值相同。

### 8.2 useId

useId 用于生成唯一 ID，返回值是 string 类型，类型简单。常用于服务端渲染场景，确保客户端和服务端生成的 ID 一致。

## 九、Hook 类型最佳实践总结

1. 优先依赖类型推断，仅在必要时手动指定泛型参数
2. useReducer 一定要使用可辨识联合定义 Action 类型，利用穷尽检查
3. DOM ref 使用具体的元素类型（HTMLInputElement 等），并处理 null 情况
4. Context 配合自定义 Hook，确保消费时类型安全
5. 自定义 Hook 返回对象时使用 as const，或显式定义返回类型
6. 事件处理函数显式标注事件类型（React.ChangeEvent、React.MouseEvent 等）
7. 避免在 Hook 中使用 any，必要时使用 unknown 并进行类型收窄
8. 善用 discriminated union 来表示加载/成功/错误等异步状态

掌握这些 Hook 类型技巧，你将能够写出完全类型安全的 React 组件和自定义 Hook，在编译时捕获大多数错误，显著提升代码质量。
`,
    code: `"use strict";
// React Hooks 类型精解 - 运行时演示
// 使用简单的状态存储模拟 Hooks 行为

// ==========================================
// Hooks 存储系统（模拟 React Fiber 中的 hooks 链表）
// ==========================================

var hookStates = [];
var hookIndex = 0;

function resetHooks() {
  hookStates.length = 0;
  hookIndex = 0;
}

function getNextHookIndex() {
  return hookIndex++;
}

// ==========================================
// 1. useState
// ==========================================

// TypeScript: function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
function useState(initialState) {
  var index = getNextHookIndex();
  if (hookStates.length === index) {
    var initial = typeof initialState === 'function' ? initialState() : initialState;
    hookStates.push(initial);
  }

  var state = hookStates[index];

  function setState(action) {
    var current = hookStates[index];
    var next = typeof action === 'function' ? action(current) : action;
    hookStates[index] = next;
    console.log('  [useState] State updated at index ' + index + ':', next);
  }

  return [state, setState];
}

console.log('=== 1. useState 类型演示 ===');

// 1.1 自动类型推断 - useState(0) 推断为 number
var counterState = useState(0);
var count = counterState[0], setCount = counterState[1];
console.log('初始 count (自动推断 number):', count);
setCount(5);
setCount(function(prev) { return prev + 1; });

// 1.2 手动指定泛型 - useState<User | null>(null)
resetHooks();
var userState = useState(null);
var user = userState[0], setUser = userState[1];
console.log('\\n初始 user (User | null):', user);
setUser({ id: 1, name: 'Alice' });
setUser(null);

// 1.3 对象类型 state
resetHooks();
var formState = useState({ username: '', email: '' });
var form = formState[0], setForm = formState[1];
console.log('\\n初始 form:', form);
setForm(function(prev) { return Object.assign({}, prev, { username: 'bob' }); });

// 1.4 延迟初始化
resetHooks();
var lazyState = useState(function() {
  console.log('  [useState] 延迟初始化函数执行（仅首次）');
  return { items: [1, 2, 3] };
});
var expensiveData = lazyState[0];
console.log('延迟初始化结果:', expensiveData);

// ==========================================
// 2. useReducer
// ==========================================

// TypeScript: function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S, init?: (arg: S) => S): [S, Dispatch<A>]
function useReducer(reducer, initialState, init) {
  var index = getNextHookIndex();
  if (hookStates.length === index) {
    hookStates.push(init ? init(initialState) : initialState);
  }

  var state = hookStates[index];

  function dispatch(action) {
    var current = hookStates[index];
    var next = reducer(current, action);
    hookStates[index] = next;
    console.log('  [useReducer] Action:', action.type);
    console.log('  [useReducer] New state:', next);
  }

  return [state, dispatch];
}

console.log('\\n=== 2. useReducer 类型演示（可辨识联合 Action）===');
resetHooks();

// 2.1 Counter Reducer
// TypeScript: type CounterAction = { type: 'increment' } | { type: 'decrement' } | { type: 'set'; payload: number } | { type: 'reset' }
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, history: state.history.concat([state.count + 1]) };
    case 'decrement':
      return { count: state.count - 1, history: state.history.concat([state.count - 1]) };
    case 'set':
      return { count: action.payload, history: state.history.concat([action.payload]) };
    case 'reset':
      return { count: action.payload != null ? action.payload : 0, history: [] };
    default:
      // TypeScript 穷尽检查: const _exhaustive: never = action;
      throw new Error('Unknown action type: ' + action.type);
  }
}

var counterResult = useReducer(counterReducer, { count: 0, history: [0] });
var counter = counterResult[0], counterDispatch = counterResult[1];
console.log('初始 counter:', counter);
counterDispatch({ type: 'increment' });
counterDispatch({ type: 'increment' });
counterDispatch({ type: 'set', payload: 10 });
counterDispatch({ type: 'decrement' });
counterDispatch({ type: 'reset' });

// 2.2 Todo Reducer（更复杂的可辨识联合）
resetHooks();

function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        todos: state.todos.concat([{ id: state.nextId, text: action.text, completed: false }]),
        nextId: state.nextId + 1,
      };
    case 'toggle':
      return {
        nextId: state.nextId,
        todos: state.todos.map(function(t) {
          return t.id === action.id ? Object.assign({}, t, { completed: !t.completed }) : t;
        }),
      };
    case 'delete':
      return {
        nextId: state.nextId,
        todos: state.todos.filter(function(t) { return t.id !== action.id; }),
      };
    case 'edit':
      return {
        nextId: state.nextId,
        todos: state.todos.map(function(t) {
          return t.id === action.id ? Object.assign({}, t, { text: action.text }) : t;
        }),
      };
    default:
      throw new Error('Unknown action type: ' + action.type);
  }
}

var todoResult = useReducer(todoReducer, { todos: [], nextId: 1 });
var todoState = todoResult[0], todoDispatch = todoResult[1];
console.log('\\nTodo Reducer 演示:');
todoDispatch({ type: 'add', text: 'Learn TypeScript' });
todoDispatch({ type: 'add', text: 'Build React App' });
todoDispatch({ type: 'toggle', id: 1 });
todoDispatch({ type: 'edit', id: 2, text: 'Build Awesome React App' });
todoDispatch({ type: 'delete', id: 1 });
console.log('最终 todo state:', hookStates[0]);

// ==========================================
// 3. useRef
// ==========================================

// TypeScript: function useRef<T>(initialValue: T): MutableRefObject<T>
// function useRef<T>(initialValue: T | null): RefObject<T>
function useRef(initialValue) {
  var index = getNextHookIndex();
  if (hookStates.length === index) {
    hookStates.push({ current: initialValue });
  }
  return hookStates[index];
}

console.log('\\n=== 3. useRef 类型演示 ===');
resetHooks();

// 3.1 DOM 元素引用 - useRef<HTMLInputElement | null>(null)
var inputRef = useRef(null);
console.log('初始 inputRef.current (DOM ref):', inputRef.current);
// 模拟 DOM 挂载后
inputRef.current = {
  tagName: 'INPUT',
  value: 'hello',
  focus: function() { console.log('  [DOM] input focused'); },
  blur: function() { console.log('  [DOM] input blurred'); },
};
console.log('挂载后 inputRef.current:', inputRef.current);
if (inputRef.current) { // 类型检查：必须先检查 null
  inputRef.current.focus();
}
inputRef.current = null;

// 3.2 可变值引用 - 存储定时器ID、上一个值等
resetHooks();
var intervalRef = useRef(null);
console.log('\\nintervalRef (用于存储定时器ID):', intervalRef.current);
// 模拟 setInterval
intervalRef.current = { _type: 'interval', _id: 123 };
console.log('设置后 intervalRef.current:', intervalRef.current);

// 存储上一个值
resetHooks();
var prevCountRef = useRef(0);
console.log('\\nprevCountRef (存储上一个值):', prevCountRef.current);
prevCountRef.current = 5;
console.log('更新后 prevCountRef:', prevCountRef.current);

// ==========================================
// 4. useEffect
// ==========================================

// TypeScript: function useEffect(effect: () => void | (() => void), deps?: DependencyList): void
function useEffect(effect, deps) {
  var index = getNextHookIndex();
  var prevDeps = hookStates[index];
  var changed = !prevDeps || !deps || deps.some(function(dep, i) { return dep !== prevDeps[i]; });

  if (changed) {
    console.log('  [useEffect] Effect ' + index + ' 执行（依赖变化或首次）');
    var cleanup = effect();
    hookStates[index] = deps;
    if (typeof cleanup === 'function') {
      console.log('  [useEffect] Effect ' + index + ' 返回了清理函数');
    }
  } else {
    console.log('  [useEffect] Effect ' + index + ' 依赖未变化，跳过');
  }
}

console.log('\\n=== 4. useEffect 类型演示 ===');
resetHooks();

var dep1 = { id: 1 };
console.log('首次渲染:');
useEffect(function() {
  console.log('  订阅数据...');
  return function() { console.log('  清理：取消订阅...'); };
}, [dep1]);

// 模拟重新渲染，依赖未变
hookIndex = 0;
console.log('\\n重新渲染（依赖未变化）:');
useEffect(function() {
  console.log('  订阅数据...');
  return function() { console.log('  清理：取消订阅...'); };
}, [dep1]);

// 模拟依赖变化
hookIndex = 0;
var dep2 = { id: 2 };
console.log('\\n重新渲染（依赖变化）:');
useEffect(function() {
  console.log('  订阅新数据...');
  return function() { console.log('  清理：取消旧订阅...'); };
}, [dep2]);

// ==========================================
// 5. useMemo / useCallback
// ==========================================

// TypeScript: function useMemo<T>(factory: () => T, deps: DependencyList): T
function useMemo(factory, deps) {
  var index = getNextHookIndex();
  var prev = hookStates[index];
  var changed = !prev || deps.some(function(dep, i) { return dep !== prev.deps[i]; });

  if (changed) {
    console.log('  [useMemo] Memo ' + index + ' 重新计算');
    var value = factory();
    hookStates[index] = { deps: deps, value: value };
    return value;
  }
  console.log('  [useMemo] Memo ' + index + ' 使用缓存值');
  return prev.value;
}

// TypeScript: function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T
function useCallback(callback, deps) {
  return useMemo(function() { return callback; }, deps);
}

console.log('\\n=== 5. useMemo / useCallback 类型演示 ===');
resetHooks();

var memoResult = useMemo(function() {
  console.log('  执行昂贵计算...');
  var arr = [];
  for (var i = 0; i < 5; i++) arr.push(i * 2);
  return arr;
}, []);
console.log('  useMemo 结果:', memoResult);

// 缓存命中
hookIndex = 0;
var memoResult2 = useMemo(function() {
  console.log('  执行昂贵计算...');
  var arr = [];
  for (var i = 0; i < 5; i++) arr.push(i * 2);
  return arr;
}, []);
console.log('  useMemo 缓存结果:', memoResult2);

// useCallback
resetHooks();
var handleClick = useCallback(function(e) {
  // TypeScript: e 应为 React.MouseEvent<HTMLButtonElement>
  console.log('  点击事件处理 - clientX:', e.clientX, 'clientY:', e.clientY);
}, []);
console.log('\\nuseCallback 创建的 handleClick 已缓存');
handleClick({ clientX: 100, clientY: 200 });

// ==========================================
// 6. useContext（类型安全）
// ==========================================

console.log('\\n=== 6. useContext 类型安全演示 ===');
resetHooks();

// 当前 Context 值模拟
var contextStack = [null]; // 栈式存储，模拟 Provider 嵌套

// TypeScript: function createContext<T>(defaultValue: T): Context<T>
function createContext(defaultValue) {
  return {
    _defaultValue: defaultValue,
    _currentValue: defaultValue,
    Provider: function(value, children) {
      // 模拟 Provider 入栈
      contextStack.push(value);
      return { type: 'ContextProvider', props: { value: value }, children: children };
    }
  };
}

// TypeScript: function useContext<T>(context: Context<T>): T
function useContext(context) {
  // 找最近的 Provider 值
  for (var i = contextStack.length - 1; i >= 0; i--) {
    if (contextStack[i] !== null && contextStack[i]._contextId === context._id) {
      return contextStack[i].value;
    }
  }
  return context._defaultValue;
}

// 分配 context ID
var contextIdCounter = 0;
function makeContext(defaultValue) {
  var ctx = createContext(defaultValue);
  ctx._id = ++contextIdCounter;
  return ctx;
}

// 6.1 Theme Context
var ThemeContext = makeContext({
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  mode: 'light',
});

console.log('无 Provider 时使用默认值:', useContext(ThemeContext));

// 模拟 Provider
contextStack.push({ _contextId: ThemeContext._id, value: {
  primaryColor: '#ff0000',
  secondaryColor: '#00ff00',
  mode: 'dark',
}});
console.log('Provider 内的主题:', useContext(ThemeContext));
contextStack.pop();

// 6.2 类型安全的 Context Hook（强制要求 Provider）
function createSafeContext() {
  var context = makeContext(null);
  function useSafeContext() {
    var value = useContext(context);
    if (value === null) {
      throw new Error('useSafeContext must be used within its Provider');
    }
    return value;
  }
  return { context: context, useSafeContext: useSafeContext };
}

var authContext = createSafeContext();
var AuthContext = authContext.context, useAuth = authContext.useSafeContext;

try {
  useAuth();
} catch(e) {
  console.log('\\n未包裹 Provider 时抛出错误:', e.message);
}

contextStack.push({ _contextId: AuthContext._id, value: {
  user: { id: 1, name: 'Alice' },
  login: function(creds) { console.log('  登录:', creds.username); },
  logout: function() { console.log('  登出'); },
}});
var auth = useAuth();
console.log('\\n有 Provider 时 auth.user:', auth.user);
auth.login({ username: 'alice', password: '***' });
auth.logout();
contextStack.pop();

// ==========================================
// 7. 自定义 Hooks
// ==========================================

console.log('\\n=== 7. 自定义 Hook 类型演示 ===');
resetHooks();
contextStack.length = 1;
contextStack[0] = null;

// 7.1 useLocalStorage<T> - 泛型自定义 Hook
// TypeScript: function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void]
function useLocalStorage(key, initialValue) {
  var statePair = useState(function() {
    try {
      var item = null; // localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch(error) {
      return initialValue;
    }
  });
  var storedValue = statePair[0], setStoredValue = statePair[1];

  function setValue(value) {
    var valueToStore = typeof value === 'function' ? value(storedValue) : value;
    setStoredValue(valueToStore);
    console.log('  [useLocalStorage] 保存 ' + key + ':', JSON.stringify(valueToStore));
    // localStorage.setItem(key, JSON.stringify(valueToStore));
  }

  return [storedValue, setValue];
}

var settingsPair = useLocalStorage('settings', { theme: 'dark', notifications: true });
var settings = settingsPair[0], setSettings = settingsPair[1];
console.log('初始 settings:', settings);
setSettings({ theme: 'light', notifications: false });
setSettings(function(prev) { return Object.assign({}, prev, { theme: 'dark' }); });

// 7.2 useToggle - 返回元组
resetHooks();
// TypeScript: function useToggle(initialValue?: boolean): [boolean, () => void, (value: boolean) => void]
function useToggle(initialValue) {
  if (initialValue === void 0) initialValue = false;
  var statePair = useState(initialValue);
  var value = statePair[0], setValue = statePair[1];
  function toggle() { setValue(function(v) { return !v; }); }
  function set(v) { setValue(v); }
  return [value, toggle, set];
}

var toggleResult = useToggle(false);
var isOn = toggleResult[0], toggleOn = toggleResult[1], setOn = toggleResult[2];
console.log('\\nuseToggle 初始值:', isOn);
toggleOn();
toggleOn();
setOn(false);

// 7.3 useAsync - 返回对象（as const 风格）
resetHooks();
// TypeScript: function useAsync<T>(fn: () => Promise<T>, immediate?: boolean): { data: T | null; loading: boolean; error: Error | null; execute: () => Promise<void> }
function useAsync(asyncFunction, immediate) {
  if (immediate === void 0) immediate = true;
  var statePair = useState({ data: null, loading: immediate, error: null });
  var state = statePair[0], setState = statePair[1];

  function execute() {
    setState(function(prev) { return Object.assign({}, prev, { loading: true, error: null }); });
    return new Promise(function(resolve) {
      console.log('  [useAsync] 执行异步函数...');
      setTimeout(function() {
        var mockData = { id: 1, result: 'success' };
        setState({ data: mockData, loading: false, error: null });
        console.log('  [useAsync] 成功:', mockData);
        resolve(mockData);
      }, 10);
    });
  }

  if (immediate) {
    console.log('  [useAsync] immediate 模式');
    execute();
  }

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute: execute,
  };
}

var asyncResult = useAsync(function() { return Promise.resolve({}); }, false);
console.log('\\nuseAsync 初始状态:', { data: asyncResult.data, loading: asyncResult.loading });

console.log('\\n✅ React Hooks 类型演示完成！');
console.log('\\n本章总结:');
console.log('- useState: 简单状态用自动推断，可能为 null 时手动指定泛型');
console.log('- useReducer: Action 使用可辨识联合 + reducer 穷尽检查');
console.log('- useRef: DOM ref 需要 null 检查，可变 ref 用于不触发重渲染的值');
console.log('- useMemo/useCallback: 用于性能优化，TypeScript 自动推断返回类型');
console.log('- useContext: 配合自定义 Hook 确保 Provider 存在');
console.log('- 自定义 Hook: 合理选择返回元组还是对象，泛型提供灵活性');
`
  },
  {
    id: "ts3-react-state-management",
    title: "类型安全的状态管理",
    icon: "🗃️",
    group: "React 与 TypeScript",
    content: `# 类型安全的状态管理

状态管理是 React 应用的核心，良好的类型设计可以让状态逻辑更加可靠、可维护。本章将从 useReducer 的状态机模式开始，深入到 Context 全局状态、Zustand 风格的 Store 类型设计，以及不可变更新的类型安全。

## 一、useReducer 与状态机模式

useReducer 结合 TypeScript 的可辨识联合，可以实现类型安全的状态机。这种模式对于复杂的状态逻辑（如异步数据加载、多步骤表单、游戏状态等）非常有效。

### 1.1 状态机建模

状态机模式的核心思想是：用状态描述系统在某一时刻的所有可能情况，用动作描述所有可能的状态转移。在 TypeScript 中，我们用可辨识联合来精确描述状态和动作的类型。

对于异步数据加载，典型的状态包括：空闲（idle）、加载中（loading）、成功（success，带数据）、失败（error，带错误）。每种状态都是独立的接口，通过 status 字段进行区分。这种建模方式强制你在代码中处理所有可能的状态，避免出现"数据存在但正在加载"等不可能的状态组合。

### 1.2 穷尽检查的重要性

使用可辨识联合定义状态后，reducer 函数中的 switch 语句可以利用 TypeScript 的穷尽检查。如果你忘记处理某个状态或动作，TypeScript 会在编译时报错。这大大减少了运行时错误，因为所有状态转移都在编译时被验证。

实现穷尽检查的方法是在 switch 的 default 分支中将 action 或 state 赋值给 never 类型的变量。如果有未处理的 case，TypeScript 会检测到类型不兼容。

### 1.3 状态选择器

当状态变得复杂时，可以编写类型安全的选择器函数来从状态中提取特定数据。选择器是接收状态返回特定片段的纯函数，它们可以被记忆化（使用 useMemo 或 reselect）以优化性能。选择器的类型安全确保你不会访问不存在的状态属性。

## 二、Context + useReducer 全局状态

将 Context 和 useReducer 结合使用，可以实现轻量级的全局状态管理，无需引入第三方库。TypeScript 可以让这种模式完全类型安全。

### 2.1 类型安全的 Context 设计

创建全局状态 Context 时，需要定义两个类型：State 类型（描述状态形状）和 Dispatch 类型（描述可派发的动作）。然后创建两个 Context：一个用于状态，一个用于 dispatch，或者将它们合并到一个 Context 中。

最佳实践是创建一个自定义 Provider 组件和两个自定义 Hook（useAppState 和 useAppDispatch），这样可以确保在 Provider 外部使用时抛出有意义的错误，而不是得到 undefined。

### 2.2 Action Creators 类型

Action Creators 是创建 action 对象的函数，它们可以封装 action 创建逻辑并提供类型推断。每个 action creator 的返回类型应该精确对应到可辨识联合中的某个成员。这样，调用 dispatch(addTodo(text)) 时，TypeScript 知道派发的是 { type: 'add'; text: string } 类型的 action。

### 2.3 中间件模式

可以在 dispatch 外层包装中间件来实现日志、持久化、异步操作等功能。中间件的类型需要正确推断，确保类型安全贯穿整个调用链。常见的中间件包括：日志中间件（记录每个 action 和状态变化）、持久化中间件（将状态保存到 localStorage）、thunk 中间件（处理异步 action）。

## 三、Zustand/Jotai 风格 Store 类型

Zustand 等现代状态管理库采用了不同的模式：通过 hook 直接访问 store，而不是通过 Context。TypeScript 在这种模式下的应用非常关键。

### 3.1 Store 定义类型

Zustand 的 create 函数接收一个 set/get 函数，返回 store 的状态和操作。TypeScript 通过泛型参数定义 store 的形状，然后所有使用 store 的地方都会获得完整的类型推断。

定义 store 类型时，建议将状态和操作分开描述。状态是 store 的数据部分，操作是修改状态的方法。使用 TypeScript 的接口或类型别名精确定义每个属性和方法的类型。

### 3.2 选择器与浅比较

使用 store 时，可以传入选择器函数来只订阅需要的部分状态。选择器的类型应该是 (state: Store) => SelectedValue，TypeScript 会自动推断返回值类型。为了避免不必要的重渲染，通常需要使用浅比较或 useShallow。

### 3.3 中间件类型

Zustand 支持中间件模式（如 devtools、persist、immer），中间件会改变 store 的类型。例如，persist 中间件会添加 hydration 状态。TypeScript 的类型需要正确处理这些中间件的组合，确保最终的 store 类型包含所有中间件添加的属性和方法。

## 四、Redux Toolkit 类型安全模式

Redux Toolkit 是 Redux 的官方工具集，它内置了 TypeScript 支持，大幅简化了类型定义。

### 4.1 createSlice 类型

createSlice 自动生成 action creators 和 action 类型，你只需要定义 State 类型和 reducers。每个 reducer 函数接收 state 和 action，TypeScript 会自动推断 action.payload 的类型（通过 builder callback 或内联类型定义）。

### 4.2 createApi/RTK Query

RTK Query 是 Redux Toolkit 的数据获取层，它通过 API 定义自动生成类型安全的 hooks。你定义 endpoint 的输入输出类型，RTK Query 会生成 useQuery、useMutation 等 hooks，它们完全类型安全，包括请求参数、响应数据、加载状态、错误类型等。

### 4.3 Typed Hooks

在使用 Redux Toolkit 时，应该创建预类型化的 useDispatch 和 useSelector hooks，而不是每次手动指定类型。这通过定义 RootState 和 AppDispatch 类型，然后创建类型化的 hook 包装器来实现。

## 五、不可变状态更新类型

React 状态更新要求不可变性（immutability），即不能直接修改状态，而是创建新的状态对象。TypeScript 可以帮助确保不可变更新的正确性。

### 5.1 Readonly 与深层只读

使用 Readonly<T> 或自定义的 DeepReadonly<T> 工具类型，可以将状态标记为只读，防止意外的直接修改。当你尝试修改只读属性时，TypeScript 会在编译时报错。

### 5.2 Immer 类型

Immer 是一个流行的库，它允许你在 produce 函数中直接"修改"草稿状态，而 Immer 会负责创建新的不可变状态。Immer 与 TypeScript 配合良好，draft 对象的类型与原始状态相同，但在 produce 内部是可变的。

### 5.3 结构化更新的类型安全

嵌套对象的不可变更新需要多层展开运算符，这很容易出错。TypeScript 可以帮助捕获常见错误，如属性名拼写错误、类型不匹配等。使用 lens 模式或选择器可以简化深层更新，同时保持类型安全。

## 六、状态管理类型最佳实践

1. 使用可辨识联合建模复杂状态（尤其是异步状态），避免布尔标志组合
2. 利用 TypeScript 的穷尽检查确保 reducer 处理所有 action
3. 创建自定义 Context Hooks 保证 Provider 存在性
4. 为 action creators 添加精确返回类型，获得 dispatch 的类型推断
5. 使用 DeepReadonly 防止意外的状态突变
6. 考虑使用 Immer 简化不可变更新，类型安全有保障
7. 选择器函数保持纯函数，TypeScript 自动推断返回类型
8. 大型应用考虑将状态分片，每个分片有独立的 reducer 和类型

掌握这些类型安全的状态管理模式，你可以构建出健壮、可维护的 React 应用，在编译时捕获状态相关的错误，而不是在运行时调试。
`,
    code: `"use strict";
// 类型安全的状态管理 - 运行时演示

// ==========================================
// 1. useReducer 状态机模式
// ==========================================

console.log('=== 1. useReducer 状态机模式（可辨识联合 State）===');

// 模拟 useReducer（简化版，前面章节已有完整实现，这里用更简单的版本）
function createStore(reducer, initialState) {
  var state = initialState;
  var listeners = [];

  function getState() { return state; }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(function(fn) { fn(state); });
    console.log('  [Store] Dispatched:', action.type, '→ New state:', state);
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function() {
      listeners = listeners.filter(function(l) { return l !== fn; });
    };
  }

  return { getState: getState, dispatch: dispatch, subscribe: subscribe };
}

// 1.1 异步数据的状态机类型
// TypeScript:
// type AsyncDataState<T> =
//   | { status: 'idle' }
//   | { status: 'loading' }
//   | { status: 'success'; data: T }
//   | { status: 'error'; error: Error }

// TypeScript:
// type AsyncDataAction<T> =
//   | { type: 'fetch' }
//   | { type: 'resolve'; data: T }
//   | { type: 'reject'; error: Error }
//   | { type: 'reset' }

function createAsyncDataReducer() {
  return function asyncReducer(state, action) {
    switch (action.type) {
      case 'fetch':
        if (state.status === 'loading') return state;
        return { status: 'loading' };
      case 'resolve':
        return { status: 'success', data: action.data };
      case 'reject':
        return { status: 'error', error: action.error };
      case 'reset':
        return { status: 'idle' };
      default:
        throw new Error('Unknown action: ' + action.type);
    }
  };
}

var userStore = createStore(createAsyncDataReducer(), { status: 'idle' });
console.log('初始状态:', userStore.getState());

userStore.dispatch({ type: 'fetch' });
console.log('加载中:', userStore.getState());

userStore.dispatch({ type: 'resolve', data: { id: 1, name: 'Alice' } });
console.log('成功:', userStore.getState());

userStore.dispatch({ type: 'reset' });
userStore.dispatch({ type: 'reject', error: new Error('Network error') });
console.log('失败:', userStore.getState());

// 运行时类型守卫（TypeScript 中通过可辨识联合自动实现）
function renderBasedOnState(state) {
  switch (state.status) {
    case 'idle': return '等待中...';
    case 'loading': return '加载中...';
    case 'success': return '数据: ' + JSON.stringify(state.data);
    case 'error': return '错误: ' + state.error.message;
    default:
      // TypeScript 穷尽检查: const _exhaustive: never = state;
      throw new Error('Unknown status: ' + state.status);
  }
}

console.log('\\n基于状态渲染:');
console.log(renderBasedOnState({ status: 'idle' }));
console.log(renderBasedOnState({ status: 'loading' }));
console.log(renderBasedOnState({ status: 'success', data: { id: 1 } }));
console.log(renderBasedOnState({ status: 'error', error: new Error('fail') }));

// ==========================================
// 2. Zustand 风格 Store
// ==========================================

console.log('\\n=== 2. Zustand 风格 Store ===');

// TypeScript:
// interface BearStore {
//   bears: number;
//   color: string;
//   increasePopulation: () => void;
//   removeAllBears: () => void;
//   setColor: (color: string) => void;
// }

function createStoreVanilla(createFn) {
  var state;
  var listeners = new Set();

  function setState(partial, replace) {
    var nextState = typeof partial === 'function' ? partial(state) : partial;
    state = replace ? nextState : Object.assign({}, state, nextState);
    listeners.forEach(function(listener) { return listener(state); });
  }

  function getState() { return state; }

  function subscribe(listener) {
    listeners.add(listener);
    return function() { listeners.delete(listener); };
  }

  var api = { setState: setState, getState: getState, subscribe: subscribe };
  state = createFn(setState, getState, api);
  return api;
}

// 创建 bear store（Zustand 风格）
var bearStore = createStoreVanilla(function(set) {
  return {
    bears: 0,
    color: 'brown',
    increasePopulation: function() {
      set(function(state) { return { bears: state.bears + 1 }; });
    },
    removeAllBears: function() {
      set({ bears: 0 });
    },
    setColor: function(color) {
      set({ color: color });
    },
  };
});

console.log('Bear store 初始状态:', bearStore.getState());
bearStore.getState().increasePopulation();
console.log('After increasePopulation:', bearStore.getState());
bearStore.getState().increasePopulation();
bearStore.getState().setColor('black');
console.log('After +1 and setColor(black):', bearStore.getState());
bearStore.getState().removeAllBears();
console.log('After removeAllBears:', bearStore.getState());

// 购物车 store（更复杂的例子）
var cartStore = createStoreVanilla(function(set) {
  return {
    items: [],
    coupon: null,
    addItem: function(product, quantity) {
      if (quantity === void 0) quantity = 1;
      set(function(state) {
        var existing = state.items.find(function(i) { return i.id === product.id; });
        if (existing) {
          return {
            items: state.items.map(function(i) {
              return i.id === product.id ? Object.assign({}, i, { quantity: i.quantity + quantity }) : i;
            })
          };
        }
        return { items: state.items.concat([Object.assign({}, product, { quantity: quantity })]) };
      });
    },
    removeItem: function(productId) {
      set(function(state) {
        return { items: state.items.filter(function(i) { return i.id !== productId; }) };
      });
    },
    updateQuantity: function(productId, quantity) {
      if (quantity <= 0) {
        set(function(state) {
          return { items: state.items.filter(function(i) { return i.id !== productId; }) };
        });
      } else {
        set(function(state) {
          return {
            items: state.items.map(function(i) {
              return i.id === productId ? Object.assign({}, i, { quantity: quantity }) : i;
            })
          };
        });
      }
    },
    applyCoupon: function(coupon) { set({ coupon: coupon }); },
    clearCart: function() { set({ items: [], coupon: null }); },
    getTotal: function() {
      var state = this;
      var subtotal = state.items.reduce(function(sum, i) { return sum + i.price * i.quantity; }, 0);
      if (state.coupon) {
        subtotal = subtotal * (1 - state.coupon.discount);
      }
      return Math.round(subtotal * 100) / 100;
    },
    getItemCount: function() {
      return this.items.reduce(function(sum, i) { return sum + i.quantity; }, 0);
    },
  };
});

console.log('\\nCart store 演示:');
cartStore.getState().addItem({ id: 1, name: 'Laptop', price: 999 });
cartStore.getState().addItem({ id: 2, name: 'Mouse', price: 29 }, 2);
console.log('购物车 items:', cartStore.getState().items);
console.log('商品总数:', cartStore.getState().getItemCount());
console.log('小计: $' + cartStore.getState().getTotal());
cartStore.getState().updateQuantity(2, 1);
console.log('更新 Mouse 数量为 1 后: $' + cartStore.getState().getTotal());
cartStore.getState().applyCoupon({ code: 'SAVE10', discount: 0.1 });
console.log('使用 SAVE10 优惠券后: $' + cartStore.getState().getTotal());

// ==========================================
// 3. Context + useReducer 全局状态模式
// ==========================================

console.log('\\n=== 3. Context + useReducer 全局状态模式 ===');

// Action Creators（类型安全）
var AppActions = {
  setUser: function(user) { return { type: 'auth/setUser', user: user }; },
  clearUser: function() { return { type: 'auth/clearUser' }; },
  setTheme: function(theme) { return { type: 'ui/setTheme', theme: theme }; },
  addNotification: function(message, _type) {
    return { type: 'ui/addNotification', payload: { id: Date.now(), message: message, type: _type || 'info' } };
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'auth/setUser':
      return Object.assign({}, state, { user: action.user, isAuthenticated: true });
    case 'auth/clearUser':
      return Object.assign({}, state, { user: null, isAuthenticated: false });
    case 'ui/setTheme':
      return Object.assign({}, state, { theme: action.theme });
    case 'ui/addNotification':
      return Object.assign({}, state, { notifications: state.notifications.concat([action.payload]) });
    default:
      return state;
  }
}

var appStore = createStore(appReducer, {
  user: null,
  isAuthenticated: false,
  theme: 'light',
  notifications: [],
});

console.log('初始 app state:', appStore.getState());
appStore.dispatch(AppActions.setUser({ id: 1, name: 'Alice', role: 'admin' }));
appStore.dispatch(AppActions.setTheme('dark'));
appStore.dispatch(AppActions.addNotification('Welcome back!', 'success'));
console.log('After actions:', appStore.getState());

// 日志中间件
function withLogger(store) {
  var originalDispatch = store.dispatch;
  return Object.assign({}, store, {
    dispatch: function(action) {
      console.log('  [Logger] Dispatching:', action.type, action);
      var prevState = store.getState();
      originalDispatch(action);
      var nextState = store.getState();
      console.log('  [Logger] State changed:', { prev: prevState, next: nextState });
    }
  });
}

var loggedStore = withLogger(createStore(appReducer, { user: null, isAuthenticated: false, theme: 'light', notifications: [] }));
console.log('\\n带日志中间件的 Store:');
loggedStore.dispatch(AppActions.setUser({ id: 2, name: 'Bob' }));

// ==========================================
// 4. Immer 风格不可变更新
// ==========================================

console.log('\\n=== 4. Immer 风格不可变更新 ===');

// 简化版 Immer produce 函数
// TypeScript: function produce<T>(base: T, recipe: (draft: T) => void): T
function produce(base, recipe) {
  var draft = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  recipe(draft);
  return draft;
}

// 深层 produce（递归版本）
function produceDeep(base, recipe) {
  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    var cloned = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  var draft = deepClone(base);
  // 创建 proxy 以支持深层修改（这里简化为直接返回克隆，真实 Immer 使用 Proxy）
  recipe(draft);
  return draft;
}

var baseState = {
  user: { name: 'Alice', address: { city: 'Beijing', zip: '100000' } },
  todos: [{ id: 1, text: 'Learn TS', done: false }],
};

// 传统展开方式（繁琐）
var nextState1 = Object.assign({}, baseState, {
  user: Object.assign({}, baseState.user, {
    address: Object.assign({}, baseState.user.address, { city: 'Shanghai' })
  }),
  todos: baseState.todos.map(function(t) {
    return t.id === 1 ? Object.assign({}, t, { done: true }) : t;
  }),
});
console.log('传统展开方式更新:', nextState1.user.address.city, nextState1.todos[0].done);

// Immer 风格
var nextState2 = produceDeep(baseState, function(draft) {
  draft.user.address.city = 'Shanghai';
  draft.todos[0].done = true;
  draft.todos.push({ id: 2, text: 'Build App', done: false });
});
console.log('Immer 风格更新:', nextState2.user.address.city, nextState2.todos[0].done, 'todos长度:', nextState2.todos.length);
console.log('原始 state 未被修改:', baseState.user.address.city, baseState.todos[0].done, 'todos长度:', baseState.todos.length);

// ==========================================
// 5. 类型安全的选择器（Selectors）
// ==========================================

console.log('\\n=== 5. 类型安全的选择器 ===');

// 选择器函数 - 从 state 中提取特定数据
var Selectors = {
  selectUserName: function(state) {
    return state.user ? state.user.name : 'Guest';
  },
  selectIsAdmin: function(state) {
    return state.user && state.user.role === 'admin';
  },
  selectUnreadNotifications: function(state) {
    return state.notifications.filter(function(n) { return !n.read; });
  },
};

var testState = {
  user: { id: 1, name: 'Alice', role: 'admin' },
  notifications: [
    { id: 1, message: 'Hi', read: false },
    { id: 2, message: 'Done', read: true },
  ],
};

console.log('用户名:', Selectors.selectUserName(testState));
console.log('是否管理员:', Selectors.selectIsAdmin(testState));
console.log('未读通知数:', Selectors.selectUnreadNotifications(testState).length);

console.log('\\n✅ 类型安全的状态管理演示完成！');
console.log('\\n本章总结:');
console.log('- useReducer + 可辨识联合 = 类型安全的状态机');
console.log('- 穷尽检查确保所有状态都被处理');
console.log('- Context + useReducer = 轻量级全局状态');
console.log('- Zustand 风格: create 函数 + setter/getter 模式');
console.log('- Immer produce 简化不可变更新，保持类型安全');
console.log('- Action Creators 封装 action 创建，提供类型推断');
console.log('- 选择器函数从 state 派生数据，纯函数可组合');
`
  },
  {
    id: "ts3-react-forms",
    title: "类型安全的表单处理",
    icon: "📋",
    group: "React 与 TypeScript",
    content: `# 类型安全的表单处理

表单是前端应用中最常见也最复杂的交互场景之一。TypeScript 可以在编译时捕获表单相关的错误，如字段名拼写错误、值类型不匹配、验证错误访问不存在的字段等。本章将系统讲解如何构建完全类型安全的表单系统。

## 一、表单值的类型设计

表单类型安全的第一步是精确定义表单值的类型。每个表单字段的类型应该反映其真实的数据类型，而不是简单地全部使用 string。

### 1.1 定义 FormValues 类型

为每个表单定义一个接口，精确描述每个字段的类型。例如，注册表单可能包含：username (string)、age (number)、email (string)、password (string)、confirmPassword (string)、agreeToTerms (boolean)、birthday (Date) 等字段。

注意区分输入值和最终提交值的类型差异。例如，数字输入框在 HTML 中返回 string，但我们希望最终值是 number；日期输入可能返回 string，但我们需要 Date。这时候需要在表单处理中进行类型转换，并在类型上体现这种转换。

### 1.2 嵌套对象和数组

复杂表单可能包含嵌套对象（如地址信息包含省、市、街道）和数组（如多个电话号码、多个教育经历）。TypeScript 的接口可以直接描述这种嵌套结构，所有表单操作（设置值、获取错误、注册字段）都应该支持嵌套路径。

### 1.3 字段路径类型

对于嵌套表单，需要一个类型安全的方式来引用字段路径。TypeScript 的模板字面量类型和递归类型可以实现 FieldPath<T>，它生成所有可能的字段路径（如 "address.city"、"phones.0"）。FieldPathValue<T, P> 可以获取路径 P 对应的值类型。这种类型安全的路径访问是 react-hook-form 等库的核心特性。

## 二、类型安全的验证系统

验证是表单处理的核心，类型安全的验证系统可以确保验证规则与表单值类型一致，错误信息与字段对应。

### 2.1 Zod 风格的 Schema 验证

Zod 是一个流行的 TypeScript-first 验证库，它允许你定义 schema，然后从 schema 推断出 TypeScript 类型。这种方式的好处是类型定义和验证规则在同一个地方，不会出现不同步的问题。

定义 Zod schema 后，可以使用 z.infer<typeof schema> 来获取对应的 TypeScript 类型。这意味着如果你修改了 schema，类型自动更新，不需要手动维护接口。

### 2.2 验证规则类型

每个字段的验证规则可以包括：required（必填）、minLength/maxLength（长度限制）、min/max（数值范围）、pattern（正则匹配）、validate（自定义验证函数）。这些规则的类型应该与字段类型匹配——例如，min/max 只对 number 类型的字段有意义。

### 2.3 类型安全的错误对象

表单错误对象应该与表单值结构相同，每个字段对应的错误是 string 或 undefined（或错误对象数组）。使用映射类型可以将 FormValues 映射到 FormErrors<FormValues>，确保你不会访问不存在字段的错误。

## 三、受控与非受控组件

React 表单处理有两种模式：受控组件（component-controlled）和非受控组件（uncontrolled）。两种模式的类型处理方式不同。

### 3.1 受控组件类型

受控组件通过 value 和 onChange props 控制表单状态。输入元素的 onChange 事件类型是 React.ChangeEvent<HTMLInputElement>，你需要从中读取 e.target.value（对于 checkbox 是 e.target.checked）。类型安全要求 onChange 处理器的参数类型正确，并且设置值的类型与字段类型匹配。

### 3.2 非受控组件类型

非受控组件使用 ref 直接访问 DOM，通过 defaultValue 设置初始值。在 TypeScript 中，ref 的类型需要对应到具体的元素类型（如 HTMLInputElement）。非受控组件在性能上更好（每次输入不触发重渲染），但类型安全程度略低，因为值的读取发生在运行时。

### 3.3 register 函数类型

react-hook-form 等库的核心是 register 函数，它接收字段名，返回该字段的 props（name、ref、onChange、onBlur 等）。register 函数的类型需要接收 FieldPath<FormValues> 作为参数，返回对应元素类型的 props。

## 四、表单库类型设计

以 react-hook-form 为参考，一个类型安全的表单库应该提供以下类型化 API。

### 4.1 useForm 类型

useForm 钩子接收 FormValues 类型作为泛型参数，返回一系列类型化的方法：register、handleSubmit、formState.errors、setValue、getValues、watch 等。所有这些方法都应该从 FormValues 类型自动推断，不需要重复指定类型。

### 4.2 handleSubmit 类型

handleSubmit 接收一个提交回调函数，回调函数的参数是经过验证的表单数据，类型是 FormValues。这意味着在提交回调中，你可以安全地访问所有字段，TypeScript 知道它们的类型。handleSubmit 还应该在验证失败时阻止提交，并且传递 formState.errors。

### 4.3 setValue/getValue 类型

setValue 函数接收字段路径（FieldPath<FormValues>）和对应类型的值（FieldPathValue<FormValues, TPath>）。TypeScript 会检查值的类型是否与路径匹配，防止设置错误类型的值。getValues 可以接收字段路径返回对应类型的值，或者不传参数返回整个 FormValues 对象。

### 4.4 watch 类型

watch 函数用于监听字段变化，返回最新的值。它的类型与 getValues 类似，但通常在渲染时调用并订阅变化。watch('fieldName') 返回对应字段的类型。

## 五、动态字段与数组字段

动态表单（字段可增删）和数组字段的类型处理更加复杂。

### 5.1 数组字段操作

对于数组类型的字段，需要提供 append（添加项）、prepend（前面添加）、remove（删除项）、insert（插入项）、swap（交换项）、move（移动项）等操作。这些操作的类型应该根据数组元素的类型来确定——append 和 prepend 接收数组元素类型的值。

### 5.2 条件字段

某些字段可能根据其他字段的值动态显示或隐藏。在类型层面，这些字段可能仍然存在于 FormValues 类型中（作为可选字段），或者使用可辨识联合来精确建模。使用可辨识联合可以实现更严格的类型检查，但需要更复杂的类型体操。

## 六、表单类型最佳实践

1. 为每个表单定义精确的 FormValues 接口，或从验证 schema 推断类型
2. 使用 Zod/Yup 等 schema 验证库，实现类型与验证规则的统一
3. 利用 FieldPath/FieldPathValue 类型实现字段路径的类型安全
4. FormErrors 使用映射类型保持与 FormValues 结构一致
5. 受控组件显式标注 ChangeEvent 类型
6. handleSubmit 的回调函数中可以安全使用已验证的数据
7. 数组字段使用 useFieldArray 并保持元素类型一致
8. 表单提交前进行类型转换（string → number/Date），保持类型一致
9. 自定义表单控件正确定义 value/onChange 的类型契约
10. 考虑在提交时而非输入时进行数据转换，避免输入过程中的类型问题

类型安全的表单处理可以显著减少表单相关的 bug，让开发者在编写表单时代码补全更加智能，在重构时编译器帮助捕获所有需要修改的地方。
`,
    code: `"use strict";
// 类型安全的表单处理 - 运行时演示

console.log('=== 1. 表单类型与 Zod 风格 Schema 验证 ===');

// ==========================================
// 1. 简化版 Zod 风格 Schema 验证系统
// ==========================================

// Schema 基础类型
function stringValidator(options) {
  if (options === void 0) options = {};
  return {
    _type: 'string',
    parse: function(value) {
      if (typeof value !== 'string') {
        throw new Error('Expected string, got ' + typeof value);
      }
      if (options.minLength && value.length < options.minLength) {
        throw new Error('String must be at least ' + options.minLength + ' characters');
      }
      if (options.maxLength && value.length > options.maxLength) {
        throw new Error('String must be at most ' + options.maxLength + ' characters');
      }
      if (options.pattern && !options.pattern.test(value)) {
        throw new Error('String does not match pattern');
      }
      if (options.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        throw new Error('Invalid email format');
      }
      return value;
    },
    optional: function() { return optionalValidator(this); },
  };
}

function numberValidator(options) {
  if (options === void 0) options = {};
  return {
    _type: 'number',
    parse: function(value) {
      var num = typeof value === 'string' ? Number(value) : value;
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('Expected number, got ' + typeof value);
      }
      if (options.min != null && num < options.min) {
        throw new Error('Number must be at least ' + options.min);
      }
      if (options.max != null && num > options.max) {
        throw new Error('Number must be at most ' + options.max);
      }
      return num;
    },
    optional: function() { return optionalValidator(this); },
  };
}

function booleanValidator() {
  return {
    _type: 'boolean',
    parse: function(value) {
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new Error('Expected boolean');
    },
    optional: function() { return optionalValidator(this); },
  };
}

function optionalValidator(schema) {
  return {
    _type: 'optional',
    _inner: schema,
    parse: function(value) {
      if (value === undefined || value === null || value === '') return undefined;
      return schema.parse(value);
    },
  };
}

function objectValidator(shape) {
  return {
    _type: 'object',
    _shape: shape,
    parse: function(value) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Expected object');
      }
      var result = {};
      var errors = {};
      var hasErrors = false;
      for (var key in shape) {
        if (shape.hasOwnProperty(key)) {
          try {
            result[key] = shape[key].parse(value[key]);
          } catch(e) {
            errors[key] = e.message;
            hasErrors = true;
          }
        }
      }
      if (hasErrors) {
        var error = new Error('Validation failed');
        error.errors = errors;
        throw error;
      }
      return result;
    },
    optional: function() { return optionalValidator(this); },
  };
}

// 模拟 z 对象
var z = {
  string: function(opts) { return stringValidator(opts); },
  number: function(opts) { return numberValidator(opts); },
  boolean: function() { return booleanValidator(); },
  object: function(shape) { return objectValidator(shape); },
};

// 1.1 定义注册表单 Schema
var registerSchema = z.object({
  username: z.string({ minLength: 3, maxLength: 20 }),
  email: z.string({ email: true }),
  age: z.number({ min: 18, max: 120 }).optional(),
  password: z.string({ minLength: 6 }),
  agreeToTerms: z.boolean(),
});

// TypeScript 类型从 schema 推断:
// type RegisterForm = z.infer<typeof registerSchema>
// = { username: string; email: string; age?: number; password: string; agreeToTerms: boolean }

// 验证成功案例
var validData = {
  username: 'alice',
  email: 'a***@example.com',
  age: '25', // string 会被转换为 number
  password: 'secret123',
  agreeToTerms: 'true', // string 会被转换为 boolean
};

try {
  var parsed = registerSchema.parse(validData);
  console.log('验证成功! 解析后的数据:', parsed);
} catch(e) {
  console.log('验证失败:', e.errors);
}

// 验证失败案例
var invalidData = {
  username: 'al', // 太短
  email: 'not-an-email',
  password: '123', // 太短
  agreeToTerms: false, // 这个没问题
};

try {
  registerSchema.parse(invalidData);
} catch(e) {
  console.log('\\n验证失败（预期）:');
  console.log('  错误字段:', e.errors);
}

// ==========================================
// 2. useForm 实现（简化版，react-hook-form 风格）
// ==========================================

console.log('\\n=== 2. useForm 类型演示 ===');

function createForm(options) {
  if (options === void 0) options = {};
  var _values = Object.assign({}, options.defaultValues || {});
  var _errors = {};
  var _touched = {};
  var _listeners = new Set();

  function notify() {
    _listeners.forEach(function(fn) { return fn(); });
  }

  function getValues(fieldName) {
    if (fieldName) {
      return getNestedValue(_values, fieldName);
    }
    return Object.assign({}, _values);
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce(function(acc, key) {
      return acc && acc[key];
    }, obj);
  }

  function setNestedValue(obj, path, value) {
    var keys = path.split('.');
    var current = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  function setValue(name, value) {
    setNestedValue(_values, name, value);
    // 清除该字段的错误
    delete _errors[name];
    notify();
    console.log('  [Form] setValue(' + name + '):', value);
  }

  function setError(name, error) {
    _errors[name] = error;
    notify();
  }

  function clearErrors(name) {
    if (name) {
      delete _errors[name];
    } else {
      _errors = {};
    }
    notify();
  }

  function register(name, options) {
    if (options === void 0) options = {};
    // 返回字段 props（模拟 ref, onChange, onBlur, name）
    return {
      name: name,
      value: getNestedValue(_values, name) || '',
      onChange: function(e) {
        var value = e && e.target ? e.target.value : e;
        // Checkbox 特殊处理
        if (options.type === 'checkbox') {
          value = e.target.checked;
        }
        // Number 转换
        if (options.valueAsNumber) {
          value = value === '' ? undefined : Number(value);
        }
        setValue(name, value);
      },
      onBlur: function() {
        _touched[name] = true;
        // 触发验证
        if (options.validate) {
          var result = options.validate(getNestedValue(_values, name));
          if (result !== true && result !== undefined) {
            setError(name, typeof result === 'string' ? result : 'Invalid');
          }
        }
        if (options.required && !getNestedValue(_values, name)) {
          setError(name, typeof options.required === 'string' ? options.required : '此字段必填');
        }
        notify();
      },
    };
  }

  function handleSubmit(onValid) {
    return function(e) {
      if (e && e.preventDefault) e.preventDefault();
      _errors = {};

      // 运行 schema 验证
      if (options.schema) {
        try {
          var validated = options.schema.parse(_values);
          console.log('  [Form] 表单验证通过，提交数据:', validated);
          onValid(validated);
          return true;
        } catch(err) {
          _errors = err.errors || {};
          console.log('  [Form] 表单验证失败:', _errors);
          notify();
          return false;
        }
      }

      console.log('  [Form] 提交数据:', _values);
      onValid(Object.assign({}, _values));
      return true;
    };
  }

  function watch(name) {
    if (name) return getNestedValue(_values, name);
    return Object.assign({}, _values);
  }

  function reset(values) {
    _values = values ? Object.assign({}, values) : Object.assign({}, options.defaultValues || {});
    _errors = {};
    _touched = {};
    notify();
    console.log('  [Form] 重置表单');
  }

  var form = {
    register: register,
    handleSubmit: handleSubmit,
    setValue: setValue,
    getValues: getValues,
    watch: watch,
    reset: reset,
    clearErrors: clearErrors,
    setError: setError,
    get formState() {
      return {
        errors: Object.assign({}, _errors),
        touched: Object.assign({}, _touched),
        isDirty: Object.keys(_touched).length > 0,
        isValid: Object.keys(_errors).length === 0,
      };
    },
    _subscribe: function(fn) {
      _listeners.add(fn);
      return function() { _listeners.delete(fn); };
    },
  };

  return form;
}

// 2.1 使用 useForm（类似 react-hook-form）
var form = createForm({
  defaultValues: {
    username: '',
    email: '',
    age: '',
    password: '',
    agreeToTerms: false,
    address: { city: '', zip: '' },
  },
  schema: registerSchema,
});

console.log('初始 values:', form.getValues());
console.log('初始 formState:', form.formState);

// 注册字段
var usernameProps = form.register('username', { required: '用户名必填', minLength: 3 });
console.log('\\nregister("username") 返回 props:', { name: usernameProps.name, value: usernameProps.value });

// 模拟用户输入
usernameProps.onChange({ target: { value: 'alice' } });
usernameProps.onBlur();

var emailProps = form.register('email');
emailProps.onChange({ target: { value: 'a***@example.com' } });

var passwordProps = form.register('password');
passwordProps.onChange({ target: { value: 'secret123' } });

var termsProps = form.register('agreeToTerms', { type: 'checkbox' });
termsProps.onChange({ target: { checked: true } });

var ageProps = form.register('age', { valueAsNumber: true });
ageProps.onChange({ target: { value: '25' } });

console.log('\\n填写后 values:', form.getValues());
console.log('formState.errors:', form.formState.errors);
console.log('formState.isValid:', form.formState.isValid);

// 提交表单
console.log('\\n提交表单:');
form.handleSubmit(function(data) {
  console.log('✅ 提交成功，验证后的数据:', data);
})({ preventDefault: function() {} });

// 测试无效提交
form.reset();
console.log('\\n空表单提交:');
form.setValue('username', 'ab'); // 太短
form.setValue('email', 'bad-email');
form.setValue('password', '123');
form.handleSubmit(function() {
  console.log('❌ 不应该走到这里');
})({ preventDefault: function() {} });
console.log('验证 errors:', form.formState.errors);

// ==========================================
// 3. 表单控件类型演示
// ==========================================

console.log('\\n=== 3. 表单控件 Props 类型 ===');

// Input 组件 Props 类型（TypeScript 概念）
// interface InputProps {
//   name: string;
//   value: string;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: () => void;
//   type?: 'text' | 'email' | 'password' | 'number';
//   placeholder?: string;
//   error?: string;
// }

// Checkbox Props
// interface CheckboxProps {
//   name: string;
//   checked: boolean;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   label: string;
// }

// Select Props
// interface SelectProps<T extends string | number> {
//   name: string;
//   value: T;
//   onChange: (value: T) => void;
//   options: { value: T; label: string }[];
// }

// 工厂函数演示
function createInput(props) {
  return {
    type: 'input',
    props: {
      type: props.type || 'text',
      name: props.name,
      value: props.value || '',
      placeholder: props.placeholder,
      hasError: !!props.error,
      errorMessage: props.error,
    },
    render: function() {
      return '<input type="' + (props.type || 'text') + '" name="' + props.name + '" value="' + (props.value || '') + '" placeholder="' + (props.placeholder || '') + '" />';
    }
  };
}

var emailInput = createInput({
  name: 'email',
  type: 'email',
  value: 't***@example.com',
  placeholder: '请输入邮箱',
  error: undefined,
});
console.log('Email input:', emailInput.render());

var usernameInputWithError = createInput({
  name: 'username',
  value: 'ab',
  error: '用户名至少3个字符',
});
console.log('Username input with error:', usernameInputWithError.props);

// ==========================================
// 4. 嵌套字段路径演示
// ==========================================

console.log('\\n=== 4. 嵌套字段路径 (FieldPath) ===');

// TypeScript 中:
// type FieldPath<T> = T extends object ? { [K in keyof T]: K extends string ? K | \`\${K}.\${FieldPath<T[K]>}\` : never }[keyof T] : never
// type FieldPathValue<T, P extends string> = P extends keyof T ? T[P] : P extends \`\${infer K}.\${infer R}\` ? K extends keyof T ? FieldPathValue<T[K], R> : never : never

var nestedForm = createForm({
  defaultValues: {
    shipping: {
      address: {
        street: '',
        city: '',
        zip: '',
      },
    },
    billing: {
      sameAsShipping: true,
    },
  },
});

// 设置嵌套字段
nestedForm.setValue('shipping.address.street', '123 Main St');
nestedForm.setValue('shipping.address.city', 'Beijing');
nestedForm.setValue('shipping.address.zip', '100000');
console.log('嵌套表单值:', nestedForm.getValues());
console.log('单独获取 shipping.address.city:', nestedForm.getValues('shipping.address.city'));

console.log('\\n✅ 类型安全的表单处理演示完成！');
console.log('\\n本章总结:');
console.log('- 使用 Zod 风格 schema 同时定义类型和验证规则');
console.log('- z.infer 从 schema 自动推断 TypeScript 类型');
console.log('- useForm 返回 register/handleSubmit/setValue 等类型安全方法');
console.log('- FieldPath 类型确保字段名字符串是有效的');
console.log('- handleSubmit 回调接收已验证数据，类型安全');
console.log('- 嵌套字段使用点号路径访问（"address.city"）');
console.log('- 表单错误对象与表单值结构对应');
console.log('- register 返回元素的 value/onChange/onBlur props');
`
  },
  {
    id: "ts3-react-api-layer",
    title: "类型安全的 API 层",
    icon: "🌐",
    group: "React 与 TypeScript",
    content: `# 类型安全的 API 层

在现代前端应用中，与后端 API 的通信是最常见的操作之一。类型安全的 API 层可以确保请求参数和响应数据在编译时就被正确检查，避免因字段拼写错误、类型不匹配等问题导致的运行时错误。本章将系统讲解如何构建端到端类型安全的 API 层。

## 一、API 客户端类型设计

类型安全的 API 客户端从定义端点类型开始。每个 API 端点都应该明确指定路径、HTTP 方法、请求参数类型、请求体类型、响应类型等。

### 1.1 端点定义类型

为每个 API 端点定义一个接口，包含 path、method、parameters（路径参数、查询参数）、body、response 等信息。使用 TypeScript 的接口或类型别名精确描述每个字段的类型。这种方式虽然需要一些前期工作，但可以获得完全的端到端类型安全。

端点定义的核心是路径参数类型。对于类似 /users/:id/posts/:postId 这样的路径，可以使用模板字面量类型和 ExtractPathParams 工具类型来自动提取路径参数名和类型。

### 1.2 HTTP 方法类型

HTTP 方法（GET、POST、PUT、PATCH、DELETE）应该作为字面量类型，而不是普通的 string。这可以防止拼错方法名，并且不同方法的行为（如 GET 请求没有 body）可以在类型层面区分。

### 1.3 请求配置类型

fetch 或 axios 的请求配置（headers、credentials、signal 等）也应该有正确的类型。特别是 Content-Type 等 header 会影响请求体的序列化方式。

## 二、类型安全的 Fetch 封装

原生 fetch API 类型不够严格，我们需要封装它来提供更好的类型安全。

### 2.1 泛型请求函数

封装的请求函数应该是泛型的，接收端点定义作为类型参数，自动推断参数类型和返回类型。函数签名大致为：async function request<T extends Endpoint>(endpoint: T, params: RequestParams<T>): Promise<T['response']>。

### 2.2 路径参数类型安全

对于带路径参数的 URL（如 /users/:id），封装函数应该强制要求传入对应的参数，并且参数类型正确。使用模板字面量类型解析路径中的参数名，然后在请求函数参数中要求这些参数必须存在。

### 2.3 查询参数序列化

查询参数（query string）的类型也应该被推断。例如，如果端点定义了 query 参数类型为 { page: number; limit: number; search?: string }，则请求函数会要求你传入 page 和 limit，search 是可选的。序列化时需要处理数字到字符串的转换、数组参数的序列化等。

### 2.4 请求体类型

对于 POST/PUT/PATCH 请求，请求体的类型应该从端点定义中自动推断。同时需要根据 Content-Type 正确序列化（JSON、FormData、URLSearchParams 等）。

## 三、响应处理与错误类型

类型安全的 API 层不仅要处理成功响应，还要正确处理错误情况。

### 3.1 响应类型推断

请求函数的返回类型应该是端点定义中的 response 类型，而不是 any 或 unknown。这意味着你不需要手动标注响应类型，TypeScript 会自动推断。

### 3.2 错误类型设计

API 错误应该有明确的类型定义。常见的错误类型包括：网络错误（NetworkError）、HTTP 错误（如 400、401、403、404、500）、超时错误、解析错误等。使用可辨识联合来表示不同类型的错误，可以在 catch 块中进行类型收窄。

### 3.3 Result/Either 模式

一种流行的错误处理模式是 Result 类型（也称为 Either），它将成功和失败都封装在一个类型中：type Result<T, E> = { ok: true; data: T } | { ok: false; error: E }。这种方式避免了 try/catch 中错误类型为 unknown 的问题，强制调用方处理错误情况。

## 四、OpenAPI/GraphQL 代码生成

手动定义 API 类型在大型项目中维护成本高，这时候可以使用代码生成工具。

### 4.1 OpenAPI/Swagger 代码生成

如果后端提供 OpenAPI（Swagger）规范，可以使用 openapi-typescript-codegen、swagger-typescript-api 等工具自动生成类型安全的 API 客户端。这些工具会根据 OpenAPI schema 生成所有端点的类型定义和请求函数，保持前后端类型同步。

### 4.2 GraphQL 代码生成

对于 GraphQL API，可以使用 GraphQL Code Generator（graphql-codegen）根据 GraphQL schema 和你的查询/突变文档自动生成 TypeScript 类型和 React hooks。这提供了完全类型安全的 GraphQL 使用体验。

### 4.3 tRPC 模式

tRPC 是一个端到端类型安全的 API 框架，它不需要代码生成，而是通过 TypeScript 类型推断直接在前后端共享类型。使用 tRPC 时，客户端的 API 调用完全类型安全，就像调用本地函数一样。

## 五、请求拦截器与中间件

类型安全的拦截器可以在请求发送前和响应返回后进行统一处理。

### 5.1 请求拦截器类型

请求拦截器接收请求配置，返回修改后的请求配置（或 Promise）。拦截器应该保留类型信息，添加或修改字段时要正确更新类型。常见的用例包括添加认证 token、添加请求 ID、记录日志等。

### 5.2 响应拦截器类型

响应拦截器接收响应，返回处理后的数据。可以用于统一错误处理、数据转换（如 snake_case 到 camelCase 的转换）等。类型需要正确处理拦截器链中的数据流。

## 六、React Query/SWR 集成

React Query（TanStack Query）和 SWR 是 React 中最流行的数据获取库，它们与 TypeScript 配合良好。

### 6.1 Query Key 类型

React Query 的 query key 应该是类型安全的。可以使用 const 断言确保 query key 的字面量类型不被扩大。使用 query key 工厂函数可以统一管理 query key，并为不同的端点提供类型安全的参数。

### 6.2 useQuery 类型

useQuery 的泛型参数包括查询函数返回类型、错误类型。配合类型安全的 API 客户端函数，TypeScript 可以自动推断 data 和 error 的类型，不需要手动指定。data 在成功时是 T | undefined（因为查询可能尚未完成），error 是 Error | null。

### 6.3 useMutation 类型

useMutation 同样可以从 mutation 函数自动推断变量类型和返回类型。mutation 的 onSuccess 回调中可以安全地访问返回数据。

## 七、Next.js App Router 中的类型安全

Next.js App Router 引入了 Server Components 和 Route Handlers，提供了新的类型安全模式。

### 7.1 Server Actions 类型

Server Actions 是在服务器上执行的异步函数，可以直接从客户端组件调用。通过将函数标记为 'use server'，Next.js 会自动生成类型安全的客户端调用存根。函数的参数和返回值类型自动共享，不需要手动定义 API 层。

### 7.2 Route Handler 类型

Route Handlers（app/api/.../route.ts）的 Request 和 Response 类型可以通过 NextRequest 和 NextResponse 提供类型安全。对于 GET/POST 等导出函数，可以正确标注参数和返回值类型。

## 八、API 层类型最佳实践

1. 为每个 API 端点定义明确的请求/响应类型，避免使用 any
2. 使用泛型封装 fetch/axios，自动推断参数和返回类型
3. 利用模板字面量类型实现路径参数的类型安全
4. 使用 Result 模式或类型化错误进行错误处理
5. 大型项目使用代码生成（OpenAPI/GraphQL/tRPC）保持类型同步
6. React Query/SWR 配合类型安全的 API 函数获得完整的数据获取类型安全
7. Next.js 项目优先考虑 Server Actions 和类型安全的 Route Handlers
8. 在拦截器中统一添加认证、日志等横切关注点，保持类型安全
9. 响应数据的运行时验证（zod）可以弥补后端类型的不确定性
10. 考虑将后端 snake_case 字段转换为前端 camelCase，在转换层保持类型一致

端到端类型安全的 API 层可以显著减少前后端联调的成本，让 API 调用变得像调用本地函数一样安全和智能。
`,
    code: `"use strict";
// 类型安全的 API 层 - 运行时演示

console.log('=== 1. 类型安全的 API 客户端 ===');

// ==========================================
// 1. 端点定义（运行时模拟 TypeScript 类型）
// ==========================================

// 定义端点（TypeScript 中会有精确类型，这里用对象模拟）
var endpoints = {
  users: {
    list: { method: 'GET', path: '/users', query: ['page', 'limit'] },
    get: { method: 'GET', path: '/users/:id', params: ['id'] },
    create: { method: 'POST', path: '/users', body: true },
    update: { method: 'PUT', path: '/users/:id', params: ['id'], body: true },
    remove: { method: 'DELETE', path: '/users/:id', params: ['id'] },
  },
  posts: {
    list: { method: 'GET', path: '/users/:userId/posts', params: ['userId'], query: ['page'] },
    get: { method: 'GET', path: '/posts/:id', params: ['id'] },
    create: { method: 'POST', path: '/posts', body: true },
  },
};

// 模拟数据
var mockDb = {
  users: [
    { id: 1, name: 'Alice', email: 'a***@example.com' },
    { id: 2, name: 'Bob', email: 'b***@example.com' },
  ],
  posts: [
    { id: 1, userId: 1, title: 'Hello', content: 'World' },
    { id: 2, userId: 1, title: 'TypeScript', content: 'is awesome' },
  ],
};

// 模拟 fetch（实际项目中使用真实 fetch，这里用 mock 返回）
function mockFetch(url, options) {
  console.log('  [Fetch] ' + (options && options.method || 'GET') + ' ' + url);
  if (options && options.body) {
    console.log('  [Fetch] Body:', options.body);
  }

  return new Promise(function(resolve) {
    setTimeout(function() {
      // 简单路由匹配
      var path = url.split('?')[0];
      var method = (options && options.method) || 'GET';

      if (path === '/users' && method === 'GET') {
        var urlObj = new URL(url, 'http://localhost');
        var page = parseInt(urlObj.searchParams.get('page') || '1');
        var limit = parseInt(urlObj.searchParams.get('limit') || '10');
        var start = (page - 1) * limit;
        resolve({
          ok: true,
          status: 200,
          json: function() {
            return Promise.resolve({ data: mockDb.users.slice(start, start + limit), total: mockDb.users.length, page: page, limit: limit });
          }
        });
      } else if (path.match(/^\\/users\\/\\d+$/) && method === 'GET') {
        var id = parseInt(path.split('/').pop());
        var user = mockDb.users.find(function(u) { return u.id === id; });
        resolve({
          ok: !!user,
          status: user ? 200 : 404,
          json: function() {
            return Promise.resolve(user || { error: 'User not found' });
          }
        });
      } else if (path === '/users' && method === 'POST') {
        var body = JSON.parse(options.body);
        var newUser = { id: mockDb.users.length + 1, name: body.name, email: body.email };
        mockDb.users.push(newUser);
        resolve({
          ok: true,
          status: 201,
          json: function() { return Promise.resolve(newUser); }
        });
      } else if (path.match(/^\\/users\\/\\d+\\/posts$/) && method === 'GET') {
        var userId = parseInt(path.split('/')[2]);
        var userPosts = mockDb.posts.filter(function(p) { return p.userId === userId; });
        resolve({
          ok: true,
          status: 200,
          json: function() { return Promise.resolve({ data: userPosts }); }
        });
      } else if (path.match(/^\\/posts\\/\\d+$/) && method === 'GET') {
        var postId = parseInt(path.split('/').pop());
        var post = mockDb.posts.find(function(p) { return p.id === postId; });
        resolve({
          ok: !!post,
          status: post ? 200 : 404,
          json: function() { return Promise.resolve(post || { error: 'Post not found' }); }
        });
      } else {
        resolve({
          ok: false,
          status: 404,
          json: function() { return Promise.resolve({ error: 'Not found' }); }
        });
      }
    }, 5);
  });
}

// ==========================================
// 2. 类型安全的 API Client 实现
// ==========================================

function createApiClient(baseURL) {
  if (baseURL === void 0) baseURL = '';
  var _interceptors = { request: [], response: [] };
  var _headers = { 'Content-Type': 'application/json' };

  // 构建 URL（替换路径参数）
  function buildUrl(path, params, query) {
    var url = path;
    // 替换 :param 占位符
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          url = url.replace(':' + key, encodeURIComponent(String(params[key])));
        }
      }
    }
    // 添加查询参数
    if (query) {
      var qsParts = [];
      for (var k in query) {
        if (query.hasOwnProperty(k) && query[k] !== undefined && query[k] !== null) {
          qsParts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(query[k])));
        }
      }
      var qs = qsParts.join('&');
      if (qs) url += '?' + qs;
    }
    return baseURL + url;
  }

  // 核心请求函数（在 TypeScript 中是泛型的）
  function request(method, path, options) {
    if (options === void 0) options = {};
    var url = buildUrl(path, options.params, options.query);
    var config = {
      method: method,
      headers: Object.assign({}, _headers, options.headers),
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    // 运行拦截器（request）
    var interceptedConfig = config;
    for (var i = 0; i < _interceptors.request.length; i++) {
      interceptedConfig = _interceptors.request[i](interceptedConfig) || interceptedConfig;
    }

    return mockFetch(url, interceptedConfig).then(async function(response) {
      var data = await response.json();
      var result = { response: response, data: data };

      // 运行拦截器（response）
      for (var j = 0; j < _interceptors.response.length; j++) {
        result = _interceptors.response[j](result) || result;
      }

      if (!response.ok) {
        var error = new Error('API Error: ' + response.status);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    });
  }

  return {
    get: function(path, options) { return request('GET', path, options); },
    post: function(path, options) { return request('POST', path, options); },
    put: function(path, options) { return request('PUT', path, options); },
    delete: function(path, options) { return request('DELETE', path, options); },

    // 拦截器
    interceptors: {
      request: {
        use: function(fn) { _interceptors.request.push(fn); }
      },
      response: {
        use: function(fn) { _interceptors.response.push(fn); }
      },
    },

    // 设置默认 header
    setHeader: function(key, value) { _headers[key] = value; },
  };
}

var api = createApiClient('');

// 添加请求拦截器（添加 auth token）
api.interceptors.request.use(function(config) {
  console.log('  [Interceptor] 添加 Authorization header');
  config.headers['Authorization'] = 'Bearer mock-token-123';
  return config;
});

// 添加响应拦截器（统一日志）
api.interceptors.response.use(function(result) {
  console.log('  [Interceptor] 响应状态:', result.response.status);
  return result;
});

// 2.1 类型安全的端点调用函数（类似 openapi-typescript-codegen 生成的代码）
var UsersApi = {
  list: function(query) {
    return api.get('/users', { query: query });
  },
  get: function(params) {
    return api.get('/users/:id', { params: params });
  },
  create: function(body) {
    return api.post('/users', { body: body });
  },
};

var PostsApi = {
  list: function(params, query) {
    return api.get('/users/:userId/posts', { params: params, query: query });
  },
  get: function(params) {
    return api.get('/posts/:id', { params: params });
  },
};

// 测试 API 调用
async function runApiDemo() {
  console.log('\\n--- 获取用户列表 ---');
  var usersResult = await UsersApi.list({ page: 1, limit: 10 });
  console.log('结果:', usersResult);

  console.log('\\n--- 获取单个用户 ---');
  var userResult = await UsersApi.get({ id: 1 });
  console.log('结果:', userResult);

  console.log('\\n--- 创建用户 ---');
  var newUser = await UsersApi.create({ name: 'Charlie', email: 'c***@example.com' });
  console.log('创建结果:', newUser);

  console.log('\\n--- 获取用户文章 ---');
  var postsResult = await PostsApi.list({ userId: 1 });
  console.log('结果:', postsResult);

  console.log('\\n--- 测试 404 错误 ---');
  try {
    await UsersApi.get({ id: 999 });
  } catch(e) {
    console.log('捕获错误: status=' + e.status + ', data=' + JSON.stringify(e.data));
  }
}

// 运行异步演示
runApiDemo().then(function() {
  // 继续后面的同步演示
  runAfterApiDemo();
});

function runAfterApiDemo() {

// ==========================================
// 3. Result/Either 错误处理模式
// ==========================================

console.log('\\n=== 2. Result/Either 错误处理模式 ===');

// Result 类型模拟
// TypeScript: type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E }
function Ok(data) { return { ok: true, data: data }; }
function Err(error) { return { ok: false, error: error }; }

// 安全的 API 调用包装
async function safeApiCall(fn) {
  try {
    var data = await fn();
    return Ok(data);
  } catch(e) {
    return Err(e);
  }
}

async function demonstrateResult() {
  console.log('\\n使用 Result 模式调用 API:');

  var result1 = await safeApiCall(function() { return UsersApi.get({ id: 1 }); });
  if (result1.ok) {
    console.log('✅ 成功获取用户:', result1.data.name);
  } else {
    console.log('❌ 失败:', result1.error.message);
  }

  var result2 = await safeApiCall(function() { return UsersApi.get({ id: 999 }); });
  if (result2.ok) {
    console.log('✅ 成功:', result2.data);
  } else {
    console.log('❌ 失败（预期）: status=' + result2.error.status);
  }
}

demonstrateResult().then(function() {
  runAfterResultDemo();
});

}

function runAfterResultDemo() {

// ==========================================
// 4. React Query 风格的 Query Keys
// ==========================================

console.log('\\n=== 3. React Query 风格 Query Keys ===');

// Query Key 工厂（确保类型安全的 query key）
var queryKeys = {
  all: ['users'],
  lists: function() { return [].concat(queryKeys.all, ['list']); },
  list: function(filters) {
    return [].concat(queryKeys.lists(), [filters]);
  },
  details: function() { return [].concat(queryKeys.all, ['detail']); },
  detail: function(id) {
    return [].concat(queryKeys.details(), [id]);
  },
};

console.log('users.all:', queryKeys.all);
console.log('users.list({ page: 1 }):', queryKeys.list({ page: 1 }));
console.log('users.detail(1):', queryKeys.detail(1));

// 模拟 queryOptions（React Query 5 的模式）
function createQueryOptions(key, queryFn, options) {
  return Object.assign({ queryKey: key, queryFn: queryFn }, options);
}

var userQueries = {
  list: function(filters) {
    return createQueryOptions(
      queryKeys.list(filters),
      function() { return UsersApi.list(filters); },
      { staleTime: 5 * 60 * 1000 }
    );
  },
  detail: function(id) {
    return createQueryOptions(
      queryKeys.detail(id),
      function() { return UsersApi.get({ id: id }); },
      { staleTime: 5 * 60 * 1000 }
    );
  },
};

var userListQuery = userQueries.list({ page: 1, limit: 20 });
console.log('\\nuserQueries.list({ page: 1 }):', JSON.stringify(userListQuery, null, 2).replace(/"queryFn".*/, '"queryFn": [Function]'));

// ==========================================
// 5. 路径参数提取（类型概念演示）
// ==========================================

console.log('\\n=== 4. 路径参数处理演示 ===');

// 运行时路径参数提取
function extractPathParams(path) {
  var regex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  var params = [];
  var match;
  while ((match = regex.exec(path)) !== null) {
    params.push(match[1]);
  }
  return params;
}

// TypeScript 类型概念：
// type ExtractPathParams<T extends string> =
//   T extends \`:\${infer Param}/\${infer Rest}\` ? Param | ExtractPathParams<Rest> :
//   T extends \`:\${infer Param}\` ? Param :
//   T extends \`\${string}/\${infer Rest}\` ? ExtractPathParams<Rest> :
//   never;

var paths = [
  '/users',
  '/users/:id',
  '/users/:userId/posts/:postId',
  '/api/v1/organizations/:orgId/members/:memberId',
];

paths.forEach(function(path) {
  var params = extractPathParams(path);
  console.log('  路径 "' + path + '" 的参数:', params.length > 0 ? params : '(无)');
});

console.log('\\n✅ 类型安全的 API 层演示完成！');
console.log('\\n本章总结:');
console.log('- 泛型 API 客户端自动推断请求/响应类型');
console.log('- 路径参数、查询参数、请求体都有类型检查');
console.log('- 拦截器统一处理认证、日志等横切关注点');
console.log('- Result/Either 模式强制处理错误情况');
console.log('- Query Key 工厂确保 React Query 的 key 类型安全');
console.log('- OpenAPI/GraphQL/tRPC 提供自动类型同步');
console.log('- Next.js Server Actions 实现端到端类型安全');
console.log('- 运行时验证(zod)补充编译时类型检查');

}
`
  },
  {
    id: "ts3-react-advanced-patterns",
    title: "React 高级模式",
    icon: "🎨",
    group: "React 与 TypeScript",
    content: `# React 高级模式

在掌握了 React 和 TypeScript 的基础后，学习高级模式可以帮助你构建更灵活、更可复用、更优雅的组件。本章将深入讲解复合组件、高阶组件、Render Props、受控/非受控模式、Headless 组件、Slot 模式等高级模式，并探讨 Next.js App Router 中的 Server Components 和 Suspense/ErrorBoundary 的类型安全。

## 一、复合组件模式（Compound Components）

复合组件是一种通过隐式状态共享来组合多个相关组件的模式，最经典的例子是 HTML 的 <select> 和 <option>，以及 React 中的 Tabs、Menu、Accordion 等组件。

### 1.1 Context 驱动的复合组件

复合组件通常使用 Context 在父组件和子组件之间共享状态，而不需要通过 props 层层传递。父组件（如 Tabs）创建 Context，子组件（如 Tabs.List、Tabs.Tab、Tabs.Panel）通过 useContext 访问共享状态。

### 1.2 类型安全的复合组件

在 TypeScript 中，复合组件需要精确的类型设计。父组件应该是一个组件函数，同时它的属性（静态属性）是子组件。每个子组件的 props 类型应该独立定义。例如：

\`\`\`tsx
interface TabsProps { defaultValue?: string; children: ReactNode }  // 定义接口 TabsProps
interface TabsComponent extends FC<TabsProps> {  // 定义接口 TabsComponent，extends FC<TabsProps>
  List: FC<TabsListProps>;
  Tab: FC<TabsTabProps>;
  Panels: FC<TabsPanelsProps>;
  Panel: FC<TabsPanelProps>;
}
const Tabs = TabsBase as TabsComponent;  // 声明常量 Tabs（注意：类型断言会绕过类型检查）
Tabs.List = TabsList;  // 赋值 Tabs.List
Tabs.Tab = TabsTab;  // 赋值 Tabs.Tab
// ...
\`\`\`

### 1.3 点语法使用

使用复合组件时，通过点语法访问子组件（<Tabs.List>、<Tabs.Trigger>），这既清晰又提供了命名空间隔离。TypeScript 能正确推断每个子组件的 props 类型。

## 二、高阶组件（HOC）类型

高阶组件是接收组件并返回新组件的函数。虽然 Hooks 出现后 HOC 的使用减少了，但在某些场景下仍然有用（如路由守卫、权限控制、数据注入等）。

### 2.1 HOC 的类型挑战

HOC 的类型难点在于：需要推断被包裹组件的 props 类型，减去 HOC 注入的 props，然后确保返回的组件接受剩余的 props。使用 TypeScript 的泛型和工具类型（如 Omit、ComponentProps）可以实现这一点。

### 2.2 注入 Props 的 HOC

例如，withUser HOC 向组件注入 user 属性。类型定义应该是：接收一个需要 user prop 的组件，返回一个不需要 user prop 的组件。这通过 Omit<P, 'user'> 来实现。

### 2.3 条件 HOC 和泛型 HOC

HOC 也可以是泛型的，接收配置参数返回一个特定的 HOC。例如 withAuth(requiredRole) 返回一个检查角色的 HOC。这种情况下，外层函数接收配置，内层函数接收组件。

## 三、受控与非受控模式

组件可以是受控（父组件管理状态）、非受控（自己管理状态）、或两者皆可（通过指定 value/defaultValue）。

### 3.1 useControllableState

Radix UI 等库使用 useControllableState Hook 来处理这种模式。该 Hook 接收受控值（如果有）、默认值（非受控时使用）、和 onChange 回调，返回当前值和更新函数。类型定义需要正确处理受控和非受控的情况。

### 3.2 类型设计

受控组件的 props 类型中，value 和 onChange 是一组（都必须提供），defaultValue 是独立的。可以使用可辨识联合来区分受控和非受控模式，确保类型安全。

## 四、Render Props 与 Prop Getters

### 4.1 Render Props 模式

Render Props 通过一个值为函数的 prop 来共享 UI 逻辑。类型安全的关键是为 render prop 函数提供精确的参数类型。例如，<Toggle children={({ on, toggle }) => ...} /> 中，children 函数的参数类型是 { on: boolean; toggle: () => void }。

### 4.2 Prop Getters 模式

Prop Getters 是 Headless UI 库（如 Downshift、React Table）使用的模式：Hook 返回一组"prop getter"函数，每个函数返回需要Spread到对应元素上的props。这种模式比 render props 更灵活，因为调用方可以控制渲染结构。

例如，useToggleReturn 可能包含 getButtonProps()、getInputProps() 等方法，每个返回 onClick、onChange、aria 属性等。

## 五、Headless 组件与 Hook-only 组件

### 5.1 Headless 组件概念

Headless 组件（也称为逻辑组件、renderless 组件）只提供行为和可访问性，不提供任何 UI 渲染。它们通过 Hook 的形式暴露逻辑，开发者完全控制 UI。典型例子包括 react-hook-form 的 useForm、Downshift 的 useCombobox、Radix UI 的 Slot 等。

### 5.2 类型安全的 Headless Hooks

Headless Hook 的返回类型设计很重要。通常返回状态值、操作函数、和 prop getters。每个 prop getter 函数的返回类型应该是对应 HTML 元素的 props 类型（如 React.ButtonHTMLAttributes<HTMLButtonElement>）。

### 5.3 useDisclosure 示例

useDisclosure 是一个经典的 Headless Hook，管理打开/关闭状态（如 Modal、Popover、Tooltip）。它返回 { isOpen, open, close, toggle, getButtonProps, getDisclosureProps }，每个都有精确的类型。

## 六、Slot 模式与 asChild

### 6.1 asChild 模式（Radix UI 风格）

asChild 是 Radix UI 推广的模式，允许用户将组件的渲染"委托"给子元素。例如 <Slot asChild><a href="/">Link</a></Slot> 会将 Slot 的 props 合并到子元素上，而不是包裹额外的 DOM 元素。这比 as prop 更灵活，因为它允许你将组件的行为附加到任何元素上。

### 6.2 Slot 实现类型

Slot 组件需要正确合并 props（事件处理函数合并、className 合并、style 合并等），类型上需要接收子元素类型，并将自己的 props 与子元素 props 合并。

## 七、Next.js Server Components 类型

Next.js App Router 引入了 React Server Components，这改变了组件的类型模型。

### 7.1 Server Component vs Client Component

Server Components 不使用 Hooks、没有状态、不接收事件处理函数作为 props。Client Components 使用 'use client' 指令，可以使用所有 React 功能。TypeScript 可以通过区分 ServerProps 和 ClientProps 来帮助标记这种差异。

### 7.2 Server Actions 类型

Server Actions（标记为 'use server' 的异步函数）可以从客户端调用，它们的类型自动在服务器和客户端之间共享。参数必须是可序列化的（JSON-serializable），TypeScript 可以帮助标记不可序列化的类型。

### 7.3 异步组件类型

Server Components 可以是 async 函数，直接在组件中 await 数据。这种模式下，组件 props 类型不变，但返回的是 Promise<JSX.Element>。

## 八、Suspense 与 ErrorBoundary 类型

### 8.1 Suspense 边界类型

Suspense 组件的 fallback prop 接受 ReactNode，children 可以是使用 use、lazy 或支持 Suspense 的数据获取库的组件。use Hook 接受 Promise 或 Context，返回 resolved 值。

### 8.2 ErrorBoundary 类型

Error Boundaries 是类组件（函数组件目前不支持），需要定义 componentDidCatch 和 getDerivedStateFromError。类型上，ErrorBoundary 的 props 包括 fallback（ReactNode 或函数）和 children，以及 onError 回调。

react-error-boundary 库提供了类型安全的 useErrorBoundary Hook 和 ErrorBoundary 组件。

### 8.3 数据加载状态类型

结合 Suspense 和 ErrorBoundary，可以使用可辨识联合来表达数据加载状态：{ status: 'pending' } | { status: 'success'; data: T } | { status: 'error'; error: Error }。React 的 use() Hook 会在 pending 时抛出 Promise，让 Suspense 捕获。

## 九、高级模式类型最佳实践

1. 复合组件使用 Context 共享状态，通过静态属性和类型接口组织子组件
2. HOC 使用泛型 + Omit/ComponentProps 正确推断注入后的 props
3. useControllableState 实现受控/非受控双模组件
4. Prop Getters 模式比 render props 更灵活，类型安全地提供元素 props
5. Headless Hooks 返回状态、方法、prop getters，完全分离逻辑和 UI
6. asChild/Slot 模式允许用户自定义渲染元素，灵活且类型安全
7. Server Components 不需要 'use client'，不使用浏览器 API，类型上体现这一点
8. ErrorBoundary 使用类型安全的 fallback render props 和错误类型
9. 利用 TypeScript 的可辨识联合来精确建模组件状态（如 Disclosure 的 open/closed）
10. 高级模式不要过度使用——简单的 props 传递通常比复杂模式更易维护

掌握这些高级模式，你可以构建出类似 Radix UI、Headless UI 等专业组件库级别的类型安全组件，为用户提供极致的开发体验。
`,
    code: `"use strict";
// React 高级模式 - 运行时演示

// 模拟 React 元素创建
function h(type, props) {
  var children = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    var child = arguments[_i];
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) {
      for (var _j = 0; _j < child.length; _j++) {
        if (child[_j] != null && child[_j] !== false) children.push(child[_j]);
      }
    } else {
      children.push(child);
    }
  }
  return {
    type: type,
    props: Object.assign({}, props || {}, { children: children.length === 1 ? children[0] : children.length > 0 ? children : undefined }),
    key: null,
  };
}

console.log('=== 1. 复合组件模式（Compound Components）===');

// ==========================================
// 1. Tabs 复合组件实现
// ==========================================

// 简单的 Context 模拟
var currentTabContext = { value: undefined, setValue: function() {}, _active: false };

function createTabsContext(defaultValue) {
  var state = { value: defaultValue };
  var listeners = [];
  return {
    getValue: function() { return state.value; },
    setValue: function(v) {
      state.value = v;
      listeners.forEach(function(fn) { return fn(v); });
    },
    subscribe: function(fn) { listeners.push(fn); return function() { listeners = listeners.filter(function(l) { return l !== fn; }); }; },
  };
}

// Tabs 父组件
function Tabs(props) {
  var children = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    children[_i - 1] = arguments[_i];
  }
  if (!Tabs._currentContext || Tabs._currentContext.getValue() !== (props && props.defaultValue)) {
    Tabs._currentContext = createTabsContext(props && props.defaultValue);
  }
  return h('div', { className: 'tabs', 'data-default-value': props && props.defaultValue }, children);
}

// Tabs.List 子组件
function TabsList(props) {
  var children = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    children[_i - 1] = arguments[_i];
  }
  return h('div', { className: 'tabs-list', role: 'tablist' }, children);
}

// Tabs.Trigger 子组件
function TabsTrigger(props) {
  var children = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    children[_i - 1] = arguments[_i];
  }
  var ctx = Tabs._currentContext;
  var isActive = ctx.getValue() === (props && props.value);
  return h('button', {
    className: 'tabs-trigger' + (isActive ? ' active' : ''),
    role: 'tab',
    'aria-selected': isActive,
    'data-state': isActive ? 'active' : 'inactive',
    onClick: function() { ctx.setValue(props.value); },
  }, children);
}

// Tabs.Content 子组件
function TabsContent(props) {
  var children = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    children[_i - 1] = arguments[_i];
  }
  var ctx = Tabs._currentContext;
  var isActive = ctx.getValue() === (props && props.value);
  if (!isActive) return null;
  return h('div', { className: 'tabs-content', role: 'tabpanel', 'data-state': 'active' }, children);
}

// 组装复合组件（设置静态属性）
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

// 使用复合组件
// 注意：由于 JS 实参在函数调用前求值，需要先设置 Context
Tabs._currentContext = createTabsContext('tab1');
var tabsElement = Tabs(
  { defaultValue: 'tab1' },
  Tabs.List(null,
    Tabs.Trigger({ value: 'tab1' }, 'Account'),
    Tabs.Trigger({ value: 'tab2' }, 'Password'),
    Tabs.Trigger({ value: 'tab3' }, 'Settings'),
  ),
  Tabs.Content({ value: 'tab1' }, 'Account settings content...'),
  Tabs.Content({ value: 'tab2' }, 'Change password content...'),
  Tabs.Content({ value: 'tab3' }, 'Preferences content...'),
);
console.log('Tabs 复合组件:', JSON.stringify(tabsElement, null, 2));
console.log('初始激活的 tab:', Tabs._currentContext.getValue());
Tabs._currentContext.setValue('tab2');
console.log('切换到 tab2 后，激活值:', Tabs._currentContext.getValue());

// ==========================================
// 2. HOC（高阶组件）演示
// ==========================================

console.log('\\n=== 2. 高阶组件（HOC）===');

// withUser HOC - 向组件注入 user prop
// TypeScript: function withUser<P extends { user: User }>(Component: ComponentType<P>): FC<Omit<P, 'user'>>
function withUser(Component) {
  var WrappedComponent = function(props) {
    // 模拟从 Context 获取 user
    var user = { id: 1, name: 'Alice', role: 'admin' };
    var mergedProps = Object.assign({}, props, { user: user });
    return Component(mergedProps);
  };
  WrappedComponent.displayName = 'withUser(' + (Component.displayName || Component.name) + ')';
  return WrappedComponent;
}

// withAuth HOC - 带参数的 HOC，检查权限
function withAuth(requiredRole) {
  return function(Component) {
    var WrappedComponent = function(props) {
      var user = props.user || { id: 0, name: 'Guest', role: 'guest' };
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return h('div', { className: 'forbidden' }, 'Access denied. Required role: ' + requiredRole);
      }
      return Component(props);
    };
    WrappedComponent.displayName = 'withAuth(' + requiredRole + ')(' + (Component.displayName || Component.name) + ')';
    return WrappedComponent;
  };
}

// 基础组件
function UserProfile(props) {
  return h('div', { className: 'user-profile' },
    h('h2', null, 'Profile'),
    h('p', null, 'Name: ' + props.user.name),
    h('p', null, 'Role: ' + props.user.role)
  );
}

function AdminPanel(props) {
  return h('div', { className: 'admin-panel' },
    h('h2', null, 'Admin Panel'),
    h('p', null, 'Welcome ' + props.user.name + '!'),
    h('button', null, 'Manage Users')
  );
}

// 使用 HOC
var UserProfileWithUser = withUser(UserProfile);
var ProtectedAdminPanel = withUser(withAuth('admin')(AdminPanel));

console.log('UserProfile (withUser):', JSON.stringify(UserProfileWithUser({}), null, 2));
console.log('\\nAdminPanel (withUser + withAuth admin):', JSON.stringify(ProtectedAdminPanel({}), null, 2));

// 测试非 admin 用户
var GuestAdminPanel = withAuth('admin')(AdminPanel);
console.log('\\nGuest 访问 AdminPanel:', JSON.stringify(GuestAdminPanel({ user: { name: 'Guest', role: 'guest' } }), null, 2));

// ==========================================
// 3. 受控/非受控模式 (useControllableState)
// ==========================================

console.log('\\n=== 3. 受控/非受控模式 (useControllableState) ===');

// 模拟 useControllableState
// TypeScript: function useControllableState<T>(controlledValue?: T, defaultValue?: T, onChange?: (value: T) => void): [T, (value: T) => void]
function createControllableState(options) {
  var controlledValue = options.prop;
  var defaultValue = options.defaultProp;
  var onChange = options.onChange;
  var isControlled = controlledValue !== undefined;
  var internalValue = defaultValue;

  function getValue() {
    return isControlled ? controlledValue : internalValue;
  }

  function setValue(nextValue) {
    if (!isControlled) {
      internalValue = nextValue;
    }
    if (onChange) {
      onChange(nextValue);
    }
    console.log('  [ControllableState] ' + (isControlled ? '(受控)' : '(非受控)') + ' 设置值:', nextValue);
  }

  return { getValue: getValue, setValue: setValue, isControlled: isControlled };
}

// 非受控模式
var uncontrolledState = createControllableState({
  defaultProp: false,
  onChange: function(v) { console.log('  onChange 回调:', v); }
});
console.log('非受控模式初始值:', uncontrolledState.getValue());
uncontrolledState.setValue(true);
console.log('设置后值:', uncontrolledState.getValue());
uncontrolledState.setValue(false);

// 受控模式
var controlledValue = 'option1';
var controlledState = createControllableState({
  prop: controlledValue,
  onChange: function(v) {
    console.log('  受控模式 onChange（需要外部更新 prop）:', v);
    // 在真实 React 中，这里会 setControlledValue(v)
  }
});
console.log('\\n受控模式初始值:', controlledState.getValue());
controlledState.setValue('option2');
console.log('设置后值（受控模式下不变，等待外部更新）:', controlledState.getValue());

// ==========================================
// 4. Render Props 与 Prop Getters 模式
// ==========================================

console.log('\\n=== 4. Render Props & Prop Getters ===');

// 4.1 Render Props 示例 - Toggle
function ToggleRenderProps(props) {
  // 模拟 state
  var state = { on: false };
  function toggle() { state.on = !state.on; }
  var api = { on: state.on, toggle: toggle };
  return h('div', { className: 'toggle' }, props.children(api));
}

var toggleRenderProps = ToggleRenderProps({
  children: function(api) {
    return h('button', {
      onClick: api.toggle,
      'aria-pressed': api.on,
    }, api.on ? 'ON' : 'OFF');
  }
});
console.log('Toggle (render props):', JSON.stringify(toggleRenderProps, null, 2));

// 4.2 Prop Getters 模式（类似 react-hook-form / Downshift）
function useDisclosure(initial) {
  if (initial === void 0) initial = false;
  var isOpen = initial;

  function open() { isOpen = true; }
  function close() { isOpen = false; }
  function toggle() { isOpen = !isOpen; }

  // Prop Getter: 返回按钮应该接收的 props
  function getTriggerProps(customProps) {
    return Object.assign({
      'aria-expanded': isOpen,
      'aria-controls': 'disclosure-content',
      onClick: toggle,
    }, customProps || {});
  }

  // Prop Getter: 返回内容区域应该接收的 props
  function getContentProps(customProps) {
    return Object.assign({
      id: 'disclosure-content',
      role: 'region',
      hidden: !isOpen,
    }, customProps || {});
  }

  return {
    isOpen: isOpen,
    open: open,
    close: close,
    toggle: toggle,
    getTriggerProps: getTriggerProps,
    getContentProps: getContentProps,
  };
}

var disclosure = useDisclosure(false);
console.log('Disclosure 初始 isOpen:', disclosure.isOpen);

var triggerProps = disclosure.getTriggerProps({ className: 'my-trigger', 'data-testid': 'trigger' });
console.log('getTriggerProps() 返回:', triggerProps);

var contentProps = disclosure.getContentProps();
console.log('getContentProps() 返回:', contentProps);

disclosure.open();
console.log('调用 open() 后 isOpen:', disclosure.isOpen);
var contentPropsOpen = disclosure.getContentProps();
console.log('getContentProps() 现在 hidden:', contentPropsOpen.hidden);

// ==========================================
// 5. Slot / asChild 模式
// ==========================================

console.log('\\n=== 5. Slot / asChild 模式（Radix UI 风格）===');

// 简化版 Slot 实现 - 将 props 合并到子元素上
function Slot(props) {
  var children = props.children, restProps = {};
  for (var key in props) {
    if (key !== 'children' && key !== 'asChild') {
      restProps[key] = props[key];
    }
  }

  // 如果 children 是单个元素，将 props 合并到它上面
  if (children && typeof children === 'object' && !Array.isArray(children)) {
    var mergedProps = Object.assign({}, children.props);
    // 合并 className
    if (restProps.className && children.props.className) {
      mergedProps.className = restProps.className + ' ' + children.props.className;
    } else if (restProps.className) {
      mergedProps.className = restProps.className;
    }
    // 合并事件处理函数
    ['onClick', 'onChange', 'onFocus', 'onBlur'].forEach(function(eventName) {
      var childHandler = children.props[eventName];
      var slotHandler = restProps[eventName];
      if (childHandler && slotHandler) {
        mergedProps[eventName] = function(e) {
          slotHandler(e);
          childHandler(e);
        };
      } else if (slotHandler) {
        mergedProps[eventName] = slotHandler;
      }
    });
    // 复制其他 props
    for (var k in restProps) {
      if (!['className', 'onClick', 'onChange', 'onFocus', 'onBlur'].includes(k)) {
        mergedProps[k] = restProps[k];
      }
    }
    return Object.assign({}, children, { props: mergedProps });
  }
  // 如果没有 asChild 或 children 不是元素，直接渲染为 div
  return h('div', restProps, children);
}

// 示例：TooltipTrigger 使用 asChild，将 tooltip 行为附加到自定义元素
function TooltipProvider(props) {
  // 模拟 tooltip 状态和行为
  var triggerProps = {
    'data-state': 'closed',
    onMouseEnter: function() { console.log('  [Tooltip] mouse enter → show'); },
    onMouseLeave: function() { console.log('  [Tooltip] mouse leave → hide'); },
  };
  return h(Slot, Object.assign({}, triggerProps, { className: 'tooltip-trigger' }), props.children);
}

// 使用 asChild/slot：将 tooltip 行为附加到 a 标签上，而不是包裹额外元素
var tooltipLink = TooltipProvider({
  children: h('a', { href: '/settings', className: 'nav-link' }, 'Settings')
});
console.log('Slot 将 tooltip props 合并到 <a> 上:', JSON.stringify(tooltipLink, null, 2));
console.log('注意：type 是 "a" 而不是额外的包裹元素，className 合并了 "tooltip-trigger" 和 "nav-link"');

// ==========================================
// 6. ErrorBoundary 演示
// ==========================================

console.log('\\n=== 6. ErrorBoundary 概念演示 ===');

// Error Boundary 在 React 中是类组件，这里用工厂函数模拟
function createErrorBoundary(options) {
  var fallback = options.fallback;
  var onError = options.onError;
  var hasError = false;
  var error = null;

  return {
    run: function(renderFn) {
      if (hasError) {
        if (typeof fallback === 'function') {
          return fallback({ error: error, resetErrorBoundary: function() { hasError = false; error = null; } });
        }
        return fallback;
      }
      try {
        return renderFn();
      } catch(e) {
        hasError = true;
        error = e;
        if (onError) onError(e);
        if (typeof fallback === 'function') {
          return fallback({ error: e, resetErrorBoundary: function() { hasError = false; error = null; } });
        }
        return fallback;
      }
    }
  };
}

var boundary = createErrorBoundary({
  fallback: function(_ref) {
    var error = _ref.error, reset = _ref.resetErrorBoundary;
    return h('div', { className: 'error-boundary', role: 'alert' },
      h('p', null, 'Something went wrong: ' + error.message),
      h('button', { onClick: reset }, 'Try again')
    );
  },
  onError: function(err) { console.log('  [ErrorBoundary] Caught error:', err.message); }
});

// 模拟正常渲染
var normalRender = boundary.run(function() {
  return h('div', null, 'Content loaded successfully');
});
console.log('正常渲染:', JSON.stringify(normalRender, null, 2));

// 模拟组件抛出错误
var errorRender = boundary.run(function() {
  throw new Error('Failed to fetch data');
});
console.log('\\n错误渲染:', JSON.stringify(errorRender, null, 2));

// ==========================================
// 7. 可辨识联合的组件状态
// ==========================================

console.log('\\n=== 7. 可辨识联合组件状态（异步数据加载模式）===');

// TypeScript 中:
// type AsyncState<T> =
//   | { status: 'idle' }
//   | { status: 'loading' }
//   | { status: 'success'; data: T }
//   | { status: 'error'; error: Error }

function renderAsyncState(state) {
  switch (state.status) {
    case 'idle':
      return h('div', { className: 'async-idle' }, '等待加载...');
    case 'loading':
      return h('div', { className: 'async-loading', role: 'status' }, '加载中...');
    case 'success':
      return h('div', { className: 'async-success' },
        h('h3', null, '数据加载成功'),
        h('pre', null, JSON.stringify(state.data, null, 2))
      );
    case 'error':
      return h('div', { className: 'async-error', role: 'alert' },
        h('p', null, '加载失败: ' + state.error.message),
        h('button', null, '重试')
      );
    default:
      throw new Error('Unknown status: ' + state.status);
  }
}

var idleView = renderAsyncState({ status: 'idle' });
console.log('idle 状态:', idleView.props.className);

var loadingView = renderAsyncState({ status: 'loading' });
console.log('loading 状态:', loadingView.props.className);

var successView = renderAsyncState({ status: 'success', data: { id: 1, name: 'Alice' } });
console.log('success 状态:', successView.props.className);

var errorView = renderAsyncState({ status: 'error', error: new Error('Network error') });
console.log('error 状态:', errorView.props.className);

// Headless 组件的状态机示例（Combobox 模式）
var ComboboxState;
(function(ComboboxState) {
  ComboboxState['Idle'] = 'idle';
  ComboboxState['Opening'] = 'opening';
  ComboboxState['Open'] = 'open';
  ComboboxState['Closing'] = 'closing';
  ComboboxState['Closed'] = 'closed';
})(ComboboxState || (ComboboxState = {}));

console.log('\\nCombobox 状态机状态:', ComboboxState);

console.log('\\n✅ React 高级模式演示完成！');
console.log('\\n本章总结:');
console.log('- 复合组件：Context 共享状态，静态属性组织子组件，点语法使用');
console.log('- HOC：泛型 + Omit/ComponentProps 正确推断 props 类型');
console.log('- useControllableState：同时支持受控和非受控模式');
console.log('- Prop Getters：返回元素需要的 props，比 render props 更灵活');
console.log('- Headless Hooks：逻辑和 UI 完全分离，提供行为和可访问性');
console.log('- Slot/asChild：将组件行为合并到子元素，避免多余 DOM 包裹');
console.log('- ErrorBoundary：类型安全的错误边界和 fallback 渲染');
console.log('- 可辨识联合：精确建模组件状态（idle/loading/success/error）');
`
  }
];


