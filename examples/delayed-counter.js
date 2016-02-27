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
    default :
      return { model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch('INCREMENT_REQUEST')
    const decrement = () => dispatch('DECREMENT_REQUEST')
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
    case 'DELAYED_INCREMENT' :
      return Rx.Observable.just('INCREMENT').delay(1000)
    case 'DELAYED_DECREMENT' :
      return Rx.Observable.just('DECREMENT').delay(1000)
    }
  }

}
