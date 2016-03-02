import React from 'react'
import { Rx } from 'tom'

export default {

  init() {
    return {
      model: 0,
      effect: 'SCHEDULE_TICK' // start perpetual motion
    }
  },

  update(model, event) {
    switch (event) {
    case 'TICK' :
      return {
        model: model === 59 ? 0 : model + 1,
        effect: 'SCHEDULE_TICK'
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
    case 'SCHEDULE_TICK' :
      return Rx.Observable.just('TICK').delay(1000)
    }
  }

}
