// pages/record/index.js
import fromNow, { computeTime } from '../../utils/moment.js'
import { degree } from '../../utils/config.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: [],
    canvasSize: 355
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      canvasSize: app.globalData.deviceInfo.screenWidth - 20
    })
    this.getData(res => {
      res.map(item => {
        item.shadeDegree = parseInt(item.shadeDegree * 100)
        item.useTime = item.recordTime - item.startTime
      })

      this.drawCanvas(res, [0, 10])
    })

  },

  drawCanvas(data, range) {
    const ctx = wx.createCanvasContext('myCanvas')

    let axisXData = range
    let cw = this.data.canvasSize
    let ch = this.data.canvasSize * .7
    // 刻度大小
    let tickSize = 3
    let devideY = 7
    let padding = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 50,
    }
    // 坐标原点
    let origin = {
      x: padding.left,
      y: ch - padding.bottom
    }
    let bottomRight = {
      x: cw - padding.right,
      y: ch - padding.bottom
    }
    let topLeft = {
      x: padding.left,
      y: padding.top
    }

    //绘制X轴
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    //绘制X轴箭头
    ctx.lineTo(bottomRight.x - 7, bottomRight.y - 3);
    ctx.moveTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomRight.x - 7, bottomRight.y + 3);
    //绘制Y轴
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    //绘制Y轴箭头
    ctx.lineTo(topLeft.x - 3, topLeft.y + 7);
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topLeft.x + 3, topLeft.y + 7);

    //绘制X方向刻度
    let axisX = []
    for (let i = axisXData[0]; i <= axisXData[1]; i++) {
      axisX.push(i)
    }
    //计算刻度可使用的总宽度， 20为最右侧箭头内部遗留的距离
    let avgWidth = (cw - padding.left - padding.right - 20) / (axisX[0] !== 0 ? axisX.length : (axisX.length - 1));
    // 非0的刻度在原点右边一段距离处刻画
    axisX[0] !== 0 ? (origin.x += avgWidth) : ''
    axisX.map((item, idx) => {
      //移动刻度起点
      ctx.moveTo(origin.x + idx * avgWidth, origin.y);
      //绘制到刻度终点
      ctx.lineTo(origin.x + idx * avgWidth, origin.y - (item !== 0 ? tickSize : 0));
      //X轴刻度
      ctx.setTextAlign('center')
      ctx.fillText(
        item,
        // item < 10 ? (origin.x + idx * avgWidth - 3) : (origin.x + idx * avgWidth - 5),
        origin.x + idx * avgWidth,
        origin.y + 12);
    })

    console.log(data)
    let axisYData = []
    data.map(item => {
      axisYData.push(item.useTime)
    })
    //绘制Y方向刻度
    // let axisYMax = axisYData.reduce((p, n) => (p >= n ? p : n))
    // let axisYMin = axisYData.reduce((p, n) => (p <= n ? p : n))

    // sort不传参排序无效？
    axisYData.sort((a, b) => (a - b))
    let min = axisYData[0]
    let max = axisYData[axisYData.length - 1]

    // 30为y轴起始坐标预留距离， 底部10，顶部20
    var avgValue = Math.round((max - min) / devideY)
    var avgHeight = (ch - padding.top - padding.bottom - 30) / devideY;

    for (let i = 0; i < (devideY + 1); i++) {
      ctx.setTextAlign('right')
      ctx.setTextBaseline('middle')
      if (i === 0) {
        ctx.moveTo(origin.x, origin.y - 10);
        ctx.lineTo(origin.x + tickSize, origin.y - 10);
        ctx.fillText(computeTime(min),
          origin.x - 5,
          origin.y - 10)
      } else {
        //绘制Y轴刻度
        ctx.moveTo(origin.x, origin.y - 10 - i * avgHeight);
        ctx.lineTo(origin.x + tickSize, origin.y - 10 - i * avgHeight);
        //绘制Y轴文字
        ctx.fillText(computeTime((avgValue * i) + min),
          origin.x - 5,
          origin.y - 10 - i * avgHeight);
      }
    }
    ctx.stroke()
    ctx.closePath()

    data.map((item, idx) => {
      ctx.beginPath()
      // 在一个avgWidth左右范围内随机x坐标
      // 是否除以2控制图的分散，除数越大越紧密
      let randomNegative = Math.random() < .5 ? -1 : 1
      let randomX = Math.random() * avgWidth / 2 * randomNegative

      // (item.useTime - min) / avgValue * avgHeight)
      // [2, 100] 分7份每份14，取30的位置 (30 - 2) / 14 * 每份的高度
      ctx.arc(origin.x + item.shadeDegree * avgWidth + (item.shadeDegree >= 1 ? randomX : 0), origin.y - 10 - ((item.useTime - min) / avgValue * avgHeight), 1, 0, 2 * Math.PI)
      ctx.setFillStyle('red')
      ctx.fill()
      ctx.closePath()

      // ctx.moveTo(origin.x + item.shadeDegree * avgWidth, origin.y - 10);
      // ctx.lineTo(origin.x + item.shadeDegree * avgWidth, origin.y - 50);

    })


    //绘制折线
    // for (var i = 0; i < arr.length; i++) {
    //   var posY = origin.y - Math.floor(arr[i].value / max * (ch - 2 * padding - 50));
    //   if (i == 0) {
    //     ctx.moveTo(origin.x + i * avgWidth, posY);
    //   } else {
    //     ctx.lineTo(origin.x + i * avgWidth, posY);
    //   }
    //   //具体金额文字
    //   ctx.fillText(arr[i].value,
    //     origin.x + i * avgWidth,
    //     posY
    //   )
    // }

    ctx.draw()
  },

  getData(callback) {
    wx.getStorage({
      key: 'records',
      success: res => {
        let list = []
        res.data.map(item => {
          list.unshift({
            recordTime: fromNow(item.recordTime),
            showTime: item.showTime,
            shadeDegree: parseInt(item.shadeDegree * 100) + '%',
            degree: this.Adapter(item.shadeDegree)
          })
        })
        callback(res.data)
        this.setData({
          records: list
        })
      },
    })
  },

  Adapter(shadeDegree) {
    let setDegree = parseInt(shadeDegree * 100)
    let degreeTitle
    degree.map(item => {
      if (setDegree >= item.range[0] && setDegree <= item.range[1]) {
        degreeTitle = item.title
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