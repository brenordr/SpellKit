import { useEffect, useRef, useSyncExternalStore } from "react";
import { ReadableStore } from "../../core/store";
import { isPromiseLike } from "../../core/utils";

export function useStore<T>(state: ReadableStore<T>): T {
  let hydrated = useRef(false);

  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  useEffect(() => {
    if (isPromiseLike(state)) {
      state.then(() => {
        hydrated.current = true;
      });
    } else {
      hydrated.current = true;
    }
  }, [state]);

  return storeState;
}
