const { get } = require('../../utils/request')
const { showToast } = require('../../utils/util')

Page({
  data: {
    parkingId: null,
    spaceId: null,
    spaceCode: 'B2-015',
    parkingName: '万达广场停车场',
    floors: ['B3', 'B2', 'B1'],
    currentFloor: 1,
    direction: 0,
    distance: 25,
    markerLeft: 50,
    markerTop: 40,
    hasCameraAuth: true
  },

  onLoad(options) {
    // 检查相机权限
    this.checkCameraAuth()

    // 获取参数
    const { parkingId, spaceId, spaceCode } = options
    if (spaceCode) {
      this.setData({ spaceCode })
    }

    // 开始监听陀螺仪
    this.startGyroscope()

    // 开始定位更新
    this.startLocationUpdate()
  },

  onUnload() {
    this.stopGyroscope()
    this.stopLocationUpdate()
  },

  // 检查相机权限
  checkCameraAuth() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === false) {
          this.setData({ hasCameraAuth: false })
        }
      }
    })
  },

  // 请求相机权限
  requestCameraAuth() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ hasCameraAuth: true })
      },
      fail: () => {
        wx.openSetting()
      }
    })
  },

  // 相机错误
  onCameraError() {
    showToast('相机启动失败')
    this.setData({ hasCameraAuth: false })
  },

  // 开始监听陀螺仪
  startGyroscope() {
    wx.startGyroscope({
      interval: 'normal',
      success: () => {
        wx.onGyroscopeChange((res) => {
          // 根据陀螺仪数据计算方向
          const newDirection = this.calculateDirection(res)
          this.setData({ direction: newDirection })
        })
      }
    })
  },

  // 停止监听陀螺仪
  stopGyroscope() {
    wx.stopGyroscope()
    wx.offGyroscopeChange()
  },

  // 计算方向
  calculateDirection(gyroData) {
    // 简化的方向计算，实际应用需要更复杂的算法
    const { z } = gyroData
    let direction = this.data.direction + z * 10
    if (direction > 180) direction -= 360
    if (direction < -180) direction += 360
    return direction
  },

  // 开始定位更新
  startLocationUpdate() {
    // 模拟距离变化
    this.locationTimer = setInterval(() => {
      const distance = Math.max(0, this.data.distance - Math.random() * 2)
      this.setData({ 
        distance: Math.round(distance),
        markerLeft: 40 + Math.random() * 20,
        markerTop: 30 + Math.random() * 20
      })

      if (distance <= 5) {
        showToast('已到达车位附近', 'success')
      }
    }, 2000)
  },

  // 停止定位更新
  stopLocationUpdate() {
    if (this.locationTimer) {
      clearInterval(this.locationTimer)
    }
  },

  // 切换楼层
  switchFloor(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentFloor: index })
    showToast(`已切换到${this.data.floors[index]}`)
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})