import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";
import { create } from "../../core/create"; // Adjust the import path according to your project structure
import { useStore } from "./";

describe("useStore", () => {
  it("should return initial state immediately", () => {
    const initialStore = create(0);
    const { result } = renderHook(() => useStore(initialStore));

    expect(result.current).toBe(0);
  });

  it("should return updated state after actions", () => {
    const counter = create(0, (unwrap) => ({
      increment: () => unwrap() + 1,
    }));

    const { result } = renderHook(() => useStore(counter));

    act(() => {
      counter.increment();
    });

    expect(result.current).toBe(1);
  });

  it("should handle asynchronous initialization", async () => {
    const asyncStore = create<number>(
      () => new Promise((resolve) => setTimeout(() => resolve(10), 100))
    );

    const { result, waitForNextUpdate } = renderHook(() => {
      const value = useStore(asyncStore);
      return value;
    });

    expect(result.current).toBe(undefined);

    await waitForNextUpdate();

    expect(result.current).toBe(10);
  });

  it("should increment an asynchronous store", async () => {
    const asyncStore = create(
      (): Promise<number> =>
        new Promise((resolve) => setTimeout(() => resolve(10), 100)),
      (unwrap) => ({
        increment: () => unwrap() + 1,
      })
    );

    const { result, waitForNextUpdate } = renderHook(() => {
      const value = useStore(asyncStore);
      return value;
    });

    expect(result.current).toBe(undefined);

    await waitForNextUpdate();

    expect(result.current).toBe(10);
  });
});
