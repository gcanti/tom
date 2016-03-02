/* eslint no-console:0 */

function logEvent(model, event, state) {
  console.groupCollapsed('event:', event)
  console.log('new state:', state)
  if (model !== state.model) {
    console.log('model: from', model, 'to', state.model)
  } else {
    console.log('model (not changed):', model)
  }
  console.log('effect:', state.effect)
  console.groupEnd()
}

function logEffect(effect, nextEvent$) {
  if (nextEvent$) {
    // group produced events
    console.groupCollapsed('effect:', effect)
    nextEvent$.subscribe(
      event => console.log('event:', event),
      error => console.error('error:', error),
      () => console.groupEnd()
    )
  } else {
    console.log(`effect:`, effect)
  }
}

export default function monitor(config) {
  return {
    init() {
      const init = config.init()
      console.log('init', init)
      return init
    },
    update(model, event) {
      const state = config.update(model, event)
      logEvent(model, event, state)
      return state
    },
    view: config.view,
    run(effect, event$) {
      const nextEvent$ = config.run(effect, event$)
      logEffect(effect, nextEvent$)
      return nextEvent$
    }
  }
}
