# Electron Live plugin for Webpack

This plugin will reload you app's windows whenever their content is compiled. It will also restart windows whose <i>main</i> files are compiled.

## Installation

Simply use npm:

```
npm install --save-dev webpack-reload-electron
```

## Usage

To use this plugin import it into your <i>webpack.config.js</i> file and create new instace of it:

```
const { ElectronLive } = require('electron-live')
const electronLive = new ElectronLive({
	host?: string								// host to serve app content
	port?: number								// port to serve app content
	https?: boolean								// use https?
	contentBase?: string
	output?: 'none' | 'error' | 'normal'
	logging?: 'none' | 'error' | 'normal'
	main?: string | Array< string >
	forceRestart?: boolean
	reopen?: boolean
	useInProduction?: boolean
})

module.exports = {
	...
	plugins: [ reloadElectronPlugin ]
	...
}
```

## Externals

This plugin uses:
* [ colors ]( https://www.npmjs.com/package/colors ) - get color and style in your node.js console
* [ tree-kill ]( https://www.npmjs.com/package/tree-kill ) - kill all processes in the process tree, including the root process

## Author

**Marcin Rogalski** - [ mail me ]( mailto:marcinrogalski@interia.eu )