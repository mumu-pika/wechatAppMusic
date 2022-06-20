// pages/personal/personal.js
import request from '../../utils/request.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    startY: 0, //手指起始的坐标
    moveY: 0, //手指移动的坐标
    moveDistance: 0, //手指移动的距离
    coverTransform: 'translateY(0)',  // 控制位移方向, 这里设置向下位移
    coverTransition: '', //控制手指下拉回弹的动画效果

    userInfo: {}, //用户信息
    recentPlayList: [], //用户近期一周的播放记录

  },

  // 手指开始触摸的回调
  handleTouchStart(event) {
    // 获取手机的起始坐标
    this.data.startY = event.touches[0].clientY
    this.setData({
      coverTransition: ''
    })
  },
  // 手指触摸移动的回调
  handleTouchMove(event) {
    this.data.moveY = event.touches[0].clientY
    this.data.moveDistance = this.data.moveY - this.data.startY
    // 对moveDistance手指移动的距离进行距离上的限制
    if (this.data.moveDistance <= 0) return
    if (this.data.moveDistance >= 80) this.data.moveDistance = 80

    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${this.data.moveDistance}rpx)`
    })
  },
  // 手指抬起不触摸的回调
  handleTouchEnd() {
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coverTransition: 'transform 1s linear'
    })
  },

  // 跳转至登录Login页面的回调
  toLogin() {
    // 判断是否已经登录
    if (JSON.stringify(this.data.userInfo) !== "{}") wx.showToast({
      title: '已登录',
    })
    else {
      // 如果未登录
      wx.navigateTo({
        url: '/pages/login/login',
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 如果userInfo为true，说明用户已经登录了
      // 更新userInfo的状态值
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      // 获取用户近期播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },

  // 获取用户播放记录的回调
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record', { uid: userId, type: 1 })
    // 由于这里后台返回的歌单数据没有直接的唯一标识，这里将数据预加工添加一个唯一标识index
    let index = 0
    let recentPlayList = recentPlayListData.weekData.slice(0, 10).map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList
    })
  },

  // 用户注销登出
  toCheckout() {
    // 弹出提示框，用户需确认是否真的注销
    wx.showModal({
      content: '是否确认注销，重新登录？',
      success: (res) => {
        // 如果用户确认删除
        if (res.confirm) {
          this.setData({userInfo:{}})
          // 移除本地缓存
          wx.removeStorageSync('cookies')
          wx.removeStorageSync('userInfo')
          // wx.removeStorageSync('token')
          wx.showToast({
            title: '注销成功~',
          })

          // 跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})