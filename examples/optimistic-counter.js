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
    case 'INCREMENT_REQUESTED' :
      const newModel = model + 1
      return {
        model: newModel,
        effect: { type: 'BEGIN_TRANSACTION', model }
      }
    case 'TRANSACTION_ROLLEDBACK' :
      return { model: event.model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch({ type: 'INCREMENT_REQUESTED' })
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
      </div>
    )
  },

  run(effect, event$) {
    const rollback$ = event$
      .filter(e => e.type === 'TRANSACTION_ROLLEDBACK')
      .take(1)
    switch (effect.type) {
    case 'BEGIN_TRANSACTION' :
      return Rx.Observable.fromPromise(
        fakeApi().catch(() => ({ type: 'TRANSACTION_ROLLEDBACK', model: effect.model }))
      ).takeUntil(rollback$)
    }
  }

}
