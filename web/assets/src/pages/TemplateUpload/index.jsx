
import React, { Component } from 'react';
import {Button, Progress , Icon, Modal, Layout, message} from 'antd'
import { Link } from 'react-router-dom';
import YQ from '@components/yq'
import $ from 'jquery';
import PageHeader from '@components/PageHeader'
import PageContent from "@components/PageContent";
import ExamInfoHeader from "@components/ExamInfoHeader";
import ScanButton from "@components/ScanButton";
import SystemState from "@components/SystemState";
import ModalTitle from '@components/ModalTitle'
import UserInfoBar from '@components/UserInfoBar';
import CurrentTemplate from '@components/CurrentTemplate'
import image_enlarge from '@imgs/image_enlarge.svg';
import image_small from '@imgs/image_small.svg';
import './style.less'

const { Header, Footer, Sider, Content } = Layout;
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;


class TemplateUpload extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            main_image_url: null,
            selected_image_id: null,
            imgIndex: 0,
            scanningState: 2,  //扫描状态
            imgList: [],  //图片列表数据
            uploadDialogVisible: false,
            pic_upload_progress: 0,
            pic_upload_pro_value:0,
			uploadEnd: 0
        };

        this.maxImgWidth = 1500;
        this.minImgWidth = 600;
        this.imgScale = 30;
        this.isFirst = true;
        this.timer = null;
        this.onStartScanClick = this.onStartScanClick.bind(this);
        this.onEndScanListener = this.onEndScanListener.bind(this);
        this.updatePageData = this.updatePageData.bind(this);
        this.handleLoadImg = this.handleLoadImg.bind(this);
        this.layoutSize = this.layoutSize.bind(this);
        //设置为模板上传类型
        remote.getGlobal('sharedObject').scan_type = 'template';
        this.anscard_type = YQ.util.get_ini('anscard_type');
    }
    componentDidMount(){
        const _this = this;
        ipcRenderer.on('message-upload-template-progress',function (e, res) {
            console.log(res);
            var _progress = res.num *100.0 / res.total;
            _this.setState({
                pic_upload_progress: _progress,
                pic_upload_pro_value: parseInt(_progress)
            })

            if(res.num == res.total){
                _this.setState({
                    uploadEnd: 1
                })
            }
        })

        $('#img_list').on('click','img',function () {

            var _img_url = $(this).attr('img_url');
            var _key_id = $(this).attr('img_id');
            var _index = $(this).index() + 1;
            _this.setState({
                selected_image_id: _key_id,
                main_image_url: _img_url,
                imgIndex: _index
            })
        })
        //this.updatePageData();
        this.timer = setInterval(function () {
            _this.updatePageData();
        },2000);
        this.layoutSize();
        $(window).resize(function () {
            _this.layoutSize();
        })
    }
    layoutSize(){
        var windowH = $(window).height();
        var contentH = windowH - 156;
        var imglistH = windowH - 264;
        $('#content_wrap').css('height', contentH+'px')
        $('#img_list').css('height',imglistH+'px')
    }
    componentWillUnmount = () => {
        ipcRenderer.removeAllListeners('message-upload-template-progress')
        console.log('TEmplateUPload componentWillUnMount');
        if (this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.setState = (state,callback)=>{
            return;
        };

    }
    updatePageData(){
        var _url = YQ.util.make_local_url('/get_templates');
        var _this = this;
        YQ.http.get(_url, {}, function (res) {
            if(res.type != 'ERROR'){
                _this.setState({
                    imgList: res.data
                });
                console.log(res.data);
                if(res.data.length > 0){
                    if(_this.isFirst){
                        _this.isFirst = false;
                        _this.setState({
                            selected_image_id: res.data[0]._id,
                            main_image_url: res.data[0].filepath,
                            imgIndex: 1
                        })
                    }
                }else{
                    _this.isFirst = true;
                    _this.setState({
                        imgIndex: 0
                    })
                }
            }
        });
    }
    //点击右侧图片缩略图
    handleClickImg = (index) => {
        //console.log(index);
        if(index != this.state.selectedImg){
            this.setState({
                selectedImg: index,
                scaleX: 1,
                widthChange: '',
                rotateChange: 0
            })
        }
    };
    //点击放大按钮（最多扩大50%）
    handleEnlarge = () => {

        var _nowWidth = $('#main_image').width() + this.imgScale;
        if(_nowWidth< this.maxImgWidth){
            $('#main_image').css('width', _nowWidth+'px');
        }
    };
    //点击缩小按钮（最多缩小50%）
    handleSmall = () => {
        var _nowWidth = $('#main_image').width() - this.imgScale;
        if(_nowWidth > this.minImgWidth){
            $('#main_image').css('width', _nowWidth+'px');
        }
    };

    handleDeleteBtn = () => {
        var _url = YQ.util.make_local_url('/delete_templates');
        var _this = this;
        YQ.http.post(_url, {}, function (res) {  //请求扫面出的图片列表数据
            if(res.type != 'ERROR'){
                console.log('删除完成');
                _this.updatePageData();
                message.config({
                    duration: 1,
                })
                message.success('删除成功');
            }
        });
    };
    //上传图片
    handleLoadImg = () => {
        this.setState({
            pic_upload_progress: 0,
            pic_upload_pro_value:0,
            uploadDialogVisible: true,
            uploadEnd: 0
        })
        ipcRenderer.send('message-upload-template',this.state.imgList);
    };
    onImgListClick(){
        console.log('log');
    }
    onStartScanClick(){
        //console.log('开始扫描');
    }
    //结束扫描
    onEndScanListener(){

    }
    uploadDialogOk = (e) => {

        this.setState({
            uploadDialogVisible: false,
        });
    }
    onCancelUpload(){
        this.setState({
            uploadDialogVisible: false,
        });
        ipcRenderer.send('message-upload-template-stop','');
    }
    onBackExamInfo(){
        window.location.href = '#/select_exam_subject';
    }
	onHandleNextPage(){
        ipcRenderer.send('message-open-17zuoye-url','http://www.17zuoye.com');
        var This = this;
        setTimeout(function () {
            This.setState({
                uploadDialogVisible: false,
            });
            window.location.href = '#/select_exam_subject';
        },600)

	}
	showPicDialog(){
		var This = this;
		if(This.state.uploadEnd == 0){
			return(
				<div className="pic_upload_dialog">
					<div>第三方模板上传进度</div>
					<div>
						<Progress percent={this.state.pic_upload_progress} status="active" showInfo={false}/>
					</div>
					<div style={{textAlign: 'right'}}>{this.state.pic_upload_pro_value} %</div>
					<div className="btns">
						<Button className="theme_empty_btn" onClick={this.onCancelUpload.bind(this)}>取消上传</Button>
					</div>
				</div>
			)
		} else {
			return(
				<div className="pic_upload_end">
					<div>当前模板上传进度：<span className="upload_type">完成</span></div>
					<div>请前往 www.17zuoye.com 制作扫描模板，点击“去制作答题卡”打开浏览器制卡，点击“取消”返回科目选择页面</div>
					<div className="pic_upload_select">
						<Button className="theme_empty_btn" onClick={this.onBackExamInfo.bind(this)}>取消</Button>
						<Button className="next_page" onClick={this.onHandleNextPage.bind(this)} type="primary">去制作答题卡</Button>
					</div>
				</div>
			)
		}
	}
    render() {
        var This = this;
        return (
            <div className="template_upload_html">
                <PageHeader>
                    <div className="app_system_state"><SystemState/></div>
                    <div className="app_user"><UserInfoBar/></div>
                    <div className="app_exam_info">
                        <div className="exam_info">
                            <ExamInfoHeader
                                onClick={this.onChangeExamInfo}
                                 />
                        </div>
                        <div className="scan_btn"><ScanButton onStartScan={this.onStartScanClick} onEndScan={this.onEndScanListener}/></div>
                    </div>
                    <div className="app_current_template" style={{display: this.anscard_type == 'thirdparty'? 'block':'none'}}>
                        <CurrentTemplate url_to="/template_upload"/>
                    </div>
                </PageHeader>
                <PageContent>
                    <Layout>
                        <Content>
                            <div className="header_wrap">
                                <div>
                                    <Link to="/select_exam_subject"><Icon className="back_icon" type="left" style={{fontSize:14}}/>返回</Link>
                                    <span className="tips_text">操作提示：请确认模板图片需清晰、正立、不缺页，且为本学科答题卡；否则请删除重新扫描。</span>
                                </div>
                                {
                                    this.state.scanningState !== 0 ? (
                                        <div>
                                            <span className="current_location">
                                                当前位置：第 {this.state.imgIndex} 页 / 共 {this.state.imgList.length} 页
                                            </span>
                                            <img className="turn_small" onClick={this.handleSmall} src={image_small}/>
                                            <img className="turn_large" onClick={this.handleEnlarge} src={image_enlarge}/>
                                        </div>
                                    ) : null
                                }
                            </div>
                            <div className="content_wrap" id="content_wrap">
                                {
                                    this.state.imgList.length == 0 ? (
                                        <div className="no_paper_tips_wrap">
                                            <span>
                                                暂无内容<br/>
                                                请「开始扫描」
                                            </span>
                                        </div>
                                    ) : (

                                        <div className="img_content_wrap">
                                            <img
                                                id="main_image"
                                                src={this.state.main_image_url}
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </Content>
                        <Sider width="300">
                            <h3 className="modal_title">模板扫描</h3>
                            <div>
                                <p className="testPaper_num">试卷张数：{this.state.imgList&&this.state.imgList.length}张</p>
                                <div className="img_list" id="img_list">
                                    {
                                        this.state.imgList&&this.state.imgList.map(function(item, index){
                                            return (
                                                <img
                                                    img_url={item.filepath}
                                                    img_id={item._id}
                                                    key={item._id}
                                                    src={item.filepath}
                                                    className="img_item"
                                                    style={{borderColor: This.state.selected_image_id == item._id ? '#2D6EDB': '#ccc'}}
                                                />
                                            )
                                        })
                                    }
                                </div>
                                <div className="btn_wrap" style={{display: this.state.imgList.length > 0 ? 'flex': 'none'}}>
                                    <Button onClick={this.handleDeleteBtn}>删除重扫</Button>
                                    <Button onClick={this.handleLoadImg} type="primary">上传图片</Button>
                                </div>
                            </div>
                        </Sider>
                    </Layout>
                </PageContent>
                <Modal
                    title={<ModalTitle title="上传图片"/>}
                    visible={this.state.uploadDialogVisible}
                    onOk={this.uploadDialogOk}
                    onCancel={null}
                    closable={false}
                    maskClosable={false}
                    footer={null}
                >
                    {this.showPicDialog()}
                </Modal>
            </div>
        );
    }
}

export default TemplateUpload;
