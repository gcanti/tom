import React from 'react'
import { Rx } from 'tom'

function composeStates(x, y) {
  return {
    model: [x.model, y.model],
    effect: [x.effect, y.effect]
  }
}

function isNotNil(x) {
  return x !== null && x !== undefined
}

const empty = Rx.Observable.just(null)

// apps as groupoid
export default function compose(x, y) {
  return {

    init() {
      return composeStates(x.init(), y.init())
    },

    update([mx, my], [ex, ey]) {
      return composeStates(
        ex ? x.update(mx, ex) : { model: mx },
        ey ? y.update(my, ey) : { model: my }
      )
    },

    view([mx, my], dispatch) {
      const dispatchx = event => dispatch([event])
      const dispatchy = event => dispatch([null, event])
      return (
        <div>
          {x.view(mx, dispatchx)}
          {y.view(my, dispatchy)}
        </div>
      )
    },

    run([effx, effy], event$) {
      const nextEvent0$ = effx && x.run ? x.run(effx, event$.pluck('0').filter(isNotNil)) : null
      const nextEvent1$ = effy && y.run ? y.run(effy, event$.pluck('1').filter(isNotNil)) : null
      if (nextEvent0$ || nextEvent1$) {
        return Rx.Observable.zip(nextEvent0$ || empty, nextEvent1$ || empty)
      }
    }

  }
}
