import React from 'react'
import { Rx } from 'tom'
import t from 'tcomb'

// events
const IncrementRequest = t.struct({})
IncrementRequest.prototype.update = function(model) {
  return { model, effect: IncrementEffect({}) }
}
const Increment = t.struct({})
Increment.prototype.update = function(model) {
  return { model: model + 1 }
}
const DecrementRequest = t.struct({})
DecrementRequest.prototype.update = function(model) {
  return { model, effect: DecrementEffect({}) }
}
const Decrement = t.struct({})
Decrement.prototype.update = function(model) {
  return { model: model - 1 }
}
// effects
const IncrementEffect = t.struct({})
IncrementEffect.prototype.run = function() {
  return Rx.Observable.just(Increment({})).delay(1000)
}
const DecrementEffect = t.struct({})
DecrementEffect.prototype.run = function() {
  return Rx.Observable.just(Decrement({})).delay(1000)
}
const Effect = t.union([IncrementEffect, DecrementEffect])
// state
const Integer = t.refinement(t.Number, n => n % 1 === 0)
const State = t.struct({
  model: Integer,
  effect: t.maybe(Effect)
})

export default {

  init() {
    return State({ model: 0 })
  },

  update(model, event) {
    if (t.Function.is(event.update)) {
      return State(event.update(model))
    }
    return State({ model })
  },

  view(model, dispatch) {
    const increment = () => dispatch(IncrementRequest({}))
    const decrement = () => dispatch(DecrementRequest({}))
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  },

  run(effect) {
    if (t.Function.is(effect.run)) {
      return effect.run()
    }
  }

}
