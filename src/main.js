import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import Components from './components'
// 引入 Element UI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 引入 mock
import './mock'

Vue.use(Antd)
Vue.use(ElementUI);
Vue.use(Components)
Vue.config.productionTip = false

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info)
}

// 全局未捕获Promise错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 