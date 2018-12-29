
import React, { Component } from 'react';
import { Modal, Button, Radio, Icon, Input, Progress, Checkbox  } from 'antd';

import './style.less';
import YQ from '@components/yq.jsx'
import $ from 'jquery'
import ModalTitle from '@components/ModalTitle'

const RadioGroup = Radio.Group;
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const { exec } = window.require('child_process');
const Search = Input.Search;
const {dialog} = electron.remote
const yq_addon = window.require('window_file_class')

class DriveSettingDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            visible: false,
            selectedDirSize: -1,
            selectedPicCount: 0,
            files:[],
            new_files: [],
            default_path:'',
            cache_size: 0,
            percent: 0,
            status: 0, //页面状态
            calculating: false,  //是否正在计算
            calculate_size: 0,
            import_status: 0// 导入状态 0，1，2， 3 ： 未选择文件，开始导入，导入中，导入完成
        }
        this.isSkip = false;
        this.pid = 0;
        this.onSelectFolder = this.onSelectFolder.bind(this)
        this.onNextPageClick = this.onNextPageClick.bind(this)
        this.startImportClick = this.startImportClick.bind(this)
        this.completeImportClick = this.completeImportClick.bind(this)
        this.openImportDialogClick = this.openImportDialogClick.bind(this)
        this.onSkipPage = this.onSkipPage.bind(this)
        this.backTipPage = this.backTipPage.bind(this)
        this.onSelectChange = this.onSelectChange.bind(this)
        this.cancelImportClick = this.cancelImportClick.bind(this);
    }
    componentDidMount(){
        // this.showDialog()
        // this.setState({
        //     status:1,
        //     import_status: 2
        // })
    }

    componentWillUnmount(){

        this.setState = (state,callback)=>{
            return;
        };
    }
    async showDialog(){

        this.setState({
            import_status: 0,
            files: [],
            selectedDirSize: -1,
            selectedPicCount: 0,
            default_path:''
        })
        if(this.isSkip){
            this.setState({
                status: 1
            })
        }else{
            this.setState({
                status: 0
            })
        }
        var cache_pic = YQ.util.get_ini('picture');
        console.log(cache_pic)
        var This = this;
        yq_addon.getDiskInfo({ dir: cache_pic}, function (data) {
            console.log(data)
            This.setState({
                visible:true,
                cache_size: data ? data.freespace: 0
            })
        });

    }
    hideDialog(){
        this.setState({
            visible: false
        })
    }

    handleOk = (e) => {

        this.setState({
            visible: false,
        });
    }
    handleCancel = (e) => {

        this.setState({
            visible: false,
        });
    }
    backTipPage(){
        this.setState({
            status: 0
        })
    }
    openImportDialogClick(){
        this.showDialog();
    }
    completeImportClick(){
        this.handleCancel();

        var _files = this.state.new_files;
        _files.sort(function (a, b) {
            var aa = a.src_file;
            var bb = b.src_file;
            if(aa.length==bb.length){
                return aa.localeCompare(bb);
            }else{
                return aa.length-bb.length;
            }
        });
        console.log(_files);
        //ipcRenderer.send('message-import-pictures-data', _files);
        //导入数据drive_images_import
        console.log('=>>>>>=>========导入数据======');
        const This = this;
        var _url= YQ.util.make_local_url('/drive_images_import');
        YQ.http.post(_url, {image_list: _files}, function (res){
            console.log(res)
        });
    }
    cancelImportClick(){
        yq_addon.cancelCopyFiles(this.pid);
        this.setState({
            percent: 0,
            default_path: '',
            import_status: 0
        })
        var This = this
        setTimeout(function () {
            var files = [];
            for(var file of This.state.new_files){
                files.push(file.new_file);
            }

            var dirs = [YQ.util.get_ini('picture')];
            yq_addon.removeFiles({dirs, files},function (data) {
                console.log(data)
            })
        },1100)
    }
    async startImportClick(){
        var src_dir = this.state.default_path;
        var dst_dir = YQ.util.get_ini('picture');
        var _files = this.state.files;
        var This = this;
        this.setState({
            import_status: 2
        })

        this.pid = yq_addon.copyFiles({
            src_dir: src_dir,
            dst_dir: dst_dir,
            files: _files,
            rename: true
        },function (data) {
            console.log(data)
            This.setState({
                percent: 100,
                import_status: 3,
                new_files: data.files
            })
        },function (progress) {
            console.log(progress)
            This.setState({
                percent: parseInt(progress*100)
            })
        },function (cancel) {
            if(cancel){
                This.setState({
                    import_status: 0
                })
            }
        })

    }
    onSelectChange(e){

    }
    async onSelectFolder(e){
        var This = this;
        dialog.showOpenDialog({
            title: '选择文件夹',
            properties: ['openDirectory']
        },async function (filePaths) {
            console.log(filePaths)
            if(filePaths && filePaths.length > 0){
                var selectedPath = This.getPath(filePaths[0])
                This.setState({
                    default_path: selectedPath,
                    calculating: true,
                    calculate_size: 0,
                    selectedDirSize: -1
                })
                //var folder = await yq_addon.getFolderSizeAsync({ dir: selectedPath})

                var fileInfo = await yq_addon.getRootFilesAsync({dir: selectedPath}, function (p) {
                    console.log(p)
                    This.setState({
                        calculate_size: p
                    })
                })
                console.log(fileInfo)
                This.setState({
                    calculating: false,
                    files:fileInfo.files,
                    selectedDirSize: fileInfo ? fileInfo.total_size : 0,
                    selectedPicCount: fileInfo.files.length
                })
                if(fileInfo.total_size < This.state.cache_size){
                    This.setState({
                        import_status: 1
                    })
                }
            }
        })
    }

    getPath(_path){
        return _path.replace('\\', "/");
    }
    formatSize(_size){
        var size = _size;
        var Kb = 1024;
        var Mb = Kb*1024;
        var Gb = Mb*1024;

        if(typeof _size == 'string')
            size = parseInt(size);
        if(size > Gb){
            return (size/Gb).toFixed(2) + ' G';
        }else if(size > Mb){
            return (size/Mb).toFixed(2) + ' M';
        }else if(size > Kb){
            return (size/Kb).toFixed(2) + ' KB';
        }else if(size > -1){
            return (size).toFixed(2) + ' B';
        }
        return 0 + "B";
    }
    onSkipPage(e){
        console.log(e)
        this.isSkip = e.target.checked;
    }
    onNextPageClick(){
        this.setState({
            status: 1
        })
    }
    buttonsRender(){
        if(this.state.import_status === 0){
            return(
                <div>
                    <div style={{marginTop: 20}}>
                        <a onClick={this.backTipPage}>&lt;返回查看操作提示</a>
                    </div>
                </div>
            )

        }
        else if(this.state.import_status === 1){
            return(
                <div>
                    <div style={{marginTop: 20}}>
                        <a onClick={this.backTipPage}>&lt;返回查看操作提示</a>
                    </div>
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <Button type="primary" style={{width: 100}} onClick={this.startImportClick}>开始导入</Button>
                        <Button style={{width: 100, marginLeft: 20}} onClick={this.handleCancel}>关闭</Button>
                    </div>
                </div>
            )
        }else if(this.state.import_status === 2){
            return(
                <div>
                    <div className="progress_title"><span>导入进度：</span><a style={{marginRight:6,fontSize:12}} onClick={this.cancelImportClick}>全部取消</a></div>
                    <div style={{marginTop:0}}>
                        <Progress percent={this.state.percent} status="active"/>
                    </div>
                </div>
            )

        }else if(this.state.import_status === 3){
            return(
                <div>
                    <div className="progress_title"><span>导入进度：</span><a style={{marginRight:6,fontSize:12}} onClick={this.cancelImportClick}>全部取消</a></div>
                    <div style={{marginTop:0}}>
                        <Progress percent={this.state.percent}/>
                    </div>
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <Button type="primary" style={{width: 100}} onClick={this.completeImportClick}>完成</Button>
                    </div>
                </div>
            )
        }

    }
    pageRender(){
        if(this.state.status == 0){
            return (
                <div>
                    <div>通过扫描驱动或者第三方扫描软件的答题卡图片，选择图片所在文件夹，可导入到扫描客户端中，在进行识别和上传</div>
                    <div style={{color:'#111',marginTop:15}}>扫描设置须知：</div>
                    <div>1. 图像画质（分辨率）：200dpi</div>
                    <div>2. 色彩模式：256灰度 / 24位彩色：</div>
                    <div>3. 扫描页面：双面</div>
                    <div>4. 单次导入图片张数不多于2000张</div>
                    <div>5. 试卷图片多于1张时，不可乱序、缺页</div>
                    <div className="button_ops">
                        <Button onClick={this.onNextPageClick} style={{width: 100}}>下一步</Button>
                        <div className="skip_the_page">
                            <Checkbox onChange={this.onSkipPage}>下次跳过本提示</Checkbox>
                        </div>
                    </div>
                </div>
            )
        }
        else if(this.state.status == 1){
            return (
                <div>
                    <table className="import_pic_table">
                        <tbody>
                        <tr>
                            <td style={{width:140}}>图片所在的文件夹：</td>
                            <td style={{width:330}}>
                                <Search
                                    placeholder="请选择图片所在文件夹"
                                    enterButton="选择"
                                    size="default"
                                    disabled={this.state.import_status == 2 ? true: false}
                                    value={this.state.default_path}
                                    style={{ width: 330 }}
                                    onChange={this.onSelectChange}
                                    onSearch={this.onSelectFolder}
                                />
                            </td>
                        </tr>
                        <tr style={{height: 18}}>
                            <td></td>
                            <td>
                                {
                                    this.state.calculating == true?(
                                        <span style={{display: this.state.default_path.length > 0 ? 'block': 'none',color:'#13D469'}}>
                                            正在计算文件夹大小：{this.formatSize(this.state.calculate_size)}
                                        </span>
                                    ):(
                                        <span style={{display: this.state.default_path.length > 0 ? 'block': 'none',color:'#13D469'}}>
                                            已选路径文件夹大小：{this.formatSize(this.state.selectedDirSize)}, 图片张数： {this.state.selectedPicCount} 张
                                        </span>
                                    )
                                }
                            </td>
                        </tr>
                        <tr style={{height: 20}}>
                            <td>存储目录剩余空间：</td>
                            <td>
                                <div className="free_space">{this.formatSize(this.state.cache_size)}</div>
                            </td>
                        </tr>
                        <tr style={{height: 18}}>
                            <td></td>
                            <td>
                                <span style={{display: this.state.selectedDirSize == -1 ? 'none': 'block'}}>

                                    {
                                        this.state.cache_size > this.state.selectedDirSize ? (
                                            <span style={{color:'#13D469'}}>空间充裕，可执行导入</span>
                                        ):(
                                            <span style={{color:'#FD5454'}}>空间不足，请通过目录查看工具，修改图片缓存路径</span>
                                        )
                                    }
                                </span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div>
                        {this.buttonsRender()}
                    </div>

                </div>
            )
        }
    }
    render() {
        var This = this;
        return (
            <div id="import_pictures_button">
                <button className="importBtnStyle" onClick={this.openImportDialogClick}>
                    导入扫描图片
                </button>
                <Modal
                    title={<ModalTitle title="操作提示" />}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    maskClosable={false}
                    onCancel={this.handleCancel}
                    closable={(this.state.status === 0 || (this.state.status === 1 && this.state.import_status == 0)) ? true: false }
                    footer={null}
                >
                    <div id="import_pictures_dialog">
                        {this.pageRender()}
                    </div>
                </Modal>

            </div>

        );
    }
}
export default DriveSettingDialog;
