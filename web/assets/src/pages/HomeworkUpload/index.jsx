
import React, { Component } from 'react';

import PageHeader from '@components/PageHeader';
import PageContent from '@components/PageContent';
import ExamInfoHeader from '@components/ExamInfoHeader';
import ScanButton from '@components/ScanButton';
import UserInfoBar from '@components/UserInfoBar';
import SystemState from '@components/SystemState';
import StopScanDialog from '@components/StopScanDialog';
import LeakingSetting from '@components/LeakingSetting'
import ImportPictures from '@components/ImportPictures'
import ModalTitle from '@components/ModalTitle'
import PictureAnimation from '@components/PictureAnimation'
import { Column, Table } from 'react-virtualized';
import { Button,Progress, Modal,Icon } from 'antd';
import $ from 'jquery';
import './style.less';
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
import YQ from '@components/yq';
//example
var _image_list = [];
for(var i=1;i<10000;i++){
    _image_list.push({
        index: i,
        batch_size: 50,
        upload_num: (i%2==0?0:20)
    })
}

class HomeWork extends Component {
    constructor(props) {
        super(props);
        console.log("constructor")

        this.state = {
            image_list: [],
            tableListHeight: 200,
            image_url: null,
            image_id: null,
            progress: 0,
            visible: false,
            total_num: 0,
            uploaded_num: 0
        }
        this.timer = null;
        remote.getGlobal('sharedObject').scan_type = 'homework';
        remote.getGlobal('sharedObject').homework_show = 'true';
        this.layoutGrid = this.layoutGrid.bind(this)
        this.onStartScanHandle = this.onStartScanHandle.bind(this);
        this.onEndScanHandle = this.onEndScanHandle.bind(this);
        this.updateList = this.updateList.bind(this);
        this.handleDialogCancel = this.handleDialogCancel.bind(this);
        this.onShowStopDialog = this.onShowStopDialog.bind(this);
        this.uploadStatus = this.uploadStatus.bind(this)

    }
    componentDidMount(){
        var This = this;
        for(var i=1;i<4;i++){
            setTimeout(function () {
                This.updateList();
            },i*500);
        }
        this.timer = setInterval(function () {
            This.updateList();
        },2000);

        ipcRenderer.on('message-homework-upload-image', function (event, res) {
            var _image_url = YQ.util.make_local_url('/'+res.filename);
            console.log(_image_url)
            var _image_list = This.sortPriority(This.state.image_list, res._id);
            This.setState({
                image_list: _image_list,
                image_url: _image_url,
                image_id: res._id,
                progress: 0
            })
            This.refs.pic_ani.addImageUrl(_image_url);
            console.log(res)
        })
        ipcRenderer.on('message-homework-upload-image-progress', function (event, arg) {

            var _pro = parseInt(arg.progress * 100);
            This.setState({
                progress: _pro
            })
            if(_pro > 99){
                var imgList = This.state.image_list;
                for(var i=0;i<imgList.length; i++){
                    if(arg._id == imgList[i].image_guid){
                        imgList[i].uploaded = 'true';
                        This.setState({
                            image_list: imgList,
                            image_id: null
                        })
                        break;
                    }
                }
            }
        })
        ipcRenderer.on('message-homework-upload-error', function (event, arg) {
            var _html = `${arg.type} 错误码: ${arg.code}，错误信息：${arg.msg}`;
            $('#error_code').html(_html);
            $('#error_code').attr('title', _html)
            $('#error_code_tip').show();
        })
        this.layoutGrid();

        $(window).on('resize', function () {
            This.layoutGrid(This);
        })
    }
    componentWillUnmount(){
        remote.getGlobal('sharedObject').homework_show = 'false';
        ipcRenderer.removeAllListeners('message-homework-upload-image')
        ipcRenderer.removeAllListeners('message-homework-upload-image-progress')
        $(window).unbind('resize');
        clearInterval(this.timer)
        this.timer = null;
        this.setState = (state,callback)=>{
            return;
        };
    }
    sortPriority(_imglist, _image_guid){
        //增在上传放到第一行，所有完成的放在最后面
        var templist = _imglist;
        templist.sort(function (a, b) {
            var upload1 = a.uploaded;
            var upload2 = b.uploaded;
            if(upload1 === 'false' && upload2 != 'false'){
                return -1;
            }else if(upload1 != 'false' && upload2 === 'false'){
                return 1;
            }
        })
        var pos = -1;
        for(var i=0;i<templist.length;i++){
            if(templist[i].image_guid == _image_guid){
                if(i > 0){
                    var _tep = templist[0];
                    templist[0] = templist[i];
                    templist[i] = _tep;
                }
            }
            if(templist[i].uploaded == 'true' && pos == -1){
                pos = i;
            }
        }
        if(pos == -1){
            pos = templist.length;
        }
        if(pos!=-1){
            for(var i=0;i<pos;i++){
                templist[i].index = templist.length - pos + 1 + i;
            }
            for(var i=pos;i<templist.length;i++){
                templist[i].index = templist.length - i;//i - pos + 1;
            }
        }
        return templist;
    }
    updateList(){
        var This = this;
        var _url = YQ.util.make_local_url('/get_homework_list');
        YQ.http.get(_url,{},function (res) {
            //console.log(res)
            if(res.type === 'AJAX'){
                var total = res.data.images_list.length;
                var _image_list = This.sortPriority(res.data.images_list, This.state.image_id)
                This.setState({
                    image_list: _image_list,
                    total_num: total,
                    uploaded_num: res.data.uploaded,
                    image_list: res.data.images_list
                })
            }
        })
    }
    onStartScanHandle(){
        console.log('开始扫描');
        this.refs.pic_ani.showLayer();
    }
    onEndScanHandle(){
        this.refs.pic_ani.hideLayer();
    }
    layoutGrid(){
        var windowW = $(window).width();
        var windowH = $(window).height();
        var pic_box_width = windowW - 300;
        var pic_box_height = windowH - 136;
        $('#context').css({
            height: (windowH - 110) + 'px'
        })
        this.setState({
            tableListHeight: (windowH - 354)
        })
        this.refs.pic_ani.boxResize(pic_box_width,pic_box_height);
    }
    onShowStopDialog(){
        var list = this.state.image_list;
        var total = 0;
        var upload = 0;
        total = list.length;
        for(var it of list){
            if(it.uploaded != 'false'){
                upload ++;
            }
        }
        upload = upload;
        this.setState({
            total_num: total,
            uploaded_num: upload,
            visible: true
        })
    }
    certainStop(){
        this.setState({
            visible: false
        })
        this.updateList();
        this.refs.pic_ani.clearImageUrl();
        ipcRenderer.send('message-homework-upload-image-delete','');
        window.location.href = '#/scan_pattern'
    }
    handleDialogCancel(){
        this.setState({
            visible: false
        })
    }
    uploadStatus(rowData){
        if(rowData.image_guid == this.state.image_id && this.state.progress < 100){
            return (
                <div style={{color: '#444'}}>{this.state.progress}%</div>
            )
        }
        else {
            if(rowData.uploaded === 'false'){
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
    render() {
        var This = this;
        return (
            <div className="homework_upload_html">
                <PageHeader>
                    <div className="app_system_state"><SystemState/></div>
                    <div className="app_user"><UserInfoBar/></div>
                    <div className="app_exam_info" >
                        <div className="modify_zuoye">
                            <span>练习模式</span> <a href="#/scan_pattern">修改</a>
                        </div>
                        <div className="scan_btn">
                            <ScanButton
                                onEndScan={this.onEndScanHandle}
                                onStartScan={this.onStartScanHandle}
                            />
                        </div>
                        <div className="import_btn"><ImportPictures/></div>
                    </div>

                </PageHeader>
                <PageContent>
                    <div className="wrapper">
                        <div className="nav">
                            <div className="primary">
                                <table className="paper_info">
                                    <tbody>
                                    <tr style={{height:40,fontSize:26}}>
                                        <td style={{color: '#111'}}>{this.state.total_num}</td>
                                        <td style={{color: '#13D469'}}>{this.state.uploaded_num}</td>
                                    </tr>
                                    <tr style={{height:25}}>
                                        <td>扫描张数</td>
                                        <td>上传张数</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <Button
                                    type="primary"
                                    style={{width:140, height:36,marginTop:18}}
                                    onClick={this.onShowStopDialog}
                                >结束本次扫描</Button>
                            </div>
                            <div className="list" id="list">
                                <div className="title">
                                    扫描列表
                                </div>

                                <table className="table_header">
                                    <tbody>
                                    <tr>
                                        <td style={{width:50}}>序号</td>
                                        <td style={{width:110}}>&nbsp;</td>
                                        <td style={{width:75}}>进度</td>
                                    </tr>
                                    </tbody>
                                </table>

                                <Table
                                    width={276}
                                    height={this.state.tableListHeight}
                                    headerHeight={20}
                                    rowHeight={28}
                                    disableHeader={true}
                                    rowCount={this.state.image_list.length}
                                    rowGetter={({ index }) => this.state.image_list[index]}
                                >
                                    <Column
                                        label='Name'
                                        dataKey='upload_num'
                                        width={272}
                                        style={{textAlign:'center'}}
                                        cellRenderer={function ({rowData, rowIndex}) {
                                            var _index = This.state.image_list.length - rowIndex;
                                            return (
                                                <div className="batch_row">
                                                    <span style={{width:50}}>{rowData.index}</span>
                                                    <span style={{width:130}}>
                                                        {
                                                            rowData.image_guid == This.state.image_id && This.state.progress < 100? (
                                                                <Progress percent={This.state.progress} showInfo={false}/>
                                                            ) :(
                                                                <div></div>
                                                            )
                                                        }
                                                    </span>
                                                    <span style={{width:90}}>
                                                        {This.uploadStatus(rowData)}
                                                    </span>
                                                </div>
                                            )
                                        }}
                                    />

                                </Table>
                                {
                                    this.state.image_list.length === 0 ? (
                                        <div className="no_content">暂无内容</div>
                                    ):(
                                        <div></div>
                                    )
                                }

                            </div>
                        </div>
                        <div className="context" id="context">
                            <PictureAnimation ref="pic_ani"/>
                            <div className="error_code_tip" id="error_code_tip">
                                <Icon type="exclamation-circle" style={{fontSize:12, color:'#F42424', marginRight:8}} />
                                <div id="error_code" className="error_code"></div>
                                <div className="tip_close" onClick={() => {
                                    $('#error_code_tip').hide();
                                }}>×</div>
                            </div>
                        </div>
                    </div>
                </PageContent>
                <Modal
                    title={<ModalTitle title="结束本次扫描" />}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    maskClosable={false}
                    onCancel={this.handleDialogCancel}
                    footer={null}
                >
                    <div className="stop_homework_scan">
                        <div>
                            <span className="row_span">本次扫描： {this.state.total_num} 张</span>
                            <span className="row_span">已上传: {this.state.uploaded_num} 张</span>
                        </div>
                        <div style={{marginTop:15}}>
                            确认结束后，将清空已扫描的图片信息，仍可继续扫描; 不点击 [ 结束本次扫描 ] 也不影响上传
                        </div>
                        <div className="foot_btn">
                            <Button style={{width:100}} onClick={this.handleDialogCancel}>取消</Button>
                            <Button
                                type="primary"
                                style={{width:100,marginLeft:18}}
                                onClick={this.certainStop.bind(this)}
                                disabled={this.state.total_num > this.state.uploaded_num ? true : false}
                            >
                                确认结束
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default HomeWork;
