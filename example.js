
import { merge, concat } from 'ramda';

const mutations = {
	newElement: (state, { text, newId }) => ({
		elements: merge({
			[newId]: { text, id: newId }
		}, state.elements),
		elementsIds: concat([newId], state.elementsIds)
	}),
	authenticate: (state, { ...props }) => ({
		...props,
		elements: merge(props.elements, state.elements),
		elementsIds: concat(state.elementsIds, props.elementsIds)
	}),
	logout: (state, { ...defaults }) => ({ ...defaults })
};

const defaults = {
	elements: { },
	elementsIds: [ ]
};

export {
	mutations,
	defaults
};
