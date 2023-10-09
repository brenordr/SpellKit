import { Publishable } from "../@types";
import { Store, store } from "../store"; // Adjusted the import to match the renamed function

export interface Computed<T> extends Omit<Store<T>, keyof Publishable<T>> {}

export function computed<T, V>(a1: Store<T>, fn: (v1: T) => V): Computed<V>;

export function computed<T, U, V>(
  a1: Store<T>,
  a2: Store<U>,
  fn: (v1: T, v2: U) => V
): Computed<V>;

export function computed<T, U, W, V>(
  a1: Store<T>,
  a2: Store<U>,
  a3: Store<W>,
  fn: (v1: T, v2: U, v3: W) => V
): Computed<V>;

export function computed<T, U, W, X, V>(
  a1: Store<T>,
  a2: Store<U>,
  a3: Store<W>,
  a4: Store<X>,
  fn: (v1: T, v2: U, v3: W, v4: X) => V
): Computed<V>;

export function computed<T, U, W, X, Y, V>(
  a1: Store<T>,
  a2: Store<U>,
  a3: Store<W>,
  a4: Store<X>,
  a5: Store<Y>,
  fn: (v1: T, v2: U, v3: W, v4: X, v5: Y) => V
): Computed<V>;

export function computed<V>(...args: any[]): Computed<V> {
  const stores: Store<any>[] = args.slice(0, -1);
  const fn: (...values: any[]) => V = args[args.length - 1];

  const initialComputedValue = fn(...stores.map((store) => store.unwrap()));

  const computedStore = store<V>(initialComputedValue); // Renamed create to createStore to match the updated function name

  const computeValue = () => {
    const values = stores.map((store) => store.unwrap());
    return fn(...values);
  };

  const computeAndPublish = () => {
    const newValue = computeValue();
    computedStore.publish(newValue);
  };

  stores.forEach((store) => {
    store.subscribe(() => computeAndPublish());
  });

  const { publish, ...derivedStore } = computedStore;

  return derivedStore;
}
