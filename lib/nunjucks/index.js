
module.exports = function(config){
	const nj = require('./nj')
	const tplHelpers = require('./tpl-helper')(config)

	const njInject = nj({
		path: config.viewPath,
		nunjucksConfig: {
			atuoescape: true
		},
		envHandler: (njEnv) => {
			for (let i in tplHelpers) {
				njEnv.addGlobal(i, tplHelpers[i])
			}
		}
	})	

	return njInject;
}