import React, { Component } from 'react';
import './App.css';
import MapComponent from './Components/MapComponent';
import {connect} from 'react-redux';
import SearchBox from 'react-google-maps/lib/components/places/SearchBox';

class App extends Component {

  // the only way I could figure out how to get the MapComponent to update when I entered in a new 
  // search query in the form was to pass down the 'submitted' property as props, and then rerender
  // whenever it changes
  state={
    origin: '',
    destination: '',
    radius: 0,
    submitted: false
  }

  handleChange = (property) => (event) => {
    this.setState({[property]: event.target.value})
  }

  handleSubmit = (event) => {
    event.preventDefault();
    console.log('State:',this.state);
    this.setState({submitted: !this.state.submitted });
    this.props.dispatch({type: 'SET_ROUTE', payload: this.state});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Spike</h1>
        </header>
        <form onSubmit={this.handleSubmit}>
          <input placeholder="origin" type="text" onChange={this.handleChange('origin')}/>
          <input placeholder="destination" type="text" onChange={this.handleChange('destination')} />
          <input placeholder="radius (meters)" type="number" onChange={this.handleChange('radius')} />
          <input type="submit" />
        </form>
        <MapComponent
          isMarkerShown={false}
          submitted={this.state.submitted}
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

export default connect()(App);
