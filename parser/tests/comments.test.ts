import { afterAll, beforeAll, describe, test } from 'vitest';
import { Globals } from '../globals.js';
import { CalvinParser } from '../parser.js';
import { CalvinPrinter } from '../printer.js';
import { testParsing } from './test-parsing.js';

describe('Comment parsing', () => {
  const parser = new CalvinParser();

  const printer = new CalvinPrinter();

  test('line comment', ({ expect }) => {
    const testCaseOutputs = testParsing({
      code: '// line comment',
      parser,
      printer
    });
    const { parserOutput } = testCaseOutputs;

    console.debug(testCaseOutputs);

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput).to.have.length(0, 'No output should be generated');
  });

  test('collapsed multiline comment', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: '/**/ // collapsed multiline comment',
      parser,
      printer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput).to.have.length(0, 'No output should be generated');
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
      printer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput).to.have.length(0, 'No output should be generated');
  });

  test('comments embedded in a string', ({ expect }) => {
    const { parserOutput } = testParsing({
      code: "let str = '/*****/  //'; // comments embedded in a string",
      parser,
      printer
    });

    expect(parser.errors).to.have.length(0, 'Parser should not error');

    expect(parserOutput).to.have.length(1, 'One statement should be generated');
  });
});

beforeAll(() => {
  Globals.debugAll = true;
  Globals.debugTrees = true;
  Globals.debugScopes = true;

  console.debug('Debugging activated!');
});

afterAll(() => {
  Globals.debugAll = false;
  Globals.debugTrees = false;
  Globals.debugScopes = false;

  console.debug('Debugging deactivated!');
});
