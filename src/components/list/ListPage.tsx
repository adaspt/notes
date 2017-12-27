import * as React from 'react';

export class ListPage extends React.Component {
    render() {
        return (
            <div className="card-columns">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-info">Note 1</h4>
                        <p className="card-text text-dark">Text</p>
                        <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-info">Note 2</h4>
                        <p className="card-text text-dark">Text</p>
                        <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                    </div>
                </div>
            </div>
        );
    }
}
