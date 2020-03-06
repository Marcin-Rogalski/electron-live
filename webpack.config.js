const { resolve } = require('path')
const { DefinePlugin } = require('webpack')

let title = require( resolve( __dirname, 'package.json' ) ).name
let define = new DefinePlugin({
	'process.env.TITLE': JSON.stringify( title )
})


module.exports = function( env, args ){

	const mode = args.mode || 'production'
	const production = mode === 'production'
	const development = mode === 'development'

	const main = {
		target: 'node',
		mode: mode,
		devtool: development ? 'source-map' : 'none',
		entry: './src/main.ts',
		output: {
			filename: 'main.js',
			path: resolve( __dirname, 'lib' ),
			libraryTarget: 'commonjs'
		},
		resolve: {
			extensions: [
				'.js', '.ts'
			]
		},
		module: {
			rules: [
				{
					test: /\.(js|ts)$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								plugins: [ '@babel/plugin-proposal-class-properties' ]
							}
						},
						{
							loader: 'ts-loader',
							options: {
								compilerOptions:{
									declaration: production
								}
							}
						}
					]
				}
			]
		},
		externals: [
			'electron', 'tree-kill', 'colors'
		],
		plugins: [
			define
		]
	}

	const remote = {
		target: 'node',
		mode: mode,
		devtool: development ? 'source-map' : 'none',
		entry: './src/remote.ts',
		output: {
			filename: 'remote.js',
			path: resolve( __dirname, 'lib' ),
			libraryTarget: 'commonjs'
		},
		resolve: {
			extensions: [
				'.js', '.ts'
			]
		},
		module: {
			rules: [
				{
					test: /\.(js|ts)$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								plugins: [ '@babel/plugin-proposal-class-properties' ]
							}
						},
						{
							loader: 'ts-loader'
						}
					]
				}
			]
		}
	}


	return [ main, remote ]
}