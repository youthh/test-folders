export interface ReasonPick {
  index: number;
  used: number[];
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * Вибирає випадкову причину так, щоб у межах одного кола жодна не
 * повторювалась. Коли показані всі — починається нове коло, але та сама
 * причина двічі поспіль не випадає (якщо причин більше однієї).
 * rand повертає число з [0, 1) — підміняється в тестах.
 */
export const pickNextReason = (
  total: number,
  used: number[],
  rand: () => number = Math.random,
): ReasonPick => {
  if (total <= 0) return { index: -1, used: [] };

  const choose = (pool: number[]) =>
    pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];

  const fresh = range(total).filter((i) => !used.includes(i));
  if (fresh.length > 0) {
    const index = choose(fresh);
    return { index, used: [...used, index] };
  }

  const last = used[used.length - 1];
  const others = range(total).filter((i) => i !== last);
  const index = choose(others.length > 0 ? others : [0]);
  return { index, used: [index] };
};
