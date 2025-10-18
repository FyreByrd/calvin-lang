import { parser } from '@calvin-lang/parser/lib';
import { parseArgs } from '@std/cli/parse-args';
import { bold, yellow } from '@std/fmt/colors';
import { generateDiagrams, generateTypes } from './mod.ts';

// TODO - Add support for watching a file and its module graph. See https://jsr.io/@deno/graph for how to get a module graph from a file.

export async function main(): Promise<void> {
  const { diagrams, types } = parseArgs(Deno.args, {
    boolean: ['types', 'diagrams'],
    negatable: ['types', 'diagrams'],
    default: {
      types: false,
      diagrams: false,
    },
  });

  if (!(diagrams || types)) {
    const warningMsg = [
      `${yellow(bold('Configuration Error:'))} No outputs specified`,
      "Please specify at least one of the outputs you'd like to generate. You can generate diagrams or types",
    ].join('\n');

    console.warn(warningMsg);

    return;
  }

  /**
   * An {@linkcode AbortController} to listen for when the user attempts to terminate this script
   */
  const ctrl = new AbortController();

  /**
   * A signal listener that will only be active for the current scope, after which it will be
   * removed. This behavior is controlled by the semantics of the `using` keyword.
   */
  using _scopedListener = addScopedSignalListener('SIGTERM', () => {
    ctrl.abort(new Error('Termination requested'));
  });

  /**
   * The path to the workspace we intend to generate artifacts in. We use
   * `import.meta.resolve` to take advantage of the same resolution algorithm that's used
   * to import files. This means we don't have to hard-code the exact path, only what package
   * export point we want to use.
   */
  const workspacePath = new URL(import.meta.resolve('@calvin-lang/parser/lib'));

  /**
   * An array of tasks to perform in parallel
   */
  const tasks: Promise<void>[] = [];

  if (diagrams) {
    const generateDiagramsTask = generateDiagrams({
      outputPath: new URL('./generated/syntax-diagrams.html', workspacePath),
      parser,
      signal: ctrl.signal,
    });

    tasks.push(generateDiagramsTask);
  }

  if (types) {
    const generateTypesTask = generateTypes({
      outputPath: new URL('./generated/cst-types.ts', workspacePath),
      parser,
      signal: ctrl.signal,
    });

    tasks.push(generateTypesTask);
  }

  try {
    await Promise.all(tasks);
  } catch (err) {
    ctrl.abort(err);
    throw err;
  }
}

if (import.meta.main) {
  await main();
}

// Helpers

function addScopedSignalListener(signal: Deno.Signal, handler: () => void): Disposable {
  Deno.addSignalListener(signal, handler);

  return {
    [Symbol.dispose]() {
      Deno.removeSignalListener(signal, handler);
    },
  };
}
