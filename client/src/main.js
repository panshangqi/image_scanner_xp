const sys = require('./deps/system')
const path = require('path')
const fs = require('fs')
const yq_addon = require('window_file_class')
const { logger } = yq_addon

function main(win, gui) {
    var appdata = gui.App.dataPath
    logger.info(appdata)
    var execPath = path.dirname(process.execPath)
    logger.info(execPath)
    var cwdPath = process.cwd()
    logger.info(cwdPath)


    logger.info('******************************')
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

