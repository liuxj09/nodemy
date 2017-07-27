/**
 * nunjucks command
 */
module.exports = function(config){

	const path = require('path')
	const nodeEnv = process.env.NODE_ENV
	const isDev = nodeEnv === 'development' ? true : false

	var obj = {};

		// 引入jcs
	obj.jcsCSS = (href) => {
		href = isDev ? config.jcsPath.jcsMark + href : (config.jcsPath[nodeEnv] + href)
		return '<link href="' + href + '" media="all" rel="stylesheet" type="text/css" />'
	}

	// 引入jcs资源
	obj.jcs = (href) => {
		href = isDev ? config.jcsPath.jcsMark + href : (config.jcsPath[nodeEnv] + href)
		return href
	}

	// 引入jcs
	obj.jcsJS = (href) => {
		href = isDev ? config.jcsPath.jcsMark + href : (config.jcsPath[nodeEnv] + href)
		return '<script src="' + href + '" type="text/javascript"></script>'
	}

	// 引入外部CSS
	obj.importCSS = (href) => {
		return '<link href="' + href + '" media="all" rel="stylesheet" type="text/css" />'
	}

	// 添加meta标签
	obj.importMeta = (key, content) => {
		return '<meta name="' + key + '" content="' + content + '" />'
	}

	// 添加TDK标签
	obj.importTDK = ({T, D, K}) => {
		return '<title>' + T + '</title>'
			 + '<meta name="description" content="' + D + '" />'
			 + '<meta name="keywords" content="' + K + '" />'
	}

	// 引入外部JS
	obj.importJS = (src) => {
		return '<script src="' + src + '"></script>'
	}

	// JSON序列化
	obj.jsonEncode = (obj) => {
		return JSON.stringify(obj)
	}

	// 对象是否存在
	obj.exists = (obj) => {
		let result = obj != null;
		if (result) {
			if ( Array.isArray(obj) ) {
				result = obj.length > 0;
			} else if (typeof obj === 'string') {
				result = obj.trim() !== ''
			}
		}
		return result
	}

	return obj
}

