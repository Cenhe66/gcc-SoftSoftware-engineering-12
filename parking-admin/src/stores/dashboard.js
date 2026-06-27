import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useDashboardStore = defineStore('dashboard', () => {
  // 统计数据
  const stats = ref({
    todayParking: 0,
    todayRevenue: 0,
    freeSpaces: 0,
    onlineUsers: 0
  })

  // 车流趋势数据
  const trafficData = ref({
    hours: [],
    values: []
  })

  // 收益趋势数据
  const revenueData = ref({
    dates: [],
    values: []
  })

  // 热力图数据
  const heatmapData = ref([])

  // 热力图 Y 轴标签（停车场名称）
  const heatmapLots = ref([])

  // 停车场排行
  const parkingRank = ref([])

  // 告警列表
  const alerts = ref([])

  // 加载状态
  const loading = ref(false)

  // 获取所有仪表盘数据（统一接口）
  const fetchAllData = async (range = 'today') => {
    loading.value = true
    try {
      const res = await request.get('/dashboard/data', { params: { range } })
      const data = res.data

      // 统计卡片
      stats.value = {
        todayParking: data.todayEntries || 0,
        todayRevenue: data.todayRevenue || 0,
        freeSpaces: data.availableSpaces || 0,
        onlineUsers: data.todayExits || 0
      }

      // 车流趋势
      if (data.hourlyFlow && data.hourlyFlow.length > 0) {
        trafficData.value = {
          hours: data.hourlyFlow.map(item => item.hour),
          values: data.hourlyFlow.map(item => item.entries || 0)
        }
      } else {
        trafficData.value = generateMockTrafficData()
      }

      // 停车场排行（从 lotStatusList 转换）
      if (data.lotStatusList && data.lotStatusList.length > 0) {
        parkingRank.value = data.lotStatusList.map(lot => {
          const total = lot.totalSpaces || 0
          const occupied = lot.occupiedSpaces || 0
          const usage = total > 0 ? Math.round((occupied / total) * 100) : 0
          return {
            name: lot.lotName || '未知停车场',
            revenue: 0, // 后端暂无单停车场收益统计
            usage: usage
          }
        })
      } else {
        parkingRank.value = generateMockParkingRank()
      }

      // 告警列表（从 recentRecords 转换）
      if (data.recentRecords && data.recentRecords.length > 0) {
        alerts.value = data.recentRecords.map((record, index) => ({
          id: index + 1,
          type: record.status === '进行中' ? 'warning' : 'info',
          message: `${record.plateNumber} ${record.status}`,
          time: record.entryTime || '--'
        }))
      } else {
        alerts.value = generateMockAlerts()
      }

      // 收益趋势（真实数据）
      if (data.revenueTrend && data.revenueTrend.length > 0) {
        revenueData.value = {
          dates: data.revenueTrend.map(item => item.date),
          values: data.revenueTrend.map(item => Number(item.revenue) || 0)
        }
      } else {
        revenueData.value = generateMockRevenueData()
      }

      // 热力图（真实数据）
      if (data.heatmapData && data.heatmapData.length > 0) {
        heatmapData.value = data.heatmapData.map(item => [item.x, item.y, item.value])
        heatmapLots.value = data.heatmapLots || []
      } else {
        heatmapData.value = generateMockHeatmapData()
        heatmapLots.value = []
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      // 使用模拟数据兜底
      stats.value = { todayParking: 1234, todayRevenue: 5678, freeSpaces: 456, onlineUsers: 89 }
      trafficData.value = generateMockTrafficData()
      revenueData.value = generateMockRevenueData()
      heatmapData.value = generateMockHeatmapData()
      parkingRank.value = generateMockParkingRank()
      alerts.value = generateMockAlerts()
    }
    loading.value = false
  }

  // 模拟数据生成函数
  function generateMockTrafficData() {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    const values = hours.map(() => Math.floor(Math.random() * 100))
    return { hours, values }
  }

  function generateMockRevenueData() {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - 6 + i)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })
    const values = dates.map(() => Math.floor(Math.random() * 5000) + 2000)
    return { dates, values }
  }

  function generateMockHeatmapData() {
    const floors = ['B3', 'B2', 'B1', 'F1', 'F2']
    const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`)
    return floors.map((floor, y) =>
      hours.map((hour, x) => [x, y, Math.floor(Math.random() * 100)])
    ).flat()
  }

  function generateMockParkingRank() {
    return [
      { name: '万达广场停车场', revenue: 12580, usage: 95 },
      { name: '国贸中心停车场', revenue: 9860, usage: 88 },
      { name: '三里屯太古里停车场', revenue: 8750, usage: 92 },
      { name: '朝阳大悦城停车场', revenue: 7650, usage: 85 },
      { name: '望京SOHO停车场', revenue: 6540, usage: 78 }
    ]
  }

  function generateMockAlerts() {
    return [
      { id: 1, type: 'error', message: '车位B2-015地锁故障', time: '10:23' },
      { id: 2, type: 'warning', message: '停车场B2层网络延迟', time: '09:45' },
      { id: 3, type: 'info', message: '系统定时备份完成', time: '08:00' }
    ]
  }

  return {
    stats,
    trafficData,
    revenueData,
    heatmapData,
    heatmapLots,
    parkingRank,
    alerts,
    loading,
    fetchAllData
  }
})
