import { get } from 'http'

let host = process.env.HOST
let port = process.env.PORT
let file = process.env.FILE

console.log( process.env.NODE_PATH )

let url = `${ host }:${ port }/${ file }`

try{
	get( url, ( response ) => {
		
		let data = ''
	
		response.on('data', chunk => data += chunk )
		response.on('close', () => {
	
			try{
				Function(data)();
			} catch( error ){
				console.log( 'Failed run remote code.' )
				console.log( error )
			}
		})
	})
} catch( error ){
	console.log( 'Failed to load remote file content.' )
	console.log( error )
}