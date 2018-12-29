
import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import cookies from 'react-cookies'
import './style.less';
import YQ from '@components/yq'

class UserInfoBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: ''
        }
    }
    componentDidMount(){
        var _user = YQ.cookies.load('user');
        if(_user){
            this.setState({
                username: _user.real_name
            })
        }
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    render() {
        return (
            <div className="_user_info_bar">
                <Link to="/login">退出登录</Link><span>{this.state.username}</span>
            </div>
        );
    }
}
export default UserInfoBar;
