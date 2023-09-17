import { channel } from "../channel/channel";
import { Publishable, Subscribable, Unwrappable } from "../types";

export interface Store<T>
  extends Publishable<T>,
    Subscribable<T>,
    Unwrappable<T> {}

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

  innerChannel.subscribe((newValue) => {
    value = newValue;
  });

  const store: Store<T> = {
    ...innerChannel,
    unwrap: () => value,
  };

  return store as Store<T>;
}
