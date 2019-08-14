const ramda = require('ramda');
const requireFromString = require('require-from-string');
const process = require('process');
const logger = require('./config/logger');
const format = require('./formater');

const createSync = () => ({
	sync: () => {}
});
const createStore = (defaults) => {
	let store = { };
	let r = { reducers: { }, defaults };
	r.registerActions = (
		actions
	) => {
		if (typeof actions==='function') actions = actions(store);
		for (let i in actions) r.reducers[i] = actions[i];
	};
	return r;
};

const stringify = e => {
	let v = Object.assign(e);
	delete v.registerActions;
	return JSON.stringify(v, (key, val) => (typeof val === 'function') ? ('' + val) : val, 4).replace(/\\n/g, '\n    ');
};

let mod = null;
const doLoad = (path) => {
	let stringMod = '';
	try {
		stringMod = format(path);
		mod = requireFromString(stringMod)({ createSync, createStore }, ramda);
		if (process.env.LOG_REDUCERS === 'true') logger.info('Loaded store : ' + stringify(mod));
	}
	catch (err) {
		//eslint-disable-next-line
		logger.error('Load error: ' + err);
		process.exit(1);
	}
};

/**
 * Watches path for changes
 *  - Loads the new module
 *  - Calls listener with the new module
 */
module.exports = (path, listener) => {
	let mutationFolder;
	if (path.substr(-3) === '.js') {
		mutationFolder = path.split('/');
		mutationFolder.pop();
		mutationFolder = mutationFolder.join('/');
	}
	if (process.env.RELOAD === 'true') {
		const watcher = require('@parcel/watcher');
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
