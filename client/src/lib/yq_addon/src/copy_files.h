#pragma one
#include <node.h>
#include <v8.h>
#include <uv.h>
#include <io.h>
#include <string.h>
#include <string>
#include <iostream>
#include <thread>
#include <cstdio>
#include <map>
using namespace v8;

////async
//在AddOn中，定义一个结构体在异步调用中传递数据s
namespace CF{
    std::string newGuid()
    {
        char buf[80] = { 0 };
        GUID guid;
        std::string result = "0000000000000000000000000000";
        int hr = CoCreateGuid(&guid);
        if (S_OK == hr)
        {
            sprintf_s(buf, sizeof(buf), "%08x%04x%04x%02x%02x%02x%02x%02x%02x%02x%02x",
                guid.Data1, guid.Data2, guid.Data3,
                guid.Data4[0], guid.Data4[1],
                guid.Data4[2], guid.Data4[3],
                guid.Data4[4], guid.Data4[5],
                guid.Data4[6], guid.Data4[7]);

            result = buf;
        }
        return result;
    }
    std::string getFileSuffixName(std::string path)
    {
    	int pos = path.find_last_of(".");
    	std::string name = path.substr(pos, path.length() - pos);
    	return name;
    }
    __int64 getFileSize(const char *file_path) {

        WIN32_FIND_DATAA data;
        HANDLE h = FindFirstFileA(file_path, &data);
        if (h == INVALID_HANDLE_VALUE)
            return -1;

        FindClose(h);

        return data.nFileSizeLow | (__int64)data.nFileSizeHigh << 32;
    }
    struct FileInfo{
        std::string src_file;
        std::string new_file;
        int filesize = 0;
    };
    struct WorkBaton {
        uv_work_t work;              //libuv
        Persistent<Function> callback;    //javascript callback  <heap>
        Persistent<Function> progress;
        Persistent<Function> cancel;
        std::string src_dir;
        std::string dst_dir;
        std::vector<std::string> files;
        std::vector<FileInfo> fileArr;
        int fileCount;
        double percentage;
        int stop = 0;
        bool rename = false;
        int pid = 0;  //任务序号s
        int tid = 0; //线程序号s
    };
    const int _max = 20;
    uv_async_t async[_max][2];  //最多20个任务,每个任务两个线程s
    int async_map[20];
    int copyed[_max]; //已经复制的个数/进度s
    //
    void workAsync(uv_work_t * work){
        //Isolate * isolate = Isolate::GetCurrent();
        //HandleScope handleScope(isolate);
        WorkBaton * baton = (WorkBaton*)work->data;
        std::string src_dir = baton->src_dir;
        std::string dst_dir = baton->dst_dir;
        std::vector<std::string> files = baton->files;
        std::vector<FileInfo> &fileArr = baton->fileArr;
        fileArr.clear();
        // block t
        int count = 0;
        if(_access(src_dir.c_str(),0 ) == -1 || _access(dst_dir.c_str(),0 ) == -1){
            printf("DIR: [%s] or [%s] not exist\n",src_dir.c_str(), dst_dir.c_str());
            return;
        }
        printf("src dir: %s \ndst dir: %s\n",src_dir.c_str(), dst_dir.c_str());
        int file_count = files.size();
        if(file_count < 1){
            printf("CopyFiles Async Files count = 0\n");
            return;
        }
        bool isRename = baton->rename;
        std::string suffix = getFileSuffixName(files[0]);

        for(int i=0;i<file_count;i++){
            if(baton->stop){
                break;
            }
            std::string srcpath = src_dir + "/" + files[i];
            std::string dstpath = dst_dir + "/" + files[i];
            std::string new_name = files[i];
            if(isRename){
                new_name = newGuid() + suffix;
                dstpath = dst_dir + "/" + new_name;
            }

            if(_access(srcpath.c_str(),0 ) == -1){
                printf("FILE: [%s] not exist\n",srcpath.c_str());
                continue;
            }
            if(CopyFile(srcpath.c_str(), dstpath.c_str(), FALSE)){
                //printf("copy file: %s -> %s success.\n", srcpath.c_str(), dstpath.c_str());
                FileInfo fileInfo;
                fileInfo.src_file = files[i];
                fileInfo.new_file = new_name;
                fileInfo.filesize = getFileSize(dstpath.c_str());
                fileArr.push_back(fileInfo);
            }
            else{
                printf("copy file: %s -> %s fail.\n", srcpath.c_str(), dstpath.c_str());
            }
            copyed[baton->pid] ++;
            if(i%15==0){
                double percentage = (copyed[baton->pid])*1.0/baton->fileCount;
                baton->percentage = percentage;
                uv_async_send(&async[baton->pid][baton->tid]);
            }
        }
        // save the result
        return;
    }
    //进度条s
    void print_progress(uv_async_t *handle) {

        WorkBaton * baton = (WorkBaton*)handle->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);
        // callback, 使用Cast方法来转换s
        const unsigned argc = 1;
        Local<Value> argvs[argc] = { Number::New(isolate, baton->percentage) };
        Local<Function> callback = Local<Function>::New(isolate, baton->progress);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argvs);

    }
    void workCompleted(uv_work_t * work, int){

        WorkBaton * baton = (WorkBaton*)work->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);
        async_map[baton->pid]--;
        uv_close((uv_handle_t*) &async[baton->pid][baton->tid], NULL);
        if(async_map[baton->pid] > 0){
            return;
        }
        //多个线程全部复制完成：s
        std::string result = std::to_string(baton->fileCount)+" files copy successful";
        Local<Array>file_arr = Array::New(isolate, copyed[baton->pid]);
        int k = 0;
        for(int i=0;i<2;i++){
            WorkBaton *wBaton = (WorkBaton*)async[baton->pid][i].data;
            std::vector<FileInfo> fileArr = wBaton->fileArr;
            for(int j=0;j<fileArr.size();j++){

                Local<Object> fileinfo = Object::New(isolate);
                fileinfo->Set(String::NewFromUtf8(isolate,"src_file"), String::NewFromUtf8(isolate, fileArr[j].src_file.c_str()));
                fileinfo->Set(String::NewFromUtf8(isolate,"new_file"), String::NewFromUtf8(isolate, fileArr[j].new_file.c_str()));
                fileinfo->Set(String::NewFromUtf8(isolate,"filesize"), Number::New(isolate, fileArr[j].filesize));
                file_arr->Set(k, fileinfo);
                k++;
            }
        }

        // callback, 使用Cast方法来转换s

        Local<Object> obj = Object::New(isolate);
        obj->Set(String::NewFromUtf8(isolate,"files"), file_arr);
        obj->Set(String::NewFromUtf8(isolate,"result"), String::NewFromUtf8(isolate, result.c_str()));

        const unsigned argc = 1;
        Local<Value> argv[argc] = { obj };
        Local<Function> callback = Local<Function>::New(isolate, baton->callback);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argv);

        //进度s
        //百分百s
        // callback, 使用Cast方法来转换s
        Local<Value> argvs[argc] = { Number::New(isolate, 1) };
        Local<Function> progress = Local<Function>::New(isolate, baton->progress);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        progress->Call(isolate->GetCurrentContext()->Global(), argc, argvs);

        //取消回调，返回true,false
        Local<Boolean> isCancel = Boolean::New(isolate, false);
        if(baton->stop){
            isCancel = Boolean::New(isolate, true);
        }
        Local<Value> argcs[argc] = { isCancel };
        Local<Function> cancel = Local<Function>::New(isolate, baton->cancel);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        cancel->Call(isolate->GetCurrentContext()->Global(), argc, argcs);
        printf("completed\n");

        for(int i=0;i<2;i++){
            WorkBaton *wBaton = (WorkBaton*)async[baton->pid][i].data;
            wBaton->callback.Reset();
            wBaton->progress.Reset();
            delete wBaton;
            wBaton = NULL;
        }
    }
    //停止任务
    void cancelCopyFiles(const FunctionCallbackInfo<Value>& args){
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);
        if (args.Length() < 1) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "cancelCopyFiles: Wrong params of arguments")));
            return ;
        }
        Local<Number> lPid = Local<Number>::Cast(args[0]);
        int pid = lPid->Int32Value();
        for(int i=0;i<2;i++){
            WorkBaton *baton = (WorkBaton*)async[pid][i].data;
            baton->stop = 1;
        }
        printf("cancelCopyFiles pid = %d\n",pid);
    }
    //导出方法首先保存回调函数，并验证和解析传入参数s
    // 1st argument is object : {src_dir:string, dst_dir: string, files[] array}
    // 2nd argument is the callback function
    void copyFiles(const FunctionCallbackInfo<Value>& args) {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);
        if (args.Length() < 3) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "copyFiles: Wrong params of arguments")));
            return ;
        }

        Local<Object> params = Local<Object>::Cast(args[0]);
        //url file params can't exist both
        bool hasSrc = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "src_dir"));
        bool hasDst = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "dst_dir"));
        bool hasFile = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "files"));
        bool hasName = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "rename")); //是否重命名ss
        //找到key  dir and files
        if(!hasSrc && !hasDst && !hasFile && !hasName ){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "lack params dirs or files")));
            return ;
        }

        Local<Value> src_dir = params->Get(String::NewFromUtf8(isolate, "src_dir"));
        Local<Value> dst_dir = params->Get(String::NewFromUtf8(isolate, "dst_dir"));
        Local<Value> files = params->Get(String::NewFromUtf8(isolate, "files"));
        Local<Value> v_rename = params->Get(String::NewFromUtf8(isolate, "rename"));
        if(!src_dir->IsString() || !dst_dir->IsString()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "src_dir or dst_dir 's value must be is string")));
            return ;
        }
        if(!files->IsArray()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "files 's value is must be array")));
            return ;
        }
        if(!v_rename->IsBoolean()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "rename 's value is must be boolean")));
            return ;
        }
        // ---------rename -------
        bool rename = v_rename->BooleanValue();
        // --------dir ------------
        String::Utf8Value srcPath(src_dir);
        String::Utf8Value dstPath(dst_dir);

        Local<Array> files_list = Local<Array>::Cast(files);
        int _len = files_list->Length();
        std::vector<std::string> all_files;
        for(int i=0;i<_len;i++){
            Local<String> file = files_list->Get(i)->ToString();
            String::Utf8Value sFile(file);
            all_files.push_back(*sFile);
        }

        Local<Value> cb = Local<Value>::Cast(args[1]);   //complete
        Local<Value> cb_p = Local<Value>::Cast(args[2]);  //progress
        Local<Value> cb_c = Local<Value>::Cast(args[3]);  //cancel
        if(!cb->IsFunction() || !cb_p->IsFunction() || !cb_c->IsFunction() ){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "the second, third, four params is must be function")));
            return ;
        }
        uv_loop_t *loop = uv_default_loop();
        int _pid = -1;
        if(loop){

            for(int i=0;i<_max;i++){
                if(async_map[i] == 0){
                    _pid = i;
                    async_map[i] = 2; //完成一个减去1s
                    copyed[i] = 0;
                    break;
                }
            }
            if(_pid!=-1){
                printf("work baton pid = %d\n", _pid);
                WorkBaton *baton[2];
                //split files
                std::vector<std::string> _files[2];
                int mid = all_files.size()/2;
                for(int i=0;i<mid;i++){
                    _files[0].push_back(all_files[i]);
                }
                for(int i=mid;i<all_files.size();i++){
                    _files[1].push_back(all_files[i]);
                }
                for(int i=0;i<2;i++){
                    baton[i] = new WorkBaton();
                    baton[i]->src_dir = *srcPath;
                    baton[i]->dst_dir = *dstPath;
                    baton[i]->rename = rename;
                    baton[i]->work.data = baton[i];
                    baton[i]->files = _files[i];
                    baton[i]->tid = i;
                    baton[i]->pid = _pid;
                    baton[i]->callback.Reset(isolate, Local<Function>::Cast(args[1]));
                    baton[i]->progress.Reset(isolate, Local<Function>::Cast(args[2]));
                    baton[i]->cancel.Reset(isolate, Local<Function>::Cast(args[3]));
                    baton[i]->fileCount = all_files.size();
                    async[_pid][i].data = baton[i];
                    uv_async_init( loop, &async[_pid][i], print_progress);
                    uv_queue_work( loop, &baton[i]->work, workAsync, workCompleted);
                }
            }
        }
        args.GetReturnValue().Set(Number::New(isolate, _pid));
        return;
    }

}