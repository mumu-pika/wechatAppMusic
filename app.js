App({
  // 全局数据，注意！！app实例在切换页面不会被销毁，除非用户退出小程序
  globalData: {
    // 音乐相关
    isMusicPlay: false, // 标识后台音乐是否播放
    isMusicStop: true, //标识后台音乐是否播放完毕
    songList:[], //当前的播放列表
    musicId: '', // 当前正在播放的音乐的唯一标识id
    musicName: '', // 当前正在播放的音乐的名称
    singerName: '', // 当前正在播放的音乐的歌手名
    coverImg:'',  // 当前正在播放的音乐的专辑封面

    //游客登录标识
    isVisitor: false, //标识是否当前为游客登录模式
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {

  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {

  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {

  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {

  }
})
