import React, { Component } from 'react';
import { Col, Button, Input, AutoComplete, Icon} from 'antd';

import SubPage from '@components/SubPage';
import AbnormalSiderBar from '@components/AbnormalSiderBar';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect'
import YQ from '@components/yq'

import ChangeLayout from '@pages/Abnormal/autosize.jsx'
import $ from 'jquery';

/*
 接口回调：
 removePaperClick()   //删除
 laterSolveClick()   //稍后处理
 certainAbsenceClick()   //完成匹配
 */

class Absent extends Component{
    constructor(props){
        super(props);
        this.state = {
            abnormal_id: this.props.match.params.abnormal_id,
            pic_abnormal_id: this.props.match.params.abnormal_id,
            dataSource: [],
            content_min_height: 0,
            absent_state: '未处理'
        };
        this.be_done = false;
        this.removeClick = this.removeClick.bind(this);
        this.missingClick = this.missingClick.bind(this);

    }

    componentDidMount(){
        this.setState({
            content_min_height: window.innerHeight - 36 - 16
        });
        this.updateDetailData();
        ChangeLayout.resize();
        $(window).resize(ChangeLayout.resize);
    }

    updateDetailData(){
        var This = this;
        var url = YQ.util.make_local_url('/get_detail_data');
        (async function () {
            var _detail_data = await YQ.http.get(url, {abnormal_id: This.state.abnormal_id, type: 4 });
            var _result = await _detail_data.json();
            if(_result.type === 'AJAX'){
                This.setState({
                    scan_datas: _result.data.scan_datas,
                    ret_pages: _result.data.ret_pages
                });
                console.log('获取详细数据');
                console.log(_result.data);
                This.be_done = _result.data.be_done;
                if(This.be_done){
                    if(_result.data.is_student_absent == 1)
                    {
                        This.setState({
                            absent_state: '缺考'
                        })
                    }
                    else if(_result.data.is_student_absent == 2){
                        This.setState({
                            absent_state: '未缺考'
                        })
                    }

                }else{
                    This.setState({
                        absent_state: '未处理'
                    })
                }
            }
        })();
    }
    removeClick(){

        var url = YQ.util.make_local_url('/certain_absent');
        var params = {
            abnormal_id: this.state.abnormal_id,
            type: 2
        };
        var This = this;
        YQ.http.post(url, params, (res) => {
            console.log(res);
            if(res.type == 'AJAX'){

                This.refs.sider_bar.onUpdateSiderBar();
                This.updateDetailData();
                console.log(This.state.abnormal_id, 'remove');
            }
        });
    }

    //确认缺考
    missingClick(){
        var url = YQ.util.make_local_url('/certain_absent');
        var params = {
            abnormal_id: this.state.abnormal_id,
            type: 1
        };
        var This = this;
        YQ.http.post(url, params, (res) => {
            console.log(res);
            if(res.type == 'AJAX'){

                This.refs.sider_bar.onUpdateSiderBar();
                This.updateDetailData();
                console.log(This.state.abnormal_id, 'certain absent');
            }
        });
    }

    componentWillReceiveProps(props){
        var This = this;
        this.setState({
            abnormal_id: props.match.params.abnormal_id,
            pic_abnormal_id: props.match.params.abnormal_id
        },function () {
            This.updateDetailData();
            //This.refs.sider_bar.onUpdateSiderBar('init');
        });
    }

    render(){
        const minHeight = {
            minHeight: this.state.content_min_height
        };
        return(
            <div>
                <div className="page" id="page">
                    <div className="page_left" id='left'>
                        <AbnormalSiderBar abnormal_id={this.state.abnormal_id} ref="sider_bar" activeKey="2"/>
                    </div>
                    <div className="page_middle" id='middle'>
                        <AbnormalPictureCorrect
                            abnormal_id={this.state.pic_abnormal_id} />
                        <div className="absent_tip">缺考状态：<span style={{color: this.state.absent_state == '缺考' ? '#FF796B' : '#444'}}>{this.state.absent_state}</span>
                        </div>
                    </div>
                    <div className="page_right" id='right'>
                        <div className="assign_result">
                            <div className="title">提示</div>
                            <div className="tips">
                                <p>1.若该券学生已作答，只是错误填涂了缺考标识，则“移出缺考”。</p>
                                <p>2.若确实为未作答卷，确认“缺考”。</p>
                            </div>
                            <div className="op_btns">
                                <Button onClick={this.removeClick} type="primary" ghost>移除缺考</Button>
                                <Button onClick={this.missingClick} type="primary">确认缺考</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Absent;