import React, { Component } from 'react';

import eventProxy from './eventProxy'

class Child1 extends Component {
  componentDidMount() {
    setTimeout(function() {
      eventProxy.trigger('msg', 'from Child1 event');
    }, 200);
  }
  
  render() {
    return (
      <div>
        child1
      </div>
    );
  }
}

export default Child1;