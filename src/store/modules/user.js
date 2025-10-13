import { login } from '@/api/user'
import { apiClient } from '@/api/generated/index.js';

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    localStorage.setItem('token', token)
    // 同时设置API客户端的token
    apiClient.setAuthToken(token)
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  CLEAR_USER: (state) => {
    state.token = ''
    state.userInfo = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    // 清除API客户端的token
    apiClient.setAuthToken('')
  }
}

const actions = {
  // 登录
  login({ commit }, { username, password }) {
    console.log('Login action called with:', { username, password })
    const loginData = {
      username,
      password
    }
    return new Promise((resolve, reject) => {
      login(loginData)
        .then(response => {
          console.log('Login API response:', response)
          const { data } = response
          commit('SET_TOKEN', data.token)
          commit('SET_USER_INFO', data.userInfo)
          resolve(data)
        })
        .catch(error => {
          console.error('Login API error:', error)
          reject(error)
        })
    })
  },
  // 退出登录
  logout({ commit }) {
    commit('CLEAR_USER')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}