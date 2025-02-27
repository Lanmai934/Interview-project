<template>
  <div class="users-container">
    <base-table
      :columns="columns"
      :data-source="userList"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ y: tableHeight, x: '100%' }"
      row-key="id"
      :custom-row="customRow"
      @change="handleTableChange"
      @add="handleAdd"
      @search="onSearch"
    >
      <template #status="{ text }">
        <a-badge
          :status="text ? 'success' : 'error'"
          :text="text ? '启用' : '禁用'"
        />
      </template>
      <template #action="{ record }">
        <a-button type="link" @click="handleEdit(record)">编辑</a-button>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确定要删除此用户吗？"
          @confirm="handleDelete(record)"
        >
          <a-button type="link" danger>删除</a-button>
        </a-popconfirm>
      </template>
    </base-table>

    <base-modal
      v-model="modalVisible"
      :title="formTitle"
      @ok="handleSubmit"
    >
      <base-form
        ref="userForm"
        :fields="formFields"
        :form-data="userForm"
        :rules="rules"
        :show-footer="false"
      />
    </base-modal>
  </div>
</template>

<script>
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'
import BaseTable from '@/components/BaseTable'

export default {
  name: 'UsersPage',
  components: {
    BaseTable
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      modalVisible: false,
      userForm: {
        username: '',
        email: '',
        status: true
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      columns: [
        {
          title: '用户名',
          dataIndex: 'username',
          width: 150,
          sorter: true
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          width: 200
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: 100,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 180,
          sorter: true
        }
      ],
      userList: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      formFields: [
        {
          type: 'input',
          label: '用户名',
          prop: 'username',
          props: {
            placeholder: '请输入用户名'
          }
        },
        {
          type: 'input',
          label: '邮箱',
          prop: 'email',
          props: {
            placeholder: '请输入邮箱'
          }
        },
        {
          type: 'switch',
          label: '状态',
          prop: 'status'
        }
      ],
      tableHeight: 400
    }
  },
  computed: {
    formTitle() {
      return this.userForm.id ? '编辑用户' : '新增用户'
    }
  },
  created() {
    this.fetchUsers()
    this.initTableHeight()
  },
  methods: {
    getInitialForm() {
      return {
        username: '',
        email: '',
        status: true
      }
    },
    async fetchUsers() {
      this.loading = true
      try {
        const res = await getUserList({
          page: this.pagination.current,
          pageSize: this.pagination.pageSize
        })
        if (res.data) {
          this.userList = res.data.list
          this.pagination.total = res.data.total
        }
      } catch (error) {
        console.error('Fetch users error:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    initTableHeight() {
      // 计算表格高度
      const windowHeight = window.innerHeight
      const offset = 280 // 预留头部、分页等区域的高度
      this.tableHeight = windowHeight - offset
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    handleResize() {
      const windowHeight = window.innerHeight
      const offset = 280
      this.tableHeight = windowHeight - offset
    },
    customRow(record) {
      return {
        props: {
          // 可以根据需要添加行属性
        },
        on: {
          click: () => {
            // 行点击事件
            console.log('Row clicked:', record)
          },
          dblclick: () => {
            // 双击编辑
            this.handleEdit(record)
          }
        }
      }
    },
    async handleAdd() {
      this.userForm = {
        username: '',
        email: '',
        status: true
      }
      this.modalVisible = true
    },
    async handleEdit(record) {
      this.userForm = { ...record }
      this.modalVisible = true
    },
    async handleDelete(record) {
      try {
        await deleteUser(record.id)
        this.$message.success('删除成功')
        this.fetchUsers()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    async handleSubmit() {
      try {
        const valid = await this.$refs.userForm.validate()
        if (valid) {
          if (this.userForm.id) {
            await updateUser(this.userForm)
            this.$message.success('更新成功')
            await this.fetchUsers()
          } else {
            const res = await addUser(this.userForm)
            if (res.data) {
              this.userList = res.data.list
              this.pagination = {
                ...this.pagination,
                current: 1,
                total: res.data.total
              }
              this.$message.success('添加成功')
            }
          }
          this.modalVisible = false
        }
      } catch (error) {
        console.error('Submit error:', error)
        this.$message.error(this.userForm.id ? '更新失败' : '添加失败')
      }
    },
    onSearch() {
      this.pagination.current = 1
      this.fetchUsers()
    },
    handleTableChange(pagination) {
      this.pagination = { ...pagination }
      this.fetchUsers()
    }
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.users-container {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .base-table {
    flex: 1;
    overflow: hidden;
  }
}

.table-operations {
  margin-bottom: 16px;
}
</style> 