import { permissionArgs, runCommands } from '@encode/ci/lib';

export async function main(): Promise<void> {
  await runCommands([
    {
      name: 'Biome checks',
      args: [
        Deno.execPath(),
        {
          args: ['run', ...permissionArgs('biome'), 'npm:@biomejs/biome', 'ci'],
          stderr: 'piped',
          stdout: 'piped',
        },
      ],
    },
    {
      name: 'Deno checks',
      args: [
        Deno.execPath(),
        {
          args: ['check'],
          stderr: 'piped',
          stdout: 'piped',
        },
      ],
    },
    {
      name: 'Tests',
      args: [
        Deno.execPath(),
        {
          args: ['test', ...permissionArgs(), '--coverage', '--shuffle'],
          stderr: 'piped',
          stdout: 'piped',
        },
      ],
    },
  ]);
}

if (import.meta.main) {
  await main();
}
