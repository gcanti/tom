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
        return { model, effect: 'DELAYED_INCREMENT' } // effects are just declared
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

The example above has several issues:

- when your app grows, `update`, `view` and `run` will become giant functions
- events and effects are not typed ("string programming"). The usual solution is to add constants and action creators (even more boilerplate)
- state is not type safe: `model` is actually **an integer** and this invariant should be enforced
- using `switch`s in `update` and `run` violates the open close principle

To address this issues you can build a your own framework on top of `tom`. Here I'll use [tcomb](https://github.com/gcanti/tcomb) in order to reduce the boilerplate and adding type safety (alternatively you can use tools like TypeScript or Flow):

```js
import React from 'react'
import { Rx } from 'tom'
import t from 'tcomb'

// events
const IncrementRequest = t.struct({})
const Increment = t.struct({})
const DecrementRequest = t.struct({})
const Decrement = t.struct({})
// effects
const IncrementEffect = t.struct({})
const DecrementEffect = t.struct({})
const Effect = t.union([IncrementEffect, DecrementEffect])
// state
const Integer = t.refinement(t.Number, n => n % 1 === 0)
const State = t.struct({
  model: Integer,
  effect: t.maybe(Effect)
})

export default {

  init() {
    // invoking the State constructor adds (runtime) type safety
    return State({ model: 0 })
  },

  update(model, event) {
    // events have different constructors, here I can use pattern matching
    return t.match(event,
      Increment, () => State({ model: model + 1 }),
      Decrement, () => State({ model: model - 1 }),
      IncrementRequest, () => State({ model, effect: IncrementEffect({}) }),
      DecrementRequest, () => State({ model, effect: DecrementEffect({}) }),
      t.Any, () => State({ model })
    )
  },

  view(model, dispatch) {
    // no need of specifying a type field, the constructor is enough
    const increment = () => dispatch(IncrementRequest({}))
    const decrement = () => dispatch(DecrementRequest({}))
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  },

  run(effect) {
    // effects have different constructors, here I can use pattern matching
    return t.match(effect,
      IncrementEffect, () => Rx.Observable.just(Increment({})).delay(1000),
      DecrementEffect, () => Rx.Observable.just(Decrement({})).delay(1000)
    )
  }

}
```

Since events and effects have different constructors you could address the last issue leveraging a kind of dynamic dispatching:

```js
IncrementRequest.prototype.update = function(model) {
  return { model, effect: IncrementEffect({}) }
}
Increment.prototype.update = function(model) {
  return { model: model + 1 }
}
DecrementRequest.prototype.update = function(model) {
  return { model, effect: DecrementEffect({}) }
}
Decrement.prototype.update = function(model) {
  return { model: model - 1 }
}
IncrementEffect.prototype.run = function() {
  return Rx.Observable.just(Increment({})).delay(1000)
}
DecrementEffect.prototype.run = function() {
  return Rx.Observable.just(Decrement({})).delay(1000)
}

...

update(model, event) {
  if (t.Function.is(event.update)) {
    return State(event.update(model))
  }
  return State({ model })
}

...

run(effect) {
  if (t.Function.is(effect.run)) {
    return effect.run()
  }
}
```

Note how much general are now the `update` and `run` functions.

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
- [Runtime type checking (tcomb + dynamic dispatching)](examples/typed-counter-tcomb-dynamic-dispatching.js)
- [Static type checking (flow)](examples/typed-counter-flow.js)
- [Static type checking (typescript)](examples/typed-counter-typescript.tsx)

## Apps as react components

- [reactify](reactify.js)