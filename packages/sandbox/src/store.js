const { sync } = require('./worker').default;
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

store.subscribe((state, action, update, params) => sync.listen(state, action, params));

export default store;
