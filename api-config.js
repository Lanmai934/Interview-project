// API生成配置文件
module.exports = {
  // OpenAPI规范文件路径（可以是本地文件或远程URL）
  openApiSpec: './openapi.json', // 本地文件
  // openApiSpec: 'http://localhost:3000/openapi.json', // 远程URL
  
  // 生成的API文件输出目录
  outputDir: './src/api/generated',
  
  // 生成的文件名
  fileName: 'api.ts',
  
  // swagger-typescript-api 配置选项
  generateOptions: {
    name: 'api.ts',
    output: './src/api/generated',
    url: '', // 如果使用远程URL，在这里设置
    input: './openapi.json', // 本地文件路径
    httpClientType: 'axios', // 使用axios作为HTTP客户端
    generateClient: true,
    generateRouteTypes: true,
    generateResponses: true,
    toJS: false, // 生成TypeScript文件
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