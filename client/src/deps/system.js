
var sys = {};
sys.tray={
    create: function (_win, _gui, close_fn) {
        // 创建托盘图标

        _win.on('close',function () {
            this.hide(); // Pretend to be closed already
            if(typeof close_fn == 'function'){
                close_fn()
            }
            this.close(true) // then close it forcely
        })
        var tray = new _gui.Tray({ title: 'Tray', icon: 'res/logo.png' });
        // 创建托盘菜单
        var menu = new _gui.Menu();
        menu.append(new _gui.MenuItem({
            label: '退出',
            click: function () {
                _gui.App.closeAllWindows()
            }
        }));
        menu.append(new _gui.MenuItem({
            label: '显示主界面',
            click: function () {
                _win.show()
            }
        }));
        tray.menu = menu;
    }
}
module.exports = sys;