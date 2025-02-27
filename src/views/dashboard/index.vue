<template>
  <div class="dashboard-container">
    <a-row :gutter="24">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总用户数"
            :value="1128"
            style="margin-right: 50px"
          >
            <template #prefix>
              <a-icon type="user" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日访问"
            :value="423"
          >
            <template #prefix>
              <a-icon type="team" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="订单总数"
            :value="856"
          >
            <template #prefix>
              <a-icon type="shopping-cart" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总收入"
            :value="9280"
            prefix="¥"
          >
            <template #prefix>
              <a-icon type="dollar" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <div class="chart-container" style="margin-top: 24px">
      <a-card title="近七日数据统计">
        <!-- 这里可以添加图表组件 -->
        <div style="height: 300px">
          图表区域
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardPage',
  data() {
    return {
      // 这里可以添加数据
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}
</style> 