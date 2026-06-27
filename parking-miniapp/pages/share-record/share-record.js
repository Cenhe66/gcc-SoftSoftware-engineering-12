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
    const userInfo = wx.getStorageSync('userInfo')
    const ownerId = userInfo ? userInfo.id : ''
    return get('/api/share-record/stats', { ownerId }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            stats: {
              totalShares: res.data.totalSharedCount || 0,
              activeShares: res.data.activeCount || 0,
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

    const userInfo = wx.getStorageSync('userInfo')
    const ownerId = userInfo ? userInfo.id : ''

    const params = {
      ownerId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      status: this.data.currentFilter === 'active' ? '1' : '2,3'
    }

    return get('/api/share-record/list', params, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data || []
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
      1: { status: 'active', statusText: '共享中' },
      2: { status: 'paused', statusText: '已暂停' },
      3: { status: 'ended', statusText: '已结束' }
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
            showToast('操作失败，请重试')
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
        showToast('操作失败，请重试')
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
            showToast('操作失败，请重试')
          })
      }
    })
  },

  // 查看二维码
  showQrCode(e) {
    const spaceId = e.currentTarget.dataset.spaceId
    if (!spaceId) {
      showToast('车位信息不完整')
      return
    }
    get(`/api/parking-space/qrcode/${spaceId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const base64 = res.data.base64
          wx.previewImage({
            urls: [base64]
          })
        } else {
          showToast('生成二维码失败')
        }
      })
      .catch(() => {
        showToast('生成二维码失败')
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
        totalShares: 0,
        activeShares: 0,
        totalEarnings: '0.00'
      }
    })
  },

  // 模拟数据
  setMockData() {
    this.setData({
      shareList: [],
      hasMore: false,
      loading: false,
      emptyText: this.getEmptyText()
    })
  }
})