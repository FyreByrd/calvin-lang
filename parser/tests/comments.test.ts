import { afterAll, beforeAll, describe, test } from 'vitest';
import { Globals } from '../globals.js';
import { CalvinParser } from '../parser.js';
import { CalvinPrinter } from '../visitors/printer.js';
import { CalvinTypeAnalyzer } from '../visitors/semantics.js';
import { testParsing } from './test-parsing.js';

describe('Comment parsing', () => {
  const parser = new CalvinParser();

  const printer = new CalvinPrinter();

  const typeAnalyzer = new CalvinTypeAnalyzer();

  test('line comment', ({ expect }) => {
    const testCaseOutputs = testParsing({
      code: '// line comment',
      parser,
      printer,
      typeAnalyzer
    });
    const { parserOutput } = testCaseOutputs;

    console.debug(testCaseOutputs);

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.equal(undefined, 'No output should be generated');
  });

  test('collapsed multiline comment', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: '/**/ // collapsed multiline comment',
      parser,
      printer,
      typeAnalyzer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.equal(undefined, 'No output should be generated');
  });

  test('longer multiline comment', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: [
        '/*****************',
        'let a = 1; // should not be parsed',
        '',
        '*  *',
        '* longer multiline comment',
        '',
        '*/'
      ].join('\n'),
      parser,
      printer,
      typeAnalyzer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.equal(undefined, 'No output should be generated');
  });

  test('comments embedded in a string', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: "let str = '/*****/  //'; // comments embedded in a string",
      parser,
      printer,
      typeAnalyzer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput.statement).to.have.length(1, 'One statement should be generated');
  });
});

beforeAll((t) => {
  Globals.debugAll = false;
  Globals.debugTrees = false;
  Globals.debugScopes = false;

  console.debug(`Debugging set for test file ${t.name}! Settings:`, { Globals });
});

afterAll((t) => {
  Globals.debugAll = false;
  Globals.debugTrees = false;
  Globals.debugScopes = false;

  console.debug(`Debugging reset for test file ${t.name}!`);
});
