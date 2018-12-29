
var sys = {};
sys.create = function (win, gui, close_fn) {
    // 创建托盘图标

    win.on('close',function () {
        this.hide(); // Pretend to be closed already
        if(typeof close_fn == 'function'){

            win.closeDevTools()
            close_fn()
        }
        console.log('close application')
        this.close(true) // then close it forcely
    })
    var tray = new gui.Tray({ title: 'Tray', icon: 'res/logo.png' });
    // 创建托盘菜单
    var menu = new gui.Menu();
    menu.append(new gui.MenuItem({
        label: '退出',
        click: function () {
            gui.App.closeAllWindows()
        }
    }));
    menu.append(new gui.MenuItem({
        label: '显示主界面',
        click: function () {
            win.show()
        }
    }));
    tray.menu = menu;

}
module.exports = sys;