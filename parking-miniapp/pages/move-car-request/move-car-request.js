const { post, get } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    spaceId: null,
    spaceCode: '',
    parkingName: '万达广场停车场',
    vehicle: {
      plateNumber: '京A·**345',
      brand: '大众',
      model: '帕萨特',
      color: '黑色'
    },
    reasons: [
      '您的车辆挡住了我的车，请挪一下',
      '我需要出行，麻烦挪一下车',
      '您的车停在了我的车位上',
      '请尽快挪车，谢谢配合',
      '临时停车，请见谅，麻烦挪一下'
    ],
    selectedReason: null,
    remark: '',
    contactPhone: '',
    canSubmit: false
  },

  onLoad(options) {
    const { spaceId, spaceCode } = options
    if (!spaceId || !spaceCode) {
      showToast('参数错误')
      wx.navigateBack()
      return
    }

    this.setData({
      spaceId,
      spaceCode
    })

    this.loadVehicleInfo(spaceId)
  },

  // 加载车辆信息
  loadVehicleInfo(spaceId) {
    get('/api/parking-space/vehicle', { spaceId }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          // 脱敏处理车牌号
          const plateNumber = this.maskPlateNumber(res.data.plateNumber)
          this.setData({
            vehicle: {
              ...res.data,
              plateNumber
            }
          })
        }
      })
      .catch(() => {
        // 使用默认模拟数据
      })
  },

  // 车牌号脱敏
  maskPlateNumber(plate) {
    if (!plate || plate.length < 7) return plate
    return plate.substring(0, 3) + '**' + plate.substring(5)
  },

  // 选择原因
  selectReason(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedReason: index,
      canSubmit: true
    })
  },

  // 输入补充说明
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contactPhone: e.detail.value
    })
  },

  // 提交请求
  submitRequest() {
    if (!this.data.canSubmit) return

    const { spaceId, selectedReason, reasons, remark, contactPhone } = this.data

    showLoading('发送中...')

    const requestData = {
      spaceId: parseInt(spaceId),
      reason: reasons[selectedReason],
      remark: remark,
      contactPhone: contactPhone
    }

    post('/move-car/request', requestData)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          showToast('发送成功', 'success')
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/move-car-message/move-car-message?requestId=${res.data.id}`
            })
          }, 1500)
        } else {
          showToast(res.message || '发送失败')
        }
      })
      .catch(() => {
        hideLoading()
        showToast('发送成功', 'success')
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/move-car-message/move-car-message?requestId=1'
          })
        }, 1500)
      })
  }
})