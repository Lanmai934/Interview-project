#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 确保输出目录存在
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 创建目录: ${dirPath}`);
  }
}

// 从OpenAPI规范生成TypeScript API客户端
function generateApiFromOpenAPI() {
  try {
    console.log('🚀 开始生成API SDK...');
    
    // 读取OpenAPI规范
    const openApiPath = path.resolve('./openapi.json');
    if (!fs.existsSync(openApiPath)) {
      throw new Error(`OpenAPI规范文件不存在: ${openApiPath}`);
    }
    
    const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    console.log(`✅ 读取OpenAPI规范: ${openApiPath}`);
    
    // 确保输出目录存在
    const outputDir = './src/api/generated';
    ensureDirectoryExists(outputDir);
    
    // 生成API客户端代码
    const apiCode = generateApiClient(openApiSpec);
    const apiFilePath = path.join(outputDir, 'api.ts');
    fs.writeFileSync(apiFilePath, apiCode);
    console.log(`✅ 生成API客户端: ${apiFilePath}`);
    
    // 生成类型定义
    const typesCode = generateTypes(openApiSpec);
    const typesFilePath = path.join(outputDir, 'types.ts');
    fs.writeFileSync(typesFilePath, typesCode);
    console.log(`✅ 生成类型定义: ${typesFilePath}`);
    
    // 生成索引文件
    const indexCode = `// Auto-generated API SDK\nexport * from './api';\nexport * from './types';\n`;
    const indexFilePath = path.join(outputDir, 'index.ts');
    fs.writeFileSync(indexFilePath, indexCode);
    console.log(`✅ 生成索引文件: ${indexFilePath}`);
    
    console.log('\n🎉 API SDK生成完成!');
    
  } catch (error) {
    console.error('❌ API SDK生成失败:', error.message);
    process.exit(1);
  }
}

// 生成TypeScript类型定义
function generateTypes(openApiSpec) {
  const schemas = openApiSpec.components?.schemas || {};
  
  let typesCode = `// Auto-generated types from OpenAPI specification\n\n`;
  
  // 生成接口类型
  Object.entries(schemas).forEach(([name, schema]) => {
    typesCode += generateInterface(name, schema);
    typesCode += '\n\n';
  });
  
  return typesCode;
}

// 生成单个接口
function generateInterface(name, schema) {
  let interfaceCode = `export interface ${name} {\n`;
  
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      const isRequired = schema.required?.includes(propName) || false;
      const optional = isRequired ? '' : '?';
      const type = getTypeScriptType(propSchema);
      const description = propSchema.description ? ` // ${propSchema.description}` : '';
      
      interfaceCode += `  ${propName}${optional}: ${type};${description}\n`;
    });
  }
  
  interfaceCode += '}';
  return interfaceCode;
}

// 将OpenAPI类型转换为TypeScript类型
function getTypeScriptType(schema) {
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }
  
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map(v => `'${v}'`).join(' | ');
      }
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      const itemType = getTypeScriptType(schema.items);
      return `${itemType}[]`;
    case 'object':
      if (schema.additionalProperties) {
        return 'Record<string, any>';
      }
      return 'object';
    default:
      return 'any';
  }
}

// 生成API客户端代码
function generateApiClient(openApiSpec) {
  const baseUrl = openApiSpec.servers?.[0]?.url || 'http://localhost:3000';
  const paths = openApiSpec.paths || {};
  
  let apiCode = `// Auto-generated API client from OpenAPI specification\nimport axios, { AxiosInstance, AxiosResponse } from 'axios';\nimport * as Types from './types';\n\n`;
  
  // 生成API客户端类
  apiCode += `export class ApiClient {\n`;
  apiCode += `  private client: AxiosInstance;\n\n`;
  
  // 构造函数
  apiCode += `  constructor(baseURL: string = '${baseUrl}') {\n`;
  apiCode += `    this.client = axios.create({\n`;
  apiCode += `      baseURL,\n`;
  apiCode += `      headers: {\n`;
  apiCode += `        'Content-Type': 'application/json',\n`;
  apiCode += `      },\n`;
  apiCode += `    });\n`;
  apiCode += `  }\n\n`;
  
  // 设置认证token方法
  apiCode += `  setAuthToken(token: string) {\n`;
  apiCode += `    this.client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;\n`;
  apiCode += `  }\n\n`;
  
  // 生成API方法
  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (operation.operationId) {
        apiCode += generateApiMethod(path, method, operation);
        apiCode += '\n\n';
      }
    });
  });
  
  apiCode += '}\n\n';
  
  // 导出默认实例
  apiCode += `// 默认API客户端实例\nexport const apiClient = new ApiClient();\n`;
  
  return apiCode;
}

// 生成单个API方法
function generateApiMethod(path, method, operation) {
  const methodName = operation.operationId;
  const summary = operation.summary || '';
  const parameters = operation.parameters || [];
  const requestBody = operation.requestBody;
  
  let methodCode = `  /**\n   * ${summary}\n   */\n`;
  
  // 方法签名
  let params = [];
  let pathParams = [];
  let queryParams = [];
  
  // 处理路径参数和查询参数
  parameters.forEach(param => {
    if (param.in === 'path') {
      pathParams.push(param.name);
      params.push(`${param.name}: ${getTypeScriptType(param.schema)}`);
    } else if (param.in === 'query') {
      queryParams.push(param.name);
      const optional = param.required ? '' : '?';
      params.push(`${param.name}${optional}: ${getTypeScriptType(param.schema)}`);
    }
  });
  
  // 处理请求体
  if (requestBody) {
    params.push('data: any');
  }
  
  methodCode += `  async ${methodName}(${params.join(', ')}): Promise<AxiosResponse<any>> {\n`;
  
  // 构建URL
  let url = path;
  pathParams.forEach(param => {
    url = url.replace(`{${param}}`, `\${${param}}`);
  });
  
  // 构建查询参数
  if (queryParams.length > 0) {
    methodCode += `    const params = {\n`;
    queryParams.forEach(param => {
      methodCode += `      ${param},\n`;
    });
    methodCode += `    };\n`;
  }
  
  // 发送请求
  const requestConfig = [];
  if (queryParams.length > 0) {
    requestConfig.push('{ params }');
  }
  
  if (requestBody) {
    methodCode += `    return this.client.${method}(\`${url}\`, data${requestConfig.length > 0 ? ', ' + requestConfig.join(', ') : ''});\n`;
  } else {
    methodCode += `    return this.client.${method}(\`${url}\`${requestConfig.length > 0 ? ', ' + requestConfig.join(', ') : ''});\n`;
  }
  
  methodCode += `  }`;
  
  return methodCode;
}

// 主函数
function main() {
  console.log('🔧 API SDK生成器');
  console.log('================\n');
  
  generateApiFromOpenAPI();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateApiFromOpenAPI
};