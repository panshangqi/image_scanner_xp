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
namespace Console{

    void Printf(const FunctionCallbackInfo<Value>& args) {
            Isolate *isolate = args.GetIsolate();
            Local<Context> context = isolate->GetCurrentContext();
            HandleScope scope(isolate);

            Local<Value> params = Local<Value>::Cast(args[0]);
            if(params->IsString()){
                String::Utf8Value str(params);
                //char *ch = Unicode::StringToUtf8(*str);
                printf("Log: %s\n", *str);

            }else if(params->IsBoolean()){
                bool boole = params->BooleanValue();
                if(boole){
                    printf("Log: true\n");
                }else{
                    printf("Log: false\n");
                }

            }else if(params->IsNumber()){   //double
                double number = params->NumberValue();
                printf("Log: %lf\n", number);
            }else{
                isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "the params must be string, bool, number")));
                return ;
            }
            return ;
        }


}