import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from './store';
import { Layout } from './components/Layout';
import { ListPage } from './components/list/ListPage';

interface Props {
    store: Store;
}

class App extends React.Component<Props> {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <Router>
                    <Layout>
                        <Route path="/:category?" exact={true} component={ListPage} />
                    </Layout>
                </Router>
            </Provider>
        );
    }
}

export default App;
