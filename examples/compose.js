import React from 'react'
import { Rx } from 'tom'

const composeStates = (x, y) => {
  return {
    model: [x.model, y.model],
    effect: [x.effect, y.effect]
  }
}
const empty = Rx.Observable.just(null)
const isNotNil = x => x !== null && x !== undefined

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
      const dispatch0 = event => dispatch([event])
      const dispatch1 = event => dispatch([null, event])
      return (
        <div>
          {x.view(mx, dispatch0)}
          {y.view(my, dispatch1)}
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
