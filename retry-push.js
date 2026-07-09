#!/usr/bin/env node
// ============================================
// 失败重试脚本：自动执行git操作，失败重试直至成功
// ============================================

const { execSync } = require('child_process');

// 配置
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

// 带重试的命令执行
async function execWithRetry(command, description) {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('');
      console.log('🔄 [' + attempt + '/' + MAX_RETRIES + '] ' + description + '...');
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ ' + description + ' 成功');
      if (result && result.trim()) {
        console.log(result.trim());
      }
      return result;
    } catch (err) {
      lastError = err;
      const errorMsg = err.stderr || err.message || String(err);
      console.log('❌ 失败 (' + attempt + '/' + MAX_RETRIES + '): ' + errorMsg.substring(0, 300));
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.min(attempt, 3);
        console.log('⏳ 等待 ' + (delay/1000) + ' 秒后重试...');
        await sleep(delay);
      }
    }
  }
  
  throw new Error(description + ' 在重试' + MAX_RETRIES + '次后仍然失败: ' + lastError.message);
}

async function main() {
  console.log('========================================');
  console.log('  📚 Node.js后端开发书籍 - 自动发布脚本');
  console.log('========================================');
  
  try {
    // 1. 检查git状态
    await execWithRetry('git status', '检查Git状态');
    
    // 2. 添加所有文件
    await execWithRetry('git add .', '添加所有变更文件');
    
    // 3. 提交
    await execWithRetry(
      'git commit -m "feat: 添加Node.js Web后端开发实战书籍，包含21章丰富Demo和详细注释"',
      '提交变更'
    );
    
    // 4. 拉取最新代码（可能有冲突，需要重试）
    await execWithRetry('git pull --rebase', '拉取最新代码(rebase)');
    
    // 5. 推送
    await execWithRetry('git push', '推送到远程仓库');
    
    console.log('');
    console.log('🎉 成功完成！Node.js后端开发书籍已提交并推送！');
    console.log('');
    console.log('📚 书籍包含以下章节（共21章）：');
    console.log('   🚀 开篇：为什么选择Node.js做后端');
    console.log('   📦 第一部分：基础篇（环境搭建、模块系统、HTTP、异步编程）');
    console.log('   ⚡ 第二部分：Express框架核心（入门、中间件、路由、Req/Res）');
    console.log('   🗄️ 第三部分：数据库实战（MySQL、MongoDB、Sequelize ORM）');
    console.log('   🔐 第四部分：工程化与安全（错误日志、JWT认证、输入验证）');
    console.log('   🎯 第五部分：项目实战（RESTful、测试、完整博客API）');
    console.log('   🚢 第六部分：部署运维（PM2/Nginx/Docker、失败重试）');
    console.log('   🌟 结尾：总结与精进');
    
  } catch (err) {
    console.error('');
    console.error('💥 最终失败:', err.message);
    process.exit(1);
  }
}

main();
