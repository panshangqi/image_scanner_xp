
import React, { Component } from 'react';
import { Icon } from 'antd';
import './style.less';
import $ from 'jquery'
class Home extends Component {
    constructor(props) {
        super(props);
        console.log("constructor")
        this.htmlResize = this.htmlResize.bind(this)
    }
    componentDidMount(){
        var This = this;
        this.htmlResize()
        $(window).resize(function () {
            This.htmlResize()
        })
    }
    htmlResize(){
        var wHeight = $(window).height();
        $('#_home_html').css({
            height: (wHeight - 48) + 'px'
        })
        $('#icon_tip').css({
            'marginTop': (wHeight - 160)/2 + 'px'
        })
    }
    render() {
        return (
            <div className="_home_html" id="_home_html">
                <div id="icon_tip" className="icon_tip">
                    <Icon type="smile" theme="twoTone" twoToneColor="#2d6ed8" style={{fontSize: 50}} />
                    <span>暂时没有需要处理的异常哦！</span>
                </div>
            </div>
        );
    }
}

export default Home;
