# API协同开发指南

## 概述

本项目已配置为支持前后端API协同开发，前端可以自动拉取后端最新的OpenAPI规范，生成SDK和Mock服务，实现高效的前后端协同开发。

## 功能特性

- 🔄 **自动拉取**: 从后端自动获取最新的OpenAPI规范
- 🛠️ **SDK生成**: 自动生成TypeScript和JavaScript API客户端
- 🎭 **Mock服务**: 启动Mock API服务器进行前端独立开发
- 📚 **API文档**: 自动生成并启动API文档服务
- 🔧 **一键启动**: 单个命令启动完整的开发环境

## 环境配置

### 环境变量

在 `.env.development` 文件中配置以下变量：

```bash
# Vue应用配置
VUE_APP_BASE_API = '/api'

# API生成配置
API_BASE_URL = 'http://localhost:3000'
API_SPEC_URL = 'http://localhost:3000/openapi.json'

# Mock服务配置
MOCK_PORT = 4010
DOCS_PORT = 8080
```

### 后端要求

确保后端服务提供以下端点：

- `GET /openapi.json` - OpenAPI规范文件
- `GET /health` - 健康检查端点（可选）

## 使用方法

### 1. 一键启动协同开发环境

```bash
npm run dev:sync
```

这个命令会：
- 检查后端服务状态
- 自动拉取最新API规范（支持本地备份）
- 生成JavaScript API客户端
- 启动Mock API服务器
- **🆕 自动切换前端环境变量到Mock服务**
- 启动API文档服务

### 2. 仅拉取最新API规范

```bash
npm run api:pull
```

### 3. 手动生成API客户端

```bash
npm run api:generate
```

### 4. 启动Mock服务

```bash
npm run api:mock
```

### 5. 启动API文档

```bash
npm run api:docs
```

## 开发工作流

### 场景1: 后端API已更新

1. 运行 `npm run api:pull` 拉取最新规范
2. 检查生成的API客户端代码
3. 更新前端代码以使用新的API

### 场景2: 前端独立开发（推荐）

1. 运行 `npm run dev:sync` 启动完整环境
   - ✅ 自动启动Mock API服务
   - ✅ 自动切换前端API调用地址到Mock服务
   - ✅ 自动启动API文档服务
2. 重启前端服务 `npm run serve` 应用新的环境变量
3. 使用Mock API进行前端开发
4. 查看API文档了解接口详情

> **🎯 一键切换**: `npm run dev:sync` 会自动将 `VUE_APP_BASE_API` 切换到 `http://localhost:4010/api`，无需手动修改环境变量！

### 场景3: 前后端联调

1. 确保后端服务运行在配置的地址
2. 运行 `npm run api:pull` 获取最新规范
3. 运行 `npm run serve` 启动前端服务
4. 进行联调测试

## 服务地址

启动后可访问以下服务：

- **Mock API**: http://localhost:4010
- **API文档**: http://localhost:8080
- **前端应用**: http://localhost:8081 (运行 `npm run serve`)

## 配置说明

### api-config.js

主要配置文件，包含：

```javascript
module.exports = {
  // 远程配置
  remote: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    specEndpoint: '/openapi.json',
    timeout: 10000,
    retries: 3,
    saveLocal: true
  },
  
  // 本地备份文件
  localFallback: './openapi.json',
  
  // 输出目录
  outputDir: './src/api/generated'
};
```

### 环境变量优先级

1. `API_SPEC_URL` - 完整的OpenAPI规范URL
2. `API_BASE_URL` + `/openapi.json` - 基础URL + 默认端点
3. 本地备份文件 `./openapi.json`

## 环境切换功能

### 自动切换到Mock服务

当运行 `npm run dev:sync` 时，系统会自动：

1. **检测当前环境配置**
   - 读取 `.env.development` 文件
   - 检查 `VUE_APP_BASE_API` 当前值

2. **智能切换**
   - 如果已经是Mock服务地址，跳过切换
   - 如果是其他地址，自动切换到 `http://localhost:4010/api`

3. **提示重启**
   - 显示环境变量已更新的提示
   - 提醒需要重启前端服务以应用新配置

### 手动切换环境

如果需要手动切换环境，可以直接修改 `.env.development` 文件：

```bash
# 切换到Mock服务
VUE_APP_BASE_API = 'http://localhost:4010/api'

# 切换到后端服务
VUE_APP_BASE_API = '/api'

# 切换到其他服务
VUE_APP_BASE_API = 'http://other-server:3000/api'
```

> **💡 提示**: 修改环境变量后，需要重启前端服务 (`npm run serve`) 才能生效。

## 故障排除

### 后端服务不可用

- 系统会自动使用本地备份的OpenAPI规范
- 检查 `API_BASE_URL` 配置是否正确
- 确认后端服务是否正常运行

### Mock服务启动失败

- 检查端口是否被占用
- 尝试修改 `MOCK_PORT` 环境变量
- 确认OpenAPI规范文件格式正确

### API客户端生成失败

- 验证OpenAPI规范格式：`npm run api:validate`
- 检查网络连接
- 查看错误日志定位问题

## 最佳实践

1. **定期同步**: 建议每天开始工作前运行 `npm run api:pull`
2. **版本控制**: 将生成的API客户端代码提交到版本控制
3. **环境隔离**: 不同环境使用不同的 `.env` 文件
4. **错误处理**: 在API客户端中添加适当的错误处理
5. **文档查阅**: 经常查看API文档了解接口变更

## 扩展功能

### 自定义生成器

可以修改 `scripts/generate-api.js` 来自定义API客户端生成逻辑。

### 添加新的Mock数据

可以在Mock服务器中添加自定义的响应数据和行为。

### 集成CI/CD

可以将API同步集成到CI/CD流程中，确保部署时使用最新的API规范。

## 技术栈

- **OpenAPI 3.0**: API规范标准
- **Prism**: Mock服务器
- **Swagger UI**: API文档生成
- **Axios**: HTTP客户端
- **Node.js**: 脚本运行环境