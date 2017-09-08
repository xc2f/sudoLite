//index.js
// slice只能拷贝一层
import objDeepCopy from '../../utils/objDeepCopy.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    // 数组
    data: [],

    // 生成按钮禁用状态
    btnDisabled: false,

    // 生成情况
    generateOk: false,

    // 遮挡控制
    shade: false,

    // 初次渲染完成前时不显示按钮
    dataOk: false,

    // panel位置
    panelPosition: {
      dx: -102,
      dy: -102
    },
    panelShow: false,
    panelShowAnimation: {},

    boxPosition: {
      x: 0,
      y: 0
    },

    deviceInfo: null
  },
  generateSudokuSuccess: false,


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
    this.initArray('init')
    this.handleGenerateSudoku()
    this.setData({
      deviceInfo: app.globalData.deviceInfo
    })
  },

  handleGenerateSudoku() {
    if (this.data.btnDisabled) {
      return
    }
    this.generateSudokuSuccess = false
    this.setData({
      btnDisabled: true,
    })
    let result = null
    while (!this.generateSudokuSuccess) {
      result = this.generateSudoku()
    }

    result.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) => {
        result[rowIdx][idx] = {
          value: item,
          show: true,
          className: 'box',
          x: idx,
          y: rowIdx
        }
      })
    })

    if (this.data.shade) {
      this.toggleShade(result)
      this.setData({
        btnDisabled: false,
        generateOk: true,
        dataOk: true
      })
    } else {
      this.setData({
        btnDisabled: false,
        data: result,
        generateOk: true,
        dataOk: true
      })
    }
  },

  generateSudoku() {
    this.setData({
      generateOk: false
    })
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
    // console.log('in')
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

  toggleShade(newData) {
    // 点击事件默认传递一个事件对象，当参数是数组时表示当前为遮挡状态
    let isArray = newData instanceof Array
    let templist = isArray ? newData : this.data.data
    templist.map(itemRow => (
      itemRow.map((item, idx) => {
        let result = isArray ? ((Math.random() >= 0.3) ? true : false) : (this.data.shade ? true : ((Math.random() >= 0.3) ? true : false))
        itemRow[idx].show = result ? true : false,
        itemRow[idx].className = result ? 'box' : 'box blank'
      })
    ))
    this.setData({
      data: templist,
      shade: isArray ? true : !this.data.shade
    })
  },

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  tapBox(e) {
    console.log(e)
    let show = e.currentTarget.dataset.show
    if (show) {
      this.setData({
        panelShowAnimation: this.basicAnimation(200).scale(0).step().export()
      })
      return
    }

    // panel浮层位置
    let panelPosition = this.data.panelPosition
    // panel的一半是51
    panelPosition.dx = e.detail.x - 51
    panelPosition.dy = e.detail.y - 51
    
    let screenWidth = this.data.deviceInfo.screenWidth
    // 触摸点位置加半个panel超出屏幕宽度
    if (e.detail.x + 51 >= screenWidth){
      panelPosition.dx = e.detail.x - 102
    } else if (panelPosition.dx <= 0){
      // panel左边超出屏幕边界
      panelPosition.dx = e.detail.x
    }

    // 激活的哪个box
    let boxPosition = this.data.boxPosition
    boxPosition.x = e.currentTarget.dataset.x
    boxPosition.y = e.currentTarget.dataset.y

    let data = this.data.data
    data.map((rowItem, rowIdx) => {
      rowItem.map((item, idx) =>{
        item.rcl = false
        if (rowIdx === boxPosition.y){
          item.rcl = true
        }
        if(idx === boxPosition.x){
          item.rcl = true
        }
      })
    })
    this.setData({
      panelPosition: panelPosition,
      panelShowAnimation: this.basicAnimation(200).scale(1).step().export(),
      boxPosition: boxPosition,
      data: data
    })
  },

  panelTap(e){
    let value = e.currentTarget.dataset.value
    let boxPosition = this.data.boxPosition
    let data = this.data.data
    data[boxPosition.y][boxPosition.x].fill = value
    this.setData({
      panelShowAnimation: this.basicAnimation(200).scale(0).step().export(),
      data: data
    })
  }

})
