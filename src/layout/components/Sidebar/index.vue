<template>
  <div class="sidebar">
    <a-menu
      mode="inline"
      theme="dark"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
    >
      <template v-for="route in routes">
        <template v-if="!route.hidden">
          <a-menu-item
            v-if="!route.children || route.children.length === 1"
            :key="getRoutePath(route)"
          >
            <router-link :to="getRoutePath(route)">
              <a-icon v-if="route.meta && route.meta.icon" :type="route.meta.icon" />
              <span>{{ getMenuTitle(route) }}</span>
            </router-link>
          </a-menu-item>

          <a-sub-menu
            v-else
            :key="route.path"
          >
            <template #title>
              <a-icon v-if="route.meta && route.meta.icon" :type="route.meta.icon" />
              <span>{{ getMenuTitle(route) }}</span>
            </template>
            <a-menu-item
              v-for="child in route.children"
              :key="getRoutePath(child)"
            >
              <router-link :to="getRoutePath(child)">
                <a-icon v-if="child.meta && child.meta.icon" :type="child.meta.icon" />
                <span>{{ getMenuTitle(child) }}</span>
              </router-link>
            </a-menu-item>
          </a-sub-menu>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script>
import { constantRoutes } from '@/router'

export default {
  name: 'Sidebar',
  data() {
    return {
      routes: constantRoutes,
      selectedKeys: [this.$route.path],
      openKeys: []
    }
  },
  created() {
    // 打印路由信息以便调试
    console.log('Routes:', this.routes)
  },
  watch: {
    $route: {
      handler(route) {
        this.selectedKeys = [route.path]
      },
      immediate: true
    }
  },
  methods: {
    getRoutePath(route) {
      // 如果是根路由且有子路由
      if (route.path === '/' && route.children && route.children.length === 1) {
        return '/dashboard'
      }
      
      // 如果有子路由且子路由path为空
      if (route.children && route.children.length === 1) {
        const child = route.children[0]
        if (child.path === '') {
          return route.path
        }
        return `${route.path}/${child.path}`
      }
      
      return route.path
    },
    getMenuTitle(route) {
      // 如果是根路由且有子路由
      if (route.path === '/' && route.children && route.children.length === 1) {
        const child = route.children[0]
        return child.meta?.title || child.name
      }
      
      // 如果有子路由且子路由path为空
      if (route.children && route.children.length === 1) {
        const child = route.children[0]
        return child.meta?.title || child.name
      }
      
      return route.meta?.title || route.name
    }
  }
}
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  .ant-menu {
    height: 100%;
  }
  .ant-menu-item {
    a {
      color: rgba(255, 255, 255, 0.65);
      &:hover {
        color: #fff;
      }
    }
    &.ant-menu-item-selected a {
      color: #fff;
    }
  }
}
</style> 