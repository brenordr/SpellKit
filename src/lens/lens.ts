import { Store, promiseLikeTrait, svelteTrait } from "../create/create";
import { Unsubscriber } from "../types";

type LensGet<T, P> = (state: T) => P;
type LensSet<T, P> = (state: T, part: P) => T;

interface LensOptions<T, P> {
  get: LensGet<T, P>;
  set: LensSet<T, P>;
}

export function lens<T, P>(
  store: Store<T>,
  options: LensOptions<T, P>
): Store<P> {
  const { get, set } = options;

  function subscribe(fn: (value: P) => void): Unsubscriber {
    // Subscribe to the original store and apply the lens getter
    return store.subscribe((newState) => {
      fn(get(newState));
    });
  }

  function publish(newPart: P): void {
    // Get the current state, apply the lens setter, and publish to the original store
    const currentState = store.unwrap();
    const newState = set(currentState, newPart);
    store.publish(newState);
  }

  const unwrap = (): P => {
    // Unwrap the current state and apply the lens getter
    return get(store.unwrap());
  };
  // Create the lens store
  return {
    ...store,
    publish,
    subscribe,
    unwrap,

    ...svelteTrait,
    ...promiseLikeTrait,
  } satisfies Store<P>;
}
