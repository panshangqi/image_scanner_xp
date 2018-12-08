console.log('clean build')
var fs = require('fs')
var path = require('path')
const {exec} = require('child_process')
var xml2js = require('xml2js');

//script : node build.js x64  or node build.js.js ia32
if(process.argv.length < 3){
    console.log('arch params is need')
    process.exit(-1)
}
var _arch = process.argv[2];  //x64  ia32
console.log(_arch, typeof _arch)
if(!(_arch == 'x64' || _arch == 'ia32')){
    console.log('arch params is must be x64 or ia32')
    process.exit(-1)
}

var project_root = path.resolve(__dirname,'../');    // image_scanner_xp/client
console.log(project_root);
var src_dir = path.join(project_root, 'src')  //源码文件夹
var build_dir = path.join(project_root, 'build')
var package_dir = path.join(project_root, 'build/win-xp-ia32-unpacked')  //打包文件夹32bit
if(_arch == 'x64'){
    package_dir = path.join(project_root, 'build/win-xp-x64-unpacked')  //打包文件夹64bit
}
if(fs.existsSync(package_dir)){
    deleteFolder(package_dir,function (p) {
        console.log('delete' + p)
    })
}
if(!fs.existsSync(build_dir)){
    fs.mkdirSync(build_dir);
}
if(!fs.existsSync(package_dir)){
    fs.mkdirSync(package_dir);
}
console.log('clean complete')
async function main() {
    await package_win()
    await manifest()
}
main();
// 构建打包：创建build/win-xp-ia32文件夹
function package_win(){
    var src_dir = path.join(project_root, 'src')  // image_scanner_xp/client/src
    console.log('======================================================')
    console.log('copy' + src_dir + '==>' + package_dir)
    //复制源文件
    copyDir(src_dir, package_dir, function (a,b) {
        console.log('copy to ' + b)
    });
    //复制nwjs sdk
    var src_path = path.join(project_root, 'nwjs-sdk-v0.14.7-win-ia32')
    if(_arch == 'x64'){
        src_path = path.join(project_root, 'nwjs-sdk-v0.14.7-win-x64')  //打包文件夹64bit
    }
    console.log('======================================================')
    console.log('copy' + src_path + '==>' + package_dir)
    copyDir(src_path, package_dir, function (a,b) {
        console.log('copy to ' + b)
    });

    //复制识别，扫描等辅助文件
    console.log('build successful')
}

//修改二进制文件执行权限
async function manifest(){

    var old_exe_path = path.join(package_dir, 'nw.exe')
    var exe_path = path.join(package_dir, 'image_scanner.exe')
    fs.renameSync(old_exe_path, exe_path)
    var xml_path = path.join(package_dir, 'manifest.xml')
    var _cmd = `mt -inputresource:"${exe_path}" -out:"${xml_path}"`
    var hr = await execReg(_cmd);
    console.log(hr);
    hr = await updateXml(xml_path);
    console.log(hr);
    var check = await execReg(`mt -manifest "${xml_path}" -outputresource:"${exe_path}"`);
    console.log(check);
}


// delete 文件夹
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
//复制文件
function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
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

function execReg(_cmd){
    return new Promise((resolve, reject) => {
        exec(_cmd, function(error, stdout, stderr){
            var _params = {
                'error': error,
                'stdout': stdout,
                'stderr': stderr
            }
            resolve(_params);
        })
    })
}
function updateXml(_path_xml){
    return new Promise((resolve, reject) => {
        var parser = new xml2js.Parser();
        var builder = new xml2js.Builder();
        var path_xml = _path_xml
        console.log(path_xml);
        fs.readFile(path_xml, function(err, data) {
            console.log(err);
            parser.parseString(data, function (err, result) {
                console.log(err);
                //console.log(result.assembly.trustInfo[0].security[0].requestedPrivileges[0].requestedExecutionLevel[0].$.level);
                if(result.assembly.trustInfo[0].security[0].requestedPrivileges[0].requestedExecutionLevel[0].$.level){
                    result.assembly.trustInfo[0].security[0].requestedPrivileges[0].requestedExecutionLevel[0].$.level = 'requireAdministrator';
                }
                //console.log(JSON.stringify(result));
                var xml = builder.buildObject(result);
                fs.writeFileSync(path_xml, xml);
                resolve(xml);
            });
        });
    })
}









