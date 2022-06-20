// test/test.js
import request from '../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  // 获取用户唯一标识openId
  getOpenId() {
    // 1、获取登录验证
    wx.login({
      success: async (res) => {
        let code = res.code
        // 2、将登录凭证发送给服务器
        let token = await request('/getOpenId', {code})
        // 这里返回的result是加密的token
        console.log("测试成功", token)
        // 将token持久化存储到本地
        this.updateTokenStorage(token)
      }
    })
  },
  // 本地存储token
  updateTokenStorage(token){
    if(token){
      wx.setStorageSync('token', token)
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})