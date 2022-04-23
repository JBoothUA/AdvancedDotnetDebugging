/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
let webpack = require('webpack');
let merge = require('webpack-merge');
let common = require('./webpack.config.js');

module.exports = merge(common, {
	plugins: [
		new webpack.optimize.UglifyJsPlugin({ sourceMap: true, compress: { warnings: false } }),//jeb source map?  stuck?
		// Enables scope hoisting
		new webpack.optimize.ModuleConcatenationPlugin()
	]
});