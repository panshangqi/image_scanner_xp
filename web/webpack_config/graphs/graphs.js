//dependency graphs

const path = require('path');
const glob = require('glob');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const vars = require('../variables.js');
const routes_root = vars.routes_root;
const templates_root = vars.templates_root;
const entries = {};
const html_plugins = [];
const graphs = [];
var _glop_routes_instance;
var routes_list;
var _exports;

_glop_routes_instance = new glob.Glob('*.jsx', {
	cwd: routes_root,
  	sync: true
});

routes_list = _glop_routes_instance.found;

routes_list.forEach((routefile) => {
	const name = routefile.replace(/(.*\/)*([^.]+).*/ig, '$2');
	const suffix = routefile.replace(/.+\./, '');
	entries[name] = `${routes_root}/${routefile}`;
	graphs.push(name);
});

graphs.forEach((name) => {
    const _html = new HTMLWebpackPlugin({
        filename: `templates/${name}.html`,
		template: `${templates_root}/${name}.html`,
		favicon: `${vars.imgs_root}/favicon.ico`,
        chunks: ['vendors', 'common', name],
        hash: true,
        minify: {
	        removeComments: true,
	        collapseWhitespace: false
	     }
    });
    html_plugins.push(_html);
})

console.log('entries:', entries);

_exports = {graphs, entries, html_plugins};

module.exports = _exports;