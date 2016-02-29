import React from 'react'
import ReactDOM from 'react-dom'
import { start } from 'tom'
import counter from './counter'

function reactify(config) {
  return class TomComponent extends React.Component {

    app = start(config)
    state = {
      view: config.view(config.init().model, this.app.dispatch)
    }

    componentDidMount() {
      this.subscription = this.app.view$
        .skip(1)
        .subscribe(view => this.setState({ view }))
    }

    componentWillUnmount() {
      // Clean-up subscription before un-mounting
      this.subscription.unsubscribe()
    }

    render() {
      return this.state.view
    }

  }
}

const Component = reactify(counter)
ReactDOM.render(<Component />, document.getElementById('app'))
