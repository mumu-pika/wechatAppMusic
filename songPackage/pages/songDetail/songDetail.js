// pages/songDetail/songDetail.js
import request from '../../../utils/request'
// import PubSub from 'pubsub-js'
import moment from 'moment'
import debouce from '../../../utils/debouce'
// 获取全局App实例
const appInstance = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //标识当前音乐是否在播放  
    isRestart: false, //标识当前音乐是否需要重新开始播放（切换歌曲时候需要让歌曲重新播放，即磁盘重新开始旋转，而不是接着上一首歌转过的角度继续旋转）
    discAnimation: 'discAnimation', //动画的样式
    animationState: 'animation-play-state:paused', //控制动画播放的状态

    song: {}, //歌曲详情对象
    musicId: '', //歌曲id
    musicLink: '', //音乐链接
    currentTime: '00:00', //实时时间
    durationTime: '00:00', //总时长
    // currentWidth: 0, //实时进度条的宽度
    durationWidth: 0, // 进度条的总宽度
    index: 0, //标识点击音乐的下标，可用于切换音乐用
    timePoint: 0, //音乐进度条的时刻（拖动进度条或音乐播放会更新）
    sliderFlag: false, //标识是否操作了进度条
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 创建控制音乐播放的实例, 这里添加到this身上
    // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    // options用于接收路由跳转的query参数
    // 原生程序中路由传参，对参数长度有限制，如果参数过长，会自动截取掉
    let musicId = options.musicId
    this.setData({
      musicId
    })


    // 获取播放进度条总宽度
    // const query = wx.createSelectorQuery()
    // query.select('.barControl').boundingClientRect()
    // query.exec((res) => {
    //   this.setData({
    //     // 注意！！这里res[0].width获取的长度单位为px，需要转换为rpx
    //     durationWidth: res[0].width * 2
    //   })
    // })

    // 获取音乐详情
    // this.getMusicInfo(musicId)
    // 判断当前页面音乐是否已经在播放（对于用户切换页面重新返回当前音乐播放的页面的场景）
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      // 如果当前音乐已播放
      // 获取音乐详情
      this.getMusicInfo(musicId)
      // 修改当前页面音乐状态为true（注意！这个时候音乐在播放着，不用再设置播放）
      this.changePlayState(true)

    }
    else if (!appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      // 获取音乐详情
      this.getMusicInfoPaused(musicId)
      // 当前音乐为底部播放器切换过来，已经暂停音乐
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format("mm:ss")
      // 实时更新进度条
      // let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * this.data.durationWidth
      // this.setData({ currentWidth, currentTime })
      this.setData({ currentTime })

    }
    // 当前播放的音乐不是之前播放的音乐或者首次播放
    else {
      // 获取音乐详情
      this.getMusicInfo(musicId)
      // 由于不是上一首歌曲，所以需要先停止播放上一首
      this.backgroundAudioManager.stop()
      this.setData({
        currentTime: '00:00',
        timePoint: 0
      })
      this.musicControl(true, musicId)
    }
    /* 
      如果用户操作系统的控制音乐播放/暂停的按钮（模拟器下方），由于页面未做监听，导致页面显示是否播放的状态和真实的音乐播放状态不一致。可以通过控制音频的实例去监视音乐播放/暂停, 并在对应的监视函数里的回调中修改播放状态，以达到同步一致。
      由于这里我需要音乐在切换到下一首时候自动播放，如果在监视函数的回调中修改播放状态，因为异步，处理的时间间隔无法确定，可能会导致play被paused或者stop所打断，导致无法正常切换，故我将修改播放状态的方法同步写在音乐实例状态改变之后。
    */

    // 监视音乐播放/暂停
    this.backgroundAudioManager.onPlay(() => {
      // 修改音乐状态, 音乐播放
      // this.changePlayState(true)
      // 修改全局音乐播放的状态
      // appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      // 修改音乐状态, 音乐暂停
      // this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      // 修改音乐状态, 音乐停止
      // this.changePlayState(false)
      // appInstance.globalData.musicId = ''
    })

    // 监听音乐自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 将实时进度条的长度还原为0
      this.setData({
        currentTime: '00:00',
        timePoint: 0
      })
      // 单曲循环（这里设置默认为单曲循环）
      let { isPlay, musicId } = this.data
      this.musicControl(isPlay, musicId)
    })

    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format("mm:ss")

      // let percent = Math.floor(this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 100)
      let percent = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 100

      // 实时更新进度条
      // let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * this.data.durationWidth
      // 由于背景音乐停止以后，仍然会执行一次OnTimeUpdate(),所以我们需要将currentWidth设置归0,避免因值为NaN, 而在页面渲染出整条进度条，故这里特意设置一下长度为0    
      // if (this.backgroundAudioManager.duration == 0) currentWidth = 0
      // this.setData({ currentWidth, currentTime })

      if (this.data.sliderFlag) this.setData({ currentTime })
      else {
        this.setData({
          currentTime,
          timePoint: percent
        })
      }
    })

    // 监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
    // this.backgroundAudioManager.onWaiting(() => {
    //   wx.showToast({
    //     title: '加载中...',
    //     icon: 'loading',
    //     duration: 1500 //提示的延迟时间
    //   })
    // })

    // // 订阅来自TarBarPlayer页面发布的music播放或暂停消息
    // PubSub.subscribe('playMusic', (msg, type) => {
    //   if (type) {
    //     // 需要音乐继续播放
    //     this.backgroundAudioManager.play()
    //     // 修改音乐状态, 音乐播放
    //     this.changePlayState(true)
    //   }
    //   else {
    //     // 需要音乐暂停
    //     console.log("音乐停止啦")
    //     this.backgroundAudioManager.pause()
    //     this.changePlayState(false)
    //   }
    //   // //再次设置true是为了动画重新开始
    //   // this.setData({ isRestart: false })
    //   // // 切换好音乐之后，自动播放, 这里不传musicLink，会进行第一次请求数据
    //   // this.musicControl(true, musicId)
    //   // this.setData({ musicId })
    //   // // 根据消息传来的musicId来请求获取音乐详情信息
    //   // this.getMusicInfo(musicId)
    //   // // 取消订阅，避免产生多个订阅消息回调
    //   // PubSub.unsubscribe('musicId')
    // })

  },

  // ********************上面是onload********************************
  // 修改播放状态
  changePlayState(isPlay) {
    // 修改全局变量的状态
    appInstance.globalData.isMusicPlay = isPlay
    this.setData({
      isPlay: isPlay,
      animationState: isPlay ? 'animation-play-state:running' : 'animation-play-state:paused'
    })
  },

  // 获取音乐详情的方法
  async getMusicInfo(musicId) {
    // ids参数为必选参数，需要传递音乐对应的id值
    let songData = await request('/song/detail', { ids: musicId })
    // songData.songs[0].dt的单位是毫秒。需要转化，用到的是momentjs这个js日期处理类库
    let durationTime = moment(songData.songs[0].dt).format("mm:ss")

    // 获取歌曲信息并赋予给全局背景音乐实例
    this.backgroundAudioManager.title = songData.songs[0].name //歌曲名
    this.backgroundAudioManager.singer = songData.songs[0].ar[0].name //演唱者
    // this.backgroundAudioManager.epname = songData.songs[0].al.name //专辑名
    this.backgroundAudioManager.coverImgUrl = songData.songs[0].al.picUrl //专辑封面

    // 修改全局音乐播放的状态
    appInstance.globalData.musicName = songData.songs[0].name
    appInstance.globalData.singerName = songData.songs[0].ar[0].name
    appInstance.globalData.coverImg = songData.songs[0].al.picUrl

    this.setData({
      song: songData.songs[0],
      durationTime
    })

    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })

  },

  // 获取音乐详情的方法(针对于暂停的方法，特殊处理)
  async getMusicInfoPaused(musicId) {
    // ids参数为必选参数，需要传递音乐对应的id值
    let songData = await request('/song/detail', { ids: musicId })
    // songData.songs[0].dt的单位是毫秒。需要转化，用到的是momentjs这个js日期处理类库
    let durationTime = moment(songData.songs[0].dt).format("mm:ss")

    // 不获取歌曲信息并赋予给全局背景音乐实例（为了让暂停的音乐不产生新的播放,补鞥和获取）

    // 修改全局音乐播放的状态
    appInstance.globalData.musicName = songData.songs[0].name
    appInstance.globalData.singerName = songData.songs[0].ar[0].name
    appInstance.globalData.coverImg = songData.songs[0].al.picUrl

    this.setData({
      song: songData.songs[0],
      durationTime
    })

    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })

  },

  // 界面按钮控制点击播放/暂停
  handleMusicPlay: debouce(function () {
    // 播放和暂停状态转换
    let isPlay = !this.data.isPlay
    // 更新音乐播放状态
    this.setData({
      isPlay
    })
    // 控制音乐是否播放
    let { musicId, musicLink } = this.data
    this.musicControl(isPlay, musicId, musicLink)
  }, 500, true),


  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    // 如果需要播放音乐
    if (isPlay) {
      // 第一次获取音乐链接（即第一次请求）
      if (!musicLink) {
        // 获取音乐资源链接
        let musicLinkData = await request('/song/url', { id: musicId })
        musicLink = musicLinkData.data[0].url
        // 设置新的src, 会自动播放
        this.backgroundAudioManager.src = musicLink
        // 注意！！这里title是必填项，用于原生音频播放器音频标题（必填)
        this.backgroundAudioManager.title = appInstance.globalData.musicName //歌曲名
        this.backgroundAudioManager.singer = appInstance.globalData.musicName //演唱者
        this.backgroundAudioManager.coverImgUrl = appInstance.globalData.coverImg //专辑封面

        // 更新音乐链接状态
        this.setData({
          musicLink
        })
        // 修改音乐状态, 音乐播放
        this.changePlayState(true)
        // 修改全局音乐播放的状态
        appInstance.globalData.musicId = musicId
        // appInstance.globalData.musicName = this.data.song.name
        // appInstance.globalData.singerName = this.data.song.ar[0].name
        // appInstance.globalData.coverImg = this.data.song.al.picUrl
        appInstance.globalData.isMusicStop = false
      }
      else {
        // 不是首次播放，继续播放这首音乐
        this.backgroundAudioManager.play()
        // 修改音乐状态, 音乐播放
        this.changePlayState(true)
        // 修改全局音乐播放的状态
        appInstance.globalData.musicId = musicId
        // appInstance.globalData.isMusicStop = false
      }
    }
    // 暂停播放音乐
    else {
      // 暂停音乐
      this.backgroundAudioManager.pause()
      this.changePlayState(false)
    }
  },

  // 点击切换音乐的回调
  handleSwitch: debouce(function (event) {
    // 更新musicId状态并设置isRestart为true,需要重新开始,从而达到改变磁盘动画样式
    this.changePlayState(false)
    this.setData({ isRestart: true })
    // 获取切换歌曲的类型
    let type = event.currentTarget.id
    // 在切歌之前停止当前播放的音乐
    this.backgroundAudioManager.stop()
    appInstance.globalData.musicId = ''
    this.setData({
      currentTime: '00:00',
      timePoint: 0
    })

    // 由于使用了全局数据，暂未使用订阅消息，留下注释
    // 订阅来自recommendation页面发布的musicId消息
    // PubSub.subscribe('musicId', (msg, musicId) => {
    //   //再次设置true是为了动画重新开始
    //   this.setData({ isRestart: false })
    //   // 切换好音乐之后，自动播放, 这里不传musicLink，会进行第一次请求数据
    //   this.musicControl(true, musicId)
    //   this.setData({ musicId })
    //   // 根据消息传来的musicId来请求获取音乐详情信息
    //   this.getMusicInfo(musicId)
    //   // 切换好音乐之后，自动播放, 这里不传musicLink，会进行第一次请求数据
    //   // this.musicControl(true, musicId)
    //   // 取消订阅，避免产生多个订阅消息回调
    //   PubSub.unsubscribe('musicId')
    // })
    // // 发布消息数据给recomendation页面
    // PubSub.publish('switchType', type)

    // 这里将播放列表放在app.js中作为全局数据共享，因此无需再用订阅发布消息
    let { index } = this.data
    let songList = appInstance.globalData.songList
    let currentMusicIndex = songList.findIndex(item => {
      return item.id == this.data.musicId
    })

    // 判断切换音乐的类型
    if (type === 'prev') {
      // 切换为上一首
      index = (currentMusicIndex % songList.length - 1) < 0 ? (songList.length - 1) : (currentMusicIndex % songList.length - 1)
    } else {
      // 切换为下一首
      index = (currentMusicIndex + 1) % songList.length
    }

    // 更新index状态
    this.setData({ index })
    // 获取下一首歌的musicID
    let musicId = songList[index].id
    //再次设置true是为了动画重新开始
    this.setData({ isRestart: false })
    // 切换好音乐之后，自动播放, 这里不传musicLink，会进行第一次请求数据
    this.musicControl(true, musicId)
    this.setData({ musicId })
    // 根据消息传来的musicId来请求获取音乐详情信息
    this.getMusicInfo(musicId)

  }, 500, true),

  // 进度条拖动完毕功能函数
  sliderChange: debouce(function (event) {
    // 完成一次拖动后触发的事件，event.detail = {value}
    // wx.getBackgroundAudioManager()获取全局唯一的背景音频管理器
    this.backgroundAudioManager = wx.getBackgroundAudioManager()

    // 需要跳转的位置，单位/s
    let seekTime = this.backgroundAudioManager.duration * event.detail.value / 100
    // 音乐跳转至指定的位置，注意，seek之后，music不会自动播放
    this.backgroundAudioManager.seek(seekTime)
    this.backgroundAudioManager.play()
    this.changePlayState(true)

    this.setData({
      timePoint: event.detail.value,
    })
  }, 500, true),

  // 进度条拖动过程功能函数
  sliderChanging(event) {
    this.setData({
      sliderFlag: true
    })
    // 在拖动进度条过程中暂停音乐
    this.backgroundAudioManager.pause()
    // 需要跳转的位置，单位/s
    let seekTime = this.backgroundAudioManager.duration * event.detail.value / 100
    let currentTime = moment(seekTime * 1000).format("mm:ss")
    this.setData({ currentTime })
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
    // 取消订阅，避免产生多个订阅消息回调
    // PubSub.unsubscribe('musicId')
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