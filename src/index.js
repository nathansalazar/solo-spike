import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {combineReducers, createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import axios from 'axios';
import createSagaMiddleware from 'redux-saga';
import {takeEvery, put} from 'redux-saga/effects';

let radius=10000;

let pythagorean = (a, b) => {
    return Math.sqrt(a * a + b * b) * 6371000;
}
let toRadians = (degrees) => {
    return degrees*Math.PI/180;
}

function* saga () {
    yield takeEvery('SEARCH_PLAYGROUNDS', searchParks);
}

function* searchParks (action) {
    try{
        const playgroundObject = yield axios.get(`https://cors.io/?https://maps.googleapis.com/maps/api/place/textsearch/json?query=playgrounds&location=${action.payload.lat},${action.payload.lng}&radius=${action.radius}&key=AIzaSyBDKdBqDqbNQtLtmUGZkAlZhdiPzTbs1eY`);
        const allInfoOnPlaygrounds = playgroundObject.data.results;
        //allInfoOnPlaygrounds is an array of objects with a ton of properties,
        //most of which we don't care about. So we trim down to just what we need
        let playgrounds;
        if(allInfoOnPlaygrounds.length>0){
            playgrounds = allInfoOnPlaygrounds.map(playground => ({name: playground.name, location: playground.geometry.location}) );
        }
        let filteredPlaygrounds = playgrounds.filter( pg => pythagorean(  toRadians(pg.location.lat)-toRadians(action.payload.lat), toRadians(pg.location.lng) - toRadians(action.payload.lng) ) < action.radius );
        console.log(`We searched at (${action.payload.lat},${action.payload.lng}) and found:`,filteredPlaygrounds);
        yield put({type: 'SET_PLAYGROUNDS', payload: filteredPlaygrounds});
    } catch (error) {
        console.log('Error in searchParks:',error);
    }
}

const sagaMiddleware = createSagaMiddleware();

const checkpoints = (state = [], action) => {
    switch (action.type) {
        case `SET_CHECKPOINTS`:
            return action.payload;
        default:
            return state;
    }
}

const playgrounds = (state=[], action) => {
    switch (action.type) {
        case 'SET_PLAYGROUNDS':
            return [...state, ...action.payload];
        case `CLEAR_PLAYGROUNDS`:
            return [];
        default:
            return state;
    }
}

//This is here cause I was trying to keep track of those checkpoints with no results
// const playgroundsAs2DArray = (state=[[]],action) => {
//     switch (action.type) {
//         case 'SET_PLAYGROUNDS':
//             return [...state, action.payload];
//     //the 'playgroundsAs2DArray' property of the redux store is an array of arrays, 
//     //where each inner array corresponds to the search results near a searchpoint
//     //Hence, 'playgrounds.length' should equal the number of searchPoints regardless
//     //of whether or not anything was returned from the search
//         case 'CLEAR_PLAYGROUNDS':
//             return [];
//         default:
//             return state;
//     }
// }

const route = (state=[{origin: 'minneapolis, mn', destination: 'des moines, ia', radius: 10000}], action) => {
    switch (action.type) {
        case 'SET_ROUTE':
            return [...state, action.payload];
        default:
            return state;
    }
}

const storeInstance = createStore(
    combineReducers({route,checkpoints, playgrounds}), 
    applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga);

ReactDOM.render(<Provider store={storeInstance}><App /></Provider>, document.getElementById('root'));

