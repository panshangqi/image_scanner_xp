
import React, { Component } from 'react';
import { Modal, Button, Radio } from 'antd';
const RadioGroup = Radio.Group;
import './style.less';
import YQ from '@components/yq.jsx'
import { Spin, Icon } from 'antd';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
import ModalTitle from '@components/ModalTitle'
class DriveSettingDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            now_speed: 0,
            expected_speed: 0,
            pic_rest: '-/-',
        };
        this.onStartTestClick = this.onStartTestClick.bind(this);
    }
    componentDidMount(){
        var This = this;
        ipcRenderer.on('message-net-speed-end', function (e, speed) {
            console.log(speed);
            var spd = parseInt(speed);
            var es = parseInt((60 * spd)/1200) + '张/分钟';
            if(spd < 1024){
                spd = spd + ' KB/s';
            }else{
                spd = parseFloat(spd/1000.0).toFixed(1) + ' MB/s';
            }

            This.setState({
                now_speed: spd,
                expected_speed:es
            })
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-net-speed-end');
        this.setState = (state,callback)=>{
            return;
        };
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
    onStartTestClick(){
        console.log('start test speed');
    }

    showDialog() {
        var This = this;
        ipcRenderer.send('message-net-speed-start','');
        this.setState({
            visible: true,
            now_speed: 0,
            expected_speed:0,
            pic_rest:0
        });
        //get_net_speed
        var _url = YQ.util.make_local_url('/get_net_speed');
        YQ.http.get(_url,{},function (res) {
            console.log(res);
            if(res.type === 'AJAX'){
                console.log(res);
                var pic_count = res.data + ' 张';
                This.setState({
                    pic_rest: pic_count
                })
            }
        })

    }
    hideDialog() {
        this.state({
            visible: false
        });
    }
    render() {
        return (
            <Modal
                title={<ModalTitle title="网速测试工具" />}
                visible={this.state.visible}
                maskClosable={false}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={null}
            >
                <div className="_dialog_content">

                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 130}}>当前网络上传速度：</label>
                        <span className="_info_span" style={{ marginRight: 70}}>
                            {
                                this.state.now_speed === 0 ? (
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 20 }} spin />} />
                                ):(
                                    this.state.now_speed
                                )
                            }
                        </span>
                    </div>

                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 100}}>预计上传速度：</label>
                        <span className="_info_span" style={{ marginRight: 100}}>
                            {
                                this.state.expected_speed === 0 ? (
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 20 }} spin />} />
                                ):(
                                    this.state.expected_speed
                                )
                            }
                        </span>
                    </div>

                    <div className="_line_info">
                        <label className="_info_label" style={{ width: 90}}>待上传图片：</label>
                        <span className="_info_span" style={{ marginRight: 110}}>
                            {
                                this.state.pic_rest === 0?(
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 20 }} spin />} />
                                ):(
                                    this.state.pic_rest
                                )
                            }
                        </span>
                    </div>
                    <Button className="_op_btn_box" type="primary" onClick={this.handleCancel} >关闭</Button>
                </div>
            </Modal>

        );
    }
}
export default DriveSettingDialog;
