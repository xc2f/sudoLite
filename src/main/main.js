import React, { Component } from 'react';

class Main extends Component {
  constructor(props) {
    super(props);
    this.avalibleIdx = this.avalibleIdx.bind(this);
  }

  // 每行分为3块，idx在三行内不处于同一块
  /**
   * 
   * @param {Array} rowList - 当前行的数字填充情况
   * @param {Number} idxOfRowList - 数独第几行
   * @param {Array} idxInList - 同一数字在每行所处位置
   */
  avalibleIdx(rowList, idxOfRowList, idxInList){
    // console.log('in')
    let avalibleList = []
    for(let m=0; m<9; m++){
      if(rowList[m] === undefined && idxInList.indexOf(m)===-1){
        if(idxOfRowList % 3 === 0){
          avalibleList.push(m)
        } else {
          let blockLastIndex = idxInList[idxInList.length - 1]
          if(( blockLastIndex < 3 && m < 3) || ( (blockLastIndex>=3 && blockLastIndex<6) && (m>=3 && m<6) ) || ( blockLastIndex >= 6 && m >= 6) ) {
            continue
          } else {
            if(idxOfRowList % 3 === 2){
              let blockAheadIdx = idxInList[idxInList.length - 2]
              if(( blockAheadIdx < 3 && m < 3) || ( (blockAheadIdx>=3 && blockAheadIdx<6) && (m>=3 && m<6) ) || ( blockAheadIdx >= 6 && m >= 6) ) {
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

  }


  componentWillMount() {
    
    let array = new Array(9)
    for(let i=0; i<9; i++){
      array[i] = new Array(9)
    }
    let time = new Date().getTime()
    for(let j=0; j<9; j++){
      let idxInList = []
      let notComplete = true

      while (notComplete) {
        idxInList = []
        for(let k=0; k<9; k++){
          let avalibIdx = this.avalibleIdx(array[k], k, idxInList)
          if(avalibIdx !== undefined){
            idxInList.push(avalibIdx)
          }
        }
        if (idxInList.length === 9 || new Date().getTime() - time > 5000){
          notComplete = false
        }
      }

      idxInList.map((item, idx) => {
        array[idx][item] = j+1
      })

    }

    console.log(array)
  }
  
  
  render() {
    return (
      <div>
        
      </div>
    );
  }
}

export default Main;