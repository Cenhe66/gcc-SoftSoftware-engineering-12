const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    mySpaces: [],
    selectedSpace: {},
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
    this.loadMySpaces()
  },

  // 加载我的车位
  loadMySpaces() {
    get('/api/parking-space/my')
      .then(res => {
        if (res.code === 200 && res.data) {
          // 获取停车场名称映射
          get('/api/parking-lot/list').then(lotRes => {
            if (lotRes.code === 200 && lotRes.data) {
              const lotMap = {}
              lotRes.data.forEach(lot => { lotMap[lot.id] = lot.name })
              const spaces = res.data.map(s => {
                const isFree = s.status === 0 && s.isShared !== 1
                const isShared = s.isShared === 1
                return {
                  ...s,
                  displayName: `${lotMap[s.lotId] || '未知停车场'} - ${s.spaceNo || s.spaceCode}`,
                  disabled: !isFree && !isShared,
                  statusText: isShared ? '共享中' : (isFree ? '空闲' : '占用'),
                  statusClass: isShared ? 'status-shared' : (isFree ? 'status-free' : 'status-occupied')
                }
              })
              this.setData({ mySpaces: spaces })
            }
          })
        }
      })
      .catch(err => {
        console.error('加载我的车位失败:', err)
      })
  },

  // 选择我的车位
  selectMySpace(e) {
    const index = e.currentTarget.dataset.index
    const space = this.data.mySpaces[index]
    if (space.disabled) {
      showToast('该车位当前不可共享')
      return
    }
    this.setData({
      selectedSpace: space,
      selectedParking: { id: space.lotId, name: space.parkingName },
      spaceCode: space.spaceCode
    })
    this.checkCanSubmit()
  },

  // 选择停车场（保留兼容，但不再主要使用）
  selectParking() {
    wx.navigateTo({
      url: '/pages/parking-select/parking-select'
    })
  },

  // 车位编号输入（保留兼容，但不再主要使用）
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
    const { selectedSpace, pricePerHour } = this.data
    const canSubmit = selectedSpace.id && parseFloat(pricePerHour) > 0
    this.setData({ canSubmit })
  },

  // 提交共享
  submitShare() {
    if (!this.data.canSubmit) return

    const { selectedSpace, spaceType, timeMode, startDate, endDate,
            startTime, endTime, weekdays, pricePerHour } = this.data

    const userInfo = wx.getStorageSync('userInfo')

    showLoading('发布中...')

    // 组合为 LocalDateTime 格式（YYYY-MM-DDTHH:mm:ss）
    const startDateTime = `${startDate}T${startTime}:00`
    const endDateTime = `${endDate}T${endTime}:00`

    const shareData = {
      lotId: selectedSpace.lotId,
      spaceNo: selectedSpace.spaceNo || selectedSpace.spaceCode,
      shareType: spaceType,
      userId: userInfo?.id || 1,
      timeMode: timeMode,
      startDate: timeMode === 'fixed' ? startDate : null,
      endDate: timeMode === 'fixed' ? endDate : null,
      weekdays: timeMode === 'daily' ? weekdays.map((w, i) => w.selected ? i : -1).filter(i => i >= 0) : null,
      startTime: startDateTime,
      endTime: endDateTime,
      hourlyPrice: parseFloat(pricePerHour)
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
        showToast(err.message || '发布失败')
      })
  }
})
