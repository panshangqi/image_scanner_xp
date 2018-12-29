
import React, { Component } from 'react';
import { Progress, Button } from 'antd';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const { exec } = window.require('child_process');
var client_version = remote.app.getVersion();
import './style.less';
import YQ from '@components/yq'
import icon_close from '@imgs/close.svg'
import icon_logo from '@imgs/17logo.png'
import sm_logo from '@imgs/sm_logo.svg'

class AppUpdate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressVisible: 'none',
            cancelBtnVisible: 'inline',
            okBtnVisible: 'inline',
            cancelName: '暂不升级',
            okName: '立即升级',
            downloading: 0,   //0 start 1 downing 2 downloaded
            downloadPercent: 0,
            speed:0,
            update_tip:[],
            latest_version: client_version,
            latest_size: 0
        }
        console.log(window.location.href);
        this.onRenderFooter = this.onRenderFooter.bind(this);
        this.updateTip = this.updateTip.bind(this);
        this.onWindowClose = this.onWindowClose.bind(this)
    }
    componentDidMount(){
        var This = this;
        var update_tip = YQ.util.get_ini('update_tip');
        var update_info = YQ.util.get_ini('update_info');
        console.log(update_tip);
        console.log(update_info);
        var _size = update_info.size;
        _size = parseInt(_size/(1024.0*1024)) + 'MB';
        this.setState({
            update_tip: update_tip.update_desc,
            latest_version: update_info.latestVersion,
            latest_size: _size
        })
        ipcRenderer.on('message-download-progress', function (event, data) {
            console.log(data);
            var _cur_progress = parseInt(data.percent);
            var _speed = parseInt(data.bytesPerSecond/1000.0);
            This.setState({
                downloadPercent: _cur_progress,
                speed: _speed
            })
            //{bytesPerSecond: 173206, delta: 170820, percent: 0.8224354816529318, total: 66718425, transferred: 548716}
        })
        ipcRenderer.on('message-download-end', function (event) {
            console.log('message_down end');
            This.setState({
                downloadPercent: 100,
                downloading: 2
            })
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-download-progress')
        ipcRenderer.removeAllListeners('message-download-end')
        this.setState = (state,callback)=>{
            return;
        };
    }
    updateTip(){
        var arr = [];
        for(var i=0;i<this.state.update_tip.length;i++){
            var _indx = i + 1;
            arr.push((
                <div key={_indx + 'tip'}>{_indx}、{this.state.update_tip[i]}</div>
            ))
        }
        return arr;
    }
    onCancelUpdate(){
        ipcRenderer.send('message-update-win-close','');
    }
    //立即更新
    onCertainUpdate(){
        console.log('update update');
        this.setState({
            downloading: 1,
            progressVisible: 'block',
        })
        ipcRenderer.send('message-update-start-download','');
    }
    //取消下载
    onCancelDownload(){
        ipcRenderer.send('message-update-win-close','');
    }
    //开始安装
    onStartInstall(){
        ipcRenderer.send('message-update-start-install','');
    }
    onWindowClose(){
        ipcRenderer.send('message-update-win-close','');
    }
    onRenderFooter(){
        if(this.state.downloading === 0) {
            return (
                <div>
                    <Button
                        onClick={this.onCancelUpdate.bind(this)}
                    >
                        暂不升级
                    </Button>
                    <Button
                        onClick={this.onCertainUpdate.bind(this)}
                        style={{marginLeft:20}}
                        type="primary"
                    >
                        立即升级
                    </Button>
                </div>
            )
        }else if(this.state.downloading == 1){
            return (
                <div>
                    <Button
                        onClick={this.onCancelDownload.bind(this)}
                    >
                        取消下载
                    </Button>
                </div>
            )
        }else if(this.state.downloading == 2){
            return (
                <div>
                    <Button
                        onClick={this.onStartInstall.bind(this)}
                        type="primary"
                    >
                        开始安装
                    </Button>
                </div>
            )
        }
    }
    render() {
        return (
            <div className="_app_update_com">
                <div className="_header">
                    <span><img src={sm_logo} style={{width:12}}/>客户端升级提示</span>
                    <img src={icon_close} onClick={this.onWindowClose}/>
                </div>
                <div className="_content">
                    <div> 当前版本V{client_version}, 最新版V{this.state.latest_version} (升级包: {this.state.latest_size})</div>
                    <div style={{marginTop: 6}}>新版说明：</div>
                    <div>{this.updateTip()}</div>
                </div>
                <div className="_progress" style={{display: this.state.progressVisible}}>
                    <Progress percent={this.state.downloadPercent} showInfo={false}/>
                    <div className="_tip">
                        <span>下载进度：<label className="_percent">{this.state.downloadPercent} %</label></span>
                        {
                            this.state.downloading == 2 ? (
                                <span className="download-success">下载完成</span>
                            ):(
                                <span>下载速度：<label className="_speed">{this.state.speed} KB/s</label></span>
                            )
                        }

                    </div>
                </div>
                <div className="_footer">
                    { this.onRenderFooter() }
                </div>
            </div>
        );
    }
}
export default AppUpdate;
