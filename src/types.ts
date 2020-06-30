import { ChildProcess } from 'child_process'
import { Compiler as WebpackCompiler } from 'webpack'
import 'colors'

export interface Options{
	host: string
	port: number
	contentBase: string
	args?: Array< string >
	remote: boolean
	https?: boolean
	forceRestart: boolean
	reopen: boolean
	output: 'none' | 'error' | 'normal'
	logging: 'none' | 'error' | 'normal'
	main?: Array< string >
	useInProduction: boolean,
}

export interface UserOptions {
	args?: Array< string >
	host?: string				// host to serve app content
	port?: number				// port to serve app content
	contentBase?: string
	logging?: 'none' | 'error' | 'normal'
	main?: string | Array< string >
	output?: 'none' | 'error' | 'normal'
	reopen?: boolean
	forceRestart?: boolean
	useInProduction?: boolean
	https?: boolean				// use https?
}

export type Compiler = {
	type?: 'main' | 'other'
	processes?: Array< Process >
	await?: boolean
	options?: {
		devServer?: {
			port?: number
			host?: string
			contentBase?: string
			https?: any
		}
	}
} & WebpackCompiler

export interface Process {
	main: string
	instance: ChildProcess
	pid: number | null,
	cwd: string | null
	locked?: boolean
}

