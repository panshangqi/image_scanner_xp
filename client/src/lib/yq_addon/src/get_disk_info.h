// 获取文件夹根目录所有文件

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
#include "UnicodeUtf8.h"
using namespace v8;
#pragma warning(disable：4996)
////async
//在AddOn中，定义一个结构体在异步调用中传递数据s
namespace GDI{

    struct WorkBaton {
        uv_work_t work;              //libuv
        Persistent<Function> callback;    //javascript callback  <heap>
        std::string dir;
        __int64 totalspace;
        __int64 freespace;
        int fileCount;
    };
    //
    void workAsync(uv_work_t * work){
        //Isolate * isolate = Isolate::GetCurrent();
        //HandleScope handleScope(isolate);
        WorkBaton * baton = (WorkBaton*)work->data;
        std::string dir = baton->dir;
        std::vector<std::string> files;
        // block t

        int count = 0;
        if(_access(dir.c_str(),0 ) == -1 ){
            printf("DIR: [%s] not exist\n",dir.c_str());
            return;
        }
        printf("dir: %s\n",dir.c_str());
        //获取磁盘大小

        unsigned _int64 i64FreeBytesToCaller;
        unsigned _int64 i64TotalBytes;
        unsigned _int64 i64FreeBytes;

        bool fRes = GetDiskFreeSpaceExA(dir.c_str(),
             (PULARGE_INTEGER)&i64FreeBytesToCaller,
             (PULARGE_INTEGER)&i64TotalBytes,
             (PULARGE_INTEGER)&i64FreeBytes);

        if (fRes) {
            baton->totalspace = (__int64)i64TotalBytes;
            baton->freespace = (__int64)i64FreeBytes;

        }

        return;
    }

    void workCompleted(uv_work_t * work, int){

        WorkBaton * baton = (WorkBaton*)work->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);

        Local<Object>obj = Object::New(isolate);
        obj->Set(String::NewFromUtf8(isolate,"totalspace"), Number::New(isolate, baton->totalspace));
        obj->Set(String::NewFromUtf8(isolate,"freespace"), Number::New(isolate, baton->freespace));


        const unsigned argc = 1;
        Local<Value> argv[argc] = { obj };
        Local<Function> callback = Local<Function>::New(isolate, baton->callback);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argv);

        baton->callback.Reset();
        delete baton;
    }
    //导出方法首先保存回调函数，并验证和解析传入参数s
    // 1st argument is object : {dir:string} c:\\
    // 2nd argument is the callback function
    void getDiskInfo(const FunctionCallbackInfo<Value>& args) {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);
        if (args.Length() < 2) {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "getRootFiles: Wrong params of arguments")));
            return ;
        }

        Local<Object> params = Local<Object>::Cast(args[0]);
        //url file params can't exist both
        bool hasDir = params->HasRealNamedProperty(String::NewFromUtf8(isolate, "dir"));
        //找到key  dir and files
        if(!hasDir){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "lack params dirs or files")));
            return ;
        }

        WorkBaton *baton = new WorkBaton();
        baton->work.data = baton;
        Local<Value> dir = params->Get(String::NewFromUtf8(isolate, "dir"));
        if(!dir->IsString()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "dir 's value must be is string")));
            return ;
        }


        String::Utf8Value srcPath(dir);
        char *src_path = Unicode::StringToUtf8(*srcPath);
        baton->dir = src_path;

        Local<Value> cb = Local<Value>::Cast(args[1]);
        if(!cb->IsFunction()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "the second is must be function")));
            return ;
        }
        baton->callback.Reset(isolate, Local<Function>::Cast(args[1]));

        uv_queue_work( uv_default_loop(), &baton->work, workAsync, workCompleted);
        return ;
    }

}