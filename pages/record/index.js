// pages/record/index.js
import fromNow, { computeTime } from '../../utils/moment.js'
// import { degree } from '../../utils/config.js'
import { adapterDegree } from '../../utils/config.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: [],
    countsAll: 0,
    recordLatest: [],
    canvasSize: 355,
    showTip1: false,
    showTip2: false,
    loadingTip: '数据读取中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      canvasSize: app.globalData.deviceInfo.screenWidth - 20,
    })

    // 显示当前设定等级的canvas
    let currentDegree = app.globalData.shadeDegree
    this.renderRecords(currentDegree)
    this.renderLastRecords()

    // draw canvas
    this.drawCanvas(currentDegree)

  },

  drawCanvas(degree) {
    let range = adapterDegree(degree, 'range')
    let title = adapterDegree(degree)
    let storagePrimaryKey = range[1] / 10 - 1
    wx.getStorage({
      key: 'record' + storagePrimaryKey,
      success: res => {
        let list = []
        res.data.map(item => {
          list.push({
            shadeDegree: parseInt(item.shadeDegree * 100),
            useTime: item.timeUse
          })
        })
        this.draw(list, range, title)
      },
      fail: err => {
        // 如果当前设置还未有记录，取完成数最多的一局显示
        wx.getStorage({
          key: 'records',
          success: res => {
            let result = res.data
            let maxIdx = 0
            result.map((item, idx) => {
              if (item.counts && item.counts > 0) {
                maxIdx = item.counts > result[maxIdx].counts ? idx : maxIdx
              }
            })
            let target = result[maxIdx]
            range = adapterDegree(target.shadeDegree, 'range')
            title = adapterDegree(target.shadeDegree)
            storagePrimaryKey = range[1] / 10 - 1
            wx.getStorage({
              key: 'record' + storagePrimaryKey,
              success: res => {
                let list2 = []
                res.data.map(item => {
                  list2.push({
                    shadeDegree: parseInt(item.shadeDegree * 100),
                    useTime: item.timeUse
                  })
                })
                this.draw(list2, range, title)
              }
            })
            this.renderRecords(target.shadeDegree)
          },
        })
      }
    })
  },

  draw(data, range, title) {
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setFontSize(10)
    ctx.setFillStyle('#777777')
    let axisXData = range
    let cw = this.data.canvasSize
    let ch = this.data.canvasSize * .7
    ctx.clearRect(0, 0, cw, ch)
    // 刻度大小
    let tickSize = 3
    let devideY = 7 // 7个刻度
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
    // axisX[0] !== 0 ? (origin.x += avgWidth) : ''
    let xDx = axisX[0] !== 0 ? (origin.x + avgWidth) : origin.x
    axisX.map((item, idx) => {
      //移动刻度起点
      ctx.moveTo(xDx + idx * avgWidth, origin.y);
      //绘制到刻度终点
      ctx.lineTo(xDx + idx * avgWidth, origin.y - (item !== 0 ? tickSize : 0));
      //X轴刻度
      ctx.setTextAlign('center')
      ctx.fillText(
        item,
        xDx + idx * avgWidth,
        origin.y + 12);
    })
    // 坐标轴名字
    ctx.setFontSize(10)
    ctx.fillText(
      '比例',
      bottomRight.x + 7,
      origin.y + 12);



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

    if (data.length < 7) {
      devideY = data.length
    }
    // 30为y轴起始坐标预留距离， 底部10，顶部20
    var avgValue = Math.round((max - min) / devideY)
    var avgHeight = (ch - padding.top - padding.bottom - 30) / devideY;
    for (let i = 0; i <= devideY; i++) {
      ctx.setTextAlign('right')
      ctx.setTextBaseline('middle')
      if (devideY === 1) {
        // 只有一条数据的情况下居中
        let tickP = padding.top + (origin.y - padding.top) * .3
        ctx.moveTo(origin.x, tickP);
        ctx.lineTo(origin.x + tickSize, tickP);
        ctx.fillText(computeTime(min),
          origin.x - 5,
          tickP)
        // 跳出循环
        break
      }
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
    ctx.setStrokeStyle('#777777')
    ctx.stroke()
    ctx.closePath()

    ctx.fillText(
      '用时',
      origin.x - 5,
      topLeft.y + -7)

    ctx.save()
    ctx.setFontSize(12)
    ctx.fillText(
      title,
      bottomRight.x,
      topLeft.y)

    ctx.restore()

    // 绘制数据点
    let arcRadius = 1
    if (data.length < 17) {
      arcRadius = 2
    }
    // console.log(data)
    data.map((item, idx) => {
      ctx.beginPath()
      // 在一个avgWidth左右范围内随机x坐标
      // 是否除以2控制图的分散，除数越大越紧密
      let randomNegative = Math.random() < .5 ? -1 : 1
      let randomX = Math.random() * avgWidth / 2 * randomNegative

      let degreeParse = this.parseShadeDegree(item.shadeDegree)
      // (item.useTime - min) / avgValue * avgHeight)
      // [2, 100] 分7份每份14，取30的位置 (30 - 2) / 14 * 每份的高度
      ctx.arc(origin.x + degreeParse * avgWidth + (degreeParse >= 1 ? randomX : 0), devideY === 1 ? (padding.top + (origin.y - padding.top) * .3) : (origin.y - 10 - ((item.useTime - min) / avgValue * avgHeight)), arcRadius, 0, 2 * Math.PI)
      ctx.setFillStyle('#ffc107')
      ctx.fill()
      ctx.closePath()

    })

    ctx.draw()
  },

  parseShadeDegree(shadeDegree) {
    if (shadeDegree === 0) {
      return 0
    } else {
      // 取个位数字返回
      return shadeDegree % 10 !== 0 ? shadeDegree % 10 : 10
    }
  },

  renderRecords(degree) {
    // console.log('in')
    // records
    let range = adapterDegree(degree, 'range')

      wx.getStorage({
        key: 'records',
        success: res => {
          let list = []
          let countsAll = 0
          // console.log(res.data)
          res.data.map(item => {
            let shade = parseInt(item.shadeDegree * 100)
            let selected = (shade >= range[0] && shade <= range[1]) ? true : false
            list.push({
              degree: adapterDegree(item.shadeDegree),
              counts: item.counts,
              showTime: item.showTime,
              recordTime: fromNow(item.recordTime),
              selected: selected
            })
            countsAll += item.counts
          })
          this.setData({
            records: list,
            countsAll: countsAll,
            loadingTip: countsAll === 0 ? '请完成一局数独再来看看吧' : '读取成功，数据渲染中...'
          })
        },
        fail: () => {
          this.setData({
            loadingTip: '请完成一局数独再来看看吧'
          })
        }
      })
  },

  renderLastRecords() {
    // 最近50条记录
    wx.getStorage({
      key: 'recordLatest',
      success: res => {
        // console.log(res)
        let list = []
        res.data.map(item => {
          list.unshift({
            recordTime: fromNow(item.recordTime),
            showTime: item.showTime,
            shadeDegree: parseInt(item.shadeDegree * 100) + '%',
            degree: adapterDegree(item.shadeDegree)
          })
        })
        this.setData({
          recordLatest: list
        })
      },
    })
  },

  canvasToImg(e) {
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function (res) {
            // var savedFilePath = res.savedFilePath
            // show success
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1700
            })
          }
        })
      }
    })
  },

  showTip(e) {
    let type = e.currentTarget.dataset.type
    if (type === 'tip1') {
      this.setData({
        showTip1: true
      })
    } else if (type === 'tip2') {
      this.setData({
        showTip2: true
      })
    }
  },

  drawItem(e) {
    let idx = e.currentTarget.dataset.idx
    // degree值为0，1，2，3，4，5，6，7，8，9
    // 为0的时候避免判断为false, 1的时候为第二级，避免为1成为第一级
    let degree = idx === 0 ? 0.1 : idx * .11
    this.drawCanvas(degree)
    this.renderRecords(degree)
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