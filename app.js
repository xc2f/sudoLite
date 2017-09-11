//app.js
App({

  globalData: {
    deviceInfo: null,
    shadeDegree: .3
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
  }

})
