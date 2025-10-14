import { expect, test } from 'vitest';
import { CalvinLexer } from '../lexer.js';
import { CalvinParser } from '../parser.js';

test('Comment parsing', () => {
  const parser = new CalvinParser();

  const lexingResult = CalvinLexer.tokenize('// line comment');
  parser.input = lexingResult.tokens;
  const output = parser.file();

  console.debug({ lexingResult, output });

  expect(parser.errors).to.have.length(0, 'Parser should not error');

  expect(output).to.have.length(0, 'No output should be generated');
});
