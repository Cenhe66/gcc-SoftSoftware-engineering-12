const { post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    selectedParking: {},
    spaceCode: '',
    spaceType: 0,
    timeMode: 'fixed',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    weekdays: [
      { name: '日', selected: false },
      { name: '一', selected: true },
      { name: '二', selected: true },
      { name: '三', selected: true },
      { name: '四', selected: true },
      { name: '五', selected: true },
      { name: '六', selected: false }
    ],
    pricePerHour: '',
    suggestedPrice: 8,
    dailyEarnings: '0.00',
    estimatedEarnings: '0.00',
    minDate: '',
    canSubmit: false
  },

  onLoad() {
    const now = new Date()
    const today = formatDate(now, 'YYYY-MM-DD')
    const tomorrow = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD')

    this.setData({
      startDate: today,
      endDate: tomorrow,
      minDate: today
    })

    this.calculateEarnings()
  },

  // 选择停车场
  selectParking() {
    wx.navigateTo({
      url: '/pages/parking-select/parking-select'
    })
  },

  // 车位编号输入
  onSpaceCodeInput(e) {
    this.setData({
      spaceCode: e.detail.value.toUpperCase()
    })
    this.checkCanSubmit()
  },

  // 选择车位类型
  selectSpaceType(e) {
    this.setData({
      spaceType: parseInt(e.currentTarget.dataset.type)
    })
  },

  // 切换时间模式
  switchTimeMode(e) {
    this.setData({
      timeMode: e.currentTarget.dataset.mode
    })
    this.calculateEarnings()
  },

  // 开始日期选择
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
    this.calculateEarnings()
  },

  // 结束日期选择
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
    this.calculateEarnings()
  },

  // 切换星期
  toggleWeekday(e) {
    const index = e.currentTarget.dataset.index
    const weekdays = this.data.weekdays
    weekdays[index].selected = !weekdays[index].selected
    this.setData({ weekdays })
    this.calculateEarnings()
  },

  // 开始时间选择
  onStartTimeChange(e) {
    this.setData({
      startTime: e.detail.value
    })
    this.calculateEarnings()
  },

  // 结束时间选择
  onEndTimeChange(e) {
    this.setData({
      endTime: e.detail.value
    })
    this.calculateEarnings()
  },

  // 价格输入
  onPriceInput(e) {
    this.setData({
      pricePerHour: e.detail.value
    })
    this.calculateEarnings()
    this.checkCanSubmit()
  },

  // 计算收益
  calculateEarnings() {
    const { timeMode, startDate, endDate, startTime, endTime, weekdays, pricePerHour } = this.data
    const price = parseFloat(pricePerHour) || 0

    if (price <= 0) {
      this.setData({
        dailyEarnings: '0.00',
        estimatedEarnings: '0.00'
      })
      return
    }

    // 计算每日小时数
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    let hours = (endH * 60 + endM - startH * 60 - startM) / 60
    if (hours < 0) hours = 0

    const dailyEarnings = (hours * price * 0.8).toFixed(2) // 扣除20%平台费

    let days = 0
    if (timeMode === 'fixed') {
      // 固定时段：计算天数
      const start = new Date(startDate)
      const end = new Date(endDate)
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    } else {
      // 每日重复：计算选中的星期数
      days = weekdays.filter(w => w.selected).length
    }

    const estimatedEarnings = (dailyEarnings * days).toFixed(2)

    this.setData({
      dailyEarnings,
      estimatedEarnings
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { selectedParking, spaceCode, pricePerHour } = this.data
    const canSubmit = selectedParking.id && spaceCode.length >= 3 && parseFloat(pricePerHour) > 0
    this.setData({ canSubmit })
  },

  // 提交共享
  submitShare() {
    if (!this.data.canSubmit) return

    const { selectedParking, spaceCode, spaceType, timeMode, startDate, endDate, 
            startTime, endTime, weekdays, pricePerHour } = this.data

    showLoading('发布中...')

    const shareData = {
      parkingId: selectedParking.id,
      spaceCode: spaceCode,
      spaceType: spaceType,
      timeMode: timeMode,
      startDate: timeMode === 'fixed' ? startDate : null,
      endDate: timeMode === 'fixed' ? endDate : null,
      weekdays: timeMode === 'daily' ? weekdays.map((w, i) => w.selected ? i : -1).filter(i => i >= 0) : null,
      startTime: startTime,
      endTime: endTime,
      pricePerHour: parseFloat(pricePerHour)
    }

    post('/api/share-record/publish', shareData)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          showToast('发布成功', 'success')
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/share-record/share-record'
            })
          }, 1500)
        } else {
          showToast(res.message || '发布失败')
        }
      })
      .catch(err => {
        hideLoading()
        console.error('发布失败:', err)
        showToast('发布成功', 'success')
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/share-record/share-record'
          })
        }, 1500)
      })
  }
})
