const { exec, execSync } = require('child_process')
const package = require('./package.json')

function parse( version ){
	return version.trim().split( '.' )
}

function compare( version_1, version_2 ){
	for( let segment = 0 ; segment < Math.max( version_1.length, version_2.length ) ; segment++ ){
		if( version_1[ segment ] !== version_2[ segment ] ){
			return version_1[ segment ] > version_2[ segment ]
				? version_1
				: version_2
		}
	}
}

async function publish(){
	let output = await new Promise( ( resolve, reject ) => {
		let child_process = exec('npm publish' )

		child_process.on('exit', ( code ) => {
			process.exit( code )
		})
	} )

	return output
}

async function start(){

	let version = parse( package.version )
	let remoteVersion

	try{
		remoteVersion = parse( execSync( `npm show ${ package.name } version`, { encoding: 'UTF-8' } ) )

		let update = compare( version, remoteVersion ) === version

		update || console.log( `Skipping due to confilcted versions. To publish increment project version over ${ remoteVersion.join('.') }.` )

		!update || await publish()
	} catch( error ){
		process.exit( 1 )
	}

}

start()