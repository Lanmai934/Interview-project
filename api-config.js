// API生成配置文件
module.exports = {
  // OpenAPI规范文件路径（可以是本地文件或远程URL）
  // 优先使用环境变量，如果没有则使用本地文件（因为后端服务没有提供openapi.json端点）
  openApiSpec: process.env.API_SPEC_URL || './openapi.json', // 使用本地文件
  localFallback: './openapi.json', // 本地备份文件
  
  // 远程拉取配置
  remote: {
    // 后端API服务地址
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    // OpenAPI规范端点
    specEndpoint: '/openapi.json',
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 重试次数
    retries: 3,
    // 是否保存到本地作为备份
    saveLocal: true
  },
  
  // 生成的API文件输出目录
  outputDir: './src/api/generated',
  
  // 生成的文件名
  fileName: 'api.js',
  
  // swagger-typescript-api 配置选项
  generateOptions: {
    name: 'api.js',
    output: './src/api/generated',
    url: '', // 如果使用远程URL，在这里设置
    input: './openapi.json', // 本地文件路径
    httpClientType: 'axios', // 使用axios作为HTTP客户端
    generateClient: true,
    generateRouteTypes: true,
    generateResponses: true,
    toJS: true, // 生成JavaScript文件
    extractRequestParams: true,
    extractRequestBody: true,
    extractEnums: true,
    modular: false,
    silent: false,
    defaultResponseAsSuccess: false,
    generateUnionEnums: false,
    typePrefix: '',
    typeSuffix: '',
    enumNamesAsValues: false,
    moduleNameFirstTag: false,
    generateClient: true,
    sortTypes: false,
    extractRequestParams: true,
    singleHttpClient: true,
    cleanOutput: true,
    enumNamesAsValues: false,
    moduleNameIndex: 0,
    hooks: {
      onCreateRoute: (routeData) => {
        // 自定义路由创建逻辑
        return routeData;
      },
      onCreateRequestParams: (rawType) => {
        // 自定义请求参数处理
        return rawType;
      },
      onParseSchema: (originalSchema, parsedSchema) => {
        // 自定义schema解析
        return parsedSchema;
      }
    }
  },
  
  // Prism Mock服务器配置
  prismConfig: {
    port: 4010,
    host: 'localhost',
    cors: true,
    dynamic: false,
    validate: true
  },
  
  // Swagger UI配置
  swaggerUIConfig: {
    port: 8080,
    host: 'localhost',
    title: 'API Documentation',
    description: '项目API接口文档'
  }
};