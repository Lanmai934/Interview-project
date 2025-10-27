#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.development' });

// 加载配置
const config = require('../api-config.js');

// 自动切换到Mock服务的环境变量
async function switchToMockEnvironment() {
  try {
    log('🔄 自动切换到Mock服务环境...', 'cyan');
    
    const envPath = path.join(__dirname, '..', '.env.development');
    let envContent = '';
    
    // 读取现有环境变量文件
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // 检查是否已经配置为Mock服务
    const mockApiPattern = /VUE_APP_BASE_API\s*=\s*['"]?http:\/\/localhost:4010\/api['"]?/;
    
    if (mockApiPattern.test(envContent)) {
      log('✅ 环境变量已配置为Mock服务', 'green');
      return true;
    }
    
    // 替换或添加Mock服务配置
    const baseApiPattern = /VUE_APP_BASE_API\s*=\s*['"]?[^'"\n\r]*['"]?/;
    const mockApiConfig = "VUE_APP_BASE_API = 'http://localhost:4010/api'";
    
    if (baseApiPattern.test(envContent)) {
      // 替换现有配置
      envContent = envContent.replace(baseApiPattern, mockApiConfig);
    } else {
      // 添加新配置
      envContent = mockApiConfig + '\n\n' + envContent;
    }
    
    // 写入文件
    fs.writeFileSync(envPath, envContent, 'utf8');
    log('✅ 已自动切换到Mock服务环境', 'green');
    log('   前端API调用地址: http://localhost:4010/api', 'cyan');
    
    return true;
  } catch (error) {
    log(`⚠️ 环境变量切换失败: ${error.message}`, 'yellow');
    return false;
  }
}

// 恢复到后端服务的环境变量
async function switchToBackendEnvironment() {
  try {
    log('🔄 切换回后端服务环境...', 'cyan');
    
    const envPath = path.join(__dirname, '..', '.env.development');
    let envContent = '';
    
    // 读取现有环境变量文件
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // 替换为后端服务配置
    const baseApiPattern = /VUE_APP_BASE_API\s*=\s*['"]?[^'"\n\r]*['"]?/;
    const backendApiConfig = "VUE_APP_BASE_API = 'http://localhost:3000'";
    
    if (baseApiPattern.test(envContent)) {
      envContent = envContent.replace(baseApiPattern, backendApiConfig);
    } else {
      envContent = backendApiConfig + '\n\n' + envContent;
    }
    
    // 写入文件
    fs.writeFileSync(envPath, envContent, 'utf8');
    log('✅ 已切换到真实后端服务环境', 'green');
    log('   前端API调用地址: http://localhost:3000 (需要后端服务运行)', 'cyan');
    
    return true;
  } catch (error) {
    log(`⚠️ 环境变量切换失败: ${error.message}`, 'yellow');
    return false;
  }
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行命令并返回Promise
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// 检查后端服务是否可用
async function checkBackendHealth() {
  try {
    log('🔍 检查后端服务状态...', 'cyan');
    const healthUrl = `${config.remote.baseURL}`;
    
    // 使用curl检查服务状态（检查根路径）
    await execCommand(`curl -f -s ${healthUrl}`, { timeout: 5000 });
    log('✅ 后端服务正常运行', 'green');
    return true;
  } catch (error) {
    log('⚠️ 后端服务不可用，将使用本地备份', 'yellow');
    return false;
  }
}

// 拉取最新的OpenAPI规范
async function fetchLatestSpec() {
  try {
    log('📥 拉取最新API规范...', 'cyan');
    
    // 运行API生成脚本（已包含远程拉取逻辑）
    await execCommand('node scripts/generate-api.js');
    log('✅ API规范拉取成功', 'green');
    return true;
  } catch (error) {
    log(`❌ API规范拉取失败: ${error.message}`, 'red');
    return false;
  }
}

// 生成JavaScript版本的API客户端
async function generateJSClient() {
  try {
    log('🔧 生成JavaScript API客户端...', 'cyan');
    
    // 读取生成的TypeScript API客户端
    const tsApiPath = './src/api/generated/api.ts';
    if (!fs.existsSync(tsApiPath)) {
      throw new Error('TypeScript API客户端不存在');
    }
    
    // 更新JavaScript版本的API客户端
    const { generateApiFromOpenAPI } = require('./generate-api.js');
    
    // 读取最新的OpenAPI规范
    const specPath = fs.existsSync('./openapi.json') ? './openapi.json' : config.localFallback;
    const openApiSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    
    // 生成JavaScript API方法
    const jsApiPath = './src/api/generated/api.js';
    if (fs.existsSync(jsApiPath)) {
      // 读取现有的JavaScript客户端
      let jsContent = fs.readFileSync(jsApiPath, 'utf8');
      
      // 检查是否需要添加新方法
      const paths = openApiSpec.paths || {};
      const newMethods = [];
      
      for (const [pathKey, pathValue] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(pathValue)) {
          if (typeof operation === 'object' && operation.operationId) {
            const methodName = operation.operationId;
            if (!jsContent.includes(`async ${methodName}(`)) {
              newMethods.push(generateJSMethod(pathKey, method, operation));
            }
          }
        }
      }
      
      if (newMethods.length > 0) {
        // 在类的最后一个方法后添加新方法
        const insertPoint = jsContent.lastIndexOf('}', jsContent.lastIndexOf('}') - 1);
        const newContent = jsContent.slice(0, insertPoint) + 
          '\n' + newMethods.join('\n') + '\n' + 
          jsContent.slice(insertPoint);
        
        fs.writeFileSync(jsApiPath, newContent);
        log(`✅ 添加了 ${newMethods.length} 个新的API方法`, 'green');
      } else {
        log('✅ JavaScript API客户端已是最新', 'green');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ JavaScript客户端生成失败: ${error.message}`, 'red');
    return false;
  }
}

// 生成JavaScript方法
function generateJSMethod(path, method, operation) {
  const methodName = operation.operationId;
  const summary = operation.summary || '';
  
  // 提取路径参数
  const pathParams = (path.match(/{([^}]+)}/g) || []).map(p => p.slice(1, -1));
  
  // 构建参数列表
  let params = [];
  if (pathParams.length > 0) {
    params = pathParams;
  }
  
  if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
    params.push('data');
  } else if (method.toLowerCase() === 'get') {
    params.push('params = {}');
  }
  
  // 构建URL
  let url = path;
  pathParams.forEach(param => {
    url = url.replace(`{${param}}`, `\${${param}}`);
  });
  
  return `
  // ${summary}
  async ${methodName}(${params.join(', ')}) {
    const response = await this.client.${method.toLowerCase()}(\`${url}\`${['post', 'put', 'patch'].includes(method.toLowerCase()) ? ', data' : params.includes('params = {}') ? ', { params }' : ''});
    return response.data;
  }`;
}

// 启动Mock服务
async function startMockServer() {
  try {
    log('🎭 启动Mock服务器...', 'cyan');
    
    // 在启动Mock服务前，确保拉取最新的OpenAPI规范
    log('📥 确保使用最新的OpenAPI规范...', 'cyan');
    const specFetched = await fetchLatestSpec();
    if (!specFetched) {
      log('⚠️ 无法获取最新规范，使用本地备份...', 'yellow');
    } else {
      log('✅ 已获取最新OpenAPI规范', 'green');
    }
    
    const mockPort = process.env.MOCK_PORT || 4010;
    const specFile = fs.existsSync('./openapi.json') ? './openapi.json' : config.localFallback;
    
    // 验证规范文件存在
    if (!fs.existsSync(specFile)) {
      throw new Error(`OpenAPI规范文件不存在: ${specFile}`);
    }
    
    // 显示规范文件的更新时间
    const specStats = fs.statSync(specFile);
    const updateTime = specStats.mtime.toLocaleString('zh-CN');
    log(`📅 规范文件更新时间: ${updateTime}`, 'blue');
    
    // 检查端口是否被占用
    try {
      await execCommand(`netstat -an | findstr :${mockPort}`);
      log(`⚠️ 端口 ${mockPort} 已被占用，尝试终止现有进程...`, 'yellow');
      
      // 尝试终止占用端口的进程
      try {
        await execCommand(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${mockPort}') do taskkill /f /pid %a`);
      } catch (e) {
        // 忽略错误，继续尝试启动
      }
    } catch (e) {
      // 端口未被占用，继续
    }
    
    // 启动Mock服务器
    const mockCommand = `npx prism mock ${specFile} --port ${mockPort} --host localhost`;
    log(`🚀 启动命令: ${mockCommand}`, 'blue');
    log(`📋 使用规范文件: ${specFile}`, 'blue');
    
    const mockProcess = spawn('npx', ['prism', 'mock', specFile, '--port', mockPort, '--host', 'localhost'], {
      stdio: 'inherit',
      shell: true
    });
    
    // 等待一下确保服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log(`✅ Mock服务器已启动: http://localhost:${mockPort}`, 'green');
    log(`📄 基于最新OpenAPI规范提供Mock数据`, 'green');
    return mockProcess;
  } catch (error) {
    log(`❌ Mock服务器启动失败: ${error.message}`, 'red');
    return null;
  }
}

// 启动文档服务
async function startDocsServer() {
  try {
    log('📚 启动API文档服务...', 'cyan');
    
    const docsPort = process.env.DOCS_PORT || 8080;
    const specFile = fs.existsSync('./openapi.json') ? './openapi.json' : config.localFallback;
    
    // 检查端口是否被占用
    try {
      await execCommand(`netstat -an | findstr :${docsPort}`);
      log(`⚠️ 端口 ${docsPort} 已被占用，跳过文档服务启动`, 'yellow');
      return null;
    } catch (e) {
      // 端口未被占用，继续
    }
    
    // 启动文档服务器
    const docsProcess = spawn('npx', ['swagger-ui-serve', specFile, '--port', docsPort], {
      stdio: 'inherit',
      shell: true
    });
    
    // 等待一下确保服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log(`✅ API文档已启动: http://localhost:${docsPort}`, 'green');
    return docsProcess;
  } catch (error) {
    log(`❌ API文档服务启动失败: ${error.message}`, 'red');
    return null;
  }
}

// 主函数
async function main() {
  log('🚀 前后端API协同开发工具 - 真实后端模式', 'bright');
  log('==========================================', 'bright');
  log('');
  
  try {
    // 1. 检查后端服务
    const backendAvailable = await checkBackendHealth();
    
    if (!backendAvailable) {
      log('❌ 后端服务不可用，请确保后端服务运行在 http://localhost:3000', 'red');
      log('💡 提示: 请先启动后端服务，然后重新运行此命令', 'yellow');
      process.exit(1);
    }
    
    // 2. 拉取最新API规范并生成JavaScript客户端
    const specFetched = await fetchLatestSpec();
    if (!specFetched) {
      log('⚠️ 无法从后端获取API规范，使用本地备份继续...', 'yellow');
    }
    
    // 3. 生成JavaScript客户端
    await generateJSClient();
    
    // 4. 切换到真实后端服务环境
    await switchToBackendEnvironment();
    log('💡 提示: 前端服务需要重启以应用新的环境变量', 'yellow');
    
    // 5. 启动文档服务（可选）
    const docsProcess = await startDocsServer();
    
    log('');
    log('🎉 真实后端API开发环境已就绪!', 'green');
    log('');
    log('📋 可用服务:', 'bright');
    log(`   🔗 后端API: http://localhost:3000`, 'cyan');
    log(`   📚 后端API文档: http://localhost:3000/api-docs`, 'cyan');
    if (docsProcess) {
      log(`   📖 本地API文档: http://localhost:${process.env.DOCS_PORT || 8080}`, 'cyan');
    }
    log(`   🔧 前端开发: npm run serve`, 'cyan');
    log('');
    log('💡 提示: 前端现在将直接连接到真实后端服务', 'green');
    log('💡 提示: 按 Ctrl+C 停止文档服务', 'yellow');
    
    // 监听退出信号
    process.on('SIGINT', () => {
      log('\n🛑 正在停止服务...', 'yellow');
      if (docsProcess) docsProcess.kill();
      process.exit(0);
    });
    
    // 保持进程运行（如果有文档服务）
    if (docsProcess) {
      await new Promise(() => {}); // 永远等待
    }
    
  } catch (error) {
    log(`❌ 执行失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkBackendHealth,
  fetchLatestSpec,
  generateJSClient,
  startMockServer,
  startDocsServer,
  switchToMockEnvironment,
  switchToBackendEnvironment
};