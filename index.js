
module.exports = function(config){

	if(typeof config !== 'object'){
		console.log('error: no config')
		return;
	}

	const app = require('./src/app.js')(config)

	const http = require('http')
	const port = config.port

	const server = http.createServer(app.callback())	
	server.listen(port)

	const debug = require('debug')('bash')
	debug(`now server started at port: ${port}`)
	console.log(`now server started at port: ${port}`)

}