// pages/login/login.js
import request from '../../utils/request.js'

// 获取全局App实例
const appInstance = getApp()

/* 
  登录流程：
  1、收集表单数据
  2、前端验证
    1）验证用户信息(账号，密码)是否合法
    2）前端验证不通过就提示用户，不需要发请求给后端
    3）前端验证通过了，发请求，携带用户账号密码给后端服务器端
  3、后端验证
    1）验证用户是否存在
    2）用户不存在直接返回，告诉前端用户不存在
    3）用户存在需要验证密码是否正确
    4）密码不正确返回前端提示密码不正确
    5）密码正确返回前端数据（用户的个人一些属性和信息），提示用户登录成功
 */

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', //手机号
    password:'', //用户密码

  },

  //表单项内容发生改变的回调
  handleInput(event){
    // let type = event.currentTarget.id //id传值（单值传值用id传值方便） 取值：phone || password
    let type = event.currentTarget.dataset.type //data-key=value 更多适用于多值传值
    this.setData({
      // 动态设置类型并保存状态值
      [type]: event.detail.value
    })
  },

  //登录的回调
  async login(){
    // 1、收集表单项数据
    let{phone, password} = this.data
    // 2、前端验证
    /* 
      手机号验证：
      1、内容空
      2、内容格式不正确
      3、内容格式正确，验证通过
     */
    if(!phone){
      // 提示用户手机号不应该为空
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    if(!password){
      // 提示用户面密码不应该为空
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return
    }
    // 定义判断手机号格式的正则表达式
    let phoneReg = /^(\+?0?86\-?)?1[3-9]\d{9}$/
    if(!phoneReg.test(phone)){
      // 提示用户手机号格式有误
      wx.showToast({
        title: '手机号格式有误',
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: '登录中...',
      icon: 'loading'
    })

    // 3、后端验证
    let result = await request('/login/cellphone', {phone, password, isLogin:true})
    if(result.code === 200){
      // 请求的状态码200, 请求成功
      // 将用户的信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile)) 
      // 跳转页面至个人中心。注意！！navigateTo和redircetTo是不能跳转至tabbar页面的。
      // reLanch 关闭所有页面，打开到应用内的某个页面
      appInstance.globalData.isVisitor = false //标识当前已登录，非游客模式
      wx.reLaunch({
        url: '/pages/index/index',
      })
      // 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
      // wx.navigateBack({
      //   delta: 1
      // })
      wx.showToast({
        title: '登录成功',
      })
    }else if(result.code === 400){
      wx.showToast({
        title: '手机号有误',
        icon:'none'
      })
    }else if (result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon:'none'
      })
    }else{
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }


  },


  // 游客登录
  visitorLogin(){
    // 更新状态为游客登录模式
    appInstance.globalData.isVisitor = true;
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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