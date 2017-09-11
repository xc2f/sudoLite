//index.js
// slice只能拷贝一层
// import objDeepCopy from '../../utils/objDeepCopy.js'
// import { degree } from '../../utils/config.js'
//获取应用实例
var app = getApp()
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

    sudokuEdge: 0,
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

  },

  generateSudokuSuccess: false,
  // 回退
  history: [],

  // 数独开始操作时间
  startTime: 0,
  timeInterval: null,

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
    this.setData({
      deviceInfo: deviceInfo,
      boxSize: (deviceInfo.screenWidth - 20) / 9,
      sudokuEdge: deviceInfo.windowHeight / 2 - deviceInfo.windowWidth / 2,
    })
    this.initArray('init')
    this.handleGenerateSudoku()
  },

  checkComplete() {

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
    result.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        result[rowIdx][idx] = {
          value: item,
          show: true,
          // className: 'box',
          x: idx,
          y: rowIdx
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
    // 点击事件默认传递一个事件对象，当参数是数组时表示当前为遮挡状态
    let isArray = newData instanceof Array
    let templist = isArray ? newData : this.data.data
    let leave = this.data.leave.slice()
    let degree = app.globalData.shadeDegree
    templist.map(itemRow => (
      itemRow.map((item, idx) => {
        let result = isArray ? ((Math.random() >= degree) ? true : false) : (this.data.shade ? true : ((Math.random() >= degree) ? true : false))
        itemRow[idx].show = result ? true : false
        // itemRow[idx].className = result ? 'box' : 'box blank'
        item.duplicate = []
        item.fill = ''
        item.rcl = false
        let leaveIdx = item.value - 1
        leave[leaveIdx] = item.show ? leave[leaveIdx] - 1 : leave[leaveIdx]
      })
    ))
    this.setData({
      data: templist,
      shade: isArray ? true : !this.data.shade,
      leave: leave
    })
    if (from === 'init') {
      this.isComplete(leave)
    } else {
      let tooltip = this.data.toolTip
      tooltip = {
        type: 'end',
        content: '请重新生成数独'
      }
      this.setData({
        toolTip: tooltip
      })
    }
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
        menuDx = 10,
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

  tapBox(e) {
    let show = e.currentTarget.dataset.show
    let value = e.currentTarget.dataset.value

    if (show) {
      this.togglePanel(false)
      this.showSame(true, value)
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


  isComplete(leave) {
    let result = leave.reduce((p, n) => (p + n))
    if (result === 0) {
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
      let backData = {
        startTime: this.startTime,
        recordTime: new Date().getTime(),
        showTime: showTime,
        shadeDegree: app.globalData.shadeDegree
      }
      wx.getStorage({
        key: 'records',
        success: function(res) {
          let records = res.data
          records.push(backData)
          wx.setStorage({
            key: 'records',
            data: records,
          })
        },
        fail: () => {
          let records = []
          records.push(backData)
          wx.setStorage({
            key: 'records',
            data: records,
          })
        }
      })
    }
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

    data[boxCoords.y][boxCoords.x].fill = (value === 'x') ? '' : value

    // 计算剩余数字
    let leave = this.data.leave.slice()
    leave[value - 1] = leave[value - 1] - 1
    this.isComplete(leave)

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

})
