// Auto-generated API client from OpenAPI specification
import axios from 'axios';

export class ApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10秒超时
    });

    // 设置请求拦截器
    this.setupRequestInterceptors();
    
    // 设置响应拦截器
    this.setupResponseInterceptors();
  }

  // 设置请求拦截器
  setupRequestInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // 自动从localStorage获取token
        const token = localStorage.getItem('token');
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加请求时间戳
        config.metadata = { startTime: new Date() };

        // 开发环境下打印请求信息
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // 设置响应拦截器
  setupResponseInterceptors() {
    this.client.interceptors.response.use(
      (response) => {
        // 计算请求耗时
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;

        // 开发环境下打印响应信息
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      (error) => {
        // 统一错误处理
        return this.handleResponseError(error);
      }
    );
  }

  // 统一错误处理
  handleResponseError(error) {
    const { response, request, message } = error;

    if (response) {
      // 服务器响应了错误状态码
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // token过期或无效
          console.warn('🔐 Token expired or invalid, redirecting to login...');
          this.clearAuthToken();
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          
          // 触发全局事件，通知应用跳转到登录页
          window.dispatchEvent(new CustomEvent('auth:logout', { 
            detail: { reason: 'token_expired' } 
          }));
          break;
          
        case 403:
          console.error('🚫 Access forbidden:', data?.message || 'No permission');
          break;
          
        case 404:
          console.error('🔍 Resource not found:', error.config?.url);
          break;
          
        case 422:
          console.error('📝 Validation error:', data?.errors || data?.message);
          break;
          
        case 500:
          console.error('💥 Server error:', data?.message || 'Internal server error');
          break;
          
        default:
          console.error(`❌ HTTP Error ${status}:`, data?.message || message);
      }

      // 抛出格式化的错误
      const formattedError = new Error(data?.message || `HTTP Error ${status}`);
      formattedError.status = status;
      formattedError.data = data;
      return Promise.reject(formattedError);
      
    } else if (request) {
      // 网络错误或请求超时
      console.error('🌐 Network Error:', message);
      const networkError = new Error('网络连接失败，请检查网络设置');
      networkError.type = 'network';
      return Promise.reject(networkError);
      
    } else {
      // 其他错误
      console.error('⚠️ Request Setup Error:', message);
      return Promise.reject(error);
    }
  }

  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // 用户登录
  async userLogin(data) {
    const response = await this.client.post('/api/auth/login', data);
    return response.data;
  }

  // 获取用户列表
  async getUserList(params = {}) {
    const response = await this.client.get('/api/users', { params });
    return response.data;
  }

  // 创建用户
  async createUser(data) {
    const response = await this.client.post('/api/users', data);
    return response.data;
  }

  // 根据ID获取用户
  async getUserById(id) {
    const response = await this.client.get(`/api/users/${id}`);
    return response.data;
  }

  // 更新用户
  async updateUser(id, data) {
    const response = await this.client.put(`/api/users/${id}`, data);
    return response.data;
  }

  // 删除用户
  async deleteUser(id) {
    const response = await this.client.delete(`/api/users/${id}`);
    return response.data;
  }

  // 重置用户密码
  async resetUserPassword(id, data) {
    const response = await this.client.post(`/api/users/${id}/reset-password`, data);
    return response.data;
  }
}

// 默认API客户端实例
export const apiClient = new ApiClient();