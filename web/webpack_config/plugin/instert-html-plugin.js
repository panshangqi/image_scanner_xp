//insert html

function insertHtmlPlugin(options) {
	this.mark = '<span id="webpack-instert-html-@id"></span>';
	this.options = options.options
}

insertHtmlPlugin.prototype.apply = function (compiler) {
	var self = this;
	if (compiler.hooks) {
	    // webpack 4 support
	    compiler.hooks.compilation.tap('insertHtmlPlugin', (compilation) => {
	      	compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('insertHtmlPlugin', (htmlPluginData, callback) => {
	      		self.onAfterHtmlProcessing(htmlPluginData, callback);
	      	});
	    });
	} else {
	    // webpack 3
	    compiler.plugin('compilation', function (compilation) {
	      	compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {
	      		self.onAfterHtmlProcessing(htmlPluginData, callback);
	      	});
	    });
	}
}

insertHtmlPlugin.prototype.onAfterHtmlProcessing = function (htmlPluginData, callback){
	var self = this;
	var htmls = this.options.htmls;
	htmls.forEach((_) => {
		var id = _.id || 1;
		var html = _.html;
		var mark = self.mark.replace(/@id/, id);
		htmlPluginData.html = htmlPluginData.html.replace(mark, html);
	});
	callback(null, htmlPluginData);
}

module.exports = insertHtmlPlugin;