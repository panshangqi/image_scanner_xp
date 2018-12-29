
import React, { Component } from 'react';
import { Modal, Button, Radio, Input , message, Select } from 'antd';

import './style.less';
import YQ from '@components/yq.jsx'
import $ from 'jquery'
import ModalTitle from '@components/ModalTitle'

const RadioGroup = Radio.Group;
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const { TextArea } = Input;
const Option = Select.Option;

class FeedBackDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            visible: false,
            detail:'',
            drive_list:[],
            contact_type: 'QQ',
            contack_number: null
        }
        this.handleCancel = this.handleCancel.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.textOnChange = this.textOnChange.bind(this);
        this.selectChange = this.selectChange.bind(this)
        this.inputChange = this.inputChange.bind(this)

    }
    componentDidMount(){

    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    showDialog(){
        this.setState({
            visible: true
        });

    }
    hideDialog(){
        this.setState({
            visible: false
        })
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
    textOnChange(e){
        this.setState({
            detail: e.target.value
        })
    }
    selectChange(value){
        console.log(value);
        this.setState({
            contact_type: value
        })
    }
    inputChange(e){
        this.setState({
            contact_number: e.target.value
        })
    }
    submitClick(){
        console.log(this.state.detail)
        console.log(this.state.contact_type)
        console.log(this.state.contact_number)
        if(this.state.detail.length < 5){
            message.config({
                duration: 1
            })
            message.warning('输入内容不能少于5个字')
            return;
        }
        var params = {
            detail: this.state.detail,
            contact_type: this.state.contact_type,
            contact_number: this.state.contact_number
        }
        ipcRenderer.send('message-submit-feedback',params);
        this.handleCancel()
        message.config({
            duration: 1,
        })
        this.setState({
            detail:''
        })
        message.success('提交成功');
    }
    render() {
        var This = this;
        return (
            <Modal
                title={<ModalTitle title="问题反馈" />}
                visible={this.state.visible}
                onOk={this.handleOk}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div id="_feedback_dialog">
                    <div>问题描述： <span style={{color:"#ff0000"}}>*</span></div>
                    <div style={{marginTop:10}}>
                        <TextArea rows={5} onChange={this.textOnChange} value={this.state.detail}/>
                    </div>
                    <div style={{marginTop:10, display: 'none'}}>联系方式：</div>
                    <div style={{marginTop:10, display: 'none'}}>
                        <Input placeholder="请填写联系方式" style={{width:240,marginRight:15}} onChange={this.inputChange}/>
                        <Select
                            showSearch
                            style={{ width: 100 }}
                            placeholder="联系方式"
                            optionFilterProp="children"
                            onChange={this.selectChange}
                            value={this.state.contact_type}
                        >
                            <Option value="QQ">QQ</Option>
                            <Option value="微信">微信</Option>
                        </Select>
                    </div>
                    <div style={{ textAlign:'center'}}>
                        <Button type="primary" style={{width:120,marginTop: 20}} onClick={this.submitClick.bind(this)}>提 交</Button>
                    </div>
                </div>
            </Modal>
        );
    }
}
export default FeedBackDialog;
