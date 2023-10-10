import { Unwrappable } from "../@types";
import { Channel, channel } from "../channel";
import { isPromiseLike } from "../utils";

export interface Store<T> extends Channel<T>, Unwrappable<T>, PromiseLike<T> {}

export function store<T>(init: () => Promise<T>): Store<T>;
export function store<T>(init: () => T): Store<T>;
export function store<T>(init: T): Store<T>;
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
  let resolved = false;

  type ResolveHydrationType<T> = (value: T | PromiseLike<T>) => void;
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
      if (!resolved) {
        return hydrationPromise.then(onfulfilled, onrejected);
      }

      // TODO: This creates a fresh promise that returns the value. May not be ideal.
      // we can probably just return the value directly?
      return new Promise<T>((resolve) => {
        resolve(value);
      }).then(onfulfilled, onrejected);
    },
  };

  const initialize = (initializer: T | PromiseLike<T>) => {
    if (isPromiseLike(initializer)) {
      initializer.then((initialValue) => {
        asyncStore.publish(initialValue);
        resolveHydration(initialValue);
        resolved = true;
      });
    } else {
      asyncStore.publish(initializer);
      resolveHydration(initializer);
      resolved = true;
    }
  };

  if (typeof init === "function") {
    initialize((init as (() => T) | (() => Promise<T>))());
  } else {
    initialize(init);
  }

  return asyncStore;
}
