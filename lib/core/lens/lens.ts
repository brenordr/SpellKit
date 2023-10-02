import { Store, promiseLikeTrait } from "../create/create";
import { Unsubscriber } from "../types";
import { isPromiseLike } from "../utils";

/** Type definition for getting lensed part from the state */
type LensGet<T, P> = (state: T) => P;

/** Type definition for setting lensed part into the state */
type LensSet<T, P> = (state: T, part: P) => T;

/** Options interface for the lens function */
interface LensOptions<T, P> {
  get: LensGet<T, P>;
  set: LensSet<T, P>;
}

/**
 * Handle state unwrapping for both promise-like and immediate values.
 * @param state - The state to unwrap
 * @param callback - The function to call with the unwrapped state
 */
function unwrapState<T>(
  state: T | PromiseLike<T>,
  callback: (resolved: T) => void
) {
  if (isPromiseLike(state)) {
    state.then(callback);
  } else {
    callback(state);
  }
}

/**
 * Create a lens for a SpellKit store.
 * @param store - The original SpellKit store
 * @param options - Options for how to get and set lensed parts of the state
 * @returns A new lensed SpellKit store
 */
export function lens<T, P>(
  store: Store<T>,
  options: LensOptions<T, P>
): Store<P> {
  const { get, set } = options;

  /**
   * Subscribe to the lensed store.
   * @param fn - The subscriber function
   * @returns An unsubscriber function
   */
  function subscribe(fn: (value: P) => void): Unsubscriber {
    return store.subscribe((newState) =>
      unwrapState(newState, (resolvedState) => fn(get(resolvedState)))
    );
  }

  /**
   * Publish a new value to the lensed store.
   * @param newPart - The new part value or a promise of it
   */
  function publish(newPart: P): void {
    unwrapState(newPart, (resolvedPart) => {
      unwrapState(store.unwrap(), (resolvedState) => {
        const newState = set(resolvedState, resolvedPart);
        store.publish(newState);
      });
    });
  }

  /**
   * Unwrap the current state of the lensed store.
   * @returns The current state or a promise of it
   */
  function unwrap(): P {
    const currentState = store.unwrap();
    return get(currentState);
  }

  return {
    ...store,
    subscribe,
    publish,
    unwrap,
    ...promiseLikeTrait,
  };
}
