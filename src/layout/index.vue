<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
      <div class="logo">
        <h1 v-show="!collapsed">Admin System</h1>
      </div>
      <sidebar />
    </a-layout-sider>

    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon
          class="trigger"
          :type="collapsed ? 'menu-unfold' : 'menu-fold'"
          @click="collapsed = !collapsed"
        />
        <div class="header-right">
          <a-dropdown>
            <a class="ant-dropdown-link">
              Admin <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-icon type="user" />个人信息
              </a-menu-item>
              <a-menu-item>
                <a-icon type="setting" />设置
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item @click="handleLogout">
                <a-icon type="logout" />退出登录
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content>
        <div class="content-container">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import Sidebar from '../layout/components/Sidebar'

export default {
  name: 'Layout',
  components: {
    Sidebar
  },
  data() {
    return {
      collapsed: false
    }
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('user/logout')
      this.$router.push('/login')
    }
  },
  created() {
    console.log('Routes:', this.$router.options.routes)
  }
}
</script>

<style lang="less" scoped>
.layout-container {
  min-height: 100vh;
}

.logo {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo h1 {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  float: right;
  margin-right: 24px;
}

.content-container {
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
}
</style> 