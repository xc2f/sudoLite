// pages/about/index.js

let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 355 - 20,
    currentYear: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: (app.globalData.deviceInfo.windowWidth - 20) * .7
    })
    let currentYear = new Date().getFullYear()
    if (currentYear !== 2017) {
      this.setData({
        currentYear: '-' + new Date().getFullYear()
      })
    }
  },

  copy(e) {
    let type = e.currentTarget.dataset.type
    let data
    if (type === 'email') {
      data = 'sudo@Lite.Fun'
    } else if (type === 'github') {
      data = 'https://github.com/Pysics/sudoLite'
    } else {
      data = 'https://lite.fun'
    }
    wx.setClipboardData({
      data: data,
      success: function (res) {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  prevImg() {
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
  // onShareAppMessage: function () {

  // }
})