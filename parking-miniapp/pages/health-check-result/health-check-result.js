const { formatDate } = require('../../utils/util')

Page({
  data: {
    result: {
      overallStatus: 0,
      plateNumber: '',
      items: [],
      checkTime: ''
    },
    checkTime: '',
    suggestions: []
  },

  onLoad(options) {
    if (options.result) {
      try {
        const result = JSON.parse(decodeURIComponent(options.result))
        const suggestions = result.items
          .filter(item => item.status === 1 && item.suggestion)
          .map(item => item.suggestion)

        this.setData({
          result,
          checkTime: formatDate(result.checkTime, 'YYYY-MM-DD HH:mm'),
          suggestions
        })
      } catch (e) {
        console.error('解析结果失败:', e)
        wx.navigateBack()
      }
    }
  },

  // 查看历史记录
  viewHistory() {
    wx.navigateTo({
      url: '/pages/health-check-list/health-check-list'
    })
  },

  // 重新检测
  checkAgain() {
    wx.navigateBack()
  }
})