<template>
  <div class="parking-rank">
    <div
      v-for="(item, index) in rankedData"
      :key="index"
      class="rank-item"
      :class="{ 'top-three': index < 3 }"
    >
      <div class="rank-number" :class="`rank-${index + 1}`">
        {{ index + 1 }}
      </div>
      <div class="rank-info">
        <div class="rank-name">{{ item.name }}</div>
        <div class="rank-progress-wrapper">
          <el-progress
            :percentage="item.usage"
            :color="getProgressColor(index)"
            :stroke-width="8"
            :show-text="false"
          />
          <span class="usage-text">{{ item.usage }}%</span>
        </div>
      </div>
      <div class="rank-revenue">
        <span class="revenue-value">¥{{ formatRevenue(item.revenue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 按收益排序
const rankedData = computed(() => {
  return [...props.data].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
})

// 格式化收益
const formatRevenue = (value) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return value.toLocaleString()
}

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#909399']
  return colors[index] || '#909399'
}
</script>

<style scoped lang="scss">
.parking-rank {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  transition: all 0.3s ease;

  &:hover {
    background: $bg-hover;
  }

  &.top-three {
    .rank-name {
      font-weight: 500;
    }
  }
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: 600;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  color: $text-secondary;

  &.rank-1 {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }

  &.rank-2 {
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    color: #fff;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
  }

  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32, #B87333);
    color: #fff;
    box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
  }
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: $font-size-sm;
  color: $text-primary;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-progress-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  :deep(.el-progress) {
    flex: 1;
  }

  :deep(.el-progress-bar__outer) {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  :deep(.el-progress-bar__inner) {
    border-radius: 4px;
  }
}

.usage-text {
  font-size: $font-size-xs;
  color: $text-muted;
  min-width: 36px;
  text-align: right;
}

.rank-revenue {
  text-align: right;
  flex-shrink: 0;
}

.revenue-value {
  font-size: $font-size-md;
  font-weight: 600;
  color: $success-color;
}
</style>
