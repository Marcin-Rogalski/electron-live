# Electron Live plugin for Webpack

This plugin will reload you app's windows whenever its content is compiled. It will also restart windows whose **_main_** files are compiled.

## Installation

Simply use npm:

```
npm install --save-dev electron-live
```

## Usage

To use this plugin import it into your **_webpack.config.js_** file and create new instace of it:

```typescript
const { ElectronLive } = require('electron-live')
const electronLive = new ElectronLive({
	
	// host to serve app content, this will overwrite devServer.host
	host?: string

	// port to serve app content, this will overwrite devServer.port
	port?: number

	// use https?, this will overwrite devServer.https ( this is not implemeted yet! )
	https?: boolean

	// from where to serve files, this will overwrite devServer.contentBase
	contentBase?: string

	// decide what informations from your main files will be displayed to the console
	output?: 'none' | 'error' | 'normal'

	// decide what informations during compilation will be displayed to the console
	logging?: 'none' | 'error' | 'normal'

	// main file or list of main files to run after compilation, this should be path relitve to contentBase or absolute path
	main?: string | Array< string >

	// if set to true, each time content of windows will be compiled, windows will be restarted
	forceRestart?: boolean

	// if set to true, after compilation each window closed by user will be restored
	reopen?: boolean

	// if set to true, plugin will be used in production compilations
	useInProduction?: boolean

})

module.exports = {
	...
	plugins: [ electronLive ]
	...
}
```

### Issue 

To make configuration work, add empty object to your configuration for devServer key:
```typescript
module.exports = {
	entry: 'main.js',
	...

	// for now, this is necesary
	devServer: {}

	...
}
```

## Externals

This plugin uses:
* [ colors ]( https://www.npmjs.com/package/colors ) - get color and style in your node.js console
* [ tree-kill ]( https://www.npmjs.com/package/tree-kill ) - kill all processes in the process tree, including the root process

## Author

**Marcin Rogalski** - [ mail me ]( mailto:marcinrogalski@interia.eu )