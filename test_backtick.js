// 测试：未转义的内部反引号会发生什么？
const obj = {
  code: `
    throw new Error(\`正确转义的\`);
    throw new Error(`未转义的`);
  `,
};
console.log(obj.code);
