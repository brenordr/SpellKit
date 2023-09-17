import { Store } from "../create/create";

type Action<T> = (currentValue: T, ...args: any[]) => T;

type ActionGenerator<T> = (...args: any[]) => Action<T>;

type Actions<T> = {
  [actionName: string]: ActionGenerator<T>;
};

type StoreWithActions<T, A extends Actions<T>> = Store<T> & {
  [K in keyof A]: (...args: Parameters<A[K]>) => void;
};

export function action<T, A extends Actions<T>>(
  store: Store<T>,
  actions: A
): StoreWithActions<T, A> {
  const newStore = { ...store };

  for (const [actionName, generator] of Object.entries(actions)) {
    (newStore as any)[actionName] = (...args: any[]) => {
      const action = generator(...args);
      const currentValue = store.unwrap();
      const newValue = action(currentValue);
      store.publish(newValue);
    };
  }

  return newStore as StoreWithActions<T, A>;
}
