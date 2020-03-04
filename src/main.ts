import { resolve } from 'path'
import { spawn } from 'child_process'
import kill from 'tree-kill'
import electronPath from 'electron'
import 'colors'
import { Options, UserOptions, Compiler, Process } from './types'
import { isString, isObject } from 'util'


export class ElectronLive{

	name: string = 'WebpackElectronPlugin'
	remote: string = resolve( 'node_modules/webpack-electron-plugin/lib/remote.js' )
	initialized: boolean = false
	options: Options = {
			host: null,
			port: null,
			contentBase: null,
			remote: /webpack-dev-server/.test( process.argv[ 1 ] ),
			output: 'normal',
			logging: 'normal',
			forceRestart: false,
			reopen: false,
			useInProduction: true
	}
	compilers: Array< Compiler > = []
	userProcesses: Array< Process >

	constructor( options?: UserOptions ){

		this.applyOptions( options )
		this.bindFunctions()
		
	}

	bindFunctions(){

		this.developmentMessage( 'Binding functions...' )

		this.start = this.start.bind( this )
		this.stop = this.stop.bind( this )
		this.startAll = this.startAll.bind( this )
		this.stopAll = this.stopAll.bind( this )
		this.initialize = this.initialize.bind( this )
		this.developmentMessage = this.developmentMessage.bind( this )
		this.displayMessage = this.displayMessage.bind( this )
	}

	initialize( compiler: Compiler ): void {

		this.developmentMessage( 'Initializing...' )
		
		// for ease of use
		if( !compiler.options.devServer ) compiler.options.devServer = {}

		// test for HTTPS
		if( compiler.options.devServer.https ) this.options.https = compiler.options.devServer.https

		// process PORT
		if( this.options.port ) compiler.options.devServer.port = this.options.port
		else this.options.port = compiler.options.devServer.port || 8080

		// process HOST
		let test = /^(http|https)\:\/\//
		let host = this.options.host || compiler.options.devServer.host || 'localhost'

		if( test.test( host ) )	host = host.replace( test, '')
			
		compiler.options.devServer.host = host
		this.options.host = ( this.options.https
					? 'https://'
					: 'http://' ) + host

		// process CONTENT BASE
		if( this.options.contentBase ) compiler.options.devServer.contentBase = this.options.contentBase
		else this.options.contentBase = compiler.options.devServer.contentBase

		// process custom MAIN FILES
		if( this.options.main ){

			this.userProcesses = []

			// create custom processes for each main entry
			this.options.main
				.forEach( main => {

					let cwd = resolve( compiler.context, this.options.contentBase )
					let target = resolve( cwd, main ).substring( cwd.length )

					this.userProcesses.push({
						instance: undefined,
						main: target,
						pid: null,
						cwd: cwd,
					})

				})
		}

		// set initialization trigger
		this.initialized = true

		this.developmentMessage( this.options )
	}

	applyOptions( options?: UserOptions ): void {

		this.developmentMessage( 'Applying options...' )

		// convert main file to list
		if( options && options.main && isString( options.main ) ) options.main = [ options.main ]

		Object.assign( this.options, options )

		this.developmentMessage( this.options )
	}

	apply( compiler: Compiler ){

		if( !this.options.useInProduction && compiler.options.mode === 'production' ) return
		
		this.developmentMessage( 'Webpack is applying plugin...' )

		// add custom properties to comipler
		compiler = this.wrap( compiler )
		this.compilers.push( compiler )

		// initialize plugin with compiler
		this.initialized || this.initialize( compiler )

		// tap compilers hooks
		this.tap( compiler )
	}

	tap( compiler: Compiler ){

		this.developmentMessage( 'Tapping into cimpiler\'s hooks...' )

		// tap stoppers
		compiler.hooks.beforeCompile.tap( this.name, () => {

			compiler.await = true

			if( compiler.type === 'main' ){
				if( !this.userProcesses ) compiler.processes.forEach( process => console.log( process.main ) )

				if( this.userProcesses || this.options.forceRestart ) this.stopAll()

				else compiler.processes
					.filter( process => process.instance && !process.instance.killed )
					.forEach( this.stop )
			}
		})

		// tap starters
		compiler.hooks.afterEmit.tap( this.name, () => {

			compiler.await = false

			if( this.compilers.filter( compiler => compiler.await ).length === 0 ) this.startAll()
		})
	}

	wrap( compiler: Compiler ): Compiler {

		this.developmentMessage( 'Wrapping compiler...' )

		// assign custom informations
		compiler.type = compiler.options.target === 'electron-main' ? 'main' : 'other'
		compiler.await = false
		
		let output: string = compiler.options.output.filename as string
		let path: string = compiler.options.output.path as string
		let cwd = resolve( compiler.options.output.path || compiler.context )
		
		// process compiler's entry point(s): as STRING
		if( isString( compiler.options.entry ) ) {
			let target = resolve( compiler.options.output.path, compiler.options.output.filename as string )
			target = target.substring( cwd.length )

			compiler.processes = [
				{
					instance: undefined,
					main:  target,
					pid: null,
					cwd: cwd,
				}
			]

			return compiler
		}

		// process compiler's entry point(s): as OBJECT
		if( isObject( compiler.options.entry ) ) {

			let entries: Array< string > = Object.getOwnPropertyNames( compiler.options.entry )
			let test = /\[name\]/

			compiler.processes = entries
				.map( entry => {

					let target: string = resolve( path, output.replace( test, entry ) )
					target = target.substring( cwd.length )

					return {
						instance: undefined,
						main:  target,
						pid: null,
						cwd: cwd
					}
				})

			return compiler
		}
	}

	start( process: Process ){

		this.developmentMessage( 'Starting process: '.green + process.main.toString().magenta )

		if( process.instance && !process.instance.killed ) return
		if( process.instance === null && !this.options.reopen ) return

		function printOutput( str: string, err?: boolean ){
			if( !str ) return
			
			str = str.toString()

			if( str.codePointAt( 0 ) === 13 && str.codePointAt( 1 ) === 10 ) return

			let cariage = err ? '>> '.red : '>> '.green
			let file = process.main
				.toString()
				.split('\\')
				.join('/')

			console.log( '\nElectron @ ' + `.${ file }`.cyan )

			let full_line = ''
			str.toString()
				.trimLeft()
				.split('\n')
				.forEach( line => { full_line = `${ full_line }\n${ cariage }${ line }` } )

			console.log( full_line )
		}

		try{
			// create process instance
			process.instance = spawn( 
				electronPath as undefined as string,
				[ this.options.remote ? this.remote as string : `./${ process.main }` ],
				{
					cwd: process.cwd,
					env: this.options.remote
						? {
							REMOTE: 'TRUE',
							PORT: `${ this.options.port }`,
							HOST: this.options.host,
							FILE: process.main as string,
							URL: `${ this.options.host }:${ this.options.port }`,
						} 
						: {}
				}
			)

			// set process pid
			process.pid = process.instance.pid

			if( this.options.output === 'normal' ) process.instance.stdout.on('data', data => { printOutput( data ) } )
			if( this.options.output !== 'none' ) process.instance.stderr.on('data', data => { printOutput( data, true ) } )

			process.instance.on('exit', () => { process.instance = null } )

		} catch( error ){
			process.instance = null
			if( this.options.logging !== 'none' ) {
				this.displayMessage( error.message, true )
			}
		}
	}

	stop( process: Process ){

		this.developmentMessage( 'Stopping process: '.red + process.main.toString().magenta )

		try{

			( !process.instance || process.instance.killed ) || kill( process.pid || process.instance.pid )
			process.instance = null

		} catch( error ){

			if( this.options.logging !== 'none' ){
				console.log( 'Failed to close ELECTRON app. Error occured:'.red )
				console.log( error )
			}

		}
	}

	startAll(){

		this.developmentMessage( 'Starting all processes...' )

		if( this.compilers.filter( compiler => compiler.await ).length !== 0 ) return
		if( this.userProcesses && this.userProcesses.length !== 0 ) {

			this.userProcesses.forEach( process => { this.start( process ) } )
		}

		else this.compilers
			.filter( compiler => compiler.type === 'main' )
			.map( compiler => compiler.processes )
			.forEach( processes => processes.forEach( process => { this.start( process ) } ) )
	}

	stopAll(){

		this.developmentMessage( 'Stopping all processes...' )

		if( this.userProcesses ) this.userProcesses
			.filter( process => process.instance && !process.instance.killed )
			.forEach( process => { this.stop( process ) } )

		else this.compilers
			.filter( compiler => compiler.type === "main" )
			.map( compiler => compiler.processes )
			.map( processes => processes.filter( process => process.instance && !process.instance.killed ) )
			.forEach( processes => processes.forEach( process => { this.stop( process ) } ) )
	}

	displayMessage( message: string | object, error?: boolean, dev?: boolean ){

		let prompt = error 
			? '>> '.red
			: dev 
				? '>> '.yellow 
				: '>> '.green

		isString( message )
			? console.log( prompt + message.split( '\n' ).join( '\n' + prompt ) )
			: console.log( prompt + JSON.stringify( message, null, 3 ).split( '\n' ).join( '\n' + prompt ) )

	}

	developmentMessage( message: string | object, error?: boolean ){
		if( process.env.NODE_ENV !== 'development' ) return

		this.displayMessage( message, error, true )
	}

}