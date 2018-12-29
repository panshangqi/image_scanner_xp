import React, { Component } from 'react';
import {Modal, Button, Progress} from 'antd';
import './style.less';
import YQ from '@components/yq.jsx';
import ModalTitle from '@components/ModalTitle';

const electron = window.require('electron');
const {ipcRenderer, remote} = electron;


class StopScanDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            visible: false,
            students_num: props.students_num,
            total_scan_num: props.total_scan_num,
            cur_scan_num: props.cur_scan_num,
            absent_num: props.absent_num,
            cur_lose_num: props.cur_lose_num,
            error_num: -1,
            upload_end: false,
            btn_visible: true,
            percent: 0,
            error_msg: null,
            dialog_state: 0  //0 初始  1 上传  2 完成
        };
        this.handleCancel = this.handleCancel.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.onCertainStopClick = this.onCertainStopClick.bind(this);
    }
    componentDidMount(){
        var This = this;
        ipcRenderer.on('message-upload-recognize-result-data-progress', function (event, res) {
            console.log(res);
            This.setState({
                percent: res,
                error_msg: null
            })
            if(res == 100){
                This.setState({
                    dialog_state: 2,
                    error_msg: null
                })
            }
        })
        ipcRenderer.on('message-upload-recognize-result-data-fail', function (event, res) {
            console.log('网速异常' + res);
            This.setState({
                error_msg: '上传异常'
            })
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-upload-recognize-result-data-progress');
        ipcRenderer.removeAllListeners('message-upload-recognize-result-data-fail');
        this.setState = (state,callback)=>{
            return;
        };
    }
    showDialog(){
        var url = YQ.util.make_local_url('/checkout_stop');
        var This = this;
        YQ.http.get(url, {}, (res) => {
            if(res.type == 'AJAX'){
                console.log(res.data);
                This.setState({
                    students_num: res.data.all_stu_num,
                    total_scan_num: res.data.total_scan_num,
                    cur_scan_num: res.data.current_scan_num,
                    absent_num: res.data.absent_stus_num,
                    cur_lose_num: res.data.lack_stus_num,
                    error_num: res.data.error_count,
                    upload_end: res.data.upload_done,
                    percent: 0,
                    error_msg: null
                })
            }
        });
        this.setState({
            visible: true,
            percent: 0,
            dialog_state: 0
        });
    }
    hideDialog(){
        this.setState({
            visible: false
        })
    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    onCertainStopClick = (e) =>{
        this.setState({
            dialog_state: 1
        });
        ipcRenderer.send('message-upload-recognize-result-data','');
        if(typeof this.props.onCertainStopCallback === 'function'){
            this.props.onCertainStopCallback();
        }
    }
    onCancelUpload(){
        console.log('停止上传');
        this.hideDialog();
        ipcRenderer.send('message-upload-recognize-result-stop','');
    }
    onClearCache(){
        ipcRenderer.send('message-clear-cache','');
        window.location.href = '#/select_exam_subject';
    }
	progressBox(){
		if(this.state.dialog_state == 1 || this.state.dialog_state == 2) {
			return (
			    <div>
                    <Progress percent={this.state.percent} />
                </div>
            )
		}
	}
	cancelBox(){
	    if(this.state.dialog_state === 0){
	        return (
	            <div>
                    <Button
                        className="content_btn"
                        onClick={this.handleCancel}
                        style={{ marginLeft:100, marginRight: 35, display: this.state.btn_visible ? 'inline-block' : 'none'}}
                    >
                        暂不结束
                    </Button>
                    <Button
                        className="content_btn"
                        onClick={this.onCertainStopClick}
                        style={{ marginLeft:35, marginRight: 100, display: this.state.btn_visible ? 'inline-block' : 'none'}}
                        type="primary"
                        disabled={!(this.state.upload_end && this.state.error_num === 0)}
                    >
                        确认结束
                    </Button>
                </div>
            )
        }
		else if(this.state.dialog_state === 1){
			return(
				<div style={{ textAlign: 'center'}}>
					<Button
						className="content_btn"
						onClick={this.onCancelUpload.bind(this)}
					>
						取消
					</Button>
				</div>
			)
		}else if(this.state.dialog_state === 2){
			return(
				<div style={{ textAlign: 'center'}}>
					<Button
						className="content_btn"
						onClick={this.onClearCache.bind(this)}
                        type="primary"
					>
						完成
					</Button>
				</div>
			)
		}
	}
    render() {
        return (
            <Modal
                title={<ModalTitle title="本次扫描总结" />}
                visible={this.state.visible}
                closable={false}
                maskClosable={false}
                footer={null}
            >
                <div className="content">
                    <div style={{ display: this.state.error_num === 0 && this.state.upload_end ? 'block': 'none'}}>
                        <div className="line">
                            <label className="content_label">报名学生：</label>
                            <span className="content_span">{this.state.students_num} 人</span>
                            <label className="content_label">累计扫描：</label>
                            <span className="content_span">{this.state.total_scan_num} 人</span>
                            <label className="content_label">本次扫描：</label>
                            <span className="content_span">{this.state.cur_scan_num} 人</span>
                        </div>
                        <div className="line">
                            <label className="content_label">确认缺考：</label>
                            <span className="content_span">{this.state.absent_num} 人</span>
                            <label className="content_label">当前漏扫：</label>
                            <span className="content_span">{this.state.cur_lose_num} 人</span>
                        </div>
                        <div className="content_tip">
                            确认结束后，将清空已扫描各批次的图片信息；仍可扫描漏扫人员；不可修改已上传试卷信息。
                        </div>
                    </div>
                    <div className="content_tip" style={{ display: this.state.error_num === 0 ? 'none': 'block'}}>
                        尚未完成异常卡处理，请处理完成并等待上传完成后，再确认结束
                    </div>
                    <div className="content_tip"
                         style={{ display: this.state.error_num === 0 && !this.state.upload_end ? 'block': 'none'}}>
                        扫描尚未上传结束，请等待上传完成后，再确认结束
                    </div>
					{this.progressBox()}
					{this.cancelBox()}
                    <div className="error_tip">{this.state.error_msg}</div>
                </div>
            </Modal>
        );
    }
}
export default StopScanDialog;
