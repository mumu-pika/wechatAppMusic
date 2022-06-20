import request from '../../../utils/request'
import localData from "../../../test/data"
// import PubSub from 'pubsub-js'
// 获取全局App实例
const appInstance = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    month: '', //月
    day: '', //天
    recommendList: [], //推荐列表 
    index: 0, //标识点击音乐的下标，可用于切换音乐用

    // 底部播放栏
    musicName: '', // 当前正在播放的音乐的名称
    singerName: '', // 当前正在播放的音乐的歌手名
    coverImg: '/static/images/saber.jpg', //当前正在播放的音乐的专辑封面(这里默认给一张静态图片)
    isMusicPlay: false, //当前音乐是否在播放
    isMusicStop: true, //当前音乐是否播放完毕
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果用户非游客登录
    if(!appInstance.globalData.isVisitor){
      // 判断用户是否登录
      let userInfo = wx.getStorageSync('userInfo')
      if (!userInfo && !appInstance.globalData.isVisitor) {
        // 如果用户没有登录
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          success: () => {
            // 跳转至登录界面
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }
        })
      }
      // 获取每日推荐的歌曲数据
      this.getRecommendList()
    }
    // 如果为游客登录
    else{
      let recommendListData = localData.recommendListData
      let newArrayList = recommendListData.data.dailySongs.map(item => {
        let songItem = {}
        songItem.id = item.id //musicId
        songItem.musicName = item.name //歌曲名
        songItem.singer = item.ar[0].name //歌手
        return songItem
      })
      // 更新全局播放列表数据
      appInstance.globalData.songList = newArrayList
  
      this.setData({
        recommendList: recommendListData.data.dailySongs,
        // 已获取完毕数据，去骨架屏
        loading: false
      })

    }
    // 根据当前的实时日期更新状态中的日期数据
    this.setData({
      // 注意。月份需要加1 
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    })



    // // 订阅来自songDetail页面发布的消息
    // // 注意Pubsub.subscribe()里的回调里的msg为事件的绑定名，也就是消息名
    // PubSub.subscribe('switchType', (msg, type) => {
    //   let { recommendList, index } = this.data
    //   if (type === 'prev') {
    //     // 切换为上一首
    //     index = (index % recommendList.length - 1) < 0 ? (recommendList.length - 1) : (index % recommendList.length - 1)
    //   } else {
    //     // 切换为下一首
    //     index = index % recommendList.length + 1
    //   }
    //   // 更新index状态
    //   this.setData({ index })

    //   let musicId = recommendList[index].id
    //   // 发布切换后的歌曲数据给songDetail页面
    //   PubSub.publish('musicId', musicId)
    // })

  },

  // 获取用户的每日推荐的歌曲数据 (旧接口)
  // async getRecommendList() {
  //   let recommendListData = await request('/recommend/songs')
  //   this.setData({
  //     recommendList: recommendListData.recommend,
  //     // 已获取完毕数据，去骨架屏
  //     loading: false
  //   })
  // },
  async getRecommendList() {
    let recommendListData = await request('/recommend/songs')
    // appInstance.globalData.songList = [...recommendListData.data.dailySongs]
    let newArrayList = recommendListData.data.dailySongs.map(item => {
      let songItem = {}
      songItem.id = item.id //musicId
      songItem.musicName = item.name //歌曲名
      songItem.singer = item.ar[0].name //歌手
      return songItem
    })
    // 更新全局播放列表数据
    appInstance.globalData.songList = newArrayList

    this.setData({
      recommendList: recommendListData.data.dailySongs,
      // 已获取完毕数据，去骨架屏
      loading: false
    })
  },


  // 跳转至songDetail页面
  toSongDetail(event) {
    // 获取遍历的每日推荐歌曲数据
    let { song, index } = event.currentTarget.dataset
    // 更新状态index
    this.setData({ index })
    wx.navigateTo({
      // 路由query传参，如果不对song数据处理，数据会被默认Object.toString处理，会变为{song:"[Object，Object]"}
      // 这里使用JSON.stringify()对数据预处理，转为sting字符串
      // url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song)
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id

    })
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
    // 骨架屏加载完毕，准备页面的加载
    // setTimeout(() => {
    //   this.setData({
    //     loading: false
    //   })
    // }, 500)

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
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 取消订阅，避免产生多个订阅消息回调
    // PubSub.unsubscribe('switchType')
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