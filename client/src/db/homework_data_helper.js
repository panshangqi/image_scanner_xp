const Sequelize = require('sequelize')

function createDB(db_name, path, uname = undefined, pwd = undefined) {
    return new Sequelize(db_name, uname, pwd, {
        dialect: 'sqlite',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        storage: path  // SQLite only
    });
}

class HomeworkData {
    constructor(db) {
        let table_name = 'homework_data'
        this.model = db.define(table_name, {
            id: {
                type: Sequelize.STRING(45),
                allowNull: false,
                primaryKey: true,
            },
            image_property: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        }, {
            table_name,
            timestamps: false,
        })
    }
    *setup() {
        yield this.model.sync()
    }

    *insert(data){
        var _id = data._id
        var base_data = JSON.stringify(data)
        yield this.model.create({id: _id, image_property: base_data})
    }
    *queryAll() {
        let datas = yield this.model.findAll()
        let rets = []
        for (let data of datas) {
            rets.push(JSON.parse(data.image_property))
        }
        return rets
    }
    *removeById(_id) {
        yield this.model.destroy({ where: { id: _id } })
    }
    *removeAll() {
        yield this.model.destroy({ where: {} })
    }
    *updateById(_id, data){
        yield this.model.update({image_property: JSON.stringify(data)}, {where: { id: _id }, limit: 1})
    }

}
function *haha(){

}
class HomeworkDataHelper{
    constructor(dir, db_name){
        var db_path = `${dir}/${db_name}_sqlite_image.db`
        console.log(db_path);
        let db = createDB('homework_data_sqlite', db_path)
        this.data_table = new HomeworkData(db)
        this.data_map = {}
    }
    *setup(){
        console.log('sqlite setup')

        yield this.data_table.setup()
        let _datas = yield this.data_table.queryAll()
        console.log(_datas);
        for (let data of _datas) {
            this.data_map[data._id] = data
        }
    }

    insert(data){
        if(data && data._id){
            this.data_map[data._id] = data;
            this.data_table.insert(data);
        }
    }
    queryAll(){
        return this.data_map;
    }
    deleteAll(){
        this.data_map = {}
        this.data_table.removeAll();
    }
    values(){
        return Object.values(this.data_map);
    }
    get_images_list(){
        var images = this.values();
        var result = [];
        var uploaded = 0;
        for(var img of images){

            if(img.uploaded != 'false'){
                uploaded ++;
            }
            result.push({
                filename: img.filename,
                filename_bak: img.filename_bak,
                image_guid: img.image_guid,
                uploaded: img.uploaded
            })
        }
        return {
            images_list: result,
            uploaded: uploaded
        };
    }
    sign_image_uploaded(_id){
        var data = this.data_map[_id]
        if(data){
            data.uploaded = 'true'
            //console.log(data)
            this.data_table.updateById(_id, data);
        }
    }
    delete_picture_by_id(_id, default_pic_path){
        var data = this.data_map[_id]
        if(data){
            var dirs = [default_pic_path];
            var files = [data.filename, data.filename_bak]

            yq_addon.removeFiles({dirs, files}, function (data) {
                console.log(data);
            })

        }
    }
    unsign_image_uploaded(_id){
        var data = this.data_map[_id]
        if(data){
            data.uploaded = 'false'
            console.log(data)
            this.data_table.updateById(_id, data);
        }
    }
    get_not_upload_images(){

        var list = this.values();
        var result = [];

        for(var data of list){
            if(data && data.uploaded === 'false'){
                result.push({
                    filename: data.filename,
                    filesize: data.filesize,
                    image_guid: data.image_guid,
                    batch_id: data.batch_id,
                    _id: data._id,
                    order: data.order
                })
                result.push({
                    filename: data.filename_bak,
                    filesize: data.filesize_bak,
                    image_guid: data.image_guid,
                    batch_id: data.batch_id,
                    _id: data._id,
                    order: data.order
                })
                return result;
            }
        }
        return result;

    }
    get_scan_speed_info(format){  //format default 秒 /张  ' s/z'    'z/m'  //一分钟多少张

        var list = this.values();
        if(list.length<10){  //连续十张以上计算扫描速度，否则不准确
            return null
        }
        list.sort(function(a,b){
            return a.timestamp - b.timestamp;
        })
        var _all_time = 0;
        var _all_count = 0;
        //console.log(list);
        for(var i=1;i<list.length;i++){
            var _time = parseInt(list[i].timestamp) - parseInt(list[i-1].timestamp)
            if(_time < 4000){
                _all_time += _time;
                _all_count ++;
            }
        }
        _all_time = _all_time / 1000.0;  //ms -> s
        //console.log('all_time: ' + _all_time)
        //console.log('card count: ' + _all_count);
        var _speed = 0
        if(format == 'z/m'){
            _speed = parseInt((_all_count * 60) / _all_time);
        }else{
            _speed = _all_time / _all_count
        }

        var _params = {
            all_time: _all_time,
            all_scan_num: _all_count,
            scan_speed: _speed
        }
        console.log(_params)
        return _params

    }
}
module.exports = HomeworkDataHelper

