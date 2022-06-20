import request from '../../utils/request.js'

// 获取全局App实例
const appInstance = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    msg: '欢迎来到皮卡的音乐花园~',
    bannerList: [], //轮播图数据  
    recommendList: [], //推荐歌单
    topList: [], //排行榜数据

    // 底部播放栏
    musicName: '', // 当前正在播放的音乐的名称
    singerName: '', // 当前正在播放的音乐的歌手名
    coverImg:'/static/images/saber.jpg', //当前正在播放的音乐的专辑封面(这里默认给一张静态图片)
    isMusicPlay: false, //当前音乐是否在播放
    isMusicStop: true, //当前音乐是否播放完毕
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 从本地存储获取用户信息
    let userInfo = wx.getStorageSync('userInfo')
    // 如果用户没有登录
    if (!userInfo && !appInstance.globalData.isVisitor) {
      // 弹窗提示
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      })
    }


    // 获取导航区域数据
    let bannerListData = await request("/banner", {
      type: 2
    })
    // 获取推荐歌单
    let recommendListData = await request('/personalized', {
      limit: 10
    })
    this.setData({
      bannerList: bannerListData.banners,
      recommendList: recommendListData.result
    })


    // let topListData = await request('/top/list', {
    //   idx: 1
    // })
    // this.setData({
    //   topList: topListData.playlist.tracks.slice(0, 3)
    // })


    // 获取排行榜数据
    /* 
    需求分析
      1、需要根据idx的值获取对应数据
      2、idx的取值范围：0-4
      3、需要发送5次请求
      
   */
    // 旧接口，现在使用歌单详情接口,传入排行榜 id 获取排行榜详情数据(排行榜也是歌单的一种)
    // let index = 0;
    // let resultArr = [];
    // while (index < 5) {
    //   let topListData = await request('/top/list', {
    //     idx: index++
    //   })
    //   // splice(会修改原数组，可以对指定的数组进行增删改查)
    //   let topListItem = { name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0, 3) }
    //   resultArr.push(topListItem)
    //   // 不需要等待五次请求全部结束才更新,用户体验好点,但是渲染次数多一些
    //   this.setData({
    //     topList: resultArr
    //   })
    // }
    // 更新topList状态值, 放在此处更新会导致发送请求的过程页面长时间白屏，用户体验差
    // this.setData({
    //   topList: resultArr
    // })


    // 获取排行榜数据(新)
    // 由于排行榜数据过多，这里我们取前3个榜单
    this.getTopListData(3)
  },

  // 根据榜单的id去请求接口获取榜单的信息
  async getTopListData(count) {
    let index = 0 //榜单摘要的索引，分别对应每一个榜单，而不是对应单个榜单中的每一个歌曲
    let topListDetail = await request('/toplist/detail') //调用此接口,可获取所有榜单内容摘要
    let resultArr = [] //最终获取到的榜单数据, 该数组中的每一个元素都是一个榜单详情
    // 根据榜单摘要topListDetail获得的榜单id来循环发请求，获取榜单信息
    // while循环中的count为传入的参数，意义为需要获取的榜单个数
    while (index < count) {
      let topListData = await request('/playlist/detail', {
        id: topListDetail.list[index].id
      })
      // splice(会修改原数组，可以对指定的数组进行增删改查)
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      }
      // 将获取到的歌单信息依次添加到数组末尾
      resultArr.push(topListItem)
      this.setData({
        topList: resultArr
      })
      index++
    }
  },



  // 跳转至recommendation页面
  toRecommendation(event) {
    wx.navigateTo({
      url: '/songPackage/pages/recommendation/recommendation'
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 骨架屏加载完毕，准备页面的加载
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取当前播放的歌曲信息
    // 更新播放栏的状态
    this.setData({
      musicName: appInstance.globalData.musicName,
      singerName: appInstance.globalData.singerName,
      coverImg: appInstance.globalData.coverImg,
      isMusicPlay: appInstance.globalData.isMusicPlay,
      isMusicStop: appInstance.globalData.isMusicStop
    })
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