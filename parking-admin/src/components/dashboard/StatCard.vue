<template>
  <div class="stat-card" :style="{ '--card-color': color }">
    <div class="stat-icon-wrapper" :style="{ background: `${color}20` }">
      <el-icon class="stat-icon" :size="32" :color="color">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-content">
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value-wrapper">
        <span class="stat-value" :style="{ color }">{{ formattedValue }}</span>
        <span class="stat-unit">{{ unit }}</span>
      </div>
      <div class="stat-trend" v-if="trend !== undefined">
        <el-icon :size="14" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
          <ArrowUp v-if="trend >= 0" />
          <ArrowDown v-else />
        </el-icon>
        <span :class="trend >= 0 ? 'trend-up' : 'trend-down'">
          {{ Math.abs(trend) }}%
        </span>
        <span class="trend-label">较昨日</span>
      </div>
    </div>
    <div class="card-glow" :style="{ background: color }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  trend: {
    type: Number,
    default: undefined
  },
  color: {
    type: String,
    default: '#409EFF'
  }
})

// 格式化数值，添加千分位分隔符
const formattedValue = computed(() => {
  return props.value.toLocaleString('zh-CN')
})
</script>

<style scoped lang="scss">
.stat-card {
  position: relative;
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-4px);
    border-color: var(--card-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px var(--card-color)20;

    .card-glow {
      opacity: 0.15;
    }
  }
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;

  .stat-card:hover & {
    transform: scale(1.1);
  }
}

.stat-icon {
  transition: all 0.3s ease;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-bottom: $spacing-xs;
}

.stat-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
}

.stat-value {
  font-size: $font-size-xxl;
  font-weight: 700;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.stat-unit {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;

  .trend-up {
    color: $success-color;
  }

  .trend-down {
    color: $danger-color;
  }

  .trend-label {
    color: $text-muted;
    margin-left: 4px;
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  opacity: 0;
  filter: blur(60px);
  transition: opacity 0.3s ease;
  pointer-events: none;
}
</style>
