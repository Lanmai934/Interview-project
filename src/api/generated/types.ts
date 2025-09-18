// Auto-generated types from OpenAPI specification

export interface User {
  id: number; // 用户ID
  username: string; // 用户名
  email: string; // 邮箱地址
  status?: 'active' | 'inactive'; // 用户状态
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

export interface LoginRequest {
  username: string; // 用户名
  password: string; // 密码
}

export interface LoginResponse {
  success?: boolean; // 登录是否成功
  message?: string; // 响应消息
  token?: string; // JWT令牌
  user?: User;
}

export interface CreateUserRequest {
  username: string; // 用户名
  email: string; // 邮箱地址
  status?: 'active' | 'inactive'; // 用户状态
}

export interface UpdateUserRequest {
  username?: string; // 用户名
  email?: string; // 邮箱地址
  status?: 'active' | 'inactive'; // 用户状态
}

export interface UserResponse {
  success?: boolean;
  message?: string;
  data?: User;
}

export interface UserListResponse {
  success?: boolean;
  data?: User[];
  total?: number; // 总数量
  page?: number; // 当前页码
  limit?: number; // 每页数量
}

export interface SuccessResponse {
  success?: boolean;
  message?: string;
}

export interface ErrorResponse {
  success?: boolean;
  message?: string; // 错误消息
  code?: string; // 错误代码
  details?: Record<string, any>; // 错误详情
}

