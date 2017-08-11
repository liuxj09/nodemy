module.exports = function(config){

	/**
	 * Module Dependences
	 */
	const koa = require('koa')
	const path = require('path')
	const debug = require('debug')('app')

	/**
	 * Preprocessing Module
	 */
	const staticFiles = require('../lib/static')
	const njResgister = require('../lib/nunjucks')(config)
	const injectRequest = require('../lib/request')(config)
	const createRoutes = require('../lib/routes')

	const app = new koa()
	const isProduction = process.env.NODE_ENV === 'production' ? true : false

	if (process.env.NODE_ENV === 'development') {
		const liveload = require('koa-liveload')
		app.use(liveload(config.liveloadPath, {
			includes: ['html', 'css', 'less']
		}))
	}

	app.use(async (ctx, next) => {
		ctx._host = config.host[process.env.NODE_ENV] || 'mycaigou.com'
		await next();
	})

	/**
	 * inject request module into ctx
	 */
	app.use(injectRequest('getData'))

	/**
	 * register static routes
	 * @param {String} static files mark, a request which start with this mark will handler by static routes
	 * @param {String} static files path
	 */
	if (process.env.NODE_ENV === 'development') {
		const jcsMark = config.jcsPath.jcsMark
		app.use(staticFiles(jcsMark, config.staticPathDev))
	}

	/**
	 * register nunjucks
	 */
	app.use(njResgister)

	/**
	 * @param {Array} register routes based each config object
	 */
	app.use(createRoutes([{
		dirPath: config.routePath
	}]))

	// catch 404
	app.use(async (ctx, next) => {
		if (parseInt(ctx.status) === 404) {
			debug(`quest url ${ctx.request.url}`)
			console.log('----------------------ctx.request.url-----------------------',ctx.request.url);
			if(ctx.request.url.indexOf('/detail/') >= 0){
				console.log('----------redirect to detail---------');
				await config._detail(ctx, next)
			}else if(ctx.request.url == '/'){
				console.log('----------redirect to index---------');
				await config._index(ctx, next)
			}
					
		} else {
			await next();
		}
	})

	if (!isProduction) {
		app.use(async (ctx, next) => {
			debug(`process ${ctx.request.method} ${ctx.request.url}`)
			const start = new Date().getTime()
			await next()
			const execTime = new Date().getTime() - start
			ctx.response.set('X-Response-Time', `${execTime}ms`)
		})
	}

	console.log(process.env.NODE_ENV)

	return app
}
