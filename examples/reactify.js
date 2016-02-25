import React from 'react'
import ReactDOM from 'react-dom'
import { start } from 'tom'

const counter = {

  init() {
    return { model: 0 }
  },

  update(model, event) {
    switch (event) {
    case 'INCREMENT' :
      return { model: model + 1 }
    case 'DECREMENT' :
      return { model: model - 1 }
    default :
      return { model }
    }
  },

  view(model, dispatch) {
    const increment = () => dispatch('INCREMENT')
    const decrement = () => dispatch('DECREMENT')
    return (
      <div>
        <p>Counter: {model}</p>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
      </div>
    )
  }

}

function reactify(config) {
  return class RxComponent extends React.Component {

    app = start(config)
    state = {
      view: config.view(config.init.model, this.app.dispatch)
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
