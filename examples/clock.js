import React from 'react'
import { Rx } from 'tom'

export default {

  init() {
    return {
      model: 0,
      effect: 'TICK' // start perpetual motion
    }
  },

  update(model, event) {
    switch (event) {
    case 'TICKED' :
      return {
        model: model === 59 ? 0 : model + 1,
        effect: 'TICK'
      }
    default :
      return { model }
    }
  },

  view(model) {
    return <div>Seconds Elapsed: {model}</div>
  },

  run(effect) {
    switch (effect) {
    case 'TICK' :
      return Rx.Observable.just('TICKED').delay(1000)
    }
  }

}
