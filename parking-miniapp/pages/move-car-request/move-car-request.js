const { post, get } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')
const { SUBSCRIBE_TEMPLATES } = require('../../utils/constants')

// 获取当前用户ID（匿名用户使用 0）
function getRequesterId() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.id) ? userInfo.id : 0
}

Page({
  data: {
    spaceId: null,
    spaceCode: '',
    parkingName: '',
    vehicle: null,
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
            },
            parkingName: res.data.parkingName || ''
          })
        } else {
          showToast(res.message || '该车位当前无车辆停放')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
      .catch(() => {
        showToast('加载车辆信息失败')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
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

    // 请求订阅消息授权，以便车主收到通知
    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATES.MOVE_CAR],
      success: (res) => {
        console.log('订阅消息授权结果:', res)
      },
      fail: (err) => {
        console.warn('订阅消息授权失败:', err)
      },
      complete: () => {
        this.doSubmitRequest()
      }
    })
  },

  // 实际提交请求
  doSubmitRequest() {
    const { spaceId, selectedReason, reasons, remark, contactPhone, spaceCode, parkingName } = this.data

    showLoading('发送中...')

    const requestData = {
      targetSpaceId: parseInt(spaceId),
      reason: reasons[selectedReason],
      requesterId: getRequesterId()
    }

    post('/api/move-car/request', requestData)
      .then(res => {
        hideLoading()
        if (res.code === 200) {
          // 保存记录到本地（按用户隔离）
          const userInfo = wx.getStorageSync('userInfo')
          const userId = userInfo ? userInfo.id : '0'
          const localKey = 'moveCarHistory_' + userId
          const history = wx.getStorageSync(localKey) || []
          // 去重：如果已有相同 requestId 的记录则替换
          const existingIdx = history.findIndex(item => item.id === res.data.id)
          const record = {
            id: res.data.id,
            spaceCode: spaceCode,
            parkingName: parkingName || '未知停车场',
            createTime: new Date().toISOString(),
            status: 0,
            statusText: '待处理'
          }
          if (existingIdx >= 0) {
            history[existingIdx] = record
          } else {
            history.unshift(record)
          }
          wx.setStorageSync(localKey, history.slice(0, 50))

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
        showToast('发送失败，请重试')
      })
  }
})