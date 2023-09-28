import { useEffect, useState } from "react";
import { Subscribable, Unwrappable } from "../core/types";

/**
 * React hook to interact with a given state. It provides reactivity to state changes
 * and returns the value of the state.
 *
 * @template T - The type of the state object.
 *
 * @param {Store<T>} state - The state to bind to.
 *
 * @returns {T} The value of the state.
 */
export function useStore<T>(state: Subscribable<T> & Unwrappable<T>): T {
  const [value, setValue] = useState<T>(state.unwrap());

  useEffect(() => {
    const unsubscribe = state.subscribe((newValue) => {
      setValue((prevValue) => {
        // Add equality check or deep equality if necessary
        if (prevValue !== newValue) {
          return newValue;
        }
        return prevValue;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [state]);

  return value;
}
