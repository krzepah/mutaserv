
import { merge, filter, concat } from 'ramda';

/* These should be shared with the srv */
const mutations = {
  newElement: (state, {text, newId}) => ({
    elements: merge({
      [newId]: text
    }, state.elements),
    elementsIds: concat([newId], state.elementsIds)
  }),
  authenticate: (state, {...props}) => ({
    ...props,
    elements: merge(props.elements, state.elements),
    elementsIds: concat(state.elementsIds, props.elementsIds)
  }),
  logout: (state, {...defaults}) => ({...defaults})
}

/* Default store values should be shared with the srv as well*/
const defaults = {
  elements: { },
  elementsIds: [ ]
}

export {
    mutations,
    defaults
}
