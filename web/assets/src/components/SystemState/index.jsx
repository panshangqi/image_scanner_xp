import React, { Component } from 'react';
import './style.less';
import {Modal, Button} from 'antd';
import YQ from '@components/yq'
import DriveSetting from '@components/DriveSetting'
import DirectorySetting from '@components/DirectorySetting'

const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const client_version = remote.app.getVersion();
const diskspace = window.require('diskspace')
const { exec } = window.require('child_process');

var DRIVE_MAP = {
    'Canon DR-6030C TWAIN': 'Canon DR-6030C USB',
    'Canon DR-M1060 TWAIN': 'Canon DR-M1060 USB',
    'Canon DR-G1100 TWAIN': 'CANON DR-G1100 USB',
    "ScanSnap IX500": "ScanSnap iX500"
}
class SystemState extends Component {
    constructor(props) {
        super(props);
        console.log("constructor");
        this.state = {
            driveState: false,  //设备状态
            disk: 0,  //磁盘状态
            network: 1,  //网络状态
            visible: false,
            installationPath: remote.app.getPath('exe'),  //安装路径
            savePath: '',  //保存路径
            spaceResidual: ''  //磁盘剩余
        }
    }
    componentDidMount = () => {
        /*YQ.http.post(url,function (res) {
            console.log(res);
            This.props.history.push('/home');
        })*/
        console.log('System State componentDidMount');
        var cache_pic = YQ.util.get_ini('picture');
        var This = this;
        YQ.event.on('event-drive-status', function (res) {
            console.log(res)
            if(res == 'ok'){
                This.setState({
                    driveState: true,
                })
            }else{
                This.setState({
                    driveState: false,
                })
            }
        })
        ipcRenderer.on('message-http-status', function (e, arg) {
            if(arg == 'ok'){
                This.setState({
                    network: 1
                })
            }else{
                This.setState({
                    network: 0
                })
            }
        })
        ipcRenderer.on('message-drive-connect-status-callback',function (e, arg) {
            if(arg === 'ok'){
                This.setState({
                    driveState: true,
                })
            }else{
                This.setState({
                    driveState: false,
                })
            }
        })

        this.setState({
            installationPath: remote.app.getPath('exe'),  //获取程序默认安装路径
            savePath: cache_pic  //获取数据存放路径
        })
        let _this = this;
        //查看磁盘空间状态
        console.log(cache_pic);
        var _arr = cache_pic.split(':');
        var Regx =  /^[A-Za-z]*$/;
        if(Regx.test(_arr[0])){
            diskspace.check(_arr[0],function (err,result) {
                if(!err){
                    var _space = result.free/(1024*1024*1024);
                    _this.setState({
                        spaceResidual: _space
                    })
                    console.log('磁盘空间：'+_space);
                }else{
                    console.log(err);
                }
            })
        }

        //检查驱动连接状态
        var drive_name = YQ.util.get_ini('drive');
        console.log(drive_name)
        var drive_usb = DRIVE_MAP[drive_name];
        exec("util.exe 1",{},function(err,data){
            console.log(data); //获取驱动设备列表 （设备管理器）
            var drive_list = JSON.parse(data);
            var success = false;
            for(var item of drive_list){
                console.log(drive_usb, item);
                if(drive_usb && drive_usb.toUpperCase() == item.toUpperCase()){
                    success = true;
                    break;
                }
            }
            if(success){
                This.setState({
                    driveState: true,
                })
            }
        });

        //获取电脑配置{ 客户端版本， 操作系统 （win7,win10），系统位数，CPU,  内存  }
        exec("util.exe 2", {} , function (err, data) {
            if(!err){
                console.log(data);
                YQ.util.set_ini('pc_config', data);
            }
        })

    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-drive-connect-status-callback');
        YQ.event.removeAllListeners('event-drive-status');
        this.setState = (state,callback)=>{
            return;
        };
    }
    onSetDriveClick = () => {
        this.refs.drive_set.showDialog();
    }
    onSetDirClick = () => {
        this.refs.dir_set.showDialog();
    }
    handleChangeDirectory = () =>{
        console.log('更改目录')
        electron.remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: "C:\\"
        }, (filenames)=>{
            console.log(filenames)
            YQ.util.set_ini('picture',filenames[0]);  //更改目录
            this.setState({
                savePath: YQ.util.get_ini('picture')  //获取数据存放路径
            })
        });

    }
    handleRemoveCaching = () =>{
        console.log('清除缓存')
    }
    handleCancel = () => {
        const _this = this;
        this.setState({
            visible: false
        })
        //查看磁盘空间状态
        diskspace.check('C',function (err,result) {
            if(!err){
                _this.setState({
                    spaceResidual: result.free/(1024*1024*1024)
                })
            }else{
                console.log(err);
            }
        })
    }
    render() {

        return (
            <div className="SystemState_wrap">
                <ul className="SystemState_list">
                    <li className="mg40">
                        {
                            this.state.driveState ?　(
                                <p className="SystemState_item"><i className="SystemState_icon_green"></i><span className="SystemState_text"> 设备：已连接</span></p>
                            ) : (
                                <p className="SystemState_item"><i className="SystemState_icon_red"></i>
                                    <span className="SystemState_text"> 设备：未连接
                                    <a className="to_setting_drive" href="javascript:;" onClick={this.onSetDriveClick.bind(this)}>去设置</a>
                                    </span>
                                </p>
                            )
                        }
                    </li>
                    <li className="mg40">
                        {
                            this.state.network ?　(
                                <p className="SystemState_item"><i className="SystemState_icon_green"></i><span className="SystemState_text"> 网络：已连接</span></p>
                            ) : (
                                <p className="SystemState_item"><i className="SystemState_icon_red"></i><span className="SystemState_text"> 网络：未连接</span></p>
                            )
                        }
                    </li>
                    <li>
                        {
                            this.state.spaceResidual > 4.9 ?　(
                                <p className="SystemState_item">
                                    <i className="SystemState_icon_green"></i>
                                    <span className="SystemState_text">
                                        磁盘：可用空间 {parseInt(this.state.spaceResidual)} G
                                        </span>
                                </p>
                            ) : (
                                <p className="SystemState_item">
                                    <i className="SystemState_icon_red"></i>
                                    <span className="SystemState_text"> 磁盘：磁盘空间不足5GB
                                        <a href="javascript:;" className="to_setting_drive" onClick={this.onSetDirClick.bind(this)}>去设置</a>
                                    </span>
                                </p>
                            )
                        }
                    </li>
                </ul>
                <DirectorySetting ref="dir_set"/>
                <DriveSetting ref="drive_set"/>
            </div>
        );
    }
}

export default SystemState;
