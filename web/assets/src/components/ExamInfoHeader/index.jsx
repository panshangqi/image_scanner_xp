
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import YQ from '@components/yq'
import './style.less';


class ExamInfoHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subject_name:'',
            school_name:'',
            exam_name:'',
        }
        this.onChangeExamClick = this.onChangeExamClick.bind(this);
    }
    componentDidMount(){
        var _exam_info = YQ.util.get_ini('exam_info');
        if(_exam_info){
            console.log(_exam_info);
            this.setState({
                subject_name:_exam_info.subject_name,
                school_name:_exam_info.school_name,
                exam_name:_exam_info.exam_name,
            })
        }
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }

    onChangeExamClick(){
        window.location.href = '#/select_exam_subject';
        if(typeof this.props.onChangeExamClick === 'function'){
            this.props.onChangeExamClick();
        }
    }

    render() {

        return (
            <div className="_exam_info_com">
                <table>
                    <tbody>
                        <tr>
                            <td><div style={{width:60}}>考试：</div></td>
                            <td style={{textAlign:'left'}}><div style={{width:110}} title={this.state.exam_name}>{this.state.exam_name}</div></td>
                            <td><div style={{width:60}}>学校：</div></td>
                            <td style={{textAlign:'left'}}><div style={{width:110}} title={this.state.school_name}>{this.state.school_name}</div></td>
                            <td><div style={{width:60}}>学科：</div></td>
                            <td style={{textAlign:'left'}}><div style={{width:80}} title={this.state.subject_name}>{this.state.subject_name}</div></td>
                            <td style={{textAlign:'right', width:60}}>
                                <a href="javascript:void(0)" onClick={this.onChangeExamClick}><div className="modify_exam_btn">修 改</div></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
export default ExamInfoHeader;
