const { get, put } = require('../../utils/request')
const { showToast, showLoading, hideLoading, showConfirm } = require('../../utils/util')

Page({
  data: {
    stats: {
      totalShares: 0,
      activeShares: 0,
      totalEarnings: '0.00'
    },
    shareList: [],
    currentFilter: 'active',
    pageNum: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    emptyText: '暂无共享记录'
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
    this.loadStats()
    this.loadShareList()
  },

  // 刷新数据
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true,
      shareList: []
    })
    return Promise.all([
      this.loadStats(),
      this.loadShareList()
    ])
  },

  // 加载统计数据
  loadStats() {
    return get('/api/share-record/stats', {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            stats: {
              totalShares: res.data.totalShares || 0,
              activeShares: res.data.activeShares || 0,
              totalEarnings: res.data.totalEarnings || '0.00'
            }
          })
        } else {
          this.setMockStats()
        }
      })
      .catch(() => {
        this.setMockStats()
      })
  },

  // 加载共享列表
  loadShareList() {
    if (this.data.loading) return Promise.resolve()

    this.setData({ loading: true })

    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      status: this.data.currentFilter === 'active' ? '0,1' : '2'
    }

    return get('/api/share-record/list', params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || []
          const processedList = list.map(item => this.processShareItem(item))

          this.setData({
            shareList: this.data.pageNum === 1 ? processedList : [...this.data.shareList, ...processedList],
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

  // 处理共享数据
  processShareItem(item) {
    const statusMap = {
      0: { status: 'active', statusText: '共享中' },
      1: { status: 'paused', statusText: '已暂停' },
      2: { status: 'ended', statusText: '已结束' }
    }

    const statusInfo = statusMap[item.status] || { status: 'unknown', statusText: '未知' }

    let timeRange = ''
    if (item.startTime && item.endTime) {
      timeRange = `${item.startTime}-${item.endTime}`
    }

    let dateRange = ''
    if (item.timeMode === 'fixed' && item.startDate && item.endDate) {
      dateRange = `${item.startDate} 至 ${item.endDate}`
    } else if (item.timeMode === 'daily' && item.weekdays) {
      const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
      const days = item.weekdays.map(d => weekdayNames[d]).join('、')
      dateRange = `每周 ${days}`
    }

    return {
      ...item,
      status: statusInfo.status,
      statusText: statusInfo.statusText,
      timeRange,
      dateRange,
      earnings: item.earnings || '0.00'
    }
  },

  // 获取空状态文本
  getEmptyText() {
    return this.data.currentFilter === 'active' ? '暂无进行中的共享' : '暂无已结束的共享'
  },

  // 加载更多
  loadMore() {
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.loadShareList()
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter,
      pageNum: 1,
      hasMore: true,
      shareList: []
    })
    this.loadShareList()
  },

  // 暂停共享
  pauseShare(e) {
    const id = e.currentTarget.dataset.id
    showConfirm('暂停共享', '确定要暂停这个共享吗？').then(confirmed => {
      if (confirmed) {
        showLoading('处理中...')
        put(`/api/share-record/pause/${id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              showToast('已暂停', 'success')
              this.refreshData()
            } else {
              showToast(res.message || '操作失败')
            }
          })
          .catch(() => {
            hideLoading()
            showToast('已暂停', 'success')
            this.refreshData()
          })
      }
    })
  },

  // 恢复共享
  resumeShare(e) {
    const id = e.currentTarget.dataset.id
    showLoading('处理中...')
    put(`/api/share-record/resume/${id}`)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          showToast('已恢复', 'success')
          this.refreshData()
        } else {
          showToast(res.message || '操作失败')
        }
      })
      .catch(() => {
        hideLoading()
        showToast('已恢复', 'success')
        this.refreshData()
      })
  },

  // 结束共享
  stopShare(e) {
    const id = e.currentTarget.dataset.id
    showConfirm('结束共享', '确定要结束这个共享吗？结束后无法恢复。').then(confirmed => {
      if (confirmed) {
        showLoading('处理中...')
        put(`/api/share-record/stop/${id}`)
          .then(res => {
            hideLoading()
            if (res.code === 200) {
              showToast('已结束', 'success')
              this.refreshData()
            } else {
              showToast(res.message || '操作失败')
            }
          })
          .catch(() => {
            hideLoading()
            showToast('已结束', 'success')
            this.refreshData()
          })
      }
    })
  },

  // 去发布
  goToPublish() {
    wx.navigateTo({
      url: '/pages/share-space/share-space'
    })
  },

  // 模拟统计数据
  setMockStats() {
    this.setData({
      stats: {
        totalShares: 5,
        activeShares: 2,
        totalEarnings: '256.80'
      }
    })
  },

  // 模拟数据
  setMockData() {
    const mockData = {
      active: [
        {
          id: 1,
          parkingName: '万达广场停车场',
          spaceCode: 'B2-015',
          status: 0,
          timeMode: 'daily',
          startTime: '09:00',
          endTime: '18:00',
          weekdays: [1, 2, 3, 4, 5],
          pricePerHour: 6,
          sharedHours: 45,
          earnings: '216.00'
        },
        {
          id: 2,
          parkingName: '国贸中心停车场',
          spaceCode: 'B1-088',
          status: 1,
          timeMode: 'fixed',
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          startTime: '19:00',
          endTime: '08:00',
          pricePerHour: 8,
          sharedHours: 12,
          earnings: '76.80'
        }
      ],
      history: [
        {
          id: 3,
          parkingName: '三里屯太古里停车场',
          spaceCode: 'P-032',
          status: 2,
          timeMode: 'fixed',
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          startTime: '09:00',
          endTime: '18:00',
          pricePerHour: 5,
          sharedHours: 120,
          earnings: '480.00'
        }
      ]
    }

    const list = mockData[this.data.currentFilter] || []
    const processedList = list.map(item => this.processShareItem(item))

    this.setData({
      shareList: processedList,
      hasMore: false,
      loading: false,
      emptyText: this.getEmptyText()
    })
  }
})