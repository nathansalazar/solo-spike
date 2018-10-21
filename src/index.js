import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';

const checkpoints = (state = [], action) => {
    switch (action.type) {
        case `SET_CHECKPOINTS`:
            return action.payload;
        default:
            return state;
    }
}

const storeInstance = createStore(combineReducers({checkpoints}));

ReactDOM.render(<Provider store={storeInstance}><App /></Provider>, document.getElementById('root'));

