// components/TabBarPlayer/TabBarPlayer.js
  
// 获取全局App实例
const appInstance = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 歌曲名
    title: {
      type: String,
      value: "这是一首简单的小情歌"
    },
    // 歌手名
    singer: {
      type: String,
      value: "苏打绿"
    },
    // 专辑封面
    cover: {
      type: String,
      value: "/static/images/saber.jpg"
    },
    isMusicPlay: {
      type: Boolean,
      value: false
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转至音乐详情页
    toSongDetail(){
      // 更新全局播放状态，因为进入songDetail会判断是否是之前播放的歌曲且已经播放
      // appInstance.globalData.isMusicPlay = true
      let musicId = appInstance.globalData.musicId
      wx.navigateTo({
        url: '/songPackage/pages/songDetail/songDetail?musicId=' + musicId
      })
    },

    // 播放音乐
    handlerMusicPlay() {
      // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
      this.backgroundAudioManager = wx.getBackgroundAudioManager()
      this.backgroundAudioManager.play()
      appInstance.globalData.isMusicPlay = true
      this.setData({
        isMusicPlay: true
      })
    },

    // 暂停音乐
    handlerMusicPause() {
      // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
      this.backgroundAudioManager = wx.getBackgroundAudioManager()
      this.backgroundAudioManager.pause()
      appInstance.globalData.isMusicPlay = false
      this.setData({
        isMusicPlay: false
      })
    }
  }
})
