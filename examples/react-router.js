import React from 'react'
import { Router, Route, Redirect } from 'react-router'
import { createHashHistory, useQueries } from 'history'

const history = useQueries(createHashHistory)({ queryKey: false })

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

const router = (
  <Router history={history}>
    <Route path="a" component={A}/>
    <Route path="b" component={B}/>
    <Redirect from="/" to="/a" />
  </Router>
)

export default {

  init() {
    return {}
  },

  update(model) {
    return { model }
  },

  view() {
    return router
  }

}

