console.log('yq_addon: process.arch: ' + process.arch)
var yqAddon = {};

var addon = null;
if(process.arch == 'x64'){
    addon = require('./bin64/yq_addon.node')
}else{
    addon = require('./bin32/yq_addon.node')
}
if(!addon){
    module.exports = yqAddon;
    process.exit(-1)
}
/*
 options: {dirs: ['c:\\','d:\\'], files: ['image.jpg','sfadfadfadfadfasdfasf.jpg']}
 */
yqAddon.removeFiles = function (options, fn) {

    addon.removeFiles(options,function (data) {

        if(typeof fn == 'function'){
            fn(data)
        }
    })
}
/*
 options: {src_dir: 'c:/a' dst_dir: 'd:/b', files: ['image.jpg','sfadfadfadfadfasdfasf.jpg']}
 */
yqAddon.copyFiles = function (options, fn, progress, cancel) {

    return addon.copyFiles(options,function (data) {

        if(typeof fn == 'function'){
            fn(data)
        }
    }, function (p) {
        if(typeof progress == 'function'){
            progress(p)
        }
    }, function (c) {
        if(typeof cancel == 'function'){
            cancel(c)
        }
    })
}
yqAddon.cancelCopyFiles = function(pid){

    addon.cancelCopyFiles(pid);
}
/*
 options: {dir: 'c:/a'}  callback: files[]
 */
yqAddon.getRootFiles = function (options, fn, progress) {

    addon.getRootFiles(options,function (data) {
        if(typeof fn == 'function'){
            fn(data)
        }
    },function (pro) {
        if(typeof progress == 'function'){
            progress(pro)
        }
    })
}

yqAddon.getRootFilesAsync = function (options, progress) {
    return new Promise(function(resolve, reject) {
        addon.getRootFiles(options,function (data) {
            resolve(data)
        },function (pro) {
            if(typeof progress == 'function'){
                progress(pro)
            }
        })
    })
}

/*
 options: {dir: 'c:/a'}  callback: files[]
 */
yqAddon.getDiskInfo = function (options, fn) {

    addon.getDiskInfo(options,function (data) {
        if(typeof fn == 'function'){
            fn(data)
        }
    })
}

yqAddon.getDiskInfoAsync = function (options) {
    return new Promise(function(resolve, reject) {
        addon.getDiskInfo(options,function (data) {
            resolve(data)
        })
    })
}


/*
 options: {dir: 'c:/a'}  callback: files[]
 */
yqAddon.getFolderSize = function (options, fn) {

    addon.getFolderSize(options,function (data) {
        if(typeof fn == 'function'){
            fn(data)
        }
    })
}

yqAddon.getFolderSizeAsync = function (options) {
    return new Promise(function(resolve, reject) {
        addon.getFolderSize(options,function (data) {
            resolve(data)
        })
    })
}


yqAddon.printf = function(params){
    addon.Printf(params);
}

module.exports = yqAddon;