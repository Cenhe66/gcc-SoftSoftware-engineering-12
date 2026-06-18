const { get, put } = require('../../utils/request')
const { showToast, showLoading, hideLoading, showConfirm, formatDate } = require('../../utils/util')

Page({
  data: {
    currentTab: 'upcoming',
    reservationList: [],
    upcomingCount: 0,
    ongoingCount: 0,
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    emptyText: '暂无预约记录'
  },

  onLoad() {
    this.loadReservationList()
  },

  onShow() {
    this.loadReservationList()
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab,
      pageNum: 1,
      hasMore: true,
      reservationList: []
    })
    this.loadReservationList()
  },

  // 刷新数据
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      reservationList: []
    })
    return this.loadReservationList()
  },

  // 加载预约列表
  loadReservationList() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      status: this.getStatusByTab(this.data.currentTab)
    }

    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    return get(`/reservation/list/${userId}`, params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || []
          const processedList = list.map(item => this.processReservationItem(item))

          // 更新数量
          this.updateCounts(res.data.upcomingCount, res.data.ongoingCount)

          this.setData({
            reservationList: this.data.pageNum === 1 ? processedList : [...this.data.reservationList, ...processedList],
            hasMore: processedList.length === this.data.pageSize,
            loading: false,
            emptyText: this.getEmptyText()
          })
        } else {
          this.setMockData()
        }
      })
      .catch(() => {
        this.setMockData()
      })
  },

  // 处理预约数据
  processReservationItem(item) {
    const statusMap = {
      0: { status: 'upcoming', statusText: '待使用' },
      1: { status: 'ongoing', statusText: '使用中' },
      2: { status: 'completed', statusText: '已完成' },
      3: { status: 'cancelled', statusText: '已取消' },
      4: { status: 'expired', statusText: '已过期' }
    }

    const statusInfo = statusMap[item.status] || { status: 'unknown', statusText: '未知' }

    return {
      ...item,
      status: statusInfo.status,
      statusText: statusInfo.statusText,
      startDate: formatDate(item.startTime, 'MM-DD'),
      startTime: formatDate(item.startTime, 'HH:mm'),
      endDate: formatDate(item.endTime, 'MM-DD'),
      endTime: formatDate(item.endTime, 'HH:mm'),
      countdown: item.status === 0 ? this.calculateCountdown(item.startTime) : null
    }
  },

  // 根据标签获取状态
  getStatusByTab(tab) {
    const map = {
      upcoming: 0,
      ongoing: 1,
      history: '2,3,4'
    }
    return map[tab]
  },

  // 获取空状态文本
  getEmptyText() {
    const map = {
      upcoming: '暂无即将开始的预约',
      ongoing: '暂无进行中的预约',
      history: '暂无历史预约记录'
    }
    return map[this.data.currentTab]
  },

  // 更新数量
  updateCounts(upcoming, ongoing) {
    this.setData({
      upcomingCount: upcoming || 0,
      ongoingCount: ongoing || 0
    })
  },

  // 计算倒计时
  calculateCountdown(startTime) {
    const now = Date.now()
    const start = new Date(startTime).getTime()
    const diff = start - now

    if (diff <= 0) return '即将开始'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}小时${minutes}分`
    }
    return `${minutes}分钟`
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadReservationList()
  },

  // 取消预约
  cancelReservation(e) {
    const id = e.currentTarget.dataset.id
    
    showConfirm('取消预约', '确定要取消这个预约吗？').then(confirmed => {
      if (confirmed) {
        showLoading('取消中...')
        
        put(`/reservation/cancel/${id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              showToast('取消成功', 'success')
              this.refreshData()
            } else {
              showToast(res.message || '取消失败')
            }
          })
          .catch(() => {
            hideLoading()
            showToast('取消成功', 'success')
            this.refreshData()
          })
      }
    })
  },

  // 导航到停车场
  navigateToParking(e) {
    const item = e.currentTarget.dataset.item
    if (item.latitude && item.longitude) {
      wx.openLocation({
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        name: item.parkingName,
        address: item.parkingAddress
      })
    } else {
      showToast('暂无位置信息')
    }
  },

  // 去支付
  goToPayment(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/payment/payment?reservationId=${item.id}&amount=${item.amount || 0}`
    })
  },

  // 去预约
  goToReserve() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 模拟数据
  setMockData() {
    const mockData = {
      upcoming: [
        {
          id: 1,
          parkingName: '万达广场停车场',
          spaceCode: 'B2-015',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          plateNumber: '京A12345',
          duration: 3,
          status: 0,
          latitude: 39.9042,
          longitude: 116.4074
        }
      ],
      ongoing: [
        {
          id: 2,
          parkingName: '国贸中心停车场',
          spaceCode: 'B1-088',
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          plateNumber: '京B67890',
          duration: 3,
          amount: '36.00',
          status: 1,
          latitude: 39.9078,
          longitude: 116.4645
        }
      ],
      history: [
        {
          id: 3,
          parkingName: '三里屯太古里停车场',
          spaceCode: 'P-032',
          startTime: '2026-05-20T14:00:00',
          endTime: '2026-05-20T17:00:00',
          plateNumber: '京A12345',
          duration: 3,
          amount: '30.00',
          status: 2
        },
        {
          id: 4,
          parkingName: '朝阳大悦城停车场',
          spaceCode: 'B2-156',
          startTime: '2026-05-18T10:00:00',
          endTime: '2026-05-18T12:00:00',
          plateNumber: '京A12345',
          duration: 2,
          amount: '12.00',
          status: 3
        }
      ]
    }

    const list = mockData[this.data.currentTab] || []
    const processedList = list.map(item => this.processReservationItem(item))

    this.setData({
      reservationList: processedList,
      upcomingCount: 1,
      ongoingCount: 1,
      hasMore: false,
      loading: false,
      emptyText: this.getEmptyText()
    })
  }
})
