#!/usr/bin/env node
// =============================================================
// GraphQL 执行器 - 独立子进程
// -------------------------------------------------------------
// 作用：作为独立进程加载 graphql 包，处理 GraphQL 查询执行，
//       避免 Turbopack 打包 graphql 时的 ChunkLoadError。
//
// 通信协议：通过 stdin/stdout 传递 JSON
//   输入 JSON: { sdl: string, resolversCode: string, query: string }
//   输出 JSON: { data: object|null, errors: [{message: string}]|null }
// =============================================================

const { buildSchema, graphql } = require("graphql");
const {
  createContext,
  runInContext,
  Script,
} = require("vm");

/**
 * 在沙箱中执行 resolvers 代码，返回 resolvers 对象。
 */
function executeResolvers(resolversCode) {
  const sandbox = {
    console: {
      log: (...args) => {},
      error: (...args) => {},
      warn: (...args) => {},
    },
    setTimeout: () => {},
    setImmediate: (fn) => fn(),
    Promise,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    Math,
    JSON,
    RegExp,
    Error,
    Map,
    Set,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    btoa: (s) => Buffer.from(s).toString("base64"),
    atob: (s) => Buffer.from(s, "base64").toString("utf8"),
  };

  const context = createContext(sandbox);

  const wrappedCode = `
    ${resolversCode}
    result = typeof resolvers !== "undefined" ? resolvers : null;
  `;

  const script = new Script(wrappedCode, {
    filename: "resolvers.js",
    lineOffset: 0,
  });

  script.runInContext(context, {
    timeout: 5000,
    displayErrors: true,
  });

  return context.result;
}

// 读取 stdin 全部数据
let inputData = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    const { sdl, resolversCode, query } = JSON.parse(inputData);

    if (!sdl || !resolversCode || !query) {
      process.stdout.write(
        JSON.stringify({
          data: null,
          errors: [
            {
              message:
                "缺少必要参数: sdl, resolversCode, query",
            },
          ],
        })
      );
      process.exit(0);
    }

    // 1. 构建 Schema
    let schema;
    try {
      schema = buildSchema(sdl);
    } catch (err) {
      process.stdout.write(
        JSON.stringify({
          data: null,
          errors: [
            {
              message: `Schema 构建错误: ${err.message}`,
            },
          ],
        })
      );
      process.exit(0);
    }

    // 2. 执行 resolvers
    let resolvers;
    try {
      resolvers = executeResolvers(resolversCode);
      if (!resolvers) {
        process.stdout.write(
          JSON.stringify({
            data: null,
            errors: [
              {
                message:
                  "Resolvers 代码执行后未返回 resolvers 对象，请确保定义了 const resolvers = { ... }。",
              },
            ],
          })
        );
        process.exit(0);
      }
    } catch (err) {
      let errorMsg = err.message || String(err);
      if (err.stack) {
        errorMsg = err.stack.split("\n")[0];
      }
      process.stdout.write(
        JSON.stringify({
          data: null,
          errors: [
            {
              message: `Resolvers 执行错误: ${errorMsg}`,
            },
          ],
        })
      );
      process.exit(0);
    }

    // 3. 执行查询
    graphql({
      schema,
      source: query,
      rootValue: resolvers,
    }).then((result) => {
      process.stdout.write(
        JSON.stringify({
          data: result.data || null,
          errors: result.errors
            ? result.errors.map((e) => ({
                message: e.message,
              }))
            : null,
        })
      );
      process.exit(0);
    }).catch((err) => {
      process.stdout.write(
        JSON.stringify({
          data: null,
          errors: [
            {
              message: `查询执行错误: ${err.message}`,
            },
          ],
        })
      );
      process.exit(0);
    });
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        data: null,
        errors: [{ message: `输入解析错误: ${err.message}` }],
      })
    );
    process.exit(0);
  }
});