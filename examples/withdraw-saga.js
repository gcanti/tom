import React from 'react'
import { Rx } from 'tom'

const VALID_PIN = '123'
const PIN_VALIDATED = { type: 'PIN_VALIDATED' }
const INVALID_PIN = { type: 'INVALID_PIN' }
const PIN_REJECTED = { type: 'PIN_REJECTED' }

class ATM extends React.Component {
  onEnter = () => {
    this.props.onEnter(this.refs.pin.value)
  }
  render() {
    const { model } = this.props
    const canIEnterPin = !model.authFailure && !model.authorized
    return (
      <div>
        {canIEnterPin &&
          <div>
            <input ref="pin" />
            <button disabled={model.isValidating} onClick={this.onEnter}>pin</button>
          </div>
        }
        <p>{model.error && 'Invalid pin'}</p>
        <p>{model.authorized && 'Authorized :)'}</p>
        <p>{model.authFailure && 'Unauthorized :('}</p>
      </div>
    )
  }
}

export default {

  init() {
    return {
      model: {}
    }
  },

  update(model, event) {
    switch (event.type) {
    case 'PIN_ENTERED' :
      return {
        model: { isValidating: true },
        effect: { type: 'VALIDATE_PIN', pin: event.pin }
      }
    case PIN_VALIDATED.type :
      return {
        model: { authorized: true }
      }
    case INVALID_PIN.type :
      return {
        model: { error: true }
      }
    case PIN_REJECTED.type :
      return {
        model: { authFailure: true }
      }
    default :
      return { model }
    }
  },

  view(model, dispatch) {
    const onEnter = pin => dispatch({ type: 'PIN_ENTERED', pin })
    return <ATM model={model} onEnter={onEnter} />
  },

  run(effect, event$) {
    switch (effect.type) {
    case 'VALIDATE_PIN' :

      const nextEvent$ = Rx.Observable
        .just(effect.pin === VALID_PIN ? PIN_VALIDATED : INVALID_PIN)
        .delay(500) // fake validation delay

      const rejectPin$ = event$
        .concat(nextEvent$)
        .filter(e => e.type === INVALID_PIN.type)
        .bufferWithCount(3)
        .map(() => PIN_REJECTED)
        .take(1)

      return nextEvent$.merge(rejectPin$)
    }
  }

}
