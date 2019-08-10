import { merge, concat } from 'ramda';
import createStore from 'stockroom/worker';

let store = createStore({
	count: 0,
	elements: {},
	elementsIds: []
});

store.registerActions( store => ({
	increment: ({ count }) => ({ count: count + 1 })
}));

store.registerActions( store => ({
	newElement: ({ elements, elementsIds }, { text, newId }) => ({
		elementsIds: concat(elementsIds, [newId]),
		elements: merge(elements, { [newId]: { text, id: newId } })
	})
}));

export default store;
