import React from 'react'
import { Rx } from 'tom'

export default {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENT' :
      return { model: model + 1 }
    case 'DECREMENT' :
      return { model: model - 1 }
    case 'INCREMENT_REQUEST' :
      return { model, effect: 'DELAYED_INCREMENT' }
    case 'DECREMENT_REQUEST' :
      return { model, effect: 'DELAYED_DECREMENT' }
    case 'CANCEL' :
      return { model }
    default :
      return { model }
    }
  },

  view(model, dispatch) {
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

  run(effect, event$) {
    const cancel$ = event$.filter(e => e === 'CANCEL')
    switch (effect) {
    case 'DELAYED_INCREMENT' :
      return Rx.Observable.just('INCREMENT').delay(2000).takeUntil(cancel$) // do not increment if a CANCEL event is emitted
    case 'DELAYED_DECREMENT' :
      return Rx.Observable.just('DECREMENT').delay(2000).takeUntil(cancel$)
    }
  }

}
