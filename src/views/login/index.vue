<template>
  <div class="login-container">
    <a-card class="login-card">
      <h2 class="title">系统登录</h2>
      <a-form-model
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
      >
        <a-form-model-item prop="username">
          <a-input
            v-model="loginForm.username"
            placeholder="用户名"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input-password
            v-model="loginForm.password"
            placeholder="密码"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item>
          <a-button
            type="primary"
            block
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      loginForm: {
        username: '123',
        password: '123'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          this.loading = true
          try {
            console.log('Submitting form:', this.loginForm)
            const result = await this.$store.dispatch('user/login', this.loginForm)
            console.log('Login result:', result)
            this.$message.success('登录成功')
            this.$router.push('/dashboard')
          } catch (error) {
            console.error('Login error:', error)
            this.$message.error(error.message || '登录失败')
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
}
</style> 