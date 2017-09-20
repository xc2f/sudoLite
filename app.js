//app.js
App({

  globalData: {
    deviceInfo: null,
    // 遮挡率
    shadeDegree: .3,
    // 性能优化
    optimization: false
  },

  onLaunch: function () {
    wx.getSystemInfo({
      success: res => {
        this.globalData.deviceInfo = res
      },
    })
    this.globalData.shadeDegree = wx.getStorageSync('shadeDegree') || .3
    // wx.getStorage({
    //   key: 'shadeDegree',
    //   success: res => {
    //     this.globalData.shadeDegree = res.data
    //   },
    // })
    this.globalData.optimization = wx.getStorageSync('optimization') || false
    // wx.getStorage({
    //   key: 'optimization',
    //   success: res => {
    //     this.globalData.optimization = res.data
    //   },
    // })
  }

})
