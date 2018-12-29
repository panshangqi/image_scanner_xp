const sys = require('./deps/system')
const path = require('path')
const fs = require('fs')
//const yq_addon = require('window_file_class')
var dd = require('asyncawait');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

console.log('node version: ', process.version)
//const { logger } = yq_addon
chrome.developerPrivate.openDevTools({
    renderViewId: -1,
    renderProcessId: -1,
    extensionId: chrome.runtime.id
});
console.log(chrome)
process.on('uncaughtException', (err) => {
    console.error(err)
});
var main = async (function(win, gui) {
    var appdata = gui.App.dataPath
    console.log(appdata)
    var execPath = path.dirname(process.execPath)
    console.log(execPath)
    var cwdPath = process.cwd()
    console.log(cwdPath)

    console.log('xxxxxxxxxxxx')

    console.log('******************************')
    console.log(process.version)
    await (Sleep(5000))
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>')
})
var gui = window.require('nw.gui');  // Load native UI library.
//var url = 'http://127.0.0.1:10032/templates/index.html'
var url = 'http://www.baidu.com'

nw.Window.open(url, {
    width: 1300,
    height: 720
}, function(win) {
    win.showDevTools()

    main(win, gui)
    sys.tray.create(win, gui, function () {
        //close event
        console.log('close window, quit application')
    })

});
/*
exports.init = function() {
    var gui = window.require('nw.gui');  // Load native UI library.
    //var url = 'http://127.0.0.1:10032/templates/index.html'
    var url = 'http://www.baidu.com'

    var win = nw.Window.open(url, {
        width: 1300,
        height: 720
    }, function(win) {
        win.showDevTools()

        main(win, gui)
        sys.tray.create(win, gui)
    });

};
*/


function Sleep(nn) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('xx')
        },nn)
    })
}