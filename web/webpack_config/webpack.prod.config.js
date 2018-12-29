const Webpack = require('webpack');
const WebpackBaseConfig = require('./webpack.base.config');
const InsertHtmlPlugin = require('./plugin/instert-html-plugin.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const shell = require('shelljs');

const vars = require('./variables');
const insert_htmls = vars.prod_insert_htmls || [];

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

shell.rm('-rf', WebpackBaseConfig.output.path);
shell.mkdir('-p', WebpackBaseConfig.output.path);

WebpackBaseConfig.mode = 'production';
WebpackBaseConfig.output.filename = `${vars.dist_static_root}/[name].[chunkhash:8].js`;

const css_name = `${vars.css_root}/[name].[chunkhash:8].css`;
WebpackBaseConfig.plugins.push(new ExtractTextPlugin(css_name));

const htmls = [];
insert_htmls.forEach(html => {
    htmls.push(html)
});

WebpackBaseConfig.plugins.push(
    new InsertHtmlPlugin({
        options: {
            htmls: htmls
        }
    })
);


WebpackBaseConfig.output.publicPath = vars.prod_publicPath;

if(JSON.parse(process.env.npm_config_argv).cooked.indexOf('--analyzer') !== -1){
    WebpackBaseConfig.plugins.push(new BundleAnalyzerPlugin());
}

Webpack(WebpackBaseConfig, function(err, stats){
    if(err){
        throw err;
    }
    console.log(stats.toString({
        entrypoints: false,
        children: false,
        chunks: false,  // 使构建过程更静默无输出
        colors: true,    // 在控制台展示颜色
		modules: false,
		chunkModules: false
    }));
});