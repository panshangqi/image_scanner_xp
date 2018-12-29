
import React, { Component } from 'react';
import {Button, Input, Checkbox, Icon, Alert, Select, Menu, Dropdown } from 'antd'
import './style.less';
import YQ from '@components/yq'
import PageHeader from '@components/PageHeader'
import PageContent from "@components/PageContent";
import AppVersion from '@components/AppVersion';

// const electron = window.require('electron');
import CryptoJS from 'crypto-js';
import tripledes from "crypto-js/tripledes";
const encrypting_key = '17zuoye2018';
const ws = YQ.Websocket()

// const { remote, ipcRenderer } = electron;
// const { exec } = window.require('child_process');
// const ping = window.require('ping')
// const Option = Select.Option;
// const InputGroup = Input.Group;

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "12978942",
            password: "1",
            remember: false,
            show_alert: 0,
            user_list: ''//YQ.cookies.get_user_list()
        };
        this.onLoginClick = this.onLoginClick.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeRemember = this.onChangeRemember.bind(this);
        this.onChangeExamInfo = this.onChangeExamInfo.bind(this);
        this.onStartScanClick = this.onStartScanClick.bind(this);
        this.onEndScanListener = this.onEndScanListener.bind(this);
        this.handleEnterKey = this.handleEnterKey.bind(this);
        this.onSensorsUpload = this.onSensorsUpload.bind(this);
        this.addUsername = this.addUsername.bind(this)
        this.deleteUsername = this.deleteUsername.bind(this)
        this.onClickMenuItem = this.onClickMenuItem.bind(this)
        this.updateUserAndPwd = this.updateUserAndPwd.bind(this)
        this.onDropVisibleChange = this.onDropVisibleChange.bind(this)
        this.LoadMenu = this.LoadMenu.bind(this)
    }
    componentDidMount(){

        //client.connect('ws://127.0.0.1:10080', 'echo-protocol');
        //var _username = YQ.cookies.load('username');
        //var _password =  YQ.cookies.load('password');
        //var _remember = YQ.cookies.load('remember');
        // console.log("componentDidMount: " + _remember)
        // console.log(typeof _remember)
        // console.log(typeof _username)
        // this.updateUserAndPwd(_username, _password, _remember);
        //
        // document.addEventListener("keydown",this.handleEnterKey);

    }
    async updateUserAndPwd(_username ,_password, _remember){
        // console.log(_username, _remember, _password);
        // if(typeof _remember == "boolean"){
        //
        // }else{
        //     _remember =  _remember == "true" ? true: false;
        // }
        //
        // this.setState({
        //     username: _username
        // })
        //
        // if(_remember  && _password){
        //     _password = tripledes.decrypt(_password, encrypting_key).toString(CryptoJS.enc.Utf8);
        //     this.setState({
        //         password: _password,
        //         remember: _remember
        //     })
        // }else{
        //     this.setState({
        //         password: "",
        //         remember: false,
        //     })
        // }
    }
    componentWillUnmount(){
        document.removeEventListener("keydown",this.handleEnterKey);
    }
    handleEnterKey(e) {
        if (e.which !== 13) return
        console.log('你按了回车键...')
        this.onLoginClick();
    }
    async onLoginClick(){
        console.log('login');
        var username = this.state.username;
        var password = this.state.password;
        password  = tripledes.encrypt(password, encrypting_key).toString();
        var url = YQ.util.make_local_url('/user/login');
        var res = await YQ.http.postSync(url,{'username':username,'password':password} )
        console.log('登陆结果')
        console.log(res);
        if(res === 500 || res === 502 || res === 404 ){
            console.log('网络超时...');
            this.setState({
                show_alert: 2,
            });
            return
        }
        if(res.type !== 'AJAX'){
            this.setState({
                show_alert: 1,
            });
            return
        }


        // try{
        //     var _save_user_id = YQ.cookies.load('user_id');
        //     if(_save_user_id != res.body.user.user_id){
        //         YQ.util.set_ini('exam_info', {});
        //     }
        //     console.log(res);
        //     YQ.cookies.save('token',res.body.token);
        //     YQ.cookies.save('username',username);
        //     YQ.cookies.save('password', password);
        //     YQ.cookies.save('user_id', res.body.user.user_id);
        //     YQ.cookies.save('user',res.body.user);
        //     YQ.cookies.save('remember', This.state.remember ? "true" : "false");
        //     var user_params = {
        //         user_id: res.body.user.user_id,
        //         username: username,
        //         password: password,
        //         remember: This.state.remember ? "true" : 'false',
        //         real_name: res.body.user.real_name,
        //         timestamp: new Date().getTime()
        //     }
        //     YQ.cookies.add_username(user_params);
        // }catch (err){
        //     console.log(err)
        // }
        //
        // ipcRenderer.send('message-sensors-log-login','');
        // window.location.href = '#/scan_pattern';
    }
    addUsername(){

    }
    deleteUsername(){

    }
    onSensorsUpload(_user_id){

    }
    onChangeUsername(event){
        this.setState({
            username: event.target.value
        })
    }
    onChangePassword(event){
        this.setState({
            password: event.target.value,
            show_alert: 0,
        })
    }
    onChangeRemember(event){
        this.setState({
            remember: event.target.checked
        })
    }
    onChangeExamInfo(){
        this.setState({
            exam_info:{
                "school_id":"0023",
                "school_name":"第一附属中学",
                "exam_id":"0313f2ad0fad0fa0dfadf",
                "exam_name":"第一次其中考试",
                "subject_id":"english",
                "subject_name":"英语"
            }
        })
    }
    onStartScanClick(){
        console.log('开始扫描');
    }
    onEndScanListener(){
        console.log('结束扫描');
    }
    onClickMenuItem(data){
        console.log(data)
        var _username = data.item.props.username;
        var _password = data.item.props.password;
        var _remember = data.item.props.remember;
        this.updateUserAndPwd(_username, _password, _remember);
    }
    deleteItem(_user_id, event){
        // console.log('delete'+_user_id)
        // YQ.cookies.delete_username(_user_id)
        // var _user_list = YQ.cookies.get_user_list();
        // this.setState({
        //     user_list: _user_list
        // })
        // event.stopPropagation()
    }
    onDropVisibleChange(visible){
        // console.log(visible)
        // if(visible){
        //     var _user_list = YQ.cookies.get_user_list();
        //     this.setState({
        //         user_list: _user_list
        //     })
        // }
    }
    LoadMenu(){

        var item_arr = []
        console.log(this.state.user_list);
        for(var i=0;i<this.state.user_list.length;i++){
            var _user = this.state.user_list[i];
            item_arr.push((
                <Menu.Item key={_user.user_id} username={_user.username} password={_user.password} remember={_user.remember}>
                    <div className="user_ul" >
                        <div className="_name">{_user.real_name}/{_user.username}</div>
                        <div className="delete_user" onClick={this.deleteItem.bind(this, _user.user_id)}><Icon type="close" theme="outlined" /></div>
                    </div>
                </Menu.Item>
            ))
        }
        return item_arr;
    }
    render() {

        const menu = (
            <Menu style={{width:322, top:8}} onClick={this.onClickMenuItem} className="_MenuBox">
                {this.LoadMenu()}
            </Menu>
        );
        return (
            <div className="login_html">
                <PageHeader>
                    <div className="app_version">
                        <AppVersion/>
                    </div>
                </PageHeader>
                <PageContent>
                    <div className="page_background">
                        <div className="login_box">
                            <div className="_title">教师账号登录</div>
                            <Input type="text"
                                   onChange={this.onChangeUsername}
                                   value={this.state.username}
                                   addonBefore={<Icon type="user" />}
                                   size="large"
                                   style={{width:360,marginTop:30}}
                            />
                            <div className="_drop_username">
                                <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" onVisibleChange={this.onDropVisibleChange}>
                                    <div className="_drop_icon"><Icon type="down" theme="outlined" /></div>
                                </Dropdown>
                            </div>
                            <Input
                                type="password"
                                onChange={this.onChangePassword}
                                value={this.state.password}
                                addonBefore={<Icon type="lock" />}
                                size="large"
                                style={{width:360,marginTop:25}}
                            />
                            <div style={{width:360,marginTop:25}}>
                                <Checkbox
                                    onChange={this.onChangeRemember}
                                    checked={this.state.remember}
                                >记住密码
                                </Checkbox>
                            </div>
                            <Alert className="error" style={{ display: this.state.show_alert == 1 ? 'block': 'none'}} message="用户名或密码错误" type="warning" showIcon />
                            <Alert className="error" style={{ display: this.state.show_alert == 2 ? 'block': 'none'}} message="网络超时" type="warning" showIcon />
                            <Button onClick={this.onLoginClick}
                                    type="primary"
                                    size="large"
                                    disabled={false}
                                    style={{width:360,marginTop:15,fontSize:18}}
                            >
                                登录
                            </Button>
                        </div>
                    </div>
                </PageContent>
            </div>

        );
    }
}

export default Login;
