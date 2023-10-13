import { Publishable, Subscribable, Subscriber } from "../@types";

export interface Channel<T> extends Publishable<T>, Subscribable<T> {
  close: () => void;
}

export const channel = <T>(): Channel<T> => {
  const subscribers = new Set<Subscriber<T>>();

  let closed = false;

  return {
    publish: (value: T) => {
      if (closed) {
        console.warn(`Attempted to publish to a closed channel`);
        return;
      }
      subscribers.forEach((fn) => fn(value));
    },

    subscribe: (fn: Subscriber<T>) => {
      if (closed) {
        throw new Error(`Cannot subscribe to a closed channel`);
      }

      subscribers.add(fn);

      return (): void => {
        subscribers.delete(fn);
      };
    },

    close: () => {
      closed = true;
      subscribers.clear();
    },
  };
};
