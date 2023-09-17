import { Publishable, Subscribable } from "../types";

export interface Channel<T> extends Publishable<T>, Subscribable<T> {
  close: () => void;
  [Symbol.dispose]: () => void;
}

/**
 * Creates a new channel for publishing and subscribing to values.
 *
 * @template T - The type of values that will be published and received in the channel.
 *
 * @returns {Channel<T>} An object containing methods to `publish` values and `subscribe` to changes.
 */
export const channel = <T>(): Channel<T> => {
  const subscribers: Array<(value: T) => void> = [];
  let closed = false;

  return {
    publish: (value: T) => {
      if (closed) {
        console.warn(`Attempted to publish to a closed channel`);
        return;
      }
      subscribers.forEach((fn) => fn(value));
    },

    subscribe: (fn: (value: T) => void) => {
      if (closed) {
        throw new Error(`Cannot subscribe to a closed channel`);
      }

      subscribers.push(fn);

      return () => {
        const index = subscribers.indexOf(fn);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      };
    },

    close: () => {
      closed = true;
      subscribers.length = 0; // Clear the subscribers
    },

    [Symbol.dispose]() {
      this.close();
    },
  };
};
