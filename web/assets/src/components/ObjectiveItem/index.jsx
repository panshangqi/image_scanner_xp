import React, { Component } from 'react';
import './style.less';

const electron = window.require('electron');
const {remote, ipcRenderer} = electron;


class ObjectiveItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            items: props.items,
        };
        this.items = this.items.bind(this);
    }

    componentDidMount(){

    }

    componentWillReceiveProps(props){
        this.setState({
            items: props.items
        });
    }
    items () {
        console.log(this.state.items);
        const items = [];
        var order = 1;
        if(this.state.items.length == 0){
            items.push(<div className="options_item" key="none">{'未发现客观题'}</div>)
            return items;
        }
        for(let item of this.state.items){
            let answer_arr = item.answer_arr;
            let options_arr = item.options_arr;
            let qs = [];
            var _str = `${item.item_num}. `;
            for(var i=0;i<answer_arr.length;i++){
                if(answer_arr.length > 1){
                    _str += `(${i}).`
                }
                var _re_res = this.answer_map(answer_arr[i], options_arr[i]);
                _str += (_re_res === '' ? '未作答': _re_res);
                _str += ' ，';
            }
            items.push(<div className="options_item" key={item.item_id+order}>{_str}</div>)
            order++;
        }
        return items;
    }
    // [1,3]  ['A','B','C','D]  return B,D
    answer_map(ans_arr, opt_arr){
        var _res = '';
        for(var r = 0 ; r< ans_arr.length ;r++){
            console.log(ans_arr[r]);
            if(opt_arr[ans_arr[r]])
                _res += opt_arr[ans_arr[r]];
        }
        return _res;
    }

    renderBtnList(opts, ans, i, item) {
        let btns =[];
        for (let index in opts) {
            let btn;
            if (ans.indexOf(parseInt(index)) > -1) { // 判断是否选中
                btn = (
                    <button className="btn_single btn_clicked  ant-btn " key={index}>
                        {opts[index]}
                    </button>
                );
            } else {
                btn = (
                    <button className="btn_single ant-btn" key={index}>
                        {opts[index]}
                    </button>
                );
            }
            btns.push(btn);
        }
        let no_ans_btn;
        if (ans.indexOf(-1) > -1){
            no_ans_btn = (
                <button className="btn_single ant-btn btn_clicked" style={{width: 55, marginRight: 0}} key="none" clicked={1}>
                    未作答
                </button>
            );
        } else {
            no_ans_btn = (
                <button className="btn_single ant-btn" style={{width: 55, marginRight: 0}} key="none" clicked={0}>
                    未作答
                </button>
            );
        }

        btns.push(no_ans_btn);
        return btns
    }

    render() {
        return (
            <div className="objective_items">
                {this.items()}
            </div>
        );
    }
}

export default ObjectiveItem;
