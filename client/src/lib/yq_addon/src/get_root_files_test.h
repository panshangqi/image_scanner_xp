// 获取文件夹根目录所有文件

#pragma one
#include <node.h>
#include <v8.h>
#include <uv.h>
#include <io.h>
#include <string.h>
#include <string>
#include <iostream>
#include <Shlwapi.h>
#include <thread>
#include <cstdio>
#include <map>
using namespace v8;
#pragma warning(disable：4996)
////async
//在AddOn中，定义一个结构体在异步调用中传递数据s
namespace GRFT{
    const int _max = 20;
    uv_async_t async[_max];            //TODO uv_work_t uv_async_t的顺序很重要s
    int async_map[_max];
    struct WorkBaton {
        uv_work_t work;              //libuv
        Persistent<Function> callback;    //javascript callback  <heap>
        Persistent<Function> progress;
        std::string dir;
        std::vector<std::string> files;
        int fileCount;
        int pid = 0;
        __int64 size = 0;
    };
    long long get_file_size(const char *file_path) {
        FILE *file = fopen(file_path, "rb");
        if (file) {
            int size = filelength(fileno(file));
            fclose(file);
            return size;
        }
        return 0;
    }
    __int64 GetFileSize(const char *file_path) {

        WIN32_FIND_DATAA data;
        HANDLE h = FindFirstFileA(file_path, &data);
        if (h == INVALID_HANDLE_VALUE)
            return -1;

        FindClose(h);

        return data.nFileSizeLow | (__int64)data.nFileSizeHigh << 32;
    }

    //
    void workAsync(uv_work_t * work){
        //Isolate * isolate = Isolate::GetCurrent();
        //HandleScope handleScope(isolate);
        WorkBaton * baton = (WorkBaton*)work->data;
        std::string dir = baton->dir;
        std::vector<std::string> files;
        // block t
        int count = 0; //12M
        if(_access(dir.c_str(),0 ) == -1 ){
            printf("DIR: [%s] not exist\n",dir.c_str());
            return;
        }
        printf("dir: %s\n",dir.c_str());
        //遍历文件夹s
        char dirNew[280];
        // 向目录加通配符，用于搜索第一个文件s
        strcpy(dirNew, dir.c_str());
        strcat(dirNew, "\\*.*");
        __int64 all_size = 0;
        WIN32_FIND_DATAA findData;
        HANDLE hFind;
        hFind = FindFirstFileA(dirNew, &findData);
        if (hFind == INVALID_HANDLE_VALUE) {
            printf("WIN32_FIND_DATAA INVALID_HANDLE_VALUE\n");
            return;
        }
        do {

            // 忽略"."和".."两个结果s
            if (strcmp(findData.cFileName, ".") == 0 || strcmp(findData.cFileName, "..") == 0)
                continue;
            if (findData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)    // 是否是目录s
            {
                continue;
            }
            else
            {
                char fileName[280];
                sprintf_s(fileName, "%s", findData.cFileName);
                files.push_back(fileName);

                char filePath[280];
                sprintf_s(filePath,"%s/%s", dir.c_str(), findData.cFileName);
                //printf("%s\n",filePath);
                all_size += (findData.nFileSizeLow | (__int64)findData.nFileSizeHigh << 32);//GetFileSize(filePath);

                if(count % 100 == 0){
                    baton->size = all_size;
                    uv_async_send(&async[baton->pid]);
                    count = 0;
                }
                count ++;
            }
        } while (FindNextFileA(hFind, &findData));
        FindClose(hFind);

        baton->files = files;
        baton->fileCount = files.size();
        //baton->size = all_size;
        return;
    }
    //进度条s
    void print_progress(uv_async_t *handle) {

        WorkBaton * baton = (WorkBaton*)handle->data;
        if(!baton) return;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);
        // callback, 使用Cast方法来转换s
        const unsigned argc = 1;
        Local<Value> argvs[argc] = { Number::New(isolate, baton->size) };
        Local<Function> callback = Local<Function>::New(isolate, baton->progress);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argvs);
    }
    void workCompleted(uv_work_t * work, int){

        WorkBaton * baton = (WorkBaton*)work->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);

        std::vector<std::string> _files = baton->files;

        Local<Object> obj = Object::New(isolate);
        Local<Array>result = Array::New(isolate,_files.size());
        for(int i=0;i<_files.size();i++){
            result->Set(i, String::NewFromUtf8(isolate, _files[i].c_str()));
        }

        obj->Set(String::NewFromUtf8(isolate, "files"), result);
        obj->Set(String::NewFromUtf8(isolate, "total_size"), Number::New(isolate, baton->size));
        const unsigned argc = 1;
        Local<Value> argv[argc] = { obj };
        Local<Function> callback = Local<Function>::New(isolate, baton->callback);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argv);

        Local<Value> argcs[argc] = { Number::New(isolate, baton->size) };
        Local<Function> progress = Local<Function>::New(isolate, baton->progress);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        progress->Call(isolate->GetCurrentContext()->Global(), argc, argcs);

        uv_close((uv_handle_t*) &async[baton->pid], NULL); //如果async没有关闭，消息队列是会阻塞的s
        printf("completed\n");
        baton->callback.Reset();
        baton->progress.Reset();
        async_map[baton->pid] = 0;
        delete baton;
        baton = NULL;
        return;
    }
    //导出方法首先保存回调函数，并验证和解析传入参数s
    // 1st argument is object : {dir:string}
    // 2nd argument is the callback function
    // 3td argument is the callback function
    void getRootFilesTest(const FunctionCallbackInfo<Value>& args) {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Object> params = Local<Object>::Cast(args[0]);
        //url file params can't exist both
        bool hasDir = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "dir"));
        //找到key  dir and files
        if(!hasDir){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "lack params dir")));
            return ;
        }

        WorkBaton *baton = new WorkBaton();

        Local<Value> dir = params->Get(String::NewFromUtf8(isolate, "dir"));
        if(!dir->IsString()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "src 's value must be is string")));
            return ;
        }


        String::Utf8Value srcPath(dir);
        baton->dir = *srcPath;

        Local<Value> cb = Local<Value>::Cast(args[1]);
        Local<Value> cb_p = Local<Value>::Cast(args[2]);
        if(!cb->IsFunction() || !cb_p->IsFunction()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "the second and third params is must be function")));
            return ;
        }
        baton->callback.Reset(isolate, Local<Function>::Cast(args[1]));
        baton->progress.Reset(isolate, Local<Function>::Cast(args[2]));
        uv_loop_t *loop = uv_default_loop();
        if(loop){

            int _pid = -1;
            for(int i=0;i<_max;i++){
                if(async_map[i] == 0){
                    _pid = i;
                    async_map[i] = 1;
                    break;
                }
            }
            if(_pid!=-1){
                async[_pid].data = baton;
                baton->work.data = baton;
                baton->pid = _pid;
                uv_async_init( loop, &async[_pid], print_progress);
                uv_queue_work( loop, &baton->work, workAsync, workCompleted);
            }

        }

        return ;
    }

}