// 复制到node_modules下面
console.log('start copy')

var fs = require('fs')
var path = require('path')
var client_root = path.resolve(__dirname,'../../../');
console.log(client_root);

console.log(process.argv)
if(process.argv.length < 2){
    console.log('lack params')
    process.exit(-1);
}

async function run() {

    console.log(client_root)
    var yq_addon = `${client_root}/src/lib/yq_addon`
    var node_modules = `${client_root}/src/node_modules`
    var window_file_class = `${node_modules}/window_file_class`
    //创建文件夹
    var bin32_dir = `${window_file_class}/bin32`
    var bin64_dir = `${window_file_class}/bin64`
    if(!fs.existsSync(window_file_class)){
        fs.mkdirSync(window_file_class);
    }
    if(!fs.existsSync(bin32_dir)){
        fs.mkdirSync(bin32_dir);
    }
    if(!fs.existsSync(bin64_dir)){
        fs.mkdirSync(bin64_dir);
    }
    files = [
        'index.js',
        'package.json',
        'README.md',
        'main.cc',
        'bin32/libuv.dll',
        'bin32/yq_addon.node',
        'bin64/libuv.dll',
        'bin64/yq_addon.node'
    ]


    //复制依赖文件
    for(var i=0;i<files.length;i++){
        var _src = `${yq_addon}/${files[i]}`;
        var _dst = `${window_file_class}/${files[i]}`;
        copy(_src, _dst);
        console.log('copy [' + _src + '] ===> [' + _dst + ']');
    }

}
run();


function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

function execReg(_cmd){
    return new Promise((resolve, reject) => {
            exec(_cmd, function(error, stdout, stderr){

                resolve(stdout);
            })
})
}
/*



 console.log('complete..');

 //删除无用文件
 deleteFolder('./build');
 function deleteFolder(path) {
 var files = [];
 if( fs.existsSync(path) ) {
 files = fs.readdirSync(path);
 files.forEach(function(file,index){
 var curPath = path + "/" + file;

 if(fs.statSync(curPath).isDirectory()) { // recurse
 deleteFolder(curPath);
 } else { // delete file

 if(file == 'yq_addon.node' || file == 'libuv.dll'){
 //fs.unlinkSync(curPath);
 }else{
 console.log(file)
 fs.unlinkSync(curPath);
 }
 }
 });
 console.log(path)

 //fs.rmdirSync(path);
 }
 }
 */


