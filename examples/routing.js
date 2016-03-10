import React from 'react'
import { Rx } from 'tom'

import { useQueries } from 'history'
import createHistory from 'history/lib/createHashHistory'
import Router from 'tom/lib/Router'

const history = useQueries(createHistory)({ queryKey: false })

const router = new Router([
  { path: '/', handler: ({ history: h }) => h.replace('/user?a=1') },
  { path: '/user', handler: request => <A request={request} /> },
  { path: '/orders/:orderId', handler: request => <B request={request} /> }
], history)

export default {

  init() {
    return {
      model: { location: history.createLocation(location.hash.substring(1)) },
      effect: { type: 'MOUNT_ROUTER' }
    }
  },

  update(model, event) {
    switch (event.type) {
    case 'ROUTING' :
      return {
        model: {
          location: event.location
        }
      }
    default :
      return { model }
    }
  },

  view(model) {
    return router.match(model.location)
  },

  run(effect) {
    switch (effect.type) {
    case 'MOUNT_ROUTER' :
      return Rx.Observable.create(observer => {
        history.listen(location => {
          observer.onNext({ type: 'ROUTING', location })
        })
      })
    }
  }

}

class A extends React.Component {
  render() {
    return (
      <div>
        <p>Current view: A</p>
        <pre>Request: {JSON.stringify(this.props.request, null, 2)}</pre>
        <a href="#/orders/123?b=2">goto B</a>
      </div>
    )
  }
}

class B extends React.Component {
  render() {
    return (
      <div>
        <p>Current view: B</p>
        <pre>Request: {JSON.stringify(this.props.request, null, 2)}</pre>
        <a href="#/user?a=1">goto A</a>
      </div>
    )
  }
}
