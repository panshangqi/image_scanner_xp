import React, { Component } from 'react';
import './style.less';
import sm_logo from '@imgs/sm_logo.svg'
class ModalTitle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title,
        }
    }
    componentWillReceiveProps(props){
        this.setState({
            title: props.title,
        })
    }
    render() {
        return(
            <div className="modal_title">
                <img src={sm_logo} className="modal_logo"/>
                <span className="modal_content">{this.state.title}</span>
            </div>
        );
    }
}
export default ModalTitle;
