
import React, { Component } from 'react';
import { Modal, Button, Radio } from 'antd';

import './style.less';
// import YQ from '@components/yq.jsx'
// import $ from 'jquery'
//
// const RadioGroup = Radio.Group;
// const electron = window.require('electron');
// const {ipcRenderer, remote} = electron;
// const { exec } = window.require('child_process');
//
var client_version = '121.0.0'//remote.app.getVersion();
class AppVersion extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){

    }
    componentWillUnmount(){

    }
    onOpenDownload(){
        // var _url = YQ.util.make_aliyun_url('/client/last_version');
        // YQ.http.get(_url,{},function (res) {
        //     console.log(res);
        //     if(res.type === 'AJAX'){
        //         //https://download.microsoft.com/download/1/6/7/167F0D79-9317-48AE-AEDB-17120579F8E2/NDP451-KB2858728-x86-x64-AllOS-ENU.exe
        //         ipcRenderer.send('message-open-17zuoye-url', res.body.url);
        //     }else{
        //         YQ.util.warning('服务器访问失败,请检查网络连接...');
        //     }
        // })

    }
    render() {
        return (
            <div className="_app_version_com">
                当前客户端版本 {client_version}<a onClick={this.onOpenDownload.bind(this)}>下载最新版本</a>
            </div>
        );
    }
}
export default AppVersion;
