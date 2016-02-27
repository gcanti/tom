import React from 'react'
import t from 'tcomb'

// events
const Increment = t.struct({}, 'Increment')
Increment.prototype.update = function(model) {
  return { model: model + 1 }
}
const Decrement = t.struct({}, 'Decrement')
Decrement.prototype.update = function(model) {
  return { model: model - 0.5 } // this wil throw "[tcomb] Invalid value -0.5 supplied to State/model: Integer"
}
const Event = t.union([Increment, Decrement], 'Event')
// state
const Integer = t.refinement(t.Number, n => n % 1 === 0, 'Integer')
const State = t.struct({
  model: Integer,
  effect: t.Nil // no effects allowed
}, 'State')

export default {

  init() {
    return State({ model: 0 })
  },

  update(model, event) {
    return State(Event(event).update(model))
  },

  view(model, dispatch) {
    const increment = () => dispatch(Increment({}))
    const decrement = () => dispatch(Decrement({}))
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  }

}
