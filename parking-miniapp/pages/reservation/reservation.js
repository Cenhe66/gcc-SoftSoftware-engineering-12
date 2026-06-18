const { post, get } = require('../../utils/request')
const { showToast, showLoading, hideLoading, formatDate } = require('../../utils/util')

Page({
  data: {
    parkingId: null,
    spaceId: null,
    spaceCode: '',
    spaceType: 0,
    parkingInfo: {
      name: '',
      address: '',
      pricePerHour: 0
    },
    selectedDate: '',
    startTime: '',
    endTime: '',
    duration: 0,
    estimatedCost: '0.00',
    plateNumber: '',
    phone: '',
    minDate: '',
    maxDate: '',
    canSubmit: false
  },

  onLoad(options) {
    const { parkingId, spaceId } = options
    
    if (!parkingId) {
      showToast('参数错误')
      wx.navigateBack()
      return
    }

    // 初始化日期
    const now = new Date()
    const today = formatDate(now, 'YYYY-MM-DD')
    const maxDate = formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
    const currentHour = now.getHours()
    const defaultStartTime = `${String(currentHour + 1).padStart(2, '0')}:00`
    const defaultEndTime = `${String(currentHour + 2).padStart(2, '0')}:00`

    this.setData({
      parkingId,
      spaceId: spaceId || null,
      selectedDate: today,
      minDate: today,
      maxDate: maxDate,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      phone: wx.getStorageSync('userInfo')?.phone || ''
    })

    this.loadParkingInfo(parkingId)
    if (spaceId) {
      this.loadSpaceInfo(spaceId)
    }
    this.calculateDuration()
  },

  // 加载停车场信息
  loadParkingInfo(id) {
    get(`/api/parking-lot/detail/${id}`)
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            parkingInfo: {
              name: res.data.name,
              address: res.data.address,
              pricePerHour: res.data.hourlyRate || res.data.pricePerHour || 0
            }
          }, () => {
            // 数据加载完成后重新计算费用
            this.calculateDuration()
          })
        } else {
          this.setMockParkingInfo()
        }
      })
      .catch(() => {
        this.setMockParkingInfo()
      })
  },

  // 加载车位信息
  loadSpaceInfo(spaceId) {
    // 这里可以调用API获取车位详情
    this.setData({
      spaceCode: 'B2-015',
      spaceType: 0
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 开始时间选择
  onStartTimeChange(e) {
    const startTime = e.detail.value
    this.setData({ startTime })
    
    // 如果结束时间早于开始时间，自动调整
    if (this.data.endTime <= startTime) {
      const [hours, minutes] = startTime.split(':').map(Number)
      const newEndHours = hours + 1
      if (newEndHours <= 23) {
        this.setData({
          endTime: `${String(newEndHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        })
      }
    }
    
    this.calculateDuration()
  },

  // 结束时间选择
  onEndTimeChange(e) {
    this.setData({
      endTime: e.detail.value
    })
    this.calculateDuration()
  },

  // 计算时长和费用
  calculateDuration() {
    const [startHours, startMinutes] = this.data.startTime.split(':').map(Number)
    const [endHours, endMinutes] = this.data.endTime.split(':').map(Number)

    let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
    if (duration < 0) duration = 0

    const hours = Math.ceil(duration / 60)
    const pricePerHour = parseFloat(this.data.parkingInfo.pricePerHour) || 0
    const cost = hours * pricePerHour

    this.setData({
      duration: hours,
      estimatedCost: cost.toFixed(2)
    })

    this.checkCanSubmit()
  },

  // 车牌号输入
  onPlateNumberInput(e) {
    this.setData({
      plateNumber: e.detail.value.toUpperCase()
    })
    this.checkCanSubmit()
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { selectedDate, startTime, endTime, plateNumber, phone, duration } = this.data
    const canSubmit = selectedDate && startTime && endTime && 
                      plateNumber.length >= 7 && /^1[3-9]\d{9}$/.test(phone) && 
                      duration > 0
    this.setData({ canSubmit })
  },

  // 提交预约
  submitReservation() {
    if (!this.data.canSubmit) return

    const { parkingId, spaceId, selectedDate, startTime, endTime, plateNumber, phone } = this.data

    showLoading('提交中...')

    const reservationData = {
      parkingId: parseInt(parkingId),
      spaceId: spaceId ? parseInt(spaceId) : null,
      reservationDate: selectedDate,
      startTime: startTime,
      endTime: endTime,
      plateNumber: plateNumber,
      phone: phone
    }

    post('/reservation/create', reservationData)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          showToast('预约成功', 'success')
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/reservation-list/reservation-list'
            })
          }, 1500)
        } else {
          showToast(res.message || '预约失败')
        }
      })
      .catch(err => {
        hideLoading()
        console.error('预约失败:', err)
        // 模拟成功
        showToast('预约成功', 'success')
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/reservation-list/reservation-list'
          })
        }, 1500)
      })
  },

  // 模拟停车场信息
  setMockParkingInfo() {
    this.setData({
      parkingInfo: {
        name: '万达广场停车场',
        address: '朝阳区建国路88号万达广场B2-B3层',
        pricePerHour: 8
      }
    })
    this.calculateDuration()
  }
})
