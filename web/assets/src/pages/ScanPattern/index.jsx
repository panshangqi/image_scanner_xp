
import React, { Component } from 'react';
import './style.less';
import YQ from '@components/yq'
import PageHeader from '@components/PageHeader'
import PageContent from "@components/PageContent"
import UserInfoBar from "@components/UserInfoBar"
import homework_logo from '@imgs/homework_pattern.png';
import exam_logo from '@imgs/exam_pattern.png';

const electron = window.require('electron');
const path = window.require('path')
const { ipcRenderer } = electron;
const ping = window.require('ping')
const { exec } = window.require('child_process');
class Login extends Component {
    constructor(props) {
        super(props);
        this.homeworkClick = this.homeworkClick.bind(this)
    }
    componentDidMount(){

    }
    componentWillUnmount(){

    }
    homeworkClick(){
        ipcRenderer.send('message-update-image-db','homework');  //更新学生，答题卡信息
        window.location.href = '#/homework_upload';
    }
    paperClick(){
        //获取电脑配置{ 客户端版本， 操作系统 （win7,win10），系统位数，CPU,  内存  }
        exec("util.exe 3", {} , function (err, data) {
            if(!err){
                console.log(data);
                if(data == '64'){
                    window.location.href = '#/select_exam_subject';
                }else{
                    YQ.util.warning('32位操作系统下，不能使用该功能');
                }
            }
        })
    }
    render() {
        return (
            <div className="scan_pattern_html">
                <PageHeader>
                    <div className="app_user"><UserInfoBar/></div>
                </PageHeader>
                <PageContent>
                    <div className="exam_type_menu">
                        <div className="item">
                            <div className="logo" onClick={this.homeworkClick}>
                                <img src={homework_logo} style={{ width:75, height:95}}/>
                                <div className="title">练习模式</div>
                                <div className="tip">适用于日常练习，无需创建考试，直接上传</div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="logo" onClick={this.paperClick.bind(this)}>
                                <img src={exam_logo} style={{width:81, height:95}}/>
                                <div className="title">大考模式</div>
                                <div className="tip">适用于已创建的考试，支持识别和异常处理</div>
                            </div>
                        </div>
                    </div>
                </PageContent>
            </div>

        );
    }
}

export default Login;
