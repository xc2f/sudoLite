import React, { Component } from 'react';

import eventProxy from './eventProxy'

class Child2 extends Component {
  componentDidMount() {
    eventProxy.on('msg', (msg) => {
      console.log('log: ', msg);
    });
  }
  
  render() {
    return (
      <div>
        child2
      </div>
    );
  }
}

export default Child2;