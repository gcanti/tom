import React from 'react'
import { Rx } from 'tom'

export default {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENTED' :
      return { model: model + 1 }
    case 'DECREMENTED' :
      return { model: model - 1 }
    case 'INCREMENT_REQUESTED' :
      return { model, effect: 'SCHEDULE_INCREMENT' }
    case 'DECREMENT_REQUESTED' :
      return { model, effect: 'SCHEDULE_DECREMENT' }
    default :
      return { model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch('INCREMENT_REQUESTED')
    const decrement = () => dispatch('DECREMENT_REQUESTED')
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  },

  run(effect) {
    switch (effect) {
    case 'SCHEDULE_INCREMENT' :
      return Rx.Observable.just('INCREMENTED').delay(1000)
    case 'SCHEDULE_DECREMENT' :
      return Rx.Observable.just('DECREMENTED').delay(1000)
    }
  }

}
