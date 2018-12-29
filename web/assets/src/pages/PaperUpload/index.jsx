import React, {Component} from 'react';
import { Layout, Button, Tooltip, Dropdown } from 'antd'
const { Header, Content, Sider } = Layout;
import { Column, Table } from 'react-virtualized';

import PageHeader from '@components/PageHeader';
import PageContent from '@components/PageContent';
import ExamInfoHeader from '@components/ExamInfoHeader';
import ScanButton from '@components/ScanButton';
import UserInfoBar from '@components/UserInfoBar';
import SystemState from '@components/SystemState';
import StopScanDialog from '@components/StopScanDialog';
import LeakingSetting from '@components/LeakingSetting'
import PictureAnimation from '@components/PictureAnimation'
import CurrentTemplate from '@components/CurrentTemplate'
import ImportPictures from '@components/ImportPictures'
import classNames from 'classnames';
import YQ from '@components/yq';
import { Collapse,Icon, Spin, notification } from 'antd';
import './style.less';
import $ from 'jquery';
import scan_layer from '@imgs/scan_layer.png';
import scan_bg from '@imgs/scan_bg.png';
const Panel = Collapse.Panel;
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const _check_url = YQ.util.make_local_url('/checkout_stop');

import Global from '@fx/General.jsx';

function answer_format (_objective_items) {
    console.log(_objective_items);
    const items = [];
    var order = 1;
    if(_objective_items.length == 0){
        items.push('未识别出客观题');
        return items;
    }
    for(let item of _objective_items){
        let answer_arr = item.answer_arr;
        let options_arr = item.options_arr;
        let qs = [];
        var _str = `${item.item_num}. `;
        for(var i=0;i<answer_arr.length;i++){
            if(answer_arr.length > 1){
                _str += `(${i}).`
            }
            var _re_res = answer_map(answer_arr[i], options_arr[i]);
            _str += (_re_res.length > 0 ? _re_res: '未作答');
            _str += ' ，';
        }
        items.push(_str)
        order++;
    }
    return items;
}
// [1,3]  ['A','B','C','D]  return B,D
function answer_map(ans_arr, opt_arr){
    var _res = '';
    for(var r = 0 ; r< ans_arr.length ;r++){
        if(opt_arr[ans_arr[r]])
            _res += opt_arr[ans_arr[r]];
    }
    return _res;
}
//10000行列表压测
var _test_list = [];
for(var i=0;i<10000;i++){
    _test_list.push({
        exam_number: '0513152',
        real_name: 'Vsisd' + i,
        uploaded: true,
        student_id: 'klx_sdfsafadfa' + i
    });
}
//----------
function on_document_mouseup(){
    $('#batch_delete_menu').hide();
    $('#student_delete_menu').hide();
    document.onmouseup = null;
    console.log('on_document_mouseup')
}
class PaperUpload extends Component{
    constructor(props){
        super(props);
        this.state = {
            batch_list: [],
            normal_list: [],
            scan_number: 0,
            catch_number: 0,
            upload_number: 0,
            recognize_number: 0,
            current_image_url: null,
            current_image_url_v2: null,
            recognize_result: ' ',
            exam_number: ' ',
            real_name: ' ',
            test_list: [],
            batchSelected: null,
            normalTableHeight: 155,
            student_selected: null,
            uploading_student_id: null,
            uploading_progress: 0,
            loading: true
        }
        this.val = 500;
        this.timer = null;
        this.timer_low = null;
        this.batch_id = null;  //当前正在识别的图片所在批次
        this.layerWidth = null;
        this.first_update = true;
        this.updateBatchList = this.updateBatchList.bind(this);
        this.onOpenExceptionWindow = this.onOpenExceptionWindow.bind(this);
        this.onStopCurrentScan = this.onStopCurrentScan.bind(this);
        this.onMissingClick = this.onMissingClick.bind(this);
        this.onClearPictureInfo = this.onClearPictureInfo.bind(this);
        this.onEndScanHandle = this.onEndScanHandle.bind(this)
        this.onStartScanHandle = this.onStartScanHandle.bind(this)
        this.changeLayout = this.changeLayout.bind(this)
        this.sortPriority = this.sortPriority.bind(this)
        this.uploadRecgonizeResultButton = this.uploadRecgonizeResultButton.bind(this)
        this.updateLasterImage = this.updateLasterImage.bind(this)
        this.updateStudentObjectiveImage = this.updateStudentObjectiveImage.bind(this)
        remote.getGlobal('sharedObject').scan_type = 'system';
        remote.getGlobal('sharedObject').paper_show = 'true';
        this.anscard_type = YQ.util.get_ini('anscard_type');
    }

    componentDidMount(){

        var This = this;
        This.val = 500;
        //刚启动设置500ms，执行10次
        var _count = 0;
        this.timer_low = setInterval(function () {
            _count ++;
            console.log(_count);
            This.updateBatchList();
            if(_count > 4){
                clearInterval(This.timer_low);
                This.timer_low = null;
            }
        },500);

        this.timer = setInterval(function() {
            This.updateBatchList();
        },3000)

        $('ul#batch_delete_menu').on('click', 'li', function () {

            var _tid = $(this).attr('tid');
            if(_tid == 1){
                This.onBatchDeleteMouseClick(); //删除批次
            }else{
                This.onBatchReRecognized(); //重新识别该批次
            }

        })
        $('ul#student_delete_menu').on('click', 'li', function () {
            var _tid = $(this).attr('tid');
            if(_tid == 1){
                //删除学生信息
                var _url = YQ.util.make_local_url('/delete_losing_student');//delete_losing_student
                if(!This.state.student_selected)
                    return;
                YQ.http.post(_url,{student_id: This.state.student_selected}, function (res) {
                    console.log(res);
                    if(res.type === 'AJAX'){
                        console.log('删除成功'+This.state.student_selected);
                        This.updateBatchList();
                    }else{
                        console.log('删除fail'+This.state.student_selected);
                    }
                })
            }
        })
        ipcRenderer.on('message-error-code', (e, arg) => {
            var _html = `${arg.type} 错误码: ${arg.code}，错误信息：${arg.msg}，请联系后台人员`;
            $('#error_code').html(_html);
            $('#error_code').attr('title', _html)
            $('#error_code_tip').show();
        })
        ipcRenderer.on('message-update-recognize-image', (e, arg) => {

        })

        ipcRenderer.on('message-update-recognize-result', (e, arg) => {
            This.updateStudentObjectiveImage(arg, true)
        });
        ipcRenderer.on('message-paper-upload-image-start', (e, arg) => {
            var _normal_list = This.sortPriority(This.state.normal_list, arg.student_id);
            This.setState({
                normal_list: _normal_list,
                uploading_student_id: arg.student_id
            })
        })
        ipcRenderer.on('message-paper-upload-image-progress', (e, arg) => {

            var _pro = parseInt(arg.progress * 100);
            This.setState({
                uploading_progress: _pro
            })
            if(_pro > 99){
                var imgList = This.state.normal_list;
                for(var i=0;i<imgList.length; i++){
                    if(arg.student_id == imgList[i].student_id){
                        imgList[i].uploaded = true;
                        This.setState({
                            image_list: imgList,
                            image_id: null
                        })
                        break;
                    }
                }
            }
        })
        this.changeLayout(this);
        $(window).on('resize', function () {
            This.changeLayout(This);
        })
    }
    changeLayout = (This) => {
        var windowW = $(window).width();
        var bar_height = $("#left_bar").outerHeight();
        var bar_height_rest = (bar_height - 158) / 2;
        var table_height = bar_height_rest - 76;
        var pic_box_height = bar_height - 125;
        var pic_box_width = windowW - 290 - 60;
        $("#batch_panel").outerHeight(bar_height_rest);
        $("#normal_panel").outerHeight(bar_height_rest);
        $("#batch_list").outerHeight(table_height);
        $("#normal_list").outerHeight(table_height);
        This.refs.pic_ani.boxResize(pic_box_width,pic_box_height);
        //console.log(pic_box_width,pic_box_height);
        This.setState({
            normalTableHeight: table_height
        })

    };
    componentWillUnmount = () => {
        ipcRenderer.removeAllListeners('message-update-recognize-image');
        ipcRenderer.removeAllListeners('message-update-recognize-result');
        ipcRenderer.removeAllListeners('message-paper-upload-image-start');
        ipcRenderer.removeAllListeners('message-paper-upload-image-progress');
        remote.getGlobal('sharedObject').paper_show = 'false';
        $(window).unbind('resize');
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
        if(this.timer_low){
            clearInterval(this.timer_low);
            this.timer_low = null;
        }
        this.setState = (state,callback)=>{
            return;
        };
    }
    //上传优化
    sortPriority(_imglist, _student_id){
        //增在上传放到第一行，所有完成的放在最后面
        var templist = _imglist;
        templist.sort(function (a, b) {
            var upload1 = a.uploaded;
            var upload2 = b.uploaded;
            if(upload1 === false && upload2 != false){
                return -1;
            }else if(upload1 != false && upload2 === false){
                return 1;
            }
        })
        for(var i=0;i<templist.length;i++){
            if(templist[i].student_id == _student_id){
                if(i > 0){
                    var _tep = templist[0];
                    templist[0] = templist[i];
                    templist[i] = _tep;
                }
                break;
            }
        }
        return templist;
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (1) {
            return true;
        }
        return false;
    }
    updateStudentObjectiveImage(arg, animate){

        console.log(arg);
        var _result = answer_format(arg.objective_items);
        var _real_name = '未识别';
        var _exam_number = '未识别';
        if(arg.student){
            _real_name = arg.student.real_name;
            _exam_number = arg.student.exam_number;
        }
        this.setState({
            real_name: _real_name,
            exam_number: _exam_number,
            recognize_result: _result
        })
        this.batch_id = arg.batch_id;
        if(animate){
            this.refs.pic_ani.addImageUrl(arg.url1);
        }else{
            this.refs.pic_ani.updateImageUrl(arg.url1)
        }
    }
    updateBatchList(){
        var This = this;
        var _batch_url = YQ.util.make_local_url('/get_batchs');
        YQ.http.get(_batch_url, {}, function (res) {
            //console.log(res)
            if (res.type != 'ERROR') {
                var _normal_list = This.sortPriority(res.data.normal_list, This.state.uploading_student_id);
                This.setState({
                    loading: false,
                    batch_list: res.data.batchs_list,
                    normal_list: _normal_list,
                    scan_number: res.data.pages_total,
                    catch_number: res.data.catch_total,
                    upload_number: res.data.upload_total,
                    recognize_number: parseInt(res.data.recognize_total)
                });
                if(This.first_update){
                    This.first_update = false;
                    This.updateLasterImage()
                }
            }
        })
    }
    updateLasterImage(){
        var _url = YQ.util.make_local_url('/get_laster_image')
        var This = this;
        YQ.http.get(_url, {}, function (res) {
            if(res.type != 'ERROR')
                This.updateStudentObjectiveImage(res.data, false)
        })
    }
    onOpenExceptionWindow(){
        // fatal_error  图像识别失败
        // absent_error 缺考
        // missing_students  缺页
        // number_error  学号
        // objective_error 客观题
        var type_map = {
            'fatal_error': 'fatal',
            'absent_error': 'absent',
            'objective_error': 'objective',
            'number_error': 'student',
            'missing_error': 'losing',
        }
        var type_arr = ['fatal_error','absent_error','number_error','objective_error','missing_error'];
        //打开窗口之前保存当前异常列表
        var This = this;
        var _url = YQ.util.make_local_url('/get_exception_info');
        YQ.http.get(_url,{},function(result){
            console.log(result);
            if(result.type == 'AJAX'){

                var abnormal_id = null;
                var abnormal_route = 'fatal';
                for(var t = 0; t< type_arr.length; t++){
                    var _type = type_arr[t];
                    console.log(result.data[_type], _type);
                    var _scan_data = result.data[_type].scan_datas;
                    console.log(_scan_data);
                    if(_scan_data.length > 0){
                        abnormal_route = type_map[_type];
                        abnormal_id = _scan_data[0].id;
                        break;
                    }
                }
                console.log(abnormal_id, abnormal_route);
                if(abnormal_id)
                {
                    var m_route = '#/abnormal/'+abnormal_id+'/' + abnormal_route;
                    ipcRenderer.send('message-open-except-window',m_route);
                    //window.location.href = '#/abnormal/'+abnormal_id+'/' + abnormal_route;
                }
                else{
                    //window.open('#/abnormal/undefined/' + 'fatal');
                    //var m_route = '#/abnormal/undefined/fatal';  home
                    var m_route = '#/home';
                    ipcRenderer.send('message-open-except-window',m_route);
                }

            }
        })
    }
    onEndScanHandle(){
        this.refs.pic_ani.hideLayer();
    }
    onStartScanHandle(){
        console.log('开始扫描');
        this.refs.pic_ani.showLayer();
    }
    onStopCurrentScan(){
        this.refs.stop_scan_dlg.showDialog();
    }
    onBatchReRecognized(){
        var This = this;
        if(this.state.batchSelected){
            var m_url = YQ.util.make_local_url('/re_recognized_batch');
            YQ.http.post(m_url, {batch_id: this.state.batchSelected}, function (res) {
                if (res.type != 'ERROR') {
                    console.log('重新识别该批次');
                    console.log(This.batch_id, This.state.batchSelected);
                    This.updateBatchList();
                }
            })
        }else{
            console.log('not batchSelected');
        }
    }
    onBatchDeleteMouseClick(e){
        var This = this;
        if(this.state.batchSelected){
            var m_url = YQ.util.make_local_url('/delete_batch');
            YQ.http.post(m_url, {batch_id: this.state.batchSelected}, function (res) {
                if (res.type != 'ERROR') {
                    console.log('删除成功');
                    console.log(This.batch_id, This.state.batchSelected);
                    if(This.batch_id == This.state.batchSelected){
                        This.onClearPictureInfo();
                        This.refs.pic_ani.clearImageUrl();
                    }
                    This.updateBatchList();
                }
            })
        }else{
            console.log('not batchSelected');
        }
    }
    onClearPictureInfo(){
        this.setState({
            current_image_url:null,
            current_image_url_v2:null,
            exam_number: ' ',
            real_name: ' ',
            recognize_result:' '
        })
    }
    onCertainStopCallback(){
        console.log('确认结束');
        this.onClearPictureInfo();
    }
    onMissingClick(){
        console.log("xxxxx");
        this.refs.directory_dlg.showDialog();
    }
    uploadStatus(rowData){
        if(rowData.student_id == this.state.uploading_student_id && this.state.uploading_progress < 100){
            return (
                <div style={{color: '#444'}}>{this.state.uploading_progress}%</div>
            )
        }
        else {
            if(rowData.uploaded === false){
                return (
                    <div style={{color: '#444'}}>待上传</div>
                )
            }else{
                return (
                    <div style={{color: '#13D469'}}>完成</div>
                )
            }
        }

    }
    uploadRecgonizeResultButton(){
        var active_style = {}
        if(this.state.scan_number > Global.limit_number){
            active_style.backgroundColor = '#13D469';
            active_style.borderColor = '#13D469';
        }

        Global.scan_number = this.state.scan_number;
        return (
            <Button
                type="primary"
                onClick={this.onStopCurrentScan}
                style={active_style}
            >
                上传识别数据
            </Button>
        )
    }
    render(){
        var This = this;
        return(
            <div className="paper_upload_html">
                <LeakingSetting ref="directory_dlg" />
                <PageHeader>
                    <div className="app_system_state"><SystemState/></div>
                    <div className="app_user"><UserInfoBar/></div>
                    <div className="app_exam_info">
                        <div className="exam_info"><ExamInfoHeader /></div>
                        <div className="scan_btn">
                            <ScanButton
                                onEndScan={this.onEndScanHandle}
                                onStartScan={this.onStartScanHandle}
                            />
                        </div>
                        <div className="import_btn"><ImportPictures/></div>
                    </div>
                    <div className="app_current_template" style={{display: this.anscard_type == 'thirdparty'? 'block':'none'}}>
                        <CurrentTemplate url="/paper_upload"/>
                    </div>
                </PageHeader>
                <PageContent>
                    <Layout style={{height:'100%'}} id="left_bar">
                        <Sider width={280}>
                            <div className="state_show" id="state_show">
                                <table>
                                    <tbody>
                                        <tr style={{height:30,fontSize:24}}>
                                            <td style={{color: '#111'}}>{this.state.scan_number}</td>
                                            <td style={{color: '#111'}}>{this.state.recognize_number}</td>
                                            <td style={{color: '#FF796B'}}>{this.state.catch_number}</td>
                                            <td style={{color: '#85C381'}}>{this.state.upload_number}</td>
                                        </tr>
                                        <tr style={{height:24}} className="preview_count">
                                            <td>扫描张数</td>
                                            <td>识别张数</td>
                                            <td>待处理</td>
                                            <td>上传人数</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="op_btns">
                                    <Button type="primary" style={{width:110}} onClick={this.onOpenExceptionWindow}>
                                        处理答题卡
                                    </Button>
                                    {
                                        this.uploadRecgonizeResultButton()
                                    }

                                    <StopScanDialog ref="stop_scan_dlg" onCertainStopCallback={this.onCertainStopCallback.bind(this)}/>
                                </div>

                            </div>
                            <div className="batch_panel" id="batch_panel">
                                <div className="top_bar">
                                    <span className="_title">扫描批次</span>
                                    <span className="_missing" onClick={this.onMissingClick}>漏扫检查</span>
                                </div>
                                <table className="batch_header">
                                    <thead>
                                        <tr>
                                            <td style={{width:60}}>批次</td>
                                            <td style={{width:80}}>扫描张数</td>
                                            <td style={{width:70}}>待处理</td>
                                            <td style={{width:80}}>上传人数</td>
                                        </tr>
                                    </thead>
                                </table>
                                <div className="batch_list" id="batch_list">
                                    {
                                        this.state.batch_list.length > 0 ?(
                                            <Table
                                                width={278}
                                                height={this.state.normalTableHeight}
                                                headerHeight={20}
                                                rowHeight={25}
                                                disableHeader={true}
                                                rowCount={this.state.batch_list.length}
                                                onRowRightClick={({event, index, rowData}) =>{
                                                        console.log(event.pageX, event.pageY,index, rowData);
                                                        This.setState({
                                                            batchSelected: rowData.batch_id
                                                        })

                                                        $('#batch_delete_menu').css({
                                                            left: event.pageX + 'px',
                                                            top: event.pageY + 'px',
                                                            display:'block'
                                                        })
                                                        document.onmouseup = on_document_mouseup;
                                                    }
                                                }
                                                onRowClick={({event, index, rowData}) =>{
                                                        This.setState({
                                                            batchSelected: rowData.batch_id
                                                        })
                                                    }
                                                }
                                                rowGetter={({ index }) => this.state.batch_list[index]}
                                            >
                                                <Column
                                                    label='Name'
                                                    dataKey='catch_num'
                                                    width={278}
                                                    style={{textAlign:'center',margin: 0}}
                                                    cellRenderer={function ({rowData, rowIndex}) {
                                                        var _active = (rowData.batch_id === This.state.batchSelected)?'#eaf0fb':'#fff';
                                                        return (
                                                            <div className="batch_row" style={{backgroundColor:_active}}>
                                                                <span style={{width:40}}>{rowData.index}</span>
                                                                <span style={{width:88}}>{rowData.batch_size}</span>

                                                                <span style={{width:60,color: rowData.catch_num ? '#FD5454':'#444'}}>
                                                                    {rowData.catch_num}
                                                                </span>
                                                                <span style={{width:80}}>{rowData.upload_num}</span>
                                                            </div>
                                                        )
                                                    }}
                                                />

                                            </Table>
                                        ):(
                                            <div className="no_content">
                                                {
                                                    this.state.loading ? (
                                                        <Spin tip="Loading..." size="default" spinning={true}></Spin>
                                                    ):(
                                                        <div className="text">暂无内容</div>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="normal_panel" id="normal_panel">
                                <div className="_title">
                                    正常卷列表
                                    <a style={{ marginLeft: 90}}
                                       onClick={()=>{
                                            const m_route = '#/normal';
                                            ipcRenderer.send('message-open-except-window',m_route);
                                        }}
                                    >查看正常卷列表</a>
                                </div>
                                <table className="normal_header"  style={{width:280}}>
                                    <thead>
                                        <tr>
                                            <td style={{ width: 98 }}>考生</td>
                                            <td style={{ width: 100 }}>考号</td>
                                            <td style={{ width: 110 }} >上传状态</td>
                                        </tr>
                                    </thead>
                                </table>

                                <div className="normal_list" id="normal_list">
                                    {
                                        this.state.normal_list.length > 0 ?(
                                            <Table
                                                width={278}
                                                height={this.state.normalTableHeight}
                                                headerHeight={20}
                                                rowHeight={25}
                                                disableHeader={true}
                                                rowCount={this.state.normal_list.length}
                                                rowGetter={({ index }) => this.state.normal_list[index]}
                                                onRowRightClick={({event, index, rowData}) =>{
                                                    console.log(event.pageX, event.pageY,index, rowData);
                                                    This.setState({
                                                        student_selected: rowData.student_id
                                                    })

                                                    $('#student_delete_menu').css({
                                                        left: event.pageX + 'px',
                                                        top: event.pageY + 'px',
                                                        display:'block'
                                                    })
                                                    document.onmouseup = on_document_mouseup;
                                                }
                                                }
                                                onRowClick={({event, index, rowData}) =>{
                                                    This.setState({
                                                        student_selected: rowData.student_id
                                                    })
                                                }
                                                }
                                            >
                                                <Column
                                                    label='Name'
                                                    dataKey='uploaded'
                                                    width={278}
                                                    style={{textAlign:'center',margin: 0}}
                                                    cellRenderer={function ({rowData, rowIndex}) {
                                                        var _active = (rowData.student_id === This.state.student_selected)?'#eaf0fb':'#fff';
                                                        return (
                                                            <div className="normal_row" style={{backgroundColor:_active}}>
                                                                <span style={{width:90}}>{rowData.real_name}</span>
                                                                <span style={{width:90}}>{rowData.exam_number}</span>
                                                                <span style={{width:90}}>
                                                                    {This.uploadStatus(rowData)}
                                                                </span>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            </Table>
                                        ):(
                                            <div className="no_content">
                                                {
                                                    this.state.loading ? (
                                                        <Spin tip="Loading..." size="default" spinning={true}></Spin>
                                                    ):(
                                                        <div className="text">暂无内容</div>
                                                    )
                                                }
                                            </div>
                                        )
                                    }

                                </div>
                            </div>
                        </Sider>
                        <Layout>
                            <Header>
                                考号：
                                <span className="txt_span">
                                {this.state.exam_number}
                                </span>
                                学生：
                                <span className="txt_span">{this.state.real_name}</span>
                                客观题答案：
                                <Tooltip  title={this.state.recognize_result}>
                                    <span>{this.state.recognize_result}</span>
                                </Tooltip>
                            </Header>
                            <Content style={{padding:20, position:'relative'}} id="pic_bar">
                                <div className="error_code_tip" id="error_code_tip">
                                    <Icon type="exclamation-circle" style={{fontSize:12, color:'#F42424', marginRight:8}} />
                                    <div id="error_code" className="error_code"></div>
                                    <div className="tip_close" onClick={() => {
                                        $('#error_code_tip').hide();
                                    }}>×</div>
                                </div>
                                <PictureAnimation ref="pic_ani"/>
                            </Content>
                        </Layout>
                    </Layout>
                </PageContent>
                <ul className="batch_delete_menu" id="batch_delete_menu">
                    <li tid="2">用当前模板重新识别</li>
                    <li tid="1">删除该批次</li>
                </ul>
                <ul className="batch_delete_menu" id="student_delete_menu">
                    <li tid="1">删除该学生试卷</li>
                </ul>
            </div>
        )
    }
}

export default PaperUpload;
