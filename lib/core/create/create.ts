import { Channel, channel } from "../channel/channel";
import { Unwrappable } from "../types";

interface SvelteTrait<T> {
  update: (updater: (currentValue: T) => T) => void;
  set: (value: T) => void;
}

export interface Store<T>
  extends Channel<T>,
    Unwrappable<T>,
    PromiseLike<T>,
    SvelteTrait<T> {}

export const svelteTrait = {
  update(this: Store<any>, updater: (currentValue: any) => any) {
    const value = this.unwrap();
    const newValue = updater(value);
    this.publish(newValue);
  },

  set(this: Store<any>, value: any) {
    this.publish(value);
  },
};

export const promiseLikeTrait = {
  then(this: Store<any>, onfulfilled: any, onrejected: any) {
    onfulfilled(this.unwrap());
    return this;
  },
};

/**
 * Creates a new store (extends channel) with an initial value and optional actions.
 *
 * @template T - The type of values that the store will hold.
 * @template A - The type of actions that the store will contain.
 *
 * @param {T} initialValue - The initial value for the store.
 *
 * @returns {Store<T>} An object containing methods to `publish` new values, `subscribe` to changes,
 *                     `unwrap` to retrieve the current value.
 */
export function create<T>(initialValue: T): Store<T> {
  const innerChannel = channel<T>();
  let value = initialValue;

  const { publish, subscribe, ...innerChannelFns } = innerChannel;

  const store: Store<T> = {
    ...innerChannelFns,

    publish: (newValue) => {
      value = newValue;
      publish(newValue);
    },

    subscribe: (fn) => {
      fn(value);
      return subscribe(fn);
    },

    unwrap: () => value,

    ...svelteTrait,
    ...promiseLikeTrait,
  };

  return store as Store<T>;
}
