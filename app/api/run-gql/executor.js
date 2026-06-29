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
//
// Resolver 签名适配：
//   教程代码使用标准 (parent, args, context, info) 签名，
//   本执行器通过自定义 fieldResolver 统一适配，支持：
//   1. 根级 Query/Mutation resolver
//   2. 嵌套类型 resolver（如 User: { fullName: (parent) => ... }）
// =============================================================

const { buildSchema, graphql, defaultFieldResolver } = require("graphql");
const {
  createContext,
  runInContext,
  Script,
} = require("vm");

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
    Buffer,
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

function createFieldResolver(resolvers) {
  const queryResolvers = resolvers.Query || {};
  const mutationResolvers = resolvers.Mutation || {};
  const subscriptionResolvers = resolvers.Subscription || {};

  const typeResolvers = {};
  for (const [typeName, fieldResolvers] of Object.entries(resolvers)) {
    if (typeName !== "Query" && typeName !== "Mutation" && typeName !== "Subscription" && typeof fieldResolvers === "object" && fieldResolvers !== null) {
      typeResolvers[typeName] = fieldResolvers;
    }
  }

  return function fieldResolver(source, args, contextValue, info) {
    const fieldName = info.fieldName;
    const parentTypeName = info.parentType.name;

    let resolverFn = null;

    if (parentTypeName === "Query" && typeof queryResolvers[fieldName] === "function") {
      resolverFn = queryResolvers[fieldName];
    } else if (parentTypeName === "Mutation" && typeof mutationResolvers[fieldName] === "function") {
      resolverFn = mutationResolvers[fieldName];
    } else if (parentTypeName === "Subscription" && typeof subscriptionResolvers[fieldName] === "function") {
      resolverFn = subscriptionResolvers[fieldName];
    } else if (typeResolvers[parentTypeName] && typeof typeResolvers[parentTypeName][fieldName] === "function") {
      resolverFn = typeResolvers[parentTypeName][fieldName];
    }

    if (resolverFn) {
      return resolverFn(source, args, contextValue, info);
    }

    return defaultFieldResolver(source, args, contextValue, info);
  };
}

function createTypeResolver(resolvers) {
  const resolveTypeMap = {};
  for (const [typeName, fieldResolvers] of Object.entries(resolvers)) {
    if (
      typeName !== "Query" &&
      typeName !== "Mutation" &&
      typeName !== "Subscription" &&
      typeof fieldResolvers === "object" &&
      fieldResolvers !== null &&
      typeof fieldResolvers.__resolveType === "function"
    ) {
      resolveTypeMap[typeName] = fieldResolvers.__resolveType;
    }
  }

  return function typeResolver(value, contextValue, info, abstractType) {
    const fn = resolveTypeMap[abstractType.name];
    if (fn) {
      return fn(value, contextValue, info, abstractType);
    }
    return undefined;
  };
}

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
              message: "缺少必要参数: sdl, resolversCode, query",
            },
          ],
        })
      );
      process.exit(0);
    }

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

    let resolvers;
    try {
      resolvers = executeResolvers(resolversCode);
      if (!resolvers) {
        process.stdout.write(
          JSON.stringify({
            data: null,
            errors: [
              {
                message: "Resolvers 代码执行后未返回 resolvers 对象，请确保定义了 const resolvers = { ... }。",
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

    const fieldResolver = createFieldResolver(resolvers);
    const typeResolver = createTypeResolver(resolvers);

    graphql({
      schema,
      source: query,
      rootValue: {},
      fieldResolver,
      typeResolver,
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
