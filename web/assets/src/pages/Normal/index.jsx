import React, { Component } from 'react';
import { Button, Modal, Radio, Input } from 'antd';
import { Column, Table, List } from 'react-virtualized';
import YQ from '@components/yq.jsx';
import SubPage from '@components/SubPage';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect';
import ObjectiveItem from '@components/ObjectiveItem';
import ModalTitle from '@components/ModalTitle'
import './style.less';
import $ from 'jquery';
const Search = Input.Search;

const electron = window.require('electron');
const {ipcRenderer} = electron;

const RadioGroup = Radio.Group;

//----------
function on_document_mouseup(){
    $('#delete_normal_student').hide();
    document.onmouseup = null;
    console.log('on_document_mouseup')
}

class Normal extends Component{

    constructor(props){
        super(props);
        this.state = {
            pic_normal_id: null,
            student_id: null,
            loading: false,
            scan_datas: [],
            normal_list: [],
            normal_list_bak: [],
            items: [],
            radio_key: 1,
            visible: false,
            row_index: -1,
            table_height: 550
        };
        this.select_item = null;
        this.onChangeStudent = this.onChangeStudent.bind(this);
        this.changeLayout = this.changeLayout.bind(this);
        this.onChangeUserName = this.onChangeUserName.bind(this);
        this.onSearchUserName = this.onSearchUserName.bind(this);
        this.onFuzzyQuery = this.onFuzzyQuery.bind(this);
    }

    componentDidMount(){
        var This = this;
        this.updateNormalStudents();
        this.changeLayout();
        $(window).resize(this.changeLayout);
        $('#delete_normal_student').click(function () {
            //删除学生信息
            var _url = YQ.util.make_local_url('/delete_losing_student');//delete_losing_student
            if(!This.state.student_id)
                return;

            YQ.http.post(_url,{student_id: This.state.student_id}, function (res) {
                console.log(res);
                if(res.type === 'AJAX'){
                    console.log('删除成功'+This.state.student_id);
                    //This.refs.sider_bar.onUpdateSiderBar();
                    //This.refs.pic_com.clearPictures();
                    This.updateNormalStudents();
                }else{
                    console.log('删除fail0'+This.state.student_id);
                }
            })
        })
    }
    componentWillReceiveProps(props){
        this.updateNormalStudents();
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    changeLayout(){
        var total_width = $(window).width();
        var total_height = $(window).height();
        var pic_width = total_width - 594;
        var tbody_height = total_height - 155;
        $('#pic_box').outerWidth(pic_width);
        $('#table_body').height(tbody_height);
        $('#item_div').height(tbody_height - 5);
        this.setState({
            table_height: tbody_height - 40
        })
    };
    updateNormalStudents(){
        const This = this;
        const _batch_url = YQ.util.make_local_url('/get_normal_student_list');
        YQ.http.get(_batch_url, {}, function (res) {
            console.log('正常列表',res);
            if (res.type !== 'ERROR') {
                var _normal_list = res.data;
                if(_normal_list.length > 0){
                    This.select_item = _normal_list[0];
                    var _pic_id = (_normal_list[0].ids && _normal_list[0].ids.length > 0) ? _normal_list[0].ids[0] : null;
                    console.log(_pic_id);
                    This.setState({
                        normal_list: _normal_list,
                        normal_list_bak: _normal_list,
                        pic_normal_id: _pic_id,
                        row_index: 0,
                        student_id: _normal_list[0].student_id
                    });
                    This.onChangeStudent(_normal_list[0], 0);
                }else{
                    This.setState({
                        normal_list: _normal_list,
                        row_index: -1,
                        items: []
                    });
                }
            }
        });
    }
    onChangeStudent(item, index) {
        this.select_item = item;
        const _id = item.ids.length > 0 ? item.ids[0] : '';
        this.setState({
            pic_normal_id: _id,
            row_index: index,
            student_id: item.student_id
        });
        const _this = this;
        let result = [];
        const _url = YQ.util.make_local_url('/get_recognize_result');
        console.log(JSON.stringify(item.ids));
        YQ.http.get(_url, {abnormal_ids: JSON.stringify(item.ids)}, function (res) {
            if (res.type !== 'ERROR') {
                result = res.data;
                result.sort(function (x, y) {
                    return x.item_num - y.item_num
                });
                _this.setState({
                    items: result
                });
                console.log(result);
            }
        });
    }

    onHandlePagesSideClick(_id){
        this.setState({
            pic_normal_id: _id
        })
    }
    changeAbnormalPaper(){
        this.setState({
            visible: true
        })
    }
    certainClick(){
        /*
         'fatal_error': 1,   //二维码 识别异常
         'number_error': 2, //学号异常
         'muti_error': 3,   //重复异常
         'absent_error': 4,  //缺考异常
         'objective_error': 5, //客观题异常
         'missing_error': 6  //缺页 异常
         */
        /*
         <Radio value={1}>试卷识别异常</Radio>
         <Radio value={2}>缺考识别异常</Radio>
         <Radio value={3}>客观题识别异常</Radio>
         <Radio value={4}>考生识别异常</Radio>
         */
        var This = this;
        var _type = 1;
        if(this.state.radio_key === 1)
        {
            _type = 1;
        }else if(this.state.radio_key === 2){
            _type = 4;
        }else if(this.state.radio_key === 3){
            _type = 5;
        }else if(this.state.radio_key === 4){
            _type = 2;
        }
        var url = YQ.util.make_local_url('/sign_abnormal');
        console.log(this.select_item);

        YQ.http.post(url, {
            abnormal_id: this.state.pic_normal_id,
            type: _type ,
            ids: JSON.stringify(this.select_item.ids)
        }, function (res) {
            if(res.type === 'AJAX'){
                This.updateNormalStudents();
                This.refs.pic_com.clearPictures();
                console.log('设置为异常卡成功');
            }
        })
        this.setState({
            visible: false
        })
    }
    handleCancel(){
        this.setState({
            visible: false
        })
    }
    onRadioChange = (e) => {
        console.log('radio checked', e.target.value);
        this.setState({
            radio_key: e.target.value,
        });
    }
    onChangeUserName(e){
        console.log(e.target.value)

        this.onFuzzyQuery(e.target.value);
    }
    onSearchUserName(value){
        console.log(value);
        this.onFuzzyQuery(context)
    }
    onFuzzyQuery(context){
        //正则表达式
        var len = this.state.normal_list_bak.length;
        var arr = [];
        var reg = new RegExp(context);
        for(var i=0;i<len;i++){
            //如果字符串中不包含目标字符会返回-1
            var real_name = this.state.normal_list_bak[i].real_name;
            var exam_number = this.state.normal_list_bak[i].exam_number;

            if(real_name.match(reg) || exam_number.match(reg)){
                arr.push(this.state.normal_list_bak[i]);
            }
        }
        this.setState({
            normal_list: arr
        })
    }
    renderStudentTable() {
        const _this = this;
        return (
            <div>
                <div>
                    <table className="student_table">
                        <thead>
                        <tr>
                            <td style={{width:100}}>考生</td>
                            <td style={{width:110}}>考号</td>
                            <td style={{width:110}}>上传状态</td>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div>
                    <Table
                        width={250}
                        height={this.state.table_height}
                        rowHeight={30}
                        rowCount={this.state.normal_list.length}
                        rowGetter={({ index }) => this.state.normal_list[index]}
                        onRowRightClick={({event, index, rowData}) =>{
                                console.log(event.pageX, event.pageY,index, rowData);
                                //This.batchSelected = rowData.batch_id;
                                //This.onShowDeleteMenu(event.pageX, event.pageY);
                                _this.onChangeStudent(rowData,index);
                                $('#delete_normal_student').css({
                                    left: event.pageX + 'px',
                                    top: event.pageY + 'px',
                                    display:'block'
                                })
                                document.onmouseup = on_document_mouseup;
                            }
                        }
                        onRowClick={({event, index, rowData}) =>{
                                _this.onChangeStudent(rowData,index);
                            }
                        }
                    >
                        <Column
                            label='Name'
                            width={250}
                            dataKey='uploaded'
                            style={{textAlign:'center',margin:0}}
                            cellRenderer={function ({rowData, rowIndex}) {
                                var _status = rowData.uploaded? '完成' : '待上传';
                                var _active = (rowData.student_id === _this.state.student_id)?'#eaf0fb':'#fff';
                                return (
                                    <div className="row_stu" style={{backgroundColor: _active}}>
                                        <span style={{width:75}}>{rowData.real_name}</span>
                                        <span style={{width:80}}>{rowData.exam_number}</span>
                                        <span
                                            style={{width:90,color: rowData.uploaded ? '#13D469':'#666'}}>
                                            {_status}
                                        </span>
                                    </div>

                                )
                                console.log(rowData)
                            }}
                        />
                    </Table>
                    <div className="theme-menu" id="delete_normal_student">
                        删除该学生试卷
                    </div>
                </div>
            </div>
        );
    }
    render() {
        return(
            <div>
                <div id="page" className="page">
                    <div className="table_box" id="table_box">
                        <div className="table_title">正常试卷列表({this.state.normal_list_bak.length}人)</div>
                        <div>
                            <Search
                                placeholder="请输入姓名或者学号搜索"
                                onSearch={this.onSearchUserName}
                                onChange={this.onChangeUserName}
                                style={{ width: 250 }}
                            />
                        </div>
                        {this.renderStudentTable()}
                    </div>
                    <div className="pic_box" id="pic_box">
                        <AbnormalPictureCorrect
                            abnormal_id={this.state.pic_normal_id}
                            student_id={this.state.student_id}
                            ref="pic_com"
                            onPagesSideClick={this.onHandlePagesSideClick.bind(this)}
                        />
                    </div>
                    <div className="item_box">
                        <div className="table_title">
                            客观题识别结果
                        </div>
                        <div id="item_div">
                            <ObjectiveItem items={this.state.items} />
                        </div>
                        <div className="btn_div">
                            <Button
                                type="primary"
                                className="error_btn"
                                disabled={this.state.normal_list.length > 0 ? false : true}
                                onClick={this.changeAbnormalPaper.bind(this)}
                            >设为异常答题卡
                            </Button>
                        </div>
                    </div>
                </div>

                <Modal
                    title={<ModalTitle title="设置为异常答题卡" />}
                    visible={this.state.visible}
                    maskClosable={false}
                    onCancel={this.handleCancel.bind(this)}
                    footer={null}
                >
                    <div>
                        <div>
                            <RadioGroup onChange={this.onRadioChange} value={this.state.radio_key}>
                                <Radio value={1} style={{ marginLeft: 15, marginTop: 8, marginRight: 30, marginBottom: 16}}>试卷识别异常</Radio>
                                <Radio value={2} style={{ marginTop: 8, marginRight: 30, marginBottom: 16}}>缺考识别异常</Radio>
                                <Radio value={3} style={{ marginTop: 8, marginRight: 30, marginBottom: 16}}>客观题识别异常</Radio>
                                <Radio value={4} style={{ marginLeft: 15, marginTop: 8, marginRight: 30, marginBottom: 56}}>考生识别异常</Radio>
                            </RadioGroup>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <Button style={{ width: 100}} type="primary" onClick={this.certainClick.bind(this)}>确定</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

}

export default Normal;