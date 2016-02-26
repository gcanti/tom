import React from 'react'
import { Rx } from 'tom'
import t from 'tcomb'

// typings
const Integer = t.refinement(t.Number, n => n % 1 === 0, 'Integer')
const Model = Integer

const Event = t.enums.of([
  'INCREMENT',
  'DECREMENT',
  'INCREMENT_REQUEST',
  'DECREMENT_REQUEST',
  'CANCEL'
], 'Event')

const Effect = t.enums.of([
  'INCREMENT_EFFECT',
  'DECREMENT_EFFECT'
], 'Effect')

const View = t.irreducible('View', React.isValidElement)

const State = t.struct({
  model: Model,
  effect: t.maybe(Effect)
}, 'State')

const counter = {

  init() {
    return State({ model: 0 })
  },

  // using babel-plugin-tcomb to enforce type safety
  update(model: Model, event: Event): State {
    switch (event) {
    case 'INCREMENT' :
      return State({ model: model + 1 })
    case 'DECREMENT' :
      return State({ model: model - 0.5 }) // this will throw "[tcomb] Invalid value 0.5 supplied to State/model: Integer"
    case 'INCREMENT_REQUEST' :
      return State({ model, effect: 'INCREMENT_EFFECT' })
    case 'DECREMENT_REQUEST' :
      return State({ model, effect: 'DECREMENT_EFFECT' })
    case 'CANCEL' :
      return State({ model })
    }
  },

  view(model: Model, dispatch: t.Function): View {
    const increment = () => dispatch('INCREMENT_REQUEST')
    const decrement = () => dispatch('DECREMENT_REQUEST')
    const cancel = () => dispatch('CANCEL')
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={cancel}>cancel</button>
      </div>
    )
  },

  run(effect: Effect, event$: t.Object): ?t.Object {
    const cancel$ = event$.filter(e => e === 'CANCEL')
    switch (effect) {
    case 'INCREMENT_EFFECT' :
      return Rx.Observable.just('INCREMENT').delay(2000).takeUntil(cancel$) // do not increment if a CANCEL event is emitted
    case 'DECREMENT_EFFECT' :
      return Rx.Observable.just('DECREMENT').delay(2000).takeUntil(cancel$)
    }
  }

}

export default counter