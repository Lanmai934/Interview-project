# Vue Admin System

一个基于 Vue 2.x 和 Ant Design Vue 的后台管理系统模板。

## 功能特性

### 1. 用户认证
- 登录/登出功能
- 基于 token 的身份验证
- 路由守卫保护

### 2. 用户管理
- 用户列表展示
- 用户增删改查
- 表格虚拟滚动
- 自定义表格组件
- 状态切换
- 分页查询

### 3. 表单设计器
- 拖拽式表单设计
- 多种表单组件
- 表单预览
- 表单配置
- 实时预览

### 4. 布局系统
- 响应式布局
- 可折叠侧边栏
- 面包屑导航
- 动态路由菜单

### 5. 组件封装
- BaseTable：封装表格组件，支持虚拟滚动
- BaseForm：通用表单组件
- BaseModal：模态框组件
- FormDesigner：表单设计器组件

## 技术栈

- **前端框架**：Vue 2.x
- **UI 组件库**：Ant Design Vue 1.7.x
- **状态管理**：Vuex
- **路由管理**：Vue Router
- **HTTP 请求**：Axios
- **Mock 数据**：Mock.js
- **样式处理**：Less
- **构建工具**：Vue CLI

## 项目结构
src/
├── api/ # API 接口
├── assets/ # 静态资源
├── components/ # 公共组件
│ ├── BaseTable/ # 表格组件
│ ├── BaseForm/ # 表单组件
│ └── FormDesigner/ # 表单设计器
├── layout/ # 布局组件
├── mock/ # Mock 数据
├── router/ # 路由配置
├── store/ # Vuex 状态管理
├── utils/ # 工具函数
└── views/ # 页面组件
├── login/ # 登录页
├── users/ # 用户管理
└── FormBuilder/ # 表单设计器

Node.js 版本
node >= 12.x
依赖安装
npm install
开发服务器启动
npm run serve
生产环境构建
npm run build
代码检查
npm run lint

{
"vue": "^2.6.14",
"ant-design-vue": "^1.7.8",
"vue-router": "^3.5.3",
"vuex": "^3.6.2",
"axios": "^0.21.1"
}

## 功能展示

### 1. 用户管理
- 支持大数据量表格展示
- 虚拟滚动优化性能
- 自定义表格操作列
- 灵活的查询和筛选

### 2. 表单设计器
- 组件拖拽
- 属性配置
- 实时预览
- 表单验证

### 3. 布局功能
- 响应式设计
- 菜单折叠
- 主题定制
- 面包屑导航

## 开发规范

1. **命名规范**
   - 组件名：PascalCase
   - 文件名：kebab-case
   - 变量名：camelCase

2. **代码风格**
   - 使用 ESLint 进行代码检查
   - 遵循 Vue 官方风格指南

3. **组件开发**
   - 统一使用 Vue 单文件组件
   - 组件属性使用类型检查
   - 公共组件编写文档

## 注意事项

1. 开发环境需要安装 Node.js
2. 建议使用 VSCode 进行开发
3. 安装 Vue DevTools 调试工具
4. 遵循 Git 提交规范

## 后续计划

- [ ] 添加更多的表单组件
- [ ] 优化表格性能
- [ ] 添加主题定制功能
- [ ] 完善文档和示例