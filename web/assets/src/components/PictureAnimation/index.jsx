
import React, { Component } from 'react';
import './style.less';
import $ from 'jquery';
import rect_bg from '@imgs/scan_bg.png'
import scan_layer from '@imgs/scan_layer.png';
function make_url(filename){
    return 'http://127.0.0.1:10082/' + filename;
}
class PictureAnimation extends Component {
    constructor(props) {
        super(props);
        console.log("constructor")

        this.state = {
            image_url: null,
            new_image_url: null
        }
        this.m_finalArray = [];
        this.m_maxLength = 0;
        this.m_moveTimer = null;
        this.layerTimer = null;
        this.layerWidth = 600;
        this.PicMove = this.PicMove.bind(this)
        this.hideLayer = this.hideLayer.bind(this)
        this.showLayer = this.showLayer.bind(this)
        this.boxResize = this.boxResize.bind(this)
        this.addImageUrl = this.addImageUrl.bind(this)
        this.updateImageUrl = this.updateImageUrl.bind(this)
    }
    componentDidMount(){
        //this.showLayer();
    }
    componentWillUnmount(){

        if(this.layerTimer){
            clearInterval(this.layerTimer);
            this.layerTimer = null;
        }
        else{
            clearInterval(this.m_moveTimer);
            this.m_moveTimer = null;
        }

        this.setState = (state,callback)=>{
            return;
        };
    }

    addImageUrl(_url){
        var This = this;
        if(This.m_moveTimer){
            return;
        }
        This.setState({
            new_image_url: _url
        },function () {

            var m_left = -900;
            clearInterval(This.m_moveTimer);
            This.m_moveTimer = null;
            This.m_moveTimer = setInterval(function () {
                m_left += 35;
                if(m_left > 0)
                {
                    m_left = 0;
                }
                $('#next_pic').css({
                    'left': m_left + 'px'
                })
                if(m_left >=0){
                    This.setState({
                        image_url: This.state.new_image_url
                    })
                    $('#next_pic').css({
                        'left': '-900px'
                    })
                    clearInterval(This.m_moveTimer);
                    This.m_moveTimer = null;
                }
            },20)
        })
    }
    updateImageUrl(_url){
        this.setState({
            image_url: _url
        })
    }
    showLayer(){
        $('#layer_image').show();
        this.PicMove();
    }
    hideLayer(){
        $('#layer_image').hide();
        clearInterval(this.layerTimer);
        this.layerTimer = null;
    }
    clearImageUrl(){
        this.setState({
            image_url: null
        })
    }
    boxResize(_width, _height){

        $('#picture_center').css({
            height: _height + 'px'
        })
        $('#picture_box').css({
            height: _height + 'px'
        })
        /*
        $('#layer_image').css({
            height: _height + 'px'
        })
        */
        this.UpdatePicParams(_width);
    }

    UpdatePicParams(_box_width){
        this.layerWidth = $('#layer_image').width();
        //console.log('layerWidth: ' + this.layerWidth)
        this.m_maxLength = _box_width + -this.layerWidth;
        var testArray = [];
        this.m_finalArray = [];
        var totalLength = 0;
        for(var i=0;i<=100;i++){
            testArray[i] = Math.log(i+10)-Math.log(i+9);
            totalLength += testArray[i];
        }
        //console.log(testArray)
        var quart = (_box_width + 10 )/totalLength;
        //console.log(_box_width,totalLength,quart)
        for(var i=0;i<=100;i++){
            this.m_finalArray.push(quart * testArray[i]);
        }
    }
    PicMove(){
        var This = this;
        var _Width = $('#picture_center').width();
        console.log(_Width)
        this.UpdatePicParams(_Width);
        var count = 0;
        var n_left = -this.layerWidth;
        var _opacity = 0;
        var n_delay = 25;
        var n_index = 1;
        $('#layer_image').css({
            'left': n_left + 'px'
        })
        this.layerTimer = setInterval(function(){

            if(n_index + 1 < This.m_finalArray.length){
                n_left = n_left + This.m_finalArray[n_index];
                n_index++;
                _opacity = n_index/This.m_finalArray.length;
                $('#layer_image').css({
                    'left': n_left + 'px',
                    'opacity': _opacity+''
                })

            }else{
                if(count > n_delay){
                    n_left = -This.layerWidth;
                    n_index = 1;
                    _opacity = 0;
                    count = 0;
                    $('#layer_image').css({
                        'left': n_left + 'px',
                        'opacity': 0+''
                    })
                }
                _opacity = (n_delay - count)*1.0/n_delay;
                n_left = n_left + 2;
                $('#layer_image').css({
                    'left': n_left + 'px',
                    'opacity': _opacity+''
                })
                count++;
            }

        },15);
    }
    render() {
        return (
            <div className="_pic_ani">
                <div className="picture_center" id="picture_center">
                    <div className="picture_box" id="picture_box">
                        <img className="main_pic" src={this.state.image_url} />
                        <img className="next_pic" id="next_pic" src={this.state.new_image_url} />
                    </div>
                    <img src={scan_layer} className="layer_image" id="layer_image" draggable="false"/>
                    <div className="init_picture_tip" style={{display: !this.state.image_url?'block':'none' }}>暂无可展示的图片，请放置好答题卡后，「开始扫描」</div>
                </div>
            </div>
        );
    }
}

export default PictureAnimation;
