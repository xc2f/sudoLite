import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

// import Index from './main/index'
// import Index from './sorted'
import Main from './main/main'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src='./logo.svg' className="App-logo" alt="logo" />
          <h2>9x9数独生成器</h2>
        </div>
         {/* <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p> */}
         {/* <Index />   */}
         <Main /> 
      </div>
    );
  }
}

export default App;
