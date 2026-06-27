<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-title">
        <h2>停车场管理</h2>
        <span class="subtitle">共 {{ total }} 个停车场</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索停车场名称"
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
          新增停车场
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="parkingList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" width="50" />
        <el-table-column label="停车场名称" min-width="180">
          <template #default="{ row }">
            <div class="parking-name">
              <el-icon :size="18" color="#409EFF"><OfficeBuilding /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="250" show-overflow-tooltip />
        <el-table-column label="车位情况" width="150">
          <template #default="{ row }">
            <div class="space-info">
              <span class="used">{{ row.usedSpaces }}</span>
              <span class="separator">/</span>
              <span class="total">{{ row.totalSpaces }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="使用率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.usageRate"
              :color="getUsageColor(row.usageRate)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="收费标准" width="150">
          <template #default="{ row }">
            <span class="fee-text">¥{{ row.hourlyRate }}/小时</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">
              {{ row.status === 'open' ? '营业中' : '已关闭' }}
            </el-tag>
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
      :title="dialogType === 'add' ? '新增停车场' : '编辑停车场'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="停车场名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入停车场名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="总车位数" prop="totalSpaces">
          <el-input-number v-model="formData.totalSpaces" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="收费标准" prop="hourlyRate">
          <el-input-number v-model="formData.hourlyRate" :min="0" :precision="2" :step="0.5">
            <template #append>元/小时</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="open">营业中</el-radio>
            <el-radio label="closed">已关闭</el-radio>
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 原始停车场列表（后端返回）
const allParkingList = ref([])

// 停车场列表（前端分页过滤后）
const parkingList = computed(() => {
  let filtered = allParkingList.value
  if (searchQuery.value) {
    const kw = searchQuery.value.trim()
    filtered = filtered.filter(item => item.name && item.name.includes(kw))
  }
  total.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.slice(start, start + pageSize.value)
})

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = ref({
  name: '',
  address: '',
  totalSpaces: 100,
  hourlyRate: 5.00,
  status: 'open',
  availableSpaces: 100
})

const formRules = {
  name: [{ required: true, message: '请输入停车场名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  totalSpaces: [{ required: true, message: '请输入总车位数', trigger: 'blur' }],
  hourlyRate: [{ required: true, message: '请输入收费标准', trigger: 'blur' }]
}

// 获取使用率颜色
const getUsageColor = (rate) => {
  if (rate >= 90) return '#F56C6C'
  if (rate >= 70) return '#E6A23C'
  return '#67C23A'
}

// 后端数据转前端格式
const formatParkingList = (list) => {
  return list.map(item => {
    const total = item.totalSpaces || 0
    const occupied = item.occupiedSpaces || 0
    return {
      ...item,
      usedSpaces: occupied,
      usageRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      status: item.status === 1 ? 'open' : 'closed'
    }
  })
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/parking-lot/list')
    allParkingList.value = formatParkingList(res.data || [])
    total.value = allParkingList.value.length
  } catch (error) {
    ElMessage.error('获取停车场列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = {
    name: '',
    address: '',
    totalSpaces: 100,
    hourlyRate: 5.00,
    status: 'open',
    availableSpaces: 100
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  formData.value = {
    id: row.id,
    name: row.name,
    address: row.address,
    totalSpaces: row.totalSpaces,
    hourlyRate: row.hourlyRate,
    status: row.status,
    availableSpaces: row.availableSpaces
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除停车场 "${row.name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/parking-lot/delete/${row.id}`)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  const payload = {
    name: formData.value.name,
    address: formData.value.address,
    totalSpaces: formData.value.totalSpaces,
    hourlyRate: formData.value.hourlyRate,
    status: formData.value.status === 'open' ? 1 : 0
  }
  try {
    if (dialogType.value === 'add') {
      payload.availableSpaces = formData.value.totalSpaces
      await request.post('/parking-lot/add', payload)
      ElMessage.success('新增成功')
    } else {
      payload.id = formData.value.id
      payload.availableSpaces = formData.value.availableSpaces
      await request.put('/parking-lot/update', payload)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
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
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
    --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.03);
    --el-table-text-color: #{$text-secondary};
    --el-table-header-text-color: #{$text-primary};
    background: transparent;

    th.el-table__cell {
      background: var(--el-table-header-bg-color);
      color: var(--el-table-header-text-color);
      font-weight: 500;
    }

    td.el-table__cell {
      background: transparent;
      color: var(--el-table-text-color);
    }

    tr:hover > td.el-table__cell {
      background: var(--el-table-row-hover-bg-color);
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

.parking-name {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $text-primary;
}

.space-info {
  .used {
    color: $warning-color;
    font-weight: 500;
  }

  .separator {
    color: $text-muted;
    margin: 0 4px;
  }

  .total {
    color: $text-secondary;
  }
}

.fee-text {
  color: $success-color;
  font-weight: 500;
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
</style>
