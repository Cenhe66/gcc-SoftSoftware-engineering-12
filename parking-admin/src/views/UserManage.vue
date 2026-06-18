<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-title">
        <h2>用户管理</h2>
        <span class="subtitle">共 {{ total }} 位用户</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/手机号"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="userList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" width="50" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-detail">
                <div class="username">{{ row.username }}</div>
                <div class="phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ row.registerTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="formData.role">
            <el-radio label="user">普通用户</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 用户列表
const userList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = ref({
  username: '',
  phone: '',
  password: '',
  role: 'user'
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    userList.value = [
      { id: 1, username: '张三', phone: '13800138000', avatar: '', role: 'admin', registerTime: '2026-01-15 10:30:00', status: 'active' },
      { id: 2, username: '李四', phone: '13800138001', avatar: '', role: 'user', registerTime: '2026-02-20 14:20:00', status: 'active' },
      { id: 3, username: '王五', phone: '13800138002', avatar: '', role: 'user', registerTime: '2026-03-10 09:15:00', status: 'inactive' },
      { id: 4, username: '赵六', phone: '13800138003', avatar: '', role: 'user', registerTime: '2026-04-05 16:45:00', status: 'active' },
      { id: 5, username: '钱七', phone: '13800138004', avatar: '', role: 'user', registerTime: '2026-05-01 11:00:00', status: 'active' }
    ]
    total.value = 5
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// 状态切换
const handleStatusChange = (row, val) => {
  ElMessage.success(`用户 ${row.username} 已${val === 'active' ? '启用' : '禁用'}`)
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = {
    username: '',
    phone: '',
    password: '',
    role: 'user'
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    loadData()
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: $spacing-lg;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.header-title {
  h2 {
    margin: 0 0 4px 0;
    font-size: $font-size-xl;
    color: $text-primary;
  }

  .subtitle {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.header-actions {
  display: flex;
  gap: $spacing-md;
}

.search-input {
  width: 240px;
}

.table-card {
  background: $bg-card;
  border: 1px solid $border-color;

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    background: transparent;

    th.el-table__cell {
      background: rgba(255, 255, 255, 0.05);
      color: $text-primary;
      font-weight: 500;
    }

    td.el-table__cell {
      background: transparent;
      color: $text-secondary;
    }

    tr:hover > td.el-table__cell {
      background: rgba(255, 255, 255, 0.03);
    }

    &::before {
      display: none;
    }
  }

  :deep(.el-table--striped) {
    .el-table__body tr.el-table__row--striped td.el-table__cell {
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-detail {
  .username {
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 2px;
  }

  .phone {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: $text-secondary;

  .el-icon {
    color: $primary-color;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: $spacing-md;
  border-top: 1px solid $border-color;
}

:deep(.el-pagination) {
  --el-pagination-button-color: $text-secondary;
  --el-pagination-hover-color: $primary-color;

  .el-pagination__total,
  .el-pagination__jump {
    color: $text-secondary;
  }
}

:deep(.el-dialog) {
  background: linear-gradient(135deg, #0d2137 0%, #0a1929 100%);
  border: 1px solid $border-color;

  .el-dialog__title {
    color: $text-primary;
  }

  .el-dialog__body {
    color: $text-secondary;
  }
}

:deep(.el-switch) {
  --el-switch-on-color: $success-color;
  --el-switch-off-color: $danger-color;
}
</style>
