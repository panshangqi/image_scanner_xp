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
#include <vector>
#include "UnicodeUtf8.h"
using namespace v8;

////async
//在AddOn中，定义一个结构体在异步调用中传递数据s
namespace DF{

    struct WorkBaton {
        uv_work_t work;              //libuv
        Persistent<Function> callback;    //javascript callback  <heap>
        std::vector<std::string> dirs;
        std::vector<std::string> files;
        int deleteCount;
    };
    //
    void removeFilesAsync(uv_work_t * work){
        WorkBaton * baton = (WorkBaton*)work->data;
        std::vector<std::string> dirs = baton->dirs;
        std::vector<std::string> files = baton->files;
        // block t
        int count = 0;
        for(int i=0;i<dirs.size();i++){

            for(int j=0;j<files.size();j++){
                std::string filepath = dirs[i] + "/" + files[j];
                if(_access(filepath.c_str(),0 ) == -1){
                    continue;
                }
                if(remove(filepath.c_str()) == 0){
                    printf("delete file: %s success.\n", filepath.c_str());
                    count ++;
                }
                else{
                    printf("delete file: %s fail.\n", filepath.c_str());
                }
            }
        }
        // save the result
        baton->deleteCount = count;
        return;
    }

    void removeFilesCompleted(uv_work_t * work, int){
        WorkBaton * baton = (WorkBaton*)work->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);
        // callback, 使用Cast方法来转换s
        std::string result = std::to_string(baton->deleteCount)+" files delete successful";
        const unsigned argc = 1;
        Local<Value> argv[argc] = { String::NewFromUtf8(isolate, result.c_str()) };
        Local<Function> callback = Local<Function>::New(isolate, baton->callback);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argv);
        baton->callback.Reset();
        delete baton;
    }
    //导出方法首先保存回调函数，并验证和解析传入参数s
    // 1st argument is object : {dirs:[], files[]}
    // 2nd argument is the callback function
    void removeFiles(const FunctionCallbackInfo<Value>& args) {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);
        if (args.Length() < 2) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong params of arguments")));
            return ;
        }

        Local<Object> params = Local<Object>::Cast(args[0]);
        //url file params can't exist both
        bool hasdirs = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "dirs"));
        bool hasFile = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "files"));
        //找到key  dir and files
        if(!hasdirs && !hasFile ){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "lack params dirs or files")));
            return ;
        }

        WorkBaton *baton = new WorkBaton();
        baton->work.data = baton;
        Local<Value> dirs = params->Get(String::NewFromUtf8(isolate, "dirs"));
        Local<Value> files = params->Get(String::NewFromUtf8(isolate, "files"));
        if(!dirs->IsArray() || !files->IsArray()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "dirs or files 's value is array")));
            return ;
        }
        Local<Array> dirs_list = Local<Array>::Cast(dirs);
        int _len = dirs_list->Length();
        baton->dirs.clear();
        for(int i=0;i<_len;i++){
            Local<String> dir = dirs_list->Get(i)->ToString();
            String::Utf8Value sDir(dir);
            char *ch_dir = Unicode::StringToUtf8(*sDir);
            printf("%s\n", ch_dir);
            baton->dirs.push_back(ch_dir);
        }

        Local<Array> files_list = Local<Array>::Cast(files);
        _len = files_list->Length();
        baton->files.clear();
        for(int i=0;i<_len;i++){
            Local<String> file = files_list->Get(i)->ToString();
            String::Utf8Value sFile(file);
            //printf("%s\n", *sFile);
            baton->files.push_back(*sFile);
        }

        baton->callback.Reset(isolate, Local<Function>::Cast(args[1]));
        uv_queue_work( uv_default_loop(), &baton->work, removeFilesAsync, removeFilesCompleted);
        return ;
    }

}