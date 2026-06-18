const { get, post } = require('../../utils/request')
const { showToast, formatDate } = require('../../utils/util')

Page({
  data: {
    requestId: null,
    requestInfo: {
      id: null,
      spaceCode: '',
      createTime: '',
      status: 0,
      statusText: '进行中'
    },
    messageList: [],
    inputMessage: '',
    lastMessageId: '',
    quickReplies: [
      '马上来挪车',
      '请稍等5分钟',
      '不好意思，马上到',
      '已经挪好了',
      '感谢理解'
    ],
    socketOpen: false
  },

  onLoad(options) {
    const { requestId } = options
    if (!requestId) {
      showToast('参数错误')
      wx.navigateBack()
      return
    }

    this.setData({ requestId })
    this.loadRequestInfo(requestId)
    this.loadMessageList(requestId)
    this.connectWebSocket()
  },

  onUnload() {
    this.closeWebSocket()
  },

  // 加载请求信息
  loadRequestInfo(requestId) {
    get(`/move-car/request/${requestId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            requestInfo: {
              ...res.data,
              createTime: formatDate(res.data.createTime, 'MM-DD HH:mm'),
              statusText: res.data.status === 0 ? '进行中' : '已结束'
            }
          })
        }
      })
      .catch(() => {
        this.setData({
          requestInfo: {
            id: requestId,
            spaceCode: 'B2-015',
            createTime: '05-27 14:30',
            status: 0,
            statusText: '进行中'
          }
        })
      })
  },

  // 加载消息列表
  loadMessageList(requestId) {
    get(`/move-car-msg/list/request/${requestId}`, { pageNum: 1, pageSize: 50 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.records || []
          const processedList = list.map(item => ({
            ...item,
            time: formatDate(item.createTime, 'HH:mm'),
            isSelf: item.senderId === this.getCurrentUserId()
          }))

          this.setData({
            messageList: processedList,
            lastMessageId: processedList.length > 0 ? `msg-${processedList[processedList.length - 1].id}` : ''
          })
        }
      })
      .catch(() => {
        this.setData({
          messageList: [
            {
              id: 1,
              content: '您的车辆挡住了我的车，请挪一下',
              time: '14:30',
              isSelf: false
            },
            {
              id: 2,
              content: '马上来挪车',
              time: '14:32',
              isSelf: true
            }
          ],
          lastMessageId: 'msg-2'
        })
      })
  },

  // 连接WebSocket
  connectWebSocket() {
    const app = getApp()
    const wsUrl = app.globalData.wsUrl

    wx.connectSocket({
      url: wsUrl
    })

    wx.onSocketOpen(() => {
      console.log('WebSocket连接已打开')
      this.setData({ socketOpen: true })
      
      // 发送订阅消息
      const subscribeMsg = {
        type: 'SUBSCRIBE',
        topic: `move_car_${this.data.requestId}`
      }
      wx.sendSocketMessage({
        data: JSON.stringify(subscribeMsg)
      })
    })

    wx.onSocketMessage((res) => {
      const data = JSON.parse(res.data)
      if (data.type === 'MOVE_CAR_MESSAGE') {
        this.handleNewMessage(data.message)
      }
    })

    wx.onSocketClose(() => {
      console.log('WebSocket连接已关闭')
      this.setData({ socketOpen: false })
    })
  },

  // 关闭WebSocket
  closeWebSocket() {
    if (this.data.socketOpen) {
      wx.closeSocket()
    }
  },

  // 处理新消息
  handleNewMessage(message) {
    const newMessage = {
      ...message,
      time: formatDate(message.createTime, 'HH:mm'),
      isSelf: message.senderId === this.getCurrentUserId()
    }

    const messageList = [...this.data.messageList, newMessage]
    this.setData({
      messageList,
      lastMessageId: `msg-${newMessage.id}`
    })
  },

  // 获取当前用户ID
  getCurrentUserId() {
    const userInfo = wx.getStorageSync('userInfo')
    return userInfo ? userInfo.id : 0
  },

  // 输入消息
  onInputMessage(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const { requestId, inputMessage } = this.data
    if (!inputMessage.trim()) return

    const messageData = {
      requestId: parseInt(requestId),
      content: inputMessage.trim()
    }

    post('/move-car-msg/send', messageData)
      .then(res => {
        if (res.code === 200) {
          this.setData({ inputMessage: '' })
          this.loadMessageList(requestId)
        } else {
          showToast(res.message || '发送失败')
        }
      })
      .catch(() => {
        // 模拟发送成功
        const newMessage = {
          id: Date.now(),
          content: inputMessage.trim(),
          time: formatDate(new Date(), 'HH:mm'),
          isSelf: true
        }
        const messageList = [...this.data.messageList, newMessage]
        this.setData({
          messageList,
          inputMessage: '',
          lastMessageId: `msg-${newMessage.id}`
        })
      })
  },

  // 发送快捷回复
  sendQuickReply(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputMessage: text }, () => {
      this.sendMessage()
    })
  }
})