const path = require('path')
const fs = require('fs')
const ini = require('ini')
const OSS = require('ali-oss').Wrapper;  //version  4.5.1 : 支持yield
//var OSS = require('ali-oss'); //6.0.1
const request = require('request')
const uuid = require('node-uuid')
var yq = {};

var EventEmitter = require('events').EventEmitter
var yq_event = new EventEmitter();
var appdata = path.join(nw.App.dataPath, '..');


function initConfig(){

    var database_dir = path.join(appdata, 'databases');
    var default_pic = path.join(appdata, 'pictures');
    var default_temp_pic = path.join(default_pic, 'temp');
    var default_re_pic = path.join(default_pic, 're_temp');  //二次识别旋转保存路径

    var scanCfgPath = path.join(appdata, "scanCfg.ini");
    const _threshold = 5;
    if (!fs.existsSync(scanCfgPath)) {
        console.log("scanCfg is no exist, now to create");
        fs.writeFileSync(scanCfgPath, "");
        var scanCfg = ini.parse(fs.readFileSync(scanCfgPath, 'utf-8'))
        scanCfg.general = {
            picture: default_pic,
            fingerprint: uuid.v1(),
            threshold: _threshold
        }
        fs.writeFileSync(scanCfgPath, ini.stringify(scanCfg));
        console.log('picture path: ' + default_pic)
    } else {
        var _fingerprint = yq.util.get_ini('fingerprint');
        if (!_fingerprint) {
            m_fingerprint = uuid.v1()
            yq.util.set_ini('fingerprint', m_fingerprint);
        }else{
            m_fingerprint = _fingerprint
        }
        var s_threshold = yq.util.get_ini('threshold');
        if (!s_threshold) {
            yq.util.set_ini('threshold', _threshold);
        }

        var _default_pic = yq.util.get_ini('picture');
        if (fs.existsSync(_default_pic)) {
            default_pic = _default_pic;
            default_temp_pic = path.join(default_pic, 'temp');
            default_re_pic = path.join(default_pic, 're_temp');  //二次识别旋转保存路径
            //logger.info('picture path: ' + _default_pic)
            console.log('picture path: ' + _default_pic)
        }else{
            //logger.info('picture path: ' + _default_pic + ' 不存在')
            console.log('picture path: ' + _default_pic + ' 不存在')
        }
    }
    if (!fs.existsSync(default_pic)) {
        fs.mkdirSync(default_pic);
    }
    if (!fs.existsSync(default_temp_pic)) {
        fs.mkdirSync(default_temp_pic);
    }
    if (!fs.existsSync(default_re_pic)) {
        fs.mkdirSync(default_re_pic);
    }
    if (!fs.existsSync(database_dir)) {
        fs.mkdirSync(database_dir);
    }
    console.log(uuid.v1())
    return {appdata, database_dir, default_pic, default_re_pic, default_temp_pic}
}

yq.http = {
    get: function (url, data, fn, err_fn) {
        const _token = yq.util.get_ini('token');
        const _user_id = yq.util.get_ini('user_id');
        var index = 0;
        var params = '';
        for (var key in data) {
            params += (index == 0) ? '?' : '&';
            params += key;
            params += '=';
            params += data[key];
            index++;
        }
        var _url = url + params;
        request({
            url: _url,
            method: "GET",
            json: true,
            headers: {
                "token": _token,
                "uid": _user_id
            },
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                if (typeof fn === 'function') {
                    fn(body);
                }
                yq_event.emit('http-status','ok');
            } else {
                console.log('client net error');
                yq_event.emit('http-status','fail');
                if (typeof err_fn === 'function') {
                    err_fn(error, response);
                }
            }
        })
    },
    post: function (url, data, fn, err_fn) {
        const _token = yq.util.get_ini('token');
        const _user_id = yq.util.get_ini('user_id');
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "token": _token,
                "uid": _user_id
            },
            body: data
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                if (typeof fn === 'function') {
                    fn(body);
                }
                yq_event.emit('http-status','ok');
            } else {
                if (typeof err_fn === 'function') {
                    err_fn('client net error:' + error);
                }
                yq_event.emit('http-status','fail');
            }
        });
    },
    getAsync: function(url, data){
        return new Promise(function(resolve, reject) {
            yq.http.get(url, data, function(res){
                resolve(res);
            }, function (err) {
                resolve(null);
            })
        })
    },
    postAsync: function(url, data){
        return new Promise(function(resolve, reject) {
            yq.http.post(url, data, function(res){
                resolve(res);
            }, function (err) {
                resolve(null);
            })
        })
    },
    download: function (url, save_path, fn, err_fn) {
        request(url, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                if (typeof fn === 'function') {
                    fn(body);
                }
                yq_event.emit('http-status','ok');
            } else {
                if (typeof err_fn === 'function') {
                    err_fn(err, response);
                }
                yq_event.emit('http-status','fail');
            }
        }).pipe(fs.createWriteStream(save_path))
    },
    upload_file: function*(_key, _filepath, _filename){
        if (!_key) {
            console.log('upload file error: upload_task key is null');
            return null;
        }
        let client = new OSS({
            region: _key.body.region,
            accessKeyId: _key.body.Credentials.AccessKeyId,
            accessKeySecret: _key.body.Credentials.AccessKeySecret,
            bucket: _key.body.bucket,
            stsToken: _key.body.Credentials.SecurityToken
        });
        try {
            let result = yield client.put(`${_key.body.file_dir}${_filename}`, _filepath, {
                timeout: 20000
            });
            console.log(`upload file: ${_key.body.file_dir}${_filename}`);
            if(result.res && result.res.statusCode == 200){
                return { 'result': 'ok' }
            }
            else{
                console.log('upload file error: client put')

                return null;
            }

        } catch (err) {
            console.log('upload file error: try catch');
            console.log(err);
            return null
        }
        return null;
    },
    upload_file_progress: function(_url, filepath, filename, progress_fn){
        return new Promise(function(resolve, reject){
            try{
                var states = fs.statSync(filepath);
                var size =  states.size;

                var formData = {
                    file: fs.createReadStream(filepath),
                    filename: filename
                };
                var headers = {
                    'Accept' : 'application/json'
                };
                progress_fn(0);
                var val = 0.1;
                console.log(filename);
                var res = request.post({url: _url,timeout: 10000, formData: formData,headers: headers}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        progress_fn(1);
                        resolve({error: null, errorCode: 200})
                    }else{
                        resolve({error: `${error}`, errorCode: -1})
                    }
                })
                res.on('drain',function (data) {
                    //console.log('->'+ data)
                    var dispatched = res.req.connection._bytesDispatched;
                    let percent = dispatched/size;
                    if(percent > val){
                        progress_fn(percent);
                        console.log('propress: ' + percent)
                        val += 0.1;
                    }
                })
                res.on('error',function (err) {
                    resolve({error: `${err}`, errorCode: -2})
                })
            }catch (err){
                console.log(err)
                resolve({error: err.stack, errorCode: -3})
            }
        })
    },
    upload_file_multi: function *(_key, _filepath, _filename, progress_fn){
        if (!_key) {
            console.log('upload file multi error: upload_task key is null');
            return {'error': 'key is null', 'errorCode': -4};
        }
        let client = new OSS({
            region: _key.body.region,
            accessKeyId: _key.body.Credentials.AccessKeyId,
            accessKeySecret: _key.body.Credentials.AccessKeySecret,
            bucket: _key.body.bucket,
            stsToken: _key.body.Credentials.SecurityToken,
            timeout: 20000
        });
        try {
            let result = yield client.multipartUpload(`${_key.body.file_dir}${_filename}`, _filepath, {
                partSize: 120000,
                parallel: 2,
                timeout: 20000,
                progress:  function *(p){
                    console.log('propress: ' + p)
                    if (typeof progress_fn == 'function') {
                        progress_fn(p);
                    }
                }
            });
            console.log(`upload file multi: ${_key.body.file_dir}${_filename}`);
            if (result.res && result.res.statusCode == 200) {
                return {'error': null, 'errorCode': 200}
            }
            else {
                console.log('upload file multi error: client put')
                return {'error': 'http response status error', 'errorCode': -1};
            }
        }catch(err){
            console.log('upload file multi error: try catch');
            console.log(err);
            return {'error': 'http multipartUpload exception', 'errorCode': -2};
        }
        return {'error': 'http multipartUpload fail', 'errorCode': -3};
    },
    getAliyunKey: function*(_url) {
        var res = yield yq.http.getAsync(_url)
        if(res.type == 'AJAX'){
            return res;
        }
        return null;
    }
}

yq.util = {
    set_ini: function (key, value) {
        var scanCfgPath = path.join(appdata, "scanCfg.ini");
        if (fs.existsSync(scanCfgPath)) {

            var config = ini.parse(fs.readFileSync(scanCfgPath, 'utf-8'))
            if (!config.general) {
                fs.unlinkSync(scanCfgPath)
                process.exit(-1)
            }
            config.general[key] = value;
            fs.writeFileSync(scanCfgPath, ini.stringify(config));
        }
    },
    get_ini: function (key) {

        var scanCfgPath = path.join(appdata, "scanCfg.ini");
        if (fs.existsSync(scanCfgPath)) {
            var config = ini.parse(fs.readFileSync(scanCfgPath, 'utf-8'))
            if (config.general)
                return config.general[key];
            return null;
        }
        return null;
    },
    get_domain: function (key) {
        var scanCfg = path.join(appdata, "domain.ini");
        if (fs.existsSync(scanCfg)) {
            var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
            if (config.server)
                return config.server[key];
            return null;
        }
        return null;
    },
    get_dir: function (_path) {

        var pos = 0;
        var len = _path.length;
        for (var i = len - 1; i >= 0; i--) {
            if (_path[i] === '\\') {
                pos = i;
                break;
            }
        }
        return _path.substring(0, pos);
    },
    Sleep: function(time = 0) {
        return new Promise((resolve, reject) => {
                setTimeout(() => {
                resolve();
            }, time);
        })
    },
    date_format: function(format) //'YYYYMMDD, YYYMMDD, YYMMDD
    {
        var _date = new Date();
        var y = _date.getFullYear().toString();
        var m = _date.getMonth() + 1;
        var d = _date.getDate();
        if(m < 10){
            m = '0' + m;
        }
        if(d < 10){
            d = '0' + d;
        }
        if(format == 'YYMMDD'){
            return `${y.substring(2,4)}${m}${d}`
        }else if(format == 'YYYMMDD'){
            return `${y.substring(1,4)}${m}${d}`
        }
        return `${y.substring(0,4)}${m}${d}`
    }
}
var s1 = new Date().getTime()
yq.storge = initConfig()
var s2 = new Date().getTime()

console.log('init config time: ' + (s2-s1) + 'ms, storge: ', yq.storge)
module.exports = {
    yq,
    yq_event
};
