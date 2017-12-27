import * as React from 'react';
import { Link } from 'react-router-dom';

export class NavBar extends React.Component {
    render() {
        return (
            <nav className="navbar fixed-top navbar-dark bg-primary mb-3">
                <div className="container">
                    <Link className="navbar-brand mb-0 h1" to="/">
                        <i className="fa fa-sticky-note-o" /> Notes
                    </Link>
                    <ul className="navbar-nav mr-auto">
                        Categories
                    </ul>
                    <button className="btn btn-success" type="button">
                        <i className="fa fa-plus" /> New
                    </button>
                </div>
            </nav>
        );
    }
}
