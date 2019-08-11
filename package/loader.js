const ramda = require('ramda');
const requireFromString = require('require-from-string');
const process = require('process');
const logger = require('./config/logger');
const watcher = require('@parcel/watcher');
const format = require('./formater');

const createSync = () => ({
	auth: (s) => ({ })
});
const createStore = () => {
	let store = { };
	let r = { reducers: { } };
	r.registerActions = (
		actions
	) => {
		if (typeof actions==='function') actions = actions(store);
		for (let i in actions) r.reducers[i] = actions[i];
	};
	return r;
};

let mod = null;
const doLoad = (path) => {
	let stringMod = '';
	try {
		stringMod = format(path);
		mod = requireFromString(stringMod)({ createSync, createStore }, ramda);
		console.log(mod);
	}
	catch (err) {
		//eslint-disable-next-line
		logger.error('Load error: ' + err);
		process.exit(1);
	}
	logger.info('Loading reducers from ' + process.env.REDUCERS);
	if (process.env.LOGS_REDUCERS)
		logger.info('Loaded mutations : \n' + stringMod);
	if (process.env.DISPLAY_REDUCERS) {
		//eslint-disable-next-line
		console.log('Loaded mutations : \n' + stringMod);
	}
};

/**
 * Watches path for changes
 *  - Loads the new module internally
 *  - Calls listener with the new module
 */
module.exports = (path, listener) => {
	let mutationFolder;
	if (path.substr(-3) === '.js') {
		mutationFolder = path.split('/');
		mutationFolder.pop();
		mutationFolder = mutationFolder.join('/');
	}
	if (process.env.RELOAD) {
		logger.info('Watching : ' + mutationFolder);
		watcher.subscribe(mutationFolder, (err, events) => {
			if (process.env.RELOAD) {
				logger.info('Mutation folder got updated');
				doLoad(process.env.REDUCERS);
				listener(mod);
			}
		});
	}
	doLoad(path);
	return mod;
};
