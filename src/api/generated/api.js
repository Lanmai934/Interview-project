// Auto-generated JavaScript API client from OpenAPI specification
import axios from 'axios';

export class ApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 用户登录
   */
  async userLogin(data) {
    const response = await this.client.post(`/api/users/login`, data);
    return response.data;
  }

  /**
   * 获取用户列表
   */
  async getUserList(page, limit, status) {
    const params = {
      page,
      limit,
      status,
    };
    const response = await this.client.get(`/api/users`, { params });
    return response.data;
  }

  /**
   * 创建用户
   */
  async createUser(data) {
    const response = await this.client.post(`/api/users`, data);
    return response.data;
  }

  /**
   * 获取用户详情
   */
  async getUserById(id) {
    const response = await this.client.get(`/api/users/${id}`);
    return response.data;
  }

  /**
   * 更新用户
   */
  async updateUser(id, data) {
    const response = await this.client.put(`/api/users/${id}`, data);
    return response.data;
  }

  /**
   * 删除用户
   */
  async deleteUser(id) {
    const response = await this.client.delete(`/api/users/${id}`);
    return response.data;
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id, data) {
    const response = await this.client.post(`/api/users/${id}/reset-password`, data);
    return response.data;
  }

}

// 默认API客户端实例
export const apiClient = new ApiClient();
