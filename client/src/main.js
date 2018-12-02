const sys = require('./deps/system')
const path = require('path')
const fs = require('fs')


function main(win, gui) {
    var appdata = gui.App.dataPath
    console.log(appdata)
    var execPath = path.dirname(process.execPath)
    console.log(execPath)
    var cwdPath = process.cwd()
    console.log(cwdPath)
}

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

