const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const graphs = require('./graphs/graphs');
const vars = require('./variables');

const img_name = `${vars.img_root}/[name].[ext]`;
const font_name = `${vars.font_root}/[name].[ext]`;

module.exports = {
    entry: graphs.entries,
    output: {
        path: vars.dist_root
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            '@root': vars.root,
            '@src': vars.src_root,
            '@pages': vars.pages_root,
            '@components': vars.components_root,
            '@imgs': vars.imgs_root,
            '@yq_design': vars.yq_design_root,
            '@fx': vars.fx_root
        }
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules)/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }],
                            ["transform-decorators-legacy"]
                        ]
                    }
                }
            ]
        }, {
            test: /\.(less|css)$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            globalVars:{
                               'theme_color': '#2D6EDB',
                               'theme_red': '#FF796B',
                               'theme_green': '#13D469',
                               'img_root': '/static/imgs'
                            },
                            javascriptEnabled: true
                        }
                    }
                ]
            }),
        }, {
            test: /\.(bmp|gif|jpe?g|png|ico)$/,
            exclude: /(node_modules)/,
            loader: 'url-loader?limit=8198&name=' + img_name
        }, {
            test: /\.(woff|svg|eot|ttf)$/,
            exclude: /(node_modules)/,
            loader: 'url-loader?limit=1000&name=' + font_name
        }]
    },
    optimization: {
        runtimeChunk: false,
        splitChunks: {
            chunks: 'initial',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    minChunks: 1,
                    priority: -10,
                    name: 'vendors'
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    name: 'common'
                }
            }
        }
    },
    plugins: [
        ...graphs.html_plugins
    ]
}
/*
 {
 enforce: "pre",
 test: /\.(js|jsx)$/,
 exclude: /node_modules/,
 loader: "eslint-loader",
 },
 */