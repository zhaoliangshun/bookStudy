"use client";

// =============================================================
// AI 编程方法交互式教程页面
// -------------------------------------------------------------
// 结构与 Node.js / Java / Python 教程页面基本一致，区别：
//   1. 数据源：aiChapters / aiChapterGroups（来自 ai-tutorial-data）
//   2. 运行接口：/api/run（Node.js 沙箱执行 JavaScript 代码）
//   4. 文案：AI 编程方法教程
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
const AmountInput = (props) => {
  const {
    onChange,
    value,
    disabled,
    className = "",
    maxLength = 13,
    min = 0,
    max = 999999999999,
    maxErrMsg,
    minErrMsg,
    decimals = 2,
  } = props;
  const oldVlaueRef = useRef("");
  const isMobileSize = true;

  useEffect(() => {
    if (value) {
      oldVlaueRef.current = value;
    }
  }, []);

  const onInputAmount = (e) => {
    let value = e.target.value;
    if (isMobileSize && e.target.getAttribute("data-init") == 1) {
      if (e.nativeEvent.data != null && e.nativeEvent.data != ".") {
        value = e.nativeEvent.data;
      }
      e.target.setAttribute("data-init", 0);
      e.target.setAttribute("maxLength", maxLength);
    }
    if (/[^\d.]/g.test(value)) {
      value = value.replace(/[^\d.]/g, "");
    }

    if (Number(value) <= 0) {
      onChange("");
      return;
    }

    if (!isNaN(Number(value))) {
      const parts = value.split(".");
      const integerPart = parts[0];
      if (integerPart.length > 8) {
        return;
      }
      if (!/\.[0-9]{3,}/.test(value)) {
        onChange(value);
      } else {
        onChange(value.substring(0, value.indexOf(".") + 3));
      }
    } else {
      // alert('Illegal input');
    }
  };

  const [isFocus, setIsFocus] = useState(false);
  const onFocusAmount = (e) => {
    e.target.placeholder = "";
    if (isMobileSize) {
      e.preventDefault();
      e.target.setAttribute("data-init", 1);
      e.target.removeAttribute("maxLength");
      e.target.setSelectionRange(10, 10);
      setTimeout(function () {
        e.target.setSelectionRange(10, 10);
      });
    }
    setIsFocus(true);
    if (e.target.value === "-") {
      onChange("");
    }
  };

  const onBlurAmount = (e) => {
    e.target.placeholder = "-";
    setIsFocus(false);
    let isErr = false;
    if (isNaN(Number(value)) || Number(value) <= 0) {
      isErr = true;
    } else if (parseFloat(value) < min) {
      isErr = true;
      minErrMsg && alert(minErrMsg);
    } else if (parseFloat(value) > max) {
      isErr = true;
      maxErrMsg && alert(maxErrMsg);
    }
    if (isErr) {
      onChange(oldVlaueRef.current);
    } else {
      onChange(Number(value));
      oldVlaueRef.current = Number(value);
    }
  };
  let showValue = !value || isFocus ? value : value;
  return (
    <div className={`HKJCAmountInputContainer ${className}`}>
      <input
        placeholder="-"
                autoComplete="off"
                maxLength={maxLength}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                onChange={onInputAmount}
                onFocus={onFocusAmount}
                onBlur={onBlurAmount}
                className="AmountInput"
                value={showValue}
      />
    </div>
  );
};

export default function AITutorial() {
  const [value, onChange] = useState(999);

  return <AmountInput onChange={onChange} value={value} />;
}
