<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#409EFF"><Parking /></el-icon>
        <span v-show="!isCollapse" class="logo-text">智慧停车</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="rgba(255, 255, 255, 0.7)"
        active-text-color="#409EFF"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>数据大屏</template>
        </el-menu-item>
        <el-menu-item index="/parking">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>停车场管理</template>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Document /></el-icon>
          <template #title>停车记录</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            :size="20"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="header-right">
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon" :size="18" @click="toggleFullscreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          <el-tooltip content="消息" placement="bottom">
            <el-badge :value="3" class="message-badge">
              <el-icon class="header-icon" :size="18">
                <Bell />
              </el-icon>
            </el-badge>
          </el-tooltip>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userNickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Breadcrumb from './Breadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 用户信息
const userNickname = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.nickname || '管理员'
  } catch {
    return '管理员'
  }
})

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 用户下拉菜单
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background: $bg-dark;
}

.sidebar {
  background: linear-gradient(180deg, #0d2137 0%, #0a1929 100%);
  border-right: 1px solid $border-color;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  border-bottom: 1px solid $border-color;
}

.logo-text {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  margin-top: $spacing-md;

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 4px 8px;
    border-radius: $border-radius-md;

    &:hover {
      background: $bg-hover;
    }

    &.is-active {
      background: rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-icon) {
    font-size: 18px;
  }
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  background: rgba(13, 33, 55, 0.8);
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.collapse-btn {
  cursor: pointer;
  color: $text-secondary;
  transition: color 0.3s;

  &:hover {
    color: $text-primary;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.header-icon {
  cursor: pointer;
  color: $text-secondary;
  transition: color 0.3s;

  &:hover {
    color: $text-primary;
  }
}

.message-badge {
  :deep(.el-badge__content) {
    background-color: $danger-color;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: $border-radius-md;
  transition: background 0.3s;

  &:hover {
    background: $bg-hover;
  }
}

.username {
  font-size: $font-size-sm;
  color: $text-primary;
  margin: 0 4px;
}

.main-content {
  padding: 0;
  overflow-y: auto;
  background: $bg-dark;
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
