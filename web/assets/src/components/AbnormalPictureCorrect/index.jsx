
import React, { Component } from 'react';
import { Modal, Icon, Radio } from 'antd';

import './style.less';
import YQ from '@components/yq.jsx'
import $ from 'jquery'
import image_enlarge from '@imgs/image_enlarge.svg';
import image_small from '@imgs/image_small.svg';
import rotate_left from '@imgs/rotate_left.svg';
import rotate_right from '@imgs/rotate_right.svg';
import rotate_90 from '@imgs/rotate_90.svg'
import exam_grid from '@imgs/exam_grid.svg';

const RadioGroup = Radio.Group;
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const { exec } = window.require('child_process');
var client_version = remote.app.getVersion();
var m_layer = {
    rate_x: 0.0,
    rate_y: 0.0,
    rate_w: 1.0,
    rate_h: 1.0
};
function warning(msg) {
    Modal.warning({
        title: '提示',
        content: msg,
    });
}
function _removeUnit(val) {
    var match;
    match = /(\-*\d+\.*\d*)/.exec(val);
    if(val && match){
        return parseFloat(match[1]);
    }else{
        return 0;
    }
}
function draw_tp_recognition_res($img_wrap, reactData, tp_re_recognition_parameters) {

    //-------------------------
    var w = $img_wrap.width();
    var h = $img_wrap.height();
    var img_w = $('#pic_image')[0].naturalWidth
    var img_h = $('#pic_image')[0].naturalHeight
    console.log(`>>>>w:${w}, h${h}`);
    console.log(`>>>>img_w:${img_w}, ${img_h}`);
    var x = 0;
    var y = 0;
    var rect = reactData//tp_page_rects_list[page_num - 1];
    console.log(rect);
    var page_w = rect.suggest_w;
    var page_h = rect.suggest_h;
    console.log(`>>>>page_w:${page_w}, page_h${page_h}`);
    if(page_h > img_h || page_w > img_w) {
        page_w = img_w
        page_h = img_h
    }
    if(!page_w || !page_h){
        page_w = img_w;
        page_h = img_h;
    }

    var content = rect.rects;
    var scale_w = page_w / img_w;
    var scale_h = page_h / img_h;
    if(!scale_w || !scale_h) {
        scale_w = 1
        scale_h = 1
    }
    let cover_w = w * scale_w
    let cover_h = h * scale_h
    var $cover = $("<div>");
    if(tp_re_recognition_parameters){
        x = tp_re_recognition_parameters.offset.x * w;
        y = tp_re_recognition_parameters.offset.y * h;
    } else {
        x = (w - cover_w) / 2
        y = (h - cover_h) / 2
    }

    $img_wrap.find('.tp_recognition_cover').remove();
    $cover.addClass('tp_recognition_cover');
    $cover.css({
        'width': cover_w,
        'height': cover_h,
        'position': 'absolute',
        'left': x,
        'top': y,
        'cursor': 'move',
        'border': '1px solid #FBA478'
    });
    $cover.append('<div class="lt corner"></div>');
    $cover.append('<div class="lb corner"></div>');
    $cover.append('<div class="rt corner"></div>');
    $cover.append('<div class="rb corner"></div>');
    $cover.append('<div class="l byline"></div>');
    $cover.append('<div class="t byline"></div>');
    $cover.append('<div class="r byline"></div>');
    $cover.append('<div class="b byline"></div>');
    function $box_render($p, w, h, x, y, bd){
        var $div = $('<div>');
        $div.addClass('recognition_rect');
        $div.css({
            'position': 'absolute',
            'width': w * 100 + '%',
            'height': h * 100 + '%',
            'left': x * 100 + '%',
            'top': y * 100 + '%'
        });
        if(bd){
            $div.css({
                'background': 'rgba(255,121,107,.4)'
            });
        }else{
            $div.css({
                'border': '1px solid #ff786f'
            });
        }
        $p.append($div);
        return $div;
    }

    $.each(content, function(_, rect) {
        var cw = rect.w, ch = rect.h, cx = rect.x, cy = rect.y;
        var box_w = rect.box_w, box_h = rect.box_h;
        var box_hspace = rect.box_hspace, box_vspace = rect.box_vspace;
        var box_h_count = rect.box_h_count, box_v_count = rect.box_v_count;
        var $box = $box_render($cover, cw, ch, cx, cy);
        if(box_h_count && box_v_count){
            for(var i=0; i<box_h_count; i++){
                for(var j=0; j<box_v_count; j++){
                    var bw = box_w / cw;
                    var bh = box_h / ch;
                    var bx = i*bw + i*(box_hspace / cw);
                    var by = j*bh + j*(box_vspace / ch);
                    $box_render($box, bw, bh, bx, by, true);
                }
            }
        }
    })
    _cover_event($cover);
    $img_wrap.append($cover);
}

function size_of_horizontal_vertical($el){
    var horizontal = '';
    var vertical = '';
    var inProportion = false;
    if($el.hasClass('lt')){
        horizontal = 'left';
        vertical = 'top';
        inProportion = true;
    }else if ($el.hasClass('lb')){
        horizontal = 'left';
        vertical = 'bottom';
        inProportion = true;
    }else if($el.hasClass('rb')){
        horizontal = 'right';
        vertical = 'bottom';
        inProportion = true;
    }else if($el.hasClass('rt')){
        horizontal = 'right';
        vertical = 'top';
        inProportion = true;
    }else if($el.hasClass('l')){
        horizontal = 'left';
    }else if($el.hasClass('r')){
        horizontal = 'right';
    }else if($el.hasClass('t')){
        vertical = 'top';
    }else if($el.hasClass('b')){
        vertical = 'bottom';
    }
    return {
        horizontal: horizontal,
        vertical: vertical,
        inProportion: inProportion
    }
}

function _cover_event($cover){
    $cover.mousedown(function(e) {
        var $panel = $(this),
            x,
            y,
            w,
            h,
            pageX,
            pageY,
            doc = document,
            max_w,
            max_h;
        var el = e.target;
        var $el = $(el);
        var horizontal, vertical, inProportion = false, action = 'create';

        e.stopPropagation();

        if($el.hasClass('corner') || $el.hasClass('byline')){
            var size_obj = size_of_horizontal_vertical($el);
            action = 'size';
            horizontal = size_obj.horizontal;
            vertical = size_obj.vertical;
            inProportion = size_obj.inProportion;
        }else{
            action = 'move';
        }

        if($cover.hasClass('static')){
            return;
        }
        x = _removeUnit($panel.css('left'));
        y = _removeUnit($panel.css('top'));
        w = $panel.width();
        h = $panel.height();
        pageX = e.pageX;
        pageY = e.pageY;


        function movelistener(e) {
            e.preventDefault();
            var diffX = Math.round(e.pageX - pageX);
            var diffY = Math.round(e.pageY - pageY);
            var new_x = x;
            var new_y = y;
            var new_w = w;
            var new_h = h;
            if(action === 'move'){
                new_x = x + diffX;
                new_y = y + diffY;
                console.log('move')
            }else if(action === 'size'){
                console.log(action, horizontal, vertical)
                if(horizontal === 'left'){
                    new_w = w - diffX;
                    new_x = x + diffX;
                }
                if(horizontal === 'right'){
                    new_w = w + diffX;
                }
                if(vertical === 'top'){
                    new_h = h - diffY;
                    new_y = y + diffY;
                    if(inProportion){
                        /*
                        new_h = h * new_w / w;
                        diffY = h - new_h;
                        new_y = y + diffY;
                        */
                    }
                }
                if(vertical === 'bottom'){
                    new_h = h + diffY;
                    if(inProportion){
                        //new_h = h * new_w / w;
                    }
                }
            }
            if(action === 'move'){
                $panel.css({
                    'left': new_x,
                    'top': new_y
                });
            }else if(action === 'size'){
                $panel.css({
                    'left': new_x,
                    'top': new_y,
                    'width': new_w,
                    'height': new_h
                });
            }
            m_layer = {
                rate_x: new_x * 1.0 / $('#pic_image').width(),
                rate_y: new_y * 1.0 / $('#pic_image').height(),
                rate_w: new_w * 1.0 / $('#pic_image').width(),
                rate_h: new_h * 1.0 / $('#pic_image').height()
            }
        }
        function uplistener(e) {
            e.preventDefault();
            $(doc).unbind('mousemove', movelistener)
                .unbind('mouseup', uplistener)
                .unbind('selectstart', selectlistener);
        }
        function selectlistener(e) {
            e.preventDefault();
        }
        $(doc).mousemove(movelistener)
            .mouseup(uplistener)
            .bind('selectstart', selectlistener);
    });
}
function getUrlRoute(){
    var _url = window.location.href;
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
/*
 var EXCEPT_MAP = {
 'fatal_error': 1,   //二维码 识别异常
 'number_error': 2, //学号异常
 'muti_error': 3,   //重复异常
 'absent_error': 4,  //缺考异常
 'objective_error': 5, //客观题异常
 'missing_error': 6  //缺页 异常
 }
 */
class AbnormalPictureCorrect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            abnormal_id: props.abnormal_id,
            const_abnormal_id: props.abnormal_id, //记录最初的id，即左侧列表的id,主要用于二次识别是否显示旋转按钮
            has_recognized: false,
            student_id: props.student_id,
            tail_route: getUrlRoute(),
            imageDefaultWidth: 670,
            imageList:[],
            show_image_url: null,
            cover_index: 0,
            page_order: '-/-',
            batch_order:'-/-'
        }

        this.page_type = -1;
        this.minWidth = 400;
        this.maxWidth = 1600;
        this.angle = 0;
        this.q_angle = 0;
        this.rotate_image_name = null;
        this.anscard_id = null;
        this.layer = {
            rate_x: 0.0,
            rate_y: 0.0,
            rate_w: 1.0,
            rate_h: 1.0
        }

        if(this.state.tail_route === 'fatal'){
            this.page_type = 1;
        }else  if(this.state.tail_route === 'absent'){
            this.page_type = 4;
        }else  if(this.state.tail_route === 'objective'){
            this.page_type = 5;
        }else  if(this.state.tail_route === 'student'){
            this.page_type = 2;
        }else  if(this.state.tail_route === 'losing'){
            this.page_type = 6;
        }
        console.log(props);
        console.log('==>: ' + this.state.tail_route, this.page_type);
        this.onEnlargeClick = this.onEnlargeClick.bind(this);
        this.onLessClick = this.onLessClick.bind(this);
        this.onLeftRotateClick = this.onLeftRotateClick.bind(this);
        this.onRightRotateClick = this.onRightRotateClick.bind(this);
        this.onQuarterRotateClick = this.onQuarterRotateClick.bind(this);
        this.onGetLayout = this.onGetLayout.bind(this);
        this.onMainPicLoad = this.onMainPicLoad.bind(this);
        this.initImageList = this.initImageList.bind(this);
        this.getImageByAbnormalId = this.getImageByAbnormalId.bind(this);
        this.onSetAbnormalId = this.onSetAbnormalId.bind(this);
        this.getUrlFileName = this.getUrlFileName.bind(this);
        this.getReRegInfo = this.getReRegInfo.bind(this); //获取二次识别的信息
        this.getBatchOrder = this.getBatchOrder.bind(this);
        this.reRecognizedState = this.reRecognizedState.bind(this);
    }
    componentDidMount(){
        var This = this;

        this.getImageByAbnormalId();

        ipcRenderer.on('message-pic-rotate-1-end', function (e, arg) {
            console.log(arg); //arg : rotate filename
            This.rotate_image_name = arg;
            This.setState({
                show_image_url: YQ.util.make_local_url(`/${arg}`)
            }, function () {
                $('#pic_image').off();
                $('#pic_image').on('load', function() {
                   This.onGetLayout();
                })
            })
        })
    }
    componentWillUnmount(){
        ipcRenderer.removeAllListeners('message-pic-rotate-1-end');
        this.setState = (state,callback)=>{
            return;
        };
    }
    getReRegInfo(){
        return {
            abnormal_id: this.state.abnormal_id,
            filename: this.rotate_image_name,
            anscard_id: this.anscard_id,
            layer: m_layer
        };
    }
    reRecognizedState(status){
        this.setState({has_recognized: status}); //如果已经处理过，则显示旋转按钮
    }
    //根据异常id获取本地图片
    getImageByAbnormalId(){
        //除了缺页都调用get_detail_data;
        var _this = this;
        if(this.page_type<6 && this.page_type > 0){
            var _url = YQ.util.make_local_url('/get_detail_data');
            var _params = {
                abnormal_id: this.state.abnormal_id,
                type: this.page_type
            }
            console.log(_params);
            YQ.http.get(_url, _params, function (res) {
                console.log('==========================');
                console.log(res);
                if(res.type != 'ERROR' && res.data){
                    _this.anscard_id = res.data.anscard_id;
                    var _scan_datas = res.data.scan_datas;
                    var _be_done = res.data.be_done;
                    _this.setState({has_recognized: _be_done}); //如果已经处理过，则显示旋转按钮

                    if(_scan_datas.length > 1){
                        if(_scan_datas[0].page_num != -1 && _scan_datas[1].page_num != -1){
                            _scan_datas.sort(function (a, b) {
                                return a.page_num - b.page_num;
                            })
                        }else{
                            _scan_datas.sort(function (a, b) {
                                return a.id.localeCompare(b.id);
                            })
                        }
                    }

                    var lists = [];
                    var _show_image_url = null;

                    for(var i=0;i<_scan_datas.length; i++){
                        var s_item = {
                            image_url: YQ.util.make_local_url(`/${YQ.util.get_image_name(_scan_datas[i].source_image)}`) ,
                            image_name: `${_scan_datas[i].source_image}`,
                            _id: _scan_datas[i].id
                        }
                        //如果是二次识别并且已经识别过，则显示align_image，摆正的图片
                        if(_this.state.tail_route === 'fatal' && _be_done == true && _scan_datas[i].align_image){
                            s_item = {
                                image_url: YQ.util.make_local_url(`/${YQ.util.get_image_name(_scan_datas[i].align_image)}`) ,
                                image_name: `${_scan_datas[i].align_image}`,
                                _id: _scan_datas[i].id
                            }
                        }
                        lists.push(s_item);
                        if(lists[i]._id === _this.state.abnormal_id){
                            console.log(lists[i]._id, _this.state.abnormal_id);
                            _show_image_url = YQ.util.make_local_url(`/${YQ.util.get_image_name(lists[i].image_url)}`) ;
                            _this.rotate_image_name = YQ.util.get_image_name(_scan_datas[i].source_image);
                        }
                        ipcRenderer.send('message-pic-bak', _this.rotate_image_name);
                    }
                    console.log(_show_image_url);

                    _this.setState({
                        imageList: lists,
                        show_image_url: _show_image_url
                    })
                }
            })
            _this.getBatchOrder();
        }
        //缺页
        else if(this.page_type == 6){

            var _url = YQ.util.make_local_url('/get_losing_student');
            YQ.http.get(_url,{student_id: this.state.abnormal_id}, function (res) {
                console.log('考试缺页');
                console.log(res);
                if(res.data.length > 0){
                    var _lists = [];
                    var _show_image_url = null;
                    for(var i=0;i<res.data.length;i++){
                        var v_id = _this.state.abnormal_id;
                        if(i>0){
                            v_id = `${v_id}_${i}`;
                        }
                        _lists.push({
                            image_url: YQ.util.make_local_url(`/${YQ.util.get_image_name(res.data[i].image)}`) ,
                            image_name: `${res.data[i].image}`,
                            _id: v_id
                        })
                        if(i==0){
                            _show_image_url = _lists[0].image_url;
                        }
                    }
                    _this.setState({
                        imageList: _lists,
                        show_image_url: _show_image_url
                    })
                }
            })

        }else if(this.state.tail_route === 'normal'){
            var This = this;
            const _url = YQ.util.make_local_url('/get_normal_student_list');
            YQ.http.get(_url, {}, function (res) {
                console.log('正常列表1',res);
                if (res.type !== 'ERROR') {
                    var _normal_list = res.data;
                    var cur_item = [];
                    for(var i=0;i<_normal_list.length;i++){
                        if(_normal_list[i].student_id === This.state.student_id){
                            cur_item = _normal_list[i];
                        }
                    }
                    var _lists = [];
                    console.log(cur_item);
                    var _show_image_url = null;
                    for(var i=0;i<cur_item.image_id_arr.length;i++){
                        var image_name = cur_item.image_id_arr[i].image;
                        _lists.push({
                            image_url: YQ.util.make_local_url(`/${YQ.util.get_image_name(image_name)}`) ,
                            image_name: `${image_name}`,
                            _id: cur_item.image_id_arr[i].id
                        })
                        if(i==0){
                            _show_image_url = _lists[0].image_url;
                        }
                    }
                    This.setState({
                        imageList: _lists,
                        show_image_url: _show_image_url
                    })
                }
            });
            This.getBatchOrder();
        }
    }
    getBatchOrder(){
        var _this = this;
        var _url = YQ.util.make_local_url('/get_batch_order_by_abnormal_id');
        YQ.http.get(_url, {abnormal_id: this.state.abnormal_id}, function (res) {
            if(res.type === 'AJAX'){
                _this.setState({
                    page_order: res.data.page_order,
                    batch_order: res.data.batch_order
                })
            }
        })
    }
    onSetAbnormalId(){

    }
    onEnlargeClick(){
        var This = this;
        var _Width = this.state.imageDefaultWidth + 20;
        if(_Width > this.maxWidth)
            return;
        this.setState({
            imageDefaultWidth: _Width
        },function(){
            This.onGetLayout();
        })
    }
    onLessClick(){
        var This = this;
        var _Width = this.state.imageDefaultWidth - 20;
        if(_Width < this.minWidth)
            return;
        this.setState({
            imageDefaultWidth: _Width
        },function(){
            This.onGetLayout();
        })
    }
    onLeftRotateClick(){
        this.angle += 1;
        var _src_filename = (this.q_angle == 0)? this.getUrlFileName() : `rotate_${this.q_angle}_${this.getUrlFileName()}`;
        if(_src_filename){
            ipcRenderer.send('message-pic-rotate', {
                type: 1,
                filename: _src_filename,
                angle: this.angle
            });
        }

    }
    onRightRotateClick(){
        this.angle -= 1;
        var _src_filename = (this.q_angle == 0)? this.getUrlFileName() : `rotate_${this.q_angle}_${this.getUrlFileName()}`;
        if(_src_filename){
            ipcRenderer.send('message-pic-rotate', {
                type: 1,
                filename: _src_filename,
                angle: this.angle
            });
        }
    }
    onQuarterRotateClick() {
        this.q_angle += 90;
        if(this.q_angle == 360){
            this.q_angle = 0;
        }
        this.angle = 0;
        var _src_filename = this.getUrlFileName();
        if(_src_filename){
            ipcRenderer.send('message-pic-rotate', {
                type: 90,
                filename: _src_filename,
                angle: this.q_angle
            });
        }
    }

    getUrlFileName(){
        /*
        var str = this.state.show_image_url;
        var arr = str.split('/');
        return arr[arr.length-1];
        */
        for(var i=0;i<this.state.imageList.length;i++){
            console.log(this.state.abnormal_id ,this.state.imageList[i]._id)
            if(this.state.abnormal_id === this.state.imageList[i]._id){
                return YQ.util.get_image_name(this.state.imageList[i].image_name);
            }
        }
        return null;
    }
    onGetLayout(){

        var imgWidth = $('#pic_image').width();
        var imgHeight = $('#pic_image').height();
        var index = this.state.cover_index;
        if(!index){
            return;
        }

        index --;
        $('#pic_layer').css({
            width: imgWidth + 'px',
            height: imgHeight + 'px'
        })
        console.log(`>>>>image   :${imgWidth}, ${imgHeight}`);
        // $('#pic_grid').css({
        //     width: imgWidth + 'px',
        //     height: imgHeight + 'px'
        // })

        var This = this;
        var url = YQ.util.make_local_url('/get_detail_data');
        YQ.http.get(url, {abnormal_id: this.state.abnormal_id, type: 1 }, function (res) {
            console.log(res);
            draw_tp_recognition_res($('#pic_layer'), res.data.ret_pages[index]);
        })
    }

    onMainPicLoad(e){
        if(this.state.tail_route === 'objective' || this.state.tail_route === 'student' || this.state.tail_route === 'absent'){
            //this.onGetLayout();
            var imageBoxW = $('#_picture_show').width();
            var imageW = $('#pic_image').width();
            var imageH = $('#pic_image').height();
            if(imageW > imageH) //A3
            {
                this.setState({
                    imageDefaultWidth: imageBoxW*1.8
                })
            }
        }
    }
    componentWillReceiveProps(props){
        //alert(props.abnormal_id +'<<<---0>>>'+ this.state.abnormal_id);
        console.log('AbnormalPictureCorrect componentWillReceiveProps()');
        console.log(props);
        var This = this;
        console.log(`选择第张${props.cover_index}答题卡`);
        if(props.student_id !== this.state.student_id){
            this.setState({
                student_id: props.student_id
            },function(){
                This.getImageByAbnormalId();
            });
        }

        if(props.cover_index < 1){
            this.setState({
                cover_index: 0
            })
        }
        if(props.cover_index !== this.state.cover_index){
            $('#pic_layer').empty();
            if(props.cover_index>0){

                if(this.state.imageList.length == 0){
                    warning('请选择异常卷');
                }
                else{
                    this.setState({
                        cover_index: props.cover_index
                    },function(){
                        This.onGetLayout();
                    })
                }

            }
        }

        if(props.abnormal_id !== this.state.abnormal_id){
            this.setState({
                abnormal_id: props.abnormal_id,
                const_abnormal_id: props.abnormal_id,//记录最初的id，即左侧列表的id,主要用于二次识别是否显示旋转按钮
                has_recognized: false
            },function(){
                This.angle = 0;
                This.q_angle = 0;
                This.getImageByAbnormalId();
            });
        }

    }
    imgItemClick(item, value,event){
        if(this.state.abnormal_id == item._id){
            return
        }
        this.rotate_image_name = item.image_name;
        //alert(item.image_url);
        var This = this;
        this.setState({
            abnormal_id: item._id,
            show_image_url: item.image_url
        },function () {
            This.getBatchOrder();
        });
        if(typeof this.props.onPagesSideClick === 'function'){
            if(this.state.tail_route === 'fatal')
                this.props.onPagesSideClick(item._id);
        }
    }
    onListPicLoad(){
        var _imgH = $('.view_pic').height();
        var _imgW = $('.view_pic').width();
        console.log(_imgH,_imgW);
        if(_imgW > _imgH){
            $('.view_pic').css('width','100%');
        }else{
            $('.view_pic').css('width','90px');
        }
    }
    initImageList(){
        var imgList = this.state.imageList;
        var domArr = [];
        for(var i=0;i<imgList.length;i++){
            domArr.push((
                <div className="single_pic_box"
                     key={i+'image'}
                     style={{borderColor: (this.state.abnormal_id == imgList[i]._id) ? '#3d6ed8': '#ccc'}}
                     onClick={this.imgItemClick.bind(this, imgList[i], i)}
                >
                    <img src={imgList[i].image_url}
                         className="view_pic"
                         onLoad={this.onListPicLoad.bind(this)}

                    />
                </div>
            ))
        }
        return domArr;
    }
    clearPictures(){
        this.setState({
            imageList:[],
            show_image_url: null
        })
    }
    render() {
        var _this = this;
        //get_batch_order_by_abnormal_id
        console.log('render=>' + this.state.abnormal_id);
        return (
            <div className="_picture_correct_com">
                <div className="_picture_title">
                    <div className="show_tip">
                        {
                            this.page_type !== 6 ? (
                                <span>试卷位置：第 {this.state.batch_order} 批、 第 {this.state.page_order} 张试卷</span>
                            ):(
                                <div></div>
                            )
                        }

                    </div>
                    <div className="op_btns">
                        <img src={image_small} onClick={this.onLessClick}/>
                        <img src={image_enlarge}  onClick={this.onEnlargeClick}/>
                        {
                            this.state.tail_route === 'fatal' && this.state.abnormal_id === this.state.const_abnormal_id && !_this.state.has_recognized?(
                                <span>
                                    <img src={rotate_left} onClick={this.onLeftRotateClick}/>
                                    <img src={rotate_right} onClick={this.onRightRotateClick}/>
                                    <img src={rotate_90} onClick={this.onQuarterRotateClick}/>
                                </span>
                            ):(<span/>)
                        }
                    </div>
                </div>
                <div className="_picture_box">
                    <div className="_picture_show" id="_picture_show">
                        <img className="pic_image"
                            src={this.state.show_image_url}
                             style={{width: this.state.imageDefaultWidth}}
                             onLoad={this.onMainPicLoad}
                            id="pic_image"
                        />
                        <div className="pic_grid" id="pic_grid"/>
                        <div
                            className="pic_layer"
                            id="pic_layer"
                            style={{width: this.state.imageDefaultWidth}}
                        ></div>
                    </div>
                </div>
                <div className="_picture_list">
                    {this.initImageList()}
                </div>
            </div>
        );
    }
}
export default AbnormalPictureCorrect;
