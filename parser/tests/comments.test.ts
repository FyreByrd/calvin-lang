import { describe, test } from 'vitest';
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
});
