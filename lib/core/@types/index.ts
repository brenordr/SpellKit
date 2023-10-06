export type Subscriber<T> = (value: T) => void;

export type Unsubscriber = () => void;

export interface Publishable<T> {
  publish: (value: T) => void;
}

export interface Subscribable<T> {
  subscribe: (fn: Subscriber<T>) => Unsubscriber;
}

export interface Unwrappable<T> {
  unwrap: () => T;
}
