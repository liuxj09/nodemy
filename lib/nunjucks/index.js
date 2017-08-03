
module.exports = function(config){
	const nj = require('./nj')
	const tplHelpers = require('./tpl-helper')(config)
	const tplFilter = require('./tpl-filter')(config)

	const njInject = nj({
		path: config.viewPath,
		nunjucksConfig: {
			atuoescape: true
		},
		envHandler: (njEnv) => {
			for (let i in tplHelpers) {
				njEnv.addGlobal(i, tplHelpers[i])
			}
			for (let i in tplFilter) {
				njEnv.addFilter(i, tplFilter[i])
			}
		}
	})

	return njInject;
}