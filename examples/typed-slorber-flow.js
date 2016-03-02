/* @flow */
/* eslint-disable */
import React from 'react'
import compose from './compose'
import counter from './counter'

//
// typings
//

declare class Observable<T> {
  subscribe(listener: (x: T) => void): void;
}

interface IState<Model, Effect> {
  model: Model;
  effect?: ?Effect;
}

type Dispatch<Event> = (event: Event) => void;

interface IConfig<Model, Effect, Event, View> {
  init: () => IState<Model, Effect>;
  update: (model: Model, event: Event) => IState<Model, Effect>;
  view: (model: Model, dispatch: Dispatch<Event>) => View;
  run?: (effect: Effect, event$: Observable<Event>) => ?Observable<Event>;
}

// counter typings
type CounterModel = number;
type CounterEffect = void;
type CounterEvent = 'INCREMENT_REQUESTED' | 'DECREMENT_REQUESTED';
type CounterView = React.Element;

// these typings come from the `compose` function
type PairModel = [CounterModel, CounterModel];
type PairEffect = [?CounterEffect, ?CounterEffect];
type PairEvent = [?CounterEvent, ?CounterEvent];

// top component typings
type TopModel = {
  count: number;
  pair: PairModel;
};
type TopConfig = IConfig<TopModel, PairEffect, PairEvent, CounterView>;

//
// code
//

const pair: IConfig<PairModel, PairEffect, PairEvent, CounterView> = compose(counter, counter)

function findEvent(event: ?CounterEvent | PairEvent, predicate: (event: ?CounterEvent) => boolean): ?CounterEvent {
  if (Array.isArray(event)) {
    return findEvent(event[0], predicate) || findEvent(event[1], predicate)
  } else if (predicate(event)) {
    return event
  }
}

function isCounterEvent(event: ?CounterEvent): boolean {
  return event === 'INCREMENT_REQUESTED' || event === 'DECREMENT_REQUESTED'
}

function composeStates(count: number, state: IState<PairModel, PairEffect>): IState<TopModel, PairEffect> {
  return {
    model: {
      count,
      pair: state.model
    },
    effect: state.effect
  }
}

function getCount(count: number, event: ?CounterEvent): number {
  if (event === 'INCREMENT_REQUESTED' && count < 3) {
    return count + 1
  }
  if (event === 'DECREMENT_REQUESTED' && count > 0) {
    return count - 1
  }
  return count
}

const config: TopConfig = {

  init() {
    return composeStates(0, pair.init())
  },

  update(model, event) {
    return composeStates(
      getCount(model.count, findEvent(event, isCounterEvent)),
      pair.update(model.pair, event)
    )
  },

  view(model, dispatch) {
    return (
      <div>
        <p>Count: {model.count}</p>
        {pair.view(model.pair, dispatch)}
      </div>
    )
  },

  run(effect, event$) {
    if (typeof pair.run === 'function') {
      return pair.run(effect, event$)
    }
    return null
  }

}

export default config