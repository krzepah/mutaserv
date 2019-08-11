import createStore from 'stockroom/worker';
import { merge, concat } from 'ramda';
import createSync from 'mutasync';

const sync = createSync();

const defaults = {
	count: 0,
	elements: {},
	elementsIds: []
};

let store = createStore(defaults);

store.registerActions(sync.auth);
store.registerActions( store => ({
	newElement: ({ elements, elementsIds }, { text, newId }) => ({
		elements: merge({ [newId]: { text, id: newId } }, elements),
		elementsIds: concat([newId], elementsIds)
	})
}));

export default {
	store,
	sync
};
