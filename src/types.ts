import { PathLike } from 'fs'
import { ChildProcess } from 'child_process'
import 'colors'
import { Compiler as WebpackCompiler } from 'webpack'

export interface Options{
	host: string
	port: number
	https?: boolean
	contentBase: string
	remote: boolean
	forceRestart: boolean
	reopen: boolean
	output: 'none' | 'error' | 'normal'
	logging: 'none' | 'error' | 'normal'
	main?: Array< string >
	useInProduction: boolean
}

export interface UserOptions {
	host?: string				// host to serve app content
	port?: number				// port to serve app content
	https?: boolean				// use https?
	contentBase?: string
	output?: 'none' | 'error' | 'normal'
	logging?: 'none' | 'error' | 'normal'
	main?: string | Array< string >
	forceRestart?: boolean
	reopen?: boolean
	useInProduction?: boolean
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
	main: PathLike
	instance: ChildProcess
	pid: number | null,
	cwd: string | null
	locked?: boolean
}

