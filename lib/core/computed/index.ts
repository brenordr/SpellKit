import { Publishable } from "../@types";
import { StoreLike, create } from "../create";

export interface Computed<T> extends Omit<StoreLike<T>, keyof Publishable<T>> {}

export function computed<T, V>(a1: StoreLike<T>, fn: (v1: T) => V): Computed<V>;

export function computed<T, U, V>(
  a1: StoreLike<T>,
  a2: StoreLike<U>,
  fn: (v1: T, v2: U) => V
): Computed<V>;

export function computed<T, U, W, V>(
  a1: StoreLike<T>,
  a2: StoreLike<U>,
  a3: StoreLike<W>,
  fn: (v1: T, v2: U, v3: W) => V
): Computed<V>;

export function computed<T, U, W, X, V>(
  a1: StoreLike<T>,
  a2: StoreLike<U>,
  a3: StoreLike<W>,
  a4: StoreLike<X>,
  fn: (v1: T, v2: U, v3: W, v4: X) => V
): Computed<V>;

export function computed<T, U, W, X, Y, V>(
  a1: StoreLike<T>,
  a2: StoreLike<U>,
  a3: StoreLike<W>,
  a4: StoreLike<X>,
  a5: StoreLike<Y>,
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
  const stores: StoreLike<any>[] = args.slice(0, -1);
  const fn: (...values: any[]) => V = args[args.length - 1];

  const initialComputedValue = fn(...stores.map((store) => store.unwrap()));
  const computedStore = create<V>(initialComputedValue);

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

  const { publish, ...store } = computedStore;

  return store;
}
