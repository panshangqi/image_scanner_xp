import React, { Component } from 'react';
import {Modal, Button, Slider, Icon} from 'antd';
import './style.less';
import YQ from '@components/yq.jsx';
import ModalTitle from '@components/ModalTitle';

const electron = window.require('electron');
const {ipcRenderer, remote} = electron;

class ThresholdSetting extends Component {
    constructor(props) {
        super(props);

        this.state={
            visible: false,
            slider_value: 0,
            btn_name:'',
            object_count: 0
        };

        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.cancelHandle = this.cancelHandle.bind(this);
        this.sliderChangeHandle = this.sliderChangeHandle.bind(this);
    }
    componentDidMount(){
        var This = this;
        ipcRenderer.on('message-change-threshold-value-callback',(event, data) => {
            console.log(data);
            if(data.type != 'ERROR'){
                setTimeout(function () {
                    This.setState({
                        dlg_status: 3,
                        object_count: data.count
                    })
                },1000);
            }else{
                setTimeout(function () {
                    This.setState({
                        dlg_status: 1
                    })
                },800)
            }

        })
        ipcRenderer.on('message-get-objective-no-count-callback',(event, data) => {
            console.log(data);
            if(data.type != 'ERROR'){
                This.setState({
                    object_count: data.count
                })
            }
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-change-threshold-value-callback')
        ipcRenderer.removeAllListeners('message-get-objective-no-count-callback')
        this.setState = (state,callback)=>{
            return;
        };
    }
    showDialog(){
        var s_threshold = YQ.util.get_ini('threshold') || 5;
        s_threshold = parseInt(s_threshold)
        this.setState({
            visible: true,
            dlg_status: 1,
            slider_value: s_threshold
        });
        ipcRenderer.send('message-get-objective-no-count','')

    }
    hideDialog(){
        this.setState({
            visible: false
        })
    }
    sliderChangeHandle(value){
        this.setState({
            slider_value: value,
            dlg_status: 1
        })
    }
    certainClick(){

        var This = this;
        YQ.util.set_ini('threshold', this.state.slider_value);
        ipcRenderer.send('message-change-threshold-value',this.state.slider_value)
        this.setState({
            dlg_status: 2
        })
    }
    cancelHandle(){
        this.hideDialog();
    }
    footerButton(){
        if(this.state.dlg_status == 1){
            return (
                <Button type="primary" style={{marginTop: 20}} onClick={this.certainClick.bind(this)}>
                    确认修改
                </Button>
            )
        }else if(this.state.dlg_status == 2){
            return (
                <Button type="primary" style={{marginTop: 20}} disabled={false}>
                    <Icon type="loading" />正在修改
                </Button>
            )
        }else if(this.state.dlg_status == 3){
            return (
                <Button type="primary" style={{marginTop: 20, width: 80}} onClick={this.cancelHandle.bind(this)}>
                    关闭
                </Button>
            )
        }
    }
    render() {

        const _marks = {};
        const _min = 0;
        const _max = 20;
        _marks[_min] = _min;
        _marks[5] = '默认'
        _marks[_max] = _max;

        return (
            <Modal
                title={<ModalTitle title="识别参数调整" />}
                visible={this.state.visible}
                closable={this.state.dlg_status === 2 ? false: true}
                maskClosable={false}
                footer={null}
                onCancel={this.cancelHandle}
            >
                <div className="threshold-content">
                    <div className="sub_title">客观题异常题目总数：
                        {
                            this.state.dlg_status === 2 ? (
                                <Icon type="loading" style={{color: '#2D6EDB'}}/>
                            ):(
                                <span>{this.state.object_count}</span>
                            )

                        }
                    </div>
                    <div className="icon-wrapper">
                        <Slider
                            min={_min}
                            max={_max}
                            marks={_marks}
                            disabled={this.state.dlg_status === 2 ? true: false}
                            onChange={this.sliderChangeHandle}
                            value={this.state.slider_value}
                        />
                    </div>
                    {this.footerButton()}
                </div>

            </Modal>
        );
    }
}
export default ThresholdSetting;
