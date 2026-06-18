<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-title">
        <h2>停车记录</h2>
        <span class="subtitle">共 {{ total }} 条记录</span>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="date-picker"
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable class="status-select">
          <el-option label="停车中" value="parking" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="recordList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" width="50" />
        <el-table-column label="车牌号" width="120">
          <template #default="{ row }">
            <span class="plate-number">{{ row.plateNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="parkingName" label="停车场" min-width="180" />
        <el-table-column prop="spaceNumber" label="车位号" width="100" />
        <el-table-column label="入场时间" width="160">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Timer /></el-icon>
              <span>{{ row.entryTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="出场时间" width="160">
          <template #default="{ row }">
            <div class="time-cell" v-if="row.exitTime">
              <el-icon><Timer /></el-icon>
              <span>{{ row.exitTime }}</span>
            </div>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column label="停车时长" width="120">
          <template #default="{ row }">
            <span class="duration">{{ row.duration }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费用" width="100">
          <template #default="{ row }">
            <span class="fee" :class="{ 'unpaid': row.status === 'parking' }">
              ¥{{ row.fee }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'parking' ? 'warning' : 'success'" size="small">
              {{ row.status === 'parking' ? '停车中' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">
              <el-icon><View /></el-icon>
              详情
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="停车记录详情"
      width="500px"
      destroy-on-close
    >
      <div class="detail-content" v-if="currentRecord">
        <div class="detail-item">
          <span class="label">车牌号：</span>
          <span class="value plate">{{ currentRecord.plateNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">停车场：</span>
          <span class="value">{{ currentRecord.parkingName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">车位号：</span>
          <span class="value">{{ currentRecord.spaceNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">入场时间：</span>
          <span class="value">{{ currentRecord.entryTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">出场时间：</span>
          <span class="value">{{ currentRecord.exitTime || '未出场' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">停车时长：</span>
          <span class="value">{{ currentRecord.duration }}</span>
        </div>
        <div class="detail-item">
          <span class="label">费用：</span>
          <span class="value fee">¥{{ currentRecord.fee }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="currentRecord.status === 'parking' ? 'warning' : 'success'" size="small">
            {{ currentRecord.status === 'parking' ? '停车中' : '已完成' }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索和分页
const dateRange = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 记录列表
const recordList = ref([])

// 详情对话框
const detailVisible = ref(false)
const currentRecord = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    recordList.value = [
      { id: 1, plateNumber: '京A12345', parkingName: '万达广场停车场', spaceNumber: 'B2-015', entryTime: '2026-05-27 08:30:00', exitTime: '2026-05-27 12:30:00', duration: '4小时', fee: '32.00', status: 'completed' },
      { id: 2, plateNumber: '京B67890', parkingName: '国贸中心停车场', spaceNumber: 'F1-088', entryTime: '2026-05-27 09:00:00', exitTime: null, duration: '3小时25分', fee: '35.00', status: 'parking' },
      { id: 3, plateNumber: '京C11111', parkingName: '三里屯太古里停车场', spaceNumber: 'B1-022', entryTime: '2026-05-27 10:15:00', exitTime: '2026-05-27 14:45:00', duration: '4小时30分', fee: '54.00', status: 'completed' },
      { id: 4, plateNumber: '京D22222', parkingName: '朝阳大悦城停车场', spaceNumber: 'B3-105', entryTime: '2026-05-27 11:00:00', exitTime: null, duration: '2小时15分', fee: '13.50', status: 'parking' },
      { id: 5, plateNumber: '京E33333', parkingName: '望京SOHO停车场', spaceNumber: 'F2-056', entryTime: '2026-05-27 13:20:00', exitTime: '2026-05-27 15:50:00', duration: '2小时30分', fee: '12.50', status: 'completed' }
    ]
    total.value = 5
    loading.value = false
  }, 500)
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

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看详情
const handleDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
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

.date-picker {
  width: 260px;
}

.status-select {
  width: 120px;
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

.plate-number {
  font-weight: 600;
  color: $text-primary;
  font-family: 'Courier New', monospace;
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

.duration {
  color: $warning-color;
  font-weight: 500;
}

.fee {
  color: $success-color;
  font-weight: 600;

  &.unpaid {
    color: $warning-color;
  }
}

.empty-text {
  color: $text-muted;
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
}

.detail-content {
  padding: $spacing-md 0;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  .label {
    width: 100px;
    color: $text-muted;
    font-size: $font-size-sm;
  }

  .value {
    flex: 1;
    color: $text-primary;
    font-size: $font-size-sm;

    &.plate {
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    &.fee {
      color: $success-color;
      font-weight: 600;
      font-size: $font-size-lg;
    }
  }
}
</style>
