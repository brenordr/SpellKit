import { Channel, channel } from "../channel/channel";
import { Unwrappable } from "../types";

/**
 * Store type definition.
 *
 * @template T The type of values that the store holds.
 * @template X Optional extension type.
 */
export type Store<T, X = {}> = Channel<T | PromiseLike<T>> &
  Unwrappable<T | PromiseLike<T>> &
  X;

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

export type AsyncStore<T> = Store<T> & PromiseLike<T>;

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
export function create<T>(init?: T): Store<T>;
export function create<T>(init?: () => Promise<T>): AsyncStore<T>;
export function create<T>(
  init?: T | (() => Promise<T>)
): Store<T> | AsyncStore<T> {
  let value: T;
  let resolveHydration: ResolveHydrationType<T> = () => {};

  const hydrationPromise = new Promise<T>((resolve) => {
    resolveHydration = resolve;
  });

  const innerChannel = channel<T>();
  const { publish, subscribe, ...innerChannelFns } = innerChannel;

  const subscribeWrapper = (fn: (value: T) => void, value: T) => {
    fn(value);
    return subscribe(fn);
  };

  const baseStore: Store<T> = {
    ...innerChannelFns,
    publish: (newValue: T | PromiseLike<T>) => {
      if (typeof newValue === "object" && newValue && "then" in newValue) {
        (newValue as PromiseLike<T>).then((resolvedValue: T) => {
          value = resolvedValue;
          publish(resolvedValue);
        });
      } else {
        value = newValue as T;
        publish(newValue as T);
      }
    },
    subscribe: (fn) => subscribeWrapper(fn, value),
    unwrap: () => value,
    ...promiseLikeTrait,
  };

  const asyncStore: AsyncStore<T> = {
    ...baseStore,
    then: (onfulfilled, onrejected) => {
      return hydrationPromise.then(onfulfilled, onrejected);
    },
  };

  if (typeof init === "function") {
    const initFn = init as () => Promise<T>;
    initFn().then((initialValue: T) => {
      asyncStore.publish(initialValue);
      resolveHydration(initialValue);
    });
    return asyncStore;
  } else {
    if (init !== undefined) {
      value = init;
      resolveHydration(init);
    }
    return baseStore;
  }
}
