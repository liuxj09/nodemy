/**
 * nunjucks custom filters
 */
module.exports = function(config){

	var obj = {};

	// 将字符串拆分成数组
	obj.split = (str, separator, howmany) => {
		return str.split(separator, howmany);
	}

	return obj
}

