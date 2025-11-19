import { notice } from '@actions/core';
import { bold } from '@std/fmt/colors';

export async function main(): Promise<void> {
  const ci = Deno.env.get('CI');

  if (ci) {
    console.log("We're in a CI environment!", { ci });
  } else {
    console.log(`We are ${bold('not')} in a CI environment!`);
  }
}

if (import.meta.main) {
  await main();
}
