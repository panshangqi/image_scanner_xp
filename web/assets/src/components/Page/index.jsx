
import React, { Component } from 'react';
import {Link} from 'react-router-dom';


import { Button, message, Popconfirm } from 'antd';
import './style.less';

// const electron = window.require('electron');
// const {ipcRenderer, remote} = electron;
// var client_version = remote.app.getVersion();
class Header extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <div className="page_base_html">
                {this.props.children}
            </div>
        );
    }
}
export default Header;
