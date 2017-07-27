const path = require('path')
const mime = require('mime')
const debug = require('debug')('staticFilesRegister')
const fs = require('mz/fs')
const isDev = process.env.NODE_ENV === 'development' ? true : false

const staticFiles = (url, dir) => async (ctx, next) => {
	const reqPath = onlyDownFind(ctx.request.path)
	if (reqPath.startsWith(url)) {
		const fp = path.join(dir, reqPath.substring(url.length))
		if (await fs.exists(fp)) {
			ctx.response.type = mime.lookup(reqPath)
			ctx.response.body = await fs.createReadStream(fp)
		} else {
			debug('unexpected error in find static files')
			ctx.response.status = 404
		}
	}
	await next()
}

const onlyDownFind = (str = '') => {
	if (isDev) {
		return str
	}
	return str.replace(/\.+/g, '.')
}

module.exports = staticFiles