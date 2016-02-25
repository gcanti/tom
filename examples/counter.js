import React from 'react'

const counter = {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENT_REQUEST' :
      return { model: model + 1 }
    case 'DECREMENT_REQUEST' :
      return { model: model - 1 }
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
  }

}

export default counter
