import * as TestSubject from '@calvin-lang/parser/lib';
import { assert, assertEquals, assertGreater } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Expression parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.CalvinParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.CalvinPrinter();

  const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

  await t.step('simple expression', () => {
    const { parserOutput, precOutput } = performParsingTestCase({
      code: 'let a = 1 * 2 + 3;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assert(parser.errors.length === 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(precOutput, 1, 'Expression should be reordered');
  });
});
