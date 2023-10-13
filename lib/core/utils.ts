export function isPromiseLike<T>(
  obj: T | PromiseLike<T>
): obj is PromiseLike<T> {
  return !!obj && typeof (obj as PromiseLike<T>).then === "function";
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}
