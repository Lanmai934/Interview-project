# OpenAPI 工具链使用指南

本项目集成了完整的 OpenAPI 工具链，支持前端 SDK 自动生成、API Mock 测试、文档可视化和 CI/CD 自动化。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 验证 OpenAPI 规范
```bash
npm run api:validate
```

### 3. 生成前端 SDK
```bash
npm run api:generate
```

### 4. 启动 Mock 服务器
```bash
npm run api:mock
```

### 5. 启动文档服务器
```bash
npm run api:docs
```

### 6. 启动完整开发环境
```bash
npm run dev:full
```

## 📁 项目结构

```
├── openapi.json                 # OpenAPI 规范文件
├── api-config.js               # API 工具配置
├── scripts/
│   ├── generate-api.js         # SDK 生成脚本
│   └── validate-api.js         # 规范验证脚本
├── src/api/generated/          # 自动生成的 API SDK
│   ├── api.ts                  # API 客户端类
│   ├── types.ts                # TypeScript 类型定义
│   └── index.ts                # 导出文件
└── .github/workflows/
    └── api-automation.yml      # CI/CD 工作流
```

## 🛠️ 可用命令

| 命令 | 描述 |
|------|------|
| `npm run api:validate` | 验证 OpenAPI 规范文件 |
| `npm run api:generate` | 生成前端 TypeScript SDK |
| `npm run api:mock` | 启动 Prism Mock 服务器 (端口 4010) |
| `npm run api:docs` | 启动 Swagger UI 文档服务器 (端口 8080) |
| `npm run api:test` | 验证规范并生成 SDK |
| `npm run dev:full` | 启动完整开发环境 |

## 🔧 配置说明

### OpenAPI 规范文件 (`openapi.json`)
- 定义 API 的所有端点、参数、响应和数据模型
- 支持 OpenAPI 3.0+ 规范
- 修改此文件后会自动触发 CI/CD 流程

### API 配置文件 (`api-config.js`)
- 配置 SDK 生成选项
- 设置 Mock 服务器参数
- 定义文档服务器配置

## 📦 生成的 SDK 使用方法

### 基本用法
```typescript
import { ApiClient, apiClient } from './src/api/generated';
import type { User, LoginRequest } from './src/api/generated';

// 使用默认客户端
const response = await apiClient.userLogin({
  username: 'admin',
  password: 'password123'
});

// 创建自定义客户端
const customClient = new ApiClient('https://api.example.com');
customClient.setAuthToken('your-jwt-token');

const users = await customClient.getUserList(1, 10, 'active');
```

### 类型安全
```typescript
// 所有 API 响应都有完整的类型定义
const createUserData: CreateUserRequest = {
  username: 'newuser',
  email: 'user@example.com',
  status: 'active'
};

const response = await apiClient.createUser(createUserData);
// response 自动推断为 AxiosResponse<any> 类型
```

## 🧪 Mock 测试

### 启动 Mock 服务器
```bash
npm run api:mock
```

Mock 服务器将在 `http://localhost:4010` 启动，提供以下端点：

- `POST /api/login` - 用户登录
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/{id}` - 获取用户详情
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 测试示例
```bash
# 测试登录
curl -X POST http://localhost:4010/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# 测试获取用户列表
curl "http://localhost:4010/api/users?page=1&limit=10&status=active"
```

## 📚 文档查看

### 启动文档服务器
```bash
npm run api:docs
```

访问 `http://localhost:8080` 查看交互式 API 文档。

文档功能：
- 📖 完整的 API 端点文档
- 🧪 在线测试 API 端点
- 📋 请求/响应示例
- 🔍 数据模型浏览

## ⚙️ CI/CD 自动化

### GitHub Actions 工作流

当以下文件发生变化时，会自动触发 CI/CD 流程：
- `openapi.json`
- `api-config.js`
- `scripts/generate-api.js`

### 自动化流程包括：

1. **API 规范验证** - 验证 OpenAPI 规范的有效性
2. **SDK 生成** - 自动生成最新的前端 SDK
3. **Mock 测试** - 测试所有 API 端点
4. **文档部署** - 部署 API 文档到 GitHub Pages
5. **自动提交** - 将生成的 SDK 文件提交到仓库

### 手动触发工作流
```bash
# 在 GitHub 仓库页面的 Actions 标签页中手动触发
# 或使用 GitHub CLI
gh workflow run api-automation.yml
```

## 🔄 开发工作流

### 1. 修改 API 规范
编辑 `openapi.json` 文件，添加或修改 API 端点。

### 2. 验证规范
```bash
npm run api:validate
```

### 3. 生成 SDK
```bash
npm run api:generate
```

### 4. 测试 Mock API
```bash
npm run api:mock
# 在另一个终端测试 API 端点
```

### 5. 查看文档
```bash
npm run api:docs
# 访问 http://localhost:8080
```

### 6. 提交更改
```bash
git add .
git commit -m "feat: update API specification"
git push
```

## 🛡️ 最佳实践

### OpenAPI 规范编写
- 使用清晰的操作 ID (`operationId`)
- 提供详细的描述和示例
- 定义完整的数据模型
- 使用适当的 HTTP 状态码

### SDK 使用
- 使用 TypeScript 获得完整的类型安全
- 设置适当的错误处理
- 配置请求拦截器和响应拦截器
- 使用环境变量管理 API 基础 URL

### 版本管理
- 遵循语义化版本控制
- 在 `openapi.json` 中更新版本号
- 使用 Git 标签标记 API 版本

## 🐛 故障排除

### 常见问题

**Q: SDK 生成失败**
A: 检查 OpenAPI 规范是否有效，运行 `npm run api:validate`

**Q: Mock 服务器无法启动**
A: 确保端口 4010 未被占用，或修改 `package.json` 中的端口配置

**Q: 文档服务器无法访问**
A: 确保端口 8080 未被占用，检查防火墙设置

**Q: CI/CD 工作流失败**
A: 检查 GitHub Actions 日志，确保所有依赖项正确安装

### 调试技巧

1. 使用 `npm run api:validate` 验证规范
2. 检查生成的文件是否存在于 `src/api/generated/`
3. 查看终端输出的详细错误信息
4. 确保所有依赖项已正确安装

## 📞 支持

如果遇到问题或需要帮助，请：
1. 查看本文档的故障排除部分
2. 检查项目的 Issues 页面
3. 创建新的 Issue 并提供详细信息

---

**注意**: 本工具链专为前端开发优化，后端服务需要单独部署和配置。