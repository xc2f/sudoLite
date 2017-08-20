import React, { Component } from 'react';

class Index extends Component {

  constructor(props) {
    super(props);
    this.random = this.random.bind(this);
    this.randomList = this.randomList.bind(this);
    this.S = []
  }
  

  componentWillMount() {
    for(let i=0; i<9; i++){
      this.S.push([])
      for(let j=0; j<9; j++){
        this.S[i].push(null)
      }
    }
    

    for(let m=1; m<10; m++){
      let _randomList = this.randomList()
      console.log(_randomList)
      for(let n=0; n<9; n++){
        this.S[n][_randomList[n]] = m
      }
    }

    // 生成一个中块内不重复的3*3总块
    // for(let m=0; m<S.length; m++){
    //   // 中块
    //     while (S[m].length<9) {
    //       // 小块
    //       let value = this.random()
    //       if(S[m].indexOf(value) === -1){
    //         S[m].push(value)
    //       }  
    //     }
    // }

    
    console.log(this.S)

  }
  
  random(idx){
    // 生成0-8的整数随机数，作为9*9数组下标访问
    let _numList = []
    this.S[idx].map((idx, item) => {
      if(item !== null){
        _numList.push(idx)
      }
    })
    let _fullList = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    _numList.map(item => {
      if(item in _fullList){
        _fullList.splice(item, 1)
      }
    })
    return _fullList[Math.floor(Math.random() * _fullList.length)]
  }

  randomList(){
    let _list = []
    let idx=0
    while(_list.length < 9){
      let value = this.random(idx)
      if(_list.indexOf(value) === -1 && this.S[idx][value] === null){
        // 生成的是1-9的随机数，对应减一为数组坐标访问
        _list.push(value)
        idx++
      }
    }
    return _list
  }

  render() {
    return (
      <div>
        
      </div>
    );
  }
}

export default Index;