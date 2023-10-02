import { Channel, channel } from "../channel/channel";
import { Unwrappable } from "../types";

export interface SyncStore<T> extends Channel<T>, Unwrappable<T> {
  type: "sync";
}

export interface AsyncStore<T>
  extends Channel<T>,
    Unwrappable<T>,
    PromiseLike<T> {
  type: "async";
}

type Actions<T> = {
  [K in keyof T]: (...args: any[]) => void;
};

/**
 * Store type definition.
 *
 * @template T The type of values that the store holds.
 * @template X Optional extension type.
 */
export type Store<T, X = {}> = SyncStore<T> & Actions<X>;

/**
 * Promise-like methods as a trait.
 */
export const promiseLikeTrait = {
  then<TResult1 = any, TResult2 = never>(
    this: AsyncStore<any>,
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const currentValue = this.unwrap();
    return Promise.resolve(currentValue);
  },
};

type ResolveHydrationType<T> = (value: T | PromiseLike<T>) => void;

/**
 * Creates a new store with an optional initial value.
 *
 * @template T - The type of values the store holds.
 * @param {T | (() => Promise<T>)} [init] - Optional initial value.
 * @returns {Store<T> | AsyncStore<T>} A store object.
 *
 * @example
 * // Create a basic store with an initial value
 * const myStore = create(10);
 *
 * @example
 * // Create an asynchronous store
 * const asyncStore = create(() => new Promise(resolve => setTimeout(() => resolve(10), 1000)));
 */
export function create<T, X = {}>(
  init: T,
  extensions?: X
): SyncStore<T> & Actions<X>;

export function create<T, X = {}>(
  init: () => Promise<T>,
  extensions?: X
): AsyncStore<T> & Actions<X>;

export function create<T, X = {}>(
  init: T | (() => Promise<T>),
  extensions?: X
): (SyncStore<T> & Actions<X>) | (AsyncStore<T> & Actions<X>) {
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

  const baseStore: Store<T> = {
    type: "sync",
    ...innerChannelFns,
    publish: (newValue: T) => {
      value = newValue;
      publish(newValue);
    },
    subscribe: (fn) => subscribeWrapper(fn),
    unwrap: () => value,
  };

  const asyncStore: AsyncStore<T> = {
    ...baseStore,
    type: "async",
    then: (onfulfilled, onrejected) => {
      return hydrationPromise.then(onfulfilled, onrejected);
    },
  };

  if (init instanceof Promise) {
    init.then((initialValue) => {
      asyncStore.publish(initialValue);
      resolveHydration(initialValue);
    });
    return asyncStore;
  } else if (typeof init === "function") {
    (init as () => Promise<T>)().then((initialValue: T) => {
      asyncStore.publish(initialValue);
      resolveHydration(initialValue);
    });
    return { ...asyncStore, ...extensions };
  } else {
    if (init !== undefined) {
      value = init;
      resolveHydration(init);
    }
    return { ...baseStore, ...extensions };
  }
}
