import { error } from '@actions/core';
import { bold, red } from '@std/fmt/colors';

export interface CommandParams {
  name: string;
  args: ConstructorParameters<typeof Deno.Command>;
}

export async function runCommands(
  commandParams: Iterable<CommandParams, void, undefined>,
): Promise<void> {
  const processes = Array.from(commandParams, ({ name, args }) => {
    return { name, process: new Deno.Command(...args).spawn() };
  });

  for (const [idx, { name, process }] of processes.entries()) {
    await Promise.all([
      process.stderr.pipeTo(Deno.stderr.writable, { preventClose: true, preventAbort: true }),
      process.stdout.pipeTo(Deno.stdout.writable, { preventClose: true, preventAbort: true }),
    ]);

    if (!(await process.status).success) {
      console.log('\n');

      annotateError({ title: 'CI', message: `${name} failed!` });
    }

    if (idx !== processes.length - 1) {
      console.log(`\n${bold('-'.repeat(Deno.consoleSize().columns))}\n\n`);
    }
  }
}

export function isCI() {
  return Deno.env.get('CI') === 'true';
}

export function permissionArgs(permissionSetName?: string): string[] {
  return [permissionSetName ? `-P=${permissionSetName}` : '-P', '--no-prompt'];
}

interface Annotation {
  title: string;
  message: string;
}

function annotateError(annotation: Annotation): void {
  const { title, message } = annotation;

  if (isCI()) {
    error(red(message), { title });
  } else {
    console.error(`${bold(`${title}:`)} ${red(message)}`);
  }
}
