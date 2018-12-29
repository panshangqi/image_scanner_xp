
import React, { Component } from 'react';
import {Link} from "react-router-dom";
import logo from './logo.svg';
import './App.less';
import $ from 'jquery';
import YQ from './compoments/yq'
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
console.log(remote.getGlobal('aliyun_url'));
class App extends Component {
    constructor(props) {
        super(props);
        console.log("constructor")
        //const electron = require('electron');


        /*
        yq.http.get("http://www.baidu.com",{},function (res) {
            console.log(res);
        })
         http://10.200.4.226:8888/scan_stat/123456
        */
        //console.log(process);
        var url = YQ.util.make_aliyun_url('/scan_stat/123456');
        YQ.http.get(url,{'username':'admin','passport':'admin'},function (res) {
            console.log(res);
        })

    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <div><Link to='/login'>登陆</Link></div>
                <div><Link to='/home'>home</Link></div>
                <div>{this.props.children}</div>
            </div>
        );
    }
}

export default App;
