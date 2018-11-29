const path = require('path');

const resolve = {
	extensions: ['.ts', '.tsx', '.js', '.json', '.scss', '.css'],
};

module.exports = {
	devtool: 'source-map',
	entry: path.join(__dirname, 'src/'),
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/assets/',
		filename: 'file-dialog.js',
		libraryTarget: 'umd',
		library: 'fileDialog',
	},
	resolve,
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{ loader: 'awesome-typescript-loader?silent=true' },
				],
				exclude: /node_modules/
			},
			{ test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
			{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
		],
	},
};
