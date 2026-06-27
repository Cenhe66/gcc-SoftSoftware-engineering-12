const { get } = require('../../utils/request')
const { showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    parkingId: null,
    parkingInfo: {},
    floors: [],
    currentFloor: 0,
    currentSpaces: []
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      showToast('参数错误')
      wx.navigateBack()
      return
    }
    
    this.setData({ parkingId: id })
    this.loadParkingDetail(id)
  },

  // 加载停车场详情
  loadParkingDetail(id) {
    showLoading('加载中...')

    get(`/api/parking-lot/detail/${id}`)
      .then(res => {
        hideLoading()
        if (res.code === 200 && res.data) {
          const data = res.data
          // 字段映射：后端字段 -> 前端字段
          this.setData({
            parkingInfo: {
              name: data.name,
              address: data.address,
              freeSpace: data.availableSpaces,
              totalSpace: data.totalSpaces,
              pricePerHour: data.hourlyRate,
              dailyCap: data.dailyCap,
              freeMinutes: data.freeMinutes,
              firstHourPrice: data.hourlyRate,
              isOpen24h: true
            }
          })
          this.loadParkingSpaces(id)
        } else {
          hideLoading()
          showToast('加载失败')
          wx.navigateBack()
        }
      })
      .catch(err => {
        hideLoading()
        console.error('加载失败:', err)
        showToast('加载失败')
        wx.navigateBack()
      })
  },

  // 加载车位列表
  loadParkingSpaces(lotId) {
    get('/api/parking-space/list', { lotId })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.processSpaces(res.data)
        } else {
          this.setData({
            floors: [],
            currentSpaces: []
          })
        }
      })
      .catch(err => {
        console.error('加载车位失败:', err)
        this.setData({
          floors: [],
          currentSpaces: []
        })
      })
  },

  // 处理车位数据
  processSpaces(spaces) {
    // 按楼层分组，同时映射字段名
    const floorMap = {}
    spaces.forEach(space => {
      const floor = space.floor || 'B1'
      if (!floorMap[floor]) {
        floorMap[floor] = []
      }
      // 映射字段名：后端 spaceNo -> 前端 spaceCode
      floorMap[floor].push({
        ...space,
        spaceCode: space.spaceNo || space.spaceCode
      })
    })

    const floors = Object.keys(floorMap).map(name => ({
      name,
      spaces: floorMap[name]
    }))

    this.setData({
      floors,
      currentSpaces: floors[0]?.spaces || []
    })
  },

  // 切换楼层
  switchFloor(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentFloor: index,
      currentSpaces: this.data.floors[index].spaces
    })
  },

  // 点击车位
  onSpaceClick(e) {
    const space = e.currentTarget.dataset.space
    if (space.isShared === 1) {
      const price = space.shareHourlyPrice || '未知'
      wx.showModal({
        title: '共享车位',
        content: `车位 ${space.spaceCode} 为业主共享车位，单价 ¥${price}/小时，是否预约？`,
        success: (res) => {
          if (res.confirm) {
            this.goToReservation(space.id)
          }
        }
      })
    } else if (space.status === 0) {
      // 空闲车位，可以预约
      wx.showModal({
        title: '预约车位',
        content: `是否预约车位 ${space.spaceCode}？`,
        success: (res) => {
          if (res.confirm) {
            this.goToReservation(space.id)
          }
        }
      })
    } else if (space.status === 1) {
      showToast('该车位已被占用')
    } else if (space.status === 2) {
      showToast('该车位已被预约')
    }
  },

  // 导航到停车场
  navigateToParking() {
    const { parkingInfo } = this.data
    if (!parkingInfo.latitude || !parkingInfo.longitude) {
      showToast('暂无位置信息')
      return
    }

    wx.openLocation({
      latitude: parseFloat(parkingInfo.latitude),
      longitude: parseFloat(parkingInfo.longitude),
      name: parkingInfo.name,
      address: parkingInfo.address
    })
  },

  // 跳转到预约页面
  goToReservation(spaceId) {
    const url = spaceId 
      ? `/pages/reservation/reservation?parkingId=${this.data.parkingId}&spaceId=${spaceId}`
      : `/pages/reservation/reservation?parkingId=${this.data.parkingId}`
    
    wx.navigateTo({ url })
  },

  // 模拟数据
  setMockData() {
    this.setData({
      parkingInfo: {
        id: this.data.parkingId,
        name: '万达广场停车场',
        address: '朝阳区建国路88号万达广场B2-B3层',
        totalSpace: 500,
        freeSpace: 128,
        pricePerHour: 8,
        firstHourPrice: 8,
        dailyCap: 60,
        freeMinutes: 15,
        isOpen24h: true,
        hasCharging: true,
        isIndoor: true,
        hasElevator: true,
        latitude: 39.9042,
        longitude: 116.4074
      }
    })
    this.setMockSpaces()
  },

  // 模拟车位数据
  setMockSpaces() {
    const floors = [
      { name: 'B1', spaces: this.generateMockSpaces('B1', 20) },
      { name: 'B2', spaces: this.generateMockSpaces('B2', 25) },
      { name: 'B3', spaces: this.generateMockSpaces('B3', 15) }
    ]

    this.setData({
      floors,
      currentSpaces: floors[0].spaces
    })
  },

  // 生成模拟车位
  generateMockSpaces(floor, count) {
    const spaces = []
    for (let i = 1; i <= count; i++) {
      spaces.push({
        id: `${floor}-${i}`,
        spaceCode: `${floor}-${String(i).padStart(3, '0')}`,
        status: Math.floor(Math.random() * 3), // 0-空闲, 1-占用, 2-预约
        spaceType: Math.random() > 0.8 ? 1 : 0 // 0-普通, 1-充电
      })
    }
    return spaces
  }
})
