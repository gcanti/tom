import React from 'react'
import { Rx } from 'tom'

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

export default config
