import * as TestSubject from '@calvin-lang/parser/lib';
import { assert, assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Comment parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.CalvinParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.CalvinPrinter();

  const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

  await t.step('line comment', () => {
    const { parserOutput } = performParsingTestCase({
      code: '// line comment',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(!parserOutput.statement, 'No output should be generated');
  });

  await t.step('collapsed multiline comment', () => {
    const { parserOutput } = performParsingTestCase({
      code: [
        '/**/ // collapsed multiline comment',
        '/*****************',
        '',
        'let a = 1; // should not be parsed',
        '',
        '*  *',
        '* longer multiline comment',
        '',
        '*/',
      ].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(!parserOutput.statement, 'No output should be generated');
  });

  await t.step('comments embedded in a string', () => {
    const { parserOutput } = performParsingTestCase({
      code: "let str = '/*****/  //'; // comments embedded in a string",

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(!!parserOutput.statement);
    assertEquals(parserOutput.statement.length, 1, 'One statement should be generated');
  });
});
