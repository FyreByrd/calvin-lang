import { afterAll, beforeAll, describe, test } from 'vitest';
import { Globals } from '../globals.js';
import { CalvinParser } from '../parser.js';
import { CalvinPrinter } from '../printer.js';
import { testParsing } from './test-parsing.js';

beforeAll(() => {
  Globals.debugAll = true;
  Globals.debugTrees = true;
  Globals.debugScopes = true;

  console.debug('Debugging activated!');
});

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
});

afterAll(() => {
  Globals.debugAll = false;
  Globals.debugTrees = false;
  Globals.debugScopes = false;

  console.debug('Debugging deactivated!');
});
