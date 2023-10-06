import { StoreLike } from "../create";
import { isPromiseLike } from "../utils";

type Action<T> = (currentValue: T, ...args: any[]) => T;

type ActionGenerator<T> = (...args: any[]) => Action<T>;

type Actions<T> = {
  [actionName: string]: ActionGenerator<T>;
};

type StoreWithActions<T, A extends Actions<T>> = StoreLike<T> & {
  [K in keyof A]: (...args: Parameters<A[K]>) => void;
};

export function actions<T, A extends Actions<T>>(
  store: StoreLike<T>,
  options: A
): StoreWithActions<T, A> {
  const newStore = { ...store };

  for (const [actionName, generator] of Object.entries(options)) {
    (newStore as any)[actionName] = (...args: any[]) => {
      const action = generator(...args);
      const currentValue = store.unwrap();

      if (isPromiseLike(currentValue)) {
        currentValue.then((resolvedValue) => {
          const newValue = action(resolvedValue);
          store.publish(newValue);
        });
      } else {
        const newValue = action(currentValue);
        store.publish(newValue);
      }
    };
  }

  return newStore as StoreWithActions<T, A>;
}
