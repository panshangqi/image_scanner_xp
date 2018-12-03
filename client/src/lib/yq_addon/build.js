console.log('start copy')

var fs = require('fs')
var path = require('path')
var { exec } = require('child_process')
var client_root = path.resolve(__dirname,'./');
console.log(client_root);

console.log(process.argv)
if(process.argv.length < 3){
    console.log('lack params')
    process.exit(-1);
}
var _arch = process.argv[2];
console.log(_arch);
if(_arch != '32' && _arch != '64'){
    console.log('third params must both 32 or 64')
    process.exit(-1);
}
async function run() {

    console.log(client_root)
    files = [
        {
            src: path.join(client_root,'build/Release/yq_addon.node'),
            dst: path.join(client_root,`bin${_arch}/yq_addon.node`)
        },
        {
            src: path.join(client_root,`win${_arch}/bin/libuv.dll`),
            dst: path.join(client_root,`bin${_arch}/libuv.dll`)
        }
    ]

    //复制依赖文件
    for(var i=0;i<files.length;i++){
        var _src = files[i].src;
        var _dst = files[i].dst;
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


