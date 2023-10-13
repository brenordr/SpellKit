import {
  Publishable,
  Subscribable,
  Unsubscriber,
  Unwrappable,
} from "../@types";
import { Channel, channel } from "../channel";
import { isFunction, isPromiseLike } from "../utils";

export interface Store<T> extends Channel<T>, Unwrappable<T>, PromiseLike<T> {}
export type ReadableStore<T> = Omit<Store<T>, keyof Publishable<T>>;
export type WritableStore<T> = ReadableStore<T> & Publishable<T>;

export type StoreInit<T> = (
  unwrap: Unwrappable<T>["unwrap"],
  publish: Publishable<T>["publish"],
  subscribe: Subscribable<T>["subscribe"]
) => Unsubscriber | Promise<Unsubscriber | void> | void;

export function store<T>(init: T | undefined): Store<T>;
export function store<T>(
  init: T | undefined,
  storeInit: StoreInit<T>
): Store<T>;

export function store<T>(
  init: T | undefined,
  storeInit?: StoreInit<T>
): Store<T> {
  let value: T;

  if (init !== undefined) {
    value = init;
  }

  let ready = false;
  let initPromise: Promise<T> | undefined;
  const innerChannel = channel<T>();
  const { publish, subscribe, ...innerChannelFns } = innerChannel;

  // When a store is subscribed it will always notify the subscriber of the current value
  // in comparison to a channel that will only notify the subscriber of new values after a subsequent publish call
  const subscribeAndNotify = (fn: (value: T) => void) => {
    fn(value);
    return subscribe(fn);
  };

  const then: Store<T>["then"] = (onfulfilled, onrejected) => {
    if (!ready && initPromise) {
      return initPromise.then(onfulfilled, onrejected);
    }

    return new Promise<T>((resolve) => {
      resolve(value);
    }).then(onfulfilled, onrejected);
  };

  const asyncStore: Store<T> = {
    ...innerChannelFns,
    unwrap: () => value,
    subscribe: (fn) => subscribeAndNotify(fn),
    publish: (newValue) => {
      value = newValue;
      publish(newValue);
    },
    then,
  };

  if (storeInit && isFunction(storeInit)) {
    const init = storeInit(
      asyncStore.unwrap,
      asyncStore.publish,
      asyncStore.subscribe
    );

    if (!isPromiseLike(init)) {
      ready = true;
    } else {
      initPromise = new Promise<T>((resolve) => {
        init.then((unsubscriber) => {
          ready = true;
          resolve(value);
        });
      });
    }
  } else {
    ready = true;
  }

  return asyncStore;
}
