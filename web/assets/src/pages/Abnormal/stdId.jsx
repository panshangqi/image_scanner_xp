import React, { Component } from 'react';
import { Col, Popconfirm, message, Button, Input, AutoComplete, Icon} from 'antd';

import YQ from '@components/yq.jsx';
import SubPage from '@components/SubPage';
import AbnormalSiderBar from '@components/AbnormalSiderBar';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect'
import ChangeLayout from '@pages/Abnormal/autosize.jsx'
import $ from 'jquery';

const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
/*
 接口回调：
 removePaperClick()   //删除
 laterSolveClick()   //稍后处理
 certainAbsenceClick()   //完成匹配
 */

class StdId extends Component{
    constructor(props){
        super(props);
        this.students = [];
        this.klx_student_id = null;
        this.state = {
            abnormal_id: this.props.match.params.abnormal_id,
            pic_abnormal_id: this.props.match.params.abnormal_id,
            dataSource: [],
            content_min_height: 0,
            student: '',
            has_be_done: 0,
            student_id: '',
            exam_number: ''
        };
        this.changeState = this.changeState.bind(this);
        this.updateStudents = this.updateStudents.bind(this);
    }
    componentDidMount(){
        var This = this;
        this.updateStudents()

        ipcRenderer.on('message-update-exception-sutdents', function (e, arg) {
            console.log('message-update-exception-sutdents')
            This.updateStudents()
        })
        this.setState({
            content_min_height: window.innerHeight - 36 - 16
        });
        ChangeLayout.resize();
        $(window).resize(ChangeLayout.resize);

    }
    updateStudents(){
        console.log('======================');
        const url = YQ.util.make_local_url('/get_all_students');
        var This = this;
        YQ.http.get(url, {}, (res) => {
            console.log(res)
            if(res.type === 'ERROR'){
                return;
            }
            This.students = res.data.students;
            This.updateDetailData();
        });
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    removeClick(){
        var url = YQ.util.make_local_url('/delete_abnormal');
        var params = {
            abnormal_id: this.state.abnormal_id
        };
        var This = this;
        YQ.http.post(url, params, (res) => {
            if(res.type == 'AJAX'){
                This.refs.sider_bar.onUpdateSiderBar();
                This.refs.pic_com.clearPictures();
                This.klx_student_id = null;
                This.setState({
                    student: ''
                });
                console.log(This.state.abnormal_id, 'remove');
            }
        });
    }

    certainClick(){
        var This = this;
        var student_id = this.klx_student_id;
        if(this.klx_student_id){
            var url = YQ.util.make_local_url('/complete_match');
            var params = {
                abnormal_id: this.state.abnormal_id,
                student_id: this.klx_student_id
            }
            YQ.http.post(url, params, (res) => {
                if(res.type == 'AJAX'){
                    This.refs.sider_bar.onUpdateSiderBar();
                    console.log(This.state.abnormal_id, 'complete_match');
                    This.setState({
                        has_be_done: 1,
                        student_id: student_id
                    })
                }
            });
        }
    }

    handleSearch = (value) => {
        let source = [];
        const reg = new RegExp(value);
        this.students.forEach((std) => {
            const exam_number = std.exam_number;
            const name = std.real_name;
            const str = `${name}/${exam_number}`;
            if (str.match(reg)) {
                source.push(str);
            }
        });
        this.setState({
          dataSource: source
        });
    }

    onChange = (value) => {
        var This = this;
        this.setState({
          student: value
        },function () {
            This.students.forEach((std) => {
                const exam_number = std.exam_number;
                const name = std.real_name;
                const str = `${name}/${exam_number}`;
                if(value === str)
                {
                    This.klx_student_id = std.student_id;
                    console.log(This.klx_student_id );
                }
            });
        });
    }
    updateDetailData(){
        var This = this;
        var url = YQ.util.make_local_url('/get_detail_data');
        console.log(this.state.abnormal_id);
        (async function () {
            var _detail_data = await YQ.http.get(url, {abnormal_id: This.state.abnormal_id, type: 2 });
            var _result = await _detail_data.json();
            console.log('考生考号识别 详细数据')
            console.log(_result);
            if(_result.type === 'AJAX'){

                var flag = false;
                for(var i=0;i<This.students.length;i++){
                    var std = This.students[i];
                    if(_result.data.student_id === std.student_id ){
                        This.klx_student_id = std.student_id;
                        const exam_number = std.exam_number;
                        const name = std.real_name;
                        const str = `${name}/${exam_number}`;
                        var _has_be_done = _result.data.be_done === true? 1:0;

                        This.setState({
                            student: str,
                            has_be_done: _has_be_done,
                            exam_number: _result.data.student_number
                        });

                        flag = true;
                        break;
                    }
                }

                if(!flag){
                    This.klx_student_id = null;
                    This.setState({
                        student: '',
                        has_be_done: 0
                    });
                }
            }

        })();
    }

    componentWillReceiveProps(props){
        console.log(this.state.abnormal_id + window.location.href);
        var This = this;
        this.setState({
            abnormal_id: props.match.params.abnormal_id,
            pic_abnormal_id: props.match.params.abnormal_id
        },function () {
            This.updateDetailData();
            //This.refs.sider_bar.onUpdateSiderBar('init');
        });
    }

    //两面点击
    onHandlePagesSideClick(_id){

    }
    checkAgainClick(){
        this.setState({
            has_be_done: 0
        })
    }
    changeState(){
        if(this.state.has_be_done) {
            return(
            <div>
                <div className="search_student">
                    <span>考生:</span>
                    <span>{this.state.student}</span>
                </div>
                <div className="op_btns">
                    <Button onClick={this.checkAgainClick.bind(this)} type="primary" style={{width:110}}>重新匹配</Button>

                </div>
            </div>
            )
        }else{
            return(
            <div>
                <div className="search_student">
                    <span>考生:</span>
                    <AutoComplete
                        style={{ width: 200 }}
                        dataSource={this.state.dataSource}
                        placeholder="输入学生姓名或学号"
                        onSelect={this.onSelect}
                        onSearch={this.handleSearch}
                        value={this.state.student}
                        onChange={this.onChange}
                    >
                            <Input suffix={<Icon type="search" className="certain-category-icon" />} />
                    </AutoComplete>
                </div>
                <div className="op_btns">
                    <Popconfirm title="确定删除该试卷？ " onConfirm={this.removeClick.bind(this)} okText="确定" cancelText="取消">
                        <Button type="primary" ghost>删除</Button>
                    </Popconfirm>
                    <Button onClick={this.certainClick.bind(this)} type="primary">完成匹配</Button>
                </div>
            </div>
            )
        }
    }

    render(){
        const minHeight = {
            minHeight: this.state.content_min_height
        };
        console.log(this.state.abnormal_id)
        return(
            <div>
                <div className="page" id="page">
                    <div className="page_left" id='left'>
                        <AbnormalSiderBar abnormal_id={this.state.abnormal_id} ref="sider_bar" activeKey="4"/>
                    </div>
                    <div className="page_middle" id='middle'>
                        <AbnormalPictureCorrect abnormal_id={this.state.pic_abnormal_id} ref="pic_com" />
                    </div>
                    <div className="page_right" id='right'>
                        <div className="assign_result">
                            <div className="title">提示</div>
                            <div className="tips">
                                <div  className="t">1.若找不到考号，请查看考生卷面书写的中文姓名或数字考号判定是否错涂/漏涂，并人工通过搜索匹配进行关联，完成关联后保存。若仍找不到考生，请打开http://www.17zuoye.com添加考生后，返回客户端，并在右上角▽工具栏中点击更新考生名单。</div>
                                <div  className="t">2.若考号重复，请查看考生卷面书写的中文姓名或数字考号判定是否错涂/漏涂，并人工通过搜索匹配进行关联，完成关联后保存。若为重复试卷，请直接删除。</div>
                            </div>
                            {this.changeState()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default StdId;