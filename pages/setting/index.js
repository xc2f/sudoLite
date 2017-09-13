// pages/setting/index.js
import { degree } from '../../utils/config.js'
import deepCopy from '../../utils/deepCopy.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setDegree: 30,
    degree: [],
    showTip: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      setDegree: parseInt(app.globalData.shadeDegree * 100)
    })
    this.parseDegree()
  },

  slider2change(e) {
    let degree = parseFloat(e.detail.value * .01)
    wx.setStorage({
      key: 'shadeDegree',
      data: degree,
    })
    app.globalData.shadeDegree = degree
  },

  parseDegree() {
    let degreeData = deepCopy(degree)
    degreeData.map(item => {
      item.range = (item.range[0] !== 0 ? (item.range[0] + '%') : 0) + ' ~ ' + item.range[1] + '%'
    })
    this.setData({
      degree: degreeData
    })

  },

  showTip: function(){
    this.setData({
      showTip: true
    })
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