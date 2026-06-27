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
    get(`/api/move-car/request/${requestId}`, {}, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const data = res.data
          this.setData({
            requestInfo: {
              ...data,
              requesterId: data.requesterId,
              targetUserId: data.targetUserId,
              createTime: formatDate(data.createTime, 'MM-DD HH:mm'),
              statusText: data.status === 0 ? '进行中' : '已结束'
            }
          })
        }
      })
      .catch(() => {
        showToast('加载请求信息失败')
      })
  },

  // 加载消息列表
  loadMessageList(requestId) {
    get(`/api/move-car-msg/list/request/${requestId}`, { pageNum: 1, pageSize: 50 }, { hideLoading: true })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.records || [])
          const currentUserId = this.getCurrentUserId()
          const processedList = list.map(item => ({
            ...item,
            time: formatDate(item.createTime, 'HH:mm'),
            isSelf: item.senderId === currentUserId
          }))

          this.setData({
            messageList: processedList,
            lastMessageId: processedList.length > 0 ? `msg-${processedList[processedList.length - 1].id}` : ''
          })
        }
      })
      .catch(() => {
        this.setData({ messageList: [], lastMessageId: '' })
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
    const currentUserId = this.getCurrentUserId()
    const newMessage = {
      ...message,
      time: formatDate(message.createTime, 'HH:mm'),
      isSelf: message.senderId === currentUserId
    }

    const messageList = [...this.data.messageList, newMessage]
    this.setData({
      messageList,
      lastMessageId: `msg-${newMessage.id}`
    })
  },

  // 获取当前用户ID（匿名用户使用 0，与 move-car-request 保持一致）
  getCurrentUserId() {
    const userInfo = wx.getStorageSync('userInfo')
    return (userInfo && userInfo.id) ? userInfo.id : 0
  },

  // 输入消息
  onInputMessage(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const { requestId, inputMessage, requestInfo } = this.data
    if (!inputMessage.trim()) return

    const senderId = this.getCurrentUserId()
    // receiverId：当前用户是请求方则发给车主，是车主则发给请求方
    const receiverId = senderId === requestInfo.requesterId
      ? requestInfo.targetUserId
      : requestInfo.requesterId
    if (receiverId === undefined || receiverId === null) {
      showToast('无法获取对方信息')
      return
    }

    const messageData = {
      requestId: parseInt(requestId),
      senderId: senderId,
      receiverId: receiverId,
      content: inputMessage.trim()
    }

    post('/api/move-car-msg/send', messageData)
      .then(res => {
        if (res.code === 200) {
          this.setData({ inputMessage: '' })
          this.loadMessageList(requestId)
        } else {
          showToast(res.message || '发送失败')
        }
      })
      .catch(() => {
        showToast('发送失败，请重试')
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