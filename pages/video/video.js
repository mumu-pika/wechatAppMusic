// pages/video/video.js
import request from "../../utils/request.js"
import localData from "../../test/data"
// 获取全局App实例
const appInstance = getApp()


Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //导航标签数组
    navId: '', //导航的标识
    videoList: [], //视频列表数据
    videoId: '', //视频id标识
    videoUpdateTime: [], //记录video播放时长
    isTriggered: false, //标识下拉刷新是否被触发

    // 底部播放栏(音乐状态)
    musicName: '', // 当前正在播放的音乐的名称
    singerName: '', // 当前正在播放的音乐的歌手名
    coverImg: '/static/images/saber.jpg', //当前正在播放的音乐的专辑封面(这里默认给一张静态图片)
    isMusicPlay: false, //当前音乐是否在播放
    isMusicStop: true, //当前音乐是否播放完毕

    // 游客登录测试用
    localData: '', //本地的模拟数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 如果已登录
    if (!appInstance.globalData.isVisitor) {
      // 获取导航数据
      this.getVideoGroupListData()
    }
    else {
      // 获取游客登录数据
      // 获取导航数据(游客模式)
      let videoGroupListData = localData.videoGroupListData
      this.setData({
        videoGroupList: videoGroupListData.data.slice(0, 10),
        navId: videoGroupListData.data[0].id
      })
      this.getVideoList_visitor()
    }
  },

  // *********************上面是onload*****************************
  // 获取视频标签下对应的视频数据 不发请求，调用本地的预先的数据
  async getVideoList_visitor() {
    // 显示 loading 提示框
    wx.showLoading({
      title: '加载中...',
    })
    let videoListData = localData.videoListData
    // 隐藏 loading 提示框, 在获取到请求的数据之后
    wx.hideLoading()
    let videoList = await this.videoListMutation(videoListData)
    this.setData({
      videoList,
      isTriggered: false  //关闭下拉刷新
    })
  },




  // 获取导航数据(登录模式)
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(11, 20),
      navId: videoGroupListData.data[11].id
    })
    // 获取视频列表数据
    this.getVideoList(this.data.navId)
  },

  // 获取视频标签下对应的视频数据
  async getVideoList(navId) {
    if (!navId) {
      return;
    }
    // 显示 loading 提示框
    wx.showLoading({
      title: '加载中...',
    })
    // 注意！！这里新的接口下，视频的url需要调用另一个接口获取，这里获取的videoListData.datas[].data.urlInfo为null
    let videoListData = await request('/video/group', {
      id: navId,
      // 注意需要给时间戳timestamp
      // 在URL中加时间戳就会保证每一次发起的请求都是一个不同于之前的请求,这样就能避免浏览器对URL的缓存
      timestamp: Date.parse(new Date())
    })
    // 隐藏 loading 提示框, 在获取到请求的数据之后
    wx.hideLoading()
    let videoList = await this.videoListMutation(videoListData)
    this.setData({
      videoList,
      isTriggered: false  //关闭下拉刷新
    })
  },

  // 在getVideoList获取到视频列表后处理videoList
  // 在映射过程中，将获取到的视频地址赋予给videoList为其属性
  async videoListMutation(videoListData) {
    // 新接口自动会赋予id, 从id = 0开始, 这里不用再手动赋予了
    // let index = 0
    let videoList = await Promise.all(videoListData.datas.map(async item => {
      // item.id = index++
      let urlData = await request('/video/url', {
        id: item.data.vid
      })
      item.data.urlInfo = urlData.urls[0].url
      return item
    }))
    return videoList
  },


  // 上拉触底获取视频数据
  async getToLowerVideoList(navId) {
    if (!navId) {
      return;
    }
    // 显示 loading 提示框
    // wx.showLoading({
    //   title: '加载中...',
    // })
    let videoListData = await request('/video/group', {
      id: navId,
      timestamp: Date.parse(new Date())
    })
    // 隐藏 loading 提示框, 在获取到请求的数据之后
    // wx.hideLoading()
    let { videoList } = this.data
    let index = videoList.length

    // 将获取到的视频最新的数据追加更新到原有视频列表数据中
    let newVideoListData = [...videoList]
    let addVideoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    }) //新追加的部分
    newVideoListData.push(...addVideoList)  //将追加数组添加到原视频列表的后面
    // 直到上面部分，视频信息除了urlInf为null,其他必要信息都获取并放到newVideoListData里了

    let newVideoList = await Promise.all(newVideoListData.map(async item => {
      let urlData = await request('/video/url', {
        id: item.data.vid
      })
      item.data.urlInfo = urlData.urls[0].url
      return item
    }))
    this.setData({
      videoList: newVideoList
    })
  },

  // 点击切换导航的回调
  changeNav(event) {
    // 通过id向event传参的时候如果传的是number会自动转换为string
    // let navId = event.currentTarget.id
    let navId = event.currentTarget.dataset.id
    this.setData({
      // 位移运算符 右移零位会将非number数据强制转换为number
      navId: navId >>> 0,
      videoList: [], //切换导航加载时，界面渲染空
    })
    // 显示 loading 提示框
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true
    // })

    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)
    // wx.hideLoading()
  },

  // 点击播放/继续播放的回调
  /* 
    需求：
      1、点击播放的事件中需要找到上一个播放的视频
      2、在播放新的视频之前需要关闭上一个正在播放的视频

    单例模式：
    1、需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
    2、节省内存空间
   */
  handlerPlay(event) {
    // 获取当前视频的id
    let vid = event.currentTarget.id
    // 更新data中的videoId的状态数据
    this.setData({
      videoId: vid
    })
    // 2、关闭上一个播放的视频 
    // 这里用到了短路与的运算。从左到右遇到false便返回 this.vid是判断当前页面实例this身上有没有vid
    // this.videoContext = wx.createVideoContext(videoId)
    // this.vid !== vid && this.videoContext && this.videoContext.stop() 
    // this.vid = vid
    // if (videoId != vid) {
    //   this.videoContext && this.videoContext.stop()
    //   let videoContextPrev = wx.createVideoContext(videoId)
    //   videoContextPrev.stop()
    // }
    // 创建控制video标签的实例对象
    this.videoContextPrev = wx.createVideoContext(vid)
    // 关闭当前播放的视频
    this.videoContextPrev.stop()
    // 判断当前视屏是否有播放记录，如果有，跳转至指定播放位置
    let { videoUpdateTime } = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    // 情况一：如果有播放记录，从记录处继续播放
    if (videoItem) {
      // 获取播放的时间点，单位/s
      let timepoint = videoItem.currentTime
      this.timer1 = setTimeout(() => {
        let videoContext1 = wx.createVideoContext(vid)
        // 跳转到指定的时间位置
        videoContext1.seek(timepoint)
        videoContext1.play()
        // 如果此时音乐在播放，暂停音乐
        // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
        this.backgroundAudioManager.pause()
        appInstance.globalData.isMusicPlay = false
        this.setData({ isMusicPlay: false })


      }, 200)
    }
    // 情况二：如果没有播放记录，开始新的播放
    else {
      this.timer2 = setTimeout(() => {
        let videoContext2 = wx.createVideoContext(vid)
        videoContext2.play()
        // 如果此时音乐在播放，暂停音乐
        // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
        this.backgroundAudioManager.pause()
        appInstance.globalData.isMusicPlay = false
        this.setData({ isMusicPlay: false })
      }, 200)
    }
  },

  // 监听视频播放进度的回调
  handleTimeUpdate(event) {
    let { videoUpdateTime } = this.data
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    /* 
      判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
      如果有修改原有播放记录，如果没有需要在数组中添加当前视频的播放记录
    */
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if (videoItem) { // 之前有播放记录
      videoItem.currentTime = videoTimeObj.currentTime;
    } else { // 之前没有播放记录
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  // 视频播放结束调用的回调
  handleEnded(event) {
    // 移除播放记录时长数组中当前视频的对象
    let { videoUpdateTime } = this.data
    let index = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
    // splice(index,howmany) ——> 删除从index位置开始的数，howmany为删除的个数
    // 若 howmany 小于等于 0，则不删除
    videoUpdateTime.splice(index, 1)
    this.setData({
      videoUpdateTime: videoUpdateTime,
      // 这里将videoId重置，使页面渲染的视频均为image封面图覆盖
      videoId: ''
    })
  },


  // 自定义下拉刷新的回调 scroll-view
  handleRefresherPulling() {
    if(!appInstance.globalData.isVisitor){
      this.getVideoList(this.data.navId)
    }
  },

  // 自定义上拉触底的回调, 滚动到底部/右边时触发
  handleScrollToLower() {
    // 数据分页：1、后端分页 2、前端分页
    if(!appInstance.globalData.isVisitor){
      this.getToLowerVideoList(this.data.navId)
    }
  },


  // 跳转至微信的搜索界面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
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
    // 关闭这两个在视频播放handler回调中创建的定时器
    clearTimeout(this.timer1)
    clearTimeout(this.timer2)
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
  onShareAppMessage: function ({ from }) {
    // from 转发事件来源(有2种：1、button 页面内转发按钮 2、menu：右上角转发菜单)
    if (from === 'button') {
      return {
        title: '快乐转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/saber.jpg'
      }
    }
    else {
      return {
        title: '开心转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/archer.jpg'
      }
    }
  },




})