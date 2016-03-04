type Observable<T> = {
  subscribe(listener: (x: T) => void): void;
};

type Dispatch<Event> = (event: Event) => void;

declare module 'tom' {

  declare type IState<Model, Effect> = {
    model: Model;
    effect?: Effect;
  };

  declare type IConfig<Model, Effect, Event, View> = {
    init: () => IState<Model, Effect>;
    update: (model: Model, event: Event) => IState<Model, Effect>;
    view: (model: Model, dispatch: Dispatch<Event>) => View;
    run?: (effect: Effect, event$: Observable<Event>) => ?Observable<Event>;
  };

  declare type IApp<Event, View> = {
    dispatch: Dispatch<Event>;
    view$: Observable<View>;
  };

  declare function start<Model, Effect, Event, View>(config: IConfig<Model, Effect, Event, View>): IApp<Event, View>;
  declare var Rx: {
    Observable: Observable<any>
  };

}