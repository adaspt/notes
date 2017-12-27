// tslint:disable no-string-literal
import { createStore, applyMiddleware, Store as ReduxStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { State } from './model';
import rootReducer from './reducers';

export interface Store extends ReduxStore<State> {
    close(): typeof END;
}

export default function configureStore() {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    ) as Store;

    if (module['hot']) {
        module['hot'].accept('./reducers', () => {
            const nextRootReducer = require('./reducers').default;
            store.replaceReducer(nextRootReducer);
        });
    }

    store.close = () => store.dispatch(END);

    return store;
}
