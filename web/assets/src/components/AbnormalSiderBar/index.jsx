
import React, { Component } from 'react';
import { Collapse,message } from 'antd';
import { Column, Table, List } from 'react-virtualized';
import classNames from 'classnames';
import './style.less';
import YQ from '@components/yq.jsx'
import {Link} from 'react-router-dom';
import ab_done_img from '@imgs/ab_done.svg'
const Panel = Collapse.Panel;
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
//10000行列表压测
var _test_list = [];
for(var i=0;i<5000;i++){
    _test_list.push({
        be_done: true,
        exam_number: '011212-' + i,
        id: 'xxxxx'+i,
        real_name: 'Tvisl'
    });
}

var ERROR_LIST = ['x','fatal_error','absent_error','objective_error','number_error','missing_error'];
var ERROR_NAME = ['x','试卷识别异常','缺考异常','客观题异常','考生识别异常','试卷缺页异常'];
var ROUTE_KEY_MAP = {
    'fatal_error': 1,
    'absent_error': 2,
    'number_error': 4,
    'objective_error': 3,
    'missing_error': 5
}

var ROUTE_MAP = {
    'fatal_error': 'fatal',
    'absent_error': 'absent',
    'number_error': 'student',
    'objective_error': 'objective',
    'missing_error': 'losing'
}
class AbnormalSiderBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            abnormal_id: this.props.abnormal_id,
            exception_data: {},
            activeKey: null,
            panelBoxHeight: 375
        }
        this.tail_route = YQ.util.get_tail_route(window.location.href);
        console.log('AbnormalSiderBar ==> ', props);
        this.onUpdateSiderBar = this.onUpdateSiderBar.bind(this);
        this.onSkipNext = this.onSkipNext.bind(this);
    }
    componentDidMount(){
        this.onUpdateSiderBar('init');
        var This = this;
        ipcRenderer.on('message-update-siderbar-list', function (evt, route) {
            This.onUpdateSiderBar('init');
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-update-siderbar-list');
        this.setState = (state,callback)=>{
            return;
        };
    }
    onIgnoreAllClick(e){
        e.stopPropagation();
        var _url = YQ.util.make_local_url('/ignore_objective');
        var _this = this;
        YQ.http.post(_url, {}, function () {
            console.log('忽略成功');
            _this.onUpdateSiderBar();
        })
    }
    //跳转到下一个未处理的选项 'next' 'first'
    onSkipNext(flag){
        var type = ERROR_LIST[this.state.activeKey];
        if(!type)return;
        //如果全部处理完，显示客观题异常处理完毕

        var _scan_datas = this.state.exception_data[type].scan_datas;
        var _id = null;
        if(flag == 'next'){
            var over = true;
            for(var i=0;i<_scan_datas.length;i++){
                if(this.state.abnormal_id === _scan_datas[i].id){
                    if(i<_scan_datas.length-1){
                        _id = _scan_datas[i+1].id;
                    }
                }
                if(!_scan_datas[i].be_done){
                    over = false;
                }
            }
            if(type == 'missing_error'){

                if(_scan_datas.length == 0){
                    over = true;
                }else{
                    _id = _scan_datas[0].id
                }
                console.log('over>>' + over)
            }
            if(over){
                message.config({
                    duration: 2,
                    maxCount: 2,
                    top: 250
                })
                message.info(`${ERROR_NAME[this.state.activeKey]} 已处理完毕`);
            }
        }else if(flag == 'first'){
            if(_scan_datas.length>0)
                _id = _scan_datas[0].id;
        }
        if(!_id)return;
        console.log('跳转到下一个未处理的选项');
        console.log(_id);
        window.location.href = `#/abnormal/${_id}/${ROUTE_MAP[type]}`;

    }
    render_panel(type, title, router, key){

        // fatal_error  图像识别失败
        // absent_error 缺考
        // missing_students  缺页
        // number_error  学号
        // objective_error 客观题
        const self = this;
        const errors = this.state.exception_data[type];
        if(!errors){
            return (
                <Panel header={`${title} (0)`}  key={key}>
                    <div className="panel_box" />
                </Panel>
            )
        }
        const { all_count, scan_datas, deal_count } = errors;

        let count =  `(${all_count})`;
        const { abnormal_id } = this.state;
        var header;
        if(!all_count){
            return (
                <Panel header={`${title} (0)`} key={key}>
                    <div className="panel_box" />
                </Panel>
            )
        }
        if(deal_count>=0){
            count = (
                <span>
                    (<span className="deal_span">{deal_count}</span>/<span className="all_span">{all_count}</span>)
                </span>
            );
        }
        if(router == 'objective'){
            header = (
                <span>
                    {title} {count}
                    <a className="ignore_all" onClick={this.onIgnoreAllClick.bind(this)}>批量忽略</a>
                </span>
            )
        }else{
            header = (
                <span>
                    {title} {count}
                </span>
            );
        }
        return (
            <Panel header={header} key={key}>
                <div className="panel_box" id="panel_box" >
                    <Table
                        width={275}
                        height={375}
                        rowHeight={30}
                        rowCount={scan_datas.length}
                        rowGetter={({ index }) => scan_datas[index]}
                    >
                        <Column
                            label='Name'
                            width={276}
                            dataKey=""
                            style={{margin: 0}}
                            cellRenderer={function ({rowData, rowIndex}) {

                                const { id, be_done, exam_number, real_name } = rowData;
                                const path = `/abnormal/${id}/${router}`;
                                const link_class =  classNames('abnormal_link', {
                                    ['active']: abnormal_id === id,
                                });
                                return (
                                    <div key={'num_'+rowIndex} className={link_class}>
                                        {be_done ? <img className="done" src={ab_done_img} /> : null}
                                        <Link
                                            to={{pathname: path, query: {exam_number: exam_number, be_done: be_done}}}
                                        >
                                            {rowIndex + 1}
                                            {real_name ? '-' + real_name: ''}{exam_number? '-' + exam_number: ''}</Link>
                                    </div>
                                )
                            }}
                            />
                    </Table>
                </div>
            </Panel>
        )
    }

    onChange = (key)=>{
        var This = this;
        this.setState({
            activeKey: key
        },function () {
            This.onSkipNext('first');
        });
        console.log('xxxxxxxxxxxxx');

    }

    componentWillReceiveProps(props){
        this.setState({
            abnormal_id: props.abnormal_id,
            activeKey: props.activeKey
        });
    }
    //更新列表信息
    onUpdateSiderBar(fn){

        var EXCEPT_TYPES = ['fatal_error','absent_error','objective_error','number_error','missing_error'];
        var This = this;
        var _url = YQ.util.make_local_url('/get_exception_info');
        YQ.http.get(_url,{},function(result){
            if(result.type == 'AJAX'){
                console.log('SideBar列表更新');
                console.log(result.data);
                This.setState({
                    exception_data: result.data
                },function () {
                    if(fn !== 'init' && This.tail_route != 'fatal')
                        This.onSkipNext('next');
                })
            }
        })
    }
    downloadAbnormalTable(){

        //get_all_students
        const url = YQ.util.make_local_url('/get_all_students');
        const _this = this;
        (async function () {
            const all_students = await YQ.http.get(url, {});
            const res = await all_students.json();
            if(res.type === 'ERROR'){
                return;
            }
            var students = res.data.students;
            console.log(students);
            var students_dict = {};
            for(var i=0;i<students.length;i++){
                students_dict[students[i].exam_number] = students[i];
            }
            console.log(students_dict);
            console.log(_this.state.exception_data);
            var EXCEPT_NAME = {
                'fatal_error': '试卷识别异常',   //二维码 识别异常
                'number_error': '学号异常', //学号异常
                'muti_error': '重复异常',   //重复异常
                'absent_error': '缺考异常',  //缺考异常
                'objective_error': '客观题异常', //客观题异常
                'missing_error': '缺页异常'  //缺页 异常
            }
            var CATCH_TYPE = ['fatal_error', 'absent_error', 'objective_error', 'number_error'];
            var EXAM_INFO = YQ.util.get_ini('exam_info');

            var table_head = ['考试名称','学科','年级','班级','学生姓名','考号','异常类型'];
            var data_sheets = [];
            for(var i=0;i<CATCH_TYPE.length;i++){
                var _catch = _this.state.exception_data[CATCH_TYPE[i]];
                var _scan_datas = _catch.scan_datas;
                var sheet = [];
                sheet.push(table_head);
                for(let item of _scan_datas){

                    //var detail_data = m_scanInfo.get_error_data(item.id , EXCEPT_MAP[CATCH_TYPE[i]])
                    //console.log(item);
                    var _trs = [];
                    _trs.push(EXAM_INFO.exam_name ? EXAM_INFO.exam_name : '-/-');
                    _trs.push(EXAM_INFO.subject_name?EXAM_INFO.subject_name:'-/-');
                    _trs.push(EXAM_INFO.school_name?EXAM_INFO.school_name:'-/-');
                    if(students_dict[item.exam_number]){
                        _trs.push(students_dict[item.exam_number].class_name);
                    }else{
                        _trs.push('-/-');
                    }
                    _trs.push(item.real_name ? item.real_name: '-/-');
                    _trs.push(item.exam_number ? item.exam_number: '-/-');
                    _trs.push(EXCEPT_NAME[CATCH_TYPE[i]]);
                    sheet.push(_trs);

                }
                data_sheets.push({
                    name: EXCEPT_NAME[CATCH_TYPE[i]],
                    data: sheet
                })
            }
            console.log(data_sheets);
            ipcRenderer.send('message-download-abnormal-excel',data_sheets);

        })();
    }
    render() {
        return (
            <div className="_abnormal_nav_com">
                <div className="side_bar_title">
                    <span>异常列表</span>
                    <label onClick={this.downloadAbnormalTable.bind(this)}>下载异常列表</label>
                </div>
                <Collapse
                    activeKey={[this.state.activeKey]}
                    onChange={this.onChange}
                    accordion
                >
                    {this.render_panel('fatal_error', '试卷识别异常', 'fatal', '1')}
                    {this.render_panel('absent_error', '缺考识别异常', 'absent', '2')}
                    {this.render_panel('number_error', '考生识别异常', 'student', '4')}
                    {this.render_panel('objective_error', '客观题异常', 'objective', '3')}
                    {this.render_panel('missing_error', '试卷缺页异常', 'losing', '5')}

                </Collapse>
            </div>
        );
    }
}
export default AbnormalSiderBar;
