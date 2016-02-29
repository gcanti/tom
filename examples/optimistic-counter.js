import React from 'react'
import { Rx } from 'tom'

const fakeApi = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('invalid counter'))
  }, 1000)
})

export default {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event.type) {
    case 'INCREMENT_REQUEST' :
      const newModel = model + 1
      return {
        model: newModel,
        effect: { type: 'TRANSACTION', model }
      }
    case 'ROLLBACK' :
      return { model: event.model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch({ type: 'INCREMENT_REQUEST' })
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
      </div>
    )
  },

  run(effect, event$) {
    const rollback$ = event$
      .filter(e => e.type === 'ROLLBACK')
      .take(1)
    switch (effect.type) {
    case 'TRANSACTION' :
      return Rx.Observable.fromPromise(
        fakeApi().catch(() => ({ type: 'ROLLBACK', model: effect.model }))
      ).takeUntil(rollback$)
    }
  }

}
