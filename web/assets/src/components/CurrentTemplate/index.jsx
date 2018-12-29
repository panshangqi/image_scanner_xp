
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import YQ from '@components/yq'
import MultiTemplateSetting from '@components/MultiTemplateSetting'

import './style.less';


class CurrentTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            template_id:'',
            template_name:'',
            url_to: props.url_to || '/paper_upload'
        }
        this.handleChange = this.handleChange.bind(this)
    }
    componentDidMount(){
        var _template = YQ.util.get_ini('template');
        this.setState({
            template_id: _template.template_id,
            template_name: _template.template_name
        })
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    onModifyTemplate(){
        this.refs.multi_dlg.showDialog('更换模板','switch');
    }
    handleChange(_id,_name){
        console.log(_id,_name)
        this.setState({
            template_id: _id,
            template_name: _name
        })
    }
    render() {

        return (
            <div className="_cur_template_com">
                当前模板：
                <span className="_name" title={this.state.template_name}>{this.state.template_name}</span>
                <a onClick={this.onModifyTemplate.bind(this)} className="_btn" href="javascript:void(0)">更换模板</a>
                <MultiTemplateSetting ref="multi_dlg" onChange={this.handleChange} url_to={this.state.url_to} />
            </div>
        );
    }
}
export default CurrentTemplate;
