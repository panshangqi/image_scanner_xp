console.log('clean build')
var fs = require('fs')
var path = require('path')
var project_root = path.resolve(__dirname,'../../');
console.log(project_root);
var src_dir = path.join(project_root, 'client')
var package_dir = path.join(project_root, 'build/win-xp-ia32')

deleteFolder(package_dir,function (p) {
    console.log('delete' + p)
})
console.log('clean complete')
console.log('copy' + src_dir + '==>' + package_dir)
copyDir(src_dir, package_dir, function (a,b) {
    console.log('copy to ' + b)
});

function deleteFolder(path, call_back) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath,call_back);
            } else { // delete file
                fs.unlinkSync(curPath);
                if(typeof call_back == 'function')
                    call_back(curPath)
            }
        });
        fs.rmdirSync(path);
    }
}

console.log('build successful')



function copyDir(dir, dst, callback) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    }
    fs.readdirSync(dir).forEach(function(file) {
        var pathname = path.join(dir, file);
        var distname = path.join(dst, file);
        if(fs.statSync(pathname).isDirectory()) {
            copyDir(pathname,distname, callback);
        }else {

            copy(pathname, distname);
            callback(pathname, distname);
        }
    });
}
function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

/*
console.log('start copy')
if(process.argv.length < 3){
    console.log('lack params arch')
    process.exit(-1)
}

var _arch = process.argv[2];  //'32'  '64'


var fs = require('fs')
var path = require('path')
var client_root = path.resolve(__dirname,'../../');
console.log(client_root);

function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

var src_dir = client_root;
var dst_dir = _arch == '64' ? path.join(client_root,'build/win-unpacked') : path.join(client_root,'build/win-ia32-unpacked');
var files = [
    'app.exe',
    'ScanSnap.exe',
    'TwainDriver.exe',
    'util.exe',
    'zlib1.dll',
    'opencv_imgproc249.dll',
    'opencv_highgui249.dll',
    'opencv_core249.dll',
    'libcurl.dll',
    'msvcr120.dll',
    'msvcp120.dll',
    'ScanSnap.ini'
]
//复制依赖文件
for(var i=0;i<files.length;i++){
    var _src = path.join(src_dir, files[i]);
    var _dst = path.join(dst_dir, files[i]);
    copy(_src, _dst);
    console.log('copy [' + _src + '] ===> [' + _dst + ']');
}

function copyDir(dir, dst, callback) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    }
    fs.readdirSync(dir).forEach(function(file) {
        var pathname = path.join(dir, file);
        var distname = path.join(dst, file);
        if(fs.statSync(pathname).isDirectory()) {
            copyDir(pathname,distname, callback);
        }else {

            copy(pathname, distname);
            callback(pathname, distname);
        }
    });
}

//复制依赖文件夹
var src_dir_app = path.join(client_root, 'js_addon');
var dst_dir_app = _arch == '64' ? path.join(client_root, 'build/win-unpacked/js_addon') : path.join(client_root, 'build/win-ia32-unpacked/js_addon');

copyDir(src_dir_app, dst_dir_app , function (pathname, distname) {
    console.log(pathname, distname);
})
console.log('complete..');
*/





