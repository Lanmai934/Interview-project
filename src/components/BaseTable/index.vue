<template>
  <div class="base-table">
    <div class="table-operations" v-if="showOperations">
      <slot name="operations">
        <a-button v-if="showAdd" type="primary" @click="handleAdd">
          <a-icon type="plus" />新增
        </a-button>
        <a-input-search
          v-if="showSearch"
          v-model="searchValue"
          :placeholder="searchPlaceholder"
          style="width: 200px; margin-left: 8px"
          @search="onSearch"
        />
      </slot>
    </div>

    <a-table
      v-bind="$attrs"
      :columns="innerColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="innerPagination"
      :scroll="{ y: scrollY, x: scrollX }"
      :row-key="rowKey"
      :custom-row="customRow"
      @change="handleTableChange"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
      <template v-for="(_, name) in $scopedSlots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </a-table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  inheritAttrs: false,
  props: {
    // 表格列配置
    columns: {
      type: Array,
      required: true
    },
    // 表格数据
    dataSource: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页配置
    pagination: {
      type: [Object, Boolean],
      default: () => ({})
    },
    // 是否显示操作区
    showOperations: {
      type: Boolean,
      default: true
    },
    // 是否显示新增按钮
    showAdd: {
      type: Boolean,
      default: true
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    },
    // 搜索框占位符
    searchPlaceholder: {
      type: String,
      default: '请输入关键字'
    },
    // 操作列配置
    actionColumn: {
      type: Object,
      default: () => ({
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 200,
        scopedSlots: { customRender: 'action' }
      })
    },
    // 新增虚拟滚动相关属性
    scrollY: {
      type: [Number, String],
      default: 400
    },
    scrollX: {
      type: [Number, String],
      default: 'max-content'
    },
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    // 自定义行属性
    customRow: {
      type: Function,
      default: () => ({})
    }
  },
  data() {
    return {
      searchValue: '',
      innerPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: total => `共 ${total} 条`,
        ...this.pagination
      }
    }
  },
  computed: {
    innerColumns() {
      const columns = [...this.columns]
      if (this.showOperations && this.actionColumn && !columns.find(col => col.key === 'action')) {
        columns.push(this.actionColumn)
      }
      // 为所有列添加排序和筛选的默认配置
      return columns.map(col => ({
        ...col,
        sorter: col.sorter === true ? (a, b) => {
          if (a[col.dataIndex] === b[col.dataIndex]) return 0
          return a[col.dataIndex] > b[col.dataIndex] ? 1 : -1
        } : col.sorter,
        // 如果列宽未设置，给一个默认值
        width: col.width || 150
      }))
    }
  },
  methods: {
    handleAdd() {
      this.$emit('add')
    },
    onSearch(value) {
      this.$emit('search', value)
    },
    handleTableChange(pagination, filters, sorter) {
      const newPagination = { ...pagination }
      this.innerPagination = newPagination
      this.$emit('change', newPagination, filters, sorter)
    }
  },
  watch: {
    pagination: {
      handler(val) {
        if (typeof val === 'object') {
          this.innerPagination = {
            ...this.innerPagination,
            ...val
          }
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.base-table {
  .table-operations {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  // 优化表格样式
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }

    .ant-table-tbody > tr:hover > td {
      background: #e6f7ff;
    }

    // 固定列阴影
    .ant-table-fixed-right {
      box-shadow: -6px 0 6px -4px rgba(0, 0, 0, 0.15);
    }

    // 空数据样式
    .ant-table-placeholder {
      padding: 32px 0;
    }
  }
}
</style> 