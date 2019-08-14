import worker from './worker';
const { sync } = worker;

let store;
if (typeof(window) !== 'undefined') {
	const createStore = require('stockroom').default;
	const StoreWorker = require('worker-loader!./worker');
	store = createStore(new StoreWorker());
}
else {
	const createStore = require('stockroom/inline');
	store = createStore(require('./worker').default.store);
}

sync.sync(store);

export default store;
