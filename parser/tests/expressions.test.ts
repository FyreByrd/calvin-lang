import { afterAll, beforeAll, describe, test } from 'vitest';
import { Globals } from '../globals.js';
import { CalvinParser } from '../parser.js';
import { PrecedenceHandler } from '../visitors/precedence.js';
import { CalvinPrinter } from '../visitors/printer.js';
import { CalvinTypeAnalyzer } from '../visitors/semantics.js';
import { testParsing } from './test-parsing.js';

describe('Expression Parsing/Reordering', () => {
  const parser = new CalvinParser();

  const precHandler = new PrecedenceHandler();

  const printer = new CalvinPrinter();

  const typeAnalyzer = new CalvinTypeAnalyzer();

  test('simple expression', ({ expect }) => {
    const { parserOutput, precOutput } = testParsing({
      code: 'let a = 1 * 2 + 3;',
      parser,
      precHandler,
      printer,
      typeAnalyzer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.have.length.above(0, 'Statements should be generated');

    expect(precOutput).to.equal(1, 'Expression should be reorderd');
  });
});

beforeAll((t) => {
  Globals.debugAll = true;
  Globals.debugTrees = true;
  Globals.debugScopes = true;

  console.debug(`Debugging set for test file ${t.name}! Settings:`, { Globals });
});

afterAll((t) => {
  Globals.debugAll = false;
  Globals.debugTrees = false;
  Globals.debugScopes = false;

  console.debug(`Debugging reset for test file ${t.name}!`);
});
