import { pickNextReason } from "./randomReason";

describe("pickNextReason", () => {
  it("never repeats a reason within one round", () => {
    let used: number[] = [];
    const seen: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const next = pickNextReason(5, used);
      seen.push(next.index);
      used = next.used;
    }
    expect(new Set(seen).size).toBe(5);
  });

  it("starts a new round without repeating the last reason", () => {
    const next = pickNextReason(3, [0, 1, 2], () => 0);
    expect(next.index).not.toBe(2);
    expect(next.used).toEqual([next.index]);
  });

  it("works with a single reason", () => {
    expect(pickNextReason(1, []).index).toBe(0);
    expect(pickNextReason(1, [0]).index).toBe(0);
  });

  it("returns -1 when there are no reasons", () => {
    expect(pickNextReason(0, []).index).toBe(-1);
  });

  it("stays in range even if rand returns 1", () => {
    expect(pickNextReason(4, [], () => 1).index).toBe(3);
  });
});
