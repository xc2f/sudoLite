//index.js
// slice只能拷贝一层
// import objDeepCopy from '../../utils/objDeepCopy.js'
// import { degree } from '../../utils/config.js'
//获取应用实例
var app = getApp()
import { adapterDegree } from '../../utils/config.js'
import { parseTime } from '../../utils/moment.js'
Page({
  data: {
    // 数组
    data: [],

    boxSize: 17,

    // 生成按钮禁用状态
    btnDisabled: false,

    // 生成情况
    generateOk: false,

    // 遮挡控制
    shade: true,

    // 初次渲染完成前时不显示按钮
    init: false,

    // panel位置
    panelPosition: {
      dx: -102,
      dy: -102
    },
    panelShowAnimation: {},

    boxCoords: {
      x: 0,
      y: 0
    },

    // pannel定位用
    deviceInfo: null,
    panelData: [1, 2, 3, 4, 5, 6, 7, 8, 9],

    sideSize: 0,
    // tooltip
    toolTip: {
      type: 'ready',
      content: '点击空白格子开始计时'
    },

    // 数独完成情况
    complete: false,
    // 数独剩余数字情况，索引排序
    leave: [9, 9, 9, 9, 9, 9, 9, 9, 9],

    menuAnimationTop: null,
    menuAnimationTop: null,
    menuAnimationMiddle: null,
    menuAnimationBottom: null,
    drawerToggle: false,
    drawer: null,

    showOptionAnimation: null,

    toView: 'view0',

    avatarPosition: {
      x: -25,
      y: 25
    },
    avatarTitle: {
      text: '轻巧数独',
      step: 0
    },

    showCanvasResult: false
    // end data
  },
  degree: .3,
  percentDegree: '30%',
  degreeTitle: '幼儿园水平',
  avatarShowTimes: 0,

  generateSudokuSuccess: false,
  // 回退
  history: [],

  // 数独开始操作时间
  startTime: 0,
  timeInterval: null,

  canvasResult: null,

  initArray(type) {
    let array = new Array(9)
    for (let i = 0; i < 9; i++) {
      array[i] = new Array(9)
      for (let j = 0; j < 9; j++) {
        array[i][j] = undefined
      }
    }
    if (type === 'init') {
      this.setData({
        data: array
      })
    }
    return array
  },

  onLoad: function () {
    let deviceInfo = app.globalData.deviceInfo
    this.degree = app.globalData.shadeDegree
    this.percentDegree = parseInt(this.degree * 100) + '%'
    this.degreeTitle = adapterDegree(this.degree)
    // console.log(deviceInfo)
    this.setData({
      deviceInfo: deviceInfo,
      boxSize: (deviceInfo.windowWidth) / 9,
      sideSize: (deviceInfo.windowHeight - deviceInfo.windowWidth) / 2,
    })
    this.initArray('init')
    this.handleGenerateSudoku()
    wx.setNavigationBarTitle({
      title: this.degreeTitle
    })
  },

  reset() {
    // reset
    clearInterval(this.timeInterval)
    this.setData({
      generateOk: false,
      leave: [9, 9, 9, 9, 9, 9, 9, 9, 9],
      toolTip: {
        type: 'ready',
        content: '点击空白格子开始计时'
      },
      btnDisabled: true,
      shade: true,
      complete: false
    })
  },

  handleGenerateSudoku() {
    if (this.data.btnDisabled) {
      return
    }
    // !== timing
    if (!this.data.init || this.data.complete || this.data.toolTip.type === 'ready' || this.data.toolTip.type === 'end') {
      this.generateSudoku()
    } else {
      wx.showModal({
        title: '提示',
        content: '您本局成绩将不被记录，是否继续？',
        success: res => {
          if (res.confirm) {
            this.generateSudoku()
          } else {
            wx.stopPullDownRefresh()
          }
        }
      })
    }
  },

  generateSudoku() {
    this.generateSudokuSuccess = false
    this.reset()
    let result = null
    while (!this.generateSudokuSuccess) {
      result = this.toGenerate()
    }
    wx.stopPullDownRefresh()
    result.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        result[rowIdx][idx] = {
          value: item,
          show: true,
          // className: 'box',
          x: idx,
          y: rowIdx,
          successAnimation: {}
        }
      })
    })

    if (this.data.shade) {
      this.toggleShade(result, 'init')
    } else {
      this.setData({
        data: result,
      })
    }

    this.setData({
      btnDisabled: false,
      generateOk: true,
      init: true,
    })
  },

  toGenerate() {
    // 只取值不刷新UI, 避免box为空
    let array = this.initArray()
    let time = new Date().getTime()
    for (let j = 0; j < 9; j++) {
      let idxInList = []
      let notComplete = true

      while (notComplete) {
        idxInList = []
        for (let k = 0; k < 9; k++) {
          let avalibIdx = this.avalibleIdx(array[k], k, idxInList)
          if (avalibIdx !== undefined) {
            idxInList.push(avalibIdx)
          }
        }
        if (idxInList.length === 9) {
          notComplete = false
        } else if (new Date().getTime() - time > 1000) {
          return
        }
      }
      // 要return，不map
      for (let n = 0; n < idxInList.length; n++) {
        array[n][idxInList[n]] = j + 1
        if (j === 8 && n === 8) {
          this.generateSudokuSuccess = true
          return array
        }
      }
    }
  },

  avalibleIdx(rowList, idxOfRowList, idxInList) {
    let avalibleList = []
    for (let m = 0; m < 9; m++) {
      if (rowList[m] === undefined && idxInList.indexOf(m) === -1) {
        if (idxOfRowList % 3 === 0) {
          avalibleList.push(m)
        } else {
          let blockLastIndex = idxInList[idxInList.length - 1]
          if ((blockLastIndex < 3 && m < 3) || ((blockLastIndex >= 3 && blockLastIndex < 6) && (m >= 3 && m < 6)) || (blockLastIndex >= 6 && m >= 6)) {
            continue
          } else {
            if (idxOfRowList % 3 === 2) {
              let blockAheadIdx = idxInList[idxInList.length - 2]
              if ((blockAheadIdx < 3 && m < 3) || ((blockAheadIdx >= 3 && blockAheadIdx < 6) && (m >= 3 && m < 6)) || (blockAheadIdx >= 6 && m >= 6)) {
                continue
              }
            }
            avalibleList.push(m)
          }
        }
      }
    }
    let resultList = Array.from(new Set(avalibleList))
    return resultList[Math.floor(Math.random() * resultList.length)]
  },

  toggleShade(newData, from = 'btn') {
    // 点击事件默认传递一个事件对象，当参数是数组时表示初始化，并且为遮挡状态
    let isArray = newData instanceof Array
    let templist = isArray ? newData : this.data.data
    let leave = [9, 9, 9, 9, 9, 9, 9, 9, 9]
    templist.map(itemRow => (
      itemRow.map((item, idx) => {
        let result = isArray ? ((Math.random() >= this.degree) ? true : false) : (this.data.shade ? true : ((Math.random() >= this.degree) ? true : false))
        itemRow[idx].show = result ? true : false
        // itemRow[idx].className = result ? 'box' : 'box blank'
        item.duplicate = []
        item.fill = ''
        item.rcl = false
        let leaveIdx = item.value - 1
        // 切换时show的item会再减1
        leave[leaveIdx] = item.show ? leave[leaveIdx] - 1 : leave[leaveIdx]
      })
    ))

    if (from === 'init') {
      // init时如果完成数独不记录
      this.isComplete(templist, true)
    } else {
      let tooltip = this.data.toolTip
      tooltip = {
        type: 'end',
        content: '请重新生成数独'
      }
      this.setData({
        toolTip: tooltip
      })
      // leave = this.data.shade ? [0,0,0,0,0,0,0,0,0] : leave
    }
    this.setData({
      data: templist,
      shade: isArray ? true : !this.data.shade,
      leave: leave
    })
    this.togglePanel(false)
  },

  timing() {
    if (this.data.toolTip.type === 'timing') {
      return
    }

    this.startTime = new Date().getTime()
    let m, s
    this.timeInterval = setInterval(() => {
      let time = Math.round((new Date().getTime() - this.startTime) / 1000)
      m = Math.floor(time / 60)
      s = time % 60 < 10 ? '0' + time % 60 : time % 60
      let tooltip = {
        type: 'timing',
        content: m + ':' + s,
      }
      this.setData({
        toolTip: tooltip
      })
    }, 1000)
  },

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  menuAnimate() {
    if (this.data.drawerToggle) {
      this.toggleDrawerHandler('toClose')
    } else {
      this.toggleDrawerHandler('toOpen')
    }
  },

  closeDrawer() {
    this.toggleDrawerHandler('toClose')
  },

  toggleDrawerHandler(type) {
    let toggle = true,
      menuDx = '70%',
      menuRotate = 30,
      menuWidth = 30,
      drawDx = '30%'
    if (type === 'toClose') {
      toggle = false,
        menuDx = 0,
        menuRotate = 0,
        menuWidth = 20,
        drawDx = '100%'
    }
    this.setData({
      drawerToggle: toggle,
      menuAnimation: this.basicAnimation().translate(menuDx).step().export(),
      menuAnimationTop: this.basicAnimation().rotate(-menuRotate).step().export(),
      menuAnimationMiddle: this.basicAnimation().width(menuWidth).step().export(),
      menuAnimationBottom: this.basicAnimation().rotate(menuRotate).step().export(),
      drawer: this.basicAnimation().right(drawDx).step().export()
    })
  },

  togglePanel(toShow) {
    let scale = 0
    if (toShow) {
      scale = 1
    }
    this.setData({
      panelShowAnimation: this.basicAnimation(200).scale(scale).step().export()
    })
  },

  clearStyle() {
    let data = this.data.data
    data.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        item.rcl = false
        item.showSame = false
      })
    })
    this.setData({
      data: data
    })
  },

  tapBox(e) {
    if (this.data.complete) {
      return
    }
    let show = e.currentTarget.dataset.show
    let value = e.currentTarget.dataset.value

    if (show) {
      this.togglePanel(false)
      this.showSame(true, value)
      this.setData({
        toView: 'view' + (value - 1)
      })
      return
    }
    this.showSame(false)
    this.timing()

    // panel浮层位置
    let panelPosition = this.data.panelPosition
    // panel的一半是51
    panelPosition.dx = e.detail.x - 51
    panelPosition.dy = e.detail.y - 51

    let screenWidth = this.data.deviceInfo.screenWidth
    // 触摸点位置加半个panel超出屏幕宽度
    if (e.detail.x + 51 >= screenWidth) {
      panelPosition.dx = e.detail.x - 102
    } else if (panelPosition.dx <= 0) {
      // panel左边超出屏幕边界
      panelPosition.dx = e.detail.x
    }

    // 激活的哪个box
    let boxCoords = this.data.boxCoords
    boxCoords.x = e.currentTarget.dataset.x
    boxCoords.y = e.currentTarget.dataset.y
    let data = this.data.data
    data.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        item.rcl = false
        if (rowIdx === boxCoords.y || idx === boxCoords.x) {
          item.rcl = true
        }
      })
    })
    this.about9Box(boxCoords.x, boxCoords.y).map(item => {
      data[item.y][item.x].rcl = true
    })

    // panel数字
    let panelData = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    if (data[boxCoords.y][boxCoords.x].fill) {
      let idx = panelData.indexOf(data[boxCoords.y][boxCoords.x].fill)
      panelData.splice(idx, 1)
      // 始終讓x居中
      panelData.splice(4, 0, 'x')
    }

    this.setData({
      panelPosition: panelPosition,
      boxCoords: boxCoords,
      data: data,
      panelData: panelData,
    })
    this.togglePanel(true)
  },

  countDuplication(value, item, target) {
    let boxCoords = this.data.boxCoords
    let targetPosition = parseInt(boxCoords.y + '' + boxCoords.x)
    let findTargetPositionInList = item.duplicate.lastIndexOf(targetPosition)
    if (value === 'x') {
      if (item.value === target.fill) {
        item.duplicate.splice(findTargetPositionInList, 1)
      }
    } else {
      if (item.value === value) {
        item.duplicate.push(targetPosition)
      } else {
        if (findTargetPositionInList >= 0) {
          item.duplicate.splice(findTargetPositionInList, 1)
        }
      }
    }
  },
  showCbg() {
    let data = this.data.data
    data.map((itemRow, idxRow) => {
      itemRow.forEach((item, idx) => {
        // (idx + idxRow) * 50 - 50 => 求 i * j格子的值，即 j + i - 1
        item.successAnimation = this.basicAnimation(50, (idx + idxRow) * 50 - 50).scale(1).step().export()
      })
    })
    this.setData({
      data: data
    })
  },

  isComplete(data, init = false) {
    // console.log(leave)
    // let result = leave.reduce((p, n) => p + n)
    // if (result === 0) {
    // item为show不检查为false
    // item不为show的情况下item.fill为空为true, item.fill !== item.valueweitrue
    let unComplete = data.some(itemRow => (itemRow.some(item => (!item.show ? (item.fill ? (item.fill !== item.value) : true) : false))))
    console.log(unComplete)
    if (unComplete) {
      return
    }

    if (init) {
      // 取消初始化的成绩记录
      let tooltip = this.data.toolTip
      tooltip = {
        type: 'end',
        content: '运气太好了，没有一个能点的'
      }
      this.setData({
        toolTip: tooltip,
        complete: true,
        shade: false
      })
      return
    }

    this.clearStyle()
    this.togglePanel(false)
    this.showCbg()

    clearInterval(this.timeInterval)
    let tooltip = this.data.toolTip
    let showTime = tooltip.type === 'ready' ? '0:00' : (tooltip.type === 'timing' ? tooltip.content : '')
    tooltip = {
      type: 'complete',
      content: '用时' + showTime + ', 恭喜！'
    }
    this.setData({
      toolTip: tooltip,
      complete: true,
      shade: false
    })

    // 绘制结果
    // this.drawCanvas(showTime)

    // 存缓存
    let backData = {
      startTime: this.startTime,
      recordTime: new Date().getTime(),
      showTime: showTime,
      shadeDegree: app.globalData.shadeDegree
    }

    // 即生成0到9的key
    let storagePrimaryKey = adapterDegree(this.degree, 'range')[1] / 10 - 1

    wx.getStorage({
      key: 'record' + storagePrimaryKey,
      success: function (res) {
        let records = res.data
        records.push(backData)
        wx.setStorage({
          key: 'record' + storagePrimaryKey,
          data: records,
        })
      },
      fail: () => {
        let records = []
        records.push(backData)
        wx.setStorage({
          key: 'record' + storagePrimaryKey,
          data: records,
        })
      }
    })

    // 存一个总的记录，记录各等级最短时间等等
    wx.getStorage({
      key: 'records',
      success: function (res) {
        let records = res.data
        // 用时短则替换
        let target = records[storagePrimaryKey]
        let counts = target.counts
        let diffValue = (target.recordTime - target.startTime) - (backData.recordTime - backData.startTime)
        if (diffValue > 0 || (target.recordTime - target.startTime === 0)) {
          records.splice(storagePrimaryKey, 1, backData)
        }
        records[storagePrimaryKey].counts = counts + 1

        wx.setStorage({
          key: 'records',
          data: records,
        })
      },
      fail: () => {
        let records = []
        for (let i = 0; i < 10; i++) {
          if (i === storagePrimaryKey) {
            backData.counts = 1
            records.push(backData)
            continue
          }
          records.push({
            startTime: 0,
            recordTime: 0,
            counts: 0,
          })
        }
        wx.setStorage({
          key: 'records',
          data: records,
        })
      }
    })

    // 存最近50条记录
    wx.getStorage({
      key: 'recordLatest',
      success: function (res) {
        let records = res.data
        if (records.length > 50) {
          records.shift()
        }
        records.push(backData)
        wx.setStorage({
          key: 'recordLatest',
          data: records,
        })
      },
      fail: () => {
        let records = []
        records.push(backData)
        wx.setStorage({
          key: 'recordLatest',
          data: records,
        })
      }
    })
    // }
  },

  panelTap(e) {
    let value = e.currentTarget.dataset.value
    let boxCoords = this.data.boxCoords
    let data = this.data.data

    // 行和列
    data.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        // 只找show的
        if (item.show) {
          if ((rowIdx === boxCoords.y || idx === boxCoords.x) && (!(rowIdx === boxCoords.y && idx === boxCoords.x))) {
            this.countDuplication(value, item, data[boxCoords.y][boxCoords.x])
          }
        }
      })
    })

    // 九宫格
    this.about9Box(boxCoords.x, boxCoords.y).map(item => {
      if (boxCoords.x !== item.x || boxCoords.y !== item.y) {
        let box = data[item.y][item.x]
        if (box.show) {
          // 排除在同行或同列的，上一步已经处理过
          if (item.y !== boxCoords.y && item.x !== boxCoords.x) {
            this.countDuplication(value, box, data[boxCoords.y][boxCoords.x])
          }
        }
      }
    })

    // 计算剩余数字
    let leave = this.data.leave.slice()
    let target = data[boxCoords.y][boxCoords.x]
    if (value === 'x') {
      let idx = target.fill
      leave[idx - 1] = leave[idx - 1] + 1
      // } else if (target.fill === target.value){
    } else {
      if (target.fill === '') {
        leave[value - 1] = leave[value - 1] - 1
      } else {
        let idx = parseInt(target.fill)
        leave[idx - 1] = leave[idx - 1] + 1
        leave[value - 1] = leave[value - 1] - 1
      }
    }


    data[boxCoords.y][boxCoords.x].fill = (value === 'x') ? '' : value

    this.isComplete(data)

    this.setData({
      data: data,
      leave: leave
    })

    this.togglePanel(false)

    // 最多存100条记录
    if (this.history.length === 100) {
      this.history.pop()
    }

    this.history.push({
      boxCoords: boxCoords,
      data: data[boxCoords.y][boxCoords.x],
      panelValue: value
    })

  },

  about9Box(x, y) {
    let range = {}
    let list = []
    if (x % 3 === 0) {
      // x在0, 3, 6列
      range.x = [x, x + 1, x + 2]
    } else if (x % 3 === 1) {
      // x在1，4，7列
      range.x = [x - 1, x, x + 1]
    } else {
      // x在2，5，8列
      range.x = [x - 2, x - 1, x]
    }
    if (y % 3 === 0) {
      // y在0, 3, 6行
      range.y = [y, y + 1, y + 2]
    } else if (y % 3 === 1) {
      // y在1，4，7行
      range.y = [y - 1, y, y + 1]
    } else {
      // y在2，5，8行
      range.y = [y - 2, y - 1, y]
    }
    range.y.map(y => {
      range.x.map(x => {
        list.push({
          x: x,
          y: y
        })
      })
    })
    // 返回当前九宫格坐标
    return list
  },

  hidePanel() {
    this.togglePanel(false)
  },

  showSame(showSame, value) {
    let data = this.data.data
    data.map((rowItem, rowIdx) => {
      rowItem.map(item => {
        if (item.show) {
          if (showSame) {
            if (item.value === value) {
              item.showSame = true
            } else {
              delete item.showSame
            }
          } else {
            delete item.showSame
          }
        }
      })
    })
    this.setData({
      data: data
    })
  },

  showOption() {
    this.setData({
      showOptionAnimation: this.basicAnimation().scale(1).step().export()
    })
  },
  hideOption() {
    this.setData({
      showOptionAnimation: this.basicAnimation(300).scale(0).step().export()
    })
  },

  tapRowToShowSame(e) {
    this.showSame(true, e.currentTarget.dataset.idx + 1)
  },

  moveAvatarEnd(e) {
    let position = {
      x: -25,
      y: 25
    }
    this.setData({
      avatarPosition: position
    })
  },
  tapAvatar() {
    let step = this.data.avatarTitle.step
    if (step > 0) {
      return
    }
    let showText = '别点我'
    if (this.avatarShowTimes === 1) {
      showText = '又是你'
    } else if (this.avatarShowTimes === 2) {
      showText = '还是你'
    } else if (this.avatarShowTimes === 3) {
      showText = '怎么老是你'
    } else if (this.avatarShowTimes > 3) {
      showText = '拉黑你'
      // disabled
    }
    this.setData({
      avatarTitle: {
        text: showText,
        step: 1,
      }
    })
    // 超过三次后不再进行对话
    if (this.avatarShowTimes > 3) {
      this.tapAvatarShowTitle('轻巧数独', 0, 1500, null)
      return
    }
    this.tapAvatarShowTitle('......', 2, 1000, null)
    this.tapAvatarShowTitle('这下可好', 3, 2500, null)
    this.tapAvatarShowTitle('我忘了自己叫啥了/(ㄒoㄒ)/~~', 4, 4000, null)
    this.tapAvatarShowTitle('怎么办怎么办😭', 5, 6000, null)
    this.tapAvatarShowTitle('嗯？我想想...', 6, 8000, null)
    this.tapAvatarShowTitle('主人好像设定过', 7, 9000, null)
    this.tapAvatarShowTitle('长按我可以还原，快试试O(∩_∩)O', 8, 10000, res => {
      this.avatarShowTimes++
    })

  },

  longTapAvatar(e) {
    if (this.data.avatarTitle.step === 8) {
      let avatarTitle = {
        text: '笨呐，是我，不是上面那位！',
        step: 9
      }
      this.setData({
        avatarTitle: avatarTitle
      })
    }
  },

  tapAvatarShowTitle(text, step, delay, callback) {
    setTimeout(() => {
      let avatarTitle = {
        text: text,
        step: step
      }
      this.setData({
        avatarTitle: avatarTitle
      })
      callback ? callback() : ''
    }, delay || 2000)
  },

  longTapAvatarTitle(e) {
    let step = this.data.avatarTitle.step
    if (step === 8 || step === 9) {
      this.tapAvatarShowTitle('谢谢o(*￣▽￣*)ブ', 10, 0, res => {
        this.tapAvatarShowTitle('轻巧数独', 0, 0, null)
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.handleGenerateSudoku()
  },

  drawCanvas(showTime) {
    const ctx = wx.createCanvasContext('completeCanvas')
    ctx.setFontSize(12)
    ctx.setFillStyle('#222222')
    ctx.setTextAlign('left')
    ctx.setTextBaseline('middle')
    let cw = 215
    let ch = 168
    let padding = 20
    let lineHeight = (ch - 20 - 20) / 4
    let alignCenter = cw / 2
    ctx.save()
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, cw, ch)
    ctx.restore()
    ctx.fillText('遮挡比例： ' + this.percentDegree, padding / 2, padding + lineHeight * 1 - lineHeight * .5)
    ctx.fillText('等级： ' + this.degreeTitle, padding / 2, padding + lineHeight * 2 - lineHeight * .5)
    ctx.fillText('用时： ' + showTime, padding / 2, padding + lineHeight * 3 - lineHeight * .5)
    ctx.fillText('完成时间： ' + parseTime(new Date().getTime()), padding / 2, padding + lineHeight * 4 - lineHeight * .5)
    ctx.draw()
    wx.canvasToTempFilePath({
      canvasId: 'completeCanvas',
      success: res => {
        this.canvasResult = res.tempFilePath
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    this.setData({
      showCanvasResult: true
    })
    this.drawCanvas('12')
    let title, img = ''
    if (e.from === 'button') {
      title = '我在sudoLite完成了一项挑战，战绩如下：'
      img = this.canvasResult ? this.canvasResult : ''
      console.log(img)
    } else {
      title = 'Lite.Fun'
    }
    return {
      title: title,
      path: '/pages/index/index',
      imageUrl: img,
      complete: () => {
        this.setData({
          showCanvasResult: false
        })
      }
    }

  }
})
