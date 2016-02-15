import { t, create, Rx } from '../../lib'

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

export const ConsoleEffect = t.struct({
  message: t.String
}, 'ConsoleEffect')

// toObservable :: Store -> Observable<Event>
ConsoleEffect.prototype.toObservable = function(/*store*/) {
  return Rx.Observable.of(null)
    .do(() => console.log(this.message)) // eslint-disable-line
}

export const DelayedConsoleEffect = t.struct({
  message: t.String
}, 'DelayedConsoleEffect')

DelayedConsoleEffect.prototype.toObservable = function() {
  return Rx.Observable.of(null)
    .delay(1000)
    .do(() => console.log(this.message)) // eslint-disable-line
}

// the Effect type is the union of all effects
const Effect = t.union([ConsoleEffect, DelayedConsoleEffect], 'Effect')

//
// define the Event type
//

const Increment = t.struct({
  step: PositiveInteger
}, 'Increment')

Increment.prototype.toPatch = function(state) {
  return {
    model: { $set: state.model + this.step },
    effect: { $set: ConsoleEffect({ message: `incremented by ${this.step}` }) }
  }
}

const Decrement = t.struct({
  step: PositiveInteger
}, 'Decrement')

Decrement.prototype.toPatch = function(state) {
  return {
    model: { $set: state.model - this.step },
    effect: { $set: DelayedConsoleEffect({ message: `decremented by ${this.step}` }) }
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
store.dispatch(Increment({ step: 1 })) // => incremented by 1, 1
store.dispatch(Increment({ step: 2 })) // => incremented by 2, 3
store.dispatch(Decrement({ step: 1 })) // => 2
// after 1000 millis => decremented by 1
