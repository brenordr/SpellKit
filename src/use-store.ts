import { useEffect, useState } from "react";
import { Store } from "./create/create";
import { proxy } from "./proxy/proxy";

/**
 * React hook to interact with a given state. It provides reactivity to state changes
 * and returns a proxy object that can be used to read and update the state.
 *
 * @template T - The type of the state object.
 *
 * @param {Store<T>} state - The state to bind to.
 *
 * @returns {T} A proxy object for the state.
 */
export function useStore<T extends object>(state: Store<T>): T {
  // Local state to hold the current value of the store
  const [_, setCurrentValue] = useState<T>(state.unwrap());

  useEffect(() => {
    // Subscribe to changes in the store
    const unsubscribe = state.subscribe((newValue) => {
      setCurrentValue(newValue);
    });

    // Cleanup the subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [state]);

  // Return a proxy that interacts with the store
  return proxy(state);
}
