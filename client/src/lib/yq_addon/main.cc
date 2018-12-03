#pragma one
#include <node.h>
#include <v8.h>

#include "./src/delete_files.h"
#include "./src/copy_files.h"
#include "./src/get_root_files.h"
#include "./src/get_disk_info.h"
#include "./src/get_folder_size.h"
#include "./src/get_root_files_test.h"
#include "./src/console_log.h"


// 相当于在 exports 对象中添加 { hello: hello }
void init(Handle<Object> exports) {
  NODE_SET_METHOD(exports, "removeFiles", DF::removeFiles);
  NODE_SET_METHOD(exports, "copyFiles", CF::copyFiles);   // 参数 srcdir(string), dstdir(string), filelist [] (array)
  NODE_SET_METHOD(exports, "cancelCopyFiles", CF::cancelCopyFiles);   // 参数 srcdir(string), dstdir(string), filelist [] (array)

  NODE_SET_METHOD(exports, "getRootFiles", GRF::getRootFiles);   // 参数 dir(string)
  NODE_SET_METHOD(exports, "getRootFilesTest", GRFT::getRootFilesTest);   // 参数 dir(string)
  NODE_SET_METHOD(exports, "getDiskInfo", GDI::getDiskInfo);   // 参数 dir(string)
  NODE_SET_METHOD(exports, "getFolderSize", GFS::getFolderSize);   // 参数 dir(string)

  NODE_SET_METHOD(exports, "Printf", Console::Printf);   // 参数 dir(string)
}

// 将 export 对象暴露出去s
// 原型 `NODE_MODULE(module_name, Initialize)`s
NODE_MODULE(yq_addon, init);
