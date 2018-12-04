
const yqAddon = require('./index.js')

var _files = [
    "0bdb975602db429192f925669d0a0f0d_0.jpg",
    "0bdb975602db429192f925669d0a0f0d_1.jpg",
    "0bea83ed14db4739a17f4c1d8d213558_0.jpg",
    "0c4ff290f0834193ae9f4ef6d92e002b_0.jpg",
    "0c4ff290f0834193ae9f4ef6d92e002b_1.jpg",
    "0c517d7bcdc6470ea5750a10a1664e0e_0.jpg",
    "0cf13d3553d44e02be340de9e5ed1172_0.jpg",
    "0cf13d3553d44e02be340de9e5ed1172_1.jpg",
    "0d1076af9d4647f1b5eb67bd3fa0b848_0.jpg",
    "0d1076af9d4647f1b5eb67bd3fa0b848_1.jpg",
    "0d4bd1d746b24d8db39534f5da3ac931_0.jpg",
    "0dcf2b346014479bbb0c6d4a04b3e89a_0.jpg",
    "0e38bf9c855443a59bd702d0ed99929c_0.jpg",
    "0e38bf9c855443a59bd702d0ed99929c_1.jpg",
    "0e5de7e52c804c38b4827a5b19d1830d_0.jpg",
    "0e5de7e52c804c38b4827a5b19d1830d_1.jpg",
    "0e61a92bf46e410b81528f285a9dc47d_0.jpg",
    "0e6aa37aa8a8443197b4f93f94d7174c_0.jpg",
    "0e8211d4d847430d8dc46f46445fb21f_0.jpg",
    "0e8211d4d847430d8dc46f46445fb21f_1.jpg",
    "0e873162977848d787baa2ffc2eb07c5_0.jpg",
    "0f2c8acf08fc4faba80ddbdcb2adf7cc_0.jpg",
    "0f2c8acf08fc4faba80ddbdcb2adf7cc_1.jpg",
    "0f7e1513c6484d079d130480c205cfa9_0.jpg"
]
var st = new Date().getTime();
async function  run() {

        // yqAddon.removeFiles({dirs: ['G:/17_addon_test_data/test_delete_file','G:/17_addon_test_data/test_delete_file/temp'], files: _files},function (data) {
        //
        //     var se = new Date().getTime();
        //     console.log(`time: ${se-st}`)
        //     console.log(data)
        // })
        //
        // var result = yqAddon.copyFiles({src_dir: 'G:/17_addon_test_data/test_copy_src', dst_dir: 'G:\\17_addon_test_data/test_copy_dst', files: _files, rename: true},function (data) {
        //
        //     var se = new Date().getTime();
        //     console.log(`times: ${se-st}`)
        //     console.log(data)
        // },function (progress) {
        //     console.log('>>>' + progress)
        // })

        // console.log('>>>>>>>>>>>')
        // console.log(result)
    //yqAddon.cancelCopyFiles(result)


    var res=await yqAddon.getRootFilesAsync({dir: 'E:/17_addon_test_data/test_copy_src/文件图片'},function(data){
        console.log(data)
    })
    console.log(res)

    // console.log(res)
    // var res = await yqAddon.getDiskInfoAsync({dir: 'E:\\17_addon_test_data/test_copy_src'})
    // console.log(res)
    //
    // var res = await yqAddon.getFolderSizeAsync({dir: 'G:\\17_addon_test_data/test_copy_src'})
    // console.log(res)
}
run();
async function memory_test(){
    for(var i=0;i<1000;i++){

        run();
        await Sleep(1000)
    }
}
//memory_test()

function Sleep(time){
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(time)
        }, time)
    })
}
