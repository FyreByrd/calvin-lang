import * as TestSubject from '@encode/parser/lib';
import { assert, assertEquals, assertGreater } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';

Deno.test('Control flow parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.CalvinParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.CalvinPrinter();

  const typeAnalyzer = new TestSubject.CalvinTypeAnalyzer();

  await t.step('simple if statement', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: ['let a = 0;', 'if (a > 1) {', '', '}', ''].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 0, 'TypeAnalyzer should not report any errors');
  });

  await t.step('incorrect variable access', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
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
        '}',
      ].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(typeOutput.warnings, 1, 'TypeAnalyzer should report a warning');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('simple do-while loop', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: ['do {}', 'while (a < 3); // maybe the ; should be replaced by an empty body???'].join(
        '\n',
      ),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 1, 'TypeAnalyzer should report an error');
  });

  await t.step('incorrect variable access in while-finally block', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: [
        'while (b > 4) {',
        '    let c = 1;',
        '    if (a) {',
        '        continue;',
        '    }',
        '} finally {',
        '    return 1 + 2 + c;',
        '}',
      ].join('\n'),

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 3, 'TypeAnalyzer should report 3 errors');
  });

  await t.step('simple do-while loop', () => {
    const { parserOutput, typeOutput } = performParsingTestCase({
      code: 'do {} while(true) {}',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    assert(parserOutput.statement);
    assertGreater(parserOutput.statement.length, 0, 'Statements should be generated');

    assertEquals(typeOutput.warnings, 0, 'TypeAnalyzer should not report any warnings');
    assertEquals(typeOutput.errors, 0, 'TypeAnalyzer should not report any errors');
  });
});
