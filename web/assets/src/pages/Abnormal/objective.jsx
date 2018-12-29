
import React, { Component } from 'react';
import { Col, Button, Input, Radio} from 'antd';

import YQ from '@components/yq.jsx';
import SubPage from '@components/SubPage';
import AbnormalSiderBar from '@components/AbnormalSiderBar';
import AbnormalPictureCorrect from '@components/AbnormalPictureCorrect'
import ChangeLayout from '@pages/Abnormal/autosize.jsx'
import $ from 'jquery';

const RadioGroup = Radio.Group;

class Objective extends Component{
    constructor(props){
        super(props);
        this.students = [];
        this.abnormal_ids = [],
            this.state = {
                abnormal_id: this.props.match.params.abnormal_id,
                pic_abnormal_id: this.props.match.params.abnormal_id,
                content_min_height: 0,
                checked_type: 1,
                items: [],
                student: ''
            };
        this.checkCancel = this.checkCancel.bind(this);
        this.getDetailData = this.getDetailData.bind(this);
        this.onCheckData = this.onCheckData.bind(this);
    }

    componentDidMount(){

        const url = YQ.util.make_local_url('/get_all_students');
        const _this = this;
        (async function () {
            const all_students = await YQ.http.get(url, {});
            const res = await all_students.json();
            if(res.type === 'ERROR'){
                return;
            }
            _this.students = res.data.students;
            _this.getDetailData(_this.state.abnormal_id);
        })();
        this.setState({
            content_min_height: window.innerHeight - 36 - 16
        });

        ChangeLayout.resize();
        $(window).resize(ChangeLayout.resize);
    }

    removeClick(){
        var url = YQ.util.make_local_url('/delete_abnormal');
        var params = {
            abnormal_id: this.state.abnormal_id
        };
        var This = this;
        YQ.http.post(url, params, (res) => {
            if(res.type == 'AJAX'){
                This.refs.sider_bar.onUpdateSiderBar();
                console.log(This.state.abnormal_id, 'remove');
            }
        });
    }

    onCheckData(items) {
        for (let item of items) {
            if (!item.multiple_choice) {
                for (let ans of item.answer_arr) {
                    if ( ans.length > 1) {
                        //alert(item.item_num + "此题为单选！");
                        YQ.util.warning(`第${item.item_num}为单选`);
                        return false;
                    }
                }
            }
        }
        return true;
    }
    ignoreClick(){
        //ignore_objective
        var _url = YQ.util.make_local_url('/ignore_objective');
        var This = this;
        YQ.http.post(_url, {abnormal_id: this.state.abnormal_id}, function () {
            console.log('忽略成功');
            This.refs.sider_bar.onUpdateSiderBar();
        })
    }
    assignClick(){
        var std_str = this.state.items;
        var This = this;
        var _url = YQ.util.make_local_url('/submit_object_data');
        console.log(this.state.items);
        /*
        if (!this.onCheckData(this.state.items)){
            return;
        }
        */
        (async function () {
            for (var i = 0; i < This.abnormal_ids.length; i++) {
                var _items = [];
                for (var j = 0; j < This.state.items.length; j++) {
                    if (This.abnormal_ids[i] === This.state.items[j].abnormal_id) {
                        var _item = This.state.items[j]
                        _items.push(_item);
                    }
                }
                var _data = {
                    abnormal_id: This.abnormal_ids[i],
                    items: _items
                }

                var _res_call = await YQ.http.post(_url, _data);
                var _result = await _res_call.json();

                if(_result.type === 'AJAX' && i == This.abnormal_ids.length - 1){
                    This.refs.sider_bar.onUpdateSiderBar();
                    console.log('提交成功');
                }
            }
        })()
    }
    onChange = (e) => {
        this.setState({
            checked_type: e.target.value,
        });
    }

    user_answer_display(answer){
        if(answer === -1){
            return '';
        } else {
            return String.fromCharCode ( 'A'.charCodeAt ( 0 )  +  answer )
        }
    }

    user_sys_answer(input){
        input = input.toUpperCase();
        const min = 'A'.charCodeAt ( 0 );
        const max = 'Z'.charCodeAt ( 0 );
        const input_char_code = input.charCodeAt ( 0 );
        if(input_char_code < min){
            return -1;
        }
        if(input_char_code > max){
            return -1;
        }
        input = input_char_code - min;
        return input;
    }

    opts_output(opt){
        let str = '';
        if(Array.isArray(opt)){
            opt.forEach((o) => {
                str += this.user_answer_display(o);
            });
        }
        return str;
    }

    opts_input(opt){
        let arr = [];
        opt = opt.split('');
        opt.forEach((o) => {
            arr.push(this.user_sys_answer(o));
        });
        if(arr.length > 1 && arr.indexOf(-1) !== -1){
            arr.splice(arr.indexOf(-1), 1);
        }
        return arr;
    }

    onAnsChange = (e, q_index, item) => {
        var { value } = e.target;
        value = this.opts_input(value);
        item.answer_arr[q_index] = value;
        this.setState({
            items: this.state.items
        });
    }

    checkCancel(nodes){
        let count = 0;
        for (let node of nodes) {
            if (node.getAttribute('clicked') === '1') {
                count++;
            }
        }
        return count > 1
    }
    onBtnClicked(item, i, index, event) {
        let ans = item.answer_arr[i];
        let clicked = event.target.getAttribute('clicked');
        if (clicked === "0") {
            if (ans.indexOf(-1) > -1) {
                ans = [parseInt(index)];
            } else {
                ans.push(parseInt(index));
                ans.sort();
            }
            event.target.setAttribute('clicked', '1');
            event.target.classList.add('btn_clicked');
            let count = event.target.parentNode.childNodes.length-1;
            event.target.parentNode.childNodes[count].setAttribute('clicked', '0');
            event.target.parentNode.childNodes[count].classList.remove('btn_clicked');
        } else {
            let nodes = event.target.parentNode.childNodes;
            let count = nodes.length - 1;
            ans.splice(ans.indexOf(parseInt(index)), 1);
            if(!this.checkCancel(nodes)) {
                event.target.parentNode.childNodes[count].setAttribute('clicked', '1');
                event.target.parentNode.childNodes[count].classList.add('btn_clicked');
                ans = [-1]
            }
            event.target.setAttribute('clicked', '0');
            event.target.classList.remove('btn_clicked');
        }
        item.answer_arr[i] = ans;
        this.setState({
            items: this.state.items
        });
    }

    onNoAnsBtnClicked(item, i, event) {

        let clicked = event.target.getAttribute('clicked');
        if (clicked === "0") {
            event.target.setAttribute('clicked', '1');
            event.target.classList.add('btn_clicked');
            let count = event.target.parentNode.childNodes.length-1;
            for (let i = 0; i < count; i++) {
                event.target.parentNode.childNodes[i].setAttribute('clicked', '0');
                event.target.parentNode.childNodes[i].classList.remove('btn_clicked');
            }
            item.answer_arr[i] = [-1];
            this.setState({
                items: this.state.items
            });
        }
    }

    items(type){
        const items = [];
        var num_map = {};
        for(let item of this.state.items){
            let is_suspected_abnormal = item.is_suspected_abnormal;
            let answer_arr = item.answer_arr;
            let options_arr = item.options_arr;
            let qs = [];
            if(type === 'abnormal' && is_suspected_abnormal !== 1){
				continue
            }
			for (let i in options_arr) {
                var o_item = parseInt(item.item_num)
                if(!num_map[item.item_num]){
                    num_map[item.item_num] = 1;
                }else{
                    o_item += num_map[item.item_num]
                    num_map[item.item_num]++;
                }
                console.log(o_item);
				const q = (
					<div className="q" key={'ap_'+i}>
						<div className="q_num">{ o_item }.</div>
						<div className="btn_box">{this.renderBtnList(options_arr[i], answer_arr[i], i, item, is_suspected_abnormal)}</div>
					</div>
				);
				qs.push(q);
			}
			items.push(<div className="item" key={item.item_id}>{qs}</div>)
        }
        return items;
    }

    renderBtnList(opts, ans, i, item, type) {
        let btns =[];
        for (let index in opts) {
            let btn;
            if (ans.indexOf(parseInt(index)) > -1) { // 判断是否选中
				if(type == 1){
					btn = (
						<button className="btn_single btn_clicked  ant-btn red_btn" key={index}
								onClick={this.onBtnClicked.bind(this, item, i, index)} clicked={1}>
							{opts[index]}
						</button>
					);
				}else if (type == 0){
						btn = (
							<button className="btn_single btn_clicked  ant-btn " key={index}
									onClick={this.onBtnClicked.bind(this, item, i, index)} clicked={1}>
								{opts[index]}
							</button>
						);
				}
            } else {
                btn = (
                    <button className="btn_single ant-btn" key={index}
                            onClick={this.onBtnClicked.bind(this, item, i, index)} clicked={0}>
                        {opts[index]}
                    </button>
                );
            }
            btns.push(btn);
        }
        let no_ans_btn;
        if (ans.indexOf(-1) > -1){
			if(type == 1){
				no_ans_btn = (
					<button className="btn_single ant-btn btn_clicked red_btn" style={{width: 55, marginRight: 0}} key="none" clicked={1}
							onClick={this.onNoAnsBtnClicked.bind(this, item, i)}>
						未作答
					</button>
				);
			}else{
				no_ans_btn = (
					<button className="btn_single ant-btn btn_clicked" style={{width: 55, marginRight: 0}} key="none" clicked={1}
							onClick={this.onNoAnsBtnClicked.bind(this, item, i)}>
						未作答
					</button>
				);
			}
        } else {
            no_ans_btn = (
                <button className="btn_single ant-btn" style={{width: 55, marginRight: 0}} key="none" clicked={0}
                        onClick={this.onNoAnsBtnClicked.bind(this, item, i)}>
                    未作答
                </button>
            );
        }

        btns.push(no_ans_btn);
        return btns
    }
    items_render(){
        let items = (
            <div className="abnormal_items" id="abnormal_items">
                {this.items('abnormal')}
            </div>
        );
        if(this.state.checked_type === 2){
            items = (
                <div className="normal_items" id="normal_items">
                    {this.items('normal')}
                </div>
            );
        }
        return items;
    }

    componentWillReceiveProps(props){

        var _this = this;
        this.setState({
            abnormal_id: props.match.params.abnormal_id,
            pic_abnormal_id: props.match.params.abnormal_id
        },function () {

            _this.getDetailData(_this.state.abnormal_id);
            //_this.refs.sider_bar.onUpdateSiderBar('init');
        });
    }
    //获取客观题数据 side 正反面的id
    getDetailData(side){

        var _this = this;

        const _detail_data_url = YQ.util.make_local_url('/get_detail_data');
        YQ.http.get(_detail_data_url, {abnormal_id: _this.state.abnormal_id, type: 5}, function (res) {

            var _scan_datas = res.data.scan_datas;
            console.log('获取客观题数据')
            console.log(_scan_datas)
            var _objective_list = [];
            _this.abnormal_ids = [];
            for(var i=0;i<_scan_datas.length;i++){
                for(var j=0;j<_scan_datas[i].objective_items.length;j++){
                    var _item = _scan_datas[i].objective_items[j];
                    _item.abnormal_id = _scan_datas[i].id;
                    _objective_list.push(_item);
                }
                _this.abnormal_ids.push(_scan_datas[i].id);
                //_objective_list = _objective_list.concat(_scan_datas[i].objective_items);
            }
            _objective_list.sort( function (a, b) {
                return parseFloat(a.item_num) - parseFloat(b.item_num);
            })
            console.log(_objective_list)
            _this.setState({
                items: _objective_list
            });
        })
    }

    render(){

        return(
            <div>
                <div className="page" id="page">
                    <div className="page_left" id='left'>
                        <AbnormalSiderBar abnormal_id={this.state.abnormal_id} activeKey="3" ref="sider_bar"/>
                    </div>
                    <div className="page_middle" id='middle'>
                        <AbnormalPictureCorrect
                            abnormal_id={this.state.pic_abnormal_id}
                        />
                    </div>
                    <div className="page_right" id='right'>
                        <div className="assign_result">
                            <div className="title" style={{ height: 21}}>提示：</div>
                            <div className="tips">
                                <p>1.红框代表填涂有误的选项，请重新选择后，点击“提交”，处理下一位。</p>
                                <p>2.若考生未填涂/看不清考生的填涂，点击“忽略”，处理下一位。</p>
                            </div>
                            <div className="objectiveType_radioG">
                                <RadioGroup onChange={this.onChange} value={this.state.checked_type}>
                                    <Radio value={1}>只看异常题</Radio>
                                    <Radio value={2}>查看全部题目</Radio>
                                </RadioGroup>
                            </div>
                            { this.items_render() }
                            <div className="op_btns">
                                <Button onClick={this.ignoreClick.bind(this)} type="primary" ghost>忽略</Button>
                                <Button onClick={this.assignClick.bind(this)} type="primary">提交</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Objective;