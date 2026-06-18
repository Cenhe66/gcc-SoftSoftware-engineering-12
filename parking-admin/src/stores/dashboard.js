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

  // 停车场排行
  const parkingRank = ref([])

  // 告警列表
  const alerts = ref([])

  // 加载状态
  const loading = ref(false)

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const res = await request.get('/dashboard/stats')
      stats.value = res.data
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 使用模拟数据
      stats.value = {
        todayParking: 1234,
        todayRevenue: 5678,
        freeSpaces: 456,
        onlineUsers: 89
      }
    }
  }

  // 获取车流趋势
  const fetchTrafficData = async () => {
    try {
      const res = await request.get('/dashboard/traffic')
      trafficData.value = res.data
    } catch (error) {
      console.error('获取车流数据失败:', error)
      // 使用模拟数据
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      const values = hours.map(() => Math.floor(Math.random() * 100))
      trafficData.value = { hours, values }
    }
  }

  // 获取收益趋势
  const fetchRevenueData = async () => {
    try {
      const res = await request.get('/dashboard/revenue')
      revenueData.value = res.data
    } catch (error) {
      console.error('获取收益数据失败:', error)
      // 使用模拟数据
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - 6 + i)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
      const values = dates.map(() => Math.floor(Math.random() * 5000) + 2000)
      revenueData.value = { dates, values }
    }
  }

  // 获取热力图数据
  const fetchHeatmapData = async () => {
    try {
      const res = await request.get('/dashboard/heatmap')
      heatmapData.value = res.data
    } catch (error) {
      console.error('获取热力图数据失败:', error)
      // 使用模拟数据
      const floors = ['B3', 'B2', 'B1', 'F1', 'F2']
      const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`)
      heatmapData.value = floors.map((floor, y) =>
        hours.map((hour, x) => [x, y, Math.floor(Math.random() * 100)])
      ).flat()
    }
  }

  // 获取停车场排行
  const fetchParkingRank = async () => {
    try {
      const res = await request.get('/dashboard/ranking')
      parkingRank.value = res.data
    } catch (error) {
      console.error('获取排行数据失败:', error)
      // 使用模拟数据
      parkingRank.value = [
        { name: '万达广场停车场', revenue: 12580, usage: 95 },
        { name: '国贸中心停车场', revenue: 9860, usage: 88 },
        { name: '三里屯太古里停车场', revenue: 8750, usage: 92 },
        { name: '朝阳大悦城停车场', revenue: 7650, usage: 85 },
        { name: '望京SOHO停车场', revenue: 6540, usage: 78 }
      ]
    }
  }

  // 获取告警列表
  const fetchAlerts = async () => {
    try {
      const res = await request.get('/dashboard/alerts')
      alerts.value = res.data
    } catch (error) {
      console.error('获取告警数据失败:', error)
      // 使用模拟数据
      alerts.value = [
        { id: 1, type: 'error', message: '车位B2-015地锁故障', time: '10:23' },
        { id: 2, type: 'warning', message: '停车场B2层网络延迟', time: '09:45' },
        { id: 3, type: 'info', message: '系统定时备份完成', time: '08:00' }
      ]
    }
  }

  // 获取所有数据
  const fetchAllData = async () => {
    loading.value = true
    await Promise.all([
      fetchStats(),
      fetchTrafficData(),
      fetchRevenueData(),
      fetchHeatmapData(),
      fetchParkingRank(),
      fetchAlerts()
    ])
    loading.value = false
  }

  return {
    stats,
    trafficData,
    revenueData,
    heatmapData,
    parkingRank,
    alerts,
    loading,
    fetchStats,
    fetchTrafficData,
    fetchRevenueData,
    fetchHeatmapData,
    fetchParkingRank,
    fetchAlerts,
    fetchAllData
  }
})
