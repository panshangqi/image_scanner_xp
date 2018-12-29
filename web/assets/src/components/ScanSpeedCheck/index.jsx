import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import ModalTitle from '@components/ModalTitle';
import YQ from '@components/yq';
import './style.less';


class ScanSpeedCheck extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            total_time: '0',
            scan_count: '0',
            scan_speed: '0',
        };
    }

    componentDidMount(){

    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }

    showDialog() {
        var _this = this;
        var _url = YQ.util.make_local_url('/get_scan_speed');
        YQ.http.get(_url,{},function (res) {
            console.log(res);
            var all_time = parseInt(res.data.all_time);
            if(all_time == 0){
                all_time = '0 分钟';
            }
            else if(all_time < 60){
                all_time = all_time + ' 秒钟';
            }else if(all_time >=60){
                var rem = all_time % 60;
                if(all_time % 60 <10){
                    all_time = parseInt(all_time/60.0) + ' 分钟';
                }else{
                    all_time = parseInt(all_time/60.0) + ' 分钟 ';
                    all_time += rem + ' 秒';
                }
            }
            _this.setState({
                total_time: all_time,
                scan_count: (res.data.all_scan_num >0 ? res.data.all_scan_num : '0'),
                scan_speed: (res.data.scan_speed >0 ? res.data.scan_speed : '0'),
            })
        })
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
                title={<ModalTitle title="扫描测速工具" />}
                visible={this.state.visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div className="_dialog_content">
                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 130}}>今日扫描累计时长：</label>
                        <span className="_info_span" style={{ marginRight: 70}}>{this.state.total_time}</span>
                    </div>
                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 65}}>已扫描：</label>
                        <span className="_info_span" style={{ marginRight: 135}}>{this.state.scan_count} 张</span>
                    </div>
                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 78}}>扫描速度：</label>
                        <span className="_info_span" style={{ marginRight: 122}}>{this.state.scan_speed} 张/分钟</span>
                    </div>
                    <Button className="_op_btn_box" type="primary" onClick={this.handleCancel} >取消</Button>
                </div>
            </Modal>

        );
    }
}

export default ScanSpeedCheck;
