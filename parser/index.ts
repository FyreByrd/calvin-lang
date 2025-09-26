import { readFileSync } from 'fs';
import { join } from 'path';
import { CalvinLexer, CalvinParser } from './parser.js';

const parser = new CalvinParser();

function parseInput(text: string) {
  const lexingResult = CalvinLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;
  const output = parser.file();

  if (parser.errors.length > 0) {
    for (const err of parser.errors) {
      console.log(err);
    }
    throw Error();
  }

  console.log(JSON.stringify(output, null, 4));
}

const file = readFileSync(join(import.meta.dirname, './tests/test.txt'));
parseInput(String(file));
