import * as TestSubject from '@encode/parser/lib';
import { v } from '@encode/parser/lib';
import { assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';
import type { StatementCstNode } from '../../generated/cst-types.ts';

Deno.test('Data type parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.ParenPrinter();

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('real number literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let real = 1.0;',

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['real', v.none, [['constant', ['REAL', '1.0']]]],
    ]);
  });

  await t.step('integer literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let integer = 21;',

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['integer', v.none, [['constant', ['INT', '21']]]],
    ]);
  });

  await t.step('string literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: "let str = 'Hello, World!';",

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['str', v.none, [['constant', ['STRING', "'Hello, World!'"]]]],
    ]);
  });

  await t.step('boolean literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let flag = true;',

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['flag', v.none, [['constant', ['BOOL', 'true']]]],
    ]);
  });

  await t.step('bit literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let bits = 0xff;',

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['bits', v.none, [['constant', ['BIN', '0xff']]]],
    ]);
  });

  await t.step('complex number literal', () => {
    const { parserOutput } = performParsingTestCase({
      code: 'let imag = 1.0 + 2.0i;',

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      [
        'imag',
        v.none,
        [['constant', ['REAL', '1.0']], v.none, '+', [['constant', ['CMPX', '2.0i']]]],
      ],
    ]);
  });
});
