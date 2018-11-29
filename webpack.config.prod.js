const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./webpack.config');

const uglifyOptions = {
	sourceMap: false,
	mangle: true,
	compress: {
		warnings: false,
		dead_code: true,
		screw_ie8: true,
	},
	output: {
		comments: false,
	},
	parallel: true,
};

module.exports = merge.smart(config, {
	devtool: false,
	module: {
		rules: [
			{ test: /\.scss$/, loader: ExtractTextPlugin.extract({ use: ['css-loader?minimize', 'sass-loader'] }) },
			{ test: /\.css$/, loader: ExtractTextPlugin.extract({ use: ['css-loader?minimize'] }) },
		],
	},
	plugins: (config.plugins || []).concat([
		new ExtractTextPlugin('file-dialog.css'),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin(uglifyOptions),
	]),
});
