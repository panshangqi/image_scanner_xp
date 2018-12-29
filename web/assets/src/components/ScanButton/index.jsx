
import React, { Component } from 'react';
import './style.less';
import { Modal } from 'antd';
import icon_scanning from '@imgs/scanning.gif'
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
import YQ from '@components/yq'
const { exec } = window.require('child_process');

/*
scan_modal 扫描模式
0： 系统答题卡
1： 第三方答题卡作答试卷
2： 第三方答题卡模板
 */
import Global from '@fx/General.jsx';

class ScanButton extends Component {
    constructor(props) {
        super(props);
        console.log('扫描按钮')
        console.log(props)
        this.state={
            button_name:'开始扫描',
        }
        this.onClickBtn = this.onClickBtn.bind(this);
        this.onScanEnd = this.onScanEnd.bind(this);
        this.onStartScan = this.onStartScan.bind(this);
    }
    componentDidMount(){
        var _this = this;
        ipcRenderer.on('message-end-scan' ,function(e, arg){
            _this.onScanEnd();
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-end-scan');
        this.setState = (state,callback)=>{
            return;
        };
    }
    onStartScan(){
        var _this = this;
        if(this.props.onStartScan && typeof this.props.onStartScan === 'function')
        {
            this.props.onStartScan();
        }
        this.setState({
            button_name: '正在扫描',
        })
        //ipcRenderer.send('message-start-scan', 'true');
        var drive_default = YQ.util.get_ini('drive');
        if(drive_default == 'ScanSnap IX500'){
            exec(`util.exe 4`, {}, function (err, data) {
                _this.onScanEnd();
            });
        }else{
            exec(`TwainDriver.exe 0`, {}, function (err, data) {
                _this.onScanEnd();
            });
        }
    }
    onClickBtn(){
        var _this = this;
        if(this.state.button_name == '开始扫描'){

            console.log(Global.scan_number + '/' + Global.limit_number)
            if(Global.scan_number > Global.limit_number){
                Modal.confirm({
                    title: '提示',
                    content: '继续扫描可能会变慢，建议先上传数据',
                    okText: '继续扫描',
                    cancelText: '暂不扫描',
                    onOk: function () {
                        _this.onStartScan();
                    }
                });
            }
            else{
                this.onStartScan();
            }

        }
    }
    onScanEnd(){
        this.setState({
            button_name: '开始扫描',
        })
        if(this.props.onEndScan && typeof this.props.onEndScan === 'function')
        {
            this.props.onEndScan();
        }
    }

    render() {
        var _style = this.props.style || {};
        _style['backgroundColor'] = '#13D469';
        return (
            <button className="_scan_button_com"
                    style={_style}
                    onClick={this.onClickBtn}
            >

                    <img src={icon_scanning} style={{ display: this.state.button_name ==='正在扫描'?'inline-block': 'none'}} className="_img_scanning" />
                    {this.state.button_name}
            </button>
        );
    }
}
export default ScanButton;
