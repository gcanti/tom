import React from 'react'

export default {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENT_REQUESTED' :
      return { model: model + 1 }
    case 'DECREMENT_REQUESTED' :
      return { model: model - 1 }
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
  }

}
