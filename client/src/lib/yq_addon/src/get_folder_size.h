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
using namespace v8;
#pragma warning(disable：4996)
////async
//在AddOn中，定义一个结构体在异步调用中传递数据s
namespace GFS{

    struct WorkBaton {
        uv_work_t work;              //libuv
        Persistent<Function> callback;    //javascript callback  <heap>
        std::string dir;
        __int64 size;
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
    //
    void dfs_dir(const char *dir, __int64 &_size)
    {
    	char dirNew[100];

    	// 向目录加通配符，用于搜索第一个文件s
    	strcpy(dirNew, dir);
    	strcat(dirNew, "\\*.*");

    	WIN32_FIND_DATAA findData;
    	HANDLE hFind;
    	hFind = FindFirstFileA(dirNew, &findData);
    	if (hFind == INVALID_HANDLE_VALUE) {
    		return;
    	}
    	do {

    		// 忽略"."和".."两个结果s
    		if (strcmp(findData.cFileName, ".") == 0 || strcmp(findData.cFileName, "..") == 0)
    			continue;
    		if (findData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)    // 是否是目录s
    		{
    			//printf("%s\n", findData.cFileName);
    			char folder[280];
    			sprintf(folder, "%s\\%s", dir, findData.cFileName);
    			dfs_dir(folder, _size);
    		}
    		else
    		{
    			char file[280];
    			sprintf(file, "%s\\%s", dir, findData.cFileName);
    			_size += get_file_size(file);
    		}
    	} while (FindNextFileA(hFind, &findData));
    	FindClose(hFind);
    }


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
        //遍历文件夹s
        __int64 _size = 0;
        dfs_dir(dir.c_str(), _size);
        baton->size = _size;

        return;
    }

    void workCompleted(uv_work_t * work, int){

        WorkBaton * baton = (WorkBaton*)work->data;
        Isolate * isolate = Isolate::GetCurrent();
        HandleScope handleScope(isolate);


        Local<Object>result = Object::New(isolate);
        result->Set(String::NewFromUtf8(isolate, "size"), Number::New(isolate, baton->size));

        const unsigned argc = 1;
        Local<Value> argv[argc] = { result };
        Local<Function> callback = Local<Function>::New(isolate, baton->callback);
        // 调用回调, 参数: 当前上下文，参数个数，参数列表s
        callback->Call(isolate->GetCurrentContext()->Global(), argc, argv);

        baton->callback.Reset();
        delete baton;
    }
    //导出方法首先保存回调函数，并验证和解析传入参数s
    // 1st argument is object : {dir:string}
    // 2nd argument is the callback function
    void getFolderSize(const FunctionCallbackInfo<Value>& args) {
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
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "src_dir or dst_dir 's value must be is string")));
            return ;
        }


        String::Utf8Value srcPath(dir);
        baton->dir = *srcPath;

        Local<Value> cb = Local<Value>::Cast(args[1]);
        if(!cb->IsFunction()){
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "the second and third params is must be function")));
            return ;
        }
        baton->callback.Reset(isolate, Local<Function>::Cast(args[1]));

        uv_queue_work( uv_default_loop(), &baton->work, workAsync, workCompleted);
        return ;
    }

}