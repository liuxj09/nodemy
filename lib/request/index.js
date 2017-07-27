module.exports = function(config){

	const request = require('request')
	const debug = require('debug')('request')
	const forEach = require('lodash').forEach

	let urlPrefix;
	// 对应不同环境主机名
	switch (process.env.NODE_ENV) {
		case 'production':
			urlPrefix = config.proxy.production
			break
		default:
			urlPrefix = config.proxy.default
	}

	/**
	 * 简单解释cookie字符串
	 */
	const parseCookie = (cookieString) => {
		const result = {
			options: { }
		}

		/**
		 * Set-Cookie格式： 参照https://portal.mycaigou.com/bid/get-last-bidding
		 * companyName=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/; domain=.mycaigou.com
		 * <name>=<value>[; <name>=<value>]...
		 */
		forEach(cookieString.split(/\s*;\s*/), (group, index) => {
			const groupParam = group.split('=')
			if (index) {
				const name = groupParam[0].replace(/^[A-Z]+/, function(match) {
					return match.toLowerCase();
				}).replace(/-([a-z])/gi, function(match, $1) {
					return $1.toUpperCase();
				});

				result.options[name] = groupParam.length > 1 ? groupParam[1] : true
				if (name === 'expires') {
					result.options[name] = new Date(result.options[name])
				}
			} else {
				result.name = groupParam[0]
				result.value = groupParam[1]
			}
		})
		return result
	}

	const requesInjector = (questName = 'quest') => async (ctx, next) => {
		if (ctx[questName]) {
			throw new Error(`ctx[${questName}] has already exist!`)
		}
		ctx[questName] = (url = '', config = {}) => {
			if (url.startsWith('/')) {
				url = urlPrefix + url;
			}
			return new Promise((resolve, reject) => {
				const cookies = ctx.request.header.cookie || ''
				const startTime = Date.now()
				request({
					url: url,
					method: config.method || 'GET',
					timeout: config.timeout || 10000,
					json: true,
					headers: {
						Cookie: cookies.replace(/\s*;\s*/, '; '),
						'User-Agent': ctx.request.header['user-agent'],
					}
				}, (err, res, body) => {
					let errMsg
					if (err) {
						errMsg = err.message || 'unkown error in request'
					} else {
						const statusCode = res.statusCode
						console.log(`Request ${url} ${statusCode} ${Date.now() - startTime}ms - ${res.connection.bytesRead}b`)

						if ( (statusCode >= 200 && statusCode <= 300) || statusCode === 304 ) {
							const resCookies = res.headers['set-cookie']
							if (resCookies) {
								forEach(resCookies, (cookie) => {
									cookie = parseCookie(cookie)
									ctx.cookies.set(cookie.name, cookie.value, cookie.options)
								})
							}
							if (res.body) {
								resolve(res.body)
							} else {
								errMsg = `Invalid data format: ${url}`
							}
						} else {
							errMsg = `Request failed: ${url}`
						}
					}
					reject( new Error(errMsg) )
				})
			})
		}
		await next()
	}

	return requesInjector
}
