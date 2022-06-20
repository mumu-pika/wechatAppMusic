// pages/search/search.js
import request from '../../utils/request'
import throttle from '../../utils/throttle'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder的默认内容
    trendingList: [], //热搜榜数据
    searchContent: '', //用户输入进搜索框里的表单项数据
    searchList: [], //关键字模糊匹配的地址
    historyList: [], //搜索历史记录列表
    isSearched: false, //判断是否搜索到数据，如果搜索到的数据是undefined，则为false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取初始化数据
    this.getInitData()

    // 获取历史记录
    this.getSearchHistory()

  },


  // 获取热搜榜等初始化数据
  async getInitData() {
    let placeholderData = await request('/search/default')
    let trendingListData = await request('/search/hot/detail')
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      trendingList: trendingListData.data
    })
  },

  // 获取本地历史记录的功能函数
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory')
    if (historyList) this.setData({ historyList })
  },

  // 清空搜索框中搜索内容
  clearSearchInput() {
    this.setData({
      searchContent: '',
      searchList: [],
      isSearched: false
    })
  },

  // 表单项内容发生改变的时候
  handleInputChange: throttle(async function (event) {
    // 获取输入的所要搜索的内容，并更新状态
    this.setData({
      searchContent: event.detail.value.trim(),
      // isSearched: false
    })
    let { searchContent, historyList } = this.data
    // 当输入框数据不为空
    if (searchContent) {
      // 发请求获取关键字模糊匹配数据， 接口地址 : /search 或者 /cloudsearch(更全)。limit为设定所要获取的数量 
      let searchListData = await request('/search', {
        keywords: searchContent,
        limit: 10
      })
      // 将搜索到的歌曲更新到data中
      try {
        // 如果搜索到了数据
        if (searchListData.result.songs) {
          this.setData({
            searchList: searchListData.result.songs,
            isSearched: true
          })
        }
        else {
          this.setData({
            searchList: ["记录空空如也~~"],
            isSearched: false
          })
        }
      } catch (error) {
        console.log("搜索返回的数据出错啦~ :", error)
      }
      // 将搜索的关键字添加进搜索历史记录中.(需要判断并去重)
      let index = historyList.findIndex(item => item == searchContent)
      if (index !== -1) {
        // 此时搜索记录已经有当前搜索的关键字，也就是重复了
        historyList.splice(index, 1) //先删除原先在搜索历史记录中的这个关键字
      }
      historyList.unshift(searchContent)
      this.setData({ historyList })
      // 做本地存储，避免下次登录数据丢失
      wx.setStorageSync('searchHistory', historyList)
    }
    // 如果搜索框里的数据为空
    else {
      this.setData({
        searchList: [], //置空
      })
    }
  }, 200, 2000),


  // 清除历史记录
  deleteSearchHistory() {
    // 弹出提示框，用户需确认是否真的删除搜索历史记录
    wx.showModal({
      content: '是否确认删除搜索历史？',
      success: (res) => {
        // 如果用户确认删除
        if (res.confirm) {
          // 清空data中的historyList
          this.setData({ historyList: [] })
          // 移除本地历史记录缓存
          wx.removeStorageSync('searchHistory')
          wx.showToast({
            title: '搜索历史已清空~',
          })
        }
      }
    })



  },



  // 发请求获取关键字模糊匹配数据， 接口地址 : /search 或者 /cloudsearch(更全) 
  // async getSearchListData(event) {
  //   let searchListData = await request('/search', {
  //     keywords: this.data.searchContent,
  //     limit: 10
  //   })
  //   this.setData({
  //     searchList: searchListData.result.songs
  //   })
  // },

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