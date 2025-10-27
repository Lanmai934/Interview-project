// Auto-generated API client from OpenAPI specification
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Types from './types';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 用户登录
   */
  async userLogin(data: Types.LoginRequest): Promise<AxiosResponse<Types.LoginResponse>> {
    return this.client.post(`/api/users/login`, data);
  }

  /**
   * 获取用户列表
   */
  async getUserList(page?: number, limit?: number, status?: 'active' | 'inactive'): Promise<AxiosResponse<Types.UserListResponse>> {
    const params = {
      page,
      limit,
      status,
    };
    return this.client.get(`/api/users`, { params });
  }

  /**
   * 创建用户
   */
  async createUser(data: Types.CreateUserRequest): Promise<AxiosResponse<Types.any>> {
    return this.client.post(`/api/users`, data);
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number): Promise<AxiosResponse<Types.UserResponse>> {
    return this.client.get(`/api/users/${id}`);
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, data: Types.UpdateUserRequest): Promise<AxiosResponse<Types.UserResponse>> {
    return this.client.put(`/api/users/${id}`, data);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<AxiosResponse<Types.SuccessResponse>> {
    return this.client.delete(`/api/users/${id}`);
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: number, data: Types.ResetPasswordRequest): Promise<AxiosResponse<Types.SuccessResponse>> {
    return this.client.post(`/api/users/${id}/reset-password`, data);
  }

}

// 默认API客户端实例
export const apiClient = new ApiClient();
