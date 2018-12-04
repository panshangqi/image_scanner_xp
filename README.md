
 工程构建
 1.前端web：
 cd web:  npm install 安装依赖
 npm run dev 运行react
 npm run build 打包 react

 2.客户端：
 cd client

  npm start: 运行客户端debug模式
  npm run build： 打包客户端 到根目录的build 下面

 再 build版本执行命令行可以再控制台打印debug日志：  image_scanner.exe --enable-logging=stderr

4. 如果npm run build 无法下载包： nw-builder\cache\0.14.7-sdk\win32 把原exe复制到该文件夹下即可

//项目目录结构
image_scanner_xp  -->  client --> src --> package.json  // package包信息
           |                         |
           |                         |--> index.html / index.js  //指定程序的起始页面
           |                         |
           |                         |--> main.js //指定一个node.js文件，当程序启动时，该文件会被运行，
           |                                      //启动时间要早于node-webkit加载html的时间
           |                                       //它在node上下文中运行，可以用它来实现类似后台线程的功能。
           |
           |--> web //前端页面