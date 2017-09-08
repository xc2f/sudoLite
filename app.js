//app.js
App({

  globalData: {
    deviceInfo: null,
  },

  onLaunch: function() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.deviceInfo = res
      },
    })
  }

})
