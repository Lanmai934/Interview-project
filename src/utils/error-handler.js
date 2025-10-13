// 统一错误处理工具类
import Vue from 'vue'

export class ErrorHandler {
  /**
   * 处理API错误
   * @param {Error} error - 错误对象
   * @param {Object} options - 处理选项
   */
  static handleApiError(error, options = {}) {
    const {
      showMessage = true,
      logError = true,
      customMessage = null
    } = options

    if (logError) {
      console.error('API Error:', error)
    }

    if (!showMessage) return

    let message = customMessage
    
    if (!message) {
      if (error.status) {
        // HTTP错误
        switch (error.status) {
          case 400:
            message = '请求参数错误'
            break
          case 401:
            message = '未授权访问'
            break
          case 403:
            message = '访问被拒绝'
            break
          case 404:
            message = '请求的资源不存在'
            break
          case 422:
            message = error.data?.message || '数据验证失败'
            break
          case 500:
            message = '服务器内部错误'
            break
          case 502:
            message = '网关错误'
            break
          case 503:
            message = '服务暂时不可用'
            break
          default:
            message = error.message || `请求失败 (${error.status})`
        }
      } else if (error.type === 'network') {
        message = '网络连接失败，请检查网络设置'
      } else {
        message = error.message || '操作失败，请稍后重试'
      }
    }

    // 显示错误消息
    Vue.prototype.$message.error(message)
  }

  /**
   * 处理表单验证错误
   * @param {Object} errors - 验证错误对象
   */
  static handleValidationErrors(errors) {
    if (typeof errors === 'object' && errors !== null) {
      const firstError = Object.values(errors)[0]
      if (Array.isArray(firstError)) {
        Vue.prototype.$message.error(firstError[0])
      } else {
        Vue.prototype.$message.error(firstError)
      }
    }
  }

  /**
   * 处理业务逻辑错误
   * @param {string} message - 错误消息
   * @param {string} type - 消息类型 (error, warning, info)
   */
  static handleBusinessError(message, type = 'error') {
    Vue.prototype.$message[type](message)
  }

  /**
   * 异步操作错误处理装饰器
   * @param {Function} asyncFn - 异步函数
   * @param {Object} options - 错误处理选项
   */
  static async withErrorHandling(asyncFn, options = {}) {
    try {
      return await asyncFn()
    } catch (error) {
      this.handleApiError(error, options)
      throw error // 重新抛出错误，让调用者决定是否需要进一步处理
    }
  }

  /**
   * 为Vue组件方法添加错误处理
   * @param {Object} component - Vue组件实例
   * @param {string} methodName - 方法名
   * @param {Object} options - 错误处理选项
   */
  static wrapComponentMethod(component, methodName, options = {}) {
    const originalMethod = component[methodName]
    
    component[methodName] = async function(...args) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        ErrorHandler.handleApiError(error, options)
        if (!options.suppressError) {
          throw error
        }
      }
    }
  }
}

// 全局错误处理混入
export const errorHandlingMixin = {
  methods: {
    /**
     * 安全执行异步操作
     * @param {Function} asyncFn - 异步函数
     * @param {Object} options - 选项
     */
    async $safeAsync(asyncFn, options = {}) {
      const {
        loading = null,
        successMessage = null,
        errorOptions = {}
      } = options

      // 设置loading状态
      if (loading && typeof loading === 'string') {
        this[loading] = true
      }

      try {
        const result = await asyncFn()
        
        // 显示成功消息
        if (successMessage) {
          this.$message.success(successMessage)
        }
        
        return result
      } catch (error) {
        ErrorHandler.handleApiError(error, errorOptions)
        throw error
      } finally {
        // 清除loading状态
        if (loading && typeof loading === 'string') {
          this[loading] = false
        }
      }
    },

    /**
     * 处理API错误
     */
    $handleError(error, options = {}) {
      ErrorHandler.handleApiError(error, options)
    }
  }
}

export default ErrorHandler