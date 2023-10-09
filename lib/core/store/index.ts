import { Unwrappable } from "../@types";
import { Channel, channel } from "../channel";
import { isPromiseLike } from "../utils";

export type Actions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

export interface Store<T> extends Channel<T>, Unwrappable<T>, PromiseLike<T> {}

type ResolveHydrationType<T> = (value: T | PromiseLike<T>) => void;

/**
 * State type definition.
 *
 * @template T The type of values that the state holds.
 * @param {T | (() => T) | (() => Promise<T>)} init - Initial value.
 * @returns {Store<T>} An asynchronous store object.
 *
 * @example
 * // Create a basic state with an initial value
 * const myState = store(10);
 *
 * @example
 * // Create an asynchronous store
 * const asyncStore = store(() => new Promise(resolve => setTimeout(() => resolve(10), 1000)));
 */
export function store<T>(init: T | (() => T) | (() => Promise<T>)): Store<T> {
  let value: T;
  let resolveHydration: ResolveHydrationType<T> = () => {};

  const hydrationPromise = new Promise<T>((resolve) => {
    resolveHydration = resolve;
  });

  const innerChannel = channel<T>();
  const { publish, subscribe, ...innerChannelFns } = innerChannel;

  const subscribeWrapper = (fn: (value: T) => void) => {
    fn(value);
    return subscribe(fn);
  };

  const asyncStore: Store<T> = {
    ...innerChannelFns,
    publish: (newValue: T) => {
      value = newValue;
      publish(newValue);
    },
    subscribe: (fn) => subscribeWrapper(fn),
    unwrap: () => value,
    then: (onfulfilled, onrejected) => {
      return hydrationPromise.then(onfulfilled, onrejected);
    },
  };

  const initialize = (initializer: T | PromiseLike<T>) => {
    if (isPromiseLike(initializer)) {
      initializer.then((initialValue) => {
        asyncStore.publish(initialValue);
        resolveHydration(initialValue);
      });
    } else {
      asyncStore.publish(initializer);
      resolveHydration(initializer);
    }
  };

  if (typeof init === "function") {
    initialize((init as (() => T) | (() => Promise<T>))());
  } else {
    initialize(init);
  }

  return asyncStore;
}
