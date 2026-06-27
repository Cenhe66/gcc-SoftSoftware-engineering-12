const { get } = require('../../utils/request')
const { formatDate } = require('../../utils/util')

Page({
  data: {
    recordList: [],
    loading: false,
    emptyText: '暂无挪车记录',
    activeTab: 'sent',
    userId: ''
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    this.setData({ userId })
    this.loadRecordList()
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    this.setData({ userId })
    this.loadRecordList()
  },

  onPullDownRefresh() {
    this.loadRecordList(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab, recordList: [] }, () => {
      this.loadRecordList()
    })
  },

  // 加载挪车记录（合并后端 + 本地匿名记录）
  loadRecordList(callback) {
    this.setData({ loading: true })

    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo ? userInfo.id : ''
    const localKey = 'moveCarHistory_' + (userId || '0')
    const localHistory = wx.getStorageSync(localKey) || []

    const mergeAndSet = (serverList) => {
      const all = [...serverList, ...localHistory]
      const map = new Map()
      all.forEach(item => {
        if (item.id && !map.has(item.id)) {
          map.set(item.id, item)
        }
      })
      const uniqueList = Array.from(map.values())
      const sorted = uniqueList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      const processedList = sorted.map(item => ({
        ...item,
        createTime: item.createTime ? formatDate(item.createTime, 'MM-DD HH:mm') : ''
      }))
      this.setData({
        recordList: processedList,
        loading: false,
        emptyText: processedList.length > 0 ? '' : '暂无挪车记录'
      })
      if (callback) callback()
    }

    // 未登录（匿名用户）只显示本地记录，不调后端
    if (!userId) {
      mergeAndSet([])
      return
    }

    const isReceived = this.data.activeTab === 'received'
    const url = isReceived
      ? `/api/move-car/list/target/${userId}`
      : `/api/move-car/list/requester/${userId}`

    get(url, { pageNum: 1, pageSize: 100 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.records || [])
          const processedServerList = list.map(item => ({
            ...item,
            statusText: item.status === 0 ? '待处理' : '已完成'
          }))
          mergeAndSet(processedServerList)
        } else {
          mergeAndSet([])
        }
      })
      .catch(() => {
        mergeAndSet([])
      })
  },

  // 查看记录详情（进入对话）
  viewRecordDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/move-car-message/move-car-message?requestId=${id}`
    })
  }
})
