import React from 'react'
import compose from './compose'
import counter from './counter'

const counters = compose(counter, compose(counter, counter))

function findEvent(event, predicate) {
  if (Array.isArray(event)) {
    return findEvent(event[0], predicate) || findEvent(event[1], predicate)
  } else if (predicate(event)) {
    return event
  }
}

function isCounterEvent(event) {
  return event === 'INCREMENT_REQUEST' || event === 'DECREMENT_REQUEST'
}

function composeStates(count, state) {
  return {
    model: {
      count,
      counters: state.model
    },
    effect: state.effect
  }
}

function getCount(count, event) {
  if (event === 'INCREMENT_REQUEST' && count < 3) {
    return count + 1
  }
  if (event === 'DECREMENT_REQUEST' && count > 0) {
    return count - 1
  }
  return count
}

export default {
  init() {
    return composeStates(0, counters.init())
  },
  update(model, event) {
    return composeStates(
      getCount(model.count, findEvent(event, isCounterEvent)),
      counters.update(model.counters, event)
    )
  },
  view(model, dispatch) {
    return (
      <div>
        <p>Count: {model.count}</p>
        {counters.view(model.counters, dispatch)}
      </div>
    )
  },
  run(effect, event$) {
    return counters.run(effect, event$)
  }
}