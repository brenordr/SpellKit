import { Store, create } from "../create/create";
import { Publishable } from "../types";

export interface Computed<T> extends Omit<Store<T>, keyof Publishable<T>> {}

export function computed<T, U, V>(
  a1: Store<T> | Computed<T>,
  a2: Store<U> | Computed<U>,
  fn: (v1: T, v2: U) => V
): Computed<V>;

export function computed<T, U, W, V>(
  a1: Store<T> | Computed<T>,
  a2: Store<U> | Computed<U>,
  a3: Store<W> | Computed<W>,
  fn: (v1: T, v2: U, v3: W) => V
): Computed<V>;

export function computed<T, U, W, X, V>(
  a1: Store<T> | Computed<T>,
  a2: Store<U> | Computed<U>,
  a3: Store<W> | Computed<W>,
  a4: Store<X> | Computed<X>,
  fn: (v1: T, v2: U, v3: W, v4: X) => V
): Computed<V>;

export function computed<T, U, W, X, Y, V>(
  a1: Store<T> | Computed<T>,
  a2: Store<U> | Computed<U>,
  a3: Store<W> | Computed<W>,
  a4: Store<X> | Computed<X>,
  a5: Store<Y> | Computed<Y>,
  fn: (v1: T, v2: U, v3: W, v4: X, v5: Y) => V
): Computed<V>;

/**
 * Creates a new computed store based on other stores or computed values.
 *
 * @template V - The type of the computed value.
 *
 * @param {...args} args - A list of parent stores or computed values followed by a computing function.
 *                         The computing function should take values from the parent stores as arguments
 *                         and return the computed value.
 *
 * @returns {Computed<V>} An object containing methods to `subscribe` to changes in the computed value,
 *                         and `unwrap` to retrieve the current value.
 */
export function computed<V>(...args: any[]): Computed<V> {
  const stores: (Store<any> | Computed<any>)[] = args.slice(0, -1);
  const fn: (...values: any[]) => V = args[args.length - 1];

  // Compute the initial value for the computed store
  const initialComputedValue = fn(...stores.map((store) => store.unwrap()));
  const computedStore = create<V>(initialComputedValue);

  // The function to compute the value based on the current store of its dependencies
  const computeValue = () => {
    const values = stores.map((store) => store.unwrap());
    return fn(...values);
  };

  const computeAndPublish = () => {
    const newValue = computeValue();
    computedStore.publish(newValue);
  };

  // Subscribe to all parent stores
  stores.forEach((store) => {
    store.subscribe(() => computeAndPublish());
  });

  const { publish, ...store } = computedStore;

  return store;
}
