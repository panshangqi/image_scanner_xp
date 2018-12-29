
import React, { Component } from 'react';
import { Modal, Button, Spin, Icon, Progress } from 'antd';
import YQ from '@components/yq'
import './style.less';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const diskspace = window.require('diskspace');
const folderSize = window.require('folder-size');
const fs = window.require('fs');
const recursiveCopy = window.require('recursive-copy')
import ModalTitle from '@components/ModalTitle'


class DirectorySettingDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            clearing: false,
            installationPath: remote.app.getPath('exe'),  //安装路径
            savePath: '',  //保存路径
            new_savePath: '',
            spaceResidual: '',  //磁盘剩余
            new_spaceResidual: -1, //新目录剩余空间
            dialog_status: 0,
            dir_size: -1,
            copy_progress: 0
        };
        this.file_count = 0;
        this.old_path = null;
        this.new_path = null;
        this.onRenderContent = this.onRenderContent.bind(this);
    }
    componentDidMount(){

        let _this = this;
        ipcRenderer.on('message-clear-cache-callback', function (e, arg) {
            setTimeout(function () {
                _this.setState({
                    clearing: false
                })
            },500);
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-clear-cache-callback')
        this.setState = (state,callback)=>{
            return;
        };
    }
    updateDiskSize(_dir_path){
        //查看磁盘空间状态
        var _this = this;
        var cache_pic = YQ.util.get_ini('picture');
        this.setState({
            installationPath: remote.app.getPath('exe'),  //获取程序默认安装路径
            savePath: cache_pic //获取数据存放路径
        });
        console.log(cache_pic);
        this.getDiskSize(cache_pic, function (_space) {
            _this.setState({
                spaceResidual: _space
            })
        });
    }
    handleCancel = () => {

        const _this = this;
        this.setState({
            visible: false
        });
    };
    //切换目录
    handleChangeDirectory = () =>{
        var _old_path = YQ.util.get_ini('picture');
        var _this = this;
        console.log('更改目录');
        electron.remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: "C:\\"
        }, (file_dir)=>{
            console.log(file_dir);
            if(file_dir){
                console.log(_old_path, file_dir[0]);
                _this.old_path = _old_path;
                _this.new_path = file_dir[0];
                if(_this.old_path === _this.new_path){
                    return;
                }
                _this.setState({
                    new_savePath: file_dir[0],
                    dialog_status: 1
                }, function () {
                    _this.getFolderSize(_old_path, function (_space) {
                        _this.setState({
                            dir_size: _space
                        })
                    });
                    _this.getDiskSize(file_dir[0], function (_space) {
                        _this.setState({
                            new_spaceResidual: _space
                        })
                    })
                })
            }
        });
    };
    getDiskSize(_folder, fn_cb){
        var _arr = _folder.split(':');
        var Regx =  /^[A-Za-z]*$/;
        if(Regx.test(_arr[0])){
            diskspace.check(_arr[0],function (err,result) {
                if(!err){
                    var _space = result.free/(1024*1024*1024);
                    fn_cb(_space);
                    console.log('磁盘空间：'+_space);
                }else{
                    console.log(err);
                    fn_cb(-1);
                }
            })
        }else{
            fn_cb(-1);
        }
    }
    //获取文件夹大小
    getFolderSize(_folder, fn_cb){
        console.log('>>>>>>>>>')
        var This = this;
        if(fs.existsSync(_folder)){
            //计算文件夹大小

            console.log('>>>>>>>>>')
            folderSize(_folder, {}, function(err, data) {
                console.log(err, data);
                if(!err){
                    var _all_size = 0;
                    This.file_count = 0;
                    for(var key in data){
                        _all_size += data[key].bytes;
                        This.file_count += data[key].files;
                    }
                    var _space = _all_size/(1024*1024*1024);
                    fn_cb(_space);
                }else{
                    fn_cb(-1);
                }
            });
        }else{
            fn_cb(-1);
        }
    }
    //copy 文件夹
    copyFolder(src_path, dst_path){

        //recursiveCopy
        var ls = 0;
        var file_size = 0;
        var file_count = 0;
        var This = this;
        var options = {
            overwrite: true
        }
        recursiveCopy(src_path, dst_path, options).on(recursiveCopy.events.COPY_FILE_START, function(copyOperation) {
            console.info('Copying file ' + copyOperation.src + '...');
        }).on(recursiveCopy.events.COPY_FILE_COMPLETE, function(copyOperation) {
                file_count ++;
                if(file_count%20==0){
                    var precent = parseInt(file_count*100.0/This.file_count);
                    if(precent >=100){
                        precent = 99;
                    }
                    This.setState({
                        copy_progress: precent
                    })
                }
                console.info('Copied to ' + file_count);
            }).on(recursiveCopy.events.ERROR, function(error, copyOperation) {
                console.error('Unable to copy ' + copyOperation.dest);
            }).then(function(results) {
                This.setState({
                    copy_progress: 100
                })
                console.info(results.length + ' file(s) copied');
            }).catch(function(error) {
                return console.error('Copy failed: ' + error);
            });
    }
    onModifyDir = () => {
        this.setState({
            dialog_status: 2,
        })
        if(this.old_path && this.new_path){
            this.copyFolder(this.old_path, this.new_path);
        }

    }
    handleRemoveCaching = () =>{
        console.log('清除缓存')
        return;
        ipcRenderer.send('message-clear-cache','');
        this.setState({
            clearing: true
        })
    };
    showDialog() {
        this.setState({
            visible: true,
            dialog_status: 0,
            new_spaceResidual: -1,
            dir_size: -1
        });
        this.updateDiskSize();
    }
    hideDialog() {
        this.state({
            visible: false,
        });
    }
    onBackModify(){
        this.setState({
            dialog_status: 0,
            new_spaceResidual: -1,
            dir_size: -1
        });
    }
    onReStartUp(){
        YQ.util.set_ini('picture', this.new_path);
        ipcRenderer.send('message-re-start-up','');
    }
    onRenderContent(){
        if(this.state.dialog_status === 0){
            return (
                <div>
                    <div className="content_row">
                        <span className="row_span">程序安装路径：</span>
                        <span className="row_content">{this.state.installationPath}</span>
                    </div>
                    <div className="content_row">
                        <span className="row_span">数据存放目录：</span>
                        <span className="row_content">
                            {this.state.savePath} (
                                <a style={{ textDecoration: "underline" }} href="javascript:;" onClick={this.handleChangeDirectory}>更改目录</a>
                            )
                        </span>

                    </div>
                    <div className="content_row">
                        <span className="row_span">磁盘剩余空间：</span>
                        <span className="row_content">
                            {this.state.spaceResidual?this.state.spaceResidual.toFixed(2):''}GB
                            {
                                this.state.clearing ? (
                                    <span className="clearing_span">
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 18 }} spin />} /> 正在清除，请稍后...
                                </span>
                                ):(
                                    <span>
                                    <a style={{ textDecoration: "underline", display: 'none' }} href="javascript:;" onClick={this.handleRemoveCaching}>清除缓存</a>
                                </span>
                                )
                            }
                        </span>
                    </div>
                </div>
            )
        }else if(this.state.dialog_status === 1){
            var spaceVisible = 0;
            if(this.state.new_spaceResidual > 0 && this.state.dir_size >= 0 ){
                spaceVisible = 1;
            }
            if(this.state.new_spaceResidual > 0 && this.state.dir_size >= 0 && this.state.new_spaceResidual > this.state.dir_size){
                spaceVisible = 2;
            }
            return (
                <div>
                    <div className="content_row">
                        <span className="row_span">当前目录：</span>
                        <span className="row_content">
                            {this.state.savePath}<br/>
                            {
                                this.state.dir_size < 0 ?(
                                    <span><Spin indicator={<Icon type="loading" style={{ fontSize: 18 }} spin />} /> 正在计算缓存大小，请稍后...</span>
                                ):(
                                    <span>当前目录图片缓存：{this.state.dir_size.toFixed(2)} G</span>
                                )
                            }

                        </span>
                    </div>
                    <div className="content_row">
                        <span className="row_span">新目录：</span>
                        <span className="row_content">
                        {this.state.new_savePath}<br/>
                        {
                            this.state.new_spaceResidual < 0 ?(
                                <span><Spin indicator={<Icon type="loading" style={{ fontSize: 18 }} spin />} /> 正在计算缓存大小，请稍后...</span>
                            ):(
                                <span>新目录可用空间：
                                    <span style={{color:((spaceVisible == 0 || spaceVisible == 2)?'#444':'#FF796B') }}>
                                    {this.state.new_spaceResidual.toFixed(2)} G
                                    </span>
                                </span>
                            )
                        }
                        </span>
                    </div>
                    <div className="content_row">
                        <span className="row_span">
                            <Icon type="exclamation-circle" className="alert_icon" style={{ color: '#FAAD14',marginRight:8}}/>
                            操作提示：
                        </span>
                        <span className="row_content">
                            {
                                (spaceVisible == 2 || spaceVisible == 0)? (
                                    <span>确认更换后缓存图片迁移到新的目录</span>
                                ):(
                                    <span>空间不足，请返回修改目录</span>
                                )
                            }
                        </span>
                    </div>
                    <div className="op_btns">
                        <Button
                            className="theme_empty_btn"
                            style={{width:100}}
                            onClick={this.onBackModify.bind(this)}
                        >返回修改</Button>
                        <Button
                            disabled={(spaceVisible == 2)?false:true}
                            type="primary"
                            style={{width:100, marginLeft: 16}}
                            onClick={this.onModifyDir.bind(this)}
                        >确认更换</Button>
                    </div>
                </div>
            )
        }else if(this.state.dialog_status === 2){
            return(
                <div>
                    <div>操作提示:</div>
                    <div style={{marginTop:9}}>
                        正在把原目录中的缓存图片迁移到新目录下，完成后将重启客户端
                    </div>
                    <div style={{marginTop:9}}>
                        <Progress percent={this.state.copy_progress} showInfo={false}/>
                    </div>
                    <div style={{textAlign:'right',marginTop:5}}>
                        {this.state.copy_progress}/100
                    </div>
                    <div style={{textAlign:'center'}}>
                        <Button
                            disabled={(this.state.copy_progress == 100)?false:true}
                            type="primary"
                            style={{width:100, marginLeft: 16}}
                            onClick={this.onReStartUp.bind(this)}
                        >立即重启</Button>
                    </div>
                </div>
            )

        }
    }
    render() {
        return (
            <Modal
                title={<ModalTitle title="目录查看工具"/>}
                visible={this.state.visible}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={null}
                closable={(this.state.copy_progress == 100)?false:true}
            >
                <div className="dialog_content" >
                    {this.onRenderContent()}
                </div>
            </Modal>
        );
    }
}
export default DirectorySettingDialog;
