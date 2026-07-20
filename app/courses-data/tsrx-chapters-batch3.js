export const chapters = [
  {
    id: "tsrx-generic-components",
    group: "类型高级篇",
    icon: "🧬",
    title: "泛型组件与类型推断",
    content: `## 泛型组件与类型推断

泛型是 TypeScript 最强大的特性之一，它允许我们创建可复用的组件，同时保持完整的类型安全。在 React 开发中，泛型组件可以根据传入的数据自动推断类型，避免重复的类型声明，让代码既灵活又安全。

### 泛型箭头函数的逗号消歧问题

在 TSX 文件中写泛型箭头函数时，会遇到 JSX 解析冲突：\`<T>\` 会被解析为 JSX 标签的开始。解决方法是在泛型参数后加一个逗号 \`<T,>\`，或者使用 \`extends\` 约束：

\`\`\`tsx
// ❌ 错误：TSX 中 <T> 会被当成 JSX 标签
const List = <T>(props: { items: T[] }) => {
  return <div>{/* ... */}</div>;
};

// ✅ 方式1：加逗号消歧（最常用）
const List = <T,>(props: { items: T[] }) => {
  return <div>{/* ... */}</div>;
};

// ✅ 方式2：使用 extends 约束（推荐用于需要约束的场景）
const List = <T extends object>(props: { items: T[] }) => {
  return <div>{/* ... */}</div>;
};

// ✅ 方式3：普通函数声明（不存在歧义问题）
function List<T>(props: { items: T[] }) {
  return <div>{/* ... */}</div>;
}
\`\`\`

### 泛型约束与默认参数

使用 \`extends\` 可以约束泛型必须满足特定类型，默认泛型参数可以在未指定时提供 fallback：

\`\`\`tsx
// T extends object 约束 T 必须是对象类型
// 默认泛型参数 <T = string> 在未传泛型时默认为 string
type ButtonProps<T extends object = Record<string, unknown>> = {
  data?: T;
  variant?: 'primary' | 'secondary';
  onClick?: (data: T) => void;
};

// 多泛型参数：T 是数据类型，K 必须是 T 的键名
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: '小明', age: 20 };
const userName = getProperty(user, 'name'); // 类型为 string
const userAge = getProperty(user, 'age');   // 类型为 number
// getProperty(user, 'email'); // ❌ 编译错误：'email' 不是 'name' | 'age'
\`\`\`

### 通用 List 组件实现

一个类型安全的通用列表组件，接受任意类型的 items 和自定义渲染函数：

\`\`\`tsx
import { ReactNode } from 'react';

type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyText?: string;
  className?: string;
};

// 泛型组件：自动推断 item 类型
function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyText = '暂无数据',
  className,
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className="text-gray-500 py-4 text-center">{emptyText}</div>;
  }

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用示例：TypeScript 自动推断 item 是 User 类型
type User = { id: number; name: string; email: string };

function UserList() {
  const users: User[] = [
    { id: 1, name: '小明', email: 'xiaoming@example.com' },
    { id: 2, name: '小红', email: 'xiaohong@example.com' },
  ];

  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}
      renderItem={(user) => (
        <div>
          <span className="font-bold">{user.name}</span>
          <span className="text-gray-500 ml-2">{user.email}</span>
        </div>
      )}
    />
  );
}
\`\`\`

### 通用 Table 与 Select 组件

进一步实现通用表格和选择器组件，利用 \`keyof\` 和映射类型保证列配置的类型安全：

\`\`\`tsx
import { ReactNode, useState } from 'react';

// 通用 Table 列定义
type ColumnDef<T> = {
  key: keyof T;
  title: string;
  width?: number;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T;
};

function Table<T>({ data, columns, rowKey }: TableProps<T>) {
  return (
    <table className="min-w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} className="border p-2 text-left" style={{ width: col.width }}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row[rowKey])}>
            {columns.map((col) => {
              const value = row[col.key];
              return (
                <td key={String(col.key)} className="border p-2">
                  {col.render ? col.render(value, row) : String(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 通用 Select 组件
type Option<T> = { label: string; value: T };

type SelectProps<T> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
};

function Select<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = '请选择',
}: SelectProps<T>) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as T)}
      className="border rounded px-3 py-2"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// 使用示例
type Product = { id: number; name: string; price: number; category: string };

function ProductTable() {
  const products: Product[] = [
    { id: 1, name: 'React 实战', price: 99, category: '图书' },
    { id: 2, name: '机械键盘', price: 399, category: '数码' },
  ];

  const columns: ColumnDef<Product>[] = [
    { key: 'id', title: 'ID', width: 60 },
    { key: 'name', title: '商品名称' },
    { key: 'price', title: '价格', render: (val) => <span className="text-red-500">¥{val}</span> },
    { key: 'category', title: '分类' },
  ];

  return <Table data={products} columns={columns} rowKey="id" />;
}
\`\`\`

### as 多态组件基础（Polymorphic Component）

多态组件允许通过 \`as\` prop 指定渲染的元素类型，并自动推导正确的 props 类型：

\`\`\`tsx
import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type PolymorphicProps<C extends ElementType> = {
  as?: C;
  children?: ReactNode;
} & ComponentPropsWithoutRef<C>;

function Box<C extends ElementType = 'div'>({ as, children, ...rest }: PolymorphicProps<C>) {
  const Component = as || 'div';
  return <Component {...rest}>{children}</Component>;
}

// 使用示例：as='button' 时自动获得 button 的所有原生 props
function PolymorphicDemo() {
  return (
    <div className="space-y-2">
      {/* 渲染为 div */}
      <Box className="p-4 bg-gray-100">这是一个 Box</Box>
      {/* 渲染为 button，自动获得 onClick、type 等 button 属性 */}
      <Box as="button" type="button" onClick={() => alert('点击了!')} className="px-4 py-2 bg-blue-500 text-white rounded">
        点击按钮
      </Box>
      {/* 渲染为 a 标签，自动获得 href、target 等属性 */}
      <Box as="a" href="https://react.dev" target="_blank" className="text-blue-500 underline">
        前往 React 官网
      </Box>
    </div>
  );
}
\`\`\`

泛型组件是构建类型安全 UI 库的基石，掌握泛型约束、类型推断和多态模式，可以让你的组件具备极高的复用性和灵活性。
`,
  },
  {
    id: "tsrx-children-types",
    group: "类型高级篇",
    icon: "👶",
    title: "Children类型深度",
    content: `## Children 类型深度

Children 是 React 组件中最常用的 prop 之一，但很多开发者对其类型体系一知半解。深入理解 ReactNode、ReactElement、JSX.Element 之间的区别，以及 React.Children API 和 cloneElement 的用法，是编写高质量复合组件的前提。

### ReactNode vs ReactElement vs JSX.Element

这三个类型是 React 类型系统中最容易混淆的概念，它们的范围和用途各不相同：

\`\`\`tsx
import { ReactNode, ReactElement, JSX } from 'react';

// ReactNode：最宽泛的类型，表示任何可以被 React 渲染的内容
// 包含：string | number | boolean | null | undefined | ReactElement | ReactFragment | ReactPortal | ReactNode[]
type MyReactNode = ReactNode;

const validNode1: ReactNode = 'Hello';       // 字符串
const validNode2: ReactNode = 123;           // 数字
const validNode3: ReactNode = true;          // 布尔值（不会渲染）
const validNode4: ReactNode = null;          // null（不会渲染）
const validNode5: ReactNode = undefined;     // undefined（不会渲染）
const validNode6: ReactNode = <div>Hi</div>; // React 元素
const validNode7: ReactNode = [1, 'two', <span key="1">three</span>]; // 数组

// ReactElement：表示一个 React 元素对象，包含 type, props, key
// 是 JSX 编译后的产物，不包含原始值（string/number 等不是 ReactElement）
type MyReactElement = ReactElement;

// 注意：<div>Hi</div> 是 ReactElement，但 'Hi' 不是
const element1: ReactElement = <div>Hi</div>;  // ✅
// const element2: ReactElement = 'Hi';        // ❌ 错误：string 不是 ReactElement

// JSX.Element：是 ReactElement 的别名，props 类型为 any
// 在旧版本中是独立类型，React 18 后等同于 ReactElement<any, any>
type MyJSXElement = JSX.Element;

// 实际开发建议：
// - children 类型用 ReactNode（最灵活）
// - 需要确保是单个元素时用 ReactElement
// - 避免直接使用 JSX.Element（太宽泛）
\`\`\`

### React.FC 的 children 隐式问题

\`React.FC\`（FunctionComponent）在旧版本中会隐式包含 children prop，这经常导致意外行为。React 18 后已移除，但仍需注意：

\`\`\`tsx
import { FC, ReactNode, useState, useEffect } from 'react';

// ❌ React.FC 在旧版本隐式包含 children，可能导致意外接收 children
// React 18 虽然移除了，但很多教程/代码库仍在使用，不推荐
const OldComponent: FC<{ title: string }> = ({ title }) => {
  return <h1>{title}</h1>;
};

// ✅ 推荐：显式声明 children 类型，更清晰可控
interface MyComponentProps {
  title: string;
  children?: ReactNode;
}

function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {children && <div className="content">{children}</div>}
    </div>
  );
}

// ✅ 当 children 是 render props（函数作为子组件）
interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean, error: Error | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data as T, loading, error)}</>;
}

// 使用 render props
function UserProfile({ userId }: { userId: number }) {
  return (
    <DataFetcher<{ name: string; email: string }> url={\`/api/users/\${userId}\`}>
      {(user, loading, error) => {
        if (loading) return <div>加载中...</div>;
        if (error) return <div>错误: {error.message}</div>;
        return <div>欢迎，{user.name}！({user.email})</div>;
      }}
    </DataFetcher>
  );
}
\`\`\`

### React.Children API 详解

\`React.Children\` 提供了一组工具方法，用于安全地遍历和操作 children，自动处理数组和 Fragment：

\`\`\`tsx
import { Children, ReactNode } from 'react';

interface TabsProps {
  defaultActiveKey?: string;
  children: ReactNode;
}

function Tabs({ defaultActiveKey, children }: TabsProps) {
  // React.Children.count：计算 children 数量（自动展平数组/Fragment）
  const childCount = Children.count(children);
  console.log('子元素数量:', childCount);

  // React.Children.forEach：遍历每个子元素
  const tabLabels: string[] = [];
  Children.forEach(children, (child) => {
    // 注意：child 可能是 null/undefined/boolean，需要判断
    if (child && typeof child === 'object' && 'props' in child) {
      tabLabels.push(child.props.label);
    }
  });

  // React.Children.map：遍历并返回新数组，自动分配 key
  const tabPanels = Children.map(children, (child, index) => {
    if (!child || typeof child !== 'object' || !('props' in child)) return null;
    return (
      <div role="tabpanel" hidden={index !== 0}>
        {child}
      </div>
    );
  });

  // React.Children.toArray：转为真实数组，方便 filter/find 等操作
  const childrenArray = Children.toArray(children);
  const firstChild = childrenArray[0];

  // React.Children.only：断言只有一个子元素，否则抛出错误
  // 适用于必须接收单个 ReactElement 的场景
  // const singleChild = Children.only(children); // 多个子元素时会报错

  return (
    <div className="tabs">
      <div className="tab-labels">{/* tabLabels 渲染标签头 */}</div>
      <div className="tab-panels">{tabPanels}</div>
    </div>
  );
}
\`\`\`

### React.cloneElement 注入 Props

\`React.cloneElement\` 可以克隆一个元素并注入新的 props，是实现复合组件（Compound Component）的核心工具：

\`\`\`tsx
import { cloneElement, Children, ReactElement, useState, ReactNode } from 'react';

// Tabs 复合组件实现
type TabProps = { label: string; children: ReactNode };

function Tab({ children }: TabProps) {
  return <div className="tab-panel">{children}</div>;
}

function Tabs({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 使用 React.Children.map + cloneElement 给子组件注入 props
  const enhancedChildren = Children.map(children, (child, index) => {
    // 必须确保 child 是有效的 ReactElement 才能 clone
    if (!child || typeof child !== 'object' || !('props' in child)) {
      return child;
    }
    // 克隆元素并注入 isActive 和 onSelect 等 props
    return cloneElement(child as ReactElement<{ isActive?: boolean; onSelect?: () => void }>, {
      isActive: index === activeIndex,
      onSelect: () => setActiveIndex(index),
    });
  });

  // 提取标签头（从每个 Tab 的 label prop）
  const labels = Children.map(children, (child, index) => {
    if (!child || typeof child !== 'object' || !('props' in child)) return null;
    const { label } = (child as ReactElement<TabProps>).props;
    return (
      <button
        key={index}
        onClick={() => setActiveIndex(index)}
        className={index === activeIndex ? 'active' : ''}
      >
        {label}
      </button>
    );
  });

  return (
    <div className="tabs-container">
      <div className="tabs-nav">{labels}</div>
      <div className="tabs-content">{enhancedChildren}</div>
    </div>
  );
}

// Tab 组件需要接收注入的 props（内部使用）
function TabPanel({ children, isActive }: { children: ReactNode; isActive?: boolean }) {
  if (!isActive) return null;
  return <div className="p-4">{children}</div>;
}

// 使用复合组件
function TabsDemo() {
  return (
    <Tabs>
      <Tab label="首页">首页内容</Tab>
      <Tab label="文档">文档内容</Tab>
      <Tab label="关于">关于我们</Tab>
    </Tabs>
  );
}
\`\`\`

### 递归渲染 Children 基础

当处理树形结构（如嵌套菜单、评论回复）时，需要递归渲染 children：

\`\`\`tsx
type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

function TreeView({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="pl-4">
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="py-1">{node.label}</div>
          {/* 递归渲染子节点 */}
          {node.children && node.children.length > 0 && (
            <TreeView nodes={node.children} />
          )}
        </li>
      ))}
    </ul>
  );
}

// 使用示例：递归渲染评论嵌套回复
function CommentDemo() {
  const comments: TreeNode[] = [
    {
      id: '1',
      label: '这个文章写得好！',
      children: [
        { id: '1-1', label: '同意，学到很多' },
        {
          id: '1-2',
          label: '补充一点...',
          children: [{ id: '1-2-1', label: '有道理！' }],
        },
      ],
    },
    { id: '2', label: '感谢分享！' },
  ];

  return <TreeView nodes={comments} />;
}
\`\`\`

理解 children 的类型体系和操作 API，可以让你更灵活地构建复合组件、渲染 props 模式和递归 UI 结构。
`,
  },
  {
    id: "tsrx-html-props",
    group: "类型高级篇",
    icon: "🏷️",
    title: "原生HTML属性与组件Props结合",
    content: `## 原生 HTML 属性与组件 Props 结合

在封装业务组件时，我们经常需要扩展原生 HTML 元素的属性（如按钮的 onClick、输入框的 placeholder 等）。TypeScript 提供了强大的类型工具，可以让我们优雅地继承原生属性，同时添加自定义 props。

### React.ComponentProps 提取原生属性

\`React.ComponentProps<'tagName'>\` 可以提取指定 HTML 标签的所有属性类型，包括事件、style、ref 等：

\`\`\`tsx
import { ComponentProps } from 'react';

// 提取 <input> 的所有原生 props 类型
type InputNativeProps = ComponentProps<'input'>;
// 包含：type, value, onChange, placeholder, disabled, className, ref, onFocus...

// 提取 <button> 的所有原生 props
type ButtonNativeProps = ComponentProps<'button'>;
// 包含：onClick, type, disabled, form, autoFocus...

// 也可以提取自定义组件的 props 类型
function MyComponent(props: { name: string; age: number }) {
  return <div>{name} - {age}</div>;
}
type MyComponentProps = ComponentProps<typeof MyComponent>;
// 结果：{ name: string; age: number }
\`\`\`

### ComponentPropsWithRef vs ComponentPropsWithoutRef

这两个类型用于控制是否包含 ref 属性，在封装组件时非常重要：

\`\`\`tsx
import { ComponentPropsWithRef, ComponentPropsWithoutRef, forwardRef } from 'react';

// ComponentPropsWithRef：包含 ref 属性（默认）
type InputWithRefProps = ComponentPropsWithRef<'input'>;
// 包含 ref 属性

// ComponentPropsWithoutRef：不包含 ref 属性
// 适用于不需要转发 ref，或者自己内部处理 ref 的场景
type InputWithoutRefProps = ComponentPropsWithoutRef<'input'>;

// JSX.IntrinsicElements：所有原生 HTML 标签的类型映射
// key 是标签名，value 是对应的 props 类型
type AllHTMLElements = keyof JSX.IntrinsicElements;
// 结果：'a' | 'div' | 'input' | 'button' | 'span' | 'p' | 'img'... 所有原生标签

// 获取某个标签的类型
type DivProps = JSX.IntrinsicElements['div'];
type AnchorProps = JSX.IntrinsicElements['a'];
\`\`\`

### 组件 Props 扩展原生元素

封装组件时，通过 \`extends\` 继承原生属性，再添加自定义 props（如 variant、size）：

\`\`\`tsx
import { ComponentPropsWithoutRef, ReactNode } from 'react';

// 封装 Button 组件：继承原生 button 属性，添加 variant/size
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// 注意：需要从 rest props 中排除自定义 props，避免透传到 DOM 导致警告
function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  ...rest // rest 包含所有原生 button 属性（onClick, type, form 等）
}: ButtonProps) {
  // 根据 variant/size 生成样式类名
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors';
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest} // 透传所有原生属性到 button 元素
    >
      {isLoading && <span className="mr-2 animate-spin">⏳</span>}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}

// 使用示例：可以传所有原生 button 属性 + 自定义属性
function ButtonDemo() {
  return (
    <div className="space-x-2">
      <Button variant="primary" size="md" onClick={() => alert('提交')} type="submit">
        提交
      </Button>
      <Button variant="secondary" size="sm" disabled>
        禁用按钮
      </Button>
      <Button variant="danger" isLoading>
        加载中
      </Button>
      <Button variant="ghost" size="md">
        幽灵按钮
      </Button>
    </div>
  );
}
\`\`\`

### 事件类型与 CSSProperties 类型安全

事件类型可以从 ComponentProps 中推导，style 对象使用 React.CSSProperties 保证类型安全：

\`\`\`tsx
import { ComponentProps, CSSProperties, useState } from 'react';

// 从原生 props 中提取事件类型，避免手动写 React.MouseEvent<HTMLButtonElement>
type ButtonClickHandler = ComponentProps<'button'>['onClick'];
// 等价于：(event: React.MouseEvent<HTMLButtonElement>) => void

type InputChangeHandler = ComponentProps<'input'>['onChange'];
// 等价于：(event: React.ChangeEvent<HTMLInputElement>) => void

type FormSubmitHandler = ComponentProps<'form'>['onSubmit'];
// 等价于：(event: React.FormEvent<HTMLFormElement>) => void

// React.CSSProperties：类型安全的 style 对象
const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  borderRadius: 8,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  // invalidProperty: 'xxx', // ❌ TypeScript 会报错，因为没有这个属性
};

// 封装 Input 组件，演示 Rest props 透传
type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string;
  error?: string;
};

function Input({ label, error, id, className, ...rest }: InputProps) {
  const inputId = id || \`input-\${Math.random().toString(36).slice(2)}\`;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-3 py-2 border rounded outline-none transition-colors',
          error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-500',
          className,
        ].filter(Boolean).join(' ')}
        {...rest} // 透传 type, placeholder, value, onChange, onFocus, disabled, name 等
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// 使用 Input：所有原生 input 属性都可用，并有类型提示
function FormDemo() {
  const [email, setEmail] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); alert('提交: ' + email); }}>
      <Input
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        maxLength={50}
      />
      <Button type="submit" variant="primary">注册</Button>
    </form>
  );
}
\`\`\`

通过继承原生 HTML 属性，我们的组件既获得了原生元素的完整能力，又保持了类型安全，同时避免了重复声明事件和属性类型。
`,
  },
  {
    id: "tsrx-utility-types",
    group: "类型高级篇",
    icon: "🔧",
    title: "TypeScript工具类型在React中应用",
    content: `## TypeScript 工具类型在 React 中应用

TypeScript 内置了丰富的工具类型（Utility Types），熟练使用它们可以极大提升 React 开发中的类型表达能力。结合自定义工具类型，可以让你的代码更加简洁、类型安全。

### Partial / Required / Pick / Omit 基础工具

这四个是最常用的工具类型，在表单、组件 props 设计中频繁出现：

\`\`\`tsx
import { useState } from 'react';

// 用户表单完整类型
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  avatar?: string;
  createdAt: Date;
};

// Partial<T>：所有字段变为可选
// 常用于：编辑表单（不需要所有字段都填）、搜索条件、更新接口
type UserUpdateForm = Partial<User>;
// 等价于：{ id?: number; name?: string; email?: string; age?: number; ... }

// Required<T>：所有字段变为必选
// 常用于：确保可选字段必须存在的场景
type UserWithAllFields = Required<User>;
// avatar 和 createdAt 也变成必选

// Pick<T, K>：从 T 中挑选部分字段
// 常用于：只需要部分字段的场景，如列表项只需要展示少量信息
type UserListItem = Pick<User, 'id' | 'name' | 'avatar'>;
// 等价于：{ id: number; name: string; avatar?: string }

// Omit<T, K>：从 T 中排除部分字段
// 常用于：创建表单不需要 id/createdAt 等自动生成的字段
type CreateUserForm = Omit<User, 'id' | 'createdAt'>;
// 等价于：{ name: string; email: string; age: number; avatar?: string }

// 实际使用：创建用户表单
function UserCreateForm() {
  // CreateUserForm 没有 id/createdAt，这些是后端生成的
  const [form, setForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    age: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 提交 form 数据到 API
    console.log('创建用户:', form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label>姓名：<input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 ml-2 rounded"
        /></label>
      </div>
      <div>
        <label>邮箱：<input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-2 py-1 ml-2 rounded"
        /></label>
      </div>
      <div>
        <label>年龄：<input
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
          className="border px-2 py-1 ml-2 rounded"
        /></label>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">创建</button>
    </form>
  );
}
\`\`\`

### Record / Exclude / Extract / NonNullable

\`Record<K, V>\` 用于构建映射类型，在状态机、枚举映射中非常实用：

\`\`\`tsx
import { ReactNode } from 'react';

// Record<K, V>：构建键为 K 类型、值为 V 类型的对象
type Status = 'idle' | 'loading' | 'success' | 'error';

// 状态机映射：根据状态渲染不同内容，强制覆盖所有状态
const statusConfig: Record<Status, { text: string; color: string }> = {
  idle: { text: '等待中', color: 'text-gray-500' },
  loading: { text: '加载中...', color: 'text-blue-500' },
  success: { text: '成功！', color: 'text-green-500' },
  error: { text: '出错了', color: 'text-red-500' },
};

// 如果遗漏了某个状态，TypeScript 会报错（开启 strictNullChecks 时）
// statusConfig.idle = ... 都必须存在

// Exclude<UnionType, ExcludedMembers>：从联合类型中排除指定成员
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';
type SolidVariant = Exclude<ButtonVariant, 'text'>; // 'primary' | 'secondary' | 'danger'

// Extract<U, M>：从联合类型中提取指定成员
type FormEvent = 'submit' | 'change' | 'blur' | 'focus' | 'click';
type InputEvent = Extract<FormEvent, 'change' | 'blur' | 'focus'>; // 'change' | 'blur' | 'focus'

// NonNullable<T>：排除 null 和 undefined
type MaybeUser = User | null | undefined;
type DefinitelyUser = NonNullable<MaybeUser>; // User

// 实际使用：状态机组件
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function StatusBadge<T>({ state }: { state: RequestState<T> }) {
  const config = {
    idle: { text: '待请求', bg: 'bg-gray-100' },
    loading: { text: '加载中', bg: 'bg-blue-100' },
    success: { text: '成功', bg: 'bg-green-100' },
    error: { text: '错误', bg: 'bg-red-100' },
  } as const;
  const { text, bg } = config[state.status];
  return <span className={\`px-2 py-1 rounded text-sm \${bg}\`}>{text}</span>;
}
\`\`\`

### ReturnType / Parameters / Awaited

这些工具类型用于从已有函数中提取类型，在 Custom Hook 和异步函数中非常有用：

\`\`\`tsx
import { useState, useEffect } from 'react';

// ReturnType<typeof fn>：提取函数的返回值类型
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

// 提取 useCounter 返回值的类型，避免重复声明
type CounterReturnType = ReturnType<typeof useCounter>;
// 等价于：{ count: number; increment: () => void; decrement: () => void; reset: () => void }

// Parameters<typeof fn>：提取函数参数类型（元组）
type UseCounterParams = Parameters<typeof useCounter>;
// 等价于：[initial?: number]

// Awaited<T>：解包 Promise 类型，获取 async 函数的返回值类型
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}

type FetchUserResult = Awaited<ReturnType<typeof fetchUser>>;
// 等价于：{ id: number; name: string }

// 在 getServerSideProps (Next.js) 或自定义 fetch hook 中常用
function useUser(userId: number) {
  const [user, setUser] = useState<FetchUserResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
}
\`\`\`

### 自定义工具类型

根据项目需要，我们可以编写自己的工具类型来解决常见问题：

\`\`\`tsx
import { ReactNode } from 'react';

// Optional<T, K>：将 T 中的 K 字段变为可选，其他保持不变
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserForm = Optional<User, 'age' | 'avatar'>;
// name/email/id/createdAt 仍然必选，age/avatar 可选

// Merge<A, B>：合并两个类型，B 的属性覆盖 A 的同名字段
type Merge<A, B> = Omit<A, keyof B> & B;

type BaseProps = { size: 'sm' | 'md'; color: string; disabled?: boolean };
type ButtonProps = Merge<BaseProps, { variant: 'primary' | 'secondary' }>;
// 结果：{ size: ...; color: ...; disabled?: boolean; variant: ... }

// DeepPartial<T>：递归将所有嵌套字段都变为可选
// 常用于深层嵌套对象的更新/合并
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Settings = {
  theme: { mode: 'light' | 'dark'; primaryColor: string };
  notifications: { email: boolean; push: boolean };
};

type SettingsUpdate = DeepPartial<Settings>;
// 可以只更新 theme.mood，不需要传完整对象

// withChildren：快速给 Props 添加 children 类型
type WithChildren<P = object> = P & { children?: ReactNode };

type MyComponentProps = WithChildren<{ title: string }>;
// 等价于：{ title: string; children?: ReactNode }

// 使用 withChildren
function Card({ title, children }: MyComponentProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function CustomUtilityDemo() {
  return (
    <Card title="自定义工具类型">
      <p>Optional、Merge、DeepPartial、WithChildren 都是常用自定义工具类型。</p>
    </Card>
  );
}
\`\`\`

熟练掌握这些工具类型，可以让你避免大量重复的类型声明，写出更符合 TypeScript 习惯的优雅代码。
`,
  },
  {
    id: "tsrx-discriminated-unions",
    group: "类型高级篇",
    icon: "🔀",
    title: "可辨识联合类型(Discriminated Union)",
    content: `## 可辨识联合类型（Discriminated Union）

可辨识联合（也叫标签联合、代数数据类型）是 TypeScript 中最强大的类型模式之一。通过一个共有的字面量字段（通常是 \`type\` 或 \`kind\`）来区分联合类型的不同成员，TypeScript 可以在条件分支中自动收窄类型，实现完美的类型安全。

### 基础模式：用 type 字段区分状态

最常见的应用是异步请求的四态（idle/loading/success/error）严格区分：

\`\`\`tsx
// 每个状态都有一个共有的 status 字段（字面量类型），作为辨识标签
type IdleState = { status: 'idle' };
type LoadingState = { status: 'loading' };
type SuccessState<T> = { status: 'success'; data: T };
type ErrorState = { status: 'error'; error: Error };

// 联合类型：同一时间只能是其中一种状态
type RequestState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

// ✅ 正确：success 状态必须有 data，error 状态必须有 error
const successState: RequestState<string> = { status: 'success', data: 'Hello' };
const errorState: RequestState<string> = { status: 'error', error: new Error('失败') };
// ❌ 错误：success 状态必须有 data
// const invalidState: RequestState<string> = { status: 'success' };
// ❌ 错误：不可能同时有 data 和 error（类型互斥）
// const impossibleState: RequestState<string> = { status: 'success', data: 'Hi', error: new Error() };
\`\`\`

### 穷尽性检查（Exhaustive Check）

使用 \`never\` 类型确保 switch/if 语句覆盖了所有可能的情况，遗漏时 TypeScript 编译报错：

\`\`\`tsx
// 通知组件变体：不同变体有不同的 props
type AlertSuccess = { type: 'success'; message: string };
type AlertError = { type: 'error'; message: string; code?: number };
type AlertWarning = { type: 'warning'; message: string; closable?: boolean };

type AlertProps = AlertSuccess | AlertError | AlertWarning;

function Alert(props: AlertProps) {
  const baseClasses = 'p-4 rounded mb-4';
  // switch 按 type 收窄类型
  switch (props.type) {
    case 'success':
      // 这里 props 自动收窄为 AlertSuccess，可以安全访问 message
      return <div className={\`\${baseClasses} bg-green-100 text-green-800\`}>✅ {props.message}</div>;
    case 'error':
      // 这里 props 是 AlertError，可以访问 code
      return (
        <div className={\`\${baseClasses} bg-red-100 text-red-800\`}>
          ❌ {props.message}
          {props.code && <span className="ml-2 text-sm">错误码: {props.code}</span>}
        </div>
      );
    case 'warning':
      // 这里 props 是 AlertWarning，可以访问 closable
      return (
        <div className={\`\${baseClasses} bg-yellow-100 text-yellow-800\`}>
          ⚠️ {props.message}
          {props.closable && <button className="ml-4">关闭</button>}
        </div>
      );
    default:
      // 穷尽性检查：如果有类型没处理，这里会编译报错
      // 当新增 Alert 类型时，这里会提示你处理，避免遗漏
      const _exhaustiveCheck: never = props;
      throw new Error(\`未知的 Alert 类型: \${_exhaustiveCheck}\`);
  }
}

// 使用示例
function AlertDemo() {
  return (
    <div className="p-4 space-y-2">
      <Alert type="success" message="操作成功！" />
      <Alert type="error" message="网络请求失败" code={500} />
      <Alert type="warning" message="请注意账号安全" closable />
    </div>
  );
}
\`\`\`

### Reducer Action 标准模式

React 的 useReducer 是可辨识联合的经典应用场景，每个 action 是一个联合类型成员：

\`\`\`tsx
import { useReducer } from 'react';

// 计数器状态
type CounterState = { count: number };

// Action 使用 type 作为辨识标签，不同 action 有不同的 payload
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'reset'; to?: number };

// reducer 函数：switch 自动收窄 action 类型
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      // action 类型被收窄为 { type: 'increment' }，没有 payload
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      // action 被收窄为 { type: 'set'; payload: number }，必须有 payload
      return { count: action.payload };
    case 'reset':
      // action 被收窄为 { type: 'reset'; to?: number }，to 是可选的
      return { count: action.to ?? 0 };
    default:
      const _exhaustive: never = action;
      throw new Error(\`未知 action: \${_exhaustive}\`);
  }
}

// 使用 useReducer
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div className="p-4 space-y-4">
      <p className="text-2xl font-bold text-center">Count: {state.count}</p>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => dispatch({ type: 'decrement' })}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          -1
        </button>
        <button
          onClick={() => dispatch({ type: 'reset' })}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重置
        </button>
        <button
          onClick={() => dispatch({ type: 'increment' })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +1
        </button>
        <button
          onClick={() => dispatch({ type: 'set', payload: 100 })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          设为100
        </button>
      </div>
    </div>
  );
}
\`\`\`

### 异步组件与类型安全 if/switch

封装一个通用的 AsyncBoundary 组件，根据请求状态自动渲染不同内容：

\`\`\`tsx
import { ReactNode, useState, useEffect } from 'react';

// Async 组件 Props：使用可辨识联合严格区分状态
type AsyncProps<T> = {
  state: RequestState<T>;
  children: (data: T) => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  renderIdle?: () => ReactNode;
};

function AsyncBoundary<T>({
  state,
  children,
  renderLoading,
  renderError,
  renderIdle,
}: AsyncProps<T>) {
  // if 判断也可以收窄类型（不只是 switch）
  if (state.status === 'idle') {
    return renderIdle ? renderIdle() : <div>请发起请求</div>;
  }
  if (state.status === 'loading') {
    return renderLoading ? renderLoading() : <div className="p-4 text-center">加载中...</div>;
  }
  if (state.status === 'error') {
    // state 被收窄为 ErrorState，state.error 一定存在
    return renderError ? renderError(state.error) : (
      <div className="p-4 text-red-500 text-center">
        <p>加载失败</p>
        <p className="text-sm">{state.error.message}</p>
      </div>
    );
  }
  // 剩下的只能是 success 状态，state.data 一定存在且类型为 T
  return <>{children(state.data)}</>;
}

// 使用 AsyncBoundary 封装数据获取逻辑
type UserData = { id: number; name: string; email: string };

function UserProfile({ userId }: { userId: number }) {
  const [state, setState] = useState<RequestState<UserData>>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });
    fetch(\`/api/users/\${userId}\`)
      .then(res => {
        if (!res.ok) throw new Error('用户不存在');
        return res.json();
      })
      .then((data: UserData) => setState({ status: 'success', data }))
      .catch((error: Error) => setState({ status: 'error', error }));
  }, [userId]);

  return (
    <AsyncBoundary
      state={state}
      renderLoading={() => <div className="p-8 text-center">正在加载用户信息...</div>}
    >
      {(user) => (
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      )}
    </AsyncBoundary>
  );
}
\`\`\`

可辨识联合是 TypeScript 类型安全的核心模式，它彻底消灭了 "data 可能为 undefined"、"error 可能不存在" 这类可选属性带来的运行时错误。
`,
  },
  {
    id: "tsrx-type-narrowing",
    group: "类型高级篇",
    icon: "🔍",
    title: "类型收窄与类型守卫",
    content: `## 类型收窄与类型守卫

TypeScript 的类型系统在编译时是静态的，但在运行时我们经常需要处理联合类型、未知类型等。类型收窄（Type Narrowing）是指在特定代码块中，将一个宽泛的类型精确为更具体的类型，类型守卫（Type Guard）则是实现收窄的手段。

### 基础类型收窄：typeof / instanceof / in

JavaScript 的原生操作符在 TypeScript 中都是类型守卫，可以自动收窄类型：

\`\`\`tsx
// typeof 收窄基本类型
// typeof 只能返回：'string' | 'number' | 'boolean' | 'symbol' | 'bigint' | 'undefined' | 'object' | 'function'
function double(value: string | number) {
  if (typeof value === 'string') {
    // 这里 value 是 string 类型，可以调用 string 方法
    return value.repeat(2);
  }
  // 这里 value 是 number 类型（排除了 string）
  return value * 2;
}

// instanceof 收窄类实例
function formatDate(date: Date | string | number) {
  if (date instanceof Date) {
    // date 是 Date 实例，可以调用 Date 方法
    return date.toISOString().split('T')[0];
  }
  // date 是 string | number
  return new Date(date).toISOString().split('T')[0];
}

// 错误处理中常用 instanceof 判断 Error 类型
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // error 是 Error 类型，可以访问 message/stack
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

// in 操作符收窄：判断属性是否存在于对象中
type Dog = { name: string; bark: () => void };
type Cat = { name: string; meow: () => void };

function makeSound(animal: Dog | Cat) {
  if ('bark' in animal) {
    // animal 是 Dog 类型
    animal.bark();
  } else {
    // animal 是 Cat 类型
    animal.meow();
  }
}

// === / !== 字面量收窄
type Result = { success: true; data: string } | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success === true) {
    // result 被收窄为 success: true 的类型，可以访问 data
    console.log('成功:', result.data);
  } else {
    // result 被收窄为 success: false 的类型，可以访问 error
    console.log('失败:', result.error);
  }
}
\`\`\`

### 自定义类型守卫（value is Type）

当原生操作符不够用时，我们可以编写自定义类型守卫函数，返回 \`value is Type\` 格式的类型谓词：

\`\`\`tsx
// 自定义类型守卫：判断是否是字符串
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 自定义类型守卫：判断是否是有效用户对象
type User = { id: number; name: string; email: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof (value as Record<string, unknown>).id === 'number' &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}

// API 响应类型守卫
type ApiSuccess<T> = { code: 200; data: T };
type ApiError = { code: number; message: string };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.code === 200 && 'data' in response;
}

// 使用自定义类型守卫
async function fetchUser(id: number) {
  const res = await fetch(\`/api/users/\${id}\`);
  const json: unknown = await res.json();

  if (isUser(json)) {
    // json 被收窄为 User 类型，有完整类型提示
    console.log('用户名称:', json.name);
    console.log('用户邮箱:', json.email);
    return json;
  }

  throw new Error('响应数据格式不正确');
}

// 处理 API 响应
function handleApiResponse<T>(response: ApiResponse<T>) {
  if (isSuccessResponse(response)) {
    // response 是 ApiSuccess<T>，可以安全访问 data
    console.log('数据:', response.data);
  } else {
    // response 是 ApiError，可以安全访问 message
    console.error('错误:', response.message);
  }
}
\`\`\`

### 断言函数与非空断言

断言函数（asserts）在不返回值的情况下收窄类型，\`!\` 非空断言应谨慎使用：

\`\`\`tsx
// asserts 断言函数：断言条件为真，否则抛出错误
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// 断言值不为 null/undefined
function assertNonNullable<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message ?? '值不能为 null 或 undefined');
  }
}

// 使用示例
function getUserById(id: number): User | null {
  const users: User[] = [{ id: 1, name: '小明', email: 'xm@example.com' }];
  return users.find(u => u.id === id) ?? null;
}

function printUserName(userId: number) {
  const user = getUserById(userId);
  // 方式1：使用断言函数
  assertNonNullable(user, \`用户 \${userId} 不存在\`);
  // 这里 user 的类型被收窄为 User（排除了 null）
  console.log(user.name);
}

// ! 非空断言：告诉 TypeScript "这个值一定不是 null/undefined"
// ⚠️ 谨慎使用！这只是编译时断言，运行时如果值为 null/undefined 仍会报错
const element = document.getElementById('app')!;
// element 类型是 HTMLElement（不是 HTMLElement | null）
element.innerHTML = '<h1>Hello</h1>';

// ✅ 更好的方式：用类型守卫/可选链代替非空断言
const betterElement = document.getElementById('app');
if (betterElement) {
  betterElement.innerHTML = '<h1>Hello</h1>';
}
\`\`\`

### 可选链 ?.、空值合并 ??、satisfies 运算符

这些是现代 TypeScript/JavaScript 的安全操作符，配合 satisfies 可以实现更精确的类型推导：

\`\`\`tsx
// 可选链 ?.：安全访问深层嵌套属性，遇到 null/undefined 立即返回 undefined
type Company = {
  name: string;
  address?: {
    city?: string;
    street?: {
      number?: number;
    };
  };
};

function getCity(company?: Company) {
  // 任何一层为 null/undefined 都不会报错，返回 undefined
  return company?.address?.city ?? '未知城市';
}

// 空值合并 ??：只在左侧为 null/undefined 时使用右侧值
// 注意与 || 的区别：|| 会对所有 falsy 值（0, '', false）都生效
function getDiscount(price: number, discount?: number | null) {
  // discount 为 0 时仍然使用 0（正常打折），不会回退到 10
  const finalDiscount = discount ?? 10;
  return price * (1 - finalDiscount / 100);
}

// || 的陷阱：0 和 '' 会被错误地当作"无值"
const timeout = 0;
const timeout1 = timeout || 3000; // 3000（错误！0 是有效的超时设置）
const timeout2 = timeout ?? 3000; // 0（正确）

// satisfies 运算符：满足类型约束的同时保留字面量类型（比 as 更安全）
// 场景：定义配置对象，需要满足类型，但又想保留具体字面量类型供后续推导
type ThemeConfig = {
  primaryColor: string;
  secondaryColor: string;
  fonts: string[];
  darkMode: boolean;
};

// 使用 as：TypeScript 不会检查额外属性，且类型被拓宽
const badTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  fonts: ['Inter', 'system-ui'],
  darkMode: true,
  invalidProp: 'oops', // ❌ as 不会报错，多余属性被忽略
} as ThemeConfig;

// 使用 satisfies：既检查类型正确性，又保留字面量类型
const goodTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  fonts: ['Inter', 'system-ui'],
  darkMode: true,
  // invalidProp: 'oops', // ❌ satisfies 会报错，不允许额外属性
} satisfies ThemeConfig;

// goodTheme.fonts 的类型是 ('Inter' | 'system-ui')[] 而不是 string[]
// 可以做更精确的类型推导
type FontFamily = typeof goodTheme.fonts[number]; // 'Inter' | 'system-ui'
\`\`\`

掌握类型收窄和类型守卫，可以让你写出既安全又优雅的 TypeScript 代码，减少运行时错误，同时充分利用类型系统的自动补全和类型检查能力。
`,
  },
  {
    id: "tsrx-forwardref-types",
    group: "类型高级篇",
    icon: "📡",
    title: "forwardRef与useImperativeHandle类型",
    content: `## forwardRef 与 useImperativeHandle 类型

在 React 中，ref 用于访问 DOM 元素或组件实例。当需要让父组件访问子组件的 DOM 或自定义方法时，需要使用 \`forwardRef\` 进行 ref 转发，\`useImperativeHandle\` 可以自定义暴露给父组件的 API。

### forwardRef 基础与泛型参数

\`forwardRef<RefType, PropsType>\` 接收两个泛型参数：ref 的类型和 props 的类型：

\`\`\`tsx
import { forwardRef, useRef, useEffect } from 'react';

// forwardRef 的两个泛型参数：
// 1. 第一个：ref 指向的类型（通常是 DOM 元素类型或自定义 handle 类型）
// 2. 第二个：组件接收的 props 类型

// 基础用法：转发 ref 到原生 input 元素
type InputProps = {
  label?: string;
  placeholder?: string;
  error?: string;
};

// ✅ 正确的 forwardRef 类型声明
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, placeholder, error },
  ref // ref 的类型自动推导为 React.Ref<HTMLInputElement>
) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className={\`w-full px-3 py-2 border rounded \${error ? 'border-red-500' : 'border-gray-300'}\`}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

// 父组件使用：可以通过 ref 直接调用 input 的 focus、select 等方法
function InputDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 组件挂载后自动聚焦
    inputRef.current?.focus();
  }, []);

  const handleClick = () => {
    // 可以调用所有原生 input 方法
    inputRef.current?.focus();
    inputRef.current?.select();
    console.log('当前值:', inputRef.current?.value);
  };

  return (
    <div className="p-4 max-w-md">
      <Input ref={inputRef} label="用户名" placeholder="请输入用户名" />
      <button onClick={handleClick} className="bg-blue-500 text-white px-4 py-2 rounded">
        聚焦并选中
      </button>
    </div>
  );
}
\`\`\`

### Ref 的三种类型

了解 Ref 的三种形式，在处理 ref 转发时可以应对各种场景：

\`\`\`tsx
import { Ref, RefObject, MutableRefObject, RefCallback, useRef, useCallback } from 'react';

// Ref 有三种形式：
// 1. RefObject<T>：通过 useRef 创建，{ current: T | null }
const refObject: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);

// 2. MutableRefObject<T>：useRef 传入初始值（非 null），current 可变
const mutableRef = useRef<number>(0); // MutableRefObject<number>
// mutableRef.current 可以直接修改

// 3. RefCallback<T>：回调函数形式，接收 DOM 元素作为参数
const callbackRef: RefCallback<HTMLDivElement> = useCallback((element) => {
  if (element) {
    console.log('DOM 元素已挂载:', element);
    // 可以在这里做 DOM 操作
    element.focus();
  }
}, []);

// Ref<T> 是最宽泛的 ref 类型，包含以上三种
type AnyInputRef = Ref<HTMLInputElement>;

// 区分 MutableRefObject 和 RefObject：
// - useRef<HTMLInputElement>(null) → RefObject<HTMLInputElement>（current 只读）
// - useRef<HTMLInputElement | null>(null) → MutableRefObject（current 可写）
// - 一般转发 DOM ref 时用 RefObject 即可
\`\`\`

### useImperativeHandle 暴露自定义 API

\`useImperativeHandle\` 可以自定义暴露给父组件的方法，而不是直接暴露整个 DOM 元素：

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// 定义暴露给父组件的自定义 API 类型
type FormInputHandle = {
  focus: () => void;
  blur: () => void;
  select: () => void;
  reset: () => void;
  clear: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
  scrollIntoView: () => void;
};

type FormInputProps = {
  label: string;
  initialValue?: string;
  placeholder?: string;
};

// 第一个泛型参数是暴露的 handle 类型
const FormInput = forwardRef<FormInputHandle, FormInputProps>(function FormInput(
  { label, initialValue = '', placeholder },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  // useImperativeHandle：自定义暴露给父组件的 API
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select(),
    reset: () => setValue(initialValue),
    clear: () => setValue(''),
    setValue: (newValue: string) => setValue(newValue),
    getValue: () => value,
    scrollIntoView: () => inputRef.current?.scrollIntoView({ behavior: 'smooth' }),
  }), [initialValue, value]); // 依赖数组，和 useEffect 类似

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
    </div>
  );
});

// 父组件使用自定义 API
function FormInputDemo() {
  const nameInputRef = useRef<FormInputHandle>(null);
  const emailInputRef = useRef<FormInputHandle>(null);

  const handleReset = () => {
    nameInputRef.current?.reset();
    emailInputRef.current?.reset();
  };

  const handleClear = () => {
    nameInputRef.current?.clear();
    emailInputRef.current?.clear();
    nameInputRef.current?.focus();
  };

  const handleSubmit = () => {
    const name = nameInputRef.current?.getValue() ?? '';
    const email = emailInputRef.current?.getValue() ?? '';
    alert(\`提交: \${name} <\${email}>\`);
  };

  return (
    <div className="p-4 max-w-md">
      <FormInput ref={nameInputRef} label="姓名" initialValue="" placeholder="请输入姓名" />
      <FormInput ref={emailInputRef} label="邮箱" placeholder="请输入邮箱" />
      <div className="flex gap-2 mt-4">
        <button onClick={handleSubmit} className="flex-1 bg-blue-500 text-white py-2 rounded">提交</button>
        <button onClick={handleReset} className="px-4 bg-gray-200 py-2 rounded">重置</button>
        <button onClick={handleClear} className="px-4 bg-red-100 text-red-600 py-2 rounded">清空</button>
      </div>
    </div>
  );
}
\`\`\`

### mergeRefs 工具函数：合并多个 ref

当需要同时支持父组件传入的 ref 和组件内部的 useRef 时，需要 mergeRefs 工具：

\`\`\`tsx
import { forwardRef, useRef, useCallback, Ref, MutableRefObject, RefCallback, ComponentPropsWithoutRef } from 'react';

// mergeRefs 工具函数：将多个 ref 合并为一个回调 ref
function mergeRefs<T>(...refs: (Ref<T> | null | undefined)[]): RefCallback<T> {
  return (instance: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref && typeof ref === 'object') {
        (ref as MutableRefObject<T | null>).current = instance;
      }
    });
  };
}

// 使用 mergeRefs：同时支持外部 ref 和内部 ref
const MergedInput = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  function MergedInput(props, externalRef) {
    const internalRef = useRef<HTMLInputElement>(null);

    // 合并外部传入的 ref 和内部 ref
    const combinedRef = useCallback(
      (element: HTMLInputElement | null) => {
        mergeRefs(externalRef, internalRef)(element);
        // 可以在这里做额外的 DOM 操作
        if (element) {
          console.log('Input 挂载');
        }
      },
      [externalRef]
    );

    return <input ref={combinedRef} {...props} className="border px-3 py-2 rounded" />;
  }
);

// ⚠️ 重要提醒：避免过度使用 useImperativeHandle
// React 的哲学是声明式编程，props 驱动，命令式 ref 应该是最后的选择
// 优先使用 props + state 管理组件行为，只有在以下情况才考虑 ref 暴露方法：
// - 必须调用 DOM 方法（focus, scrollIntoView, play/pause 视频等）
// - 需要触发动画或命令式操作
// - 与第三方 DOM 库集成
// 大部分数据和状态应该通过 props 传递，而不是通过 ref 方法调用
\`\`\`

forwardRef 和 useImperativeHandle 是 React 中处理 DOM 访问和组件间命令式通信的重要工具，但要注意遵循 React 的声明式哲学，避免过度使用命令式 API。
`,
  },
  {
    id: "tsrx-hoc-types",
    group: "类型高级篇",
    icon: "🎭",
    title: "高阶组件HOC类型",
    content: `## 高阶组件 HOC 类型

高阶组件（Higher-Order Component, HOC）是 React 中复用组件逻辑的经典模式。虽然现在更推荐自定义 Hook，但 HOC 在第三方库（如 Redux、React Router、withStyles）中仍然广泛使用，掌握其类型写法对于理解和维护老代码、封装通用逻辑至关重要。

### HOC 基础函数签名

HOC 是一个函数，接收一个组件并返回一个新组件。使用泛型和 \`ComponentType\` 可以写出类型安全的 HOC：

\`\`\`tsx
import { ComponentType, FC, ReactNode, useState, useEffect } from 'react';

// React.ComponentType<P> = React.FC<P> | React.ComponentClass<P>
// 表示可以是函数组件或类组件

// 最简单的 HOC：给组件添加通用样式或包装
function withBorder<P extends object>(WrappedComponent: ComponentType<P>) {
  // 返回的新组件的 props：原组件 props 不需要额外 props
  const WithBorder: FC<P> = (props) => {
    return (
      <div className="border-2 border-blue-500 rounded-lg p-4">
        <WrappedComponent {...props} />
      </div>
    );
  };

  // 设置 displayName，便于 React DevTools 调试
  WithBorder.displayName = \`withBorder(\${WrappedComponent.displayName || WrappedComponent.name || 'Component'})\`;

  return WithBorder;
}

// 使用 HOC
function Hello({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}

const HelloWithBorder = withBorder(Hello);

// 使用时仍然传原来的 props，类型完全保留
function HocDemo() {
  return <HelloWithBorder name="World" />;
}
\`\`\`

### Props 注入 HOC：withUser / withAuth

注入 props 的 HOC 需要使用 \`Omit\` 从返回组件的 props 中移除被注入的 props：

\`\`\`tsx
import { createContext, useContext, ComponentType, FC } from 'react';

// 模拟用户上下文
type User = { id: number; name: string; role: 'admin' | 'user' };
const UserContext = createContext<User | null>(null);

// 使用 useContext 获取用户（自定义 Hook 方式）
function useUser(): User | null {
  return useContext(UserContext);
}

// HOC 方式：注入 user prop
// P extends { user?: User }：原组件可能（也可能不）有 user prop
// 返回的组件 Omit<P, 'user'>：不需要父组件传 user，由 HOC 注入
function withUser<P extends { user?: User }>(
  WrappedComponent: ComponentType<P>
) {
  type WithUserProps = Omit<P, 'user'>; // 从 props 中移除 user

  const WithUser: FC<WithUserProps> = (props) => {
    const user = useUser();
    // 将注入的 user 和其他 props 一起传给被包装组件
    return <WrappedComponent {...(props as P)} user={user} />;
  };

  WithUser.displayName = \`withUser(\${WrappedComponent.displayName || WrappedComponent.name || 'Component'})\`;
  return WithUser;
}

// withAuth 权限守卫 HOC：未登录重定向
function withAuth<P extends { user?: User | null }>(
  WrappedComponent: ComponentType<P>,
  requiredRole?: 'admin' | 'user'
) {
  type WithAuthProps = Omit<P, 'user'>;

  const WithAuth: FC<WithAuthProps> = (props) => {
    const user = useUser();

    // 未登录显示登录提示
    if (!user) {
      return <div className="p-4 text-center text-red-500">请先登录</div>;
    }

    // 需要特定角色但用户不满足
    if (requiredRole && user.role !== requiredRole) {
      return <div className="p-4 text-center text-red-500">权限不足，需要 {requiredRole} 权限</div>;
    }

    return <WrappedComponent {...(props as P)} user={user} />;
  };

  WithAuth.displayName = \`withAuth(\${WrappedComponent.displayName || WrappedComponent.name || 'Component'})\`;
  return WithAuth;
}

// 使用 HOC
type UserProfileProps = { user?: User | null; showEmail?: boolean };

function UserProfile({ user, showEmail }: UserProfileProps) {
  if (!user) return null;
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">{user.name}</h2>
      {showEmail && <p className="text-gray-600">角色: {user.role}</p>}
    </div>
  );
}

// 组合使用：withUser 注入 user，withAuth 检查登录
const ProtectedUserProfile = withAuth(withUser(UserProfile));
// ProtectedUserProfile 的 props 是 Omit<UserProfileProps, 'user'>，即 { showEmail?: boolean }
\`\`\`

### withLogger 日志 HOC

一个实用的日志 HOC，用于调试 props 变化：

\`\`\`tsx
import { useEffect, useRef, ComponentType, FC } from 'react';

// withLogger：在组件挂载和 props 变化时打印日志
function withLogger<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: { logMount?: boolean; logUpdate?: boolean; logUnmount?: boolean } = {}
) {
  const { logMount = true, logUpdate = true, logUnmount = true } = options;

  const WithLogger: FC<P> = (props) => {
    const prevPropsRef = useRef<P>();
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    useEffect(() => {
      if (logMount) {
        console.log(\`[\${componentName}] 挂载，props:\`, props);
      }
      return () => {
        if (logUnmount) {
          console.log(\`[\${componentName}] 卸载\`);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (logUpdate && prevPropsRef.current) {
        // 简单比较 props 变化（实际项目可用 lodash/isEqual）
        const changes: string[] = [];
        const allKeys = new Set([...Object.keys(prevPropsRef.current), ...Object.keys(props)]);
        allKeys.forEach((key) => {
          const prev = (prevPropsRef.current as Record<string, unknown>)[key];
          const curr = (props as Record<string, unknown>)[key];
          if (prev !== curr) {
            changes.push(\`\${key}: \${JSON.stringify(prev)} → \${JSON.stringify(curr)}\`);
          }
        });
        if (changes.length > 0) {
          console.log(\`[\${componentName}] props 变化:\`, changes.join(', '));
        }
      }
      prevPropsRef.current = props;
    });

    return <WrappedComponent {...props} />;
  };

  WithLogger.displayName = \`withLogger(\${WrappedComponent.displayName || WrappedComponent.name || 'Component'})\`;
  return WithLogger;
}

// 使用 withLogger
const LoggedButton = withLogger(function Button({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">{children}</button>;
});
\`\`\`

### compose 组合多个 HOC，HOC vs 自定义 Hook

多个 HOC 嵌套使用时可读性差，可以用 compose 函数从右到左组合，同时理解 HOC 与 Hook 的优劣：

\`\`\`tsx
import { ComponentType, FC } from 'react';

// compose 函数：从右到左组合多个 HOC
// compose(f, g, h)(component) 等价于 f(g(h(component)))
function compose<T>(...hocs: Array<(component: ComponentType<any>) => ComponentType<any>>) {
  return function (WrappedComponent: ComponentType<T>): ComponentType<T> {
    return hocs.reduceRight(
      (acc, hoc) => hoc(acc),
      WrappedComponent
    ) as ComponentType<T>;
  };
}

// 使用 compose 组合多个 HOC
const enhance = compose<{ showEmail?: boolean }>(
  withAuth,           // 3. 最外层：权限检查
  withLogger({ logUpdate: false }), // 2. 中间：日志
  withUser            // 1. 最内层：注入 user
);

// 等价于：withAuth(withLogger(withUser(UserProfile)))
const EnhancedProfile = enhance(UserProfile);

// HOC vs 自定义 Hook 对比：
//
// ✅ 自定义 Hook 优势（现在更推荐）：
// 1. 更简单：不需要嵌套组件、displayName、ref 转发等复杂问题
// 2. 更灵活：可以在一个组件中使用多个 Hook，顺序不影响
// 3. 类型更简单：泛型和类型推断更直观
// 4. 更好的 tree-shaking：未使用的逻辑更容易被打包工具移除
// 5. 没有 props 命名冲突：多个 HOC 注入同名 props 会冲突
//
// 📌 HOC 仍然适用的场景：
// 1. 类组件（无法使用 Hook）
// 2. 第三方库生态（Redux connect, React Router withRouter 等历史原因）
// 3. 需要包装组件树、添加错误边界、持久化布局等跨切面需求
// 4. 批量增强多个组件时（如给所有页面添加鉴权）
//
// 💡 实践建议：
// - 新项目优先使用自定义 Hook
// - 需要理解和维护 HOC 代码时掌握类型写法
// - 避免过度嵌套 HOC，必要时用 compose 改善可读性
function HOCvsHook() {
  // Hook 方式更简单直接
  const user = useUser();
  // const { data, loading } = useFetch('/api/data');
  // const theme = useTheme();
  return <div>优先使用 Hook！用户: {user?.name ?? '未登录'}</div>;
}
\`\`\`

虽然现代 React 开发中自定义 Hook 已经大幅取代了 HOC，但理解 HOC 的类型写法仍然是高级 React 开发者必备技能。
`,
  },
  {
    id: "tsrx-declare-modules",
    group: "类型高级篇",
    icon: "📜",
    title: "模块声明与类型扩展",
    content: `## 模块声明与类型扩展

TypeScript 的类型系统默认只识别 .ts/.tsx 文件，当我们引入非 JS 模块（如 CSS Modules、SVG、图片）或者需要扩展第三方库的类型时，需要通过模块声明（declare module）来告诉 TypeScript 这些模块的类型。

### declare module：模块增强（Module Augmentation）

扩展第三方库的类型定义，给已有的模块添加自定义属性。最常见的场景是扩展 styled-components 的 DefaultTheme：

\`\`\`tsx
// 通常放在 src/types/styled.d.ts 或 src/types/env.d.ts

// 示例：扩展 styled-components 的 DefaultTheme
import 'styled-components';
import type { Theme } from '../styles/theme';

// 模块增强：给 styled-components 的 DefaultTheme 接口添加我们的主题类型
declare module 'styled-components' {
  // 重新声明 DefaultTheme 接口，合并我们的主题类型
  export interface DefaultTheme extends Theme {}
}

// 示例：扩展 React Router 的 Location 状态类型
import 'react-router-dom';

declare module 'react-router-dom' {
  // 给 Location 状态添加自定义类型
  interface LocationState {
    from?: string;
    modal?: boolean;
    backgroundLocation?: Location;
  }
}

// 示例：给 window 扩展全局属性（需要 declare global）
declare global {
  interface Window {
    // 第三方脚本注入的全局变量
    __INITIAL_STATE__?: Record<string, unknown>;
    __APP_VERSION__?: string;
    // 百度统计/谷歌分析等
    _hmt?: any[];
    gtag?: (...args: any[]) => void;
    // 自己的全局工具
    __MY_APP_GLOBAL__?: {
      env: 'development' | 'production';
      buildTime: string;
    };
  }
}

// 使用扩展后的类型
function App() {
  // window.__APP_VERSION__ 现在有类型提示
  console.log('App version:', window.__APP_VERSION__);
  console.log('Initial state:', window.__INITIAL_STATE__);
  return <div>App</div>;
}
\`\`\`

### CSS Modules 类型声明

Vite、Webpack 等构建工具支持 CSS Modules，但 TypeScript 默认不认识 \`*.module.css\` 导入，需要声明模块：

\`\`\`tsx
// src/types/css-modules.d.ts

// CSS Modules 类型声明
// 声明所有 .module.css 文件导入返回一个 Record<string, string>
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// SCSS Modules（如果使用 Sass）
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 使用 CSS Modules（Vite 项目默认支持）
// import styles from './Button.module.css';
// <button className={styles.primary}>按钮</button>
// TypeScript 会检查 styles.primary 是否存在，避免类名拼写错误
\`\`\`

### SVG、图片、静态资源类型声明

各类静态资源导入的类型声明：

\`\`\`tsx
// src/types/assets.d.ts

// SVG 声明（两种常见方式）
// 方式1：作为字符串 URL 导入（默认方式，Vite/Webpack 默认）
declare module '*.svg' {
  const src: string;
  export default src;
}

// 方式2：作为 React 组件导入（需要 vite-plugin-svgr 或 @svgr/webpack）
// 如果使用 SVGR 将 SVG 转为组件：
declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react';
  const SVGComponent: FC<SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}

// 图片类型
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

// 字体类型
declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.eot' {
  const src: string;
  export default src;
}

// JSON 文件（TypeScript 内置支持 resolveJsonModule，通常不需要声明）
// declare module '*.json' {
//   const value: any;
//   export default value;
// }

// 使用示例：
// import logoUrl from './logo.png'; // logoUrl 类型是 string
// import LogoIcon from './logo.svg?react'; // LogoIcon 是 React 组件
// <img src={logoUrl} alt="logo" />
// <LogoIcon width={24} height={24} />
\`\`\`

### 环境声明文件 d.ts 与 tsconfig 配置

如何组织类型声明文件，以及 @types/ 类型包的工作原理：

\`\`\`tsx
// ==========================================
// 推荐的 d.ts 文件组织方式
// ==========================================

// src/types/
// ├── index.ts          // 类型统一导出
// ├── env.d.ts          // 环境变量、window 扩展
// ├── styled.d.ts       // styled-components 主题扩展
// ├── css-modules.d.ts  // CSS Modules 声明
// ├── assets.d.ts       // 静态资源声明
// ├── api.d.ts          // API 响应类型
// └── store.d.ts        // 全局状态类型

// env.d.ts：环境变量类型提示（Vite 项目）
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite 环境变量必须以 VITE_ 开头
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 使用环境变量时获得类型提示：
// const apiUrl = import.meta.env.VITE_API_BASE_URL;

// tsconfig.json 中关于类型的配置说明：
// {
//   "compilerOptions": {
//     "types": [],           // 指定包含的类型包（默认包含 node_modules/@types 下的所有）
//     "typeRoots": [         // 指定类型根目录
//       "./node_modules/@types",
//       "./src/types"
//     ]
//   },
//   "include": [
//     "src/**/*.d.ts"       // 确保包含自己的声明文件
//   ]
// }

// @types/ 类型包：
// - DefinitelyTyped 是社区维护的类型包仓库
// - npm install -D @types/react @types/react-dom 等
// - TypeScript 自动查找 node_modules/@types 目录下的类型
// - 没有内置类型的库需要自己写 declare module

// 三斜线指令（旧式引用，新项目一般用 import 代替）：
// /// <reference path="./types.d.ts" />
// /// <reference types="node" />
// 主要用于告诉编译器依赖的类型文件，但现代项目优先使用 tsconfig 的 types/include

// 为没有类型的第三方库写声明文件（如果没有 @types/ 包）：
// src/types/third-party-lib.d.ts
declare module 'some-untyped-lib' {
  export function someFunction(arg: string): number;
  export const someConstant: string;
  export default class SomeClass {
    constructor(options: { debug?: boolean });
    doSomething(): void;
  }
}

// 如果只需要快速让 TS 不报错误，可以用通配符声明（不推荐，丢失类型安全）
// declare module 'some-untyped-lib';
// declare module '*.xxx';
\`\`\`

模块声明是 TypeScript 与构建工具、第三方生态交互的桥梁，合理配置 d.ts 文件可以让你的开发体验更加顺畅，获得完整的类型提示。
`,
  },
  {
    id: "tsrx-ts-patterns",
    group: "类型高级篇",
    icon: "🧩",
    title: "React+TS常见类型模式",
    content: `## React+TS 常见类型模式

在日常 React + TypeScript 开发中，有一些反复出现的类型设计模式。掌握这些模式可以让你快速写出类型安全、易用性好的组件和 Hooks。

### 组件 Props 默认值与可选值设计

合理设计 props 的可选/必选，配合默认值让组件既灵活又易用：

\`\`\`tsx
import { ReactNode } from 'react';

// 1. 基础可选 props：用 ? 标记可选，在组件内设置默认值
type ButtonProps = {
  // 必选 props
  children: ReactNode;
  // 可选 props（带 ?）
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

function Button({
  children,
  variant = 'primary', // 解构默认值：不传时使用 'primary'
  size = 'md',
  disabled = false,
  onClick,
  className,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  } as const;
  const sizes = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' } as const;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[base, variants[variant], sizes[size], disabled && 'opacity-50', className]
        .filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}

// 使用时：必选 props 必须传，可选 props 不传时用默认值
<Button>默认按钮</Button>
<Button variant="danger" size="lg">大号危险按钮</Button>

// 2. 判别联合 props：根据某个 prop 的值决定其他 props 是否必选
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
} & (
  | { variant: 'alert'; message: string } // alert 变体必须有 message
  | { variant: 'confirm'; message: string; onConfirm: () => void } // confirm 必须有 onConfirm
  | { variant: 'form'; children: ReactNode } // form 变体必须有 children
);

function Modal(props: ModalProps) {
  const { isOpen, onClose, title, variant } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {variant === 'alert' && <p>{props.message}</p>}
        {variant === 'confirm' && (
          <>
            <p className="mb-4">{props.message}</p>
            <Button variant="danger" onClick={props.onConfirm}>确认</Button>
          </>
        )}
        {variant === 'form' && props.children}
        <button onClick={onClose} className="mt-4 text-gray-500">关闭</button>
      </div>
    </div>
  );
}
\`\`\`

### 受控 + 非受控统一模式（类 Radix UI）

同时支持受控模式（value + onChange）和非受控模式（defaultValue），是成熟 UI 组件的标配：

\`\`\`tsx
import { useState, useCallback } from 'react';

// useControllableState：同时支持受控和非受控的 Hook
type UseControllableStateProps<T> = {
  value?: T;           // 受控值（父组件控制）
  defaultValue?: T;    // 非受控默认值（自己控制）
  onChange?: (value: T) => void;
};

function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>): [T | undefined, (next: T) => void] {
  // 内部状态（非受控时使用）
  const [internalValue, setInternalValue] = useState(defaultValue);
  // 判断是否受控
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback((next: T) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  }, [isControlled, onChange]);

  return [value, setValue];
}

// 使用 useControllableState 实现支持受控/非受控的 Input
type ControllableInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

function ControllableInput({
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder,
}: ControllableInputProps) {
  const [value, setValue] = useControllableState({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="border px-3 py-2 rounded"
    />
  );
}

// 使用示例：
function ControlledDemo() {
  // 非受控模式：只传 defaultValue
  const [uncontrolledValue, setUncontrolledValue] = useState('');

  // 受控模式：传 value + onChange
  const [controlledValue, setControlledValue] = useState('');

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">非受控（自己管状态）</p>
        <ControllableInput defaultValue="默认值" placeholder="非受控输入" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">受控（父组件管状态）</p>
        <ControllableInput
          value={controlledValue}
          onChange={setControlledValue}
          placeholder="受控输入"
        />
        <p className="text-sm mt-1">当前值: {controlledValue}</p>
      </div>
    </div>
  );
}
\`\`\`

### API 响应泛型与递归 TreeNode 类型

API 响应和树形结构是前端最常见的数据结构，用泛型和递归类型完美描述：

\`\`\`tsx
import { useState, useEffect } from 'react';

// API 响应泛型
type ApiSuccess<T> = {
  success: true;
  code: 200;
  data: T;
  message: string;
};

type ApiError = {
  success: false;
  code: number; // 400, 401, 403, 404, 500...
  message: string;
  errors?: Record<string, string[]>; // 字段验证错误
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 分页响应
type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// 通用 API fetch Hook
function useApi<T>(url: string, options?: RequestInit) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let aborted = false;
    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(url, options)
      .then(async res => {
        const json: ApiResponse<T> = await res.json();
        if (aborted) return;
        if (json.success) {
          setState({ data: json.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: json.message });
        }
      })
      .catch(err => {
        if (aborted) return;
        setState({ data: null, loading: false, error: err.message });
      });

    return () => { aborted = true; };
  }, [url]);

  return state;
}

// 递归 TreeNode 类型：菜单、目录、评论嵌套、组织架构
type TreeNode<T = Record<string, unknown>> = {
  id: string;
  label: string;
  children?: TreeNode<T>[];
} & T; // 支持扩展任意自定义字段

// 递归渲染树组件
function Tree<T>({ nodes, renderNode, level = 0 }: {
  nodes: TreeNode<T>[];
  renderNode: (node: TreeNode<T>, level: number) => React.ReactNode;
  level?: number;
}) {
  return (
    <ul className={level > 0 ? 'pl-4' : ''}>
      {nodes.map(node => (
        <li key={node.id}>
          {renderNode(node, level)}
          {node.children && node.children.length > 0 && (
            <Tree nodes={node.children} renderNode={renderNode} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// 使用树形组件
type MenuItem = TreeNode<{ icon?: string; path?: string }>;

const menuData: MenuItem[] = [
    {
      id: '1', label: '首页', path: '/', icon: '🏠',
      children: [
        { id: '1-1', label: '推荐', path: '/recommend' },
        { id: '1-2', label: '热门', path: '/hot' },
      ],
    },
    {
      id: '2', label: '课程', icon: '📚',
      children: [
        {
          id: '2-1', label: '前端',
          children: [
            { id: '2-1-1', label: 'React', path: '/react' },
            { id: '2-1-2', label: 'Vue', path: '/vue' },
          ],
        },
        { id: '2-2', label: '后端', path: '/backend' },
      ],
    },
];
\`\`\`

### as const、satisfies 与版本兼容

\`as const\` 保留字面量类型，\`satisfies\` 在满足类型的同时保留字面量，\`@deprecated\` 标记旧 API：

\`\`\`tsx
// as const：推导最精确的字面量类型
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
// STATUS.IDLE 类型是 'idle' 而不是 string
type Status = typeof STATUS[keyof typeof STATUS]; // 'idle' | 'loading' | 'success' | 'error'

// 字面量数组也可以用 as const
const COLORS = ['red', 'green', 'blue'] as const;
type Color = typeof COLORS[number]; // 'red' | 'green' | 'blue'

// satisfies：之前章节讲过，约束类型同时保留字面量
const routes = [
  { path: '/', name: '首页' },
  { path: '/about', name: '关于' },
  { path: '/courses', name: '课程' },
] as const satisfies readonly { path: string; name: string }[];

type RoutePath = typeof routes[number]['path']; // '/' | '/about' | '/courses'

// @deprecated 标记旧 props，但仍兼容（渐进式迁移）
type OldButtonProps = {
  /** @deprecated 使用 variant 代替 */
  type?: 'primary' | 'default';
  /** @deprecated 使用 size 代替 */
  large?: boolean;
};

type NewButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

type ButtonPropsV2 = NewButtonProps & OldButtonProps;

function ButtonV2(props: ButtonPropsV2) {
  // 将旧 props 映射到新 props
  const variant = props.variant ?? (props.type === 'primary' ? 'primary' : 'secondary');
  const size = props.size ?? (props.large ? 'lg' : 'md');

  // 开发环境警告用户使用新 API
  if (process.env.NODE_ENV === 'development') {
    if (props.type) {
      console.warn('[Button] type prop 已废弃，请使用 variant 代替');
    }
    if (props.large !== undefined) {
      console.warn('[Button] large prop 已废弃，请使用 size 代替');
    }
  }

  return <button className={\`btn-\${variant} btn-\${size}\`}>按钮</button>;
}

// 总结常见模式：
// 1. 可选 props + 解构默认值：最常用，简单灵活
// 2. 判别联合 props：根据变体决定必选 props
// 3. useControllableState：受控/非受控统一（参考 Radix UI 实现）
// 4. ApiResponse<T> + PaginatedData<T>：API 类型标准化
// 5. TreeNode<T> 递归类型：树形数据结构
// 6. as const + satisfies：精确的字面量类型推导
// 7. @deprecated：平滑的 API 版本迁移
\`\`\`

这些模式是从大量开源组件库和实际项目中提炼出来的最佳实践，熟练运用可以让你的代码既类型安全又具备优秀的开发体验。
`,
  },
];
