#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 验证OpenAPI规范
function validateOpenApiSpec() {
  try {
    console.log('🔍 开始验证OpenAPI规范...');
    
    // 检查文件是否存在
    const openApiPath = path.resolve('./openapi.json');
    if (!fs.existsSync(openApiPath)) {
      throw new Error(`OpenAPI规范文件不存在: ${openApiPath}`);
    }
    
    // 读取并解析JSON
    const content = fs.readFileSync(openApiPath, 'utf8');
    let openApiSpec;
    
    try {
      openApiSpec = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`OpenAPI规范JSON格式无效: ${parseError.message}`);
    }
    
    console.log(`✅ 文件格式有效: ${openApiPath}`);
    
    // 基本结构验证
    validateBasicStructure(openApiSpec);
    
    // 路径验证
    validatePaths(openApiSpec);
    
    // 组件验证
    validateComponents(openApiSpec);
    
    console.log('\n🎉 OpenAPI规范验证通过!');
    console.log(`📊 统计信息:`);
    console.log(`   - OpenAPI版本: ${openApiSpec.openapi}`);
    console.log(`   - API标题: ${openApiSpec.info?.title}`);
    console.log(`   - API版本: ${openApiSpec.info?.version}`);
    console.log(`   - 路径数量: ${Object.keys(openApiSpec.paths || {}).length}`);
    console.log(`   - 组件数量: ${Object.keys(openApiSpec.components?.schemas || {}).length}`);
    
  } catch (error) {
    console.error('❌ OpenAPI规范验证失败:', error.message);
    process.exit(1);
  }
}

// 验证基本结构
function validateBasicStructure(spec) {
  console.log('🔍 验证基本结构...');
  
  // 检查必需字段
  if (!spec.openapi) {
    throw new Error('缺少必需字段: openapi');
  }
  
  if (!spec.info) {
    throw new Error('缺少必需字段: info');
  }
  
  if (!spec.info.title) {
    throw new Error('缺少必需字段: info.title');
  }
  
  if (!spec.info.version) {
    throw new Error('缺少必需字段: info.version');
  }
  
  // 检查OpenAPI版本
  if (!spec.openapi.startsWith('3.')) {
    throw new Error(`不支持的OpenAPI版本: ${spec.openapi}，请使用3.x版本`);
  }
  
  console.log('✅ 基本结构验证通过');
}

// 验证路径
function validatePaths(spec) {
  console.log('🔍 验证API路径...');
  
  const paths = spec.paths || {};
  
  if (Object.keys(paths).length === 0) {
    console.warn('⚠️  警告: 没有定义任何API路径');
    return;
  }
  
  Object.entries(paths).forEach(([path, pathItem]) => {
    // 验证路径格式
    if (!path.startsWith('/')) {
      throw new Error(`路径格式无效: ${path}，路径必须以'/'开头`);
    }
    
    // 验证HTTP方法
    const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];
    const methods = Object.keys(pathItem).filter(key => validMethods.includes(key.toLowerCase()));
    
    if (methods.length === 0) {
      throw new Error(`路径 ${path} 没有定义任何HTTP方法`);
    }
    
    // 验证每个方法的操作
    methods.forEach(method => {
      const operation = pathItem[method];
      
      if (!operation.responses) {
        throw new Error(`路径 ${path} 的 ${method.toUpperCase()} 方法缺少responses定义`);
      }
      
      // 检查是否有成功响应
      const hasSuccessResponse = Object.keys(operation.responses).some(code => 
        code.startsWith('2') || code === 'default'
      );
      
      if (!hasSuccessResponse) {
        console.warn(`⚠️  警告: 路径 ${path} 的 ${method.toUpperCase()} 方法没有定义成功响应`);
      }
    });
  });
  
  console.log(`✅ 路径验证通过 (${Object.keys(paths).length}个路径)`);
}

// 验证组件
function validateComponents(spec) {
  console.log('🔍 验证组件定义...');
  
  const components = spec.components || {};
  const schemas = components.schemas || {};
  
  if (Object.keys(schemas).length === 0) {
    console.warn('⚠️  警告: 没有定义任何组件模式');
    return;
  }
  
  Object.entries(schemas).forEach(([name, schema]) => {
    // 验证模式名称
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
      throw new Error(`组件名称格式无效: ${name}，应该使用PascalCase格式`);
    }
    
    // 验证模式类型
    if (schema.type && !['object', 'array', 'string', 'number', 'integer', 'boolean'].includes(schema.type)) {
      throw new Error(`组件 ${name} 的类型无效: ${schema.type}`);
    }
    
    // 验证对象属性
    if (schema.type === 'object' && schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]) => {
        if (propSchema.$ref && !propSchema.$ref.startsWith('#/components/schemas/')) {
          throw new Error(`组件 ${name} 的属性 ${propName} 引用格式无效: ${propSchema.$ref}`);
        }
      });
    }
  });
  
  console.log(`✅ 组件验证通过 (${Object.keys(schemas).length}个组件)`);
}

// 主函数
function main() {
  console.log('🔧 OpenAPI规范验证器');
  console.log('===================\n');
  
  validateOpenApiSpec();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  validateOpenApiSpec
};