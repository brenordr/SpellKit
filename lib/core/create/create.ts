import { Channel, channel } from "../channel/channel";
import { Unwrappable } from "../types";

export type Actions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

export interface Store<T> extends Channel<T>, Unwrappable<T> {}
export interface AsyncStore<T> extends Store<T>, PromiseLike<T> {}

/**
 * Store type definition.
 *
 * @template T The type of values that the store holds.
 * @template X Optional extension type.
 */
export type StoreLike<T, X = {}> = (AsyncStore<T> | Store<T>) & Actions<X>;

export type ExtendedStore<T, X> = T extends (...args: any[]) => Promise<any>
  ? AsyncStore<T> & Actions<X>
  : Store<T> & Actions<X>;

type ResolveHydrationType<T> = (value: T | PromiseLike<T>) => void;

/**
 * Creates a new store with an optional initial value.
 *
 * @template T - The type of values the store holds.
 * @param {T | (() => Promise<T>)} [init] - Optional initial value.
 * @returns {StoreLike<T> | AsyncStore<T>} A store object.
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
  init: () => Promise<T>,
  extensions?: X
): AsyncStore<T> & Actions<X>;

export function create<T, X = {}>(
  init: T,
  extensions?: X
): Store<T> & Actions<X>;

export function create<T, X = {}>(
  init: T | (() => Promise<T>),
  extensions?: X
): ExtendedStore<T, X> {
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
    then: (onfulfilled, onrejected) => {
      return hydrationPromise.then(onfulfilled, onrejected);
    },
  };

  if (init instanceof Promise) {
    init.then((initialValue) => {
      asyncStore.publish(initialValue);
      resolveHydration(initialValue);
    });
    return asyncStore as ExtendedStore<T, X>;
  } else if (typeof init === "function") {
    (init as () => Promise<T>)().then((initialValue: T) => {
      asyncStore.publish(initialValue);
      resolveHydration(initialValue);
    });
    return { ...asyncStore, ...extensions } as ExtendedStore<T, X>;
  } else {
    if (init !== undefined) {
      value = init;
      resolveHydration(init);
    }
    return { ...baseStore, ...extensions } as ExtendedStore<T, X>;
  }
}
