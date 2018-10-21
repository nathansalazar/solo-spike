import React, { Component } from 'react';
import './App.css';
import MapComponent from './Components/MapComponent';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Spike</h1>
        </header>
        <MapComponent
          isMarkerShown={false}
          // googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBDKdBqDqbNQtLtmUGZkAlZhdiPzTbs1eY&v=3.exp&libraries=geometry,drawing,places"
          // loadingElement={<div style={{ height: `100%` }} />}
          // containerElement={<div style={{ height: `400px` }} />}
          // mapElement={<div style={{ height: `100%` }} />}
          // location={{lat: 44.983333, lng: -93.266667 }}
          // the above props should be commented out if using 'compose'
     />
      </div>
    );
  }
}

export default App;
