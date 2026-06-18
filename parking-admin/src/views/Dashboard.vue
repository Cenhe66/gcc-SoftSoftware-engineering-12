<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h1 class="page-title">智慧停车数据大屏</h1>
      <div class="current-time">{{ currentTime }}</div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-row">
      <StatCard
        v-for="(stat, index) in statCards"
        :key="index"
        :title="stat.title"
        :value="stat.value"
        :unit="stat.unit"
        :icon="stat.icon"
        :trend="stat.trend"
        :color="stat.color"
      />
    </div>

    <!-- 中间图表区域 -->
    <div class="charts-row">
      <div class="chart-card traffic-chart">
        <div class="card-header">
          <span class="card-title">实时车流趋势</span>
          <el-radio-group v-model="trafficTimeRange" size="small">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
          </el-radio-group>
        </div>
        <TrafficChart :data="dashboardStore.trafficData" />
      </div>
      <div class="chart-card revenue-chart">
        <div class="card-header">
          <span class="card-title">收益趋势</span>
          <el-radio-group v-model="revenueTimeRange" size="small">
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
          </el-radio-group>
        </div>
        <RevenueChart :data="dashboardStore.revenueData" />
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-row">
      <div class="chart-card heatmap-card">
        <div class="card-header">
          <span class="card-title">车位使用率热力图</span>
        </div>
        <HeatmapChart :data="dashboardStore.heatmapData" />
      </div>
      <div class="chart-card rank-card">
        <div class="card-header">
          <span class="card-title">停车场收益排行</span>
        </div>
        <ParkingRank :data="dashboardStore.parkingRank" />
      </div>
      <div class="chart-card alert-card">
        <div class="card-header">
          <span class="card-title">实时告警</span>
          <el-badge :value="alertCount" v-if="alertCount > 0" />
        </div>
        <AlertList :data="dashboardStore.alerts" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/dashboard/StatCard.vue'
import TrafficChart from '@/components/dashboard/TrafficChart.vue'
import RevenueChart from '@/components/dashboard/RevenueChart.vue'
import HeatmapChart from '@/components/dashboard/HeatmapChart.vue'
import ParkingRank from '@/components/dashboard/ParkingRank.vue'
import AlertList from '@/components/dashboard/AlertList.vue'

const dashboardStore = useDashboardStore()

// 当前时间
const currentTime = ref('')
let timeTimer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '今日停车',
    value: dashboardStore.stats.todayParking,
    unit: '辆',
    icon: 'Car',
    trend: 12.5,
    color: '#409EFF'
  },
  {
    title: '今日收益',
    value: dashboardStore.stats.todayRevenue,
    unit: '元',
    icon: 'Money',
    trend: 8.3,
    color: '#67C23A'
  },
  {
    title: '空闲车位',
    value: dashboardStore.stats.freeSpaces,
    unit: '个',
    icon: 'Parking',
    trend: -5.2,
    color: '#E6A23C'
  },
  {
    title: '在线用户',
    value: dashboardStore.stats.onlineUsers,
    unit: '人',
    icon: 'User',
    trend: 15.7,
    color: '#F56C6C'
  }
])

// 时间范围选择
const trafficTimeRange = ref('today')
const revenueTimeRange = ref('week')

// 告警数量
const alertCount = computed(() => dashboardStore.alerts.length)

// 数据刷新定时器
let dataTimer = null

onMounted(() => {
  // 初始化时间
  updateTime()
  timeTimer = setInterval(updateTime, 1000)

  // 加载数据
  dashboardStore.fetchAllData()

  // 每30秒刷新一次数据
  dataTimer = setInterval(() => {
    dashboardStore.fetchAllData()
  }, 30000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (dataTimer) clearInterval(dataTimer)
})
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  padding: $spacing-lg;
  background: linear-gradient(135deg, #0a1929 0%, #0d2137 100%);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.page-title {
  font-size: $font-size-xxl;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.current-time {
  font-size: $font-size-md;
  color: $text-secondary;
  font-family: 'Courier New', monospace;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  gap: $spacing-lg;
}

.chart-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $border-color;
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.card-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-primary;
  position: relative;
  padding-left: $spacing-sm;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #409EFF, #67C23A);
    border-radius: 2px;
  }
}

.traffic-chart,
.revenue-chart {
  min-height: 350px;
}

.heatmap-card,
.rank-card,
.alert-card {
  min-height: 300px;
}

:deep(.el-radio-button__inner) {
  background: transparent;
  border-color: $border-color;
  color: $text-secondary;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: $primary-color;
  border-color: $primary-color;
  color: $text-primary;
}
</style>
