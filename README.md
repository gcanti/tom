# Setup

```sh
npm install tom --save
```

# Features

- Elmish architecture
- Handles side effects in a declarative way
- Models, events and effects may be (static or runtime) type-checked
- Events are not required to be plain objects nor require a type field

# Workflow

## App configuration

Define an object `config` with the following keys:

**init**. a function returning the initial state (a *state* is an object with a required key `model` and an optional key `effect`).

**update**. a `update(model, event)` pure function, returns the new state.

**view**. a `view(model, dispatch)` pure function, returns the ui declaration.

**run** (optional). a `run(effect, event$)` function, returns an optional stream of events.

## Start the app

Call the `start(config)` API

# Typings

```js
interface IState<Model, Effect> {
  model: Model;
  effect?: Effect;
}

interface IConfig<Model, Effect, Event, View> {
  init: () => IState<Model, Effect>;
  update: (model: Model, event: Event) => IState<Model, Effect>;
  view: (model: Model, dispatch: (event: Event) => void) => View;
  run?: (effect: Effect, event$: Observable<Event>) => ?Observable<Event>;
}

interface IApp<Event, View> {
  dispatch: (event: Event) => void;
  view$: Observable<View>;
}

start<Model, Effect, Event, View>(config: IConfig<Model, Effect, Event, View>): IApp<Event, View>
```

# Example

**A delayed counter**. When the buttons are pressed the counter is updated after 1 sec.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { start, Rx } from 'tom'

const config = {

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
        return { model, effect: 'INCREMENT_EFFECT' } // effects are just declared
      case 'DECREMENT_REQUEST' :
        return { model, effect: 'DECREMENT_EFFECT' }
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

  // runs the side effects
  run(effect) {
    switch (effect) {
      case 'INCREMENT_EFFECT' :
         // effects may return an observable of events which will feed the system
        return Rx.Observable.just('INCREMENT').delay(1000)
      case 'DECREMENT_EFFECT' :
        return Rx.Observable.just('DECREMENT').delay(1000)
      }
  }

}

// start app
const { view$ } = start(config)
// render
view$.subscribe(view => ReactDOM.render(view, document.getElementById('app')))
```

# More examples

- [Basic (counter)](examples/counter.js)
- [How to handle effects (delayed counter)](examples/delayed-counter.js)
- [How to cancel effects (cancelable delayed counter)](examples/cancelable-delayed-counter.js)
- [Perpetual effects (clock)](examples/clock.js)
- [Http request](examples/http.js)
- [Routing (hand written)](examples/hand-written-router.js)
- [Routing (react-router)](examples/react-router.js)

## Type safety

- [Runtime type checking (tcomb)](examples/typed-counter-tcomb.js)
- [Static type checking (flow)](examples/typed-counter-flow.js)
- [Static type checking (typescript)](examples/typed-counter-typescript.tsx)

## Apps as react components

- [reactify](reactify.js)