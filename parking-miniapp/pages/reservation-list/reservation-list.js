const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, showConfirm, formatDate } = require('../../utils/util')

// 支付超时时间（毫秒）- 1分钟
const PAY_TIMEOUT = 60 * 1000

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
    emptyText: '暂无预约记录',
    refreshTimer: null,  // 定时刷新定时器
    countdownTimer: null, // 支付倒计时定时器
    hasShownExpiredToast: false // 是否已显示过超时提示
  },

  onLoad() {
    this.loadReservationList()
  },

  onShow() {
    // 重置超时提示标记
    this.setData({ hasShownExpiredToast: false })
    this.loadReservationList()
    // 启动定时刷新（每30秒刷新一次）
    this.startAutoRefresh()
    // 启动支付倒计时更新（每秒更新）
    this.startCountdownTimer()
  },

  onHide() {
    // 停止定时刷新
    this.stopAutoRefresh()
    // 停止支付倒计时
    this.stopCountdownTimer()
  },

  onUnload() {
    // 停止定时刷新
    this.stopAutoRefresh()
    // 停止支付倒计时
    this.stopCountdownTimer()
  },

  // 启动支付倒计时更新
  startCountdownTimer() {
    if (this.data.countdownTimer) return
    
    this.data.countdownTimer = setInterval(() => {
      this.updatePayCountdown()
    }, 1000)  // 每秒更新
  },

  // 停止支付倒计时
  stopCountdownTimer() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
      this.data.countdownTimer = null
    }
  },

  // 更新支付倒计时
  updatePayCountdown() {
    // 如果已经显示过超时提示，不再检测
    if (this.data.hasShownExpiredToast) return
    
    const now = Date.now()
    const list = this.data.reservationList
    let hasExpired = false
    
    const updatedList = list.map(item => {
      if (item.status === 'unpaid' && item.createTime) {
        const createTime = new Date(item.createTime).getTime()
        const elapsed = now - createTime
        const remaining = PAY_TIMEOUT - elapsed
        
        if (remaining <= 0) {
          // 倒计时结束，标记为已超时
          hasExpired = true
          return {
            ...item,
            payCountdown: 0,
            payCountdownText: '已超时',
            isExpired: true
          }
        } else {
          // 计算剩余秒数
          const seconds = Math.floor(remaining / 1000)
          return {
            ...item,
            payCountdown: seconds,
            payCountdownText: `${seconds}秒`,
            isExpired: false
          }
        }
      }
      return item
    })
    
    this.setData({ reservationList: updatedList })
    
    // 只在第一次检测到超时订单时提示，然后切换到历史记录
    if (hasExpired && !this.data.hasShownExpiredToast) {
      // 标记已显示过提示，停止继续检测
      this.setData({ hasShownExpiredToast: true })
      // 停止倒计时定时器
      this.stopCountdownTimer()
      
      showToast('订单已超时取消')
      
      // 1.5秒后自动切换到历史记录标签页并刷新
      setTimeout(() => {
        this.setData({
          currentTab: 'history',
          pageNum: 1,
          hasMore: true,
          reservationList: []
        })
        this.loadReservationList()
      }, 1500)
    }
  },

  // 启动自动刷新
  startAutoRefresh() {
    if (this.data.refreshTimer) return
    
    this.data.refreshTimer = setInterval(() => {
      // 只刷新当前列表数据，不重置页码
      this.refreshCurrentList()
      // 更新已停时长（使用中状态）
      this.updateParkedDuration()
    }, 30000)  // 每30秒刷新一次
  },

  // 停止自动刷新
  stopAutoRefresh() {
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer)
      this.data.refreshTimer = null
    }
  },

  // 刷新当前列表（静默刷新）
  refreshCurrentList() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    if (!userId) return

    const params = {
      pageNum: 1,
      pageSize: this.data.reservationList.length || this.data.pageSize,
      status: this.getStatusByTab(this.data.currentTab)
    }

    get(`/api/reservation/list/${userId}`, params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || res.data || []
          const processedList = list.map(item => this.processReservationItem(item))
          this.setData({ reservationList: processedList })
        }
      })
      .catch(err => {
        console.error('刷新失败:', err)
      })
  },

  // 更新已停时长和预估费用（不重新请求接口）
  updateParkedDuration() {
    const list = this.data.reservationList
    const freeMinutes = 15
    const updatedList = list.map(item => {
      if (item.status === 'ongoing' && item.entryTime) {
        const entry = new Date(item.entryTime)
        const now = Date.now()
        const parkedMinutes = Math.floor((now - entry) / (1000 * 60))
        const parkedHours = Math.floor(parkedMinutes / 60)
        const parkedMins = parkedMinutes % 60
        
        // 计算预估费用
        let estimatedFee = '0.00'
        if (!item.isOwnerSelfUse) {
          const hourlyRate = item.hourlyRate || 8
          const billableMinutes = parkedMinutes - freeMinutes
          if (billableMinutes > 0) {
            const billableHours = Math.ceil(billableMinutes / 60)
            estimatedFee = (billableHours * hourlyRate).toFixed(2)
          }
        }
        
        return {
          ...item,
          parkedDuration: parkedHours > 0 ? `${parkedHours}小时${parkedMins}分` : `${parkedMins}分钟`,
          estimatedFee: estimatedFee
        }
      }
      return item
    })
    this.setData({ reservationList: updatedList })
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
    return get(`/api/reservation/list/${userId}`, params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || res.data || []
          const processedList = list.map(item => this.processReservationItem(item))

          this.setData({
            reservationList: this.data.pageNum === 1 ? processedList : [...this.data.reservationList, ...processedList],
            hasMore: processedList.length === this.data.pageSize,
            loading: false,
            emptyText: this.getEmptyText()
          })
        } else {
          this.setData({
            reservationList: [],
            hasMore: false,
            loading: false,
            emptyText: '加载失败，请重试'
          })
        }
      })
      .catch(err => {
        console.error('加载预约列表失败:', err)
        this.setData({
          reservationList: [],
          hasMore: false,
          loading: false,
          emptyText: '加载失败，请检查网络'
        })
      })
  },

  // 处理预约数据
  processReservationItem(item) {
    const statusMap = {
      0: { status: 'upcoming', statusText: '待使用' },
      1: { status: 'ongoing', statusText: '使用中' },
      2: { status: 'completed', statusText: '已完成' },
      3: { status: 'cancelled', statusText: '已取消' },
      4: { status: 'unpaid', statusText: '待支付' },
      5: { status: 'expired', statusText: '已过期' },
      6: { status: 'pending_payment', statusText: '待支付停车费' }
    }

    const statusInfo = statusMap[item.status] || { status: 'unknown', statusText: '未知' }

    // 计算预约时长（小时）
    const start = new Date(item.startTime)
    const end = new Date(item.endTime)
    const reserveHours = Math.ceil((end - start) / (1000 * 60 * 60))

    // 计算已停时长和预估费用（使用中状态）
    let parkedDuration = null
    let estimatedFee = null
    if (item.status === 1 && item.entryTime) {
      const entry = new Date(item.entryTime)
      const now = Date.now()
      const parkedMinutes = Math.floor((now - entry) / (1000 * 60))
      const parkedHours = Math.floor(parkedMinutes / 60)
      const parkedMins = parkedMinutes % 60
      parkedDuration = parkedHours > 0 ? `${parkedHours}小时${parkedMins}分` : `${parkedMins}分钟`
      
      // 计算预估费用（扣除15分钟免费时长）
      if (item.isOwnerSelfUse) {
        estimatedFee = '0.00'
      } else {
        const freeMinutes = 15
        const hourlyRate = item.hourlyRate || 8  // 停车场费率
        const billableMinutes = parkedMinutes - freeMinutes
        
        if (billableMinutes > 0) {
          const billableHours = Math.ceil(billableMinutes / 60)
          estimatedFee = (billableHours * hourlyRate).toFixed(2)
        } else {
          estimatedFee = '0.00'  // 15分钟内免费
        }
      }
    }

    // 计算支付倒计时（待支付状态）
    let payCountdown = null
    let payCountdownText = null
    let isExpired = false
    if (item.status === 4 && item.createTime) {
      const createTime = new Date(item.createTime).getTime()
      const now = Date.now()
      const elapsed = now - createTime
      const remaining = PAY_TIMEOUT - elapsed
      
      if (remaining <= 0) {
        payCountdown = 0
        payCountdownText = '已超时'
        isExpired = true
      } else {
        payCountdown = Math.floor(remaining / 1000)
        payCountdownText = `${payCountdown}秒`
      }
    }

    return {
      ...item,
      status: statusInfo.status,
      statusText: statusInfo.statusText,
      // 字段映射
      parkingName: item.parkingName || '未知停车场',
      spaceCode: item.spaceCode || item.spaceNo || '-',
      reserveFee: item.reserveFee || '0.00',
      parkingFee: item.parkingFee || '0.00',
      amount: item.parkingFee || item.reserveFee || '0.00',
      duration: reserveHours,  // 预约时长（小时）
      durationText: `${reserveHours}小时`,
      startDate: formatDate(item.startTime, 'MM-DD'),
      startTime: formatDate(item.startTime, 'HH:mm'),
      endDate: formatDate(item.endTime, 'MM-DD'),
      endTime: formatDate(item.endTime, 'HH:mm'),
      countdown: item.status === 0 ? this.calculateCountdown(item.startTime) : null,
      parkedDuration: parkedDuration,  // 已停时长
      estimatedFee: estimatedFee,      // 预估费用
      hourlyRate: item.hourlyRate || 8, // 停车场费率
      payCountdown: payCountdown,       // 支付倒计时（秒）
      payCountdownText: payCountdownText, // 支付倒计时文本
      isExpired: isExpired              // 是否已超时
    }
  },

  // 根据标签获取状态
  getStatusByTab(tab) {
    const map = {
      upcoming: '0,4',     // 待使用 + 待支付预约费
      ongoing: 1,          // 使用中
      history: '2,3,5,6'   // 已完成 + 已取消 + 已超时 + 待支付停车费
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
        
        post(`/api/reservation/cancel/${id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              showToast('取消成功', 'success')
              this.refreshData()
            } else {
              showToast(res.message || '取消失败')
            }
          })
          .catch(err => {
            hideLoading()
            console.error('取消预约失败:', err)
            showToast(err.message || '取消失败')
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

  // 入场（待使用状态）
  enterParking(e) {
    const item = e.currentTarget.dataset.item
    const tip = item.isOwnerSelfUse ? '确定要入场吗？' : '确定要入场吗？入场后将开始计时停车费。'

    showConfirm('确认入场', tip).then(confirmed => {
      if (confirmed) {
        showLoading('处理中...')

        // 调用入场接口
        post(`/api/reservation/entry/${item.id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              showToast('入场成功', 'success')
              // 刷新列表，状态变为使用中
              this.refreshData()
            } else {
              showToast(res.message || '入场失败')
            }
          })
          .catch(err => {
            hideLoading()
            console.error('入场失败:', err)
            showToast(err.message || '入场失败')
          })
      }
    })
  },

  // 去支付预约费用（待支付状态）
  goToPayReservation(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/payment/payment?reservationId=${item.id}&amount=${item.reserveFee || item.amount || 0}&type=reservation`
    })
  },

  // 去支付停车费（待支付停车费状态）
  goToPayParkingFee(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/payment/payment?reservationId=${item.id}&amount=${item.parkingFee || item.amount || 0}&type=parking`
    })
  },

  // 离场（使用中状态）
  exitParking(e) {
    const item = e.currentTarget.dataset.item
    const tip = item.isOwnerSelfUse ? '确定要离开停车场吗？' : '确定要离开停车场吗？离场后将计算停车费。'

    showConfirm('确认离场', tip).then(confirmed => {
      if (confirmed) {
        showLoading('处理中...')

        // 调用离场接口
        post(`/api/reservation/exit/${item.id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              const parkingFee = res.data
              showToast('离场成功', 'success')

              if (parseFloat(parkingFee) <= 0) {
                // 停车费为0，直接刷新列表
                this.refreshData()
              } else {
                // 跳转到支付页面支付停车费
                setTimeout(() => {
                  wx.navigateTo({
                    url: `/pages/payment/payment?reservationId=${item.id}&amount=${parkingFee}&type=parking`
                  })
                }, 1500)
              }
            } else {
              showToast(res.message || '离场失败')
            }
          })
          .catch(err => {
            hideLoading()
            console.error('离场失败:', err)
            showToast(err.message || '离场失败')
          })
      }
    })
  },

  // 去支付停车费（使用中状态 - 直接缴费）
  goToPayment(e) {
    const item = e.currentTarget.dataset.item
    // 如果没有离场，先提示用户离场
    wx.showModal({
      title: '提示',
      content: '请先离场后再支付停车费，是否立即离场？',
      confirmText: '立即离场',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.exitParking(e)
        }
      }
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
