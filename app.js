//app.js
App({

  globalData: {
    deviceInfo: null,
    // 遮挡率
    shadeDegree: .3,
    // 性能优化
    optimization: false
  },

  onLaunch: function() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.deviceInfo = res
      },
    })
    wx.getStorage({
      key: 'shadeDegree',
      success: res => {
        this.globalData.shadeDegree = res.data
      },
    })
    wx.getStorage({
      key: 'optimization',
      success: res  => {
        this.globalData.optimization = res.data
      },
    })
  }

})
