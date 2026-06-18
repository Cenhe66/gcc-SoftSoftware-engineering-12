const { get, post } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    vehicles: [],
    selectedVehicle: null,
    canCheck: false
  },

  onLoad() {
    this.loadVehicles()
  },

  onShow() {
    this.loadVehicles()
  },

  // 加载车辆列表
  loadVehicles() {
    get('/api/user/vehicles', {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            vehicles: res.data,
            selectedVehicle: res.data.length > 0 ? 0 : null,
            canCheck: res.data.length > 0
          })
        } else {
          this.setMockVehicles()
        }
      })
      .catch(() => {
        this.setMockVehicles()
      })
  },

  // 模拟车辆数据
  setMockVehicles() {
    const mockVehicles = [
      {
        id: 1,
        plateNumber: '京A12345',
        brand: '大众',
        model: '帕萨特'
      },
      {
        id: 2,
        plateNumber: '京B67890',
        brand: '丰田',
        model: '凯美瑞'
      }
    ]
    this.setData({
      vehicles: mockVehicles,
      selectedVehicle: 0,
      canCheck: true
    })
  },

  // 选择车辆
  selectVehicle(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedVehicle: index,
      canCheck: true
    })
  },

  // 添加车辆
  addVehicle() {
    showToast('添加车辆功能开发中')
  },

  // 开始检测
  startCheck() {
    if (!this.data.canCheck) return

    const vehicle = this.data.vehicles[this.data.selectedVehicle]
    if (!vehicle) {
      showToast('请先选择车辆')
      return
    }

    showLoading('检测中...')

    // 模拟检测过程
    setTimeout(() => {
      post('/api/health-check/detect', { vehicleId: vehicle.id })
        .then(res => {
          hideLoading()
          if (res.code === 200 && res.data) {
            wx.navigateTo({
              url: `/pages/health-check-result/health-check-result?result=${encodeURIComponent(JSON.stringify(res.data))}`
            })
          } else {
            this.goToMockResult(vehicle)
          }
        })
        .catch(() => {
          hideLoading()
          this.goToMockResult(vehicle)
        })
    }, 2000)
  },

  // 跳转到模拟结果
  goToMockResult(vehicle) {
    const mockResult = {
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      checkTime: new Date().toISOString(),
      overallStatus: Math.random() > 0.3 ? 0 : 1, // 0-正常, 1-异常
      items: [
        {
          name: '车窗状态',
          status: Math.random() > 0.2 ? 0 : 1,
          value: Math.random() > 0.2 ? '已关闭' : '未关闭',
          suggestion: Math.random() > 0.2 ? '' : '请检查车窗是否完全关闭'
        },
        {
          name: '车灯状态',
          status: Math.random() > 0.3 ? 0 : 1,
          value: Math.random() > 0.3 ? '已关闭' : '未关闭',
          suggestion: Math.random() > 0.3 ? '' : '请检查车灯是否关闭，避免电瓶亏电'
        },
        {
          name: '胎压监测',
          status: Math.random() > 0.4 ? 0 : 1,
          value: Math.random() > 0.4 ? '2.5 bar' : '2.0 bar（偏低）',
          suggestion: Math.random() > 0.4 ? '' : '建议及时补充胎压至2.5bar'
        },
        {
          name: '电瓶状态',
          status: Math.random() > 0.5 ? 0 : 1,
          value: Math.random() > 0.5 ? '12.6V（正常）' : '11.8V（偏低）',
          suggestion: Math.random() > 0.5 ? '' : '电瓶电量偏低，建议检查或更换'
        }
      ]
    }

    wx.navigateTo({
      url: `/pages/health-check-result/health-check-result?result=${encodeURIComponent(JSON.stringify(mockResult))}`
    })
  }
})