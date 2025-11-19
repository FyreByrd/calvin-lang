import { notice } from '@actions/core';
import { bold } from '@std/fmt/colors';

export function main(): void {
  const msg = `This is a test run. ${bold('Everything is working ok!')}`;

  notice(msg, {
    title: 'Test run',
    file: import.meta.filename,
    startLine: 5,
    endLine: 12,
  });
}

if (import.meta.main) {
  main();
}
