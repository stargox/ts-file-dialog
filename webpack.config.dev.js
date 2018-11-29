const webpack = require('webpack');
const config = require('./webpack.config');
const merge = require('webpack-merge');

module.exports = merge.smart(config, {
	devServer: {
		contentBase: 'src/',
		compress: true,
	},
	plugins: (config.plugins || []).concat([
		new webpack.optimize.OccurrenceOrderPlugin(),
	]),
});
