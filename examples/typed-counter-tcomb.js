import React from 'react'
import { Rx } from 'tom'
import t from 'tcomb'

// events
const IncrementRequest = t.struct({})
const Increment = t.struct({})
const DecrementRequest = t.struct({})
const Decrement = t.struct({})
// effects
const IncrementEffect = t.struct({})
const DecrementEffect = t.struct({})
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
    return t.match(event,
      Increment, () => State({ model: model + 1 }),
      Decrement, () => State({ model: model - 1 }),
      IncrementRequest, () => State({ model, effect: IncrementEffect({}) }),
      DecrementRequest, () => State({ model, effect: DecrementEffect({}) }),
      t.Any, () => State({ model })
    )
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
    return t.match(effect,
      IncrementEffect, () => Rx.Observable.just(Increment({})).delay(1000),
      DecrementEffect, () => Rx.Observable.just(Decrement({})).delay(1000)
    )
  }

}