import { CalvinLexer, CalvinParser, CalvinPrinter, Globals } from '@calvin-lang/parser/lib';
import { parseArgs } from '@std/cli/parse-args';
import { join, toFileUrl } from '@std/path';

export async function main(): Promise<void> {
  const {
    'debug-all': debugAll,
    'debug-scopes': debugScopes,
    'debug-trees': debugTrees,
    _,
  } = parseArgs(Deno.args, {
    boolean: ['debug-all', 'debug-scopes', 'debug-trees'],
    default: {
      'debug-all': false,
      'debug-scopes': false,
      'debug-trees': false,
    },
  });

  const inputFilePath = _.map((arg) => String(arg)).find((arg) => {
    return !arg.startsWith('-');
  });
  if (!inputFilePath) {
    throw new Error('No input file name was provided!');
  }

  Globals.debugAll = debugAll;
  Globals.debugScopes = debugScopes;
  Globals.debugTrees = debugTrees;

  const inputFile = await Deno.readTextFile(toFileUrl(join(Deno.cwd(), inputFilePath)));

  const parser = new CalvinParser();

  const printer = new CalvinPrinter();

  const lexingResult = CalvinLexer.tokenize(inputFile);
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;

  const output = parser.file();

  if (parser.errors.length > 0) {
    throw new AggregateError(
      parser.errors,
      'One or more errors occurred during the parsing phase!',
    );
  }

  printer.visit(output);
}

if (import.meta.main) {
  await main();
}
