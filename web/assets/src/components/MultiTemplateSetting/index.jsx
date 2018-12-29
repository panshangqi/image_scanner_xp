
import React, { Component } from 'react';
import { Radio , Modal, Button, Select, message, notification} from 'antd';
import YQ from '@components/yq'
import './style.less';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const diskspace = window.require('diskspace');
const Option = Select.Option;
import ModalTitle from '@components/ModalTitle'
const RadioGroup = Radio.Group;

class MultiTemplateSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            updateing: false,
            title: '',
            template_list: [],
            selected_template_id: null,
            selected_template_name: undefined,
            type: null,   // upload, modify, update,
            number_type: null,
            paper_num: null,
            objective_num: null,
            create_time: null,
            modify_time: null,
            onchange: props.onChange,
            url_to: props.url_to || '/paper_upload'
        };
        this.interval = null;
        var This = this;
        this.showDialog = this.showDialog.bind(this);
        this.templateChange = this.templateChange.bind(this);
        this.getTemplateList = this.getTemplateList.bind(this)
        this.footButtons = this.footButtons.bind(this)
        this.uploadPaperClick = this.uploadPaperClick.bind(this);
        this.updateDetailData = this.updateDetailData.bind(this)
        this.getSystemTemplate = this.getSystemTemplate.bind(this)

    }
    componentDidMount(){
        ipcRenderer.on('message-exam-subject-change-callback', function (e, data) {
            if(data.msg == 'ok'){
                message.destroy()
            }else{
                message.destroy()
                //message.error('更新失败：' + data.msg, 2)
                notification['error']({
                    message: '提示',
                    placement: 'bottomRight',
                    description: data.msg,
                });
            }
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-exam-subject-change-callback')
        this.setState = (state,callback)=>{
            return;
        };
    }
    getTemplateList(){
        var This = this;
        var _url = YQ.util.make_aliyun_url('/exam/exam/multi_info');
        var exam_info = YQ.util.get_ini('exam_info');
        var _template = YQ.util.get_ini('template');
        var _template_id =  _template ? _template.template_id: null;
        YQ.http.get(_url, {exam_id: exam_info.exam_id, subject: exam_info.subject_id}, function (res) {
            console.log('多模板列表')
            console.log(res)
            if(res.type === 'AJAX'){
                This.setState({
                    template_list: res.body
                },function () {
                    This.updateDetailData(_template_id);
                })
            }
        })
    }
    getSystemTemplate(){

        var This = this;
        var exam_info = YQ.util.get_ini('exam_info');
        var url = YQ.util.make_aliyun_url('/exam/exam/info');
        var params = {
            exam_id: exam_info.exam_id,
            subject: exam_info.subject_id,
        };
        YQ.http.get(url,params,function (res) {
            console.log('系统卡模板')
            console.log(res);
            if (res.type === 'AJAX') {

                var _template_id = 'system_001';
                var _list = [];
                _list.push({
                    template_id: _template_id,
                    template_name: res.body.template_name,
                    num_type: res.body.num_type,
                    anscard_count: res.body.anscard_count,
                    objective_item_count: res.body.objective_item_count,
                    create_time: null,
                    modify_time: null
                })
                console.log(_list,_template_id);
                This.setState({
                    template_list: _list
                },function () {
                    This.updateDetailData(_template_id);
                })
            }
        });
    }
    handleCancel = () => {
        const _this = this;
        this.setState({
            visible: false
        });
    };
    datetimeFormat(timestamp){
        var date = new Date(timestamp);//如果date为10位不需要乘1000
        var Y = date.getFullYear();
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
        var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes());
        var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y+'-'+M + '-' + D + ' ' + h+':'+m;
    }
    onMouseEnter(){
        if(this.state.type == 'system'){
            this.getSystemTemplate();
        }else{
            this.getTemplateList();
        }
    }
    showDialog(title, _type) {
        this.setState({
            number_type: null,
            paper_num: null,
            objective_num: null,
            create_time: null,
            modify_time: null,
            template_list: [],
            selected_template_name: undefined
        })
        console.log(title);

        if(_type == 'upload'){   //还没上传过模板，上传触发
            this.getTemplateList();
            this.setState({
                type: 'upload'
            });
        }else if(_type == 'select'){   //已经上传过模板，选择使用
            this.getTemplateList();
            this.setState({
                type: 'select'
            });
        }else if(_type =='modify'){  //已经上传过模板，去修改模板
            this.getTemplateList();
            this.setState({
                type: 'modify'
            });
        }else if(_type == 'switch'){ //切换模板  主界面
            this.getTemplateList();
            this.setState({
                type: 'switch'
            });
        }else if(_type == 'system'){   //系统卡
            //系统卡
            this.getSystemTemplate();
            this.setState({
                type: 'system'
            });
        }
        this.setState({
            visible: true,
            title: title
        });
        //ipcRenderer.send('message-exam-subject-change','');
    }
    hideDialog() {
        this.state({
            visible: false,
        });
    }
    templateChange(value, options){
        var _template_id = options.props._id;
        var _template_name = options.props._name;
        console.log(_template_id);
        this.updateDetailData(_template_id);
    }
    updateDetailData(_template_id){
        for(var item of this.state.template_list){
            if(item.template_id === _template_id){
                this.setState({
                    selected_template_id: item.template_id,
                    selected_template_name:item.template_name,
                    number_type: item.num_type,
                    paper_num: item.anscard_count,
                    objective_num: item.objective_item_count,
                    create_time: !item.create_time ? '-/-' : this.datetimeFormat(item.create_time),
                    modify_time: !item.update_time ? '-/-' : this.datetimeFormat(item.update_time)
                })
            }
        }
    }
    uploadTemplateClick(){
        if(!this.state.selected_template_id){
            message.config({
                duration: 1
            })
            message.warning('请选择模板')
            return;
        }
        var template = {
            template_id: this.state.selected_template_id,
            template_name: this.state.selected_template_name
        }
        YQ.util.set_ini('template', template);
        YQ.util.set_ini('anscard_type', 'thirdparty');
        ipcRenderer.send('message-update-image-db','template');
        window.location.href = '#/template_upload';
    }
    uploadPaperClick(){
        if(!this.state.selected_template_id){
            message.config({
                duration: 1
            })
            message.warning('请选择模板')
            return;
        }
        var template = {
            template_id: this.state.selected_template_id,
            template_name: this.state.selected_template_name
        }
        YQ.util.set_ini('template', template);
        YQ.util.set_ini('anscard_type', 'thirdparty');
        ipcRenderer.send('message-exam-subject-change','');
        this.setState({
            visible: false
        })
        if(typeof this.state.onchange === 'function'){
            this.state.onchange(template.template_id,template.template_name)
        }
        const hide = message.loading('正在更新模板，请稍后...', 10);
        window.location.href = '#' + this.state.url_to; //'#/paper_upload';
    }
    uploadSystemPaperClick(){

        if(!this.state.selected_template_id){
            message.config({
                duration: 1
            })
            message.warning('请选择模板')
            return;
        }
        var template = {
            template_id: this.state.selected_template_id,
            template_name: this.state.selected_template_name
        }
        console.log(template);
        YQ.util.set_ini('template', template);
        YQ.util.set_ini('anscard_type', 'system');
        ipcRenderer.send('message-exam-subject-change','');
        this.setState({
            visible: false
        })
        const hide = message.loading('正在更新模板，请稍后...', 10);
        window.location.href = '#/paper_upload';
    }
    footButtons(){
        if(this.state.type == 'upload'){
            return (
                <div>
                    <Button style={{width: 100}} onClick={this.handleCancel}>取消</Button>
                    <Button
                        type="primary"
                        style={{marginLeft:20, width: 100}}
                        onClick={this.uploadTemplateClick.bind(this)}
                    >确认上传</Button>
                </div>
            )
        }else if(this.state.type == 'select'){
            return (
                <div>
                    <Button style={{width: 100}} onClick={this.handleCancel}>取消</Button>
                    <Button
                        type="primary"
                        style={{marginLeft:20, width: 100}}
                        onClick={this.uploadPaperClick.bind(this)}
                    >确定</Button>
                </div>
            )
        }else if(this.state.type == 'modify'){
            return (
                <div>
                    <Button style={{width: 100}} onClick={this.handleCancel}>取消</Button>
                    <Button
                        type="primary"
                        style={{marginLeft:20, width: 100}}
                        onClick={this.uploadTemplateClick.bind(this)}
                    >确认修改</Button>
                </div>
            )
        }else if(this.state.type == 'switch'){
            return (
                <div>
                    <Button style={{width: 100}} onClick={this.handleCancel}>返回</Button>
                    <Button
                        type="primary"
                        style={{marginLeft:20, width: 100}}
                        onClick={this.uploadPaperClick.bind(this)}
                    >确认</Button>
                </div>
            )
        }else if(this.state.type == 'system'){
            return (
                <div>
                    <Button style={{width: 100}} onClick={this.handleCancel}>返回</Button>
                    <Button
                        type="primary"
                        style={{marginLeft:20, width: 100}}
                        onClick={this.uploadSystemPaperClick.bind(this)}
                    >确认</Button>
                </div>
            )
        }
    }
    render() {
        return (
            <Modal
                title={<ModalTitle title={this.state.title}/>}
                visible={this.state.visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
                width={600}
            >
                <div className="_select_multi_dialog">
                    <table className="_table">
                        <tbody>
                        <tr>
                            <td style={{width:90}}>当前模板：</td>
                            <td style={{width:250}}>
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="请选择模板"
                                    optionFilterProp="children"
                                    value={this.state.selected_template_name}
                                    onChange={this.templateChange}
                                    onMouseEnter={this.onMouseEnter.bind(this)}
                                    disabled={this.state.type == 'system' ? true: false}
                                >
                                    {
                                        this.state.template_list.map( function(item, index){
                                            return (
                                                <Option
                                                    _id={item.template_id}
                                                    _name={item.template_name}
                                                    key={item.template_id+index}
                                                    title={item.template_name}
                                                >
                                                    {item.template_name}
                                                </Option>)
                                        })
                                    }
                                </Select>
                            </td>
                            <td style={{width:90}}>考号类型：</td>
                            <td style={{width:120}}>{this.state.number_type}</td>
                        </tr>
                        <tr>
                            <td>图片面数：</td>
                            <td>{this.state.paper_num}</td>
                            <td>客观题数：</td>
                            <td>{this.state.objective_num}</td>
                        </tr>
                        <tr style={{display: this.state.type == 'system'? 'none':'table-row'}}>
                            <td>创建时间：</td>
                            <td>{this.state.create_time}</td>
                            <td>更新时间：</td>
                            <td>{this.state.modify_time}</td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="button_box">
                        {this.footButtons()}
                    </div>
                </div>

            </Modal>
        );
    }
}
export default MultiTemplateSetting;
