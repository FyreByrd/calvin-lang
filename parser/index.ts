import { readFileSync } from 'fs';
import { join } from 'path';
import { Globals } from './globals.js';
import { CalvinLexer } from './lexer.js';
import { error } from './logging.js';
import { CalvinParser } from './parser.js';
import { CalvinPrinter } from './printer.js';

const parser = new CalvinParser();

const printer = new CalvinPrinter();

function parseInput(text: string) {
  const lexingResult = CalvinLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;
  const output = parser.file();

  if (parser.errors.length > 0) {
    for (const err of parser.errors) {
      error(err.message);
    }
    throw Error();
  }

  printer.visit(output);
  //parser.scope.print();
}

const args = process.argv.slice(2);
const fileName = args.find((a) => !a.startsWith('-'));
if (!fileName) {
  throw Error('No file name provided');
}

const debugs = args.filter((a) => a.startsWith('--debug'));

Globals.debugAll = !!debugs.find((d) => d === '--debug-all');
Globals.debugTrees = !!debugs.find((d) => d === '--debug-trees');
Globals.debugScopes = !!debugs.find((d) => d === '--debug-scopes');

const file = readFileSync(join(import.meta.dirname, fileName));
parseInput(String(file));
