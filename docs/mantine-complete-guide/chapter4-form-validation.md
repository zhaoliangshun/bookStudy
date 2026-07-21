# 第四章 · Mantine Form 验证

> "Forms are the backbone of most web applications."

表单是 Web 应用中最常见的交互方式，也是用户体验的关键环节。Mantine 提供了独立的 `@mantine/form` 包，专门用于处理表单状态管理和验证。与传统的表单库不同，Mantine Form 采用了 **headless** 的设计理念——它不绑定任何 UI 组件，可以与任何表单控件配合使用，同时也与 Mantine 组件深度集成。本章将从 `useForm` 的基础用法、验证策略、schema 验证、异步验证、嵌套表单、动态字段、以及实战中的最佳实践等七个维度，全面讲解 Mantine Form 的验证系统。

---

## 4.1 useForm 基础

### 4.1.1 安装与引入

`@mantine/form` 是一个独立的包，需要单独安装：

```bash
npm install @mantine/form
```

```javascript
import { useForm } from '@mantine/form';
```

### 4.1.2 基本用法

`useForm` 是 Mantine Form 的核心 hook，它返回一个包含表单状态和操作方法的对象。

```javascript
import { useForm } from '@mantine/form';
import { TextInput, Button, Group } from '@mantine/core';

function MyForm() {
  const form = useForm({
    // 初始值
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (values) => {
    console.log('Form data:', values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
      />
      
      <TextInput
        label="Password"
        type="password"
        placeholder="Your password"
        {...form.getInputProps('password')}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
```

### 4.1.3 useForm 返回值详解

`useForm` 返回的对象包含以下核心属性和方法：

```javascript
const form = useForm({
  initialValues: { email: '', password: '' },
});

// 核心属性
form.values;          // 当前表单值 { email: '', password: '' }
form.errors;          // 当前错误 { email: 'Invalid email' }
form.isDirty;         // 表单是否被修改过
form.isTouched;       // 是否有字段被触碰过（失焦）
form.isSubmitting;    // 表单是否正在提交

// 核心方法
form.getInputProps('email');           // 获取字段的 props（value, onChange, onBlur）
form.getInputState('email');           // 获取字段的状态（value, error, isTouched）
form.setFieldValue('email', 'new');    // 设置字段值
form.setFieldError('email', 'Error');  // 设置字段错误
form.setValues({ email: 'new' });      // 批量设置值
form.setErrors({ email: 'Error' });    // 批量设置错误
form.validate();                       // 手动触发验证
form.validateField('email');           // 验证单个字段
form.reset();                          // 重置表单到初始值
form.resetDirty();                     // 重置 dirty 状态
form.onReset(callback);                // 注册重置回调
form.onSubmit(handler);                // 提交处理函数
```

### 4.1.4 getInputProps 详解

`getInputProps` 是连接表单状态和 UI 组件的桥梁，它返回一个包含 `value`、`onChange`、`onBlur` 的对象。

```javascript
const inputProps = form.getInputProps('email');

// 返回值结构
{
  value: form.values.email,
  onChange: (event) => {
    const value = event.currentTarget.value;
    form.setFieldValue('email', value);
  },
  onBlur: () => {
    // 标记字段为 touched
    // 如果 validateInputOnBlur 为 true，会触发验证
  },
};
```

**自定义组件集成**：

```javascript
// 与自定义组件集成
function CustomInput({ value, onChange, onBlur, error }) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e)}
        onBlur={onBlur}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

function MyForm() {
  const form = useForm({
    initialValues: { custom: '' },
  });

  return (
    <form>
      <CustomInput {...form.getInputProps('custom')} />
    </form>
  );
}
```

---

## 4.2 验证策略

Mantine Form 提供了三种验证策略，可以在不同时机触发验证。

### 4.2.1 提交时验证（默认）

默认情况下，表单只在提交时触发验证。

```javascript
const form = useForm({
  initialValues: { email: '' },
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
  },
});

// 提交时触发验证
<form onSubmit={form.onSubmit((values) => console.log(values))}>
  <TextInput {...form.getInputProps('email')} />
  <Button type="submit">Submit</Button>
</form>
```

### 4.2.2 输入时验证（validateInputOnChange）

启用后，每次字段值变化都会触发验证。

```javascript
const form = useForm({
  initialValues: { email: '' },
  validateInputOnChange: true, // 全局启用
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
  },
});

// 或者针对特定字段启用
const form = useForm({
  initialValues: { email: '' },
  validateInputOnChange: ['email'], // 只对 email 字段启用
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
  },
});
```

### 4.2.3 失焦时验证（validateInputOnBlur）

启用后，字段失焦时触发验证。

```javascript
const form = useForm({
  initialValues: { email: '' },
  validateInputOnBlur: true, // 全局启用
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
  },
});

// 或者针对特定字段启用
const form = useForm({
  initialValues: { email: '' },
  validateInputOnBlur: ['email'], // 只对 email 字段启用
  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
  },
});
```

### 4.2.4 验证策略对比

| 策略 | 触发时机 | 优点 | 缺点 | 推荐场景 |
|------|----------|------|------|----------|
| 提交时验证 | 表单提交 | 减少干扰，用户填完再验证 | 反馈延迟 | 简单表单、长表单 |
| 输入时验证 | 每次值变化 | 即时反馈 | 可能过于频繁，影响体验 | 密码强度、实时校验 |
| 失焦时验证 | 字段失焦 | 平衡即时性和干扰 | 需要用户主动离开字段 | 大多数表单（推荐） |

---

## 4.3 验证规则

### 4.3.1 基础验证规则

`validate` 属性接受一个对象，键为字段名，值为验证函数。

```javascript
const form = useForm({
  initialValues: {
    email: '',
    age: '',
    password: '',
  },
  validate: {
    // 邮箱验证
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    
    // 年龄验证（必须大于 18）
    age: (value) => (value >= 18 ? null : 'Must be at least 18'),
    
    // 密码验证（至少 8 位）
    password: (value) => {
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
      if (!/[0-9]/.test(value)) return 'Password must contain number';
      return null;
    },
  },
});
```

### 4.3.2 验证函数签名

验证函数接受两个参数：`value`（字段值）和 `values`（所有字段值）。

```javascript
const form = useForm({
  initialValues: {
    password: '',
    confirmPassword: '',
  },
  validate: {
    // 使用第二个参数访问其他字段
    confirmPassword: (value, values) => {
      return value === values.password ? null : 'Passwords do not match';
    },
  },
});
```

### 4.3.3 条件验证

某些字段的验证规则依赖于其他字段的值。

```javascript
const form = useForm({
  initialValues: {
    hasDiscount: false,
    discountCode: '',
  },
  validate: {
    discountCode: (value, values) => {
      // 只有当 hasDiscount 为 true 时才验证
      if (values.hasDiscount && !value) {
        return 'Discount code is required';
      }
      return null;
    },
  },
});
```

---

## 4.4 Schema 验证（v9 新特性）

Mantine v9 引入了统一的 `schemaResolver`，支持 zod、yup、valibot 等主流验证库。

### 4.4.1 使用 Zod

```bash
npm install @mantine/form zod
```

```javascript
import { useForm, schemaResolver } from '@mantine/form';
import { z } from 'zod';

// 定义 schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be at least 18'),
});

function MyForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      age: 0,
    },
    // 使用 schemaResolver 接入 zod
    validate: schemaResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput label="Email" {...form.getInputProps('email')} />
      <TextInput label="Password" type="password" {...form.getInputProps('password')} />
      <NumberInput label="Age" {...form.getInputProps('age')} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### 4.4.2 使用 Yup

```bash
npm install @mantine/form yup
```

```javascript
import { useForm, schemaResolver } from '@mantine/form';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required(),
});

const form = useForm({
  initialValues: { email: '', password: '' },
  validate: schemaResolver(schema),
});
```

### 4.4.3 使用 Valibot

```bash
npm install @mantine/form valibot
```

```javascript
import { useForm, schemaResolver } from '@mantine/form';
import * as v from 'valibot';

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
});

const form = useForm({
  initialValues: { email: '', password: '' },
  validate: schemaResolver(schema),
});
```

### 4.4.4 Schema 验证的优势

1. **类型安全**：Zod、Yup 等库可以从 schema 推导出 TypeScript 类型
2. **声明式语法**：验证规则更直观、更易读
3. **统一接口**：`schemaResolver` 提供统一的接入方式
4. **丰富的验证器**：内置大量常用验证器，减少手写正则

---

## 4.5 异步验证

某些验证需要调用后端 API（如检查用户名是否已存在），这时需要使用异步验证。

### 4.5.1 异步验证规则

```javascript
const form = useForm({
  initialValues: { username: '' },
  validate: {
    username: async (value) => {
      // 模拟 API 调用
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      
      if (data.exists) {
        return 'Username already taken';
      }
      return null;
    },
  },
});
```

### 4.5.2 异步验证的注意事项

1. **防抖处理**：异步验证应该在用户停止输入后触发，避免频繁请求
2. **取消机制**：如果用户快速修改字段，应该取消之前的请求
3. **加载状态**：异步验证期间应该显示加载指示器

```javascript
import { useDebouncedValue } from '@mantine/hooks';

function MyForm() {
  const form = useForm({
    initialValues: { username: '' },
    validateInputOnChange: ['username'],
    validate: {
      username: async (value) => {
        if (!value) return null;
        
        // 防抖处理（需要配合 useDebouncedValue）
        const response = await fetch(`/api/check-username?username=${value}`);
        const data = await response.json();
        
        return data.exists ? 'Username already taken' : null;
      },
    },
  });

  return (
    <form>
      <TextInput
        label="Username"
        {...form.getInputProps('username')}
        rightSection={form.isValidating('username') ? <Loader size="xs" /> : null}
      />
    </form>
  );
}
```

---

## 4.6 嵌套表单与数组字段

### 4.6.1 嵌套对象

Mantine Form 支持嵌套对象的表单管理。

```javascript
const form = useForm({
  initialValues: {
    user: {
      firstName: '',
      lastName: '',
      address: {
        street: '',
        city: '',
      },
    },
  },
  validate: {
    user: {
      firstName: (value) => (value.length < 2 ? 'Too short' : null),
      lastName: (value) => (value.length < 2 ? 'Too short' : null),
      address: {
        street: (value) => (!value ? 'Street is required' : null),
        city: (value) => (!value ? 'City is required' : null),
      },
    },
  },
});

// 访问嵌套字段
<form.getInputProps('user.firstName');
<form.getInputProps('user.address.street');
```

### 4.6.2 数组字段

Mantine Form 提供了专门的 API 来处理数组字段。

```javascript
const form = useForm({
  initialValues: {
    employees: [
      { name: '', age: 0 },
      { name: '', age: 0 },
    ],
  },
  validate: {
    employees: {
      name: (value) => (value.length < 2 ? 'Too short' : null),
      age: (value) => (value < 18 ? 'Must be at least 18' : null),
    },
  },
});

// 渲染数组字段
{form.values.employees.map((_, index) => (
  <Group key={index}>
    <TextInput
      label={`Employee ${index + 1} Name`}
      {...form.getInputProps(`employees.${index}.name`)}
    />
    <NumberInput
      label={`Employee ${index + 1} Age`}
      {...form.getInputProps(`employees.${index}.age`)}
    />
  </Group>
))}

// 数组操作方法
form.insertListItem('employees', { name: '', age: 0 });  // 添加项
form.removeListItem('employees', 0);                      // 删除项
form.reorderListItem('employees', { from: 0, to: 1 });   // 重排序
```

### 4.6.3 动态字段

动态字段是指根据用户操作动态添加或删除的字段。

```javascript
function DynamicForm() {
  const form = useForm({
    initialValues: {
      fields: [{ key: '', value: '' }],
    },
  });

  const addField = () => {
    form.insertListItem('fields', { key: '', value: '' });
  };

  const removeField = (index) => {
    form.removeListItem('fields', index);
  };

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      {form.values.fields.map((_, index) => (
        <Group key={index}>
          <TextInput
            placeholder="Key"
            {...form.getInputProps(`fields.${index}.key`)}
          />
          <TextInput
            placeholder="Value"
            {...form.getInputProps(`fields.${index}.value`)}
          />
          <Button color="red" onClick={() => removeField(index)}>
            Remove
          </Button>
        </Group>
      ))}
      
      <Button onClick={addField}>Add Field</Button>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 4.7 实战：构建复杂表单

### 4.7.1 多步骤表单

多步骤表单（Wizard Form）是常见的需求，可以通过状态管理实现。

```javascript
'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, NumberInput, Button, Stepper, Group } from '@mantine/core';

function MultiStepForm() {
  const [activeStep, setActiveStep] = useState(0);
  
  const form = useForm({
    initialValues: {
      // Step 1
      firstName: '',
      lastName: '',
      // Step 2
      email: '',
      phone: '',
      // Step 3
      age: 0,
      city: '',
    },
    validate: {
      firstName: (value) => (value.length < 2 ? 'Too short' : null),
      lastName: (value) => (value.length < 2 ? 'Too short' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: (value) => (/^\d{11}$/.test(value) ? null : 'Invalid phone'),
      age: (value) => (value < 18 ? 'Must be at least 18' : null),
      city: (value) => (!value ? 'City is required' : null),
    },
  });

  const nextStep = () => {
    // 验证当前步骤的字段
    const stepFields = {
      0: ['firstName', 'lastName'],
      1: ['email', 'phone'],
      2: ['age', 'city'],
    };

    const errors = form.validateFields(stepFields[activeStep]);
    if (Object.keys(errors).length === 0) {
      setActiveStep((current) => Math.min(current + 1, 2));
    }
  };

  const prevStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = (values) => {
    console.log('Final values:', values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stepper active={activeStep} mb="xl">
        <Stepper.Step label="Personal Info" description="Name">
          <TextInput
            label="First Name"
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last Name"
            {...form.getInputProps('lastName')}
          />
        </Stepper.Step>

        <Stepper.Step label="Contact" description="Email & Phone">
          <TextInput
            label="Email"
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Phone"
            {...form.getInputProps('phone')}
          />
        </Stepper.Step>

        <Stepper.Step label="Details" description="Age & City">
          <NumberInput
            label="Age"
            {...form.getInputProps('age')}
          />
          <TextInput
            label="City"
            {...form.getInputProps('city')}
          />
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button disabled={activeStep === 0} onClick={prevStep}>
          Back
        </Button>
        {activeStep < 2 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </Group>
    </form>
  );
}
```

### 4.7.2 表单与 API 集成

```javascript
function ApiForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 8 ? 'Too short' : null),
    },
  });

  const handleSubmit = async (values) => {
    try {
      form.setSubmitting(true);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        // 设置后端返回的错误
        form.setErrors(error.fieldErrors);
        return;
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput label="Email" {...form.getInputProps('email')} />
      <TextInput label="Password" type="password" {...form.getInputProps('password')} />
      <Button type="submit" loading={form.isSubmitting()}>
        Login
      </Button>
    </form>
  );
}
```

### 4.7.3 表单重置与脏检查

```javascript
function DirtyForm() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
    },
  });

  const handleReset = () => {
    if (form.isDirty()) {
      const confirmed = window.confirm('You have unsaved changes. Reset anyway?');
      if (!confirmed) return;
    }
    form.reset();
  };

  return (
    <form>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
      
      <Group>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
        <Button type="submit" disabled={!form.isDirty()}>
          Save
        </Button>
      </Group>
    </form>
  );
}
```

---

## 4.8 最佳实践与常见问题

### 4.8.1 最佳实践

1. **优先使用 Schema 验证**：对于复杂表单，使用 zod 或 yup 的 schema 验证比手写验证函数更清晰、更易维护。

2. **合理使用验证策略**：大多数场景推荐使用 `validateInputOnBlur`，在用户离开字段时验证，既提供即时反馈又不会过于干扰。

3. **异步验证要防抖**：异步验证必须配合防抖使用，避免频繁请求后端 API。

4. **嵌套表单要谨慎**：过深的嵌套会增加复杂度，建议扁平化数据结构。

5. **数组字段使用 key**：渲染数组字段时，确保使用稳定的 `key`，避免使用索引。

6. **表单提交要处理错误**：提交失败时，使用 `form.setErrors` 将后端错误映射到对应字段。

### 4.8.2 常见问题

**Q: 如何验证密码确认字段？**

A: 使用验证函数的第二个参数访问其他字段：

```javascript
validate: {
  confirmPassword: (value, values) => {
    return value === values.password ? null : 'Passwords do not match';
  },
}
```

**Q: 如何手动触发验证？**

A: 使用 `form.validate()` 或 `form.validateField('fieldName')`。

**Q: 如何在提交前验证所有字段？**

A: `form.onSubmit` 会自动触发验证，只有验证通过才会调用回调函数。

**Q: 如何处理后端返回的错误？**

A: 使用 `form.setErrors({ fieldName: 'Error message' })` 设置字段错误。

**Q: 数组字段如何添加验证？**

A: 在 `validate` 中使用嵌套结构：

```javascript
validate: {
  employees: {
    name: (value) => (value.length < 2 ? 'Too short' : null),
    age: (value) => (value < 18 ? 'Must be at least 18' : null),
  },
}
```

---

## 4.9 本章小结

本章全面讲解了 Mantine Form 的验证系统，从 `useForm` 的基础用法到三种验证策略，从基础验证规则到 schema 验证，从异步验证到嵌套表单和数组字段，最后通过实战案例展示了多步骤表单、API 集成等常见场景。

核心要点：
- `useForm` 是 Mantine Form 的核心 hook，提供完整的表单状态管理和操作方法
- 三种验证策略（提交时、输入时、失焦时）适用于不同场景
- v9 的 `schemaResolver` 统一了 zod、yup、valibot 等验证库的接入方式
- 异步验证需要配合防抖和加载状态处理
- 嵌套表单和数组字段提供了灵活的数据结构支持
- 实战中推荐使用 schema 验证、合理选择验证策略、妥善处理异步和错误

至此，我们已经完成了 Mantine 的四大核心主题：设计理念、设计目的、Theme 系统、Form 验证。希望本书能够帮助你深入理解 Mantine 的设计哲学和实战技巧，在实际项目中构建出优秀的 Web 应用。
