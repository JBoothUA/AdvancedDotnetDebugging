/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
//TODO tshint (pre?)loader
let webpack = require('webpack');
let merge = require('webpack-merge');
let common = require('./webpack.config.js');
let bundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
	module: {
		loaders: [
			// Enables the debugging of .ts files.
			{ test: /\.js$/, use: ['source-map-loader'], exclude: /node_modules/ }
		]
	},
	plugins: [
		new bundleAnalyzerPlugin()
	]
});