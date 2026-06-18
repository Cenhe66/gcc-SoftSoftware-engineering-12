const { get } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    totalEarnings: '0.00',
    monthEarnings: '0.00',
    todayEarnings: '0.00',
    currentMonth: '',
    billList: [],
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    monthOptions: [], // 月份选项
    showMonthPicker: false // 是否显示月份选择器
  },

  onLoad() {
    const now = new Date()
    this.setData({
      currentMonth: formatDate(now, 'YYYY年MM月')
    })
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
    this.loadStats()
    this.loadBillList()
  },

  // 刷新数据
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      billList: []
    })
    return Promise.all([
      this.loadStats(),
      this.loadBillList()
    ])
  },

  // 加载统计数据
  loadStats() {
    return get('/api/share-bill/stats', {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            totalEarnings: res.data.totalEarnings || '0.00',
            monthEarnings: res.data.monthEarnings || '0.00',
            todayEarnings: res.data.todayEarnings || '0.00'
          })
        } else {
          this.setMockStats()
        }
      })
      .catch(() => {
        this.setMockStats()
      })
  },

  // 加载账单列表
  loadBillList() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      month: this.data.currentMonth.replace(/[年月]/g, '-').replace(/-$/, '')
    }

    return get('/api/share-bill/list', params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || []
          const processedList = list.map(item => this.processBillItem(item))

          this.setData({
            billList: this.data.pageNum === 1 ? processedList : [...this.data.billList, ...processedList],
            hasMore: processedList.length === this.data.pageSize,
            loading: false
          })
        } else {
          this.setMockData()
        }
      })
      .catch(() => {
        this.setMockData()
      })
  },

  // 处理账单数据
  processBillItem(item) {
    const statusMap = {
      0: { status: 'pending', statusText: '待结算' },
      1: { status: 'completed', statusText: '已到账' }
    }

    const statusInfo = statusMap[item.status] || { status: 'unknown', statusText: '未知' }

    return {
      ...item,
      status: statusInfo.status,
      statusText: statusInfo.statusText,
      time: formatDate(item.createTime, 'MM-DD HH:mm')
    }
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadBillList()
  },

  // 选择月份
  selectMonth() {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    // 生成最近12个月的选项
    const monthOptions = []

    for (let i = 0; i < 12; i++) {
      let year = currentYear
      let month = currentMonth - i

      if (month <= 0) {
        year = year - 1
        month = month + 12
      }

      monthOptions.push({
        text: year + '年' + (month < 10 ? '0' + month : month) + '月',
        year: year,
        month: month
      })
    }

    this.setData({
      monthOptions: monthOptions,
      showMonthPicker: true
    })
  },

  // 关闭月份选择器
  closeMonthPicker() {
    this.setData({
      showMonthPicker: false
    })
  },

  // 确认选择月份
  confirmMonth(e) {
    const index = e.currentTarget.dataset.index
    const selected = this.data.monthOptions[index]
    const selectedMonth = selected.year + '年' + (selected.month < 10 ? '0' + selected.month : selected.month) + '月'

    this.setData({
      currentMonth: selectedMonth,
      showMonthPicker: false,
      pageNum: 1,
      hasMore: true,
      billList: []
    })
    this.loadBillList()
  },

  // 模拟统计数据
  setMockStats() {
    this.setData({
      totalEarnings: '256.80',
      monthEarnings: '156.80',
      todayEarnings: '24.00'
    })
  },

  // 模拟数据
  setMockData() {
    const mockData = [
      {
        id: 1,
        type: 'income',
        title: '共享收益',
        description: '万达广场 B2-015',
        amount: '48.00',
        status: 1,
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'income',
        title: '共享收益',
        description: '国贸中心 B1-088',
        amount: '64.00',
        status: 1,
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'expense',
        title: '平台服务费',
        description: '服务费扣除 20%',
        amount: '28.00',
        status: 1,
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        type: 'income',
        title: '共享收益',
        description: '三里屯太古里 P-032',
        amount: '120.00',
        status: 1,
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        type: 'income',
        title: '共享收益',
        description: '万达广场 B2-015',
        amount: '36.00',
        status: 0,
        createTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]

    const processedList = mockData.map(item => this.processBillItem(item))

    this.setData({
      billList: processedList,
      hasMore: false,
      loading: false
    })
  }
})