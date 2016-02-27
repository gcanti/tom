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

A `tom` app is defined by a `config` object owning the following keys:

**init**. a function returning the initial state (a *state* is an object with a required key `model` and an optional key `effect`).

**update**. a `update(model, event)` pure function, returns the new state.

**view**. a `view(model, dispatch)` pure function, returns the ui declaration.

**run** (optional). a `run(effect, event$)` function, returns an optional stream of events.

## Wire them all

Call the `start(config)` API.

# Formal definitions

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
        return { model, effect: 'DELAYED_INCREMENT' } // here side effects are just declared
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

  // runs the side effects
  run(effect) {
    switch (effect) {
      case 'DELAYED_INCREMENT' :
         // effects may return an observable of events which will feed the system
        return Rx.Observable.just('INCREMENT').delay(1000)
      case 'DELAYED_DECREMENT' :
        return Rx.Observable.just('DECREMENT').delay(1000)
      }
  }

}

// start app
const { view$ } = start(config)
// render
view$.subscribe(view => ReactDOM.render(view, document.getElementById('app')))
```

# Reducing the boilerplate and adding type safety

When your app grows you will face several issues:

- `update`, `view` and `run` will become giant functions
- using `switch`s in `update` and `run` violates the open close principle
- events and effects are not typed ("string programming"). The usual solution is to define constants and action creators (even more boilerplate)
- state is not type safe: `model` is actually an integer and this invariant should be enforced

To address the first 2 issues let's replace the strings with constructors and get rid of `switch`s leveraging a kind of dynamic dispatch:

```js
// events
class IncrementRequest {
  update(model) {
    return { model, effect: new IncrementEffect() }
  }
}
class Increment {
  update(model) {
    return { model: model + 1 }
  }
}
class DecrementRequest {
  update(model) {
    return { model, effect: new DecrementEffect() }
  }
}
class Decrement {
  update(model) {
    return { model: model - 1 }
  }
}

// effects
class IncrementEffect {
  run() {
    return Rx.Observable.just(new Increment()).delay(1000)
  }
}
class DecrementEffect {
  run() {
    return Rx.Observable.just(new Decrement()).delay(1000)
  }
}

const framework = {

  update(model, event) {
    return event.update(model)
  },

  run(effect) {
    return effect.run()
  }

}

const config = {

  init() {
    return { model: 0 }
  },

  view(model, dispatch) {
    const increment = () => dispatch(new IncrementRequest())
    const decrement = () => dispatch(new DecrementRequest())
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  }

}

Object.assign(config, framework)
```

The `update` and `run` functions can now be reutilized across your apps.

## Adding type safety

Here I'll use [tcomb](https://github.com/gcanti/tcomb) to add runtime type checking to a simple counter (alternatively you can use other tools like TypeScript or Flow, see the "More examples" section below):

```js
import React from 'react'
import { Rx } from 'tom'
import t from 'tcomb'

// events
const Increment = t.struct({}, 'Increment')
Increment.prototype.update = function(model) {
  return { model: model + 1 }
}

const Decrement = t.struct({}, 'Decrement')
Decrement.prototype.update = function(model) {
  return { model: model - 0.5 } // this wil throw "[tcomb] Invalid value -0.5 supplied to State/model: Integer"
}

const Event = t.union([Increment, Decrement], 'Event')

// state
const Integer = t.refinement(t.Number, n => n % 1 === 0, 'Integer')
const State = t.struct({
  model: Integer,
  effect: t.Nil // no effects allowed
}, 'State')

const config = {

  init() {
    return State({ model: 0 })
  },

  update(model, event) {
    // type checking
    return State(Event(event).update(model))
  },

  view(model, dispatch) {
    const increment = () => dispatch(Increment({}))
    const decrement = () => dispatch(Decrement({}))
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  }

}
```

# More examples

- [A simple counter](examples/counter.js)
- [How to handle effects (delayed counter)](examples/delayed-counter.js)
- [How to reduce the boilerplate (dynamic dispatching)](examples/delayed-counter-dynamic-dispatching.js)
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