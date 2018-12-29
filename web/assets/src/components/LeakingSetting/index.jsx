
import React, { Component } from 'react';
import { Modal, Button} from 'antd';
import YQ from '@components/yq'
import './style.less';
const electron = window.require('electron');
const {ipcRenderer, remote} = electron;
const diskspace = window.require('diskspace');
import ModalTitle from '@components/ModalTitle'


class LeakingSettingDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            installationPath: remote.app.getPath('exe'),  //安装路径
            savePath: '',  //保存路径
            spaceResidual: '',  //磁盘剩余
			lack_students: [],
			absent_students: [],
			number: '',
            has_scan_number: 0,
            absent_number: 0,
			lack_number: 0
        };
        this.onChangeStudent = this.onChangeStudent.bind(this)
    }
    componentDidMount(){

    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }
    showDialog() {
        console.log('=>>>>>=>==============');
        const This = this;
        var _url= YQ.util.make_local_url('/checkout_lack_student');
        var _exam_info = YQ.util.get_ini('exam_info');
        YQ.http.get(_url, {}, function (res){

            This.setState({
                lack_students: res.data.lack_students,
                absent_students: res.data.absent_students,
                number: res.data.all_students_number,
                has_scan_number: res.data.has_scan_number,
                absent_number: res.data.absent_students.length,
                lack_number: res.data.lack_students.length,
                exam_id: _exam_info.exam_id,
                exam_name: _exam_info.exam_name,
                subject_id: _exam_info.subject_id,
                subject_name: _exam_info.subject_name,
                school_name: _exam_info.school_name
            });
        });
        this.setState({
            visible: true,
        });
    }
    hideDialog() {
        this.state({
            visible: false,
        });
    }
	handleCancel = () => {
		const _this = this;
		this.setState({
			visible: false
		});
	};
    downloadTable(){
    	var table_data = [];
        var _exam_info = YQ.util.get_ini('exam_info');
    	table_data.push(['考试名称','学科','学校','类型','考号','学生','考场','班级']);
        this.state.lack_students.map(function(item, index){
            var _item = [];
            _item.push(_exam_info.exam_name);
            _item.push(_exam_info.subject_name);
            _item.push(_exam_info.school_name);
            _item.push('漏扫');
            _item.push(item.exam_number ? item.exam_number : '-/-');
            _item.push(item.real_name ? item.real_name : '-/-');
            _item.push(item.room_number ? item.room_number : '-/-');
            _item.push(item.class_name ? item.class_name : '-/-');
            table_data.push(_item);
        })
        this.state.absent_students.map(function(item, index){
            var _item = [];
            _item.push(_exam_info.exam_name);
            _item.push(_exam_info.subject_name);
            _item.push(_exam_info.school_name);
            _item.push('缺考');
            _item.push(item.exam_number ? item.exam_number : '-/-');
            _item.push(item.real_name ? item.real_name : '-/-');
            _item.push(item.room_number ? item.room_number : '-/-');
            _item.push(item.class_name ? item.class_name : '-/-');
            table_data.push(_item);
        })
		ipcRenderer.send('message-download-absent-excel',table_data);
	}
	renderLackingTable(){
		const _this = this;
		if(this.state.lack_students.length == 0 && this.state.absent_students.length == 0) {
			return(
				<tr>
					<td>--</td>
					<td>--</td>
					<td>--</td>
					<td>--</td>
					<td>--</td>
					<td>--</td>
					<td>--</td>
					<td>--</td>
				</tr>
			)
		}
		if(this.state.lack_students.length > 0){
			return(
				this.state.lack_students.map(function(item, index){
					return (
						<tr
							key={item.student_id + index}
							className={index == _this.state.row_index ? 'clicked_row' : null}
							onClick={()=>_this.onChangeStudent(item.ids, index)}>
							<td>{_this.state.exam_name}</td>
							<td>{_this.state.subject_name}</td>
							<td>{_this.state.school_name}</td>
							<td>漏扫</td>
							<td>{item.exam_number}</td>
							<td>{item.real_name}</td>
							<td>{item.room_number ? item.room_number : '-/-'}</td>
							<td>{item.class_name ? item.class_name : '-/-'}</td>
						</tr>
					)
				})
			)
		}
	}
	renderMissingTable(){
		const _this = this;
		if(this.state.absent_students.length > 0){
			return(
				this.state.absent_students.map(function(item, index){
					return (
						<tr
							key={item.student_id + index}
							className={index == _this.state.row_index ? 'clicked_row' : null}
							onClick={()=>_this.onChangeStudent(item.ids, index)}>
							<td>{_this.state.exam_name}</td>
							<td>{_this.state.subject_name}</td>
							<td>{_this.state.school_name}</td>
							<td>缺考</td>
							<td>{item.exam_number}</td>
							<td>{item.real_name}</td>
							<td>{item.room_number ? item.room_number : '-/-'}</td>
							<td>{item.class_name ? item.class_name : '-/-'}</td>
						</tr>
					)
				})
			)
		}
	}
    onChangeStudent(_ids, index){

	}
	renderStudentTable(){
		const _this = this;
		return(
			<div className="table_box">
				<table  className="table_header" style={{ height: 'auto'}}>
					<thead>
						<tr>
							<th>考试名称</th>
							<th>学科</th>
							<th>学校</th>
							<th>类型</th>
							<th>考号</th>
							<th>学生</th>
							<th>考场</th>
							<th>班级</th>
						</tr>
					</thead>
					<tbody>
						{this.renderLackingTable()}
						{this.renderMissingTable()}
					</tbody>
				</table>
			</div>
		)
	}
    render() {
        return (
			<Modal
				title={<ModalTitle title="漏扫检查"/>}
				visible={this.state.visible}
				maskClosable={false}
				onCancel={this.handleCancel}
				footer={null}
				width={850}
			>
				<div className="_leak_setting">
					<div className="missing_info_box" style={{ height: 'auto'}}>
						<div className="totle_title">
							本科考试<span> {this.state.number} </span>人，
							已经上传<span> {this.state.has_scan_number} </span>人，
							确认缺考<span> {this.state.absent_number} </span>人，
							当前漏扫<span> {this.state.lack_number} </span>人
						</div>
						{this.renderStudentTable()}
					</div>
					<div className="bottom_box">
						<Button className="theme_empty_btn" onClick={this.handleCancel}>关闭窗口</Button>
						<Button type="primary" style={{marginLeft:20}} onClick={this.downloadTable.bind(this)}>下载名单</Button>
					</div>
				</div>
			</Modal>
        );
    }
}
export default LeakingSettingDialog;
