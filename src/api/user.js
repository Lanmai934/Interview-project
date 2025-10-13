import { apiClient } from '@/api/generated/index.js';

// 用户登录
export function login(data) {
  return apiClient.userLogin(data)
}

// 获取用户列表
export function getUserList(params) {
  return apiClient.getUserList(params);
}

// 添加用户
export function addUser(data) {
  return apiClient.createUser(data)
}

// 更新用户
export function updateUser(data) {
  // 假设data包含id字段
  const { id, ...updateData } = data
  return apiClient.updateUser(id, updateData)
}

// 删除用户
export function deleteUser(id) {
  return apiClient.deleteUser(id)
}