chrome.developerPrivate.openDevTools({
    renderViewId: -1,
    renderProcessId: -1,
    extensionId: chrome.runtime.id
});

const path = require('path')
const fs = require('fs')
//const yq_addon = require('window_file_class')
const gui = require('nw.gui')
const co = require('co')
const websocket = require('nodejs-websocket')
const systems = require('./lib/system')
const { yq, yq_event} = require('./yq')
const yq_config = require('./yq_config')
const local_service = require('./service')
var m_homework_data = null
const homeworkDataHelper = require('./db/homework_data_helper')


console.log(`node version: ${process.version}`)
global.appdata = yq.storge.appdata
console.log(`appdata: ${appdata}`)
global.chrome.ppp = 'xxx'

console.log(chrome)
process.on('uncaughtException', (err) => {
    console.error(err.stack)
});
console.log(nw.Window.window)


//本地服务
//var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')
var router = express();
// 添加 body-parser 中间件就可以了
router.use(express.static(yq.storge.default_pic))  //设置静态文件路径
router.use(express.static(yq.storge.default_temp_pic));
router.use(express.static(yq.storge.default_re_pic));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/", function (req, res) {
    console.log(req.query)
    res.send("Hello Node-WebKit Server")
})
router.get('/local_config', function (req, res) {
    console.log(req.query)
    //var result = local_service
    res.send({})
})
var server = router.listen(yq_config.local_port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("the local server http://%s:%s", host, port)
})

//websockt 服务
var ws_server = websocket.createServer(function (conn) {
    console.log("New connection")
    conn.on("text", function (str) {
        console.log("Received "+str)
        conn.sendText(str.toUpperCase()+"!!!")
        onMessageFromRender(str)
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })

}).listen(yq_config.local_socket_port)
function onMessageFromRender(){

}
function sendMessageToRender(msg){
    ws_server.connections.forEach(function (conn) {
        conn.sendText(msg)
    })
}
setTimeout(function () {
    sendMessageToRender('xxxxxxxxxx123')
},5000)


// try{
//     notificationWin =  nw.Window.get('./index.html');
//     notificationWin.close();
// }catch(e){
//     console.log(e);
// }
nw.Window.open('http://127.0.0.1:10032/templates/index.html',{
    new_instance: false,
    focus: true,
    width: 1300,
    height: 700,
    show: false
}, function (win) {
    win.show()
    win.showDevTools()
    systems.create(win, gui)
    co(main())

})

function *main() {

    var appdata = gui.App.dataPath
    console.log(appdata)
    var execPath = path.dirname(process.execPath)
    console.log(execPath)
    var cwdPath = process.cwd()
    console.log(cwdPath)
    m_homework_data = new homeworkDataHelper(appdata,'homework_data_db')
    yield m_homework_data.setup()

}

function win_event(win){

}

function Sleep(nn) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('xx')
        },nn)
    })
}
