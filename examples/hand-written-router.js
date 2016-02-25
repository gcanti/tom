import React from 'react'
import { Rx } from 'tom'

function getCurrentPath() {
  return location.hash.substring(1)
}

const path = getCurrentPath()

const config = {

  init() {
    return {
      model: path,
      effect: path ? { type: 'INIT_EFFECT' } : { type: 'INIT_EFFECT', path: '/a' }
    }
  },

  update(model, event) {
    switch (event.type) {
    case 'ROUTING' :
      return {
        model: event.path
      }
    default :
      return { model }
    }
  },

  view(model) {
    switch (model) {
    case '' :
    case '/a' :
      return <A />
    case '/b' :
      return <B />
    }
  },

  run(effect) {
    switch (effect.type) {
    case 'INIT_EFFECT' :
      if (effect.path) {
        location.hash = `#${effect.path}`
      }
      return Rx.Observable.fromEvent(window, 'hashchange')
        .map(() => ({ type: 'ROUTING', path: getCurrentPath() }))
    }
  }

}

class A extends React.Component {
  render() {
    return (
      <div>
        <p>Current view: A</p>
        <a href="#/b">goto B</a>
      </div>
    )
  }
}

class B extends React.Component {
  render() {
    return (
      <div>
        <p>Current view: B</p>
        <a href="#/a">goto A</a>
      </div>
    )
  }
}

export default config
