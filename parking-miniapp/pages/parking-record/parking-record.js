const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate, formatDuration, getTimeDiff } = require('../../utils/util')

Page({
  data: {
    currentParking: null,
    recordList: [],
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    currentFilter: 'all'
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
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

  // 加载数据
  loadData() {
    this.loadCurrentParking()
    this.loadRecordList()
  },

  // 刷新数据
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      recordList: []
    })
    return Promise.all([
      this.loadCurrentParking(),
      this.loadRecordList()
    ])
  },

  // 加载当前停车（以预约流程为准：从预约接口获取进行中预约）
  loadCurrentParking() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    return get(`/api/reservation/list/${userId}`, { status: 1 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || res.data || []
          const reservation = list[0]
          if (!reservation) {
            this.setMockCurrentParking()
            return
          }
          const originalEntryTime = reservation.entryTime
          const now = new Date()
          const entry = new Date(originalEntryTime)
          const parkedMinutes = Math.floor((now - entry) / (1000 * 60))
          const hours = Math.floor(parkedMinutes / 60)
          const mins = parkedMinutes % 60

          const parking = {
            ...reservation,
            id: reservation.id,
            parkingName: reservation.parkingName || '未知停车场',
            spaceCode: reservation.spaceCode || '-',
            entryTimeDisplay: formatDate(originalEntryTime, 'MM-DD HH:mm'),
            duration: hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`,
            estimatedCost: this.calculateCost(originalEntryTime, reservation.hourlyRate || 8),
            reserveFee: reservation.reserveFee || '0.00'
          }
          this.setData({ currentParking: parking })
        } else {
          this.setMockCurrentParking()
        }
      })
      .catch(() => {
        this.setMockCurrentParking()
      })
  },

  // 加载历史记录
  loadRecordList() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      filter: this.data.currentFilter
    }

    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    return get(`/api/parking-record/list/${userId}`, params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || res.data || []
          const processedList = list.map(item => {
            // 先保存原始时间用于计算
            const originalEntryTime = item.entryTime
            const originalExitTime = item.exitTime
            
            return {
              ...item,
              // 字段映射，添加默认值防止 undefined
              parkingName: item.parkingName || item.lotName || '未知停车场',
              spaceCode: item.spaceCode || item.spaceNo || '-',
              amount: item.fee || item.paidAmount || item.parkingFee || '0.00',
              entryTimeDisplay: formatDate(originalEntryTime, 'MM-DD HH:mm'),
              exitTimeDisplay: originalExitTime ? formatDate(originalExitTime, 'MM-DD HH:mm') : '-',
              duration: originalExitTime 
                ? formatDuration(getTimeDiff(originalEntryTime, originalExitTime))
                : formatDuration(getTimeDiff(originalEntryTime)),
              status: item.status || 0
            }
          })

          this.setData({
            recordList: this.data.pageNum === 1 ? processedList : [...this.data.recordList, ...processedList],
            hasMore: processedList.length === this.data.pageSize,
            loading: false
          })
        } else {
          this.setData({
            recordList: [],
            hasMore: false,
            loading: false
          })
        }
      })
      .catch(err => {
        console.error('加载停车记录失败:', err)
        this.setData({
          recordList: [],
          hasMore: false,
          loading: false
        })
      })
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadRecordList()
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter,
      pageNum: 1,
      hasMore: true,
      recordList: []
    })
    this.loadRecordList()
  },

  // 计算停车时长
  calculateDuration(entryTime) {
    const minutes = getTimeDiff(entryTime)
    return formatDuration(minutes)
  },

  // 计算预估费用（与预约流程一致：扣除15分钟免费时长）
  calculateCost(entryTime, pricePerHour) {
    const minutes = getTimeDiff(entryTime)
    const freeMinutes = 15
    const billableMinutes = minutes - freeMinutes
    if (billableMinutes <= 0) {
      return '0.00'
    }
    const hours = Math.ceil(billableMinutes / 60)
    return (hours * pricePerHour).toFixed(2)
  },

  // 离场缴费（以预约流程为准：先离场再支付）
  goToPayment(e) {
    const record = e.currentTarget.dataset.record
    if (!record || !record.id) {
      showToast('记录信息不完整')
      return
    }
    showLoading('处理中...')
    post(`/api/reservation/exit/${record.id}`)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          const parkingFee = res.data
          wx.navigateTo({
            url: `/pages/payment/payment?reservationId=${record.id}&amount=${parkingFee}&type=parking`
          })
        } else {
          showToast(res.message || '离场失败')
        }
      })
      .catch(err => {
        hideLoading()
        console.error('离场失败:', err)
        showToast(err.message || '离场失败')
      })
  },

  // 查看记录详情
  viewRecordDetail(e) {
    const record = e.currentTarget.dataset.record
    wx.showModal({
      title: '停车详情',
      content: `停车场：${record.parkingName || '未知停车场'}\n车位：${record.spaceCode || '-'}\n入场：${record.entryTimeDisplay || '-'}\n离场：${record.exitTimeDisplay || '未离场'}\n时长：${record.duration || '-'}\n费用：¥${record.amount || '0.00'}`,
      showCancel: false
    })
  },

  // 模拟当前停车数据
  setMockCurrentParking() {
    const now = new Date()
    const entryTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2小时前
    
    this.setData({
      currentParking: {
        id: 999,
        parkingName: '万达广场停车场',
        spaceCode: 'B2-015',
        entryTime: formatDate(entryTime, 'MM-DD HH:mm'),
        duration: '2小时15分钟',
        estimatedCost: '24.00',
        pricePerHour: 8
      }
    })
  },

  // 模拟历史记录数据
  setMockRecordList() {
    const mockData = [
      {
        id: 1,
        parkingName: '国贸中心停车场',
        spaceCode: 'B1-088',
        entryTime: '05-20 09:30',
        exitTime: '05-20 18:45',
        duration: '9小时15分钟',
        amount: '60.00',
        status: 1
      },
      {
        id: 2,
        parkingName: '三里屯太古里停车场',
        spaceCode: 'P-032',
        entryTime: '05-18 14:20',
        exitTime: '05-18 17:30',
        duration: '3小时10分钟',
        amount: '30.00',
        status: 1
      },
      {
        id: 3,
        parkingName: '朝阳大悦城停车场',
        spaceCode: 'B2-156',
        entryTime: '05-15 10:00',
        exitTime: '05-15 12:30',
        duration: '2小时30分钟',
        amount: '15.00',
        status: 1
      },
      {
        id: 4,
        parkingName: '望京SOHO停车场',
        spaceCode: 'B1-045',
        entryTime: '05-10 08:45',
        exitTime: null,
        duration: '-',
        amount: '-',
        status: 0
      }
    ]

    this.setData({
      recordList: this.data.pageNum === 1 ? mockData : [...this.data.recordList, ...mockData],
      hasMore: false,
      loading: false
    })
  }
})
