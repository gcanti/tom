import React from 'react'
import { Rx } from 'tom'

const fakeApi = {
  load() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('http://s3.amazonaws.com/giphygifs/media/ka1aeBvFCSLD2/giphy.gif')
        // reject(new Error('invalid gif'))
      }, 1000)
    })
  }
}

class Gif {

  constructor(api) {
    this.api = api
  }

  init() {
    return {
      model: {
        isLoading: false,
        src: null,
        error: null
      }
    }
  }

  update(model, event) {
    switch (event.type) {
    case 'LOAD_REQUESTED' :
      return {
        model: {
          isLoading: true,
          src: null,
          error: null
        },
        effect: 'SCHEDULE_LOAD'
      }
    case 'LOAD_SUCCEEDED' :
      return {
        model: {
          isLoading: false,
          src: event.src,
          error: null
        }
      }
    case 'LOAD_FAILED' :
      return {
        model: {
          isLoading: false,
          src: null,
          error: event.error
        }
      }
    default :
      return { model }
    }
  }

  view(model, dispatch) {
    const load = () => dispatch({ type: 'LOAD_REQUESTED' })
    const loadingMessage = model.isLoading ? <p>Loading...</p> : null
    const errorMessage = model.error ? <p>{model.error.message}</p> : null
    return (
      <div>
        {errorMessage}
        {loadingMessage}
        <img src={model.src} />
        <button disabled={model.isLoading} onClick={load}>load gif</button>
      </div>
    )
  }

  run(effect) {
    switch (effect) {
    case 'SCHEDULE_LOAD' :
      return Rx.Observable.fromPromise(
        this.api.load()
          .then(src => ({ type: 'LOAD_SUCCEEDED', src }))
          .catch(error => ({ type: 'LOAD_FAILED', error }))
      )
    }
  }

}

export default new Gif(fakeApi)
