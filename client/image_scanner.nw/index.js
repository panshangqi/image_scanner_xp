//var win = nw.Window.get();

console.log('>>>>>>>>>>>>>>>>>>')
nw.Window.open('image_scanner.nw/index.html', {}, function(win) {
    win.width = 1024;
    win.height = 520;
    win.showDevTools()
});