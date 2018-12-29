import yq from '@components/yq';
var sys_mem = yq.util.get_ini('system_memory')
if(sys_mem){
    sys_mem = parseFloat(sys_mem)
}
var _limit_max = 300;
if(sys_mem > 5){
    _limit_max = 600;
}
var global = {
    scan_number: 0,
    limit_number: _limit_max
}




export default global;