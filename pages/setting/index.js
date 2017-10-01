// pages/setting/index.js
// import { degree } from '../../utils/config.js'
import deepCopy from '../../utils/deepCopy.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setDegree: 30,
    degree: [],
    showTip1: false,
    showTip2: false,
    showTip3: false,
    optimizationChecked: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let shade = parseInt(app.globalData.shadeDegree * 100)
    this.setData({
      setDegree: shade,
      optimizationChecked: app.globalData.optimization
    })
    this.parseDegree(shade)
  },

  parseDegree(shade) {
    let degreeData = deepCopy(app.globalData.degree)
    degreeData.map(item => {
      if(shade >= item.range[0] && shade <= item.range[1]){
        item.selected = true
      } else {
        item.selected = false
      }
      item.range = (item.range[0] !== 0 ? (item.range[0] + '%') : 0) + ' ~ ' + item.range[1] + '%'
    })
    this.setData({
      degree: degreeData
    })
  },

  slider2change(e) {
    let value = e.detail.value
    this.parseDegree(value)
    let degree = parseFloat(value * .01)
    wx.setStorage({
      key: 'shadeDegree',
      data: degree,
    })
    app.globalData.shadeDegree = degree
  },

  showTip1: function () {
    this.setData({
      showTip1: true
    })
  },
  showTip2: function () {
    this.setData({
      showTip2: true
    })
  },
  showTip3: function(){
    this.setData({
      showTip3: true
    })
  },

  changeOptimization(e) {
    let result = e.detail.value
    app.globalData.optimization = result
    wx.setStorage({
      key: 'optimization',
      data: result,
    })
  },

  clearStorage(){
    wx.showModal({
      title: '警告',
      content: '将清除您本地所有成绩数据、设置记录。如未备份，将不可恢复，是否继续？',
      success: res => {
        if(res.confirm){
          wx.clearStorage()
        }
      }
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
  // onShareAppMessage: function () {

  // }
})