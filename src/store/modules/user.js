import { login } from '@/api/user'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    localStorage.setItem('token', token)
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
  }
}

const actions = {
  // 登录
  login({ commit }, userInfo) {
    console.log('Login action called with:', userInfo)
    return new Promise((resolve, reject) => {
      login(userInfo)
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