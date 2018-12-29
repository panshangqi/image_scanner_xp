import React from 'react';
import 'whatwg-fetch';
import $ from 'jquery';
import {Modal} from 'antd';
import cookies from 'react-cookies'
import YQ_CONFIG from '@components/yq_config.js'
const YQ = {};

function common_fetch(method, url, reqParam = {}, callback, fn_err) {
    const d = new Date();
    const setting = {};
    const param = reqParam;
    let path = url;
    setting.method = method;
    setting.credentials = 'include';
    setting.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8'
    };
    param.t = d.getTime();
    const _token = cookies.load('u_token')
    const _user_id = cookies.load('u_user_id')
    if(_token){
        setting.headers.token = _token;
        setting.headers.uid = _user_id;
    }
    if (method === 'post') {

        setting.body = JSON.stringify(param);
    } else if (method === 'put') {

        setting.body = JSON.stringify(param);
    } else { //get delete

        const param_string = $.param(param);
        path = `${url}?${param_string}`;
    }

    function check_response_status(res) {
        const { status } = res;
        const msg = [];
        if (status >= 200 && status < 300) {
            return res;
        }
        if (status === 400 || status === 500) {
            msg.push('我们正在努力解决问题');
        }
        if (status === 401) {
            msg.push('您尚未登录');
        }
        if (status === 403) {
            msg.push('你无权限访问');
        }
        if (status === 404) {
            msg.push('未发现所请求的资源');
        }
        if (status === 403) {
            msg.push('没有权限或访问的资源不属于此账号');
        }
        if (status === 502) {
            msg.push('服务正在升级，请稍后重试！');
        }
        if(typeof fn_err === 'function'){
            fn_err(status);
        }
        msg.push(`(${res.statusText})`);
        const error = new Error();
        error.name = status;
        error.message = msg.join('\n');
        error.res = res;
        throw error;
    }

    function parse_res(res) {
        return res.json();
    }

    function network_error(error) {
        let title = 'Network Error';
        if(typeof fn_err === 'function'){
            fn_err(500);
        }
        if (error.name && error.name !== 'Error') {
            title = error.name;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(error);
        }
        console.log('Network Error: ',error.message);
    }

    function success(res_data) {
        callback(res_data);
    }

    if(!callback){
        return fetch(path, setting).then(check_response_status).catch(network_error);
    }

    fetch(path, setting).then(check_response_status)
        .then(parse_res)
        .then(success)
        .catch(network_error);
}

YQ.http = {
    get(url, reqParam, callback, fn_err) {
        return common_fetch('get', url, reqParam, callback, fn_err);
    },
    post(url, reqParam, callback, fn_err) {
        return common_fetch('post', url, reqParam, callback, fn_err);
    },
    put(url, reqParam, callback, fn_err) {
        return common_fetch('put', url, reqParam, callback, fn_err);
    },
    _delete(url, reqParam, callback, fn_err) {
        return common_fetch('delete', url, reqParam, callback, fn_err);
    },
    getSync(url, reqParam){
        return new Promise(function (resolve, reject) {
            YQ.http.get(url, reqParam, function (data) {
                resolve(data)
            },function (err_code) {
                resolve(err_code)
            })
        })
    },
    postSync(url, reqParam){
        return new Promise(function (resolve, reject) {
            YQ.http.post(url, reqParam, function (data) {
                resolve(data)
            },function (err_code) {
                resolve(err_code)
            })
        })
    }
};
console.log(process.env.NODE_ENV)
YQ.util = {
    make_local_url(_route){
        if(process.env.NODE_ENV === 'development'){
            return '/client' + _route
        }
        return YQ_CONFIG.local_url + _route
    },
    make_aliyun_url(_route){
        if(process.env.NODE_ENV === 'development'){
            return '/client' + _route
        }
        return YQ_CONFIG.aliyun_url + _route
    },
    get_tail_route(cur_url){
        var _url = cur_url;
        var pos = _url.indexOf('?');
        if(pos > -1){
            _url = _url.substring(0, pos);
        }
        var as = _url.split('/');
        as = as.reverse();
        if(as.length > 0){
            return as[0];
        }
        return null;
    },
    get_image_name(_name){
        //如果图片包含 scanimage/fasdifaood465g4fs5dgsd.jpg
        //只取fasdifaood465g4fs5dgsd.jpg
        var pos = _name.indexOf('/');
        if(pos == -1){
            return _name;
        }
        var arr = _name.split('/');
        return arr[arr.length-1];
    },
    warning(msg){

        Modal.warning({
            title: '提示',
            content: msg,
        });
    }
}
class clsWebsocket{
    constructor(){
        var ws = null;
        try{
            var ws = new WebSocket('ws://127.0.0.1:10080');//连接服务器
            ws.onopen = function(event){
                console.log("已经与服务器建立了连接\r\n当前连接状态："+this.readyState);
            };
            ws.onerror = function(event){
                console.log("WebSocket异常！");
            };
            ws.onmessage = function(event){
                console.log(event.data)
            }
            ws.onclose = function()
            {
                // 关闭 websocket
                console.log("连接已关闭...");
            };

        }catch (e) {
            ws = null;
            console.log(e)
        }
        this.ws = ws
    }
    sendMessage(str){
        this.ws.send(JSON.stringify(str))
    }
}
YQ.Websocket = function () {
    return new clsWebsocket()
}

export default YQ;
