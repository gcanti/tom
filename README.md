Type-safe store for unidirectional data flow.

This library relies on [tcomb](https://github.com/gcanti/tcomb) in order to implement type safety.

# Setup

```sh
npm install tom --save
```

# Differences from Redux

- implemented with rx.js
- handles side effects in a declarative way (*effects*)
- models, events and effects are type-checked
- events are not plain objects nor require a `type` field
- model changes are expressed in a declarative way (*patches*)
- listeners of `subscribe` are called with a `model` argument containing the current snapshot
- no `combineReducers`, events always handle the whole model

# Workflow

- define the `Model` type
- define the `Effect` type
- define the `Event` type
- define the `initialState` (initial model + initial effect)
- create the store with the `create` API

**The `Model` type**

```js
const Integer = t.refinement(t.Number, n => n % 1 === 0, 'Integer')
const Model = Integer
```

**The `Effect` type**

```js
const Effect = t.Nil // no side effects in this example (see the "How to handle effects" example below)
```

**The `Event` type**

```js
const PositiveInteger = t.refinement(Integer, n => n >= 0, 'PositiveInteger')

const Increment = t.struct({
  step: PositiveInteger
}, 'Increment')

// for each event define a toPatch() method returning a declarative patch to apply to the current state
// see tcomb's immutability helpers
Increment.prototype.toPatch = function(state) {
  return {
    model: { $set: state.model + this.step }
  }
}

const Decrement = t.struct({
  step: PositiveInteger
}, 'Decrement')

Decrement.prototype.toPatch = function(state) {
  return {
    model: { $set: state.model - this.step }
  }
}

// the Event type is the union of all events
const Event = t.union([Increment, Decrement], 'Event')
```

**The `initialState`**

```js
const initialState = {
  model: 0
}
```

**The store**

```js
const store = create(Model, Event, Effect, initialState)
```

Models, events and effects are type-checked:

```js
store.dispatch(Increment({ step: -1 })) // => throws [tcomb] Invalid value -1 supplied to Increment/step: PositiveInteger

store.dispatch(Increment({ step: 'a' })) // => throws [tcomb] Invalid value "a" supplied to Increment/step: Number

store.dispatch(1) // => throws [tcomb] Invalid value 1 supplied to Event (no constructor returned by dispatch)
```

# Built-in effects

- [HashHistoryEffect](lib/HashHistoryEffect.js)
- [ParallelEffect](lib/ParallelEffect.js)
- [SequenceEffect](lib/SequenceEffect.js)

# Examples

- [A type-checked counter](examples/counter/index.js)
- [How to handle effects](examples/effects/index.js)
