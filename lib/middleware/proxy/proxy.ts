import { Store } from "../../core/create/create";

/**
 * Creates a proxy object for a given store. Reading properties from the proxy
 * will unwrap the store's value, and setting properties will publish a new store.
 *
 * @template T - The type of the store object.
 *
 * @param {Store<T>} store - The store to create a proxy for.
 *
 * @returns {T} A proxy object for the store.
 */
export function proxy<T extends object>(store: Store<T>): T {
  return new Proxy<T>({} as T, {
    get: (_, property) => {
      const value = store.unwrap();
      return (value as any)[property];
    },
    set: (_, property, newValue) => {
      const currentValue = store.unwrap();
      const updatedValue = {
        ...(currentValue as any),
        [property]: newValue,
      };
      store.publish(updatedValue);
      return true;
    },
  });
}
