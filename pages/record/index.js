// pages/record/index.js
import fromNow from '../../utils/moment.js'
import { degree } from '../../utils/config.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'records',
      success: res => {
        let list = []
        res.data.map(item => {
          console.log((item.recordTime - item.startTime))
          list.push({
            recordTime: fromNow(item.recordTime),
            showTime: item.showTime,
            shadeDegree: parseInt(item.shadeDegree * 100) + '%',
            degree: this.Adapter(item.shadeDegree)
          })
        })
        this.setData({
          records: list
        })
      },
    })
  },

  Adapter(shadeDegree){
    let setDegree = parseInt(shadeDegree * 100)
    let degreeTitle
    degree.map(item => {
      if(setDegree >= item.range[0] && setDegree <= item.range[1]){
        degreeTitle =  item.title
        // 好像并不会跳过剩余的循环
        return
      }
    })
    return degreeTitle
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
  onShareAppMessage: function () {

  }
})