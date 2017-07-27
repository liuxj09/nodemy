const requireDir = require('require-dir')
const router = require('koa-router')()
const forEach = require('lodash').forEach
const debug = require('debug')('routesRegister')

const addRoute = ((router) => ({dirPath, useBasePath = false}) => {
	console.log('dirPath:', dirPath);
	const routes = requireDir(dirPath, {recurse: true})
	const basePath = useBasePath ? (_.startsWith(dirPath, './') ? dirPath.substr(2, dirPath.length - 2) : dirPath) : ''
	console.log('basePath:', basePath);
	forEach(routes, (subRoutes, key) => {
		const mpath = key === '__' ? '' : key

		forEach(subRoutes, (route, extendPath) => {
			const path = ('/' + basePath + '/' + mpath + '/' + extendPath).replace(/\/+/g, '/');
			const routePath = ('/' + basePath + '/' + mpath + '/').replace(/\/+/g, '/');
			router.get(path, async (ctx, next) => {
				ctx.routePath = routePath
				ctx.viewPath = path

				if (typeof route === 'object') {
					ctx._absTemplate = route.template ? route.template : null
					if (route.callback) {
						await route.callback(ctx, next)
					} else {
						throw new Error('unexpected lost route.callback')
					}
				} else if (typeof route === 'function'){
					await route(ctx, next)
				} else {
					throw new Error('route callback must be function or object')
				}

			})
			debug(`register ${path}`)
		})
	})
})(router)

module.exports = (arr = []) => {
	forEach(arr, (config, index) => {		
		addRoute(config)
	})
	return router.routes()
}