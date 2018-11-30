const { exec } = require('child_process')

//var cmdLine = "../nwjs-sdk-v0.14.7-win-ia32/nw.exe image_scanner.nw --enable-logging=stderr -v=0"
var cmdLine = "../nwjs-sdk-v0.14.7-win-ia32/nw.exe"
async function  run() {
    var hr = await execReg(cmdLine)
    console.log(hr)
}
run()

function execReg(cmdLine) {
    return new Promise((resolve, reject) => {
        console.log(cmdLine)
        exec(cmdLine, {}, function (err, data) {
            resolve(data);
        });
    })
}