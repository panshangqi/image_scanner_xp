
1. 编译32 和 64 bit  node

2. 32:  node-gyp rebuild --arch=ia32 --target=2.0.2
        node build.js 32

    64:  node-gyp rebuild --arch=x64 --target=2.0.2
            node build.js 64

//client 和 web 使用 库 window_file_class 组件
npm login：登陆发布


npm install --save-dev window_file_class

//npm publish