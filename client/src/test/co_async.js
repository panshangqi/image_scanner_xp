const co = require('co')
function *lala(){
    yield SStip()
}
function *SStip(){
    yield Stop()
}
function *Stop(){
    yield Sleep(1500)
    console.log('stop')
}
co(function*(){

    for(var i=0;i<10;i++){
        yield Sleep(500)
        console.log(i)
    }
    yield lala()
})

function Sleep(n) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(n)
        }, n)
    })
}