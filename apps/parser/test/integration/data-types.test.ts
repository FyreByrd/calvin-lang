import * as TestSubject from '@encode/parser/lib';
import { assert, assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Data type parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.CalvinPrinter();

  const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

  await t.step('real number literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let real = 1.0;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });

  await t.step('integer literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let integer = 21;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });

  await t.step('string literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: "let str = 'Hello, World!';",

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });

  await t.step('boolean literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let flag = true;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });

  await t.step('bit literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let bits = 0xff;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });

  await t.step('complex number literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let imag = 1.0 + 2.0i;',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement, 'Some output should be generated');
  });
});
