import { beforeEach, describe, expect, test } from "bun:test";

import { lens } from ".";
import { create, StoreLike } from "../create";

describe("lens", () => {
  let store: StoreLike<{ name: string; age: number }>;
  let nameLens: StoreLike<string>;

  beforeEach(() => {
    store = create({ name: "John", age: 30 });

    nameLens = lens(store, {
      get: (state) => state.name,
      set: (state, name) => ({ ...state, name }),
    });
  });

  test("should initialize lens with correct part of the state", () => {
    expect(nameLens.unwrap()).toBe("John");
  });

  test("should update lens when original store is updated", () => {
    store.publish({ name: "Jane", age: 31 });
    expect(nameLens.unwrap()).toBe("Jane");
  });

  test("should update original store when lens is updated", () => {
    nameLens.publish("Jane");
    expect(store.unwrap()).toEqual({ name: "Jane", age: 30 });
  });

  test("should keep lens and original store in sync", () => {
    nameLens.publish("Jane");
    expect(nameLens.unwrap()).toBe("Jane");
    expect(store.unwrap()).toEqual({ name: "Jane", age: 30 });

    store.publish({ name: "Emily", age: 31 });
    expect(nameLens.unwrap()).toBe("Emily");
    expect(store.unwrap()).toEqual({ name: "Emily", age: 31 });
  });

  test("should close lens and unsubscribe from original store", () => {
    // This part depends on how you've implemented the "close" function
    nameLens.close();
    store.publish({ name: "Emily", age: 31 });
    // Add expectation to verify lens is closed and unsubscribed
  });
});
