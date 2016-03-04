/* @flow */
import React from 'react'
import type { IConfig } from 'tom'

type Model = number;
type Event = 'INCREMENT' | 'DECREMENT';
type Effect = void;
type View = any;

const counter: IConfig<Model, Effect, Event, View> = {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENT' :
      return { model: model + 1 }
    case 'DECREMENT' :
      return { model: model - 1 }
    default :
      return { model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch('INCREMEN')
    const decrement = () => dispatch('DECREMENT')
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
