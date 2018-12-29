import React, { Component } from 'react';
import { Col, Button, Input, AutoComplete, Icon} from 'antd';

import SubPage from '@components/SubPage';
import AbnormalSiderBar from '@components/AbnormalSiderBar';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect'
import YQ from '@components/yq'
import ChangeLayout from '@pages/Abnormal/autosize.jsx'
import $ from 'jquery';

class Losing extends Component{
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            abnormal_id: this.props.match.params.abnormal_id,
            pic_abnormal_id: this.props.match.params.abnormal_id,
            dataSource: [],
            content_min_height: 0
        };
        if(props.history.location.query){
            this.exam_num = props.history.location.query.exam_number;
        }

        this.removeClick = this.removeClick.bind(this);
    }

    componentDidMount(){
        this.setState({
            content_min_height: window.innerHeight - 36 - 16
        });

        ChangeLayout.resize();
        $(window).resize(ChangeLayout.resize);
    }

    removeClick(){
        var _url = YQ.util.make_local_url('/delete_losing_student');//delete_losing_student
        var This = this;
        YQ.http.post(_url,{student_id: this.state.abnormal_id}, function (res) {
            console.log(res);
            if(res.type === 'AJAX'){
                console.log('删除成功');
                This.refs.sider_bar.onUpdateSiderBar();
                This.refs.pic_com.clearPictures();
            }else{
                console.log('删除fail');
            }

        })
    }
    componentWillReceiveProps(props){
        var _this = this;
        //this.exam_num = this.props.history.location.query.exam_number;
        if(props.history.location.query){
            this.exam_num = props.history.location.query.exam_number;
        }
        this.setState({
            abnormal_id: props.match.params.abnormal_id,
            pic_abnormal_id: props.match.params.abnormal_id
        },function () {
            //_this.refs.sider_bar.onUpdateSiderBar('init');
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
                        <AbnormalSiderBar abnormal_id={this.state.abnormal_id} activeKey="5" ref="sider_bar"/>
                    </div>
                    <div className="page_middle" id='middle'>
                        <AbnormalPictureCorrect abnormal_id={this.state.pic_abnormal_id} ref="pic_com"/>
                    </div>
                    <div className="page_right" id='right'>
                        <div className="assign_result" >
                            <div className="title">提示</div>
                            <div className="tips">
                                <p>1.请确定该卷为本科考卷，若不是，请删除。</p>
                                <p>2.若不清晰，请找到本卷的卷纸后，重新扫描。</p>
                            </div>
                            <div className="op_btns">
                                <Button onClick={this.removeClick} type="primary">删除</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Losing;