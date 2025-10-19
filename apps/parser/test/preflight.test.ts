import { assert, assertEquals } from '@std/assert';

Deno.test('Preflight / Preliminary', async (t) => {
  await t.step('assert true', () => {
    assert(true);
  });

  await t.step('1 + 1 = 2', () => {
    assertEquals(1 + 1, 2);
  });
});

Deno.test('Preflight / Example module', async (t) => {
  await t.step('1 + 1 = 2', () => {
    assertEquals(add(1, 1), 2);
  });

  await t.step('5 * 5 = 25', () => {
    assertEquals(multiply(5, 5), 25);
  });

  // example.ts

  function add(a: number, b: number): number {
    return a + b;
  }

  function multiply(a: number, b: number): number {
    return a * b;
  }
});
