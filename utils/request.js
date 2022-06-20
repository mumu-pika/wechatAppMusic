// 发送ajax请求

import config from './config.js'

/* 封装功能函数
  1、功能点明确
  2、函数内部应该保留固定代码（静态的）
  3、将动态的数据抽取成形参，由使用者根据自身的情况动态的传入实参
  4、一个良好的功能函数应该设置形参的默认值（ES6的形参默认值）

  封装功能组件
  1、功能点明确
  2、组件内部保留静态的代码
  3、将动态的数据抽取成props参数，由使用者根据自身情况以标签属性的形式传入props数据
  4、一个良好的功能组件应该设置组件的必要性及数据类型
  props:{
    msg:{
      required: true;
      default: 默认值，
      type: String
    }
  }
 */


export default (url, data = {}, method = 'GET') => {
  return new Promise((resolve, reject) => {
    // 显示 loading 提示框
    // wx.showLoading({
    //   title: '加载中...',
    // })
    // 1、new Promise 初始化promise实例的状态为pending
    wx.request({
      url: config.mobileHost + url,
      data,
      method,
      header: {
        // 注意！！这里第一次用户登录，本地没有cookie，所以需要加判断，不然会报错
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') != -1) : ''
      },
      success: (res) => {
        // resolve修改promise的状态为成功状态resolved
        // 判断是否为登录，如果为登录需要将cookie放入请求头中
        if (data.isLogin) {
          // 将用户的cookie存入本地storage
          wx.setStorage({
            key: 'cookies',
            data: res.cookies,
          })
        }
        resolve(res.data)
      },
      fail: (err) => {
        // reject修改promise的状态为失败状态
        reject(err)
        //网络请求超时（可能是服务器未开或域名ip有误）
        // 提示用户重新尝试登录
          wx.showModal({
            title: '提示',
            content: '网络请求失败，请重试',
            showCancel: false, //不显示'取消'按钮
            comfirmText: '确定',
            success(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            }
          })
      },
      // complete: () => {
      //   // 隐藏 loading 提示框, 在获取到请求的数据之后
      //   // wx.hideLoading()
      // }
    })
  })

}