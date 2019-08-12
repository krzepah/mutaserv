import createStore from 'stockroom/worker';
import createSync from 'mutasync';
import { merge, concat } from 'ramda';

const defaults = {
	count: 0,
	elements: {},
	elementsIds: []
};

const store = createStore(defaults);
const sync = createSync('http://localhost:8000', defaults);

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
