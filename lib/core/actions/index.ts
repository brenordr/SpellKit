import { Store } from "../store";
import { isPromiseLike } from "../utils";

type Action<T> = (currentValue: T, ...args: any[]) => T;
type ActionGenerator<T> = (...args: any[]) => Action<T>;
type Actions<T> = { [actionName: string]: ActionGenerator<T> };

type StoreWithActions<T, A extends Actions<T>> = Store<T> & {
  [K in keyof A]: (...args: Parameters<A[K]>) => void;
};

export function actions<T, A extends Actions<T>>(
  store: Store<T>,
  options: A
): StoreWithActions<T, A> {
  const actionHandlers: Partial<Record<keyof A, (...args: any[]) => void>> = {};

  for (const [actionName, generator] of Object.entries(options)) {
    actionHandlers[actionName as keyof A] = async (...args: any[]) => {
      const action = generator(...args);
      const currentValue = store.unwrap();

      if (isPromiseLike(currentValue)) {
        const resolvedValue = await currentValue;
        const newValue = action(resolvedValue);
        store.publish(newValue);
      } else {
        const newValue = action(currentValue);
        store.publish(newValue);
      }
    };
  }

  return { ...store, ...actionHandlers } as StoreWithActions<T, A>;
}
