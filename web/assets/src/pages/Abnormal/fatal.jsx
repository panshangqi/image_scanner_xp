import React, { Component } from 'react';
import { Col, Button, Icon, Select, Modal} from 'antd';

import YQ from '@components/yq.jsx';
import SubPage from '@components/SubPage';
import AbnormalSiderBar from '@components/AbnormalSiderBar';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect'
import ObjectiveItem from '@components/ObjectiveItem'
import ChangeLayout from '@pages/Abnormal/autosize.jsx'
import $ from 'jquery';

const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const Option = Select.Option;

function warning(msg) {
  Modal.warning({
    title: '提示',
    content: msg,
  });
}

class Fatal extends Component{
    constructor(props){
        super(props);
        this.students = [];
        this.recognize_result = null,
        this.state = {
            abnormal_id: this.props.match.params.abnormal_id,
            pic_abnormal_id: this.props.match.params.abnormal_id,
            pic_selected_id: this.props.match.params.abnormal_id,
            objective_items: [],
            loading: false,
            btn_name: '二次识别',
            exam_number: null,
            show_res: false,
            has_submited: false,
            selected: 0,
            scan_datas: [],
            ret_pages: []
        };
        this.be_done = false;
        this.updateDetailData = this.updateDetailData.bind(this);
    }
    componentDidMount(){
        var This = this;
        this.updateDetailData();
        ipcRenderer.on('message-recognize-again-end',function (e, arg) {
            console.log('二次识别结果')
            console.log(arg);
            if(!arg){
                This.setState({
                    loading: false,
                    exam_number: null,
                    btn_name: '二次识别',
                    show_res: false
                });
                console.log('二次识别失败');
                warning('二次识别失败');
            }else{
                This.recognize_result = arg;
                var exam_number = arg.data.records[0].ImageProcess.sStudentNumber;
                This.setState({
                    loading: false,
                    exam_number: exam_number,
                    btn_name: '二次识别',
                    show_res: true,
                    objective_items: arg.objective_items
                });
                console.log('二次识别完成');
            }
        })
        ChangeLayout.resize();
        $(window).resize(ChangeLayout.resize);
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-recognize-again-end')
        this.setState = (state,callback)=>{
            return;
        };
    }
    updateDetailData(){
        var This = this;
        var url = YQ.util.make_local_url('/get_detail_data');
        const _url = YQ.util.make_local_url('/get_recognize_result');
        var _ids = [];
        _ids.push(this.state.abnormal_id);
        console.log(this.state.abnormal_id);
        (async function () {
            var _detail_data = await YQ.http.get(url, {abnormal_id: This.state.abnormal_id, type: 1 });
            var _result = await _detail_data.json();
            if(_result.type === 'AJAX'){
                This.setState({
                    scan_datas: _result.data.scan_datas,
                    ret_pages: _result.data.ret_pages
                });
                console.log('获取详细数据');
                console.log(_result.data);
                This.be_done = _result.data.be_done;
            }
            //获取识别结果
            var _recognize_result = await  YQ.http.get(_url, {abnormal_ids: JSON.stringify(_ids)});
            var _re_result = await _recognize_result.json();
            if (_re_result.type === 'AJAX') {
                console.log(This.be_done);
                var _items = _re_result.data;
                _items.sort(function (x, y) {
                    return x.item_num - y.item_num
                });
                if(This.be_done){
                    This.setState({
                        exam_number: _result.data.student_number,
                        objective_items: _items,
                        show_res: true,
                        has_submited: true
                    });
                }else{
                    This.setState({
                        show_res: false,
                        has_submited: false
                    });
                }
                console.log('已经识别的结果');
                console.log(_re_result.data);
            }
        })();
    }
    removeClick(){
        var url = YQ.util.make_local_url('/delete_abnormal');
        var params = {
            abnormal_id: this.state.abnormal_id,
            error_type: 1
        };
        var This = this;

        YQ.http.post(url, params, (res) => {

            if(res.type == 'AJAX'){

                This.refs.sider_bar.onUpdateSiderBar();
                This.refs.pic_com.clearPictures();
                console.log(This.state.abnormal_id, 'remove');
            }
        });
        console.log('remove');
        this.setState({
            selected: 0
        })
    }
    clearSubmitResultClick(){
        //clear_re_recognize
        var url = YQ.util.make_local_url('/clear_re_recognize');
        var params = {
            abnormal_id: this.state.abnormal_id
        };
        var This = this;
        YQ.http.post(url, params, (res) => {
            if(res.type == 'AJAX'){
                This.refs.sider_bar.onUpdateSiderBar();
                This.refs.pic_com.getImageByAbnormalId();
                this.refs.pic_com.reRecognizedState(false) //取消二次识别数据
                This.setState({
                    show_res: false,
                    has_submited: false
                });
            }
        });
    }
    recognitionClick(){

        if(!this.state.selected){
            warning('请在右侧先选择当前图像所对应的页码');
            return;
        }
        var _reg_info = this.refs.pic_com.getReRegInfo();
        console.log(_reg_info);
        var options = {
            abnormal_id: _reg_info.abnormal_id,
            filename: _reg_info.filename,
            anscard_id: _reg_info.anscard_id,
            page_num: this.state.selected,
            rate_x: _reg_info.layer.rate_x,
            rate_y: _reg_info.layer.rate_y,
            rate_w: _reg_info.layer.rate_w,
            rate_h: _reg_info.layer.rate_h
        }

        if(options.filename){
            ipcRenderer.send('message-recognize-again', options);
        }else{
            console.log('开始二次识别 newfilename is not exist');
        }
        this.setState({
            loading: true,
            btn_name: '识别中'
        });
    }
    backRecognitionClick(){
        this.setState({
            show_res: false,
            btn_name: '二次识别'
        });
    }
    //提交识别数据
    recognitionSubmitClick(){
        console.log('click')
        this.setState({
            show_res: true,
            has_submited:true,
            btn_name: '二次识别'
        });
        ipcRenderer.send('message-submit-recognize-result', this.recognize_result);
        this.refs.sider_bar.onUpdateSiderBar();
        //this.refs.pic_com.getImageByAbnormalId();
        this.refs.pic_com.reRecognizedState(true) //提交识别数据
    }

    handleChange = (value) => {
        console.log('---->' + value);
        this.setState({
            selected: value
        });
    }

    user_answer_display(answer){
        if(answer === -1){
            return '';
        } else {
            return String.fromCharCode ( 'A'.charCodeAt ( 0 )  +  answer )
        }
    }

    opts_output(opt){
        let str = '';
        if(Array.isArray(opt)){
            opt.forEach((o) => {
                str += this.user_answer_display(o);
            });
        }
        return str;
    }

    componentWillReceiveProps(props){
        console.log('fatal componentWillReceiveProps')
        console.log(props);
        var This = this;
        this.setState({
            abnormal_id: props.match.params.abnormal_id,
            pic_abnormal_id: props.match.params.abnormal_id,
            pic_selected_id: props.match.params.abnormal_id,
            selected: 0 ,
            exam_number: null,
            loading: false,
            btn_name: '二次识别',
            show_res: false
        },function () {
            This.updateDetailData();
            //This.refs.sider_bar.onUpdateSiderBar('init');
        });

    }
    //点击正反面
    onHandlePagesSideClick(_id){
        var This = this;
        console.log(_id);
        this.setState({
            pic_selected_id: _id,
            selected: 0
        })
    }
    render(){

        return(
            <div>
                <div className="page" id="page">
                    <div className="page_left" id="left">
                        <AbnormalSiderBar
                            abnormal_id={this.state.abnormal_id}
                            ref="sider_bar"
                            activeKey="1"
                        />
                    </div>
                    <div className="page_middle" id="middle">
                        <AbnormalPictureCorrect
                            recognition="true"
                            onPagesSideClick={this.onHandlePagesSideClick.bind(this)}
                            ref="pic_com"
                            abnormal_id={this.state.pic_abnormal_id}
                            cover_index={this.state.selected}
                        />
                    </div>
                    <div className="page_right" id="right">
                        {this.state.abnormal_id === this.state.pic_selected_id ?
                            (
                                <div className="assign_result">
                                    { this.state.show_res ?
                                        (
                                            <div>
                                                <div className="title">
                                                    <span
                                                        style={{display: this.state.exam_number ? 'inline-block':'none'}}
                                                    ><Icon type="check-circle" style={{color: '#3Ac41A', fontSize:16, marginRight: 8}}/></span>
                                                    识别出的学号：{this.state.exam_number ? this.state.exam_number: '未识别出学号'}</div>
                                                <div>客观题识别结果：</div>
                                                <div id="objective_item_box">
                                                    <ObjectiveItem items={this.state.objective_items} />
                                                </div>
                                                <div className="op_btns">

                                                    {
                                                        this.state.has_submited ? (
                                                            <div>
                                                                <Button onClick={this.clearSubmitResultClick.bind(this)} type="primary" style={{width: 120}}>取消二次识别</Button>
                                                            </div>
                                                        ):(
                                                            <div>
                                                                <Button onClick={this.backRecognitionClick.bind(this)} type="primary" ghost >取消</Button>
                                                                <Button onClick={this.recognitionSubmitClick.bind(this)} type="primary">提交</Button>
                                                            </div>
                                                        )
                                                    }

                                                </div>
                                            </div>
                                        )
                                        : (
                                            <div>
                                                <div className="title">操作步骤：</div>
                                                <div className="tips">
                                                    <div className="t"><span className="label">1</span>请确定该卷为本科考卷，若不是，请删除。</div>
                                                    <div className="t"><span className="label">2</span>若不清晰，请找到本卷的卷纸后，重新扫描。</div>
                                                    <div className="t"><span className="label">3</span>
                                                            请选择当前答题卡所属页数
                                                            <Select placeholder="未选" style={{width: 80, marginLeft: 10}}
                                                                            onChange={this.handleChange}
                                                                            value={this.state.selected > 0 ? this.state.selected: '未选'}
                                                            >
                                                                    {
                                                                            this.state.ret_pages.map((scan_data, index) => {
                                                                                    const page_num = index + 1;
                                                                                    return (<Option value={page_num} key={`opt-${page_num}`}>{page_num}</Option>)
                                                                            })
                                                                    }
                                                            </Select>
                                                    </div>
                                                    <div className="t"><span className="label">4</span>按照网格线水平矫正答题卡，同时拖动鼠标，使答题卡和图片重合。</div>
                                                </div>
                                                <div className="op_btns">
                                                    <Button onClick={this.removeClick.bind(this)} type="primary" style={{width: 90}}
                                                            ghost>删除</Button>
                                                    <Button
                                                        onClick={this.recognitionClick.bind(this)}
                                                        type="primary"
                                                        loading={this.state.loading}
                                                        style={{width: 90}}
                                                    >
                                                        {this.state.btn_name}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            ) : (
                                <div className="assign_result">
                                    <div className="title">提示：</div>
                                    <div className="tips">
                                        <div className="t">1.反面未识别异常，您无需操作</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Fatal;