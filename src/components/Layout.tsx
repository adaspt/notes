import * as React from 'react';
import { NavBar } from './NavBar';

export class Layout extends React.Component {
    render() {
        const { children } = this.props;
        return (
            <React.Fragment>
                <NavBar />
                <div className="container">
                    {children}
                </div>
            </React.Fragment>
        );
    }
}
