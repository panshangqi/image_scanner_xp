
var sys = {};
sys.tray={
    create: function (_win, _gui) {
        // 创建托盘图标
        var tray = new _gui.Tray({ title: 'Tray', icon: 'res/logo.png' });
        // 创建托盘菜单
        var menu = new _gui.Menu();
        menu.append(new _gui.MenuItem({
            label: '退出',
            click: function () {
                _win.close()
            }
        }));
        menu.append(new _gui.MenuItem({ type: 'checkbox', label: 'box1' }));
        menu.append(new _gui.MenuItem({ type: 'checkbox', label: 'box1' }));
        tray.menu = menu;
    }
}
module.exports = sys;