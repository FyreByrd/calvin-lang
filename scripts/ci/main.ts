import { permissionArgs, runCommands } from '@encode/ci/lib';

export async function main(): Promise<void> {
  const commonCommandOptions: Deno.CommandOptions = {
    stderr: 'piped',
    stdout: 'piped',
  };

  await runCommands([
    {
      name: 'Biome checks',
      args: [
        Deno.execPath(),
        {
          ...commonCommandOptions,
          args: ['run', ...permissionArgs('biome'), 'npm:@biomejs/biome', 'ci'],
        },
      ],
    },
    {
      name: 'Deno checks',
      args: [
        Deno.execPath(),
        {
          ...commonCommandOptions,
          args: ['check'],
        },
      ],
    },
    {
      name: 'Tests',
      args: [
        Deno.execPath(),
        {
          ...commonCommandOptions,
          args: ['test', ...permissionArgs(), '--coverage', '--shuffle'],
        },
      ],
    },
  ]);
}

if (import.meta.main) {
  await main();
}
