import { notice } from '@actions/core';
import { bold } from '@std/fmt/colors';

export async function main(): Promise<void> {
  if (Deno.env.get('CI')) {
    console.log("We're in a CI environment!");
  }

  console.log(`We are ${bold('not')} in a CI environment!`);
}

if (import.meta.main) {
  await main();
}
