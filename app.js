//app.js
import { degree } from './utils/config.js'

App({

  globalData: {
    deviceInfo: null,
    // 遮挡率
    shadeDegree: .3,
    // 性能优化
    optimization: false,

    requestHost: 'https://www.easy-mock.com/mock/59d100919cabc90bb5e5743c/sudoLite',
    share: null,
    degree: degree,
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

    wx.request({
      url: this.globalData.requestHost + '/degree',
      method: 'GET',
      success: res => {
        if (res.data.code === 201) {
          this.globalData.degree = res.data.result
        }
      }
    })
  },
  onShow: function () {
    wx.request({
      url: this.globalData.requestHost + '/notice',
      method: 'GET',
      success: res => {
        if (res.data.code === 201) {
          if (res.data.result.showOnce) {
            let hasShow = wx.getStorageSync('noticeShowOnce')
            if (hasShow === '' || res.data.result.id !== hasShow) {
              wx.showModal({
                title: res.data.result.title,
                content: res.data.result.content,
                showCancel: false,
                success: e => {
                  if (e.confirm) {
                    wx.setStorage({
                      key: 'noticeShowOnce',
                      data: res.data.result.id,
                    })
                  }
                }
              })
            }
          } else {
            wx.showModal({
              title: res.data.result.title,
              content: res.data.result.content,
              showCancel: false,
            })
          }
        }
      },
    })

    wx.request({
      url: this.globalData.requestHost + '/share',
      method: 'GET',
      success: res => {
        if (res.data.code === 201) {
          this.globalData.share = res.data.result
        }
      }
    })
  },

  adapterDegree(shadeDegree, returnType = 'title') {
    let setDegree = parseInt(shadeDegree * 100)
    let title, range
    this.globalData.degree.map(item => {
      if (setDegree >= item.range[0] && setDegree <= item.range[1]) {
        title = item.title
        range = item.range
        // 好像并不会跳过剩余的循环
        return
      }
    })
    if (returnType === 'range') {
      return range
    }
    return title
  }

})
