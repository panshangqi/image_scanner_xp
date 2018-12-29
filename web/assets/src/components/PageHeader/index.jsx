
import React, { Component } from 'react';
import { Menu, Dropdown, Icon } from 'antd';
// import UpdateModel from '@components/UpdateModel'
// import DriveSetting from '@components/DriveSetting'
// import NetSpeedCheck from '@components/NetSpeedCheck'
// import ScanSpeedCheck from '@components/ScanSpeedCheck'
// import DirectorySetting from '@components/DirectorySetting'
// import ThresholdSetting from '@components/ThresholdSetting'
// import AboutInfo from '@components/AboutInfo'
// import FeedBack from '@components/FeedBack'
import './style.less';
import icon_max_cancel from '@imgs/max_cancel.svg'
import icon_close from '@imgs/close.svg'
import icon_maxsize from '@imgs/maxsize.svg'
import icon_minisize from '@imgs/minisize.svg'
import icon_setting from '@imgs/setting.svg'
import icon_logo from '@imgs/17logo.png'
// import YQ from '@components/yq.jsx';
// const electron = window.require('electron');
// const {ipcRenderer, remote} = electron;


class PageHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxwindow: ''//remote.getGlobal('sharedObject').max_window,
        }
        // this.onLoadMenu = this.onLoadMenu.bind(this);
        // this.onSettingClick = this.onSettingClick.bind(this);
        // this.onMaxiWindow = this.onMaxiWindow.bind(this);
        // this.onCloseWindow = this.onCloseWindow.bind(this);
        // console.log(window.location.href);
        // this.tail_route = YQ.util.get_tail_route(window.location.href);
        // this.routes = ['template_upload','paper_upload','homework_upload'];
        // if(this.tail_route === 'paper_upload'){
        //     console.log('开启识别模式')
        // }else{
        //     console.log('关闭识别模式')
        // }
    }
    onSettingClick(e){
        // {/*<Menu.Item key="1">更新考生名单</Menu.Item>*/}
        // {/*<Menu.Item key="2">更新模板</Menu.Item>*/}
        // {/*<Menu.Item key="3">网络测速工具</Menu.Item>*/}
        // {/*<Menu.Item key="4">扫描测速工具</Menu.Item>*/}
        // {/*<Menu.Item key="5">目录查看工具</Menu.Item>*/}
        // {/*<Menu.Item key="6">关于</Menu.Item>*/}
        // {/*<Menu.Item key="7">退出</Menu.Item>*/}
		// var title = ''
        // if (e.key === "0") {
        //     this.refs.drive_dlg.showDialog();
        // } else if (e.key === "1"){
		// 	title = '更新考生名单'
        //     this.refs.update_model.showDialog(title);
        //     // ipcRenderer.send('message-window-close','');
        // } else if (e.key === "2") {
		// 	title='同步模板数据'
        //     this.refs.update_model.showDialog(title);
        //     // ipcRenderer.send('message-window-close','');
        // } else if (e.key === "3") {
        //     this.refs.net_speed_dlg.showDialog();
        //
        // } else if (e.key === "4") {
        //     this.refs.scan_speed_dlg.showDialog()
        // } else if (e.key === "5") {
        //     this.refs.directory_dlg.showDialog();
        // } else if (e.key === "6") {
        //     this.refs.about_dlg.showDialog();
        //
        // }else if (e.key === "7") {
        //     ipcRenderer.send('message-window-close','');
        // }else if (e.key === "8") {
        //     this.refs.threshold_dlg.showDialog();
        // }else if(e.key === "9"){
        //     this.refs.feedback_dlg.showDialog();
        // }
    }
    onMinWindow(){
        ipcRenderer.send('message-window-min','');
    }
    onMaxiWindow(){
        if(this.state.maxwindow === false){
            remote.getGlobal('sharedObject').max_window = true;
            this.setState({maxwindow: true});
            ipcRenderer.send('message-window-maxi','');
        }else{
            remote.getGlobal('sharedObject').max_window = false;
            this.setState({maxwindow: false});
            ipcRenderer.send('message-window-unmaxi','');
        }

    }
    onCloseWindow(){
        //ipcRenderer.send('message-window-hide','');
    }
    onAddMenu(){
        console.log('路由:'+this.tail_route)
        var arr = []
        // if(this.routes.indexOf(this.tail_route)!=-1){
        //     arr.push((
        //         <Menu.Item key="0">驱动设置</Menu.Item>
        //     ))
        //     if(this.tail_route == 'paper_upload'){
        //         arr.push((
        //             <Menu.Item key="1">更新考生名单</Menu.Item>
        //         ))
        //         arr.push((
        //             <Menu.Item key="2">同步模板数据</Menu.Item>
        //         ))
        //         arr.push((
        //             <Menu.Item key="3">网络测速工具</Menu.Item>
        //         ))
        //         arr.push((
        //             <Menu.Item key="4">扫描测速工具</Menu.Item>
        //         ))
        //         arr.push((
        //             <Menu.Item key="8">识别参数调整</Menu.Item>
        //         ))
        //     }
        //     arr.push((
        //         <Menu.Item key="5">目录查看工具</Menu.Item>
        //     ))
        // }
        // arr.push((
        //     <Menu.Item key="6" style={{width:110}}>关于</Menu.Item>
        // ))
        //
        // if(this.tail_route !== '' && this.tail_route !== 'login') {
        //     arr.push((
        //         <Menu.Item key="9" style={{width: 110}}>问题反馈</Menu.Item>
        //     ))
        // }
        // arr.push((
        //     <Menu.Item key="7">退出</Menu.Item>
        // ))
        return arr;
    }
    onLoadMenu(){
        return (
            <Menu onClick={this.onSettingClick}>
                {this.onAddMenu()}
            </Menu>
        );
    }
    render() {
        return (
            <div className="page_head">

                <div className="app_logo">
                    <img src={icon_logo}/>
                </div>
                <div className="windows_btns">
                    <div className="win_btn">
                        <Dropdown
                            overlay={this.onLoadMenu()}
                            trigger={['click']}
                        >
                            <a className="ant-dropdown-link" href="#">
                                <img src={icon_setting}/>
                            </a>
                        </Dropdown>
                    </div>
                    <div className="win_btn" onClick={this.onMinWindow}>
                        <img src={icon_minisize}/>
                    </div>
                    <div className="win_btn">
                        <img src={this.state.maxwindow?icon_max_cancel:icon_maxsize} onClick={this.onMaxiWindow}/>
                    </div>
                    <div className="win_btn">
                        <img src={icon_close} onClick={this.onCloseWindow}/>
                    </div>
                </div>

                <div style={{"display": "flex"}}>
                    <div>{this.props.children}</div>
                </div>
            </div>
        );
    }
}

export default PageHeader;
