import { describe, expect, it, mock } from "bun:test";

import { computed } from "./computed/computed";
import { create } from "./create/create";

describe("computed", () => {
  it("computes value based on parent states", () => {
    const a1 = create<number>(0);
    const a2 = create<number>(0);

    const computedValue = computed(a1, a2, (v1, v2) => v1 + v2);

    a1.publish(2);
    a2.publish(3);

    expect(a1.unwrap()).toBe(2);
    expect(a2.unwrap()).toBe(3);
    expect(computedValue.unwrap()).toBe(5);
  });

  it("notifies subscribers when parent states change", () => {
    const a1 = create<number>(0);
    const a2 = create<string>("0");
    const mockFn = mock(() => {});

    const computedValue = computed(a1, a2, (v1, v2) => v1 + v2);

    computedValue.subscribe(mockFn);

    a1.publish(2);
    expect(mockFn).toHaveBeenCalled();

    a2.publish("x");
    expect(mockFn).toHaveBeenCalled();
  });

  it("toggle a derived boolean when parents call custom action", () => {
    // Example usage
    const darkMode = {
      ...create(false),
      toggle: () => {
        darkMode.publish(!darkMode.unwrap());
      },
    };

    const systemEnabled = {
      ...create(false),
      toggle: () => {
        systemEnabled.publish(!systemEnabled.unwrap());
      },
    };

    const lightMode = computed(darkMode, systemEnabled, (dark, system) => {
      return !dark && !system;
    });

    expect(lightMode.unwrap()).toBe(true);

    darkMode.toggle();
    expect(lightMode.unwrap()).toBe(false);

    systemEnabled.toggle();
    expect(lightMode.unwrap()).toBe(false);

    darkMode.toggle();
    expect(lightMode.unwrap()).toBe(false);
  });

  it("can be closed preventing further updates", () => {
    const a1 = create<number>(0);
    const a2 = create<string>("0");
    const mockFn = mock(() => {});

    const computedValue = computed(a1, a2, (v1, v2) => v1 + v2);

    computedValue.subscribe(mockFn);

    a1.publish(2);
    expect(mockFn).toHaveBeenCalled();

    computedValue.close();

    a2.publish("x");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
