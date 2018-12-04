{
    "targets": [
        {
            "target_name": "yq_addon",
            "sources": [ "./main.cc","./src/UnicodeUtf8.cpp"],
            "include_dirs": [
                    "<(module_root_dir)/win64/include/libvc",
                    "<(module_root_dir)/win64/include",
                    "<(module_root_dir)/src"
                  ],

            "libraries":[
                  "<(module_root_dir)/win64/lib/libuv.lib"
                  ],

            "cflags!": [ "-fno-exceptions" ],
            "cflags": [ "-std=c++11" ],
            "cflags_cc!": [ "-fno-exceptions" ]
        }
    ]
}