
import React, { Component } from 'react';
import './style.less';
import icon_logo from '@imgs/sm_logo.svg';
import icon_close from '@imgs/close.svg';
import icon_mini from '@imgs/minisize.svg';

const electron = window.require('electron');
const { ipcRenderer } = electron;

function getUrlRoute(s_url){
    var _url = window.location.href;
    if(s_url){
        _url = s_url;
    }

    var pos = _url.indexOf('?');
    if(pos > -1){
        _url = _url.substring(0, pos);
    }
    var as = _url.split('/');
    console.log(as);
    as = as.reverse();
    if(as.length > 0){
        return as[0];
    }
    return 'other';
}

class SubPage extends Component {
    constructor(props) {
        super(props);
        var _title = getUrlRoute() === 'normal' ? '正常试卷':'异常试卷';
        this.state = {
            title: this.props.title || _title
        };
        this.onCloseWindow = this.onCloseWindow.bind(this);
        this.onMiniWindow = this.onMiniWindow.bind(this);
    }

    onCloseWindow(){
        ipcRenderer.send('message-except-window-close','');
    }

    componentDidMount(){
        var This = this;
        ipcRenderer.on('message-link-to-route', function (evt, route) {
            console.log('<------------------------>');
            console.log(route);
            console.log('tail_route: '+getUrlRoute() );
            if(getUrlRoute(route) === 'normal'){
                This.setState({
                    title: '正常试卷'
                })
            }else{
                This.setState({
                    title: '异常试卷'
                })
            }
            var timestamp = Date.parse(new Date());
            window.location.href = route + '?t='+timestamp;
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-link-to-route');
        this.setState = (state,callback)=>{
            return;
        };
    }
    onMiniWindow(){
        ipcRenderer.send('message-except-window-mini','');
    }
    render() {

        return (
            <div className="sub_page">
                <div className="sub_page_header">
                    <div className="logo">
                        <img src={icon_logo}/>
                        <span className="title">{this.state.title}</span>
                    </div>
                    <div className="mini" onClick={this.onMiniWindow}>
                        <img src={icon_mini}/>
                    </div>
                    <div className="close" onClick={this.onCloseWindow}>
                        <img src={icon_close}/>
                    </div>
                </div>
                <div className="sub_page_content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default SubPage;
