import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import Components from './components'
import { errorHandlingMixin } from './utils/error-handler'

Vue.use(Antd)
Vue.use(Components)

// 注册全局错误处理混入
Vue.mixin(errorHandlingMixin)

Vue.config.productionTip = false

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info)
}

// 全局未捕获Promise错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)
})

// 监听API客户端的登出事件
window.addEventListener('auth:logout', (event) => {
  const { reason } = event.detail || {}
  
  // 清除store中的用户信息
  store.dispatch('user/logout')
  
  // 跳转到登录页
  if (router.currentRoute.path !== '/login') {
    router.push('/login')
    
    // 显示提示信息
    if (reason === 'token_expired') {
      Vue.prototype.$message.warning('登录已过期，请重新登录')
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')