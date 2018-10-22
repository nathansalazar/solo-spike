/* global google */

import React from 'react';
import { compose, withProps, lifecycle, withHandlers } from 'recompose';
import { GoogleMap, withGoogleMap, withScriptjs, Marker, DirectionsRenderer } from "react-google-maps";
import { connect } from 'react-redux';

const mapReduxStateToProps = (reduxState) => {
    return { reduxState };
}

const MapComponent = compose(
    withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBDKdBqDqbNQtLtmUGZkAlZhdiPzTbs1eY&v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `400px` }} />,
        mapElement: <div style={{ height: `100%` }} />,
        location: { lat: 44.983333, lng: -93.266667 },
    }),
    withHandlers({
        onMarkerClick: (playground, index) => () => {
            console.log('You clicked on:', playground.reduxState.playgrounds);
            // console.log('Which is at:', playground.location);
        }
    }),
    withScriptjs,
    withGoogleMap,
    // Marker,
    lifecycle({
        componentWillReceiveProps(nextProps) {
            if(nextProps.submitted === this.props.submitted){
                this.setState({submitted: nextProps.submitted});
                return null;
            }
            const DirectionsService = new google.maps.DirectionsService();
            DirectionsService.route({
                origin: this.props.reduxState.route[this.props.reduxState.route.length-1].origin,
                destination: this.props.reduxState.route[this.props.reduxState.route.length-1].destination,
                travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    this.setState({
                        directions: result
                    });
                    let polyline = new google.maps.Polyline({
                        path: [],
                    });
                    let legs = result.routes[0].legs;
                    for (let i = 0; i < legs.length; i++) {
                        let steps = legs[i].steps;
                        for (let j = 0; j < steps.length; j++) {
                            let nextSegment = steps[j].path;
                            for (let k = 0; k < nextSegment.length; k++) {
                                polyline.getPath().push(nextSegment[k]);
                            }
                        }
                    }
                    let pythagorean = (a, b) => {
                        return Math.sqrt(a * a + b * b) * 6371000;
                    }
                    let toRadians = (degrees) => {
                        return degrees * Math.PI / 180;
                    }
                    //to access the latLngs, we set state as such:
                    this.setState({ polyline: polyline.latLngs.b[0].b });
                    //and now state.polyline gives us an array of latLng objects along the route

                    //we initialize our checkpoints with the first latLng from polyline
                    let lastSearch = { lat: polyline.latLngs.b[0].b[0].lat(), lng: polyline.latLngs.b[0].b[0].lng() };
                    let distanceTraveledMeters = 0;
                    let searchAt = []; //an array of coordinates at which to search
                    let stepBeginning; //we keep track of each beginning/end of each step of the trip
                    let stepEnd = lastSearch;
                    for (let step of polyline.latLngs.b[0].b) {
                        stepBeginning = stepEnd;
                        stepEnd = { lat: step.lat(), lng: step.lng() };
                        let segmentDistance = pythagorean(toRadians(stepEnd.lat) - toRadians(stepBeginning.lat), toRadians(stepEnd.lng) - toRadians(stepBeginning.lng));
                        distanceTraveledMeters = distanceTraveledMeters + segmentDistance;
                        if (pythagorean(toRadians(stepEnd.lat) - toRadians(lastSearch.lat), toRadians(stepEnd.lng) - toRadians(lastSearch.lng)) > this.props.reduxState.route[this.props.reduxState.route.length-1].radius*2) {
                            lastSearch = stepEnd;
                            searchAt.push(lastSearch);
                            this.props.dispatch({ type: 'SEARCH_PLAYGROUNDS', payload: lastSearch, radius: this.props.reduxState.route[this.props.reduxState.route.length-1].radius });
                        }
                    }
                    console.log('We search at:', searchAt);
                    console.log('polyline.latLngs.b[0].b', polyline.latLngs.b[0].b);
                    this.props.dispatch({ type: 'SET_CHECKPOINTS', payload: searchAt });
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            });
        }//end componentDidMount
    }) //end lifecycle
)//end compose
    ((props) => (
        <div>
            <p>Origin: {props.reduxState.origin}, Destination: {props.reduxState.destination}</p>
            <GoogleMap
                defaultZoom={8}
                defaultCenter={props.location}
            >
                {props.directions && <DirectionsRenderer directions={props.directions} />}
                {props.reduxState.checkpoints.map((checkpoint, index) =>
                        <Marker key={index} position={checkpoint} title={JSON.stringify(checkpoint)} label='Search' /> 
                )}
                {props.reduxState.playgrounds.map((playground, index) =>
                    <Marker key={index} position={playground.location} title={playground.name} onClick={() => props.onMarkerClick(playground, index)} />)}

                {/* (playgroundArray,index) => (
            <Marker key={index} position={playgroundArray[0].location} onClick={()=>props.onMarkerClick(playgroundArray)} />
        ))} */}
                {JSON.stringify(props.reduxState, null, 2)}
            </GoogleMap>
        </div>
    ))

export default connect(mapReduxStateToProps)(MapComponent);