
import React, { Component } from 'react';
import './style.less';

class PageContent extends Component {
    constructor(props) {
        super(props);
        console.log("constructor")

    }
    render() {
        return (
            <div className="page_content">
                {this.props.children}
            </div>
        );
    }
}

export default PageContent;
