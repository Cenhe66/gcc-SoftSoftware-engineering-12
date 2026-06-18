const { get } = require('../../utils/request')
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

  // 加载当前停车
  loadCurrentParking() {
    // 调用后端接口获取当前停车记录
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    return get(`/api/parking-record/list/${userId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const parking = res.data
          parking.entryTime = formatDate(parking.entryTime, 'MM-DD HH:mm')
          parking.duration = this.calculateDuration(parking.entryTime)
          parking.estimatedCost = this.calculateCost(parking.entryTime, parking.pricePerHour)
          
          this.setData({ currentParking: parking })
        } else {
          // 使用模拟数据
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
          const list = res.data.records || []
          const processedList = list.map(item => ({
            ...item,
            entryTime: formatDate(item.entryTime, 'MM-DD HH:mm'),
            exitTime: item.exitTime ? formatDate(item.exitTime, 'MM-DD HH:mm') : null,
            duration: item.exitTime 
              ? formatDuration(getTimeDiff(item.entryTime, item.exitTime))
              : formatDuration(getTimeDiff(item.entryTime))
          }))

          this.setData({
            recordList: this.data.pageNum === 1 ? processedList : [...this.data.recordList, ...processedList],
            hasMore: processedList.length === this.data.pageSize,
            loading: false
          })
        } else {
          this.setMockRecordList()
        }
      })
      .catch(() => {
        this.setMockRecordList()
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

  // 计算预估费用
  calculateCost(entryTime, pricePerHour) {
    const minutes = getTimeDiff(entryTime)
    const hours = Math.ceil(minutes / 60)
    return (hours * pricePerHour).toFixed(2)
  },

  // 跳转到支付页面
  goToPayment(e) {
    const record = e.currentTarget.dataset.record
    wx.navigateTo({
      url: `/pages/payment/payment?recordId=${record.id}&amount=${record.estimatedCost}`
    })
  },

  // 查看记录详情
  viewRecordDetail(e) {
    const record = e.currentTarget.dataset.record
    wx.showModal({
      title: '停车详情',
      content: `停车场：${record.parkingName}\n车位：${record.spaceCode || '-'}\n入场：${record.entryTime}\n离场：${record.exitTime || '未离场'}\n时长：${record.duration}\n费用：¥${record.amount}`,
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
