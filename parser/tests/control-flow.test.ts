import { afterAll, beforeAll, describe, test } from 'vitest';
import { Globals } from '../globals.js';
import { CalvinParser } from '../parser.js';
import { PrecedenceHandler } from '../visitors/precedence.js';
import { CalvinPrinter } from '../visitors/printer.js';
import { CalvinTypeAnalyzer } from '../visitors/semantics.js';
import { testParsing } from './test-parsing.js';

describe('Control flow parsing', () => {
  const parser = new CalvinParser();

  const precHandler = new PrecedenceHandler();

  const printer = new CalvinPrinter();

  const typeAnalyzer = new CalvinTypeAnalyzer();

  test('simple if statement', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: ['let a = 0;', 'if (a > 1) {', '', '}', ''].join('\n'),
      parser,
      precHandler,
      printer,
      typeAnalyzer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.have.length.above(0, 'Statements should be generated');
  });

  test('incorrect variable access', ({ expect }) => {
    const { parserOutput, typeOutput } = testParsing({
      code: [
        'let a = 0;',
        'if (1) {',
        '    let b = 20; // should not be accessible to else block',
        '}',
        'elif (let b = 10) {',
        '    a = b;',
        '    let a = 25; // should warn',
        '}',
        'else {',
        '    b = 2; // should error',
        '}'
      ].join('\n'),
      parser,
      precHandler,
      printer,
      typeAnalyzer
    });

    expect(typeOutput.errors).to.equal(1, 'TypeAnalyzer should report an error');
    expect(typeOutput.warnings).to.equal(1, 'TypeAnalyzer should report a warning');

    expect(parserOutput); // Discard parserOutput for now
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
