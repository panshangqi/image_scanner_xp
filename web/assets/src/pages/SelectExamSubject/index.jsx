import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import { Select, Button, Modal, Icon} from 'antd';
import './style.less';
import YQ from '@components/yq'
import PageHeader from '@components/PageHeader'
import PageContent from "@components/PageContent";
import MultiTemplateSetting from "@components/MultiTemplateSetting";
import UserInfoBar from "@components/UserInfoBar";
import ModalTitle from '@components/ModalTitle'
const host = 'https://ucenter.17zuoye.com/';
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const Option = Select.Option;

class SelectExamSubject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnState: false,
            is_tp_anscard: false,
            has_paper: false,
            settingPaperDialogShow: false,
            setAnscardClick: false,
            isTPDialog: false,
            exam_data:[],
            subjects:[],
            schools:[],
            exam_id:'',
            exam_name:'',
            subject_id:'',
            subject_name:'',
            school_id:'',
            school_name:'',
            template_info:{
                template_name: '未知',
                anscard_count: 0,
                num_type: '未知',
                objective_item_count: 0,
            },
        };
        this.onExamHandleChange = this.onExamHandleChange.bind(this);
        this.onSubjectHandleChange = this.onSubjectHandleChange.bind(this);
        this.onSchoolHandleChange = this.onSchoolHandleChange.bind(this);
        this.onStartScanButtonClick = this.onStartScanButtonClick.bind(this);
        this.saveExamInfo = this.saveExamInfo.bind(this);
        this.updateBtnStatus = this.updateBtnStatus.bind(this);
        this.loadIni = this.loadIni.bind(this);
    }
    componentDidMount(){
        console.log('SelectExamSubject Did Mount');
        var url = YQ.util.make_aliyun_url('/exam/exam/list');
        var _this = this;
        YQ.http.get(url,{},function (res) {
            console.log(res);
            if(res.type == 'ERROR')
                return;
            console.log(res.body);
            _this.setState({
                exam_data: res.body
            },function(){
                _this.loadIni();
            })
        },false)
    }

    loadIni(fn){
        //初始化
        var _this = this;
        var _exam_info = YQ.util.get_ini('exam_info');
        if(_exam_info){

            var _data = _this.state.exam_data;
            for(var i=0;i<_data.length;i++){
                if(_exam_info.exam_id == _data[i]._id){
                    var subjects = _data[i].subjects;
                    var schools = _data[i].schools;
                    _this.setState({
                        subjects: subjects,
                        schools: schools
                    })
                    break;
                }
            }
            _this.setState({
                exam_name: _exam_info.exam_name,
                exam_id: _exam_info.exam_id,
                subject_name: _exam_info.subject_name,
                subject_id: _exam_info.subject_id,
                school_name: _exam_info.school_name,
                school_id: _exam_info.school_id
            },function () {
                _this.updateBtnStatus();
            })
        }
    }
    onMouseEnter(){
        console.log('SelectExamSubject Did Mount onMouseEnter');
        var url = YQ.util.make_aliyun_url('/exam/exam/list');
        var _this = this;
        YQ.http.get(url,{},function (res) {
            if(res.type == 'ERROR')
                return;
            _this.setState({
                exam_data: res.body
            })
        },false)
    }
    onExamHandleChange(value, options){
        var This = this;
        var _exam_id = options.props._id;
        console.log(_exam_id);
        var _data = This.state.exam_data;
        for(var i=0;i<_data.length;i++){
            if(_exam_id == _data[i]._id){
                var subjects = _data[i].subjects;
                var schools = _data[i].schools;
                This.setState({
                    subjects: subjects,
                    schools: schools,
                    exam_id: _data[i]._id,
                    exam_name: _data[i].name,
                    school_name:'',
                    school_id:'',
                    subject_name:'',
                    subject_id:'',
                    btnState: false,
                    is_tp_anscard: false,
                    has_paper: false,
                    isTPDialog: false,
                })
                break;
            }
        }
    }
    onSubjectHandleChange(value, options){   //选择学科

        var This = this;
        this.setState({
            subject_id : options.props._id,
            subject_name : options.props._name
        }, function () {
            This.updateBtnStatus();
        });
    }
    updateBtnStatus(){
        console.log('updateBtnStatus');
        if(this.state.subject_name.length === 0 || this.state.school_name.length === 0)
            return;
        //判断按钮状态
        var EXAM_DATA = this.state.exam_data;
        for(var i=0;i<EXAM_DATA.length;i++){
            if(this.state.exam_id == EXAM_DATA[i]._id){

                var subjects = EXAM_DATA[i].subjects;
                for(var j=0;j<subjects.length;j++){

                    if(this.state.subject_id == subjects[j].id){
                        // console.log(subjects[j].id,subjects[j].has_paper,subjects[j].is_tp_finished,this.state.subject_id);
                        if (subjects[j].is_tp_anscard) { // 是否为第三方
                            console.log('第三方答题卡');
                            if (subjects[j].is_tp_finished){ // 是否关完成模板
                                console.log('模板已上传');
                                this.setState({
                                    is_tp_anscard: true,
                                    has_paper: true,
                                    isTPDialog: true,
                                    btnState: true,
                                });
                            }else{
                                console.log('模板未上传');
                                this.setState({
                                    is_tp_anscard: true,
                                    has_paper: false,
                                    isTPDialog: true,
                                    btnState: false,
                                });
                            }
                        } else {
                            console.log('系统答题卡');
                            if(subjects[j].has_paper){  // 是否设置答题卡
                                console.log('已设置答题卡');
                                this.setState({
                                    is_tp_anscard: false,
                                    has_paper: true,
                                    isTPDialog: false,
                                    btnState: true,
                                });
                            }else{
                                console.log('未设置答题卡');
                                this.setState({
                                    is_tp_anscard: false,
                                    has_paper: false,
                                    isTPDialog: false,
                                    btnState: false,
                                });
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }

    }
    onSchoolHandleChange(value, options){
        var This = this;
        this.setState({
            school_id : options.props._id,
            school_name : options.props._name
        },function () {
            This.updateBtnStatus();
        })
    }
    onStartScanButtonClick() {
        var hr = this.saveExamInfo();
        if(!hr){
            return;
        }
        if(this.state.is_tp_anscard){
            console.log('第三方卡')
            this.refs.multi_dlg.showDialog('选择模板', 'select');
        }
        else{
            console.log('系统卡')
            this.refs.multi_dlg.showDialog('系统卡', 'system');
        }
    }
    saveExamInfo(){
        var result = {
            exam_id: this.state.exam_id,
            exam_name: this.state.exam_name,
            subject_id: this.state.subject_id,
            subject_name: this.state.subject_name,
            school_id: this.state.school_id,
            school_name: this.state.school_name,
        }

        if(result.subject_name.length <=0){
            Modal.warning({
                title: '提示',
                content: '请选择学科',
            });
            return false;
        }else if(result.school_name.length <=0){
            Modal.warning({
                title: '提示',
                content: '请选择学校',
            });
            return false;
        }else{
            YQ.util.set_ini('exam_info', result);
            //ipcRenderer.send('message-exam-subject-change','');  //更新学生，答题卡信息
            return true;
        }
    }
    //第三方上传模板 to upload template
    handleChangeTemplate = (type, e) =>{
        var hr = this.saveExamInfo();
        if(hr){
            //this.props.history.push('/template_upload');
            console.log(type);
            if(type == 'upload'){
                this.refs.multi_dlg.showDialog('上传模板', 'upload');
            }else if(type === 'modify'){
                this.refs.multi_dlg.showDialog('修改模板', 'modify');
            }
        }
    }
    handleSetAnsCardCancel = (e) => {
        this.setState({
            setAnscardClick: false,
        });
    }

    renderSubjectState () {
        console.log('is_tp_anscard: ' + this.state.is_tp_anscard);
        console.log('has_paper: ' + this.state.has_paper);
        if (!this.state.is_tp_anscard) {
            if (!this.state.has_paper) {
                return(
                    <div>
                        <div className="alert_message" style={{ backgroundColor:'#FFFBE6',border: '#FFE58F solid 1px'}}>
                            <div style={{ marginTop: 12 }}>
                                <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#FAAD14'}}/>
                                <span className="alert_span" >
                                    若您选用了系统卡， 请先设置答题卡信息
                                </span>
                                <a
                                    onClick={() => {
                                        this.setState({
                                            setAnscardClick: true,
                                        });
                                        ipcRenderer.send('message-open-17zuoye-url', host);
                                    }}
                                    style={{ textDecoration: 'underline', marginRight: 12}}
                                >
                                    设置答题卡
                                </a>
                            </div>
                            <div style={{ marginTop: 10, marginBottom: 12 }}>
                                <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#FAAD14'}}/>
                                <span className="alert_span" style={{ marginRight: 10 }}>
                                    若您选用了三方卡，请先进行扫描模板的上传
                                </span>
                                <a onClick={this.handleChangeTemplate.bind(this, 'upload')}  className="alert_a">扫描模板</a>
                            </div>
                        </div>
                    </div>
                    );
            } else {
                return(
                    <div className="alert_message" style={{ backgroundColor:'#EDFFE8',border: '#3AC41A solid 1px'}}>
                    <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#3AC41A'}}/>
                    <span className="alert_span">检测为系统答题卡</span>
                    {/*<a href="" className="alert_a">设置答题卡</a>*/}
                    </div>
                );
            }
        } else {
            if (!this.state.has_paper) {
                return(
                    <div className="alert_message" style={{ backgroundColor:'#FFFBE6',border: '#FFE58F solid 1px'}}>
                    <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#FAAD14'}}/>
                    <span className="alert_span" style={{ marginRight: 15}}>检测为第三方答题卡，未上传模板</span>
                    <a onClick={this.handleChangeTemplate.bind(this, 'upload')} className="alert_a">上传模板</a>
                    </div>
                );
            } else {
                return(
                    <div className="alert_message" style={{ backgroundColor:'#EDFFE8',border: '#3AC41A solid 1px'}}>
                    <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#3AC41A'}}/>
                    <span className="alert_span">检测为第三方答题卡，模板已上传</span>
                    <a onClick={this.handleChangeTemplate.bind(this, 'modify')} className="alert_a">修改模板</a>
                    </div>
                );
            }
        }
    }
    render() {
        const _This = this;
        return (
            <div className="select_exam_subject_html">
                <PageHeader>
                    <div className="app_user">
                        <UserInfoBar/>
                    </div>
                </PageHeader>
                <PageContent>
                    <div className="page_background">
                        <div className="select_box">
                            <div className="_title">扫描科目选择</div>
                            <div className="select_exam">
                                <Select
                                    showSearch
                                    style={{ width: 360 }}
                                    placeholder="请选择考试"
                                    size="large"
                                    value={this.state.exam_name? this.state.exam_name : undefined}
                                    onMouseEnter={this.onMouseEnter.bind(this)}
                                    onChange={this.onExamHandleChange}
                                >
                                    {

                                        this.state.exam_data.map( function(item, index){
                                            return (
                                                <Option

                                                    _id={item._id}
                                                    _name={item.name}
                                                    key={item._id+index}
                                                >
                                                    {item.name}
                                                </Option>)
                                        })
                                    }
                                </Select>
                            </div>
                            <div className="select_exam">
                                <Select
                                    showSearch
                                    style={{ width: 360 }}
                                    placeholder="请选择学科"
                                    value={this.state.subject_name ? this.state.subject_name : undefined}
                                    size="large"
                                    onChange={this.onSubjectHandleChange}
                                >
                                    {
                                        this.state.subjects.map( function(item, index){
                                            return (
                                                <Option
                                                    _id={item.id}
                                                    _name={item.name}
                                                    key={item.name+index}
                                                >
                                                    {item.name}
                                                </Option>)
                                        })
                                    }
                                </Select>
                            </div>
                            <div className="select_exam">
                                <Select
                                    showSearch
                                    style={{ width: 360 }}
                                    placeholder="请选择学校"
                                    value={this.state.school_name ? this.state.school_name : undefined}
                                    size="large"
                                    onChange={this.onSchoolHandleChange}
                                >
                                    {
                                        this.state.schools.map( function(item, index){
                                            return (
                                                <Option
                                                    defaultValue={_This.state.school_name}
                                                    _id={item.id}
                                                    _name={item.name}
                                                    key={item.name+index}
                                                >
                                                    {item.name}
                                                </Option>)
                                        })
                                    }
                                </Select>

                                <div style={{ marginTop: 16, display: 'block'}}>
                                    {this.renderSubjectState()}
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{width:360, marginTop:16}}
                                        onClick={this.onStartScanButtonClick}
                                        disabled={!this.state.btnState}
                                    >
                                        开始扫描
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="to_back"><Link to="/scan_pattern">
                        <Button><Icon type="left" />返回模式选择</Button>
                    </Link></div>
                </PageContent>

                <Modal
                    title={<ModalTitle title="提示" />}
                    visible={this.state.setAnscardClick}
                    onCancel={this.handleSetAnsCardCancel}
                    footer={null}
                >
                    <div className="setting_paper_dialog">

                        <div className="_dialog_tip">
                            请确认设置完答题卡模式后，再返回本客户端执行后续操作。
                        </div>
                        <div className="_op_btn_box" >
                            <Button onClick={this.handleSetAnsCardCancel} type="primary" style={{width:120, marginTop: 50}}>设置完成</Button>
                        </div>
                    </div>
                </Modal>
                <MultiTemplateSetting ref="multi_dlg"/>
            </div>

        );
    }
}

export default SelectExamSubject;
