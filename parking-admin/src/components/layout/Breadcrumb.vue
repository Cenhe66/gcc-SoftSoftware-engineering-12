<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><HomeFilled /></el-icon>
      <span class="breadcrumb-text">首页</span>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span class="breadcrumb-text">{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 路由标题映射
const titleMap = {
  '/dashboard': '数据大屏',
  '/parking': '停车场管理',
  '/records': '停车记录',
  '/users': '用户管理',
  '/settings': '系统设置',
  '/profile': '个人中心'
}

const breadcrumbs = computed(() => {
  const path = route.path
  const title = titleMap[path]
  return title ? [{ title }] : []
})
</script>

<style scoped lang="scss">
.el-breadcrumb {
  font-size: $font-size-sm;
}

:deep(.el-breadcrumb__item) {
  .el-breadcrumb__inner {
    color: $text-secondary;
    display: flex;
    align-items: center;
    gap: 4px;

    &.is-link {
      &:hover {
        color: $primary-color;
      }
    }
  }

  &:last-child {
    .el-breadcrumb__inner {
      color: $text-primary;
      font-weight: 500;
    }
  }
}

.breadcrumb-text {
  margin-left: 4px;
}
</style>
