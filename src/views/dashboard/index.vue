<template>
  <div class="dashboard-container">
    <a-row :gutter="24">
      <a-col :span="6">
        <a-card>
          <a-statistic title="总用户数" :value="1128" style="margin-right: 50px">
            <template #prefix>
              <a-icon type="user" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日访问" :value="423">
            <template #prefix>
              <a-icon type="team" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="订单总数" :value="856">
            <template #prefix>
              <a-icon type="shopping-cart" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="总收入" :value="9280" prefix="¥">
            <template #prefix>
              <a-icon type="dollar" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- <div class="chart-container" style="margin-top: 24px">
      <a-card title="近七日数据统计">
        <div style="height: 300px">
          图表区域
        </div>
      </a-card>
    </div> -->

    <el-table ref="table" :data="tableData" row-key="id" style="width: 100%" default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @select="handleSelect">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" />
    </el-table>

  </div>
</template>

<script>
export default {
  name: 'DashboardPage',
  data() {
    return {
      // 这里可以添加数据
      tableData: [
        { id: 1, name: '节点 1', type: '目录', hasChildren: true },
        { id: 2, name: '节点 2', type: '目录', hasChildren: true }
      ],
      selectedRowKeys: [], // 用于控制选中的行
      expandedRowKeys: [] // 用于控制展开的行
    }
  },
  methods: {

    async handleSelect(selection, row) {
      // 判断是否需要加载子节点
      if (row.hasChildren && !row.children) {
        const children = await this.fetchChildren(row.id);
        this.$set(row, 'children', children);
        // this.$set(row, 'hasChildren', true); // 标记该行有子
        console.log(row, "row", selection, this.tableData)
        // this.$nextTick(() => {
        //   this.$refs.table.doLayout();               // 触发表格重绘
        // });
      }
    },
    fetchChildren(parentId) {
      console.log(`Fetching children for parent ID: ${parentId}`);
      return new Promise(resolve => {
        setTimeout(() => {
          const children = [
            { id: parentId * 10 + 1, name: `子节点 ${parentId}.1`, type: '页面' },
            { id: parentId * 10 + 2, name: `子节点 ${parentId}.2`, type: '页面' }
          ];
          resolve(children);
        }, 1000); // 模拟接口延迟
      });
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}
</style>