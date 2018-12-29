
import React, { Component } from 'react';
import { Modal, Button, Radio } from 'antd';
import './style.less';
import ModalTitle from '@components/ModalTitle'
const electron = window.require('electron');
const {remote, ipcRenderer} = electron;
const host = 'http://www.17zuoye.com';
import logo from '@imgs/logo.png'


class AboutInfoDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            version: remote.app.getVersion(),
            year: new Date().getFullYear()
        };
    }
    componentDidMount(){

    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    };
    showDialog() {
        this.setState({
            visible: true,
        });
    }
    hideDialog() {
        this.state({
            visible: false,
        });
    }
    render() {
        return (
            <Modal
                title={<ModalTitle title="关于" />}
                visible={this.state.visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div className="_dialog_content">
                    <img className="logo_pic" src={logo} />
                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 50}}>版本：</label>
                        <span className="_info_span" style={{ marginRight: 150}}>V{this.state.version}</span>
                    </div>
                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 50}}>官网：</label>
                        <span className="_info_span" style={{ marginRight: 150}}>
                            <a onClick={() => {ipcRenderer.send('message-open-17zuoye-url', host)}}>www.17zuoye.com</a>
                        </span>
                    </div>
                    <div className="_company_info">
                        Copyright (c) 2011-{this.state.year} 17zuoye Corporation. All Rights Reserved.
                    </div>
                    <Button className="_op_btn_box" type="primary" onClick={this.handleCancel} >关 闭</Button>
                </div>
                <div className="_dialog_foot">

                </div>
            </Modal>

        );
    }
}
export default AboutInfoDialog;
