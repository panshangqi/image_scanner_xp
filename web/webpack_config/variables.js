//variables

const path = require('path');
const _exports = {};
var src_root;
var dist_static_root;

_exports.root = path.resolve(__dirname, '../assets');

_exports.src_root = src_root = path.resolve(__dirname, '../assets/src');
_exports.templates_root = `${src_root}/templates`;
_exports.routes_root = `${src_root}/routes`;
_exports.pages_root = `${src_root}/pages`;
_exports.components_root = `${src_root}/components`;
_exports.imgs_root = `${src_root}/imgs`;

_exports.yq_design_root = `${src_root}/yq_design`;
_exports.fx_root = `${src_root}/fx`;
_exports.dist_root = path.resolve(__dirname, '../../client/web_dist');

//默认在dist目录下
_exports.dist_static_root = dist_static_root = '.';
_exports.font_root = `${dist_static_root}/fonts`;
_exports.css_root = `${dist_static_root}/css`;
_exports.img_root = `${dist_static_root}/imgs`;

//dev
_exports.proxy_host = 'http://local.zx-math.test.17zuoye.net';
_exports.proxy = [];
_exports.port = 10032;
_exports.dev_publicPath = '/';
_exports.dev_insert_htmls = [];


//pro
const preParameters_script = [
    '<script type="text/javascript">',
    'var SITE_ROOT="{{handler.subject.site_root}}";',
    'var SUBJECT_NAME="{{handler.subject.name}}";',
    '{% autoescape false %}',
    'var CURRENT_USER={{json_encode(handler.current_user)}};',
    '{% endautoescape %}',
    '</script>'
];
_exports.prod_publicPath = '../';
_exports.prod_insert_htmls = [
    {
        id: 1,
        html: preParameters_script.join('\n')
    }
];

module.exports = _exports;
