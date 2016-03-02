import React from 'react'
import { Rx } from 'tom'

// events
class IncrementRequested {
  update(model) {
    return { model, effect: new ScheduleIncrement() }
  }
}

class Increment {
  update(model) {
    return { model: model + 1 }
  }
}

class DecrementRequested {
  update(model) {
    return { model, effect: new ScheduleDecrement() }
  }
}

class Decrement {
  update(model) {
    return { model: model - 1 }
  }
}

// effects
class ScheduleIncrement {
  run() {
    return Rx.Observable.just(new Increment()).delay(1000)
  }
}

class ScheduleDecrement {
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
    const increment = () => dispatch(new IncrementRequested())
    const decrement = () => dispatch(new DecrementRequested())
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

export default config
