
import React, { Component } from 'react';
import { Modal, Button, Radio, Icon, Spin } from 'antd';

import './style.less';
import YQ from '@components/yq.jsx'
import $ from 'jquery'
import ModalTitle from '@components/ModalTitle'

const RadioGroup = Radio.Group;
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const { exec } = window.require('child_process');


class DriveSettingDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            visible: false,
            default_drive:'',
            drive_list:[]
        }
        this.handleCancel = this.handleCancel.bind(this);
        this.onRadioChange = this.onRadioChange.bind(this);
        this.onSeniorSettingClick = this.onSeniorSettingClick.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.connectStatus = this.connectStatus.bind(this);
        this.onSetDefultClick = this.onSetDefultClick.bind(this)
    }
    componentDidMount(){

        console.log("DriveSetting componentDidMount");
    }
    connectStatus(arg){
        var This  = this;
        $('.loading_spin').hide();
        if(arg.indexOf('CONNECT_SUCCESS') != -1){
            console.log('连接成功1')
            YQ.event.emit('event-drive-status', "ok")
            setTimeout(function () {
                This.setState({
                    visible: false
                });
            }, 200)
        }else{
            console.log('连接失败')
            YQ.event.emit('event-drive-status', "fail")
            var index = This.state.drive_list.indexOf(This.state.default_drive);
            $('#loading_state_'+index).show();
        }
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    showDialog(){
        $('.loading_spin').hide();
        $('.loading_state').hide();
        var drive_list = ['ScanSnap IX500']
        this.setState({
            visible: true,
            drive_list: drive_list
        })
        //获取驱动列表 执行获取驱动的命令，然后TwainDriver.exe 会向主程序发送http请求，
        //告诉主程序，然后主程序执行message-drive-list 消息
        var _this = this;
        exec("TwainDriver.exe 4",{},function(err,data){
            var all_drives = YQ.util.get_ini('drive_list');
            all_drives = JSON.parse(all_drives);

            if(all_drives && $.isArray(all_drives)){
                all_drives = drive_list.concat(all_drives)
                console.log(all_drives, YQ.util.get_ini('drive'));
                _this.setState({
                    default_drive: YQ.util.get_ini('drive'),
                    drive_list: all_drives
                })
            }
        });


    }
    hideDialog(){
        this.setState({
            visible: false
        })
    }
    onSetDefultClick = (e) => {
        var index = this.state.drive_list.indexOf(this.state.default_drive);

        $('.loading_spin').hide();
        $('.loading_state').hide();
        $('#loading'+index).show();
        console.log(index);
        YQ.util.set_ini('drive', this.state.default_drive);

        var This = this;
        if(this.state.default_drive === 'ScanSnap IX500'){
            var flag = 'ScanSnap IX500 startup success';
            exec("util.exe 6",{},function(err,data){
                console.log(err, data);
                if(data.indexOf(flag) !== -1){
                    This.connectStatus("CONNECT_SUCCESS");

                }else{
                    This.connectStatus("CONNECT_FAIL");
                }
            });
        }else{
            console.log('message-check-drive-connect-state');
            exec(`"TwainDriver.exe" 1`, {}, function (err, data) {

                console.log('connect status: ' + data);
                This.connectStatus(data);
            });
        }
    }
    //高级驱动设置
    onSeniorSettingClick = (e) =>{

        exec("TwainDriver.exe 2",{},function(err,data){

        });
    }
    handleOk = (e) => {

        this.setState({
            visible: false,
        });
    }
    handleCancel = (e) => {

        this.setState({
            visible: false,
        });
    }
    onRadioChange = (e) => {
        var This = this;
        this.setState({
            default_drive: e.target.value
        },function () {
            YQ.util.set_ini('drive', This.state.default_drive);
        })

    }
    render() {
        var This = this;
        return (
            <Modal
                title={<ModalTitle title="驱动设置" />}
                visible={this.state.visible}
                onOk={this.handleOk}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div id="drive_setting_dialog">
                    <div className="_dialog_content">
                        <div className="_drive_list_box">
                            <RadioGroup onChange={this.onRadioChange} value={this.state.default_drive}>
                                {
                                    this.state.drive_list.map(function(item, index){
                                        return (
                                            <div key={item+index} style={{ height: 30}}>
                                                <Radio value={item} key={item+index}>{item}</Radio>
                                                <span id={"loading"+index} className="loading_spin" style={{ display: 'none'}} >
                                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 20 }} spin />} />
                                                </span>
                                                <span id={"loading_state_" + index} className="loading_state"  style={{ display: 'none',color: '#FF796B'}}>连接失败</span>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                        <div className="_op_btn_box" >
                            <Button onClick={this.onSetDefultClick} type="primary" style={{width:120}}>设为默认驱动</Button>
                            <Button onClick={this.onSeniorSettingClick} type="primary" style={{width:120, marginTop:10}}>高级设置</Button>
                            <Button onClick={this.handleCancel} style={{width:120, marginTop:10}}>返回</Button>
                        </div>
                    </div>
                    <div className="_dialog_foot">

                    </div>
                </div>
            </Modal>
        );
    }
}
export default DriveSettingDialog;
