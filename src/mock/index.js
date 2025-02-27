import Mock from 'mockjs'

// 设置响应延时
Mock.setup({
  timeout: '300-600'
})

// 用户相关接口
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    status: true,
    createTime: '2024-01-01'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  },
  {
    id: 4,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  },
  {
    id: 5,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  },
  {
    id: 6,  
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 7,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 8,    
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 9,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 10,    
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 11,    
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  },
  {
    id: 12,
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  ,
  {
    id: 13,      
    username: 'user',
    email: 'user@example.com',
    status: true,
    createTime: '2024-01-02'
  }
  
]

// 登录接口
Mock.mock('/api/user/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  if (username && password) {
    return {
      code: 200,
      data: {
        token: 'mock-token-' + username,
        userInfo: {
          id: 1,
          username: username,
          avatar: ''
        }
      },
      message: '登录成功'
    }
  }
  return {
    code: 401,
    message: '用户名或密码错误'
  }
})

// 获取用户列表
Mock.mock(/\/api\/user\/list(\?.*)?$/, 'get', (options) => {
  // 解析查询参数
  const url = options.url
  const params = new URLSearchParams(url.split('?')[1])
  const page = parseInt(params.get('page')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 10

  // 计算分页数据
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pagedUsers = users.slice(start, end)

  return {
    code: 200,
    data: {
      list: pagedUsers,
      total: users.length
    },
    message: '获取成功'
  }
})

// 新增用户
Mock.mock('/api/user/add', 'post', (options) => {
  const user = JSON.parse(options.body)
  // 生成新的用户ID
  user.id = Mock.Random.id()
  // 添加创建时间
  user.createTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  // 添加到用户列表
  users.push(user)
  
  // 计算分页数据
  const page = 1
  const pageSize = 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pagedUsers = users.slice(start, end)
  
  return {
    code: 200,
    data: {
      list: pagedUsers,
      total: users.length
    },
    message: '添加成功'
  }
})

// 更新用户
Mock.mock('/api/user/update', 'put', (options) => {
  const updateUser = JSON.parse(options.body)
  const index = users.findIndex(u => u.id === updateUser.id)
  if (index > -1) {
    users[index] = { ...users[index], ...updateUser }
    return {
      code: 200,
      message: '更新成功'
    }
  }
  return {
    code: 400,
    message: '用户不存在'
  }
})

// 删除用户
Mock.mock(/\/api\/user\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/user\/delete\/(\d+)/)[1])
  const index = users.findIndex(u => u.id === id)
  if (index > -1) {
    users.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  }
  return {
    code: 400,
    message: '用户不存在'
  }
})

export default Mock 