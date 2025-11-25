import * as TestSubject from '@encode/parser/lib';
import { v } from '@encode/parser/lib';
import { assertEquals } from '@std/assert';
import { performParsingTestCase, useGlobalSettings } from '@/test/utils/mod.ts';
import type { FileCstNode, StatementCstNode } from '../../generated/cst-types.ts';

Deno.test('Comment parsing #integration', async (t) => {
  using _globalSettings = useGlobalSettings({ debugTrees: true });

  const parser = new TestSubject.EncodeParser();

  const precedenceHandler = new TestSubject.PrecedenceHandler();

  const printer = new TestSubject.JSONPrinter(false, null, 0);

  const typeAnalyzer = new TestSubject.TypeAnalyzer();

  await t.step('line comment', () => {
    const { parserOutput } = performParsingTestCase({
      code: '// line comment',

      parser,
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    // TODO use dependent types so cast is unnecessary
    v.file(parserOutput as FileCstNode, v.none);
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

    v.file(parserOutput as FileCstNode, v.none);
  });

  await t.step('comments embedded in a string', () => {
    const { parserOutput } = performParsingTestCase({
      code: "let str = '/*****/  //'; // comments embedded in a string",

      parser,
      startAt: 'statement',
      precedenceHandler,
      printer,
      typeAnalyzer,
    });

    assertEquals(parser.errors.length, 0, 'Parser should not error');

    v.statement(parserOutput as StatementCstNode, [
      'declaration',
      ['str', v.none, [['constant', ['STRING', "'/*****/  //'"]]]],
    ]);
  });
});
