<template>
  <div class="alert-list">
    <div
      v-for="alert in alertList"
      :key="alert.id"
      class="alert-item"
      :class="`alert-${alert.type}`"
    >
      <div class="alert-icon">
        <el-icon :size="18">
          <CircleCloseFilled v-if="alert.type === 'error'" />
          <WarningFilled v-else-if="alert.type === 'warning'" />
          <InfoFilled v-else />
        </el-icon>
      </div>
      <div class="alert-content">
        <div class="alert-message">{{ alert.message }}</div>
        <div class="alert-time">{{ alert.time }}</div>
      </div>
    </div>
    <div v-if="alertList.length === 0" class="alert-empty">
      <el-icon :size="32" color="rgba(255,255,255,0.3)">
        <Check />
      </el-icon>
      <span>暂无告警</span>
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

// 限制显示最近5条告警
const alertList = computed(() => {
  return props.data.slice(0, 5)
})
</script>

<style scoped lang="scss">
.alert-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  max-height: 230px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  &.alert-error {
    border-left-color: $danger-color;
    background: rgba(245, 108, 108, 0.1);

    .alert-icon {
      color: $danger-color;
    }

    &:hover {
      background: rgba(245, 108, 108, 0.15);
    }
  }

  &.alert-warning {
    border-left-color: $warning-color;
    background: rgba(230, 162, 60, 0.1);

    .alert-icon {
      color: $warning-color;
    }

    &:hover {
      background: rgba(230, 162, 60, 0.15);
    }
  }

  &.alert-info {
    border-left-color: $info-color;
    background: rgba(144, 147, 153, 0.1);

    .alert-icon {
      color: $info-color;
    }

    &:hover {
      background: rgba(144, 147, 153, 0.15);
    }
  }
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: $font-size-sm;
  color: $text-primary;
  line-height: 1.5;
  word-break: break-all;
}

.alert-time {
  font-size: $font-size-xs;
  color: $text-muted;
  margin-top: 4px;
}

.alert-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-xl 0;
  color: $text-muted;
  font-size: $font-size-sm;
}
</style>
