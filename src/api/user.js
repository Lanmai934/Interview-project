import request from '@/utils/request'

export function login(data) {
  console.log('Sending login request with data:', data)
  return request({
    url: 'users/login',
    method: 'post',
    data
  })
}

export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete'
  })
}