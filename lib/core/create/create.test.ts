import { describe, expect, it } from "bun:test";
import { create } from ".";

describe("create", () => {
  it("should create a store and actions, and allow actions to modify the store", () => {
    const counter = create(0, (unwrap) => ({
      increment: () => unwrap() + 1,
      decrement: () => unwrap() - 1,
      add: (amount: number) => unwrap() + amount,
    }));

    counter.increment();
    expect(counter.unwrap()).toBe(1);

    counter.decrement();
    expect(counter.unwrap()).toBe(0);

    counter.add(5);
    expect(counter.unwrap()).toBe(5);
  });

  it("should allow actions with arguments", () => {
    const counter = create(0, (unwrap) => ({
      add: (amount: number) => unwrap() + amount,
    }));

    counter.add(5);
    expect(counter.unwrap()).toBe(5);

    counter.add(3);
    expect(counter.unwrap()).toBe(8);
  });

  it("should initialize the store with the correct value", () => {
    const initialStore = create(10, (unwrap) => ({}));
    expect(initialStore.unwrap()).toBe(10);
  });

  it("should support asynchronous initialization", async () => {
    const asyncStore = create<number>(
      () => new Promise((resolve) => setTimeout(() => resolve(10), 100))
    );
    await asyncStore; // Await the store to resolve
    expect(asyncStore.unwrap()).toBe(10);
  });

  it("should handle errors in actions gracefully", () => {
    const errorStore = create(0, () => ({
      throwError: () => {
        throw new Error("Test error");
      },
    }));
    expect(() => errorStore.throwError()).toThrow("Test error");
  });

  it("should use the return value of actions to update the store", () => {
    const mathStore = create(0, (unwrap) => ({
      increment: () => unwrap() + 1,
      multiply: (factor: number) => unwrap() * factor,
    }));

    mathStore.multiply(2);
    expect(mathStore.unwrap()).toBe(0); // 0 * 2 = 0

    mathStore.increment(); // Assuming increment action is defined
    mathStore.multiply(2);

    expect(mathStore.unwrap()).toBe(2); // 1 * 2 = 2
  });
});
