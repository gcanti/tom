import * as React from 'react'

declare class Observable<T> {
  subscribe(listener: (x: T) => void): void;
}

interface IState<Model, Effect> {
  model: Model;
  effect?: Effect;
}

type Dispatch<Event> = (event: Event) => void;

interface IConfig<Model, Effect, Event, View> {
  init: () => IState<Model, Effect>;
  update: (model: Model, event: Event) => IState<Model, Effect>;
  view: (model: Model, dispatch: Dispatch<Event>) => View;
  run?: (effect: Effect, event$: Observable<Event>) => ?Observable<Event>;
}

type Model = number;
type Event = 'INCREMENT' | 'DECREMENT';
type Effect = void;
type View = any;
type State = IState<Model, Effect>;
type Config = IConfig<Model, Effect, Event, View>;

const counter: Config = {

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
    const increment = () => dispatch('INCREMENT')
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
