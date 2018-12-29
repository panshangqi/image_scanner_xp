
//
// function main(){
//
// }
exports.init = function() {
    chrome.developerPrivate.openDevTools({
        renderViewId: -1,
        renderProcessId: -1,
        extensionId: chrome.runtime.id
    });
    var gui = window.require('nw.gui');  // Load native UI library.
    var win = nw.Window.get()
    console.log(win)
    // var url = 'http://127.0.0.1:10032/templates/index.html'
    // var win = nw.Window.open(url, {
    //     width: 1300,
    //     height: 720
    // }, function(win) {
    //     win.showDevTools()
    //     main()
    // });

};
