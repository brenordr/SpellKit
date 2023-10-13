import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";
import { actions, store } from "../../core";
import { useStore } from "./";

describe("useStore", () => {
  it("should return initial state immediately", () => {
    const initialStore = store(0);
    const { result } = renderHook(() => useStore(initialStore));

    expect(result.current).toBe(0);
  });

  it("should return updated state after actions", () => {
    const counter = store(0);

    const { increment } = actions(counter, (unwrap, publish) => ({
      increment: () => {
        publish(unwrap() + 1);
      },
    }));

    const { result } = renderHook(() => useStore(counter));

    act(() => {
      increment();
    });

    expect(result.current).toBe(1);
  });

  it("should handle asynchronous initialization", async () => {
    const asyncStore = store<number | undefined>(
      undefined,
      async (unwrap, publish) => {
        const value = await new Promise<number>((resolve) =>
          setTimeout(() => resolve(10), 100)
        );
        publish(value);
        return () => {};
      }
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
    const counter = store<number | undefined>(
      undefined,
      async (unwrap, publish) => {
        const value = await new Promise<number>((resolve) =>
          setTimeout(() => resolve(10), 100)
        );
        publish(value);
        return () => {};
      }
    );

    const { increment } = actions(counter, (unwrap, publish) => ({
      increment: () => {
        publish((unwrap() || 0) + 1);
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => {
      const value = useStore(counter);
      return value;
    });

    expect(result.current).toBe(undefined);

    await waitForNextUpdate();

    expect(result.current).toBe(10);

    act(() => {
      increment();
    });

    expect(result.current).toBe(11);
  });
});
