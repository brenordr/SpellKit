import { useEffect, useState } from "react";
import { Subscribable, Unwrappable } from "../core/types";

/**
 * React hook to interact with a given state. It provides reactivity to state changes
 * and returns a proxy object that can be used to read and update the state.
 *
 * @template T - The type of the state object.
 *
 * @param {Store<T>} state - The state to bind to.
 *
 */
export function useStore<T>(state: Subscribable<T> & Unwrappable<T>): T {
  // Local state to hold the current value of the store

  const currState = state.unwrap();
  const [value, setValue] = useState<T>(currState);

  useEffect(() => {
    // Subscribe to changes in the store
    const unsubscribe = state.subscribe((newValue) => {
      setValue(newValue);
    });

    // Cleanup the subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [state, currState]);

  // Return a proxy that interacts with the store
  return value;
}
