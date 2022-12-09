import React, { Component } from 'react';
import Message from './components/Message'

class App extends Component {
  render() {
    return (
      <div style={{width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
       <Message /> 
      </div>
    );
  }
}

export default App;
