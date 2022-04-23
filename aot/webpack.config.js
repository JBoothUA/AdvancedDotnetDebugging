/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
let webpack = require('webpack');
let path = require('path');
let aot = require('@ngtools/webpack');

module.exports = {
	entry: {
		main: './Angular/main'
	},
	output: {
		path: __dirname,
		filename: './dist/smartcommand-[name].min.js',
		// Lazy load modules by route & chunk
		chunkFilename: './dist/smartcommand-[name].chunk.[hash].min.js'
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [ //jeb is this still needed?
		    path.resolve('./'),
		    path.resolve('./node_modules')
		],
		alias: {
			//'ng2-charts': 'node_modules/ng2-chart/ng2-chart',
			//'ng2-dragula': 'node_modules/ng2-dragula/bundles/ng2-dragula.umd.min.js'
		}
	},
	module: {
		rules: [
			// Ahead of Time Compilation
			{ test: /\.ts$/, loader: '@ngtools/webpack', exclude: [/\.(spec)\.ts$/] },
			// AoT requires .html & .css files to be loaded into the bundle
			{ test: /\.html$/, loader: 'html-loader' },
			{ test: /\.css$/, loader: 'raw-loader' },
			{
				test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
				loader: 'file-loader', options: { name: '[name].[hash].[ext]' }
				//jeb gotta figure out where these gotta go??
			}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({ name: 'main' }),
		// Ahead of Time Plugin
		new aot.AotPlugin({
			tsConfigPath: path.resolve('./Angular/tsconfig.json'),
			entryModule: path.resolve('./Angular/_app.module#SmartCommandModule')
			// Use this setting to turn off AoT
			//,skipCodeGeneration: true
		}),
		// Only load the necessary locales for moment
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|es/)
	],
	// Minimize webpack console output
	stats: { assets: false, children: false }
};