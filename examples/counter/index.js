import { t, create } from '../../lib'

// helper types
const Integer = t.refinement(t.Number, n => n % 1 === 0, 'Integer')
const PositiveInteger = t.refinement(Integer, n => n >= 0, 'PositiveInteger')

//
// define the Model type
//

const Model = Integer

//
// define the Effect type
//

const Effect = t.Nil // no side effects in this example

//
// define the Event type
//

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

//
// define the initial state
//

const initialState = {
  model: 0
}

//
// create the store
//

const store = create(Model, Event, Effect, initialState)

// play
store.subscribe(model => console.log(model))
store.dispatch(Increment({ step: 1 })) // => 1
store.dispatch(Increment({ step: 2 })) // => 3
store.dispatch(Decrement({ step: 1 })) // => 2

// events type-checking

// store.dispatch(Increment({ step: -1 })) // => throws [tcomb] Invalid value -1 supplied to Increment/step: PositiveInteger
// store.dispatch(Increment({ step: 'a' })) // => throws [tcomb] Invalid value "a" supplied to Increment/step: Number
// store.dispatch(1) // => throws [tcomb] Invalid value 1 supplied to Event (no constructor returned by dispatch)