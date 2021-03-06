/* global google */

import React, {Component} from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import { GoogleMap, withGoogleMap, withScriptjs, Marker, DirectionsRenderer } from "react-google-maps";
import {connect} from 'react-redux';

const mapReduxStateToProps = (reduxState) => {
   return { reduxState };
}

class MapComponent extends Component{

    componentDidMount() {
        const DirectionsService = new window.google.maps.DirectionsService();
        DirectionsService.route({
            origin: { lat: 44.983333, lng: -93.266667 },
            destination: { lat: 41.590833, lng: -93.620833 },
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                this.setState({
                    directions: result
                });
                let polyline = new window.google.maps.Polyline({
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
                    return degrees*Math.PI/180;
                }
                //to access the latLngs, we set state as such:
                this.setState({ polyline: polyline.latLngs.b[0].b });
                //and now state.polyline gives us an array of latLng objects along the route

                //we initialize our checkpoints with the first latLng from polyline
                let lastSearch = {lat: polyline.latLngs.b[0].b[0].lat(), lng: polyline.latLngs.b[0].b[0].lng() };
                let distanceTraveledMeters = 0;
                let searchAt = [];
                let stepBeginning;
                let stepEnd = lastSearch;
                for (let step of polyline.latLngs.b[0].b) {
                    stepBeginning = stepEnd;
                    stepEnd = { lat: step.lat(), lng: step.lng() };
                    let segmentDistance = pythagorean(toRadians(stepEnd.lat) - toRadians(stepBeginning.lat), toRadians(stepEnd.lng) - toRadians(stepBeginning.lng));
                    distanceTraveledMeters = distanceTraveledMeters + segmentDistance;
                    // distanceTraveledArrayMeters.push(distanceTraveledMeters);
                    if (pythagorean(toRadians(stepEnd.lat) - toRadians(lastSearch.lat), toRadians(stepEnd.lng) - toRadians(lastSearch.lng)) > 10000) {
                        lastSearch = stepEnd;
                        searchAt.push(lastSearch);
                    }
                }
                console.log('We search at:', searchAt);
                console.log('polyline.latLngs.b[0].b',polyline.latLngs.b[0].b);
                this.setState({checkpoints: searchAt});
                this.props.dispatch({type: 'SET_CHECKPOINTS', payload: searchAt});
                // searchAt.map((item,index) => <Marker key={index} position={item} />);
                // this.setState({markers: searchAt});
            } else {
                console.error(`error fetching directions ${result}`);
            }
        });
    }

    render () {

        return withScriptjs(
            withGoogleMap(
            ((props) => (<GoogleMap
                defaultZoom={8}
                defaultCenter={props.location}
            >
                {props.directions && <DirectionsRenderer directions={props.directions} />}
                {/* {props.checkpoints.map((checkpoint, index) => (
                    <Marker key={index} position={ checkpoint }/>)
                )} */}
                {/* these lines are giving me a 'Cannot call a class as a function' error */}
                {/* {props.markers} */}
                {/* <Marker position={{ lat: 41.590833, lng: -93.620833 }} /> */}
                {/* {JSON.stringify(this.props.reduxState)} */}
            </GoogleMap>
            ))));
    }
} //end class
     

export default connect()(MapComponent);