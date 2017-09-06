//index.js
// slice只能拷贝一层
import objDeepCopy from '../../utils/objDeepCopy.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    // 数组
    array: null,

    // 生成按钮禁用状态
    btnDisabled: false,

    // 生成情况
    generateOk: false,

    // 遮挡控制
    shade: false,

    // 初次渲染完成前时不显示按钮
    dataOk: false
  },
  generateSudokuSuccess: false,

  // 数组遮挡还原用
  fullArray: null,

  // 数组重新生成时避免空屏
  copyArray: null,

  onLoad: function () {
    this.handleGenerateSudoku()
  },

  handleGenerateSudoku() {
    if (this.data.btnDisabled) {
      return
    }
    this.generateSudokuSuccess = false
    this.setData({
      btnDisabled: true,
      array: null
    })
    let result = null
    while (!this.generateSudokuSuccess) {
      result = this.generateSudoku()
      // console.log(result)
    }

    this.copyArray = result

    if(this.data.shade){
      this.toShade(result)
      this.setData({
        btnDisabled: false,
        generateOk: true,
        dataOk: true
      })
    } else {
      this.setData({
        btnDisabled: false,
        array: result,
        generateOk: true,
        dataOk: true
      })
    }
  },

  generateSudoku() {
    this.setData({
      array: this.copyArray,
      generateOk: false
    })
    let array = new Array(9)
    for (let i = 0; i < 9; i++) {
      array[i] = new Array(9)
    }
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

  toShade(newArray){
    if(newArray instanceof Array){
      let templist = newArray
      this.fullArray = objDeepCopy(templist)
      templist.map(itemRow => (
        itemRow.map((item, idx) => {
          itemRow[idx] = (Math.random() >= 0.3) ? item : ''
        })
      ))
      this.setData({
        array: templist,
        shade: true
      })
    } else {
      if (this.data.shade) {
        this.setData({
          array: this.fullArray,
          shade: false
        })
      } else {
        let templist = this.data.array
        this.fullArray = objDeepCopy(templist)
        templist.map(itemRow => (
          itemRow.map((item, idx) => {
            itemRow[idx] = (Math.random() >= 0.3) ? item : ''
          })
        ))
        this.setData({
          array: templist,
          shade: true
        })
      }
    }
    this.copyArray = this.data.array
  },

})
