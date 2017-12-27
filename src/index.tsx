import * as React from 'react';
import * as ReactDOM from 'react-dom';
import configureStore from './store';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const store = configureStore();

ReactDOM.render(
    <App store={store} />,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
