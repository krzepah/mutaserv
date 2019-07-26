
module.exports = ({ merge, concat }) => ({
	mutations: {
		newElement: (state, { text, newId }) => ({
			elements: merge({
				[newId]: text
			}, state.elements),
			elementsIds: concat([newId], state.elementsIds)
		}),
		authenticate: (state, { ...props }) => ({
			...props,
			elements: merge(props.elements, state.elements),
			elementsIds: concat(state.elementsIds, props.elementsIds)
		}),
		logout: (state, { ...defaults }) => ({ ...defaults })
	},
	defaults: {
		elements: { },
		elementsIds: []
	}
});
