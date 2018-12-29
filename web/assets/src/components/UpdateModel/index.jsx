
import React, { Component } from 'react';
import { Progress, Modal, Button, Spin, Icon} from 'antd';
import YQ from '@components/yq'
import './style.less';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const diskspace = window.require('diskspace');
import ModalTitle from '@components/ModalTitle'


class MultiModelDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            clearing: false,
            changeDir:false,
			UpdatePercent: 0,
            error_tip: '',
			title: ''
        };
        this.interval = null;
		this.showDialog = this.showDialog.bind(this);
    }
    componentDidMount(){
        var This = this;
        ipcRenderer.on('message-exam-subject-change-callback', function (event, arg) {
            console.log(arg);
            if(arg.msg === 'ok'){

                if(This.interval){
                    clearInterval(This.interval);
                    This.interval = null;
                }
                setTimeout(function () {

                    This.setState({
                        UpdatePercent: 100
                    })
                    setTimeout(function () {
                        This.setState({
                            visible: false
                        })
                    },500);
                },600);
            }else{
                This.setState({
                    UpdatePercent: 0,
                    error_tip: '更新失败'
                })
            }
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-exam-subject-change-callback')
        this.setState = (state,callback)=>{
            return;
        };
    }
	handleCancel = () => {
		const _this = this;
		this.setState({
			visible: false
		});
	};
    showDialog(title) {
    	console.log(title);
    	ipcRenderer.send('message-exam-subject-change','');
        this.setState({
            UpdatePercent: 0,
            visible: true,
			title: title,
            error_tip:''
        });
        var kk = 0;
        var This = this;
        this.interval = setInterval(function () {
            kk += 0.10;
            if(kk > 9){
                if(This.interval){
                    clearInterval(This.interval);
                    This.interval = null;
                }
            }
            This.setState({
                UpdatePercent: parseInt(kk*10)
            })
            //console.log('update progress '+kk);
        },60);
    }
    hideDialog() {
        this.state({
            visible: false,
        });
    }

    render() {
        return (
            <Modal
                title={<ModalTitle title={this.state.title}/>}
                visible={this.state.visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
			<div>
				<p>
					当前更新进度<span style={{color: '#FF796B',marginLeft:25 }}>{this.state.error_tip}</span>
				</p>
			</div>
            <div>
            	<Progress percent={this.state.UpdatePercent} showInfo={true}/>
            </div>
			<div className="button_box">
			</div>
            </Modal>
        );
    }
}
export default MultiModelDialog;
