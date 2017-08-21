import React, { Component } from 'react';
import './index.css'

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      array: null,
      btnDisabled: false,
      shade: false
    }
    this.avalibleIdx = this.avalibleIdx.bind(this);
    this.generateSudoku = this.generateSudoku.bind(this);
    this.generateSudokuSuccess = false
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

  generateSudoku(){
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
        if (idxInList.length === 9){
          notComplete = false
        } else if (new Date().getTime() - time > 1000){
          return
        }
      }
      // 要return，不map
      for(let n=0; n<idxInList.length; n++){
        array[n][idxInList[n]] = j+1
        if(j===8 && n===8){
          this.generateSudokuSuccess = true
          return array
        }
      }
    }
  }

  handleGenerateSudoku(){
    if(this.state.btnDisabled){
      return
    }
    this.generateSudokuSuccess = false
    this.setState({
      btnDisabled: true,
      array: null
    })
    let result = null
    while(!this.generateSudokuSuccess){
      result = this.generateSudoku()
      // console.log(result)
    }   
    this.setState({
      btnDisabled: false,
      array: result
    })
  }

  componentWillMount() {
    this.handleGenerateSudoku()
  }
  
  
  render() {
    return (
      <div className="container">
      {this.state.array === null ?
        <div>数独生成中</div>
        :
        <div className="wrap">
          {this.state.array.map((item, idx) => (
            <div className="row" key={`row-${idx}`}>
              {/* 遮挡1/3 */}
              {item.map((i, d) => (
                <pre key={`box-${d}`}>{ this.state.shade ? (Math.random()>=.3 ? i : '') : i}</pre>
              ))}
            </div>
          ))}
          <div className="btngroup">
            <button onClick={this.handleGenerateSudoku.bind(this)} disabled={this.state.btnDisabled}>重新生成</button>
            <button
              onClick={ ()=>this.setState({ shade: !this.state.shade}) }
            >{this.state.shade ? '取消遮挡' : '随机遮挡'}</button>
          </div>
        </div>
      }
      </div>
    );
  }
}

export default Main;