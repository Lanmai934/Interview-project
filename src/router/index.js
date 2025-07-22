import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layout'

Vue.use(VueRouter)

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Users',
        component: () => import('@/views/users/index'),
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  },
  {
    path: '/form-builder',
    component: Layout,
    children: [
      {
        path: '',
        name: 'FormBuilder',
        component: () => import('@/views/FormBuilder/index'),
        meta: { title: '表单设计器', icon: 'form' }
      }
    ]
  },
  {
    path: '/three',
    component: Layout,
    children: [
      {
        path: '',
        name: 'ThreeD',
        component: () => import('@/views/ThreeD/index'),
        meta: { title: '3D展示', icon: 'experiment' }
      }
    ]
  },
  {
    path: '/gis',
    component: Layout,
    children: [
      {
        path: '',
        name: 'WebGIS',
        component: () => import('@/views/WebGIS/index'),
        meta: { title: 'WebGIS', icon: 'global' }
      }
    ]
  }
]

const router = new VueRouter({
  routes: constantRoutes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    next()
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router 